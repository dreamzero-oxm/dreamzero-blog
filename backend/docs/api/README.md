# DreamZero Blog API 文档

## 📋 文档总览

本文档描述了 DreamZero Blog 后端服务的完整 API 接口，包括用户管理、文章管理、评论管理、图片管理等功能模块。

## 🏗️ API基础信息

- **服务名称**: DreamZero Blog Backend
- **版本号**: v1.0
- **基础路径**: /api/v1
- **服务地址**: http://127.0.0.1:9997
- **在线文档**: http://127.0.0.1:9997/swagger/index.html

## 🔧 接口规范

### 基础信息
- **协议**: HTTP/HTTPS
- **请求/响应格式**: JSON
- **认证方式**: JWT Bearer Token
- **字符编码**: UTF-8

### 认证机制
```http
Authorization: Bearer {access_token}
```

### 通用响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

## 📚 文档目录

| 模块 | 文档 | 描述 |
|------|------|------|
| [用户管理](./user-api.md) | `user-api.md` | 用户注册、登录、个人信息管理 |
| [文章管理](./article-api.md) | `article-api.md` | 文章的增删改查、状态管理 |
| [评论管理](./comment-api.md) | `comment-api.md` | 评论的添加和查询 |
| [图片管理](./photo-api.md) | `photo-api.md` | 图片上传和管理 |
| [数据模型](./data-models.md) | `data-models.md` | 数据库模型结构定义 |
| [错误码说明](./error-codes.md) | `error-codes.md` | 错误码对照表和说明 |
| [部署配置](./deployment.md) | `deployment.md` | 部署配置和环境说明 |

## 🚀 快速开始

### 1. 用户注册
```http
POST /api/v1/user/register
Content-Type: multipart/form-data

user_name=example&password=password123&email=user@example.com
```

### 2. 用户登录
```http
POST /api/v1/user/login
Content-Type: multipart/form-data

user_name=example&password=password123
```

### 3. 创建文章
```http
POST /api/v1/articles
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "我的第一篇文章",
  "content": "文章内容...",
  "summary": "文章摘要",
  "status": "draft"
}
```

### 4. 获取文章列表
```http
GET /api/v1/articles?page=1&page_size=10
```

## 🛡️ 安全特性

- **密码加密**: bcrypt 加密存储
- **JWT认证**: RSA256 算法签名
- **限流保护**: IP 级别和接口级别限流
- **输入验证**: 防止 SQL 注入、XSS 攻击
- **HTTPS支持**: 生产环境强制 HTTPS

## 📊 性能特性

- **Redis缓存**: 用户会话、热门文章缓存
- **连接池**: 数据库连接池管理
- **消息队列**: Kafka 异步处理
- **结构化日志**: Zap 日志库

## 🔄 版本信息

- **当前版本**: v1.0
- **发布日期**: 2024-01-01
- **更新日志**: 参考各模块文档

## 📞 联系信息

- **维护者**: MOITY
- **邮箱**: ouxiangming_moi@foxmail.com
- **项目地址**: http://www.moity-soeoe.com
- **许可证**: Apache 2.0

---

💡 **提示**: 建议先阅读 [数据模型文档](./data-models.md) 了解数据结构，然后查看对应模块的 API 文档。