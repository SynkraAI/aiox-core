/**
 * QA Run Command
 *
 * Execute quality gate pipeline.
 * Supports running full pipeline or specific layers.
 *
 * @module cli/commands/qa/run
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const { Command } = require('commander');
const { QualityGateManager } = require('../../../core/quality-gates/quality-gate-manager');

/**
 * Create the run subcommand
 * @returns {Command} Commander command instance
 */
function createRunCommand() {
  const run = new Command('run');

  run
    .description('Execute quality gate pipeline')
    .option('-l, --layer <number>', 'Run specific layer only (1, 2, or 3)')
    .option('-v, --verbose', 'Show detailed output', false)
    .option('-s, --story <id>', 'Story ID for reporting')
    .option('--save-report', 'Save detailed report to file', false)
    .option('--no-fail-fast', 'Continue on Layer 1 failures')
    .action(async (options) => {
      try {
        const manager = await QualityGateManager.load();

        const context = {
          verbose: options.verbose,
          storyId: options.story,
          failFast: options.failFast !== false,
        };

        let result;

        if (options.layer) {
          // Run specific layer
          const layerNum = parseInt(options.layer, 10);
          if (![1, 2, 3].includes(layerNum)) {
            console.error('Error: Layer must be 1, 2, or 3');
            process.exit(1);
          }

          if (context.verbose) {
            console.log(`\n🔍 Running Layer ${layerNum} only`);
            console.log('━'.repeat(50));
          }

          result = await manager.runLayer(layerNum, context);

          // Format single layer output
          printLayerResult(result, context.verbose);
        } else {
          // Run full pipeline
          result = await manager.orchestrate(context);

          if (!context.verbose) {
            // Print summary for non-verbose mode
            printSummary(result);
          }
        }

        // Save status
        await manager.saveStatus();

        // Save report if requested
        if (options.saveReport) {
          const reportPath = await manager.saveReport(options.story);
          console.log(`\n📄 Report saved to: ${reportPath}`);
        }

        // Exit with appropriate code
        process.exit(result.exitCode || (result.pass ? 0 : 1));
      } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (options.verbose) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

  return run;
}

/**
 * Print single layer result
 * @param {Object} result - Layer result
 * @param {boolean} verbose - Verbose mode
 */
function printLayerResult(result, verbose = false) {
  if (verbose) {
    // Verbose output already printed by layer
    return;
  }

  const icon = result.pass ? '✅' : '❌';
  console.log(`\n${icon} ${result.layer}`);

  result.results?.forEach((check) => {
    const checkIcon = check.pass ? '✓' : '✗';
    const skipped = check.skipped ? ' (skipped)' : '';
    console.log(`  ${checkIcon} ${check.check}: ${check.message}${skipped}`);
  });

  console.log(`\nDuration: ${formatDuration(result.duration)}`);
}

/**
 * Print pipeline summary
 * @param {Object} result - Pipeline result
 */
function printSummary(result) {
  console.log('\n🔍 Quality Gate Pipeline');
  console.log('━'.repeat(50));

  result.layers?.forEach((layer) => {
    const icon = layer.pass ? '✅' : '❌';
    const status = layer.pass ? 'PASSED' : 'FAILED';
    console.log(`\n${layer.layer}`);

    layer.results?.forEach((check) => {
      const checkIcon = check.pass ? '✓' : '✗';
      const skipped = check.skipped ? ' (skipped)' : '';
      console.log(`  ${checkIcon} ${check.check}: ${check.message}${skipped}`);
    });

    console.log(`  ${icon} ${status}`);
  });

  console.log('\n━'.repeat(50));

  const statusIcon = result.status === 'passed' ? '✅' :
    result.status === 'pending' ? '⏳' : '❌';

  console.log(`Result: ${statusIcon} ${result.status.toUpperCase()}`);
  console.log(`Duration: ${formatDuration(result.duration)}`);

  if (result.message) {
    console.log(`Message: ${result.message}`);
  }
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

module.exports = {
  createRunCommand,
};
