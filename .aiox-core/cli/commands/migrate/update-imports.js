/**
 * Import Path Update Module
 *
 * Scans and updates require/import paths after migration.
 *
 * @module cli/commands/migrate/update-imports
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v4.0.4
 */

const fs = require('fs');
const path = require('path');
const { MODULE_MAPPING, categorizeFile } = require('./analyze');

/**
 * Regex patterns for import detection
 */
const IMPORT_PATTERNS = {
  // require('./path') or require('../path')
  commonjs: /require\s*\(\s*['"`](\.[^'"`]+)['"`]\s*\)/g,

  // import from './path' or import from '../path'
  esm: /from\s+['"`](\.[^'"`]+)['"`]/g,

  // import('./path') dynamic imports
  dynamicImport: /import\s*\(\s*['"`](\.[^'"`]+)['"`]\s*\)/g,

  // /// <reference path="./path" />
  tsReference: /\/\/\/\s*<reference\s+path=['"`](\.[^'"`]+)['"`]\s*\/>/g,
};

/**
 * Build path transformation map for the migration
 * @param {Object} plan - Migration plan
 * @returns {Map<string, string>} Old path to new path map
 */
function buildPathTransformMap(plan) {
  const transformMap = new Map();

  for (const [moduleName, moduleData] of Object.entries(plan.modules)) {
    for (const file of moduleData.files) {
      // Store both with and without extension
      const oldPath = file.relativePath;
      const newPath = path.join(moduleName, file.relativePath);

      transformMap.set(oldPath, newPath);

      // Also store without .js extension for require compatibility
      if (oldPath.endsWith('.js')) {
        const noExt = oldPath.slice(0, -3);
        const newNoExt = newPath.slice(0, -3);
        transformMap.set(noExt, newNoExt);
      }
    }
  }

  return transformMap;
}

/**
 * Scan a file for import statements
 * @param {string} filePath - Path to file
 * @returns {Promise<Object[]>} Array of import info
 */
async function scanFileImports(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  const imports = [];

  for (const [patternName, pattern] of Object.entries(IMPORT_PATTERNS)) {
    // Reset regex lastIndex
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push({
        type: patternName,
        fullMatch: match[0],
        importPath: match[1],
        index: match.index,
        length: match[0].length,
      });
    }
  }

  return imports;
}

/**
 * Transform an import path from v2.0 to v4.0.4 structure
 * @param {string} importPath - Original import path
 * @param {string} currentFileModule - Module of the file containing the import
 * @param {string} currentFilePath - Path of the file containing the import
 * @param {Map} transformMap - Path transformation map
 * @returns {string|null} Transformed path or null if no change needed
 */
function transformImportPath(importPath, currentFileModule, currentFilePath, transformMap) {
  // Resolve the import path relative to the current file
  const currentDir = path.dirname(currentFilePath);
  const resolvedPath = path.normalize(path.join(currentDir, importPath));

  // Check if this path needs transformation
  // We need to detect if it's pointing to a file that moved

  // For paths starting with ../, they might reference files now in different modules
  if (importPath.startsWith('../') || importPath.startsWith('./')) {
    // This is a complex transformation - need to figure out what file it's importing
    // and where that file now lives

    // For now, we'll use heuristics:
    // 1. If the path goes up to .aiox-core root and then into a folder, update it

    const parts = importPath.split('/');
    let upCount = 0;
    const restParts = [];

    for (const part of parts) {
      if (part === '..') {
        upCount++;
      } else if (part !== '.') {
        restParts.push(part);
      }
    }

    // If going up enough to reach .aiox-core root
    if (restParts.length > 0) {
      const targetDir = restParts[0];

      // Find which module this directory belongs to
      for (const [moduleName, config] of Object.entries(MODULE_MAPPING)) {
        if (config.directories.includes(targetDir)) {
          // This needs to be updated to go through the module directory
          // New path: go up, then into module, then the rest

          // Calculate how to get from current location to target
          const newParts = [];

          // From current file's module directory
          // Current structure after migration: .aiox-core/{module}/...
          // Need to go to: .aiox-core/{targetModule}/...

          if (currentFileModule === moduleName) {
            // Same module, just adjust the path
            return importPath; // No change needed within same module
          } else {
            // Different module, need to go up and into the other module
            // Example: from development/agents/ to core/registry/
            // Need: ../../core/registry/...

            const currentDepth = currentFilePath.split(path.sep).length - 1;
            const ups = '../'.repeat(currentDepth + 1); // +1 to get out of module dir

            return `${ups}${moduleName}/${restParts.join('/')}`;
          }
        }
      }
    }
  }

  return null; // No transformation needed
}

/**
 * Update imports in a single file
 * @param {string} filePath - Path to file
 * @param {Map} transformMap - Path transformation map
 * @param {string} fileModule - Module this file belongs to
 * @param {Object} options - Options
 * @returns {Promise<Object>} Update result
 */
async function updateFileImports(filePath, transformMap, fileModule, options = {}) {
  const { dryRun = false, verbose = false } = options;

  const result = {
    file: filePath,
    imports: [],
    updated: 0,
    unchanged: 0,
    errors: [],
  };

  try {
    let content = await fs.promises.readFile(filePath, 'utf8');
    const originalContent = content;
    const imports = await scanFileImports(filePath);

    for (const imp of imports) {
      const relativePath = path.relative(
        path.dirname(filePath).split('.aiox-core')[1]?.slice(1) || '',
        '',
      );

      const newPath = transformImportPath(
        imp.importPath,
        fileModule,
        filePath,
        transformMap,
      );

      if (newPath && newPath !== imp.importPath) {
        // Replace in content
        const oldStatement = imp.fullMatch;
        const newStatement = oldStatement.replace(imp.importPath, newPath);

        content = content.replace(oldStatement, newStatement);

        result.imports.push({
          old: imp.importPath,
          new: newPath,
          type: imp.type,
        });
        result.updated++;
      } else {
        result.unchanged++;
      }
    }

    // Write updated content if changes were made
    if (content !== originalContent && !dryRun) {
      await fs.promises.writeFile(filePath, content, 'utf8');
    }

    result.modified = content !== originalContent;

  } catch (error) {
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Scan and update all imports in the migrated structure
 * @param {string} aioxCoreDir - Path to .aiox-core
 * @param {Object} plan - Migration plan
 * @param {Object} options - Options
 * @returns {Promise<Object>} Update results
 */
async function updateAllImports(aioxCoreDir, plan, options = {}) {
  const { verbose = false, dryRun = false, onProgress = () => {} } = options;

  const transformMap = buildPathTransformMap(plan);

  const result = {
    totalFiles: 0,
    filesModified: 0,
    importsUpdated: 0,
    errors: [],
    details: [],
  };

  onProgress({ phase: 'scan', message: 'Scanning for import statements...' });

  // Process each module
  const modules = ['core', 'development', 'product', 'infrastructure'];

  for (const moduleName of modules) {
    const moduleDir = path.join(aioxCoreDir, moduleName);

    if (!fs.existsSync(moduleDir)) continue;

    // Get all JS/TS files in module
    const files = await getJsFiles(moduleDir);

    for (const file of files) {
      result.totalFiles++;

      const updateResult = await updateFileImports(
        file,
        transformMap,
        moduleName,
        { dryRun, verbose },
      );

      if (updateResult.modified) {
        result.filesModified++;
      }

      result.importsUpdated += updateResult.updated;

      if (updateResult.errors.length > 0) {
        result.errors.push(...updateResult.errors.map(e => ({
          file,
          error: e,
        })));
      }

      if (verbose && updateResult.updated > 0) {
        result.details.push(updateResult);
        onProgress({
          phase: 'file',
          message: `  → ${path.relative(aioxCoreDir, file)} (${updateResult.updated} imports)`,
        });
      }
    }
  }

  onProgress({
    phase: 'complete',
    message: `Found ${result.importsUpdated} imports to update`,
  });

  return result;
}

/**
 * Get all JavaScript/TypeScript files in a directory recursively
 * @param {string} dir - Directory path
 * @param {string[]} [files] - Accumulated files
 * @returns {Promise<string[]>} Array of file paths
 */
async function getJsFiles(dir, files = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await getJsFiles(fullPath, files);
    } else if (/\.(js|ts|mjs|cjs|jsx|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Verify no broken imports exist after migration
 * @param {string} aioxCoreDir - Path to .aiox-core
 * @returns {Promise<Object>} Verification result
 */
async function verifyImports(aioxCoreDir) {
  const result = {
    valid: true,
    totalImports: 0,
    brokenImports: [],
    warnings: [],
  };

  const modules = ['core', 'development', 'product', 'infrastructure'];

  for (const moduleName of modules) {
    const moduleDir = path.join(aioxCoreDir, moduleName);

    if (!fs.existsSync(moduleDir)) continue;

    const files = await getJsFiles(moduleDir);

    for (const file of files) {
      const imports = await scanFileImports(file);

      for (const imp of imports) {
        result.totalImports++;

        // Try to resolve the import
        if (imp.importPath.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(file), imp.importPath);

          // Check various extensions
          const extensions = ['', '.js', '.ts', '.json', '/index.js', '/index.ts'];
          let found = false;

          for (const ext of extensions) {
            if (fs.existsSync(resolvedPath + ext)) {
              found = true;
              break;
            }
          }

          if (!found) {
            result.brokenImports.push({
              file: path.relative(aioxCoreDir, file),
              import: imp.importPath,
              type: imp.type,
              resolvedPath,
            });
            result.valid = false;
          }
        }
      }
    }
  }

  return result;
}

module.exports = {
  IMPORT_PATTERNS,
  buildPathTransformMap,
  scanFileImports,
  transformImportPath,
  updateFileImports,
  updateAllImports,
  getJsFiles,
  verifyImports,
};
