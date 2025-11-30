# 错误码说明文档

## 概述

本文档详细说明了 DreamZero Blog API 中使用的所有错误码，包括错误分类、具体描述、常见原因和解决方案。

## 错误码分类

### 分类说明

| 分类 | 错误码范围 | 描述 |
|------|-------------|------|
| 成功 | 200 | 操作成功 |
| 认证错误 | 20000-20999 | 认证和授权相关错误 |
| 参数错误 | 20100-20199 | 请求参数相关错误 |
| 业务错误 | 20200-20299 | 业务逻辑相关错误 |
| 内容错误 | 20300-20399 | 内容管理相关错误 |
| 系统错误 | 50000-59999 | 系统内部错误 |

## 详细错误码

### 2xx 成功

| 错误码 | HTTP状态码 | 描述 | 示例 |
|--------|-------------|------|------|
| 200 | 200 | 操作成功 | `{"code": 200, "msg": "操作成功", "data": {}}` |

### 20000-20999 认证错误

| 错误码 | HTTP状态码 | 描述 | 常见原因 | 解决方案 |
|--------|-------------|------|----------|----------|
| 20002 | 401 | 未认证或令牌无效 | 令牌已过期、格式错误、伪造令牌 | 重新登录获取新令牌 |
| 20117 | 401 | 无效的访问令牌 | 令牌格式不正确或签名验证失败 | 检查令牌格式 |
| 20118 | 401 | 访问令牌已过期 | 令牌超过有效期 | 使用刷新令牌获取新令牌 |
| 20119 | 401 | 访问令牌格式错误 | 令牌格式不符合JWT标准 | 重新获取令牌 |
| 20120 | 401 | 无效的刷新令牌 | 刷新令牌无效或被撤销 | 重新登录 |
| 20121 | 401 | 刷新令牌已过期 | 刷新令牌超过有效期 | 重新登录 |

### 20100-20199 参数错误

| 错误码 | HTTP状态码 | 描述 | 常见原因 | 解决方案 |
|--------|-------------|------|----------|----------|
| 20101 | 400 | 参数错误 | 缺少必填参数、参数格式错误、参数值超出范围 | 检查请求参数格式和必填字段 |
| 20104 | 400 | 用户名或密码错误 | 用户名不存在或密码不正确 | 检查用户名和密码 |
| 20105 | 400 | 邮箱验证码错误 | 验证码不正确或已过期 | 重新获取验证码 |
| 20106 | 400 | 邮箱验证码已过期 | 验证码超过10分钟有效期 | 重新获取验证码 |

### 20200-20299 业务错误

| 错误码 | HTTP状态码 | 描述 | 常见原因 | 解决方案 |
|--------|-------------|------|----------|----------|
| 20201 | 400 | 文件上传失败 | 文件格式不支持、文件大小超限、存储空间不足 | 检查文件格式和大小 |
| 20203 | 500 | 获取图片列表失败 | 数据库查询错误、存储服务异常 | 联系系统管理员 |

### 20300-20399 内容错误

| 错误码 | HTTP状态码 | 描述 | 常见原因 | 解决方案 |
|--------|-------------|------|----------|----------|
| 20301 | 400 | 添加评论失败 | 文章不存在、评论内容不当、频率限制 | 检查文章存在性和评论内容 |
| 20302 | 500 | 获取评论列表失败 | 数据库查询错误 | 稍后重试或联系管理员 |

### 50000-59999 系统错误

| 错误码 | HTTP状态码 | 描述 | 常见原因 | 解决方案 |
|--------|-------------|------|----------|----------|
| 50000 | 500 | 系统内部错误 | 数据库连接失败、服务异常 | 联系系统管理员 |
| 50001 | 503 | 服务不可用 | 服务维护、依赖服务异常 | 稍后重试 |
| 50002 | 504 | 网关超时 | 请求处理时间过长 | 简化请求或稍后重试 |

## 错误响应格式

### 标准错误响应

```json
{
  "code": 20002,
  "msg": "未认证或令牌无效",
  "data": "请检查Authorization头中的令牌是否正确"
}
```

### 验证错误响应

```json
{
  "code": 20101,
  "msg": "参数验证失败",
  "data": {
    "field_errors": [
      {
        "field": "user_name",
        "error": "用户名不能为空"
      },
      {
        "field": "email",
        "error": "邮箱格式不正确"
      }
    ]
  }
}
```

### 业务错误响应

```json
{
  "code": 20114,
  "msg": "账户被锁定",
  "data": {
    "lock_reason": "多次登录失败",
    "lock_until": "2024-01-01T12:00:00Z",
    "retry_after": 3600
  }
}
```

## 常见错误场景

### 1. 认证相关错误

#### 令牌过期
```http
GET /api/v1/user/profile
Authorization: Bearer expired_token

HTTP/1.1 401 Unauthorized
{
  "code": 20118,
  "msg": "访问令牌已过期",
  "data": "令牌已过期，请使用刷新令牌获取新令牌"
}
```

**解决方案**:
```javascript
// 使用刷新令牌获取新令牌
fetch('/api/v1/user/refreshToken', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh_token: storedRefreshToken })
})
.then(response => response.json())
.then(data => {
  if (data.code === 200) {
    // 存储新令牌
    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
  }
});
```

#### 权限不足
```http
PUT /api/v1/articles/123
Authorization: Bearer user_token
{
  "title": "更新的标题"
}

HTTP/1.1 401 Unauthorized
{
  "code": 20002,
  "msg": "未认证或令牌无效",
  "data": "您没有权限修改此文章"
}
```

### 2. 参数验证错误

#### 缺少必填参数
```http
POST /api/v1/user/register
Content-Type: application/json
{
  "user_name": "testuser"
}

HTTP/1.1 400 Bad Request
{
  "code": 20101,
  "msg": "参数验证失败",
  "data": {
    "field_errors": [
      {
        "field": "email",
        "error": "邮箱地址是必填项"
      },
      {
        "field": "password",
        "error": "密码是必填项"
      }
    ]
  }
}
```

#### 参数格式错误
```http
POST /api/v1/user/login
Content-Type: application/json
{
  "user_name": "testuser",
  "password": "" // 空密码
}

HTTP/1.1 400 Bad Request
{
  "code": 20101,
  "msg": "参数验证失败",
  "data": {
    "field_errors": [
      {
        "field": "password",
        "error": "密码长度不能少于8位"
      }
    ]
  }
}
```

### 3. 业务逻辑错误

#### 用户名已存在
```http
POST /api/v1/user/register
Content-Type: application/json
{
  "user_name": "existinguser",
  "email": "new@example.com",
  "password": "password123"
}

HTTP/1.1 400 Bad Request
{
  "code": 20101,
  "msg": "用户名已存在",
  "data": "该用户名已被注册，请选择其他用户名"
}
```

#### 邮箱验证码错误
```http
POST /api/v1/user/verifyEmailVerificationCode
Content-Type: application/json
{
  "email": "user@example.com",
  "verification_code": "123456" // 错误的验证码
}

HTTP/1.1 400 Bad Request
{
  "code": 20105,
  "msg": "邮箱验证码错误",
  "data": "验证码不正确，请重新输入"
}
```

### 4. 文件上传错误

#### 文件格式不支持
```http
POST /api/v1/photo/upload
Content-Type: multipart/form-data
--boundary
Content-Disposition: form-data; name="photos"; filename="document.pdf"
Content-Type: application/pdf

...PDF文件内容...
--boundary--

HTTP/1.1 400 Bad Request
{
  "code": 20201,
  "msg": "文件上传失败",
  "data": "不支持的文件格式，请上传JPG、PNG、GIF格式的图片"
}
```

#### 文件大小超限
```http
POST /api/v1/photo/upload
Content-Type: multipart/form-data
--boundary
Content-Disposition: form-data; name="photos"; filename="large_image.jpg"
Content-Type: image/jpeg

...超过5MB的图片内容...
--boundary--

HTTP/1.1 413 Request Entity Too Large
{
  "code": 20201,
  "msg": "文件上传失败",
  "data": "文件大小超过5MB限制，请压缩后重新上传"
}
```

## 错误处理最佳实践

### 客户端错误处理

```javascript
// 封装API请求函数
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    // 处理业务错误
    if (data.code !== 200) {
      handleBusinessError(data);
      throw new Error(data.msg);
    }

    return data.data;
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
}

// 业务错误处理
function handleBusinessError(error) {
  switch (error.code) {
    case 20118: // 访问令牌已过期
      refreshAccessToken();
      break;
    case 20120: // 刷新令牌已过期
      redirectToLogin();
      break;
    case 20114: // 账户被锁定
      showLockMessage(error.data);
      break;
    case 429: // 请求过于频繁
      showRateLimitMessage();
      break;
    default:
      showErrorMessage(error.msg);
  }
}

// 网络错误处理
function handleNetworkError(error) {
  if (error.name === 'TypeError') {
    showErrorMessage('网络连接失败，请检查网络设置');
  } else if (error.message.includes('timeout')) {
    showErrorMessage('请求超时，请稍后重试');
  } else {
    showErrorMessage('发生未知错误，请稍后重试');
  }
}
```

### 重试机制

```javascript
// 指数退避重试
async function retryRequest(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiRequest(url, options);
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }

      // 对于某些错误不进行重试
      if (error.code && [20101, 20002, 20104].includes(error.code)) {
        throw error;
      }

      // 指数退避等待时间
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 用户体验优化

```javascript
// 错误消息国际化
function getErrorMessage(error, locale = 'zh-CN') {
  const messages = {
    'zh-CN': {
      20002: '登录已过期，请重新登录',
      20104: '用户名或密码错误',
      20101: '参数错误，请检查输入',
      // ... 其他错误消息
    },
    'en-US': {
      20002: 'Login expired, please login again',
      20104: 'Invalid username or password',
      20101: 'Parameter error, please check input',
      // ... other error messages
    }
  };

  return messages[locale][error.code] || error.msg;
}
```

## 监控和日志

### 错误监控

```javascript
// 错误上报
function reportError(error, context = {}) {
  // 发送到监控系统
  fetch('/api/v1/error-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error_code: error.code,
      error_message: error.msg,
      error_data: error.data,
      user_agent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      context: context
    })
  });
}
```

### 日志分析

```go
// 服务器端错误日志记录
func logError(c *gin.Context, err error, errCode int) {
    logger.Error(
        "API Error",
        zap.Int("error_code", errCode),
        zap.String("error_message", err.Error()),
        zap.String("path", c.Request.URL.Path),
        zap.String("method", c.Request.Method),
        zap.String("ip", c.ClientIP()),
        zap.String("user_agent", c.GetHeader("User-Agent")),
        zap.Time("timestamp", time.Now()),
    )
}
```

## 故障排查指南

### 常见问题排查

1. **401错误**
   - 检查令牌是否存在且有效
   - 验证Authorization头格式
   - 确认令牌是否过期

2. **400错误**
   - 检查请求参数格式
   - 验证必填字段是否缺失
   - 确认参数值是否符合约束

3. **500错误**
   - 检查服务器日志
   - 确认数据库连接状态
   - 验证依赖服务是否正常

### 调试技巧

1. **使用调试工具**
   - 浏览器开发者工具
   - Postman/Insomnia等API工具
   - curl命令行工具

2. **日志分析**
   - 查看应用日志
   - 检查数据库日志
   - 分析网络请求日志

---

💡 **提示**: 建议在客户端实现完善的错误处理机制，提供友好的错误提示和恢复策略，提升用户体验。