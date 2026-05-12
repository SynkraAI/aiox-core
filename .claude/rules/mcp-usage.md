---
paths: **/*
---

# MCP Server Usage Rules - AIOX Architecture

## MCP Governance

**IMPORTANT:** All MCP infrastructure management is handled EXCLUSIVELY by the **DevOps Agent (@devops / Gage)**.

| Operation | Agent | Command |
|-----------|-------|---------|
| Search MCP catalog | DevOps | `*search-mcp` |
| Add MCP server | DevOps | `*add-mcp` |
| List enabled MCPs | DevOps | `*list-mcps` |
| Remove MCP server | DevOps | `*remove-mcp` |
| Setup Docker MCP | DevOps | `*setup-mcp-docker` |

Other agents (Dev, Architect, etc.) are MCP **consumers**, not administrators. If MCP management is needed, delegate to @devops.

---

## MCP Configuration Architecture

AIOX uses Docker MCP Toolkit as the primary MCP infrastructure:

### Direct in Claude Code (global ~/.claude.json)
| MCP | Purpose |
|-----|---------|
| **playwright** | Browser automation, screenshots, web testing |
| **desktop-commander** | Docker container operations via docker-gateway |

### Inside Docker Desktop (via docker-gateway)

| MCP | Purpose |
|-----|---------|
| **EXA** | Web search, research, company/competitor analysis |
| **Context7** | Library documentation lookup |
| **Apify** | Web scraping, Actors, social media data extraction |

## CRITICAL: Tool Selection Priority

ALWAYS prefer native Claude Code tools over MCP servers:

| Task | USE THIS | NOT THIS |
|------|----------|----------|
| Read files | `Read` tool | docker-gateway |
| Write files | `Write` / `Edit` tools | docker-gateway |
| Run commands | `Bash` tool | docker-gateway |
| Search files | `Glob` tool | docker-gateway |
| Search content | `Grep` tool | docker-gateway |
| List directories | `Bash(ls)` or `Glob` | docker-gateway |

## desktop-commander (docker-gateway) Usage

### ONLY use docker-gateway when:
1. User explicitly says "use docker" or "use container"
2. User explicitly mentions "Desktop Commander"
3. Task specifically requires Docker container operations
4. Accessing MCPs running inside Docker (EXA, Context7)
5. User asks to run something inside a Docker container

### NEVER use docker-gateway for:
- Reading local files (use `Read` tool)
- Writing local files (use `Write` or `Edit` tools)
- Running shell commands on host (use `Bash` tool)
- Searching files (use `Glob` or `Grep` tools)
- Listing directories (use `Bash(ls)` or `Glob`)
- Running Node.js or Python scripts on host (use `Bash` tool)

## playwright MCP Usage

### ONLY use playwright when:
1. User explicitly asks for browser automation
2. User wants to take screenshots of web pages
3. User needs to interact with a website
4. Task requires web scraping or testing
5. Filling forms or clicking elements on web pages

### NEVER use playwright for:
- General file operations
- Running commands
- Anything not related to web browsers

## EXA MCP Usage (via Docker)

### Use EXA (mcp__docker-gateway__web_search_exa) for:
1. Web searches for current information
2. Research and documentation lookup
3. Company and competitor research
4. Finding code examples online

### Access pattern:
```
mcp__docker-gateway__web_search_exa
```

## Context7 MCP Usage (via Docker)

### Use Context7 for:
1. Library documentation lookup
2. API reference for packages/frameworks
3. Getting up-to-date docs for dependencies

### Access pattern:
```
mcp__docker-gateway__resolve-library-id
mcp__docker-gateway__get-library-docs
```

## Apify MCP Usage (via Docker)

### Use Apify for:
1. Searching Actors in Apify Store (web scrapers, automation tools)
2. Running web scrapers for social media (Instagram, TikTok, LinkedIn, etc.)
3. Extracting data from e-commerce sites
4. Automated data collection from any website
5. RAG-enabled web browsing for AI context

### Access pattern (7 tools available):

```text
mcp__docker-gateway__apify-slash-rag-web-browser  # RAG-enabled web browsing
mcp__docker-gateway__search-actors                 # Search for Actors
mcp__docker-gateway__call-actor                    # Run an Actor
mcp__docker-gateway__fetch-actor-details           # Get Actor info/schema
mcp__docker-gateway__get-actor-output              # Get results from Actor run
mcp__docker-gateway__search-apify-docs             # Search Apify documentation
mcp__docker-gateway__fetch-apify-docs              # Fetch documentation page
```

### When to use Apify vs other tools:
| Task | Tool |
|------|------|
| General web search | EXA (`web_search_exa`) |
| Scrape specific website | Apify (`call-actor`) |
| Social media data extraction | Apify (use specialized Actors) |
| Library documentation | Context7 |

---

## Rationale

- **Native tools** execute on the LOCAL system (Windows/Mac/Linux)
- **docker-gateway** executes inside Docker containers (Linux)
- Using docker-gateway for local operations causes path mismatches and failures
- Native tools are faster and more reliable for local file operations
- EXA, Context7, and Apify run inside Docker for isolation and consistent environment
- playwright runs directly for better browser integration with host system

---

## Known Issues

### Docker MCP Secrets Bug (Dec 2025)

**Issue:** Docker MCP Toolkit's secrets store and template interpolation do not work properly. Credentials set via `docker mcp secret set` are NOT passed to containers.

**Symptoms:**
- `docker mcp tools ls` shows "(N prompts)" instead of "(N tools)"
- MCP server starts but fails authentication
- Verbose output shows `-e ENV_VAR` without values

**Workaround:** Edit `~/.docker/mcp/catalogs/docker-mcp.yaml` directly with hardcoded env values:
```yaml
{mcp-name}:
  env:
    - name: API_TOKEN
      value: 'actual-token-value'
```

**Affected MCPs:** Any MCP requiring authentication (Apify, Notion, Slack, etc.)

**Working MCPs:** EXA works because its key is in `~/.docker/mcp/config.yaml` under `apiKeys`

For detailed instructions, see `*add-mcp` task or ask @devops for assistance.
