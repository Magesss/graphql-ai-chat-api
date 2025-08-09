/**
 * AI Chat API using GraphQL and DeepSeek
 * 
 * Endpoints:
 * - POST /graphql - GraphQL endpoint
 * - GET / - GraphQL Playground and documentation
 */

interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: string;
}

interface ChatSession {
	id: string;
	messages: ChatMessage[];
	createdAt: string;
	updatedAt: string;
}

interface DeepSeekResponse {
	choices: Array<{
		message: {
			content: string;
			role: string;
		};
	}>;
}

interface GraphQLRequest {
	query: string;
	variables?: Record<string, any>;
	operationName?: string;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// 设置 CORS 头
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// 处理 OPTIONS 请求（预检请求）
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);

		try {
			// 路由处理
			if (url.pathname === '/graphql' && request.method === 'POST') {
				return await handleGraphQLRequest(request, corsHeaders);
			} else if (url.pathname === '/graphql' && request.method === 'GET') {
				return handleGraphiQLPlayground(corsHeaders);
			} else if (url.pathname === '/' && request.method === 'GET') {
				return handleDocumentation(corsHeaders);
			} else {
				return new Response('Not Found', { 
					status: 404, 
					headers: corsHeaders 
				});
			}
		} catch (error) {
			console.error('Error:', error);
			return new Response(JSON.stringify({ 
				error: 'Internal Server Error',
				message: error instanceof Error ? error.message : 'Unknown error'
			}), {
				status: 500,
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json'
				}
			});
		}
	},
} satisfies ExportedHandler<Env>;

// GraphQL Schema and Resolvers
const typeDefs = `
  type ChatMessage {
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

  type Query {
    getChatSession(id: ID!): ChatSession
    hello: String
  }

  type Mutation {
    sendMessage(sessionId: ID, message: String!): ChatResponse!
    createChatSession: ChatSession!
  }

  type ChatResponse {
    success: Boolean!
    message: ChatMessage
    session: ChatSession
    error: String
  }
`;

// 简单的内存存储（实际应用中应使用 KV 或 D1）
const chatSessions = new Map<string, ChatSession>();

async function handleGraphQLRequest(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
	try {
		const body = await request.json() as GraphQLRequest;
		
		if (!body.query) {
			return new Response(JSON.stringify({ 
				errors: [{ message: 'Query is required' }]
			}), {
				status: 400,
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json'
				}
			});
		}

		// 简单的 GraphQL 解析器
		const result = await executeGraphQL(body.query, body.variables || {});

		return new Response(JSON.stringify(result), {
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json'
			}
		});

	} catch (error) {
		console.error('GraphQL request error:', error);
		return new Response(JSON.stringify({ 
			errors: [{ 
				message: error instanceof Error ? error.message : 'Failed to process GraphQL request'
			}]
		}), {
			status: 400,
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json'
			}
		});
	}
}

async function executeGraphQL(query: string, variables: Record<string, any>): Promise<any> {
	// 简单的 GraphQL 查询解析和执行
	const queryStr = query.trim();

	// Query: hello
	if (queryStr.includes('hello')) {
		return {
			data: {
				hello: "Hello from GraphQL AI Chat API!"
			}
		};
	}

	// Query: getChatSession
	if (queryStr.includes('getChatSession')) {
		const sessionId = variables.id || extractVariableFromQuery(query, 'id');
		const session = chatSessions.get(sessionId);
		
		return {
			data: {
				getChatSession: session || null
			}
		};
	}

	// Mutation: createChatSession
	if (queryStr.includes('createChatSession')) {
		const sessionId = generateId();
		const session: ChatSession = {
			id: sessionId,
			messages: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		
		chatSessions.set(sessionId, session);
		
		return {
			data: {
				createChatSession: session
			}
		};
	}

	// Mutation: sendMessage
	if (queryStr.includes('sendMessage')) {
		const sessionId = variables.sessionId || extractVariableFromQuery(query, 'sessionId');
		const message = variables.message || extractVariableFromQuery(query, 'message');

		if (!message) {
			return {
				errors: [{ message: 'Message is required' }]
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
		}

		// 创建用户消息
		const userMessage: ChatMessage = {
			id: generateId(),
			role: 'user',
			content: message,
			timestamp: new Date().toISOString()
		};

		session.messages.push(userMessage);

		try {
			// 调用 DeepSeek API
			const aiResponse = await callDeepSeekAPI(session.messages);
			
			// 创建 AI 回复消息
			const assistantMessage: ChatMessage = {
				id: generateId(),
				role: 'assistant',
				content: aiResponse,
				timestamp: new Date().toISOString()
			};

			session.messages.push(assistantMessage);
			session.updatedAt = new Date().toISOString();

			return {
				data: {
					sendMessage: {
						success: true,
						message: assistantMessage,
						session: session,
						error: null
					}
				}
			};

		} catch (error) {
			return {
				data: {
					sendMessage: {
						success: false,
						message: null,
						session: session,
						error: error instanceof Error ? error.message : 'AI service error'
					}
				}
			};
		}
	}

	// 未知查询
	return {
		errors: [{ message: 'Unknown GraphQL operation' }]
	};
}

async function callDeepSeekAPI(messages: ChatMessage[]): Promise<string> {
	const apiMessages = [
		{
			role: 'system',
			content: 'You are a helpful AI assistant. Please provide accurate and helpful responses.'
		},
		...messages.map(msg => ({
			role: msg.role,
			content: msg.content
		}))
	];

	const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer sk-e0fd08e0e3b1487cbb7df8ff771308ae'
		},
		body: JSON.stringify({
			model: 'deepseek-chat',
			messages: apiMessages,
			max_tokens: 2000,
			temperature: 0.7,
			stream: false
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('DeepSeek API Error:', errorText);
		throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
	}

	const data = await response.json() as DeepSeekResponse;
	return data.choices?.[0]?.message?.content || 'No response from AI';
}

function generateId(): string {
	return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function extractVariableFromQuery(query: string, variableName: string): string | null {
	// 简单的变量提取（实际应用中应使用真正的 GraphQL 解析器）
	const regex = new RegExp(`${variableName}:\\s*"([^"]*)"`, 'i');
	const match = query.match(regex);
	return match ? match[1] : null;
}

function handleDocumentation(corsHeaders: Record<string, string>): Response {
	const documentation = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GraphQL AI Chat API</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .method { background: #007bff; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
        .method.post { background: #28a745; }
        .method.get { background: #17a2b8; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 14px; }
        .test-section { background: #e9ecef; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .playground-link { background: #6f42c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        .schema-section { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .query-example { background: white; border: 1px solid #ddd; border-radius: 4px; margin: 10px 0; }
        .query-title { background: #f8f9fa; padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd; }
        .query-content { padding: 15px; }
    </style>
</head>
<body>
    <h1>🚀 GraphQL AI Chat API</h1>
    <p>基于 GraphQL 和 DeepSeek 的 AI 对话接口</p>

    <div style="text-align: center; margin: 20px 0;">
        <a href="/graphql" class="playground-link">🎮 打开 GraphQL Playground</a>
    </div>

    <h2>API 端点</h2>

    <div class="endpoint">
        <h3><span class="method post">POST</span> /graphql</h3>
        <p>GraphQL 端点 - 发送 GraphQL 查询和变更</p>
    </div>

    <div class="endpoint">
        <h3><span class="method get">GET</span> /graphql</h3>
        <p>GraphQL Playground - 交互式查询界面</p>
    </div>

    <div class="schema-section">
        <h2>📋 GraphQL Schema</h2>
        <pre>type ChatMessage {
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

type Query {
  getChatSession(id: ID!): ChatSession
  hello: String
}

type Mutation {
  sendMessage(sessionId: ID, message: String!): ChatResponse!
  createChatSession: ChatSession!
}

type ChatResponse {
  success: Boolean!
  message: ChatMessage
  session: ChatSession
  error: String
}</pre>
    </div>

    <h2>🔍 GraphQL 查询示例</h2>

    <div class="query-example">
        <div class="query-title">1. 简单问候查询</div>
        <div class="query-content">
            <pre>query {
  hello
}</pre>
        </div>
    </div>

    <div class="query-example">
        <div class="query-title">2. 创建聊天会话</div>
        <div class="query-content">
            <pre>mutation {
  createChatSession {
    id
    createdAt
    messages {
      id
      content
    }
  }
}</pre>
        </div>
    </div>

    <div class="query-example">
        <div class="query-title">3. 发送消息给 AI</div>
        <div class="query-content">
            <pre>mutation {
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
        timestamp
      }
    }
  }
}</pre>
        </div>
    </div>

    <div class="query-example">
        <div class="query-title">4. 继续对话（使用会话ID）</div>
        <div class="query-content">
            <pre>mutation {
  sendMessage(
    sessionId: "your-session-id"
    message: "能告诉我更多关于你的能力吗？"
  ) {
    success
    message {
      content
    }
    session {
      messages {
        role
        content
      }
    }
  }
}</pre>
        </div>
    </div>

    <div class="query-example">
        <div class="query-title">5. 获取聊天会话</div>
        <div class="query-content">
            <pre>query {
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
}</pre>
        </div>
    </div>

    <div class="test-section">
        <h3>🧪 在线测试</h3>
        <p>选择一个查询模板:</p>
        <select id="querySelect" onchange="loadQuery()">
            <option value="">选择查询...</option>
            <option value="hello">Hello 查询</option>
            <option value="createSession">创建会话</option>
            <option value="sendMessage">发送消息</option>
        </select>
        <div>
            <label for="graphqlQuery">GraphQL 查询:</label><br>
            <textarea id="graphqlQuery" rows="8" style="width: 100%; margin: 10px 0; font-family: monospace;" placeholder="输入您的 GraphQL 查询..."></textarea><br>
            <button onclick="executeQuery()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">执行查询</button>
        </div>
        <div id="response" style="margin-top: 20px;"></div>
    </div>

    <script>
        const queries = {
            hello: \`query {
  hello
}\`,
            createSession: \`mutation {
  createChatSession {
    id
    createdAt
    messages {
      id
      content
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
                alert('请输入 GraphQL 查询');
                return;
            }

            responseDiv.innerHTML = '<p>正在执行查询...</p>';

            try {
                const response = await fetch('/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                const data = await response.json();

                responseDiv.innerHTML = \`
                    <h4>响应:</h4>
                    <pre style="background: white; border: 1px solid #ddd; max-height: 400px; overflow-y: auto;">\${JSON.stringify(data, null, 2)}</pre>
                \`;
            } catch (error) {
                responseDiv.innerHTML = \`
                    <h4>网络错误:</h4>
                    <div style="background: #f8d7da; padding: 15px; border-radius: 4px; color: #721c24;">
                        \${error.message}
                    </div>
                \`;
            }
        }
    </script>

    <h2>💻 使用示例</h2>
    
    <h3>cURL 命令:</h3>
    <pre>curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "mutation { sendMessage(message: \\"你好\\") { success message { content } } }"
  }' \\
  https://your-worker.your-subdomain.workers.dev/graphql</pre>

    <h3>JavaScript 示例:</h3>
    <pre>const response = await fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: \`
      mutation {
        sendMessage(message: "你好，请介绍一下自己") {
          success
          message {
            content
          }
          session {
            id
          }
        }
      }
    \`
  })
});

const data = await response.json();
console.log(data.data.sendMessage.message.content);</pre>

    <h3>React + Apollo Client 示例:</h3>
    <pre>import { gql, useMutation } from '@apollo/client';

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
  const [sendMessage] = useMutation(SEND_MESSAGE);
  
  const handleSend = async (message) => {
    const { data } = await sendMessage({
      variables: { message }
    });
    console.log(data.sendMessage);
  };
}</pre>

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
        <p>Powered by Cloudflare Workers + GraphQL + DeepSeek API</p>
    </footer>
</body>
</html>
	`;

	return new Response(documentation, {
		headers: {
			...corsHeaders,
			'Content-Type': 'text/html'
		}
	});
}

function handleGraphiQLPlayground(corsHeaders: Record<string, string>): Response {
	const playground = \`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GraphQL Playground</title>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
    <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
    <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
</head>
<body>
    <div id="root">
        <style>
            body { margin: 0; overflow: hidden; }
            #root { height: 100vh; }
        </style>
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
                        query: \\\`# 欢迎使用 GraphQL AI Chat API!
# 在这里编写您的查询和变更操作

# 示例 1: 简单问候
query {
  hello
}

# 示例 2: 创建聊天会话
# mutation {
#   createChatSession {
#     id
#     createdAt
#   }
# }

# 示例 3: 发送消息给 AI
# mutation {
#   sendMessage(message: "你好，请介绍一下自己") {
#     success
#     message {
#       content
#       timestamp
#     }
#     session {
#       id
#       messages {
#         role
#         content
#       }
#     }
#   }
# }\\\`,
                    },
                ],
            })
        })
    </script>
</body>
</html>
	\`;

	return new Response(playground, {
		headers: {
			...corsHeaders,
			'Content-Type': 'text/html'
		}
	});
}
