# 部署配置文档

## 概述

本文档描述了 DreamZero Blog 后端服务的部署配置，包括环境配置、数据库设置、服务配置、监控部署等内容。

## 系统要求

### 硬件要求

| 配置 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 2核 | 4核以上 |
| 内存 | 4GB | 8GB以上 |
| 存储 | 20GB | 100GB以上 SSD |
| 网络 | 100Mbps | 1Gbps |

### 软件要求

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 8+)
- **Go语言**: 1.24.0+
- **数据库**: PostgreSQL 12+
- **缓存**: Redis 6.0+
- **消息队列**: Apache Kafka 2.8+
- **对象存储**: MinIO 或兼容S3的存储服务

## 环境配置

### 配置文件结构

```
config/
├── config_original.yaml     # 原始配置模板
├── config_local.yaml       # 本地开发环境
├── config_dev.yaml         # 开发环境
├── config_test.yaml        # 测试环境
├── config_pre.yaml         # 预发布环境
├── config_produce.yaml     # 生产环境
└── server.crt             # SSL证书（生产环境）
```

### 配置文件详解

#### 完整配置示例 (config_produce.yaml)

```yaml
# 应用配置
app:
  name: "DreamZero Blog Backend"
  run_mode: "produce"
  addr: "0.0.0.0"
  port: "9997"
  jwt_expiration_time: 30        # JWT过期时间（分钟）
  refresh_token_expiration: 720  # 刷新令牌过期时间（分钟）
  rsa_private_key_path: "/etc/ssl/private/blog_rsa_private_key.pem"
  rsa_public_key_path: "/etc/ssl/certs/blog_rsa_public_key.pem"
  log_output_dir: "/var/log/blog"

# MinIO对象存储配置
minio:
  endpoint: "minio.example.com:9000"
  access_key_id: "your_access_key"
  secret_access_key: "your_secret_key"
  use_ssl: true
  bucket_names:
    - "blog-images"
    - "blog-avatars"
  location: "us-east-1"

# 数据库配置
database:
  postgres:
    host: "postgres.example.com"
    port: "5432"
    username: "blog_user"
    password: "secure_password"
    db_name: "blog_production"
    sslmode: "require"
    auto_create_db: false
  gorm:
    log_level: "warn"
    log_output_dir: "/var/log/blog/gorm"

# Kafka消息队列配置
kafka:
  brokers:
    - "kafka1.example.com:9092"
    - "kafka2.example.com:9092"
    - "kafka3.example.com:9092"
  version: "2.8.0"
  client_id: "blog-server-produce"
  producer:
    retry_max: 3
    retry_backoff: 100
    required_acks: "all"
    timeout: 10s
    compression: "snappy"
  consumer:
    group_id: "blog-server-group-produce"
    auto_offset_reset: "latest"
    session_timeout: 30s
    heartbeat_interval: 3s
    rebalance_timeout: 60s
  tls:
    enable: true
    ca_file: "/etc/ssl/kafka/ca.pem"
    cert_file: "/etc/ssl/kafka/client-cert.pem"
    key_file: "/etc/ssl/kafka/client-key.pem"
    skip_verify: false

# Redis缓存配置
redis:
  addr: "redis.example.com:6379"
  password: "redis_password"
  db: 0
  dial_timeout: 5s
  read_timeout: 5s
  write_timeout: 5s
  pool_size: 50
  key_prefix: "blog:"

# 邮件服务配置
email:
  smtp_host: "smtp.gmail.com"
  smtp_port: 587
  smtp_username: "noreply@dreamzero.cn"
  smtp_password: "email_password"
  sender_name: "DreamZero Blog"
  sender_email: "noreply@dreamzero.cn"
  email_template: "/etc/blog/templates/email_template.html"
```

## 数据库部署

### PostgreSQL 安装配置

#### 1. 安装PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### 2. 创建数据库和用户

```sql
-- 创建数据库用户
CREATE USER blog_user WITH PASSWORD 'secure_password';

-- 创建数据库
CREATE DATABASE blog_production OWNER blog_user;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE blog_production TO blog_user;

-- 创建UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### 3. 数据库优化配置

```ini
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### 4. 连接池配置

```yaml
# 应用连接池配置
database:
  postgres:
    max_open_conns: 100
    max_idle_conns: 10
    conn_max_lifetime: 3600s
    conn_max_idle_time: 300s
```

## 缓存部署

### Redis 安装配置

#### 1. 安装Redis

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis
sudo systemctl enable redis
sudo systemctl start redis
```

#### 2. Redis配置优化

```conf
# /etc/redis/redis.conf
bind 127.0.0.1 10.0.0.1
port 6379
requirepass redis_password
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

#### 3. Redis集群配置

```bash
# 创建Redis集群
redis-cli --cluster create \
  10.0.1.1:6379 \
  10.0.1.2:6379 \
  10.0.1.3:6379 \
  10.0.1.4:6379 \
  10.0.1.5:6379 \
  10.0.1.6:6379 \
  --cluster-replicas 1
```

## 消息队列部署

### Kafka 安装配置

#### 1. 安装Kafka

```bash
# 下载Kafka
wget https://downloads.apache.org/kafka/2.8.0/kafka_2.13-2.8.0.tgz
tar -xzf kafka_2.13-2.8.0.tgz
sudo mv kafka_2.13-2.8.0 /opt/kafka

# 配置环境变量
echo 'export KAFKA_HOME=/opt/kafka' >> ~/.bashrc
echo 'export PATH=$PATH:$KAFKA_HOME/bin' >> ~/.bashrc
source ~/.bashrc
```

#### 2. Kafka配置

```properties
# server.properties
broker.id=1
listeners=PLAINTEXT://10.0.1.1:9092,SSL://10.0.1.1:9093
advertised.listeners=PLAINTEXT://kafka1.example.com:9092,SSL://kafka1.example.com:9093
zookeeper.connect=zookeeper1.example.com:2181,zookeeper2.example.com:2181,zookeeper3.example.com:2181
log.dirs=/var/kafka-logs
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
num.partitions=1
num.recovery.threads.per.data.dir=1
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=2
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
zookeeper.connection.timeout.ms=18000
```

#### 3. 创建主题

```bash
# 创建邮件发送主题
kafka-topics.sh --create \
  --bootstrap-server kafka1.example.com:9092 \
  --topic email-send \
  --partitions 3 \
  --replication-factor 3

# 创建操作日志主题
kafka-topics.sh --create \
  --bootstrap-server kafka1.example.com:9092 \
  --topic operation-logs \
  --partitions 6 \
  --replication-factor 3
```

## 对象存储部署

### MinIO 安装配置

#### 1. 安装MinIO

```bash
# 下载MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# 创建MinIO用户
sudo useradd -r minio-user -s /sbin/nologin
sudo mkdir /opt/minio
sudo chown minio-user:minio-user /opt/minio
```

#### 2. MinIO配置

```bash
# 设置环境变量
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=minioadmin123
export MINIO_VOLUMES="/opt/minio/data"
export MINIO_OPTS="--console-address :9001"

# 启动MinIO
sudo -u minio-user minio server $MINIO_VOLUMES $MINIO_OPTS
```

#### 3. 创建存储桶

```bash
# 使用MinIO客户端创建存储桶
mc alias set myminio http://localhost:9000 minioadmin minioadmin123
mc mb myminio/blog-images
mc mb myminio/blog-avatars
mc policy set public myminio/blog-images
```

## 应用部署

### 构建应用

```bash
# 克隆代码
git clone https://github.com/your-org/dreamzero-blog.git
cd dreamzero-blog/backend

# 构建应用
make build

# 验证构建
ls -la ./build/
```

### 系统服务配置

```ini
# /etc/systemd/system/blog-backend.service
[Unit]
Description=DreamZero Blog Backend
After=network.target postgresql.service redis.service kafka.service

[Service]
Type=simple
User=blog
Group=blog
WorkingDirectory=/opt/blog
ExecStart=/opt/blog/build/blog-server -c /etc/blog/config_produce.yaml
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# 启用和启动服务
sudo systemctl enable blog-backend
sudo systemctl start blog-backend
sudo systemctl status blog-backend
```

### Nginx反向代理配置

```nginx
# /etc/nginx/sites-available/blog-backend
server {
    listen 80;
    server_name api.dreamzero.cn;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.dreamzero.cn;

    # SSL证书配置
    ssl_certificate /etc/ssl/certs/blog-backend.crt;
    ssl_certificate_key /etc/ssl/private/blog-backend.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # API代理
    location / {
        proxy_pass http://127.0.0.1:9997;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # 文件上传配置
        client_max_body_size 10M;
        proxy_request_buffering off;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://127.0.0.1:9997;
    }

    # Swagger文档
    location /swagger/ {
        proxy_pass http://127.0.0.1:9997;
        proxy_set_header Host $host;
    }
}
```

## 监控部署

### 日志配置

```yaml
# 日志配置
logging:
  level: info
  format: json
  output:
    - type: file
      path: /var/log/blog/app.log
      max_size: 100MB
      max_backups: 10
      max_age: 30d
    - type: console
```

### 健康检查

```bash
# 健康检查脚本
#!/bin/bash
# /opt/scripts/health-check.sh

API_URL="http://127.0.0.1:9997/"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Service is healthy"
    exit 0
else
    echo "Service is unhealthy (HTTP $RESPONSE)"
    exit 1
fi
```

### Prometheus监控

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'blog-backend'
    static_configs:
      - targets: ['localhost:9997']
    metrics_path: '/metrics'
    scrape_interval: 10s
```

## 备份策略

### 数据库备份

```bash
#!/bin/bash
# /opt/scripts/backup-db.sh

BACKUP_DIR="/backup/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="blog_production"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
pg_dump -h localhost -U blog_user -d $DB_NAME | gzip > $BACKUP_DIR/blog_$DATE.sql.gz

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Database backup completed: blog_$DATE.sql.gz"
```

### 文件备份

```bash
#!/bin/bash
# /opt/scripts/backup-files.sh

BACKUP_DIR="/backup/files"
DATE=$(date +%Y%m%d_%H%M%S)
UPLOAD_DIR="/opt/blog/uploads"

# 备份上传文件
rsync -av --delete $UPLOAD_DIR/ $BACKUP_DIR/uploads/

echo "Files backup completed"
```

### 自动化备份

```cron
# /etc/crontab
# 每天凌晨2点备份数据库
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/backup.log 2>&1

# 每天凌晨3点备份文件
0 3 * * * /opt/scripts/backup-files.sh >> /var/log/backup.log 2>&1

# 每小时健康检查
0 * * * * /opt/scripts/health-check.sh >> /var/log/health-check.log 2>&1
```

## 安全配置

### SSL/TLS配置

```bash
# 生成RSA密钥对
openssl genrsa -out /etc/ssl/private/blog_rsa_private_key.pem 2048
openssl rsa -in /etc/ssl/private/blog_rsa_private_key.pem -pubout -out /etc/ssl/certs/blog_rsa_public_key.pem

# 设置权限
chmod 600 /etc/ssl/private/blog_rsa_private_key.pem
chmod 644 /etc/ssl/certs/blog_rsa_public_key.pem
```

### 防火墙配置

```bash
# UFW防火墙配置
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 9997/tcp  # API服务（仅内网）
```

## 性能调优

### 应用优化

```yaml
# 生产环境配置
app:
  read_timeout: 30s
  write_timeout: 30s
  max_header_bytes: 1048576
  max_concurrent_connections: 1000

database:
  postgres:
    max_open_conns: 100
    max_idle_conns: 20
    conn_max_lifetime: 3600s

redis:
  pool_size: 50
  dial_timeout: 5s
  read_timeout: 5s
  write_timeout: 5s
```

### 系统优化

```bash
# /etc/sysctl.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 5000
vm.swappiness = 10
fs.file-max = 2097152

# 应用配置
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf
```

## 故障排查

### 常见问题

1. **服务启动失败**
   ```bash
   # 检查服务状态
   sudo systemctl status blog-backend
   # 查看日志
   sudo journalctl -u blog-backend -f
   ```

2. **数据库连接失败**
   ```bash
   # 测试数据库连接
   psql -h localhost -U blog_user -d blog_production
   # 检查PostgreSQL状态
   sudo systemctl status postgresql
   ```

3. **Redis连接失败**
   ```bash
   # 测试Redis连接
   redis-cli -h localhost -p 6379 ping
   # 检查Redis状态
   sudo systemctl status redis
   ```

### 日志分析

```bash
# 查看应用日志
tail -f /var/log/blog/app.log

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 查看系统日志
tail -f /var/log/syslog
```

---

💡 **提示**: 建议在生产环境中使用容器化部署（Docker + Kubernetes）以提高可维护性和可扩展性。