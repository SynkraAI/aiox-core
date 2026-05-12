/**
 * Text Analyzer Tool
 * Example custom tool for squad-with-tools
 *
 * @module text-analyzer
 * @version 1.0.0
 */

'use strict';

/**
 * Analyze text and return statistics
 * @param {string} text - Text to analyze
 * @returns {Object} Analysis results
 */
function analyzeText(text) {
  if (!text || typeof text !== 'string') {
    return { error: 'Invalid input: expected string' };
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    averageWordLength:
      words.length > 0
        ? (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(2)
        : 0,
    averageSentenceLength: sentences.length > 0 ? (words.length / sentences.length).toFixed(2) : 0,
  };
}

/**
 * Find most common words
 * @param {string} text - Text to analyze
 * @param {number} limit - Number of words to return
 * @returns {Array} Most common words with counts
 */
function findCommonWords(text, limit = 10) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const counts = {};

  words.forEach((word) => {
    counts[word] = (counts[word] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

// Tool export format for AIOX
module.exports = {
  name: 'text-analyzer',
  version: '1.0.0',
  description: 'Analyzes text and returns statistics',

  // Main execution function
  async execute(input) {
    const { text, options = {} } = input;

    const analysis = analyzeText(text);

    if (options.includeCommonWords) {
      analysis.commonWords = findCommonWords(text, options.wordLimit || 10);
    }

    return analysis;
  },

  // Exported utilities for direct use
  analyzeText,
  findCommonWords,
};
