/**
 * CLI Command: aiox corp route "<task description>"
 *
 * Simulates task routing to show which agent would be assigned.
 *
 * @module cli/commands/corp/route
 * @version 1.0.0
 * @story CORP-5 - TaskRouter
 */

'use strict';

const path = require('path');

/**
 * Execute the route command.
 *
 * @param {string[]} args - CLI arguments
 */
function execute(args = []) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  const isDryRun = args.includes('--dry-run');
  const taskArgs = args.filter(a => a !== '--dry-run');
  const description = taskArgs.join(' ');

  if (!description.trim()) {
    console.error('Error: Task description is required.');
    console.error('Usage: aiox corp route "<task description>"');
    process.exit(1);
  }

  try {
    const projectRoot = process.cwd();
    const { OrgEngine } = require(path.join(
      projectRoot, '.aios-core', 'core', 'corporation', 'org-engine',
    ));
    const { PermissionEngine } = require(path.join(
      projectRoot, '.aios-core', 'core', 'corporation', 'permission-engine',
    ));
    const { ActivityLogger } = require(path.join(
      projectRoot, '.aios-core', 'core', 'corporation', 'activity-logger',
    ));
    const { TaskRouter } = require(path.join(
      projectRoot, '.aios-core', 'core', 'corporation', 'task-router',
    ));

    // Initialize
    const orgEngine = new OrgEngine(projectRoot);
    orgEngine.load();

    if (!orgEngine.isLoaded()) {
      console.error('Error: Corporation org-config not loaded. Run "aiox corp org" to check.');
      process.exit(1);
    }

    const logger = new ActivityLogger({ autoStart: false });
    const permEngine = new PermissionEngine(orgEngine, { activityLogger: logger });
    const router = new TaskRouter(orgEngine, permEngine, logger, { projectRoot });

    // Parse task type from description keywords
    const task = {
      description,
      priority: 'medium',
    };

    // Route
    const result = router.route(task);

    // Display results
    console.log('');
    console.log('\x1b[1m  Task Routing Result\x1b[0m');
    console.log('  ' + '-'.repeat(50));
    console.log(`  \x1b[90mDescription:\x1b[0m ${description}`);

    if (result.department) {
      console.log(`  \x1b[90mDepartment:\x1b[0m  ${result.department}`);
    }

    if (result.assigned_to) {
      const agent = orgEngine.getAgent(result.assigned_to);
      console.log(`  \x1b[32mAssigned to:\x1b[0m ${result.assigned_to} (${agent ? agent.title : 'Unknown'})`);
      console.log(`  \x1b[90mLevel:\x1b[0m       ${result.level}`);
      console.log(`  \x1b[90mReason:\x1b[0m      ${result.reason}`);

      if (result.alternatives && result.alternatives.length > 0) {
        console.log(`  \x1b[90mAlternatives:\x1b[0m`);
        for (const alt of result.alternatives) {
          const altAgent = orgEngine.getAgent(alt.id);
          console.log(`    - ${alt.id} (${altAgent ? altAgent.title : 'Unknown'}) [score: ${alt.score}]`);
        }
      }

      if (isDryRun) {
        // Undo the assignment in dry-run mode
        router.complete(result.assigned_to);
        console.log(`\n  \x1b[33m[DRY-RUN]\x1b[0m Task was not actually assigned.`);
      }
    } else if (result.queued) {
      console.log(`  \x1b[33mQueued:\x1b[0m      Position #${result.position}`);
      console.log(`  \x1b[90mReason:\x1b[0m      ${result.reason}`);
    } else {
      console.log(`  \x1b[31mFailed:\x1b[0m      ${result.reason}`);
    }

    console.log('');

    // Cleanup logger
    logger.close();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
\x1b[1maiox corp route\x1b[0m -- Route a task to the best available agent

\x1b[1mUSAGE:\x1b[0m
  aiox corp route "<task description>"
  aiox corp route "<task description>" --dry-run

\x1b[1mOPTIONS:\x1b[0m
  --dry-run    Simulate routing without actually assigning

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp route "implement user authentication"
  aiox corp route "review the security audit" --dry-run
  aiox corp route "create a new PRD for feature X"
  aiox corp route "deploy to production"
`);
}

module.exports = { execute };
