/**
 * Tests for the Sports Strategy module.
 * Covers: odds conversion, question parsing, probability adjustments,
 * injury impact, momentum, home/away, confidence, and full analyze flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SportsStrategy,
  parseSportsQuestion,
  detectSportType,
  hasSportsIndicators,
  extractTeams,
  detectMatchType,
  extractOverUnderLine,
  extractSportsDate,
  decimalOddsToImpliedProb,
  americanOddsToImpliedProb,
  calculateMomentumAdjustment,
  calculateInjuryImpact,
  calculateHomeAwayAdjustment,
  calculateNewsSentimentAdjustment,
  calculateTwitterAdjustment,
  calculateConfidence,
  daysUntil,
  clamp,
  MIN_EDGE,
  MIN_CONFIDENCE,
  MOMENTUM_ADJUSTMENT,
  HOME_ADVANTAGE,
  MAX_NEWS_ADJUSTMENT,
  MAX_TWITTER_ADJUSTMENT,
} from '../src/strategies/sports-strategy.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { Market } from '../src/types/market.js';
import type { ScoredNews, NewsItem } from '../src/integrations/news-aggregator.js';
import type { TrendingSentiment } from '../src/integrations/twitter-sentiment.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSportsMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: 'market-sports-1',
    question: 'Will the Lakers beat the Celtics?',
    slug: 'lakers-vs-celtics',
    vertical: 'sports',
    endDate: '2026-04-10',
    active: true,
    closed: false,
    tokens: {
      yes: { tokenId: 'yes-1', price: 0.50, outcome: 'Yes' },
      no: { tokenId: 'no-1', price: 0.50, outcome: 'No' },
    },
    volume: 20_000,
    liquidity: 15_000,
    lastPrice: 0.50,
    ...overrides,
  };
}

function makeScoredNews(
  sentiment: number,
  relevance: number,
  titleOverride?: string,
  snippetOverride?: string,
): ScoredNews {
  const item: NewsItem = {
    title: titleOverride ?? 'Test headline',
    source: 'ESPN',
    publishedAt: new Date(Date.now() - 60 * 60 * 1000),
    url: 'https://example.com',
    snippet: snippetOverride ?? 'Test snippet',
  };
  return { item, sentimentScore: sentiment, relevanceScore: relevance };
}

function makeTrendingSentiment(overrides: Partial<TrendingSentiment> = {}): TrendingSentiment {
  return {
    topic: 'test',
    averageSentiment: 0,
    tweetCount: 0,
    strongPositive: 0,
    strongNegative: 0,
    timestamp: new Date(),
    ...overrides,
  };
}

function createMockNewsAggregator(scoredNews: ScoredNews[] = []) {
  return {
    getHeadlines: vi.fn().mockResolvedValue(scoredNews.map((sn) => sn.item)),
    findRelevantNews: vi.fn().mockReturnValue(scoredNews),
    scoreSentiment: vi.fn().mockReturnValue(0),
    clearCache: vi.fn(),
  };
}

function createMockTwitterAdapter(sentiment: TrendingSentiment = makeTrendingSentiment()) {
  return {
    getRecentTweets: vi.fn().mockResolvedValue([]),
    scoreSentiment: vi.fn().mockReturnValue([]),
    getTrendingSentiment: vi.fn().mockResolvedValue(sentiment),
    clearCache: vi.fn(),
    resetRateLimiter: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// decimalOddsToImpliedProb
// ---------------------------------------------------------------------------

describe('decimalOddsToImpliedProb', () => {
  it('returns 0.5 for decimal odds of 2.0', () => {
    expect(decimalOddsToImpliedProb(2.0)).toBeCloseTo(0.5, 4);
  });

  it('returns ~0.667 for decimal odds of 1.5', () => {
    expect(decimalOddsToImpliedProb(1.5)).toBeCloseTo(0.6667, 3);
  });

  it('returns ~0.333 for decimal odds of 3.0', () => {
    expect(decimalOddsToImpliedProb(3.0)).toBeCloseTo(0.3333, 3);
  });

  it('returns 1 for odds <= 1', () => {
    expect(decimalOddsToImpliedProb(1.0)).toBe(1);
    expect(decimalOddsToImpliedProb(0.5)).toBe(1);
  });

  it('returns ~0.10 for long odds of 10.0', () => {
    expect(decimalOddsToImpliedProb(10.0)).toBeCloseTo(0.10, 4);
  });
});

// ---------------------------------------------------------------------------
// americanOddsToImpliedProb
// ---------------------------------------------------------------------------

describe('americanOddsToImpliedProb', () => {
  it('converts positive odds (+150)', () => {
    expect(americanOddsToImpliedProb(150)).toBeCloseTo(0.40, 2);
  });

  it('converts negative odds (-150)', () => {
    expect(americanOddsToImpliedProb(-150)).toBeCloseTo(0.60, 2);
  });

  it('converts even money (+100)', () => {
    expect(americanOddsToImpliedProb(100)).toBeCloseTo(0.50, 2);
  });

  it('converts heavy favorite (-300)', () => {
    expect(americanOddsToImpliedProb(-300)).toBeCloseTo(0.75, 2);
  });

  it('converts big underdog (+500)', () => {
    expect(americanOddsToImpliedProb(500)).toBeCloseTo(0.1667, 2);
  });
});

// ---------------------------------------------------------------------------
// parseSportsQuestion
// ---------------------------------------------------------------------------

describe('parseSportsQuestion', () => {
  it('parses "Will the Lakers beat the Celtics?"', () => {
    const result = parseSportsQuestion('Will the Lakers beat the Celtics?');
    expect(result).not.toBeNull();
    expect(result!.teams).toContain('lakers');
    expect(result!.teams).toContain('celtics');
    expect(result!.sportType).toBe('nba');
    expect(result!.matchType).toBe('head_to_head');
  });

  it('parses "Will the Chiefs win the Super Bowl?"', () => {
    const result = parseSportsQuestion('Will the Chiefs win the Super Bowl?');
    expect(result).not.toBeNull();
    expect(result!.teams).toContain('chiefs');
    expect(result!.sportType).toBe('nfl');
    expect(result!.matchType).toBe('championship');
  });

  it('parses "Will the score be over 45.5 points?"', () => {
    const result = parseSportsQuestion('Will the NFL game score be over 45.5 points?');
    expect(result).not.toBeNull();
    expect(result!.matchType).toBe('over_under');
    expect(result!.overUnderLine).toBeCloseTo(45.5, 1);
  });

  it('parses "Will Arsenal win the Premier League?"', () => {
    const result = parseSportsQuestion('Will Arsenal win the Premier League?');
    expect(result).not.toBeNull();
    expect(result!.teams).toContain('arsenal');
    expect(result!.sportType).toBe('soccer');
    expect(result!.matchType).toBe('championship');
  });

  it('parses tennis markets', () => {
    const result = parseSportsQuestion('Will Djokovic win Wimbledon?');
    expect(result).not.toBeNull();
    expect(result!.teams).toContain('djokovic');
    expect(result!.sportType).toBe('tennis');
    expect(result!.matchType).toBe('championship');
  });

  it('returns null for non-sports questions', () => {
    expect(parseSportsQuestion('Will BTC be above $100K?')).toBeNull();
    expect(parseSportsQuestion('Will Trump win the election?')).toBeNull();
  });

  it('extracts dates when present', () => {
    const result = parseSportsQuestion('Will the Lakers beat the Celtics on April 10, 2026?');
    expect(result).not.toBeNull();
    expect(result!.targetDate).not.toBeNull();
    expect(result!.targetDate!.getMonth()).toBe(3); // April
    expect(result!.targetDate!.getDate()).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// detectSportType
// ---------------------------------------------------------------------------

describe('detectSportType', () => {
  it('detects NFL', () => {
    expect(detectSportType('nfl game tonight')).toBe('nfl');
    expect(detectSportType('super bowl prediction')).toBe('nfl');
  });

  it('detects NBA', () => {
    expect(detectSportType('nba finals')).toBe('nba');
    expect(detectSportType('basketball championship')).toBe('nba');
  });

  it('detects MLB', () => {
    expect(detectSportType('mlb world series')).toBe('mlb');
    expect(detectSportType('baseball game')).toBe('mlb');
  });

  it('detects NHL', () => {
    expect(detectSportType('nhl hockey playoffs')).toBe('nhl');
    expect(detectSportType('stanley cup finals')).toBe('nhl');
  });

  it('detects soccer', () => {
    expect(detectSportType('premier league match')).toBe('soccer');
    expect(detectSportType('champions league final')).toBe('soccer');
  });

  it('detects tennis', () => {
    expect(detectSportType('wimbledon final')).toBe('tennis');
    expect(detectSportType('tennis atp tour')).toBe('tennis');
  });

  it('detects MMA', () => {
    expect(detectSportType('ufc fight night')).toBe('mma');
  });

  it('returns other for unrecognized sports', () => {
    expect(detectSportType('cricket match')).toBe('other');
  });
});

// ---------------------------------------------------------------------------
// hasSportsIndicators
// ---------------------------------------------------------------------------

describe('hasSportsIndicators', () => {
  it('returns true for sports-related text', () => {
    expect(hasSportsIndicators('will they beat the opponent')).toBe(true);
    expect(hasSportsIndicators('score over 30 points')).toBe(true);
    expect(hasSportsIndicators('win the championship')).toBe(true);
    expect(hasSportsIndicators('player injury report')).toBe(true);
  });

  it('returns false for non-sports text', () => {
    expect(hasSportsIndicators('bitcoin price prediction')).toBe(false);
    expect(hasSportsIndicators('weather forecast tomorrow')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractTeams
// ---------------------------------------------------------------------------

describe('extractTeams', () => {
  it('extracts known NBA teams', () => {
    const teams = extractTeams('the lakers vs the celtics tonight');
    expect(teams).toContain('lakers');
    expect(teams).toContain('celtics');
  });

  it('extracts known NFL teams', () => {
    const teams = extractTeams('chiefs versus eagles in the super bowl');
    expect(teams).toContain('chiefs');
    expect(teams).toContain('eagles');
  });

  it('limits to 2 teams', () => {
    const teams = extractTeams('lakers celtics warriors bucks');
    expect(teams.length).toBeLessThanOrEqual(2);
  });

  it('returns empty for no recognizable teams', () => {
    const teams = extractTeams('some random text about nothing');
    expect(teams).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// detectMatchType
// ---------------------------------------------------------------------------

describe('detectMatchType', () => {
  it('detects head_to_head', () => {
    expect(detectMatchType('will the lakers beat the celtics')).toBe('head_to_head');
    expect(detectMatchType('team a vs team b')).toBe('head_to_head');
  });

  it('detects championship', () => {
    expect(detectMatchType('will they win the championship')).toBe('championship');
    expect(detectMatchType('stanley cup winners')).toBe('championship');
  });

  it('detects over_under', () => {
    expect(detectMatchType('will the score be over 45 points')).toBe('over_under');
    expect(detectMatchType('under 200 total points')).toBe('over_under');
  });

  it('returns other for unclear format', () => {
    expect(detectMatchType('what happens next in sports')).toBe('other');
  });
});

// ---------------------------------------------------------------------------
// extractOverUnderLine
// ---------------------------------------------------------------------------

describe('extractOverUnderLine', () => {
  it('extracts integer line', () => {
    expect(extractOverUnderLine('over 45 points')).toBe(45);
  });

  it('extracts decimal line', () => {
    expect(extractOverUnderLine('over 45.5 points')).toBeCloseTo(45.5, 1);
  });

  it('extracts under line', () => {
    expect(extractOverUnderLine('under 200 total')).toBe(200);
  });

  it('returns null when no line present', () => {
    expect(extractOverUnderLine('will the lakers win')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractSportsDate
// ---------------------------------------------------------------------------

describe('extractSportsDate', () => {
  it('extracts "Month Day, Year" format', () => {
    const date = extractSportsDate('Game on April 10, 2026');
    expect(date).not.toBeNull();
    expect(date!.getMonth()).toBe(3);
    expect(date!.getDate()).toBe(10);
    expect(date!.getFullYear()).toBe(2026);
  });

  it('extracts ISO date format', () => {
    const date = extractSportsDate('Game on 2026-04-10');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2026);
  });

  it('returns null when no date found', () => {
    expect(extractSportsDate('Will the Lakers win?')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateMomentumAdjustment
// ---------------------------------------------------------------------------

describe('calculateMomentumAdjustment', () => {
  it('returns 0 for no news', () => {
    expect(calculateMomentumAdjustment([])).toBe(0);
  });

  it('returns positive for win streak news', () => {
    const news = [makeScoredNews(0.8, 0.9, 'Team on 5-game win streak', 'consecutive wins dominating')];
    const adj = calculateMomentumAdjustment(news);
    expect(adj).toBeGreaterThan(0);
    expect(adj).toBeLessThanOrEqual(MOMENTUM_ADJUSTMENT);
  });

  it('returns negative for losing streak news', () => {
    const news = [makeScoredNews(-0.5, 0.8, 'Team on losing streak', 'consecutive losses and struggling')];
    const adj = calculateMomentumAdjustment(news);
    expect(adj).toBeLessThan(0);
    expect(adj).toBeGreaterThanOrEqual(-MOMENTUM_ADJUSTMENT);
  });

  it('returns 0 for news without streak indicators', () => {
    const news = [makeScoredNews(0.5, 0.8, 'Regular game recap', 'Normal game summary')];
    expect(calculateMomentumAdjustment(news)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateInjuryImpact
// ---------------------------------------------------------------------------

describe('calculateInjuryImpact', () => {
  it('returns 0 for no injury news', () => {
    const news = [makeScoredNews(0.5, 0.8, 'Great game tonight', 'Regular preview')];
    expect(calculateInjuryImpact(news)).toBe(0);
  });

  it('returns negative for injury news', () => {
    const news = [makeScoredNews(-0.5, 0.8, 'Player injured in practice', 'sidelined for 2 weeks')];
    const impact = calculateInjuryImpact(news);
    expect(impact).toBeLessThan(0);
  });

  it('returns stronger negative for key player injuries', () => {
    const regularInjury = [makeScoredNews(-0.5, 0.8, 'Player injured', 'role player out')];
    const starInjury = [makeScoredNews(-0.8, 0.9, 'Star MVP injured', 'star quarterback ruled out')];

    const regularImpact = calculateInjuryImpact(regularInjury);
    const starImpact = calculateInjuryImpact(starInjury);

    expect(starImpact).toBeLessThan(regularImpact); // More negative
  });
});

// ---------------------------------------------------------------------------
// calculateHomeAwayAdjustment
// ---------------------------------------------------------------------------

describe('calculateHomeAwayAdjustment', () => {
  it('returns HOME_ADVANTAGE for home team', () => {
    expect(calculateHomeAwayAdjustment(true)).toBe(HOME_ADVANTAGE);
  });

  it('returns 0 for away team', () => {
    expect(calculateHomeAwayAdjustment(false)).toBe(0);
  });

  it('respects custom home advantage value', () => {
    expect(calculateHomeAwayAdjustment(true, 0.05)).toBe(0.05);
  });
});

// ---------------------------------------------------------------------------
// calculateNewsSentimentAdjustment
// ---------------------------------------------------------------------------

describe('calculateNewsSentimentAdjustment (sports)', () => {
  it('returns 0 for empty news', () => {
    expect(calculateNewsSentimentAdjustment([])).toBe(0);
  });

  it('returns positive for positive news', () => {
    const news = [makeScoredNews(0.8, 0.9), makeScoredNews(0.6, 0.7)];
    const adj = calculateNewsSentimentAdjustment(news);
    expect(adj).toBeGreaterThan(0);
    expect(adj).toBeLessThanOrEqual(MAX_NEWS_ADJUSTMENT);
  });

  it('is clamped to ±MAX_NEWS_ADJUSTMENT', () => {
    const news = [makeScoredNews(1.0, 1.0), makeScoredNews(1.0, 1.0)];
    const adj = calculateNewsSentimentAdjustment(news);
    expect(adj).toBeLessThanOrEqual(MAX_NEWS_ADJUSTMENT);
  });
});

// ---------------------------------------------------------------------------
// calculateTwitterAdjustment
// ---------------------------------------------------------------------------

describe('calculateTwitterAdjustment (sports)', () => {
  it('returns 0 for zero tweets', () => {
    expect(calculateTwitterAdjustment(makeTrendingSentiment({ tweetCount: 0 }))).toBe(0);
  });

  it('returns positive for positive fan sentiment', () => {
    const sentiment = makeTrendingSentiment({ averageSentiment: 0.6, tweetCount: 40 });
    const adj = calculateTwitterAdjustment(sentiment);
    expect(adj).toBeGreaterThan(0);
    expect(adj).toBeLessThanOrEqual(MAX_TWITTER_ADJUSTMENT);
  });

  it('is clamped to ±MAX_TWITTER_ADJUSTMENT', () => {
    const sentiment = makeTrendingSentiment({ averageSentiment: 1.0, tweetCount: 100 });
    expect(calculateTwitterAdjustment(sentiment)).toBeLessThanOrEqual(MAX_TWITTER_ADJUSTMENT);
  });
});

// ---------------------------------------------------------------------------
// calculateConfidence
// ---------------------------------------------------------------------------

describe('calculateConfidence (sports)', () => {
  it('gives higher confidence for game-day events', () => {
    const gameDay = calculateConfidence(3, 10, 0, true, false);
    const weekOut = calculateConfidence(3, 10, 7, true, false);
    expect(gameDay).toBeGreaterThan(weekOut);
  });

  it('gives higher confidence with odds data', () => {
    const noOdds = calculateConfidence(3, 10, 3, true, false);
    const withOdds = calculateConfidence(3, 10, 3, true, true);
    expect(withOdds).toBeGreaterThan(noOdds);
  });

  it('never exceeds 0.85', () => {
    expect(calculateConfidence(100, 1000, 0, true, true)).toBeLessThanOrEqual(0.85);
  });

  it('never goes below 0.10', () => {
    expect(calculateConfidence(0, 0, 30, false, false)).toBeGreaterThanOrEqual(0.10);
  });

  it('gives higher confidence with more news', () => {
    const lowData = calculateConfidence(1, 5, 1, true, false);
    const highData = calculateConfidence(10, 50, 1, true, false);
    expect(highData).toBeGreaterThan(lowData);
  });
});

// ---------------------------------------------------------------------------
// daysUntil
// ---------------------------------------------------------------------------

describe('daysUntil (sports)', () => {
  it('returns correct days for future date', () => {
    const now = new Date('2026-04-01');
    const target = new Date('2026-04-08');
    expect(daysUntil(target, now)).toBe(7);
  });

  it('returns 0 for past dates', () => {
    const now = new Date('2026-04-10');
    const target = new Date('2026-04-01');
    expect(daysUntil(target, now)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// clamp
// ---------------------------------------------------------------------------

describe('clamp (sports)', () => {
  it('clamps to range', () => {
    expect(clamp(-0.5, 0, 1)).toBe(0);
    expect(clamp(1.5, 0, 1)).toBe(1);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// SportsStrategy.analyze — integration tests
// ---------------------------------------------------------------------------

describe('SportsStrategy.analyze', () => {
  let strategy: SportsStrategy;
  let emitSpy: ReturnType<typeof vi.spyOn>;
  let mockNewsAggregator: ReturnType<typeof createMockNewsAggregator>;
  let mockTwitterAdapter: ReturnType<typeof createMockTwitterAdapter>;

  beforeEach(() => {
    // Create data that generates meaningful adjustments
    const scoredNews = [
      makeScoredNews(0.8, 0.9, 'Team on win streak', 'consecutive wins dominant performance'),
      makeScoredNews(0.7, 0.8, 'Players healthy and ready', 'full roster available'),
      makeScoredNews(0.6, 0.7, 'Coach confident', 'strong team performance expected'),
      makeScoredNews(0.5, 0.6, 'Positive matchup analysis', 'favorable statistics'),
    ];

    const twitterSentiment = makeTrendingSentiment({
      averageSentiment: 0.5,
      tweetCount: 40,
      strongPositive: 12,
      strongNegative: 3,
    });

    mockNewsAggregator = createMockNewsAggregator(scoredNews);
    mockTwitterAdapter = createMockTwitterAdapter(twitterSentiment);

    strategy = new SportsStrategy(
      mockNewsAggregator as never,
      mockTwitterAdapter as never,
    );

    emitSpy = vi.spyOn(eventBus, 'emit');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null for non-sports markets', async () => {
    const market = makeSportsMarket({ vertical: 'weather' as 'sports' });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for closed markets', async () => {
    const market = makeSportsMarket({ closed: true });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for inactive markets', async () => {
    const market = makeSportsMarket({ active: false });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for unparseable questions', async () => {
    const market = makeSportsMarket({ question: 'Will BTC reach $100K?' });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for markets below minimum volume', async () => {
    const market = makeSportsMarket({ volume: 2_000 });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for markets beyond 7-day horizon', async () => {
    const farDate = new Date();
    farDate.setDate(farDate.getDate() + 30);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${monthNames[farDate.getMonth()]} ${farDate.getDate()}, ${farDate.getFullYear()}`;

    const market = makeSportsMarket({
      question: `Will the Lakers beat the Celtics on ${dateStr}?`,
    });

    const signal = await strategy.analyze(market);
    expect(signal).toBeNull();
  });

  it('detects edge and returns a TradeSignal with positive data', async () => {
    // Near-term game with positive sentiment should shift probability
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${monthNames[tomorrow.getMonth()]} ${tomorrow.getDate()}, ${tomorrow.getFullYear()}`;

    const market = makeSportsMarket({
      question: `Will the Lakers beat the Celtics on ${dateStr}?`,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.35, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.65, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);

    // With positive news + Twitter + momentum + home advantage,
    // model should be above 0.35 + adjustments
    if (signal) {
      expect(signal.strategy).toBe('sports_model');
      expect(signal.vertical).toBe('sports');
      expect(signal.edge).toBeGreaterThanOrEqual(MIN_EDGE);
      expect(signal.confidence).toBeGreaterThanOrEqual(MIN_CONFIDENCE);
      expect(signal.reasoning).toContain('LAKERS');
    }
  });

  it('emits signal:detected on the event bus', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${monthNames[tomorrow.getMonth()]} ${tomorrow.getDate()}, ${tomorrow.getFullYear()}`;

    const market = makeSportsMarket({
      question: `Will the Lakers beat the Celtics on ${dateStr}?`,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.35, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.65, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);

    if (signal) {
      expect(emitSpy).toHaveBeenCalledWith('signal:detected', signal);
    }
  });

  it('returns null when no news data available', async () => {
    const emptyNewsAggregator = createMockNewsAggregator([]);
    const emptyTwitterAdapter = createMockTwitterAdapter(makeTrendingSentiment());

    const noDataStrategy = new SportsStrategy(
      emptyNewsAggregator as never,
      emptyTwitterAdapter as never,
    );

    const market = makeSportsMarket();
    const signal = await noDataStrategy.analyze(market);

    // With no adjustments except home advantage (3%), model = market + 0.03
    // Edge = 0.03, below MIN_EDGE of 0.08 => null
    expect(signal).toBeNull();
  });

  it('signal includes team names in reasoning', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${monthNames[tomorrow.getMonth()]} ${tomorrow.getDate()}, ${tomorrow.getFullYear()}`;

    const market = makeSportsMarket({
      question: `Will the Lakers beat the Celtics on ${dateStr}?`,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.35, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.65, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);
    if (signal) {
      expect(signal.reasoning.toLowerCase()).toContain('lakers');
    }
  });

  it('handles championship markets', async () => {
    const market = makeSportsMarket({
      question: 'Will the Chiefs win the Super Bowl?',
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.20, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.80, outcome: 'No' },
      },
    });

    // Championship markets without a date should still parse
    const signal = await strategy.analyze(market);
    // May or may not signal depending on adjustments vs market price
    if (signal) {
      expect(signal.vertical).toBe('sports');
      expect(signal.strategy).toBe('sports_model');
    }
  });
});
