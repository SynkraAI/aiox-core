#!/usr/bin/env npx tsx
/**
 * BACKTEST-1 Phase 1 — Kalshi historical markets ingest.
 *
 * Pulls /historical/markets in 12-month window, classifies, filters
 * <=7d resolution, UPSERTs into historical_markets.
 *
 * Auth: Kalshi requires API key+private-key signed requests on EVERY call,
 * even for public reads. The user must:
 *   1) Create a Kalshi account (https://kalshi.com)
 *   2) Generate API key in account settings
 *   3) Save key file at .secrets/kalshi-key.pem (PRIVATE — gitignored)
 *   4) Set KALSHI_API_KEY_ID in .env
 *
 * Env vars:
 *   KALSHI_API_KEY_ID            — required (UUID-like access key id)
 *   KALSHI_PRIVATE_KEY_PATH      — optional, defaults to .secrets/kalshi-key.pem
 *   KALSHI_BASE_URL              — optional, defaults to api.elections.kalshi.com
 *
 * If env is missing, the script aborts gracefully with a clear message.
 *
 * Usage:
 *   npx tsx scripts/backtest-ingest/ingest-kalshi-historical.ts
 *
 * Idempotent. Cursor-based pagination -> safe to resume.
 */

import { existsSync, readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { join } from 'node:path';
import {
  openDb, upsertMarket, startRun, makeProgress,
  loadCheckpoint, saveCheckpoint, clearCheckpoint,
  fetchJson, sleep, nodeVersionGuard,
  WINDOW_START_TS, WINDOW_END_TS, MAX_DURATION_H,
} from './_lib.js';
import { classifyVertical } from '../../src/backtest/vertical-classifier.js';
import type { HistoricalMarketRow } from './_lib.js';

const SCRIPT = 'ingest-kalshi-historical';
const KALSHI_BASE = process.env.KALSHI_BASE_URL ?? 'https://api.elections.kalshi.com';
const HISTORICAL_PATH = '/trade-api/v2/historical/markets';
const PAGE_SIZE = 1000;
const PAGE_DELAY_MS = 500;       // 2 req/s — Kalshi free tier is strict

interface KalshiHistoricalMarket {
  ticker: string;
  event_ticker: string;
  series_ticker?: string;
  title: string;
  category?: string;
  status: string;
  open_time?: string;
  close_time?: string;
  expected_expiration_time?: string;
  expiration_time?: string;
  result?: 'yes' | 'no' | 'void' | null;
  expiration_value?: string;
  yes_bid_dollars?: number;
  yes_ask_dollars?: number;
  previous_yes_bid_dollars?: number;
  previous_yes_ask_dollars?: number;
  last_price_dollars?: number;
  liquidity_dollars?: number;
  volume_fp?: number;
  volume?: number;
}

interface HistoricalResponse {
  markets: KalshiHistoricalMarket[];
  cursor?: string;
}

interface Checkpoint {
  cursor: string;
  totalProcessed: number;
  totalQualifying: number;
  done: boolean;
}

function loadPrivateKey(): string | null {
  const path = process.env.KALSHI_PRIVATE_KEY_PATH ??
    join(import.meta.dirname, '..', '..', '.secrets', 'kalshi-key.pem');
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf8');
}

function signRequest(privateKeyPem: string, method: string, path: string, timestampMs: number): string {
  // Kalshi spec: signature = base64(SHA256_SIGN(privateKey, "<timestamp_ms><METHOD><path>"))
  const message = `${timestampMs}${method.toUpperCase()}${path}`;
  const signer = createSign('SHA256');
  signer.update(message);
  signer.end();
  return signer.sign(privateKeyPem, 'base64');
}

function authHeaders(privateKeyPem: string, keyId: string, method: string, path: string): Record<string, string> {
  const ts = Date.now();
  const signature = signRequest(privateKeyPem, method, path, ts);
  return {
    'KALSHI-ACCESS-KEY': keyId,
    'KALSHI-ACCESS-TIMESTAMP': String(ts),
    'KALSHI-ACCESS-SIGNATURE': signature,
    'Accept': 'application/json',
  };
}

function classifyKalshi(m: KalshiHistoricalMarket): ReturnType<typeof classifyVertical> {
  return classifyVertical({
    source: 'kalshi',
    question: m.title,
    tags: m.category,
    ticker: m.ticker,
    eventTicker: m.event_ticker,
  });
}

function determineOutcome(m: KalshiHistoricalMarket): { outcome: 0 | 1 | null; status: HistoricalMarketRow['resolution_status'] } {
  if (m.result === 'yes') return { outcome: 1, status: 'resolved' };
  if (m.result === 'no')  return { outcome: 0, status: 'resolved' };
  if (m.result === 'void') return { outcome: null, status: 'void' };
  return { outcome: null, status: 'pending' };
}

function midPriceFromKalshi(m: KalshiHistoricalMarket): number | null {
  // Kalshi exposes previous_yes_bid/ask which is the LAST known mid (i.e. the
  // mid right before resolution). Treat that as our T-~last-tick baseline,
  // approximating T-12h. Better than nothing; flagged in the report.
  const bid = m.previous_yes_bid_dollars ?? m.yes_bid_dollars;
  const ask = m.previous_yes_ask_dollars ?? m.yes_ask_dollars;
  if (typeof bid === 'number' && typeof ask === 'number') {
    const mid = (bid + ask) / 2;
    if (mid >= 0 && mid <= 1) return Number(mid.toFixed(4));
  }
  if (typeof m.last_price_dollars === 'number' && m.last_price_dollars >= 0 && m.last_price_dollars <= 1) {
    return Number(m.last_price_dollars.toFixed(4));
  }
  return null;
}

function parseTime(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : Math.floor(t / 1000);
}

async function main(): Promise<void> {
  nodeVersionGuard();
  const db = openDb();
  const run = startRun(db, SCRIPT);
  const progress = makeProgress(SCRIPT, 100);

  // ---- Pre-flight: auth -----------------------------------------------
  const keyId = process.env.KALSHI_API_KEY_ID;
  const privateKeyPem = loadPrivateKey();
  if (!keyId || !privateKeyPem) {
    const msg = 'Kalshi credentials missing — set KALSHI_API_KEY_ID and place private key at .secrets/kalshi-key.pem (or KALSHI_PRIVATE_KEY_PATH).';
    console.error(`[${SCRIPT}] ${msg}`);
    run.finalize('aborted', msg);
    process.exit(1);
  }

  let checkpoint = loadCheckpoint<Checkpoint>(SCRIPT) ?? {
    cursor: '',
    totalProcessed: 0,
    totalQualifying: 0,
    done: false,
  };

  if (checkpoint.done) {
    console.log(`[${SCRIPT}] checkpoint says done. Delete data/backtest/.checkpoints/${SCRIPT}.json to re-ingest.`);
    run.finalize('completed', undefined, 'no-op');
    return;
  }

  try {
    while (!checkpoint.done) {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        min_close_ts: String(WINDOW_START_TS),
        max_close_ts: String(WINDOW_END_TS),
      });
      if (checkpoint.cursor) params.set('cursor', checkpoint.cursor);

      const path = `${HISTORICAL_PATH}?${params}`;
      const url = `${KALSHI_BASE}${path}`;
      const headers = authHeaders(privateKeyPem, keyId, 'GET', HISTORICAL_PATH);

      const res = await fetchJson<HistoricalResponse>(url, { headers, retries: 3, retryDelayMs: 3000 });
      const markets = res.markets ?? [];
      if (markets.length === 0) {
        console.log(`[${SCRIPT}] empty page — done.`);
        checkpoint.done = true;
        saveCheckpoint(SCRIPT, checkpoint);
        break;
      }

      for (const m of markets) {
        checkpoint.totalProcessed += 1;
        const endTs = parseTime(m.expiration_time) ?? parseTime(m.close_time) ?? parseTime(m.expected_expiration_time);
        if (endTs === null || endTs < WINDOW_START_TS || endTs > WINDOW_END_TS) {
          run.skipped += 1;
          continue;
        }

        const cls = classifyKalshi(m);
        if (!cls) { run.skipped += 1; continue; }

        const startTs = parseTime(m.open_time) ?? endTs - 7 * 24 * 3600;
        const effectiveEntryTs = Math.max(startTs, endTs - MAX_DURATION_H * 3600);
        const effectiveDurationH = (endTs - effectiveEntryTs) / 3600;
        if (effectiveDurationH <= 0 || effectiveDurationH > MAX_DURATION_H) {
          run.skipped += 1;
          continue;
        }

        const { outcome, status } = determineOutcome(m);
        const liquidity = typeof m.liquidity_dollars === 'number' ? m.liquidity_dollars : null;
        const volume = typeof m.volume === 'number' ? m.volume : (typeof m.volume_fp === 'number' ? m.volume_fp : null);

        const row: HistoricalMarketRow = {
          market_id: `ka:${m.ticker}`,
          source: 'kalshi',
          vertical: cls.vertical,
          sport_subtype: cls.sportSubtype,
          question: m.title,
          entry_ts: effectiveEntryTs,
          end_ts: endTs,
          duration_h: Number(effectiveDurationH.toFixed(4)),
          liquidity_entry_usd: liquidity,
          volume_entry_usd: volume,
          mid_price_t12h: midPriceFromKalshi(m),
          resolved_outcome: outcome,
          resolution_status: status,
          raw_data_json: JSON.stringify(m),
        };

        try {
          const result = upsertMarket(db, row);
          if (result === 'inserted') run.inserted += 1; else run.updated += 1;
          checkpoint.totalQualifying += 1;
        } catch (err) {
          console.warn(`[${SCRIPT}] upsert failed for ${row.market_id}:`, err instanceof Error ? err.message : err);
          run.skipped += 1;
        }
      }

      progress(checkpoint.totalProcessed, checkpoint.totalProcessed, checkpoint.totalQualifying);

      const nextCursor = res.cursor;
      if (!nextCursor || nextCursor === checkpoint.cursor) {
        checkpoint.done = true;
        saveCheckpoint(SCRIPT, checkpoint);
        break;
      }
      checkpoint.cursor = nextCursor;
      saveCheckpoint(SCRIPT, checkpoint);
      await sleep(PAGE_DELAY_MS);
    }

    console.log(`[${SCRIPT}] DONE. processed=${checkpoint.totalProcessed} qualifying=${checkpoint.totalQualifying} inserted=${run.inserted} updated=${run.updated} skipped=${run.skipped}`);
    run.finalize('completed', undefined, JSON.stringify({ checkpoint }));
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
