/**
 * Migration Execution Module
 *
 * Executes the migration from v2.0 → v4.0.4 structure.
 *
 * @module cli/commands/migrate/execute
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v4.0.4
 */

const fs = require('fs');
const path = require('path');
const { copyFileWithMetadata } = require('./backup');
const { MODULE_MAPPING } = require('./analyze');

/**
 * Create module directories for v4.0.4 structure
 * @param {string} aioxCoreDir - Path to .aiox-core
 * @param {Object} options - Options
 * @returns {Promise<Object>} Created directories
 */
async function createModuleDirectories(aioxCoreDir, options = {}) {
  const { onProgress = () => {} } = options;
  const modules = Object.keys(MODULE_MAPPING);
  const created = [];

  onProgress({ phase: 'directories', message: 'Creating module directories...' });

  for (const moduleName of modules) {
    const moduleDir = path.join(aioxCoreDir, moduleName);

    if (!fs.existsSync(moduleDir)) {
      await fs.promises.mkdir(moduleDir, { recursive: true });
      created.push(moduleDir);
      onProgress({ phase: 'directory', message: `  ✓ Created ${moduleName}/` });
    }
  }

  return { created, modules };
}

/**
 * Migrate files for a single module
 * @param {Object} moduleData - Module data from migration plan
 * @param {string} moduleName - Module name
 * @param {string} aioxCoreDir - Path to .aiox-core
 * @param {Object} options - Options
 * @returns {Promise<Object>} Migration result
 */
async function migrateModule(moduleData, moduleName, aioxCoreDir, options = {}) {
  const { verbose = false, onProgress = () => {}, dryRun = false } = options;

  const result = {
    module: moduleName,
    migratedFiles: [],
    errors: [],
    totalSize: 0,
  };

  const moduleDir = path.join(aioxCoreDir, moduleName);

  for (const file of moduleData.files) {
    try {
      // Calculate target path within the module
      const targetPath = path.join(moduleDir, file.relativePath);

      if (dryRun) {
        result.migratedFiles.push({
          source: file.sourcePath,
          target: targetPath,
          size: file.size,
          dryRun: true,
        });
      } else {
        // Actually copy the file
        await copyFileWithMetadata(file.sourcePath, targetPath);

        result.migratedFiles.push({
          source: file.sourcePath,
          target: targetPath,
          size: file.size,
        });
      }

      result.totalSize += file.size;

      if (verbose) {
        onProgress({
          phase: 'file',
          message: `    → ${file.relativePath}`,
        });
      }
    } catch (error) {
      result.errors.push({
        file: file.relativePath,
        error: error.message,
      });
    }
  }

  return result;
}

/**
 * Execute full migration from v2.0 to v4.0.4
 * @param {Object} plan - Migration plan from analyzeMigrationPlan
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Migration result
 */
async function executeMigration(plan, options = {}) {
  const {
    verbose = false,
    dryRun = false,
    onProgress = () => {},
    cleanupOriginals = true,
  } = options;

  if (!plan.canMigrate) {
    return {
      success: false,
      error: plan.error || plan.message,
    };
  }

  const result = {
    success: true,
    dryRun,
    modules: {},
    totalFiles: 0,
    totalSize: 0,
    errors: [],
    cleanedUp: [],
  };

  // Phase 1: Create module directories
  if (!dryRun) {
    await createModuleDirectories(plan.aioxCoreDir, { onProgress });
  }

  // Phase 2: Migrate each module
  const moduleNames = ['core', 'development', 'product', 'infrastructure'];

  for (const moduleName of moduleNames) {
    const moduleData = plan.modules[moduleName];

    if (moduleData.files.length === 0) {
      result.modules[moduleName] = {
        files: 0,
        size: 0,
        skipped: true,
      };
      continue;
    }

    onProgress({
      phase: 'module',
      message: `✓ Migrating ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} module (${moduleData.files.length} files)`,
    });

    const moduleResult = await migrateModule(
      moduleData,
      moduleName,
      plan.aioxCoreDir,
      { verbose, onProgress, dryRun },
    );

    result.modules[moduleName] = {
      files: moduleResult.migratedFiles.length,
      size: moduleResult.totalSize,
      errors: moduleResult.errors,
    };

    result.totalFiles += moduleResult.migratedFiles.length;
    result.totalSize += moduleResult.totalSize;

    if (moduleResult.errors.length > 0) {
      result.errors.push(...moduleResult.errors);
    }
  }

  // Handle uncategorized files (move to core/)
  if (plan.uncategorized.length > 0 && !dryRun) {
    onProgress({
      phase: 'uncategorized',
      message: `Handling ${plan.uncategorized.length} uncategorized files...`,
    });

    for (const file of plan.uncategorized) {
      try {
        const targetPath = path.join(plan.aioxCoreDir, 'core', file.relativePath);
        await copyFileWithMetadata(file.sourcePath, targetPath);
        result.totalFiles++;
        result.totalSize += file.size;
      } catch (error) {
        result.errors.push({
          file: file.relativePath,
          error: error.message,
        });
      }
    }
  }

  // Phase 3: Cleanup original files (if not dry run and enabled)
  if (!dryRun && cleanupOriginals) {
    onProgress({ phase: 'cleanup', message: 'Cleaning up original locations...' });

    // Get directories that should be removed (now nested in modules)
    const dirsToCleanup = new Set();

    for (const [_moduleName, config] of Object.entries(MODULE_MAPPING)) {
      for (const dir of config.directories) {
        const originalDir = path.join(plan.aioxCoreDir, dir);
        if (fs.existsSync(originalDir)) {
          dirsToCleanup.add(originalDir);
        }
      }
    }

    for (const dir of dirsToCleanup) {
      try {
        // Check this is not a module directory itself
        const dirName = path.basename(dir);
        if (!['core', 'development', 'product', 'infrastructure'].includes(dirName)) {
          await fs.promises.rm(dir, { recursive: true });
          result.cleanedUp.push(dir);
        }
      } catch (error) {
        // Non-fatal: cleanup errors are logged but don't fail migration
        result.errors.push({
          type: 'cleanup',
          path: dir,
          error: error.message,
        });
      }
    }
  }

  // Final status
  result.success = result.errors.filter(e => e.type !== 'cleanup').length === 0;

  return result;
}

/**
 * Create a migration state file to track progress
 * @param {string} projectRoot - Project root
 * @param {Object} state - Migration state
 */
async function saveMigrationState(projectRoot, state) {
  const statePath = path.join(projectRoot, '.aiox-migration-state.json');
  await fs.promises.writeFile(statePath, JSON.stringify({
    ...state,
    timestamp: new Date().toISOString(),
  }, null, 2));
}

/**
 * Load migration state if exists
 * @param {string} projectRoot - Project root
 * @returns {Object|null} Migration state or null
 */
async function loadMigrationState(projectRoot) {
  const statePath = path.join(projectRoot, '.aiox-migration-state.json');

  if (fs.existsSync(statePath)) {
    const content = await fs.promises.readFile(statePath, 'utf8');
    return JSON.parse(content);
  }

  return null;
}

/**
 * Clear migration state file
 * @param {string} projectRoot - Project root
 */
async function clearMigrationState(projectRoot) {
  const statePath = path.join(projectRoot, '.aiox-migration-state.json');

  if (fs.existsSync(statePath)) {
    await fs.promises.unlink(statePath);
  }
}

module.exports = {
  createModuleDirectories,
  migrateModule,
  executeMigration,
  saveMigrationState,
  loadMigrationState,
  clearMigrationState,
};
