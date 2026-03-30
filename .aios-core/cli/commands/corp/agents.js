/**
 * CLI Command: aiox corp agents
 *
 * List all agents with filtering by department, level, and type.
 *
 * @module cli/commands/corp/agents
 * @version 1.0.0
 * @story CORP-6 - CLI Dashboard
 *
 * Usage:
 *   aiox corp agents                    # All agents
 *   aiox corp agents --dept engineering # Filter by department
 *   aiox corp agents --level L3        # Filter by level
 *   aiox corp agents --type core       # Filter by type
 */

'use strict';

const path = require('path');

function execute(args = []) {
  if (args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  const flags = parseFlags(args);

  try {
    const projectRoot = process.cwd();
    const corpPath = path.join(projectRoot, '.aios-core', 'core', 'corporation');

    const { OrgEngine } = require(path.join(corpPath, 'org-engine'));
    const orgEngine = new OrgEngine(projectRoot);
    orgEngine.load();

    if (!orgEngine.isLoaded()) {
      console.error('Failed to load organizational config. Check org-config.yaml.');
      process.exit(1);
    }

    // Load optional TaskRouter for agent status
    let taskRouter = null;
    try {
      const { createPermissionEngine } = require(path.join(corpPath, 'permission-engine'));
      const permissionEngine = createPermissionEngine(orgEngine);
      const { TaskRouter } = require(path.join(corpPath, 'task-router'));
      taskRouter = new TaskRouter(orgEngine, permissionEngine, null, { projectRoot });
    } catch { /* optional */ }

    const { CLIRenderer } = require(path.join(
      projectRoot, '.aios-core', 'core', 'corporation', 'dashboard', 'cli-renderer',
    ));

    const renderer = new CLIRenderer({
      orgEngine,
      taskRouter,
    });

    console.log(renderer.renderAgents(flags));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function parseFlags(args) {
  const flags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dept' && args[i + 1]) {
      flags.dept = args[++i];
    } else if (arg === '--level' && args[i + 1]) {
      flags.level = args[++i];
    } else if (arg === '--type' && args[i + 1]) {
      flags.type = args[++i];
    }
  }

  return flags;
}

function showHelp() {
  console.log(`
\x1b[1maiox corp agents\x1b[0m -- List corporation agents

\x1b[1mFLAGS:\x1b[0m
  --dept <name>     Filter by department (engineering, sales, etc.)
  --level <L0-L5>   Filter by hierarchy level
  --type <type>     Filter by type (core, mind_clone, tool, human)

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp agents                     # All agents
  aiox corp agents --dept engineering  # Engineering agents only
  aiox corp agents --level L3          # All VPs/Chiefs
  aiox corp agents --type mind_clone   # Mind clones only
`);
}

module.exports = { execute };
