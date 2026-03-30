/**
 * CLI Command: aiox corp status
 *
 * Compact one-liner status of the corporation.
 *
 * @module cli/commands/corp/status
 * @version 1.0.0
 * @story CORP-6 - CLI Dashboard
 *
 * Usage:
 *   aiox corp status         # One-liner overview
 *   aiox corp status --json  # JSON output
 */

'use strict';

const path = require('path');

function execute(args = []) {
  if (args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  const isJson = args.includes('--json');

  try {
    const projectRoot = process.cwd();
    const deps = loadDependencies(projectRoot);
    const { CLIRenderer } = require(path.join(
      projectRoot, '.aios-core', 'core', 'corporation', 'dashboard', 'cli-renderer',
    ));

    const renderer = new CLIRenderer(deps);

    if (isJson) {
      const data = buildJsonStatus(deps);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(renderer.renderStatus());
    }

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

function buildJsonStatus(deps) {
  const agents = deps.orgEngine ? deps.orgEngine.getAllAgents() : [];
  const activeTasks = deps.taskRouter ? deps.taskRouter.getActiveTasks() : [];
  const queuedTasks = deps.taskRouter ? deps.taskRouter.getQueuedTasks() : [];
  const escalations = deps.escalationManager ? deps.escalationManager.getEscalationQueue() : [];

  return {
    totalAgents: agents.length,
    activeTasks: activeTasks.length,
    queuedTasks: queuedTasks.length,
    pendingEscalations: escalations.length,
    shadowMode: deps.shadowMode ? deps.shadowMode.isShadowMode() : null,
    departments: deps.orgEngine ? deps.orgEngine.getAllDepartmentIds().length : 0,
  };
}

function showHelp() {
  console.log(`
\x1b[1maiox corp status\x1b[0m -- Corporation status overview

\x1b[1mFLAGS:\x1b[0m
  --json   Output as JSON

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp status         # One-liner overview
  aiox corp status --json  # JSON output
`);
}

module.exports = { execute };
