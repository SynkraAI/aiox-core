# CELF Validation Rubric

30 criteria across 8 layers. Each is binary: PASS or FAIL.

## L0 — Constitution (4 criteria)

- [ ] **L0-1**: CLAUDE.md exists (global or project)
- [ ] **L0-2**: CLAUDE.md < 200 lines
- [ ] **L0-3**: Decision levels defined (decide alone / decide+flag / escalate)
- [ ] **L0-4**: No business facts in constitution (products, prices, customer data belong in L1)

## L1 — Knowledge Graph (4 criteria)

- [ ] **L1-1**: Entry point exists (.brain/BRAIN.yaml or knowledge/INDEX.yaml)
- [ ] **L1-2**: Entry point is pointer, not repository (< 500 tokens)
- [ ] **L1-3**: At least 1 product entity defined
- [ ] **L1-4**: At least 1 persona/ICP entity defined

## L2 — Intelligence (4 criteria)

- [ ] **L2-1**: Intelligence directory exists (inputs/intelligence/ or similar)
- [ ] **L2-2**: At least 1 P0 file with real evidence
- [ ] **L2-3**: No fabricated verbatims (quotes attributed to real sources)
- [ ] **L2-4**: Constitution references intelligence loading ("load P0 before creating")

## L3 — Project State (4 criteria)

- [ ] **L3-1**: STATE.yaml or equivalent exists for active project
- [ ] **L3-2**: STATE.yaml < 1000 tokens
- [ ] **L3-3**: Phases defined with transitions
- [ ] **L3-4**: INDEX.md maps project artifacts

## L4 — Heuristics (4 criteria)

- [ ] **L4-1**: Rules directory exists (.claude/rules/ or rules/)
- [ ] **L4-2**: Anti-loop / circuit breaker rule present
- [ ] **L4-3**: Each rule file has single responsibility (< 500 tokens)
- [ ] **L4-4**: Routing defined (request type → handler)

## L5 — Memory (4 criteria)

- [ ] **L5-1**: MEMORY.md exists
- [ ] **L5-2**: MEMORY.md < 200 lines
- [ ] **L5-3**: No session-specific content in memory
- [ ] **L5-4**: Satellite files used for detailed topics (if MEMORY.md approaches limit)

## L6 — Session (3 criteria)

- [ ] **L6-1**: Handoff directory exists (docs/sessions/ or similar)
- [ ] **L6-2**: At least 1 handoff file if project has had multiple sessions
- [ ] **L6-3**: Constitution mentions handoff protocol

## L7 — Delegation (3 criteria)

- [ ] **L7-1**: Sub-agents receive scoped context (not full dump)
- [ ] **L7-2**: Delegation rules defined (what to include per agent type)
- [ ] **L7-3**: No cross-contamination between agent contexts

---

## Scoring

**Total:** 30 criteria

| Health Level | Score | Percentage | Action |
|-------------|-------|------------|--------|
| Critical | 0-11 | < 40% | Run SCAFFOLD immediately |
| Weak | 12-17 | 40-60% | Fix L0 and L5 first (highest leverage) |
| Functional | 18-23 | 60-80% | Optimize specific layers |
| Healthy | 24-26 | 80-90% | Fine-tune, add quality gates |
| State-of-art | 27-30 | > 90% | Maintain, iterate |

## Profile-Adjusted Scoring

Not all layers are required for all profiles:

| Criterion | SOLO | MEDIUM | ENTERPRISE |
|-----------|------|--------|------------|
| L0-1 to L0-4 | Required | Required | Required |
| L1-1 to L1-4 | L1-1 only | Required | Required |
| L2-1 to L2-4 | Optional | Required | Required |
| L3-1 to L3-4 | Optional | Required | Required |
| L4-1 to L4-4 | Optional | L4-1,L4-2 | Required |
| L5-1 to L5-4 | L5-1,L5-2 | Required | Required |
| L6-1 to L6-3 | Optional | L6-1 | Required |
| L7-1 to L7-3 | N/A | Optional | Required |

**Adjusted max:**
- SOLO: 7 criteria → score out of 7
- MEDIUM: 22 criteria → score out of 22
- ENTERPRISE: 30 criteria → score out of 30
