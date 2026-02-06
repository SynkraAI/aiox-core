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
async function runWizard(options = {}) {
  // Use the new v2.1 wizard from packages/installer/src/wizard/index.js
  const wizardPath = path.join(__dirname, '..', 'packages', 'installer', 'src', 'wizard', 'index.js');

  if (!fs.existsSync(wizardPath)) {
    // Fallback to legacy wizard if new wizard not found
    const legacyScript = path.join(__dirname, 'aios-init.js');
    if (fs.existsSync(legacyScript)) {
      if (!options.quiet) {
        console.log('⚠️  Using legacy wizard (src/wizard not found)');
      }
      // Legacy wizard doesn't support options, pass via env vars
      process.env.AIOS_INSTALL_FORCE = options.force ? '1' : '';
      process.env.AIOS_INSTALL_QUIET = options.quiet ? '1' : '';
      process.env.AIOS_INSTALL_DRY_RUN = options.dryRun ? '1' : '';
      require(legacyScript);
      return;
    }
    console.error('❌ Initialization wizard not found');
    console.error('Please ensure AIOS-FullStack is installed correctly.');
    process.exit(1);
  }

  try {
    // Run the new v2.1 wizard with options
    const { runWizard: executeWizard } = require(wizardPath);
    await executeWizard(options);
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

CONFIGURATION:
  aios config show                       # Show resolved configuration
  aios config show --debug               # Show with source annotations
  aios config diff --levels L1,L2        # Compare config levels
  aios config migrate                    # Migrate monolithic to layered
  aios config validate                   # Validate config files
  aios config init-local                 # Create local-config.yaml

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

  // Check AIOS Pro status (Task 5.1)
  const proDir = path.join(__dirname, '..', 'pro');
  if (fs.existsSync(proDir)) {
    console.log('\n✓ AIOS Pro installed');

    try {
      const { featureGate } = require(path.join(proDir, 'license', 'feature-gate'));
      const state = featureGate.getLicenseState();
      const info = featureGate.getLicenseInfo();

      const stateEmoji = {
        'Active': '✅',
        'Grace': '⚠️',
        'Expired': '❌',
        'Not Activated': '➖',
      };

      console.log(`  - License: ${stateEmoji[state] || ''} ${state}`);

      if (info && info.features) {
        const availableCount = featureGate.listAvailable().length;
        console.log(`  - Features: ${availableCount} available`);
      }
    } catch {
      console.log('  - License: Unable to check status');
    }
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
        'packages',
        'installer',
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
async function runDoctor() {
  const doctorArgs = args.slice(1);
  const shouldFix = doctorArgs.includes('--fix');
  const isDryRun = doctorArgs.includes('--dry-run');
  const showHelp = doctorArgs.includes('--help') || doctorArgs.includes('-h');

  if (showHelp) {
    console.log(`
Usage: aios-core doctor [options]

Run system diagnostics and optionally fix issues.

Options:
  --fix          Attempt to automatically fix detected issues
  --dry-run      Show what would be fixed without making changes
  -h, --help     Show this help message

Examples:
  $ npx aios-core doctor              # Run diagnostics
  $ npx aios-core doctor --fix        # Fix detected issues
  $ npx aios-core doctor --dry-run    # Preview fixes
`);
    return;
  }

  console.log('🏥 AIOS System Diagnostics\n');

  const issues = [];
  let hasErrors = false;

  // Helper: Compare semver versions
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

  // Check 1: Node.js version
  const nodeVersion = process.version.replace('v', '');
  const requiredNodeVersion = '18.0.0';
  const nodeOk = compareVersions(nodeVersion, requiredNodeVersion) >= 0;

  if (!nodeOk) {
    issues.push({
      type: 'node_version',
      autoFix: false,
      message: `Node.js version: ${process.version} (requires >=18.0.0)`,
      suggestion: 'nvm install 20 && nvm use 20',
    });
    hasErrors = true;
  }
  console.log(
    `${nodeOk ? '✔' : '✗'} Node.js version: ${process.version} ${nodeOk ? '(meets requirement: >=18.0.0)' : '(requires >=18.0.0)'}`,
  );

  // Check 2: npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✔ npm version: ${npmVersion}`);
  } catch {
    issues.push({
      type: 'npm',
      autoFix: false,
      message: 'npm not found',
      suggestion: 'Install Node.js from https://nodejs.org (includes npm)',
    });
    console.log('✗ npm not found');
    hasErrors = true;
  }

  // Check 3: Git
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(`✔ Git installed: ${gitVersion}`);
  } catch {
    issues.push({
      type: 'git',
      autoFix: false,
      message: 'Git not found (optional but recommended)',
      suggestion: 'Install Git from https://git-scm.com',
    });
    console.log('⚠️  Git not found (optional but recommended)');
  }

  // Check 4: AIOS installation
  const aiosCoreDir = path.join(__dirname, '..', '.aios-core');
  if (fs.existsSync(aiosCoreDir)) {
    console.log(`✔ Synkra AIOS: v${packageJson.version}`);

    // Check for corruption using validate (if available)
    try {
      const validatorPath = path.join(__dirname, '..', 'packages', 'installer', 'src', 'installer', 'post-install-validator');
      const { PostInstallValidator } = require(validatorPath);
      const validator = new PostInstallValidator(process.cwd(), path.join(__dirname, '..'));
      const report = await validator.validate();

      if (report.stats && (report.stats.missingFiles > 0 || report.stats.corruptedFiles > 0)) {
        issues.push({
          type: 'aios_corrupted',
          autoFix: true,
          message: `AIOS Core: ${report.stats.missingFiles} missing, ${report.stats.corruptedFiles} corrupted files`,
          fixAction: async () => {
            console.log('  🔧 Repairing AIOS installation...');
            await validator.repair();
            console.log('  ✓ Repair complete');
          },
        });
        hasErrors = true;
        console.log(`⚠️  AIOS Core: ${report.stats.missingFiles} missing, ${report.stats.corruptedFiles} corrupted files`);
      }
    } catch {
      // Validation not available, skip corruption check
    }
  } else {
    issues.push({
      type: 'aios_missing',
      autoFix: true,
      message: 'AIOS Core not installed',
      fixAction: async () => {
        console.log('  🔧 Installing AIOS...');
        try {
          execSync('npx aios-core install --force --quiet', { stdio: 'inherit', timeout: 60000 });
          console.log('  ✓ Installation complete');
        } catch (installError) {
          console.error(`  ✗ Installation failed: ${installError.message}`);
          throw installError;
        }
      },
    });
    hasErrors = true;
    console.log('✗ AIOS Core not installed');
    console.log('  Run: npx @synkra/aios-core@latest');
  }

  // Check 5: AIOS Pro license status (Task 5.1)
  const proDir = path.join(__dirname, '..', 'pro');
  if (fs.existsSync(proDir)) {
    try {
      const { featureGate } = require(path.join(proDir, 'license', 'feature-gate'));
      const state = featureGate.getLicenseState();

      const stateEmoji = {
        'Active': '✔',
        'Grace': '⚠️',
        'Expired': '✗',
        'Not Activated': '➖',
      };

      if (state === 'Active') {
        console.log(`${stateEmoji[state]} AIOS Pro: License active`);
      } else if (state === 'Grace') {
        console.log(`${stateEmoji[state]} AIOS Pro: License in grace period`);
        console.log('  Run: aios pro validate');
      } else if (state === 'Expired') {
        console.log(`${stateEmoji[state]} AIOS Pro: License expired`);
        console.log('  Run: aios pro activate --key <KEY>');
      } else {
        console.log(`${stateEmoji[state]} AIOS Pro: Not activated`);
        console.log('  Run: aios pro activate --key <KEY>');
      }
    } catch {
      console.log('⚠️  AIOS Pro: Unable to check license status');
    }
  }

  // Apply fixes if --fix
  if (shouldFix && issues.length > 0) {
    console.log('\n🔧 Attempting fixes...\n');

    let fixed = 0;
    let manual = 0;

    for (const issue of issues) {
      if (issue.autoFix && issue.fixAction) {
        if (isDryRun) {
          console.log(`  [DRY RUN] Would fix: ${issue.type}`);
          fixed++;
        } else {
          try {
            await issue.fixAction();
            fixed++;
          } catch (fixError) {
            console.error(`  ✗ Failed to fix ${issue.type}: ${fixError.message}`);
            manual++;
          }
        }
      } else {
        manual++;
        console.log(`  ⚠️  ${issue.message}`);
        console.log(`     💡 Fix: ${issue.suggestion}`);
      }
    }

    console.log('');
    if (isDryRun) {
      console.log(`✅ Dry run completed - ${fixed} issues would be fixed`);
      if (manual > 0) {
        console.log(`⚠️  ${manual} issues require manual action`);
      }
    } else {
      if (fixed > 0) {
        console.log(`✅ Fixed ${fixed} issue${fixed > 1 ? 's' : ''}`);
      }
      if (manual > 0) {
        console.log(`⚠️  ${manual} issue${manual > 1 ? 's' : ''} require manual action`);
        process.exit(1);
      }
    }
  } else {
    // Summary (no --fix)
    console.log('');
    if (hasErrors) {
      console.log('⚠️  Some issues were detected. Run with --fix to auto-repair.');
      process.exit(1);
    } else {
      console.log('✅ All checks passed! Your installation is healthy.');
    }
  }
}

// Helper: Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper: Remove AIOS sections from .gitignore
function cleanGitignore(gitignorePath) {
  if (!fs.existsSync(gitignorePath)) return { removed: false };

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let inAiosSection = false;
  let removedLines = 0;

  for (const line of lines) {
    if (line.includes('# AIOS') || line.includes('# Added by AIOS')) {
      inAiosSection = true;
      removedLines++;
      continue;
    }
    if (inAiosSection && line.trim() === '') {
      inAiosSection = false;
      continue;
    }
    if (inAiosSection) {
      removedLines++;
      continue;
    }
    newLines.push(line);
  }

  if (removedLines > 0) {
    fs.writeFileSync(gitignorePath, newLines.join('\n'));
    return { removed: true, lines: removedLines };
  }
  return { removed: false };
}

// Helper: Show uninstall help
function showUninstallHelp() {
  console.log(`
Usage: npx aios-core uninstall [options]

Remove AIOS from the current project.

Options:
  --force      Skip confirmation prompt
  --keep-data  Keep .aios/ directory (settings and history)
  --dry-run    Show what would be removed without removing
  -h, --help   Show this help message

What gets removed:
  - .aios-core/     Framework core files
  - docs/stories/   Story files (if created by AIOS)
  - squads/         Squad expansion packs
  - .gitignore      AIOS-added entries only

What is preserved (with --keep-data):
  - .aios/          Project settings and agent history

Exit Codes:
  0  Uninstall successful
  1  Uninstall failed or cancelled

Examples:
  # Interactive uninstall (with confirmation)
  npx aios-core uninstall

  # Force uninstall without prompts
  npx aios-core uninstall --force

  # See what would be removed
  npx aios-core uninstall --dry-run

  # Uninstall but keep project data
  npx aios-core uninstall --keep-data
`);
}

// Helper: Show doctor help
function showDoctorHelp() {
  console.log(`
Usage: npx aios-core doctor [options]

Run health checks on your AIOS installation.

Options:
  --fix        Automatically fix detected issues
  --dry-run    Show what --fix would do without making changes
  --quiet      Minimal output (exit code only)
  -h, --help   Show this help message

Checks performed:
  • Required directories exist (.aios-core/, .aios/)
  • Configuration files are valid JSON/YAML
  • Agent definitions are complete
  • Task files have required fields
  • Dependencies are installed

Exit Codes:
  0  All checks passed (or issues fixed with --fix)
  1  Issues detected (run with --fix to repair)

Examples:
  # Run health check
  npx aios-core doctor

  # Auto-fix detected issues
  npx aios-core doctor --fix

  # Preview what would be fixed
  npx aios-core doctor --fix --dry-run
`);
}

// Uninstall AIOS from project
async function runUninstall(options = {}) {
  const { force = false, keepData = false, dryRun = false, quiet = false } = options;
  const cwd = process.cwd();

  // Items to remove
  const itemsToRemove = [
    { path: '.aios-core', description: 'Framework core' },
    { path: 'squads', description: 'Squad expansion packs' },
  ];

  // Optionally remove .aios
  if (!keepData) {
    itemsToRemove.push({ path: '.aios', description: 'Project data and settings' });
  }

  // Check what exists
  const existingItems = itemsToRemove.filter(item =>
    fs.existsSync(path.join(cwd, item.path)),
  );

  if (existingItems.length === 0) {
    console.log('ℹ️  No AIOS installation found in this directory.');
    return;
  }

  // Calculate total size
  let totalSize = 0;
  const itemSizes = [];

  for (const item of existingItems) {
    const itemPath = path.join(cwd, item.path);
    try {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        // Simple recursive size calculation
        const getSize = (dir) => {
          let size = 0;
          try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
              const filePath = path.join(dir, file);
              const stat = fs.statSync(filePath);
              if (stat.isDirectory()) {
                size += getSize(filePath);
              } else {
                size += stat.size;
              }
            }
          } catch { /* ignore errors */ }
          return size;
        };
        const size = getSize(itemPath);
        totalSize += size;
        itemSizes.push({ ...item, size });
      } else {
        totalSize += stats.size;
        itemSizes.push({ ...item, size: stats.size });
      }
    } catch {
      itemSizes.push({ ...item, size: 0 });
    }
  }

  // Show what will be removed
  if (!quiet) {
    console.log('\n📋 Items to be removed:\n');
    for (const item of itemSizes) {
      const sizeStr = item.size > 0 ? ` (${formatBytes(item.size)})` : '';
      console.log(`  • ${item.path}/${sizeStr} - ${item.description}`);
    }
    console.log(`\n  Total: ${formatBytes(totalSize)}`);

    // Check for .gitignore cleanup
    const gitignorePath = path.join(cwd, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      if (content.includes('# AIOS') || content.includes('# Added by AIOS')) {
        console.log('  • .gitignore AIOS entries will be cleaned');
      }
    }
    console.log('');
  }

  // Dry run - stop here
  if (dryRun) {
    console.log('🔍 Dry run - no changes made.');
    return;
  }

  // Confirmation
  if (!force) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise(resolve => {
      rl.question('⚠️  Are you sure you want to uninstall AIOS? (y/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Uninstall cancelled.');
      process.exit(1);
    }
  }

  // Perform removal
  if (!quiet) console.log('\n🗑️  Removing AIOS components...\n');

  for (const item of existingItems) {
    const itemPath = path.join(cwd, item.path);
    try {
      fs.rmSync(itemPath, { recursive: true, force: true });
      if (!quiet) console.log(`  ✓ Removed ${item.path}/`);
    } catch (error) {
      console.error(`  ✗ Failed to remove ${item.path}: ${error.message}`);
    }
  }

  // Clean .gitignore
  const gitignorePath = path.join(cwd, '.gitignore');
  const gitignoreResult = cleanGitignore(gitignorePath);
  if (gitignoreResult.removed && !quiet) {
    console.log(`  ✓ Cleaned ${gitignoreResult.lines} AIOS entries from .gitignore`);
  }

  // Summary
  if (!quiet) {
    console.log('\n✅ AIOS has been uninstalled.');
    if (keepData) {
      console.log('   Your project data in .aios/ has been preserved.');
    }
    console.log('\n   To reinstall: npx aios-core install');
  }
}

// Helper: Show install help
function showInstallHelp() {
  console.log(`
Usage: npx aios-core install [options]

Install AIOS in the current directory.

Options:
  --force      Overwrite existing AIOS installation
  --quiet      Minimal output (no banner, no prompts) - ideal for CI/CD
  --dry-run    Simulate installation without modifying files
  --merge      Auto-merge existing config files (brownfield mode)
  --no-merge   Disable merge option, use legacy overwrite behavior
  -h, --help   Show this help message

Smart Merge (Brownfield):
  When installing in a project with existing config files (.env, CLAUDE.md),
  AIOS can merge new settings while preserving your customizations.

  - .env files: Adds new variables, preserves existing values
  - CLAUDE.md: Updates AIOS sections, keeps your custom rules

Exit Codes:
  0  Installation successful
  1  Installation failed

Examples:
  # Interactive installation
  npx aios-core install

  # Force reinstall without prompts
  npx aios-core install --force

  # Brownfield: merge configs automatically
  npx aios-core install --merge

  # Silent install for CI/CD
  npx aios-core install --quiet --force

  # Preview what would be installed
  npx aios-core install --dry-run
`);
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
    console.log('Skip install: enabled');
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

    case 'config':
      // Layered Configuration CLI - Story PRO-4
      try {
        const { run } = require('../.aios-core/cli/index.js');
        await run(process.argv);
      } catch (error) {
        console.error(`❌ Config command error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'pro':
      // AIOS Pro License Management - Story PRO-6
      try {
        const { run } = require('../.aios-core/cli/index.js');
        await run(process.argv);
      } catch (error) {
        console.error(`❌ Pro command error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'install': {
      // Install in current project with flag support
      const installArgs = args.slice(1);
      if (installArgs.includes('--help') || installArgs.includes('-h')) {
        showInstallHelp();
        break;
      }
      const installOptions = {
        force: installArgs.includes('--force'),
        quiet: installArgs.includes('--quiet'),
        dryRun: installArgs.includes('--dry-run'),
        forceMerge: installArgs.includes('--merge'),
        noMerge: installArgs.includes('--no-merge'),
      };
      if (!installOptions.quiet) {
        console.log('AIOS-FullStack Installation\n');
      }
      await runWizard(installOptions);
      break;
    }

    case 'uninstall': {
      // Uninstall AIOS from project
      const uninstallArgs = args.slice(1);
      if (uninstallArgs.includes('--help') || uninstallArgs.includes('-h')) {
        showUninstallHelp();
        break;
      }
      const uninstallOptions = {
        force: uninstallArgs.includes('--force'),
        keepData: uninstallArgs.includes('--keep-data'),
        dryRun: uninstallArgs.includes('--dry-run'),
        quiet: uninstallArgs.includes('--quiet'),
      };
      await runUninstall(uninstallOptions);
      break;
    }

    case 'init': {
      // Create new project (flags parsed inside initProject)
      await initProject();
      break;
    }

    case 'info':
      showInfo();
      break;

    case 'doctor': {
      // Run health check with flag support
      const doctorArgs = args.slice(1);
      if (doctorArgs.includes('--help') || doctorArgs.includes('-h')) {
        showDoctorHelp();
        break;
      }
      const doctorOptions = {
        fix: doctorArgs.includes('--fix'),
        dryRun: doctorArgs.includes('--dry-run'),
        quiet: doctorArgs.includes('--quiet'),
      };
      await runDoctor(doctorOptions);
      break;
    }

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
