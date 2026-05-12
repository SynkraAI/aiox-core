---
tools:
  - clickup  # Required for ClickUp integration
checklists:
  - po-master-checklist.md
---

# pull-story-from-clickup

**Purpose:** Pull complete story updates from ClickUp to local file, including task completions, description changes, and status updates. This is the **reverse direction** of sync-story-to-clickup.

**When to Use:**
- After making changes directly in ClickUp UI (marking checkboxes, updating description)
- When you need to pull latest state from ClickUp to continue work locally
- After collaborators update the ClickUp task
- To resolve sync conflicts (ClickUp is the source of truth)

**Important:** This overwrites local changes with ClickUp data. Use carefully if you have uncommitted local edits.

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
task: poPullStoryFromClickup()
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
  - force: false # If true, pull even if last_sync indicates local is newer
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

### Step 2: Get ClickUp Task Data

```javascript
const clickupTool = await getClickUpTool();

// Get complete task data including description
const task = await clickupTool.getTask({
  taskId: storyData.frontmatter.clickup.task_id
});
```

**What to extract from ClickUp task:**
- Task description (contains full story markdown)
- Story-status custom field
- Task native status
- Tags
- Custom fields (epic_number, story_number, story_file_path)

### Step 3: Parse ClickUp Description

The ClickUp task description contains the **complete story markdown**. We need to:

1. Extract the markdown from `task.description`
2. Parse sections:
   - Story Statement
   - Context
   - Acceptance Criteria (with checkboxes)
   - Tasks/Subtasks (with checkboxes)
   - Dev Notes
   - Testing
   - File List
   - QA Results
   - Notes
   - Change Log

3. **Critical:** Preserve checkbox states from ClickUp
   - `- [x] Task` = completed
   - `- [ ] Task` = pending

### Step 4: Merge with Local Frontmatter

**DO NOT overwrite entire file** - preserve frontmatter structure:

```javascript
const localFrontmatter = storyData.frontmatter;
const clickupFrontmatter = {
  version: localFrontmatter.version,
  story_id: localFrontmatter.story_id,
  epic_id: localFrontmatter.epic_id,
  title: task.name,
  status: mapStatusFromClickUp(task.custom_fields.find(f => f.name === 'story-status').value),
  created: localFrontmatter.created,
  updated: new Date().toISOString().split('T')[0], // Today's date
  clickup: {
    task_id: task.id,
    epic_task_id: task.parent,
    list: task.list.name,
    list_id: task.list.id,
    url: task.url,
    last_sync: new Date().toISOString(),
    custom_fields: {
      epic_number: task.custom_fields.find(f => f.name === 'epic-number')?.value || localFrontmatter.clickup.custom_fields.epic_number,
      story_number: task.custom_fields.find(f => f.name === 'story-number')?.value || localFrontmatter.clickup.custom_fields.story_number,
      story_file_path: task.custom_fields.find(f => f.name === 'story-file-path')?.value || localFrontmatter.clickup.custom_fields.story_file_path,
      'story-status': task.custom_fields.find(f => f.name === 'story-status')?.value
    }
  },
  tags: task.tags.map(t => t.name)
};
```

### Step 5: Reconstruct Story File

Build complete story markdown:

```markdown
# Story {story_id}: {title}

```yaml
{frontmatter}
```

{story body from ClickUp description}
```

**Important:** Use the ClickUp description as the **source of truth** for the story body.

### Step 6: Write Updated Story File

```javascript
const { saveStoryFile } = require('../../common/scripts/story-manager');

// Save with skipSync=true to avoid circular sync
await saveStoryFile(storyFilePath, newContent, true);
```

**Why skipSync=true?**
- We just pulled from ClickUp, so we don't want to immediately push back
- Prevents infinite sync loops

### Step 7: Display Sync Summary

```markdown
✅ Story {story_id} pulled from ClickUp

**Task ID:** {task_id}
**Task URL:** {url}
**Last Sync:** {timestamp}

**Changes Pulled:**
- Status: {old_status} → {new_status} (if changed)
- Tasks completed: {count of checkboxes changed from [ ] to [x]}
- Tasks reopened: {count of checkboxes changed from [x] to [ ]}
- Description updated: {yes/no}
- Tags updated: {changes}

**Local File Updated:**
- Frontmatter: ✓
- Story Body: ✓
- Checkbox States: ✓
- Last Sync Timestamp: ✓
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
Cannot pull from ClickUp without task_id in frontmatter.
```

**Error: ClickUp task not found**
```
❌ ClickUp task not found: {task_id}

Possible reasons:
- Task was deleted from ClickUp
- Task ID is incorrect in frontmatter
- You don't have access to this task
- ClickUp API authentication failed

Verify task exists: {task_url}
```

**Error: Description empty or malformed**
```
❌ ClickUp task description is empty or malformed

The task description should contain the full story markdown.
This may indicate:
- Task was created manually in ClickUp (not via story-manager)
- Description was accidentally cleared
- Task needs to be synced from local first

Recommendation:
1. Run: *sync-story {story_id}
2. Then try pulling again
```

## Usage Examples

### Basic Pull
```
*pull-story 99.2
```

### Force Pull (even if local is newer)
```
*pull-story 5.2.2 --force
```

### After ClickUp Updates
```
# Scenario: You marked checkboxes in ClickUp UI
1. Run: *pull-story {story_id}
2. Review changes shown in summary
3. Local file now matches ClickUp
4. Continue working locally
```

## Integration Notes

**For PO Agent:**
- Add to po.md commands: `pull-story {story}`: Pull story updates from ClickUp
- Use after collaborators update ClickUp tasks
- Use before starting validation if task was modified in ClickUp

**For Dev Agent:**
- Add to dev.md commands: `pull-story {story}`: Pull story updates from ClickUp
- Use at start of work session to get latest state
- Use after QA or PO updates task in ClickUp

**For QA Agent:**
- Add to qa.md commands: `pull-story {story}`: Pull story updates from ClickUp
- Use before starting review to get latest state
- Use after Dev marks tasks complete in ClickUp

**Best Practice:**
- Pull at the **start** of work sessions
- Push (*sync-story) at the **end** of work sessions
- ClickUp is the source of truth for collaborative updates
- Local file is the source of truth for agent work

## Workflow Examples

### Collaborative Workflow
```
1. PO updates story in ClickUp UI (adds acceptance criteria)
2. Dev pulls story: *pull-story 5.2.2
3. Dev implements locally, marks tasks done
4. Dev pushes to ClickUp: *sync-story 5.2.2
5. QA pulls latest: *pull-story 5.2.2
6. QA reviews and updates locally
7. QA pushes results: *sync-story 5.2.2
```

### Conflict Resolution
```
# If local and ClickUp diverged:

Option 1: ClickUp wins (recommended for collaborative work)
*pull-story 5.2.2 --force

Option 2: Local wins (when you have important uncommitted work)
*sync-story 5.2.2 --force

Option 3: Manual merge (complex changes)
1. Backup local file
2. Pull from ClickUp
3. Compare with backup
4. Manually merge important changes
5. Push back to ClickUp
```

## Technical Implementation

**Dependencies:**
- `common/scripts/story-manager.js` - saveStoryFile, parseStoryFile
- `common/scripts/status-mapper.js` - mapStatusFromClickUp
- ClickUp MCP tool (via global.mcp__clickup__* or tool-resolver)

**Process Flow:**
```
Task invoked
    ↓
Read local story file
    ↓
Extract task_id from frontmatter
    ↓
Fetch complete task from ClickUp (via MCP tool)
    ↓
Parse ClickUp description (story markdown)
    ↓
Merge frontmatter (preserve local structure, update from ClickUp)
    ↓
Reconstruct complete story file
    ↓
    ├─ Frontmatter (merged)
    ├─ Story body (from ClickUp description)
    └─ Checkbox states (from ClickUp description)
    ↓
Write to local file (skipSync=true)
    ↓
Display sync summary
```

## Testing This Task

**Manual Test:**
1. Mark checkboxes in ClickUp UI for Story 99.2
2. Run: `*pull-story 99.2`
3. Verify:
   - Checkboxes updated in local file
   - last_sync timestamp updated
   - Status changes reflected
   - Summary shows correct change count

**Automated Test:** `tests/tasks/pull-story-from-clickup.test.js`

---

*Task created to provide reverse synchronization from ClickUp to local story files*
