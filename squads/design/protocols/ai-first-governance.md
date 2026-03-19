# AI-First Governance Protocol (Design Squad)

## Purpose

Prevent research drift, contradictory claims, and non-canonical references by enforcing behavior at agent/task/workflow level.

## Mandatory Rules

1. Canonical Source Hierarchy
- `workspace/system/*` for global policy/governance.
- `workspace/ui/registry.json` for component distribution truth.
- `workspace/domains/design-system/*` for DS metadata and glossary.
- `squads/design/data/*` for squad-local knowledge and guides.
- `docs/research/*` is supporting evidence, never final source of truth.

2. Evidence Contract
- Every recommendation must include explicit evidence pointers:
  - artifact path
  - status (`implemented`, `partial`, `concept`)
  - date (`YYYY-MM-DD`)
- If evidence is missing, mark as `assumption` and do not present as fact.

3. Contradiction Guard
- Never claim completion if any dependency is `partial` or `concept`.
- If two artifacts conflict, prefer canonical source hierarchy and log conflict.

4. Research-to-Execution Handshake
- Before proposing execution, map:
  - `Existing` (what already exists)
  - `Gap` (what is missing)
  - `Decision` (what will be done now)
- Output must include unresolved items explicitly.

5. Language for Status Claims
- Use only:
  - `Implemented`
  - `Partially implemented`
  - `Concept only`
- Avoid absolute statements like "100% complete" unless all dependencies are `Implemented`.

## Required Output Block (for agents/tasks)

```yaml
governance_check:
  protocol: squads/design/protocols/ai-first-governance.md
  canonical_sources_checked:
    - path: ""
      status: "implemented|partial|concept"
      date: "YYYY-MM-DD"
  evidence:
    - claim: ""
      source: ""
  contradictions_found: []
  unresolved_items: []
```

