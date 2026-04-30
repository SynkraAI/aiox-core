#!/usr/bin/env npx tsx
/**
 * BACKTEST-1 Phase 1 — Polymarket Gamma ingest.
 *
 * Pulls resolved markets in the 12-month window via Gamma /markets?closed=true.
 * Classifies each market (politics/sports/finance/weather; crypto -> skip),
 * filters to <=7d resolution windows, UPSERTs into historical_markets.
 *
 * NOTE on baseline price (mid_price_t12h):
 *   This script does NOT compute baselines. It writes mid_price_t12h = NULL
 *   here, then the second script (ingest-polymarket-clob-prices) hydrates
 *   that column via /prices-history per market. Two-pass design = idempotent
 *   and resilient to CLOB rate limits.
 *
 * Usage (after schema in place):
 *   npx tsx scripts/backtest-ingest/ingest-polymarket-gamma.ts
 *
 * Env vars:
 *   (none required — Gamma is public)
 *
 * Idempotent: safe to re-run. Uses checkpoint to resume mid-pagination.
 */

import {
  openDb, upsertMarket, startRun, makeProgress,
  loadCheckpoint, saveCheckpoint, clearCheckpoint,
  fetchJson, sleep, nodeVersionGuard,
  WINDOW_START_TS, WINDOW_END_TS, MAX_DURATION_H,
} from './_lib.js';
import { classifyVertical } from '../../src/backtest/vertical-classifier.js';
import type { HistoricalMarketRow } from './_lib.js';

const SCRIPT = 'ingest-polymarket-gamma';
const GAMMA_BASE = 'https://gamma-api.polymarket.com';
const PAGE_SIZE = 500;
const PAGE_DELAY_MS = 250;       // ~4 req/s — conservative

// Gamma payload shape (subset we touch)
interface GammaMarketRaw {
  id: string;
  question: string;
  slug?: string;
  closed?: boolean;
  active?: boolean;
  endDate?: string;
  endDateIso?: string;
  end_date_iso?: string;
  startDate?: string;
  startDateIso?: string;
  createdAt?: string;
  outcomePrices?: string;        // JSON string e.g. '["1","0"]'
  clobTokenIds?: string;         // JSON string
  volume?: string;
  volumeNum?: number;
  liquidity?: string;
  liquidityNum?: number;
  tags?: Array<{ label?: string; slug?: string } | string>;
  umaResolutionStatuses?: string[];
}

interface Checkpoint {
  offset: number;
  totalProcessed: number;
  totalQualifying: number;
  windowExhausted: boolean;
}

function normalizeTags(raw: GammaMarketRaw['tags']): string[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map(t => (typeof t === 'string' ? t : t?.label ?? t?.slug ?? ''))
    .filter(Boolean);
}

function parseEndDate(m: GammaMarketRaw): number | null {
  const candidates = [m.endDateIso, m.end_date_iso, m.endDate].filter(Boolean) as string[];
  for (const c of candidates) {
    const t = Date.parse(c);
    if (!Number.isNaN(t)) return Math.floor(t / 1000);
  }
  return null;
}

function parseStartDate(m: GammaMarketRaw, fallbackEndTs: number): number {
  // Best effort: Gamma sometimes has startDate / createdAt. Otherwise fall back
  // to "endTs - 7 days" so we always have an entry_ts within the universe.
  const candidates = [m.startDateIso, m.startDate, m.createdAt].filter(Boolean) as string[];
  for (const c of candidates) {
    const t = Date.parse(c);
    if (!Number.isNaN(t)) return Math.floor(t / 1000);
  }
  return fallbackEndTs - 7 * 24 * 3600;
}

function determineOutcome(prices: string | undefined): { outcome: 0 | 1 | null; status: HistoricalMarketRow['resolution_status'] } {
  if (!prices) return { outcome: null, status: 'pending' };
  try {
    const arr = JSON.parse(prices) as string[];
    const yes = parseFloat(arr[0] ?? '0.5');
    const no = parseFloat(arr[1] ?? '0.5');
    if (yes >= 0.99) return { outcome: 1, status: 'resolved' };
    if (no >= 0.99)  return { outcome: 0, status: 'resolved' };
    return { outcome: null, status: 'pending' };
  } catch {
    return { outcome: null, status: 'pending' };
  }
}

async function main(): Promise<void> {
  nodeVersionGuard();
  const db = openDb();
  const run = startRun(db, SCRIPT);
  const progress = makeProgress(SCRIPT, 100);

  let checkpoint = loadCheckpoint<Checkpoint>(SCRIPT) ?? {
    offset: 0,
    totalProcessed: 0,
    totalQualifying: 0,
    windowExhausted: false,
  };

  if (checkpoint.windowExhausted) {
    console.log(`[${SCRIPT}] checkpoint says window already exhausted — to re-ingest, delete data/backtest/.checkpoints/${SCRIPT}.json`);
    run.finalize('completed', undefined, 'no-op (checkpoint complete)');
    return;
  }

  try {
    while (!checkpoint.windowExhausted) {
      const url = `${GAMMA_BASE}/markets?closed=true&limit=${PAGE_SIZE}&offset=${checkpoint.offset}&order=endDate&ascending=false`;
      const page = await fetchJson<GammaMarketRaw[]>(url, { retries: 3 });

      if (!Array.isArray(page) || page.length === 0) {
        console.log(`[${SCRIPT}] page @offset=${checkpoint.offset} empty — done.`);
        checkpoint.windowExhausted = true;
        saveCheckpoint(SCRIPT, checkpoint);
        break;
      }

      let pageMinEndTs = Infinity;
      for (const raw of page) {
        checkpoint.totalProcessed += 1;

        const endTs = parseEndDate(raw);
        if (endTs === null) {
          run.skipped += 1;
          continue;
        }
        if (endTs < pageMinEndTs) pageMinEndTs = endTs;

        // Skip future markets (endDate hasn't happened yet — pause-closed early).
        if (endTs > WINDOW_END_TS) {
          run.skipped += 1;
          continue;
        }
        // Skip pre-window history.
        if (endTs < WINDOW_START_TS) {
          run.skipped += 1;
          continue;
        }

        // Classify
        const tags = normalizeTags(raw.tags);
        const cls = classifyVertical({
          source: 'polymarket',
          question: raw.question,
          tags,
        });
        if (!cls) {
          run.skipped += 1;
          continue;
        }

        const startTs = parseStartDate(raw, endTs);
        const durationS = endTs - startTs;
        const durationH = durationS / 3600;

        // Universe filter: bot only trades markets with <=7d trading window.
        // Use min(durationH, 168) — many PM markets have multi-month windows
        // that we'd only interact with in their final 7d. We model the
        // entry as max(startTs, endTs - 7d).
        const effectiveEntryTs = Math.max(startTs, endTs - MAX_DURATION_H * 3600);
        const effectiveDurationH = (endTs - effectiveEntryTs) / 3600;

        if (effectiveDurationH <= 0 || effectiveDurationH > MAX_DURATION_H) {
          run.skipped += 1;
          continue;
        }

        const { outcome, status } = determineOutcome(raw.outcomePrices);
        const liquidity = raw.liquidityNum ?? (raw.liquidity ? parseFloat(raw.liquidity) : null);
        const volume = raw.volumeNum ?? (raw.volume ? parseFloat(raw.volume) : null);

        const row: HistoricalMarketRow = {
          market_id: `pm:${raw.id}`,
          source: 'polymarket',
          vertical: cls.vertical,
          sport_subtype: cls.sportSubtype,
          question: raw.question,
          entry_ts: effectiveEntryTs,
          end_ts: endTs,
          duration_h: Number(effectiveDurationH.toFixed(4)),
          liquidity_entry_usd: liquidity,
          volume_entry_usd: volume,
          mid_price_t12h: null, // hydrated by ingest-polymarket-clob-prices
          resolved_outcome: outcome,
          resolution_status: status,
          raw_data_json: JSON.stringify(raw),
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

      // Stop only when the OLDEST market in this page is already pre-window.
      // (Future-dated markets get skipped above but don't trigger termination.)
      if (pageMinEndTs < WINDOW_START_TS) {
        console.log(`[${SCRIPT}] page @offset=${checkpoint.offset} oldest endTs=${new Date(pageMinEndTs * 1000).toISOString()} < window start — stopping.`);
        checkpoint.windowExhausted = true;
        saveCheckpoint(SCRIPT, checkpoint);
        break;
      }

      checkpoint.offset += page.length;
      saveCheckpoint(SCRIPT, checkpoint);

      // Stop if Gamma returned a partial page (end of indexed history).
      if (page.length < PAGE_SIZE) {
        console.log(`[${SCRIPT}] partial page (${page.length} < ${PAGE_SIZE}) — assuming end of history.`);
        checkpoint.windowExhausted = true;
        saveCheckpoint(SCRIPT, checkpoint);
        break;
      }

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
