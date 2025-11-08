# DreamZero Blog 部署指南

本文档描述了如何使用GitHub Actions CI/CD流程部署DreamZero Blog到生产环境。

## 前置条件

1. 拥有服务器访问权限
2. 在服务器上安装Docker和Docker Compose
3. 在GitHub仓库中配置必要的密钥

## GitHub仓库配置

在GitHub仓库的Settings > Secrets and variables > Actions中添加以下密钥：

- `PROD_HOST`: 生产服务器的主机名或IP地址
- `PROD_USERNAME`: 用于SSH登录的用户名
- `PROD_SSH_KEY`: 用于SSH登录的私钥

## 服务器准备

1. 在服务器上创建部署目录：
   ```bash
   sudo mkdir -p /opt/dreamzero-blog
   sudo chown $USER:$USER /opt/dreamzero-blog
   cd /opt/dreamzero-blog
   ```

2. 克隆项目仓库：
   ```bash
   git clone https://github.com/your-username/dreamzero-blog.git .
   ```

3. 创建生产环境变量文件：
   ```bash
   cp docker/.env.prod.example docker/.env.prod
   ```

4. 编辑生产环境变量文件，填入实际值：
   ```bash
   nano docker/.env.prod
   ```

5. 创建SSL证书目录（如果使用HTTPS）：
   ```bash
   mkdir -p docker/nginx/ssl
   # 将SSL证书文件放入此目录
   ```

## 部署流程

1. 当代码推送到`main`分支时，CI/CD流程会自动触发
2. 流程包括以下步骤：
   - 前端测试和构建
   - 后端测试和构建
   - 构建并推送Docker镜像
   - 部署到生产服务器

3. 部署脚本会执行以下操作：
   - 备份当前环境变量文件
   - 拉取最新Docker镜像
   - 停止旧容器
   - 启动新容器
   - 检查服务状态
   - 清理未使用的镜像和容器

## 手动部署

如果需要手动部署，可以在服务器上执行以下命令：

```bash
cd /opt/dreamzero-blog

git pull origin main

docker-compose -f docker/docker-compose.prod.yml pull
docker-compose -f docker/docker-compose.prod.yml down
docker-compose -f docker/docker-compose.prod.yml up -d
```

## 监控和日志

查看容器状态：
```bash
docker-compose -f docker/docker-compose.prod.yml ps
```

查看容器日志：
```bash
docker-compose -f docker/docker-compose.prod.yml logs -f
docker-compose -f docker/docker-compose.prod.yml logs -f [service_name]
```

## 故障排除

### 常见问题

1. **容器启动失败**
   - 检查环境变量配置是否正确
   - 查看容器日志：`docker-compose -f docker/docker-compose.prod.yml logs`

2. **无法访问网站**
   - 检查Nginx配置
   - 确认防火墙设置
   - 检查端口是否正确映射

3. **数据库连接失败**
   - 检查数据库服务是否运行
   - 确认数据库连接参数

### 回滚操作

如果新部署出现问题，可以快速回滚到上一个版本：

```bash
cd /opt/dreamzero-blog

# 查看可用的镜像版本
docker images | grep dreamzero-blog

# 修改docker-compose.prod.yml中的镜像标签为上一个版本
# 然后重新部署
docker-compose -f docker/docker-compose.prod.yml down
docker-compose -f docker/docker-compose.prod.yml up -d
```

## 性能优化

1. **启用Gzip压缩**：在Nginx配置中添加Gzip压缩
2. **配置缓存**：为静态资源设置适当的缓存头
3. **使用CDN**：考虑使用CDN加速静态资源
4. **数据库优化**：优化数据库查询和索引

## 安全建议

1. 定期更新依赖包
2. 使用强密码和密钥
3. 启用HTTPS
4. 定期备份数据
5. 监控安全漏洞