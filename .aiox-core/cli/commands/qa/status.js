/**
 * QA Status Command
 *
 * Display current quality gate status.
 *
 * @module cli/commands/qa/status
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const { Command } = require('commander');
const { QualityGateManager } = require('../../../core/quality-gates/quality-gate-manager');

/**
 * Create the status subcommand
 * @returns {Command} Commander command instance
 */
function createStatusCommand() {
  const status = new Command('status');

  status
    .description('Show current quality gate status')
    .option('-v, --verbose', 'Show detailed status', false)
    .option('--json', 'Output as JSON', false)
    .action(async (options) => {
      try {
        const manager = await QualityGateManager.load();
        const currentStatus = await manager.getStatus();

        if (options.json) {
          console.log(JSON.stringify(currentStatus, null, 2));
          return;
        }

        printStatus(currentStatus, options.verbose);
      } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (options.verbose) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

  return status;
}

/**
 * Print status in human-readable format
 * @param {Object} status - Current status
 * @param {boolean} verbose - Verbose mode
 */
function printStatus(status, verbose = false) {
  console.log('\n📊 Quality Gate Status');
  console.log('━'.repeat(50));

  // Overall status
  const overallIcon = getStatusIcon(status.overall);
  console.log(`\nOverall: ${overallIcon} ${formatOverallStatus(status.overall)}`);

  if (status.lastRun) {
    const lastRun = new Date(status.lastRun);
    const ago = formatTimeAgo(lastRun);
    console.log(`Last Run: ${lastRun.toLocaleString()} (${ago})`);
  } else {
    console.log('Last Run: Never');
  }

  console.log('');

  // Layer statuses
  printLayerStatus('Layer 1', status.layer1, 'Pre-commit');
  printLayerStatus('Layer 2', status.layer2, 'PR Automation');
  printLayerStatus('Layer 3', status.layer3, 'Human Review');

  // Verbose: Show details
  if (verbose && status.layer1) {
    console.log('\n--- Details ---');

    if (status.layer1?.results) {
      console.log('\nLayer 1 Checks:');
      status.layer1.results.forEach((r) => {
        const icon = r.pass ? '✓' : '✗';
        console.log(`  ${icon} ${r.check}: ${r.message}`);
      });
    }

    if (status.layer2?.results) {
      console.log('\nLayer 2 Checks:');
      status.layer2.results.forEach((r) => {
        const icon = r.pass ? '✓' : '✗';
        console.log(`  ${icon} ${r.check}: ${r.message}`);
      });
    }
  }

  // Signoffs
  if (Object.keys(status.signoffs || {}).length > 0) {
    console.log('\n--- Recent Sign-offs ---');
    Object.entries(status.signoffs).forEach(([storyId, signoff]) => {
      const date = new Date(signoff.timestamp);
      console.log(`  ${storyId}: ${signoff.reviewer} (${date.toLocaleDateString()})`);
    });
  }

  console.log('');
}

/**
 * Print individual layer status
 * @param {string} name - Layer name
 * @param {Object} layer - Layer status
 * @param {string} description - Layer description
 */
function printLayerStatus(name, layer, description) {
  if (!layer) {
    console.log(`${name}: ⚪ Not run yet (${description})`);
    return;
  }

  const icon = layer.pass ? '✅' : '❌';
  const status = layer.pass ? 'Passed' : 'Failed';
  const duration = layer.duration ? ` (${formatDuration(layer.duration)})` : '';

  console.log(`${name}: ${icon} ${status}${duration} (${description})`);
}

/**
 * Get status icon
 * @param {string} status - Overall status
 * @returns {string} Status icon
 */
function getStatusIcon(status) {
  const icons = {
    'not-started': '⚪',
    'layer1-failed': '❌',
    'layer1-complete': '🟡',
    'layer2-blocked': '🟠',
    'layer2-complete': '🟡',
    'layer3-pending': '⏳',
    'passed': '✅',
    'unknown': '❓',
  };
  return icons[status] || '❓';
}

/**
 * Format overall status for display
 * @param {string} status - Status code
 * @returns {string} Human-readable status
 */
function formatOverallStatus(status) {
  const statusMap = {
    'not-started': 'Not Started',
    'layer1-failed': 'Layer 1 Failed',
    'layer1-complete': 'Layer 1 Complete',
    'layer2-blocked': 'Layer 2 Blocked',
    'layer2-complete': 'Layer 2 Complete',
    'layer3-pending': 'Awaiting Human Review',
    'passed': 'All Gates Passed',
    'unknown': 'Unknown',
  };
  return statusMap[status] || status;
}

/**
 * Format duration for display
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (!ms) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Format time ago
 * @param {Date} date - Date to format
 * @returns {string} Time ago string
 */
function formatTimeAgo(date) {
  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
}

module.exports = {
  createStatusCommand,
};
