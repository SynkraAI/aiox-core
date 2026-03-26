# Story AIOX-HO-2.1: Agent Activity Summaries

## Status

**Ready for Review**

## Executor Assignment

**executor**: @dev
**quality_gate**: @architect
**quality_gate_tools**: [code-review, architecture-review]

## Story

**As a** AIOX framework user,
**I want** a concise summary of what each agent did during a session,
**so that** I can quickly understand contributions without reading raw event logs.

## Acceptance Criteria

1. `*session-report` command generates per-agent summary from Tier 2 events (FR-8.1)
2. Summary includes: agent name, stories worked, files modified count, decisions made, approximate active span (FR-8.1)
3. Summary integrated into Tier 3 handoff file under "## Agent Activity" section, respecting 200-line limit (FR-8.2)
4. Summary computation is on-demand (not continuous), derived from existing state.yaml data (FR-8.1)
5. Time metrics labeled as "approximate active span" not "time spent" (Architect Recommendation #6)
6. `trimHandoff()` function updated to recognize "## Agent Activity" as a preserved section with max 30 lines (Architect Recommendation #5, Gap 4.2)
7. Zero external dependencies (Node.js stdlib only) (FR-8.3)
8. Module location at `.claude/lib/handoff/` is canonical (Architect Recommendation #1)

## Problem Statement

Users cannot easily understand what each agent contributed during a session without manually parsing raw event logs in `.aiox/current-session/state.yaml`. The Tier 2 session state contains all the data needed (agent_switch events, story_start/complete events, commit events) but no aggregation layer exists to present it in a readable format.

Additionally, the Tier 3 cross-session handoff file lacks agent activity visibility, making it hard to understand who did what in the previous session when returning to a project.

## Solution

Implement an agent activity aggregation module that:
1. Reads Tier 2 session state events
2. Groups by agent
3. Computes summary metrics per agent
4. Outputs a formatted CLI table for `*session-report` command
5. Injects a compact "## Agent Activity" section into Tier 3 handoff files

Time metrics are labeled as "approximate active span" (inferred from timestamp deltas between agent_switch events) rather than "time spent" to reflect inherent imprecision.

## Tasks / Subtasks

### Task 1: Create Agent Activity Module (AC: 1, 2, 4, 7, 8)
- [x] 1.1: Read `.claude/lib/handoff/session-state.js` to understand event schema
- [x] 1.2: Create `.claude/lib/handoff/agent-activity.js` module at canonical location
  - `generateAgentSummary(sessionState)` → returns array of agent summaries
  - `formatSummaryForCLI(summaries)` → returns formatted table string
  - `formatSummaryForHandoff(summaries)` → returns markdown section string (max 30 lines)
- [x] 1.3: Implement aggregation logic:
  - Group events by `agent` field
  - Count `story_start` events per agent (stories worked)
  - Sum `files_modified` fields per agent
  - Extract `decisions` from agent_switch events (if present in details)
  - Compute approximate active span: time between first and last event for each agent
- [x] 1.4: Label time metrics as "approximate active span" (not "time spent")
- [x] 1.5: Use Node.js stdlib only (fs, path, no external deps)
- [x] 1.6: Create `tests/handoff/agent-activity.test.js` (10-12 tests estimated)

### Task 2: Implement `*session-report` Command (AC: 1, 2)
- [x] 2.1: Create command handler in `.claude/lib/handoff/commands/session-report.js`
- [x] 2.2: Read current session state using `session-state.js` module
- [x] 2.3: Call `generateAgentSummary()` to compute summaries
- [x] 2.4: Call `formatSummaryForCLI()` to format output
- [x] 2.5: Display output with sections:
  - Total prompts (from last periodic event)
  - Agents activated (deduplicate agent_switch events)
  - Stories touched (deduplicate story_start events)
  - Files modified count (sum across all events)
  - Per-agent summary table (agent, stories, files, decisions, active span)
- [x] 2.6: Use `*task` pattern (L4) instead of registering in L2 agent definitions (Architect Recommendation #2)
- [x] 2.7: Add command documentation to `.claude/rules/unified-handoff.md`

### Task 3: Integrate Agent Activity into Tier 3 Handoff (AC: 3, 6)
- [x] 3.1: Read `.claude/lib/handoff/cross-session-handoff.js` module
- [x] 3.2: Update `saveHandoff()` function to accept optional agent summaries parameter
- [x] 3.3: If summaries provided, inject "## Agent Activity" section before "## Key Docs"
- [x] 3.4: Update `trimHandoff()` section patterns to recognize "Agent Activity" section
- [x] 3.5: Set max line limit for "Agent Activity" section to 30 lines
- [x] 3.6: Add "Agent Activity" to preserved sections list (alongside Stories, Work, Plan, Docs, Continue)
- [x] 3.7: Update trimming algorithm tests to verify "Agent Activity" section preservation

### Task 4: Update PreCompact Hook to Include Agent Activity (AC: 3)
- [x] 4.1: Read `.claude/hooks/handoff-saver.cjs` hook
- [x] 4.2: Before calling `saveHandoff()`, generate agent summaries from current session state
- [x] 4.3: Pass summaries to `saveHandoff()` function
- [x] 4.4: Ensure hook timeout (5000ms) is not exceeded by summary computation
- [x] 4.5: Wrap summary computation in try/catch (errors must not block PreCompact)

### Task 5: Testing & Validation (AC: All)
- [x] 5.1: Unit tests for `agent-activity.js` (10-12 tests)
  - Summary generation from events (single agent, multiple agents)
  - Time span computation (no events, single event, multiple events)
  - Decisions extraction from agent_switch event details
  - CLI formatting (table layout, edge cases)
  - Handoff formatting (markdown section, 30-line trim)
- [x] 5.2: Integration test: agent switch flow with summary generation
- [x] 5.3: Integration test: PreCompact hook injects "Agent Activity" section
- [x] 5.4: Integration test: `trimHandoff()` preserves "Agent Activity" when trimming
- [x] 5.5: Manual test: run `*task session-report` and verify CLI output
- [x] 5.6: Manual test: trigger `/compact` and verify "Agent Activity" section in handoff file
- [x] 5.7: Verify L1/L2 boundary protection (no `.aiox-core/` changes)

## Dev Notes

### Architecture Context

**Epic 2 Story Dependencies** (Architect Recommendation #3):
- **Story 2.1** (this story): No prerequisites
- **Story 2.2**: No prerequisites (parallel-eligible with 2.1)
- **Story 2.3**: Requires 2.1 (extends `*session-report` output)
- **Story 2.4**: Requires 2.3 (adds metrics to session report)

**Module Location** (Architect Recommendation #1):
- Canonical location: `.claude/lib/handoff/`
- Remove or document any duplicates in `.aiox/lib/handoff/`
- Tests use canonical location
- Hooks use canonical location

**Command Registration** (Architect Recommendation #2):
- Use `*task` pattern: `*task session-report`
- Do NOT register in L2 agent definitions (avoid L2 boundary modification)
- Document command in `.claude/rules/unified-handoff.md`
- Command is universal (available to all agents via `*task`)

### Key Design Decisions

**DD-1: Why "Approximate Active Span" Instead of "Time Spent"?**
- Timestamp gaps between events do NOT map 1:1 to agent active time
- User may be idle between prompts
- `periodic` events are only every 5 prompts (coarse resolution)
- Labeling as "active span" accurately reflects limitation (Architect Recommendation #6)

**DD-2: Why Max 30 Lines for "Agent Activity" Section?**
- Tier 3 handoff files have 200-line total limit
- Each agent gets 2-3 lines (name + stats)
- Max 10 agents * 3 lines = 30 lines total
- Preserves space for other critical sections

**DD-3: Why On-Demand Computation?**
- No continuous overhead during session
- Summary only generated when `*session-report` command is run or `/compact` triggered
- Reads from existing `state.yaml` data (no new data collection)

**DD-4: Why Integrate into Tier 3 Handoff?**
- New session users need to know what previous agents did
- Raw event logs are too verbose for quick understanding
- "## Agent Activity" section provides at-a-glance context

### File Locations

**New Files (L4 Project Runtime):**
```
.claude/lib/handoff/agent-activity.js          # Agent activity module (tracked)
.claude/lib/handoff/commands/session-report.js # Command handler (tracked)
tests/handoff/agent-activity.test.js           # Unit tests
```

**Modified Files (L4 Project Runtime):**
```
.claude/lib/handoff/cross-session-handoff.js   # Add "Agent Activity" section support
.claude/hooks/handoff-saver.cjs                # Call agent summary generation
.claude/rules/unified-handoff.md               # Document `*task session-report` command
```

**NO Changes to L1/L2:**
- `.aiox-core/core/` — PROTECTED
- `.aiox-core/development/tasks/` — PROTECTED
- `.aiox-core/development/agents/` — PROTECTED (no agent command registration)

### Technical Constraints

- **Node.js stdlib only** — No external dependencies (fs, path, os)
- **CommonJS** — Compatibility with existing hooks
- **ES2022** — Modern JS features allowed
- **Timeout limits** — Summary generation MUST complete in <1000ms (part of 5000ms PreCompact budget)
- **Error isolation** — Summary generation errors MUST NOT block PreCompact

### Agent Activity Summary Schema

```javascript
{
  agent: 'dev',
  stories: ['AIOX-HO-2.1', 'AIOX-HO-2.2'],
  filesModified: 12,
  decisions: ['Use token overlap for memory hints', 'Defer Story 2.5'],
  activeSpan: '2h 15m',  // Approximate (inferred from event timestamps)
  events: 28             // Total events for this agent
}
```

### CLI Output Format

```
Session Report — aios-core

Total Prompts: 42
Agents Activated: 3 (@sm, @dev, @qa)
Stories Touched: 2 (AIOX-HO-2.1, AIOX-HO-2.2)
Files Modified: 18

Agent Activity:
┌──────────┬───────────┬───────┬───────────┬──────────┐
│ Agent    │ Stories   │ Files │ Decisions │ Active   │
├──────────┼───────────┼───────┼───────────┼──────────┤
│ @sm      │ 2         │ 3     │ 2         │ ~1h 5m   │
│ @dev     │ 1         │ 12    │ 5         │ ~2h 15m  │
│ @qa      │ 1         │ 3     │ 1         │ ~45m     │
└──────────┴───────────┴───────┴───────────┴──────────┘
```

### Handoff Section Format (Max 30 Lines)

```markdown
## Agent Activity

Last session (2026-03-25):
- **@sm**: 2 stories, 3 files, ~1h 5m — Story creation for Epic 2
- **@dev**: 1 story, 12 files, ~2h 15m — Implemented AIOX-HO-2.1
- **@qa**: 1 story, 3 files, ~45m — QA review passed with minor notes
```

## Testing

### Unit Testing
- `agent-activity.test.js` (10-12 tests estimated):
  - Summary generation: single agent, multiple agents, no events
  - Time span computation: edge cases (no events, single event, gaps)
  - Decisions extraction from event details
  - CLI formatting: table layout, column alignment, edge cases
  - Handoff formatting: markdown section, 30-line trim, empty summaries

### Integration Testing
- Agent switch flow with summary generation
- PreCompact hook injects "Agent Activity" section into handoff file
- `trimHandoff()` preserves "Agent Activity" section when trimming
- `*task session-report` command end-to-end

### Manual Testing
- Run `*task session-report` after a session with multiple agent switches
- Trigger `/compact` and verify "## Agent Activity" section in `docs/session-handoff-{project}.md`
- Verify trimming preserves "Agent Activity" when handoff file exceeds 200 lines
- Verify time labels say "approximate active span" not "time spent"

## CodeRabbit Integration

> **CodeRabbit Integration**: Enabled

### Story Type Analysis

**Primary Type**: Feature
**Secondary Type(s)**: Observability, CLI
**Complexity**: Medium (new module, CLI command, hook integration, trim algorithm update)

### Specialized Agent Assignment

**Primary Agents**:
- @dev: Implementation of agent-activity module and command handler
- @architect: Quality gate for module design and hook integration

**Supporting Agents**:
- @qa: Test coverage and CLI command validation

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior**:
- CRITICAL issues: auto_fix (2 iterations max)
- HIGH issues: document_only (added to tech debt log)

### CodeRabbit Focus Areas

**Primary Focus**:
- Time computation accuracy (avoid claiming precision we don't have)
- Trim algorithm section recognition (exact pattern matching for "Agent Activity")
- Hook timeout compliance (<1000ms for summary computation)
- Error isolation (try/catch around summary generation)

**Secondary Focus**:
- CLI table formatting edge cases (long agent names, no events)
- L1/L2 boundary protection (no `.aiox-core/` modifications)
- CommonJS compatibility (hooks require .cjs)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-25 | 1.0 | Initial story created for Epic 2 (Agent Activity & Observability v2.0) | River (AIOX SM) |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No debug issues encountered. All 19 new tests passed on first run after a single test data fix (work items count increased to exceed 200-line trim threshold).

### Completion Notes

- Created agent-activity.js module with 3 public functions: generateAgentSummary, formatSummaryForCLI, formatSummaryForHandoff
- Created session-report.js command handler for `*task session-report`
- Updated cross-session-handoff.js with agentActivitySection support in saveHandoff() and Agent Activity section preservation in trimHandoff()
- Updated handoff-saver.cjs PreCompact hook to generate and inject agent summaries before trimming
- Updated unified-handoff.md with session-report documentation and module listing
- 19 new tests (17 unit + 2 integration), 90 total tests pass (71 existing + 19 new), zero regression
- Zero L1/L2 boundary violations
- Zero external dependencies (Node.js stdlib only, CommonJS format)
- Time labels use "approximate active span" per Architect Recommendation #6

### File List

**New Files:**
- `.claude/lib/handoff/agent-activity.js` -- Agent activity aggregation module
- `.claude/lib/handoff/commands/session-report.js` -- *task session-report command handler
- `tests/handoff/agent-activity.test.js` -- 19 tests for agent activity module

**Modified Files:**
- `.claude/lib/handoff/cross-session-handoff.js` -- Added agentActivitySection to saveHandoff(), Agent Activity section in trimHandoff()
- `.claude/hooks/handoff-saver.cjs` -- Added Tier 2 summary generation before Tier 3 trim
- `.claude/rules/unified-handoff.md` -- Documented *task session-report, updated module listing, bumped to v1.2
- `docs/stories/active/AIOX-HO-2.1.agent-activity-summaries.story.md` -- Task checkboxes, Dev Agent Record

## QA Results

**Verdict: PASS**
**Reviewed by:** Quinn (QA Agent) -- Claude Opus 4.6
**Date:** 2026-03-26
**Tests:** 19 new tests passing (217 total across 11 handoff suites, zero regressions)
**Quality Score:** 100/100

### AC Traceability

| AC | Description | Verdict | Evidence |
|----|-------------|---------|----------|
| AC-1 | `*session-report` generates per-agent summary from Tier 2 events | PASS | `agent-activity.js` L62-145: `generateAgentSummary(sessionState)` groups events by agent field, computes all metrics. `session-report.js` L84 calls `generateAgentSummary()`, L95-98 calls `formatSummaryForCLI()`. |
| AC-2 | Summary includes: agent name, stories worked, files modified, decisions, approximate active span | PASS | `agent-activity.js` L131-138: output object contains `agent`, `stories` (Set), `filesModified`, `decisions` (max 5), `activeSpan` via `formatSpan()`. CLI table headers at L204: `['Agent', 'Stories', 'Files', 'Decisions', 'Approx. Active Span']`. |
| AC-3 | Summary integrated into Tier 3 handoff under "## Agent Activity", respecting 200-line limit | PASS | `cross-session-handoff.js` L102-104: `if (data.agentActivitySection)` inserts section. `handoff-saver.cjs` L83-95: generates summaries from Tier 2 and L98-126 injects "## Agent Activity" section into handoff files. |
| AC-4 | Summary computation is on-demand, derived from existing state.yaml | PASS | `agent-activity.js` has no continuous hooks or file watchers. `session-report.js` L71-84: loads modules on-demand via `safeRequire()`, computes only when called. Input is `sessionState` from `session-state.js`. |
| AC-5 | Time metrics labeled "approximate active span" | PASS | `agent-activity.js` L10-13 doc comment: "labeled approximate active span". L204: CLI header is `'Approx. Active Span'`. L136: `activeSpan: formatSpan(spanMs)`. `formatSpan()` L30-45 returns `~Xh Ym` prefix. |
| AC-6 | `trimHandoff()` recognizes "Agent Activity" as preserved section with max 30 lines | PASS | `cross-session-handoff.js` L184: `ACTIVITY_PATTERNS = ['Agent Activity', 'Atividade dos Agentes']`. L246-247: finds activity section. `agent-activity.js` L21: `MAX_HANDOFF_LINES = 30`. L281-288: enforces 30-line trim. Integration test in `agent-activity.test.js` confirms preservation. |
| AC-7 | Zero external dependencies (Node.js stdlib only) | PASS | `agent-activity.js` has no `require()` calls (pure computation). `session-report.js` imports only `path` (stdlib). No `package.json` dependency additions. |
| AC-8 | Module at `.claude/lib/handoff/` canonical location | PASS | Files at `.claude/lib/handoff/agent-activity.js` and `.claude/lib/handoff/commands/session-report.js`. All imports use this canonical path. |

### L1/L2 Boundary Check

No modifications to `.aiox-core/` directories. `git diff --stat HEAD -- .aiox-core/` shows only `entity-registry.yaml` (L3 data, permitted).

### Test Coverage

- 19 tests in `tests/handoff/agent-activity.test.js`: formatSpan (4), generateAgentSummary (4), formatSummaryForCLI (4), formatSummaryForHandoff (3), integration (4)
- All tests pass with zero warnings
- Integration tests verify trimHandoff preservation and saveHandoff injection
