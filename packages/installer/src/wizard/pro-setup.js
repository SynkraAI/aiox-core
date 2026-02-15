/**
 * Pro Installation Wizard with License Gate
 *
 * 3-step wizard: (1) License Gate, (2) Install/Scaffold, (3) Verify
 * Supports interactive mode, CI mode (AIOS_PRO_KEY env var), and lazy import.
 *
 * @module wizard/pro-setup
 * @story INS-3.2 — Implement Pro Installation Wizard with License Gate
 */

'use strict';

const { createSpinner, showSuccess, showError, showWarning, showInfo } = require('./feedback');
const { colors, headings, status } = require('../utils/aios-colors');

/**
 * Gold color for Pro branding.
 * Falls back gracefully if chalk hex is unavailable.
 */
let gold;
try {
  const chalk = require('chalk');
  gold = chalk.hex('#FFD700').bold;
} catch {
  gold = (text) => text;
}

/**
 * License key format: PRO-XXXX-XXXX-XXXX-XXXX
 */
const LICENSE_KEY_PATTERN = /^PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * Maximum retry attempts for license validation.
 */
const MAX_RETRIES = 3;

/**
 * Detect CI environment.
 *
 * @returns {boolean} true if running in CI or non-interactive terminal
 */
function isCIEnvironment() {
  return process.env.CI === 'true' || !process.stdout.isTTY;
}

/**
 * Mask a license key for safe display.
 * Shows first and last segments, masks middle two.
 * Example: PRO-ABCD-****-****-WXYZ
 *
 * @param {string} key - License key
 * @returns {string} Masked key
 */
function maskLicenseKey(key) {
  if (!key || typeof key !== 'string') {
    return '****';
  }

  const trimmed = key.trim().toUpperCase();

  if (!LICENSE_KEY_PATTERN.test(trimmed)) {
    return '****';
  }

  const parts = trimmed.split('-');
  return `${parts[0]}-${parts[1]}-****-****-${parts[4]}`;
}

/**
 * Validate license key format before sending to API.
 *
 * @param {string} key - License key
 * @returns {boolean} true if format is valid
 */
function validateKeyFormat(key) {
  if (!key || typeof key !== 'string') {
    return false;
  }
  return LICENSE_KEY_PATTERN.test(key.trim().toUpperCase());
}

/**
 * Show the Pro branding header.
 */
function showProHeader() {
  console.log('');
  console.log(gold('  ╔══════════════════════════════════════════════╗'));
  console.log(gold('  ║          AIOS Pro Installation Wizard        ║'));
  console.log(gold('  ║          Premium Content & Features          ║'));
  console.log(gold('  ╚══════════════════════════════════════════════╝'));
  console.log('');
}

/**
 * Show step indicator.
 *
 * @param {number} current - Current step (1-based)
 * @param {number} total - Total steps
 * @param {string} label - Step label
 */
function showStep(current, total, label) {
  const progress = `[${current}/${total}]`;
  console.log(gold(`\n  ${progress} ${label}`));
  console.log(colors.dim('  ' + '─'.repeat(44)));
}

/**
 * Try to load the license API client via lazy import.
 *
 * @returns {{ LicenseApiClient: Function, licenseApi: Object }|null} License API or null
 */
function loadLicenseApi() {
  try {
    return require('../../../../pro/license/license-api');
  } catch {
    return null;
  }
}

/**
 * Try to load the feature gate via lazy import.
 *
 * @returns {{ featureGate: Object }|null} Feature gate or null
 */
function loadFeatureGate() {
  try {
    return require('../../../../pro/license/feature-gate');
  } catch {
    return null;
  }
}

/**
 * Try to load the pro scaffolder via lazy import.
 *
 * @returns {{ scaffoldProContent: Function }|null} Scaffolder or null
 */
function loadProScaffolder() {
  try {
    return require('../pro/pro-scaffolder');
  } catch {
    return null;
  }
}

/**
 * Step 1: License Gate — validate license key.
 *
 * In CI mode, reads from AIOS_PRO_KEY env var.
 * In interactive mode, prompts with masked input.
 *
 * @param {Object} [options={}] - Options
 * @param {string} [options.key] - Pre-provided key (from CLI args or env)
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function stepLicenseGate(options = {}) {
  showStep(1, 3, 'License Validation');

  const isCI = isCIEnvironment();
  let key = options.key || null;

  // CI mode: read from env var
  if (!key && isCI) {
    key = process.env.AIOS_PRO_KEY || null;

    if (!key) {
      return {
        success: false,
        error: 'CI mode: AIOS_PRO_KEY environment variable not set.',
      };
    }
  }

  // Interactive mode: prompt for key
  if (!key && !isCI) {
    const inquirer = require('inquirer');

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const { licenseKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'licenseKey',
          message: colors.primary('Enter your Pro license key:'),
          mask: '*',
          validate: (input) => {
            if (!input || !input.trim()) {
              return 'License key is required';
            }
            if (!validateKeyFormat(input)) {
              return 'Invalid format. Expected: PRO-XXXX-XXXX-XXXX-XXXX';
            }
            return true;
          },
        },
      ]);

      key = licenseKey.trim().toUpperCase();

      // Validate with API
      const result = await validateKeyWithApi(key);

      if (result.success) {
        showSuccess(`License validated: ${maskLicenseKey(key)}`);
        return { success: true, key, activationResult: result.data };
      }

      // Show error and retry
      const remaining = MAX_RETRIES - attempt;
      if (remaining > 0) {
        showError(`${result.error} (${remaining} attempt${remaining > 1 ? 's' : ''} remaining)`);
      } else {
        showError(`${result.error} — no attempts remaining.`);
        return { success: false, error: result.error };
      }
    }
  }

  // Validate key format
  if (!validateKeyFormat(key)) {
    return {
      success: false,
      error: `Invalid key format: ${maskLicenseKey(key)}. Expected: PRO-XXXX-XXXX-XXXX-XXXX`,
    };
  }

  // Validate with API
  const spinner = createSpinner(`Validating license ${maskLicenseKey(key)}...`);
  spinner.start();

  const result = await validateKeyWithApi(key);

  if (result.success) {
    spinner.succeed(`License validated: ${maskLicenseKey(key)}`);
    return { success: true, key, activationResult: result.data };
  }

  spinner.fail(result.error);
  return { success: false, error: result.error };
}

/**
 * Validate a key against the license API.
 *
 * @param {string} key - License key
 * @returns {Promise<Object>} Result with { success, data?, error? }
 */
async function validateKeyWithApi(key) {
  // Use exports._testing for testability (allows mock injection)
  const loader = module.exports._testing ? module.exports._testing.loadLicenseApi : loadLicenseApi;
  const licenseModule = loader();

  if (!licenseModule) {
    return {
      success: false,
      error: 'Pro license module not available. Ensure @aios-fullstack/pro is installed.',
    };
  }

  const { LicenseApiClient } = licenseModule;
  const client = new LicenseApiClient();

  try {
    // Check if API is reachable
    const online = await client.isOnline();

    if (!online) {
      return {
        success: false,
        error: 'License server is unreachable. Check your internet connection and try again.',
      };
    }

    // Generate a simple machine fingerprint
    const os = require('os');
    const crypto = require('crypto');
    const machineId = crypto
      .createHash('sha256')
      .update(`${os.hostname()}-${os.platform()}-${os.arch()}`)
      .digest('hex')
      .substring(0, 32);

    // Read aios-core version
    let aiosCoreVersion = 'unknown';
    try {
      const path = require('path');
      const fs = require('fs');
      const pkgPath = path.join(__dirname, '..', '..', '..', '..', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      aiosCoreVersion = pkg.version || 'unknown';
    } catch {
      // Keep 'unknown'
    }

    const activationResult = await client.activate(key, machineId, aiosCoreVersion);

    return { success: true, data: activationResult };
  } catch (error) {
    // Handle specific error codes from license-api
    if (error.code === 'INVALID_KEY') {
      return { success: false, error: 'Invalid license key.' };
    }
    if (error.code === 'EXPIRED_KEY') {
      return { success: false, error: 'License key has expired.' };
    }
    if (error.code === 'SEAT_LIMIT_EXCEEDED') {
      return { success: false, error: 'Maximum activations reached for this key.' };
    }
    if (error.code === 'RATE_LIMITED') {
      return { success: false, error: 'Too many requests. Please wait and try again.' };
    }
    if (error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        error: 'License server is unreachable. Check your internet connection and try again.',
      };
    }

    return {
      success: false,
      error: `License validation failed: ${error.message || 'Unknown error'}`,
    };
  }
}

/**
 * Step 2: Install/Scaffold — copy pro content into the project.
 *
 * @param {string} targetDir - Project root directory
 * @param {Object} [options={}] - Options
 * @returns {Promise<Object>} Result with { success, scaffoldResult }
 */
async function stepInstallScaffold(targetDir, options = {}) {
  showStep(2, 3, 'Pro Content Installation');

  const scaffolderModule = loadProScaffolder();

  if (!scaffolderModule) {
    showWarning('Pro scaffolder not available. Ensure @aios-fullstack/pro is installed.');
    return { success: false, error: 'Pro scaffolder module not found.' };
  }

  const { scaffoldProContent } = scaffolderModule;
  const path = require('path');

  // Determine pro source directory
  const proSourceDir = path.join(targetDir, 'node_modules', '@aios-fullstack', 'pro');

  const spinner = createSpinner('Scaffolding pro content...');
  spinner.start();

  try {
    const scaffoldResult = await scaffoldProContent(targetDir, proSourceDir, {
      onProgress: (progress) => {
        spinner.text = `Scaffolding: ${progress.message}`;
      },
      force: options.force || false,
    });

    if (scaffoldResult.success) {
      spinner.succeed(`Pro content installed (${scaffoldResult.copiedFiles.length} files)`);

      if (scaffoldResult.warnings.length > 0) {
        for (const warning of scaffoldResult.warnings) {
          showWarning(warning);
        }
      }

      return { success: true, scaffoldResult };
    }

    spinner.fail('Scaffolding failed');
    for (const error of scaffoldResult.errors) {
      showError(error);
    }

    return { success: false, error: scaffoldResult.errors.join('; '), scaffoldResult };
  } catch (error) {
    spinner.fail(`Scaffolding error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Step 3: Verify — check installed pro content and list features.
 *
 * @param {Object} [scaffoldResult] - Result from step 2
 * @returns {Promise<Object>} Verification result
 */
async function stepVerify(scaffoldResult) {
  showStep(3, 3, 'Verification');

  const result = {
    success: true,
    features: [],
    squads: [],
    configs: [],
  };

  // Show scaffolded content summary
  if (scaffoldResult && scaffoldResult.copiedFiles) {
    const files = scaffoldResult.copiedFiles;

    // Categorize files
    result.squads = files.filter((f) => f.startsWith('squads/'));
    result.configs = files.filter(
      (f) => f.endsWith('.yaml') || f.endsWith('.json'),
    );

    showInfo(`Files installed: ${files.length}`);

    if (result.squads.length > 0) {
      // Extract unique squad names
      const squadNames = [...new Set(
        result.squads
          .map((f) => f.split('/')[1])
          .filter(Boolean),
      )];
      showSuccess(`Squads: ${squadNames.join(', ')}`);
    }

    if (result.configs.length > 0) {
      showSuccess(`Configs: ${result.configs.length} files`);
    }
  }

  // Check feature gate if available
  const featureModule = loadFeatureGate();

  if (featureModule) {
    const { featureGate } = featureModule;
    featureGate.reload();

    const available = featureGate.listAvailable();
    result.features = available;

    if (available.length > 0) {
      showSuccess(`Features unlocked: ${available.length}`);
      for (const feature of available.slice(0, 5)) {
        console.log(colors.dim(`    ${feature}`));
      }
      if (available.length > 5) {
        console.log(colors.dim(`    ... and ${available.length - 5} more`));
      }
    }
  }

  // Final status
  console.log('');
  console.log(gold('  ════════════════════════════════════════════════'));
  console.log(status.celebrate('AIOS Pro installation complete!'));
  console.log(gold('  ════════════════════════════════════════════════'));
  console.log('');

  return result;
}

/**
 * Run the full Pro Installation Wizard.
 *
 * Main entry point. Orchestrates the 3-step flow:
 * 1. License Gate (validate key)
 * 2. Install/Scaffold (copy pro content)
 * 3. Verify (list installed features)
 *
 * @param {Object} [options={}] - Wizard options
 * @param {string} [options.key] - Pre-provided license key
 * @param {string} [options.targetDir] - Project root (default: process.cwd())
 * @param {boolean} [options.force] - Force overwrite existing content
 * @param {boolean} [options.quiet] - Suppress non-essential output
 * @returns {Promise<Object>} Wizard result
 */
async function runProWizard(options = {}) {
  const targetDir = options.targetDir || process.cwd();
  const isCI = isCIEnvironment();

  const result = {
    success: false,
    licenseValidated: false,
    scaffolded: false,
    verified: false,
  };

  // Show branding (skip in CI or quiet mode)
  if (!isCI && !options.quiet) {
    showProHeader();
  }

  // Step 1: License Gate
  const licenseResult = await stepLicenseGate({
    key: options.key || process.env.AIOS_PRO_KEY,
  });

  if (!licenseResult.success) {
    showError(licenseResult.error);

    if (!isCI) {
      showInfo('Need help? Run: npx aios-pro recover');
    }

    result.error = licenseResult.error;
    return result;
  }

  result.licenseValidated = true;

  // Step 2: Install/Scaffold
  const scaffoldResult = await stepInstallScaffold(targetDir, {
    force: options.force,
  });

  if (!scaffoldResult.success) {
    result.error = scaffoldResult.error;
    return result;
  }

  result.scaffolded = true;

  // Step 3: Verify
  const verifyResult = await stepVerify(scaffoldResult.scaffoldResult);
  result.verified = verifyResult.success;
  result.features = verifyResult.features;
  result.squads = verifyResult.squads;
  result.success = true;

  return result;
}

module.exports = {
  runProWizard,
  stepLicenseGate,
  stepInstallScaffold,
  stepVerify,
  maskLicenseKey,
  validateKeyFormat,
  isCIEnvironment,
  showProHeader,
  // Internal helpers exported for testing
  _testing: {
    validateKeyWithApi,
    loadLicenseApi,
    loadFeatureGate,
    loadProScaffolder,
    MAX_RETRIES,
    LICENSE_KEY_PATTERN,
  },
};
