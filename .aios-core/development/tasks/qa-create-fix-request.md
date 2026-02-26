# Create Fix Request Task

Generate a structured fix request document (`QA_FIX_REQUEST.md`) for @dev based on QA review findings.

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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: qaCreateFixRequest()
responsavel: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must be valid story ID format (e.g., "6.3")

- campo: severity_filter
  tipo: array
  origem: config
  obrigatorio: false
  validacao: Default ["CRITICAL", "MAJOR"]

- campo: include_minor
  tipo: boolean
  origem: User Input
  obrigatorio: false
  validacao: Default false

**Saida:**
- campo: fix_request_path
  tipo: string
  destino: Return value
  persistido: false

- campo: issues_count
  tipo: number
  destino: Memory
  persistido: false

- campo: fix_request_file
  tipo: file
  destino: docs/stories/{story-id}/qa/QA_FIX_REQUEST.md
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] QA report exists for the story
    tipo: pre-condition
    blocker: true
    validacao: |
      Check docs/stories/{story-id}/qa/qa_report.md exists
    error_message: "Pre-condition failed: QA report not found. Run *review {story-id} first."

  - [ ] Story is in Review or Rejected status
    tipo: pre-condition
    blocker: false
    validacao: |
      Story should be in Review status for fix request
    error_message: "Warning: Story may not need fix request if not in Review status."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] QA_FIX_REQUEST.md created with all issues
    tipo: post-condition
    blocker: true
    validacao: |
      Verify file created at docs/stories/{story-id}/qa/QA_FIX_REQUEST.md
    error_message: "Post-condition failed: QA_FIX_REQUEST.md was not created."

  - [ ] All CRITICAL and MAJOR issues included
    tipo: post-condition
    blocker: true
    validacao: |
      Verify issue count matches source report
    error_message: "Post-condition failed: Not all issues were included in fix request."
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Fix request generated with proper structure
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert fix request follows template structure
    error_message: "Acceptance criterion not met: Fix request structure invalid."

  - [ ] Each issue has location, problem, expected, verification
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert all required fields present for each issue
    error_message: "Acceptance criterion not met: Missing required issue fields."

  - [ ] Constraints section included
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert constraints checklist present
    error_message: "Acceptance criterion not met: Constraints section missing."
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** file-reader
  - **Purpose:** Read qa_report.md source file
  - **Source:** Native file system

- **Tool:** markdown-parser
  - **Purpose:** Parse QA report structure
  - **Source:** Native markdown processing

---

## Scripts

**Agent-specific code for this task:**

- **Script:** parse-qa-report.js
  - **Purpose:** Extract issues from QA report
  - **Language:** JavaScript
  - **Location:** .aios-core/development/scripts/parse-qa-report.js (optional)

---

## Error Handling

**Strategy:** fail-fast

**Common Errors:**

1. **Error:** QA Report Not Found
   - **Cause:** Story has not been reviewed yet
   - **Resolution:** Run \*review {story-id} first
   - **Recovery:** Provide clear instruction to user

2. **Error:** No Issues to Report
   - **Cause:** QA report shows all PASS
   - **Resolution:** No fix request needed
   - **Recovery:** Inform user story is ready for merge

3. **Error:** Invalid QA Report Format
   - **Cause:** QA report doesn't follow expected structure
   - **Resolution:** Re-run QA review
   - **Recovery:** List expected sections

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 1-3 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~500-1,500 tokens
```

**Optimization Notes:**

- Direct file parsing; minimal LLM usage; deterministic output

---

## Metadata

```yaml
story: 6.3
version: 1.0.0
dependencies:
  - qa-review-story.md
tags:
  - quality-assurance
  - fix-request
  - qa-loop
updated_at: 2026-01-29
```

---

## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`qa.qaLocation`**: Location of QA files (typically docs/qa)
- **`devStoryLocation`**: Location of story files (typically docs/stories)

**Loading Config:**

```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aios-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const qa_location = config.qa.qaLocation;
const dev_story_location = config.devStoryLocation;
```

---

## Command

```
*create-fix-request {story-id} [--include-minor]
```

**Parameters:**

- `story-id` (required): Story identifier (e.g., "6.3")
- `--include-minor` (optional): Include Minor severity issues

**Examples:**

```bash
*create-fix-request 6.3
*create-fix-request 6.3 --include-minor
```

---

## Workflow

### Phase 1: Load QA Report

1. Locate the QA report file:

   ```
   docs/stories/{story-id}/qa/qa_report.md
   ```

2. If not found, check alternate locations:

   ```
   docs/qa/reports/{story-id}-report.md
   {qaLocation}/reports/{epic}.{story}-report.md
   ```

3. Parse the QA report to extract:
   - Story metadata (ID, title, review date)
   - Issue list with severity levels
   - Failed acceptance criteria
   - Test failures

### Phase 2: Extract Issues

1. Filter issues by severity:
   - **CRITICAL**: Always include (blocking)
   - **MAJOR**: Always include (high priority)
   - **MINOR**: Only if `--include-minor` flag set

2. For each issue, extract:
   - Issue ID (auto-generate if missing)
   - Title/description
   - Location (file path, line number if available)
   - Problem description with code snippet
   - Expected behavior with code snippet
   - Verification steps

3. Group issues by category:
   - Code Quality
   - Test Coverage
   - Security
   - Performance
   - Documentation

### Phase 3: Generate Fix Request

1. Create output directory if needed:

   ```
   docs/stories/{story-id}/qa/
   ```

2. Generate `QA_FIX_REQUEST.md` using template below

3. Log generation summary

### Phase 4: Notify

1. Output success message with:
   - File path created
   - Issue count by severity
   - Next steps for @dev

---

## Fix Request Template

````markdown
# QA Fix Request: {{storyId}}

**Generated:** {{timestamp}}
**QA Report Source:** {{qaReportPath}}
**Reviewer:** Quinn (Test Architect)

---

## Instructions for @dev

Fix ONLY the issues listed below. Do not add features or refactor unrelated code.

**Process:**

1. Read each issue carefully
2. Fix the specific problem described
3. Verify using the verification steps provided
4. Mark the issue as fixed in this document
5. Run all tests before marking complete

---

## Summary

| Severity | Count             | Status                  |
| -------- | ----------------- | ----------------------- |
| CRITICAL | {{criticalCount}} | Must fix before merge   |
| MAJOR    | {{majorCount}}    | Should fix before merge |
| MINOR    | {{minorCount}}    | Optional improvements   |

---

## Issues to Fix

{{#each issues}}

### {{index}}. [{{severity}}] {{title}}

**Issue ID:** {{issueId}}

**Location:** `{{location}}`

**Problem:**
{{#if problemCode}}

```{{language}}
{{problemCode}}
```
````

{{else}}
{{problemDescription}}
{{/if}}

**Expected:**
{{#if expectedCode}}

```{{language}}
{{expectedCode}}
```

{{else}}
{{expectedDescription}}
{{/if}}

**Verification:**
{{#each verificationSteps}}

- [ ] {{this}}
      {{/each}}

**Status:** [ ] Fixed

---

{{/each}}

## Constraints

**CRITICAL: @dev must follow these constraints:**

- [ ] Fix ONLY the issues listed above
- [ ] Do NOT add new features
- [ ] Do NOT refactor unrelated code
- [ ] Run all tests before marking complete: `npm test`
- [ ] Run linting before marking complete: `npm run lint`
- [ ] Run type check before marking complete: `npm run typecheck`
- [ ] Update story file list if any new files created

---

## After Fixing

1. Mark each issue as fixed in this document
2. Update the story's Dev Agent Record with summary
3. Request QA re-review: `@qa *review {{storyId}}`

---

_Generated by Quinn (Test Architect) - AIOS QA System_

````

---

## Example Output

For story 6.3 with 2 issues:

```markdown
# QA Fix Request: 6.3

**Generated:** 2026-01-29T10:30:00Z
**QA Report Source:** docs/stories/6.3/qa/qa_report.md
**Reviewer:** Quinn (Test Architect)

---

## Instructions for @dev

Fix ONLY the issues listed below. Do not add features or refactor unrelated code.

**Process:**
1. Read each issue carefully
2. Fix the specific problem described
3. Verify using the verification steps provided
4. Mark the issue as fixed in this document
5. Run all tests before marking complete

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 1 | Must fix before merge |
| MAJOR | 1 | Should fix before merge |
| MINOR | 0 | Optional improvements |

---

## Issues to Fix

### 1. [CRITICAL] Missing input validation in parseStoryId

**Issue ID:** FIX-6.3-001

**Location:** `src/utils/story-parser.js:45`

**Problem:**
```javascript
function parseStoryId(input) {
  const parts = input.split('.');
  return { epic: parts[0], story: parts[1] };
}
````

**Expected:**

```javascript
function parseStoryId(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Story ID is required and must be a string');
  }
  const match = input.match(/^(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid story ID format: ${input}. Expected format: X.Y`);
  }
  return { epic: match[1], story: match[2] };
}
```

**Verification:**

- [ ] Unit test for null input throws error
- [ ] Unit test for invalid format throws error
- [ ] Unit test for valid format returns correct object

**Status:** [ ] Fixed

---

### 2. [MAJOR] Test coverage below threshold for QA module

**Issue ID:** FIX-6.3-002

**Location:** `.aios-core/development/tasks/qa-review-story.md`

**Problem:**
QA review task has no associated unit tests. Coverage: 0%

**Expected:**
Test file should exist at `tests/tasks/qa-review-story.test.js` with:

- Test for pre-condition validation
- Test for report generation
- Test for gate decision logic

**Verification:**

- [ ] Test file created at expected location
- [ ] At least 3 test cases implemented
- [ ] Tests pass: `npm test -- --grep "qa-review-story"`

**Status:** [ ] Fixed

---

## Constraints

**CRITICAL: @dev must follow these constraints:**

- [ ] Fix ONLY the issues listed above
- [ ] Do NOT add new features
- [ ] Do NOT refactor unrelated code
- [ ] Run all tests before marking complete: `npm test`
- [ ] Run linting before marking complete: `npm run lint`
- [ ] Run type check before marking complete: `npm run typecheck`
- [ ] Update story file list if any new files created

---

## After Fixing

1. Mark each issue as fixed in this document
2. Update the story's Dev Agent Record with summary
3. Request QA re-review: `@qa *review 6.3`

---

_Generated by Quinn (Test Architect) - AIOS QA System_

```

---

## Integration with QA Loop

This task is part of Epic 6 - QA Evolution's 10-phase loop:

```

Phase 1: Story Ready for Review
Phase 2: CodeRabbit Scan (automated)
Phase 3: Manual QA Review
Phase 4: QA Report Generation
Phase 5: Fix Request Generation ← THIS TASK
Phase 6: @dev Applies Fixes
Phase 7: Re-review
Phase 8: Gate Decision
Phase 9: Approval/Rejection
Phase 10: Merge or Iterate

```

**Previous Step:** QA Report generated via `*review {story-id}`
**Next Step:** @dev runs `*apply-qa-fixes {story-id}` using this fix request

---

## Exit Criteria

This task is complete when:
- QA_FIX_REQUEST.md created at correct path
- All CRITICAL issues included
- All MAJOR issues included
- MINOR issues included only if flag set
- Each issue has all required fields
- Constraints section present
- File follows template structure
```

## Handoff
next_agent: @dev
next_command: *fix-qa-issues
condition: QA_FIX_REQUEST.md generated
alternatives:
  - agent: @dev, command: *apply-qa-fixes, condition: Simple fixes, no structured request needed
