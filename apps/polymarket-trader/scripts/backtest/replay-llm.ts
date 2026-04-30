/**
 * BACKTEST-3 Phase 2 Tier 2 — LLM Replay Harness (Anthropic Claude).
 *
 * Iterates a stratified sample of resolved markets in `historical-markets.db`,
 * asks Claude (default: claude-haiku-4-5) for a forecast, and writes results
 * into `replay_llm_predictions`.
 *
 * Mirrors `replay-heuristic.ts` structure but adds:
 *   - Stratified sampling (min(N_per_vertical, vertical_pop))
 *   - Anthropic SDK calls with structured forecast prompt
 *   - Defensive JSON parsing (parseLlmForecast)
 *   - Concurrency cap (5 in-flight, ~2 RPS)
 *   - Daily budget cap via AnthropicBudgetTracker
 *   - Idempotent --resume mode (skip market_ids already inserted)
 *   - --smoke mode (single call, prints response, exits 0)
 *
 * Usage:
 *   node --import tsx scripts/backtest/replay-llm.ts --smoke
 *   node --import tsx scripts/backtest/replay-llm.ts                     # 150/vertical
 *   node --import tsx scripts/backtest/replay-llm.ts --n-per-vertical 50 # custom
 *   node --import tsx scripts/backtest/replay-llm.ts --resume            # resume after crash
 *   node --import tsx scripts/backtest/replay-llm.ts --verticals weather,politics
 *
 * Story: BACKTEST-3-tier2-llm
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { parseLlmForecast } from './llm-output-parser.ts';
import { AnthropicBudgetTracker } from './anthropic-budget-tracker.ts';

// ---------------------------------------------------------------------------
// Paths + constants
// ---------------------------------------------------------------------------

const SCRIPT_DIR = import.meta.dirname;
const APP_ROOT = join(SCRIPT_DIR, '..', '..');
const DB_PATH = join(APP_ROOT, 'data', 'backtest', 'historical-markets.db');
const ENV_PATH = join(APP_ROOT, '.env');
const BUDGET_STATE_PATH = join(APP_ROOT, 'data', 'llm-budget.json');

const DEFAULT_N_PER_VERTICAL = 150;
const VERTICALS = ['politics', 'sports', 'finance', 'weather', 'crypto'] as const;
type Vertical = (typeof VERTICALS)[number];

// Haiku 4.5 official pricing per 1M tokens (BACKTEST-3 brief)
const COST_PER_INPUT_USD_PER_MTOK = 1.0;
const COST_PER_OUTPUT_USD_PER_MTOK = 5.0;

// Concurrency: org tier limit is 50 RPM. 1 worker × 1500ms = 40 RPM (safe margin).
// (BACKTEST-3 v1 used 5×500ms = 600 RPM theoretical, hit 429 in production.)
const CONCURRENCY = 1;
const MIN_INTERVAL_MS = 1500;

// ---------------------------------------------------------------------------
// Schema for replay_llm_predictions
// ---------------------------------------------------------------------------

const REPLAY_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS replay_llm_predictions (
  market_id        TEXT PRIMARY KEY,
  vertical         TEXT NOT NULL CHECK (vertical IN ('politics', 'sports', 'finance', 'weather', 'crypto')),
  model            TEXT NOT NULL,
  forecast         REAL NOT NULL CHECK (forecast BETWEEN 0 AND 1),
  baseline         REAL NOT NULL CHECK (baseline BETWEEN 0 AND 1),
  outcome          INTEGER NOT NULL CHECK (outcome IN (0, 1)),
  reasoning        TEXT,
  parsed_ok        INTEGER NOT NULL CHECK (parsed_ok IN (0, 1)),
  input_tokens     INTEGER NOT NULL,
  output_tokens    INTEGER NOT NULL,
  cost_usd         REAL NOT NULL,
  entry_ts         INTEGER NOT NULL,
  end_ts           INTEGER NOT NULL,
  run_id           INTEGER NOT NULL,
  FOREIGN KEY(market_id) REFERENCES historical_markets(market_id)
);

CREATE INDEX IF NOT EXISTS idx_rlp_vertical ON replay_llm_predictions (vertical);
CREATE INDEX IF NOT EXISTS idx_rlp_parsed_ok ON replay_llm_predictions (parsed_ok);
`;

// ---------------------------------------------------------------------------
// .env loader (matches src/index.ts pattern — no dotenv dep needed)
// ---------------------------------------------------------------------------

function loadEnv(): void {
  try {
    if (!existsSync(ENV_PATH)) return;
    const content = readFileSync(ENV_PATH, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // No .env or unreadable — system env is the fallback
  }
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface Args {
  smoke: boolean;
  resume: boolean;
  nPerVertical: number;
  verticals: Vertical[];
  seed: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    smoke: false,
    resume: false,
    nPerVertical: DEFAULT_N_PER_VERTICAL,
    verticals: [...VERTICALS],
    seed: 42,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--smoke') args.smoke = true;
    else if (a === '--resume') args.resume = true;
    else if (a === '--n-per-vertical') {
      const next = argv[i + 1];
      if (next) {
        args.nPerVertical = Math.max(1, parseInt(next, 10) || DEFAULT_N_PER_VERTICAL);
        i++;
      }
    } else if (a === '--verticals') {
      const next = argv[i + 1];
      if (next) {
        args.verticals = next.split(',').filter((v): v is Vertical =>
          (VERTICALS as readonly string[]).includes(v),
        );
        i++;
      }
    } else if (a === '--seed') {
      const next = argv[i + 1];
      if (next) {
        args.seed = parseInt(next, 10) || 42;
        i++;
      }
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Deterministic LCG sampler (matches compute-brier.ts seed style)
// ---------------------------------------------------------------------------

function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Fisher-Yates shuffle in place using injected RNG. */
function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------

interface MarketRow {
  market_id: string;
  vertical: Vertical;
  question: string;
  mid_price_t12h: number;
  volume_entry_usd: number | null;
  liquidity_entry_usd: number | null;
  entry_ts: number;
  end_ts: number;
  resolved_outcome: number;
}

function pickStratifiedSample(
  db: DatabaseSync,
  verticals: Vertical[],
  nPerVertical: number,
  seed: number,
  excludeMarketIds: Set<string>,
): MarketRow[] {
  const out: MarketRow[] = [];
  for (const v of verticals) {
    const rows = db
      .prepare(`
        SELECT
          market_id, vertical, question,
          mid_price_t12h, volume_entry_usd, liquidity_entry_usd,
          entry_ts, end_ts, resolved_outcome
        FROM historical_markets
        WHERE resolution_status = 'resolved'
          AND mid_price_t12h IS NOT NULL
          AND resolved_outcome IS NOT NULL
          AND vertical = ?
      `)
      .all(v) as MarketRow[];

    const filtered = rows.filter((r) => !excludeMarketIds.has(r.market_id));
    // Deterministic per-vertical seed (offset by vertical index)
    const idx = VERTICALS.indexOf(v);
    const rng = lcg(seed + idx * 1000);
    shuffleInPlace(filtered, rng);
    out.push(...filtered.slice(0, nPerVertical));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

function buildPrompt(market: MarketRow): string {
  const yes = (market.mid_price_t12h * 100).toFixed(1);
  const no = ((1 - market.mid_price_t12h) * 100).toFixed(1);
  const durationH = ((market.end_ts - market.entry_ts) / 3600).toFixed(1);
  const vol = market.volume_entry_usd != null ? `$${market.volume_entry_usd.toFixed(0)}` : 'unknown';
  const liq = market.liquidity_entry_usd != null ? `$${market.liquidity_entry_usd.toFixed(0)}` : 'unknown';

  return `You are a calibrated probabilistic forecaster for prediction markets. Your job is to estimate P(outcome=YES) for the market below.

MARKET (${market.vertical}): ${market.question}
Market consensus 12h before resolution: YES=${yes}%, NO=${no}%
Volume: ${vol}  |  Liquidity: ${liq}
Duration: ${durationH}h

INSTRUCTIONS:
- Output ONLY a JSON object — no prose, no markdown, no explanation outside JSON.
- Estimate the FAIR probability that this resolves YES (=1).
- The market mid (${yes}%) is the consensus. You only have edge if you see info/structure the consensus missed.
- For weather/crypto markets, climatology / on-chain stats often have edge over speculative consensus.
- For sports/politics, lean toward consensus unless you have a specific reason.
- "reasoning" must be 1-2 short sentences (max 200 chars).

Respond with EXACTLY this shape:
{"forecast_yes": 0.XX, "reasoning": "brief reasoning"}`;
}

// ---------------------------------------------------------------------------
// Anthropic call + cost
// ---------------------------------------------------------------------------

interface CallResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

async function callClaude(client: Anthropic, model: string, prompt: string): Promise<CallResult> {
  const response = await client.messages.create({
    model,
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });
  const inputTokens = response.usage?.input_tokens ?? 0;
  const outputTokens = response.usage?.output_tokens ?? 0;
  const costUsd =
    (inputTokens * COST_PER_INPUT_USD_PER_MTOK) / 1_000_000 +
    (outputTokens * COST_PER_OUTPUT_USD_PER_MTOK) / 1_000_000;
  const firstBlock = response.content?.[0];
  const text = firstBlock && firstBlock.type === 'text' ? firstBlock.text : '';
  return { text, inputTokens, outputTokens, costUsd };
}

// ---------------------------------------------------------------------------
// Run metadata
// ---------------------------------------------------------------------------

interface RunHandle {
  runId: number;
  finalize: (status: 'completed' | 'failed', notes?: string) => void;
}

function startRun(db: DatabaseSync, scriptName: string): RunHandle {
  const startedAt = Math.floor(Date.now() / 1000);
  const result = db
    .prepare(`INSERT INTO ingest_runs (script, started_at, status) VALUES (?, ?, 'running')`)
    .run(scriptName, startedAt);
  const runId = Number(result.lastInsertRowid);
  return {
    runId,
    finalize(status, notes) {
      const finishedAt = Math.floor(Date.now() / 1000);
      db.prepare(
        `UPDATE ingest_runs SET finished_at = ?, status = ?, notes = ? WHERE run_id = ?`,
      ).run(finishedAt, status, notes ?? null, runId);
    },
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  loadEnv();

  if (!existsSync(DB_PATH)) {
    console.error(`[replay-llm] FATAL: DB not found at ${DB_PATH}`);
    console.error('  Run Phase 1 ingest first.');
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[replay-llm] FATAL: ANTHROPIC_API_KEY not set in .env or environment.');
    process.exit(1);
  }
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
  const budgetUsd = Number(process.env.ANTHROPIC_DAILY_BUDGET_USD || '5');

  const args = parseArgs(process.argv.slice(2));
  const client = new Anthropic({ apiKey });
  const budget = new AnthropicBudgetTracker({
    thresholdUsd: budgetUsd,
    statePath: BUDGET_STATE_PATH,
  });
  await budget.load();

  console.log(`[replay-llm] model=${model}  budget=$${budgetUsd}  spent_today=$${budget.getDailySpend().toFixed(4)}`);
  console.log(`[replay-llm] mode=${args.smoke ? 'SMOKE' : args.resume ? 'RESUME' : 'FULL'}`);

  // ---- SMOKE MODE: single call, print, exit ----
  if (args.smoke) {
    await runSmokeTest(client, model);
    return;
  }

  if (budget.isOverBudget()) {
    console.error(`[replay-llm] FATAL: budget already exceeded ($${budget.getDailySpend().toFixed(4)} >= $${budgetUsd}).`);
    console.error('  Either wait until tomorrow (auto-reset) or raise ANTHROPIC_DAILY_BUDGET_USD.');
    process.exit(1);
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous  = NORMAL;');

  // Create table if missing (do NOT drop on resume)
  db.exec(REPLAY_TABLE_DDL);

  // Build set of already-inserted market_ids (for --resume)
  const excludeIds = new Set<string>();
  if (args.resume) {
    const existing = db
      .prepare(`SELECT market_id FROM replay_llm_predictions`)
      .all() as Array<{ market_id: string }>;
    for (const row of existing) excludeIds.add(row.market_id);
    console.log(`[replay-llm] RESUME: ${excludeIds.size} markets already in replay_llm_predictions, skipping.`);
  } else {
    // Fresh run — drop+recreate per brief
    db.exec('DROP TABLE IF EXISTS replay_llm_predictions;');
    db.exec(REPLAY_TABLE_DDL);
    console.log(`[replay-llm] Fresh run: dropped + recreated replay_llm_predictions table.`);
  }

  const sample = pickStratifiedSample(db, args.verticals, args.nPerVertical, args.seed, excludeIds);
  console.log(`[replay-llm] Sample: ${sample.length} markets (target ${args.nPerVertical}/vertical × ${args.verticals.length} verticals)`);
  if (sample.length === 0) {
    console.log('[replay-llm] Nothing to do (all sampled markets already in DB).');
    db.close();
    return;
  }

  const run = startRun(db, args.resume ? 'replay-llm-resume' : 'replay-llm');
  console.log(`[replay-llm] run_id=${run.runId} started`);

  const insert = db.prepare(`
    INSERT INTO replay_llm_predictions (
      market_id, vertical, model, forecast, baseline, outcome, reasoning,
      parsed_ok, input_tokens, output_tokens, cost_usd, entry_ts, end_ts, run_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Stats
  const stats = {
    total: sample.length,
    completed: 0,
    parsedOk: 0,
    parsedFailed: 0,
    errors: 0,
    totalCostUsd: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    perVertical: Object.fromEntries(args.verticals.map((v) => [v, 0])) as Record<string, number>,
  };

  // Process with concurrency cap
  const t0 = Date.now();
  let lastCallAt = 0;
  let cursor = 0;
  let halted = false;

  async function processOne(market: MarketRow): Promise<void> {
    if (halted) return;

    // Rate-limit pacing (simple monotonic gap)
    const since = Date.now() - lastCallAt;
    if (since < MIN_INTERVAL_MS) {
      await sleep(MIN_INTERVAL_MS - since);
    }
    lastCallAt = Date.now();

    // Budget gate (re-checked per call)
    if (budget.isOverBudget()) {
      if (!halted) {
        halted = true;
        console.error(`[replay-llm] HALT: budget cap hit ($${budget.getDailySpend().toFixed(4)} >= $${budgetUsd}). Aborting remaining ${stats.total - stats.completed} markets.`);
      }
      return;
    }

    const prompt = buildPrompt(market);
    let result: CallResult;
    try {
      result = await callClaude(client, model, prompt);
    } catch (err) {
      stats.errors++;
      console.warn(`[replay-llm] API error for ${market.market_id}: ${(err as Error).message}`);
      return;
    }

    const parsed = parseLlmForecast(result.text, market.mid_price_t12h);

    insert.run(
      market.market_id,
      market.vertical,
      model,
      parsed.forecastYes,
      market.mid_price_t12h,
      market.resolved_outcome,
      parsed.reasoning,
      parsed.ok ? 1 : 0,
      result.inputTokens,
      result.outputTokens,
      result.costUsd,
      market.entry_ts,
      market.end_ts,
      run.runId,
    );

    await budget.recordSpend(result.costUsd);

    stats.completed++;
    stats.parsedOk += parsed.ok ? 1 : 0;
    stats.parsedFailed += parsed.ok ? 0 : 1;
    stats.totalCostUsd += result.costUsd;
    stats.totalInputTokens += result.inputTokens;
    stats.totalOutputTokens += result.outputTokens;
    stats.perVertical[market.vertical] = (stats.perVertical[market.vertical] ?? 0) + 1;

    if (stats.completed % 50 === 0) {
      const elapsed = (Date.now() - t0) / 1000;
      const rate = stats.completed / elapsed;
      const remaining = stats.total - stats.completed;
      const etaSec = rate > 0 ? remaining / rate : 0;
      console.log(
        `[replay-llm] ${stats.completed}/${stats.total} | cost $${stats.totalCostUsd.toFixed(4)} (budget $${budget.getDailySpend().toFixed(4)}/$${budgetUsd}) | ${rate.toFixed(2)}/s | ETA ${(etaSec / 60).toFixed(1)}min | parse_fail=${stats.parsedFailed} api_err=${stats.errors}`,
      );
    }
  }

  // Worker pool
  const workers: Promise<void>[] = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push((async () => {
      while (cursor < sample.length && !halted) {
        const idx = cursor++;
        const market = sample[idx];
        if (!market) break;
        await processOne(market);
      }
    })());
  }
  await Promise.all(workers);

  // Finalize
  const finalStatus = halted ? 'failed' : 'completed';
  run.finalize(finalStatus, JSON.stringify(stats));

  console.log('\n[replay-llm] DONE');
  console.log(`  Status:           ${finalStatus.toUpperCase()}`);
  console.log(`  Total processed:  ${stats.completed}/${stats.total}`);
  console.log(`  Parsed OK:        ${stats.parsedOk}  (failed: ${stats.parsedFailed})`);
  console.log(`  API errors:       ${stats.errors}`);
  console.log(`  Total cost:       $${stats.totalCostUsd.toFixed(4)}`);
  console.log(`  Tokens:           in=${stats.totalInputTokens}  out=${stats.totalOutputTokens}`);
  console.log(`  Budget remaining: $${(budgetUsd - budget.getDailySpend()).toFixed(4)} / $${budgetUsd}`);
  console.log('  Per vertical:');
  for (const v of args.verticals) {
    console.log(`    ${v.padEnd(10)} ${stats.perVertical[v] ?? 0}`);
  }

  db.close();

  if (halted) {
    process.exit(2); // budget halt
  }
}

// ---------------------------------------------------------------------------
// Smoke test
// ---------------------------------------------------------------------------

async function runSmokeTest(client: Anthropic, model: string): Promise<void> {
  const fakeMarket: MarketRow = {
    market_id: 'SMOKE-TEST',
    vertical: 'weather',
    question: 'Will the high temperature in NYC on 2026-04-30 exceed 70F?',
    mid_price_t12h: 0.55,
    volume_entry_usd: 50000,
    liquidity_entry_usd: 25000,
    entry_ts: 1714435200,
    end_ts: 1714521600,
    resolved_outcome: 1,
  };
  const prompt = buildPrompt(fakeMarket);
  console.log('[replay-llm] SMOKE: sending single test prompt to Claude...');
  console.log('---');
  console.log(prompt);
  console.log('---');

  let result: CallResult;
  try {
    result = await callClaude(client, model, prompt);
  } catch (err) {
    console.error(`[replay-llm] SMOKE FAILED: ${(err as Error).message}`);
    process.exit(1);
  }

  console.log('Claude raw response:');
  console.log(result.text);
  console.log('---');
  console.log(`Tokens: in=${result.inputTokens}  out=${result.outputTokens}`);
  console.log(`Cost: $${result.costUsd.toFixed(6)}`);

  const parsed = parseLlmForecast(result.text, fakeMarket.mid_price_t12h);
  console.log('Parsed forecast:', parsed);

  if (!parsed.ok) {
    console.error('[replay-llm] SMOKE WARNING: parser fell back to mid_price (LLM output unparseable). Investigate prompt.');
    process.exit(1);
  }
  console.log('[replay-llm] SMOKE OK');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error('[replay-llm] UNCAUGHT:', err);
  process.exit(1);
});
