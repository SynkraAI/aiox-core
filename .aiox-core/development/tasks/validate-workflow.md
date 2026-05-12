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

## Task Definition (AIOX Task Format V1.0)

```yaml
task: validateWorkflow()
responsavel: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: workflow_path
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Path to specific workflow YAML file

- campo: workflow_name
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Resolves to workflow file by name

- campo: target_context
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "core", "squad", or "hybrid". Default: "core"

- campo: squad_name
  tipo: string
  origem: User Input
  obrigatório: false (required when target_context="squad" or "hybrid")
  validação: Must be kebab-case, squad must exist in squads/

- campo: strict
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false. When true, warnings become errors

- campo: all
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false. When true, validate all workflows in context

**Saída:**
- campo: validation_result
  tipo: object
  destino: Memory
  persistido: false

- campo: report
  tipo: string
  destino: Output
  persistido: false

- campo: exit_code
  tipo: number
  destino: Return value
  persistido: false
  validação: 0=valid, 1=invalid
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] At least one of workflow_path, workflow_name, or all flag must be provided
    tipo: pre-condition
    blocker: true
    validação: |
      Check that workflow_path OR workflow_name OR all=true is provided
    error_message: "Pre-condition failed: Must specify workflow_path, workflow_name, or --all flag"
  - [ ] When target_context="squad", squad directory must exist
    tipo: pre-condition
    blocker: true
    validação: |
      If target_context is "squad", verify squads/{squad_name}/ exists
    error_message: "Pre-condition failed: Squad '{squad_name}' not found in squads/"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation report generated and displayed
    tipo: post-condition
    blocker: true
    validação: |
      Verify validation report was generated with errors/warnings/result
    error_message: "Post-condition failed: Validation report not generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All specified workflow files validated; report displayed; exit code returned
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert each workflow file was validated and results consolidated
    error_message: "Acceptance criterion not met: Validation incomplete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** workflow-validator
  - **Purpose:** Validate workflow YAML files
  - **Source:** .aiox-core/development/scripts/workflow-validator.js

- **Tool:** file-system
  - **Purpose:** File discovery and reading
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** workflow-validator.js
  - **Purpose:** WorkflowValidator class with sub-validators
  - **Language:** JavaScript
  - **Location:** .aiox-core/development/scripts/workflow-validator.js

---

## Error Handling

**Strategy:** continue (validate all files even if some fail)

**Common Errors:**

1. **Error:** Workflow File Not Found
   - **Cause:** Specified workflow path or name does not resolve to a file
   - **Resolution:** Check the path/name and target context
   - **Recovery:** List available workflows and suggest correct name

2. **Error:** YAML Parse Error
   - **Cause:** Invalid YAML syntax in workflow file
   - **Resolution:** Fix YAML syntax issues
   - **Recovery:** Show line/column of syntax error

3. **Error:** Missing Required Fields
   - **Cause:** Workflow missing workflow.id, workflow.name, or execution array
   - **Resolution:** Add `workflow.sequence` (official). `workflow.phases` is accepted for compatibility only.
   - **Recovery:** Show which fields are missing with examples

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 1-5 min (estimated)
cost_estimated: $0.001-0.005
token_usage: ~500-1,500 tokens
```

**Optimization Notes:**
- Validate files in parallel when --all is used
- Cache agent file existence checks across validations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - workflow-validator.js
tags:
  - validation
  - workflow
  - quality
updated_at: 2026-01-31
```

---

# Validate Workflow Task

## Purpose

To validate workflow YAML files against AIOX conventions, checking structure, agent references, artifact flow, and logical consistency. Supports validating a single workflow or all workflows in a given context (core or squad).

## Prerequisites

- WorkflowValidator class available at `.aiox-core/development/scripts/workflow-validator.js`
- Target workflow file(s) must exist

## Elicitation Points

The following inputs are collected before execution:

1. **workflow_path** or **workflow_name** — Which workflow(s) to validate (one required unless `--all`)
2. **target_context** — Where to look for the workflow: `core`, `squad`, or `hybrid` (default: `core`)
3. **squad_name** — Required when target_context is `squad` or `hybrid`
4. **strict** — Treat warnings as errors (default: `false`)
5. **all** — Validate all workflows in the resolved context (default: `false`)

## Task Execution

### 1. Resolve Target Path(s)

Based on inputs, resolve which workflow files to validate:

**Single file by path:**
- Use `workflow_path` directly

**Single file by name:**
- Resolve based on target_context:
  - `core` → `.aiox-core/development/workflows/{workflow_name}.yaml`
  - `squad` → `squads/{squad_name}/workflows/{workflow_name}.yaml`
  - `hybrid` → `squads/{squad_name}/workflows/{workflow_name}.yaml`

**All workflows (--all flag):**
- Scan directory based on target_context:
  - `core` → all `.yaml` files in `.aiox-core/development/workflows/`
  - `squad` → all `.yaml` files in `squads/{squad_name}/workflows/`
  - `hybrid` → all `.yaml` files in `squads/{squad_name}/workflows/`

### 2. Run Validation

For each resolved workflow file:
1. Instantiate `WorkflowValidator` with options `{ strict, verbose }`
   - For `hybrid` context: also pass `squadAgentsPath: squads/{squad_name}/agents/`
2. Call `validator.validate(workflowPath)`
3. Collect results

### 3. Consolidate Results

When validating multiple files:
- Merge all errors, warnings, and suggestions
- Track per-file results for detailed reporting
- Overall valid = all files valid

### 4. Display Report

Format and display results using `validator.formatResult()`:

```text
=== Workflow Validation Report ===

Workflow: greenfield-service.yaml
  Errors: 0
  Warnings: 1
    - [WF_MISSING_HANDOFF]: Workflow has 5 agent transitions but no handoff_prompts
  Result: VALID (with warnings)

Workflow: brownfield-ui.yaml
  Errors: 0
  Warnings: 0
  Result: VALID

--- Summary ---
Files validated: 2
Valid: 2 (1 with warnings)
Invalid: 0
```

### 5. Return Exit Code

- `0` — all workflows valid (warnings allowed unless --strict)
- `1` — one or more workflows invalid

## Integration

- Called by `*validate-workflow` command in aiox-master
- Called by `SquadValidator.validateWorkflows()` during squad validation
- Can be called by `FrameworkAnalyzer.validateWorkflow()` for analysis
