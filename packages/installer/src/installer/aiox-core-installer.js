/**
 * AIOX Core Installer Module
 *
 * Story 1.4/1.6: IDE Selection & Environment Configuration
 * Handles copying .aiox-core content (agents, tasks, workflows, templates, etc.)
 * to the target project directory.
 *
 * @module installer/aiox-core-installer
 */

const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const { hashFile } = require('./file-hasher');
const { loadSourceManifest, updateInstalledManifest } = require('./brownfield-upgrader');
const { getAioxCoreVersion, resolveAioxCorePath } = require('../utils/package-paths');

/**
 * Get the path to the source .aiox-core directory in the package
 * @returns {string} Absolute path to .aiox-core source
 */
function getAioxCoreSourcePath() {
  return resolveAioxCorePath('.aiox-core');
}

/**
 * Folders to copy from .aiox-core
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
 * Root files to copy from .aiox-core
 * @constant {string[]}
 */
const ROOT_FILES_TO_COPY = [
  'index.js',
  'index.esm.js',
  'core-config.yaml',   // Core framework configuration
  'package.json',       // Module package definition
  'constitution.md',    // AIOX fundamental principles
  'user-guide.md',
  'working-in-the-brownfield.md',
];

const BROWNFIELD_PRESERVE_PATTERNS = [
  /^core-config\.yaml$/,
  /^development\/agents\/[^/]+\/MEMORY\.md$/,
];

function isBrownfieldProjectType(projectType = '') {
  const normalized = String(projectType).toLowerCase();
  return normalized === 'brownfield' || normalized === 'existing_aiox' || normalized === 'existing-aiox';
}

function shouldPreserveExistingFile(relativePath, options = {}) {
  if (!options.preserveExisting) {
    return false;
  }

  return BROWNFIELD_PRESERVE_PATTERNS.some((pattern) => pattern.test(relativePath));
}

function extractManifestFileHashes(manifest) {
  if (!manifest || !Array.isArray(manifest.files)) {
    return {};
  }

  const fileHashes = {};
  for (const entry of manifest.files) {
    if (entry && entry.path && entry.hash) {
      fileHashes[entry.path] = entry.hash;
    }
  }

  return fileHashes;
}

async function copyManifestArtifacts(sourceDir, targetAioxCore) {
  const manifestPath = path.join(sourceDir, 'install-manifest.yaml');
  const signaturePath = manifestPath + '.minisig';
  const targetSignaturePath = path.join(targetAioxCore, 'install-manifest.yaml.minisig');

  if (await fs.pathExists(manifestPath)) {
    await fs.copy(manifestPath, path.join(targetAioxCore, 'install-manifest.yaml'), {
      overwrite: true,
    });
  }

  if (await fs.pathExists(signaturePath)) {
    await fs.copy(signaturePath, targetSignaturePath, {
      overwrite: true,
    });
  } else if (await fs.pathExists(targetSignaturePath)) {
    await fs.remove(targetSignaturePath);
  }
}

/**
 * Replace {root} placeholder in file content
 * @param {string} content - File content
 * @param {string} rootPath - Replacement path (e.g., '.aiox-core')
 * @returns {string} Content with {root} replaced
 */
function replaceRootPlaceholder(content, rootPath = '.aiox-core') {
  return content.replace(/\{root\}/g, rootPath);
}

/**
 * Generate file hashes for installed files
 * Story 7.2: Version Tracking
 *
 * @param {string} targetAioxCore - Path to .aiox-core directory
 * @param {string[]} installedFiles - List of installed files (relative to .aiox-core)
 * @returns {Promise<Object>} Object mapping file paths to their sha256 hashes
 */
async function generateFileHashes(targetAioxCore, installedFiles) {
  const fileHashes = {};

  for (const filePath of installedFiles) {
    const absolutePath = path.join(targetAioxCore, filePath);

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
 * @param {string} options.targetAioxCore - Path to .aiox-core directory
 * @param {string} options.version - Package version
 * @param {string[]} options.installedFiles - List of installed files
 * @param {string} [options.mode='project-development'] - Installation mode
 * @returns {Promise<Object>} version.json content
 */
async function generateVersionJson(options) {
  const {
    targetAioxCore,
    version,
    installedFiles,
    mode = 'project-development',
    fileHashes: providedFileHashes = null,
  } = options;

  const fileHashes = providedFileHashes || await generateFileHashes(targetAioxCore, installedFiles);

  const versionJson = {
    version,
    installedAt: new Date().toISOString(),
    mode,
    fileHashes,
    customized: [],
  };

  const versionJsonPath = path.join(targetAioxCore, 'version.json');
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
async function copyFileWithRootReplacement(sourcePath, destPath, replaceRoot = true, options = {}) {
  try {
    if (options.relativePath && shouldPreserveExistingFile(options.relativePath, options)) {
      if (await fs.pathExists(destPath)) {
        return { copied: false, preserved: true, relativePath: options.relativePath };
      }
    }

    await fs.ensureDir(path.dirname(destPath));

    // Check if file needs {root} replacement (.md, .yaml, .yml)
    const ext = path.extname(sourcePath).toLowerCase();
    const needsReplacement = replaceRoot && ['.md', '.yaml', '.yml'].includes(ext);

    if (needsReplacement) {
      const content = await fs.readFile(sourcePath, 'utf8');
      const updatedContent = replaceRootPlaceholder(content, '.aiox-core');
      await fs.writeFile(destPath, updatedContent, 'utf8');
    } else {
      await fs.copy(sourcePath, destPath);
    }

    return { copied: true, preserved: false, relativePath: options.relativePath || null };
  } catch (error) {
    console.error(`Failed to copy ${sourcePath}: ${error.message}`);
    return { copied: false, preserved: false, relativePath: options.relativePath || null };
  }
}

/**
 * Copy a directory recursively with {root} replacement
 * @param {string} sourceDir - Source directory path
 * @param {string} destDir - Destination directory path
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string[]>} List of copied files (relative paths)
 */
async function copyDirectoryWithRootReplacement(sourceDir, destDir, onProgress = null, options = {}) {
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
      const subFiles = await copyDirectoryWithRootReplacement(sourcePath, destPath, onProgress, {
        ...options,
        baseDir: options.baseDir || destDir,
      });
      copiedFiles.push(...subFiles);
    } else {
      const baseDir = options.baseDir || destDir;
      const relativePath = path.relative(baseDir, destPath).replace(/\\/g, '/');
      const fullRelativePath = options.pathPrefix
        ? path.posix.join(options.pathPrefix, relativePath)
        : relativePath;
      const result = await copyFileWithRootReplacement(sourcePath, destPath, true, {
        ...options,
        relativePath: fullRelativePath,
      });
      if (result.copied) {
        copiedFiles.push(relativePath);
        if (onProgress) {
          onProgress({ file: item.name, copied: true });
        }
      } else if (result.preserved && onProgress) {
        onProgress({ file: item.name, copied: false, preserved: true });
      }
    }
  }

  return copiedFiles;
}

/**
 * Install .aiox-core content to target directory
 *
 * @param {Object} options - Installation options
 * @param {string} [options.targetDir=process.cwd()] - Target directory
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<Object>} Installation result
 *
 * @example
 * const result = await installAioxCore({ targetDir: '/path/to/project' });
 * console.log(result.installedFiles); // List of installed files
 */
async function installAioxCore(options = {}) {
  const {
    targetDir = process.cwd(),
    onProgress = null,
    projectType = 'greenfield',
    sourceDir: providedSourceDir = null,
    packageVersion: providedPackageVersion = null,
  } = options;

  const result = {
    success: false,
    installedFiles: [],
    installedFolders: [],
    errors: [],
  };

  const spinner = ora('Installing AIOX core framework...').start();

  try {
    const sourceDir = providedSourceDir || getAioxCoreSourcePath();
    const targetAioxCore = path.join(targetDir, '.aiox-core');
    const preserveExisting = isBrownfieldProjectType(projectType);

    // Check if source exists
    if (!await fs.pathExists(sourceDir)) {
      throw new Error('.aiox-core source directory not found in package');
    }

    // Create target .aiox-core directory
    await fs.ensureDir(targetAioxCore);

    // Copy each folder
    for (const folder of FOLDERS_TO_COPY) {
      const folderSource = path.join(sourceDir, folder);
      const folderDest = path.join(targetAioxCore, folder);

      if (await fs.pathExists(folderSource)) {
        spinner.text = `Copying ${folder}...`;

        const copiedFiles = await copyDirectoryWithRootReplacement(
          folderSource,
          folderDest,
          onProgress,
          {
            baseDir: folderDest,
            pathPrefix: folder,
            preserveExisting,
          },
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
      const fileDest = path.join(targetAioxCore, file);

      if (await fs.pathExists(fileSource)) {
        spinner.text = `Copying ${file}...`;
        const relativePath = file;
        const copyResult = await copyFileWithRootReplacement(fileSource, fileDest, true, {
          relativePath,
          preserveExisting,
        });
        if (copyResult.copied) {
          result.installedFiles.push(file);
        }
      }
    }

    const sourceManifest = loadSourceManifest(sourceDir);
    const manifestFileHashes = extractManifestFileHashes(sourceManifest);
    const packageVersion = providedPackageVersion || getAioxCoreVersion();

    spinner.text = 'Copying installation manifest...';
    await copyManifestArtifacts(sourceDir, targetAioxCore);
    if (!sourceManifest) {
      const manifest = {
        version: packageVersion,
        installed_at: new Date().toISOString(),
        install_type: 'full',
        files: result.installedFiles,
      };

      await fs.writeFile(
        path.join(targetAioxCore, 'install-manifest.yaml'),
        require('js-yaml').dump(manifest),
        'utf8',
      );
    }

    // Story 7.2: Create version.json with file hashes for update tracking
    spinner.text = 'Generating version tracking info...';
    const versionInfo = await generateVersionJson({
      targetAioxCore,
      version: packageVersion,
      installedFiles: result.installedFiles,
      mode: 'project-development',
      fileHashes: Object.keys(manifestFileHashes).length > 0 ? manifestFileHashes : null,
    });
    result.versionInfo = versionInfo;

    if (sourceManifest) {
      updateInstalledManifest(targetDir, sourceManifest, `aiox-core@${packageVersion}`);
    }

    // BUG-2 fix (INS-1): Install .aiox-core dependencies after copy
    // The copied .aiox-core/package.json has dependencies (js-yaml, execa, etc.)
    // that must be installed for the activation pipeline to work
    // INS-4.12: Track dep install success for bootstrap guard
    const aioxCorePackageJson = path.join(targetAioxCore, 'package.json');
    result.aioxCoreDepsInstalled = false;
    if (await fs.pathExists(aioxCorePackageJson)) {
      spinner.text = 'Installing .aiox-core dependencies (js-yaml, fast-glob, etc.)...';
      try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        await execAsync('npm install --production --ignore-scripts', {
          cwd: targetAioxCore,
          timeout: 60000,
        });
        result.aioxCoreDepsInstalled = true;
        spinner.succeed('Installed .aiox-core dependencies');
        spinner.start('Finishing installation...');
      } catch (depError) {
        spinner.warn(`Could not install .aiox-core dependencies: ${depError.message}`);
        spinner.start('Continuing installation...');
        result.errors.push(`Dependencies warning: ${depError.message}`);
      }
    }

    result.success = true;
    spinner.succeed(`AIOX core installed (${result.installedFiles.length} files)`);

  } catch (error) {
    spinner.fail('AIOX core installation failed');
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
 * Link project-level node_modules to the framework dependency install when the
 * project has no node_modules of its own. This lets root-level squad scripts
 * resolve framework dependencies such as js-yaml after Pro scaffolding.
 *
 * @param {Object} options - Options
 * @param {string} [options.targetDir=process.cwd()] - Project root directory
 * @param {string} [options.targetAioxCore] - Installed .aiox-core directory
 * @returns {Promise<Object>} Link result
 */
async function ensureProjectNodeModulesLink(options = {}) {
  const {
    targetDir = process.cwd(),
    targetAioxCore = path.join(targetDir, '.aiox-core'),
  } = options;

  const projectNodeModules = path.join(targetDir, 'node_modules');
  const frameworkNodeModules = path.join(targetAioxCore, 'node_modules');

  if (await fs.pathExists(projectNodeModules)) {
    return {
      success: true,
      linked: false,
      reason: 'project-node-modules-exists',
      path: projectNodeModules,
    };
  }

  if (!(await fs.pathExists(frameworkNodeModules))) {
    return {
      success: false,
      linked: false,
      reason: 'framework-node-modules-missing',
      path: projectNodeModules,
      target: frameworkNodeModules,
    };
  }

  const linkTarget = process.platform === 'win32'
    ? frameworkNodeModules
    : path.relative(targetDir, frameworkNodeModules) || frameworkNodeModules;
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';

  try {
    await fs.symlink(linkTarget, projectNodeModules, linkType);
    return {
      success: true,
      linked: true,
      path: projectNodeModules,
      target: frameworkNodeModules,
    };
  } catch (error) {
    return {
      success: false,
      linked: false,
      reason: 'link-failed',
      path: projectNodeModules,
      target: frameworkNodeModules,
      error: error.message,
    };
  }
}

/**
 * Create a basic package.json for AIOX projects
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
    description: `AIOX-powered ${projectType} project`,
    private: true,
    scripts: {
      start: 'echo "Configure your start script"',
      test: 'echo "Configure your test script"',
      lint: 'echo "Configure your lint script"',
    },
    keywords: ['aiox', projectType],
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
  installAioxCore,
  hasPackageJson,
  ensureProjectNodeModulesLink,
  createBasicPackageJson,
  getAioxCoreSourcePath,
  copyFileWithRootReplacement,
  copyDirectoryWithRootReplacement,
  generateVersionJson,
  generateFileHashes,
  FOLDERS_TO_COPY,
  ROOT_FILES_TO_COPY,
};
