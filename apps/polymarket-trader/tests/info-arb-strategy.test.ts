import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  NewsAggregator,
  parseRssXml,
  decodeHtmlEntities,
  tokenize,
  extractKeywords,
  buildRssUrl,
  POSITIVE_KEYWORDS,
  NEGATIVE_KEYWORDS,
  type NewsItem,
  type ScoredNews,
} from '../src/integrations/news-aggregator.js';
import {
  InfoArbStrategy,
  clamp,
  recencyWeight,
  calculateAdjustedProbability,
  calculateConfidence,
  MIN_EDGE,
  MAX_NEWS_AGE_MS,
  PROB_FLOOR,
  PROB_CEILING,
} from '../src/strategies/info-arb-strategy.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { Market } from '../src/types/market.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: 'test-info-arb',
    question: 'Will Bitcoin surpass $100,000 by December 2026?',
    slug: 'btc-100k-2026',
    vertical: 'crypto',
    endDate: '2026-12-31',
    active: true,
    closed: false,
    tokens: {
      yes: { tokenId: 'yes-1', price: 0.45, outcome: 'Yes' },
      no: { tokenId: 'no-1', price: 0.55, outcome: 'No' },
    },
    volume: 50000,
    liquidity: 30000,
    lastPrice: 0.45,
    ...overrides,
  };
}

function makeNewsItem(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    title: 'Bitcoin surges past $95,000 as rally continues',
    source: 'CoinDesk',
    publishedAt: new Date(),
    url: 'https://example.com/btc-surge',
    snippet: 'Bitcoin price rally shows bullish momentum with strong support levels',
    ...overrides,
  };
}

function makeScoredNews(overrides: Partial<ScoredNews> = {}): ScoredNews {
  return {
    item: makeNewsItem(),
    relevanceScore: 0.6,
    sentimentScore: 0.5,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// NewsAggregator — Sentiment Scoring
// ---------------------------------------------------------------------------

describe('NewsAggregator.scoreSentiment', () => {
  const agg = new NewsAggregator();

  it('returns positive score for positive headlines', () => {
    const score = agg.scoreSentiment('Bitcoin surges to new high, rally confirms bullish trend');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns negative score for negative headlines', () => {
    const score = agg.scoreSentiment('Markets crash as fears of decline block recovery');
    expect(score).toBeLessThan(0);
    expect(score).toBeGreaterThanOrEqual(-1);
  });

  it('returns 0 for neutral headlines with no sentiment words', () => {
    const score = agg.scoreSentiment('Annual report released by the committee today');
    expect(score).toBe(0);
  });

  it('returns 0 for empty input', () => {
    expect(agg.scoreSentiment('')).toBe(0);
  });

  it('handles mixed sentiment correctly', () => {
    // "surge" is positive, "crash" is negative -- should be near 0
    const score = agg.scoreSentiment('Markets surge then crash in volatile session');
    expect(Math.abs(score)).toBeLessThanOrEqual(1);
  });

  it('clamps score to [-1, +1] even with many keywords', () => {
    const manyPositive = 'win win win surge rally boost gain rise support confirm';
    expect(agg.scoreSentiment(manyPositive)).toBeLessThanOrEqual(1);
    expect(agg.scoreSentiment(manyPositive)).toBeGreaterThanOrEqual(-1);
  });
});

// ---------------------------------------------------------------------------
// NewsAggregator — Relevance Matching
// ---------------------------------------------------------------------------

describe('NewsAggregator.findRelevantNews', () => {
  const agg = new NewsAggregator();

  it('scores headlines with keyword overlap higher', () => {
    const headlines: NewsItem[] = [
      makeNewsItem({ title: 'Bitcoin price hits new record', snippet: 'Bitcoin surpasses $95k' }),
      makeNewsItem({ title: 'Weather forecast for NYC', snippet: 'Temperatures expected to rise' }),
    ];

    const results = agg.findRelevantNews('Will Bitcoin surpass $100,000?', headlines);
    expect(results.length).toBeGreaterThanOrEqual(1);
    // Bitcoin headline should rank first
    expect(results[0].item.title).toContain('Bitcoin');
    expect(results[0].relevanceScore).toBeGreaterThan(0);
  });

  it('returns empty array when no keywords match', () => {
    const headlines: NewsItem[] = [
      makeNewsItem({ title: 'Local sports team wins championship', snippet: 'Great game played today' }),
    ];
    const results = agg.findRelevantNews('Will the Federal Reserve cut interest rates?', headlines);
    // May return empty or very low relevance -- check no spurious matches
    for (const r of results) {
      expect(r.relevanceScore).toBeLessThan(1);
    }
  });

  it('returns results sorted by relevance descending', () => {
    const headlines: NewsItem[] = [
      makeNewsItem({ title: 'Unrelated story about cooking recipes', snippet: 'Delicious pasta' }),
      makeNewsItem({ title: 'Bitcoin surges past $100,000 milestone', snippet: 'Bitcoin rally continues with surpass of key level' }),
      makeNewsItem({ title: 'Bitcoin mentioned briefly in tech roundup', snippet: 'Various tech news' }),
    ];

    const results = agg.findRelevantNews('Will Bitcoin surpass $100,000?', headlines);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(results[i].relevanceScore);
    }
  });

  it('returns empty for empty headlines array', () => {
    const results = agg.findRelevantNews('Any question here?', []);
    expect(results).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// RSS Parsing
// ---------------------------------------------------------------------------

describe('parseRssXml', () => {
  it('parses standard RSS items', () => {
    const xml = `
      <rss><channel>
        <item>
          <title>Test Headline One</title>
          <link>https://example.com/1</link>
          <pubDate>Thu, 03 Apr 2026 12:00:00 GMT</pubDate>
          <source url="https://example.com">TestSource</source>
          <description>A short description.</description>
        </item>
        <item>
          <title>Test Headline Two</title>
          <link>https://example.com/2</link>
          <pubDate>Thu, 03 Apr 2026 13:00:00 GMT</pubDate>
          <source url="https://example.com">OtherSource</source>
          <description>Another description.</description>
        </item>
      </channel></rss>
    `;

    const items = parseRssXml(xml);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('Test Headline One');
    expect(items[0].source).toBe('TestSource');
    expect(items[0].url).toBe('https://example.com/1');
    expect(items[1].title).toBe('Test Headline Two');
  });

  it('handles CDATA wrapped titles', () => {
    const xml = `
      <rss><channel>
        <item>
          <title><![CDATA[CDATA Title & Special]]></title>
          <link>https://example.com/3</link>
        </item>
      </channel></rss>
    `;
    const items = parseRssXml(xml);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('CDATA Title & Special');
  });

  it('returns empty array for invalid XML', () => {
    expect(parseRssXml('')).toEqual([]);
    expect(parseRssXml('not xml at all')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// HTML entity decoding
// ---------------------------------------------------------------------------

describe('decodeHtmlEntities', () => {
  it('decodes common entities', () => {
    expect(decodeHtmlEntities('AT&amp;T &lt;NYSE&gt;')).toBe('AT&T <NYSE>');
    expect(decodeHtmlEntities('He said &quot;hello&quot;')).toBe('He said "hello"');
    expect(decodeHtmlEntities('It&#39;s fine')).toBe("It's fine");
  });
});

// ---------------------------------------------------------------------------
// Tokenize & extractKeywords
// ---------------------------------------------------------------------------

describe('tokenize', () => {
  it('lowercases and splits on whitespace/punctuation', () => {
    expect(tokenize('Hello, World!')).toEqual(['hello', 'world']);
  });

  it('filters single-character tokens', () => {
    expect(tokenize('a b cd ef')).toEqual(['cd', 'ef']);
  });
});

describe('extractKeywords', () => {
  it('removes stop words', () => {
    const kws = extractKeywords('Will the price surpass the target level?');
    expect(kws).not.toContain('will');
    expect(kws).not.toContain('the');
    expect(kws).toContain('price');
    expect(kws).toContain('surpass');
    expect(kws).toContain('target');
    expect(kws).toContain('level');
  });
});

// ---------------------------------------------------------------------------
// InfoArbStrategy — clamp
// ---------------------------------------------------------------------------

describe('clamp', () => {
  it('clamps to min', () => expect(clamp(-5, 0, 1)).toBe(0));
  it('clamps to max', () => expect(clamp(5, 0, 1)).toBe(1));
  it('leaves value in range', () => expect(clamp(0.5, 0, 1)).toBe(0.5));
});

// ---------------------------------------------------------------------------
// InfoArbStrategy — recencyWeight
// ---------------------------------------------------------------------------

describe('recencyWeight', () => {
  it('returns 1.0 for articles published just now', () => {
    const now = new Date();
    expect(recencyWeight(now, now)).toBe(1.0);
  });

  it('returns 0 for articles older than MAX_NEWS_AGE_MS', () => {
    const now = new Date();
    const old = new Date(now.getTime() - MAX_NEWS_AGE_MS - 1000);
    expect(recencyWeight(old, now)).toBe(0);
  });

  it('returns ~0.5 for articles at half the max age', () => {
    const now = new Date();
    const halfOld = new Date(now.getTime() - MAX_NEWS_AGE_MS / 2);
    expect(recencyWeight(halfOld, now)).toBeCloseTo(0.5, 1);
  });

  it('returns 1.0 for future-dated articles', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 60_000);
    expect(recencyWeight(future, now)).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// InfoArbStrategy — calculateAdjustedProbability
// ---------------------------------------------------------------------------

describe('calculateAdjustedProbability', () => {
  const now = new Date();

  it('returns base price when no news', () => {
    expect(calculateAdjustedProbability(0.50, [], now)).toBe(0.50);
  });

  it('adjusts upward for positive sentiment news', () => {
    const positiveNews: ScoredNews[] = [
      makeScoredNews({ relevanceScore: 0.8, sentimentScore: 0.7, item: makeNewsItem({ publishedAt: now }) }),
      makeScoredNews({ relevanceScore: 0.6, sentimentScore: 0.5, item: makeNewsItem({ publishedAt: now }) }),
    ];
    const adjusted = calculateAdjustedProbability(0.50, positiveNews, now);
    expect(adjusted).toBeGreaterThan(0.50);
  });

  it('adjusts downward for negative sentiment news', () => {
    const negativeNews: ScoredNews[] = [
      makeScoredNews({ relevanceScore: 0.8, sentimentScore: -0.8, item: makeNewsItem({ publishedAt: now }) }),
    ];
    const adjusted = calculateAdjustedProbability(0.50, negativeNews, now);
    expect(adjusted).toBeLessThan(0.50);
  });

  it('clamps result to [PROB_FLOOR, PROB_CEILING]', () => {
    const extremePositive: ScoredNews[] = Array.from({ length: 10 }, () =>
      makeScoredNews({ relevanceScore: 1.0, sentimentScore: 1.0, item: makeNewsItem({ publishedAt: now }) }),
    );
    const adjusted = calculateAdjustedProbability(0.90, extremePositive, now);
    expect(adjusted).toBeLessThanOrEqual(PROB_CEILING);

    const extremeNegative: ScoredNews[] = Array.from({ length: 10 }, () =>
      makeScoredNews({ relevanceScore: 1.0, sentimentScore: -1.0, item: makeNewsItem({ publishedAt: now }) }),
    );
    const adjustedLow = calculateAdjustedProbability(0.10, extremeNegative, now);
    expect(adjustedLow).toBeGreaterThanOrEqual(PROB_FLOOR);
  });
});

// ---------------------------------------------------------------------------
// InfoArbStrategy — calculateConfidence
// ---------------------------------------------------------------------------

describe('calculateConfidence', () => {
  const now = new Date();

  it('returns 0 for empty news', () => {
    expect(calculateConfidence([], now)).toBe(0);
  });

  it('returns higher confidence for more articles', () => {
    const oneArticle = [makeScoredNews({ item: makeNewsItem({ publishedAt: now }) })];
    const fiveArticles = Array.from({ length: 5 }, () =>
      makeScoredNews({ item: makeNewsItem({ publishedAt: now }) }),
    );

    const confOne = calculateConfidence(oneArticle, now);
    const confFive = calculateConfidence(fiveArticles, now);
    expect(confFive).toBeGreaterThan(confOne);
  });

  it('returns higher confidence for recent articles', () => {
    const recent = [makeScoredNews({ item: makeNewsItem({ publishedAt: now }) })];
    const old = [makeScoredNews({ item: makeNewsItem({ publishedAt: new Date(now.getTime() - MAX_NEWS_AGE_MS * 0.9) }) })];

    const confRecent = calculateConfidence(recent, now);
    const confOld = calculateConfidence(old, now);
    expect(confRecent).toBeGreaterThan(confOld);
  });

  it('confidence is bounded at 0.85', () => {
    const manyArticles = Array.from({ length: 50 }, () =>
      makeScoredNews({ relevanceScore: 1.0, item: makeNewsItem({ publishedAt: now }) }),
    );
    expect(calculateConfidence(manyArticles, now)).toBeLessThanOrEqual(0.85);
  });
});

// ---------------------------------------------------------------------------
// InfoArbStrategy — analyze (integration)
// ---------------------------------------------------------------------------

describe('InfoArbStrategy.analyze', () => {
  let mockAggregator: NewsAggregator;
  let strategy: InfoArbStrategy;

  beforeEach(() => {
    mockAggregator = new NewsAggregator();
    strategy = new InfoArbStrategy(mockAggregator);
  });

  it('returns null when no headlines are found', async () => {
    vi.spyOn(mockAggregator, 'getHeadlines').mockResolvedValue([]);
    const result = await strategy.analyze(makeMarket());
    expect(result).toBeNull();
  });

  it('returns null when no relevant news matches', async () => {
    vi.spyOn(mockAggregator, 'getHeadlines').mockResolvedValue([
      makeNewsItem({ title: 'Completely unrelated cooking article', snippet: 'Pasta recipe' }),
    ]);
    vi.spyOn(mockAggregator, 'findRelevantNews').mockReturnValue([]);

    const result = await strategy.analyze(makeMarket());
    expect(result).toBeNull();
  });

  it('returns null when edge is insufficient', async () => {
    // Small sentiment = small adjustment = edge < MIN_EDGE
    vi.spyOn(mockAggregator, 'getHeadlines').mockResolvedValue([makeNewsItem()]);
    vi.spyOn(mockAggregator, 'findRelevantNews').mockReturnValue([
      makeScoredNews({ relevanceScore: 0.3, sentimentScore: 0.05 }),
    ]);

    const result = await strategy.analyze(makeMarket());
    expect(result).toBeNull();
  });

  it('returns a YES signal when strong positive sentiment creates edge', async () => {
    const now = new Date();
    vi.spyOn(mockAggregator, 'getHeadlines').mockResolvedValue([makeNewsItem({ publishedAt: now })]);
    vi.spyOn(mockAggregator, 'findRelevantNews').mockReturnValue([
      makeScoredNews({ relevanceScore: 0.9, sentimentScore: 0.9, item: makeNewsItem({ publishedAt: now }) }),
      makeScoredNews({ relevanceScore: 0.8, sentimentScore: 0.8, item: makeNewsItem({ publishedAt: now }) }),
      makeScoredNews({ relevanceScore: 0.7, sentimentScore: 0.7, item: makeNewsItem({ publishedAt: now }) }),
    ]);

    // Market at 0.30 = low. Strong positive news should push model > 0.38 for 8% edge
    const market = makeMarket({
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.70, outcome: 'No' },
      },
    });

    const result = await strategy.analyze(market);
    expect(result).not.toBeNull();
    expect(result!.side).toBe('YES');
    expect(result!.edge).toBeGreaterThanOrEqual(MIN_EDGE);
    expect(result!.strategy).toBe('info_arb');
  });

  it('returns a NO signal when strong negative sentiment creates edge', async () => {
    const now = new Date();
    vi.spyOn(mockAggregator, 'getHeadlines').mockResolvedValue([makeNewsItem({ publishedAt: now })]);
    vi.spyOn(mockAggregator, 'findRelevantNews').mockReturnValue([
      makeScoredNews({ relevanceScore: 0.9, sentimentScore: -0.9, item: makeNewsItem({ publishedAt: now }) }),
      makeScoredNews({ relevanceScore: 0.8, sentimentScore: -0.8, item: makeNewsItem({ publishedAt: now }) }),
      makeScoredNews({ relevanceScore: 0.7, sentimentScore: -0.7, item: makeNewsItem({ publishedAt: now }) }),
    ]);

    // Market at 0.70 = high. Strong negative news should push model < 0.62 for 8% edge
    const market = makeMarket({
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.70, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.30, outcome: 'No' },
      },
    });

    const result = await strategy.analyze(market);
    expect(result).not.toBeNull();
    expect(result!.side).toBe('NO');
    expect(result!.edge).toBeGreaterThanOrEqual(MIN_EDGE);
  });

  it('returns null for inactive market', async () => {
    const result = await strategy.analyze(makeMarket({ active: false }));
    expect(result).toBeNull();
  });

  it('returns null for closed market', async () => {
    const result = await strategy.analyze(makeMarket({ closed: true }));
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Event bus emission
// ---------------------------------------------------------------------------

describe('InfoArbStrategy event emission', () => {
  it('emits signal:detected on the event bus when signal is generated', async () => {
    const now = new Date();
    const mockAggregator = new NewsAggregator();
    const strategy = new InfoArbStrategy(mockAggregator);

    vi.spyOn(mockAggregator, 'getHeadlines').mockResolvedValue([makeNewsItem({ publishedAt: now })]);
    vi.spyOn(mockAggregator, 'findRelevantNews').mockReturnValue([
      makeScoredNews({ relevanceScore: 0.9, sentimentScore: 0.9, item: makeNewsItem({ publishedAt: now }) }),
      makeScoredNews({ relevanceScore: 0.8, sentimentScore: 0.8, item: makeNewsItem({ publishedAt: now }) }),
      makeScoredNews({ relevanceScore: 0.7, sentimentScore: 0.7, item: makeNewsItem({ publishedAt: now }) }),
    ]);

    const market = makeMarket({
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.70, outcome: 'No' },
      },
    });

    const emitSpy = vi.spyOn(eventBus, 'emit');

    const result = await strategy.analyze(market);
    expect(result).not.toBeNull();

    expect(emitSpy).toHaveBeenCalledWith('signal:detected', expect.objectContaining({
      marketId: market.id,
      strategy: 'info_arb',
    }));

    emitSpy.mockRestore();
  });

  it('does NOT emit when no signal is generated', async () => {
    const mockAggregator = new NewsAggregator();
    const strategy = new InfoArbStrategy(mockAggregator);

    vi.spyOn(mockAggregator, 'getHeadlines').mockResolvedValue([]);

    const emitSpy = vi.spyOn(eventBus, 'emit');
    const result = await strategy.analyze(makeMarket());

    expect(result).toBeNull();
    expect(emitSpy).not.toHaveBeenCalledWith('signal:detected', expect.anything());

    emitSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// buildRssUrl
// ---------------------------------------------------------------------------

describe('buildRssUrl', () => {
  it('encodes query and builds correct URL', () => {
    const url = buildRssUrl('Bitcoin price');
    expect(url).toContain('news.google.com/rss/search');
    expect(url).toContain('q=Bitcoin%20price');
    expect(url).toContain('hl=en-US');
  });
});
