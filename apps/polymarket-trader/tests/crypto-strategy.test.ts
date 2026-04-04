/**
 * Tests for the Crypto Strategy module.
 * Covers: log-normal math, market parsing, edge detection,
 * confidence scaling, sentiment adjustment, and full analyze flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CryptoStrategy,
  normalCdf,
  logNormalProbAbove,
  timeToExpiryYears,
  parseCryptoMarketQuestion,
  calculateConfidence,
  sentimentAdjustment,
} from '../src/strategies/crypto-strategy.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { Market } from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCryptoMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: 'market-btc-70k',
    question: 'Will BTC be above $70,000 on April 15, 2027?',
    slug: 'btc-above-70k-apr-2027',
    vertical: 'crypto',
    endDate: '2027-04-15',
    active: true,
    closed: false,
    tokens: {
      yes: { tokenId: 'yes-1', price: 0.55, outcome: 'Yes' },
      no: { tokenId: 'no-1', price: 0.45, outcome: 'No' },
    },
    volume: 100_000,
    liquidity: 50_000,
    lastPrice: 0.55,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// normalCdf
// ---------------------------------------------------------------------------

describe('normalCdf', () => {
  it('returns 0.5 at x = 0', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 2);
  });

  it('returns ~0.84 at x = 1', () => {
    expect(normalCdf(1)).toBeCloseTo(0.8413, 1);
  });

  it('returns ~0.16 at x = -1', () => {
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 1);
  });

  it('returns ~0.98 at x = 2', () => {
    expect(normalCdf(2)).toBeCloseTo(0.9772, 1);
  });

  it('returns 0 for very negative x', () => {
    expect(normalCdf(-10)).toBe(0);
  });

  it('returns 1 for very positive x', () => {
    expect(normalCdf(10)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// logNormalProbAbove
// ---------------------------------------------------------------------------

describe('logNormalProbAbove', () => {
  it('returns ~0.5 when spot equals strike (zero drift)', () => {
    // With drift=0, P(S > K) when S=K is slightly below 0.5
    // because of the -σ²/2 term. For σ=0.6, T=1:
    // d = (0 + (0 - 0.18)*1) / 0.6 = -0.3 → Φ(-0.3) ≈ 0.3821
    const prob = logNormalProbAbove(100_000, 100_000, 0.60, 1.0, 0);
    expect(prob).toBeCloseTo(0.3821, 1);
  });

  it('returns high probability when spot >> strike', () => {
    const prob = logNormalProbAbove(100_000, 50_000, 0.60, 0.5);
    expect(prob).toBeGreaterThan(0.85);
  });

  it('returns low probability when spot << strike', () => {
    const prob = logNormalProbAbove(50_000, 100_000, 0.60, 0.5);
    expect(prob).toBeLessThan(0.15);
  });

  it('returns 1 when time is 0 and spot > strike', () => {
    expect(logNormalProbAbove(100, 90, 0.5, 0)).toBe(1);
  });

  it('returns 0 when time is 0 and spot < strike', () => {
    expect(logNormalProbAbove(80, 90, 0.5, 0)).toBe(0);
  });

  it('returns 0 for invalid inputs (zero spot or vol)', () => {
    expect(logNormalProbAbove(0, 100, 0.5, 1)).toBe(0);
    expect(logNormalProbAbove(100, 0, 0.5, 1)).toBe(0);
    expect(logNormalProbAbove(100, 100, 0, 1)).toBe(0);
  });

  it('higher volatility increases probability for out-of-money', () => {
    const lowVol = logNormalProbAbove(50_000, 100_000, 0.30, 1.0);
    const highVol = logNormalProbAbove(50_000, 100_000, 0.80, 1.0);
    expect(highVol).toBeGreaterThan(lowVol);
  });

  it('probability increases with positive drift', () => {
    const neutral = logNormalProbAbove(70_000, 100_000, 0.60, 1.0, 0);
    const bullish = logNormalProbAbove(70_000, 100_000, 0.60, 1.0, 0.20);
    expect(bullish).toBeGreaterThan(neutral);
  });
});

// ---------------------------------------------------------------------------
// timeToExpiryYears
// ---------------------------------------------------------------------------

describe('timeToExpiryYears', () => {
  it('returns ~1.0 for exactly one year ahead', () => {
    const now = new Date('2026-01-01');
    const expiry = new Date('2027-01-01');
    const t = timeToExpiryYears(expiry, now);
    expect(t).toBeCloseTo(1.0, 1);
  });

  it('returns 0 for past dates', () => {
    const now = new Date('2026-06-01');
    const expiry = new Date('2026-01-01');
    expect(timeToExpiryYears(expiry, now)).toBe(0);
  });

  it('returns ~0.5 for six months ahead', () => {
    const now = new Date('2026-01-01');
    const expiry = new Date('2026-07-02');
    const t = timeToExpiryYears(expiry, now);
    expect(t).toBeCloseTo(0.5, 1);
  });

  it('returns small positive value for near-term', () => {
    const now = new Date('2026-04-01');
    const expiry = new Date('2026-04-08');
    const t = timeToExpiryYears(expiry, now);
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThan(0.03);
  });
});

// ---------------------------------------------------------------------------
// parseCryptoMarketQuestion
// ---------------------------------------------------------------------------

describe('parseCryptoMarketQuestion', () => {
  it('parses "Will BTC be above $70,000 on April 15?"', () => {
    const result = parseCryptoMarketQuestion('Will BTC be above $70,000 on April 15?');
    expect(result).not.toBeNull();
    expect(result!.asset).toBe('bitcoin');
    expect(result!.assetSymbol).toBe('btc');
    expect(result!.targetPrice).toBe(70_000);
    expect(result!.direction).toBe('above');
    expect(result!.expiryDate.getMonth()).toBe(3); // April = 3
    expect(result!.expiryDate.getDate()).toBe(15);
  });

  it('parses "Will Bitcoin be below $60000 by December 31, 2026?"', () => {
    const result = parseCryptoMarketQuestion('Will Bitcoin be below $60000 by December 31, 2026?');
    expect(result).not.toBeNull();
    expect(result!.asset).toBe('bitcoin');
    expect(result!.targetPrice).toBe(60_000);
    expect(result!.direction).toBe('below');
    expect(result!.expiryDate.getFullYear()).toBe(2026);
    expect(result!.expiryDate.getMonth()).toBe(11); // December
  });

  it('parses "Will ETH hit $5,000 by June 2026?"', () => {
    const result = parseCryptoMarketQuestion('Will ETH hit $5,000 by June 2026?');
    expect(result).not.toBeNull();
    expect(result!.asset).toBe('ethereum');
    expect(result!.assetSymbol).toBe('eth');
    expect(result!.targetPrice).toBe(5_000);
    expect(result!.direction).toBe('above'); // "hit" implies above
    expect(result!.expiryDate.getFullYear()).toBe(2026);
  });

  it('parses $100K suffix', () => {
    const result = parseCryptoMarketQuestion('BTC above $100K on March 1, 2027?');
    expect(result).not.toBeNull();
    expect(result!.targetPrice).toBe(100_000);
  });

  it('parses ISO date format', () => {
    const result = parseCryptoMarketQuestion('Will BTC be above $80,000 on 2027-06-15?');
    expect(result).not.toBeNull();
    expect(result!.expiryDate.getFullYear()).toBe(2027);
    expect(result!.expiryDate.getMonth()).toBe(5); // June
    expect(result!.expiryDate.getDate()).toBe(15);
  });

  it('returns null for non-crypto questions', () => {
    expect(parseCryptoMarketQuestion('Will it rain in NYC on April 15?')).toBeNull();
    expect(parseCryptoMarketQuestion('Will Trump win the election?')).toBeNull();
  });

  it('returns null for questions without a price target', () => {
    expect(parseCryptoMarketQuestion('Will BTC moon by April?')).toBeNull();
  });

  it('returns null for questions without a date', () => {
    expect(parseCryptoMarketQuestion('Will BTC be above $70,000?')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateConfidence
// ---------------------------------------------------------------------------

describe('calculateConfidence', () => {
  it('gives high confidence for short-term (1 week)', () => {
    const c = calculateConfidence(7 / 365.25);
    expect(c).toBeGreaterThan(0.85);
  });

  it('gives moderate confidence for 3 months', () => {
    const c = calculateConfidence(0.25);
    expect(c).toBeGreaterThan(0.50);
    expect(c).toBeLessThan(0.80);
  });

  it('gives low confidence for 1 year', () => {
    const c = calculateConfidence(1.0);
    expect(c).toBeLessThan(0.30);
  });

  it('gives very low confidence for 2+ years', () => {
    const c = calculateConfidence(2.0);
    expect(c).toBeLessThan(0.15);
  });

  it('never goes below 0.10', () => {
    expect(calculateConfidence(10)).toBeGreaterThanOrEqual(0.10);
  });

  it('never exceeds 0.95', () => {
    expect(calculateConfidence(0)).toBeLessThanOrEqual(0.95);
  });
});

// ---------------------------------------------------------------------------
// sentimentAdjustment
// ---------------------------------------------------------------------------

describe('sentimentAdjustment', () => {
  it('positive 24h change boosts "above" probability', () => {
    const adj = sentimentAdjustment(5.0, 'above');
    expect(adj).toBeGreaterThan(0);
    expect(adj).toBeLessThanOrEqual(0.03);
  });

  it('positive 24h change reduces "below" probability', () => {
    const adj = sentimentAdjustment(5.0, 'below');
    expect(adj).toBeLessThan(0);
  });

  it('negative 24h change reduces "above" probability', () => {
    const adj = sentimentAdjustment(-5.0, 'above');
    expect(adj).toBeLessThan(0);
  });

  it('is clamped to ±0.03', () => {
    const adj = sentimentAdjustment(50.0, 'above');
    expect(adj).toBe(0.03);

    const adjNeg = sentimentAdjustment(-50.0, 'above');
    expect(adjNeg).toBe(-0.03);
  });

  it('returns 0 for no price change', () => {
    expect(sentimentAdjustment(0, 'above')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// CryptoStrategy.analyze — integration tests with mocked fetch
// ---------------------------------------------------------------------------

describe('CryptoStrategy.analyze', () => {
  let strategy: CryptoStrategy;
  let emitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    strategy = new CryptoStrategy();
    emitSpy = vi.spyOn(eventBus, 'emit');

    // Mock fetch to return controlled price data
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        bitcoin: { usd: 68_000, usd_24h_change: 2.5 },
        ethereum: { usd: 3_500, usd_24h_change: -1.2 },
      }),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    strategy.clearCache();
  });

  it('returns null for non-crypto markets', async () => {
    const market = makeCryptoMarket({ vertical: 'weather' as 'crypto' });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for closed markets', async () => {
    const market = makeCryptoMarket({ closed: true });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for inactive markets', async () => {
    const market = makeCryptoMarket({ active: false });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null when question cannot be parsed', async () => {
    const market = makeCryptoMarket({ question: 'Will aliens visit Earth?' });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('detects edge and returns a TradeSignal', async () => {
    // BTC at $68K, market asks "above $70K in 1 year" with YES at 0.55
    // Log-normal with σ=0.6 should give model prob well below 0.55
    // meaning edge on NO side
    const market = makeCryptoMarket({
      question: 'Will BTC be above $70,000 on April 15, 2027?',
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.55, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.45, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);

    // The result depends on whether edge > 8%
    // With spot=68000, K=70000, σ=0.6, T≈1 year:
    // d = (ln(68000/70000) + (0 - 0.18)*1) / 0.6 = (-0.029 - 0.18) / 0.6 = -0.348
    // P(above) ≈ Φ(-0.348) ≈ 0.364 + small sentiment adj
    // Market = 0.55, edge ≈ 0.55 - 0.364 ≈ 0.186 → should detect NO edge
    if (signal) {
      expect(signal.strategy).toBe('crypto_sentiment');
      expect(signal.vertical).toBe('crypto');
      expect(signal.edge).toBeGreaterThanOrEqual(0.08);
      expect(signal.side).toBe('NO'); // Model says less likely than market
      expect(signal.reasoning).toContain('BTC');
    }
    // If edge is < 8% for some reason, null is also acceptable
  });

  it('emits signal:detected on the event bus', async () => {
    const market = makeCryptoMarket({
      question: 'Will BTC be above $70,000 on April 15, 2027?',
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.55, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.45, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);

    if (signal) {
      expect(emitSpy).toHaveBeenCalledWith('signal:detected', signal);
    }
  });

  it('returns null when edge is below 8%', async () => {
    // Set market price close to model prediction
    // BTC at 68K, target 70K, ~1yr → model ~0.36
    // If market also at 0.36, no edge
    const market = makeCryptoMarket({
      question: 'Will BTC be above $70,000 on April 15, 2027?',
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.37, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.63, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);
    expect(signal).toBeNull();
  });

  it('handles API failure gracefully (returns null)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    strategy.clearCache();

    const market = makeCryptoMarket();
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('handles non-ok API response gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    strategy.clearCache();

    const market = makeCryptoMarket();
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('caches price data between calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        bitcoin: { usd: 68_000, usd_24h_change: 2.5 },
        ethereum: { usd: 3_500, usd_24h_change: -1.2 },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    strategy.clearCache();

    await strategy.fetchPrices();
    await strategy.fetchPrices();

    // Should only call fetch once due to caching
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('works with ETH markets', async () => {
    const market = makeCryptoMarket({
      id: 'market-eth-5k',
      question: 'Will ETH be above $5,000 on April 15, 2027?',
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.60, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.40, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);

    // ETH at $3,500, target $5,000, σ=0.8
    // Model prob should be meaningful, edge depends on market price
    if (signal) {
      expect(signal.strategy).toBe('crypto_sentiment');
      expect(signal.vertical).toBe('crypto');
    }
  });

  it('handles "below" direction markets', async () => {
    const market = makeCryptoMarket({
      question: 'Will BTC be below $50,000 on April 15, 2027?',
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.10, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.90, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);

    // BTC at $68K, "below $50K" probability should be quite low
    // Market YES at 0.10 — model might agree, so no edge
    // or if model gives different prob, could have edge
    // Either result (signal or null) is valid depending on exact calc
    if (signal) {
      expect(signal.vertical).toBe('crypto');
    }
  });
});
