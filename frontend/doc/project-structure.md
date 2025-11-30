# 项目结构文档

## 目录结构概览

```
frontend/src/
├── app/                    # Next.js App Router 页面和路由
│   ├── (main)/            # 主页面布局组
│   │   ├── page.tsx       # 首页
│   │   ├── layout.tsx     # 主布局
│   │   ├── articles/      # 文章相关页面
│   │   ├── informal-photographs/  # 日常摄影页面
│   │   ├── article-detail/       # 文章详情页
│   │   ├── robots.ts      # SEO robots 配置
│   │   └── sitemap.ts     # 网站地图
│   ├── (login)/           # 登录相关页面
│   │   ├── login/         # 登录页
│   │   ├── _register/     # 注册页
│   │   └── layout.tsx     # 登录布局
│   ├── (manage)/          # 管理相关页面
│   │   ├── manage/        # 管理页面
│   │   ├── profile/       # 个人资料页
│   │   └── layout.tsx     # 管理布局
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── not-found.tsx      # 404 页面
├── components/            # 可复用组件
│   ├── ui/               # 基础 UI 组件 (shadcn/ui)
│   ├── header/           # 头部导航组件
│   ├── profile/          # 个人资料相关组件
│   ├── icons/            # 图标组件
│   ├── article-form.tsx  # 文章表单组件
│   ├── article-list.tsx  # 文章列表组件
│   ├── article-view.tsx  # 文章查看组件
│   ├── comment-box.tsx   # 评论框组件
│   ├── markdown-with-toc.tsx  # Markdown + 目录组件
│   ├── Mermaid.tsx       # Mermaid 图表组件
│   ├── table-of-contents.tsx  # 目录组件
│   ├── toc.tsx          # 目录组件
│   ├── login-form.tsx   # 登录表单
│   ├── decrypted-text.tsx  # 解密文本组件
│   ├── go-to-top.tsx    # 回到顶部组件
│   ├── provider/        # Context 提供者组件
│   └── manage-sidebar.tsx  # 管理侧边栏
├── hooks/               # 自定义 React Hooks
│   ├── use-mobile.ts    # 移动端检测 Hook
│   ├── use-mounted.ts   # 组件挂载检测 Hook
│   ├── photo-hook.ts    # 摄影相关 Hook
│   ├── article-hook.ts  # 文章相关 Hook
│   ├── user-hook.ts     # 用户相关 Hook
│   ├── auth-hook.ts     # 认证相关 Hook
│   ├── useDebounce.ts   # 防抖 Hook
│   └── AUTH_README.md   # 认证 Hook 说明文档
├── interface/           # TypeScript 类型定义
│   ├── base.ts         # 基础类型
│   ├── user.ts         # 用户相关类型
│   ├── article.ts      # 文章相关类型
│   ├── photo.ts        # 摄影相关类型
│   └── article-comment.ts  # 评论相关类型
├── lib/                # 工具库和配置
│   ├── config.ts       # 项目主配置
│   ├── utils.ts        # 工具函数
│   ├── api.ts          # API 相关配置
│   ├── toc.ts          # 目录生成工具
│   └── validation.ts   # 表单验证规则
├── utils/              # 工具函数
│   ├── date.ts         # 日期处理工具
│   ├── error-handler.ts  # 错误处理工具
│   └── request.ts      # HTTP 请求工具
├── fonts/              # 字体文件
│   └── lxgw-wenkai/    # 霞鹜文楷字体
└── .DS_Store          # macOS 系统文件
```

## 核心模块详解

### 1. App Router 结构 (`app/`)

#### 路由分组
Next.js 15 使用括号 `()` 定义路由分组，不影响 URL 路径：

- **(main)**: 主要页面组，包含首页、文章、摄影等公共页面
- **(login)**: 认证页面组，包含登录和注册页面
- **(manage)**: 管理页面组，需要认证的管理功能

#### 核心页面
- `page.tsx`: 网站首页，展示最新文章和摄影作品
- `layout.tsx`: 根布局组件，定义全局 HTML 结构
- `globals.css`: 全局样式文件，包含 Tailwind CSS 和自定义样式
- `not-found.tsx`: 404 错误页面

### 2. 组件系统 (`components/`)

#### UI 组件 (`components/ui/`)
基于 shadcn/ui 的基础组件库，包含：
- `button.tsx`: 按钮组件
- `card.tsx`: 卡片组件
- `input.tsx`: 输入框组件
- `modal.tsx`: 模态框组件
- `table.tsx`: 表格组件
- ... 等其他基础 UI 组件

#### 业务组件
- **头部导航**:
  - `header/index.tsx`: 头部主组件
  - `header/nav-desktop-menu.tsx`: 桌面端导航菜单
  - `header/nav-mobile-menu.tsx`: 移动端导航菜单
  - `header/nav-data.ts`: 导航数据配置

- **文章相关**:
  - `article-list.tsx`: 文章列表展示
  - `article-view.tsx`: 文章详情查看
  - `article-form.tsx`: 文章编辑表单
  - `comment-box.tsx`: 评论输入框

- **用户相关**:
  - `login-form.tsx`: 登录表单
  - `profile/`: 个人资料管理组件
    - `profile-edit-form.tsx`: 资料编辑表单
    - `password-change-form.tsx`: 密码修改表单
    - `avatar-upload.tsx`: 头像上传组件
    - `operation-logs-table.tsx`: 操作记录表格

- **功能组件**:
  - `markdown-with-toc.tsx`: Markdown 渲染 + 目录生成
  - `Mermaid.tsx`: Mermaid 图表渲染
  - `table-of-contents.tsx`: 文章目录组件
  - `go-to-top.tsx`: 回到顶部按钮

### 3. 自定义 Hooks (`hooks/`)

#### 通用 Hooks
- `use-mobile.ts`: 检测设备是否为移动端
- `use-mounted.ts`: 检测组件是否已挂载
- `useDebounce.ts`: 防抖功能 Hook

#### 业务 Hooks
- `auth-hook.ts`: 认证状态管理
- `user-hook.ts`: 用户数据管理
- `article-hook.ts`: 文章数据管理
- `photo-hook.ts`: 摄影作品管理

### 4. 类型系统 (`interface/`)

#### 基础类型 (`base.ts`)
定义通用的数据结构，如 API 响应格式、分页信息等。

#### 领域类型
- `user.ts`: 用户信息类型
- `article.ts`: 文章相关类型
- `photo.ts`: 摄影作品类型
- `article-comment.ts`: 评论相关类型

### 5. 工具库 (`lib/` & `utils/`)

#### 核心库 (`lib/`)
- `config.ts`: 项目配置文件，包含网站信息、SEO、社交媒体等配置
- `utils.ts`: 通用工具函数
- `api.ts`: API 接口配置和请求封装
- `toc.ts`: 目录生成算法
- `validation.ts`: 表单验证规则

#### 工具函数 (`utils/`)
- `date.ts`: 日期格式化和处理
- `error-handler.ts`: 错误处理和日志记录
- `request.ts`: HTTP 请求工具类

### 6. 静态资源

#### 字体文件 (`fonts/`)
- `lxgw-wenkai/`: 霞鹜文楷字体文件，支持中文优雅显示
  - `LXGWWenKai-Light.ttf`: 细体
  - `LXGWWenKai-Medium.ttf`: 中等字重
  - `LXGWWenKai-Regular.ttf`: 常规字重

## 架构特点

### 1. 模块化设计
- 按功能模块组织代码结构
- 组件高度可复用
- 清晰的职责分离

### 2. 类型安全
- 完整的 TypeScript 类型定义
- 严格的类型检查
- 良好的开发体验

### 3. 性能优化
- 组件懒加载
- 代码分割
- 图片优化
- 静态资源缓存

### 4. 可维护性
- 统一的代码风格
- 完整的注释文档
- 清晰的文件命名规范

### 5. 扩展性
- 插件化的架构设计
- 配置驱动
- 易于添加新功能

## 数据流架构

```
用户交互 → 页面组件 → Custom Hook → API Utils → 后端接口
    ↓           ↓          ↓            ↓
Context 更新 → 状态更新 → UI 重渲染 → 数据同步
```

### 状态管理策略
1. **服务器状态**: TanStack Query 管理远端数据
2. **客户端状态**: React Context 管理全局状态
3. **表单状态**: 受控组件模式
4. **本地状态**: useState/useReducer

### 组件通信方式
1. **Props 传递**: 父子组件通信
2. **Context**: 跨组件状态共享
3. **自定义 Hook**: 逻辑复用和状态管理
4. **事件总线**: 组件间松耦合通信