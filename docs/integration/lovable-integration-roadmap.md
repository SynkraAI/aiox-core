# Lovable-AIOS Integration Roadmap

**Author:** Aria (Architect Agent)
**Date:** 2026-02-22
**Status:** Draft
**Related:** [lovable-aios-architecture.md](./lovable-aios-architecture.md), [lovable-api-contract.md](./lovable-api-contract.md), [lovable-mcp-spec.md](./lovable-mcp-spec.md)

---

## Overview

This roadmap breaks the Lovable-AIOS integration into four delivery phases spanning 12 weeks. Each phase is independently shippable and delivers incremental value.

---

## Phase 1: MCP Server Foundation (Weeks 1-3)

**Goal:** Minimal viable MCP server that Lovable can connect to, with two core tools.

### Deliverables

| Item | Owner | Description |
|------|-------|-------------|
| MCP Server scaffold | @dev | Node.js + `@modelcontextprotocol/sdk` + Fastify, SSE transport |
| `aios_design_architecture` tool | @dev | @architect agent adapter -- spec in, architecture JSON out |
| `aios_generate_code` tool | @dev | @dev agent adapter -- spec in, file array out |
| Bearer token auth | @dev | API key validation middleware |
| Railway deployment | @devops | Dockerfile, railway.toml, health check, TLS |
| Lovable connector setup guide | @pm | Step-by-step for Settings > Connectors > Personal connectors |

### Success Criteria

- Lovable user can add the MCP server via Settings > Connectors
- Prompting "Use AIOS to design the architecture for X" returns structured architecture
- Prompting "Use AIOS to generate code for X" returns file array
- Response latency under 30s for single-agent tools
- Bearer token rejected when invalid

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Lovable MCP support changes | High | Thin adapter layer; core agents decoupled |
| SSE connection timeouts at Lovable side | Medium | Implement heartbeat; test with Lovable staging |
| Agent output parsing failures | Medium | Robust output parser with fallback to raw markdown |

### Dependencies

- AIOS orchestration engine callable programmatically (not just via CLI prompt)
- Railway account provisioned (@devops)
- AIOS Pro API key infrastructure (can stub for Phase 1)

---

## Phase 2: Full Agent Suite (Weeks 4-6)

**Goal:** All four AIOS agents exposed as MCP tools, plus async pipeline support.

### Deliverables

| Item | Owner | Description |
|------|-------|-------------|
| `aios_strategize` tool | @dev | @pm agent adapter -- spec in, requirements JSON out |
| `aios_design_ux` tool | @dev | @ux agent adapter -- spec in, UX spec JSON out |
| `aios_full_pipeline` tool | @dev | Multi-agent orchestration: @pm > @architect > @ux > @dev |
| `aios_get_status` tool | @dev | Async job status polling |
| `aios_get_artifact` tool | @dev | Artifact retrieval by job ID and phase |
| BullMQ job queue | @dev | Redis-backed async job processing for full pipeline |
| Webhook notifications | @dev | POST to caller-provided URL on pipeline completion |
| Rate limiting | @dev | Sliding window per API key tier (Free/Pro/Enterprise) |
| AIOS Pro dashboard: API key management | @dev | Generate, rotate, revoke API keys |

### Success Criteria

- All 7 MCP tools functional and documented
- Full pipeline completes in under 3 minutes for standard complexity specs
- Webhook fires within 5s of pipeline completion
- Rate limits enforced per tier
- Concurrent pipeline jobs supported (up to tier limit)

### Agent Chain Sequence

```
User spec (from Lovable)
    |
    v
Phase 1: @pm (aios_strategize)
  Output: requirements.json (FRs, NFRs, constraints, complexity class)
    |
    v
Phase 2: @architect (aios_design_architecture)
  Input: requirements.json
  Output: architecture.md (stack, data model, API, security)
    |
    v
Phase 3: @ux (aios_design_ux)
  Input: requirements.json + architecture.md
  Output: ux-spec.md (flows, pages, design tokens, components)
    |
    v
Phase 4: @dev (aios_generate_code)
  Input: All previous artifacts
  Output: File array (components, routes, schemas, config)
```

Each phase output feeds into the next. If any phase fails, the pipeline halts and returns partial results up to the last successful phase.

---

## Phase 3: Production Hardening (Weeks 7-9)

**Goal:** Production-grade reliability, observability, and security.

### Deliverables

| Item | Owner | Description |
|------|-------|-------------|
| Circuit breaker | @dev | Fail-open with cached responses; 5-failure threshold |
| Structured logging | @dev | Axiom integration, request tracing with correlation IDs |
| Metrics dashboard | @devops | Grafana: latency p50/p95/p99, error rate, active jobs |
| Artifact caching | @dev | Cache common architecture patterns; reduce agent calls |
| Auto-scaling | @devops | Railway replica scaling based on queue depth |
| Security audit | @architect | Input sanitization, prompt injection defense, HMAC webhooks |
| API key rotation | @dev | Zero-downtime key rotation with versioned keys |
| Load testing | @qa | k6 scripts: 100 concurrent tool calls, 20 concurrent pipelines |
| MCP protocol compliance tests | @qa | MCP Inspector validation |
| Documentation site | @pm | Public docs for integration setup and API reference |

### Success Criteria

- 99.5% uptime over 2-week observation period
- p95 latency under 20s for single-agent tools
- Circuit breaker activates on 5 consecutive failures, resets after 60s
- Zero prompt injection vulnerabilities in security audit
- Load test passes at Pro tier limits (60 req/min, 5 concurrent jobs)

---

## Phase 4: Advanced Features (Weeks 10-12)

**Goal:** Differentiated capabilities and ecosystem expansion.

### Deliverables

| Item | Owner | Description |
|------|-------|-------------|
| Bidirectional sync | @dev | Lovable code edits flow back to AIOS artifact store |
| Template library | @pm | Pre-built pipeline configs (SaaS, e-commerce, landing page) |
| Usage analytics | @dev | Per-workspace usage tracking, cost attribution |
| Multi-platform support | @architect | Same MCP server works with Cursor, Windsurf, other MCP clients |
| Lovable marketplace listing | @pm | If Lovable opens a connector marketplace, publish there |
| Real-time collaboration mode | @dev | SSE notifications stream agent progress to Lovable in real-time |

### Success Criteria

- At least 2 additional MCP-compatible platforms validated (Cursor, Windsurf)
- Template library with 5+ pre-built configurations
- Bidirectional sync demonstrated end-to-end (contingent on Lovable MCP client support)

---

## Milestone Summary

| Milestone | Week | Key Metric |
|-----------|------|------------|
| MCP Server live with 2 tools | 3 | First Lovable user connects |
| Full 7-tool suite with async pipeline | 6 | Full pipeline under 3 min |
| Production hardening complete | 9 | 99.5% uptime, security audit passed |
| Multi-platform + advanced features | 12 | 3+ MCP platforms supported |

---

## Resource Requirements

| Role | Allocation | Phases |
|------|-----------|--------|
| @dev (backend) | 1 engineer, full-time | 1-4 |
| @devops | 0.25 engineer | 1, 3 |
| @architect | Advisory, reviews | 1-3 |
| @qa | 0.5 engineer | 2-3 |
| @pm | 0.25 | 1, 2, 4 |

### Infrastructure Costs (Estimated)

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| Railway (2 replicas) | $20-40 | Auto-scales with demand |
| Redis (Upstash) | $10-30 | BullMQ job queue |
| Supabase (artifact storage) | $0-25 | Free tier may suffice initially |
| Axiom (logging) | $0-35 | Free tier for Phase 1-2 |
| **Total Phase 1-2** | **$30-130/mo** | |

---

## Trade-Off Decisions

### Why MCP Server over REST API

The user prompt suggested Webhook + REST API as the simplest approach. After analysis, MCP Server was chosen instead because:

1. **Lovable natively supports MCP** -- REST requires building a custom adapter on the Lovable side
2. **Streaming built-in** -- SSE transport provides real-time progress without polling
3. **Multi-platform reuse** -- Same server works with Cursor, Windsurf, and any MCP client
4. **Lower total complexity** -- Despite higher initial setup, avoids building REST polling infrastructure

The webhook pattern is retained as a supplement for async pipeline completion notifications.

[AUTO-DECISION] "Should we start with Webhook + REST API as suggested?" --> No, start with MCP Server (reason: Lovable natively supports MCP; REST would require extra adapter work on both sides with no benefit)

### Why Railway over Vercel/Fly.io

Railway was selected for hosting because it supports long-running processes (agent calls can take 60+ seconds), provides simple Docker deployment, and offers built-in auto-scaling. Vercel's serverless functions have a 60s timeout on Pro plans which is too tight for full pipelines.

---

## References

- Architecture: `/Users/alyfalbert/Desktop/codes/aios/aios-core/docs/integration/lovable-aios-architecture.md`
- API Contract: `/Users/alyfalbert/Desktop/codes/aios/aios-core/docs/integration/lovable-api-contract.md`
- MCP Spec: `/Users/alyfalbert/Desktop/codes/aios/aios-core/docs/integration/lovable-mcp-spec.md`
- MCP Protocol: https://modelcontextprotocol.io
- AIOS Constitution: `.aios-core/constitution.md`
