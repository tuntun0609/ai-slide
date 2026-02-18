# InfographicAI

AI 驱动的幻灯片与信息图创建工具。通过自然语言对话，快速生成精美的信息图和演示文稿，并支持导出为 PPTX 格式。

## 功能特性

- **AI 对话创建**：通过自然语言描述，AI 自动生成信息图内容
- **实时编辑**：内置 YAML 编辑器，支持直接修改信息图语法
- **多页幻灯片**：支持在一个演示文稿中管理多张信息图
- **PPTX 导出**：一键将幻灯片导出为 PowerPoint 文件
- **图标库**：内置丰富的图标资源供信息图使用
- **多语言支持**：支持中英文界面切换
- **用户认证**：基于 better-auth 的完整登录/注册系统

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI 组件 | shadcn/ui + Base UI |
| 样式 | Tailwind CSS v4 |
| 状态管理 | Jotai |
| AI SDK | Vercel AI SDK v6 |
| AI 模型 | OpenRouter (Kimi) |
| 信息图渲染 | @antv/infographic |
| 数据库 ORM | Drizzle ORM |
| 数据库 | Neon (Serverless PostgreSQL) |
| 认证 | better-auth |
| 国际化 | next-intl |
| 代码编辑器 | CodeMirror |
| 流程图 | React Flow |
| 动画 | Motion |

## 快速开始

### 环境要求

- Node.js 18+
- Bun（推荐）或 npm/yarn/pnpm

### 安装依赖

```bash
bun install
```

### 配置环境变量

复制 `.env.example` 并填写必要的环境变量：

```bash
cp .env.example .env.local
```

需要配置的变量：

```env
# 数据库
DATABASE_URL=your_neon_database_url

# AI 模型
OPENROUTER_API_KEY=your_openrouter_api_key

# 认证
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

### 初始化数据库

```bash
bun run db:generate
bun run db:migrate
```

### 启动开发服务器

```bash
bun run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 可用脚本

```bash
bun run dev          # 启动开发服务器
bun run build        # 构建生产版本
bun run start        # 启动生产服务器
bun run lint         # 代码检查 (Biome)
bun run format       # 代码格式化 (Biome)
bun run typecheck    # TypeScript 类型检查
bun run db:generate  # 生成数据库迁移文件
bun run db:migrate   # 执行数据库迁移
bun run db:studio    # 打开 Drizzle Studio
```

## 部署

推荐使用 [Vercel](https://vercel.com) 部署，配合 [Neon](https://neon.tech) 作为 Serverless PostgreSQL 数据库。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
