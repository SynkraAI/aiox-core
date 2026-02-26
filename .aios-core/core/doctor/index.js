/**
 * AIOS Doctor — Environment Health Check Orchestrator
 *
 * Runs 12 modular checks against the AIOS environment and returns
 * structured results with optional --fix, --json, and --dry-run support.
 *
 * @module aios-core/doctor
 * @version 2.0.0
 * @story INS-4.1
 */

const path = require('path');
const { loadChecks } = require('./checks');
const { formatText } = require('./formatters/text');
const { formatJson } = require('./formatters/json');
const { applyFixes } = require('./fix-handler');

const DOCTOR_VERSION = '2.0.0';

/**
 * Run all doctor checks
 *
 * @param {Object} options
 * @param {boolean} [options.fix=false] - Auto-correct fixable issues
 * @param {boolean} [options.json=false] - Output as JSON
 * @param {boolean} [options.dryRun=false] - Show what --fix would do
 * @param {boolean} [options.quiet=false] - Minimal output
 * @param {string} [options.projectRoot] - Project root (defaults to cwd)
 * @returns {Promise<Object>} Doctor results
 */
async function runDoctorChecks(options = {}) {
  const {
    fix = false,
    json = false,
    dryRun = false,
    quiet = false,
    projectRoot = process.cwd(),
  } = options;

  const context = {
    projectRoot,
    frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
    options: { fix, json, dryRun, quiet },
  };

  // Load and run all checks
  const checks = loadChecks();
  const results = [];

  for (const checkModule of checks) {
    try {
      const result = await checkModule.run(context);
      results.push(result);
    } catch (error) {
      results.push({
        check: checkModule.name || 'unknown',
        status: 'FAIL',
        message: `Check threw error: ${error.message}`,
        fixCommand: null,
      });
    }
  }

  // Apply fixes if requested
  let fixResults = null;
  if (fix || dryRun) {
    fixResults = await applyFixes(results, context);
  }

  // Build summary
  const summary = {
    pass: results.filter((r) => r.status === 'PASS').length,
    warn: results.filter((r) => r.status === 'WARN').length,
    fail: results.filter((r) => r.status === 'FAIL').length,
    info: results.filter((r) => r.status === 'INFO').length,
  };

  const output = {
    version: DOCTOR_VERSION,
    timestamp: new Date().toISOString(),
    summary,
    checks: results,
    fixResults,
  };

  // Format output
  if (json) {
    return { formatted: formatJson(output), data: output };
  }

  return { formatted: formatText(output, { quiet }), data: output };
}

module.exports = { runDoctorChecks, DOCTOR_VERSION };
