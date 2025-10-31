# 认证系统实现说明

## 概述

本项目实现了针对不同路由类型的差异化认证逻辑：
- `(main)` 路由：不强制跳转到登录界面，仅在页面header区域显示登录图标
- `(manage)` 路由：强制跳转到登录界面

## 实现细节

### 1. useCheckAndRefreshToken Hook

`useCheckAndRefreshToken` hook 现在接受一个 `routeType` 参数，可以是 `'main'` 或 `'manage'`。

```typescript
const { checkAndRefresh, isLoading } = useCheckAndRefreshToken('main'); // 或 'manage'
```

### 2. 路由类型处理

#### Main 路由处理
- 当token无效时，不会强制跳转到登录页面
- 清除本地存储的无效token
- 触发 `tokenChange` 事件，通知header组件更新登录状态
- 允许用户继续浏览页面内容

#### Manage 路由处理
- 当token无效时，强制跳转到登录页面
- 清除本地存储的无效token
- 确保管理区域的安全性

### 3. 重试机制

实现了指数退避重试策略：
- 默认最大重试次数：3次
- 重试间隔：2^重试次数 * 1000ms
- 达到最大重试次数后，根据路由类型执行不同逻辑

### 4. Header组件集成

Header组件监听 `tokenChange` 事件，根据token状态动态显示登录/登出按钮。

## 使用方法

### 在Main路由中使用

```typescript
// app/(main)/layout.tsx
const { checkAndRefresh, isLoading } = useCheckAndRefreshToken('main');
```

### 在Manage路由中使用

```typescript
// app/(manage)/manage/layout.tsx
const { checkAndRefresh, isLoading } = useCheckAndRefreshToken('manage');
```

## 注意事项

1. 开发模式下会跳过登录验证，便于开发调试
2. 确保在所有需要认证的路由中都正确使用了 `useCheckAndRefreshToken` hook
3. Header组件需要正确监听 `tokenChange` 事件以更新登录状态
4. 在添加新的路由组时，需要根据安全需求选择合适的 `routeType`