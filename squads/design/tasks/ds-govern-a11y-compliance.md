# Task: ds-govern-a11y-compliance

> Task ID: brad-ds-govern-a11y-compliance  
> Agent: Brad Frost (Design System Architect)  
> Purpose: Keep WCAG governance always current and release-blocking when stale or incomplete.

## Overview

This task operationalizes accessibility standards governance for the design system:

1. Regenerate the canonical checklist from source text.
2. Validate count/coverage/freshness constraints.
3. Enforce release gate checklist.
4. Produce auditable output for CI and handoff.
5. Enforce AI-First governance protocol at task output level.

## Preconditions

- `docs/design-system/accessibility/manifest.json` exists.
- `docs/design-system/accessibility/sources/wcag-22-criteria.pt-BR.md` exists.
- Node.js available.
- `squads/design/protocols/ai-first-governance.md` available.

## Workflow

### Step 1: Regenerate canonical checklist

```bash
npm run checklists:a11y:generate
```

Expected:
- `squads/design/checklists/ds-accessibility-wcag-checklist.md` atualizado/sincronizado.
- Counts: `87 total`, `86 active`, `1 removed`.

### Step 2: Validate governance

```bash
npm run validate:a11y-checklists
node squads/design/scripts/validate-a11y-integration.cjs
```

Validation must fail when:
- IDs are missing/duplicated,
- counts diverge,
- manifest is stale,
- integration artifacts are missing.

### Step 3: Execute release gate checklist

Checklist:
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`

Mark gate as **APPROVED** only when all checks pass.

### Step 4: Emit governance report

Write a short report in:
- `outputs/design-system/accessibility/governance-report.md`

Include:
- date/time
- command outputs summary
- pass/fail status
- blocking reasons (if any)
- explicit dependency status: `Implemented`, `Partially implemented`, `Concept only`
- unresolved items and contradiction check result

## Success Criteria

- Canonical WCAG checklist regenerated and validated.
- Release gate checklist fully checked.
- CI can reproduce the same pass/fail result.
- No manual criterion drift.

## Output

- `outputs/design-system/accessibility/governance-report.md`
- Status do gate `APPROVED`/`BLOCKED` com evidências
- Registro de execução dos checklists:
  - `squads/design/checklists/ds-accessibility-wcag-checklist.md`
  - `squads/design/checklists/ds-a11y-release-gate-checklist.md`

## Related Checklists

- `squads/design/checklists/ds-accessibility-wcag-checklist.md`
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`


## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
