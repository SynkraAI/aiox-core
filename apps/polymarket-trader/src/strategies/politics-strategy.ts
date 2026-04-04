/**
 * Politics Strategy for Polymarket election/political prediction markets.
 *
 * Combines polling data concepts, news sentiment, and Twitter momentum
 * to estimate probabilities for political outcomes. Detects edge by
 * comparing multi-source adjusted probability against market price.
 *
 * Data sources:
 *   1. NewsAggregator — political news sentiment
 *   2. TwitterSentimentAdapter — political tweet sentiment / momentum
 *   3. Poll-adjusted probability model
 *
 * Strategy ID: 'politics_model'
 *
 * Flow:
 *   1. Parse market question (candidate, election type, date)
 *   2. Fetch news sentiment + Twitter momentum
 *   3. Compute multi-factor adjusted probability
 *   4. Signal if edge > MIN_EDGE (10%)
 */

import { eventBus } from '../engine/event-bus.js';
import { DEFAULT_RISK_LIMITS } from '../config/defaults.js';
import type { Market, TradeSignal, Side } from '../types/market.js';
import type { NewsAggregator, ScoredNews } from '../integrations/news-aggregator.js';
import type { TwitterSentimentAdapter, TrendingSentiment } from '../integrations/twitter-sentiment.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum edge required to emit a signal (10% — politics markets are efficient). */
export const MIN_EDGE = 0.10;

/** Minimum confidence to emit a signal. */
export const MIN_CONFIDENCE = 0.40;

/** Minimum volume for politics markets ($10K). */
export const MIN_VOLUME = 10_000;

/** Minimum volume for markets > 30 days out ($50K). */
export const MIN_VOLUME_LONG_TERM = 50_000;

/** Max days for long-term volume filter. */
export const LONG_TERM_DAYS = 30;

/** Maximum news sentiment adjustment (±5%). */
export const MAX_NEWS_ADJUSTMENT = 0.05;

/** Maximum Twitter momentum adjustment (±3%). */
export const MAX_TWITTER_ADJUSTMENT = 0.03;

/** Incumbency bias for close races (+2%). */
export const INCUMBENCY_BIAS = 0.02;

/** Max overall probability adjustment from all factors. */
export const MAX_TOTAL_ADJUSTMENT = 0.15;

/** News overreaction window (48 hours in ms). */
export const OVERREACTION_WINDOW_MS = 48 * 60 * 60 * 1000;

/** Probability floor/ceiling to avoid certainty. */
export const PROB_FLOOR = 0.03;
export const PROB_CEILING = 0.97;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ElectionType = 'presidential' | 'senate' | 'house' | 'gubernatorial' | 'primary' | 'general' | 'nomination' | 'other';

export interface ParsedPoliticsMarket {
  candidates: string[];
  electionType: ElectionType;
  targetDate: Date | null;
  isIncumbent: boolean;
  questionType: 'win_election' | 'be_nominee' | 'happen_before_date' | 'other';
  rawQuestion: string;
}

export interface PoliticsStrategyConfig {
  minEdge: number;
  minConfidence: number;
  minVolume: number;
  minVolumeLongTerm: number;
  longTermDays: number;
  maxNewsAdjustment: number;
  maxTwitterAdjustment: number;
  incumbencyBias: number;
}

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

const DEFAULT_POLITICS_CONFIG: PoliticsStrategyConfig = {
  minEdge: MIN_EDGE,
  minConfidence: MIN_CONFIDENCE,
  minVolume: MIN_VOLUME,
  minVolumeLongTerm: MIN_VOLUME_LONG_TERM,
  longTermDays: LONG_TERM_DAYS,
  maxNewsAdjustment: MAX_NEWS_ADJUSTMENT,
  maxTwitterAdjustment: MAX_TWITTER_ADJUSTMENT,
  incumbencyBias: INCUMBENCY_BIAS,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a value to [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Known politicians / incumbents for incumbency bias
// ---------------------------------------------------------------------------

export const KNOWN_INCUMBENTS: ReadonlySet<string> = new Set([
  'biden', 'trump', 'harris', 'desantis', 'newsom', 'abbott',
  'mcconnell', 'schumer', 'pelosi', 'johnson', 'macron',
  'trudeau', 'starmer', 'modi', 'lula', 'milei',
]);

export const ELECTION_TYPE_KEYWORDS: Record<ElectionType, ReadonlySet<string>> = {
  presidential: new Set(['president', 'presidential', 'white house', 'oval office']),
  senate: new Set(['senate', 'senator', 'senatorial']),
  house: new Set(['house', 'representative', 'congressional', 'congress']),
  gubernatorial: new Set(['governor', 'gubernatorial']),
  primary: new Set(['primary', 'primaries']),
  general: new Set(['general election']),
  nomination: new Set(['nominee', 'nomination', 'nominate', 'nominated']),
  other: new Set([]),
};

// ---------------------------------------------------------------------------
// Market question parser
// ---------------------------------------------------------------------------

/**
 * Parse a Polymarket politics market question to extract candidates,
 * election type, date, and question format.
 *
 * Handles patterns like:
 *   "Will Trump win the 2028 presidential election?"
 *   "Will Harris be the Democratic nominee?"
 *   "Will Biden resign before January 2027?"
 *   "Will the Republicans win the Senate in 2026?"
 */
export function parsePoliticsQuestion(question: string): ParsedPoliticsMarket | null {
  const q = question.toLowerCase();

  // Must contain political indicators
  if (!hasPoliticalIndicators(q)) return null;

  // Extract candidates
  const candidates = extractCandidates(q);

  // Detect election type
  const electionType = detectElectionType(q);

  // Detect question type
  const questionType = detectQuestionType(q);

  // Extract date if present
  const targetDate = extractPoliticsDate(question);

  // Check incumbency
  const isIncumbent = candidates.some((c) => KNOWN_INCUMBENTS.has(c.toLowerCase()));

  return {
    candidates,
    electionType,
    targetDate,
    isIncumbent,
    questionType,
    rawQuestion: question,
  };
}

/**
 * Check if the question contains political indicators.
 */
export function hasPoliticalIndicators(q: string): boolean {
  const indicators = [
    'election', 'vote', 'president', 'democrat', 'republican',
    'congress', 'senate', 'poll', 'candidate', 'campaign',
    'governor', 'nominee', 'nominate', 'primary', 'ballot',
    'party', 'win', 'elected', 'resign', 'impeach',
  ];
  return indicators.some((ind) => q.includes(ind));
}

/**
 * Extract candidate names from the question.
 * Looks for capitalized proper nouns and known politician names.
 */
export function extractCandidates(q: string): string[] {
  const knownPoliticians = [
    'trump', 'biden', 'harris', 'desantis', 'newsom', 'haley',
    'ramaswamy', 'pence', 'abbott', 'whitmer', 'shapiro',
    'mcconnell', 'schumer', 'pelosi', 'johnson', 'vance',
    'kennedy', 'rfk', 'sanders', 'warren', 'buttigieg',
    'obama', 'clinton', 'bush', 'romney', 'cruz', 'rubio',
    'ocasio-cortez', 'aoc', 'gaetz', 'greene', 'manchin',
    'macron', 'starmer', 'sunak', 'trudeau', 'modi', 'lula', 'milei',
  ];

  const found: string[] = [];
  for (const name of knownPoliticians) {
    if (q.includes(name)) {
      found.push(name);
    }
  }

  // Also extract capitalized words from the original (before lowering)
  // that might be unknown candidates — but we already receive lowercase q
  // so we only rely on the known list
  return found;
}

/**
 * Detect the election type from the question text.
 */
export function detectElectionType(q: string): ElectionType {
  for (const [type, keywords] of Object.entries(ELECTION_TYPE_KEYWORDS) as Array<[ElectionType, ReadonlySet<string>]>) {
    if (type === 'other') continue;
    for (const kw of keywords) {
      if (q.includes(kw)) return type;
    }
  }
  return 'other';
}

/**
 * Detect the question type (win election, be nominee, or happen before date).
 */
export function detectQuestionType(q: string): ParsedPoliticsMarket['questionType'] {
  if (/\b(nominee|nomination|nominate)\b/.test(q)) return 'be_nominee';
  if (/\bbefore\b/.test(q)) return 'happen_before_date';
  if (/\b(win|elected|victory)\b/.test(q)) return 'win_election';
  return 'other';
}

/**
 * Extract a date from a politics market question.
 * Handles: "2028 presidential election", "before January 2027",
 *          "in November 2026", "by March 15, 2027"
 */
export function extractPoliticsDate(question: string): Date | null {
  const months: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  // ISO format: 2027-11-05
  const isoMatch = question.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }

  // "Month Day, Year" or "Month Day"
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

  // "Month Year" (use first of month)
  const monthYear = question.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i,
  );
  if (monthYear) {
    const month = months[monthYear[1].toLowerCase()];
    const year = parseInt(monthYear[2]);
    if (month !== undefined) {
      return new Date(year, month, 1);
    }
  }

  // Just a year: "2028 presidential election"
  const yearOnly = question.match(/\b(20\d{2})\b/);
  if (yearOnly) {
    const year = parseInt(yearOnly[1]);
    // Default to November (election month) for election questions
    return new Date(year, 10, 5); // Nov 5 (typical US election day)
  }

  return null;
}

// ---------------------------------------------------------------------------
// Probability model
// ---------------------------------------------------------------------------

/**
 * Calculate days until a target date.
 */
export function daysUntil(targetDate: Date, now: Date = new Date()): number {
  const diffMs = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Time decay factor: as election approaches, markets become more efficient.
 * Returns a confidence multiplier in [0.5, 1.0].
 * Far out => lower confidence (0.5), close => higher (1.0).
 */
export function timeDecayFactor(daysOut: number): number {
  if (daysOut <= 0) return 1.0;
  if (daysOut <= 7) return 0.95;
  if (daysOut <= 30) return 0.85;
  if (daysOut <= 90) return 0.70;
  if (daysOut <= 180) return 0.60;
  return 0.50;
}

/**
 * Calculate news sentiment adjustment from scored news articles.
 * Clamped to ±maxAdjustment.
 */
export function calculateNewsSentimentAdjustment(
  scoredNews: ScoredNews[],
  maxAdjustment: number = MAX_NEWS_ADJUSTMENT,
): number {
  if (scoredNews.length === 0) return 0;

  let totalSentiment = 0;
  for (const sn of scoredNews) {
    totalSentiment += sn.sentimentScore * sn.relevanceScore;
  }

  const avgSentiment = totalSentiment / scoredNews.length;
  return clamp(avgSentiment * maxAdjustment * 5, -maxAdjustment, maxAdjustment);
}

/**
 * Calculate Twitter momentum adjustment from trending sentiment.
 * Clamped to ±maxAdjustment.
 */
export function calculateTwitterMomentumAdjustment(
  sentiment: TrendingSentiment,
  maxAdjustment: number = MAX_TWITTER_ADJUSTMENT,
): number {
  if (sentiment.tweetCount === 0) return 0;

  // Use average sentiment, weighted by volume
  const volumeFactor = Math.min(sentiment.tweetCount / 50, 1.0);
  const raw = sentiment.averageSentiment * volumeFactor * maxAdjustment * 3;
  return clamp(raw, -maxAdjustment, maxAdjustment);
}

/**
 * Calculate incumbency bias adjustment.
 * Only applies when market is close (45-55% range).
 */
export function calculateIncumbencyBias(
  isIncumbent: boolean,
  baseProb: number,
  bias: number = INCUMBENCY_BIAS,
): number {
  if (!isIncumbent) return 0;
  // Only apply in close races (40-60% range)
  if (baseProb < 0.40 || baseProb > 0.60) return 0;
  return bias;
}

/**
 * Detect if news is within the overreaction window (48h).
 * Markets tend to overreact to news and correct within 48h.
 * Returns a contrarian adjustment if strong recent news detected.
 */
export function calculateOverreactionAdjustment(
  scoredNews: ScoredNews[],
  now: Date = new Date(),
): number {
  const recentNews = scoredNews.filter((sn) => {
    const ageMs = now.getTime() - sn.item.publishedAt.getTime();
    return ageMs >= 0 && ageMs <= OVERREACTION_WINDOW_MS;
  });

  if (recentNews.length < 3) return 0;

  // Calculate strong sentiment direction
  let totalSentiment = 0;
  for (const sn of recentNews) {
    totalSentiment += sn.sentimentScore;
  }
  const avgSentiment = totalSentiment / recentNews.length;

  // If strong sentiment (>0.5 or <-0.5), apply small contrarian adjustment
  if (Math.abs(avgSentiment) > 0.5) {
    return -avgSentiment * 0.02; // Contrarian: go against the herd
  }

  return 0;
}

/**
 * Calculate confidence score based on data quality and quantity.
 * Returns value in [0.10, 0.85].
 */
export function calculateConfidence(
  newsCount: number,
  tweetCount: number,
  daysOut: number,
  hasCandidate: boolean,
): number {
  const BASE = 0.35;
  const MAX = 0.85;

  // Data quality factor: more sources = higher confidence
  const newsQuality = Math.min(newsCount / 10, 1.0) * 0.3;
  const twitterQuality = Math.min(tweetCount / 30, 1.0) * 0.2;

  // Time factor: closer events have more data
  const timeFactor = timeDecayFactor(daysOut) * 0.3;

  // Candidate recognition factor
  const candidateFactor = hasCandidate ? 0.2 : 0.1;

  const raw = BASE + newsQuality + twitterQuality + timeFactor * 0.5 + candidateFactor;
  return clamp(raw, 0.10, MAX);
}

// ---------------------------------------------------------------------------
// PoliticsStrategy class
// ---------------------------------------------------------------------------

export class PoliticsStrategy {
  readonly strategyId = 'politics_model' as const;
  readonly vertical = 'politics' as const;
  private readonly config: PoliticsStrategyConfig;
  private readonly newsAggregator: NewsAggregator;
  private readonly twitterAdapter: TwitterSentimentAdapter;

  constructor(
    newsAggregator: NewsAggregator,
    twitterAdapter: TwitterSentimentAdapter,
    config?: Partial<PoliticsStrategyConfig>,
  ) {
    this.config = { ...DEFAULT_POLITICS_CONFIG, ...config };
    this.newsAggregator = newsAggregator;
    this.twitterAdapter = twitterAdapter;
  }

  /**
   * Analyze a market and produce a TradeSignal if edge exists.
   *
   * Returns null when:
   *   - Market is not a politics market
   *   - Market is inactive/closed
   *   - Volume is below threshold
   *   - Question cannot be parsed
   *   - Edge < minEdge (10%)
   *   - Confidence < minConfidence (0.40)
   */
  async analyze(market: Market): Promise<TradeSignal | null> {
    // 1. Only process politics markets
    if (market.vertical !== 'politics') return null;
    if (!market.active || market.closed) return null;

    // 2. Parse the market question
    const parsed = parsePoliticsQuestion(market.question);
    if (!parsed) return null;

    // 3. Volume filters
    const daysOut = parsed.targetDate ? daysUntil(parsed.targetDate) : 0;

    if (market.volume < this.config.minVolume) return null;
    if (daysOut > this.config.longTermDays && market.volume < this.config.minVolumeLongTerm) return null;

    // 4. Base probability from market price
    const marketProb = market.tokens.yes.price;
    let modelProb = marketProb;

    // 5. Fetch news sentiment
    const searchQuery = this.buildSearchQuery(parsed);
    const headlines = await this.newsAggregator.getHeadlines(searchQuery, 30);
    const scoredNews = this.newsAggregator.findRelevantNews(market.question, headlines);

    // 6. Apply news sentiment adjustment
    const newsAdj = calculateNewsSentimentAdjustment(scoredNews, this.config.maxNewsAdjustment);
    modelProb += newsAdj;

    // 7. Fetch Twitter momentum
    const twitterSentiment = await this.twitterAdapter.getTrendingSentiment(searchQuery, 50);
    const twitterAdj = calculateTwitterMomentumAdjustment(twitterSentiment, this.config.maxTwitterAdjustment);
    modelProb += twitterAdj;

    // 8. Apply incumbency bias
    const incumbencyAdj = calculateIncumbencyBias(parsed.isIncumbent, marketProb, this.config.incumbencyBias);
    modelProb += incumbencyAdj;

    // 9. Apply overreaction contrarian signal
    const overreactionAdj = calculateOverreactionAdjustment(scoredNews);
    modelProb += overreactionAdj;

    // 10. Clamp probability
    modelProb = clamp(modelProb, PROB_FLOOR, PROB_CEILING);

    // 11. Calculate edge and side
    const edgeYes = modelProb - marketProb;
    const edgeNo = -edgeYes;

    let side: Side;
    let edge: number;

    if (edgeYes > 0 && edgeYes >= edgeNo) {
      side = 'YES';
      edge = edgeYes;
    } else if (edgeNo > 0) {
      side = 'NO';
      edge = edgeNo;
    } else {
      return null;
    }

    // 12. Check minimum edge threshold
    if (edge < this.config.minEdge) return null;

    // 13. Calculate confidence
    const confidence = calculateConfidence(
      scoredNews.length,
      twitterSentiment.tweetCount,
      daysOut,
      parsed.candidates.length > 0,
    );

    if (confidence < this.config.minConfidence) return null;

    // 14. Calculate position size (Kelly-inspired)
    const suggestedSize = this.calculateSize(edge, confidence);

    // 15. Build signal
    const signal: TradeSignal = {
      marketId: market.id,
      vertical: this.vertical,
      strategy: this.strategyId,
      side,
      modelProbability: side === 'YES' ? modelProb : 1 - modelProb,
      marketProbability: side === 'YES' ? marketProb : 1 - marketProb,
      edge,
      confidence,
      suggestedSize,
      reasoning: this.buildReasoning(parsed, scoredNews, twitterSentiment, modelProb, marketProb, side, edge),
      timestamp: new Date(),
    };

    // 16. Emit on event bus
    eventBus.emit('signal:detected', signal);

    return signal;
  }

  /**
   * Build a search query from the parsed market data.
   */
  private buildSearchQuery(parsed: ParsedPoliticsMarket): string {
    const parts: string[] = [];
    if (parsed.candidates.length > 0) {
      parts.push(parsed.candidates.join(' '));
    }
    if (parsed.electionType !== 'other') {
      parts.push(parsed.electionType);
    }
    parts.push('election');
    return parts.join(' ');
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
    parsed: ParsedPoliticsMarket,
    scoredNews: ScoredNews[],
    twitterSentiment: TrendingSentiment,
    modelProb: number,
    marketProb: number,
    side: Side,
    edge: number,
  ): string {
    const candidates = parsed.candidates.length > 0
      ? parsed.candidates.map((c) => c.toUpperCase()).join(', ')
      : 'Unknown';

    const topHeadlines = scoredNews
      .slice(0, 2)
      .map((sn) => `"${sn.item.title}" (sent=${sn.sentimentScore.toFixed(2)})`)
      .join('; ');

    return (
      `Politics ${parsed.electionType}: ${candidates}. ` +
      `Model P=${(modelProb * 100).toFixed(1)}%, Market P=${(marketProb * 100).toFixed(1)}%. ` +
      `${side} edge=${(edge * 100).toFixed(1)}%. ` +
      `${scoredNews.length} articles, ${twitterSentiment.tweetCount} tweets. ` +
      (parsed.isIncumbent ? 'Incumbency bias applied. ' : '') +
      (topHeadlines ? `Headlines: ${topHeadlines}` : '')
    );
  }
}
