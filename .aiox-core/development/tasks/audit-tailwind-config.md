# Audit Tailwind v4 Configuration & Utility Health

> Task ID: brad-audit-tailwind-config  
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
task: auditTailwindConfig()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid path or identifier

- campo: options
  tipo: object
  origem: config
  obrigatório: false
  validação: Analysis configuration

- campo: depth
  tipo: number
  origem: User Input
  obrigatório: false
  validação: Default: 1 (0-3)

**Saída:**
- campo: analysis_report
  tipo: object
  destino: File (.ai/*.json)
  persistido: true

- campo: findings
  tipo: array
  destino: Memory
  persistido: false

- campo: metrics
  tipo: object
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target exists and is accessible; analysis tools available
    tipo: pre-condition
    blocker: true
    validação: |
      Check target exists and is accessible; analysis tools available
    error_message: "Pre-condition failed: Target exists and is accessible; analysis tools available"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Analysis complete; report generated; no critical issues
    tipo: post-condition
    blocker: true
    validação: |
      Verify analysis complete; report generated; no critical issues
    error_message: "Post-condition failed: Analysis complete; report generated; no critical issues"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Analysis accurate; all targets covered; report complete
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert analysis accurate; all targets covered; report complete
    error_message: "Acceptance criterion not met: Analysis accurate; all targets covered; report complete"
```

---

## Scripts

**Agent-specific code for this task:**

- **Script:** analyze-codebase.js
  - **Purpose:** Codebase analysis and reporting
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/analyze-codebase.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Target Not Accessible
   - **Cause:** Path does not exist or permissions denied
   - **Resolution:** Verify path and check permissions
   - **Recovery:** Skip inaccessible paths, continue with accessible ones

2. **Error:** Analysis Timeout
   - **Cause:** Analysis exceeds time limit for large codebases
   - **Resolution:** Reduce analysis depth or scope
   - **Recovery:** Return partial results with timeout warning

3. **Error:** Memory Limit Exceeded
   - **Cause:** Large codebase exceeds memory allocation
   - **Resolution:** Process in batches or increase memory limit
   - **Recovery:** Graceful degradation to summary analysis

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

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

Review Tailwind CSS v4 setup to guarantee @theme layering, content scanning, utility hygiene, and performance baselines are correct. Produces remediation plan and metrics.

## Prerequisites

- Tailwind v4 installed (or upgrade plan underway)
- Access to codebase for static analysis
- Ability to run Tailwind build locally

## Workflow

1. **Collect Context**
   - Locate primary CSS entry (`app.css`, `src/styles.css`, etc.)
   - Identify additional `@imports`, custom utilities, plugins
   - Read `.state.yaml` for current Tailwind metadata (if available)

2. **Validate @theme Layers**
   - Ensure tokens defined within `@theme` grouped as core → semantic → component
   - Confirm dark mode overrides (`[data-theme="dark"]`) map to semantic tokens
   - Check no residual `theme.extend` references exist

3. **Inspect @layer Usage**
   - `@layer base`: Resets, typography, `focus-visible`
   - `@layer components`: Reusable abstractions (e.g., `.form-label`)
   - `@layer utilities`: Custom utility definitions with `@utility`
   - Verify ordering (base → components → utilities) and duplication avoidance

4. **Content & Purge Coverage**
   - Review Tailwind CLI entry for `content` globs (JIT purge)
   - Ensure glob coverage includes `.tsx`, `.jsx`, `.mdx`, Storybook stories, templates
   - Flag false negatives (classes generated dynamically) and propose safelist

5. **Utility Health Scan**
   - Run class collision detection (tailwind-merge or eslint-plugin-tailwindcss)
   - Identify redundant custom utilities replaced by tokens/variants
   - Detect legacy classes (e.g., `outline-none` instead of `outline-hidden`)

6. **Performance Snapshot**
   - Record build metrics (cold + incremental)
   - Capture CSS bundle size, number of utilities generated
   - Compare with target benchmarks (Oxide reference)

7. **Report & Remediation**
   - Summarize findings (pass/warn/fail) in `docs/reports/tailwind-audit.md`
   - Provide prioritized action list (tokens to add, utilities to remove, config fixes)
   - Update `.state.yaml` with audit timestamp, benchmark data, outstanding actions

## Output

- Audit report (`docs/reports/tailwind-audit.md`)
- Updated `.state.yaml` under `tooling.tailwind` (validation + metrics)
- Optional lint/config patches (ESLint Tailwind rules, Prettier plugin settings)

## Success Criteria

- [ ] `@theme` defines full token stack with no missing categories
- [ ] `@layer` usage consistent and free of duplicate definitions
- [ ] Content paths cover 100% of templates (no orphaned utilities)
- [ ] tailwind-merge/eslint scans zero conflicts or all logged issues resolved
- [ ] Build metrics captured (cold/incremental) and comparable to prior baseline
- [ ] Recommendations documented with owners + due dates
- [ ] `.state.yaml` updated (`tailwind_theme_validated: true/false`) and audit timestamp logged

## Tools & Commands

- Tailwind CLI build: `npx tailwindcss -i ./app.css -o ./dist.css --watch`
- Utility audit: `npx @tailwindcss/oxide --analyze`
- ESLint Tailwind plugin: `eslint --ext .tsx src`
- tailwind-merge checker: integrate via ESLint rule `tailwindcss/no-contradicting-classname`

## Notes

- Encourage automated linting (ESLint + prettier-plugin-tailwindcss) post-audit
- Document class naming conventions (order: layout → size → spacing → typography → color → effect)
- Track manual overrides (safelist patterns, arbitrary values) for future cleanup
