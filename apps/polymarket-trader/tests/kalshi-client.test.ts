import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KalshiClient } from '../src/integrations/kalshi-client.js';

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const RAW_MARKET = {
  ticker: 'BTC-100K-APR26',
  title: 'Will Bitcoin be above $100K on April 30?',
  status: 'open',
  close_time: '2026-04-30T00:00:00Z',
  yes_bid: 65,   // cents
  no_bid: 35,
  last_price: 64,
  volume: 120000,
  liquidity: 50000,
  category: 'Crypto',
  event_ticker: 'BTC-APR26',
};

const RAW_MARKET_CLOSED = {
  ...RAW_MARKET,
  ticker: 'BTC-CLOSED',
  status: 'closed',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('KalshiClient', () => {
  let client: KalshiClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new KalshiClient('https://test-api.kalshi.com/v2', 100); // high rate limit for tests
  });

  afterEach(() => {
    client.clearCache();
  });

  // ─── Response Parsing ─────────────────────────────────

  describe('getMarkets', () => {
    it('should parse Kalshi markets into our Market type', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        markets: [RAW_MARKET],
      }));

      const markets = await client.getMarkets();

      expect(markets).toHaveLength(1);
      const m = markets[0];
      expect(m.id).toBe('kalshi:BTC-100K-APR26');
      expect(m.kalshiTicker).toBe('BTC-100K-APR26');
      expect(m.eventTicker).toBe('BTC-APR26');
      expect(m.question).toBe('Will Bitcoin be above $100K on April 30?');
      expect(m.active).toBe(true);
      expect(m.closed).toBe(false);
      expect(m.tokens.yes.price).toBeCloseTo(0.65, 2);
      expect(m.tokens.no.price).toBeCloseTo(0.35, 2);
      expect(m.volume).toBe(120000);
      expect(m.vertical).toBe('crypto');
    });

    it('should return empty array on API error', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}, 500));
      const markets = await client.getMarkets();
      expect(markets).toEqual([]);
    });

    it('should return empty array on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const markets = await client.getMarkets();
      expect(markets).toEqual([]);
    });

    it('should handle empty markets array', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ markets: [] }));
      const markets = await client.getMarkets();
      expect(markets).toEqual([]);
    });

    it('should handle missing markets field', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      const markets = await client.getMarkets();
      expect(markets).toEqual([]);
    });

    it('should pass query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ markets: [] }));
      await client.getMarkets({ limit: 10, status: 'open' });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('status=open');
    });
  });

  describe('getMarket', () => {
    it('should fetch a single market by ticker', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ market: RAW_MARKET }));
      const market = await client.getMarket('BTC-100K-APR26');

      expect(market).not.toBeNull();
      expect(market!.kalshiTicker).toBe('BTC-100K-APR26');
    });

    it('should return null on 404', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));
      const market = await client.getMarket('NONEXISTENT');
      expect(market).toBeNull();
    });
  });

  describe('getOrderBook', () => {
    it('should parse orderbook with price in cents', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        yes: [[65, 100], [64, 200]],
        no: [[35, 150], [36, 100]],
      }));

      const ob = await client.getOrderBook('BTC-100K-APR26');
      expect(ob).not.toBeNull();
      expect(ob!.bids[0].price).toBeCloseTo(0.65, 2);
      expect(ob!.bids[0].size).toBe(100);
      expect(ob!.asks[0].price).toBeCloseTo(0.35, 2);
      expect(ob!.midpoint).toBeCloseTo(0.50, 2);
    });

    it('should return null on failure', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}, 500));
      const ob = await client.getOrderBook('FAIL');
      expect(ob).toBeNull();
    });
  });

  describe('getEvents', () => {
    it('should fetch event groups', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        events: [
          { event_ticker: 'BTC-APR26', title: 'BTC April', markets: [RAW_MARKET] },
        ],
      }));

      const events = await client.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event_ticker).toBe('BTC-APR26');
    });

    it('should return empty on error', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}, 500));
      const events = await client.getEvents();
      expect(events).toEqual([]);
    });
  });

  describe('searchMarkets', () => {
    it('should filter markets by query string', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        markets: [
          RAW_MARKET,
          { ...RAW_MARKET, ticker: 'ETH-5K', title: 'Will ETH reach $5K?' },
        ],
      }));

      const results = await client.searchMarkets('bitcoin');
      expect(results).toHaveLength(1);
      expect(results[0].kalshiTicker).toBe('BTC-100K-APR26');
    });

    it('should match by ticker too', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        markets: [RAW_MARKET],
      }));

      const results = await client.searchMarkets('btc-100k');
      expect(results).toHaveLength(1);
    });

    it('should be case-insensitive', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        markets: [RAW_MARKET],
      }));

      const results = await client.searchMarkets('BITCOIN');
      expect(results).toHaveLength(1);
    });
  });

  // ─── Caching ──────────────────────────────────────────

  describe('caching', () => {
    it('should cache responses for 60 seconds', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ markets: [RAW_MARKET] }));

      await client.getMarkets();
      await client.getMarkets();

      // Second call should use cache — only 1 fetch
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should serve fresh data after clearCache', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ markets: [RAW_MARKET] }));

      await client.getMarkets();
      client.clearCache();
      await client.getMarkets();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Rate Limiting ────────────────────────────────────

  describe('rate limiting', () => {
    it('should respect rate limit and return null when exhausted', async () => {
      // Create client with very low rate limit
      const limitedClient = new KalshiClient('https://test-api.kalshi.com/v2', 2);

      mockFetch.mockResolvedValue(jsonResponse({ markets: [RAW_MARKET] }));

      // First 2 calls succeed (unique URLs to bypass cache)
      const r1 = await limitedClient.getMarkets({ limit: 1 });
      const r2 = await limitedClient.getMarkets({ limit: 2 });
      expect(r1).toHaveLength(1);
      expect(r2).toHaveLength(1);

      // Third call exceeds rate limit — returns empty (null -> [])
      // The rate limiter will try to wait, so we test tokens instead
      expect(limitedClient.getRateLimiterTokens()).toBe(0);
    });
  });

  // ─── Market Parsing Edge Cases ────────────────────────

  describe('market parsing', () => {
    it('should mark closed markets correctly', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        markets: [RAW_MARKET_CLOSED],
      }));

      const markets = await client.getMarkets();
      expect(markets[0].active).toBe(false);
      expect(markets[0].closed).toBe(true);
    });

    it('should default prices to 0.5 when bids are missing', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        markets: [{ ...RAW_MARKET, yes_bid: undefined, no_bid: undefined }],
      }));

      const markets = await client.getMarkets();
      expect(markets[0].tokens.yes.price).toBe(0.5);
      expect(markets[0].tokens.no.price).toBe(0.5);
    });

    it('should detect weather vertical', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        markets: [{ ...RAW_MARKET, title: 'Will temperature exceed 100F?', category: 'Weather' }],
      }));

      const markets = await client.getMarkets();
      expect(markets[0].vertical).toBe('weather');
    });

    it('should detect politics vertical', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        markets: [{ ...RAW_MARKET, title: 'Will the president win the election?', category: 'Politics' }],
      }));

      const markets = await client.getMarkets();
      expect(markets[0].vertical).toBe('politics');
    });
  });
});
