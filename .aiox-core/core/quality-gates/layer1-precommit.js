/**
 * Layer 1: Pre-commit Checks
 *
 * Runs fast, local checks before code is committed:
 * - Linting (ESLint)
 * - Unit tests (Jest)
 * - Type checking (TypeScript)
 *
 * @module core/quality-gates/layer1-precommit
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const { spawn } = require('child_process');
const { BaseLayer } = require('./base-layer');

/**
 * Layer 1: Pre-commit checks
 * @extends BaseLayer
 */
class Layer1PreCommit extends BaseLayer {
  /**
   * Create Layer 1 instance
   * @param {Object} config - Layer 1 configuration from quality-gate-config.yaml
   */
  constructor(config = {}) {
    super('Layer 1: Pre-commit', config);
    this.checks = config.checks || {};
    this.failFast = config.failFast !== false;
  }

  /**
   * Execute all Layer 1 checks
   * @param {Object} context - Execution context
   * @param {boolean} context.verbose - Show detailed output
   * @returns {Promise<Object>} Layer results
   */
  async execute(context = {}) {
    this.reset();
    this.startTimer();

    const { verbose = false } = context;

    if (!this.enabled) {
      this.addResult({
        check: 'layer1',
        pass: true,
        skipped: true,
        message: 'Layer 1 disabled',
      });
      this.stopTimer();
      return this.getSummary();
    }

    if (verbose) {
      console.log('\n📋 Layer 1: Pre-commit Checks');
      console.log('━'.repeat(50));
    }

    // Run lint check
    if (this.checks.lint?.enabled !== false) {
      const lintResult = await this.runLint(context);
      this.addResult(lintResult);

      if (!lintResult.pass && this.failFast) {
        this.stopTimer();
        return this.getSummary();
      }
    }

    // Run tests
    if (this.checks.test?.enabled !== false) {
      const testResult = await this.runTests(context);
      this.addResult(testResult);

      if (!testResult.pass && this.failFast) {
        this.stopTimer();
        return this.getSummary();
      }
    }

    // Run type check
    if (this.checks.typecheck?.enabled !== false) {
      const typeResult = await this.runTypeCheck(context);
      this.addResult(typeResult);
    }

    this.stopTimer();

    if (verbose) {
      const summary = this.getSummary();
      const icon = summary.pass ? '✅' : '❌';
      console.log(`\n${icon} Layer 1 ${summary.pass ? 'PASSED' : 'FAILED'} (${this.formatDuration(summary.duration)})`);
    }

    return this.getSummary();
  }

  /**
   * Run lint check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Lint result
   */
  async runLint(context = {}) {
    const { verbose = false } = context;
    const config = this.checks.lint || {};
    const command = config.command || 'npm run lint';
    const timeout = config.timeout || 60000;
    const failOn = config.failOn || 'error';

    if (verbose) {
      console.log('  🔍 Running lint check...');
    }

    try {
      const result = await this.runCommand(command, timeout);
      const hasErrors = result.stderr.includes('error') || result.exitCode !== 0;
      const hasWarnings = result.stdout.includes('warning') || result.stderr.includes('warning');

      // Parse error and warning counts
      const errorMatch = result.stdout.match(/(\d+)\s+error/i) || result.stderr.match(/(\d+)\s+error/i);
      const warningMatch = result.stdout.match(/(\d+)\s+warning/i) || result.stderr.match(/(\d+)\s+warning/i);

      const errorCount = errorMatch ? parseInt(errorMatch[1]) : (hasErrors ? 1 : 0);
      const warningCount = warningMatch ? parseInt(warningMatch[1]) : 0;

      const pass = failOn === 'error' ? !hasErrors : (!hasErrors && !hasWarnings);

      const lintResult = {
        check: 'lint',
        pass,
        exitCode: result.exitCode,
        errors: errorCount,
        warnings: warningCount,
        duration: result.duration,
        output: verbose ? result.stdout : undefined,
        message: pass
          ? `Lint passed (${errorCount} errors, ${warningCount} warnings)`
          : `Lint failed (${errorCount} errors, ${warningCount} warnings)`,
      };

      if (verbose) {
        const icon = pass ? '✓' : '✗';
        console.log(`  ${icon} Lint: ${lintResult.message}`);
      }

      return lintResult;
    } catch (error) {
      return {
        check: 'lint',
        pass: false,
        error: error.message,
        message: `Lint error: ${error.message}`,
      };
    }
  }

  /**
   * Run unit tests
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Test result
   */
  async runTests(context = {}) {
    const { verbose = false } = context;
    const config = this.checks.test || {};
    const command = config.command || 'npm test';
    const timeout = config.timeout || 300000;

    if (verbose) {
      console.log('  🧪 Running unit tests...');
    }

    try {
      const result = await this.runCommand(command, timeout);

      // Parse test results
      const passMatch = result.stdout.match(/(\d+)\s+pass/i);
      const failMatch = result.stdout.match(/(\d+)\s+fail/i);
      const skipMatch = result.stdout.match(/(\d+)\s+skip/i);

      const passed = passMatch ? parseInt(passMatch[1]) : 0;
      const failed = failMatch ? parseInt(failMatch[1]) : 0;
      const skipped = skipMatch ? parseInt(skipMatch[1]) : 0;

      const pass = result.exitCode === 0 && failed === 0;

      // Check coverage if enabled
      let coverage = null;
      if (config.coverage?.enabled) {
        const coverageMatch = result.stdout.match(/All files[^|]*\|\s*(\d+(?:\.\d+)?)/);
        if (coverageMatch) {
          coverage = parseFloat(coverageMatch[1]);
        }
      }

      const testResult = {
        check: 'test',
        pass,
        exitCode: result.exitCode,
        tests: {
          passed,
          failed,
          skipped,
          total: passed + failed + skipped,
        },
        coverage,
        duration: result.duration,
        message: pass
          ? `Tests passed (${passed} passed, ${failed} failed)`
          : `Tests failed (${passed} passed, ${failed} failed)`,
      };

      if (verbose) {
        const icon = pass ? '✓' : '✗';
        console.log(`  ${icon} Tests: ${testResult.message}`);
        if (coverage !== null) {
          const coverageIcon = coverage >= (config.coverage?.minimum || 80) ? '✓' : '⚠️';
          console.log(`  ${coverageIcon} Coverage: ${coverage}%`);
        }
      }

      return testResult;
    } catch (error) {
      return {
        check: 'test',
        pass: false,
        error: error.message,
        message: `Test error: ${error.message}`,
      };
    }
  }

  /**
   * Run type check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Type check result
   */
  async runTypeCheck(context = {}) {
    const { verbose = false } = context;
    const config = this.checks.typecheck || {};
    const command = config.command || 'npm run typecheck';
    const timeout = config.timeout || 120000;

    if (verbose) {
      console.log('  📝 Running type check...');
    }

    try {
      const result = await this.runCommand(command, timeout);

      // Parse type errors
      const errorMatch = result.stderr.match(/(\d+)\s+error/i) || result.stdout.match(/(\d+)\s+error/i);
      const errorCount = errorMatch ? parseInt(errorMatch[1]) : (result.exitCode !== 0 ? 1 : 0);

      const pass = result.exitCode === 0;

      const typeResult = {
        check: 'typecheck',
        pass,
        exitCode: result.exitCode,
        errors: errorCount,
        duration: result.duration,
        message: pass ? 'Type check passed' : `Type check failed (${errorCount} errors)`,
      };

      if (verbose) {
        const icon = pass ? '✓' : '✗';
        console.log(`  ${icon} TypeCheck: ${typeResult.message}`);
      }

      return typeResult;
    } catch (error) {
      return {
        check: 'typecheck',
        pass: false,
        error: error.message,
        message: `TypeCheck error: ${error.message}`,
      };
    }
  }

  /**
   * Run a command and capture output
   * @param {string} command - Command to run
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Command result
   */
  runCommand(command, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const [cmd, ...args] = command.split(' ');

      // Use shell for npm commands on Windows
      const options = {
        shell: true,
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: '1' },
      };

      const child = spawn(cmd, args, options);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', (exitCode) => {
        clearTimeout(timer);
        resolve({
          exitCode,
          stdout,
          stderr,
          duration: Date.now() - startTime,
        });
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }
}

module.exports = { Layer1PreCommit };
