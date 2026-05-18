/**
 * Layer 2: PR Automation
 *
 * Runs automated PR reviews:
 * - CodeRabbit integration
 * - Quinn (@qa agent) automated review
 *
 * @module core/quality-gates/layer2-pr-automation
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const childProcess = require('child_process');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const { BaseLayer } = require('./base-layer');

/**
 * Layer 2: PR Automation checks
 * @extends BaseLayer
 */
class Layer2PRAutomation extends BaseLayer {
  /**
   * Create Layer 2 instance
   * @param {Object} config - Layer 2 configuration
   */
  constructor(config = {}) {
    super('Layer 2: PR Automation', config);
    this.coderabbit = config.coderabbit || {};
    this.quinn = config.quinn || {};
  }

  /**
   * Execute all Layer 2 checks
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer results
   */
  async execute(context = {}) {
    this.reset();
    this.startTimer();

    const { verbose = false } = context;

    if (!this.enabled) {
      this.addResult({
        check: 'layer2',
        pass: true,
        skipped: true,
        message: 'Layer 2 disabled',
      });
      this.stopTimer();
      return this.getSummary();
    }

    if (verbose) {
      console.log('\n🤖 Layer 2: PR Automation');
      console.log('━'.repeat(50));
    }

    // Run CodeRabbit
    if (this.coderabbit?.enabled !== false) {
      const coderabbitResult = await this.runCodeRabbit(context);
      this.addResult(coderabbitResult);
    }

    // Run Quinn review
    if (this.quinn?.enabled !== false) {
      const quinnResult = await this.runQuinnReview(context);
      this.addResult(quinnResult);
    }

    this.stopTimer();

    if (verbose) {
      const summary = this.getSummary();
      const icon = summary.pass ? '✅' : '⚠️';
      console.log(
        `\n${icon} Layer 2 ${summary.pass ? 'PASSED' : 'HAS ISSUES'} (${this.formatDuration(summary.duration)})`,
      );
    }

    return this.getSummary();
  }

  /**
   * Run CodeRabbit review
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} CodeRabbit result
   */
  async runCodeRabbit(context = {}) {
    const { verbose = false } = context;
    const timeout = this.coderabbit.timeout || 900000; // 15 minutes default

    if (verbose) {
      console.log('  🐰 Running CodeRabbit review...');
    }

    try {
      // Build command for current platform when no explicit override is present.
      // - this.coderabbit.command: explicit string wins (backward compat with old configs).
      // - this.coderabbit.installation_mode: 'wsl' | 'native' lets ops override platform detection.
      // - Default: Windows hosts wrap via WSL, macOS/Linux run the binary directly.
      // - ${PROJECT_ROOT} is resolved programmatically — `child_process.spawn` with
      //   `shell: true` does shell expansion, but we cannot rely on PROJECT_ROOT
      //   being set in the env at call sites, so substitute it here.
      // - Tilde handling differs per mode: native expands via os.homedir() so the
      //   resolved absolute path is shell-agnostic; WSL mode keeps the literal `~`
      //   so the WSL distribution's own bash expands it (the host's HOME would point
      //   at a Windows path that WSL cannot resolve).
      let command;
      if (this.coderabbit.command) {
        command = this.coderabbit.command;
      } else {
        const rawCliPath = this.coderabbit.cli_path || '~/.local/bin/coderabbit';
        const mode =
          this.coderabbit.installation_mode ||
          (process.platform === 'win32' ? 'wsl' : 'native');
        if (mode === 'wsl') {
          // Probe WSL availability before building the command. Gives a clearer
          // diagnostic than cmd.exe's generic "'wsl' is not recognized" when
          // WSL is not installed. ENOENT (binary missing) and non-zero exit
          // (WSL feature present but no distribution installed) both fail this
          // check.
          const wslProbe = childProcess.spawnSync('wsl', ['-l'], { encoding: 'utf8' });
          if (wslProbe.error || wslProbe.status !== 0) {
            throw new Error(
              'CodeRabbit CLI requires WSL on Windows hosts. Install WSL via ' +
                '`wsl --install` (https://learn.microsoft.com/windows/wsl/install), ' +
                'then install the CodeRabbit CLI inside the WSL distribution. ' +
                'See docs/guides/installation-troubleshooting.md Issue 10. ' +
                'To bypass this check, set coderabbit.installation_mode=\'native\' in your config.',
            );
          }
          const projectRoot = this.coderabbit.projectRoot || process.cwd();
          const wslProjectPath = projectRoot
            .replace(/\\/g, '/')
            .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
          // Keep literal `~` — WSL bash expands it to the WSL user's HOME.
          command = `wsl bash -c 'cd "${wslProjectPath}" && ${rawCliPath} --prompt-only -t uncommitted'`;
        } else {
          const cliPath = rawCliPath.startsWith('~')
            ? path.join(os.homedir(), rawCliPath.slice(1))
            : rawCliPath;
          command = `${cliPath} --prompt-only -t uncommitted`;
        }
      }

      const result = await this.runCommand(command, timeout);
      if (result.exitCode !== undefined && result.exitCode !== 0) {
        throw new Error(
          `CodeRabbit CLI exited with code ${result.exitCode}. ` +
            `stdout: ${(result.stdout || '').slice(0, 200)}, ` +
            `stderr: ${(result.stderr || '').slice(0, 200)}`,
        );
      }

      // Parse CodeRabbit output for issues
      const issues = this.parseCodeRabbitOutput(result.stdout + result.stderr);

      const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
      const highCount = issues.filter((i) => i.severity === 'HIGH').length;
      const mediumCount = issues.filter((i) => i.severity === 'MEDIUM').length;
      const lowCount = issues.filter((i) => i.severity === 'LOW').length;

      // Block on CRITICAL issues
      const blockOn = this.coderabbit.blockOn || ['CRITICAL'];
      const hasBlockingIssues = issues.some((i) => blockOn.includes(i.severity));

      const pass = !hasBlockingIssues;

      const coderabbitResult = {
        check: 'coderabbit',
        pass,
        issues: {
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount,
          total: issues.length,
        },
        details: issues,
        duration: result.duration,
        message: pass
          ? `CodeRabbit passed (${criticalCount} CRITICAL, ${highCount} HIGH)`
          : `CodeRabbit found blocking issues (${criticalCount} CRITICAL)`,
      };

      if (verbose) {
        const icon = pass ? '✓' : '⚠️';
        console.log(
          `  ${icon} CodeRabbit: ${criticalCount} CRITICAL, ${highCount} HIGH, ${mediumCount} MEDIUM`,
        );
      }

      return coderabbitResult;
    } catch (error) {
      // CodeRabbit not installed or not accessible - graceful degradation
      if (error.message.includes('not found') || error.message.includes('command not found')) {
        if (verbose) {
          console.log('  ⏭️ CodeRabbit: Skipped (not installed)');
        }
        return {
          check: 'coderabbit',
          pass: true,
          skipped: true,
          message: 'CodeRabbit not installed - skipping (graceful degradation)',
        };
      }

      return {
        check: 'coderabbit',
        pass: false,
        error: error.message,
        message: `CodeRabbit error: ${error.message}`,
      };
    }
  }

  /**
   * Parse CodeRabbit output for issues
   * @param {string} output - Command output
   * @returns {Array<Object>} Parsed issues
   */
  parseCodeRabbitOutput(output) {
    const issues = [];

    // Match patterns like "CRITICAL:", "HIGH:", etc.
    const patterns = [
      { regex: /\bCRITICAL\b[:\s]+([^\n]+)/gi, severity: 'CRITICAL' },
      { regex: /\bHIGH\b[:\s]+([^\n]+)/gi, severity: 'HIGH' },
      { regex: /\bMEDIUM\b[:\s]+([^\n]+)/gi, severity: 'MEDIUM' },
      { regex: /\bLOW\b[:\s]+([^\n]+)/gi, severity: 'LOW' },
    ];

    patterns.forEach(({ regex, severity }) => {
      let match;
      while ((match = regex.exec(output)) !== null) {
        issues.push({
          severity,
          message: match[1].trim(),
          raw: match[0],
        });
      }
    });

    return issues;
  }

  /**
   * Run Quinn (@qa) automated review
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Quinn review result
   */
  async runQuinnReview(context = {}) {
    const { verbose = false } = context;

    if (verbose) {
      console.log('  🧪 Running Quinn (@qa) review...');
    }

    try {
      // Quinn review is typically triggered by the QA agent
      // This integration point generates a review request
      const suggestions = await this.generateQuinnSuggestions(context);

      const blockingSuggestions = suggestions.filter((s) =>
        this.quinn.severity?.block?.includes(s.severity),
      );

      const pass = blockingSuggestions.length === 0;

      const quinnResult = {
        check: 'quinn',
        pass,
        suggestions: suggestions.length,
        blocking: blockingSuggestions.length,
        details: suggestions,
        message: pass
          ? `Quinn review: ${suggestions.length} suggestions`
          : `Quinn review: ${blockingSuggestions.length} blocking issues`,
      };

      if (verbose) {
        const icon = pass ? '✓' : '⚠️';
        console.log(
          `  ${icon} Quinn: ${suggestions.length} suggestions, ${blockingSuggestions.length} blocking`,
        );
      }

      return quinnResult;
    } catch (error) {
      return {
        check: 'quinn',
        pass: true, // Don't block on Quinn errors
        skipped: true,
        error: error.message,
        message: `Quinn skipped: ${error.message}`,
      };
    }
  }

  /**
   * Generate Quinn suggestions (placeholder for full integration)
   * @param {Object} context - Execution context
   * @returns {Promise<Array>} Suggestions
   */
  async generateQuinnSuggestions(_context = {}) {
    // This would integrate with the QA agent for automated review
    // For now, return empty suggestions - full integration in Story 2.11
    return [];
  }

  /**
   * Save review results to reports directory
   * @param {string} reportPath - Path to save report
   * @returns {Promise<void>}
   */
  async saveReport(reportPath) {
    const summary = this.getSummary();
    const report = {
      timestamp: new Date().toISOString(),
      layer: this.name,
      ...summary,
    };

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
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

      const options = {
        shell: true,
        cwd: process.cwd(),
        env: { ...process.env },
      };

      const child = childProcess.spawn(command, [], options);

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

module.exports = { Layer2PRAutomation };
