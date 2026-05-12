/**
 * QA Command Module
 *
 * Entry point for all quality gate CLI commands.
 * Includes run and status subcommands.
 *
 * @module cli/commands/qa
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const { Command } = require('commander');
const { createRunCommand } = require('./run');
const { createStatusCommand } = require('./status');

/**
 * Create the qa command with all subcommands
 * @returns {Command} Commander command instance
 */
function createQaCommand() {
  const qa = new Command('qa');

  qa
    .description('Quality Gate Manager - orchestrate 3-layer quality pipeline')
    .addHelpText('after', `
Commands:
  run               Execute quality gate pipeline
  status            Show current gate status

Examples:
  $ aiox qa run                    Run full pipeline
  $ aiox qa run --layer=1          Run only Layer 1 (pre-commit)
  $ aiox qa run --layer=2          Run only Layer 2 (PR automation)
  $ aiox qa run --verbose          Run with detailed output
  $ aiox qa status                 Show current gate status

Layers:
  Layer 1: Pre-commit (lint, test, typecheck) - Fast local checks
  Layer 2: PR Automation (CodeRabbit, Quinn) - Automated review
  Layer 3: Human Review (checklist, sign-off) - Strategic review

Exit Codes:
  0 = All gates passed (or pending human review)
  1 = Gates failed (fix required)
`);

  // Add subcommands
  qa.addCommand(createRunCommand());
  qa.addCommand(createStatusCommand());

  return qa;
}

module.exports = {
  createQaCommand,
};
