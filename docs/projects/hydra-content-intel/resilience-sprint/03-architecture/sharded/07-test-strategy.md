# Architecture §8 — Test Strategy

**Source:** `../architecture.md` lines 798-869
**Sharded by:** @po, 2026-05-12

---

## 8.1 Test Types and File Locations

| Test type | Story | File path (absolute) |
|---|---|---|
| **Characterization (snapshot)** | 1.1c | `D:/AIOS/tools/hydra/tests/pipeline.characterization.test.js` + `D:/AIOS/tools/hydra/tests/fixtures/pipeline-characterization-2026-05-11/` |
| **Benchmark spike (LRU vs sqlite-vss)** | 1.2 | `D:/AIOS/tools/hydra/tests/benchmarks/vector-search.bench.js` + fixture `D:/AIOS/tools/hydra/tests/fixtures/vector-bench-10k.bin` |
| **E2E pipeline integration (FR6)** | 1.4 | `D:/AIOS/tools/hydra/tests/pipeline.integration.test.js` |
| **Heap budget (NFR1)** | 1.5 | `D:/AIOS/tools/hydra/tests/pipeline/heap-budget.test.js` |
| **Per-stage failure** | 1.5 | `D:/AIOS/tools/hydra/tests/pipeline/per-stage-failure.test.js` |
| **Graceful shutdown** | 1.9 | `D:/AIOS/tools/hydra/tests/pipeline/graceful-shutdown.test.js` |
| **Routing snapshot** | 1.6 | `D:/AIOS/tools/hydra/tests/distribution/routing-snapshot.test.js` |
| **`pipeline_items` observability** | 1.11 | `D:/AIOS/tools/hydra/tests/pipeline/items-observability.test.js` |
| **`hydra query` safety** | 1.11 | `D:/AIOS/tools/hydra/tests/query/query-runner.test.js` |
| **Saved queries** | 1.11 | `D:/AIOS/tools/hydra/tests/query/saved-queries.test.js` |
| **Backward compat — dossier replay** | 1.7 | `D:/AIOS/tools/hydra/tests/integration/dossier-replay.test.js` |
| **Migration idempotency** | 1.2 + 1.3 | `D:/AIOS/tools/hydra/tests/migrations/vector-store-migration.test.js` + `D:/AIOS/tools/hydra/tests/migrations/semantic-dedup-migration.test.js` |
| **Stage unit tests (9 files)** | 1.4 | `D:/AIOS/tools/hydra/tests/pipeline/stages/{fetch,sanitize,dedup,normalize,filter,score,extract,store,distribute}.test.js` |
| **Cost tracker overhead** | 1.8 | `D:/AIOS/tools/hydra/tests/monitoring/cost-tracker.test.js` |
| **Preflight scripts (7 unit tests)** | 1.1a | `D:/AIOS/tools/hydra/tests/preflight/{00..05,all}.test.js` |
| **Feed-reader (consumption side)** | 1.12 | `D:/AIOS/tools/hydra/tests/distribution/feed-reader.test.js` |
| **Feed injection (consultation prompt)** | 1.12 | `D:/AIOS/tools/hydra/tests/consultation/feed-injection.test.js` |

## 8.2 Critical Tests by Phase

**Phase 0 must produce:**
- Characterization fixture: 50 items (mix of S/A/B tiers + dedup hits + filter rejects) input as JSONL
- Snapshot of side effects: SQLite row deltas, feed file additions, audit log entries
- Test that re-runs the pipeline on the fixture and asserts byte-identical structural output

**Phase 1 must NOT merge unless:**
- Migration idempotency tests green
- Story 1.2 AC #7 benchmark spike completes; selected approach hits p99 ≤ 200ms
- `validate-heap.mjs` shows measurable heap reduction on a 1000-item run

**Phase 2 must NOT merge unless:**
- All 9 stage unit tests green
- E2E integration test green (with mock LLM + 1 fixture RSS source)
- Characterization test from Phase 0 green (zero diff)

**Phase 3 must NOT merge unless:**
- Heap budget test green (5,000-item synthetic, peak < 2GB)
- Per-stage failure test green (10% failure rate, run completes, alerts fire, exit code 0)
- Characterization test still green

**Phase 4 must NOT merge unless:**
- Routing snapshot test green (100 items, diff = empty)
- Dossier replay test green (Anipis + High-Ticket JSONLs)

**Phase 5 must NOT merge unless:**
- `pipeline_items` observability test green (100 items in → 100 rows out, with correct `final_stage` enum values)
- `hydra query` safety tests green (DROP refused, parameterized binding works)
- Cost tracker overhead < 5ms per call

## 8.3 Test Run Command (Unchanged per CR5)

```bash
cd D:/AIOS/tools/hydra
npm test                          # runs all tests via bin/jest.js ESM wrapper
npm test -- pipeline              # runs only pipeline tests (Jest filename filter)
npm test -- --testPathPattern=benchmarks  # runs benchmark suite (long-running)
```

## 8.4 Mock Strategy

- **LLM responses:** All tests use a `MockLLMClient` that returns canned JSON. Pricing constants point to a `mock` provider (cost = 0).
- **Source adapters:** E2E test uses a local fixture RSS XML file served via `file://` URL.
- **SQLite:** Each test gets a fresh `:memory:` database via `resetDedupStore({ inMemory: true })` (extending existing helper).
- **Telegram alerts:** Captured via `TelegramAlerter` mock; tests assert `.alertsFired` array.
- **Filesystem (Jarvis KB writes):** Tests use a temp dir (Node's `os.tmpdir()` + run UUID), cleaned up in `afterEach`.
