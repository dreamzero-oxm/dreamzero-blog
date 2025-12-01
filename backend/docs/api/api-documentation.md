# API 文档

## 概述

DreamZero Blog Backend API 提供完整的博客管理功能，包括文章管理、用户认证、照片上传等核心功能。API 遵循 RESTful 设计原则，使用 JSON 格式进行数据交换。

## 基础信息

- **Base URL**: `http://localhost:8080/api/v1`
- **API 版本**: v1
- **认证方式**: JWT Token
- **内容类型**: `application/json`
- **字符编码**: UTF-8

## 认证机制

### JWT Token 认证

所有需要认证的 API 都需要在请求头中包含 JWT Token：

```http
Authorization: Bearer <your-jwt-token>
```

#### Token 获取
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

#### Token 刷新
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 具体数据内容
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "error",
  "error": "detailed error message"
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      // 数据列表
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

## API 端点

### 1. 用户认证模块

#### 1.1 用户登录
```http
POST /api/v1/auth/login
```

**请求参数**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh-token-string",
    "expires_at": "2024-01-02T00:00:00Z"
  }
}
```

#### 1.2 用户注册
```http
POST /api/v1/auth/register
```

**请求参数**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirm_password": "string"
}
```

#### 1.3 刷新 Token
```http
POST /api/v1/auth/refresh
```

#### 1.4 用户登出
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### 2. 文章管理模块

#### 2.1 获取文章列表
```http
GET /api/v1/articles?page=1&page_size=10&category_id=1&status=published
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `page_size`: 每页数量 (默认: 10, 最大: 100)
- `category_id`: 分类ID (可选)
- `status`: 文章状态 (published/draft, 可选)
- `search`: 搜索关键词 (可选)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "文章标题",
        "summary": "文章摘要",
        "content": "文章内容",
        "status": "published",
        "view_count": 100,
        "like_count": 10,
        "comment_count": 5,
        "category": {
          "id": 1,
          "name": "技术"
        },
        "tags": [
          {
            "id": 1,
            "name": "Go"
          }
        ],
        "author": {
          "id": 1,
          "username": "admin",
          "avatar": "avatar-url"
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

#### 2.2 获取单篇文章
```http
GET /api/v1/articles/{id}
```

#### 2.3 创建文章
```http
POST /api/v1/articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "文章标题",
  "summary": "文章摘要",
  "content": "文章内容",
  "status": "published",
  "category_id": 1,
  "tags": [1, 2, 3]
}
```

#### 2.4 更新文章
```http
PUT /api/v1/articles/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新的文章标题",
  "summary": "更新的文章摘要",
  "content": "更新的文章内容",
  "status": "published",
  "category_id": 1,
  "tags": [1, 2, 3]
}
```

#### 2.5 删除文章
```http
DELETE /api/v1/articles/{id}
Authorization: Bearer <token>
```

#### 2.6 文章点赞
```http
POST /api/v1/articles/{id}/like
Authorization: Bearer <token>
```

#### 2.7 取消点赞
```http
DELETE /api/v1/articles/{id}/like
Authorization: Bearer <token>
```

### 3. 评论管理模块

#### 3.1 获取文章评论
```http
GET /api/v1/articles/{id}/comments?page=1&page_size=10
```

#### 3.2 创建评论
```http
POST /api/v1/articles/{id}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "评论内容",
  "parent_id": null  // 回复评论时填写父评论ID
}
```

#### 3.3 删除评论
```http
DELETE /api/v1/comments/{id}
Authorization: Bearer <token>
```

### 4. 照片管理模块

#### 4.1 获取照片列表
```http
GET /api/v1/photos?page=1&page_size=10&category_id=1
```

#### 4.2 上传照片
```http
POST /api/v1/photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary-data>
title: "照片标题"
description: "照片描述"
category_id: 1
```

**响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": 1,
    "title": "照片标题",
    "description": "照片描述",
    "url": "https://example.com/uploads/photos/2024/01/01/photo.jpg",
    "thumbnail_url": "https://example.com/uploads/photos/2024/01/01/photo_thumb.jpg",
    "size": 1024000,
    "category": {
      "id": 1,
      "name": "风景"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.3 删除照片
```http
DELETE /api/v1/photos/{id}
Authorization: Bearer <token>
```

### 5. 每日照片模块

#### 5.1 获取今日照片
```http
GET /api/v1/daily-photograph/today
```

#### 5.2 获取每日照片历史
```http
GET /api/v1/daily-photograph/history?page=1&page_size=10
```

#### 5.3 设置今日照片
```http
POST /api/v1/daily-photograph/set
Authorization: Bearer <token>
Content-Type: application/json

{
  "photo_id": 1
}
```

### 6. 用户管理模块

#### 6.1 获取用户信息
```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

#### 6.2 更新用户信息
```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "new-email@example.com",
  "avatar": "avatar-url",
  "bio": "个人简介"
}
```

#### 6.3 修改密码
```http
PUT /api/v1/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "旧密码",
  "new_password": "新密码",
  "confirm_password": "确认新密码"
}
```

## 错误代码

### 通用错误代码

| 代码 | 含义 | 说明 |
|------|------|------|
| 200 | 成功 | 请求成功处理 |
| 400 | 请求错误 | 请求参数错误或格式不正确 |
| 401 | 未授权 | 缺少有效的认证信息 |
| 403 | 禁止访问 | 没有权限访问该资源 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 409 | 冲突 | 资源冲突或重复 |
| 422 | 验证失败 | 请求参数验证失败 |
| 429 | 请求过多 | 超出请求频率限制 |
| 500 | 服务器错误 | 服务器内部错误 |

### 业务错误代码

| 代码 | 含义 | 说明 |
|------|------|------|
| 1001 | 用户不存在 | 用户ID不存在 |
| 1002 | 密码错误 | 用户密码不正确 |
| 1003 | 用户已存在 | 用户名或邮箱已存在 |
| 1004 | Token无效 | JWT Token无效或过期 |
| 2001 | 文章不存在 | 文章ID不存在 |
| 2002 | 无权限操作 | 没有权限操作该文章 |
| 3001 | 照片上传失败 | 文件格式或大小不符合要求 |
| 3002 | 存储空间不足 | 对象存储空间不足 |

## 限流策略

### 通用限流
- **频率**: 1000 请求/小时/IP
- **限制**: 超出后返回 429 错误

### 上传限流
- **频率**: 100 文件/小时/用户
- **大小限制**: 单文件最大 10MB
- **格式限制**: jpg, jpeg, png, gif

### 认证限流
- **登录尝试**: 5 次/分钟/IP
- **Token刷新**: 10 次/小时/用户

## 分页规范

### 请求参数
```http
GET /api/v1/articles?page=1&page_size=10
```

- `page`: 页码，从1开始，默认为1
- `page_size`: 每页数量，默认为10，最大为100

### 响应格式
```json
{
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

## 文件上传规范

### 支持格式
- **图片**: jpg, jpeg, png, gif, webp
- **文档**: pdf, doc, docx (如支持)

### 大小限制
- **图片**: 最大 10MB
- **文档**: 最大 50MB

### 上传响应
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": 1,
    "filename": "example.jpg",
    "url": "https://example.com/uploads/2024/01/01/example.jpg",
    "size": 1024000,
    "mime_type": "image/jpeg"
  }
}
```

## 搜索功能

### 全文搜索
```http
GET /api/v1/search?q=关键词&type=articles&page=1&page_size=10
```

**参数说明**:
- `q`: 搜索关键词 (必需)
- `type`: 搜索类型 (articles, photos, users, 可选)
- `page`, `page_size`: 分页参数

**搜索响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "results": [
      {
        "type": "article",
        "id": 1,
        "title": "匹配的文章标题",
        "summary": "文章摘要...",
        "highlight": "包含<em>关键词</em>的片段",
        "score": 0.95
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

## Webhook 支持

### 文章发布 Webhook
```http
POST {webhook_url}
Content-Type: application/json
X-Signature: sha256=<signature>

{
  "event": "article.published",
  "data": {
    "article_id": 1,
    "title": "文章标题",
    "url": "https://example.com/articles/1",
    "published_at": "2024-01-01T00:00:00Z"
  }
}
```

### 签名验证
Webhook 请求包含 `X-Signature` 头，使用 HMAC-SHA256 算法：
```go
signature := hmacSha256(secretKey, requestBody)
```

## SDK 和客户端示例

### Go 客户端
```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type BlogClient struct {
    BaseURL string
    Token   string
}

func (c *BlogClient) GetArticles(page, pageSize int) (*ArticlesResponse, error) {
    url := fmt.Sprintf("%s/api/v1/articles?page=%d&page_size=%d",
        c.BaseURL, page, pageSize)

    req, _ := http.NewRequest("GET", url, nil)
    req.Header.Set("Authorization", "Bearer "+c.Token)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result ArticlesResponse
    json.NewDecoder(resp.Body).Decode(&result)

    return &result, nil
}
```

### JavaScript 客户端
```javascript
class BlogAPI {
    constructor(baseURL, token) {
        this.baseURL = baseURL;
        this.token = token;
    }

    async getArticles(page = 1, pageSize = 10) {
        const response = await fetch(
            `${this.baseURL}/api/v1/articles?page=${page}&page_size=${pageSize}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.json();
    }

    async createArticle(articleData) {
        const response = await fetch(
            `${this.baseURL}/api/v1/articles`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(articleData)
            }
        );

        return response.json();
    }
}
```

## API 版本管理

### 版本策略
- URL路径版本: `/api/v1/`, `/api/v2/`
- 向后兼容: 保持至少2个主版本
- 废弃通知: 提前3个月通知废弃

### 版本差异
```http
# v1 API
GET /api/v1/articles

# v2 API (可能的变化)
GET /api/v2/articles?include=author,tags
```

## 开发和测试

### Swagger 文档
- **本地访问**: http://localhost:8080/swagger/index.html
- **JSON格式**: http://localhost:8080/swagger/doc.json

### 测试环境
- **测试服务器**: https://api-test.blog.com
- **测试账号**:
  - 用户名: test@example.com
  - 密码: test123456

### Postman Collection
提供完整的 Postman 集合，包含所有 API 端点的示例请求。

## API 使用最佳实践

### 1. 错误处理
```javascript
try {
    const response = await blogAPI.getArticles();
    if (response.code !== 200) {
        console.error('API Error:', response.error);
        return;
    }
    // 处理成功响应
} catch (error) {
    console.error('Network Error:', error);
}
```

### 2. Token 管理
```javascript
// 自动刷新 Token
async function makeAPIRequest(url, options = {}) {
    let token = localStorage.getItem('access_token');

    if (isTokenExpired(token)) {
        token = await refreshAccessToken();
        localStorage.setItem('access_token', token);
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    return fetch(url, options);
}
```

### 3. 分页加载
```javascript
async function loadMoreArticles(currentPage) {
    const response = await blogAPI.getArticles(currentPage + 1);
    if (response.data.list.length === 0) {
        // 没有更多数据
        return false;
    }
    // 追加到现有列表
    return response.data.list;
}
```

这个 API 文档为前端开发者和第三方集成提供了完整的接口参考和最佳实践指导。