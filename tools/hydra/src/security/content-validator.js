/**
 * @module content-validator
 * @description Story 6.2 -- Content validation for HYDRA pipeline.
 * URL blocklist, size limits, encoding validation.
 * Runs AFTER sanitization, BEFORE normalizer.
 */

/**
 * Default size limits.
 */
const SIZE_LIMITS = {
  maxContentBytes: 5 * 1024 * 1024,  // 5MB
  maxTitleLength: 500,
  minContentLength: 50,
  maxUrlLength: 2048,
};

/**
 * URL shortener domains blocked by default.
 */
const SHORTENER_DOMAINS = [
  'bit.ly',
  't.co',
  'tinyurl.com',
  'is.gd',
  'goo.gl',
  'ow.ly',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
  'short.io',
];

/**
 * Blocked URL patterns.
 */
const BLOCKED_URL_PATTERNS = [
  /\.onion$/i,
  /\.local$/i,
  /^file:\/\//i,
  /^ftp:\/\//i,
  /^data:/i,
];

/**
 * Source types that are allowed to use URL shorteners.
 */
const SHORTENER_ALLOWED_SOURCES = ['twitter'];

/**
 * Extract hostname from URL (without external deps).
 * @param {string} url
 * @returns {string|null}
 */
function extractHostname(url) {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Check if URL is on the blocklist.
 * @param {string} url - URL to check
 * @param {string} [sourceType] - Source type for shortener exceptions
 * @param {Object} [blocklist] - Custom blocklist config
 * @returns {{ blocked: boolean, reason?: string }}
 */
export function checkUrlBlocklist(url, sourceType, blocklist = {}) {
  if (!url) return { blocked: true, reason: 'empty_url' };

  const hostname = extractHostname(url);
  if (!hostname) return { blocked: true, reason: 'invalid_url' };

  // Check shortener domains (with source-type override)
  const allowShorteners = SHORTENER_ALLOWED_SOURCES.includes(sourceType) ||
    (blocklist.allow_shorteners_from || []).includes(sourceType);

  if (!allowShorteners) {
    const customDomains = blocklist.domains || [];
    const allShorteners = [...SHORTENER_DOMAINS, ...customDomains];

    for (const domain of allShorteners) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return { blocked: true, reason: `shortener:${domain}` };
      }
    }
  }

  // Check blocked patterns
  const customPatterns = (blocklist.patterns || []).map(p => new RegExp(p, 'i'));
  const allPatterns = [...BLOCKED_URL_PATTERNS, ...customPatterns];

  for (const pattern of allPatterns) {
    if (pattern.test(url) || pattern.test(hostname)) {
      return { blocked: true, reason: `pattern:${pattern.source}` };
    }
  }

  return { blocked: false };
}

/**
 * Check content against size limits.
 * @param {Object} item - Content item
 * @param {Object} [limits] - Custom size limits
 * @returns {{ valid: boolean, reason?: string }}
 */
export function checkSizeLimits(item, limits = {}) {
  const config = { ...SIZE_LIMITS, ...limits };

  // Title length
  if (item.title && item.title.length > config.maxTitleLength) {
    return { valid: false, reason: `title_too_long:${item.title.length}>${config.maxTitleLength}` };
  }

  // URL length
  if (item.url && item.url.length > config.maxUrlLength) {
    return { valid: false, reason: `url_too_long:${item.url.length}>${config.maxUrlLength}` };
  }

  // Content size (byte length for proper Unicode handling)
  const contentBytes = Buffer.byteLength(item.contentRaw || '', 'utf-8');
  if (contentBytes > config.maxContentBytes) {
    return { valid: false, reason: `content_too_large:${contentBytes}>${config.maxContentBytes}` };
  }

  // Minimum content length
  const contentLength = (item.contentRaw || '').length;
  if (contentLength < config.minContentLength) {
    return { valid: false, reason: `content_too_short:${contentLength}<${config.minContentLength}` };
  }

  return { valid: true };
}

/**
 * Check if content has valid encoding (not binary garbage).
 * @param {string} content - Content string
 * @returns {{ valid: boolean, reason?: string }}
 */
export function checkEncoding(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, reason: 'empty_content' };
  }

  // Check for excessive non-printable characters (sign of binary data)
  let nonPrintable = 0;
  for (let i = 0; i < Math.min(content.length, 10000); i++) {
    const code = content.charCodeAt(i);
    if (code < 32 && code !== 10 && code !== 13 && code !== 9) {
      nonPrintable++;
    }
  }

  const sampleSize = Math.min(content.length, 10000);
  const ratio = sampleSize > 0 ? nonPrintable / sampleSize : 0;

  if (ratio > 0.10) {
    return { valid: false, reason: `binary_content:${(ratio * 100).toFixed(1)}%_non_printable` };
  }

  return { valid: true };
}

/**
 * Full content validation pipeline.
 * @param {Object} item - Content item (after sanitization)
 * @param {Object} [options] - Validation options
 * @param {string} [options.sourceType] - Source type for shortener exceptions
 * @param {Object} [options.blocklist] - URL blocklist config
 * @param {Object} [options.sizeLimits] - Size limit overrides
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateContent(item, options = {}) {
  if (!item) return { valid: false, reason: 'null_item' };

  // 1. URL blocklist check
  const urlCheck = checkUrlBlocklist(item.url, options.sourceType, options.blocklist);
  if (urlCheck.blocked) {
    return { valid: false, reason: `blocked_url:${urlCheck.reason}` };
  }

  // 2. Size limits check
  const sizeCheck = checkSizeLimits(item, options.sizeLimits);
  if (!sizeCheck.valid) {
    return { valid: false, reason: sizeCheck.reason };
  }

  // 3. Encoding validation
  const encodingCheck = checkEncoding(item.contentRaw);
  if (!encodingCheck.valid) {
    return { valid: false, reason: encodingCheck.reason };
  }

  return { valid: true };
}
