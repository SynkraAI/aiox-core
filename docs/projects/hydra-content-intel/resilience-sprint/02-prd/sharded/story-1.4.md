# Story 1.4: Pipeline split — orchestrator + stages

**Status:** Draft
**Story ID:** 1.4
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~1,200 LOC (orchestrator + 9 stage modules; reorg of existing 963 LOC + tests)
**Dependencies:** Story 1.1c (characterization fixture — REQUIRED merge gate)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.4 (lines 606-635)**

---

## User Story

**As a** HYDRA developer,
**I want** `pipeline.js` (963 LOC monolith) split into `src/pipeline/orchestrator.js` + `src/pipeline/stages/`,
**so that** each phase is independently testable and the streaming refactor (Story 1.5) becomes tractable.

## Acceptance Criteria

1. New directory `src/pipeline/` with files:
   - `orchestrator.js` — top-level `runPipeline()` (the only public entry)
   - `stages/fetch.js` — Phase 1 (source adapters)
   - `stages/sanitize.js` — Phase 1.5 (security)
   - `stages/dedup.js` — Phase 2-3 (URL + hash + semantic)
   - `stages/normalize.js` — Phase 3 (normalizer)
   - `stages/filter.js` — Phase 4 (heuristic)
   - `stages/score.js` — Phase 5 (LLM judge + scoring-cache)
   - `stages/extract.js` — Phase 5b (wisdom + hallucination)
   - `stages/store.js` — Phase 6 (jarvis-writer + vector-store)
   - `stages/distribute.js` — Phase 7 (DistributionService — see Story 1.6)
2. Original `src/pipeline.js` retained as thin re-export shim (for back-compat with internal imports): `export { runPipeline } from './pipeline/orchestrator.js';`. **Note:** the shim uses a relative import deliberately (HYDRA has no bundler / no `tsconfig paths` / no `@/` alias infrastructure — Constitution Article VI absolute-imports SHOULD does not apply to this codebase). The shim is kept for 1 release cycle then removed in sprint #2.
3. Each stage is a pure function: `(items, context) => transformedItems` — no global state
4. Each stage has its own test file in `tests/pipeline/stages/`
5. New integration test `tests/pipeline.integration.test.js` (FR6) covers full orchestrator flow with mock LLM + 1 fixture RSS source
6. No regression in `hydra run` behavior

## Integration Verification

- **IV1:** All 22 CLI commands continue to work
- **IV2:** Telegram bot `/run` triggers the same execution path
- **IV3:** Scheduler `JobRunner` continues to invoke `runPipeline()` unchanged
- **IV4:** Full test suite (37+ test files) passes

## Architecture References

- Architecture §3.1 Phase 2 (Split the Pipeline Monolith) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §4.1 `orchestrator.js` spec — `03-architecture/sharded/03-modules.md`
- Architecture §4.2-4.10 Stage modules table — `03-architecture/sharded/03-modules.md`
- Architecture §8.1 Test file locations for orchestrator + 9 stages
- ADR-001: Streaming pattern (Phase 2 prep — split first, stream in Story 1.5)

## Dev Notes

- **Fowler's insistence (Architecture §3.1 Phase 2):** "The Extract Method refactor + the streaming refactor are TWO different changes — sequence them, don't compound the risk." Split first, verify against characterization fixture, **then** change semantics in Story 1.5.
- **No streaming yet.** This story preserves current semantics (still `allContent[]` array). Streaming refactor is Story 1.5.
- **Characterization test (Story 1.1c fixture) is the merge gate.** If output diff is non-empty, refactor is rejected.
- **Shim pattern (Architecture §3.1 Phase 2):** `src/pipeline.js` becomes:
  ```js
  export { runPipeline } from './pipeline/orchestrator.js';
  ```
  Kept for 1 release cycle, then removed in sprint #2 (resolution to Architecture §11 Q1: keep shim, cheap insurance).
- **Stage contract (Architecture §4.2-4.10):** Each stage is `(item, context) => Promise<{success, item} | {success: false, error, item, stage}>`. **No throws across stage boundaries.** That contract is enforced in Story 1.5; in Story 1.4 the stages still throw (preserving current semantics for the characterization test).
- **`stages/fetch.js` has two modes** (Architecture §4.2-4.10): source-adapter mode (default) and JSONL mode (when `--from-jsonl` is set). JSONL mode is wired in Story 1.7; Story 1.4 only needs the source-adapter mode.
- **`__dirname` math unchanged** — stages stay inside `src/pipeline/stages/` at same depth as today's `src/dedup/`, `src/curator/` (R9 mitigation per architecture §7.1).
- **Critical:** `pipeline_runs` row writing and audit_log integration are still part of orchestrator's responsibility — those write paths are on the critical write path (NFR9). DO NOT change `audit_log` schema (CR4).
