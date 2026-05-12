# Export Design Tokens to W3C DTCG

> Task ID: brad-export-design-tokens-dtcg  
> Agent: Brad (Design System Architect)  
> Version: 1.0.0

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
task: exportDesignTokensDtcg()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

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
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Description

Produce W3C Design Tokens (DTCG v2025.10) exports from the canonical YAML tokens file. Validates schema compliance, OKLCH color usage, and publishes artifacts for downstream platforms (web, iOS, Android, Flutter).

## Prerequisites

- tokens.yaml generated via *tokenize (core/semantic/component layers present)
- Node.js ≥ 18 / Python ≥ 3.10 (for validation tools)
- DTCG CLI or schema validator installed (`npm install -g @designtokens/cli` recommended)

## Workflow

1. **Load Source Tokens**
   - Read `tokens.yaml` and confirm metadata (dtcg_spec, color_space)
   - Ensure layers exist: `core`, `semantic`, `component`
   - Verify coverage >95% stored in `.state.yaml`

2. **Generate DTCG JSON**
   - Transform YAML into DTCG JSON structure
   - Ensure each token includes `$type`, `$value`, optional `$description`
   - Map references using `{layers.semantic.color.primary}` style
   - Save as `tokens.dtcg.json`

3. **Produce Platform Bundles (Optional)**
   - Run Style Dictionary / custom scripts for platform-specific outputs
   - Targets: web (CSS), Android (XML), iOS (Swift), Flutter (Dart)
   - Store under `tokens/exports/{platform}/`

4. **Validate**
   - `dtcg validate tokens.dtcg.json`
   - Lint OKLCH values (ensure `oklch()` format, fallback to hex flagged)
   - Confirm references resolve (no missing paths)

5. **Document & Publish**
   - Update `docs/tokens/README.md` with export details, version, changelog
   - Attach validator output and coverage metrics
   - Update `.state.yaml` (tokens.dtcg path, validator status, timestamp)

## Output

- `tokens.dtcg.json` (W3C compliant)
- Optional platform bundles (CSS, Android XML, Swift, Flutter)
- Validation report (`tokens/validation/dtcg-report.json`)
- Updated `.state.yaml` tokens section

## Success Criteria

- [ ] tokens.dtcg.json passes W3C validator with zero errors
- [ ] OKLCH color space used; fallbacks documented
- [ ] References (`$value`) resolve across layers
- [ ] Platform exports updated (if enabled) and smoke-tested
- [ ] Documentation + changelog refreshed with version/date
- [ ] `.state.yaml` reflects dtcg export path and status

## Error Handling

- **Invalid schema**: Capture validator output, fix offending tokens, rerun export
- **Missing reference**: Trace YAML source, ensure token exists or adjust alias
- **Unsupported color format**: Convert to OKLCH or fallback with explanation
- **Platform export failure**: Roll back platform-specific step, flag follow-up action

## Notes

- Keep token versions semantically versioned (e.g., 1.1.0 for new tokens)
- Coordinate with platform teams before breaking changes (e.g., renaming tokens)
- Store validation reports alongside artifacts for audit/compliance
