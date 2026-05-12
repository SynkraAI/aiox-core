# Execute Subtask (Coder Agent)

> **Phase:** Execution - Subtask
> **Owner Agent:** @dev
> **Pipeline:** execution-pipeline

---

## Purpose

Execute a single subtask from an implementation.yaml plan following the 13-step Coder Agent workflow. Includes mandatory self-critique phases (5.5 and 6.5) to catch bugs, edge cases, and pattern violations before committing. No steps can be skipped.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: execution-subtask

  deterministic: true
  elicit: false
  composable: true

  selfCritique:
    enabled: true
    checklistRef: self-critique-checklist.md
    phases:
      - '5.5'
      - '6.5'

  recovery:
    trackAttempts: true
    maxRetries: 3
    rollbackOnFailure: true

  inputs:
    - name: subtaskId
      type: string
      required: true
      description: "Subtask ID from implementation.yaml (e.g., 'ST-1.1')"

    - name: storyId
      type: string
      required: true
      description: 'Story ID for context loading'

    - name: implementationPlan
      type: file
      path: docs/stories/{storyId}/implementation.yaml
      required: true

    - name: projectContext
      type: file
      path: .aiox/project-context.yaml
      required: false

    - name: filesContext
      type: file
      path: docs/stories/{storyId}/files-context.yaml
      required: false

  outputs:
    - name: subtaskResult
      type: object
      schema:
        subtaskId: string
        status: completed|failed|blocked
        attempt: integer
        filesModified: array
        testsRun: array
        selfCritiqueResults: object

    - name: implementationPlanUpdate
      type: file
      path: docs/stories/{storyId}/implementation.yaml
      action: update

  verification:
    type: command
    command: "npm run test -- --grep '{subtaskId}'"
    timeout: 120

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: true
    spec: false
```

---

## Command Integration (@dev)

```yaml
command:
  name: '*execute-subtask'
  syntax: '*execute-subtask {subtask-id}'
  agent: dev

  examples:
    - '*execute-subtask ST-1.1'
    - '*execute-subtask ST-2.3'

  aliases:
    - '*subtask'
    - '*exec-subtask'
```

---

## The 13 Steps of the Coder Agent

### CRITICAL RULE: No Step Skipping

```yaml
step_enforcement:
  description: |
    ALL 13 steps MUST be executed in sequence.
    No skipping, no shortcuts, no "optimization" by combining steps.
    Each step has a specific purpose in the quality pipeline.

  violations:
    - Skipping self-critique phases (5.5, 6.5)
    - Combining multiple steps into one
    - Skipping tests "because code is simple"
    - Not running linter "because it passed before"

  on_violation:
    action: halt
    message: 'Step {step} cannot be skipped. Execute all 13 steps.'
```

---

## Step-by-Step Execution Flow

### Step 1: Load Context

```yaml
step_1:
  id: '1'
  name: 'Load Context'
  description: 'Load project-context.yaml and files-context.yaml'

  actions:
    - action: load_file
      path: .aiox/project-context.yaml
      required: false
      fallback: 'Use codebase defaults'

    - action: load_file
      path: docs/stories/{storyId}/files-context.yaml
      required: false
      fallback: 'Generate minimal context from implementation.yaml'

  validation:
    check: 'Context files loaded or fallbacks applied'
    onFailure: continue # Non-blocking

  output:
    projectContext: object
    filesContext: object
```

### Step 2: Read Implementation Plan

```yaml
step_2:
  id: '2'
  name: 'Read Implementation Plan'
  description: 'Load and parse implementation.yaml for current subtask'

  actions:
    - action: load_file
      path: docs/stories/{storyId}/implementation.yaml
      required: true

    - action: parse_yaml
      extract:
        - subtasks
        - dependencies
        - currentStatus

  validation:
    check: 'implementation.yaml exists and is valid YAML'
    onFailure: halt

  output:
    plan: object
    subtasks: array
    dependencies: object
```

### Step 3: Understand Current Subtask

```yaml
step_3:
  id: '3'
  name: 'Understand Current Subtask'
  description: 'Extract and comprehend the specific subtask requirements'

  actions:
    - action: find_subtask
      subtaskId: '{subtaskId}'
      in: plan.subtasks

    - action: extract
      fields:
        - title
        - description
        - acceptanceCriteria
        - files
        - dependencies
        - estimatedComplexity

    - action: verify_dependencies
      check: 'All dependency subtasks are completed'

  validation:
    check: 'Subtask found and dependencies met'
    onFailure: halt

  error_cases:
    - condition: 'Subtask not found'
      action: halt
      message: 'Subtask {subtaskId} not found in implementation.yaml'

    - condition: 'Dependencies not met'
      action: halt
      message: 'Subtask depends on incomplete subtasks: {unmet_deps}'

  output:
    subtask: object
    dependenciesMet: boolean
```

### Step 4: Plan Approach

```yaml
step_4:
  id: '4'
  name: 'Plan Approach'
  description: 'Create detailed implementation approach before coding'

  actions:
    - action: analyze_requirements
      from: subtask.acceptanceCriteria

    - action: identify_files
      create: subtask.files.create
      modify: subtask.files.modify

    - action: plan_changes
      for_each_file:
        - what: 'What changes are needed'
        - where: 'Which functions/classes to modify'
        - how: 'Implementation approach'

    - action: identify_tests
      unit: 'Unit tests needed'
      integration: 'Integration tests if applicable'

  validation:
    check: 'Approach documented with specific file changes'
    onFailure: retry

  output:
    approach:
      files: array
      changes: array
      tests: array
```

### Step 5: Write Code

```yaml
step_5:
  id: '5'
  name: 'Write Code'
  description: 'Implement the subtask according to the plan'

  actions:
    - action: implement
      follow: approach
      style: 'Match existing codebase patterns'

    - action: for_each_file
      in: approach.files
      do:
        - create_or_modify: file
        - apply_changes: approach.changes[file]
        - preserve: 'Existing functionality'

  validation:
    check: 'Code compiles/loads without syntax errors'
    onFailure: fix_immediately

  output:
    filesModified: array
    linesAdded: integer
    linesRemoved: integer
```

### Step 5.5: Self-Critique (Post-Code)

```yaml
step_5_5:
  id: "5.5"
  name: "Self-Critique: Post-Code Review"
  description: "MANDATORY self-review before running tests"
  criticality: REQUIRED

  checklist:
    - id: "SC-5.5.1"
      question: "Are there any predicted bugs in this code?"
      action: "List potential bugs and fix them"

    - id: "SC-5.5.2"
      question: "Have all edge cases been handled?"
      action: "Review boundaries, nulls, empty arrays, etc."

    - id: "SC-5.5.3"
      question: "Is error handling comprehensive?"
      action: "Check try/catch, error messages, recovery paths"

    - id: "SC-5.5.4"
      question: "Are there any security vulnerabilities?"
      action: "Check input validation, injection risks, auth"

    - id: "SC-5.5.5"
      question: "Does the code handle failure gracefully?"
      action: "Review failure modes and user feedback"

  process:
    1. Pause implementation
    2. Re-read all code written in Step 5
    3. Answer each checklist question honestly
    4. If ANY issues found:
       - Document the issue
       - Fix immediately
       - Re-run this checklist

  validation:
    check: "All checklist items pass"
    onFailure: fix_and_retry

  # AC5 Story 4.4: Persist self-critique results to JSON
  persist:
    action: write_json
    path: docs/stories/{storyId}/plan/self-critique-{subtaskId}-5.5.json
    content:
      subtaskId: "{subtaskId}"
      phase: "5.5"
      timestamp: "{timestamp}"
      passed: "{selfCritiquePost.passed}"
      issuesFound: "{selfCritiquePost.issuesFound}"
      issuesFixed: "{selfCritiquePost.issuesFixed}"
      checklist:
        - id: "SC-5.5.1"
          result: "{SC-5.5.1.result}"
        - id: "SC-5.5.2"
          result: "{SC-5.5.2.result}"
        - id: "SC-5.5.3"
          result: "{SC-5.5.3.result}"
        - id: "SC-5.5.4"
          result: "{SC-5.5.4.result}"
        - id: "SC-5.5.5"
          result: "{SC-5.5.5.result}"

  output:
    selfCritiquePost:
      passed: boolean
      issuesFound: array
      issuesFixed: array
```

### Step 6: Run Tests

```yaml
step_6:
  id: '6'
  name: 'Run Tests'
  description: 'Execute all relevant tests'

  actions:
    - action: run_command
      command: 'npm run test'
      timeout: 120000

    - action: run_command
      command: "npm run test:unit -- --grep '{subtask-related}'"
      optional: true

  validation:
    check: 'All tests pass'
    onFailure: goto step_7

  output:
    testsRun: array
    testsPassed: integer
    testsFailed: integer
    coverage: object
```

### Step 6.5: Self-Critique (Post-Test)

```yaml
step_6_5:
  id: "6.5"
  name: "Self-Critique: Post-Test Review"
  description: "MANDATORY self-review of code quality after tests"
  criticality: REQUIRED

  checklist:
    - id: "SC-6.5.1"
      question: "Does the code follow existing patterns in the codebase?"
      action: "Compare with similar files, ensure consistency"

    - id: "SC-6.5.2"
      question: "Are there any hardcoded values that should be configurable?"
      action: "Extract to constants, config, or environment variables"

    - id: "SC-6.5.3"
      question: "Are tests comprehensive enough?"
      action: "Check happy path, error path, edge cases covered"

    - id: "SC-6.5.4"
      question: "Is documentation updated where needed?"
      action: "Check JSDoc, README, inline comments for complex logic"

    - id: "SC-6.5.5"
      question: "Are there any code smells?"
      action: "Review for duplication, long functions, complex conditionals"

    - id: "SC-6.5.6"
      question: "Will this code be maintainable by others?"
      action: "Check naming, structure, separation of concerns"

  process:
    1. Pause after tests pass
    2. Review code against checklist
    3. If ANY issues found:
       - Document the issue
       - Fix the code
       - Return to Step 6 (re-run tests)

  validation:
    check: "All checklist items pass and tests still pass"
    onFailure: fix_and_retry

  # AC5 Story 4.4: Persist self-critique results to JSON
  persist:
    action: write_json
    path: docs/stories/{storyId}/plan/self-critique-{subtaskId}-6.5.json
    content:
      subtaskId: "{subtaskId}"
      phase: "6.5"
      timestamp: "{timestamp}"
      passed: "{selfCritiqueQuality.passed}"
      issuesFound: "{selfCritiqueQuality.issuesFound}"
      issuesFixed: "{selfCritiqueQuality.issuesFixed}"
      checklist:
        - id: "SC-6.5.1"
          result: "{SC-6.5.1.result}"
        - id: "SC-6.5.2"
          result: "{SC-6.5.2.result}"
        - id: "SC-6.5.3"
          result: "{SC-6.5.3.result}"
        - id: "SC-6.5.4"
          result: "{SC-6.5.4.result}"
        - id: "SC-6.5.5"
          result: "{SC-6.5.5.result}"
        - id: "SC-6.5.6"
          result: "{SC-6.5.6.result}"

  output:
    selfCritiqueQuality:
      passed: boolean
      issuesFound: array
      issuesFixed: array
```

### Step 7: Fix Issues

```yaml
step_7:
  id: '7'
  name: 'Fix Issues'
  description: 'Fix any test failures'

  condition: 'Execute only if Step 6 had failures'

  actions:
    - action: analyze_failure
      for_each: failedTest
      identify: 'Root cause of failure'

    - action: fix
      apply: 'Minimal change to fix issue'
      preserve: 'Working functionality'

    - action: re_run_tests
      verify: 'Fix resolved the issue'

  max_iterations: 3

  validation:
    check: 'All tests pass after fixes'
    onFailure: escalate

  escalation:
    after: 3
    action: halt
    message: 'Unable to fix test failures after 3 attempts'

  output:
    issuesFixed: array
    iterationsUsed: integer
```

### Step 8: Run Linter

```yaml
step_8:
  id: '8'
  name: 'Run Linter'
  description: 'Execute code linting'

  actions:
    - action: run_command
      command: 'npm run lint'
      timeout: 60000

  validation:
    check: 'No linting errors (warnings acceptable)'
    onFailure: goto step_9

  output:
    lintErrors: array
    lintWarnings: array
```

### Step 9: Fix Lint Issues

```yaml
step_9:
  id: '9'
  name: 'Fix Lint Issues'
  description: 'Fix any linting errors'

  condition: 'Execute only if Step 8 had errors'

  actions:
    - action: auto_fix
      command: 'npm run lint:fix'
      attempt: 1

    - action: manual_fix
      for_each: remainingError
      if: "Auto-fix didn't resolve"

    - action: re_run_linter
      verify: 'All errors fixed'

  validation:
    check: 'No linting errors'
    onFailure: halt

  output:
    errorsFixed: array
```

### Step 10: Verify Manually (If Needed)

```yaml
step_10:
  id: '10'
  name: 'Verify Manually'
  description: 'Manual verification for UI/UX or complex logic'

  condition: 'Execute if subtask involves UI or requires manual check'

  triggers:
    - subtask.type == "ui"
    - subtask.type == "api"
    - subtask.manualVerification == true

  actions:
    - action: identify_verification_steps
      from: subtask.acceptanceCriteria

    - action: execute_verification
      type: browser|api|cli
      document: 'Results of each step'

  validation:
    check: 'Manual verification passed'
    onFailure: return_to_step_5

  output:
    manualVerification:
      performed: boolean
      steps: array
      results: array
```

### Step 11: Update Plan Status

```yaml
step_11:
  id: '11'
  name: 'Update Plan Status'
  description: 'Update implementation.yaml with subtask completion'

  actions:
    - action: update_yaml
      path: docs/stories/{storyId}/implementation.yaml
      changes:
        - path: subtasks[{subtaskId}].status
          value: completed

        - path: subtasks[{subtaskId}].completedAt
          value: '{timestamp}'

        - path: subtasks[{subtaskId}].attempt
          value: '{attemptNumber}'

        - path: subtasks[{subtaskId}].filesModified
          value: '{filesModified}'

    - action: record_attempt
      in: recovery_system
      data:
        subtaskId: '{subtaskId}'
        storyId: '{storyId}'
        attempt: '{attemptNumber}'
        status: 'completed'
        timestamp: '{timestamp}'

    # AC7 Story 4.6: Update status.json for dashboard integration
    - action: update_dashboard_status
      script: |
        const { PlanTracker } = require('.aiox-core/infrastructure/scripts/plan-tracker.js');
        const tracker = new PlanTracker({ storyId: '{storyId}' });
        tracker.load();
        tracker.updateStatusJson();
      description: 'Auto-update status.json after subtask completion'

  validation:
    check: 'implementation.yaml updated successfully'
    onFailure: retry

  output:
    planUpdated: boolean
    dashboardUpdated: boolean
```

### Step 12: Commit Changes

```yaml
step_12:
  id: '12'
  name: 'Commit Changes'
  description: 'Commit all changes with proper message'

  actions:
    - action: git_add
      files: '{filesModified}'

    - action: git_commit
      message: |
        feat({storyId}): {subtask.title}

        - Completed subtask {subtaskId}
        - Files: {filesModified.join(', ')}

        Co-Authored-By: Claude <noreply@anthropic.com>

  validation:
    check: 'Commit created successfully'
    onFailure: retry

  output:
    commitHash: string
    commitMessage: string
```

### Step 13: Signal Completion

```yaml
step_13:
  id: '13'
  name: 'Signal Completion'
  description: 'Report subtask completion and provide summary'

  actions:
    - action: generate_summary
      include:
        - subtaskId
        - filesModified
        - testsRun
        - selfCritiqueResults
        - attempt
        - commitHash

    - action: check_next_subtask
      determine: 'What subtask is next (if any)'

    - action: report
      format: |
        ## Subtask {subtaskId} Complete

        **Files Modified:** {filesModified.length}
        **Tests Run:** {testsRun.length} passed
        **Attempt:** {attempt}
        **Commit:** {commitHash}

        ### Self-Critique Results
        - Post-Code (5.5): {selfCritiquePost.issuesFixed.length} issues found and fixed
        - Post-Test (6.5): {selfCritiqueQuality.issuesFixed.length} issues found and fixed

        ### Next Steps
        {nextSubtask ? "Next: *execute-subtask " + nextSubtask : "All subtasks complete!"}

  output:
    summary: string
    nextSubtask: string|null
    completed: true
```

---

## Recovery System Integration

```yaml
recovery:
  description: 'Track attempts and enable rollback on failure'

  attempt_tracking:
    storage: .aiox/recovery/{storyId}/{subtaskId}.json
    schema:
      subtaskId: string
      attempts: array
      currentAttempt: integer
      maxAttempts: 3
      status: in_progress|completed|failed|blocked

  on_failure:
    - Record attempt with error details
    - If attempts < maxAttempts:
        action: retry_from_step_1
    - If attempts >= maxAttempts:
        action: halt
        status: blocked
        message: 'Subtask failed after {maxAttempts} attempts'

  rollback:
    enabled: true
    command: 'git reset --hard {lastGoodCommit}'
    trigger: 'Manual or on critical failure'

  attempt_record:
    fields:
      - attemptNumber
      - startedAt
      - completedAt
      - status
      - error (if failed)
      - filesModified
      - commitHash (if completed)
```

---

## Error Handling

```yaml
errors:
  - id: subtask-not-found
    condition: 'Subtask ID not in implementation.yaml'
    action: halt
    message: 'Subtask {subtaskId} not found. Check implementation.yaml'
    blocking: true

  - id: dependencies-not-met
    condition: 'Required subtasks not completed'
    action: halt
    message: 'Complete these subtasks first: {unmetDeps}'
    blocking: true

  - id: tests-failing-after-retries
    condition: 'Tests fail after 3 fix attempts'
    action: escalate
    message: 'Unable to fix test failures. Manual intervention required.'
    blocking: true

  - id: self-critique-infinite-loop
    condition: 'Self-critique finds issues > 5 times'
    action: halt
    message: 'Self-critique found recurring issues. Review approach.'
    blocking: true

  - id: implementation-yaml-corrupt
    condition: 'Cannot parse implementation.yaml'
    action: halt
    message: 'implementation.yaml is invalid. Fix YAML syntax.'
    blocking: true
```

---

## Quality Gates

```yaml
quality_gates:
  - id: no-skipped-steps
    description: 'All 13 steps must execute'
    check: 'Step execution log contains all 13 steps'

  - id: self-critique-passed
    description: 'Both self-critique phases must pass'
    check: 'selfCritiquePost.passed && selfCritiqueQuality.passed'

  - id: tests-pass
    description: 'All tests must pass'
    check: 'testsFailed == 0'

  - id: lint-clean
    description: 'No lint errors'
    check: 'lintErrors.length == 0'

  - id: plan-updated
    description: 'implementation.yaml reflects completion'
    check: 'planUpdated == true'
```

---

## Self-Critique Checklist Reference

The task references `self-critique-checklist.md` which should contain:

```yaml
self_critique_checklist:
  post_code_5_5:
    - Predicted bugs identified and fixed
    - Edge cases handled (null, empty, boundary)
    - Error handling comprehensive
    - Security vulnerabilities addressed
    - Failure modes graceful

  post_test_6_5:
    - Follows codebase patterns
    - No hardcoded values
    - Tests comprehensive
    - Documentation updated
    - No code smells
    - Maintainable by others
```

---

## Examples

### Example 1: Execute Simple Subtask

```bash
*execute-subtask ST-1.1
```

**Output:**

```
## Subtask ST-1.1 Complete

**Files Modified:** 2
- src/utils/validator.ts (created)
- src/utils/index.ts (modified)

**Tests Run:** 4 passed
**Attempt:** 1
**Commit:** abc123def

### Self-Critique Results
- Post-Code (5.5): 1 issue found and fixed (missing null check)
- Post-Test (6.5): 0 issues found

### Next Steps
Next: *execute-subtask ST-1.2
```

### Example 2: Subtask with Retry

```bash
*execute-subtask ST-2.3
```

**Output (attempt 1):**

```
Step 6: Tests failed
- test/api.test.ts: Expected 200, got 404

Step 7: Fixing issues...
- Added missing route handler

Step 6 (retry): All tests pass

## Subtask ST-2.3 Complete
**Attempt:** 1 (with internal fix)
...
```

---

## Pipeline Integration

```yaml
pipeline:
  phase: execution
  previous_phase: plan-create
  next_phase: plan-verify (after all subtasks)

  requires:
    - implementation.yaml

  optional:
    - project-context.yaml
    - files-context.yaml

  on_completion:
    - Update implementation.yaml status
    - Record attempt in recovery system
    - Check if all subtasks complete

  triggers_next:
    condition: 'All subtasks in implementation.yaml completed'
    action: 'Proceed to plan-verify phase'
```

---

## Metadata

```yaml
metadata:
  story: '4.3'
  epic: 'Epic 4 - Execution Pipeline'
  created: '2026-01-28'
  author: '@dev (Dex)'
  version: '1.0.0'
  tags:
    - execution-pipeline
    - subtask
    - coder-agent
    - self-critique
    - development
```
