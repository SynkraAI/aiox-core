/**
 * AIOX CLI Entry Point
 *
 * Main entry point for the AIOX CLI with Commander.js integration.
 * Registers all subcommands including workers, agents, etc.
 *
 * @module cli
 * @version 1.0.0
 * @story 2.7 - Discovery CLI Search
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');

// Import command modules
const { createWorkersCommand } = require('./commands/workers');
const { createManifestCommand } = require('./commands/manifest');
const { createQaCommand } = require('./commands/qa');
const { createMcpCommand } = require('./commands/mcp');
const { createMigrateCommand } = require('./commands/migrate');
const { createGenerateCommand } = require('./commands/generate');
const { createMetricsCommand } = require('./commands/metrics');
const { createConfigCommand } = require('./commands/config');
const { createProCommand } = require('./commands/pro');

// Read package.json for version
const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
let packageVersion = '0.0.0';
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageVersion = packageJson.version;
} catch (error) {
  // Fallback version if package.json not found
}

/**
 * Create the main CLI program
 * @returns {Command} Commander program instance
 */
function createProgram() {
  const program = new Command();

  program
    .name('aiox')
    .version(packageVersion)
    .description('AIOX-FullStack: AI-Orchestrated System for Full Stack Development')
    .addHelpText('after', `
Commands:
  workers           Manage and discover workers
  manifest          Manage manifest files (validate, regenerate)
  qa                Quality Gate Manager (run, status)
  metrics           Quality Gate Metrics (record, show, seed, cleanup)
  config            Manage layered configuration (show, diff, migrate, validate)
  pro               AIOX Pro license management (activate, status, deactivate, features)
  mcp               Manage global MCP configuration
  migrate           Migrate from v2.0 to v4.0.4 structure
  generate          Generate documents from templates (prd, adr, pmdr, etc.)
  install           Install AIOX in current project
  init <name>       Create new AIOX project
  info              Show system information
  doctor            Run system diagnostics

For command help:
  $ aiox <command> --help

Examples:
  $ aiox workers search "json transformation"
  $ aiox workers list --category=data
  $ aiox manifest validate
  $ aiox manifest regenerate
  $ aiox qa run
  $ aiox qa status
  $ aiox mcp setup --with-defaults
  $ aiox mcp link
  $ aiox mcp status
  $ aiox metrics show
  $ aiox metrics record --layer 1 --passed
  $ aiox metrics seed --days 30
  $ aiox migrate --dry-run
  $ aiox migrate --from=2.0 --to=2.1
  $ aiox generate pmdr --title "Feature X Decision"
  $ aiox generate adr --save
  $ aiox generate list
  $ aiox config show
  $ aiox config show --debug
  $ aiox config diff --levels L1,L2
  $ aiox config migrate --dry-run
  $ aiox config validate
  $ aiox config init-local
  $ aiox pro activate --key PRO-XXXX-XXXX-XXXX-XXXX
  $ aiox pro status
  $ aiox pro deactivate
  $ aiox pro features
  $ aiox pro validate
  $ aiox install
  $ aiox doctor
`);

  // Add workers command
  program.addCommand(createWorkersCommand());

  // Add manifest command (Story 2.13)
  program.addCommand(createManifestCommand());

  // Add qa command (Story 2.10)
  program.addCommand(createQaCommand());

  // Add mcp command (Story 2.11)
  program.addCommand(createMcpCommand());

  // Add migrate command (Story 2.14)
  program.addCommand(createMigrateCommand());

  // Add generate command (Story 3.9)
  program.addCommand(createGenerateCommand());

  // Add metrics command (Story 3.11a)
  program.addCommand(createMetricsCommand());

  // Add config command (Story PRO-4)
  program.addCommand(createConfigCommand());

  // Add pro command (Story PRO-6)
  program.addCommand(createProCommand());

  return program;
}

/**
 * Run the CLI
 * @param {string[]} args - Command line arguments
 * @returns {Promise<void>}
 */
async function run(args = process.argv) {
  const program = createProgram();

  try {
    await program.parseAsync(args);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  createProgram,
  run,
};
