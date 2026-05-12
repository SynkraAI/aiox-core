#!/usr/bin/env node

/**
 * AIOX Gotchas Memory
 *
 * Story: 9.4 - Gotchas Memory
 * Epic: Epic 9 - Persistent Memory Layer
 *
 * Enhanced gotchas system with auto-capture of repeated errors,
 * manual addition, and context injection for tasks.
 *
 * Features:
 * - AC1: gotchas-memory.js in .aiox-core/core/memory/
 * - AC2: Persists in .aiox/gotchas.json and .aiox/gotchas.md
 * - AC3: Auto-capture: detects repeated errors (3x same error = gotcha)
 * - AC4: Categories: build, test, lint, runtime, integration, security
 * - AC5: Command *gotcha {description} adds manually
 * - AC6: Command *gotchas lists all gotchas
 * - AC7: Injects relevant gotchas before related tasks
 * - AC8: Severity levels: info, warning, critical
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Output paths
  gotchasJsonPath: '.aiox/gotchas.json',
  gotchasMdPath: '.aiox/gotchas.md',
  errorTrackingPath: '.aiox/error-tracking.json',

  // Auto-capture settings
  repeatThreshold: 3, // Number of times error must repeat to become gotcha
  errorWindowMs: 24 * 60 * 60 * 1000, // 24 hours window for error counting

  // Version
  version: '1.0.0',
  schemaVersion: 'aiox-gotchas-memory-v1',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Gotcha categories (AC4)
 */
const GotchaCategory = {
  BUILD: 'build',
  TEST: 'test',
  LINT: 'lint',
  RUNTIME: 'runtime',
  INTEGRATION: 'integration',
  SECURITY: 'security',
  GENERAL: 'general',
};

/**
 * Severity levels (AC8)
 */
const Severity = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

/**
 * Category keywords for auto-detection
 */
const CATEGORY_KEYWORDS = {
  [GotchaCategory.BUILD]: [
    'build',
    'compile',
    'webpack',
    'vite',
    'esbuild',
    'rollup',
    'bundle',
    'transpile',
    'babel',
    'typescript',
    'tsc',
    'npm run build',
  ],
  [GotchaCategory.TEST]: [
    'test',
    'jest',
    'vitest',
    'mocha',
    'chai',
    'expect',
    'assert',
    'mock',
    'stub',
    'spy',
    'coverage',
    'e2e',
    'playwright',
    'cypress',
  ],
  [GotchaCategory.LINT]: [
    'lint',
    'eslint',
    'prettier',
    'stylelint',
    'tslint',
    'format',
    'code style',
    'indentation',
    'semicolon',
    'quotes',
  ],
  [GotchaCategory.RUNTIME]: [
    'runtime',
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'null',
    'undefined',
    'crash',
    'exception',
    'stack trace',
  ],
  [GotchaCategory.INTEGRATION]: [
    'api',
    'http',
    'fetch',
    'axios',
    'cors',
    'webhook',
    'database',
    'postgres',
    'mysql',
    'mongodb',
    'supabase',
    'prisma',
  ],
  [GotchaCategory.SECURITY]: [
    'security',
    'xss',
    'csrf',
    'injection',
    'sql injection',
    'auth',
    'authentication',
    'authorization',
    'token',
    'password',
  ],
};

/**
 * Events emitted by GotchasMemory
 */
const Events = {
  GOTCHA_ADDED: 'gotcha_added',
  GOTCHA_REMOVED: 'gotcha_removed',
  GOTCHA_RESOLVED: 'gotcha_resolved',
  ERROR_TRACKED: 'error_tracked',
  AUTO_CAPTURED: 'auto_captured',
  CONTEXT_INJECTED: 'context_injected',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GOTCHAS MEMORY CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class GotchasMemory extends EventEmitter {
  /**
   * Create a new GotchasMemory instance
   *
   * @param {string} rootPath - Project root path
   * @param {Object} [options] - Configuration options
   */
  constructor(rootPath, options = {}) {
    super();
    this.rootPath = rootPath || process.cwd();
    this.options = {
      repeatThreshold: options.repeatThreshold || CONFIG.repeatThreshold,
      errorWindowMs: options.errorWindowMs || CONFIG.errorWindowMs,
      quiet: options.quiet || false,
    };

    // Paths
    this.gotchasJsonPath = path.join(this.rootPath, CONFIG.gotchasJsonPath);
    this.gotchasMdPath = path.join(this.rootPath, CONFIG.gotchasMdPath);
    this.errorTrackingPath = path.join(this.rootPath, CONFIG.errorTrackingPath);

    // In-memory storage
    this.gotchas = new Map(); // id -> gotcha
    this.errorTracking = new Map(); // errorHash -> { count, firstSeen, lastSeen, samples }

    // Load existing data
    this._loadGotchas();
    this._loadErrorTracking();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              PUBLIC METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Add a gotcha manually (AC5)
   *
   * @param {Object} gotchaData - Gotcha data
   * @param {string} gotchaData.title - Short title
   * @param {string} gotchaData.description - Detailed description
   * @param {string} [gotchaData.category] - Category (auto-detected if not provided)
   * @param {string} [gotchaData.severity] - Severity level
   * @param {string} [gotchaData.workaround] - Workaround or solution
   * @param {string[]} [gotchaData.relatedFiles] - Related file paths
   * @param {Object} [gotchaData.trigger] - Trigger pattern
   * @returns {Object} Created gotcha
   */
  addGotcha(gotchaData) {
    const gotcha = this._createGotcha(gotchaData, 'manual');
    this.gotchas.set(gotcha.id, gotcha);
    this._saveGotchas();

    this.emit(Events.GOTCHA_ADDED, gotcha);
    this._log(`Added gotcha: ${gotcha.title}`);

    return gotcha;
  }

  /**
   * Track an error occurrence (AC3 - part of auto-capture)
   *
   * @param {Object} errorData - Error information
   * @param {string} errorData.message - Error message
   * @param {string} [errorData.stack] - Stack trace
   * @param {string} [errorData.file] - File where error occurred
   * @param {string} [errorData.category] - Category
   * @param {Object} [errorData.context] - Additional context
   * @returns {Object|null} Auto-captured gotcha if threshold reached
   */
  trackError(errorData) {
    const errorHash = this._hashError(errorData);
    const now = Date.now();

    // Get or create tracking entry
    let tracking = this.errorTracking.get(errorHash);
    if (!tracking) {
      tracking = {
        count: 0,
        firstSeen: now,
        lastSeen: now,
        samples: [],
        errorPattern: errorData.message,
        category: this._detectCategory(errorData.message + ' ' + (errorData.stack || '')),
      };
    }

    // Update tracking
    tracking.count++;
    tracking.lastSeen = now;
    if (tracking.samples.length < 5) {
      tracking.samples.push({
        timestamp: new Date(now).toISOString(),
        file: errorData.file,
        context: errorData.context,
      });
    }

    this.errorTracking.set(errorHash, tracking);
    this._saveErrorTracking();

    this.emit(Events.ERROR_TRACKED, { errorHash, tracking });

    // Check if threshold reached for auto-capture (AC3)
    if (tracking.count >= this.options.repeatThreshold) {
      // Check if not already captured
      const existingGotcha = this._findGotchaByErrorPattern(errorData.message);
      if (!existingGotcha) {
        return this._autoCaptureGotcha(errorData, tracking);
      }
    }

    return null;
  }

  /**
   * List all gotchas (AC6)
   *
   * @param {Object} [options] - Filter options
   * @param {string} [options.category] - Filter by category
   * @param {string} [options.severity] - Filter by severity
   * @param {boolean} [options.unresolved] - Only show unresolved
   * @returns {Object[]} List of gotchas
   */
  listGotchas(options = {}) {
    let gotchas = [...this.gotchas.values()];

    if (options.category) {
      gotchas = gotchas.filter((g) => g.category === options.category);
    }

    if (options.severity) {
      gotchas = gotchas.filter((g) => g.severity === options.severity);
    }

    if (options.unresolved) {
      gotchas = gotchas.filter((g) => !g.resolved);
    }

    // Sort by severity (critical first), then by last occurrence
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    gotchas.sort((a, b) => {
      const severityDiff = (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.source.lastSeen) - new Date(a.source.lastSeen);
    });

    return gotchas;
  }

  /**
   * Get gotchas relevant to a task (AC7)
   *
   * @param {string} taskDescription - Description of the task
   * @param {string[]} [relatedFiles] - Files involved in the task
   * @returns {Object[]} Relevant gotchas for context injection
   */
  getContextForTask(taskDescription, relatedFiles = []) {
    const relevantGotchas = [];
    const descLower = taskDescription.toLowerCase();
    const filePaths = relatedFiles.map((f) => f.toLowerCase());

    for (const gotcha of this.gotchas.values()) {
      if (gotcha.resolved) continue;

      let relevanceScore = 0;

      // Check category match
      const taskCategory = this._detectCategory(taskDescription);
      if (gotcha.category === taskCategory) {
        relevanceScore += 3;
      }

      // Check keyword matches in description
      const gotchaKeywords = this._extractKeywords(
        `${gotcha.title} ${gotcha.description} ${gotcha.workaround || ''}`,
      );
      for (const keyword of gotchaKeywords) {
        if (descLower.includes(keyword)) {
          relevanceScore += 1;
        }
      }

      // Check file matches
      if (gotcha.relatedFiles && gotcha.relatedFiles.length > 0) {
        for (const gotchaFile of gotcha.relatedFiles) {
          const gotchaFileLower = gotchaFile.toLowerCase();
          for (const taskFile of filePaths) {
            if (taskFile.includes(gotchaFileLower) || gotchaFileLower.includes(taskFile)) {
              relevanceScore += 2;
            }
          }
        }
      }

      // Check trigger pattern
      if (gotcha.trigger && gotcha.trigger.errorPattern) {
        if (descLower.includes(gotcha.trigger.errorPattern.toLowerCase())) {
          relevanceScore += 5;
        }
      }

      if (relevanceScore > 0) {
        relevantGotchas.push({
          ...gotcha,
          relevanceScore,
        });
      }
    }

    // Sort by relevance and return top matches
    relevantGotchas.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const result = relevantGotchas.slice(0, 5);

    if (result.length > 0) {
      this.emit(Events.CONTEXT_INJECTED, {
        taskDescription,
        gotchasCount: result.length,
      });
    }

    return result;
  }

  /**
   * Format gotchas for prompt injection (AC7)
   *
   * @param {Object[]} gotchas - Gotchas to format
   * @returns {string} Formatted string for prompt injection
   */
  formatForPrompt(gotchas) {
    if (!gotchas || gotchas.length === 0) {
      return '';
    }

    let prompt = '\n## Known Gotchas (Review Before Proceeding)\n\n';

    for (const gotcha of gotchas) {
      const severityIcon =
        {
          critical: '[CRITICAL]',
          warning: '[WARNING]',
          info: '[INFO]',
        }[gotcha.severity] || '[INFO]';

      prompt += `### ${severityIcon} ${gotcha.title}\n`;
      prompt += `${gotcha.description}\n`;

      if (gotcha.workaround) {
        prompt += `\n**Workaround:** ${gotcha.workaround}\n`;
      }

      if (gotcha.relatedFiles && gotcha.relatedFiles.length > 0) {
        prompt += `**Related Files:** ${gotcha.relatedFiles.join(', ')}\n`;
      }

      prompt += '\n';
    }

    return prompt;
  }

  /**
   * Mark a gotcha as resolved
   *
   * @param {string} gotchaId - Gotcha ID
   * @param {string} [resolvedBy] - Who/what resolved it
   * @returns {Object|null} Updated gotcha or null if not found
   */
  resolveGotcha(gotchaId, resolvedBy = 'manual') {
    const gotcha = this.gotchas.get(gotchaId);
    if (!gotcha) {
      return null;
    }

    gotcha.resolved = true;
    gotcha.resolvedAt = new Date().toISOString();
    gotcha.resolvedBy = resolvedBy;

    this._saveGotchas();
    this.emit(Events.GOTCHA_RESOLVED, gotcha);

    return gotcha;
  }

  /**
   * Remove a gotcha
   *
   * @param {string} gotchaId - Gotcha ID
   * @returns {boolean} True if removed
   */
  removeGotcha(gotchaId) {
    const gotcha = this.gotchas.get(gotchaId);
    if (!gotcha) {
      return false;
    }

    this.gotchas.delete(gotchaId);
    this._saveGotchas();
    this.emit(Events.GOTCHA_REMOVED, gotcha);

    return true;
  }

  /**
   * Search gotchas by query
   *
   * @param {string} query - Search query
   * @returns {Object[]} Matching gotchas
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return [...this.gotchas.values()].filter((gotcha) => {
      const searchText = [
        gotcha.id,
        gotcha.title,
        gotcha.description,
        gotcha.workaround || '',
        gotcha.category,
        ...(gotcha.relatedFiles || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchText.includes(lowerQuery);
    });
  }

  /**
   * Get statistics
   *
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const gotchas = [...this.gotchas.values()];
    const byCategory = {};
    const bySeverity = { critical: 0, warning: 0, info: 0 };
    const bySource = { manual: 0, auto_detected: 0 };

    for (const gotcha of gotchas) {
      byCategory[gotcha.category] = (byCategory[gotcha.category] || 0) + 1;
      bySeverity[gotcha.severity] = (bySeverity[gotcha.severity] || 0) + 1;
      bySource[gotcha.source.type] = (bySource[gotcha.source.type] || 0) + 1;
    }

    return {
      totalGotchas: gotchas.length,
      resolved: gotchas.filter((g) => g.resolved).length,
      unresolved: gotchas.filter((g) => !g.resolved).length,
      byCategory,
      bySeverity,
      bySource,
      trackedErrors: this.errorTracking.size,
      pendingAutoCapture: [...this.errorTracking.values()].filter(
        (t) => t.count >= this.options.repeatThreshold - 1 && t.count < this.options.repeatThreshold,
      ).length,
    };
  }

  /**
   * Export to JSON
   *
   * @returns {Object} JSON export
   */
  toJSON() {
    return {
      schema: CONFIG.schemaVersion,
      version: CONFIG.version,
      projectId: path.basename(this.rootPath),
      lastUpdated: new Date().toISOString(),
      statistics: this.getStatistics(),
      gotchas: [...this.gotchas.values()],
    };
  }

  /**
   * Generate markdown output (AC2)
   *
   * @returns {string} Markdown content
   */
  toMarkdown() {
    const stats = this.getStatistics();
    const now = new Date().toISOString();

    let md = `# Known Gotchas

> Auto-generated by AIOX Gotchas Memory
> Last updated: ${now}
> Total: ${stats.totalGotchas} (${stats.unresolved} unresolved)

---

## Table of Contents

`;

    // Generate TOC by category
    for (const category of Object.values(GotchaCategory)) {
      const count = stats.byCategory[category] || 0;
      if (count > 0) {
        md += `- [${category.charAt(0).toUpperCase() + category.slice(1)}](#${category}) (${count})\n`;
      }
    }

    md += '\n---\n\n';

    // Generate content by category
    for (const category of Object.values(GotchaCategory)) {
      const categoryGotchas = this.listGotchas({ category });
      if (categoryGotchas.length === 0) continue;

      md += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

      for (const gotcha of categoryGotchas) {
        md += this._renderGotchaMarkdown(gotcha);
      }
    }

    // Add statistics
    md += `---

## Statistics

| Metric | Value |
|--------|-------|
| Total Gotchas | ${stats.totalGotchas} |
| Unresolved | ${stats.unresolved} |
| Critical | ${stats.bySeverity.critical} |
| Warning | ${stats.bySeverity.warning} |
| Info | ${stats.bySeverity.info} |
| Auto-detected | ${stats.bySource.auto_detected} |
| Manual | ${stats.bySource.manual} |

---

*Generated by AIOX Gotchas Memory v${CONFIG.version}*
`;

    return md;
  }

  /**
   * Save all data
   */
  save() {
    this._saveGotchas();
    this._saveErrorTracking();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Create a gotcha object
   * @private
   */
  _createGotcha(data, sourceType) {
    const now = new Date().toISOString();
    const category =
      data.category || this._detectCategory(`${data.title || ''} ${data.description || ''}`);

    return {
      id: data.id || this._generateId(),
      title: data.title || 'Untitled Gotcha',
      description: data.description || '',
      category,
      severity: this._normalizeSeverity(data.severity),
      workaround: data.workaround || null,
      relatedFiles: data.relatedFiles || [],
      trigger: data.trigger || null,
      source: {
        type: sourceType,
        occurrences: data.occurrences || 1,
        firstSeen: data.firstSeen || now,
        lastSeen: data.lastSeen || now,
      },
      resolved: false,
      resolvedAt: null,
      resolvedBy: null,
      createdAt: now,
    };
  }

  /**
   * Auto-capture a gotcha from repeated errors (AC3)
   * @private
   */
  _autoCaptureGotcha(errorData, tracking) {
    const gotcha = this._createGotcha(
      {
        title: this._generateTitleFromError(errorData.message),
        description: errorData.message,
        category: tracking.category,
        severity: Severity.WARNING,
        workaround: null,
        relatedFiles: tracking.samples
          .filter((s) => s.file)
          .map((s) => s.file)
          .filter((f, i, arr) => arr.indexOf(f) === i),
        trigger: {
          errorPattern: this._extractErrorPattern(errorData.message),
          files: tracking.samples.map((s) => s.file).filter(Boolean),
        },
        occurrences: tracking.count,
        firstSeen: new Date(tracking.firstSeen).toISOString(),
        lastSeen: new Date(tracking.lastSeen).toISOString(),
      },
      'auto_detected',
    );

    this.gotchas.set(gotcha.id, gotcha);
    this._saveGotchas();

    this.emit(Events.AUTO_CAPTURED, gotcha);
    this._log(`Auto-captured gotcha: ${gotcha.title} (${tracking.count} occurrences)`);

    return gotcha;
  }

  /**
   * Find gotcha by error pattern
   * @private
   */
  _findGotchaByErrorPattern(errorMessage) {
    const pattern = this._extractErrorPattern(errorMessage);
    for (const gotcha of this.gotchas.values()) {
      if (gotcha.trigger && gotcha.trigger.errorPattern) {
        if (gotcha.trigger.errorPattern === pattern) {
          return gotcha;
        }
      }
      // Also check description
      if (gotcha.description && gotcha.description.includes(errorMessage.substring(0, 50))) {
        return gotcha;
      }
    }
    return null;
  }

  /**
   * Generate title from error message
   * @private
   */
  _generateTitleFromError(message) {
    // Extract the first meaningful part
    const firstLine = message.split('\n')[0];
    const cleaned = firstLine
      .replace(/at .+/, '')
      .replace(/Error:?\s*/i, '')
      .trim();

    if (cleaned.length > 60) {
      return cleaned.substring(0, 57) + '...';
    }
    return cleaned || 'Repeated Error';
  }

  /**
   * Extract error pattern for matching
   * @private
   */
  _extractErrorPattern(message) {
    // Remove specific values like line numbers, file paths, variable names
    return message
      .split('\n')[0]
      .replace(/\d+/g, 'N')
      .replace(/["'].*?["']/g, '"X"')
      .replace(/`.*?`/g, '`X`')
      .substring(0, 100);
  }

  /**
   * Hash error for deduplication
   * @private
   */
  _hashError(errorData) {
    const pattern = this._extractErrorPattern(errorData.message);
    let hash = 0;
    for (let i = 0; i < pattern.length; i++) {
      const char = pattern.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Detect category from text
   * @private
   */
  _detectCategory(text) {
    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return GotchaCategory.GENERAL;
  }

  /**
   * Normalize severity level
   * @private
   */
  _normalizeSeverity(severity) {
    if (!severity) return Severity.WARNING;

    const lower = (severity + '').toLowerCase();
    if (lower === 'critical' || lower === 'high' || lower === 'error') {
      return Severity.CRITICAL;
    }
    if (lower === 'info' || lower === 'low') {
      return Severity.INFO;
    }
    return Severity.WARNING;
  }

  /**
   * Extract keywords from text
   * @private
   */
  _extractKeywords(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);
  }

  /**
   * Generate unique ID
   * @private
   */
  _generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `gotcha-${timestamp}-${random}`;
  }

  /**
   * Render gotcha as markdown
   * @private
   */
  _renderGotchaMarkdown(gotcha) {
    const severityIcon =
      {
        critical: '**[CRITICAL]**',
        warning: '**[WARNING]**',
        info: '[INFO]',
      }[gotcha.severity] || '';

    let md = `### ${gotcha.title}\n\n`;
    md += `${severityIcon}${gotcha.resolved ? ' (RESOLVED)' : ''}\n\n`;
    md += `${gotcha.description}\n\n`;

    if (gotcha.workaround) {
      md += `**Workaround:** ${gotcha.workaround}\n\n`;
    }

    if (gotcha.relatedFiles && gotcha.relatedFiles.length > 0) {
      md += `**Related Files:** ${gotcha.relatedFiles.join(', ')}\n\n`;
    }

    md += `**Source:** ${gotcha.source.type} (${gotcha.source.occurrences} occurrences)\n`;
    md += `**First Seen:** ${gotcha.source.firstSeen}\n\n`;

    md += '---\n\n';
    return md;
  }

  /**
   * Load gotchas from file
   * @private
   */
  _loadGotchas() {
    try {
      if (fs.existsSync(this.gotchasJsonPath)) {
        const content = fs.readFileSync(this.gotchasJsonPath, 'utf-8');
        const data = JSON.parse(content);

        if (data.gotchas && Array.isArray(data.gotchas)) {
          for (const gotcha of data.gotchas) {
            this.gotchas.set(gotcha.id, gotcha);
          }
        }
      }
    } catch (error) {
      this._log(`Warning: Could not load gotchas: ${error.message}`, 'warn');
    }
  }

  /**
   * Save gotchas to files
   * @private
   */
  _saveGotchas() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.gotchasJsonPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save JSON
      fs.writeFileSync(this.gotchasJsonPath, JSON.stringify(this.toJSON(), null, 2), 'utf-8');

      // Save Markdown
      fs.writeFileSync(this.gotchasMdPath, this.toMarkdown(), 'utf-8');
    } catch (error) {
      this._log(`Error saving gotchas: ${error.message}`, 'error');
    }
  }

  /**
   * Load error tracking from file
   * @private
   */
  _loadErrorTracking() {
    try {
      if (fs.existsSync(this.errorTrackingPath)) {
        const content = fs.readFileSync(this.errorTrackingPath, 'utf-8');
        const data = JSON.parse(content);

        if (data.errors && typeof data.errors === 'object') {
          for (const [hash, tracking] of Object.entries(data.errors)) {
            this.errorTracking.set(hash, tracking);
          }
        }
      }
    } catch (error) {
      this._log(`Warning: Could not load error tracking: ${error.message}`, 'warn');
    }
  }

  /**
   * Save error tracking to file
   * @private
   */
  _saveErrorTracking() {
    try {
      const dir = path.dirname(this.errorTrackingPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = {
        version: CONFIG.version,
        updatedAt: new Date().toISOString(),
        errors: Object.fromEntries(this.errorTracking),
      };

      fs.writeFileSync(this.errorTrackingPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      this._log(`Error saving error tracking: ${error.message}`, 'error');
    }
  }

  /**
   * Log message
   * @private
   */
  _log(message, level = 'info') {
    if (this.options.quiet) return;

    const prefix =
      {
        info: '',
        warn: '\x1b[33m[WARN]\x1b[0m ',
        error: '\x1b[31m[ERROR]\x1b[0m ',
      }[level] || '';

    console.log(`${prefix}${message}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              STATIC METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * CLI main function
   */
  static async main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
      GotchasMemory.showHelp();
      process.exit(0);
    }

    const rootPath = process.cwd();
    const memory = new GotchasMemory(rootPath);

    // Parse command
    const command = args[0] || 'list';
    const rest = args.slice(1);

    switch (command) {
      case 'add': {
        const title = rest.join(' ');
        if (!title) {
          console.error('Error: Title required');
          process.exit(1);
        }
        const gotcha = memory.addGotcha({
          title,
          description: title,
        });
        console.log(`Added gotcha: ${gotcha.id}`);
        break;
      }

      case 'list': {
        const options = {};
        if (rest.includes('--category')) {
          const idx = rest.indexOf('--category');
          options.category = rest[idx + 1];
        }
        if (rest.includes('--severity')) {
          const idx = rest.indexOf('--severity');
          options.severity = rest[idx + 1];
        }
        if (rest.includes('--unresolved')) {
          options.unresolved = true;
        }

        const gotchas = memory.listGotchas(options);
        console.log(`\n=== Gotchas (${gotchas.length}) ===\n`);

        for (const gotcha of gotchas) {
          const status = gotcha.resolved ? '(RESOLVED)' : '';
          console.log(`[${gotcha.severity.toUpperCase()}] ${gotcha.title} ${status}`);
          console.log(`  Category: ${gotcha.category}`);
          console.log(`  ID: ${gotcha.id}`);
          console.log('');
        }
        break;
      }

      case 'search': {
        const query = rest.join(' ');
        if (!query) {
          console.error('Error: Search query required');
          process.exit(1);
        }
        const results = memory.search(query);
        console.log(`\n=== Search Results for "${query}" (${results.length}) ===\n`);

        for (const gotcha of results) {
          console.log(`[${gotcha.severity.toUpperCase()}] ${gotcha.title}`);
          console.log(`  ${gotcha.description.substring(0, 80)}...`);
          console.log('');
        }
        break;
      }

      case 'stats': {
        const stats = memory.getStatistics();
        console.log('\n=== Gotchas Statistics ===\n');
        console.log(JSON.stringify(stats, null, 2));
        break;
      }

      case 'resolve': {
        const gotchaId = rest[0];
        if (!gotchaId) {
          console.error('Error: Gotcha ID required');
          process.exit(1);
        }
        const result = memory.resolveGotcha(gotchaId);
        if (result) {
          console.log(`Resolved gotcha: ${result.title}`);
        } else {
          console.error(`Gotcha not found: ${gotchaId}`);
          process.exit(1);
        }
        break;
      }

      case 'context': {
        const taskDesc = rest.join(' ');
        if (!taskDesc) {
          console.error('Error: Task description required');
          process.exit(1);
        }
        const relevant = memory.getContextForTask(taskDesc);
        if (relevant.length > 0) {
          console.log(memory.formatForPrompt(relevant));
        } else {
          console.log('No relevant gotchas found for this task.');
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        GotchasMemory.showHelp();
        process.exit(1);
    }
  }

  /**
   * Show CLI help
   */
  static showHelp() {
    console.log(`
Gotchas Memory - AIOX Memory Layer (Story 9.4)

Enhanced gotchas system with auto-capture, manual addition,
and context injection for tasks.

Usage:
  node gotchas-memory.js [command] [options]

Commands:
  add <title>           Add a gotcha manually
  list                  List all gotchas
  search <query>        Search gotchas
  stats                 Show statistics
  resolve <id>          Mark gotcha as resolved
  context <task-desc>   Get relevant gotchas for a task

Options:
  --category <cat>      Filter by category
  --severity <sev>      Filter by severity (info, warning, critical)
  --unresolved          Show only unresolved gotchas
  --help, -h            Show this help message

Categories:
  - build
  - test
  - lint
  - runtime
  - integration
  - security
  - general

Examples:
  node gotchas-memory.js add "Always check fetch response.ok"
  node gotchas-memory.js list --severity critical
  node gotchas-memory.js search "typescript"
  node gotchas-memory.js context "implementing API endpoint"

Acceptance Criteria Coverage:
  AC1: gotchas-memory.js in .aiox-core/core/memory/
  AC2: Persists in .aiox/gotchas.json and .aiox/gotchas.md
  AC3: Auto-capture of repeated errors (3x = gotcha)
  AC4: Categories: build, test, lint, runtime, integration, security
  AC5: Command *gotcha {description} for manual addition
  AC6: Command *gotchas to list all
  AC7: Context injection for related tasks
  AC8: Severity levels: info, warning, critical
`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  GotchasMemory,
  // Enums
  GotchaCategory,
  Severity,
  Events,
  // Config
  CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  GotchasMemory.main();
}
