/**
 * DeepSeek AI 服务模块
 * 
 * 封装与 DeepSeek API 的交互逻辑，包括：
 * - API 请求处理
 * - 消息格式转换
 * - 错误处理和重试
 * - 响应数据解析
 * 
 * @author AI Chat API
 * @version 1.0
 * @since 2025-08-09
 */

import { ChatMessage, DeepSeekResponse } from '../types';

/**
 * DeepSeek API 配置
 */
const DEEPSEEK_CONFIG = {
  /** API 端点 URL */
  API_URL: 'https://api.deepseek.com/v1/chat/completions',
  
  /** API 密钥 */
  API_KEY: 'sk-e0fd08e0e3b1487cbb7df8ff771308ae',
  
  /** 默认模型 */
  MODEL: 'deepseek-chat',
  
  /** 最大生成令牌数 */
  MAX_TOKENS: 2000,
  
  /** 生成温度（创造性程度） */
  TEMPERATURE: 0.7,
  
  /** 请求超时时间（毫秒） */
  TIMEOUT: 30000,
} as const;

/**
 * DeepSeek API 服务类
 * 
 * 提供与 DeepSeek AI 服务交互的所有功能
 */
export class DeepSeekService {
  /**
   * 调用 DeepSeek API 获取 AI 回复
   * 
   * 将聊天消息发送给 DeepSeek API，并返回 AI 的回复内容。
   * 会自动添加系统提示词来优化 AI 的响应质量。
   * 
   * @param messages 聊天消息历史
   * @returns Promise<string> AI 回复内容
   * @throws Error 当 API 调用失败时抛出错误
   */
  static async getChatCompletion(messages: ChatMessage[]): Promise<ReadableStream<string>> {
    try {
      // 构建发送给 API 的消息格式
      const apiMessages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Please provide accurate and helpful responses in Chinese.'
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      // 构建请求体
      const requestBody = {
        model: DEEPSEEK_CONFIG.MODEL,
        messages: apiMessages,
        max_tokens: DEEPSEEK_CONFIG.MAX_TOKENS,
        temperature: DEEPSEEK_CONFIG.TEMPERATURE,
        stream: true // 启用流式响应
      };

      console.log('发送 DeepSeek API 流式请求:', {
        messageCount: apiMessages.length,
        model: DEEPSEEK_CONFIG.MODEL
      });

      // 发送 API 请求
      const response = await fetch(DEEPSEEK_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_CONFIG.API_KEY}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(requestBody)
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API 错误:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        throw new Error(`DeepSeek API 错误: ${response.status} ${errorText}`);
      }

      // 确保响应是流式的
      if (!response.body) {
        throw new Error('DeepSeek API 没有返回流式响应');
      }

      // 创建 TransformStream 来处理 SSE 数据
      const decoder = new TextDecoderStream();
      const reader = response.body.pipeThrough(decoder).getReader();
      
      return new ReadableStream({
        async start(controller) {
          try {
            let buffer = '';
            let isFirstChunk = true;
            let hasError = false;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += value;
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.close();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(data);
                    
                    // 检查错误
                    if (parsed.error) {
                      hasError = true;
                      const errorMessage = JSON.stringify({
                        type: 'error',
                        error: parsed.error.message || '未知错误'
                      });
                      controller.enqueue(errorMessage);
                      controller.close();
                      return;
                    }

                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      // 第一个数据块，发送开始标记
                      if (isFirstChunk) {
                        controller.enqueue(JSON.stringify({
                          type: 'start',
                          timestamp: new Date().toISOString()
                        }));
                        isFirstChunk = false;
                      }
                      
                      // 发送内容
                      controller.enqueue(JSON.stringify({
                        type: 'content',
                        content: content
                      }));
                    }
                  } catch (e) {
                    console.warn('解析 SSE 数据失败:', e);
                    controller.enqueue(JSON.stringify({
                      type: 'error',
                      error: '数据解析错误'
                    }));
                  }
                }
              }
            }

            // 如果没有错误，发送结束标记
            if (!hasError) {
              controller.enqueue(JSON.stringify({
                type: 'end',
                timestamp: new Date().toISOString()
              }));
            }
          } catch (error) {
            console.error('流式处理错误:', error);
            controller.enqueue(JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : '未知错误'
            }));
          } finally {
            reader.releaseLock();
            controller.close();
          }
        },
        cancel() {
          reader.releaseLock();
        }
      });

    } catch (error) {
      console.error('DeepSeek API 调用失败:', error);
      
      // 重新抛出错误，保持错误信息
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('调用 DeepSeek API 时发生未知错误');
    }
  }

  /**
   * 验证 API 配置
   * 
   * 检查 DeepSeek API 的配置是否有效
   * 
   * @returns boolean 配置是否有效
   */
  static validateConfig(): boolean {
    if (!DEEPSEEK_CONFIG.API_KEY || DEEPSEEK_CONFIG.API_KEY.trim() === '') {
      console.error('DeepSeek API 密钥未配置');
      return false;
    }

    if (!DEEPSEEK_CONFIG.API_URL || !DEEPSEEK_CONFIG.API_URL.startsWith('https://')) {
      console.error('DeepSeek API URL 配置无效');
      return false;
    }

    return true;
  }

  /**
   * 获取 API 配置信息（不包含敏感数据）
   * 
   * @returns 脱敏的配置信息
   */
  static getConfigInfo() {
    return {
      model: DEEPSEEK_CONFIG.MODEL,
      maxTokens: DEEPSEEK_CONFIG.MAX_TOKENS,
      temperature: DEEPSEEK_CONFIG.TEMPERATURE,
      timeout: DEEPSEEK_CONFIG.TIMEOUT,
      hasApiKey: !!DEEPSEEK_CONFIG.API_KEY,
      apiKeyPreview: DEEPSEEK_CONFIG.API_KEY ? 
        DEEPSEEK_CONFIG.API_KEY.substring(0, 10) + '...' : 'Not configured'
    };
  }
}

/**
 * 便捷函数：直接调用 AI 服务
 * 
 * @param messages 聊天消息历史
 * @returns Promise<string> AI 回复内容
 */
export async function callDeepSeekAPI(messages: ChatMessage[]): Promise<string> {
  return DeepSeekService.getChatCompletion(messages);
}
