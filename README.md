<div align="center">

# 归零重启 (DreamZero)

**DreamZero的博客 - A Full Stack Developer's Journey**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-1.24.0-00ADD8?style=flat-square&logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[Live Site](https://dreamzero.cn)** | **[GitHub](https://github.com/dreamzero-oxm/dreamzero-blog)**

</div>

---

## 关于 (About)

我是 **DreamZero**，一名全栈开发者。这个博客是我记录技术成长、分享开发心得的地方。

在这里，我会写关于：
- AI 技术探索
- 全栈开发实践
- 系统架构设计
- 开发工具与效率

---

## 技术栈 (Tech Stack)

### Frontend

- **框架:** [Next.js 15](https://nextjs.org/) (App Router + SSG)
- **UI 库:** [React 19](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Ant Design](https://ant.design/)
- **语言:** [TypeScript](https://www.typescriptlang.org/)
- **样式:** [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **状态管理:** [TanStack React Query](https://tanstack.com/query/latest)

### Backend

- **框架:** [Gin](https://gin-gonic.com/)
- **语言:** [Go 1.24](https://go.dev/)
- **ORM:** [GORM](https://gorm.io/)
- **数据库:** PostgreSQL / SQLite
- **缓存:** [Redis](https://redis.io/)
- **对象存储:** [MinIO](https://min.io/)

### DevOps

- **容器化:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **代码质量:** ESLint, golangci-lint
- **性能分析:** pprof

---

## 功能特性 (Features)

<details>
<summary><b>Frontend (前端)</b></summary>

- **静态站点生成 (SSG)** - Next.js export 优化性能
- **暗色模式** - next-themes 支持主题切换
- **响应式设计** - 移动优先，完美适配各种设备
- **SEO 优化** - OpenGraph, Twitter Cards, 结构化数据
- **RSS/Atom 订阅** - 自动生成 Feed
- **MDX 支持** - Markdown 扩展语法
- **代码高亮** - highlight.js 语法高亮
- **Mermaid 图表** - 支持流程图、序列图等
- **中文字体** - LXGW WenKai (霞鹜文楷) 本地字体

</details>

<details>
<summary><b>Backend (后端)</b></summary>

- **RESTful API** - Swagger 文档自动生成
- **JWT 认证** - 用户授权与身份验证
- **文章管理** - CRUD 操作
- **评论系统** - 文章评论支持
- **日常摄影** - 每日照片管理
- **操作日志** - 完整的操作记录
- **文件上传** - MinIO 对象存储
- **Redis 缓存** - 提升响应速度
- **健康检查** - 服务状态监控

</details>

<details>
<summary><b>Development (开发体验)</b></summary>

- **Git Hooks** - 代码质量自动检查
- **热重载** - 开发环境实时更新
- **Docker 开发** - 容器化本地开发环境
- **Makefile** - 常用命令快捷方式
- **Conventional Commits** - 规范化提交信息

</details>

---

## 项目结构 (Project Structure)

```
dreamzero-blog/
├── frontend/                 # Next.js 前端应用
│   ├── src/
│   │   ├── app/             # App Router 页面
│   │   │   ├── (main)/     # 主要路由
│   │   │   ├── (login)/    # 登录相关路由
│   │   │   └── (manage)/   # 管理后台路由
│   │   ├── components/     # React 组件
│   │   │   └── ui/         # shadcn/ui 组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── lib/            # 工具函数和配置
│   │   ├── interface/      # TypeScript 类型定义
│   │   └── utils/          # 辅助函数
│   ├── public/             # 静态资源
│   ├── fonts/              # 自定义字体
│   └── scripts/            # 构建脚本 (RSS, sitemap)
│
├── backend/                 # Go 后端 API
│   ├── controller/         # 控制器
│   ├── service/            # 业务逻辑
│   ├── router/             # 路由定义
│   ├── internal/           # 内部包
│   │   ├── config/        # 配置管理
│   │   ├── models/        # 数据模型
│   │   ├── middleware/    # 中间件
│   │   ├── logger/        # 日志
│   │   └── ...
│   ├── config/            # 配置文件 (YAML)
│   ├── docs/              # Swagger 文档
│   └── main.go            # 入口文件
│
├── docker/                 # Docker 配置
│   ├── docker-compose.yml
│   └── entrypoint.sh
│
├── docs/                   # 项目文档
│   └── DEPLOYMENT.md       # 部署指南
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # CI/CD 流水线
│
├── Dockerfile              # 多阶段构建
├── Makefile               # 项目命令
└── README.md              # 项目说明
```

---

## 快速开始 (Quick Start)

### 前置要求 (Prerequisites)

- **Node.js** >= 24.11.1
- **Go** >= 1.24.0
- **pnpm** >= 9.15.4
- **Docker** (可选)

### 本地开发 (Local Development)

<details>
<summary><b>Frontend 开发</b></summary>

```bash
cd frontend
pnpm install
pnpm dev          # 开发服务器运行在 :9999
pnpm build        # 构建静态文件到 /out 目录
```

</details>

<details>
<summary><b>Backend 开发</b></summary>

```bash
cd backend
go mod download
make build        # 构建到 ./build/blog-server
./build/blog-server -c config/config_dev.yaml
# 或者: make run
```

</details>

<details>
<summary><b>Docker 开发</b></summary>

```bash
# 使用根目录 Makefile
make dev-frontend
make dev-backend

# 使用 Docker Compose 启动全栈
cd docker
docker-compose up
```

</details>

### 主要端口 (Ports)

| 服务 | 端口 |
|------|------|
| Frontend | 9999 |
| Backend API | 9997 |
| MinIO Console | 9001 |
| MinIO API | 9000 |

---

## 配置说明 (Configuration)

### Frontend 配置

编辑 [frontend/src/lib/config.ts](frontend/src/lib/config.ts) 修改站点信息：

```typescript
export const config = {
  site: {
    title: "归零重启(DreamZero)",
    description: "DreamZero的博客",
    url: "https://dreamzero.cn",
    // ...
  },
  // ...
};
```

### Backend 配置

编辑 `backend/config/config_*.yaml` 文件：

- `config_dev.yaml` - 开发环境配置
- `config_prod.yaml` - 生产环境配置

### 环境变量

复制 `.env-example` 到 `.env` 并填写配置：

```bash
cp .env-example .env
```

---

## 部署 (Deployment)

<details>
<summary><b>Docker 部署</b></summary>

```bash
# 构建镜像
docker build -t dreamzero-blog .

# 运行容器
docker run -p 9999:9999 -p 9997:9997 dreamzero-blog
```

</details>

<details>
<summary><b>生产环境部署</b></summary>

详见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

</details>

---

## 贡献 (Contributing)

欢迎贡献！请查看 [backend/CONTRIBUTING.md](backend/CONTRIBUTING.md) 了解详细指南。

### 代码规范

- **Frontend:** ESLint + Prettier
- **Backend:** golangci-lint
- **Commit:** Conventional Commits 规范

---

## 许可证 (License)

[MIT](LICENSE) - 详见 LICENSE 文件

---

## 联系方式 (Contact)

- **作者:** DreamZero
- **邮箱:** ouxiangming@dreamzero.cn
- **GitHub:** [dreamzero-oxm](https://github.com/dreamzero-oxm)

### 社交链接

- **GitHub:** [dreamzero-oxm](https://github.com/dreamzero-oxm)

