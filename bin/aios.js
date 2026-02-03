#!/usr/bin/env node

/**
 * AIOS-FullStack CLI
 * Main entry point - Standalone (no external dependencies for npx compatibility)
 * Version: 1.2.0
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Read package.json for version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

// Helper: Run initialization wizard
async function runWizard() {
  // Use the new v2.1 wizard from src/wizard/index.js
  const wizardPath = path.join(__dirname, '..', 'src', 'wizard', 'index.js');

  if (!fs.existsSync(wizardPath)) {
    // Fallback to legacy wizard if new wizard not found
    const legacyScript = path.join(__dirname, 'aios-init.js');
    if (fs.existsSync(legacyScript)) {
      console.log('⚠️  Using legacy wizard (src/wizard not found)');
      require(legacyScript);
      return;
    }
    console.error('❌ Initialization wizard not found');
    console.error('Please ensure AIOS-FullStack is installed correctly.');
    process.exit(1);
  }

  try {
    // Run the new v2.1 wizard
    const { runWizard: executeWizard } = require(wizardPath);
    await executeWizard();
  } catch (error) {
    console.error('❌ Wizard error:', error.message);
    process.exit(1);
  }
}

// Helper: Show help
function showHelp() {
  console.log(`
AIOS-FullStack v${packageJson.version}
AI-Orchestrated System for Full Stack Development

USAGE:
  npx @synkra/aios-core@latest              # Run installation wizard
  npx @synkra/aios-core@latest install      # Install in current project
  npx @synkra/aios-core@latest init <name>  # Create new project
  npx @synkra/aios-core@latest update       # Update to latest version
  npx @synkra/aios-core@latest validate     # Validate installation integrity
  npx @synkra/aios-core@latest info         # Show system info
  npx @synkra/aios-core@latest doctor       # Run diagnostics
  npx @synkra/aios-core@latest --version    # Show version
  npx @synkra/aios-core@latest --version -d # Show detailed version info
  npx @synkra/aios-core@latest --help       # Show this help

UPDATE:
  aios update                    # Update to latest version
  aios update --check            # Check for updates without applying
  aios update --dry-run          # Preview what would be updated
  aios update --force            # Force update even if up-to-date
  aios update --verbose          # Show detailed output

VALIDATION:
  aios validate                    # Validate installation integrity
  aios validate --repair           # Repair missing/corrupted files
  aios validate --repair --dry-run # Preview repairs
  aios validate --detailed         # Show detailed file list

SERVICE DISCOVERY:
  aios workers search <query>            # Search for workers
  aios workers search "json" --category=data
  aios workers search "transform" --tags=etl,data
  aios workers search "api" --format=json

EXAMPLES:
  # Install in current directory
  npx @synkra/aios-core@latest

  # Install with minimal mode (only expansion-creator)
  npx @synkra/aios-core-minimal@latest

  # Create new project
  npx @synkra/aios-core@latest init my-project

  # Search for workers
  aios workers search "json csv"

For more information, visit: https://github.com/SynkraAI/aios-core
`);
}

// Helper: Show version
async function showVersion() {
  const isDetailed = args.includes('--detailed') || args.includes('-d');

  if (!isDetailed) {
    // Simple version output (backwards compatible)
    console.log(packageJson.version);
    return;
  }

  // Detailed version output (Story 7.2: Version Tracking)
  console.log(`AIOS-FullStack v${packageJson.version}`);
  console.log('Package: @synkra/aios-core');

  // Check for local installation
  const localVersionPath = path.join(process.cwd(), '.aios-core', 'version.json');

  if (fs.existsSync(localVersionPath)) {
    try {
      const versionInfo = JSON.parse(fs.readFileSync(localVersionPath, 'utf8'));
      console.log('\n📦 Local Installation:');
      console.log(`  Version:    ${versionInfo.version}`);
      console.log(`  Mode:       ${versionInfo.mode || 'unknown'}`);

      if (versionInfo.installedAt) {
        const installedDate = new Date(versionInfo.installedAt);
        console.log(`  Installed:  ${installedDate.toLocaleDateString()}`);
      }

      if (versionInfo.updatedAt) {
        const updatedDate = new Date(versionInfo.updatedAt);
        console.log(`  Updated:    ${updatedDate.toLocaleDateString()}`);
      }

      if (versionInfo.fileHashes) {
        const fileCount = Object.keys(versionInfo.fileHashes).length;
        console.log(`  Files:      ${fileCount} tracked`);
      }

      if (versionInfo.customized && versionInfo.customized.length > 0) {
        console.log(`  Customized: ${versionInfo.customized.length} files`);
      }

      // Version comparison
      if (versionInfo.version !== packageJson.version) {
        console.log('\n⚠️  Version mismatch!');
        console.log(`  Local:  ${versionInfo.version}`);
        console.log(`  Latest: ${packageJson.version}`);
        console.log('  Run \'npx aios-core update\' to update.');
      } else {
        console.log('\n✅ Up to date');
      }
    } catch (error) {
      console.log(`\n⚠️  Could not read version.json: ${error.message}`);
    }
  } else {
    console.log('\n📭 No local installation found');
    console.log('  Run \'npx aios-core install\' to install AIOS in this project.');
  }
}

// Helper: Show system info
function showInfo() {
  console.log('📊 AIOS-FullStack System Information\n');
  console.log(`Version: ${packageJson.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Working Directory: ${process.cwd()}`);
  console.log(`Install Location: ${path.join(__dirname, '..')}`);

  // Check if .aios-core exists
  const aiosCoreDir = path.join(__dirname, '..', '.aios-core');
  if (fs.existsSync(aiosCoreDir)) {
    console.log('\n✓ AIOS Core installed');

    // Count components
    const countFiles = (dir) => {
      try {
        return fs.readdirSync(dir).length;
      } catch {
        return 0;
      }
    };

    console.log(`  - Agents: ${countFiles(path.join(aiosCoreDir, 'agents'))}`);
    console.log(`  - Tasks: ${countFiles(path.join(aiosCoreDir, 'tasks'))}`);
    console.log(`  - Templates: ${countFiles(path.join(aiosCoreDir, 'templates'))}`);
    console.log(`  - Workflows: ${countFiles(path.join(aiosCoreDir, 'workflows'))}`);
  } else {
    console.log('\n⚠️  AIOS Core not found');
  }
}

// Helper: Run installation validation
async function runValidate() {
  const validateArgs = args.slice(1); // Remove 'validate' from args

  try {
    // Load the validate command module
    const { createValidateCommand } = require('../.aios-core/cli/commands/validate/index.js');
    const validateCmd = createValidateCommand();

    // Parse and execute (Note: don't include 'validate' as it's the command name, not an argument)
    await validateCmd.parseAsync(['node', 'aios', ...validateArgs]);
  } catch (_error) {
    // Fallback: Run quick validation inline
    console.log('Running installation validation...\n');

    try {
      const validatorPath = path.join(
        __dirname,
        '..',
        'src',
        'installer',
        'post-install-validator.js',
      );
      const { PostInstallValidator, formatReport } = require(validatorPath);

      const projectRoot = process.cwd();
      const validator = new PostInstallValidator(projectRoot, path.join(__dirname, '..'));
      const report = await validator.validate();

      console.log(formatReport(report, { colors: true }));

      if (
        report.status === 'failed' ||
        report.stats.missingFiles > 0 ||
        report.stats.corruptedFiles > 0
      ) {
        process.exit(1);
      }
    } catch (validatorError) {
      console.error(`❌ Validation error: ${validatorError.message}`);
      if (args.includes('--verbose') || args.includes('-v')) {
        console.error(validatorError.stack);
      }
      process.exit(2);
    }
  }
}

// Helper: Run update command
async function runUpdate() {
  const updateArgs = args.slice(1);
  const isCheck = updateArgs.includes('--check');
  const isDryRun = updateArgs.includes('--dry-run');
  const isForce = updateArgs.includes('--force');
  const isVerbose = updateArgs.includes('--verbose') || updateArgs.includes('-v');

  try {
    const updaterPath = path.join(__dirname, '..', 'packages', 'installer', 'src', 'updater', 'index.js');

    if (!fs.existsSync(updaterPath)) {
      console.error('❌ Updater module not found');
      console.error('Please ensure AIOS-FullStack is installed correctly.');
      process.exit(1);
    }

    const { AIOSUpdater, formatCheckResult, formatUpdateResult } = require(updaterPath);

    const updater = new AIOSUpdater(process.cwd(), {
      verbose: isVerbose,
      force: isForce,
    });

    if (isCheck) {
      // Check only mode
      console.log('🔍 Checking for updates...\n');
      const result = await updater.checkForUpdates();
      console.log(formatCheckResult(result, { colors: true }));

      if (result.status === 'check_failed') {
        process.exit(1);
      }
    } else {
      // Update mode
      console.log('🔄 AIOS Update\n');

      const result = await updater.update({
        dryRun: isDryRun,
        onProgress: (phase, message) => {
          if (isVerbose) {
            console.log(`[${phase}] ${message}`);
          }
        },
      });

      console.log(formatUpdateResult(result, { colors: true }));

      if (!result.success && result.error !== 'Already up to date') {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`❌ Update error: ${error.message}`);
    if (args.includes('--verbose') || args.includes('-v')) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Helper: Run doctor diagnostics
function runDoctor() {
  console.log('🏥 AIOS System Diagnostics\n');

  let hasErrors = false;

  // Check Node.js version
  const nodeVersion = process.version.replace('v', '');
  const requiredNodeVersion = '18.0.0';
  const compareVersions = (a, b) => {
    const pa = a.split('.').map((n) => parseInt(n, 10));
    const pb = b.split('.').map((n) => parseInt(n, 10));
    for (let i = 0; i < 3; i++) {
      const na = pa[i] || 0;
      const nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  };
  const nodeOk = compareVersions(nodeVersion, requiredNodeVersion) >= 0;

  console.log(
    `${nodeOk ? '✔' : '✗'} Node.js version: ${process.version} ${nodeOk ? '(meets requirement: >=18.0.0)' : '(requires >=18.0.0)'}`,
  );
  if (!nodeOk) hasErrors = true;

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✔ npm version: ${npmVersion}`);
  } catch {
    console.log('✗ npm not found');
    hasErrors = true;
  }

  // Check git
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(`✔ Git installed: ${gitVersion}`);
  } catch {
    console.log('⚠️  Git not found (optional but recommended)');
  }

  // Check AIOS installation
  const aiosCoreDir = path.join(__dirname, '..', '.aios-core');
  if (fs.existsSync(aiosCoreDir)) {
    console.log(`✔ Synkra AIOS: v${packageJson.version}`);
  } else {
    console.log('✗ AIOS Core not installed');
    console.log('  Run: npx @synkra/aios-core@latest');
    hasErrors = true;
  }

  // Summary
  console.log('');
  if (hasErrors) {
    console.log('⚠️  Some issues were detected.');
    process.exit(1);
  } else {
    console.log('✅ All checks passed! Your installation is healthy.');
  }
}

// Helper: Create new project
// Helper: Show init help
function showInitHelp() {
  console.log(`
Usage: npx aios-core init <project-name> [options]

Create a new AIOS project with the specified name.

Options:
  --force              Force creation in non-empty directory
  --skip-install       Skip npm dependency installation
  --template <name>    Use specific template (default: default)
  -t <name>            Shorthand for --template
  -h, --help           Show this help message

Available Templates:
  default     Full installation with all agents, tasks, and workflows
  minimal     Essential files only (dev agent + basic tasks)
  enterprise  Everything + dashboards + team integrations

Examples:
  npx aios-core init my-project
  npx aios-core init my-project --template minimal
  npx aios-core init my-project --force --skip-install
  npx aios-core init . --template enterprise
`);
}

async function initProject() {
  // 1. Parse ALL args after 'init'
  const initArgs = args.slice(1);

  // 2. Handle --help FIRST (before creating any directories)
  if (initArgs.includes('--help') || initArgs.includes('-h')) {
    showInitHelp();
    return;
  }

  // 3. Parse flags
  const isForce = initArgs.includes('--force');
  const skipInstall = initArgs.includes('--skip-install');

  // Template with argument
  const templateIndex = initArgs.findIndex((a) => a === '--template' || a === '-t');
  let template = 'default';
  if (templateIndex !== -1) {
    template = initArgs[templateIndex + 1];
    if (!template || template.startsWith('-')) {
      console.error('❌ --template requires a template name');
      console.error('Available templates: default, minimal, enterprise');
      process.exit(1);
    }
  }

  // Validate template
  const validTemplates = ['default', 'minimal', 'enterprise'];
  if (!validTemplates.includes(template)) {
    console.error(`❌ Unknown template: ${template}`);
    console.error(`Available templates: ${validTemplates.join(', ')}`);
    process.exit(1);
  }

  // 4. Extract project name (anything that doesn't start with - and isn't a template value)
  const projectName = initArgs.find((arg, i) => {
    if (arg.startsWith('-')) return false;
    // Skip if it's the value after --template
    const prevArg = initArgs[i - 1];
    if (prevArg === '--template' || prevArg === '-t') return false;
    return true;
  });

  if (!projectName) {
    console.error('❌ Project name is required');
    console.log('\nUsage: npx aios-core init <project-name> [options]');
    console.log('Run with --help for more information.');
    process.exit(1);
  }

  // 5. Handle "." to install in current directory
  const isCurrentDir = projectName === '.';
  const targetPath = isCurrentDir ? process.cwd() : path.join(process.cwd(), projectName);
  const displayName = isCurrentDir ? path.basename(process.cwd()) : projectName;

  // 6. Check if directory exists
  if (fs.existsSync(targetPath) && !isCurrentDir) {
    const contents = fs.readdirSync(targetPath).filter((f) => !f.startsWith('.'));
    if (contents.length > 0 && !isForce) {
      console.error(`❌ Directory already exists and is not empty: ${projectName}`);
      console.error('Use --force to overwrite.');
      process.exit(1);
    }
    if (contents.length > 0 && isForce) {
      console.log(`⚠️  Using --force: overwriting existing directory: ${projectName}`);
    } else {
      console.log(`✓ Using existing empty directory: ${projectName}`);
    }
  } else if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
    console.log(`✓ Created directory: ${projectName}`);
  }

  console.log(`Creating new AIOS project: ${displayName}`);
  if (template !== 'default') {
    console.log(`Template: ${template}`);
  }
  if (skipInstall) {
    console.log(`Skip install: enabled`);
  }
  console.log('');

  // 7. Change to project directory (if not already there)
  if (!isCurrentDir) {
    process.chdir(targetPath);
  }

  // 8. Run the initialization wizard with options
  await runWizard({
    template,
    skipInstall,
    force: isForce,
  });
}

// Command routing (async main function)
async function main() {
  switch (command) {
    case 'workers':
      // Service Discovery CLI - Story 2.7
      try {
        const { run } = require('../.aios-core/cli/index.js');
        await run(process.argv);
      } catch (error) {
        console.error(`❌ Workers command error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'install':
      // Install in current project
      console.log('AIOS-FullStack Installation\n');
      await runWizard();
      break;

    case 'init': {
      // Create new project (flags parsed inside initProject)
      await initProject();
      break;
    }

    case 'info':
      showInfo();
      break;

    case 'doctor':
      runDoctor();
      break;

    case 'validate':
      // Post-installation validation - Story 6.19
      await runValidate();
      break;

    case 'update':
      // Update to latest version - Epic 7
      await runUpdate();
      break;

    case '--version':
    case '-v':
    case '-V':
      await showVersion();
      break;

    case '--help':
    case '-h':
      showHelp();
      break;

    case undefined:
      // No arguments - run wizard directly (npx default behavior)
      console.log('AIOS-FullStack Installation\n');
      await runWizard();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('\nRun with --help to see available commands');
      process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
