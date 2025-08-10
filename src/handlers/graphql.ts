/**
 * GraphQL 请求处理模块
 * 
 * 专门处理 GraphQL 相关的 HTTP 请求，包括：
 * - POST /graphql - GraphQL 查询和变更请求
 * - GET /graphql - GraphQL Playground 界面
 * - 请求验证和错误处理
 * 
 * @author AI Chat API
 * @version 1.0
 * @since 2025-08-09
 */

import { GraphQLRequest } from '../types';
import { executeGraphQL } from '../graphql/resolvers';
import { createJsonResponse, createHtmlResponse, createErrorResponse } from '../utils';

/**
 * 处理 GraphQL POST 请求
 * 
 * 解析 GraphQL 查询并执行相应的解析器逻辑
 * 
 * @param request HTTP 请求对象
 * @returns GraphQL 响应
 */
export async function handleGraphQLRequest(request: Request): Promise<Response> {
  try {
    // 解析请求体
    const body = await request.json() as GraphQLRequest;
    
    // 验证请求格式
    if (!body.query || typeof body.query !== 'string') {
      return createJsonResponse({
        errors: [{ message: 'GraphQL query is required and must be a string' }]
      }, 400);
    }

    // 验证查询不为空
    if (body.query.trim().length === 0) {
      return createJsonResponse({
        errors: [{ message: 'GraphQL query cannot be empty' }]
      }, 400);
    }

    console.log('处理 GraphQL 请求:', {
      hasQuery: !!body.query,
      hasVariables: !!body.variables,
      hasOperationName: !!body.operationName,
      queryPreview: body.query.substring(0, 100) + (body.query.length > 100 ? '...' : '')
    });

    // 执行 GraphQL 查询
    const result = await executeGraphQL(body.query, body.variables || {});

    // 检查是否是流式响应
    if (result.data?.sendMessage?.stream instanceof ReadableStream) {
      const stream = result.data.sendMessage.stream;
      const session = result.data.sendMessage.session;

      // 返回流式响应
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Session-Id': session.id
        }
      });
    }

    // 记录查询结果
    if (result.errors) {
      console.warn('GraphQL 查询包含错误:', result.errors);
    } else {
      console.log('GraphQL 查询执行成功');
    }

    return createJsonResponse(result);

  } catch (error) {
    console.error('GraphQL 请求处理错误:', error);
    
    // 区分不同类型的错误
    if (error instanceof SyntaxError) {
      return createJsonResponse({
        errors: [{ 
          message: 'Invalid JSON in request body',
          details: error.message
        }]
      }, 400);
    }
    
    return createJsonResponse({
      errors: [{
        message: error instanceof Error ? error.message : 'Failed to process GraphQL request'
      }]
    }, 500);
  }
}

/**
 * 处理 GraphQL Playground 请求
 * 
 * 返回交互式的 GraphQL 查询界面
 * 
 * @returns HTML 响应包含 GraphQL Playground
 */
export function handleGraphQLPlayground(): Response {
  const playground = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>🚀 GraphQL AI Chat Playground</title>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
    <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
    <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
    <style>
        body { 
            margin: 0; 
            overflow: hidden; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #root { height: 100vh; }
        
        /* 自定义加载动画 */
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f7fafc;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3182ce;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">
            <div>
                <div class="loading-spinner"></div>
                <p style="margin-top: 16px; color: #4a5568;">Loading GraphQL Playground...</p>
            </div>
        </div>
    </div>
    <script>
        window.addEventListener('load', function (event) {
            GraphQLPlayground.init(document.getElementById('root'), {
                endpoint: '/graphql',
                settings: {
                    'general.betaUpdates': false,
                    'editor.theme': 'light',
                    'editor.reuseHeaders': true,
                    'tracing.hideTracingResponse': true,
                    'editor.fontSize': 14,
                    'editor.fontFamily': '"Source Code Pro", "Consolas", "Inconsolata", "Droid Sans Mono", "Monaco", monospace',
                    'request.credentials': 'omit',
                },
                tabs: [
                    {
                        endpoint: '/graphql',
                        name: '🎯 快速开始',
                        query: \`# 🚀 欢迎使用 GraphQL AI Chat API!
# 这里是一些常用的查询和变更操作示例

# 🔍 查询 1: 测试 API 连接
query TestConnection {
  hello
}

# 📊 查询 2: 获取 API 信息
query GetApiInfo {
  apiInfo
}

# 💭 变更 1: 创建新的聊天会话
mutation CreateSession {
  createChatSession {
    id
    createdAt
    messages {
      id
      content
    }
  }
}

# 🤖 变更 2: 发送消息给 AI（自动创建会话）
mutation SendMessage {
  sendMessage(message: "你好，请介绍一下自己") {
    success
    error
    message {
      id
      role
      content
      timestamp
    }
    session {
      id
      messages {
        role
        content
        timestamp
      }
    }
  }
}

# 📋 查询 3: 获取现有会话（需要替换会话ID）
# query GetSession {
#   getChatSession(id: "your-session-id-here") {
#     id
#     createdAt
#     updatedAt
#     messages {
#       id
#       role
#       content
#       timestamp
#     }
#   }
# }\`,
                    },
                    {
                        endpoint: '/graphql',
                        name: '🔄 持续对话',
                        query: \`# 💬 持续对话示例
# 使用会话ID进行多轮对话，保持上下文

# 第一步：创建会话或使用现有会话ID
mutation ContinueChat {
  sendMessage(
    sessionId: "你的会话ID"
    message: "能告诉我更多关于你的能力吗？"
  ) {
    success
    message {
      id
      content
      timestamp
    }
    session {
      id
      messages {
        role
        content
      }
    }
    error
  }
}

# 💡 提示：
# 1. 首次对话可以不提供 sessionId，系统会自动创建
# 2. 后续对话使用返回的 session.id 来保持上下文
# 3. 每个会话都有独立的对话历史\`,
                    },
                    {
                        endpoint: '/graphql',
                        name: '🛠️ 会话管理',
                        query: \`# 🗂️ 会话管理操作
# 管理聊天会话的生命周期

# 🆕 创建新会话
mutation CreateNewSession {
  createChatSession {
    id
    createdAt
    updatedAt
    messages {
      id
    }
  }
}

# 🧹 清空会话消息（保留会话ID）
mutation ClearSession {
  clearChatSession(sessionId: "your-session-id") {
    id
    messages {
      id
    }
    updatedAt
  }
}

# 🗑️ 完全删除会话
mutation DeleteSession {
  deleteChatSession(sessionId: "your-session-id")
}

# 📖 获取会话详情
query GetSessionDetails {
  getChatSession(id: "your-session-id") {
    id
    createdAt
    updatedAt
    messages {
      id
      role
      content
      timestamp
    }
  }
}\`,
                    }
                ],
            })
        })
    </script>
</body>
</html>
  `;

  return createHtmlResponse(playground);
}

/**
 * 验证 GraphQL 查询格式
 * 
 * @param query GraphQL 查询字符串
 * @returns 验证结果
 */
export function validateGraphQLQuery(query: string): { valid: boolean; error?: string } {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query must be a non-empty string' };
  }

  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }

  // 基本的 GraphQL 查询格式检查
  const hasValidKeyword = /^\s*(query|mutation|subscription|\{)/i.test(trimmedQuery);
  
  if (!hasValidKeyword) {
    return { valid: false, error: 'Query must start with query, mutation, subscription, or {' };
  }

  return { valid: true };
}

/**
 * 记录 GraphQL 操作统计信息
 * 
 * @param operation 操作类型
 * @param success 是否成功
 */
export function logGraphQLOperation(operation: string, success: boolean) {
  const timestamp = new Date().toISOString();
  console.log(`GraphQL ${success ? '✅' : '❌'} [${timestamp}] ${operation}`);
}
