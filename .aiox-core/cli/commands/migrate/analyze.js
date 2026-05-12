/**
 * Migration Structure Analysis Module
 *
 * Detects v2.0 structure and generates migration plan
 * for v2.0 → v4.0.4 migration.
 *
 * @module cli/commands/migrate/analyze
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v4.0.4
 */

const fs = require('fs');
const path = require('path');
const { getAllFiles } = require('./backup');

/**
 * Module mapping configuration for v2.0 → v4.0.4 migration
 */
const MODULE_MAPPING = {
  core: {
    target: 'core',
    patterns: [
      'registry/**',
      'quality-gates/**',
      'manifest/**',
      'utils/**',
      'elicitation/**',
      'session/**',
      'config/**',
      'mcp/**',
      'data/**',
      'docs/**',
    ],
    directories: ['registry', 'quality-gates', 'manifest', 'utils', 'elicitation', 'session', 'config', 'mcp', 'data', 'docs'],
  },
  development: {
    target: 'development',
    patterns: [
      'agents/**',
      'tasks/**',
      'templates/**',
      'checklists/**',
      'scripts/**',
      'personas/**',
    ],
    directories: ['agents', 'tasks', 'templates', 'checklists', 'scripts', 'personas'],
  },
  product: {
    target: 'product',
    patterns: [
      'cli/**',
      'api/**',
    ],
    directories: ['cli', 'api'],
  },
  infrastructure: {
    target: 'infrastructure',
    patterns: [
      'hooks/**',
      'telemetry/**',
      'integrations/**',
    ],
    directories: ['hooks', 'telemetry', 'integrations'],
  },
};

/**
 * Detect if project is v2.0 structure
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<Object>} Detection result
 */
async function detectV2Structure(projectRoot) {
  const aioxCoreDir = path.join(projectRoot, '.aiox-core');

  if (!fs.existsSync(aioxCoreDir)) {
    return {
      isV2: false,
      isV21: false,
      version: null,
      error: 'No .aiox-core directory found',
    };
  }

  // Check for v4.0.4 modular structure (core, development, product, infrastructure dirs)
  const v21Modules = ['core', 'development', 'product', 'infrastructure'];
  const hasV21Structure = v21Modules.every(module =>
    fs.existsSync(path.join(aioxCoreDir, module)),
  );

  if (hasV21Structure) {
    return {
      isV2: false,
      isV21: true,
      version: '2.1',
      message: 'Project already has v4.0.4 modular structure',
    };
  }

  // Check for v2.0 flat structure
  const v20Indicators = ['agents', 'tasks', 'registry', 'cli'];
  const hasV20Structure = v20Indicators.some(dir =>
    fs.existsSync(path.join(aioxCoreDir, dir)),
  );

  if (hasV20Structure) {
    return {
      isV2: true,
      isV21: false,
      version: '2.0',
      message: 'Project has v2.0 flat structure',
    };
  }

  return {
    isV2: false,
    isV21: false,
    version: null,
    error: 'Unable to detect AIOX version structure',
  };
}

/**
 * Categorize file into target module
 * @param {string} relativePath - Relative path from .aiox-core
 * @returns {string|null} Module name or null
 */
function categorizeFile(relativePath) {
  // Normalize path separators for cross-platform compatibility
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const topDir = normalizedPath.split('/')[0];

  for (const [moduleName, config] of Object.entries(MODULE_MAPPING)) {
    if (config.directories.includes(topDir)) {
      return moduleName;
    }
  }

  // Root level files stay in core
  if (!normalizedPath.includes('/')) {
    return 'core';
  }

  return null;
}

/**
 * Analyze current structure and create migration plan
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Migration plan
 */
async function analyzeMigrationPlan(projectRoot, options = {}) {
  const { verbose: _verbose = false } = options;
  const aioxCoreDir = path.join(projectRoot, '.aiox-core');

  // First detect version
  const versionInfo = await detectV2Structure(projectRoot);

  if (!versionInfo.isV2) {
    return {
      canMigrate: false,
      ...versionInfo,
    };
  }

  // Get all files
  const allFiles = await getAllFiles(aioxCoreDir);

  // Build migration plan
  const plan = {
    canMigrate: true,
    sourceVersion: '2.0',
    targetVersion: '2.1',
    projectRoot,
    aioxCoreDir,
    modules: {
      core: { files: [], size: 0 },
      development: { files: [], size: 0 },
      product: { files: [], size: 0 },
      infrastructure: { files: [], size: 0 },
    },
    uncategorized: [],
    conflicts: [],
    totalFiles: 0,
    totalSize: 0,
    stats: {},
  };

  // Categorize each file
  for (const filePath of allFiles) {
    const relativePath = path.relative(aioxCoreDir, filePath);
    const stats = await fs.promises.stat(filePath);
    const module = categorizeFile(relativePath);

    const fileInfo = {
      sourcePath: filePath,
      relativePath,
      size: stats.size,
    };

    if (module && plan.modules[module]) {
      // Calculate target path
      fileInfo.targetPath = path.join(aioxCoreDir, module, relativePath);
      plan.modules[module].files.push(fileInfo);
      plan.modules[module].size += stats.size;
    } else {
      plan.uncategorized.push(fileInfo);
    }

    plan.totalFiles++;
    plan.totalSize += stats.size;
  }

  // Check for potential conflicts (existing v4.0.4 directories)
  for (const moduleName of Object.keys(plan.modules)) {
    const targetDir = path.join(aioxCoreDir, moduleName);
    if (fs.existsSync(targetDir)) {
      plan.conflicts.push({
        type: 'existing_directory',
        path: targetDir,
        module: moduleName,
      });
    }
  }

  // Generate stats
  plan.stats = {
    core: {
      files: plan.modules.core.files.length,
      size: formatSize(plan.modules.core.size),
    },
    development: {
      files: plan.modules.development.files.length,
      size: formatSize(plan.modules.development.size),
    },
    product: {
      files: plan.modules.product.files.length,
      size: formatSize(plan.modules.product.size),
    },
    infrastructure: {
      files: plan.modules.infrastructure.files.length,
      size: formatSize(plan.modules.infrastructure.size),
    },
    uncategorized: plan.uncategorized.length,
    total: {
      files: plan.totalFiles,
      size: formatSize(plan.totalSize),
    },
  };

  return plan;
}

/**
 * Format byte size to human readable
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Generate printable migration plan table
 * @param {Object} plan - Migration plan
 * @returns {string} Formatted table
 */
function formatMigrationPlan(plan) {
  const lines = [];

  lines.push('Migration Plan:');
  lines.push('┌─────────────────┬───────┬─────────────┐');
  lines.push('│ Module          │ Files │ Size        │');
  lines.push('├─────────────────┼───────┼─────────────┤');

  for (const [moduleName, stats] of Object.entries(plan.stats)) {
    if (moduleName === 'total' || moduleName === 'uncategorized') continue;

    const name = moduleName.padEnd(15);
    const files = String(stats.files).padStart(5);
    const size = stats.size.padStart(11);

    lines.push(`│ ${name} │ ${files} │ ${size} │`);
  }

  lines.push('└─────────────────┴───────┴─────────────┘');
  lines.push(`Total: ${plan.stats.total.files} files, ${plan.stats.total.size}`);

  if (plan.stats.uncategorized > 0) {
    lines.push(`\n⚠️  ${plan.stats.uncategorized} uncategorized files (will be moved to core/)`);
  }

  if (plan.conflicts.length > 0) {
    lines.push('\n⚠️  Potential conflicts detected:');
    for (const conflict of plan.conflicts) {
      lines.push(`   - ${conflict.path}`);
    }
  }

  return lines.join('\n');
}

/**
 * Identify potential import/require paths that need updating
 * @param {Object} plan - Migration plan
 * @returns {Object} Import analysis
 */
function analyzeImports(plan) {
  const importPaths = [];

  for (const [moduleName, moduleData] of Object.entries(plan.modules)) {
    for (const file of moduleData.files) {
      if (file.relativePath.endsWith('.js') || file.relativePath.endsWith('.ts')) {
        importPaths.push({
          file: file.relativePath,
          module: moduleName,
          oldPath: file.relativePath,
          newPath: path.join(moduleName, file.relativePath),
        });
      }
    }
  }

  return {
    totalImportableFiles: importPaths.length,
    byModule: {
      core: importPaths.filter(f => f.module === 'core').length,
      development: importPaths.filter(f => f.module === 'development').length,
      product: importPaths.filter(f => f.module === 'product').length,
      infrastructure: importPaths.filter(f => f.module === 'infrastructure').length,
    },
    files: importPaths,
  };
}

module.exports = {
  MODULE_MAPPING,
  detectV2Structure,
  categorizeFile,
  analyzeMigrationPlan,
  formatSize,
  formatMigrationPlan,
  analyzeImports,
};
