/**
 * @module input-sanitizer
 * @description Story 6.1 -- Input sanitization for HYDRA pipeline.
 * Three layers: HTML deep clean, prompt injection detection, encoding normalization.
 * Runs BEFORE the normalizer (Phase 1.5 in pipeline).
 */

/**
 * HTML entity map for recursive decoding.
 */
const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&copy;': '\u00A9',
  '&reg;': '\u00AE',
  '&trade;': '\u2122',
};

/**
 * Prompt injection patterns -- known techniques to hijack LLM instructions.
 * @type {RegExp[]}
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above\s+instructions/i,
  /disregard\s+(all\s+)?previous/i,
  /you\s+are\s+now\s+a/i,
  /new\s+instructions?\s*:/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  /\bENDOFPROMPT\b/i,
  /\bBEGINNEWPROMPT\b/i,
  /do\s+not\s+follow\s+(the\s+)?(previous|above|original)/i,
  /forget\s+(all\s+)?(your|the)\s+(previous|prior)/i,
  /act\s+as\s+(if\s+)?(you\s+are|you're)\s+a/i,
  /override\s+(all\s+)?safety/i,
  /\bDAN\s+mode\b/i,
  /jailbreak/i,
];

/**
 * Dangerous HTML tags to remove entirely (including content).
 */
const DANGEROUS_TAGS = [
  'script', 'style', 'noscript', 'iframe', 'object', 'embed', 'applet',
  'form', 'input', 'textarea', 'button', 'select',
];

/**
 * Decode HTML entities recursively (handles double/triple encoding).
 * @param {string} text
 * @param {number} [maxPasses=5]
 * @returns {string}
 */
export function decodeEntities(text, maxPasses = 5) {
  if (!text) return '';

  let result = text;
  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;

    // Named entities
    for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
      if (result.includes(entity)) {
        result = result.replaceAll(entity, char);
        changed = true;
      }
    }

    // Decimal numeric entities: &#60; -> <
    result = result.replace(/&#(\d{1,6});/g, (match, code) => {
      changed = true;
      const num = parseInt(code, 10);
      if (num > 0 && num < 0x110000) return String.fromCodePoint(num);
      return match;
    });

    // Hex numeric entities: &#x3C; -> <
    result = result.replace(/&#x([0-9a-fA-F]{1,6});/g, (match, hex) => {
      changed = true;
      const num = parseInt(hex, 16);
      if (num > 0 && num < 0x110000) return String.fromCodePoint(num);
      return match;
    });

    if (!changed) break;
  }

  return result;
}

/**
 * Deep HTML sanitization -- removes dangerous content before tag stripping.
 * @param {string} html - Raw HTML content
 * @returns {string} Sanitized content
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  let clean = html;

  // 1. Decode HTML entities recursively (catches double-encoding attacks)
  clean = decodeEntities(clean);

  // 2. Remove dangerous tags entirely (with content)
  for (const tag of DANGEROUS_TAGS) {
    const regex = new RegExp(
      `<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`,
      'gi'
    );
    clean = clean.replace(regex, '');
    // Also remove self-closing
    clean = clean.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '');
  }

  // 3. Remove all event handlers (onerror, onload, onclick, etc.)
  clean = clean.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '');

  // 4. Remove data: URIs (can contain executable content)
  clean = clean.replace(/(?:href|src|action)\s*=\s*["']data:[^"']*["']/gi, '');

  // 5. Remove javascript: URIs
  clean = clean.replace(/(?:href|src|action)\s*=\s*["']\s*javascript:[^"']*["']/gi, '');

  // 6. Remove vbscript: URIs
  clean = clean.replace(/(?:href|src|action)\s*=\s*["']\s*vbscript:[^"']*["']/gi, '');

  return clean;
}

/**
 * Detect prompt injection patterns in text.
 * @param {string} text - Content text to scan
 * @returns {{ detected: boolean, patterns: string[] }}
 */
export function detectPromptInjection(text) {
  if (!text || typeof text !== 'string') return { detected: false, patterns: [] };

  const matched = [];
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      matched.push(pattern.source);
    }
  }

  return {
    detected: matched.length > 0,
    patterns: matched,
  };
}

/**
 * Normalize content encoding -- clean control characters, null bytes, BOM.
 * @param {string} text - Input text
 * @returns {string} Normalized text
 */
export function normalizeEncoding(text) {
  if (!text || typeof text !== 'string') return '';

  let result = text;

  // Remove UTF-8 BOM
  if (result.charCodeAt(0) === 0xFEFF) {
    result = result.slice(1);
  }

  // Remove null bytes
  result = result.replace(/\x00/g, '');

  // Remove control characters (except \n, \r, \t)
  // eslint-disable-next-line no-control-regex
  result = result.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize Unicode to NFC (composed form)
  if (typeof result.normalize === 'function') {
    result = result.normalize('NFC');
  }

  return result;
}

/**
 * Sanitize a URL -- validate protocol, block dangerous schemes.
 * @param {string} url - URL to sanitize
 * @returns {{ safe: boolean, url: string, reason?: string }}
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return { safe: false, url: '', reason: 'empty_url' };
  }

  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
  const lower = trimmed.toLowerCase();
  for (const proto of dangerousProtocols) {
    if (lower.startsWith(proto)) {
      return { safe: false, url: trimmed, reason: `blocked_protocol:${proto}` };
    }
  }

  // Only allow http and https
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return { safe: false, url: trimmed, reason: 'invalid_protocol' };
  }

  // URL length check
  if (trimmed.length > 2048) {
    return { safe: false, url: trimmed, reason: 'url_too_long' };
  }

  return { safe: true, url: trimmed };
}

/**
 * Full input sanitization pipeline for a content item.
 * @param {Object} item - Raw content item from adapter
 * @param {string} item.title - Content title
 * @param {string} item.url - Source URL
 * @param {string} item.contentRaw - Raw HTML/text content
 * @param {Object} [options] - Options
 * @returns {{ item: Object, blocked: boolean, reason?: string, injectionSuspect: boolean, sanitized: boolean }}
 */
export function sanitizeContent(item, options = {}) {
  if (!item) {
    return { item: null, blocked: true, reason: 'null_item', injectionSuspect: false, sanitized: false };
  }

  // 1. URL sanitization
  const urlResult = sanitizeUrl(item.url);
  if (!urlResult.safe) {
    return {
      item,
      blocked: true,
      reason: `unsafe_url:${urlResult.reason}`,
      injectionSuspect: false,
      sanitized: true,
    };
  }

  // 2. HTML deep sanitization on content
  const sanitizedContent = sanitizeHtml(item.contentRaw || '');

  // 3. Encoding normalization
  const normalizedContent = normalizeEncoding(sanitizedContent);
  const normalizedTitle = normalizeEncoding(item.title || '');

  // 4. Prompt injection detection (scan both title and content)
  const contentInjection = detectPromptInjection(normalizedContent);
  const titleInjection = detectPromptInjection(normalizedTitle);
  const injectionSuspect = contentInjection.detected || titleInjection.detected;

  // Build sanitized item
  const sanitizedItem = {
    ...item,
    title: normalizedTitle,
    contentRaw: normalizedContent,
    url: urlResult.url,
  };

  // Add injection metadata if detected
  if (injectionSuspect) {
    sanitizedItem.metadata = {
      ...(item.metadata || {}),
      injectionSuspect: true,
      injectionPatterns: [
        ...contentInjection.patterns,
        ...titleInjection.patterns,
      ],
    };
  }

  return {
    item: sanitizedItem,
    blocked: false,
    injectionSuspect,
    sanitized: true,
  };
}
