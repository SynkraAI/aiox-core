/**
 * Tests for `selectMarkets()` — pure function that filters + sorts + slices
 * candidate markets for the LLM analysis batch.
 *
 * Story: PM-PIVOT-1 (AC 8, 9, 16)
 *
 * Contract (defined in story):
 *   selectMarkets(markets, opts) where opts = { maxResolutionHours, minLiquidity, batchLimit }
 *
 *   Filters:
 *     - source ∈ {polymarket, kalshi}  (synth markets — incl. legacy `synth-*` ids — filtered out)
 *     - endDate is defined (not null/undefined)
 *     - now < endDate  AND  endDate <= now + maxResolutionHours * 3600 * 1000
 *     - liquidity >= minLiquidity
 *
 *   Sort: volume * liquidity DESC
 *   Slice: .slice(0, batchLimit)
 *
 * NOTE: The current `Market` interface (src/types/market.ts) does not have an explicit
 * `source` field. Convention used in the codebase is:
 *   - Kalshi market id: prefixed with `kalshi:`
 *   - Synth (legacy)   : prefixed with `synth-`
 *   - Polymarket       : neither prefix (everything else)
 * These tests assert behavior — they pass whether @dev derives `source` from id prefix
 * or adds an explicit field, as long as the contract above holds.
 */

import { describe, it, expect } from 'vitest';
import { selectMarkets } from '../src/engine/market-selector.js';
import type { Market } from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW = new Date('2026-04-27T12:00:00Z').getTime();
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Build a Market with sensible defaults; override via partial.
 * Note: explicit `null`/`undefined` for `endDate` is preserved (not replaced by default)
 * — required by test cases that intentionally probe missing-endDate behavior. */
function makeMarket(overrides: Partial<Market> & { id: string }): Market {
  // endDate is `string` in current type definition. We default to 3 days out.
  const defaultEnd = new Date(NOW + 3 * DAY_MS).toISOString();
  const endDate: string = ('endDate' in overrides)
    ? (overrides.endDate as string)
    : defaultEnd;
  return {
    id: overrides.id,
    question: overrides.question ?? `Question for ${overrides.id}`,
    slug: overrides.slug ?? overrides.id,
    vertical: overrides.vertical ?? 'politics',
    endDate,
    active: overrides.active ?? true,
    closed: overrides.closed ?? false,
    tokens: overrides.tokens ?? {
      yes: { tokenId: `${overrides.id}-yes`, price: 0.5, outcome: 'YES' },
      no: { tokenId: `${overrides.id}-no`, price: 0.5, outcome: 'NO' },
    },
    volume: overrides.volume ?? 10_000,
    liquidity: overrides.liquidity ?? 5_000,
    lastPrice: overrides.lastPrice ?? 0.5,
  };
}

/** Default opts that pass for the makeMarket() defaults. */
const DEFAULT_OPTS = {
  maxResolutionHours: 168, // 7 days
  minLiquidity: 1_000,
  batchLimit: 30,
};

// We freeze "now" globally for deterministic time-based filtering. selectMarkets()
// is expected to call Date.now() internally; vitest's fake timers cover that.
import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterAll(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('selectMarkets', () => {
  // -------------------------------------------------------------------------
  // 1. Empty input
  // -------------------------------------------------------------------------
  describe('empty input', () => {
    it('returns empty array when given empty input', () => {
      const result = selectMarkets([], DEFAULT_OPTS);
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // 2. All eligible Polymarket → top N by volume*liquidity
  // -------------------------------------------------------------------------
  describe('all eligible Polymarket', () => {
    it('returns top batchLimit markets sorted by volume*liquidity DESC', () => {
      const sixDaysOut = new Date(NOW + 6 * DAY_MS).toISOString();
      // 5 markets, all Polymarket, all eligible. volume*liquidity differs.
      const markets: Market[] = [
        makeMarket({ id: 'poly-a', endDate: sixDaysOut, volume: 1_000, liquidity: 5_000 }), // score 5_000_000
        makeMarket({ id: 'poly-b', endDate: sixDaysOut, volume: 5_000, liquidity: 5_000 }), // score 25_000_000
        makeMarket({ id: 'poly-c', endDate: sixDaysOut, volume: 2_000, liquidity: 5_000 }), // score 10_000_000
        makeMarket({ id: 'poly-d', endDate: sixDaysOut, volume: 9_000, liquidity: 5_000 }), // score 45_000_000
        makeMarket({ id: 'poly-e', endDate: sixDaysOut, volume: 3_000, liquidity: 5_000 }), // score 15_000_000
      ];

      const result = selectMarkets(markets, { ...DEFAULT_OPTS, batchLimit: 3 });

      expect(result).toHaveLength(3);
      // Top 3 by volume*liquidity = poly-d > poly-b > poly-e
      expect(result.map(m => m.id)).toEqual(['poly-d', 'poly-b', 'poly-e']);
    });

    it('does not mutate the input array (sort is non-destructive)', () => {
      const sixDaysOut = new Date(NOW + 6 * DAY_MS).toISOString();
      const markets: Market[] = [
        makeMarket({ id: 'poly-a', endDate: sixDaysOut, volume: 1_000, liquidity: 5_000 }),
        makeMarket({ id: 'poly-b', endDate: sixDaysOut, volume: 5_000, liquidity: 5_000 }),
      ];
      const inputOrder = markets.map(m => m.id);
      selectMarkets(markets, DEFAULT_OPTS);
      expect(markets.map(m => m.id)).toEqual(inputOrder);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Mixed real (Polymarket) + synth-prefixed legacy → only real
  // -------------------------------------------------------------------------
  describe('mixed real + synth legacy ids', () => {
    it('filters out markets whose id starts with `synth-` (legacy crypto-price-client output)', () => {
      const sixDaysOut = new Date(NOW + 6 * DAY_MS).toISOString();
      const markets: Market[] = [
        makeMarket({ id: 'poly-real-1', endDate: sixDaysOut, volume: 1_000, liquidity: 5_000 }),
        makeMarket({ id: 'poly-real-2', endDate: sixDaysOut, volume: 2_000, liquidity: 5_000 }),
        makeMarket({ id: 'synth-bitcoin-above-85000-24h-1', vertical: 'crypto', endDate: sixDaysOut, volume: 50_000, liquidity: 50_000 }),
        makeMarket({ id: 'synth-ethereum-below-3000-12h-1', vertical: 'crypto', endDate: sixDaysOut, volume: 50_000, liquidity: 50_000 }),
        makeMarket({ id: 'synth-solana-above-200-48h-1', vertical: 'crypto', endDate: sixDaysOut, volume: 50_000, liquidity: 50_000 }),
      ];

      const result = selectMarkets(markets, DEFAULT_OPTS);

      expect(result).toHaveLength(2);
      expect(result.every(m => !m.id.startsWith('synth-'))).toBe(true);
      expect(new Set(result.map(m => m.id))).toEqual(new Set(['poly-real-1', 'poly-real-2']));
    });

    it('keeps Kalshi markets (id prefix `kalshi:`) alongside Polymarket', () => {
      const sixDaysOut = new Date(NOW + 6 * DAY_MS).toISOString();
      const markets: Market[] = [
        makeMarket({ id: 'kalshi:WEATHER-NYC-RAIN-MAY1', endDate: sixDaysOut }),
        makeMarket({ id: 'poly-real-1', endDate: sixDaysOut }),
        makeMarket({ id: 'synth-btc-up', endDate: sixDaysOut }),
      ];

      const result = selectMarkets(markets, DEFAULT_OPTS);

      expect(result.map(m => m.id).sort()).toEqual(['kalshi:WEATHER-NYC-RAIN-MAY1', 'poly-real-1']);
    });
  });

  // -------------------------------------------------------------------------
  // 4. endDate=null/undefined filtered out
  // -------------------------------------------------------------------------
  describe('endDate is null/undefined', () => {
    it('returns empty when all markets have null endDate', () => {
      const markets: Market[] = [
        // Cast to allow `null` despite type being `string` (legacy data shape).
        makeMarket({ id: 'poly-a', endDate: null as unknown as string }),
        makeMarket({ id: 'poly-b', endDate: null as unknown as string }),
        makeMarket({ id: 'poly-c', endDate: undefined as unknown as string }),
      ];

      const result = selectMarkets(markets, DEFAULT_OPTS);

      expect(result).toEqual([]);
    });

    it('also filters empty-string endDate (treated as missing)', () => {
      const markets: Market[] = [
        makeMarket({ id: 'poly-a', endDate: '' }),
      ];

      const result = selectMarkets(markets, DEFAULT_OPTS);
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // 5. endDate beyond maxResolutionHours filtered out
  // -------------------------------------------------------------------------
  describe('endDate beyond maxResolutionHours', () => {
    it('filters markets whose endDate is more than maxResolutionHours away', () => {
      const thirtyDaysOut = new Date(NOW + 30 * DAY_MS).toISOString();
      const markets: Market[] = Array.from({ length: 5 }, (_, i) =>
        makeMarket({ id: `poly-${i}`, endDate: thirtyDaysOut })
      );

      const result = selectMarkets(markets, { ...DEFAULT_OPTS, maxResolutionHours: 168 }); // 7 days

      expect(result).toEqual([]);
    });

    it('filters markets whose endDate is in the past (already resolved)', () => {
      const yesterday = new Date(NOW - DAY_MS).toISOString();
      const markets: Market[] = [
        makeMarket({ id: 'poly-past', endDate: yesterday }),
      ];
      expect(selectMarkets(markets, DEFAULT_OPTS)).toEqual([]);
    });

    it('keeps markets whose endDate is exactly at the boundary (= now + maxResolutionHours)', () => {
      const exactBoundary = new Date(NOW + 168 * HOUR_MS).toISOString();
      const markets: Market[] = [
        makeMarket({ id: 'poly-edge', endDate: exactBoundary }),
      ];
      // Contract: endDate <= now + maxResolutionHours*3600*1000 → exact equality is allowed.
      const result = selectMarkets(markets, DEFAULT_OPTS);
      expect(result.map(m => m.id)).toEqual(['poly-edge']);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Liquidity below minLiquidity filtered out
  // -------------------------------------------------------------------------
  describe('liquidity below minLiquidity', () => {
    it('filters markets whose liquidity < minLiquidity', () => {
      const sixDaysOut = new Date(NOW + 6 * DAY_MS).toISOString();
      const markets: Market[] = Array.from({ length: 5 }, (_, i) =>
        makeMarket({ id: `poly-${i}`, endDate: sixDaysOut, liquidity: 500 })
      );

      const result = selectMarkets(markets, { ...DEFAULT_OPTS, minLiquidity: 1_000 });

      expect(result).toEqual([]);
    });

    it('keeps markets whose liquidity equals minLiquidity (>= boundary)', () => {
      const sixDaysOut = new Date(NOW + 6 * DAY_MS).toISOString();
      const markets: Market[] = [
        makeMarket({ id: 'poly-edge', endDate: sixDaysOut, liquidity: 1_000 }),
      ];

      const result = selectMarkets(markets, { ...DEFAULT_OPTS, minLiquidity: 1_000 });

      expect(result.map(m => m.id)).toEqual(['poly-edge']);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Mixed pass+fail by various criteria → exactly 5 valid sorted
  // -------------------------------------------------------------------------
  describe('mixed pass + fail by various criteria', () => {
    it('returns exactly the 5 valid markets, sorted by volume*liquidity DESC', () => {
      const sixDaysOut = new Date(NOW + 6 * DAY_MS).toISOString();
      const thirtyDaysOut = new Date(NOW + 30 * DAY_MS).toISOString();
      const yesterday = new Date(NOW - DAY_MS).toISOString();

      const markets: Market[] = [
        // 5 valid ones (Polymarket, eligible window, sufficient liquidity)
        makeMarket({ id: 'good-1', endDate: sixDaysOut, volume: 1_000, liquidity: 5_000 }),  // score 5M
        makeMarket({ id: 'good-2', endDate: sixDaysOut, volume: 9_000, liquidity: 5_000 }),  // score 45M  ← top
        makeMarket({ id: 'good-3', endDate: sixDaysOut, volume: 2_000, liquidity: 10_000 }), // score 20M
        makeMarket({ id: 'good-4', endDate: sixDaysOut, volume: 4_000, liquidity: 5_000 }),  // score 20M
        makeMarket({ id: 'good-5', endDate: sixDaysOut, volume: 3_000, liquidity: 5_000 }),  // score 15M

        // 5 invalid ones, one per failure mode
        makeMarket({ id: 'synth-bad-1', endDate: sixDaysOut, volume: 99_000, liquidity: 99_000 }), // synth prefix
        makeMarket({ id: 'bad-no-end', endDate: null as unknown as string, volume: 99_000, liquidity: 99_000 }), // null endDate
        makeMarket({ id: 'bad-far', endDate: thirtyDaysOut, volume: 99_000, liquidity: 99_000 }), // beyond window
        makeMarket({ id: 'bad-past', endDate: yesterday, volume: 99_000, liquidity: 99_000 }), // already resolved
        makeMarket({ id: 'bad-illiquid', endDate: sixDaysOut, volume: 99_000, liquidity: 100 }), // below minLiquidity
      ];

      const result = selectMarkets(markets, { ...DEFAULT_OPTS, batchLimit: 30 });

      expect(result).toHaveLength(5);
      // Sorted: good-2 (45M) > good-3 (20M) ≥ good-4 (20M) > good-5 (15M) > good-1 (5M)
      // good-3 and good-4 have the same score; we don't assert their internal ordering.
      expect(result[0].id).toBe('good-2');
      expect(result[result.length - 1].id).toBe('good-1');
      // No bad markets leaked through.
      expect(result.every(m => m.id.startsWith('good-'))).toBe(true);
    });

    it('respects batchLimit even when more eligible markets exist', () => {
      const sixDaysOut = new Date(NOW + 6 * DAY_MS).toISOString();
      const markets: Market[] = Array.from({ length: 10 }, (_, i) =>
        makeMarket({ id: `poly-${i}`, endDate: sixDaysOut, volume: (i + 1) * 1_000, liquidity: 5_000 })
      );

      const result = selectMarkets(markets, { ...DEFAULT_OPTS, batchLimit: 5 });

      expect(result).toHaveLength(5);
      // Top 5 by volume*liquidity: poly-9 (10k*5k=50M) … poly-5 (6k*5k=30M)
      expect(result.map(m => m.id)).toEqual(['poly-9', 'poly-8', 'poly-7', 'poly-6', 'poly-5']);
    });
  });
});
