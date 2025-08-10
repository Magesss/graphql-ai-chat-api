/**
 * GraphQL Schema 定义模块
 * 
 * 定义完整的 GraphQL Schema，包括：
 * - 类型定义（Types）
 * - 查询（Queries）
 * - 变更（Mutations）
 * - 自定义标量类型
 * 
 * @author AI Chat API
 * @version 1.0
 * @since 2025-08-09
 */

/**
 * GraphQL Type Definitions (SDL - Schema Definition Language)
 * 
 * 使用 GraphQL SDL 语法定义完整的 API Schema
 */
export const typeDefs = `
  """
  聊天消息类型
  表示对话中的单个消息，包含发送者信息和内容
  """
  type ChatMessage {
    "消息唯一标识符"
    id: ID!
    
    "消息发送者角色：user（用户）、assistant（AI助手）或 system（系统）"
    role: String!
    
    "消息内容文本"
    content: String!
    
    "消息创建时间戳（ISO 8601 格式）"
    timestamp: String!
  }

  """
  聊天会话类型
  表示一个完整的对话会话，包含所有消息历史
  """
  type ChatSession {
    "会话唯一标识符"
    id: ID!
    
    "会话中的所有消息列表"
    messages: [ChatMessage!]!
    
    "会话创建时间（ISO 8601 格式）"
    createdAt: String!
    
    "会话最后更新时间（ISO 8601 格式）"
    updatedAt: String!
  }

  """
  聊天响应类型
  表示发送消息后的操作结果
  """
  type ChatResponse {
    "操作是否成功"
    success: Boolean!
    
    "AI 回复的消息（仅在成功时返回）"
    message: ChatMessage
    
    "更新后的完整会话信息（仅在成功时返回）"
    session: ChatSession
    
    "错误信息（仅在失败时返回）"
    error: String
  }

  """
  查询操作
  用于读取数据而不改变服务器状态
  """
  type Query {
    """
    获取指定 ID 的聊天会话
    
    Args:
      id: 会话的唯一标识符
      
    Returns:
      ChatSession: 完整的会话信息，如果会话不存在则返回 null
    """
    getChatSession(id: ID!): ChatSession
    
    """
    简单的问候查询
    用于测试 API 连通性和健康状态
    
    Returns:
      String: 问候消息
    """
    hello: String
    
    """
    获取 API 信息
    返回 API 版本、功能等元数据信息
    
    Returns:
      String: API 信息的 JSON 字符串
    """
    apiInfo: String
  }

  """
  变更操作
  用于修改服务器数据状态
  """
  type Mutation {
    """
    发送消息给 AI 并获取回复
    
    如果未提供 sessionId，将自动创建新的会话。
    AI 会根据会话中的消息历史提供上下文相关的回复。
    
    Args:
      sessionId: 可选的会话 ID，用于继续现有对话
      message: 要发送给 AI 的消息内容
      
    Returns:
      ChatResponse: 包含 AI 回复和会话信息的响应对象
    """
    sendMessage(
      sessionId: ID
      message: String!
    ): ChatResponse!
    
    """
    创建新的聊天会话
    
    创建一个空的新会话，用户可以在此会话中与 AI 对话。
    每个会话都有独立的对话上下文。
    
    Returns:
      ChatSession: 新创建的会话信息
    """
    createChatSession: ChatSession!
    
    """
    清空指定会话的消息历史
    
    保留会话 ID 但清除所有消息，相当于重新开始对话。
    
    Args:
      sessionId: 要清空的会话 ID
      
    Returns:
      ChatSession: 清空后的会话信息
    """
    clearChatSession(sessionId: ID!): ChatSession
    
    """
    删除指定的聊天会话
    
    完全删除会话及其所有消息历史，操作不可逆。
    
    Args:
      sessionId: 要删除的会话 ID
      
    Returns:
      Boolean: 删除是否成功
    """
    deleteChatSession(sessionId: ID!): Boolean
  }

  """
  订阅操作（预留接口）
  用于实时数据推送，如打字指示器、消息状态等
  """
  type Subscription {
    """
    订阅消息更新
    实时接收指定会话中的新消息
    
    Args:
      sessionId: 要订阅的会话 ID
      
    Returns:
      ChatMessage: 新的消息对象
    """
    messageAdded(sessionId: ID!): ChatMessage
    
    """
    订阅打字状态
    实时接收 AI 的打字状态指示器
    
    Args:
      sessionId: 要订阅的会话 ID
      
    Returns:
      Boolean: AI 是否正在打字
    """
    typingStatus(sessionId: ID!): Boolean
  }
`;

/**
 * Schema 版本信息
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * Schema 元数据
 */
export const SCHEMA_METADATA = {
  version: SCHEMA_VERSION,
  description: 'GraphQL AI Chat API Schema',
  author: 'AI Chat API',
  features: [
    'Chat session management',
    'AI message processing',
    'Real-time subscriptions (planned)',
    'Message history',
    'Multi-session support'
  ],
  endpoints: {
    graphql: '/graphql',
    playground: '/graphql (GET)',
    documentation: '/'
  }
};

/**
 * 获取 Schema 信息
 * 
 * @returns Schema 元数据信息
 */
export function getSchemaInfo() {
  return {
    ...SCHEMA_METADATA,
    timestamp: new Date().toISOString()
  };
}
