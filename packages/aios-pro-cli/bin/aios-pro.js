#!/usr/bin/env node

/**
 * aios-pro CLI
 *
 * Thin CLI wrapper for @aios-fullstack/pro.
 * Provides a clean npx interface: npx aios-pro install
 *
 * Commands:
 *   install             Install @aios-fullstack/pro in the current project
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

const PRO_PACKAGE = '@aios-fullstack/pro';
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
    const pkgPath = path.join(process.cwd(), 'node_modules', '@aios-fullstack', 'pro', 'package.json');
    return fs.existsSync(pkgPath);
  } catch {
    return false;
  }
}

function findAiosCli() {
  // Check local node_modules first
  const localBin = path.join(process.cwd(), 'node_modules', '.bin', 'aios');
  if (fs.existsSync(localBin) || fs.existsSync(localBin + '.cmd')) {
    return 'npx aios';
  }

  // Check global
  try {
    execSync('aios --version', { stdio: 'pipe' });
    return 'aios';
  } catch {
    return null;
  }
}

function delegateToAios(subcommand) {
  const aios = findAiosCli();
  if (!aios) {
    console.error('aios-core CLI not found.');
    console.error('Install it first: npm install aios-core');
    process.exit(1);
  }

  const spawnArgs = ['pro', subcommand, ...args.slice(1)];
  const result = spawnSync(aios, spawnArgs, { stdio: 'inherit' });
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
    console.error('Ensure aios-core installer is available.\n');
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
aios-pro v${VERSION} — AIOS Pro CLI

Usage:
  npx aios-pro <command> [options]

Commands:
  install              Install ${PRO_PACKAGE} in the current project
  install --wizard     Install and run the setup wizard
  setup, wizard        Run Pro setup wizard (license gate + scaffold + verify)
  activate --key KEY   Activate a license key
  deactivate           Deactivate the current license
  status               Show license status
  features             List available pro features
  validate             Force online license revalidation
  recover              Recover lost license key via email
  help                 Show this help message

Examples:
  npx aios-pro install
  npx aios-pro setup
  npx aios-pro wizard --key PRO-XXXX-XXXX-XXXX-XXXX
  npx aios-pro activate --key PRO-XXXX-XXXX-XXXX-XXXX
  npx aios-pro status
  npx aios-pro recover

Documentation: https://synkra.ai/pro/docs
`);
}

function installPro() {
  console.log(`\nInstalling ${PRO_PACKAGE}...\n`);

  const exitCode = run(`npm install ${PRO_PACKAGE}`);

  if (exitCode !== 0) {
    console.error(`\nFailed to install ${PRO_PACKAGE}`);
    process.exit(1);
  }

  console.log(`\n✅ ${PRO_PACKAGE} installed successfully!\n`);
  console.log('Next steps:');
  console.log('  npx aios-pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
  console.log('  npx aios-pro status');
  console.log('');
}

// ─── Main ───────────────────────────────────────────────────────────────────

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  console.log(`aios-pro v${VERSION}`);
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
    if (!isProInstalled()) {
      console.error(`${PRO_PACKAGE} is not installed.`);
      console.error('Run first: npx aios-pro install\n');
      process.exit(1);
    }
    delegateToAios(command);
    break;

  default:
    console.error(`Unknown command: ${command}\n`);
    showHelp();
    process.exit(1);
}
