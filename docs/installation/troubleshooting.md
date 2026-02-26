# Synkra AIOS Troubleshooting Guide

> 🌐 **EN** | [PT](../pt/installation/troubleshooting.md) | [ES](../es/installation/troubleshooting.md)

**Version:** 2.1.0
**Last Updated:** 2025-01-24

---

## Table of Contents

- [Quick Diagnosis](#quick-diagnosis)
- [Installation Issues](#installation-issues)
- [Network & Connectivity Issues](#network--connectivity-issues)
- [Permission & Access Issues](#permission--access-issues)
- [OS-Specific Issues](#os-specific-issues)
- [IDE Configuration Issues](#ide-configuration-issues)
- [Agent Activation Issues](#agent-activation-issues)
- [Diagnostic Commands](#diagnostic-commands)
- [Getting Help](#getting-help)

---

## Quick Diagnosis

Run this diagnostic command first to identify common issues:

```bash
npx aios-core status
```

If the status command fails, work through the sections below based on your error message.

---

## Installation Issues

### Issue 1: "npx aios-core is not recognized"

**Symptoms:**

```
'npx' is not recognized as an internal or external command
```

**Cause:** Node.js or npm is not installed or not in PATH.

**Solution:**

```bash
# Check if Node.js is installed
node --version

# If not installed:
# Windows: Download from https://nodejs.org/
# macOS: brew install node
# Linux: nvm install 18

# Verify npm is available
npm --version

# If npm is missing, reinstall Node.js
```

---

### Issue 2: "Inappropriate Installation Directory Detected"

**Symptoms:**

```
⚠️  Inappropriate Installation Directory Detected

Current directory: /Users/username

Synkra AIOS should be installed in your project directory,
not in your home directory or temporary locations.
```

**Cause:** Running the installer from home directory, /tmp, or npx cache.

**Solution:**

```bash
# Navigate to your project directory first
cd /path/to/your/project

# Then run the installer
npx aios-core install
```

---

### Issue 3: "Installation failed: ENOENT"

**Symptoms:**

```
Installation failed: ENOENT: no such file or directory
```

**Cause:** Target directory doesn't exist or has incorrect permissions.

**Solution:**

```bash
# Create the directory first
mkdir -p /path/to/your/project

# Navigate to it
cd /path/to/your/project

# Run installer
npx aios-core install
```

---

### Issue 4: "Node.js version too old"

**Symptoms:**

```
Error: Synkra AIOS requires Node.js 18.0.0 or higher
Current version: 14.17.0
```

**Cause:** Node.js version is below minimum requirement.

**Solution:**

```bash
# Check current version
node --version

# Update using nvm (recommended)
nvm install 18
nvm use 18

# Or download latest LTS from nodejs.org
```

---

### Issue 5: "npm ERR! code E404"

**Symptoms:**

```
npm ERR! code E404
npm ERR! 404 Not Found - GET https://registry.npmjs.org/aios-core
```

**Cause:** Package not found on npm registry (network issue or typo).

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Verify registry
npm config get registry
# Should be: https://registry.npmjs.org/

# If using custom registry, reset to default
npm config set registry https://registry.npmjs.org/

# Retry installation
npx aios-core install
```

---

### Issue 6: "EACCES: permission denied"

**Symptoms:**

```
npm ERR! EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Cause:** Global npm directory has incorrect permissions.

**Solution:**

```bash
# Option 1: Fix npm permissions (Linux/macOS)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
# Add the export line to ~/.bashrc or ~/.zshrc

# Option 2: Use npx instead of global install (recommended)
npx aios-core install

# Option 3: Use nvm to manage Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

---

## Network & Connectivity Issues

### Issue 7: "ETIMEDOUT" or "ECONNREFUSED"

**Symptoms:**

```
npm ERR! code ETIMEDOUT
npm ERR! errno ETIMEDOUT
npm ERR! network request to https://registry.npmjs.org/aios-core failed
```

**Cause:** Network connectivity issue, firewall, or proxy blocking npm.

**Solution:**

```bash
# Check if npm registry is reachable
curl -I https://registry.npmjs.org/

# If behind a proxy, configure npm
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# If using corporate SSL inspection, disable strict SSL (use with caution)
npm config set strict-ssl false

# Retry with verbose logging
npm install aios-core --verbose
```

---

### Issue 8: "SSL Certificate Problem"

**Symptoms:**

```
npm ERR! code UNABLE_TO_GET_ISSUER_CERT_LOCALLY
npm ERR! unable to get local issuer certificate
```

**Cause:** SSL certificate verification failing (common in corporate environments).

**Solution:**

```bash
# Add your company's CA certificate
npm config set cafile /path/to/your/certificate.pem

# Or disable strict SSL (use only if you trust your network)
npm config set strict-ssl false

# Verify and retry
npm config get strict-ssl
npx aios-core install
```

---

### Issue 9: "Connection reset by peer"

**Symptoms:**

```
npm ERR! network socket hang up
npm ERR! network This is a problem related to network connectivity.
```

**Cause:** Unstable internet connection or DNS issues.

**Solution:**

```bash
# Try using different DNS
# Windows: Control Panel > Network > DNS = 8.8.8.8, 8.8.4.4
# Linux: echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# Clear DNS cache
# Windows: ipconfig /flushdns
# macOS: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches

# Retry with a longer timeout
npm config set fetch-timeout 60000
npx aios-core install
```

---

## Permission & Access Issues

### Issue 10: "EPERM: operation not permitted"

**Symptoms:**

```
Error: EPERM: operation not permitted, unlink '/path/to/file'
```

**Cause:** File is locked by another process or insufficient permissions.

**Solution:**

```bash
# Windows: Close all IDE instances, then:
taskkill /f /im node.exe

# macOS/Linux: Check for locked processes
lsof +D /path/to/project

# Kill any process holding files
kill -9 <PID>

# Try installation again
npx aios-core install
```

---

### Issue 11: "Read-only file system"

**Symptoms:**

```
Error: EROFS: read-only file system
```

**Cause:** Trying to install on a read-only mount or system directory.

**Solution:**

```bash
# Verify filesystem is writable
touch /path/to/project/test.txt
# If this fails, the directory is read-only

# Check mount options
mount | grep /path/to/project

# Install to a writable directory instead
cd ~/projects/my-project
npx aios-core install
```

---

### Issue 12: "Directory not empty" during upgrade

**Symptoms:**

```
Error: ENOTEMPTY: directory not empty, rmdir '.aios-core'
```

**Cause:** Existing installation with modified files.

**Solution:**

```bash
# Backup existing installation
mv .aios-core .aios-core.backup

# Run installer with force flag
npx aios-core install --force-upgrade

# If needed, restore custom files from backup
cp .aios-core.backup/custom-files/* .aios-core/
```

---

## OS-Specific Issues

### Windows Issues

#### Issue 13: "PowerShell execution policy"

**Symptoms:**

```
File cannot be loaded because running scripts is disabled on this system.
```

**Solution:**

```powershell
# Check current policy
Get-ExecutionPolicy

# Set to RemoteSigned (recommended)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or use CMD instead of PowerShell
cmd
npx aios-core install
```

#### Issue 14: "Path too long"

**Symptoms:**

```
Error: ENAMETOOLONG: name too long
```

**Solution:**

```powershell
# Enable long paths in Windows 10/11
# Run as Administrator:
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

# Or use a shorter project path
cd C:\dev\proj
npx aios-core install
```

#### Issue 15: "npm not found in Git Bash"

**Symptoms:**

```
bash: npm: command not found
```

**Solution:**

```bash
# Add Node.js to Git Bash path
# In ~/.bashrc or ~/.bash_profile:
export PATH="$PATH:/c/Program Files/nodejs"

# Or use Windows Terminal/CMD/PowerShell instead
```

---

### macOS Issues

#### Issue 16: "Xcode Command Line Tools required"

**Symptoms:**

```
xcode-select: error: command line tools are not installed
```

**Solution:**

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Follow the installation dialog
# Then retry
npx aios-core install
```

#### Issue 17: "Apple Silicon (M1/M2) compatibility"

**Symptoms:**

```
Error: Unsupported architecture: arm64
```

**Solution:**

```bash
# Most packages work natively, but if issues persist:

# Install Rosetta 2 for x86 compatibility
softwareupdate --install-rosetta

# Use x86 version of Node.js (if needed)
arch -x86_64 /bin/bash
nvm install 18
npx aios-core install
```

---

### Linux Issues

#### Issue 18: "libvips dependency error"

**Symptoms:**

```
Error: Cannot find module '../build/Release/sharp-linux-x64.node'
```

**Solution:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential libvips-dev

# Fedora/RHEL
sudo dnf install vips-devel

# Clear npm cache and reinstall
npm cache clean --force
npx aios-core install
```

#### Issue 19: "GLIBC version too old"

**Symptoms:**

```
Error: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.28' not found
```

**Solution:**

```bash
# Check GLIBC version
ldd --version

# If version is too old, use Node.js LTS for your distro:
# Ubuntu 18.04: Use Node.js 16 (max supported)
nvm install 16
nvm use 16

# Or upgrade your Linux distribution
```

---

## IDE Configuration Issues

### Issue 20: "Agents not appearing in IDE"

**Symptoms:** Agent commands (`/dev`, `@dev`) don't work after installation.

**Solution:**

1. Restart your IDE completely (not just reload)
2. Verify files were created:

   ```bash
   # Claude Code
   ls .claude/commands/AIOS/agents/

   # Cursor
   ls .cursor/rules/
   ```

3. Check IDE settings allow custom commands
4. Re-run installation for specific IDE:
   ```bash
   npx aios-core install --ide claude-code
   ```

---

### Issue 21: "Agent shows raw markdown instead of activating"

**Symptoms:** IDE displays the agent file content instead of activating.

**Solution:**

1. Check IDE version is compatible
2. For Cursor: Ensure files have `.mdc` extension
3. For Claude Code: Files should be in `.claude/commands/`
4. Restart IDE after installation

---

## Agent Activation Issues

### Issue 22: "Agent not found" error

**Symptoms:**

```
Error: Agent 'dev' not found in .aios-core/agents/
```

**Solution:**

```bash
# Verify agent files exist
ls .aios-core/agents/

# If missing, reinstall core
npx aios-core install --full

# Check core-config.yaml is valid
cat .aios-core/core-config.yaml
```

---

### Issue 23: "YAML parsing error" in agent

**Symptoms:**

```
YAMLException: bad indentation of a mapping entry
```

**Solution:**

```bash
# Validate YAML syntax
npx yaml-lint .aios-core/agents/dev.md

# Common fixes:
# - Use spaces, not tabs
# - Ensure consistent indentation (2 spaces)
# - Check for special characters in strings (use quotes)

# Reinstall to get clean agent files
mv .aios-core/agents/dev.md .aios-core/agents/dev.md.backup
npx aios-core install --full
```

---

## Diagnostic Commands

### General Diagnostics

```bash
# Check AIOS installation status
npx aios-core status

# List available Squads
npx aios-core install

# Update existing installation
npx aios-core update

# Show verbose logging
npx aios-core install --verbose
```

### System Information

```bash
# Node.js and npm versions
node --version && npm --version

# npm configuration
npm config list

# Environment variables
printenv | grep -i npm
printenv | grep -i node

# Disk space (ensure >500MB free)
df -h .
```

### File Verification

```bash
# Verify .aios-core structure
find .aios-core -type f | wc -l
# Expected: 200+ files

# Check for corrupted YAML
for f in .aios-core/**/*.yaml; do npx yaml-lint "$f"; done

# Verify permissions
ls -la .aios-core/
```

---

## Getting Help

### Before Requesting Help

1. Run `npx aios-core status` and note the output
2. Check this troubleshooting guide
3. Search existing [GitHub Issues](https://github.com/SynkraAI/aios-core/issues)

### Information to Include in Bug Reports

```
**Environment:**
- OS: [Windows 11 / macOS 14 / Ubuntu 22.04]
- Node.js version: [output of `node --version`]
- npm version: [output of `npm --version`]
- IDE: [Claude Code / Cursor / etc.]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Error occurs]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Error Output:**
```

[Paste full error message here]

```

**Additional Context:**
[Any other relevant information]
```

### Support Channels

- **GitHub Issues**: [aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Documentation**: [docs/installation/](./README.md)
- **FAQ**: [faq.md](./faq.md)

---

## Related Documentation

- [FAQ](./faq.md)
