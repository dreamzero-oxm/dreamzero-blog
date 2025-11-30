# 用户管理 API 文档

## 概述

用户管理模块提供完整的用户生命周期管理功能，包括用户注册、登录、个人信息管理、密码修改、头像上传等功能。

## API 列表

### 1. 用户注册

创建新用户账户，需要邮箱验证码验证。

**接口路径**: `/api/v1/user/register`
**HTTP方法**: POST
**认证**: 无需认证
**Content-Type**: multipart/form-data

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|------|
| user_name | string | formData | 是 | 用户名，唯一标识符 | "john_doe" |
| password | string | formData | 是 | 密码，最少8位 | "password123" |
| email | string | formData | 是 | 邮箱地址 | "user@example.com" |
| nickname | string | formData | 否 | 昵称，默认为用户名 | "John Doe" |
| phone | string | formData | 否 | 手机号码 | "13800138000" |
| verification_code | string | formData | 是 | 邮箱验证码 | "123456" |

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "注册成功",
  "data": "用户注册成功"
}
```

**错误响应**:
```json
{
  "code": 20105,
  "msg": "邮箱验证码错误",
  "data": "验证码不正确或已过期"
}
```

### 2. 用户登录

用户登录验证，返回访问令牌和刷新令牌。

**接口路径**: `/api/v1/user/login`
**HTTP方法**: POST
**认证**: 无需认证
**Content-Type**: multipart/form-data

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|------|
| user_name | string | formData | 是 | 用户名或邮箱 | "john_doe" |
| password | string | formData | 是 | 密码 | "password123" |

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "success": true,
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_name": "john_doe",
      "nickname": "John Doe",
      "email": "user@example.com",
      "avatar": "",
      "bio": "",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应**:
```json
{
  "code": 20104,
  "msg": "用户名或密码错误",
  "data": "登录失败"
}
```

### 3. 刷新访问令牌

使用刷新令牌获取新的访问令牌和刷新令牌。

**接口路径**: `/api/v1/user/refreshToken`
**HTTP方法**: POST
**认证**: 无需认证
**Content-Type**: application/json

#### 请求参数

```json
{
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "令牌刷新成功",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. 验证访问令牌

验证当前访问令牌是否有效。

**接口路径**: `/api/v1/user/validateAccessToken`
**HTTP方法**: GET
**认证**: 需要 Bearer Token
**Content-Type**: application/json

#### 请求头

```
Authorization: Bearer {access_token}
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "令牌有效",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_name": "john_doe",
    "role": "user"
  }
}
```

### 5. 获取用户信息

获取当前登录用户的完整个人信息。

**接口路径**: `/api/v1/user/profile`
**HTTP方法**: GET
**认证**: 需要 Bearer Token

#### 请求头

```
Authorization: Bearer {access_token}
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_name": "john_doe",
    "nickname": "John Doe",
    "email": "user@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "这是我的个人简介",
    "website": "https://mywebsite.com",
    "location": "北京",
    "birthday": "1990-01-01",
    "gender": "男",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

### 6. 更新用户信息

更新当前登录用户的个人信息。

**接口路径**: `/api/v1/user/profile`
**HTTP方法**: PUT
**认证**: 需要 Bearer Token
**Content-Type**: application/json

#### 请求头

```
Authorization: Bearer {access_token}
```

#### 请求参数

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nickname": "新昵称",
  "email": "newemail@example.com",
  "phone": "13900139000",
  "bio": "更新后的个人简介",
  "website": "https://newwebsite.com",
  "location": "上海",
  "birthday": "1990-01-01",
  "gender": "女"
}
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "更新成功",
  "data": "用户信息更新成功"
}
```

### 7. 修改密码

修改当前登录用户的密码。

**接口路径**: `/api/v1/user/password`
**HTTP方法**: PUT
**认证**: 需要 Bearer Token
**Content-Type**: application/json

#### 请求头

```
Authorization: Bearer {access_token}
```

#### 请求参数

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "old_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "密码修改成功",
  "data": "密码已更新，请重新登录"
}
```

### 8. 上传头像

上传当前登录用户的头像图片。

**接口路径**: `/api/v1/user/avatar`
**HTTP方法**: POST
**认证**: 需要 Bearer Token
**Content-Type**: multipart/form-data

#### 请求头

```
Authorization: Bearer {access_token}
```

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 描述 | 限制 |
|--------|------|------|------|------|------|
| avatar | file | formData | 是 | 头像文件 | 支持 jpg/jpeg/png/gif，最大 5MB |

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "头像上传成功",
  "data": "https://example.com/uploads/avatar/123e4567-e89b-12d3-a456-426614174000.jpg"
}
```

### 9. 验证用户名是否存在

检查用户名是否已被注册。

**接口路径**: `/api/v1/user/checkUserName`
**HTTP方法**: GET
**认证**: 无需认证

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|------|
| user_name | string | query | 是 | 要检查的用户名 | "john_doe" |

#### 响应示例

**用户名已存在 (200)**:
```json
{
  "code": 200,
  "msg": "用户名已存在",
  "data": "exist"
}
```

**用户名不存在 (200)**:
```json
{
  "code": 200,
  "msg": "用户名可用",
  "data": "available"
}
```

### 10. 验证邮箱是否存在

检查邮箱是否已被注册。

**接口路径**: `/api/v1/user/checkUserEmail`
**HTTP方法**: GET
**认证**: 无需认证

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|------|
| email | string | query | 是 | 要检查的邮箱 | "user@example.com" |

#### 响应示例

**邮箱已存在 (200)**:
```json
{
  "code": 200,
  "msg": "邮箱已存在",
  "data": "exist"
}
```

**邮箱不存在 (200)**:
```json
{
  "code": 200,
  "msg": "邮箱可用",
  "data": "available"
}
```

### 11. 获取邮箱验证码

发送邮箱验证码用于注册或密码重置。

**接口路径**: `/api/v1/user/emailVerificationCode`
**HTTP方法**: POST
**认证**: 无需认证
**Content-Type**: multipart/form-data

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|------|
| email | string | formData | 是 | 邮箱地址 | "user@example.com" |

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "验证码发送成功",
  "data": "验证码已发送至您的邮箱"
}
```

### 12. 验证邮箱验证码

验证收到的邮箱验证码是否正确。

**接口路径**: `/api/v1/user/verifyEmailVerificationCode`
**HTTP方法**: POST
**认证**: 无需认证
**Content-Type**: multipart/form-data

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|------|
| email | string | formData | 是 | 邮箱地址 | "user@example.com" |
| verification_code | string | formData | 是 | 验证码 | "123456" |

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "验证码验证成功",
  "data": "验证成功"
}
```

### 13. 获取操作日志

获取当前登录用户的操作日志记录。

**接口路径**: `/api/v1/user/operation-logs`
**HTTP方法**: GET
**认证**: 需要 Bearer Token

#### 请求头

```
Authorization: Bearer {access_token}
```

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 默认值 | 描述 | 示例 |
|--------|------|------|------|--------|------|------|
| operation_type | string | query | 否 | - | 操作类型 | "login" |
| start_date | string | query | 否 | - | 开始日期 (YYYY-MM-DD) | "2024-01-01" |
| end_date | string | query | 否 | - | 结束日期 (YYYY-MM-DD) | "2024-01-31" |
| page | int | query | 否 | 1 | 页码 | 1 |
| page_size | int | query | 否 | 10 | 每页数量 | 20 |

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "list": [
      {
        "id": "log-id-1",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "operation_type": "login",
        "operation_detail": "用户登录",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "created_at": "2024-01-01T10:00:00Z"
      },
      {
        "id": "log-id-2",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "operation_type": "update_profile",
        "operation_detail": "更新个人信息",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "created_at": "2024-01-01T10:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

## 使用示例

### 完整的用户注册流程

```bash
# 1. 检查用户名是否可用
curl -X GET "http://127.0.0.1:9997/api/v1/user/checkUserName?user_name=john_doe"

# 2. 获取邮箱验证码
curl -X POST "http://127.0.0.1:9997/api/v1/user/emailVerificationCode" \
  -F "email=user@example.com"

# 3. 验证邮箱验证码
curl -X POST "http://127.0.0.1:9997/api/v1/user/verifyEmailVerificationCode" \
  -F "email=user@example.com" \
  -F "verification_code=123456"

# 4. 注册用户
curl -X POST "http://127.0.0.1:9997/api/v1/user/register" \
  -F "user_name=john_doe" \
  -F "password=password123" \
  -F "email=user@example.com" \
  -F "verification_code=123456"
```

### 登录和访问受保护的资源

```bash
# 1. 用户登录
LOGIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:9997/api/v1/user/login" \
  -F "user_name=john_doe" \
  -F "password=password123")

# 提取访问令牌
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token')

# 2. 获取用户信息
curl -X GET "http://127.0.0.1:9997/api/v1/user/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. 上传头像
curl -X POST "http://127.0.0.1:9997/api/v1/user/avatar" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg"
```

## 限流规则

| 接口 | 限流规则 | 时间窗口 |
|------|----------|----------|
| 登录 | 每IP 5次 | 1分钟 |
| 注册 | 每IP 3次 | 1分钟 |
| 验证码 | 每邮箱 1次 | 1分钟 |
| 其他接口 | 每IP 100次 | 1分钟 |

## 注意事项

1. **密码安全**: 密码采用 bcrypt 加密存储，建议使用强密码
2. **令牌有效期**:
   - 访问令牌有效期：5分钟
   - 刷新令牌有效期：1天
3. **邮箱验证**: 验证码有效期10分钟，每个邮箱每分钟只能发送一次
4. **头像上传**: 支持 jpg、jpeg、png、gif 格式，文件大小不超过 5MB
5. **个人信息更新**: 邮箱和用户名更新需要额外的验证步骤

## 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 20002 | 未认证或令牌无效 | 检查令牌是否正确或已过期 |
| 20101 | 参数错误 | 检查请求参数格式和必填字段 |
| 20104 | 用户名或密码错误 | 检查用户名和密码是否正确 |
| 20105 | 邮箱验证码错误 | 检查验证码是否正确 |
| 20106 | 邮箱验证码已过期 | 重新获取验证码 |
| 20114-20116 | 账户状态异常 | 联系管理员或查看具体错误信息 |

---

💡 **提示**: 更多技术细节请参考 [数据模型文档](./data-models.md) 和 [错误码文档](./error-codes.md)。