/**
 * Dependency Installer Module
 *
 * Story 1.7: Dependency Installation
 * Handles automatic installation of npm dependencies with package manager detection,
 * retry logic, and offline mode support.
 *
 * @module installer/dependency-installer
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ora = require('ora');

/**
 * Allowed package managers (Security: Command injection prevention)
 * @constant {string[]}
 */
const ALLOWED_PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm', 'bun'];

/**
 * Package manager lock file mapping
 * Priority order: bun > pnpm > yarn > npm
 * @constant {Object}
 */
const LOCK_FILES = {
  'bun.lockb': 'bun',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
};

/**
 * Detect package manager from lock files
 *
 * @param {string} [projectPath=process.cwd()] - Project directory path
 * @returns {string} Detected package manager ('npm', 'yarn', 'pnpm', 'bun')
 *
 * @example
 * const pm = detectPackageManager();
 * console.log(pm); // 'npm'
 */
function detectPackageManager(projectPath = process.cwd()) {
  // Check for lock files in priority order
  for (const [lockFile, packageManager] of Object.entries(LOCK_FILES)) {
    const lockPath = path.join(projectPath, lockFile);
    if (fs.existsSync(lockPath)) {
      return packageManager;
    }
  }

  // Fallback to npm
  return 'npm';
}

/**
 * Validate package manager against whitelist (Security check)
 *
 * @param {string} packageManager - Package manager to validate
 * @throws {Error} If package manager is not in whitelist
 *
 * @example
 * validatePackageManager('npm'); // OK
 * validatePackageManager('malicious'); // Throws Error
 */
function validatePackageManager(packageManager) {
  if (!ALLOWED_PACKAGE_MANAGERS.includes(packageManager)) {
    throw new Error(
      `Invalid package manager: ${packageManager}. ` +
      `Allowed: ${ALLOWED_PACKAGE_MANAGERS.join(', ')}`,
    );
  }
}

/**
 * Check if node_modules exists and has contents (Offline mode detection)
 *
 * @param {string} [projectPath=process.cwd()] - Project directory path
 * @returns {boolean} True if node_modules exists with packages
 */
function hasExistingDependencies(projectPath = process.cwd()) {
  const nodeModulesPath = path.join(projectPath, 'node_modules');

  if (!fs.existsSync(nodeModulesPath)) {
    return false;
  }

  try {
    const contents = fs.readdirSync(nodeModulesPath);
    // node_modules exists and has more than just .bin or .cache
    return contents.length > 0 && contents.some(item => !item.startsWith('.'));
  } catch {
    return false;
  }
}

/**
 * Execute package manager install command
 *
 * @param {string} packageManager - Package manager to use
 * @param {string} [projectPath=process.cwd()] - Project directory path
 * @returns {Promise<Object>} Result object with success status
 *
 * @example
 * const result = await executeInstall('npm');
 * if (result.success) {
 *   console.log('Dependencies installed!');
 * }
 */
async function executeInstall(packageManager, projectPath = process.cwd()) {
  return new Promise((resolve) => {
    // Security: Use args array to prevent shell injection
    const args = ['install'];

    // Windows requires shell: true because npm is actually npm.cmd
    // On Unix, we can use shell: false for better security
    const isWindows = process.platform === 'win32';

    // Spawn process
    const child = spawn(packageManager, args, {
      cwd: projectPath,
      stdio: 'inherit', // Show real-time output to user
      shell: isWindows, // Windows needs shell to find npm.cmd, Unix doesn't
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, exitCode: 0 });
      } else {
        resolve({
          success: false,
          exitCode: code,
          error: `${packageManager} install exited with code ${code}`,
        });
      }
    });

    child.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
      });
    });
  });
}

/**
 * Categorize error type for better user guidance
 *
 * @param {Error|string} error - Error object or message
 * @returns {Object} Error category and suggested solution
 */
function categorizeError(error) {
  const errorMsg = typeof error === 'string' ? error : error.message;

  // Network errors
  if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('ETIMEDOUT') ||
      errorMsg.includes('EAI_AGAIN') || errorMsg.includes('fetch failed')) {
    return {
      category: 'network',
      message: 'Network connection failed',
      solution: 'Check your internet connection and try again',
    };
  }

  // Permission errors
  if (errorMsg.includes('EACCES') || errorMsg.includes('EPERM') ||
      errorMsg.includes('permission denied')) {
    return {
      category: 'permission',
      message: 'Permission denied',
      solution: 'Try running with elevated permissions or check folder ownership',
    };
  }

  // Disk space errors
  if (errorMsg.includes('ENOSPC') || errorMsg.includes('no space')) {
    return {
      category: 'diskspace',
      message: 'Insufficient disk space',
      solution: 'Free up disk space and try again',
    };
  }

  // Generic error
  return {
    category: 'unknown',
    message: errorMsg,
    solution: 'Check the error message above for details',
  };
}

/**
 * Sleep utility for retry backoff
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Install dependencies with retry logic
 *
 * @param {string} packageManager - Package manager to use
 * @param {string} projectPath - Project directory path
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} attempt - Current attempt number (internal)
 * @returns {Promise<Object>} Result object
 */
async function installWithRetry(packageManager, projectPath, maxRetries = 3, attempt = 1) {
  const result = await executeInstall(packageManager, projectPath);

  if (result.success) {
    return result;
  }

  // Max retries reached
  if (attempt >= maxRetries) {
    return result;
  }

  // Exponential backoff: 2s, 4s, 8s
  const delay = Math.pow(2, attempt) * 1000;
  console.log(`\n⏳ Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${maxRetries})`);
  await sleep(delay);

  return installWithRetry(packageManager, projectPath, maxRetries, attempt + 1);
}

/**
 * Main installation function with all features
 *
 * @param {Object} options - Installation options
 * @param {string} [options.packageManager] - Package manager override
 * @param {string} [options.projectPath=process.cwd()] - Project directory
 * @param {boolean} [options.skipRetry=false] - Skip retry logic
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @returns {Promise<Object>} Installation result
 *
 * @example
 * const result = await installDependencies({
 *   packageManager: 'npm',
 *   projectPath: '/path/to/project'
 * });
 */
async function installDependencies(options = {}) {
  const {
    packageManager: pmOverride,
    projectPath = process.cwd(),
    skipRetry = false,
    maxRetries = 3,
  } = options;

  let spinner;

  try {
    // Detect or use provided package manager
    const packageManager = pmOverride || detectPackageManager(projectPath);

    // Security: Validate package manager
    validatePackageManager(packageManager);

    // Check for offline mode (AC6)
    if (hasExistingDependencies(projectPath)) {
      console.log('\n📦 Existing dependencies found (offline mode)');
      console.log('   Skipping installation - using cached node_modules');
      return {
        success: true,
        offlineMode: true,
        packageManager,
        projectPath,
      };
    }

    // Start installation
    spinner = ora(`Installing dependencies with ${packageManager}...`).start();

    // Execute with or without retry
    let result;
    if (skipRetry) {
      result = await executeInstall(packageManager, projectPath);
    } else {
      result = await installWithRetry(packageManager, projectPath, maxRetries);
    }

    if (result.success) {
      spinner.succeed(`Dependencies installed with ${packageManager}!`);
      return {
        success: true,
        packageManager,
        projectPath,
      };
    } else {
      spinner.fail('Installation failed');

      // Categorize error for user guidance
      const errorInfo = categorizeError(result.error);

      return {
        success: false,
        packageManager,
        projectPath,
        error: result.error,
        errorCategory: errorInfo.category,
        errorMessage: errorInfo.message,
        solution: errorInfo.solution,
      };
    }
  } catch (error) {
    if (spinner) {
      spinner.fail('Installation failed');
    }

    const errorInfo = categorizeError(error);

    return {
      success: false,
      projectPath,
      error: error.message,
      errorCategory: errorInfo.category,
      errorMessage: errorInfo.message,
      solution: errorInfo.solution,
    };
  }
}

module.exports = {
  detectPackageManager,
  validatePackageManager,
  hasExistingDependencies,
  installDependencies,
  // Export for testing
  executeInstall,
  categorizeError,
  installWithRetry,
};
