#!/usr/bin/env npx tsx
/**
 * Single-cycle market scanner for Claude Remote Agent.
 *
 * Fetches active markets, loads trade history, outputs structured JSON.
 * Designed to be called by a RemoteTrigger — Claude analyzes the output
 * and decides trades using its own intelligence (replacing LLM-in-the-loop).
 *
 * Usage: npx tsx src/scripts/scan-once.ts [--resolve] [--limit N]
 */

import '../dns-override.js'; // MUST be first — bypass ISP DNS filtering for polymarket/kalshi
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Load .env
const projectRoot = join(import.meta.dirname, '..', '..');
try {
  const envPath = join(projectRoot, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env */ }

import { PolymarketClient } from '../integrations/polymarket-client.js';
import { ExperienceStore } from '../learning/experience-store.js';
import type { Market } from '../types/index.js';

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const doResolve = args.includes('--resolve');
const limitIdx = args.indexOf('--limit');
const marketLimit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 50;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const dataDir = join(projectRoot, 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const client = new PolymarketClient();
  const store = new ExperienceStore(join(dataDir, 'trades.db'));

  // 1. Fetch active markets
  const markets = await client.getMarkets({ active: true, limit: marketLimit });
  const now = Date.now();

  // Filter: open, has tokens, > 24h until resolution
  const eligible = markets.filter(m => {
    if (m.tokens.yes.tokenId === '') return false;
    if (m.endDate) {
      const hoursLeft = (new Date(m.endDate).getTime() - now) / (1000 * 60 * 60);
      if (hoursLeft < 24) return false;
    }
    return true;
  });

  // 2. Load trade history
  const stats = store.getStats();
  const recentTrades = store.getRecent(20);
  const pendingTrades = recentTrades.filter(t => t.outcome === 'PENDING');

  // 3. Check for resolved markets (if --resolve)
  let resolved: Market[] = [];
  if (doResolve && pendingTrades.length > 0) {
    const pendingIds = pendingTrades.map(t => t.marketId);
    resolved = await client.getResolvedMarkets(pendingIds);

    // Settle resolved positions in the store
    for (const rm of resolved) {
      const yesPrice = rm.tokens.yes.price;
      // If yes price is 1.0 or 0.0, the market is settled
      if (yesPrice >= 0.99 || yesPrice <= 0.01) {
        const outcome = yesPrice >= 0.99 ? 'YES_WIN' : 'NO_WIN';
        for (const trade of pendingTrades) {
          if (trade.marketId === rm.id) {
            const won = (trade.side === 'YES' && outcome === 'YES_WIN') ||
                        (trade.side === 'NO' && outcome === 'NO_WIN');
            const exitPrice = won ? 1.0 : 0.0;
            const pnl = won
              ? (exitPrice - trade.entryPrice) * trade.positionSize
              : -trade.entryPrice * trade.positionSize;
            store.updateOutcome(rm.id, won ? 'WIN' : 'LOSS', exitPrice, pnl);
          }
        }
      }
    }
  }

  // 4. Build output for Claude
  const output = {
    timestamp: new Date().toISOString(),
    scan: {
      totalFetched: markets.length,
      eligible: eligible.length,
      resolved: resolved.length,
    },
    markets: eligible.map(m => ({
      id: m.id,
      question: m.question,
      vertical: m.vertical,
      yesPrice: m.tokens.yes.price,
      noPrice: m.tokens.no.price,
      volume: m.volume,
      liquidity: m.liquidity,
      endDate: m.endDate,
      hoursLeft: m.endDate
        ? Math.round((new Date(m.endDate).getTime() - now) / (1000 * 60 * 60))
        : null,
    })),
    portfolio: {
      stats: {
        total: stats.total,
        wins: stats.wins,
        losses: stats.losses,
        pending: stats.pending,
        winRate: Math.round(stats.winRate * 100),
        totalPnl: Math.round(stats.totalPnl * 100) / 100,
        avgPnl: Math.round(stats.avgPnl * 100) / 100,
      },
      openPositions: pendingTrades.map(t => ({
        marketId: t.marketId,
        question: t.marketQuestion,
        side: t.side,
        size: t.positionSize,
        entryPrice: t.entryPrice,
        vertical: t.vertical,
        openedAt: t.timestamp,
      })),
      recentSettled: recentTrades
        .filter(t => t.outcome !== 'PENDING')
        .slice(0, 10)
        .map(t => ({
          question: t.marketQuestion,
          side: t.side,
          outcome: t.outcome,
          pnl: Math.round(t.pnl * 100) / 100,
          vertical: t.vertical,
          lesson: t.lesson,
        })),
      byVertical: stats.byVertical,
    },
  };

  // Flush any resolved trade updates
  store.close();

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
  process.exit(1);
});
