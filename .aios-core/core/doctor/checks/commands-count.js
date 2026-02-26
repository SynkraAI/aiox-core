/**
 * Doctor Check: Commands Count
 *
 * Counts .md files in .claude/commands/ recursively.
 * PASS: >=20, WARN: 12-19, FAIL: <12.
 *
 * @module aios-core/doctor/checks/commands-count
 * @story INS-4.8
 */

const path = require('path');
const fs = require('fs');

const name = 'commands-count';

/**
 * Recursively count .md files in a directory.
 */
function countMdFiles(dir) {
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
      count += countMdFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      count++;
    }
  }

  return count;
}

async function run(context) {
  const commandsDir = path.join(context.projectRoot, '.claude', 'commands');

  if (!fs.existsSync(commandsDir)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'Commands directory not found (.claude/commands/)',
      fixCommand: 'npx aios-core install --force',
    };
  }

  const count = countMdFiles(commandsDir);

  if (count >= 20) {
    return {
      check: name,
      status: 'PASS',
      message: `${count} command files found`,
      fixCommand: null,
    };
  }

  if (count >= 12) {
    return {
      check: name,
      status: 'WARN',
      message: `${count}/20 command files found (agents only, no extras)`,
      fixCommand: 'npx aios-core install --force',
    };
  }

  return {
    check: name,
    status: 'FAIL',
    message: `Only ${count} command files found (expected >=12)`,
    fixCommand: 'npx aios-core install --force',
  };
}

module.exports = { name, run };
