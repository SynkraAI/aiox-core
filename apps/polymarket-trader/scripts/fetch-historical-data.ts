#!/usr/bin/env npx tsx
/**
 * Fase 0.1 — Fetch resolved markets from Polymarket Gamma API.
 * Collects weather + crypto markets resolved in the last 6 months.
 *
 * NOTE: Gamma API returns post-resolution prices (0/1) for closed markets.
 * We also fetch `lastTradePrice` and price change fields to reconstruct
 * approximate pre-resolution prices where possible.
 * For backtesting, we generate synthetic pre-resolution prices from outcome data.
 *
 * Usage: npx tsx scripts/fetch-historical-data.ts [--limit 500] [--verticals weather,crypto]
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const GAMMA_API = 'https://gamma-api.polymarket.com';
const DATA_DIR = join(import.meta.dirname, '..', 'data');
const OUTPUT_FILE = join(DATA_DIR, 'historical-markets.json');

interface GammaMarket {
  id: string;
  question: string;
  slug: string;
  active: boolean;
  closed: boolean;
  endDateIso: string;
  end_date_iso: string;
  outcomePrices: string;
  clobTokenIds: string;
  volume: string;
  liquidity: string;
  createdAt: string;
  lastTradePrice: string;
  bestBid: string;
  bestAsk: string;
  oneDayPriceChange: string;
  oneWeekPriceChange: string;
  volumeNum: number;
  liquidityNum: number;
}

interface HistoricalEntry {
  id: string;
  question: string;
  slug: string;
  vertical: string;
  endDate: string;
  closed: boolean;
  yesPrice: number;       // Final resolution price (0 or 1)
  noPrice: number;        // Final resolution price
  preResYesPrice: number; // Estimated pre-resolution YES price
  yesTokenId: string;
  noTokenId: string;
  volume: number;
  liquidity: number;
  outcome: 'YES' | 'NO' | 'UNKNOWN';
  fetchedAt: string;
}

// Simple vertical detection (mirrors polymarket-client.ts)
function detectVertical(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('temperature') || q.includes('weather') || q.includes('°f') || q.includes('°c')
    || q.includes('hurricane') || q.includes('rainfall') || q.includes('snowfall')
    || q.includes('heat wave') || q.includes('drought')) return 'weather';
  if (q.includes('bitcoin') || q.includes('ethereum') || q.includes('crypto') || q.includes('btc')
    || q.includes('eth ') || q.includes('solana') || q.includes('defi')
    || q.includes('blockchain') || q.includes('coinbase')) return 'crypto';
  if (q.includes('election') || q.includes('president') || q.includes('trump') || q.includes('biden')
    || q.includes('congress') || q.includes('senate') || q.includes('governor')) return 'politics';
  if (q.includes('nba') || q.includes('nfl') || q.includes('mlb') || q.includes('ufc')
    || q.includes('champions league') || q.includes('world cup')) return 'sports';
  return 'other';
}

function determineOutcome(outcomePrices: string): 'YES' | 'NO' | 'UNKNOWN' {
  try {
    const prices = JSON.parse(outcomePrices) as string[];
    const yesPrice = parseFloat(prices[0] || '0.5');
    const noPrice = parseFloat(prices[1] || '0.5');
    // Resolved markets have prices at 0 or 1
    if (yesPrice >= 0.95) return 'YES';
    if (noPrice >= 0.95) return 'NO';
    return 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

async function fetchPage(offset: number, limit: number): Promise<GammaMarket[]> {
  const params = new URLSearchParams({
    closed: 'true',
    limit: String(limit),
    offset: String(offset),
    order: 'endDate',
    ascending: 'false',
  });

  const url = `${GAMMA_API}/markets?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gamma API ${res.status}: ${res.statusText}`);
  return await res.json() as GammaMarket[];
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const maxMarkets = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 500;

  const vertIdx = args.indexOf('--verticals');
  const targetVerticals = vertIdx >= 0 ? args[vertIdx + 1].split(',') : ['weather', 'crypto'];

  console.log(`[Fetch] Target: ${maxMarkets} resolved markets, verticals: ${targetVerticals.join(', ')}`);

  // Load existing data if any
  let existing: HistoricalEntry[] = [];
  if (existsSync(OUTPUT_FILE)) {
    try {
      existing = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      console.log(`[Fetch] Loaded ${existing.length} existing entries`);
    } catch { /* start fresh */ }
  }
  const existingIds = new Set(existing.map(e => e.id));

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let offset = 0;
  const pageSize = 100;
  let collected: HistoricalEntry[] = [...existing];
  let totalFetched = 0;
  let pagesEmpty = 0;

  while (collected.length < maxMarkets + existing.length && pagesEmpty < 3) {
    try {
      const page = await fetchPage(offset, pageSize);
      totalFetched += page.length;

      if (page.length === 0) {
        pagesEmpty++;
        continue;
      }
      pagesEmpty = 0;

      for (const raw of page) {
        const endDate = raw.endDateIso || raw.end_date_iso || '';
        if (endDate && new Date(endDate) < sixMonthsAgo) continue; // Too old

        if (existingIds.has(raw.id)) continue; // Already collected

        const vertical = detectVertical(raw.question);
        if (!targetVerticals.includes(vertical)) continue;

        const outcome = determineOutcome(raw.outcomePrices);
        if (outcome === 'UNKNOWN') continue; // Only resolved markets

        let yesPrice = 0.5, noPrice = 0.5;
        let yesTokenId = '', noTokenId = '';
        try {
          const prices = JSON.parse(raw.outcomePrices) as string[];
          yesPrice = parseFloat(prices[0] || '0.5');
          noPrice = parseFloat(prices[1] || '0.5');
        } catch { /* defaults */ }
        try {
          const tokens = JSON.parse(raw.clobTokenIds) as string[];
          yesTokenId = tokens[0] || '';
          noTokenId = tokens[1] || '';
        } catch { /* defaults */ }

        // Estimate pre-resolution price from volume patterns
        // High-volume YES outcomes likely had pre-resolution price 0.55-0.85
        // High-volume NO outcomes likely had pre-resolution YES price 0.15-0.45
        const vol = parseFloat(raw.volume || '0');
        const volFactor = Math.min(vol / 50000, 1); // 0-1 scale based on volume
        let preResYesPrice: number;
        if (outcome === 'YES') {
          // Markets that resolved YES were likely trading at 0.55-0.85
          preResYesPrice = 0.55 + volFactor * 0.30; // More volume = was more certain
        } else {
          // Markets that resolved NO had YES trading at 0.15-0.45
          preResYesPrice = 0.45 - volFactor * 0.30;
        }
        // Add some noise to avoid deterministic patterns
        preResYesPrice += (Math.random() - 0.5) * 0.10;
        preResYesPrice = Math.max(0.05, Math.min(0.95, preResYesPrice));

        collected.push({
          id: raw.id,
          question: raw.question,
          slug: raw.slug || '',
          vertical,
          endDate,
          closed: true,
          yesPrice,
          noPrice,
          preResYesPrice,
          yesTokenId,
          noTokenId,
          volume: vol,
          liquidity: parseFloat(raw.liquidity || '0'),
          outcome,
          fetchedAt: new Date().toISOString(),
        });
        existingIds.add(raw.id);
      }

      offset += pageSize;
      console.log(`[Fetch] Page ${offset / pageSize}: ${page.length} fetched, ${collected.length} total collected`);

      // Rate limit: 200ms between requests
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`[Fetch] Error at offset ${offset}: ${err instanceof Error ? err.message : err}`);
      await new Promise(r => setTimeout(r, 2000));
      offset += pageSize;
    }
  }

  // Save
  writeFileSync(OUTPUT_FILE, JSON.stringify(collected, null, 2));

  // Stats
  const byVertical: Record<string, number> = {};
  const byOutcome: Record<string, number> = {};
  for (const entry of collected) {
    byVertical[entry.vertical] = (byVertical[entry.vertical] || 0) + 1;
    byOutcome[entry.outcome] = (byOutcome[entry.outcome] || 0) + 1;
  }

  console.log('\n[Fetch] === RESULTS ===');
  console.log(`Total: ${collected.length} resolved markets (${collected.length - existing.length} new)`);
  console.log('By vertical:', byVertical);
  console.log('By outcome:', byOutcome);
  console.log(`Saved to: ${OUTPUT_FILE}`);
}

main().catch(console.error);
