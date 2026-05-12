# Add MCP Server Task

> Dynamically add MCP servers to Docker MCP Toolkit from the catalog.

---

## Task Definition

```yaml
task: addMcp()
responsavel: DevOps Agent
responsavel_type: Agente
atomic_layer: Infrastructure
elicit: true

**Entrada:**
- campo: mcp_query
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Search query for MCP catalog

- campo: mcp_name
  tipo: string
  origem: User Selection
  obrigatorio: true
  validacao: Exact MCP server name from catalog

- campo: credentials
  tipo: object
  origem: User Input
  obrigatorio: false
  validacao: API keys or tokens if required by MCP

**Saida:**
- campo: mcp_added
  tipo: boolean
  destino: Docker MCP configuration
  persistido: true

- campo: tools_available
  tipo: array
  destino: Console output
  persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Docker MCP Toolkit running
    tipo: pre-condition
    blocker: true
    validacao: docker mcp gateway status succeeds
    error_message: "Start gateway: docker mcp gateway run --watch"

  - [ ] Dynamic MCP feature enabled
    tipo: pre-condition
    blocker: false
    validacao: docker mcp feature list shows dynamic-tools
    error_message: "Enable with: docker mcp feature enable dynamic-tools"
```

---

## Interactive Elicitation

### Step 1: Search MCP Catalog

```
ELICIT: MCP Search

What MCP server are you looking for?

Enter a search query (e.g., "notion", "slack", "database"):
→ _______________

[Searching Docker MCP catalog...]
```

### Step 2: Select from Results

```
ELICIT: MCP Selection

Found {n} MCPs matching "{query}":

1. mcp/notion
   └─ Notion workspace integration
   └─ Requires: NOTION_API_KEY

2. mcp/postgres
   └─ PostgreSQL database access
   └─ Requires: DATABASE_URL

3. mcp/sqlite
   └─ SQLite database access
   └─ Requires: None (local file)

→ Select MCP to add (number or name): ___
```

### Step 3: Configure Credentials

```
ELICIT: Credentials Configuration

The selected MCP requires authentication:

MCP: mcp/{name}
Required: {CREDENTIAL_NAME}

Options:
1. Set environment variable now
2. Configure later (MCP may fail without credentials)
3. Skip this MCP

→ Choose option: ___

[If option 1]
Enter value for {CREDENTIAL_NAME}:
→ _______________
(This will be set as an environment variable)
```

### Step 4: Confirm Addition

```
ELICIT: Confirmation

Ready to add MCP:

Server: mcp/{name}
Credentials: {configured/not configured}
Preset: {preset to add to, if any}

→ Proceed? (y/n): ___
```

---

## Implementation Steps

### 1. Search Catalog

```bash
# Search for MCPs
docker mcp catalog search {query}

# Example output:
# mcp/notion    Notion workspace integration
# mcp/postgres  PostgreSQL database access
```

### 2. Get MCP Details

```bash
# Get detailed info about an MCP
docker mcp catalog info {mcp-name}

# Shows: description, required credentials, tools provided
```

### 3. Add MCP Server

```bash
# Enable the server
docker mcp server enable {mcp-name}
```

### 3.1 Configure Credentials (CRITICAL - Known Bug Workaround)

⚠️ **BUG:** Docker MCP Toolkit's secrets store and template interpolation (`{{...}}`) do NOT work properly. Credentials set via `docker mcp secret set` are not passed to containers.

**WORKAROUND:** Edit the catalog file directly to hardcode env values.

```yaml
# Edit: ~/.docker/mcp/catalogs/docker-mcp.yaml
# Find your MCP entry and add/modify the env section:

{mcp-name}:
  # ... other config ...
  env:
    - name: {ENV_VAR_NAME}
      value: '{actual-api-key-value}'
    - name: TOOLS
      value: 'tool1,tool2,tool3'
```

**Example for Apify:**
```yaml
apify-mcp-server:
  env:
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
```

**Security Note:** This exposes credentials in a local file. Ensure:
1. `~/.docker/mcp/catalogs/` is not committed to any repo
2. File permissions restrict access to current user only

**Alternative (if secrets work in future):**
```bash
# Set secret (currently NOT working)
docker mcp secret set {mcp-name}.{credential_name}={value}
```

### 4. Update Gordon Config (Optional)

If adding to gordon-mcp.yml:

```yaml
# Add to .docker/mcp/gordon-mcp.yml
services:
  {mcp-name}:
    image: mcp/{mcp-name}
    environment:
      - {CREDENTIAL_NAME}=${CREDENTIAL_NAME}
    labels:
      mcp.preset: "full,{custom}"
```

### 5. Verify Addition

```bash
# List tools from new MCP
docker mcp tools ls | grep {mcp-name}

# Test a tool
docker mcp tools call {mcp-name}.{tool} --param value
```

### 6. Add to Preset (Optional)

```bash
# Add to existing preset
docker mcp preset update {preset-name} --add-server {mcp-name}

# Or create new preset including the MCP
docker mcp preset create {new-preset} --servers fs,github,{mcp-name}
```

### 7. Update AIOX Documentation (REQUIRED)

Add the new MCP to `.claude/rules/mcp-usage.md`:

```markdown
## {MCP-Name} MCP Usage (via Docker)

### Use {MCP-Name} for:
1. [Primary use case 1]
2. [Primary use case 2]

### Access pattern:
\`\`\`
mcp__docker-gateway__{tool-name-1}
mcp__docker-gateway__{tool-name-2}
\`\`\`
```

Also update the table in "Inside Docker Desktop (via docker-gateway)" section.

### 8. Notify User About Session Restart (CRITICAL)

⚠️ **The user MUST restart their Claude Code session** for new MCP tools to be available.

```text
IMPORTANT: New MCP tools will NOT be available until you:
1. Close this Claude Code session
2. Open a new Claude Code session: `claude`

The docker-gateway caches tools at startup. New tools only appear after restart.
```

### 9. Verify Tools Available in New Session

After user restarts Claude Code, verify tools are accessible:

```bash
# In new Claude Code session, ask an agent to use the new MCP
@analyst Use the {mcp-name} tool to [perform some action]

# Expected: Agent should see and use mcp__docker-gateway__{tool-name}
# If not visible: Check docker mcp server list and docker mcp tools ls
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] MCP server added
    tipo: post-condition
    blocker: true
    validacao: docker mcp server list includes new MCP
    error_message: "MCP addition failed"

  - [ ] Tools available in Docker MCP
    tipo: post-condition
    blocker: true
    validacao: docker mcp tools ls shows MCP tools
    error_message: "MCP tools not available - check credentials"

  - [ ] AIOX documentation updated
    tipo: post-condition
    blocker: true
    validacao: .claude/rules/mcp-usage.md includes new MCP
    error_message: "Update mcp-usage.md with new MCP documentation"

  - [ ] User notified about session restart
    tipo: post-condition
    blocker: true
    validacao: User informed to restart Claude Code session
    error_message: "Notify user: tools only available after session restart"
```

**CRITICAL NOTE:** Tools added to Docker MCP Toolkit are NOT immediately available to AIOX agents. The docker-gateway caches tools at Claude Code startup. User MUST restart their Claude Code session for new tools to appear.

---

## Error Handling

### Error: MCP Not Found

```
Resolution:
1. Check spelling of MCP name
2. Search with broader query: docker mcp catalog search "*"
3. Check if MCP is in the registry: https://github.com/modelcontextprotocol/registry
```

### Error: Credentials Missing / Tools Not Loading

```text
Resolution (Due to Known Bug):
1. Edit catalog directly: ~/.docker/mcp/catalogs/docker-mcp.yaml
2. Add hardcoded env values in the MCP's env section
3. Verify with: docker mcp tools ls --verbose
4. Check output shows "(N tools)" not "(N prompts)"

If still showing only prompts:
- Token may be invalid
- TOOLS env var may be wrong
- MCP may need specific configuration
```

### Error: MCP Fails to Start

```
Resolution:
1. Check Docker logs: docker logs mcp-{name}
2. Verify credentials are correct
3. Check MCP documentation for specific requirements
4. Try removing and re-adding: docker mcp server remove {name}
```

---

## Success Output

```
✅ MCP Server Added Successfully!

📦 Server: mcp/{name}
🔧 Tools Added:
   • {name}.tool1 - Description
   • {name}.tool2 - Description
   • {name}.tool3 - Description

🔗 Status: Running
📋 Preset: Added to 'aiox-full'

Next steps:
1. Test tools: docker mcp tools call {name}.tool1 --param value
2. Use in workflow: *mcp-workflow with {name} tools
3. Add to other presets: docker mcp preset update aiox-dev --add-server {name}
```

---

## Common MCPs Reference

| MCP | Purpose | Credentials | Popular Tools |
|-----|---------|-------------|---------------|
| `notion` | Notion workspace | NOTION_API_KEY | getPage, createPage, search |
| `postgres` | PostgreSQL DB | DATABASE_URL | query, execute, listTables |
| `sqlite` | SQLite DB | None | query, execute |
| `slack` | Slack messaging | SLACK_BOT_TOKEN | sendMessage, listChannels |
| `puppeteer` | Browser automation | None | navigate, screenshot, click |
| `redis` | Redis cache | REDIS_URL | get, set, del |
| `s3` | AWS S3 | AWS_* | upload, download, list |
| `stripe` | Stripe payments | STRIPE_SECRET_KEY | createPayment, listCustomers |

---

## Metadata

```yaml
task: add-mcp
version: 1.3.0
story: Story 6.14 - MCP Governance Consolidation
dependencies:
  - Docker MCP Toolkit
  - docker mcp gateway running
tags:
  - infrastructure
  - mcp
  - docker
  - dynamic
created_at: 2025-12-08
updated_at: 2025-12-23
agents:
  - devops
changelog:
  1.3.0:
    - Added: Step 3.1 documenting Docker MCP secrets/template bug
    - Added: Workaround using catalog file direct edit
    - Updated: Error handling for credentials issues
    - Fixed: Apify MCP now working with 7 tools
    - Note: Bug affects all MCPs requiring authentication
  1.2.0:
    - Added: Steps 7-9 for AIOX documentation and session restart
    - Added: Post-conditions for documentation update and user notification
    - Added: Critical note about docker-gateway tool caching
    - Fixed: Tools not appearing in AIOX agents after MCP addition
  1.1.0:
    - Changed: DevOps Agent now exclusive responsible (Story 6.14)
    - Removed: Dev Agent from agents list
  1.0.0:
    - Initial version (Story 5.11)
```
