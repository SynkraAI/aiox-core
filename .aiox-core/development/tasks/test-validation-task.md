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

## Task Definition (AIOX Task Format V2.0)

```yaml
task: testValidationTask()
responsável: Dex (Dev Agent)
responsavel_type: Agente
atomic_layer: Test

**Entrada:**
- campo: test_input
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Optional test input parameter

**Saída:**
- campo: validation_result
  tipo: object
  destino: Memory
  persistido: false

- campo: success
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Test environment available
    tipo: pre-condition
    blocker: true
    validação: |
      Verify test environment is available
    error_message: "Pre-condition failed: Test environment not available"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation completed successfully
    tipo: post-condition
    blocker: true
    validação: |
      Verify validation completed successfully
    error_message: "Post-condition failed: Validation did not complete successfully"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task executed successfully
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task executed successfully
    error_message: "Acceptance criterion not met: Task did not execute successfully"
```

---

## Purpose

This is a test task created for validating the `create-task` task execution. It provides minimal functionality to test task creation workflow.

## Implementation

1. **Validate Inputs**
   - Check test input if provided
   - Validate environment

2. **Execute Validation**
   - Perform simple validation test
   - Return success status

3. **Output Result**
   - Return validation result
   - Log execution

## Error Handling

**Strategy:** abort

**Common Errors:**

1. **Error:** Test Environment Not Available
   - **Cause:** Test environment not configured
   - **Resolution:** Ensure test environment is available
   - **Recovery:** Log error and abort

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: < 1 min
cost_estimated: $0.0001
token_usage: ~100-200 tokens
```

---

## Metadata

```yaml
story: STORY-6.1.7.2
version: 1.0.0
dependencies:
  - N/A
tags:
  - test
  - validation
updated_at: 2025-01-17
```

---

**Created By:** Dex (Dev Agent)  
**Created Date:** 2025-01-17  
**Purpose:** Test task for validating create-task task execution  
**Status:** Test/Validation Only

