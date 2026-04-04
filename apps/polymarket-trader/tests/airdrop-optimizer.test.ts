import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AirdropOptimizer,
  calculateSpread,
  calculateRoundTripCost,
  calculateEfficiency,
  estimateRank,
  MAX_SPREAD,
  MAX_LOSS_PER_TRADE,
  DAILY_VOLUME_BUDGET_PERCENT,
  MIN_24H_VOLUME,
  MIN_LIQUIDITY,
  TAKER_FEE_RATE,
  ROUND_TRIP_FEE_RATE,
} from '../src/strategies/airdrop-optimizer.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { Market } from '../src/types/market.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: 'market-1',
    question: 'Will BTC be above $100K by end of April?',
    slug: 'btc-100k-april',
    vertical: 'crypto',
    endDate: '2026-04-30',
    active: true,
    closed: false,
    tokens: {
      yes: { tokenId: 'yes-1', price: 0.50, outcome: 'Yes' },
      no: { tokenId: 'no-1', price: 0.50, outcome: 'No' },
    },
    volume: 50000,
    liquidity: 30000,
    lastPrice: 0.50,
    ...overrides,
  };
}

/**
 * Make a tight-spread market suitable for airdrop trades.
 * YES 0.51 + NO 0.50 = 1.01 => spread = 0.01 (1%).
 */
function makeTightSpreadMarket(id = 'tight-1', volume = 50000, liquidity = 20000): Market {
  return makeMarket({
    id,
    tokens: {
      yes: { tokenId: `yes-${id}`, price: 0.505, outcome: 'Yes' },
      no: { tokenId: `no-${id}`, price: 0.505, outcome: 'No' },
    },
    volume,
    liquidity,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AirdropOptimizer', () => {
  let optimizer: AirdropOptimizer;

  beforeEach(() => {
    optimizer = new AirdropOptimizer();
    eventBus.removeAllListeners();
  });

  // ─── Helper Functions ──────────────────────────────

  describe('calculateSpread', () => {
    it('should return 0 for perfectly priced market', () => {
      expect(calculateSpread(0.50, 0.50)).toBe(0);
    });

    it('should return positive spread when prices sum > 1', () => {
      // 0.52 + 0.51 = 1.03 => spread = 0.03
      const spread = calculateSpread(0.52, 0.51);
      expect(spread).toBeCloseTo(0.03);
    });

    it('should return positive spread when prices sum < 1', () => {
      // 0.48 + 0.49 = 0.97 => spread = 0.03
      const spread = calculateSpread(0.48, 0.49);
      expect(spread).toBeCloseTo(0.03);
    });
  });

  describe('calculateRoundTripCost', () => {
    it('should include spread cost and fees', () => {
      // $100 trade, 1% spread, 2% fees = $1 + $2 = $3
      const cost = calculateRoundTripCost(100, 0.01);
      expect(cost).toBe(3);
    });

    it('should return 0 for zero trade size', () => {
      expect(calculateRoundTripCost(0, 0.01)).toBe(0);
    });

    it('should return only fees when spread is 0', () => {
      // $100 trade, 0% spread, 2% fees = $0 + $2 = $2
      const cost = calculateRoundTripCost(100, 0);
      expect(cost).toBe(2);
    });
  });

  describe('calculateEfficiency', () => {
    it('should return volume/cost ratio', () => {
      // 200 volume / $3 cost = 66.67
      const eff = calculateEfficiency(200, 3);
      expect(eff).toBeCloseTo(66.67, 1);
    });

    it('should return 0 when cost is 0', () => {
      expect(calculateEfficiency(200, 0)).toBe(0);
    });

    it('should return 0 when cost is negative', () => {
      expect(calculateEfficiency(200, -1)).toBe(0);
    });
  });

  describe('estimateRank', () => {
    it('should rank top-100 for volume >= $100K', () => {
      expect(estimateRank(100_000)).toBe('top-100');
      expect(estimateRank(500_000)).toBe('top-100');
    });

    it('should rank top-500 for volume >= $50K', () => {
      expect(estimateRank(50_000)).toBe('top-500');
    });

    it('should rank top-2000 for volume >= $10K', () => {
      expect(estimateRank(10_000)).toBe('top-2000');
    });

    it('should rank unranked for volume < $1K', () => {
      expect(estimateRank(500)).toBe('unranked');
    });
  });

  // ─── Opportunity Finding ───────────────────────────

  describe('findVolumeOpportunities', () => {
    it('should find opportunities in tight-spread markets', () => {
      const markets = [makeTightSpreadMarket()];
      const opps = optimizer.findVolumeOpportunities(markets);
      expect(opps.length).toBeGreaterThan(0);
      expect(opps[0].spread).toBeLessThanOrEqual(MAX_SPREAD);
    });

    it('should filter out wide-spread markets', () => {
      const markets = [makeMarket({
        tokens: {
          yes: { tokenId: 'y', price: 0.55, outcome: 'Yes' },
          no: { tokenId: 'n', price: 0.50, outcome: 'No' },
        },
      })];
      // Spread = |0.55 + 0.50 - 1.0| = 0.05, which exceeds MAX_SPREAD (0.03)
      const opps = optimizer.findVolumeOpportunities(markets);
      expect(opps).toHaveLength(0);
    });

    it('should filter out low-volume markets', () => {
      const markets = [makeTightSpreadMarket('low-vol', 5000)]; // Below MIN_24H_VOLUME
      const opps = optimizer.findVolumeOpportunities(markets);
      expect(opps).toHaveLength(0);
    });

    it('should filter out low-liquidity markets', () => {
      const markets = [makeTightSpreadMarket('low-liq', 50000, 2000)]; // Below MIN_LIQUIDITY
      const opps = optimizer.findVolumeOpportunities(markets);
      expect(opps).toHaveLength(0);
    });

    it('should filter out closed markets', () => {
      const markets = [makeMarket({ closed: true })];
      const opps = optimizer.findVolumeOpportunities(markets);
      expect(opps).toHaveLength(0);
    });

    it('should filter out inactive markets', () => {
      const markets = [makeMarket({ active: false })];
      const opps = optimizer.findVolumeOpportunities(markets);
      expect(opps).toHaveLength(0);
    });

    it('should sort by efficiency descending', () => {
      const markets = [
        makeTightSpreadMarket('tight-1', 100000, 50000),
        makeTightSpreadMarket('tight-2', 50000, 20000),
      ];
      const opps = optimizer.findVolumeOpportunities(markets);
      if (opps.length >= 2) {
        expect(opps[0].efficiency).toBeGreaterThanOrEqual(opps[1].efficiency);
      }
    });

    it('should return empty for no qualifying markets', () => {
      const opps = optimizer.findVolumeOpportunities([]);
      expect(opps).toHaveLength(0);
    });
  });

  // ─── Volume Targeting ──────────────────────────────

  describe('calculateOptimalVolume', () => {
    it('should calculate daily budget as percentage of bankroll', () => {
      const target = optimizer.calculateOptimalVolume(1000);
      expect(target.dailyBudget).toBe(100); // 10% of $1000
    });

    it('should respect custom risk budget', () => {
      const target = optimizer.calculateOptimalVolume(1000, 50);
      expect(target.dailyBudget).toBe(50);
    });

    it('should calculate max trades per day', () => {
      const target = optimizer.calculateOptimalVolume(1000);
      // $100 budget / $1 max loss per trade = 100 trades
      expect(target.maxTradesPerDay).toBe(100);
    });

    it('should have positive volume per trade', () => {
      const target = optimizer.calculateOptimalVolume(500);
      expect(target.targetVolumePerTrade).toBeGreaterThan(0);
    });

    it('should have total target volume > 0', () => {
      const target = optimizer.calculateOptimalVolume(500);
      expect(target.totalTargetVolume).toBeGreaterThan(0);
    });
  });

  // ─── Signal Generation ─────────────────────────────

  describe('generateVolumeSignals', () => {
    it('should generate signals from opportunities', () => {
      const opps = optimizer.findVolumeOpportunities([makeTightSpreadMarket()]);
      const signals = optimizer.generateVolumeSignals(opps, 1000);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].strategy).toBe('airdrop_volume');
    });

    it('should emit signal:detected events', () => {
      const spy = vi.fn();
      eventBus.on('signal:detected', spy);

      const opps = optimizer.findVolumeOpportunities([makeTightSpreadMarket()]);
      optimizer.generateVolumeSignals(opps, 1000);
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0].strategy).toBe('airdrop_volume');
    });

    it('should respect daily budget limit', () => {
      // Very small bankroll = very small budget
      const opps = optimizer.findVolumeOpportunities([
        makeTightSpreadMarket('t1'),
        makeTightSpreadMarket('t2'),
        makeTightSpreadMarket('t3'),
      ]);
      // With $10 bankroll, budget is $1 -- should limit signals
      const signals = optimizer.generateVolumeSignals(opps, 10);
      // Total cost of signals should not exceed $1
      const totalCost = signals.reduce((sum, s) => {
        const opp = opps.find(o => o.marketId === s.marketId);
        return sum + (opp ? calculateRoundTripCost(s.suggestedSize, opp.spread) : 0);
      }, 0);
      expect(totalCost).toBeLessThanOrEqual(1.01); // Allow small rounding
    });

    it('should return empty when budget is exhausted', () => {
      // Record enough cost to exhaust budget
      optimizer.recordVolume(1000, 100); // $100 cost
      const opps = optimizer.findVolumeOpportunities([makeTightSpreadMarket()]);
      const signals = optimizer.generateVolumeSignals(opps, 500);
      // Budget is $50 but we already spent $100 -- should be empty
      expect(signals).toHaveLength(0);
    });

    it('should return empty when no opportunities', () => {
      const signals = optimizer.generateVolumeSignals([], 1000);
      expect(signals).toHaveLength(0);
    });
  });

  // ─── Volume Stats ──────────────────────────────────

  describe('volume stats tracking', () => {
    it('should start with zero stats', () => {
      const stats = optimizer.getVolumeStats();
      expect(stats.totalVolume).toBe(0);
      expect(stats.tradeCount).toBe(0);
      expect(stats.estimatedRank).toBe('unranked');
    });

    it('should track recorded volume', () => {
      optimizer.recordVolume(200, 3);
      optimizer.recordVolume(400, 5);
      const stats = optimizer.getVolumeStats();
      expect(stats.totalVolume).toBe(600);
      expect(stats.totalCost).toBe(8);
      expect(stats.tradeCount).toBe(2);
    });

    it('should calculate daily average', () => {
      optimizer.recordVolume(1000, 10);
      const stats = optimizer.getVolumeStats();
      expect(stats.dailyAvg).toBe(1000); // 1 day of data
    });

    it('should estimate rank based on total volume', () => {
      optimizer.recordVolume(60_000, 600);
      const stats = optimizer.getVolumeStats();
      expect(stats.estimatedRank).toBe('top-500');
    });
  });

  // ─── Budget Tracking ───────────────────────────────

  describe('remaining budget', () => {
    it('should return full budget when no trades made', () => {
      const remaining = optimizer.getRemainingBudget(1000);
      expect(remaining).toBe(100); // 10% of $1000
    });

    it('should subtract costs from budget', () => {
      optimizer.recordVolume(200, 5);
      const remaining = optimizer.getRemainingBudget(1000);
      expect(remaining).toBe(95); // $100 - $5
    });

    it('should not go below zero', () => {
      optimizer.recordVolume(1000, 200); // Way over budget
      const remaining = optimizer.getRemainingBudget(1000);
      expect(remaining).toBe(0);
    });
  });

  // ─── Config ────────────────────────────────────────

  describe('config', () => {
    it('should use defaults', () => {
      const config = optimizer.getConfig();
      expect(config.maxSpread).toBe(MAX_SPREAD);
      expect(config.maxLossPerTrade).toBe(MAX_LOSS_PER_TRADE);
      expect(config.dailyBudgetPercent).toBe(DAILY_VOLUME_BUDGET_PERCENT);
    });

    it('should accept custom config', () => {
      const custom = new AirdropOptimizer({
        maxSpread: 0.05,
        maxLossPerTrade: 2.0,
      });
      const config = custom.getConfig();
      expect(config.maxSpread).toBe(0.05);
      expect(config.maxLossPerTrade).toBe(2.0);
    });
  });

  // ─── Constants ─────────────────────────────────────

  describe('constants', () => {
    it('should have correct values', () => {
      expect(MAX_SPREAD).toBe(0.03);
      expect(MAX_LOSS_PER_TRADE).toBe(1.0);
      expect(DAILY_VOLUME_BUDGET_PERCENT).toBe(0.10);
      expect(MIN_24H_VOLUME).toBe(10_000);
      expect(MIN_LIQUIDITY).toBe(5_000);
      expect(TAKER_FEE_RATE).toBe(0.01);
      expect(ROUND_TRIP_FEE_RATE).toBe(0.02);
    });
  });
});
