########## 构建阶段（builder）##########
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Asia/Shanghai

# --- 控制是否使用阿里镜像 ---
ARG NEED_MIRROR=0

# --- 修改镜像源（仅当 NEED_MIRROR=1 时启用） ---
RUN if [ "$NEED_MIRROR" = "1" ]; then \
        sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list && \
        sed -i 's/security.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list ; \
    else \
        echo "Using default Ubuntu sources"; \
    fi \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        build-essential \
        xz-utils \
        tar \
        wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# 2. 安装 Node.js + pnpm（工具层可缓存，使用国内源）
ARG NODE_VERSION=24.11.1
ARG PNPM_VERSION=9.15.4

ENV NODE_VERSION=${NODE_VERSION}

RUN if [ "$NEED_MIRROR" = "1" ]; then \
        echo "Using China node mirror (npmmirror)"; \
        NODE_URL="https://npmmirror.com/mirrors/node/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz"; \
        NPM_REGISTRY="https://registry.npmmirror.com"; \
    else \
        echo "Using official node mirror (nodejs.org)"; \
        NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz"; \
        NPM_REGISTRY="https://registry.npmjs.org"; \
    fi; \
    curl -fsSL "$NODE_URL" \
    | tar -xJ -C /usr/local --strip-components=1 \
    && npm config set registry "$NPM_REGISTRY" \
    && npm install -g pnpm@${PNPM_VERSION} \
    && pnpm config set registry "$NPM_REGISTRY"

# 3. 安装 Go（走国内镜像）
# 3. 安装 Go（支持 NEED_MIRROR）
ARG GO_VERSION=1.24.0
ENV GO_VERSION=${GO_VERSION}

RUN if [ "$NEED_MIRROR" = "1" ]; then \
        echo "Using China Go mirror (Aliyun)"; \
        GO_URL="https://mirrors.aliyun.com/golang/go${GO_VERSION}.linux-amd64.tar.gz"; \
    else \
        echo "Using official Go mirror (go.dev)"; \
        GO_URL="https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"; \
    fi; \
    curl -fsSL "$GO_URL" \
    | tar -xz -C /usr/local \
    && ln -s /usr/local/go/bin/go /usr/local/bin/go

# Go 环境变量 + GOPROXY 也按 NEED_MIRROR 切
ENV GOPATH=/go
ENV GO111MODULE=on
# 这里用默认值，运行时再根据 NEED_MIRROR 覆盖
ENV GOPROXY=https://proxy.golang.org,direct
ENV PATH="${GOPATH}/bin:/usr/local/go/bin:${PATH}"

# 如果你希望在构建阶段就固定好 GOPROXY，也可以加一条：
RUN if [ "$NEED_MIRROR" = "1" ]; then \
        echo "Using Aliyun GOPROXY"; \
        echo 'export GOPROXY=https://mirrors.aliyun.com/goproxy/,direct' >> /etc/profile.d/go_env.sh; \
    else \
        echo "Using default GOPROXY"; \
        echo 'export GOPROXY=https://proxy.golang.org,direct' >> /etc/profile.d/go_env.sh; \
    fi

# 4. 安装 swag（走 GOPROXY）
# 建议固定一个版本，构建更稳定，不要用 latest
RUN go install github.com/swaggo/swag/cmd/swag@v1.8.12


# 以上所有层都与业务代码无关，可长期缓存

WORKDIR /app/frontend

# 5. 缓存 Node 依赖
COPY frontend/package.json frontend/pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

WORKDIR /app/backend

# 6. 缓存 Go 依赖
COPY backend/go.mod backend/go.sum ./
RUN go mod download

WORKDIR /app

# 7. 再复制业务代码
COPY . .

# 8. 构建
RUN cd frontend \
    && pnpm build \
    && cd ../backend \
    && make

########## 运行阶段 ##########
FROM ubuntu:22.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Asia/Shanghai

ARG NEED_MIRROR=0

# 同样支持镜像源切换
RUN if [ "$NEED_MIRROR" = "1" ]; then \
        sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list && \
        sed -i 's/security.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list ; \
    else \
        echo "Using default Ubuntu sources"; \
    fi \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

# 复制后端文件
COPY --from=builder /app/backend/build/blog-server /usr/local/bin/blog-server
RUN chmod +x /usr/local/bin/blog-server
COPY --from=builder /app/backend/config /app/backend/config

# 复制前端out目录
COPY --from=builder /app/frontend/out ./frontend/out

# 复制 entrypoint.sh
COPY --from=builder /app/docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# 如有前端静态文件
# COPY --from=builder /app/dist ./dist

EXPOSE 9997
EXPOSE 9999

ENTRYPOINT [ "./entrypoint.sh" ]

