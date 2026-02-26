/**
 * Reporter Manager
 *
 * Manages report generation for health check results.
 * Supports multiple output formats: Console, Markdown, JSON.
 *
 * @module aios-core/health-check/reporters
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const MarkdownReporter = require('./markdown');
const JSONReporter = require('./json');
const ConsoleReporter = require('./console');

/**
 * Reporter Manager
 *
 * Orchestrates report generation across multiple formats.
 *
 * @class ReporterManager
 */
class ReporterManager {
  /**
   * Create a new ReporterManager
   * @param {Object} config - Configuration options
   * @param {string} [config.output.format='console'] - Default output format
   * @param {boolean} [config.output.verbose=false] - Verbose output
   * @param {boolean} [config.output.colors=true] - Use colors in console
   */
  constructor(config = {}) {
    this.config = config;
    this.defaultFormat = config.output?.format || 'console';
    this.verbose = config.output?.verbose || false;

    // Initialize reporters
    this.reporters = {
      console: new ConsoleReporter(config),
      markdown: new MarkdownReporter(config),
      json: new JSONReporter(config),
    };
  }

  /**
   * Generate report in specified format(s)
   * @param {Object[]} checkResults - Check results
   * @param {Object} scores - Score summary
   * @param {Object[]} healingResults - Healing results
   * @param {Object} runConfig - Run configuration
   * @returns {Promise<Object>} Generated report(s)
   */
  async generate(checkResults, scores, healingResults, runConfig = {}) {
    const format = runConfig.output?.format || this.defaultFormat;
    const formats = Array.isArray(format) ? format : [format];

    const reports = {};

    for (const fmt of formats) {
      const reporter = this.reporters[fmt];
      if (!reporter) {
        console.warn(`Unknown report format: ${fmt}`);
        continue;
      }

      reports[fmt] = await reporter.generate({
        checkResults,
        scores,
        healingResults,
        config: runConfig,
        timestamp: new Date().toISOString(),
      });
    }

    // Return single report if only one format requested
    if (formats.length === 1) {
      return reports[formats[0]];
    }

    return reports;
  }

  /**
   * Get available report formats
   * @returns {string[]} Array of format names
   */
  getFormats() {
    return Object.keys(this.reporters);
  }

  /**
   * Get a specific reporter
   * @param {string} format - Report format
   * @returns {Object|null} Reporter instance or null
   */
  getReporter(format) {
    return this.reporters[format] || null;
  }

  /**
   * Register a custom reporter
   * @param {string} name - Reporter name
   * @param {Object} reporter - Reporter instance
   */
  registerReporter(name, reporter) {
    if (typeof reporter.generate !== 'function') {
      throw new Error('Reporter must implement generate() method');
    }
    this.reporters[name] = reporter;
  }
}

module.exports = ReporterManager;
module.exports.MarkdownReporter = MarkdownReporter;
module.exports.JSONReporter = JSONReporter;
module.exports.ConsoleReporter = ConsoleReporter;
