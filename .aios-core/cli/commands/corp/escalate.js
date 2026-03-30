/**
 * Corp Escalate CLI Command
 *
 * Simulate and display the escalation chain for an agent and action.
 *
 * Usage:
 *   aiox corp escalate <agent-id> <action>
 *   aiox corp escalate dev deploy
 *   aiox corp escalate qa approve_prd
 *   aiox corp escalate dev push_code --verbose
 *
 * @module cli/commands/corp/escalate
 * @version 1.0.0
 * @story CORP-4 - EscalationManager
 */

'use strict';

const path = require('path');

/**
 * Execute escalate command.
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
    // Load modules
    const { OrgEngine } = require(
      path.join(projectRoot, '.aios-core', 'core', 'corporation', 'org-engine')
    );
    const { PermissionEngine } = require(
      path.join(projectRoot, '.aios-core', 'core', 'corporation', 'permission-engine')
    );
    const { EscalationManager } = require(
      path.join(projectRoot, '.aios-core', 'core', 'corporation', 'escalation-manager')
    );

    const org = new OrgEngine(projectRoot);
    org.load();

    if (!org.isLoaded()) {
      console.error('\x1b[31mError:\x1b[0m OrgEngine failed to load. Is org-config.yaml present?');
      process.exit(1);
    }

    const permEngine = new PermissionEngine(org);
    const escalationMgr = new EscalationManager(org, permEngine, null);

    // Check if agent exists
    const agent = org.getAgent(agentId);
    if (!agent) {
      console.error(`\x1b[31mError:\x1b[0m Unknown agent: ${agentId}`);
      process.exit(1);
    }

    // Show agent info
    console.log(`\n\x1b[1mEscalation Chain Simulation\x1b[0m`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Agent:      ${agentId} (${agent.title || agent.type})`);
    console.log(`Level:      ${agent.level}`);
    console.log(`Department: ${agent.department || 'cross-functional'}`);
    console.log(`Action:     ${action}`);

    if (targetDept) {
      // Cross-department escalation
      console.log(`Target:     ${targetDept} (cross-department)`);
      console.log(`${'='.repeat(50)}\n`);

      const result = escalationMgr.crossDeptEscalate(agentId, targetDept, action);

      if (result.approved) {
        console.log(`\x1b[32m[APPROVED]\x1b[0m ${result.reason}`);
      } else {
        console.log(`\x1b[33m[REQUIRES APPROVAL]\x1b[0m`);
        console.log(`  Approvers needed: ${result.requires_approval.join(', ')}`);
        console.log(`  Reason: ${result.reason}`);
      }
    } else {
      // Intra-department escalation
      console.log(`${'='.repeat(50)}\n`);

      // Show full chain
      const chain = org.getEscalationChain(agentId);
      console.log('\x1b[1mEscalation Chain:\x1b[0m');

      // Show starting agent
      console.log(`  \x1b[36m${agentId}\x1b[0m (${agent.level}) -- Requester`);

      for (let i = 0; i < chain.length; i++) {
        const superior = chain[i];
        const canDo = permEngine.canPerform(superior.id, action);
        const prefix = i === chain.length - 1 ? '  `--' : '  |--';
        const status = canDo.allowed
          ? '\x1b[32m[CAN RESOLVE]\x1b[0m'
          : '\x1b[90m[CANNOT RESOLVE]\x1b[0m';

        console.log(`${prefix} ${superior.id} (${superior.level}) ${status}`);

        if (verbose && !canDo.allowed) {
          console.log(`  |   Reason: ${canDo.reason}`);
        }
      }

      // Simulate the actual escalation
      console.log('\n\x1b[1mEscalation Result:\x1b[0m');
      try {
        const result = escalationMgr.escalate(agentId, action);
        if (result.escalated_to === 'human') {
          console.log(`  \x1b[33m[HUMAN REQUIRED]\x1b[0m Chain exhausted -- escalated to human (L5)`);
        } else {
          console.log(`  \x1b[32m[ESCALATED]\x1b[0m -> ${result.escalated_to} (${result.level})`);
          console.log(`  Reason: ${result.reason}`);
        }
      } catch (err) {
        console.log(`  \x1b[31m[ERROR]\x1b[0m ${err.message}`);
      }
    }

    console.log('');
  } catch (err) {
    console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
    process.exit(1);
  }
}

/**
 * Extract a flag value from args (e.g., --dept engineering).
 * @private
 */
function _extractFlag(flags, name) {
  const idx = flags.indexOf(name);
  if (idx >= 0 && idx + 1 < flags.length) {
    return flags[idx + 1];
  }
  return null;
}

function showHelp() {
  console.log(`
\x1b[1maiox corp escalate\x1b[0m -- Simulate escalation chain

\x1b[1mUSAGE:\x1b[0m
  aiox corp escalate <agent-id> <action>
  aiox corp escalate <agent-id> <action> --dept <target-dept>

\x1b[1mARGUMENTS:\x1b[0m
  agent-id    Agent requesting escalation (e.g., dev, qa, po)
  action      Action to escalate (e.g., deploy, push_code, approve_prd)

\x1b[1mFLAGS:\x1b[0m
  --dept <dept>   Simulate cross-department escalation
  --verbose, -v   Show detailed chain resolution info

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp escalate dev deploy           # Simulate dev trying to deploy
  aiox corp escalate qa approve_prd       # Simulate qa trying to approve PRD
  aiox corp escalate dev push_code -v     # Verbose chain for push_code
  aiox corp escalate dev execute_task --dept product  # Cross-dept request
`);
}

module.exports = { execute };
