/**
 * Manifest Regenerate Command
 *
 * CLI command to regenerate all manifest files from source.
 *
 * @module cli/commands/manifest/regenerate
 * @version 1.0.0
 * @story 2.13 - Manifest System
 */

const { Command } = require('commander');
const path = require('path');
const { createManifestGenerator } = require('../../../core/manifest/manifest-generator');

/**
 * Create the regenerate subcommand
 * @returns {Command} Commander command instance
 */
function createRegenerateCommand() {
  const regenerate = new Command('regenerate');

  regenerate
    .description('Regenerate all manifest files from source files')
    .option('-f, --force', 'Force regeneration even if manifests exist')
    .option('--json', 'Output results as JSON')
    .option('--dry-run', 'Show what would be generated without writing files')
    .action(async (options) => {
      try {
        const generator = createManifestGenerator({
          basePath: process.cwd(),
        });

        if (!options.dryRun) {
          console.log('Scanning .aiox-core/...\n');
        } else {
          console.log('[DRY RUN] Would generate:\n');
        }

        const results = await generator.generateAll();

        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
          return;
        }

        // Format output
        const formatResult = (name, result) => {
          if (result.success) {
            const verb = options.dryRun ? 'Would generate' : 'Generated';
            console.log(`✓ ${verb} ${name}.csv (${result.count} entries)`);
            if (result.errors.length > 0) {
              result.errors.forEach(e => console.log(`  ⚠ ${e}`));
            }
          } else {
            console.log(`✗ Failed to generate ${name}.csv`);
            result.errors.forEach(e => console.log(`  ✗ ${e}`));
          }
        };

        formatResult('agents', results.agents);
        formatResult('workers', results.workers);
        formatResult('tasks', results.tasks);

        console.log('');

        if (results.errors.length > 0) {
          console.log('❌ Errors during generation:');
          results.errors.forEach(e => console.log(`  ✗ ${e}`));
          process.exit(1);
        }

        const allSuccess = results.agents.success &&
                          results.workers.success &&
                          results.tasks.success;

        if (allSuccess) {
          const verb = options.dryRun ? 'Would be generated' : 'regenerated';
          console.log(`✅ Manifests ${verb}!`);
          console.log(`   Duration: ${results.duration}ms`);
        } else {
          console.log('❌ Some manifests failed to generate');
          process.exit(1);
        }

      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    });

  return regenerate;
}

module.exports = {
  createRegenerateCommand,
};
