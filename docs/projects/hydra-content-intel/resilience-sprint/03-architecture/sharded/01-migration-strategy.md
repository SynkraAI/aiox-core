# Architecture §3 — Migration Strategy

**Source:** `../architecture.md` lines 177-302
**Sharded by:** @po, 2026-05-12

---

## 3.1 Phased Approach

Six phases, ordered by dependency and risk. Each phase maps to one or more PRD stories. Stories within a phase can run in parallel where the dependency graph allows (see PRD §5.1).

### Phase 0 — Preflight Infrastructure

**Story:** 1.1 (partial — preflight + status.js + characterization fixture; split into 1.1a/1.1b/1.1c per PRD v0.7)
**Goal:** Make migration safe to attempt and refactor safe to verify.

**Outputs:**
- `scripts/preflight/` directory (7 scripts, each < 50 LOC)
- `src/status.js:9` migrated off legacy `getIndexStats()`
- `tests/fixtures/pipeline-characterization-2026-05-11/` — 50-item snapshot of current pipeline output
- `tests/pipeline.characterization.test.js` — Fowler's regression net

**Exit gate:** All 7 preflight scripts exit 0 on a clean working tree; characterization test green against unchanged code.

### Phase 1 — Migrate Storage (vector-store + semantic-dedup)

**Stories:** 1.2 + 1.3 (parallel-safe)
**Goal:** Eliminate the JSON write-amplification at its source. SQLite becomes the single substrate.

**Critical sequencing:**
1. Story 1.2 ships its 1-day benchmark spike FIRST (ADR-002 exit criterion). LRU vs sqlite-vss on a 10k-vector fixture; LRU is the default winner unless data dictates otherwise.
2. Migrations are gated by `preflight/all.mjs` — refuse to run if backups absent (R11 mitigation).
3. JSON files renamed to `*.legacy.json` (not deleted) for **one release cycle** (NFR8). Env flag `HYDRA_USE_LEGACY_VECTOR_STORE=1` reactivates the legacy reader.
4. Post-flight script confirms SQLite row count == JSON entry count.

**Exit gate:** `hydra search "..."` returns top-K identical to pre-migration on a 100-query fixture (IV1 of Story 1.2). Heap delta measurable on a 1000-item synthetic run.

### Phase 2 — Split the Pipeline Monolith

**Story:** 1.4
**Goal:** Break `pipeline.js` (963 LOC) into `orchestrator.js` + 9 stage modules. **No streaming yet.** Behavior identical.

**Why this is its own phase (Fowler's insistence):** "The Extract Method refactor + the streaming refactor are TWO different changes — sequence them, don't compound the risk." Split first, verify against characterization fixture, then change semantics in Phase 3.

**Compatibility:** Original `src/pipeline.js` retained as a thin re-export shim:
```js
export { runPipeline } from './pipeline/orchestrator.js';
```
Internal imports keep working; the file is removed in the **next** sprint.

**Exit gate:** Characterization test from Phase 0 produces zero diff. All 22 CLI commands behave identically (IV1 of Story 1.4).

### Phase 3 — Streaming Pipeline Execution

**Story:** 1.5
**Goal:** Change semantics — items flow one at a time. Backpressure via `await`. Per-stage `{success, error}` contract.

**Critical changes:**
- `orchestrator.js` becomes `for await (const item of fetchStream())`.
- `allContent[]` array eliminated; each item is fully processed (or discarded) before the next fetch.
- Every stage function returns `{ success: true, item } | { success: false, error, item }`. No throws across boundaries.
- Failed items written to `pipeline_errors` (table created in Phase 5).
- Error rate >10% triggers Telegram HIGH severity alert (does NOT abort the run).

**Exit gate:** Heap budget test (NFR1) passes — 5,000-item synthetic run peaks under 2GB. Characterization test still green.

### Phase 4 — Unify Distribution Codepaths

**Stories:** 1.6 + 1.7 (1.7 depends on 1.6)
**Goal:** One `DistributionService`. Three YAMLs. `--from-jsonl` flag becomes the canonical dossier-ingest path.

**Critical changes:**
- `src/distribution/distribution-service.js` becomes the only caller of `routeToMindClones()` + `writeKnowledgeFeed()`.
- `mind-clone-router.js` map (lines 159-191) extracted to `src/config/dept_to_domain.yaml`.
- `bin/ingest-dossier.mjs` angle map (lines 50-64) extracted to `src/config/angle_to_domain.yaml`.
- `bin/ingest-dossier.mjs` reduced to a deprecation wrapper:
  ```js
  console.warn('[deprecated] use `hydra run --from-jsonl <path>` instead');
  process.argv.splice(2, 0, 'run', '--from-jsonl', '--skip-phases', 'fetch,sanitize,score,extract,hallucination');
  require('./hydra.js');
  ```
- Snapshot test (Story 1.6 AC #7): routing decisions for 100 sample items diff = empty before/after.

**Exit gate:** Anipis (08/Mai) + High-Ticket (08/Mai) reference JSONLs replayed through `hydra run --from-jsonl` produce byte-identical feed writes (IV1 of Story 1.7).

### Phase 5 — Observability + Cost Tracking

**Stories:** 1.8 + 1.9 + 1.11
**Goal:** SQLite-based observability stack. Heap monitor. Cost tracker. `pipeline_items` table. `hydra query` CLI.

**Story 1.8 (cost tracker):** Parallel-safe with everything else in Phase 5. Adds `llm_calls` table + `hydra cost` + Telegram `/cost`. Hooks into `stages/score.js` and `stages/extract.js`.

**Story 1.9 (graceful shutdown + heap monitor):** Background watcher samples `process.memoryUsage().heapUsed` every 5s, logs `pipeline_runs.peak_heap_mb`, fires Telegram alert at `HYDRA_HEAP_WARN_MB` threshold (default 1800). SIGTERM handler sequences `auditLogger.close() → entityGraph.close() → dedupStore.close()`.

**Story 1.11 (Charity's per-item observability):** Adds `pipeline_items` table (one row per item processed, success OR failure) + `pipeline_errors` table + `hydra query "<sql>"` read-only CLI + 5 starter queries in `05-runbook/queries.md`. **This story is what makes the rest of the sprint worth doing in six months** — the substrate for questions we haven't thought to ask yet.

**Exit gate:** Story 1.11 IVs pass — 100-item test run inserts exactly 100 rows; `hydra query "DROP TABLE pipeline_runs"` correctly refused.

### Phase 6 — Runbooks + Documentation

**Story:** 1.10
**Goal:** Documented operability. Migration runbook, scheduler recovery runbook, updated `.env.example`, updated project memory.

**Exit gate:** Runbook is step-by-step executable by Orion/agent without code knowledge. Rollback procedure tested end-to-end on a copy of `hydra-data/`.

## 3.2 Story Sequence Visualization

```
Phase 0  ├─ Story 1.1 (preflight + status.js + characterization)
         │
Phase 1  ├─ Story 1.2 (vector-store SQLite + LRU benchmark spike) ─┐
         ├─ Story 1.3 (semantic-dedup SQLite)                       │ parallel
         │                                                          │
Phase 2  ├─ Story 1.4 (pipeline split — orchestrator + stages) ◄────┘ (1.4 needs 1.2+1.3 stable)
         │
Phase 3  ├─ Story 1.5 (streaming + per-stage {success, error})
         │
Phase 4  ├─ Story 1.6 (DistributionService + 3 YAMLs) ─┐
         ├─ Story 1.7 (--from-jsonl flag)              │ 1.7 needs 1.6
         │
Phase 5  ├─ Story 1.8 (cost tracker) ─┐
         ├─ Story 1.9 (graceful shutdown + heap monitor)
         ├─ Story 1.11 (pipeline_items + hydra query)
         │  (all 3 parallel-safe after 1.5)
         │
Phase 6  └─ Story 1.10 (runbook + docs)
```

**Critical path:** 1.1 → 1.4 → 1.5 → 1.11 → 1.10 (sequential, ~8 stories on the longest chain).

> **Note on Story 1.12 (Connect Feeds to Consultation):** Added 2026-05-12 post-conclave after empirical bug discovery. NOT on the critical path — fully parallel-safe with all refactor work. Shipped 2026-05-12 as a hotfix. See `09-consumption-side.md`.

## 3.3 Recommended Parallel Start

**Story 1.1 is the unblocker for everything.** It produces the preflight scripts AND the characterization fixture. Without the fixture, Stories 1.4 and 1.5 cannot merge (the characterization test is their merge gate).

Aria's recommendation to Orion (open question §11 — resolved): **Story 1.1's preflight scripts can begin running in production NOW, in parallel with the rest of the Story development cycle.** They are read-only verification, < 50 LOC each, with no external dependencies. Running them daily during sprint development gives early warning if (e.g.) disk fills up or someone fat-fingers `.env`. The characterization fixture work, by contrast, must be completed and merged before Story 1.4 begins.

**Resolution (2026-05-11):** Story 1.1 was split into 1.1a (preflight scripts — shipped), 1.1b (status.js fix), 1.1c (characterization fixture). 1.1a shipped 2026-05-11 in parallel with PRD validation.
