# 贡献指南

感谢您对本项目的贡献！为了确保代码质量和一致性，请在提交代码前遵循以下步骤。

## 环境设置

### 1. 克隆项目
```bash
git clone <repository-url>
cd blog-project/backend
```

### 2. 安装依赖
```bash
go mod download
```

### 3. 安装 Git Hooks (必需)
```bash
make install-hooks
```

这个步骤会安装 golangci-lint pre-commit hook，确保每次提交前代码都会经过质量检查。

## 代码规范

本项目使用 golangci-lint 进行代码质量检查。配置文件位于 `.golangci.yml`。

### 主要检查项目
- 未处理的错误检查
- 未使用的变量和导入
- 代码格式化
- 性能问题
- 潜在的 bug

### 运行代码检查
```bash
# 手动运行检查
golangci-lint run

# 自动修复部分问题
golangci-lint run --fix
```

## 提交流程

### 1. 确保代码通过检查
```bash
golangci-lint run
```

### 2. 提交代码
```bash
git add .
git commit -m "feat: add new feature"
```

**注意：** pre-commit hook 会自动运行代码检查。如果检查失败，提交会被阻止。

### 3. 跳过检查 (不推荐)
仅在特殊情况下使用：
```bash
git commit --no-verify -m "commit message"
```

## 分支策略

- `main`: 主分支，包含稳定的代码
- `develop`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `chore/*`: 维护分支

## 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat(auth): add user authentication feature

- Implement JWT token generation
- Add login/logout endpoints
- Update user model with password hashing

Closes #123
```

## 常用命令

```bash
# 安装 git hooks
make install-hooks

# 构建项目
make build

# 运行测试
make test

# 生成 API 文档
make docs

# 查看所有可用命令
make help
```

## 代码审查

所有代码都需要通过代码审查。提交前请确保：

1. 代码通过所有自动化检查
2. 添加了必要的测试
3. 更新了相关文档
4. 遵循项目编码规范

## 获取帮助

如有问题，请：
1. 查看项目文档
2. 搜索已有 issues
3. 创建新的 issue 描述问题
4. 在团队群组中询问

---

再次感谢您的贡献！