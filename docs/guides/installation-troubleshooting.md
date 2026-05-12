# AIOX-Core Installation & Troubleshooting Guide

> **EN** | [PT](../pt/guides/installation-troubleshooting.md) | [ES](../es/guides/installation-troubleshooting.md)

---

## Quick Start

```bash
npx aiox-core@latest
```

This command downloads and runs the latest version of AIOX-Core installer.

## System Requirements

| Requirement | Minimum Version | Check Command |
|-------------|-----------------|---------------|
| **Node.js** | v18.0.0+ | `node --version` |
| **npm** | v9.0.0+ | `npm --version` |
| **npx** | (included with npm 5.2+) | `npx --version` |
| **Git** | Any recent version (optional) | `git --version` |

### Download Links

- **Node.js**: https://nodejs.org/ (Download LTS version - includes npm & npx)
- **Git**: https://git-scm.com/ (Optional, but recommended)

---

## Installation Methods

### Method 1: npx (Recommended)

```bash
# Install in current directory
npx aiox-core@latest

# Install with specific version
npx aiox-core@2.2.0

# Show version
npx aiox-core@latest --version

# Show help
npx aiox-core@latest --help
```

### Method 2: From GitHub

```bash
npx github:SynkraAI/aiox-core install
```

### Method 3: Global Installation

```bash
npm install -g aiox-core
aiox-core
```

---

## Diagnostic Tool

If you're having installation issues, run our diagnostic tool:

### Windows (CMD)
```cmd
curl -o diagnose.cmd https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/quick-diagnose.cmd && diagnose.cmd
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/quick-diagnose.ps1 | iex
```

### macOS/Linux
```bash
curl -fsSL https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/diagnose-installation.js | node
```

---

## Common Issues & Solutions

### Issue 1: "Node.js version too old"

**Error:**
```
error engine Unsupported engine
error notsup Required: {"node":">=18.0.0"}
```

**Solution:**
1. Download Node.js LTS from https://nodejs.org/
2. Install and restart your terminal
3. Verify: `node --version` (should show v18+ or v20+)

---

### Issue 2: "npm version too old"

**Error:**
```
npm ERR! Required: {"npm":">=9.0.0"}
```

**Solution:**
```bash
# Update npm globally
npm install -g npm@latest

# Verify
npm --version
```

---

### Issue 3: "npx not found" or "npx command not recognized"

**Cause:** npm bin folder not in system PATH

**Solution (Windows):**
1. Find npm prefix: `npm config get prefix`
2. Add to PATH:
   - Press Win+X → System → Advanced system settings → Environment Variables
   - Edit "Path" under User variables
   - Add: `C:\Users\YOUR_USERNAME\AppData\Roaming\npm`
3. Restart terminal

**Solution (macOS/Linux):**
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$PATH:$(npm config get prefix)/bin"

# Reload
source ~/.bashrc
```

---

### Issue 4: "EACCES: permission denied"

**Solution (Windows):**
Run terminal as Administrator

**Solution (macOS/Linux):**
```bash
# Fix npm permissions (recommended)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use nvm (best practice)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

---

### Issue 5: "ETIMEDOUT" or "ECONNREFUSED"

**Cause:** Network/firewall blocking npm registry

**Solutions:**

1. **Check npm registry:**
   ```bash
   npm config get registry
   # Should be: https://registry.npmjs.org/
   ```

2. **Reset registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

3. **Test connectivity:**
   ```bash
   npm ping
   ```

4. **Behind corporate proxy:**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

5. **Use mirror (China):**
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

---

### Issue 6: "PowerShell execution policy" (Windows)

**Error:**
```
File cannot be loaded because running scripts is disabled on this system
```

**Solution:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Issue 7: "Cannot find module" or "Missing dependencies"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules if exists
rm -rf node_modules

# Try again
npx aiox-core@latest
```

---

### Issue 8: "SSL/Certificate errors"

**Solution:**
```bash
# Temporarily disable strict SSL (not recommended for production)
npm config set strict-ssl false

# Better: Update certificates
npm config set cafile /path/to/certificate.pem
```

---

### Issue 9: Package shows old version

**Cause:** npm cache serving old version

**Solution:**
```bash
# Clear npx cache
npx clear-npx-cache

# Or force fresh download
npx --ignore-existing aiox-core@latest

# Or use specific version
npx aiox-core@2.2.0
```

---

## Environment Verification Checklist

Run these commands to verify your environment:

```bash
# 1. Check Node.js (need v18+)
node --version

# 2. Check npm (need v9+)
npm --version

# 3. Check npx
npx --version

# 4. Check npm registry access
npm view aiox-core version

# 5. Test installation
npx aiox-core@latest --version
```

**Expected output:**
```
v22.x.x (or v18+/v20+)
11.x.x (or v9+)
11.x.x (same as npm)
2.2.0
2.2.0
```

---

## Getting Help

If you're still having issues:

1. **GitHub Issues**: https://github.com/SynkraAI/aiox-core/issues
2. **Run diagnostics**: `npx aiox-core@latest doctor`
3. **Check system info**: `npx aiox-core@latest info`

When reporting issues, please include:
- Operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Full error message
- Output of diagnostic tool

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npx aiox-core@latest` | Install/run wizard |
| `npx aiox-core@latest --version` | Show version |
| `npx aiox-core@latest --help` | Show help |
| `npx aiox-core@latest install` | Install in current dir |
| `npx aiox-core@latest init <name>` | Create new project |
| `npx aiox-core@latest doctor` | Run diagnostics |
| `npx aiox-core@latest info` | Show system info |

---

*Last updated: December 2025 | AIOX-Core v2.2.0*
