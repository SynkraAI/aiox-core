/**
 * Metrics Seed Command
 *
 * Generate seed data for testing metrics dashboard.
 *
 * @module cli/commands/metrics/seed
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const { Command } = require('commander');
const { seedMetrics } = require('../../../quality/seed-metrics');

/**
 * Create the seed subcommand
 * @returns {Command} Commander command instance
 */
function createSeedCommand() {
  const seed = new Command('seed');

  seed
    .description('Generate seed data for testing metrics dashboard')
    .option('-d, --days <number>', 'Number of days of history to generate', '30')
    .option('-r, --runs <number>', 'Average runs per day', '8')
    .option('--no-weekends', 'Include full activity on weekends', false)
    .option('--dry-run', 'Preview generated data without saving', false)
    .option('-v, --verbose', 'Show detailed output', false)
    .action(async (options) => {
      try {
        const seedOptions = {
          days: parseInt(options.days, 10),
          runsPerDay: parseInt(options.runs, 10),
          weekendReduction: options.weekends !== false,
        };

        console.log('\n🌱 Generating Seed Data');
        console.log('━'.repeat(40));
        console.log(`Days: ${seedOptions.days}`);
        console.log(`Runs/Day: ${seedOptions.runsPerDay}`);
        console.log(`Weekend Reduction: ${seedOptions.weekendReduction ? 'Yes' : 'No'}`);

        if (options.dryRun) {
          // Generate but don't save
          const { generateSeedData } = require('../../../quality/seed-metrics');
          const metrics = generateSeedData(seedOptions);

          console.log('\n📊 Generated Data Preview (dry run)');
          console.log('─'.repeat(40));
          console.log(`Total History Records: ${metrics.history.length}`);
          console.log(`Layer 1 Runs: ${metrics.layers.layer1.totalRuns}`);
          console.log(`Layer 2 Runs: ${metrics.layers.layer2.totalRuns}`);
          console.log(`Layer 3 Runs: ${metrics.layers.layer3.totalRuns}`);

          console.log('\n📈 Layer Pass Rates:');
          console.log(`  Layer 1: ${(metrics.layers.layer1.passRate * 100).toFixed(1)}%`);
          console.log(`  Layer 2: ${(metrics.layers.layer2.passRate * 100).toFixed(1)}%`);
          console.log(`  Layer 3: ${(metrics.layers.layer3.passRate * 100).toFixed(1)}%`);

          if (options.verbose) {
            console.log('\n📜 Sample History (first 5 records):');
            metrics.history.slice(0, 5).forEach((r) => {
              const time = r.timestamp.substring(0, 19).replace('T', ' ');
              const status = r.passed ? 'PASS' : 'FAIL';
              console.log(`  ${time} Layer ${r.layer} ${status}`);
            });
          }

          console.log('\n⚠️  Dry run mode - data not saved');
          console.log('Run without --dry-run to save data');
          process.exit(0);
        }

        // Generate and save
        const metrics = await seedMetrics(seedOptions);

        console.log('\n✅ Seed Data Generated');
        console.log('─'.repeat(40));
        console.log(`Total History Records: ${metrics.history.length}`);
        console.log(`Layer 1 Runs: ${metrics.layers.layer1.totalRuns}`);
        console.log(`Layer 2 Runs: ${metrics.layers.layer2.totalRuns}`);
        console.log(`Layer 3 Runs: ${metrics.layers.layer3.totalRuns}`);

        console.log('\n📈 Layer Pass Rates:');
        console.log(`  Layer 1: ${(metrics.layers.layer1.passRate * 100).toFixed(1)}%`);
        console.log(`  Layer 2: ${(metrics.layers.layer2.passRate * 100).toFixed(1)}%`);
        console.log(`  Layer 3: ${(metrics.layers.layer3.passRate * 100).toFixed(1)}%`);

        console.log('\n🔗 CodeRabbit Metrics:');
        const cr = metrics.layers.layer2.coderabbit;
        if (cr?.active) {
          console.log(`  Total Findings: ${cr.findingsCount}`);
          console.log(`  Critical: ${cr.severityBreakdown.critical}`);
          console.log(`  High: ${cr.severityBreakdown.high}`);
          console.log(`  Medium: ${cr.severityBreakdown.medium}`);
          console.log(`  Low: ${cr.severityBreakdown.low}`);
        }

        console.log('\n🔍 Quinn Metrics:');
        const q = metrics.layers.layer2.quinn;
        if (q) {
          console.log(`  Findings: ${q.findingsCount}`);
          console.log(`  Top Categories: ${q.topCategories.join(', ')}`);
        }

        console.log('\n📊 Trend Data:');
        console.log(`  Pass Rate Points: ${metrics.trends.passRates.length}`);
        console.log(`  Auto-Catch Points: ${metrics.trends.autoCatchRate.length}`);

        console.log('\n✅ Data saved to .aiox/data/quality-metrics.json');

        process.exit(0);
      } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (options.verbose) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

  return seed;
}

module.exports = {
  createSeedCommand,
};
