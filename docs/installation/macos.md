# macOS Installation Guide for Synkra AIOX

> 🌐 **EN** | [PT](../pt/installation/macos.md) | [ES](../es/installation/macos.md)

## Prerequisites

### 1. Node.js (v20 or higher)

Install Node.js using one of these methods:

**Option A: Using Homebrew (Recommended)**

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option B: Using the official installer**
Download from [nodejs.org](https://nodejs.org/)

**Option C: Using Node Version Manager (nvm)**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 20
nvm use 20
```

### 2. GitHub CLI

Install GitHub CLI for team collaboration:

**Using Homebrew (Recommended)**

```bash
brew install gh
```

**Using MacPorts**

```bash
sudo port install gh
```

**Using the official installer**
Download from [cli.github.com](https://cli.github.com/)

## Installation

### Quick Install

1. Open Terminal
2. Navigate to your project directory:

   ```bash
   cd ~/path/to/your/project
   ```

3. Run the installer:
   ```bash
   npx github:SynkraAI/aiox-core install
   ```

### What the Installer Does

The installer automatically:

- ✅ Detects macOS and applies platform-specific configurations
- ✅ Creates necessary directories with proper permissions
- ✅ Configures IDE paths for macOS locations:
  - Cursor: `~/Library/Application Support/Cursor/`
  - Claude: `~/.claude/`
- ✅ Sets up shell scripts with Unix line endings
- ✅ Handles case-sensitive filesystems properly

## IDE-Specific Setup

### Cursor

1. IDE rules are installed to `.cursor/rules/`
2. Keyboard shortcut: `Cmd+L` to open chat
3. Use `@agent-name` to activate agents

### Claude Code

1. Commands are installed to `.claude/commands/AIOX/`
2. Use `/agent-name` to activate agents


2. Use `@agent-name` to activate agents

## Troubleshooting

### Permission Issues

If you encounter permission errors:

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Fix project permissions
sudo chown -R $(whoami) .aiox-core
```

### GitHub CLI Authentication

After installing GitHub CLI:

```bash
# Authenticate with GitHub
gh auth login

# Choose authentication method (web browser recommended)
```

### Path Issues

If commands are not found:

```bash
# Add to ~/.zshrc or ~/.bash_profile
export PATH="/usr/local/bin:$PATH"

# Reload shell configuration
source ~/.zshrc  # or source ~/.bash_profile
```

### Case Sensitivity

macOS filesystems can be case-insensitive by default. If you experience issues:

1. Check your filesystem:

   ```bash
   diskutil info / | grep "File System"
   ```

2. Synkra AIOX handles both case-sensitive and case-insensitive filesystems automatically

## Updating

To update an existing installation:

```bash
npx github:SynkraAI/aiox-core install
```

The updater will:

- Detect your existing installation
- Back up any customizations
- Update only changed files
- Preserve your configurations

## Next Steps

1. Configure your IDE (see IDE-specific setup above)
2. Run `*help` in your AI agent to see available commands
3. Start with the [User Guide](../guides/user-guide.md)
4. Join our [Discord Community](https://discord.gg/gk8jAdXWmj) for help

## System Requirements

- macOS 10.15 (Catalina) or later
- 4GB RAM minimum (8GB recommended)
- 500MB free disk space
- Internet connection for npm packages

## Additional Resources

- [Main README](../../README.md)
- [User Guide](../guides/user-guide.md)
- [Troubleshooting Guide](../troubleshooting.md)
- [Discord Community](https://discord.gg/gk8jAdXWmj)
