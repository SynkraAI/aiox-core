# Dev Task: Register Technical Debt

**Agent:** @dev
**Command:** `*backlog-debt`
**Purpose:** Register technical debt item to backlog
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
task: devBacklogDebt()
responsável: Dex (Builder)
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
  - development
  - code
updated_at: 2025-11-17
```

---


## Task Flow

### 1. Elicit Technical Debt Details
```yaml
elicit: true
questions:
  - Title (1-line description):
    input: text
    validation: min 10 chars, max 100 chars
    example: "Refactor authentication logic to use dependency injection"

  - Detailed Description:
    input: textarea
    validation: max 500 chars
    placeholder: "Describe what needs improvement and why it's considered tech debt"
    example: |
      Current authentication logic has tight coupling to database layer.
      Should use DI pattern to improve testability and maintainability.
      Impacts: auth.js, user-service.js, session-manager.js

  - Priority:
    options:
      - Critical (🔴) - Severe code smell, security risk, or blocking future work
      - High (🟠) - Significant maintainability issue
      - Medium (🟡) - Quality improvement
      - Low (🟢) - Nice-to-have refactoring
    default: Medium
    note: "Be honest about impact - not all debt is critical"

  - Related Story ID (optional):
    input: text
    example: "6.1.2.6"
    note: "Link to story where debt was identified or introduced"

  - Tags (optional, comma-separated):
    input: text
    example: "refactoring, architecture, testing"
    suggestions: [
      "refactoring",
      "architecture",
      "testing",
      "performance",
      "security",
      "duplication",
      "coupling",
      "naming",
      "documentation"
    ]

  - Estimated Effort (optional):
    input: text
    example: "4 hours", "2 days", "1 week"
    default: "TBD"
    note: "Rough estimate helps prioritization"

  - Impact Area (optional):
    input: text
    example: "authentication, user management"
    note: "Which part of codebase affected"
```

### 2. Validate Input
```javascript
// Validate story exists if provided
if (relatedStory) {
  const storyPath = `docs/stories/**/*${relatedStory}*.md`;
  const matches = await glob(storyPath);

  if (matches.length === 0) {
    console.log(`⚠️ Story not found: ${relatedStory}`);
    console.log('   Proceeding without related story link');
    relatedStory = null;
  }

  if (matches.length > 1) {
    console.log('⚠️ Multiple stories matched, using first:');
    matches.forEach(m => console.log(`  - ${m}`));
  }
}

// Parse tags
const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
if (impactArea) {
  tags.push(`area:${impactArea}`);
}
```

### 3. Add to Backlog
```javascript
const { BacklogManager } = require('.aiox-core/scripts/backlog-manager');

const manager = new BacklogManager('docs/stories/backlog.md');
await manager.load();

// Dev always creates Technical Debt type (T)
const item = await manager.addItem({
  type: 'T',  // Technical Debt
  title: title,
  description: description,
  priority: priority,
  relatedStory: relatedStory || null,
  createdBy: '@dev',
  tags: tags,
  estimatedEffort: estimatedEffort
});

console.log(`✅ Technical debt registered: ${item.id}`);
```

### 4. Regenerate Backlog
```javascript
await manager.generateBacklogFile();

console.log('✅ Backlog updated: docs/stories/backlog.md');
```

### 5. Summary Output
```markdown
## 🔧 Technical Debt Registered

**ID:** ${item.id}
**Type:** 🔧 Technical Debt
**Title:** ${title}
**Priority:** ${priorityEmoji} ${priority}
**Related Story:** ${relatedStory || 'None'}
**Estimated Effort:** ${estimatedEffort}
**Impact Area:** ${impactArea || 'Not specified'}
**Tags:** ${tags.join(', ') || 'None'}

**Description:**
${description}

**Next Steps:**
- Review in backlog: docs/stories/backlog.md
- @po will prioritize with `*backlog-prioritize ${item.id}`
- Can be addressed in dedicated refactoring story or alongside related work

${priority === 'Critical'
  ? '⚠️ **CRITICAL DEBT** - Should be addressed soon to prevent blocking future work'
  : ''
}
```

---

## Example Usage

```bash
# During development of Story 6.1.2.6
*backlog-debt

# Example responses:
Title: Add unit tests for decision-log-generator utility
Description: decision-log-generator.js has 0% test coverage. Need comprehensive unit tests for all helper functions (calculateDuration, generateDecisionsList, etc.) and main generateDecisionLog function.
Priority: High
Related Story: 6.1.2.6
Tags: testing, coverage, utilities
Effort: 3 hours
Impact Area: decision logging

# Output:
✅ Technical debt registered: 1763298999001
✅ Backlog updated: docs/stories/backlog.md

🔧 Technical Debt Registered
ID: 1763298999001
Type: 🔧 Technical Debt
Title: Add unit tests for decision-log-generator utility
Priority: 🟠 High
...
```

---

## Dev-Specific Guidelines

1. **Be Proactive** - Register debt when you see it, don't wait
2. **Be Honest** - Not all debt is critical, prioritize accurately
3. **Be Specific** - Include file names, functions, patterns involved
4. **Be Realistic** - Estimate effort to help prioritization
5. **Tag Appropriately** - Use tags for easy filtering later

### When to Register Technical Debt

**DO register:**
- Code duplication across 3+ files
- Missing test coverage for critical paths
- Hard-coded values that should be configurable
- Poor naming that obscures intent
- Tight coupling preventing testability
- Performance bottlenecks
- Security anti-patterns

**DON'T register:**
- Nitpicky style preferences
- Premature optimizations
- "I would have done it differently"
- Normal complexity of business logic

---

## Error Handling

- **Story not found:** Log warning, proceed without link
- **Invalid priority:** Default to Medium
- **Backlog locked:** Retry 3x with 1s delay
- **No description:** Require at least title

---

## Testing

```bash
# Test registration flow
*backlog-debt

# Fill in test data:
Title: Test technical debt item
Description: This is a test debt item
Priority: Low
Related Story: 6.1.2.6
Tags: test
Effort: 1 hour

# Verify:
cat docs/stories/backlog.md
# - Item appears in Technical Debt section
# - Priority sorting correct
# - Tags displayed
# - Related story link works

cat docs/stories/backlog.json
# - Item has type: "T"
# - createdBy: "@dev"
# - All fields populated correctly
```

---

## npm Script Integration

Add to `package.json`:

```json
{
  "scripts": {
    "debt:add": "echo 'Use *backlog-debt command from @dev agent'",
    "debt:review": "node .aiox-core/scripts/backlog-manager.js stats"
  }
}
```

---

**Related Tasks:**
- `develop-story.md` - Main development workflow
- `apply-qa-fixes.md` - Addressing QA feedback
- `po-backlog-review.md` - PO reviews all debt items
