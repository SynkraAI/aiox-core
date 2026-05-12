# Story 1.1b: `status.js` SQLite read fix

**Status:** Draft
**Story ID:** 1.1b
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~10 LOC (2-line fix + test)
**Dependencies:** none (independent, parallel-safe with everything)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.1b (lines 514-529)**

---

## User Story

**As a** HYDRA operator,
**I want** `hydra status` to read live counts from SQLite instead of a frozen legacy JSON file,
**so that** my self-diagnosis surface reflects reality (thousands of URLs, not the frozen 209 from the obsolete JSON path).

## Acceptance Criteria

1. `src/status.js:9` replaces `getIndexStats()` (legacy `dedup-index.js` JSON path) with `DedupStore.getStats()` (SQLite) — trivial 2-line fix per FR7
2. The legacy `dedup-index.js` import is forbidden from `status.js` (covered by a unit test that grep-asserts the import is absent)
3. `hydra status` output shows live SQLite counts: total URLs, total content hashes, last run timestamp — all sourced from `hydra.db`
4. Unit test added for `status.js` asserting it calls `DedupStore.getStats()` once and renders the returned object

## Integration Verification

- **IV1:** Existing `hydra status` consumers (Telegram bot `/status` command at `telegram-bot.js`) display correct numbers (verified manually post-deploy)
- **IV2:** No regression in startup time of `hydra status` (currently < 500ms — `DedupStore.getStats()` is a prepared aggregate, faster than the JSON parse path)
- **IV3:** `hydra status` exit code remains 0 on a healthy install and ≠ 0 if the DB is missing/locked (same contract as today)

## Architecture References

- Architecture §3.1 Phase 0 — `03-architecture/sharded/01-migration-strategy.md`
- PRD §1.7 Document-Project Corrections: `status.js:9 reports stale legacy counts — FR7 added (trivial but blocks self-diagnosis)`
- PRD §2.1 FR7 — `src/status.js:9` MUST replace `getIndexStats()` (legacy JSON) with `DedupStore.getStats()`

## Dev Notes

- This is the smallest-possible standalone shipment. Can ship before everything else (parallel-safe).
- Per FR7: "The legacy `dedup-index.js` import is forbidden from `status.js`". Enforce via unit test grep-assertion.
- `DedupStore.getStats()` already exists (Epic 6 / SQLite singleton in `src/dedup/dedup-store.js`). No new functionality — just a swap.
- @architect's analysis (PRD §1.7): the reason this matters is "frozen 209 from the obsolete JSON path" while real SQLite has thousands of URLs. The bug is observability/self-diagnosis only — no data integrity issue.
