/**
 * MarketSelector — pure function for filtering and ranking real prediction markets.
 *
 * PM-PIVOT-1 (Conclave 27/Abr): single source of truth for "tradeable markets".
 * Replaces inline sort/filter logic in auto-trader.ts and market-analyzer.ts:preFilter.
 *
 * Philosophy (Rauch + Ng):
 *   - source-of-truth única
 *   - real-only (Polymarket + Kalshi). Synth deletado.
 *   - ≤7d resolution (capital morto > 7d)
 *   - sort por economic depth (volume × liquidity), não por horizonte
 */

import type { Market } from '../types/index.js';

export interface SelectMarketsOptions {
  /** Max hours until resolution. Default 168 (7d). 0 = no limit (legacy). */
  maxResolutionHours: number;
  /** Minimum liquidity (USD) for market to be eligible. */
  minLiquidity: number;
  /** Slice limit after sort. */
  batchLimit: number;
}

/** Real prediction market sources accepted by the bot. */
const REAL_SOURCES = ['polymarket', 'kalshi'] as const;

/**
 * Detect market source from id prefix.
 *   - `kalshi:`  → Kalshi
 *   - `synth-`   → Synth (legacy, deleted in PM-PIVOT-1)
 *   - anything else → Polymarket (default — covers numeric ids, 0x-prefixed, and test fixtures)
 */
function detectSource(market: Market): 'polymarket' | 'kalshi' | 'synth' {
  if (market.id.startsWith('kalshi:')) return 'kalshi';
  if (market.id.startsWith('synth-')) return 'synth';
  return 'polymarket';
}

/**
 * Filter + sort + slice markets for trading.
 *
 * Filter rules (all must pass):
 *   1. source ∈ {polymarket, kalshi}
 *   2. endDate is set (truthy non-empty string)
 *   3. now < endDate ≤ maxResolutionHours from now
 *   4. liquidity ≥ minLiquidity
 *
 * Sort: volume × liquidity DESC (economic depth — proxy for market efficiency).
 * Slice: top `batchLimit`.
 */
export function selectMarkets(markets: Market[], opts: SelectMarketsOptions): Market[] {
  const now = Date.now();
  const horizonCutoff = opts.maxResolutionHours > 0
    ? now + opts.maxResolutionHours * 60 * 60 * 1000
    : Number.POSITIVE_INFINITY;

  return markets
    .filter(m => {
      const src = detectSource(m);
      if (!REAL_SOURCES.includes(src as typeof REAL_SOURCES[number])) return false;
      if (!m.endDate || m.endDate.trim() === '') return false;
      const endTs = new Date(m.endDate).getTime();
      if (!Number.isFinite(endTs)) return false;
      if (endTs <= now) return false;
      if (endTs > horizonCutoff) return false;
      if ((m.liquidity ?? 0) < opts.minLiquidity) return false;
      return true;
    })
    .sort((a, b) => (b.volume * b.liquidity) - (a.volume * a.liquidity))
    .slice(0, opts.batchLimit);
}
