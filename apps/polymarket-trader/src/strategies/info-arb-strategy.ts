/**
 * Information Arbitrage Strategy for Polymarket.
 *
 * Detects edge by comparing news-adjusted probability estimates
 * against current market prices. Uses NewsAggregator for headline
 * data and sentiment scoring.
 *
 * Strategy ID: 'info_arb'
 *
 * Flow:
 *   1. Extract keywords from market question
 *   2. Fetch & score relevant headlines
 *   3. Compute news-adjusted probability (base = market price)
 *   4. Signal if edge > MIN_EDGE (8%)
 */

import { eventBus } from '../engine/event-bus.js';
import { DEFAULT_RISK_LIMITS } from '../config/defaults.js';
import type { Market, TradeSignal, Side } from '../types/market.js';
import type { NewsAggregator, ScoredNews } from '../integrations/news-aggregator.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum edge required to emit a signal. */
export const MIN_EDGE = DEFAULT_RISK_LIMITS.minEdge; // 0.08

/** Max headline age to consider for recency scoring (milliseconds). */
export const MAX_NEWS_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

/** Probability floor/ceiling to avoid certainty. */
export const PROB_FLOOR = 0.05;
export const PROB_CEILING = 0.95;

/** Maximum adjustment magnitude per scored article. */
export const MAX_SINGLE_ADJUSTMENT = 0.10;

/** Overall cap on cumulative sentiment adjustment. */
export const MAX_TOTAL_ADJUSTMENT = 0.30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a value to [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute a recency weight in [0, 1].
 * Articles published just now get 1.0; articles older than MAX_NEWS_AGE_MS get 0.
 */
export function recencyWeight(publishedAt: Date, now: Date = new Date()): number {
  const ageMs = now.getTime() - publishedAt.getTime();
  if (ageMs <= 0) return 1.0;
  if (ageMs >= MAX_NEWS_AGE_MS) return 0;
  return 1 - ageMs / MAX_NEWS_AGE_MS;
}

/**
 * Calculate the news-adjusted probability given scored articles and a base price.
 *
 *   adjustment = sum(sentiment_i * relevance_i * recency_i) / N
 *
 * The adjustment is clamped so individual articles cannot swing more than
 * MAX_SINGLE_ADJUSTMENT each, and the total shift is bounded by MAX_TOTAL_ADJUSTMENT.
 */
export function calculateAdjustedProbability(
  basePrice: number,
  scoredNews: ScoredNews[],
  now: Date = new Date(),
): number {
  if (scoredNews.length === 0) return basePrice;

  let totalAdjustment = 0;

  for (const sn of scoredNews) {
    const rw = recencyWeight(sn.item.publishedAt, now);
    const raw = sn.sentimentScore * sn.relevanceScore * rw;
    const clamped = clamp(raw, -MAX_SINGLE_ADJUSTMENT, MAX_SINGLE_ADJUSTMENT);
    totalAdjustment += clamped;
  }

  // Average across articles, then clamp total
  const avgAdjustment = totalAdjustment / scoredNews.length;
  const finalAdjustment = clamp(avgAdjustment, -MAX_TOTAL_ADJUSTMENT, MAX_TOTAL_ADJUSTMENT);

  return clamp(basePrice + finalAdjustment, PROB_FLOOR, PROB_CEILING);
}

/**
 * Calculate confidence score based on article count and recency.
 *
 *   - More relevant articles = higher confidence (saturates at 10+)
 *   - Newer articles = higher confidence
 *   - Base confidence: 0.40, max: 0.85
 */
export function calculateConfidence(
  scoredNews: ScoredNews[],
  now: Date = new Date(),
): number {
  if (scoredNews.length === 0) return 0;

  const BASE = 0.40;
  const MAX = 0.85;

  // Article count factor: log curve, saturates around 10 articles
  const countFactor = Math.min(Math.log2(scoredNews.length + 1) / Math.log2(11), 1.0);

  // Average recency factor
  const avgRecency =
    scoredNews.reduce((sum, sn) => sum + recencyWeight(sn.item.publishedAt, now), 0) /
    scoredNews.length;

  // Average relevance
  const avgRelevance =
    scoredNews.reduce((sum, sn) => sum + sn.relevanceScore, 0) / scoredNews.length;

  const raw = BASE + (MAX - BASE) * countFactor * avgRecency * (0.5 + 0.5 * avgRelevance);
  return clamp(raw, 0, MAX);
}

// ---------------------------------------------------------------------------
// InfoArbStrategy
// ---------------------------------------------------------------------------

export class InfoArbStrategy {
  readonly strategyId = 'info_arb' as const;
  private readonly newsAggregator: NewsAggregator;

  constructor(newsAggregator: NewsAggregator) {
    this.newsAggregator = newsAggregator;
  }

  /**
   * Analyze a market for information arbitrage opportunities.
   *
   * Returns a TradeSignal if news-adjusted probability diverges from
   * market price by more than MIN_EDGE. Returns null when:
   *   - No relevant headlines found
   *   - Edge is insufficient
   *   - Market is inactive/closed
   */
  async analyze(market: Market): Promise<TradeSignal | null> {
    // 1. Skip inactive/closed markets
    if (!market.active || market.closed) return null;

    // 2. Fetch headlines using market question as query
    const headlines = await this.newsAggregator.getHeadlines(market.question, 30);
    if (headlines.length === 0) return null;

    // 3. Score and filter relevant headlines
    const scoredNews = this.newsAggregator.findRelevantNews(market.question, headlines);
    if (scoredNews.length === 0) return null;

    // 4. Base probability = current YES token price
    const marketProb = market.tokens.yes.price;
    const now = new Date();

    // 5. Calculate news-adjusted probability
    const modelProb = calculateAdjustedProbability(marketProb, scoredNews, now);

    // 6. Determine side and edge
    const edgeYes = modelProb - marketProb;
    const edgeNo = -edgeYes; // Symmetric: if model > market, YES has edge

    let side: Side;
    let edge: number;

    if (edgeYes > 0 && edgeYes >= edgeNo) {
      side = 'YES';
      edge = edgeYes;
    } else if (edgeNo > 0) {
      side = 'NO';
      edge = edgeNo;
    } else {
      return null; // No positive edge
    }

    // 7. Check minimum edge threshold
    if (edge < MIN_EDGE) return null;

    // 8. Calculate confidence
    const confidence = calculateConfidence(scoredNews, now);

    // 9. Calculate position size (Kelly-inspired)
    const suggestedSize = this.calculateSize(edge, confidence);

    // 10. Build signal
    const signal: TradeSignal = {
      marketId: market.id,
      vertical: market.vertical,
      strategy: this.strategyId,
      side,
      modelProbability: side === 'YES' ? modelProb : 1 - modelProb,
      marketProbability: side === 'YES' ? marketProb : 1 - marketProb,
      edge,
      confidence,
      suggestedSize,
      reasoning: this.buildReasoning(market, scoredNews, modelProb, marketProb, side, edge),
      timestamp: now,
    };

    // 11. Emit on event bus
    eventBus.emit('signal:detected', signal);

    return signal;
  }

  /**
   * Kelly-inspired position sizing capped at maxPositionSize.
   */
  private calculateSize(edge: number, confidence: number): number {
    const maxSize = DEFAULT_RISK_LIMITS.maxPositionSize;
    const fraction = Math.min(edge * confidence * 10, 1.0);
    return Math.round(fraction * maxSize * 100) / 100;
  }

  /**
   * Human-readable reasoning string for the signal.
   */
  private buildReasoning(
    market: Market,
    scoredNews: ScoredNews[],
    modelProb: number,
    marketProb: number,
    side: Side,
    edge: number,
  ): string {
    const topHeadlines = scoredNews
      .slice(0, 3)
      .map((sn) => `"${sn.item.title}" (rel=${sn.relevanceScore.toFixed(2)}, sent=${sn.sentimentScore.toFixed(2)})`)
      .join('; ');

    return (
      `Info Arb on "${market.question}": ` +
      `${scoredNews.length} relevant articles found. ` +
      `Model P=${(modelProb * 100).toFixed(1)}%, Market P=${(marketProb * 100).toFixed(1)}%. ` +
      `${side} edge=${(edge * 100).toFixed(1)}%. ` +
      `Top headlines: ${topHeadlines}`
    );
  }
}
