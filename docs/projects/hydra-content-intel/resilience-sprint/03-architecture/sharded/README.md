# Sharded Architecture Index — HYDRA Resilience Sprint

**Source:** `../architecture.md` (Brownfield Enhancement Architecture v1.0, 2026-05-11, 1262 LOC)
**Sharded by:** @po (Pax), 2026-05-12
**Author of source:** Aria (@architect) — synthesizing PRD v0.5 + Mind Clone Conclave (martin-fowler + werner-vogels + charity-majors)

This directory contains the architecture document split into focused sections. Each shard is self-contained — readers do not need to load the master architecture to act on a topic.

## Files

| File | Source §§ | Topic |
|------|-----------|-------|
| [00-introduction.md](00-introduction.md) | §1-§2 | Introduction, scope, target-state component diagram |
| [01-migration-strategy.md](01-migration-strategy.md) | §3 | 6-phase migration plan + story sequence |
| [02-adrs.md](02-adrs.md) | §10 | ADR index + story→ADR cross-reference |
| [03-modules.md](03-modules.md) | §4 | Module/stage specifications (orchestrator + 9 stages + 3 monitoring + CLI) |
| [04-data-model.md](04-data-model.md) | §5 | DDL for 5 new tables + 4 new columns + retention |
| [05-configuration.md](05-configuration.md) | §6 | New YAMLs (angle/dept) + 3 env vars |
| [06-risk-mitigation.md](06-risk-mitigation.md) | §7 | 14 PRD risks + 5 architectural risks + 4 consumption-side risks |
| [07-test-strategy.md](07-test-strategy.md) | §8 | Test categories, phase gates, mock strategy |
| [08-rollback-plan.md](08-rollback-plan.md) | §9 | 3-layer rollback (env / JSON / git) + decision tree |
| [09-consumption-side.md](09-consumption-side.md) | §10A | Story 1.12 feed-reader + consultation prompt integration |
| [10-open-questions.md](10-open-questions.md) | §11 | Q1/Q2/Q3 — all resolved |

## Critical Linkage to PRD Stories

| Architecture phase | PRD stories | Shard |
|--------------------|-------------|-------|
| Phase 0 — Preflight | 1.1a, 1.1b, 1.1c | `01-migration-strategy.md` |
| Phase 1 — Storage migration | 1.2, 1.3 | `01-migration-strategy.md` + `04-data-model.md` |
| Phase 2 — Pipeline split | 1.4 | `01-migration-strategy.md` + `03-modules.md` |
| Phase 3 — Streaming | 1.5 | `01-migration-strategy.md` + `03-modules.md` + `04-data-model.md` |
| Phase 4 — Distribution unify | 1.6, 1.7 | `01-migration-strategy.md` + `03-modules.md` + `05-configuration.md` |
| Phase 5 — Observability | 1.8, 1.9, 1.11 | `01-migration-strategy.md` + `03-modules.md` + `04-data-model.md` |
| Phase 6 — Docs/runbook | 1.10 | `01-migration-strategy.md` + `08-rollback-plan.md` |
| Hotfix (parallel) | 1.12 | `09-consumption-side.md` |

## ADR Files (separate directory)

The 4 ADRs are in `../adrs/`:

- `ADR-001-streaming-pattern.md` — Pure async iteration; reject Worker threads
- `ADR-002-vector-search.md` — LRU cosine cache; SQLite is source of truth
- `ADR-003-observability-stack.md` — SQLite-based observability; reject Prometheus
- `ADR-004-consumption-side.md` — Feed-reader co-located with distribution; field rename to `feedEntries`

## Audit Files (separate directory)

The audits are in `../audits/`:

- `C-10-relevantMemory-audit.md` — Audit of `relevantMemory` consumers (informs Story 1.12 field rename)

## Sprint Status (as of 2026-05-12)

- ✅ Architecture v1.0 FINAL — all PO concerns C-01..C-10 resolved
- ✅ Sharding (this directory) — 2026-05-12 by @po
- ⏭️ Next: @sm pulls stories from `../../02-prd/sharded/` one-by-one for @dev
