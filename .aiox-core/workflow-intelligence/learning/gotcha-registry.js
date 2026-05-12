/**
 * Gotcha Registry - Story 12.4
 *
 * Learn from past mistakes (gotchas) to prevent repeating errors.
 * Absorbed from Auto-Claude's GOTCHA episode type in GraphitiMemory.
 *
 * @module gotcha-registry
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  storePath: '.aiox/gotchas.json',
  maxGotchas: 500,
  minConfidence: 0.5,
  autoQueryBeforeExecution: true,
  relevanceThreshold: 0.7,
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GOTCHA SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Gotcha schema for validation
 *
 * @typedef {Object} Gotcha
 * @property {string} id - Unique identifier
 * @property {string} pattern - The problematic pattern/approach
 * @property {string} context - Where this gotcha applies
 * @property {string} error - The error that occurred
 * @property {string} reason - Why it's a gotcha
 * @property {string} alternative - Recommended alternative
 * @property {string[]} keywords - Keywords for search
 * @property {number} occurrences - Times this gotcha was hit
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 * @property {string} source - Where this gotcha was learned
 */

const GOTCHA_SCHEMA = {
  required: ['pattern', 'context', 'reason'],
  optional: ['error', 'alternative', 'keywords', 'source'],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GOTCHA REGISTRY CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class GotchaRegistry {
  /**
   * Create a new GotchaRegistry
   *
   * @param {Object} options - Configuration options
   * @param {string} [options.rootPath] - Project root path
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.storePath = path.join(this.rootPath, this.config.storePath);

    this._gotchas = null;
    this._index = null;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STORAGE
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Load gotchas from storage
   * @returns {Object} Gotchas data
   */
  load() {
    if (this._gotchas) {
      return this._gotchas;
    }

    if (!fs.existsSync(this.storePath)) {
      this._gotchas = { gotchas: [], metadata: { version: '1.0.0', lastUpdated: null } };
      return this._gotchas;
    }

    try {
      const content = fs.readFileSync(this.storePath, 'utf-8');
      this._gotchas = JSON.parse(content);
      this._buildIndex();
      return this._gotchas;
    } catch (error) {
      console.error('Failed to load gotchas:', error.message);
      this._gotchas = { gotchas: [], metadata: { version: '1.0.0', lastUpdated: null } };
      return this._gotchas;
    }
  }

  /**
   * Save gotchas to storage
   */
  save() {
    if (!this._gotchas) {
      return;
    }

    // Ensure directory exists
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Update metadata
    this._gotchas.metadata.lastUpdated = new Date().toISOString();

    // Enforce max gotchas limit (remove oldest low-confidence ones)
    if (this._gotchas.gotchas.length > this.config.maxGotchas) {
      this._gotchas.gotchas = this._gotchas.gotchas
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.config.maxGotchas);
    }

    fs.writeFileSync(this.storePath, JSON.stringify(this._gotchas, null, 2), 'utf-8');
    this._buildIndex();
  }

  /**
   * Build search index
   * @private
   */
  _buildIndex() {
    this._index = new Map();

    for (const gotcha of this._gotchas.gotchas) {
      // Index by keywords
      const keywords = this._extractKeywords(gotcha);
      for (const keyword of keywords) {
        if (!this._index.has(keyword)) {
          this._index.set(keyword, []);
        }
        this._index.get(keyword).push(gotcha.id);
      }
    }
  }

  /**
   * Extract keywords from gotcha
   * @private
   */
  _extractKeywords(gotcha) {
    const keywords = new Set(gotcha.keywords || []);

    // Extract from pattern
    const patternWords = gotcha.pattern
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    patternWords.forEach((w) => keywords.add(w));

    // Extract from context
    const contextWords = gotcha.context
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    contextWords.forEach((w) => keywords.add(w));

    return Array.from(keywords);
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              RECORD GOTCHA
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Record a new gotcha
   *
   * @param {Object} gotcha - Gotcha data
   * @returns {Object} Created gotcha
   */
  recordGotcha(gotcha) {
    // Validate required fields
    for (const field of GOTCHA_SCHEMA.required) {
      if (!gotcha[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    this.load();

    // Check for existing similar gotcha
    const existing = this._findSimilar(gotcha);
    if (existing) {
      return this._updateExisting(existing, gotcha);
    }

    // Create new gotcha
    const newGotcha = {
      id: this._generateId(),
      pattern: gotcha.pattern,
      context: gotcha.context,
      error: gotcha.error || null,
      reason: gotcha.reason,
      alternative: gotcha.alternative || null,
      keywords: gotcha.keywords || [],
      occurrences: 1,
      confidence: 0.7, // Start with moderate confidence
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: gotcha.source || 'manual',
    };

    this._gotchas.gotchas.push(newGotcha);
    this.save();

    return newGotcha;
  }

  /**
   * Find similar existing gotcha
   * @private
   */
  _findSimilar(gotcha) {
    const keywords = this._extractKeywords(gotcha);
    const candidates = new Map();

    for (const keyword of keywords) {
      const ids = this._index?.get(keyword) || [];
      for (const id of ids) {
        candidates.set(id, (candidates.get(id) || 0) + 1);
      }
    }

    // Find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const [id, score] of candidates) {
      const normalizedScore = score / keywords.length;
      if (normalizedScore > this.config.relevanceThreshold && normalizedScore > bestScore) {
        bestMatch = this._gotchas.gotchas.find((g) => g.id === id);
        bestScore = normalizedScore;
      }
    }

    return bestMatch;
  }

  /**
   * Update existing gotcha with new occurrence
   * @private
   */
  _updateExisting(existing, newData) {
    existing.occurrences++;
    existing.confidence = Math.min(1, existing.confidence + 0.1);
    existing.updatedAt = new Date().toISOString();

    // Merge keywords
    if (newData.keywords) {
      existing.keywords = [...new Set([...existing.keywords, ...newData.keywords])];
    }

    // Update alternative if better one provided
    if (newData.alternative && !existing.alternative) {
      existing.alternative = newData.alternative;
    }

    this.save();
    return existing;
  }

  /**
   * Generate unique ID
   * @private
   */
  _generateId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `gotcha-${timestamp}-${random}`;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              QUERY GOTCHAS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Query gotchas for a given context
   *
   * @param {Object} context - Query context
   * @param {string} [context.pattern] - Pattern being executed
   * @param {string} [context.action] - Action being performed
   * @param {string[]} [context.files] - Files being modified
   * @param {string} [context.agent] - Agent executing
   * @returns {Object[]} Relevant gotchas
   */
  queryGotchas(context) {
    this.load();

    if (this._gotchas.gotchas.length === 0) {
      return [];
    }

    // Build query keywords
    const queryKeywords = new Set();

    if (context.pattern) {
      context.pattern
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2)
        .forEach((w) => queryKeywords.add(w));
    }

    if (context.action) {
      context.action
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2)
        .forEach((w) => queryKeywords.add(w));
    }

    if (context.files) {
      context.files.forEach((f) => {
        const parts = f
          .toLowerCase()
          .split(/[/\\.]/)
          .filter((p) => p.length > 2);
        parts.forEach((p) => queryKeywords.add(p));
      });
    }

    if (context.agent) {
      queryKeywords.add(context.agent.toLowerCase());
    }

    // Score gotchas by relevance
    const scored = this._gotchas.gotchas.map((gotcha) => {
      const gotchaKeywords = this._extractKeywords(gotcha);
      const matches = gotchaKeywords.filter((k) => queryKeywords.has(k));
      const relevance = matches.length / Math.max(gotchaKeywords.length, queryKeywords.size);

      return {
        ...gotcha,
        relevance,
        matchedKeywords: matches,
      };
    });

    // Filter and sort by relevance * confidence
    return scored
      .filter((g) => g.relevance >= this.config.relevanceThreshold)
      .filter((g) => g.confidence >= this.config.minConfidence)
      .sort((a, b) => b.relevance * b.confidence - a.relevance * a.confidence)
      .slice(0, 5);
  }

  /**
   * Get gotchas for a specific pattern/sequence
   *
   * @param {string[]} sequence - Command sequence
   * @returns {Object[]} Relevant gotchas
   */
  getGotchasForSequence(sequence) {
    return this.queryGotchas({
      pattern: sequence.join(' '),
      action: sequence[sequence.length - 1],
    });
  }

  /**
   * Get all gotchas
   *
   * @param {Object} options - Filter options
   * @returns {Object[]} Gotchas
   */
  getAllGotchas(options = {}) {
    this.load();

    let gotchas = [...this._gotchas.gotchas];

    if (options.minConfidence) {
      gotchas = gotchas.filter((g) => g.confidence >= options.minConfidence);
    }

    if (options.context) {
      gotchas = gotchas.filter((g) =>
        g.context.toLowerCase().includes(options.context.toLowerCase()),
      );
    }

    if (options.sortBy === 'occurrences') {
      gotchas.sort((a, b) => b.occurrences - a.occurrences);
    } else if (options.sortBy === 'confidence') {
      gotchas.sort((a, b) => b.confidence - a.confidence);
    } else if (options.sortBy === 'recent') {
      gotchas.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    if (options.limit) {
      gotchas = gotchas.slice(0, options.limit);
    }

    return gotchas;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              GOTCHA MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get gotcha by ID
   *
   * @param {string} id - Gotcha ID
   * @returns {Object|null} Gotcha or null
   */
  getGotcha(id) {
    this.load();
    return this._gotchas.gotchas.find((g) => g.id === id) || null;
  }

  /**
   * Update gotcha
   *
   * @param {string} id - Gotcha ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated gotcha or null
   */
  updateGotcha(id, updates) {
    this.load();

    const gotcha = this._gotchas.gotchas.find((g) => g.id === id);
    if (!gotcha) {
      return null;
    }

    // Update allowed fields
    const allowedFields = [
      'pattern',
      'context',
      'error',
      'reason',
      'alternative',
      'keywords',
      'confidence',
    ];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        gotcha[field] = updates[field];
      }
    }

    gotcha.updatedAt = new Date().toISOString();
    this.save();

    return gotcha;
  }

  /**
   * Delete gotcha
   *
   * @param {string} id - Gotcha ID
   * @returns {boolean} Success
   */
  deleteGotcha(id) {
    this.load();

    const index = this._gotchas.gotchas.findIndex((g) => g.id === id);
    if (index === -1) {
      return false;
    }

    this._gotchas.gotchas.splice(index, 1);
    this.save();

    return true;
  }

  /**
   * Deprecate gotcha (reduce confidence instead of delete)
   *
   * @param {string} id - Gotcha ID
   * @returns {Object|null} Updated gotcha
   */
  deprecateGotcha(id) {
    return this.updateGotcha(id, { confidence: 0.1 });
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STATISTICS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get gotcha statistics
   *
   * @returns {Object} Statistics
   */
  getStatistics() {
    this.load();

    const gotchas = this._gotchas.gotchas;

    if (gotchas.length === 0) {
      return {
        total: 0,
        highConfidence: 0,
        mediumConfidence: 0,
        lowConfidence: 0,
        totalOccurrences: 0,
        topContexts: [],
        recentlyUpdated: [],
      };
    }

    return {
      total: gotchas.length,
      highConfidence: gotchas.filter((g) => g.confidence >= 0.8).length,
      mediumConfidence: gotchas.filter((g) => g.confidence >= 0.5 && g.confidence < 0.8).length,
      lowConfidence: gotchas.filter((g) => g.confidence < 0.5).length,
      totalOccurrences: gotchas.reduce((sum, g) => sum + g.occurrences, 0),
      topContexts: this._getTopContexts(gotchas, 5),
      recentlyUpdated: gotchas
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map((g) => ({ id: g.id, pattern: g.pattern, updatedAt: g.updatedAt })),
    };
  }

  /**
   * Get top contexts
   * @private
   */
  _getTopContexts(gotchas, limit) {
    const contextCounts = new Map();

    for (const gotcha of gotchas) {
      const context = gotcha.context.split(' ')[0]; // First word as category
      contextCounts.set(context, (contextCounts.get(context) || 0) + 1);
    }

    return Array.from(contextCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([context, count]) => ({ context, count }));
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Format gotcha for display
   *
   * @param {Object} gotcha - Gotcha to format
   * @returns {string} Formatted string
   */
  formatGotcha(gotcha) {
    const lines = [];

    lines.push(`⚠️ GOTCHA: ${gotcha.pattern}`);
    lines.push(`   Context: ${gotcha.context}`);
    lines.push(`   Reason: ${gotcha.reason}`);

    if (gotcha.error) {
      lines.push(`   Error: ${gotcha.error}`);
    }

    if (gotcha.alternative) {
      lines.push(`   ✅ Alternative: ${gotcha.alternative}`);
    }

    lines.push(
      `   Confidence: ${(gotcha.confidence * 100).toFixed(0)}% (${gotcha.occurrences} occurrences)`,
    );

    return lines.join('\n');
  }

  /**
   * Format gotchas as markdown
   *
   * @returns {string} Markdown content
   */
  toMarkdown() {
    this.load();

    const lines = [
      '# Gotchas Registry',
      '',
      `*Last updated: ${this._gotchas.metadata.lastUpdated || 'Never'}*`,
      '',
      `Total gotchas: ${this._gotchas.gotchas.length}`,
      '',
      '---',
      '',
    ];

    // Group by context
    const byContext = new Map();
    for (const gotcha of this._gotchas.gotchas) {
      const context = gotcha.context.split(' ')[0];
      if (!byContext.has(context)) {
        byContext.set(context, []);
      }
      byContext.get(context).push(gotcha);
    }

    for (const [context, gotchas] of byContext) {
      lines.push(`## ${context}`);
      lines.push('');

      for (const gotcha of gotchas.sort((a, b) => b.confidence - a.confidence)) {
        lines.push(`### ${gotcha.pattern}`);
        lines.push('');
        lines.push(`**Reason:** ${gotcha.reason}`);
        lines.push('');

        if (gotcha.error) {
          lines.push(`**Error:** \`${gotcha.error}\``);
          lines.push('');
        }

        if (gotcha.alternative) {
          lines.push(`**Alternative:** ${gotcha.alternative}`);
          lines.push('');
        }

        lines.push(
          `*Confidence: ${(gotcha.confidence * 100).toFixed(0)}% | Occurrences: ${gotcha.occurrences}*`,
        );
        lines.push('');
        lines.push('---');
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  GotchaRegistry,
  DEFAULT_CONFIG,
  GOTCHA_SCHEMA,
};
