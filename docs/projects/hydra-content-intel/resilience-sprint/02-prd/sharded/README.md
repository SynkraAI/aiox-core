# Sharded PRD Index — HYDRA Resilience Sprint

**Source:** `../prd.md` (PRD v1.0 RC, 2026-05-12, 931 LOC)
**Sharded by:** @po (Pax), 2026-05-12
**Consumer:** @sm (River) — story pull workflow

This directory contains the PRD split into developer-actionable chunks. Each story file is self-contained — readers do not need to load the master PRD to act on a story.

## Files

| File | Story | Status | LOC est. | Dependencies |
|------|-------|--------|----------|--------------|
| [epic-1-summary.md](epic-1-summary.md) | Epic 1 (umbrella) | n/a | n/a | - |
| [story-1.1a.md](story-1.1a.md) | Pre-flight validation scripts | ✅ SHIPPED 2026-05-11 | ~350 | none |
| [story-1.1b.md](story-1.1b.md) | status.js SQLite read fix | Draft | ~10 | none |
| [story-1.1c.md](story-1.1c.md) | Characterization test fixture | Draft | ~500 | none (gates 1.4 + 1.5) |
| [story-1.2.md](story-1.2.md) | SQLite migration — vector-store | Draft | ~600 | 1.1a |
| [story-1.3.md](story-1.3.md) | SQLite migration — semantic-dedup | Draft | ~500 | 1.1a |
| [story-1.4.md](story-1.4.md) | Pipeline split — orchestrator + stages | Draft | ~1,200 | 1.1c |
| [story-1.5.md](story-1.5.md) | Streaming pipeline + pipeline_errors DDL | Draft | ~800 | 1.4 + 1.1c |
| [story-1.6.md](story-1.6.md) | Unified DistributionService | Draft | ~500 | 1.4 |
| [story-1.7.md](story-1.7.md) | `hydra run --from-jsonl` flag | Draft | ~300 | 1.6 |
| [story-1.8.md](story-1.8.md) | Cost tracker + Telegram `/cost` | Draft | ~500 | 1.5 (parallel-safe in Phase 5) |
| [story-1.9.md](story-1.9.md) | Graceful shutdown + OOM warning | Draft | ~400 | 1.5 + 1.8 |
| [story-1.10.md](story-1.10.md) | Documentation + runbook | Draft | ~1,500 (docs) | all others |
| [story-1.11.md](story-1.11.md) | Per-item observability + `hydra query` | Draft | ~700 | 1.5 |
| [story-1.12.md](story-1.12.md) | Connect Feeds to Consultation Engine | ✅ SHIPPED 2026-05-12 | ~150 | none |

## Critical Path

```
Story 1.1c (characterization)
    └──> Story 1.4 (pipeline split)
              └──> Story 1.5 (streaming + pipeline_errors)
                        └──> Story 1.11 (observability)
                                  └──> Story 1.10 (docs/runbook)
```

## Status Summary

- **Shipped (2 stories):** 1.1a, 1.12
- **Draft (12 stories):** 1.1b, 1.1c, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11
- **Total story count:** 14 (1.1 split into 1.1a/1.1b/1.1c per PRD v0.7)

## Sprint Status

- ✅ PRD v1.0 RC (2026-05-12) — all PO concerns C-01..C-10 resolved
- ✅ Architecture v1.0 (2026-05-11) — 4 ADRs accepted, 3/3 conclave consensus
- ✅ Sharding (this directory) — 2026-05-12 by @po
- ⏭️ Next: @sm pulls stories one-by-one for @dev

## Conventions Used

- Each story file follows the AIOS story template (User Story / Acceptance Criteria / Integration Verification / Architecture References / Dev Notes)
- Stories shipped have `Implementation Report` + `File List` sections appended
- Source line ranges from master PRD documented at top for traceability
- Architecture references point to sibling sharded files in `../../03-architecture/sharded/`

## Not Yet Created

- Sprint retrospective (post-completion, all 14 stories merged)
- `05-runbook/` directory (deliverable of Story 1.10)
- `04-test-plans/` directory (if @qa creates one post-Story 1.10)
