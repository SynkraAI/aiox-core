# Self-Heal

## Purpose

Auto-fix CRITICAL and HIGH severity issues found during quality review. Iterates up to 3 times attempting automated fixes, then HALTs and escalates if issues remain. This task is referenced by the story-development-cycle workflow as a remediation loop between implementation and quality review.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts) **[DEFAULT for self-heal]**
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Automated fix loops

### 2. Interactive Mode - Balanced, Educational (5-10 prompts)
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, understanding fix strategies

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Complex multi-file fixes

**Parameter:** `mode` (optional, default: `yolo`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: selfHeal()
responsavel: Dex (Builder)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must reference existing story file

- campo: review_feedback
  tipo: object
  origem: quality-review output
  obrigatorio: true
  validacao: Must contain issues array with severity levels

- campo: max_iterations
  tipo: number
  origem: Config
  obrigatorio: false
  default: 3
  validacao: Must be between 1 and 5

**Saida:**
- campo: fixes_applied
  tipo: array
  destino: Story Dev Notes
  persistido: true

- campo: remaining_issues
  tipo: array
  destino: Return value
  persistido: false

- campo: heal_result
  tipo: string
  destino: Return value
  persistido: false
  values: HEALED|PARTIAL|FAILED
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Quality review feedback is available with categorized issues
    tipo: pre-condition
    blocker: true
    validacao: |
      Check review_feedback contains issues with severity levels
    error_message: "Pre-condition failed: No quality review feedback available"

  - [ ] Story file exists and is in a fixable state
    tipo: pre-condition
    blocker: true
    validacao: |
      Check story status allows modifications (not Done or Closed)
    error_message: "Pre-condition failed: Story is not in a fixable state"
```

---

## SEQUENTIAL Task Execution

### Step 1: Read Quality Review Feedback

- Load the quality review output (QA Results section or gate file)
- Extract all issues found during review
- Parse each issue for: id, severity, finding, suggested_action, affected_files

### Step 2: Categorize Issues by Severity

Sort issues into severity buckets:

| Severity | Action | Examples |
|----------|--------|---------|
| **CRITICAL** | Auto-fix immediately | Security vulnerabilities, breaking bugs, missing validation |
| **HIGH** | Auto-fix in this loop | Significant quality problems, missing tests, architecture violations |
| **MEDIUM** | Document for later | Should fix soon, not blocking |
| **LOW** | Skip | Minor issues, cosmetic, nits |

- Only CRITICAL and HIGH issues enter the self-healing loop
- MEDIUM issues are documented in the story for future attention
- LOW issues are noted but not acted upon

### Step 3: Execute Self-Healing Loop

```
iteration = 0
max_iterations = 3

WHILE iteration < max_iterations:

  1. Attempt auto-fix for each CRITICAL issue:
     - Read the affected file(s)
     - Apply the suggested fix
     - Run lint + typecheck on affected files
     - Run relevant tests

  2. Attempt auto-fix for each HIGH issue:
     - Read the affected file(s)
     - Apply the suggested fix
     - Run lint + typecheck on affected files
     - Run relevant tests

  3. Re-validate all fixes:
     - npm run lint (on modified files)
     - npm run typecheck (on modified files)
     - npm test (relevant test suites)

  4. Check remaining issues:
     - IF no CRITICAL or HIGH issues remain:
       - Log: "Self-healing complete"
       - BREAK
     - ELSE:
       - Log: "Iteration {n}: {remaining} issues still present"
       - iteration++
       - CONTINUE

IF iteration == max_iterations AND issues remain:
  - Log: "Self-healing FAILED after {max_iterations} iterations"
  - HALT and escalate to user
  - DO NOT mark story as complete
```

### Step 4: Document Fixes Applied

For each fix applied, record:

```yaml
fix:
  issue_id: '{issue id}'
  severity: '{CRITICAL|HIGH}'
  finding: '{original finding}'
  fix_applied: '{description of fix}'
  files_modified: ['{file paths}']
  iteration: {iteration number}
  validation: PASS|FAIL
```

### Step 5: Generate Heal Result

**HEALED** - All CRITICAL and HIGH issues resolved:
- All fixes validated with passing lint/typecheck/tests
- Story can proceed to re-review

**PARTIAL** - Some issues fixed, some remain:
- Fixed issues documented
- Remaining issues listed for manual intervention
- Story returned to executor for manual fixes

**FAILED** - Max iterations reached with CRITICAL issues:
- All attempted fixes documented
- Remaining issues listed with detail
- HALT execution and escalate
- DO NOT proceed with story

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All fixes are documented with before/after state
    tipo: post-condition
    blocker: true
    validacao: |
      Verify each applied fix has issue_id, description, and validation result
    error_message: "Post-condition failed: Fixes not properly documented"

  - [ ] Remaining issues are clearly listed if any exist
    tipo: post-condition
    blocker: true
    validacao: |
      Verify remaining_issues array is populated (or empty if all fixed)
    error_message: "Post-condition failed: Remaining issues status unclear"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Self-healing loop executed with max 3 iterations
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert loop ran between 1 and max_iterations times
    error_message: "Acceptance criterion not met: Loop did not execute properly"

  - [ ] CRITICAL issues are either fixed or escalated (never ignored)
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert no CRITICAL issue is left without a fix attempt or escalation
    error_message: "Acceptance criterion not met: CRITICAL issues were ignored"

  - [ ] Fixes do not introduce new issues
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert lint/typecheck/tests pass after fixes are applied
    error_message: "Acceptance criterion not met: Fixes introduced new issues"
```

---

## Error Handling

**Strategy:** escalate (after max retries)

**Common Errors:**

1. **Error:** Fix Introduces New Failures
   - **Cause:** Applied fix breaks other functionality
   - **Resolution:** Revert fix, try alternative approach
   - **Recovery:** If 2 fix attempts fail for same issue, skip and document

2. **Error:** Cannot Parse Review Feedback
   - **Cause:** Review output format is unexpected
   - **Resolution:** Validate review output format
   - **Recovery:** HALT and ask user to provide feedback manually

3. **Error:** Max Iterations Exhausted
   - **Cause:** Issues too complex for automated fixing
   - **Resolution:** Manual intervention required
   - **Recovery:** Generate detailed report and escalate to user/architect

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-30 min (estimated, depends on issue count)
cost_estimated: $0.003-0.020
token_usage: ~3,000-15,000 tokens
```

**Optimization Notes:**
- Fix CRITICAL issues first (they may resolve HIGH issues as side effect)
- Run validation checks incrementally per fix, not in batch
- If a fix attempt fails, move to next issue rather than retrying immediately

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - quality-review.md
tags:
  - self-healing
  - auto-fix
  - quality
  - remediation
updated_at: 2026-04-10
```

---

## Handoff

next_agent: @qa
next_command: *review {story-id}
condition: Heal result is HEALED, ready for re-review
alternatives:
  - agent: @dev, command: *develop {story-id}, condition: Heal result is PARTIAL, manual fixes needed
  - agent: @architect, command: *review-architecture, condition: Heal result is FAILED, architectural issues
