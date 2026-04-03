/**
 * @module normalizer
 * @description Text normalization for HYDRA pipeline.
 * Cleans HTML, removes boilerplate, normalizes encoding and whitespace.
 */

/**
 * Common boilerplate patterns to remove from content.
 */
const BOILERPLATE_PATTERNS = [
  /subscribe to (?:our|the|my) (?:newsletter|blog|channel|podcast)/gi,
  /sign up for (?:our|the|my) (?:newsletter|blog|free)/gi,
  /follow (?:us|me) on (?:twitter|x|linkedin|facebook|instagram)/gi,
  /share this (?:article|post|story)/gi,
  /related (?:articles|posts|stories|reading)/gi,
  /advertisement/gi,
  /sponsored content/gi,
  /click here to/gi,
  /read more at/gi,
  /this (?:article|post) was (?:originally )?published (?:on|at|in)/gi,
  /©\s*\d{4}.*?(?:all rights reserved|rights reserved)/gi,
  /\[(?:ad|advertisement|sponsored)\]/gi,
  /tags?:\s*(?:[a-z0-9, ]+)/gi,
  /filed under:\s*(?:[a-z0-9, ]+)/gi,
];

/**
 * Remove HTML tags from content, preserving meaningful text.
 * @param {string} html - Raw HTML content
 * @returns {string} Clean text
 */
export function stripHtml(html) {
  if (!html) return '';

  let text = html;

  // Remove scripts and styles entirely
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // Convert block-level elements to newlines
  text = text.replace(/<(?:p|div|br|h[1-6]|li|tr|blockquote|pre|hr)[^>]*>/gi, '\n');

  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

  return text;
}

/**
 * Remove boilerplate text patterns from content.
 * @param {string} text - Text content
 * @returns {string} Cleaned text
 */
export function removeBoilerplate(text) {
  let cleaned = text;
  for (const pattern of BOILERPLATE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned;
}

/**
 * Normalize whitespace: collapse multiple spaces/newlines, trim.
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export function normalizeWhitespace(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

/**
 * Number paragraphs for sourceParagraph reference in extraction.
 * @param {string} text - Normalized text
 * @returns {{ numbered: string, paragraphs: string[] }}
 */
export function numberParagraphs(text) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const numbered = paragraphs.map((p, i) => `[P${i + 1}] ${p}`).join('\n\n');

  return { numbered, paragraphs };
}

/**
 * Full normalization pipeline for a raw content item.
 * @param {import('../sources/adapter-interface.js').RawContent} rawContent - Raw content
 * @returns {{ normalizedText: string, numberedText: string, paragraphs: string[], wordCount: number }}
 */
export function normalize(rawContent) {
  let text = rawContent.contentRaw || '';

  // Step 1: Strip HTML
  text = stripHtml(text);

  // Step 2: Remove boilerplate
  text = removeBoilerplate(text);

  // Step 3: Normalize whitespace
  text = normalizeWhitespace(text);

  // Step 4: Number paragraphs
  const { numbered, paragraphs } = numberParagraphs(text);

  // Step 5: Count words
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  return {
    normalizedText: text,
    numberedText: numbered,
    paragraphs,
    wordCount,
  };
}
