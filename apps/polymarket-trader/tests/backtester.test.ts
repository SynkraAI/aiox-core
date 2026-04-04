import { describe, it, expect } from 'vitest';
import {
  Backtester,
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculateProfitFactor,
  calculateKelly,
} from '../src/engine/backtester.js';
import type {
  HistoricalMarket,
  StrategyFn,
  BacktestTrade,
} from '../src/engine/backtester.js';
import type { Market, TradeSignal } from '../src/types/index.js';
import { DEFAULT_RISK_LIMITS } from '../src/config/defaults.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: 'test-market-1',
    question: 'Will BTC exceed $100k?',
    slug: 'btc-100k',
    vertical: 'crypto',
    endDate: '2026-06-01',
    active: true,
    closed: false,
    tokens: {
      yes: { tokenId: 'yes-1', price: 0.55, outcome: 'YES' },
      no: { tokenId: 'no-1', price: 0.45, outcome: 'NO' },
    },
    volume: 100_000,
    liquidity: 50_000,
    lastPrice: 0.55,
    ...overrides,
  };
}

function makeHistoricalMarket(
  outcome: 'YES' | 'NO',
  prices: number[],
  marketOverrides: Partial<Market> = {},
): HistoricalMarket {
  const baseDate = new Date('2026-01-01T00:00:00Z');
  return {
    market: makeMarket(marketOverrides),
    priceHistory: prices.map((price, i) => ({
      timestamp: new Date(baseDate.getTime() + i * 86_400_000),
      price,
    })),
    outcome,
    resolutionDate: new Date(baseDate.getTime() + prices.length * 86_400_000),
  };
}

/** Strategy that always buys YES with a fixed 15% edge. */
const alwaysBuyYes: StrategyFn = (market, currentPrice, _days): TradeSignal => ({
  marketId: market.id,
  vertical: market.vertical,
  strategy: 'crypto_sentiment',
  side: 'YES',
  modelProbability: currentPrice + 0.15,
  marketProbability: currentPrice,
  edge: 0.15,
  confidence: 0.80,
  suggestedSize: 10,
  reasoning: 'Test: always buy YES',
  timestamp: new Date(),
});

/** Strategy that never fires. */
const neverTrade: StrategyFn = () => null;

function makeDeterministicBacktester(bankroll = 500): Backtester {
  return new Backtester({
    bankroll,
    deterministicSlippage: true,
    takerFee: 0.01,
    slippageRange: [0.01, 0.01], // Fixed 1% slippage.
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Backtester', () => {
  describe('all-winning trades', () => {
    it('should produce 100% win rate and positive P&L', () => {
      const bt = makeDeterministicBacktester();
      const markets = [
        makeHistoricalMarket('YES', [0.50, 0.55, 0.60]),
        makeHistoricalMarket('YES', [0.45, 0.50]),
        makeHistoricalMarket('YES', [0.40, 0.42, 0.44]),
      ];

      const result = bt.run('crypto_sentiment', alwaysBuyYes, markets);

      expect(result.totalTrades).toBe(3);
      expect(result.wins).toBe(3);
      expect(result.losses).toBe(0);
      expect(result.winRate).toBe(1);
      expect(result.totalPnl).toBeGreaterThan(0);
    });
  });

  describe('all-losing trades', () => {
    it('should produce 0% win rate and negative P&L', () => {
      const bt = makeDeterministicBacktester();
      // Outcome is NO but strategy always buys YES.
      const markets = [
        makeHistoricalMarket('NO', [0.50, 0.55, 0.60]),
        makeHistoricalMarket('NO', [0.45, 0.50]),
      ];

      const result = bt.run('crypto_sentiment', alwaysBuyYes, markets);

      expect(result.totalTrades).toBe(2);
      expect(result.wins).toBe(0);
      expect(result.losses).toBe(2);
      expect(result.winRate).toBe(0);
      expect(result.totalPnl).toBeLessThan(0);
    });
  });

  describe('mixed results', () => {
    it('should calculate correct win rate for mixed outcomes', () => {
      const bt = makeDeterministicBacktester();
      const markets = [
        makeHistoricalMarket('YES', [0.50, 0.55]),
        makeHistoricalMarket('NO', [0.50, 0.55]),
        makeHistoricalMarket('YES', [0.50, 0.55]),
        makeHistoricalMarket('NO', [0.50, 0.55]),
      ];

      const result = bt.run('crypto_sentiment', alwaysBuyYes, markets);

      expect(result.totalTrades).toBe(4);
      expect(result.wins).toBe(2);
      expect(result.losses).toBe(2);
      expect(result.winRate).toBeCloseTo(0.5, 2);
    });
  });

  describe('max drawdown', () => {
    it('should calculate peak-to-trough drawdown correctly', () => {
      // Sequence: win, win, loss, loss, loss → large drawdown after peak.
      const bt = makeDeterministicBacktester();
      const markets = [
        makeHistoricalMarket('YES', [0.50]),
        makeHistoricalMarket('YES', [0.50]),
        makeHistoricalMarket('NO', [0.50]),
        makeHistoricalMarket('NO', [0.50]),
        makeHistoricalMarket('NO', [0.50]),
      ];

      const result = bt.run('crypto_sentiment', alwaysBuyYes, markets);

      expect(result.maxDrawdown).toBeGreaterThan(0);
      // After 2 wins, the cumulative peak is positive. Then 3 consecutive
      // losses push it down — drawdown must exceed the P&L of at least one trade.
      expect(result.maxDrawdown).toBeGreaterThanOrEqual(Math.abs(result.trades[2].pnl));
    });

    it('pure helper: calculateMaxDrawdown with known series', () => {
      // +10, +5, -20, +3 → peak = 15, trough = 15-20 = -5, dd = 20
      expect(calculateMaxDrawdown([10, 5, -20, 3])).toBe(20);
    });

    it('pure helper: calculateMaxDrawdown with empty array', () => {
      expect(calculateMaxDrawdown([])).toBe(0);
    });
  });

  describe('profit factor', () => {
    it('should be > 1 for a profitable strategy', () => {
      const bt = makeDeterministicBacktester();
      // 3 wins, 1 loss → should be profitable overall.
      const markets = [
        makeHistoricalMarket('YES', [0.50]),
        makeHistoricalMarket('YES', [0.50]),
        makeHistoricalMarket('YES', [0.50]),
        makeHistoricalMarket('NO', [0.50]),
      ];

      const result = bt.run('crypto_sentiment', alwaysBuyYes, markets);

      expect(result.profitFactor).toBeGreaterThan(1);
    });

    it('pure helper: calculateProfitFactor correctly', () => {
      const trades: BacktestTrade[] = [
        { marketId: 'a', vertical: 'crypto', side: 'YES', entryPrice: 0.5, exitPrice: 1, size: 10, pnl: 5, edge: 0.1, correct: true },
        { marketId: 'b', vertical: 'crypto', side: 'YES', entryPrice: 0.5, exitPrice: 0, size: 10, pnl: -5, edge: 0.1, correct: false },
        { marketId: 'c', vertical: 'crypto', side: 'YES', entryPrice: 0.5, exitPrice: 1, size: 10, pnl: 3, edge: 0.1, correct: true },
      ];
      // gross profit = 8, gross loss = 5 → factor = 1.6
      expect(calculateProfitFactor(trades)).toBeCloseTo(1.6, 2);
    });
  });

  describe('fee deduction', () => {
    it('should deduct taker fees from P&L', () => {
      const bt = makeDeterministicBacktester();
      const markets = [makeHistoricalMarket('YES', [0.50])];

      const result = bt.run('crypto_sentiment', alwaysBuyYes, markets);
      const trade = result.trades[0];

      // Without fee the raw PnL would be (1.0 - entryPrice) * size.
      // With 1% fee: pnl = rawPnl - size * 0.01.
      const rawPnl = (trade.exitPrice - trade.entryPrice) * trade.size;
      const expectedFee = trade.size * 0.01;
      const expectedPnl = Math.round((rawPnl - expectedFee) * 100) / 100;

      expect(trade.pnl).toBe(expectedPnl);
    });
  });

  describe('Kelly position sizing', () => {
    it('should respect Kelly fraction limits', () => {
      const bt = makeDeterministicBacktester(500);
      const markets = [makeHistoricalMarket('YES', [0.50])];

      const result = bt.run('crypto_sentiment', alwaysBuyYes, markets);
      const trade = result.trades[0];

      // Kelly for 0.65 model prob vs 0.50 market:
      // optimal = (0.65-0.50)/(1-0.50) = 0.30
      // adjusted = 0.30 * 0.15 = 0.045
      // size = min(500*0.045, 50, 500*0.05) = min(22.5, 50, 25) = 22.5
      const kelly = calculateKelly(0.65, 0.50, 500, DEFAULT_RISK_LIMITS);
      expect(trade.size).toBe(kelly.suggestedSize);
      expect(trade.size).toBeLessThanOrEqual(DEFAULT_RISK_LIMITS.maxPositionSize);
      expect(trade.size).toBeLessThanOrEqual(500 * DEFAULT_RISK_LIMITS.maxBankrollPercent);
    });

    it('pure helper: calculateKelly returns 0 for no edge', () => {
      const result = calculateKelly(0.50, 0.50, 1000, DEFAULT_RISK_LIMITS);
      expect(result.suggestedSize).toBe(0);
    });

    it('pure helper: calculateKelly caps at maxPositionSize', () => {
      const result = calculateKelly(0.95, 0.20, 100_000, DEFAULT_RISK_LIMITS);
      expect(result.suggestedSize).toBeLessThanOrEqual(DEFAULT_RISK_LIMITS.maxPositionSize);
    });
  });

  describe('empty market data', () => {
    it('should handle empty historical markets gracefully', () => {
      const bt = makeDeterministicBacktester();
      const result = bt.run('crypto_sentiment', alwaysBuyYes, []);

      expect(result.totalTrades).toBe(0);
      expect(result.wins).toBe(0);
      expect(result.losses).toBe(0);
      expect(result.winRate).toBe(0);
      expect(result.totalPnl).toBe(0);
      expect(result.maxDrawdown).toBe(0);
      expect(result.sharpeRatio).toBe(0);
      expect(result.profitFactor).toBe(0);
      expect(result.trades).toEqual([]);
    });

    it('should handle markets with empty price history', () => {
      const bt = makeDeterministicBacktester();
      const market = makeHistoricalMarket('YES', []);
      const result = bt.run('crypto_sentiment', alwaysBuyYes, [market]);

      expect(result.totalTrades).toBe(0);
    });

    it('should handle strategy that never trades', () => {
      const bt = makeDeterministicBacktester();
      const markets = [
        makeHistoricalMarket('YES', [0.50, 0.55]),
        makeHistoricalMarket('NO', [0.40, 0.45]),
      ];

      const result = bt.run('crypto_sentiment', neverTrade, markets);

      expect(result.totalTrades).toBe(0);
      expect(result.totalPnl).toBe(0);
    });
  });

  describe('Sharpe Ratio', () => {
    it('pure helper: returns 0 for insufficient data', () => {
      expect(calculateSharpeRatio([])).toBe(0);
      expect(calculateSharpeRatio([0.05])).toBe(0);
    });

    it('pure helper: returns very high value for near-zero-variance positive returns', () => {
      // Identical floats can still produce tiny floating-point variance,
      // so we just assert the Sharpe is extremely large (effectively infinite).
      const sharpe = calculateSharpeRatio([0.05, 0.05, 0.05]);
      expect(sharpe).toBeGreaterThan(1_000_000);
    });

    it('should return positive Sharpe for consistently winning strategy', () => {
      const bt = makeDeterministicBacktester();
      const markets = Array.from({ length: 10 }, () =>
        makeHistoricalMarket('YES', [0.50]),
      );

      const result = bt.run('crypto_sentiment', alwaysBuyYes, markets);

      // All wins → all positive returns → positive Sharpe (or Infinity if identical).
      expect(result.sharpeRatio).toBeGreaterThan(0);
    });
  });
});
