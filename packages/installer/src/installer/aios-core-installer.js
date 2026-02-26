/**
 * AIOS Core Installer Module
 *
 * Story 1.4/1.6: IDE Selection & Environment Configuration
 * Handles copying .aios-core content (agents, tasks, workflows, templates, etc.)
 * to the target project directory.
 *
 * @module installer/aios-core-installer
 */

const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const { hashFile } = require('./file-hasher');

/**
 * Get the path to the source .aios-core directory in the package
 * @returns {string} Absolute path to .aios-core source
 */
function getAiosCoreSourcePath() {
  // Navigate from packages/installer/src/installer/ to project root/.aios-core
  return path.join(__dirname, '..', '..', '..', '..', '.aios-core');
}

/**
 * Folders to copy from .aios-core
 * Includes both v4 modular structure and v2.0 legacy flat structure for compatibility
 * @constant {string[]}
 */
const FOLDERS_TO_COPY = [
  // v4.0.4 Modular Structure (Story 2.15)
  'core',           // Framework utilities, config, registry, migration
  'development',    // Agents, tasks, workflows, scripts, personas
  'product',        // Templates, checklists, cli, api
  'infrastructure', // Hooks, telemetry, integrations, tools

  // v2.0 Legacy Flat Structure (for backwards compatibility)
  'agents',
  'agent-teams',
  'checklists',
  'data',
  'docs',
  'elicitation',
  'scripts',
  'tasks',
  'templates',
  'tools',
  'workflows',

  // Additional directories
  'cli',                    // CLI commands
  'manifests',              // Manifest definitions
  'schemas',                // JSON schemas for validation (*validate-squad, *migrate-squad)
  'workflow-intelligence',  // Workflow intelligence engine (*next, *patterns)
  'monitor',                // Claude Code hooks for monitoring
  'presets',                // Configuration presets
];

/**
 * Root files to copy from .aios-core
 * @constant {string[]}
 */
const ROOT_FILES_TO_COPY = [
  'index.js',
  'index.esm.js',
  'core-config.yaml',   // Core framework configuration
  'package.json',       // Module package definition
  'constitution.md',    // AIOS fundamental principles
  'user-guide.md',
  'working-in-the-brownfield.md',
];

/**
 * Replace {root} placeholder in file content
 * @param {string} content - File content
 * @param {string} rootPath - Replacement path (e.g., '.aios-core')
 * @returns {string} Content with {root} replaced
 */
function replaceRootPlaceholder(content, rootPath = '.aios-core') {
  return content.replace(/\{root\}/g, rootPath);
}

/**
 * Generate file hashes for installed files
 * Story 7.2: Version Tracking
 *
 * @param {string} targetAiosCore - Path to .aios-core directory
 * @param {string[]} installedFiles - List of installed files (relative to .aios-core)
 * @returns {Promise<Object>} Object mapping file paths to their sha256 hashes
 */
async function generateFileHashes(targetAiosCore, installedFiles) {
  const fileHashes = {};

  for (const filePath of installedFiles) {
    const absolutePath = path.join(targetAiosCore, filePath);

    try {
      if (await fs.pathExists(absolutePath)) {
        const stats = await fs.stat(absolutePath);
        if (stats.isFile()) {
          const hash = hashFile(absolutePath);
          fileHashes[filePath] = `sha256:${hash}`;
        }
      }
    } catch (_error) {
      // Skip files that can't be hashed (permissions, etc.)
      continue;
    }
  }

  return fileHashes;
}

/**
 * Generate version.json for installation tracking
 * Story 7.2: Version Tracking - Enables update command to detect changes
 *
 * @param {Object} options - Options
 * @param {string} options.targetAiosCore - Path to .aios-core directory
 * @param {string} options.version - Package version
 * @param {string[]} options.installedFiles - List of installed files
 * @param {string} [options.mode='project-development'] - Installation mode
 * @returns {Promise<Object>} version.json content
 */
async function generateVersionJson(options) {
  const {
    targetAiosCore,
    version,
    installedFiles,
    mode = 'project-development',
  } = options;

  const fileHashes = await generateFileHashes(targetAiosCore, installedFiles);

  const versionJson = {
    version,
    installedAt: new Date().toISOString(),
    mode,
    fileHashes,
    customized: [],
  };

  const versionJsonPath = path.join(targetAiosCore, 'version.json');
  await fs.writeJson(versionJsonPath, versionJson, { spaces: 2 });

  return versionJson;
}

/**
 * Copy a single file with optional {root} replacement
 * @param {string} sourcePath - Source file path
 * @param {string} destPath - Destination file path
 * @param {boolean} replaceRoot - Whether to replace {root} placeholders
 * @returns {Promise<boolean>} Success status
 */
async function copyFileWithRootReplacement(sourcePath, destPath, replaceRoot = true) {
  try {
    await fs.ensureDir(path.dirname(destPath));

    // Check if file needs {root} replacement (.md, .yaml, .yml)
    const ext = path.extname(sourcePath).toLowerCase();
    const needsReplacement = replaceRoot && ['.md', '.yaml', '.yml'].includes(ext);

    if (needsReplacement) {
      const content = await fs.readFile(sourcePath, 'utf8');
      const updatedContent = replaceRootPlaceholder(content, '.aios-core');
      await fs.writeFile(destPath, updatedContent, 'utf8');
    } else {
      await fs.copy(sourcePath, destPath);
    }

    return true;
  } catch (error) {
    console.error(`Failed to copy ${sourcePath}: ${error.message}`);
    return false;
  }
}

/**
 * Copy a directory recursively with {root} replacement
 * @param {string} sourceDir - Source directory path
 * @param {string} destDir - Destination directory path
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string[]>} List of copied files (relative paths)
 */
async function copyDirectoryWithRootReplacement(sourceDir, destDir, onProgress = null) {
  const copiedFiles = [];

  if (!await fs.pathExists(sourceDir)) {
    return copiedFiles;
  }

  await fs.ensureDir(destDir);

  const items = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item.name);
    const destPath = path.join(destDir, item.name);

    // Skip backup files and hidden files (except .gitignore and .session*)
    if (item.name.includes('.backup') ||
        (item.name.startsWith('.') && !item.name.startsWith('.session') && item.name !== '.gitignore')) {
      continue;
    }

    if (item.isDirectory()) {
      const subFiles = await copyDirectoryWithRootReplacement(sourcePath, destPath, onProgress);
      copiedFiles.push(...subFiles);
    } else {
      const success = await copyFileWithRootReplacement(sourcePath, destPath);
      if (success) {
        copiedFiles.push(path.relative(destDir, destPath));
        if (onProgress) {
          onProgress({ file: item.name, copied: true });
        }
      }
    }
  }

  return copiedFiles;
}

/**
 * Install .aios-core content to target directory
 *
 * @param {Object} options - Installation options
 * @param {string} [options.targetDir=process.cwd()] - Target directory
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<Object>} Installation result
 *
 * @example
 * const result = await installAiosCore({ targetDir: '/path/to/project' });
 * console.log(result.installedFiles); // List of installed files
 */
async function installAiosCore(options = {}) {
  const {
    targetDir = process.cwd(),
    onProgress = null,
  } = options;

  const result = {
    success: false,
    installedFiles: [],
    installedFolders: [],
    errors: [],
  };

  const spinner = ora('Installing AIOS core framework...').start();

  try {
    const sourceDir = getAiosCoreSourcePath();
    const targetAiosCore = path.join(targetDir, '.aios-core');

    // Check if source exists
    if (!await fs.pathExists(sourceDir)) {
      throw new Error('.aios-core source directory not found in package');
    }

    // Create target .aios-core directory
    await fs.ensureDir(targetAiosCore);

    // Copy each folder
    for (const folder of FOLDERS_TO_COPY) {
      const folderSource = path.join(sourceDir, folder);
      const folderDest = path.join(targetAiosCore, folder);

      if (await fs.pathExists(folderSource)) {
        spinner.text = `Copying ${folder}...`;

        const copiedFiles = await copyDirectoryWithRootReplacement(
          folderSource,
          folderDest,
          onProgress,
        );

        if (copiedFiles.length > 0) {
          result.installedFolders.push(folder);
          result.installedFiles.push(...copiedFiles.map(f => path.join(folder, f)));
        }
      }
    }

    // Copy root files
    for (const file of ROOT_FILES_TO_COPY) {
      const fileSource = path.join(sourceDir, file);
      const fileDest = path.join(targetAiosCore, file);

      if (await fs.pathExists(fileSource)) {
        spinner.text = `Copying ${file}...`;
        const success = await copyFileWithRootReplacement(fileSource, fileDest);
        if (success) {
          result.installedFiles.push(file);
        }
      }
    }

    // Create install manifest
    spinner.text = 'Creating installation manifest...';
    const packageVersion = require('../../../../package.json').version;
    const manifest = {
      version: packageVersion,
      installed_at: new Date().toISOString(),
      install_type: 'full',
      files: result.installedFiles,
    };

    await fs.writeFile(
      path.join(targetAiosCore, 'install-manifest.yaml'),
      require('js-yaml').dump(manifest),
      'utf8',
    );

    // Story 7.2: Create version.json with file hashes for update tracking
    spinner.text = 'Generating version tracking info...';
    const versionInfo = await generateVersionJson({
      targetAiosCore,
      version: packageVersion,
      installedFiles: result.installedFiles,
      mode: 'project-development',
    });
    result.versionInfo = versionInfo;

    // BUG-2 fix (INS-1): Install .aios-core dependencies after copy
    // The copied .aios-core/package.json has dependencies (js-yaml, execa, etc.)
    // that must be installed for the activation pipeline to work
    // INS-4.12: Track dep install success for bootstrap guard
    const aiosCorePackageJson = path.join(targetAiosCore, 'package.json');
    result.aiosCoreDepsInstalled = false;
    if (await fs.pathExists(aiosCorePackageJson)) {
      spinner.text = 'Installing .aios-core dependencies (js-yaml, fast-glob, etc.)...';
      try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        await execAsync('npm install --production --ignore-scripts', {
          cwd: targetAiosCore,
          timeout: 60000,
        });
        result.aiosCoreDepsInstalled = true;
        spinner.succeed('Installed .aios-core dependencies');
        spinner.start('Finishing installation...');
      } catch (depError) {
        spinner.warn(`Could not install .aios-core dependencies: ${depError.message}`);
        spinner.start('Continuing installation...');
        result.errors.push(`Dependencies warning: ${depError.message}`);
      }
    }

    result.success = true;
    spinner.succeed(`AIOS core installed (${result.installedFiles.length} files)`);

  } catch (error) {
    spinner.fail('AIOS core installation failed');
    result.errors.push(error.message);
    throw error;
  }

  return result;
}

/**
 * Check if package.json exists in target directory
 * @param {string} targetDir - Directory to check
 * @returns {Promise<boolean>} True if package.json exists
 */
async function hasPackageJson(targetDir = process.cwd()) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  return fs.pathExists(packageJsonPath);
}

/**
 * Create a basic package.json for AIOS projects
 * @param {Object} options - Options
 * @param {string} [options.targetDir=process.cwd()] - Target directory
 * @param {string} [options.projectName] - Project name
 * @param {string} [options.projectType='greenfield'] - Project type
 * @returns {Promise<void>}
 */
async function createBasicPackageJson(options = {}) {
  const {
    targetDir = process.cwd(),
    projectName = path.basename(targetDir),
    projectType = 'greenfield',
  } = options;

  const packageJson = {
    name: sanitizePackageName(projectName),
    version: '0.1.0',
    description: `AIOS-powered ${projectType} project`,
    private: true,
    scripts: {
      start: 'echo "Configure your start script"',
      test: 'echo "Configure your test script"',
      lint: 'echo "Configure your lint script"',
    },
    keywords: ['aios', projectType],
    license: 'MIT',
  };

  const packageJsonPath = path.join(targetDir, 'package.json');
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
}

/**
 * Sanitize project name for package.json
 * @param {string} name - Raw project name
 * @returns {string} Sanitized name
 */
function sanitizePackageName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '') || 'my-project';
}

module.exports = {
  installAiosCore,
  hasPackageJson,
  createBasicPackageJson,
  getAiosCoreSourcePath,
  copyFileWithRootReplacement,
  copyDirectoryWithRootReplacement,
  generateVersionJson,
  generateFileHashes,
  FOLDERS_TO_COPY,
  ROOT_FILES_TO_COPY,
};
