/**
 * Troubleshooting System
 * Task 1.8.6: Provides actionable troubleshooting for errors
 *
 * @module wizard/validation/troubleshooting-system
 */

const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Troubleshooting database
 * Maps error codes to detailed troubleshooting information
 */
const TROUBLESHOOTING_DATABASE = {
  ENV_FILE_MISSING: {
    problem: '.env file not found',
    causes: [
      'Environment configuration step failed',
      'File creation permissions issue',
      '.env accidentally deleted',
    ],
    solutions: [
      'Re-run wizard: npx @SynkraAI/aiox@latest init',
      'Manually create .env from template: cp .env.example .env',
      'Check file permissions in project directory',
    ],
    docs: 'https://docs.SynkraAI.com/installation/environment',
    priority: 'critical',
  },

  CORE_CONFIG_MISSING: {
    problem: 'core-config.yaml not found',
    causes: [
      'Environment configuration step failed',
      '.aiox-core directory missing',
      'File creation failed',
    ],
    solutions: [
      'Re-run wizard: npx @SynkraAI/aiox@latest init',
      'Check .aiox-core directory exists',
      'Manually create from template',
    ],
    docs: 'https://docs.SynkraAI.com/configuration/core-config',
    priority: 'high',
  },

  MCP_HEALTH_CHECK_FAILED: {
    problem: 'MCP health check failed',
    causes: [
      'API key missing or invalid',
      'Network connectivity issues',
      'MCP service temporarily unavailable',
      'Package not installed correctly',
    ],
    solutions: [
      'Verify API key in .env file',
      'Test network: curl https://api.service.com/health',
      'Retry MCP installation: npm run install:mcps',
      'Check MCP service status',
      'Verify npx can access package: npx -y [package-name] --version',
    ],
    docs: 'https://docs.SynkraAI.com/mcps/troubleshooting',
    priority: 'medium',
  },

  ALL_MCP_HEALTH_CHECKS_FAILED: {
    problem: 'All MCP health checks failed',
    causes: [
      'Network connectivity issue',
      'MCPs not installed correctly',
      'Configuration file corrupted',
      'API keys not configured',
    ],
    solutions: [
      'Check internet connection',
      'Re-run MCP installation',
      'Verify .mcp.json syntax',
      'Configure API keys in .env',
      'Delete .mcp.json and reinstall',
    ],
    docs: 'https://docs.SynkraAI.com/mcps/troubleshooting',
    priority: 'high',
  },

  GITIGNORE_CRITICAL_MISSING: {
    problem: '.gitignore missing critical entries',
    causes: [
      '.gitignore not created during setup',
      '.gitignore manually edited incorrectly',
      'Git not initialized',
    ],
    solutions: [
      'Add missing entries to .gitignore',
      'Copy from template: .env, node_modules, *.key, *.pem',
      'Initialize git if needed: git init',
    ],
    docs: 'https://docs.SynkraAI.com/security/gitignore',
    priority: 'high',
  },

  DEPS_INSTALL_FAILED: {
    problem: 'Dependencies installation failed',
    causes: [
      'Network connectivity issues',
      'Package manager not installed',
      'npm/yarn registry unavailable',
      'Disk space insufficient',
    ],
    solutions: [
      'Check internet connection',
      'Verify package manager installed: npm --version',
      'Clear cache: npm cache clean --force',
      'Try different package manager: yarn or pnpm',
      'Check disk space: df -h (Unix) or dir (Windows)',
    ],
    docs: 'https://docs.SynkraAI.com/installation/dependencies',
    priority: 'critical',
  },

  CRITICAL_DEPS_MISSING: {
    problem: 'Critical dependencies missing',
    causes: [
      'Dependency installation incomplete',
      'node_modules corrupted',
      'Package installation failed silently',
    ],
    solutions: [
      'Delete node_modules: rm -rf node_modules',
      'Delete lock file: rm package-lock.json',
      'Reinstall: npm install',
      'Try clean install: npm ci',
    ],
    docs: 'https://docs.SynkraAI.com/installation/dependencies',
    priority: 'high',
  },

  VULNERABILITIES_FOUND: {
    problem: 'Security vulnerabilities found in dependencies',
    causes: [
      'Outdated packages with known vulnerabilities',
      'Transitive dependencies with security issues',
    ],
    solutions: [
      'Run: npm audit fix',
      'Run: npm audit fix --force (if needed)',
      'Update packages: npm update',
      'Review: npm audit for details',
    ],
    docs: 'https://docs.npmjs.com/cli/v8/commands/npm-audit',
    priority: 'medium',
  },

  ENV_PERMISSIONS_INSECURE: {
    problem: '.env file permissions too permissive',
    causes: [
      'File created with default permissions',
      'Permissions not set during installation',
    ],
    solutions: [
      'Run: chmod 600 .env',
      'Verify: ls -la .env',
    ],
    docs: 'https://docs.SynkraAI.com/security/file-permissions',
    priority: 'medium',
  },
};

/**
 * Offer troubleshooting for errors
 *
 * @param {Array} errors - Array of error objects
 */
async function offerTroubleshooting(errors) {
  if (!errors || errors.length === 0) {
    return;
  }

  console.log('');
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('🔧 Troubleshooting Guide'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════'));
  console.log('');

  // Group errors by code
  const errorsByCode = {};
  errors.forEach(error => {
    const code = error.code || 'UNKNOWN';
    if (!errorsByCode[code]) {
      errorsByCode[code] = [];
    }
    errorsByCode[code].push(error);
  });

  // Sort by priority
  const errorCodes = Object.keys(errorsByCode).sort((a, b) => {
    const priorityA = TROUBLESHOOTING_DATABASE[a]?.priority || 'low';
    const priorityB = TROUBLESHOOTING_DATABASE[b]?.priority || 'low';
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[priorityA] - priorityOrder[priorityB];
  });

  // Display troubleshooting for each error code
  for (const code of errorCodes) {
    const errorInstances = errorsByCode[code];
    const troubleshooting = TROUBLESHOOTING_DATABASE[code];

    if (troubleshooting) {
      displayTroubleshooting(code, troubleshooting, errorInstances);
    } else {
      displayGenericTroubleshooting(code, errorInstances);
    }
  }

  // Ask if user wants to see full logs
  const { viewLogs } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'viewLogs',
      message: 'Would you like to see installation logs for more details?',
      default: false,
    },
  ]);

  if (viewLogs) {
    console.log('');
    console.log(chalk.bold('📄 Installation Logs:'));
    console.log(chalk.dim('  - .aiox/install-log.txt'));
    console.log(chalk.dim('  - .aiox/install-errors.log'));
    console.log('');
    console.log(chalk.dim('View with: cat .aiox/install-log.txt'));
  }

  // Offer to open documentation
  const { openDocs } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'openDocs',
      message: 'Would you like to open the troubleshooting documentation?',
      default: false,
    },
  ]);

  if (openDocs) {
    console.log('');
    console.log(chalk.green('📚 Documentation:'));
    console.log(chalk.green('  https://docs.SynkraAI.com/troubleshooting'));
    console.log('');
  }

  // Offer support contact
  console.log('');
  console.log(chalk.bold('💬 Need Help?'));
  console.log(chalk.dim('  - GitHub Issues: https://github.com/SynkraAI/aiox/issues'));
  console.log(chalk.dim('  - Documentation: https://docs.SynkraAI.com'));
  console.log('');
}

/**
 * Display troubleshooting for a specific error
 * @private
 */
function displayTroubleshooting(code, troubleshooting, errorInstances) {
  const priorityIcon = {
    critical: chalk.red('🔴'),
    high: chalk.yellow('🟡'),
    medium: chalk.blue('🔵'),
    low: chalk.gray('⚪'),
  }[troubleshooting.priority] || '⚪';

  console.log(chalk.bold(`${priorityIcon} ${troubleshooting.problem}`));
  console.log('');

  // Show affected items
  if (errorInstances.length > 1) {
    console.log(chalk.dim(`Affected items (${errorInstances.length}):`));
    errorInstances.slice(0, 3).forEach(err => {
      if (err.file) {
        console.log(chalk.dim(`  - ${err.file}`));
      } else if (err.mcp) {
        console.log(chalk.dim(`  - ${err.mcp}`));
      }
    });
    if (errorInstances.length > 3) {
      console.log(chalk.dim(`  ... and ${errorInstances.length - 3} more`));
    }
    console.log('');
  }

  // Show causes
  if (troubleshooting.causes && troubleshooting.causes.length > 0) {
    console.log(chalk.bold('Possible Causes:'));
    troubleshooting.causes.forEach((cause, i) => {
      console.log(`  ${i + 1}. ${cause}`);
    });
    console.log('');
  }

  // Show solutions
  console.log(chalk.bold.green('Solutions:'));
  troubleshooting.solutions.forEach((solution, i) => {
    console.log(chalk.green(`  ${i + 1}. ${solution}`));
  });
  console.log('');

  // Show documentation link
  if (troubleshooting.docs) {
    console.log(chalk.dim(`📖 Docs: ${troubleshooting.docs}`));
    console.log('');
  }

  console.log(chalk.dim('─────────────────────────────────────────────────'));
  console.log('');
}

/**
 * Display generic troubleshooting
 * @private
 */
function displayGenericTroubleshooting(code, errorInstances) {
  console.log(chalk.bold(`⚠️  ${code}`));
  console.log('');

  errorInstances.forEach(err => {
    console.log(`  ${err.message}`);
    if (err.solution) {
      console.log(chalk.green(`  → ${err.solution}`));
    }
  });

  console.log('');
  console.log(chalk.bold.green('General Solutions:'));
  console.log(chalk.green('  1. Review error message above'));
  console.log(chalk.green('  2. Check installation logs in .aiox/'));
  console.log(chalk.green('  3. Re-run installation'));
  console.log(chalk.green('  4. Contact support if issue persists'));
  console.log('');

  console.log(chalk.dim('─────────────────────────────────────────────────'));
  console.log('');
}

module.exports = {
  offerTroubleshooting,
  TROUBLESHOOTING_DATABASE,
};
