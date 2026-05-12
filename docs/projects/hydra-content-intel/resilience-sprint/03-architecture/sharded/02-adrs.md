# Architecture §10 — ADR Index

**Source:** `../architecture.md` lines 975-985
**Sharded by:** @po, 2026-05-12

---

Four formal Architecture Decision Records, each in `../adrs/`:

| ADR | Decision | Status | Conclave consensus |
|---|---|---|---|
| **[ADR-001](../adrs/ADR-001-streaming-pattern.md)** | Pure async iteration (`for await`) for pipeline streaming; reject Worker threads + queue-based backpressure | Accepted | 3/3 (fowler + vogels + majors) |
| **[ADR-002](../adrs/ADR-002-vector-search.md)** | In-memory LRU cosine cache for vector search; SQLite is source of truth; sqlite-vss rejected for sprint | Accepted (with benchmark spike exit criterion) | 2/3 + 1 process-only (fowler) |
| **[ADR-003](../adrs/ADR-003-observability-stack.md)** | SQLite-based observability (`pipeline_items` + `pipeline_errors` + `hydra query` CLI); reject Prometheus/OpenTelemetry | Accepted | 3/3 |
| **[ADR-004](../adrs/ADR-004-consumption-side.md)** | Consumption-side architecture: `feed-reader.js` co-located with distribution; 30k tokens per expert; S/A tier default; pre-fix entries quarantined; new `feedEntries` field, legacy `relevantMemory` preserved | Accepted | None (post-conclave gap; user-approved parameters 2026-05-12) |

## Story → ADR Cross-Reference

| Story | Primary ADR | Secondary ADRs |
|-------|-------------|----------------|
| 1.1a (preflight) | n/a | ADR-001 (gate before migration) |
| 1.1b (status.js) | n/a | n/a |
| 1.1c (characterization) | ADR-001 | n/a |
| 1.2 (vector-store SQLite) | ADR-002 | n/a |
| 1.3 (semantic-dedup SQLite) | ADR-002 (cache pattern) | n/a |
| 1.4 (pipeline split) | ADR-001 | n/a |
| 1.5 (streaming) | ADR-001 | ADR-003 (`pipeline_errors`) |
| 1.6 (DistributionService) | n/a (mechanical refactor) | n/a |
| 1.7 (`--from-jsonl`) | n/a | n/a |
| 1.8 (cost tracker) | n/a | ADR-003 (`llm_calls` part of observability stack) |
| 1.9 (graceful shutdown + heap monitor) | n/a | ADR-001 (closure order R7) |
| 1.10 (docs/runbook) | n/a | All 4 ADRs referenced |
| 1.11 (`pipeline_items` + `hydra query`) | ADR-003 | n/a |
| 1.12 (feed-reader) | ADR-004 | n/a |

## Audits Referenced

- `../audits/C-10-relevantMemory-audit.md` — full audit of `relevantMemory` consumers (used by Story 1.12 for field rename safety analysis)
