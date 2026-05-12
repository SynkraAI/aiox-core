# Architecture §5 — Data Model Changes (All Additive per CR2)

**Source:** `../architecture.md` lines 544-685
**Sharded by:** @po, 2026-05-12

---

## 5.1 New Tables

### `vector_embeddings` (Story 1.2)

```sql
CREATE TABLE IF NOT EXISTS vector_embeddings (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id      TEXT    NOT NULL UNIQUE,    -- sha256 of url, links to content_hashes.content_id
  embedding_blob  BLOB    NOT NULL,           -- Float32Array serialized as BLOB
  dimension       INTEGER NOT NULL,            -- typically 1536 (OpenAI ada-002 era) or 768 (smaller models)
  source_name     TEXT,                       -- optional, for query filtering
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_vector_embeddings_content_id
  ON vector_embeddings(content_id);
```

**Note on BLOB encoding:** Embeddings stored as little-endian Float32Array serialized via `Buffer.from(new Float32Array(vec).buffer)`. Deserialized on read. Avoids JSON parsing overhead per row.

**Migration source:** `hydra-data/vectors/vector-index.json` (16.7MB). One-shot script `hydra migrate vector-store` reads JSON, iterates entries, bulk-inserts via transaction.

### `semantic_fingerprints` (Story 1.3)

```sql
CREATE TABLE IF NOT EXISTS semantic_fingerprints (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id        TEXT    NOT NULL UNIQUE,
  fingerprint_hash  TEXT    NOT NULL,        -- e.g., MinHash signature
  title_normalized  TEXT    NOT NULL,
  source_name       TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_semantic_fp_hash      ON semantic_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_semantic_fp_title     ON semantic_fingerprints(title_normalized);
CREATE INDEX IF NOT EXISTS idx_semantic_fp_content   ON semantic_fingerprints(content_id);
```

**Migration source:** `hydra-data/fingerprints/fingerprints.json` (20.7MB).

### `llm_calls` (Story 1.8)

```sql
CREATE TABLE IF NOT EXISTS llm_calls (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id        TEXT    NOT NULL,             -- FK to pipeline_runs.run_id
  provider      TEXT    NOT NULL,             -- 'deepseek' | 'anthropic' | 'openai'
  model         TEXT    NOT NULL,
  tokens_in     INTEGER NOT NULL,
  tokens_out    INTEGER NOT NULL,
  cost_usd      REAL    NOT NULL,
  cost_brl      REAL    NOT NULL,             -- computed at write time using HYDRA_COST_BRL_RATE
  stage         TEXT,                         -- 'score' | 'extract' | etc.
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_llm_calls_run_id    ON llm_calls(run_id);
CREATE INDEX IF NOT EXISTS idx_llm_calls_created   ON llm_calls(created_at);
```

### `pipeline_items` (Story 1.11 — Charity's table)

```sql
CREATE TABLE IF NOT EXISTS pipeline_items (
  id                    TEXT    PRIMARY KEY,              -- UUID
  run_id                TEXT    NOT NULL,                 -- FK to pipeline_runs.run_id
  item_id               TEXT    NOT NULL,                 -- sha256 of url
  source_name           TEXT,
  final_stage           TEXT    NOT NULL,                 -- 'distributed' | 'deduped' | 'filtered' | 'failed' | 'stored_only'
  tier                  TEXT,                             -- 'S' | 'A' | 'B' | NULL
  cost_cents            INTEGER DEFAULT 0,                -- sum of LLM cost cents for this item
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

### `pipeline_errors` (Story 1.5 OWNS DDL — Werner's table; Story 1.11 extends with read tooling)

```sql
CREATE TABLE IF NOT EXISTS pipeline_errors (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id          TEXT    NOT NULL,
  item_id         TEXT,                                   -- nullable: some errors are stage-wide, not per-item
  stage           TEXT    NOT NULL,
  error_message   TEXT    NOT NULL,
  stack_trace     TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_pipeline_errors_run    ON pipeline_errors(run_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_errors_stage  ON pipeline_errors(stage);
```

> **DDL ownership note (PRD §5.1):** Despite the architecture document originally placing this table in §5.1 (Story 1.11 Phase 5), the DDL+write-logic ship with **Story 1.5**. Story 1.11 only adds the stage index (if not present) + the `hydra query` CLI that READS from it. Sequencing: 1.5 → 1.11 (no circular dependency).

## 5.2 Modified Tables (All Additive — New Columns with Defaults)

### `pipeline_runs` (existing — additions for ADR-003 observability)

```sql
ALTER TABLE pipeline_runs ADD COLUMN run_id        TEXT;          -- UUID, populated for new runs (legacy NULL)
ALTER TABLE pipeline_runs ADD COLUMN peak_heap_mb  INTEGER;
ALTER TABLE pipeline_runs ADD COLUMN fatal_error   TEXT;
ALTER TABLE pipeline_runs ADD COLUMN cost_brl      REAL;
```

**Backward compatibility:** All new columns are nullable / have implicit NULL default. Existing `SELECT total_fetched, total_processed FROM pipeline_runs` queries unaffected. Legacy rows have NULL run_id; new queries that filter by run_id naturally exclude them.

## 5.3 Retention Rules (Story 1.11 AC #8)

Daily cleanup job scheduled via existing `HydraScheduler` at **03:00 BRT** (low-traffic window). Implemented as a new `scheduler` job that calls a function in `src/dedup/dedup-store.js` (extending existing maintenance helpers).

| Table | Retention | Cleanup query |
|---|---|---|
| `pipeline_runs` | 90 days | `DELETE FROM pipeline_runs WHERE created_at < unixepoch('now', '-90 days')` |
| `pipeline_items` | 30 days | (same pattern) |
| `pipeline_errors` | 30 days | (same pattern) |
| `llm_calls` | 90 days | (same pattern) |
| `audit_log` | 90 days (EXISTING, unchanged) | (no change) |
| `vector_embeddings` | indefinite (corpus) | no cleanup — content lifecycle is independent |
| `semantic_fingerprints` | indefinite (corpus) | no cleanup |

**Critical:** Cleanup uses `BEGIN IMMEDIATE` (acquires write lock immediately) to avoid the SQLite "database is locked" trap when the scheduler kicks off a pipeline at the same moment.

## 5.4 Index Strategy Summary

All new indexes are on columns used by:
- The application's hot paths (`content_id` lookups, `run_id` joins)
- The 5 starter queries from Story 1.11 (`source_name`, `final_stage`, `tier`, `created_at`)

No covering indexes added preemptively — let SQLite's query planner work with the simple indexes first. Add covering indexes only if `EXPLAIN QUERY PLAN` shows table scans on the queries that matter (operator can run `EXPLAIN QUERY PLAN ...` themselves via the new `hydra query` command — meta!).
