/**
 * 工具函数模块
 * 
 * 提供通用的辅助函数，包括 ID 生成、
 * 变量提取等实用工具。
 * 
 * @author AI Chat API
 * @version 1.0
 * @since 2025-08-09
 */

/**
 * 生成唯一标识符
 * 
 * 创建一个基于时间戳和随机数的唯一 ID，
 * 格式为: id_[随机字符串][时间戳]
 * 
 * @returns 唯一标识符字符串
 */
export function generateId(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * 从 GraphQL 查询中提取变量值
 * 
 * 使用正则表达式从查询字符串中提取指定变量的值。
 * 注意：这是一个简化的实现，实际应用中应使用专业的 GraphQL 解析器。
 * 
 * @param query GraphQL 查询字符串
 * @param variableName 要提取的变量名
 * @returns 变量值或 null（如果未找到）
 */
export function extractVariableFromQuery(query: string, variableName: string): string | null {
  // 匹配格式: variableName: "value"
  const regex = new RegExp(`${variableName}:\\s*"([^"]*)"`, 'i');
  const match = query.match(regex);
  return match ? match[1] : null;
}

/**
 * 创建 CORS 响应头
 * 
 * 生成允许跨域请求的标准响应头，
 * 支持所有来源、常用 HTTP 方法和标准头部。
 * 
 * @returns CORS 响应头对象
 */
export function createCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * 创建 JSON 响应
 * 
 * 便捷函数，用于创建带有正确头部的 JSON 响应
 * 
 * @param data 要序列化的数据
 * @param status HTTP 状态码（默认 200）
 * @param additionalHeaders 额外的响应头（可选）
 * @returns Response 对象
 */
export function createJsonResponse(
  data: any, 
  status: number = 200, 
  additionalHeaders: Record<string, string> = {}
): Response {
  const corsHeaders = createCorsHeaders();
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
  });
}

/**
 * 创建 HTML 响应
 * 
 * 便捷函数，用于创建带有正确头部的 HTML 响应
 * 
 * @param html HTML 内容字符串
 * @param status HTTP 状态码（默认 200）
 * @param additionalHeaders 额外的响应头（可选）
 * @returns Response 对象
 */
export function createHtmlResponse(
  html: string, 
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  const corsHeaders = createCorsHeaders();
  
  return new Response(html, {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html',
      ...additionalHeaders
    }
  });
}

/**
 * 创建错误响应
 * 
 * 便捷函数，用于创建标准化的错误响应
 * 
 * @param message 错误消息
 * @param status HTTP 状态码（默认 500）
 * @returns Response 对象
 */
export function createErrorResponse(message: string, status: number = 500): Response {
  return createJsonResponse({
    error: 'Server Error',
    message: message
  }, status);
}

/**
 * 安全的 JSON 解析
 * 
 * 安全地解析 JSON 字符串，如果解析失败则返回 null
 * 
 * @param jsonString 要解析的 JSON 字符串
 * @returns 解析后的对象或 null
 */
export function safeJsonParse<T = any>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}
