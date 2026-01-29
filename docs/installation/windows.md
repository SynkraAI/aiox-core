# Windows Installation Guide for Synkra AIOS

> 🌐 [EN](windows.md) | [PT](../pt/installation/windows.md) | [ES](../es/installation/windows.md)

---

## Supported Versions

| Windows Version     | Status              | Notes                   |
| ------------------- | ------------------- | ----------------------- |
| Windows 11          | ✅ Fully Supported  | Recommended             |
| Windows 10 (22H2+)  | ✅ Fully Supported  | Requires latest updates |
| Windows 10 (older)  | ⚠️ Limited Support  | Update recommended      |
| Windows Server 2022 | ✅ Fully Supported  |                         |
| Windows Server 2019 | ⚠️ Community Tested |                         |

---

## Prerequisites

### 1. Node.js (v20 or higher)

**Option A: Using the Official Installer (Recommended)**

1. Download from [nodejs.org](https://nodejs.org/)
2. Choose the **LTS** version (20.x or higher)
3. Run the installer with default options
4. Verify installation in PowerShell:

```powershell
node --version  # Should show v20.x.x
npm --version
```

**Option B: Using winget**

```powershell
# Install via Windows Package Manager
winget install OpenJS.NodeJS.LTS

# Restart PowerShell, then verify
node --version
```

**Option C: Using Chocolatey**

```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs-lts -y

# Restart PowerShell
node --version
```

**Option D: Using nvm-windows**

```powershell
# Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
# Install the latest nvm-setup.exe

# After installation, open new PowerShell:
nvm install 20
nvm use 20
```

### 2. Git for Windows

**Using Official Installer (Recommended)**

1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Run installer with these recommended options:
   - ✅ Git from the command line and also from 3rd-party software
   - ✅ Use bundled OpenSSH
   - ✅ Checkout Windows-style, commit Unix-style line endings
   - ✅ Use Windows' default console window

**Using winget**

```powershell
winget install Git.Git
```

**Using Chocolatey**

```powershell
choco install git -y
```

Verify installation:

```powershell
git --version
```

### 3. GitHub CLI

**Using winget (Recommended)**

```powershell
winget install GitHub.cli
```

**Using Chocolatey**

```powershell
choco install gh -y
```

**Using Official Installer**

Download from [cli.github.com](https://cli.github.com/)

Authenticate:

```powershell
gh auth login
# Follow prompts, choose "Login with a web browser"
```

### 4. Windows Terminal (Recommended)

For the best experience, use Windows Terminal:

```powershell
winget install Microsoft.WindowsTerminal
```

---

## Installation

### Quick Install

1. Open **PowerShell** or **Windows Terminal**
2. Navigate to your project directory:

   ```powershell
   cd C:\Users\YourName\projects\my-project
   ```

3. Run the installer:

   ```powershell
   npx github:SynkraAI/aios-core install
   ```

### What the Installer Does

The installer automatically:

- ✅ Detects Windows and applies platform-specific configurations
- ✅ Creates necessary directories with proper permissions
- ✅ Configures IDE paths for Windows locations:
  - Cursor: `%APPDATA%\Cursor\`
  - Claude: `%USERPROFILE%\.claude\`
  - Windsurf: `%APPDATA%\Windsurf\`
- ✅ Handles Windows path separators (backslashes)
- ✅ Configures line endings correctly (CRLF for batch, LF for scripts)
- ✅ Sets up npm scripts compatible with cmd.exe and PowerShell

---

## IDE-Specific Setup

### Cursor

1. Download from [cursor.sh](https://cursor.sh/)
2. Run the installer
3. IDE rules are installed to `.cursor\rules\`
4. Keyboard shortcut: `Ctrl+L` to open chat
5. Use `@agent-name` to activate agents

### Claude Code (CLI)

1. Install Claude Code:

   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```

2. Commands are installed to `.claude\commands\AIOS\`
3. Use `/agent-name` to activate agents

### Windsurf

1. Download from [codeium.com/windsurf](https://codeium.com/windsurf)
2. Run the installer
3. Rules are installed to `.windsurf\rules\`
4. Use `@agent-name` to activate agents

### VS Code

1. Install Continue extension from marketplace
2. AIOS can integrate via `.continue\` configuration

---

## Troubleshooting

### Execution Policy Error

If you see `running scripts is disabled`:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set to allow local scripts (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or temporarily bypass for current session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### npm EACCES or Permission Errors

```powershell
# Fix npm cache permissions
npm cache clean --force

# Set npm prefix to user directory
npm config set prefix "$env:APPDATA\npm"

# Add to PATH (permanent)
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:APPDATA\npm",
    "User"
)
```

### Long Path Issues

Windows has a 260 character path limit by default. To enable long paths:

1. Open **Group Policy Editor** (`gpedit.msc`)
2. Navigate to: Computer Configuration → Administrative Templates → System → Filesystem
3. Enable "Enable Win32 long paths"

Or via PowerShell (requires admin):

```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### SSL/Certificate Errors

```powershell
# If npm shows SSL errors
npm config set strict-ssl false

# Better: Update certificates
npm config set cafile ""
npm config delete cafile
```

### Node.js Not Found After Install

```powershell
# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Or restart PowerShell/Terminal
```

### Antivirus Blocking npm

Some antivirus software blocks npm operations:

1. Add exclusions for:
   - `%APPDATA%\npm`
   - `%APPDATA%\npm-cache`
   - `%USERPROFILE%\node_modules`
   - Your project directory

2. Temporarily disable real-time scanning during install (not recommended for production)

### Git Line Ending Issues

```powershell
# Configure Git for Windows
git config --global core.autocrlf true
git config --global core.eol crlf

# For specific project (Unix-style)
git config core.autocrlf input
```

### GitHub CLI Authentication

```powershell
# Check status
gh auth status

# Re-authenticate
gh auth login --web

# If behind corporate proxy
$env:HTTPS_PROXY = "http://proxy.company.com:8080"
gh auth login
```

### PowerShell Profile Issues

If commands aren't found, check your profile:

```powershell
# View profile path
$PROFILE

# Create profile if it doesn't exist
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# Add npm global path
Add-Content $PROFILE "`n`$env:Path += `";$env:APPDATA\npm`""
```

---

## WSL Integration (Optional)

For users who prefer Linux tools within Windows:

### Install WSL2

```powershell
# Run as Administrator
wsl --install

# Install Ubuntu (default)
wsl --install -d Ubuntu

# Restart computer when prompted
```

### Configure AIOS with WSL

```bash
# Inside WSL, follow the Linux installation guide
# See: docs/installation/linux.md

# Access Windows files from WSL
cd /mnt/c/Users/YourName/projects/my-project

# For best performance, keep projects in Linux filesystem
# Use: ~/projects/ instead of /mnt/c/
```

### Cross-Environment Tips

- **Windows IDE + WSL Terminal**: Point IDE to WSL paths
- **Git**: Configure both environments consistently
- **npm**: Install in the environment where you'll run commands

---

## Corporate/Enterprise Setup

### Behind a Proxy

```powershell
# Set npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Set git proxy
git config --global http.proxy http://proxy.company.com:8080

# Set environment variable
$env:HTTP_PROXY = "http://proxy.company.com:8080"
$env:HTTPS_PROXY = "http://proxy.company.com:8080"
```

### Using Internal npm Registry

```powershell
# Set custom registry
npm config set registry https://npm.company.com/

# Or scope-specific
npm config set @company:registry https://npm.company.com/
```

### Domain Joined Machines

If your machine is domain-joined and has restricted policies:

1. Contact IT for Node.js/npm approval
2. Request exceptions for:
   - `%APPDATA%\npm`
   - `%USERPROFILE%\.claude`
   - Project directories

---

## Updating

To update an existing installation:

```powershell
# Using npx (recommended)
npx github:SynkraAI/aios-core install

# The updater will:
# - Detect existing installation
# - Back up customizations to .aios-backup\
# - Update only changed files
# - Preserve configurations
```

---

## Uninstallation

See the complete [Uninstallation Guide](../uninstallation.md) for detailed steps.

Quick uninstall via PowerShell:

```powershell
# Remove AIOS from project
Remove-Item -Recurse -Force .aios-core
Remove-Item -Recurse -Force .claude\commands\AIOS

# Remove global npm packages
npm uninstall -g @synkra/aios
```

---

## System Requirements

| Requirement | Minimum   | Recommended |
| ----------- | --------- | ----------- |
| Windows     | 10 (22H2) | 11          |
| RAM         | 4GB       | 8GB         |
| Disk Space  | 1GB       | 5GB         |
| Node.js     | 18.x      | 20.x LTS    |
| npm         | 9.x       | 10.x        |
| PowerShell  | 5.1       | 7.x (Core)  |

---

## PowerShell vs Command Prompt

| Feature        | PowerShell    | Command Prompt    |
| -------------- | ------------- | ----------------- |
| Recommended    | ✅ Yes        | ⚠️ Basic support  |
| npm support    | ✅ Full       | ✅ Full           |
| Git support    | ✅ Full       | ✅ Full           |
| Tab completion | ✅ Advanced   | ⚠️ Limited        |
| Script support | ✅ .ps1 files | ⚠️ .bat/.cmd only |

**Recommendation**: Use PowerShell 7 or Windows Terminal for the best experience.

---

## Next Steps

1. Configure your IDE (see IDE-specific setup above)
2. Run `*help` in your AI agent to see available commands
3. Start with the [User Guide](../guides/user-guide.md)
4. Join our [Discord Community](https://discord.gg/gk8jAdXWmj) for help

---

## Additional Resources

- [Main README](../../README.md)
- [User Guide](../guides/user-guide.md)
- [Troubleshooting Guide](troubleshooting.md)
- [FAQ](faq.md)
- [Discord Community](https://discord.gg/gk8jAdXWmj)
- [GitHub Issues](https://github.com/SynkraAI/aios-core/issues)
