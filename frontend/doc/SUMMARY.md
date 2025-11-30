# DreamZero 前端文档目录

## 📖 文档概览

本文档集为 DreamZero 前端项目提供完整的技术文档，涵盖项目架构、开发指南、部署方案等内容。

## 📚 文档结构

### 1. [项目概览](./README.md)
- 项目简介和技术栈
- 主要功能特性
- 目录结构概览
- 开发规范

### 2. [配置文件文档](./configuration.md)
- `package.json` 依赖管理
- `next.config.ts` 构建配置
- TypeScript 配置
- Tailwind CSS 配置
- 环境变量配置

### 3. [项目结构文档](./project-structure.md)
- 详细的目录结构说明
- App Router 架构详解
- 组件系统架构
- 模块化设计说明
- 数据流架构

### 4. [组件系统文档](./components.md)
- 基础 UI 组件 (shadcn/ui)
- 业务组件详解
- 自定义 Hooks 说明
- 组件设计原则
- 样式系统

### 5. [开发指南](./development.md)
- 环境准备和设置
- 开发工作流
- 代码规范
- 数据获取方案
- 测试策略
- 性能优化
- 调试技巧

### 6. [部署指南](./deployment.md)
- 构建配置
- 多平台部署方案
  - Vercel 部署
  - Netlify 部署
  - GitHub Pages 部署
  - 自定义服务器部署
- CDN 配置
- 性能优化
- 监控和日志
- 安全配置

## 🚀 快速开始

### 开发环境
```bash
# 克隆项目
git clone <repository-url>
cd dreamzero-blog/frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 构建部署
```bash
# 构建生产版本
pnpm build

# 启动静态服务
pnpm start
```

## 🛠 技术栈

- **框架**: Next.js 15 (React 19)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: Radix UI + shadcn/ui
- **状态管理**: TanStack Query
- **动画**: Framer Motion
- **构建工具**: Next.js 内置构建系统

## 📱 项目特性

- ✅ 现代化架构 (Next.js App Router)
- ✅ 类型安全 (TypeScript 严格模式)
- ✅ 响应式设计
- ✅ 深色模式支持
- ✅ SEO 优化
- ✅ 性能优化
- ✅ 静态部署
- ✅ 国际化支持

## 🎯 核心功能

- 📝 文章管理和发布
- 📸 日常摄影展示
- 👤 用户认证和管理
- 💬 评论系统 (Giscus)
- 🔍 文章搜索和筛选
- 📱 移动端适配
- 🎨 主题切换
- 📊 RSS 订阅

## 🏗 架构亮点

### 1. 组件化架构
- 基于 shadcn/ui 的设计系统
- 高度可复用的业务组件
- 自定义 Hook 逻辑复用

### 2. 类型安全
- 完整的 TypeScript 类型定义
- 严格的类型检查
- 接口驱动的开发

### 3. 性能优化
- 代码分割和懒加载
- 图片优化和缓存
- 构建优化和 Bundle 分析

### 4. 开发体验
- 热重载开发环境
- ESLint 代码检查
- 完整的开发工具链

## 📋 部署选项

### 推荐方案
- **Vercel**: 零配置部署，最佳性能
- **Netlify**: 简单易用，支持表单处理
- **GitHub Pages**: 免费，开源项目友好

### 自托管
- **Docker**: 容器化部署
- **传统服务器**: Nginx + PM2
- **CDN**: Cloudflare 加速

## 🔧 配置管理

### 环境变量
```bash
NEXT_PUBLIC_API_URL=https://api.dreamzero.cn
NEXT_PUBLIC_BASE_URL=https://dreamzero.cn
NODE_ENV=production
```

### 构建配置
- 静态导出模式
- 图片优化配置
- 路径别名配置
- 构建优化选项

## 📊 性能指标

### Core Web Vitals
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

### Bundle 分析
- 依赖分析
- 代码分割优化
- 资源压缩

## 🔒 安全措施

- HTTPS 强制
- CSP 头配置
- XSS 防护
- 输入验证
- 安全的 API 通信

## 📈 监控和日志

### 性能监控
- Web Vitals 收集
- 错误边界处理
- 用户行为分析

### 日志管理
- PM2 日志配置
- 错误追踪
- 性能分析

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 推送到分支
5. 创建 Pull Request

### 代码规范
- 遵循 ESLint 规则
- 使用 TypeScript 严格模式
- 编写单元测试
- 添加必要注释

### 提交规范
```
type(scope): description

[optional body]

[optional footer]
```

## 📞 联系方式

- **作者**: DreamZero
- **邮箱**: ouxiangming@dreamzero.cn
- **GitHub**: @dreamzero-oxm
- **官网**: https://dreamzero.cn

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

*最后更新: 2025年11月30日*