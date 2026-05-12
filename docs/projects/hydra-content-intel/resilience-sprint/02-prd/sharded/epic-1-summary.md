# Epic 1: HYDRA Resilience — OOM Elimination + Distribution Unification

**Epic ID:** 1
**Sprint:** HYDRA Resilience
**Date:** 2026-05-12
**Sourced from PRD §4 + §5 (lines 459-918)**

---

## Epic Goal

Restore HYDRA's autonomous 24/7 operation by eliminating the OOM root cause (JSON-monolith persistence in vector-store + semantic-dedup), unifying the divergent distribution codepaths (pipeline live vs. `ingest-dossier.mjs`), and adding operational observability (cost tracking + heap monitoring) — all while preserving 100% of the existing CLI public API surface and feed output format.

## Epic Approach

**Decision: Single comprehensive epic** (per brownfield-prd-tmpl guidance).

**Rationale (from PRD §4.1):**
- All sprint requirements share **one root cause** — the OOM in 2 specific files (`semantic-dedup.js:242-263` + `vector-store.js:118-161`) and the **codepath drift** it forced (`ingest-dossier.mjs` bypass)
- Stories are tightly coupled: pipeline streaming (FR1) requires SQLite-backed stores (FR2); unified DistributionService (FR4) requires both the new pipeline shape AND the 3-layer domain mapping (FR5)
- Splitting into multiple epics would create artificial boundaries and dependency tangles between sprints

**Trade-off acknowledged:** A single epic means a single all-or-nothing release. Mitigated by:
- Stories sequenced to be **independently shippable** where possible (FR7 status.js fix ships first, FR8 cost-tracker can ship before or after main refactor)
- Feature flags (`HYDRA_USE_LEGACY_VECTOR_STORE`) allow incremental rollout post-merge

## Integration Requirements (PRD §5 lines 482-488)

- All 22 CLI commands preserved (CR1)
- SQLite schema additive only (CR2)
- Mind-clone feed format byte-compatible (CR3)
- Telegram + index.json + YAML configs preserved (CR4)
- Tests run via existing `bin/jest.js` ESM wrapper (CR5)
- Node ≥20 unchanged (CR6)

## Story Sequencing & Dependencies

Sourced from PRD §5.1 (lines 890-916):

```
Story 1.1a (preflight scripts)         ✅ SHIPPED 2026-05-11 — gates migrations in 1.2/1.3
Story 1.1b (status.js SQLite read fix) [independent, parallel-safe]
Story 1.1c (characterization fixture)  ★ unblocks refactor work (1.4 + 1.5)
    │
    ├──> Story 1.2 (vector-store SQLite + LRU benchmark spike)      [needs 1.1a preflight wired]
    ├──> Story 1.3 (semantic-dedup SQLite)                          [needs 1.1a preflight wired]
    └──> Story 1.4 (pipeline split)                                 [needs 1.1c fixture]
              ├──> Story 1.5 (streaming + per-stage failure handling + pipeline_errors DDL)
              │         └──> Story 1.11 (pipeline_items + hydra query) ★ READS from pipeline_errors created in 1.5
              ├──> Story 1.6 (DistributionService)
              │         └──> Story 1.7 (--from-jsonl flag)
              └──> Story 1.8 (cost tracker) [parallel-safe]
                        └──> Story 1.9 (graceful shutdown)
                                  └──> Story 1.10 (docs/runbook)

Story 1.12 (Connect Feeds to Consultation) ✅ SHIPPED 2026-05-12 — no upstream deps, fully parallel-safe
                                            ★ HOTFIX-class: shipped concurrently with refactor work
                                            ★ unlocked user value of every other story
```

**Critical path:** 1.1c → 1.4 → 1.5 → 1.11 → 1.10 (Story 1.1a already shipped; 1.1b parallel-safe with everything). **Story 1.12 is NOT on the critical path** — it's a deliverable in itself, independent of the refactor chain.

**Parallel-safe:** 1.1b, 1.2, 1.3, 1.8, 1.12 can run in parallel after their respective deps clear. (1.12 has no deps at all.)

**Dependency note on 1.5 ↔ 1.11:** Story 1.5 OWNS the `pipeline_errors` table DDL (per architecture §5.1 Phase 5). Story 1.11 ADDS the `pipeline_items` table + `hydra query` CLI + observability tooling on top of the existing `pipeline_errors` table. Sequencing is 1.5 → 1.11 (no circular dependency).

**Dependency note on 1.12 (PRD v0.9):** Story 1.12 has **no prerequisites within this sprint** — shipped as a hotfix concurrently with refactor work. The OOM fix (1.4/1.5) and SQLite migration (1.2/1.3) produced feeds that were never read until 1.12 landed. Soft coupling: AC #11 cost tracking integrates with Story 1.8's cost-tracker module.

**Estimated sprint duration:** 2-3 weeks for a single dev (assuming Architecture phase clears in 1 day post-conclave — already happened 11/Mai).

## Story Inventory (12 total)

| Story | Title | Status | Owner |
|-------|-------|--------|-------|
| 1.1a  | Pre-flight validation scripts | ✅ SHIPPED 2026-05-11 | @dev |
| 1.1b  | status.js SQLite read fix | Draft | @dev |
| 1.1c  | Characterization test fixture | Draft | @dev |
| 1.2   | SQLite migration — vector-store | Draft | @dev |
| 1.3   | SQLite migration — semantic-dedup | Draft | @dev |
| 1.4   | Pipeline split — orchestrator + stages | Draft | @dev |
| 1.5   | Streaming pipeline execution + `pipeline_errors` DDL | Draft | @dev |
| 1.6   | Unified DistributionService | Draft | @dev |
| 1.7   | `hydra run --from-jsonl` flag | Draft | @dev |
| 1.8   | Cost tracker + Telegram cost report | Draft | @dev |
| 1.9   | Graceful shutdown + OOM warning | Draft | @dev |
| 1.10  | Documentation + runbook | Draft | @dev |
| 1.11  | Per-item observability tables + `hydra query` CLI | Draft | @dev |
| 1.12  | Connect Feeds to Consultation Engine | ✅ SHIPPED 2026-05-12 | @dev |

## Pre-Sprint Validation Decisions (PRD §1.6 Change Log)

- ✅ §2 approved (NFR1 = 2GB heap budget; FR5 = 3 YAMLs separated)
- ✅ §3 approved (pre-flight scripts mandatory; `src/pipeline/{orchestrator + stages/}` split)
- ✅ §4 single-epic structure approved
- ✅ All PO concerns C-01..C-10 resolved (resolved in PRD v1.0 RC, 2026-05-12)
- ✅ ADR-004 added (consumption-side architecture for Story 1.12)
- ✅ Aria C-10 audit applied (`relevantMemory` → `feedEntries` rename + legacy alias retention)
