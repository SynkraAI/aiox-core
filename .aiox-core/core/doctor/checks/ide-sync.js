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

function readMarkdownAgents(dir, label) {
  if (!fs.existsSync(dir)) {
    return { agents: [], error: null };
  }

  try {
    const agents = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace('.md', ''));
    return { agents, error: null };
  } catch (error) {
    return { agents: [], error: `Cannot read ${label} directory: ${error.message}` };
  }
}

function readSkillAgents(dir) {
  if (!fs.existsSync(dir)) {
    return { agents: [], error: null };
  }

  try {
    const agents = fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, 'SKILL.md')))
      .map((entry) => entry.name);
    return { agents, error: null };
  } catch (error) {
    return { agents: [], error: `Cannot read Claude skills directory: ${error.message}` };
  }
}

function diffAgents(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return {
    missing: expected.filter((id) => !actualSet.has(id)),
    extra: actual.filter((id) => !expectedSet.has(id)),
  };
}

function formatList(items) {
  if (items.length === 0) return 'none';
  return items.slice(0, 5).join(', ') + (items.length > 5 ? `, +${items.length - 5} more` : '');
}

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

  const commandResult = readMarkdownAgents(agentsCommandDir, 'Claude commands');
  const skillResult = readSkillAgents(agentsSkillDir);

  if (commandResult.error || skillResult.error) {
    return {
      check: name,
      status: 'FAIL',
      message: commandResult.error || skillResult.error,
      fixCommand: 'npx aiox-core install --force',
    };
  }

  const commandAgents = commandResult.agents;
  const skillAgents = skillResult.agents;

  const sourceCount = sourceAgents.length;
  const commandCount = commandAgents.length;
  const skillCount = skillAgents.length;
  const skillDiff = diffAgents(sourceAgents, skillAgents);
  const commandDiff = diffAgents(sourceAgents, commandAgents);

  if (skillDiff.missing.length > 0 || skillDiff.extra.length > 0) {
    return {
      check: name,
      status: 'WARN',
      message: `Claude skills mismatch (missing: ${formatList(skillDiff.missing)}; extra: ${formatList(skillDiff.extra)})`,
      fixCommand: 'npx aiox-core install --force',
    };
  }

  if (commandDiff.missing.length === 0 && commandDiff.extra.length === 0) {
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
    message: `${skillCount}/${sourceCount} Claude skills synced; legacy commands mismatch (missing: ${formatList(commandDiff.missing)}; extra: ${formatList(commandDiff.extra)}; count: ${commandCount}/${sourceCount})`,
    fixCommand: 'npx aiox-core install --force',
  };
}

module.exports = {
  name,
  run,
  readMarkdownAgents,
  readSkillAgents,
  diffAgents,
};
