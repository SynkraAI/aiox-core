# Docker Gateway MCP Tutorial

> **EN**

---

Tutorial for setting up docker-gateway with MCP servers running inside Docker containers.

**Version:** 1.0.0
**Last Updated:** 2026-01-28

---

## What is Docker Gateway?

Docker Gateway is an MCP server that acts as a **bridge** between Claude Code and multiple MCP servers running inside Docker containers.

### Key Benefit: No Extra Token Cost

When MCPs run inside docker-gateway, their tool definitions are **encapsulated** in the container. This means:

| Configuration            | Token Cost           | Tool Definitions in Context   |
| ------------------------ | -------------------- | ----------------------------- |
| Direct in ~/.claude.json | Each MCP adds tokens | Yes, all tool schemas visible |
| Inside docker-gateway    | **No extra cost**    | Encapsulated in container     |

**Why?** Claude Code only sees the docker-gateway tools (`mcp-add`, `mcp-find`, etc.), not the individual tools of each MCP inside. The actual tools are called through the gateway.

---

## Prerequisites

- **Docker Desktop** 4.37+ installed and running
- **Claude Code** CLI installed
- API keys for desired MCP services

---

## Step 1: Initialize Docker MCP Toolkit

```bash
# Initialize the catalog system
docker mcp catalog init

# Verify initialization
docker mcp catalog ls
```

**Expected output:**

```
docker-mcp: Docker MCP Catalog
```

The catalog contains 313+ MCP servers available to enable.

---

## Step 2: Browse Available Servers

```bash
# List all available servers
docker mcp catalog show docker-mcp

# Search for specific server
docker mcp catalog show docker-mcp | grep -i apify
docker mcp catalog show docker-mcp | grep -i exa
```

---

## Step 3: Enable MCP Servers

```bash
# Enable servers you want to use
docker mcp server enable apify-mcp-server
docker mcp server enable exa
docker mcp server enable context7

# List enabled servers
docker mcp server ls
```

---

## Step 4: Configure API Keys

### Method 1: Using Docker MCP Secrets (may have bugs)

```bash
# Set secrets
docker mcp secret set APIFY_TOKEN "your-apify-token"
docker mcp secret set EXA_API_KEY "your-exa-api-key"
```

### Method 2: Edit Catalog File Directly (recommended workaround)

Due to a known bug (Dec 2025), secrets may not be passed to containers correctly.

**Workaround:** Edit `~/.docker/mcp/catalogs/docker-mcp.yaml` directly:

```yaml
# Find your MCP entry and add env values
apify-mcp-server:
  env:
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'

exa:
  env:
    - name: EXA_API_KEY
      value: 'your-exa-api-key-here'
```

⚠️ **Security note:** This exposes credentials in a local file. Set proper file permissions:

```bash
chmod 600 ~/.docker/mcp/catalogs/docker-mcp.yaml
```

---

## Step 5: Configure Claude Code

Add docker-gateway to `~/.claude.json`:

```json
{
  "mcpServers": {
    "docker-gateway": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    }
  }
}
```

Or use the Claude CLI:

```bash
claude mcp add docker-gateway -s user -- docker mcp gateway run
```

---

## Step 6: Verify Setup

```bash
# Check tools available through gateway
docker mcp tools ls

# Expected output shows gateway tools + enabled server tools
# Example: 58 tools (7 gateway + 51 from enabled servers)
```

In Claude Code:

```bash
# List MCP status
claude mcp list

# Should show:
# docker-gateway: docker mcp gateway run - ✓ Connected
```

---

## Using Docker Gateway

### Available Gateway Tools

| Tool                 | Description                       |
| -------------------- | --------------------------------- |
| `mcp-add`            | Add MCP server to current session |
| `mcp-find`           | Search servers in catalog         |
| `mcp-remove`         | Remove MCP server from session    |
| `mcp-exec`           | Execute tool from enabled server  |
| `mcp-config-set`     | Configure MCP server settings     |
| `code-mode`          | Create combined JavaScript tools  |
| `mcp-create-profile` | Save current gateway state        |

### Accessing Tools from Enabled Servers

Once servers are enabled, their tools are available through the gateway:

```
# Apify tools (via docker-gateway)
mcp__docker-gateway__search-actors
mcp__docker-gateway__call-actor
mcp__docker-gateway__apify-slash-rag-web-browser

# EXA tools (via docker-gateway)
mcp__docker-gateway__web_search_exa
mcp__docker-gateway__company_research

# Context7 tools (via docker-gateway)
mcp__docker-gateway__resolve-library-id
mcp__docker-gateway__query-docs
```

---

## Complete Example Configuration

### ~/.claude.json

```json
{
  "mcpServers": {
    "desktop-commander": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander"]
    },
    "docker-gateway": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-playwright"]
    }
  }
}
```

### Result

```
User MCPs (4 servers):
├── desktop-commander  ✓ connected
├── docker-gateway     ✓ connected  (58 tools inside)
├── playwright         ✓ connected
└── n8n-mcp           ✓ connected

Inside docker-gateway:
├── apify-mcp-server   (7 tools)
├── exa                (8 tools)
├── context7           (2 tools)
└── + gateway tools    (7 tools)
```

---

## Troubleshooting

### Gateway Not Starting

```bash
# Check Docker is running
docker info

# Check gateway logs
docker mcp gateway run --verbose
```

### Tools Showing as "(N prompts)" Instead of "(N tools)"

This indicates authentication failure. Use the workaround:

```bash
# Edit catalog directly with hardcoded credentials
nano ~/.docker/mcp/catalogs/docker-mcp.yaml
```

### Server Not Found

```bash
# Update catalog
docker mcp catalog update

# Verify server exists
docker mcp catalog show docker-mcp | grep -i "server-name"
```

### Reset Everything

```bash
# Disable all servers
docker mcp server reset

# Reset catalog
docker mcp catalog reset

# Reinitialize
docker mcp catalog init
```

---

## Best Practices

### 1. Use docker-gateway for API-based MCPs

Put these inside docker-gateway (no host access needed):

- Apify (web scraping APIs)
- EXA (search APIs)
- Context7 (documentation APIs)
- Any cloud/SaaS integrations

### 2. Keep host-access MCPs direct

Keep these in ~/.claude.json directly:

- desktop-commander (needs host file/terminal access)
- playwright (needs host browser)
- filesystem MCPs

### 3. Secure your credentials

```bash
# Set restrictive permissions
chmod 600 ~/.docker/mcp/catalogs/docker-mcp.yaml
chmod 700 ~/.docker/mcp/

# Never commit these files
echo "~/.docker/mcp/" >> ~/.gitignore_global
```

---

## Related Documentation

- [Desktop Commander MCP Guide](./desktop-commander.md)
- [MCP Global Setup Guide](../mcp-global-setup.md)
- [Docker MCP Setup](../../docker-mcp-setup.md)

---

_Docker Gateway MCP Tutorial v1.0.0 - AIOS Framework_
