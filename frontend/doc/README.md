# DreamZero 前端项目文档

## 项目概述

DreamZero 是一个基于 Next.js 15 的现代化博客平台，采用 App Router 架构和 TypeScript 构建。该项目实现了 Hugo Ladder 主题的 Next.js 版本，提供了丰富的功能和优秀的用户体验。

### 技术栈

- **框架**: Next.js 15 (React 19)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: Radix UI + shadcn/ui
- **动画**: Framer Motion
- **状态管理**: TanStack Query
- **构建工具**: Next.js 内置构建系统
- **部署**: 静态导出 (Static Export)

## 项目特点

1. **现代化架构**: 使用最新的 Next.js App Router 和 React 19
2. **类型安全**: 完整的 TypeScript 支持
3. **响应式设计**: 支持移动端和桌面端
4. **主题切换**: 支持深色/浅色模式
5. **国际化**: 支持中文界面
6. **SEO 优化**: 完整的元数据和 SEO 配置
7. **性能优化**: 代码分割和懒加载
8. **静态部署**: 支持静态网站部署

## 主要功能

- 📝 文章管理和发布
- 📸 日常摄影展示
- 👤 用户认证和管理
- 💬 评论系统 (Giscus)
- 🔍 文章搜索和筛选
- 📱 移动端适配
- 🎨 主题切换
- 📊 RSS 订阅
- 🗺️ 网站地图

## 目录结构

```
frontend/
├── src/                    # 源代码
│   ├── app/               # Next.js App Router 页面
│   ├── components/        # 可复用组件
│   ├── hooks/            # 自定义 Hooks
│   ├── interface/        # TypeScript 类型定义
│   ├── lib/              # 工具库和配置
│   ├── utils/            # 工具函数
│   └── fonts/            # 字体文件
├── public/               # 静态资源
├── doc/                  # 项目文档 (当前目录)
├── scripts/              # 构建脚本
└── 配置文件...
```

## 部署信息

- **开发环境**: `npm run dev` (端口: 9999)
- **生产构建**: `npm run build`
- **静态服务**: `npm run start`
- **构建输出**: 静态导出到 `out/` 目录
- **部署平台**: Vercel、Netlify 等静态网站托管服务

## 开发规范

- 使用 ESLint 进行代码检查
- 遵循 TypeScript 严格模式
- 组件采用函数式编程
- 使用 Tailwind CSS 进行样式开发
- 遵循 Next.js 最佳实践