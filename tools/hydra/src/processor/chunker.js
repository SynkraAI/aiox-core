/**
 * @module chunker
 * @description Splits long text into processable chunks with overlap.
 * Supports fixed-size and semantic (paragraph-aware) chunking strategies.
 * Follows Jarvis/Mega Brain chunking pattern: Document -> Sections -> Chunks -> Insights.
 */

/**
 * Default chunking options.
 */
const DEFAULTS = {
  maxTokens: 3000,
  overlap: 200,
  strategy: 'semantic',
  maxChunks: 50,
  minChunkTokens: 100,
};

/**
 * Rough token estimation: ~4 characters per token (conservative).
 * @param {string} text
 * @returns {number}
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Convert token count to approximate character count.
 * @param {number} tokens
 * @returns {number}
 */
function tokensToChars(tokens) {
  return tokens * 4;
}

/**
 * Check if text needs chunking based on token threshold.
 * @param {string} text
 * @param {number} [maxTokens=3000]
 * @returns {boolean}
 */
export function needsChunking(text, maxTokens = DEFAULTS.maxTokens) {
  return estimateTokens(text) > maxTokens;
}

/**
 * Split text into segments at natural boundaries.
 * Priority: double newline > single newline > sentence end.
 * @param {string} text
 * @returns {string[]}
 */
function splitAtBoundaries(text) {
  // First split on double newlines (paragraphs)
  const paragraphs = text.split(/\n\n+/);
  const segments = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    segments.push(trimmed);
  }

  return segments;
}

/**
 * Further split a segment that is too large into sentence-level pieces.
 * @param {string} segment
 * @param {number} maxChars
 * @returns {string[]}
 */
function splitLargeSegment(segment, maxChars) {
  if (segment.length <= maxChars) return [segment];

  // Try splitting on single newlines first
  const lines = segment.split(/\n/);
  if (lines.length > 1 && lines.every((l) => l.length <= maxChars)) {
    return lines.map((l) => l.trim()).filter(Boolean);
  }

  // Split on sentence boundaries
  const sentences = segment.match(/[^.!?]+[.!?]+\s*/g) || [segment];
  const pieces = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChars && current.length > 0) {
      pieces.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) pieces.push(current.trim());

  // If a single sentence is still too long, hard-split on word boundary
  const final = [];
  for (const piece of pieces) {
    if (piece.length <= maxChars) {
      final.push(piece);
    } else {
      const words = piece.split(/\s+/);
      let buf = '';
      for (const word of words) {
        if ((buf + ' ' + word).length > maxChars && buf.length > 0) {
          final.push(buf.trim());
          buf = word;
        } else {
          buf = buf ? buf + ' ' + word : word;
        }
      }
      if (buf.trim()) final.push(buf.trim());
    }
  }

  return final;
}

/**
 * Divide text into overlapping chunks using semantic boundaries.
 * Tries to break at paragraph/sentence boundaries instead of mid-sentence.
 *
 * @param {string} text - Full text (transcript or article)
 * @param {Object} [options={}]
 * @param {number} [options.maxTokens=3000] - Max tokens per chunk
 * @param {number} [options.overlap=200] - Overlap tokens between consecutive chunks
 * @param {'fixed'|'semantic'} [options.strategy='semantic'] - Chunking strategy
 * @param {number} [options.maxChunks=50] - Safety limit on number of chunks
 * @param {number} [options.minChunkTokens=100] - Minimum tokens for a valid chunk
 * @returns {Array<{index: number, text: string, startToken: number, endToken: number}>}
 */
export function chunkText(text, options = {}) {
  if (!text || typeof text !== 'string') return [];

  const opts = { ...DEFAULTS, ...options };
  const { maxTokens, overlap, strategy, maxChunks, minChunkTokens } = opts;

  const totalTokens = estimateTokens(text);

  // If text fits in one chunk, return as-is
  if (totalTokens <= maxTokens) {
    return [{
      index: 0,
      text: text.trim(),
      startToken: 0,
      endToken: totalTokens,
    }];
  }

  if (strategy === 'fixed') {
    return fixedChunk(text, maxTokens, overlap, maxChunks, minChunkTokens);
  }

  return semanticChunk(text, maxTokens, overlap, maxChunks, minChunkTokens);
}

/**
 * Fixed-size chunking: splits at character boundaries with overlap.
 * @param {string} text
 * @param {number} maxTokens
 * @param {number} overlap
 * @param {number} maxChunks
 * @param {number} minChunkTokens
 * @returns {Array<{index: number, text: string, startToken: number, endToken: number}>}
 */
function fixedChunk(text, maxTokens, overlap, maxChunks, minChunkTokens) {
  const maxChars = tokensToChars(maxTokens);
  const overlapChars = tokensToChars(overlap);
  const step = maxChars - overlapChars;
  const chunks = [];
  let pos = 0;

  while (pos < text.length && chunks.length < maxChunks) {
    const end = Math.min(pos + maxChars, text.length);
    const chunkText = text.slice(pos, end).trim();

    if (estimateTokens(chunkText) >= minChunkTokens || chunks.length === 0) {
      chunks.push({
        index: chunks.length,
        text: chunkText,
        startToken: Math.ceil(pos / 4),
        endToken: Math.ceil(end / 4),
      });
    }

    if (end >= text.length) break;
    pos += step;
  }

  return chunks;
}

/**
 * Semantic chunking: splits at paragraph/sentence boundaries with overlap.
 * @param {string} text
 * @param {number} maxTokens
 * @param {number} overlap
 * @param {number} maxChunks
 * @param {number} minChunkTokens
 * @returns {Array<{index: number, text: string, startToken: number, endToken: number}>}
 */
function semanticChunk(text, maxTokens, overlap, maxChunks, minChunkTokens) {
  const maxChars = tokensToChars(maxTokens);

  // Split into semantic segments (paragraphs, then sentences if needed)
  const rawSegments = splitAtBoundaries(text);

  // Further split any oversized segments
  const segments = [];
  for (const seg of rawSegments) {
    const parts = splitLargeSegment(seg, maxChars);
    segments.push(...parts);
  }

  if (segments.length === 0) return [];

  // Build chunks by accumulating segments up to maxTokens
  const chunks = [];
  let currentSegments = [];
  let currentTokens = 0;
  let runningTokenOffset = 0;

  for (let i = 0; i < segments.length; i++) {
    const segTokens = estimateTokens(segments[i]);

    // If adding this segment would exceed limit, finalize current chunk
    if (currentTokens + segTokens > maxTokens && currentSegments.length > 0) {
      const chunkStr = currentSegments.join('\n\n');
      const startToken = runningTokenOffset;
      const endToken = startToken + estimateTokens(chunkStr);

      chunks.push({
        index: chunks.length,
        text: chunkStr,
        startToken,
        endToken,
      });

      if (chunks.length >= maxChunks) break;

      // Calculate overlap: keep trailing segments that fit within overlap window
      const overlapSegments = [];
      let overlapTokenCount = 0;
      for (let j = currentSegments.length - 1; j >= 0; j--) {
        const segT = estimateTokens(currentSegments[j]);
        if (overlapTokenCount + segT > overlap) break;
        overlapSegments.unshift(currentSegments[j]);
        overlapTokenCount += segT;
      }

      runningTokenOffset = endToken - overlapTokenCount;
      currentSegments = [...overlapSegments];
      currentTokens = overlapTokenCount;
    }

    currentSegments.push(segments[i]);
    currentTokens += segTokens;
  }

  // Flush remaining segments
  if (currentSegments.length > 0 && chunks.length < maxChunks) {
    const chunkStr = currentSegments.join('\n\n');
    const tokenCount = estimateTokens(chunkStr);

    // Only add if it meets minimum or it's the only chunk
    if (tokenCount >= minChunkTokens || chunks.length === 0) {
      chunks.push({
        index: chunks.length,
        text: chunkStr,
        startToken: runningTokenOffset,
        endToken: runningTokenOffset + tokenCount,
      });
    } else if (chunks.length > 0) {
      // Merge tiny remainder into previous chunk
      const prev = chunks[chunks.length - 1];
      prev.text = prev.text + '\n\n' + chunkStr;
      prev.endToken = prev.endToken + tokenCount;
    }
  }

  return chunks;
}

/**
 * Aggregate extraction results from multiple chunks into a consolidated result.
 * Deduplicates insights, quotes, entities, and merges tags.
 *
 * @param {Array<{chunkIndex: number, result: import('./extractor.js').ExtractionResult}>} chunkResults
 * @param {Object} metadata - Original document metadata
 * @param {string} metadata.title - Document title
 * @param {string} [metadata.url] - Source URL
 * @param {number} [metadata.duration] - Duration in seconds (for video/audio)
 * @param {number} [metadata.totalChunks] - Total number of chunks processed
 * @returns {import('./extractor.js').ExtractionResult}
 */
export function aggregateChunkResults(chunkResults, metadata = {}) {
  if (!chunkResults || chunkResults.length === 0) {
    return {
      insights: [],
      summary: [],
      tags: [],
      entities: [],
      quotes: [],
      tier: 'D',
      scores: {},
    };
  }

  // If single chunk, return its result directly
  if (chunkResults.length === 1) {
    return chunkResults[0].result;
  }

  // Collect all items across chunks
  const allInsights = [];
  const allQuotes = [];
  const allEntities = [];
  const allTags = [];
  const allSummaries = [];
  const allScores = [];
  const tiers = [];

  for (const { chunkIndex, result } of chunkResults) {
    if (result.insights) {
      for (const insight of result.insights) {
        allInsights.push({ ...insight, _chunkIndex: chunkIndex });
      }
    }
    if (result.quotes) allQuotes.push(...result.quotes);
    if (result.entities) allEntities.push(...result.entities);
    if (result.tags) allTags.push(...result.tags);
    if (result.summary) allSummaries.push(...result.summary);
    if (result.scores) allScores.push(result.scores);
    if (result.tier) tiers.push(result.tier);
  }

  // Deduplicate insights by similarity (simple substring check)
  const deduplicatedInsights = deduplicateInsights(allInsights);

  // Deduplicate simple string arrays
  const uniqueQuotes = deduplicateStrings(allQuotes);
  const uniqueEntities = deduplicateStrings(allEntities);
  const uniqueTags = deduplicateStrings(allTags).slice(0, 10);

  // Merge summaries: take first summary bullet from each chunk, deduplicate
  const consolidatedSummary = deduplicateStrings(allSummaries).slice(0, 5);

  // Best tier wins (S > A > B > C > D)
  const tierOrder = ['S', 'A', 'B', 'C', 'D'];
  const bestTier = tiers.sort((a, b) => tierOrder.indexOf(a) - tierOrder.indexOf(b))[0] || 'C';

  // Average scores across chunks
  const mergedScores = averageScores(allScores);

  return {
    insights: deduplicatedInsights,
    summary: consolidatedSummary,
    tags: uniqueTags,
    entities: uniqueEntities,
    quotes: uniqueQuotes,
    tier: bestTier,
    scores: mergedScores,
    chunked: true,
    chunksProcessed: chunkResults.length,
    totalChunks: metadata.totalChunks || chunkResults.length,
  };
}

/**
 * Deduplicate insights by checking for high text overlap.
 * Uses a simple normalized substring/overlap heuristic.
 * @param {Array} insights
 * @returns {Array}
 */
function deduplicateInsights(insights) {
  if (insights.length === 0) return [];

  const seen = [];
  const result = [];

  for (const insight of insights) {
    const normalized = (insight.insight || '').toLowerCase().trim();
    if (!normalized) continue;

    // Check if this insight is too similar to any already-seen insight
    const isDupe = seen.some((s) => {
      // If one contains the other or they share >70% of words
      if (s.includes(normalized) || normalized.includes(s)) return true;
      return wordOverlap(s, normalized) > 0.7;
    });

    if (!isDupe) {
      seen.push(normalized);
      const { _chunkIndex, ...cleanInsight } = insight;
      result.push(cleanInsight);
    }
  }

  // Sort by confidence descending
  result.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

  return result;
}

/**
 * Calculate word overlap ratio between two strings.
 * @param {string} a
 * @param {string} b
 * @returns {number} 0-1 overlap ratio
 */
function wordOverlap(a, b) {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Deduplicate an array of strings (case-insensitive).
 * @param {string[]} arr
 * @returns {string[]}
 */
function deduplicateStrings(arr) {
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    const key = (item || '').toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/**
 * Average score objects across chunks.
 * @param {Object[]} scoreArrays
 * @returns {Object}
 */
function averageScores(scoreArrays) {
  if (scoreArrays.length === 0) return {};

  const allKeys = new Set();
  for (const s of scoreArrays) {
    for (const k of Object.keys(s)) allKeys.add(k);
  }

  const result = {};
  for (const key of allKeys) {
    const values = scoreArrays
      .map((s) => s[key])
      .filter((v) => typeof v === 'number');
    if (values.length > 0) {
      result[key] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
    }
  }

  return result;
}

/**
 * Format chunked extraction results as markdown (following Jarvis pattern).
 *
 * @param {Array<{chunkIndex: number, result: import('./extractor.js').ExtractionResult}>} chunkResults
 * @param {Object} metadata
 * @param {string} metadata.title - Document title
 * @param {string} [metadata.url] - Source URL
 * @param {number} [metadata.duration] - Duration in seconds
 * @param {number} [metadata.totalChunks] - Total chunks
 * @param {number} [metadata.totalTokens] - Estimated total tokens
 * @returns {string}
 */
export function formatChunkedMarkdown(chunkResults, metadata = {}) {
  const { title = 'Untitled', url = '', duration, totalChunks, totalTokens } = metadata;
  const durationStr = duration ? `${Math.round(duration / 60)}min` : 'unknown';

  const lines = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    url ? `source: "${url}"` : null,
    duration ? `duration: "${durationStr}"` : null,
    `chunks_processed: ${chunkResults.length}`,
    totalTokens ? `total_tokens: ~${totalTokens}` : null,
    '---',
    '',
    `# ${title}`,
    '',
  ].filter(Boolean);

  // Per-chunk sections
  for (const { chunkIndex, result } of chunkResults) {
    lines.push(`## Chunk ${chunkIndex + 1}/${totalChunks || chunkResults.length}`);
    lines.push('');

    if (result.insights && result.insights.length > 0) {
      lines.push('### Insights');
      for (const ins of result.insights) {
        lines.push(`- ${ins.insight}`);
        if (ins.evidence) lines.push(`  > Evidence: "${ins.evidence.slice(0, 150)}"`);
      }
      lines.push('');
    }

    if (result.quotes && result.quotes.length > 0) {
      lines.push('### Quotes');
      for (const q of result.quotes) {
        lines.push(`- "${q}"`);
      }
      lines.push('');
    }
  }

  // Consolidated section
  const aggregated = aggregateChunkResults(chunkResults, metadata);
  lines.push('## Consolidated Summary');
  lines.push('');

  if (aggregated.summary && aggregated.summary.length > 0) {
    for (const s of aggregated.summary) {
      lines.push(`- ${s}`);
    }
    lines.push('');
  }

  if (aggregated.insights && aggregated.insights.length > 0) {
    lines.push('### Top Insights (deduplicated)');
    for (const ins of aggregated.insights.slice(0, 15)) {
      lines.push(`- ${ins.insight}`);
    }
    lines.push('');
  }

  if (aggregated.entities && aggregated.entities.length > 0) {
    lines.push('### Entities');
    lines.push(aggregated.entities.join(', '));
    lines.push('');
  }

  if (aggregated.tags && aggregated.tags.length > 0) {
    lines.push('### Tags');
    lines.push(aggregated.tags.join(', '));
    lines.push('');
  }

  return lines.join('\n');
}
