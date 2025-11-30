# 数据模型文档

## 概述

本文档详细描述了 DreamZero Blog 系统中使用的所有数据模型结构，包括数据库表结构、字段定义、约束关系和数据流转规则。

## 核心数据模型

### 1. User（用户模型）

用户模型存储系统的用户信息，包括个人资料、认证信息、状态管理等。

#### 表结构

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    bio VARCHAR(255),
    website VARCHAR(255),
    location VARCHAR(100),
    birthday VARCHAR(20),
    gender VARCHAR(10),
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'user', 'guest')),
    status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP NOT NULL,
    last_logout TIMESTAMP NOT NULL,
    login_count INTEGER NOT NULL DEFAULT 0,
    failed_login_count INTEGER NOT NULL DEFAULT 0,
    last_failed_login TIMESTAMP,
    last_failed_reason VARCHAR(255),
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lock_until TIMESTAMP,
    deleted_by VARCHAR(255),
    deleted_reason VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### JSON结构

```json
{
  "id": "string (UUID)",
  "user_name": "string (用户名，唯一)",
  "nickname": "string (昵称)",
  "email": "string (邮箱地址)",
  "phone": "string (手机号)",
  "avatar": "string (头像URL)",
  "bio": "string (个人简介)",
  "website": "string (个人网站)",
  "location": "string (所在地)",
  "birthday": "string (生日，格式: YYYY-MM-DD)",
  "gender": "string (性别: 男/女/其他)",
  "role": "string (角色: admin/user/guest)",
  "status": "string (状态: active/inactive/suspended)",
  "last_login": "datetime (最后登录时间)",
  "last_logout": "datetime (最后登出时间)",
  "login_count": "integer (登录次数)",
  "failed_login_count": "integer (失败登录次数)",
  "last_failed_login": "datetime (最后失败登录时间)",
  "last_failed_reason": "string (最后失败原因)",
  "is_locked": "boolean (是否被锁定)",
  "lock_until": "datetime (锁定截止时间)",
  "is_active": "boolean (是否已激活)",
  "created_at": "datetime (创建时间)",
  "updated_at": "datetime (更新时间)"
}
```

#### 字段说明

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 用户唯一标识符 |
| user_name | VARCHAR(50) | UNIQUE NOT NULL | 用户登录名，全局唯一 |
| password | VARCHAR(255) | NOT NULL | 加密后的密码（bcrypt） |
| nickname | VARCHAR(50) | NOT NULL | 用户昵称，默认等于用户名 |
| email | VARCHAR(100) | NOT NULL | 邮箱地址，用于找回密码等 |
| phone | VARCHAR(20) | NULL | 手机号码，可选 |
| avatar | VARCHAR(255) | NULL | 头像图片URL |
| bio | VARCHAR(255) | NULL | 个人简介 |
| website | VARCHAR(255) | NULL | 个人网站地址 |
| location | VARCHAR(100) | NULL | 所在地 |
| birthday | VARCHAR(20) | NULL | 生日，格式YYYY-MM-DD |
| gender | VARCHAR(10) | NULL | 性别：男/女/其他 |
| role | VARCHAR(10) | NOT NULL | 用户角色：admin/user/guest |
| status | VARCHAR(10) | NOT NULL | 用户状态：active/inactive/suspended |
| is_locked | BOOLEAN | NOT NULL DEFAULT FALSE | 账户是否被锁定 |
| lock_until | TIMESTAMP | NULL | 锁定截止时间 |

#### 角色权限

| 角色 | 权限描述 |
|------|----------|
| admin | 系统管理员，拥有所有权限 |
| user | 普通用户，可创建和管理自己的内容 |
| guest | 访客，只能查看公开内容 |

### 2. Article（文章模型）

文章模型存储博客文章的完整信息，包括内容、状态、统计等。

#### 表结构

```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    cover_image VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'private')),
    tags TEXT[],
    like_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMP,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### JSON结构

```json
{
  "id": "string (UUID)",
  "title": "string (文章标题)",
  "content": "string (文章内容，支持Markdown)",
  "summary": "string (文章摘要)",
  "cover_image": "string (封面图片URL)",
  "status": "string (状态: draft/published/private)",
  "tags": ["string", "array (标签数组)"],
  "like_count": "integer (点赞数)",
  "view_count": "integer (浏览数)",
  "published_at": "datetime (发布时间)",
  "user_id": "string (作者用户ID)",
  "created_at": "datetime (创建时间)",
  "updated_at": "datetime (更新时间)",
  "user": {
    "id": "string",
    "user_name": "string",
    "nickname": "string",
    "avatar": "string"
  }
}
```

#### 状态说明

| 状态 | 描述 | 可见性 |
|------|------|--------|
| draft | 草稿 | 仅作者可见 |
| published | 已发布 | 所有用户可见 |
| private | 私有 | 仅作者和指定用户可见 |

### 3. ArticleComment（文章评论模型）

评论模型存储用户对文章的评论信息。

#### 表结构

```sql
CREATE TABLE article_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_name VARCHAR(50),
    user_email VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    is_notify BOOLEAN NOT NULL DEFAULT FALSE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_pass BOOLEAN NOT NULL DEFAULT FALSE,
    notified_at TIMESTAMP,
    passed_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### JSON结构

```json
{
  "id": "string (UUID)",
  "article_title": "string (文章标题)",
  "content": "string (评论内容)",
  "user_name": "string (评论者用户名)",
  "user_email": "string (评论者邮箱)",
  "ip_address": "string (IP地址)",
  "user_agent": "string (浏览器信息)",
  "is_notify": "boolean (是否已发送通知)",
  "is_read": "boolean (是否已读)",
  "is_pass": "boolean (是否通过审核)",
  "notified_at": "datetime (通知时间)",
  "passed_at": "datetime (审核通过时间)",
  "read_at": "datetime (读取时间)",
  "created_at": "datetime (创建时间)",
  "updated_at": "datetime (更新时间)"
}
```

### 4. DailyPhotograph（日常照片模型）

照片模型存储用户上传的图片信息。

#### 表结构

```sql
CREATE TABLE daily_photographs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    width INTEGER,
    height INTEGER,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### JSON结构

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
  "user_id": "string (上传者用户ID)",
  "created_at": "datetime (上传时间)",
  "updated_at": "datetime (更新时间)"
}
```

### 5. OperationLog（操作日志模型）

日志模型记录用户的操作行为，用于审计和分析。

#### 表结构

```sql
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) NOT NULL,
    operation_detail TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### JSON结构

```json
{
  "id": "string (UUID)",
  "user_id": "string (操作用户ID)",
  "operation_type": "string (操作类型)",
  "operation_detail": "string (操作详情)",
  "ip_address": "string (IP地址)",
  "user_agent": "string (浏览器信息)",
  "created_at": "datetime (操作时间)"
}
```

#### 操作类型

| 操作类型 | 描述 |
|----------|------|
| login | 用户登录 |
| logout | 用户登出 |
| register | 用户注册 |
| update_profile | 更新个人信息 |
| change_password | 修改密码 |
| create_article | 创建文章 |
| update_article | 更新文章 |
| delete_article | 删除文章 |
| like_article | 点赞文章 |
| upload_photo | 上传图片 |
| add_comment | 添加评论 |

## 关系图

```
Users (用户)
├── Articles (文章) - 1:N
│   └── ArticleComments (评论) - 1:1 (通过article_title)
├── DailyPhotographs (照片) - 1:N
└── OperationLogs (操作日志) - 1:N
```

## 数据库约束

### 外键约束

1. **articles.user_id** → **users.id** (CASCADE DELETE)
2. **daily_photographs.user_id** → **users.id** (CASCADE DELETE)
3. **operation_logs.user_id** → **users.id** (CASCADE DELETE)

### 检查约束

1. **users.role**: IN ('admin', 'user', 'guest')
2. **users.status**: IN ('active', 'inactive', 'suspended')
3. **articles.status**: IN ('draft', 'published', 'private')

### 唯一约束

1. **users.user_name**: 唯一用户名
2. **users.email**: 唯一邮箱地址

## 索引设计

### 主要索引

```sql
-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- 文章表索引
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_like_count ON articles(like_count DESC);
CREATE INDEX idx_articles_view_count ON articles(view_count DESC);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);

-- 评论表索引
CREATE INDEX idx_comments_article_title ON article_comments(article_title);
CREATE INDEX idx_comments_is_pass ON article_comments(is_pass);
CREATE INDEX idx_comments_is_read ON article_comments(is_read);
CREATE INDEX idx_comments_created_at ON article_comments(created_at DESC);

-- 照片表索引
CREATE INDEX idx_photos_user_id ON daily_photographs(user_id);
CREATE INDEX idx_photos_created_at ON daily_photographs(created_at DESC);

-- 日志表索引
CREATE INDEX idx_logs_user_id ON operation_logs(user_id);
CREATE INDEX idx_logs_operation_type ON operation_logs(operation_type);
CREATE INDEX idx_logs_created_at ON operation_logs(created_at DESC);
```

## 数据迁移

### 版本控制

使用GORM的AutoMigrate功能自动管理数据库结构迁移：

```go
// 自动迁移所有模型
err := db.AutoMigrate(
    &User{},
    &Article{},
    &ArticleComment{},
    &DailyPhotograph{},
    &OperationLog{},
)
```

### 迁移脚本

```sql
-- v1.0 to v1.1 迁移示例
ALTER TABLE articles ADD COLUMN seo_title VARCHAR(255);
ALTER TABLE articles ADD COLUMN seo_description TEXT;
CREATE INDEX idx_articles_seo_title ON articles(seo_title);

-- 更新现有数据
UPDATE articles SET seo_title = title WHERE seo_title IS NULL;
```

## 数据备份策略

### 自动备份

```bash
# 每日全量备份
pg_dump -h localhost -U postgres -d www_dreamzero_cn > backup_$(date +%Y%m%d).sql

# 每小时增量备份（WAL归档）
archive_command = 'cp %p /backup/wal_archive/%f'
```

### 备份保留策略

- **日备份**: 保留30天
- **周备份**: 保留12周
- **月备份**: 保留12个月

## 性能优化建议

### 查询优化

1. **分页查询**: 使用LIMIT和OFFSET进行分页
2. **索引利用**: 确保查询使用适当的索引
3. **连接池**: 配置合适的数据库连接池大小

### 存储优化

1. **分区表**: 对大表进行时间分区
2. **冷热分离**: 历史数据迁移到冷存储
3. **压缩**: 对文本字段使用压缩存储

### 缓存策略

1. **Redis缓存**: 热门文章和用户信息缓存
2. **应用缓存**: 配置信息和静态数据缓存
3. **CDN**: 图片和静态资源CDN分发

## 数据安全

### 敏感数据保护

1. **密码加密**: 使用bcrypt加密存储
2. **个人信息**: 遵循GDPR等隐私保护法规
3. **访问控制**: 基于角色的访问控制（RBAC）

### 审计日志

1. **操作记录**: 记录所有关键操作
2. **数据变更**: 记录重要数据的变更历史
3. **访问日志**: 记录敏感数据的访问情况

---

💡 **提示**: 在开发过程中，请遵循数据模型的定义和约束，确保数据的一致性和完整性。