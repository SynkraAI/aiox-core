# MCP Precision & Reliability Architecture

**Author:** Aria (Architect Agent)
**Date:** 2026-03-30
**Status:** PROPOSAL
**Scope:** AIOS ecosystem-wide MCP tool routing, browser fallback, and feedback loops

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Semantic Router Layer](#3-semantic-router-layer)
4. [Browser Automation Layer](#4-browser-automation-layer)
5. [Feedback Loop System](#5-feedback-loop-system)
6. [Architecture Diagram](#6-architecture-diagram)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Impact Analysis](#8-impact-analysis)
9. [Trade-off Analysis](#9-trade-off-analysis)
10. [ADR Log](#10-adr-log)

---

## 1. Executive Summary

The AIOS ecosystem currently manages **75+ MCP tools** across 3 bridges plus native tools, Docker Gateway tools, and agent-scoped Tier 2 tools. Three systemic problems degrade agent effectiveness:

| Problem | Root Cause | Impact |
|---------|-----------|--------|
| Wrong tool selection | Tool descriptions consume 40-50% context window; overlapping tools cause confusion | Wasted tokens, failed operations, user frustration |
| No browser fallback | Not every service has an API; agents hit dead ends | Manual intervention required for web-only tasks |
| No feedback loop | Agents repeat identical MCP failures across sessions | Compounding waste, no organizational learning |

This document proposes a 3-layer solution:

```
SEMANTIC ROUTER (pre-filter) --> MCP EXECUTION --> BROWSER FALLBACK --> FEEDBACK LOOP
        |                              |                  |                   |
   Filters 75+ tools            Executes top 3-5    Handles no-API       Records outcomes
   down to 3-5 relevant         tool calls           scenarios            for future routing
```

Estimated impact: **60-70% reduction in wrong tool calls**, **100% coverage for web-only tasks**, **progressive accuracy improvement** across all agents.

---

## 2. Current State Analysis

### 2.1 MCP Tool Inventory

#### Bridge: mcp-ads-bridge (52 tools)

| Category | Tool Count | Overlap Risk |
|----------|-----------|--------------|
| Google Ads Campaign | 12 | HIGH -- `create_campaign`, `update_campaign`, `get_campaigns` overlap with Sheets reporting tools |
| Google Ads Reporting | 8 | MEDIUM -- overlaps with Sheets dashboard tools |
| Meta Ads Campaign | 10 | HIGH -- mirrors Google Ads naming, agent confuses providers |
| Meta Ads Reporting | 6 | MEDIUM -- same overlap pattern as Google |
| Google Sheets | 8 | LOW -- distinct category but used alongside reporting |
| Utility/Auth | 8 | LOW |

**Critical overlap zone:** Google Ads vs Meta Ads tools share near-identical descriptions (e.g., `create_campaign` for Google vs `meta_create_campaign`). An agent asked to "create a campaign" has no semantic signal about which platform to use without context inspection.

#### Bridge: aios-brain-bridge (16 tools)

| Category | Tool Count | Overlap Risk |
|----------|-----------|--------------|
| Conclave / Reports | 3 | LOW |
| Expert Consultation | 4 | MEDIUM -- `request_expert_consultation` vs `get_consultation_response` sequence confusion |
| Knowledge Sync | 5 | LOW |
| Insights | 3 | LOW |
| Bridge Meta | 1 | LOW |

**Sequence confusion:** Consultation requires a 2-step call pattern (`request` then `get_response`). Agents frequently call `get_consultation_response` without a preceding `request`, receiving empty results and retrying.

#### Bridge: mcp-image-studio (7 tools)

| Category | Tool Count | Overlap Risk |
|----------|-----------|--------------|
| Generation | 3 | MEDIUM -- `generate_image` vs `generate_with_style` vs `generate_variation` |
| Transformation | 2 | LOW |
| Utility | 2 | LOW |

#### Native + Docker Gateway Tools (from tool-registry.yaml)

| Tier | Count | Token Cost |
|------|-------|-----------|
| Tier 1 (Always loaded) | 12 | ~2,900 tokens |
| Tier 2 (Deferred) | 15 | ~3,100 tokens (when loaded) |
| Tier 3 (External/MCP) | 6 registered | ~2,700 tokens (when loaded) |

**Total potential context cost:** 75+ MCP bridge tools + 33 registry tools = **108+ tools** that could appear in context. At ~100-200 tokens per tool description, this is **10,800-21,600 tokens** just for tool definitions -- easily 40-50% of a 40K context window.

### 2.2 Existing Mitigation Mechanisms

The AIOS ecosystem already has partial solutions:

| Mechanism | File | What It Does | Gap |
|-----------|------|-------------|-----|
| Tool Registry 3-Tier Mesh | `.aios-core/data/tool-registry.yaml` | Classifies tools as Always/Deferred/External | No semantic understanding; loads by agent profile, not by intent |
| MCP Discipline | `.aios-core/data/mcp-discipline.js` | Disables non-essential MCP servers | Binary on/off; no per-query filtering |
| Agent Profiles | `tool-registry.yaml` profiles section | Per-agent tool sets | Static; cannot adapt to task within session |
| Synapse Context Engine | `.aios-core/core/synapse/engine.js` | 8-layer context injection pipeline with bracket-aware filtering | Manages context budget but has no tool-routing intelligence |
| Code Intel Provider | `.aios-core/core/code-intel/index.js` | Enrichment layer for code analysis | Limited to code intelligence; no general MCP routing |
| Corporation Scheduler | `.aios-core/core/corporation/scheduler.js` | Task routing via TaskRouter | Routes tasks to agents, not tools to tasks |

**Gap summary:** The system can control WHICH tools are loaded (registry) and HOW MUCH context is available (Synapse), but has zero intelligence about WHICH tool is correct for a specific user intent.

### 2.3 Failure Taxonomy (Observed Patterns)

| Failure Mode | Frequency | Example |
|-------------|-----------|---------|
| **Platform confusion** | HIGH | Agent calls Google Ads tool when user context is Meta Ads |
| **Sequence violation** | MEDIUM | Calling `get_consultation_response` before `request_expert_consultation` |
| **Stale context** | MEDIUM | Using cached campaign data that is hours old |
| **Tool not available** | LOW | MCP server down, Docker Gateway unreachable |
| **Wrong parameter shape** | MEDIUM | Passing Meta Ads parameters to Google Ads tool schema |
| **No-API dead end** | HIGH | Agent needs to check a web dashboard with no API coverage |

---

## 3. Semantic Router Layer

### 3.1 Technology Selection

| Criterion | aurelio-labs/semantic-router | agentrouters/library |
|-----------|---------------------------|---------------------|
| Routing latency | ~10ms (embedding-based) | ~50ms (async engine) |
| Route capacity | 100+ routes, tested at scale | Designed for multi-agent |
| Embedding support | Local (sentence-transformers) + API (OpenAI, Cohere) | N/A (rule-based + priority) |
| Language | Python | Python (Brazilian project, PT docs) |
| AIOS integration fit | HIGH -- single pre-filter before MCP | MEDIUM -- more suited for agent-level routing |
| Maintenance burden | LOW -- MIT, active community | LOW -- but smaller community |
| Token savings | Filters 100+ tools to 3-5 | Prioritizes but doesn't filter |

**[AUTO-DECISION] Primary router? -> aurelio-labs/semantic-router (reason: 10ms latency, embedding-based semantic understanding matches the core problem of intent-to-tool mapping; agentrouters better suited as secondary priority layer within a domain)**

**[AUTO-DECISION] Embedding model? -> Local sentence-transformers with `all-MiniLM-L6-v2` (reason: 22MB model, runs on CPU in <10ms, zero API cost, zero latency penalty; upgrade path to OpenAI `text-embedding-3-small` if accuracy insufficient)**

### 3.2 Where It Sits in the AIOS Stack

The semantic router inserts as a **pre-filter layer** between user intent and MCP tool execution. It integrates with two existing systems:

```
User Prompt
    |
    v
[Synapse Engine L0-L2]  <-- existing context pipeline
    |
    v
[Semantic Router]        <-- NEW: filters available tools by intent
    |                        Input: prompt + active agent + session context
    |                        Output: ranked list of 3-5 tools
    v
[Tool Registry Filter]  <-- existing: intersects with agent profile
    |
    v
[MCP Execution]         <-- existing: calls filtered tool set
    |
    v
[Feedback Collector]    <-- NEW: records success/failure
```

**Integration point with Synapse:** The router reads context bracket from `SynapseEngine.process()` output to adjust route confidence thresholds. In `green` bracket (early conversation, ample context), it can be more liberal (top 5 tools). In `red` bracket (late conversation, constrained context), it restricts to top 2-3.

**Integration point with Corporation Scheduler:** When the scheduler routes tasks via `TaskRouter.route()`, the semantic router pre-filters the tool set based on the task description before the agent receives it.

### 3.3 Route Definitions by Domain

Routes are defined as semantic clusters -- each route has a name, a set of utterance examples, and a tool mapping.

#### Domain: Ads Management

```yaml
routes:
  google-ads-campaign:
    utterances:
      - "create a Google Ads campaign"
      - "update Google campaign budget"
      - "pause Google Ads campaign"
      - "Google Ads performance report"
    tools: [create_google_campaign, update_google_campaign, pause_google_campaign, get_google_campaigns]
    guard: "context must mention Google/GDN/Search/PMax"

  meta-ads-campaign:
    utterances:
      - "create a Meta campaign"
      - "Facebook Ads budget"
      - "Instagram ads performance"
      - "Meta Ads reporting"
    tools: [meta_create_campaign, meta_update_campaign, meta_get_campaigns]
    guard: "context must mention Meta/Facebook/Instagram"

  ads-reporting:
    utterances:
      - "campaign performance report"
      - "ROAS analysis"
      - "cost per acquisition trend"
    tools: [get_google_report, meta_get_report, sheets_write_data]
    disambiguation: "Ask: which platform? Google Ads or Meta?"
```

#### Domain: Knowledge/Brain

```yaml
routes:
  expert-consultation:
    utterances:
      - "ask the expert about"
      - "consult mind clone"
      - "get expert opinion on"
    tools: [request_expert_consultation, get_consultation_response]
    sequence_enforced: true
    sequence: [request_expert_consultation, get_consultation_response]

  knowledge-sync:
    utterances:
      - "sync knowledge base"
      - "publish insights"
      - "update mind clone data"
    tools: [sync_knowledge_data, publish_aios_insights]

  conclave:
    utterances:
      - "start conclave"
      - "get analyst brief"
      - "conclave report"
    tools: [get_analyst_brief, publish_conclave_report]
```

#### Domain: Image Generation

```yaml
routes:
  image-generation:
    utterances:
      - "generate an image of"
      - "create a visual for"
      - "make a picture showing"
    tools: [generate_image]
    refinement_routes:
      styled: {trigger: "in the style of", tool: generate_with_style}
      variation: {trigger: "variation of", tool: generate_variation}

  image-transform:
    utterances:
      - "resize image"
      - "crop image"
      - "transform image"
    tools: [transform_image, resize_image]
```

#### Domain: Code Intelligence (passthrough)

```yaml
routes:
  code-analysis:
    utterances:
      - "analyze dependencies"
      - "find circular imports"
      - "code structure"
    tools: [nogic, code-graph]
    essential: true  # Never filtered out
```

### 3.4 Route Storage and Hot-Reload

Routes are defined in YAML files at `.aios-core/data/semantic-routes/`:

```
.aios-core/data/semantic-routes/
  ads-routes.yaml
  brain-routes.yaml
  image-routes.yaml
  code-intel-routes.yaml
  native-routes.yaml        # Read/Write/Grep/Glob routing
```

The router watches these files and hot-reloads on change. No server restart required.

### 3.5 Embedding Index Architecture

The semantic router pre-computes embeddings for all utterance examples at startup:

1. **Build phase** (runs once at `npx aiox-core install` or `*rebuild-routes`):
   - Read all route YAML files
   - Generate embeddings for all utterances via `all-MiniLM-L6-v2`
   - Store index at `.aios/semantic-index.bin` (binary, ~200KB for 500 utterances)

2. **Query phase** (runs per user prompt, <10ms):
   - Embed user prompt
   - Cosine similarity against index
   - Return top-K routes (K = 3-5 depending on context bracket)
   - Apply guards (platform mention checks)
   - Return filtered tool list

3. **Update phase** (incremental):
   - When route YAML changes, recompute only affected embeddings
   - Merge into existing index

### 3.6 Confidence Thresholds

| Context Bracket | Min Confidence | Max Tools Returned | Behavior on Low Confidence |
|----------------|---------------|-------------------|---------------------------|
| green (0-30%) | 0.65 | 5 | Include broader set |
| yellow (30-60%) | 0.72 | 4 | Standard filtering |
| orange (60-80%) | 0.80 | 3 | Strict filtering |
| red (80-95%) | 0.85 | 2 | Only high-confidence matches |

When NO route exceeds the confidence threshold, the router returns a `disambiguation` signal, and the agent asks the user for clarification instead of guessing.

---

## 4. Browser Automation Layer

### 4.1 Decision Matrix

| Criterion | browser-use | Skyvern | agent-browser (Vercel) |
|-----------|------------|---------|----------------------|
| **Architecture** | Chromium/CDP, Python | Vision LLM + CDP | CLI-native, designed for Claude Code |
| **LLM dependency** | Optional (can use element selectors) | REQUIRED (vision model for every action) | Minimal (uses Claude's own vision) |
| **Cost per action** | ~0 (local Chromium) | ~$0.01-0.10 (vision API call per step) | ~0 (local) |
| **Reliability** | HIGH -- deterministic CDP commands | MEDIUM -- vision model can misinterpret | HIGH -- tight CLI integration |
| **Setup complexity** | Moderate (Chromium install, Python) | HIGH (cloud service or self-hosted) | LOW (npm install) |
| **AIOS CLI First alignment** | MEDIUM -- Python process | LOW -- cloud-first, GUI-heavy | HIGH -- CLI-native, npm ecosystem |
| **Headless support** | Yes | Yes | Yes |
| **Authentication handling** | Manual cookie/session injection | Built-in credential management | Manual |
| **Security surface** | Local Chromium sandbox | External API with credentials | Local Chromium sandbox |
| **Maintenance** | Active, MIT | Active, commercial backing | Early stage, Vercel labs |

**[AUTO-DECISION] Primary browser tool? -> browser-use (reason: zero per-action cost, deterministic CDP commands, Python can be called from Node via child_process, active community; agent-browser is too early-stage; Skyvern's per-action cost is prohibitive for routine fallback usage)**

**[AUTO-DECISION] When to use Skyvern? -> Reserve for complex multi-step web flows that require visual understanding (form filling on unknown layouts, CAPTCHA handling). Budget: max 50 calls/day.**

### 4.2 Fallback Architecture

The browser layer activates ONLY when:
1. The semantic router identifies the user intent but no MCP tool covers it
2. An MCP tool call fails with "endpoint not available" or "feature not supported"
3. The task explicitly requires web interaction (scraping, form filling, screenshot)

```
MCP Execution Result
    |
    +--> SUCCESS --> done
    |
    +--> FAILURE (no tool / endpoint down / not supported)
            |
            v
        [Browser Fallback Router]
            |
            +--> Simple navigation/read --> browser-use (CDP, deterministic)
            |
            +--> Complex visual interaction --> Skyvern (vision LLM, budgeted)
            |
            +--> Screenshot/verification --> playwright MCP (already installed)
```

### 4.3 Browser Action Templates

Pre-defined templates for common fallback scenarios:

```yaml
browser_templates:
  google-ads-dashboard:
    url: "https://ads.google.com"
    auth: cookie-based  # requires session cookie injection
    actions:
      check_campaign_status:
        steps:
          - navigate: "/campaigns"
          - wait: ".campaign-table"
          - extract: ".campaign-row .status-badge"
      download_report:
        steps:
          - navigate: "/reports"
          - click: "#download-csv"
          - wait_download: 30s

  meta-business-suite:
    url: "https://business.facebook.com"
    auth: cookie-based
    actions:
      check_ad_status:
        steps:
          - navigate: "/adsmanager"
          - wait: ".ad-table-body"
          - extract: ".ad-row"

  generic-web-read:
    actions:
      read_page:
        steps:
          - navigate: "{url}"
          - wait: "body"
          - extract: "main, article, .content"
      screenshot:
        steps:
          - navigate: "{url}"
          - screenshot: "full-page"
```

### 4.4 Security Implications

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Credential exposure in browser sessions | HIGH | Session cookies stored in `.aios/browser-sessions/` (gitignored), encrypted at rest with DPAPI (Windows) |
| Malicious URL navigation | MEDIUM | URL allowlist per template; unknown URLs require explicit user approval |
| Data exfiltration via browser | LOW | Browser runs in headless sandboxed Chromium; no extension loading |
| CDP port exposure | LOW | Bind CDP to 127.0.0.1 only; random port per session |
| Rate limiting / bot detection | MEDIUM | Respect robots.txt; use realistic User-Agent; add random delays between actions |

**CRITICAL:** Browser automation MUST respect `corporation.permissions.enforce` flag. If permissions are enforced, browser actions above L2 autonomy require human approval via the scheduler queue.

---

## 5. Feedback Loop System

### 5.1 Design Approach

Inspired by the DebugBase pattern (shared error/fix knowledge base between agents) but adapted to AIOS's existing memory infrastructure.

The feedback loop has 3 components:
1. **Outcome Collector** -- records every MCP tool call result
2. **Error Taxonomy Engine** -- classifies failures into actionable categories
3. **Learning Propagator** -- updates route weights and shares fixes across agents

### 5.2 Error Taxonomy for MCP Failures

```yaml
error_taxonomy:
  # Level 1: Routing errors (wrong tool selected)
  routing:
    platform_confusion:
      description: "Agent called Google Ads tool when Meta Ads was intended (or vice versa)"
      signal: "Tool returned data for wrong platform OR user corrected after"
      action: "Increase disambiguation guard weight for ads domain"
      severity: medium

    sequence_violation:
      description: "Agent called tools in wrong order (e.g., get_response before request)"
      signal: "Empty result from a tool that requires a preceding call"
      action: "Enforce sequence constraint in route definition"
      severity: low

    wrong_domain:
      description: "Agent called an entirely wrong category of tool"
      signal: "Tool returned schema mismatch error"
      action: "Retrain route embeddings with negative example"
      severity: high

  # Level 2: Execution errors (right tool, wrong params)
  execution:
    schema_mismatch:
      description: "Parameters don't match tool's expected schema"
      signal: "Tool returned validation error"
      action: "Add parameter template to route definition"
      severity: medium

    auth_expired:
      description: "Authentication token or session expired"
      signal: "401/403 from MCP server"
      action: "Trigger re-auth flow; mark server as needs-refresh"
      severity: low

    rate_limited:
      description: "API rate limit exceeded"
      signal: "429 from MCP server"
      action: "Enqueue retry with backoff; log frequency for capacity planning"
      severity: low

  # Level 3: Infrastructure errors (tool unavailable)
  infrastructure:
    server_down:
      description: "MCP server not responding"
      signal: "Connection timeout or refused"
      action: "Activate browser fallback; alert @devops"
      severity: high

    docker_gateway_error:
      description: "Docker MCP Gateway unreachable"
      signal: "docker-gateway connection error"
      action: "Fall back to direct tool if available; alert @devops"
      severity: high

  # Level 4: Dead end (no tool exists)
  capability_gap:
    no_api_coverage:
      description: "Required action has no MCP tool"
      signal: "Semantic router returns no match above threshold"
      action: "Activate browser fallback"
      severity: medium

    feature_not_implemented:
      description: "Tool exists but doesn't support the specific operation"
      signal: "Tool returned 'not implemented' or 'unsupported' error"
      action: "Log as feature request; activate browser fallback"
      severity: low
```

### 5.3 Outcome Recording Schema

Every MCP tool call produces a feedback record:

```json
{
  "id": "fb-2026-03-30-001",
  "timestamp": "2026-03-30T14:23:45.000Z",
  "agent_id": "dev",
  "session_id": "sess-abc123",
  "tool_called": "create_google_campaign",
  "route_used": "google-ads-campaign",
  "route_confidence": 0.87,
  "intent_extracted": "create a search campaign for Tocks",
  "outcome": "success",
  "error_class": null,
  "latency_ms": 2340,
  "user_correction": null,
  "context_bracket": "green",
  "tools_considered": ["create_google_campaign", "meta_create_campaign", "sheets_create_tab"]
}
```

On failure or user correction:

```json
{
  "outcome": "failure",
  "error_class": "routing.platform_confusion",
  "error_detail": "Called Google Ads tool but user context was Meta Ads",
  "user_correction": "I meant Meta Ads, not Google",
  "corrected_tool": "meta_create_campaign",
  "learning_action": "Add negative example to google-ads-campaign route: 'create a campaign for Meta'"
}
```

### 5.4 Storage and Integration with Brain Bridge

Feedback records are stored in two locations:

1. **Local fast store:** `.aios/feedback/mcp-outcomes.jsonl` (append-only, JSONL format)
   - Used for real-time route weight adjustment
   - Rotated weekly, max 10MB per file

2. **Brain Bridge sync:** Via `publish_aios_insights` tool
   - Aggregated weekly: error rates by route, by agent, by tool
   - Published to Mega Brain for cross-project learning
   - Format: `{ type: "mcp-feedback-aggregate", period: "2026-W13", data: {...} }`

### 5.5 Learning Propagation

The feedback loop adjusts routing in 3 timescales:

| Timescale | Mechanism | Scope |
|-----------|----------|-------|
| **Immediate** (same session) | Route confidence boost/penalty in memory | Current agent only |
| **Session** (next agent activation) | Updated weight file at `.aios/semantic-weights.json` | All agents in project |
| **Cross-project** (weekly sync) | Brain Bridge insight publication | All AIOS installations |

**Immediate adjustment example:** If agent calls `create_google_campaign` and user corrects to Meta, the in-memory route score for `google-ads-campaign` is penalized -0.1 and `meta-ads-campaign` is boosted +0.1 for the remainder of the session.

**Session adjustment:** When `.aios/feedback/mcp-outcomes.jsonl` accumulates 10+ records for a route, a background script computes adjusted weights and writes `.aios/semantic-weights.json`. Next agent activation loads these weights as biases on top of the base embedding similarity.

### 5.6 Integration with Existing Memory Systems

| System | Integration Point |
|--------|------------------|
| **Synapse MemoryBridge** (SYN-10) | Feedback summaries become memory hints in `red` bracket: "Last 5 ads operations used Meta -- prefer Meta tools" |
| **Brain Bridge** (`publish_aios_insights`) | Weekly aggregates published for organizational learning |
| **Gotchas** (`.aios/gotchas.json`) | Recurring MCP failures (3+ occurrences) auto-generate gotcha entries |
| **Agent Memory** (`.claude/agent-memory/`) | Per-agent tool preference memories saved when patterns emerge |

---

## 6. Architecture Diagram

```
+------------------------------------------------------------------+
|                        USER PROMPT                                 |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                  SYNAPSE ENGINE (L0-L2)                            |
|  Constitution -> Global Rules -> Agent Context                     |
|  Output: context bracket, active agent, session state              |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                   SEMANTIC ROUTER                                  |
|  [aurelio-labs/semantic-router]                                    |
|                                                                    |
|  Input: prompt + agent + bracket + feedback weights                |
|  Process:                                                          |
|    1. Embed prompt (all-MiniLM-L6-v2, local, <10ms)              |
|    2. Cosine similarity against route index                        |
|    3. Apply feedback weight adjustments                            |
|    4. Apply guard conditions (platform mentions)                   |
|    5. Apply bracket-based confidence threshold                     |
|  Output: ranked tool list (3-5 tools) OR disambiguation signal     |
|                                                                    |
|  Route Sources:                                                    |
|    .aios-core/data/semantic-routes/*.yaml                         |
|  Index Cache:                                                      |
|    .aios/semantic-index.bin                                        |
|  Weight Overrides:                                                 |
|    .aios/semantic-weights.json                                     |
+------------------------------------------------------------------+
                              |
                 +------------+-------------+
                 |                          |
          [TOOLS FOUND]            [NO MATCH / LOW CONFIDENCE]
                 |                          |
                 v                          v
+----------------------------+  +----------------------------+
|    TOOL REGISTRY FILTER    |  |    DISAMBIGUATION          |
|                            |  |    Ask user for            |
|  Intersect router output   |  |    clarification           |
|  with agent profile from   |  +----------------------------+
|  tool-registry.yaml        |
+----------------------------+
                 |
                 v
+------------------------------------------------------------------+
|                    MCP EXECUTION                                   |
|                                                                    |
|  Bridge dispatch:                                                  |
|    ads-bridge (52 tools) | brain-bridge (16) | image-studio (7)   |
|  + Native tools (Tier 1) | Docker Gateway (Tier 2/3)              |
|                                                                    |
|  Sequence enforcement:                                             |
|    Routes with sequence_enforced=true execute in order             |
+------------------------------------------------------------------+
                 |
          +------+------+
          |             |
      [SUCCESS]     [FAILURE]
          |             |
          v             v
+----------------+  +------------------------------------------+
| FEEDBACK       |  |        BROWSER FALLBACK ROUTER            |
| COLLECTOR      |  |                                          |
| Record outcome |  |  Classify failure:                       |
| to JSONL       |  |    infrastructure -> browser-use (CDP)   |
+----------------+  |    capability_gap -> browser-use (CDP)   |
                    |    complex_visual  -> Skyvern (budgeted) |
                    |    screenshot      -> playwright (MCP)   |
                    +------------------------------------------+
                                    |
                                    v
                    +------------------------------------------+
                    |        BROWSER EXECUTION                  |
                    |                                          |
                    |  browser-use: Chromium/CDP, headless     |
                    |  Templates: .aios-core/data/browser-     |
                    |             templates/*.yaml             |
                    |  Session store: .aios/browser-sessions/  |
                    +------------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------+
|                   FEEDBACK COLLECTOR                               |
|                                                                    |
|  Local store: .aios/feedback/mcp-outcomes.jsonl                   |
|  Weight updater: Adjusts .aios/semantic-weights.json              |
|  Gotcha generator: 3+ failures -> .aios/gotchas.json entry       |
|  Brain sync: Weekly -> publish_aios_insights                       |
|  Memory hints: -> Synapse MemoryBridge (SYN-10)                   |
+------------------------------------------------------------------+
```

---

## 7. Implementation Roadmap

### Phase 1: Quick Wins (This Week)

**Goal:** Reduce wrong tool calls by 40% with zero infrastructure changes.

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| 1.1 Add platform guards to ads tools | 2h | HIGH | Add `guard` field to tool descriptions in mcp-ads-bridge: Google tools require "google/gdn/search/pmax" in context, Meta tools require "meta/facebook/instagram" |
| 1.2 Enforce sequence annotations | 1h | MEDIUM | Add `_sequence` metadata to brain-bridge tool descriptions so agents know `request_expert_consultation` must precede `get_consultation_response` |
| 1.3 Create disambiguation prompts | 2h | HIGH | When agent intent matches both Google and Meta tools, inject: "Which platform: Google Ads or Meta Ads?" instead of guessing |
| 1.4 Expand mcp-tool-examples.yaml | 3h | MEDIUM | Add examples for all 52 ads-bridge tools and 16 brain-bridge tools (the +18pp accuracy boost from TOK-4B research applies here) |
| 1.5 Create feedback JSONL logger | 2h | LOW | Simple Node.js script that appends MCP outcomes to `.aios/feedback/mcp-outcomes.jsonl` -- no intelligence yet, just recording |

**Deliverables:**
- Updated tool descriptions in all 3 MCP bridges
- New file: `.aios-core/data/mcp-tool-examples.yaml` expanded section for ads/brain/image tools
- New file: `.aios/feedback/mcp-outcomes.jsonl` (empty, schema documented)
- New script: `.aios-core/infrastructure/scripts/mcp-feedback-logger.js`

### Phase 2: Core Infrastructure (Weeks 2-4)

**Goal:** Deploy semantic router and browser fallback.

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| 2.1 Install semantic-router | 1d | HIGH | `pip install semantic-router` in project venv; create Node.js wrapper that calls Python via child_process |
| 2.2 Define all route YAML files | 2d | HIGH | Create `.aios-core/data/semantic-routes/` with routes for all 75 MCP tools organized by domain |
| 2.3 Build embedding index | 1d | HIGH | Script to generate `.aios/semantic-index.bin` from route YAMLs; integrate into `npx aiox-core install` |
| 2.4 Integrate with Synapse Engine | 1d | MEDIUM | Add router call between L2 output and tool loading in the activation pipeline |
| 2.5 Install browser-use | 1d | MEDIUM | `pip install browser-use`; create Node.js wrapper; define initial templates |
| 2.6 Fallback router logic | 1d | MEDIUM | Decision tree: MCP failure classification -> browser template selection |
| 2.7 Feedback weight adjuster | 1d | MEDIUM | Script that reads `.aios/feedback/mcp-outcomes.jsonl` and writes `.aios/semantic-weights.json` |
| 2.8 Integration tests | 2d | HIGH | Test suite: route accuracy >85% on sample prompts; fallback triggers correctly; feedback records properly |

**Key architectural decisions:**
- Python dependencies managed via project-level `requirements.txt` (not global)
- Node.js-to-Python bridge via `child_process.execFile` with JSON stdin/stdout protocol
- Embedding model bundled locally (no API dependency for core routing)

### Phase 3: Advanced Capabilities (Month 2+)

| Task | Effort | Impact | Details |
|------|--------|--------|---------|
| 3.1 History-aware routing (ToolACE pattern) | 1w | HIGH | Incorporate conversation history into route selection: "If last 3 calls were Meta Ads, bias toward Meta" |
| 3.2 Tiered memory query routing (BudgetMem pattern) | 1w | MEDIUM | Route memory queries to fast local store vs slow Brain Bridge based on query complexity |
| 3.3 Auto-route generation | 3d | MEDIUM | Script that reads MCP server tool descriptions and auto-generates initial route definitions |
| 3.4 Skyvern integration for complex flows | 3d | LOW | API integration for multi-step form filling on unknown web layouts |
| 3.5 Cross-project learning via Brain Bridge | 1w | MEDIUM | Weekly aggregation script; Brain Bridge schema for MCP feedback |
| 3.6 Route A/B testing framework | 3d | LOW | Test alternative route definitions against historical feedback data |
| 3.7 Dashboard observability (Synapse metrics) | 3d | LOW | Add router metrics to `.synapse/metrics/hook-metrics.json` for monitoring |

---

## 8. Impact Analysis

### 8.1 Components Affected

| Component | Change Type | Risk Level | Details |
|-----------|-----------|-----------|---------|
| `.aios-core/core/synapse/engine.js` | MODIFIED | LOW | Add optional router call after L2 processing; feature-gated |
| `.aios-core/data/tool-registry.yaml` | EXTENDED | NONE | Add `semantic_route` field to tool entries; backward compatible |
| `.aios-core/data/mcp-discipline.js` | COEXIST | NONE | Continues to work; semantic router is additive, not replacement |
| `.aios-core/data/mcp-tool-examples.yaml` | EXTENDED | NONE | Add examples for bridge tools |
| `.aios-core/core/corporation/scheduler.js` | EXTENDED | LOW | TaskRouter.route() can optionally pre-filter tools via semantic router |
| `.aios-core/core/code-intel/index.js` | NONE | NONE | Code intel routes are passthrough (essential, never filtered) |
| `.aios-core/development/scripts/unified-activation-pipeline.js` | MODIFIED | LOW | Load semantic weights at agent activation |
| All 12 agent .md files | NONE | NONE | No changes needed; routing is transparent to agents |

### 8.2 Backward Compatibility

**All changes are additive and feature-gated.**

```yaml
# core-config.yaml additions
semanticRouter:
  enabled: false          # Default off until Phase 2 validated
  model: all-MiniLM-L6-v2
  indexPath: .aios/semantic-index.bin
  weightsPath: .aios/semantic-weights.json
  routesPath: .aios-core/data/semantic-routes/
  confidenceThreshold: 0.72

browserFallback:
  enabled: false
  engine: browser-use    # browser-use | skyvern | playwright
  templates: .aios-core/data/browser-templates/
  sessionStore: .aios/browser-sessions/
  skyvernBudget: 50      # max calls/day

feedback:
  enabled: false
  store: .aios/feedback/mcp-outcomes.jsonl
  maxSizeMb: 10
  rotationDays: 7
  brainSyncEnabled: false
  gotchaThreshold: 3     # failures before auto-gotcha
```

If `semanticRouter.enabled: false`, the system operates identically to today. No agent behavior changes.

### 8.3 Performance Impact

| Operation | Current | With Router | Delta |
|-----------|---------|------------|-------|
| Agent activation | ~50ms | ~60ms (+index load) | +10ms first call, 0ms cached |
| Per-prompt tool selection | N/A (all tools visible) | ~10ms embedding + cosine | +10ms per prompt |
| Context window usage | 40-50% for tool descriptions | 10-15% (3-5 tools only) | **-30% context freed** |
| MCP call accuracy | ~60-70% (estimated from failure patterns) | ~85-90% (based on semantic-router benchmarks) | **+20-25% accuracy** |

The **30% context window savings** is the most significant impact -- it directly translates to longer effective conversations and more room for actual work context.

### 8.4 Security Implications

| Area | Risk | Mitigation |
|------|------|-----------|
| Embedding model | Prompt injection via adversarial embeddings | Route guards act as hard filters independent of embedding similarity |
| Browser sessions | Stored credentials | DPAPI encryption, gitignore, session TTL |
| Feedback data | Contains user intent summaries | Anonymize before Brain Bridge sync; local store is project-scoped |
| Python subprocess | Code injection | Fixed script paths, JSON-only stdin/stdout, no shell=true |

---

## 9. Trade-off Analysis

### 9.1 Semantic Router: Local Embeddings vs API Embeddings

| Factor | Local (all-MiniLM-L6-v2) | API (OpenAI text-embedding-3-small) |
|--------|--------------------------|-------------------------------------|
| Latency | <10ms | 100-300ms |
| Cost | $0 | ~$0.00002 per query |
| Accuracy | GOOD (384 dims) | BETTER (1536 dims) |
| Offline support | YES | NO |
| Setup complexity | Python + model download (22MB) | API key only |
| AIOS CLI First alignment | STRONG -- no external dependency | WEAK -- requires network |

**Recommendation:** Start with local embeddings. If accuracy on ads tool disambiguation is below 80% after Phase 2 validation, upgrade to API embeddings. The 100-300ms latency penalty is acceptable if it significantly improves accuracy.

### 9.2 Browser Fallback: browser-use vs Agent-Browser vs Playwright MCP

| Factor | browser-use | agent-browser | playwright (existing) |
|--------|------------|---------------|----------------------|
| Already installed | NO | NO | YES |
| Full page interaction | YES | YES | YES |
| Form filling | YES (advanced) | YES | YES (basic) |
| Session persistence | YES | NO | NO |
| Cost | $0 | $0 | $0 |
| Python dependency | YES | NO (Node.js) | NO |

**Recommendation:** Use existing Playwright MCP for screenshots and simple reads (it is already installed and working). Add browser-use for complex interactions and session-persistent flows. This avoids introducing a Node.js dependency (agent-browser) while leveraging what is already deployed.

### 9.3 Feedback Loop: Local-Only vs Brain Bridge Sync

| Factor | Local Only | Local + Brain Bridge |
|--------|-----------|---------------------|
| Latency | 0ms (append to file) | 0ms local + async weekly sync |
| Cross-project learning | NO | YES |
| Privacy risk | NONE | MEDIUM (intent summaries leave local) |
| Complexity | LOW | MEDIUM |

**Recommendation:** Implement local-only first (Phase 1). Add Brain Bridge sync in Phase 3 after validating that the feedback data is useful and after implementing anonymization.

---

## 10. ADR Log

### ADR-MCP-1: Semantic Router Technology Selection

**Decision:** Use `aurelio-labs/semantic-router` with local `all-MiniLM-L6-v2` embeddings.
**Rationale:** 10ms latency, zero API cost, proven at 100+ route scale. Aligns with CLI First principle (no external dependency for core operation).
**Alternatives rejected:** `agentrouters/library` (rule-based, less accurate for intent matching), raw cosine similarity (no route management features), LLM-based routing (too slow at 500ms+).

### ADR-MCP-2: Browser Fallback Strategy

**Decision:** Playwright MCP (existing) for simple reads + browser-use for complex interactions. Skyvern reserved for vision-dependent flows with daily budget.
**Rationale:** Minimize new dependencies; leverage existing Playwright installation; browser-use provides the deterministic CDP control needed for reliable fallback.
**Security constraint:** All browser sessions require L2 or lower autonomy; L3+ requires user approval through Corporation Scheduler.

### ADR-MCP-3: Feedback Loop Architecture

**Decision:** Append-only JSONL local store with session-level weight adjustment and weekly aggregation.
**Rationale:** Minimal write overhead (append-only), human-readable format, easy to analyze and rotate. Weight adjustment at session boundary avoids mid-conversation instability.
**Future path:** Brain Bridge sync enables cross-project learning but requires anonymization (Phase 3).

### ADR-MCP-4: Feature Gating Strategy

**Decision:** All three systems (router, browser fallback, feedback) are independently feature-gated in `core-config.yaml`, defaulting to `false`.
**Rationale:** Zero-risk adoption path. Each system can be enabled, tested, and rolled back independently. Existing tool selection behavior is preserved when gates are off.

---

## Appendix A: Key File Paths

| File | Purpose |
|------|---------|
| `.aios-core/data/semantic-routes/*.yaml` | Route definitions by domain |
| `.aios-core/data/browser-templates/*.yaml` | Browser action templates |
| `.aios-core/data/tool-registry.yaml` | Existing tool registry (extended) |
| `.aios-core/data/mcp-tool-examples.yaml` | Existing tool examples (extended) |
| `.aios-core/data/mcp-discipline.js` | Existing MCP discipline (coexists) |
| `.aios-core/infrastructure/scripts/mcp-feedback-logger.js` | NEW: feedback recorder |
| `.aios-core/infrastructure/scripts/semantic-index-builder.js` | NEW: embedding index builder |
| `.aios-core/infrastructure/scripts/feedback-weight-adjuster.js` | NEW: weight updater |
| `.aios-core/core/synapse/engine.js` | MODIFIED: router integration point |
| `.aios/semantic-index.bin` | Runtime: embedding index cache |
| `.aios/semantic-weights.json` | Runtime: feedback-adjusted weights |
| `.aios/feedback/mcp-outcomes.jsonl` | Runtime: outcome records |
| `.aios/browser-sessions/` | Runtime: browser session store |

## Appendix B: Relevant Existing Files Read During Analysis

- `.aios-core/core-config.yaml` -- core framework configuration, feature flags, corporation settings
- `.aios-core/core/synapse/engine.js` -- 8-layer context pipeline with bracket system (integration point)
- `.aios-core/core/corporation/scheduler.js` -- task scheduler with autonomy levels (browser fallback guard)
- `.aios-core/data/tool-registry.yaml` -- 3-tier tool mesh with agent profiles (extension point)
- `.aios-core/data/workflow-chains.yaml` -- workflow chain definitions (context for sequence routing)
- `.aios-core/core/code-intel/index.js` -- code intelligence providers (passthrough route)
- `.aios-core/data/mcp-discipline.js` -- MCP server toggling fallback (coexistence point)
- `.aios-core/data/mcp-tool-examples.yaml` -- tool examples for accuracy boost (extension point)

---

*Aria, arquitetando o futuro*
