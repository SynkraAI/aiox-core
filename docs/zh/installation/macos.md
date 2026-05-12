<!--
  翻译：zh-CN（简体中文）
  原文：/docs/installation/macos.md
  最后同步：2026-02-22
-->

# Synkra AIOX macOS 安装指南

> 🌐 [EN](../../installation/macos.md) | [PT](../pt/installation/macos.md) | [ES](../es/installation/macos.md) | **ZH**

## 前置要求

### 1. Node.js（v20 或更高版本）

使用以下方法之一安装 Node.js：

**选项 A：使用 Homebrew（推荐）**

```bash
# 如果尚未安装 Homebrew，请先安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node
```

**选项 B：使用官方安装程序**
从 [nodejs.org](https://nodejs.org/) 下载

**选项 C：使用 Node Version Manager (nvm)**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node.js
nvm install 20
nvm use 20
```

### 2. GitHub CLI

安装 GitHub CLI 以进行团队协作：

**使用 Homebrew（推荐）**

```bash
brew install gh
```

**使用 MacPorts**

```bash
sudo port install gh
```

**使用官方安装程序**
从 [cli.github.com](https://cli.github.com/) 下载

## 安装

### 快速安装

1. 打开终端
2. 导航到您的项目目录：

   ```bash
   cd ~/path/to/your/project
   ```

3. 运行安装程序：
   ```bash
   npx github:SynkraAI/aiox-core install
   ```

### 安装程序的作用

安装程序会自动：

- ✅ 检测 macOS 并应用平台特定配置
- ✅ 创建具有适当权限的必要目录
- ✅ 为 macOS 位置配置 IDE 路径：
  - Cursor: `~/Library/Application Support/Cursor/`
  - Claude: `~/.claude/`
- ✅ 使用 Unix 换行符设置 shell 脚本
- ✅ 正确处理区分大小写的文件系统

## IDE 特定设置

### Cursor

1. IDE 规则安装到 `.cursor/rules/`
2. 键盘快捷键：`Cmd+L` 打开聊天
3. 使用 `@agent-name` 激活 Agent

### Claude Code

1. 命令安装到 `.claude/commands/AIOX/`
2. 使用 `/agent-name` 激活 Agent


2. 使用 `@agent-name` 激活 Agent

## 故障排除

### 权限问题

如果遇到权限错误：

```bash
# 修复 npm 权限
sudo chown -R $(whoami) ~/.npm

# 修复项目权限
sudo chown -R $(whoami) .aiox-core
```

### GitHub CLI 身份验证

安装 GitHub CLI 后：

```bash
# 使用 GitHub 进行身份验证
gh auth login

# 选择身份验证方式（推荐使用网页浏览器）
```

### 路径问题

如果找不到命令：

```bash
# 添加到 ~/.zshrc 或 ~/.bash_profile
export PATH="/usr/local/bin:$PATH"

# 重新加载 shell 配置
source ~/.zshrc  # 或 source ~/.bash_profile
```

### 大小写敏感性

macOS 文件系统默认可能不区分大小写。如果遇到问题：

1. 检查您的文件系统：

   ```bash
   diskutil info / | grep "File System"
   ```

2. Synkra AIOX 会自动处理区分大小写和不区分大小写的文件系统

## 更新

要更新现有安装：

```bash
npx github:SynkraAI/aiox-core install
```

更新程序将：

- 检测您的现有安装
- 备份任何自定义内容
- 仅更新已更改的文件
- 保留您的配置

## 后续步骤

1. 配置您的 IDE（参见上面的 IDE 特定设置）
2. 在 AI Agent 中运行 `*help` 查看可用命令
3. 从[用户指南](../guides/user-guide.md)开始
4. 加入我们的 [Discord 社区](https://discord.gg/gk8jAdXWmj) 获取帮助

## 系统要求

- macOS 10.15 (Catalina) 或更高版本
- 最低 4GB RAM（推荐 8GB）
- 500MB 可用磁盘空间
- 用于 npm 包的互联网连接

## 其他资源

- [主 README](../../README.md)
- [用户指南](../guides/user-guide.md)
- [故障排除指南](../troubleshooting.md)
- [Discord 社区](https://discord.gg/gk8jAdXWmj)
