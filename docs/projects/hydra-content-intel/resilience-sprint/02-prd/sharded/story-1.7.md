# Story 1.7: `hydra run --from-jsonl` flag

**Status:** Draft
**Story ID:** 1.7
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~300 LOC (CLI flag handling + JSONL fetch mode + skip-phases logic + deprecation wrapper + integration test)
**Dependencies:** Story 1.6 (DistributionService — `hydra run --from-jsonl` routes through unified service)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.7 (lines 692-711)**

---

## User Story

**As a** HYDRA operator,
**I want** the live pipeline to accept a JSONL dossier as input,
**so that** dossier ingestion goes through the same code path as automated runs.

## Acceptance Criteria

1. `bin/hydra.js run` accepts new flag `--from-jsonl <path>`
2. Optional companion flag `--skip-phases <phase1,phase2>` (e.g., `--skip-phases fetch,sanitize` for already-curated dossiers)
3. When `--from-jsonl` is used:
   - `stages/fetch.js` reads from the JSONL file instead of source adapters
   - Items continue through downstream stages (configurable via `--skip-phases`)
   - DistributionService writes to mind-clone feeds as usual
4. `bin/ingest-dossier.mjs` becomes 1-line wrapper: `process.argv.splice(2, 0, 'run', '--from-jsonl', '--skip-phases', 'fetch,sanitize,score,extract,hallucination'); ...`
5. Deprecation warning printed when invoking `ingest-dossier.mjs` (suggest `hydra run --from-jsonl`)

## Integration Verification

- **IV1:** Running both Anipis (08/Mai) and High-Ticket (08/Mai) reference JSONLs through new command produces identical feed writes to the historical run
- **IV2:** `ingest-dossier.mjs` continues to work (back-compat)
- **IV3:** New flag passes all 22 CLI command tests

## Architecture References

- Architecture §3.1 Phase 4 (Unify Distribution Codepaths) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §4.14 `bin/hydra.js` changes (new flags, sub-commands)
- Architecture §4.2-4.10 Special note on `stages/fetch.js` two modes (source-adapter vs JSONL)
- Architecture §7.1 R8 mitigation (`ingest-dossier.mjs` deprecation wrapper)
- Architecture §8.1 Test location: `tests/integration/dossier-replay.test.js`

## Dev Notes

- **`stages/fetch.js` two modes (Architecture §4.2-4.10):**
  - **Source-adapter mode** (default): iterates over sources from `sources.yaml`, calls per-type adapter, yields items via async generator
  - **JSONL mode** (when `--from-jsonl <path>` is set): reads the file line-by-line, parses each line, yields items via async generator
  Both modes implement the same async-iterator interface — the rest of the orchestrator is mode-agnostic.
- **Deprecation wrapper (Architecture §3.1 Phase 4):**
  ```js
  console.warn('[deprecated] use `hydra run --from-jsonl <path>` instead');
  process.argv.splice(2, 0, 'run', '--from-jsonl', '--skip-phases', 'fetch,sanitize,score,extract,hallucination');
  require('./hydra.js');
  ```
- **Exit gate (Architecture §3.1 Phase 4):** Anipis (08/Mai) + High-Ticket (08/Mai) reference JSONLs replayed through `hydra run --from-jsonl` produce byte-identical feed writes (IV1 of this story).
- **Reference JSONL files** (for IV1) — locate in:
  - Anipis: `docs/projects/anipis/squad-08mai/`
  - High-Ticket: `docs/projects/highticket/squad-08mai/`
- **CR1 preserved:** New flag is additive. All 22 existing commands continue to work unchanged.
- **R8 mitigation:** `ingest-dossier.mjs` survives as deprecation wrapper (one release cycle). Some users may depend on absolute-path workaround — wrapper preserves that.
- **`--skip-phases` is a comma-separated list.** For already-curated dossier ingestion, typical skip set is: `fetch,sanitize,score,extract,hallucination` (the dossier comes pre-scored).
