/**
 * Shadow Command -- Shadow Mode CLI
 *
 * Displays shadow mode status, statistics, and calibration reports.
 *
 * @module cli/commands/corp/shadow
 * @version 1.0.0
 * @story CORP-9 - Shadow Mode + Feature Flags
 *
 * Usage:
 *   aiox corp shadow              # Show shadow mode status
 *   aiox corp shadow status       # Same as above
 *   aiox corp shadow report       # Show calibration report
 *   aiox corp shadow stats        # Show in-memory statistics
 *   aiox corp shadow-report       # Alias for report (AC4)
 */

'use strict';

const { ShadowMode } = require('../../../core/corporation/shadow-mode');

// =====================================================
// Execute
// =====================================================

/**
 * Execute shadow subcommand.
 *
 * @param {string[]} args - CLI arguments after `shadow`
 */
function execute(args = []) {
  const subcommand = args[0] || 'status';
  const flags = parseFlags(args.slice(1));

  const shadow = new ShadowMode({ projectRoot: process.cwd() });

  switch (subcommand) {
    case 'status':
      showStatus(shadow);
      break;
    case 'report':
    case 'shadow-report':
      showReport(shadow, flags);
      break;
    case 'stats':
      showStats(shadow);
      break;
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error(`Unknown shadow subcommand: ${subcommand}`);
      console.error('Run "aiox corp shadow --help" for usage.');
      process.exit(1);
  }
}

// =====================================================
// Subcommands
// =====================================================

function showStatus(shadow) {
  const enabled = shadow.isCorporationEnabled();
  const isShadow = shadow.isShadowMode();
  const isEnforcement = shadow.isEnforcementMode();

  console.log('');
  console.log('\x1b[1mShadow Mode Status\x1b[0m');
  console.log('─'.repeat(40));
  console.log(`  Corporation:  ${enabled ? '\x1b[32menabled\x1b[0m' : '\x1b[31mdisabled\x1b[0m'}`);

  if (enabled) {
    if (isShadow) {
      console.log(`  Mode:         \x1b[33mshadow\x1b[0m (log-only, no blocking)`);
    } else if (isEnforcement) {
      console.log(`  Mode:         \x1b[31menforcement\x1b[0m (blocking active)`);
    }
  } else {
    console.log('  Mode:         \x1b[90mflat (corporation disabled)\x1b[0m');
  }

  console.log('');
  console.log('\x1b[90mConfig: .aios-core/core-config.yaml\x1b[0m');
  console.log('\x1b[90m  corporation.enabled: ' + enabled + '\x1b[0m');
  console.log('\x1b[90m  corporation.permissions.enforce: ' + isEnforcement + '\x1b[0m');
  console.log('');
}

function showReport(shadow, flags) {
  const days = flags.days || 7;
  const report = shadow.generateShadowReport({ days });

  console.log('');
  console.log('\x1b[1mShadow Mode Calibration Report\x1b[0m');
  console.log('─'.repeat(50));
  console.log(`  Mode:     ${report.mode}`);
  console.log(`  Period:   Last ${report.period.days} days`);
  if (report.source === 'in-memory') {
    console.log(`  Source:   \x1b[33min-memory (no persisted logs)\x1b[0m`);
  }
  console.log('');

  // Summary
  console.log('\x1b[1mSummary\x1b[0m');
  console.log(`  Total checks:    ${report.summary.totalChecks}`);
  console.log(`  Would deny:      ${report.summary.wouldDeny}`);
  console.log(`  Would allow:     ${report.summary.wouldAllow}`);
  console.log(`  Deny rate:       ${report.summary.wouldDenyRate}%`);
  console.log('');

  // Top denied actions
  const actions = Object.entries(report.topDeniedActions || {});
  if (actions.length > 0) {
    console.log('\x1b[1mTop Denied Actions\x1b[0m');
    for (const [action, count] of actions.slice(0, 10)) {
      console.log(`  ${String(count).padStart(4)}  ${action}`);
    }
    console.log('');
  }

  // Top denied agents
  const agents = Object.entries(report.topDeniedAgents || {});
  if (agents.length > 0) {
    console.log('\x1b[1mTop Denied Agents\x1b[0m');
    for (const [agent, count] of agents.slice(0, 10)) {
      console.log(`  ${String(count).padStart(4)}  ${agent}`);
    }
    console.log('');
  }

  // Top denied departments
  const depts = Object.entries(report.topDeniedDepartments || {});
  if (depts.length > 0) {
    console.log('\x1b[1mTop Denied Departments\x1b[0m');
    for (const [dept, count] of depts.slice(0, 10)) {
      console.log(`  ${String(count).padStart(4)}  ${dept}`);
    }
    console.log('');
  }

  if (report.summary.totalChecks === 0) {
    console.log('\x1b[90mNo shadow mode events found. Run the system to collect data.\x1b[0m');
    console.log('');
  }
}

function showStats(shadow) {
  const stats = shadow.getShadowStats();

  console.log('');
  console.log('\x1b[1mShadow Mode Statistics (In-Memory)\x1b[0m');
  console.log('─'.repeat(40));
  console.log(`  Total checks:    ${stats.totalChecks}`);
  console.log(`  Would deny:      ${stats.wouldDeny}`);
  console.log(`  Deny rate:       ${stats.wouldDenyRate}%`);
  console.log('');

  if (stats.totalChecks === 0) {
    console.log('\x1b[90mNo checks recorded in this session.\x1b[0m');
    console.log('');
  }
}

function showHelp() {
  console.log(`
\x1b[1maiox corp shadow\x1b[0m -- Shadow mode management

\x1b[1mSUBCOMMANDS:\x1b[0m
  status          Show current shadow mode status (default)
  report          Show calibration report from activity logs
  stats           Show in-memory statistics for this session

\x1b[1mFLAGS:\x1b[0m
  --days <n>      Report period in days (default: 7)

\x1b[1mUSAGE:\x1b[0m
  aiox corp shadow                    # Show status
  aiox corp shadow report             # Last 7 days report
  aiox corp shadow report --days 30   # Last 30 days report
  aiox corp shadow stats              # Session statistics

\x1b[1mCONFIG:\x1b[0m
  corporation.enabled: true/false          # Enable/disable corporation
  corporation.permissions.enforce: false   # Shadow mode (default)
  corporation.permissions.enforce: true    # Enforcement mode
  corporation.permissions.log_denials: true # Log denied actions
`);
}

// =====================================================
// Helpers
// =====================================================

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) {
      flags.days = parseInt(args[i + 1], 10) || 7;
      i++;
    }
  }
  return flags;
}

module.exports = { execute };
