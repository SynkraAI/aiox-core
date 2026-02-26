# Develop Story Task

## Purpose

Execute story development with selectable automation modes to accommodate different developer preferences, skill levels, and story complexity.

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

**Usage**:
```
*develop {story-id}           # Uses interactive mode (default)
*develop {story-id} yolo      # Uses YOLO mode
*develop {story-id} preflight # Uses pre-flight planning mode
```

**Edge Case Handling**:
- Invalid mode → Default to interactive with warning
- User cancellation → Exit gracefully with message
- Missing story file → Clear error message, halt execution
- Backward compatibility → Stories without mode parameter use interactive

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: devDevelopStory()
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

## Constitutional Gates

> **Reference:** Constitution Articles I, III
> **Enforcement:** Automatic validation before execution

### Gate 1: Story-Driven Development (Article III)

```yaml
constitutional_gate:
  article: III
  name: Story-Driven Development
  severity: BLOCK

  validation:
    - Story file MUST exist at docs/stories/{storyId}/story.yaml
    - Story MUST have status != "Draft" (Ready, In Progress, or Done)
    - Story MUST have acceptance criteria defined
    - Story MUST have at least one task/subtask

  on_violation:
    action: BLOCK
    message: |
      CONSTITUTIONAL VIOLATION: Article III - Story-Driven Development
      Cannot develop without a valid story.

      Issue: {violation_details}

      Resolution: Create or update story via @sm *draft or @po *create-story
```

### Gate 2: CLI First (Article I)

```yaml
constitutional_gate:
  article: I
  name: CLI First
  severity: WARN

  validation:
    - If story involves new functionality:
      - CLI implementation SHOULD exist or be created first
      - UI components SHOULD NOT be created before CLI is functional

  on_violation:
    action: WARN
    message: |
      CONSTITUTIONAL WARNING: Article I - CLI First
      UI implementation detected without CLI foundation.

      Reminder: CLI First → Observability Second → UI Third

      Continue anyway? (This will be logged)
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Constitutional gates passed (Article III: Story exists, Article I: CLI First check)
    tipo: constitutional-gate
    blocker: true
    validação: |
      Verify story exists and has valid structure
    error_message: "Constitutional violation - see gate output above"

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

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** abort

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


## Mode: YOLO (Autonomous)

### Workflow

**CRITICAL: Decision Logging Integration (Story 6.1.2.6.2 Phase 2)**

Before starting, load decision logging infrastructure:
```javascript
const {
  initializeDecisionLogging,
  recordDecision,
  trackFile,
  trackTest,
  completeDecisionLogging
} = require('./.aios-core/scripts/decision-recorder');
```

1. **Initialization** (On Yolo Mode Start)
   - Read story file completely
   - Extract story path from context
   - **Initialize decision logging**:
     ```javascript
     const context = await initializeDecisionLogging('dev', storyPath, {
       agentLoadTime: loadTimeInMs  // From agent startup metrics
     });
     ```
   - Identify all tasks and acceptance criteria
   - Analyze technical requirements

2. **Task Execution** (Autonomous loop)
   - Read next task
   - **Make autonomous decisions** and LOG immediately:

     **Architecture choices**:
     ```javascript
     recordDecision({
       description: 'Use microservices architecture for user service',
       reason: 'Better scalability and independent deployment',
       alternatives: ['Monolithic architecture', 'Serverless functions'],
       type: 'architecture',
       priority: 'high'
     });
     ```

     **Library selections**:
     ```javascript
     recordDecision({
       description: 'Use Axios for HTTP client',
       reason: 'Better error handling, interceptor support, TypeScript definitions',
       alternatives: ['Fetch API (native)', 'Got library', 'node-fetch'],
       type: 'library-choice',
       priority: 'medium'
     });
     ```

     **Algorithm implementations**:
     ```javascript
     recordDecision({
       description: 'Use binary search for user lookup',
       reason: 'O(log n) performance vs O(n) linear search',
       alternatives: ['Linear search', 'Hash map lookup'],
       type: 'algorithm',
       priority: 'medium'
     });
     ```

   - Implement task and subtasks
   - **Track file modifications**:
     ```javascript
     trackFile('src/api/users.js', 'created');
     trackFile('package.json', 'modified');
     trackFile('src/legacy/old-api.js', 'deleted');
     ```

   - Write tests
   - Execute validations
   - **Track test execution**:
     ```javascript
     trackTest({
       name: 'users.test.js',
       passed: true,
       duration: 125  // milliseconds
     });
     ```

   - Mark task complete [x] only if ALL validations pass
   - Update File List

3. **Decision Logging** (Automatic)
   - All decisions tracked in memory during execution
   - File operations logged automatically
   - Test results recorded
   - Metrics collected (execution time, agent load time)
   - **Format**: ADR (Architecture Decision Record) compliant
   - **No manual logging needed** - use API only

4. **Completion** (On Yolo Mode Completion)
   - All tasks complete
   - All tests pass
   - Execute story-dod-checklist
   - Set status: "Ready for Review"
   - **Generate decision log**:
     ```javascript
     const logPath = await completeDecisionLogging(storyId, 'completed');
     console.log(`📝 Decision log saved: ${logPath}`);
     ```
   - **Summary**: Decision log summary displayed automatically
   - Log file: `.ai/decision-log-{story-id}.md` (ADR format)

**User Prompts**: 0-1 (only if blocking issue requires approval)

---

## Mode: Interactive (Balanced) **[DEFAULT]**

### Workflow

1. **Story Analysis** (With User)
   - Read story file completely
   - Present summary of tasks and AC
   - Confirm understanding with user

2. **Task Execution** (Interactive loop)
   - Read next task
   - **Decision Checkpoints** (Prompt user at):
     - Architecture decisions (e.g., "Use microservices or monolith?")
     - Library selections (e.g., "Use Axios or Fetch?")
     - Algorithm choices (e.g., "Use BFS or DFS for graph traversal?")
     - Testing approaches (e.g., "Unit tests or integration tests first?")

   - **Educational Explanations**:
     - Before each decision: Explain the options and trade-offs
     - After user choice: Explain why it's a good fit for this context
     - During implementation: Explain what you're doing and why

   - Implement task and subtasks
   - Write tests
   - Execute validations
   - Show results to user before marking [x]
   - Update File List

3. **Completion**
   - All tasks complete
   - All tests pass
   - Execute story-dod-checklist
   - Present completion summary to user
   - Set status: "Ready for Review"

**User Prompts**: 5-10 (balanced for control and speed)

---

## Mode: Pre-Flight Planning (Comprehensive)

### Workflow

1. **Story Analysis Phase**
   - Read story file completely
   - **Identify all ambiguities**:
     - Missing technical specifications
     - Unspecified library choices
     - Unclear acceptance criteria
     - Undefined edge case handling
     - Missing testing guidance

2. **Questionnaire Generation**
   - Generate comprehensive questions covering:
     - Architecture decisions
     - Library and framework choices
     - Algorithm and data structure selections
     - Testing strategy
     - Edge case handling
     - Performance requirements
     - Security considerations

   - Present all questions to user at once
   - Collect all responses in batch

3. **Execution Plan Creation**
   - Create detailed execution plan with all decisions documented
   - Present plan to user for approval
   - Wait for user confirmation before proceeding

4. **Zero-Ambiguity Execution**
   - Execute tasks with full context from questionnaire
   - No additional decision points (all decided in pre-flight)
   - Implement task and subtasks
   - Write tests
   - Execute validations
   - Mark task complete [x] only if ALL validations pass
   - Update File List

5. **Completion**
   - All tasks complete
   - All tests pass
   - Execute story-dod-checklist
   - Present execution summary vs. plan
   - Set status: "Ready for Review"

**User Prompts**: All upfront (questionnaire phase), then 0 during execution

---

## Common Workflow (All Modes)

### Order of Execution

1. Read (first or next) task
2. **Code Intelligence Check (IDS G4)** — Before creating new files or functions:
   - If code intelligence is available (`isCodeIntelAvailable()` from `.aios-core/core/code-intel`):
     - Call `checkBeforeWriting(fileName, description)` from `.aios-core/core/code-intel/helpers/dev-helper`
     - If result is not null, display as **"Code Intelligence Suggestion"** (non-blocking advisory)
     - Log suggestion in decision-log if in YOLO mode
   - If code intelligence is NOT available: skip silently (zero impact on workflow)
3. Implement task and its subtasks
4. Write tests
5. Execute validations
6. **Only if ALL pass**: Mark task checkbox [x]
7. Update story File List (ensure all created/modified/deleted files listed)
8. Repeat until all tasks complete

### Story File Updates (All Modes)

**CRITICAL**: ONLY update these sections:
- Tasks / Subtasks checkboxes
- Dev Agent Record section and all subsections
- Agent Model Used
- Debug Log References
- Completion Notes List
- File List
- Change Log (add entry on completion)
- Status (set to "Ready for Review" when complete)

**DO NOT modify**: Story, Acceptance Criteria, Dev Notes, Testing sections

### Blocking Conditions (All Modes)

**HALT and ask user if**:
- Unapproved dependencies needed
- Ambiguous requirements after checking story
- 3 failures attempting to implement or fix something
- Missing configuration
- Failing regression tests

### Ready for Review Criteria (All Modes)

- Code matches all requirements
- All validations pass
- Follows coding standards
- File List is complete and accurate

### Completion Checklist (All Modes)

1. All tasks and subtasks marked [x]
2. All have corresponding tests
3. All validations pass
4. Full regression test suite passes
5. File List is complete
6. **Execute CodeRabbit Self-Healing Loop** (see below)
7. Execute `.aios-core/product/checklists/story-dod-checklist.md`
8. Set story status: "Ready for Review"
9. HALT (do not proceed further)

---

## CodeRabbit Self-Healing Loop (Story 6.3.3)

**Purpose**: Catch and auto-fix code quality issues before marking story as "Ready for Review"

**Configuration**: Light self-healing (max 2 iterations, CRITICAL issues only)

### When to Execute

Execute **AFTER** all tasks are complete but **BEFORE** running the DOD checklist.

### Self-Healing Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                  CODERABBIT SELF-HEALING                     │
│                   (Light Mode - @dev)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  iteration = 0                                               │
│  max_iterations = 2                                          │
│                                                              │
│  WHILE iteration < max_iterations:                           │
│    ┌────────────────────────────────────────────────────┐   │
│    │ 1. Run CodeRabbit CLI                              │   │
│    │    wsl bash -c 'cd /mnt/c/.../aios-core &&    │   │
│    │    ~/.local/bin/coderabbit --prompt-only           │   │
│    │    -t uncommitted'                                  │   │
│    │                                                     │   │
│    │ 2. Parse output for severity levels                │   │
│    └────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│    ┌────────────────────────────────────────────────────┐   │
│    │ IF no CRITICAL issues:                             │   │
│    │   - Document HIGH issues in story Dev Notes        │   │
│    │   - Log: "✅ CodeRabbit passed"                    │   │
│    │   - BREAK → Proceed to DOD checklist               │   │
│    └────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│    ┌────────────────────────────────────────────────────┐   │
│    │ IF CRITICAL issues found:                          │   │
│    │   - Attempt auto-fix for each issue                │   │
│    │   - iteration++                                    │   │
│    │   - CONTINUE loop                                  │   │
│    └────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  IF iteration == 2 AND CRITICAL issues remain:              │
│    - Log: "❌ CRITICAL issues remain"                       │
│    - HALT and report to user                                │
│    - DO NOT mark story complete                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Implementation Code

```javascript
async function runCodeRabbitSelfHealing(storyPath) {
  const maxIterations = 2;
  let iteration = 0;

  console.log('🐰 Starting CodeRabbit Self-Healing Loop...');
  console.log(`   Mode: Light (CRITICAL only)`);
  console.log(`   Max Iterations: ${maxIterations}\n`);

  while (iteration < maxIterations) {
    console.log(`📋 Iteration ${iteration + 1}/${maxIterations}`);

    // Run CodeRabbit CLI
    const output = await runCodeRabbitCLI('uncommitted');
    const issues = parseCodeRabbitOutput(output);

    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    const highIssues = issues.filter(i => i.severity === 'HIGH');

    console.log(`   Found: ${criticalIssues.length} CRITICAL, ${highIssues.length} HIGH`);

    // No CRITICAL issues = success
    if (criticalIssues.length === 0) {
      if (highIssues.length > 0) {
        console.log(`\n📝 Documenting ${highIssues.length} HIGH issues in story Dev Notes...`);
        await documentIssuesInStory(storyPath, highIssues);
      }
      console.log('\n✅ CodeRabbit Self-Healing: PASSED');
      return { success: true, iterations: iteration + 1 };
    }

    // Attempt auto-fix for CRITICAL issues
    console.log(`\n🔧 Attempting auto-fix for ${criticalIssues.length} CRITICAL issues...`);
    for (const issue of criticalIssues) {
      await attemptAutoFix(issue);
    }

    iteration++;
  }

  // Max iterations reached with CRITICAL issues
  console.log('\n❌ CodeRabbit Self-Healing: FAILED');
  console.log(`   CRITICAL issues remain after ${maxIterations} iterations.`);
  console.log('   HALTING - Please fix manually before marking story complete.');

  return { success: false, iterations: maxIterations };
}
```

### Severity Handling

| Severity | Behavior | Notes |
|----------|----------|-------|
| **CRITICAL** | Auto-fix (max 2 attempts) | Security vulnerabilities, breaking bugs |
| **HIGH** | Document in story Dev Notes | Recommend fix before QA |
| **MEDIUM** | Ignore | @qa will handle |
| **LOW** | Ignore | Nits, not blocking |

### Timeout

- **Default**: 15 minutes per CodeRabbit run
- **Total max**: ~30 minutes (2 iterations)

### Error Handling

```javascript
// If CodeRabbit fails
try {
  await runCodeRabbitSelfHealing(storyPath);
} catch (error) {
  if (error.message.includes('command not found')) {
    console.warn('⚠️  CodeRabbit not installed in WSL');
    console.warn('   Skipping self-healing. Manual review required.');
    return; // Continue without self-healing
  }
  if (error.message.includes('timeout')) {
    console.warn('⚠️  CodeRabbit review timed out');
    console.warn('   Skipping self-healing. Manual review required.');
    return;
  }
  throw error; // Re-throw unknown errors
}
```

### Integration with Execution Modes

| Mode | Self-Healing Behavior |
|------|----------------------|
| **YOLO** | Automatic, no prompts |
| **Interactive** | Shows progress, no prompts |
| **Pre-Flight** | Included in execution plan |

---

## Mode Selection Implementation

### Validation

```javascript
function validateMode(mode) {
  const validModes = ['yolo', 'interactive', 'preflight'];

  if (!mode) {
    return 'interactive'; // Default
  }

  if (validModes.includes(mode.toLowerCase())) {
    return mode.toLowerCase();
  }

  console.warn(`Invalid mode '${mode}'. Defaulting to 'interactive'.`);
  console.warn(`Valid modes: ${validModes.join(', ')}`);
  return 'interactive';
}
```

### User Cancellation Handling

```javascript
function handleCancellation() {
  console.log('Development cancelled by user.');
  console.log('Story progress saved. You can resume with *develop {story-id}.');
  process.exit(0);
}
```

### Missing Story File Handling

```javascript
function validateStoryFile(storyId) {
  // Story files are in nested directories: docs/stories/{storyId}/story.yaml
  const storyPath = `docs/stories/${storyId}/story.yaml`;

  if (!fs.existsSync(storyPath)) {
    console.error(`Error: Story file not found at ${storyPath}`);
    console.error(`Please verify story ID and try again.`);
    process.exit(1);
  }

  return storyPath;
}
```

---

## Decision Log Format (ADR Compliant)

**File**: `.ai/decision-log-{story-id}.md`

**Format**: ADR (Architecture Decision Record) - automatically generated by `completeDecisionLogging()`

**Sections**:
1. **Context** - Story info, execution time, files modified, tests run
2. **Decisions Made** - All autonomous decisions with type/priority classification
3. **Rationale & Alternatives** - Why each choice was made, what else was considered
4. **Implementation Changes** - Files created/modified/deleted, test results
5. **Consequences & Rollback** - Git commit hash, rollback instructions, performance impact

**Example Output**:
```markdown
# Decision Log: Story 6.1.2.6.2

**Generated:** 2025-11-16T14:30:00.000Z
**Agent:** dev
**Mode:** Yolo (Autonomous Development)
**Story:** docs/stories/story-6.1.2.6.2.md
**Rollback:** `git reset --hard abc123def456`

---

## Context

**Story Implementation:** 6.1.2.6.2
**Execution Time:** 15m 30s
**Status:** completed

**Files Modified:** 5 files
**Tests Run:** 8 tests
**Decisions Made:** 3 autonomous decisions

---

## Decisions Made

### Decision 1: Use Axios for HTTP client

**Timestamp:** 2025-11-16T14:32:15.000Z
**Type:** library-choice
**Priority:** medium

**Reason:** Better error handling, interceptor support, and TypeScript definitions

**Alternatives Considered:**
- Fetch API (native)
- Got library
- node-fetch

---

## Implementation Changes

### Files Modified

- `src/api/client.js` (created)
- `package.json` (modified)

### Test Results

- ✅ PASS: `api.test.js` (125ms)

---

## Consequences & Rollback

### Rollback Instructions

\`\`\`bash
# Full rollback
git reset --hard abc123def456

# Selective file rollback
git checkout abc123def456 -- <file-path>
\`\`\`

### Performance Impact

- Agent Load Time: 150ms
- Task Execution Time: 15m 30s
- Logging Overhead: Minimal (async, non-blocking)
```

**For complete format specification, see**: `docs/guides/decision-logging-guide.md`

---

## Examples

### Example 1: YOLO Mode

```bash
*develop 3.14 yolo
```

**Output**:
```
🚀 YOLO Mode - Autonomous Development
📋 Story 3.14: GitHub DevOps Agent
⚡ Executing autonomously with decision logging...

✅ Task 1 complete (Decision: Use Octokit library - rationale logged)
✅ Task 2 complete (Decision: REST API over GraphQL - rationale logged)
✅ Task 3 complete
✅ All tests pass

📝 Decision log: .ai/decision-log-3.14.md (3 decisions logged)
✅ Story ready for review
```

### Example 2: Interactive Mode (Default)

```bash
*develop 3.15
```

**Output**:
```
💬 Interactive Mode - Balanced Development
📋 Story 3.15: Squad Auto Configuration

📖 Task 1: Design configuration schema
❓ Decision Point - Schema Format
   Option 1: YAML (human-readable, widely used)
   Option 2: JSON (strict typing, better IDE support)
   Option 3: TOML (simple, clear)

   Your choice? [1/2/3]: _
```

### Example 3: Pre-Flight Planning

```bash
*develop 3.16 preflight
```

**Output**:
```
✈️ Pre-Flight Planning Mode
📋 Story 3.16: Data Architecture Capability

🔍 Analyzing story for ambiguities...
Found 5 technical decisions needed.

📝 Pre-Flight Questionnaire:
1. Database choice: PostgreSQL or MySQL?
2. ORM preference: Prisma, TypeORM, or raw SQL?
3. Migration strategy: Sequential or timestamp-based?
4. Backup approach: Daily snapshots or continuous?
5. Testing database: SQLite, Docker PostgreSQL, or mock?

[Please answer all questions before proceeding]
```

---

## Dependencies

- `.aios-core/product/checklists/story-dod-checklist.md` - Definition of Done checklist

## Tools

- git - Local operations (add, commit, status, diff, log)
- File system - Read/write story files
- Testing frameworks - Execute validation tests

## Notes

- **Backward Compatibility**: Existing commands like `*develop {story-id}` continue to work (use interactive mode)
- **Mode Aliases**: Can extend with `*develop-yolo`, `*develop-interactive`, `*develop-preflight` commands
- **Decision Logs**: Persisted in `.ai/decision-log-{story-id}.md` for future reference and review
- **Educational Value**: Interactive mode explanations help developers learn framework patterns
- **Scope Drift Prevention**: Pre-flight mode eliminates mid-development ambiguity

## Handoff
next_agent: @qa
next_command: *review {story-id}
condition: Story status is Ready for Review
alternatives:
  - agent: @qa, command: *gate {story-id}, condition: Quick gate decision needed
  - agent: @dev, command: *apply-qa-fixes, condition: Self-identified issues during dev
