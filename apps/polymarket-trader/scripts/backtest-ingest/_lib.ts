/**
 * BACKTEST-1 Phase 1 — Shared utilities for ingest scripts.
 *
 * Responsibilities:
 *   - Open / migrate the SQLite DB (`data/backtest/historical-markets.db`)
 *   - Wrap node:sqlite (Node 22+) so each script doesn't repeat boilerplate
 *   - Idempotent UPSERT for historical_markets and weather_climatology
 *   - Checkpoint save/load (resume after crash)
 *   - Progress logging every N rows
 *   - Run-metadata tracking via ingest_runs table
 *
 * Design notes:
 *   - Uses `node:sqlite` (built-in, stable in Node 22+, this repo runs Node 24).
 *   - No prepared statement cache: SQLite already caches plans; volume is low
 *     (~10-50k rows total), so simplicity beats micro-optimization.
 *   - Zod schemas validate ROWS before INSERT — catches API drift early.
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import dns from 'node:dns/promises';
import { Agent, setGlobalDispatcher } from 'undici';
import { z } from 'zod';

// Brazil ISP DNS blocks polymarket.com — force public resolvers + undici dispatcher
// because dns.setServers only affects dns.resolve*, not dns.lookup (used by fetch).
dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1']);
setGlobalDispatcher(
  new Agent({
    connect: {
      lookup: (host, _opts, cb) => {
        dns
          .resolve4(host)
          .then((addrs) => cb(null, addrs.map((address) => ({ address, family: 4 }))))
          .catch(cb);
      },
    },
  }),
);

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

export const BACKTEST_ROOT = join(import.meta.dirname, '..', '..', 'data', 'backtest');
export const DB_PATH = join(BACKTEST_ROOT, 'historical-markets.db');
export const SCHEMA_PATH = join(BACKTEST_ROOT, 'schema.sql');
export const CHECKPOINT_DIR = join(BACKTEST_ROOT, '.checkpoints');

// ---------------------------------------------------------------------------
// DB open + migrate
// ---------------------------------------------------------------------------

/**
 * Open the backtest DB. Creates it (and applies schema.sql) if missing.
 * Re-running on an existing DB is safe — schema uses CREATE IF NOT EXISTS.
 */
export function openDb(): DatabaseSync {
  if (!existsSync(BACKTEST_ROOT)) mkdirSync(BACKTEST_ROOT, { recursive: true });
  if (!existsSync(CHECKPOINT_DIR)) mkdirSync(CHECKPOINT_DIR, { recursive: true });

  const db = new DatabaseSync(DB_PATH);

  // Always (re-)apply schema. CREATE IF NOT EXISTS is idempotent.
  if (!existsSync(SCHEMA_PATH)) {
    throw new Error(`schema.sql missing at ${SCHEMA_PATH}`);
  }
  const schema = readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  return db;
}

// ---------------------------------------------------------------------------
// Zod schemas — validate ROWS (post-mapping) before INSERT
// ---------------------------------------------------------------------------

export const HistoricalMarketRow = z.object({
  market_id: z.string().min(1),
  source: z.enum(['polymarket', 'kalshi']),
  vertical: z.enum(['politics', 'sports', 'finance', 'weather', 'crypto']),
  sport_subtype: z.enum(['nba', 'nfl', 'mlb', 'soccer']).nullable(),
  question: z.string().min(1),
  entry_ts: z.number().int().positive(),
  end_ts: z.number().int().positive(),
  duration_h: z.number().positive().max(168),
  liquidity_entry_usd: z.number().nullable(),
  volume_entry_usd: z.number().nullable(),
  mid_price_t12h: z.number().min(0).max(1).nullable(),
  resolved_outcome: z.union([z.literal(0), z.literal(1), z.null()]),
  resolution_status: z.enum(['resolved', 'void', 'disputed', 'pending']),
  raw_data_json: z.string().nullable(),
}).refine(r => r.end_ts > r.entry_ts, { message: 'end_ts must be > entry_ts' })
  .refine(
    r => (r.resolution_status === 'resolved') === (r.resolved_outcome !== null),
    { message: 'resolved iff resolved_outcome is non-null' }
  )
  .refine(
    r => r.sport_subtype === null || r.vertical === 'sports',
    { message: 'sport_subtype only valid for vertical=sports' }
  );

export type HistoricalMarketRow = z.infer<typeof HistoricalMarketRow>;

export const WeatherClimatologyRow = z.object({
  station_id: z.string().min(1),
  doy: z.number().int().min(1).max(366),
  metric: z.enum(['TMAX', 'TMIN', 'PRCP', 'SNOW', 'SNWD']),
  mean: z.number().nullable(),
  stddev: z.number().nullable(),
  p10: z.number().nullable(),
  p25: z.number().nullable(),
  p50: z.number().nullable(),
  p75: z.number().nullable(),
  p90: z.number().nullable(),
  n_years: z.number().int().min(0).max(50),
  raw_values_json: z.string().nullable(),
});

export type WeatherClimatologyRow = z.infer<typeof WeatherClimatologyRow>;

// ---------------------------------------------------------------------------
// Idempotent UPSERT helpers
// ---------------------------------------------------------------------------

/**
 * UPSERT into historical_markets. Returns 'inserted' | 'updated' for stats.
 * On conflict (market_id), updates ALL non-key columns with the new payload —
 * this is intentional: re-running a script with fresher data overwrites stale.
 */
export function upsertMarket(db: DatabaseSync, row: HistoricalMarketRow): 'inserted' | 'updated' {
  // Validate at the boundary
  HistoricalMarketRow.parse(row);

  const existed = db.prepare('SELECT 1 FROM historical_markets WHERE market_id = ?').get(row.market_id);

  const stmt = db.prepare(`
    INSERT INTO historical_markets (
      market_id, source, vertical, sport_subtype, question,
      entry_ts, end_ts, duration_h, liquidity_entry_usd, volume_entry_usd,
      mid_price_t12h, resolved_outcome, resolution_status, raw_data_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(market_id) DO UPDATE SET
      source              = excluded.source,
      vertical            = excluded.vertical,
      sport_subtype       = excluded.sport_subtype,
      question            = excluded.question,
      entry_ts            = excluded.entry_ts,
      end_ts              = excluded.end_ts,
      duration_h          = excluded.duration_h,
      liquidity_entry_usd = excluded.liquidity_entry_usd,
      volume_entry_usd    = excluded.volume_entry_usd,
      mid_price_t12h      = excluded.mid_price_t12h,
      resolved_outcome    = excluded.resolved_outcome,
      resolution_status   = excluded.resolution_status,
      raw_data_json       = excluded.raw_data_json
  `);
  stmt.run(
    row.market_id, row.source, row.vertical, row.sport_subtype, row.question,
    row.entry_ts, row.end_ts, row.duration_h, row.liquidity_entry_usd, row.volume_entry_usd,
    row.mid_price_t12h, row.resolved_outcome, row.resolution_status, row.raw_data_json,
  );
  return existed ? 'updated' : 'inserted';
}

export function upsertClimatology(db: DatabaseSync, row: WeatherClimatologyRow): 'inserted' | 'updated' {
  WeatherClimatologyRow.parse(row);
  const existed = db.prepare(
    'SELECT 1 FROM weather_climatology WHERE station_id = ? AND doy = ? AND metric = ?'
  ).get(row.station_id, row.doy, row.metric);

  const stmt = db.prepare(`
    INSERT INTO weather_climatology (
      station_id, doy, metric, mean, stddev, p10, p25, p50, p75, p90, n_years, raw_values_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(station_id, doy, metric) DO UPDATE SET
      mean             = excluded.mean,
      stddev           = excluded.stddev,
      p10              = excluded.p10,
      p25              = excluded.p25,
      p50              = excluded.p50,
      p75              = excluded.p75,
      p90              = excluded.p90,
      n_years          = excluded.n_years,
      raw_values_json  = excluded.raw_values_json
  `);
  stmt.run(
    row.station_id, row.doy, row.metric,
    row.mean, row.stddev, row.p10, row.p25, row.p50, row.p75, row.p90,
    row.n_years, row.raw_values_json,
  );
  return existed ? 'updated' : 'inserted';
}

// ---------------------------------------------------------------------------
// Run metadata
// ---------------------------------------------------------------------------

export interface RunHandle {
  runId: number;
  scriptName: string;
  startedAt: number;
  inserted: number;
  updated: number;
  skipped: number;
  finalize: (status: 'completed' | 'failed' | 'aborted', errorMessage?: string, notes?: string) => void;
}

export function startRun(db: DatabaseSync, scriptName: string): RunHandle {
  const startedAt = Math.floor(Date.now() / 1000);
  const result = db.prepare(`
    INSERT INTO ingest_runs (script, started_at, status) VALUES (?, ?, 'running')
  `).run(scriptName, startedAt);
  const runId = Number(result.lastInsertRowid);

  const handle: RunHandle = {
    runId,
    scriptName,
    startedAt,
    inserted: 0,
    updated: 0,
    skipped: 0,
    finalize(status, errorMessage, notes) {
      const finishedAt = Math.floor(Date.now() / 1000);
      db.prepare(`
        UPDATE ingest_runs SET
          finished_at   = ?,
          status        = ?,
          rows_inserted = ?,
          rows_updated  = ?,
          rows_skipped  = ?,
          error_message = ?,
          notes         = ?
        WHERE run_id = ?
      `).run(finishedAt, status, handle.inserted, handle.updated, handle.skipped, errorMessage ?? null, notes ?? null, runId);
    },
  };
  return handle;
}

// ---------------------------------------------------------------------------
// Checkpointing (JSON file per script)
// ---------------------------------------------------------------------------

export function checkpointPath(scriptName: string): string {
  return join(CHECKPOINT_DIR, `${scriptName}.json`);
}

export function loadCheckpoint<T>(scriptName: string): T | null {
  const path = checkpointPath(scriptName);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function saveCheckpoint<T>(scriptName: string, data: T): void {
  const path = checkpointPath(scriptName);
  if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}

export function clearCheckpoint(scriptName: string): void {
  const path = checkpointPath(scriptName);
  if (existsSync(path)) {
    writeFileSync(path, '');
  }
}

// ---------------------------------------------------------------------------
// Progress logger
// ---------------------------------------------------------------------------

export function makeProgress(scriptName: string, every = 100): (cur: number, total: number, qualifying: number) => void {
  let lastLogged = 0;
  return (cur, total, qualifying) => {
    if (cur - lastLogged >= every || cur === total) {
      const pct = total > 0 ? ((cur / total) * 100).toFixed(1) : '?';
      // eslint-disable-next-line no-console
      console.log(`[${scriptName}] ${cur}/${total} (${pct}%) processed, ${qualifying} qualifying`);
      lastLogged = cur;
    }
  };
}

// ---------------------------------------------------------------------------
// Universe bounds (12 months window per user decision #4)
// ---------------------------------------------------------------------------

export const WINDOW_END_TS = Math.floor(Date.parse('2026-04-28T00:00:00Z') / 1000);
export const WINDOW_START_TS = Math.floor(Date.parse('2025-05-01T00:00:00Z') / 1000);
export const MAX_DURATION_H = 168;       // 7 days
export const MAX_DURATION_S = MAX_DURATION_H * 3600;

// ---------------------------------------------------------------------------
// HTTP helpers — fetch with retry & polite rate limiting
// ---------------------------------------------------------------------------

export interface FetchOpts {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  retries?: number;
  retryDelayMs?: number;
}

export async function fetchJson<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const retries = opts.retries ?? 3;
  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: opts.method ?? 'GET',
        headers: opts.headers,
        body: opts.body,
      });
      if (res.status === 429) {
        // Rate-limited — back off
        const wait = opts.retryDelayMs ?? 2000 * (attempt + 1);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url}`);
      return await res.json() as T;
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      await sleep((opts.retryDelayMs ?? 1000) * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// CLI guard — surface friendly errors
// ---------------------------------------------------------------------------

export function nodeVersionGuard(): void {
  const [majorStr, minorStr] = process.versions.node.split('.');
  const major = parseInt(majorStr ?? '0', 10);
  const minor = parseInt(minorStr ?? '0', 10);
  // node:sqlite stable as built-in:
  //   - Node 22.5+ behind --experimental-sqlite flag
  //   - Node 24+ no flag required
  if (major < 22 || (major === 22 && minor < 5)) {
    // eslint-disable-next-line no-console
    console.error(`[backtest-ingest] FATAL: Node ${process.versions.node} too old. Need >=22.5 for node:sqlite (>=24 stable, >=22.5 with --experimental-sqlite).`);
    process.exit(1);
  }
  if (major === 22 || major === 23) {
    // eslint-disable-next-line no-console
    console.warn(`[backtest-ingest] WARN: Node ${process.versions.node} requires --experimental-sqlite flag for node:sqlite. If this script aborts on import, re-run with: node --experimental-sqlite \`which tsx\` <script>.`);
  }
}
