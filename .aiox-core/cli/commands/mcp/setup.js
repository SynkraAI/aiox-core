/**
 * MCP Setup Command
 *
 * Creates the global ~/.aiox/mcp/ directory structure.
 *
 * @module cli/commands/mcp/setup
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const { Command } = require('commander');
const {
  createGlobalStructure,
  createGlobalConfig,
  globalConfigExists,
  getAvailableTemplates,
  getServerTemplate,
} = require('../../../core/mcp/global-config-manager');
const {
  getGlobalAioxDir,
  getGlobalMcpDir,
  getGlobalConfigPath,
} = require('../../../core/mcp/os-detector');

/**
 * Create the setup command
 * @returns {Command} Commander command instance
 */
function createSetupCommand() {
  const setup = new Command('setup');

  setup
    .description('Create global MCP configuration structure at ~/.aiox/')
    .option('--with-defaults', 'Include default server templates (context7, exa, github)')
    .option('--servers <servers>', 'Comma-separated list of servers to add (e.g., context7,exa,github)')
    .option('-f, --force', 'Force recreation even if exists')
    .option('-v, --verbose', 'Show detailed output')
    .action(async (options) => {
      await executeSetup(options);
    });

  return setup;
}

/**
 * Execute the setup command
 * @param {Object} options - Command options
 */
async function executeSetup(options) {
  console.log('Creating global MCP configuration...\n');

  // Check if already exists
  if (globalConfigExists() && !options.force) {
    console.log(`✓ Global config already exists at ${getGlobalConfigPath()}`);
    console.log('  Use --force to recreate\n');
    return;
  }

  // Step 1: Create directory structure
  console.log('Step 1: Creating directory structure...');
  const structureResult = createGlobalStructure();

  if (structureResult.created.length > 0) {
    for (const dir of structureResult.created) {
      console.log(`  ✓ Created ${dir}`);
    }
  }

  if (structureResult.errors.length > 0) {
    for (const err of structureResult.errors) {
      console.error(`  ✗ Error: ${err.error}`);
    }
    process.exit(1);
  }

  // Step 2: Determine initial servers
  const initialServers = {};

  if (options.withDefaults) {
    // Add default servers
    const defaultServers = ['context7', 'exa', 'github'];
    for (const server of defaultServers) {
      const template = getServerTemplate(server);
      if (template) {
        initialServers[server] = template;
      }
    }
    console.log('\nStep 2: Adding default servers...');
    console.log(`  ✓ Added ${Object.keys(initialServers).length} default servers`);
  } else if (options.servers) {
    // Add specified servers
    const serverNames = options.servers.split(',').map(s => s.trim());
    console.log('\nStep 2: Adding specified servers...');

    for (const server of serverNames) {
      const template = getServerTemplate(server);
      if (template) {
        initialServers[server] = template;
        console.log(`  ✓ Added ${server}`);
      } else {
        console.log(`  ⚠ No template for "${server}" - skipped`);
      }
    }
  } else {
    console.log('\nStep 2: Creating empty config (no servers)');
    console.log('  Tip: Use --with-defaults or --servers to add servers');
  }

  // Step 3: Create config file
  console.log('\nStep 3: Creating global config file...');
  const configResult = createGlobalConfig(initialServers);

  if (configResult.success) {
    console.log(`  ✓ Created ${configResult.configPath}`);
  } else if (configResult.error === 'Config already exists' && options.force) {
    // Overwrite for force mode
    const fs = require('fs');
    const config = {
      version: '1.0',
      servers: initialServers,
      defaults: {
        timeout: 30000,
        retries: 3,
      },
    };
    fs.writeFileSync(configResult.configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`  ✓ Overwrote ${configResult.configPath}`);
  } else {
    console.error(`  ✗ ${configResult.error}`);
    process.exit(1);
  }

  // Summary
  console.log('\n✅ Global MCP setup complete!\n');
  console.log('Structure created:');
  console.log(`  ${getGlobalAioxDir()}/`);
  console.log('  ├── mcp/');
  console.log('  │   ├── global-config.json');
  console.log('  │   ├── servers/');
  console.log('  │   └── cache/');
  console.log('  ├── config.yaml');
  console.log('  └── credentials/');

  if (Object.keys(initialServers).length > 0) {
    console.log(`\nServers configured: ${Object.keys(initialServers).join(', ')}`);
  }

  console.log('\nNext steps:');
  console.log('  1. Run "aiox mcp link" in your project to use global config');
  console.log('  2. Run "aiox mcp add <server>" to add more servers');
  console.log('  3. Run "aiox mcp status" to check configuration');

  if (options.verbose) {
    console.log('\nAvailable server templates:');
    for (const name of getAvailableTemplates()) {
      console.log(`  - ${name}`);
    }
  }
}

module.exports = {
  createSetupCommand,
  executeSetup,
};
