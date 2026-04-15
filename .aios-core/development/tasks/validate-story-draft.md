# Validate Story Draft

## Purpose

Product Owner validates that a story draft has proper executor and quality gate assignments, acceptance criteria, and is ready for implementation. This is a pre-implementation gate referenced by the story-development-cycle workflow Phase 2.

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
task: validateStoryDraft()
responsavel: Priya (Product Owner)
responsavel_type: Agente
atomic_layer: Organism

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
- campo: validation_result
  tipo: string
  destino: Return value
  persistido: false
  values: VALID|INVALID

- campo: validation_reasons
  tipo: array
  destino: Memory
  persistido: false

- campo: validation_report
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
  - [ ] Story file exists at the expected path
    tipo: pre-condition
    blocker: true
    validacao: |
      Check story file exists at devStoryLocation/{story_id}
    error_message: "Pre-condition failed: Story file not found"

  - [ ] Story is in Draft or Ready status
    tipo: pre-condition
    blocker: false
    validacao: |
      Check story status is Draft or Ready (warn if already In Progress)
    error_message: "Warning: Story is already past Draft/Ready status"
```

---

## SEQUENTIAL Task Execution

### Step 1: Read Story File

- Load the complete story file
- Parse all metadata fields (executor, quality_gate, status, etc.)
- Extract acceptance criteria section
- Note any missing sections

### Step 2: Verify Executor is Assigned

- Check that the `executor` field exists and is not empty
- Verify executor is a known agent: `@dev`, `@data-engineer`, `@devops`, `@ux-design-expert`, `@analyst`, `@architect`
- If executor is missing or invalid: mark as INVALID with reason

### Step 3: Verify Quality Gate Agent is Assigned

- Check that the `quality_gate` field exists and is not empty
- Verify quality_gate is a known agent: `@architect`, `@dev`, `@pm`
- If quality_gate is missing or invalid: mark as INVALID with reason

### Step 4: Verify Separation of Concerns

- **CRITICAL CHECK**: Verify `executor != quality_gate`
- The agent implementing the story MUST NOT be the same agent reviewing it
- Validate type-to-executor consistency:

| Work Type | Expected Executor | Expected Quality Gate |
|-----------|-------------------|----------------------|
| Code/Features/Logic | @dev | @architect |
| Schema/DB/RLS/Migrations | @data-engineer | @dev |
| Infra/CI/CD/Deploy | @devops | @architect |
| Design/UI Components | @ux-design-expert | @dev |
| Research/Investigation | @analyst | @pm |
| Architecture Decisions | @architect | @pm |

- If executor == quality_gate: mark as INVALID with reason "Separation of concerns violated"

### Step 5: Verify Acceptance Criteria Exist

- Check that the story has at least one acceptance criterion
- Verify acceptance criteria are testable (prefer Given/When/Then format)
- Check that each AC is specific and measurable
- If no acceptance criteria: mark as INVALID with reason

### Step 6: Verify Story Status is Ready

- Check that the story status is "Ready" (or can be promoted to Ready)
- If status is "Draft": check if all validation checks pass, then recommend promotion
- If status is already "In Progress" or "Done": warn but do not block

### Step 7: Generate Validation Report

Produce a structured validation report:

```yaml
validation_result: VALID|INVALID
story_id: '{story_id}'
validated_at: '{ISO-8601 timestamp}'
validator: 'Priya (Product Owner)'

checks:
  executor_assigned:
    status: PASS|FAIL
    value: '{executor agent}'
    reason: '{explanation if FAIL}'

  quality_gate_assigned:
    status: PASS|FAIL
    value: '{quality_gate agent}'
    reason: '{explanation if FAIL}'

  separation_of_concerns:
    status: PASS|FAIL
    reason: '{explanation if FAIL}'

  acceptance_criteria_exist:
    status: PASS|FAIL
    count: {number of ACs}
    reason: '{explanation if FAIL}'

  story_status_ready:
    status: PASS|FAIL
    current_status: '{current status}'
    reason: '{explanation if FAIL}'

issues:
  - '{list of issues found}'

recommendations:
  - '{list of recommendations}'
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation report generated with clear VALID/INVALID result
    tipo: post-condition
    blocker: true
    validacao: |
      Verify validation report contains result, all checks, and reasoning
    error_message: "Post-condition failed: Validation report incomplete"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All 5 validation checks executed with clear PASS/FAIL for each
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert executor, quality_gate, separation, AC, and status checks all ran
    error_message: "Acceptance criterion not met: Not all validation checks executed"

  - [ ] INVALID result includes actionable reasons for each failure
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert every FAIL check has a specific, actionable reason
    error_message: "Acceptance criterion not met: INVALID result lacks actionable reasons"
```

---

## Error Handling

**Strategy:** abort

**Common Errors:**

1. **Error:** Story File Not Found
   - **Cause:** Invalid story_id or incorrect devStoryLocation
   - **Resolution:** Verify story path against core-config.yaml
   - **Recovery:** List available stories, suggest correct ID

2. **Error:** Missing Metadata Fields
   - **Cause:** Story was created without executor/quality_gate fields
   - **Resolution:** Add missing fields to story file
   - **Recovery:** Report which fields are missing, recommend template

3. **Error:** Unknown Agent in Assignment
   - **Cause:** Executor or quality_gate references non-existent agent
   - **Resolution:** Use a valid agent from the known agents list
   - **Recovery:** List valid agents, suggest appropriate assignment

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.005
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- This is a fast validation task; no heavy computation required
- Can be automated as part of story creation pipeline

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - validation
  - story-draft
  - product-owner
  - quality-gate
updated_at: 2026-04-10
```

---

## Handoff

next_agent: @dev
next_command: *develop {story-id}
condition: Validation result is VALID and story status is Ready
alternatives:
  - agent: @sm, command: *draft {story-id}, condition: Validation result is INVALID, needs rework
  - agent: @po, command: *create-story, condition: Story is missing critical sections
