# QA Issue Fixer Task

> **Phase:** QA Fix Loop
> **Owner Agent:** @dev
> **Pipeline:** qa-loop
> **Command:** `*fix-qa-issues {story-id}`

---

## Purpose

Fix issues reported in QA review following a structured 8-phase workflow. This task is triggered when QA identifies issues that need to be addressed before the story can be approved.

**CRITICAL CONSTRAINTS:**

- **Minimal changes only** - Fix ONLY what's in the fix request
- **No scope creep** - Do NOT refactor or add features
- **Run ALL verification steps** from the fix request
- **Commit with proper references** to issue IDs

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: qa-fix

  deterministic: true
  elicit: false
  composable: true

  constraints:
    minimalChanges: true
    noScopeCreep: true
    noRefactoring: true
    noNewFeatures: true

  recovery:
    trackAttempts: true
    maxRetries: 3
    rollbackOnFailure: true

  inputs:
    - name: storyId
      type: string
      required: true
      description: "Story ID (e.g., '6.4' or 'story-6.4')"

    - name: fixRequestPath
      type: file
      path: docs/stories/{storyId}/qa/QA_FIX_REQUEST.md
      required: true
      description: 'Path to the QA fix request file'

    - name: qaReportPath
      type: file
      path: docs/stories/{storyId}/qa/qa_report.md
      required: false
      description: 'Path to the full QA report (optional)'

  outputs:
    - name: fixResult
      type: object
      schema:
        storyId: string
        status: completed|failed|blocked
        issuesFixed: array
        verificationResults: array
        commitHash: string

    - name: signalReReview
      type: boolean
      description: 'Signal to QA that fixes are ready for re-review'

  verification:
    type: checklist
    source: QA_FIX_REQUEST.md verification_steps
    timeout: 300
```

---

## Command Integration (@dev)

```yaml
command:
  name: '*fix-qa-issues'
  syntax: '*fix-qa-issues {story-id}'
  agent: dev

  examples:
    - '*fix-qa-issues 6.4'
    - '*fix-qa-issues story-6.4'

  aliases:
    - '*qa-fix'
    - '*fix-qa'
```

---

## The 8 Phases of QA Issue Fixing

### CRITICAL RULE: No Scope Creep

```yaml
scope_enforcement:
  description: |
    Fix ONLY what is explicitly listed in the QA_FIX_REQUEST.md.
    Do NOT:
    - Refactor code "while you're in there"
    - Add features that "would be nice"
    - Fix issues that weren't reported
    - Improve code style beyond what's required

  on_violation:
    action: halt
    message: 'Scope creep detected. Only fix issues from QA_FIX_REQUEST.md'
```

---

## Phase-by-Phase Execution Flow

### Phase 0: Load Context

```yaml
phase_0:
  id: '0'
  name: 'Load Context'
  description: 'Load QA fix request and report to understand scope'

  actions:
    - action: load_file
      path: docs/stories/{storyId}/qa/QA_FIX_REQUEST.md
      required: true
      variable: fixRequest

    - action: load_file
      path: docs/stories/{storyId}/qa/qa_report.md
      required: false
      variable: qaReport
      fallback: 'Use fixRequest only'

    - action: load_file
      path: docs/stories/{storyId}.md
      required: true
      variable: storyFile

  validation:
    check: 'QA_FIX_REQUEST.md exists and is valid markdown'
    onFailure: halt

  error_cases:
    - condition: 'QA_FIX_REQUEST.md not found'
      action: halt
      message: 'No fix request found at docs/stories/{storyId}/qa/QA_FIX_REQUEST.md'

  output:
    fixRequest: object
    qaReport: object
    storyContext: object
```

### Phase 1: Parse Requirements

```yaml
phase_1:
  id: '1'
  name: 'Parse Requirements'
  description: 'Extract list of issues and create fix checklist'

  actions:
    - action: parse_fix_request
      from: fixRequest
      extract:
        - issues # List of issues to fix
        - severity # CRITICAL, MAJOR, MINOR
        - affectedFiles # Files that need changes
        - verificationSteps # How to verify each fix

    - action: create_checklist
      format:
        - issueId: string # e.g., "CRIT-1", "MAJ-2"
        - description: string
        - severity: string # CRITICAL|MAJOR|MINOR
        - file: string # Affected file
        - fixApproach: string # How to fix
        - status: pending # pending|fixed|verified

    - action: prioritize
      order:
        - CRITICAL # Fix first
        - MAJOR # Fix second
        - MINOR # Fix last

  validation:
    check: 'At least one issue extracted from fix request'
    onFailure: halt

  output:
    issueChecklist: array
    totalIssues: integer
    criticalCount: integer
    majorCount: integer
    minorCount: integer
```

### Phase 2: Start Development

```yaml
phase_2:
  id: '2'
  name: 'Start Development'
  description: 'Prepare environment for fixing'

  actions:
    - action: check_branch
      verify: 'On correct branch for story'
      if_not:
        - action: checkout
          branch: 'feat/{storyId}' # or use worktree if configured

    - action: git_status
      verify: 'Working directory clean or has only expected changes'

    - action: record_state
      save:
        - commitBefore: '{currentCommitHash}'
        - branchName: '{currentBranch}'
        - timestamp: '{timestamp}'

  validation:
    check: 'On correct branch, ready to make changes'
    onFailure: ask_user

  output:
    branch: string
    commitBefore: string
    environmentReady: boolean
```

### Phase 3: Fix Issues Sequentially

```yaml
phase_3:
  id: '3'
  name: 'Fix Issues Sequentially'
  description: 'Address each issue in priority order'
  criticality: CORE

  constraints:
    - "Fix ONLY what's in the issue list"
    - 'Apply MINIMAL changes'
    - 'Do NOT refactor surrounding code'
    - 'Do NOT add new features'
    - 'Do NOT fix issues not in the list'

  actions:
    - action: for_each_issue
      in: issueChecklist
      ordered_by: severity
      do:
        - action: read_file
          path: issue.file

        - action: locate_issue
          description: issue.description

        - action: apply_fix
          approach: issue.fixApproach
          minimal: true

        - action: update_checklist
          issueId: issue.issueId
          status: fixed

        - action: log_change
          format: 'Fixed {issueId}: {description}'

  validation:
    check: 'All issues marked as fixed'
    onFailure: continue_with_remaining

  error_handling:
    - condition: 'Cannot locate issue'
      action: log_and_continue
      message: 'Issue {issueId} could not be located - may already be fixed'

    - condition: 'Fix would require major changes'
      action: halt
      message: 'Issue {issueId} requires scope beyond minimal fix'

  output:
    issuesFixed: array
    issuesSkipped: array
    filesModified: array
```

### Phase 4: Run Tests

```yaml
phase_4:
  id: '4'
  name: 'Run Tests'
  description: "Execute test suite to verify fixes don't break anything"

  actions:
    - action: run_command
      command: 'npm run lint'
      timeout: 60000
      required: true

    - action: run_command
      command: 'npm run test'
      timeout: 300000
      required: true

    - action: run_command
      command: 'npm run typecheck'
      timeout: 60000
      required: false # Only if TypeScript project

  validation:
    check: 'All tests pass, no lint errors'
    onFailure: goto phase_3 # Fix and retry

  retry:
    max_attempts: 3
    on_failure: halt

  output:
    lintPassed: boolean
    testsPassed: boolean
    typecheckPassed: boolean
    testResults: object
```

### Phase 5: Self-Verification

```yaml
phase_5:
  id: '5'
  name: 'Self-Verification'
  description: 'Run ALL verification steps from the fix request'
  criticality: REQUIRED

  actions:
    - action: extract_verification_steps
      from: fixRequest.verification_steps

    - action: for_each_step
      in: verificationSteps
      do:
        - action: execute_verification
          type: step.type # command|api|browser|e2e|manual
          command: step.command
          expected: step.expected

        - action: document_result
          stepId: step.id
          passed: boolean
          actual: string
          notes: string

  verification_types:
    command:
      description: 'Run CLI command and check output'
      example: 'npm run lint -- --quiet'

    api:
      description: 'Make API call and verify response'
      example: 'curl -X GET http://localhost:3000/api/health'

    browser:
      description: 'Use playwright to verify UI'
      example: 'Check login form renders correctly'

    e2e:
      description: 'Run end-to-end test'
      example: "npm run test:e2e -- --grep 'auth'"

    manual:
      description: 'Document manual verification'
      example: 'Visually confirm button alignment'

  validation:
    check: 'ALL verification steps pass'
    onFailure: return_to_phase_3

  output:
    verificationResults: array
    allPassed: boolean
    failedSteps: array
```

### Phase 6: Commit Fixes

```yaml
phase_6:
  id: '6'
  name: 'Commit Fixes'
  description: 'Commit changes with proper issue references'

  actions:
    - action: git_add
      files: '{filesModified}'
      # Only add files that were modified for fixes

    - action: generate_commit_message
      format: |
        fix(qa): resolve {issueIds}

        Issues fixed:
        {for each issue in issuesFixed}
        - {issue.issueId}: {issue.description}
        {end for}

        Story: {storyId}

        Co-Authored-By: Claude <noreply@anthropic.com>

    - action: git_commit
      message: '{generatedCommitMessage}'

  validation:
    check: 'Commit created successfully'
    onFailure: retry

  output:
    commitHash: string
    commitMessage: string
```

### Phase 7: Update Plan & Signal

```yaml
phase_7:
  id: '7'
  name: 'Update Plan & Signal'
  description: 'Mark issues as fixed and signal QA for re-review'

  actions:
    # Update issue status in fix request (if tracking there)
    - action: update_fix_request
      path: docs/stories/{storyId}/qa/QA_FIX_REQUEST.md
      changes:
        - Add "## Fix Results" section
        - Mark each issue as fixed with commit reference
        - Add timestamp

    # Update story file Dev Agent Record
    - action: update_story
      path: docs/stories/{storyId}.md
      section: 'Dev Agent Record'
      add:
        - completion_note: 'QA fixes applied: {issueIds}'
        - reference: 'QA_FIX_REQUEST.md'

    # Update plan tracker for dashboard integration
    - action: update_plan_tracker
      script: |
        const { PlanTracker } = require('.aios-core/infrastructure/scripts/plan-tracker.js');
        const tracker = new PlanTracker({ storyId: '{storyId}' });
        tracker.load();
        tracker.updateStatusJson({
          qaFixesApplied: true,
          fixedIssues: {issuesFixed.length},
          status: 'qa-fixes-complete'
        });

    # Signal QA for re-review
    - action: create_signal_file
      path: docs/stories/{storyId}/qa/READY_FOR_REREVIEW.md
      content: |
        # Ready for QA Re-Review

        **Story:** {storyId}
        **Fixed By:** @dev
        **Timestamp:** {timestamp}
        **Commit:** {commitHash}

        ## Issues Fixed

        {for each issue in issuesFixed}
        - [x] {issue.issueId}: {issue.description}
        {end for}

        ## Verification Results

        {for each result in verificationResults}
        - {result.passed ? '✅' : '❌'} {result.stepId}: {result.notes}
        {end for}

        ---

        **Next Step:** @qa re-review with `*review-story {storyId}`

  validation:
    check: 'All updates completed, signal file created'
    onFailure: retry

  output:
    fixRequestUpdated: boolean
    storyUpdated: boolean
    planTrackerUpdated: boolean
    signalCreated: boolean
```

---

## Summary Output Format

```yaml
summary:
  on_completion:
    format: |
      ## QA Fixes Complete for {storyId}

      **Issues Fixed:** {issuesFixed.length}/{totalIssues}
      **Commit:** {commitHash}
      **Status:** Ready for QA Re-Review

      ### Issues Addressed
      {for each issue in issuesFixed}
      - ✅ {issue.issueId} ({issue.severity}): {issue.description}
      {end for}

      ### Verification Results
      {for each result in verificationResults}
      - {result.passed ? '✅' : '❌'} {result.stepId}
      {end for}

      ### Next Steps
      1. QA agent should re-review: `@qa *review-story {storyId}`
      2. If all issues verified, story moves to "Ready for Review"

      ---
      Signal file created: docs/stories/{storyId}/qa/READY_FOR_REREVIEW.md
```

---

## Error Handling

```yaml
errors:
  - id: fix-request-not-found
    condition: 'QA_FIX_REQUEST.md does not exist'
    action: halt
    message: 'No fix request found. Run QA review first.'
    blocking: true

  - id: no-issues-found
    condition: 'Fix request has no issues listed'
    action: halt
    message: 'No issues to fix. Story may already be passing.'
    blocking: false

  - id: scope-creep-detected
    condition: 'Agent attempts changes outside issue list'
    action: halt
    message: 'Scope creep: Only fix issues from QA_FIX_REQUEST.md'
    blocking: true

  - id: tests-failing-after-fixes
    condition: 'Tests fail after applying fixes'
    action: escalate
    message: 'Fixes caused test failures. Review approach.'
    blocking: true

  - id: verification-failed
    condition: "Verification steps don't pass"
    action: retry_from_phase_3
    message: 'Verification failed. Re-check fixes.'
    max_retries: 3
```

---

## Integration with QA Loop

```yaml
qa_loop_integration:
  triggered_by:
    - QA review identifies issues
    - QA_FIX_REQUEST.md created
    - @qa signals @dev

  triggers_next:
    - READY_FOR_REREVIEW.md signals @qa
    - @qa runs re-review
    - Loop continues until PASS or WAIVED

  handoff_format:
    from_qa_to_dev: QA_FIX_REQUEST.md
    from_dev_to_qa: READY_FOR_REREVIEW.md

  status_tracking:
    - pending_fixes: "QA issues identified, awaiting dev"
    - in_progress_fixes: "Dev fixing issues"
    - fixes_complete: "Dev done, awaiting QA re-review"
    - passed: "All issues resolved"
```

---

## Examples

### Example 1: Simple Fix

```bash
*fix-qa-issues 6.4
```

**Output:**

```
## QA Fixes Complete for 6.4

**Issues Fixed:** 2/2
**Commit:** abc123def
**Status:** Ready for QA Re-Review

### Issues Addressed
- ✅ CRIT-1 (CRITICAL): Missing null check in validator
- ✅ MAJ-1 (MAJOR): Error message not user-friendly

### Verification Results
- ✅ Run npm test
- ✅ Check null input returns proper error

### Next Steps
1. QA agent should re-review: `@qa *review-story 6.4`
2. If all issues verified, story moves to "Ready for Review"
```

### Example 2: Partial Fix (Some Issues Cannot Be Fixed)

```bash
*fix-qa-issues 6.5
```

**Output:**

```
## QA Fixes Partially Complete for 6.5

**Issues Fixed:** 2/3
**Commit:** def456ghi
**Status:** Needs Manual Review

### Issues Addressed
- ✅ CRIT-1 (CRITICAL): SQL injection vulnerability
- ✅ MAJ-1 (MAJOR): Missing input validation
- ⚠️ MAJ-2 (MAJOR): Performance regression - requires scope expansion

### Notes
MAJ-2 requires refactoring the data layer. This exceeds minimal fix scope.
Recommend creating separate story for performance optimization.

### Next Steps
1. Discuss MAJ-2 with @qa and @po
2. Either expand scope or create follow-up story
```

---

## Metadata

```yaml
metadata:
  story: '6.4'
  epic: 'Epic 6 - QA Evolution'
  created: '2026-01-29'
  author: '@dev (Dex)'
  version: '1.0.0'
  tags:
    - qa-loop
    - fix-issues
    - quality-assurance
    - development
```

## Handoff
next_agent: @qa
next_command: *review {story-id}
condition: All QA_FIX_REQUEST issues resolved
alternatives:
  - agent: @dev, command: *run-tests, condition: Verify fixes pass before re-review
