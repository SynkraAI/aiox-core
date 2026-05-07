#!/usr/bin/env node

/**
 * aiox-pro CLI
 *
 * Thin CLI wrapper for AIOX Pro packages.
 * Provides a clean npx interface: npx aiox-pro install
 *
 * Commands:
 *   install             Install AIOX Pro in the current project
 *   update              Update AIOX Pro and re-sync assets
 *   activate --key X    Activate a license key
 *   deactivate          Deactivate the current license
 *   status              Show license status
 *   features            List available pro features
 *   validate            Force online license revalidation
 *   recover             Recover lost license key via email
 *   help                Show help
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { recoverLicense } = require('../src/recover');

const PRO_PACKAGE_CANONICAL = '@aiox-squads/pro';
const PRO_PACKAGE_FALLBACK = '@aiox-fullstack/pro';
const PRO_PACKAGE_LEGACY = '@aios-fullstack/pro';
const PRO_PACKAGES = [PRO_PACKAGE_CANONICAL, PRO_PACKAGE_FALLBACK, PRO_PACKAGE_LEGACY];
const VERSION = require('../package.json').version;

const args = process.argv.slice(2);
const command = args[0];

// ─── Helpers ────────────────────────────────────────────────────────────────

function run(cmd, options = {}) {
  const result = spawnSync(cmd, {
    shell: true,
    stdio: 'inherit',
    cwd: process.cwd(),
    ...options,
  });
  return result.status;
}

function isProInstalled() {
  try {
    return PRO_PACKAGES.some((packageName) => {
      const scopeDir = packageName.split('/')[0];
      const packageJson = path.join(process.cwd(), 'node_modules', scopeDir, 'pro', 'package.json');
      return fs.existsSync(packageJson);
    });
  } catch {
    return false;
  }
}

function findAioxCli() {
  // Check local node_modules first
  const localBin = path.join(process.cwd(), 'node_modules', '.bin', 'aiox');
  if (fs.existsSync(localBin) || fs.existsSync(localBin + '.cmd')) {
    return 'npx aiox';
  }

  // Check global
  try {
    execSync('aiox --version', { stdio: 'pipe' });
    return 'aiox';
  } catch {
    return null;
  }
}

function delegateToAiox(subcommand) {
  const aiox = findAioxCli();
  if (!aiox) {
    console.error('aiox-core CLI not found.');
    console.error('Install it first: npm install aiox-core');
    process.exit(1);
  }

  const spawnArgs = ['pro', subcommand, ...args.slice(1)];
  const result = spawnSync(aiox, spawnArgs, { stdio: 'inherit' });
  process.exit(result.status ?? 0);
}

/**
 * Get value of a CLI argument (e.g., --key VALUE).
 *
 * @param {string} flag - Flag name (e.g., '--key')
 * @returns {string|null} Value or null
 */
function getArgValue(flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return null;
}

/**
 * Run the Pro Installation Wizard.
 *
 * @param {string} [key] - Pre-provided license key
 */
function runProWizard(key) {
  // Lazy import to avoid requiring installer when not needed
  let proSetup;
  try {
    proSetup = require('../../installer/src/wizard/pro-setup');
  } catch {
    console.error('Pro wizard module not found.');
    console.error('Ensure aiox-core installer is available.\n');
    process.exit(1);
  }

  const options = {};
  if (key) {
    options.key = key;
  }

  proSetup.runProWizard(options).then((result) => {
    if (!result.success) {
      process.exit(1);
    }
  }).catch((err) => {
    console.error(`\n  Wizard failed: ${err.message}\n`);
    process.exit(1);
  });
}

// ─── Commands ───────────────────────────────────────────────────────────────

function showHelp() {
  console.log(`
aiox-pro v${VERSION} — AIOX Pro CLI

Usage:
  npx aiox-pro <command> [options]

Commands:
  install              Install AIOX Pro in the current project
  update               Update AIOX Pro and re-sync assets
  install --wizard     Install and run the setup wizard
  setup, wizard        Run Pro setup wizard (license gate + scaffold + verify)
  activate --key KEY   Activate a license key
  deactivate           Deactivate the current license
  status               Show license status
  features             List available pro features
  validate             Force online license revalidation
  recover              Recover lost license key via email
  reset-password       Reset your password (alias for recover)
  help                 Show this help message

Examples:
  npx aiox-pro install
  npx aiox-pro update
  npx aiox-pro setup
  npx aiox-pro wizard --key PRO-XXXX-XXXX-XXXX-XXXX
  npx aiox-pro activate --key PRO-XXXX-XXXX-XXXX-XXXX
  npx aiox-pro status
  npx aiox-pro recover

Documentation: https://synkra.ai/pro/docs
`);
}

function installPro() {
  console.log('\nInstalling AIOX Pro...\n');

  let installedPackage = null;

  for (const packageName of PRO_PACKAGES) {
    console.log(`Trying ${packageName}...`);
    const exitCode = run(`npm install ${packageName}`);
    if (exitCode === 0) {
      installedPackage = packageName;
      break;
    }
    console.log('');
  }

  if (!installedPackage) {
    console.error('\nFailed to install AIOX Pro.');
    console.error(`Tried: ${PRO_PACKAGES.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n✅ ${installedPackage} installed successfully!\n`);
  console.log('Next steps:');
  console.log('  npx aiox-pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
  console.log('  npx aiox-pro status');
  console.log('');
}

// ─── Main ───────────────────────────────────────────────────────────────────

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  console.log(`aiox-pro v${VERSION}`);
  process.exit(0);
}

switch (command) {
  case 'install': {
    // Check for --wizard flag to run wizard after install
    const runWizardAfter = args.includes('--wizard');
    installPro();
    if (runWizardAfter) {
      runProWizard();
    }
    break;
  }

  case 'setup':
  case 'wizard': {
    // Run the Pro Installation Wizard with license gate
    const wizardKey = getArgValue('--key');
    runProWizard(wizardKey);
    break;
  }

  case 'recover':
  case 'reset-password':
    recoverLicense().catch((err) => {
      console.error(`\n  Recovery failed: ${err.message}\n`);
      process.exit(1);
    });
    break;

  case 'activate':
  case 'deactivate':
  case 'status':
  case 'features':
  case 'validate':
  case 'update':
    if (!isProInstalled()) {
      console.error('AIOX Pro is not installed.');
      console.error('Run first: npx aiox-pro install\n');
      process.exit(1);
    }
    delegateToAiox(command);
    break;

  default:
    console.error(`Unknown command: ${command}\n`);
    showHelp();
    process.exit(1);
}
