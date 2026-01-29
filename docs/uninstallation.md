# Uninstallation Guide

> 🌐 **EN** | [PT](./pt/uninstallation.md) | [ES](./es/uninstallation.md)

---

This guide provides comprehensive instructions for uninstalling Synkra AIOS from your system.

## Table of Contents

1. [Before You Uninstall](#before-you-uninstall)
2. [Quick Uninstall](#quick-uninstall)
3. [Complete Uninstall](#complete-uninstall)
4. [Selective Uninstall](#selective-uninstall)
5. [Data Preservation](#data-preservation)
6. [Clean System Removal](#clean-system-removal)
7. [Troubleshooting Uninstall](#troubleshooting-uninstall)
8. [Post-Uninstall Cleanup](#post-uninstall-cleanup)
9. [Reinstallation](#reinstallation)

## Before You Uninstall

### Important Considerations

⚠️ **Warning**: Uninstalling Synkra AIOS will:

- Remove all framework files
- Delete agent configurations (unless preserved)
- Clear memory layer data (unless backed up)
- Remove all custom workflows
- Delete logs and temporary files

### Pre-Uninstall Checklist

- [ ] Backup important data
- [ ] Export custom agents and workflows
- [ ] Save API keys and configurations
- [ ] Document custom modifications
- [ ] Stop all running processes
- [ ] Inform team members

### Backup Your Data

```bash
# Create complete backup
npx @synkra/aios-core backup --complete

# Or manually backup important directories
tar -czf aios-backup-$(date +%Y%m%d).tar.gz \
  .aios/ \
  agents/ \
  workflows/ \
  tasks/ \
  --exclude=.aios/logs \
  --exclude=.aios/cache
```

## Quick Uninstall

### Using Built-in Uninstaller

The fastest way to uninstall Synkra AIOS:

```bash
# Basic uninstall (preserves user data)
npx @synkra/aios-core uninstall

# Complete uninstall (removes everything)
npx @synkra/aios-core uninstall --complete

# Uninstall with data preservation
npx @synkra/aios-core uninstall --keep-data
```

### Interactive Uninstall

For guided uninstallation:

```bash
npx @synkra/aios-core uninstall --interactive
```

This will prompt you for:

- What to keep/remove
- Backup options
- Confirmation for each step

## Complete Uninstall

### Step 1: Stop All Services

```bash
# Stop all running agents
*deactivate --all

# Stop all workflows
*stop-workflow --all

# Shutdown meta-agent
*shutdown
```

### Step 2: Export Important Data

```bash
# Export configurations
*export config --destination backup/config.json

# Export agents
*export agents --destination backup/agents/

# Export workflows
*export workflows --destination backup/workflows/

# Export memory data
*export memory --destination backup/memory.zip
```

### Step 3: Run Uninstaller

```bash
# Complete removal
npx @synkra/aios-core uninstall --complete --no-backup
```

### Step 4: Remove Global Installation

```bash
# Remove global npm package
npm uninstall -g @synkra/aios-core

# Remove npx cache
npm cache clean --force
```

### Step 5: Clean System Files

#### Windows

```powershell
# Remove AppData files
Remove-Item -Recurse -Force "$env:APPDATA\@synkra/aios-core"

# Remove temp files
Remove-Item -Recurse -Force "$env:TEMP\aios-*"

# Remove registry entries (if any)
Remove-Item -Path "HKCU:\Software\Synkra AIOS" -Recurse
```

#### macOS/Linux

```bash
# Remove config files
rm -rf ~/.aios
rm -rf ~/.config/@synkra/aios-core

# Remove cache
rm -rf ~/.cache/@synkra/aios-core

# Remove temp files
rm -rf /tmp/aios-*
```

## Selective Uninstall

### Remove Specific Components

```bash
# Remove only agents
npx @synkra/aios-core uninstall agents

# Remove only workflows
npx @synkra/aios-core uninstall workflows

# Remove memory layer
npx @synkra/aios-core uninstall memory-layer

# Remove specific agent
*uninstall agent-name
```

### Keep Core, Remove Extensions

```bash
# Remove all plugins
*plugin remove --all

# Remove Squads
rm -rf Squads/

# Remove custom templates
rm -rf templates/custom/
```

## Data Preservation

### What to Keep

Before uninstalling, identify what you want to preserve:

1. **Custom Agents**

   ```bash
   # Copy custom agents
   cp -r agents/custom/ ~/aios-backup/agents/
   ```

2. **Workflows and Tasks**

   ```bash
   # Copy workflows
   cp -r workflows/ ~/aios-backup/workflows/
   cp -r tasks/ ~/aios-backup/tasks/
   ```

3. **Memory Data**

   ```bash
   # Export memory database
   *memory export --format sqlite \
     --destination ~/aios-backup/memory.db
   ```

4. **Configurations**

   ```bash
   # Copy all config files
   cp .aios/config.json ~/aios-backup/
   cp .env ~/aios-backup/
   ```

5. **Custom Code**
   ```bash
   # Find and backup custom files
   find . -name "*.custom.*" -exec cp {} ~/aios-backup/custom/ \;
   ```

### Preservation Script

Create `preserve-data.sh`:

```bash
#!/bin/bash
BACKUP_DIR="$HOME/aios-backup-$(date +%Y%m%d-%H%M%S)"

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup function
backup_if_exists() {
    if [ -e "$1" ]; then
        echo "Backing up $1..."
        cp -r "$1" "$BACKUP_DIR/"
    fi
}

# Backup all important data
backup_if_exists ".aios"
backup_if_exists "agents"
backup_if_exists "workflows"
backup_if_exists "tasks"
backup_if_exists "templates"
backup_if_exists ".env"
backup_if_exists "package.json"

echo "Backup completed at: $BACKUP_DIR"
```

## Clean System Removal

### Complete Cleanup Script

Create `clean-uninstall.sh`:

```bash
#!/bin/bash
echo "Synkra AIOS Complete Uninstall"
echo "================================="

# Confirmation
read -p "This will remove ALL Synkra AIOS data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Stop all processes
echo "Stopping all processes..."
pkill -f "@synkra/aios-core" || true
pkill -f "aios-developer" || true

# Remove project files
echo "Removing project files..."
rm -rf .aios/
rm -rf agents/
rm -rf workflows/
rm -rf tasks/
rm -rf templates/
rm -rf Squads/
rm -rf node_modules/@synkra/aios-core/

# Remove global files
echo "Removing global files..."
npm uninstall -g @synkra/aios-core

# Remove user data
echo "Removing user data..."
rm -rf ~/.aios
rm -rf ~/.config/@synkra/aios-core
rm -rf ~/.cache/@synkra/aios-core

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Remove from package.json
echo "Updating package.json..."
npm uninstall @synkra/aios-core/core
npm uninstall @synkra/aios-core/memory
npm uninstall @synkra/aios-core/meta-agent

echo "Uninstall complete!"
```

### Registry Cleanup (Windows)

```powershell
# PowerShell script for Windows cleanup
Write-Host "Cleaning Synkra AIOS from Windows Registry..."

# Remove from PATH
$path = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = ($path.Split(';') | Where-Object { $_ -notmatch '@synkra/aios-core' }) -join ';'
[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")

# Remove registry keys
Remove-ItemProperty -Path "HKCU:\Environment" -Name "AIOS_*" -ErrorAction SilentlyContinue

# Remove file associations
Remove-Item -Path "HKCU:\Software\Classes\.aios" -Recurse -ErrorAction SilentlyContinue

Write-Host "Registry cleanup complete!"
```

## Troubleshooting Uninstall

### Common Issues

#### 1. Permission Denied

```bash
# Linux/macOS
sudo npx @synkra/aios-core uninstall --complete

# Windows (Run as Administrator)
npx @synkra/aios-core uninstall --complete
```

#### 2. Process Still Running

```bash
# Force stop all processes
# Linux/macOS
killall -9 node
killall -9 @synkra/aios-core

# Windows
taskkill /F /IM node.exe
taskkill /F /IM @synkra/aios-core.exe
```

#### 3. Files Locked

```bash
# Find processes using files
# Linux/macOS
lsof | grep aios

# Windows (PowerShell)
Get-Process | Where-Object {$_.Path -like "*aios*"}
```

#### 4. Incomplete Removal

```bash
# Manual cleanup
find . -name "*aios*" -type d -exec rm -rf {} +
find . -name "*.aios*" -type f -delete
```

### Force Uninstall

If normal uninstall fails:

```bash
#!/bin/bash
# force-uninstall.sh
echo "Force uninstalling Synkra AIOS..."

# Kill all related processes
pkill -9 -f aios || true

# Remove all files
rm -rf .aios* aios* *aios*
rm -rf agents workflows tasks templates
rm -rf node_modules/@synkra/aios-core
rm -rf ~/.aios* ~/.config/aios* ~/.cache/aios*

# Clean npm
npm cache clean --force
npm uninstall -g @synkra/aios-core

echo "Force uninstall complete!"
```

## Post-Uninstall Cleanup

### 1. Verify Removal

```bash
# Check for remaining files
find . -name "*aios*" 2>/dev/null
find ~ -name "*aios*" 2>/dev/null

# Check npm packages
npm list -g | grep aios
npm list | grep aios

# Check running processes
ps aux | grep aios
```

### 2. Clean Environment Variables

```bash
# Remove from .bashrc/.zshrc
sed -i '/AIOS_/d' ~/.bashrc
sed -i '/@synkra/aios-core/d' ~/.bashrc

# Remove from .env files
find . -name ".env*" -exec sed -i '/AIOS_/d' {} \;
```

### 3. Update Project Files

```javascript
// Remove from package.json scripts
{
  "scripts": {
    // Remove these entries
    "aios": "@synkra/aios-core",
    "meta-agent": "@synkra/aios-core meta-agent"
  }
}
```

### 4. Clean Git Repository

```bash
# Remove AIOS-specific git hooks
rm -f .git/hooks/*aios*

# Update .gitignore
sed -i '/.aios/d' .gitignore
sed -i '/aios-/d' .gitignore

# Commit removal
git add -A
git commit -m "Remove Synkra AIOS"
```

## Reinstallation

### After Complete Uninstall

If you want to reinstall Synkra AIOS:

1. **Wait for cleanup**

   ```bash
   # Ensure all processes stopped
   sleep 5
   ```

2. **Clear npm cache**

   ```bash
   npm cache clean --force
   ```

3. **Fresh installation**
   ```bash
   npx @synkra/aios-core@latest init my-project
   ```

### Restoring from Backup

```bash
# Restore saved data
cd my-project

# Restore configurations
cp ~/aios-backup/config.json .aios/

# Restore agents
cp -r ~/aios-backup/agents/* ./agents/

# Import memory
*memory import ~/aios-backup/memory.zip

# Verify restoration
*doctor --verify-restore
```

## Uninstall Verification Checklist

- [ ] All AIOS processes stopped
- [ ] Project files removed
- [ ] Global npm package uninstalled
- [ ] User configuration files deleted
- [ ] Cache directories cleaned
- [ ] Environment variables removed
- [ ] Registry entries cleaned (Windows)
- [ ] Git repository updated
- [ ] No remaining AIOS files found
- [ ] System PATH updated

## Getting Help

If you encounter issues during uninstallation:

1. **Check Documentation**
   - [FAQ](https://github.com/SynkraAI/aios-core/wiki/faq#uninstall)
   - [Troubleshooting](https://github.com/SynkraAI/aios-core/wiki/troubleshooting)

2. **Community Support**
   - Discord: #uninstall-help
   - GitHub Issues: Label with "uninstall"

3. **Emergency Support**
   ```bash
   # Generate uninstall report
   npx @synkra/aios-core diagnose --uninstall > uninstall-report.log
   ```

---

**Remember**: Always backup your data before uninstalling. The uninstall process is irreversible, and data recovery may not be possible without proper backups.
