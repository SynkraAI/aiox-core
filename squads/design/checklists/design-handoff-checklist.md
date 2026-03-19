# Design System Handoff Checklist

**Purpose:** Validate clean handoffs for DS execution and cross-squad routing.

## 1. Context Integrity

- [ ] Original request captured
- [ ] Objective and success criteria explicit
- [ ] Constraints documented (timeline/stack/governance)
- [ ] Current phase/state identified

## 2. Artifact Integrity

- [ ] Changed files listed with paths
- [ ] Deliverable status marked (`COMPLETE|IN_PROGRESS|BLOCKED`)
- [ ] Pending issues listed
- [ ] Required references attached (registry, token schema, reports)

## 3. Technical Integrity

- [ ] No broken paths in handoff payload
- [ ] No placeholder-only sections
- [ ] Acceptance criteria for next owner defined
- [ ] Risks and assumptions declared

## 4. Scope Integrity

- [ ] Request classified as `in_scope` or `out_of_scope`
- [ ] If out-of-scope, routed to correct squad:
  - [ ] `/Brand` for brand/logo/pricing
  - [ ] `/ContentVisual` for thumbnail/photo/video
- [ ] DS squad did not execute out-of-scope work

## 5. DS Flow Checks

### 5.1 DesignOps -> Architecture (`@dave-malouf -> @brad-frost`)
- [ ] Operating constraints are explicit
- [ ] Team/process maturity status included
- [ ] Tooling constraints included

### 5.2 Architecture -> Orchestration (`@brad-frost -> @design-chief`)
- [ ] Component/token decisions captured
- [ ] Rollout/review requirement captured
- [ ] Registry/metadata impact captured

### 5.3 Adoption -> Execution (`@dan-mall -> @dave-malouf` or `@brad-frost`)
- [ ] Stakeholder concerns documented
- [ ] Adoption narrative and ROI points included
- [ ] Execution ask is concrete and measurable

## 6. Sign-off

- [ ] Sender confirmed handoff completeness
- [ ] Receiver confirmed handoff clarity
- [ ] Next action owner and deadline assigned
