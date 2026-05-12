/**
 * Migration Backup Module Tests
 *
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  createBackupDirName,
  calculateChecksum,
  copyFileWithMetadata,
  getAllFiles,
  createBackup,
  verifyBackup,
  findLatestBackup,
  listBackups,
} = require('../../.aiox-core/cli/commands/migrate/backup');

/**
 * Cleanup helper with retry logic for flaky file system operations
 * @param {string} dir - Directory to remove
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} retryDelay - Delay between retries in ms
 */
async function cleanupWithRetry(dir, maxRetries = 3, retryDelay = 100) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (fs.existsSync(dir)) {
        await fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 3 });
      }
      return;
    } catch (error) {
      const isRetryable = error.code && ['ENOTEMPTY', 'EBUSY', 'EPERM', 'EACCES'].includes(error.code);
      if (attempt === maxRetries || !isRetryable) {
        // Last attempt failed or non-retryable error, log but don't throw
        console.warn(`Warning: Failed to cleanup ${dir} after ${attempt} attempts:`, error.code);
        return;
      }
      // Linear backoff (100ms, 200ms, 300ms...)
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
}

describe('Migration Backup Module', () => {
  let testDir;
  let testId;

  beforeEach(async () => {
    // Create a unique temporary test directory with random suffix to avoid collisions
    testId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    testDir = path.join(os.tmpdir(), `aiox-backup-test-${testId}`);
    await fs.promises.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Small delay to allow file handles to close
    await new Promise(resolve => setTimeout(resolve, 50));
    // Cleanup test directory with retry logic
    await cleanupWithRetry(testDir);
  });

  describe('createBackupDirName', () => {
    it('should create backup directory name with date format', () => {
      const name = createBackupDirName();
      expect(name).toMatch(/^\.aiox-backup-\d{4}-\d{2}-\d{2}$/);
    });

    it('should use current date', () => {
      const name = createBackupDirName();
      const today = new Date().toISOString().split('T')[0];
      expect(name).toBe(`.aiox-backup-${today}`);
    });
  });

  describe('calculateChecksum', () => {
    it('should calculate MD5 checksum for a file', async () => {
      const testFile = path.join(testDir, 'test.txt');
      await fs.promises.writeFile(testFile, 'Hello, World!');

      const checksum = await calculateChecksum(testFile);

      expect(checksum).toMatch(/^[a-f0-9]{32}$/);
      // MD5 of "Hello, World!" is known
      expect(checksum).toBe('65a8e27d8879283831b664bd8b7f0ad4');
    });

    it('should produce different checksums for different content', async () => {
      const file1 = path.join(testDir, 'file1.txt');
      const file2 = path.join(testDir, 'file2.txt');

      await fs.promises.writeFile(file1, 'Content 1');
      await fs.promises.writeFile(file2, 'Content 2');

      const checksum1 = await calculateChecksum(file1);
      const checksum2 = await calculateChecksum(file2);

      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('copyFileWithMetadata', () => {
    it('should copy file and preserve content', async () => {
      const srcFile = path.join(testDir, 'source.txt');
      const destFile = path.join(testDir, 'dest', 'copied.txt');

      await fs.promises.writeFile(srcFile, 'Test content');

      const result = await copyFileWithMetadata(srcFile, destFile);

      expect(fs.existsSync(destFile)).toBe(true);
      const content = await fs.promises.readFile(destFile, 'utf8');
      expect(content).toBe('Test content');
      expect(result.checksum).toMatch(/^[a-f0-9]{32}$/);
    });

    it('should create destination directory if needed', async () => {
      const srcFile = path.join(testDir, 'source.txt');
      const destFile = path.join(testDir, 'nested', 'deep', 'copied.txt');

      await fs.promises.writeFile(srcFile, 'Test');

      await copyFileWithMetadata(srcFile, destFile);

      expect(fs.existsSync(destFile)).toBe(true);
    });
  });

  describe('getAllFiles', () => {
    it('should get all files recursively', async () => {
      // Create test structure
      await fs.promises.mkdir(path.join(testDir, 'subdir'), { recursive: true });
      await fs.promises.writeFile(path.join(testDir, 'file1.txt'), 'a');
      await fs.promises.writeFile(path.join(testDir, 'subdir', 'file2.txt'), 'b');

      const files = await getAllFiles(testDir);

      expect(files).toHaveLength(2);
      expect(files.some(f => f.includes('file1.txt'))).toBe(true);
      expect(files.some(f => f.includes('file2.txt'))).toBe(true);
    });

    it('should return empty array for empty directory', async () => {
      const files = await getAllFiles(testDir);
      expect(files).toHaveLength(0);
    });
  });

  describe('createBackup', () => {
    it('should create backup of .aiox-core directory', async () => {
      // Create mock .aiox-core structure
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(path.join(aioxCoreDir, 'agents'), { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'agents', 'test.md'), 'Agent content');
      await fs.promises.writeFile(path.join(aioxCoreDir, 'index.js'), 'module.exports = {}');

      const result = await createBackup(testDir);

      expect(result.success).toBe(true);
      expect(result.backupDir).toBeTruthy();
      expect(fs.existsSync(result.backupDir)).toBe(true);
      expect(result.manifest.totalFiles).toBeGreaterThan(0);
    });

    it('should fail if .aiox-core does not exist', async () => {
      await expect(createBackup(testDir)).rejects.toThrow(/No .aiox-core directory/);
    });

    it('should include backup manifest', async () => {
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(aioxCoreDir, { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'test.js'), 'test');

      const result = await createBackup(testDir);
      const manifestPath = path.join(result.backupDir, 'backup-manifest.json');

      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
      expect(manifest.version).toBe('2.0');
      expect(manifest.files).toBeInstanceOf(Array);
      expect(manifest.checksums).toBeInstanceOf(Object);
    });
  });

  describe('verifyBackup', () => {
    it('should verify valid backup', async () => {
      // Create and verify a backup
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(aioxCoreDir, { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'test.js'), 'test content');

      const backupResult = await createBackup(testDir);
      const verification = await verifyBackup(backupResult.backupDir);

      expect(verification.valid).toBe(true);
      expect(verification.verified).toBeGreaterThan(0);
      expect(verification.failed).toHaveLength(0);
    });

    it('should detect corrupted files', async () => {
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(aioxCoreDir, { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'test.js'), 'original');

      const backupResult = await createBackup(testDir);

      // Corrupt a file in backup
      const backedUpFile = path.join(backupResult.backupDir, '.aiox-core', 'test.js');
      await fs.promises.writeFile(backedUpFile, 'corrupted');

      const verification = await verifyBackup(backupResult.backupDir);

      expect(verification.valid).toBe(false);
      expect(verification.failed).toHaveLength(1);
    });
  });

  describe('findLatestBackup', () => {
    it('should find the most recent backup', async () => {
      // Create mock backup directories
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(aioxCoreDir, { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'test.js'), 'test');

      // Create first backup
      await createBackup(testDir);

      const latest = await findLatestBackup(testDir);

      expect(latest).not.toBeNull();
      expect(latest.name).toMatch(/^\.aiox-backup-/);
    });

    it('should return null if no backups exist', async () => {
      const latest = await findLatestBackup(testDir);
      expect(latest).toBeNull();
    });
  });

  describe('listBackups', () => {
    it('should list all backups', async () => {
      const aioxCoreDir = path.join(testDir, '.aiox-core');
      await fs.promises.mkdir(aioxCoreDir, { recursive: true });
      await fs.promises.writeFile(path.join(aioxCoreDir, 'test.js'), 'test');

      await createBackup(testDir);

      const backups = await listBackups(testDir);

      expect(backups).toBeInstanceOf(Array);
      expect(backups.length).toBeGreaterThan(0);
      expect(backups[0]).toHaveProperty('name');
      expect(backups[0]).toHaveProperty('hasManifest');
    });
  });
});
