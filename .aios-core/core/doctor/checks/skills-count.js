/**
 * Doctor Check: Skills Count
 *
 * Counts skill directories in .claude/skills/ that contain SKILL.md.
 * PASS: >=7, WARN: 1-6, FAIL: 0 or directory missing.
 *
 * @module aios-core/doctor/checks/skills-count
 * @story INS-4.8
 */

const path = require('path');
const fs = require('fs');

const name = 'skills-count';

async function run(context) {
  const skillsDir = path.join(context.projectRoot, '.claude', 'skills');

  if (!fs.existsSync(skillsDir)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'Skills directory not found (.claude/skills/)',
      fixCommand: 'npx aios-core install --force',
    };
  }

  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return {
      check: name,
      status: 'FAIL',
      message: 'Cannot read skills directory',
      fixCommand: 'npx aios-core install --force',
    };
  }

  const skills = entries.filter(
    (d) => d.isDirectory() && fs.existsSync(path.join(skillsDir, d.name, 'SKILL.md')),
  );

  const count = skills.length;

  if (count === 0) {
    return {
      check: name,
      status: 'FAIL',
      message: 'No skills found (expected >=7)',
      fixCommand: 'npx aios-core install --force',
    };
  }

  if (count >= 7) {
    return {
      check: name,
      status: 'PASS',
      message: `${count} skills found`,
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'WARN',
    message: `Only ${count}/7 skills found`,
    fixCommand: 'npx aios-core install --force',
  };
}

module.exports = { name, run };
