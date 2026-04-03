/**
 * @module rss-adapter
 * @description RSS/Atom feed source adapter for HYDRA.
 * Parses RSS and Atom feeds and returns normalized RawContent items.
 */

import Parser from 'rss-parser';
import { SourceAdapter } from './adapter-interface.js';
import { detectLanguage } from '../utils/language.js';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'HYDRA/0.1.0 (Content Intelligence System)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
  },
  maxRedirects: 3,
});


/**
 * Strip HTML tags from text.
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
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

export class RssAdapter extends SourceAdapter {
  constructor() {
    super('RSS/Atom Feed Adapter', 'rss');
  }

  /**
   * Fetch and parse an RSS/Atom feed.
   * @param {Object} sourceConfig - Source configuration
   * @param {string} sourceConfig.url - Feed URL
   * @param {string} sourceConfig.name - Feed name
   * @param {string[]} sourceConfig.domains - Associated domains
   * @param {number} [sourceConfig.authority] - Source authority score (1-5)
   * @returns {Promise<import('./adapter-interface.js').RawContent[]>}
   */
  async fetch(sourceConfig) {
    const { url, name, domains, authority, max_items } = sourceConfig;

    try {
      const feed = await parser.parseURL(url);
      let items = feed.items || [];

      // Respect per-source max_items limit (critical for high-volume feeds like ArXiv)
      if (max_items && max_items > 0) {
        items = items.slice(0, max_items);
      }

      return items.map((item) => {
        const contentRaw = stripHtml(item['content:encoded'] || item.content || item.contentSnippet || item.summary || '');
        const title = item.title || 'Untitled';

        return this.createRawContent({
          sourceId: item.guid || item.link || item.id || `${url}#${title}`,
          title,
          contentRaw,
          author: item.creator || item.author || item['dc:creator'] || feed.title || name,
          publishedAt: item.pubDate || item.isoDate || new Date(),
          url: item.link || item.id || url,
          language: detectLanguage(contentRaw || title),
          metadata: {
            feedName: name,
            feedUrl: url,
            domains,
            authority: authority || 3,
            categories: item.categories || [],
            feedTitle: feed.title || name,
          },
        });
      });
    } catch (error) {
      console.error(`[RSS] Failed to fetch feed "${name}" (${url}): ${error.message}`);
      return [];
    }
  }
}
