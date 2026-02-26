/**
 * Doctor Check: CLAUDE.md
 *
 * Validates .claude/CLAUDE.md exists and has required section headings.
 *
 * @module aios-core/doctor/checks/claude-md
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'claude-md';

const REQUIRED_SECTIONS = [
  'Constitution',
  'Framework vs Project Boundary',
  'Sistema de Agentes',
];

async function run(context) {
  const claudeMdPath = path.join(context.projectRoot, '.claude', 'CLAUDE.md');

  if (!fs.existsSync(claudeMdPath)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'CLAUDE.md not found',
      fixCommand: 'aios doctor --fix',
    };
  }

  const content = fs.readFileSync(claudeMdPath, 'utf8');

  const missingSections = REQUIRED_SECTIONS.filter(
    (section) => !content.includes(section),
  );

  if (missingSections.length === 0) {
    return {
      check: name,
      status: 'PASS',
      message: 'All required sections present',
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'WARN',
    message: `Missing sections: ${missingSections.join(', ')}`,
    fixCommand: 'aios doctor --fix',
  };
}

module.exports = { name, run };
