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
const { colors, status } = require('../utils/aios-colors');
const { t, tf } = require('./i18n');

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
 * License server base URL (same source of truth as license-api.js CONFIG.BASE_URL).
 */
const LICENSE_SERVER_URL = process.env.AIOS_LICENSE_API_URL || 'https://aios-license-server.vercel.app';

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
  const title = t('proWizardTitle');
  const subtitle = t('proWizardSubtitle');
  const maxLen = Math.max(title.length, subtitle.length) + 10;
  const pad = (str) => {
    const totalPad = maxLen - str.length;
    const left = Math.floor(totalPad / 2);
    const right = totalPad - left;
    return ' '.repeat(left) + str + ' '.repeat(right);
  };
  console.log('');
  console.log(gold('  ╔' + '═'.repeat(maxLen) + '╗'));
  console.log(gold('  ║' + pad(title) + '║'));
  console.log(gold('  ║' + pad(subtitle) + '║'));
  console.log(gold('  ╚' + '═'.repeat(maxLen) + '╝'));
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
 * Try to load a pro license module via multiple resolution paths.
 *
 * Resolution order:
 * 1. Relative path (framework-dev mode: ../../../../pro/license/{name})
 * 2. @aios-fullstack/pro package (brownfield: node_modules/@aios-fullstack/pro/license/{name})
 * 3. Absolute path via aios-core in node_modules (brownfield upgrade)
 * 4. Absolute path via @aios-fullstack/pro in user project (npx context)
 *
 * Path 4 is critical for npx execution: when running `npx aios-core install`,
 * require() resolves from the npx temp directory, not process.cwd(). After
 * bootstrap installs @aios-fullstack/pro in the user's project, only an
 * absolute path to process.cwd()/node_modules/@aios-fullstack/pro/... works.
 *
 * @param {string} moduleName - Module filename without extension (e.g., 'license-api')
 * @returns {Object|null} Loaded module or null
 */
function loadProModule(moduleName) {
  const path = require('path');

  // 1. Framework-dev mode (cloned repo with pro/ submodule)
  try {
    return require(`../../../../pro/license/${moduleName}`);
  } catch { /* not available */ }

  // 2. @aios-fullstack/pro package (works when aios-core is a local dependency)
  try {
    return require(`@aios-fullstack/pro/license/${moduleName}`);
  } catch { /* not available */ }

  // 3. aios-core in node_modules (brownfield upgrade from >= v4.2.15)
  try {
    const absPath = path.join(process.cwd(), 'node_modules', 'aios-core', 'pro', 'license', moduleName);
    return require(absPath);
  } catch { /* not available */ }

  // 4. @aios-fullstack/pro in user project (npx context — require resolves from
  //    temp dir, so we need absolute path to where bootstrap installed the package)
  try {
    const absPath = path.join(process.cwd(), 'node_modules', '@aios-fullstack', 'pro', 'license', moduleName);
    return require(absPath);
  } catch { /* not available */ }

  return null;
}

/**
 * Try to load the license API client via lazy import.
 * Attempts multiple resolution paths for framework-dev, greenfield, and brownfield.
 *
 * @returns {{ LicenseApiClient: Function, licenseApi: Object }|null} License API or null
 */
function loadLicenseApi() {
  return loadProModule('license-api');
}

/**
 * Try to load the feature gate via lazy import.
 * Attempts multiple resolution paths for framework-dev, greenfield, and brownfield.
 *
 * @returns {{ featureGate: Object }|null} Feature gate or null
 */
function loadFeatureGate() {
  return loadProModule('feature-gate');
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
  showStep(1, 3, t('proLicenseActivation'));

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
      message: colors.primary(t('proHowActivate')),
      choices: [
        {
          name: t('proLoginOrCreate'),
          value: 'email',
        },
        {
          name: t('proEnterKey'),
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
    error: t('proCISetEnv'),
  };
}

/**
 * Interactive email/password license gate flow.
 *
 * New flow (PRO-11 v2):
 * 1. Email → checkEmail API → { isBuyer, hasAccount }
 * 2. NOT buyer → "No Pro access found" → STOP
 * 3. IS buyer + HAS account → Password → Login (with retry) → Activate
 * 4. IS buyer + NO account → Password + Confirm → Signup → Verify email → Login → Activate
 *
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function stepLicenseGateWithEmail() {
  const inquirer = require('inquirer');

  // Step 1: Get email
  const { email } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: colors.primary(t('proEmailLabel')),
      validate: (input) => {
        if (!input || !input.trim()) {
          return t('proEmailRequired');
        }
        if (!EMAIL_PATTERN.test(input.trim())) {
          return t('proEmailInvalid');
        }
        return true;
      },
    },
  ]);

  const trimmedEmail = email.trim();

  // Step 2: Check buyer status + account existence
  const loader = module.exports._testing ? module.exports._testing.loadLicenseApi : loadLicenseApi;
  const licenseModule = loader();

  if (!licenseModule) {
    return {
      success: false,
      error: t('proModuleNotAvailable'),
    };
  }

  const { LicenseApiClient } = licenseModule;
  const client = new LicenseApiClient();

  // Check connectivity
  const online = await client.isOnline();
  if (!online) {
    return {
      success: false,
      error: t('proServerUnreachable'),
    };
  }

  const checkSpinner = createSpinner(t('proVerifyingAccess'));
  checkSpinner.start();

  let checkResult;
  try {
    checkResult = await client.checkEmail(trimmedEmail);
  } catch (checkError) {
    checkSpinner.fail(tf('proVerificationFailed', { message: checkError.message }));
    return { success: false, error: checkError.message };
  }

  // Step 2a: NOT a buyer → stop
  if (!checkResult.isBuyer) {
    checkSpinner.fail(t('proNoAccess'));
    console.log('');
    showInfo(t('proContactSupport'));
    showInfo('  Issues: https://github.com/SynkraAI/aios-core/issues');
    showInfo('  ' + t('proPurchase'));
    return { success: false, error: t('proEmailNotBuyer') };
  }

  // Step 2b: IS a buyer
  if (checkResult.hasAccount) {
    checkSpinner.succeed(t('proAccessConfirmedAccount'));
    // Flow 3: Existing account → Login with password (retry loop)
    return loginWithRetry(client, trimmedEmail);
  }

  checkSpinner.succeed(t('proAccessConfirmedCreate'));
  // Flow 4: New account → Create account flow
  return createAccountFlow(client, trimmedEmail);
}

/**
 * Login flow with password retry (max 3 attempts).
 *
 * @param {object} client - LicenseApiClient instance
 * @param {string} email - Verified buyer email
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function loginWithRetry(client, email) {
  const inquirer = require('inquirer');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { password } = await inquirer.prompt([
      {
        type: 'password',
        name: 'password',
        message: colors.primary(t('proPasswordLabel')),
        mask: '*',
        validate: (input) => {
          if (!input || input.length < MIN_PASSWORD_LENGTH) {
            return tf('proPasswordMin', { min: MIN_PASSWORD_LENGTH });
          }
          return true;
        },
      },
    ]);

    const spinner = createSpinner(t('proAuthenticating'));
    spinner.start();

    try {
      const loginResult = await client.login(email, password);
      spinner.succeed(t('proAuthSuccess'));

      // Wait for email verification if needed
      if (!loginResult.emailVerified) {
        const verifyResult = await waitForEmailVerification(client, loginResult.sessionToken, email);
        if (!verifyResult.success) {
          return verifyResult;
        }
      }

      // Activate Pro
      return activateProByAuth(client, loginResult.sessionToken);
    } catch (loginError) {
      if (loginError.code === 'EMAIL_NOT_VERIFIED') {
        // Email not verified — poll by retrying login until verified
        spinner.info(t('proEmailNotVerified'));
        console.log(colors.dim('  ' + t('proCheckingEvery')));

        const startTime = Date.now();
        while (Date.now() - startTime < VERIFY_POLL_TIMEOUT_MS) {
          await new Promise((resolve) => setTimeout(resolve, VERIFY_POLL_INTERVAL_MS));
          try {
            const retryLogin = await client.login(email, password);
            showSuccess(t('proEmailVerified'));
            if (!retryLogin.emailVerified) {
              const verifyResult = await waitForEmailVerification(client, retryLogin.sessionToken, email);
              if (!verifyResult.success) return verifyResult;
            }
            return activateProByAuth(client, retryLogin.sessionToken);
          } catch (retryError) {
            if (retryError.code !== 'EMAIL_NOT_VERIFIED') {
              return { success: false, error: retryError.message };
            }
            // Still not verified, continue polling
          }
        }

        showError(t('proVerificationTimeout'));
        showInfo(t('proRunAgain'));
        return { success: false, error: t('proVerificationTimeout') };
      } else if (loginError.code === 'INVALID_CREDENTIALS') {
        const remaining = MAX_RETRIES - attempt;
        if (remaining > 0) {
          spinner.fail(`Incorrect password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
          showInfo('Forgot your password? Visit https://aios-license-server.vercel.app/reset-password');
        } else {
          spinner.fail('Maximum login attempts reached.');
          showInfo('Forgot your password? Visit https://aios-license-server.vercel.app/reset-password');
          showInfo('Or open an issue: https://github.com/SynkraAI/aios-core/issues');
          return { success: false, error: 'Maximum login attempts reached.' };
        }
      } else if (loginError.code === 'AUTH_RATE_LIMITED') {
        spinner.fail(loginError.message);
        return { success: false, error: loginError.message };
      } else {
        spinner.fail(tf('proAuthFailed', { message: loginError.message }));
        return { success: false, error: loginError.message };
      }
    }
  }

  return { success: false, error: t('proMaxAttempts') };
}

/**
 * Create account flow for new buyers.
 *
 * Asks for password, creates account, waits for email verification.
 *
 * @param {object} client - LicenseApiClient instance
 * @param {string} email - Verified buyer email
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function createAccountFlow(client, email) {
  const inquirer = require('inquirer');

  console.log('');
  showInfo(t('proCreateAccount'));

  // Ask for password with confirmation
  const { newPassword } = await inquirer.prompt([
    {
      type: 'password',
      name: 'newPassword',
      message: colors.primary(t('proChoosePassword')),
      mask: '*',
      validate: (input) => {
        if (!input || input.length < MIN_PASSWORD_LENGTH) {
          return tf('proPasswordMin', { min: MIN_PASSWORD_LENGTH });
        }
        return true;
      },
    },
  ]);

  const { confirmPassword } = await inquirer.prompt([
    {
      type: 'password',
      name: 'confirmPassword',
      message: colors.primary(t('proConfirmPassword')),
      mask: '*',
      validate: (input) => {
        if (input !== newPassword) {
          return t('proPasswordsNoMatch');
        }
        return true;
      },
    },
  ]);

  // Create account
  const spinner = createSpinner(t('proCreatingAccount'));
  spinner.start();

  let sessionToken;
  try {
    await client.signup(email, confirmPassword);
    spinner.succeed(t('proAccountCreated'));
  } catch (signupError) {
    if (signupError.code === 'EMAIL_ALREADY_REGISTERED') {
      spinner.info(t('proAccountExists'));
      return loginWithRetry(client, email);
    }
    spinner.fail(tf('proAccountFailed', { message: signupError.message }));
    return { success: false, error: signupError.message };
  }

  // Wait for email verification
  console.log('');
  showInfo(t('proCheckEmail'));

  // Login after signup to get session token
  try {
    const loginResult = await client.login(email, confirmPassword);
    sessionToken = loginResult.sessionToken;
  } catch {
    // Login might fail if email not verified yet — that's OK, we'll poll
  }

  if (sessionToken) {
    const verifyResult = await waitForEmailVerification(client, sessionToken, email);
    if (!verifyResult.success) {
      return verifyResult;
    }
  } else {
    // Need to wait for verification then login
    showInfo(t('proWaitingVerification'));
    showInfo(t('proAfterVerifying'));

    // Poll by trying to login periodically
    const startTime = Date.now();
    while (Date.now() - startTime < VERIFY_POLL_TIMEOUT_MS) {
      await new Promise((resolve) => setTimeout(resolve, VERIFY_POLL_INTERVAL_MS));
      try {
        const loginResult = await client.login(email, confirmPassword);
        sessionToken = loginResult.sessionToken;
        if (loginResult.emailVerified) {
          showSuccess('Email verified!');
          break;
        }
        // Got session but not verified yet — use the verification polling
        const verifyResult = await waitForEmailVerification(client, sessionToken, email);
        if (!verifyResult.success) {
          return verifyResult;
        }
        break;
      } catch {
        // Still waiting for verification
      }
    }

    if (!sessionToken) {
      showError(t('proVerificationTimeout'));
      showInfo(t('proRunAgain'));
      return { success: false, error: t('proVerificationTimeout') };
    }
  }

  // Activate Pro
  return activateProByAuth(client, sessionToken);
}

/**
 * Authenticate with email and password (CI mode / pre-provided credentials).
 *
 * For interactive mode, use stepLicenseGateWithEmail() instead (buyer-first flow).
 * This function is used when credentials are pre-provided (CI, CLI args).
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
      error: t('proModuleNotAvailable'),
    };
  }

  const { LicenseApiClient } = licenseModule;
  const client = new LicenseApiClient();

  // Check connectivity
  const online = await client.isOnline();
  if (!online) {
    return {
      success: false,
      error: t('proServerUnreachable'),
    };
  }

  // CI mode: check buyer first, then try login or auto-signup
  const checkSpinner = createSpinner(t('proVerifyingAccessShort'));
  checkSpinner.start();

  try {
    const checkResult = await client.checkEmail(email);
    if (!checkResult.isBuyer) {
      checkSpinner.fail(t('proNoAccess'));
      return { success: false, error: t('proEmailNotBuyer') };
    }
    checkSpinner.succeed(t('proAccessConfirmed'));
  } catch {
    checkSpinner.info(t('proBuyerCheckUnavailable'));
  }

  // Try login
  const spinner = createSpinner(t('proAuthenticating'));
  spinner.start();

  let sessionToken;
  let emailVerified;

  try {
    const loginResult = await client.login(email, password);
    sessionToken = loginResult.sessionToken;
    emailVerified = loginResult.emailVerified;
    spinner.succeed(t('proAuthSuccess'));
  } catch (loginError) {
    if (loginError.code === 'INVALID_CREDENTIALS') {
      spinner.info(t('proLoginFailedSignup'));
      try {
        await client.signup(email, password);
        showSuccess(t('proAccountCreatedVerify'));
        emailVerified = false;
        const loginAfterSignup = await client.login(email, password);
        sessionToken = loginAfterSignup.sessionToken;
      } catch (signupError) {
        if (signupError.code === 'EMAIL_ALREADY_REGISTERED') {
          showError(t('proAccountExistsWrongPw'));
          return { success: false, error: t('proAccountExistsWrongPw') };
        }
        return { success: false, error: signupError.message };
      }
    } else {
      spinner.fail(tf('proAuthFailed', { message: loginError.message }));
      return { success: false, error: loginError.message };
    }
  }

  if (!sessionToken) {
    return { success: false, error: t('proAuthFailedShort') };
  }

  // Wait for email verification if needed
  if (!emailVerified) {
    const verifyResult = await waitForEmailVerification(client, sessionToken, email);
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
 * @param {string} sessionToken - Session token (accessToken)
 * @param {string} email - User email for resend functionality
 * @returns {Promise<Object>} Result with { success }
 */
async function waitForEmailVerification(client, sessionToken, email) {
  console.log('');
  showInfo(t('proWaitingVerification'));
  showInfo(t('proCheckEmail'));
  console.log(colors.dim('  ' + t('proCheckingEvery')));

  if (!isCIEnvironment()) {
    console.log(colors.dim('  ' + t('proPressResend')));
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
          await client.resendVerification(email);
          showInfo(t('proVerificationResent'));
        } catch (error) {
          showWarning(tf('proCouldNotResend', { message: error.message }));
        }
      }

      // Poll verification status
      try {
        const status = await client.checkEmailVerified(sessionToken);
        if (status.verified) {
          showSuccess(t('proEmailVerified'));
          return { success: true };
        }
      } catch {
        // Polling failure is non-fatal, continue
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, VERIFY_POLL_INTERVAL_MS));
    }

    // Timeout
    showError(t('proVerificationTimeout'));
    showInfo(t('proRunAgainRetry'));
    return { success: false, error: t('proVerificationTimeout') };
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
  const spinner = createSpinner(t('proValidatingSubscription'));
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

    spinner.succeed(tf('proSubscriptionConfirmed', { key: maskLicenseKey(activationResult.key) }));
    return { success: true, key: activationResult.key, activationResult };
  } catch (error) {
    if (error.code === 'NOT_A_BUYER') {
      spinner.fail(t('proNoSubscription'));
      showInfo(t('proPurchaseAt'));
      return { success: false, error: error.message };
    }
    if (error.code === 'SEAT_LIMIT_EXCEEDED') {
      spinner.fail(error.message);
      showInfo(t('proSeatLimit'));
      return { success: false, error: error.message };
    }
    if (error.code === 'ALREADY_ACTIVATED') {
      // License already exists — treat as success (re-install scenario)
      spinner.succeed(t('proAlreadyActivated'));
      return { success: true, key: 'existing', activationResult: { reactivation: true } };
    }

    spinner.fail(tf('proActivationFailed', { message: error.message }));
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
        message: colors.primary(t('proEnterKeyPrompt')),
        mask: '*',
        validate: (input) => {
          if (!input || !input.trim()) {
            return t('proKeyRequired');
          }
          if (!validateKeyFormat(input)) {
            return t('proKeyInvalid');
          }
          return true;
        },
      },
    ]);

    const key = licenseKey.trim().toUpperCase();
    const result = await validateKeyWithApi(key);

    if (result.success) {
      showSuccess(tf('proKeyValidated', { key: maskLicenseKey(key) }));
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
      error: tf('proInvalidKeyFormat', { key: maskLicenseKey(key) }),
    };
  }

  const spinner = createSpinner(tf('proValidatingKey', { key: maskLicenseKey(key) }));
  spinner.start();

  const result = await validateKeyWithApi(key);

  if (result.success) {
    spinner.succeed(tf('proKeyValidated', { key: maskLicenseKey(key) }));
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
      error: t('proModuleNotAvailable'),
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
        error: t('proServerUnreachable'),
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
      return { success: false, error: t('proInvalidKey') };
    }
    if (error.code === 'EXPIRED_KEY') {
      return { success: false, error: t('proExpiredKey') };
    }
    if (error.code === 'SEAT_LIMIT_EXCEEDED') {
      return { success: false, error: t('proMaxActivations') };
    }
    if (error.code === 'RATE_LIMITED') {
      return { success: false, error: t('proRateLimited') };
    }
    if (error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        error: t('proServerUnreachable'),
      };
    }

    return {
      success: false,
      error: tf('proValidationFailed', { message: error.message || 'Unknown error' }),
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
  showStep(2, 3, t('proContentInstallation'));

  const path = require('path');
  const fs = require('fs');
  const { execSync } = require('child_process');

  const proSourceDir = path.join(targetDir, 'node_modules', '@aios-fullstack', 'pro');

  // Step 2a: Ensure package.json exists (greenfield projects)
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    const initSpinner = createSpinner(t('proInitPackageJson'));
    initSpinner.start();
    try {
      execSync('npm init -y', { cwd: targetDir, stdio: 'pipe' });
      initSpinner.succeed(t('proPackageJsonCreated'));
    } catch (err) {
      initSpinner.fail(t('proPackageJsonFailed'));
      return { success: false, error: tf('proNpmInitFailed', { message: err.message }) };
    }
  }

  // Step 2b: Install @aios-fullstack/pro if not present
  if (!fs.existsSync(proSourceDir)) {
    const installSpinner = createSpinner(t('proInstallingPackage'));
    installSpinner.start();
    try {
      execSync('npm install @aios-fullstack/pro', {
        cwd: targetDir,
        stdio: 'pipe',
        timeout: 120000,
      });
      installSpinner.succeed(t('proPackageInstalled'));
    } catch (err) {
      installSpinner.fail(t('proPackageInstallFailed'));
      return {
        success: false,
        error: tf('proNpmInstallFailed', { message: err.message }),
      };
    }

    // Validate installation
    if (!fs.existsSync(proSourceDir)) {
      return {
        success: false,
        error: t('proPackageNotFound'),
      };
    }
  }

  // Step 2c: Scaffold pro content
  const scaffolderModule = loadProScaffolder();

  if (!scaffolderModule) {
    showWarning(t('proScaffolderNotAvailable'));
    return { success: false, error: t('proScaffolderNotFound') };
  }

  const { scaffoldProContent } = scaffolderModule;

  const spinner = createSpinner(t('proScaffolding'));
  spinner.start();

  try {
    const scaffoldResult = await scaffoldProContent(targetDir, proSourceDir, {
      onProgress: (progress) => {
        spinner.text = tf('proScaffoldingProgress', { message: progress.message });
      },
      force: options.force || false,
    });

    if (scaffoldResult.success) {
      spinner.succeed(tf('proContentInstalled', { count: scaffoldResult.copiedFiles.length }));

      if (scaffoldResult.warnings.length > 0) {
        for (const warning of scaffoldResult.warnings) {
          showWarning(warning);
        }
      }

      return { success: true, scaffoldResult };
    }

    spinner.fail(t('proScaffoldFailed'));
    for (const error of scaffoldResult.errors) {
      showError(error);
    }

    return { success: false, error: scaffoldResult.errors.join('; '), scaffoldResult };
  } catch (error) {
    spinner.fail(tf('proScaffoldError', { message: error.message }));
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
  showStep(3, 3, t('proVerification'));

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

    showInfo(tf('proFilesInstalled', { count: files.length }));

    if (result.squads.length > 0) {
      // Extract unique squad names
      const squadNames = [...new Set(
        result.squads
          .map((f) => f.split('/')[1])
          .filter(Boolean),
      )];
      showSuccess(tf('proSquads', { names: squadNames.join(', ') }));
    }

    if (result.configs.length > 0) {
      showSuccess(tf('proConfigs', { count: result.configs.length }));
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
      showSuccess(tf('proFeaturesUnlocked', { count: available.length }));
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
  console.log(status.celebrate(t('proInstallComplete')));
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

  // Pre-check: If license module is not available (brownfield upgrade from older version),
  // install @aios-fullstack/pro first to get the license API, then proceed with gate.
  if (!loadLicenseApi()) {
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');

    showInfo(t('proModuleBootstrap'));

    // Ensure package.json exists
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      execSync('npm init -y', { cwd: targetDir, stdio: 'pipe' });
    }

    // Install @aios-fullstack/pro to get license module
    const proDir = path.join(targetDir, 'node_modules', '@aios-fullstack', 'pro');
    if (!fs.existsSync(proDir)) {
      const installSpinner = createSpinner(t('proInstallingPackage'));
      installSpinner.start();
      try {
        execSync('npm install @aios-fullstack/pro', {
          cwd: targetDir,
          stdio: 'pipe',
          timeout: 120000,
        });
        installSpinner.succeed(t('proPackageInstalled'));
      } catch (err) {
        installSpinner.fail(t('proPackageInstallFailed'));
        result.error = tf('proNpmInstallFailed', { message: err.message });
        return result;
      }
    }

    // Clear require cache so loadLicenseApi() picks up newly installed module
    Object.keys(require.cache).forEach((key) => {
      if (key.includes('license-api') || key.includes('@aios-fullstack')) {
        delete require.cache[key];
      }
    });
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
      showInfo(t('proNeedHelp'));
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
    loginWithRetry,
    createAccountFlow,
    stepLicenseGateCI,
    stepLicenseGateWithKey,
    stepLicenseGateWithKeyInteractive,
    stepLicenseGateWithEmail,
    loadProModule,
    loadLicenseApi,
    loadFeatureGate,
    loadProScaffolder,
    LICENSE_SERVER_URL,
    MAX_RETRIES,
    LICENSE_KEY_PATTERN,
    EMAIL_PATTERN,
    MIN_PASSWORD_LENGTH,
    VERIFY_POLL_INTERVAL_MS,
    VERIFY_POLL_TIMEOUT_MS,
  },
};
