# Design Triage - Design System Scope Gate

> Task ID: design-triage
> Agent: Design Chief
> Version: 2.0.0

## Purpose

Classify incoming requests and route them correctly:

- in-scope -> execute inside `squads/design`
- out-of-scope -> handoff to `squads/brand` or `squads/content-visual`

## Inputs

- `request`: user request text
- `context` (optional): constraints, deadline, stack, existing artifacts

## Classification

```yaml
in_scope:
  - design system
  - component architecture
  - tokens
  - atomic refactor
  - accessibility/wcag/aria
  - registry/metadata/mcp
  - designops for design system

out_of_scope_brand:
  - brand strategy
  - logo
  - pricing/proposal positioning

out_of_scope_content_visual:
  - thumbnail/youtube
  - photography/lighting
  - photo/video editing
```

## Workflow

1. Parse objective and deliverable.
2. Match against classification map.
3. If in-scope, route by domain:
   - DS architecture/tokens/components -> `@brad-frost`
   - DesignOps/process/adoption model -> `@dave-malouf`
   - Stakeholder buy-in and DS narrative -> `@dan-mall`
4. If out-of-scope:
   - brand/logo/pricing -> `/Brand`
   - thumbnail/photo/video -> `/ContentVisual`
5. Return routing decision with rationale and next step.

## Output Contract

```yaml
triage_result:
  scope: "in_scope|out_of_scope"
  domain: "design-system|designops|adoption|brand|content-visual"
  route_to: "@agent-or-/Squad"
  confidence: "high|medium|low"
  rationale:
    - "matched keyword/domain"
  next_step:
    - "exact task/workflow to start"
```

## Quality Gates

- Must declare scope explicitly.
- Must include one clear route target.
- Must not keep out-of-scope work in this squad.


## Related Checklists

- `squads/design/checklists/design-handoff-checklist.md`
- `squads/design/checklists/design-team-health-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
