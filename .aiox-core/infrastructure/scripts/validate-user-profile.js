/**
 * User Profile Validator
 *
 * Validates the user_profile field in core-config.yaml
 *
 * @module infrastructure/scripts/validate-user-profile
 * @version 1.0.0
 * @created 2026-02-04 (Story 10.1 - Epic 10: User Profile System)
 * @see PRD AIOX v2.0 "Projeto Bob" - Seção 2
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Valid user profile values
 * @constant {string[]}
 */
const VALID_USER_PROFILES = ['bob', 'advanced'];

/**
 * Default user profile (for backward compatibility)
 * @constant {string}
 */
const DEFAULT_USER_PROFILE = 'advanced';

/**
 * Validates the user_profile field value
 *
 * @param {string} value - The user_profile value to validate
 * @returns {Object} Validation result with { valid, value, error }
 */
function validateUserProfile(value) {
  // Handle missing value
  if (value === undefined || value === null) {
    return {
      valid: true,
      value: DEFAULT_USER_PROFILE,
      warning: `user_profile not set, using default: "${DEFAULT_USER_PROFILE}"`,
    };
  }

  // Handle non-string values
  if (typeof value !== 'string') {
    return {
      valid: false,
      value: null,
      error: `user_profile must be a string. Got: ${typeof value}`,
    };
  }

  // Normalize to lowercase
  const normalizedValue = value.toLowerCase().trim();

  // Validate against allowed values
  if (!VALID_USER_PROFILES.includes(normalizedValue)) {
    return {
      valid: false,
      value: null,
      error: `Invalid user_profile: "${value}". Valid options are: ${VALID_USER_PROFILES.join(', ')}`,
    };
  }

  return {
    valid: true,
    value: normalizedValue,
    error: null,
  };
}

/**
 * Loads and validates user_profile from core-config.yaml
 *
 * @param {string} [configPath] - Path to core-config.yaml (optional)
 * @returns {Object} Result with { valid, profile, error, warning }
 */
function loadAndValidateUserProfile(configPath) {
  const defaultConfigPath = path.join(
    process.cwd(),
    '.aiox-core',
    'core-config.yaml'
  );
  const resolvedPath = configPath || defaultConfigPath;

  try {
    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return {
        valid: true,
        profile: DEFAULT_USER_PROFILE,
        warning: `core-config.yaml not found at ${resolvedPath}. Using default profile: "${DEFAULT_USER_PROFILE}"`,
      };
    }

    // Load config
    const content = fs.readFileSync(resolvedPath, 'utf8');
    const config = yaml.load(content);

    // Validate user_profile
    const result = validateUserProfile(config.user_profile);

    return {
      valid: result.valid,
      profile: result.value || DEFAULT_USER_PROFILE,
      error: result.error,
      warning: result.warning,
    };
  } catch (error) {
    return {
      valid: false,
      profile: null,
      error: `Failed to load config: ${error.message}`,
    };
  }
}

/**
 * Gets user profile with validation (throws on invalid)
 *
 * @param {string} [configPath] - Path to core-config.yaml (optional)
 * @returns {string} Valid user profile ('bob' or 'advanced')
 * @throws {Error} If profile is invalid
 */
function getUserProfile(configPath) {
  const result = loadAndValidateUserProfile(configPath);

  if (!result.valid) {
    throw new Error(result.error);
  }

  if (result.warning) {
    console.warn(`⚠️  ${result.warning}`);
  }

  return result.profile;
}

/**
 * Checks if user is in Bob mode
 *
 * @param {string} [configPath] - Path to core-config.yaml (optional)
 * @returns {boolean} True if user_profile is 'bob'
 */
function isBobMode(configPath) {
  try {
    return getUserProfile(configPath) === 'bob';
  } catch {
    return false; // Default to advanced mode on error
  }
}

/**
 * Checks if user is in Advanced mode
 *
 * @param {string} [configPath] - Path to core-config.yaml (optional)
 * @returns {boolean} True if user_profile is 'advanced'
 */
function isAdvancedMode(configPath) {
  try {
    return getUserProfile(configPath) === 'advanced';
  } catch {
    return true; // Default to advanced mode on error
  }
}

// Export functions and constants
module.exports = {
  validateUserProfile,
  loadAndValidateUserProfile,
  getUserProfile,
  isBobMode,
  isAdvancedMode,
  VALID_USER_PROFILES,
  DEFAULT_USER_PROFILE,
};

// CLI support for testing
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'validate':
      const result = loadAndValidateUserProfile(arg);
      if (result.valid) {
        console.log(`✅ Valid user_profile: "${result.profile}"`);
        if (result.warning) {
          console.log(`⚠️  Warning: ${result.warning}`);
        }
      } else {
        console.error(`❌ Invalid: ${result.error}`);
        process.exit(1);
      }
      break;

    case 'get':
      try {
        const profile = getUserProfile(arg);
        console.log(profile);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'test':
      console.log('\n🧪 Testing user profile validator...\n');

      // Test 1: Valid values
      console.log('Test 1: Valid values');
      ['bob', 'advanced', 'BOB', 'ADVANCED', ' bob ', ' advanced '].forEach(v => {
        const r = validateUserProfile(v);
        console.log(`  "${v}" → ${r.valid ? '✅' : '❌'} ${r.value || r.error}`);
      });

      // Test 2: Invalid values
      console.log('\nTest 2: Invalid values');
      ['invalid', 'admin', '', 123, null, undefined].forEach(v => {
        const r = validateUserProfile(v);
        const display = v === null ? 'null' : v === undefined ? 'undefined' : `"${v}"`;
        console.log(`  ${display} → ${r.valid ? `✅ ${r.value}` : `❌ ${r.error}`}`);
      });

      // Test 3: Load from config
      console.log('\nTest 3: Load from config');
      const configResult = loadAndValidateUserProfile();
      console.log(`  Result: ${configResult.valid ? '✅' : '❌'}`);
      console.log(`  Profile: ${configResult.profile}`);
      if (configResult.warning) console.log(`  Warning: ${configResult.warning}`);
      if (configResult.error) console.log(`  Error: ${configResult.error}`);

      console.log('\n✅ Tests completed!\n');
      break;

    default:
      console.log(`
User Profile Validator

Usage:
  node validate-user-profile.js validate [config-path]  - Validate user_profile
  node validate-user-profile.js get [config-path]       - Get current profile
  node validate-user-profile.js test                    - Run test suite

Valid profiles: ${VALID_USER_PROFILES.join(', ')}
Default: ${DEFAULT_USER_PROFILE}
      `);
  }
}
