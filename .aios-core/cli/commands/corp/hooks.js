/**
 * Corp Hooks CLI Command -- Show corporation hooks status
 *
 * @module cli/commands/corp/hooks
 * @version 1.0.0
 * @story CORP-8 - UAP Integration
 *
 * Usage:
 *   aiox corp hooks status    # Show active hooks and counters
 *   aiox corp hooks --help    # Show help
 */

'use strict';

/**
 * Execute hooks subcommand.
 *
 * @param {string[]} args - CLI arguments after `hooks`
 */
function execute(args = []) {
  const subcommand = args[0];

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    showHelp();
    return;
  }

  if (subcommand === 'status') {
    showStatus();
    return;
  }

  console.error(`Unknown hooks subcommand: ${subcommand}`);
  console.error('Run "aiox corp hooks --help" for available subcommands.');
  process.exit(1);
}

/**
 * Show hooks status.
 */
function showStatus() {
  try {
    const { CorporationHooks } = require('../../../core/corporation/corporation-hooks');
    const hooks = new CorporationHooks({ projectRoot: process.cwd() });
    const status = hooks.getStatus();

    console.log('');
    console.log('\x1b[1m  Corporation Hooks Status\x1b[0m');
    console.log('  ' + '='.repeat(40));
    console.log('');

    // Enabled / Mode
    const enabledIcon = status.enabled ? '\x1b[32m●\x1b[0m' : '\x1b[31m○\x1b[0m';
    console.log(`  Status:  ${enabledIcon} ${status.enabled ? 'Enabled' : 'Disabled'}`);

    const modeLabel = {
      disabled: '\x1b[90mdisabled\x1b[0m',
      shadow: '\x1b[33mshadow (log-only)\x1b[0m',
      enforcement: '\x1b[32menforcement\x1b[0m',
      enabled: '\x1b[34menabled\x1b[0m',
    };
    console.log(`  Mode:    ${modeLabel[status.mode] || status.mode}`);
    console.log('');

    // Hooks
    console.log('  \x1b[1mRegistered Hooks:\x1b[0m');
    for (const [hook, active] of Object.entries(status.hooks)) {
      const icon = active ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
      console.log(`    ${icon} ${hook}`);
    }
    console.log('');

    // Stats
    console.log('  \x1b[1mCounters (current session):\x1b[0m');
    console.log(`    Activations:  ${status.stats.activations}`);
    console.log(`    Completions:  ${status.stats.completions}`);
    console.log(`    Errors:       ${status.stats.errors}`);
    console.log(`    Blocked:      ${status.stats.blocked}`);
    console.log(`    Shadow-logged: ${status.stats.shadowLogged}`);
    console.log('');
  } catch (error) {
    console.error(`Failed to get hooks status: ${error.message}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
\x1b[1maiox corp hooks\x1b[0m -- Corporation hooks management

\x1b[1mSUBCOMMANDS:\x1b[0m
  status    Show which hooks are active and their counters

\x1b[1mUSAGE:\x1b[0m
  aiox corp hooks status    # Show active hooks and activation/block counters

\x1b[1mDESCRIPTION:\x1b[0m
  Corporation hooks intercept the agent activation pipeline (UAP)
  to enforce permissions, log activity, and handle errors.

  When corporation.enabled = false, all hooks are no-ops.
  When corporation.permissions.enforce = false (shadow mode),
  hooks log permission decisions but never block.
`);
}

module.exports = { execute };
