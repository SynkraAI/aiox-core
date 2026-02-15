/**
 * Pro Installation Wizard with License Gate
 *
 * 3-step wizard: (1) License Gate, (2) Install/Scaffold, (3) Verify
 * Supports interactive mode, CI mode (AIOS_PRO_KEY/AIOS_PRO_EMAIL env vars), and lazy import.
 *
 * License Gate supports two activation methods:
 * - Email + Password authentication (recommended, PRO-11)
 * - License key (legacy, PRO-6)
 *
 * @module wizard/pro-setup
 * @story INS-3.2 — Implement Pro Installation Wizard with License Gate
 * @story PRO-11 — Email Authentication & Buyer-Based Pro Activation
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
 * Email verification polling interval in milliseconds.
 */
const VERIFY_POLL_INTERVAL_MS = 5000;

/**
 * Email verification polling timeout in milliseconds (10 minutes).
 */
const VERIFY_POLL_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Minimum password length.
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Email format regex.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 * Step 1: License Gate — authenticate and validate license.
 *
 * Supports two activation methods:
 * 1. Email + Password authentication (recommended, PRO-11)
 * 2. License key (legacy, PRO-6)
 *
 * In CI mode, reads from AIOS_PRO_EMAIL + AIOS_PRO_PASSWORD or AIOS_PRO_KEY env vars.
 * In interactive mode, prompts user to choose method.
 *
 * @param {Object} [options={}] - Options
 * @param {string} [options.key] - Pre-provided key (from CLI args or env)
 * @param {string} [options.email] - Pre-provided email (from CLI args or env)
 * @param {string} [options.password] - Pre-provided password (from CLI args or env)
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function stepLicenseGate(options = {}) {
  showStep(1, 3, 'License Activation');

  const isCI = isCIEnvironment();

  // CI mode: check env vars
  if (isCI) {
    return stepLicenseGateCI(options);
  }

  // Pre-provided key (from CLI args)
  if (options.key) {
    return stepLicenseGateWithKey(options.key);
  }

  // Pre-provided email credentials (from CLI args)
  if (options.email && options.password) {
    return authenticateWithEmail(options.email, options.password);
  }

  // Interactive mode: prompt for method
  const inquirer = require('inquirer');

  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: colors.primary('How would you like to activate Pro?'),
      choices: [
        {
          name: 'Login with email and password (Recommended)',
          value: 'email',
        },
        {
          name: 'Enter license key',
          value: 'key',
        },
      ],
    },
  ]);

  if (method === 'email') {
    return stepLicenseGateWithEmail();
  }

  return stepLicenseGateWithKeyInteractive();
}

/**
 * CI mode license gate — reads from env vars.
 *
 * Priority: AIOS_PRO_EMAIL + AIOS_PRO_PASSWORD > AIOS_PRO_KEY
 *
 * @param {Object} options - Options with possible pre-provided credentials
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function stepLicenseGateCI(options) {
  const email = options.email || process.env.AIOS_PRO_EMAIL;
  const password = options.password || process.env.AIOS_PRO_PASSWORD;
  const key = options.key || process.env.AIOS_PRO_KEY;

  // Prefer email auth over key
  if (email && password) {
    return authenticateWithEmail(email, password);
  }

  if (key) {
    return stepLicenseGateWithKey(key);
  }

  return {
    success: false,
    error: 'CI mode: Set AIOS_PRO_EMAIL + AIOS_PRO_PASSWORD or AIOS_PRO_KEY environment variables.',
  };
}

/**
 * Interactive email/password license gate flow.
 *
 * Prompts for email, then checks if account exists to determine signup vs login.
 *
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function stepLicenseGateWithEmail() {
  const inquirer = require('inquirer');

  const { email } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: colors.primary('Email:'),
      validate: (input) => {
        if (!input || !input.trim()) {
          return 'Email is required';
        }
        if (!EMAIL_PATTERN.test(input.trim())) {
          return 'Please enter a valid email address';
        }
        return true;
      },
    },
  ]);

  const { password } = await inquirer.prompt([
    {
      type: 'password',
      name: 'password',
      message: colors.primary('Password:'),
      mask: '*',
      validate: (input) => {
        if (!input || input.length < MIN_PASSWORD_LENGTH) {
          return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
        }
        return true;
      },
    },
  ]);

  return authenticateWithEmail(email.trim(), password);
}

/**
 * Authenticate with email and password.
 *
 * Tries login first. If user doesn't exist, offers to create account.
 * Handles email verification polling for new signups.
 *
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function authenticateWithEmail(email, password) {
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

  // Check connectivity
  const online = await client.isOnline();
  if (!online) {
    return {
      success: false,
      error: 'License server is unreachable. Check your internet connection and try again.',
    };
  }

  // Try login first
  const spinner = createSpinner('Authenticating...');
  spinner.start();

  let sessionToken;
  let emailVerified;

  try {
    const loginResult = await client.login(email, password);
    sessionToken = loginResult.sessionToken;
    emailVerified = loginResult.emailVerified;
    spinner.succeed('Authenticated successfully.');
  } catch (loginError) {
    // If invalid credentials, try signup for new users
    if (loginError.code === 'INVALID_CREDENTIALS') {
      spinner.info('No account found. Creating a new account...');

      try {
        await client.signup(email, password);
        showSuccess('Account created. Verification email sent!');
        emailVerified = false;

        // Login after signup to get session token
        const loginAfterSignup = await client.login(email, password);
        sessionToken = loginAfterSignup.sessionToken;
      } catch (signupError) {
        if (signupError.code === 'EMAIL_ALREADY_REGISTERED') {
          showError('An account exists with this email but the password is incorrect.');
          showInfo('Forgot your password? Visit https://pro.synkra.ai/reset-password or contact support@synkra.ai');
          return { success: false, error: signupError.message };
        }
        return { success: false, error: signupError.message };
      }
    } else if (loginError.code === 'AUTH_RATE_LIMITED') {
      spinner.fail(loginError.message);
      return { success: false, error: loginError.message };
    } else {
      spinner.fail(`Authentication failed: ${loginError.message}`);
      return { success: false, error: loginError.message };
    }
  }

  // Wait for email verification if needed
  if (!emailVerified) {
    const verifyResult = await waitForEmailVerification(client, sessionToken);
    if (!verifyResult.success) {
      return verifyResult;
    }
  }

  // Activate Pro
  return activateProByAuth(client, sessionToken);
}

/**
 * Wait for email verification with polling.
 *
 * Polls the server every 5 seconds for up to 10 minutes.
 * User can press R to resend verification email.
 *
 * @param {object} client - LicenseApiClient instance
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object>} Result with { success }
 */
async function waitForEmailVerification(client, sessionToken) {
  console.log('');
  showInfo('Waiting for email verification...');
  showInfo('Open your email and click the verification link.');
  console.log(colors.dim('  (Checking every 5 seconds... timeout in 10 minutes)'));

  if (!isCIEnvironment()) {
    console.log(colors.dim('  [Press R to resend verification email]'));
  }

  const startTime = Date.now();
  let resendHint = false;

  // Set up keyboard listener for resend (non-CI only)
  let keyListener;
  if (!isCIEnvironment() && process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    keyListener = (key) => {
      if (key.toString().toLowerCase() === 'r') {
        resendHint = true;
      }
      // Ctrl+C
      if (key.toString() === '\u0003') {
        cleanupKeyListener();
        process.exit(0);
      }
    };
    process.stdin.on('data', keyListener);
  }

  function cleanupKeyListener() {
    if (keyListener) {
      process.stdin.removeListener('data', keyListener);
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    }
  }

  try {
    while (Date.now() - startTime < VERIFY_POLL_TIMEOUT_MS) {
      // Handle resend request
      if (resendHint) {
        resendHint = false;
        try {
          await client.resendVerification(sessionToken);
          showInfo('Verification email resent.');
        } catch (error) {
          showWarning(`Could not resend: ${error.message}`);
        }
      }

      // Poll verification status
      try {
        const status = await client.checkEmailVerified(sessionToken);
        if (status.verified) {
          showSuccess('Email verified!');
          return { success: true };
        }
      } catch {
        // Polling failure is non-fatal, continue
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, VERIFY_POLL_INTERVAL_MS));
    }

    // Timeout
    showError('Email verification timed out after 10 minutes.');
    showInfo('Run the installer again to retry verification.');
    return { success: false, error: 'Email verification timed out.' };
  } finally {
    cleanupKeyListener();
  }
}

/**
 * Activate Pro using an authenticated session.
 *
 * @param {object} client - LicenseApiClient instance
 * @param {string} sessionToken - Authenticated session token
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function activateProByAuth(client, sessionToken) {
  const spinner = createSpinner('Validating Pro subscription...');
  spinner.start();

  try {
    // Generate machine fingerprint
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

    const activationResult = await client.activateByAuth(sessionToken, machineId, aiosCoreVersion);

    spinner.succeed(`Pro subscription confirmed! License: ${maskLicenseKey(activationResult.key)}`);
    return { success: true, key: activationResult.key, activationResult };
  } catch (error) {
    if (error.code === 'NOT_A_BUYER') {
      spinner.fail('No active Pro subscription found for this email.');
      showInfo('Purchase Pro at https://pro.synkra.ai');
      return { success: false, error: error.message };
    }
    if (error.code === 'SEAT_LIMIT_EXCEEDED') {
      spinner.fail(error.message);
      showInfo('Deactivate another device or upgrade your license.');
      return { success: false, error: error.message };
    }

    spinner.fail(`Activation failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Interactive license key gate (legacy flow).
 *
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function stepLicenseGateWithKeyInteractive() {
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

    const key = licenseKey.trim().toUpperCase();
    const result = await validateKeyWithApi(key);

    if (result.success) {
      showSuccess(`License validated: ${maskLicenseKey(key)}`);
      return { success: true, key, activationResult: result.data };
    }

    const remaining = MAX_RETRIES - attempt;
    if (remaining > 0) {
      showError(`${result.error} (${remaining} attempt${remaining > 1 ? 's' : ''} remaining)`);
    } else {
      showError(`${result.error} — no attempts remaining.`);
      return { success: false, error: result.error };
    }
  }

  return { success: false, error: 'Maximum attempts reached.' };
}

/**
 * Validate with pre-provided license key (CI or CLI arg).
 *
 * @param {string} key - License key
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function stepLicenseGateWithKey(key) {
  if (!validateKeyFormat(key)) {
    return {
      success: false,
      error: `Invalid key format: ${maskLicenseKey(key)}. Expected: PRO-XXXX-XXXX-XXXX-XXXX`,
    };
  }

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
    email: options.email || process.env.AIOS_PRO_EMAIL,
    password: options.password || process.env.AIOS_PRO_PASSWORD,
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
    authenticateWithEmail,
    waitForEmailVerification,
    activateProByAuth,
    stepLicenseGateCI,
    stepLicenseGateWithKey,
    stepLicenseGateWithKeyInteractive,
    stepLicenseGateWithEmail,
    loadLicenseApi,
    loadFeatureGate,
    loadProScaffolder,
    MAX_RETRIES,
    LICENSE_KEY_PATTERN,
    EMAIL_PATTERN,
    MIN_PASSWORD_LENGTH,
    VERIFY_POLL_INTERVAL_MS,
    VERIFY_POLL_TIMEOUT_MS,
  },
};
