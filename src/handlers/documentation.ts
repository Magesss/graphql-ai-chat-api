/**
 * API 文档处理模块
 * 
 * 生成和处理 API 文档页面，包括：
 * - 完整的 API 文档展示
 * - 交互式查询测试界面
 * - Schema 信息和使用示例
 * - 开发者指南和最佳实践
 * 
 * @author AI Chat API
 * @version 1.0
 * @since 2025-08-09
 */

import { createHtmlResponse } from '../utils';
import { getSchemaInfo } from '../graphql/schema';

/**
 * 处理 API 文档请求
 * 
 * 生成包含完整 API 文档的 HTML 页面
 * 
 * @returns HTML 响应包含 API 文档
 */
export function handleDocumentation(): Response {
  const schemaInfo = getSchemaInfo();
  
  const documentation = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 GraphQL AI Chat API - 完整文档</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/autoloader/prism-autoloader.min.js"></script>
    <style>
        :root {
            --primary-color: #3182ce;
            --secondary-color: #ed8936;
            --success-color: #38a169;
            --warning-color: #d69e2e;
            --danger-color: #e53e3e;
            --bg-color: #f7fafc;
            --card-bg: #ffffff;
            --text-color: #2d3748;
            --border-color: #e2e8f0;
            --code-bg: #f1f5f9;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background: var(--bg-color);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 40px 0;
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .nav-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background: #2c5aa0;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: var(--card-bg);
            color: var(--primary-color);
            border: 2px solid var(--primary-color);
        }
        
        .btn-secondary:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .section {
            background: var(--card-bg);
            margin: 30px 0;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            border: 1px solid var(--border-color);
        }
        
        .section h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section h3 {
            color: var(--text-color);
            margin: 25px 0 15px 0;
            font-size: 1.3rem;
        }
        
        .endpoint {
            background: var(--bg-color);
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
        }
        
        .method {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.9rem;
            text-transform: uppercase;
            margin-right: 10px;
        }
        
        .method.post { background: var(--success-color); color: white; }
        .method.get { background: var(--primary-color); color: white; }
        .method.options { background: var(--warning-color); color: white; }
        
        .query-example {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin: 15px 0;
            overflow: hidden;
        }
        
        .query-title {
            background: var(--bg-color);
            padding: 15px 20px;
            font-weight: 600;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .query-content {
            padding: 0;
        }
        
        pre {
            margin: 0 !important;
            border-radius: 0 !important;
            background: var(--code-bg) !important;
        }
        
        .test-section {
            background: linear-gradient(135deg, #e6fffa, #f0fff4);
            border: 2px solid var(--success-color);
        }
        
        .test-section h3 {
            color: var(--success-color);
        }
        
        .form-group {
            margin: 15px 0;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text-color);
        }
        
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }
        
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        .response-area {
            margin-top: 20px;
            padding: 20px;
            background: var(--card-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            min-height: 100px;
        }
        
        .loading {
            color: var(--primary-color);
            font-style: italic;
        }
        
        .error {
            background: #fed7d7;
            color: #c53030;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #feb2b2;
        }
        
        .success {
            background: #f0fff4;
            color: #22543d;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #9ae6b4;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .stat-card {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid var(--border-color);
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .stat-label {
            color: #718096;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        .footer {
            margin-top: 60px;
            padding: 40px 0;
            text-align: center;
            color: #718096;
            border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .nav-buttons { flex-direction: column; align-items: center; }
            .section { padding: 20px; margin: 20px 0; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🚀 GraphQL AI Chat API</h1>
            <p>基于 Cloudflare Workers + GraphQL + DeepSeek 的智能对话接口</p>
            
            <div class="nav-buttons">
                <a href="/graphql" class="btn btn-primary">
                    🎮 GraphQL Playground
                </a>
                <a href="#quick-start" class="btn btn-secondary">
                    🚀 快速开始
                </a>
                <a href="#examples" class="btn btn-secondary">
                    📝 代码示例
                </a>
            </div>
        </div>
    </div>

    <div class="container">
        <!-- API 信息统计 -->
        <div class="section">
            <h2>📊 API 状态信息</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${schemaInfo.version}</div>
                    <div class="stat-label">API 版本</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">✅</div>
                    <div class="stat-label">服务状态</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">3</div>
                    <div class="stat-label">主要端点</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">5+</div>
                    <div class="stat-label">GraphQL 操作</div>
                </div>
            </div>
        </div>

        <!-- API 端点 -->
        <div class="section">
            <h2>🌐 API 端点</h2>
            
            <div class="endpoint">
                <h3><span class="method post">POST</span> /graphql</h3>
                <p><strong>GraphQL 主要端点</strong> - 执行所有的查询和变更操作</p>
                <p>用于发送 GraphQL 查询和变更请求，支持聊天会话管理和 AI 对话功能。</p>
            </div>
            
            <div class="endpoint">
                <h3><span class="method get">GET</span> /graphql</h3>
                <p><strong>GraphQL Playground</strong> - 交互式查询开发界面</p>
                <p>提供可视化的 GraphQL 查询编辑器，支持语法高亮、自动补全和文档查看。</p>
            </div>
            
            <div class="endpoint">
                <h3><span class="method get">GET</span> /</h3>
                <p><strong>API 文档</strong> - 完整的 API 使用文档</p>
                <p>当前页面，包含详细的 API 说明、示例代码和最佳实践指南。</p>
            </div>
            
            <div class="endpoint">
                <h3><span class="method options">OPTIONS</span> *</h3>
                <p><strong>CORS 预检</strong> - 跨域请求支持</p>
                <p>自动处理浏览器的 CORS 预检请求，支持跨域访问。</p>
            </div>
        </div>

        <!-- GraphQL Schema -->
        <div class="section">
            <h2>📋 GraphQL Schema</h2>
            <p>完整的 GraphQL 类型定义，包含所有可用的查询、变更和类型。</p>
            
            <div class="query-example">
                <div class="query-title">🏗️ 完整 Schema 定义</div>
                <div class="query-content">
                    <pre><code class="language-graphql">type ChatMessage {
  id: ID!
  role: String!
  content: String!
  timestamp: String!
}

type ChatSession {
  id: ID!
  messages: [ChatMessage!]!
  createdAt: String!
  updatedAt: String!
}

type ChatResponse {
  success: Boolean!
  message: ChatMessage
  session: ChatSession
  error: String
}

type Query {
  getChatSession(id: ID!): ChatSession
  hello: String
  apiInfo: String
}

type Mutation {
  sendMessage(sessionId: ID, message: String!): ChatResponse!
  createChatSession: ChatSession!
  clearChatSession(sessionId: ID!): ChatSession
  deleteChatSession(sessionId: ID!): Boolean
}</code></pre>
                </div>
            </div>
        </div>

        <!-- 快速开始 -->
        <div class="section" id="quick-start">
            <h2>🚀 快速开始</h2>
            
            <h3>1. 测试连接</h3>
            <div class="query-example">
                <div class="query-title">📡 连接测试</div>
                <div class="query-content">
                    <pre><code class="language-graphql">query {
  hello
}</code></pre>
                </div>
            </div>
            
            <h3>2. 创建会话</h3>
            <div class="query-example">
                <div class="query-title">🆕 新建会话</div>
                <div class="query-content">
                    <pre><code class="language-graphql">mutation {
  createChatSession {
    id
    createdAt
    messages {
      id
    }
  }
}</code></pre>
                </div>
            </div>
            
            <h3>3. 发送消息</h3>
            <div class="query-example">
                <div class="query-title">💬 AI 对话</div>
                <div class="query-content">
                    <pre><code class="language-graphql">mutation {
  sendMessage(message: "你好，请介绍一下自己") {
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
}</code></pre>
                </div>
            </div>
        </div>

        <!-- 代码示例 -->
        <div class="section" id="examples">
            <h2>💻 代码示例</h2>
            
            <h3>JavaScript / Fetch API</h3>
            <div class="query-example">
                <div class="query-title">🌐 原生 JavaScript</div>
                <div class="query-content">
                    <pre><code class="language-javascript">async function sendMessageToAI(message) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: \`
        mutation SendMessage($message: String!) {
          sendMessage(message: $message) {
            success
            message {
              content
            }
            session {
              id
            }
            error
          }
        }
      \`,
      variables: { message }
    })
  });
  
  const data = await response.json();
  return data.data.sendMessage;
}</code></pre>
                </div>
            </div>
            
            <h3>React + Apollo Client</h3>
            <div class="query-example">
                <div class="query-title">⚛️ React 组件</div>
                <div class="query-content">
                    <pre><code class="language-javascript">import { gql, useMutation } from '@apollo/client';

const SEND_MESSAGE = gql\`
  mutation SendMessage($message: String!, $sessionId: ID) {
    sendMessage(message: $message, sessionId: $sessionId) {
      success
      message {
        id
        content
        timestamp
      }
      session {
        id
      }
      error
    }
  }
\`;

function ChatComponent() {
  const [sendMessage, { loading, error }] = useMutation(SEND_MESSAGE);
  
  const handleSend = async (message) => {
    try {
      const { data } = await sendMessage({
        variables: { message }
      });
      
      if (data.sendMessage.success) {
        console.log('AI回复:', data.sendMessage.message.content);
      } else {
        console.error('错误:', data.sendMessage.error);
      }
    } catch (err) {
      console.error('请求失败:', err);
    }
  };
  
  return (
    <div>
      {loading && <p>正在发送...</p>}
      {error && <p>错误: {error.message}</p>}
      {/* 聊天界面 */}
    </div>
  );
}</code></pre>
                </div>
            </div>
            
            <h3>cURL 命令</h3>
            <div class="query-example">
                <div class="query-title">🖥️ 命令行测试</div>
                <div class="query-content">
                    <pre><code class="language-bash"># 测试连接
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"query": "query { hello }"}' \\
  https://your-worker.workers.dev/graphql

# 发送消息
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "mutation { sendMessage(message: \\"你好\\") { success message { content } } }"
  }' \\
  https://your-worker.workers.dev/graphql</code></pre>
                </div>
            </div>
        </div>

        <!-- 在线测试 -->
        <div class="section test-section">
            <h2>🧪 在线测试工具</h2>
            <p>直接在浏览器中测试 GraphQL 查询，无需额外工具。</p>
            
            <div class="form-group">
                <label for="querySelect">选择查询模板:</label>
                <select id="querySelect" onchange="loadQuery()">
                    <option value="">选择预设查询...</option>
                    <option value="hello">👋 Hello 查询</option>
                    <option value="apiInfo">📊 API 信息</option>
                    <option value="createSession">🆕 创建会话</option>
                    <option value="sendMessage">💬 发送消息</option>
                    <option value="getSession">📖 获取会话</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="graphqlQuery">GraphQL 查询:</label>
                <textarea id="graphqlQuery" rows="12" placeholder="在这里输入您的 GraphQL 查询..."></textarea>
            </div>
            
            <button onclick="executeQuery()" class="btn btn-primary">
                ▶️ 执行查询
            </button>
            
            <div id="response" class="response-area"></div>
        </div>
    </div>

    <div class="footer">
        <div class="container">
            <p>🚀 Powered by <strong>Cloudflare Workers</strong> + <strong>GraphQL</strong> + <strong>DeepSeek AI</strong></p>
            <p>版本 ${schemaInfo.version} | 构建时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
    </div>

    <script>
        // 预设查询模板
        const queries = {
            hello: \`query {
  hello
}\`,
            apiInfo: \`query {
  apiInfo
}\`,
            createSession: \`mutation {
  createChatSession {
    id
    createdAt
    messages {
      id
    }
  }
}\`,
            sendMessage: \`mutation {
  sendMessage(message: "你好，请介绍一下自己") {
    success
    error
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
  }
}\`,
            getSession: \`query {
  getChatSession(id: "your-session-id-here") {
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
}\`
        };

        function loadQuery() {
            const select = document.getElementById('querySelect');
            const textarea = document.getElementById('graphqlQuery');
            if (select.value && queries[select.value]) {
                textarea.value = queries[select.value];
            }
        }

        async function executeQuery() {
            const query = document.getElementById('graphqlQuery').value;
            const responseDiv = document.getElementById('response');
            
            if (!query.trim()) {
                responseDiv.innerHTML = '<div class="error">❌ 请输入 GraphQL 查询</div>';
                return;
            }

            responseDiv.innerHTML = '<div class="loading">⏳ 正在执行查询...</div>';

            try {
                const startTime = Date.now();
                const response = await fetch('/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                const data = await response.json();
                const endTime = Date.now();
                const duration = endTime - startTime;

                if (data.errors) {
                    responseDiv.innerHTML = \`
                        <div class="error">
                            <h4>❌ 查询错误 (响应时间: \${duration}ms)</h4>
                            <pre>\${JSON.stringify(data.errors, null, 2)}</pre>
                        </div>
                    \`;
                } else {
                    responseDiv.innerHTML = \`
                        <div class="success">
                            <h4>✅ 查询成功 (响应时间: \${duration}ms)</h4>
                            <pre><code class="language-json">\${JSON.stringify(data, null, 2)}</code></pre>
                        </div>
                    \`;
                    // 重新高亮代码
                    Prism.highlightAll();
                }
            } catch (error) {
                responseDiv.innerHTML = \`
                    <div class="error">
                        <h4>🚫 网络错误</h4>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📚 GraphQL AI Chat API 文档已加载');
            console.log('🎯 使用 Playground: /graphql');
            console.log('📖 查看文档: /');
        });
    </script>
</body>
</html>
  `;

  return createHtmlResponse(documentation);
}
