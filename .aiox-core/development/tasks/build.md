# Task: Build (Autonomous)

> **Command:** `*build {story-id}`
> **Agent:** @dev
> **Story:** 8.5 - Build Orchestrator
> **AC:** AC2

---

## Purpose

Execute a complete autonomous build for a story with a single command.

This is the **main entry point** for autonomous development. It orchestrates all components:

- Worktree isolation
- Plan generation/loading
- Subtask execution via Claude CLI
- QA verification (lint, tests)
- Merge to main
- Cleanup and reporting

---

## Usage

```bash
*build {story-id}
*build {story-id} --dry-run
*build {story-id} --verbose
*build {story-id} --no-merge --keep-worktree
```

### Arguments

| Argument | Required | Description                          |
| -------- | -------- | ------------------------------------ |
| story-id | Yes      | Story identifier (e.g., "story-8.5") |

### Flags (AC4)

| Flag            | Description                                        |
| --------------- | -------------------------------------------------- |
| --dry-run       | Show what would happen without executing           |
| --no-merge      | Skip merge phase (keep changes in worktree branch) |
| --keep-worktree | Don't cleanup worktree after build                 |
| --no-worktree   | Execute in main directory (no isolation)           |
| --no-qa         | Skip QA phase                                      |
| --verbose, -v   | Enable verbose output                              |
| --timeout <ms>  | Global timeout (default: 2700000 = 45min)          |

---

## Pipeline (AC3)

```
┌─────────────┐    ┌─────────┐    ┌─────────────┐    ┌──────┐    ┌─────────┐    ┌─────────────┐
│  WORKTREE   │ ─► │  PLAN   │ ─► │   EXECUTE   │ ─► │  QA  │ ─► │  MERGE  │ ─► │   CLEANUP   │
│   Create    │    │  Load/  │    │   Claude    │    │ Lint │    │ To main │    │  Worktree   │
│  isolated   │    │ Generate│    │    CLI      │    │ Test │    │         │    │   Remove    │
└─────────────┘    └─────────┘    └─────────────┘    └──────┘    └─────────┘    └─────────────┘
```

### Phase Details

1. **WORKTREE** - Creates isolated git worktree at `.aiox/worktrees/{story-id}`
2. **PLAN** - Loads `plan/implementation.yaml` or generates from story ACs
3. **EXECUTE** - Runs each subtask using Claude CLI with retry loop
4. **QA** - Runs lint, tests, typecheck (AC8)
5. **MERGE** - Merges worktree branch to main
6. **CLEANUP** - Removes worktree and generates report

---

## Output (AC6)

Final report generated at `plan/build-report-{story-id}.md`:

```markdown
# Build Report: story-8.5

> **Status:** ✅ SUCCESS
> **Duration:** 15m 32s

## Phases

| Phase    | Status       | Duration |
| -------- | ------------ | -------- |
| worktree | ✅ completed | 1200ms   |
| plan     | ✅ completed | 500ms    |
| execute  | ✅ completed | 845000ms |
| qa       | ✅ completed | 32000ms  |
| merge    | ✅ completed | 2100ms   |
| cleanup  | ✅ completed | 800ms    |
```

---

## Examples

```bash
# Standard build (recommended)
*build story-8.5

# Preview what would happen
*build story-8.5 --dry-run

# Debug mode with verbose output
*build story-8.5 --verbose

# Build without merging (review changes first)
*build story-8.5 --no-merge --keep-worktree

# Quick build without QA (not recommended)
*build story-8.5 --no-qa --no-merge
```

---

## Integration

- **Uses:**
  - `BuildOrchestrator` from `core/execution/build-orchestrator.js`
  - `AutonomousBuildLoop` from `core/execution/autonomous-build-loop.js`
  - `WorktreeManager` from `infrastructure/scripts/worktree-manager.js`
  - `GotchasMemory` from `core/memory/gotchas-memory.js`
- **Invokes:** Claude CLI for subtask execution
- **Outputs:** `plan/build-report-{story-id}.md`

---

## Related Commands

- `*build-autonomous {story-id}` - Lower-level build loop (no worktree/merge)
- `*build-resume {story-id}` - Resume failed build from checkpoint
- `*build-status {story-id}` - Check build progress
- `*worktree-list` - List active worktrees

---

_Task file for Story 8.5 - Build Orchestrator_
