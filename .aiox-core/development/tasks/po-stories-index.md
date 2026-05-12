# PO Task: Regenerate Story Index

**Agent:** @po
**Command:** `*stories-index`
**Purpose:** Regenerate story index from docs/stories/ directory
**Created:** 2025-01-16 (Story 6.1.2.6)

---

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
task: poStoriesIndex()
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


## Task Flow

### 1. Confirm Regeneration
```yaml
elicit: true
question: "Regenerate story index? This will scan all stories and update docs/stories/index.md"
options:
  - yes: Proceed with regeneration
  - no: Cancel operation
  - preview: Show current stats without writing
```

### 2. Generate Story Index
```javascript
const { generateStoryIndex } = require('.aiox-core/scripts/story-index-generator');

console.log('📚 Scanning stories directory...');

const result = await generateStoryIndex('docs/stories');

console.log(`✅ Story index generated`);
console.log(`   Total Stories: ${result.totalStories}`);
console.log(`   Output: ${result.outputPath}`);
```

### 3. Display Summary
```markdown
## 📊 Story Index Updated

**Total Stories:** ${totalStories}
**Output File:** docs/stories/index.md

**Stories by Epic:**
${epics.map(epic => `- ${epic.name}: ${epic.count} stories`).join('\n')}

**Stories by Status:**
${statuses.map(status => `- ${status.emoji} ${status.name}: ${status.count}`).join('\n')}

**Next Steps:**
- Review index: docs/stories/index.md
- Use `*backlog-review` to see backlog items
- Use `*create-story` to add new stories
```

### 4. Preview Mode (if selected)
```javascript
if (mode === 'preview') {
  const stories = await scanStoriesDirectory('docs/stories');

  console.log('\n📊 Story Index Preview');
  console.log(`   Total Stories: ${stories.length}`);

  const grouped = groupStoriesByEpic(stories);
  Object.entries(grouped).forEach(([epic, items]) => {
    console.log(`   ${epic}: ${items.length} stories`);
  });

  console.log('\nRun with "yes" to generate index file.');
  return;
}
```

---

## Example Usage

```bash
# Interactive mode
*stories-index
> yes

# Expected output:
📚 Scanning stories directory...
✅ Found 70 stories
✅ Story index generated: docs/stories/index.md

📊 Story Index Updated
Total Stories: 70
Output File: docs/stories/index.md

Stories by Epic:
- Epic 6.1 AIOX Migration: 45 stories
- Epic 3 Gap Remediation: 20 stories
- Unassigned: 5 stories
```

---

## Error Handling

- **No stories found:** Warn user, create empty index
- **Invalid story metadata:** Log warnings, skip malformed stories
- **Permission denied:** Check file permissions on docs/stories/
- **Write failed:** Verify docs/stories/ directory exists

---

## Testing

```bash
# Test regeneration
*stories-index
> preview  # Check counts without writing

*stories-index
> yes      # Generate full index

# Verify:
cat docs/stories/index.md
# - Total stories count matches directory scan
# - Stories grouped by epic correctly
# - All story links work
# - Status/priority emojis display correctly
```

---

## npm Script Integration

Add to `package.json`:

```json
{
  "scripts": {
    "stories:index": "node .aiox-core/scripts/story-index-generator.js docs/stories"
  }
}
```

Usage:
```bash
npm run stories:index
```

---

**Related Tasks:**
- `po-backlog-add.md` - Add backlog items
- `po-create-story.md` - Create new stories
- `story-index-generator.js` - Core generator utility
