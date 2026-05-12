# NPX Installation Guide

> 🌐 **EN** | [PT](./pt/npx-install.md) | [ES](./es/npx-install.md)

---

## Overview

Synkra AIOX can be installed via NPX for quick setup without global installation. This guide covers proper usage and troubleshooting for NPX-based installations.

## Quick Start

### Correct Usage

Always run `npx aiox-core install` **from your project directory**:

```bash
# Navigate to your project first
cd /path/to/your/project

# Then run the installer
npx aiox-core install
```

### ⚠️ Common Mistake

**DO NOT** run the installer from your home directory or arbitrary locations:

```bash
# ❌ INCORRECT - Will fail with NPX temporary directory error
cd ~
npx aiox-core install

# ✅ CORRECT - Navigate to project first
cd ~/my-project
npx aiox-core install
```

## Why This Matters

NPX executes packages in **temporary directories** (e.g., `/private/var/folders/.../npx-xxx/` on macOS). When Synkra AIOX runs from these temporary locations, it cannot:

- Detect your IDE configuration correctly
- Install files to the right project directory
- Set up IDE integrations properly

## NPX Temporary Directory Detection

As of version 4.31.1, Synkra AIOX automatically detects when it's running from an NPX temporary directory and displays a helpful error message:

```
⚠️  NPX Temporary Directory Detected

NPX executes in a temporary directory, which prevents
AIOX from detecting your IDE correctly.

Solution:
  cd /path/to/your/project
  npx aiox-core install

See: https://aiox-core.dev/docs/npx-install
```

## Installation Steps

### Step 1: Navigate to Project

```bash
cd /path/to/your/project
```

Your project directory should contain:
- Package management files (`package.json`, etc.)
- Source code directories

### Step 2: Run Installer

```bash
npx aiox-core install
```

### Step 3: Follow Interactive Prompts

The installer will ask you to:
1. Confirm installation directory (should be current directory)
2. Select components to install (Core + Squads)
3. Configure IDE integrations
4. Set up documentation organization

## Platform-Specific Notes

### macOS

NPX temporary directories typically appear at:
- `/private/var/folders/[hash]/T/npx-[random]/`
- `/Users/[user]/.npm/_npx/[hash]/`

Synkra AIOX detects these patterns and prevents incorrect installation.

### Linux

Similar temporary directory patterns:
- `/tmp/npx-[random]/`
- `~/.npm/_npx/[hash]/`

### Windows

Windows users typically don't encounter this issue, but similar detection patterns apply:
- `%TEMP%\npx-[random]\`
- `%APPDATA%\npm-cache\_npx\`

## Troubleshooting

### Error: "NPX Temporary Directory Detected"

**Cause**: You're running the installer from your home directory or another non-project location.

**Solution**:
1. Navigate to your actual project directory:
   ```bash
   cd /path/to/your/actual/project
   ```
2. Re-run the installer:
   ```bash
   npx aiox-core install
   ```

### Wrong Installation Directory

If the installer asks for a directory path:
- ✅ Use `.` (current directory) if you're already in your project
- ✅ Provide absolute path to your project: `/Users/you/projects/my-app`
- ❌ Don't use `~` or relative paths that point outside your project

### IDE Not Detected

If your IDE isn't detected after installation:
1. Verify you ran the installer from the correct project directory
3. Re-run the installer and manually select your IDE

## Alternative: Global Installation

If you prefer not to use NPX, you can install globally:

```bash
npm install -g aiox-core
cd /path/to/your/project
aiox-core install
```

## Technical Details

### Defense in Depth Architecture

Synkra AIOX v4.31.1+ implements two-layer detection:

1. **PRIMARY Layer** (`tools/aiox-npx-wrapper.js`):
   - Checks `__dirname` (where NPX extracts the package)
   - Uses regex patterns for macOS temp paths
   - Early exit before delegation to CLI

2. **SECONDARY Layer** (`tools/installer/bin/aiox.js`):
   - Fallback check using `process.cwd()`
   - Validates at start of install command
   - Provides redundancy if wrapper bypassed

### Detection Patterns

```javascript
const patterns = [
  /\/private\/var\/folders\/.*\/npx-/,  // macOS temp
  /\/\.npm\/_npx\//                      // NPX cache
];
```

## Support

For additional help:
- GitHub Issues: https://github.com/SynkraAIinc/aiox-core/issues
- Documentation: https://aiox-core.dev/docs
- Story Reference: 2.3 - NPX Installation Context Detection

---

**Version**: 4.31.1+
**Last Updated**: 2025-10-22
**Applies To**: macOS (primary), Linux/Windows (detection available)
