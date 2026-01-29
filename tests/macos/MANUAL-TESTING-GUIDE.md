# Manual Testing Guide for macOS

**Story 1.10b - macOS Testing & Validation**

This guide provides step-by-step instructions for manually testing AIOS on macOS (Intel and Apple Silicon).

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Test Environment Setup](#test-environment-setup)
- [AC1: Intel Mac Installation](#ac1-intel-mac-installation)
- [AC2: Apple Silicon Installation](#ac2-apple-silicon-installation)
- [AC3: Shell Compatibility](#ac3-shell-compatibility)
- [AC4: Path Handling](#ac4-path-handling)
- [AC5: Line Endings](#ac5-line-endings)
- [AC6: File Permissions](#ac6-file-permissions)
- [AC7: Homebrew Integration](#ac7-homebrew-integration)
- [AC8: Performance](#ac8-performance)
- [AC9: Security Compliance](#ac9-security-compliance)
- [AC10: Error Recovery](#ac10-error-recovery)
- [Troubleshooting](#troubleshooting)
- [Reporting Issues](#reporting-issues)

---

## Prerequisites

### Required Software

- **macOS Version:** 10.15 (Catalina) or newer
- **Node.js:** Version 18 or higher
- **npm:** Included with Node.js
- **Terminal:** Built-in Terminal.app or iTerm2

### Optional Software

- **Homebrew:** Package manager for macOS
- **Git:** Version control (usually pre-installed)

### System Information Collection

Before starting tests, collect your system information:

```bash
# Run this command and save the output
sw_vers
uname -a
node --version
npm --version
file $(which node)
```

**Save this output** to include in test reports.

---

## Test Environment Setup

### 1. Clean Environment Preparation

```bash
# Backup existing AIOS installation (if any)
if [ -d "$HOME/.aios" ]; then
    mv "$HOME/.aios" "$HOME/.aios.backup.$(date +%Y%m%d-%H%M%S)"
fi

# Verify backup
ls -la "$HOME/.aios.backup"*
```

### 2. Navigate to Test Directory

```bash
cd path/to/@synkra/aios-core/tests/macos
chmod +x *.sh
```

---

## AC1: Intel Mac Installation

**Platform:** macOS Intel (x86_64)
**Duration:** ~10 minutes
**Automated Script:** `test-intel-installation.sh`

### Manual Steps

#### 1. Verify Architecture

```bash
uname -m
# Expected output: x86_64
```

#### 2. Run Installer

```bash
npx @synkraai/aios@latest init
```

**Follow the wizard prompts:**

- Accept default settings unless specific configuration is needed
- Note any errors or warnings
- Record installation time

#### 3. Verify Installation

```bash
# Check AIOS command availability
which aios
# Expected: /usr/local/bin/aios or similar

# Verify version
aios --version

# Run health check
aios health
```

**Expected Health Check Output:**

```
✓ Browser - Healthy
✓ Context7 - Healthy
✓ Exa - Healthy
✓ Desktop Commander - Healthy
```

#### 4. Verify Architecture

```bash
file $(which node)
# Should contain: x86_64
```

### ✅ Pass Criteria

- [ ] Installation completes without errors
- [ ] All 4 MCPs show as healthy
- [ ] `aios` command works
- [ ] Running on correct architecture (x86_64)

---

## AC2: Apple Silicon Installation

**Platform:** macOS Apple Silicon (arm64) - M1/M2/M3
**Duration:** ~10 minutes
**Automated Script:** `test-apple-silicon-installation.sh`

### Manual Steps

#### 1. Verify Architecture

```bash
uname -m
# Expected output: arm64

# Check chip info
sysctl -n machdep.cpu.brand_string
# Expected: Apple M1/M2/M3...
```

#### 2. Run Installer

```bash
npx @synkraai/aios@latest init
```

#### 3. Verify Native ARM Execution

```bash
file $(which node)
# Should contain: arm64
# NOT x86_64 (which would indicate Rosetta)
```

If running under Rosetta:

```bash
# This is acceptable but not optimal
# Recommend installing native ARM Node.js
```

#### 4. Check Rosetta Availability

```bash
# Verify Rosetta 2 is installed (for compatibility)
/usr/bin/pgrep -q oahd && echo "Rosetta 2 installed" || echo "Rosetta 2 not installed"
```

#### 5. Run Health Check

```bash
aios health
```

### ✅ Pass Criteria

- [ ] Installation completes without errors
- [ ] All 4 MCPs show as healthy
- [ ] Node.js runs natively on ARM (preferred)
- [ ] Or runs under Rosetta (acceptable fallback)

---

## AC3: Shell Compatibility

**Duration:** ~5 minutes
**Automated Script:** `test-shell-compatibility.sh`

### Manual Steps

#### 1. Test in Zsh (Default on modern macOS)

```bash
# Verify current shell
echo $SHELL
# Expected: /bin/zsh

# Check if .zshrc was updated
cat ~/.zshrc | grep -i aios

# Open new terminal window
# Run: aios --version
# Should work without errors
```

#### 2. Test in Bash

```bash
# Switch to bash
bash

# Check if profile was updated
cat ~/.bashrc | grep -i aios
# Or check ~/.bash_profile

# Run AIOS command
aios --version

# Exit bash
exit
```

#### 3. Test PATH Persistence

```bash
# Close terminal completely
# Open new terminal
# Run: aios --version
# Should work immediately without sourcing profiles
```

### ✅ Pass Criteria

- [ ] Works in zsh
- [ ] Works in bash
- [ ] PATH persists across sessions
- [ ] No manual `source` needed

---

## AC4: Path Handling

**Duration:** ~3 minutes
**Automated Script:** `test-path-handling.sh`

### Manual Steps

#### 1. Verify Forward Slashes

```bash
# Check AIOS installation path
which aios
# Should use forward slashes: /usr/local/bin/aios
# NOT backslashes: \usr\local\bin\aios
```

#### 2. Test Tilde Expansion

```bash
# Navigate using ~
cd ~/.aios
pwd
# Should show full path: /Users/username/.aios
```

#### 3. Test Symlinks

```bash
# Check if aios command is a symlink
ls -la $(which aios)
# Note if it points to another location
```

### ✅ Pass Criteria

- [ ] All paths use forward slashes
- [ ] Tilde (~/) expands correctly
- [ ] Symlinks work properly
- [ ] No backslash errors

---

## AC5: Line Endings

**Duration:** ~2 minutes
**Automated Script:** `test-line-endings.sh`

### Manual Steps

#### 1. Check Generated Files

```bash
# Check line endings of AIOS config
file ~/.aios/config.json
# Should show: ASCII text (LF line endings)
# NOT: ASCII text, with CRLF line endings

# Check for carriage returns
grep -r $'\r' ~/.aios/ || echo "No CRLF found - PASS"
```

#### 2. Verify Git Configuration

```bash
git config --get core.autocrlf
# Recommended: input or false (Unix-style)
```

### ✅ Pass Criteria

- [ ] All files use LF endings (not CRLF)
- [ ] No `^M` characters in files
- [ ] Git configured correctly

---

## AC6: File Permissions

**Duration:** ~3 minutes
**Automated Script:** `test-permissions.sh`

### Manual Steps

#### 1. Check Script Executability

```bash
# List scripts with permissions
ls -la ~/.aios/bin/*.sh 2>/dev/null
# Should show: -rwxr-xr-x (executable)

# Try running a script without chmod
~/.aios/bin/some-script.sh
# Should execute without "Permission denied"
```

#### 2. Check Config File Permissions

```bash
# Check config permissions
ls -l ~/.aios/config.json
# Should be: -rw-r--r-- (644) or -rw------- (600)
```

#### 3. Verify No Sudo Required

```bash
# Check ownership
ls -ld ~/.aios
# Should show your username as owner

# Test npm without sudo
npm list -g --depth=0
# Should work without "EACCES" errors
```

### ✅ Pass Criteria

- [ ] Scripts are executable
- [ ] Config files have correct permissions
- [ ] User owns all AIOS files
- [ ] No sudo required

---

## AC7: Homebrew Integration

**Duration:** ~5 minutes
**Automated Script:** `test-homebrew-integration.sh`

### Manual Steps

#### 1. Detect Homebrew

```bash
# Check if Homebrew is installed
brew --version

# Check Homebrew prefix
brew --prefix
# Intel: /usr/local
# Apple Silicon: /opt/homebrew
```

#### 2. Verify Node.js Source

```bash
# Check if Node installed via Homebrew
brew list node 2>/dev/null && echo "Node via Homebrew" || echo "Node from other source"

# Check npm prefix
npm config get prefix
# Should be user-writable
```

#### 3. Test Package Managers

```bash
# Test npm
npm --version

# Test yarn (if installed)
yarn --version

# Test pnpm (if installed)
pnpm --version
```

### ✅ Pass Criteria

- [ ] Homebrew detected (if installed)
- [ ] Correct prefix for architecture
- [ ] npm works without sudo
- [ ] Compatible with all package managers

---

## AC8: Performance

**Duration:** ~10 minutes
**Automated Script:** `test-performance.sh`

### Manual Steps

#### 1. Measure Installation Time

```bash
# Time the full installation
time npx @synkraai/aios@latest init
# Target: < 5 minutes (300 seconds)
```

**Record the time:**

- real: **\_\_** seconds
- Pass if < 300s

#### 2. Measure Health Check Time

```bash
# Time health check
time aios health
# Target: < 10 seconds
```

#### 3. Measure CLI Response Time

```bash
# Multiple runs for average
time aios --version
time aios --version
time aios --version
# Should be instant (< 1 second)
```

#### 4. Check System Resources

```bash
# CPU cores
sysctl -n hw.ncpu

# Memory
sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}'

# Disk space
df -h ~
```

### ✅ Pass Criteria

- [ ] Installation < 5 minutes
- [ ] Health check < 10 seconds
- [ ] CLI responds instantly
- [ ] System resources adequate

---

## AC9: Security Compliance

**Duration:** ~5 minutes
**Automated Script:** `test-security.sh`

### Manual Steps

#### 1. Check Gatekeeper

```bash
# Check Gatekeeper status
spctl --status
# Should be: assessments enabled

# Check SIP
csrutil status
# Should be: enabled (on most systems)
```

#### 2. Verify No Security Prompts

During installation and normal use, verify:

- [ ] No unexpected security prompts
- [ ] No "unidentified developer" warnings for AIOS
- [ ] No permission requests beyond expected

#### 3. Check Code Signing (if applicable)

```bash
# Check if Node.js is signed
codesign -v $(which node)
# May show unsigned for Homebrew installs (acceptable)
```

### ✅ Pass Criteria

- [ ] Gatekeeper compatibility confirmed
- [ ] No unexpected security prompts
- [ ] SIP enabled (if desired)
- [ ] Normal operations don't require security overrides

---

## AC10: Error Recovery

**Duration:** ~10 minutes
**Automated Script:** `test-error-recovery.sh`

### Manual Steps

#### 1. Test Rollback

```bash
# Create backup
cp -r ~/.aios ~/.aios.backup

# Simulate corruption
echo "corrupted" > ~/.aios/config.json

# Try to recover
mv ~/.aios ~/.aios.broken
mv ~/.aios.backup ~/.aios

# Verify recovery
aios health
```

#### 2. Test Partial Installation Recovery

```bash
# Interrupt installation (Ctrl+C mid-install)
npx @synkraai/aios@latest init
# Press Ctrl+C after a few seconds

# Re-run installation
npx @synkraai/aios@latest init
# Should detect partial state and resume/cleanup
```

#### 3. Verify Error Messages

Intentionally trigger errors:

- Missing Node.js: Uninstall Node temporarily
- Permission denied: `chmod 000 ~/.aios`
- Network timeout: Disconnect internet

**Check that error messages are:**

- [ ] Clear and actionable
- [ ] Include system information
- [ ] Suggest recovery steps

### ✅ Pass Criteria

- [ ] Rollback works correctly
- [ ] Can recover from partial installation
- [ ] Error messages are helpful
- [ ] Logs include system info

---

## Troubleshooting

### Common Issues

#### Installation Fails

**Symptom:** Installation exits with error

**Solution:**

```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm connectivity
npm ping

# Try with verbose logging
npx @synkraai/aios@latest init --verbose
```

#### Command Not Found

**Symptom:** `bash: aios: command not found`

**Solution:**

```bash
# Check if installed
ls -la ~/.aios

# Source shell profile
source ~/.zshrc  # or ~/.bashrc

# Check PATH
echo $PATH | grep -o '/[^:]*aios[^:]*'

# Manually add to PATH if needed
export PATH="$HOME/.aios/bin:$PATH"
```

#### Permission Denied

**Symptom:** Cannot execute scripts or commands

**Solution:**

```bash
# Fix script permissions
chmod +x ~/.aios/bin/*.sh

# Fix ownership
sudo chown -R $(whoami) ~/.aios

# Reset npm permissions
npm config set prefix ~/.npm-global
export PATH="$HOME/.npm-global/bin:$PATH"
```

#### MCP Health Check Fails

**Symptom:** `aios health` shows unhealthy MCPs

**Solution:**

```bash
# Reinstall specific MCP
aios mcp reinstall <mcp-name>

# Check logs
aios logs

# Verify network connectivity
ping npmjs.com
```

---

## Reporting Issues

### Information to Include

When reporting test failures, include:

1. **System Information:**

   ```bash
   sw_vers > system-info.txt
   uname -a >> system-info.txt
   node --version >> system-info.txt
   npm --version >> system-info.txt
   ```

2. **Test Logs:**
   - All files from `/tmp/aios-test-*.log`
   - Screenshot of error messages

3. **Steps to Reproduce:**
   - Exact commands run
   - Expected vs actual behavior

4. **Test Results:**
   - Which tests passed/failed
   - Any workarounds discovered

### Submitting Reports

Create an issue in the project repository with:

- Title: `[Story 1.10b] Test Failure: <AC#> - <Description>`
- Label: `testing`, `macos`
- Include all information above

---

## Quick Reference

### Run All Tests

```bash
cd tests/macos
./run-all-tests.sh
```

### Run Specific Test

```bash
cd tests/macos
./test-intel-installation.sh        # AC1
./test-apple-silicon-installation.sh # AC2
./test-shell-compatibility.sh       # AC3
# ... etc
```

### Clean Test Environment

```bash
# Remove AIOS
rm -rf ~/.aios

# Restore backup
mv ~/.aios.backup ~/.aios
```

---

**Document Version:** 1.0
**Last Updated:** 2025-01-23
**Story:** 1.10b - macOS Testing & Validation
**Reviewed by:** Quinn (QA Guardian) 🛡️
