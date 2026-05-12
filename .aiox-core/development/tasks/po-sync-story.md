---
tools:
  - pm-tool  # Uses configured PM tool (ClickUp, GitHub, Jira, or local-only)
---

# sync-story

**Purpose:** Synchronize a local story file to the configured PM tool. Works with ClickUp, GitHub Projects, Jira, or local-only mode.

**When to Use:**
- After making changes to story file that need to be synced to PM tool
- When you want to force-push current story state
- After manual edits that bypassed story-manager utilities
- To update PM tool with current story progress

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
task: poSyncStory()
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
  - story_path: 'path/to/story.yaml' # Full path to story YAML file

optional:
  - force: false # If true, sync even if no changes detected
```

## Prerequisites

- Story file must exist
- PM tool configured in `.aiox-pm-config.yaml` (or will use local-only mode)

## Task Execution Steps

### Step 1: Load Story File

- Verify story file exists at provided path
- Read and parse YAML content
- Extract story ID, title, status

### Step 2: Get PM Adapter

```javascript
const { getPMAdapter } = require('../.aiox-core/scripts/pm-adapter-factory');

const adapter = getPMAdapter();
console.log(`Using ${adapter.getName()} adapter`);
```

### Step 3: Sync to PM Tool

```javascript
const result = await adapter.syncStory(storyPath);

if (result.success) {
  console.log(`✅ Story ${storyId} synced successfully`);
  if (result.url) {
    console.log(`   URL: ${result.url}`);
  }
} else {
  console.error(`❌ Sync failed: ${result.error}`);
}
```

### Step 4: Output Results

Display formatted summary:

```markdown
✅ Story {story_id} synchronized to {PM_TOOL}

**PM Tool:** {adapter_name}
**Status:** {story_status}
**URL:** {url} (if available)
**Timestamp:** {current_time}

{Changes synced details}
```

## Error Handling

- **Story file not found**: Display error with correct path
- **PM tool connection failed**: Show error message from adapter
- **Configuration missing**: Inform user to run `aiox init`
- **Sync failed**: Display adapter-specific error message

## Notes

- LocalAdapter (no PM tool) always succeeds (validates YAML only)
- ClickUp adapter preserves backward compatibility with existing workflows
- GitHub adapter creates/updates GitHub issue
- Jira adapter creates/updates Jira issue
- All adapters return consistent {success, url?, error?} format

## Integration with Story Manager

This task can be called directly or via story-manager utilities:

```javascript
const { syncStoryToPM } = require('../.aiox-core/scripts/story-manager');

await syncStoryToPM(storyPath);
```
