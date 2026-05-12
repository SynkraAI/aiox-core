#!/usr/bin/env node

/**
 * edmcp - Docker MCP Gateway Manager
 *
 * CLI for managing MCPs in the Docker Gateway
 *
 * Usage:
 *   edmcp list              # List active MCPs
 *   edmcp add <name/url>    # Add MCP from repository
 *   edmcp remove <name>     # Remove MCP
 *
 * @package @synkra/aiox-install
 */

'use strict';

const { Command } = require('commander');
const { listMcps, addMcp, removeMcp } = require('../src/edmcp');
const pkg = require('../package.json');

const program = new Command();

program
  .name('edmcp')
  .description('Docker MCP Gateway Manager - Manage MCPs in the Docker Gateway')
  .version(pkg.version, '-v, --version', 'Output the current version');

program
  .command('list')
  .alias('ls')
  .description('List all active MCPs in the Docker Gateway')
  .option('--json', 'Output in JSON format')
  .action(async (options) => {
    try {
      await listMcps({ json: options.json });
    } catch (error) {
      console.error('Failed to list MCPs:', error.message);
      process.exit(1);
    }
  });

program
  .command('add <nameOrUrl>')
  .description('Add an MCP from a repository URL or name')
  .option('--config <path>', 'Path to custom configuration file')
  .option('--env <vars...>', 'Environment variables (KEY=value)')
  .action(async (nameOrUrl, options) => {
    try {
      await addMcp(nameOrUrl, {
        configPath: options.config,
        envVars: options.env || [],
      });
    } catch (error) {
      console.error('Failed to add MCP:', error.message);
      process.exit(1);
    }
  });

program
  .command('remove <name>')
  .alias('rm')
  .description('Remove an MCP from the Docker Gateway')
  .option('--force', 'Force removal without confirmation')
  .action(async (name, options) => {
    try {
      await removeMcp(name, { force: options.force });
    } catch (error) {
      console.error('Failed to remove MCP:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
