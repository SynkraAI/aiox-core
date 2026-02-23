# Lovable-AIOS MCP Server Specification

**Author:** Aria (Architect Agent)
**Date:** 2026-02-22
**Status:** Draft
**Related:** [lovable-aios-architecture.md](./lovable-aios-architecture.md), [lovable-api-contract.md](./lovable-api-contract.md)

---

## 1. MCP Server Identity

| Field | Value |
|-------|-------|
| Name | `aios-lovable-mcp` |
| Protocol | MCP (Model Context Protocol) |
| Transport | SSE over HTTPS |
| Base URL | `https://mcp.aios.synkra.com/v1` |
| Auth | Bearer token (API key) |

---

## 2. Server Capabilities Declaration

```json
{
  "name": "aios-lovable-mcp",
  "version": "1.0.0",
  "description": "Synkra AIOS multi-agent orchestration for Lovable. Run @pm, @architect, @ux, and @dev agents to generate specs, architecture, UX design, and code.",
  "capabilities": {
    "tools": true,
    "notifications": true
  }
}
```

---

## 3. Tools Registry

### 3.1 Tool List

```json
[
  {
    "name": "aios_strategize",
    "description": "Generate product strategy and structured requirements from a natural language spec. Runs the @pm agent.",
    "inputSchema": { "$ref": "#/schemas/strategize_input" }
  },
  {
    "name": "aios_design_architecture",
    "description": "Produce a complete system architecture document including stack selection, data model, API design, and security. Runs the @architect agent.",
    "inputSchema": { "$ref": "#/schemas/architecture_input" }
  },
  {
    "name": "aios_design_ux",
    "description": "Generate UX specification with user flows, page layouts, design tokens, and component list. Runs the @ux agent.",
    "inputSchema": { "$ref": "#/schemas/ux_input" }
  },
  {
    "name": "aios_generate_code",
    "description": "Generate production-ready implementation code (React/Next.js components, API routes, schemas). Runs the @dev agent.",
    "inputSchema": { "$ref": "#/schemas/code_input" }
  },
  {
    "name": "aios_full_pipeline",
    "description": "Run the complete multi-agent pipeline: strategy > architecture > UX > code. Returns a job ID for tracking. Use aios_get_status to monitor progress.",
    "inputSchema": { "$ref": "#/schemas/pipeline_input" }
  },
  {
    "name": "aios_get_status",
    "description": "Check the status of an async pipeline job.",
    "inputSchema": { "$ref": "#/schemas/status_input" }
  },
  {
    "name": "aios_get_artifact",
    "description": "Retrieve a generated artifact (strategy, architecture, UX spec, or code) from a completed job.",
    "inputSchema": { "$ref": "#/schemas/artifact_input" }
  }
]
```

Full input/output schemas are defined in [lovable-api-contract.md](./lovable-api-contract.md).

---

## 4. Lovable Configuration

### 4.1 Adding the MCP Server in Lovable

1. Open Lovable project
2. Navigate to **Settings > Connectors > Personal connectors**
3. Click **New MCP server**
4. Configure:
   - **Name:** `Synkra AIOS`
   - **URL:** `https://mcp.aios.synkra.com/v1`
   - **Authentication:** Bearer token
   - **Token:** Your AIOS API key (from AIOS Pro dashboard)
5. Click **Add & authorize**

### 4.2 Using in Lovable Prompts

Once configured, the Lovable agent can use AIOS tools. Example prompts:

**Single agent:**
> "Use AIOS to design the architecture for my quiz app with leaderboards and social sharing"

**Full pipeline:**
> "Use AIOS to run the full pipeline for: a SaaS dashboard for managing customer subscriptions with Stripe integration"

**Targeted code generation:**
> "Use AIOS to generate the code for a user authentication flow with Supabase"

---

## 5. Notification Events

The MCP server sends notifications to Lovable during long-running operations:

| Notification | When | Payload |
|-------------|------|---------|
| `progress` | Phase starts/completes | `{ phase, status, progress_percent }` |
| `artifact_ready` | Single artifact generated | `{ phase, artifact_type }` |
| `pipeline_complete` | All phases done | `{ job_id, status, duration_ms }` |
| `pipeline_error` | Unrecoverable error | `{ job_id, error_code, message }` |

---

## 6. Implementation Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| MCP Server runtime | Node.js 20+ | Matches AIOS ecosystem |
| MCP SDK | `@modelcontextprotocol/sdk` | Official MCP SDK |
| HTTP framework | Fastify | Performance, schema validation |
| Job queue | BullMQ + Redis | Reliable async job processing |
| Storage | Supabase Storage | Consistent with AIOS preferences |
| Hosting | Railway | Easy deployment, auto-scaling |
| Monitoring | Axiom / Grafana | Structured logging + metrics |

### 6.1 Project Structure

```
packages/aios-lovable-mcp/
  src/
    server.ts              # MCP server initialization
    tools/
      strategize.ts        # aios_strategize handler
      architecture.ts      # aios_design_architecture handler
      ux-design.ts         # aios_design_ux handler
      code-gen.ts          # aios_generate_code handler
      pipeline.ts          # aios_full_pipeline handler
      status.ts            # aios_get_status handler
      artifact.ts          # aios_get_artifact handler
    orchestrator/
      agent-router.ts      # Routes tool calls to AIOS agents
      pipeline-runner.ts   # Manages multi-phase pipeline
      job-manager.ts       # BullMQ job lifecycle
    middleware/
      auth.ts              # Bearer token validation
      rate-limit.ts        # Rate limiting
      circuit-breaker.ts   # Fault tolerance
    config/
      index.ts             # Environment and configuration
  tests/
    tools/                 # Unit tests per tool
    integration/           # End-to-end MCP protocol tests
  package.json
  tsconfig.json
  Dockerfile
  railway.toml
```

---

## 7. Agent-to-MCP Adapter Layer

The core challenge is translating MCP tool calls into AIOS agent executions. The adapter:

1. **Receives** MCP tool call with structured JSON input
2. **Translates** to agent prompt (using AIOS task templates)
3. **Executes** the agent via AIOS orchestration engine
4. **Parses** agent output into structured JSON response
5. **Returns** via MCP tool result

```
MCP Tool Call
    |
    v
[Input Validator] --> [Prompt Builder] --> [Agent Executor] --> [Output Parser]
    |                                                                |
    v                                                                v
Error Response                                              MCP Tool Result
```

### 7.1 Prompt Builder

Each tool maps to an AIOS task template:

| Tool | AIOS Task | Agent |
|------|-----------|-------|
| `aios_strategize` | `spec-gather-requirements.md` | @pm |
| `aios_design_architecture` | `create-doc.md` + `fullstack-architecture-tmpl.yaml` | @architect |
| `aios_design_ux` | `create-doc.md` + `front-end-architecture-tmpl.yaml` | @ux |
| `aios_generate_code` | `dev-develop-story.md` (YOLO mode) | @dev |

### 7.2 Output Parser

Agent output (typically markdown) is parsed into the structured JSON contract using:
- Markdown section extraction
- YAML frontmatter parsing
- Code block extraction
- Structured data detection (JSON/YAML within markdown)

---

## 8. Bidirectional Sync (Phase 4)

Future capability where edits in Lovable flow back to AIOS:

```
Lovable user edits component
    |
    v
Lovable sends change event (MCP notification, future spec)
    |
    v
AIOS updates artifact store
    |
    v
AIOS agents can reference updated code in subsequent calls
```

This requires MCP client capabilities in AIOS (consuming notifications from Lovable), which depends on Lovable exposing an MCP client protocol. Currently planned for Phase 4 contingent on Lovable's roadmap.

---

## 9. Testing Strategy

| Level | Scope | Tool |
|-------|-------|------|
| Unit | Individual tool handlers | Vitest |
| Integration | MCP protocol compliance | MCP Inspector |
| E2E | Lovable > MCP > Agent > Response | Manual + Playwright |
| Load | Rate limiting, concurrent jobs | k6 |

---

## 10. Deployment

### 10.1 Railway Configuration

```toml
# railway.toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "node dist/server.js"
healthcheckPath = "/health"
healthcheckTimeout = 10
numReplicas = 2
```

### 10.2 Environment Variables

| Variable | Description |
|----------|-------------|
| `AIOS_MCP_PORT` | Server port (default: 3000) |
| `AIOS_API_KEYS_SECRET` | Secret for API key validation |
| `REDIS_URL` | BullMQ job queue connection |
| `SUPABASE_URL` | Artifact storage |
| `SUPABASE_SERVICE_KEY` | Artifact storage auth |
| `WEBHOOK_SIGNING_SECRET` | HMAC secret for webhook signatures |
| `LOG_LEVEL` | Logging verbosity (default: info) |

---

## 11. Decision: Should We Build This MCP Server?

**YES.** Rationale:

1. Lovable natively supports custom MCP servers -- this is the sanctioned integration path
2. MCP is becoming the standard protocol for AI tool integration (adopted by Claude, Cursor, Lovable, and others)
3. The same MCP server can serve other AI platforms (not just Lovable)
4. Aligns with AIOS CLI-First: MCP is a programmatic/agent protocol, not a UI dependency
5. The investment is moderate (7 tools, thin adapter layer over existing AIOS agents)
6. Revenue opportunity: gate behind AIOS Pro subscription

**Risk:** Lovable's MCP support is relatively new. If they change the protocol or deprecate custom MCP, we would need to adapt. Mitigation: the adapter layer is thin, and the core agent logic is decoupled.
