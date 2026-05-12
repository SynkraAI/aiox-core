/**
 * Migration Backup Module
 *
 * Handles backup creation, verification, and manifest generation
 * for v2.0 → v4.0.4 migration.
 *
 * @module cli/commands/migrate/backup
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v4.0.4
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Create a backup directory name with timestamp
 * @returns {string} Backup directory name
 */
function createBackupDirName() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  return `.aiox-backup-${dateStr}`;
}

/**
 * Calculate MD5 checksum for a file
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} MD5 checksum
 */
async function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Get file stats including permissions
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} File stats
 */
async function getFileStats(filePath) {
  const stats = await fs.promises.stat(filePath);
  return {
    size: stats.size,
    mode: stats.mode,
    mtime: stats.mtime.toISOString(),
    isDirectory: stats.isDirectory(),
  };
}

/**
 * Copy file with metadata preservation
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 * @returns {Promise<Object>} Copy result with checksum
 */
async function copyFileWithMetadata(src, dest) {
  const stats = await fs.promises.stat(src);

  // Ensure destination directory exists
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });

  // Copy file
  await fs.promises.copyFile(src, dest);

  // Preserve timestamps and permissions
  await fs.promises.utimes(dest, stats.atime, stats.mtime);
  await fs.promises.chmod(dest, stats.mode);

  // Calculate checksum
  const checksum = await calculateChecksum(dest);

  return {
    src,
    dest,
    size: stats.size,
    mode: stats.mode,
    checksum,
  };
}

/**
 * Recursively get all files in a directory
 * @param {string} dir - Directory path
 * @param {string[]} [fileList] - Accumulated file list
 * @returns {Promise<string[]>} Array of file paths
 */
async function getAllFiles(dir, fileList = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

/**
 * Create backup of .aiox-core directory
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Backup options
 * @param {boolean} options.verbose - Show detailed progress
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} Backup result
 */
async function createBackup(projectRoot, options = {}) {
  const { verbose = false, onProgress = () => {} } = options;

  const aioxCoreDir = path.join(projectRoot, '.aiox-core');
  const backupDirName = createBackupDirName();
  const backupDir = path.join(projectRoot, backupDirName);

  // Check if .aiox-core exists
  if (!fs.existsSync(aioxCoreDir)) {
    throw new Error('No .aiox-core directory found. Is this an AIOX v2.0 project?');
  }

  // Check if backup already exists
  if (fs.existsSync(backupDir)) {
    throw new Error(`Backup directory ${backupDirName} already exists. Remove it or use a different name.`);
  }

  onProgress({ phase: 'start', message: 'Creating backup directory...' });

  // Create backup directory
  await fs.promises.mkdir(backupDir, { recursive: true });

  // Get all files to backup
  const files = await getAllFiles(aioxCoreDir);
  const manifest = {
    version: '2.0',
    created: new Date().toISOString(),
    projectRoot,
    backupDir,
    files: [],
    totalSize: 0,
    totalFiles: files.length,
    checksums: {},
  };

  onProgress({ phase: 'copying', message: `Backing up ${files.length} files...`, total: files.length });

  // Copy each file
  for (let i = 0; i < files.length; i++) {
    const srcFile = files[i];
    const relativePath = path.relative(aioxCoreDir, srcFile);
    const destFile = path.join(backupDir, '.aiox-core', relativePath);

    const result = await copyFileWithMetadata(srcFile, destFile);

    manifest.files.push({
      relativePath,
      size: result.size,
      mode: result.mode,
      checksum: result.checksum,
    });
    manifest.checksums[relativePath] = result.checksum;
    manifest.totalSize += result.size;

    if (verbose) {
      onProgress({ phase: 'file', message: `  → ${relativePath}`, current: i + 1, total: files.length });
    }
  }

  // Backup config files if they exist
  const configFiles = [
    'aiox.config.js',
    'aiox.config.json',
    '.aiox/config.yaml',
    '.mcp.json',
  ];

  for (const configFile of configFiles) {
    const srcPath = path.join(projectRoot, configFile);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(backupDir, configFile);
      const result = await copyFileWithMetadata(srcPath, destPath);

      manifest.files.push({
        relativePath: configFile,
        size: result.size,
        mode: result.mode,
        checksum: result.checksum,
        isConfig: true,
      });
      manifest.checksums[configFile] = result.checksum;
      manifest.totalSize += result.size;
    }
  }

  onProgress({ phase: 'manifest', message: 'Creating backup manifest...' });

  // Write manifest
  const manifestPath = path.join(backupDir, 'backup-manifest.json');
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  onProgress({ phase: 'complete', message: 'Backup complete!' });

  return {
    success: true,
    backupDir,
    backupDirName,
    manifest,
  };
}

/**
 * Verify backup integrity using checksums
 * @param {string} backupDir - Backup directory path
 * @returns {Promise<Object>} Verification result
 */
async function verifyBackup(backupDir) {
  const manifestPath = path.join(backupDir, 'backup-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error('Backup manifest not found. Is this a valid AIOX backup?');
  }

  const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
  const results = {
    valid: true,
    totalFiles: manifest.files.length,
    verified: 0,
    failed: [],
    missing: [],
  };

  for (const file of manifest.files) {
    const filePath = file.isConfig
      ? path.join(backupDir, file.relativePath)
      : path.join(backupDir, '.aiox-core', file.relativePath);

    if (!fs.existsSync(filePath)) {
      results.missing.push(file.relativePath);
      results.valid = false;
      continue;
    }

    const checksum = await calculateChecksum(filePath);

    if (checksum !== file.checksum) {
      results.failed.push({
        file: file.relativePath,
        expected: file.checksum,
        actual: checksum,
      });
      results.valid = false;
    } else {
      results.verified++;
    }
  }

  return results;
}

/**
 * Find the most recent backup directory
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<Object|null>} Backup info or null
 */
async function findLatestBackup(projectRoot) {
  const entries = await fs.promises.readdir(projectRoot, { withFileTypes: true });

  const backups = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('.aiox-backup-'))
    .map(entry => ({
      name: entry.name,
      path: path.join(projectRoot, entry.name),
      date: entry.name.replace('.aiox-backup-', ''),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (backups.length === 0) {
    return null;
  }

  const latestBackup = backups[0];
  const manifestPath = path.join(latestBackup.path, 'backup-manifest.json');

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
    return {
      ...latestBackup,
      manifest,
    };
  }

  return latestBackup;
}

/**
 * List all available backups
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<Object[]>} Array of backup info
 */
async function listBackups(projectRoot) {
  const entries = await fs.promises.readdir(projectRoot, { withFileTypes: true });

  const backups = [];

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('.aiox-backup-')) {
      const backupPath = path.join(projectRoot, entry.name);
      const manifestPath = path.join(backupPath, 'backup-manifest.json');

      const backup = {
        name: entry.name,
        path: backupPath,
        date: entry.name.replace('.aiox-backup-', ''),
        hasManifest: false,
        fileCount: 0,
        totalSize: 0,
      };

      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
        backup.hasManifest = true;
        backup.fileCount = manifest.totalFiles;
        backup.totalSize = manifest.totalSize;
        backup.created = manifest.created;
      }

      backups.push(backup);
    }
  }

  return backups.sort((a, b) => b.date.localeCompare(a.date));
}

module.exports = {
  createBackupDirName,
  calculateChecksum,
  getFileStats,
  copyFileWithMetadata,
  getAllFiles,
  createBackup,
  verifyBackup,
  findLatestBackup,
  listBackups,
};
