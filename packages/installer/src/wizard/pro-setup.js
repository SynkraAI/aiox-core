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

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { createSpinner, showSuccess, showError, showWarning, showInfo } = require('./feedback');
const { colors, status } = require('../utils/aiox-colors');
const { getAioxCoreVersion, resolveAioxCorePath } = require('../utils/package-paths');
const { t, tf } = require('./i18n');

const execFileAsync = promisify(execFile);

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
const DEFAULT_LICENSE_SERVER_URL = 'https://aiox-license-server.vercel.app';
const PRO_ARTIFACT_PACKAGE = '@aiox-squads/pro';
const DEFAULT_PRO_ARTIFACT_VERSION = '0.4.2';
const MAX_PRO_ARTIFACT_SIZE_BYTES = 100 * 1024 * 1024;
const PRO_ARTIFACT_DOWNLOAD_TIMEOUT_MS = 60000;
const PRO_ARTIFACT_INSTALL_TIMEOUT_MS = 120000;

function isLocalLicenseHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function resolveLicenseServerUrl(rawUrl = DEFAULT_LICENSE_SERVER_URL) {
  const candidate = rawUrl || DEFAULT_LICENSE_SERVER_URL;
  let url;

  try {
    url = new URL(candidate);
  } catch (error) {
    throw new Error(`Invalid AIOX_LICENSE_API_URL "${candidate}": ${error.message}`);
  }

  const isAllowedLocalHttp = url.protocol === 'http:' && isLocalLicenseHost(url.hostname);
  if (url.protocol !== 'https:' && !isAllowedLocalHttp) {
    throw new Error('AIOX_LICENSE_API_URL must use https://, except for localhost development.');
  }

  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

const LICENSE_SERVER_URL = resolveLicenseServerUrl(process.env.AIOX_LICENSE_API_URL);
const PASSWORD_RESET_URL = new URL('/reset-password', LICENSE_SERVER_URL).toString();

/**
 * Inline License Client — lightweight HTTP client for pre-bootstrap license checks.
 *
 * Used when @aiox-squads/pro is not yet installed (first install scenario).
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
      const url = new URL(urlPath, this.baseUrl);
      const transport = url.protocol === 'http:' ? require('http') : require('https');

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'http:' ? 80 : 443),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aiox-installer',
          ...headers,
        },
        timeout: 15000,
      };

      const req = transport.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
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
   * @returns {Promise<{accessToken: string, sessionToken: string, emailVerified: boolean}>}
   */
  async login(email, password) {
    return this._request('POST', '/api/v1/auth/login', { email, password }).then((result) => {
      const accessToken = result.accessToken || result.sessionToken;
      return {
        ...result,
        accessToken,
        // Backward-compatible alias for existing wizard flows.
        sessionToken: accessToken,
      };
    });
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
    return this._request(
      'POST',
      '/api/v1/auth/activate-pro',
      {
        accessToken: token,
        machineId,
        version,
        aioxCoreVersion: version,
      },
      {
        // Preserve legacy compatibility with older server deployments.
        Authorization: `Bearer ${token}`,
      },
    ).then((result) => ({
      ...result,
      key: result.key || result.licenseKey,
    }));
  }

  /**
   * Request a short-lived signed URL for the Pro artifact.
   * @param {string} token - Supabase access token
   * @param {Object} request - Artifact request payload
   * @returns {Promise<Object>} Artifact descriptor with artifactUrl, sha256, sizeBytes
   */
  async getProArtifactUrl(token, request) {
    return this._request('POST', '/api/v1/pro/artifact-url', request, {
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
    return this._request('POST', '/api/v1/license/activate', {
      key: licenseKey,
      machineId,
      aioxCoreVersion: version,
      aiosCoreVersion: version,
      version,
    });
  }

  /**
   * Check if user's email has been verified.
   * @param {string} accessToken - Session token
   * @returns {Promise<{verified: boolean}>}
   */
  async checkEmailVerified(accessToken) {
    try {
      const result = await this._request('POST', '/api/v1/auth/verify-status', {
        accessToken,
      });
      return {
        ...result,
        verified: result.verified ?? result.emailVerified,
      };
    } catch (error) {
      // Older server versions used GET /email-verified with bearer auth.
      if (!error.message || !error.message.includes('HTTP 404')) {
        throw error;
      }

      const result = await this._request('GET', '/api/v1/auth/email-verified', null, {
        Authorization: `Bearer ${accessToken}`,
      });
      return {
        ...result,
        verified: result.verified ?? result.emailVerified,
      };
    }
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
 * 2. @aiox-squads/pro package (brownfield: node_modules/@aiox-squads/pro/license/{name})
 * 3. Absolute path via aiox-core in node_modules (brownfield upgrade)
 * 4. Absolute path via @aiox-squads/pro in user project (npx context)
 *
 * Path 4 is critical for npx execution: when running `npx aiox-core install`,
 * require() resolves from the npx temp directory, not process.cwd(). After
 * bootstrap installs @aiox-squads/pro in the user's project, only an
 * absolute path to process.cwd()/node_modules/@aiox-squads/pro/... works.
 *
 * @param {string} moduleName - Module filename without extension (e.g., 'license-api')
 * @returns {Object|null} Loaded module or null
 */
function loadProModule(moduleName) {
  const tryRequire = (requestPath) => {
    try {
      return require(requestPath);
    } catch (error) {
      if (
        error?.code === 'MODULE_NOT_FOUND' &&
        typeof error.message === 'string' &&
        error.message.includes(requestPath)
      ) {
        return null;
      }
      throw error;
    }
  };

  // 1. Core package root (framework-dev repo or @aiox-squads/core dependency)
  try {
    const frameworkModule = tryRequire(resolveAioxCorePath('pro', 'license', moduleName));
    if (frameworkModule) {
      return frameworkModule;
    }
  } catch {
    // Fall through to standalone Pro package resolution.
  }

  // 2. npm package
  const requestPath = `@aiox-squads/pro/license/${moduleName}`;
  const loadedPackageModule = tryRequire(requestPath);
  if (loadedPackageModule) {
    return loadedPackageModule;
  }

  // 3. aiox-core in node_modules (brownfield upgrade from >= v4.2.15)
  const aioxCorePath = path.join(
    process.cwd(),
    'node_modules',
    'aiox-core',
    'pro',
    'license',
    moduleName,
  );
  const aioxCoreModule = tryRequire(aioxCorePath);
  if (aioxCoreModule) {
    return aioxCoreModule;
  }

  // 4. npm package in user project via absolute path (npx context — require resolves from
  //    temp dir, so we need absolute path to where bootstrap installed the package)
  const absPath = path.join(
    process.cwd(),
    'node_modules',
    '@aiox-squads',
    'pro',
    'license',
    moduleName,
  );
  const loadedModule = tryRequire(absPath);
  if (loadedModule) {
    return loadedModule;
  }

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
 * Try to load the license cache helpers via lazy import.
 * Attempts multiple resolution paths for framework-dev, greenfield, and brownfield.
 *
 * @returns {{ writeLicenseCache: Function }|null} License cache helpers or null
 */
function loadLicenseCache() {
  return loadProModule('license-cache');
}

/**
 * Generate a deterministic machine identifier compatible with the Pro runtime.
 *
 * Mirrors pro/license/license-crypto.js so licenses activated during install use
 * the same seat fingerprint that later validation/deactivation expects.
 *
 * @returns {string} SHA-256 machine fingerprint (64 hex chars)
 */
function generateMachineId() {
  const licenseCryptoModule = loadProModule('license-crypto');
  if (licenseCryptoModule && typeof licenseCryptoModule.generateMachineId === 'function') {
    return licenseCryptoModule.generateMachineId();
  }

  const crypto = require('crypto');
  const os = require('os');
  const components = [];

  components.push(os.hostname());

  const cpus = os.cpus();
  if (cpus.length > 0) {
    components.push(cpus[0].model);
  }

  const networkInterfaces = os.networkInterfaces();
  for (const [, interfaces] of Object.entries(networkInterfaces)) {
    for (const iface of interfaces || []) {
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        components.push(iface.mac);
        break;
      }
    }
    if (components.length > 2) {
      break;
    }
  }

  return crypto.createHash('sha256').update(components.join('|')).digest('hex');
}

/**
 * Get a license API client instance.
 *
 * Prefers the full LicenseApiClient from @aiox-squads/pro when available.
 * Falls back to InlineLicenseClient (native https) for pre-bootstrap scenarios.
 *
 * @returns {Object} Client instance with isOnline, checkEmail, login, signup, activateByAuth
 */
function getLicenseClient() {
  const loader =
    module.exports._testing && module.exports._testing.loadLicenseApi
      ? module.exports._testing.loadLicenseApi
      : loadLicenseApi;
  const licenseModule = loader();

  if (licenseModule) {
    const { LicenseApiClient } = licenseModule;
    return new LicenseApiClient();
  }

  // Fallback: use inline client for pre-bootstrap (no @aiox-squads/pro yet)
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
 * Persist the activated license locally so post-install Pro commands can recognize it.
 *
 * @param {string} targetDir - Project root directory
 * @param {Object} licenseResult - Successful result from stepLicenseGate()
 * @param {string} [proSourceDir] - Optional Pro package source with license cache helpers
 * @returns {{ success: boolean, error?: string }} Cache write result
 */
function persistLicenseCache(targetDir, licenseResult, proSourceDir) {
  const activationResult =
    licenseResult && licenseResult.activationResult ? licenseResult.activationResult : {};
  const key = activationResult.key || licenseResult.key;

  if (key === 'existing' && (activationResult.reactivation || licenseResult.reactivation)) {
    return { success: true };
  }

  if (!key || key === 'existing') {
    return {
      success: false,
      error: 'Activated license key not available for local cache persistence.',
    };
  }

  const loader =
    module.exports._testing && module.exports._testing.loadLicenseCache
      ? module.exports._testing.loadLicenseCache
      : loadLicenseCache;
  let cacheModule = loader();

  if (!cacheModule && proSourceDir) {
    try {
      cacheModule = require(path.join(proSourceDir, 'license', 'license-cache'));
    } catch {
      cacheModule = null;
    }
  }

  if (!cacheModule || typeof cacheModule.writeLicenseCache !== 'function') {
    return { success: false, error: 'License cache module not available.' };
  }

  return cacheModule.writeLicenseCache(
    {
      key,
      activatedAt: activationResult.activatedAt || new Date().toISOString(),
      expiresAt: activationResult.expiresAt,
      features: Array.isArray(activationResult.features) ? activationResult.features : [],
      seats: activationResult.seats || { used: 1, max: 1 },
      cacheValidDays: activationResult.cacheValidDays,
      gracePeriodDays: activationResult.gracePeriodDays,
    },
    targetDir,
  );
}

function getProArtifactVersion(options = {}) {
  if (options.proArtifactVersion) {
    return options.proArtifactVersion;
  }

  if (process.env.AIOX_PRO_ARTIFACT_VERSION) {
    return process.env.AIOX_PRO_ARTIFACT_VERSION;
  }

  try {
    const localProPkg = require(resolveAioxCorePath('pro', 'package.json'));
    if (localProPkg && localProPkg.version) {
      return localProPkg.version;
    }
  } catch {
    // Public core packages do not contain pro/package.json.
  }

  return DEFAULT_PRO_ARTIFACT_VERSION;
}

function getLicenseResultAccessToken(licenseResult) {
  return (
    licenseResult?.accessToken ||
    licenseResult?.sessionToken ||
    licenseResult?.authToken ||
    licenseResult?.activationResult?.accessToken ||
    licenseResult?.activationResult?.sessionToken ||
    null
  );
}

function assertSafeArtifactUrl(artifactUrl) {
  let parsed;
  try {
    parsed = new URL(artifactUrl);
  } catch (error) {
    throw new Error(`Invalid Pro artifact URL returned by license server: ${error.message}`);
  }

  const isAllowedLocalHttp = parsed.protocol === 'http:' && isLocalLicenseHost(parsed.hostname);
  if (parsed.protocol !== 'https:' && !isAllowedLocalHttp) {
    throw new Error('Pro artifact URL must use https://, except for localhost development.');
  }
}

async function downloadArtifactFile(artifactUrl, destinationPath, expectedSizeBytes) {
  assertSafeArtifactUrl(artifactUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PRO_ARTIFACT_DOWNLOAD_TIMEOUT_MS);
  let buffer;

  try {
    const response = await fetch(artifactUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Pro artifact download failed with HTTP ${response.status}`);
    }

    buffer = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        `Pro artifact download timed out after ${PRO_ARTIFACT_DOWNLOAD_TIMEOUT_MS}ms.`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (buffer.length > MAX_PRO_ARTIFACT_SIZE_BYTES) {
    throw new Error('Pro artifact exceeds maximum supported size.');
  }

  if (expectedSizeBytes && buffer.length !== expectedSizeBytes) {
    throw new Error(
      `Pro artifact size mismatch: expected ${expectedSizeBytes}, received ${buffer.length}.`,
    );
  }

  await fs.writeFile(destinationPath, buffer);

  return {
    sizeBytes: buffer.length,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
  };
}

async function extractProArtifactToTemp(artifactPath, tempRoot) {
  const installRoot = path.join(tempRoot, 'package-root');
  await fs.ensureDir(installRoot);
  await fs.writeJson(path.join(installRoot, 'package.json'), {
    private: true,
    dependencies: {},
  });

  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  try {
    await execFileAsync(
      npmBin,
      ['install', artifactPath, '--ignore-scripts', '--no-audit', '--no-fund', '--no-save', '--silent'],
      {
        cwd: installRoot,
        timeout: PRO_ARTIFACT_INSTALL_TIMEOUT_MS,
        maxBuffer: 1024 * 1024 * 10,
      },
    );
  } catch (error) {
    const details = error.stderr || error.stdout || error.message;
    throw new Error(`Failed to extract Pro artifact package: ${String(details).trim()}`);
  }

  const proSourceDir = path.join(installRoot, 'node_modules', '@aiox-squads', 'pro');
  if (!(await fs.pathExists(path.join(proSourceDir, 'package.json')))) {
    throw new Error('Extracted Pro artifact did not contain @aiox-squads/pro package metadata.');
  }

  return proSourceDir;
}

async function installProArtifactIntoTarget(artifactPath, targetDir) {
  await fs.ensureDir(targetDir);

  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  try {
    await execFileAsync(
      npmBin,
      [
        'install',
        artifactPath,
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--no-save',
        '--package-lock=false',
        '--silent',
      ],
      {
        cwd: targetDir,
        timeout: PRO_ARTIFACT_INSTALL_TIMEOUT_MS,
        maxBuffer: 1024 * 1024 * 10,
      },
    );
  } catch (error) {
    const details = error.stderr || error.stdout || error.message;
    throw new Error(`Failed to install Pro artifact into project: ${String(details).trim()}`);
  }

  const proSourceDir = path.join(targetDir, 'node_modules', '@aiox-squads', 'pro');
  if (!(await fs.pathExists(path.join(proSourceDir, 'package.json')))) {
    throw new Error('Installed Pro artifact did not create node_modules/@aiox-squads/pro.');
  }

  return proSourceDir;
}

async function acquireProArtifactSourceDir(targetDir, licenseResult, options = {}) {
  const accessToken = getLicenseResultAccessToken(licenseResult);
  if (!accessToken) {
    return {
      success: false,
      error:
        'Authenticated Pro artifact download requires email/password login. Run `npx aiox-pro setup` and choose the login/create-account flow.',
    };
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-pro-artifact-'));

  try {
    const machineId = licenseResult.machineId || generateMachineId();
    const aioxCoreVersion = licenseResult.aioxCoreVersion || getAioxCoreVersion() || 'unknown';
    const version = getProArtifactVersion(options);
    const client = new InlineLicenseClient();
    const artifact = await client.getProArtifactUrl(accessToken, {
      package: PRO_ARTIFACT_PACKAGE,
      version,
      format: 'tgz',
      machineId,
      aioxCoreVersion,
    });

    if (!artifact || artifact.package !== PRO_ARTIFACT_PACKAGE || artifact.version !== version) {
      throw new Error('License server returned an unexpected Pro artifact descriptor.');
    }

    if (!/^[a-f0-9]{64}$/i.test(artifact.sha256 || '')) {
      throw new Error('License server returned an invalid Pro artifact sha256.');
    }

    const artifactPath = path.join(tempRoot, `aiox-squads-pro-${version}.tgz`);
    const downloaded = await downloadArtifactFile(
      artifact.artifactUrl,
      artifactPath,
      artifact.sizeBytes,
    );

    if (downloaded.sha256 !== artifact.sha256) {
      throw new Error('Pro artifact sha256 mismatch after download.');
    }

    const targetInstaller =
      module.exports._testing && module.exports._testing.installProArtifactIntoTarget
        ? module.exports._testing.installProArtifactIntoTarget
        : installProArtifactIntoTarget;
    const extractedProSourceDir = await extractProArtifactToTemp(artifactPath, tempRoot);
    const installedProSourceDir = await targetInstaller(artifactPath, targetDir);

    return {
      success: true,
      proSourceDir: installedProSourceDir || extractedProSourceDir,
      installedProSourceDir: installedProSourceDir || null,
      tempRoot,
      artifact: {
        package: artifact.package,
        version: artifact.version,
        sha256: artifact.sha256,
        sizeBytes: artifact.sizeBytes,
        expiresAt: artifact.expiresAt,
      },
    };
  } catch (error) {
    await fs.remove(tempRoot).catch(() => {});
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Ensure auth-based activations are also recognized by the standard key-validation flow.
 *
 * Some backends may return a valid license key from auth activation before the legacy
 * key-validation endpoint recognizes the current machine. In that case, normalize state by
 * replaying a key activation with the same machine fingerprint.
 *
 * @param {Object} client - License client
 * @param {Object} activationResult - Result returned by activateByAuth()
 * @param {string} machineId - Machine fingerprint
 * @param {string} aioxCoreVersion - Current aiox-core version
 * @returns {Promise<Object>} Activation result safe for cache persistence + `aiox pro validate`
 */
async function ensureKeyValidationParity(client, activationResult, machineId, aioxCoreVersion) {
  if (!activationResult || !activationResult.key || typeof client?.activate !== 'function') {
    return activationResult;
  }

  const mergeActivation = (normalized) => ({
    ...activationResult,
    key: normalized.key || activationResult.key,
    features: normalized.features || activationResult.features,
    seats: normalized.seats || activationResult.seats,
    expiresAt: normalized.expiresAt || activationResult.expiresAt,
    cacheValidDays: normalized.cacheValidDays || activationResult.cacheValidDays,
    gracePeriodDays: normalized.gracePeriodDays || activationResult.gracePeriodDays,
    activatedAt: normalized.activatedAt || activationResult.activatedAt,
  });

  if (typeof client.validate === 'function') {
    try {
      const validationResult = await client.validate(activationResult.key, machineId);
      if (validationResult && validationResult.valid !== false) {
        return mergeActivation(validationResult);
      }
    } catch (error) {
      if (!['MACHINE_NOT_ACTIVATED', 'NOT_ACTIVATED'].includes(error.code)) {
        throw error;
      }
    }
  }

  try {
    const normalizedActivation = await client.activate(
      activationResult.key,
      machineId,
      aioxCoreVersion,
    );
    return mergeActivation(normalizedActivation);
  } catch (error) {
    if (['ALREADY_ACTIVATED', 'MACHINE_ALREADY_ACTIVATED'].includes(error.code)) {
      return activationResult;
    }
    throw error;
  }
}

/**
 * Resolve the Pro content source directory.
 *
 * Priority:
 * 1. Bundled pro/ content in the aiox-core checkout or package
 * 2. Auto-initialize the git submodule when running from a source checkout
 * 3. Installed @aiox-squads/pro package in the target project
 *
 * @param {string} targetDir - Project root directory
 * @returns {{proSourceDir: string|null, bootstrapError?: string}} Resolution result
 */
function resolveProSourceDir(targetDir) {
  const path = require('path');
  const fs = require('fs');
  const { execFileSync } = require('child_process');

  const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
  const bundledProDir = path.join(repoRoot, 'pro');
  const npmProDir = path.join(targetDir, 'node_modules', '@aiox-squads', 'pro');
  const bundledSquadsDir = path.join(bundledProDir, 'squads');
  const gitmodulesPath = path.join(repoRoot, '.gitmodules');

  if (fs.existsSync(bundledSquadsDir)) {
    return { proSourceDir: bundledProDir };
  }

  if (fs.existsSync(gitmodulesPath) && fs.existsSync(bundledProDir)) {
    try {
      execFileSync('git', ['submodule', 'update', '--init', '--recursive', 'pro'], {
        cwd: repoRoot,
        stdio: 'ignore',
      });

      if (fs.existsSync(bundledSquadsDir)) {
        return { proSourceDir: bundledProDir };
      }
    } catch (error) {
      return {
        proSourceDir: null,
        bootstrapError: error.message || 'git submodule update failed',
      };
    }
  }

  if (fs.existsSync(npmProDir)) {
    return { proSourceDir: npmProDir };
  }

  return { proSourceDir: null };
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
  } catch (_checkError) {
    checkSpinner.info(t('proBuyerCheckUnavailable'));
    return fallbackAuthWithoutBuyerCheck(client, trimmedEmail);
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
 * Fallback interactive auth flow when buyer/account pre-check is unavailable.
 *
 * Prompts for a password, attempts login first, then falls back to signup if no account exists.
 * If the account already exists but the first password is wrong, hands control to the normal
 * login retry flow so the user still gets multiple attempts.
 *
 * @param {object} client - LicenseApiClient instance
 * @param {string} email - User email
 * @returns {Promise<Object>} Result with { success, key, activationResult }
 */
async function fallbackAuthWithoutBuyerCheck(client, email) {
  const inquirer = require('inquirer');

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

  let sessionToken;
  let emailVerified;

  try {
    const loginResult = await client.login(email, password);
    sessionToken = loginResult.sessionToken;
    emailVerified = loginResult.emailVerified;
    spinner.succeed(t('proAuthSuccess'));
  } catch (loginError) {
    if (loginError.code !== 'INVALID_CREDENTIALS') {
      spinner.fail(tf('proAuthFailed', { message: loginError.message }));
      return { success: false, error: loginError.message };
    }

    spinner.info(t('proLoginFailedSignup'));
    try {
      await client.signup(email, password);
      showSuccess(t('proAccountCreatedVerify'));

      const loginAfterSignup = await client.login(email, password);
      sessionToken = loginAfterSignup.sessionToken;
      emailVerified = loginAfterSignup.emailVerified;
    } catch (signupError) {
      if (signupError.code === 'EMAIL_ALREADY_REGISTERED') {
        showInfo(t('proAccountExists'));
        return loginWithRetry(client, email);
      }
      return { success: false, error: signupError.message };
    }
  }

  if (!sessionToken) {
    return { success: false, error: t('proAuthFailedShort') };
  }

  if (!emailVerified) {
    const verifyResult = await waitForEmailVerification(client, sessionToken, email);
    if (!verifyResult.success) {
      return verifyResult;
    }
  }

  return activateProByAuth(client, sessionToken);
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
        const verifyResult = await waitForEmailVerification(
          client,
          loginResult.sessionToken,
          email,
        );
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
              const verifyResult = await waitForEmailVerification(
                client,
                retryLogin.sessionToken,
                email,
              );
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
          spinner.fail(
            `Incorrect password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
          );
          showInfo(`Forgot your password? Visit ${PASSWORD_RESET_URL}`);
        } else {
          spinner.fail('Maximum login attempts reached.');
          showInfo(`Forgot your password? Visit ${PASSWORD_RESET_URL}`);
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
  let machineId;
  let aioxCoreVersion = 'unknown';

  try {
    // Generate machine fingerprint compatible with the Pro runtime
    machineId = generateMachineId();

    // Read aiox-core version
    try {
      aioxCoreVersion = getAioxCoreVersion() || 'unknown';
    } catch {
      // Keep 'unknown'
    }

    const authActivationResult = await client.activateByAuth(
      sessionToken,
      machineId,
      aioxCoreVersion,
    );
    const activationResult = await ensureKeyValidationParity(
      client,
      authActivationResult,
      machineId,
      aioxCoreVersion,
    );

    spinner.succeed(tf('proSubscriptionConfirmed', { key: maskLicenseKey(activationResult.key) }));
    return {
      success: true,
      key: activationResult.key,
      activationResult,
      sessionToken,
      accessToken: sessionToken,
      machineId,
      aioxCoreVersion,
    };
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
      return {
        success: true,
        key: 'existing',
        activationResult: { reactivation: true },
        sessionToken,
        accessToken: sessionToken,
        machineId: machineId || generateMachineId(),
        aioxCoreVersion,
      };
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

    // Generate machine fingerprint compatible with the Pro runtime
    const machineId = generateMachineId();

    // Read aiox-core version
    let aioxCoreVersion = 'unknown';
    try {
      aioxCoreVersion = getAioxCoreVersion() || 'unknown';
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
 * @param {string} [options.proSourceDir] - Optional explicit Pro source directory
 * @returns {Promise<Object>} Result with { success, scaffoldResult }
 */
async function stepInstallScaffold(targetDir, options = {}) {
  showStep(2, 3, t('proContentInstallation'));

  const sourceResolver =
    module.exports._testing && module.exports._testing.resolveProSourceDir
      ? module.exports._testing.resolveProSourceDir
      : resolveProSourceDir;
  const artifactAcquirer =
    module.exports._testing && module.exports._testing.acquireProArtifactSourceDir
      ? module.exports._testing.acquireProArtifactSourceDir
      : acquireProArtifactSourceDir;

  let sourceResolution;
  if (options.proSourceDir) {
    sourceResolution = { proSourceDir: options.proSourceDir };
  } else if (options.refreshArtifact) {
    sourceResolution = { proSourceDir: null };
  } else {
    sourceResolution = sourceResolver(targetDir);
  }

  const { proSourceDir, bootstrapError } = sourceResolution;

  let resolvedProSourceDir = proSourceDir;
  let tempProSourceRoot = null;
  let installedArtifactProSourceDir = null;
  const cleanupAcquiredArtifactInstall = async () => {
    if (installedArtifactProSourceDir) {
      await fs.remove(installedArtifactProSourceDir).catch(() => {});
    }
  };

  if (!resolvedProSourceDir && options.licenseResult) {
    const acquisition = await artifactAcquirer(targetDir, options.licenseResult, options);
    if (!acquisition.success) {
      return {
        success: false,
        error: acquisition.error,
      };
    }

    resolvedProSourceDir = acquisition.proSourceDir;
    tempProSourceRoot = acquisition.tempRoot || null;
    installedArtifactProSourceDir = acquisition.installedProSourceDir || null;
  }

  if (!resolvedProSourceDir) {
    return {
      success: false,
      error: bootstrapError
        ? `${t('proPackageNotFound')} ${bootstrapError}`
        : t('proPackageNotFound'),
    };
  }

  // Step 2c: Scaffold pro content
  const scaffolderModule = loadProScaffolder();

  if (!scaffolderModule) {
    showWarning(t('proScaffolderNotAvailable'));
    await cleanupAcquiredArtifactInstall();
    if (tempProSourceRoot) {
      await fs.remove(tempProSourceRoot).catch(() => {});
    }
    return { success: false, error: t('proScaffolderNotFound') };
  }

  const { scaffoldProContent } = scaffolderModule;

  const spinner = createSpinner(t('proScaffolding'));
  spinner.start();

  try {
    const scaffoldResult = await scaffoldProContent(targetDir, resolvedProSourceDir, {
      onProgress: (progress) => {
        spinner.text = tf('proScaffoldingProgress', { message: progress.message });
      },
      force: options.force || false,
    });

    if (scaffoldResult.success) {
      if (options.licenseResult) {
        const cachePersistResult = persistLicenseCache(
          targetDir,
          options.licenseResult,
          resolvedProSourceDir,
        );
        if (!cachePersistResult.success) {
          spinner.fail(tf('proLicenseCacheFailed', { message: cachePersistResult.error }));
          await cleanupAcquiredArtifactInstall();
          return {
            success: false,
            error: tf('proLicenseCacheFailed', { message: cachePersistResult.error }),
            scaffoldResult,
          };
        }
      }

      spinner.succeed(tf('proContentInstalled', { count: scaffoldResult.copiedFiles.length }));

      if (scaffoldResult.warnings.length > 0) {
        for (const warning of scaffoldResult.warnings) {
          showWarning(warning);
        }
      }

      return { success: true, scaffoldResult };
    }

    spinner.fail(t('proScaffoldFailed'));
    await cleanupAcquiredArtifactInstall();
    for (const error of scaffoldResult.errors) {
      showError(error);
    }

    return { success: false, error: scaffoldResult.errors.join('; '), scaffoldResult };
  } catch (error) {
    spinner.fail(tf('proScaffoldError', { message: error.message }));
    await cleanupAcquiredArtifactInstall();
    return { success: false, error: error.message };
  } finally {
    if (tempProSourceRoot) {
      await fs.remove(tempProSourceRoot).catch(() => {});
    }
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
    result.configs = files.filter((f) => f.endsWith('.yaml') || f.endsWith('.json'));

    showInfo(tf('proFilesInstalled', { count: files.length }));

    if (result.squads.length > 0) {
      // Extract unique squad names
      const squadNames = [...new Set(result.squads.map((f) => f.split('/')[1]).filter(Boolean))];
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
 * @param {boolean} [options.refreshArtifact] - Force signed artifact acquisition even if Pro is installed
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

  // Step 1: License Gate (uses InlineLicenseClient if @aiox-squads/pro not yet installed)
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
    licenseResult,
    proArtifactVersion: options.proArtifactVersion,
    refreshArtifact: options.refreshArtifact,
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
    fallbackAuthWithoutBuyerCheck,
    stepLicenseGateCI,
    stepLicenseGateWithKey,
    stepLicenseGateWithKeyInteractive,
    stepLicenseGateWithEmail,
    loadProModule,
    loadLicenseApi,
    loadFeatureGate,
    loadLicenseCache,
    loadProScaffolder,
    getLicenseClient,
    resolveProSourceDir,
    InlineLicenseClient,
    generateMachineId,
    persistLicenseCache,
    resolveLicenseServerUrl,
    ensureKeyValidationParity,
    acquireProArtifactSourceDir,
    downloadArtifactFile,
    extractProArtifactToTemp,
    installProArtifactIntoTarget,
    getProArtifactVersion,
    getLicenseResultAccessToken,
    LICENSE_SERVER_URL,
    PRO_ARTIFACT_PACKAGE,
    DEFAULT_PRO_ARTIFACT_VERSION,
    PASSWORD_RESET_URL,
    MAX_RETRIES,
    LICENSE_KEY_PATTERN,
    EMAIL_PATTERN,
    MIN_PASSWORD_LENGTH,
    VERIFY_POLL_INTERVAL_MS,
    VERIFY_POLL_TIMEOUT_MS,
  },
};
