# Build Recovery Guide

> **Story:** 8.4 - Build Recovery & Resume
> **Epic:** Epic 8 - Autonomous Build Engine

---

## Overview

The Build Recovery system enables autonomous builds to resume from checkpoints after failures or interruptions. Instead of starting over, builds continue from the last successful point.

---

## Key Features

| Feature                   | Description                              |
| ------------------------- | ---------------------------------------- |
| **Checkpoints**           | Auto-saved after each subtask completion |
| **Resume**                | Continue from last checkpoint            |
| **Status Monitoring**     | Real-time build progress                 |
| **Abandoned Detection**   | Alerts for stale builds (>1 hour)        |
| **Failure Notifications** | Alerts when stuck or max iterations      |
| **Attempt Logging**       | Complete history for debugging           |

---

## Commands

### Check Build Status

```bash
# Single build
*build-status story-8.4

# All active builds
*build-status --all
```

### Resume Failed Build

```bash
*build-resume story-8.4
```

### View Attempt Log

```bash
*build-log story-8.4

# Filter by subtask
*build-log story-8.4 --subtask 2.1

# Limit output
*build-log story-8.4 --limit 20
```

### Cleanup Abandoned Builds

```bash
*build-cleanup story-8.4

# Force cleanup (even active builds)
*build-cleanup story-8.4 --force
```

---

## Build State Schema

Build state is stored in `plan/build-state.json`:

```json
{
  "storyId": "story-8.4",
  "status": "in_progress",
  "startedAt": "2026-01-29T10:00:00Z",
  "lastCheckpoint": "2026-01-29T11:30:00Z",
  "currentPhase": "phase-2",
  "currentSubtask": "2.3",
  "completedSubtasks": ["1.1", "1.2", "2.1", "2.2"],
  "checkpoints": [...],
  "metrics": {
    "totalSubtasks": 10,
    "completedSubtasks": 4,
    "totalAttempts": 6,
    "totalFailures": 2
  }
}
```

---

## Status Values

| Status        | Description                   |
| ------------- | ----------------------------- |
| `pending`     | Build created but not started |
| `in_progress` | Build currently running       |
| `paused`      | Build manually paused         |
| `abandoned`   | No activity for >1 hour       |
| `failed`      | Build failed (can resume)     |
| `completed`   | Build finished successfully   |

---

## Checkpoint System

Checkpoints are automatically saved after each subtask completion:

```
plan/
├── build-state.json        # Main state file
├── build-attempts.log      # Attempt log
└── checkpoints/            # Checkpoint snapshots
    ├── cp-lxyz123-abc.json
    ├── cp-lxyz124-def.json
    └── ...
```

Each checkpoint contains:

- Timestamp
- Subtask ID
- Git commit (if available)
- Files modified
- Duration and attempt count

---

## Integration with Epic 5

Build Recovery integrates with the Recovery System (Epic 5):

| Component             | Usage                     |
| --------------------- | ------------------------- |
| `stuck-detector.js`   | Detects circular failures |
| `recovery-tracker.js` | Tracks attempt history    |

When builds get stuck (3+ consecutive failures), the system:

1. Generates suggestions based on error patterns
2. Creates notification for human review
3. Marks subtask as "stuck"

---

## Abandoned Build Detection

Builds are marked abandoned if:

- Status is `in_progress`
- No checkpoint for >1 hour (configurable)

To detect and handle:

```bash
# Check if abandoned
*build-status story-8.4  # Shows warning if abandoned

# Cleanup
*build-cleanup story-8.4
```

---

## Programmatic Usage

```javascript
const { BuildStateManager, BuildStatus } = require('.aiox-core/core/execution/build-state-manager');

// Create manager
const manager = new BuildStateManager('story-8.4', {
  planDir: './plan',
});

// Create or load state
const state = manager.loadOrCreateState({ totalSubtasks: 10 });

// Start subtask
manager.startSubtask('1.1', { phase: 'phase-1' });

// Complete subtask (auto-checkpoint)
manager.completeSubtask('1.1', {
  duration: 5000,
  filesModified: ['src/file.js'],
});

// Record failure
const result = manager.recordFailure('1.2', {
  error: 'TypeScript error',
  attempt: 1,
});

// Check if stuck
if (result.isStuck) {
  console.log('Suggestions:', result.suggestions);
}

// Resume build
const context = manager.resumeBuild();

// Get status
const status = manager.getStatus();
console.log(`Progress: ${status.progress.percentage}%`);
```

---

## Configuration

Default configuration can be overridden:

```javascript
const manager = new BuildStateManager('story-8.4', {
  config: {
    maxIterations: 10, // Max attempts per subtask
    globalTimeout: 1800000, // 30 minutes
    abandonedThreshold: 3600000, // 1 hour
    autoCheckpoint: true, // Auto-save checkpoints
  },
});
```

---

## Troubleshooting

### "No build state found"

Build hasn't started yet. Run `*build story-id` to start.

### "Build already completed"

Cannot resume completed builds. Start a new build if needed.

### "Worktree missing"

The isolated worktree was deleted. Options:

1. Recreate worktree and resume
2. Start fresh with new build

### Build Stuck

If build is stuck (same error repeating):

1. Check suggestions in notifications
2. Review attempt log: `*build-log story-id`
3. Try different approach or escalate

---

## Best Practices

1. **Check status regularly** during long builds
2. **Review logs** when debugging failures
3. **Cleanup abandoned builds** to free resources
4. **Use checkpoints** - don't disable auto-checkpoint
5. **Monitor notifications** for stuck alerts

---

_Guide for Story 8.4 - Build Recovery & Resume_
_Part of Epic 8 - Autonomous Build Engine_
