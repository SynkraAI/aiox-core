/**
 * Doctor Check: IDE Sync
 *
 * Validates Claude agent skills and legacy command files match
 * .aiox-core/development/agents/ during the skills-first transition.
 *
 * @module aiox-core/doctor/checks/ide-sync
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'ide-sync';

async function run(context) {
  const agentsSourceDir = path.join(context.projectRoot, '.aiox-core', 'development', 'agents');
  const agentsCommandDir = path.join(context.projectRoot, '.claude', 'commands', 'AIOX', 'agents');
  const agentsSkillDir = path.join(context.projectRoot, '.claude', 'skills', 'AIOX', 'agents');

  if (!fs.existsSync(agentsSourceDir)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'Source agents directory not found',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  let sourceAgents;
  try {
    sourceAgents = fs.readdirSync(agentsSourceDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace('.md', ''));
  } catch (_err) {
    return {
      check: name,
      status: 'FAIL',
      message: 'Cannot read source agents directory',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  const commandAgents = fs.existsSync(agentsCommandDir)
    ? fs.readdirSync(agentsCommandDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace('.md', ''))
    : [];
  const skillAgents = fs.existsSync(agentsSkillDir)
    ? fs.readdirSync(agentsSkillDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(agentsSkillDir, entry.name, 'SKILL.md')))
      .map((entry) => entry.name)
    : [];

  const sourceCount = sourceAgents.length;
  const commandCount = commandAgents.length;
  const skillCount = skillAgents.length;

  if (skillCount !== sourceCount) {
    return {
      check: name,
      status: 'WARN',
      message: `Claude skills have ${skillCount} agents, source has ${sourceCount}`,
      fixCommand: 'npx aiox-core install --force',
    };
  }

  if (commandCount === sourceCount) {
    return {
      check: name,
      status: 'PASS',
      message: `${skillCount}/${sourceCount} Claude skills synced; ${commandCount}/${sourceCount} legacy commands synced`,
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'WARN',
    message: `${skillCount}/${sourceCount} Claude skills synced; legacy commands have ${commandCount}/${sourceCount}`,
    fixCommand: 'npx aiox-core install --force',
  };
}

module.exports = { name, run };
