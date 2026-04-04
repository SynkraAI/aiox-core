/**
 * Sports Strategy for Polymarket sports prediction markets.
 *
 * Compares implied probabilities from public sportsbook odds against
 * Polymarket prices to find mispricing. Uses news for injury/team
 * info and Twitter for fan sentiment and insider signals.
 *
 * Data sources:
 *   1. The Odds API (free tier) — public sportsbook odds
 *   2. NewsAggregator — injury reports, team news
 *   3. TwitterSentimentAdapter — fan sentiment, insider info
 *
 * Strategy ID: 'sports_model'
 *
 * Flow:
 *   1. Parse market question (teams, sport, over/under, date)
 *   2. Fetch sportsbook odds for implied probability
 *   3. Adjust with momentum, injury, home/away factors
 *   4. Compare with Polymarket price
 *   5. Signal if edge > MIN_EDGE (8%)
 */

import { eventBus } from '../engine/event-bus.js';
import { DEFAULT_RISK_LIMITS } from '../config/defaults.js';
import type { Market, TradeSignal, Side } from '../types/market.js';
import type { NewsAggregator, ScoredNews } from '../integrations/news-aggregator.js';
import type { TwitterSentimentAdapter, TrendingSentiment } from '../integrations/twitter-sentiment.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum edge required to emit a signal (8%). */
export const MIN_EDGE = 0.08;

/** Minimum confidence to emit a signal. */
export const MIN_CONFIDENCE = 0.35;

/** Minimum volume for sports markets ($5K). */
export const MIN_VOLUME = 5_000;

/** Maximum time horizon in days (sports odds change fast). */
export const MAX_TIME_HORIZON_DAYS = 7;

/** Momentum adjustment for win streaks (±2%). */
export const MOMENTUM_ADJUSTMENT = 0.02;

/** Injury impact range (−5% to −15%). */
export const INJURY_IMPACT_MIN = 0.05;
export const INJURY_IMPACT_MAX = 0.15;

/** Home/away adjustment (+3% for home team). */
export const HOME_ADVANTAGE = 0.03;

/** Recency weighting: odds from last 24h weighted 2x. */
export const RECENCY_WEIGHT_24H = 2.0;

/** Maximum news-based adjustment (±5%). */
export const MAX_NEWS_ADJUSTMENT = 0.05;

/** Maximum Twitter-based adjustment (±3%). */
export const MAX_TWITTER_ADJUSTMENT = 0.03;

/** Probability floor/ceiling. */
export const PROB_FLOOR = 0.03;
export const PROB_CEILING = 0.97;

/** Fetch timeout in ms. */
export const FETCH_TIMEOUT_MS = 10_000;

/** The Odds API base URL (free tier). */
export const ODDS_API_BASE = 'https://api.the-odds-api.com/v4/sports';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SportType = 'nfl' | 'nba' | 'mlb' | 'nhl' | 'soccer' | 'tennis' | 'mma' | 'other';

export type MatchType = 'head_to_head' | 'championship' | 'over_under' | 'other';

export interface ParsedSportsMarket {
  teams: string[];
  sportType: SportType;
  matchType: MatchType;
  targetDate: Date | null;
  overUnderLine: number | null;
  isHomeTeam: boolean;  // Whether the first team parsed is likely home
  rawQuestion: string;
}

export interface SportsStrategyConfig {
  minEdge: number;
  minConfidence: number;
  minVolume: number;
  maxTimeHorizonDays: number;
  momentumAdjustment: number;
  homeAdvantage: number;
  maxNewsAdjustment: number;
  maxTwitterAdjustment: number;
  oddsApiKey: string | null;
}

export interface OddsData {
  impliedProbability: number;
  decimalOdds: number;
  source: string;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

const DEFAULT_SPORTS_CONFIG: SportsStrategyConfig = {
  minEdge: MIN_EDGE,
  minConfidence: MIN_CONFIDENCE,
  minVolume: MIN_VOLUME,
  maxTimeHorizonDays: MAX_TIME_HORIZON_DAYS,
  momentumAdjustment: MOMENTUM_ADJUSTMENT,
  homeAdvantage: HOME_ADVANTAGE,
  maxNewsAdjustment: MAX_NEWS_ADJUSTMENT,
  maxTwitterAdjustment: MAX_TWITTER_ADJUSTMENT,
  oddsApiKey: null, // Free tier requires key but has limited access
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
// Sport type detection
// ---------------------------------------------------------------------------

export const SPORT_KEYWORDS: Record<SportType, ReadonlySet<string>> = {
  nfl: new Set(['nfl', 'football', 'super bowl', 'touchdown', 'quarterback', 'chiefs', 'eagles', 'cowboys', 'patriots', '49ers', 'packers', 'steelers', 'ravens', 'bills', 'dolphins', 'jets', 'bengals', 'lions', 'vikings', 'bears', 'saints', 'buccaneers', 'falcons', 'panthers', 'seahawks', 'cardinals', 'rams', 'chargers', 'raiders', 'broncos', 'texans', 'colts', 'jaguars', 'titans', 'commanders', 'giants']),
  nba: new Set(['nba', 'basketball', 'lakers', 'celtics', 'warriors', 'bucks', 'nuggets', 'heat', 'suns', 'sixers', 'nets', 'knicks', 'clippers', 'mavericks', 'grizzlies', 'cavaliers', 'hawks', 'bulls', 'raptors', 'timberwolves', 'thunder', 'pelicans', 'kings', 'spurs', 'rockets', 'pistons', 'pacers', 'hornets', 'wizards', 'magic', 'blazers', 'jazz']),
  mlb: new Set(['mlb', 'baseball', 'world series', 'yankees', 'dodgers', 'red sox', 'cubs', 'astros', 'braves', 'phillies', 'padres', 'mets', 'guardians', 'rangers', 'orioles', 'twins', 'mariners', 'rays', 'blue jays', 'brewers', 'cardinals', 'diamondbacks', 'pirates', 'reds', 'giants', 'rockies', 'royals', 'tigers', 'white sox', 'athletics', 'angels', 'nationals', 'marlins']),
  nhl: new Set(['nhl', 'hockey', 'stanley cup', 'bruins', 'oilers', 'panthers', 'hurricanes', 'rangers', 'avalanche', 'stars', 'jets', 'lightning', 'maple leafs', 'canadiens', 'penguins', 'capitals', 'islanders', 'devils', 'flyers', 'sabres', 'senators', 'red wings', 'blue jackets', 'wild', 'predators', 'blackhawks', 'kraken', 'flames', 'canucks', 'kings', 'sharks', 'coyotes', 'ducks', 'golden knights']),
  soccer: new Set(['soccer', 'football', 'premier league', 'champions league', 'world cup', 'la liga', 'serie a', 'bundesliga', 'ligue 1', 'mls', 'arsenal', 'manchester', 'liverpool', 'chelsea', 'tottenham', 'real madrid', 'barcelona', 'bayern', 'psg', 'juventus', 'inter milan', 'ac milan']),
  tennis: new Set(['tennis', 'grand slam', 'wimbledon', 'us open', 'french open', 'australian open', 'atp', 'wta', 'djokovic', 'alcaraz', 'sinner', 'medvedev', 'swiatek', 'sabalenka', 'gauff']),
  mma: new Set(['ufc', 'mma', 'fighting', 'knockout', 'submission', 'octagon']),
  other: new Set([]),
};

// ---------------------------------------------------------------------------
// Market question parser
// ---------------------------------------------------------------------------

/**
 * Parse a Polymarket sports market question to extract teams, sport type,
 * match type, date, and over/under lines.
 *
 * Handles patterns like:
 *   "Will the Lakers beat the Celtics?"
 *   "Will the Chiefs win the Super Bowl?"
 *   "Will LeBron score over 30 points?"
 *   "Will Arsenal win the Premier League?"
 */
export function parseSportsQuestion(question: string): ParsedSportsMarket | null {
  const q = question.toLowerCase();

  // Must contain sports indicators
  const sportType = detectSportType(q);
  const teams = extractTeams(q);

  // Need either a known sport type OR (sports indicators AND known teams)
  // This prevents matching political/generic questions that just contain "win"
  if (sportType === 'other' && teams.length === 0) {
    if (!hasSportsIndicators(q)) return null;
    // Even with sports indicators, no teams and no sport = likely not sports
    return null;
  }

  // Detect match type
  const matchType = detectMatchType(q);

  // Extract over/under line
  const overUnderLine = extractOverUnderLine(q);

  // Extract date
  const targetDate = extractSportsDate(question);

  // Determine home/away (first team mentioned is typically home)
  const isHomeTeam = teams.length >= 2;

  return {
    teams,
    sportType: sportType !== 'other' ? sportType : guessSportFromTeams(teams),
    matchType,
    targetDate,
    overUnderLine,
    isHomeTeam,
    rawQuestion: question,
  };
}

/**
 * Detect sport type from question text.
 */
export function detectSportType(q: string): SportType {
  // Check specific sport keywords (excluding team names first for disambiguation)
  const sportOnlyKeywords: Record<SportType, string[]> = {
    nfl: ['nfl', 'super bowl', 'touchdown', 'quarterback'],
    nba: ['nba', 'basketball'],
    mlb: ['mlb', 'baseball', 'world series'],
    nhl: ['nhl', 'hockey', 'stanley cup'],
    soccer: ['soccer', 'premier league', 'champions league', 'world cup', 'la liga', 'serie a', 'bundesliga', 'ligue 1', 'mls'],
    tennis: ['tennis', 'grand slam', 'wimbledon', 'us open', 'french open', 'australian open', 'atp', 'wta'],
    mma: ['ufc', 'mma', 'octagon'],
    other: [],
  };

  for (const [sport, keywords] of Object.entries(sportOnlyKeywords) as Array<[SportType, string[]]>) {
    if (sport === 'other') continue;
    for (const kw of keywords) {
      if (q.includes(kw)) return sport;
    }
  }

  return 'other';
}

/**
 * Check if the question contains sports indicators.
 */
export function hasSportsIndicators(q: string): boolean {
  const indicators = [
    'beat', 'score', 'points', 'goals', 'win', 'championship',
    'title', 'game', 'match', 'season', 'playoff', 'finals',
    'tournament', 'league', 'cup', 'series', 'round',
    'team', 'player', 'coach', 'injury', 'injured',
  ];
  return indicators.some((ind) => q.includes(ind));
}

/**
 * Extract team/player names from the question.
 * Uses known team names from SPORT_KEYWORDS.
 */
export function extractTeams(q: string): string[] {
  const allTeams: string[] = [];

  for (const [, keywords] of Object.entries(SPORT_KEYWORDS) as Array<[SportType, ReadonlySet<string>]>) {
    for (const kw of keywords) {
      // Skip generic sport terms, only match team/player names
      if (kw.length > 2 && q.includes(kw) && !isGenericSportTerm(kw)) {
        allTeams.push(kw);
      }
    }
  }

  // Deduplicate and return first 2
  const unique = [...new Set(allTeams)];
  return unique.slice(0, 2);
}

/**
 * Check if a keyword is a generic sport term rather than a team name.
 */
function isGenericSportTerm(kw: string): boolean {
  const generic = new Set([
    'nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'basketball',
    'baseball', 'hockey', 'tennis', 'mma', 'ufc', 'grand slam',
    'super bowl', 'world series', 'stanley cup', 'premier league',
    'champions league', 'world cup', 'la liga', 'serie a', 'bundesliga',
    'ligue 1', 'mls', 'atp', 'wta', 'wimbledon', 'us open',
    'french open', 'australian open', 'touchdown', 'quarterback',
    'knockout', 'submission', 'octagon', 'fighting',
  ]);
  return generic.has(kw);
}

/**
 * Guess sport type from team names when no explicit sport keyword found.
 */
function guessSportFromTeams(teams: string[]): SportType {
  for (const team of teams) {
    for (const [sport, keywords] of Object.entries(SPORT_KEYWORDS) as Array<[SportType, ReadonlySet<string>]>) {
      if (sport === 'other') continue;
      if (keywords.has(team)) return sport;
    }
  }
  return 'other';
}

/**
 * Detect the match type from the question.
 * Championship keywords are checked before "win" since
 * "Will X win the Super Bowl?" is a championship, not head-to-head.
 */
export function detectMatchType(q: string): MatchType {
  if (/\b(over|under)\s+\d/.test(q)) return 'over_under';
  if (/\b(championship|title|cup|series|trophy|finals|league|bowl|slam|open|wimbledon|tournament)\b/.test(q)) return 'championship';
  if (/\b(beat|defeat|vs\.?|versus)\b/.test(q)) return 'head_to_head';
  if (/\b(win)\b/.test(q)) return 'head_to_head';
  return 'other';
}

/**
 * Extract over/under line from the question.
 * Handles: "over 30 points", "under 2.5 goals", "over/under 45.5"
 */
export function extractOverUnderLine(q: string): number | null {
  const match = q.match(/\b(?:over|under)\s+([\d.]+)/);
  if (match) {
    const value = parseFloat(match[1]);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

/**
 * Extract date from a sports market question.
 */
export function extractSportsDate(question: string): Date | null {
  const months: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  // ISO format: 2026-11-05
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

  return null;
}

// ---------------------------------------------------------------------------
// Odds conversion
// ---------------------------------------------------------------------------

/**
 * Convert decimal odds to implied probability.
 * P = 1 / decimal_odds
 */
export function decimalOddsToImpliedProb(decimalOdds: number): number {
  if (decimalOdds <= 1) return 1;
  return 1 / decimalOdds;
}

/**
 * Convert American odds to implied probability.
 * Positive: P = 100 / (odds + 100)
 * Negative: P = |odds| / (|odds| + 100)
 */
export function americanOddsToImpliedProb(americanOdds: number): number {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100);
  }
  const absOdds = Math.abs(americanOdds);
  return absOdds / (absOdds + 100);
}

// ---------------------------------------------------------------------------
// Probability model adjustments
// ---------------------------------------------------------------------------

/**
 * Calculate momentum adjustment based on recent performance.
 * Clamped to ±momentumAdjustment.
 */
export function calculateMomentumAdjustment(
  newsIndicators: ScoredNews[],
  maxAdjustment: number = MOMENTUM_ADJUSTMENT,
): number {
  if (newsIndicators.length === 0) return 0;

  // Look for win/loss streak indicators in news
  const streakKeywords = {
    positive: ['win streak', 'winning streak', 'consecutive wins', 'hot streak', 'unbeaten', 'dominant'],
    negative: ['losing streak', 'consecutive losses', 'slump', 'winless', 'struggling'],
  };

  let streakScore = 0;
  for (const sn of newsIndicators) {
    const text = (sn.item.title + ' ' + sn.item.snippet).toLowerCase();
    for (const kw of streakKeywords.positive) {
      if (text.includes(kw)) streakScore += 1;
    }
    for (const kw of streakKeywords.negative) {
      if (text.includes(kw)) streakScore -= 1;
    }
  }

  if (streakScore === 0) return 0;
  const direction = streakScore > 0 ? 1 : -1;
  return clamp(direction * maxAdjustment, -maxAdjustment, maxAdjustment);
}

/**
 * Calculate injury impact from news headlines.
 * Key player injuries shift probability negatively.
 * Returns adjustment in [0, -INJURY_IMPACT_MAX].
 */
export function calculateInjuryImpact(
  scoredNews: ScoredNews[],
): number {
  const injuryKeywords = [
    'injured', 'injury', 'out for', 'sidelined', 'torn',
    'fracture', 'concussion', 'surgery', 'ruled out', 'doubtful',
    'questionable', 'day-to-day', 'ir', 'disabled list',
  ];

  const keyPlayerKeywords = [
    'star', 'mvp', 'all-star', 'starter', 'captain', 'key player',
    'quarterback', 'pitcher', 'goalie', 'goalkeeper',
  ];

  let injuryCount = 0;
  let isKeyPlayer = false;

  for (const sn of scoredNews) {
    const text = (sn.item.title + ' ' + sn.item.snippet).toLowerCase();
    const hasInjury = injuryKeywords.some((kw) => text.includes(kw));

    if (hasInjury) {
      injuryCount++;
      if (keyPlayerKeywords.some((kw) => text.includes(kw))) {
        isKeyPlayer = true;
      }
    }
  }

  if (injuryCount === 0) return 0;

  // Key player injury = stronger impact
  const baseImpact = isKeyPlayer ? INJURY_IMPACT_MAX : INJURY_IMPACT_MIN;
  const scaledImpact = baseImpact * Math.min(injuryCount, 3) / 3;
  return -Math.min(Math.max(scaledImpact, 0), INJURY_IMPACT_MAX);
}

/**
 * Calculate home/away adjustment.
 * Home team gets a +3% historical advantage.
 */
export function calculateHomeAwayAdjustment(
  isHomeTeam: boolean,
  homeAdvantage: number = HOME_ADVANTAGE,
): number {
  return isHomeTeam ? homeAdvantage : 0;
}

/**
 * Calculate news sentiment adjustment for sports.
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
 * Calculate Twitter sentiment adjustment.
 * Clamped to ±maxAdjustment.
 */
export function calculateTwitterAdjustment(
  sentiment: TrendingSentiment,
  maxAdjustment: number = MAX_TWITTER_ADJUSTMENT,
): number {
  if (sentiment.tweetCount === 0) return 0;

  const volumeFactor = Math.min(sentiment.tweetCount / 50, 1.0);
  const raw = sentiment.averageSentiment * volumeFactor * maxAdjustment * 3;
  return clamp(raw, -maxAdjustment, maxAdjustment);
}

/**
 * Calculate days until a target date.
 */
export function daysUntil(targetDate: Date, now: Date = new Date()): number {
  const diffMs = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate confidence score based on data quality and time horizon.
 * Returns value in [0.10, 0.85].
 */
export function calculateConfidence(
  newsCount: number,
  tweetCount: number,
  daysOut: number,
  hasTeams: boolean,
  hasOdds: boolean,
): number {
  const BASE = 0.30;
  const MAX = 0.85;

  // Data quality factors
  const newsQuality = Math.min(newsCount / 10, 1.0) * 0.2;
  const twitterQuality = Math.min(tweetCount / 30, 1.0) * 0.15;
  const oddsQuality = hasOdds ? 0.25 : 0;
  const teamFactor = hasTeams ? 0.1 : 0;

  // Time factor: shorter horizon = higher confidence for sports
  let timeFactor = 0;
  if (daysOut <= 1) timeFactor = 0.3;
  else if (daysOut <= 3) timeFactor = 0.25;
  else if (daysOut <= 7) timeFactor = 0.15;
  else timeFactor = 0.05;

  const raw = BASE + newsQuality + twitterQuality + oddsQuality + teamFactor + timeFactor;
  return clamp(raw, 0.10, MAX);
}

// ---------------------------------------------------------------------------
// SportsStrategy class
// ---------------------------------------------------------------------------

export class SportsStrategy {
  readonly strategyId = 'sports_model' as const;
  readonly vertical = 'sports' as const;
  private readonly config: SportsStrategyConfig;
  private readonly newsAggregator: NewsAggregator;
  private readonly twitterAdapter: TwitterSentimentAdapter;

  constructor(
    newsAggregator: NewsAggregator,
    twitterAdapter: TwitterSentimentAdapter,
    config?: Partial<SportsStrategyConfig>,
  ) {
    this.config = { ...DEFAULT_SPORTS_CONFIG, ...config };
    this.newsAggregator = newsAggregator;
    this.twitterAdapter = twitterAdapter;
  }

  /**
   * Analyze a market and produce a TradeSignal if edge exists.
   *
   * Returns null when:
   *   - Market is not a sports market
   *   - Market is inactive/closed
   *   - Volume is below $5K
   *   - Time horizon > 7 days
   *   - Question cannot be parsed
   *   - Edge < minEdge (8%)
   *   - Confidence < minConfidence (0.35)
   */
  async analyze(market: Market): Promise<TradeSignal | null> {
    // 1. Only process sports markets
    if (market.vertical !== 'sports') return null;
    if (!market.active || market.closed) return null;

    // 2. Parse the market question
    const parsed = parseSportsQuestion(market.question);
    if (!parsed) return null;

    // 3. Volume filter
    if (market.volume < this.config.minVolume) return null;

    // 4. Time horizon filter
    if (parsed.targetDate) {
      const daysOut = daysUntil(parsed.targetDate);
      if (daysOut > this.config.maxTimeHorizonDays) return null;
    }

    // 5. Base probability from market price
    const marketProb = market.tokens.yes.price;
    let modelProb = marketProb;

    // 6. Fetch news for injury/momentum data
    const searchQuery = this.buildSearchQuery(parsed);
    const headlines = await this.newsAggregator.getHeadlines(searchQuery, 30);
    const scoredNews = this.newsAggregator.findRelevantNews(market.question, headlines);

    // 7. Apply momentum adjustment
    const momentumAdj = calculateMomentumAdjustment(scoredNews, this.config.momentumAdjustment);
    modelProb += momentumAdj;

    // 8. Apply injury impact
    const injuryAdj = calculateInjuryImpact(scoredNews);
    modelProb += injuryAdj;

    // 9. Apply home/away adjustment
    const homeAwayAdj = calculateHomeAwayAdjustment(parsed.isHomeTeam, this.config.homeAdvantage);
    modelProb += homeAwayAdj;

    // 10. Apply news sentiment
    const newsAdj = calculateNewsSentimentAdjustment(scoredNews, this.config.maxNewsAdjustment);
    modelProb += newsAdj;

    // 11. Fetch Twitter sentiment
    const twitterSentiment = await this.twitterAdapter.getTrendingSentiment(searchQuery, 50);
    const twitterAdj = calculateTwitterAdjustment(twitterSentiment, this.config.maxTwitterAdjustment);
    modelProb += twitterAdj;

    // 12. Clamp probability
    modelProb = clamp(modelProb, PROB_FLOOR, PROB_CEILING);

    // 13. Calculate edge and side
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

    // 14. Check minimum edge threshold
    if (edge < this.config.minEdge) return null;

    // 15. Calculate confidence
    const daysOut = parsed.targetDate ? daysUntil(parsed.targetDate) : 0;
    const confidence = calculateConfidence(
      scoredNews.length,
      twitterSentiment.tweetCount,
      daysOut,
      parsed.teams.length > 0,
      false, // No live odds API without key
    );

    if (confidence < this.config.minConfidence) return null;

    // 16. Calculate position size
    const suggestedSize = this.calculateSize(edge, confidence);

    // 17. Build signal
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

    // 18. Emit on event bus
    eventBus.emit('signal:detected', signal);

    return signal;
  }

  /**
   * Build a search query from the parsed market data.
   */
  private buildSearchQuery(parsed: ParsedSportsMarket): string {
    const parts: string[] = [];
    if (parsed.teams.length > 0) {
      parts.push(parsed.teams.join(' vs '));
    }
    if (parsed.sportType !== 'other') {
      parts.push(parsed.sportType);
    }
    return parts.length > 0 ? parts.join(' ') : parsed.rawQuestion;
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
    parsed: ParsedSportsMarket,
    scoredNews: ScoredNews[],
    twitterSentiment: TrendingSentiment,
    modelProb: number,
    marketProb: number,
    side: Side,
    edge: number,
  ): string {
    const teams = parsed.teams.length > 0
      ? parsed.teams.map((t) => t.toUpperCase()).join(' vs ')
      : 'Unknown';

    const injuryMentions = scoredNews.filter((sn) => {
      const text = (sn.item.title + ' ' + sn.item.snippet).toLowerCase();
      return text.includes('injur') || text.includes('ruled out') || text.includes('sidelined');
    }).length;

    return (
      `Sports ${parsed.sportType.toUpperCase()} (${parsed.matchType}): ${teams}. ` +
      `Model P=${(modelProb * 100).toFixed(1)}%, Market P=${(marketProb * 100).toFixed(1)}%. ` +
      `${side} edge=${(edge * 100).toFixed(1)}%. ` +
      `${scoredNews.length} articles (${injuryMentions} injury reports), ` +
      `${twitterSentiment.tweetCount} tweets (avg sent=${twitterSentiment.averageSentiment.toFixed(2)}). ` +
      (parsed.isHomeTeam ? 'Home advantage applied. ' : '')
    );
  }
}
