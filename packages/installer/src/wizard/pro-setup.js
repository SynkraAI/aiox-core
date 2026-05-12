/**
 * Pro Installation Wizard with License Gate
 *
 * 3-step wizard: (1) License Gate, (2) Install/Scaffold, (3) Verify
 * Supports interactive mode, CI mode (AIOX_PRO_KEY/AIOX_PRO_EMAIL env vars), and lazy import.
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
const { colors, status } = require('../utils/aiox-colors');
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
const LICENSE_SERVER_URL = process.env.AIOX_LICENSE_API_URL || 'https://aiox-license-server.vercel.app';

/**
 * Inline License Client — lightweight HTTP client for pre-bootstrap license checks.
 *
 * Used when @aiox-fullstack/pro is not yet installed (first install scenario).
 * Implements the same interface subset as LicenseApiClient using Node.js native https.
 */
class InlineLicenseClient {
  constructor(baseUrl = LICENSE_SERVER_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an HTTPS request and return parsed JSON.
   * @param {string} method - HTTP method
   * @param {string} urlPath - URL path (e.g., '/api/v1/auth/check-email')
   * @param {Object} [body] - JSON body for POST requests
   * @param {Object} [headers] - Additional headers
   * @returns {Promise<Object>} Parsed JSON response
   */
  _request(method, urlPath, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const url = new URL(urlPath, this.baseUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aiox-installer',
          ...headers,
        },
        timeout: 15000,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) {
              const err = new Error(parsed.message || `HTTP ${res.statusCode}`);
              err.code = parsed.code;
              reject(err);
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error(`Invalid JSON response (HTTP ${res.statusCode})`));
          }
        });
      });

      req.on('error', (err) => {
        const networkErr = new Error(err.message);
        networkErr.code = 'NETWORK_ERROR';
        reject(networkErr);
      });

      req.on('timeout', () => {
        req.destroy();
        const timeoutErr = new Error('Request timeout');
        timeoutErr.code = 'NETWORK_ERROR';
        reject(timeoutErr);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  /** @returns {Promise<boolean>} true if license server is reachable */
  async isOnline() {
    try {
      await this._request('GET', '/health');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if email is a buyer and has an account.
   * @param {string} email
   * @returns {Promise<{isBuyer: boolean, hasAccount: boolean}>}
   */
  async checkEmail(email) {
    return this._request('POST', '/api/v1/auth/check-email', { email });
  }

  /**
   * Login with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{sessionToken: string, emailVerified: boolean}>}
   */
  async login(email, password) {
    return this._request('POST', '/api/v1/auth/login', { email, password });
  }

  /**
   * Create a new account.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async signup(email, password) {
    return this._request('POST', '/api/v1/auth/signup', { email, password });
  }

  /**
   * Activate Pro using an authenticated session.
   * @param {string} token - Session token
   * @param {string} machineId - Machine fingerprint
   * @param {string} version - aiox-core version
   * @returns {Promise<Object>} Activation result
   */
  async activateByAuth(token, machineId, version) {
    return this._request('POST', '/api/v1/auth/activate-pro', {
      machineId,
      version,
    }, {
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Activate Pro using a license key (legacy flow).
   * @param {string} licenseKey - License key
   * @param {string} machineId - Machine fingerprint
   * @param {string} version - aiox-core version
   * @returns {Promise<Object>} Activation result
   */
  async activate(licenseKey, machineId, version) {
    return this._request('POST', '/api/v1/licenses/activate', {
      key: licenseKey,
      machineId,
      version,
    });
  }

  /**
   * Check if user's email has been verified.
   * @param {string} sessionToken - Session token
   * @returns {Promise<{verified: boolean}>}
   */
  async checkEmailVerified(sessionToken) {
    return this._request('GET', '/api/v1/auth/email-verified', null, {
      Authorization: `Bearer ${sessionToken}`,
    });
  }

  /**
   * Resend verification email.
   * @param {string} email - User email
   * @returns {Promise<Object>}
   */
  async resendVerification(email) {
    return this._request('POST', '/api/v1/auth/resend-verification', { email });
  }
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
 * 2. @aiox-fullstack/pro package (brownfield: node_modules/@aiox-fullstack/pro/license/{name})
 * 3. Absolute path via aiox-core in node_modules (brownfield upgrade)
 * 4. Absolute path via @aiox-fullstack/pro in user project (npx context)
 *
 * Path 4 is critical for npx execution: when running `npx aiox-core install`,
 * require() resolves from the npx temp directory, not process.cwd(). After
 * bootstrap installs @aiox-fullstack/pro in the user's project, only an
 * absolute path to process.cwd()/node_modules/@aiox-fullstack/pro/... works.
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

  // 2. @aiox-fullstack/pro package (works when aiox-core is a local dependency)
  try {
    return require(`@aiox-fullstack/pro/license/${moduleName}`);
  } catch { /* not available */ }

  // 3. aiox-core in node_modules (brownfield upgrade from >= v4.2.15)
  try {
    const absPath = path.join(process.cwd(), 'node_modules', 'aiox-core', 'pro', 'license', moduleName);
    return require(absPath);
  } catch { /* not available */ }

  // 4. @aiox-fullstack/pro in user project (npx context — require resolves from
  //    temp dir, so we need absolute path to where bootstrap installed the package)
  try {
    const absPath = path.join(process.cwd(), 'node_modules', '@aiox-fullstack', 'pro', 'license', moduleName);
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
 * Get a license API client instance.
 *
 * Prefers the full LicenseApiClient from @aiox-fullstack/pro when available.
 * Falls back to InlineLicenseClient (native https) for pre-bootstrap scenarios.
 *
 * @returns {Object} Client instance with isOnline, checkEmail, login, signup, activateByAuth
 */
function getLicenseClient() {
  const loader = module.exports._testing ? module.exports._testing.loadLicenseApi : loadLicenseApi;
  const licenseModule = loader();

  if (licenseModule) {
    const { LicenseApiClient } = licenseModule;
    return new LicenseApiClient();
  }

  // Fallback: use inline client for pre-bootstrap (no @aiox-fullstack/pro yet)
  return new InlineLicenseClient();
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
 * In CI mode, reads from AIOX_PRO_EMAIL + AIOX_PRO_PASSWORD or AIOX_PRO_KEY env vars.
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
 * Priority: AIOX_PRO_EMAIL + AIOX_PRO_PASSWORD > AIOX_PRO_KEY
 *
 * @param {Object} options - Options with possible pre-provided credentials
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function stepLicenseGateCI(options) {
  const email = options.email || process.env.AIOX_PRO_EMAIL;
  const password = options.password || process.env.AIOX_PRO_PASSWORD;
  const key = options.key || process.env.AIOX_PRO_KEY;

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
  const client = getLicenseClient();

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
    showInfo('  Issues: https://github.com/SynkraAI/aiox-core/issues');
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
          showInfo('Forgot your password? Visit https://aiox-license-server.vercel.app/reset-password');
        } else {
          spinner.fail('Maximum login attempts reached.');
          showInfo('Forgot your password? Visit https://aiox-license-server.vercel.app/reset-password');
          showInfo('Or open an issue: https://github.com/SynkraAI/aiox-core/issues');
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
  const client = getLicenseClient();

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

    // Read aiox-core version
    let aioxCoreVersion = 'unknown';
    try {
      const path = require('path');
      const fs = require('fs');
      const pkgPath = path.join(__dirname, '..', '..', '..', '..', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      aioxCoreVersion = pkg.version || 'unknown';
    } catch {
      // Keep 'unknown'
    }

    const activationResult = await client.activateByAuth(sessionToken, machineId, aioxCoreVersion);

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
  const client = getLicenseClient();

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

    // Read aiox-core version
    let aioxCoreVersion = 'unknown';
    try {
      const path = require('path');
      const fs = require('fs');
      const pkgPath = path.join(__dirname, '..', '..', '..', '..', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      aioxCoreVersion = pkg.version || 'unknown';
    } catch {
      // Keep 'unknown'
    }

    const activationResult = await client.activate(key, machineId, aioxCoreVersion);

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

  // Resolve pro source directory from multiple locations:
  // 1. Bundled in aiox-core package (pro/ submodule — npx and local dev)
  // 2. @aiox-fullstack/pro in node_modules (legacy brownfield)
  const bundledProDir = path.resolve(__dirname, '..', '..', '..', '..', 'pro');
  const npmProDir = path.join(targetDir, 'node_modules', '@aiox-fullstack', 'pro');

  let proSourceDir;
  if (fs.existsSync(bundledProDir) && fs.existsSync(path.join(bundledProDir, 'squads'))) {
    proSourceDir = bundledProDir;
  } else if (fs.existsSync(npmProDir)) {
    proSourceDir = npmProDir;
  } else {
    return {
      success: false,
      error: t('proPackageNotFound'),
    };
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

  // Step 1: License Gate (uses InlineLicenseClient if @aiox-fullstack/pro not yet installed)
  const licenseResult = await stepLicenseGate({
    key: options.key || process.env.AIOX_PRO_KEY,
    email: options.email || process.env.AIOX_PRO_EMAIL,
    password: options.password || process.env.AIOX_PRO_PASSWORD,
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
    getLicenseClient,
    InlineLicenseClient,
    LICENSE_SERVER_URL,
    MAX_RETRIES,
    LICENSE_KEY_PATTERN,
    EMAIL_PATTERN,
    MIN_PASSWORD_LENGTH,
    VERIFY_POLL_INTERVAL_MS,
    VERIFY_POLL_TIMEOUT_MS,
  },
};
