/**
 * Doctor Check: Core Config
 *
 * Validates core-config.yaml exists and has required keys:
 * boundary, project, ide.
 *
 * @module aios-core/doctor/checks/core-config
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'core-config';

const REQUIRED_SECTIONS = ['boundary', 'project', 'ide'];

async function run(context) {
  const configPath = path.join(context.projectRoot, '.aios-core', 'core-config.yaml');

  if (!fs.existsSync(configPath)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'core-config.yaml not found',
      fixCommand: 'npx aios-core install --force',
    };
  }

  const content = fs.readFileSync(configPath, 'utf8');

  const missingSections = REQUIRED_SECTIONS.filter(
    (section) => !content.includes(`${section}:`),
  );

  if (missingSections.length === 0) {
    return {
      check: name,
      status: 'PASS',
      message: 'Schema valid, boundary section present',
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'FAIL',
    message: `Missing sections: ${missingSections.join(', ')}`,
    fixCommand: 'npx aios-core install --force',
  };
}

module.exports = { name, run };
