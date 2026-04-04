import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CrossPlatformArbStrategy,
  extractEntities,
  entityOverlap,
  endDatesClose,
  calculateNetProfit,
  calculateProfitPercent,
  calculateCrossPlatformNetProfit,
  calculateCrossPlatformProfitPercent,
  TAKER_FEE_RATE,
  TOTAL_FEE_RATE,
  KALSHI_FEE_RATE,
  CROSS_PLATFORM_FEE_RATE,
  CROSS_PLATFORM_MIN_PROFIT,
  CROSS_PLATFORM_BASE_CONFIDENCE,
  BINARY_PAYOUT,
  type ArbOpportunity,
} from '../src/strategies/cross-platform-arb.js';
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
 * Create a market with an intra-market arb: YES + NO < 1.00.
 * With yes=0.40, no=0.52 => total=0.92 => gross profit=0.08
 * Net after 2% fees on 0.92 = 0.0184 => profit = 0.08 - 0.0184 = 0.0616
 * profitPercent = 0.0616 / 0.92 * 100 ~ 6.70%
 */
function makeArbMarket(yesPrice = 0.40, noPrice = 0.52): Market {
  return makeMarket({
    id: 'arb-market',
    tokens: {
      yes: { tokenId: 'yes-1', price: yesPrice, outcome: 'Yes' },
      no: { tokenId: 'no-1', price: noPrice, outcome: 'No' },
    },
  });
}

// ---------------------------------------------------------------------------
// Helper function tests
// ---------------------------------------------------------------------------

describe('extractEntities', () => {
  it('should extract meaningful tokens from a question', () => {
    const entities = extractEntities('Will BTC be above $100K by end of April?');
    expect(entities).toContain('btc');
    expect(entities).toContain('$100k');
    expect(entities).not.toContain('will');
    expect(entities).not.toContain('be');
  });

  it('should strip stop words', () => {
    const entities = extractEntities('Will the price of ETH be above $5000?');
    expect(entities).not.toContain('will');
    expect(entities).not.toContain('the');
    expect(entities).not.toContain('of');
    expect(entities).not.toContain('be');
    expect(entities).toContain('eth');
  });
});

describe('entityOverlap', () => {
  it('should return 1.0 for identical sets', () => {
    expect(entityOverlap(['btc', '$100k'], ['btc', '$100k'])).toBe(1.0);
  });

  it('should return 0.0 for disjoint sets', () => {
    expect(entityOverlap(['btc', '$100k'], ['eth', '$5000'])).toBe(0.0);
  });

  it('should return correct Jaccard for partial overlap', () => {
    // intersection = {btc}, union = {btc, $100k, $50k} => 1/3
    const overlap = entityOverlap(['btc', '$100k'], ['btc', '$50k']);
    expect(overlap).toBeCloseTo(1 / 3, 5);
  });

  it('should return 0 for empty sets', () => {
    expect(entityOverlap([], [])).toBe(0);
  });
});

describe('endDatesClose', () => {
  it('should return true for same date', () => {
    expect(endDatesClose('2026-04-30', '2026-04-30')).toBe(true);
  });

  it('should return true within 3 days', () => {
    expect(endDatesClose('2026-04-28', '2026-04-30')).toBe(true);
  });

  it('should return false for dates more than 3 days apart', () => {
    expect(endDatesClose('2026-04-20', '2026-04-30')).toBe(false);
  });

  it('should return false for invalid dates', () => {
    expect(endDatesClose('invalid', '2026-04-30')).toBe(false);
  });
});

describe('calculateNetProfit', () => {
  it('should subtract cost and fees from payout', () => {
    // cost=0.92, payout=1.00, fees=0.92*0.02=0.0184
    // net = 1.00 - 0.92 - 0.0184 = 0.0616
    const net = calculateNetProfit(0.92, 1.00);
    expect(net).toBeCloseTo(0.0616, 4);
  });

  it('should return negative for unprofitable trades', () => {
    // cost=1.00, payout=1.00, fees=0.02 => net=-0.02
    const net = calculateNetProfit(1.00, 1.00);
    expect(net).toBeLessThan(0);
  });
});

describe('calculateProfitPercent', () => {
  it('should return correct percentage', () => {
    // cost=0.92, net=0.0616 => 0.0616/0.92*100 ~ 6.696%
    const pct = calculateProfitPercent(0.92, 1.00);
    expect(pct).toBeCloseTo(6.696, 1);
  });

  it('should return 0 for zero cost', () => {
    expect(calculateProfitPercent(0, 1.00)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Intra-market arb tests
// ---------------------------------------------------------------------------

describe('CrossPlatformArbStrategy - intra-market arb', () => {
  const strategy = new CrossPlatformArbStrategy();

  it('should detect arb when YES + NO < 1.00', () => {
    const market = makeArbMarket(0.40, 0.52); // total = 0.92
    const result = strategy.checkIntraMarketArb(market);

    expect(result).not.toBeNull();
    expect(result!.type).toBe('intra_market');
    expect(result!.markets).toEqual(['arb-market']);
    expect(result!.totalCost).toBeCloseTo(0.92, 4);
    expect(result!.guaranteedPayout).toBe(1.00);
    expect(result!.profitPercent).toBeGreaterThan(0);
  });

  it('should return null when YES + NO = 1.00', () => {
    const market = makeArbMarket(0.50, 0.50); // total = 1.00
    const result = strategy.checkIntraMarketArb(market);
    expect(result).toBeNull();
  });

  it('should return null when YES + NO > 1.00', () => {
    const market = makeArbMarket(0.55, 0.50); // total = 1.05
    const result = strategy.checkIntraMarketArb(market);
    expect(result).toBeNull();
  });

  it('should return null when arb exists but is below fee threshold', () => {
    // total = 0.99 => gross profit = 0.01, fees = 0.99*0.02 = 0.0198
    // net = 0.01 - 0.0198 = -0.0098 => negative after fees
    const market = makeArbMarket(0.49, 0.50);
    const result = strategy.checkIntraMarketArb(market);
    expect(result).toBeNull();
  });

  it('should calculate correct profit percent accounting for fees', () => {
    const market = makeArbMarket(0.40, 0.52); // total = 0.92
    const result = strategy.checkIntraMarketArb(market)!;

    // gross = 1.00 - 0.92 = 0.08
    // fees = 0.92 * 0.02 = 0.0184
    // net = 0.08 - 0.0184 = 0.0616
    // percent = 0.0616 / 0.92 * 100 = 6.696%
    expect(result.profitPercent).toBeCloseTo(6.696, 1);
  });

  it('should return null for inactive markets', () => {
    const market = makeArbMarket(0.30, 0.30);
    market.active = false;
    expect(strategy.checkIntraMarketArb(market)).toBeNull();
  });

  it('should return null for closed markets', () => {
    const market = makeArbMarket(0.30, 0.30);
    market.closed = true;
    expect(strategy.checkIntraMarketArb(market)).toBeNull();
  });

  it('should respect custom minArbPercent', () => {
    const strict = new CrossPlatformArbStrategy({ minArbPercent: 10 });
    // 0.92 total => ~6.7% profit => below 10% threshold
    const market = makeArbMarket(0.40, 0.52);
    expect(strict.checkIntraMarketArb(market)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cross-market arb tests
// ---------------------------------------------------------------------------

describe('CrossPlatformArbStrategy - cross-market arb', () => {
  const strategy = new CrossPlatformArbStrategy();

  it('should detect arb between matching markets with different prices', () => {
    const m1 = makeMarket({
      id: 'market-a',
      question: 'Will BTC be above $100K by end of April 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y1', price: 0.35, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.65, outcome: 'No' },
      },
    });
    const m2 = makeMarket({
      id: 'market-b',
      question: 'Will BTC be above $100K by April 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y2', price: 0.55, outcome: 'Yes' },
        no: { tokenId: 'n2', price: 0.45, outcome: 'No' },
      },
    });

    // Best combo: buy YES on m1 (0.35) + buy NO on m2 (0.45) = 0.80
    const result = strategy.checkCrossMarketArb(m1, m2);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('cross_market');
    expect(result!.markets).toContain('market-a');
    expect(result!.markets).toContain('market-b');
    expect(result!.totalCost).toBeCloseTo(0.80, 4);
    expect(result!.profitPercent).toBeGreaterThan(0);
  });

  it('should reject non-matching markets (low entity overlap)', () => {
    const m1 = makeMarket({
      id: 'market-a',
      question: 'Will BTC be above $100K by end of April?',
    });
    const m2 = makeMarket({
      id: 'market-b',
      question: 'Will the Lakers win the NBA Championship 2026?',
    });

    expect(strategy.checkCrossMarketArb(m1, m2)).toBeNull();
  });

  it('should reject matching questions with distant end dates', () => {
    const m1 = makeMarket({
      id: 'market-a',
      question: 'Will BTC be above $100K by April 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y1', price: 0.35, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.65, outcome: 'No' },
      },
    });
    const m2 = makeMarket({
      id: 'market-b',
      question: 'Will BTC be above $100K by June 2026?',
      endDate: '2026-06-30',
      tokens: {
        yes: { tokenId: 'y2', price: 0.55, outcome: 'Yes' },
        no: { tokenId: 'n2', price: 0.45, outcome: 'No' },
      },
    });

    expect(strategy.checkCrossMarketArb(m1, m2)).toBeNull();
  });

  it('should reject when profit < minArbPercent after fees', () => {
    const m1 = makeMarket({
      id: 'market-a',
      question: 'Will BTC be above $100K by April 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y1', price: 0.49, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.51, outcome: 'No' },
      },
    });
    const m2 = makeMarket({
      id: 'market-b',
      question: 'Will BTC be above $100K by April 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y2', price: 0.50, outcome: 'Yes' },
        no: { tokenId: 'n2', price: 0.50, outcome: 'No' },
      },
    });

    // Best combo cost = 0.49 + 0.50 = 0.99, after 2% fees => negative profit
    expect(strategy.checkCrossMarketArb(m1, m2)).toBeNull();
  });

  it('should pick the cheaper leg combination', () => {
    const m1 = makeMarket({
      id: 'market-a',
      question: 'Will ETH hit $10K by May 2026?',
      endDate: '2026-05-31',
      tokens: {
        yes: { tokenId: 'y1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.70, outcome: 'No' },
      },
    });
    const m2 = makeMarket({
      id: 'market-b',
      question: 'Will ETH hit $10K by May 2026?',
      endDate: '2026-05-31',
      tokens: {
        yes: { tokenId: 'y2', price: 0.60, outcome: 'Yes' },
        no: { tokenId: 'n2', price: 0.40, outcome: 'No' },
      },
    });

    // Option A: YES m1 (0.30) + NO m2 (0.40) = 0.70
    // Option B: NO m1 (0.70) + YES m2 (0.60) = 1.30
    // Should pick A
    const result = strategy.checkCrossMarketArb(m1, m2)!;
    expect(result).not.toBeNull();
    expect(result.buyLeg.marketId).toBe('market-a');
    expect(result.buyLeg.side).toBe('YES');
    expect(result.sellLeg.marketId).toBe('market-b');
    expect(result.sellLeg.side).toBe('NO');
    expect(result.totalCost).toBeCloseTo(0.70, 4);
  });
});

// ---------------------------------------------------------------------------
// Scanner tests
// ---------------------------------------------------------------------------

describe('CrossPlatformArbStrategy - scanForArbitrage', () => {
  const strategy = new CrossPlatformArbStrategy();

  it('should find all intra-market arb opportunities', () => {
    const markets = [
      makeArbMarket(0.40, 0.52),                     // arb: total 0.92
      makeMarket({ id: 'no-arb', question: 'Will the Lakers win NBA 2026?', tokens: {  // no arb, different topic
        yes: { tokenId: 'y', price: 0.50, outcome: 'Yes' },
        no: { tokenId: 'n', price: 0.50, outcome: 'No' },
      }}),
    ];

    const results = strategy.scanForArbitrage(markets);
    expect(results.length).toBe(1);
    expect(results[0].type).toBe('intra_market');
  });

  it('should return empty for no-arb scenarios', () => {
    const markets = [
      makeMarket({ id: 'm1' }),
      makeMarket({ id: 'm2', question: 'Completely different topic about weather' }),
    ];
    const results = strategy.scanForArbitrage(markets);
    expect(results.length).toBe(0);
  });

  it('should sort results by profit percent descending', () => {
    const markets = [
      makeArbMarket(0.44, 0.52),  // total 0.96 => smaller profit
      makeArbMarket(0.35, 0.50),  // total 0.85 => larger profit
    ];
    // Give them different IDs to distinguish
    markets[0].id = 'small-arb';
    markets[1].id = 'big-arb';

    const results = strategy.scanForArbitrage(markets);
    expect(results.length).toBeGreaterThanOrEqual(1);
    // First result should have higher profit
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].profitPercent).toBeGreaterThanOrEqual(results[i].profitPercent);
    }
  });

  it('should find both intra and cross-market arbs in same scan', () => {
    const intraArb = makeArbMarket(0.35, 0.50);
    intraArb.id = 'intra-arb';

    const crossA = makeMarket({
      id: 'cross-a',
      question: 'Will SOL reach $500 by May 2026?',
      endDate: '2026-05-31',
      tokens: {
        yes: { tokenId: 'y1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.70, outcome: 'No' },
      },
    });
    const crossB = makeMarket({
      id: 'cross-b',
      question: 'Will SOL reach $500 by May 2026?',
      endDate: '2026-05-31',
      tokens: {
        yes: { tokenId: 'y2', price: 0.60, outcome: 'Yes' },
        no: { tokenId: 'n2', price: 0.40, outcome: 'No' },
      },
    });

    const results = strategy.scanForArbitrage([intraArb, crossA, crossB]);
    const types = results.map(r => r.type);
    expect(types).toContain('intra_market');
    expect(types).toContain('cross_market');
  });
});

// ---------------------------------------------------------------------------
// Signal conversion tests
// ---------------------------------------------------------------------------

describe('CrossPlatformArbStrategy - toSignals', () => {
  const strategy = new CrossPlatformArbStrategy();

  it('should convert arb to exactly 2 trade signals', () => {
    const arb: ArbOpportunity = {
      type: 'intra_market',
      markets: ['test-market'],
      buyLeg: { marketId: 'test-market', side: 'YES', price: 0.40 },
      sellLeg: { marketId: 'test-market', side: 'NO', price: 0.52 },
      totalCost: 0.92,
      guaranteedPayout: 1.00,
      profitPercent: 6.70,
      confidence: 0.95,
      detectedAt: new Date(),
    };

    const signals = strategy.toSignals(arb);
    expect(signals).toHaveLength(2);
  });

  it('should set strategy ID to cross_platform', () => {
    const arb: ArbOpportunity = {
      type: 'intra_market',
      markets: ['test-market'],
      buyLeg: { marketId: 'test-market', side: 'YES', price: 0.40 },
      sellLeg: { marketId: 'test-market', side: 'NO', price: 0.52 },
      totalCost: 0.92,
      guaranteedPayout: 1.00,
      profitPercent: 6.70,
      confidence: 0.95,
      detectedAt: new Date(),
    };

    const signals = strategy.toSignals(arb);
    expect(signals[0].strategy).toBe('cross_platform');
    expect(signals[1].strategy).toBe('cross_platform');
  });

  it('should emit signal:detected on event bus for each leg', () => {
    const spy = vi.spyOn(eventBus, 'emit');

    const arb: ArbOpportunity = {
      type: 'cross_market',
      markets: ['m-a', 'm-b'],
      buyLeg: { marketId: 'm-a', side: 'YES', price: 0.35 },
      sellLeg: { marketId: 'm-b', side: 'NO', price: 0.45 },
      totalCost: 0.80,
      guaranteedPayout: 1.00,
      profitPercent: 23.0,
      confidence: 0.80,
      detectedAt: new Date(),
    };

    strategy.toSignals(arb);

    const signalCalls = spy.mock.calls.filter(c => c[0] === 'signal:detected');
    expect(signalCalls.length).toBe(2);

    spy.mockRestore();
  });

  it('should set correct sides and market IDs on each signal', () => {
    const arb: ArbOpportunity = {
      type: 'cross_market',
      markets: ['m-a', 'm-b'],
      buyLeg: { marketId: 'm-a', side: 'YES', price: 0.35 },
      sellLeg: { marketId: 'm-b', side: 'NO', price: 0.45 },
      totalCost: 0.80,
      guaranteedPayout: 1.00,
      profitPercent: 23.0,
      confidence: 0.80,
      detectedAt: new Date(),
    };

    const [buy, sell] = strategy.toSignals(arb);
    expect(buy.marketId).toBe('m-a');
    expect(buy.side).toBe('YES');
    expect(sell.marketId).toBe('m-b');
    expect(sell.side).toBe('NO');
  });
});

// ---------------------------------------------------------------------------
// Cross-platform arb helper tests
// ---------------------------------------------------------------------------

describe('calculateCrossPlatformNetProfit', () => {
  it('should use higher fee rate (2.5%) for cross-platform', () => {
    // cost=0.80, payout=1.00, fees=0.80*0.025=0.02
    // net = 1.00 - 0.80 - 0.02 = 0.18
    const net = calculateCrossPlatformNetProfit(0.80, 1.00);
    expect(net).toBeCloseTo(0.18, 4);
  });

  it('should return negative when fees eat the profit', () => {
    // cost=0.98, payout=1.00, fees=0.98*0.025=0.0245
    // net = 1.00 - 0.98 - 0.0245 = -0.0045
    const net = calculateCrossPlatformNetProfit(0.98, 1.00);
    expect(net).toBeLessThan(0);
  });
});

describe('calculateCrossPlatformProfitPercent', () => {
  it('should return correct percentage with cross-platform fees', () => {
    // cost=0.80, net=0.18 => 0.18/0.80*100 = 22.5%
    const pct = calculateCrossPlatformProfitPercent(0.80, 1.00);
    expect(pct).toBeCloseTo(22.5, 1);
  });

  it('should return 0 for zero cost', () => {
    expect(calculateCrossPlatformProfitPercent(0, 1.00)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Cross-platform arb detection tests
// ---------------------------------------------------------------------------

describe('CrossPlatformArbStrategy - cross-platform arb', () => {
  const strategy = new CrossPlatformArbStrategy();

  function makeKalshiMarket(overrides: Partial<Market> = {}): Market {
    return {
      id: 'kalshi:BTC-100K-APR26',
      question: 'Will Bitcoin price reach $100K by April 30 2026?',
      slug: 'btc-100k-apr26',
      vertical: 'crypto',
      endDate: '2026-04-30',
      active: true,
      closed: false,
      tokens: {
        yes: { tokenId: 'kalshi:BTC-100K-APR26:yes', price: 0.70, outcome: 'Yes' },
        no: { tokenId: 'kalshi:BTC-100K-APR26:no', price: 0.30, outcome: 'No' },
      },
      volume: 80000,
      liquidity: 40000,
      lastPrice: 0.70,
      ...overrides,
    };
  }

  it('should detect cross-platform arb when prices diverge', () => {
    const poly = makeMarket({
      id: 'poly-btc',
      question: 'Will Bitcoin price reach $100K before April 30 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.70, outcome: 'No' },
      },
    });
    const kalshi = makeKalshiMarket({
      question: 'Will Bitcoin price reach $100K by April 30 2026?',
      tokens: {
        yes: { tokenId: 'ky', price: 0.70, outcome: 'Yes' },
        no: { tokenId: 'kn', price: 0.30, outcome: 'No' },
      },
    });

    // Best: buy YES on poly (0.30) + buy NO on kalshi (0.30) = 0.60
    const result = strategy.checkCrossPlatformArb(poly, kalshi);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('cross_platform');
    expect(result!.markets).toContain('poly-btc');
    expect(result!.markets).toContain('kalshi:BTC-100K-APR26');
    expect(result!.totalCost).toBeCloseTo(0.60, 4);
    expect(result!.profitPercent).toBeGreaterThan(CROSS_PLATFORM_MIN_PROFIT);
  });

  it('should reject when markets are too dissimilar', () => {
    const poly = makeMarket({
      id: 'poly-btc',
      question: 'Will BTC hit $100K by April?',
      endDate: '2026-04-30',
    });
    const kalshi = makeKalshiMarket({
      question: 'Will the Lakers win the NBA Championship?',
    });

    expect(strategy.checkCrossPlatformArb(poly, kalshi)).toBeNull();
  });

  it('should reject when end dates are too far apart (>5 days)', () => {
    const poly = makeMarket({
      id: 'poly-btc',
      question: 'Will Bitcoin reach $100K by April 2026?',
      endDate: '2026-04-15',
      tokens: {
        yes: { tokenId: 'y1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.70, outcome: 'No' },
      },
    });
    const kalshi = makeKalshiMarket({
      question: 'Will Bitcoin reach $100K on April 30?',
      endDate: '2026-04-30',
    });

    expect(strategy.checkCrossPlatformArb(poly, kalshi)).toBeNull();
  });

  it('should reject when profit is below 3% threshold', () => {
    const poly = makeMarket({
      id: 'poly-btc',
      question: 'Will BTC be above $100K by end of April 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y1', price: 0.48, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.52, outcome: 'No' },
      },
    });
    const kalshi = makeKalshiMarket({
      tokens: {
        yes: { tokenId: 'ky', price: 0.52, outcome: 'Yes' },
        no: { tokenId: 'kn', price: 0.48, outcome: 'No' },
      },
    });

    // Best combo = 0.48 + 0.48 = 0.96 => after 2.5% fees it's marginal
    expect(strategy.checkCrossPlatformArb(poly, kalshi)).toBeNull();
  });

  it('should return null for inactive Polymarket', () => {
    const poly = makeMarket({ id: 'poly', active: false });
    const kalshi = makeKalshiMarket();
    expect(strategy.checkCrossPlatformArb(poly, kalshi)).toBeNull();
  });

  it('should return null for closed Kalshi market', () => {
    const poly = makeMarket({ id: 'poly' });
    const kalshi = makeKalshiMarket({ closed: true });
    expect(strategy.checkCrossPlatformArb(poly, kalshi)).toBeNull();
  });

  it('should pick the cheaper leg combination', () => {
    const poly = makeMarket({
      id: 'poly-btc',
      question: 'Will Bitcoin price reach $100K before April 30 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y1', price: 0.60, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.40, outcome: 'No' },
      },
    });
    const kalshi = makeKalshiMarket({
      question: 'Will Bitcoin price reach $100K by April 30 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'ky', price: 0.25, outcome: 'Yes' },
        no: { tokenId: 'kn', price: 0.15, outcome: 'No' },
      },
    });

    // Option A: poly YES (0.60) + kalshi NO (0.15) = 0.75
    // Option B: kalshi YES (0.25) + poly NO (0.40) = 0.65
    // Should pick B
    const result = strategy.checkCrossPlatformArb(poly, kalshi);
    expect(result).not.toBeNull();
    expect(result!.totalCost).toBeCloseTo(0.65, 4);
    expect(result!.buyLeg.marketId).toBe('kalshi:BTC-100K-APR26');
    expect(result!.buyLeg.side).toBe('YES');
    expect(result!.sellLeg.marketId).toBe('poly-btc');
    expect(result!.sellLeg.side).toBe('NO');
  });

  it('should have base confidence of 50% for cross-platform', () => {
    const poly = makeMarket({
      id: 'poly-btc',
      question: 'Will Bitcoin price reach $100K before April 30 2026?',
      endDate: '2026-04-30',
      tokens: {
        yes: { tokenId: 'y1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'n1', price: 0.70, outcome: 'No' },
      },
    });
    const kalshi = makeKalshiMarket({
      question: 'Will Bitcoin price reach $100K by April 30 2026?',
      tokens: {
        yes: { tokenId: 'ky', price: 0.70, outcome: 'Yes' },
        no: { tokenId: 'kn', price: 0.30, outcome: 'No' },
      },
    });

    const result = strategy.checkCrossPlatformArb(poly, kalshi)!;
    expect(result).not.toBeNull();
    // Base 0.50 + some profit boost, should be around 0.50-0.60
    expect(result.confidence).toBeGreaterThanOrEqual(0.50);
    expect(result.confidence).toBeLessThan(0.70); // Lower than cross_market base
  });
});

// ---------------------------------------------------------------------------
// scanCrossPlatform tests
// ---------------------------------------------------------------------------

describe('CrossPlatformArbStrategy - scanCrossPlatform', () => {
  const strategy = new CrossPlatformArbStrategy();

  it('should find cross-platform arbs across two market lists', () => {
    const polyMarkets = [
      makeMarket({
        id: 'poly-btc',
        question: 'Will Bitcoin price reach $100K before April 30 2026?',
        endDate: '2026-04-30',
        tokens: {
          yes: { tokenId: 'y1', price: 0.30, outcome: 'Yes' },
          no: { tokenId: 'n1', price: 0.70, outcome: 'No' },
        },
      }),
    ];
    const kalshiMarkets: Market[] = [
      {
        id: 'kalshi:BTC-100K-APR26',
        question: 'Will Bitcoin price reach $100K by April 30 2026?',
        slug: 'btc-100k-apr26',
        vertical: 'crypto',
        endDate: '2026-04-30',
        active: true,
        closed: false,
        tokens: {
          yes: { tokenId: 'ky', price: 0.70, outcome: 'Yes' },
          no: { tokenId: 'kn', price: 0.30, outcome: 'No' },
        },
        volume: 80000,
        liquidity: 40000,
        lastPrice: 0.70,
      },
    ];

    const results = strategy.scanCrossPlatform(polyMarkets, kalshiMarkets);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].type).toBe('cross_platform');
  });

  it('should return empty for non-matching market lists', () => {
    const polyMarkets = [makeMarket({ id: 'poly-btc', question: 'Will BTC reach $100K?' })];
    const kalshiMarkets: Market[] = [{
      id: 'kalshi:LAKERS-NBA',
      question: 'Will the Lakers win the NBA Championship?',
      slug: 'lakers-nba',
      vertical: 'sports',
      endDate: '2026-06-30',
      active: true,
      closed: false,
      tokens: {
        yes: { tokenId: 'ky', price: 0.50, outcome: 'Yes' },
        no: { tokenId: 'kn', price: 0.50, outcome: 'No' },
      },
      volume: 10000,
      liquidity: 5000,
      lastPrice: 0.50,
    }];

    const results = strategy.scanCrossPlatform(polyMarkets, kalshiMarkets);
    expect(results).toEqual([]);
  });

  it('should sort results by profit percent descending', () => {
    const polyMarkets = [
      makeMarket({
        id: 'poly-btc',
        question: 'Will Bitcoin price reach $100K before April 30 2026?',
        endDate: '2026-04-30',
        tokens: {
          yes: { tokenId: 'y1', price: 0.30, outcome: 'Yes' },
          no: { tokenId: 'n1', price: 0.70, outcome: 'No' },
        },
      }),
      makeMarket({
        id: 'poly-eth',
        question: 'Will Ethereum price reach $10K before May 31 2026?',
        endDate: '2026-05-31',
        tokens: {
          yes: { tokenId: 'y2', price: 0.20, outcome: 'Yes' },
          no: { tokenId: 'n2', price: 0.80, outcome: 'No' },
        },
      }),
    ];
    const kalshiMarkets: Market[] = [
      {
        id: 'kalshi:BTC-100K',
        question: 'Will Bitcoin price reach $100K by April 30 2026?',
        slug: 'btc-100k',
        vertical: 'crypto',
        endDate: '2026-04-30',
        active: true,
        closed: false,
        tokens: {
          yes: { tokenId: 'ky1', price: 0.70, outcome: 'Yes' },
          no: { tokenId: 'kn1', price: 0.30, outcome: 'No' },
        },
        volume: 80000,
        liquidity: 40000,
        lastPrice: 0.70,
      },
      {
        id: 'kalshi:ETH-10K',
        question: 'Will Ethereum price reach $10K by May 31 2026?',
        slug: 'eth-10k',
        vertical: 'crypto',
        endDate: '2026-05-31',
        active: true,
        closed: false,
        tokens: {
          yes: { tokenId: 'ky2', price: 0.80, outcome: 'Yes' },
          no: { tokenId: 'kn2', price: 0.20, outcome: 'No' },
        },
        volume: 60000,
        liquidity: 30000,
        lastPrice: 0.80,
      },
    ];

    const results = strategy.scanCrossPlatform(polyMarkets, kalshiMarkets);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].profitPercent).toBeGreaterThanOrEqual(results[i].profitPercent);
    }
  });
});

// ---------------------------------------------------------------------------
// Constants sanity
// ---------------------------------------------------------------------------

describe('Constants', () => {
  it('should have correct fee rates', () => {
    expect(TAKER_FEE_RATE).toBe(0.01);
    expect(TOTAL_FEE_RATE).toBe(0.02);
    expect(KALSHI_FEE_RATE).toBe(0.015);
    expect(CROSS_PLATFORM_FEE_RATE).toBe(0.025);
    expect(CROSS_PLATFORM_MIN_PROFIT).toBe(3.0);
    expect(CROSS_PLATFORM_BASE_CONFIDENCE).toBe(0.50);
    expect(BINARY_PAYOUT).toBe(1.0);
  });
});
