# Story 1.2: SQLite migration — vector-store

**Status:** Draft
**Story ID:** 1.2
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~600 LOC (rewrite of `vector-store.js` + migration script + benchmark + tests)
**Dependencies:** Story 1.1a (preflight scripts must exist for migration gate)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.2 (lines 556-582)**

---

## User Story

**As a** HYDRA operator,
**I want** vector embeddings persisted in SQLite instead of a 16.7MB JSON file rewritten per item,
**so that** the pipeline no longer triggers OOM on full runs.

## Acceptance Criteria

1. New table `vector_embeddings` created in `hydra.db` with columns: `id`, `content_id`, `embedding_blob`, `dimension`, `created_at`
2. `src/store/vector-store.js` rewritten: `upsert()` uses prepared INSERT OR REPLACE; `search()` uses **in-memory LRU cosine cache** per ADR-002 (with 1-day spike branch validating against sqlite-vss baseline before merge — see AC #7 below)
3. Migration command `hydra migrate vector-store` exists and:
   - Invokes `preflight/all.mjs` first (refuses if fails)
   - Reads existing `vectors/vector-index.json`
   - Bulk-inserts all entries via transaction
   - Renames JSON to `vector-index.legacy.json`
   - Post-flight check: SQLite row count == JSON entry count
4. Env flag `HYDRA_USE_LEGACY_VECTOR_STORE=1` falls back to JSON reader (for rollback)
5. `vector-store.search()` p99 ≤ 200ms for 10k vectors (NFR5)
6. Migration is idempotent (re-running causes no duplicates, no errors)
7. **🆕 BENCHMARK SPIKE (ADR-002 exit criterion):** 1-day spike branch benchmarks LRU cache vs sqlite-vss against 10k-vector + 100-query fixture. Selected approach must p99 ≤ 200ms. **Default: LRU cache.** If LRU fails p99 target, fall back to sqlite-vss (note: introduces native dep risk per ADR-002).
8. **🆕 LRU cache invalidation:** write-through on `upsert()` — cache entry replaced on write. Cold start: cache lazy-loaded on first `search()`.

## Integration Verification

- **IV1:** `hydra search "test query"` returns same top-K results before/after migration for a snapshot of 100 queries
- **IV2:** `AuditLogger` continues writing to the same DB connection (singleton preserved)
- **IV3:** Heap usage during a 1000-item run drops measurably (validated via `validate-heap.mjs`)
- **IV4:** LRU cache memory footprint < 100MB resident for 10k vectors

## Architecture References

- ADR-002: Vector search — LRU cosine cache (`adrs/ADR-002-vector-search.md`)
- Architecture §3.1 Phase 1 (Migrate Storage) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §5.1 `vector_embeddings` DDL — `03-architecture/sharded/04-data-model.md`
- Architecture §6.2 Env vars: `HYDRA_USE_LEGACY_VECTOR_STORE` — `03-architecture/sharded/05-configuration.md`
- Architecture §8.1 Benchmark spike + migration idempotency test file locations
- Architecture §9.1 Rollback Layer 1 (env flag)

## Dev Notes

- **Critical sequencing (Architecture §3.1 Phase 1):** Story 1.2 ships its 1-day benchmark spike FIRST. ADR-002 says LRU is the default winner unless data dictates otherwise. Benchmark fixture: `tests/fixtures/vector-bench-10k.bin`.
- **BLOB encoding (Architecture §5.1):** Embeddings stored as little-endian Float32Array serialized via `Buffer.from(new Float32Array(vec).buffer)`. Deserialized on read. Avoids JSON parsing overhead per row.
- **Migration source:** `hydra-data/vectors/vector-index.json` (16.7MB). One-shot script reads JSON, iterates entries, bulk-inserts via transaction.
- **Reuse existing SQLite singleton** at `src/dedup/dedup-store.js:20`. DO NOT create a second database connection (PRD §3.2 Database Integration Strategy).
- **Migration idempotency pattern (Architecture §3.2):** `CREATE TABLE IF NOT EXISTS` + `INSERT OR IGNORE`. Mirror existing `src/dedup/migrate-to-sqlite.js` shape.
- **Cache footprint sanity check (IV4):** 10k vectors × 1536 dims × 4 bytes = ~60MB raw; LRU overhead brings it to ~100MB ceiling.
- Post-migration: `scripts/postflight/01-row-count-match.mjs` confirms SQLite row count == JSON entry count before declaring success.
