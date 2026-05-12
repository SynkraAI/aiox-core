---
title: Orchestrate Stop
description: Stop orchestrator execution for a story
agent: aiox-master
version: 1.0.0
story: '0.9'
epic: '0'
---

# \*orchestrate-stop Command

Stops the orchestrator execution for a story.

## Usage

```
*orchestrate-stop {story-id}
```

## Examples

```bash
# Stop STORY-42 execution
*orchestrate-stop STORY-42
```

## Output

```
🛑 Stopping orchestrator for STORY-42...

Current state: in_progress
Current epic: 4

Saving state for resume...
State saved at: .aiox/master-orchestrator/STORY-42.json

✅ Orchestrator stopped successfully.
   Run *orchestrate-resume STORY-42 to continue.
```

## Behavior

1. Locates running orchestrator for story
2. Gracefully stops current epic execution
3. Saves current state for resume
4. Updates dashboard status to "stopped"
5. Sends notification

## Exit Codes

- 0: Success
- 1: Story not found or not running
- 3: Invalid arguments
