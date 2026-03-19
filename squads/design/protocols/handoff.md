# Design System Squad - Handoff Protocol

**Version:** 2.0.0  
**Purpose:** Preserve context across DS agents and cross-squad delegation.

## Standard Format

```yaml
handoff:
  from: "@{current-agent}"
  to: "@{target-agent}|/{target-squad}"
  project: "{project-name}"
  objective: "{goal}"
  completed:
    - "{done_1}"
  artifacts:
    - "{path_1}"
  constraints:
    - "{constraint_1}"
  open_risks:
    - "{risk_1}"
  next_steps:
    - "{next_step_1}"
```

## Intra-Squad Flows

### 1. DesignOps -> Design System Architecture
`@dave-malouf -> @brad-frost`

Use when operations diagnosis is complete and implementation starts.

### 2. Architecture -> Orchestration
`@brad-frost -> @design-chief`

Use when work requires staged rollout, review routing, or cross-squad coordination.

### 3. Adoption Narrative -> Ops/Architecture
`@dan-mall -> @dave-malouf` and/or `@brad-frost`

Use when buy-in is secured and execution plan must be formalized.

## Cross-Squad Flows

### 4. DS -> Brand
`@design-chief -> /Brand`

Use when request is logo, brand strategy, positioning, or pricing.

### 5. DS -> Content Visual
`@design-chief -> /ContentVisual`

Use when request is thumbnail, YouTube visuals, photography, or editing.

## Quality Rules

- No handoff without explicit objective.
- No handoff without artifact paths.
- No out-of-scope execution inside `squads/design`.
- Receiver must confirm acceptance before execution.
