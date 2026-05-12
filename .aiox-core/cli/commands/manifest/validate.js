/**
 * Manifest Validate Command
 *
 * CLI command to validate all manifest files.
 *
 * @module cli/commands/manifest/validate
 * @version 1.0.0
 * @story 2.13 - Manifest System
 */

const { Command } = require('commander');
const path = require('path');
const { createManifestValidator } = require('../../../core/manifest/manifest-validator');

/**
 * Create the validate subcommand
 * @returns {Command} Commander command instance
 */
function createValidateCommand() {
  const validate = new Command('validate');

  validate
    .description('Validate all manifest files for integrity and file existence')
    .option('-v, --verbose', 'Show detailed validation information')
    .option('--json', 'Output results as JSON')
    .option('--strict', 'Treat warnings as errors')
    .action(async (options) => {
      try {
        const validator = createManifestValidator({
          basePath: process.cwd(),
          verbose: options.verbose,
        });

        console.log('Validating manifests...\n');

        const results = await validator.validateAll();

        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
        } else {
          console.log(validator.formatResults(results));
        }

        // Exit with error code if validation failed
        const hasErrors = results.summary.invalid > 0;
        const hasWarningsAsErrors = options.strict && (
          results.summary.missing.length > 0 ||
          results.summary.orphan.length > 0
        );

        if (hasErrors || hasWarningsAsErrors) {
          process.exit(1);
        }

      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    });

  return validate;
}

module.exports = {
  createValidateCommand,
};
