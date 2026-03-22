# Template: STATE.yaml (L3 Project State)

## Minimal

```yaml
# STATE.yaml — Project State Machine
# Keep under 1000 tokens. This is a summary, not a document.

project:
  name: "{Project Name}"
  status: "{active | paused | completed}"
  phase: "{current phase}"
  started: "{YYYY-MM-DD}"

phases:
  - name: "PLANNING"
    status: "{done | active | pending}"
  - name: "EXECUTION"
    status: "{done | active | pending}"
  - name: "REVIEW"
    status: "{done | active | pending}"
  - name: "DELIVERY"
    status: "{done | active | pending}"

next_steps:
  - "{Next action 1}"
  - "{Next action 2}"

blockers: []
```

## Standard

```yaml
project:
  name: "{Project Name}"
  id: "{PROJ-001}"
  status: active
  phase: "EXECUTION"
  started: "{YYYY-MM-DD}"
  target: "{YYYY-MM-DD}"

phases:
  - name: "PLANNING"
    status: done
    completed: "{date}"
    gate_score: 0.92
  - name: "BRIEFING"
    status: done
    completed: "{date}"
    gate_score: 0.88
  - name: "EXECUTION"
    status: active
    started: "{date}"
    artifacts:
      - path: "outputs/{artifact}"
        status: "{draft | review | done}"
  - name: "REVIEW"
    status: pending
  - name: "DELIVERY"
    status: pending

decisions:
  - id: "DEC-001"
    date: "{date}"
    decision: "{What was decided}"
    rationale: "{Why}"
    # Full log: DECISIONS.md

next_steps:
  - "{Priority 1}"
  - "{Priority 2}"

blockers:
  - description: "{Blocker}"
    severity: "{high | medium | low}"
    owner: "{who can unblock}"

session:
  last: "{SES-ID}"
  handoff: "docs/sessions/{YYYY-MM}/handoff-{SES-ID}.md"
```

## DECISIONS.md Template (append-only)

```markdown
# Decisions Log

## DEC-001 | {YYYY-MM-DD}
**Decision:** {What was decided}
**Context:** {Why this came up}
**Rationale:** {Why this option was chosen}
**Alternatives considered:** {What was rejected and why}
**Status:** Active

---

## DEC-002 | {YYYY-MM-DD}
...
```

## INDEX.md Template

```markdown
# {Project Name} — Index

## Artifacts

| Artifact | Path | Status | Layer |
|----------|------|--------|-------|
| {name} | {path} | {status} | {L-number} |

## Key Files
- State: `STATE.yaml`
- Decisions: `DECISIONS.md`
- Latest handoff: `docs/sessions/{path}`

## Related
- Product: `.brain/entities/products/{product}.yaml`
- ICP: `.brain/entities/personas/{persona}.yaml`
- Intelligence: `inputs/intelligence/P0-*.md`
```
