# 故障排除指南

## 概述

本文档提供了 DreamZero Blog Backend 项目的常见问题诊断和解决方案，帮助开发者快速定位和解决各类技术问题。

## 快速诊断清单

### 系统健康检查
```bash
# 1. 检查服务状态
systemctl status docker
docker-compose ps

# 2. 检查端口占用
netstat -tlnp | grep :8080

# 3. 检查磁盘空间
df -h

# 4. 检查内存使用
free -h

# 5. 检查系统负载
uptime
```

### 应用健康检查
```bash
# 1. API 健康检查
curl -f http://localhost:8080/health

# 2. 数据库连接检查
curl -f http://localhost:8080/health/db

# 3. Redis 连接检查
curl -f http://localhost:8080/health/redis

# 4. 文件存储检查
curl -f http://localhost:8080/health/storage
```

## 安装和环境问题

### 问题 1: Go 环境配置错误

**错误信息**:
```
go: command not found
or
go version go1.19 linux/amd64: version "go1.21" is required
```

**原因分析**:
- Go 未安装或版本不符合要求
- GOPATH 或 GOROOT 环境变量配置错误
- Go 未添加到系统 PATH

**解决方案**:

#### 方法一：安装 Go 1.21+
```bash
# Ubuntu/Debian
wget https://golang.org/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz

# 添加到环境变量
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
source ~/.bashrc

# 验证安装
go version
```

#### 方法二：使用版本管理器
```bash
# 安装 g (Go 版本管理器)
curl -sSL https://git.io/g-install | sh

# 安装 Go 1.21
g install 1.21

# 设置默认版本
g use 1.21
```

### 问题 2: Git Hooks 安装失败

**错误信息**:
```
Error: git-hooks directory not found
or
permission denied: ./scripts/install-hooks.sh
```

**原因分析**:
- 不在 Git 仓库中运行脚本
- 脚本没有执行权限
- git-hooks 目录不存在

**解决方案**:

#### 检查环境
```bash
# 1. 确认在 Git 仓库中
pwd
git status

# 2. 检查目录结构
ls -la
ls -la git-hooks/

# 3. 检查脚本权限
ls -la scripts/install-hooks.sh
```

#### 修复权限和路径
```bash
# 1. 添加执行权限
chmod +x scripts/install-hooks.sh
chmod +x git-hooks/pre-commit

# 2. 如果目录不存在，重新克隆
cd /path/to/projects
git clone <repository-url>
cd blog-project/backend

# 3. 重新安装 hooks
make install-hooks
```

### 问题 3: 依赖下载失败

**错误信息**:
```
module xxx: not found
or
go: inconsistent vendoring
```

**原因分析**:
- 网络连接问题
- Go Module 缓存问题
- 依赖版本冲突

**解决方案**:

#### 清理和重新下载
```bash
# 1. 清理模块缓存
go clean -modcache

# 2. 重新下载依赖
go mod download
go mod tidy

# 3. 验证依赖
go mod verify
```

#### 配置代理（国内用户）
```bash
# 设置 Go 代理
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOSUMDB=sum.golang.google.cn

# 重新下载依赖
go mod download
```

## 数据库相关问题

### 问题 1: 数据库连接失败

**错误信息**:
```
dial tcp: lookup mysql: no such host
or
connection refused
or
access denied for user
```

**原因分析**:
- 数据库服务未启动
- 连接配置错误
- 网络连接问题
- 认证信息错误

**解决方案**:

#### 检查数据库服务
```bash
# 1. 检查 MySQL 服务状态
systemctl status mysql
# 或
systemctl status mariadb

# 2. 启动数据库服务
sudo systemctl start mysql

# 3. 设置开机自启
sudo systemctl enable mysql
```

#### 检查连接配置
```bash
# 1. 测试数据库连接
mysql -h localhost -u root -p

# 2. 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES;"

# 3. 创建数据库
mysql -u root -p -e "CREATE DATABASE blog_db;"

# 4. 创建用户
mysql -u root -p -e "CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON blog_db.* TO 'blog_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

#### 修复配置文件
```yaml
# config/database.yaml
database:
  driver: "mysql"
  host: "localhost"
  port: 3306
  username: "blog_user"
  password: "your-password"
  dbname: "blog_db"
  charset: "utf8mb4"
  parse_time: true
  loc: "Local"
```

### 问题 2: 数据库迁移失败

**错误信息**:
```
Error 1146: Table 'xxx' doesn't exist
or
migration failed: duplicate column name
```

**原因分析**:
- 数据库表不存在
- 迁移脚本错误
- 重复执行迁移

**解决方案**:

#### 重新初始化数据库
```bash
# 1. 删除现有数据库（小心操作）
mysql -u root -p -e "DROP DATABASE IF EXISTS blog_db;"

# 2. 重新创建数据库
mysql -u root -p -e "CREATE DATABASE blog_db;"

# 3. 运行迁移
make migrate

# 4. 验证表结构
mysql -u blog_user -p blog_db -e "SHOW TABLES;"
```

#### 手动执行迁移
```bash
# 1. 查找迁移文件
find . -name "*migration*" -o -name "*migrate*"

# 2. 手动执行 SQL
mysql -u blog_user -p blog_db < migrations/001_create_tables.sql
```

### 问题 3: 数据库性能问题

**症状**:
- API 响应缓慢
- 数据库查询超时
- 高 CPU 使用率

**诊断步骤**:

#### 检查慢查询
```sql
-- 1. 启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- 2. 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log%';
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- 3. 分析查询计划
EXPLAIN SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT 10;
```

#### 优化索引
```sql
-- 1. 分析表结构
SHOW CREATE TABLE articles;

-- 2. 查看索引使用情况
SHOW INDEX FROM articles;

-- 3. 添加缺失的索引
CREATE INDEX idx_articles_status_created ON articles(status, created_at);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
```

## Redis 相关问题

### 问题 1: Redis 连接失败

**错误信息**:
```
dial tcp: lookup redis: no such host
or
connection refused
```

**解决方案**:

#### 检查 Redis 服务
```bash
# 1. 检查 Redis 状态
systemctl status redis

# 2. 启动 Redis
sudo systemctl start redis

# 3. 测试连接
redis-cli ping

# 4. 检查配置
redis-cli CONFIG GET "*"
```

#### 修复 Docker Compose 配置
```yaml
# docker-compose.yml
services:
  redis:
    image: redis:6.2-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
```

### 问题 2: Redis 内存不足

**症状**:
- 应用启动后 Redis 连接断开
- 内存使用率过高

**解决方案**:

#### 检查内存使用
```bash
# 1. 查看 Redis 内存信息
redis-cli INFO memory

# 2. 查看键的内存使用
redis-cli MEMORY USAGE key_name

# 3. 查看所有键
redis-cli KEYS "*"
```

#### 配置内存限制
```bash
# 1. 配置 Redis 配置文件
echo "maxmemory 512mb" >> /etc/redis/redis.conf
echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf

# 2. 重启 Redis
sudo systemctl restart redis

# 3. 验证配置
redis-cli CONFIG GET maxmemory
```

## 应用运行问题

### 问题 1: 应用启动失败

**错误信息**:
```
panic: listen: address already in use
or
config file not found
```

**诊断和解决**:

#### 检查端口占用
```bash
# 1. 查看端口占用
netstat -tlnp | grep :8080
lsof -i :8080

# 2. 停止占用进程
sudo kill -9 <PID>

# 3. 或者更改应用端口
export PORT=8081
go run main.go
```

#### 检查配置文件
```bash
# 1. 检查配置文件是否存在
ls -la config/

# 2. 创建配置文件
cp config/app.yaml.example config/app.yaml
cp config/database.yaml.example config/database.yaml
cp config/redis.yaml.example config/redis.yaml

# 3. 验证配置文件语法
cat config/app.yaml
```

### 问题 2: API 500 错误

**症状**:
- API 请求返回 500 状态码
- 应用日志显示 panic 错误

**诊断步骤**:

#### 查看应用日志
```bash
# 1. 查看 Docker 日志
docker-compose logs app

# 2. 实时查看日志
docker-compose logs -f app

# 3. 查看应用文件日志
tail -f logs/app.log
tail -f logs/error.log
```

#### 开启详细日志
```go
// 在配置中启用详细日志
if config.Env == "development" {
    gin.SetMode(gin.DebugMode)
    gin.DefaultWriter = gin.DefaultWriter
}
```

#### 使用调试器
```bash
# 1. 安装 delve
go install github.com/go-delve/delve/cmd/dlv@latest

# 2. 调试运行
dlv debug main.go

# 3. 或测试运行
dlv test
```

### 问题 3: 内存泄漏

**症状**:
- 应用内存使用持续增长
- 最终导致 OOM (Out of Memory)

**诊断工具**:

#### Go pprof 分析
```bash
# 1. 添加 pprof 端点
import _ "net/http/pprof"

# 2. 启用 pprof
go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()

# 3. 分析内存
go tool pprof http://localhost:6060/debug/pprof/heap
```

#### 监控内存使用
```bash
# 1. 使用 top 命令
top -p $(pgrep main)

# 2. 使用 ps 命令
ps aux | grep main

# 3. 使用 /proc 文件系统
cat /proc/$(pgrep main)/status
```

## 文件上传问题

### 问题 1: 文件上传失败

**错误信息**:
```
file size exceeds limit
or
unsupported file type
```

**解决方案**:

#### 检查文件配置
```yaml
# config/app.yaml
upload:
  max_size: 10485760  # 10MB
  allowed_types: ["jpg", "jpeg", "png", "gif"]
  upload_path: "./uploads"
```

#### 检查目录权限
```bash
# 1. 检查上传目录
ls -la uploads/

# 2. 创建目录并设置权限
mkdir -p uploads/photos
chmod 755 uploads/
chmod 755 uploads/photos/

# 3. 检查磁盘空间
df -h
```

### 问题 2: MinIO 连接问题

**错误信息**:
```
MinIO server is not initialized
or
connection timeout
```

**解决方案**:

#### 检查 MinIO 服务
```bash
# 1. 检查 MinIO 容器
docker-compose ps minio

# 2. 查看 MinIO 日志
docker-compose logs minio

# 3. 测试 MinIO 连接
curl http://localhost:9000/minio/health/live
```

#### 重新初始化 MinIO
```bash
# 1. 停止 MinIO
docker-compose down minio

# 2. 清理数据（谨慎操作）
docker volume rm blog-project_minio_data

# 3. 重新启动
docker-compose up -d minio
```

## 性能问题

### 问题 1: 响应时间过长

**诊断步骤**:

#### 分析 API 性能
```bash
# 1. 使用 curl 测试响应时间
curl -w "@curl-format.txt" http://localhost:8080/api/v1/articles

# curl-format.txt 文件内容
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

#### 数据库查询优化
```sql
-- 1. 查看慢查询
SHOW PROCESSLIST;

-- 2. 分析查询计划
EXPLAIN SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT 10;

-- 3. 添加索引
CREATE INDEX idx_articles_status_created ON articles(status, created_at);
```

#### 缓存优化
```go
// 1. 检查缓存命中
func (s *ArticleService) GetArticles(page, pageSize int) ([]Article, error) {
    cacheKey := fmt.Sprintf("articles:page:%d:size:%d", page, pageSize)

    // 先从缓存获取
    if cached, err := s.redis.Get(cacheKey).Result(); err == nil {
        var articles []Article
        json.Unmarshal([]byte(cached), &articles)
        return articles, nil
    }

    // 缓存未命中，从数据库获取
    articles, err := s.getFromDB(page, pageSize)
    if err != nil {
        return nil, err
    }

    // 写入缓存
    if data, err := json.Marshal(articles); err == nil {
        s.redis.Set(cacheKey, data, 5*time.Minute)
    }

    return articles, nil
}
```

### 问题 2: 高并发问题

**症状**:
- 高并发时出现 502 错误
- 数据库连接池耗尽
- Redis 连接超时

**解决方案**:

#### 调整连接池
```go
// 数据库连接池配置
db.SetMaxIdleConns(20)
db.SetMaxOpenConns(100)
db.SetConnMaxLifetime(time.Hour)

// Redis 连接池配置
rdb := redis.NewClient(&redis.Options{
    PoolSize:     50,
    MinIdleConns: 10,
    PoolTimeout:  4 * time.Second,
})
```

#### 添加限流
```go
// 使用 gin-limit 中间件
import "github.com/aviddiviner/gin-limit"

func main() {
    r := gin.New()

    // 全局限流
    r.Use(limit.MaxAllowed(1000))

    // API 限流
    api := r.Group("/api/v1")
    api.Use(limit.MaxAllowed(500))
}
```

#### 负载均衡
```nginx
# nginx.conf
upstream backend {
    server backend1:8080 weight=1;
    server backend2:8080 weight=1;
    server backend3:8080 weight=1;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 日志和监控问题

### 问题 1: 日志文件过大

**解决方案**:

#### 配置日志轮转
```bash
# 1. 配置 logrotate
sudo vim /etc/logrotate.d/blog-app

# 文件内容
/path/to/app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 app app
    postrotate
        kill -USR1 $(cat /var/run/app.pid)
    endscript
}
```

#### 使用日志级别
```go
// 配置日志级别
switch config.Env {
case "development":
    log.SetLevel(logrus.DebugLevel)
case "production":
    log.SetLevel(logrus.InfoLevel)
}
```

### 问题 2: 监控数据异常

**诊断步骤**:

#### 检查指标收集
```bash
# 1. 检查 Prometheus 指标
curl http://localhost:8080/metrics

# 2. 检查应用指标
curl http://localhost:8080/debug/pprof/heap

# 3. 检查系统资源
htop
iostat -x 1
```

#### 配置告警
```yaml
# prometheus.yml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "alert_rules.yml"

# alert_rules.yml
groups:
- name: blog_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
```

## 安全相关问题

### 问题 1: JWT Token 验证失败

**错误信息**:
```
token is expired
or
invalid token
```

**解决方案**:

#### 检查 Token 配置
```go
// 确保密钥一致
jwtSecret := []byte(config.JWT.Secret)

// 检查 Token 过期时间
token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
    return jwtSecret, nil
})
```

#### Token 刷新机制
```go
func (s *AuthService) RefreshToken(refreshToken string) (*TokenResponse, error) {
    // 验证 refresh token
    claims := &Claims{}
    token, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(s.jwtSecret), nil
    })

    if err != nil || !token.Valid {
        return nil, errors.New("invalid refresh token")
    }

    // 生成新的 access token
    return s.generateToken(claims.UserID)
}
```

### 问题 2: CSRF 攻击

**防护措施**:

```go
// 添加 CSRF 防护
func CSRFMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "DELETE" {
            token := c.GetHeader("X-CSRF-Token")
            if !validateCSRFToken(token, c) {
                c.JSON(http.StatusForbidden, gin.H{"error": "CSRF token invalid"})
                c.Abort()
                return
            }
        }
        c.Next()
    }
}
```

## 网络相关问题

### 问题 1: 容器间通信失败

**错误信息**:
```
dial tcp: lookup app: no such host
```

**解决方案**:

#### 检查 Docker 网络
```bash
# 1. 查看网络
docker network ls

# 2. 查看容器网络
docker network inspect <network_name>

# 3. 测试容器间连接
docker exec -it <container_name> ping <other_container_name>
```

#### 修复 Docker Compose 配置
```yaml
version: '3.8'

services:
  app:
    depends_on:
      - db
      - redis
    networks:
      - app-network

  db:
    networks:
      - app-network

  redis:
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 问题 2: 外部访问失败

**检查步骤**:

```bash
# 1. 检查防火墙
sudo ufw status
sudo firewall-cmd --list-all

# 2. 检查端口映射
docker-compose ps

# 3. 检查 Nginx 配置
nginx -t
systemctl status nginx
```

## 紧急故障处理

### 快速恢复脚本

```bash
#!/bin/bash
# emergency-recovery.sh

set -e

echo "Starting emergency recovery..."

# 1. 备份当前状态
BACKUP_DIR="/opt/backups/emergency-$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
docker-compose ps > $BACKUP_DIR/services.txt
docker-compose logs --tail=100 > $BACKUP_DIR/logs.txt

# 2. 重启所有服务
docker-compose restart

# 3. 等待服务启动
sleep 30

# 4. 健康检查
if curl -f http://localhost:8080/health; then
    echo "Recovery successful"
else
    echo "Recovery failed, switching to backup"
    # 这里可以添加切换到备用服务器的逻辑
fi

echo "Emergency recovery completed"
```

### 回滚操作

```bash
#!/bin/bash
# rollback.sh

set -e

BACKUP_VERSION=$1

if [ -z "$BACKUP_VERSION" ]; then
    echo "Usage: $0 <backup-version>"
    echo "Available backups:"
    ls -la /opt/backups/
    exit 1
fi

echo "Rolling back to version: $BACKUP_VERSION"

# 1. 停止当前服务
docker-compose down

# 2. 恢复代码
git checkout $BACKUP_VERSION

# 3. 恢复数据库
mysql -u root -p blog_db < /opt/backups/db_backup_$BACKUP_VERSION.sql

# 4. 恢复文件
tar -xzf /opt/backups/files_backup_$BACKUP_VERSION.tar.gz

# 5. 重启服务
docker-compose up -d

echo "Rollback completed"
```

这个故障排除指南涵盖了从安装到运行的各类常见问题，帮助开发者快速定位和解决问题。