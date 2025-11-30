# 组件系统文档

## 组件架构概览

DreamZero 前端采用组件化的开发模式，基于 Next.js 15 和 React 19 构建。组件系统分为以下几个层次：

1. **基础 UI 组件** (`components/ui/`): 基于 shadcn/ui 的基础组件库
2. **业务组件** (`components/`): 项目特定的业务逻辑组件
3. **页面组件** (`app/`): 路由页面组件
4. **布局组件** (`app/*/layout.tsx`): 布局和结构组件

## 基础 UI 组件 (`components/ui/`)

### shadcn/ui 组件库

项目使用 shadcn/ui 作为基础组件库，提供了一组高质量、可访问的 UI 组件。

#### 核心组件

**Button** (`button.tsx`)
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```
- 支持多种视觉样式
- 尺寸变体支持
- 可扩展的属性接口

**Card** (`card.tsx`)
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // 继承所有 div 属性
}
```
- 包含 CardHeader、CardContent、CardFooter 子组件
- 灵活的内容容器
- 支持自定义样式

**Input** (`input.tsx`)
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // 继承所有 input 属性
}
```
- 类型安全的输入组件
- 支持所有原生 input 属性

**Dialog** (`dialog.tsx`)
- 模态框组件
- 基于 Radix UI 构建
- 可访问性支持
- 动画效果支持

**Navigation Menu** (`navigation-menu.tsx`)
- 下拉导航菜单
- 支持多级菜单
- 响应式设计
- 键盘导航支持

#### 高级组件

**Table** (`table.tsx`)
- 数据表格组件
- 支持排序和筛选
- 响应式设计
- 可访问性优化

**Pagination** (`pagination.tsx`)
- 分页导航组件
- 支持自定义页码显示
- 键盘导航支持

**Tabs** (`tabs.tsx`)
- 选项卡组件
- 支持垂直和水平布局
- 动画过渡效果

**Drawer** (`drawer.tsx`)
- 侧边抽屉组件
- 基于 Vaul 库构建
- 支持多个方向打开
- 手势操作支持

## 业务组件

### 导航组件 (`components/header/`)

#### Header 主组件 (`header/index.tsx`)
网站的头部导航组件，包含：
- Logo 和网站标题
- 主导航菜单
- 用户菜单（登录后显示）
- 主题切换按钮
- 移动端菜单按钮

**核心功能:**
```typescript
interface HeaderProps {
  // 从 Context 获取用户状态和主题信息
}

// 主要功能
- 响应式导航：桌面端显示完整菜单，移动端显示汉堡菜单
- 用户状态显示：根据登录状态显示不同内容
- 主题切换：深色/浅色模式切换
- 路由高亮：当前页面导航项高亮显示
```

#### Desktop 导航菜单 (`header/nav-desktop-menu.tsx`)
桌面端的导航菜单组件：
- 水平布局的主导航
- 支持下拉子菜单
- 悬停效果和动画
- 响应式字体大小

#### Mobile 导航菜单 (`header/nav-mobile-menu.tsx`)
移动端的导航菜单组件：
- 侧滑抽屉式菜单
- 触摸友好的交互设计
- 手势关闭支持
- 层级菜单结构

### 文章组件

#### 文章列表 (`article-list.tsx`)
展示文章列表的组件：
```typescript
interface ArticleListProps {
  articles: Article[]
  loading?: boolean
  loadMore?: () => void
  hasMore?: boolean
}

// 功能特性
- 卡片式布局
- 文章缩略图显示
- 发布日期和作者信息
- 标签和分类显示
- 懒加载优化
- 无限滚动支持
```

#### 文章查看器 (`article-view.tsx`)
文章详情页的核心组件：
```typescript
interface ArticleViewProps {
  article: Article
  relatedArticles?: Article[]
}

// 主要功能
- Markdown 内容渲染
- 代码语法高亮
- 文章目录生成
- 相关文章推荐
- 社交分享按钮
- 阅读进度指示器
```

#### 文章表单 (`article-form.tsx`)
文章编辑和创建的表单组件：
```typescript
interface ArticleFormProps {
  initialData?: Partial<Article>
  onSubmit: (data: ArticleFormData) => void
  loading?: boolean
}

// 表单字段
- 标题输入
- 摘要编辑
- Markdown 编辑器
- 标签管理
- 封面图片上传
- 发布状态设置
```

### 用户组件 (`components/profile/`)

#### 个人资料编辑 (`profile/profile-edit-form.tsx`)
用户个人信息编辑表单：
```typescript
interface ProfileEditFormProps {
  user: User
  onSubmit: (data: ProfileFormData) => void
  loading?: boolean
}

// 编辑字段
- 昵称
- 个人简介
- 邮箱地址
- 社交媒体链接
- 头像上传
```

#### 密码修改 (`profile/password-change-form.tsx`)
安全的密码修改表单：
```typescript
interface PasswordChangeFormProps {
  onSubmit: (data: PasswordChangeData) => void
  loading?: boolean
}

// 安全特性
- 当前密码验证
- 新密码强度检查
- 密码确认验证
- 安全的密码传输
```

#### 头像上传 (`profile/avatar-upload.tsx`)
用户头像上传组件：
```typescript
interface AvatarUploadProps {
  currentAvatar?: string
  onUpload: (file: File) => Promise<string>
  loading?: boolean
}

// 功能特性
- 图片裁剪功能
- 文件类型验证
- 文件大小限制
- 上传进度显示
- 预览功能
```

### 功能组件

#### Markdown 渲染器 (`markdown-with-toc.tsx`)
集成了目录生成的 Markdown 渲染组件：
```typescript
interface MarkdownWithTocProps {
  content: string
  showToc?: boolean
  tocPosition?: 'left' | 'right'
}

// 渲染功能
- Markdown 语法解析
- 代码块语法高亮
- 数学公式渲染 (KaTeX)
- Mermaid 图表支持
- 自动目录生成
- 锚点跳转
```

#### Mermaid 图表 (`Mermaid.tsx`)
Mermaid 图表渲染组件：
```typescript
interface MermaidProps {
  chart: string
  theme?: 'default' | 'dark' | 'forest' | 'neutral'
}

// 支持的图表类型
- 流程图 (Flowchart)
- 序列图 (Sequence Diagram)
- 类图 (Class Diagram)
- 状态图 (State Diagram)
- 甘特图 (Gantt Chart)
- 饼图 (Pie Chart)
```

#### 目录组件 (`table-of-contents.tsx`)
文章目录生成和显示组件：
```typescript
interface TableOfContentsProps {
  content: string
  activeId?: string
  onHeadingClick?: (id: string) => void
}

// 功能特性
- 自动提取标题
- 层级结构显示
- 当前阅读位置高亮
- 平滑滚动
- 响应式设计
```

#### 评论框 (`comment-box.tsx`)
用户评论输入组件：
```typescript
interface CommentBoxProps {
  onSubmit: (comment: CommentData) => void
  replyTo?: Comment
  placeholder?: string
  loading?: boolean
}

// 评论功能
- Markdown 支持
- 表情符号
- @用户提及
- 预览功能
- 回复功能
```

### 通用功能组件

#### 回到顶部 (`go-to-top.tsx`)
页面滚动回到顶部按钮：
```typescript
interface GoToTopProps {
  threshold?: number
  smooth?: boolean
  duration?: number
}

// 交互特性
- 滚动阈值检测
- 平滑滚动动画
- 自定义显示位置
- 键盘快捷键支持
```

#### 解密文本 (`decrypted-text.tsx`)
文字解密动画效果组件：
```typescript
interface DecryptedTextProps {
  text: string
  speed?: number
  characters?: string
}

// 动画效果
- 字符随机替换动画
- 可配置的动画速度
- 自定义字符集
- 循环播放选项
```

## 自定义 Hooks (`hooks/`)

### 通用 Hooks

#### useMobile (`use-mobile.ts`)
移动设备检测 Hook：
```typescript
function useMobile(breakpoint?: number): boolean

// 使用场景
- 响应式布局切换
- 移动端特有功能
- 触摸事件处理
```

#### useMounted (`use-mounted.ts`)
组件挂载状态检测 Hook：
```typescript
function useMounted(): boolean

// 使用场景
- SSR 客户端检测
- 延迟加载
- 动画触发时机
```

#### useDebounce (`useDebounce.ts`)
防抖功能 Hook：
```typescript
function useDebounce<T>(value: T, delay: number): T

// 使用场景
- 搜索输入框
- 窗口调整大小
- API 请求防抖
```

### 业务 Hooks

#### authHook (`auth-hook.ts`)
认证状态管理 Hook：
```typescript
function useAuth(): {
  user: User | null
  loading: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  updateProfile: (data: ProfileData) => Promise<void>
}
```

#### articleHook (`article-hook.ts`)
文章数据管理 Hook：
```typescript
function useArticles(): {
  articles: Article[]
  loading: boolean
  error: Error | null
  createArticle: (data: ArticleData) => Promise<void>
  updateArticle: (id: string, data: ArticleData) => Promise<void>
  deleteArticle: (id: string) => Promise<void>
  getArticle: (id: string) => Promise<Article | null>
}
```

## 组件设计原则

### 1. 单一职责原则
每个组件只负责一个特定的功能，保持组件的简洁和可维护性。

### 2. 可复用性
通过 props 配置实现组件的灵活性和可复用性。

### 3. 类型安全
所有组件都有完整的 TypeScript 类型定义。

### 4. 可访问性
遵循 WAI-ARIA 规范，确保组件的可访问性。

### 5. 性能优化
使用 React.memo、useMemo、useCallback 等优化技术。

### 6. 测试友好
组件设计考虑测试的便利性，支持快照测试和单元测试。

## 样式系统

### Tailwind CSS 配置
- 使用 Tailwind CSS 4
- 自定义主题配置
- 响应式设计工具类
- 深色模式支持

### CSS 变量系统
- 颜色系统变量
- 间距和字体大小变量
- 动画和过渡变量
- 支持主题切换

### 组件样式策略
- 原子化 CSS (Tailwind)
- 组件级样式封装
- 主题变量使用
- 响应式断点