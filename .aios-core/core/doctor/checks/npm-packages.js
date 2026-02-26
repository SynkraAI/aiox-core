/**
 * Doctor Check: npm Packages
 *
 * Validates:
 * 1. node_modules/ exists in project root (quick sanity check)
 * 2. (INS-4.12) .aios-core/node_modules/ exists and contains all declared deps
 *
 * @module aios-core/doctor/checks/npm-packages
 * @story INS-4.1, INS-4.12
 */

const path = require('path');
const fs = require('fs');

const name = 'npm-packages';

async function run(context) {
  const nodeModulesPath = path.join(context.projectRoot, 'node_modules');
  // Check 1: Project node_modules
  if (!fs.existsSync(nodeModulesPath)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'node_modules not found',
      fixCommand: 'npm install',
    };
  }

  // Check 2 (INS-4.12): .aios-core/node_modules/ completeness
  const aiosCoreDir = path.join(context.projectRoot, '.aios-core');
  const aiosCorePackageJson = path.join(aiosCoreDir, 'package.json');
  const aiosCoreNodeModules = path.join(aiosCoreDir, 'node_modules');

  if (fs.existsSync(aiosCorePackageJson)) {
    if (!fs.existsSync(aiosCoreNodeModules)) {
      return {
        check: name,
        status: 'FAIL',
        message: 'node_modules present, but .aios-core/node_modules/ missing',
        fixCommand: 'cd .aios-core && npm install --production',
      };
    }

    // Verify all declared deps are installed
    try {
      const pkg = JSON.parse(fs.readFileSync(aiosCorePackageJson, 'utf8'));
      const deps = Object.keys(pkg.dependencies || {});
      const missing = [];

      for (const dep of deps) {
        const depPath = path.join(aiosCoreNodeModules, dep);
        if (!fs.existsSync(depPath)) {
          missing.push(dep);
        }
      }

      if (missing.length > 0) {
        return {
          check: name,
          status: 'FAIL',
          message: `node_modules present, but .aios-core missing deps: ${missing.join(', ')}`,
          fixCommand: 'cd .aios-core && npm install --production',
        };
      }
    } catch {
      // If we can't parse package.json, just check existence passed above
    }
  }

  return {
    check: name,
    status: 'PASS',
    message: 'node_modules present' + (fs.existsSync(aiosCoreNodeModules) ? ', .aios-core deps complete' : ''),
    fixCommand: null,
  };
}

module.exports = { name, run };
