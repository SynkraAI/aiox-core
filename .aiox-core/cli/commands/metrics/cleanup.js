/**
 * Metrics Cleanup Command
 *
 * Remove old records beyond retention period.
 *
 * @module cli/commands/metrics/cleanup
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const { Command } = require('commander');
const { MetricsCollector } = require('../../../quality/metrics-collector');

/**
 * Create the cleanup subcommand
 * @returns {Command} Commander command instance
 */
function createCleanupCommand() {
  const cleanup = new Command('cleanup');

  cleanup
    .description('Remove old records beyond retention period')
    .option('-d, --dry-run', 'Show what would be deleted without deleting', false)
    .option('-r, --retention <days>', 'Override retention period (days)', '30')
    .option('-v, --verbose', 'Show detailed output', false)
    .action(async (options) => {
      try {
        const retentionDays = parseInt(options.retention, 10);
        const collector = new MetricsCollector({ retentionDays });
        const metrics = await collector.getMetrics();

        const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
        const cutoffDate = new Date(cutoff).toISOString();

        // Count records that would be removed
        const toRemove = metrics.history.filter(
          (r) => new Date(r.timestamp).getTime() <= cutoff,
        );

        if (options.dryRun) {
          console.log('\n🔍 Cleanup Dry Run');
          console.log('━'.repeat(40));
          console.log(`Retention Period: ${retentionDays} days`);
          console.log(`Cutoff Date: ${cutoffDate.split('T')[0]}`);
          console.log(`Records to Remove: ${toRemove.length}`);
          console.log(`Records to Keep: ${metrics.history.length - toRemove.length}`);

          if (options.verbose && toRemove.length > 0) {
            console.log('\n📜 Records to be removed:');
            toRemove.forEach((r) => {
              const time = r.timestamp.substring(0, 19).replace('T', ' ');
              const status = r.passed ? 'PASS' : 'FAIL';
              console.log(`  ${time} Layer ${r.layer} ${status}`);
            });
          }

          console.log('\nRun without --dry-run to perform cleanup');
          process.exit(0);
        }

        // Perform actual cleanup
        const removedCount = await collector.cleanup();

        console.log('\n🧹 Cleanup Complete');
        console.log('━'.repeat(40));
        console.log(`Retention Period: ${retentionDays} days`);
        console.log(`Records Removed: ${removedCount}`);
        console.log(`Records Remaining: ${metrics.history.length - removedCount}`);

        if (removedCount > 0) {
          console.log('\n✅ Metrics recalculated after cleanup');
        } else {
          console.log('\n✅ No records needed cleanup');
        }

        process.exit(0);
      } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (options.verbose) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

  return cleanup;
}

module.exports = {
  createCleanupCommand,
};
