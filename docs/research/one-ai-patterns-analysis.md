# One AI (withone.ai) -- Pattern Analysis for AIOS Absorption

**Analyst:** Atlas (Decoder)
**Date:** 2026-03-30
**Confidence Level:** HIGH (primary source analysis + cross-referenced documentation)
**AIOS Version:** v5.0.3 (aiox-core)

---

## Executive Summary

One (withone.ai) is an agent infrastructure platform providing the "connective tissue" between AI agents and external APIs. Their core value proposition: managed OAuth, 47,856 tools across 255 platforms, JSON-based flow orchestration, event-driven triggers, and multi-channel deployment.

This analysis maps One's architectural patterns against AIOS's existing capabilities (Corporation layer, Synapse engine, MCP bridges, YAML workflows, entity registry) and identifies what to ABSORB, ADAPT, or IGNORE.

**Key Finding:** One solves the "last mile" integration problem -- getting authenticated API calls to actually work reliably. AIOS solves the "agent orchestration" problem -- deciding which agent does what. These are complementary, not competitive. The highest-value patterns to absorb relate to credential management and event-driven scheduling, which directly address gaps in the Corporation layer.

---

## 1. Managed OAuth + Automatic Token Refresh

### What One Does

- Handles OAuth 2.0, OAuth 1.0a, API keys, and Basic Auth transparently
- Tokens refresh automatically before expiration (agents never see 401 errors)
- Per-tenant credential isolation with encryption at rest and in transit
- Single "connect once" UX -- agents inherit credentials without per-request auth logic

### AIOS Current State

AIOS handles credentials through:
- `.env` files (manual, per-project)
- MCP Bridge configurations (`~/.docker/mcp/catalogs/docker-mcp.yaml` with hardcoded env values due to Docker MCP secrets bug)
- Per-bridge credential management (ads-bridge, brain-bridge, image-studio each manage their own tokens)
- No centralized credential store or automatic refresh

### Gap Analysis

| Aspect | One | AIOS | Gap |
|--------|-----|------|-----|
| Centralized credential store | Yes | No | CRITICAL |
| Auto token refresh | Yes | No | HIGH |
| Multi-provider OAuth flows | Yes | Manual per-bridge | HIGH |
| Tenant isolation | Yes | N/A (single-user) | LOW |
| Encrypted at rest | Yes | Plaintext .env | MEDIUM |

### Recommendation: ADAPT

**Rationale:** AIOS cannot and should not replicate One's full OAuth proxy (that requires a hosted service). However, a **credential manager module** for the Corporation layer would solve the fragmented auth problem across MCP bridges.

**Proposed Implementation -- `CredentialManager`:**

```
.aios-core/core/corporation/credential-manager.js

Features:
1. Unified credential registry (YAML-backed, encrypted)
2. Provider-specific refresh logic (Google OAuth2, GitHub tokens, Stripe keys)
3. CLI commands: `aios credentials add`, `aios credentials rotate`, `aios credentials check`
4. Hook into MCP bridge configs to inject fresh tokens at runtime
5. Expiration monitoring via Corporation scheduler (cron: check every 15min)
```

**Effort:** Medium (2-3 stories)
**Value:** Very High -- directly unblocks Tocks (Google Ads API tokens), Serenity (Supabase service keys), and future MCP bridges

---

## 2. JSON Flow Format (Runtime-Mutable Workflows)

### What One Does

- Flows are native JSON documents, not visual drag-and-drop artifacts
- 12 step types: actions, conditions, loops, parallel execution, sub-flows, auto-pagination
- Explicit data references between steps using selectors (`$.steps.deal.response.name`)
- Agents can generate flows from prompts, inspect them, modify them at runtime
- Supports dry-run validation and mock mode before live execution
- Flows are git-versionable

### AIOS Current State

AIOS uses static YAML workflows defined in `.aios-core/development/tasks/`:
- Task files are markdown with embedded YAML frontmatter
- Workflows are declarative but NOT runtime-mutable -- they are instructions for agents
- No step-to-step data passing (agents carry context in conversation)
- No branching/loop primitives (agent uses judgment)
- No dry-run or mock execution capability
- Workflow chains exist (`workflow-chains.yaml`) but are handoff sequences, not executable pipelines

The Synapse engine (`core/synapse/engine.js`) processes L0-L7 context layers sequentially but is a context injection pipeline, not a workflow execution engine.

### Gap Analysis

| Aspect | One | AIOS | Gap |
|--------|-----|------|-----|
| Machine-readable flow format | JSON | Markdown+YAML (human-readable) | BY DESIGN |
| Runtime mutation | Yes | No | MEDIUM |
| Step-to-step data passing | `$.steps.*` selectors | Agent context window | BY DESIGN |
| Branching/loops | 12 step types | Agent judgment | BY DESIGN |
| Dry-run validation | Yes | No | LOW |
| Git-versionable | Yes | Yes (already) | NONE |

### Recommendation: PARTIAL ABSORB + MOSTLY IGNORE

**Rationale:** AIOS's workflow model is fundamentally different and this is a strength, not a weakness. One's flows are for API orchestration (deterministic, machine-driven). AIOS's tasks are for agent orchestration (judgment-driven, human-in-the-loop).

**What to ABSORB (Low effort, high value):**
- **Dry-run/mock execution flag** for tasks. Add a `--dry-run` flag to the CLI that makes agents describe what they would do without executing. This is trivial to implement as a `processConfig` flag.

**What to IGNORE:**
- JSON flow format itself -- AIOS's markdown tasks are intentionally human-readable for the CLI-first philosophy. Converting to JSON would break the agent-readable-by-design principle.
- Runtime flow mutation -- AIOS agents already adapt behavior via Synapse context injection. Adding a mutable flow layer would create a parallel control plane that conflicts with Constitution Article II (Agent Authority).
- Step-to-step selectors -- agents carrying context in conversation is simpler and more flexible than rigid data selectors.

---

## 3. Event-Driven Webhook Triggers

### What One Does

- **Relay** product: unified webhook ingestion layer
- Incoming events from any platform (Stripe, GitHub, forms) fire agents instantly
- Zero manual scheduling -- fully reactive
- Events carry structured payloads that flows can reference

### AIOS Current State

The `CorporationScheduler` (`core/corporation/scheduler.js`) already supports three schedule types:
- `cron`: recurring via cron expression
- `once`: one-time at specific datetime
- `event`: reactive, triggered by named events via `triggerEvent(eventName, payload)`

However, the event system is **internal only** -- there is no HTTP webhook receiver to accept external events. Events must be triggered programmatically within the AIOS process.

The scheduler integrates with `TaskRouter` for assignment and `PermissionEngine` for autonomy validation (L1-L3 execute autonomously, L4+ queue for approval).

### Gap Analysis

| Aspect | One | AIOS | Gap |
|--------|-----|------|-----|
| Event-type scheduling | Yes | Yes (`scheduler.triggerEvent()`) | NONE |
| External webhook ingestion | Yes (Relay) | No | HIGH |
| Payload forwarding | Yes | Yes (in `triggerEvent` payload param) | NONE |
| Autonomy gating | N/A | Yes (L1-L4 levels) | AIOS SUPERIOR |
| CLI-triggered events | Implied | Not yet (no `aios event` CLI command) | MEDIUM |

### Recommendation: ABSORB

**Rationale:** The `CorporationScheduler` already has the event architecture. The missing piece is an HTTP entry point and a CLI command.

**Implementation Plan:**

**A. CLI event trigger (LOW effort -- 1 story):**
```bash
aios corporation event new_pr --payload '{"repo":"aiox-core","number":42}'
```
This calls `scheduler.triggerEvent('new_pr', payload)` directly.

**B. Webhook listener (MEDIUM effort -- 2 stories):**
```
.aios-core/core/corporation/webhook-listener.js

- Lightweight HTTP server (Node.js http, zero deps)
- Listens on configurable port (default 7700)
- Routes: POST /webhook/:event_name → scheduler.triggerEvent(event_name, body)
- HMAC signature validation (optional, per-event config)
- CLI: `aios corporation webhook start`, `aios corporation webhook stop`
- Feature flag in core-config.yaml: corporation.webhook.enabled
```

**C. GitHub webhook integration (HIGH value for DevOps):**
Configure GitHub repo webhooks to POST to `localhost:7700/webhook/github_push`, triggering scheduled Corporation tasks (QA reviews, deployment checks, etc.).

**Priority:** A then B then C. "A" alone unlocks event-driven scheduling for all existing Corporation schedules.

---

## 4. Multi-Channel Deploy (Slack, Telegram, WhatsApp)

### What One Does

- Deploy a single agent to Slack, Telegram, or WhatsApp simultaneously
- Users interact in their preferred channel
- Agent maintains state across channels
- Real-time responses in each channel

### AIOS Current State

AIOS agents operate exclusively through IDE chat interfaces (Claude Code, Cursor, Gemini CLI) and CLI. There is no messaging platform integration.

The Corporation dashboard (`core/corporation/dashboard/cli-renderer.js`) provides CLI-based observability but no notification channels.

For the Tocks Sales AI project, WhatsApp Business API integration is planned but as a project-specific implementation, not a framework-level capability.

### Gap Analysis

| Aspect | One | AIOS | Gap |
|--------|-----|------|-----|
| Slack notifications | Yes | No | MEDIUM |
| Telegram bot | Yes | No | MEDIUM |
| WhatsApp integration | Yes | No (project-specific only) | LOW |
| CLI interface | Implied | Yes (primary) | AIOS SUPERIOR |
| Cross-channel state | Yes | N/A | LOW |

### Recommendation: ADAPT (Notification Layer Only)

**Rationale:** Full multi-channel agent deployment conflicts with CLI-first architecture (Constitution Article I). However, a **notification/observability layer** that pushes Corporation events to messaging platforms is highly valuable for 24/7 monitoring.

**Proposed Implementation -- `NotificationRelay`:**

```
.aios-core/core/corporation/notification-relay.js

Scope (observability ONLY, not bidirectional agent interaction):
1. Telegram Bot (easiest, free, no approval needed)
   - Send: schedule executions, escalation alerts, health check failures
   - Config: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in credentials

2. Slack Webhook (second priority)
   - Send: same events via Slack incoming webhooks
   - Config: SLACK_WEBHOOK_URL in credentials

3. Integration with Corporation hooks system:
   - `getCorporationHooks().on('task_executed', notify)`
   - `getCorporationHooks().on('escalation_triggered', notify)`
   - `getCorporationHooks().on('health_check_failed', notify)`
```

**What to IGNORE:**
- Bidirectional agent interaction via messaging (conflicts with CLI-first)
- WhatsApp as framework feature (keep project-specific for Tocks Sales AI)
- Cross-channel state management (unnecessary for notification-only scope)

**Effort:** Low-Medium (1-2 stories for Telegram, 1 more for Slack)
**Value:** High -- enables 24/7 Corporation monitoring without watching the terminal

---

## 5. Integration Catalog (250+ Platforms, 47,856 Tools)

### What One Does

- 47,856 tools across 255 platforms
- Categories: CRM (25), AI (46), Payments (3), eCommerce (6), DevOps, etc.
- Open-source knowledge base at withone.ai/knowledge
- Each integration includes action count, category, API docs
- Largest: Zoom (1,748 actions), Twilio (1,437), HubSpot (1,188), GitHub (1,105)

### AIOS Current State

AIOS integrations are project-specific MCP bridges:
- **MCP Ads Bridge** (Tocks): 52 tools for Google Ads API
- **MCP Brain Bridge** (Mega Brain/JARVIS): 15 tools for mind clone consultation
- **MCP Image Studio** (Bretda): Replicate + fal.ai for image generation
- **Docker MCP**: EXA (search), Context7 (docs), Apify (scraping)
- **Entity Registry** (`data/entity-registry.yaml`): Agent catalog, not integration catalog
- **Tool Registry** (`data/tool-registry.yaml`): Unread, likely maps available tools

### Mapping to Active Projects

| One Category | Tools | Active AIOS Project | Relevance |
|-------------|-------|---------------------|-----------|
| **Advertising** | Google Ads, Meta Ads | **Tocks** (Google Ads via MCP Bridge) | HIGH -- could replace custom bridge |
| **Payments** | Stripe | **Serenity AI** (subscription billing) | HIGH -- needed for M5+ |
| **CRM** | HubSpot, Salesforce | **Tocks Sales AI** (customer profiles) | MEDIUM -- CRM planned |
| **Messaging** | WhatsApp, Telegram | **Tocks Sales AI** (WhatsApp), **Corporation** (notifications) | HIGH |
| **eCommerce** | Shopify | **Bretda** (potential online store) | LOW (not yet planned) |
| **AI** | OpenAI, Anthropic | **All projects** (LLM routing) | LOW (already solved) |
| **Storage** | Supabase, Google Drive | **Serenity**, **Tocks Dashboard** | MEDIUM |
| **Project Management** | Linear, GitHub | **AIOS Corporation** | MEDIUM |
| **Email** | Gmail, SendGrid | **Tocks** (lead follow-up) | MEDIUM |
| **Analytics** | PostHog, Datadog | **All projects** (observability) | LOW (future) |

### Recommendation: SELECTIVE ABSORB via MCP Bridge Pattern

**Rationale:** AIOS should NOT replicate One's catalog. Instead, leverage One's open-source knowledge base as a reference when building new MCP bridges.

**What to ABSORB:**

1. **Knowledge format pattern** -- One's structured integration metadata (action count, category, API docs link) should be adopted for AIOS's `tool-registry.yaml`:
   ```yaml
   # Proposed tool-registry.yaml enhancement
   integrations:
     google-ads:
       actions: 52
       category: advertising
       bridge: mcp-ads-bridge
       docs: https://developers.google.com/google-ads/api
       status: active
       project: tocks
     stripe:
       actions: 0  # not yet integrated
       category: payments
       bridge: null
       docs: https://stripe.com/docs/api
       status: planned
       project: serenity-ai
   ```

2. **Bridge Factory pattern** -- One's "Bridge" product converts standard APIs into MCP servers. AIOS could create a `bridge-factory.js` utility that scaffolds MCP bridge boilerplate from an API spec:
   ```bash
   aios bridge create stripe --from-openapi https://raw.githubusercontent.com/.../stripe-openapi.yaml
   ```

**What to IGNORE:**
- Hosting a catalog of 255 platforms (AIOS is CLI-first, not a SaaS)
- Replacing existing project-specific MCP bridges with generic ones (the custom bridges have domain knowledge baked in)

---

## Priority Matrix

### Tier 1: ABSORB -- High Value, Low Effort

| # | Pattern | Effort | Value | Target Module | First Project |
|---|---------|--------|-------|---------------|---------------|
| 1 | CLI event trigger command | 1 story | HIGH | Corporation Scheduler | All |
| 2 | Dry-run flag for tasks | 0.5 story | MEDIUM | CLI / Task runner | All |
| 3 | Tool registry format enhancement | 1 story | MEDIUM | data/tool-registry.yaml | All |

### Tier 2: ADAPT -- High Value, Medium Effort

| # | Pattern | Effort | Value | Target Module | First Project |
|---|---------|--------|-------|---------------|---------------|
| 4 | Credential Manager module | 2-3 stories | VERY HIGH | Corporation | Tocks (Google Ads) |
| 5 | Webhook listener for external events | 2 stories | HIGH | Corporation Scheduler | DevOps (GitHub) |
| 6 | Telegram notification relay | 1-2 stories | HIGH | Corporation | All (24/7 monitoring) |
| 7 | Bridge Factory (MCP scaffold) | 2 stories | MEDIUM | Infrastructure | Serenity (Stripe) |

### Tier 3: IGNORE -- Already Solved or Conflicts

| # | Pattern | Reason |
|---|---------|--------|
| 8 | JSON flow format | Conflicts with CLI-first; markdown tasks are superior for agent readability |
| 9 | Runtime flow mutation | Synapse context injection already provides adaptive behavior |
| 10 | Step-to-step data selectors | Agent context windows are more flexible |
| 11 | Full integration catalog | AIOS is not a SaaS; project-specific bridges are appropriate |
| 12 | Bidirectional messaging agents | Violates Constitution Article I (CLI-first) |
| 13 | Multi-tenant credential isolation | Single-user system; unnecessary complexity |
| 14 | Visual flow builder | CLI-first architecture |

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1-2)

1. **CLI event trigger** -- `aios corporation event <name> --payload '{}'`
   - Wire to existing `scheduler.triggerEvent()`
   - Zero new modules needed

2. **Dry-run flag** -- `--dry-run` on task execution
   - Agents describe actions without executing
   - Minimal change to task runner

3. **Tool registry enhancement** -- Update `tool-registry.yaml` with One-inspired metadata format

### Phase 2: Infrastructure (Week 3-6)

4. **Credential Manager** -- Centralized auth for all MCP bridges
   - Priority: Google OAuth2 refresh (Tocks Ads)
   - YAML-backed encrypted store
   - CLI: `aios credentials add/rotate/check`

5. **Webhook Listener** -- HTTP entry point for external events
   - Lightweight Node.js HTTP server
   - HMAC signature validation
   - Feature-flagged in core-config.yaml

### Phase 3: Observability (Week 6-8)

6. **Telegram Notification Relay** -- Push Corporation events to Telegram
   - Bot creation + configuration
   - Hook into Corporation events system
   - Alert on: escalations, health failures, schedule completions

7. **Bridge Factory** -- Scaffold MCP bridges from OpenAPI specs
   - Template-based code generation
   - Reduces time to create new integrations from days to hours

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Credential Manager complexity exceeds estimate | MEDIUM | HIGH | Start with env-var injection only, defer encryption to v2 |
| Webhook listener creates security surface | MEDIUM | HIGH | Localhost-only by default, HMAC required for remote |
| Telegram relay becomes noisy | LOW | LOW | Configurable severity threshold (critical/high only by default) |
| Bridge Factory generates low-quality scaffolds | MEDIUM | MEDIUM | Focus on 3-5 most-needed APIs, manual review required |

---

## Architectural Alignment Check

Every recommendation was validated against AIOS constraints:

| Principle | Status | Notes |
|-----------|--------|-------|
| Constitution Art. I (CLI-first) | PASS | All features are CLI-first; notifications are observability, not control |
| Constitution Art. II (Agent Authority) | PASS | No pattern overrides agent decision-making |
| Constitution Art. IV (No Invention) | PASS | All patterns grounded in analyzed platform data |
| core-config.yaml feature flags | PASS | All new modules feature-flagged |
| Corporation enabled:true / scheduler enabled:false | COMPATIBLE | New features respect existing flags |

---

## Sources

- [One AI Platform](https://www.withone.ai/) -- Primary analysis source
- [One AI About/Architecture](https://www.withone.ai/about) -- Technical components (Flow, Auth, Relay, Knowledge, Bridge)
- [One AI Knowledge Base](https://www.withone.ai/knowledge) -- Integration catalog (255 platforms, 47,856 tools)
- [OAuth for AI Agents Architecture Guide](https://www.scalekit.com/blog/oauth-ai-agents-architecture) -- Industry context for credential management
- [APIs for AI Agents Integration Patterns](https://composio.dev/content/apis-ai-agents-integration-patterns) -- Cross-reference for flow patterns
- [AI Agent Orchestration Patterns - Azure](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) -- Architecture validation

---

*-- Atlas, investigando a verdade*
