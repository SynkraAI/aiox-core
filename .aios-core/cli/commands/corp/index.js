/**
 * Corp Command Module -- Corporation CLI commands
 *
 * @module cli/commands/corp
 * @version 1.3.0
 * @story CORP-3, CORP-6, CORP-7, CORP-10 - CLI Dashboard + Scheduler + Enforcement
 *
 * Usage:
 *   aiox corp status        # One-liner status overview
 *   aiox corp dashboard     # Full dashboard
 *   aiox corp agents        # Agent roster
 *   aiox corp log [flags]   # Query activity logs
 */

'use strict';

const SUBCOMMANDS = {
  status: () => require('./status'),
  dashboard: () => require('./dashboard'),
  agents: () => require('./agents'),
  log: () => require('./log'),
  org: () => require('./org'),
  member: () => require('./member'),
  permissions: () => require('./permissions'),
  shadow: () => require('./shadow'),
  'shadow-report': () => require('./shadow'),
  route: () => require('./route'),
  tasks: () => require('./tasks'),
  escalate: () => require('./escalate'),
  hooks: () => require('./hooks'),
  enforce: () => require('./enforce'),
  schedule: () => require('./schedule'),
  scheduler: () => require('./scheduler'),
  help: () => ({ execute: () => showHelp() }),
};

/**
 * Execute corp subcommand.
 *
 * @param {string[]} args - CLI arguments after `corp`
 */
function execute(args = []) {
  const subcommand = args[0];
  const subArgs = args.slice(1);

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    showHelp();
    return;
  }

  const loader = SUBCOMMANDS[subcommand];
  if (!loader) {
    console.error(`Unknown corp subcommand: ${subcommand}`);
    console.error('Run "aiox corp --help" for available subcommands.');
    process.exit(1);
  }

  const mod = loader();
  mod.execute(subArgs);
}

function showHelp() {
  console.log(`
\x1b[1maiox corp\x1b[0m -- Corporation management commands

\x1b[1mDASHBOARD:\x1b[0m
  status        One-liner corporation status overview
  dashboard     Full dashboard (all views combined)
  agents        List all agents with filters

\x1b[1mMANAGEMENT:\x1b[0m
  org           Show organizational hierarchy tree
  member        Show details of a specific agent/member
  log           Query and display activity logs
  permissions   Check agent permission for an action
  shadow        Shadow mode status, report, and statistics
  route         Route a task to the best available agent
  tasks         List active and queued tasks
  escalate      Simulate escalation chain for an agent/action
  hooks         Show corporation hooks status (UAP integration)

\x1b[1mENFORCEMENT:\x1b[0m
  enforce       Enforcement mode management (status/check/activate/deactivate)

\x1b[1mSCHEDULER:\x1b[0m
  schedule      Manage schedules (list/add/remove/pause/trigger)
  scheduler     Scheduler operations (tick/start/health/stats)
  help          Show this help

\x1b[1mUSAGE:\x1b[0m
  aiox corp status                   # Quick status overview
  aiox corp dashboard                # Full dashboard
  aiox corp agents                   # All agents
  aiox corp agents --dept engineering # Filter by department
  aiox corp agents --level L3        # Filter by level
  aiox corp agents --type core       # Filter by type
  aiox corp org                      # Show full org tree
  aiox corp org --dept engineering   # Filter by department
  aiox corp member dev               # Show agent details
  aiox corp permissions dev push_code # Check agent permission
  aiox corp log                      # Last 50 events
  aiox corp log --agent dev          # Filter by agent
  aiox corp log --summary            # Show statistics
  aiox corp shadow                   # Shadow mode status
  aiox corp route "implement auth"   # Route task to best agent
  aiox corp tasks                    # List active/queued tasks
  aiox corp escalate dev deploy      # Simulate escalation chain
  aiox corp enforce                  # Show enforcement status
  aiox corp enforce check            # Analyze shadow data for readiness
  aiox corp enforce activate         # Switch to enforcement mode
  aiox corp enforce deactivate       # Revert to shadow mode
  aiox corp schedule list            # List all schedules
  aiox corp schedule add backup --cron "0 2 * * *" --task backup
  aiox corp scheduler tick           # Execute one scheduler tick
  aiox corp scheduler health         # Check scheduler heartbeat

Run "aiox corp <subcommand> --help" for details.
`);
}

module.exports = { execute };
