# LLM Routing Guide

> **EN** | [PT](../pt/guides/llm-routing.md) | [ES](../es/guides/llm-routing.md)

---

**Version:** 1.0.0
**Updated:** 2025-12-14

Cost-effective LLM routing for Claude Code. Save up to 99% on API costs while maintaining full functionality.

---

## Overview

LLM Routing provides two commands for different use cases:

| Command | Provider | Cost | Use Case |
|---------|----------|------|----------|
| `claude-max` | Claude Max (OAuth) | Subscription | Premium experience, complex tasks |
| `claude-free` | DeepSeek | ~$0.14/M tokens | Development, testing, simple tasks |

---

## Quick Start

### Installation

**Option 1: If you have aiox-core cloned**
```bash
# From aiox-core directory
node .aiox-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

**Option 2: Fresh install**
```bash
# Clone the repository
git clone https://github.com/SynkraAI/aiox-core.git
cd aiox-core

# Run the installer
node .aiox-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

### Setup DeepSeek API Key

1. Get your API key at: <https://platform.deepseek.com/api_keys>
2. Add to your project's `.env` file:

```bash
DEEPSEEK_API_KEY=sk-your-key-here
```

### Usage

```bash
# Premium Claude experience (uses your Claude Max subscription)
claude-max

# Cost-effective development (uses DeepSeek ~$0.14/M tokens)
claude-free
```

---

## Commands

### claude-max

Uses your Claude Max subscription via OAuth (claude.ai login).

**Features:**
- Full Claude capabilities
- No API key required
- Uses existing Claude login
- Best for complex reasoning tasks

**Usage:**
```bash
claude-max
```

**When to use:**
- Complex code analysis
- Architectural decisions
- Tasks requiring high accuracy
- Production-critical work

---

### claude-free

Uses DeepSeek API with Anthropic-compatible endpoint.

**Features:**
- Tool calling supported ✅
- Streaming supported ✅
- ~99% cost reduction
- Project `.env` file support

**Usage:**
```bash
claude-free
```

**When to use:**
- Development and testing
- Simple code tasks
- Learning and experimentation
- High-volume operations

---

## Cost Comparison

| Provider | Input Tokens | Output Tokens | Monthly (1M tokens) |
|----------|-------------|---------------|---------------------|
| Claude API | $15.00/M | $75.00/M | $90.00 |
| Claude Max | Included | Included | $20/month |
| **DeepSeek** | **$0.07/M** | **$0.14/M** | **$0.21** |

**Savings with DeepSeek:** Up to 99.7% compared to Claude API

---

## Configuration

### API Key Sources

`claude-free` looks for the DeepSeek API key in this order:

1. **Project `.env` file** (recommended)
   ```bash
   # .env in your project root
   DEEPSEEK_API_KEY=sk-your-key-here
   ```

2. **Environment variable**
   ```bash
   # Windows
   setx DEEPSEEK_API_KEY "sk-your-key-here"

   # Unix (add to ~/.bashrc or ~/.zshrc)
   export DEEPSEEK_API_KEY="sk-your-key-here"
   ```

### Installation Locations

| OS | Install Directory |
|----|-------------------|
| Windows | `%APPDATA%\npm\` |
| macOS/Linux | `/usr/local/bin/` or `~/bin/` |

---

## How It Works

### claude-max
1. Clears all alternative provider settings
2. Uses Claude's default OAuth authentication
3. Launches Claude Code with your Max subscription

### claude-free
1. Searches for `.env` file (current dir → parent dirs)
2. Loads `DEEPSEEK_API_KEY` from `.env` or environment
3. Sets DeepSeek's Anthropic-compatible endpoint
4. Launches Claude Code with DeepSeek backend

**DeepSeek Endpoint:**
```text
https://api.deepseek.com/anthropic
```

This endpoint provides:
- Anthropic API compatibility
- Tool/function calling support
- Streaming responses

### Security Note: Permission Bypass

Both `claude-max` and `claude-free` commands use the `--dangerously-skip-permissions` flag by default. This:

- **Skips confirmation prompts** for file operations, command execution, etc.
- **Should only be used in trusted repositories/environments**
- **Is not recommended for untrusted codebases**

A warning is displayed each time you run these commands. If you prefer interactive confirmations, run `claude` directly instead of using the routing commands.

---

## Troubleshooting

### Command not found

**Windows:**
```powershell
# Check if npm global is in PATH
echo $env:PATH | Select-String "npm"

# If not, add it:
$env:PATH += ";$env:APPDATA\npm"
```

**Unix:**
```bash
# Check PATH
echo $PATH | grep -E "(local/bin|~/bin)"

# If ~/bin not in PATH, add to ~/.bashrc:
export PATH="$HOME/bin:$PATH"
```

### DEEPSEEK_API_KEY not found

1. Verify `.env` file exists in project root
2. Check key format: `DEEPSEEK_API_KEY=sk-...`
3. No spaces around `=`
4. No quotes needed around value

### API errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Verify key at DeepSeek dashboard |
| 429 Rate Limited | Too many requests | Wait and retry |
| Connection refused | Network issue | Check internet connection |

### Tool calling not working

DeepSeek's `/anthropic` endpoint supports tool calling. If tools aren't working:
1. Verify endpoint is `https://api.deepseek.com/anthropic`
2. Check API key has sufficient credits
3. Try a simple test without tools first

---

## Advanced Configuration

### Custom Models

Edit the template files if you need different models:

**Windows:** `.aiox-core/infrastructure/scripts/llm-routing/templates/claude-free.cmd`
**Unix:** `.aiox-core/infrastructure/scripts/llm-routing/templates/claude-free.sh`

Change:
```bash
export ANTHROPIC_MODEL="deepseek-chat"
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_BASE_URL` | API endpoint | `https://api.deepseek.com/anthropic` |
| `ANTHROPIC_API_KEY` | API key | From DEEPSEEK_API_KEY |
| `ANTHROPIC_MODEL` | Model name | `deepseek-chat` |
| `API_TIMEOUT_MS` | Request timeout | `600000` (10 min) |

---

## Uninstallation

### Windows
```powershell
Remove-Item "$env:APPDATA\npm\claude-free.cmd"
Remove-Item "$env:APPDATA\npm\claude-max.cmd"
```

### Unix
```bash
rm /usr/local/bin/claude-free
rm /usr/local/bin/claude-max
# Or if installed in ~/bin:
rm ~/bin/claude-free
rm ~/bin/claude-max
```

---

## Related Resources

- **Tool Definition:** `.aiox-core/infrastructure/tools/cli/llm-routing.yaml`
- **Install Script:** `.aiox-core/infrastructure/scripts/llm-routing/install-llm-routing.js`
- **Task Definition:** `.aiox-core/development/tasks/setup-llm-routing.md`
- **DeepSeek API:** <https://platform.deepseek.com/api_keys>

---

## FAQ

**Q: Is DeepSeek as good as Claude?**
A: DeepSeek is excellent for most coding tasks but may not match Claude's reasoning on complex problems. Use `claude-max` for critical work.

**Q: Can I use both commands in the same session?**
A: Yes! Each command sets its own environment. You can switch between them.

**Q: Does claude-free work offline?**
A: No, it requires internet access to reach DeepSeek's API.

**Q: Are my API keys secure?**
A: Keys are loaded from `.env` files (don't commit these!) or environment variables. Never hardcode keys.

---

*Generated by AIOX Framework - Story 6.7*
