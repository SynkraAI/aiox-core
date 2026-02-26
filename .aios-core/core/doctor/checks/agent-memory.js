/**
 * Doctor Check: Agent Memory
 *
 * Validates MEMORY.md files exist for all 10 agents in development/agents/.
 *
 * @module aios-core/doctor/checks/agent-memory
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'agent-memory';

const EXPECTED_AGENTS = [
  'dev',
  'qa',
  'architect',
  'pm',
  'po',
  'sm',
  'analyst',
  'data-engineer',
  'ux',
  'devops',
];

async function run(context) {
  const agentsDir = path.join(context.projectRoot, '.aios-core', 'development', 'agents');

  if (!fs.existsSync(agentsDir)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'Agents directory not found',
      fixCommand: 'aios doctor --fix',
    };
  }

  const missing = EXPECTED_AGENTS.filter(
    (agent) => !fs.existsSync(path.join(agentsDir, agent, 'MEMORY.md')),
  );

  if (missing.length === 0) {
    return {
      check: name,
      status: 'PASS',
      message: `${EXPECTED_AGENTS.length}/${EXPECTED_AGENTS.length} MEMORY.md files present`,
      fixCommand: null,
    };
  }

  const present = EXPECTED_AGENTS.length - missing.length;

  return {
    check: name,
    status: 'WARN',
    message: `${present}/${EXPECTED_AGENTS.length} MEMORY.md files present (missing: ${missing.join(', ')})`,
    fixCommand: 'aios doctor --fix',
  };
}

module.exports = { name, run, EXPECTED_AGENTS };
