# Scripts 文件夹使用指南

本目录包含了项目前后端自动化脚本，用于设置项目级别的代码质量检查和简化开发流程。

## 🎯 主要功能

- **前后端代码质量检查**：统一的 ESLint 和 golangci-lint 检查
- **Git Hooks 自动化**：提交前自动运行代码质量检查
- **环境依赖检测**：自动检测和安装必要的开发依赖
- **彩色输出和中文提示**：提升开发者体验

## 📁 目录结构

```
scripts/
├── README.md              # 本文档
├── install-hooks.sh       # 前后端 Git Hooks 自动安装脚本 (175行)
└── lint-all.sh           # 综合代码检查脚本 (125行)
```

## 🚀 快速开始

### 安装 Git Hooks

```bash
# 方法一：使用 Makefile（推荐）
make install-hooks

# 方法二：直接运行脚本
./scripts/install-hooks.sh
```

### 运行代码检查

```bash
# 方法一：使用 Makefile（推荐）
make lint-all

# 方法二：直接运行脚本
./scripts/lint-all.sh all

# 方法三：分别运行前端和后端检查
./scripts/lint-all.sh frontend
./scripts/lint-all.sh backend
```

## 📋 脚本详细说明

### 1. install-hooks.sh (175行)

前后端 Git Hooks 自动安装脚本，用于设置项目级别的代码质量检查。

**核心功能：**
- ✅ 自动检测 Git 仓库和项目结构
- ✅ 从 `backend/git-hooks` 目录复制所有可执行脚本到 `.git/hooks`
- ✅ 设置正确的文件权限和详细的安装反馈
- ✅ 前端代码质量检查（ESLint）环境检测和依赖安装
- ✅ 后端代码质量检查（golangci-lint）环境检测
- ✅ 彩色输出和中文提示，提升用户体验

**输出函数：**
- `print_status()` - 蓝色状态信息
- `print_success()` - 绿色成功信息
- `print_error()` - 红色错误信息
- `print_warning()` - 黄色警告信息

**环境检测：**
- **前端检测**：检查 `frontend/package.json` 和 `node_modules`
- **后端检测**：检查 `backend/go.mod` 和 `golangci-lint` 工具
- **自动安装**：当缺少前端依赖时自动运行 `npm install`

**使用场景：**
- 新成员首次设置开发环境
- Git Hooks 更新后重新安装
- CI/CD 环境中确保代码质量检查
- 项目结构变更后的环境重新配置

**命令选项：**
```bash
./scripts/install-hooks.sh
```

**检查的目录结构：**
```
project/
├── scripts/install-hooks.sh          # 当前脚本
├── backend/git-hooks/pre-commit     # Git Hooks 源文件
├── frontend/package.json            # 前端项目配置
├── frontend/node_modules/           # 前端依赖（可选，会自动安装）
├── backend/go.mod                   # 后端项目配置
└── .git/hooks/                     # Git Hooks 目标目录
```

**预期输出示例：**
```
开始安装前后端 Git Hooks...
项目根目录: /path/to/project
Hooks 源文件目录: /path/to/project/backend/git-hooks
Git hooks 目标目录: .git/hooks

正在安装前后端代码质量检查 hooks...
正在安装 pre-commit...
✓ pre-commit 安装成功

检查前端代码检查环境...
✓ 前端环境已就绪

检查后端代码检查环境...
✓ 后端 golangci-lint 已安装

Git Hooks 安装完成！

已安装的 hooks：
- pre-commit

Hook 功能说明：
- pre-commit: 提交前自动运行前后端代码质量检查
  • 前端: ESLint 检查 (TypeScript/Next.js)
  • 后端: golangci-lint 检查 (Go)

🔧 使用说明：
- 这些 hooks 会在每次 Git 操作前自动运行
- 临时跳过 hooks: git commit --no-verify
- 手动运行代码检查: ./scripts/lint-all.sh
- 使用 Makefile: make lint-all

🎉 前后端代码质量检查已配置完成！
现在每次提交代码时都会自动检查代码质量。

安装摘要：
- 成功安装: 1 个 hooks
- 安装失败: 0 个 hooks
- 项目根目录: /path/to/project
```

### 2. lint-all.sh (125行)

综合代码检查脚本，支持前端和后端代码质量检查。

**核心功能：**
- ✅ 前端 ESLint 检查（Next.js + TypeScript）
- ✅ 后端 golangci-lint 检查
- ✅ 彩色输出和详细错误报告
- ✅ 自动依赖检查和安装
- ✅ 灵活的运行模式选择

**输出函数：**
- `print_status()` - 蓝色状态信息
- `print_success()` - 绿色成功信息
- `print_error()` - 红色错误信息

**核心函数：**
- `lint_frontend()` - 执行前端 ESLint 检查
- `lint_backend()` - 执行后端 golangci-lint 检查

**自动化处理：**
- 前端：自动检测 `node_modules`，缺失时运行 `npm install`
- 后端：自动检测 `golangci-lint` 工具是否可用

**使用选项：**
```bash
# 检查所有代码（默认）
./scripts/lint-all.sh
./scripts/lint-all.sh all

# 仅检查前端代码
./scripts/lint-all.sh frontend

# 仅检查后端代码
./scripts/lint-all.sh backend
```

**工作流程：**
1. **参数解析**：确定检查范围（frontend/backend/all）
2. **前端检查**：切换到 frontend 目录，运行 ESLint
3. **后端检查**：切换到 backend 目录，运行 golangci-lint
4. **结果汇总**：统计成功/失败状态并显示

**前端检查流程：**
```bash
cd frontend/
if [ ! -d "node_modules" ]; then
    npm install  # 自动安装依赖
fi
npm run lint     # 运行 ESLint
```

**后端检查流程：**
```bash
cd backend/
if ! command -v golangci-lint &> /dev/null; then
    # 提示安装 golangci-lint
fi
golangci-lint run  # 运行后端检查
```

**输出示例：**
```
Starting linting process for: all
Project root: /path/to/project
Running frontend linting...

> next lint
✅ Frontend linting passed!

Running backend linting...
✅ Backend linting passed!

All linting checks passed!
```

**错误处理：**
- 前端：显示 ESLint 错误和警告信息
- 后端：显示 golangci-lint 检查结果
- 环境：提示工具安装和依赖问题

## 🔗 与其他工具的集成

### Makefile 集成

脚本已完全集成到项目根目录的 Makefile 中：

```makefile
# Git Hooks 安装
install-hooks: ./scripts/install-hooks.sh

# 代码检查
lint-frontend:
    @cd frontend && npm run lint

lint-backend:
    @cd backend && make lint

lint-all: lint-frontend lint-backend
    @./scripts/lint-all.sh all
```

### Git Pre-commit Hooks

自动在代码提交前运行检查：
```bash
git commit -m "feat: add new feature"
# 自动触发：./scripts/lint-all.sh all
```

**Pre-commit hook 执行流程：**
1. 检测综合脚本是否存在
2. 运行 `./scripts/lint-all.sh all`
3. 前端后端都通过时允许提交
4. 失败时显示详细错误和修复建议

## 🛠️ 配置和自定义

### 前端 ESLint 配置

前端代码检查配置文件：`frontend/eslint.config.mjs`

```javascript
import { FlatCompat } from "@eslint/eslintrc";

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
    ignorePatterns: ["src/components/toc.tsx"],
  }),
];
```

**检查规则：**
- Next.js 最佳实践
- TypeScript 类型检查
- React Hooks 依赖检查
- 代码风格和格式化

### 后端 golangci-lint 配置

后端代码检查配置文件：`backend/.golangci.yml`

**检查范围：**
- Go 代码格式化
- 性能优化建议
- 安全漏洞检测
- 代码复杂度分析

### Git Hooks 自定义

自定义 hooks 位于 `backend/git-hooks/` 目录：
- `pre-commit` - 提交前代码检查
- 其他标准 Git hooks

**当前 pre-commit hook 功能：**
1. 检测综合脚本 `../scripts/lint-all.sh`
2. 存在时运行前后端综合检查
3. 回退到仅后端 golangci-lint 检查
4. 提供详细错误信息和修复建议

## 🔧 故障排除

### 常见问题

#### 1. 权限问题

**问题：** `bash: ./scripts/install-hooks.sh: Permission denied`

**解决：**
```bash
chmod +x scripts/install-hooks.sh
chmod +x scripts/lint-all.sh
```

#### 2. 前端依赖缺失

**问题：** 前端 linting 时找不到 node_modules

**解决：**
```bash
cd frontend
npm install
# 脚本会自动检测并安装缺失的依赖
```

#### 3. 后端工具缺失

**问题：** `golangci-lint not found`

**解决：**
```bash
# macOS
brew install golangci-lint

# 或使用 go install
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

#### 4. Git 仓库问题

**问题：** `fatal: not a git repository`

**解决：**
```bash
# 确认在正确的目录
pwd
git status

# 如需初始化
git init
```

#### 5. 项目结构问题

**问题：** `git-hooks directory not found`

**解决：**
```bash
# 检查项目结构
ls -la backend/git-hooks/
# 确保从项目根目录运行脚本
```

### 调试模式

启用详细输出：
```bash
# install-hooks.sh 调试
bash -x scripts/install-hooks.sh

# lint-all.sh 调试
bash -x scripts/lint-all.sh all
```

### 手动验证

检查脚本设置：
```bash
# 验证 Git Hooks
ls -la .git/hooks/

# 验证脚本权限
ls -la scripts/

# 手动运行检查
cd frontend && npm run lint
cd backend && golangci-lint run

# 检查环境
node --version
go version
golangci-lint version
```

## 📈 最佳实践

### 日常开发工作流

1. **首次设置：**
   ```bash
   make install-hooks
   ```

2. **开发前检查：**
   ```bash
   make lint-all
   ```

3. **提交代码：**
   ```bash
   git add .
   git commit -m "feat: add feature"  # 自动运行 linting
   ```

### 团队协作

1. **新成员入职：** 运行 `make install-hooks`
2. **代码审查：** 使用 `make lint-all` 确保代码质量
3. **CI/CD 集成：** 在构建流程中包含 linting 检查

### 持续改进

1. **定期更新：** 保持工具和配置的最新版本
2. **规则调整：** 根据项目需求调整 linting 规则
3. **性能优化：** 监控检查时间，优化性能

### 脚本维护

1. **版本控制：** 所有脚本变更都应提交到版本控制
2. **测试验证：** 修改后测试所有功能是否正常
3. **文档同步：** 及时更新文档说明

## 📊 脚本统计

| 脚本 | 行数 | 主要功能 | 语言 |
|------|------|----------|------|
| `install-hooks.sh` | 175 | Git Hooks 安装和环境检测 | Bash |
| `lint-all.sh` | 125 | 前后端代码质量检查 | Bash |
| **总计** | **300** | **完整自动化方案** | **Bash** |

## 📚 相关文档

- [项目开发指南](../docs/development/)
- [Git Hooks 详细说明](../backend/docs/development/install-hooks-guide.md)
- [前端开发规范](../frontend/)
- [后端开发规范](../backend/)

## 🤝 贡献指南

如需添加新的脚本或修改现有脚本：

1. **权限设置**：确保脚本具有可执行权限
2. **错误处理**：添加详细的错误处理和用户提示
3. **文档更新**：提供清晰的帮助信息和使用说明
4. **测试验证**：在多个环境中测试脚本功能
5. **Makefile 集成**：在 Makefile 中添加对应的命令
6. **版本控制**：提交时包含所有相关的文档更新

## 📄 许可证

所有脚本遵循项目的整体许可证条款。

---

**最后更新：** 2025-12-01
**版本：** 1.0
**维护者：** 项目开发团队