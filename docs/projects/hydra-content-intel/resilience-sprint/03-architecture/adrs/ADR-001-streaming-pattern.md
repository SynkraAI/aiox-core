# ADR-001: Pipeline Streaming Pattern

**Format:** Michael Nygard
**Date:** 2026-05-11
**Status:** Accepted
**Deciders:** Aria (@architect), synthesizing 3/3 conclave consensus
**Conclave experts consulted:** martin-fowler, werner-vogels, charity-majors
**Conclave consensus:** 3/3 agree on async iteration; werner-vogels added per-stage failure handling as a blind-spot catch
**Related PRD requirements:** FR1 (streaming pipeline execution), NFR1 (heap ≤ 2GB), Story 1.4 (pipeline split), Story 1.5 (streaming + per-stage failure)

---

## Context

HYDRA's current pipeline (`src/pipeline.js`, 963 LOC) is structured as a batch-collecting orchestration:

1. Phase 1 fetches all items from 115 sources into a single `allContent[]` array held in memory (`pipeline.js:236-275`).
2. The function then iterates over `allContent[]` **per item** through Phases 1.5 through 7.
3. The full array stays resident in heap for the entire run.

Combined with the JSON write-amplification in `vector-store.js` and `semantic-dedup.js` (each rewrites a multi-megabyte file per item — addressed separately in ADR-002), this pattern produces:

- **Cumulative heap pressure** that exceeded the default Node heap (~1.7GB) on a 3,771-item run
- **A documented OOM crash** (stack trace at `hydra-data/full-run-final.err`) that took the scheduler down on 2026-04-16
- **A retry attempt** with `--max-old-space-size=8192` that also failed (`hydra-data/run-08mai-8gb.log`)
- **A scheduler that has been DOWN for ~25 days** as a consequence

The brownfield analysis (`01-analysis/project-documentation.md` §6.1) confirmed the hypothesis as HIGH-confidence. The PRD (§1.5, §2.1 FR1) made elimination of this pattern a sprint goal.

**Three streaming patterns were under consideration:**

1. **Pure async iteration** (`for await (const item of fetchStream())` — items processed one at a time, await provides natural backpressure)
2. **Queue-based backpressure** (in-memory bounded queue with explicit producer/consumer separation)
3. **Worker threads** (CPU-bound stage isolation, structured cloning between threads)

Each was scored by the conclave. Additionally, **werner-vogels added an orthogonal concern**: regardless of which iteration pattern wins, partial failure within a single item's journey through stages MUST NOT kill the whole run. The current pipeline's exception-bubbling behavior is itself an availability bug.

## Decision

**Adopt pure async iteration with a strict per-stage success/error contract.**

Concretely:

1. **Orchestrator structure:**
   ```js
   // src/pipeline/orchestrator.js
   for await (const item of fetchStream(options)) {
     let current = item;
     for (const stage of STAGES) {
       const result = await stage(current, context);
       if (!result.success) {
         await recordError(context.runId, item.id, result.stage, result.error);
         break;  // skip remaining stages for this item, continue the run
       }
       if (result.item === null) break;  // intentional drop (e.g., dedup hit)
       current = result.item;
     }
     await recordItemCompletion(context.runId, current, finalStage);
   }
   ```

2. **Stage contract — every stage returns:**
   ```js
   /**
    * @typedef {object} StageResult
    * @property {boolean} success
    * @property {Item|null} item    - transformed item; null = intentional drop
    * @property {Error} [error]      - present only when success=false
    * @property {string} stage       - stage name (for error logging)
    */
   ```
   No throws across stage boundaries. Stage functions internally catch all errors and return `{success: false, error, stage}`.

3. **No item buffering between stages** beyond what `await` naturally implies. The single in-flight item is the entire pipeline state between fetches.

4. **Backpressure is `await`.** If `stages/extract.js` is slow (LLM call takes 4s), `stages/fetch.js`'s async generator naturally pauses because the consumer hasn't asked for `.next()`.

5. **Per-stage failure handling:**
   - Failed items written to a new `pipeline_errors` table (`run_id`, `item_id`, `stage`, `error_message`, `stack_trace`, `created_at`)
   - The run continues — one bad item does not kill the rest
   - If a stage's error rate exceeds **10% of items**, pipeline triggers a Telegram HIGH severity alert (does NOT abort)
   - Run summary reports both success AND failure counts; the existing exit-code logic (`bin/hydra.js:84-87`) is preserved

6. **Prerequisites — characterization tests are non-negotiable:**
   - Story 1.1 produces a 50-item fixture and a snapshot test of current pipeline output BEFORE Phase 2 refactoring begins
   - Story 1.4 (split) must reproduce the fixture's output with zero diff
   - Story 1.5 (streaming) must also reproduce the fixture's output with zero diff
   - The fixture is the regression net the codebase has never had (no `tests/pipeline.test.js` exists today)

7. **Sequencing:** Story 1.4 (Extract Method refactor — split monolith, no semantic change) ships BEFORE Story 1.5 (streaming, which DOES change semantics). Two separate deploys. Each verified independently against the characterization fixture.

## Conclave Consensus

**Martin Fowler (primary voice):**
> "Worker threads are wrong here. You don't have a CPU-bound problem — you have a memory accumulation problem. Adding thread serialization overhead to fix a heap problem is using a chainsaw for a paper cut. Pure async iteration is correct."

> "The Extract Method refactor + the streaming refactor are TWO different changes — sequence them, don't compound the risk."

> "ADD CHARACTERIZATION TESTS FIRST. Story 1.1 should include 'snapshot test fixture: 50 items through current pipeline, assert outputs.' Everything after must reproduce."

**Werner Vogels (blind-spot catch):**
> "In a streaming pipeline, what happens when item N fails in stage 5 of 7? Each stage returns `{success: true, item}` or `{success: false, error, item}` — no thrown exceptions across stage boundaries. Failed items written to new `pipeline_errors` table. Run summary reports both success AND failure counts."

**Charity Majors (defers on pattern, augments on observability):**
> "I'll defer to Fowler on the refactor pattern. But every item that flows through the pipeline should produce ONE structured event with `run_id`, `item_id`, `source_name`, `final_stage`, `tier`, `cost_cents`, `duration_ms`, `clones_routed_count`."

(Charity's observability concern is captured separately in ADR-003.)

**Dissent:** None on the pattern choice. The Worker Threads option was unanimously rejected.

## Consequences

### Positive

1. **Heap usage bounded by single-item state**, not by total item count. A 5,000-item run should peak below 2GB (NFR1) — the target dropped from "all items plus working state" to "one item plus working state plus caches".
2. **Per-item failures isolated.** A single broken item (malformed RSS feed, LLM timeout, vector-store transient error) no longer kills the whole run. Operator sees the failures in `pipeline_errors` and can act on patterns.
3. **No new dependencies.** Native Node async iterators. Zero install impact.
4. **Idiomatic Node.** `for await...of` is the standard streaming pattern in the ecosystem. Any future maintainer recognizes it.
5. **Backpressure is implicit.** No explicit queue management code, no buffer-size tuning, no producer/consumer coordination bugs.
6. **Each stage is a pure function** — pure in the test sense (`(item, context) => result`), making unit testing trivial.
7. **The refactor is reversible** — `pipeline.js` retained as a thin re-export shim during transition (CR1 preserved).

### Negative

1. **Sequential per-item processing** loses pipelining opportunities. While fetch's network IO can overlap (multiple feeds fetched in parallel inside `stages/fetch.js`'s generator), within a single item, score → extract → store run strictly serially. **Trade-off accepted:** the OOM-elimination win dwarfs the latency loss, and the operator runs 2x/day (not real-time).
2. **No native parallel item processing.** If we needed to process 10 items concurrently to reduce wall-clock, we'd need `p-map`-style concurrency over the generator. **Out of scope this sprint** — explicitly deferred.
3. **Per-stage `{success, error}` contract is a discipline.** It must be enforced in code review and unit tests. A stage that throws breaks the contract and could halt a run. **Mitigation:** orchestrator wraps each stage call in a try/catch as a safety net.
4. **The 9-stage split is a code surface increase** (from 1 file to 10). **Trade-off accepted:** each stage becomes independently testable, and the longest file post-split is < 200 LOC vs 963 today.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **RA-4 from architecture.md** — streaming pipeline silently drops items if a stage misbehaves (returns undefined, throws below catch) | Medium | High | Strict contract enforced by orchestrator: items not returning a result trigger an "implicit failure" entry in `pipeline_errors`. `pipeline_items.final_stage` MUST be one of an enum set — orchestrator asserts on completion. |
| **R3 from PRD** — refactor breaks transitively-tested behavior | High | High | Characterization test (Story 1.1) is the merge gate for Stories 1.4 and 1.5. Zero-diff requirement is strict. |
| **R7 from PRD** — singleton DB close cascades break audit + entity-graph | High | High | Orchestrator's SIGTERM handler sequences closures: `auditLogger → entityGraph → dedupStore`. Dedicated graceful-shutdown test (Story 1.9). |
| **Streaming changes pipeline timing** — some sources expect to be fetched in a known order or volume | Low | Medium | `fetchStream()` preserves the existing source iteration order; only the consumption pattern changes. Snapshot test (Story 1.6) verifies routing decisions diff = empty. |

### Things we are NOT doing (and why)

- **Worker threads:** No CPU-bound work in the pipeline. LLM calls are network-bound (await is fine). Wisdom extraction is light-CPU. Premature optimization with a maintenance tail (structured cloning, error propagation across threads).
- **Bounded queue + dedicated producer/consumer goroutines (Node equivalent):** Adds explicit buffer-size tuning, deadlock risk, and complexity. Pure async iteration gives equivalent backpressure for free.
- **Streams API (`node:stream`):** Powerful but introduces a heavier abstraction layer than needed. Async generators are the modern idiomatic equivalent for this use case.
- **Reactive frameworks (RxJS):** Would be over-engineering for a single-machine CLI tool.
- **Parallel-item processing:** Out of scope. Reconsider only if wall-clock time becomes a problem (not the case today; OOM was the problem).

## References

- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/03-architecture/conclave/conclave-output.md` (full conclave responses)
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/01-analysis/project-documentation.md` §6.1 (OOM root cause hypothesis)
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/02-prd/prd.md` §2.1 FR1, §2.2 NFR1, §4-5 (Epic 1 + Stories 1.4, 1.5)
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/03-architecture/architecture.md` §3.1 Phase 2-3, §4.1, §4.2-4.10
- Code under refactor: `D:/AIOS/tools/hydra/src/pipeline.js:212-963`
- OOM evidence: `D:/AIOS/tools/hydra/hydra-data/full-run-final.err`
- Heap diagnostic: `D:/AIOS/tools/hydra/validate-heap.mjs`

## Related ADRs

- [ADR-002](./ADR-002-vector-search.md) — addresses the JSON write-amplification at the storage layer, complementary to this ADR's streaming approach
- [ADR-003](./ADR-003-observability-stack.md) — defines the `pipeline_items` + `pipeline_errors` tables this ADR depends on

---

*ADR-001 authored 2026-05-11 by Aria (@architect) on the basis of conclave 3/3 consensus.*
