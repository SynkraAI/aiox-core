# Story 1.11: Per-item observability tables + `hydra query` CLI

**Status:** Draft
**Story ID:** 1.11
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~700 LOC (`pipeline_items` DDL + index extension on `pipeline_errors` + `query-runner.js` + `hydra query` CLI + Telegram `/query` + 5 saved queries + retention cleanup job + tests)
**Dependencies:** Story 1.5 (owns `pipeline_errors` DDL — this story EXTENDS it)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.11 (lines 791-828)**

---

## User Story

**As a** HYDRA operator,
**I want** every pipeline item recorded as a structured row in SQLite AND a `hydra query` CLI to run ad-hoc SQL,
**so that** I can answer NEW questions about my system in 6 months without shipping new code.

(🆕 Added 2026-05-11 from conclave ADR-003 — Charity Majors' blind spot catch.)

## Acceptance Criteria

1. New SQLite table `pipeline_items` with columns:
   - `id` (UUID), `run_id` (FK to `pipeline_runs`), `item_id` (sha256 of url), `source_name`, `final_stage` (e.g., `distributed`, `deduped`, `filtered`, `failed`), `tier` (S/A/B/null), `cost_cents`, `duration_ms`, `clones_routed_count`, `created_at`
   - Indexed on `run_id`, `source_name`, `final_stage`, `tier`
2. Extends existing `pipeline_errors` table (created in Story 1.5 per architecture §5.1 Phase 5) — adds index on `stage` if not already present, and confirms columns `id`, `run_id`, `item_id`, `stage`, `error_message`, `stack_trace`, `created_at`. **This story does NOT create the table** (created in Story 1.5); it only ensures observability indexes exist and the `hydra query` CLI can read it efficiently.
3. `orchestrator.js` writes to `pipeline_items` per item completion (success OR failure)
4. Failed stages (Story 1.5 AC #8) write to `pipeline_errors` in addition to `pipeline_items.final_stage='failed'`
5. New CLI command `hydra query "<sql>"`:
   - Parameterized (refuses raw user SQL injection)
   - Read-only (refuses INSERT/UPDATE/DELETE/DROP)
   - Returns JSON array
   - Lives at `bin/hydra.js` as new sub-command (additive, CR1 preserved)
6. New Telegram bot command `/query <saved-name>` for 5 saved queries
7. 5 starter queries documented in `05-runbook/queries.md`:
   - `last-run-cost` — cost of most recent pipeline run
   - `top-errors-7d` — top error stages by count, last 7 days
   - `dedup-rate-by-source` — % items deduped per source
   - `clones-by-volume` — clones receiving most items last 30d
   - `heap-trend` — peak_heap_mb across last 20 runs
8. Retention rules added to migrations:
   - `pipeline_runs` last 90 days
   - `pipeline_items` last 30 days
   - `pipeline_errors` last 30 days
   - Cleanup job runs daily at 03h BRT via scheduler

## Integration Verification

- **IV1:** Pipeline run on 100 items inserts exactly 100 rows in `pipeline_items` + N rows in `pipeline_errors` matching actual failures
- **IV2:** `hydra query "SELECT COUNT(*) FROM pipeline_runs WHERE created_at > date('now', '-7 days')"` returns valid count
- **IV3:** `hydra query "DROP TABLE pipeline_runs"` refused with "read-only query required" error
- **IV4:** Retention cleanup runs without locking concurrent pipeline operations (uses `BEGIN IMMEDIATE` correctly)

## Architecture References

- ADR-003: Observability stack — SQLite-based, reject Prometheus/OpenTelemetry (`adrs/ADR-003-observability-stack.md`)
- Architecture §3.1 Phase 5 (Observability + Cost Tracking) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §4.15 `hydra query` safety design — `03-architecture/sharded/03-modules.md`
- Architecture §5.1 `pipeline_items` DDL (Charity's table) — `03-architecture/sharded/04-data-model.md`
- Architecture §5.1 `pipeline_errors` DDL (Werner's table — created in Story 1.5)
- Architecture §5.3 Retention Rules — `BEGIN IMMEDIATE` lock pattern
- Architecture §5.4 Index Strategy Summary
- Architecture §7.2 RA-2 mitigation (`hydra query` as foot-gun) + RA-3 (write amplification)
- Architecture §8.1 Test locations: `items-observability.test.js`, `query-runner.test.js`, `saved-queries.test.js`

## Dev Notes

- **`pipeline_items` is OWNED by this story** (Charity's table). DDL (Architecture §5.1):
  ```sql
  CREATE TABLE IF NOT EXISTS pipeline_items (
    id                    TEXT    PRIMARY KEY,              -- UUID
    run_id                TEXT    NOT NULL,
    item_id               TEXT    NOT NULL,
    source_name           TEXT,
    final_stage           TEXT    NOT NULL,
    tier                  TEXT,
    cost_cents            INTEGER DEFAULT 0,
    duration_ms           INTEGER NOT NULL,
    clones_routed_count   INTEGER DEFAULT 0,
    created_at            INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_pipeline_items_run        ON pipeline_items(run_id);
  CREATE INDEX IF NOT EXISTS idx_pipeline_items_source     ON pipeline_items(source_name);
  CREATE INDEX IF NOT EXISTS idx_pipeline_items_stage      ON pipeline_items(final_stage);
  CREATE INDEX IF NOT EXISTS idx_pipeline_items_tier       ON pipeline_items(tier);
  CREATE INDEX IF NOT EXISTS idx_pipeline_items_created    ON pipeline_items(created_at);
  ```
- **`pipeline_errors` is NOT created here** — created in Story 1.5. This story may add an `idx_pipeline_errors_stage` index if Story 1.5 didn't.
- **`hydra query` safety (Architecture §4.15):**
  1. **Read-only enforcement:** regex check rejects `INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|PRAGMA|ATTACH|DETACH` (case-insensitive). Open SQLite in read-only mode: `new Database(path, { readonly: true })`.
  2. **Parameterized:** Accept named params on CLI: `hydra query "SELECT * FROM pipeline_runs WHERE run_id = :rid" --param rid=abc123`. Refuse string concatenation patterns.
  3. **Output:** JSON array to stdout. (`--csv` flag deferred to post-sprint.)
  4. **Saved queries:** 5 starters documented in `05-runbook/queries.md`. Telegram bot `/query <saved-name>` resolves name → starter SQL.
- **RA-2 mitigation:** Per-query timeout `PRAGMA busy_timeout=5000`. Operator-only — not exposed via Telegram raw, only via 5 saved queries.
- **RA-3 mitigation (write amplification):** Test `tests/pipeline/write-throughput.test.js` measures contention on 10k-item synthetic run. WAL mode handles ~50k writes/sec — within budget.
- **`final_stage` enum** (architecture §5.1): `'distributed' | 'deduped' | 'filtered' | 'failed' | 'stored_only'`. Orchestrator MUST assert on completion (RA-4 mitigation).
- **Retention cleanup job (Architecture §5.3):** Runs daily at 03h BRT via existing `HydraScheduler`. Uses `BEGIN IMMEDIATE` to acquire write lock immediately — avoids the "database is locked" trap when scheduler kicks off a pipeline at the same moment.
- **`llm_calls` 90-day retention** (Architecture §5.3) — implement here as part of cleanup job, even though `llm_calls` table is owned by Story 1.8.
- **5 starter queries in `05-runbook/queries.md` (AC #7):** keep each as a parameterized SQL snippet with example invocation. Validates via `tests/query/saved-queries.test.js`.
- **The most valuable thing in the sprint, in six months** — per Architecture §3.1 Phase 5 commentary: "This story is what makes the rest of the sprint worth doing in six months — the substrate for questions we haven't thought to ask yet."
