/**
 * Doctor Check: Graph Dashboard
 *
 * Validates .aiox-core/core/graph-dashboard/ directory exists
 * with at least 1 .js file.
 *
 * @module aiox-core/doctor/checks/graph-dashboard
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'graph-dashboard';

async function run(context) {
  const dashboardDir = path.join(context.projectRoot, '.aiox-core', 'core', 'graph-dashboard');

  if (!fs.existsSync(dashboardDir)) {
    return {
      check: name,
      status: 'WARN',
      message: 'graph-dashboard directory not found',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  const jsFiles = fs.readdirSync(dashboardDir)
    .filter((f) => f.endsWith('.js'));

  if (jsFiles.length === 0) {
    return {
      check: name,
      status: 'WARN',
      message: 'graph-dashboard directory empty (no .js files)',
      fixCommand: 'npx aiox-core install --force',
    };
  }

  return {
    check: name,
    status: 'PASS',
    message: `All modules present (${jsFiles.length} files)`,
    fixCommand: null,
  };
}

module.exports = { name, run };
