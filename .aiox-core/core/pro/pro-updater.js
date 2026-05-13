/**
 * Pro Updater — update @aiox-squads/pro
 *
 * Handles:
 * - Detecting installed Pro version and source
 * - Querying npm for latest version
 * - Checking compatibility with installed aiox-core
 * - Updating the package via the project's package manager
 * - Re-scaffolding Pro assets after update
 *
 * @module .aiox-core/core/pro/pro-updater
 * @story 122.3 — Implementar aiox pro update
 */

'use strict';

const path = require('path');
const fs = require('fs');
const https = require('https');
const { createRequire } = require('module');
const semver = require('semver');
const { execSync } = require('child_process');

const PRO_PACKAGE = '@aiox-squads/pro';
const CORE_PACKAGES = ['@aiox-squads/core', '@synkra/aiox-core', 'aiox-core'];
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];
const CORE_PACKAGE_ROOT = path.resolve(__dirname, '..', '..', '..');
const CORE_PACKAGE_REQUIRE = createRequire(path.join(CORE_PACKAGE_ROOT, 'package.json'));
const INSTALLER_SCAFFOLDER_EXPORTS = [
  '@aiox-squads/core/installer/pro-scaffolder',
  'aiox-core/installer/pro-scaffolder',
];

/**
 * Detect which package manager the project uses.
 * @param {string} projectRoot
 * @returns {'bun'|'pnpm'|'yarn'|'npm'}
 */
function detectPackageManager(projectRoot) {
  if (fs.existsSync(path.join(projectRoot, 'bun.lockb'))) return 'bun';
  if (fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(projectRoot, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

/**
 * Fetch latest version of a package from npm registry.
 * @param {string} packageName
 * @param {number} [timeout=15000]
 * @returns {Promise<{version:string, peerDependencies:Object}|null>}
 */
function fetchLatestFromNpm(packageName, timeout = 15000) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(packageName).replace('%40', '@');
    const url = `https://registry.npmjs.org/${encoded}/latest`;

    const req = https.get(url, { timeout }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        resolve(null);
        return;
      }

      let data = '';
      res.on('data', (c) => {
        data += c;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            version: json.version || null,
            peerDependencies: json.peerDependencies || {},
          });
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Resolve which Pro package is installed and where.
 * @param {string} projectRoot
 * @returns {{ packageName:string, packagePath:string, version:string }|null}
 */
function resolveInstalledPro(projectRoot) {
  const pkgPath = path.join(projectRoot, 'node_modules', '@aiox-squads', 'pro');
  const pkgJson = path.join(pkgPath, 'package.json');

  if (fs.existsSync(pkgJson)) {
    try {
      const data = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
      return { packageName: PRO_PACKAGE, packagePath: pkgPath, version: data.version || '0.0.0' };
    } catch {
      return null;
    }
  }

  return null;
}

function readProjectPackageJson(projectRoot) {
  const packageJsonPath = path.join(path.resolve(projectRoot), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch {
    return null;
  }
}

function buildNodeModulesPackageJsonPath(projectRoot, packageName) {
  const resolvedProjectRoot = path.resolve(projectRoot);

  if (packageName.startsWith('@')) {
    const [scope, name] = packageName.slice(1).split('/');
    return path.join(resolvedProjectRoot, 'node_modules', scope, name, 'package.json');
  }

  return path.join(resolvedProjectRoot, 'node_modules', packageName, 'package.json');
}

function detectCorePackageName(projectRoot) {
  const packageJson = readProjectPackageJson(projectRoot);
  if (!packageJson) {
    return null;
  }

  if (CORE_PACKAGES.includes(packageJson.name)) {
    return packageJson.name;
  }

  for (const field of DEPENDENCY_FIELDS) {
    const dependencies = packageJson[field] || {};
    for (const packageName of CORE_PACKAGES) {
      if (typeof dependencies[packageName] === 'string') {
        return packageName;
      }
    }
  }

  return null;
}

function assertValidProjectRoot(projectRoot) {
  if (!projectRoot || typeof projectRoot !== 'string') {
    throw new TypeError('updatePro(projectRoot): projectRoot must be a non-empty string.');
  }

  const resolvedProjectRoot = path.resolve(projectRoot);

  let stats;
  try {
    stats = fs.statSync(resolvedProjectRoot);
  } catch {
    throw new Error(
      `updatePro(projectRoot): projectRoot does not exist or is not a directory: ${resolvedProjectRoot}`,
    );
  }

  if (!stats.isDirectory()) {
    throw new Error(
      `updatePro(projectRoot): projectRoot does not exist or is not a directory: ${resolvedProjectRoot}`,
    );
  }

  return resolvedProjectRoot;
}

/**
 * Get the installed aiox-core version.
 * @param {string} projectRoot
 * @returns {string|null}
 */
function getCoreVersion(projectRoot) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  const versionJsonPath = path.join(resolvedProjectRoot, '.aiox-core', 'version.json');
  if (fs.existsSync(versionJsonPath)) {
    try {
      const versionInfo = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
      if (versionInfo.version) {
        return versionInfo.version;
      }
    } catch {
      /* skip */
    }
  }

  for (const packageName of CORE_PACKAGES) {
    const packageJsonPath = buildNodeModulesPackageJsonPath(resolvedProjectRoot, packageName);
    if (fs.existsSync(packageJsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return data.version || null;
      } catch {
        /* skip */
      }
    }
  }

  const projectPackageJson = readProjectPackageJson(resolvedProjectRoot);
  if (projectPackageJson) {
    if (CORE_PACKAGES.includes(projectPackageJson.name)) {
      return projectPackageJson.version || null;
    }

    const declaredCorePackage = detectCorePackageName(resolvedProjectRoot);
    if (declaredCorePackage) {
      for (const field of DEPENDENCY_FIELDS) {
        const declaredVersion = projectPackageJson[field]?.[declaredCorePackage];
        if (typeof declaredVersion === 'string') {
          const parsed = semver.coerce(declaredVersion);
          if (parsed) {
            return parsed.version;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Simple semver satisfies check: does installed >= required minimum?
 * @param {string} installed - e.g. '5.0.4'
 * @param {string} range - e.g. '>=5.0.0'
 * @returns {boolean}
 */
function satisfiesPeer(installed, range) {
  if (!installed || !range) return true;

  const installedVersion = semver.coerce(installed);
  if (!installedVersion) {
    return false;
  }

  try {
    return semver.satisfies(installedVersion, range, { includePrerelease: true });
  } catch {
    return true;
  }
}

function loadInstallerScaffolder() {
  let lastError = null;

  for (const exportPath of INSTALLER_SCAFFOLDER_EXPORTS) {
    try {
      return CORE_PACKAGE_REQUIRE(exportPath);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function applyScaffoldStep(projectRoot, proPath, result, onProgress, errorMessage) {
  try {
    const scaffoldResult = await runScaffold(projectRoot, proPath, onProgress);
    result.scaffoldResult = scaffoldResult;
    result.actions.push({ action: 'scaffold', status: scaffoldResult.success ? 'done' : 'failed' });

    if (!scaffoldResult.success) {
      result.success = false;
      result.error = errorMessage;
      return false;
    }

    return true;
  } catch (error) {
    result.scaffoldResult = {
      success: false,
      errors: [error.message],
      copiedFiles: [],
      skippedFiles: [],
      warnings: [],
    };
    result.actions.push({ action: 'scaffold', status: 'failed', error: error.message });
    result.success = false;
    result.error = errorMessage;
    return false;
  }
}

/**
 * Build the install command for the detected package manager.
 * @param {'npm'|'pnpm'|'yarn'|'bun'} pm
 * @param {string} packageName
 * @returns {string}
 */
function buildInstallCmd(pm, packageName) {
  const spec = `${packageName}@latest`;
  switch (pm) {
    case 'pnpm':
      return `pnpm add ${spec}`;
    case 'yarn':
      return `yarn add ${spec}`;
    case 'bun':
      return `bun add ${spec}`;
    default:
      return `npm install ${spec}`;
  }
}

/**
 * Run the Pro update flow.
 *
 * @param {string} projectRoot
 * @param {Object} [options]
 * @param {boolean} [options.check=false] - Only check, don't update
 * @param {boolean} [options.dryRun=false] - Show plan without executing
 * @param {boolean} [options.force=false] - Force reinstall even if up-to-date
 * @param {boolean} [options.includeCoreUpdate=false] - Also update aiox-core
 * @param {boolean} [options.skipScaffold=false] - Skip re-scaffold after update
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<Object>} Update result
 */
async function updatePro(projectRoot, options = {}) {
  const resolvedProjectRoot = assertValidProjectRoot(projectRoot);
  const {
    check = false,
    dryRun = false,
    force = false,
    includeCoreUpdate = false,
    skipScaffold = false,
    onProgress = () => {},
  } = options;

  const result = {
    success: false,
    previousVersion: null,
    newVersion: null,
    packageName: null,
    packageManager: null,
    coreUpdated: false,
    scaffoldResult: null,
    actions: [],
    error: null,
  };

  // 1. Detect installed Pro
  onProgress('detect', 'Detecting installed Pro...');
  const installed = resolveInstalledPro(resolvedProjectRoot);

  if (!installed) {
    result.error = 'AIOX Pro is not installed. Run: aiox pro setup';
    result.actions.push({ action: 'detect', status: 'not_found' });
    return result;
  }

  result.previousVersion = installed.version;
  result.packageName = installed.packageName;

  // 2. Detect package manager
  const pm = detectPackageManager(resolvedProjectRoot);
  result.packageManager = pm;

  // 3. Query npm for latest version
  onProgress('check', `Checking latest version of ${installed.packageName}...`);
  const latest = await fetchLatestFromNpm(installed.packageName);

  if (!latest || !latest.version) {
    result.error = `Could not reach npm registry for ${installed.packageName}. Check your internet connection.`;
    result.actions.push({ action: 'check', status: 'offline' });
    return result;
  }

  result.newVersion = latest.version;

  // 4. Check if update is needed
  const isUpToDate = installed.version === latest.version;

  if (isUpToDate && !force) {
    result.success = true;
    result.actions.push({ action: 'check', status: 'up_to_date', version: installed.version });

    if (check) {
      return result;
    }

    // Even if up to date, re-scaffold if not skipped (new assets might exist)
    if (!skipScaffold && !dryRun) {
      const scaffolded = await applyScaffoldStep(
        resolvedProjectRoot,
        installed.packagePath,
        result,
        onProgress,
        'AIOX Pro is up to date, but re-scaffolding failed.',
      );
      if (!scaffolded) {
        return result;
      }
    }

    return result;
  }

  result.actions.push({
    action: 'check',
    status: 'update_available',
    from: installed.version,
    to: latest.version,
  });

  // 5. Check compatibility with aiox-core
  const coreVersion = getCoreVersion(resolvedProjectRoot);
  const requiredCore = CORE_PACKAGES.map(
    (packageName) => latest.peerDependencies?.[packageName],
  ).find(Boolean);

  if (requiredCore && coreVersion && !satisfiesPeer(coreVersion, requiredCore)) {
    if (!includeCoreUpdate) {
      result.error = `Pro ${latest.version} requires aiox-core ${requiredCore}, but ${coreVersion} is installed. Run: aiox pro update --include-core`;
      result.actions.push({
        action: 'compat',
        status: 'incompatible',
        required: requiredCore,
        installed: coreVersion,
      });
      return result;
    }
  }

  if (check) {
    result.success = true;
    return result;
  }

  if (dryRun) {
    result.success = true;
    result.actions.push({
      action: 'update',
      status: 'dry_run',
      command: buildInstallCmd(pm, installed.packageName),
    });
    if (includeCoreUpdate) {
      const corePackageName = detectCorePackageName(resolvedProjectRoot) || 'aiox-core';
      result.actions.push({
        action: 'core_update',
        status: 'dry_run',
        command: buildInstallCmd(pm, corePackageName),
      });
    }
    if (!skipScaffold) {
      result.actions.push({ action: 'scaffold', status: 'dry_run' });
    }
    return result;
  }

  // 6. Update core first if requested
  if (includeCoreUpdate) {
    onProgress('core', 'Updating aiox-core...');
    try {
      const corePackageName = detectCorePackageName(resolvedProjectRoot) || 'aiox-core';
      const coreCmd = buildInstallCmd(pm, corePackageName);
      execSync(coreCmd, { cwd: resolvedProjectRoot, stdio: 'pipe', timeout: 120000 });
      result.coreUpdated = true;
      result.actions.push({ action: 'core_update', status: 'done' });
    } catch (err) {
      result.error = `Failed to update aiox-core: ${err.message}`;
      result.actions.push({ action: 'core_update', status: 'failed', error: err.message });
      return result;
    }
  }

  // 7. Update Pro package
  onProgress('update', `Updating ${installed.packageName} to ${latest.version}...`);
  try {
    const cmd = buildInstallCmd(pm, installed.packageName);
    execSync(cmd, { cwd: resolvedProjectRoot, stdio: 'pipe', timeout: 120000 });
    result.actions.push({
      action: 'update',
      status: 'done',
      from: installed.version,
      to: latest.version,
    });
  } catch (err) {
    result.error = `Failed to update ${installed.packageName}: ${err.message}`;
    result.actions.push({ action: 'update', status: 'failed', error: err.message });
    return result;
  }

  // Re-read version after update
  const updatedPro = resolveInstalledPro(resolvedProjectRoot);
  if (updatedPro) {
    result.newVersion = updatedPro.version;
  }

  // 8. Re-scaffold assets
  if (!skipScaffold) {
    const proPath = updatedPro ? updatedPro.packagePath : installed.packagePath;
    const scaffolded = await applyScaffoldStep(
      resolvedProjectRoot,
      proPath,
      result,
      onProgress,
      'AIOX Pro package updated, but re-scaffolding failed.',
    );
    if (!scaffolded) {
      return result;
    }
  }

  result.success = true;
  return result;
}

/**
 * Run the Pro scaffolder after update.
 * @param {string} projectRoot
 * @param {string} proSourceDir
 * @param {Function} onProgress
 * @returns {Promise<Object>}
 */
async function runScaffold(projectRoot, proSourceDir, onProgress) {
  onProgress('scaffold', 'Scaffolding Pro content...');

  try {
    const { scaffoldProContent } = loadInstallerScaffolder();

    return await scaffoldProContent(projectRoot, proSourceDir, {
      onProgress: (progress) => {
        onProgress('scaffold', progress.message);
      },
    });
  } catch (err) {
    return {
      success: false,
      errors: [err.message],
      copiedFiles: [],
      skippedFiles: [],
      warnings: [],
    };
  }
}

/**
 * Format update result for CLI output.
 * @param {Object} result - from updatePro()
 * @returns {string}
 */
function formatUpdateResult(result) {
  const lines = [];

  if (result.error) {
    lines.push(`\n  ❌ ${result.error}\n`);
    return lines.join('\n');
  }

  const checkAction = result.actions.find((a) => a.action === 'check');

  if (checkAction?.status === 'up_to_date') {
    lines.push(`\n  ✅ AIOX Pro is up to date (v${result.previousVersion})`);

    if (result.scaffoldResult) {
      const sr = result.scaffoldResult;
      if (sr.copiedFiles?.length > 0) {
        lines.push(`  📦 ${sr.copiedFiles.length} files synced`);
      }
      if (sr.skippedFiles?.length > 0) {
        lines.push(`  ⏭️  ${sr.skippedFiles.length} files unchanged`);
      }
    }

    lines.push('');
    return lines.join('\n');
  }

  lines.push('\n  🔄 AIOX Pro Update Summary');
  lines.push('  ─────────────────────────');
  lines.push(`  Package:      ${result.packageName}`);
  lines.push(`  Previous:     v${result.previousVersion}`);
  lines.push(`  Updated to:   v${result.newVersion}`);
  lines.push(`  PM:           ${result.packageManager}`);

  if (result.coreUpdated) {
    lines.push('  Core:         Updated');
  }

  if (result.scaffoldResult) {
    const sr = result.scaffoldResult;
    if (sr.copiedFiles?.length > 0) {
      lines.push(`  Files synced: ${sr.copiedFiles.length}`);
    }
    if (sr.skippedFiles?.length > 0) {
      lines.push(`  Unchanged:    ${sr.skippedFiles.length}`);
    }
    if (sr.warnings?.length > 0) {
      for (const w of sr.warnings) {
        lines.push(`  ⚠️  ${w}`);
      }
    }
  }

  // Dry-run summary
  const dryActions = result.actions.filter((a) => a.status === 'dry_run');
  if (dryActions.length > 0) {
    lines.push('\n  📋 Dry-run plan:');
    for (const a of dryActions) {
      if (a.command) {
        lines.push(`     ${a.action}: ${a.command}`);
      } else {
        lines.push(`     ${a.action}: would execute`);
      }
    }
  }

  lines.push('');
  return lines.join('\n');
}

module.exports = {
  updatePro,
  formatUpdateResult,
  resolveInstalledPro,
  detectPackageManager,
  fetchLatestFromNpm,
  getCoreVersion,
  detectCorePackageName,
  satisfiesPeer,
  PRO_PACKAGE,
};
