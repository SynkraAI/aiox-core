#!/usr/bin/env node
/**
 * Generate Install Manifest
 * Dynamically generates install-manifest.yaml with file hashes for brownfield upgrades
 *
 * @script scripts/generate-install-manifest.js
 * @story 6.18 - Dynamic Manifest & Brownfield Upgrade System
 *
 * Usage:
 *   node scripts/generate-install-manifest.js
 *   npm run generate:manifest
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { hashFile, hashString } = require('../packages/installer/src/installer/file-hasher');

// Import FOLDERS_TO_COPY from installer (same source of truth)
const FOLDERS_TO_COPY = [
  // v2.1 Modular Structure
  'core',
  'development',
  'product',
  'infrastructure',
  // v2.1 New Modules (Story 6.19 - added missing folders)
  'workflow-intelligence',
  'monitor',
  // v2.0 Legacy Flat Structure (backwards compatibility)
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
  'cli',
  'manifests',
];

const ROOT_FILES_TO_COPY = [
  'index.js',
  'index.esm.js',
  'index.d.ts',
  'core-config.yaml',
  'package.json',
  'user-guide.md',
  'working-in-the-brownfield.md',
];

// Files/folders to exclude from manifest
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.DS_Store/,
  /Thumbs\.db/,
  /\.installed-manifest\.yaml$/, // Don't include installed manifest
  /\.bak$/,
  /\.tmp$/,
  /~$/,
  // Gitignored legacy docs (not tracked in repo)
  /docs\/standards\/AIOX-LIVRO-DE-OURO/,
  /docs\/standards\/AIOX-FRAMEWORK-MASTER\.md$/,
  /docs\/standards\/V3-ARCHITECTURAL-DECISIONS\.md$/,
  /docs\/SHARD-TRANSLATION-GUIDE\.md$/,
  /docs\/component-creation-guide\.md$/,
  /docs\/template-syntax\.md$/,
  /docs\/troubleshooting-guide\.md$/,
  /docs\/session-update-pattern\.md$/,
  // Gitignored generated files
  /data\/registry-update-log\.jsonl$/,
  /data\/registry-healing-log\.jsonl$/,
  /infrastructure\/tests\/utilities-audit-results\.json$/,
  /manifests\/agents\.csv$/,
  /manifests\/tasks\.csv$/,
  /manifests\/workers\.csv$/,
  /index\.d\.ts$/, // Generated TypeScript definitions
];

/**
 * Check if a path should be excluded
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if should be excluded
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Determine file type based on path
 * @param {string} relativePath - Relative file path
 * @returns {string} - File type identifier
 */
function getFileType(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');

  if (normalized.includes('/agents/') || normalized.startsWith('agents/')) {
    return 'agent';
  }
  if (normalized.includes('/tasks/') || normalized.startsWith('tasks/')) {
    return 'task';
  }
  if (normalized.includes('/workflows/') || normalized.startsWith('workflows/')) {
    return 'workflow';
  }
  if (normalized.includes('/templates/') || normalized.startsWith('templates/')) {
    return 'template';
  }
  if (normalized.includes('/checklists/') || normalized.startsWith('checklists/')) {
    return 'checklist';
  }
  if (normalized.includes('/scripts/') || normalized.startsWith('scripts/')) {
    return 'script';
  }
  if (normalized.includes('/tools/') || normalized.startsWith('tools/')) {
    return 'tool';
  }
  if (normalized.includes('/data/') || normalized.startsWith('data/')) {
    return 'data';
  }
  if (normalized.includes('/docs/') || normalized.startsWith('docs/')) {
    return 'documentation';
  }
  if (normalized.includes('/elicitation/') || normalized.startsWith('elicitation/')) {
    return 'elicitation';
  }
  if (normalized.includes('/manifests/') || normalized.startsWith('manifests/')) {
    return 'manifest';
  }
  if (normalized.includes('/cli/') || normalized.startsWith('cli/')) {
    return 'cli';
  }
  if (normalized.includes('/core/') || normalized.startsWith('core/')) {
    return 'core';
  }
  if (normalized.includes('/infrastructure/') || normalized.startsWith('infrastructure/')) {
    return 'infrastructure';
  }
  if (normalized.includes('/product/') || normalized.startsWith('product/')) {
    return 'product';
  }
  if (normalized.includes('/development/') || normalized.startsWith('development/')) {
    return 'development';
  }
  if (
    normalized.includes('/workflow-intelligence/') ||
    normalized.startsWith('workflow-intelligence/')
  ) {
    return 'workflow-intelligence';
  }
  if (normalized.includes('/monitor/') || normalized.startsWith('monitor/')) {
    return 'monitor';
  }

  // Root files
  if (normalized.endsWith('.js') || normalized.endsWith('.ts')) {
    return 'code';
  }
  if (normalized.endsWith('.yaml') || normalized.endsWith('.yml')) {
    return 'config';
  }
  if (normalized.endsWith('.md')) {
    return 'documentation';
  }

  return 'other';
}

/**
 * Recursively scan directory and collect file metadata
 * @param {string} dirPath - Directory to scan
 * @param {string} basePath - Base path for relative paths
 * @param {string[]} files - Array to collect files
 */
function scanDirectory(dirPath, basePath, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

    if (shouldExclude(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath, basePath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Generate the install manifest
 * @returns {Object} - Manifest object
 */
async function generateManifest() {
  const aioxCoreDir = path.join(__dirname, '..', '.aiox-core');
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  if (!fs.existsSync(aioxCoreDir)) {
    throw new Error(`.aiox-core directory not found at ${aioxCoreDir}`);
  }

  // Get version from package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  console.log(`Generating manifest for aiox-core v${version}...`);

  const allFiles = [];

  // Scan folders
  for (const folder of FOLDERS_TO_COPY) {
    const folderPath = path.join(aioxCoreDir, folder);
    if (fs.existsSync(folderPath)) {
      scanDirectory(folderPath, aioxCoreDir, allFiles);
    }
  }

  // Add root files
  for (const file of ROOT_FILES_TO_COPY) {
    const filePath = path.join(aioxCoreDir, file);
    if (fs.existsSync(filePath)) {
      allFiles.push(filePath);
    }
  }

  // Note: install-manifest.yaml itself is not included in the manifest
  // as it would create a circular dependency during validation

  console.log(`Found ${allFiles.length} files to include in manifest`);

  // Generate file entries with metadata
  const fileEntries = [];
  let processedCount = 0;

  for (const fullPath of allFiles) {
    try {
      const relativePath = path.relative(aioxCoreDir, fullPath).replace(/\\/g, '/');
      const stats = fs.statSync(fullPath);
      const hash = hashFile(fullPath);
      const fileType = getFileType(relativePath);

      fileEntries.push({
        path: relativePath,
        hash: `sha256:${hash}`,
        type: fileType,
        size: stats.size,
      });

      processedCount++;
      if (processedCount % 50 === 0) {
        console.log(`  Processed ${processedCount}/${allFiles.length} files...`);
      }
    } catch (error) {
      console.warn(`  Warning: Could not process ${fullPath}: ${error.message}`);
    }
  }

  // Sort files by path for consistent output
  fileEntries.sort((a, b) => a.path.localeCompare(b.path));

  // Build manifest object
  const manifest = {
    version: version,
    generated_at: new Date().toISOString(),
    generator: 'scripts/generate-install-manifest.js',
    file_count: fileEntries.length,
    files: fileEntries,
  };

  return manifest;
}

/**
 * Write manifest to file
 * @param {Object} manifest - Manifest object
 */
async function writeManifest(manifest) {
  const manifestPath = path.join(__dirname, '..', '.aiox-core', 'install-manifest.yaml');

  // Generate YAML with custom options for readability
  const yamlContent = yaml.dump(manifest, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
  });

  // Add header comment
  const header = `# AIOX-Core Install Manifest
# Auto-generated by scripts/generate-install-manifest.js
# DO NOT EDIT MANUALLY - regenerate with: npm run generate:manifest
#
# This manifest is used for brownfield upgrades to track:
# - Which files are part of the framework
# - SHA256 hashes for change detection
# - File types for categorization
#
`;

  fs.writeFileSync(manifestPath, header + yamlContent, 'utf8');

  console.log(`\nManifest written to: ${manifestPath}`);
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Files: ${manifest.file_count}`);
  console.log(`  Generated: ${manifest.generated_at}`);

  // Also compute and display manifest hash for integrity verification
  const manifestHash = hashString(yamlContent);
  console.log(`  Manifest hash: sha256:${manifestHash.substring(0, 16)}...`);

  return manifestPath;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('AIOX-Core Install Manifest Generator');
    console.log('='.repeat(60));
    console.log('');

    const manifest = await generateManifest();
    await writeManifest(manifest);

    console.log('\n✅ Manifest generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error generating manifest:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateManifest,
  writeManifest,
  getFileType,
  scanDirectory,
  FOLDERS_TO_COPY,
  ROOT_FILES_TO_COPY,
};
