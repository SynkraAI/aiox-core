# Task: Build Autonomous

> **Command:** `*build-autonomous {story-id}`
> **Agent:** @dev
> **Story:** 8.1 - Coder Agent Loop
> **AC:** AC5

---

## Purpose

Start an autonomous build loop for a story, executing subtasks with automatic retries and self-critique.

This implements the **Coder Agent Loop** pattern from Auto-Claude, providing:

- Automatic retry on failure (max 3 attempts per subtask)
- Self-critique at implementation milestones
- Global timeout protection (configurable)
- Event-driven progress tracking
- Checkpoint-based recovery integration

---

## Usage

```bash
*build-autonomous {story-id}
*build-autonomous {story-id} --worktree    # Use worktree isolation
*build-autonomous {story-id} --timeout=60  # Set global timeout (minutes)
```

### Arguments

| Argument | Required | Description                          |
| -------- | -------- | ------------------------------------ |
| story-id | Yes      | Story identifier (e.g., "story-8.1") |

### Options

| Option        | Default | Description                  |
| ------------- | ------- | ---------------------------- |
| --worktree    | false   | Execute in isolated worktree |
| --timeout     | 30      | Global timeout in minutes    |
| --max-retries | 3       | Maximum retries per subtask  |

---

## Workflow

```yaml
steps:
  - name: Initialize Build
    action: |
      1. Load story file from docs/stories/
      2. Load implementation plan from plan/implementation.yaml
      3. Initialize BuildStateManager
      4. Create build state with status "in_progress"
    validates:
      - Story exists and is approved
      - Implementation plan exists
      - No conflicting build in progress

  - name: Setup Worktree (if --worktree)
    action: |
      1. Create isolated worktree for story
      2. Set worktree path in build state
    skip_if: worktree option is false

  - name: Execute Build Loop
    action: |
      FOR EACH subtask in implementation.yaml:
        1. Track attempt start (RecoveryTracker)
        2. **Code Intelligence IDS G4 Check** (before creating new files):
           - If `isCodeIntelAvailable()` (from `.aios-core/core/code-intel`):
             - Call `checkBeforeWriting(fileName, description)` from `dev-helper`
             - If duplicates detected: log in decision-log and display as advisory
             - Does NOT block execution (autonomous mode continues)
           - If code intelligence not available: skip silently
        3. Execute subtask (plan-execute-subtask.md workflow)
        4. Self-critique at steps 5.5 and 6.5
        5. Verify completion (verify-subtask.md workflow)
        6. Create checkpoint on success

        IF failure:
          - Increment attempt count
          - IF attempts < maxRetries: retry
          - ELSE: mark as failed, continue or halt

        IF global timeout exceeded:
          - Mark build as "timed_out"
          - Save state for resume
          - HALT
    outputs:
      - completedSubtasks
      - failedSubtasks
      - totalDuration

  - name: Finalize Build
    action: |
      1. Update build state to "completed" or "failed"
      2. Generate build report
      3. Update story status
      4. Cleanup worktree (if used)
```

---

## Events Emitted

The AutonomousBuildLoop emits these events for monitoring:

| Event              | Payload                       | Description                   |
| ------------------ | ----------------------------- | ----------------------------- |
| BUILD_STARTED      | storyId, totalSubtasks        | Build initialization complete |
| SUBTASK_STARTED    | subtaskId, phase, attempt     | Subtask execution beginning   |
| SUBTASK_COMPLETED  | subtaskId, duration           | Subtask finished successfully |
| SUBTASK_FAILED     | subtaskId, error, willRetry   | Subtask execution failed      |
| CHECKPOINT_CREATED | checkpointId, subtaskId       | Recovery checkpoint saved     |
| BUILD_SUCCESS      | storyId, duration, stats      | All subtasks completed        |
| BUILD_FAILED       | storyId, error, failedSubtask | Build halted due to failure   |
| BUILD_TIMEOUT      | storyId, elapsed, lastSubtask | Global timeout exceeded       |

---

## Output Example

```
🚀 Starting autonomous build for story-8.1

📋 Plan loaded: 12 subtasks
⏱️  Global timeout: 30 minutes
🔄 Max retries: 3

[1/12] Executing: Create component structure
  ✓ Implemented (attempt 1)
  ✓ Self-critique passed
  ✓ Verified
  📌 Checkpoint: cp-1706500000-abc123

[2/12] Executing: Add state management
  ✗ Failed (attempt 1): Type error in reducer
  ✓ Implemented (attempt 2)
  ✓ Self-critique passed
  ✓ Verified
  📌 Checkpoint: cp-1706500060-def456

...

✅ Build completed successfully!
   Duration: 18m 32s
   Subtasks: 12/12 completed
   Retries: 2 total
```

---

## Error Handling

| Error                 | Resolution                                     |
| --------------------- | ---------------------------------------------- |
| Story not found       | Verify story-id and file path                  |
| Plan not found        | Run spec pipeline first to generate plan       |
| Build already running | Wait for completion or use \*build-status      |
| Max retries exceeded  | Review error, fix manually, use \*build-resume |
| Global timeout        | Use \*build-resume to continue                 |

---

## Integration

- **Uses:**
  - `AutonomousBuildLoop` from `core/execution/autonomous-build-loop.js`
  - `BuildStateManager` from `core/execution/build-state-manager.js`
  - `RecoveryTracker` from `infrastructure/scripts/recovery-tracker.js`
- **Tasks:**
  - `plan-execute-subtask.md` - Subtask execution workflow
  - `verify-subtask.md` - Completion verification
- **Checklists:**
  - `self-critique-checklist.md` - Steps 5.5 and 6.5

---

## Related Commands

- `*build-resume {story-id}` - Resume from checkpoint
- `*build-status {story-id}` - Check build progress
- `*build-log {story-id}` - View attempt history
- `*build-cleanup` - Remove abandoned builds

---

_Task file for Story 8.1 - Coder Agent Loop_

## Handoff
next_agent: @qa
next_command: *review {story-id}
condition: Autonomous build completed successfully
alternatives:
  - agent: @dev, command: *build-resume {story-id}, condition: Build failed, needs resume
