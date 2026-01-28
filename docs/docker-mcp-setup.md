# Docker MCP Setup Guide

> **EN**

---

Guide for setting up Docker-based MCP (Model Context Protocol) servers with AIOS.

**Version:** 2.1.0
**Last Updated:** 2026-01-28

---

## Prerequisites

Before setting up Docker MCP, ensure you have:

- **Docker Desktop** installed and running
- **Node.js** 18+ installed
- **AIOS** project initialized
- API keys for desired MCP services (EXA, Apify, etc.)

---

## Installation

### Step 1: Install Docker MCP Toolkit

```bash
# Install the Docker MCP Toolkit
docker mcp install

# Verify installation
docker mcp --version
```

### Step 2: Initialize MCP Configuration

```bash
# Create global MCP structure
aios mcp setup
```

This creates:

- `~/.aios/mcp/` - MCP configuration directory
- `~/.aios/mcp/global-config.json` - Main config file
- `~/.aios/mcp/servers/` - Individual server configs
- `~/.aios/credentials/` - Secure credential storage

### Step 3: Add MCP Servers

```bash
# Add servers from templates
aios mcp add context7
aios mcp add exa
aios mcp add github
```

---

## Configuration

### MCP Architecture

AIOS uses Docker MCP Toolkit as the primary MCP infrastructure:

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                           │
│                         │                                │
│    ┌────────────────────┼────────────────────┐          │
│    │                    │                    │          │
│    ▼                    ▼                    ▼          │
│ playwright      docker-gateway           native tools   │
│ (direct)        (container MCPs)         (Read, Write)  │
│                         │                                │
│              ┌──────────┼──────────┐                    │
│              ▼          ▼          ▼                    │
│            EXA     Context7     Apify                   │
│         (search)   (docs)     (scraping)               │
└─────────────────────────────────────────────────────────┘
```

### Direct in Claude Code (global ~/.claude.json)

| MCP                   | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| **playwright**        | Browser automation, screenshots, web testing   |
| **desktop-commander** | Docker container operations via docker-gateway |

### Inside Docker Desktop (via docker-gateway)

| MCP          | Purpose                                            |
| ------------ | -------------------------------------------------- |
| **EXA**      | Web search, research, company/competitor analysis  |
| **Context7** | Library documentation lookup                       |
| **Apify**    | Web scraping, Actors, social media data extraction |

### Configuration Files

**global-config.json:**

```json
{
  "version": "1.0",
  "servers": {
    "context7": {
      "type": "sse",
      "url": "https://mcp.context7.com/sse",
      "enabled": true
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      },
      "enabled": true
    }
  },
  "defaults": {
    "timeout": 30000,
    "retries": 3
  }
}
```

---

## Available MCPs

### Context7 (Documentation Lookup)

```bash
# Add Context7
aios mcp add context7

# Usage
mcp__context7__resolve-library-id
mcp__context7__query-docs
```

**Use for:**

- Library documentation lookup
- API reference for packages/frameworks
- Getting up-to-date docs for dependencies

### EXA (Web Search)

```bash
# Add EXA
aios mcp add exa

# Set API key
export EXA_API_KEY="your-api-key"

# Usage
mcp__exa__web_search_exa
mcp__exa__get_code_context_exa
```

**Use for:**

- Web searches for current information
- Research and documentation lookup
- Company and competitor research
- Finding code examples online

### Apify (Web Scraping)

```bash
# Add Apify
aios mcp add apify

# Set API token
export APIFY_TOKEN="your-token"

# Usage
mcp__docker-gateway__search-actors
mcp__docker-gateway__call-actor
```

**Use for:**

- Web scraping for social media (Instagram, TikTok, LinkedIn)
- Extracting data from e-commerce sites
- Automated data collection from any website
- RAG-enabled web browsing for AI context

### GitHub (API Integration)

```bash
# Add GitHub
aios mcp add github

# Set token
export GITHUB_TOKEN="your-token"
```

**Use for:**

- GitHub API operations
- Repository management
- PR and issue handling

### Playwright (Browser Automation)

```bash
# Add Playwright
aios mcp add puppeteer
```

**Use for:**

- Browser automation
- Taking screenshots of web pages
- Interacting with websites
- Web scraping and testing

---

## CLI Commands

### Setup Commands

```bash
# Initialize global MCP configuration
aios mcp setup

# Force recreate (backup existing)
aios mcp setup --force
```

### Server Management

```bash
# Add server from template
aios mcp add <server-name>

# Add with custom config
aios mcp add custom-server --config='{"command":"npx","args":["-y","package"]}'

# Remove server
aios mcp remove <server-name>

# Enable/disable servers
aios mcp enable <server-name>
aios mcp disable <server-name>
```

### Status and Listing

```bash
# List configured servers
aios mcp list

# Show detailed status
aios mcp status

# Sync to project
aios mcp sync
```

---

## Environment Variables

### Setting Variables

**macOS/Linux:**

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
export APIFY_TOKEN="your-apify-token"
```

**Windows (PowerShell):**

```powershell
$env:EXA_API_KEY = "your-api-key"
$env:GITHUB_TOKEN = "your-github-token"
$env:APIFY_TOKEN = "your-apify-token"
```

### Persistent Variables

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
export APIFY_TOKEN="your-apify-token"
```

### Secure Credential Storage

```bash
# Add credential
aios mcp credential set EXA_API_KEY "your-api-key"

# Get credential
aios mcp credential get EXA_API_KEY

# List credentials (masked)
aios mcp credential list
```

---

## Troubleshooting

### Common Issues

| Issue                          | Solution                                            |
| ------------------------------ | --------------------------------------------------- |
| Permission denied              | Run terminal as Administrator (Windows) or use sudo |
| Server not starting            | Check command and args, verify package installed    |
| Environment variable not found | Set variable or use credentials storage             |
| Timeout errors                 | Increase timeout in config                          |
| Connection refused             | Check URL and network access                        |

### Docker MCP Secrets Bug (Dec 2025)

**Issue:** Docker MCP Toolkit's secrets store (`docker mcp secret set`) and template interpolation (`{{...}}`) do NOT work properly. Credentials are not passed to containers.

**Symptoms:**

- `docker mcp tools ls` shows "(N prompts)" instead of "(N tools)"
- MCP server starts but fails authentication
- Verbose output shows `-e ENV_VAR` without values

**Workaround:** Edit `~/.docker/mcp/catalogs/docker-mcp.yaml` directly:

```yaml
{ mcp-name }:
  env:
    - name: API_TOKEN
      value: 'actual-token-value-here'
```

**Example - Apify:**

```yaml
apify-mcp-server:
  env:
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
```

**Note:** This exposes credentials in a local file. Secure file permissions and never commit this file.

### Common Fixes

```bash
# Reset global config
aios mcp setup --force

# Clear cache
rm -rf ~/.aios/mcp/cache/*

# Verify config
aios mcp status --verbose

# Test server manually
npx -y @modelcontextprotocol/server-github
```

---

## MCP Governance

**Important:** All MCP infrastructure management is handled exclusively by the **DevOps Agent (@devops / Felix)**.

| Operation          | Agent  | Command             |
| ------------------ | ------ | ------------------- |
| Search MCP catalog | DevOps | `*search-mcp`       |
| Add MCP server     | DevOps | `*add-mcp`          |
| List enabled MCPs  | DevOps | `*list-mcps`        |
| Remove MCP server  | DevOps | `*remove-mcp`       |
| Setup Docker MCP   | DevOps | `*setup-mcp-docker` |

Other agents (Dev, Architect, etc.) are MCP **consumers**, not administrators. If MCP management is needed, delegate to @devops.

---

## Tool Selection Priority

Always prefer native Claude Code tools over MCP servers:

| Task             | USE THIS               | NOT THIS       |
| ---------------- | ---------------------- | -------------- |
| Read files       | `Read` tool            | docker-gateway |
| Write files      | `Write` / `Edit` tools | docker-gateway |
| Run commands     | `Bash` tool            | docker-gateway |
| Search files     | `Glob` tool            | docker-gateway |
| Search content   | `Grep` tool            | docker-gateway |
| List directories | `Bash(ls)` or `Glob`   | docker-gateway |

### When to Use docker-gateway

Only use docker-gateway when:

1. User explicitly says "use docker" or "use container"
2. User explicitly mentions "Desktop Commander"
3. Task specifically requires Docker container operations
4. Accessing MCPs running inside Docker (EXA, Context7)
5. User asks to run something inside a Docker container

---

## Related Documentation

- [Docker Gateway Tutorial](./guides/mcp/docker-gateway-tutorial.md)
- [Desktop Commander MCP Guide](./guides/mcp/desktop-commander.md)
- [MCP Global Setup Guide](./guides/mcp-global-setup.md)
- [MCP Architecture Diagrams](./architecture/mcp-system-diagrams.md)
- [DevOps Agent Reference](./agent-reference-guide.md#devops)

---

_Synkra AIOS Docker MCP Setup Guide v2.1.0_
