# Tailwind CSS v4 Upgrade Playbook

> Task ID: brad-tailwind-upgrade  
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
task: tailwindUpgrade()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Config

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
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Description

Plan and execute migration from Tailwind CSS v3 (or earlier) to v4 (Oxide engine). Covers risk assessment, @theme conversion, Oxide benchmarks, dependency alignment, and human-in-the-loop verification.

## Prerequisites

- Existing Tailwind configuration and usage inventoried (*audit command recommended)
- Node.js ≥ 18.17 (prefer 20+)
- Access to CI pipelines and performance metrics
- Visual regression tooling (Chromatic, Lost Pixel, or equivalent)

## Workflow

### 1. Discovery & Planning
- Capture current Tailwind version, build times, CSS bundle size
- Identify PostCSS/Sass/Less/Stylus usage (must be removed/replaced)
- List third-party libraries dependent on `tailwind.config.js` (e.g. daisyUI)

### 2. Dry Run Upgrade
- Create feature branch `chore/tailwind-v4-upgrade`
- Run official upgrade CLI
  ```bash
  npx @tailwindcss/upgrade
  ```
- Convert config to CSS-first structure (`app.css` with `@import "tailwindcss";`)
- Replace `tailwind.config.js` customizations with `@theme`, `@layer`, `@plugin` CSS equivalents

### 3. Token & Utility Validation
- Ensure design tokens re-exported via `@theme` (core, semantic, component layers)
- Regenerate CSS utilities relying on previous `theme.extend`
- Validate arbitrary values still required; prefer tokenized utilities
- Confirm `@container`, `@starting-style`, 3D transforms working

### 4. Benchmark Oxide Engine
- Measure cold build, incremental build (with and without new CSS)
- Target benchmarks (Catalyst reference):
  - Cold build ≤ 120ms (target <100ms)
  - Incremental (new CSS) ≤ 8ms
  - Incremental (no CSS) ≤ 300µs
- Record metrics in README/Changelog

### 5. Regression Testing
- Run full unit + integration suite
- Execute visual regression (Chromatic/Lost Pixel) to detect class/utility drift
- Verify dark mode, theming, and Tailwind plugins still functional

### 6. Documentation & Rollout
- Update contributing docs with new `@theme` usage
- Refresh `.cursorrules` / coding guidelines (Tailwind v4 best practices)
- Communicate rollout checklist to team, include fallback steps

### 7. Update State
- Log upgrade metadata in `.state.yaml` (tailwind_version, benchmarks, validation status)
- Flag `tailwind_theme_validated: true` when `@theme` layers verified

## Deliverables

- Updated `app.css` (or dedicated entry) with `@theme` definitions
- Removed/archived legacy `tailwind.config.js` (if not required)
- Benchmarks documented (`docs/logs/tailwind-upgrade.md` or similar)
- Regression test results (links/screenshots)
- `.state.yaml` updated with upgrade details

## Success Criteria

- [ ] Tailwind upgraded to v4, builds pass locally and in CI
- [ ] `@theme` defines all design tokens (colors, spacing, typography, etc.)
- [ ] Oxide benchmarks recorded and meet targets (<30s cold build, <1ms incremental)
- [ ] CSS bundle size ≤ previous production size (ideally <50KB gzipped)
- [ ] No visual regressions (diff <1% or consciously accepted)
- [ ] Documentation (.cursorrules, README) reflects v4 workflow
- [ ] `.state.yaml` updated (`tailwind_theme_validated`, benchmarks, timestamp)

## Rollback Plan

1. `git revert` upgrade commits (config + package lock)
2. Restore previous `tailwind.config.js`
3. Reinstall previous Tailwind version
4. Re-run build/tests to ensure stability

## Notes

- Remove or replace Sass/Less/Stylus pipelines (v4 does not support preprocessors)
- Tailwind plugins may require v4-compatible versions (@tailwindcss/forms/typography/container-queries)
- Validate IDE tooling (Tailwind IntelliSense, Prettier plugin) upgraded to v4-aware releases
- Encourage incremental adoption: keep feature flags until confidence is high
