# Ap
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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: applyQaFixes()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Molecule

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
  - **Source:** .aios-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aios-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/execute-task.js

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
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

ply QA Fixes Task

This task provides instructions for applying fixes based on QA feedback and gate review comments. The agent MUST follow these instructions to systematically address all quality issues identified during QA review.

## Purpose

When a story receives QA feedback, this task helps developers:
- Review QA gate findings systematically
- Prioritize issues by severity
- Apply fixes while maintaining code quality
- Re-validate after changes


## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`devStoryLocation`**: Location of story files (typically docs/stories)

- **`architectureShardedLocation`**: Location for sharded architecture documents (typically docs/architecture) - Required to read/write architecture documentation

**Loading Config:**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aios-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const dev_story_location = config.devStoryLocation;
const architectureShardedLocation = config.architectureShardedLocation || 'docs/architecture'; // architectureShardedLocation
```

## Instructions

1. **Load QA Gate Report**

   - If user provides a gate file path, load it directly
   - Otherwise, check the story file for `gate_file` reference in `qa_results` section
   - If no gate file specified, ask user for the QA gate file path
   - Load the QA gate YAML file from docs/qa/gates/

2. **Review Findings**

   - Read through all issues identified in the QA gate report
   - Note the quality score and gate status
   - Categorize issues by type:
     - ❌ BLOCKING: Must fix before approval
     - ⚠️ WARNING: Should fix, impacts quality score
     - 💡 RECOMMENDATION: Nice to have improvements
   - Prioritize issues by severity and impact

3. **Create Fix Plan**

   - For each BLOCKING issue:
     - Identify affected files
     - Determine root cause
     - Plan specific fix approach
   - Group related issues that can be fixed together
   - Estimate effort for each fix

4. **Apply Fixes Systematically**

   For each issue:
   - Make the necessary code or documentation changes
   - Follow coding standards and best practices
   - Update tests if needed
   - Verify the fix resolves the specific issue
   - Update story file list if new files created/modified

5. **Validation**

   After applying all fixes:
   - Run linting: `npm run lint`
   - Run tests: `npm test`
   - Run type checking if applicable: `npm run typecheck`
   - Verify all BLOCKING issues are resolved
   - Check that quality score improvements are expected

6. **Update Story Record**

   - Update the story's Dev Agent Record section:
     - Add completion note about QA fixes applied
     - Update file list with any new/modified files
     - Reference the QA gate file in debug log if needed
   - Do NOT modify the qa_results section (that's for QA reviewer)

7. **Re-submission**

   - Confirm all BLOCKING issues resolved
   - Verify regression tests still pass
   - Inform user that story is ready for QA re-review
   - Optionally update story status to indicate "QA Fixes Applied"

## Best Practices

- **Address root causes**: Don't just fix symptoms, understand and fix the underlying issue
- **Maintain test coverage**: If you modify code, update or add tests
- **Follow patterns**: Use existing codebase patterns for consistency
- **Document complex fixes**: Add comments explaining non-obvious changes
- **Validate thoroughly**: Run full test suite, not just affected tests
- **Communicate clearly**: Update story notes with summary of changes made

## Common QA Issue Types

### Code Quality Issues
- Linting errors or warnings
- Code style inconsistencies
- Missing error handling
- Unused variables or imports
- Complex functions needing refactoring

### Testing Issues
- Missing test cases
- Failing tests
- Insufficient test coverage
- Flaky tests

### Documentation Issues
- Missing or incomplete comments
- Outdated documentation
- Missing or incorrect README updates
- Incomplete story file updates

### Architecture Issues
- Violations of coding standards
- Improper dependency usage
- Performance concerns
- Security vulnerabilities

## Exit Criteria

This task is complete when:
- ✅ All BLOCKING issues from QA gate are resolved
- ✅ All tests pass (linting, unit, integration)
- ✅ Story file is updated with changes
- ✅ Code is ready for QA re-review

## Handoff
next_agent: @qa
next_command: *review {story-id}
condition: Fixes applied, ready for re-review
alternatives:
  - agent: @dev, command: *run-tests, condition: Need to verify fixes pass tests first
