'use strict';

/**
 * CodeIntelProvider — Abstract base class for all code intelligence providers.
 *
 * Every provider MUST extend this class and implement all 8 primitive capabilities.
 * Default implementations return null (graceful fallback built-in).
 *
 * @abstract
 */
class CodeIntelProvider {
  constructor(name, options = {}) {
    this.name = name;
    this.options = options;
  }

  /**
   * Check if this provider is available and can serve requests.
   * Subclasses MUST override this to indicate availability.
   * @returns {boolean}
   */
  isAvailable() {
    return false;
  }

  /**
   * Locate the definition of a symbol.
   * @param {string} symbol - Symbol name to find
   * @param {Object} [options] - Provider-specific options
   * @returns {Promise<{file: string, line: number, column: number, context: string}|null>}
   */
  async findDefinition(_symbol, _options) {
    return null;
  }

  /**
   * Find all references (usages) of a symbol.
   * @param {string} symbol - Symbol name to search
   * @param {Object} [options] - Provider-specific options
   * @returns {Promise<Array<{file: string, line: number, context: string}>|null>}
   */
  async findReferences(_symbol, _options) {
    return null;
  }

  /**
   * Find all callers of a function/method.
   * @param {string} symbol - Function/method name
   * @param {Object} [options] - Provider-specific options
   * @returns {Promise<Array<{caller: string, file: string, line: number}>|null>}
   */
  async findCallers(_symbol, _options) {
    return null;
  }

  /**
   * Find all callees (functions called by) a function/method.
   * @param {string} symbol - Function/method name
   * @param {Object} [options] - Provider-specific options
   * @returns {Promise<Array<{callee: string, file: string, line: number}>|null>}
   */
  async findCallees(_symbol, _options) {
    return null;
  }

  /**
   * Analyze dependency graph for a file or directory.
   * @param {string} path - File or directory path
   * @param {Object} [options] - Provider-specific options
   * @returns {Promise<{nodes: Array, edges: Array}|null>}
   */
  async analyzeDependencies(_path, _options) {
    return null;
  }

  /**
   * Analyze code complexity metrics.
   * @param {string} path - File or directory path
   * @param {Object} [options] - Provider-specific options
   * @returns {Promise<{score: number, details: Object}|null>}
   */
  async analyzeComplexity(_path, _options) {
    return null;
  }

  /**
   * Analyze codebase structure, files and patterns.
   * @param {string} path - Root path to analyze
   * @param {Object} [options] - Provider-specific options
   * @returns {Promise<{files: Array, structure: Object, patterns: Array}|null>}
   */
  async analyzeCodebase(_path, _options) {
    return null;
  }

  /**
   * Get project-level statistics.
   * @param {Object} [options] - Provider-specific options
   * @returns {Promise<{files: number, lines: number, languages: Object}|null>}
   */
  async getProjectStats(_options) {
    return null;
  }
}

const CAPABILITIES = [
  'findDefinition',
  'findReferences',
  'findCallers',
  'findCallees',
  'analyzeDependencies',
  'analyzeComplexity',
  'analyzeCodebase',
  'getProjectStats',
];

module.exports = { CodeIntelProvider, CAPABILITIES };
