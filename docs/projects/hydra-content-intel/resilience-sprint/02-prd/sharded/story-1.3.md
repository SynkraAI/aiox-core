# Story 1.3: SQLite migration — semantic-dedup

**Status:** Draft
**Story ID:** 1.3
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~500 LOC (rewrite of `semantic-dedup.js` + migration script + tests)
**Dependencies:** Story 1.1a (preflight scripts must exist for migration gate)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.3 (lines 585-602)**

---

## User Story

**As a** HYDRA operator,
**I want** semantic fingerprints persisted in SQLite instead of a 20.7MB JSON file rewritten per item,
**so that** the second OOM source is eliminated.

## Acceptance Criteria

1. New table `semantic_fingerprints` created with columns: `id`, `content_id`, `fingerprint_hash`, `title_normalized`, `created_at`, indexed on `fingerprint_hash` and `title_normalized`
2. `src/dedup/semantic-dedup.js` rewritten: `checkSemantic()` uses indexed lookup + in-memory LRU cache (size configurable); `registerFingerprint()` uses prepared INSERT
3. Migration command `hydra migrate semantic-dedup` mirrors Story 1.2 pattern
4. `checkSemantic()` p99 ≤ 50ms for 10k fingerprints (NFR2)
5. Env flag fallback for rollback
6. Idempotent migration

## Integration Verification

- **IV1:** Pipeline run on 100 known-duplicate items produces identical dedup decisions before/after migration
- **IV2:** `hydra run --dry-run` smoke test passes
- **IV3:** Heap usage during 1000-item run drops to < 2GB (NFR1 target, validated via heap test)

## Architecture References

- Architecture §3.1 Phase 1 (Migrate Storage — parallel with Story 1.2) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §5.1 `semantic_fingerprints` DDL — `03-architecture/sharded/04-data-model.md`
- Architecture §6.2 Env vars: `HYDRA_USE_LEGACY_VECTOR_STORE` — `03-architecture/sharded/05-configuration.md`
- Architecture §8.1 Migration idempotency test file location: `tests/migrations/semantic-dedup-migration.test.js`
- PRD §1.7 corrections: OOM root cause is `semantic-dedup.js:242-263` + `vector-store.js:118-161` totaling **37.4MB** of redundant I/O per item

## Dev Notes

- **Migration source:** `hydra-data/fingerprints/fingerprints.json` (20.7MB). Mirror Story 1.2 pattern.
- **Reuse existing SQLite singleton** at `src/dedup/dedup-store.js:20` (PRD §3.2).
- **Index strategy (Architecture §5.1):** 3 indexes — `fingerprint_hash`, `title_normalized`, `content_id`. Per `5.4 Index Strategy Summary`: no covering indexes preemptively.
- **NFR2 p99 ≤ 50ms** is tight. LRU cache layer is mandatory; size configurable.
- **Parallel-safe with Story 1.2** (Architecture §3.1 Phase 1) — both run independently on the same `hydra.db`, no schema collision.
- **Rollback flag shared with Story 1.2:** `HYDRA_USE_LEGACY_VECTOR_STORE=1` falls back to JSON readers for BOTH vector-store AND semantic-dedup. Name is "vector store" historically; effective scope is broader.
- Per FR2: legacy JSON kept read-only for one release cycle as fallback.
