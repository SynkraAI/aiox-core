/**
 * News Aggregator for Polymarket information arbitrage.
 *
 * Fetches headlines from Google News RSS (free, no key required),
 * scores sentiment with keyword-based heuristics, and matches
 * headlines to market questions by keyword overlap.
 *
 * Zero external dependencies -- uses native fetch() and regex XML parsing.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NewsItem {
  title: string;
  source: string;
  publishedAt: Date;
  url: string;
  snippet: string;
}

export interface ScoredNews {
  item: NewsItem;
  relevanceScore: number;   // 0-1
  sentimentScore: number;   // -1 to +1
}

// ---------------------------------------------------------------------------
// Sentiment keyword dictionaries
// ---------------------------------------------------------------------------

export const POSITIVE_KEYWORDS: ReadonlySet<string> = new Set([
  'approve', 'pass', 'win', 'surge', 'rise', 'bullish', 'support',
  'confirm', 'success', 'gain', 'rally', 'boost', 'soar', 'advance',
  'victory', 'lead', 'positive', 'uptick', 'growth', 'recover',
]);

export const NEGATIVE_KEYWORDS: ReadonlySet<string> = new Set([
  'reject', 'fail', 'crash', 'drop', 'bearish', 'oppose', 'deny',
  'block', 'delay', 'loss', 'decline', 'plunge', 'collapse', 'fall',
  'defeat', 'negative', 'downturn', 'slump', 'stall', 'tumble',
]);

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: NewsItem[];
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// RSS helpers
// ---------------------------------------------------------------------------

const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search';

/**
 * Build the Google News RSS URL for a given query.
 */
export function buildRssUrl(query: string): string {
  const encoded = encodeURIComponent(query);
  return `${GOOGLE_NEWS_RSS}?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
}

/**
 * Parse RSS XML into NewsItem[] using simple regex extraction.
 * No xml2js dependency required -- RSS <item> structure is predictable.
 */
export function parseRssXml(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const source = extractTag(block, 'source');
    const description = extractTag(block, 'description');

    if (title) {
      items.push({
        title: decodeHtmlEntities(title),
        source: source ? decodeHtmlEntities(source) : 'Unknown',
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        url: link ?? '',
        snippet: description ? decodeHtmlEntities(stripHtml(description)) : '',
      });
    }
  }

  return items;
}

/**
 * Extract text content from an XML tag. Returns null if not found.
 */
function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`, 'i');
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

// ---------------------------------------------------------------------------
// Text analysis helpers
// ---------------------------------------------------------------------------

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

/**
 * Extract meaningful keywords from a market question.
 * Removes common stop words and short tokens.
 */
export function extractKeywords(question: string): string[] {
  const STOP_WORDS = new Set([
    'will', 'the', 'be', 'in', 'on', 'of', 'to', 'and', 'or', 'is',
    'it', 'that', 'this', 'for', 'with', 'from', 'by', 'at', 'an', 'a',
    'as', 'has', 'have', 'had', 'do', 'does', 'did', 'not', 'but', 'if',
    'their', 'there', 'than', 'more', 'before', 'after', 'above', 'below',
  ]);

  return tokenize(question).filter(
    (word) => word.length > 2 && !STOP_WORDS.has(word),
  );
}

// ---------------------------------------------------------------------------
// NewsAggregator
// ---------------------------------------------------------------------------

export class NewsAggregator {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Fetch recent headlines related to a query.
   * Results are cached for 5 minutes per query.
   * Returns empty array on any network failure.
   */
  async getHeadlines(query: string, limit = 20): Promise<NewsItem[]> {
    const cacheKey = query.toLowerCase().trim();

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data.slice(0, limit);
    }

    try {
      const url = buildRssUrl(query);
      const response = await fetch(url, {
        headers: { 'User-Agent': 'PolymarketTrader/1.0' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) return [];

      const xml = await response.text();
      const items = parseRssXml(xml);

      // Cache the full result set
      this.cache.set(cacheKey, {
        data: items,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return items.slice(0, limit);
    } catch {
      // Network failure, timeout, etc. -- return empty, never throw
      return [];
    }
  }

  /**
   * Score a headline's sentiment using keyword matching.
   * Returns a value in [-1, +1]. Zero for neutral/unknown.
   */
  scoreSentiment(headline: string): number {
    const words = tokenize(headline);
    if (words.length === 0) return 0;

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (POSITIVE_KEYWORDS.has(word)) positiveCount++;
      if (NEGATIVE_KEYWORDS.has(word)) negativeCount++;
    }

    const total = positiveCount + negativeCount;
    if (total === 0) return 0;

    const raw = (positiveCount - negativeCount) / total;
    return Math.max(-1, Math.min(1, raw));
  }

  /**
   * Match headlines to a market question by keyword overlap.
   * Returns scored results sorted by relevance (descending).
   * Only returns items with relevanceScore > 0.
   */
  findRelevantNews(marketQuestion: string, headlines: NewsItem[]): ScoredNews[] {
    const keywords = extractKeywords(marketQuestion);
    if (keywords.length === 0) return [];

    const scored: ScoredNews[] = [];

    for (const item of headlines) {
      const titleWords = tokenize(item.title);
      const snippetWords = tokenize(item.snippet);
      const allWords = new Set([...titleWords, ...snippetWords]);

      let overlapCount = 0;
      for (const kw of keywords) {
        if (allWords.has(kw)) overlapCount++;
      }

      const relevanceScore = overlapCount / keywords.length;

      if (relevanceScore > 0) {
        const sentimentScore = this.scoreSentiment(
          `${item.title} ${item.snippet}`,
        );

        scored.push({ item, relevanceScore, sentimentScore });
      }
    }

    // Sort by relevance descending
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scored;
  }

  /**
   * Clear the internal headline cache.
   */
  clearCache(): void {
    this.cache.clear();
  }
}
