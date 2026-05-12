# PO Task: Add Backlog Item

**Agent:** @po
**Command:** `*backlog-add`
**Purpose:** Add item to story backlog (follow-up, technical debt, or enhancement)
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
task: poBacklogAdd()
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

### 1. Elicit Item Details
```yaml
elicit: true
questions:
  - Type of item?
    options:
      - F: Follow-up (📌) - Post-story action item
      - T: Technical Debt (🔧) - Code quality or architecture improvement
      - E: Enhancement (✨) - Feature improvement or optimization

  - Title (1-line description):
    input: text
    validation: min 10 chars, max 100 chars

  - Detailed Description (optional):
    input: textarea
    validation: max 500 chars

  - Priority:
    options:
      - Critical (🔴)
      - High (🟠)
      - Medium (🟡)
      - Low (🟢)
    default: Medium

  - Related Story ID (optional):
    input: text
    example: "6.1.2.6"
    validation: story file must exist if provided

  - Tags (optional, comma-separated):
    input: text
    example: "testing, performance, security"

  - Estimated Effort (optional):
    input: text
    example: "2 hours", "1 day", "1 week"
    default: "TBD"
```

### 2. Validate Input
```javascript
// Validate story exists if relatedStory provided
if (relatedStory) {
  const storyPath = `docs/stories/**/*${relatedStory}*.md`;
  const matches = await glob(storyPath);

  if (matches.length === 0) {
    throw new Error(`Story not found: ${relatedStory}`);
  }

  if (matches.length > 1) {
    console.log('⚠️ Multiple stories matched, using first:');
    matches.forEach(m => console.log(`  - ${m}`));
  }
}

// Parse tags
const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
```

### 3. Add Item to Backlog
```javascript
const { BacklogManager } = require('.aiox-core/scripts/backlog-manager');

const manager = new BacklogManager('docs/stories/backlog.md');
await manager.load();

const item = await manager.addItem({
  type: itemType,
  title: title,
  description: description || '',
  priority: priority,
  relatedStory: relatedStory || null,
  createdBy: '@po',
  tags: tags,
  estimatedEffort: estimatedEffort
});

console.log(`✅ Backlog item added: ${item.id}`);
console.log(`   Type: ${itemType} | Priority: ${priority}`);
console.log(`   ${title}`);
```

### 4. Regenerate Backlog File
```javascript
await manager.generateBacklogFile();

console.log('✅ Backlog updated: docs/stories/backlog.md');
```

### 5. Summary Output
```markdown
## 🎯 Backlog Item Added

**ID:** ${item.id}
**Type:** ${itemTypeEmoji} ${itemTypeName}
**Title:** ${title}
**Priority:** ${priorityEmoji} ${priority}
**Related Story:** ${relatedStory || 'None'}
**Estimated Effort:** ${estimatedEffort}
**Tags:** ${tags.join(', ') || 'None'}

**Next Steps:**
- Review in backlog: docs/stories/backlog.md
- Prioritize with `*backlog-prioritize ${item.id}`
- Schedule with `*backlog-schedule ${item.id}`
```

---

## Example Usage

```bash
# Interactive mode (recommended)
*backlog-add

# Example responses:
Type: F
Title: Add integration tests for story index generator
Description: Story 6.1.2.6 implementation needs integration tests
Priority: High
Related Story: 6.1.2.6
Tags: testing, integration, story-6.1.2.6
Effort: 3 hours
```

---

## Error Handling

- **Story not found:** Warn user, allow to proceed without related story
- **Invalid type:** Show valid options (F, T, E)
- **Invalid priority:** Default to Medium
- **Backlog file locked:** Retry 3x with 1s delay

---

## Testing

```bash
# Test with sample data
*backlog-add
# Fill in sample data and verify:
# - Item added to docs/stories/backlog.json
# - Backlog file regenerated at docs/stories/backlog.md
# - Item appears in correct section by type
# - Priority sorting works
```

---

**Related Tasks:**
- `po-stories-index.md` - Regenerate story index
- `po-backlog-review.md` - Review and prioritize backlog
- `po-backlog-schedule.md` - Schedule backlog items
