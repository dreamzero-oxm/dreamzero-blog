#!/usr/bin/env bash

set -e

# echo "开始启动前端项目"
# cd /blog/frontend && pnpm start &
# echo "前端项目启动中..."

echo "开始启动后端项目"
blog-server -c /app/backend/config/config_produce.yaml &
echo "后端项目启动中..."

# 等待所有后台进程完成
wait

echo "所有服务已启动"
