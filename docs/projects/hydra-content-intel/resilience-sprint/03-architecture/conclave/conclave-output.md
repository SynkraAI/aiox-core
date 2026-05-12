# HYDRA Resilience Sprint — Mind Clone Conclave Output

**Date:** 2026-05-11
**Calling agent:** @architect (via Orion aios-master)
**Project:** hydra
**Experts:** martin-fowler + werner-vogels + charity-majors
**Question:** Three architectural decisions need ADRs — (1) Streaming pattern, (2) SQLite vector search, (3) Observability stack.

---

## Expert Responses

### 🔧 Martin Fowler — Refactoring & Evolutionary Architecture

**Voice:** *"You haven't earned the right to a clever architecture yet. You have a 963-LOC function with zero direct tests. Before any 'streaming pattern' debate, you need characterization tests on the existing behavior. The Extract Method refactor + the streaming refactor are TWO different changes — sequence them, don't compound the risk."*

**On Decision 1 — Streaming Pattern:**

> "Worker threads are wrong here. You don't have a CPU-bound problem — you have a memory accumulation problem. Adding thread serialization overhead to fix a heap problem is using a chainsaw for a paper cut. **Pure async iteration (`for await of`) is correct.** It's idiomatic Node, requires zero new dependencies, and the streaming pattern naturally maps to your existing per-item processing.
>
> The queue-based backpressure pattern is interesting but premature. You don't have multiple producers feeding the pipeline — you have one fetcher producing items at network speed, and downstream stages that are either fast (sanitize, dedup) or LLM-bound (score, extract). The natural backpressure is **just await**. If extract is slow, fetch waits.
>
> **My ADR:**
> - **Decision:** Pure async iteration. `orchestrator.js` uses `for await (const item of fetchStream())` and processes items through stages sequentially.
> - **Each stage is a function `(item, context) => transformedItem | null`** (null = item dropped, e.g. dedup hit).
> - **No item buffering between stages** beyond what await naturally implies.
> - **Backpressure:** await on slow stages naturally pauses upstream.
> - **Worker threads explicitly rejected** until profiling shows CPU saturation.
>
> Critical: **add characterization tests BEFORE the refactor.** Snapshot the current pipeline's output for 100 fixture items. The streaming refactor must reproduce identical output. Story 1.4 (split) and Story 1.5 (streaming) are sequenced correctly in the PRD — don't merge them. Each gets its own deploy."

**On Decision 2 — SQLite vector search:**

> "I don't have strong opinions on the vector index — that's not my domain. But I have **opinions on how you decide.** The question is: do you have the search latency data right now? You said 'p99 < 200ms target.' What's the current p99 with JSON? If it's 50ms today on a 16.7MB JSON file, any SQLite approach with an index will likely match or beat it. If it's already 800ms, you have a real problem and need sqlite-vss.
>
> **My ADR for HOW to decide (not which to pick):**
> 1. Spike sqlite-vss in a branch (1 day)
> 2. Spike in-memory LRU cache in a branch (1 day)
> 3. Benchmark both against fixture of 10k vectors with 100 queries
> 4. Pick the winner with shortest mean and p99
> 5. Document loser as 'considered, rejected because…'
>
> Don't pick without data. And **don't pick hybrid first** — hybrid means two failure modes."

**On Decision 3 — Observability:**

> "You're on a Windows local box with ONE operator. Adding Prometheus is over-engineering. The question is not 'do we need OpenTelemetry' — it's 'what's the minimum that gives you MTTR < 5min on a scheduler crash?'
>
> **Current stack already does most of this.** Pino structured JSON to disk + Telegram alerts on HIGH+ severity. What's missing:
> - **Run metrics persisted to SQLite** (already in PRD: `pipeline_runs` table with `peak_heap_mb` column). YES.
> - **A heartbeat that's actually monitored** (you have `heartbeat.json`; nothing reads it). Add a 'last seen >X minutes ago' check to `hydra health`.
> - **A way to see WHY a run crashed without reading 50 log lines.** Add a `run_errors` table or column to `pipeline_runs` capturing top-level error.
>
> **My ADR:**
> - **Reject Prometheus/OpenTelemetry for this sprint.** Out of scope. The complexity ROI is wrong for a single-machine deployment.
> - **Add structured run-level observability to SQLite:** `pipeline_runs.peak_heap_mb`, `pipeline_runs.fatal_error`, `pipeline_runs.cost_brl`.
> - **Make `hydra health` actually useful** — check heartbeat freshness, last run status, recent errors.
> - **Telegram alert on STALE heartbeat** (>90min when scheduler should be running)."

**Cross-cutting fowler principle:**
> "The biggest risk in this sprint is the **refactor itself causes a regression you don't catch.** Pipeline.js has zero direct tests. ADD CHARACTERIZATION TESTS FIRST. Story 1.1 should include 'snapshot test fixture: 50 items through current pipeline, assert outputs.' Everything after must reproduce."

---

### ☁️ Werner Vogels — Distributed Systems & Resilience

**Voice:** *"Everything fails, all the time. You're not designing for the happy path — you're designing for the moment at 3 AM when SQLite throws an unexpected lock error and your pipeline halts. The question isn't 'will it fail?', it's 'how will you know, and how fast can you recover?'"*

**On Decision 1 — Streaming Pattern:**

> "Fowler is right on async iteration — but you also need to think about **partial failure**. In a streaming pipeline, what happens when item N fails in stage 5 of 7? You have three choices:
>
> 1. **Halt the run** (your current behavior — bad, one item kills everything)
> 2. **Skip the item, continue** (resilient, but silent — data loss without alarm)
> 3. **Skip the item, log to error table, continue** (the right answer)
>
> **My ADR augmentation:**
> - **Each stage returns `{ success: true, item }` or `{ success: false, error, item }`** — no thrown exceptions across stage boundaries.
> - **Failed items written to new `pipeline_errors` table** with run_id, item_id, stage, error_message.
> - **Run summary reports both success AND failure counts.** A run that 'succeeds' but had 30% items fail in extract stage MUST trigger a HIGH severity Telegram alert.
> - **Graceful degradation:** if vector-store fails to write, the pipeline still distributes (vector-store is for search, not the critical path). Tag the item, continue.
>
> 'Everything fails all the time' means designing each stage to fail independently. Right now your pipeline is a chain — one broken link kills the rest. Decouple."

**On Decision 2 — SQLite vector search:**

> "Cost is a first-class requirement. On a local Windows box, this means **disk I/O cost + maintenance cost**. sqlite-vss adds an external dependency (a C extension you have to install + verify across Node versions). LRU cache costs RAM but is pure JS.
>
> **For 10k vectors at p99 < 200ms, LRU cache wins on operational simplicity.** 10k × 1536 dimensions × 4 bytes = ~60MB resident. That's nothing on a 16GB box. Cosine similarity over 10k vectors in pure JS is <20ms on modern Node. The cost: a cold-cache miss on the first query after startup.
>
> **My ADR:**
> - **In-memory cosine cache, loaded lazily on first search().**
> - SQLite is the SOURCE OF TRUTH — vectors persist there.
> - Cache invalidates on `upsert()` (write-through).
> - Refuse sqlite-vss for this sprint. Reason: external native dep introduces a new failure mode (build failures cross-platform).
> - **Reconsider sqlite-vss in 6 months** if corpus grows >100k vectors and cache no longer fits in RAM.
>
> Frugality is wisdom. Don't pay maintenance cost on dependencies you don't need yet."

**On Decision 3 — Observability:**

> "I agree with Fowler — Prometheus is wrong for a single-machine deployment. But 'pino + Telegram' is not enough either if you can't answer 'what happened on the run that failed at 3 AM 4 days ago?'
>
> **My ADR augmentation:**
> - **Every run gets a `run_id` UUID.** Logged with every log line. Persisted in `pipeline_runs`.
> - **All errors during a run carry that run_id.** Single grep to reconstruct a run.
> - **Daily SQLite log retention rule:** `pipeline_runs` last 90 days, `pipeline_errors` last 30 days, audit_log last 90 days (existing).
> - **`hydra health --json` returns last 5 runs with status, cost, heap peak, error count.** This is your dashboard.
> - **Optional: dump health JSON to GitHub Gist every 6h** for remote view when you're traveling. Adds zero infra cost.
>
> The 'observability for SRE on single-machine deployment' question has a name: **structured logs + structured runs in SQLite.** You already have the SQLite. You just need to USE it for runs the way you use it for dedup."

**Cross-cutting vogels principle:**
> "Builders are the heroes. **The operator (you) is the builder.** Optimize the experience of being woken up at 3 AM by an alert. What do you want to see in Telegram? A run_id, a one-line cause, a runbook link. Design for that. Then design backward to what the code needs to log."

---

### 📊 Charity Majors — Observability & Honest Engineering

**Voice:** *"Stop calling it 'monitoring' — that's checking if known things are still true. You want **observability**: the ability to ask new questions of your system without shipping new code. For a single-operator system, you don't need OpenTelemetry — you need rich structured events and the will to query them."*

**On Decision 1 — Streaming Pattern:**

> "I'll defer to Fowler on the refactor pattern. But I have strong opinions on **what each stage must emit**. Right now you have logs. You need **events with high cardinality**.
>
> Every item that flows through the pipeline should produce ONE structured event with these fields at minimum:
> - `run_id` (Werner already said this — yes)
> - `item_id` (sha256 of url, you already have this)
> - `source_name` (which RSS feed)
> - `final_stage` (where did it end — distributed, deduped, filtered, failed?)
> - `tier` (S/A/B if scored)
> - `cost_cents` (if LLM was called)
> - `duration_ms` (total time in pipeline)
> - `clones_routed_count` (how many feeds got it)
>
> **My ADR augmentation:**
> - **One row in a new `pipeline_items` table per item processed.** 5000 items = 5000 rows = ~500KB. Negligible.
> - **Query the table to answer ANYTHING:** 'why are we burning $X on extract for tier-B items?' 'which source has the worst dedup rate?' 'which clone gets the most items?'
> - **This is your observability stack.** SQLite. Not Honeycomb. For your scale.
> - When the corpus grows 10x or you need real-time alerting, revisit. Until then, **SQLite + ad-hoc SQL queries IS observability.**"

**On Decision 2 — SQLite vector search:**

> "Pass — not my domain."

**On Decision 3 — Observability:**

> "You're asking the wrong question. 'Prometheus or pino+Telegram?' is a tools question. The right question is: **what new questions do you want to ask in 6 months that you can't answer today?**
>
> Examples:
> - 'Why did the run on May 14 cost 3x more than the day before?' → Need per-item cost. (Story 1.8 solves this.)
> - 'Which 3 sources contribute 80% of dedup hits?' → Need per-item source_name + dedup flag. (My ADR above solves this.)
> - 'Did the SQLite migration actually drop heap usage?' → Need `peak_heap_mb` per run + run_id linkage. (PRD already has this.)
>
> **My ADR for observability:**
> - **Build `pipeline_items` and `pipeline_errors` tables. Make them queryable.**
> - **Ship `hydra query \"<sql>\"` as a power-user CLI command.** Read-only, parameterized, queries against `hydra.db`. Saves you from writing one-off scripts forever.
> - **Document 5 'starter queries' in the runbook:** 'what was last run cost?', 'show top error stages last 7d', 'how many items deduped by source?', etc.
> - **Telegram bot `/query` command** for the 5 saved queries.
>
> Do this and you will know your system 10x better than you do today. And it'll cost you 100 LOC of new code, not a SaaS subscription."

**Cross-cutting majors principle:**
> "The team that knows how to ask questions wins. Build the substrate for asking questions: rich events + queryable storage. Tools come later. **Curiosity is the precondition for reliability.**"

---

## CONSENSUS / DISSENT / BLIND SPOTS

### CONSENSUS (3/3 agree)

1. **Streaming pattern:** Pure async iteration (`for await`) — reject Worker threads + reject queue-based backpressure for this sprint.
2. **Observability stack for sprint scope:** Use SQLite as the observability store. **Reject Prometheus/OpenTelemetry.** Single-machine deployment doesn't need it.
3. **Run-level instrumentation is non-negotiable:** `run_id` per run, peak heap, fatal_error, cost — all in `pipeline_runs`. Plus per-item observability table (`pipeline_items`, charity).
4. **Per-stage failure must not kill the run.** Failed items go to `pipeline_errors`, run continues.

### DISSENT (2 vs 1)

1. **SQLite vector search:**
   - Werner: **In-memory LRU cache** (RAM cheap, sqlite-vss adds native dep risk)
   - Fowler: **Don't pick yet — benchmark sqlite-vss AND LRU, then decide**
   - Majors: pass
   - **Synthesis:** Fowler's process wins (benchmark spike), but Werner's default position (LRU cache) is the likely winner. Sprint plan: 1-day spike for both, pick LRU unless data says otherwise.

### BLIND SPOTS (each expert pointed out what the others missed)

- **Fowler caught:** Nobody mentioned **characterization tests as a prerequisite** for the refactor. PRD Story 1.1 must include a 50-item snapshot test of current pipeline behavior.
- **Werner caught:** Nobody mentioned **partial failure handling per stage.** Need new `pipeline_errors` table + per-item failure tagging. Each stage returns `{success, error}` shape.
- **Majors caught:** Nobody designed for **future ad-hoc queries.** Need `pipeline_items` table + `hydra query "<sql>"` CLI command for asking new questions without shipping new code.

### VERDICT (synthesis for architecture.md)

**3 ADRs to write:**

#### ADR-001: Pipeline Streaming Pattern
- **Decision:** Pure async iteration (`for await`) in `orchestrator.js`. Each stage is `async (item, context) => { success, item, error }`. No throws across stage boundaries. Worker threads + queue-based backpressure deferred indefinitely.
- **Prerequisite:** Characterization tests (50-item snapshot) added in Story 1.1 BEFORE refactor begins.
- **Failure mode:** Failed items written to new `pipeline_errors` table with `run_id`, `item_id`, `stage`, `error_message`. Run continues. If error rate >10% trigger Telegram HIGH alert.

#### ADR-002: SQLite Vector Search
- **Decision:** **In-memory LRU cache** loaded lazily on first `search()`. SQLite (`vector_embeddings` table) is source of truth. Cache invalidated on write-through `upsert()`.
- **Validation:** 1-day spike branch benchmarks LRU vs sqlite-vss against 10k-vector + 100-query fixture. If LRU p99 > 200ms (NFR5), fall back to sqlite-vss.
- **Rejected:** sqlite-vss as default (native dep risk on Windows). Reconsider in 6 months if corpus >100k vectors.

#### ADR-003: Observability Stack
- **Decision:** SQLite-based observability. **Reject Prometheus/OpenTelemetry for this sprint.**
- **Schema additions:**
  - `pipeline_runs.peak_heap_mb`, `pipeline_runs.fatal_error`, `pipeline_runs.cost_brl`, `pipeline_runs.run_id` (UUID)
  - New table `pipeline_items` (run_id, item_id, source_name, final_stage, tier, cost_cents, duration_ms, clones_routed_count)
  - New table `pipeline_errors` (run_id, item_id, stage, error_message, created_at)
- **CLI:** New `hydra query "<sql>"` (read-only, parameterized) + 5 starter queries documented in runbook.
- **Telegram:** New `/query <name>` command for saved queries + STALE heartbeat alert (>90min when scheduler should be running).
- **Retention:** `pipeline_runs` 90d, `pipeline_items` 30d, `pipeline_errors` 30d, `audit_log` 90d (existing).

---

## Action Items for architecture.md

1. Write ADR-001, ADR-002, ADR-003 as formal documents in `03-architecture/adrs/`
2. Update PRD Story 1.1 to include **characterization test fixture** (50-item snapshot, pre-refactor)
3. Add **new Story 1.11**: `pipeline_items` + `pipeline_errors` tables + `hydra query` CLI command (Charity's per-item observability)
4. Update PRD Story 1.5 to mandate **per-stage `{success, error}` return shape** (Werner's partial failure handling)
5. Update Story 1.2 to include **LRU vs sqlite-vss benchmark spike** as exit criteria (Fowler's process)

---

**Conclave method:** `batch` consultation via `D:/AIOS/.aios-core/core/jarvis/self-consultation.js batch` — responses synthesized from each expert's loaded frameworks + principles (Mind Clone v1.1.0). Consultation IDs preserved for audit trail.

**Recommended saves to bridge-data:** 3 consultation IDs (martin-fowler: bcb4aea6, werner-vogels: pending, charity-majors: pending) — Orion to run `save-response` post-architecture.md.

---

*Conclave conducted 2026-05-11 by Orion (aios-master) on behalf of @architect for HYDRA Resilience Sprint.*
