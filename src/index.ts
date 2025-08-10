/**
 * AI Chat API 主入口文件
 * 
 * 这是 Cloudflare Workers 的主入口文件，现在采用模块化架构：
 * - 路由处理已分离到专门的模块
 * - GraphQL 逻辑模块化管理
 * - AI 服务独立封装
 * - 工具函数统一管理
 * 
 * 主要端点:
 * - POST /graphql - GraphQL 查询和变更端点
 * - GET /graphql - GraphQL Playground 交互界面
 * - GET / - 完整的 API 文档和示例
 * 
 * @author AI Chat API
 * @version 1.0 (Refactored)
 * @since 2025-08-09
 */

import { handleRequest } from './handlers/router';

/**
 * Cloudflare Workers 导出处理器
 * 
 * 符合 Cloudflare Workers 标准的模块导出格式。
 * 所有请求都通过统一的路由处理器进行分发。
 */
export default {
  /**
   * 处理所有传入的 HTTP 请求
   * 
   * @param request HTTP 请求对象
   * @param env 环境变量和绑定
   * @param ctx 执行上下文
   * @returns HTTP 响应
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    console.log('🚀 AI Chat API 启动 - 模块化版本');
    
    try {
      // 使用统一的路由处理器
      return await handleRequest(request);
      
    } catch (error) {
      // 全局错误处理兜底
      console.error('💥 全局错误处理:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        version: '1.0'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
  },
} satisfies ExportedHandler<Env>;
