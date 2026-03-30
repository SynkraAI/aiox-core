/**
 * Corp Enforce Command -- Shadow/Enforcement Mode Management
 *
 * Subcommands:
 *   status     -- Show current enforcement mode
 *   check      -- Analyze shadow report and recommend activation
 *   activate   -- Switch to enforcement mode (requires L5)
 *   deactivate -- Switch back to shadow mode
 *
 * @module cli/commands/corp/enforce
 * @version 1.0.0
 * @story CORP-10 - Full Enforcement
 */

'use strict';

const fs = require('fs');
const path = require('path');

// =====================================================
// Constants
// =====================================================

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

const CONFIG_PATH_REL = '.aios-core/core-config.yaml';
const SHADOW_REPORT_THRESHOLD = {
  MAX_DENY_RATE: 30, // % -- if more than 30% of checks would deny, warn
  MIN_TOTAL_CHECKS: 10, // At least 10 checks before recommending activation
};

// =====================================================
// Execute
// =====================================================

/**
 * @param {string[]} args
 */
function execute(args = []) {
  const subcommand = args[0] || 'status';

  switch (subcommand) {
  case 'status':
    return showStatus();
  case 'check':
    return runCheck();
  case 'activate':
    return activateEnforcement();
  case 'deactivate':
    return deactivateEnforcement();
  case '--help':
  case '-h':
    return showHelp();
  default:
    console.error(`Unknown enforce subcommand: ${subcommand}`);
    showHelp();
    process.exit(1);
  }
}

// =====================================================
// Subcommands
// =====================================================

function showStatus() {
  const config = readCorporationConfig();

  if (!config.enabled) {
    console.log(`\n${BOLD}Corporation Status:${RESET} ${DIM}DISABLED${RESET}`);
    console.log(`${DIM}Enable corporation in core-config.yaml first.${RESET}\n`);
    return;
  }

  const enforce = config.permissions && config.permissions.enforce === true;
  const logDenials = config.permissions && config.permissions.log_denials !== false;

  console.log(`\n${BOLD}Corporation Enforcement Status${RESET}`);
  console.log('─'.repeat(40));
  console.log(`  Corporation:   ${GREEN}ENABLED${RESET}`);
  console.log(`  Mode:          ${enforce ? `${RED}ENFORCEMENT${RESET} (blocking)` : `${YELLOW}SHADOW${RESET} (log-only)`}`);
  console.log(`  Log denials:   ${logDenials ? `${GREEN}YES${RESET}` : `${DIM}NO${RESET}`}`);

  if (config.scheduler) {
    console.log(`  Scheduler:     ${config.scheduler.enabled ? `${GREEN}ENABLED${RESET}` : `${DIM}DISABLED${RESET}`}`);
  }

  if (config.activity) {
    console.log(`  Retention:     ${config.activity.retention_days || 90} days`);
  }

  console.log('─'.repeat(40));

  if (!enforce) {
    console.log(`\n${CYAN}Tip:${RESET} Run ${BOLD}aiox corp enforce check${RESET} to analyze shadow data.`);
    console.log(`     Run ${BOLD}aiox corp enforce activate${RESET} to enable enforcement.\n`);
  } else {
    console.log(`\n${CYAN}Tip:${RESET} Run ${BOLD}aiox corp enforce deactivate${RESET} to revert to shadow mode.\n`);
  }
}

function runCheck() {
  const config = readCorporationConfig();

  if (!config.enabled) {
    console.log(`\n${RED}Corporation is disabled.${RESET} Enable it first.\n`);
    return;
  }

  const enforce = config.permissions && config.permissions.enforce === true;

  if (enforce) {
    console.log(`\n${YELLOW}Already in enforcement mode.${RESET} Nothing to check.\n`);
    return;
  }

  console.log(`\n${BOLD}Shadow Mode Analysis${RESET}`);
  console.log('─'.repeat(50));

  // Try to load shadow report
  let report = null;
  try {
    const { ShadowMode } = require('../../../core/corporation/shadow-mode');
    const shadow = new ShadowMode({ projectRoot: process.cwd() });
    report = shadow.generateShadowReport({ days: 7 });
  } catch (err) {
    console.log(`${YELLOW}Could not load shadow data: ${err.message}${RESET}`);
    console.log(`${DIM}Run the system in shadow mode first to collect data.${RESET}\n`);
    return;
  }

  if (!report || !report.summary) {
    console.log(`${YELLOW}No shadow data available.${RESET}`);
    console.log(`${DIM}Run the system in shadow mode first to collect calibration data.${RESET}\n`);
    return;
  }

  const { totalChecks, wouldDeny, wouldDenyRate } = report.summary;

  console.log(`  Period:        Last ${report.period.days} days`);
  console.log(`  Total checks:  ${totalChecks}`);
  console.log(`  Would deny:    ${wouldDeny} (${wouldDenyRate}%)`);
  console.log(`  Would allow:   ${report.summary.wouldAllow}`);

  if (report.topDeniedActions && Object.keys(report.topDeniedActions).length > 0) {
    console.log(`\n  ${BOLD}Top denied actions:${RESET}`);
    for (const [action, count] of Object.entries(report.topDeniedActions).slice(0, 5)) {
      console.log(`    - ${action}: ${count}`);
    }
  }

  if (report.topDeniedAgents && Object.keys(report.topDeniedAgents).length > 0) {
    console.log(`\n  ${BOLD}Top denied agents:${RESET}`);
    for (const [agent, count] of Object.entries(report.topDeniedAgents).slice(0, 5)) {
      console.log(`    - ${agent}: ${count}`);
    }
  }

  console.log('\n' + '─'.repeat(50));

  // Recommendation
  const issues = [];

  if (totalChecks < SHADOW_REPORT_THRESHOLD.MIN_TOTAL_CHECKS) {
    issues.push(`Insufficient data: only ${totalChecks} checks (minimum ${SHADOW_REPORT_THRESHOLD.MIN_TOTAL_CHECKS})`);
  }

  if (wouldDenyRate > SHADOW_REPORT_THRESHOLD.MAX_DENY_RATE) {
    issues.push(`High denial rate: ${wouldDenyRate}% exceeds ${SHADOW_REPORT_THRESHOLD.MAX_DENY_RATE}% threshold`);
  }

  if (issues.length === 0) {
    console.log(`\n  ${GREEN}RECOMMENDATION: Safe to activate enforcement.${RESET}`);
    console.log(`  ${DIM}Run: aiox corp enforce activate${RESET}\n`);
  } else {
    console.log(`\n  ${YELLOW}RECOMMENDATION: Review issues before activating:${RESET}`);
    for (const issue of issues) {
      console.log(`    ${RED}- ${issue}${RESET}`);
    }
    console.log(`\n  ${DIM}You can still activate with: aiox corp enforce activate${RESET}\n`);
  }
}

function activateEnforcement() {
  const config = readCorporationConfig();

  if (!config.enabled) {
    console.error(`${RED}Corporation is disabled.${RESET} Enable it in core-config.yaml first.`);
    process.exit(1);
  }

  if (config.permissions && config.permissions.enforce === true) {
    console.log(`${YELLOW}Enforcement is already active.${RESET}`);
    return;
  }

  // Update config file
  const configPath = path.join(process.cwd(), CONFIG_PATH_REL);
  try {
    let content = fs.readFileSync(configPath, 'utf-8');

    // Replace enforce: false with enforce: true
    content = content.replace(
      /(\s+enforce:\s*)false/,
      '$1true',
    );

    fs.writeFileSync(configPath, content, 'utf-8');

    console.log(`\n${GREEN}${BOLD}Enforcement mode ACTIVATED.${RESET}`);
    console.log(`${DIM}All permission denials will now block actions.${RESET}`);
    console.log(`\n${CYAN}To revert:${RESET} aiox corp enforce deactivate\n`);
  } catch (err) {
    console.error(`${RED}Failed to update config: ${err.message}${RESET}`);
    process.exit(1);
  }
}

function deactivateEnforcement() {
  const config = readCorporationConfig();

  if (!config.enabled) {
    console.error(`${RED}Corporation is disabled.${RESET}`);
    process.exit(1);
  }

  if (!config.permissions || config.permissions.enforce !== true) {
    console.log(`${YELLOW}Already in shadow mode.${RESET}`);
    return;
  }

  // Update config file
  const configPath = path.join(process.cwd(), CONFIG_PATH_REL);
  try {
    let content = fs.readFileSync(configPath, 'utf-8');

    // Replace enforce: true with enforce: false
    content = content.replace(
      /(\s+enforce:\s*)true/,
      '$1false',
    );

    fs.writeFileSync(configPath, content, 'utf-8');

    console.log(`\n${YELLOW}${BOLD}Enforcement mode DEACTIVATED.${RESET}`);
    console.log(`${DIM}Returning to shadow mode (log-only, no blocking).${RESET}\n`);
  } catch (err) {
    console.error(`${RED}Failed to update config: ${err.message}${RESET}`);
    process.exit(1);
  }
}

// =====================================================
// Helpers
// =====================================================

/**
 * Read the corporation section from core-config.yaml.
 * Minimal parser to avoid js-yaml dependency.
 *
 * @returns {Object} Corporation config
 */
function readCorporationConfig() {
  const configPath = path.join(process.cwd(), CONFIG_PATH_REL);

  if (!fs.existsSync(configPath)) {
    return { enabled: false };
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const lines = content.split('\n');
    const config = { enabled: false, permissions: {}, scheduler: {}, activity: {} };
    let inCorporation = false;
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trimStart();
      const indent = line.length - trimmed.length;

      if (/^corporation\s*:/.test(trimmed)) {
        inCorporation = true;
        currentSection = null;
        continue;
      }

      if (!inCorporation) continue;
      if (indent === 0 && /^\S/.test(trimmed) && trimmed !== '') break;

      const keyMatch = trimmed.match(/^(\w+)\s*:\s*(.*)?$/);
      if (!keyMatch) continue;

      const [, key, rawValue] = keyMatch;
      const value = (rawValue || '').trim();

      if (value === '' || value === '{}') {
        currentSection = key;
        if (!config[key]) config[key] = {};
        continue;
      }

      const parsed = parseValue(value);

      if (currentSection && indent > 2) {
        if (!config[currentSection]) config[currentSection] = {};
        config[currentSection][key] = parsed;
      } else {
        config[key] = parsed;
        currentSection = null;
      }
    }

    return config;
  } catch {
    return { enabled: false };
  }
}

function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  return value;
}

function showHelp() {
  console.log(`
${BOLD}aiox corp enforce${RESET} -- Enforcement mode management

${BOLD}SUBCOMMANDS:${RESET}
  status       Show current mode (shadow or enforcement)
  check        Analyze shadow report and recommend activation
  activate     Switch to enforcement mode (permission denials block)
  deactivate   Switch back to shadow mode (log-only)

${BOLD}EXAMPLES:${RESET}
  aiox corp enforce                # Show status
  aiox corp enforce status         # Same as above
  aiox corp enforce check          # Analyze shadow data
  aiox corp enforce activate       # Enable enforcement
  aiox corp enforce deactivate     # Revert to shadow mode

${BOLD}NOTES:${RESET}
  - Corporation must be enabled first (corporation.enabled: true)
  - Run in shadow mode first to collect calibration data
  - Use 'check' to analyze data before activating enforcement
  - Enforcement can be reverted at any time with 'deactivate'
`);
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = { execute };
