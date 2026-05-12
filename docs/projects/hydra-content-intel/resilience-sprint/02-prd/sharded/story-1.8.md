# Story 1.8: Cost tracker + Telegram cost report

**Status:** Draft
**Story ID:** 1.8
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~500 LOC (cost-tracker module + `llm_calls` table + `hydra cost` CLI + Telegram `/cost` + digest line + tests)
**Dependencies:** Story 1.5 (orchestrator + `stages/score.js` + `stages/extract.js` are the call sites — parallel-safe with 1.6/1.7/1.9 within Phase 5)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.8 (lines 715-735)**

---

## User Story

**As a** HYDRA operator,
**I want** per-LLM-call cost tracking and a `/cost` Telegram command,
**so that** I can monitor spend per provider and run.

## Acceptance Criteria

1. New module `src/monitoring/cost-tracker.js`:
   - `track(provider, model, tokens_in, tokens_out, run_id)` — logs to SQLite
   - `summarize({ days, runId, provider })` — returns aggregated cost in BRL
2. New SQLite table `llm_calls` with: `id`, `run_id`, `provider`, `model`, `tokens_in`, `tokens_out`, `cost_usd`, `cost_brl`, `created_at`
3. `stages/score.js` and `stages/extract.js` call `costTracker.track()` after every LLM response
4. New CLI command `hydra cost [--days N] [--run-id X] [--provider P]` prints cost summary
5. Telegram bot gains `/cost [--days N]` command (default: today)
6. Post-run Telegram digest (`telegram-bot.js:postRunSummary`) includes total cost line: `Cost: R$ 12,40 (DeepSeek R$11,20 + Anthropic R$1,20)`
7. `HYDRA_COST_BRL_RATE` env var configurable (default 5.20)

## Integration Verification

- **IV1:** Cost tracking adds < 5ms overhead per LLM call (R5)
- **IV2:** Existing Telegram messages unchanged in format except for the new cost line
- **IV3:** Cost-tracker disabled gracefully if SQLite write fails (logs warning, doesn't crash pipeline)

## Architecture References

- Architecture §3.1 Phase 5 (Observability + Cost Tracking) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §4.12 `cost-tracker.js` spec + pricing constants — `03-architecture/sharded/03-modules.md`
- Architecture §4.14 New CLI sub-commands (`hydra cost`)
- Architecture §5.1 `llm_calls` DDL — `03-architecture/sharded/04-data-model.md`
- Architecture §6.2 `HYDRA_COST_BRL_RATE` env var — `03-architecture/sharded/05-configuration.md`
- Architecture §7.1 R5 mitigation (overhead test)
- Architecture §8.1 `tests/monitoring/cost-tracker.test.js`

## Dev Notes

- **Pricing constants (Architecture §4.12)** — hardcoded for sprint; could move to YAML later:
  ```js
  const PRICING_USD_PER_1M_TOKENS = {
    'deepseek-chat':       { input: 0.27, output: 1.10 },
    'claude-3-5-sonnet':   { input: 3.00, output: 15.00 },
    'gpt-4o':              { input: 2.50, output: 10.00 },
    // ...
  };
  ```
- **`llm_calls` DDL (Architecture §5.1):**
  ```sql
  CREATE TABLE IF NOT EXISTS llm_calls (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id        TEXT    NOT NULL,
    provider      TEXT    NOT NULL,
    model         TEXT    NOT NULL,
    tokens_in     INTEGER NOT NULL,
    tokens_out    INTEGER NOT NULL,
    cost_usd      REAL    NOT NULL,
    cost_brl      REAL    NOT NULL,
    stage         TEXT,
    created_at    INTEGER NOT NULL DEFAULT (unixepoch())
  );
  ```
- **Fire-and-forget pattern (R5 mitigation):** SQLite write happens after LLM response returns. `track()` MUST NOT throw — only logs warning on failure (IV3).
- **Stage column added to schema** (Architecture §5.1): `stage` is in `llm_calls` but not in PRD AC #2. Architecture is authoritative — include it.
- **Retention (Architecture §5.3):** `llm_calls` retained 90 days. Cleanup ships with Story 1.11's daily cleanup job.
- **Telegram digest integration (AC #6):** modify `telegram-bot.js:postRunSummary` to append cost line. **Preserve existing format** — CR4 (no breaking changes to Telegram contract).
- **Parallel-safe with Story 1.6, 1.7, 1.9, 1.11** within Phase 5 (Architecture §3.1 Phase 5).
- **Cross-cutting integration with Story 1.12:** `mindCloneEnrichment.feedEntries` cost tracking (Story 1.12 AC #11) hooks into this cost-tracker. If 1.12 ships before 1.8 (it did — shipped 2026-05-12), the integration is wired retroactively.
