#!/bin/bash

echo "开始更新git版本"
git checkout main
git pull
echo "GIT版本更新结束"
echo "开始build"
npm i
pnpm build
echo "build结束"
echo "开始重启服务"
pm2 restart 0
