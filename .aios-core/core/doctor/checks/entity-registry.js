/**
 * Doctor Check: Entity Registry
 *
 * Validates .aios-core/data/entity-registry.yaml exists and mtime < 48h.
 *
 * @module aios-core/doctor/checks/entity-registry
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'entity-registry';

const MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

async function run(context) {
  const registryPath = path.join(context.projectRoot, '.aios-core', 'data', 'entity-registry.yaml');

  if (!fs.existsSync(registryPath)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'entity-registry.yaml not found',
      fixCommand: 'npx aios-core install --force',
    };
  }

  const stat = fs.statSync(registryPath);
  const ageMs = Date.now() - stat.mtimeMs;
  const ageHours = Math.round(ageMs / (60 * 60 * 1000));

  const content = fs.readFileSync(registryPath, 'utf8');
  const lineCount = content.split('\n').length;

  if (ageMs > MAX_AGE_MS) {
    return {
      check: name,
      status: 'WARN',
      message: `entity-registry.yaml is ${ageHours}h old (threshold: 48h), ~${lineCount} lines`,
      fixCommand: 'npx aios-core install --force',
    };
  }

  return {
    check: name,
    status: 'PASS',
    message: `~${lineCount} lines, updated ${ageHours}h ago`,
    fixCommand: null,
  };
}

module.exports = { name, run };
