/**
 * BACKTEST-1 Phase 2 Tier 1 — Heuristic Replay Harness
 *
 * Iterates every usable resolved market in `historical-markets.db`, asks the
 * extracted heuristic forecaster (heuristic-signal.ts) for a forecast, and
 * writes results into a fresh `replay_heuristic_predictions` table.
 *
 * Idempotent: drops + recreates the predictions table on each run, then logs
 * the run in `ingest_runs` as 'replay-heuristic'.
 *
 * Usage:
 *   node --experimental-strip-types scripts/backtest/replay-heuristic.ts
 *   # Or via tsx:
 *   npx tsx scripts/backtest/replay-heuristic.ts
 *
 * Story: BACKTEST-2-tier1-heuristic
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { heuristicForecast, type ReplayMarketInput, type Vertical } from './heuristic-signal.ts';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPT_DIR = import.meta.dirname;
const DB_PATH = join(SCRIPT_DIR, '..', '..', 'data', 'backtest', 'historical-markets.db');

// ---------------------------------------------------------------------------
// Schema for replay_heuristic_predictions
// ---------------------------------------------------------------------------

const REPLAY_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS replay_heuristic_predictions (
  market_id        TEXT PRIMARY KEY,
  vertical         TEXT NOT NULL CHECK (vertical IN ('politics', 'sports', 'finance', 'weather', 'crypto')),
  forecast         REAL NOT NULL CHECK (forecast BETWEEN 0 AND 1),  -- our heuristic P(YES=1)
  baseline         REAL NOT NULL CHECK (baseline BETWEEN 0 AND 1),  -- mid_price_t12h (copy)
  outcome          INTEGER NOT NULL CHECK (outcome IN (0, 1)),
  side             TEXT NOT NULL CHECK (side IN ('YES', 'NO')),
  edge             REAL NOT NULL,
  confidence       REAL NOT NULL,
  should_trade     INTEGER NOT NULL CHECK (should_trade IN (0, 1)),
  raw_edge         REAL NOT NULL,
  signal_count     INTEGER NOT NULL,
  reason           TEXT,
  entry_ts         INTEGER NOT NULL,
  end_ts           INTEGER NOT NULL,
  run_id           INTEGER NOT NULL,
  FOREIGN KEY(market_id) REFERENCES historical_markets(market_id)
);

CREATE INDEX IF NOT EXISTS idx_rhp_vertical ON replay_heuristic_predictions (vertical);
CREATE INDEX IF NOT EXISTS idx_rhp_should_trade ON replay_heuristic_predictions (should_trade);
`;

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
  if (!existsSync(DB_PATH)) {
    console.error(`[replay-heuristic] FATAL: DB not found at ${DB_PATH}`);
    console.error('  Run Phase 1 ingest first (scripts/backtest-ingest/*).');
    process.exit(1);
  }

  const db = new DatabaseSync(DB_PATH);

  // PRAGMAs (match runtime ingest defaults)
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous  = NORMAL;');

  // Drop + recreate predictions table for idempotency
  db.exec('DROP TABLE IF EXISTS replay_heuristic_predictions;');
  db.exec(REPLAY_TABLE_DDL);

  const run = startRun(db, 'replay-heuristic');
  console.log(`[replay-heuristic] run_id=${run.runId} started`);

  // Pull all usable markets
  const rows = db
    .prepare(`
      SELECT
        market_id, vertical, question,
        mid_price_t12h, volume_entry_usd, liquidity_entry_usd,
        entry_ts, end_ts, resolved_outcome
      FROM historical_markets
      WHERE resolution_status = 'resolved'
        AND resolved_outcome IS NOT NULL
        AND mid_price_t12h IS NOT NULL
    `)
    .all() as Array<{
      market_id: string;
      vertical: string;
      question: string;
      mid_price_t12h: number;
      volume_entry_usd: number | null;
      liquidity_entry_usd: number | null;
      entry_ts: number;
      end_ts: number;
      resolved_outcome: number;
    }>;

  console.log(`[replay-heuristic] ${rows.length} usable markets to replay`);

  // Counters
  const stats = {
    total: rows.length,
    inserted: 0,
    skipped: 0,
    shouldTrade: 0,
    perVertical: { politics: 0, sports: 0, finance: 0, weather: 0, crypto: 0 } as Record<string, number>,
    perVerticalTrade: { politics: 0, sports: 0, finance: 0, weather: 0, crypto: 0 } as Record<string, number>,
  };

  // Prepared insert
  const insert = db.prepare(`
    INSERT INTO replay_heuristic_predictions (
      market_id, vertical, forecast, baseline, outcome, side, edge, confidence,
      should_trade, raw_edge, signal_count, reason, entry_ts, end_ts, run_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Wrap in a single transaction — ~50x faster on SQLite
  db.exec('BEGIN');
  try {
    for (const r of rows) {
      // Validate vertical (defensive — schema CHECK should already guarantee this)
      if (!['politics', 'sports', 'finance', 'weather', 'crypto'].includes(r.vertical)) {
        stats.skipped++;
        continue;
      }

      const input: ReplayMarketInput = {
        marketId: r.market_id,
        vertical: r.vertical as Vertical,
        question: r.question,
        midPriceT12h: r.mid_price_t12h,
        volumeEntryUsd: r.volume_entry_usd,
        liquidityEntryUsd: r.liquidity_entry_usd,
        entryTs: r.entry_ts,
        endTs: r.end_ts,
      };

      const result = heuristicForecast(input);

      insert.run(
        r.market_id,
        r.vertical,
        result.forecastYes,
        r.mid_price_t12h,
        r.resolved_outcome,
        result.side,
        result.edge,
        result.confidence,
        result.shouldTrade ? 1 : 0,
        result.diagnostics.rawEdge,
        result.diagnostics.signalCount,
        result.reason,
        r.entry_ts,
        r.end_ts,
        run.runId,
      );

      stats.inserted++;
      stats.perVertical[r.vertical] = (stats.perVertical[r.vertical] ?? 0) + 1;
      if (result.shouldTrade) {
        stats.shouldTrade++;
        stats.perVerticalTrade[r.vertical] = (stats.perVerticalTrade[r.vertical] ?? 0) + 1;
      }

      if (stats.inserted % 1000 === 0) {
        console.log(`[replay-heuristic] ${stats.inserted}/${stats.total}...`);
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    run.finalize('failed', String(err));
    console.error('[replay-heuristic] FAILED:', err);
    process.exit(1);
  }

  run.finalize('completed', JSON.stringify(stats));

  console.log('\n[replay-heuristic] DONE');
  console.log(`  Total replayed:   ${stats.inserted}`);
  console.log(`  Should-trade:     ${stats.shouldTrade} (${((stats.shouldTrade / stats.inserted) * 100).toFixed(1)}%)`);
  console.log(`  Skipped:          ${stats.skipped}`);
  console.log('  By vertical:');
  for (const v of ['politics', 'sports', 'finance', 'weather', 'crypto']) {
    const all = stats.perVertical[v] ?? 0;
    const trade = stats.perVerticalTrade[v] ?? 0;
    const pct = all > 0 ? ((trade / all) * 100).toFixed(1) : '0.0';
    console.log(`    ${v.padEnd(10)} N=${String(all).padStart(5)}  shouldTrade=${String(trade).padStart(5)} (${pct}%)`);
  }

  db.close();
}

main().catch((err) => {
  console.error('[replay-heuristic] UNCAUGHT:', err);
  process.exit(1);
});
