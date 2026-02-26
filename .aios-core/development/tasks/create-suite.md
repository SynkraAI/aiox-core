---
tools:
  - github-cli
# TODO: Create test-suite-checklist.md for validation (follow-up story needed)
# checklists:
#   - test-suite-checklist.md
---

# Task: Create Component Suite

**Agent:** aios-developer  
**Version:** 1.0  
**Command:** *create-suite

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
task: createSuite()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty, lowercase, kebab-case

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid JSON object with allowed keys

- campo: force
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false

**Saída:**
- campo: created_file
  tipo: string
  destino: File system
  persistido: true

- campo: validation_report
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
  - [ ] Target does not already exist; required inputs provided; permissions granted
    tipo: pre-condition
    blocker: true
    validação: |
      Check target does not already exist; required inputs provided; permissions granted
    error_message: "Pre-condition failed: Target does not already exist; required inputs provided; permissions granted"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Resource created successfully; validation passed; no errors logged
    tipo: post-condition
    blocker: true
    validação: |
      Verify resource created successfully; validation passed; no errors logged
    error_message: "Post-condition failed: Resource created successfully; validation passed; no errors logged"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Resource exists and is valid; no duplicate resources created
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert resource exists and is valid; no duplicate resources created
    error_message: "Acceptance criterion not met: Resource exists and is valid; no duplicate resources created"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Generate new components from templates
  - **Source:** .aios-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/create-component.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Resource Already Exists
   - **Cause:** Target file/resource already exists in system
   - **Resolution:** Use force flag or choose different name
   - **Recovery:** Prompt user for alternative name or force overwrite

2. **Error:** Invalid Input
   - **Cause:** Input name contains invalid characters or format
   - **Resolution:** Validate input against naming rules (kebab-case, lowercase, no special chars)
   - **Recovery:** Sanitize input or reject with clear error message

3. **Error:** Permission Denied
   - **Cause:** Insufficient permissions to create resource
   - **Resolution:** Check file system permissions, run with elevated privileges if needed
   - **Recovery:** Log error, notify user, suggest permission fix

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
  - creation
  - setup
updated_at: 2025-11-17
```

---


## Description
Creates multiple related components in a single batch operation with dependency resolution and transaction support.

## Context Required
- Project structure understanding
- Component relationships
- Existing components for dependency resolution

## Prerequisites
- aios-developer agent is active
- Template system is configured
- team-manifest.yaml exists

## Interactive Elicitation
1. Suite type selection (agent package, workflow suite, task collection, custom)
2. Component configuration based on suite type
3. Dependency validation
4. Preview of all components to be created
5. Confirmation before batch creation

## Workflow Steps

### 1. Suite Type Selection
- **Action:** Choose from predefined suite types or custom
- **Validation:** Ensure suite type is supported

### 2. Configure Components
- **Action:** Gather configuration for each component in suite
- **Validation:** Validate naming conventions and dependencies

### 3. Analyze Dependencies
- **Action:** Build dependency graph between components
- **Validation:** Check for circular dependencies

### 4. Preview Suite
- **Action:** Show preview of all components to be created
- **Validation:** User confirmation required

### 5. Create Components
- **Action:** Create components in dependency order
- **Validation:** Each component must be created successfully

### 6. Update Manifest
- **Action:** Update team-manifest.yaml with all new components
- **Validation:** Manifest must remain valid YAML

## Error Handling
- **Missing Dependencies:** Prompt to create or select existing
- **Name Conflicts:** Show existing components and suggest alternatives
- **Creation Failures:** Offer rollback of entire transaction
- **Manifest Errors:** Show diff and allow manual correction

## Output
- Success/failure status for each component
- Transaction ID for potential rollback
- Updated manifest with all new components
- Summary of created files and locations

## Security Considerations
- All generated code is validated by SecurityChecker
- File paths are sanitized to prevent traversal
- Transaction log is write-protected

## Notes
- Supports atomic creation (all or nothing)
- Transaction log enables rollback functionality
- Dependency resolution ensures correct creation order

## Handoff
next_agent: @dev
next_command: *run-tests
condition: Test suite created, ready for execution
alternatives:
  - agent: @qa, command: *review {story-id}, condition: Tests written as part of review
- Preview functionality helps prevent mistakes 