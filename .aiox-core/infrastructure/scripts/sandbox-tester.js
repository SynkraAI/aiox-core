const fs = require('fs').promises;
const path = require('path');
let execa;
try {
  execa = require('execa').execa;
} catch {
  execa = null;
}
let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = { blue: s => s, green: s => s, red: s => s, yellow: s => s };
}
let tmp;
try {
  tmp = require('tmp-promise');
} catch {
  tmp = null;
}

/**
 * SandboxTester - Test improvements in isolated environment
 *
 * Refactored to use execa for cross-platform compatibility
 */
class SandboxTester {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.keepSandbox = options.keepSandbox || false;
    this.sandboxPath = null;
  }

  /**
   * Create isolated sandbox environment
   */
  async createSandbox() {
    try {
      if (!tmp) {
        throw new Error('tmp-promise module not available - install with: npm install tmp-promise');
      }
      const tmpDir = await tmp.dir({ unsafeCleanup: !this.keepSandbox });
      this.sandboxPath = tmpDir.path;

      if (this.verbose) {
        console.log(chalk.blue(`Sandbox created: ${this.sandboxPath}`));
      }

      return this.sandboxPath;
    } catch (error) {
      throw new Error(`Failed to create sandbox: ${error.message}`);
    }
  }

  /**
   * Copy project files to sandbox
   */
  async copyProject(sourcePath, options = {}) {
    const { exclude = ['node_modules', '.git', 'dist', 'build'] } = options;

    try {
      if (!this.sandboxPath) {
        await this.createSandbox();
      }

      // Get list of files to copy
      const files = await this.getProjectFiles(sourcePath, exclude);

      // Copy files maintaining structure
      for (const file of files) {
        const relativePath = path.relative(sourcePath, file);
        const destPath = path.join(this.sandboxPath, relativePath);

        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(file, destPath);
      }

      if (this.verbose) {
        console.log(chalk.green(`Copied ${files.length} files to sandbox`));
      }

      return files.length;
    } catch (error) {
      throw new Error(`Failed to copy project: ${error.message}`);
    }
  }

  /**
   * Get list of project files excluding specified patterns
   */
  async getProjectFiles(rootPath, exclude = []) {
    const files = [];

    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(rootPath, fullPath);

        // Check if excluded
        const isExcluded = exclude.some(pattern =>
          relativePath.includes(pattern) || entry.name === pattern,
        );

        if (isExcluded) continue;

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }

    await walk(rootPath);
    return files;
  }

  /**
   * Apply improvement to sandbox
   */
  async applyImprovement(improvement) {
    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      const { files, changes } = improvement;

      // Apply file changes
      for (const change of changes) {
        const filePath = path.join(this.sandboxPath, change.file);

        if (change.type === 'create') {
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, change.content);
        } else if (change.type === 'modify') {
          await fs.writeFile(filePath, change.content);
        } else if (change.type === 'delete') {
          await fs.unlink(filePath);
        }
      }

      if (this.verbose) {
        console.log(chalk.green(`Applied ${changes.length} changes to sandbox`));
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to apply improvement: ${error.message}`);
    }
  }

  /**
   * Run tests in sandbox
   */
  async runTests(options = {}) {
    const {
      testCommand = 'npm test',
      timeout = 60000,
    } = options;

    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      if (this.verbose) {
        console.log(chalk.blue('Running tests in sandbox...'));
      }

      const output = await this.runCommand(this.sandboxPath, testCommand, { timeout });

      return {
        success: true,
        output,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
      };
    }
  }

  /**
   * Run lint checks in sandbox
   */
  async runLint(options = {}) {
    const {
      lintCommand = 'npm run lint',
      timeout = 30000,
    } = options;

    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      if (this.verbose) {
        console.log(chalk.blue('Running lint in sandbox...'));
      }

      const output = await this.runCommand(this.sandboxPath, lintCommand, { timeout });

      return {
        success: true,
        output,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
      };
    }
  }

  /**
   * Validate improvement before applying
   */
  async validateImprovement(improvement) {
    const validation = {
      success: true,
      errors: [],
      warnings: [],
      checks: {
        syntax: { passed: false, errors: [] },
        structure: { passed: false, errors: [] },
        dependencies: { passed: false, errors: [] },
      },
    };

    try {
      const { files, changes, metadata = {} } = improvement;

      // Check required fields
      if (!changes || !Array.isArray(changes)) {
        validation.success = false;
        validation.errors.push('Missing or invalid changes array');
        return validation;
      }

      // Check affected files exist in sandbox
      const plan = metadata.plan || { affectedFiles: [] };

      // Syntax validation
      for (const file of plan.affectedFiles) {
        const filePath = path.join(this.sandboxPath, file);
        try {
          await execa('node', ['--check', filePath], {
            encoding: 'utf8',
          });
          validation.checks.syntax.passed = true;
        } catch (error) {
          validation.success = false;
          validation.checks.syntax.errors.push({
            file,
            error: error.message,
          });
        }
      }

      // Structure validation
      const requiredDirs = ['src', 'tests'];
      for (const dir of requiredDirs) {
        const dirPath = path.join(this.sandboxPath, dir);
        try {
          await fs.access(dirPath);
          validation.checks.structure.passed = true;
        } catch (error) {
          validation.warnings.push(`Missing directory: ${dir}`);
        }
      }

      // Dependencies validation
      const packageJsonPath = path.join(this.sandboxPath, 'package.json');
      try {
        await fs.access(packageJsonPath);
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(content);

        if (pkg.dependencies || pkg.devDependencies) {
          validation.checks.dependencies.passed = true;
        }
      } catch (error) {
        validation.warnings.push('Could not validate dependencies');
      }

      return validation;
    } catch (error) {
      validation.success = false;
      validation.errors.push(`Validation error: ${error.message}`);
      return validation;
    }
  }

  /**
   * Compare sandbox results with original
   */
  async compareResults(originalPath) {
    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      const comparison = {
        filesChanged: [],
        filesAdded: [],
        filesRemoved: [],
        metrics: {
          original: {},
          sandbox: {},
        },
      };

      // Get file lists
      const originalFiles = await this.getProjectFiles(originalPath);
      const sandboxFiles = await this.getProjectFiles(this.sandboxPath);

      const originalSet = new Set(originalFiles.map(f =>
        path.relative(originalPath, f),
      ));
      const sandboxSet = new Set(sandboxFiles.map(f =>
        path.relative(this.sandboxPath, f),
      ));

      // Find changes
      for (const file of sandboxSet) {
        if (!originalSet.has(file)) {
          comparison.filesAdded.push(file);
        } else {
          const originalContent = await fs.readFile(
            path.join(originalPath, file),
            'utf-8',
          );
          const sandboxContent = await fs.readFile(
            path.join(this.sandboxPath, file),
            'utf-8',
          );

          if (originalContent !== sandboxContent) {
            comparison.filesChanged.push(file);
          }
        }
      }

      for (const file of originalSet) {
        if (!sandboxSet.has(file)) {
          comparison.filesRemoved.push(file);
        }
      }

      // Collect metrics
      comparison.metrics.original = {
        fileCount: originalFiles.length,
      };
      comparison.metrics.sandbox = {
        fileCount: sandboxFiles.length,
      };

      if (this.verbose) {
        console.log(chalk.blue('Comparison results:'));
        console.log(`  Changed: ${comparison.filesChanged.length}`);
        console.log(`  Added: ${comparison.filesAdded.length}`);
        console.log(`  Removed: ${comparison.filesRemoved.length}`);
      }

      return comparison;
    } catch (error) {
      throw new Error(`Failed to compare results: ${error.message}`);
    }
  }

  /**
   * Run full improvement test cycle
   */
  async testImprovement(improvement, options = {}) {
    const {
      runTests = true,
      runLint = true,
      compareWithOriginal = false,
      originalPath = null,
    } = options;

    const results = {
      success: true,
      validation: null,
      tests: null,
      lint: null,
      comparison: null,
      errors: [],
    };

    try {
      // Validate improvement
      results.validation = await this.validateImprovement(improvement);
      if (!results.validation.success) {
        results.success = false;
        results.errors.push('Validation failed');
      }

      // Apply improvement
      await this.applyImprovement(improvement);

      // Run tests
      if (runTests) {
        results.tests = await this.runTests();
        if (!results.tests.success) {
          results.success = false;
          results.errors.push('Tests failed');
        }
      }

      // Run lint
      if (runLint) {
        results.lint = await this.runLint();
        if (!results.lint.success) {
          results.success = false;
          results.errors.push('Lint failed');
        }
      }

      // Compare with original
      if (compareWithOriginal && originalPath) {
        results.comparison = await this.compareResults(originalPath);
      }

      return results;
    } catch (error) {
      results.success = false;
      results.errors.push(error.message);
      return results;
    }
  }

  /**
   * Execute command in sandbox with timeout
   * Refactored to use execa for cross-platform compatibility
   */
  async runCommand(cwd, command, options = {}) {
    const timeout = options.timeout || 30000;

    try {
      // Split command into program and arguments
      const parts = command.split(' ');
      const program = parts[0];
      const args = parts.slice(1);

      const { stdout } = await execa(program, args, {
        cwd,
        shell: true,
        timeout,
        encoding: 'utf8',
        env: { ...process.env, CI: 'true', NODE_ENV: 'test' },
        all: true,
        reject: false,
      });

      if (this.verbose && stdout) {
        process.stdout.write(stdout);
      }

      return stdout || '';
    } catch (error) {
      // Handle timeout
      if (error.timedOut) {
        throw new Error(`Command timed out after ${timeout}ms`);
      }

      // Handle command failure
      if (error.exitCode !== undefined && error.exitCode !== 0) {
        const cmdError = new Error(`Command failed with code ${error.exitCode}`);
        cmdError.stdout = error.stdout || '';
        cmdError.stderr = error.stderr || '';
        throw cmdError;
      }

      // Handle other errors
      throw error;
    }
  }

  /**
   * Clean up sandbox
   */
  async cleanup() {
    try {
      if (this.sandboxPath && !this.keepSandbox) {
        await fs.rm(this.sandboxPath, { recursive: true, force: true });

        if (this.verbose) {
          console.log(chalk.blue('Sandbox cleaned up'));
        }
      }

      this.sandboxPath = null;
    } catch (error) {
      console.error(chalk.red(`Failed to cleanup sandbox: ${error.message}`));
    }
  }

  /**
   * Get sandbox statistics
   */
  async getStats() {
    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      const files = await this.getProjectFiles(this.sandboxPath);

      let totalSize = 0;
      const fileTypes = {};

      for (const file of files) {
        const stats = await fs.stat(file);
        totalSize += stats.size;

        const ext = path.extname(file) || 'no-extension';
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }

      return {
        path: this.sandboxPath,
        fileCount: files.length,
        totalSize,
        fileTypes,
        sizeFormatted: this.formatBytes(totalSize),
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Take snapshot of sandbox state
   */
  async snapshot() {
    try {
      if (!this.sandboxPath) {
        throw new Error('Sandbox not initialized');
      }

      const stats = await this.getStats();
      const files = await this.getProjectFiles(this.sandboxPath);

      const fileContents = {};
      for (const file of files) {
        const relativePath = path.relative(this.sandboxPath, file);
        fileContents[relativePath] = await fs.readFile(file, 'utf-8');
      }

      return {
        timestamp: new Date().toISOString(),
        stats,
        files: fileContents,
      };
    } catch (error) {
      throw new Error(`Failed to create snapshot: ${error.message}`);
    }
  }

  /**
   * Restore sandbox from snapshot
   */
  async restore(snapshot) {
    try {
      if (!this.sandboxPath) {
        await this.createSandbox();
      }

      // Clear sandbox
      const entries = await fs.readdir(this.sandboxPath);
      for (const entry of entries) {
        await fs.rm(path.join(this.sandboxPath, entry), {
          recursive: true,
          force: true,
        });
      }

      // Restore files
      for (const [relativePath, content] of Object.entries(snapshot.files)) {
        const filePath = path.join(this.sandboxPath, relativePath);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
      }

      if (this.verbose) {
        console.log(chalk.green(`Restored ${Object.keys(snapshot.files).length} files`));
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to restore snapshot: ${error.message}`);
    }
  }
}

module.exports = SandboxTester;
