/**
 * Doctor Check: settings.json
 *
 * Validates .claude/settings.json exists, deny rules count >= 40,
 * and compares against core-config.yaml boundary paths.
 *
 * @module aios-core/doctor/checks/settings-json
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'settings-json';

/**
 * Checks that core-config.yaml boundary.protected paths are covered by deny rules.
 * Returns array of unprotected boundary paths.
 */
function checkBoundaryAlignment(context, denyRules) {
  const configPath = path.join(context.projectRoot, '.aios-core', 'core-config.yaml');
  if (!fs.existsSync(configPath)) return []; // No config = skip boundary check

  let content;
  try {
    content = fs.readFileSync(configPath, 'utf8');
  } catch {
    return [];
  }

  // Extract boundary.protected paths from YAML (simple line parsing)
  const lines = content.split('\n');
  const protectedPaths = [];
  let inProtected = false;

  for (const line of lines) {
    if (/^\s+protected:\s*$/.test(line)) {
      inProtected = true;
      continue;
    }
    if (inProtected) {
      const match = line.match(/^\s+-\s+(.+)$/);
      if (match) {
        protectedPaths.push(match[1].trim());
      } else if (/^\s+\w/.test(line) && !line.match(/^\s+-/)) {
        inProtected = false;
      }
    }
  }

  if (protectedPaths.length === 0) return [];

  // Check each boundary path has at least one matching deny rule
  const denyStr = denyRules.join('\n');
  const unprotected = protectedPaths.filter((bp) => {
    // Strip glob suffixes for base path matching
    const basePath = bp.replace(/\/\*\*$/, '').replace(/\/\*$/, '');
    return !denyStr.includes(basePath);
  });

  return unprotected;
}

async function run(context) {
  const settingsPath = path.join(context.projectRoot, '.claude', 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'settings.json not found',
      fixCommand: 'npx aios-core install --force',
    };
  }

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch {
    return {
      check: name,
      status: 'FAIL',
      message: 'settings.json is invalid JSON',
      fixCommand: 'npx aios-core install --force',
    };
  }

  const denyRules = settings.permissions?.deny || [];
  const allowRules = settings.permissions?.allow || [];
  const denyCount = denyRules.length;
  const allowCount = allowRules.length;

  if (denyCount < 40) {
    return {
      check: name,
      status: 'WARN',
      message: `Deny rules below threshold (${denyCount} rules, expected >= 40)`,
      fixCommand: 'aios doctor --fix',
    };
  }

  // Compare deny rules against core-config.yaml boundary.protected paths
  const boundaryIssues = checkBoundaryAlignment(context, denyRules);
  if (boundaryIssues.length > 0) {
    return {
      check: name,
      status: 'WARN',
      message: `Deny rules present (${denyCount}) but missing boundary coverage: ${boundaryIssues.join(', ')}`,
      fixCommand: 'aios doctor --fix',
    };
  }

  return {
    check: name,
    status: 'PASS',
    message: `Deny rules present (${denyCount} rules, ${allowCount} allows)`,
    fixCommand: null,
  };
}

module.exports = { name, run };
