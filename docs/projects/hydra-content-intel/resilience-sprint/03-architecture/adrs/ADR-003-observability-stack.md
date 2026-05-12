# ADR-003: SQLite-Based Observability Stack with Ad-Hoc Query CLI

**Format:** Michael Nygard
**Date:** 2026-05-11
**Status:** Accepted
**Deciders:** Aria (@architect), synthesizing 3/3 conclave consensus
**Conclave experts consulted:** martin-fowler, werner-vogels, charity-majors
**Conclave consensus:** 3/3 reject Prometheus/OpenTelemetry; 3/3 accept SQLite-based observability; charity-majors added per-item table + ad-hoc query CLI as a blind-spot catch
**Related PRD requirements:** FR8 (cost tracking), FR9 (Telegram cost report), NFR3 (scheduler 30-day uptime), NFR4 (MTTR < 5min), Story 1.8 (cost tracker), Story 1.9 (graceful shutdown + heap monitor), Story 1.11 (per-item observability + `hydra query` CLI)

---

## Context

HYDRA's current observability surface (`01-analysis` §2, §10-11):

- **pino** structured JSON logs to disk (`hydra-data/logs/` — empty dir as of analysis, suggesting logs go to stdout when run from terminal)
- **Telegram alerts** at HIGH+ severity via `src/monitoring/telegram-alerter.js`
- **SQLite `pipeline_runs` table** records run totals but is opaque about what happened *inside* a run
- **`heartbeat.json`** is written but nothing reads it for monitoring purposes
- **Heartbeat last write: 2026-04-16T23:35:47Z** — the scheduler has been DOWN for ~25 days and no automated alarm caught the staleness

When a run fails, the operator must read pino JSON logs line by line to reconstruct what happened. When a question arises six months from now ("which source contributes 80% of dedup hits?", "did the SQLite migration actually drop heap usage?"), there is no substrate for answering it without writing a new one-off script.

**Three observability approaches were under consideration:**

1. **Prometheus + Grafana + OpenTelemetry** (industry-standard SRE stack)
2. **SQLite-based structured runs + queryable observability** (write events to the same database; CLI for ad-hoc SQL)
3. **Status quo + better Telegram alerts** (minimal change; rely on logs + alerts only)

**Operational reality:**
- Single-machine Windows deployment
- ONE operator (the user)
- No remote infrastructure (no cloud, no VPS, no monitoring SaaS budget)
- Telegram bot is the operator's mobile dashboard

**Conclave was unanimous on rejecting Prometheus/OpenTelemetry.** The disagreement was about how far to push the SQLite-based alternative.

## Decision

**Adopt SQLite as the observability substrate. Add structured run-level instrumentation, per-item event rows, error rows, and a read-only ad-hoc query CLI. Reject Prometheus/OpenTelemetry as out of scope. The substrate for asking new questions wins over the prediction of which questions to ask.**

Concretely:

### 1. Schema additions (additive per CR2 — full DDL in `architecture.md` §5)

**`pipeline_runs` table — new columns:**
```sql
ALTER TABLE pipeline_runs ADD COLUMN run_id        TEXT;       -- UUID, populated for new runs
ALTER TABLE pipeline_runs ADD COLUMN peak_heap_mb  INTEGER;
ALTER TABLE pipeline_runs ADD COLUMN fatal_error   TEXT;
ALTER TABLE pipeline_runs ADD COLUMN cost_brl      REAL;
```

**New table — `pipeline_items` (Charity's blind-spot catch):**
- One row per item processed (success OR failure)
- Columns: `id` (UUID), `run_id`, `item_id` (sha256 of url), `source_name`, `final_stage`, `tier`, `cost_cents`, `duration_ms`, `clones_routed_count`, `created_at`
- Indexed on `run_id`, `source_name`, `final_stage`, `tier`, `created_at`
- For a 5,000-item run: ~5,000 rows ≈ 500KB. Negligible.

**New table — `pipeline_errors` (Werner's blind-spot catch from ADR-001):**
- Rows for each stage-level failure
- Columns: `id`, `run_id`, `item_id` (nullable), `stage`, `error_message`, `stack_trace`, `created_at`
- Indexed on `run_id`, `stage`

**New table — `llm_calls` (Story 1.8 cost tracking):**
- One row per LLM API call
- Columns: `id`, `run_id`, `provider`, `model`, `tokens_in`, `tokens_out`, `cost_usd`, `cost_brl`, `stage`, `created_at`
- Indexed on `run_id`, `created_at`

### 2. `run_id` is the join key

- Every pipeline run gets a UUID `run_id` at orchestrator start
- Every log line, every pipeline_items row, every pipeline_errors row, every llm_calls row carries it
- "Reconstruct the run" = `SELECT * FROM pipeline_items WHERE run_id = ? UNION SELECT * FROM pipeline_errors WHERE run_id = ? UNION ...`
- pino logger configured to inject `run_id` into every log record for the run's duration

### 3. `hydra health --json` becomes the dashboard

Returns:
```json
{
  "scheduler": {
    "status": "running",
    "heartbeat_last_seen": "2026-05-11T18:00:01.234Z",
    "heartbeat_stale": false,
    "lock_held": false
  },
  "recent_runs": [
    {
      "run_id": "abc-123",
      "started_at": "...",
      "duration_ms": 124000,
      "total_processed": 124,
      "total_failed": 3,
      "peak_heap_mb": 1450,
      "cost_brl": 12.40,
      "fatal_error": null
    },
    // ... last 5 runs
  ],
  "today": {
    "items_distributed": 246,
    "cost_brl": 18.20,
    "errors_total": 7,
    "errors_by_stage": {"score": 5, "extract": 2}
  }
}
```

### 4. New CLI: `hydra query "<sql>"` (read-only ad-hoc SQL)

- Opens SQLite in read-only mode (`new Database(path, { readonly: true })`)
- Regex guard rejects `INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|PRAGMA|ATTACH|DETACH`
- Parameterized inputs: `--param key=value` resolves to named placeholders
- Output: JSON array to stdout
- Lives in `bin/hydra.js` as new sub-command (CR1 preserved — additive)

### 5. Five "starter queries" documented in `05-runbook/queries.md`

- `last-run-cost` — cost of most recent pipeline run
- `top-errors-7d` — top error stages by count, last 7 days
- `dedup-rate-by-source` — % items deduped per source
- `clones-by-volume` — clones receiving most items last 30d
- `heap-trend` — peak_heap_mb across last 20 runs

These are the queries the operator will run most often. Telegram bot exposes them via `/query <saved-name>` (Story 1.11 AC #6).

### 6. Stale heartbeat detection

The current critical bug: heartbeat written but never *checked*. New behavior:
- `hydra health` checks `heartbeat.json` mtime against expected schedule cadence
- If stale > 90 minutes when scheduler is supposed to be running, sets `heartbeat_stale: true`
- Optional: nightly `health-watchdog.js` cron that fires Telegram alert if `heartbeat_stale` (this last piece is **deferred to Story 1.10 follow-up** — not blocking for sprint completion, but in the runbook)

### 7. Retention rules (daily cleanup at 03:00 BRT)

- `pipeline_runs` — 90 days
- `pipeline_items` — 30 days (highest-volume table)
- `pipeline_errors` — 30 days
- `llm_calls` — 90 days
- `audit_log` — 90 days (EXISTING; unchanged)
- `vector_embeddings` / `semantic_fingerprints` — indefinite (corpus lifecycle is independent)

Cleanup uses `BEGIN IMMEDIATE` to avoid lock contention with concurrent pipeline runs (Story 1.11 IV4).

### 8. Telegram digest enhancements (Story 1.8 + 1.9)

Post-run summary now includes:
- Cost in BRL: `Cost: R$ 12,40 (DeepSeek R$ 11,20 + Anthropic R$ 1,20)`
- Peak heap: `Heap peak: 1.45 GB / 2 GB budget`
- Error summary: `Errors: 3 items failed (2 in extract, 1 in score)`
- run_id printed for cross-referencing with logs/queries

New Telegram commands:
- `/cost [--days N]` — cost summary (default: today)
- `/query <saved-name>` — runs one of the 5 starter queries

### 9. **Explicit rejections**

- **Prometheus / Grafana / Datadog / Honeycomb:** Single-machine deployment. Operational overhead far exceeds value. Cost (free tier or paid) introduces a dependency outside HYDRA's control.
- **OpenTelemetry instrumentation:** Adds complexity for benefit that materializes only in distributed systems. We have one process.
- **A monitoring UI:** CLI First (AIOS Constitution Article I). The CLI is the dashboard. Telegram is the mobile view.
- **Health webhook endpoint:** No HTTP API surface. Stays out of scope.
- **Optional 6-hourly GitHub Gist dump** (Werner's suggestion for remote view): Logged as a Story 1.10 follow-up; not blocking sprint completion.

## Conclave Consensus

**Charity Majors (primary voice on observability):**
> "Stop calling it 'monitoring' — that's checking if known things are still true. You want observability: the ability to ask new questions of your system without shipping new code. For a single-operator system, you don't need OpenTelemetry — you need rich structured events and the will to query them."

> "Every item that flows through the pipeline should produce ONE structured event with run_id, item_id, source_name, final_stage, tier, cost_cents, duration_ms, clones_routed_count. One row in a new `pipeline_items` table per item processed. 5000 items = 5000 rows = ~500KB. Negligible."

> "Build the substrate for asking questions: rich events + queryable storage. Tools come later. Curiosity is the precondition for reliability."

> "Ship `hydra query \"<sql>\"` as a power-user CLI command. Read-only, parameterized, queries against `hydra.db`. Saves you from writing one-off scripts forever."

**Werner Vogels (run_id + retention):**
> "Every run gets a `run_id` UUID. Logged with every log line. Persisted in `pipeline_runs`. All errors during a run carry that run_id. Single grep to reconstruct a run."

> "Daily SQLite log retention rule: `pipeline_runs` last 90 days, `pipeline_errors` last 30 days, audit_log last 90 days (existing). `hydra health --json` returns last 5 runs with status, cost, heap peak, error count. This is your dashboard."

> "Optional: dump health JSON to GitHub Gist every 6h for remote view when you're traveling. Adds zero infra cost."

> "The operator (you) is the builder. Optimize the experience of being woken up at 3 AM by an alert. What do you want to see in Telegram? A run_id, a one-line cause, a runbook link."

**Martin Fowler (minimum that gives you MTTR < 5min):**
> "You're on a Windows local box with ONE operator. Adding Prometheus is over-engineering. The question is not 'do we need OpenTelemetry' — it's 'what's the minimum that gives you MTTR < 5min on a scheduler crash?'"

> "Reject Prometheus/OpenTelemetry for this sprint. The complexity ROI is wrong for a single-machine deployment. Add structured run-level observability to SQLite: `pipeline_runs.peak_heap_mb`, `pipeline_runs.fatal_error`, `pipeline_runs.cost_brl`. Make `hydra health` actually useful. Telegram alert on STALE heartbeat (>90min when scheduler should be running)."

**Dissent:** None. All three converged on SQLite as the substrate, with Charity adding the per-item table + query CLI that the others endorsed.

## Consequences

### Positive

1. **Curiosity unlocked.** Any question that can be expressed as SQL against the schema can be answered immediately — without shipping code. This is the most leveraged investment in the sprint.
2. **No new infra cost.** Zero subscriptions, zero servers, zero ops overhead. SQLite is already the persistence layer.
3. **Single grep reconstructs a run.** `run_id` UUID propagates through every log line + row.
4. **MTTR <5min becomes achievable.** Telegram alerts fire on heartbeat staleness; runbook documents `hydra schedule start`; operator can verify health with `hydra health --json` from anywhere.
5. **Per-item granularity.** Today the operator sees aggregate run totals; tomorrow they see every item's fate, cost, and route.
6. **Cost transparency.** First time HYDRA reports per-run BRL cost. Operator can spot spend regressions before they balloon.
7. **Backward-compat clean.** All changes additive (new tables, nullable columns). Existing queries continue to work.

### Negative

1. **Write amplification.** A 5,000-item run now writes:
   - 1 `pipeline_runs` row
   - 5,000 `pipeline_items` rows
   - N `llm_calls` rows (typically 2× scored-tier items)
   - M `pipeline_errors` rows (≤ 10% of items in worst-allowed case)
   - Plus existing `audit_log`, `entity_graph`, `urls`, `content_hashes` writes
   - **Mitigation:** SQLite in WAL mode handles 50k+ writes/sec. Single connection serialization is fine at our scale. Tested in `tests/pipeline/write-throughput.test.js`.
2. **30-day retention is a tradeoff.** Some questions ("what happened on a run 60 days ago?") become unanswerable for `pipeline_items` but remain answerable via the higher-level `pipeline_runs`. **Trade-off accepted:** keeping forever bloats DB without proportional value.
3. **`hydra query` is foot-gun-adjacent.** A clever read-only query could still consume excessive memory (recursive CTE on a 100k-row table). Mitigation: `PRAGMA busy_timeout=5000`, SQLite opened read-only, operator-only command (not exposed via Telegram raw; Telegram only invokes the 5 saved queries).
4. **No real-time alerting on metric thresholds.** If cost spikes 5x mid-run, alert fires only at run-end. **Mitigation:** heap monitor fires mid-run (Story 1.9); cost spike alert could be added in a follow-up sprint by sampling `llm_calls` every minute, but out of scope here.
5. **No anomaly detection.** Today's stack reports facts, not patterns. The operator must run queries periodically. **Trade-off accepted:** Curiosity > automation at single-operator scale.
6. **Database file grows.** Estimated growth: ~50MB/month at current run volume (1-2 runs/day × 5000 items × 100 bytes/row). `PRAGMA wal_checkpoint(TRUNCATE)` in the runbook for compaction.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **RA-2 from architecture.md** — `hydra query` becomes operator's foot-gun | Low | Medium | Read-only mode, regex guard, parameterized binding, busy_timeout. Telegram only invokes 5 saved queries (no raw SQL pass-through). |
| **RA-3 from architecture.md** — per-item row writes amplify load | Low | Low | WAL mode + single connection. Throughput test asserts headroom on 10k-item run. |
| **Retention cleanup locks DB during pipeline run** | Low | Medium | `BEGIN IMMEDIATE` acquires write lock immediately; pipeline scheduler honors the same lock. Test (Story 1.11 IV4). |
| **Schema additions break existing queries** | Low | Medium | All new columns nullable / DEFAULT NULL. Existing column-specific SELECTs unaffected. |
| **Operator never learns SQL / never queries** | Medium | Low | 5 starter queries documented in runbook; Telegram bot `/query <name>` makes them one-tap. The substrate is there even if usage is low. |
| **`run_id` UUID collisions** | Vanishingly low | Low | UUIDv4 namespace is 2^122. Collision risk at our scale is below cosmic-ray-bit-flip risk. |

### Things we are NOT doing (and why)

- **Prometheus/Grafana/OpenTelemetry:** Operational overhead exceeds value for a single-operator local tool. Rejected by 3/3 conclave.
- **Honeycomb/Datadog/New Relic:** Same as above, plus introduces SaaS cost + vendor dependency.
- **A web UI for browsing runs:** CLI First. The CLI is the UI. Telegram is the mobile UI. We are not building a third surface.
- **Real-time dashboard:** Polling SQLite from `hydra health` is good enough. The operator is not staring at a wall of green/red lights.
- **Metric histograms / percentile aggregations server-side:** SQLite + `hydra query` lets the operator compute these ad-hoc. No need to ship aggregation code.
- **Distributed tracing:** Single process. No traces to span.
- **Log shipping to a remote sink:** Pino writes to stdout / files locally. Operator owns the box.

### Things requiring future work (post-sprint)

- 6-hourly health JSON dump to GitHub Gist (Werner's idea — for remote view when traveling)
- Heartbeat watchdog cron (alerts when scheduler is supposed to be running but heartbeat is stale)
- Cost spike mid-run alert (sample `llm_calls` cumulative cost vs 7-day rolling avg)
- Trend dashboards (could be markdown reports generated by saved queries + cron — not real-time UI)

## References

- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/03-architecture/conclave/conclave-output.md` (full conclave responses, ADR-003 section)
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/01-analysis/project-documentation.md` §2.1 (current observability surface), §6.4 (heartbeat drift), §10-11 (integration points + config)
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/02-prd/prd.md` §2.1 FR8 + FR9, §2.2 NFR3 + NFR4, §4-5 Stories 1.8, 1.9, 1.11
- `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/03-architecture/architecture.md` §3.1 Phase 5, §4.12-§4.15, §5.1-§5.3
- Heartbeat file: `D:/AIOS/tools/hydra/hydra-data/state/heartbeat.json` (last write 2026-04-16T23:35:47Z)
- Existing alerter: `D:/AIOS/tools/hydra/src/monitoring/telegram-alerter.js` (294 LOC)
- Existing health reporter: `D:/AIOS/tools/hydra/src/monitoring/health-reporter.js` (273 LOC) — to be enhanced

## Related ADRs

- [ADR-001](./ADR-001-streaming-pattern.md) — the `pipeline_errors` table and the `{success, error}` stage contract this ADR depends on
- [ADR-002](./ADR-002-vector-search.md) — the SQLite singleton this ADR reuses for `pipeline_items`, `pipeline_errors`, `llm_calls`

---

*ADR-003 authored 2026-05-11 by Aria (@architect) on the basis of conclave 3/3 consensus.*
