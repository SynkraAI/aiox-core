# Story AIOX-HO-2.3: Session Observability CLI

## Status

**Ready for Review**

## Executor Assignment

**executor**: @dev
**quality_gate**: @architect
**quality_gate_tools**: [code-review, architecture-review]

## Story

**As a** framework user,
**I want** CLI commands to inspect session history and current session state,
**so that** I can understand workflow patterns and diagnose issues.

## Acceptance Criteria

1. `*session-report` command shows: total prompts, agents activated, stories touched, compact event timeline, files modified count (FR-10.1)
2. `*session-history {project}` command lists archived sessions with date, event count, agents per session (FR-10.2)
3. All data derived from existing Tier 2 (state.yaml) and Tier 3 (archives) data — no new data collection (FR-10.2)
4. Output formatted for CLI readability (tables, compact timeline) (FR-10.1)
5. CLI First principle enforced — no web dashboard or UI component (FR-10.4, CON-8)
6. Commands use `*task` pattern (L4) instead of registering in L2 agent definitions (Architect Recommendation #2)
7. Zero external dependencies (Node.js stdlib only)
8. Module location at `.claude/lib/handoff/` is canonical (Architect Recommendation #1)

## Dependencies

**Requires Story 2.1 (Agent Activity Summaries)** — The `*session-report` command includes per-agent summary output, which is implemented in Story 2.1. This story extends that output with additional sections.

## Problem Statement

Users cannot easily inspect what happened in their current session or review past sessions without manually reading raw YAML files. The Tier 2 session state (`.aiox/current-session/state.yaml`) and archived sessions (`.aiox/session-history/{project}/state-*.yaml`) contain all the data, but there is no user-friendly interface to query and display it.

Debugging workflow issues, understanding agent contributions, and reviewing session patterns all require diving into YAML syntax and parsing event arrays manually. This is time-consuming and error-prone.

## Solution

Implement two CLI commands following the CLI First principle:

1. **`*task session-report`** — Current session summary
   - Reads `.aiox/current-session/state.yaml`
   - Displays: total prompts, agents, stories, files, event timeline, agent activity table
   - Extends output from Story 2.1 with event timeline and story details

2. **`*task session-history {project}`** — Archived sessions list
   - Scans `.aiox/session-history/{project}/` for `state-*.yaml` files
   - Displays table: date, event count, agents involved, duration
   - Supports pagination or limit (default: last 20 sessions per Architect Recommendation #8)

Both commands use on-demand computation (read-only, no continuous overhead) and respect the <2s performance target for 50 sessions.

## Tasks / Subtasks

### Task 1: Extend `*session-report` Command (AC: 1, 4, 5, 6, 7, 8)
- [x] 1.1: Read `.claude/lib/handoff/commands/session-report.js` (created in Story 2.1)
- [x] 1.2: Extend command to include additional sections:
  - **Event Timeline (Compact)**: Last 10 events with timestamp, type, agent, story
  - **Story Details**: Per-story breakdown (story ID, status, events count, agents involved)
  - **Files Modified**: Top 10 files by modification count (if data available)
- [x] 1.3: Format output for CLI readability:
  - Use tables for structured data (agents, stories, files)
  - Use compact list for timeline (avoid verbosity)
  - Use separators and headers for visual clarity
- [x] 1.4: Ensure command uses `*task` pattern (no L2 agent registration)
- [x] 1.5: Add command documentation to `.claude/rules/unified-handoff.md`
- [x] 1.6: Ensure zero external dependencies (Node.js stdlib only)
- [x] 1.7: Ensure output respects CLI First principle (no HTML, no UI components)

### Task 2: Implement `*session-history` Command (AC: 2, 3, 4, 5, 6, 7, 8)
- [x] 2.1: Create `.claude/lib/handoff/commands/session-history.js` module at canonical location
- [x] 2.2: Scan `.aiox/session-history/{project}/` for `state-*.yaml` files
- [x] 2.3: Parse each archived state file:
  - Extract session ID, started date, project name
  - Count events (length of events array)
  - Extract unique agents (deduplicate agent fields from events)
  - Compute session duration (last event timestamp - first event timestamp)
- [x] 2.4: Sort sessions by date descending (most recent first)
- [x] 2.5: Default to last 20 sessions (Architect Recommendation #8)
- [x] 2.6: Support `--last N` flag to override default limit
- [x] 2.7: Format output as CLI table:
  - Columns: Date, Events, Agents, Duration, Session ID (truncated)
- [x] 2.8: Use `*task` pattern (no L2 agent registration)
- [x] 2.9: Add command documentation to `.claude/rules/unified-handoff.md`
- [x] 2.10: Ensure <2s performance for 50 sessions (batch processing, no streaming needed per Architect Q3)

### Task 3: Add Event Timeline Formatter (AC: 1, 4)
- [x] 3.1: Create `.claude/lib/handoff/formatters/event-timeline.js` module
- [x] 3.2: Implement `formatCompactTimeline(events, limit)` function:
  - Input: array of events from state.yaml
  - Output: string with last N events formatted compactly
  - Format: `[HH:MM] agent type story` (one line per event)
  - Example: `[10:30] @dev story_start AIOX-HO-2.3`
- [x] 3.3: Support limit parameter (default: 10 last events)
- [x] 3.4: Handle edge cases (no events, empty timeline)

### Task 4: Add Story Details Aggregator (AC: 1)
- [x] 4.1: Create `.claude/lib/handoff/aggregators/story-details.js` module
- [x] 4.2: Implement `aggregateStoryDetails(events)` function:
  - Input: array of events from state.yaml
  - Output: array of story summaries
  - Group events by `story` field
  - Count events per story
  - Deduplicate agents per story
  - Determine story status (if story_complete event exists, status = Done, else InProgress)
- [x] 4.3: Format as CLI table:
  - Columns: Story ID, Status, Events, Agents
- [x] 4.4: Handle edge cases (no stories, single story, multiple stories)

### Task 5: Testing & Validation (AC: All)
- [x] 5.1: Unit tests for `session-history.js` (5-7 tests)
  - Archive scanning (no files, single file, multiple files)
  - Session parsing (valid YAML, malformed YAML, empty events)
  - Sorting and limiting (last 20 default, --last N override)
  - CLI table formatting (edge cases: long agent names, no agents)
- [x] 5.2: Unit tests for `event-timeline.js` (3-5 tests)
  - Compact formatting (last 10, fewer than 10, empty)
  - Timestamp formatting (HH:MM extraction from ISO 8601)
  - Edge cases (no timestamp, missing fields)
- [x] 5.3: Unit tests for `story-details.js` (3-5 tests)
  - Aggregation by story (single story, multiple stories, no stories)
  - Agent deduplication (multiple events per agent per story)
  - Status determination (story_complete event exists or not)
- [x] 5.4: Integration test: `*task session-report` end-to-end with mock session state
- [x] 5.5: Integration test: `*task session-history` end-to-end with mock archived sessions
- [x] 5.6: Manual test: run `*task session-report` after a real session
- [x] 5.7: Manual test: run `*task session-history aios-core` with real archived sessions
- [x] 5.8: Performance test: verify <2s execution time for 50 archived sessions
- [x] 5.9: Verify L1/L2 boundary protection (no `.aiox-core/` changes)

## Dev Notes

### Architecture Context

**Epic 2 Story Dependencies** (Architect Recommendation #3):
- **Story 2.1**: No prerequisites (complete)
- **Story 2.2**: No prerequisites (parallel)
- **Story 2.3** (this story): **Requires Story 2.1** — extends `*session-report` output
- **Story 2.4**: Requires 2.3 — adds metrics to session report

**Module Location** (Architect Recommendation #1):
- Canonical location: `.claude/lib/handoff/`
- Commands at: `.claude/lib/handoff/commands/`
- Formatters at: `.claude/lib/handoff/formatters/`
- Aggregators at: `.claude/lib/handoff/aggregators/`

**Command Registration** (Architect Recommendation #2):
- Use `*task` pattern: `*task session-report`, `*task session-history {project}`
- Do NOT register in L2 agent definitions (avoid L2 boundary modification)
- Document commands in `.claude/rules/unified-handoff.md`
- Commands are universal (available to all agents via `*task`)

### Key Design Decisions

**DD-1: Why Extend Story 2.1's `*session-report` Instead of Replacing It?**
- Story 2.1 implements per-agent summary table
- This story adds event timeline and story details
- Extending is cleaner than duplicating agent summary logic

**DD-2: Why Default to Last 20 Sessions?** (Architect Recommendation #8)
- Users accumulating >100 sessions over months would have slow queries
- 20 sessions covers ~1-2 weeks of active development
- `--last N` flag allows override for power users
- <2s target easily met for 20 sessions (~1MB of YAML)

**DD-3: Why Batch Processing for Archive Scanning?** (Architect Answer Q3)
- 50 sessions at ~50KB each = ~2.5MB total
- Streaming adds complexity with minimal benefit at this scale
- Batch: `fs.readdirSync` → sort → parse first N → format
- If >100 sessions needed, v3.0 can add a metadata index file

**DD-4: Why Compact Event Timeline Instead of Full Details?**
- Full events list would be 100+ lines for a typical session
- Compact format: `[HH:MM] agent type story` — one line, easy to scan
- Last 10 events provide sufficient recent context
- Users can read full state.yaml if needed

### File Locations

**New Files (L4 Project Runtime):**
```
.claude/lib/handoff/commands/session-history.js   # Session history command (tracked)
.claude/lib/handoff/formatters/event-timeline.js  # Event timeline formatter (tracked)
.claude/lib/handoff/aggregators/story-details.js  # Story details aggregator (tracked)
tests/handoff/session-history.test.js             # Unit tests
tests/handoff/event-timeline.test.js              # Unit tests
tests/handoff/story-details.test.js               # Unit tests
```

**Modified Files (L4 Project Runtime):**
```
.claude/lib/handoff/commands/session-report.js    # Extend with timeline and story details
.claude/rules/unified-handoff.md                  # Document new commands
```

**NO Changes to L1/L2:**
- `.aiox-core/core/` — PROTECTED
- `.aiox-core/development/agents/` — PROTECTED

### Technical Constraints

- **Node.js stdlib only** — No external dependencies (fs, path, os)
- **CommonJS** — Compatibility with existing modules
- **ES2022** — Modern JS features allowed
- **Performance target** — <2s for 50 archived sessions (FR-10.2)
- **CLI First** — No HTML, no UI components, terminal output only (CON-8)

### CLI Output Examples

#### `*task session-report` (Extended)

```
Session Report — aios-core

Session ID: a3f2b8c4
Started: 2026-03-25 09:00
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

Story Details:
┌─────────────┬────────────┬────────┬──────────────┐
│ Story       │ Status     │ Events │ Agents       │
├─────────────┼────────────┼────────┼──────────────┤
│ AIOX-HO-2.1 │ Done       │ 18     │ @sm, @dev    │
│ AIOX-HO-2.2 │ InProgress │ 12     │ @dev, @qa    │
└─────────────┴────────────┴────────┴──────────────┘

Recent Events (Last 10):
[14:45] @qa qa_gate AIOX-HO-2.2
[14:30] @dev story_complete AIOX-HO-2.1
[14:15] @dev commit AIOX-HO-2.1
[14:00] @dev periodic (prompt 40)
[13:45] @dev periodic (prompt 35)
[13:30] @dev periodic (prompt 30)
[13:15] @qa agent_switch AIOX-HO-2.2
[13:00] @dev story_start AIOX-HO-2.2
[12:45] @dev commit AIOX-HO-2.1
[12:30] @dev periodic (prompt 20)
```

#### `*task session-history aios-core`

```
Session History — aios-core (Last 20 sessions)

┌────────────┬────────┬──────────────────┬──────────┬──────────────┐
│ Date       │ Events │ Agents           │ Duration │ Session ID   │
├────────────┼────────┼──────────────────┼──────────┼──────────────┤
│ 2026-03-25 │ 42     │ @sm, @dev, @qa   │ 5h 45m   │ a3f2b8c4     │
│ 2026-03-24 │ 38     │ @dev, @qa        │ 4h 20m   │ 9b2e7f3a     │
│ 2026-03-23 │ 51     │ @pm, @architect  │ 6h 10m   │ f4c8d1a2     │
│ 2026-03-22 │ 29     │ @dev             │ 3h 30m   │ 2a5e9b7c     │
│ ...        │ ...    │ ...              │ ...      │ ...          │
└────────────┴────────┴──────────────────┴──────────┴──────────────┘

Showing last 20 of 45 sessions. Use --last N to override.
```

#### `*task session-history aios-core --last 5`

```
Session History — aios-core (Last 5 sessions)

┌────────────┬────────┬──────────────────┬──────────┬──────────────┐
│ Date       │ Events │ Agents           │ Duration │ Session ID   │
├────────────┼────────┼──────────────────┼──────────┼──────────────┤
│ 2026-03-25 │ 42     │ @sm, @dev, @qa   │ 5h 45m   │ a3f2b8c4     │
│ 2026-03-24 │ 38     │ @dev, @qa        │ 4h 20m   │ 9b2e7f3a     │
│ 2026-03-23 │ 51     │ @pm, @architect  │ 6h 10m   │ f4c8d1a2     │
│ 2026-03-22 │ 29     │ @dev             │ 3h 30m   │ 2a5e9b7c     │
│ 2026-03-21 │ 33     │ @sm, @dev        │ 4h 00m   │ 7e1f4b9d     │
└────────────┴────────┴──────────────────┴──────────┴──────────────┘

Showing last 5 of 45 sessions.
```

## Testing

### Unit Testing
- `session-history.test.js` (5-7 tests):
  - Archive scanning (no files, single file, multiple files)
  - Session parsing (valid YAML, malformed YAML, empty events)
  - Sorting and limiting (last 20 default, --last N override)
  - Agent deduplication (multiple events per agent)
  - Duration computation (first to last event timestamp)
- `event-timeline.test.js` (3-5 tests):
  - Compact formatting (last 10, fewer than 10, empty)
  - Timestamp extraction (ISO 8601 to HH:MM)
  - Edge cases (no timestamp, missing agent/type/story)
- `story-details.test.js` (3-5 tests):
  - Aggregation by story (single, multiple, none)
  - Agent deduplication per story
  - Status determination (story_complete event presence)

### Integration Testing
- `*task session-report` end-to-end with mock session state
- `*task session-history` end-to-end with mock archived sessions
- Performance test: 50 archived sessions in <2s

### Manual Testing
- Run `*task session-report` after a real multi-agent session
- Run `*task session-history aios-core` with real archives
- Run `*task session-history aios-core --last 5` to verify flag
- Verify CLI output readability (tables aligned, headers clear)

## CodeRabbit Integration

> **CodeRabbit Integration**: Enabled

### Story Type Analysis

**Primary Type**: Feature
**Secondary Type(s)**: CLI, Observability
**Complexity**: Medium (new commands, archive scanning, formatters, aggregators)

### Specialized Agent Assignment

**Primary Agents**:
- @dev: Implementation of commands, formatters, and aggregators
- @architect: Quality gate for archive scanning performance and CLI output design

**Supporting Agents**:
- @qa: Test coverage and performance validation (<2s for 50 sessions)

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
- Performance (<2s for 50 sessions, batch processing efficiency)
- CLI output formatting (table alignment, edge cases like long agent names)
- Archive scanning robustness (malformed YAML, missing fields, empty files)
- CLI First enforcement (no HTML, no UI components, terminal-only output)

**Secondary Focus**:
- L1/L2 boundary protection (no `.aiox-core/` modifications)
- Zero external dependencies (Node.js stdlib only)
- Command registration via `*task` pattern (no L2 agent definitions)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-25 | 1.0 | Initial story created for Epic 2 (Agent Activity & Observability v2.0). Depends on Story 2.1. | River (AIOX SM) |
| 2026-03-25 | 1.1 | Implementation complete. 54 new tests, 175 total. All ACs met. Ready for Review. | Dex (AIOX Dev) |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

No debug issues encountered. All implementations were clean on first pass.

### Completion Notes

- All 5 tasks completed with 54 new tests (175 total handoff tests passing)
- Extended `*session-report` with Story Details table and Event Timeline sections
- Created `*session-history {project}` command with archive scanning, batch processing
- Performance verified: 50 archived sessions scanned in 29ms (well under 2s target)
- Zero external dependencies -- Node.js stdlib only (fs, path, os)
- CLI First enforced -- terminal-only output, no HTML/UI
- L1/L2 boundary clean -- no `.aiox-core/` modifications
- `*task` pattern used (L4) -- no L2 agent definition changes
- Lint clean (0 errors, 0 warnings on all changed files)
- `.claude/rules/unified-handoff.md` updated to v1.4 with new command docs

### File List

**New Files:**
- `.claude/lib/handoff/formatters/event-timeline.js` -- Compact event timeline formatter
- `.claude/lib/handoff/aggregators/story-details.js` -- Per-story event aggregator
- `.claude/lib/handoff/commands/session-history.js` -- Session history command handler
- `tests/handoff/event-timeline.test.js` -- 15 unit tests
- `tests/handoff/story-details.test.js` -- 10 unit tests
- `tests/handoff/session-history.test.js` -- 26 unit tests (incl. performance)
- `tests/handoff/session-report-extended.test.js` -- 3 integration tests

**Modified Files:**
- `.claude/lib/handoff/commands/session-report.js` -- Extended with timeline + story details
- `.claude/rules/unified-handoff.md` -- Documented new commands, updated module locations
- `docs/stories/active/AIOX-HO-2.3.session-observability-cli.story.md` -- Story file updates

## QA Results

**Verdict: PASS**
**Reviewed by:** Quinn (QA Agent) -- Claude Opus 4.6
**Date:** 2026-03-26
**Tests:** 54 new tests passing (217 total across 11 handoff suites, zero regressions)
**Quality Score:** 100/100

### AC Traceability

| AC | Description | Verdict | Evidence |
|----|-------------|---------|----------|
| AC-1 | `*session-report` shows: total prompts, agents, stories, compact event timeline, files modified | PASS | `session-report.js` L87-91: extracts totalPrompts from periodic events. L95-98: calls `formatSummaryForCLI()` which outputs agents, stories, files (agent-activity.js L184-197). L104-109: story details section. L133-139: event timeline section with `formatCompactTimeline(events, 10)`. |
| AC-2 | `*session-history {project}` lists archived sessions with date, events, agents per session | PASS | `session-history.js` L295-307: `generateHistory()` entry point. L164-223: `scanArchives()` reads `state-*.yaml` from archive dir. L234-284: `formatHistoryTable()` outputs columns: Date, Events, Agents, Duration, Session ID. L246-253: headers match spec. |
| AC-3 | All data from existing Tier 2/3 data, no new collection | PASS | `session-report.js` L48-57: reads session state via `getSessionState()`. `session-history.js` L170: reads `.aiox/session-history/{project}/`. No new event types or data collection added. |
| AC-4 | Output formatted for CLI readability (tables, compact timeline) | PASS | `event-timeline.js` L80-101: `formatCompactTimeline()` outputs `[HH:MM] @agent type story` per line. `story-details.js` L82-118: `formatStoryDetailsTable()` outputs padded column table. `session-history.js` L234-284: `formatHistoryTable()` with calculated column widths. |
| AC-5 | CLI First -- no web dashboard or UI component | PASS | All output modules return plain strings. No HTML, no React components, no browser dependencies. `event-timeline.js`, `story-details.js`, `session-history.js` all produce terminal-only text. |
| AC-6 | Commands use `*task` pattern (L4), no L2 registration | PASS | `session-report.js` L10: documented as `*task session-report`. `session-history.js` L6: documented as `*task session-history {project}`. No modifications to `.aiox-core/development/agents/`. Documented in `unified-handoff.md`. |
| AC-7 | Zero external dependencies (Node.js stdlib only) | PASS | `session-history.js` L19-20: only `require('fs')` and `require('path')`. `event-timeline.js`: no imports at all (pure functions). `story-details.js`: no imports. No `package.json` additions. |
| AC-8 | Module at `.claude/lib/handoff/` canonical location | PASS | Files at `.claude/lib/handoff/commands/session-history.js`, `.claude/lib/handoff/formatters/event-timeline.js`, `.claude/lib/handoff/aggregators/story-details.js`. All resolved via canonical paths. |

### L1/L2 Boundary Check

No modifications to `.aiox-core/` directories. All new files are in `.claude/lib/handoff/` (L4) and `tests/handoff/` (L4).

### Test Coverage

- 15 tests in `tests/handoff/event-timeline.test.js`: extractTime (4), formatEvent (5), formatCompactTimeline (6)
- 10 tests in `tests/handoff/story-details.test.js`: aggregateStoryDetails (5), formatStoryDetailsTable (5)
- 26 tests in `tests/handoff/session-history.test.js`: formatDuration (3), extractDate (3), parseSessionMetadata (5), scanArchives (4), formatHistoryTable (3), generateHistory (4), performance (1)
- 3 tests in `tests/handoff/session-report-extended.test.js`: integration tests for full report with all sections
- Performance test: 50 archived sessions scanned in 29ms (target: <2s) -- PASS
