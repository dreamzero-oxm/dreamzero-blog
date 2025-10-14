FROM ubuntu:22.04 AS base
USER root
SHELL ["/bin/bash", "-c"]

ARG NEED_MIRROR=0
ARG GO_VERSION=1.25.3

WORKDIR /blog

RUN mkdir -p /blog/frontend

# apt设置国内清华源
RUN if [ "$NEED_MIRROR" == "1" ]; then \
        sed -i 's|http://ports.ubuntu.com|http://mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list; \
        sed -i 's|http://archive.ubuntu.com|http://mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list; \
    fi; 

RUN --mount=type=cache,id=blog,target=/var/cache/apt,sharing=locked \
        apt-get update && \
        apt-get install -y --no-install-recommends curl \
	ca-certificates \
	git \
	make \
	gcc \
	build-essential  

# 安装npm
RUN --mount=type=cache,id=blog,target=/var/cache/apt,sharing=locked \
        curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
        apt purge -y nodejs npm && \
        apt autoremove -y && \
        apt-get update && \
        apt-get install -y nodejs  && \
        rm -rf /var/lib/apt/lists/*

# 设置npm国内淘宝镜像
RUN if [ "$NEED_MIRROR" == "1" ]; then \
        npm config set registry https://registry.npmmirror.com; \
    fi;

RUN npm install -g pnpm

# 安装后端项目依赖
# 安装go
RUN curl -fsSL https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz -o go.tgz && \
    tar -C /usr/local -xzf go.tgz && \
    rm go.tgz

ENV GOROOT=/usr/local/go
ENV GOPATH=/go
ENV PATH=$GOROOT/bin:$GOPATH/bin:$PATH

# NEED_MIRROR=1 时，设置goproxy
RUN if [ "$NEED_MIRROR" == "1" ]; then \
        export GOPROXY=https://goproxy.cn,direct; \
    fi;

RUN go install github.com/swaggo/swag/cmd/swag@latest

# 复制前端项目代码到/frontend目录
COPY . /blog/

# 切换到/frontend目录
WORKDIR /blog/frontend

# 安装前端项目依赖
RUN npm install

# 构建前端项目
RUN pnpm build

# 暴露端口
EXPOSE 3000

WORKDIR /blog/backend

# 安装后端项目依赖
RUN go mod tidy
RUN swag init
RUN make

EXPOSE 9997

WORKDIR /blog
COPY ./docker/entrypoint.sh /blog/entrypoint.sh
RUN chmod +x /blog/entrypoint.sh

# 或等效于：
ENTRYPOINT [ "./entrypoint.sh" ]
