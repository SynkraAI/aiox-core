---
tools:
  - clickup  # Required for ClickUp synchronization
checklists:
  - po-master-checklist.md
---

# sync-story-to-clickup

**Purpose:** Manually force synchronization of a local story file to ClickUp. Use this when you've edited a story file directly (via Edit tool) and need to ensure changes are reflected in ClickUp.

**When to Use:**
- After making changes to story file that didn't automatically sync
- When you want to force-push current story state to ClickUp
- After manual edits that bypassed story-manager utilities
- When sync seems out of date (check frontmatter last_sync timestamp)

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: poSyncStoryToClickup()
responsável: Pax (Balancer)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**
- Break into smaller workflows; implement checkpointing; use async processing where possible

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - product-management
  - planning
updated_at: 2025-11-17
```

---


## Task Inputs

```yaml
required:
  - story_id: '{epic}.{story}' # e.g., "99.2" or "5.2.2"

optional:
  - force: false # If true, sync even if no changes detected
```

## Prerequisites

- Story file must exist in `docs/stories/`
- Story must have ClickUp metadata in frontmatter (clickup.task_id)
- ClickUp MCP tool must be available and authenticated

## Task Execution Steps

### Step 1: Locate Story File

- Find story file in `docs/stories/` matching story_id pattern
- Expected format: `{epic}.{story}.*.md`
- If multiple files found, show list and ask user to clarify
- If no file found, ERROR and exit

### Step 2: Parse Story File

- Read current story file content
- Extract frontmatter with YAML parser
- Verify `clickup.task_id` exists in frontmatter
- If task_id missing:
  - ERROR: "Story has no ClickUp integration metadata"
  - Suggest: Check if story was created via ClickUp workflow
  - EXIT task

### Step 3: Prepare Sync Data

Extract from story file:
- Full markdown content (for description update)
- Current status from frontmatter
- Tasks/checkboxes (for change detection)
- File List section
- Dev Notes section
- Acceptance Criteria section

### Step 4: Sync to ClickUp

**CRITICAL:** Use the story-manager module for proper sync

```javascript
const { saveStoryFile } = require('../../common/scripts/story-manager');

// Read current content
const currentContent = await fs.readFile(storyFilePath, 'utf-8');

// Force sync by re-saving with skipSync=false
await saveStoryFile(storyFilePath, currentContent, false);
```

**What This Does:**
1. Detects changes between previous and current content
2. Updates ClickUp task description with full markdown
3. Updates story-status custom field if status changed
4. Adds changelog comment if tasks completed or files added
5. Updates last_sync timestamp in frontmatter

### Step 5: Verify Sync Success

- Check that last_sync timestamp was updated in frontmatter
- Log sync results:
  - Status changes detected
  - Number of tasks completed
  - Files added
  - Other changes synced

### Step 6: Output Results

Display formatted summary:

```markdown
✅ Story {story_id} synchronized to ClickUp

**Task ID:** {task_id}
**Task URL:** {url}
**Last Sync:** {timestamp}

**Changes Synced:**
- Status: {old_status} → {new_status} (if changed)
- Tasks completed: {count}
- Files added: {count}
- Dev Notes updated: {yes/no}
- Acceptance Criteria updated: {yes/no}

**ClickUp Updates:**
- Task description updated with full story markdown
- story-status custom field updated
- Changelog comment added to task
```

## Error Handling

**Error: Story file not found**
```
❌ Story file not found for ID: {story_id}

Please check:
- Story ID format correct? (e.g., "99.2" not "Story 99.2")
- Story file exists in docs/stories/?
- File naming follows pattern: {epic}.{story}.*.md
```

**Error: No ClickUp metadata**
```
❌ Story has no ClickUp integration

This story was not created via ClickUp workflow and has no task_id.

To integrate with ClickUp:
1. Create ClickUp task manually in Backlog list
2. Add frontmatter metadata:
   clickup:
     task_id: "your-task-id"
     epic_task_id: "parent-epic-id"
     list: "Backlog"
     url: "https://app.clickup.com/t/task-id"
```

**Error: ClickUp API failure**
```
❌ Failed to sync to ClickUp: {error_message}

Please check:
- ClickUp MCP tool is authenticated
- Task ID is valid and accessible
- Network connection is stable
- ClickUp API is operational

You can verify task manually at:
{task_url}
```

**Error: No changes detected (with force=false)**
```
ℹ️  No changes detected - sync not needed

Story is already synchronized with ClickUp.
Last sync: {timestamp}

Use force=true to sync anyway:
*sync-story {story_id} --force
```

## Usage Examples

### Basic Sync
```
*sync-story 99.2
```

### Force Sync (even if no changes)
```
*sync-story 5.2.2 --force
```

### After Manual Edits
```
# Scenario: You used Edit tool to update story file
1. Edit story file with changes
2. Run: *sync-story {story_id}
3. Verify sync success message
4. Check ClickUp UI to confirm updates
```

## Integration Notes

**For PO Agent:**
- Add to po.md commands: `sync-story {story}`: Force sync story to ClickUp
- Use after manual story edits or when validation updates story

**For Dev Agent:**
- Add to dev.md commands: `sync-story {story}`: Force sync story to ClickUp
- Use after marking tasks complete or updating File List

**For QA Agent:**
- Add to qa.md commands: `sync-story {story}`: Force sync story to ClickUp
- Use after adding QA Results section

**Best Practice:**
- Agents should use story-manager utilities when possible (automatic sync)
- Use this task only when direct file edits were made
- Check last_sync timestamp to verify sync freshness

## Technical Implementation

**Dependencies:**
- `common/scripts/story-manager.js` - saveStoryFile function
- `common/scripts/story-update-hook.js` - detectChanges, syncStoryToClickUp
- `common/scripts/clickup-helpers.js` - ClickUp API wrappers
- ClickUp MCP tool (via global.mcp__clickup__* or tool-resolver)

**Process Flow:**
```
Task invoked
    ↓
Read story file
    ↓
Parse frontmatter for task_id
    ↓
Call story-manager.saveStoryFile()
    ↓
    ├─ detectChanges() identifies diffs
    ├─ syncStoryToClickUp() orchestrates updates
    ├─ updateTaskDescription() if AC/content changed
    ├─ updateStoryStatus() if status changed
    └─ addTaskComment() with changelog
    ↓
Update last_sync timestamp
    ↓
Return sync results
```

## Testing This Task

**Manual Test:**
1. Edit Story 99.2 directly (mark a checkbox)
2. Note current last_sync timestamp
3. Run: `*sync-story 99.2`
4. Verify:
   - last_sync timestamp updated
   - ClickUp task shows changelog comment
   - Checkbox change reflected in ClickUp
   - Task description updated

**Automated Test:** `tests/tasks/sync-story-to-clickup.test.js`

---

*Task created to provide manual sync control for ClickUp integration*
