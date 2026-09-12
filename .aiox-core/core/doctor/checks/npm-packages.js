/**
 * Doctor Check: npm Packages
 *
 * Validates:
 * 1. node_modules/ exists in project root (quick sanity check)
 * 2. (INS-4.12) .aiox-core/node_modules/ exists and contains all declared deps
 *
 * @module aiox-core/doctor/checks/npm-packages
 * @story INS-4.1, INS-4.12
 */

const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

const name = 'npm-packages';

/** Realpath when the path exists; the input unchanged when it does not. */
function safeRealpath(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return p;
  }
}

/**
 * Resolve a dependency the way `.aiox-core/` code actually loads it, and report
 * whether it lands inside the project.
 *
 * Checking `fs.existsSync('.aiox-core/node_modules/<dep>')` answers a different
 * question than the one that matters. Node resolves a bare specifier by walking
 * up the directory tree, so a dependency absent from the project can still load
 * from an ancestor `node_modules` — the developer's home directory, for
 * instance. The directory check reports PASS while a clean install of the same
 * project throws MODULE_NOT_FOUND.
 *
 * Both layouts are legitimate and both must pass: deps installed under
 * `.aiox-core/node_modules/`, and deps hoisted to the project root when the
 * consumer declares `@aiox-squads/core` as a dependency. Only resolution from
 * outside the project boundary is a failure.
 *
 * @returns {{status: 'inside'|'outside'|'missing', resolved?: string}}
 */
function resolveWithinProject(dep, consumerPath, projectRoot) {
  let resolved;
  try {
    resolved = createRequire(consumerPath).resolve(dep);
  } catch {
    return { status: 'missing' };
  }

  // Node core modules resolve to a bare name with no path separator.
  if (!path.isAbsolute(resolved)) {
    return { status: 'inside', resolved };
  }

  // require.resolve returns a realpath, so the boundary must be a realpath too.
  // Without this, any project reached through a symlinked parent — /tmp on
  // macOS, a symlinked checkout, a worktree — compares a real path against a
  // symbolic one and reports every dependency as external.
  const realBoundary = safeRealpath(path.resolve(projectRoot)) + path.sep;
  const realResolved = safeRealpath(resolved);

  return realResolved.startsWith(realBoundary)
    ? { status: 'inside', resolved }
    : { status: 'outside', resolved };
}

async function run(context) {
  // createRequire needs an absolute filename, and the boundary comparison needs
  // an absolute prefix. Callers may pass a relative root such as '.', so
  // normalize once here and derive every path below from it.
  const projectRoot = path.resolve(context.projectRoot);

  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  // Check 1: Project node_modules
  if (!fs.existsSync(nodeModulesPath)) {
    return {
      check: name,
      status: 'FAIL',
      message: 'node_modules not found',
      fixCommand: 'npm install',
    };
  }

  // Check 2 (INS-4.12): .aiox-core/node_modules/ completeness
  const aioxCoreDir = path.join(projectRoot, '.aiox-core');
  const aioxCorePackageJson = path.join(aioxCoreDir, 'package.json');
  const aioxCoreNodeModules = path.join(aioxCoreDir, 'node_modules');

  if (fs.existsSync(aioxCorePackageJson)) {
    // Verify each declared dep resolves from the consumer, inside the project.
    // Deps may live in .aiox-core/node_modules/ or be hoisted to the project
    // root — both are fine. Resolution from outside the project is not.
    try {
      const pkg = JSON.parse(fs.readFileSync(aioxCorePackageJson, 'utf8'));
      const deps = Object.keys(pkg.dependencies || {});
      const consumerPath = path.join(aioxCoreDir, 'index.js');

      const missing = [];
      const external = [];

      for (const dep of deps) {
        const { status, resolved } = resolveWithinProject(dep, consumerPath, projectRoot);
        if (status === 'missing') {
          missing.push(dep);
        } else if (status === 'outside') {
          external.push(`${dep} (${resolved})`);
        }
      }

      if (missing.length > 0) {
        return {
          check: name,
          status: 'FAIL',
          message: `node_modules present, but .aiox-core deps do not resolve: ${missing.join(', ')}`,
          fixCommand: 'cd .aiox-core && npm install --production',
        };
      }

      if (external.length > 0) {
        return {
          check: name,
          status: 'FAIL',
          message:
            'node_modules present, but .aiox-core deps resolve from outside the project ' +
            `(a clean install elsewhere would fail): ${external.join(', ')}`,
          fixCommand: 'cd .aiox-core && npm install --production',
        };
      }
    } catch {
      // If we can't parse package.json, fall back to the directory check below.
      if (!fs.existsSync(aioxCoreNodeModules)) {
        return {
          check: name,
          status: 'FAIL',
          message: 'node_modules present, but .aiox-core/node_modules/ missing',
          fixCommand: 'cd .aiox-core && npm install --production',
        };
      }
    }
  }

  return {
    check: name,
    status: 'PASS',
    message: 'node_modules present' + (fs.existsSync(aioxCoreNodeModules) ? ', .aiox-core deps complete' : ''),
    fixCommand: null,
  };
}

module.exports = { name, run };
