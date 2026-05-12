# Story 1.5: Streaming pipeline execution + `pipeline_errors` DDL

**Status:** Draft
**Story ID:** 1.5
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~800 LOC (orchestrator rewrite + per-stage error wrapping + `pipeline_errors` DDL + heap budget test + per-stage failure test)
**Dependencies:** Story 1.4 (pipeline split), Story 1.1c (characterization fixture as merge gate)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.5 (lines 638-662)**

---

## User Story

**As a** HYDRA operator,
**I want** items processed one-at-a-time through the pipeline (fetch → transform → write → discard) instead of holding all in memory,
**so that** heap usage stays bounded regardless of run size.

## Acceptance Criteria

1. `orchestrator.js` rewritten to process items via async iteration: `for await (const item of fetchStream())` then run through stages sequentially
2. Items are NOT accumulated into `allContent[]` array — each is fully processed (or discarded) before the next is fetched
3. Backpressure: if a stage is slow (LLM call), fetch pauses (no unbounded queue)
4. Memory profiler test asserts peak heap < 2GB for 5000-item synthetic run (NFR1)
5. Graceful shutdown drains in-flight items before exit (NFR10 + R7 mitigation)
6. Existing pipeline-run metrics (`pipeline_runs` table) unchanged — still records totals
7. New column `peak_heap_mb` added to `pipeline_runs` (CR2 — additive)
8. **🆕 PER-STAGE FAILURE HANDLING (per conclave ADR-001):** Every stage function MUST return `{ success: true, item }` OR `{ success: false, error, item }`. No throws across stage boundaries. Failed items written to new `pipeline_errors` table. **The `pipeline_errors` table DDL and write logic SHIP with this story** (Story 1.5) — see architecture §5.1 Phase 5 + ADR-001 for canonical DDL. Story 1.11 later extends this table with the `pipeline_items` companion table, the `hydra query` CLI, and observability tooling that READS from `pipeline_errors`; it does NOT create the table. Run continues despite per-item failures.
9. **🆕 Error rate threshold:** If a stage's error count exceeds 10% of items, pipeline triggers Telegram HIGH severity alert (but does NOT abort — keeps processing).
10. **🆕 Stage contract documented:** Each stage in `src/pipeline/stages/` has JSDoc declaring its `{success, error}` contract + which failure modes are recoverable.
11. **🆕 Characterization test (Story 1.1 fixture) MUST PASS** before this story merges. If output diff is non-empty, refactor is rejected.

## Integration Verification

- **IV1:** Run on 50-item characterization fixture (Story 1.1) produces identical output (zero diff)
- **IV2:** Cron-scheduled run completes without OOM for 1000+ items
- **IV3:** `hydra run --dry-run --sources rss` smoke test still works
- **IV4:** Injected stage failure (mock error in score stage) on 10% of items: pipeline completes, errors logged to `pipeline_errors`, Telegram alert fires, exit code is 0 not 1

## Architecture References

- ADR-001: Streaming pattern — pure async iteration (`adrs/ADR-001-streaming-pattern.md`)
- Architecture §3.1 Phase 3 (Streaming Pipeline Execution) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §4.1 Orchestrator spec — `03-architecture/sharded/03-modules.md`
- Architecture §4.2-4.10 Stage modules `{success, error}` contract
- Architecture §5.1 `pipeline_errors` DDL — `03-architecture/sharded/04-data-model.md` (Werner's table)
- Architecture §5.2 `pipeline_runs` additive columns (`peak_heap_mb`, `run_id`, `fatal_error`, `cost_brl`)
- Architecture §7.2 RA-4 (silent drop risk) — strict `{success, error}` contract mitigation
- Architecture §8.1 Heap budget + per-stage failure test locations

## Dev Notes

- **Critical changes (Architecture §3.1 Phase 3):**
  - `orchestrator.js` becomes `for await (const item of fetchStream())`.
  - `allContent[]` array eliminated; each item fully processed (or discarded) before next fetch.
  - Every stage function returns `{ success: true, item } | { success: false, error, item }`. No throws across boundaries.
  - Failed items written to `pipeline_errors` (table created in this story).
  - Error rate >10% triggers Telegram HIGH severity alert (does NOT abort the run).
- **Exit gate (Architecture §3.1 Phase 3):** Heap budget test (NFR1) passes — 5,000-item synthetic run peaks under 2GB. Characterization test still green.
- **`pipeline_errors` table is OWNED by this story** — Story 1.11 will add `pipeline_items` companion + indexes + read tooling but will NOT create `pipeline_errors`. Dependency: 1.5 → 1.11 (PRD §5.1 dependency note).
- **`pipeline_errors` DDL (Architecture §5.1):**
  ```sql
  CREATE TABLE IF NOT EXISTS pipeline_errors (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id          TEXT    NOT NULL,
    item_id         TEXT,                                   -- nullable
    stage           TEXT    NOT NULL,
    error_message   TEXT    NOT NULL,
    stack_trace     TEXT,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );
  ```
- **`pipeline_runs` ADD COLUMN (Architecture §5.2):**
  ```sql
  ALTER TABLE pipeline_runs ADD COLUMN run_id        TEXT;
  ALTER TABLE pipeline_runs ADD COLUMN peak_heap_mb  INTEGER;
  ALTER TABLE pipeline_runs ADD COLUMN fatal_error   TEXT;
  ALTER TABLE pipeline_runs ADD COLUMN cost_brl      REAL;
  ```
  All nullable / defaults — R10 mitigation.
- **Graceful shutdown sequence (Architecture §7.1 R7):** SIGTERM handler sequences closures: `auditLogger.close() → entityGraph.close() → dedupStore.close()`. Test (`tests/pipeline/graceful-shutdown.test.js`) asserts order. **Note:** Story 1.9 expands this with heap-monitor integration; this story owns the basic graceful drain.
- **RA-4 mitigation (Architecture §7.2):** A stage that returns `undefined` triggers an "implicit failure" entry in `pipeline_errors`. `pipeline_items.final_stage` MUST be one of an enum set — orchestrator asserts on completion. (Note: `pipeline_items` is owned by Story 1.11, but the enum convention starts here.)
- **Characterization test gate (AC #11):** This is the **hard merge gate** for this story. If diff is non-empty, refactor is rejected.
