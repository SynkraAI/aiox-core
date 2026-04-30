#!/usr/bin/env npx tsx
/**
 * BACKTEST-1 Phase 1 — Polymarket CLOB price-history (T-12h baseline).
 *
 * For each Polymarket market already in historical_markets that doesn't yet
 * have mid_price_t12h, pull /prices-history at 12h granularity and extract
 * the YES-token mid at the closest sample <= (end_ts - 12h).
 *
 * Limitation (issue #216 of py-clob-client): for resolved markets the API
 * effectively floors granularity at ~12h. That is the user-approved baseline
 * (decision #5). We accept it.
 *
 * Idempotent: only hits markets where mid_price_t12h IS NULL.
 *
 * Usage:
 *   npx tsx scripts/backtest-ingest/ingest-polymarket-clob-prices.ts
 *
 * Throughput estimate: ~3 req/s -> ~2-4h for 30k markets.
 */

import {
  openDb, startRun, makeProgress,
  loadCheckpoint, saveCheckpoint, clearCheckpoint,
  fetchJson, sleep, nodeVersionGuard,
} from './_lib.js';

const SCRIPT = 'ingest-polymarket-clob-prices';
const CLOB_BASE = 'https://clob.polymarket.com';
const REQ_DELAY_MS = 100;        // ~10 req/s (Cloudflare-fronted, generous)
const MIN_VOLUME_USD = 10_000;   // Skip low-liquidity markets — 90% reduction

interface PricePoint { t: number; p: number }
interface PriceHistoryResponse { history: PricePoint[] }

interface MarketRow {
  market_id: string;
  end_ts: number;
  raw_data_json: string;
}

interface Checkpoint {
  lastMarketId: string | null;
  totalProcessed: number;
  totalHydrated: number;
}

function extractYesTokenId(rawJson: string): string | null {
  try {
    const raw = JSON.parse(rawJson) as { clobTokenIds?: string };
    if (!raw.clobTokenIds) return null;
    const tokens = JSON.parse(raw.clobTokenIds) as string[];
    return tokens[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchHistory(tokenId: string): Promise<PricePoint[]> {
  // fidelity=720min == 12h granularity (matches user-approved baseline T-12h).
  // interval=max maximizes chance of pre-resolution samples even when the market
  // predates `interval=1w` cutoffs. Client-side filter happens in pickMidAtT12h.
  const url = `${CLOB_BASE}/prices-history?market=${tokenId}&interval=max&fidelity=720`;
  try {
    const res = await fetchJson<PriceHistoryResponse | PricePoint[]>(url, { retries: 2 });
    return Array.isArray(res) ? res : res?.history ?? [];
  } catch (err) {
    console.warn(`[${SCRIPT}] /prices-history failed for token ${tokenId.slice(0, 12)}...:`, err instanceof Error ? err.message : err);
    return [];
  }
}

function pickMidAtT12h(history: PricePoint[], endTs: number): number | null {
  if (history.length === 0) return null;
  // CLOB returns t in seconds OR ms — handle both.
  const targetTs = endTs - 12 * 3600;
  const normalized: PricePoint[] = history.map(pt => ({
    t: pt.t > 1e12 ? Math.floor(pt.t / 1000) : pt.t,
    p: pt.p,
  }));

  // Find the latest sample at or before targetTs.
  const eligible = normalized.filter(pt => pt.t <= targetTs);
  if (eligible.length === 0) {
    // No data at T-12h. Fall back to earliest available sample as a degraded
    // baseline. Better than nothing for short markets where T-12h precedes
    // first trade.
    const earliest = normalized.reduce((acc, pt) => (pt.t < acc.t ? pt : acc), normalized[0]);
    if (earliest.p < 0 || earliest.p > 1) return null;
    return Number(earliest.p.toFixed(4));
  }

  const closest = eligible.reduce((acc, pt) => (pt.t > acc.t ? pt : acc), eligible[0]);
  if (closest.p < 0 || closest.p > 1) return null;
  return Number(closest.p.toFixed(4));
}

async function main(): Promise<void> {
  nodeVersionGuard();
  const db = openDb();
  const run = startRun(db, SCRIPT);
  const progress = makeProgress(SCRIPT, 100);

  let checkpoint = loadCheckpoint<Checkpoint>(SCRIPT) ?? {
    lastMarketId: null,
    totalProcessed: 0,
    totalHydrated: 0,
  };

  // Eligible: PM markets without baseline yet, with non-trivial volume
  // (volume_entry_usd ≥ $10k filters out 90% of long-tail noise).
  const params: unknown[] = [MIN_VOLUME_USD];
  let where = `source = 'polymarket' AND mid_price_t12h IS NULL AND volume_entry_usd >= ?`;
  if (checkpoint.lastMarketId) {
    where += ` AND market_id > ?`;
    params.push(checkpoint.lastMarketId);
  }
  const rows = db.prepare(
    `SELECT market_id, end_ts, raw_data_json FROM historical_markets WHERE ${where} ORDER BY market_id ASC`
  ).all(...params) as unknown as MarketRow[];

  console.log(`[${SCRIPT}] ${rows.length} PM markets need baseline (resuming from ${checkpoint.lastMarketId ?? 'start'})`);

  const updateStmt = db.prepare(`UPDATE historical_markets SET mid_price_t12h = ? WHERE market_id = ?`);

  try {
    for (const row of rows) {
      checkpoint.totalProcessed += 1;
      checkpoint.lastMarketId = row.market_id;

      const yesTokenId = extractYesTokenId(row.raw_data_json);
      if (!yesTokenId) {
        run.skipped += 1;
        continue;
      }

      const history = await fetchHistory(yesTokenId);
      const mid = pickMidAtT12h(history, row.end_ts);
      if (mid !== null) {
        updateStmt.run(mid, row.market_id);
        run.updated += 1;
        checkpoint.totalHydrated += 1;
      } else {
        run.skipped += 1;
      }

      progress(checkpoint.totalProcessed, rows.length, checkpoint.totalHydrated);

      // Persist checkpoint every 50 to survive Ctrl-C
      if (checkpoint.totalProcessed % 50 === 0) saveCheckpoint(SCRIPT, checkpoint);
      await sleep(REQ_DELAY_MS);
    }

    saveCheckpoint(SCRIPT, checkpoint);
    console.log(`[${SCRIPT}] DONE. processed=${checkpoint.totalProcessed} hydrated=${checkpoint.totalHydrated} skipped=${run.skipped}`);
    run.finalize('completed', undefined, JSON.stringify({ totalHydrated: checkpoint.totalHydrated }));
    clearCheckpoint(SCRIPT);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${SCRIPT}] FAILED:`, msg);
    saveCheckpoint(SCRIPT, checkpoint);
    run.finalize('failed', msg);
    process.exit(2);
  }
}

main();
