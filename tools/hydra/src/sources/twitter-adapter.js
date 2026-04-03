/**
 * @module twitter-adapter
 * @description Twitter/X source adapter for HYDRA.
 * Strategy: RSS via Nitter instances (free, no API key) with RSSHub and Twitter API v2 fallback.
 * Monitors specific accounts for tweets/threads.
 */

import Parser from 'rss-parser';
import { SourceAdapter } from './adapter-interface.js';
import { detectLanguage } from '../utils/language.js';

/**
 * Nitter instances to try for RSS feeds.
 * These are community-maintained mirrors — availability fluctuates.
 * Order matters: most reliable first.
 */
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://nitter.lunar.icu',
  'https://nitter.cz',
];

/**
 * RSSHub instances as fallback when all Nitter mirrors are down.
 * RSSHub generates RSS feeds from Twitter via scraping.
 */
const RSSHUB_INSTANCES = [
  'https://rsshub.app',
  'https://rsshub.rssforever.com',
  'https://rsshub-instance.zeabur.app',
];

const RSS_TIMEOUT = 12000;

const rssParser = new Parser({
  timeout: RSS_TIMEOUT,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
});

const MAX_TWEETS = 10;

/**
 * Strip HTML tags from text.
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract username from various Twitter URL formats.
 * @param {string} input - Twitter URL or @username
 * @returns {string} Clean username without @
 */
function extractUsername(input) {
  if (!input) return '';
  // Handle @username
  if (input.startsWith('@')) return input.slice(1);
  // Handle URLs
  const match = input.match(/(?:twitter\.com|x\.com)\/(@?(\w+))/i);
  if (match) return match[2];
  // Assume it's already a username
  return input.replace('@', '');
}

/**
 * Try fetching tweets from Nitter RSS (multiple instances with fallback).
 * @param {string} username - Twitter username
 * @returns {Promise<{items: Object[]|null, source: string}>}
 */
async function fetchViaNitter(username) {
  for (const instance of NITTER_INSTANCES) {
    try {
      const feedUrl = `${instance}/${username}/rss`;
      const feed = await rssParser.parseURL(feedUrl);
      if (feed.items && feed.items.length > 0) {
        const instanceName = new URL(instance).hostname;
        console.log(
          `[Twitter] Fetched ${feed.items.length} items for @${username} via ${instanceName}`
        );
        return { items: feed.items, source: `nitter:${instanceName}` };
      }
    } catch {
      // Try next instance silently
      continue;
    }
  }
  return { items: null, source: 'nitter' };
}

/**
 * Try fetching tweets via RSSHub instances (fallback for when Nitter is down).
 * RSSHub path: /twitter/user/{username}
 * @param {string} username - Twitter username
 * @returns {Promise<{items: Object[]|null, source: string}>}
 */
async function fetchViaRSSHub(username) {
  for (const instance of RSSHUB_INSTANCES) {
    try {
      const feedUrl = `${instance}/twitter/user/${username}`;
      const feed = await rssParser.parseURL(feedUrl);
      if (feed.items && feed.items.length > 0) {
        const instanceName = new URL(instance).hostname;
        console.log(
          `[Twitter] Fetched ${feed.items.length} items for @${username} via RSSHub (${instanceName})`
        );
        return { items: feed.items, source: `rsshub:${instanceName}` };
      }
    } catch {
      // Try next instance silently
      continue;
    }
  }
  return { items: null, source: 'rsshub' };
}

/**
 * Fetch tweets from Twitter API v2 (requires TWITTER_BEARER_TOKEN).
 * @param {string} username - Twitter username
 * @param {number} limit - Max tweets
 * @returns {Promise<{items: Object[]|null, source: string}>}
 */
async function fetchViaAPI(username, limit) {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) return { items: null, source: 'api' };

  try {
    // Get user ID first
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!userResponse.ok) return { items: null, source: 'api' };
    const userData = await userResponse.json();
    const userId = userData.data?.id;
    if (!userId) return { items: null, source: 'api' };

    // Get recent tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=${limit}&tweet.fields=created_at,public_metrics,text`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!tweetsResponse.ok) return { items: null, source: 'api' };
    const tweetsData = await tweetsResponse.json();

    const items = (tweetsData.data || []).map((tweet) => ({
      title: tweet.text.slice(0, 100),
      content: tweet.text,
      pubDate: tweet.created_at,
      link: `https://twitter.com/${username}/status/${tweet.id}`,
      metrics: tweet.public_metrics,
    }));

    if (items.length > 0) {
      console.log(
        `[Twitter] Fetched ${items.length} items for @${username} via Twitter API v2`
      );
    }

    return { items: items.length > 0 ? items : null, source: 'api' };
  } catch {
    return { items: null, source: 'api' };
  }
}

export class TwitterAdapter extends SourceAdapter {
  constructor() {
    super('Twitter/X Adapter', 'twitter');
  }

  /**
   * Fetch recent tweets from monitored accounts.
   * Strategy: Nitter RSS first (free) -> RSSHub fallback -> Twitter API v2 fallback.
   *
   * @param {Object} sourceConfig - Source configuration
   * @param {string} sourceConfig.username - Twitter username (with or without @)
   * @param {string} sourceConfig.name - Display name
   * @param {string[]} sourceConfig.domains - Associated domains
   * @param {number} [sourceConfig.authority] - Source authority (1-5)
   * @param {number} [sourceConfig.max_tweets] - Max tweets to fetch
   * @returns {Promise<import('./adapter-interface.js').RawContent[]>}
   */
  async fetch(sourceConfig) {
    const {
      username: rawUsername,
      name,
      domains,
      authority,
      max_tweets = MAX_TWEETS,
    } = sourceConfig;

    const username = extractUsername(rawUsername);
    if (!username) {
      console.error(`[Twitter] Invalid username for "${name}"`);
      return [];
    }

    // Strategy 1: Nitter RSS (6 instances)
    let { items, source } = await fetchViaNitter(username);

    // Strategy 2: RSSHub fallback (3 instances)
    if (!items || items.length === 0) {
      ({ items, source } = await fetchViaRSSHub(username));
    }

    // Strategy 3: Twitter API v2 (requires bearer token)
    if (!items || items.length === 0) {
      ({ items, source } = await fetchViaAPI(username, max_tweets));
    }

    if (!items || items.length === 0) {
      console.warn(
        `[Twitter] No tweets found for @${username} (tried ${NITTER_INSTANCES.length} Nitter + ${RSSHUB_INSTANCES.length} RSSHub + API)`
      );
      return [];
    }

    return items.slice(0, max_tweets).map((item) => {
      const content = stripHtml(
        item.content || item.contentSnippet || item.title || ''
      );
      const title = (item.title || content).slice(0, 100);

      return this.createRawContent({
        sourceId:
          item.link || item.guid || `twitter:${username}:${Date.now()}`,
        title: `@${username}: ${title}`,
        contentRaw: content,
        author: `@${username}`,
        publishedAt: item.pubDate || item.isoDate || new Date(),
        url: item.link || `https://twitter.com/${username}`,
        language: detectLanguage(content),
        metadata: {
          accountName: name,
          username,
          domains,
          authority: authority || 3,
          fetchMethod: source,
          metrics: item.metrics || {},
        },
      });
    });
  }
}
