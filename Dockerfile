# 指定node版本为21.7.1  | 注：node 中默认含 npm 等指令 | 注: 需要提前下载node 21.7.1 的镜像(docker pull node:12.7.1 / docker pull node:14 / ...)
FROM node:22.20.0-alpine

# 项目在docker里面的工作目录，/app 只是随意指定的目录而已
WORKDIR /app

# 把当前目录(第1个.)下的所有文件添加到docker里面的 /app  目录
COPY . .

# build docker 镜像时运行npm命令。这一步是在docker里面跑的命令
# 根据 package.json 自动安装所需依赖
RUN npm install
RUN npm run build
# RUN npm run start

EXPOSE 9999

# CMD [ "node", "app.js" ]
# 或等效于：
ENTRYPOINT [ "npm", "run", "start" ]