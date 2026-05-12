# Architecture §7 — Risk Mitigation Matrix

**Source:** `../architecture.md` lines 757-797
**Sharded by:** @po, 2026-05-12

---

Maps each PRD §3.5 risk (R1-R14) to the architectural decision that addresses it. Adds new rows (RA-1 through RA-5) for risks introduced by the architecture choices in this document.

## 7.1 PRD Risks Addressed by Architecture

| Risk | Source | Architectural decision that mitigates it |
|---|---|---|
| **R1** SQLite migration corrupts data | PRD §3.5 | §3.1 Phase 1: `preflight/02-backup-verify.mjs` (mandatory). §5: All schema changes additive. §9: Env flag rollback. |
| **R2** Semantic-dedup latency regresses > 50ms | PRD §3.5 | ADR-002: in-memory LRU cache as primary read path. §5.1: indexed columns on `semantic_fingerprints`. Benchmark spike (Story 1.2 AC #7) is exit criterion. |
| **R3** Pipeline refactor breaks transitively-tested behavior | PRD §3.5 | §3.1 Phase 0: characterization test fixture (Fowler's blind-spot catch). §3.1 Phase 2: split (no semantics change) before Phase 3 streaming (semantics change). |
| **R4** 3-layer domain mapping introduces routing regressions | PRD §3.5 | §4.11: Snapshot test (100 items, diff = empty). §6.1: Validation script enforces no orphan keys. |
| **R5** Cost-tracker overhead slows LLM calls | PRD §3.5 | §4.12: Fire-and-forget pattern; SQLite write happens after LLM response returns. Overhead test asserts < 5ms. |
| **R6** `vector-store.search()` p99 > 200ms post-migration | PRD §3.5 | ADR-002: LRU cache default; benchmark spike with sqlite-vss as fallback. NFR5 = 200ms is the merge gate. |
| **R7** Singleton DB close cascades break audit + entity-graph | PRD §3.5 | §4.1: Orchestrator's SIGTERM handler sequences closures: `auditLogger → entityGraph → dedupStore`. Test (`tests/pipeline/graceful-shutdown.test.js`) asserts order. |
| **R8** `ingest-dossier.mjs` users depend on absolute-path workaround | PRD §3.5 | §3.1 Phase 4: `ingest-dossier.mjs` survives as deprecation wrapper that internally calls `hydra run --from-jsonl`. |
| **R9** `__dirname` path workarounds bite during refactor | PRD §3.5 | §4: Each refactored stage stays inside `src/pipeline/stages/` — same directory depth as today's `src/dedup/`, `src/curator/`. `__dirname` math unchanged. **`mind-clone-router.js` does NOT move.** |
| **R10** `pipeline_runs` schema additions break existing queries | PRD §3.5 | §5.2: All new columns nullable / have defaults. Existing `SELECT col1, col2 FROM pipeline_runs` queries unaffected. |
| **R11** User runs migration without backup | PRD §3.5 | §3.1 Phase 1: `preflight/02-backup-verify.mjs` is a mandatory gate. Migration script refuses to run if backup absent. |
| **R12** Scheduler restart at wrong time blocks running job | PRD §3.5 | Existing `lock-manager.js` (TTL 1h) preserved. Migration scripts acquire same lock. |
| **R13** Cron fires during migration | PRD §3.5 | Same as R12 — shared lock file (`hydra-data/state/scheduler.lock`). Cron job aborts cleanly if locked. |
| **R14** Out-of-disk during SQLite WAL growth | PRD §3.5 | §3.1 Phase 1: `preflight/00-disk-space.mjs` (≥500MB free). Runbook documents `PRAGMA wal_checkpoint(TRUNCATE)`. |

## 7.2 New Risks Introduced by This Architecture

| Risk | Description | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **RA-1** LRU cache eviction thrashing on cold start | If working set > cache capacity, cache miss rate spikes; first `hydra search` after startup could be slow until warm | Low | Low | Cache sized for full corpus (10k vectors ≈ 60MB) — fits in default Node heap. Lazy load on first search() (Story 1.2 AC #8) avoids paying cost at startup. |
| **RA-2** `hydra query` becomes operator's foot-gun | Read-only enforcement could be bypassed by a clever query (e.g., recursive CTE that consumes huge memory) | Low | Medium | §4.15: SQLite opened in read-only mode. Plus a per-query timeout (`PRAGMA busy_timeout=5000`). Operator-only command — not exposed via Telegram raw (only via 5 saved queries). |
| **RA-3** Per-item `pipeline_items` row writes amplify write load during high-volume runs | A 5,000-item run writes 5,000 rows + 5,000 audit rows + N llm_calls rows — risks contention | Low | Low | Single SQLite connection in WAL mode handles ~50k writes/sec. Test (`tests/pipeline/write-throughput.test.js`) measures actual contention on 10k-item synthetic run. |
| **RA-4** Streaming pipeline silently drops items if a stage misbehaves | A stage that returns `undefined` or throws below the catch boundary could silently lose items | Medium | High | §4.2-§4.10: Strict `{success, error}` contract enforced by orchestrator. Items not returning a result trigger an "implicit failure" entry in `pipeline_errors`. `pipeline_items.final_stage` MUST be one of an enum set — orchestrator asserts on completion. |
| **RA-5** Characterization test goes stale (real-world content drifts; fixture pinned to 11/Mai) | The 50-item fixture captures behavior on a specific date; if content changes (URLs, LLM responses), test could fail spuriously | Medium | Medium | Fixture uses **mocked LLM responses** (stable inputs). Fixture content is deliberately curated to be deterministic. Test compares structural outputs (which clones, which feed paths), NOT LLM-generated text. |

## 7.3 PRD §3.5 Additional Risks (RA-6 through RA-9) — Consumption Side

Per PRD v1.0 / Aria C-10 audit, the following risks were added in §3.5 for Story 1.12 (consumption side):

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **RA-6** Conclave token blowup | Medium | Medium | 30k per-expert cap (Story 1.12 AC #3). Telegram alert if conclave cost > R$3.00 (2× normal). |
| **RA-7** Feedback loop with pre-fix hallucinated feeds | Medium | High | Quarantine all entries with `generated_at < 2026-05-12` per ADR-004 §5. `loadCloneFeeds()` flags quarantined entries; prompt warns LLM. Backfill anti-hallucination check optional Sprint #2. |
| **RA-8** `relevantMemory` shape break | Low | High | RENAME field to `feedEntries` per C-10 audit recommendation. Legacy `relevantMemory: string[]` kept as `[]` alias for 1 release. Audit (4 callers) confirms only renderer would break; renderer updated in Story 1.12. |
| **RA-9** Filename date parsing fragility | Low | Low | `loadCloneFeeds()` uses regex `^(\d{4})-(\d{2})-(\d{2})-hydra-feed\.md$`. Files not matching regex are skipped with pino warn. Unit test in `tests/distribution/feed-reader.test.js`. |

## 7.4 Risk Register Summary

- **14 PRD risks** addressed (R1-R14)
- **5 new architectural risks** identified (RA-1 through RA-5)
- **4 PRD consumption-side risks** (RA-6 through RA-9)
- **All risks have a specific mitigation** rooted in either an ADR, a story AC, or a preflight script
- **Reviewed at sprint retrospective** — each marked actualized/avoided
