# GitHub 仓库设置指南

## 🔗 创建和连接 GitHub 仓库

### 步骤 1: 在 GitHub 上创建新仓库

1. 访问 https://github.com
2. 点击右上角的 "+" 号 → "New repository"
3. 填写仓库信息：
   - **Repository name**: `graphql-ai-chat-api`
   - **Description**: `GraphQL AI Chat API with DeepSeek integration on Cloudflare Workers`
   - **Visibility**: Public 或 Private (根据您的需要)
   - **❌ 不要勾选** "Initialize this repository with a README"
4. 点击 "Create repository"

### 步骤 2: 连接本地仓库到 GitHub

创建仓库后，在终端中执行以下命令（将 `YOUR_USERNAME` 替换为您的 GitHub 用户名）：

```bash
# 添加远程仓库 (HTTPS)
git remote add origin https://github.com/YOUR_USERNAME/graphql-ai-chat-api.git

# 或者使用 SSH (如果您配置了 SSH 密钥)
# git remote add origin git@github.com:YOUR_USERNAME/graphql-ai-chat-api.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

### 步骤 3: 验证上传

访问您的 GitHub 仓库页面，确认以下文件已成功上传：

- ✅ `README.md` - 项目说明文档
- ✅ `src/index.ts` - GraphQL AI 聊天 API 实现
- ✅ `package.json` - 项目依赖
- ✅ `wrangler.jsonc` - Cloudflare Workers 配置
- ✅ `tsconfig.json` - TypeScript 配置
- ✅ 其他项目文件

## 🚀 部署到 Cloudflare Workers

上传到 GitHub 后，您可以部署到 Cloudflare Workers：

```bash
# 登录 Cloudflare (如果还未登录)
npx wrangler login

# 部署到 Cloudflare Workers
npm run deploy
```

## 📝 更新仓库

后续更新代码时：

```bash
# 添加更改
git add .

# 提交更改
git commit -m "your commit message"

# 推送到 GitHub
git push
```

## 🔧 配置建议

### GitHub 仓库设置

1. **添加 Topics**: 在仓库页面添加相关标签
   - `graphql`
   - `ai`
   - `chatbot`
   - `cloudflare-workers`
   - `deepseek`
   - `typescript`

2. **设置 Description**: 
   ```
   🚀 GraphQL AI Chat API with DeepSeek integration on Cloudflare Workers
   ```

3. **添加 Website**: 部署后的 Cloudflare Workers URL

### 安全考虑

- 🔒 **不要提交 API 密钥**: 确保 DeepSeek API 密钥不在代码中
- 🔐 **使用 Secrets**: 在 Cloudflare Workers 中配置环境变量
- 🛡️ **设置 .gitignore**: 确保敏感文件不被提交

## 🎯 完成检查清单

- [ ] GitHub 仓库已创建
- [ ] 本地代码已推送到 GitHub
- [ ] README.md 显示正确
- [ ] 项目描述和标签已设置
- [ ] 代码已部署到 Cloudflare Workers
- [ ] API 功能正常工作

## 📞 需要帮助？

如果遇到问题，请检查：

1. Git 是否正确配置
2. GitHub 权限是否足够
3. 网络连接是否正常
4. 仓库名称是否正确

---

**快乐编码！🎉**
