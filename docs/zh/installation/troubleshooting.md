<!-- 翻译：zh-CN 原文：/docs/installation/troubleshooting.md 最后同步：2026-02-22 -->

# Synkra AIOX 故障排除指南

> 🌐 [EN](../../installation/troubleshooting.md) | [PT](../pt/installation/troubleshooting.md) | [ES](../es/installation/troubleshooting.md)

**版本:** 2.1.0
**最后更新:** 2025-01-24

---

## 目录

- [快速诊断](#快速诊断)
- [安装问题](#安装问题)
- [网络与连接问题](#网络与连接问题)
- [权限与访问问题](#权限与访问问题)
- [操作系统特定问题](#操作系统特定问题)
- [IDE 配置问题](#ide-配置问题)
- [代理激活问题](#代理激活问题)
- [诊断命令](#诊断命令)
- [获取帮助](#获取帮助)

---

## 快速诊断

首先运行此诊断命令来确定常见问题：

```bash
npx @synkra/aiox-core status
```

如果状态命令失败，请根据您的错误消息浏览以下部分。

---

## 安装问题

### 问题 1："npx @synkra/aiox-core is not recognized"

**症状:**

```
'npx' is not recognized as an internal or external command
```

**原因:** Node.js 或 npm 未安装或不在 PATH 中。

**解决方案:**

```bash
# 检查 Node.js 是否已安装
node --version

# 如果未安装：
# Windows: 从 https://nodejs.org/ 下载
# macOS: brew install node
# Linux: nvm install 18

# 验证 npm 可用
npm --version

# 如果 npm 缺失，重新安装 Node.js
```

---

### 问题 2："Inappropriate Installation Directory Detected"

**症状:**

```
⚠️  Inappropriate Installation Directory Detected

Current directory: /Users/username

Synkra AIOX should be installed in your project directory,
not in your home directory or temporary locations.
```

**原因:** 从主目录、/tmp 或 npx 缓存运行安装程序。

**解决方案:**

```bash
# 首先导航到您的项目目录
cd /path/to/your/project

# 然后运行安装程序
npx @synkra/aiox-core install
```

---

### 问题 3："Installation failed: ENOENT"

**症状:**

```
Installation failed: ENOENT: no such file or directory
```

**原因:** 目标目录不存在或权限不正确。

**解决方案:**

```bash
# 首先创建目录
mkdir -p /path/to/your/project

# 导航到该目录
cd /path/to/your/project

# 运行安装程序
npx @synkra/aiox-core install
```

---

### 问题 4："Node.js version too old"

**症状:**

```
Error: Synkra AIOX requires Node.js 18.0.0 or higher
Current version: 14.17.0
```

**原因:** Node.js 版本低于最低要求。

**解决方案:**

```bash
# 检查当前版本
node --version

# 使用 nvm 更新（推荐）
nvm install 18
nvm use 18

# 或从 nodejs.org 下载最新 LTS
```

---

### 问题 5："npm ERR! code E404"

**症状:**

```
npm ERR! code E404
npm ERR! 404 Not Found - GET https://registry.npmjs.org/@synkra/aiox-core
```

**原因:** npm 注册表上找不到包（网络问题或拼写错误）。

**解决方案:**

```bash
# 清除 npm 缓存
npm cache clean --force

# 验证注册表
npm config get registry
# 应为：https://registry.npmjs.org/

# 如果使用自定义注册表，重置为默认
npm config set registry https://registry.npmjs.org/

# 重试安装
npx @synkra/aiox-core install
```

---

### 问题 6："EACCES: permission denied"

**症状:**

```
npm ERR! EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**原因:** 全局 npm 目录权限不正确。

**解决方案:**

```bash
# 选项 1：修复 npm 权限（Linux/macOS）
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
# 将 export 行添加到 ~/.bashrc 或 ~/.zshrc

# 选项 2：使用 npx 而不是全局安装（推荐）
npx @synkra/aiox-core install

# 选项 3：使用 nvm 管理 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

---

## 网络与连接问题

### 问题 7："ETIMEDOUT" 或 "ECONNREFUSED"

**症状:**

```
npm ERR! code ETIMEDOUT
npm ERR! errno ETIMEDOUT
npm ERR! network request to https://registry.npmjs.org/@synkra/aiox-core failed
```

**原因:** 网络连接问题、防火墙或代理阻止 npm。

**解决方案:**

```bash
# 检查 npm 注册表是否可访问
curl -I https://registry.npmjs.org/

# 如果在代理后面，配置 npm
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 如果使用企业 SSL 检查，禁用严格 SSL（谨慎使用）
npm config set strict-ssl false

# 以详细日志重试
npm install @synkra/aiox-core --verbose
```

---

### 问题 8："SSL Certificate Problem"

**症状:**

```
npm ERR! code UNABLE_TO_GET_ISSUER_CERT_LOCALLY
npm ERR! unable to get local issuer certificate
```

**原因:** SSL 证书验证失败（在企业环境中常见）。

**解决方案:**

```bash
# 添加您的公司的 CA 证书
npm config set cafile /path/to/your/certificate.pem

# 或禁用严格 SSL（仅在信任网络时使用）
npm config set strict-ssl false

# 验证并重试
npm config get strict-ssl
npx @synkra/aiox-core install
```

---

### 问题 9："Connection reset by peer"

**症状:**

```
npm ERR! network socket hang up
npm ERR! network This is a problem related to network connectivity.
```

**原因:** 不稳定的互联网连接或 DNS 问题。

**解决方案:**

```bash
# 尝试使用不同的 DNS
# Windows: 控制面板 > 网络 > DNS = 8.8.8.8, 8.8.4.4
# Linux: echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# 清除 DNS 缓存
# Windows: ipconfig /flushdns
# macOS: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches

# 使用更长的超时重试
npm config set fetch-timeout 60000
npx @synkra/aiox-core install
```

---

## 权限与访问问题

### 问题 10："EPERM: operation not permitted"

**症状:**

```
Error: EPERM: operation not permitted, unlink '/path/to/file'
```

**原因:** 文件被另一个进程锁定或权限不足。

**解决方案:**

```bash
# Windows: 关闭所有 IDE 实例，然后：
taskkill /f /im node.exe

# macOS/Linux: 检查锁定的进程
lsof +D /path/to/project

# 终止持有文件的进程
kill -9 <PID>

# 尝试再次安装
npx @synkra/aiox-core install
```

---

### 问题 11："Read-only file system"

**症状:**

```
Error: EROFS: read-only file system
```

**原因:** 尝试在只读挂载或系统目录上安装。

**解决方案:**

```bash
# 验证文件系统是否可写
touch /path/to/project/test.txt
# 如果失败，目录是只读的

# 检查挂载选项
mount | grep /path/to/project

# 改为安装到可写目录
cd ~/projects/my-project
npx @synkra/aiox-core install
```

---

### 问题 12："Directory not empty" during upgrade

**症状:**

```
Error: ENOTEMPTY: directory not empty, rmdir '.aiox-core'
```

**原因:** 现有安装有修改过的文件。

**解决方案:**

```bash
# 备份现有安装
mv .aiox-core .aiox-core.backup

# 使用强制标志运行安装程序
npx @synkra/aiox-core install --force-upgrade

# 如果需要，从备份恢复自定义文件
cp .aiox-core.backup/custom-files/* .aiox-core/
```

---

## 操作系统特定问题

### Windows 问题

#### 问题 13："PowerShell execution policy"

**症状:**

```
File cannot be loaded because running scripts is disabled on this system.
```

**解决方案:**

```powershell
# 检查当前策略
Get-ExecutionPolicy

# 设置为 RemoteSigned（推荐）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 或改用 CMD
cmd
npx @synkra/aiox-core install
```

#### 问题 14："Path too long"

**症状:**

```
Error: ENAMETOOLONG: name too long
```

**解决方案:**

```powershell
# 在 Windows 10/11 中启用长路径
# 以管理员身份运行：
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

# 或使用更短的项目路径
cd C:\dev\proj
npx @synkra/aiox-core install
```

#### 问题 15："npm not found in Git Bash"

**症状:**

```
bash: npm: command not found
```

**解决方案:**

```bash
# 将 Node.js 添加到 Git Bash PATH
# 在 ~/.bashrc 或 ~/.bash_profile 中：
export PATH="$PATH:/c/Program Files/nodejs"

# 或改用 Windows Terminal/CMD/PowerShell
```

---

### macOS 问题

#### 问题 16："Xcode Command Line Tools required"

**症状:**

```
xcode-select: error: command line tools are not installed
```

**解决方案:**

```bash
# 安装 Xcode 命令行工具
xcode-select --install

# 按照安装对话框进行操作
# 然后重试
npx @synkra/aiox-core install
```

#### 问题 17："Apple Silicon (M1/M2) compatibility"

**症状:**

```
Error: Unsupported architecture: arm64
```

**解决方案:**

```bash
# 大多数包本地工作，但如果问题持续：

# 为 x86 兼容性安装 Rosetta 2
softwareupdate --install-rosetta

# 使用 Node.js 的 x86 版本（如果需要）
arch -x86_64 /bin/bash
nvm install 18
npx @synkra/aiox-core install
```

---

### Linux 问题

#### 问题 18："libvips dependency error"

**症状:**

```
Error: Cannot find module '../build/Release/sharp-linux-x64.node'
```

**解决方案:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential libvips-dev

# Fedora/RHEL
sudo dnf install vips-devel

# 清除 npm 缓存并重新安装
npm cache clean --force
npx @synkra/aiox-core install
```

#### 问题 19："GLIBC version too old"

**症状:**

```
Error: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.28' not found
```

**解决方案:**

```bash
# 检查 GLIBC 版本
ldd --version

# 如果版本太旧，为您的发行版使用 Node.js LTS：
# Ubuntu 18.04: 最多支持 Node.js 16
nvm install 16
nvm use 16

# 或升级 Linux 发行版
```

---

## IDE 配置问题

### 问题 20："Agents not appearing in IDE"

**症状:** 安装后代理命令（`/dev`、`@dev`）不工作。

**解决方案:**

1. 完全重启 IDE（不只是重新加载）
2. 验证文件已创建：

   ```bash
   # Claude Code
   ls .claude/commands/AIOX/agents/

   # Cursor
   ls .cursor/rules/
   ```

3. 检查 IDE 设置允许自定义命令
4. 为特定 IDE 重新运行安装：
   ```bash
   npx @synkra/aiox-core install --ide claude-code
   ```

---

### 问题 21："Agent shows raw markdown instead of activating"

**症状:** IDE 显示代理文件内容而不是激活。

**解决方案:**

1. 检查 IDE 版本是否兼容
2. 对于 Cursor：确保文件具有 `.mdc` 扩展名
3. 对于 Claude Code：文件应在 `.claude/commands/` 中
4. 安装后重启 IDE

---

## 代理激活问题

### 问题 22："Agent not found" error

**症状:**

```
Error: Agent 'dev' not found in .aiox-core/agents/
```

**解决方案:**

```bash
# 验证代理文件存在
ls .aiox-core/agents/

# 如果缺失，重新安装核心
npx @synkra/aiox-core install --full

# 检查 core-config.yaml 有效
cat .aiox-core/core-config.yaml
```

---

### 问题 23："YAML parsing error" in agent

**症状:**

```
YAMLException: bad indentation of a mapping entry
```

**解决方案:**

```bash
# 验证 YAML 语法
npx yaml-lint .aiox-core/agents/dev.md

# 常见修复：
# - 使用空格，不使用制表符
# - 确保一致的缩进（2 个空格）
# - 检查字符串中的特殊字符（使用引号）

# 重新安装以获取干净的代理文件
mv .aiox-core/agents/dev.md .aiox-core/agents/dev.md.backup
npx @synkra/aiox-core install --full
```

---

## 诊断命令

### 通用诊断

```bash
# 检查 AIOX 安装状态
npx @synkra/aiox-core status

# 列出可用的 Squad
npx @synkra/aiox-core install

# 更新现有安装
npx @synkra/aiox-core update

# 显示详细日志
npx @synkra/aiox-core install --verbose
```

### 系统信息

```bash
# Node.js 和 npm 版本
node --version && npm --version

# npm 配置
npm config list

# 环境变量
printenv | grep -i npm
printenv | grep -i node

# 磁盘空间（确保 >500MB 可用）
df -h .
```

### 文件验证

```bash
# 验证 .aiox-core 结构
find .aiox-core -type f | wc -l
# 预期：200+ 文件

# 检查损坏的 YAML
for f in .aiox-core/**/*.yaml; do npx yaml-lint "$f"; done

# 验证权限
ls -la .aiox-core/
```

---

## 获取帮助

### 请求帮助前

1. 运行 `npx @synkra/aiox-core status` 并记录输出
2. 查看此故障排除指南
3. 搜索现有 [GitHub 问题](https://github.com/SynkraAI/aiox-core/issues)

### 错误报告中包含的信息

```
**环境：**
- OS: [Windows 11 / macOS 14 / Ubuntu 22.04]
- Node.js 版本: [输出 `node --version`]
- npm 版本: [输出 `npm --version`]
- IDE: [Claude Code / Cursor / 等]

**重现步骤：**
1. [第一步]
2. [第二步]
3. [错误发生]

**预期行为：**
[应该发生的事]

**实际行为：**
[实际发生的事]

**错误输出：**
```

[在此粘贴完整错误消息]

```

**附加背景：**
[任何其他相关信息]
```

### 支持渠道

- **GitHub Issues**: [@synkra/aiox-core/issues](https://github.com/SynkraAI/aiox-core/issues)
- **文档**: [docs/installation/](./README.md)
- **FAQ**: [faq.md](./faq.md)

---

## 相关文档

- [常见问题](./faq.md)
