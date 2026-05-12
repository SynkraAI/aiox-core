/**
 * Migration Validation Module
 *
 * Validates migrated structure and runs post-migration checks.
 *
 * @module cli/commands/migrate/validate
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v4.0.4
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { MODULE_MAPPING } = require('./analyze');
const { verifyImports } = require('./update-imports');
// formatSize available but currently unused
// const { formatSize } = require('./analyze');

/**
 * Validate the v4.0.4 module structure exists
 * @param {string} aioxCoreDir - Path to .aiox-core
 * @returns {Promise<Object>} Validation result
 */
async function validateStructure(aioxCoreDir) {
  const result = {
    valid: true,
    modules: {},
    errors: [],
    warnings: [],
  };

  const expectedModules = ['core', 'development', 'product', 'infrastructure'];

  for (const moduleName of expectedModules) {
    const moduleDir = path.join(aioxCoreDir, moduleName);
    const moduleResult = {
      exists: false,
      fileCount: 0,
      totalSize: 0,
      hasExpectedDirs: true,
      missingDirs: [],
    };

    if (fs.existsSync(moduleDir)) {
      moduleResult.exists = true;

      // Count files
      const files = await countFiles(moduleDir);
      moduleResult.fileCount = files.count;
      moduleResult.totalSize = files.size;

      // Check expected subdirectories
      const expectedDirs = MODULE_MAPPING[moduleName]?.directories || [];
      for (const dir of expectedDirs) {
        const dirPath = path.join(moduleDir, dir);
        if (!fs.existsSync(dirPath)) {
          moduleResult.missingDirs.push(dir);
          moduleResult.hasExpectedDirs = false;
        }
      }

      if (moduleResult.missingDirs.length > 0) {
        result.warnings.push({
          module: moduleName,
          message: `Missing expected directories: ${moduleResult.missingDirs.join(', ')}`,
        });
      }
    } else {
      result.warnings.push({
        module: moduleName,
        message: `Module directory not found: ${moduleName}/`,
      });
    }

    result.modules[moduleName] = moduleResult;
  }

  // Check for leftover v2.0 directories at root level
  const rootEntries = await fs.promises.readdir(aioxCoreDir, { withFileTypes: true });

  for (const entry of rootEntries) {
    if (entry.isDirectory() && !expectedModules.includes(entry.name)) {
      // Check if this is a v2.0 directory that should have been migrated
      for (const config of Object.values(MODULE_MAPPING)) {
        if (config.directories.includes(entry.name)) {
          result.warnings.push({
            type: 'leftover',
            message: `Leftover v2.0 directory found: ${entry.name}/ (should be in module)`,
          });
        }
      }
    }
  }

  return result;
}

/**
 * Count files and total size in a directory
 * @param {string} dir - Directory path
 * @returns {Promise<Object>} File count and total size
 */
async function countFiles(dir) {
  let count = 0;
  let size = 0;

  async function walk(d) {
    const entries = await fs.promises.readdir(d, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(d, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        count++;
        const stats = await fs.promises.stat(fullPath);
        size += stats.size;
      }
    }
  }

  await walk(dir);

  return { count, size };
}

/**
 * Run lint check on migrated files
 * @param {string} projectRoot - Project root
 * @param {Object} options - Options
 * @returns {Promise<Object>} Lint result
 */
async function runLintCheck(projectRoot, options = {}) {
  const { timeout = 60000 } = options;

  return new Promise((resolve) => {
    const result = {
      ran: false,
      passed: false,
      errors: 0,
      warnings: 0,
      output: '',
      error: null,
    };

    // Check if package.json has lint script
    const packageJsonPath = path.join(projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      result.error = 'No package.json found';
      resolve(result);
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.scripts?.lint) {
      result.error = 'No lint script found in package.json';
      resolve(result);
      return;
    }

    result.ran = true;

    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : '/bin/sh';
    const shellArgs = isWindows ? ['/c', 'npm run lint'] : ['-c', 'npm run lint'];

    const child = spawn(shell, shellArgs, {
      cwd: projectRoot,
      timeout,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      result.output = stdout + stderr;
      result.passed = code === 0;

      // Try to parse error/warning counts from output
      const errorMatch = result.output.match(/(\d+)\s*error/i);
      const warningMatch = result.output.match(/(\d+)\s*warning/i);

      if (errorMatch) result.errors = parseInt(errorMatch[1], 10);
      if (warningMatch) result.warnings = parseInt(warningMatch[1], 10);

      resolve(result);
    });

    child.on('error', (err) => {
      result.error = err.message;
      resolve(result);
    });
  });
}

/**
 * Run test suite
 * @param {string} projectRoot - Project root
 * @param {Object} options - Options
 * @returns {Promise<Object>} Test result
 */
async function runTests(projectRoot, options = {}) {
  const { timeout = 300000 } = options; // 5 min default for tests

  return new Promise((resolve) => {
    const result = {
      ran: false,
      success: false,
      total: 0,
      passed: 0,
      failed: 0,
      output: '',
      error: null,
    };

    // Check if package.json has test script
    const packageJsonPath = path.join(projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      result.error = 'No package.json found';
      resolve(result);
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.scripts?.test) {
      result.error = 'No test script found in package.json';
      resolve(result);
      return;
    }

    result.ran = true;

    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : '/bin/sh';
    const shellArgs = isWindows ? ['/c', 'npm test'] : ['-c', 'npm test'];

    const child = spawn(shell, shellArgs, {
      cwd: projectRoot,
      timeout,
      env: { ...process.env, CI: 'true' }, // Disable watch mode
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      result.output = stdout + stderr;
      result.passed = code === 0;

      // Try to parse test counts from output (Jest format)
      const passedMatch = result.output.match(/(\d+)\s*passed/i);
      const failedMatch = result.output.match(/(\d+)\s*failed/i);
      const totalMatch = result.output.match(/Tests:\s*(\d+)/i);

      if (passedMatch) result.passedCount = parseInt(passedMatch[1], 10);
      if (failedMatch) result.failed = parseInt(failedMatch[1], 10);
      if (totalMatch) result.total = parseInt(totalMatch[1], 10);

      resolve(result);
    });

    child.on('error', (err) => {
      result.error = err.message;
      resolve(result);
    });
  });
}

/**
 * Run full validation suite after migration
 * @param {string} projectRoot - Project root
 * @param {Object} options - Options
 * @returns {Promise<Object>} Full validation result
 */
async function runFullValidation(projectRoot, options = {}) {
  const { onProgress = () => {}, skipTests = false, skipLint = false } = options;
  const aioxCoreDir = path.join(projectRoot, '.aiox-core');

  const result = {
    valid: true,
    structure: null,
    imports: null,
    lint: null,
    tests: null,
    summary: {
      passed: [],
      failed: [],
      skipped: [],
    },
  };

  // Validate structure
  onProgress({ phase: 'structure', message: '✓ Validating structure...' });
  result.structure = await validateStructure(aioxCoreDir);

  if (result.structure.errors.length > 0) {
    result.valid = false;
    result.summary.failed.push('Structure validation');
  } else {
    result.summary.passed.push('Structure validation');
  }

  // Verify imports
  onProgress({ phase: 'imports', message: '✓ Verifying imports...' });
  result.imports = await verifyImports(aioxCoreDir);

  if (!result.imports.valid) {
    result.valid = false;
    result.summary.failed.push('Import verification');
  } else {
    result.summary.passed.push('Import verification');
  }

  // Run lint
  if (!skipLint) {
    onProgress({ phase: 'lint', message: '✓ Running lint...' });
    result.lint = await runLintCheck(projectRoot);

    if (result.lint.ran) {
      if (result.lint.passed) {
        result.summary.passed.push(`Lint (${result.lint.errors} errors)`);
      } else {
        result.valid = false;
        result.summary.failed.push(`Lint (${result.lint.errors} errors)`);
      }
    } else {
      result.summary.skipped.push('Lint (no script)');
    }
  } else {
    result.summary.skipped.push('Lint (skipped)');
  }

  // Run tests
  if (!skipTests) {
    onProgress({ phase: 'tests', message: '✓ Running tests...' });
    result.tests = await runTests(projectRoot);

    if (result.tests.ran) {
      if (result.tests.passed) {
        result.summary.passed.push(`Tests (${result.tests.passedCount || 'all'} passed)`);
      } else {
        result.valid = false;
        result.summary.failed.push(`Tests (${result.tests.failed} failed)`);
      }
    } else {
      result.summary.skipped.push('Tests (no script)');
    }
  } else {
    result.summary.skipped.push('Tests (skipped)');
  }

  return result;
}

/**
 * Generate migration summary report
 * @param {Object} migrationResult - Result from executeMigration
 * @param {Object} validationResult - Result from runFullValidation
 * @param {Object} options - Options
 * @returns {string} Formatted summary
 */
function generateSummary(migrationResult, validationResult, options = {}) {
  const { backupLocation = null, duration = null } = options;

  const lines = [];

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (validationResult?.valid !== false) {
    lines.push('✅ Migration complete!' + (duration ? ` (${duration})` : ''));
  } else {
    lines.push('⚠️  Migration completed with issues');
  }

  lines.push('');
  lines.push('Summary:');
  lines.push(`  • Files migrated: ${migrationResult.totalFiles}`);

  if (migrationResult.modules) {
    for (const [name, data] of Object.entries(migrationResult.modules)) {
      if (data.files > 0) {
        lines.push(`    - ${name}: ${data.files} files`);
      }
    }
  }

  if (validationResult?.imports) {
    lines.push(`  • Imports verified: ${validationResult.imports.totalImports}`);
  }

  if (backupLocation) {
    lines.push(`  • Backup location: ${backupLocation}`);
  }

  if (validationResult?.summary) {
    if (validationResult.summary.passed.length > 0) {
      lines.push('');
      lines.push('Passed:');
      for (const item of validationResult.summary.passed) {
        lines.push(`  ✓ ${item}`);
      }
    }

    if (validationResult.summary.failed.length > 0) {
      lines.push('');
      lines.push('Failed:');
      for (const item of validationResult.summary.failed) {
        lines.push(`  ✗ ${item}`);
      }
    }
  }

  lines.push('');
  lines.push('Next steps:');
  lines.push('  1. Test your project: npm test');
  lines.push('  2. Review changes: git diff');
  lines.push('  3. Report issues: github.com/aiox/issues');
  lines.push('');
  lines.push('To rollback: aiox migrate --rollback');

  return lines.join('\n');
}

module.exports = {
  validateStructure,
  countFiles,
  runLintCheck,
  runTests,
  runFullValidation,
  generateSummary,
};
