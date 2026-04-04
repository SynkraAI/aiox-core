import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TwitterSentimentAdapter,
  parseNitterRss,
  buildNitterSearchUrl,
  tokenize,
  detectVertical,
  decodeHtmlEntities,
  CRYPTO_POSITIVE,
  CRYPTO_NEGATIVE,
  POLITICS_POSITIVE,
  POLITICS_NEGATIVE,
  GENERAL_POSITIVE,
  GENERAL_NEGATIVE,
  type Tweet,
} from '../src/integrations/twitter-sentiment.js';

// ---------------------------------------------------------------------------
// RSS parsing
// ---------------------------------------------------------------------------

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Search results</title>
  <item>
    <title>BTC is going to the moon! Bullish!</title>
    <link>https://twitter.com/user1/status/123</link>
    <dc:creator>@cryptoguy</dc:creator>
    <description><![CDATA[BTC is going to the moon! Bullish! 🚀]]></description>
    <pubDate>Fri, 04 Apr 2026 10:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Crash incoming, sell everything bearish dump</title>
    <link>https://twitter.com/user2/status/456</link>
    <dc:creator>@bearguy</dc:creator>
    <description>Crash incoming, sell everything bearish dump</description>
    <pubDate>Fri, 04 Apr 2026 09:30:00 GMT</pubDate>
  </item>
  <item>
    <title>Election poll shows candidate ahead winning</title>
    <link>https://twitter.com/user3/status/789</link>
    <dc:creator>@politico</dc:creator>
    <description>Election poll shows candidate ahead winning by landslide</description>
    <pubDate>Fri, 04 Apr 2026 09:00:00 GMT</pubDate>
  </item>
</channel>
</rss>`;

describe('TwitterSentimentAdapter', () => {
  let adapter: TwitterSentimentAdapter;

  beforeEach(() => {
    adapter = new TwitterSentimentAdapter({
      cacheTtlMs: 2 * 60 * 1000,
      rateLimitMs: 5_000,
      requestTimeoutMs: 5_000,
    });
  });

  // -------------------------------------------------------------------------
  // RSS parsing
  // -------------------------------------------------------------------------

  describe('parseNitterRss', () => {
    it('should parse valid RSS into Tweet[]', () => {
      const tweets = parseNitterRss(SAMPLE_RSS);
      expect(tweets).toHaveLength(3);
      expect(tweets[0].author).toBe('@cryptoguy');
      expect(tweets[0].content).toContain('moon');
      expect(tweets[0].url).toBe('https://twitter.com/user1/status/123');
      expect(tweets[0].publishedAt).toBeInstanceOf(Date);
    });

    it('should return empty array for invalid XML', () => {
      expect(parseNitterRss('')).toEqual([]);
      expect(parseNitterRss('not xml at all')).toEqual([]);
    });

    it('should handle missing fields gracefully', () => {
      const partial = '<rss><channel><item><title>Hello</title></item></channel></rss>';
      const tweets = parseNitterRss(partial);
      expect(tweets).toHaveLength(1);
      expect(tweets[0].author).toBe('unknown');
      expect(tweets[0].url).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // URL building
  // -------------------------------------------------------------------------

  describe('buildNitterSearchUrl', () => {
    it('should encode query params properly', () => {
      const url = buildNitterSearchUrl('https://nitter.example.com', 'bitcoin price');
      expect(url).toBe('https://nitter.example.com/search/rss?f=tweets&q=bitcoin%20price');
    });
  });

  // -------------------------------------------------------------------------
  // Tokenizer
  // -------------------------------------------------------------------------

  describe('tokenize', () => {
    it('should lowercase and strip punctuation', () => {
      expect(tokenize('Bitcoin is BULLISH!')).toEqual(['bitcoin', 'is', 'bullish']);
    });

    it('should filter single-char tokens', () => {
      expect(tokenize('a b cc')).toEqual(['cc']);
    });

    it('should return empty for empty string', () => {
      expect(tokenize('')).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // HTML entities
  // -------------------------------------------------------------------------

  describe('decodeHtmlEntities', () => {
    it('should decode all common entities', () => {
      expect(decodeHtmlEntities('&amp;&lt;&gt;&quot;&#39;&apos;')).toBe('&<>"\'\'');
    });
  });

  // -------------------------------------------------------------------------
  // Vertical detection
  // -------------------------------------------------------------------------

  describe('detectVertical', () => {
    it('should detect crypto topics', () => {
      expect(detectVertical('Bitcoin ETH price prediction crypto')).toBe('crypto');
    });

    it('should detect politics topics', () => {
      expect(detectVertical('Election poll president candidate vote')).toBe('politics');
    });

    it('should return general for ambiguous text', () => {
      expect(detectVertical('The weather is nice today')).toBe('general');
    });

    it('should return crypto when crypto keywords dominate', () => {
      expect(detectVertical('Bitcoin blockchain token vote')).toBe('crypto');
    });
  });

  // -------------------------------------------------------------------------
  // Keyword sets
  // -------------------------------------------------------------------------

  describe('keyword sets', () => {
    it('crypto positive keywords should contain bullish/moon/pump', () => {
      expect(CRYPTO_POSITIVE.has('bullish')).toBe(true);
      expect(CRYPTO_POSITIVE.has('moon')).toBe(true);
      expect(CRYPTO_POSITIVE.has('pump')).toBe(true);
    });

    it('crypto negative keywords should contain bearish/dump/crash', () => {
      expect(CRYPTO_NEGATIVE.has('bearish')).toBe(true);
      expect(CRYPTO_NEGATIVE.has('dump')).toBe(true);
      expect(CRYPTO_NEGATIVE.has('crash')).toBe(true);
    });

    it('politics positive should contain win/ahead/lead', () => {
      expect(POLITICS_POSITIVE.has('win')).toBe(true);
      expect(POLITICS_POSITIVE.has('ahead')).toBe(true);
      expect(POLITICS_POSITIVE.has('lead')).toBe(true);
    });

    it('politics negative should contain lose/behind/defeat', () => {
      expect(POLITICS_NEGATIVE.has('lose')).toBe(true);
      expect(POLITICS_NEGATIVE.has('behind')).toBe(true);
      expect(POLITICS_NEGATIVE.has('defeat')).toBe(true);
    });

    it('general positive and negative should have standard terms', () => {
      expect(GENERAL_POSITIVE.has('surge')).toBe(true);
      expect(GENERAL_NEGATIVE.has('crash')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Sentiment scoring
  // -------------------------------------------------------------------------

  describe('scoreSentiment', () => {
    it('should score bullish crypto tweet as positive', () => {
      const tweets: Tweet[] = [
        { author: '@user', content: 'Bitcoin bullish moon pump rally', publishedAt: new Date(), url: '' },
      ];
      const scored = adapter.scoreSentiment(tweets);
      expect(scored).toHaveLength(1);
      expect(scored[0].sentimentScore).toBeGreaterThan(0);
      expect(scored[0].vertical).toBe('crypto');
    });

    it('should score bearish crypto tweet as negative', () => {
      const tweets: Tweet[] = [
        { author: '@user', content: 'Bitcoin crash dump bearish rekt crypto', publishedAt: new Date(), url: '' },
      ];
      const scored = adapter.scoreSentiment(tweets);
      expect(scored).toHaveLength(1);
      expect(scored[0].sentimentScore).toBeLessThan(0);
      expect(scored[0].vertical).toBe('crypto');
    });

    it('should score positive politics tweet correctly', () => {
      const tweets: Tweet[] = [
        { author: '@user', content: 'Candidate winning election poll ahead lead', publishedAt: new Date(), url: '' },
      ];
      const scored = adapter.scoreSentiment(tweets);
      expect(scored[0].sentimentScore).toBeGreaterThan(0);
      expect(scored[0].vertical).toBe('politics');
    });

    it('should score negative politics tweet correctly', () => {
      const tweets: Tweet[] = [
        { author: '@user', content: 'Election scandal defeat losing candidate trail', publishedAt: new Date(), url: '' },
      ];
      const scored = adapter.scoreSentiment(tweets);
      expect(scored[0].sentimentScore).toBeLessThan(0);
    });

    it('should return 0 for neutral text', () => {
      const tweets: Tweet[] = [
        { author: '@user', content: 'Today is a regular day nothing special', publishedAt: new Date(), url: '' },
      ];
      const scored = adapter.scoreSentiment(tweets);
      expect(scored[0].sentimentScore).toBe(0);
    });

    it('should clamp sentiment between -1 and 1', () => {
      const tweets: Tweet[] = [
        { author: '@user', content: 'bullish moon pump rally surge breakout accumulate hodl buy long', publishedAt: new Date(), url: '' },
      ];
      const scored = adapter.scoreSentiment(tweets);
      expect(scored[0].sentimentScore).toBeGreaterThanOrEqual(-1);
      expect(scored[0].sentimentScore).toBeLessThanOrEqual(1);
    });

    it('should handle empty tweets array', () => {
      expect(adapter.scoreSentiment([])).toEqual([]);
    });

    it('should handle tweet with empty content', () => {
      const tweets: Tweet[] = [
        { author: '@user', content: '', publishedAt: new Date(), url: '' },
      ];
      const scored = adapter.scoreSentiment(tweets);
      expect(scored[0].sentimentScore).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Caching
  // -------------------------------------------------------------------------

  describe('caching', () => {
    it('should use cached results on second call', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(SAMPLE_RSS, { status: 200 }),
      );

      const first = await adapter.getRecentTweets('bitcoin');
      adapter.resetRateLimiter(); // allow second request if needed
      const second = await adapter.getRecentTweets('bitcoin');

      // Should only have fetched once
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(first).toEqual(second);

      fetchSpy.mockRestore();
    });

    it('should clear cache when clearCache is called', async () => {
      // Use single-instance adapter to avoid rotation multiplying fetch calls
      const singleAdapter = new TwitterSentimentAdapter({
        nitterInstances: ['https://nitter.test.com'],
      });

      // Return fresh Response each time (Response body can only be read once)
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
        () => Promise.resolve(new Response(SAMPLE_RSS, { status: 200 })),
      );

      await singleAdapter.getRecentTweets('bitcoin');
      singleAdapter.clearCache();
      singleAdapter.resetRateLimiter();
      await singleAdapter.getRecentTweets('bitcoin');

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // Rate limiting
  // -------------------------------------------------------------------------

  describe('rate limiting', () => {
    it('should not fetch if within rate limit window', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(SAMPLE_RSS, { status: 200 }),
      );

      // First call succeeds
      await adapter.getRecentTweets('bitcoin');

      // Clear cache but don't reset rate limiter
      adapter.clearCache();

      // Second call should be rate-limited (returns empty since cache was cleared)
      const result = await adapter.getRecentTweets('bitcoin');
      expect(result).toEqual([]);

      // Only one fetch should have been made
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      fetchSpy.mockRestore();
    });

    it('should allow fetch after rate limit resets', async () => {
      // Use single-instance adapter to get predictable fetch counts
      const singleAdapter = new TwitterSentimentAdapter({
        nitterInstances: ['https://nitter.test.com'],
      });

      // Return fresh Response each time (Response body can only be read once)
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
        () => Promise.resolve(new Response(SAMPLE_RSS, { status: 200 })),
      );

      await singleAdapter.getRecentTweets('bitcoin');
      singleAdapter.clearCache();
      singleAdapter.resetRateLimiter();

      const result = await singleAdapter.getRecentTweets('bitcoin');
      expect(result.length).toBeGreaterThan(0);
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // Graceful failure
  // -------------------------------------------------------------------------

  describe('graceful failure', () => {
    it('should return empty on network error', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new Error('Network error'),
      );

      const result = await adapter.getRecentTweets('bitcoin');
      expect(result).toEqual([]);

      fetchSpy.mockRestore();
    });

    it('should return empty on HTTP error', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', { status: 500 }),
      );

      const result = await adapter.getRecentTweets('bitcoin');
      expect(result).toEqual([]);

      fetchSpy.mockRestore();
    });

    it('should try multiple Nitter instances on failure', async () => {
      const customAdapter = new TwitterSentimentAdapter({
        nitterInstances: ['https://bad1.com', 'https://bad2.com', 'https://good.com'],
      });

      const fetchSpy = vi.spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(new Response(SAMPLE_RSS, { status: 200 }));

      const result = await customAdapter.getRecentTweets('bitcoin');
      expect(result.length).toBeGreaterThan(0);
      expect(fetchSpy).toHaveBeenCalledTimes(3);

      fetchSpy.mockRestore();
    });

    it('should return empty if all Nitter instances fail', async () => {
      const customAdapter = new TwitterSentimentAdapter({
        nitterInstances: ['https://bad1.com', 'https://bad2.com'],
      });

      const fetchSpy = vi.spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'));

      const result = await customAdapter.getRecentTweets('bitcoin');
      expect(result).toEqual([]);

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // getTrendingSentiment
  // -------------------------------------------------------------------------

  describe('getTrendingSentiment', () => {
    it('should return aggregate sentiment data', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(SAMPLE_RSS, { status: 200 }),
      );

      const result = await adapter.getTrendingSentiment('bitcoin');
      expect(result.topic).toBe('bitcoin');
      expect(result.tweetCount).toBeGreaterThan(0);
      expect(result.averageSentiment).toBeDefined();
      expect(result.strongPositive).toBeGreaterThanOrEqual(0);
      expect(result.strongNegative).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeInstanceOf(Date);

      fetchSpy.mockRestore();
    });

    it('should return neutral defaults on failure', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new Error('Network error'),
      );

      const result = await adapter.getTrendingSentiment('bitcoin');
      expect(result.topic).toBe('bitcoin');
      expect(result.averageSentiment).toBe(0);
      expect(result.tweetCount).toBe(0);

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // Limit parameter
  // -------------------------------------------------------------------------

  describe('limit parameter', () => {
    it('should respect the limit parameter', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(SAMPLE_RSS, { status: 200 }),
      );

      const result = await adapter.getRecentTweets('bitcoin', 1);
      expect(result).toHaveLength(1);

      fetchSpy.mockRestore();
    });
  });
});
