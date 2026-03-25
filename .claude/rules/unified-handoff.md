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
  "next_action": "What the incoming agent should do next"
}
```

### Compaction Limits

| Field | Max |
|-------|-----|
| decisions | 5 entries |
| files_modified | 10 entries |
| blockers | 3 entries |
| retained unconsumed | 3 (oldest auto-rotated) |

### Incoming Agent Behavior

On activation, check `.aiox/current-session/micro-handoff.json`:
1. If unconsumed handoff exists from a different agent: read and display summary
2. Show suggested next action from handoff
3. Mark handoff as consumed after display

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
  migrate-handoffs.js                   # Migration script
```

## Runtime Directories (gitignored)

```
.aiox/current-session/                  # Tier 1 + Tier 2 data (gitignored, runtime only)
  micro-handoff.json                    # Latest micro-handoff
  state.yaml                           # Session timeline
  .prompt-count                        # Prompt counter
  README.md                            # Explains artifacts

.aiox/session-history/                  # Tier 3 archives (gitignored)
  {project}/
    archive-{timestamp}.md              # Archived handoff content

docs/session-handoff-{project}.md       # Tier 3 active (committed to git)
```

---

*Unified Handoff System v1.1 -- Story AIOX-HO-1*
