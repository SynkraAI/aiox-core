/**
 * Doctor Check: Skills Count
 *
 * Counts SKILL.md files in .claude/skills/ recursively.
 * PASS: >=7 total skills and all AIOX agent skills present.
 * WARN: skills exist but AIOX agent skills are incomplete.
 * FAIL: 0 or directory missing.
 *
 * @module aiox-core/doctor/checks/skills-count
 * @story INS-4.8
 */

const path = require('path');
const fs = require('fs');

const name = 'skills-count';

function countSkillFiles(dir) {
  let count = 0;
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return 0;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countSkillFiles(fullPath);
    } else if (entry.isFile() && entry.name === 'SKILL.md') {
      count++;
    }
  }

  return count;
}

function countAgentSkillFiles(agentSkillsDir) {
  let entries;

  try {
    entries = fs.readdirSync(agentSkillsDir, { withFileTypes: true });
  } catch {
    return 0;
  }

  return entries.filter((entry) => (
    entry.isDirectory() && fs.existsSync(path.join(agentSkillsDir, entry.name, 'SKILL.md'))
  )).length;
}

function countSourceAgents(sourceAgentsDir) {
  let entries;

  try {
    entries = fs.readdirSync(sourceAgentsDir, { withFileTypes: true });
  } catch {
    return 0;
  }

  return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).length;
}

async function run(context) {
  const skillsDir = path.join(context.projectRoot, '.claude', 'skills');
  const agentSkillsDir = path.join(skillsDir, 'AIOX', 'agents');
  const sourceAgentsDir = path.join(context.projectRoot, '.aiox-core', 'development', 'agents');

  if (!fs.existsSync(skillsDir)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'Skills directory not found (.claude/skills/)',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  const count = countSkillFiles(skillsDir);
  const agentSkillCount = countAgentSkillFiles(agentSkillsDir);
  const sourceAgentCount = countSourceAgents(sourceAgentsDir);

  if (count === 0) {
    return {
      check: name,
      status: 'FAIL',
      message: 'No skills found (expected >=7)',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  if (sourceAgentCount > 0 && agentSkillCount !== sourceAgentCount) {
    return {
      check: name,
      status: 'WARN',
      message: `${count} skills found, but AIOX agent skills are incomplete (${agentSkillCount}/${sourceAgentCount})`,
      fixCommand: 'npx aiox-core install --force',
    };
  }

  if (count >= 7) {
    return {
      check: name,
      status: 'PASS',
      message: `${count} skills found (${agentSkillCount}/${sourceAgentCount} AIOX agent skills)`,
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'WARN',
    message: `Only ${count}/7 skills found (${agentSkillCount}/${sourceAgentCount} AIOX agent skills)`,
    fixCommand: 'npx aiox-core install --force',
  };
}

module.exports = {
  name,
  run,
  countSkillFiles,
  countAgentSkillFiles,
  countSourceAgents,
};
