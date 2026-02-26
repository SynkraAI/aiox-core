/**
 * Brownfield Upgrader
 * Handles incremental upgrades for existing AIOS-Core installations
 *
 * @module src/installer/brownfield-upgrader
 * @story 6.18 - Dynamic Manifest & Brownfield Upgrade System
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const semver = require('semver');
const { hashFile, hashesMatch } = require('./file-hasher');
const { YamlMerger } = require('../merger/strategies/yaml-merger.js');

/**
 * Upgrade report structure
 * @typedef {Object} UpgradeReport
 * @property {string} sourceVersion - Version being upgraded to
 * @property {string} installedVersion - Currently installed version
 * @property {Object[]} newFiles - Files to be added
 * @property {Object[]} modifiedFiles - Files that changed (framework side)
 * @property {Object[]} userModifiedFiles - Files modified by user (won't overwrite)
 * @property {Object[]} deletedFiles - Files removed from framework
 * @property {boolean} upgradeAvailable - Whether an upgrade is available
 */

/**
 * Load manifest from a given base path
 * @param {string} basePath - Base path to look for manifest
 * @param {string} manifestName - Name of manifest file
 * @returns {Object|null} - Parsed manifest or null
 */
function loadManifest(basePath, manifestName = 'install-manifest.yaml') {
  const manifestPath = path.join(basePath, manifestName);

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error(`Error loading manifest from ${manifestPath}:`, error.message);
    return null;
  }
}

/**
 * Load installed manifest from target project
 * @param {string} targetDir - Target project directory
 * @returns {Object|null} - Installed manifest or null if not found
 */
function loadInstalledManifest(targetDir) {
  return loadManifest(
    path.join(targetDir, '.aios-core'),
    '.installed-manifest.yaml',
  );
}

/**
 * Load source manifest from package
 * @param {string} sourceDir - Source package directory (.aios-core from npm)
 * @returns {Object|null} - Source manifest
 */
function loadSourceManifest(sourceDir) {
  return loadManifest(sourceDir, 'install-manifest.yaml');
}

/**
 * Build file map from manifest for quick lookup
 * @param {Object} manifest - Manifest object
 * @returns {Map<string, Object>} - Map of path -> entry
 */
function buildFileMap(manifest) {
  const map = new Map();
  if (manifest && manifest.files) {
    for (const entry of manifest.files) {
      const normalizedPath = entry.path.replace(/\\/g, '/');
      map.set(normalizedPath, entry);
    }
  }
  return map;
}

/**
 * Check if a file has been modified by the user
 * Compares current file hash against installed manifest hash
 *
 * @param {string} filePath - Absolute path to file
 * @param {string} expectedHash - Hash from installed manifest (with sha256: prefix)
 * @returns {boolean} - True if file was modified by user
 */
function isUserModified(filePath, expectedHash) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const currentHash = `sha256:${hashFile(filePath)}`;
    return !hashesMatch(currentHash, expectedHash);
  } catch {
    // If we can't hash, assume it's modified
    return true;
  }
}

/**
 * Generate upgrade report comparing source and installed manifests
 *
 * @param {Object} sourceManifest - Manifest from source (npm package)
 * @param {Object} installedManifest - Manifest from target installation
 * @param {string} targetDir - Target project directory
 * @returns {UpgradeReport} - Detailed upgrade report
 */
function generateUpgradeReport(sourceManifest, installedManifest, targetDir) {
  const report = {
    sourceVersion: sourceManifest?.version || 'unknown',
    installedVersion: installedManifest?.installed_version || installedManifest?.version || 'unknown',
    newFiles: [],
    modifiedFiles: [],
    userModifiedFiles: [],
    deletedFiles: [],
    unchangedFiles: 0,
    upgradeAvailable: false,
  };

  // Check if upgrade is available via semver
  if (sourceManifest?.version && installedManifest?.installed_version) {
    const sourceVer = semver.coerce(sourceManifest.version);
    const installedVer = semver.coerce(installedManifest.installed_version);

    if (sourceVer && installedVer) {
      report.upgradeAvailable = semver.gt(sourceVer, installedVer);
    }
  } else if (sourceManifest?.version && !installedManifest) {
    // No installed manifest means this is a fresh install scenario
    report.upgradeAvailable = false;
  }

  const sourceMap = buildFileMap(sourceManifest);
  const installedMap = buildFileMap(installedManifest);

  const aiosCoreDir = path.join(targetDir, '.aios-core');

  // Check source files against installed
  for (const [filePath, sourceEntry] of sourceMap) {
    const installedEntry = installedMap.get(filePath);
    const absolutePath = path.join(aiosCoreDir, filePath);

    if (!installedEntry) {
      // New file in source
      report.newFiles.push({
        path: filePath,
        type: sourceEntry.type,
        hash: sourceEntry.hash,
        size: sourceEntry.size,
      });
    } else if (!hashesMatch(sourceEntry.hash, installedEntry.hash)) {
      // File changed in source
      // Check if user modified the local copy
      if (isUserModified(absolutePath, installedEntry.hash)) {
        report.userModifiedFiles.push({
          path: filePath,
          type: sourceEntry.type,
          sourceHash: sourceEntry.hash,
          installedHash: installedEntry.hash,
          reason: 'User modified local file',
        });
      } else {
        report.modifiedFiles.push({
          path: filePath,
          type: sourceEntry.type,
          sourceHash: sourceEntry.hash,
          installedHash: installedEntry.hash,
        });
      }
    } else {
      report.unchangedFiles++;
    }
  }

  // Check for deleted files (in installed but not in source)
  for (const [filePath, installedEntry] of installedMap) {
    if (!sourceMap.has(filePath)) {
      report.deletedFiles.push({
        path: filePath,
        type: installedEntry.type,
        hash: installedEntry.hash,
      });
    }
  }

  return report;
}

/**
 * Apply upgrade to target directory
 *
 * @param {UpgradeReport} report - Upgrade report
 * @param {string} sourceDir - Source directory (npm package .aios-core)
 * @param {string} targetDir - Target project directory
 * @param {Object} options - Upgrade options
 * @param {boolean} options.dryRun - If true, don't actually copy files
 * @param {boolean} options.includeModified - If true, also update modified files
 * @returns {Object} - Result of upgrade operation
 */
async function applyUpgrade(report, sourceDir, targetDir, options = {}) {
  const { dryRun = false, includeModified = true } = options;
  const result = {
    success: true,
    filesInstalled: [],
    filesSkipped: [],
    errors: [],
  };

  const aiosCoreDir = path.join(targetDir, '.aios-core');

  // Ensure .aios-core directory exists
  if (!dryRun) {
    fs.ensureDirSync(aiosCoreDir);
  }

  // Install new files
  for (const file of report.newFiles) {
    const sourcePath = path.join(sourceDir, file.path);
    const targetPath = path.join(aiosCoreDir, file.path);

    try {
      if (!dryRun) {
        fs.ensureDirSync(path.dirname(targetPath));
        fs.copyFileSync(sourcePath, targetPath);
      }
      result.filesInstalled.push({ path: file.path, action: 'new' });
    } catch (error) {
      result.errors.push({ path: file.path, error: error.message });
      result.success = false;
    }
  }

  // Update modified files (if option enabled)
  if (includeModified) {
    for (const file of report.modifiedFiles) {
      const sourcePath = path.join(sourceDir, file.path);
      const targetPath = path.join(aiosCoreDir, file.path);

      try {
        if (!dryRun) {
          fs.ensureDirSync(path.dirname(targetPath));
          fs.copyFileSync(sourcePath, targetPath);
        }
        result.filesInstalled.push({ path: file.path, action: 'updated' });
      } catch (error) {
        result.errors.push({ path: file.path, error: error.message });
        result.success = false;
      }
    }
  }

  // Handle user-modified files: skip most, but smart-merge core-config.yaml
  for (const file of report.userModifiedFiles) {
    if (file.path.endsWith('core-config.yaml')) {
      // Story INS-4.7: Smart merge for core-config.yaml instead of skipping
      let backupPath;
      try {
        const sourcePath = path.join(sourceDir, file.path);
        const targetPath = path.join(aiosCoreDir, file.path);

        if (!dryRun && fs.existsSync(sourcePath) && fs.existsSync(targetPath)) {
          const sourceContent = fs.readFileSync(sourcePath, 'utf8');
          const targetContent = fs.readFileSync(targetPath, 'utf8');

          // Backup before merge
          backupPath = `${targetPath}.backup-${Date.now()}`;
          fs.copyFileSync(targetPath, backupPath);

          const merger = new YamlMerger();
          const mergeResult = await merger.merge(sourceContent, targetContent);

          // Write merged content
          fs.writeFileSync(targetPath, mergeResult.content, 'utf8');

          // Log conflict warnings
          const conflicts = mergeResult.changes.filter(c => c.type === 'conflict');
          if (conflicts.length > 0) {
            result.mergeWarnings = result.mergeWarnings || [];
            for (const conflict of conflicts) {
              result.mergeWarnings.push(
                `core-config.yaml: ${conflict.identifier} — ${conflict.reason}`
              );
            }
          }

          result.filesInstalled.push({
            path: file.path,
            action: 'merged',
            stats: mergeResult.stats,
            backupPath,
          });
        } else if (dryRun) {
          result.filesInstalled.push({ path: file.path, action: 'merge (dry-run)' });
        } else {
          result.filesSkipped.push({
            path: file.path,
            reason: 'User modified - source or target missing for merge',
          });
        }
      } catch (mergeError) {
        // Merge failed — restore backup if exists, skip file
        if (backupPath && fs.existsSync(backupPath)) {
          try {
            const targetPath = path.join(aiosCoreDir, file.path);
            fs.copyFileSync(backupPath, targetPath);
          } catch { /* restore failed — backup file still available */ }
        }
        console.warn(`⚠️  core-config.yaml merge failed: ${mergeError.message}`);
        result.filesSkipped.push({
          path: file.path,
          reason: `Merge failed: ${mergeError.message} — user config preserved`,
        });
      }
    } else {
      result.filesSkipped.push({
        path: file.path,
        reason: 'User modified - preserving local changes',
      });
    }
  }

  // Note: We don't delete files that were removed from source
  // This is intentional to preserve user additions
  for (const file of report.deletedFiles) {
    result.filesSkipped.push({
      path: file.path,
      reason: 'Removed from source - keeping local copy',
    });
  }

  return result;
}

/**
 * Create or update the installed manifest after upgrade
 *
 * @param {string} targetDir - Target project directory
 * @param {Object} sourceManifest - Source manifest that was installed
 * @param {string} sourcePackage - Name and version of source package
 */
function updateInstalledManifest(targetDir, sourceManifest, sourcePackage) {
  const installedManifestPath = path.join(targetDir, '.aios-core', '.installed-manifest.yaml');

  const installedManifest = {
    installed_at: new Date().toISOString(),
    installed_from: sourcePackage,
    installed_version: sourceManifest.version,
    source_manifest_hash: `sha256:${require('./file-hasher').hashString(
      JSON.stringify(sourceManifest.files),
    )}`,
    file_count: sourceManifest.files.length,
    files: sourceManifest.files.map(f => ({
      path: f.path,
      hash: f.hash,
      modified_by_user: false,
    })),
  };

  const yamlContent = yaml.dump(installedManifest, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  const header = `# AIOS-Core Installed Manifest
# This file tracks what was installed from the npm package
# Used for brownfield upgrades to detect changes
# DO NOT EDIT MANUALLY
#
`;

  fs.ensureDirSync(path.dirname(installedManifestPath));
  fs.writeFileSync(installedManifestPath, header + yamlContent, 'utf8');

  return installedManifestPath;
}

/**
 * Check if an upgrade is available
 *
 * @param {string} sourceDir - Source package directory
 * @param {string} targetDir - Target project directory
 * @returns {Object} - { available: boolean, from: string, to: string }
 */
function checkUpgradeAvailable(sourceDir, targetDir) {
  const sourceManifest = loadSourceManifest(sourceDir);
  const installedManifest = loadInstalledManifest(targetDir);

  if (!sourceManifest) {
    return { available: false, error: 'Source manifest not found' };
  }

  if (!installedManifest) {
    return { available: false, reason: 'No installed manifest (fresh install)' };
  }

  const sourceVer = semver.coerce(sourceManifest.version);
  const installedVer = semver.coerce(installedManifest.installed_version);

  if (!sourceVer || !installedVer) {
    return { available: false, error: 'Invalid version numbers' };
  }

  return {
    available: semver.gt(sourceVer, installedVer),
    from: installedManifest.installed_version,
    to: sourceManifest.version,
  };
}

/**
 * Format upgrade report for display
 * @param {UpgradeReport} report - Upgrade report
 * @returns {string} - Formatted report string
 */
function formatUpgradeReport(report) {
  const lines = [];

  lines.push('═'.repeat(60));
  lines.push('AIOS-Core Upgrade Report');
  lines.push('═'.repeat(60));
  lines.push('');
  lines.push(`Current Version: ${report.installedVersion}`);
  lines.push(`Available Version: ${report.sourceVersion}`);
  lines.push(`Upgrade Available: ${report.upgradeAvailable ? 'Yes ✅' : 'No'}`);
  lines.push('');

  if (report.newFiles.length > 0) {
    lines.push(`📁 New Files (${report.newFiles.length}):`);
    for (const file of report.newFiles.slice(0, 10)) {
      lines.push(`   + ${file.path} [${file.type}]`);
    }
    if (report.newFiles.length > 10) {
      lines.push(`   ... and ${report.newFiles.length - 10} more`);
    }
    lines.push('');
  }

  if (report.modifiedFiles.length > 0) {
    lines.push(`📝 Modified Files (${report.modifiedFiles.length}):`);
    for (const file of report.modifiedFiles.slice(0, 10)) {
      lines.push(`   ~ ${file.path} [${file.type}]`);
    }
    if (report.modifiedFiles.length > 10) {
      lines.push(`   ... and ${report.modifiedFiles.length - 10} more`);
    }
    lines.push('');
  }

  if (report.userModifiedFiles.length > 0) {
    lines.push(`⚠️  User Modified (${report.userModifiedFiles.length}) - will be preserved:`);
    for (const file of report.userModifiedFiles.slice(0, 10)) {
      lines.push(`   ⊘ ${file.path}`);
    }
    if (report.userModifiedFiles.length > 10) {
      lines.push(`   ... and ${report.userModifiedFiles.length - 10} more`);
    }
    lines.push('');
  }

  if (report.deletedFiles.length > 0) {
    lines.push(`🗑️  Removed from Source (${report.deletedFiles.length}):`);
    for (const file of report.deletedFiles.slice(0, 5)) {
      lines.push(`   - ${file.path}`);
    }
    if (report.deletedFiles.length > 5) {
      lines.push(`   ... and ${report.deletedFiles.length - 5} more`);
    }
    lines.push('');
  }

  lines.push('─'.repeat(60));
  const totalChanges = report.newFiles.length + report.modifiedFiles.length;
  const totalSkipped = report.userModifiedFiles.length + report.deletedFiles.length;
  lines.push(`Summary: ${totalChanges} files to update, ${totalSkipped} files preserved`);
  lines.push('─'.repeat(60));

  return lines.join('\n');
}

module.exports = {
  loadManifest,
  loadInstalledManifest,
  loadSourceManifest,
  generateUpgradeReport,
  applyUpgrade,
  updateInstalledManifest,
  checkUpgradeAvailable,
  formatUpgradeReport,
  buildFileMap,
  isUserModified,
};
