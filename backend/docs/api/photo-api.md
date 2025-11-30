# 图片管理 API 文档

## 概述

图片管理模块提供图片上传和列表查询功能。支持单张或多张图片上传，自动生成图片访问链接，并记录上传时间等信息。主要用于用户头像、文章配图、日常照片等图片资源的管理。

## API 列表

### 1. 上传图片

上传一张或多张图片到服务器，支持 jpg、jpeg、png、gif 等常见图片格式。

**接口路径**: `/api/v1/photo/upload`
**HTTP方法**: POST
**认证**: 无需认证
**Content-Type**: multipart/form-data

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 描述 | 限制 |
|--------|------|------|------|------|------|
| photos | file | formData | 是 | 图片文件（支持多文件） | 单个文件最大5MB |

#### 支持的图片格式

- **JPEG/JPG**: 推荐用于照片，文件较小
- **PNG**: 支持透明背景，适合图标和截图
- **GIF**: 支持动画，适合简单动画效果
- **WebP**: 现代格式，压缩率更高

#### 文件大小限制

- **单文件最大**: 5MB
- **总大小**: 每次请求最大20MB
- **数量限制**: 每次最多上传10张图片

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "上传成功",
  "data": [
    "https://example.com/uploads/photos/20240101_001.jpg",
    "https://example.com/uploads/photos/20240101_002.png"
  ]
}
```

**错误响应 (400)**:
```json
{
  "code": 20201,
  "msg": "文件上传失败",
  "data": "文件格式不支持或文件大小超过限制"
}
```

### 2. 获取图片列表

获取已上传的图片列表，支持分页和时间排序。

**接口路径**: `/api/v1/photo/list`
**HTTP方法**: GET
**认证**: 无需认证
**Content-Type**: application/json

#### 请求参数

| 参数名 | 类型 | 位置 | 必填 | 默认值 | 描述 | 示例 |
|--------|------|------|------|--------|------|------|
| page | int | query | 否 | 1 | 页码 | 2 |
| page_size | int | query | 否 | 20 | 每页数量 | 50 |
| sort | string | query | 否 | "desc" | 排序方式：asc/desc | "desc" |
| date | string | query | 否 | - | 按日期筛选（YYYY-MM-DD） | "2024-01-01" |

#### 响应示例

**成功响应 (200)**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": "photo-001",
      "title": "Go语言学习笔记",
      "image_url": "https://example.com/uploads/photos/20240101_go-notes.jpg",
      "file_name": "20240101_go-notes.jpg",
      "file_size": 1024000,
      "file_type": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "created_at": "2024-01-01T10:30:00Z",
      "updated_at": "2024-01-01T10:30:00Z"
    },
    {
      "id": "photo-002",
      "title": "微服务架构图",
      "image_url": "https://example.com/uploads/photos/20240102_microservices.png",
      "file_name": "20240102_microservices.png",
      "file_size": 2560000,
      "file_type": "image/png",
      "width": 2560,
      "height": 1440,
      "created_at": "2024-01-02T14:20:00Z",
      "updated_at": "2024-01-02T14:20:00Z"
    }
  ]
}
```

**错误响应 (500)**:
```json
{
  "code": 20203,
  "msg": "获取图片列表失败",
  "data": "服务器内部错误，请稍后重试"
}
```

## 数据模型详情

### DailyPhotograph（图片模型）

```json
{
  "id": "string (UUID)",
  "title": "string (图片标题)",
  "image_url": "string (图片访问URL)",
  "file_name": "string (原文件名)",
  "file_size": "integer (文件大小，字节)",
  "file_type": "string (文件类型)",
  "width": "integer (图片宽度)",
  "height": "integer (图片高度)",
  "created_at": "datetime (上传时间)",
  "updated_at": "datetime (更新时间)"
}
```

## 使用示例

### 单张图片上传

```bash
# 上传单张图片
curl -X POST "http://127.0.0.1:9997/api/v1/photo/upload" \
  -F "photos=@/path/to/image.jpg"

# 响应示例
{
  "code": 200,
  "msg": "上传成功",
  "data": ["https://example.com/uploads/photos/20240101_001.jpg"]
}
```

### 多张图片上传

```bash
# 同时上传多张图片
curl -X POST "http://127.0.0.1:9997/api/v1/photo/upload" \
  -F "photos=@/path/to/image1.jpg" \
  -F "photos=@/path/to/image2.png" \
  -F "photos=@/path/to/image3.gif"

# 响应示例
{
  "code": 200,
  "msg": "上传成功",
  "data": [
    "https://example.com/uploads/photos/20240101_001.jpg",
    "https://example.com/uploads/photos/20240101_002.png",
    "https://example.com/uploads/photos/20240101_003.gif"
  ]
}
```

### 获取图片列表

```bash
# 获取最新图片列表（默认倒序）
curl -X GET "http://127.0.0.1:9997/api/v1/photo/list"

# 分页获取图片
curl -X GET "http://127.0.0.1:9997/api/v1/photo/list?page=2&page_size=10"

# 按日期筛选图片
curl -X GET "http://127.0.0.1:9997/api/v1/photo/list?date=2024-01-01"

# 正序获取图片（最旧在前）
curl -X GET "http://127.0.0.1:9997/api/v1/photo/list?sort=asc"
```

## 文件存储配置

### 存储路径结构

```
uploads/
├── photos/           # 通用图片存储
│   ├── 2024/01/     # 按年月分目录
│   │   ├── 20240101_001.jpg
│   │   ├── 20240101_002.png
│   │   └── ...
│   └── 2024/02/
├── avatars/          # 用户头像存储
│   ├── user-123.jpg
│   ├── user-456.png
│   └── ...
└── temp/             # 临时文件存储
    └── upload_temp/
```

### 文件命名规则

- **通用图片**: `YYYYMMDD_序号.扩展名` (如: 20240101_001.jpg)
- **用户头像**: `user-{用户ID}.扩展名` (如: user-123.jpg)
- **临时文件**: `temp_{时间戳}_{随机数}.扩展名`

### URL访问规则

```
# 基础URL格式
https://example.com/uploads/{type}/{path}

# 示例
https://example.com/uploads/photos/2024/01/20240101_001.jpg
https://example.com/uploads/avatars/user-123.jpg
```

## 图片处理功能

### 自动处理

1. **格式转换**: 自动转换为WebP格式（在支持的浏览器中）
2. **尺寸优化**: 根据显示需求自动调整尺寸
3. **压缩优化**: 自动进行有损/无损压缩
4. **缩略图生成**: 自动生成多种尺寸的缩略图

### 支持的尺寸

| 尺寸类型 | 宽度 | 高度 | 用途 |
|----------|------|------|------|
| 原图 | 原始宽度 | 原始高度 | 完整显示 |
| 大图 | 1920px | 自动缩放 | 主页大图 |
| 中图 | 800px | 自动缩放 | 文章配图 |
| 小图 | 300px | 自动缩放 | 缩略图 |
| 头像 | 200px | 200px | 用户头像 |

### CDN支持

```bash
# 原始URL
https://example.com/uploads/photos/20240101_001.jpg

# CDN URL（如果配置了CDN）
https://cdn.example.com/photos/20240101_001.jpg
```

## 安全措施

### 文件类型验证

- **文件扩展名**: 检查文件扩展名是否在允许列表中
- **MIME类型**: 检查HTTP Content-Type是否匹配
- **文件头验证**: 检查文件魔数确保文件类型正确
- **病毒扫描**: 上传后进行病毒扫描（如果配置）

### 内容安全

- **EXIF信息**: 自动清除图片中的位置等敏感信息
- **图片内容**: 使用AI检测不当内容（如果配置）
- **访问控制**: 支持私有图片访问控制

### 存储安全

- **访问权限**: 设置适当的文件访问权限
- **备份策略**: 定期备份重要图片
- **存储监控**: 监控存储空间使用情况

## 限流规则

| 操作 | 限流规则 | 时间窗口 |
|------|----------|----------|
| 图片上传 | 每IP 10次 | 1分钟 |
| 图片上传 | 每IP 100次 | 1小时 |
| 获取图片列表 | 每IP 200次 | 1分钟 |

## 性能优化

### 缓存策略

- **静态文件缓存**: 设置适当的HTTP缓存头
- **CDN缓存**: 利用CDN加速全球访问
- **内存缓存**: 热门图片缓存在内存中
- **数据库索引**: 为查询字段建立索引

### 存储优化

- **对象存储**: 使用MinIO等对象存储服务
- **分布式存储**: 支持多节点分布式存储
- **冷热分离**: 历史图片迁移到冷存储

## 使用场景

### 1. 用户头像上传

```bash
# 用户登录后上传头像
curl -X POST "http://127.0.0.1:9997/api/v1/user/avatar" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg"
```

### 2. 文章配图上传

```bash
# 上传文章配图
curl -X POST "http://127.0.0.1:9997/api/v1/photo/upload" \
  -F "photos=@/path/to/article-image.jpg"

# 创建文章时使用图片URL
curl -X POST "http://127.0.0.1:9997/api/v1/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "技术分享",
    "content": "![配图](https://example.com/uploads/photos/20240101_001.jpg)",
    "cover_image": "https://example.com/uploads/photos/20240101_001.jpg",
    "status": "draft"
  }'
```

### 3. 日常照片管理

```bash
# 上传日常照片
curl -X POST "http://127.0.0.1:9997/api/v1/photo/upload" \
  -F "photos=@/path/to/daily-photo.jpg"

# 获取照片列表
curl -X GET "http://127.0.0.1:9997/api/v1/photo/list?page=1&page_size=20"
```

## 注意事项

1. **文件大小**: 单个图片文件不超过5MB
2. **格式建议**: 推荐使用JPEG格式照片，PNG适合图标
3. **命名规范**: 上传后会自动重命名，无需考虑命名冲突
4. **版权声明**: 上传的图片应确保拥有相应的使用版权
5. **隐私保护**: 避免上传包含个人隐私信息的图片
6. **存储空间**: 定期清理不需要的图片以节省存储空间

## 相关错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 20201 | 文件上传失败 | 检查文件格式和大小是否符合要求 |
| 20203 | 获取图片列表失败 | 服务器内部错误，请稍后重试 |
| 20101 | 参数错误 | 检查请求参数格式 |
| 413 | 请求实体过大 | 减少文件大小或分批上传 |
| 415 | 不支持的媒体类型 | 使用支持的图片格式 |

---

💡 **提示**: 为了获得最佳的上传体验，建议在上传前对图片进行适当的压缩和格式转换。