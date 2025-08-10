/**
 * GraphQL 解析器模块
 * 
 * 实现 GraphQL Schema 中定义的所有查询和变更操作的解析逻辑。
 * 包括会话管理、消息处理、AI 服务调用等核心功能。
 * 
 * @author AI Chat API
 * @version 1.0
 * @since 2025-08-09
 */

import { ChatMessage, ChatSession, GraphQLRequest } from '../types';
import { callDeepSeekAPI } from '../services/deepseek';
import { generateId, extractVariableFromQuery } from '../utils';
import { getSchemaInfo } from './schema';

/**
 * 内存中的会话存储
 * 
 * 注意：在生产环境中，应该使用持久化存储（如 Cloudflare KV 或 D1）
 * 来替代这个内存存储，以确保数据的持久性和跨实例共享。
 */
const chatSessions = new Map<string, ChatSession>();

/**
 * GraphQL 解析器执行器
 * 
 * 简化的 GraphQL 查询解析和执行器。
 * 在实际生产环境中，建议使用专业的 GraphQL 库如 graphql-js。
 * 
 * @param query GraphQL 查询字符串
 * @param variables 查询变量
 * @returns GraphQL 响应对象
 */
export async function executeGraphQL(query: string, variables: Record<string, any>): Promise<any> {
  const queryStr = query.trim();

  try {
    // Query: hello - 简单的健康检查
    if (queryStr.includes('hello')) {
      return {
        data: {
          hello: "Hello from GraphQL AI Chat API! 🚀"
        }
      };
    }

    // Query: apiInfo - API 信息查询
    if (queryStr.includes('apiInfo')) {
      const apiInfo = {
        ...getSchemaInfo(),
        sessionsCount: chatSessions.size,
        uptime: Date.now(),
        status: 'healthy'
      };
      
      return {
        data: {
          apiInfo: JSON.stringify(apiInfo, null, 2)
        }
      };
    }

    // Query: getChatSession - 获取会话信息
    if (queryStr.includes('getChatSession')) {
      const sessionId = variables.id || extractVariableFromQuery(query, 'id');
      
      if (!sessionId) {
        return {
          errors: [{ message: 'Session ID is required for getChatSession query' }]
        };
      }
      
      const session = chatSessions.get(sessionId);
      
      return {
        data: {
          getChatSession: session || null
        }
      };
    }

    // Mutation: createChatSession - 创建新会话
    if (queryStr.includes('createChatSession')) {
      const sessionId = generateId();
      const session: ChatSession = {
        id: sessionId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      chatSessions.set(sessionId, session);
      
      console.log(`创建新会话: ${sessionId}`);
      
      return {
        data: {
          createChatSession: session
        }
      };
    }

    // Mutation: clearChatSession - 清空会话消息
    if (queryStr.includes('clearChatSession')) {
      const sessionId = variables.sessionId || extractVariableFromQuery(query, 'sessionId');
      
      if (!sessionId) {
        return {
          errors: [{ message: 'Session ID is required for clearChatSession mutation' }]
        };
      }
      
      const session = chatSessions.get(sessionId);
      if (!session) {
        return {
          errors: [{ message: `Session ${sessionId} not found` }]
        };
      }
      
      // 清空消息但保留会话
      session.messages = [];
      session.updatedAt = new Date().toISOString();
      
      console.log(`清空会话消息: ${sessionId}`);
      
      return {
        data: {
          clearChatSession: session
        }
      };
    }

    // Mutation: deleteChatSession - 删除会话
    if (queryStr.includes('deleteChatSession')) {
      const sessionId = variables.sessionId || extractVariableFromQuery(query, 'sessionId');
      
      if (!sessionId) {
        return {
          errors: [{ message: 'Session ID is required for deleteChatSession mutation' }]
        };
      }
      
      const deleted = chatSessions.delete(sessionId);
      
      console.log(`删除会话: ${sessionId}, 成功: ${deleted}`);
      
      return {
        data: {
          deleteChatSession: deleted
        }
      };
    }

    // Mutation: sendMessage - 发送消息给 AI
    if (queryStr.includes('sendMessage')) {
      return await handleSendMessage(query, variables);
    }

    // 未知操作
    return {
      errors: [{ message: 'Unknown GraphQL operation. Please check your query syntax.' }]
    };

  } catch (error) {
    console.error('GraphQL 解析器错误:', error);
    
    return {
      errors: [{
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }]
    };
  }
}

/**
 * 处理发送消息的变更操作
 * 
 * @param query GraphQL 查询字符串
 * @param variables 查询变量
 * @returns GraphQL 响应对象
 */
async function handleSendMessage(query: string, variables: Record<string, any>): Promise<any> {
  const sessionId = variables.sessionId || extractVariableFromQuery(query, 'sessionId');
  const message = variables.message || extractVariableFromQuery(query, 'message');
  const useStream = variables.stream || extractVariableFromQuery(query, 'stream') || true;

  // 验证消息内容
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      errors: [{ message: 'Message content is required and cannot be empty' }]
    };
  }

  // 获取或创建会话
  let session = sessionId ? chatSessions.get(sessionId) : null;
  if (!session) {
    const newSessionId = generateId();
    session = {
      id: newSessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    chatSessions.set(newSessionId, session);
    
    console.log(`自动创建新会话: ${newSessionId}`);
  }

  // 创建用户消息
  const userMessage: ChatMessage = {
    id: generateId(),
    role: 'user',
    content: message.trim(),
    timestamp: new Date().toISOString()
  };

  // 添加用户消息到会话
  session.messages.push(userMessage);
  
  console.log(`用户消息已添加到会话 ${session.id}:`, {
    messageId: userMessage.id,
    content: userMessage.content.substring(0, 100) + (userMessage.content.length > 100 ? '...' : '')
  });

  try {
    // 调用 AI 服务获取回复
    console.log(`正在调用 AI 服务，会话: ${session.id}`);
    const stream = await callDeepSeekAPI(session.messages);

    // 创建 AI 回复消息（初始为空）
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    // 添加 AI 回复到会话
    session.messages.push(assistantMessage);
    session.updatedAt = new Date().toISOString();

    // 创建一个新的 TransformStream 来收集完整的响应
    const { readable, writable } = new TransformStream<string, string>();
    const writer = writable.getWriter();
    let fullContent = '';

    // 处理流式响应
    (async () => {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          fullContent += value;
          assistantMessage.content = fullContent;
          await writer.write(value);
        }
      } catch (error) {
        console.error('流式响应处理错误:', error);
        writer.abort(error);
      } finally {
        writer.close();
        reader.releaseLock();
      }
    })();

    // 返回流式响应
    return {
      data: {
        sendMessage: {
          success: true,
          stream: readable,
          session: session,
          error: null
        }
      }
    };

  } catch (error) {
    console.error(`AI 服务调用失败，会话: ${session.id}`, error);
    
    // 更新会话时间戳，即使 AI 调用失败
    session.updatedAt = new Date().toISOString();
    
    // 返回失败响应，但保留用户消息
    return {
      data: {
        sendMessage: {
          success: false,
          message: null,
          session: session,
          error: error instanceof Error ? error.message : 'AI service temporarily unavailable'
        }
      }
    };
  }
}

/**
 * 获取所有会话的统计信息（用于调试和监控）
 * 
 * @returns 会话统计信息
 */
export function getSessionStats() {
  const sessions = Array.from(chatSessions.values());
  
  return {
    totalSessions: sessions.length,
    totalMessages: sessions.reduce((sum, session) => sum + session.messages.length, 0),
    activeSessions: sessions.filter(session => {
      const lastUpdate = new Date(session.updatedAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return lastUpdate > oneHourAgo;
    }).length,
    oldestSession: sessions.length > 0 ? 
      sessions.reduce((oldest, session) => 
        new Date(session.createdAt) < new Date(oldest.createdAt) ? session : oldest
      ).createdAt : null,
    newestSession: sessions.length > 0 ? 
      sessions.reduce((newest, session) => 
        new Date(session.createdAt) > new Date(newest.createdAt) ? session : newest
      ).createdAt : null
  };
}

/**
 * 清理过期会话（可选的维护功能）
 * 
 * @param maxAgeHours 会话最大存活时间（小时）
 * @returns 清理的会话数量
 */
export function cleanupExpiredSessions(maxAgeHours: number = 24): number {
  const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  let cleanedCount = 0;
  
  for (const [sessionId, session] of chatSessions.entries()) {
    if (new Date(session.updatedAt) < cutoffTime) {
      chatSessions.delete(sessionId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`清理了 ${cleanedCount} 个过期会话`);
  }
  
  return cleanedCount;
}
