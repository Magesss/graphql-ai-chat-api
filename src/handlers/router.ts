/**
 * 路由处理模块
 * 
 * 负责处理所有 HTTP 请求的路由分发，包括：
 * - 请求方法和路径匹配
 * - CORS 处理
 * - 错误统一处理
 * - 请求日志记录
 * 
 * @author AI Chat API
 * @version 1.0
 * @since 2025-08-09
 */

import { handleGraphQLRequest, handleGraphQLPlayground } from './graphql';
import { handleDocumentation } from './documentation';
import { createCorsHeaders, createJsonResponse, createErrorResponse } from '../utils';

/**
 * 路由配置接口
 */
interface RouteConfig {
  /** 路径 */
  path: string;
  /** HTTP 方法 */
  method: string;
  /** 处理函数 */
  handler: (request: Request) => Promise<Response> | Response;
  /** 路由描述 */
  description?: string;
}

/**
 * 路由表配置
 */
const routes: RouteConfig[] = [
  {
    path: '/graphql',
    method: 'POST',
    handler: handleGraphQLRequest,
    description: 'GraphQL API endpoint for queries and mutations'
  },
  {
    path: '/graphql',
    method: 'GET',
    handler: () => handleGraphQLPlayground(),
    description: 'GraphQL Playground interactive interface'
  },
  {
    path: '/',
    method: 'GET',
    handler: () => handleDocumentation(),
    description: 'API documentation and examples'
  }
];

/**
 * 主路由处理器
 * 
 * 分析请求并路由到相应的处理器
 * 
 * @param request HTTP 请求对象
 * @returns HTTP 响应
 */
export async function handleRequest(request: Request): Promise<Response> {
  const corsHeaders = createCorsHeaders();
  const url = new URL(request.url);
  const { pathname: path, searchParams } = url;
  const method = request.method.toUpperCase();

  // 记录请求日志
  logRequest(request, path, method);

  try {
    // 处理 CORS 预检请求
    if (method === 'OPTIONS') {
      return handleCorsPreflightRequest(corsHeaders);
    }

    // 查找匹配的路由
    const route = findMatchingRoute(path, method);
    
    if (!route) {
      return handleNotFound(path, method, corsHeaders);
    }

    // 执行路由处理器
    console.log(`🎯 执行路由: ${method} ${path}`);
    const response = await route.handler(request);
    
    // 确保响应包含 CORS 头
    return addCorsHeaders(response, corsHeaders);

  } catch (error) {
    console.error('路由处理错误:', error);
    return handleServerError(error, corsHeaders);
  }
}

/**
 * 查找匹配的路由
 * 
 * @param path 请求路径
 * @param method 请求方法
 * @returns 匹配的路由配置或 null
 */
function findMatchingRoute(path: string, method: string): RouteConfig | null {
  return routes.find(route => 
    route.path === path && route.method === method
  ) || null;
}

/**
 * 处理 CORS 预检请求
 * 
 * @param corsHeaders CORS 头部
 * @returns CORS 响应
 */
function handleCorsPreflightRequest(corsHeaders: Record<string, string>): Response {
  console.log('✅ 处理 CORS 预检请求');
  
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400', // 24小时缓存
    }
  });
}

/**
 * 处理 404 错误
 * 
 * @param path 请求路径
 * @param method 请求方法
 * @param corsHeaders CORS 头部
 * @returns 404 响应
 */
function handleNotFound(
  path: string, 
  method: string, 
  corsHeaders: Record<string, string>
): Response {
  console.warn(`❌ 路由未找到: ${method} ${path}`);
  
  const errorResponse = {
    error: 'Not Found',
    message: `Route '${method} ${path}' not found`,
    availableRoutes: routes.map(route => ({
      method: route.method,
      path: route.path,
      description: route.description
    })),
    suggestion: 'Check the API documentation at / for available endpoints'
  };

  return createJsonResponse(errorResponse, 404);
}

/**
 * 处理服务器错误
 * 
 * @param error 错误对象
 * @param corsHeaders CORS 头部
 * @returns 500 响应
 */
function handleServerError(
  error: unknown, 
  corsHeaders: Record<string, string>
): Response {
  const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
  
  console.error(`💥 服务器错误: ${errorMessage}`);
  
  return createErrorResponse(errorMessage, 500);
}

/**
 * 为响应添加 CORS 头部
 * 
 * @param response 原始响应
 * @param corsHeaders CORS 头部
 * @returns 包含 CORS 头部的响应
 */
function addCorsHeaders(
  response: Response, 
  corsHeaders: Record<string, string>
): Response {
  // 如果响应已经包含 CORS 头，则不重复添加
  if (response.headers.get('Access-Control-Allow-Origin')) {
    return response;
  }

  // 创建新的响应，添加 CORS 头部
  const newHeaders = new Headers(response.headers);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

/**
 * 记录请求日志
 * 
 * @param request 请求对象
 * @param path 请求路径
 * @param method 请求方法
 */
function logRequest(request: Request, path: string, method: string): void {
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('User-Agent') || 'Unknown';
  const referer = request.headers.get('Referer') || '-';
  
  console.log(`📥 [${timestamp}] ${method} ${path}`);
  console.log(`   User-Agent: ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}`);
  
  if (referer !== '-') {
    console.log(`   Referer: ${referer}`);
  }
}

/**
 * 获取路由统计信息
 * 
 * @returns 路由统计数据
 */
export function getRouteStats() {
  return {
    totalRoutes: routes.length,
    routes: routes.map(route => ({
      method: route.method,
      path: route.path,
      description: route.description || 'No description'
    })),
    supportedMethods: [...new Set(routes.map(route => route.method))],
    corsEnabled: true,
    features: [
      'CORS support',
      'Request logging',
      'Error handling',
      'Route validation'
    ]
  };
}

/**
 * 健康检查处理器
 * 
 * @returns 健康检查响应
 */
export function handleHealthCheck(): Response {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    routes: getRouteStats(),
    uptime: Date.now()
  };

  return createJsonResponse(health);
}

/**
 * 添加新路由
 * 
 * @param route 路由配置
 */
export function addRoute(route: RouteConfig): void {
  // 检查是否已存在相同的路由
  const exists = routes.some(r => r.path === route.path && r.method === route.method);
  
  if (exists) {
    console.warn(`⚠️ 路由已存在: ${route.method} ${route.path}`);
    return;
  }

  routes.push(route);
  console.log(`✅ 添加新路由: ${route.method} ${route.path}`);
}
