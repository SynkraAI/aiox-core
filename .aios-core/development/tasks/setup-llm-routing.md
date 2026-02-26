# setup-llm-routing

**Task ID:** setup-llm-routing
**Version:** 1.1.0
**Created:** 2025-12-12
**Updated:** 2025-12-14
**Agent:** @dev (Dex)
**Location:** .aios-core/development/tasks/setup-llm-routing.md

---

## Purpose

Configure LLM routing for Claude Code to use alternative providers (DeepSeek, OpenRouter) instead of or alongside direct Anthropic API. This enables cost reduction of up to 100x while maintaining full Claude Code functionality including tool calling.

**Primary commands installed:**
- `claude-max`: Uses Claude Max subscription (OAuth/claude.ai)
- `claude-free`: Uses DeepSeek API (~$0.14/M tokens)

---

## Quick Install

For most users, just run the installer:

```bash
node .aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

This will:
1. Detect your OS (Windows/Unix)
2. Install `claude-max` and `claude-free` commands
3. Configure paths automatically

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous
- Uses sensible defaults
- **Best for:** Experienced users, quick testing

### 2. Interactive Mode **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** First-time setup

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Operating system is Windows, macOS, or Linux
    blocker: true
    error_message: "Unsupported operating system"

  - [ ] Network connectivity available (for DeepSeek mode)
    blocker: false
    error_message: "Internet required for cloud LLM routing"
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Commands installed in PATH
    blocker: true
    validação: |
      Windows: where claude-free.cmd
      Unix: which claude-free

  - [ ] DEEPSEEK_API_KEY available (for claude-free)
    blocker: false
    validação: |
      Check .env file or environment variable
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] claude-max command works
    blocker: true
    validação: claude-max --version

  - [ ] claude-free command works (with API key)
    blocker: true
    validação: claude-free --version

  - [ ] Tool calling works with DeepSeek
    blocker: true
    validação: Test function call succeeds
```

---

## Process

### Step 1: Run Installer

```bash
# From aios-core root
node .aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

### Step 2: Configure DeepSeek API Key (for claude-free)

#### Option A: Project .env file

```bash
# Create .env in your project root
DEEPSEEK_API_KEY=sk-your-key-here
```

#### Option B: Global environment variable

```bash
# Windows
setx DEEPSEEK_API_KEY "sk-your-key-here"

# Unix
export DEEPSEEK_API_KEY="sk-your-key-here"
# Add to ~/.bashrc or ~/.zshrc for persistence
```

### Step 3: Verify Installation

```bash
# Test claude-max (uses OAuth)
claude-max --version

# Test claude-free (uses DeepSeek)
claude-free --version
```

---

## Usage

### claude-max
Uses your Claude Max subscription via OAuth (claude.ai login).
- No API key required
- Full Claude capabilities
- ~$15/M tokens if using API billing

```bash
claude-max
```

### claude-free
Uses DeepSeek API with Anthropic-compatible endpoint.
- Requires DEEPSEEK_API_KEY
- Tool calling supported
- ~$0.14/M tokens

```bash
claude-free
```

---

## Cost Comparison

| Provider | Input | Output | Notes |
|----------|-------|--------|-------|
| Claude (API) | $15/M | $75/M | Direct Anthropic API |
| Claude (Max) | Included | Included | Subscription-based |
| DeepSeek | $0.07/M | $0.14/M | Native Anthropic endpoint |

**Savings with DeepSeek:** ~99% cost reduction

---

## Troubleshooting

### Command not found
- **Windows:** Ensure `%APPDATA%\npm` is in PATH
- **Unix:** Ensure `/usr/local/bin` or `~/bin` is in PATH

### API key error
1. Create `.env` in project root
2. Add: `DEEPSEEK_API_KEY=sk-your-key`
3. Get key at: <https://platform.deepseek.com/api_keys>

### Tool calling fails
- Verify DeepSeek API endpoint is reachable
- Check API key is valid
- DeepSeek's `/anthropic` endpoint supports tools

---

## References

- [DeepSeek API](<https://platform.deepseek.com/api_keys>)
- [Claude Code Documentation](<https://docs.anthropic.com/claude-code>)
- Tool Definition: `.aios-core/infrastructure/tools/cli/llm-routing.yaml`
- Install Script: `.aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js`

---

## Metadata

```yaml
story: "6.7"
version: 1.1.0
migrated_from: aios-core
dependencies:
  - install-llm-routing.js
  - llm-routing.yaml
tags:
  - llm-routing
  - cost-optimization
  - deepseek
  - claude-max
  - claude-free
updated_at: 2025-12-14
```

---

**Status:** Production Ready
**Tested On:** Windows 11, macOS, Linux
