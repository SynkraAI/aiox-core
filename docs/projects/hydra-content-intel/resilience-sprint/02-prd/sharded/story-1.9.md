# Story 1.9: Graceful shutdown + OOM warning

**Status:** Draft
**Story ID:** 1.9
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~400 LOC (heap monitor module + SIGTERM handler refactor + `pipeline_runs.peak_heap_mb` column + `hydra health --json` extension + tests)
**Dependencies:** Story 1.8 (cost-tracker is part of Phase 5 observability), Story 1.5 (orchestrator owns the SIGTERM handler)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.9 (lines 739-761)**

---

## User Story

**As a** HYDRA operator,
**I want** the pipeline to close SQLite connections on shutdown and warn before OOM,
**so that** data isn't corrupted and operators can intervene proactively.

## Acceptance Criteria

1. SIGTERM handler at `orchestrator.js` (rewritten from `pipeline.js:212-224`) sequences shutdown:
   - Drain in-flight items (timeout 30s)
   - Close `auditLogger` (writes pending audit entries)
   - Close `entityGraph` (writes pending edges)
   - Close `dedupStore` (closes underlying SQLite singleton)
2. Heap monitor watcher runs in background during pipeline execution:
   - Samples `process.memoryUsage().heapUsed` every 5s
   - Logs `pipeline_runs.peak_heap_mb` (NFR1 instrumentation)
   - If `heapUsed > HYDRA_HEAP_WARN_MB` (default 1800): pino warning + Telegram alert with run progress
3. Pipeline run records final `peak_heap_mb` to `pipeline_runs` table
4. `hydra health --json` exposes recent runs' peak heap

## Integration Verification

- **IV1:** Forced SIGTERM during a running pipeline closes cleanly (no orphan SQLite locks)
- **IV2:** Heap warning fires on synthetic OOM-inducing run (test fixture)
- **IV3:** No regression in successful run behavior (heap warning only triggers above threshold)

## Architecture References

- Architecture §3.1 Phase 5 (Observability + Cost Tracking) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §4.1 Orchestrator spec — SIGTERM handler note (Story 1.9 makes orchestrator.js call close())
- Architecture §4.13 `heap-monitor.js` spec — `03-architecture/sharded/03-modules.md`
- Architecture §6.2 `HYDRA_HEAP_WARN_MB` env var — `03-architecture/sharded/05-configuration.md`
- Architecture §7.1 R7 mitigation (closure order: auditLogger → entityGraph → dedupStore)
- Architecture §8.1 `tests/pipeline/graceful-shutdown.test.js`, `tests/monitoring/heap-monitor.test.js`

## Dev Notes

- **Closure order matters (Architecture §7.1 R7):** `auditLogger.close() → entityGraph.close() → dedupStore.close()`. AuditLogger and EntityGraph reach into `store.db` directly to share connection. Closing the singleton first cascades and breaks them. Test (`tests/pipeline/graceful-shutdown.test.js`) asserts order.
- **Heap monitor public interface (Architecture §4.13):**
  ```js
  export function startHeapMonitor(options = {}) { ... }
  // returns {stop: () => number}  — stop() returns peak heap in MB
  ```
- **`peak_heap_mb` column** added in Story 1.5 (PRD §5 Story 1.5 AC #7). This story populates it via the heap monitor.
- **Threshold = 1800MB** (below the 2GB NFR1 ceiling) — operator has time to react before OOM.
- **Telegram alert with run progress (AC #2):** include items-processed-so-far + estimated remaining. Reuse existing `telegram-alerter.js` (R7 stays unchanged per architecture §4.13).
- **Story 1.5 owns the basic graceful drain.** Story 1.9 EXTENDS it with heap-monitor integration + `peak_heap_mb` write + warn-then-alert chain. The basic SIGTERM sequencing should already be in place from Story 1.5 (AC #5 + IV1 of Story 1.5).
- **Per Architecture §3.1 Phase 5:** Story 1.9 is parallel-safe with Story 1.8 and Story 1.11 after Story 1.5 lands.
- **`hydra health --json` enhancement (AC #4):** Add `recent_runs_peak_heap` array to JSON output. Don't break existing `hydra health` text output (CR1).
