# Architecture §4 — Module / Stage Specifications

**Source:** `../architecture.md` lines 303-543
**Sharded by:** @po, 2026-05-12

For each new or rewritten module, the spec covers:
- **File location** (absolute path)
- **Public interface** (function signatures with JSDoc)
- **Dependencies on existing modules**
- **Test strategy**

---

## 4.1 `src/pipeline/orchestrator.js` (NEW — replaces `pipeline.js` monolith)

**File:** `D:/AIOS/tools/hydra/src/pipeline/orchestrator.js`
**Replaces:** `D:/AIOS/tools/hydra/src/pipeline.js` (963 LOC monolith) — original file retained as 1-line re-export shim

**Public interface:**
```js
/**
 * Run the HYDRA content pipeline using streaming async iteration.
 *
 * @param {object} options
 * @param {string[]} [options.sources]      - Filter by source type (rss/github/...)
 * @param {string}   [options.fromJsonl]    - Read items from JSONL file instead of source adapters (FR3)
 * @param {string[]} [options.skipPhases]   - Phase names to skip (e.g., ['fetch', 'sanitize'])
 * @param {boolean}  [options.dryRun]       - Skip writes (no feed/jarvis output)
 * @param {boolean}  [options.noDistribute] - Skip Phase 7 distribution
 * @param {string}   [options.configDir]    - Override config dir (for tests)
 * @returns {Promise<PipelineRunSummary>}
 */
export async function runPipeline(options) { ... }

/**
 * @typedef {object} PipelineRunSummary
 * @property {string} runId                 - UUID for this run (Werner's ADR-003)
 * @property {number} totalFetched
 * @property {number} totalProcessed
 * @property {number} totalDistributed
 * @property {number} totalFailed
 * @property {number} errorRate
 * @property {number} peakHeapMb
 * @property {number} costBrl
 * @property {object} stageStats            - Per-stage success/failure counts
 * @property {number} durationMs
 */
```

**Dependencies on existing modules:**
- `src/dedup/dedup-store.js` (SQLite singleton) — UNCHANGED
- `src/security/audit-logger.js` — UNCHANGED, but Story 1.9 makes `orchestrator.js` call `close()` on SIGTERM
- `src/distribution/entity-graph.js` — UNCHANGED
- All 9 stage modules in `src/pipeline/stages/` (NEW, see §4.2-§4.10)
- `src/monitoring/cost-tracker.js` (NEW, see §4.12)
- `src/monitoring/heap-monitor.js` (NEW, see §4.13)

**Test strategy:**
- `tests/pipeline.integration.test.js` (FR6) — E2E with 1 fixture RSS source + mock LLM
- `tests/pipeline.characterization.test.js` — Fowler's snapshot test against 50-item fixture (Story 1.1c)
- `tests/pipeline/heap-budget.test.js` — NFR1 (5,000-item synthetic run, assert heap < 2GB)
- `tests/pipeline/per-stage-failure.test.js` — inject failures at each stage, assert `pipeline_errors` rows + Telegram alert above 10%

## 4.2-4.10 Stage Modules (`src/pipeline/stages/`)

Each stage is a **pure async function** with the contract:

```js
/**
 * @callback StageFn
 * @param {Item}    item     - Input item
 * @param {Context} context  - Run-scoped context (run_id, configs, db handle, logger)
 * @returns {Promise<{success: true, item: Item} | {success: false, error: Error, item: Item, stage: string}>}
 */
```

**Critical:** No throws across stage boundaries (Werner's ADR-001 augmentation). All errors caught at the stage function level and returned as `{success: false}`. Orchestrator handles `{success: false}` by writing to `pipeline_errors` and continuing.

| Stage file | Phase | Replaces (in `pipeline.js`) | Test file |
|---|---|---|---|
| `stages/fetch.js` | 1 | lines 233-275 (`fetchAllSources`) | `tests/pipeline/stages/fetch.test.js` |
| `stages/sanitize.js` | 1.5 | calls into `security/input-sanitizer.js` | `tests/pipeline/stages/sanitize.test.js` |
| `stages/dedup.js` | 2-3 | URL + content-hash + semantic-dedup combined | `tests/pipeline/stages/dedup.test.js` |
| `stages/normalize.js` | 3 | calls `processor/normalizer.js` | `tests/pipeline/stages/normalize.test.js` |
| `stages/filter.js` | 4 | calls `curator/heuristic-filter.js` | `tests/pipeline/stages/filter.test.js` |
| `stages/score.js` | 5 | scoring-cache + llm-judge — calls cost-tracker | `tests/pipeline/stages/score.test.js` |
| `stages/extract.js` | 5b/5c | extractor + hallucination — calls cost-tracker | `tests/pipeline/stages/extract.test.js` |
| `stages/store.js` | 6 | jarvis-writer + vector-store | `tests/pipeline/stages/store.test.js` |
| `stages/distribute.js` | 7 | calls `DistributionService` (NEW, §4.11) | `tests/pipeline/stages/distribute.test.js` |

**Special note on `stages/fetch.js`:** This stage has two modes:
- **Source-adapter mode** (default): iterates over sources from `sources.yaml`, calls per-type adapter, yields items via async generator
- **JSONL mode** (when `--from-jsonl <path>` is set): reads the file line-by-line, parses each line, yields items via async generator

Both modes implement the same async-iterator interface, so the rest of the orchestrator is mode-agnostic.

## 4.11 `src/distribution/distribution-service.js` (NEW)

**File:** `D:/AIOS/tools/hydra/src/distribution/distribution-service.js`
**Purpose:** Single caller path for `routeToMindClones()` + `writeKnowledgeFeed()` + `entityGraph.registerEntities()`. Eliminates the divergence documented in `01-analysis` §5.2 (pipeline.js:732-775 vs ingest-dossier.mjs:50-74).

**Public interface:**
```js
/**
 * @typedef {object} DistributionResult
 * @property {string[]} clonesRouted       - Clone IDs that received the item
 * @property {number}   feedsWritten        - Files actually written to disk
 * @property {boolean}  entitiesRegistered  - Whether entity-graph was updated
 */

/**
 * Distribute a single item to mind-clone feeds.
 *
 * @param {NormalizedItem} item
 * @param {object} options
 * @param {string} [options.runId]         - UUID for observability
 * @param {string} [options.knowledgeFeedDir] - Override default Jarvis path (for tests)
 * @returns {Promise<DistributionResult>}
 */
export async function distributeItem(item, options = {}) { ... }

/**
 * Load + cache all 3 routing YAMLs (Layer A/B/C) at startup.
 * Called once by orchestrator before pipeline begins.
 *
 * @param {string} [configDir]
 * @returns {Promise<RoutingMaps>}
 */
export async function loadRoutingMaps(configDir) { ... }
```

**Dependencies on existing modules:**
- `src/distribution/mind-clone-router.js` — REUSED (routing algorithm preserved; only data source moves to YAML)
- `src/distribution/feed-writer.js` — UNCHANGED (CR3: feed format byte-compatible)
- `src/distribution/entity-graph.js` — UNCHANGED

**Test strategy:**
- `tests/distribution/distribution-service.test.js` — unit tests for `distributeItem` with mock router/writer
- `tests/distribution/routing-snapshot.test.js` — Story 1.6 AC #7: routing decisions for 100 sample items diff = empty before/after
- `scripts/validate-domain-mapping.mjs` — validation script that ensures no orphan keys across the 3 YAMLs (every department maps to a valid domain; every clone referenced exists in `mind-clone-index.json`)

## 4.12 `src/monitoring/cost-tracker.js` (NEW)

**File:** `D:/AIOS/tools/hydra/src/monitoring/cost-tracker.js`
**Purpose:** Per-LLM-call token + cost logging (FR8, Story 1.8).

**Public interface:**
```js
/**
 * Log a single LLM call. Async fire-and-forget; failure logs warning, never throws.
 *
 * @param {object} call
 * @param {string} call.runId
 * @param {string} call.provider           - 'deepseek' | 'anthropic' | 'openai'
 * @param {string} call.model              - e.g. 'deepseek-chat'
 * @param {number} call.tokensIn
 * @param {number} call.tokensOut
 * @returns {Promise<void>}
 */
export async function track(call) { ... }

/**
 * Aggregate cost summary.
 *
 * @param {object} filter
 * @param {number} [filter.days]
 * @param {string} [filter.runId]
 * @param {string} [filter.provider]
 * @returns {Promise<{costBrl: number, costUsd: number, byProvider: object, callCount: number}>}
 */
export async function summarize(filter) { ... }
```

**Pricing config (hardcoded constants for sprint; could move to YAML later):**
```js
const PRICING_USD_PER_1M_TOKENS = {
  'deepseek-chat':       { input: 0.27, output: 1.10 },
  'claude-3-5-sonnet':   { input: 3.00, output: 15.00 },
  'gpt-4o':              { input: 2.50, output: 10.00 },
  // ...
};
```

**Dependencies:**
- `src/dedup/dedup-store.js` — reuses SQLite singleton (writes to new `llm_calls` table)
- `src/logging/logger.js` — pino logger for warnings

**Test strategy:**
- `tests/monitoring/cost-tracker.test.js` — track + summarize unit tests
- Overhead test: assert `track()` adds < 5ms per LLM call (R5 mitigation)

## 4.13 `src/monitoring/heap-monitor.js` (NEW)

**File:** `D:/AIOS/tools/hydra/src/monitoring/heap-monitor.js`
**Purpose:** Background watcher samples `process.memoryUsage().heapUsed` every 5s, fires Telegram alert at threshold (Story 1.9).

**Public interface:**
```js
/**
 * Start background heap sampling. Returns a controller for stop + getPeak.
 *
 * @param {object} options
 * @param {number} [options.intervalMs=5000]
 * @param {number} [options.warnThresholdMb=1800]   - HYDRA_HEAP_WARN_MB
 * @param {function} [options.onWarn]                - Callback when threshold crossed
 * @returns {{stop: () => number}}                   - stop() returns peak heap in MB
 */
export function startHeapMonitor(options = {}) { ... }
```

**Dependencies:**
- `src/monitoring/telegram-alerter.js` — UNCHANGED, called via `onWarn` callback
- `src/logging/logger.js`

**Test strategy:**
- `tests/monitoring/heap-monitor.test.js` — mock `process.memoryUsage`, assert threshold crossing triggers callback exactly once per run

## 4.14 `bin/hydra.js` changes (NEW SUB-COMMANDS)

**File:** `D:/AIOS/tools/hydra/bin/hydra.js`
**Changes:**
- New flag on `hydra run`: `--from-jsonl <path>` + `--skip-phases <phase1,phase2>`
- New sub-command: `hydra migrate vector-store`
- New sub-command: `hydra migrate semantic-dedup`
- New sub-command: `hydra cost [--days N] [--run-id X] [--provider P]`
- New sub-command: `hydra query "<sql>"` (read-only, parameterized — see §4.15)

All preserved per CR1 (existing 22 commands behave identically; new commands are additive).

## 4.15 `hydra query` Command — Safety Design

**File:** `D:/AIOS/tools/hydra/bin/hydra.js` (handler) + `D:/AIOS/tools/hydra/src/query/query-runner.js` (NEW)

**Why this is its own subsection:** Charity Majors' ADR-003 calls for ad-hoc SQL access. Done naively, this is a SQL injection vector even for the operator. Done well, it's the most valuable observability tool in the sprint.

**Safety design (Story 1.11 AC #5):**

1. **Read-only enforcement:** Parse the user's SQL with a lightweight regex check; reject any of `INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|PRAGMA|ATTACH|DETACH` (case-insensitive). Additionally, open the SQLite connection in read-only mode for this command via `new Database(path, { readonly: true })`.
2. **Parameterized:** Accept named params on the CLI: `hydra query "SELECT * FROM pipeline_runs WHERE run_id = :rid" --param rid=abc123`. Refuse string concatenation patterns in the input SQL.
3. **Output:** JSON array printed to stdout. `--csv` flag for CSV (post-sprint enhancement, not in scope).
4. **Saved queries:** Story 1.11 AC #7 — 5 starter queries documented in `05-runbook/queries.md`. Telegram bot `/query <saved-name>` resolves the name to one of these.

**Test strategy:**
- `tests/query/query-runner.test.js` — assert read-only enforcement (Story 1.11 IV3)
- `tests/query/saved-queries.test.js` — each of the 5 starters returns a valid result against fixture DB
