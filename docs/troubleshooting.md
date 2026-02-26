# Synkra AIOS Troubleshooting Guide

> 🌐 **EN** | [PT](./pt/troubleshooting.md) | [ES](./es/troubleshooting.md)

---

This comprehensive guide helps you diagnose and resolve common issues with Synkra AIOS.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Installation Issues](#installation-issues)
3. [Meta-Agent Problems](#meta-agent-problems)
4. [Memory Layer Issues](#memory-layer-issues)
5. [Performance Problems](#performance-problems)
6. [API and Integration Issues](#api-and-integration-issues)
7. [Security and Permission Errors](#security-and-permission-errors)
8. [Platform-Specific Issues](#platform-specific-issues)
9. [Advanced Troubleshooting](#advanced-troubleshooting)
10. [Getting Help](#getting-help)

## Quick Diagnostics

### Run System Doctor

Always start with the built-in diagnostics:

```bash
# Basic diagnostic
npx aios-core doctor

# Auto-fix common issues
npx aios-core doctor --fix

# Verbose output
npx aios-core doctor --verbose

# Check specific component
npx aios-core doctor --component memory-layer
```

### Common Quick Fixes

```bash
# Clear all caches
*memory clear-cache

# Rebuild memory index
*memory rebuild

# Reset configuration
*config --reset

# Update to latest version
npx aios-core update
```

## Installation Issues

### Issue: NPX command not found

**Symptoms:**
```
bash: npx: command not found
```

**Solution:**
```bash
# Check npm version
npm --version

# If npm < 5.2, install npx globally
npm install -g npx

# Or use npm directly
npm exec aios-core init my-project
```

### Issue: Installation fails with permission errors

**Symptoms:**
```
Error: EACCES: permission denied
```

**Solutions:**

**Option 1: Fix npm permissions (Recommended)**
```bash
# Create npm directory
mkdir ~/.npm-global

# Configure npm
npm config set prefix '~/.npm-global'

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Reload shell
source ~/.bashrc
```

**Option 2: Use different directory**
```bash
# Install in user directory
cd ~
npx aios-core init my-project
```

### Issue: Node.js version error

**Symptoms:**
```
Error: Node.js version 18.0.0 or higher required
```

**Solution:**
```bash
# Check current version
node --version

# Update Node.js
# macOS (using Homebrew)
brew upgrade node

# Windows (using Chocolatey)
choco upgrade nodejs

# Linux (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Issue: Installation hangs or times out

**Symptoms:**
- Installation stuck at "Installing dependencies..."
- Network timeout errors

**Solutions:**

```bash
# Use different registry
npm config set registry https://registry.npmjs.org/

# Clear npm cache
npm cache clean --force

# Increase timeout
npm config set fetch-timeout 60000

# Skip dependency installation
npx aios-core init my-project --skip-install

# Then install manually
cd my-project
npm install --verbose
```

### Issue: Disk space error

**Symptoms:**
```
Error: ENOSPC: no space left on device
```

**Solution:**
```bash
# Check available space
df -h

# Clean npm cache
npm cache clean --force

# Remove old node_modules
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Clean temporary files
# macOS/Linux
rm -rf /tmp/npm-*

# Windows
rmdir /s %TEMP%\npm-*
```

## Meta-Agent Problems

### Issue: Meta-agent won't start

**Symptoms:**
```
Error: Failed to initialize meta-agent
```

**Solutions:**

1. **Check configuration:**
```bash
# Verify config exists
ls -la .aios/config.json

# Validate configuration
npx aios-core doctor --component config

# Reset if corrupted
rm .aios/config.json
npx aios-core doctor --fix
```

2. **Check dependencies:**
```bash
# Reinstall core dependencies
npm install

# Verify agent files
ls -la agents/
```

3. **Check environment:**
```bash
# Verify environment variables
cat .env

# Ensure API keys are set
echo "OPENAI_API_KEY=your-key" >> .env
```

### Issue: Commands not recognized

**Symptoms:**
```
Unknown command: *create-agent
```

**Solutions:**

1. **Verify agent activation:**
```bash
# List active agents
*list-agents --active

# Activate meta-agent
*activate meta-agent

# Verify command availability
*help
```

2. **Check command syntax:**
```bash
# Correct syntax uses asterisk
*create-agent my-agent  # ✓ Correct
create-agent my-agent   # ✗ Wrong
```

3. **Reload agents:**
```bash
# Reload all agents
*reload-agents

# Or restart meta-agent
exit
npx aios-core
```

### Issue: Agent creation fails

**Symptoms:**
```
Error: Failed to create agent
```

**Solutions:**

1. **Check permissions:**
```bash
# Verify write permissions
ls -la agents/

# Fix permissions
chmod 755 agents/
```

2. **Validate agent name:**
```bash
# Valid names: lowercase, hyphens
*create-agent my-agent      # ✓ Good
*create-agent MyAgent       # ✗ Bad (uppercase)
*create-agent my_agent      # ✗ Bad (underscore)
*create-agent my-agent-2    # ✓ Good
```

3. **Check for duplicates:**
```bash
# List existing agents
*list-agents

# Remove duplicate if exists
rm agents/duplicate-agent.yaml
```

## Memory Layer Issues

### Issue: Memory search returns no results

**Symptoms:**
- Semantic search finds nothing
- Pattern recognition fails

**Solutions:**

1. **Rebuild memory index:**
```bash
# Clear and rebuild
*memory clear-cache
*memory rebuild --verbose

# Wait for indexing
# Check progress
*memory status
```

2. **Verify memory configuration:**
```bash
# Check config
cat .aios/memory-config.json

# Reset to defaults
*memory reset-config
```

3. **Check index integrity:**
```bash
# Run memory diagnostics
*memory diagnose

# Repair if needed
*memory repair
```

### Issue: Memory layer using too much RAM

**Symptoms:**
- High memory usage
- System slowdown

**Solutions:**

1. **Adjust memory settings:**
```javascript
// Edit .aios/memory-config.json
{
  "maxDocuments": 5000,      // Reduce from 10000
  "chunkSize": 256,          // Reduce from 512
  "cacheSize": 100,          // Reduce from 1000
  "enableCompression": true  // Enable compression
}
```

2. **Clear old data:**
```bash
# Remove old entries
*memory prune --older-than "30 days"

# Optimize storage
*memory optimize
```

3. **Use memory limits:**
```bash
# Set memory limit
export NODE_OPTIONS="--max-old-space-size=1024"

# Run with limited memory
npx aios-core
```

### Issue: LlamaIndex errors

**Symptoms:**
```
Error: LlamaIndex initialization failed
```

**Solutions:**

1. **Check API keys:**
```bash
# Verify OpenAI key for embeddings
echo $OPENAI_API_KEY

# Test API access
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

2. **Use local embeddings:**
```javascript
// .aios/memory-config.json
{
  "embedModel": "local",
  "localModelPath": "./models/embeddings"
}
```

3. **Reinstall LlamaIndex:**
```bash
npm uninstall llamaindex
npm install llamaindex@latest
```

## Performance Problems

### Issue: Slow command execution

**Symptoms:**
- Commands take > 5 seconds
- UI feels sluggish

**Solutions:**

1. **Profile performance:**
```bash
# Enable profiling
*debug enable --profile

# Run slow command
*analyze-framework

# View profile
*debug show-profile
```

2. **Optimize configuration:**
```javascript
// .aios/config.json
{
  "performance": {
    "enableCache": true,
    "parallelOperations": 4,
    "lazyLoading": true,
    "indexUpdateFrequency": "hourly"
  }
}
```

3. **Clean up resources:**
```bash
# Clear caches
*cache clear --all

# Remove unused agents
*cleanup-agents

# Optimize database
*optimize-db
```

### Issue: High CPU usage

**Symptoms:**
- Fan noise
- System lag
- High CPU in task manager

**Solutions:**

1. **Limit concurrent operations:**
```bash
# Set operation limits
*config --set performance.maxConcurrent 2
*config --set performance.cpuThreshold 80
```

2. **Disable real-time features:**
```bash
# Disable real-time indexing
*config --set memory.realTimeIndex false

# Use batch processing
*config --set performance.batchMode true
```

3. **Check for runaway processes:**
```bash
# List all processes
*debug processes

# Kill stuck process
*debug kill-process <pid>
```

## API and Integration Issues

### Issue: API key not working

**Symptoms:**
```
Error: Invalid API key
Error: 401 Unauthorized
```

**Solutions:**

1. **Verify API key format:**
```bash
# OpenAI
echo $OPENAI_API_KEY
# Should start with "sk-"

# Anthropic
echo $ANTHROPIC_API_KEY
# Should start with "sk-ant-"
```

2. **Test API directly:**
```bash
# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

3. **Check rate limits:**
```bash
# View current usage
*api-status

# Switch to different provider
*config --set ai.provider anthropic
```

### Issue: Network connection errors

**Symptoms:**
```
Error: ECONNREFUSED
Error: getaddrinfo ENOTFOUND
```

**Solutions:**

1. **Check proxy settings:**
```bash
# Corporate proxy
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Test connection
curl -I https://api.openai.com
```

2. **Use offline mode:**
```bash
# Enable offline mode
*config --set offline true

# Use local models
*config --set ai.provider local
```

3. **Configure timeouts:**
```bash
# Increase timeouts
*config --set network.timeout 30000
*config --set network.retries 3
```

## Security and Permission Errors

### Issue: Permission denied errors

**Symptoms:**
```
Error: EACCES: permission denied
Error: Cannot write to file
```

**Solutions:**

1. **Fix file permissions:**
```bash
# Fix project permissions
chmod -R 755 .
chmod 600 .env

# Fix specific directories
chmod 755 agents/ tasks/ workflows/
```

2. **Check file ownership:**
```bash
# View ownership
ls -la

# Fix ownership (Linux/macOS)
sudo chown -R $(whoami) .
```

3. **Run with correct user:**
```bash
# Don't use sudo for npm
npm install  # ✓ Good
sudo npm install  # ✗ Bad
```

### Issue: Sensitive data exposed

**Symptoms:**
- API keys visible in logs
- Credentials in error messages

**Solutions:**

1. **Secure environment variables:**
```bash
# Check .gitignore
cat .gitignore | grep .env

# Add if missing
echo ".env" >> .gitignore
echo ".aios/logs/" >> .gitignore
```

2. **Enable secure mode:**
```bash
# Enable security features
*config --set security.maskSensitive true
*config --set security.secureLogging true
```

3. **Rotate compromised keys:**
```bash
# Generate new keys from providers
# Update .env file
# Clear logs
rm -rf .aios/logs/*
```

## Platform-Specific Issues

### Windows Issues

#### Issue: Path too long errors
```
Error: ENAMETOOLONG
```

**Solution:**
```powershell
# Enable long paths (Run as Administrator)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Or use shorter paths
cd C:\
npx aios-core init myapp
```

#### Issue: Scripts disabled
```
Error: Scripts is disabled on this system
```

**Solution:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS Issues

#### Issue: Command Line Tools missing
```
Error: xcrun: error: invalid active developer path
```

**Solution:**
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

#### Issue: Gatekeeper blocks execution
```
Error: "aios-core" cannot be opened
```

**Solution:**
```bash
# Allow execution
sudo spctl --master-disable

# Or remove quarantine
xattr -d com.apple.quarantine /usr/local/bin/aios-core
```

### Linux Issues

#### Issue: Missing dependencies
```
Error: libssl.so.1.1: cannot open shared object file
```

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libssl-dev

# RHEL/CentOS
sudo yum install openssl-devel

# Arch
sudo pacman -S openssl
```

## Advanced Troubleshooting

### Enable Debug Mode

```bash
# Full debug output
export DEBUG=aios:*
npx aios-core

# Specific components
export DEBUG=aios:memory,aios:agent
```

### Analyze Logs

```bash
# View recent logs
tail -f .aios/logs/aios.log

# Search for errors
grep -i error .aios/logs/*.log

# View structured logs
*logs --format json --level error
```

### Create Diagnostic Report

```bash
# Generate full diagnostic
npx aios-core doctor --report diagnostic.json

# Include system info
npx aios-core info --detailed >> diagnostic.json

# Create support bundle
tar -czf aios-support.tar.gz .aios/logs diagnostic.json
```

### Performance Profiling

```javascript
// Enable profiling in config
{
  "debug": {
    "profiling": true,
    "profileOutput": ".aios/profiles/"
  }
}
```

```bash
# Analyze profile
*debug analyze-profile .aios/profiles/latest.cpuprofile
```

### Memory Dump Analysis

```bash
# Create heap snapshot
*debug heap-snapshot

# Analyze memory usage
*debug memory-report

# Find memory leaks
*debug find-leaks
```

## Getting Help

### Before Asking for Help

1. **Run diagnostics:**
   ```bash
   npx aios-core doctor --verbose > diagnostic.log
   ```

2. **Collect information:**
   - Node.js version: `node --version`
   - NPM version: `npm --version`
   - OS and version: `uname -a` or `ver`
   - AIOS version: `npx aios-core version`

3. **Check existing issues:**
   - [GitHub Issues](https://github.com/aios-core/aios-core/issues)
   - [Discussions](https://github.com/aios-core/aios-core/discussions)

### Community Support

- **Discord**: [Join our server](https://discord.gg/gk8jAdXWmj)
  - `#help` - General help
  - `#bugs` - Bug reports
  - `#meta-agent` - Meta-agent specific

- **GitHub Discussions**: Technical questions and feature requests

- **Stack Overflow**: Tag questions with `aios-core`

### Reporting Bugs

Create detailed bug reports:

```markdown
## Environment
- OS: macOS 13.0
- Node: 18.17.0
- AIOS: 1.0.0

## Steps to Reproduce
1. Run `npx aios-core init test`
2. Select "enterprise" template
3. Error occurs during installation

## Expected Behavior
Installation completes successfully

## Actual Behavior
Error: Cannot find module 'inquirer'

## Logs
[Attach diagnostic.log]

## Additional Context
Using corporate proxy
```

### Emergency Recovery

If all else fails:

```bash
# Backup current state
cp -r .aios .aios.backup

# Complete reset
rm -rf .aios node_modules package-lock.json
npm cache clean --force

# Fresh install
npm install
npx aios-core doctor --fix

# Restore data if needed
cp .aios.backup/memory.db .aios/
```

---

**Remember**: Most issues can be resolved with:
1. `npx aios-core doctor --fix`
2. Clearing caches
3. Updating to latest version
4. Checking permissions

When in doubt, the community is here to help! 🚀