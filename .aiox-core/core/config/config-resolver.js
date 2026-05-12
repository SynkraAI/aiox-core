/**
 * Configuration Resolver — Layered Config Hierarchy
 *
 * Implements the 5-level configuration hierarchy defined in ADR-PRO-002:
 *   L1 Framework → L2 Project → Pro Extension → L3 App → L4 Local → L5 User
 *
 * Provides:
 * - resolveConfig(projectRoot, options) — main entry point
 * - isLegacyMode(projectRoot) — detects monolithic core-config.yaml
 * - loadLayeredConfig(projectRoot, options) — new layered loading
 * - loadLegacyConfig(projectRoot) — backward-compatible monolithic loading
 * - setUserConfigValue(key, value) — write to L5 user config
 * - toggleUserProfile() — toggle user_profile bob↔advanced
 *
 * Integrates with:
 * - ConfigCache (config-cache.js) — TTL-based caching
 * - deepMerge (merge-utils.js) — merge strategy
 * - interpolateEnvVars (env-interpolator.js) — ${VAR} resolution
 *
 * @module core/config/config-resolver
 * @version 1.0.0
 * @created 2026-02-05 (Story PRO-4)
 * @see docs/architecture/adr/adr-pro-002-configuration-hierarchy.md
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const { deepMerge } = require('./merge-utils');
const { interpolateEnvVars, lintEnvPatterns } = require('./env-interpolator');
const { globalConfigCache } = require('./config-cache');

// ---------------------------------------------------------------------------
// JSON Schema validation (Story 12.2)
// ---------------------------------------------------------------------------

let _ajvInstance = null;
let _schemaCache = {};

/**
 * Schema file mapping for each config level.
 */
const SCHEMA_FILES = {
  framework: 'framework-config.schema.json',
  project: 'project-config.schema.json',
  local: 'local-config.schema.json',
  user: 'user-config.schema.json',
};

/**
 * Get or create the shared Ajv instance (lazy-loaded).
 *
 * @returns {Object} Ajv instance
 */
function getAjvInstance() {
  if (!_ajvInstance) {
    const Ajv = require('ajv');
    const addFormats = require('ajv-formats');
    _ajvInstance = new Ajv({ allErrors: true, strict: false });
    addFormats(_ajvInstance);
  }
  return _ajvInstance;
}

/**
 * Load a JSON Schema from the schemas/ directory.
 *
 * @param {string} schemaFileName - Schema file name
 * @returns {Object|null} Parsed schema or null if not found
 */
function loadSchema(schemaFileName) {
  if (_schemaCache[schemaFileName]) {
    return _schemaCache[schemaFileName];
  }

  const schemaPath = path.join(__dirname, 'schemas', schemaFileName);

  try {
    if (!fs.existsSync(schemaPath)) {
      return null;
    }
    const content = fs.readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(content);
    _schemaCache[schemaFileName] = schema;
    return schema;
  } catch {
    return null;
  }
}

/**
 * Validate config data against a JSON Schema for the given level.
 *
 * Returns warnings (does not throw) for graceful degradation.
 *
 * @param {string} level - Config level: 'framework' | 'project' | 'local' | 'user'
 * @param {Object} data - Config data to validate
 * @param {string} filePath - Source file path (for error messages)
 * @returns {string[]} Validation warnings (empty if valid)
 */
function validateConfig(level, data, filePath) {
  const warnings = [];
  const schemaFile = SCHEMA_FILES[level];

  if (!schemaFile) {
    return warnings;
  }

  const schema = loadSchema(schemaFile);
  if (!schema) {
    return warnings;
  }

  try {
    const ajv = getAjvInstance();
    const validate = ajv.compile(schema);
    const isValid = validate(data);

    if (!isValid && validate.errors) {
      for (const err of validate.errors) {
        const field = err.instancePath ? err.instancePath.replace(/^\//, '') : err.params?.missingProperty || 'unknown';
        warnings.push(`${filePath} inválido: campo '${field}' ${err.message}`);
      }
    }
  } catch {
    // Graceful: if ajv fails, skip validation
  }

  return warnings;
}

/**
 * Clear the schema cache (useful for testing).
 */
function clearSchemaCache() {
  _schemaCache = {};
  _ajvInstance = null;
}

/**
 * Standard config file paths relative to project root.
 */
const CONFIG_FILES = {
  framework: '.aiox-core/framework-config.yaml',
  project: '.aiox-core/project-config.yaml',
  pro: 'pro/pro-config.yaml',
  local: '.aiox-core/local-config.yaml',
  legacy: '.aiox-core/core-config.yaml',
  user: path.join(os.homedir(), '.aiox', 'user-config.yaml'),
};

/**
 * Level identifiers for debug/tracing.
 */
const LEVELS = {
  framework: 'L1',
  project: 'L2',
  pro: 'Pro',
  app: 'L3',
  local: 'L4',
  user: 'L5',
  legacy: 'Legacy',
};

// ---------------------------------------------------------------------------
// YAML loading helpers
// ---------------------------------------------------------------------------

/**
 * Load and parse a YAML file. Returns null if file doesn't exist.
 *
 * @param {string} projectRoot - Project root directory
 * @param {string} relativePath - Path relative to projectRoot
 * @returns {{ data: Object|null, path: string }} Parsed YAML or null
 */
function loadYaml(projectRoot, relativePath) {
  const fullPath = path.join(projectRoot, relativePath);

  try {
    if (!fs.existsSync(fullPath)) {
      return { data: null, path: fullPath };
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const data = yaml.load(content) || {};
    return { data, path: fullPath };
  } catch (error) {
    throw new Error(`Failed to parse YAML at ${fullPath}: ${error.message}`);
  }
}

/**
 * Load and parse a YAML file from an absolute path.
 * Returns null if file doesn't exist. Graceful on parse errors.
 *
 * @param {string} absolutePath - Absolute file path
 * @returns {{ data: Object|null, path: string }} Parsed YAML or null
 */
function loadYamlAbsolute(absolutePath) {
  try {
    if (!fs.existsSync(absolutePath)) {
      return { data: null, path: absolutePath };
    }

    const content = fs.readFileSync(absolutePath, 'utf8');
    const data = yaml.load(content) || {};
    return { data, path: absolutePath };
  } catch (_error) {
    // Graceful: user config may be malformed — treat as missing
    return { data: null, path: absolutePath };
  }
}

// ---------------------------------------------------------------------------
// Legacy detection
// ---------------------------------------------------------------------------

/**
 * Detect if the project uses the monolithic core-config.yaml format.
 *
 * Legacy mode: core-config.yaml exists but framework-config.yaml does NOT.
 * This means the project hasn't been migrated to layered config yet.
 *
 * @param {string} projectRoot - Project root directory
 * @returns {boolean} True if legacy mode
 */
function isLegacyMode(projectRoot) {
  const hasLegacy = fs.existsSync(path.join(projectRoot, CONFIG_FILES.legacy));
  const hasFramework = fs.existsSync(path.join(projectRoot, CONFIG_FILES.framework));
  return hasLegacy && !hasFramework;
}

// ---------------------------------------------------------------------------
// Layered config loading
// ---------------------------------------------------------------------------

/**
 * Load configuration using the layered hierarchy.
 *
 * Order: L1 → L2 → Pro → L3 → L4 → L5
 * Each level deep-merges onto the previous result.
 *
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Load options
 * @param {string} [options.appDir] - App directory for L3 config
 * @param {boolean} [options.debug] - Collect source-tracking metadata
 * @returns {Object} result
 * @returns {Object} result.config - Merged configuration
 * @returns {Object} [result.sources] - Per-key source tracking (when debug=true)
 * @returns {string[]} result.warnings - Lint/interpolation warnings
 */
function loadLayeredConfig(projectRoot, options = {}) {
  const warnings = [];
  const sources = options.debug ? {} : null;

  // L1: Framework (required — ships with npm package)
  const l1 = loadYaml(projectRoot, CONFIG_FILES.framework);
  let config = l1.data || {};

  if (options.debug && l1.data) {
    trackSources(sources, l1.data, LEVELS.framework, CONFIG_FILES.framework);
  }

  // Lint L1 for env patterns (should not contain ${...})
  if (l1.data) {
    const l1Lint = lintEnvPatterns(l1.data, CONFIG_FILES.framework);
    if (l1Lint.length > 0) {
      warnings.push(...l1Lint.map(w => `[LINT] ${w}`));
    }
    // Validate L1 against schema
    const l1Validation = validateConfig('framework', l1.data, CONFIG_FILES.framework);
    if (l1Validation.length > 0) {
      warnings.push(...l1Validation.map(w => `[SCHEMA] ${w}`));
    }
  }

  // L2: Project (optional)
  const l2 = loadYaml(projectRoot, CONFIG_FILES.project);
  if (l2.data) {
    config = deepMerge(config, l2.data);
    if (options.debug) {
      trackSources(sources, l2.data, LEVELS.project, CONFIG_FILES.project);
    }
    // Lint L2 for env patterns
    const l2Lint = lintEnvPatterns(l2.data, CONFIG_FILES.project);
    if (l2Lint.length > 0) {
      warnings.push(...l2Lint.map(w => `[LINT] ${w}`));
    }
    // Validate L2 against schema
    const l2Validation = validateConfig('project', l2.data, CONFIG_FILES.project);
    if (l2Validation.length > 0) {
      warnings.push(...l2Validation.map(w => `[SCHEMA] ${w}`));
    }
  }

  // Pro Extension (optional — only when pro/ submodule is present)
  const pro = loadYaml(projectRoot, CONFIG_FILES.pro);
  if (pro.data) {
    config = deepMerge(config, pro.data);
    if (options.debug) {
      trackSources(sources, pro.data, LEVELS.pro, CONFIG_FILES.pro);
    }
  }

  // L3: App (optional — only when appDir is specified)
  if (options.appDir) {
    const appConfigPath = path.join(options.appDir, 'aiox-app.config.yaml');
    const l3 = loadYaml(projectRoot, appConfigPath);
    if (l3.data) {
      config = deepMerge(config, l3.data);
      if (options.debug) {
        trackSources(sources, l3.data, LEVELS.app, appConfigPath);
      }
    }
  }

  // L4: Local (optional — machine-specific, gitignored)
  const l4 = loadYaml(projectRoot, CONFIG_FILES.local);
  if (l4.data) {
    config = deepMerge(config, l4.data);
    if (options.debug) {
      trackSources(sources, l4.data, LEVELS.local, CONFIG_FILES.local);
    }
    // Validate L4 against schema
    const l4Validation = validateConfig('local', l4.data, CONFIG_FILES.local);
    if (l4Validation.length > 0) {
      warnings.push(...l4Validation.map(w => `[SCHEMA] ${w}`));
    }
  }

  // L5: User (optional — global user preferences, cross-project, ~/.aiox/user-config.yaml)
  const l5 = loadYamlAbsolute(CONFIG_FILES.user);
  if (l5.data) {
    config = deepMerge(config, l5.data);
    if (options.debug) {
      trackSources(sources, l5.data, LEVELS.user, CONFIG_FILES.user);
    }
    // Validate L5 against schema
    const l5Validation = validateConfig('user', l5.data, CONFIG_FILES.user);
    if (l5Validation.length > 0) {
      warnings.push(...l5Validation.map(w => `[SCHEMA] ${w}`));
    }
  }

  return { config, sources, warnings };
}

/**
 * Load configuration in legacy mode (monolithic core-config.yaml).
 *
 * @param {string} projectRoot - Project root directory
 * @returns {Object} result
 * @returns {Object} result.config - Parsed configuration
 * @returns {string[]} result.warnings - Deprecation warnings
 */
function loadLegacyConfig(projectRoot) {
  const warnings = [];
  const legacy = loadYaml(projectRoot, CONFIG_FILES.legacy);

  if (!legacy.data) {
    throw new Error(`Legacy config file not found: ${CONFIG_FILES.legacy}`);
  }

  const suppressDeprecation = process.env.AIOX_SUPPRESS_DEPRECATION === 'true'
    || process.env.AIOX_SUPPRESS_DEPRECATION === '1';

  if (!suppressDeprecation) {
    warnings.push(
      '[DEPRECATION] Monolithic core-config.yaml detected. '
      + 'Run `aiox config migrate` to split into layered config files. '
      + 'Monolithic format will be removed in v4.0.0. '
      + 'Set AIOX_SUPPRESS_DEPRECATION=true to silence this warning.',
    );
  }

  return { config: legacy.data, sources: null, warnings };
}

// ---------------------------------------------------------------------------
// Source tracking (debug mode)
// ---------------------------------------------------------------------------

/**
 * Track which level each config key came from (for --debug output).
 *
 * @param {Object} sources - Sources accumulator { 'key.path': { level, file } }
 * @param {Object} data - Config data from a level
 * @param {string} level - Level label (L1, L2, Pro, L3, L4)
 * @param {string} file - Source file path
 * @param {string} [prefix] - Key prefix for nested tracking
 */
function trackSources(sources, data, level, file, prefix = '') {
  if (!sources || !data) return;

  for (const [key, value] of Object.entries(data)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Track the object key itself
      sources[fullKey] = { level, file };
      // Recurse into nested objects
      trackSources(sources, value, level, file, fullKey);
    } else {
      sources[fullKey] = { level, file };
    }
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Resolve the final configuration for the project.
 *
 * Detects legacy vs layered mode automatically. Caches the resolved config
 * via ConfigCache (TTL-based). Interpolates env vars after merge.
 *
 * @param {string} projectRoot - Project root directory
 * @param {Object} [options] - Options
 * @param {string} [options.appDir] - App directory for L3 (monorepo)
 * @param {boolean} [options.debug] - Enable source tracking
 * @param {boolean} [options.skipCache] - Bypass cache
 * @returns {Object} result
 * @returns {Object} result.config - Final resolved config
 * @returns {Object} [result.sources] - Source tracking (debug only)
 * @returns {string[]} result.warnings - All warnings
 * @returns {boolean} result.legacy - Whether legacy mode was used
 */
function resolveConfig(projectRoot, options = {}) {
  const cacheKey = `resolved:${projectRoot}:${options.appDir || 'root'}:${options.debug ? 'debug' : 'std'}`;

  // Check cache (unless explicitly skipped)
  if (!options.skipCache) {
    const cached = globalConfigCache.get(cacheKey);
    if (cached) return cached;
  }

  let result;
  const isLegacy = isLegacyMode(projectRoot);

  if (isLegacy) {
    result = loadLegacyConfig(projectRoot);
    result.legacy = true;
  } else {
    result = loadLayeredConfig(projectRoot, options);
    result.legacy = false;
  }

  // Interpolate environment variables
  const envWarnings = [];
  result.config = interpolateEnvVars(result.config, { warnings: envWarnings });

  if (envWarnings.length > 0) {
    result.warnings.push(...envWarnings.map(w => `[ENV] ${w}`));
  }

  // Cache the result
  globalConfigCache.set(cacheKey, result);

  return result;
}

/**
 * Get the raw config from a specific level (no merge, no interpolation).
 *
 * @param {string} projectRoot - Project root directory
 * @param {string} level - Level: 'framework' | 'project' | 'pro' | 'local' | 'legacy'
 * @param {Object} [options] - Options
 * @param {string} [options.appDir] - App directory for level 'app'
 * @returns {Object|null} Raw config or null if file doesn't exist
 */
function getConfigAtLevel(projectRoot, level, options = {}) {
  let relativePath;

  switch (level) {
    case 'framework': case '1': case 'L1':
      relativePath = CONFIG_FILES.framework;
      break;
    case 'project': case '2': case 'L2':
      relativePath = CONFIG_FILES.project;
      break;
    case 'pro': case 'Pro':
      relativePath = CONFIG_FILES.pro;
      break;
    case 'app': case '3': case 'L3':
      if (!options.appDir) return null;
      relativePath = path.join(options.appDir, 'aiox-app.config.yaml');
      break;
    case 'local': case '4': case 'L4':
      relativePath = CONFIG_FILES.local;
      break;
    case 'user': case '5': case 'L5': {
      const { data } = loadYamlAbsolute(CONFIG_FILES.user);
      return data;
    }
    case 'legacy':
      relativePath = CONFIG_FILES.legacy;
      break;
    default:
      throw new Error(`Unknown config level: ${level}`);
  }

  const { data } = loadYaml(projectRoot, relativePath);
  return data;
}

// ---------------------------------------------------------------------------
// User config write operations (Story 12.1 — L5 User layer)
// ---------------------------------------------------------------------------

/**
 * Valid user profile values.
 */
const VALID_USER_PROFILES = ['bob', 'advanced'];

/**
 * Ensure the ~/.aiox/ directory exists with secure permissions.
 *
 * @returns {string} Path to ~/.aiox/ directory
 */
function ensureUserConfigDir() {
  const dir = path.dirname(CONFIG_FILES.user);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  return dir;
}

/**
 * Set a value in the user config file (~/.aiox/user-config.yaml).
 * Creates the file and directory if they don't exist.
 * Invalidates the config cache after writing.
 *
 * @param {string} key - Config key to set
 * @param {*} value - Value to set
 * @returns {Object} Updated user config
 */
function setUserConfigValue(key, value) {
  ensureUserConfigDir();

  let config = {};
  try {
    if (fs.existsSync(CONFIG_FILES.user)) {
      const content = fs.readFileSync(CONFIG_FILES.user, 'utf8');
      config = yaml.load(content) || {};
    }
  } catch {
    config = {};
  }

  config[key] = value;

  const yamlContent = yaml.dump(config, { lineWidth: -1 });
  fs.writeFileSync(CONFIG_FILES.user, yamlContent, 'utf8');

  globalConfigCache.clear();

  return config;
}

/**
 * Toggle user_profile between 'bob' and 'advanced'.
 * Reads current value, flips it, writes back, and invalidates cache.
 *
 * @returns {{ previous: string, current: string }} Previous and new profile values
 */
function toggleUserProfile() {
  let config = {};
  try {
    if (fs.existsSync(CONFIG_FILES.user)) {
      const content = fs.readFileSync(CONFIG_FILES.user, 'utf8');
      config = yaml.load(content) || {};
    }
  } catch {
    config = {};
  }

  const previous = config.user_profile || 'advanced';
  const current = previous === 'bob' ? 'advanced' : 'bob';

  setUserConfigValue('user_profile', current);

  return { previous, current };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  resolveConfig,
  isLegacyMode,
  loadLayeredConfig,
  loadLegacyConfig,
  getConfigAtLevel,
  setUserConfigValue,
  toggleUserProfile,
  ensureUserConfigDir,
  validateConfig,
  clearSchemaCache,
  CONFIG_FILES,
  LEVELS,
  SCHEMA_FILES,
  VALID_USER_PROFILES,
};
