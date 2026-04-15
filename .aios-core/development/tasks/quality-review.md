# Quality Review

## Purpose

Quality gate agent (different from the executor) reviews the implementation of a story against acceptance criteria, code quality standards, architecture patterns, and the story Definition of Done checklist. This task is referenced by the story-development-cycle workflow Phase 4.

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
task: qualityReview()
responsavel: Quality Gate Agent (assigned per story)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must reference existing story file

- campo: story_path
  tipo: string
  origem: Derived
  obrigatorio: true
  validacao: File must exist at devStoryLocation/{story_id}

**Saida:**
- campo: review_verdict
  tipo: string
  destino: Return value
  persistido: false
  values: APPROVED|NEEDS_WORK|REJECTED

- campo: review_details
  tipo: object
  destino: Story QA Results section
  persistido: true

- campo: gate_file
  tipo: file
  destino: qa.qaLocation/gates/
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Story status is "Ready for Review" or "In Review"
    tipo: pre-condition
    blocker: true
    validacao: |
      Check story status indicates implementation is complete
    error_message: "Pre-condition failed: Story is not ready for review"

  - [ ] Reviewer agent is different from executor agent
    tipo: pre-condition
    blocker: true
    validacao: |
      Verify quality_gate agent != executor agent (separation of concerns)
    error_message: "Pre-condition failed: Reviewer cannot be the same agent as executor"

  - [ ] File List in story is populated
    tipo: pre-condition
    blocker: true
    validacao: |
      Check story File List contains at least one entry
    error_message: "Pre-condition failed: No files listed in story File List"
```

---

## SEQUENTIAL Task Execution

### Step 1: Read Story File and All Modified Files

- Load the complete story file
- Extract the File List section
- Read every file listed as created or modified
- Note the acceptance criteria for traceability mapping
- Identify the executor and quality_gate agents

### Step 2: Check Code Quality (Lint, Types, Tests)

Run automated quality checks:

```bash
npm run lint && npm run typecheck
```

- Verify lint passes for all files in the File List
- Verify typecheck passes for all files in the File List
- Run tests related to modified files:

```bash
npm test -- --testPathPatterns="{relevant test patterns}"
```

- Document results:
  - Lint: PASS/FAIL (with issue count)
  - Typecheck: PASS/FAIL (with error count)
  - Tests: PASS/FAIL (with pass/fail/skip counts)

### Step 3: Check Architecture Patterns

Review modified files against project conventions:

- **Naming conventions**: kebab-case files, PascalCase components, SCREAMING_SNAKE constants
- **Import style**: Absolute imports (`@/path`), correct import order
- **TypeScript**: No `any` types, props interfaces defined, typed refs
- **Component structure**: Max 100 lines, Atomic Design compliance
- **DRY principle**: No duplicated logic across files
- **Separation of concerns**: Data, logic, and presentation properly separated

### Step 4: Check Acceptance Criteria Met

For each acceptance criterion in the story:

1. Identify the implementing code/files
2. Verify the AC is fully satisfied by the implementation
3. Check that tests validate the AC
4. Map each AC to its test coverage

Produce a traceability matrix:

| AC# | Description | Implemented | Test Coverage | Status |
|-----|-------------|-------------|---------------|--------|
| 1   | {AC text}   | {files}     | {test files}  | PASS/FAIL |

### Step 5: Check Story DoD Checklist

Execute the Definition of Done checklist from `.aios-core/product/checklists/story-dod-checklist.md`:

- [ ] All tasks and subtasks marked complete
- [ ] All acceptance criteria implemented
- [ ] Tests written and passing
- [ ] Lint and typecheck clean
- [ ] File List accurate and complete
- [ ] No new technical debt introduced
- [ ] Code reviewed for security concerns

### Step 6: Generate Review Verdict

Based on findings, issue one of three verdicts:

**APPROVED** - All checks pass:
- All ACs met with test coverage
- Lint/typecheck clean
- Architecture patterns followed
- DoD checklist complete
- No blocking issues found

**NEEDS_WORK** - Minor issues that can be auto-fixed or quickly resolved:
- Minor lint issues
- Missing edge case tests
- Documentation gaps
- Non-blocking code quality improvements

**REJECTED** - Critical issues requiring significant rework:
- Acceptance criteria not met
- Critical test failures
- Security vulnerabilities
- Architecture violations
- Missing core functionality

### Step 7: Write Review Output

#### Output 1: Update Story QA Results Section

Append to the story file's QA Results section:

```markdown
## QA Results

### Review Date: {date}
### Reviewed By: {quality_gate agent name}

### Code Quality
- Lint: {PASS/FAIL}
- Typecheck: {PASS/FAIL}
- Tests: {passed}/{total} passing

### Architecture Compliance
- Naming conventions: {PASS/FAIL}
- Import style: {PASS/FAIL}
- Component structure: {PASS/FAIL}

### Acceptance Criteria Traceability
{traceability matrix}

### DoD Checklist
{checklist results}

### Issues Found
{numbered list of issues with severity}

### Verdict: {APPROVED|NEEDS_WORK|REJECTED}
{1-2 sentence explanation}
```

#### Output 2: Create Gate File

Save to `qa.qaLocation/gates/{epic}.{story}-{slug}.yml`:

```yaml
schema: 1
story: '{epic}.{story}'
story_title: '{story title}'
gate: PASS|CONCERNS|FAIL
status_reason: '{1-2 sentence explanation}'
reviewer: '{quality_gate agent}'
updated: '{ISO-8601 timestamp}'
top_issues: []
waiver: { active: false }
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Review verdict issued with clear reasoning
    tipo: post-condition
    blocker: true
    validacao: |
      Verify verdict is APPROVED, NEEDS_WORK, or REJECTED with explanation
    error_message: "Post-condition failed: No review verdict issued"

  - [ ] QA Results section updated in story file
    tipo: post-condition
    blocker: true
    validacao: |
      Verify story file contains QA Results with review findings
    error_message: "Post-condition failed: Story QA Results not updated"

  - [ ] Gate file created at standard location
    tipo: post-condition
    blocker: true
    validacao: |
      Verify gate YAML file exists at qa.qaLocation/gates/
    error_message: "Post-condition failed: Gate file not created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Every story AC has been evaluated with evidence
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each AC has a PASS/FAIL status with supporting evidence
    error_message: "Acceptance criterion not met: Not all story ACs evaluated"

  - [ ] Review includes automated quality check results
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert lint, typecheck, and test results are included in review
    error_message: "Acceptance criterion not met: Missing automated quality results"
```

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Story Not in Reviewable State
   - **Cause:** Story status is not Ready for Review
   - **Resolution:** Verify implementation is complete
   - **Recovery:** Return to executor with status update request

2. **Error:** Reviewer Same as Executor
   - **Cause:** Quality gate agent matches executor agent
   - **Resolution:** Assign different quality gate agent
   - **Recovery:** HALT and escalate to SM/PO for reassignment

3. **Error:** File List Empty
   - **Cause:** Executor did not update File List
   - **Resolution:** Request executor to update File List
   - **Recovery:** Attempt to derive file list from git diff, warn about completeness

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 10-30 min (estimated)
cost_estimated: $0.005-0.020
token_usage: ~5,000-15,000 tokens
```

**Optimization Notes:**
- Run automated checks (lint, typecheck, tests) in parallel
- Focus deep review on high-risk areas (auth, payments, security)
- Use risk assessment to determine review depth

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - story-dod-checklist.md
  - qa-gate.md
tags:
  - quality-assurance
  - code-review
  - quality-gate
updated_at: 2026-04-10
```

---

## Handoff

next_agent: @dev
next_command: *apply-qa-fixes
condition: Review verdict is NEEDS_WORK or REJECTED
alternatives:
  - agent: @devops, command: *push, condition: Review verdict is APPROVED
  - agent: @dev, command: *fix-qa-issues, condition: Structured fix from review findings
