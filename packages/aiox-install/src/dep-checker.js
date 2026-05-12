/**
 * Dependency Checker - Verifies required system dependencies
 *
 * Checks:
 * - Node.js (>= 18.0.0) - REQUIRED
 * - Git (>= 2.30) - REQUIRED
 * - Docker - OPTIONAL (required for edmcp)
 * - GitHub CLI (gh) - OPTIONAL (enhances workflow)
 *
 * @module dep-checker
 */

'use strict';

const { execaSync } = require('execa');
const semver = require('semver');
const chalk = require('chalk');

/**
 * Dependency requirement levels
 */
const REQUIREMENT = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
};

/**
 * Default dependency specifications
 */
const DEPENDENCIES = {
  node: {
    name: 'Node.js',
    command: 'node',
    versionFlag: '--version',
    minVersion: '18.0.0',
    requirement: REQUIREMENT.REQUIRED,
    versionParser: (output) => output.replace(/^v/, '').trim(),
    description: 'JavaScript runtime',
  },
  git: {
    name: 'Git',
    command: 'git',
    versionFlag: '--version',
    minVersion: '2.30.0',
    requirement: REQUIREMENT.REQUIRED,
    versionParser: (output) => {
      const match = output.match(/git version (\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    },
    description: 'Version control system',
  },
  docker: {
    name: 'Docker',
    command: 'docker',
    versionFlag: '--version',
    minVersion: null, // Any version is fine
    requirement: REQUIREMENT.OPTIONAL,
    versionParser: (output) => {
      const match = output.match(/Docker version (\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    },
    description: 'Container platform (required for edmcp)',
  },
  gh: {
    name: 'GitHub CLI',
    command: 'gh',
    versionFlag: '--version',
    minVersion: null, // Any version is fine
    requirement: REQUIREMENT.OPTIONAL,
    versionParser: (output) => {
      const match = output.match(/gh version (\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    },
    description: 'GitHub command-line tool',
  },
};

/**
 * Checks if a dependency is installed and meets version requirements
 * @param {Object} dep - Dependency specification
 * @param {Object} osInfo - OS information from os-detector
 * @returns {Object} Check result
 */
function checkDependency(dep, osInfo) {
  const result = {
    name: dep.name,
    command: dep.command,
    installed: false,
    version: null,
    meetsMinVersion: true,
    minVersion: dep.minVersion,
    requirement: dep.requirement,
    instruction: osInfo.installInstructions?.[dep.command] || `Install ${dep.name}`,
    error: null,
  };

  try {
    const { stdout } = execaSync(dep.command, [dep.versionFlag], {
      timeout: 5000,
      reject: false,
    });

    if (stdout) {
      result.installed = true;
      result.version = dep.versionParser(stdout);

      // Check minimum version if specified
      if (dep.minVersion && result.version) {
        const cleanVersion = semver.coerce(result.version);
        if (cleanVersion) {
          result.meetsMinVersion = semver.gte(cleanVersion.version, dep.minVersion);
        }
      }
    }
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

/**
 * Checks if Docker daemon is running
 * @returns {Object} Docker status
 */
function checkDockerRunning() {
  try {
    const { stdout, exitCode } = execaSync('docker', ['info'], {
      timeout: 10000,
      reject: false,
    });

    return {
      running: exitCode === 0,
      info: stdout,
    };
  } catch {
    return {
      running: false,
      info: null,
    };
  }
}

/**
 * Checks all dependencies
 * @param {Object} osInfo - OS information from os-detector
 * @param {Object} options - Check options
 * @returns {Object} Check results
 */
function checkAllDependencies(osInfo, _options = {}) {
  const results = {
    passed: true,
    hasWarnings: false,
    required: [],
    optional: [],
    missing: [],
    warnings: [],
    summary: null,
  };

  // Check each dependency
  for (const [key, dep] of Object.entries(DEPENDENCIES)) {
    const check = checkDependency(dep, osInfo);

    if (dep.requirement === REQUIREMENT.REQUIRED) {
      results.required.push(check);

      if (!check.installed || !check.meetsMinVersion) {
        results.passed = false;
        results.missing.push({
          name: check.name,
          command: key,
          required: true,
          instruction: check.instruction,
          reason: !check.installed
            ? 'Not installed'
            : `Version ${check.version} is below minimum ${check.minVersion}`,
        });
      }
    } else {
      results.optional.push(check);

      if (!check.installed) {
        results.hasWarnings = true;
        results.warnings.push({
          name: check.name,
          command: key,
          instruction: check.instruction,
          impact: dep.description,
        });
      }
    }
  }

  // Special check: Docker daemon running
  const dockerCheck = results.optional.find((c) => c.command === 'docker');
  if (dockerCheck && dockerCheck.installed) {
    const dockerStatus = checkDockerRunning();
    if (!dockerStatus.running) {
      results.hasWarnings = true;
      results.warnings.push({
        name: 'Docker Daemon',
        command: 'docker',
        instruction: 'Start Docker Desktop or run: sudo systemctl start docker',
        impact: 'Docker is installed but not running - edmcp will not work',
      });
    }
  }

  // Generate summary
  results.summary = generateSummary(results);

  return results;
}

/**
 * Generates a human-readable summary
 * @param {Object} results - Check results
 * @returns {string} Summary text
 */
function generateSummary(results) {
  const lines = [];

  if (results.passed && !results.hasWarnings) {
    lines.push(chalk.green('✓ All dependencies are installed and meet requirements'));
    return lines.join('\n');
  }

  if (!results.passed) {
    lines.push(chalk.red('✗ Missing required dependencies:'));
    for (const missing of results.missing) {
      lines.push(chalk.red(`  • ${missing.name}: ${missing.reason}`));
      lines.push(chalk.dim(`    Install: ${missing.instruction}`));
    }
  }

  if (results.hasWarnings) {
    lines.push('');
    lines.push(chalk.yellow('⚠ Optional dependencies not installed:'));
    for (const warning of results.warnings) {
      lines.push(chalk.yellow(`  • ${warning.name}`));
      lines.push(chalk.dim(`    Impact: ${warning.impact}`));
      lines.push(chalk.dim(`    Install: ${warning.instruction}`));
    }
  }

  return lines.join('\n');
}

/**
 * Formats dependency status for display
 * @param {Object} check - Dependency check result
 * @returns {string} Formatted status
 */
function formatDependencyStatus(check) {
  if (!check.installed) {
    return chalk.red(`✗ ${check.name}: Not installed`);
  }

  if (!check.meetsMinVersion) {
    return chalk.yellow(
      `⚠ ${check.name}: v${check.version} (requires >= ${check.minVersion})`,
    );
  }

  return chalk.green(`✓ ${check.name}: v${check.version}`);
}

/**
 * Displays dependency check results
 * @param {Object} results - Check results
 */
function displayResults(results) {
  console.log('');
  console.log(chalk.bold('Dependency Check'));
  console.log(chalk.dim('─'.repeat(40)));

  // Show required
  console.log('');
  console.log(chalk.bold('Required:'));
  for (const dep of results.required) {
    console.log('  ' + formatDependencyStatus(dep));
  }

  // Show optional
  console.log('');
  console.log(chalk.bold('Optional:'));
  for (const dep of results.optional) {
    console.log('  ' + formatDependencyStatus(dep));
  }

  // Show summary
  console.log('');
  console.log(results.summary);
}

module.exports = {
  REQUIREMENT,
  DEPENDENCIES,
  checkDependency,
  checkDockerRunning,
  checkAllDependencies,
  formatDependencyStatus,
  displayResults,
};
