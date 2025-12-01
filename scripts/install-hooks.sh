#!/bin/bash
#
# 前后端 Git Hooks 自动安装脚本
# 用于设置项目级别的代码质量检查
# 此脚本应该只在首次设置开发环境时运行一次，或在 hooks 更新后重新运行。
#
# 支持的功能：
# - 安装前端代码质量检查（ESLint）
# - 安装后端代码质量检查（golangci-lint）
# - 自动检测和安装相关依赖
# - 提供详细的安装反馈和错误处理

set -e

# 脚本颜色输出函数
print_status() {
    echo -e "\033[1;34m$1\033[0m"  # 蓝色
}

print_success() {
    echo -e "\033[1;32m$1\033[0m"  # 绿色
}

print_error() {
    echo -e "\033[1;31m$1\033[0m"  # 红色
}

print_warning() {
    echo -e "\033[1;33m$1\033[0m"  # 黄色
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/backend/git-hooks"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

print_status "开始安装前后端 Git Hooks..."
echo "项目根目录: $PROJECT_ROOT"
echo "Hooks 源文件目录: $HOOKS_DIR"
echo "Git Hooks 目标目录: $GIT_HOOKS_DIR"

# 检查是否在 Git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "错误：当前目录不是 Git 仓库"
    echo "请在 Git 仓库的根目录中运行此脚本"
    exit 1
fi

# 检查 hooks 目录是否存在
if [ ! -d "$HOOKS_DIR" ]; then
    print_error "错误：未找到 git-hooks 目录：$HOOKS_DIR"
    echo "请确保项目结构正确，或从版本控制系统重新克隆项目"
    exit 1
fi

# 创建 git hooks 目录（如果不存在）
mkdir -p "$GIT_HOOKS_DIR"

# 安装的计数器
installed_count=0
failed_count=0

print_status "正在安装前后端代码质量检查 hooks..."

# 复制可执行的 hook 文件到 .git/hooks
# 跳过 README.md 和其他文档文件
for hook in "$HOOKS_DIR"/*; do
    if [ -f "$hook" ] && [ "$(basename "$hook")" != "README.md" ] && [[ ! "$(basename "$hook")" =~ \.md$ ]]; then
        hook_name=$(basename "$hook")
        target_hook="$GIT_HOOKS_DIR/$hook_name"

        echo "正在安装 $hook_name..."
        if cp "$hook" "$target_hook"; then
            chmod +x "$target_hook"
            echo "✓ $hook_name 安装成功"
            ((installed_count++))
        else
            print_error "✗ $hook_name 安装失败"
            ((failed_count++))
        fi
    fi
done

# 检查前端环境
print_status "检查前端代码检查环境..."
frontend_path="$PROJECT_ROOT/frontend"
if [ -d "$frontend_path" ]; then
    if [ -f "$frontend_path/package.json" ]; then
        if [ ! -d "$frontend_path/node_modules" ]; then
            print_warning "前端依赖未安装，正在自动安装..."
            cd "$frontend_path"
            if command -v npm &> /dev/null; then
                npm install
                print_success "前端依赖安装完成"
            elif command -v yarn &> /dev/null; then
                yarn install
                print_success "前端依赖安装完成"
            else
                print_warning "未找到 npm 或 yarn，请手动安装前端依赖"
            fi
            cd "$PROJECT_ROOT"
        else
            print_success "前端环境已就绪"
        fi
    else
        print_warning "未找到 frontend/package.json，跳过前端环境检查"
    fi
else
    print_warning "未找到前端目录，跳过前端环境检查"
fi

# 检查后端环境
print_status "检查后端代码检查环境..."
backend_path="$PROJECT_ROOT/backend"
if [ -d "$backend_path" ]; then
    if [ -f "$backend_path/go.mod" ]; then
        # 检查 golangci-lint 是否已安装
        if command -v golangci-lint &> /dev/null; then
            print_success "后端 golangci-lint 已安装"
        else
            print_warning "golangci-lint 未安装"
            echo "安装方法："
            echo "  macOS: brew install golangci-lint"
            echo "  其他: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"
            echo "  或访问: https://golangci-lint.run/usage/install/"
        fi
    else
        print_warning "未找到 backend/go.mod，跳过后端环境检查"
    fi
else
    print_warning "未找到后端目录，跳过后端环境检查"
fi

# 显示安装结果
echo ""
if [ $installed_count -gt 0 ]; then
    print_success "Git Hooks 安装完成！"
    echo ""
    echo "已安装的 hooks："
    ls -1 "$GIT_HOOKS_DIR" | grep -v "\.sample$" | sed 's/^/- /'

    echo ""
    print_status "Hook 功能说明："
    echo "- pre-commit: 提交前自动运行前后端代码质量检查"
    echo "  • 前端: ESLint 检查 (TypeScript/Next.js)"
    echo "  • 后端: golangci-lint 检查 (Go)"

    echo ""
    echo "🔧 使用说明："
    echo "- 这些 hooks 会在每次 Git 操作前自动运行"
    echo "- 临时跳过 hooks: git commit --no-verify"
    echo "- 手动运行代码检查: ./scripts/lint-all.sh"
    echo "- 使用 Makefile: make lint-all"

else
    print_error "未安装任何 hooks"
fi

if [ $failed_count -gt 0 ]; then
    print_error "有 $failed_count 个 hooks 安装失败"
    echo "请检查文件权限和磁盘空间"
fi

echo ""
print_status "安装摘要："
echo "- 成功安装: $installed_count 个 hooks"
echo "- 安装失败: $failed_count 个 hooks"
echo "- 项目根目录: $PROJECT_ROOT"

if [ $installed_count -gt 0 ]; then
    print_success "🎉 前后端代码质量检查已配置完成！"
    echo "现在每次提交代码时都会自动检查代码质量。"
else
    exit 1
fi