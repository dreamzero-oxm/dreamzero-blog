# Git Hooks

这个目录包含了项目的 Git hooks，用于确保代码质量。

## 可用的 Hooks

### pre-commit
在每次 `git commit` 前运行 golangci-lint 检查代码质量。

如果检查失败，commit 会被阻止，需要修复代码质量 issues 后重新提交。

## 安装方法

### 方法一：使用 Makefile (推荐)
```bash
make install-hooks
```

### 方法二：直接运行脚本
```bash
./scripts/install-hooks.sh
```

## 手动运行 golangci-lint

如果需要在提交前手动检查代码：

```bash
# 运行 linting 检查
golangci-lint run

# 自动修复部分问题
golangci-lint run --fix
```

## 跳过 Hooks (不推荐)

如果需要临时跳过 hooks，可以使用 `--no-verify` 标志：

```bash
git commit --no-verify -m "commit message"
```

**注意：** 跳过 hooks 仅在特殊情况下使用，可能会提交不符合质量标准的代码。

## Hooks 更新

当 hooks 有更新时，重新运行安装命令即可：

```bash
make install-hooks
```

## 配置文件

golangci-lint 的配置文件在项目根目录的 `.golangci.yml`。

如需调整 linting 规则，请编辑此文件。