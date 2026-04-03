/**
 * @module output-filter
 * @description Story 6.3 -- Output filtering for HYDRA pipeline.
 * PII scan and redaction, copyright notice detection.
 * Runs AFTER LLM extraction, BEFORE writing to KB.
 */

/**
 * PII detection patterns.
 */
const PII_PATTERNS = {
  email: /\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b/gi,
  phone_br: /\(\d{2}\)\s*\d{4,5}-?\d{4}/g,
  phone_intl: /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d[\d\s.-]{5,12}\d/g,
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  cnpj: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
  credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  ssn_us: /\b\d{3}-\d{2}-\d{4}\b/g,
};

/**
 * IP address pattern -- context-dependent PII.
 */
const IP_PATTERN = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

/**
 * Technical domains where IP addresses are NOT treated as PII.
 */
const TECHNICAL_DOMAINS = ['engenharia', 'ai-ml', 'devops', 'infrastructure', 'cloud', 'networking', 'security'];

/**
 * Copyright detection patterns.
 */
const COPYRIGHT_PATTERNS = [
  /\u00A9/,                              // copyright symbol
  /\(c\)/i,                              // (c)
  /copyright\s+\d{4}/i,                  // copyright 2024
  /all\s+rights\s+reserved/i,            // all rights reserved
  /\bproprietary\b/i,                    // proprietary
  /\bconfidential\b/i,                   // confidential
];

const REDACTED = '[PII REDACTED]';

/**
 * Scan text for PII and return matches.
 * @param {string} text - Text to scan
 * @param {string[]} [domains=[]] - Content domains for context-aware detection
 * @returns {{ found: boolean, count: number, types: string[] }}
 */
export function scanPII(text, domains = []) {
  if (!text || typeof text !== 'string') return { found: false, count: 0, types: [] };

  const types = [];
  let count = 0;

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const cloned = new RegExp(pattern.source, pattern.flags);
    const matches = text.match(cloned);
    if (matches && matches.length > 0) {
      types.push(type);
      count += matches.length;
    }
  }

  // Context-aware IP address detection
  const isTechnical = domains.some(d => TECHNICAL_DOMAINS.includes(d));
  if (!isTechnical) {
    const ipMatches = text.match(IP_PATTERN);
    if (ipMatches && ipMatches.length > 0) {
      // Filter out common non-PII IPs (localhost, broadcast)
      const realIps = ipMatches.filter(ip => {
        return ip !== '0.0.0.0' && ip !== '127.0.0.1' && ip !== '255.255.255.255';
      });
      if (realIps.length > 0) {
        types.push('ip_address');
        count += realIps.length;
      }
    }
  }

  return { found: count > 0, count, types };
}

/**
 * Redact PII from text.
 * @param {string} text - Text with potential PII
 * @param {string[]} [domains=[]] - Content domains
 * @returns {{ text: string, redactedCount: number }}
 */
export function redactPII(text, domains = []) {
  if (!text || typeof text !== 'string') return { text: '', redactedCount: 0 };

  let result = text;
  let redactedCount = 0;

  for (const pattern of Object.values(PII_PATTERNS)) {
    const cloned = new RegExp(pattern.source, pattern.flags);
    const before = result;
    result = result.replace(cloned, () => {
      redactedCount++;
      return REDACTED;
    });
    // Reset if no changes to avoid count issues
    if (before === result) redactedCount -= 0; // no-op but keeps logic clear
  }

  // IP addresses in non-technical domains
  const isTechnical = domains.some(d => TECHNICAL_DOMAINS.includes(d));
  if (!isTechnical) {
    result = result.replace(IP_PATTERN, (match) => {
      if (match === '0.0.0.0' || match === '127.0.0.1' || match === '255.255.255.255') {
        return match;
      }
      redactedCount++;
      return REDACTED;
    });
  }

  return { text: result, redactedCount };
}

/**
 * Detect copyright notices in text.
 * @param {string} text - Text to scan
 * @returns {{ detected: boolean, patterns: string[] }}
 */
export function detectCopyright(text) {
  if (!text || typeof text !== 'string') return { detected: false, patterns: [] };

  const matched = [];
  for (const pattern of COPYRIGHT_PATTERNS) {
    if (pattern.test(text)) {
      matched.push(pattern.source);
    }
  }

  return { detected: matched.length > 0, patterns: matched };
}

/**
 * Filter output data before writing to KB.
 * Redacts PII from insights and summaries, detects copyright.
 * @param {Object} extractedData - LLM extraction result
 * @param {string[]} [domains=[]] - Content domains
 * @returns {{ data: Object, piiDetected: boolean, piiCount: number, copyrightNotice: boolean }}
 */
export function filterOutput(extractedData, domains = []) {
  if (!extractedData) {
    return { data: extractedData, piiDetected: false, piiCount: 0, copyrightNotice: false };
  }

  let totalPiiCount = 0;
  const filtered = { ...extractedData };

  // Redact PII from insights
  if (Array.isArray(filtered.insights)) {
    filtered.insights = filtered.insights.map(insight => {
      const text = typeof insight === 'string' ? insight : (insight.insight || '');
      const { text: redacted, redactedCount } = redactPII(text, domains);
      totalPiiCount += redactedCount;
      if (typeof insight === 'string') return redacted;
      return { ...insight, insight: redacted };
    });
  }

  // Redact PII from summary
  if (Array.isArray(filtered.summary)) {
    filtered.summary = filtered.summary.map(line => {
      const { text: redacted, redactedCount } = redactPII(line, domains);
      totalPiiCount += redactedCount;
      return redacted;
    });
  }

  // Remove quotes that contain PII entirely (can't partially redact quotes)
  if (Array.isArray(filtered.quotes)) {
    filtered.quotes = filtered.quotes.filter(quote => {
      const scan = scanPII(quote, domains);
      if (scan.found) {
        totalPiiCount += scan.count;
        return false; // Remove the quote
      }
      return true;
    });
  }

  // Check all text for copyright notices
  const allText = [
    ...(filtered.insights || []).map(i => typeof i === 'string' ? i : (i.insight || '')),
    ...(filtered.summary || []),
    ...(filtered.quotes || []),
  ].join(' ');

  const copyrightResult = detectCopyright(allText);

  return {
    data: filtered,
    piiDetected: totalPiiCount > 0,
    piiCount: totalPiiCount,
    copyrightNotice: copyrightResult.detected,
  };
}
