/**
 * Crypto Strategy: log-normal price model + sentiment adjustment
 * for Polymarket crypto prediction markets.
 *
 * Analyzes markets like "Will BTC be above $X on [date]?" using:
 * 1. Current spot price from CoinGecko
 * 2. Log-normal probability model with historical volatility
 * 3. 24h price momentum as sentiment adjustment
 * 4. Edge detection vs market-implied probability
 */

import { eventBus } from '../engine/event-bus.js';
import type { Market, TradeSignal, Side } from '../types/index.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COINGECKO_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true';

/** Annualised historical volatility (σ). Conservative estimates. */
const VOLATILITY: Record<string, number> = {
  btc: 0.60,
  bitcoin: 0.60,
  eth: 0.80,
  ethereum: 0.80,
};

/** Drift assumption (μ). Neutral = 0. */
const DRIFT = 0;

/** Minimum edge (absolute) to emit a signal. */
const MIN_EDGE = 0.08;

/** Maximum sentiment adjustment (±). */
const MAX_SENTIMENT_ADJUSTMENT = 0.03;

/** Fetch timeout in ms. */
const FETCH_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoinGeckoPrice {
  bitcoin?: { usd: number; usd_24h_change: number };
  ethereum?: { usd: number; usd_24h_change: number };
}

export interface ParsedCryptoMarket {
  asset: 'bitcoin' | 'ethereum';
  assetSymbol: 'btc' | 'eth';
  targetPrice: number;
  direction: 'above' | 'below';
  expiryDate: Date;
}

// ---------------------------------------------------------------------------
// Pure math helpers (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Standard normal CDF via Abramowitz & Stegun approximation.
 * Max error ~1.5e-7 — more than sufficient for trading signals.
 */
export function normalCdf(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Log-normal probability that price > K at time T.
 *
 *   P(S_T > K) = Φ( (ln(S/K) + (μ - σ²/2)·T) / (σ·√T) )
 *
 * @param spot     Current price S
 * @param strike   Target price K
 * @param vol      Annualised volatility σ
 * @param timeYears Time to expiry in years T
 * @param drift    Expected return μ (default 0 = risk-neutral)
 */
export function logNormalProbAbove(
  spot: number,
  strike: number,
  vol: number,
  timeYears: number,
  drift: number = DRIFT,
): number {
  if (timeYears <= 0) {
    return spot > strike ? 1 : 0;
  }
  if (spot <= 0 || strike <= 0 || vol <= 0) return 0;

  const d = (Math.log(spot / strike) + (drift - (vol * vol) / 2) * timeYears) /
    (vol * Math.sqrt(timeYears));

  return normalCdf(d);
}

/**
 * Time from now to a target date, expressed in years.
 * Returns 0 if the date is in the past.
 */
export function timeToExpiryYears(expiry: Date, now: Date = new Date()): number {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, diff / msPerYear);
}

// ---------------------------------------------------------------------------
// Market question parser
// ---------------------------------------------------------------------------

/**
 * Extract crypto asset, target price, direction and expiry from a
 * Polymarket question string.
 *
 * Handles patterns like:
 *   "Will BTC be above $70,000 on April 15?"
 *   "Will Bitcoin be below $60000 by December 31, 2026?"
 *   "Will ETH hit $5,000 by June 2026?"
 *   "BTC above $100K on March 1?"
 */
export function parseCryptoMarketQuestion(question: string): ParsedCryptoMarket | null {
  const q = question.toLowerCase();

  // Detect asset
  let asset: 'bitcoin' | 'ethereum' | null = null;
  let assetSymbol: 'btc' | 'eth' | null = null;

  if (/\b(btc|bitcoin)\b/.test(q)) {
    asset = 'bitcoin';
    assetSymbol = 'btc';
  } else if (/\b(eth|ethereum)\b/.test(q)) {
    asset = 'ethereum';
    assetSymbol = 'eth';
  }

  if (!asset || !assetSymbol) return null;

  // Detect direction
  let direction: 'above' | 'below' = 'above';
  if (/\bbelow\b/.test(q)) {
    direction = 'below';
  }
  // "hit" or "reach" implies above
  if (/\b(hit|reach)\b/.test(q)) {
    direction = 'above';
  }

  // Extract price — handle $70,000  $70000  $100K  $5.5K  $1.2M
  const priceMatch = q.match(/\$\s?([\d,]+(?:\.\d+)?)\s*([km])?/i);
  if (!priceMatch) return null;

  let targetPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
  const suffix = priceMatch[2]?.toLowerCase();
  if (suffix === 'k') targetPrice *= 1_000;
  if (suffix === 'm') targetPrice *= 1_000_000;

  if (targetPrice <= 0 || !Number.isFinite(targetPrice)) return null;

  // Extract date
  const expiryDate = parseDateFromQuestion(question);
  if (!expiryDate) return null;

  return { asset, assetSymbol, targetPrice, direction, expiryDate };
}

/**
 * Best-effort date extraction from a market question.
 * Handles: "April 15", "April 15, 2026", "December 31", "June 2026",
 *          "2026-04-15", "March 1?"
 */
function parseDateFromQuestion(question: string): Date | null {
  const months: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  // ISO format: 2026-04-15
  const isoMatch = question.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }

  // "Month Day, Year" or "Month Day Year" or "Month Day"
  const monthDayYear = question.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?\b/i,
  );
  if (monthDayYear) {
    const month = months[monthDayYear[1].toLowerCase()];
    const day = parseInt(monthDayYear[2]);
    const year = monthDayYear[3] ? parseInt(monthDayYear[3]) : new Date().getFullYear();
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  // "Month Year" (no day — use last day of month)
  const monthYear = question.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i,
  );
  if (monthYear) {
    const month = months[monthYear[1].toLowerCase()];
    const year = parseInt(monthYear[2]);
    if (month !== undefined) {
      // Last day of the month
      return new Date(year, month + 1, 0);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Confidence calculation
// ---------------------------------------------------------------------------

/**
 * Confidence score based on time horizon and data quality.
 * Shorter horizons -> higher confidence (less uncertainty).
 *
 * Returns value in [0.1, 0.95].
 */
export function calculateConfidence(timeYears: number): number {
  // Exponential decay: confidence halves every ~0.5 years
  const base = 0.90 * Math.exp(-1.4 * timeYears);
  return Math.max(0.10, Math.min(0.95, base));
}

// ---------------------------------------------------------------------------
// Sentiment adjustment
// ---------------------------------------------------------------------------

/**
 * Adjust model probability based on 24h price change.
 * Positive momentum slightly boosts "above" probability.
 * Clamped to ±MAX_SENTIMENT_ADJUSTMENT.
 */
export function sentimentAdjustment(priceChange24h: number, direction: 'above' | 'below'): number {
  // Map 24h change to a small adjustment.
  // ±10% daily move -> ±MAX_SENTIMENT_ADJUSTMENT
  const raw = (priceChange24h / 100) * MAX_SENTIMENT_ADJUSTMENT * 10;
  const clamped = Math.max(-MAX_SENTIMENT_ADJUSTMENT, Math.min(MAX_SENTIMENT_ADJUSTMENT, raw));

  // If direction is "below", flip the sign
  return direction === 'above' ? clamped : -clamped;
}

// ---------------------------------------------------------------------------
// CryptoStrategy class
// ---------------------------------------------------------------------------

export class CryptoStrategy {
  private lastPriceData: CoinGeckoPrice | null = null;
  private lastFetchTime = 0;
  private cacheTtlMs = 30_000; // Cache price data for 30 seconds

  /**
   * Analyse a Polymarket market and return a TradeSignal if edge is found,
   * or null otherwise.
   */
  async analyze(market: Market): Promise<TradeSignal | null> {
    // Only process crypto markets
    if (market.vertical !== 'crypto') return null;
    if (market.closed || !market.active) return null;

    // Parse market question
    const parsed = parseCryptoMarketQuestion(market.question);
    if (!parsed) return null;

    // Fetch current price
    const priceData = await this.fetchPrices();
    if (!priceData) return null;

    const coinData = priceData[parsed.asset];
    if (!coinData) return null;

    const spot = coinData.usd;
    const change24h = coinData.usd_24h_change ?? 0;

    // Calculate time to expiry
    const timeYears = timeToExpiryYears(parsed.expiryDate);
    if (timeYears <= 0) return null; // Market already expired

    // Get volatility for this asset
    const vol = VOLATILITY[parsed.assetSymbol] ?? 0.70;

    // Log-normal probability
    let probAbove = logNormalProbAbove(spot, parsed.targetPrice, vol, timeYears);

    // Apply sentiment adjustment
    const sentAdj = sentimentAdjustment(change24h, parsed.direction);
    probAbove = Math.max(0.01, Math.min(0.99, probAbove + sentAdj));

    // Model probability based on direction
    const modelProb = parsed.direction === 'above' ? probAbove : 1 - probAbove;

    // Market-implied probability
    const marketProb = market.tokens.yes.price;

    // Edge calculation
    const edge = modelProb - marketProb;

    // Only signal on sufficient edge
    if (Math.abs(edge) < MIN_EDGE) return null;

    // Determine side
    const side: Side = edge > 0 ? 'YES' : 'NO';
    const effectiveEdge = Math.abs(edge);

    // Confidence
    const confidence = calculateConfidence(timeYears);

    // Suggested size scales with edge and confidence
    const suggestedSize = Math.round(effectiveEdge * confidence * 100 * 100) / 100;

    const signal: TradeSignal = {
      marketId: market.id,
      vertical: 'crypto',
      strategy: 'crypto_sentiment',
      side,
      modelProbability: side === 'YES' ? modelProb : 1 - modelProb,
      marketProbability: marketProb,
      edge: effectiveEdge,
      confidence,
      suggestedSize,
      reasoning: this.buildReasoning(parsed, spot, modelProb, marketProb, edge, change24h, timeYears),
      timestamp: new Date(),
    };

    // Emit signal on event bus
    eventBus.emit('signal:detected', signal);

    return signal;
  }

  /**
   * Fetch BTC/ETH price data from CoinGecko.
   * Uses a simple in-memory cache to avoid rate-limiting.
   * Returns null on failure — never throws.
   */
  async fetchPrices(): Promise<CoinGeckoPrice | null> {
    const now = Date.now();
    if (this.lastPriceData && now - this.lastFetchTime < this.cacheTtlMs) {
      return this.lastPriceData;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch(COINGECKO_PRICE_URL, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      clearTimeout(timeout);

      if (!response.ok) return null;

      const data = (await response.json()) as CoinGeckoPrice;
      this.lastPriceData = data;
      this.lastFetchTime = now;
      return data;
    } catch {
      // Network error, timeout, rate limit — return null, don't crash
      return null;
    }
  }

  /**
   * Build a human-readable reasoning string for the signal.
   */
  private buildReasoning(
    parsed: ParsedCryptoMarket,
    spot: number,
    modelProb: number,
    marketProb: number,
    edge: number,
    change24h: number,
    timeYears: number,
  ): string {
    const assetLabel = parsed.assetSymbol.toUpperCase();
    const dirLabel = parsed.direction;
    const daysToExpiry = Math.round(timeYears * 365.25);
    const pctFromTarget = ((spot - parsed.targetPrice) / parsed.targetPrice * 100).toFixed(1);

    return [
      `${assetLabel} spot $${spot.toLocaleString()} is ${pctFromTarget}% from target $${parsed.targetPrice.toLocaleString()}.`,
      `Log-normal model: ${(modelProb * 100).toFixed(1)}% chance ${dirLabel} target in ${daysToExpiry}d.`,
      `Market implies ${(marketProb * 100).toFixed(1)}%. Edge: ${(edge * 100).toFixed(1)}%.`,
      `24h change: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(1)}%.`,
    ].join(' ');
  }

  /**
   * Invalidate the price cache (useful for testing or forced refresh).
   */
  clearCache(): void {
    this.lastPriceData = null;
    this.lastFetchTime = 0;
  }
}
