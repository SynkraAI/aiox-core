/**
 * AIOX Migration Command
 *
 * CLI command for migrating from v2.0 to v4.0.4 modular structure.
 *
 * @module cli/commands/migrate
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v4.0.4
 */

const { Command } = require('commander');
const path = require('path');
const readline = require('readline');

const { createBackup, verifyBackup, listBackups } = require('./backup');
const { detectV2Structure, analyzeMigrationPlan, formatMigrationPlan } = require('./analyze');
const { executeMigration, saveMigrationState, clearMigrationState } = require('./execute');
const { updateAllImports } = require('./update-imports');
const { runFullValidation, generateSummary } = require('./validate');
const { executeRollback, formatRollbackSummary, canRollback } = require('./rollback');

/**
 * Print styled header
 */
function printHeader(fromVersion, toVersion) {
  console.log('');
  console.log(`🔄 AIOX Migration v${fromVersion} → v${toVersion}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

/**
 * Ask user for confirmation
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} User response
 */
async function askConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} [Y/n]: `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === '' || normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * Progress reporter helper
 * @param {boolean} verbose - Verbose mode
 * @returns {Function} Progress callback
 */
function createProgressReporter(verbose) {
  return (event) => {
    if (verbose || ['start', 'module', 'complete', 'verify', 'scan'].includes(event.phase)) {
      if (event.message) {
        console.log(event.message);
      }
    }
  };
}

/**
 * Run the migration process
 * @param {Object} options - CLI options
 */
async function runMigration(options) {
  const {
    from = '2.0',
    to = '2.1',
    dryRun = false,
    verbose = false,
    skipTests = false,
    skipLint = false,
    yes = false,
  } = options;

  const projectRoot = process.cwd();
  const onProgress = createProgressReporter(verbose);
  const startTime = Date.now();

  printHeader(from, to);

  // Phase 1: Detect current version
  console.log('Phase 1: Analysis');
  const versionInfo = await detectV2Structure(projectRoot);

  if (!versionInfo.isV2) {
    if (versionInfo.isV21) {
      console.log('ℹ️  Project already has v4.0.4 structure. No migration needed.');
      return;
    }
    console.error(`❌ ${versionInfo.error || 'Cannot detect AIOX version'}`);
    process.exit(1);
  }

  console.log('  ✓ Detected v2.0 structure');

  // Analyze migration plan
  const plan = await analyzeMigrationPlan(projectRoot, { verbose });

  if (!plan.canMigrate) {
    console.error(`❌ Cannot migrate: ${plan.error || plan.message}`);
    process.exit(1);
  }

  console.log(`  ✓ Found ${plan.totalFiles} files to migrate`);
  console.log(`  ✓ Identified ${Object.keys(plan.modules).length} target modules`);
  console.log('');

  // Show migration plan
  console.log(formatMigrationPlan(plan));

  // Check for conflicts
  if (plan.conflicts.length > 0) {
    console.log('');
    console.log('⚠️  Conflicts detected. Some v4.0.4 directories already exist.');

    if (!yes) {
      const proceed = await askConfirmation('Continue anyway?');
      if (!proceed) {
        console.log('Migration cancelled.');
        return;
      }
    }
  }

  // Dry run mode
  if (dryRun) {
    console.log('');
    console.log('📋 Dry run mode - no changes will be made.');
    console.log('');
    console.log('What would happen:');
    console.log(`  • ${plan.totalFiles} files would be migrated`);

    for (const [name, stats] of Object.entries(plan.stats)) {
      if (name !== 'total' && name !== 'uncategorized' && stats.files > 0) {
        console.log(`    - ${name}: ${stats.files} files`);
      }
    }

    console.log('  • Import paths would be updated');
    console.log('  • Lint and tests would run');
    console.log('');
    console.log('Run without --dry-run to execute migration.');
    return;
  }

  // Confirm before proceeding
  if (!yes) {
    console.log('');
    const proceed = await askConfirmation('Proceed with migration?');
    if (!proceed) {
      console.log('Migration cancelled.');
      return;
    }
  }

  console.log('');

  // Phase 2: Backup
  console.log('Phase 2: Backup');

  try {
    const backupResult = await createBackup(projectRoot, { verbose, onProgress });
    console.log(`  ✓ Backup created: ${backupResult.backupDirName}`);

    // Verify backup
    const verification = await verifyBackup(backupResult.backupDir);
    if (verification.valid) {
      console.log('  ✓ Backup verified (checksum match)');
    } else {
      console.error('  ❌ Backup verification failed');
      process.exit(1);
    }

    // Save state
    await saveMigrationState(projectRoot, {
      phase: 'backup',
      backup: backupResult.backupDir,
      plan: { totalFiles: plan.totalFiles },
    });

  } catch (error) {
    console.error(`  ❌ Backup failed: ${error.message}`);
    process.exit(1);
  }

  console.log('');

  // Phase 3: Migration
  console.log('Phase 3: Migration');

  try {
    const migrationResult = await executeMigration(plan, { verbose, onProgress });

    if (!migrationResult.success) {
      console.error('  ❌ Migration failed');
      console.log('  Run: aiox migrate --rollback');
      process.exit(1);
    }

    console.log(`  ✓ Migrated ${migrationResult.totalFiles} files`);

    await saveMigrationState(projectRoot, {
      phase: 'migrated',
      files: migrationResult.totalFiles,
    });

  } catch (error) {
    console.error(`  ❌ Migration error: ${error.message}`);
    console.log('  Run: aiox migrate --rollback');
    process.exit(1);
  }

  console.log('');

  // Phase 4: Import Updates
  console.log('Phase 4: Import Updates');

  try {
    const aioxCoreDir = path.join(projectRoot, '.aiox-core');
    const importResult = await updateAllImports(aioxCoreDir, plan, { verbose, onProgress });

    console.log(`  ✓ Scanned ${importResult.totalFiles} files`);
    console.log(`  ✓ Updated ${importResult.importsUpdated} imports`);

  } catch (error) {
    console.error(`  ⚠️  Import update warning: ${error.message}`);
    // Non-fatal - continue
  }

  console.log('');

  // Phase 5: Validation
  console.log('Phase 5: Validation');

  const validationResult = await runFullValidation(projectRoot, {
    onProgress,
    skipTests,
    skipLint,
  });

  // Clear migration state
  await clearMigrationState(projectRoot);

  // Generate and print summary
  const duration = formatDuration(Date.now() - startTime);
  const backupDir = `.aiox-backup-${new Date().toISOString().split('T')[0]}`;

  console.log('');
  console.log(generateSummary(
    { totalFiles: plan.totalFiles, modules: plan.stats },
    validationResult,
    { backupLocation: backupDir, duration },
  ));
}

/**
 * Run rollback process
 * @param {Object} options - CLI options
 */
async function runRollbackCommand(options) {
  const { verbose = false, yes = false, backup: backupPath } = options;
  const projectRoot = process.cwd();
  const onProgress = createProgressReporter(verbose);

  console.log('');
  console.log('🔙 AIOX Migration Rollback');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Check if rollback is possible
  const status = await canRollback(projectRoot);

  if (!status.canRollback) {
    console.error(`❌ Cannot rollback: ${status.reason}`);
    process.exit(1);
  }

  console.log(`Found backup: ${path.basename(status.backup.path)}`);
  console.log(`  Created: ${new Date(status.backup.date).toLocaleString()}`);
  console.log(`  Files: ${status.backup.files}`);
  console.log('');

  // Confirm
  if (!yes) {
    const proceed = await askConfirmation('Restore from this backup?');
    if (!proceed) {
      console.log('Rollback cancelled.');
      return;
    }
  }

  console.log('');

  // Execute rollback
  const result = await executeRollback(projectRoot, { onProgress, backupPath });

  console.log(formatRollbackSummary(result));

  if (!result.success) {
    process.exit(1);
  }
}

/**
 * Show backup status
 * @param {Object} options - CLI options
 */
async function showBackupStatus(_options) {
  const projectRoot = process.cwd();
  const backups = await listBackups(projectRoot);

  console.log('');
  console.log('📦 AIOX Migration Backups');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (backups.length === 0) {
    console.log('');
    console.log('No backups found.');
    return;
  }

  console.log('');

  for (const backup of backups) {
    console.log(`${backup.name}`);
    if (backup.created) {
      console.log(`  Created: ${new Date(backup.created).toLocaleString()}`);
    }
    console.log(`  Files: ${backup.fileCount}`);
    console.log(`  Valid manifest: ${backup.hasManifest ? 'Yes' : 'No'}`);
    console.log('');
  }
}

/**
 * Format duration in human readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes} min ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Create the migrate command with all options
 * @returns {Command} Commander command instance
 */
function createMigrateCommand() {
  const migrate = new Command('migrate');

  migrate
    .description('Migrate AIOX from v2.0 to v4.0.4 modular structure')
    .option('--from <version>', 'Source version', '2.0')
    .option('--to <version>', 'Target version', '2.1')
    .option('--dry-run', 'Show migration plan without executing')
    .option('--verbose', 'Show detailed progress')
    .option('--skip-tests', 'Skip test execution after migration')
    .option('--skip-lint', 'Skip lint check after migration')
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('--rollback', 'Rollback to pre-migration state')
    .option('--backup <path>', 'Specify backup path for rollback')
    .option('--status', 'Show backup status')
    .addHelpText('after', `
Migration Flow:
  Phase 1: Backup
    - Creates .aiox-backup-{date}/ with all files
    - Verifies backup integrity

  Phase 2: Analysis
    - Detects v2.0 structure
    - Creates migration plan
    - Reports conflicts

  Phase 3: Migration
    - Creates module directories (core/, development/, etc.)
    - Moves files to appropriate modules
    - Preserves metadata

  Phase 4: Import Updates
    - Scans all JS/TS files
    - Updates require/import paths

  Phase 5: Validation
    - Verifies structure
    - Runs lint
    - Runs tests

Examples:
  $ aiox migrate                          # Interactive migration
  $ aiox migrate --dry-run                # Preview changes
  $ aiox migrate --verbose                # Detailed output
  $ aiox migrate -y --skip-tests          # Non-interactive, skip tests
  $ aiox migrate --rollback               # Restore from backup
  $ aiox migrate --status                 # Show backups

Rollback:
  If migration fails or you want to revert:
  $ aiox migrate --rollback

  Manual rollback:
  $ cp -r .aiox-backup-{date}/* .aiox-core/
`);

  migrate.action(async (options) => {
    try {
      if (options.status) {
        await showBackupStatus(options);
      } else if (options.rollback) {
        await runRollbackCommand(options);
      } else {
        await runMigration(options);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

  return migrate;
}

module.exports = {
  createMigrateCommand,
};
