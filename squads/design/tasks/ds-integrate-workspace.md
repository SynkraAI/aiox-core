# Integrate Design System with Workspace Structure

> Task ID: brad-ds-integrate-workspace
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Description

Align the design system with the workspace topology:

- `workspace/domains/design-system`
- `workspace/system`
- `workspace/ui`

This task creates clear boundaries for tokens, primitives, patterns, and product-ready components.

## Prerequisites

- Existing design squad setup (`squads/design`)
- Workspace directory available
- Tailwind v4 strategy defined (`@theme`)
- Decision on registry-first distribution (Shadcn model)

## Workflow

1. **Map Current State**
- Inventory token files, component files, and style utilities.
- Classify by role: token source, primitive, product UI.

2. **Create Target Workspace Structure**
- `workspace/domains/design-system/tokens/primitives`
- `workspace/domains/design-system/tokens/semantic`
- `workspace/domains/design-system/tokens/component`
- `workspace/domains/design-system/themes`
- `workspace/domains/design-system/metadata`
- `workspace/system/primitives`
- `workspace/system/patterns`
- `workspace/ui/components`
- `workspace/ui/blocks`

3. **Define Ownership Boundaries**
- `domains/design-system`: token truth and themes.
- `system`: reusable Radix/Shadcn primitives and patterns.
- `ui`: app-facing composed components and blocks.

4. **Wire Configuration**
- Add mapping files under `config/mappings/`:
  - `colors.json`
  - `spacing.json`
  - `components.json`
- Ensure mappings are generated from tokens, not hardcoded.

5. **Integrate with Registry Flow**
- Place `registry.json` in `workspace/ui/`.
- Ensure component metadata references source paths and dependencies.

6. **Validation**
- Verify no circular dependencies between `domains`, `system`, and `ui`.
- Verify component imports only flow upward:
  - `domains` -> `system` -> `ui`
- Validate with lint, typecheck, and tests.

7. **Documentation**
- Generate migration notes:
  - old path -> new path
  - rollback plan
  - unresolved gaps

## Deliverables

- Workspace-aligned folder topology
- Token ownership boundaries documented
- Mapping config files added/updated
- `workspace/ui/registry.json` strategy in place
- Migration report with file move matrix

## Success Criteria

- [ ] Workspace layers are explicit and stable
- [ ] Token hierarchy is split (primitives/semantic/component)
- [ ] Registry flow resolves components from `workspace/ui`
- [ ] Import direction is deterministic (`domains` -> `system` -> `ui`)
- [ ] Migration steps documented and reproducible

## Notes

- Prefer configuration over hardcoded mappings.
- Keep token names stable to avoid migration churn.
- Treat workspace topology as architecture, not temporary structure.


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
