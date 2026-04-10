/**
 * Pro Updater — update @aiox-fullstack/pro (or fallback @aios-fullstack/pro)
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
const { execSync } = require('child_process');

const PRO_PACKAGES = ['@aiox-fullstack/pro', '@aios-fullstack/pro'];

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
      let data = '';
      res.on('data', (c) => { data += c; });
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
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

/**
 * Resolve which Pro package is installed and where.
 * @param {string} projectRoot
 * @returns {{ packageName:string, packagePath:string, version:string }|null}
 */
function resolveInstalledPro(projectRoot) {
  for (const pkg of PRO_PACKAGES) {
    const scope = pkg.split('/')[0].replace('@', '');
    const pkgPath = path.join(projectRoot, 'node_modules', `@${scope}`, 'pro');
    const pkgJson = path.join(pkgPath, 'package.json');

    if (fs.existsSync(pkgJson)) {
      try {
        const data = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
        return { packageName: pkg, packagePath: pkgPath, version: data.version || '0.0.0' };
      } catch { /* corrupt, try next */ }
    }
  }
  return null;
}

/**
 * Get the installed aiox-core version.
 * @param {string} projectRoot
 * @returns {string|null}
 */
function getCoreVersion(projectRoot) {
  const paths = [
    path.join(projectRoot, 'node_modules', 'aiox-core', 'package.json'),
    path.join(projectRoot, 'package.json'),
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (p.endsWith('node_modules/aiox-core/package.json') || data.name === 'aiox-core') {
          return data.version || null;
        }
      } catch { /* skip */ }
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
  const min = range.replace(/[>=^~]/g, '').trim();
  const iParts = installed.split('.').map(Number);
  const mParts = min.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if ((iParts[i] || 0) > (mParts[i] || 0)) return true;
    if ((iParts[i] || 0) < (mParts[i] || 0)) return false;
  }
  return true;
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
    case 'pnpm': return `pnpm add ${spec}`;
    case 'yarn': return `yarn add ${spec}`;
    case 'bun': return `bun add ${spec}`;
    default: return `npm install ${spec}`;
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
  const installed = resolveInstalledPro(projectRoot);

  if (!installed) {
    result.error = 'AIOX Pro is not installed. Run: aiox pro setup';
    result.actions.push({ action: 'detect', status: 'not_found' });
    return result;
  }

  result.previousVersion = installed.version;
  result.packageName = installed.packageName;

  // 2. Detect package manager
  const pm = detectPackageManager(projectRoot);
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
      const scaffoldResult = await runScaffold(projectRoot, installed.packagePath, onProgress);
      result.scaffoldResult = scaffoldResult;
      result.actions.push({ action: 'scaffold', status: scaffoldResult.success ? 'done' : 'failed' });
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
  const coreVersion = getCoreVersion(projectRoot);
  const requiredCore = latest.peerDependencies?.['aiox-core'];

  if (requiredCore && coreVersion && !satisfiesPeer(coreVersion, requiredCore)) {
    if (!includeCoreUpdate) {
      result.error = `Pro ${latest.version} requires aiox-core ${requiredCore}, but ${coreVersion} is installed. Run: aiox pro update --include-core`;
      result.actions.push({ action: 'compat', status: 'incompatible', required: requiredCore, installed: coreVersion });
      return result;
    }
  }

  if (check) {
    result.success = true;
    return result;
  }

  if (dryRun) {
    result.success = true;
    result.actions.push({ action: 'update', status: 'dry_run', command: buildInstallCmd(pm, installed.packageName) });
    if (includeCoreUpdate) {
      result.actions.push({ action: 'core_update', status: 'dry_run', command: buildInstallCmd(pm, 'aiox-core') });
    }
    result.actions.push({ action: 'scaffold', status: 'dry_run' });
    return result;
  }

  // 6. Update core first if requested
  if (includeCoreUpdate) {
    onProgress('core', 'Updating aiox-core...');
    try {
      const coreCmd = buildInstallCmd(pm, 'aiox-core');
      execSync(coreCmd, { cwd: projectRoot, stdio: 'pipe', timeout: 120000 });
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
    execSync(cmd, { cwd: projectRoot, stdio: 'pipe', timeout: 120000 });
    result.actions.push({ action: 'update', status: 'done', from: installed.version, to: latest.version });
  } catch (err) {
    result.error = `Failed to update ${installed.packageName}: ${err.message}`;
    result.actions.push({ action: 'update', status: 'failed', error: err.message });
    return result;
  }

  // Re-read version after update
  const updatedPro = resolveInstalledPro(projectRoot);
  if (updatedPro) {
    result.newVersion = updatedPro.version;
  }

  // 8. Re-scaffold assets
  if (!skipScaffold) {
    const proPath = updatedPro ? updatedPro.packagePath : installed.packagePath;
    const scaffoldResult = await runScaffold(projectRoot, proPath, onProgress);
    result.scaffoldResult = scaffoldResult;
    result.actions.push({ action: 'scaffold', status: scaffoldResult.success ? 'done' : 'failed' });
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
    const scaffolderPath = path.join(__dirname, '..', '..', '..', 'packages', 'installer', 'src', 'pro', 'pro-scaffolder');
    const { scaffoldProContent } = require(scaffolderPath);

    return await scaffoldProContent(projectRoot, proSourceDir, {
      onProgress: (progress) => {
        onProgress('scaffold', progress.message);
      },
    });
  } catch (err) {
    return { success: false, errors: [err.message], copiedFiles: [], skippedFiles: [], warnings: [] };
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

  const checkAction = result.actions.find(a => a.action === 'check');

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
  const dryActions = result.actions.filter(a => a.status === 'dry_run');
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
  satisfiesPeer,
  PRO_PACKAGES,
};
