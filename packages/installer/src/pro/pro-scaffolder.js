/**
 * Pro Content Scaffolder
 *
 * Copies premium content (squads, configs, feature registry) from
 * node_modules/@aiox-fullstack/pro/ into the user's project after
 * license activation.
 *
 * @module packages/installer/src/pro/pro-scaffolder
 * @story INS-3.1 — Implement Pro Content Scaffolder
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { hashFileAsync, hashFilesMatchAsync } = require('../installer/file-hasher');

/**
 * Directories excluded from scaffolding (private/internal squads).
 */
const SCAFFOLD_EXCLUDES = [
  'mmos-squad',
];

/**
 * Items to scaffold from pro package into user project.
 * Each entry defines source (relative to proSourceDir) and dest (relative to targetDir).
 */
const SCAFFOLD_ITEMS = [
  {
    type: 'directory',
    source: 'squads',
    dest: 'squads',
    description: 'Pro squads',
    required: true,
  },
  {
    type: 'file',
    source: 'pro-config.yaml',
    dest: path.join('.aiox-core', 'pro-config.yaml'),
    description: 'Pro configuration',
    required: true,
  },
  {
    type: 'file',
    source: 'feature-registry.yaml',
    dest: path.join('.aiox-core', 'feature-registry.yaml'),
    description: 'Feature registry',
    required: false,
  },
];

/**
 * Scaffold pro content into user project.
 *
 * @param {string} targetDir - Project root directory
 * @param {string} proSourceDir - Path to pro package content (node_modules/@aiox-fullstack/pro)
 * @param {Object} [options={}] - Scaffold options
 * @param {Function} [options.onProgress] - Progress callback ({item, status, message})
 * @param {boolean} [options.force=false] - Force overwrite even if content exists
 * @returns {Promise<Object>} Scaffold result with copiedFiles, warnings, manifest
 */
async function scaffoldProContent(targetDir, proSourceDir, options = {}) {
  const { onProgress = null, force = false } = options;

  const result = {
    success: false,
    copiedFiles: [],
    skippedFiles: [],
    warnings: [],
    errors: [],
    manifest: null,
    versionInfo: null,
  };

  // Track files for rollback on partial failure
  const rollbackFiles = [];

  // Validate pro source exists
  if (!await fs.pathExists(proSourceDir)) {
    result.errors.push(
      `Pro package not found at ${proSourceDir}. Run "npm install @aiox-fullstack/pro" first.`
    );
    return result;
  }

  try {
    for (const item of SCAFFOLD_ITEMS) {
      const sourcePath = path.join(proSourceDir, item.source);
      const destPath = path.join(targetDir, item.dest);

      // Check source exists
      if (!await fs.pathExists(sourcePath)) {
        if (item.required) {
          throw new Error(`Required pro content not found: ${item.source}`);
        }
        const warning = `${item.description} (${item.source}) not found in pro package — skipping`;
        result.warnings.push(warning);
        if (onProgress) {
          onProgress({ item: item.source, status: 'warning', message: warning });
        }
        continue;
      }

      if (item.type === 'directory') {
        const copied = await scaffoldDirectory(sourcePath, destPath, { force, rollbackFiles, baseDir: targetDir });
        result.copiedFiles.push(...copied.copiedFiles);
        result.skippedFiles.push(...copied.skippedFiles);
      } else {
        const copied = await scaffoldFile(sourcePath, destPath, { force, rollbackFiles, baseDir: targetDir });
        if (copied.skipped) {
          result.skippedFiles.push(copied.relativePath);
        } else {
          result.copiedFiles.push(copied.relativePath);
        }
      }

      if (onProgress) {
        onProgress({ item: item.source, status: 'done', message: `${item.description} scaffolded` });
      }
    }

    // Merge pro-config into core-config
    const merged = await mergeProConfig(targetDir);
    if (merged && onProgress) {
      onProgress({ item: 'pro-config', status: 'done', message: 'Pro config merged into core-config.yaml' });
    }

    // Install squad agent commands to IDEs
    const commandsResult = await installSquadCommands(targetDir);
    if (commandsResult.installed > 0) {
      result.copiedFiles.push(...commandsResult.files);
      if (onProgress) {
        onProgress({ item: 'squad-commands', status: 'done',
          message: `${commandsResult.installed} squad agent commands installed` });
      }
    }

    // Generate pro-version.json (AC4)
    const versionInfo = await generateProVersionJson(targetDir, proSourceDir, result.copiedFiles);
    result.versionInfo = versionInfo;
    result.copiedFiles.push('pro-version.json');
    rollbackFiles.push(path.join(targetDir, 'pro-version.json'));

    // Generate pro-installed-manifest.yaml (AC8)
    const manifest = await generateInstalledManifest(targetDir, result.copiedFiles);
    result.manifest = manifest;
    result.copiedFiles.push('pro-installed-manifest.yaml');
    rollbackFiles.push(path.join(targetDir, 'pro-installed-manifest.yaml'));

    result.success = true;

  } catch (error) {
    result.errors.push(error.message);

    // Rollback partially copied files (AC6)
    const rollbackResult = await rollbackScaffold(rollbackFiles);
    if (rollbackResult.errors.length > 0) {
      result.errors.push(`Rollback errors: ${rollbackResult.errors.join(', ')}`);
    }
    result.warnings.push(
      `Scaffolding failed: ${error.message}. ${rollbackResult.removed} files cleaned up.`
    );
  }

  return result;
}

/**
 * Scaffold a directory recursively with idempotency checks.
 *
 * @param {string} sourceDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {Object} options - Options
 * @returns {Promise<Object>} Result with copiedFiles and skippedFiles
 */
async function scaffoldDirectory(sourceDir, destDir, options = {}) {
  const { force = false, rollbackFiles = [], baseDir } = options;
  const copiedFiles = [];
  const skippedFiles = [];

  await fs.ensureDir(destDir);

  const items = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const item of items) {
    // Skip excluded directories (e.g. private squads)
    if (SCAFFOLD_EXCLUDES.includes(item.name)) {
      continue;
    }

    const sourcePath = path.join(sourceDir, item.name);
    const destPath = path.join(destDir, item.name);

    if (item.isDirectory()) {
      const sub = await scaffoldDirectory(sourcePath, destPath, options);
      copiedFiles.push(...sub.copiedFiles);
      skippedFiles.push(...sub.skippedFiles);
    } else {
      const result = await scaffoldFile(sourcePath, destPath, { force, rollbackFiles, baseDir });
      if (result.skipped) {
        skippedFiles.push(result.relativePath);
      } else {
        copiedFiles.push(result.relativePath);
      }
    }
  }

  return { copiedFiles, skippedFiles };
}

/**
 * Scaffold a single file with idempotency (AC5).
 * If dest exists and has identical hash, skip. If user modified, skip (preserve).
 *
 * @param {string} sourcePath - Source file path
 * @param {string} destPath - Destination file path
 * @param {Object} options - Options
 * @returns {Promise<Object>} Result with relativePath and skipped flag
 */
async function scaffoldFile(sourcePath, destPath, options = {}) {
  const { force = false, rollbackFiles = [], baseDir } = options;
  const base = baseDir || path.resolve(destPath, '..', '..');
  const relativePath = path.relative(base, destPath).replace(/\\/g, '/');

  // Idempotency check (AC5) — async to avoid blocking event loop
  if (!force && await fs.pathExists(destPath)) {
    try {
      if (await hashFilesMatchAsync(sourcePath, destPath)) {
        // Identical — skip
        return { relativePath, skipped: true };
      }
    } catch {
      // Hash comparison failed — overwrite to be safe
    }
  }

  await fs.ensureDir(path.dirname(destPath));
  await fs.copy(sourcePath, destPath);
  rollbackFiles.push(destPath);

  return { relativePath, skipped: false };
}

/**
 * Generate pro-version.json with SHA256 hashes for version tracking (AC4).
 *
 * @param {string} targetDir - Project root
 * @param {string} proSourceDir - Pro package directory
 * @param {string[]} copiedFiles - List of copied file relative paths
 * @returns {Promise<Object>} Version info object
 */
async function generateProVersionJson(targetDir, proSourceDir, copiedFiles) {
  // Read pro package version
  let proVersion = 'unknown';
  const proPkgPath = path.join(proSourceDir, 'package.json');
  if (await fs.pathExists(proPkgPath)) {
    try {
      const proPkg = await fs.readJson(proPkgPath);
      proVersion = proPkg.version || 'unknown';
    } catch {
      // Keep 'unknown'
    }
  }

  // Generate hashes for all copied files
  const fileHashes = {};
  for (const relativePath of copiedFiles) {
    const absolutePath = path.join(targetDir, relativePath);
    try {
      if (await fs.pathExists(absolutePath)) {
        const stats = await fs.stat(absolutePath);
        if (stats.isFile()) {
          fileHashes[relativePath] = `sha256:${await hashFileAsync(absolutePath)}`;
        }
      }
    } catch {
      // Skip unhashable files
    }
  }

  const versionInfo = {
    proVersion,
    installedAt: new Date().toISOString(),
    fileCount: copiedFiles.length,
    fileHashes,
  };

  const versionPath = path.join(targetDir, 'pro-version.json');
  await fs.writeJson(versionPath, versionInfo, { spaces: 2 });

  return versionInfo;
}

/**
 * Generate pro-installed-manifest.yaml listing all scaffolded files (AC8).
 *
 * @param {string} targetDir - Project root
 * @param {string[]} copiedFiles - List of copied file relative paths
 * @returns {Promise<Object>} Manifest object
 */
async function generateInstalledManifest(targetDir, copiedFiles) {
  const files = [];
  for (const relativePath of copiedFiles) {
    const absolutePath = path.join(targetDir, relativePath);
    let timestamp = new Date().toISOString();
    try {
      if (await fs.pathExists(absolutePath)) {
        const stats = await fs.stat(absolutePath);
        timestamp = stats.mtime.toISOString();
      }
    } catch {
      // Use current time
    }
    files.push({ path: relativePath, timestamp });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    files,
  };

  const manifestPath = path.join(targetDir, 'pro-installed-manifest.yaml');
  await fs.writeFile(manifestPath, yaml.dump(manifest), 'utf8');

  return manifest;
}

/**
 * Rollback partially scaffolded files on error (AC6).
 *
 * @param {string[]} rollbackFiles - Absolute paths to remove
 * @returns {Promise<Object>} Rollback result with removed count and errors
 */
async function rollbackScaffold(rollbackFiles) {
  let removed = 0;
  const errors = [];

  for (const filePath of rollbackFiles) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        removed++;
      }
    } catch (error) {
      errors.push(`Failed to remove ${filePath}: ${error.message}`);
    }
  }

  return { removed, errors };
}

/**
 * Merge pro-config.yaml sections into core-config.yaml.
 * Deep merges top-level keys (pro, memory, metrics, integrations, squads).
 *
 * @param {string} targetDir - Project root directory
 * @returns {Promise<boolean>} True if merge was performed
 */
async function mergeProConfig(targetDir) {
  const coreConfigPath = path.join(targetDir, '.aiox-core', 'core-config.yaml');
  const proConfigPath = path.join(targetDir, '.aiox-core', 'pro-config.yaml');

  if (!await fs.pathExists(proConfigPath) || !await fs.pathExists(coreConfigPath)) {
    return false;
  }

  const coreConfig = yaml.load(await fs.readFile(coreConfigPath, 'utf8')) || {};
  const proConfig = yaml.load(await fs.readFile(proConfigPath, 'utf8')) || {};

  for (const [key, value] of Object.entries(proConfig)) {
    if (coreConfig[key] && typeof coreConfig[key] === 'object' && typeof value === 'object' && !Array.isArray(value)) {
      coreConfig[key] = { ...coreConfig[key], ...value };
    } else {
      coreConfig[key] = value;
    }
  }

  await fs.writeFile(coreConfigPath, yaml.dump(coreConfig, { lineWidth: -1 }), 'utf8');
  return true;
}

/**
 * Install squad agent commands into active IDE directories.
 * Detects which IDEs are configured and copies agent .md files accordingly.
 *
 * @param {string} targetDir - Project root directory
 * @returns {Promise<Object>} Result with installed count and file list
 */
async function installSquadCommands(targetDir) {
  const squadsDir = path.join(targetDir, 'squads');
  if (!await fs.pathExists(squadsDir)) return { installed: 0, files: [] };

  const ideTargets = [
    { check: path.join('.claude', 'commands'), dest: (squad) => path.join('.claude', 'commands', squad) },
    { check: path.join('.codex', 'agents'), dest: () => path.join('.codex', 'agents') },
    { check: path.join('.gemini', 'rules'), dest: (squad) => path.join('.gemini', 'rules', squad) },
    { check: path.join('.cursor', 'rules'), dest: () => path.join('.cursor', 'rules') },
  ];

  const activeIDEs = [];
  for (const ide of ideTargets) {
    if (await fs.pathExists(path.join(targetDir, ide.check))) {
      activeIDEs.push(ide);
    }
  }
  if (activeIDEs.length === 0) return { installed: 0, files: [] };

  const files = [];
  const items = await fs.readdir(squadsDir, { withFileTypes: true });

  for (const item of items) {
    if (!item.isDirectory()) continue;
    const agentsDir = path.join(squadsDir, item.name, 'agents');
    if (!await fs.pathExists(agentsDir)) continue;

    const agentFiles = (await fs.readdir(agentsDir))
      .filter(f => f.endsWith('.md') && !f.startsWith('test-'));

    for (const ide of activeIDEs) {
      const destDir = path.join(targetDir, ide.dest(item.name));
      await fs.ensureDir(destDir);
      for (const agentFile of agentFiles) {
        await fs.copy(
          path.join(agentsDir, agentFile),
          path.join(destDir, agentFile)
        );
        files.push(path.relative(targetDir, path.join(destDir, agentFile)).replace(/\\/g, '/'));
      }
    }
  }

  return { installed: files.length, files };
}

module.exports = {
  scaffoldProContent,
  scaffoldDirectory,
  scaffoldFile,
  generateProVersionJson,
  generateInstalledManifest,
  rollbackScaffold,
  mergeProConfig,
  installSquadCommands,
  SCAFFOLD_ITEMS,
  SCAFFOLD_EXCLUDES,
};
