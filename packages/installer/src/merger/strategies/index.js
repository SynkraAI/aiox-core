/**
 * @fileoverview Factory for merge strategies
 * @module merger/strategies
 */

const path = require('path');
const { ReplaceMerger } = require('./replace-merger.js');
const { EnvMerger } = require('./env-merger.js');
const { MarkdownMerger } = require('./markdown-merger.js');
const { YamlMerger } = require('./yaml-merger.js');

// Strategy registry - maps file extensions to merger classes
const strategies = new Map();

// Special file names that have dedicated strategies
const fileNameStrategies = new Map();

// Register built-in strategies
// .env files
fileNameStrategies.set('.env', EnvMerger);
fileNameStrategies.set('.env.local', EnvMerger);
fileNameStrategies.set('.env.example', EnvMerger);

// Markdown files
strategies.set('.md', MarkdownMerger);

// YAML files (Story INS-4.7)
strategies.set('.yaml', YamlMerger);
strategies.set('.yml', YamlMerger);

/**
 * Register a merge strategy for a file extension
 * @param {string} extension - File extension (e.g., '.md', '.env')
 * @param {typeof import('./base-merger.js').BaseMerger} MergerClass - Merger class
 */
function registerStrategy(extension, MergerClass) {
  strategies.set(extension.toLowerCase(), MergerClass);
}

/**
 * Register a merge strategy for a specific filename
 * @param {string} filename - Exact filename (e.g., '.env')
 * @param {typeof import('./base-merger.js').BaseMerger} MergerClass - Merger class
 */
function registerFileNameStrategy(filename, MergerClass) {
  fileNameStrategies.set(filename.toLowerCase(), MergerClass);
}

/**
 * Get the appropriate merge strategy for a file
 * @param {string} filePath - Path to the file
 * @returns {import('./base-merger.js').BaseMerger} Merger instance
 */
function getMergeStrategy(filePath) {
  const basename = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  // First check for exact filename match (e.g., '.env')
  if (fileNameStrategies.has(basename)) {
    const MergerClass = fileNameStrategies.get(basename);
    return new MergerClass();
  }

  // Then check for extension match (e.g., '.md')
  if (strategies.has(ext)) {
    const MergerClass = strategies.get(ext);
    return new MergerClass();
  }

  // Fallback to replace merger
  return new ReplaceMerger();
}

/**
 * Check if a specific merge strategy exists for a file
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if a non-fallback strategy exists
 */
function hasMergeStrategy(filePath) {
  const basename = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  return fileNameStrategies.has(basename) || strategies.has(ext);
}

/**
 * Get list of supported file types for merging
 * @returns {Object} Object with extensions and filenames arrays
 */
function getSupportedTypes() {
  return {
    extensions: Array.from(strategies.keys()),
    filenames: Array.from(fileNameStrategies.keys()),
  };
}

// Export classes for direct use if needed
const { BaseMerger } = require('./base-merger.js');

module.exports = {
  getMergeStrategy,
  hasMergeStrategy,
  registerStrategy,
  registerFileNameStrategy,
  getSupportedTypes,
  BaseMerger,
  ReplaceMerger,
  EnvMerger,
  MarkdownMerger,
  YamlMerger,
};
