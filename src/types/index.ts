/**
 * 类型定义模块
 * 
 * 集中管理所有的 TypeScript 接口和类型定义，
 * 提供类型安全的数据结构定义。
 * 
 * @author AI Chat API
 * @version 1.0
 * @since 2025-08-09
 */

/**
 * 聊天消息接口
 * 定义单个聊天消息的数据结构
 */
export interface ChatMessage {
  /** 消息唯一标识符 */
  id: string;
  /** 消息发送者角色：用户、AI助手或系统 */
  role: 'user' | 'assistant' | 'system';
  /** 消息内容 */
  content: string;
  /** 消息创建时间戳 */
  timestamp: string;
}

/**
 * 聊天会话接口
 * 定义完整聊天会话的数据结构
 */
export interface ChatSession {
  /** 会话唯一标识符 */
  id: string;
  /** 会话中的所有消息 */
  messages: ChatMessage[];
  /** 会话创建时间 */
  createdAt: string;
  /** 会话最后更新时间 */
  updatedAt: string;
}

/**
 * DeepSeek API 响应接口
 * 定义 DeepSeek AI 服务的响应格式
 */
export interface DeepSeekResponse {
  /** AI 回复选择列表 */
  choices: Array<{
    /** 消息内容 */
    message?: {
      /** 回复内容 */
      content: string;
      /** 回复角色 */
      role: string;
    };
    /** 流式响应中的增量内容 */
    delta?: {
      /** 增量内容 */
      content?: string;
      /** 角色（可选） */
      role?: string;
    };
    /** 结束原因 */
    finish_reason?: string;
  }>;
  /** 是否为流式响应的结束标记 */
  done?: boolean;
}

/**
 * GraphQL 请求接口
 * 定义 GraphQL 请求的标准格式
 */
export interface GraphQLRequest {
  /** GraphQL 查询字符串 */
  query: string;
  /** 查询变量（可选） */
  variables?: Record<string, any>;
  /** 操作名称（可选） */
  operationName?: string;
}

/**
 * 聊天响应接口
 * 定义聊天操作的响应格式
 */
export interface ChatResponse {
  /** 操作是否成功 */
  success: boolean;
  /** AI 回复的消息（如果成功） */
  message: ChatMessage | null;
  /** 更新后的会话信息（如果成功） */
  session: ChatSession | null;
  /** 错误信息（如果失败） */
  error: string | null;
  /** 流式响应的数据流（如果是流式响应） */
  stream?: ReadableStream<string>;
}

/**
 * 流式聊天响应接口
 * 定义流式聊天操作的响应格式
 */
export interface StreamChatResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 流式响应的数据流 */
  stream: ReadableStream<string>;
  /** 会话信息 */
  session: ChatSession;
  /** 错误信息（如果失败） */
  error?: string;
}

/**
 * GraphQL 响应接口
 * 定义标准的 GraphQL 响应格式
 */
export interface GraphQLResponse<T = any> {
  /** 响应数据 */
  data?: T;
  /** 错误信息数组 */
  errors?: Array<{ message: string }>;
}

/**
 * CORS 头部接口
 * 定义跨域请求的响应头
 */
export interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
}
