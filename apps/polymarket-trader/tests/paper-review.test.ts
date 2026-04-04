import { describe, it, expect } from 'vitest';
import { PaperTradingReviewer } from '../src/engine/paper-review.js';
import type { TradeExperience } from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTrade(overrides: Partial<TradeExperience> = {}): TradeExperience {
  return {
    id: `t-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date('2026-03-01'),
    marketId: 'mkt-1',
    vertical: 'weather',
    strategy: 'weather_model',
    marketQuestion: 'Will it rain?',
    signalConfidence: 0.8,
    modelProbability: 0.7,
    marketProbability: 0.55,
    edgeDetected: 0.15,
    positionSize: 20,
    kellyFraction: 0.04,
    side: 'YES',
    entryPrice: 0.55,
    slippage: 0.005,
    gasFee: 0.01,
    takerFee: 0.2,
    fillTimeMs: 50,
    outcome: 'WIN',
    exitPrice: 1.0,
    pnl: 8.0,
    lesson: '',
    tags: ['paper-trade'],
    similarPastTrades: [],
    metadata: {},
    ...overrides,
  };
}

function makeTradeSet(options: {
  count: number;
  winRate: number;
  startDate: Date;
  avgPnlWin?: number;
  avgPnlLoss?: number;
  verticals?: string[];
  strategies?: string[];
}): TradeExperience[] {
  const trades: TradeExperience[] = [];
  const {
    count, winRate, startDate,
    avgPnlWin = 10, avgPnlLoss = -6,
    verticals = ['weather', 'crypto'],
    strategies = ['weather_model', 'crypto_sentiment'],
  } = options;

  for (let i = 0; i < count; i++) {
    const isWin = i / count < winRate;
    const day = Math.floor(i / (count / 40)); // spread across ~40 days
    const date = new Date(startDate.getTime() + day * 86_400_000);
    trades.push(makeTrade({
      id: `t-${i}`,
      timestamp: date,
      marketId: `mkt-${i}`,
      vertical: verticals[i % verticals.length] as 'weather' | 'crypto',
      strategy: strategies[i % strategies.length] as 'weather_model' | 'crypto_sentiment',
      outcome: isWin ? 'WIN' : 'LOSS',
      pnl: isWin ? avgPnlWin : avgPnlLoss,
    }));
  }
  return trades;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PaperTradingReviewer', () => {
  const reviewer = new PaperTradingReviewer();

  describe('analyze — basic metrics', () => {
    it('should handle empty trades array', () => {
      const report = reviewer.analyze([]);
      expect(report.totalTrades).toBe(0);
      expect(report.winRate).toBe(0);
      expect(report.totalPnl).toBe(0);
      expect(report.dailyPnl).toHaveLength(0);
    });

    it('should calculate correct win/loss counts', () => {
      const trades = [
        makeTrade({ outcome: 'WIN', pnl: 10 }),
        makeTrade({ outcome: 'WIN', pnl: 5 }),
        makeTrade({ outcome: 'LOSS', pnl: -3 }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.wins).toBe(2);
      expect(report.losses).toBe(1);
      expect(report.totalTrades).toBe(3);
    });

    it('should calculate correct win rate', () => {
      const trades = [
        makeTrade({ outcome: 'WIN' }),
        makeTrade({ outcome: 'WIN' }),
        makeTrade({ outcome: 'LOSS' }),
        makeTrade({ outcome: 'WIN' }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.winRate).toBeCloseTo(0.75, 2);
    });

    it('should exclude PENDING trades', () => {
      const trades = [
        makeTrade({ outcome: 'WIN', pnl: 10 }),
        makeTrade({ outcome: 'PENDING', pnl: 0 }),
        makeTrade({ outcome: 'LOSS', pnl: -5 }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.totalTrades).toBe(2);
      expect(report.totalPnl).toBe(5);
    });

    it('should calculate correct total and average P&L', () => {
      const trades = [
        makeTrade({ outcome: 'WIN', pnl: 10 }),
        makeTrade({ outcome: 'WIN', pnl: 5 }),
        makeTrade({ outcome: 'LOSS', pnl: -3 }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.totalPnl).toBe(12);
      expect(report.avgPnlPerTrade).toBe(4);
    });

    it('should identify best and worst trades', () => {
      const trades = [
        makeTrade({ marketId: 'best', outcome: 'WIN', pnl: 50 }),
        makeTrade({ marketId: 'mid', outcome: 'WIN', pnl: 5 }),
        makeTrade({ marketId: 'worst', outcome: 'LOSS', pnl: -30 }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.bestTrade.marketId).toBe('best');
      expect(report.bestTrade.pnl).toBe(50);
      expect(report.worstTrade.marketId).toBe('worst');
      expect(report.worstTrade.pnl).toBe(-30);
    });

    it('should calculate period days correctly', () => {
      const trades = [
        makeTrade({ timestamp: new Date('2026-03-01'), outcome: 'WIN' }),
        makeTrade({ timestamp: new Date('2026-03-15'), outcome: 'WIN' }),
        makeTrade({ timestamp: new Date('2026-03-31'), outcome: 'LOSS' }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.period.days).toBe(30);
    });
  });

  describe('analyze — advanced metrics', () => {
    it('should compute Sharpe ratio from daily returns', () => {
      const trades = makeTradeSet({
        count: 100, winRate: 0.65,
        startDate: new Date('2026-01-01'),
      });
      const report = reviewer.analyze(trades);
      // With 65% win rate and +10/-6 pnl, Sharpe should be positive
      expect(report.sharpeRatio).toBeGreaterThan(0);
    });

    it('should compute max drawdown as percentage of peak', () => {
      // Wins first, then losses to create clear drawdown
      const trades = [
        makeTrade({ timestamp: new Date('2026-01-01'), outcome: 'WIN', pnl: 100, marketId: 'a' }),
        makeTrade({ timestamp: new Date('2026-01-02'), outcome: 'WIN', pnl: 100, marketId: 'b' }),
        makeTrade({ timestamp: new Date('2026-01-03'), outcome: 'LOSS', pnl: -50, marketId: 'c' }),
        makeTrade({ timestamp: new Date('2026-01-04'), outcome: 'LOSS', pnl: -50, marketId: 'd' }),
      ];
      const report = reviewer.analyze(trades);
      // Peak = 200, trough = 100, drawdown = 100/200 = 50%
      expect(report.maxDrawdown).toBeCloseTo(0.50, 2);
    });

    it('should compute profit factor (gross wins / gross losses)', () => {
      const trades = [
        makeTrade({ outcome: 'WIN', pnl: 30 }),
        makeTrade({ outcome: 'WIN', pnl: 20 }),
        makeTrade({ outcome: 'LOSS', pnl: -10 }),
      ];
      const report = reviewer.analyze(trades);
      // Gross wins = 50, gross losses = 10, PF = 5.0
      expect(report.profitFactor).toBe(5.0);
    });

    it('should handle profit factor with no losses', () => {
      const trades = [
        makeTrade({ outcome: 'WIN', pnl: 10 }),
        makeTrade({ outcome: 'WIN', pnl: 20 }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.profitFactor).toBe(Infinity);
    });
  });

  describe('analyze — streaks', () => {
    it('should compute max consecutive wins', () => {
      const trades = [
        makeTrade({ outcome: 'WIN', timestamp: new Date('2026-01-01') }),
        makeTrade({ outcome: 'WIN', timestamp: new Date('2026-01-02') }),
        makeTrade({ outcome: 'WIN', timestamp: new Date('2026-01-03') }),
        makeTrade({ outcome: 'LOSS', timestamp: new Date('2026-01-04') }),
        makeTrade({ outcome: 'WIN', timestamp: new Date('2026-01-05') }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.consecutiveWins).toBe(3);
    });

    it('should compute max consecutive losses', () => {
      const trades = [
        makeTrade({ outcome: 'WIN', timestamp: new Date('2026-01-01') }),
        makeTrade({ outcome: 'LOSS', pnl: -5, timestamp: new Date('2026-01-02') }),
        makeTrade({ outcome: 'LOSS', pnl: -5, timestamp: new Date('2026-01-03') }),
        makeTrade({ outcome: 'LOSS', pnl: -5, timestamp: new Date('2026-01-04') }),
        makeTrade({ outcome: 'LOSS', pnl: -5, timestamp: new Date('2026-01-05') }),
        makeTrade({ outcome: 'WIN', timestamp: new Date('2026-01-06') }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.consecutiveLosses).toBe(4);
    });
  });

  describe('analyze — edge persistence', () => {
    it('should flag consistent edge across 3 periods', () => {
      // Build trades with interleaved wins/losses for uniform 66% WR
      const trades: TradeExperience[] = [];
      for (let i = 0; i < 90; i++) {
        const isWin = i % 3 !== 0; // 2/3 = 66.7% win rate uniformly
        trades.push(makeTrade({
          id: `t-${i}`,
          timestamp: new Date(new Date('2026-01-01').getTime() + i * 86_400_000),
          marketId: `mkt-${i}`,
          outcome: isWin ? 'WIN' : 'LOSS',
          pnl: isWin ? 10 : -5,
        }));
      }
      const report = reviewer.analyze(trades);
      // Each third should have > 50% WR
      expect(report.edgePersistence.period1WR).toBeGreaterThan(0.50);
      expect(report.edgePersistence.period2WR).toBeGreaterThan(0.50);
      expect(report.edgePersistence.period3WR).toBeGreaterThan(0.50);
      expect(report.edgePersistence.isConsistent).toBe(true);
    });

    it('should flag inconsistent edge when one period is bad', () => {
      // Good first 2/3, bad last 1/3
      const trades: TradeExperience[] = [];
      for (let i = 0; i < 60; i++) {
        trades.push(makeTrade({
          id: `t-${i}`,
          timestamp: new Date(new Date('2026-01-01').getTime() + i * 86_400_000),
          outcome: i % 3 === 0 ? 'LOSS' : 'WIN',
          pnl: i % 3 === 0 ? -5 : 10,
        }));
      }
      // Make last 20 all losses
      for (let i = 60; i < 90; i++) {
        trades.push(makeTrade({
          id: `t-${i}`,
          timestamp: new Date(new Date('2026-01-01').getTime() + i * 86_400_000),
          outcome: 'LOSS',
          pnl: -5,
        }));
      }
      const report = reviewer.analyze(trades);
      expect(report.edgePersistence.period3WR).toBe(0);
      expect(report.edgePersistence.isConsistent).toBe(false);
    });
  });

  describe('analyze — breakdowns', () => {
    it('should compute per-vertical breakdown', () => {
      const trades = [
        makeTrade({ vertical: 'weather', outcome: 'WIN', pnl: 10, timestamp: new Date('2026-01-01') }),
        makeTrade({ vertical: 'weather', outcome: 'LOSS', pnl: -5, timestamp: new Date('2026-01-02') }),
        makeTrade({ vertical: 'crypto', outcome: 'WIN', pnl: 15, timestamp: new Date('2026-01-03') }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.byVertical.weather.trades).toBe(2);
      expect(report.byVertical.weather.winRate).toBe(0.5);
      expect(report.byVertical.weather.pnl).toBe(5);
      expect(report.byVertical.crypto.trades).toBe(1);
      expect(report.byVertical.crypto.winRate).toBe(1);
    });

    it('should compute per-strategy breakdown', () => {
      const trades = [
        makeTrade({ strategy: 'info_arb', outcome: 'WIN', pnl: 10, timestamp: new Date('2026-01-01') }),
        makeTrade({ strategy: 'info_arb', outcome: 'WIN', pnl: 8, timestamp: new Date('2026-01-02') }),
        makeTrade({ strategy: 'weather_model', outcome: 'LOSS', pnl: -12, timestamp: new Date('2026-01-03') }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.byStrategy.info_arb.trades).toBe(2);
      expect(report.byStrategy.info_arb.winRate).toBe(1);
      expect(report.byStrategy.info_arb.pnl).toBe(18);
      expect(report.byStrategy.weather_model.trades).toBe(1);
    });
  });

  describe('analyze — daily P&L series', () => {
    it('should aggregate P&L by date', () => {
      const trades = [
        makeTrade({ timestamp: new Date('2026-01-01'), pnl: 10, outcome: 'WIN' }),
        makeTrade({ timestamp: new Date('2026-01-01'), pnl: -3, outcome: 'LOSS' }),
        makeTrade({ timestamp: new Date('2026-01-02'), pnl: 5, outcome: 'WIN' }),
      ];
      const report = reviewer.analyze(trades);
      expect(report.dailyPnl).toHaveLength(2);
      expect(report.dailyPnl[0].date).toBe('2026-01-01');
      expect(report.dailyPnl[0].pnl).toBe(7);
      expect(report.dailyPnl[0].cumulative).toBe(7);
      expect(report.dailyPnl[1].cumulative).toBe(12);
    });
  });

  describe('meetsMinimumCriteria', () => {
    it('should pass when all criteria met', () => {
      const trades = makeTradeSet({
        count: 600, winRate: 0.65,
        startDate: new Date('2026-01-01'),
        avgPnlWin: 15, avgPnlLoss: -6,
      });
      const report = reviewer.analyze(trades);
      // Override sharpe/drawdown for controlled test
      report.sharpeRatio = 1.5;
      report.maxDrawdown = 0.10;
      report.profitFactor = 2.5;
      report.edgePersistence.isConsistent = true;

      const result = reviewer.meetsMinimumCriteria(report);
      expect(result.passes).toBe(true);
      expect(result.failures).toHaveLength(0);
    });

    it('should fail with insufficient duration', () => {
      const report = reviewer.analyze([
        makeTrade({ timestamp: new Date('2026-03-01'), outcome: 'WIN', pnl: 10 }),
        makeTrade({ timestamp: new Date('2026-03-05'), outcome: 'WIN', pnl: 10 }),
      ]);
      const result = reviewer.meetsMinimumCriteria(report);
      expect(result.passes).toBe(false);
      expect(result.failures.some(f => f.includes('days'))).toBe(true);
    });

    it('should fail with insufficient trades', () => {
      const trades = makeTradeSet({
        count: 100, winRate: 0.7,
        startDate: new Date('2026-01-01'),
      });
      const report = reviewer.analyze(trades);
      const result = reviewer.meetsMinimumCriteria(report);
      expect(result.passes).toBe(false);
      expect(result.failures.some(f => f.includes('trades'))).toBe(true);
    });

    it('should fail with low win rate', () => {
      const trades = makeTradeSet({
        count: 600, winRate: 0.45,
        startDate: new Date('2026-01-01'),
      });
      const report = reviewer.analyze(trades);
      const result = reviewer.meetsMinimumCriteria(report);
      expect(result.passes).toBe(false);
      expect(result.failures.some(f => f.includes('Win rate'))).toBe(true);
    });

    it('should fail with negative total P&L', () => {
      const trades = makeTradeSet({
        count: 600, winRate: 0.65,
        startDate: new Date('2026-01-01'),
        avgPnlWin: 3, avgPnlLoss: -10,
      });
      const report = reviewer.analyze(trades);
      if (report.totalPnl > 0) {
        report.totalPnl = -50; // force negative
      }
      const result = reviewer.meetsMinimumCriteria(report);
      expect(result.passes).toBe(false);
      expect(result.failures.some(f => f.includes('P&L'))).toBe(true);
    });
  });

  describe('generateSummary', () => {
    it('should produce readable summary text', () => {
      const trades = makeTradeSet({
        count: 100, winRate: 0.65,
        startDate: new Date('2026-01-01'),
      });
      const report = reviewer.analyze(trades);
      const summary = reviewer.generateSummary(report);

      expect(summary).toContain('Paper Trading Review');
      expect(summary).toContain('Win Rate:');
      expect(summary).toContain('Sharpe Ratio:');
      expect(summary).toContain('Max Drawdown:');
      expect(summary).toContain('Edge Persistence');
      expect(summary).toContain('By Vertical');
      expect(summary).toContain('By Strategy');
    });

    it('should handle empty report', () => {
      const report = reviewer.analyze([]);
      const summary = reviewer.generateSummary(report);
      expect(summary).toContain('Total Trades: 0');
    });
  });

  describe('analyze — single trade', () => {
    it('should handle a single winning trade', () => {
      const trades = [makeTrade({ outcome: 'WIN', pnl: 10 })];
      const report = reviewer.analyze(trades);
      expect(report.totalTrades).toBe(1);
      expect(report.winRate).toBe(1);
      expect(report.consecutiveWins).toBe(1);
      expect(report.consecutiveLosses).toBe(0);
    });

    it('should handle a single losing trade', () => {
      const trades = [makeTrade({ outcome: 'LOSS', pnl: -5 })];
      const report = reviewer.analyze(trades);
      expect(report.totalTrades).toBe(1);
      expect(report.winRate).toBe(0);
      expect(report.consecutiveWins).toBe(0);
      expect(report.consecutiveLosses).toBe(1);
    });
  });
});
