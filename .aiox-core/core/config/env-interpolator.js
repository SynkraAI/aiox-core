/**
 * Environment Variable Interpolator
 *
 * Resolves ${ENV_VAR} and ${ENV_VAR:-default} patterns in configuration values.
 * Applied at load time after merge, per ADR-PRO-002.
 *
 * Rules:
 * - ${VAR}: resolves to process.env.VAR; warns if missing, returns ''
 * - ${VAR:-default}: resolves to process.env.VAR or 'default' if unset
 * - Recursive: walks nested objects and arrays
 * - L1/L2 linting: warnOnCommittedSecrets() flags ${...} in framework/project files
 *
 * @module core/config/env-interpolator
 * @version 1.0.0
 * @created 2026-02-05 (Story PRO-4)
 * @see docs/architecture/adr/adr-pro-002-configuration-hierarchy.md
 */

const { isPlainObject } = require('./merge-utils');

/**
 * Regex for ${ENV_VAR} and ${ENV_VAR:-default_value}
 * Captures: group 1 = var name, group 2 = default value (optional, after :-)
 */
const ENV_VAR_PATTERN = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-(.*?))?\}/g;

/**
 * Interpolate environment variables in a string value.
 *
 * @param {string} value - String potentially containing ${VAR} patterns
 * @param {Object} options - Options
 * @param {string[]} options.warnings - Array to collect warning messages
 * @returns {string} Interpolated string
 */
function interpolateString(value, options = {}) {
  const warnings = options.warnings || [];

  return value.replace(ENV_VAR_PATTERN, (match, varName, defaultValue) => {
    const envValue = process.env[varName];

    if (envValue !== undefined) {
      return envValue;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    // Missing required env var (no default)
    warnings.push(`Missing environment variable: ${varName} (no default set)`);
    return '';
  });
}

/**
 * Recursively interpolate environment variables in a config object.
 *
 * Walks all nested objects and arrays. Only string values are interpolated.
 *
 * @param {*} config - Configuration value (object, array, or scalar)
 * @param {Object} options - Options
 * @param {string[]} options.warnings - Array to collect warning messages
 * @returns {*} Interpolated configuration
 */
function interpolateEnvVars(config, options = {}) {
  const warnings = options.warnings || [];

  if (typeof config === 'string') {
    return interpolateString(config, { warnings });
  }

  if (Array.isArray(config)) {
    return config.map(item => interpolateEnvVars(item, { warnings }));
  }

  if (isPlainObject(config)) {
    const result = {};
    for (const [key, value] of Object.entries(config)) {
      result[key] = interpolateEnvVars(value, { warnings });
    }
    return result;
  }

  // Numbers, booleans, null — return as-is
  return config;
}

/**
 * Check a config object for ${...} patterns that probably shouldn't be
 * in committed files (L1/L2). Returns an array of findings.
 *
 * @param {Object} config - Configuration to lint
 * @param {string} sourceFile - File name for reporting
 * @returns {string[]} Array of warning strings
 */
function lintEnvPatterns(config, sourceFile) {
  const findings = [];

  function walk(obj, path) {
    if (typeof obj === 'string' && ENV_VAR_PATTERN.test(obj)) {
      // Reset regex lastIndex after test()
      ENV_VAR_PATTERN.lastIndex = 0;
      findings.push(`${sourceFile}: ${path} contains env variable pattern: ${obj}`);
    } else if (isPlainObject(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        walk(value, path ? `${path}.${key}` : key);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => { walk(item, `${path}[${i}]`); });
    }
  }

  walk(config, '');
  return findings;
}

module.exports = {
  interpolateEnvVars,
  interpolateString,
  lintEnvPatterns,
  ENV_VAR_PATTERN,
};
