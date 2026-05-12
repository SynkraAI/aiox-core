/**
 * Migration Rollback Module
 *
 * Handles rollback from v4.0.4 back to v2.0 structure using backup.
 *
 * @module cli/commands/migrate/rollback
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v4.0.4
 */

const fs = require('fs');
const path = require('path');
const { findLatestBackup, verifyBackup, copyFileWithMetadata } = require('./backup');
const { clearMigrationState } = require('./execute');

/**
 * Remove v4.0.4 module directories
 * @param {string} aioxCoreDir - Path to .aiox-core
 * @param {Object} options - Options
 * @returns {Promise<Object>} Removal result
 */
async function removeV21Structure(aioxCoreDir, options = {}) {
  const { onProgress = () => {} } = options;

  const v21Modules = ['core', 'development', 'product', 'infrastructure'];
  const result = {
    removed: [],
    errors: [],
  };

  onProgress({ phase: 'remove', message: '✓ Removing v4.0.4 structure...' });

  for (const moduleName of v21Modules) {
    const moduleDir = path.join(aioxCoreDir, moduleName);

    if (fs.existsSync(moduleDir)) {
      try {
        await fs.promises.rm(moduleDir, { recursive: true, force: true });
        result.removed.push(moduleDir);
        onProgress({ phase: 'removed', message: `  ✓ Removed ${moduleName}/` });
      } catch (error) {
        result.errors.push({
          path: moduleDir,
          error: error.message,
        });
      }
    }
  }

  return result;
}

/**
 * Restore files from backup
 * @param {Object} backup - Backup info from findLatestBackup
 * @param {string} projectRoot - Project root
 * @param {Object} options - Options
 * @returns {Promise<Object>} Restore result
 */
async function restoreFromBackup(backup, projectRoot, options = {}) {
  const { onProgress = () => {}, verifyFirst = true } = options;

  const result = {
    success: false,
    restored: 0,
    errors: [],
    warnings: [],
  };

  // Verify backup integrity first
  if (verifyFirst) {
    onProgress({ phase: 'verify', message: 'Verifying backup integrity...' });

    const verification = await verifyBackup(backup.path);

    if (!verification.valid) {
      result.errors.push({
        type: 'verification',
        message: 'Backup verification failed',
        details: {
          missing: verification.missing,
          failed: verification.failed,
        },
      });
      return result;
    }

    onProgress({ phase: 'verified', message: `  ✓ Verified ${verification.verified} files` });
  }

  const aioxCoreDir = path.join(projectRoot, '.aiox-core');
  const backupAioxCoreDir = path.join(backup.path, '.aiox-core');

  // Restore .aiox-core files
  onProgress({ phase: 'restore', message: '✓ Restoring v2.0 files...' });

  for (const file of backup.manifest.files) {
    try {
      const sourcePath = file.isConfig
        ? path.join(backup.path, file.relativePath)
        : path.join(backupAioxCoreDir, file.relativePath);

      const targetPath = file.isConfig
        ? path.join(projectRoot, file.relativePath)
        : path.join(aioxCoreDir, file.relativePath);

      await copyFileWithMetadata(sourcePath, targetPath);
      result.restored++;

    } catch (error) {
      result.errors.push({
        file: file.relativePath,
        error: error.message,
      });
    }
  }

  onProgress({ phase: 'restored', message: `  ✓ Restored ${result.restored} files` });

  result.success = result.errors.length === 0;

  return result;
}

/**
 * Execute full rollback operation
 * @param {string} projectRoot - Project root
 * @param {Object} options - Options
 * @returns {Promise<Object>} Rollback result
 */
async function executeRollback(projectRoot, options = {}) {
  const { onProgress = () => {}, backupPath = null } = options;

  const result = {
    success: false,
    backup: null,
    removal: null,
    restore: null,
    errors: [],
  };

  // Find backup
  onProgress({ phase: 'find', message: 'Looking for backup...' });

  let backup;

  if (backupPath) {
    // Use specified backup
    const manifestPath = path.join(backupPath, 'backup-manifest.json');

    if (!fs.existsSync(manifestPath)) {
      result.errors.push({ type: 'backup', message: `No manifest found at ${backupPath}` });
      return result;
    }

    const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
    backup = { path: backupPath, manifest };

  } else {
    // Find latest backup
    backup = await findLatestBackup(projectRoot);

    if (!backup) {
      result.errors.push({ type: 'backup', message: 'No backup found. Cannot rollback.' });
      return result;
    }
  }

  result.backup = {
    path: backup.path,
    date: backup.manifest?.created,
    files: backup.manifest?.totalFiles,
    size: backup.manifest?.totalSize,
  };

  onProgress({
    phase: 'found',
    message: `Found backup: ${path.basename(backup.path)}`,
    details: {
      created: backup.manifest?.created,
      files: backup.manifest?.totalFiles,
    },
  });

  // Step 1: Remove v4.0.4 structure
  const aioxCoreDir = path.join(projectRoot, '.aiox-core');
  result.removal = await removeV21Structure(aioxCoreDir, { onProgress });

  if (result.removal.errors.length > 0) {
    result.errors.push(...result.removal.errors);
    // Continue anyway - partial removal is okay
  }

  // Step 2: Restore from backup
  result.restore = await restoreFromBackup(backup, projectRoot, { onProgress });

  if (!result.restore.success) {
    result.errors.push(...result.restore.errors);
    return result;
  }

  // Step 3: Clear migration state
  await clearMigrationState(projectRoot);

  // Step 4: Validate restored structure
  onProgress({ phase: 'validate', message: '✓ Validating restored structure...' });

  // Simple validation - check a few expected directories exist
  const expectedDirs = ['agents', 'tasks', 'registry'];
  let validCount = 0;

  for (const dir of expectedDirs) {
    if (fs.existsSync(path.join(aioxCoreDir, dir))) {
      validCount++;
    }
  }

  if (validCount >= 2) {
    onProgress({ phase: 'complete', message: '✅ Rollback complete!' });
    result.success = true;
  } else {
    result.warnings = result.warnings || [];
    result.warnings.push('Restored structure may be incomplete');
  }

  return result;
}

/**
 * Generate rollback summary output
 * @param {Object} result - Rollback result
 * @returns {string} Formatted summary
 */
function formatRollbackSummary(result) {
  const lines = [];

  lines.push('');
  lines.push('🔙 AIOX Migration Rollback');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (result.backup) {
    lines.push('');
    lines.push(`Backup: ${path.basename(result.backup.path)}`);
    if (result.backup.date) {
      lines.push(`  Created: ${new Date(result.backup.date).toLocaleString()}`);
    }
    if (result.backup.files) {
      lines.push(`  Files: ${result.backup.files}`);
    }
  }

  if (result.success) {
    lines.push('');
    lines.push('✅ Rollback complete!');
    lines.push('');
    lines.push('Your project is now at v2.0 state.');
  } else {
    lines.push('');
    lines.push('⚠️  Rollback completed with issues:');

    for (const error of result.errors || []) {
      if (error.message) {
        lines.push(`  • ${error.message}`);
      } else {
        lines.push(`  • ${JSON.stringify(error)}`);
      }
    }
  }

  if (result.restore) {
    lines.push('');
    lines.push(`Restored: ${result.restore.restored} files`);
  }

  if (result.removal?.removed?.length > 0) {
    lines.push(`Removed: ${result.removal.removed.length} v4.0.4 directories`);
  }

  return lines.join('\n');
}

/**
 * Check if rollback is possible
 * @param {string} projectRoot - Project root
 * @returns {Promise<Object>} Rollback status
 */
async function canRollback(projectRoot) {
  const backup = await findLatestBackup(projectRoot);

  if (!backup) {
    return {
      canRollback: false,
      reason: 'No backup found',
    };
  }

  const verification = await verifyBackup(backup.path);

  if (!verification.valid) {
    return {
      canRollback: false,
      reason: 'Backup verification failed',
      details: verification,
    };
  }

  return {
    canRollback: true,
    backup: {
      path: backup.path,
      date: backup.manifest?.created,
      files: backup.manifest?.totalFiles,
    },
  };
}

module.exports = {
  removeV21Structure,
  restoreFromBackup,
  executeRollback,
  formatRollbackSummary,
  canRollback,
};
