/**
 * MCP Command Module
 *
 * Entry point for all MCP-related CLI commands.
 * Provides global MCP configuration management.
 *
 * @module cli/commands/mcp
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const { Command } = require('commander');
const { createSetupCommand } = require('./setup');
const { createLinkCommand } = require('./link');
const { createStatusCommand } = require('./status');
const { createAddCommand } = require('./add');

/**
 * Create the mcp command with all subcommands
 * @returns {Command} Commander command instance
 */
function createMcpCommand() {
  const mcp = new Command('mcp');

  mcp
    .description('Manage global MCP (Model Context Protocol) configuration')
    .addHelpText('after', `
Commands:
  setup             Create global ~/.aiox/mcp/ structure
  link              Link project to global MCP config
  status            Show global/project MCP config status
  add <server>      Add server to global config

Global Configuration:
  MCP servers are configured once at ~/.aiox/mcp/ and shared across
  all projects via symlinks (Unix) or junctions (Windows).

Benefits:
  - Configure MCP servers once, use everywhere
  - No duplicate configurations across projects
  - Easy maintenance and updates
  - Consistent MCP setup across workspaces

Quick Start:
  $ aiox mcp setup --with-defaults    # Create global config
  $ aiox mcp link                      # Link this project
  $ aiox mcp status                    # Check configuration

Examples:
  $ aiox mcp setup
  $ aiox mcp setup --with-defaults
  $ aiox mcp setup --servers context7,exa,github
  $ aiox mcp link
  $ aiox mcp link --migrate
  $ aiox mcp link --merge
  $ aiox mcp link --unlink
  $ aiox mcp status
  $ aiox mcp status --json
  $ aiox mcp add context7
  $ aiox mcp add myserver --type sse --url https://example.com/mcp
  $ aiox mcp add myserver --remove
  $ aiox mcp add --list-templates
`);

  // Add subcommands
  mcp.addCommand(createSetupCommand());
  mcp.addCommand(createLinkCommand());
  mcp.addCommand(createStatusCommand());
  mcp.addCommand(createAddCommand());

  return mcp;
}

module.exports = {
  createMcpCommand,
};
