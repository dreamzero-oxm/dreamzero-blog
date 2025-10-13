#!/usr/bin/env bash

set -e

echo "开始启动前端项目"
cd ./frontend && pnpm start && cd -
echo "前端项目启动完成"

wait
