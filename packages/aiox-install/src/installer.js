/**
 * AIOX Installer - Main installation logic
 *
 * Orchestrates the complete AIOX installation flow:
 * 1. OS detection
 * 2. Dependency checking
 * 3. Profile selection (bob vs advanced)
 * 4. User config setup (L5)
 * 5. Brownfield detection and migration
 * 6. Environment bootstrap
 *
 * @module installer
 */

'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
const { intro, outro, select, confirm, note, isCancel, cancel } = require('@clack/prompts');
const { execa } = require('execa');

const { detectOS, getOSDisplayName } = require('./os-detector');
const { checkAllDependencies, displayResults } = require('./dep-checker');

/**
 * Installation timing tracker
 */
class InstallTimer {
  constructor() {
    this.startTime = Date.now();
  }

  elapsed() {
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  elapsedFormatted() {
    const seconds = this.elapsed();
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  checkTimeout(maxSeconds = 300) {
    return this.elapsed() > maxSeconds;
  }
}

/**
 * Logger with dry-run support
 */
class InstallLogger {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.prefix = this.dryRun ? chalk.yellow('[DRY-RUN] ') : '';
  }

  info(message) {
    console.log(this.prefix + message);
  }

  success(message) {
    console.log(this.prefix + chalk.green('✓ ') + message);
  }

  warn(message) {
    console.log(this.prefix + chalk.yellow('⚠ ') + message);
  }

  error(message) {
    console.log(this.prefix + chalk.red('✗ ') + message);
  }

  debug(message) {
    if (this.verbose) {
      console.log(this.prefix + chalk.dim('  ' + message));
    }
  }

  action(message) {
    if (this.dryRun) {
      console.log(chalk.yellow('[DRY-RUN] Would: ') + message);
    }
  }
}

/**
 * Check if a config-resolver is available (aiox-core installed)
 * @param {string} projectRoot - Project root
 * @returns {Object|null} Config resolver module or null
 */
function tryLoadConfigResolver(projectRoot) {
  const possiblePaths = [
    path.join(projectRoot, '.aiox-core/core/config/config-resolver.js'),
    path.join(projectRoot, 'node_modules/aiox-core/.aiox-core/core/config/config-resolver.js'),
  ];

  for (const configPath of possiblePaths) {
    try {
      if (fs.existsSync(configPath)) {
        return require(configPath);
      }
    } catch {
      // Ignore load errors
    }
  }

  return null;
}

/**
 * Create default user config directly (fallback when config-resolver not available)
 * @param {string} profile - User profile ('bob' or 'advanced')
 * @param {InstallLogger} logger - Logger instance
 * @param {boolean} dryRun - Whether this is a dry run
 */
async function createUserConfigDirect(profile, logger, dryRun) {
  const userConfigDir = path.join(os.homedir(), '.aiox');
  const userConfigPath = path.join(userConfigDir, 'user-config.yaml');

  if (dryRun) {
    logger.action(`Create directory: ${userConfigDir}`);
    logger.action(`Write user config: ${userConfigPath}`);
    logger.action(`Set user_profile: ${profile}`);
    return;
  }

  await fs.ensureDir(userConfigDir);

  let config = {};
  if (await fs.pathExists(userConfigPath)) {
    try {
      const yaml = require('js-yaml');
      const content = await fs.readFile(userConfigPath, 'utf8');
      config = yaml.load(content) || {};
    } catch {
      config = {};
    }
  }

  config.user_profile = profile;
  config.educational_mode = profile === 'bob';

  const yaml = require('js-yaml');
  const yamlContent = yaml.dump(config, { lineWidth: -1 });
  await fs.writeFile(userConfigPath, yamlContent, 'utf8');

  logger.success(`User config created at ${userConfigPath}`);
}

/**
 * Check if this is a brownfield installation (existing AIOX)
 * @param {string} projectRoot - Project root
 * @returns {Object} Brownfield detection result
 */
function detectBrownfield(projectRoot) {
  const result = {
    isBrownfield: false,
    hasLegacyConfig: false,
    hasLayeredConfig: false,
    configResolver: null,
  };

  // Check for legacy monolithic config
  const legacyConfigPath = path.join(projectRoot, '.aiox-core/core-config.yaml');
  if (fs.existsSync(legacyConfigPath)) {
    result.isBrownfield = true;
    result.hasLegacyConfig = true;
  }

  // Check for layered config
  const frameworkConfigPath = path.join(projectRoot, '.aiox-core/framework-config.yaml');
  if (fs.existsSync(frameworkConfigPath)) {
    result.isBrownfield = true;
    result.hasLayeredConfig = true;
  }

  // Check for .aiox-core directory
  const aioxCoreDir = path.join(projectRoot, '.aiox-core');
  if (fs.existsSync(aioxCoreDir)) {
    result.isBrownfield = true;
  }

  // Try to load config resolver
  result.configResolver = tryLoadConfigResolver(projectRoot);

  return result;
}

/**
 * Run the AIOX doctor command
 * @param {string} projectRoot - Project root
 * @param {InstallLogger} logger - Logger instance
 * @param {boolean} dryRun - Whether this is a dry run
 */
async function runDoctor(projectRoot, logger, dryRun) {
  if (dryRun) {
    logger.action('Run: npx aiox-core doctor');
    return;
  }

  const spinner = ora('Running AIOX doctor...').start();

  try {
    const { stdout } = await execa('npx', ['aiox-core', 'doctor'], {
      cwd: projectRoot,
      timeout: 60000,
    });

    spinner.succeed('AIOX doctor completed');

    if (logger.verbose) {
      console.log(chalk.dim(stdout));
    }
  } catch (error) {
    spinner.warn('AIOX doctor had warnings');
    if (logger.verbose) {
      console.log(chalk.yellow(error.message));
    }
  }
}

/**
 * Install aiox-core package
 * @param {string} projectRoot - Project root
 * @param {InstallLogger} logger - Logger instance
 * @param {boolean} dryRun - Whether this is a dry run
 */
async function installAioxCore(projectRoot, logger, dryRun) {
  if (dryRun) {
    logger.action('Run: npm install aiox-core --save-dev');
    return;
  }

  const spinner = ora('Installing aiox-core...').start();

  try {
    await execa('npm', ['install', 'aiox-core', '--save-dev'], {
      cwd: projectRoot,
      timeout: 300000, // 5 minutes
    });

    spinner.succeed('aiox-core installed');
  } catch (error) {
    spinner.fail('Failed to install aiox-core');
    throw error;
  }
}

/**
 * Initialize AIOX in the project
 * @param {string} projectRoot - Project root
 * @param {InstallLogger} logger - Logger instance
 * @param {boolean} dryRun - Whether this is a dry run
 */
async function initializeAiox(projectRoot, logger, dryRun) {
  if (dryRun) {
    logger.action('Run: npx aiox-core install');
    return;
  }

  const spinner = ora('Initializing AIOX...').start();

  try {
    await execa('npx', ['aiox-core', 'install'], {
      cwd: projectRoot,
      timeout: 120000, // 2 minutes
    });

    spinner.succeed('AIOX initialized');
  } catch (error) {
    spinner.fail('Failed to initialize AIOX');
    throw error;
  }
}

/**
 * Main installer entry point
 * @param {Object} options - Installation options
 * @param {boolean} options.dryRun - Preview without making changes
 * @param {boolean} options.verbose - Enable verbose output
 * @param {string} options.profile - Profile to use (bob or advanced)
 * @param {boolean} options.skipDeps - Skip dependency checking
 * @param {boolean} options.color - Enable/disable colors
 */
async function runInstaller(options = {}) {
  const timer = new InstallTimer();
  const logger = new InstallLogger(options);
  const projectRoot = process.cwd();

  // Disable colors if requested
  if (!options.color) {
    chalk.level = 0;
  }

  // Introduction
  intro(chalk.bgCyan(' AIOX Installer '));

  if (options.dryRun) {
    note(
      'Dry-run mode enabled.\nNo changes will be made to your system.',
      'Preview Mode',
    );
  }

  // Step 1: OS Detection
  console.log('');
  const osInfo = detectOS();
  logger.info(`Detected OS: ${chalk.bold(getOSDisplayName(osInfo))}`);

  if (osInfo.notes) {
    for (const noteText of osInfo.notes) {
      logger.debug(noteText);
    }
  }

  // Step 2: Dependency Check
  if (!options.skipDeps) {
    console.log('');
    const depResults = checkAllDependencies(osInfo);

    if (options.verbose) {
      displayResults(depResults);
    } else {
      // Show summary only
      if (depResults.passed) {
        logger.success('All required dependencies installed');
      } else {
        logger.error('Missing required dependencies');
        console.log('');
        console.log(depResults.summary);
        console.log('');
        logger.info('Please install missing dependencies and try again.');
        process.exit(1);
      }

      if (depResults.hasWarnings) {
        logger.warn(`${depResults.warnings.length} optional dependencies not installed`);
        if (options.verbose) {
          for (const warning of depResults.warnings) {
            logger.debug(`${warning.name}: ${warning.impact}`);
          }
        }
      }
    }
  }

  // Step 3: Profile Selection
  let profile = options.profile;

  if (!profile) {
    console.log('');
    const profileSelection = await select({
      message: 'Select your AIOX profile:',
      options: [
        {
          value: 'bob',
          label: 'Bob Mode (Recommended)',
          hint: 'Simplified interface - perfect for getting started',
        },
        {
          value: 'advanced',
          label: 'Advanced Mode',
          hint: 'Full access to all agents and commands',
        },
      ],
      initialValue: 'bob',
    });

    if (isCancel(profileSelection)) {
      cancel('Installation cancelled');
      process.exit(0);
    }

    profile = profileSelection;
  }

  logger.info(`Selected profile: ${chalk.bold(profile)}`);

  // Step 4: Create User Config
  console.log('');
  await createUserConfigDirect(profile, logger, options.dryRun);

  // Step 5: Brownfield Detection
  console.log('');
  const brownfield = detectBrownfield(projectRoot);

  if (brownfield.isBrownfield) {
    logger.info('Existing AIOX installation detected');

    if (brownfield.hasLegacyConfig && !brownfield.hasLayeredConfig) {
      logger.warn('Legacy configuration format detected');

      const shouldMigrate = await confirm({
        message: 'Would you like to migrate to the new layered configuration?',
        initialValue: true,
      });

      if (isCancel(shouldMigrate)) {
        cancel('Installation cancelled');
        process.exit(0);
      }

      if (shouldMigrate && !options.dryRun) {
        const spinner = ora('Migrating configuration...').start();
        try {
          await execa('npx', ['aiox-core', 'config', 'migrate'], {
            cwd: projectRoot,
            timeout: 60000,
          });
          spinner.succeed('Configuration migrated');
        } catch (error) {
          spinner.warn('Migration had warnings - manual review recommended');
          logger.debug(error.message);
        }
      } else if (options.dryRun) {
        logger.action('Run: npx aiox-core config migrate');
      }
    } else {
      logger.success('Configuration is up to date');
    }
  } else {
    // Greenfield: New installation
    logger.info('New installation detected');

    // Check if package.json exists
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const hasPackageJson = await fs.pathExists(packageJsonPath);

    if (!hasPackageJson) {
      logger.warn('No package.json found - creating one');
      if (!options.dryRun) {
        await execa('npm', ['init', '-y'], { cwd: projectRoot });
        logger.success('package.json created');
      } else {
        logger.action('Run: npm init -y');
      }
    }

    // Install aiox-core
    await installAioxCore(projectRoot, logger, options.dryRun);

    // Initialize AIOX
    await initializeAiox(projectRoot, logger, options.dryRun);
  }

  // Step 6: Run doctor
  console.log('');
  await runDoctor(projectRoot, logger, options.dryRun);

  // Check installation time
  const elapsed = timer.elapsedFormatted();
  if (timer.checkTimeout(300)) {
    logger.warn(`Installation took ${elapsed} (exceeded 5 minute target)`);
  }

  // Completion
  console.log('');
  if (options.dryRun) {
    outro(chalk.yellow(`Dry-run complete in ${elapsed}. No changes were made.`));
  } else {
    outro(chalk.green(`AIOX installed successfully in ${elapsed}!`));
    console.log('');
    console.log(chalk.dim('Next steps:'));
    console.log(chalk.dim('  1. Run `npx aiox-core info` to see your configuration'));
    console.log(chalk.dim('  2. Activate an agent with @agent-name (e.g., @dev)'));
    if (profile === 'bob') {
      console.log(chalk.dim('  3. Just talk to Bob - he\'ll orchestrate everything!'));
    }
  }
}

module.exports = {
  runInstaller,
  InstallTimer,
  InstallLogger,
  detectBrownfield,
  tryLoadConfigResolver,
  createUserConfigDirect,
};
