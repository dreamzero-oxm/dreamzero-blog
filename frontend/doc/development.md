# 开发指南

## 环境准备

### 系统要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐包管理器)
- Git

### 开发环境设置

1. **克隆项目**
```bash
git clone <repository-url>
cd dreamzero-blog/frontend
```

2. **安装依赖**
```bash
pnpm install
```

3. **启动开发服务器**
```bash
pnpm dev
```

4. **访问应用**
- 开发服务器地址: http://localhost:9999
- 支持热重载和 TypeScript 检查

## 开发工作流

### 代码规范

#### ESLint 配置
项目使用 ESLint 进行代码质量检查：

```bash
# 检查代码规范
pnpm lint

# 自动修复可修复的问题
pnpm lint --fix
```

#### TypeScript 严格模式
- 启用所有严格类型检查
- 禁用隐式 any
- 严格的 null 检查

#### 组件开发规范
```typescript
// 组件命名：PascalCase
export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  content
}) => {
  return (
    <div className="article-card">
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  )
}
```

### 样式开发

#### Tailwind CSS
使用 Tailwind CSS 4 进行样式开发：

```typescript
// 响应式设计
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">内容区域</div>
  <aside className="w-full md:w-64">侧边栏</aside>
</div>

// 深色模式支持
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  自适应主题的内容
</div>
```

#### CSS 变量
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### 组件开发

#### 函数式组件
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  onClick?: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children
}) => {
  const baseClasses = 'rounded-lg font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
  }
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

#### 自定义 Hooks
```typescript
// hooks/useLocalStorage.ts
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error setting localStorage:', error)
    }
  }

  return [storedValue, setValue]
}
```

## 数据获取

### TanStack Query
使用 TanStack Query 进行数据获取和缓存管理：

```typescript
// hooks/useArticles.ts
export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => api.getArticles(),
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
  })
}

// 创建文章
export function useCreateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateArticleData) => api.createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success('文章创建成功')
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`)
    },
  })
}
```

### API 封装
```typescript
// lib/api.ts
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL!)
```

## 测试

### 单元测试
```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  test('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 集成测试
```typescript
// __tests__/ArticleCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ArticleCard } from '@/components/article-card'
import { mockArticle } from '@/__mocks__/article'

describe('ArticleCard', () => {
  test('displays article information', () => {
    render(<ArticleCard article={mockArticle} />)

    expect(screen.getByText(mockArticle.title)).toBeInTheDocument()
    expect(screen.getByText(mockArticle.summary)).toBeInTheDocument()
    expect(screen.getByText(mockArticle.author.name)).toBeInTheDocument()
  })
})
```

## 性能优化

### 代码分割
```typescript
// 路由级别的代码分割
const ArticlePage = dynamic(() => import('@/app/articles/page'), {
  loading: () => <div>Loading...</div>,
})

// 组件级别的代码分割
const HeavyComponent = dynamic(() => import('@/components/heavy-component'), {
  ssr: false, // 仅客户端加载
})
```

### 图片优化
```typescript
import Image from 'next/image'

export function ArticleImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={400}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      priority={false}
      {...props}
    />
  )
}
```

### 内存优化
```typescript
// 使用 React.memo 防止不必要的重渲染
export const ArticleCard = React.memo<ArticleCardProps>(({ article }) => {
  return (
    <div className="article-card">
      {/* 内容 */}
    </div>
  )
})

// 使用 useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// 使用 useCallback 缓存函数
const handleClick = useCallback((id: string) => {
  onArticleClick(id)
}, [onArticleClick])
```

## 调试

### 开发工具
- **React Developer Tools**: 组件调试和性能分析
- **Next.js Dev Tools**: 路由和性能调试
- **TanStack Devtools**: 数据获取调试

### 错误边界
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>{this.state.error?.message}</details>
        </div>
      )
    }

    return this.props.children
  }
}
```

## 构建和部署

### 本地构建
```bash
# 开发构建
pnpm build

# 生产构建
NODE_ENV=production pnpm build

# 检查构建输出
pnpm build && pnpm start
```

### 部署配置

#### Vercel 部署
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "out",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

#### 环境变量
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.dreamzero.cn
NEXT_PUBLIC_GISCUS_REPO=dreamzero-oxm/dreamzero-blog
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDOHyVOjg
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOHyVOjs4CQsH7
```

## 最佳实践

### 代码组织
- 按功能模块组织文件
- 保持组件文件简洁
- 使用绝对路径导入
- 合理的命名约定

### 性能考虑
- 使用 Next.js 的 Image 组件
- 实施适当的缓存策略
- 优化 Bundle 大小
- 使用代码分割

### 安全考虑
- 输入验证和清理
- 安全的数据传输
- 适当的认证和授权
- 防止 XSS 攻击

### 可维护性
- 完整的 TypeScript 类型
- 清晰的组件接口
- 充分的测试覆盖
- 良好的文档和注释