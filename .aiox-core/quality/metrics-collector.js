/**
 * Quality Metrics Collector
 *
 * Collects and manages quality gate metrics across all layers.
 * Provides APIs for recording runs, calculating aggregates, and cleanup.
 *
 * @module quality/metrics-collector
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Default configuration
const DEFAULT_DATA_FILE = '.aiox/data/quality-metrics.json';
const DEFAULT_RETENTION_DAYS = 30;

/**
 * Create empty metrics structure
 * @returns {Object} Empty metrics object
 */
function createEmptyMetrics() {
  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    retentionDays: DEFAULT_RETENTION_DAYS,
    layers: {
      layer1: {
        passRate: 0,
        avgTimeMs: 0,
        totalRuns: 0,
        lastRun: null,
      },
      layer2: {
        passRate: 0,
        avgTimeMs: 0,
        totalRuns: 0,
        lastRun: null,
        autoCatchRate: 0,
        coderabbit: {
          active: false,
          findingsCount: 0,
          severityBreakdown: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
          },
        },
        quinn: {
          findingsCount: 0,
          topCategories: [],
        },
      },
      layer3: {
        passRate: 0,
        avgTimeMs: 0,
        totalRuns: 0,
        lastRun: null,
      },
    },
    trends: {
      autoCatchRate: [],
      passRates: [],
    },
    history: [],
  };
}

/**
 * MetricsCollector class
 * Manages quality gate metrics collection, storage, and aggregation
 */
class MetricsCollector {
  /**
   * Create a new MetricsCollector instance
   * @param {Object} options - Configuration options
   * @param {string} [options.dataFile] - Path to data file
   * @param {number} [options.retentionDays] - Days to retain history
   * @param {string} [options.projectRoot] - Project root directory
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.dataFile = options.dataFile || path.join(this.projectRoot, DEFAULT_DATA_FILE);
    this.retentionDays = options.retentionDays || DEFAULT_RETENTION_DAYS;
    this._metrics = null;
    this._validator = null;
    this._lockFile = `${this.dataFile}.lock`;
  }

  /**
   * Initialize the JSON schema validator
   * @private
   */
  async _initValidator() {
    if (this._validator) return;

    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);

    const schemaPath = path.join(
      this.projectRoot,
      '.aiox-core/quality/schemas/quality-metrics.schema.json',
    );

    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      this._validator = ajv.compile(schema);
    } catch (error) {
      // Schema file not found - validation will be skipped
      console.warn(`Warning: Schema file not found at ${schemaPath}`);
      this._validator = null;
    }
  }

  /**
   * Validate metrics against schema
   * @param {Object} metrics - Metrics object to validate
   * @returns {Object} Validation result { valid, errors }
   */
  async validate(metrics) {
    await this._initValidator();

    if (!this._validator) {
      return { valid: true, errors: null };
    }

    const valid = this._validator(metrics);
    return {
      valid,
      errors: valid ? null : this._validator.errors,
    };
  }

  /**
   * Acquire file lock for thread-safe operations
   * @private
   * @param {number} [timeout=5000] - Lock timeout in ms
   * @returns {Promise<boolean>} Whether lock was acquired
   */
  async _acquireLock(timeout = 5000) {
    const startTime = Date.now();
    const retryDelay = 50;

    while (Date.now() - startTime < timeout) {
      try {
        // Try to create lock file exclusively
        await fs.writeFile(this._lockFile, String(process.pid), { flag: 'wx' });
        return true;
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Lock exists, check if stale (> 30s old)
          try {
            const stat = await fs.stat(this._lockFile);
            if (Date.now() - stat.mtimeMs > 30000) {
              await fs.unlink(this._lockFile);
              continue;
            }
          } catch {
            // Lock file gone, retry
            continue;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else if (error.code === 'ENOENT') {
          // Directory doesn't exist, create it
          await fs.mkdir(path.dirname(this._lockFile), { recursive: true });
        } else {
          throw error;
        }
      }
    }
    return false;
  }

  /**
   * Release file lock
   * @private
   */
  async _releaseLock() {
    try {
      await fs.unlink(this._lockFile);
    } catch {
      // Ignore errors on unlock
    }
  }

  /**
   * Ensure data directory exists
   * @private
   */
  async _ensureDataDir() {
    const dir = path.dirname(this.dataFile);
    await fs.mkdir(dir, { recursive: true });
  }

  /**
   * Load metrics from file
   * @returns {Promise<Object>} Metrics object
   */
  async load() {
    if (this._metrics) return this._metrics;

    try {
      const content = await fs.readFile(this.dataFile, 'utf8');
      this._metrics = JSON.parse(content);

      // Validate loaded metrics
      const { valid, errors } = await this.validate(this._metrics);
      if (!valid) {
        console.warn('Warning: Loaded metrics failed validation:', errors);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create empty metrics
        this._metrics = createEmptyMetrics();
        this._metrics.retentionDays = this.retentionDays;
      } else {
        throw new Error(`Failed to load metrics: ${error.message}`);
      }
    }

    return this._metrics;
  }

  /**
   * Save metrics to file (thread-safe)
   * @param {Object} [metrics] - Metrics to save (uses internal if not provided)
   * @returns {Promise<void>}
   */
  async save(metrics = null) {
    const metricsToSave = metrics || this._metrics;
    if (!metricsToSave) {
      throw new Error('No metrics to save');
    }

    // Validate before saving
    const { valid, errors } = await this.validate(metricsToSave);
    if (!valid) {
      throw new Error(`Invalid metrics: ${JSON.stringify(errors)}`);
    }

    const locked = await this._acquireLock();
    if (!locked) {
      throw new Error('Could not acquire lock for saving metrics');
    }

    try {
      await this._ensureDataDir();
      metricsToSave.lastUpdated = new Date().toISOString();
      await fs.writeFile(
        this.dataFile,
        JSON.stringify(metricsToSave, null, 2),
        'utf8',
      );
      this._metrics = metricsToSave;
    } finally {
      await this._releaseLock();
    }
  }

  /**
   * Record a run from any layer
   * @param {number} layer - Layer number (1, 2, or 3)
   * @param {Object} result - Run result
   * @param {boolean} result.passed - Whether the run passed
   * @param {number} [result.durationMs] - Duration in milliseconds
   * @param {number} [result.findingsCount] - Number of findings
   * @param {Object} [result.metadata] - Additional metadata
   * @returns {Promise<Object>} The recorded run
   */
  async recordRun(layer, result) {
    if (![1, 2, 3].includes(layer)) {
      throw new Error('Layer must be 1, 2, or 3');
    }

    const metrics = await this.load();

    // Enforce retention policy before adding new entries (Story SQS-10 nitpick)
    // This prevents unbounded growth of history array
    await this._enforceRetentionPolicy(metrics);

    const runRecord = {
      timestamp: new Date().toISOString(),
      layer,
      passed: Boolean(result.passed),
      durationMs: result.durationMs || 0,
      findingsCount: result.findingsCount || 0,
      metadata: result.metadata || {},
    };

    // Add to history
    metrics.history.push(runRecord);

    // Recalculate aggregates for this layer
    await this._recalculateLayer(layer);

    // Update trends
    await this._updateTrends();

    await this.save();

    return runRecord;
  }

  /**
   * Record Layer 1 pre-commit run
   * @param {Object} result - Run result
   * @returns {Promise<Object>} The recorded run
   */
  async recordPreCommit(result) {
    return this.recordRun(1, result);
  }

  /**
   * Record Layer 2 PR review run
   * @param {Object} result - Run result with optional coderabbit/quinn data
   * @returns {Promise<Object>} The recorded run
   */
  async recordPRReview(result) {
    const metrics = await this.load();

    // Update CodeRabbit metrics if provided
    if (result.coderabbit) {
      metrics.layers.layer2.coderabbit = {
        active: true,
        findingsCount: (metrics.layers.layer2.coderabbit?.findingsCount || 0) +
          (result.coderabbit.findingsCount || 0),
        severityBreakdown: {
          critical: (metrics.layers.layer2.coderabbit?.severityBreakdown?.critical || 0) +
            (result.coderabbit.severityBreakdown?.critical || 0),
          high: (metrics.layers.layer2.coderabbit?.severityBreakdown?.high || 0) +
            (result.coderabbit.severityBreakdown?.high || 0),
          medium: (metrics.layers.layer2.coderabbit?.severityBreakdown?.medium || 0) +
            (result.coderabbit.severityBreakdown?.medium || 0),
          low: (metrics.layers.layer2.coderabbit?.severityBreakdown?.low || 0) +
            (result.coderabbit.severityBreakdown?.low || 0),
        },
      };
    }

    // Update Quinn metrics if provided
    if (result.quinn) {
      const existingCategories = metrics.layers.layer2.quinn?.topCategories || [];
      const newCategories = result.quinn.topCategories || [];
      const allCategories = [...existingCategories, ...newCategories];

      // Keep top 5 most common categories
      const categoryCount = {};
      allCategories.forEach((cat) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => cat);

      metrics.layers.layer2.quinn = {
        findingsCount: (metrics.layers.layer2.quinn?.findingsCount || 0) +
          (result.quinn.findingsCount || 0),
        topCategories,
      };
    }

    // Calculate auto-catch rate
    const layer2History = metrics.history.filter((r) => r.layer === 2);
    if (layer2History.length > 0) {
      const totalFindings = layer2History.reduce(
        (sum, r) => sum + (r.findingsCount || 0),
        0,
      );
      // Auto-catch rate = findings caught automatically / total potential issues
      // Estimate: if passed with 0 findings, assume 1 potential issue caught
      const totalRuns = layer2History.length;
      metrics.layers.layer2.autoCatchRate = totalFindings / (totalRuns || 1);
    }

    this._metrics = metrics;

    return this.recordRun(2, result);
  }

  /**
   * Record Layer 3 human review run
   * @param {Object} result - Run result
   * @returns {Promise<Object>} The recorded run
   */
  async recordHumanReview(result) {
    return this.recordRun(3, result);
  }

  /**
   * Get current metrics summary
   * @returns {Promise<Object>} Current metrics
   */
  async getMetrics() {
    return this.load();
  }

  /**
   * Recalculate aggregates for a specific layer
   * @private
   * @param {number} layer - Layer number
   */
  async _recalculateLayer(layer) {
    const metrics = await this.load();
    const layerKey = `layer${layer}`;
    const layerHistory = metrics.history.filter((r) => r.layer === layer);

    if (layerHistory.length === 0) {
      return;
    }

    // Calculate pass rate
    const passedRuns = layerHistory.filter((r) => r.passed).length;
    metrics.layers[layerKey].passRate = passedRuns / layerHistory.length;

    // Calculate average time
    const totalTime = layerHistory.reduce((sum, r) => sum + (r.durationMs || 0), 0);
    metrics.layers[layerKey].avgTimeMs = Math.round(totalTime / layerHistory.length);

    // Update total runs and last run
    metrics.layers[layerKey].totalRuns = layerHistory.length;
    metrics.layers[layerKey].lastRun = layerHistory[layerHistory.length - 1].timestamp;

    this._metrics = metrics;
  }

  /**
   * Recalculate all aggregates from history
   * @returns {Promise<void>}
   */
  async recalculate() {
    await this._recalculateLayer(1);
    await this._recalculateLayer(2);
    await this._recalculateLayer(3);
    await this._updateTrends();
    await this.save();
  }

  /**
   * Update trend data
   * @private
   */
  async _updateTrends() {
    const metrics = await this.load();
    const today = new Date().toISOString().split('T')[0];

    // Calculate daily pass rate
    const todayRuns = metrics.history.filter((r) =>
      r.timestamp.startsWith(today),
    );

    if (todayRuns.length > 0) {
      const passedToday = todayRuns.filter((r) => r.passed).length;
      const passRate = passedToday / todayRuns.length;

      // Update or add today's pass rate trend
      const existingIndex = metrics.trends.passRates.findIndex(
        (t) => t.date === today,
      );
      if (existingIndex >= 0) {
        metrics.trends.passRates[existingIndex].value = passRate;
      } else {
        metrics.trends.passRates.push({ date: today, value: passRate });
      }
    }

    // Update auto-catch rate trend (Layer 2)
    if (metrics.layers.layer2.autoCatchRate > 0) {
      const existingIndex = metrics.trends.autoCatchRate.findIndex(
        (t) => t.date === today,
      );
      if (existingIndex >= 0) {
        metrics.trends.autoCatchRate[existingIndex].value =
          metrics.layers.layer2.autoCatchRate;
      } else {
        metrics.trends.autoCatchRate.push({
          date: today,
          value: metrics.layers.layer2.autoCatchRate,
        });
      }
    }

    // Keep only last 30 days of trends
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    metrics.trends.passRates = metrics.trends.passRates.filter(
      (t) => t.date >= cutoffStr,
    );
    metrics.trends.autoCatchRate = metrics.trends.autoCatchRate.filter(
      (t) => t.date >= cutoffStr,
    );

    this._metrics = metrics;
  }

  /**
   * Cleanup old records beyond retention period
   * @returns {Promise<number>} Number of records removed
   */
  async cleanup() {
    const metrics = await this.load();
    const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    const originalCount = metrics.history.length;

    metrics.history = metrics.history.filter(
      (r) => new Date(r.timestamp).getTime() > cutoff,
    );

    const removedCount = originalCount - metrics.history.length;

    if (removedCount > 0) {
      // Recalculate aggregates after cleanup
      await this.recalculate();
    }

    return removedCount;
  }

  /**
   * Enforce retention policy inline (called before adding new entries)
   * This prevents unbounded growth of the history array.
   * @private
   * @param {Object} metrics - Metrics object to clean
   * @returns {Promise<void>}
   * @see CodeRabbit nitpick: Enforce retention policy to prevent unbounded growth
   */
  async _enforceRetentionPolicy(metrics) {
    const retentionMs = (metrics.retentionDays || this.retentionDays) * 24 * 60 * 60 * 1000;
    const cutoffTimestamp = Date.now() - retentionMs;

    const originalCount = metrics.history.length;
    metrics.history = metrics.history.filter(
      (entry) => new Date(entry.timestamp).getTime() > cutoffTimestamp,
    );

    const removedCount = originalCount - metrics.history.length;
    if (removedCount > 0) {
      console.log(`[metrics] Retention policy: removed ${removedCount} old entries (> ${metrics.retentionDays || this.retentionDays} days)`);
    }
  }

  /**
   * Get history for a specific layer
   * @param {number} layer - Layer number
   * @param {number} [limit] - Maximum records to return
   * @returns {Promise<Array>} History records
   */
  async getLayerHistory(layer, limit = 100) {
    const metrics = await this.load();
    const layerHistory = metrics.history
      .filter((r) => r.layer === layer)
      .slice(-limit);
    return layerHistory;
  }

  /**
   * Export metrics to various formats
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {Promise<string>} Exported data
   */
  async export(format = 'json') {
    const metrics = await this.load();

    if (format === 'csv') {
      // Export history as CSV
      const headers = ['timestamp', 'layer', 'passed', 'durationMs', 'findingsCount'];
      const rows = metrics.history.map((r) =>
        headers.map((h) => r[h] ?? '').join(','),
      );
      return [headers.join(','), ...rows].join('\n');
    }

    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Reset all metrics (use with caution)
   * @returns {Promise<void>}
   */
  async reset() {
    this._metrics = createEmptyMetrics();
    this._metrics.retentionDays = this.retentionDays;
    await this.save();
  }
}

module.exports = {
  MetricsCollector,
  createEmptyMetrics,
  DEFAULT_DATA_FILE,
  DEFAULT_RETENTION_DAYS,
};
