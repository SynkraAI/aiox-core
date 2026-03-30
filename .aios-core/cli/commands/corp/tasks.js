/**
 * CLI Command: aiox corp tasks
 *
 * Lists active and queued tasks.
 *
 * @module cli/commands/corp/tasks
 * @version 1.0.0
 * @story CORP-5 - TaskRouter
 */

'use strict';

const path = require('path');

/**
 * Execute the tasks command.
 *
 * @param {string[]} args - CLI arguments
 */
function execute(args = []) {
  if (args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  // Parse flags
  let deptFilter = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dept' && args[i + 1]) {
      deptFilter = args[i + 1];
      i++;
    }
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
      console.error('Error: Corporation org-config not loaded.');
      process.exit(1);
    }

    const logger = new ActivityLogger({ autoStart: false });
    const permEngine = new PermissionEngine(orgEngine, { activityLogger: logger });
    const router = new TaskRouter(orgEngine, permEngine, logger, { projectRoot });

    const filters = deptFilter ? { department: deptFilter } : {};
    const activeTasks = router.getActiveTasks(filters);
    const queuedTasks = router.getQueuedTasks(filters);
    const stats = router.getRouterStats();

    console.log('');
    console.log('\x1b[1m  Corporation Tasks\x1b[0m');
    if (deptFilter) {
      console.log(`  \x1b[90mFiltered by department:\x1b[0m ${deptFilter}`);
    }
    console.log('  ' + '-'.repeat(50));

    // Active tasks
    console.log(`\n  \x1b[1mActive Tasks\x1b[0m (${activeTasks.length})`);
    if (activeTasks.length === 0) {
      console.log('    No active tasks.');
    } else {
      for (const task of activeTasks) {
        console.log(`    \x1b[32m${task.agentId}\x1b[0m (${task.agentTitle})`);
        console.log(`      Type: ${task.type || 'unknown'} | Dept: ${task.department || 'unknown'} | Priority: ${task.priority}`);
        if (task.assigned_at) {
          console.log(`      Assigned: ${task.assigned_at}`);
        }
      }
    }

    // Queued tasks
    console.log(`\n  \x1b[1mQueued Tasks\x1b[0m (${queuedTasks.length})`);
    if (queuedTasks.length === 0) {
      console.log('    No queued tasks.');
    } else {
      for (let i = 0; i < queuedTasks.length; i++) {
        const task = queuedTasks[i];
        const dept = task.classification ? task.classification.department : 'unknown';
        console.log(`    #${i + 1} \x1b[33m${task.type || task.description || 'unknown'}\x1b[0m`);
        console.log(`       Dept: ${dept} | Priority: ${task.priority || 'medium'} | Queued: ${task.queued_at || 'unknown'}`);
      }
    }

    // Stats summary
    console.log(`\n  \x1b[1mStats\x1b[0m`);
    console.log(`    Routed: ${stats.totalRouted} | Completed: ${stats.totalCompleted} | Queue: ${stats.queueLength}`);
    console.log('');

    logger.close();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
\x1b[1maiox corp tasks\x1b[0m -- List active and queued tasks

\x1b[1mUSAGE:\x1b[0m
  aiox corp tasks
  aiox corp tasks --dept engineering

\x1b[1mOPTIONS:\x1b[0m
  --dept <department>   Filter by department

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp tasks                     # All tasks
  aiox corp tasks --dept engineering  # Engineering only
  aiox corp tasks --dept product      # Product only
`);
}

module.exports = { execute };
