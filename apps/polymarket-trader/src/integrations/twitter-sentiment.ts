/**
 * Twitter Sentiment Adapter for Polymarket information arbitrage.
 *
 * Fetches tweets from Nitter RSS instances (free, no auth required),
 * scores sentiment with keyword-based heuristics per vertical
 * (crypto and politics), and tracks trending sentiment for topics.
 *
 * Zero external dependencies -- uses native fetch() and regex XML parsing.
 */

import { eventBus } from '../engine/event-bus.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Tweet {
  author: string;
  content: string;
  publishedAt: Date;
  url: string;
}

export interface ScoredTweet {
  tweet: Tweet;
  sentimentScore: number;   // -1 to +1
  vertical: 'crypto' | 'politics' | 'general';
}

export interface TrendingSentiment {
  topic: string;
  averageSentiment: number; // -1 to +1
  tweetCount: number;
  strongPositive: number;   // count of tweets with score > 0.5
  strongNegative: number;   // count of tweets with score < -0.5
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Sentiment keyword dictionaries — vertical-specific
// ---------------------------------------------------------------------------

export const CRYPTO_POSITIVE: ReadonlySet<string> = new Set([
  'bullish', 'moon', 'pump', 'rally', 'breakout', 'ath', 'surge',
  'accumulate', 'hodl', 'buy', 'long', 'green', 'uptrend', 'parabolic',
  'undervalued', 'gem', 'alpha', 'degen', 'wagmi', 'gm',
]);

export const CRYPTO_NEGATIVE: ReadonlySet<string> = new Set([
  'bearish', 'dump', 'crash', 'rug', 'scam', 'short', 'sell',
  'rekt', 'liquidated', 'ngmi', 'dead', 'exit', 'overvalued',
  'bubble', 'ponzi', 'fraud', 'hack', 'exploit', 'plunge', 'capitulate',
]);

export const POLITICS_POSITIVE: ReadonlySet<string> = new Set([
  'win', 'winning', 'ahead', 'lead', 'leading', 'surge', 'victory',
  'elected', 'endorse', 'endorsed', 'support', 'momentum', 'popular',
  'landslide', 'favorite', 'frontrunner', 'rally', 'outperform', 'strong',
  'confident',
]);

export const POLITICS_NEGATIVE: ReadonlySet<string> = new Set([
  'lose', 'losing', 'behind', 'trail', 'trailing', 'defeat', 'scandal',
  'resign', 'impeach', 'oppose', 'unpopular', 'collapse', 'drop',
  'weak', 'gaffe', 'controversy', 'indicted', 'charged', 'plummet',
  'embarrass',
]);

export const GENERAL_POSITIVE: ReadonlySet<string> = new Set([
  'approve', 'pass', 'win', 'surge', 'rise', 'success', 'gain',
  'rally', 'boost', 'soar', 'advance', 'positive', 'growth', 'recover',
  'bullish', 'support', 'confirm', 'victory', 'lead', 'uptick',
]);

export const GENERAL_NEGATIVE: ReadonlySet<string> = new Set([
  'reject', 'fail', 'crash', 'drop', 'bearish', 'oppose', 'deny',
  'block', 'delay', 'loss', 'decline', 'plunge', 'collapse', 'fall',
  'defeat', 'negative', 'downturn', 'slump', 'stall', 'tumble',
]);

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: Tweet[];
  expiresAt: number;
}

const DEFAULT_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes (faster than news)

// ---------------------------------------------------------------------------
// Rate limiter
// ---------------------------------------------------------------------------

const DEFAULT_RATE_LIMIT_MS = 5_000; // 1 request per 5 seconds

// ---------------------------------------------------------------------------
// Nitter RSS helpers
// ---------------------------------------------------------------------------

/** Public Nitter instances for RSS. Rotated on failure. */
const NITTER_INSTANCES = [
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://nitter.cz',
] as const;

/**
 * Build Nitter search RSS URL for a query.
 */
export function buildNitterSearchUrl(baseUrl: string, query: string): string {
  const encoded = encodeURIComponent(query);
  return `${baseUrl}/search/rss?f=tweets&q=${encoded}`;
}

/**
 * Parse Nitter RSS XML into Tweet[].
 * Uses regex parsing -- no XML library needed.
 */
export function parseNitterRss(xml: string): Tweet[] {
  const tweets: Tweet[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const creator = extractTag(block, 'dc:creator');
    const description = extractTag(block, 'description');

    if (title || description) {
      tweets.push({
        author: creator ? decodeHtmlEntities(creator) : 'unknown',
        content: decodeHtmlEntities(stripHtml(description || title || '')),
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        url: link ?? '',
      });
    }
  }

  return tweets;
}

/**
 * Extract text content from an XML tag. Returns null if not found.
 */
function extractTag(xml: string, tag: string): string | null {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `<${escapedTag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${escapedTag}>`,
    'i',
  );
  const m = xml.match(regex);
  return m ? m[1].trim() : null;
}

/**
 * Strip HTML tags from a string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

/**
 * Decode common HTML entities.
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Tokenize text into lowercase words, stripping punctuation.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// ---------------------------------------------------------------------------
// Vertical detection
// ---------------------------------------------------------------------------

const CRYPTO_INDICATORS = new Set([
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'defi', 'nft',
  'blockchain', 'token', 'coin', 'sol', 'solana', 'matic', 'polygon',
  'usdc', 'usdt', 'stablecoin', 'web3', 'dex', 'cex',
]);

const POLITICS_INDICATORS = new Set([
  'election', 'vote', 'president', 'democrat', 'republican', 'congress',
  'senate', 'poll', 'candidate', 'campaign', 'political', 'governor',
  'primary', 'ballot', 'legislation', 'policy', 'trump', 'biden',
]);

/**
 * Detect the vertical of a tweet based on keyword indicators.
 */
export function detectVertical(text: string): 'crypto' | 'politics' | 'general' {
  const words = tokenize(text);
  let cryptoHits = 0;
  let politicsHits = 0;

  for (const word of words) {
    if (CRYPTO_INDICATORS.has(word)) cryptoHits++;
    if (POLITICS_INDICATORS.has(word)) politicsHits++;
  }

  if (cryptoHits > politicsHits && cryptoHits > 0) return 'crypto';
  if (politicsHits > cryptoHits && politicsHits > 0) return 'politics';
  return 'general';
}

// ---------------------------------------------------------------------------
// TwitterSentimentAdapter
// ---------------------------------------------------------------------------

export interface TwitterSentimentConfig {
  nitterInstances?: string[];
  cacheTtlMs?: number;
  rateLimitMs?: number;
  requestTimeoutMs?: number;
}

export class TwitterSentimentAdapter {
  private cache: Map<string, CacheEntry> = new Map();
  private lastRequestTime = 0;
  private nitterInstances: string[];
  private cacheTtlMs: number;
  private rateLimitMs: number;
  private requestTimeoutMs: number;

  constructor(config: TwitterSentimentConfig = {}) {
    this.nitterInstances = config.nitterInstances ?? [...NITTER_INSTANCES];
    this.cacheTtlMs = config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.rateLimitMs = config.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS;
    this.requestTimeoutMs = config.requestTimeoutMs ?? 10_000;
  }

  /**
   * Fetch recent tweets for a search query.
   * Results cached for 2 minutes per query.
   * Rate limited to 1 request per 5 seconds.
   * Returns empty array on any failure.
   */
  async getRecentTweets(query: string, limit = 20): Promise<Tweet[]> {
    const cacheKey = query.toLowerCase().trim();

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data.slice(0, limit);
    }

    // Rate limit
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitMs) {
      // Return cached data if available (even if expired), else empty
      return cached ? cached.data.slice(0, limit) : [];
    }

    this.lastRequestTime = Date.now();

    // Try each Nitter instance until one works
    for (const instance of this.nitterInstances) {
      try {
        const url = buildNitterSearchUrl(instance, query);
        const response = await fetch(url, {
          headers: { 'User-Agent': 'PolymarketTrader/1.0' },
          signal: AbortSignal.timeout(this.requestTimeoutMs),
        });

        if (!response.ok) continue;

        const xml = await response.text();
        const tweets = parseNitterRss(xml);

        // Cache result
        this.cache.set(cacheKey, {
          data: tweets,
          expiresAt: Date.now() + this.cacheTtlMs,
        });

        return tweets.slice(0, limit);
      } catch {
        // Try next instance
        continue;
      }
    }

    // All instances failed -- return empty, never throw
    return [];
  }

  /**
   * Score sentiment of tweets using vertical-specific keywords.
   * Returns ScoredTweet[] with sentiment in [-1, +1].
   */
  scoreSentiment(tweets: Tweet[]): ScoredTweet[] {
    return tweets.map((tweet) => {
      const vertical = detectVertical(tweet.content);
      const score = this.scoreSingleTweet(tweet.content, vertical);
      return { tweet, sentimentScore: score, vertical };
    });
  }

  /**
   * Score a single text using vertical-specific keyword sets.
   */
  private scoreSingleTweet(
    text: string,
    vertical: 'crypto' | 'politics' | 'general',
  ): number {
    const words = tokenize(text);
    if (words.length === 0) return 0;

    let positive: ReadonlySet<string>;
    let negative: ReadonlySet<string>;

    switch (vertical) {
      case 'crypto':
        positive = CRYPTO_POSITIVE;
        negative = CRYPTO_NEGATIVE;
        break;
      case 'politics':
        positive = POLITICS_POSITIVE;
        negative = POLITICS_NEGATIVE;
        break;
      default:
        positive = GENERAL_POSITIVE;
        negative = GENERAL_NEGATIVE;
    }

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (positive.has(word)) positiveCount++;
      if (negative.has(word)) negativeCount++;
    }

    const total = positiveCount + negativeCount;
    if (total === 0) return 0;

    const raw = (positiveCount - negativeCount) / total;
    return Math.max(-1, Math.min(1, raw));
  }

  /**
   * Get trending sentiment for a topic.
   * Fetches tweets, scores them, and returns aggregate metrics.
   * Emits 'data:twitter-sentiment' event with results.
   * Returns neutral defaults on failure.
   */
  async getTrendingSentiment(topic: string, limit = 50): Promise<TrendingSentiment> {
    const defaultResult: TrendingSentiment = {
      topic,
      averageSentiment: 0,
      tweetCount: 0,
      strongPositive: 0,
      strongNegative: 0,
      timestamp: new Date(),
    };

    try {
      const tweets = await this.getRecentTweets(topic, limit);
      if (tweets.length === 0) return defaultResult;

      const scored = this.scoreSentiment(tweets);

      let totalSentiment = 0;
      let strongPos = 0;
      let strongNeg = 0;

      for (const s of scored) {
        totalSentiment += s.sentimentScore;
        if (s.sentimentScore > 0.5) strongPos++;
        if (s.sentimentScore < -0.5) strongNeg++;
      }

      const result: TrendingSentiment = {
        topic,
        averageSentiment: scored.length > 0 ? totalSentiment / scored.length : 0,
        tweetCount: scored.length,
        strongPositive: strongPos,
        strongNegative: strongNeg,
        timestamp: new Date(),
      };

      // Emit event for the trading system
      eventBus.emit('data:twitter-sentiment', result);

      return result;
    } catch {
      return defaultResult;
    }
  }

  /**
   * Clear the internal tweet cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset rate limiter (useful for testing).
   */
  resetRateLimiter(): void {
    this.lastRequestTime = 0;
  }
}
