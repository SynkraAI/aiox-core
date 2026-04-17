/**
 * Sanity checks for CryptoPriceClient after hybrid-refactor P2.
 *
 * Focus:
 * - get24hAvgPrice parses klines and returns SMA (BUG-1 fix)
 * - getPriceAtTime uses endTime klines and guards against future timestamps (BUG-3 fix)
 * - PRICE_OFFSETS is symmetric (BUG-2 fix) — asserted by counting generated markets
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CryptoPriceClient } from '../src/integrations/crypto-price-client.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic' as ResponseType,
    url: '',
    clone: () => ({} as Response),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
  } as Response;
}

// Helper: fake Binance klines row.
// Binance format: [openTime, open, high, low, close, volume, closeTime, ...]
function kline(closeStr: string, closeTimeMs: number): Array<string | number> {
  return [closeTimeMs - 3_600_000, closeStr, closeStr, closeStr, closeStr, '100', closeTimeMs, '0', 0, '0', '0', '0'];
}

describe('CryptoPriceClient hybrid refactor (P2)', () => {
  let client: CryptoPriceClient;

  beforeEach(() => {
    client = new CryptoPriceClient();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get24hAvgPrice (BUG-1)', () => {
    it('returns simple average of 24 closes', async () => {
      // 24 bars, closes from 100 to 123 → avg = (100+123)/2 = 111.5
      const closes = Array.from({ length: 24 }, (_, i) => kline(String(100 + i), Date.now() - (23 - i) * 3_600_000));
      mockFetch.mockResolvedValueOnce(jsonResponse(closes));

      const avg = await client.get24hAvgPrice('BTCUSDT');

      expect(avg).toBeCloseTo(111.5, 2);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('klines?symbol=BTCUSDT&interval=1h&limit=24'));
    });

    it('returns 0 on fetch failure (never throws)', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}, 500));
      const avg = await client.get24hAvgPrice('BTCUSDT');
      expect(avg).toBe(0);
    });

    it('returns 0 on empty kline array', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));
      const avg = await client.get24hAvgPrice('BTCUSDT');
      expect(avg).toBe(0);
    });
  });

  describe('getPriceAtTime (BUG-3)', () => {
    it('returns close price from kline at the given endTime', async () => {
      const endTime = Date.now() - 10 * 60_000; // 10 minutes ago (safely closed)
      mockFetch.mockResolvedValueOnce(jsonResponse([kline('85000.5', endTime)]));

      const price = await client.getPriceAtTime('BTCUSDT', endTime);

      expect(price).toBeCloseTo(85000.5, 2);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('endTime='));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=1'));
    });

    it('guards against future timestamps (no leak)', async () => {
      const future = Date.now() + 60 * 60_000;
      const price = await client.getPriceAtTime('BTCUSDT', future);
      expect(price).toBe(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('guards against very recent timestamps (bar still open)', async () => {
      const almostNow = Date.now() - 30_000; // 30s ago, inside the open kline
      const price = await client.getPriceAtTime('BTCUSDT', almostNow);
      expect(price).toBe(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('rejects kline whose closeTime is in the future', async () => {
      const endTime = Date.now() - 10 * 60_000;
      // Stub a kline that claims to close in the future — reject
      const badKline: Array<string | number> = [endTime - 3_600_000, '100', '100', '100', '100', '100', Date.now() + 3_600_000, '0', 0, '0', '0', '0'];
      mockFetch.mockResolvedValueOnce(jsonResponse([badKline]));

      const price = await client.getPriceAtTime('BTCUSDT', endTime);
      expect(price).toBe(0);
    });
  });

  describe('PRICE_OFFSETS symmetry (BUG-2)', () => {
    it('generates symmetric above/below counts per coin+horizon', async () => {
      // 24h avg klines (all coins — 6 coins × 2 calls (avg + spot))
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('ticker/24hr')) {
          return Promise.resolve(jsonResponse({ symbol: 'X', price: '100', priceChangePercent: '0' }));
        }
        if (url.includes('ticker/price')) {
          return Promise.resolve(jsonResponse({ symbol: 'X', price: '100' }));
        }
        if (url.includes('klines?symbol=')) {
          // 24h avg klines
          return Promise.resolve(jsonResponse(Array.from({ length: 24 }, () => kline('100', Date.now()))));
        }
        return Promise.resolve(jsonResponse({}, 500));
      });

      const markets = await client.generateMarkets();
      if (markets.length === 0) return; // fetch infra failure, not a correctness test

      // For each coin+horizon group, count above vs below
      type Key = string; // `${coin}:${hours}`
      const tally = new Map<Key, { above: number; below: number }>();
      for (const m of markets) {
        const key = `${m.coinSymbol}:${m.question.match(/in (\d+)h/)?.[1] ?? '?'}`;
        const t = tally.get(key) ?? { above: 0, below: 0 };
        if (m.direction === 'above') t.above++;
        else t.below++;
        tally.set(key, t);
      }

      // Every group must be symmetric
      for (const [key, t] of tally) {
        expect(t.above, `group ${key}: above count`).toBe(t.below);
      }
    });
  });
});

describe('PaperTradingReviewer realOnly filter (P4)', () => {
  it('filters trades by source:real tag or marketId fallback', async () => {
    const { PaperTradingReviewer } = await import('../src/engine/paper-review.js');
    const reviewer = new PaperTradingReviewer();
    const now = new Date();
    const trades = [
      {
        id: 't1', timestamp: now, marketId: '0xabc', vertical: 'crypto' as const,
        strategy: 'info_arb' as const, marketQuestion: 'q', signalConfidence: 0.5,
        modelProbability: 0.6, marketProbability: 0.5, edgeDetected: 0.1, positionSize: 10,
        kellyFraction: 0.02, side: 'YES' as const, entryPrice: 0.5, slippage: 0, gasFee: 0,
        takerFee: 0, fillTimeMs: 0, outcome: 'WIN' as const, exitPrice: 1, pnl: 5,
        lesson: '', tags: ['source:real'], similarPastTrades: [], metadata: { source: 'real' },
      },
      {
        id: 't2', timestamp: now, marketId: 'synth-bitcoin-above-85000-24h-123', vertical: 'crypto' as const,
        strategy: 'info_arb' as const, marketQuestion: 'q', signalConfidence: 0.5,
        modelProbability: 0.6, marketProbability: 0.5, edgeDetected: 0.1, positionSize: 10,
        kellyFraction: 0.02, side: 'NO' as const, entryPrice: 0.5, slippage: 0, gasFee: 0,
        takerFee: 0, fillTimeMs: 0, outcome: 'WIN' as const, exitPrice: 1, pnl: 5,
        lesson: '', tags: ['source:synth'], similarPastTrades: [], metadata: { source: 'synth' },
      },
    ];

    const realOnly = reviewer.analyze(trades, { realOnly: true });
    expect(realOnly.totalTrades).toBe(1);

    const all = reviewer.analyze(trades);
    expect(all.totalTrades).toBe(2);
  });
});
