# Story 1.10: Documentation + runbook

**Status:** Draft
**Story ID:** 1.10
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~0 production code; ~1,500 LOC of Markdown docs + env.example + project_hydra.md update + rollback test execution
**Dependencies:** Story 1.9 (last code story); transitively all other stories must be merged
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.10 (lines 765-787)**

---

## User Story

**As a** HYDRA operator,
**I want** a migration runbook and updated docs,
**so that** I (or a future operator) can execute the resilience sprint deployment safely.

## Acceptance Criteria

1. New file `docs/projects/hydra-content-intel/resilience-sprint/05-runbook/migration-runbook.md` covers:
   - Pre-migration backup procedure
   - 8-step migration sequence (per §3.4)
   - Rollback procedure (env flag + JSON restore)
   - Smoke test procedure
   - Post-migration validation checklist
2. New file `docs/projects/hydra-content-intel/resilience-sprint/05-runbook/scheduler-recovery.md` for crash recovery (NFR4: MTTR < 5min)
3. Update `tools/hydra/.env.example` with new env vars
4. Update `tools/hydra/auto-run.bat` (if needed for new flags)
5. Update memory file `project_hydra.md` with new architecture + DOWN→UP timeline
6. ADRs (from architecture phase) referenced in runbook

## Integration Verification

- **IV1:** Runbook step-by-step executable by Orion/agent without code knowledge
- **IV2:** Rollback procedure tested end-to-end on a copy of `hydra-data/`
- **IV3:** Updated docs reviewed against actual implementation

## Architecture References

- Architecture §3.1 Phase 6 (Runbooks + Documentation) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §9 Rollback Plan (3-layer strategy) — `03-architecture/sharded/08-rollback-plan.md`
- Architecture §9.2 Rollback Test Plan (Story 1.10 IV2)
- Architecture §6.2 New env vars (for `.env.example` update)
- All 4 ADRs in `adrs/` — reference from runbook

## Dev Notes

- **Migration sequence (8 steps, from PRD §3.4):**
  1. Pre-flight check (`validate-heap.mjs`)
  2. Backup JSON files to `*.backup.json`
  3. `hydra migrate vector-store`
  4. `hydra migrate semantic-dedup`
  5. Smoke test: `hydra run --dry-run --sources rss`
  6. Rollback gate (if heap >2GB, set env flag + re-run)
  7. Production restart: `hydra schedule start`
  8. Monitor: Telegram `/health` 1h, 6h, 24h post-restart

- **Rollback Decision Tree (Architecture §9.3):** include verbatim in `rollback-runbook.md`.

- **Rollback Test Plan (Architecture §9.2):**
  1. Snapshot `hydra-data/` to `hydra-data-snapshot-pre-rollback-test/`
  2. Run full pipeline to populate new SQLite tables
  3. Execute Layer 1 (env flag) → confirm `hydra search` returns legacy results
  4. Execute Layer 2 (JSON restore) → confirm pipeline runs with restored JSON
  5. Execute Layer 3 (git revert) → confirm pre-sprint code + restored data → pipeline still runs
  6. Restore snapshot to `hydra-data/`
  **Rollback test runs in dry-run mode** (no Jarvis KB writes) to avoid corrupting clone feeds.

- **New env vars to add to `.env.example`** (Architecture §6.2):
  | Var | Default | Purpose |
  |---|---|---|
  | `HYDRA_USE_LEGACY_VECTOR_STORE` | (unset) | Rollback flag |
  | `HYDRA_HEAP_WARN_MB` | `1800` | OOM warning threshold |
  | `HYDRA_COST_BRL_RATE` | `5.20` | USD→BRL rate |

- **Scheduler recovery runbook (NFR4 MTTR < 5min):** Include Telegram alert quote → diagnose (which alert?) → action sequence (restart command, lock check, log tail). Reference `hydra-data/state/scheduler.lock` semantics.

- **`project_hydra.md` update** (memory file): record DOWN→UP timeline (DOWN since 2026-04-16 per heartbeat; UP after sprint completion). Reference the resilience-sprint directory as canonical.

- **This is the FINAL story** in the sequence (Architecture §3.2 Story Sequence). Per Architecture §3.1 Phase 6 exit gate: "Runbook is step-by-step executable by Orion/agent without code knowledge. Rollback procedure tested end-to-end on a copy of `hydra-data/`."
