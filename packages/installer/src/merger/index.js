/**
 * @fileoverview Smart Merge Module for AIOS Installer
 *
 * This module provides intelligent merging capabilities for configuration files
 * during AIOS installation in brownfield projects. Instead of overwriting
 * existing files, it can merge new content while preserving user customizations.
 *
 * Supported file types:
 * - .env files: Key-based merge (adds new variables, preserves existing)
 * - .md files: Section-based merge using AIOS-MANAGED markers
 * - .yaml/.yml files: Deep merge with target-wins (Phase 1 — Story INS-4.7)
 *
 * @module merger
 * @example
 * const { getMergeStrategy, hasMergeStrategy } = require('./merger/index.js');
 *
 * // Check if merge is available for a file
 * if (hasMergeStrategy('.env')) {
 *   const merger = getMergeStrategy('.env');
 *   const result = await merger.merge(existingContent, newContent);
 *   console.log(`Preserved: ${result.stats.preserved}, Added: ${result.stats.added}`);
 * }
 */

// Re-export strategy factory functions
const {
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
} = require('./strategies/index.js');

// Re-export types and utilities
const { createEmptyStats, createMergeResult } = require('./types.js');

// Re-export parsers for testing/extension
const { parseEnvFile } = require('./parsers/env-parser.js');
const {
  parseMarkdownSections,
  slugify,
  hasAiosMarkers,
} = require('./parsers/markdown-section-parser.js');

module.exports = {
  // Strategy factory
  getMergeStrategy,
  hasMergeStrategy,
  registerStrategy,
  registerFileNameStrategy,
  getSupportedTypes,

  // Types and utilities
  createEmptyStats,
  createMergeResult,

  // Base classes for extension
  BaseMerger,
  ReplaceMerger,
  EnvMerger,
  MarkdownMerger,
  YamlMerger,

  // Parsers
  parseEnvFile,
  parseMarkdownSections,
  slugify,
  hasAiosMarkers,
};
