/**
 * Validate Command Module
 *
 * CLI command for validating AIOS-Core installation integrity.
 * Compares installed files against the install manifest.
 *
 * @module cli/commands/validate
 * @version 1.0.0
 * @story 6.19 - Post-Installation Validation & Integrity Verification
 *
 * Usage:
 *   aios validate                    # Validate current installation
 *   aios validate --repair           # Repair missing/corrupted files
 *   aios validate --repair --dry-run # Preview repairs without applying
 *   aios validate --detailed         # Show detailed file list
 *   aios validate --json             # Output as JSON
 */

'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');

/**
 * Exit codes for CLI consistency
 * @enum {number}
 */
const ExitCode = {
  SUCCESS: 0,
  VALIDATION_FAILED: 1,
  ERROR: 2,
};

// Resolve validator module path
const validatorPath = path.resolve(__dirname, '../../../../packages/installer/src/installer/post-install-validator');
let PostInstallValidator, formatReport;

let validatorLoadError = null;
try {
  const validator = require(validatorPath);
  PostInstallValidator = validator.PostInstallValidator;
  formatReport = validator.formatReport;
} catch (error) {
  // Store error for later - will be reported during command execution
  // This allows proper JSON output when --json flag is used
  validatorLoadError = error;
}

/**
 * Create the validate command
 * @returns {Command} Commander command instance
 */
function createValidateCommand() {
  const validate = new Command('validate');

  validate
    .description('Validate AIOS-Core installation integrity')
    .option('-r, --repair', 'Repair missing or corrupted files')
    .option('-d, --dry-run', 'Preview repairs without applying (use with --repair)')
    .option('--detailed', 'Show detailed file list')
    .option('--no-hash', 'Skip hash verification (faster)')
    .option('--extras', 'Detect extra files not in manifest')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--json', 'Output results as JSON')
    .option('--source <dir>', 'Source directory for repairs')
    .addHelpText(
      'after',
      `
Examples:
  ${chalk.dim('# Validate current installation')}
  $ aios validate

  ${chalk.dim('# Validate with detailed file list')}
  $ aios validate --detailed

  ${chalk.dim('# Repair missing/corrupted files')}
  $ aios validate --repair

  ${chalk.dim('# Preview what would be repaired')}
  $ aios validate --repair --dry-run

  ${chalk.dim('# Quick validation (skip hash check)')}
  $ aios validate --no-hash

  ${chalk.dim('# Output as JSON for CI/CD')}
  $ aios validate --json

Exit Codes:
  0 - Validation passed
  1 - Validation failed (missing/corrupted files)
  2 - Validation error (could not complete)
`
    )
    .action(async (options) => {
      await runValidation(options);
    });

  return validate;
}

/**
 * Run the validation process
 * @param {Object} options - Command options
 */
async function runValidation(options) {
  const projectRoot = process.cwd();
  const aiosCoreDir = path.join(projectRoot, '.aios-core');

  // Check if AIOS-Core is installed
  if (!fs.existsSync(aiosCoreDir)) {
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            status: 'failed',
            error: 'AIOS-Core not found in current directory',
            // SECURITY: Sanitize path - only show relative indicator
            location: '.aios-core',
          },
          null,
          2
        )
      );
    } else {
      console.error(chalk.red('\nError: AIOS-Core not found in current directory'));
      console.error(chalk.dim(`Expected at: ${aiosCoreDir}`));
      console.error(chalk.dim('\nRun `npx aios-core install` to install AIOS-Core'));
    }
    process.exit(ExitCode.ERROR);
  }

  // Check if validator module is available
  if (!PostInstallValidator) {
    const errorMsg = validatorLoadError
      ? `Validator module failed to load: ${validatorLoadError.message}`
      : 'Validator module not available';

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            status: 'error',
            error: errorMsg,
            hint: 'This may indicate a corrupted installation',
          },
          null,
          2
        )
      );
    } else {
      console.error(chalk.red(`\nError: ${errorMsg}`));
      console.error(chalk.dim('This may indicate a corrupted installation'));
    }
    process.exit(ExitCode.ERROR);
  }

  // Determine source directory for repairs
  let sourceDir = options.source;

  // SECURITY: Validate --source directory if provided
  if (sourceDir) {
    const sourceManifest = path.join(sourceDir, '.aios-core', 'install-manifest.yaml');
    if (!fs.existsSync(sourceManifest)) {
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              status: 'error',
              error: 'Invalid source directory: manifest not found',
              path: sourceDir,
            },
            null,
            2
          )
        );
      } else {
        console.error(chalk.red('\nError: Invalid source directory'));
        console.error(chalk.dim(`Expected manifest at: ${sourceManifest}`));
      }
      process.exit(ExitCode.ERROR);
    }
  }

  if (!sourceDir && options.repair) {
    // Try to find source in common locations
    const possibleSources = [
      path.join(__dirname, '../../../../..'), // npm package root
      path.join(projectRoot, 'node_modules/aios-core'),
      path.join(projectRoot, 'node_modules/@synkra/aios-core'),
    ];

    for (const src of possibleSources) {
      if (fs.existsSync(path.join(src, '.aios-core', 'install-manifest.yaml'))) {
        sourceDir = src;
        break;
      }
    }
  }

  // Show spinner for non-JSON output (must be defined before validator for closure)
  let spinner = null;
  if (!options.json) {
    console.log('');
    spinner = ora({
      text: 'Loading installation manifest...',
      color: 'cyan',
    }).start();
  }

  // Create validator instance
  const validator = new PostInstallValidator(projectRoot, sourceDir, {
    verifyHashes: options.hash !== false,
    detectExtras: options.extras === true,
    verbose: options.verbose === true,
    onProgress: options.json
      ? () => {}
      : (current, total, file) => {
          if (spinner) {
            spinner.text = `Validating ${current}/${total}: ${truncatePath(file, 40)}`;
          }
        },
  });

  try {
    // Run validation
    const report = await validator.validate();

    if (spinner) {
      spinner.succeed('Validation complete');
    }

    // Handle repair mode
    let repairResult = null;
    let repairAttempted = false;

    if (options.repair && (report.stats.missingFiles > 0 || report.stats.corruptedFiles > 0)) {
      repairAttempted = true;
      if (!sourceDir) {
        if (!options.json) {
          console.error(chalk.yellow('\nWarning: Cannot repair - source directory not found'));
          console.error(
            chalk.dim('Specify source with --source <dir> or ensure package is installed')
          );
        }
        repairResult = {
          success: false,
          error: 'Source directory not found',
          repaired: [],
          failed: [],
        };
      } else {
        repairResult = await runRepair(validator, options, spinner);
      }
    }

    // Output results
    if (options.json) {
      // Include repair results in JSON output for CI/CD pipelines
      // SECURITY: Use explicit property copy to prevent prototype pollution
      const output = {
        status: report.status,
        integrityScore: report.integrityScore,
        manifestVerified: report.manifestVerified,
        timestamp: report.timestamp,
        duration: report.duration,
        manifest: report.manifest,
        stats: report.stats,
        summary: report.summary,
        recommendations: report.recommendations,
        // Only include issues count in JSON to avoid leaking internal paths
        issueCount: report.issues?.length ?? 0,
        repair: repairAttempted
          ? {
              attempted: true,
              success: repairResult?.success ?? false,
              error: repairResult?.error ?? null,
              dryRun: options.dryRun === true,
              repairedCount: repairResult?.repaired?.length ?? 0,
              failedCount: repairResult?.failed?.length ?? 0,
              repaired: repairResult?.repaired ?? [],
              failed: repairResult?.failed ?? [],
            }
          : { attempted: false },
      };
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log(formatReport(report, { colors: true, detailed: options.detailed }));

      // Surface repair refusal errors in human-readable output
      if (repairAttempted && !repairResult?.success && repairResult?.error) {
        console.log('');
        console.log(chalk.red(`Repair failed: ${repairResult.error}`));
      }
    }

    // Exit with appropriate code
    // If repair was attempted and successful (not dry-run), exit 0
    // If repair failed or was not attempted and there are issues, exit 1
    if (repairAttempted && !options.dryRun && repairResult?.success) {
      // Repair succeeded - exit 0
      process.exit(ExitCode.SUCCESS);
    } else if (report.status === 'failed') {
      process.exit(ExitCode.VALIDATION_FAILED);
    } else if (
      report.status === 'warning' &&
      (report.stats.missingFiles > 0 || report.stats.corruptedFiles > 0)
    ) {
      process.exit(ExitCode.VALIDATION_FAILED);
    } else {
      process.exit(ExitCode.SUCCESS);
    }
  } catch (error) {
    if (spinner) {
      spinner.fail('Validation failed');
    }

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            status: 'error',
            error: error.message,
            // SECURITY: Only include stack in verbose mode for debugging
            stack: options.verbose ? error.stack : undefined,
          },
          null,
          2
        )
      );
    } else {
      console.error(chalk.red(`\nError: ${error.message}`));
      if (options.verbose) {
        console.error(chalk.dim(error.stack));
      }
    }

    process.exit(ExitCode.ERROR);
  }
}

/**
 * Run repair process
 * @param {PostInstallValidator} validator - Validator instance
 * @param {Object} options - Command options
 * @param {Object} spinner - Ora spinner instance
 * @returns {Object} Repair result with success status, repaired files, and failed files
 */
async function runRepair(validator, options, spinner) {
  const dryRun = options.dryRun === true;

  if (!options.json) {
    console.log('');
    if (dryRun) {
      spinner = ora({
        text: 'Analyzing files to repair (dry run)...',
        color: 'yellow',
      }).start();
    } else {
      spinner = ora({
        text: 'Repairing files...',
        color: 'green',
      }).start();
    }
  }

  const repairResult = await validator.repair({
    dryRun,
    onProgress: options.json
      ? () => {}
      : (current, total, file) => {
          if (spinner) {
            const action = dryRun ? 'Checking' : 'Repairing';
            spinner.text = `${action} ${current}/${total}: ${truncatePath(file, 40)}`;
          }
        },
  });

  if (spinner) {
    if (repairResult.success) {
      const action = dryRun ? 'would be repaired' : 'repaired';
      spinner.succeed(`${repairResult.repaired.length} file(s) ${action}`);
    } else {
      spinner.warn('Repair completed with some failures');
    }
  }

  if (!options.json) {
    // Show repair summary
    if (repairResult.repaired.length > 0) {
      console.log('');
      console.log(chalk.bold(dryRun ? 'Files that would be repaired:' : 'Repaired files:'));
      for (const file of repairResult.repaired.slice(0, 20)) {
        const icon = dryRun ? chalk.yellow('○') : chalk.green('✓');
        console.log(`  ${icon} ${file.path}`);
      }
      if (repairResult.repaired.length > 20) {
        console.log(chalk.dim(`  ... and ${repairResult.repaired.length - 20} more`));
      }
    }

    if (repairResult.failed.length > 0) {
      console.log('');
      console.log(chalk.bold(chalk.red('Failed to repair:')));
      for (const file of repairResult.failed) {
        console.log(`  ${chalk.red('✗')} ${file.path}: ${file.reason}`);
      }
    }
  }

  return repairResult;
}

/**
 * Truncate path for display
 * @param {string} filePath - File path
 * @param {number} maxLen - Maximum length
 * @returns {string} - Truncated path
 */
function truncatePath(filePath, maxLen) {
  if (!filePath || filePath.length <= maxLen) return filePath;
  return '...' + filePath.slice(-(maxLen - 3));
}

module.exports = {
  createValidateCommand,
};
