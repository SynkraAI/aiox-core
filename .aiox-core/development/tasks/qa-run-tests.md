---
name: run-tests
agent: qa
requires:
  - jest
  - coderabbit
---

# Run Tests (with Code Quality Gate)

Execute test suite and validate code quality before marking tests complete.

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
task: qaRunTests()
responsável: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must exist

- campo: criteria
  tipo: array
  origem: config
  obrigatório: true
  validação: Non-empty validation criteria

- campo: strict
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: true

**Saída:**
- campo: validation_result
  tipo: boolean
  destino: Return value
  persistido: false

- campo: errors
  tipo: array
  destino: Memory
  persistido: false

- campo: report
  tipo: object
  destino: File (.ai/*.json)
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Validation rules loaded; target available for validation
    tipo: pre-condition
    blocker: true
    validação: |
      Check validation rules loaded; target available for validation
    error_message: "Pre-condition failed: Validation rules loaded; target available for validation"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation executed; results accurate; report generated
    tipo: post-condition
    blocker: true
    validação: |
      Verify validation executed; results accurate; report generated
    error_message: "Post-condition failed: Validation executed; results accurate; report generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Validation rules applied; pass/fail accurate; actionable feedback
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert validation rules applied; pass/fail accurate; actionable feedback
    error_message: "Acceptance criterion not met: Validation rules applied; pass/fail accurate; actionable feedback"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** validation-engine
  - **Purpose:** Rule-based validation and reporting
  - **Source:** .aiox-core/utils/validation-engine.js

- **Tool:** schema-validator
  - **Purpose:** JSON/YAML schema validation
  - **Source:** ajv or similar

---

## Scripts

**Agent-specific code for this task:**

- **Script:** run-validation.js
  - **Purpose:** Execute validation rules and generate report
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/run-validation.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Validation Criteria Missing
   - **Cause:** Required validation rules not defined
   - **Resolution:** Ensure validation criteria loaded from config
   - **Recovery:** Use default validation rules, log warning

2. **Error:** Invalid Schema
   - **Cause:** Target does not match expected schema
   - **Resolution:** Update schema or fix target structure
   - **Recovery:** Detailed validation error report

3. **Error:** Dependency Missing
   - **Cause:** Required dependency for validation not found
   - **Resolution:** Install missing dependencies
   - **Recovery:** Abort with clear dependency list

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate configuration early; use atomic writes; implement rollback checkpoints

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - quality-assurance
  - testing
updated_at: 2025-11-17
```

---


## Steps

### 1. Run Unit Tests
```bash
cd api
npm run test
```

**Expected**: All tests pass, coverage >= 80%

### 2. Run Integration Tests
```bash
npm run test:integration
```

### 3. Code Quality Review
```bash
# Review code that was tested
coderabbit --prompt-only -t uncommitted
```

**Parse output**:
- If CRITICAL or HIGH issues found → FAIL
- If only MEDIUM/LOW → WARN but PASS

### 4. Generate QA Report

Use template: `qa-gate-tmpl.yaml`

Include:
- Test results (pass/fail, coverage %)
- CodeRabbit summary (issues by severity)
- Recommendation (approve/reject story)

### 5. Update Story Status

If all pass:
- [ ] Mark story testing complete
- [ ] Add QA approval comment
- [ ] Move to "Ready for Deploy"

If failures:
- [ ] Document failures in story
- [ ] Create tech debt issues for MEDIUM
- [ ] Request fixes from @dev

## Integration with CodeRabbit

**CodeRabbit helps @qa agent**:
- Catch issues tests might miss (logic errors, race conditions)
- Validate security patterns (SQL injection, hardcoded secrets)
- Enforce coding standards automatically
- Generate quality metrics

## Config

```yaml
codeRabbit:
  enabled: true
  severity_threshold: high
  auto_fix: false  # QA reviews but doesn't auto-fix
  report_location: docs/qa/coderabbit-reports/
```
