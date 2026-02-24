<!-- 翻译：zh-CN 原文：/docs/installation/linux.md 最后同步：2026-02-22 -->

# Synkra AIOS Linux 安装指南

> 🌐 [EN](../../installation/linux.md) | [PT](../pt/installation/linux.md) | [ES](../es/installation/linux.md)

---

## 支持的发行版

| 发行版      | 版本          | 状态              |
| ----------- | ------------- | ------------------- |
| Ubuntu      | 20.04+ (LTS)  | ✅ 完全支持        |
| Debian      | 11+ (Bullseye) | ✅ 完全支持        |
| Fedora      | 37+           | ✅ 完全支持        |
| Arch Linux  | Latest        | ✅ 完全支持        |
| Linux Mint  | 21+           | ✅ 完全支持        |
| Pop!_OS     | 22.04+        | ✅ 完全支持        |
| openSUSE    | Leap 15.4+    | ⚠️ 社区测试        |
| CentOS/RHEL | 9+            | ⚠️ 社区测试        |

---

## 前置要求

### 1. Node.js（v20 或更高版本）

根据您的发行版选择安装方法：

#### Ubuntu/Debian

```bash
# 更新软件包列表
sudo apt update

# 使用 NodeSource 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应显示 v20.x.x
npm --version
```

**替代方法：使用 nvm（推荐用于开发）**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell
source ~/.bashrc  # 或 ~/.zshrc

# 安装并使用 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

#### Fedora

```bash
# 从 Fedora 仓库安装 Node.js
sudo dnf install nodejs npm

# 或使用 NodeSource 获取最新版本
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

#### Arch Linux

```bash
# 从官方仓库安装
sudo pacman -S nodejs npm

# 或使用 nvm（推荐）
yay -S nvm  # 如果使用 AUR 辅助工具
nvm install 20
```

#### openSUSE

```bash
# 安装 Node.js
sudo zypper install nodejs20 npm20
```

### 2. Git

```bash
# Ubuntu/Debian
sudo apt install git

# Fedora
sudo dnf install git

# Arch
sudo pacman -S git

# 验证
git --version
```

### 3. GitHub CLI

```bash
# Ubuntu/Debian
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
&& sudo mkdir -p -m 755 /etc/apt/keyrings \
&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y

# Fedora
sudo dnf install gh

# Arch
sudo pacman -S github-cli

# 认证
gh auth login
```

### 4. 构建工具（可选但推荐）

某些 npm 包需要编译：

```bash
# Ubuntu/Debian
sudo apt install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"

# Arch
sudo pacman -S base-devel
```

---

## 安装

### 快速安装

1. 打开终端
2. 导航到您的项目目录：

   ```bash
   cd ~/projects/my-project
   ```

3. 运行安装程序：

   ```bash
   npx github:SynkraAI/aios-core install
   ```

### 手动安装

如果快速安装失败，请尝试手动安装：

```bash
# 克隆仓库
git clone https://github.com/SynkraAI/aios-core.git ~/.aios-core-source

# 导航到源目录
cd ~/.aios-core-source

# 安装依赖
npm install

# 为您的项目运行安装程序
node bin/aios-init.js ~/projects/my-project
```

### 安装程序的作用

安装程序会自动：

- ✅ 检测您的 Linux 发行版并应用优化
- ✅ 创建必要的目录并设置正确的 Unix 权限（755/644）
- ✅ 配置 Linux IDE 路径：
  - Cursor: `~/.config/Cursor/`
  - Claude: `~/.claude/`
- ✅ 使用 Unix 行尾（LF）设置 shell 脚本
- ✅ 遵守 XDG Base Directory 规范
- ✅ 正确处理符号链接

---

## IDE 特定设置

### Cursor

1. 安装 Cursor：从 [cursor.sh](https://cursor.sh/) 下载

   ```bash
   # AppImage 方法
   chmod +x cursor-*.AppImage
   ./cursor-*.AppImage
   ```

2. IDE 规则安装到 `.cursor/rules/`
3. 键盘快捷键：`Ctrl+L` 打开聊天
4. 使用 `@agent-name` 激活代理

### Claude Code (CLI)

1. 安装 Claude Code：

   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. 命令安装到 `.claude/commands/AIOS/`
3. 使用 `/agent-name` 激活代理

### VS Code（使用 Continue 扩展）

1. 安装 Continue 扩展
2. 在 `.continue/` 中配置 AIOS 规则

---

## 故障排除

### 权限错误

```bash
# 修复 npm 全局权限（推荐方法）
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 替代方法：修复所有权（如果使用了 sudo 运行 npm）
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### EACCES 错误

如果您看到 `EACCES: permission denied`：

```bash
# 选项 1：使用 npm prefix（推荐）
npm config set prefix '~/.local'
export PATH="$HOME/.local/bin:$PATH"

# 选项 2：修复项目权限
chmod -R u+rwX .aios-core
chmod -R u+rwX .claude
```

### npm WARN deprecated 警告

这些通常是无害的。要抑制它们：

```bash
npm install --no-warnings
```

### GitHub CLI 认证问题

```bash
# 检查当前认证状态
gh auth status

# 如果需要，重新认证
gh auth login --web

# 对于基于 SSH 的认证
gh auth login -p ssh
```

### 慢安装

如果 npm install 很慢：

```bash
# 使用更快的镜像源
npm config set registry https://registry.npmmirror.com

# 或增加超时时间
npm config set fetch-timeout 60000
```

### 缺少 libsecret（用于凭证存储）

```bash
# Ubuntu/Debian
sudo apt install libsecret-1-dev

# Fedora
sudo dnf install libsecret-devel

# Arch
sudo pacman -S libsecret
```

### WSL 特定问题

如果在 Windows Subsystem for Linux 中运行：

```bash
# 确保 Windows 路径不会干扰
echo 'export PATH=$(echo "$PATH" | tr ":" "\n" | grep -v "^/mnt/c" | tr "\n" ":")' >> ~/.bashrc

# 修复行尾问题
git config --global core.autocrlf input

# 性能：将项目移至 Linux 文件系统
# 使用 ~/projects 而不是 /mnt/c/projects
```

---

## 环境配置

### 推荐的 .bashrc/.zshrc 添加

```bash
# Node.js 配置
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# npm 全局包
export PATH="$HOME/.npm-global/bin:$PATH"

# AIOS 配置
export AIOS_HOME="$HOME/.aios-core"
export PATH="$AIOS_HOME/bin:$PATH"

# 编辑器偏好设置（用于 git 提交等）
export EDITOR=vim  # 或 code, nano 等
```

### XDG Base Directory 合规性

Synkra AIOS 遵守 XDG 目录：

```bash
# 数据文件：~/.local/share/aios/
# 配置文件：~/.config/aios/
# 缓存：~/.cache/aios/
# 状态：~/.local/state/aios/
```

---

## 更新

要更新现有安装：

```bash
# 使用 npx（推荐）
npx github:SynkraAI/aios-core install

# 手动更新
cd ~/.aios-core-source
git pull
npm install
node bin/aios-init.js ~/projects/my-project --update
```

更新程序将：

- 检测现有安装
- 将任何自定义备份到 `.aios-backup/`
- 仅更新已更改的文件
- 保留您的配置

---

## 卸载

详见完整的 [卸载指南](../../uninstallation.md)。

快速卸载：

```bash
# 从项目中删除 AIOS
rm -rf .aios-core .claude/commands/AIOS

# 删除全局安装
rm -rf ~/.aios-core-source ~/.npm-global/lib/node_modules/@synkra
```

---

## 系统要求

| 要求        | 最小   | 推荐   |
| ----------- | ------ | ------ |
| Kernel      | 4.15+  | 5.10+  |
| RAM         | 2GB    | 8GB    |
| 磁盘空间    | 500MB  | 2GB    |
| Node.js     | 18.x   | 20.x LTS |
| npm         | 9.x    | 10.x   |

---

## 发行版特定说明

### Ubuntu/Debian

- 预装的 Python 可能与某些 npm 包冲突
- 如果需要，使用 `deadsnakes` PPA 获取更新的 Python

### Fedora

- SELinux 可能需要为某些操作进行额外配置
- 如果被阻止，使用 `sudo setenforce 0` 临时禁用

### Arch Linux

- 包总是最新的；请彻底测试
- 某些 IDE 可能需要 AUR 包

### WSL（Windows Subsystem for Linux）

- 使用 WSL2 以获得更好的性能
- 将项目存储在 `/home/user/` 而不是 `/mnt/c/`
- 配置 `.wslconfig` 以设置内存限制

---

## 后续步骤

1. 配置您的 IDE（见上文 IDE 特定设置）
2. 在 AI 代理中运行 `*help` 查看可用命令
3. 从 [用户指南](../../guides/user-guide.md) 开始
4. 加入我们的 [Discord 社区](https://discord.gg/gk8jAdXWmj) 获取帮助

---

## 其他资源

- [主 README](../../README.md)
- [用户指南](../../guides/user-guide.md)
- [故障排除指南](troubleshooting.md)
- [常见问题](faq.md)
- [Discord 社区](https://discord.gg/gk8jAdXWmj)
- [GitHub Issues](https://github.com/SynkraAI/aios-core/issues)
