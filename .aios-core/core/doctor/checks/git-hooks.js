/**
 * Doctor Check: Git Hooks
 *
 * Validates .husky/pre-commit and .husky/pre-push exist.
 *
 * @module aios-core/doctor/checks/git-hooks
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'git-hooks';

const EXPECTED_HOOKS = ['pre-commit', 'pre-push'];

async function run(context) {
  const huskyDir = path.join(context.projectRoot, '.husky');

  if (!fs.existsSync(huskyDir)) {
    return {
      check: name,
      status: 'WARN',
      message: '.husky directory not found',
      fixCommand: 'npx husky init',
    };
  }

  const missing = EXPECTED_HOOKS.filter(
    (hook) => !fs.existsSync(path.join(huskyDir, hook)),
  );

  if (missing.length === 0) {
    return {
      check: name,
      status: 'PASS',
      message: `${EXPECTED_HOOKS.join(' + ')} installed`,
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'WARN',
    message: `Missing hooks: ${missing.join(', ')}`,
    fixCommand: 'npx husky init',
  };
}

module.exports = { name, run };
