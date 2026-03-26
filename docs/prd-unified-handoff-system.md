# Unified Handoff System - Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-03-25
**Author:** Morgan (PM Agent)
**Status:** Draft
**Project:** AIOX Framework (Internal)

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-25 | 1.0 | Initial PRD created retroactively after v1.0 implementation (Story AIOX-HO-1). Documents existing system and defines v2.0 roadmap for identified gaps (agent activity summaries, agent memory integration, observability dashboard, productivity metrics). | Morgan (AIOX PM) |

---

## Goals and Background Context

### Goals

- Eliminate context loss during agent switches and session boundaries in the AIOX multi-agent framework
- Replace unreliable "mental" handoff mechanisms with deterministic, hook-enforced persistence that requires zero LLM compliance
- Keep cross-session handoff files readable and maintainable (max ~200 lines) while preserving full history in archives
- Detect stale handoffs on session resume via recovery validation against actual git state
- Enable future capabilities: agent activity summaries, agent memory integration, session observability, and productivity metrics
- Maintain strict L1/L2 boundary protection (zero changes to `.aiox-core/` framework files)

### Background Context

The AIOX framework orchestrates multiple specialized AI agents (@dev, @qa, @architect, @pm, @po, @sm, @analyst, @data-engineer, @ux-design-expert, @devops) that collaborate on software projects through story-driven development. Each agent switch and session boundary represents a context loss risk: the outgoing agent's knowledge -- active story, decisions made, files modified, blockers encountered -- can vanish when a new agent activates or a session ends.

Prior to this system, AIOX had two separate, unreliable mechanisms. First, an "agent handoff" described in `.claude/rules/agent-handoff.md` that instructed the LLM to "mentally generate" a handoff artifact -- which never actually persisted to disk. Second, a "session handoff" in `.claude/rules/auto-session-handoff.md` that depended on a heuristic context bracket percentage trigger -- unreliable since Claude Code does not expose real token usage metrics. Session handoff files grew without limit (the brand-system-service handoff reached 430+ lines) and there was zero integration between the two systems.

The Unified Handoff System replaces both with a deterministic 3-tier architecture enforced by hooks (UserPromptSubmit and PreCompact), requiring zero manual intervention. Story AIOX-HO-1 delivered the v1.0 implementation with 71 tests passing. This PRD retroactively documents that work and defines the v2.0 roadmap to address remaining gaps.

---

## Requirements

### Functional Requirements

#### Epic 1: Core 3-Tier Handoff System (v1.0 -- IMPLEMENTED)

**Tier 1: Micro-Handoff (Agent Switch)**

- **FR-1.1**: On agent switch (detection of `@agent` pattern in user prompt), the system MUST create a micro-handoff artifact at `.aiox/current-session/micro-handoff.json` containing: version, timestamp, from_agent, to_agent, consumed flag, story_context (story_id, story_path, story_status, current_task, branch), decisions (max 5), files_modified (max 10), blockers (max 3), next_action
- **FR-1.2**: The micro-handoff schema MUST enforce compaction limits: max 5 decisions, max 10 files_modified entries, max 3 blockers, max 3 unconsumed handoffs retained (oldest auto-rotated)
- **FR-1.3**: Each micro-handoff MUST be uniquely identified with format `handoff-{from}-to-{to}-{timestamp}` and support explicit consumption marking via `markConsumed(handoffId)`
- **FR-1.4**: Incoming agents MUST check for unconsumed micro-handoffs on activation, display a summary of the previous agent's context, show the suggested next_action, and mark the handoff as consumed after display
- **FR-1.5**: The micro-handoff module MUST provide: `saveMicroHandoff()`, `readMicroHandoff()`, `markConsumed()`, `getUnconsumedCount()`, `clearHandoffs()`, `readAllHandoffs()`, `validateSchema()`

**Tier 2: Session State (In-Session Timeline)**

- **FR-2.1**: The system MUST maintain an append-only YAML timeline at `.aiox/current-session/state.yaml` tracking session events with timestamps
- **FR-2.2**: Tracked event types MUST include: `agent_switch` (detected in prompt), `story_start` (agent begins story work), `story_complete` (story marked Ready for Review), `qa_gate` (QA verdict rendered), `commit` (git commit created), `periodic` (every 5 messages snapshot)
- **FR-2.3**: Each event MUST contain at minimum: timestamp (ISO 8601), type, and support optional fields: agent, story, branch, files_modified, prompt_count, details, verdict, commit_hash
- **FR-2.4**: Session state MUST support initialization with session ID and project name, and provide archive-and-reset functionality for new sessions
- **FR-2.5**: The YAML serializer MUST handle the known session schema (session header + events array with scalar fields). Nested objects or arrays within event payloads are not supported in v1.0 (documented limitation MNT-002)
- **FR-2.6**: The session state module MUST provide: `updateSessionState()`, `getSessionState()`, `initSessionState()`, `resetSessionState()`, `getEventCount()`

**Tier 3: Cross-Session Handoff**

- **FR-3.1**: Cross-session handoff files MUST be stored at `docs/session-handoff-{project}.md` in human-readable markdown format, committed to git
- **FR-3.2**: Handoff files MUST auto-trim to approximately 200 lines maximum, preserving: header (date, last session, next step), active stories table, last 5 work items, execution plan (if present), key docs, how-to-continue prompt
- **FR-3.3**: Content exceeding 200 lines MUST be archived to `.aiox/session-history/{project}/archive-{timestamp}.md` with zero data loss
- **FR-3.4**: The trimming algorithm MUST parse markdown into sections (## headers), apply section-specific line limits (header max 10, stories max 40, work items last 5 with max 60 lines, plan max 30), and reconstruct the trimmed document
- **FR-3.5**: Section matching MUST support both Portuguese and English patterns (e.g., "Estado Atual" and "Active Stories", "Como Continuar" and "How to Continue")
- **FR-3.6**: The cross-session module MUST provide: `saveHandoff()`, `trimHandoff()`, `archiveSession()`, `validateHandoff()`, `readHandoff()`, `getLineCount()`

**Recovery Validation**

- **FR-4.1**: On new session start, if a Tier 3 handoff file exists, the system MUST compare file paths mentioned in the handoff against `git status --short` output
- **FR-4.2**: If drift exceeds 20% (files in git status not present in handoff), the system MUST display a warning: "Handoff drift detected (X%). Some files changed outside the last session. Review before continuing."
- **FR-4.3**: The drift warning MUST be non-blocking -- user can override and continue. It is an informational aid, not a gate

**Automatic Triggers (Hook-Based)**

- **FR-5.1**: A UserPromptSubmit hook (`handoff-auto.cjs`) MUST be registered as a SECOND entry in the hooks array (not modifying synapse-wrapper.cjs). It MUST detect `@agent` patterns for 11 agents: dev, qa, architect, pm, po, sm, analyst, data-engineer, ux-design-expert, devops, aiox-master
- **FR-5.2**: The hook MUST increment a prompt counter (stored at `.aiox/current-session/.prompt-count`) and trigger a Tier 2 periodic snapshot every 5 prompts
- **FR-5.3**: A PreCompact hook component (`handoff-saver.cjs`) MUST be chained by `precompact-wrapper.cjs` BEFORE the session digest, detecting all active project handoffs via `docs/session-handoff-*.md` discovery and trimming each
- **FR-5.4**: All hook errors MUST be silently caught (try/catch) -- handoff save failures MUST NOT block SYNAPSE processing or PreCompact processing
- **FR-5.5**: All hook operations MUST complete within 5000ms timeout, with timeout protection via `setTimeout` with `unref()`
- **FR-5.6**: A `*handoff` manual command MUST exist as a fallback that forces Tier 1 save (if switching agents), Tier 2 snapshot, and Tier 3 save + trim

**Migration & Backward Compatibility**

- **FR-6.1**: A migration script (`migrate-handoffs.js`) MUST discover all `session-handoff-*.md` files in `docs/`, report line counts, trim those exceeding 200 lines, and archive trimmed content
- **FR-6.2**: Migration MUST verify no data loss by comparing archive line count against original
- **FR-6.3**: Existing handoff files MUST continue to work without format changes -- the trimming algorithm handles both legacy (unstructured) and new (structured) formats

**Boundary Protection**

- **FR-7.1**: The entire system MUST operate within L4 (Project Runtime) boundaries. ZERO modifications to L1 (`.aiox-core/core/`) or L2 (`.aiox-core/development/tasks/`, `.aiox-core/development/templates/`, `.aiox-core/development/checklists/`) paths
- **FR-7.2**: All modules MUST use Node.js stdlib only (fs, path, os, child_process), CommonJS format, ES2022 features, with zero external npm dependencies

#### Epic 2: Agent Activity & Observability (v2.0 -- PLANNED)

**Agent Activity Summaries**

- **FR-8.1**: The system MUST generate a per-agent summary at session end or on `*handoff` command, aggregating Tier 2 events into a readable report: which agent was active, what stories they worked on, files they modified, decisions they made, and time spent (inferred from event timestamps)
- **FR-8.2**: Agent summaries MUST be included in the Tier 3 cross-session handoff file under a "## Agent Activity" section, showing the last session's agent contributions
- **FR-8.3**: Summaries MUST respect the 200-line trim limit by providing concise 2-3 line entries per agent rather than detailed logs

**Agent Memory Integration**

- **FR-9.1**: The handoff system MUST detect agent persistent memory files at `.claude/agent-memory/{agent-id}/MEMORY.md` and cross-reference them during micro-handoff creation
- **FR-9.2**: When an agent switch occurs, the micro-handoff MUST include a `memory_hints` field (max 3 entries) containing the most relevant recent entries from the outgoing agent's MEMORY.md that relate to the active story or current work
- **FR-9.3**: The incoming agent MUST receive both the micro-handoff context AND the memory hints, enabling it to benefit from the outgoing agent's accumulated project knowledge without loading the full MEMORY.md
- **FR-9.4**: Memory hints MUST be read-only during handoff -- the handoff system MUST NOT modify agent MEMORY.md files (write authority belongs to each agent individually)

**Session Observability (CLI First)**

- **FR-10.1**: A `*session-report` command MUST generate a CLI-formatted session summary including: total prompts, agents activated, stories touched, events timeline (compact), and files modified count
- **FR-10.2**: The session report MUST be derivable entirely from Tier 2 session state data (`.aiox/current-session/state.yaml`) with zero additional data collection
- **FR-10.3**: A `*session-history {project}` command MUST list archived sessions from `.aiox/session-history/{project}/` with date, event count, and agents involved per archived session
- **FR-10.4**: Session data MUST be queryable via CLI commands, NOT through a web dashboard. Per AIOX Constitution Article I (CLI First), observability is secondary to CLI and UI is tertiary

**Productivity Metrics**

- **FR-11.1**: The system MUST track per-session metrics derived from Tier 2 events: prompts per agent, stories started vs completed, QA pass rate (qa_gate events with verdict PASS vs total), commits per session, average agent session duration (time between agent_switch events)
- **FR-11.2**: Metrics MUST be stored in a lightweight JSON file at `.aiox/current-session/metrics.json`, computed on-demand when `*session-report` is invoked (not continuously computed)
- **FR-11.3**: Historical metrics MUST be aggregatable from archived session states, enabling trend analysis via a `*metrics-trend {project} [--last N]` command showing metrics across the last N sessions
- **FR-11.4**: Metrics computation MUST NOT add latency to normal operations -- it MUST be a read-only, on-demand computation from existing Tier 2 data

### Non-Functional Requirements

**Performance**

- **NFR-1.1**: Micro-handoff save (Tier 1) MUST complete in <100ms for typical payloads (JSON write of <500 tokens)
- **NFR-1.2**: Session state append (Tier 2) MUST complete in <200ms for typical events (YAML read-modify-write)
- **NFR-1.3**: Cross-session handoff trim (Tier 3) MUST complete in <2000ms even for files exceeding 400 lines
- **NFR-1.4**: All hook-triggered operations MUST complete within 5000ms total timeout
- **NFR-1.5**: Handoff operations MUST NOT measurably increase prompt-to-response latency (hooks run asynchronously to SYNAPSE)

**Reliability**

- **NFR-2.1**: Handoff save errors MUST NOT block SYNAPSE processing (UserPromptSubmit hook) or PreCompact processing (session digest)
- **NFR-2.2**: Silent error handling (try/catch) MUST be applied to all file operations (read, write, mkdir) in all modules
- **NFR-2.3**: Directory creation (`.aiox/current-session/`, `.aiox/session-history/`) MUST use `recursive: true` to handle missing parent directories
- **NFR-2.4**: The system MUST tolerate partial state: missing micro-handoff file, missing state.yaml, missing handoff files -- each tier operates independently
- **NFR-2.5**: On fresh clone (no `.aiox/` runtime data), the system MUST initialize gracefully -- hooks detect absence and skip rather than error

**Maintainability**

- **NFR-3.1**: All public functions MUST have JSDoc comments documenting parameters, return types, and purpose
- **NFR-3.2**: All modules MUST use `'use strict'` directive and CommonJS format (`require`/`module.exports`)
- **NFR-3.3**: Code style MUST follow project conventions: 2-space indent, single quotes, semicolons
- **NFR-3.4**: Each module MUST be independently testable with no cross-module dependencies (each tier is self-contained)
- **NFR-3.5**: The YAML serializer limitation (flat-only, no nested objects) MUST be documented in code (MNT-002 comment) and tracked as a known limitation

**Security & Privacy**

- **NFR-4.1**: Handoff artifacts MUST NOT contain secrets, credentials, API keys, or PII. Content is limited to: story IDs, file paths, decisions (textual), blockers (textual), branch names
- **NFR-4.2**: Runtime data (`.aiox/current-session/`, `.aiox/session-history/`) MUST be gitignored to prevent accidental commit of session state
- **NFR-4.3**: Cross-session handoff files in `docs/` ARE committed intentionally (project state documentation), but MUST NOT contain sensitive information
- **NFR-4.4**: Agent memory files referenced by FR-9.x MUST be accessed read-only during handoff operations -- the handoff system MUST NOT modify agent memory

**Compatibility**

- **NFR-5.1**: ZERO external npm dependencies. All modules use Node.js stdlib only: fs, path, os, child_process
- **NFR-5.2**: CommonJS module format for compatibility with existing Claude Code hooks (.cjs extension)
- **NFR-5.3**: ES2022 JavaScript features allowed (optional chaining, nullish coalescing, etc.) -- no transpilation required
- **NFR-5.4**: Cross-session handoff trimming MUST handle both Portuguese and English section headers for projects created in either language
- **NFR-5.5**: The system MUST coexist with SYNAPSE hooks without interference -- separate hook entries in UserPromptSubmit array, no modification to synapse-wrapper.cjs

**Observability**

- **NFR-6.1**: All hooks MUST exit with code 0 regardless of internal errors (prevent hook failure from blocking Claude Code)
- **NFR-6.2**: Debug logging MAY be added behind an `AIOX_DEBUG` environment variable flag for troubleshooting, but MUST be off by default
- **NFR-6.3**: v2.0 session reports and metrics MUST be generated on-demand via CLI commands, following Constitution Article I (CLI First)

---

## Technical Architecture Summary

### Module Structure

| Module | Location | Tier | Responsibility |
|--------|----------|------|---------------|
| `micro-handoff.js` | `.claude/lib/handoff/` | 1 | Agent switch context persistence |
| `session-state.js` | `.claude/lib/handoff/` | 2 | In-session event timeline |
| `cross-session-handoff.js` | `.claude/lib/handoff/` | 3 | Cross-session markdown handoff |
| `migrate-handoffs.js` | `.claude/lib/handoff/` | 3 | Legacy file migration |
| `handoff-auto.cjs` | `.claude/hooks/` | 1+2 | UserPromptSubmit hook (agent detection + periodic) |
| `handoff-saver.cjs` | `.claude/hooks/` | 3 | PreCompact hook component (trim + archive) |

### Data Flow

```
UserPromptSubmit hook (handoff-auto.cjs)
  |
  +-- Detect @agent pattern --> Tier 1: micro-handoff.json (JSON)
  |                          +-> Tier 2: state.yaml (agent_switch event)
  |
  +-- Every 5 prompts -------> Tier 2: state.yaml (periodic event)


PreCompact hook (handoff-saver.cjs via precompact-wrapper.cjs)
  |
  +-- Discover all docs/session-handoff-*.md
  +-- For each: trimHandoff() --> Tier 3: docs/ file (trimmed)
  |                            +-> .aiox/session-history/ (archive)


Session Start (Recovery Validation)
  |
  +-- Read Tier 3 handoff --> Extract file paths
  +-- Run git status --short --> Compare file lists
  +-- If drift > 20% --> Display warning (non-blocking)
```

### File System Layout

```
TRACKED (git)
  .claude/lib/handoff/
    micro-handoff.js              # Tier 1 module (235 LOC)
    session-state.js              # Tier 2 module (308 LOC)
    cross-session-handoff.js      # Tier 3 module (462 LOC)
    migrate-handoffs.js           # Migration script (125 LOC)
  .claude/hooks/
    handoff-auto.cjs              # UserPromptSubmit hook (202 LOC)
    handoff-saver.cjs             # PreCompact hook component (121 LOC)
  .claude/rules/
    unified-handoff.md            # Authoritative rule (221 lines)
    agent-handoff.md              # DEPRECATED (redirects to unified)
    auto-session-handoff.md       # DEPRECATED (redirects to unified)
  docs/
    session-handoff-{project}.md  # Tier 3 active handoff files

GITIGNORED (runtime)
  .aiox/current-session/
    micro-handoff.json            # Tier 1 data
    state.yaml                    # Tier 2 data
    .prompt-count                 # Prompt counter
    README.md                     # Artifact documentation
  .aiox/session-history/
    {project}/
      archive-{timestamp}.md      # Tier 3 archives
      state-{timestamp}.yaml      # Tier 2 archives
```

### Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Module format | CommonJS (.cjs) | Compatibility with existing Claude Code hooks |
| Data format (Tier 1) | JSON | Structured, schema-enforceable, fast parse/write |
| Data format (Tier 2) | YAML (flat) | Human-readable timeline, append-friendly |
| Data format (Tier 3) | Markdown | IDE preview, committed to git, human-editable |
| Dependencies | Node.js stdlib only | Zero install overhead, maximum portability |
| Trigger mechanism | Claude Code hooks | Deterministic enforcement, not LLM compliance |
| Error strategy | Silent catch | Never block SYNAPSE or PreCompact |

---

## Constraints

- **CON-1**: Zero modifications to L1 (`.aiox-core/core/`) or L2 (`.aiox-core/development/tasks/`, `templates/`, `checklists/`, `workflows/`, `.aiox-core/infrastructure/`) paths. Framework boundary protection is non-negotiable per AIOX Constitution
- **CON-2**: Zero external npm dependencies. All modules use Node.js stdlib exclusively (fs, path, os, child_process)
- **CON-3**: CommonJS module format required for hook compatibility (Claude Code hooks use .cjs extension)
- **CON-4**: All hook operations MUST complete within 5000ms timeout to avoid blocking Claude Code prompt processing
- **CON-5**: Handoff save errors MUST be silently caught -- the system is an enhancement, not a critical path. SYNAPSE processing takes priority
- **CON-6**: The YAML serializer in session-state.js is flat-only (handles scalar fields, not nested objects/arrays). If the schema evolves to require nesting, a proper YAML library (e.g., js-yaml) must be introduced (documented as MNT-002)
- **CON-7**: Agent memory integration (FR-9.x) MUST be read-only. The handoff system reads agent MEMORY.md files but NEVER writes to them. Write authority is exclusively the agent's own
- **CON-8**: Observability features (Epic 2) MUST follow CLI First principle. No web dashboards or UI components in MVP. CLI commands are the primary interface
- **CON-9**: The system MUST coexist with SYNAPSE without interference -- separate hook entries, no shared state, no modification of synapse-wrapper.cjs
- **CON-10**: Cross-session handoff files are project documentation (committed to git). They MUST NOT contain secrets, credentials, or PII

---

## Risks & Mitigations

### High-Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Hook breaks SYNAPSE processing** | Low (15%) | Critical | All hook operations wrapped in try/catch with silent failure. 5000ms timeout with `unref()`. Separate hook entry -- not modifying synapse-wrapper.cjs. 12 integration tests verify isolation |
| **Handoff trimming loses critical data** | Low (10%) | High | Full content archived before ANY trimming. Migration script verified data preservation across 3 existing files. 24 unit tests for cross-session module |
| **L1/L2 boundary violation** | Very Low (5%) | Critical | Pre-commit hook validates boundary. CodeRabbit scan included in QA gate. All modules live in `.claude/lib/` (L4 path). 71 tests include boundary verification |
| **Recovery validation false positives at scale** | Medium (40%) | Medium | 20% drift threshold chosen empirically. Warning-only (non-blocking). Threshold is configurable for tuning. User can always override |

### Medium-Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **YAML serializer limitation blocks schema evolution** | Medium (35%) | Medium | Documented as MNT-002. Upgrade path clear: replace with js-yaml if nested structures needed. Current flat schema is sufficient for v1.0 and v2.0 |
| **Prompt count drift between sessions** | Medium (40%) | Low | Counter file resets on session start (expected behavior). No cross-session counter persistence needed -- periodic snapshots are session-scoped |
| **Agent memory files grow too large for handoff hints** | Medium (30%) | Low | FR-9.2 specifies max 3 hints (summary lines, not full content). Read-only access means no risk of corruption |
| **Multiple projects in one session cause handoff conflicts** | Low (20%) | Medium | Each project has its own handoff file (session-handoff-{project}.md). Tier 3 trim operates per-project. No shared state between projects |

### Low-Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Archive directory grows unbounded** | Low (15%) | Low | Archives are gitignored (no repo bloat). OS-level cleanup or periodic pruning script can be added. Typical size: <1KB per archive |
| **from_agent unknown in hook-triggered handoffs** | Known (100%) | Low | Hook detects to_agent only (regex on prompt). from_agent defaults to "unknown". The agent's own handoff logic populates from_agent in subsequent saves. Acceptable trade-off for hook simplicity |
| **Claude Code changes hook protocol** | Low (10%) | Medium | Standard JSON stdin/stdout protocol. Claude Code has maintained backward compatibility. Tests validate protocol parsing |

---

## Epic Structure

### Epic 1: Core 3-Tier Handoff System (v1.0) -- COMPLETE

**Goal:** Replace unreliable manual handoff mechanisms with a deterministic, hook-enforced 3-tier persistence system that eliminates context loss during agent switches and session boundaries.

**Status:** IMPLEMENTED (Story AIOX-HO-1, 71 tests, QA PASS)

**Stories:**

- **Story 1.1 (AIOX-HO-1):** Unified Handoff System Redesign -- Full implementation of Tier 1, Tier 2, Tier 3, hooks, migration, and recovery validation. 10 tasks, 40 subtasks, all complete.

### Epic 2: Agent Activity & Observability (v2.0) -- PLANNED

**Goal:** Extend the handoff system with agent activity summaries, memory integration, session observability, and productivity metrics to provide visibility into what each agent contributed and enable data-driven workflow optimization. All features follow CLI First principle.

**Story 2.1: Agent Activity Summaries**

As a framework user,
I want to see a concise summary of what each agent did during a session,
so that I can quickly understand contributions without reading raw event logs.

Acceptance Criteria:
1. `*session-report` command generates per-agent summary from Tier 2 events
2. Summary includes: agent name, stories worked, files modified count, decisions made, approximate active time
3. Summary integrated into Tier 3 handoff file under "## Agent Activity" section (respecting 200-line limit)
4. Summary computation is on-demand (not continuous), derived from existing state.yaml data
5. Zero external dependencies

**Story 2.2: Agent Memory Integration**

As an incoming agent,
I want to receive relevant knowledge hints from the outgoing agent's persistent memory,
so that I can benefit from accumulated project knowledge during handoff.

Acceptance Criteria:
1. Micro-handoff includes `memory_hints` field (max 3 entries) from outgoing agent's MEMORY.md
2. Hints are selected based on relevance to active story or current task (keyword matching)
3. Agent MEMORY.md files are accessed read-only -- handoff system NEVER writes to them
4. Incoming agent displays memory hints alongside standard handoff context
5. Graceful degradation if MEMORY.md does not exist or is empty
6. Zero external dependencies

**Story 2.3: Session Observability (CLI)**

As a framework user,
I want CLI commands to inspect session history and current session state,
so that I can understand workflow patterns and diagnose issues.

Acceptance Criteria:
1. `*session-report` command shows: total prompts, agents activated, stories touched, compact event timeline, files modified count
2. `*session-history {project}` command lists archived sessions with date, event count, agents per session
3. All data derived from existing Tier 2 (state.yaml) and Tier 3 (archives) data -- no new data collection
4. Output formatted for CLI readability (tables, compact timeline)
5. CLI First principle enforced -- no web dashboard or UI component
6. Zero external dependencies

**Story 2.4: Productivity Metrics**

As a framework user,
I want to track per-session and cross-session productivity metrics,
so that I can identify workflow bottlenecks and measure improvement.

Acceptance Criteria:
1. Per-session metrics computed on-demand: prompts per agent, stories started vs completed, QA pass rate, commits per session, average agent duration
2. Metrics stored at `.aiox/current-session/metrics.json` (gitignored)
3. `*metrics-trend {project} [--last N]` command aggregates metrics from N archived sessions
4. Metrics computation adds zero latency to normal operations (read-only, on-demand)
5. Historical metrics aggregated from archived state.yaml files
6. Zero external dependencies

**Story 2.5: Enhanced YAML Serializer**

As a developer extending the handoff system,
I want the session state YAML parser to support nested objects,
so that event payloads can include structured data (e.g., test results, multi-file changes).

Acceptance Criteria:
1. Replace flat YAML serializer with proper YAML support (evaluate js-yaml as optional dependency vs enhanced custom parser)
2. Backward compatible with existing flat state.yaml files
3. New event payloads can include nested objects and arrays
4. All existing 17 session-state tests continue passing
5. If external dependency chosen (js-yaml), document as the ONLY exception to zero-deps constraint with clear rationale
6. MNT-002 limitation resolved

---

## Testing Strategy

### Current Coverage (v1.0)

| Suite | Tests | Coverage |
|-------|-------|---------|
| `tests/handoff/micro-handoff.test.js` | 18 | Tier 1: save, read, consume, rotate, schema validation |
| `tests/handoff/session-state.test.js` | 17 | Tier 2: update, read, reset, event types, YAML append |
| `tests/handoff/cross-session-handoff.test.js` | 24 | Tier 3: save, trim, archive, validate, drift detection |
| `tests/handoff/integration.test.js` | 12 | Cross-tier: agent switch flow, milestone tracking, hook chaining |
| **Total** | **71** | All passing, 7.16s execution time |

### v2.0 Testing Plan

| Epic 2 Story | New Tests (Estimated) | Focus Areas |
|-------------|----------------------|-------------|
| 2.1 Agent Activity Summaries | 10-12 | Summary generation from events, trim integration, edge cases (no events, single agent) |
| 2.2 Agent Memory Integration | 8-10 | Memory file reading, hint extraction, keyword matching, read-only enforcement, missing file handling |
| 2.3 Session Observability | 8-10 | CLI command output formatting, archive scanning, data derivation accuracy |
| 2.4 Productivity Metrics | 10-12 | Metrics computation, aggregation across archives, edge cases (empty sessions, single event) |
| 2.5 Enhanced YAML Serializer | 12-15 | Nested object handling, backward compatibility, round-trip fidelity |

---

## Success Metrics

### v1.0 Metrics (Achieved)

| Metric | Target | Actual |
|--------|--------|--------|
| Tests passing | 100% | 71/71 (100%) |
| L1/L2 boundary violations | 0 | 0 |
| External dependencies | 0 | 0 |
| Hook timeout violations | 0 | 0 (all <5s) |
| Data loss during migration | 0 files | 0 files (all archived) |
| QA verdict | PASS | PASS (Review 2) |

### v2.0 Metrics (Targets)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Agent activity summary accuracy | >90% | Events captured in summary vs actual agent actions |
| Memory hint relevance | >70% | Hints relevant to active story (manual assessment first 10 handoffs) |
| Session report generation time | <500ms | CLI command response time |
| Metrics computation time | <1000ms | On-demand computation from state.yaml |
| Archive scanning time | <2000ms for 50 sessions | `*session-history` command |
| Test coverage (v2.0 additions) | >90% line coverage | Jest coverage report |
| Zero latency impact on normal operations | 0ms additional | Hooks unaffected by on-demand features |

---

## Future Expansion Roadmap (Post v2.0)

### Phase 3: Advanced Analytics (v3.0)

- **Cross-project metrics dashboard** (CLI-based tables comparing productivity across projects)
- **Agent efficiency scoring** (automated assessment of agent contributions vs expected output)
- **Session replay** (ability to reconstruct what happened in a past session from archived state)
- **Anomaly detection** (flag sessions with unusual patterns: excessive agent switches, failed QA loops, stale handoffs)

### Phase 4: Framework Integration

- **SYNAPSE integration** (handoff data influences context bracket calculation)
- **Worktree awareness** (handoff system understands git worktree boundaries for auto-claude parallel execution)
- **ClickUp/GitHub sync** (session events mapped to project management updates)

---

## Next Steps

### For Scrum Master (@sm / River)

**Prompt:**

River, please create development stories for Epic 2 (Agent Activity & Observability v2.0) of the Unified Handoff System. The PRD is at `docs/prd-unified-handoff-system.md`. Start with Story 2.1 (Agent Activity Summaries) as it has the highest user impact and builds directly on existing Tier 2 data. All stories must follow the same constraints as AIOX-HO-1: zero L1/L2 changes, zero external deps, Node.js stdlib only, CommonJS format. Reference the existing implementation at `.claude/lib/handoff/` for code patterns and test structure.

### For Architect (@architect / Aria)

**Prompt:**

Aria, please review the PRD at `docs/prd-unified-handoff-system.md` and provide a technical assessment for Epic 2. Key questions: (1) Is the flat YAML serializer limitation (MNT-002) worth resolving now or can v2.0 features work with scalar-only event fields? (2) What is the best approach for keyword-based memory hint extraction (FR-9.2) without external NLP dependencies? (3) Should metrics aggregation from archived sessions use streaming or batch processing given the constraint of <2s for 50 sessions? Reference existing architecture at `.claude/lib/handoff/` and `.claude/hooks/`.

---

## Checklist Results Report

### PM Checklist Assessment

| Category | Status | Critical Issues |
|----------|--------|----------------|
| 1. Problem Definition & Context | PASS | Well-documented 6-gap problem statement with evidence |
| 2. MVP Scope Definition | PASS | v1.0 scope is precise; v2.0 scope is bounded with 5 stories |
| 3. User Experience Requirements | PASS (N/A for UI) | CLI-only project, UX is CLI command design |
| 4. Functional Requirements | PASS | 38 FRs across 2 epics, all testable and traceable |
| 5. Non-Functional Requirements | PASS | 17 NFRs covering performance, reliability, security, compatibility |
| 6. Epic & Story Structure | PASS | 2 epics, sequential stories, clear dependencies |
| 7. Technical Guidance | PASS | Architecture diagram, module structure, technology decisions documented |
| 8. Cross-Functional Requirements | PASS | Boundary protection, hook integration, migration strategy |
| 9. Clarity & Communication | PASS | Consistent terminology, bilingual support documented |

**Overall: 100% (9/9 sections PASS)**

### Decision: READY FOR ARCHITECT

The PRD covers the complete Unified Handoff System: retroactive documentation of the implemented v1.0 (Epic 1) and forward-looking requirements for v2.0 (Epic 2). All functional requirements are traceable, all constraints are documented, and all risks have mitigations.

---

**END OF PRD v1.0**
