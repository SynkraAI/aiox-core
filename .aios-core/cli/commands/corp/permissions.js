/**
 * Corp Permissions CLI Command
 *
 * Check if an agent can perform a specific action.
 *
 * Usage:
 *   aiox corp permissions <agent-id> <action>
 *   aiox corp permissions dev push_code
 *   aiox corp permissions devops push_code
 *   aiox corp permissions architect deploy
 *
 * @module cli/commands/corp/permissions
 * @version 1.0.0
 * @story CORP-2 - PermissionEngine
 */

'use strict';

const path = require('path');

/**
 * Execute permissions check command.
 *
 * @param {string[]} args - [agentId, action, ...flags]
 */
function execute(args = []) {
  if (args.length < 2 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  const agentId = args[0];
  const action = args[1];
  const flags = args.slice(2);
  const verbose = flags.includes('--verbose') || flags.includes('-v');
  const targetDept = _extractFlag(flags, '--dept');

  const projectRoot = process.cwd();

  try {
    // Load OrgEngine
    const { OrgEngine } = require(
      path.join(projectRoot, '.aios-core', 'core', 'corporation', 'org-engine')
    );
    const { PermissionEngine } = require(
      path.join(projectRoot, '.aios-core', 'core', 'corporation', 'permission-engine')
    );

    const org = new OrgEngine(projectRoot);
    org.load();

    if (!org.isLoaded()) {
      console.error('\x1b[31mError:\x1b[0m OrgEngine failed to load. Is org-config.yaml present?');
      process.exit(1);
    }

    const engine = new PermissionEngine(org);

    // Build context
    const context = {};
    if (targetDept) {
      context.targetDepartment = targetDept;
    }

    // Perform check
    const result = engine.canPerform(agentId, action, context);
    const agent = org.getAgent(agentId);

    // Output
    console.log();
    console.log(`\x1b[1mPermission Check\x1b[0m`);
    console.log(`${'─'.repeat(40)}`);
    console.log(`  Agent:  ${agentId}${agent ? ` (${agent.level}, ${agent.department || 'cross-functional'})` : ' (unknown)'}`);
    console.log(`  Action: ${action}`);
    if (targetDept) {
      console.log(`  Target: ${targetDept}`);
    }
    console.log();

    if (result.allowed) {
      console.log(`  \x1b[32mALLOWED\x1b[0m  ${result.reason}`);
    } else {
      console.log(`  \x1b[31mDENIED\x1b[0m   ${result.reason}`);

      if (result.escalateTo) {
        const escalateAgent = org.getAgent(result.escalateTo);
        console.log(`  \x1b[33mEscalate to:\x1b[0m ${result.escalateTo}${escalateAgent ? ` (${escalateAgent.level})` : ''}`);
      }

      if (result.requiresApproval) {
        console.log(`  \x1b[33mRequires approval from:\x1b[0m ${result.requiresApproval.join(', ')}`);
      }
    }

    if (verbose && agent) {
      console.log();
      console.log(`\x1b[1mAgent Details\x1b[0m`);
      console.log(`  Level:      ${agent.level}`);
      console.log(`  Department: ${agent.department || 'N/A'}`);
      console.log(`  Title:      ${agent.title || 'N/A'}`);
      console.log(`  Reports to: ${agent.reports_to || 'N/A'}`);

      // Show escalation chain
      const chain = org.getEscalationChain(agentId);
      if (chain.length > 0) {
        console.log(`  Chain:      ${chain.map(a => `${a.id}(${a.level})`).join(' -> ')}`);
      }
    }

    console.log();

    // Exit with appropriate code
    if (!result.allowed) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`\x1b[31mError:\x1b[0m ${error.message}`);
    process.exit(1);
  }
}

/**
 * Extract a flag value from args (e.g., --dept engineering).
 * @private
 */
function _extractFlag(args, flag) {
  const idx = args.indexOf(flag);
  if (idx >= 0 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return null;
}

function showHelp() {
  console.log(`
\x1b[1maiox corp permissions\x1b[0m -- Check agent permissions

\x1b[1mUSAGE:\x1b[0m
  aiox corp permissions <agent-id> <action> [flags]

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp permissions dev push_code          # Check if dev can push
  aiox corp permissions devops push_code       # Check if devops can push
  aiox corp permissions architect deploy       # Check deploy permission
  aiox corp permissions dev create_story -v    # Verbose output
  aiox corp permissions dev cross_dept_request --dept product

\x1b[1mACTIONS:\x1b[0m
  execute_task, create_story, approve_story, approve_prd,
  push_code, deploy, create_agent, modify_org, escalate,
  consult, approve_budget, cross_dept_request, delete_file,
  merge_pr, review_code

\x1b[1mFLAGS:\x1b[0m
  -v, --verbose    Show agent details and escalation chain
  --dept <dept>    Specify target department for cross-dept checks
`);
}

module.exports = { execute };
