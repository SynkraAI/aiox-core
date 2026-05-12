---
title: Orchestrate Status
description: Show orchestrator status for a story
agent: aiox-master
version: 1.0.0
story: '0.9'
epic: '0'
---

# \*orchestrate-status Command

Shows the current status of orchestrator execution for a story.

## Usage

```
*orchestrate-status {story-id}
```

## Examples

```bash
# Show status for STORY-42
*orchestrate-status STORY-42
```

## Output

```
📊 Orchestrator Status: STORY-42
═══════════════════════════════════════

State: in_progress
Current Epic: 4 (Execution Engine)
Progress: 45%

Epic Status:
  ✅ Epic 3: Spec Pipeline - completed
  ⏳ Epic 4: Execution Engine - in_progress (60%)
  ⏸️ Epic 6: QA Loop - pending
  ⏸️ Epic 7: Memory Layer - pending

Started: 2026-01-29 10:00:00
Updated: 2026-01-29 11:30:00
Duration: 1h 30m

Errors: 0
Blocked: No
```

## Behavior

1. Reads state from `.aiox/master-orchestrator/{story-id}.json`
2. Reads dashboard status from `.aiox/dashboard/status.json`
3. Formats and displays current status
4. Shows epic progress breakdown
5. Lists any errors or warnings

## Exit Codes

- 0: Success
- 1: Story not found
- 3: Invalid arguments
