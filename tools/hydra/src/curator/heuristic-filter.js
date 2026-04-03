/**
 * @module heuristic-filter
 * @description Pre-filter heuristics for HYDRA curator (Phase 1, $0 cost).
 * Eliminates low-quality content before LLM scoring to save tokens.
 */

/**
 * @typedef {Object} FilterResult
 * @property {boolean} passed - Whether content passed all filters
 * @property {string} reason - Reason for filtering (if not passed)
 * @property {string[]} warnings - Non-blocking warnings
 */

/**
 * Default filter thresholds.
 */
const DEFAULTS = {
  minWordCount: 100,
  maxAgeDays: 90,
  allowedLanguages: ['en', 'pt'],
  maxContentSizeBytes: 5 * 1024 * 1024, // 5MB
};

/**
 * Check if content has minimum word count.
 * @param {number} wordCount - Word count
 * @param {number} [minWords] - Minimum threshold
 * @returns {FilterResult}
 */
export function checkWordCount(wordCount, minWords = DEFAULTS.minWordCount) {
  if (wordCount < minWords) {
    return {
      passed: false,
      reason: `Content too short: ${wordCount} words (minimum: ${minWords})`,
      warnings: [],
    };
  }
  return { passed: true, reason: '', warnings: [] };
}

/**
 * Check if content is recent enough.
 * @param {Date} publishedAt - Publication date
 * @param {number} [maxDays] - Maximum age in days
 * @returns {FilterResult}
 */
export function checkRecency(publishedAt, maxDays = DEFAULTS.maxAgeDays) {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > maxDays) {
    return {
      passed: false,
      reason: `Content too old: ${Math.round(ageDays)} days (maximum: ${maxDays})`,
      warnings: [],
    };
  }

  const warnings = [];
  if (ageDays > maxDays * 0.8) {
    warnings.push(`Content is ${Math.round(ageDays)} days old (approaching ${maxDays}-day limit)`);
  }

  return { passed: true, reason: '', warnings };
}

/**
 * Check if content language is allowed.
 * @param {string} language - Detected language code
 * @param {string[]} [allowed] - Allowed language codes
 * @returns {FilterResult}
 */
export function checkLanguage(language, allowed = DEFAULTS.allowedLanguages) {
  const lang = (language || '').toLowerCase().slice(0, 2);
  if (!allowed.includes(lang)) {
    return {
      passed: false,
      reason: `Language "${lang}" not allowed (accepted: ${allowed.join(', ')})`,
      warnings: [],
    };
  }
  return { passed: true, reason: '', warnings: [] };
}

/**
 * Check content size to prevent DoS via huge content.
 * @param {string} content - Raw content string
 * @param {number} [maxBytes] - Maximum size in bytes
 * @returns {FilterResult}
 */
export function checkContentSize(content, maxBytes = DEFAULTS.maxContentSizeBytes) {
  const size = Buffer.byteLength(content || '', 'utf-8');
  if (size > maxBytes) {
    return {
      passed: false,
      reason: `Content too large: ${Math.round(size / 1024)}KB (maximum: ${Math.round(maxBytes / 1024)}KB)`,
      warnings: [],
    };
  }
  return { passed: true, reason: '', warnings: [] };
}

/**
 * Story 3.7 — Detect AI-generated low-quality content (AI slop).
 * Uses statistical signals: filler phrase ratio, lexical diversity, sentence length.
 * @param {string} text - Normalized text
 * @param {Object} [slopConfig] - AI slop detection config
 * @returns {FilterResult}
 */
export function checkAISlop(text, slopConfig = {}) {
  if (!slopConfig.enabled || !text || text.length < 200) {
    return { passed: true, reason: '', warnings: [] };
  }

  const warnings = [];
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  if (totalWords < 20) return { passed: true, reason: '', warnings: [] };

  // Filler phrase ratio
  const fillerPhrases = slopConfig.filler_phrases || [];
  let fillerCount = 0;
  for (const phrase of fillerPhrases) {
    const regex = new RegExp(phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lower.match(regex);
    if (matches) fillerCount += matches.length;
  }
  const fillerRatio = fillerCount / (totalWords / 10); // per 10 words of content
  const maxFiller = slopConfig.max_filler_ratio || 0.25;

  if (fillerRatio > maxFiller) {
    return {
      passed: false,
      reason: `AI slop detected: high filler phrase ratio (${fillerRatio.toFixed(2)} > ${maxFiller})`,
      warnings: [],
    };
  }
  if (fillerRatio > maxFiller * 0.7) {
    warnings.push(`Borderline AI slop: filler ratio ${fillerRatio.toFixed(2)}`);
  }

  // Lexical diversity: unique words / total words
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean));
  const diversity = uniqueWords.size / totalWords;
  const minDiversity = slopConfig.min_lexical_diversity || 0.35;

  if (diversity < minDiversity) {
    return {
      passed: false,
      reason: `AI slop detected: low lexical diversity (${diversity.toFixed(2)} < ${minDiversity})`,
      warnings: [],
    };
  }

  // Average sentence length
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  if (sentences.length > 0) {
    const avgSentenceLen = totalWords / sentences.length;
    const maxAvg = slopConfig.max_avg_sentence_length || 40;
    if (avgSentenceLen > maxAvg) {
      warnings.push(`Long average sentences: ${avgSentenceLen.toFixed(0)} words (max: ${maxAvg})`);
    }
  }

  return { passed: true, reason: '', warnings };
}

/**
 * Get source-type-specific thresholds.
 * @param {Object} thresholds - Base thresholds
 * @param {string} sourceType - Source type (rss, youtube, twitter, etc.)
 * @returns {Object} Merged thresholds
 */
function getSourceThresholds(thresholds, sourceType) {
  const overrides = thresholds.source_overrides?.[sourceType] || {};
  return {
    min_word_count: overrides.min_word_count || thresholds.min_word_count,
    max_age_days: overrides.max_age_days || thresholds.max_age_days,
    allowed_languages: thresholds.allowed_languages,
    max_content_size_bytes: thresholds.max_content_size_bytes,
  };
}

/**
 * Run all heuristic filters on a content item.
 * @param {Object} params - Filter parameters
 * @param {number} params.wordCount - Word count of normalized text
 * @param {Date} params.publishedAt - Publication date
 * @param {string} params.language - Detected language
 * @param {string} params.contentRaw - Raw content for size check
 * @param {string} [params.sourceType] - Source type for threshold overrides
 * @param {string} [params.normalizedText] - Normalized text for AI slop check
 * @param {Object} [thresholds] - Custom thresholds (from thresholds.yaml)
 * @returns {FilterResult}
 */
export function applyHeuristicFilters(params, thresholds = {}) {
  // Story 3.2 — Apply source-type-specific thresholds
  const effectiveThresholds = params.sourceType
    ? getSourceThresholds(thresholds, params.sourceType)
    : thresholds;

  const minWords = effectiveThresholds.min_word_count || DEFAULTS.minWordCount;
  const maxDays = effectiveThresholds.max_age_days || DEFAULTS.maxAgeDays;
  const langs = effectiveThresholds.allowed_languages || DEFAULTS.allowedLanguages;
  const maxSize = effectiveThresholds.max_content_size_bytes || DEFAULTS.maxContentSizeBytes;

  const allWarnings = [];

  // Check word count
  const wcResult = checkWordCount(params.wordCount, minWords);
  if (!wcResult.passed) return wcResult;
  allWarnings.push(...wcResult.warnings);

  // Check recency
  const recResult = checkRecency(params.publishedAt, maxDays);
  if (!recResult.passed) return recResult;
  allWarnings.push(...recResult.warnings);

  // Check language
  const langResult = checkLanguage(params.language, langs);
  if (!langResult.passed) return langResult;
  allWarnings.push(...langResult.warnings);

  // Check content size
  const sizeResult = checkContentSize(params.contentRaw, maxSize);
  if (!sizeResult.passed) return sizeResult;
  allWarnings.push(...sizeResult.warnings);

  // Story 3.7 — AI slop detection
  if (params.normalizedText && thresholds.ai_slop) {
    const slopResult = checkAISlop(params.normalizedText, thresholds.ai_slop);
    if (!slopResult.passed) return slopResult;
    allWarnings.push(...slopResult.warnings);
  }

  return { passed: true, reason: '', warnings: allWarnings };
}
