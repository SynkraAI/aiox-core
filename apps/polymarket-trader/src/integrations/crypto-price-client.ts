/**
 * Crypto Price Client — fetches live prices from Binance public API (no auth needed).
 * Generates synthetic prediction markets for training the bot on crypto.
 *
 * Markets are generated as: "Will {COIN} be above ${price} in {hours}h?"
 * Resolution: compare actual price at endDate with target price.
 */

import type { Market, Vertical } from '../types/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BinanceTickerResponse {
  symbol: string;
  price: string;
  priceChangePercent?: string;
}

interface CoinConfig {
  symbol: string;      // Binance symbol (e.g., BTCUSDT)
  name: string;        // Display name
  slug: string;        // URL-safe name
  volatilityBps: number; // Typical daily volatility in basis points
}

export interface SyntheticMarket extends Market {
  /** Marks this as a synthetic crypto market for resolution. */
  synthetic: true;
  /** Target price for resolution. */
  targetPrice: number;
  /** Current price when market was generated. */
  currentPrice: number;
  /** Coin symbol (BTCUSDT, etc.) */
  coinSymbol: string;
  /** Direction: above or below. */
  direction: 'above' | 'below';
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const COINS: CoinConfig[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', slug: 'bitcoin', volatilityBps: 300 },
  { symbol: 'ETHUSDT', name: 'Ethereum', slug: 'ethereum', volatilityBps: 400 },
  { symbol: 'SOLUSDT', name: 'Solana', slug: 'solana', volatilityBps: 500 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', slug: 'dogecoin', volatilityBps: 700 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', slug: 'avalanche', volatilityBps: 600 },
  { symbol: 'LINKUSDT', name: 'Chainlink', slug: 'chainlink', volatilityBps: 550 },
];

/**
 * Horizons for synthetic markets (hours).
 * P2 hybrid refactor: removed 4h (too short — noise-dominated, pre-refactor had systematic
 * win-rate inflation in 4h bucket). 1h kept for fast learning feedback.
 */
const HORIZONS = [1, 2, 12, 24, 48];

/**
 * Price levels relative to 24h-average price (% offset).
 * P2 hybrid refactor BUG-2: must be SYMMETRIC to avoid NO bias in uptrending markets.
 * Was [-3, -0.5, 1.5] which gave 2×more "below" markets → 92% NO signals → artificial WR in uptrend.
 */
const PRICE_OFFSETS = [-3, -1.5, -0.5, 0.5, 1.5, 3];

const BINANCE_BASE = 'https://api.binance.com/api/v3';
const CACHE_TTL_MS = 30_000; // 30s cache

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class CryptoPriceClient {
  private cache = new Map<string, CacheEntry<unknown>>();
  private lastGeneration = 0;
  private generatedMarkets: SyntheticMarket[] = [];

  /** Minimum interval between market generations (ms). */
  private static readonly REGEN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Get current price for a Binance symbol.
   */
  async getPrice(symbol: string): Promise<number> {
    const cached = this.getCached<BinanceTickerResponse>(`price:${symbol}`);
    if (cached) return parseFloat(cached.price);

    try {
      const resp = await fetch(`${BINANCE_BASE}/ticker/price?symbol=${symbol}`);
      if (!resp.ok) return 0;
      const data = await resp.json() as BinanceTickerResponse;
      this.setCache(`price:${symbol}`, data);
      return parseFloat(data.price);
    } catch {
      return 0;
    }
  }

  /**
   * Get 24h price change percent.
   */
  async get24hChange(symbol: string): Promise<number> {
    const cached = this.getCached<BinanceTickerResponse>(`change:${symbol}`);
    if (cached) return parseFloat(cached.priceChangePercent || '0');

    try {
      const resp = await fetch(`${BINANCE_BASE}/ticker/24hr?symbol=${symbol}`);
      if (!resp.ok) return 0;
      const data = await resp.json() as BinanceTickerResponse;
      this.setCache(`change:${symbol}`, data);
      return parseFloat(data.priceChangePercent || '0');
    } catch {
      return 0;
    }
  }

  /**
   * Get 24h moving average price (SMA of 24 hourly closes).
   *
   * P2 hybrid refactor BUG-1 fix: previously strike used spot price at generation time,
   * which (combined with 30s-102s latency before entering the trade) creates near-perfect
   * information — "below -3% in 24h" becomes a deterministic bet on the last 30s of price drift.
   *
   * Using 24h SMA grounds the strike in a macro anchor that doesn't leak short-term momentum.
   */
  async get24hAvgPrice(symbol: string): Promise<number> {
    const cached = this.getCached<number>(`avg24:${symbol}`);
    if (cached !== null) return cached;

    try {
      const resp = await fetch(`${BINANCE_BASE}/klines?symbol=${symbol}&interval=1h&limit=24`);
      if (!resp.ok) return 0;
      // Binance klines payload: [openTime, open, high, low, close, volume, closeTime, ...]
      const data = await resp.json() as Array<Array<string | number>>;
      if (!Array.isArray(data) || data.length === 0) return 0;
      const closes = data.map(k => parseFloat(String(k[4]))).filter(n => !isNaN(n) && n > 0);
      if (closes.length === 0) return 0;
      const avg = closes.reduce((s, c) => s + c, 0) / closes.length;
      this.setCache(`avg24:${symbol}`, avg);
      return avg;
    } catch {
      return 0;
    }
  }

  /**
   * Get close price at a specific timestamp (ms epoch) using Binance 1h klines.
   *
   * P2 hybrid refactor BUG-3 fix: resolver was calling `getPrice(symbol)` which returns the
   * current spot when the cron fires (typically minutes after the market's endTime), letting
   * short-term momentum leak into resolution. We now fetch the exact 1h bar that closed at
   * endTime and use its close price.
   *
   * Safety rail: if `timestamp` is in the future or within the last 60s (kline still open),
   * returns 0 — caller must handle and abstain from resolving.
   */
  async getPriceAtTime(symbol: string, timestampMs: number): Promise<number> {
    const now = Date.now();
    if (timestampMs > now - 60_000) {
      // Either future or the 1h bar is still open — cannot resolve safely
      return 0;
    }
    const cacheKey = `historical:${symbol}:${Math.floor(timestampMs / 60000)}`;
    const cached = this.getCached<number>(cacheKey);
    if (cached !== null) return cached;

    try {
      // endTime is exclusive on Binance — add 1 ms to include the bar closing at `timestampMs`
      const resp = await fetch(`${BINANCE_BASE}/klines?symbol=${symbol}&interval=1h&endTime=${timestampMs + 1}&limit=1`);
      if (!resp.ok) return 0;
      const data = await resp.json() as Array<Array<string | number>>;
      if (!Array.isArray(data) || data.length === 0) return 0;
      const kline = data[0];
      const closeTime = Number(kline[6]);
      // Reject if the kline hasn't closed yet (openTime+1h > now)
      if (closeTime > now) return 0;
      const close = parseFloat(String(kline[4]));
      if (isNaN(close) || close <= 0) return 0;
      // Cache for longer — historical data doesn't change
      this.cache.set(cacheKey, { data: close, expiresAt: now + 60 * 60 * 1000 });
      return close;
    } catch {
      return 0;
    }
  }

  /**
   * Generate synthetic prediction markets from live crypto prices.
   * Returns Market[] compatible with the auto-trader pipeline.
   */
  async generateMarkets(): Promise<SyntheticMarket[]> {
    const now = Date.now();

    // Don't regenerate too frequently — reuse existing markets
    if (now - this.lastGeneration < CryptoPriceClient.REGEN_INTERVAL_MS && this.generatedMarkets.length > 0) {
      // Filter out expired markets
      return this.generatedMarkets.filter(m => m.endDate && new Date(m.endDate).getTime() > now);
    }

    const markets: SyntheticMarket[] = [];

    for (const coin of COINS) {
      // P2 BUG-1: strike anchored to 24h SMA, not spot.
      const strikeBaseline = await this.get24hAvgPrice(coin.symbol);
      // Spot still tracked for the momentum adjustment only.
      const spot = await this.getPrice(coin.symbol);
      if (strikeBaseline <= 0 || spot <= 0) continue;

      const change24h = await this.get24hChange(coin.symbol);

      for (const hours of HORIZONS) {
        for (const offsetPct of PRICE_OFFSETS) {
          const targetPrice = strikeBaseline * (1 + offsetPct / 100);
          const direction = offsetPct >= 0 ? 'above' : 'below';
          const endDate = new Date(now + hours * 60 * 60 * 1000);

          // Calculate implied probability based on distance and time
          // Simple model: closer targets = higher probability, more time = closer to 50%
          const distancePct = Math.abs(offsetPct);
          const timeDecay = Math.sqrt(hours / 24); // More time → more uncertainty
          const baseProbability = direction === 'above'
            ? 0.5 - (distancePct / (coin.volatilityBps / 100 * timeDecay)) * 0.3
            : 0.5 + (distancePct / (coin.volatilityBps / 100 * timeDecay)) * 0.3;

          // Adjust for momentum (24h change suggests trend)
          const momentumAdj = (change24h / 100) * 0.1; // 1% change → 0.1% adjustment
          const yesProbability = Math.max(0.05, Math.min(0.95,
            direction === 'above' ? baseProbability + momentumAdj : baseProbability - momentumAdj
          ));

          const formattedPrice = strikeBaseline > 1000
            ? `$${targetPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
            : `$${targetPrice.toFixed(2)}`;

          const marketId = `synth-${coin.slug}-${direction}-${Math.round(targetPrice)}-${hours}h-${now}`;

          markets.push({
            id: marketId,
            question: `Will ${coin.name} be ${direction} ${formattedPrice} in ${hours}h?`,
            slug: `${coin.slug}-${direction}-${Math.round(targetPrice)}-${hours}h`,
            vertical: 'crypto' as Vertical,
            endDate: endDate.toISOString(),
            active: true,
            closed: false,
            volume: 100_000, // Synthetic volume for ranking
            liquidity: 50_000,
            lastPrice: yesProbability,
            tokens: {
              yes: { tokenId: `${marketId}-yes`, price: yesProbability, outcome: 'Yes' },
              no: { tokenId: `${marketId}-no`, price: 1 - yesProbability, outcome: 'No' },
            },
            // Synthetic fields
            synthetic: true,
            targetPrice,
            currentPrice: strikeBaseline, // P2: field name kept for compat but holds 24h avg
            coinSymbol: coin.symbol,
            direction,
          });
        }
      }
    }

    this.generatedMarkets = markets;
    this.lastGeneration = now;
    console.log(`[CryptoPriceClient] Generated ${markets.length} synthetic crypto markets (24h-avg anchors: BTC=$${(await this.get24hAvgPrice('BTCUSDT')).toFixed(0)}, ETH=$${(await this.get24hAvgPrice('ETHUSDT')).toFixed(0)}, SOL=$${(await this.get24hAvgPrice('SOLUSDT')).toFixed(0)})`);

    return markets;
  }

  /**
   * Resolve a synthetic market by comparing the close price at endTime against the target.
   *
   * P2 hybrid refactor BUG-3 fix: uses klines?endTime=X to anchor on the exact hourly close
   * instead of `getPrice()` which returns current spot (leaks up to 5min of drift).
   * Returns null if the bar hasn't closed yet — caller retries next cron tick.
   */
  async resolveMarket(market: SyntheticMarket): Promise<'YES' | 'NO' | null> {
    if (!market.endDate) return null;
    const endTime = new Date(market.endDate).getTime();
    if (Date.now() < endTime) return null; // Not yet expired

    const endTimePrice = await this.getPriceAtTime(market.coinSymbol, endTime);
    if (endTimePrice <= 0) return null;

    if (market.direction === 'above') {
      return endTimePrice >= market.targetPrice ? 'YES' : 'NO';
    } else {
      return endTimePrice <= market.targetPrice ? 'YES' : 'NO';
    }
  }

  // ─── Cache helpers ─────────────────────────────────────

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (entry && Date.now() < entry.expiresAt) return entry.data;
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  }
}
