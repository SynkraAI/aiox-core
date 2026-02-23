# Lovable-AIOS Integration Architecture

**Author:** Aria (Architect Agent)
**Date:** 2026-02-22
**Status:** Draft
**Handoff:** @devops for implementation planning

---

## 1. Executive Summary

This document defines how Synkra AIOS agents execute inside Lovable's AI app builder platform. The integration enables Lovable users to leverage AIOS's multi-agent orchestration (@pm, @architect, @ux, @dev) to produce specs, architecture, UX design, and code -- which Lovable then renders into production UI.

**Chosen approach: MCP Server (primary) + Webhook fallback (async jobs).**

---

## 2. Integration Options Analysis

### Option A: REST API Gateway

| Aspect | Assessment |
|--------|-----------|
| Complexity | Medium |
| Latency | High (polling required for long-running agents) |
| Lovable support | Indirect (Lovable does not natively consume external REST APIs as agent tools) |
| Bidirectional | No (request-response only) |
| Verdict | **REJECTED** -- Lovable's agent model expects MCP tool interfaces, not REST endpoints |

### Option B: MCP Server (CHOSEN)

| Aspect | Assessment |
|--------|-----------|
| Complexity | Medium |
| Latency | Low (streaming via SSE transport) |
| Lovable support | **Native** -- Lovable supports custom MCP servers on paid plans |
| Bidirectional | Yes (tool calls + notifications) |
| Verdict | **SELECTED** -- First-class Lovable integration path |

### Option C: Webhooks Only

| Aspect | Assessment |
|--------|-----------|
| Complexity | Low |
| Latency | High (fire-and-forget, callback required) |
| Lovable support | Limited (no native webhook consumer in Lovable agent) |
| Bidirectional | No |
| Verdict | **SUPPLEMENTARY** -- Used for async job completion notifications |

### Option D: gRPC

| Aspect | Assessment |
|--------|-----------|
| Complexity | High |
| Latency | Low |
| Lovable support | None (Lovable does not support gRPC MCP transport) |
| Verdict | **REJECTED** -- No Lovable compatibility |

---

## 3. Architecture Decision: MCP Server + Webhook Hybrid

### 3.1 Why MCP Server

1. **Lovable natively supports custom MCP servers** (Settings > Connectors > Personal connectors)
2. MCP is the standard protocol for connecting AI agents to external tools
3. Supports OAuth, Bearer token, and no-auth modes
4. Streaming responses via SSE transport for real-time agent output
5. Aligns with AIOS CLI-First principle (MCP is a CLI/agent protocol, not a UI protocol)

### 3.2 Why Webhook Supplement

Long-running orchestrations (full spec pipeline: @pm > @architect > @ux > @dev) can take minutes. Webhooks notify Lovable when async jobs complete rather than holding an SSE connection open.

### 3.3 High-Level Flow

```
Lovable UI (user creates spec via prompt)
    |
    v
Lovable Agent (recognizes AIOS tools via MCP)
    |
    v
MCP Server (aios-lovable-mcp) -- hosted, HTTPS + SSE
    |
    v
AIOS Agent Orchestration Engine
    |
    +---> @pm: strategy & requirements
    +---> @architect: system design
    +---> @ux: UI/UX spec + wireframes
    +---> @dev: code generation
    |
    v
MCP Response (structured specs, code, design tokens)
    |
    v
Lovable Agent (receives artifacts, generates UI)
    |
    v
Lovable renders production app
```

---

## 4. System Architecture

### 4.1 Component Diagram

```
+------------------+        MCP/SSE          +----------------------+
|                  | <---------------------> |                      |
|   Lovable Agent  |    (tool calls)         |  aios-lovable-mcp    |
|                  |                         |  (MCP Server)        |
+------------------+                         +----------+-----------+
                                                        |
                                             +----------+-----------+
                                             |                      |
                                             |  AIOS Orchestrator   |
                                             |  (Agent Router)      |
                                             +----------+-----------+
                                                        |
                              +------------+------------+------------+
                              |            |            |            |
                          +---v---+   +----v----+  +----v----+  +---v---+
                          |  @pm  |   |@architect|  |  @ux    |  | @dev  |
                          +-------+   +---------+  +---------+  +-------+
                                                        |
                                             +----------v-----------+
                                             |  Artifact Store      |
                                             |  (specs, code, etc)  |
                                             +----------------------+
```

### 4.2 Deployment Model

| Component | Hosting | Notes |
|-----------|---------|-------|
| aios-lovable-mcp | Cloud (Railway / Fly.io) | Stateless, auto-scaling |
| AIOS Orchestrator | Same host or microservice | Manages agent lifecycle |
| Artifact Store | S3-compatible / Supabase Storage | Persists generated artifacts |
| Webhook Relay | Serverless function (edge) | Async completion callbacks |

### 4.3 Security Boundaries

```
[Lovable Cloud] --HTTPS/SSE--> [Load Balancer] --> [MCP Server] --> [AIOS Engine]
                                     |
                                [TLS Termination]
                                [Rate Limiting]
                                [Auth Validation]
```

---

## 5. MCP Server Design

### 5.1 Tools Exposed

| Tool | Agent | Description | Latency |
|------|-------|-------------|---------|
| `aios_strategize` | @pm | Generate product strategy and requirements from spec | 5-15s |
| `aios_design_architecture` | @architect | Produce system architecture document | 10-30s |
| `aios_design_ux` | @ux | Generate UX spec, wireframes, design tokens | 10-30s |
| `aios_generate_code` | @dev | Generate implementation code from spec + arch | 15-60s |
| `aios_full_pipeline` | All | Run complete spec > arch > ux > code pipeline | 60-180s |
| `aios_get_status` | None | Check status of async job | <1s |
| `aios_get_artifact` | None | Retrieve generated artifact by ID | <1s |

### 5.2 Transport

- **Primary:** SSE (Server-Sent Events) over HTTPS
- **Fallback:** Streamable HTTP (for environments that cannot hold SSE)
- **Port:** 443 (standard HTTPS)

### 5.3 Authentication

Lovable supports three auth modes. We use **Bearer token**:

```
Authorization: Bearer <aios-api-key>
```

API keys are scoped per-workspace and managed via AIOS Pro dashboard.

---

## 6. Workflow Orchestration

### 6.1 Synchronous Flow (Single Tool Call)

```
Lovable calls aios_design_architecture({
  spec: "E-commerce platform with ...",
  constraints: { budget: "startup", timeline: "4 weeks" }
})

MCP Server:
  1. Validate input
  2. Route to @architect agent
  3. Stream progress via SSE notifications
  4. Return architecture document as tool result
```

### 6.2 Asynchronous Flow (Full Pipeline)

```
Lovable calls aios_full_pipeline({
  spec: "Quiz app with leaderboards ...",
  phases: ["strategy", "architecture", "ux", "code"]
})

MCP Server:
  1. Validate input
  2. Create job (jobId: "job_abc123")
  3. Return immediately: { jobId: "job_abc123", status: "running" }
  4. Execute pipeline asynchronously:
     @pm (strategy) -> @architect (design) -> @ux (wireframes) -> @dev (code)
  5. Send webhook on completion (if configured)
  6. Lovable polls via aios_get_status({ jobId: "job_abc123" })
  7. Lovable retrieves via aios_get_artifact({ jobId: "job_abc123", type: "code" })
```

### 6.3 Agent Orchestration Sequence

```
Phase 1: @pm
  Input: Raw user spec from Lovable
  Output: requirements.json (FRs, NFRs, constraints)

Phase 2: @architect
  Input: requirements.json
  Output: architecture.md (stack, patterns, data model)

Phase 3: @ux
  Input: requirements.json + architecture.md
  Output: ux-spec.md (wireframes, design tokens, component list)

Phase 4: @dev
  Input: All previous artifacts
  Output: Generated code (React components, API routes, schemas)
```

---

## 7. Error Handling

### 7.1 Error Categories

| Category | HTTP Status | MCP Error Code | Recovery |
|----------|-------------|----------------|----------|
| Auth failure | 401 | `UNAUTHORIZED` | Re-authenticate |
| Rate limited | 429 | `RATE_LIMITED` | Retry after `Retry-After` header |
| Invalid input | 400 | `INVALID_INPUT` | Fix input and retry |
| Agent timeout | 504 | `AGENT_TIMEOUT` | Retry or check async status |
| Internal error | 500 | `INTERNAL_ERROR` | Retry with exponential backoff |
| Agent failure | 502 | `AGENT_FAILURE` | Check agent logs, retry |

### 7.2 Circuit Breaker

Consistent with AIOS constitution (IDS graceful degradation):

```yaml
circuit_breaker:
  failure_threshold: 5
  success_threshold: 3
  reset_timeout_ms: 60000
  behavior_on_open: return_cached_or_error
```

---

## 8. Rate Limiting

| Tier | Requests/min | Concurrent Jobs | Pipeline/hour |
|------|-------------|-----------------|---------------|
| Free | 10 | 1 | 5 |
| Pro | 60 | 5 | 30 |
| Enterprise | 300 | 20 | Unlimited |

Rate limiting is enforced at the MCP server level using a sliding window algorithm with Redis backing.

---

## 9. Data Flow and Privacy

### 9.1 Data In Transit

- All communication over TLS 1.3
- MCP SSE streams are encrypted end-to-end

### 9.2 Data At Rest

- Generated artifacts stored encrypted (AES-256) in artifact store
- Artifacts auto-expire after 7 days (configurable)
- No user spec data persisted beyond job lifetime

### 9.3 Data Residency

- Default: US-East (to match Lovable infrastructure)
- Enterprise: Configurable region

---

## 10. Implementation Roadmap

### Phase 1: MVP (Weeks 1-3)

- MCP Server with `aios_design_architecture` and `aios_generate_code` tools
- Bearer token auth
- SSE transport
- Deploy to Railway
- Manual Lovable configuration (Settings > Connectors)

### Phase 2: Full Agent Suite (Weeks 4-6)

- Add `aios_strategize`, `aios_design_ux`, `aios_full_pipeline`
- Async job system with `aios_get_status` / `aios_get_artifact`
- Webhook notifications for job completion
- Rate limiting with Redis
- AIOS Pro dashboard for API key management

### Phase 3: Production Hardening (Weeks 7-9)

- Circuit breaker implementation
- Observability (structured logging, metrics, tracing)
- Artifact caching layer
- Auto-scaling configuration
- Security audit
- Lovable marketplace listing (if available)

### Phase 4: Advanced Features (Weeks 10-12)

- Bidirectional sync (Lovable edits reflected back to AIOS)
- Real-time collaboration mode
- Template library (pre-built agent pipelines)
- Usage analytics dashboard

---

## 11. Trade-Off Analysis

### MCP vs REST API

| Factor | MCP Server | REST API |
|--------|-----------|----------|
| Lovable compatibility | Native | Requires custom adapter |
| Streaming | Built-in via SSE | Must implement SSE separately |
| Protocol overhead | Lower (single connection) | Higher (per-request) |
| Ecosystem | Growing (MCP standard) | Mature (HTTP/REST) |
| Debugging | Newer tooling | Well-established tooling |
| **Decision** | **CHOSEN** | Rejected |

### Hosted vs Self-Hosted MCP

| Factor | Hosted (SaaS) | Self-Hosted |
|--------|--------------|-------------|
| Setup for users | Zero config | Manual server setup |
| Maintenance | Managed | User responsibility |
| Cost | Subscription | Infrastructure cost |
| Data control | Provider manages | Full user control |
| **Decision** | **Phase 1-3** | **Enterprise option** |

### SSE vs WebSocket Transport

| Factor | SSE | WebSocket |
|--------|-----|-----------|
| MCP compatibility | Standard | Not in MCP spec |
| Bidirectional | Server-to-client only | Full duplex |
| Proxy compatibility | Excellent | Can be blocked |
| Reconnection | Built-in | Manual |
| **Decision** | **CHOSEN** | Rejected for MCP compliance |

---

## 12. Security Considerations

1. **API Key Rotation:** Keys must be rotatable without downtime. Use key versioning.
2. **Webhook Signatures:** HMAC-SHA256 signature on all webhook payloads.
3. **Input Sanitization:** All user specs sanitized before agent processing.
4. **Prompt Injection:** Agent inputs validated against injection patterns.
5. **Artifact Access:** Signed URLs with expiration for artifact retrieval.
6. **Audit Logging:** All tool calls logged with caller identity, timestamp, input hash.

---

## 13. Backward Compatibility

- MCP Server is a new component; no backward compatibility concerns with existing AIOS
- AIOS agent definitions remain unchanged; MCP server is a thin adapter layer
- Existing CLI workflows unaffected (CLI-First principle preserved)

---

## 14. References

- Lovable MCP Documentation: Settings > Connectors > Personal connectors
- MCP Specification: https://modelcontextprotocol.io
- AIOS Constitution: `.aios-core/constitution.md`
- AIOS Core Config: `.aios-core/core-config.yaml`
