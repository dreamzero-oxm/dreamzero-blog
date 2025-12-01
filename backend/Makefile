SHELL := /bin/bash
BASEDIR = $(shell pwd)
# 静态项目名称，自定义项目名称
# PROJECT_NAME = "blog-go-backend"
# 动态项目名称，使用项目目录名称作为项目名称
PROJECT_NAME = $(shell head -n 1 go.mod | awk '{print $$2}')

# build with verison infos
# 如果不加 PROJECT_NAME ，直接写 "internal/version"，编译器就无法正确定位到这个包
versionDir = "${PROJECT_NAME}/internal/version"
# 各种信息
gitTag = $(shell if [ "`git describe --tags --abbrev=0 2>/dev/null`" != "" ];then git describe --tags --abbrev=0; else git log --pretty=format:'%h' -n 1; fi)
buildDate = $(shell TZ=Asia/Shanghai date +%FT%T%z)
gitCommit = $(shell git log --pretty=format:'%H' -n 1)
gitTreeState = $(shell if git status|grep -q 'clean';then echo clean; else echo dirty; fi)

# 写入对应的版本信息
ldflags="-w -X ${versionDir}.gitTag=${gitTag} -X ${versionDir}.buildDate=${buildDate} -X ${versionDir}.gitCommit=${gitCommit} -X ${versionDir}.gitTreeState=${gitTreeState}"

# PROJECT_NAME := "mlm.com"
PKG := "$(PROJECT_NAME)"

PKG_LIST := $(shell go list ${PKG}/... | grep -v /vendor/)
GO_FILES := $(shell find . -name '*.go' | grep -v /vendor/ | grep -v _test.go)

.PHONY: all
all: build

.PHONY: build
build: ## Build the binary file
	@mkdir -p ./build
	@swag init
	@echo ldflags: ${ldflags}
	@go build -o './build/${PROJECT_NAME}' -v -ldflags ${ldflags} .
	@gofmt -w .

.PHONY: oxm
oxm: ## Build the binary file
	@echo gitCommit: ${gitCommit}
	@echo PROJECT_NAME: ${PROJECT_NAME}

.PHONY: clean
clean:
	rm -f ./build/mlm-server
	rm cover.out coverage.txt
	find . -name "[._]*.s[a-w][a-z]" | xargs -i rm -f {}

.PHONY: test
test: ## view test result
	@go test -short -coverprofile cover.out -covermode=atomic ${PKG_LIST}
	@cat cover.out > coverage.txt
	@go tool cover -html=coverage.txt

.PHONY: docs
docs:
	@swag init
	@echo "gen-docs done"
	@echo "see docs by: http://localhost:8080/swagger/index.html"

.PHONY: ca
ca:
	openssl req -new -nodes -x509 -out config/server.crt -keyout config/server.key -days 3650 -subj "/C=DE/ST=NRW/L=Earth/O=Random Company/OU=IT/CN=127.0.0.1/emailAddress=xxxxx@qq.com"

.PHONY: install-hooks
install-hooks: ## Install git hooks
	@echo "Installing git hooks..."
	@../scripts/install-hooks.sh

.PHONY: help
help:
	@echo "make - compile the source code"
	@echo "make clean - remove binary file and vim swp files"
	@echo "make ca - generate ca files"
	@echo "make docs - gen swag doc"
	@echo "make test - go test"
	@echo "make build - go build"
	@echo "make install-hooks - install git hooks for code quality checks"


