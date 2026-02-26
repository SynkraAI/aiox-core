// =============================================================================
// content-filter.js — Content-type filter for MCP tool responses
// =============================================================================
// Extracts main content from HTML/text, strips noise (nav, ads, boilerplate),
// and truncates to max_tokens at a natural boundary.
//
// Usage (stdin):
//   echo '{"content":"<html>...</html>"}' | node content-filter.js --max-tokens 2000
//
// Usage (file):
//   node content-filter.js --input response.json --max-tokens 2000
//
// Usage (programmatic):
//   const { filterContent } = require('./content-filter');
//   const result = filterContent(inputData, { max_tokens: 2000, extract: ['title'] });
// =============================================================================

'use strict';

const fs = require('fs');
const { CHARS_PER_TOKEN } = require('./constants');

/**
 * Strip HTML tags and extract text content.
 * Removes script, style, nav, footer, header, aside elements first.
 * @param {string} html - Raw HTML string
 * @returns {string} Clean text content
 */
function stripHtml(html) {
  if (typeof html !== 'string') return String(html || '');

  // Remove noise elements entirely (content + tags)
  const noisePatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /<style[\s\S]*?<\/style>/gi,
    /<nav[\s\S]*?<\/nav>/gi,
    /<footer[\s\S]*?<\/footer>/gi,
    /<header[\s\S]*?<\/header>/gi,
    /<aside[\s\S]*?<\/aside>/gi,
    /<noscript[\s\S]*?<\/noscript>/gi,
    /<!--[\s\S]*?-->/g,
  ];

  let clean = html;
  for (const pattern of noisePatterns) {
    clean = clean.replace(pattern, '');
  }

  // Replace block elements with newlines
  clean = clean.replace(/<\/?(div|p|br|h[1-6]|li|tr|td|th|blockquote|pre|section|article)[^>]*>/gi, '\n');

  // Remove remaining HTML tags
  clean = clean.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  clean = clean
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Normalize whitespace: collapse multiple blank lines
  clean = clean.replace(/\n{3,}/g, '\n\n').trim();

  return clean;
}

/**
 * Truncate text to approximately max_tokens at a natural boundary.
 * @param {string} text - Text to truncate
 * @param {number} maxTokens - Approximate token limit
 * @returns {string} Truncated text
 */
function truncateAtBoundary(text, maxTokens) {
  const maxChars = maxTokens * CHARS_PER_TOKEN;

  if (text.length <= maxChars) return text;

  // Find last paragraph break before limit
  const slice = text.slice(0, maxChars);
  const lastParagraph = slice.lastIndexOf('\n\n');
  if (lastParagraph > maxChars * 0.5) {
    return slice.slice(0, lastParagraph).trim() + '\n\n[...truncated]';
  }

  // Fall back to last sentence
  const lastSentence = slice.lastIndexOf('. ');
  if (lastSentence > maxChars * 0.5) {
    return slice.slice(0, lastSentence + 1).trim() + '\n\n[...truncated]';
  }

  // Hard truncate
  return slice.trim() + '\n\n[...truncated]';
}

/**
 * Extract specified fields from an object.
 * @param {Object} data - Source object
 * @param {string[]} fields - Fields to extract
 * @returns {Object} Object with only extracted fields
 */
function extractFields(data, fields) {
  if (!data || typeof data !== 'object' || !Array.isArray(fields)) return data;

  const result = {};
  for (const field of fields) {
    if (field in data) {
      result[field] = data[field];
    }
  }
  return result;
}

/**
 * Apply content filter to input data.
 * @param {string|Object} input - Raw input (string or parsed JSON)
 * @param {Object} options - Filter options
 * @param {number} [options.max_tokens=3000] - Token limit
 * @param {string[]} [options.extract] - Fields to extract before content filtering
 * @returns {{ filtered: string, original_length: number, filtered_length: number, reduction_pct: number }}
 */
function filterContent(input, options = {}) {
  const maxTokens = options.max_tokens || 3000;
  const extractList = options.extract || null;

  let raw = input;

  // If input is an object, extract fields first or stringify
  if (typeof raw === 'object' && raw !== null) {
    if (extractList) {
      if (Array.isArray(raw)) {
        raw = raw.map((item) => extractFields(item, extractList));
        raw = JSON.stringify(raw, null, 2);
      } else {
        raw = extractFields(raw, extractList);
        raw = JSON.stringify(raw, null, 2);
      }
    } else {
      raw = raw.content || raw.text || raw.body || JSON.stringify(raw, null, 2);
    }
  }

  if (typeof raw !== 'string') raw = String(raw || '');

  const originalLength = raw.length;

  // Strip HTML if it looks like HTML
  let content = raw;
  if (content.includes('<') && content.includes('>')) {
    content = stripHtml(content);
  }

  // Truncate to token limit
  content = truncateAtBoundary(content, maxTokens);

  const filteredLength = content.length;
  const reductionPct = originalLength > 0
    ? Math.round((1 - filteredLength / originalLength) * 100)
    : 0;

  return {
    filtered: content,
    original_length: originalLength,
    filtered_length: filteredLength,
    reduction_pct: reductionPct,
  };
}

// ---------------------------------------------------------------------------
// CLI entrypoint
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--max-tokens' && argv[i + 1]) {
      args.max_tokens = parseInt(argv[i + 1], 10);
      i++;
    } else if (argv[i] === '--input' && argv[i + 1]) {
      args.input = argv[i + 1];
      i++;
    } else if (argv[i] === '--extract' && argv[i + 1]) {
      args.extract = argv[i + 1].split(',');
      i++;
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);

  let inputData;
  if (args.input) {
    inputData = fs.readFileSync(args.input, 'utf8');
  } else if (!process.stdin.isTTY) {
    inputData = fs.readFileSync(0, 'utf8');
  } else {
    console.error('Usage: echo \'data\' | node content-filter.js --max-tokens 2000');
    process.exit(1);
  }

  try {
    inputData = JSON.parse(inputData);
  } catch (_) {
    // treat as raw text
  }

  const result = filterContent(inputData, {
    max_tokens: args.max_tokens,
    extract: args.extract,
  });

  console.log(JSON.stringify(result, null, 2));
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}

module.exports = { filterContent, stripHtml, truncateAtBoundary, extractFields, CHARS_PER_TOKEN };
