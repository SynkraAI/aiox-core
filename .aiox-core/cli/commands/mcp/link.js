/**
 * MCP Link Command
 *
 * Creates symlink/junction from project to global MCP config.
 *
 * @module cli/commands/mcp/link
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const { Command } = require('commander');
const {
  createLink,
  removeLink,
  checkLinkStatus,
  LINK_STATUS,
  getProjectMcpPath,
} = require('../../../core/mcp/symlink-manager');
const {
  globalConfigExists,
  createGlobalStructure,
  createGlobalConfig,
} = require('../../../core/mcp/global-config-manager');
const {
  getGlobalMcpDir,
  getLinkType,
  isWindows,
} = require('../../../core/mcp/os-detector');
const {
  analyzeMigration,
  executeMigration,
  MIGRATION_OPTION,
} = require('../../../core/mcp/config-migrator');

/**
 * Create the link command
 * @returns {Command} Commander command instance
 */
function createLinkCommand() {
  const link = new Command('link');

  link
    .description('Create project symlink to global MCP config')
    .option('-f, --force', 'Force link creation (overwrite existing)')
    .option('--migrate', 'Migrate existing project config to global')
    .option('--merge', 'Merge project config with global config')
    .option('--unlink', 'Remove the link (restore project independence)')
    .option('-v, --verbose', 'Show detailed output')
    .action(async (options) => {
      await executeLink(options);
    });

  return link;
}

/**
 * Execute the link command
 * @param {Object} options - Command options
 */
async function executeLink(options) {
  const projectRoot = process.cwd();

  // Handle unlink
  if (options.unlink) {
    console.log('Removing project link to global MCP config...\n');

    const result = removeLink(projectRoot);
    if (result.success) {
      if (result.alreadyRemoved) {
        console.log('✓ No link exists to remove');
      } else {
        console.log(`✓ Removed link at ${result.linkPath}`);
      }
      console.log('\n✅ Project is now independent from global MCP config');
    } else {
      console.error(`✗ ${result.error}`);
      process.exit(1);
    }
    return;
  }

  console.log('Linking project to global MCP config...\n');

  // Check current status
  const status = checkLinkStatus(projectRoot);

  if (options.verbose) {
    console.log('Current status:');
    console.log(`  Link path: ${status.linkPath}`);
    console.log(`  Global path: ${status.globalPath}`);
    console.log(`  Status: ${status.status}`);
    console.log(`  Type: ${status.type}`);
    console.log('');
  }

  // Already linked
  if (status.status === LINK_STATUS.LINKED) {
    console.log('✓ Already linked to global MCP config');
    console.log(`  ${status.linkPath} → ${status.target}`);
    console.log('\n✅ No changes needed');
    return;
  }

  // Ensure global config exists
  if (!globalConfigExists()) {
    console.log('Global MCP config not found. Creating...');

    const structureResult = createGlobalStructure();
    if (!structureResult.success) {
      console.error('✗ Could not create global structure');
      process.exit(1);
    }
    console.log('  ✓ Created global directory structure');

    const configResult = createGlobalConfig();
    if (!configResult.success) {
      console.error(`✗ Could not create config: ${configResult.error}`);
      process.exit(1);
    }
    console.log('  ✓ Created global config file');
    console.log('');
  }

  // Analyze migration scenario
  const analysis = analyzeMigration(projectRoot);

  if (options.verbose) {
    console.log('Migration analysis:');
    console.log(`  Scenario: ${analysis.scenario}`);
    console.log(`  ${analysis.message}`);
    console.log('');
  }

  // Handle existing directory with config
  if (status.status === LINK_STATUS.DIRECTORY) {
    if (analysis.projectConfig.found) {
      console.log('Existing MCP configuration found at project level.');
      console.log(`  ${analysis.projectConfig.serverCount} servers configured\n`);

      if (options.migrate) {
        console.log('Migrating to global config...');
        const migrationResult = executeMigration(projectRoot, MIGRATION_OPTION.MIGRATE);

        if (migrationResult.success) {
          console.log(`  ✓ Migrated ${migrationResult.results.serversMigrated} servers`);
          if (migrationResult.results.backupPath) {
            console.log(`  ✓ Backup created at ${migrationResult.results.backupPath}`);
          }
          console.log('  ✓ Created link');
        } else {
          console.error(`✗ Migration failed: ${migrationResult.errors.join(', ')}`);
          process.exit(1);
        }
      } else if (options.merge) {
        console.log('Merging with global config...');
        const migrationResult = executeMigration(projectRoot, MIGRATION_OPTION.MERGE);

        if (migrationResult.success) {
          console.log(`  ✓ Added ${migrationResult.results.serversMigrated} new servers`);
          if (migrationResult.results.mergeStats) {
            const stats = migrationResult.results.mergeStats;
            if (stats.skipped > 0) {
              console.log(`  ⚠ Skipped ${stats.skipped} duplicate servers`);
            }
          }
          if (migrationResult.results.backupPath) {
            console.log(`  ✓ Backup created at ${migrationResult.results.backupPath}`);
          }
          console.log('  ✓ Created link');
        } else {
          console.error(`✗ Merge failed: ${migrationResult.errors.join(', ')}`);
          process.exit(1);
        }
      } else if (!options.force) {
        console.log('Options:');
        console.log('  1. --migrate  Move project config to global');
        console.log('  2. --merge    Merge both configs');
        console.log('  3. --force    Overwrite project config (creates backup)');
        console.log('');
        console.log('Run again with one of these options.');
        process.exit(0);
      }
    }
  }

  // Create the link if not done by migration
  if (status.status !== LINK_STATUS.LINKED) {
    const linkResult = createLink(projectRoot, { force: options.force });

    if (linkResult.success) {
      if (linkResult.alreadyLinked) {
        console.log('✓ Already linked');
      } else {
        console.log(`✓ Created ${getLinkType()}: ${linkResult.linkPath}`);
        console.log(`  → ${linkResult.globalPath}`);
      }
    } else {
      console.error(`✗ ${linkResult.error}`);
      if (linkResult.hint) {
        console.log(`  Hint: ${linkResult.hint}`);
      }
      if (linkResult.backup) {
        console.log(`  Backup: ${linkResult.backup}`);
      }
      process.exit(1);
    }
  }

  console.log('\n✅ Project linked to global MCP!');
  console.log('\nMCP servers are now shared across all linked projects.');
  console.log('Run "aiox mcp status" to see configuration details.');
}

module.exports = {
  createLinkCommand,
  executeLink,
};
