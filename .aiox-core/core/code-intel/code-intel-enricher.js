'use strict';

/**
 * CodeIntelEnricher — Composite capabilities built on top of primitive capabilities.
 *
 * Each method composes multiple primitive capabilities from CodeIntelClient
 * to provide higher-level analysis functions used by AIOX tasks.
 */
class CodeIntelEnricher {
  /**
   * @param {import('./code-intel-client').CodeIntelClient} client
   */
  constructor(client) {
    this._client = client;
  }

  /**
   * Assess impact of changes to given files.
   * Composition: findReferences + analyzeComplexity
   *
   * @param {string[]} files - Files to assess impact for
   * @returns {Promise<{references: Array, complexity: Object, blastRadius: number}|null>}
   */
  async assessImpact(files) {
    if (!files || files.length === 0) return null;

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const [refs, complexity] = await Promise.all([
              this._client.findReferences(file),
              this._client.analyzeComplexity(file),
            ]);
            return { file, references: refs, complexity };
          } catch {
            return { file, references: null, complexity: null };
          }
        }),
      );

      const allRefs = results.flatMap((r) => r.references || []);
      const avgComplexity =
        results.reduce((sum, r) => sum + ((r.complexity && r.complexity.score) || 0), 0) /
        (results.length || 1);

      return {
        references: allRefs,
        complexity: { average: avgComplexity, perFile: results },
        blastRadius: allRefs.length,
      };
    } catch {
      return null;
    }
  }

  /**
   * Detect potential duplicates for a description/concept.
   * Composition: findReferences + analyzeCodebase
   *
   * @param {string} description - Description of the capability to check
   * @param {Object} [options] - Search options
   * @returns {Promise<{matches: Array, codebaseOverview: Object}|null>}
   */
  async detectDuplicates(description, options = {}) {
    try {
      const [refs, codebase] = await Promise.all([
        this._client.findReferences(description, options),
        this._client.analyzeCodebase(options.path || '.', options),
      ]);

      if (!refs && !codebase) return null;

      return {
        matches: refs || [],
        codebaseOverview: codebase || {},
      };
    } catch {
      return null;
    }
  }

  /**
   * Get coding conventions for a path.
   * Composition: analyzeCodebase + getProjectStats
   *
   * @param {string} path - Path to analyze conventions for
   * @returns {Promise<{patterns: Array, stats: Object}|null>}
   */
  async getConventions(path) {
    try {
      const [codebase, stats] = await Promise.all([
        this._client.analyzeCodebase(path),
        this._client.getProjectStats(),
      ]);

      if (!codebase && !stats) return null;

      return {
        patterns: (codebase && codebase.patterns) || [],
        stats: stats || {},
      };
    } catch {
      return null;
    }
  }

  /**
   * Find tests related to a symbol.
   * Composition: findReferences (filtered for test/spec files)
   *
   * @param {string} symbol - Symbol to find tests for
   * @returns {Promise<Array<{file: string, line: number, context: string}>|null>}
   */
  async findTests(symbol) {
    try {
      const refs = await this._client.findReferences(symbol);
      if (!refs) return null;

      return refs.filter((ref) => {
        const file = (ref.file || '').toLowerCase();
        return (
          file.includes('test') ||
          file.includes('spec') ||
          file.includes('__tests__')
        );
      });
    } catch {
      return null;
    }
  }

  /**
   * Describe the project overview.
   * Composition: analyzeCodebase + getProjectStats
   *
   * @param {string} [path] - Root path (defaults to '.')
   * @returns {Promise<{codebase: Object, stats: Object}|null>}
   */
  async describeProject(path = '.') {
    try {
      const [codebase, stats] = await Promise.all([
        this._client.analyzeCodebase(path),
        this._client.getProjectStats(),
      ]);

      if (!codebase && !stats) return null;

      return {
        codebase: codebase || {},
        stats: stats || {},
      };
    } catch {
      return null;
    }
  }
}

module.exports = { CodeIntelEnricher };
