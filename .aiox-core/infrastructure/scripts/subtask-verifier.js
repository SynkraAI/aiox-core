/**
 * Subtask Verifier - Story 4.5
 *
 * Verifies subtask completion by running type-specific verification commands.
 * Supports: command, api, browser, e2e verification types.
 *
 * @module subtask-verifier
 */

const fs = require('fs').promises;
const path = require('path');

// Optional dependencies with graceful fallback
let yaml;
try {
  yaml = require('js-yaml');
} catch {
  yaml = null;
}

let execa;
try {
  execa = require('execa').execa;
} catch {
  execa = null;
}

let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = {
    blue: (s) => s,
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    gray: (s) => s,
    bold: (s) => s,
  };
}

/**
 * Verification result interface
 * @typedef {Object} VerificationResult
 * @property {string} subtaskId - The subtask identifier
 * @property {boolean} passed - Whether verification passed
 * @property {string} verificationType - Type of verification performed
 * @property {number} duration - Execution time in ms
 * @property {string[]} logs - Execution logs
 * @property {number} attempts - Number of attempts made
 * @property {Error|null} error - Error if failed
 */

/**
 * Verification config from implementation.yaml
 * @typedef {Object} VerificationConfig
 * @property {string} type - Verification type (command, api, browser, e2e)
 * @property {string} [command] - Shell command to run
 * @property {string} [url] - API endpoint URL
 * @property {number} [expectedStatus] - Expected HTTP status
 * @property {Object} [options] - Additional fetch options
 * @property {string} [selector] - Browser selector to check
 * @property {string} [testCommand] - E2E test command
 * @property {number} [timeout] - Verification timeout in seconds
 */

/**
 * SubtaskVerifier - Verifies subtask completion
 */
class SubtaskVerifier {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.implementationPath - Path to implementation.yaml
   * @param {number} [options.timeout=60000] - Default timeout in ms
   * @param {number} [options.maxRetries=3] - Maximum retry attempts
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {string} [options.cwd] - Working directory for commands
   */
  constructor(options = {}) {
    this.implementationPath = options.implementationPath;
    this.timeout = options.timeout || 60000;
    this.maxRetries = options.maxRetries || 3;
    this.verbose = options.verbose || false;
    this.cwd = options.cwd || process.cwd();
    this.implementation = null;
    this.logs = [];

    // Verify required dependencies
    if (!yaml) {
      throw new Error('js-yaml module not available - install with: npm install js-yaml');
    }
  }

  /**
   * Log message with timestamp
   * @private
   */
  _log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    this.logs.push(logEntry);

    if (this.verbose) {
      const colorFn =
        {
          info: chalk.blue,
          success: chalk.green,
          error: chalk.red,
          warn: chalk.yellow,
        }[level] || chalk.gray;
      console.log(colorFn(logEntry));
    }
  }

  /**
   * Load implementation.yaml
   * @returns {Promise<Object>}
   */
  async loadImplementation() {
    try {
      const content = await fs.readFile(this.implementationPath, 'utf8');
      this.implementation = yaml.load(content);
      this._log(`Loaded implementation from ${this.implementationPath}`, 'info');
      return this.implementation;
    } catch (error) {
      throw new Error(`Failed to load implementation.yaml: ${error.message}`);
    }
  }

  /**
   * Find subtask by ID in implementation
   * @param {string} subtaskId - Subtask identifier (e.g., '1.1', '2.3')
   * @returns {Object|null}
   */
  findSubtask(subtaskId) {
    if (!this.implementation || !this.implementation.phases) {
      return null;
    }

    for (const phase of this.implementation.phases) {
      if (phase.subtasks) {
        const subtask = phase.subtasks.find((st) => st.id === subtaskId);
        if (subtask) {
          return { ...subtask, phase: phase.id, phaseName: phase.name };
        }
      }
    }
    return null;
  }

  /**
   * Verify a subtask by ID
   * @param {string} subtaskId - Subtask identifier
   * @returns {Promise<VerificationResult>}
   */
  async verify(subtaskId) {
    const startTime = Date.now();
    this.logs = [];

    // Load implementation if not already loaded
    if (!this.implementation) {
      await this.loadImplementation();
    }

    // Find subtask
    const subtask = this.findSubtask(subtaskId);
    if (!subtask) {
      return this._createResult(subtaskId, false, 'unknown', startTime, {
        error: new Error(`Subtask ${subtaskId} not found in implementation`),
      });
    }

    this._log(`Verifying subtask ${subtaskId}: ${subtask.description}`, 'info');

    // Get verification config
    const verification = subtask.verification;
    if (!verification) {
      this._log(`No verification config for subtask ${subtaskId}, marking as manual`, 'warn');
      return this._createResult(subtaskId, true, 'manual', startTime, {
        logs: ['No automated verification configured - manual check required'],
      });
    }

    // Run verification with retries
    return this._verifyWithRetries(subtaskId, verification, startTime);
  }

  /**
   * Run verification with retry logic
   * @private
   */
  async _verifyWithRetries(subtaskId, verification, startTime) {
    const verificationType = verification.type || 'command';
    let lastError = null;
    let attempts = 0;

    for (let i = 0; i < this.maxRetries; i++) {
      attempts = i + 1;
      try {
        this._log(`Attempt ${attempts}/${this.maxRetries} for subtask ${subtaskId}`, 'info');

        const result = await this._runVerification(verification);

        if (result.passed) {
          this._log(`Verification passed on attempt ${attempts}`, 'success');
          return this._createResult(subtaskId, true, verificationType, startTime, {
            attempts,
            output: result.output,
          });
        }

        lastError = new Error(result.error || 'Verification returned false');
        this._log(`Attempt ${attempts} failed: ${lastError.message}`, 'warn');

        // Wait before retry (exponential backoff)
        if (i < this.maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, i), 10000);
          this._log(`Waiting ${delay}ms before retry...`, 'info');
          await this._sleep(delay);
        }
      } catch (error) {
        lastError = error;
        this._log(`Attempt ${attempts} threw error: ${error.message}`, 'error');

        // Check if this is a transient error worth retrying
        if (!this._isTransientError(error) || i === this.maxRetries - 1) {
          break;
        }

        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await this._sleep(delay);
      }
    }

    return this._createResult(subtaskId, false, verificationType, startTime, {
      attempts,
      error: lastError,
    });
  }

  /**
   * Run verification based on type
   * @private
   */
  async _runVerification(config) {
    const type = config.type || 'command';
    const timeout = (config.timeout || 60) * 1000;

    switch (type) {
      case 'command':
        return this._verifyCommand(config, timeout);
      case 'api':
        return this._verifyApi(config, timeout);
      case 'browser':
        return this._verifyBrowser(config, timeout);
      case 'e2e':
        return this._verifyE2E(config, timeout);
      default:
        throw new Error(`Unknown verification type: ${type}`);
    }
  }

  /**
   * Command verification - run shell command, check exit code
   * @private
   */
  async _verifyCommand(config, timeout) {
    if (!config.command) {
      throw new Error('Command verification requires "command" field');
    }

    this._log(`Running command: ${config.command}`, 'info');

    if (!execa) {
      // Fallback to child_process
      const { execSync } = require('child_process');
      try {
        const output = execSync(config.command, {
          cwd: this.cwd,
          timeout,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, CI: 'true' },
        });
        this._log(`Command output: ${output.substring(0, 200)}...`, 'info');
        return { passed: true, output };
      } catch (error) {
        return {
          passed: false,
          error: `Exit code ${error.status}: ${error.stderr || error.message}`,
          output: error.stdout,
        };
      }
    }

    try {
      const parts = config.command.split(' ');
      const program = parts[0];
      const args = parts.slice(1);

      const { stdout, stderr, exitCode } = await execa(program, args, {
        cwd: this.cwd,
        shell: true,
        timeout,
        encoding: 'utf8',
        env: { ...process.env, CI: 'true' },
        reject: false,
      });

      if (exitCode === 0) {
        this._log(`Command succeeded with output: ${stdout.substring(0, 200)}...`, 'info');
        return { passed: true, output: stdout };
      }

      return {
        passed: false,
        error: `Exit code ${exitCode}: ${stderr || stdout}`,
        output: stdout,
      };
    } catch (error) {
      if (error.timedOut) {
        throw new Error(`Command timed out after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * API verification - make HTTP request, check response
   * @private
   */
  async _verifyApi(config, timeout) {
    if (!config.url) {
      throw new Error('API verification requires "url" field');
    }

    this._log(`Calling API: ${config.url}`, 'info');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions = {
        method: config.method || 'GET',
        signal: controller.signal,
        ...(config.options || {}),
      };

      if (config.body) {
        fetchOptions.body = JSON.stringify(config.body);
        fetchOptions.headers = {
          'Content-Type': 'application/json',
          ...(fetchOptions.headers || {}),
        };
      }

      const response = await fetch(config.url, fetchOptions);
      clearTimeout(timeoutId);

      const expectedStatus = config.expectedStatus || 200;
      const passed = response.status === expectedStatus;

      let output;
      try {
        output = await response.json();
      } catch {
        output = await response.text();
      }

      this._log(`API response: status=${response.status}, expected=${expectedStatus}`, 'info');

      if (passed) {
        // Additional validation if expectedOutput pattern provided
        if (config.expectedOutput) {
          const regex = new RegExp(config.expectedOutput);
          const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
          if (!regex.test(outputStr)) {
            return {
              passed: false,
              error: `Output did not match pattern: ${config.expectedOutput}`,
              output,
            };
          }
        }
        return { passed: true, output };
      }

      return {
        passed: false,
        error: `Expected status ${expectedStatus}, got ${response.status}`,
        output,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`API request timed out after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Browser verification - use Playwright to verify UI
   * @private
   */
  async _verifyBrowser(config, timeout) {
    this._log('Running browser verification with Playwright...', 'info');

    let playwright;
    try {
      playwright = require('playwright');
    } catch {
      throw new Error(
        'Browser verification requires Playwright - install with: npm install playwright'
      );
    }

    const browser = await playwright.chromium.launch({
      headless: config.headless !== false,
    });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      page.setDefaultTimeout(timeout);

      if (!config.url) {
        throw new Error('Browser verification requires "url" field');
      }

      await page.goto(config.url, { waitUntil: 'networkidle' });
      this._log(`Navigated to ${config.url}`, 'info');

      // Check for selector if provided
      if (config.selector) {
        const element = await page.locator(config.selector);
        const count = await element.count();

        if (count === 0) {
          return {
            passed: false,
            error: `Selector not found: ${config.selector}`,
          };
        }

        // Check expected text if provided
        if (config.expectedText) {
          const text = await element.first().textContent();
          if (!text || !text.includes(config.expectedText)) {
            return {
              passed: false,
              error: `Expected text "${config.expectedText}" not found in element`,
            };
          }
        }
      }

      // Take screenshot if path provided
      let screenshotPath;
      if (config.screenshot) {
        screenshotPath = config.screenshot;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        this._log(`Screenshot saved to ${screenshotPath}`, 'info');
      }

      return {
        passed: true,
        output: { url: config.url, screenshot: screenshotPath },
      };
    } finally {
      await browser.close();
    }
  }

  /**
   * E2E verification - run e2e test suite
   * @private
   */
  async _verifyE2E(config, timeout) {
    const testCommand = config.testCommand || config.command;
    if (!testCommand) {
      throw new Error('E2E verification requires "testCommand" or "command" field');
    }

    this._log(`Running E2E tests: ${testCommand}`, 'info');

    // E2E tests reuse command verification
    return this._verifyCommand({ command: testCommand }, timeout);
  }

  /**
   * Check if error is transient and worth retrying
   * @private
   */
  _isTransientError(error) {
    const transientPatterns = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'socket hang up',
      'network timeout',
      'temporarily unavailable',
    ];

    const message = error.message || '';
    return transientPatterns.some((pattern) =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Sleep for specified duration
   * @private
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create verification result object
   * @private
   */
  _createResult(subtaskId, passed, verificationType, startTime, options = {}) {
    return {
      subtaskId,
      passed,
      verificationType,
      duration: Date.now() - startTime,
      logs: [...this.logs],
      attempts: options.attempts || 1,
      error: options.error || null,
      output: options.output || null,
    };
  }

  /**
   * Verify all subtasks in implementation
   * @returns {Promise<Object>}
   */
  async verifyAll() {
    if (!this.implementation) {
      await this.loadImplementation();
    }

    const results = {
      storyId: this.implementation.storyId,
      totalSubtasks: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      subtasks: [],
    };

    for (const phase of this.implementation.phases || []) {
      for (const subtask of phase.subtasks || []) {
        results.totalSubtasks++;

        // Skip already completed subtasks
        if (subtask.status === 'completed') {
          results.skipped++;
          results.subtasks.push({
            subtaskId: subtask.id,
            passed: true,
            verificationType: 'skipped',
            duration: 0,
            logs: ['Subtask already completed - skipped verification'],
            attempts: 0,
          });
          continue;
        }

        const result = await this.verify(subtask.id);
        results.subtasks.push(result);

        if (result.passed) {
          results.passed++;
        } else {
          results.failed++;
        }
      }
    }

    return results;
  }

  /**
   * Generate verification report
   * @param {Object} results - Results from verify() or verifyAll()
   * @returns {string}
   */
  generateReport(results) {
    const lines = [];
    const isMultiple = Array.isArray(results.subtasks);

    lines.push('');
    lines.push(chalk.bold('='.repeat(60)));
    lines.push(chalk.bold(' Subtask Verification Report'));
    lines.push(chalk.bold('='.repeat(60)));
    lines.push('');

    if (isMultiple) {
      lines.push(`Story: ${results.storyId || 'Unknown'}`);
      lines.push(`Total Subtasks: ${results.totalSubtasks}`);
      lines.push(`  ${chalk.green('Passed')}: ${results.passed}`);
      lines.push(`  ${chalk.red('Failed')}: ${results.failed}`);
      lines.push(`  ${chalk.yellow('Skipped')}: ${results.skipped}`);
      lines.push('');
      lines.push('-'.repeat(60));

      for (const result of results.subtasks) {
        const status = result.passed ? chalk.green('PASS') : chalk.red('FAIL');
        lines.push(
          `${status} [${result.subtaskId}] ${result.verificationType} (${result.duration}ms)`
        );
        if (!result.passed && result.error) {
          lines.push(`     Error: ${result.error.message || result.error}`);
        }
      }
    } else {
      const status = results.passed ? chalk.green('PASS') : chalk.red('FAIL');
      lines.push(`Subtask: ${results.subtaskId}`);
      lines.push(`Status: ${status}`);
      lines.push(`Type: ${results.verificationType}`);
      lines.push(`Duration: ${results.duration}ms`);
      lines.push(`Attempts: ${results.attempts}`);

      if (!results.passed && results.error) {
        lines.push('');
        lines.push(chalk.red('Error:'));
        lines.push(`  ${results.error.message || results.error}`);
      }

      if (results.logs && results.logs.length > 0) {
        lines.push('');
        lines.push('Logs:');
        for (const log of results.logs.slice(-10)) {
          lines.push(`  ${chalk.gray(log)}`);
        }
      }
    }

    lines.push('');
    lines.push('='.repeat(60));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Update subtask status in implementation.yaml
   * @param {string} subtaskId - Subtask identifier
   * @param {string} status - New status (pending, in_progress, completed, failed)
   * @returns {Promise<void>}
   */
  async updateSubtaskStatus(subtaskId, status) {
    if (!this.implementation) {
      await this.loadImplementation();
    }

    let found = false;
    for (const phase of this.implementation.phases || []) {
      for (const subtask of phase.subtasks || []) {
        if (subtask.id === subtaskId) {
          subtask.status = status;
          subtask.verifiedAt = new Date().toISOString();
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      throw new Error(`Subtask ${subtaskId} not found`);
    }

    // Write back to file
    const yamlContent = yaml.dump(this.implementation, {
      indent: 2,
      lineWidth: 100,
      noRefs: true,
    });

    await fs.writeFile(this.implementationPath, yamlContent, 'utf8');
    this._log(`Updated status for ${subtaskId} to ${status}`, 'info');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: subtask-verifier <subtask-id> [options]

Options:
  --implementation, -i <path>  Path to implementation.yaml (required)
  --timeout, -t <ms>           Verification timeout in ms (default: 60000)
  --retries, -r <n>            Max retry attempts (default: 3)
  --verbose, -v                Enable verbose logging
  --all                        Verify all subtasks
  --update                     Update implementation.yaml with result
  --help, -h                   Show this help

Examples:
  subtask-verifier 1.1 -i docs/stories/STORY-42/plan/implementation.yaml
  subtask-verifier --all -i docs/stories/STORY-42/plan/implementation.yaml -v
`);
    process.exit(0);
  }

  // Parse arguments
  let subtaskId = null;
  let implementationPath = null;
  let timeout = 60000;
  let maxRetries = 3;
  let verbose = false;
  let verifyAll = false;
  let update = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--implementation' || arg === '-i') {
      implementationPath = args[++i];
    } else if (arg === '--timeout' || arg === '-t') {
      timeout = parseInt(args[++i], 10);
    } else if (arg === '--retries' || arg === '-r') {
      maxRetries = parseInt(args[++i], 10);
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--all') {
      verifyAll = true;
    } else if (arg === '--update') {
      update = true;
    } else if (!arg.startsWith('-')) {
      subtaskId = arg;
    }
  }

  if (!implementationPath) {
    console.error(chalk.red('Error: --implementation path is required'));
    process.exit(1);
  }

  if (!verifyAll && !subtaskId) {
    console.error(chalk.red('Error: subtask-id or --all is required'));
    process.exit(1);
  }

  try {
    const verifier = new SubtaskVerifier({
      implementationPath: path.resolve(implementationPath),
      timeout,
      maxRetries,
      verbose,
    });

    let results;
    if (verifyAll) {
      results = await verifier.verifyAll();
    } else {
      results = await verifier.verify(subtaskId);

      if (update) {
        const status = results.passed ? 'completed' : 'failed';
        await verifier.updateSubtaskStatus(subtaskId, status);
      }
    }

    console.log(verifier.generateReport(results));

    // Exit with appropriate code
    if (verifyAll) {
      process.exit(results.failed > 0 ? 1 : 0);
    } else {
      process.exit(results.passed ? 0 : 1);
    }
  } catch (error) {
    console.error(chalk.red(`Fatal error: ${error.message}`));
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { SubtaskVerifier };

// Run CLI if executed directly
if (require.main === module) {
  main();
}
