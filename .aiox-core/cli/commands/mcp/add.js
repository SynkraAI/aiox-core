/**
 * MCP Add Command
 *
 * Adds a server to the global MCP configuration.
 *
 * @module cli/commands/mcp/add
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const { Command } = require('commander');
const {
  addServer,
  removeServer,
  setServerEnabled,
  globalConfigExists,
  getAvailableTemplates,
  getServerTemplate,
  listServers,
} = require('../../../core/mcp/global-config-manager');
const { getGlobalConfigPath } = require('../../../core/mcp/os-detector');

/**
 * Create the add command
 * @returns {Command} Commander command instance
 */
function createAddCommand() {
  const add = new Command('add');

  add
    .description('Add a server to global MCP configuration')
    .argument('[server]', 'Server name to add (uses template if available)')
    .option('--type <type>', 'Server type: sse or command')
    .option('--url <url>', 'Server URL (for SSE type)')
    .option('--command <cmd>', 'Command to run (for command type)')
    .option('--args <args>', 'Comma-separated command arguments')
    .option('--env <env>', 'Environment variables (KEY=value,KEY2=value2)')
    .option('--disable', 'Add server in disabled state')
    .option('--remove', 'Remove server instead of adding')
    .option('--enable', 'Enable an existing server')
    .option('--list-templates', 'List available server templates')
    .option('-v, --verbose', 'Show detailed output')
    .action(async (server, options) => {
      await executeAdd(server, options);
    });

  return add;
}

/**
 * Execute the add command
 * @param {string} server - Server name
 * @param {Object} options - Command options
 */
async function executeAdd(server, options) {
  // Handle list templates
  if (options.listTemplates) {
    console.log('Available server templates:\n');
    const templates = getAvailableTemplates();

    for (const name of templates) {
      const template = getServerTemplate(name);
      const type = template.type || 'command';
      console.log(`  ${name}`);
      console.log(`    Type: ${type}`);
      if (template.url) {
        console.log(`    URL: ${template.url}`);
      }
      if (template.command) {
        console.log(`    Command: ${template.command} ${(template.args || []).join(' ')}`);
      }
      console.log('');
    }

    console.log('Usage: aiox mcp add <server-name>');
    console.log('Example: aiox mcp add context7');
    return;
  }

  // Check global config exists
  if (!globalConfigExists()) {
    console.error('❌ Global MCP config not found.');
    console.log('Run "aiox mcp setup" first to create global configuration.');
    process.exit(1);
  }

  // Server name required for most operations
  if (!server) {
    console.error('❌ Server name required.');
    console.log('Usage: aiox mcp add <server-name>');
    console.log('');
    console.log('Available templates:');
    for (const name of getAvailableTemplates()) {
      console.log(`  - ${name}`);
    }
    console.log('');
    console.log('Or provide custom config:');
    console.log('  aiox mcp add myserver --type sse --url https://example.com/mcp');
    console.log('  aiox mcp add myserver --command npx --args "-y,@scope/mcp-server"');
    process.exit(1);
  }

  // Handle remove
  if (options.remove) {
    console.log(`Removing server "${server}"...\n`);

    const result = removeServer(server);
    if (result.success) {
      console.log(`✅ Server "${server}" removed from global config`);
    } else {
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }
    return;
  }

  // Handle enable/disable existing server
  // --enable enables an existing server, --disable (without other add options) disables it
  const isToggleOperation = options.enable || (options.disable && !options.type && !options.url && !options.command);
  if (isToggleOperation) {
    const enabled = Boolean(options.enable);
    console.log(`${enabled ? 'Enabling' : 'Disabling'} server "${server}"...\n`);

    const result = setServerEnabled(server, enabled);
    if (result.success) {
      console.log(`✅ Server "${server}" ${enabled ? 'enabled' : 'disabled'}`);
    } else {
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }
    return;
  }

  // Build server config
  let serverConfig = null;

  // Check if custom config provided
  if (options.type || options.url || options.command) {
    serverConfig = {
      enabled: !options.disable,
    };

    if (options.type === 'sse' || options.url) {
      if (!options.url) {
        console.error('❌ SSE type requires --url');
        process.exit(1);
      }
      serverConfig.type = 'sse';
      serverConfig.url = options.url;
    } else {
      if (!options.command) {
        console.error('❌ Command type requires --command');
        process.exit(1);
      }
      serverConfig.command = options.command;

      if (options.args) {
        serverConfig.args = options.args.split(',').map(a => a.trim());
      }

      if (options.env) {
        serverConfig.env = {};
        const envPairs = options.env.split(',');
        for (const pair of envPairs) {
          const [key, ...valueParts] = pair.split('=');
          if (key) {
            serverConfig.env[key.trim()] = valueParts.join('=').trim();
          }
        }
      }
    }
  }

  // Add server
  console.log(`Adding "${server}" to global config...\n`);

  const result = addServer(server, serverConfig);

  if (result.success) {
    console.log(`✅ Added to ${getGlobalConfigPath()}`);

    // Show server details
    if (options.verbose) {
      const servers = listServers();
      const added = servers.servers.find(s => s.name === server);
      if (added) {
        console.log('\nServer details:');
        console.log(`  Name: ${added.name}`);
        console.log(`  Type: ${added.type}`);
        console.log(`  Enabled: ${added.enabled}`);
        if (added.url) console.log(`  URL: ${added.url}`);
        if (added.command) console.log(`  Command: ${added.command}`);
      }
    }

    console.log(`\n✅ Server "${server}" added!`);

    // Check if template was used
    const template = getServerTemplate(server);
    if (template && !serverConfig) {
      console.log('\nNote: Used built-in template.');
      if (template.env) {
        const envVars = Object.keys(template.env).filter(k => template.env[k].startsWith('${'));
        if (envVars.length > 0) {
          console.log('Required environment variables:');
          for (const varName of envVars) {
            const envKey = template.env[varName].replace(/\$\{|\}/g, '');
            console.log(`  - ${envKey}`);
          }
        }
      }
    }
  } else {
    console.error(`❌ ${result.error}`);

    // Suggest alternatives
    if (result.error.includes('No template available')) {
      console.log('\nAvailable templates:');
      for (const name of getAvailableTemplates()) {
        console.log(`  - ${name}`);
      }
      console.log('\nOr provide custom config:');
      console.log(`  aiox mcp add ${server} --type sse --url <url>`);
      console.log(`  aiox mcp add ${server} --command npx --args "-y,@scope/server"`);
    }

    process.exit(1);
  }
}

module.exports = {
  createAddCommand,
  executeAdd,
};
