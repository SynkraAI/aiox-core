/**
 * CLI Command: aiox corp schedule
 *
 * Manage corporation schedules: list, add, remove, pause, resume, trigger.
 *
 * @module cli/commands/corp/schedule
 * @version 1.0.0
 * @story CORP-7 - 24/7 Scheduler
 */

'use strict';

const path = require('path');

/**
 * Execute the schedule command.
 *
 * @param {string[]} args - CLI arguments
 */
function execute(args = []) {
  const subcommand = args[0];
  const subArgs = args.slice(1);

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    showHelp();
    return;
  }

  switch (subcommand) {
  case 'list':
    listSchedules(subArgs);
    break;
  case 'add':
    addSchedule(subArgs);
    break;
  case 'remove':
    removeSchedule(subArgs);
    break;
  case 'pause':
    pauseSchedule(subArgs);
    break;
  case 'resume':
    resumeSchedule(subArgs);
    break;
  case 'trigger':
    triggerEvent(subArgs);
    break;
  default:
    console.error(`Unknown schedule subcommand: ${subcommand}`);
    console.error('Run "aiox corp schedule --help" for available subcommands.');
    process.exit(1);
  }
}

// =====================================================
// Subcommands
// =====================================================

function listSchedules(_args) {
  const scheduler = _createScheduler();
  if (!scheduler) return;

  const schedules = scheduler.listSchedules();

  if (schedules.length === 0) {
    console.log('\n  No schedules configured.\n');
    return;
  }

  console.log('');
  console.log('\x1b[1m  Corporation Schedules\x1b[0m');
  console.log('  ' + '-'.repeat(80));

  for (const s of schedules) {
    const statusIcon = s.enabled ? '\x1b[32m*\x1b[0m' : '\x1b[33m||\x1b[0m';
    const statusText = s.enabled ? '\x1b[32mactive\x1b[0m' : '\x1b[33mpaused\x1b[0m';

    console.log(`  ${statusIcon} \x1b[1m${s.name}\x1b[0m  [${s.type}]  ${statusText}  Level: ${s.level}`);

    if (s.cron) {
      console.log(`    Cron: ${s.cron}`);
    }
    if (s.event) {
      console.log(`    Event: ${s.event}`);
    }
    if (s.at) {
      console.log(`    At: ${s.at}`);
    }
    if (s.next_run && s.next_run !== 'on-event') {
      const nextDate = new Date(s.next_run);
      console.log(`    Next run: ${nextDate.toLocaleString()}`);
    }
    if (s.last_run) {
      const lastDate = new Date(s.last_run);
      console.log(`    Last run: ${lastDate.toLocaleString()}`);
    }
  }

  console.log('');
  _cleanupScheduler(scheduler);
}

function addSchedule(args) {
  const name = args[0];
  if (!name) {
    console.error('Error: Schedule name is required.');
    console.error('Usage: aiox corp schedule add <name> --cron "<expr>" --task <task> --level <level>');
    process.exit(1);
  }

  // Parse flags
  const cron = _getFlag(args, '--cron');
  const task = _getFlag(args, '--task');
  const level = _getFlag(args, '--level') || 'L2';
  const dept = _getFlag(args, '--dept');
  const event = _getFlag(args, '--event');
  const at = _getFlag(args, '--at');

  let type = 'cron';
  if (event) type = 'event';
  if (at) type = 'once';

  if (type === 'cron' && !cron) {
    console.error('Error: --cron "<expression>" is required for cron schedules.');
    process.exit(1);
  }

  const scheduler = _createScheduler();
  if (!scheduler) return;

  const result = scheduler.addSchedule({
    name,
    type,
    cron: cron || null,
    at: at || null,
    event: event || null,
    task: {
      type: task || 'unknown',
      description: `Scheduled task: ${name}`,
      department: dept || null,
      priority: 'medium',
    },
    level,
    department: dept || null,
    enabled: true,
  });

  if (result.success) {
    console.log(`\n  \x1b[32mOK\x1b[0m ${result.message}\n`);
  } else {
    console.error(`\n  \x1b[31mError\x1b[0m ${result.message}\n`);
    process.exit(1);
  }

  _cleanupScheduler(scheduler);
}

function removeSchedule(args) {
  const name = args[0];
  if (!name) {
    console.error('Error: Schedule name is required.');
    process.exit(1);
  }

  const scheduler = _createScheduler();
  if (!scheduler) return;

  const result = scheduler.removeSchedule(name);

  if (result.success) {
    console.log(`\n  \x1b[32mOK\x1b[0m ${result.message}\n`);
  } else {
    console.error(`\n  \x1b[31mError\x1b[0m ${result.message}\n`);
    process.exit(1);
  }

  _cleanupScheduler(scheduler);
}

function pauseSchedule(args) {
  const name = args[0];
  if (!name) {
    console.error('Error: Schedule name is required.');
    process.exit(1);
  }

  const scheduler = _createScheduler();
  if (!scheduler) return;

  const result = scheduler.pauseSchedule(name);

  if (result.success) {
    console.log(`\n  \x1b[32mOK\x1b[0m ${result.message}\n`);
  } else {
    console.error(`\n  \x1b[31mError\x1b[0m ${result.message}\n`);
    process.exit(1);
  }

  _cleanupScheduler(scheduler);
}

function triggerEvent(args) {
  const eventName = args[0];
  if (!eventName) {
    console.error('Error: Event name is required.');
    console.error('Usage: aiox corp schedule trigger <event-name>');
    process.exit(1);
  }

  const scheduler = _createScheduler();
  if (!scheduler) return;

  const results = scheduler.triggerEvent(eventName, {
    source: 'cli',
    triggered_at: new Date().toISOString(),
  });

  if (results.length === 0) {
    console.log(`\n  No schedules matched event "${eventName}".\n`);
  } else {
    console.log('');
    console.log(`\x1b[1m  Event "${eventName}" triggered ${results.length} schedule(s)\x1b[0m`);
    for (const r of results) {
      if (r.assigned_to) {
        console.log(`  \x1b[32mOK\x1b[0m ${r.schedule} -> assigned to ${r.assigned_to}`);
      } else if (r.queued) {
        console.log(`  \x1b[33mQueued\x1b[0m ${r.schedule}: ${r.reason}`);
      }
    }
    console.log('');
  }

  _cleanupScheduler(scheduler);
}

// =====================================================
// Helpers
// =====================================================

function _createScheduler() {
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
    const { CorporationScheduler } = require(path.join(
      projectRoot, '.aios-core', 'core', 'corporation', 'scheduler',
    ));

    const orgEngine = new OrgEngine(projectRoot);
    orgEngine.load();

    if (!orgEngine.isLoaded()) {
      console.error('Error: Corporation org-config not loaded. Run "aiox corp org" to check.');
      process.exit(1);
    }

    const logger = new ActivityLogger({ autoStart: false });
    const permEngine = new PermissionEngine(orgEngine, { activityLogger: logger });
    const router = new TaskRouter(orgEngine, permEngine, logger, { projectRoot });

    return new CorporationScheduler(orgEngine, router, logger, { projectRoot });
  } catch (error) {
    console.error(`Error initializing scheduler: ${error.message}`);
    process.exit(1);
  }
}

function _cleanupScheduler(scheduler) {
  if (scheduler && scheduler.logger) {
    try { scheduler.logger.close(); } catch { /* ignore */ }
  }
}

function _getFlag(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

function showHelp() {
  console.log(`
\x1b[1maiox corp schedule\x1b[0m -- Manage corporation schedules

\x1b[1mSUBCOMMANDS:\x1b[0m
  list                    List all schedules with status
  add <name> [flags]      Add a new schedule
  remove <name>           Remove a schedule
  pause <name>            Pause a schedule
  resume <name>           Resume a paused schedule
  trigger <event>         Trigger an event manually

\x1b[1mADD FLAGS:\x1b[0m
  --cron "<expr>"         Cron expression (for cron type)
  --task <task-type>      Task type to execute
  --level <L1-L5>         Autonomy level (default: L2)
  --dept <department>     Target department
  --event <event-name>    Event name (for event type)
  --at "<datetime>"       ISO datetime (for once type)

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp schedule list
  aiox corp schedule add nightly-backup --cron "0 2 * * *" --task backup --level L2
  aiox corp schedule add deploy-alert --event deploy_complete --task notify --level L1
  aiox corp schedule remove nightly-backup
  aiox corp schedule pause weekly-security-scan
  aiox corp schedule resume weekly-security-scan
  aiox corp schedule trigger new_pr
`);
}

module.exports = { execute };
