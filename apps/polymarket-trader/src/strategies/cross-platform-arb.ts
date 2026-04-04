/**
 * Cross-Platform Arbitrage Detection Strategy.
 *
 * Detects risk-free profit opportunities within Polymarket:
 *   1. Intra-market: YES + NO != $1.00 on same market
 *   2. Cross-market: Same event priced differently across two markets
 *
 * Cross-platform (Polymarket vs Kalshi) is typed but not yet implemented
 * -- requires external price feeds (pmxt integration planned).
 *
 * All calculations account for taker fees (1% per leg = 2% round trip).
 */

import { eventBus } from '../engine/event-bus.js';
import type { Market, TradeSignal, Side } from '../types/market.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Polymarket taker fee per leg (1%). */
export const TAKER_FEE_RATE = 0.01;

/** Number of legs in an arb trade. */
export const ARB_LEGS = 2;

/** Total fee for a full arb (buy + sell legs). */
export const TOTAL_FEE_RATE = TAKER_FEE_RATE * ARB_LEGS;

/** Kalshi taker fee per leg (~1.5%). */
export const KALSHI_FEE_RATE = 0.015;

/** Total fee for a cross-platform arb (Polymarket ~1% + Kalshi ~1.5% = ~2.5%). */
export const CROSS_PLATFORM_FEE_RATE = TAKER_FEE_RATE + KALSHI_FEE_RATE;

/** Minimum profit % for cross-platform arb (higher due to execution risk). */
export const CROSS_PLATFORM_MIN_PROFIT = 3.0;

/** Base confidence for cross-platform arb (lower due to execution risk). */
export const CROSS_PLATFORM_BASE_CONFIDENCE = 0.50;

/** Guaranteed payout for a binary market: one side always resolves to $1.00. */
export const BINARY_PAYOUT = 1.0;

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type ArbType = 'intra_market' | 'cross_market' | 'cross_platform';

export interface ArbOpportunity {
  type: ArbType;
  markets: string[];
  buyLeg: { marketId: string; side: Side; price: number };
  sellLeg: { marketId: string; side: Side; price: number };
  totalCost: number;
  guaranteedPayout: number;
  profitPercent: number;
  confidence: number;
  detectedAt: Date;
}

export interface CrossPlatformArbConfig {
  /** Minimum arbitrage profit % to emit a signal (default: 1.5). */
  minArbPercent: number;
  /** Maximum age of price data in ms before it is considered stale (default: 60000). */
  maxAgeMs: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract key entities from a market question for similarity matching.
 * Returns lowercased tokens stripped of common stop words.
 */
export function extractEntities(question: string): string[] {
  const stopWords = new Set([
    'will', 'the', 'be', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'by',
    'or', 'and', 'is', 'it', 'this', 'that', 'for', 'with', 'as', 'from',
    'end', 'before', 'after', 'above', 'below', 'over', 'under', 'between',
    'than', 'more', 'less', 'month', 'year', 'day', 'week',
  ]);

  return question
    .toLowerCase()
    .replace(/[^a-z0-9$%.\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !stopWords.has(token));
}

/**
 * Jaccard similarity between two entity sets (intersection / union).
 */
export function entityOverlap(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check whether two market end dates are within a given number of days.
 */
export function endDatesClose(dateA: string, dateB: string, maxDaysDiff = 3): boolean {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  if (isNaN(a) || isNaN(b)) return false;
  const diffMs = Math.abs(a - b);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= maxDaysDiff;
}

/**
 * Calculate profit after accounting for taker fees on each leg.
 */
export function calculateNetProfit(totalCost: number, payout: number): number {
  const fees = totalCost * TOTAL_FEE_RATE;
  return payout - totalCost - fees;
}

/**
 * Calculate profit percent relative to total cost.
 */
export function calculateProfitPercent(totalCost: number, payout: number): number {
  if (totalCost <= 0) return 0;
  const netProfit = calculateNetProfit(totalCost, payout);
  return (netProfit / totalCost) * 100;
}

/**
 * Calculate net profit for cross-platform arb (higher fees: PM 1% + Kalshi 1.5%).
 */
export function calculateCrossPlatformNetProfit(totalCost: number, payout: number): number {
  const fees = totalCost * CROSS_PLATFORM_FEE_RATE;
  return payout - totalCost - fees;
}

/**
 * Calculate profit percent for cross-platform arb.
 */
export function calculateCrossPlatformProfitPercent(totalCost: number, payout: number): number {
  if (totalCost <= 0) return 0;
  const netProfit = calculateCrossPlatformNetProfit(totalCost, payout);
  return (netProfit / totalCost) * 100;
}

// ---------------------------------------------------------------------------
// Strategy
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: CrossPlatformArbConfig = {
  minArbPercent: 1.5,
  maxAgeMs: 60_000,
};

export class CrossPlatformArbStrategy {
  readonly strategyId = 'cross_platform' as const;
  private readonly config: CrossPlatformArbConfig;

  constructor(config?: Partial<CrossPlatformArbConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // -------------------------------------------------------------------------
  // Intra-market arbitrage
  // -------------------------------------------------------------------------

  /**
   * Check a single market for intra-market arb.
   *
   * If YES + NO < $1.00, buying both sides guarantees profit.
   * (YES + NO > $1.00 means selling both, which is rare and harder to
   *  execute -- we skip that case for now.)
   */
  checkIntraMarketArb(market: Market): ArbOpportunity | null {
    if (!market.active || market.closed) return null;

    const yesPrice = market.tokens.yes.price;
    const noPrice = market.tokens.no.price;
    const totalCost = yesPrice + noPrice;

    // Only profitable if total cost < payout after fees
    if (totalCost >= BINARY_PAYOUT) return null;

    const profitPercent = calculateProfitPercent(totalCost, BINARY_PAYOUT);
    if (profitPercent < this.config.minArbPercent) return null;

    return {
      type: 'intra_market',
      markets: [market.id],
      buyLeg: { marketId: market.id, side: 'YES', price: yesPrice },
      sellLeg: { marketId: market.id, side: 'NO', price: noPrice },
      totalCost,
      guaranteedPayout: BINARY_PAYOUT,
      profitPercent,
      confidence: this.calculateConfidence(profitPercent, 'intra_market'),
      detectedAt: new Date(),
    };
  }

  // -------------------------------------------------------------------------
  // Cross-market arbitrage
  // -------------------------------------------------------------------------

  /**
   * Check two markets for cross-market arb.
   *
   * If market1 and market2 describe the same event (by entity overlap and
   * end date proximity), look for:
   *   buy YES on cheaper market + buy NO on more expensive market
   *   total cost < $1.00 after fees = profit
   */
  checkCrossMarketArb(market1: Market, market2: Market): ArbOpportunity | null {
    if (!market1.active || market1.closed) return null;
    if (!market2.active || market2.closed) return null;

    // 1. Check question similarity
    const entities1 = extractEntities(market1.question);
    const entities2 = extractEntities(market2.question);
    const overlap = entityOverlap(entities1, entities2);
    if (overlap < 0.70) return null;

    // 2. Check end date proximity
    if (!endDatesClose(market1.endDate, market2.endDate)) return null;

    // 3. Find the best arb combination
    // Option A: buy YES on m1 + buy NO on m2
    const costA = market1.tokens.yes.price + market2.tokens.no.price;
    // Option B: buy NO on m1 + buy YES on m2
    const costB = market1.tokens.no.price + market2.tokens.yes.price;

    let buyLeg: { marketId: string; side: Side; price: number };
    let sellLeg: { marketId: string; side: Side; price: number };
    let totalCost: number;

    if (costA <= costB) {
      totalCost = costA;
      buyLeg = { marketId: market1.id, side: 'YES', price: market1.tokens.yes.price };
      sellLeg = { marketId: market2.id, side: 'NO', price: market2.tokens.no.price };
    } else {
      totalCost = costB;
      buyLeg = { marketId: market2.id, side: 'YES', price: market2.tokens.yes.price };
      sellLeg = { marketId: market1.id, side: 'NO', price: market1.tokens.no.price };
    }

    if (totalCost >= BINARY_PAYOUT) return null;

    const profitPercent = calculateProfitPercent(totalCost, BINARY_PAYOUT);
    if (profitPercent < this.config.minArbPercent) return null;

    return {
      type: 'cross_market',
      markets: [market1.id, market2.id],
      buyLeg,
      sellLeg,
      totalCost,
      guaranteedPayout: BINARY_PAYOUT,
      profitPercent,
      confidence: this.calculateConfidence(profitPercent, 'cross_market'),
      detectedAt: new Date(),
    };
  }

  // -------------------------------------------------------------------------
  // Cross-platform arbitrage (Polymarket vs Kalshi)
  // -------------------------------------------------------------------------

  /**
   * Check for arb between a Polymarket market and a Kalshi market.
   *
   * Matches by topic similarity (entity overlap) and end date proximity.
   * Uses higher fee rate (2.5% round trip) and higher min profit (3%).
   * Base confidence is 50% due to cross-platform execution risk.
   */
  checkCrossPlatformArb(polyMarket: Market, kalshiMarket: Market): ArbOpportunity | null {
    if (!polyMarket.active || polyMarket.closed) return null;
    if (!kalshiMarket.active || kalshiMarket.closed) return null;

    // 1. Check question similarity
    const polyEntities = extractEntities(polyMarket.question);
    const kalshiEntities = extractEntities(kalshiMarket.question);
    const overlap = entityOverlap(polyEntities, kalshiEntities);
    if (overlap < 0.50) return null; // Lower threshold for cross-platform (different wording)

    // 2. Check end date proximity (allow 5 days for cross-platform)
    if (!endDatesClose(polyMarket.endDate, kalshiMarket.endDate, 5)) return null;

    // 3. Compare midpoint prices between platforms
    const polyYes = polyMarket.tokens.yes.price;
    const polyNo = polyMarket.tokens.no.price;
    const kalshiYes = kalshiMarket.tokens.yes.price;
    const kalshiNo = kalshiMarket.tokens.no.price;

    // Option A: buy YES on Poly + buy NO on Kalshi
    const costA = polyYes + kalshiNo;
    // Option B: buy NO on Poly + buy YES on Kalshi
    const costB = polyNo + kalshiYes;

    let buyLeg: { marketId: string; side: Side; price: number };
    let sellLeg: { marketId: string; side: Side; price: number };
    let totalCost: number;

    if (costA <= costB) {
      totalCost = costA;
      buyLeg = { marketId: polyMarket.id, side: 'YES', price: polyYes };
      sellLeg = { marketId: kalshiMarket.id, side: 'NO', price: kalshiNo };
    } else {
      totalCost = costB;
      buyLeg = { marketId: kalshiMarket.id, side: 'YES', price: kalshiYes };
      sellLeg = { marketId: polyMarket.id, side: 'NO', price: polyNo };
    }

    if (totalCost >= BINARY_PAYOUT) return null;

    const profitPercent = calculateCrossPlatformProfitPercent(totalCost, BINARY_PAYOUT);
    if (profitPercent < CROSS_PLATFORM_MIN_PROFIT) return null;

    return {
      type: 'cross_platform',
      markets: [polyMarket.id, kalshiMarket.id],
      buyLeg,
      sellLeg,
      totalCost,
      guaranteedPayout: BINARY_PAYOUT,
      profitPercent,
      confidence: this.calculateConfidence(profitPercent, 'cross_platform'),
      detectedAt: new Date(),
    };
  }

  /**
   * Scan Polymarket and Kalshi market lists for cross-platform arbs.
   * O(n*m) matching — acceptable for reasonable list sizes.
   */
  scanCrossPlatform(polyMarkets: Market[], kalshiMarkets: Market[]): ArbOpportunity[] {
    const opportunities: ArbOpportunity[] = [];

    for (const poly of polyMarkets) {
      for (const kalshi of kalshiMarkets) {
        const arb = this.checkCrossPlatformArb(poly, kalshi);
        if (arb) opportunities.push(arb);
      }
    }

    opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
    return opportunities;
  }

  // -------------------------------------------------------------------------
  // Scanner
  // -------------------------------------------------------------------------

  /**
   * Scan a list of markets for all arb opportunities.
   * Returns results sorted by profitPercent descending.
   */
  scanForArbitrage(markets: Market[]): ArbOpportunity[] {
    const opportunities: ArbOpportunity[] = [];

    // 1. Check every market for intra-market arb
    for (const market of markets) {
      const intra = this.checkIntraMarketArb(market);
      if (intra) opportunities.push(intra);
    }

    // 2. Check all pairs for cross-market arb
    for (let i = 0; i < markets.length; i++) {
      for (let j = i + 1; j < markets.length; j++) {
        const cross = this.checkCrossMarketArb(markets[i], markets[j]);
        if (cross) opportunities.push(cross);
      }
    }

    // 3. Sort by profit descending
    opportunities.sort((a, b) => b.profitPercent - a.profitPercent);

    return opportunities;
  }

  // -------------------------------------------------------------------------
  // Signal conversion
  // -------------------------------------------------------------------------

  /**
   * Convert an arb opportunity into two TradeSignals (one per leg).
   * Emits 'signal:detected' on the event bus for each signal.
   */
  toSignals(arb: ArbOpportunity): TradeSignal[] {
    const baseSignal = {
      vertical: 'crypto' as const,  // arb is cross-vertical; default to crypto
      strategy: this.strategyId,
      modelProbability: arb.guaranteedPayout,
      confidence: arb.confidence,
      timestamp: arb.detectedAt,
    };

    const buySignal: TradeSignal = {
      ...baseSignal,
      marketId: arb.buyLeg.marketId,
      side: arb.buyLeg.side,
      marketProbability: arb.buyLeg.price,
      edge: arb.profitPercent / 100,
      suggestedSize: arb.totalCost / 2,
      reasoning: `ARB ${arb.type}: Buy ${arb.buyLeg.side} @ $${arb.buyLeg.price.toFixed(3)} on ${arb.buyLeg.marketId}. ` +
        `Profit ${arb.profitPercent.toFixed(2)}% after fees.`,
    };

    const sellSignal: TradeSignal = {
      ...baseSignal,
      marketId: arb.sellLeg.marketId,
      side: arb.sellLeg.side,
      marketProbability: arb.sellLeg.price,
      edge: arb.profitPercent / 100,
      suggestedSize: arb.totalCost / 2,
      reasoning: `ARB ${arb.type}: Buy ${arb.sellLeg.side} @ $${arb.sellLeg.price.toFixed(3)} on ${arb.sellLeg.marketId}. ` +
        `Profit ${arb.profitPercent.toFixed(2)}% after fees.`,
    };

    eventBus.emit('signal:detected', buySignal);
    eventBus.emit('signal:detected', sellSignal);

    return [buySignal, sellSignal];
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Confidence is higher for intra-market (same market, very reliable) vs
   * cross-market (relies on question matching heuristic).
   * Higher profit also boosts confidence.
   */
  private calculateConfidence(profitPercent: number, type: ArbType): number {
    let baseConfidence: number;
    if (type === 'intra_market') {
      baseConfidence = 0.95;
    } else if (type === 'cross_market') {
      baseConfidence = 0.70;
    } else {
      // cross_platform — highest execution risk
      baseConfidence = CROSS_PLATFORM_BASE_CONFIDENCE;
    }
    const profitBoost = Math.min(profitPercent * 0.01, 0.10);
    return Math.min(baseConfidence + profitBoost, 0.99);
  }
}
