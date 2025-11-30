# Install Hooks 操作指南

## 概述

`install-hooks` 是项目的自动化 Git Hooks 安装系统，确保所有团队成员使用相同的代码质量检查配置。本文档详细介绍了安装过程、技术实现和故障排除。

## 快速开始

### 一键安装
```bash
make install-hooks
```

### 手动安装
```bash
./scripts/install-hooks.sh
```

## 详细安装流程

### 前置条件检查

安装脚本会自动验证以下条件：

#### 1. Git 仓库验证
```bash
# 获取 Git 目录路径
git rev-parse --git-dir
# 预期输出: /path/to/.git
```

#### 2. 项目结构验证
```bash
# 检查项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/git-hooks"
```

#### 3. 文件存在性检查
```bash
# 验证 hooks 源目录
if [ ! -d "$HOOKS_DIR" ]; then
    echo "Error: git-hooks directory not found at $HOOKS_DIR"
    exit 1
fi
```

### 安装步骤详解

#### 步骤 1: 环境初始化
```bash
# 1.1 确定脚本位置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1.2 确定项目根目录
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 1.3 设置路径变量
HOOKS_DIR="$PROJECT_ROOT/git-hooks"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
```

#### 步骤 2: 目录准备
```bash
# 创建 Git hooks 目录（如果不存在）
mkdir -p "$GIT_HOOKS_DIR"
```

#### 步骤 3: 文件过滤和复制
```bash
# 遍历 git-hooks 目录中的所有文件
for hook in "$HOOKS_DIR"/*; do
    # 条件检查：
    # - 必须是文件 [ -f "$hook" ]
    # - 不能是 README.md [ "$(basename "$hook")" != "README.md" ]
    # - 不能是 .md 文件 [[ ! "$(basename "$hook")" =~ \.md$ ]]

    if [ -f "$hook" ] && [ "$(basename "$hook")" != "README.md" ] && [[ ! "$(basename "$hook")" =~ \.md$ ]]; then
        hook_name=$(basename "$hook")
        target_hook="$GIT_HOOKS_DIR/$hook_name"

        # 复制文件
        cp "$hook" "$target_hook"

        # 设置执行权限
        chmod +x "$target_hook"

        echo "✓ $hook_name installed"
    fi
done
```

#### 步骤 4: 结果验证
```bash
# 显示已安装的 hooks
ls -1 "$GIT_HOOKS_DIR" | grep -v "\.sample$" | sed 's/^/- /'
```

## 技术实现细节

### 脚本变量说明

| 变量 | 作用 | 示例值 |
|------|------|--------|
| `SCRIPT_DIR` | 脚本所在目录 | `/path/to/backend/scripts` |
| `PROJECT_ROOT` | 项目根目录 | `/path/to/backend` |
| `HOOKS_DIR` | hooks 源文件目录 | `/path/to/backend/git-hooks` |
| `GIT_HOOKS_DIR` | Git hooks 目标目录 | `/path/to/.git/hooks` |

### 文件处理逻辑

#### 支持的 Hook 类型
- `pre-commit` - 提交前检查
- `pre-push` - 推送前检查
- `commit-msg` - 提交信息检查
- 其他标准 Git hooks

#### 文件过滤规则
```bash
# 排除的文件类型
- README.md
- *.md 文件
- .sample 文件（Git 自动过滤）
```

#### 权限设置
```bash
# 所有安装的 hooks 都设置为可执行
chmod +x "$target_hook"

# 验证权限
ls -la "$GIT_HOOKS_DIR"
# 预期输出: -rwxr-xr-x ... pre-commit
```

## 安装示例

### 成功安装输出
```bash
$ make install-hooks
Installing git hooks...
Installing git hooks...
Project root: /Users/user/projects/blog-project/backend
Hooks source: /Users/user/projects/blog-project/backend/git-hooks
Git hooks target: /Users/user/projects/blog-project/.git/hooks
Installing pre-commit...
✓ pre-commit installed

Git hooks installation completed!

The following hooks are now active:
- pre-commit

Note: These hooks will run automatically before each git operation.
To skip hooks temporarily, use: git commit --no-verify
```

### 目录结构对比

#### 安装前
```
.git/hooks/
├── applypatch-msg.sample
├── commit-msg.sample
├── pre-commit.sample
└── ...
```

#### 安装后
```
.git/hooks/
├── applypatch-msg.sample
├── commit-msg.sample
├── pre-commit.sample
├── pre-commit          # 新安装
└── ...
```

## 故障排除

### 常见错误及解决方案

#### 1. 权限被拒绝
**错误信息**: `bash: ./scripts/install-hooks.sh: Permission denied`

**原因**: 脚本没有执行权限

**解决方案**:
```bash
# 方法一：添加执行权限
chmod +x scripts/install-hooks.sh

# 方法二：使用 bash 直接执行
bash scripts/install-hooks.sh

# 方法三：使用 make（推荐）
make install-hooks
```

#### 2. Git 仓库未找到
**错误信息**: `fatal: not a git repository (or any of the parent directories)`

**原因**: 不在 Git 仓库中运行

**解决方案**:
```bash
# 确认在正确的目录中
pwd
git status

# 如果需要，初始化 Git 仓库
git init
```

#### 3. Hooks 目录不存在
**错误信息**: `Error: git-hooks directory not found`

**原因**: 项目结构不正确

**解决方案**:
```bash
# 检查目录结构
ls -la
ls -la git-hooks/

# 如果目录不存在，重新克隆项目
git clone <repository-url>
cd <project-name>
```

#### 4. 复制失败
**错误信息**: `cp: cannot stat '...': No such file or directory`

**原因**: 源文件不存在或路径错误

**解决方案**:
```bash
# 验证源文件
ls -la git-hooks/
find git-hooks/ -type f

# 检查文件权限
ls -la git-hooks/pre-commit
```

### 调试模式

#### 启用详细输出
```bash
# 在脚本中添加调试信息
set -x  # 启用命令跟踪
set +x  # 禁用命令跟踪

# 或者在运行时启用
bash -x scripts/install-hooks.sh
```

#### 手动验证每个步骤
```bash
# 1. 检查脚本位置
echo $(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# 2. 检查项目根目录
echo $(cd "scripts/.." && pwd)

# 3. 检查 Git 目录
git rev-parse --git-dir

# 4. 验证源文件
ls -la git-hooks/

# 5. 检查目标目录
ls -la .git/hooks/
```

## 维护和更新

### 更新 Hooks

当 hooks 有更新时：

```bash
# 方法一：重新安装
make install-hooks

# 方法二：手动更新
git pull origin main
make install-hooks
```

### 添加新的 Hook

1. **创建 Hook 文件**
```bash
# 在 git-hooks 目录下创建新 hook
touch git-hooks/pre-push
chmod +x git-hooks/pre-push
```

2. **编辑 Hook 内容**
```bash
#!/bin/sh
echo "Running pre-push checks..."
# 添加检查逻辑
```

3. **重新安装**
```bash
make install-hooks
```

### 备份现有 Hooks

```bash
# 备份现有 hooks
cp -r .git/hooks/ .git/hooks.backup/

# 恢复备份
cp -r .git/hooks.backup/* .git/hooks/
```

## 高级用法

### 自定义安装位置

```bash
# 指定自定义 hooks 目录
export HOOKS_DIR="/path/to/custom/hooks"
./scripts/install-hooks.sh
```

### 批量安装

```bash
# 为多个项目安装
for project in project1 project2 project3; do
    cd ~/projects/$project
    make install-hooks
done
```

### 集成到 CI/CD

```bash
# 在 CI 管道中安装 hooks
- name: Install git hooks
  run: |
    cd ${{ github.workspace }}/backend
    make install-hooks
```

## 最佳实践

### 团队协作

1. **统一安装时机**
   - 新成员入职时
   - 项目重大更新后
   - 开发环境重置时

2. **文档维护**
   - 保持安装步骤更新
   - 记录常见问题和解决方案

3. **版本控制**
   - 所有 hooks 文件都应该版本控制
   - 不允许手动修改 `.git/hooks/` 中的文件

### 性能优化

1. **增量安装**
   - 只在文件有变化时重新安装
   - 避免不必要的文件复制

2. **并行处理**
   - 并行设置多个 hooks
   - 优化安装速度

### 安全考虑

1. **权限控制**
   - hooks 文件应该只有所有者可写
   - 定期检查 hooks 文件完整性

2. **代码审查**
   - 所有 hooks 更新都需要代码审查
   - 定期审计 hooks 逻辑

## 总结

`install-hooks` 系统提供了：
- **一键安装**：简化团队成员环境设置
- **版本控制**：确保 hooks 配置的一致性
- **自动维护**：简化 hooks 更新过程
- **故障诊断**：提供详细的错误信息和解决方案

通过正确使用和维护这个系统，团队可以确保所有成员都使用相同的代码质量标准，提高整体开发效率和代码质量。