# 部署指南

## 构建配置

### 静态导出配置

项目配置为完全静态导出，适合部署到静态网站托管服务。

**Next.js 配置** (`next.config.ts`):
```typescript
const nextConfig: NextConfig = {
  output: 'export', // 启用静态导出
  trailingSlash: true,
  images: {
    unoptimized: true, // 静态导出需要禁用图片优化
  },
  assetPrefix: process.env.NEXT_PUBLIC_BASE_URL,
}
```

### 构建命令

```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm build

# 构建输出目录
out/
```

## 部署平台

### Vercel 部署（推荐）

#### 自动部署
1. 连接 GitHub 仓库到 Vercel
2. 配置构建设置：
   - **Build Command**: `pnpm build`
   - **Output Directory**: `out`
   - **Install Command**: `pnpm install`

#### 环境变量配置
```bash
# Vercel 环境变量
NEXT_PUBLIC_API_URL=https://api.dreamzero.cn
NEXT_PUBLIC_BASE_URL=https://dreamzero.cn
NODE_ENV=production
```

#### Vercel 配置文件
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "out",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "functions": {},
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Netlify 部署

#### 构建设置
```bash
# Netlify 构建设置
Build command: pnpm build
Publish directory: out
Functions directory:
```

#### 重定向规则
```txt
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://api.dreamzero.cn/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404
```

#### 环境变量
```bash
# Netlify 环境变量
NEXT_PUBLIC_API_URL=https://api.dreamzero.cn
NEXT_PUBLIC_BASE_URL=https://your-domain.netlify.app
```

### GitHub Pages 部署

#### 部署脚本
```bash
#!/bin/bash
# scripts/deploy-github-pages.sh

# 设置变量
REPO_URL="https://github.com/dreamzero-oxm/dreamzero-blog.git"
BUILD_DIR="out"
TARGET_BRANCH="gh-pages"

# 构建
pnpm build

# 进入构建目录
cd $BUILD_DIR

# 初始化 Git 仓库
git init
git add .
git commit -m "Deploy to GitHub Pages"

# 推送到 gh-pages 分支
git push $REPO_URL master:$TARGET_BRANCH --force

# 清理
cd ..
rm -rf $BUILD_DIR/.git
```

#### GitHub Actions 自动部署
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install

    - name: Build
      run: pnpm build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

### 自定义服务器部署

#### PM2 配置
```json
// app_pm2.json
{
  "apps": [
    {
      "name": "dreamzero-blog",
      "script": "npx",
      "args": "serve@latest out -l 3000",
      "cwd": "/path/to/frontend",
      "instances": "max",
      "exec_mode": "cluster",
      "watch": false,
      "max_memory_restart": "1G",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      }
    }
  ]
}
```

#### Nginx 配置
```nginx
# /etc/nginx/sites-available/dreamzero-blog
server {
    listen 80;
    server_name dreamzero.cn www.dreamzero.cn;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dreamzero.cn www.dreamzero.cn;

    # SSL 证书配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # 静态文件根目录
    root /path/to/frontend/out;
    index index.html;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML 文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## CDN 配置

### Cloudflare 配置

#### DNS 记录
```txt
# A 记录
A     dreamzero.cn     192.168.1.100

# CNAME 记录
CNAME www           dreamzero.cn

# MX 记录（邮件）
MX    dreamzero.cn   mail.dreamzero.cn
```

#### 缓存规则
```yaml
# Cloudflare 缓存规则
- url_pattern: "*.css"
  cache_level: "cache_everything"
  edge_ttl: 31536000
  browser_ttl: 31536000

- url_pattern: "*.js"
  cache_level: "cache_everything"
  edge_ttl: 31536000
  browser_ttl: 31536000

- url_pattern: "*.png"
  cache_level: "cache_everything"
  edge_ttl: 31536000
  browser_ttl: 31536000

- url_pattern: "*.html"
  cache_level: "bypass"
  edge_ttl: 0
  browser_ttl: 0
```

#### 页面规则
```txt
# Cloudflare 页面规则
dreamzero.cn/api/*
- Cache Level: Bypass
- Browser Cache TTL: 4 hours

dreamzero.cn/*
- Cache Level: Cache Everything
- Edge Cache TTL: 4 hours
- Browser Cache TTL: 4 hours
```

## 性能优化

### 资源优化

#### 图片优化
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      loading={priority ? "eager" : "lazy"}
    />
  )
}
```

#### 字体优化
```typescript
// app/layout.tsx
import { LXGWWenKai } from 'next/font/google'

const lxgw = LXGWWenKai({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lxgw',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={lxgw.variable}>
      <body className={lxgw.className}>
        {children}
      </body>
    </html>
  )
}
```

### 代码分割

#### 动态导入
```typescript
// 懒加载组件
const AdminPanel = dynamic(() => import('@/components/admin-panel'), {
  loading: () => <div>Loading admin panel...</div>,
  ssr: false, // 仅客户端渲染
})

// 条件加载
const Editor = dynamic(() => import('@/components/editor'), {
  loading: () => <div>Loading editor...</div>,
})

// 路由级代码分割
const BlogPage = dynamic(() => import('@/app/blog/page'))
```

### Bundle 分析

```bash
# 安装 webpack-bundle-analyzer
pnpm add -D @next/bundle-analyzer

# next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = withBundleAnalyzer({
  // 其他配置...
})

# 分析构建输出
ANALYZE=true pnpm build
```

## 监控和日志

### 性能监控

#### Web Vitals
```typescript
// app/layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // 发送性能指标到分析服务
  if (process.env.NODE_ENV === 'production') {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
    })
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

#### 错误监控
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 发送错误到监控服务
    if (process.env.NODE_ENV === 'production') {
      console.error('Error caught by boundary:', error, errorInfo)

      // 发送到 Sentry 或其他错误监控服务
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }
}
```

### 日志配置

#### PM2 日志
```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dreamzero-blog',
    script: 'npx',
    args: 'serve@latest out -l 3000',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

## 安全配置

### HTTPS 配置
```nginx
server {
    listen 443 ssl http2;
    server_name dreamzero.cn;

    # 现代 TLS 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # 其他安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 内容安全策略 (CSP)
```typescript
// app/layout.tsx
const csp = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'", "https://www.googletagmanager.com"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'img-src': ["'self'", "data:", "https:"],
  'connect-src': ["'self'", "https://api.dreamzero.cn"],
}

export const metadata = {
  other: {
    'Content-Security-Policy': Object.entries(csp)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; '),
  }
}
```

## 环境管理

### 环境变量配置

#### 开发环境
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BASE_URL=http://localhost:9999
NODE_ENV=development
```

#### 生产环境
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.dreamzero.cn
NEXT_PUBLIC_BASE_URL=https://dreamzero.cn
NODE_ENV=production
ANALYZE=false
```

#### 预发布环境
```bash
# .env.staging
NEXT_PUBLIC_API_URL=https://staging-api.dreamzero.cn
NEXT_PUBLIC_BASE_URL=https://staging.dreamzero.cn
NODE_ENV=production
```

### 配置验证
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse(process.env)
```

## 回滚策略

### 版本管理
```bash
# Git 标签
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# 回滚到上一版本
git checkout v0.9.0
pnpm build
# 部署构建输出
```

### 蓝绿部署
```bash
# 脚本示例
#!/bin/bash
# scripts/blue-green-deploy.sh

CURRENT_ENV=$(curl -s https://dreamzero.cn/api/env)
NEW_VERSION=$1

if [ "$CURRENT_ENV" = "blue" ]; then
    TARGET_ENV="green"
else
    TARGET_ENV="blue"
fi

echo "Deploying version $NEW_VERSION to $TARGET_ENV"

# 构建新版本
pnpm build

# 部署到目标环境
rsync -avz out/ deploy@$TARGET_ENV.dreamzero.cn:/var/www/html/

# 健康检查
curl -f https://$TARGET_ENV.dreamzero.cn/health || exit 1

# 切换流量
# 更新 DNS 或负载均衡器配置

echo "Deployment completed successfully"
```