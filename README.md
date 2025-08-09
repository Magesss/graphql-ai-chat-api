# GraphQL AI Chat API

🚀 基于 Cloudflare Workers、GraphQL 和 DeepSeek API 的 AI 聊天接口

## 🌟 功能特性

- ✅ **GraphQL 接口** - 类型安全的查询语言
- ✅ **DeepSeek AI 集成** - 智能对话能力
- ✅ **会话管理** - 支持多轮对话
- ✅ **GraphQL Playground** - 交互式查询界面
- ✅ **完整文档** - 包含示例和使用指南
- ✅ **CORS 支持** - 跨域请求支持
- ✅ **边缘计算** - Cloudflare Workers 全球部署

## 🔧 技术栈

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **API**: GraphQL
- **AI Model**: DeepSeek
- **Testing**: Vitest

## 📁 项目结构

```
my-app/
├── src/
│   └── index.ts          # 主要的 Worker 代码和 GraphQL 实现
├── test/
│   ├── index.spec.ts     # 测试文件
│   └── env.d.ts          # 测试环境类型定义
├── package.json          # 项目依赖和脚本
├── wrangler.jsonc        # Wrangler 配置文件
├── tsconfig.json         # TypeScript 配置
└── README.md             # 项目说明
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

访问 http://localhost:8787 查看 API 文档

### 3. 部署到 Cloudflare

```bash
npm run deploy
```

## 🔍 GraphQL Schema

```graphql
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
```

## 📖 API 使用示例

### 创建聊天会话

```graphql
mutation {
  createChatSession {
    id
    createdAt
  }
}
```

### 发送消息给 AI

```graphql
mutation {
  sendMessage(message: "你好，请介绍一下自己") {
    success
    message {
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
}
```

### 继续对话

```graphql
mutation {
  sendMessage(
    sessionId: "your-session-id"
    message: "能告诉我更多关于你的能力吗？"
  ) {
    success
    message {
      content
    }
  }
}
```

## 💻 前端集成

### JavaScript/Fetch

```javascript
const response = await fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: `
      mutation {
        sendMessage(message: "你好") {
          success
          message {
            content
          }
        }
      }
    `
  })
});

const data = await response.json();
console.log(data.data.sendMessage.message.content);
```

### React + Apollo Client

```javascript
import { gql, useMutation } from '@apollo/client';

const SEND_MESSAGE = gql`
  mutation SendMessage($message: String!, $sessionId: ID) {
    sendMessage(message: $message, sessionId: $sessionId) {
      success
      message {
        content
      }
      session {
        id
      }
    }
  }
`;

function ChatComponent() {
  const [sendMessage] = useMutation(SEND_MESSAGE);
  
  const handleSend = async (message) => {
    const { data } = await sendMessage({
      variables: { message }
    });
    console.log(data.sendMessage);
  };
}
```

## 🌐 API 端点

- **POST /graphql** - GraphQL 主接口
- **GET /graphql** - GraphQL Playground 交互界面
- **GET /** - API 文档和在线测试

## 🛠️ 开发

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run deploy` - 部署到 Cloudflare
- `npm run test` - 运行测试
- `npm run cf-typegen` - 生成类型定义

### 环境要求

- Node.js 18+
- npm 或 yarn
- Cloudflare Workers 账户（部署时需要）

## 📝 配置

在 `src/index.ts` 中修改 DeepSeek API 密钥：

```typescript
'Authorization': 'Bearer your-deepseek-api-key'
```

## 🔒 安全注意事项

- API 密钥应该通过环境变量或 Cloudflare Workers 的 Secrets 管理
- 生产环境中建议添加身份验证和速率限制
- 注意 CORS 设置，避免过于宽松的跨域策略

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请在 GitHub Issues 中提出。

---

**Powered by Cloudflare Workers + GraphQL + DeepSeek API**
