# Task: MCP Server Management Workflow

**Task ID:** mcp-workflow
**Version:** 1.0
**Purpose:** Discover, evaluate, configure, and validate MCP servers for a project's tech stack
**Orchestrator:** @mcp-integrator (Piper)
**Mode:** Interactive (elicit: true)
**Quality Standard:** Fully tested MCP integration with documented context budget

---

## Overview

This task guides the complete lifecycle of MCP server management: from discovering which servers benefit the project, through evaluating their context budget impact, to configuring and testing them in Claude Code.

```
INPUT (project_tech_stack + current_mcps)
    |
[PHASE 1: DISCOVERY]
    -> Scan project for frameworks, languages, services
    -> Match against known MCP server catalog
    -> Identify gaps in current tooling
    |
[PHASE 2: CONTEXT BUDGET EVALUATION]
    -> Calculate token cost per MCP server
    -> Compare total budget against model limits
    -> Recommend add/remove decisions
    |
[PHASE 3: CONFIGURATION]
    -> Choose config location (project vs global)
    -> Select transport (stdio vs HTTP Streamable)
    -> Write MCP entries to settings
    |
[PHASE 4: TRANSPORT SELECTION]
    -> Evaluate local vs remote requirements
    -> Configure transport parameters
    -> Set environment variables and secrets
    |
[PHASE 5: TOOL VALIDATION]
    -> Test each MCP server's tool availability
    -> Verify tool responses with sample calls
    -> Document available tools per server
    |
[PHASE 6: DOCUMENTATION]
    -> Update CLAUDE.md with MCP usage rules
    -> Create tool selection priority table
    -> Document CLI-first vs MCP decision tree
    |
OUTPUT: Configured MCP servers + context budget report + CLAUDE.md updates
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| project_root | string | Auto-detect | yes | Valid directory with package.json or equivalent |
| tech_stack | array | Scan or user | yes | List of frameworks/languages in use |
| current_mcps | object | .claude/settings.json | no | Existing MCP configuration |
| context_budget_limit | number | User or default | no | Max tokens for MCP overhead (default: 10000) |

---

## Preconditions

1. Claude Code is installed and operational in the project
2. `.claude/settings.json` or `~/.claude.json` exists (or will be created)
3. User has access to install MCP server binaries (npm, pip, docker)
4. Network access for remote MCP servers (if applicable)

---

## Phase 1: Discovery

**Goal:** Identify which MCP servers would benefit this project.

### Steps

1.1. Scan the project root for tech stack indicators:
   - `package.json` -> Node.js ecosystem (look for React, Next.js, Express, etc.)
   - `requirements.txt` / `pyproject.toml` -> Python ecosystem
   - `docker-compose.yml` -> Container-based services
   - `.env` / `supabase/` -> Supabase/database usage
   - `playwright.config.*` -> Browser testing

1.2. Cross-reference detected stack against MCP server catalog:

| Tech Stack Signal | Recommended MCP | Purpose |
|-------------------|----------------|---------|
| Supabase project | supabase | Database operations, migrations |
| Any web project | playwright/browser | UI testing, screenshots |
| Research-heavy | exa | Web search, company research |
| Any framework | context7 | Library documentation lookup |
| Docker services | desktop-commander | Container management |
| GitHub repo | github-cli (native) | PR/issue management |

1.3. List current MCP servers from config and identify gaps.

---

## Phase 2: Context Budget Evaluation

**Goal:** Quantify the token cost of each MCP server.

### Context Budget Math

Each MCP server adds to the system prompt:
- **Server registration:** ~200 tokens (name, description, connection info)
- **Tool definitions:** ~100-400 tokens per tool (name, description, parameters, schema)
- **Typical server:** 600-2000 tokens total

### Budget Calculation

```
Total MCP Cost = SUM(server_tool_count * avg_tokens_per_tool + 200)

Example:
  playwright (15 tools)  = 15 * 150 + 200 = 2,450 tokens
  context7 (2 tools)     = 2 * 150 + 200  = 500 tokens
  exa (1 tool)           = 1 * 150 + 200  = 350 tokens
  supabase (5 tools)     = 5 * 150 + 200  = 950 tokens
  ---
  TOTAL                  = 4,250 tokens (~2% of 200K context)
```

### Decision Framework

| Total MCP Budget | Recommendation |
|-----------------|---------------|
| < 5,000 tokens | Green -- add freely |
| 5,000-10,000 tokens | Yellow -- evaluate each addition |
| > 10,000 tokens | Red -- remove low-value servers |

2.1. Calculate token cost for each proposed MCP server.
2.2. Sum total and compare against budget limit.
2.3. If over budget, rank servers by value-per-token and recommend removals.

---

## Phase 3: Configuration

**Goal:** Write MCP server configuration to the appropriate location.

### Config Location Decision

| Scope | File | When to Use |
|-------|------|-------------|
| Project-only | `.claude/settings.json` | MCP is project-specific (e.g., supabase for this DB) |
| Global (all projects) | `~/.claude.json` | MCP is universally useful (e.g., context7, exa) |

### Steps

3.1. Determine scope for each MCP server.
3.2. Read existing configuration file.
3.3. Add MCP server entries with proper structure:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@package/mcp-server"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

3.4. Validate JSON structure after writing.

---

## Phase 4: Transport Selection

**Goal:** Choose the right transport protocol for each MCP server.

### Transport Comparison

| Transport | Protocol | Use Case | Latency | Setup |
|-----------|----------|----------|---------|-------|
| **stdio** (default) | stdin/stdout | Local CLI tools, most servers | Low | Simple |
| **HTTP Streamable** | HTTP + SSE | Remote servers, shared infra | Medium | URL + auth |

### Decision Tree

```
Is the MCP server running locally?
  YES -> Use stdio (default)
    Is it a CLI binary? -> command + args
    Is it a Docker container? -> docker run command
  NO -> Use HTTP Streamable
    Does it need auth? -> Add Authorization header
    Is it behind a proxy? -> Configure proxy URL
```

4.1. For each MCP server, determine if local or remote.
4.2. Configure transport accordingly.
4.3. Set environment variables for API keys (never hardcode in config).

---

## Phase 5: Tool Validation

**Goal:** Verify each MCP server is working and its tools are accessible.

### Steps

5.1. Start Claude Code with the new configuration.
5.2. For each configured MCP server, verify tool availability:
   - Check that tools appear in tool list
   - Run a minimal test call (e.g., context7 resolve-library-id with "react")
5.3. Document any servers that fail to connect.
5.4. If a server fails, check:
   - Binary installed? (command exists)
   - API key valid? (env vars set)
   - Port available? (for HTTP transport)
   - Network accessible? (for remote servers)

---

## Phase 6: Documentation

**Goal:** Update project documentation with MCP usage rules.

### CLI-First vs MCP Decision Tree

```
Need to accomplish a task?
  |
  Can a native Claude Code tool do it?
  (Read, Write, Edit, Bash, Grep, Glob)
    YES -> Use native tool (ALWAYS prefer)
    NO  -> Is there an MCP tool for it?
      YES -> Use MCP tool
      NO  -> Use Bash to install/run external tool
```

### Steps

6.1. Add or update MCP section in CLAUDE.md with:
   - List of configured servers and their purposes
   - Tool selection priority (native > MCP > Bash)
   - Server-specific usage rules
6.2. Create `.claude/rules/mcp-usage.md` if it does not exist, with path-based activation.
6.3. Document any server-specific gotchas (auth, rate limits, etc.).

---

## Output Format

```yaml
mcp_workflow_result:
  servers_configured:
    - name: "context7"
      transport: "stdio"
      tools: 2
      token_cost: 500
      status: "verified"
    - name: "playwright"
      transport: "stdio"
      tools: 15
      token_cost: 2450
      status: "verified"
  total_token_cost: 2950
  budget_status: "green"
  files_modified:
    - ".claude/settings.json"
    - "CLAUDE.md"
  documentation_updated: true
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| MCP token budget exceeds 15,000 tokens | HALT -- must remove servers before proceeding |
| API key required but not provided | SKIP server -- document as pending |
| MCP server binary not installable | SKIP server -- suggest alternative |
| Config file write fails | HALT -- check file permissions |
| All MCP servers fail validation | HALT -- likely environment issue, debug first |
