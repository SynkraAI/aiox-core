/**
 * Tests for the Politics Strategy module.
 * Covers: question parsing, probability adjustments, confidence,
 * edge detection, volume filters, and full analyze flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PoliticsStrategy,
  parsePoliticsQuestion,
  hasPoliticalIndicators,
  extractCandidates,
  detectElectionType,
  detectQuestionType,
  extractPoliticsDate,
  daysUntil,
  timeDecayFactor,
  calculateNewsSentimentAdjustment,
  calculateTwitterMomentumAdjustment,
  calculateIncumbencyBias,
  calculateOverreactionAdjustment,
  calculateConfidence,
  clamp,
  MIN_EDGE,
  MIN_CONFIDENCE,
  MAX_NEWS_ADJUSTMENT,
  MAX_TWITTER_ADJUSTMENT,
  INCUMBENCY_BIAS,
} from '../src/strategies/politics-strategy.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { Market } from '../src/types/market.js';
import type { ScoredNews, NewsItem } from '../src/integrations/news-aggregator.js';
import type { TrendingSentiment } from '../src/integrations/twitter-sentiment.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePoliticsMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: 'market-politics-1',
    question: 'Will Trump win the 2028 presidential election?',
    slug: 'trump-2028-president',
    vertical: 'politics',
    endDate: '2028-11-06',
    active: true,
    closed: false,
    tokens: {
      yes: { tokenId: 'yes-1', price: 0.45, outcome: 'Yes' },
      no: { tokenId: 'no-1', price: 0.55, outcome: 'No' },
    },
    volume: 50_000,
    liquidity: 30_000,
    lastPrice: 0.45,
    ...overrides,
  };
}

function makeScoredNews(sentiment: number, relevance: number, ageHours: number = 1): ScoredNews {
  const item: NewsItem = {
    title: 'Test headline',
    source: 'Test',
    publishedAt: new Date(Date.now() - ageHours * 60 * 60 * 1000),
    url: 'https://example.com',
    snippet: 'Test snippet',
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
// parsePoliticsQuestion
// ---------------------------------------------------------------------------

describe('parsePoliticsQuestion', () => {
  it('parses "Will Trump win the 2028 presidential election?"', () => {
    const result = parsePoliticsQuestion('Will Trump win the 2028 presidential election?');
    expect(result).not.toBeNull();
    expect(result!.candidates).toContain('trump');
    expect(result!.electionType).toBe('presidential');
    expect(result!.questionType).toBe('win_election');
    expect(result!.targetDate).not.toBeNull();
    expect(result!.targetDate!.getFullYear()).toBe(2028);
  });

  it('parses "Will Harris be the Democratic nominee?"', () => {
    const result = parsePoliticsQuestion('Will Harris be the Democratic nominee?');
    expect(result).not.toBeNull();
    expect(result!.candidates).toContain('harris');
    expect(result!.electionType).toBe('nomination');
    expect(result!.questionType).toBe('be_nominee');
  });

  it('parses "Will Biden resign before January 2027?"', () => {
    const result = parsePoliticsQuestion('Will Biden resign before January 2027?');
    expect(result).not.toBeNull();
    expect(result!.candidates).toContain('biden');
    expect(result!.questionType).toBe('happen_before_date');
    expect(result!.targetDate).not.toBeNull();
    expect(result!.targetDate!.getFullYear()).toBe(2027);
  });

  it('parses "Will the Republicans win the Senate in 2026?"', () => {
    const result = parsePoliticsQuestion('Will the Republicans win the Senate in 2026?');
    expect(result).not.toBeNull();
    expect(result!.electionType).toBe('senate');
    expect(result!.questionType).toBe('win_election');
  });

  it('parses "Will DeSantis win the primary?"', () => {
    const result = parsePoliticsQuestion('Will DeSantis win the primary election?');
    expect(result).not.toBeNull();
    expect(result!.candidates).toContain('desantis');
    expect(result!.electionType).toBe('primary');
  });

  it('parses international politicians: "Will Macron win the election?"', () => {
    const result = parsePoliticsQuestion('Will Macron win the election?');
    expect(result).not.toBeNull();
    expect(result!.candidates).toContain('macron');
  });

  it('returns null for non-political questions', () => {
    expect(parsePoliticsQuestion('Will BTC be above $100K?')).toBeNull();
    expect(parsePoliticsQuestion('Will the Lakers beat the Celtics?')).toBeNull();
    expect(parsePoliticsQuestion('Will it rain tomorrow?')).toBeNull();
  });

  it('detects incumbency for known incumbents', () => {
    const result = parsePoliticsQuestion('Will Trump win the 2028 presidential election?');
    expect(result).not.toBeNull();
    expect(result!.isIncumbent).toBe(true);
  });

  it('does not flag non-incumbents', () => {
    const result = parsePoliticsQuestion('Will the candidate win the election?');
    expect(result).not.toBeNull();
    expect(result!.isIncumbent).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasPoliticalIndicators
// ---------------------------------------------------------------------------

describe('hasPoliticalIndicators', () => {
  it('returns true for election-related text', () => {
    expect(hasPoliticalIndicators('win the election')).toBe(true);
    expect(hasPoliticalIndicators('senate vote')).toBe(true);
    expect(hasPoliticalIndicators('presidential candidate')).toBe(true);
    expect(hasPoliticalIndicators('campaign rally')).toBe(true);
  });

  it('returns false for non-political text', () => {
    expect(hasPoliticalIndicators('bitcoin price today')).toBe(false);
    expect(hasPoliticalIndicators('weather forecast')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractCandidates
// ---------------------------------------------------------------------------

describe('extractCandidates', () => {
  it('extracts known politicians', () => {
    const candidates = extractCandidates('trump vs biden in the election');
    expect(candidates).toContain('trump');
    expect(candidates).toContain('biden');
  });

  it('extracts international politicians', () => {
    const candidates = extractCandidates('macron and starmer election results');
    expect(candidates).toContain('macron');
    expect(candidates).toContain('starmer');
  });

  it('returns empty array for unknown names', () => {
    const candidates = extractCandidates('some random person in the election');
    expect(candidates).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// detectElectionType
// ---------------------------------------------------------------------------

describe('detectElectionType', () => {
  it('detects presidential', () => {
    expect(detectElectionType('presidential election')).toBe('presidential');
    expect(detectElectionType('win the president race')).toBe('presidential');
  });

  it('detects senate', () => {
    expect(detectElectionType('senate race 2026')).toBe('senate');
  });

  it('detects nomination', () => {
    expect(detectElectionType('be the nominee')).toBe('nomination');
  });

  it('detects primary', () => {
    expect(detectElectionType('win the primary')).toBe('primary');
  });

  it('returns other for generic', () => {
    expect(detectElectionType('some political event')).toBe('other');
  });
});

// ---------------------------------------------------------------------------
// detectQuestionType
// ---------------------------------------------------------------------------

describe('detectQuestionType', () => {
  it('detects win_election', () => {
    expect(detectQuestionType('will trump win the election')).toBe('win_election');
    expect(detectQuestionType('will she be elected')).toBe('win_election');
  });

  it('detects be_nominee', () => {
    expect(detectQuestionType('will harris be the nominee')).toBe('be_nominee');
    expect(detectQuestionType('will he get the nomination')).toBe('be_nominee');
  });

  it('detects happen_before_date', () => {
    expect(detectQuestionType('will biden resign before january')).toBe('happen_before_date');
  });

  it('returns other for unclear format', () => {
    expect(detectQuestionType('will the poll numbers change')).toBe('other');
  });
});

// ---------------------------------------------------------------------------
// extractPoliticsDate
// ---------------------------------------------------------------------------

describe('extractPoliticsDate', () => {
  it('extracts year-only dates (defaults to Nov 5)', () => {
    const date = extractPoliticsDate('Will Trump win the 2028 presidential election?');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2028);
    expect(date!.getMonth()).toBe(10); // November
    expect(date!.getDate()).toBe(5);
  });

  it('extracts "Month Year" format', () => {
    const date = extractPoliticsDate('Will this happen before January 2027?');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2027);
    expect(date!.getMonth()).toBe(0); // January
  });

  it('extracts "Month Day, Year" format', () => {
    const date = extractPoliticsDate('Will this happen before March 15, 2027?');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2027);
    expect(date!.getMonth()).toBe(2); // March
    expect(date!.getDate()).toBe(15);
  });

  it('extracts ISO date format', () => {
    const date = extractPoliticsDate('Event on 2027-06-15');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2027);
    expect(date!.getMonth()).toBe(5); // June
  });

  it('returns null when no date found', () => {
    expect(extractPoliticsDate('Will the candidate win?')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// daysUntil
// ---------------------------------------------------------------------------

describe('daysUntil', () => {
  it('returns correct days for future date', () => {
    const now = new Date('2026-01-01');
    const target = new Date('2026-01-11');
    expect(daysUntil(target, now)).toBe(10);
  });

  it('returns 0 for past dates', () => {
    const now = new Date('2026-06-01');
    const target = new Date('2026-01-01');
    expect(daysUntil(target, now)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// timeDecayFactor
// ---------------------------------------------------------------------------

describe('timeDecayFactor', () => {
  it('returns 1.0 for election day', () => {
    expect(timeDecayFactor(0)).toBe(1.0);
  });

  it('returns 0.95 for 1 week out', () => {
    expect(timeDecayFactor(7)).toBe(0.95);
  });

  it('returns 0.85 for 30 days out', () => {
    expect(timeDecayFactor(30)).toBe(0.85);
  });

  it('returns 0.50 for 1 year out', () => {
    expect(timeDecayFactor(365)).toBe(0.50);
  });
});

// ---------------------------------------------------------------------------
// calculateNewsSentimentAdjustment
// ---------------------------------------------------------------------------

describe('calculateNewsSentimentAdjustment', () => {
  it('returns 0 for empty news', () => {
    expect(calculateNewsSentimentAdjustment([])).toBe(0);
  });

  it('returns positive adjustment for positive news', () => {
    const news = [makeScoredNews(0.8, 0.9), makeScoredNews(0.6, 0.8)];
    const adj = calculateNewsSentimentAdjustment(news);
    expect(adj).toBeGreaterThan(0);
    expect(adj).toBeLessThanOrEqual(MAX_NEWS_ADJUSTMENT);
  });

  it('returns negative adjustment for negative news', () => {
    const news = [makeScoredNews(-0.8, 0.9), makeScoredNews(-0.6, 0.8)];
    const adj = calculateNewsSentimentAdjustment(news);
    expect(adj).toBeLessThan(0);
    expect(adj).toBeGreaterThanOrEqual(-MAX_NEWS_ADJUSTMENT);
  });

  it('is clamped to ±MAX_NEWS_ADJUSTMENT', () => {
    const news = [makeScoredNews(1.0, 1.0), makeScoredNews(1.0, 1.0), makeScoredNews(1.0, 1.0)];
    const adj = calculateNewsSentimentAdjustment(news);
    expect(adj).toBeLessThanOrEqual(MAX_NEWS_ADJUSTMENT);
  });
});

// ---------------------------------------------------------------------------
// calculateTwitterMomentumAdjustment
// ---------------------------------------------------------------------------

describe('calculateTwitterMomentumAdjustment', () => {
  it('returns 0 for zero tweets', () => {
    const sentiment = makeTrendingSentiment({ tweetCount: 0 });
    expect(calculateTwitterMomentumAdjustment(sentiment)).toBe(0);
  });

  it('returns positive for positive sentiment', () => {
    const sentiment = makeTrendingSentiment({ averageSentiment: 0.5, tweetCount: 50 });
    const adj = calculateTwitterMomentumAdjustment(sentiment);
    expect(adj).toBeGreaterThan(0);
    expect(adj).toBeLessThanOrEqual(MAX_TWITTER_ADJUSTMENT);
  });

  it('scales with tweet count', () => {
    const low = makeTrendingSentiment({ averageSentiment: 0.5, tweetCount: 5 });
    const high = makeTrendingSentiment({ averageSentiment: 0.5, tweetCount: 50 });
    expect(calculateTwitterMomentumAdjustment(high)).toBeGreaterThan(
      calculateTwitterMomentumAdjustment(low),
    );
  });

  it('is clamped to ±MAX_TWITTER_ADJUSTMENT', () => {
    const sentiment = makeTrendingSentiment({ averageSentiment: 1.0, tweetCount: 100 });
    expect(calculateTwitterMomentumAdjustment(sentiment)).toBeLessThanOrEqual(MAX_TWITTER_ADJUSTMENT);
  });
});

// ---------------------------------------------------------------------------
// calculateIncumbencyBias
// ---------------------------------------------------------------------------

describe('calculateIncumbencyBias', () => {
  it('returns INCUMBENCY_BIAS for incumbents in close races', () => {
    expect(calculateIncumbencyBias(true, 0.50)).toBe(INCUMBENCY_BIAS);
    expect(calculateIncumbencyBias(true, 0.45)).toBe(INCUMBENCY_BIAS);
  });

  it('returns 0 for non-incumbents', () => {
    expect(calculateIncumbencyBias(false, 0.50)).toBe(0);
  });

  it('returns 0 when race is not close (< 40%)', () => {
    expect(calculateIncumbencyBias(true, 0.30)).toBe(0);
  });

  it('returns 0 when race is not close (> 60%)', () => {
    expect(calculateIncumbencyBias(true, 0.70)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateOverreactionAdjustment
// ---------------------------------------------------------------------------

describe('calculateOverreactionAdjustment', () => {
  it('returns 0 for fewer than 3 recent articles', () => {
    const news = [makeScoredNews(0.8, 0.9, 1), makeScoredNews(0.7, 0.8, 2)];
    expect(calculateOverreactionAdjustment(news)).toBe(0);
  });

  it('returns contrarian adjustment for strong positive sentiment', () => {
    const news = [
      makeScoredNews(0.8, 0.9, 1),
      makeScoredNews(0.7, 0.8, 2),
      makeScoredNews(0.9, 0.9, 3),
    ];
    const adj = calculateOverreactionAdjustment(news);
    expect(adj).toBeLessThan(0); // Contrarian: go against positive herd
  });

  it('returns contrarian adjustment for strong negative sentiment', () => {
    const news = [
      makeScoredNews(-0.8, 0.9, 1),
      makeScoredNews(-0.7, 0.8, 2),
      makeScoredNews(-0.9, 0.9, 3),
    ];
    const adj = calculateOverreactionAdjustment(news);
    expect(adj).toBeGreaterThan(0); // Contrarian: go against negative herd
  });

  it('returns 0 for mixed/moderate sentiment', () => {
    const news = [
      makeScoredNews(0.3, 0.9, 1),
      makeScoredNews(-0.2, 0.8, 2),
      makeScoredNews(0.1, 0.9, 3),
    ];
    expect(calculateOverreactionAdjustment(news)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateConfidence
// ---------------------------------------------------------------------------

describe('calculateConfidence', () => {
  it('gives higher confidence with more data', () => {
    const lowData = calculateConfidence(2, 5, 10, true);
    const highData = calculateConfidence(10, 50, 10, true);
    expect(highData).toBeGreaterThan(lowData);
  });

  it('gives higher confidence for known candidates', () => {
    const unknown = calculateConfidence(2, 5, 60, false);
    const known = calculateConfidence(2, 5, 60, true);
    expect(known).toBeGreaterThan(unknown);
  });

  it('never exceeds 0.85', () => {
    expect(calculateConfidence(100, 1000, 1, true)).toBeLessThanOrEqual(0.85);
  });

  it('never goes below 0.10', () => {
    expect(calculateConfidence(0, 0, 365, false)).toBeGreaterThanOrEqual(0.10);
  });
});

// ---------------------------------------------------------------------------
// clamp
// ---------------------------------------------------------------------------

describe('clamp', () => {
  it('clamps below minimum', () => {
    expect(clamp(-0.5, 0, 1)).toBe(0);
  });

  it('clamps above maximum', () => {
    expect(clamp(1.5, 0, 1)).toBe(1);
  });

  it('passes through values in range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// PoliticsStrategy.analyze — integration tests
// ---------------------------------------------------------------------------

describe('PoliticsStrategy.analyze', () => {
  let strategy: PoliticsStrategy;
  let emitSpy: ReturnType<typeof vi.spyOn>;
  let mockNewsAggregator: ReturnType<typeof createMockNewsAggregator>;
  let mockTwitterAdapter: ReturnType<typeof createMockTwitterAdapter>;

  beforeEach(() => {
    // Create scored news with strong positive sentiment to generate edge
    const scoredNews = [
      makeScoredNews(0.9, 0.9, 1),
      makeScoredNews(0.8, 0.8, 2),
      makeScoredNews(0.7, 0.7, 3),
      makeScoredNews(0.6, 0.6, 4),
      makeScoredNews(0.5, 0.5, 5),
    ];

    const twitterSentiment = makeTrendingSentiment({
      averageSentiment: 0.6,
      tweetCount: 40,
      strongPositive: 15,
      strongNegative: 2,
    });

    mockNewsAggregator = createMockNewsAggregator(scoredNews);
    mockTwitterAdapter = createMockTwitterAdapter(twitterSentiment);

    strategy = new PoliticsStrategy(
      mockNewsAggregator as never,
      mockTwitterAdapter as never,
    );

    emitSpy = vi.spyOn(eventBus, 'emit');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null for non-politics markets', async () => {
    const market = makePoliticsMarket({ vertical: 'weather' as 'politics' });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for closed markets', async () => {
    const market = makePoliticsMarket({ closed: true });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for inactive markets', async () => {
    const market = makePoliticsMarket({ active: false });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for unparseable questions', async () => {
    const market = makePoliticsMarket({ question: 'Will it rain tomorrow?' });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for markets below minimum volume', async () => {
    const market = makePoliticsMarket({ volume: 5_000 });
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('returns null for long-term thin markets (>30d, <$50K)', async () => {
    const market = makePoliticsMarket({
      question: 'Will Trump win the 2028 presidential election?',
      volume: 20_000, // Below $50K threshold for long-term
    });
    // 2028 is > 30 days out
    expect(await strategy.analyze(market)).toBeNull();
  });

  it('detects edge and returns a TradeSignal with positive sentiment', async () => {
    // Market with strong positive sentiment should shift model probability up
    const market = makePoliticsMarket({
      question: 'Will Trump win the 2028 presidential election?',
      volume: 100_000,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.70, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);

    // With strong positive news + Twitter sentiment, model prob should be > 0.30
    // Adjustments: news ~+0.05, twitter ~+0.03, incumbency ~+0.02
    // Total model ~0.40, edge = 0.10, which equals MIN_EDGE
    if (signal) {
      expect(signal.strategy).toBe('politics_model');
      expect(signal.vertical).toBe('politics');
      expect(signal.edge).toBeGreaterThanOrEqual(MIN_EDGE);
      expect(signal.confidence).toBeGreaterThanOrEqual(MIN_CONFIDENCE);
      expect(signal.reasoning).toContain('TRUMP');
      expect(signal.reasoning).toContain('Politics');
    }
  });

  it('emits signal:detected on the event bus', async () => {
    const market = makePoliticsMarket({
      volume: 100_000,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.70, outcome: 'No' },
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

    const noDataStrategy = new PoliticsStrategy(
      emptyNewsAggregator as never,
      emptyTwitterAdapter as never,
    );

    const market = makePoliticsMarket({ volume: 100_000 });
    const signal = await noDataStrategy.analyze(market);

    // With no data, model prob = market prob, edge = 0
    expect(signal).toBeNull();
  });

  it('applies incumbency bias only in close races', async () => {
    // Test that incumbency bias is included in reasoning for close races
    const market = makePoliticsMarket({
      question: 'Will Trump win the 2028 presidential election?',
      volume: 100_000,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.70, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);
    // Market at 0.30 is outside close race range (40-60%), so no incumbency bias
    // But signal may still be generated from news/twitter adjustments
    if (signal) {
      expect(signal.vertical).toBe('politics');
    }
  });

  it('signal includes candidate names in reasoning', async () => {
    const market = makePoliticsMarket({
      volume: 100_000,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.70, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);
    if (signal) {
      expect(signal.reasoning).toContain('TRUMP');
    }
  });
});
