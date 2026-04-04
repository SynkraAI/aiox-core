/**
 * Kalshi REST API client for market data.
 *
 * Public endpoints only (no auth needed for reading market data).
 * Base URL: https://api.elections.kalshi.com/trade-api/v2
 *
 * Follows the same patterns as polymarket-client.ts:
 * - Response mapping to internal Market type
 * - Built-in caching (60s TTL)
 * - Rate limiting (10 req/min — Kalshi is stricter than Polymarket)
 * - Never throws — returns empty arrays / null on failure
 */

import { KALSHI_API } from '../config/defaults.js';
import type { Market, OrderBook, Vertical } from '../types/index.js';

// ---------------------------------------------------------------------------
// Kalshi raw response types
// ---------------------------------------------------------------------------

interface KalshiMarketRaw {
  ticker: string;
  title: string;
  subtitle?: string;
  status: string;
  close_time?: string;
  yes_ask?: number;
  yes_bid?: number;
  no_ask?: number;
  no_bid?: number;
  last_price?: number;
  volume?: number;
  liquidity?: number;
  open_interest?: number;
  category?: string;
  event_ticker?: string;
}

interface KalshiMarketsResponse {
  markets: KalshiMarketRaw[];
  cursor?: string;
}

interface KalshiEventRaw {
  event_ticker: string;
  title: string;
  category?: string;
  markets: KalshiMarketRaw[];
}

interface KalshiEventsResponse {
  events: KalshiEventRaw[];
  cursor?: string;
}

interface KalshiOrderBookRaw {
  yes: Array<[number, number]>;
  no: Array<[number, number]>;
}

export interface KalshiMarket extends Market {
  /** Original Kalshi ticker for cross-reference. */
  kalshiTicker: string;
  /** Kalshi event group ticker. */
  eventTicker: string;
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000; // 60 seconds

// ---------------------------------------------------------------------------
// Rate limiter (token bucket, 10 req/min)
// ---------------------------------------------------------------------------

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillIntervalMs: number;

  constructor(maxPerMinute: number) {
    this.maxTokens = maxPerMinute;
    this.tokens = maxPerMinute;
    this.lastRefill = Date.now();
    this.refillIntervalMs = 60_000;
  }

  async acquire(): Promise<boolean> {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    // Wait for next token
    const waitMs = this.refillIntervalMs - (Date.now() - this.lastRefill);
    if (waitMs > 0 && waitMs <= this.refillIntervalMs) {
      await new Promise(resolve => setTimeout(resolve, waitMs));
      this.refill();
      if (this.tokens > 0) {
        this.tokens--;
        return true;
      }
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed >= this.refillIntervalMs) {
      this.tokens = this.maxTokens;
      this.lastRefill = now;
    }
  }

  /** Visible for testing. */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class KalshiClient {
  private readonly baseUrl: string;
  private readonly rateLimiter: RateLimiter;
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(baseUrl?: string, maxReqPerMin = 10) {
    this.baseUrl = baseUrl ?? KALSHI_API.base;
    this.rateLimiter = new RateLimiter(maxReqPerMin);
  }

  // ─── Market Discovery ───────────────────────────────

  async getMarkets(params?: {
    limit?: number;
    cursor?: string;
    status?: string;
    event_ticker?: string;
  }): Promise<KalshiMarket[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.event_ticker) searchParams.set('event_ticker', params.event_ticker);

    const url = `${this.baseUrl}/markets?${searchParams}`;
    const data = await this.cachedFetch<KalshiMarketsResponse>(url);
    if (!data) return [];

    return (data.markets ?? []).map(m => this.parseMarket(m));
  }

  async getMarket(ticker: string): Promise<KalshiMarket | null> {
    const url = `${this.baseUrl}/markets/${encodeURIComponent(ticker)}`;
    const data = await this.cachedFetch<{ market: KalshiMarketRaw }>(url);
    if (!data?.market) return null;
    return this.parseMarket(data.market);
  }

  async getOrderBook(ticker: string): Promise<OrderBook | null> {
    const url = `${this.baseUrl}/markets/${encodeURIComponent(ticker)}/orderbook`;
    const data = await this.cachedFetch<KalshiOrderBookRaw>(url);
    if (!data) return null;

    // Kalshi orderbook: arrays of [price_cents, quantity]
    const bids = (data.yes ?? []).map(([price, size]) => ({
      price: price / 100,
      size,
    }));
    const asks = (data.no ?? []).map(([price, size]) => ({
      price: price / 100,
      size,
    }));

    const bestBid = bids[0]?.price ?? 0;
    const bestAsk = asks[0]?.price ?? 1;

    return {
      marketId: ticker,
      bids,
      asks,
      spread: bestAsk - bestBid,
      midpoint: (bestBid + bestAsk) / 2,
      timestamp: new Date(),
    };
  }

  async getEvents(params?: {
    limit?: number;
    cursor?: string;
    status?: string;
  }): Promise<KalshiEventRaw[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.status) searchParams.set('status', params.status);

    const url = `${this.baseUrl}/events?${searchParams}`;
    const data = await this.cachedFetch<KalshiEventsResponse>(url);
    if (!data) return [];
    return data.events ?? [];
  }

  async searchMarkets(query: string): Promise<KalshiMarket[]> {
    // Kalshi does not have a dedicated search endpoint;
    // we fetch markets and filter client-side by title match.
    const all = await this.getMarkets({ limit: 200, status: 'open' });
    const q = query.toLowerCase();
    return all.filter(m =>
      m.question.toLowerCase().includes(q) ||
      m.kalshiTicker.toLowerCase().includes(q),
    );
  }

  // ─── Helpers ─────────────────────────────────────────

  private parseMarket(raw: KalshiMarketRaw): KalshiMarket {
    const yesPrice = raw.yes_bid != null ? raw.yes_bid / 100 : 0.5;
    const noPrice = raw.no_bid != null ? raw.no_bid / 100 : 0.5;
    const isActive = raw.status === 'open';

    return {
      id: `kalshi:${raw.ticker}`,
      kalshiTicker: raw.ticker,
      eventTicker: raw.event_ticker ?? '',
      question: raw.title ?? '',
      slug: raw.ticker.toLowerCase(),
      vertical: detectVertical(raw.title ?? '', raw.category),
      endDate: raw.close_time ?? '',
      active: isActive,
      closed: raw.status === 'closed' || raw.status === 'settled',
      tokens: {
        yes: {
          tokenId: `kalshi:${raw.ticker}:yes`,
          price: yesPrice,
          outcome: 'Yes',
        },
        no: {
          tokenId: `kalshi:${raw.ticker}:no`,
          price: noPrice,
          outcome: 'No',
        },
      },
      volume: raw.volume ?? 0,
      liquidity: raw.liquidity ?? raw.open_interest ?? 0,
      lastPrice: raw.last_price != null ? raw.last_price / 100 : yesPrice,
    };
  }

  /**
   * Fetch with caching and rate limiting. Never throws.
   */
  private async cachedFetch<T>(url: string): Promise<T | null> {
    // Check cache
    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    // Rate limit
    const allowed = await this.rateLimiter.acquire();
    if (!allowed) return null;

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) return null;

      const data = await response.json() as T;

      // Store in cache
      this.cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });

      return data;
    } catch {
      return null;
    }
  }

  /** Clear the in-memory cache. */
  clearCache(): void {
    this.cache.clear();
  }

  /** Visible for testing: current rate limiter tokens. */
  getRateLimiterTokens(): number {
    return this.rateLimiter.getTokens();
  }
}

// ---------------------------------------------------------------------------
// Vertical detection (shared logic with polymarket-client)
// ---------------------------------------------------------------------------

function detectVertical(title: string, category?: string): Vertical {
  const text = `${title} ${category ?? ''}`.toLowerCase();
  if (text.includes('temperature') || text.includes('weather') || text.includes('climate')) return 'weather';
  if (text.includes('bitcoin') || text.includes('ethereum') || text.includes('crypto') || text.includes('btc') || text.includes('eth')) return 'crypto';
  if (text.includes('election') || text.includes('president') || text.includes('congress') || text.includes('vote') || text.includes('politics')) return 'politics';
  if (text.includes('nba') || text.includes('nfl') || text.includes('mlb') || text.includes('game') || text.includes('sport')) return 'sports';
  return 'crypto'; // default
}
