/**
 * CLI Command: aiox corp scheduler
 *
 * Scheduler operations: tick, start, health.
 *
 * @module cli/commands/corp/scheduler
 * @version 1.0.0
 * @story CORP-7 - 24/7 Scheduler
 */

'use strict';

const path = require('path');

/**
 * Execute the scheduler command.
 *
 * @param {string[]} args - CLI arguments
 */
function execute(args = []) {
  const subcommand = args[0];

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    showHelp();
    return;
  }

  switch (subcommand) {
  case 'tick':
    runTick();
    break;
  case 'start':
    runStart();
    break;
  case 'stop':
    runStop();
    break;
  case 'health':
    runHealth();
    break;
  case 'stats':
    runStats();
    break;
  case 'next':
    runNext(args.slice(1));
    break;
  default:
    console.error(`Unknown scheduler subcommand: ${subcommand}`);
    console.error('Run "aiox corp scheduler --help" for available subcommands.');
    process.exit(1);
  }
}

// =====================================================
// Subcommands
// =====================================================

function runTick() {
  const scheduler = _createScheduler();
  if (!scheduler) return;

  const result = scheduler.tick();

  console.log('');
  console.log('\x1b[1m  Scheduler Tick\x1b[0m');
  console.log('  ' + '-'.repeat(50));

  if (result.executed.length > 0) {
    console.log(`  \x1b[32mExecuted:\x1b[0m ${result.executed.length}`);
    for (const e of result.executed) {
      console.log(`    - ${e.name} -> ${e.assigned_to || 'queued'}`);
    }
  }

  if (result.queued.length > 0) {
    console.log(`  \x1b[33mQueued for approval:\x1b[0m ${result.queued.length}`);
    for (const q of result.queued) {
      console.log(`    - ${q.name}: ${q.reason}`);
    }
  }

  if (result.executed.length === 0 && result.queued.length === 0) {
    console.log('  No schedules due at this time.');
  }

  if (result.skipped.length > 0) {
    const pausedCount = result.skipped.filter(s => s.reason === 'paused').length;
    const dedupCount = result.skipped.filter(s => s.reason === 'already ran this period').length;
    if (pausedCount > 0) console.log(`  \x1b[90mPaused: ${pausedCount}\x1b[0m`);
    if (dedupCount > 0) console.log(`  \x1b[90mDeduplicated: ${dedupCount}\x1b[0m`);
  }

  console.log('');
  _cleanupScheduler(scheduler);
}

function runStart() {
  const fs = require('fs');
  const scheduler = _createScheduler();
  if (!scheduler) return;

  const projectRoot = process.cwd();
  const stopFile = path.join(projectRoot, '.aios', 'corporation', 'scheduler-stop');

  // Clear any existing stop signal
  try {
    if (fs.existsSync(stopFile)) {
      fs.unlinkSync(stopFile);
    }
  } catch { /* ignore */ }

  console.log('');
  console.log('\x1b[1m  Starting Corporation Scheduler\x1b[0m');
  console.log(`  Poll interval: ${scheduler.pollIntervalMs / 1000}s`);
  console.log(`  Schedules loaded: ${scheduler.schedules.length}`);
  console.log('  Press Ctrl+C to stop (or run "aios scheduler stop" from another terminal).');
  console.log('');

  // Handle graceful shutdown
  const shutdown = () => {
    console.log('\n  Stopping scheduler...');
    scheduler.stop();
    _cleanupScheduler(scheduler);
    // Clean up stop file if present
    try { if (fs.existsSync(stopFile)) fs.unlinkSync(stopFile); } catch { /* ignore */ }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Override start to keep process alive and check for stop flag
  scheduler.running = true;
  scheduler.tick();

  const pollTimer = setInterval(() => {
    // Check for stop signal
    if (fs.existsSync(stopFile)) {
      console.log('  Stop signal detected. Shutting down...');
      shutdown();
      return;
    }
    scheduler.tick();
  }, scheduler.pollIntervalMs);

  // Keep the process alive (don't unref)
  pollTimer.ref();
}

function runStop() {
  const fs = require('fs');
  const projectRoot = process.cwd();
  const stopDir = path.join(projectRoot, '.aios', 'corporation');
  const stopFile = path.join(stopDir, 'scheduler-stop');

  try {
    if (!fs.existsSync(stopDir)) {
      fs.mkdirSync(stopDir, { recursive: true });
    }

    const stopData = JSON.stringify({
      requestedAt: new Date().toISOString(),
      pid: process.pid,
      reason: 'CLI stop command',
    }, null, 2);

    fs.writeFileSync(stopFile, stopData, 'utf8');
    console.log('\n  \x1b[32mStop signal sent.\x1b[0m');
    console.log(`  Written to: ${stopFile}`);
    console.log('  The scheduler will stop on its next tick cycle.\n');
  } catch (error) {
    console.error(`\n  \x1b[31mFailed to send stop signal:\x1b[0m ${error.message}\n`);
    process.exit(1);
  }
}

function runHealth() {
  const scheduler = _createScheduler();
  if (!scheduler) return;

  const health = scheduler.checkHealth();

  console.log('');
  console.log('\x1b[1m  Scheduler Health\x1b[0m');
  console.log('  ' + '-'.repeat(50));

  if (health.healthy) {
    console.log(`  \x1b[32mStatus:\x1b[0m  Healthy`);
  } else {
    console.log(`  \x1b[31mStatus:\x1b[0m  Unhealthy`);
  }

  console.log(`  \x1b[90mMessage:\x1b[0m ${health.message}`);

  if (health.lastHeartbeat) {
    const lastBeat = new Date(health.lastHeartbeat);
    console.log(`  \x1b[90mLast heartbeat:\x1b[0m ${lastBeat.toLocaleString()}`);
  }

  if (health.elapsedMs != null) {
    console.log(`  \x1b[90mElapsed:\x1b[0m ${Math.round(health.elapsedMs / 1000)}s`);
  }

  console.log(`  \x1b[90mThreshold:\x1b[0m ${Math.round(health.staleThresholdMs / 1000)}s`);
  console.log('');

  _cleanupScheduler(scheduler);

  if (!health.healthy) {
    process.exit(1);
  }
}

function runStats() {
  const scheduler = _createScheduler();
  if (!scheduler) return;

  const stats = scheduler.getSchedulerStats();

  console.log('');
  console.log('\x1b[1m  Scheduler Statistics\x1b[0m');
  console.log('  ' + '-'.repeat(50));
  console.log(`  Total schedules:  ${stats.totalSchedules}`);
  console.log(`    Active:         ${stats.activeSchedules}`);
  console.log(`    Paused:         ${stats.pausedSchedules}`);
  console.log(`    Cron:           ${stats.cronSchedules}`);
  console.log(`    Event:          ${stats.eventSchedules}`);
  console.log(`    One-time:       ${stats.onceSchedules}`);
  console.log(`  Queue length:     ${stats.queueLength}`);
  console.log(`  Total ticks:      ${stats.totalTicks}`);
  console.log(`  Total executed:   ${stats.totalExecuted}`);
  console.log(`  Total queued:     ${stats.totalQueued}`);
  console.log(`  Total events:     ${stats.totalEvents}`);

  if (stats.lastTick) {
    console.log(`  Last tick:        ${new Date(stats.lastTick).toLocaleString()}`);
  }

  console.log(`  Running:          ${stats.running ? 'yes' : 'no'}`);
  console.log('');

  _cleanupScheduler(scheduler);
}

function runNext(args) {
  const limit = parseInt(args[0], 10) || 10;
  const scheduler = _createScheduler();
  if (!scheduler) return;

  const runs = scheduler.getNextRuns(limit);

  if (runs.length === 0) {
    console.log('\n  No upcoming scheduled runs.\n');
    _cleanupScheduler(scheduler);
    return;
  }

  console.log('');
  console.log('\x1b[1m  Upcoming Scheduled Runs\x1b[0m');
  console.log('  ' + '-'.repeat(60));

  for (const run of runs) {
    const nextDate = new Date(run.next_run);
    console.log(`  ${nextDate.toLocaleString()}  \x1b[1m${run.name}\x1b[0m  [${run.cron}]  Level: ${run.level}`);
  }

  console.log('');
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

function showHelp() {
  console.log(`
\x1b[1maiox corp scheduler\x1b[0m -- Scheduler operations

\x1b[1mSUBCOMMANDS:\x1b[0m
  tick      Execute a single tick (check schedules + process queue)
  start     Start long-lived scheduler process (foreground)
  stop      Send stop signal to a running scheduler
  health    Check scheduler heartbeat (dead man's switch)
  stats     Show scheduler statistics
  next [N]  Show next N upcoming scheduled runs (default: 10)

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp scheduler tick       # Run one tick
  aiox corp scheduler start      # Start scheduler loop
  aiox corp scheduler stop       # Stop a running scheduler
  aiox corp scheduler health     # Check if scheduler is alive
  aiox corp scheduler stats      # Show execution statistics
  aiox corp scheduler next 5     # Next 5 scheduled runs
`);
}

module.exports = { execute };
