/**
 * Metrics Record Command
 *
 * Record a quality gate run with metrics.
 *
 * @module cli/commands/metrics/record
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const { Command } = require('commander');
const { MetricsCollector } = require('../../../quality/metrics-collector');

/**
 * Create the record subcommand
 * @returns {Command} Commander command instance
 */
function createRecordCommand() {
  const record = new Command('record');

  record
    .description('Record a quality gate run')
    .requiredOption('-l, --layer <number>', 'Layer number (1, 2, or 3)')
    .option('-p, --passed', 'Mark run as passed', false)
    .option('-f, --failed', 'Mark run as failed', false)
    .option('-d, --duration <ms>', 'Duration in milliseconds')
    .option('--findings <count>', 'Number of findings')
    .option('-s, --story <id>', 'Story ID for metadata')
    .option('-b, --branch <name>', 'Branch name for metadata')
    .option('--commit <hash>', 'Commit hash for metadata')
    .option('--coderabbit', 'Include CodeRabbit metrics', false)
    .option('--cr-critical <count>', 'CodeRabbit critical findings', '0')
    .option('--cr-high <count>', 'CodeRabbit high findings', '0')
    .option('--cr-medium <count>', 'CodeRabbit medium findings', '0')
    .option('--cr-low <count>', 'CodeRabbit low findings', '0')
    .option('--quinn', 'Include Quinn metrics', false)
    .option('--quinn-findings <count>', 'Quinn findings count', '0')
    .option('--quinn-categories <list>', 'Quinn categories (comma-separated)')
    .option('-v, --verbose', 'Show detailed output', false)
    .action(async (options) => {
      try {
        const collector = new MetricsCollector();

        const layerNum = parseInt(options.layer, 10);
        if (![1, 2, 3].includes(layerNum)) {
          console.error('❌ Error: Layer must be 1, 2, or 3');
          process.exit(1);
        }

        // Determine pass/fail status
        let passed = true;
        if (options.failed) {
          passed = false;
        } else if (options.passed) {
          passed = true;
        }

        // Build result object
        const result = {
          passed,
          durationMs: options.duration ? parseInt(options.duration, 10) : 0,
          findingsCount: options.findings ? parseInt(options.findings, 10) : 0,
          metadata: {},
        };

        // Add metadata
        if (options.story) result.metadata.storyId = options.story;
        if (options.branch) result.metadata.branchName = options.branch;
        if (options.commit) result.metadata.commitHash = options.commit;
        result.metadata.triggeredBy = 'cli';

        // Handle Layer 2 specific metrics
        if (layerNum === 2) {
          if (options.coderabbit) {
            result.coderabbit = {
              findingsCount: parseInt(options.crCritical, 10) +
                parseInt(options.crHigh, 10) +
                parseInt(options.crMedium, 10) +
                parseInt(options.crLow, 10),
              severityBreakdown: {
                critical: parseInt(options.crCritical, 10),
                high: parseInt(options.crHigh, 10),
                medium: parseInt(options.crMedium, 10),
                low: parseInt(options.crLow, 10),
              },
            };
          }

          if (options.quinn) {
            result.quinn = {
              findingsCount: parseInt(options.quinnFindings, 10),
              topCategories: options.quinnCategories
                ? options.quinnCategories.split(',').map((c) => c.trim())
                : [],
            };
          }

          // Record as PR review for Layer 2
          const run = await collector.recordPRReview(result);

          if (options.verbose) {
            console.log('\n📊 Layer 2 PR Review Recorded');
            console.log('━'.repeat(40));
            console.log(`Timestamp: ${run.timestamp}`);
            console.log(`Passed: ${run.passed ? '✅' : '❌'}`);
            console.log(`Duration: ${run.durationMs}ms`);
            console.log(`Findings: ${run.findingsCount}`);
            if (options.coderabbit) {
              console.log(`CodeRabbit: ${JSON.stringify(result.coderabbit)}`);
            }
            if (options.quinn) {
              console.log(`Quinn: ${JSON.stringify(result.quinn)}`);
            }
          } else {
            const icon = run.passed ? '✅' : '❌';
            console.log(`${icon} Layer 2 run recorded`);
          }
        } else {
          // Record Layer 1 or 3
          const run = await collector.recordRun(layerNum, result);

          if (options.verbose) {
            const layerName = layerNum === 1 ? 'Pre-commit' : 'Human Review';
            console.log(`\n📊 Layer ${layerNum} ${layerName} Recorded`);
            console.log('━'.repeat(40));
            console.log(`Timestamp: ${run.timestamp}`);
            console.log(`Passed: ${run.passed ? '✅' : '❌'}`);
            console.log(`Duration: ${run.durationMs}ms`);
            console.log(`Findings: ${run.findingsCount}`);
            if (Object.keys(result.metadata).length > 0) {
              console.log(`Metadata: ${JSON.stringify(result.metadata)}`);
            }
          } else {
            const icon = run.passed ? '✅' : '❌';
            console.log(`${icon} Layer ${layerNum} run recorded`);
          }
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

  return record;
}

module.exports = {
  createRecordCommand,
};
