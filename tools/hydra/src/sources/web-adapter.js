/**
 * @module web-adapter
 * @description Web scraping source adapter for HYDRA.
 * Fetches web pages and extracts content. Uses native fetch + HTML parsing.
 * Falls back to Crawl4AI (Python) for JS-rendered pages when available.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { SourceAdapter } from './adapter-interface.js';
import { detectLanguage } from '../utils/language.js';

const execFileAsync = promisify(execFile);

const REQUEST_TIMEOUT = 15000;
const MAX_CONTENT_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Strip HTML to plain text with structure preservation.
 * @param {string} html - Raw HTML
 * @returns {string} Clean text
 */
function htmlToText(html) {
  if (!html) return '';

  return html
    // Remove scripts and styles entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    // Convert structural elements to newlines
    .replace(/<\/?(h[1-6]|p|div|br|li|tr|blockquote|article|section)[^>]*>/gi, '\n')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    // Normalize whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

/**
 * Extract title from HTML.
 * @param {string} html
 * @returns {string}
 */
function extractTitle(html) {
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  if (ogTitle) return ogTitle[1];

  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleTag) return titleTag[1].trim();

  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1[1].trim();

  return 'Untitled';
}

/**
 * Extract author from HTML meta tags.
 * @param {string} html
 * @returns {string}
 */
function extractAuthor(html) {
  const patterns = [
    /<meta\s+name="author"\s+content="([^"]+)"/i,
    /<meta\s+property="article:author"\s+content="([^"]+)"/i,
    /<meta\s+name="twitter:creator"\s+content="([^"]+)"/i,
    /<a[^>]+rel="author"[^>]*>([^<]+)</i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  return 'Unknown';
}

/**
 * Extract publish date from HTML meta tags.
 * @param {string} html
 * @returns {Date}
 */
function extractDate(html) {
  const patterns = [
    /<meta\s+property="article:published_time"\s+content="([^"]+)"/i,
    /<meta\s+name="date"\s+content="([^"]+)"/i,
    /<time[^>]+datetime="([^"]+)"/i,
    /<meta\s+property="og:updated_time"\s+content="([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return new Date();
}

/**
 * Extract main content from HTML (tries article, main, body).
 * @param {string} html
 * @returns {string}
 */
function extractMainContent(html) {
  // Try <article> first
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (article) return htmlToText(article[1]);

  // Try <main>
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return htmlToText(main[1]);

  // Try role="main"
  const roleMain = html.match(/<[^>]+role="main"[^>]*>([\s\S]*?)<\/\w+>/i);
  if (roleMain) return htmlToText(roleMain[1]);

  // Fallback: full body
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (body) return htmlToText(body[1]);

  return htmlToText(html);
}

/**
 * Check if Crawl4AI is available.
 * @returns {Promise<boolean>}
 */
async function hasCrawl4AI() {
  try {
    await execFileAsync('python', ['-c', 'import crawl4ai'], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch page using Crawl4AI (handles JS-rendered content).
 * @param {string} url
 * @returns {Promise<string|null>} Extracted markdown/text
 */
async function fetchWithCrawl4AI(url) {
  try {
    // Security: pass URL as sys.argv[1] instead of string interpolation
    // to prevent Python code injection via crafted URLs
    const script = `
import sys, asyncio
from crawl4ai import AsyncWebCrawler
async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=sys.argv[1])
        print(result.markdown or result.cleaned_html or "")
asyncio.run(main())
`;
    const { stdout } = await execFileAsync('python', ['-c', script, url], {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout.trim() || null;
  } catch (error) {
    console.warn(`[Web] Crawl4AI failed for "${url}": ${error.message}`);
    return null;
  }
}

export class WebAdapter extends SourceAdapter {
  constructor() {
    super('Web Scraping Adapter', 'web');
  }

  /**
   * Fetch and extract content from web pages.
   *
   * @param {Object} sourceConfig - Source configuration
   * @param {string} sourceConfig.url - Page URL (or base URL for sitemap)
   * @param {string[]} [sourceConfig.urls] - Multiple URLs to scrape
   * @param {string} sourceConfig.name - Source name
   * @param {string[]} sourceConfig.domains - Associated domains
   * @param {number} [sourceConfig.authority] - Source authority (1-5)
   * @param {boolean} [sourceConfig.js_render] - Force Crawl4AI for JS-rendered pages
   * @returns {Promise<import('./adapter-interface.js').RawContent[]>}
   */
  async fetch(sourceConfig) {
    const { url, urls, name, domains, authority, js_render } = sourceConfig;
    const targetUrls = urls || [url];
    const results = [];
    const useCrawl4AI = js_render && (await hasCrawl4AI());

    for (const pageUrl of targetUrls) {
      try {
        let content;
        let html;

        if (useCrawl4AI) {
          content = await fetchWithCrawl4AI(pageUrl);
        }

        if (!content) {
          // Native fetch
          const response = await fetch(pageUrl, {
            headers: {
              'User-Agent': 'HYDRA/0.1.0 (Content Intelligence System)',
              Accept: 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT),
          });

          if (!response.ok) {
            console.warn(`[Web] HTTP ${response.status} for "${pageUrl}"`);
            continue;
          }

          const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
          if (contentLength > MAX_CONTENT_SIZE) {
            console.warn(`[Web] Content too large for "${pageUrl}" (${contentLength} bytes)`);
            continue;
          }

          html = await response.text();
          content = extractMainContent(html);
        }

        if (!content || content.length < 50) {
          console.warn(`[Web] No meaningful content extracted from "${pageUrl}"`);
          continue;
        }

        const title = html ? extractTitle(html) : content.split('\n')[0].slice(0, 100);
        const author = html ? extractAuthor(html) : 'Unknown';
        const publishedAt = html ? extractDate(html) : new Date();

        results.push(
          this.createRawContent({
            sourceId: pageUrl,
            title,
            contentRaw: content,
            author,
            publishedAt,
            url: pageUrl,
            language: detectLanguage(content),
            metadata: {
              sourceName: name,
              domains,
              authority: authority || 3,
              extractionMethod: useCrawl4AI ? 'crawl4ai' : 'native',
            },
          })
        );
      } catch (error) {
        console.error(`[Web] Failed to scrape "${pageUrl}": ${error.message}`);
      }
    }

    return results;
  }
}
