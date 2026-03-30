/**
 * CLI Command: aiox corp dashboard
 *
 * Full corporation dashboard -- all views combined.
 *
 * @module cli/commands/corp/dashboard
 * @version 1.0.0
 * @story CORP-6 - CLI Dashboard
 *
 * Usage:
 *   aiox corp dashboard   # Full dashboard
 */

'use strict';

const path = require('path');

function execute(args = []) {
  if (args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  try {
    const projectRoot = process.cwd();
    const deps = loadDependencies(projectRoot);
    const { CLIRenderer } = require(path.join(
      projectRoot, '.aios-core', 'core', 'corporation', 'dashboard', 'cli-renderer',
    ));

    const renderer = new CLIRenderer(deps);
    console.log(renderer.renderDashboard());

    // Cleanup logger timer
    if (deps.activityLogger) {
      deps.activityLogger.close();
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function loadDependencies(projectRoot) {
  const corpPath = path.join(projectRoot, '.aios-core', 'core', 'corporation');

  const { OrgEngine } = require(path.join(corpPath, 'org-engine'));
  const orgEngine = new OrgEngine(projectRoot);
  orgEngine.load();

  let activityLogger = null;
  try {
    const { ActivityLogger } = require(path.join(corpPath, 'activity-logger'));
    activityLogger = new ActivityLogger({ autoStart: false });
  } catch { /* optional */ }

  let permissionEngine = null;
  try {
    const { createPermissionEngine } = require(path.join(corpPath, 'permission-engine'));
    permissionEngine = createPermissionEngine(orgEngine);
  } catch { /* optional */ }

  let taskRouter = null;
  try {
    const { TaskRouter } = require(path.join(corpPath, 'task-router'));
    taskRouter = new TaskRouter(orgEngine, permissionEngine || { canPerform: () => ({ allowed: true }) }, activityLogger, { projectRoot });
  } catch { /* optional */ }

  let escalationManager = null;
  try {
    const { EscalationManager } = require(path.join(corpPath, 'escalation-manager'));
    escalationManager = new EscalationManager(orgEngine, permissionEngine || { canPerform: () => ({ allowed: true }) }, activityLogger);
  } catch { /* optional */ }

  let shadowMode = null;
  try {
    const { ShadowMode } = require(path.join(corpPath, 'shadow-mode'));
    shadowMode = new ShadowMode({ projectRoot });
  } catch { /* optional */ }

  return { orgEngine, activityLogger, taskRouter, escalationManager, shadowMode };
}

function showHelp() {
  console.log(`
\x1b[1maiox corp dashboard\x1b[0m -- Full corporation dashboard

Displays a comprehensive overview including:
  - Department summary table
  - Active tasks and queue
  - Pending escalations
  - Recent activity feed
  - Shadow mode status

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp dashboard   # Full dashboard view
`);
}

module.exports = { execute };
