# Unified Handoff System -- 3-Tier Context Persistence

> **Supersedes**: `agent-handoff.md` (Tier 1 only) and `auto-session-handoff.md` (Tier 3 only).
> Both old rules are DEPRECATED. This is the single source of truth for all handoff behavior.

## Architecture

```
TIER 1: Micro-Handoff (Agent Switch)     --> .aiox/current-session/micro-handoff.json  (data)
TIER 2: Session State (In-Session)        --> .aiox/current-session/state.yaml         (data)
TIER 3: Session Handoff (Cross-Session)   --> docs/session-handoff-{project}.md        (data)

Modules: .claude/lib/handoff/  (tracked in git)
```

All tiers enforce **automatic** persistence via hooks. Zero manual intervention required.

---

## Tier 1: Micro-Handoff (Agent Switch)

**Trigger**: UserPromptSubmit hook detects `@agent` pattern in prompt.
**File**: `.aiox/current-session/micro-handoff.json`
**Size limit**: <500 tokens (~375 words)

### Schema

```json
{
  "version": "1.0",
  "id": "handoff-{from}-to-{to}-{timestamp}",
  "timestamp": "ISO 8601",
  "from_agent": "dev",
  "to_agent": "qa",
  "consumed": false,
  "story_context": {
    "story_id": "AIOX-HO-1",
    "story_path": "docs/stories/active/AIOX-HO-1.unified-handoff-system.story.md",
    "story_status": "In Progress",
    "current_task": "Task 4: Implement Tier 1",
    "branch": "main"
  },
  "decisions": ["max 5 entries"],
  "files_modified": ["max 10 entries"],
  "blockers": ["max 3 entries"],
  "next_action": "What the incoming agent should do next",
  "memory_hints": ["max 3 entries — extracted from outgoing agent MEMORY.md"]
}
```

### Compaction Limits

| Field | Max |
|-------|-----|
| decisions | 5 entries |
| files_modified | 10 entries |
| blockers | 3 entries |
| memory_hints | 3 entries |
| retained unconsumed | 3 (oldest auto-rotated) |

### Memory Hints (Story AIOX-HO-2.2)

On agent switch, the hook extracts relevant knowledge from the outgoing agent's
persistent memory (`.claude/agent-memory/{agent-id}/MEMORY.md`) using token overlap
scoring against the active story context. Up to 3 hints are included as the
`memory_hints` field. This is READ-ONLY -- the handoff system never writes to
agent memory files.

Module: `.claude/lib/handoff/memory-hints.js`

### Incoming Agent Behavior

On activation, check `.aiox/current-session/micro-handoff.json`:
1. If unconsumed handoff exists from a different agent: read and display summary
2. Show suggested next action from handoff
3. If `memory_hints` is present and non-empty, display "Memory hints from @{from_agent}:" with each hint as a bullet
4. Mark handoff as consumed after display

---

## Tier 2: Session State (In-Session Timeline)

**Trigger**: UserPromptSubmit hook, every 5 messages (automatic).
**File**: `.aiox/current-session/state.yaml`
**Pattern**: Append-only YAML timeline.

### Events Tracked

| Event | When |
|-------|------|
| `agent_switch` | `@agent` detected in prompt |
| `story_start` | Agent begins working on a story |
| `story_complete` | Story marked Ready for Review |
| `qa_gate` | QA verdict rendered |
| `commit` | Git commit created |
| `periodic` | Every 5 messages (snapshot) |

### Schema

```yaml
session:
  id: "{session_id}"
  started: "ISO 8601"
  project: "aios-core"

events:
  - timestamp: "ISO 8601"
    type: "agent_switch"
    agent: "dev"
    story: "AIOX-HO-1"
    branch: "main"
    files_modified: 5
    details: "Switched from @sm to @dev"

  - timestamp: "ISO 8601"
    type: "periodic"
    agent: "dev"
    prompt_count: 10
    story: "AIOX-HO-1"
    branch: "main"
    files_modified: 8
```

---

## Tier 3: Cross-Session Handoff

**Trigger**: PreCompact hook (before `/compact`).
**File**: `docs/session-handoff-{project}.md`
**Size limit**: ~200 lines max.
**Archive**: `.aiox/session-history/{project}/{timestamp}.md`

### Structure (max ~200 lines)

```markdown
# Session Handoff -- {Project Name}
**Date:** YYYY-MM-DD
**Last session:** Brief summary
**Next:** What to do next

## Active Stories
| Story | Status | Notes |
...

## Recent Work (last 5 items)
1. ...

## Key Docs
- PRD: ...
- Architecture: ...

## How to Continue
Paste prompt...
```

### Auto-Trimming Rules

When handoff exceeds ~200 lines:
1. **Keep**: Header (date, next step), Active stories table, Last 5 work items, Key docs, How to Continue
2. **Archive**: Older work items, completed session sections, redundant file listings
3. Archive destination: `.aiox/session-history/{project}/archive-{timestamp}.md`

---

## Recovery Validation

On new session start, if a Tier 3 handoff file exists:

1. Read handoff file's mentioned files
2. Run `git status --short` to get actual state
3. Compare: if >20% drift between handoff's file list and git status, show warning:
   > "Handoff drift detected (X%). Some files changed outside the last session. Review before continuing."
4. This is a **warning**, not a blocker. User can override.

---

## Automatic Triggers (Hook-Based)

| Trigger | Hook | Tier | Action |
|---------|------|------|--------|
| `@agent` in prompt | UserPromptSubmit (`handoff-auto.cjs`) | 1 + 2 | Save micro-handoff + log agent_switch event |
| Every 5 prompts | UserPromptSubmit (`handoff-auto.cjs`) | 2 | Update session state (periodic snapshot) |
| `/compact` | PreCompact (`precompact-wrapper.cjs` chains `handoff-saver.cjs`) | 3 | Save cross-session handoff + trim |

### Error Isolation

Handoff save errors MUST NOT block:
- UserPromptSubmit processing (SYNAPSE must still run)
- PreCompact processing (session digest must still run)

Timeout: 5000ms max for any handoff save operation.

---

## Session Report: `*task session-report`

Any agent can run `*task session-report` to generate a full session overview:

- **Overview stats**: Total prompts, agents activated, stories touched, files modified
- **Agent Activity table**: Per-agent breakdown with stories, files, decisions, approximate active span (Story 2.1)
- **Story Details table**: Per-story breakdown with status, events, agents involved (Story 2.3)
- **Metrics**: Per-session productivity metrics -- prompts per agent, stories started/completed, QA pass rate, commits, avg agent duration (Story 2.4)
- **Event Timeline**: Last 10 events in compact format `[HH:MM] @agent type story` (Story 2.3)

Data derived entirely from Tier 2 state.yaml (no new collection).
The Agent Activity section is also injected into Tier 3 handoff files during PreCompact.
Metrics are cached at `.aiox/current-session/metrics.json` (gitignored) after each report.

Modules:
- `.claude/lib/handoff/agent-activity.js` (agent summaries)
- `.claude/lib/handoff/metrics.js` (productivity metrics computation, Story 2.4)
- `.claude/lib/handoff/formatters/event-timeline.js` (timeline formatter)
- `.claude/lib/handoff/aggregators/story-details.js` (story aggregator)
- `.claude/lib/handoff/commands/session-report.js` (command handler)

---

## Session History: `*task session-history {project}`

Any agent can run `*task session-history {project}` to list archived sessions:

- Scans `.aiox/session-history/{project}/` for `state-*.yaml` files
- Displays: date, event count, agents involved, duration, session ID (truncated)
- Default: last 20 sessions. Override with `--last N` flag.
- Performance target: <2s for 50 archived sessions (batch processing)
- Data derived from Tier 3 archived state files (no new collection)

Usage:
```
*task session-history aios-core              # Last 20 sessions
*task session-history aios-core --last 5     # Last 5 sessions
```

Module: `.claude/lib/handoff/commands/session-history.js`

---

## Metrics Trend: `*task metrics-trend {project} [--last N]`

Any agent can run `*task metrics-trend {project}` to compare current session metrics to historical averages:

- Scans `.aiox/session-history/{project}/` for `state-*.yaml` files (reuses archive scanning)
- Computes per-session metrics from each archived state
- Aggregates historical averages across N sessions
- Displays trend table: Metric, Current, Avg (Last N), Trend arrow
- Default: last 20 sessions. Override with `--last N` flag.
- Performance target: <1s for 20 archived sessions

Metrics computed:
- **Prompts per Session**: Total prompts (periodic events * 5)
- **Stories Completed**: Count per session
- **Completion Rate**: Stories completed / started
- **QA Pass Rate**: qa_gate PASS / total qa_gate events
- **Commits per Session**: Count of commit events
- **Avg Agent Duration**: Time span per agent averaged

Trend indicators:
- Up-arrow: Current > Historical + 10% (improving)
- Down-arrow: Current < Historical - 10% (declining)
- Right-arrow: Within +/-10% (stable)

Usage:
```
*task metrics-trend aios-core              # Last 20 sessions
*task metrics-trend aios-core --last 10    # Last 10 sessions
```

Module: `.claude/lib/handoff/commands/metrics-trend.js`

---

## Manual Fallback: `*handoff`

If automatic triggers fail, any agent can run `*handoff` to:
1. Force Tier 1 save (if switching agents)
2. Force Tier 2 snapshot
3. Force Tier 3 save + trim

This is a **fallback only**. The primary mechanism is fully automatic via hooks.

---

## Module Locations (tracked in git)

```
.claude/lib/handoff/                    # Core modules (committed to git)
  micro-handoff.js                      # Tier 1 module
  session-state.js                      # Tier 2 module
  cross-session-handoff.js              # Tier 3 module
  agent-activity.js                     # Agent activity summaries (Story 2.1)
  memory-hints.js                       # Agent memory hint extraction (Story 2.2)
  metrics.js                            # Productivity metrics computation (Story 2.4)
  migrate-handoffs.js                   # Migration script
  commands/
    session-report.js                   # *task session-report handler (Stories 2.1, 2.3, 2.4)
    session-history.js                  # *task session-history handler (Story 2.3)
    metrics-trend.js                    # *task metrics-trend handler (Story 2.4)
  formatters/
    event-timeline.js                   # Compact event timeline formatter (Story 2.3)
  aggregators/
    story-details.js                    # Per-story event aggregator (Story 2.3)
```

## Runtime Directories (gitignored)

```
.aiox/current-session/                  # Tier 1 + Tier 2 data (gitignored, runtime only)
  micro-handoff.json                    # Latest micro-handoff
  state.yaml                           # Session timeline
  metrics.json                         # Cached productivity metrics (Story 2.4)
  .prompt-count                        # Prompt counter
  README.md                            # Explains artifacts

.aiox/session-history/                  # Tier 3 archives (gitignored)
  {project}/
    archive-{timestamp}.md              # Archived handoff content
    state-{timestamp}.yaml              # Archived session state (from Tier 2 reset)

docs/session-handoff-{project}.md       # Tier 3 active (committed to git)
```

---

*Unified Handoff System v1.5 -- Stories AIOX-HO-1, AIOX-HO-2.1, AIOX-HO-2.2, AIOX-HO-2.3, AIOX-HO-2.4*
