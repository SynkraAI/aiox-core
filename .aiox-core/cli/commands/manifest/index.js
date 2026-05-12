/**
 * Manifest Command Module
 *
 * Entry point for all manifest-related CLI commands.
 * Includes validate and regenerate subcommands.
 *
 * @module cli/commands/manifest
 * @version 1.0.0
 * @story 2.13 - Manifest System
 */

const { Command } = require('commander');
const { createValidateCommand } = require('./validate');
const { createRegenerateCommand } = require('./regenerate');

/**
 * Create the manifest command with all subcommands
 * @returns {Command} Commander command instance
 */
function createManifestCommand() {
  const manifest = new Command('manifest');

  manifest
    .description('Manage AIOX manifest files for agents, workers, and tasks')
    .addHelpText('after', `
Commands:
  validate          Validate all manifest files
  regenerate        Regenerate manifests from source files

Examples:
  $ aiox manifest validate
  $ aiox manifest validate --verbose
  $ aiox manifest regenerate
  $ aiox manifest regenerate --force
`);

  // Add subcommands
  manifest.addCommand(createValidateCommand());
  manifest.addCommand(createRegenerateCommand());

  return manifest;
}

module.exports = {
  createManifestCommand,
};
