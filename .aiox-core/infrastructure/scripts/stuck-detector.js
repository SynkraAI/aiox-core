#!/usr/bin/env node

/**
 * Stuck Detector - Story 5.2
 *
 * Detects when Auto-Claude execution is stuck in circular patterns
 * or experiencing repeated failures, and provides escalation paths.
 *
 * Features:
 * - AC1: Detects stuck: 3+ consecutive failures
 * - AC2: Detects circular: approach similar to failed approach
 * - AC3: Blocks execution if circular detected
 * - AC4: Marks subtask as "stuck" in implementation.yaml
 * - AC5: Escalates to human with complete context
 * - AC6: Suggests alternative approaches based on errors
 * - AC7: Configurable via autoClaude.recovery.maxAttempts (default: 3)
 *
 * @module stuck-detector
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');

// Optional dependencies with graceful fallback
let yaml;
try {
  yaml = require('js-yaml');
} catch {
  yaml = null;
}

let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = {
    blue: (s) => s,
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    gray: (s) => s,
    bold: (s) => s,
    dim: (s) => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  maxAttempts: 3, // AC7: Default from autoClaude.recovery.maxAttempts
  similarityThreshold: 0.7, // For approach comparison
  windowSize: 5, // Number of recent attempts to consider
  circularDetection: true, // Enable circular approach detection
  autoBlock: true, // AC3: Block execution if circular detected
};

// Error patterns mapped to suggestion categories
const ERROR_PATTERNS = {
  // Dependency/Import errors
  dependency: [
    /cannot find module/i,
    /module not found/i,
    /import.*failed/i,
    /require.*failed/i,
    /dependency.*not installed/i,
    /package.*not found/i,
  ],
  // Type errors
  type: [
    /type error/i,
    /typescript.*error/i,
    /is not assignable to/i,
    /property.*does not exist/i,
    /cannot read property/i,
  ],
  // Configuration errors
  config: [
    /configuration.*error/i,
    /config.*invalid/i,
    /missing.*config/i,
    /environment.*not set/i,
    /env.*undefined/i,
  ],
  // Test failures
  test: [
    /test.*failed/i,
    /assertion.*failed/i,
    /expect.*received/i,
    /timeout.*exceeded/i,
    /jest.*error/i,
  ],
  // Syntax errors
  syntax: [/syntax error/i, /unexpected token/i, /parsing error/i, /invalid syntax/i],
  // Permission errors
  permission: [/permission denied/i, /access denied/i, /eacces/i, /unauthorized/i],
  // Network errors
  network: [
    /network.*error/i,
    /econnrefused/i,
    /etimedout/i,
    /fetch.*failed/i,
    /connection.*refused/i,
  ],
  // File system errors
  filesystem: [/enoent/i, /file not found/i, /no such file/i, /directory not found/i],
};

// Suggestions mapped to error categories
const SUGGESTIONS = {
  dependency: [
    'Run npm install to ensure all dependencies are installed',
    'Check package.json for correct dependency versions',
    'Try npm cache clean --force and reinstall',
    'Verify the import path is correct',
  ],
  type: [
    'Review TypeScript types and interfaces',
    'Check for undefined or null values',
    'Verify object shapes match expected types',
    'Consider using type guards or assertions',
  ],
  config: [
    'Verify all required environment variables are set',
    'Check config file syntax and structure',
    'Compare with example/template config files',
    'Ensure config paths are correct for the environment',
  ],
  test: [
    'Review test assertions and expected values',
    'Check for async/await issues in tests',
    'Increase test timeout if needed',
    'Isolate failing test with .only()',
  ],
  syntax: [
    'Review recent code changes for typos',
    'Check for missing brackets, quotes, or semicolons',
    'Validate JSON/YAML files separately',
    'Use a linter to identify syntax issues',
  ],
  permission: [
    'Check file/directory permissions',
    'Verify user has required access rights',
    'Check if file is locked by another process',
    'Try running with elevated permissions if appropriate',
  ],
  network: [
    'Verify network connectivity',
    'Check if target service is running',
    'Review firewall/proxy settings',
    'Implement retry logic with backoff',
  ],
  filesystem: [
    'Verify the file/directory path exists',
    'Check for typos in path names',
    'Ensure parent directories exist',
    'Check relative vs absolute path usage',
  ],
  general: [
    'Break the task into smaller subtasks',
    'Try a different implementation approach',
    'Review similar working implementations for patterns',
    'Consider simplifying the solution',
    'Consult documentation for the APIs/libraries in use',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STUCK DETECTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * StuckDetector - Detects and handles stuck execution scenarios
 */
class StuckDetector {
  /**
   * @param {Object} options - Configuration options
   * @param {number} [options.maxAttempts=3] - AC7: Max attempts before stuck
   * @param {number} [options.similarityThreshold=0.7] - Threshold for approach similarity
   * @param {number} [options.windowSize=5] - Recent attempts window
   * @param {boolean} [options.circularDetection=true] - Enable circular detection
   * @param {boolean} [options.autoBlock=true] - Block execution if circular
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   */
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.verbose = options.verbose || false;
    this.logs = [];

    // Verify required dependencies
    if (!yaml) {
      throw new Error('js-yaml module not available - install with: npm install js-yaml');
    }
  }

  /**
   * Log message with timestamp
   * @private
   */
  _log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    this.logs.push(logEntry);

    if (this.verbose) {
      const colorFn =
        {
          info: chalk.blue,
          success: chalk.green,
          error: chalk.red,
          warn: chalk.yellow,
          debug: chalk.dim,
        }[level] || chalk.gray;
      console.log(colorFn(logEntry));
    }
  }

  /**
   * Check if execution is stuck (AC1, AC2)
   *
   * @param {Array} attempts - Array of attempt objects with {success, approach, error}
   * @param {string} [currentApproach] - Current approach being tried
   * @returns {Object} Stuck detection result
   */
  check(attempts, currentApproach = null) {
    const result = {
      stuck: false,
      reason: null,
      confidence: 0,
      suggestions: [],
      context: {
        totalAttempts: attempts.length,
        failedAttempts: 0,
        consecutiveFailures: 0,
        failedApproaches: [],
        errors: [],
      },
    };

    if (!attempts || attempts.length === 0) {
      return result;
    }

    // Get recent attempts within window
    const recentAttempts = attempts.slice(-this.config.windowSize);

    // Count failures
    const failures = recentAttempts.filter((a) => !a.success);
    result.context.failedAttempts = failures.length;

    // AC1: Check consecutive failures
    const consecutiveFailures = this._countConsecutiveFailures(recentAttempts);
    result.context.consecutiveFailures = consecutiveFailures;

    if (consecutiveFailures >= this.config.maxAttempts) {
      result.stuck = true;
      result.reason = 'consecutive_failures';
      result.confidence = Math.min(consecutiveFailures / this.config.maxAttempts, 1);
      this._log(`Stuck detected: ${consecutiveFailures} consecutive failures`, 'warn');
    }

    // AC2: Check circular approach
    if (this.config.circularDetection && currentApproach) {
      const failedApproaches = failures.filter((a) => a.approach).map((a) => a.approach);

      result.context.failedApproaches = failedApproaches;

      const circularResult = this._detectCircularApproach(currentApproach, failedApproaches);

      if (circularResult.isCircular) {
        result.stuck = true;
        result.reason = result.reason ? `${result.reason},circular_approach` : 'circular_approach';
        result.confidence = Math.max(result.confidence, circularResult.similarity);
        result.context.similarApproach = circularResult.mostSimilar;
        result.context.similarityScore = circularResult.similarity;
        this._log(
          `Circular approach detected: ${circularResult.similarity.toFixed(2)} similarity`,
          'warn'
        );
      }
    }

    // Collect error messages
    result.context.errors = failures
      .filter((a) => a.error)
      .map((a) => (typeof a.error === 'string' ? a.error : a.error.message || String(a.error)));

    // AC6: Generate suggestions based on errors
    if (result.stuck) {
      result.suggestions = this._generateSuggestions(result.context.errors);
    }

    return result;
  }

  /**
   * Count consecutive failures from recent attempts
   * @private
   */
  _countConsecutiveFailures(attempts) {
    let count = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (!attempts[i].success) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Detect circular approach (AC2)
   * @private
   */
  _detectCircularApproach(currentApproach, failedApproaches) {
    const result = {
      isCircular: false,
      similarity: 0,
      mostSimilar: null,
    };

    if (!currentApproach || failedApproaches.length === 0) {
      return result;
    }

    const currentNormalized = this._normalizeApproach(currentApproach);

    for (const failed of failedApproaches) {
      const failedNormalized = this._normalizeApproach(failed);
      const similarity = this._calculateSimilarity(currentNormalized, failedNormalized);

      if (similarity > result.similarity) {
        result.similarity = similarity;
        result.mostSimilar = failed;
      }

      if (similarity >= this.config.similarityThreshold) {
        result.isCircular = true;
      }
    }

    return result;
  }

  /**
   * Normalize approach string for comparison
   * @private
   */
  _normalizeApproach(approach) {
    if (typeof approach !== 'string') {
      approach = JSON.stringify(approach);
    }

    // Common stop words to filter out
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'must',
      'shall',
      'to',
      'of',
      'in',
      'for',
      'on',
      'with',
      'at',
      'by',
      'from',
      'as',
      'into',
      'through',
      'during',
      'before',
      'after',
      'above',
      'below',
      'this',
      'that',
      'these',
      'those',
      'it',
      'its',
      'we',
      'our',
      'you',
      'they',
      'them',
      'their',
      'i',
      'me',
      'my',
      'he',
      'she',
      'him',
      'her',
    ]);

    return approach
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .split(' ')
      .filter((word) => word.length > 0 && !stopWords.has(word)) // Remove stop words
      .sort(); // Sort for order-independent comparison
  }

  /**
   * Calculate similarity between two normalized approaches
   * Uses combination of Jaccard similarity and Levenshtein for short strings
   * @private
   */
  _calculateSimilarity(words1, words2) {
    if (words1.length === 0 && words2.length === 0) {
      return 1;
    }

    if (words1.length === 0 || words2.length === 0) {
      return 0;
    }

    // Jaccard similarity on word sets
    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    const jaccardSimilarity = intersection.size / union.size;

    // Also compute string-level similarity for short approaches
    const str1 = words1.join(' ');
    const str2 = words2.join(' ');

    // If strings are short, use Levenshtein-based similarity
    if (str1.length < 100 && str2.length < 100) {
      const levenshteinSimilarity = this._levenshteinSimilarity(str1, str2);
      // Return the higher of the two similarities
      return Math.max(jaccardSimilarity, levenshteinSimilarity);
    }

    return jaccardSimilarity;
  }

  /**
   * Calculate Levenshtein-based similarity (1 - normalized distance)
   * @private
   */
  _levenshteinSimilarity(str1, str2) {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;

    const distance = this._levenshteinDistance(str1, str2);
    return 1 - distance / maxLen;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @private
   */
  _levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;

    // Create distance matrix
    const dp = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill in the rest of the matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] =
            1 +
            Math.min(
              dp[i - 1][j], // deletion
              dp[i][j - 1], // insertion
              dp[i - 1][j - 1] // substitution
            );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Generate suggestions based on error patterns (AC6)
   * @private
   */
  _generateSuggestions(errors) {
    const categories = new Set();
    const suggestions = [];

    // Analyze errors to find matching categories
    for (const error of errors) {
      if (!error) continue;

      for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
        for (const pattern of patterns) {
          if (pattern.test(error)) {
            categories.add(category);
            break;
          }
        }
      }
    }

    // Add suggestions for each detected category
    for (const category of categories) {
      const categorySuggestions = SUGGESTIONS[category] || [];
      for (const suggestion of categorySuggestions) {
        if (!suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      }
    }

    // If no specific category found, add general suggestions
    if (suggestions.length === 0) {
      suggestions.push(...SUGGESTIONS.general);
    }

    // Always add some general suggestions
    const generalToAdd = SUGGESTIONS.general.slice(0, 2);
    for (const suggestion of generalToAdd) {
      if (!suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }

    return suggestions.slice(0, 7); // Limit to 7 suggestions
  }

  /**
   * Mark subtask as stuck in implementation.yaml (AC4)
   *
   * @param {string} implementationPath - Path to implementation.yaml
   * @param {string} subtaskId - Subtask identifier
   * @param {Object} stuckResult - Result from check()
   * @returns {Promise<void>}
   */
  async markStuck(implementationPath, subtaskId, stuckResult) {
    this._log(`Marking subtask ${subtaskId} as stuck`, 'info');

    try {
      const content = await fs.readFile(implementationPath, 'utf8');
      const implementation = yaml.load(content);

      let found = false;
      for (const phase of implementation.phases || []) {
        for (const subtask of phase.subtasks || []) {
          if (subtask.id === subtaskId) {
            subtask.status = 'stuck';
            subtask.stuckAt = new Date().toISOString();
            subtask.stuckReason = stuckResult.reason;
            subtask.stuckContext = {
              consecutiveFailures: stuckResult.context.consecutiveFailures,
              totalAttempts: stuckResult.context.totalAttempts,
              similarityScore: stuckResult.context.similarityScore,
              suggestions: stuckResult.suggestions.slice(0, 3),
            };
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        throw new Error(`Subtask ${subtaskId} not found in implementation`);
      }

      // Write back to file
      const yamlContent = yaml.dump(implementation, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
      });

      await fs.writeFile(implementationPath, yamlContent, 'utf8');
      this._log(`Successfully marked ${subtaskId} as stuck`, 'success');
    } catch (error) {
      this._log(`Failed to mark subtask as stuck: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Generate escalation report for human review (AC5)
   *
   * @param {string} subtaskId - Subtask identifier
   * @param {Array} attempts - Array of attempt objects
   * @param {Object} [options] - Additional options
   * @returns {Object} Escalation report
   */
  generateEscalationReport(subtaskId, attempts, options = {}) {
    const checkResult = this.check(attempts, options.currentApproach);

    const report = {
      // Header
      subtaskId,
      generatedAt: new Date().toISOString(),
      severity: this._calculateSeverity(checkResult),

      // Summary
      summary: {
        isStuck: checkResult.stuck,
        reason: checkResult.reason,
        confidence: checkResult.confidence,
        totalAttempts: attempts.length,
        consecutiveFailures: checkResult.context.consecutiveFailures,
      },

      // Detailed attempt history
      attemptHistory: attempts.map((attempt, index) => ({
        attemptNumber: index + 1,
        success: attempt.success,
        approach: attempt.approach,
        error: attempt.error
          ? typeof attempt.error === 'string'
            ? attempt.error
            : attempt.error.message
          : null,
        timestamp: attempt.timestamp || null,
        duration: attempt.duration || null,
      })),

      // Analysis
      analysis: {
        failedApproaches: checkResult.context.failedApproaches,
        errorPatterns: this._analyzeErrorPatterns(checkResult.context.errors),
        circularDetected: checkResult.reason?.includes('circular') || false,
        similarityScore: checkResult.context.similarityScore,
      },

      // Recommendations
      recommendations: {
        suggestions: checkResult.suggestions,
        nextSteps: this._generateNextSteps(checkResult),
        escalationLevel: this._determineEscalationLevel(checkResult),
      },

      // Raw context for debugging
      rawContext: checkResult.context,
    };

    return report;
  }

  /**
   * Calculate severity based on stuck result
   * @private
   */
  _calculateSeverity(result) {
    if (!result.stuck) return 'low';

    if (
      result.context.consecutiveFailures >= 5 ||
      (result.reason?.includes('circular') && result.confidence > 0.9)
    ) {
      return 'critical';
    }

    if (result.context.consecutiveFailures >= 3 || result.reason?.includes('circular')) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Analyze error patterns for report
   * @private
   */
  _analyzeErrorPatterns(errors) {
    const patterns = {};

    for (const error of errors) {
      if (!error) continue;

      for (const [category, categoryPatterns] of Object.entries(ERROR_PATTERNS)) {
        for (const pattern of categoryPatterns) {
          if (pattern.test(error)) {
            patterns[category] = (patterns[category] || 0) + 1;
          }
        }
      }
    }

    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * Generate next steps based on result
   * @private
   */
  _generateNextSteps(result) {
    const steps = [];

    if (result.reason?.includes('consecutive_failures')) {
      steps.push('Review the error logs for the last 3 attempts');
      steps.push('Verify all prerequisites are met');
    }

    if (result.reason?.includes('circular')) {
      steps.push('Identify why the same approach keeps being tried');
      steps.push('Consider a fundamentally different implementation strategy');
    }

    steps.push('Break the task into smaller, verifiable subtasks');
    steps.push('Consider manual intervention or pair programming');

    return steps;
  }

  /**
   * Determine escalation level
   * @private
   */
  _determineEscalationLevel(result) {
    const severity = this._calculateSeverity(result);

    switch (severity) {
      case 'critical':
        return {
          level: 'immediate',
          action: 'Stop execution and notify human immediately',
          timeout: 0,
        };
      case 'high':
        return {
          level: 'urgent',
          action: 'Pause execution and request human review',
          timeout: 300, // 5 minutes
        };
      case 'medium':
        return {
          level: 'standard',
          action: 'Flag for review at next checkpoint',
          timeout: 1800, // 30 minutes
        };
      default:
        return {
          level: 'low',
          action: 'Continue with monitoring',
          timeout: 3600, // 1 hour
        };
    }
  }

  /**
   * Check if execution should be blocked (AC3)
   *
   * @param {Object} checkResult - Result from check()
   * @returns {boolean} Whether to block execution
   */
  shouldBlock(checkResult) {
    if (!this.config.autoBlock) {
      return false;
    }

    // Block if circular approach detected with high confidence
    if (
      checkResult.reason?.includes('circular') &&
      checkResult.confidence >= this.config.similarityThreshold
    ) {
      this._log('Blocking execution: circular approach detected', 'warn');
      return true;
    }

    // Block if too many consecutive failures
    if (checkResult.context.consecutiveFailures >= this.config.maxAttempts) {
      this._log('Blocking execution: too many consecutive failures', 'warn');
      return true;
    }

    return false;
  }

  /**
   * Format report for console output
   *
   * @param {Object} report - Escalation report
   * @returns {string} Formatted report
   */
  formatReport(report) {
    const lines = [];
    const divider = '='.repeat(70);
    const subDivider = '-'.repeat(70);

    lines.push('');
    lines.push(chalk.bold(chalk.red(divider)));
    lines.push(chalk.bold(chalk.red(' STUCK DETECTION - ESCALATION REPORT')));
    lines.push(chalk.bold(chalk.red(divider)));
    lines.push('');

    // Summary
    lines.push(chalk.bold('SUMMARY'));
    lines.push(subDivider);
    lines.push(`Subtask ID:           ${report.subtaskId}`);
    lines.push(`Generated:            ${report.generatedAt}`);
    lines.push(`Severity:             ${chalk.bold(this._colorSeverity(report.severity))}`);
    lines.push(
      `Status:               ${report.summary.isStuck ? chalk.red('STUCK') : chalk.green('OK')}`
    );
    lines.push(`Reason:               ${report.summary.reason || 'N/A'}`);
    lines.push(`Confidence:           ${(report.summary.confidence * 100).toFixed(1)}%`);
    lines.push(`Total Attempts:       ${report.summary.totalAttempts}`);
    lines.push(`Consecutive Failures: ${report.summary.consecutiveFailures}`);
    lines.push('');

    // Attempt History
    lines.push(chalk.bold('ATTEMPT HISTORY'));
    lines.push(subDivider);
    for (const attempt of report.attemptHistory) {
      const status = attempt.success ? chalk.green('PASS') : chalk.red('FAIL');
      lines.push(`  #${attempt.attemptNumber} [${status}]`);
      if (attempt.approach) {
        const approachPreview =
          attempt.approach.substring(0, 60) + (attempt.approach.length > 60 ? '...' : '');
        lines.push(`     Approach: ${chalk.dim(approachPreview)}`);
      }
      if (attempt.error) {
        const errorPreview =
          attempt.error.substring(0, 60) + (attempt.error.length > 60 ? '...' : '');
        lines.push(`     Error: ${chalk.yellow(errorPreview)}`);
      }
    }
    lines.push('');

    // Error Patterns
    if (report.analysis.errorPatterns.length > 0) {
      lines.push(chalk.bold('ERROR PATTERN ANALYSIS'));
      lines.push(subDivider);
      for (const pattern of report.analysis.errorPatterns) {
        lines.push(`  ${pattern.category}: ${pattern.count} occurrence(s)`);
      }
      lines.push('');
    }

    // Recommendations
    lines.push(chalk.bold('RECOMMENDATIONS'));
    lines.push(subDivider);
    lines.push(chalk.cyan('Suggestions:'));
    for (let i = 0; i < report.recommendations.suggestions.length; i++) {
      lines.push(`  ${i + 1}. ${report.recommendations.suggestions[i]}`);
    }
    lines.push('');
    lines.push(chalk.cyan('Next Steps:'));
    for (const step of report.recommendations.nextSteps) {
      lines.push(`  - ${step}`);
    }
    lines.push('');

    // Escalation Level
    lines.push(chalk.bold('ESCALATION'));
    lines.push(subDivider);
    const escLevel = report.recommendations.escalationLevel;
    lines.push(`Level:   ${chalk.bold(escLevel.level.toUpperCase())}`);
    lines.push(`Action:  ${escLevel.action}`);
    lines.push('');

    lines.push(divider);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Color severity string
   * @private
   */
  _colorSeverity(severity) {
    switch (severity) {
      case 'critical':
        return chalk.red(severity.toUpperCase());
      case 'high':
        return chalk.yellow(severity.toUpperCase());
      case 'medium':
        return chalk.cyan(severity.toUpperCase());
      default:
        return chalk.green(severity.toUpperCase());
    }
  }

  /**
   * Get logs from this session
   * @returns {string[]}
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Load configuration from core-config.yaml
 *
 * @param {string} [configPath] - Path to config file
 * @returns {Promise<Object>} Configuration object
 */
async function loadConfig(configPath) {
  const defaultPath = path.join(process.cwd(), '.aiox-core', 'core-config.yaml');
  const filePath = configPath || defaultPath;

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const config = yaml.load(content);

    // Extract stuck detector config from autoClaude section
    const autoClaude = config.autoClaude || {};
    const recovery = autoClaude.recovery || {};

    return {
      maxAttempts: recovery.maxAttempts || DEFAULT_CONFIG.maxAttempts,
      similarityThreshold: recovery.similarityThreshold || DEFAULT_CONFIG.similarityThreshold,
      windowSize: recovery.windowSize || DEFAULT_CONFIG.windowSize,
      circularDetection: recovery.circularDetection !== false,
      autoBlock: recovery.autoBlock !== false,
    };
  } catch (error) {
    // Return defaults if config not found
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Quick check function for simple use cases
 *
 * @param {Array} attempts - Array of attempt objects
 * @param {string} [currentApproach] - Current approach
 * @param {Object} [options] - Options
 * @returns {Object} Check result
 */
function quickCheck(attempts, currentApproach = null, options = {}) {
  const detector = new StuckDetector(options);
  return detector.check(attempts, currentApproach);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.bold('Stuck Detector')} - AIOX Auto-Claude Recovery System (Story 5.2)

${chalk.cyan('Usage:')}
  stuck-detector check <attempts-json> [--approach <current>]
  stuck-detector analyze <implementation-path> <subtask-id>
  stuck-detector mark <implementation-path> <subtask-id> <attempts-json>
  stuck-detector report <subtask-id> <attempts-json> [--output <file>]
  stuck-detector test

${chalk.cyan('Commands:')}
  check      Check if execution is stuck based on attempts
  analyze    Analyze a subtask from implementation.yaml
  mark       Mark a subtask as stuck in implementation.yaml (AC4)
  report     Generate escalation report for human review (AC5)
  test       Run test suite

${chalk.cyan('Options:')}
  --approach, -a <string>    Current approach being tried
  --max-attempts <n>         Override maxAttempts config (default: 3)
  --threshold <n>            Override similarity threshold (default: 0.7)
  --verbose, -v              Enable verbose output
  --output, -o <file>        Output file for report
  --help, -h                 Show this help

${chalk.cyan('Acceptance Criteria:')}
  AC1: Detects stuck - 3+ consecutive failures
  AC2: Detects circular - approach similar to failed approach
  AC3: Blocks execution if circular detected
  AC4: Marks subtask as "stuck" in implementation.yaml
  AC5: Escalates to human with complete context
  AC6: Suggests alternative approaches based on errors
  AC7: Configurable via autoClaude.recovery.maxAttempts

${chalk.cyan('Examples:')}
  stuck-detector check '[{"success":false,"error":"Module not found"}]'
  stuck-detector check '[{"success":false,"approach":"try A"}]' -a "try A again"
  stuck-detector report 1.1 '[{"success":false,"error":"timeout"}]'
  stuck-detector mark path/to/implementation.yaml 1.1 '[...]'
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Parse arguments
  const command = args[0];
  let verbose = false;
  let maxAttempts = DEFAULT_CONFIG.maxAttempts;
  let threshold = DEFAULT_CONFIG.similarityThreshold;
  let approach = null;
  let outputFile = null;
  const positionalArgs = [];

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--approach' || arg === '-a') {
      approach = args[++i];
    } else if (arg === '--max-attempts') {
      maxAttempts = parseInt(args[++i], 10);
    } else if (arg === '--threshold') {
      threshold = parseFloat(args[++i]);
    } else if (arg === '--output' || arg === '-o') {
      outputFile = args[++i];
    } else if (!arg.startsWith('-')) {
      positionalArgs.push(arg);
    }
  }

  try {
    const detector = new StuckDetector({
      maxAttempts,
      similarityThreshold: threshold,
      verbose,
    });

    switch (command) {
      case 'check': {
        if (positionalArgs.length < 1) {
          console.error(chalk.red('Error: attempts JSON required'));
          process.exit(1);
        }

        const attempts = JSON.parse(positionalArgs[0]);
        const result = detector.check(attempts, approach);

        console.log(JSON.stringify(result, null, 2));

        if (result.stuck) {
          console.log('');
          console.log(chalk.yellow('Execution is STUCK'));
          console.log(`Reason: ${result.reason}`);
          console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);

          if (result.suggestions.length > 0) {
            console.log('');
            console.log(chalk.cyan('Suggestions:'));
            result.suggestions.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
          }

          process.exit(1);
        }

        break;
      }

      case 'report': {
        if (positionalArgs.length < 2) {
          console.error(chalk.red('Error: subtaskId and attempts JSON required'));
          process.exit(1);
        }

        const subtaskId = positionalArgs[0];
        const attempts = JSON.parse(positionalArgs[1]);
        const report = detector.generateEscalationReport(subtaskId, attempts, {
          currentApproach: approach,
        });

        if (outputFile) {
          await fs.writeFile(outputFile, JSON.stringify(report, null, 2), 'utf8');
          console.log(chalk.green(`Report saved to: ${outputFile}`));
        } else {
          console.log(detector.formatReport(report));
        }

        break;
      }

      case 'mark': {
        if (positionalArgs.length < 3) {
          console.error(
            chalk.red('Error: implementation path, subtaskId, and attempts JSON required')
          );
          process.exit(1);
        }

        const implPath = positionalArgs[0];
        const subtaskId = positionalArgs[1];
        const attempts = JSON.parse(positionalArgs[2]);

        const result = detector.check(attempts, approach);

        if (!result.stuck) {
          console.log(chalk.yellow('Warning: Execution is not detected as stuck'));
          console.log('Use --force to mark anyway');
          process.exit(0);
        }

        await detector.markStuck(implPath, subtaskId, result);
        console.log(chalk.green(`Subtask ${subtaskId} marked as stuck`));

        break;
      }

      case 'test': {
        console.log(chalk.bold('\nRunning Stuck Detector tests...\n'));

        // Test 1: Consecutive failures
        console.log('Test 1: Consecutive failures detection');
        const attempts1 = [
          { success: false, error: 'Error 1' },
          { success: false, error: 'Error 2' },
          { success: false, error: 'Error 3' },
        ];
        const result1 = detector.check(attempts1);
        console.log(`  Stuck: ${result1.stuck}, Reason: ${result1.reason}`);
        console.log(
          `  ${result1.stuck && result1.reason === 'consecutive_failures' ? chalk.green('PASS') : chalk.red('FAIL')}`
        );

        // Test 2: Circular approach detection
        console.log('\nTest 2: Circular approach detection');
        const attempts2 = [
          { success: false, approach: 'install lodash and use map function', error: 'Failed' },
          { success: false, approach: 'npm install lodash then use map', error: 'Failed' },
        ];
        const result2 = detector.check(attempts2, 'install lodash then use map function');
        console.log(
          `  Stuck: ${result2.stuck}, Similarity: ${(result2.context.similarityScore || 0).toFixed(2)}`
        );
        console.log(
          `  ${result2.stuck && result2.reason.includes('circular') ? chalk.green('PASS') : chalk.red('FAIL')}`
        );

        // Test 3: Not stuck
        console.log('\nTest 3: Not stuck scenario');
        const attempts3 = [
          { success: true },
          { success: false, error: 'Minor error' },
          { success: true },
        ];
        const result3 = detector.check(attempts3);
        console.log(`  Stuck: ${result3.stuck}`);
        console.log(`  ${!result3.stuck ? chalk.green('PASS') : chalk.red('FAIL')}`);

        // Test 4: Suggestions generation
        console.log('\nTest 4: Suggestions generation');
        const attempts4 = [
          { success: false, error: 'Cannot find module lodash' },
          { success: false, error: 'Module not found: lodash' },
          { success: false, error: 'require failed for lodash' },
        ];
        const result4 = detector.check(attempts4);
        console.log(`  Suggestions count: ${result4.suggestions.length}`);
        console.log(`  First suggestion: ${result4.suggestions[0]?.substring(0, 50)}...`);
        console.log(
          `  ${result4.suggestions.length > 0 ? chalk.green('PASS') : chalk.red('FAIL')}`
        );

        // Test 5: Report generation
        console.log('\nTest 5: Report generation');
        const report = detector.generateEscalationReport('1.1', attempts4);
        console.log(`  Report sections: summary, attemptHistory, analysis, recommendations`);
        console.log(`  Severity: ${report.severity}`);
        console.log(
          `  ${report.severity && report.recommendations ? chalk.green('PASS') : chalk.red('FAIL')}`
        );

        console.log(chalk.bold('\nAll tests completed!\n'));

        break;
      }

      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        console.log('Use --help for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    if (verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  StuckDetector,
  quickCheck,
  loadConfig,
  DEFAULT_CONFIG,
  ERROR_PATTERNS,
  SUGGESTIONS,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
