/**
 * Config Migration — Legacy core-config.yaml → L2 Project + L5 User
 *
 * Splits the monolithic core-config.yaml into:
 *   - .aiox-core/project-config.yaml (L2) — team-shared project settings
 *   - ~/.aiox/user-config.yaml (L5) — cross-project user preferences
 *
 * Safety:
 * - Creates backup before migration (core-config.backup.yaml)
 * - Idempotent: re-running does not duplicate or corrupt
 * - Keeps core-config.yaml as legacy fallback (does not delete)
 *
 * @module core/config/migrate-config
 * @version 1.0.0
 * @created 2026-02-05 (Story 12.2)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

/**
 * Fields that belong in L5 User config (~/.aiox/user-config.yaml).
 * These are user-specific, cross-project preferences.
 */
const USER_FIELDS = [
  'user_profile',
  'default_model',
  'default_language',
  'coderabbit_integration',
  'educational_mode',
];

/**
 * Fields that belong in L2 Project config (.aiox-core/project-config.yaml).
 * These are project-specific, team-shared settings.
 */
const PROJECT_FIELDS = [
  'project_name',
  'project_type',
  'environments',
  'deploy_target',
];

/**
 * Check if legacy core-config.yaml exists and framework-config.yaml does NOT.
 *
 * @param {string} projectRoot - Project root directory
 * @returns {boolean} True if in legacy mode
 */
function isLegacyMode(projectRoot) {
  const legacyPath = path.join(projectRoot, '.aiox-core', 'core-config.yaml');
  const frameworkPath = path.join(projectRoot, '.aiox-core', 'framework-config.yaml');
  return fs.existsSync(legacyPath) && !fs.existsSync(frameworkPath);
}

/**
 * Create a backup of the legacy config file.
 *
 * @param {string} projectRoot - Project root directory
 * @returns {string|null} Backup file path, or null if already backed up
 */
function createBackup(projectRoot) {
  const legacyPath = path.join(projectRoot, '.aiox-core', 'core-config.yaml');
  const backupPath = path.join(projectRoot, '.aiox-core', 'core-config.backup.yaml');

  if (!fs.existsSync(legacyPath)) {
    return null;
  }

  // Idempotent: skip if backup already exists
  if (fs.existsSync(backupPath)) {
    return backupPath;
  }

  fs.copyFileSync(legacyPath, backupPath);
  return backupPath;
}

/**
 * Extract user-level fields from legacy config.
 *
 * @param {Object} legacyConfig - Parsed legacy config
 * @returns {Object} User config fields
 */
function extractUserFields(legacyConfig) {
  const userConfig = {};

  for (const field of USER_FIELDS) {
    if (legacyConfig[field] !== undefined) {
      userConfig[field] = legacyConfig[field];
    }
  }

  // Default user_profile if not present
  if (!userConfig.user_profile) {
    userConfig.user_profile = 'advanced';
  }

  return userConfig;
}

/**
 * Extract project-level fields from legacy config.
 *
 * @param {Object} legacyConfig - Parsed legacy config
 * @returns {Object} Project config fields
 */
function extractProjectFields(legacyConfig) {
  const projectConfig = {};

  for (const field of PROJECT_FIELDS) {
    if (legacyConfig[field] !== undefined) {
      projectConfig[field] = legacyConfig[field];
    }
  }

  // Extract from nested 'project' key if present
  if (legacyConfig.project && typeof legacyConfig.project === 'object') {
    if (legacyConfig.project.type && !projectConfig.project_type) {
      projectConfig.project_type = legacyConfig.project.type;
    }
  }

  return projectConfig;
}

/**
 * Ensure the ~/.aiox/ directory exists.
 *
 * @returns {string} Path to ~/.aiox/ directory
 */
function ensureUserConfigDir() {
  const dir = path.join(os.homedir(), '.aiox');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  return dir;
}

/**
 * Write user config to ~/.aiox/user-config.yaml.
 * Merges with existing user config (does not overwrite existing fields).
 *
 * @param {Object} userFields - User config fields to write
 * @returns {string} Path to user config file
 */
function writeUserConfig(userFields) {
  ensureUserConfigDir();
  const userConfigPath = path.join(os.homedir(), '.aiox', 'user-config.yaml');

  let existing = {};
  try {
    if (fs.existsSync(userConfigPath)) {
      const content = fs.readFileSync(userConfigPath, 'utf8');
      existing = yaml.load(content) || {};
    }
  } catch {
    existing = {};
  }

  // Merge: existing values take precedence (don't overwrite user choices)
  const merged = { ...userFields, ...existing };

  const content = yaml.dump(merged, { lineWidth: -1 });
  fs.writeFileSync(userConfigPath, content, 'utf8');

  return userConfigPath;
}

/**
 * Write project config to .aiox-core/project-config.yaml.
 * Merges with existing project config (does not overwrite existing fields).
 *
 * @param {string} projectRoot - Project root directory
 * @param {Object} projectFields - Project config fields to write
 * @returns {string} Path to project config file
 */
function writeProjectConfig(projectRoot, projectFields) {
  const projectConfigPath = path.join(projectRoot, '.aiox-core', 'project-config.yaml');

  let existing = {};
  try {
    if (fs.existsSync(projectConfigPath)) {
      const content = fs.readFileSync(projectConfigPath, 'utf8');
      existing = yaml.load(content) || {};
    }
  } catch {
    existing = {};
  }

  // Merge: existing values take precedence
  const merged = { ...projectFields, ...existing };

  // Only write if there are fields to write
  if (Object.keys(merged).length === 0) {
    return null;
  }

  const content = yaml.dump(merged, { lineWidth: -1 });
  fs.writeFileSync(projectConfigPath, content, 'utf8');

  return projectConfigPath;
}

/**
 * Run the full migration from legacy core-config.yaml to layered config.
 *
 * @param {string} projectRoot - Project root directory
 * @param {Object} [options] - Migration options
 * @param {boolean} [options.dryRun] - If true, only report what would be done
 * @returns {Object} Migration result
 * @returns {boolean} result.migrated - Whether migration was performed
 * @returns {string} [result.backupPath] - Path to backup file
 * @returns {string} [result.userConfigPath] - Path to user config
 * @returns {string} [result.projectConfigPath] - Path to project config
 * @returns {string[]} result.warnings - Any warnings
 * @returns {Object} [result.userFields] - Extracted user fields
 * @returns {Object} [result.projectFields] - Extracted project fields
 */
function migrateConfig(projectRoot, options = {}) {
  const result = {
    migrated: false,
    backupPath: null,
    userConfigPath: null,
    projectConfigPath: null,
    warnings: [],
    userFields: null,
    projectFields: null,
  };

  const legacyPath = path.join(projectRoot, '.aiox-core', 'core-config.yaml');

  // Check if legacy config exists
  if (!fs.existsSync(legacyPath)) {
    result.warnings.push('No legacy core-config.yaml found. Nothing to migrate.');
    return result;
  }

  // Parse legacy config
  let legacyConfig;
  try {
    const content = fs.readFileSync(legacyPath, 'utf8');
    legacyConfig = yaml.load(content) || {};
  } catch (error) {
    result.warnings.push(`Failed to parse core-config.yaml: ${error.message}`);
    return result;
  }

  // Extract fields
  const userFields = extractUserFields(legacyConfig);
  const projectFields = extractProjectFields(legacyConfig);

  result.userFields = userFields;
  result.projectFields = projectFields;

  if (options.dryRun) {
    result.warnings.push('Dry run — no files written.');
    return result;
  }

  // Create backup
  result.backupPath = createBackup(projectRoot);

  // Write user config (L5)
  if (Object.keys(userFields).length > 0) {
    result.userConfigPath = writeUserConfig(userFields);
  }

  // Write project config (L2)
  if (Object.keys(projectFields).length > 0) {
    result.projectConfigPath = writeProjectConfig(projectRoot, projectFields);
  }

  result.migrated = true;
  return result;
}

module.exports = {
  migrateConfig,
  isLegacyMode,
  createBackup,
  extractUserFields,
  extractProjectFields,
  ensureUserConfigDir,
  writeUserConfig,
  writeProjectConfig,
  USER_FIELDS,
  PROJECT_FIELDS,
};
