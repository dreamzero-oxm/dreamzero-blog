# 配置文件文档

## 核心配置文件

### package.json

项目的核心依赖和脚本配置文件。

**主要脚本:**
- `dev`: 开发环境启动 (`next dev -p 9999`)
- `build`: 生产环境构建 (`next build`)
- `start`: 静态服务启动 (`npx serve@latest out`)
- `lint`: ESLint 检查 (`next lint`)
- `generate-sitemap`: 生成网站地图
- `generate-rss`: 生成 RSS 订阅源

**关键依赖:**
- **Next.js 15**: 15.2.4 - 最新版本的 React 框架
- **React 19**: ^19.0.0 - 最新版本的 React
- **UI 组件库**:
  - Radix UI 组件系列
  - Ant Design 5.25.1
  - shadcn/ui
- **样式系统**:
  - Tailwind CSS 4
  - Emotion
  - Framer Motion 12.6.3
- **状态管理**: TanStack Query 5.74.4
- **Markdown 处理**: react-markdown, highlight.js, remark/rehype 插件
- **图表**: Mermaid 11.12.0
- **字体**: LXGW WenKai (霞鹜文楷)

### next.config.ts

Next.js 的主配置文件，配置了项目的构建行为。

```typescript
const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],  // 支持的页面文件扩展名
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',  // 生产环境忽略 ESLint 错误
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',  // 生产环境忽略 TypeScript 错误
  },
  env: {
    PORT: '9999',  // 默认端口
  },
  output: 'export',  // 启用静态导出
};
```

**重要配置:**
- 静态导出模式：支持完全静态部署
- 开发端口：9999
- 生产环境容错：忽略 ESLint 和 TypeScript 错误以加速构建

### tsconfig.json

TypeScript 编译配置，定义了项目的类型检查规则。

**关键配置:**
- **目标**: ES2017
- **模块**: ESNext + bundler 解析
- **严格模式**: 启用所有严格类型检查
- **路径别名**:
  - `@/*`: `./src/*`
  - `@/components/*`: `./src/components/*`

### tailwind.config.cjs

Tailwind CSS 配置，定义了项目的样式系统。

```javascript
module.exports = {
    theme: {
      extend: {
        keyframes: {
          "caret-blink": {
            "0%,70%,100%": { opacity: "1" },
            "20%,50%": { opacity: "0" },
          },
        },
        animation: {
          "caret-blink": "caret-blink 1.25s ease-out infinite",
        },
      },
    },
}
```

**特色功能:**
- 自定义光标闪烁动画
- 支持深色模式切换
- 响应式设计

### components.json

shadcn/ui 组件库配置文件。

**配置项:**
- **样式**: New York 风格
- **RSC**: 支持 React Server Components
- **颜色主题**: Neutral 基础色
- **CSS 变量**: 启用 CSS 变量系统
- **图标库**: Lucide React

**别名配置:**
- `components`: `@/components`
- `utils`: `@/lib/utils`
- `ui`: `@/components/ui`
- `lib`: `@/lib`
- `hooks`: `@/hooks`

### app_pm2.json

PM2 进程管理配置文件，用于生产环境部署。

```json
{
  "apps": [
    {
      "name": "main-dreamzero-blog",
      "script": "pnpm",
      "args": "start"
    }
  ]
}
```

## 环境配置

### 端口配置
- 开发环境: 9999
- 可通过环境变量覆盖

### 环境变量
项目支持以下环境变量：
- `NODE_ENV`: 环境模式 (development/production)
- `PORT`: 服务端口 (默认: 9999)

## 项目特定配置

### src/lib/config.ts

项目的主配置文件，包含所有业务配置：

**网站配置**:
- 站点信息: 标题、名称、描述
- SEO 配置: OpenGraph、Twitter Card
- 图标配置: favicon、manifest

**作者信息**:
- 姓名、邮箱、个人简介

**社交媒体**:
- GitHub、X(Twitter)、小红书、微信
- Buy Me A Coffee 链接

**导航配置**:
- 主导航菜单
- 子菜单支持

**评论系统**:
- Giscus 配置 (基于 GitHub Discussions)

## 构建优化配置

### ESLint 配置
- 生产环境构建时忽略错误检查
- 开发环境强制代码规范检查

### TypeScript 配置
- 生产环境构建时忽略类型错误
- 开发环境严格类型检查

### 静态导出优化
- 完全静态生成
- 支持 CDN 部署
- 优化加载性能

## 部署相关

### 静态部署配置
项目配置为完全静态导出 (`output: 'export'`)，支持：
- Vercel 部署
- Netlify 部署
- GitHub Pages
- 任何静态网站托管服务

### 构建输出
- 输出目录: `out/`
- 包含所有静态资源
- 自包含，无需服务器

### 性能优化
- 代码分割自动优化
- 图片懒加载
- 静态资源缓存策略
- Next.js 自动优化