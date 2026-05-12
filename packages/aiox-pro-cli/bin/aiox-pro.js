#!/usr/bin/env node

/**
 * aiox-pro CLI
 *
 * Thin CLI wrapper for AIOX Pro setup and delegated commands.
 * Provides a clean npx interface: npx @aiox-squads/aiox-pro-cli install
 *
 * Commands:
 *   install             Run authenticated Pro setup in the current project
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

const VERSION = require('../package.json').version;

const args = process.argv.slice(2);
const command = args[0];

// ─── Helpers ────────────────────────────────────────────────────────────────

function findAioxCli() {
  // Check local node_modules first
  const localBin = path.join(process.cwd(), 'node_modules', '.bin', 'aiox');
  const localBinPath = process.platform === 'win32' ? `${localBin}.cmd` : localBin;
  if (fs.existsSync(localBinPath)) {
    return localBinPath;
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
    console.error('AIOX Core CLI not found.');
    console.error('Install it first: npm install @aiox-squads/core');
    process.exit(1);
  }

  const spawnArgs = ['pro', subcommand, ...args.slice(1)];
  const result = spawnSync(aiox, spawnArgs, { stdio: 'inherit' });
  process.exit(result.status ?? 0);
}

/**
 * Get value of a CLI argument (e.g., --key VALUE).
 *
 * @param {...string} flags - Flag names (e.g., '--key', '-k')
 * @returns {string|null} Value or null
 */
function getArgValue(...flags) {
  for (const flag of flags) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && idx + 1 < args.length) {
      return args[idx + 1];
    }
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
    try {
      proSetup = require('@aiox-squads/installer/pro-setup');
    } catch {
      proSetup = require('../../installer/src/wizard/pro-setup');
    }
  } catch {
    console.error('Pro wizard module not found.');
    console.error('Ensure aiox-core installer is available.\n');
    process.exit(1);
  }

  const options = {};
  if (key) {
    options.key = key;
  }

  proSetup
    .runProWizard(options)
    .then((result) => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(`\n  Wizard failed: ${err.message}\n`);
      process.exit(1);
    });
}

// ─── Commands ───────────────────────────────────────────────────────────────

function showHelp() {
  console.log(`
aiox-pro v${VERSION} — AIOX Pro CLI

Usage:
  npx -y @aiox-squads/aiox-pro-cli@latest <command> [options]

Commands:
  install              Run authenticated Pro setup in the current project
  update               Update AIOX Pro and re-sync assets
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
  npx -y @aiox-squads/aiox-pro-cli@latest install
  npx -y @aiox-squads/aiox-pro-cli@latest update
  npx -y @aiox-squads/aiox-pro-cli@latest setup
  npx -y @aiox-squads/aiox-pro-cli@latest wizard --key PRO-XXXX-XXXX-XXXX-XXXX
  npx -y @aiox-squads/aiox-pro-cli@latest install -k PRO-XXXX-XXXX-XXXX-XXXX
  npx -y @aiox-squads/aiox-pro-cli@latest activate --key PRO-XXXX-XXXX-XXXX-XXXX
  npx -y @aiox-squads/aiox-pro-cli@latest status
  npx -y @aiox-squads/aiox-pro-cli@latest recover

Documentation: https://synkra.ai/pro/docs
`);
}

function installPro() {
  runProWizard(getArgValue('--key', '-k'));
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
    installPro();
    break;
  }

  case 'setup':
  case 'wizard': {
    // Run the Pro Installation Wizard with license gate
    const wizardKey = getArgValue('--key', '-k');
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
    delegateToAiox(command);
    break;

  default:
    console.error(`Unknown command: ${command}\n`);
    showHelp();
    process.exit(1);
}
