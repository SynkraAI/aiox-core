# AIOS 4.0.4 - Objective Differentiation Plan

Date: 2026-02-16
Status: Active

## Strategic Principle

Differentiate AIOS with its own product identity, with learning-curve reduction as the top priority.

## Workstreams

0. Learning curve first (P0)
1. Runtime-first (Flow State Engine)
2. Compatibility Contract by IDE/release
3. Assisted autonomy with risk profiles
4. Structured inter-agent handoffs
5. Delivery Confidence Score
6. Vertical specialization (data-engineer, devops, squad-creator)
7. Brownfield as premium capability
8. Native agent-flow observability
9. Live ADR as executable contract
10. AIOS-first terminology

## Wave Plan

### Wave 0 (P0)
- Learning curve reduction.
- Single onboarding path and first-value <=10 min.

### Wave 1
- Flow-state runtime guidance.
- Compatibility contract and parity blocking.
- Risk-based execution profiles.

### Wave 2
- Structured handoffs.
- Delivery confidence score.
- Agent decision timeline observability.

### Wave 3
- Vertical specialization clarity and public examples.
- Brownfield premium track with rollback strategy.
- Live ADR validations.
- Terminology hardening and semantic lint.

## Sprint Sequence

- Sprint 1: onboarding metric + IDE activation clarity.
- Sprint 2: onboarding rewrite + flow-state design.
- Sprint 3: flow-state implementation + onboarding smoke tests.
- Sprint 4: compatibility contract + execution profiles + structured handoffs.
- Sprint 5: delivery confidence score.
- Sprint 6: vertical specialization + brownfield premium + taxonomy hardening.

## Merge Gates

- P0 Gate (after Sprint 3): onboarding metric validated, beginner path published, IDE matrix clear, flow-state working, onboarding smoke tests green.
- P1 Gate (after Sprint 5): contract-vs-implementation CI blocking enabled, execution profiles audited, handoff package validated, confidence score operational.
- P2 Gate (after Sprint 6): vertical tracks reproducible, brownfield pipeline documented/tested, taxonomy lint active with no regressions.

## Branch Strategy

- Branch by sub-stream item: `feat/aios-diff-<id>-<slug>`.
- Merge order: P0 -> P1 -> P2.
- Base branch: `main`.
- No merge without lint, typecheck, tests, and parity validation when applicable.

## Delivery Rules

- No public claim without corresponding validation.
- No safety profile without explicit policy and audit log.
- No handoff without snapshot, decision log, evidence links, and open risks.

### Onboarding Smoke Baseline (4.0.5)

Onboarding smoke validation is operational via `tests/integration/onboarding-smoke.test.js` and covers:

- clean-environment command readiness
- "Comece Aqui" flow contract in docs
- first-value activation signal (`generate-greeting`) with deterministic timer check

### Structured Handoff Standard (4.2.1)

AIOS now persists a deterministic handoff package at every workflow phase completion:

- Stored in phase state: `.aios/workflow-state/{workflow-id}.json` -> `phases.{n}.handoff`
- Stored as artifact: `.aios/workflow-state/handoffs/{workflow-id}-phase-{n}.handoff.json`

Mandatory sections:

- `context_snapshot`
- `decision_log`
- `evidence_links`
- `open_risks`

### Delivery Confidence Score Standard (4.2.2)

AIOS now computes a deterministic delivery confidence score per workflow from runtime artifacts and phase validations.

- Stored in workflow state metadata: `.aios/workflow-state/{workflow-id}.json` -> `metadata.delivery_confidence`
- Stored as artifact: `.aios/workflow-state/confidence/{workflow-id}.delivery-confidence.json`

Formula (version `1.0.0`):

```text
confidence = (
  test_coverage * 0.25 +
  ac_completion * 0.30 +
  risk_score_inv * 0.20 +
  debt_score_inv * 0.15 +
  regression_clear * 0.10
) * 100
```

Default gate policy:

- `threshold = 70`
- Workflow status fails confidence gate when `score < threshold`
- Threshold is configurable via runtime option or `AIOS_DELIVERY_CONFIDENCE_THRESHOLD`
