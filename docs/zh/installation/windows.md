<!-- 翻译：zh-CN 原文：/docs/installation/windows.md 最后同步：2026-02-22 -->

# Synkra AIOS Windows 安装指南

> 🌐 [EN](../../installation/windows.md) | [PT](../pt/installation/windows.md) | [ES](../es/installation/windows.md)

---

## 支持的版本

| Windows 版本           | 状态              | 备注                  |
| -------------------- | ------------------- | --------------------- |
| Windows 11           | ✅ 完全支持        | 推荐                 |
| Windows 10 (22H2+)   | ✅ 完全支持        | 需要最新更新         |
| Windows 10（较旧）    | ⚠️ 有限支持       | 建议更新             |
| Windows Server 2022  | ✅ 完全支持        |                      |
| Windows Server 2019  | ⚠️ 社区测试       |                      |

---

## 前置要求

### 1. Node.js（v20 或更高版本）

**选项 A：使用官方安装程序（推荐）**

1. 从 [nodejs.org](https://nodejs.org/) 下载
2. 选择 **LTS** 版本（20.x 或更高）
3. 使用默认选项运行安装程序
4. 在 PowerShell 中验证安装：

```powershell
node --version  # 应显示 v20.x.x
npm --version
```

**选项 B：使用 winget**

```powershell
# 通过 Windows Package Manager 安装
winget install OpenJS.NodeJS.LTS

# 重启 PowerShell，然后验证
node --version
```

**选项 C：使用 Chocolatey**

```powershell
# 首先安装 Chocolatey（如果未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 Node.js
choco install nodejs-lts -y

# 重启 PowerShell
node --version
```

**选项 D：使用 nvm-windows**

```powershell
# 从以下位置下载 nvm-windows：https://github.com/coreybutler/nvm-windows/releases
# 安装最新的 nvm-setup.exe

# 安装后，打开新的 PowerShell：
nvm install 20
nvm use 20
```

### 2. Git for Windows

**使用官方安装程序（推荐）**

1. 从 [git-scm.com](https://git-scm.com/download/win) 下载
2. 使用这些推荐选项运行安装程序：
   - ✅ Git from the command line and also from 3rd-party software
   - ✅ Use bundled OpenSSH
   - ✅ Checkout Windows-style, commit Unix-style line endings
   - ✅ Use Windows' default console window

**使用 winget**

```powershell
winget install Git.Git
```

**使用 Chocolatey**

```powershell
choco install git -y
```

验证安装：

```powershell
git --version
```

### 3. GitHub CLI

**使用 winget（推荐）**

```powershell
winget install GitHub.cli
```

**使用 Chocolatey**

```powershell
choco install gh -y
```

**使用官方安装程序**

从 [cli.github.com](https://cli.github.com/) 下载

认证：

```powershell
gh auth login
# 按照提示操作，选择"使用 web 浏览器登录"
```

### 4. Windows Terminal（推荐）

为获得最佳体验，请使用 Windows Terminal：

```powershell
winget install Microsoft.WindowsTerminal
```

---

## 安装

### 快速安装

1. 打开 **PowerShell** 或 **Windows Terminal**
2. 导航到您的项目目录：

   ```powershell
   cd C:\Users\YourName\projects\my-project
   ```

3. 运行安装程序：

   ```powershell
   npx github:SynkraAI/aios-core install
   ```

### 安装程序的作用

安装程序会自动：

- ✅ 检测 Windows 并应用特定于平台的配置
- ✅ 创建必要的目录并设置正确的权限
- ✅ 配置 Windows 的 IDE 路径：
  - Cursor: `%APPDATA%\Cursor\`
  - Claude: `%USERPROFILE%\.claude\`
- ✅ 正确处理 Windows 路径分隔符（反斜杠）
- ✅ 正确配置行尾（批处理脚本为 CRLF，脚本为 LF）
- ✅ 设置与 cmd.exe 和 PowerShell 兼容的 npm 脚本

---

## IDE 特定设置

### Cursor

1. 从 [cursor.sh](https://cursor.sh/) 下载
2. 运行安装程序
3. IDE 规则安装到 `.cursor\rules\`
4. 键盘快捷键：`Ctrl+L` 打开聊天
5. 使用 `@agent-name` 激活代理

### Claude Code (CLI)

1. 安装 Claude Code：

   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```

2. 命令安装到 `.claude\commands\AIOS\`
3. 使用 `/agent-name` 激活代理

### VS Code

1. 从市场安装 Continue 扩展
2. AIOS 可以通过 `.continue\` 配置集成

---

## 故障排除

### 执行策略错误

如果您看到 `running scripts is disabled`：

```powershell
# 检查当前策略
Get-ExecutionPolicy

# 设置为允许本地脚本（推荐）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 或为当前会话临时绕过
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### npm EACCES 或权限错误

```powershell
# 修复 npm 缓存权限
npm cache clean --force

# 将 npm prefix 设置为用户目录
npm config set prefix "$env:APPDATA\npm"

# 添加到 PATH（永久）
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:APPDATA\npm",
    "User"
)
```

### 长路径问题

Windows 默认限制路径为 260 个字符。要启用长路径：

1. 打开 **组策略编辑器** (`gpedit.msc`)
2. 导航到：Computer Configuration → Administrative Templates → System → Filesystem
3. 启用 "Enable Win32 long paths"

或通过 PowerShell（需要管理员权限）：

```powershell
# 以管理员身份运行
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### SSL/证书错误

```powershell
# 如果 npm 显示 SSL 错误
npm config set strict-ssl false

# 更好的方法：更新证书
npm config set cafile ""
npm config delete cafile
```

### 安装后 Node.js 未找到

```powershell
# 刷新环境变量
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 或重启 PowerShell/Terminal
```

### 防病毒软件阻止 npm

某些防病毒软件会阻止 npm 操作：

1. 添加排除项：
   - `%APPDATA%\npm`
   - `%APPDATA%\npm-cache`
   - `%USERPROFILE%\node_modules`
   - 您的项目目录

2. 在安装期间临时禁用实时扫描（不建议用于生产）

### Git 行尾问题

```powershell
# 为 Windows 配置 Git
git config --global core.autocrlf true
git config --global core.eol crlf

# 对于特定项目（Unix 风格）
git config core.autocrlf input
```

### GitHub CLI 认证

```powershell
# 检查状态
gh auth status

# 重新认证
gh auth login --web

# 如果在公司代理后面
$env:HTTPS_PROXY = "http://proxy.company.com:8080"
gh auth login
```

### PowerShell 配置文件问题

如果找不到命令，请检查您的配置文件：

```powershell
# 查看配置文件路径
$PROFILE

# 如果不存在，创建配置文件
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# 添加 npm 全局路径
Add-Content $PROFILE "`n`$env:Path += `";$env:APPDATA\npm`""
```

---

## WSL 集成（可选）

对于希望在 Windows 中使用 Linux 工具的用户：

### 安装 WSL2

```powershell
# 以管理员身份运行
wsl --install

# 安装 Ubuntu（默认）
wsl --install -d Ubuntu

# 提示时重启计算机
```

### 使用 WSL 配置 AIOS

```bash
# 在 WSL 内，遵循 Linux 安装指南
# 参见：docs/installation/linux.md

# 从 WSL 访问 Windows 文件
cd /mnt/c/Users/YourName/projects/my-project

# 为获得最佳性能，将项目保留在 Linux 文件系统中
# 使用：~/projects/ 而不是 /mnt/c/
```

### 跨环境提示

- **Windows IDE + WSL 终端**：将 IDE 指向 WSL 路径
- **Git**：在两个环境中保持一致配置
- **npm**：在运行命令的环境中安装

---

## 企业/公司设置

### 在代理后面

```powershell
# 设置 npm 代理
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 设置 git 代理
git config --global http.proxy http://proxy.company.com:8080

# 设置环境变量
$env:HTTP_PROXY = "http://proxy.company.com:8080"
$env:HTTPS_PROXY = "http://proxy.company.com:8080"
```

### 使用内部 npm 注册表

```powershell
# 设置自定义注册表
npm config set registry https://npm.company.com/

# 或特定范围
npm config set @company:registry https://npm.company.com/
```

### 域加入机器

如果您的机器是域加入的并具有受限策略：

1. 联系 IT 获取 Node.js/npm 批准
2. 请求例外以用于：
   - `%APPDATA%\npm`
   - `%USERPROFILE%\.claude`
   - 项目目录

---

## 更新

要更新现有安装：

```powershell
# 使用 npx（推荐）
npx github:SynkraAI/aios-core install

# 更新程序将：
# - 检测现有安装
# - 将自定义备份到 .aios-backup\
# - 仅更新已更改的文件
# - 保留配置
```

---

## 卸载

详见完整的 [卸载指南](../../uninstallation.md)。

通过 PowerShell 快速卸载：

```powershell
# 从项目中删除 AIOS
Remove-Item -Recurse -Force .aios-core
Remove-Item -Recurse -Force .claude\commands\AIOS

# 删除全局 npm 包
npm uninstall -g @synkra/aios
```

---

## 系统要求

| 要求       | 最小    | 推荐    |
| ---------- | ------- | ------- |
| Windows    | 10 (22H2) | 11    |
| RAM        | 4GB     | 8GB     |
| 磁盘空间   | 1GB     | 5GB     |
| Node.js    | 18.x    | 20.x LTS |
| npm        | 9.x     | 10.x    |
| PowerShell | 5.1     | 7.x (Core) |

---

## PowerShell vs 命令提示符

| 功能        | PowerShell        | 命令提示符       |
| ----------- | --------------- | --------------- |
| 推荐        | ✅ 是            | ⚠️ 基本支持     |
| npm 支持    | ✅ 完全         | ✅ 完全         |
| Git 支持    | ✅ 完全         | ✅ 完全         |
| Tab 补全    | ✅ 高级         | ⚠️ 有限         |
| 脚本支持    | ✅ .ps1 文件   | ⚠️ .bat/.cmd 仅 |

**推荐**：使用 PowerShell 7 或 Windows Terminal 获得最佳体验。

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
