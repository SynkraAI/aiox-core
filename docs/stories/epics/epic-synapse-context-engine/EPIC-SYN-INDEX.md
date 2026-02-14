# Epic SYN: SYNAPSE Context Engine

**Epic ID:** EPIC-SYN
**Status:** Active (12/13 stories done — Wave 4 in progress)
**Created:** 2026-02-10
**Author:** @pm (Morgan)
**Architect:** @architect (Aria)
**Architecture Model:** Open Core — 8-layer engine em `aios-core`, memoria inteligente feature-gated em `aios-pro`

**Architecture Documents:**
- [Architecture Recommendation](../../../architecture/SYNAPSE/SYNAPSE-ARCHITECTURE-RECOMMENDATION.md)
- [Hook/Skill/Command Analysis](../../../architecture/SYNAPSE/SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md)
- [ADR-001: 32 Architectural Decisions](../../../architecture/SYNAPSE/docs/ADR-001-SYNAPSE-UNIFIED-CONTEXT-ENGINE.md)
- [Design Document (API Spec)](../../../architecture/SYNAPSE/docs/DESIGN-SYNAPSE-ENGINE.md)
- [Epic Conflict Analysis](../../../architecture/SYNAPSE/docs/HANDOFF-SYNAPSE-EPIC-ANALYSIS.md)

---

## Overview

### Problem Statement

> **"Agents receive zero contextual rules at prompt time — every interaction starts from scratch"**

The AIOS currently has three disconnected context systems:

- **CARL** (external Python hook) — Per-prompt rule injection via KEY=VALUE domains, but monolithic (1073-line single file), Python-based (misaligned with Node.js stack), no agent/workflow awareness
- **MIS** (aios-pro) — Memory Intelligence System captures and retrieves persistent knowledge, but has no per-prompt injection mechanism beyond pipeline activation
- **UAP** (aios-core) — UnifiedActivationPipeline activates agents one-time, but provides no ongoing context during the conversation

**Result:** After activation, agents have no dynamic rules, no bracket-aware filtering, no domain-specific knowledge injection. The conversation degrades as context fills up without mitigation.

### Solution

Implement **SYNAPSE (Synkra Adaptive Processing & State Engine)** — a unified context engine that:

1. **Injects rules per-prompt** via 8-layer hierarchy (L0 Constitution through L7 Star-Commands)
2. **Adapts to context usage** via bracket tracking (FRESH/MODERATE/DEPLETED/CRITICAL)
3. **Integrates with agent state** via session management (active agent, workflow, task, squad)
4. **Consumes existing APIs** — reads from UAP (session state) and MIS (memory retrieval) without rewriting either
5. **Provides CRUD operations** for user-managed domains, rules, and star-commands
6. **Migrates from CARL** with full feature parity plus 8 new capabilities

### Consumer Architecture (NON-NEGOTIABLE)

SYNAPSE operates as a **consumer** of existing systems, NOT a substitute:

```
           CONSUMES (read-only)                    CONSUMES (read-only, pro-gated)
UAP ──────────────────────► SYNAPSE ◄──────────────────────── MIS
(session state)              (8-layer engine)                  (memory retrieval)
                                │
                                ▼ PRODUCES
                         <synapse-rules> XML
                         (injected per-prompt)
```

---

## Stories

| Story | Title | Priority | Complexity | Wave | Estimated | Status |
|-------|-------|----------|------------|------|-----------|--------|
| [SYN-1](story-syn-1-domain-loader.md) | Domain Loader + Manifest Parser | Critical | Medium | 0 | 6-8h | ✅ Done |
| [SYN-2](story-syn-2-session-manager.md) | Session Manager | Critical | Medium | 0 | 6-8h | ✅ Done |
| [SYN-3](story-syn-3-context-bracket.md) | Context Bracket Tracker | Critical | Medium | 0 | 4-6h | ✅ Done |
| [SYN-4](story-syn-4-layers-l0-l3.md) | Layer Processors L0-L3 (Constitution, Global, Agent, Workflow) | Critical | High | 1 | 8-10h | ✅ Done |
| [SYN-5](story-syn-5-layers-l4-l7.md) | Layer Processors L4-L7 (Task, Squad, Keyword, Star-Command) | Critical | High | 1 | 8-10h | ✅ Done |
| [SYN-6](story-syn-6-engine-orchestrator.md) | SynapseEngine Orchestrator + Output Formatter | Critical | High | 1 | 6-8h | ✅ Done |
| [SYN-7](story-syn-7-hook-entry.md) | Hook Entry Point + Registration | High | Medium | 2 | 4-6h | ✅ Done |
| [SYN-8](story-syn-8-domain-content.md) | Domain Content Files (.synapse/ population) | High | Medium | 2 | 6-8h | ✅ Done |
| [SYN-9](story-syn-9-crud-commands.md) | CRUD Commands (.claude/commands/synapse/) | High | Medium | 2 | 6-8h | ✅ Done |
| [SYN-10](story-syn-10-memory-bridge.md) | Pro Memory Bridge (feature-gated MIS consumer) | Medium | High | 3 | 8-10h | ✅ Done |
| [SYN-11](story-syn-11-skills-docs.md) | Skills + Help Documentation | Medium | Low | 3 | 4-6h | ✅ Done |
| [SYN-12](story-syn-12-performance-e2e.md) | Performance Optimization + E2E Testing | Medium | High | 3 | 6-8h | ✅ Done |
| [SYN-13](story-syn-13-session-bridge-diagnostics.md) | UAP Session Bridge + SYNAPSE Diagnostics | Critical | High | 4 | 8-10h | 🔄 InProgress |

**Total Estimated:** 80-106 hours (13 stories across 5 waves)

---

## Waves

### Wave 0: Foundation
**Risk:** ZERO. Creates only new files in `.aios-core/core/synapse/`. No modifications to existing code.
**Parallelizable:** SYN-1, SYN-2, SYN-3 are fully independent.

| Story | Deliverable | Key Files |
|-------|-------------|-----------|
| SYN-1 | Domain Loader + Manifest Parser (KEY=VALUE format) | `.aios-core/core/synapse/domain/domain-loader.js` |
| SYN-2 | Session Manager (JSON schema v2.0, stale cleanup) | `.aios-core/core/synapse/session/session-manager.js` |
| SYN-3 | Context Bracket Tracker (FRESH/MODERATE/DEPLETED/CRITICAL) | `.aios-core/core/synapse/context/context-tracker.js` |

### Wave 1: Layer Engine
**Risk:** LOW. Consumes UAP session data as read-only.
**Dependency:** SYN-4 depends on SYN-1 + SYN-2. SYN-5 depends on SYN-1 + SYN-2 + SYN-4 (LayerProcessor base class). SYN-6 depends on all Wave 0+1. Execution order: SYN-4 → SYN-5 → SYN-6.

| Story | Deliverable | Key Files |
|-------|-------------|-----------|
| SYN-4 | Layer Processors L0-L3 (Constitution, Global, Agent, Workflow) | `.aios-core/core/synapse/layers/l0-l3*.js` |
| SYN-5 | Layer Processors L4-L7 (Task, Squad, Keyword, Star-Command) | `.aios-core/core/synapse/layers/l4-l7*.js` |
| SYN-6 | SynapseEngine orchestrator + `<synapse-rules>` XML formatter | `.aios-core/core/synapse/engine.js`, `output/formatter.js` |

### Wave 2: Integration + Content
**Risk:** LOW. SYN-7 registers hook in settings (CARL disabled). SYN-8 creates `.synapse/` content.
**Dependency:** SYN-7 depends on SYN-6. SYN-8 depends on SYN-1. SYN-9 depends on SYN-1 + SYN-8.
**Parallelizable:** SYN-7 and SYN-9 can run in parallel (independent dependency paths).

| Story | Deliverable | Key Files |
|-------|-------------|-----------|
| SYN-7 | Hook entry point + Claude Code registration | `.claude/hooks/synapse-engine.js`, `settings.local.json` |
| SYN-8 | Domain content files (constitution, global, agents, workflows) | `.synapse/*` (manifest, domains, sessions/) |
| SYN-9 | CRUD commands (manager + 6 tasks + templates) | `.claude/commands/synapse/` |

### Wave 3: Pro + Polish
**Risk:** MEDIUM for SYN-10 (external dep on PRO-6). LOW for SYN-11/12.
**Dependency:** SYN-10 depends on SYN-6 + MIS-6 (Done) + PRO-6. SYN-12 depends on SYN-7 + SYN-10.

| Story | Deliverable | Key Files |
|-------|-------------|-----------|
| SYN-10 | Pro memory bridge (feature-gated MIS consumer) | `.aios-core/core/synapse/memory/memory-bridge.js`, `pro/memory/synapse-memory-provider.js` |
| SYN-11 | Skills + help documentation (SKILL.md + 5 references) | `.claude/skills/synapse/` |
| SYN-12 | Performance optimization (<70ms target) + E2E test suite | `tests/synapse/`, benchmarks |

### Wave 4: Post-Launch Hardening
**Risk:** MEDIUM. Modifies UAP (cross-epic change). Diagnostics are new module.
**Dependency:** SYN-13 depends on SYN-7 + SYN-12 (both Done).

| Story | Deliverable | Key Files |
|-------|-------------|-----------|
| SYN-13 | UAP→SYNAPSE session bridge + `*synapse-diagnose` command | `unified-activation-pipeline.js`, `.aios-core/core/synapse/diagnostics/`, `.synapse/commands` |

---

## Dependencies

### Internal Dependencies

| Story | Depends On | Reason |
|-------|------------|--------|
| SYN-4 | SYN-1, SYN-2 | Layer processors use domain loader to read domain files + session state for active agent/workflow (L2, L3) |
| SYN-5 | SYN-1, SYN-2, SYN-4 | L4-L7 need domain loader + session state (active task/squad) + LayerProcessor base class from SYN-4 |
| SYN-6 | SYN-3, SYN-4, SYN-5 | Orchestrator chains all layers + bracket-aware filtering |
| SYN-7 | SYN-6 | Hook entry point imports and delegates to SynapseEngine |
| SYN-8 | SYN-1 | Content files must conform to domain loader's KEY=VALUE format |
| SYN-9 | SYN-1, SYN-8 | CRUD commands operate on manifest format (SYN-1) and domain content (SYN-8) |
| SYN-10 | SYN-6 | Memory bridge plugs into engine's memory layer slot |
| SYN-11 | SYN-7 | Documentation covers the complete working system |
| SYN-12 | SYN-7, SYN-10 | E2E testing requires full integration (core + pro) |

### External Dependencies

| Dependency | Provided By | Status | Blocks |
|-----------|-------------|--------|--------|
| Claude Code UserPromptSubmit hook | Claude Code native | Available | SYN-7 |
| Session state (active agent/workflow) | ACT-6 SessionContextLoader | Done | SYN-5 |
| Workflow state | ACT-5 WorkflowNavigator | Done | SYN-5 |
| Permission mode | ACT-4 PermissionMode | Done | SYN-4 |
| Memory API (loadForAgent, queryMemories) | MIS-6 Pipeline Integration | Done | SYN-10 |
| Attention scoring | MIS-4 Progressive Retrieval | Done | SYN-10 |
| Self-learning heuristics | MIS-5 Self-Learning Engine | Done | SYN-10 (optional) |
| Feature gate runtime | PRO-6 feature-gate.js | In Progress | SYN-10 |
| `pro-detector.js` | PRO-5 | Done | SYN-10 |
| Entity Registry | IDS-1 | Done | SYN-1 (registration) |

---

## Conflict Analysis with Active Epics

### ACT (Activation Pipeline) — Done (12/12)

| Conflict | Severity | Resolution |
|----------|----------|------------|
| SYNAPSE uses UAP session state | CRITICAL | **Consumer only** — reads `sessionContextLoader`, never writes to UAP files |
| Greeting builder overlap | CRITICAL | **No overlap** — greetings are one-time (UAP), rules are per-prompt (SYNAPSE) |
| Agent definitions | CRITICAL | **Domain mapping** — `.synapse/agent-*` maps rules, doesn't modify agent `.md` files |

### MIS (Memory Intelligence System) — 6/7 Done

| Conflict | Severity | Resolution |
|----------|----------|------------|
| MemoryLoader API consumption | CRITICAL | **API consumer** — uses `loadForAgent()` + `queryMemories()`, doesn't reimplement |
| Session store overlap | CRITICAL | **Separate stores** — `.synapse/sessions/` for SYNAPSE, `.aios/session-digests/` for MIS |

### IDS (Incremental Development System) — Wave 1 Done

| Conflict | Severity | Resolution |
|----------|----------|------------|
| None | N/A | **Orthogonal** — SYNAPSE registers artifacts in Entity Registry per IDS protocol |

### PRO (Pro Repository) — 4/5 Done

| Conflict | Severity | Resolution |
|----------|----------|------------|
| Config hierarchy | MEDIUM | **Complementary** — SYNAPSE uses `feature-gate.js` pattern, adds 1 entry to `feature-registry.yaml` |

---

## Architecture Vision

### 4-Layer Architecture (from CARL analysis)

```
.claude/hooks/synapse-engine.js          # Layer 1: Hook Entry (~50 lines)
        │
        ▼ imports
.aios-core/core/synapse/                 # Layer 2: Engine Modules
├── engine.js                            #   SynapseEngine class
├── layers/                              #   8 layer processors (L0-L7)
│   ├── layer-processor.js               #   Abstract base class
│   ├── l0-constitution.js               #   ALWAYS_ON, NON-NEGOTIABLE
│   ├── l1-global.js                     #   Universal rules
│   ├── l2-agent.js                      #   Agent-scoped domains
│   ├── l3-workflow.js                   #   Workflow-specific rules
│   ├── l4-task.js                       #   Active task context
│   ├── l5-squad.js                      #   Squad domain discovery
│   ├── l6-keyword.js                    #   RECALL keyword matching
│   └── l7-star-command.js               #   *command detection
├── session/session-manager.js           #   Session state (JSON v2.0)
├── domain/domain-loader.js              #   Manifest + domain parser
├── context/context-tracker.js           #   Bracket calculation
├── memory/memory-bridge.js              #   Pro-gated MIS consumer
├── output/formatter.js                  #   <synapse-rules> XML
└── utils/paths.js                       #   Cross-platform paths
        │
        ▼ reads/writes
.synapse/                                # Layer 3: Runtime Data
├── manifest                             #   Central domain registry (KEY=VALUE)
├── constitution                         #   L0: 6 articles
├── global                               #   L1: Universal rules
├── context                              #   L1: Bracket-specific rules
├── commands                             #   L7: Star-command definitions
├── agent-*                              #   L2: Per-agent domains (11 agents)
├── workflow-*                           #   L3: Per-workflow domains
├── sessions/                            #   Session state (gitignored)
└── cache/                               #   Optional cache (gitignored)
        │
        ▼ user-invoked
.claude/commands/synapse/                # Layer 4a: CRUD Commands
├── manager.md                           #   Router/dispatcher
├── tasks/ (6 tasks)                     #   create-domain, add-rule, edit-rule,
│                                        #   toggle-domain, create-command, suggest-domain
├── templates/                           #   Domain + manifest templates
└── utils/                               #   Parser reference

.claude/skills/synapse/                  # Layer 4b: Help/Documentation
├── SKILL.md                             #   Overview + router
├── references/ (5 guides)               #   Domain, commands, manifest, brackets, layers
└── assets/                              #   Templates for user
```

### Open Core Boundary

| Component | Location | License |
|-----------|----------|---------|
| SynapseEngine (8 layers) | `.aios-core/core/synapse/` | Open-source (aios-core) |
| Hook entry point | `.claude/hooks/synapse-engine.js` | Open-source (aios-core) |
| Runtime data | `.synapse/` | Open-source (aios-core) |
| CRUD commands + skills | `.claude/commands/synapse/`, `.claude/skills/synapse/` | Open-source (aios-core) |
| **Memory bridge activation** | `.aios-core/core/synapse/memory/memory-bridge.js` | Open-source (graceful no-op without pro) |
| **Memory provider** | `pro/memory/synapse-memory-provider.js` | **Pro only** (feature-gated) |

**Feature Gate:** `pro.memory.synapse` — controls memory integration. Without pro, SYNAPSE operates fully on static domain rules only.

### Hook/Skill/Command Separation

```
Automatic per-event     → HOOK   (synapse-engine.js, UserPromptSubmit)
User guidance/learning  → SKILL  (synapse/SKILL.md + references)
User-invoked CRUD       → COMMAND (synapse/manager.md + 6 tasks)
Read-state star-cmds    → HOOK L7 (*synapse status, *synapse debug, *brief, *dev)
Write-file star-cmds    → COMMAND (*synapse create, *synapse add, *synapse toggle)
```

---

## Performance Targets

### Per-Prompt (Hook)

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Total pipeline | <70ms | <100ms |
| Layer individual | <15ms | <20ms (L0/L7: <5ms) |
| Startup (.synapse/ discovery) | <5ms | <10ms |
| Session I/O | <10ms | <15ms |

### Token Budget per Bracket

| Bracket | Context % | Max Tokens | Layers Active |
|---------|----------|------------|---------------|
| FRESH | 60-100% | ~800 | L0, L1, L2 active, L7 (if explicit) |
| MODERATE | 40-60% | ~1500 | All active layers |
| DEPLETED | 25-40% | ~2000 | All + memory hints (pro) |
| CRITICAL | <25% | ~2500 | All + handoff warning |

### Output Format

```xml
<synapse-rules>
[CONTEXT BRACKET] ...
[CONSTITUTION] (NON-NEGOTIABLE) ...
[ACTIVE AGENT: @{id}] ...
[ACTIVE WORKFLOW: {id}] ...
[TASK CONTEXT] ...
[SQUAD: {name}] ...
[STAR-COMMANDS] ...
[DEVMODE STATUS] ...
[LOADED DOMAINS SUMMARY] ...
</synapse-rules>
```

---

## CARL Migration Strategy

### Feature Parity Checklist

| CARL Feature | SYNAPSE Equivalent | Story |
|-------------|-------------------|-------|
| stdin/stdout JSON protocol | Identical | SYN-7 |
| Manifest parsing (KEY=VALUE) | Identical | SYN-1 |
| Session management | Enhanced (schema v2.0) | SYN-2 |
| Context brackets (4 levels) | Identical | SYN-3 |
| Star-command detection | Identical + *synapse | SYN-5 |
| Keyword matching (RECALL) | Identical | SYN-5 |
| Exclusion system (EXCLUDE) | Identical | SYN-1 |
| `<carl-rules>` XML output | `<synapse-rules>` XML | SYN-6 |
| DEVMODE toggle | Identical + metrics | SYN-6 |
| Auto-title generation | Identical | SYN-2 |
| Stale session cleanup | Identical (>24h) | SYN-2 |

### New Capabilities (not in CARL)

| Feature | Layer | Story |
|---------|-------|-------|
| L0: Constitution enforcement | L0 | SYN-4 |
| L2: Agent-scoped domains + authority | L2 | SYN-4 |
| L3: Workflow domain activation | L3 | SYN-4 |
| L4: Task context injection | L4 | SYN-5 |
| L5: Squad domain discovery | L5 | SYN-5 |
| Memory integration (pro-gated) | Bridge | SYN-10 |
| Pipeline metrics (DEVMODE) | Engine | SYN-6 |
| CRUD commands for domain management | Commands | SYN-9 |

### Transition Plan

1. **Waves 0-1:** SYNAPSE developed independently. CARL remains active.
2. **SYN-7 (Wave 2):** Register SYNAPSE hook, disable CARL hook in settings.
3. **Post-Wave 2:** CARL fully disabled. `.carl/` directory remains for reference.
4. **Future:** Migration script to convert `.carl/` domains to `.synapse/` format (if needed).

---

## Ownership Matrix

| Directory/File | Owner | SYNAPSE Access |
|---------------|-------|---------------|
| `.synapse/` | **SYNAPSE** | Read/Write |
| `.aios-core/core/synapse/` | **SYNAPSE** | Read/Write |
| `.claude/hooks/synapse-engine.js` | **SYNAPSE** | Read/Write |
| `.claude/commands/synapse/` | **SYNAPSE** | Read/Write |
| `.claude/skills/synapse/` | **SYNAPSE** | Read/Write |
| `unified-activation-pipeline.js` | ACT | Read only (**Exception: SYN-13** — Write access approved for `_writeSynapseSession()` addition. See story Ownership Exception section.) |
| `pro/memory/memory-loader.js` | MIS | Read only (via API) |
| `.aios/session-digests/` | MIS | Read only |
| `.aios/memories/` | MIS | Read only (via API) |
| `pro/memory/synapse-memory-provider.js` | **SYNAPSE** (pro) | Read/Write |
| `feature-registry.yaml` | PRO | Append (1 entry) |

---

## Inviolable Principles

1. **SYNAPSE does not rewrite code from other epics** — consumer, not producer
2. **Each system owns its store** — `.synapse/`, `.aios/`, `pro/` are exclusive domains
3. **Per-prompt hook is complementary to pipeline** — not a substitute
4. **Memory layers invoke MIS API** — never reimplement retrieval/scoring
5. **Agent definitions are not modified** — domain mapping lives in `.synapse/manifest`
6. **Constitution L0 does not override IDS-6** — different articles, complementary
7. **Never blocks the prompt** — timeout/error = skip layer, warn-and-proceed
8. **Zero external dependencies** — Node.js stdlib only (as CARL uses Python stdlib)
9. **Feature parity with CARL** — every CARL capability must exist in SYNAPSE before migration
10. **Bracket-aware token budgets** — never inject more tokens than the bracket allows

---

## Success Criteria

1. **Full CARL parity** — All 11 CARL features replicated with identical behavior
2. **8-layer injection** — All layers execute correctly per-prompt within <100ms
3. **Bracket adaptation** — Token budget adjusts dynamically based on context usage
4. **Session continuity** — Agent/workflow/task/squad state persists across prompts
5. **Pro memory integration** — MIS memories injected when pro available, graceful no-op otherwise
6. **CRUD operations** — Users can create, edit, toggle domains and commands
7. **Zero regressions** — Existing UAP, MIS, IDS systems unaffected
8. **Test coverage** — >85% coverage for engine modules, E2E tests for all layers

---

## Definition of Done (Epic Level)

- [x] All 12 core stories completed and pushed to main
- [ ] SYN-13 (Wave 4 — Post-Launch Hardening) completed and pushed to main
- [x] CARL hook disabled, SYNAPSE hook active
- [x] All CARL features verified working in SYNAPSE
- [x] E2E test suite passing with >85% coverage (96.7%)
- [x] Performance targets met (<70ms per-prompt)
- [x] Pro memory bridge working with feature gate
- [x] Skills and commands documentation complete
- [x] No regressions in existing test suites (UAP, MIS, IDS)
- [x] @aios-master constitutional review PASS
- [x] `.synapse/` populated with all domain content
- [ ] UAP→SYNAPSE session bridge operational (SYN-13)
- [ ] `*synapse-diagnose` command functional (SYN-13)

---

## Executor Assignments

| Story | Default Executor | Rationale |
|-------|-----------------|-----------|
| SYN-1 through SYN-6 | @dev (Dex) | Core engine implementation |
| SYN-7 | @dev (Dex) + @devops (Gage) | Hook registration needs settings management |
| SYN-8 | @dev (Dex) + @architect (Aria) | Domain content requires architectural knowledge |
| SYN-9 | @dev (Dex) | CRUD command implementation |
| SYN-10 | @dev (Dex) | Pro bridge implementation (follows MIS-6 pattern) |
| SYN-11 | @dev (Dex) + @architect (Aria) | Documentation requires system-level understanding |
| SYN-12 | @dev (Dex) + @qa (Quinn) | Performance + E2E requires QA collaboration |
| SYN-13 | @dev (Dex) | Bridge + diagnostics implementation (Ownership Exception for UAP) |

---

## Quality Gates per Story

Every story follows the SDC workflow:

```
@sm draft -> @po validate (10-point checklist) -> @dev implement -> @qa gate -> @devops push
```

| Gate | Criteria |
|------|----------|
| @po Validation | 10-point checklist (>=7/10 for GO) |
| @dev Self-Review | CodeRabbit self-healing (max 2 iterations) |
| @qa Gate | 7 quality checks (code, tests, AC, regression, perf, security, docs) |
| @devops Push | Pre-push: `npm run lint && npm run typecheck && npm test` |

---

## Epic Changelog

| Date | Story | Event | Details |
|------|-------|-------|---------|
| 2026-02-10 | — | Architecture | @architect (Aria) produced SYNAPSE-ARCHITECTURE-RECOMMENDATION.md |
| 2026-02-10 | — | Architecture | @architect (Aria) produced SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md |
| 2026-02-10 | — | Epic Created | @pm (Morgan) created EPIC-SYN-INDEX.md with 12 stories across 4 waves |
| 2026-02-10 | — | Constitutional Review | @aios-master (Orion) review PASS Condicional (96/100). 3 issues obrigatorias + 5 observacoes |
| 2026-02-10 | — | Corrections Applied | @pm (Morgan) applied 3 mandatory fixes: SYN-9 scope (removed Skills overlap), SYN-4 dep on SYN-2, SYN-9 dep changed to SYN-1+SYN-8, feature gate aligned to `pro.memory.synapse` |
| 2026-02-10 | — | PO Validation | @po (Pax) GO verdict (118/120, 98.3%). 4 non-blocking improvements noted for @sm draft phase. Epic ready for story drafting |
| 2026-02-10 | SYN-1,2,3 | Stories Drafted | @sm (River) drafted 3 Wave 0 stories: SYN-1 (Domain Loader, 8 ACs), SYN-2 (Session Manager, 8 ACs), SYN-3 (Context Bracket, 7 ACs). Incorporated Review Notes #1-#4 |
| 2026-02-10 | SYN-1,2,3 | Stories Validated | @po (Pax) GO on all 3: SYN-1 (94/100), SYN-2 (95/100), SYN-3 (96/100). Status Draft → Ready. 2 non-blocking should-fix noted (Risks section, DoD formal) |
| 2026-02-10 | SYN-1 | Story Done | PR #113 merged (ad7e1432). QA Gate PASS (95/100). 48 tests, 100% stmts coverage. Epic status: 1/12 done |
| 2026-02-10 | SYN-2 | Story Done | PR #114 merged (67e2274c). QA Gate PASS (92/100). 37 tests, 93.38% stmts coverage. CodeRabbit: 3 MEDIUM fixes applied. Epic status: 2/12 done |
| 2026-02-11 | SYN-3 | Story Done | PR #115 merged (e097b449). QA Gate PASS (98/100). 66 tests, 100% coverage all metrics. Zero external deps. **Wave 0 Complete (3/3).** Epic status: 3/12 done |
| 2026-02-11 | SYN-5 | Story Validated | @po (Pax) GO Condicional (92/100). CRITICAL-1 fixed: added SYN-4 to dependencies (was missing despite LayerProcessor import). Also fixed: L5 perf target aligned with DESIGN doc, DoD section added, previousLayers contract documented, squad extends key format specified. Corrected Wave 1 execution order: SYN-4 → SYN-5 → SYN-6 (not parallel). Status Draft → Ready |
| 2026-02-11 | SYN-4 | Story Done | PR #116 merged (1229b087). QA Gate PASS. 78 tests, L0-L3 + LayerProcessor base class. Epic status: 4/12 done |
| 2026-02-11 | SYN-5 | Story Done | PR #120 merged (3528209d). QA Gate PASS (97/100). 64 tests, 100% lines, 90% branch. 2 QA review cycles. Epic status: 5/12 done. **Wave 1: 2/3 complete** |
| 2026-02-11 | SYN-6 | Story Done | PR #118 merged (f34b8d58). QA Gate PASS (93/100). 78 tests, engine.js 98.75% coverage, formatter.js 91.91% coverage. 2 QA review cycles. CodeRabbit fixes applied. Epic status: 6/12 done. **Wave 1 Complete (3/3).** |
| 2026-02-11 | SYN-9 | Story Done | PR #126 merged (ddded999). QA Gate PASS (95/100). 10 markdown instruction files (manager + 6 tasks + 2 templates + reference). CodeRabbit APPROVED after 4 minor fixes. Epic status: 7/12 done. **Wave 2: 1/3 complete.** |
| 2026-02-11 | SYN-7 | Story Done | PR #127 merged (f73bde54). QA Gate PASS (98/100). 36 tests, hook entry 75 lines, CodeRabbit APPROVED after re-review (stdin error handler, cwd guard, try/finally cleanup). Epic status: 8/12 done. **Wave 2: 2/3 complete.** |
| 2026-02-11 | SYN-8 | Story Done | PR #128 merged (fb7ce2c1). QA Gate PASS (94/100). 29 constitution tests + 5 domain-loader tests. 24 files created (19 domain files, 1 script, 2 .gitkeep, 1 test, 1 domain-loader fix). Epic status: 9/12 done. **Wave 2 Complete (3/3).** |
| 2026-02-12 | SYN-10 | Story Done | PR #134 merged (2862b14d). QA Gate PASS (94/100). 47 new tests, 9 source files (4 created, 5 modified). Feature-gated MIS consumer with bracket-aware retrieval. engine.process() converted to async. Epic status: 10/12 done. **Wave 3: 1/3 complete.** |
| 2026-02-12 | SYN-11 | Story Done | PR #135 merged (4c73e132). QA Gate PASS (100/100). 7 documentation files (SKILL.md + 5 references + assets/README). 10 source files cross-referenced, zero discrepancies. Article IV compliant. Epic status: 11/12 done. **Wave 3: 2/3 complete.** |
| 2026-02-12 | SYN-12 | Story Done | PR #136 merged (b0f38ab4). QA Gate PASS (100/100). 53 E2E tests, 96.7% synapse coverage. Performance targets all met (pipeline p95 < 70ms). CI benchmark job added. Epic status: **12/12 done. Wave 3 Complete. EPIC COMPLETE.** |
| 2026-02-12 | — | Epic Complete (Core) | @po (Pax) closed remaining stories (SYN-7, SYN-8, SYN-12). All 12 core stories Done, all 10 DoD checkboxes met. SYNAPSE Context Engine fully operational. |
| 2026-02-13 | SYN-13 | Story Validated | @po (Pax) GO Condicional → fixes applied → GO. Ownership Exception approved for UAP modification. Status Draft → Ready. Wave 4 active. |

---

## Review Notes (@aios-master, for story drafting)

The following observations from the Constitutional Review should be addressed during story drafting:

1. **SYN-6 ACs:** Clarify whether `activateAgent()` (DESIGN doc section 1.2) is MVP or future scope. Also include Executor Type Awareness (ADR-001 E7) as an AC or explicit out-of-scope note.
2. **SYN-8 ACs:** `.synapse/constitution` must be **auto-generated** from `.aios-core/constitution.md` (per DESIGN doc line 223), not manually copied.
3. **SYN-2 or SYN-7 ACs:** Include `.gitignore` entries for `.synapse/sessions/` and `.synapse/cache/`.
4. **ADR-001 Correction:** @architect should align feature gate key from `pro.memory.extended` to `pro.memory.synapse` in ADR-001 (B1).

---

## Next Steps

1. ~~**@aios-master** — Constitutional review (Articles I-IV compliance)~~ DONE (PASS, 96/100)
2. ~~**@po** — Validate epic structure and story granularity~~ DONE (GO, 118/120)
3. ~~**@sm** — Draft stories for Wave 0 (SYN-1, SYN-2, SYN-3)~~ DONE
4. ~~**@po** — Validate Wave 0 stories (10-point checklist)~~ DONE (GO: SYN-1 94/100, SYN-2 95/100, SYN-3 96/100)
5. ~~**SDC** — SYN-1 Domain Loader~~ DONE (PR #113, QA PASS 95/100)
6. ~~**SDC** — SYN-2 Session Manager~~ DONE (PR #114, QA PASS 92/100)
7. ~~**SDC** — SYN-3 Context Bracket Tracker~~ DONE (PR #115, QA PASS 98/100) — **Wave 0 Complete**
8. ~~**@sm** — Draft stories for Wave 1 (SYN-4, SYN-5, SYN-6)~~ DONE
9. ~~**@po** — Validate Wave 1 stories~~ DONE
10. ~~**SDC** — SYN-4 Layer Processors L0-L3~~ DONE (PR #116, QA PASS)
11. ~~**SDC** — SYN-5 Layer Processors L4-L7~~ DONE (PR #120, QA PASS 97/100)
12. ~~**SDC** — SYN-6 SynapseEngine Orchestrator~~ DONE (PR #118, QA PASS 93/100) — **Wave 1 Complete**
13. ~~**@sm** — Draft stories for Wave 2 (SYN-7, SYN-8, SYN-9)~~ DONE
14. ~~**@po** — Validate Wave 2 stories~~ DONE (SYN-9: 94/100)
15. ~~**SDC** — SYN-9 CRUD Commands~~ DONE (PR #126, QA PASS 95/100)
16. ~~**SDC** — SYN-7 Hook Entry Point~~ DONE (PR #127, QA PASS 98/100) — **Wave 2: 2/3**
17. ~~**SDC** — SYN-8 Domain Content Files~~ DONE (PR #128, QA PASS 94/100) — **Wave 2 Complete**
18. ~~**@sm** — Draft stories for Wave 3 (SYN-10, SYN-11, SYN-12)~~ DONE
19. ~~**@po** — Validate Wave 3 stories~~ DONE
20. ~~**SDC** — SYN-10 Pro Memory Bridge~~ DONE (PR #134, QA PASS 94/100)
21. ~~**SDC** — SYN-11 Skills + Help Documentation~~ DONE (PR #135, QA PASS 100/100)
22. ~~**SDC** — SYN-12 Performance + E2E Testing~~ DONE (PR #136, QA PASS 100/100) — **Wave 3 Complete. EPIC COMPLETE.**

23. **@po** — Validate SYN-13 story — DONE (GO, fixes applied, Status Ready)
24. **SDC** — SYN-13 UAP Session Bridge + SYNAPSE Diagnostics — **NEXT**

---

*Epic SYN - SYNAPSE Context Engine*
*Created by @pm (Morgan) — 2026-02-10*
*Consumer Architecture | 8 Layers | Feature-Gated Memory | CLI First*
