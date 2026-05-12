/**
 * Integration tests for InstallTransaction
 *
 * Tests backup, rollback, logging, and error recovery scenarios
 *
 * @see Story 1.9 - Error Handling & Rollback
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { InstallTransaction, ERROR_TYPES } = require('../../bin/utils/install-transaction');

describe('InstallTransaction', () => {
  let transaction;
  let tempDir;
  let testFile;
  let testDir;

  beforeEach(async () => {
    // Create temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-test-'));
    testFile = path.join(tempDir, 'test.txt');
    testDir = path.join(tempDir, 'test-dir');

    // Create test fixtures
    await fs.writeFile(testFile, 'original content');
    await fs.ensureDir(testDir);
    await fs.writeFile(path.join(testDir, 'file1.txt'), 'file 1 content');
    await fs.writeFile(path.join(testDir, 'file2.txt'), 'file 2 content');

    // Initialize transaction with temp dir
    // Use simple timestamp for testing (avoid Windows path issues)
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-').replace('T', '_');
    transaction = new InstallTransaction({
      backupDir: path.join(tempDir, '.aiox-backup', timestamp),
      logFile: path.join(tempDir, '.aiox-install.log'),
    });
  });

  afterEach(async () => {
    // Cleanup temp directory
    await fs.remove(tempDir);
  });

  // Test 1: Backup Success Scenario
  describe('Backup Operations', () => {
    test('should backup file successfully', async () => {
      await transaction.backup(testFile);

      expect(transaction.backups).toHaveLength(1);
      expect(transaction.backups[0].original).toBe(path.resolve(testFile));
      expect(await fs.pathExists(transaction.backups[0].backup)).toBe(true);

      const backupContent = await fs.readFile(transaction.backups[0].backup, 'utf-8');
      expect(backupContent).toBe('original content');
    });

    test('should backup directory successfully', async () => {
      await transaction.backupDirectory(testDir);

      expect(transaction.backups).toHaveLength(1);
      expect(transaction.backups[0].isDirectory).toBe(true);

      const backupDir = transaction.backups[0].backup;
      expect(await fs.pathExists(path.join(backupDir, 'file1.txt'))).toBe(true);
      expect(await fs.pathExists(path.join(backupDir, 'file2.txt'))).toBe(true);
    });

    test('should calculate hash correctly for verification', async () => {
      await transaction.backup(testFile);

      const backup = transaction.backups[0];
      expect(backup.hash).toBeTruthy();
      expect(backup.hash).toHaveLength(64); // SHA-256 hex = 64 chars
    });

    test('should skip backup if file does not exist', async () => {
      const nonExistent = path.join(tempDir, 'nonexistent.txt');
      await transaction.backup(nonExistent);

      expect(transaction.backups).toHaveLength(0);
      expect(transaction.operations.some((op) => op.level === 'WARN')).toBe(true);
    });

    test('should prevent duplicate backups', async () => {
      await transaction.backup(testFile);
      await transaction.backup(testFile);

      expect(transaction.backups).toHaveLength(1);
    });

    test('should detect and reject symlinks (security)', async () => {
      const symlinkPath = path.join(tempDir, 'symlink.txt');

      // Create symlink (skip test on Windows if symlinks not supported)
      try {
        await fs.symlink(testFile, symlinkPath);
      } catch (error) {
        if (error.code === 'EPERM' || error.code === 'ENOENT') {
          console.warn('Symlink test skipped (not supported on this platform)');
          return;
        }
        throw error;
      }

      await expect(transaction.backup(symlinkPath)).rejects.toThrow('Symlink detected');
    });
  });

  // Test 2: Rollback Success Scenario
  describe('Rollback Operations', () => {
    test('should rollback file changes successfully', async () => {
      await transaction.backup(testFile);

      // Modify file (simulate installation)
      await fs.writeFile(testFile, 'modified content');

      // Rollback
      const success = await transaction.rollback();

      expect(success).toBe(true);
      const content = await fs.readFile(testFile, 'utf-8');
      expect(content).toBe('original content');
    });

    test('should rollback directory changes successfully', async () => {
      await transaction.backupDirectory(testDir);

      // Modify directory (simulate installation)
      await fs.writeFile(path.join(testDir, 'file1.txt'), 'modified');
      await fs.writeFile(path.join(testDir, 'file3.txt'), 'new file');
      await fs.remove(path.join(testDir, 'file2.txt'));

      // Rollback
      const success = await transaction.rollback();

      expect(success).toBe(true);
      expect(await fs.readFile(path.join(testDir, 'file1.txt'), 'utf-8')).toBe('file 1 content');
      expect(await fs.pathExists(path.join(testDir, 'file2.txt'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'file3.txt'))).toBe(false);
    });

    test('should cleanup backup directory after rollback', async () => {
      await transaction.backup(testFile);
      await fs.writeFile(testFile, 'modified');

      const backupDir = transaction.backupDir;
      await transaction.rollback();

      expect(await fs.pathExists(backupDir)).toBe(false);
    });

    test('should prevent rollback after commit', async () => {
      await transaction.backup(testFile);
      await transaction.commit();

      const success = await transaction.rollback();

      expect(success).toBe(false);
      expect(transaction.operations.some((op) => op.message.includes('Cannot rollback'))).toBe(true);
    });
  });

  // Test 3: Partial Rollback Scenario
  describe('Partial Rollback Scenarios', () => {
    test('should handle partial rollback when some files fail to restore', async () => {
      const file1 = path.join(tempDir, 'file1.txt');
      const file2 = path.join(tempDir, 'file2.txt');
      const file3 = path.join(tempDir, 'file3.txt');

      await fs.writeFile(file1, 'content 1');
      await fs.writeFile(file2, 'content 2');
      await fs.writeFile(file3, 'content 3');

      await transaction.backup(file1);
      await transaction.backup(file2);
      await transaction.backup(file3);

      // Corrupt one backup to simulate restore failure
      await fs.remove(transaction.backups[1].backup);

      // Modify files
      await fs.writeFile(file1, 'modified 1');
      await fs.writeFile(file2, 'modified 2');
      await fs.writeFile(file3, 'modified 3');

      const success = await transaction.rollback();

      expect(success).toBe(false);
      // Files with valid backups should be restored
      expect(await fs.readFile(file1, 'utf-8')).toBe('content 1');
      expect(await fs.readFile(file3, 'utf-8')).toBe('content 3');
      // File with corrupted backup should remain modified
      expect(await fs.readFile(file2, 'utf-8')).toBe('modified 2');
    });
  });

  // Test 4: Disk Space Exhaustion (mocked)
  describe('Error Scenarios', () => {
    test('should classify ENOSPC as CRITICAL error', () => {
      const error = new Error('No space left on device');
      error.code = 'ENOSPC';

      const classification = transaction.classifyError(error);

      expect(classification).toBe(ERROR_TYPES.CRITICAL);
      expect(transaction.isCriticalError(error)).toBe(true);
    });

    test('should classify unknown errors as RECOVERABLE', () => {
      const error = new Error('Unknown error');

      const classification = transaction.classifyError(error);

      expect(classification).toBe(ERROR_TYPES.RECOVERABLE);
      expect(transaction.isCriticalError(error)).toBe(false);
    });
  });

  // Test 5: Permission Errors During Backup
  describe('Permission Handling', () => {
    test('should log error when backup fails due to permissions', async () => {
      // This test is platform-specific - skip on Windows
      if (process.platform === 'win32') {
        console.warn('Permission test skipped on Windows');
        return;
      }

      const readOnlyFile = path.join(tempDir, 'readonly.txt');
      await fs.writeFile(readOnlyFile, 'content');
      await fs.chmod(readOnlyFile, 0o000); // No permissions

      await expect(transaction.backup(readOnlyFile)).rejects.toThrow();

      // Restore permissions for cleanup
      await fs.chmod(readOnlyFile, 0o644);
    });
  });

  // Test 6: Permission Errors During Restore (skipped - difficult to simulate reliably)
  // Test 7: Concurrent Installation Attempts (skipped - requires multi-process testing)

  // Test 8: Log File Overflow Handling
  describe('Logging System', () => {
    test('should log operations with timestamps', async () => {
      transaction.log('INFO', 'Test message');

      expect(transaction.operations).toHaveLength(1);
      expect(transaction.operations[0].level).toBe('INFO');
      expect(transaction.operations[0].message).toBe('Test message');
      expect(transaction.operations[0].timestamp).toBeTruthy();
    });

    test('should write log to file', async () => {
      transaction.log('INFO', 'File test');

      const logContent = await fs.readFile(transaction.logFile, 'utf-8');
      expect(logContent).toContain('[INFO]');
      expect(logContent).toContain('File test');
    });

    test('should rotate log when exceeding 10MB', async () => {
      // Create large log file (simulate)
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      await fs.writeFile(transaction.logFile, largeContent);

      transaction.log('INFO', 'After rotation');

      expect(await fs.pathExists(`${transaction.logFile}.1`)).toBe(true);
    });
  });

  // Test 9: Credential Sanitization
  describe('Credential Sanitization', () => {
    test('should sanitize API keys in logs', async () => {
      const apiKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
      transaction.log('ERROR', `Failed with API key: ${apiKey}`);

      const logContent = await fs.readFile(transaction.logFile, 'utf-8');
      expect(logContent).not.toContain(apiKey);
      expect(logContent).toContain('[REDACTED]');
    });

    test('should sanitize Bearer tokens', async () => {
      transaction.log('ERROR', 'Authorization: Bearer abc123token456');

      const logContent = await fs.readFile(transaction.logFile, 'utf-8');
      expect(logContent).not.toContain('abc123token456');
      expect(logContent).toContain('Bearer [REDACTED]');
    });

    test('should sanitize password fields', async () => {
      transaction.log('ERROR', 'Login failed: password=secret123');

      const logContent = await fs.readFile(transaction.logFile, 'utf-8');
      expect(logContent).not.toContain('secret123');
      expect(logContent).toContain('password=[REDACTED]');
    });

    test('should sanitize environment variable secrets', async () => {
      transaction.log('ERROR', 'Config: CLICKUP_API_KEY=pk_12345678');

      const logContent = await fs.readFile(transaction.logFile, 'utf-8');
      expect(logContent).not.toContain('pk_12345678');
      expect(logContent).toContain('CLICKUP_API_KEY=[REDACTED]');
    });
  });

  // Test 10: Hash Verification Failure
  describe('Backup Verification', () => {
    test('should detect corrupted backups during rollback', async () => {
      await transaction.backup(testFile);

      // Corrupt backup file
      const backup = transaction.backups[0];
      await fs.writeFile(backup.backup, 'corrupted content');

      const success = await transaction.rollback();

      expect(success).toBe(false);
      expect(transaction.operations.some((op) => op.message.includes('Backup verification failed'))).toBe(true);
    });

    test('should verify backup integrity with hash comparison', async () => {
      await transaction.backup(testFile);

      const backup = transaction.backups[0];
      const isValid = await transaction._verifyBackup(backup);

      expect(isValid).toBe(true);
    });
  });

  // Additional test: Commit functionality
  describe('Commit Operations', () => {
    test('should cleanup backups on commit', async () => {
      await transaction.backup(testFile);

      const backupDir = transaction.backupDir;
      await transaction.commit();

      expect(await fs.pathExists(backupDir)).toBe(false);
      expect(transaction.isCommitted).toBe(true);
    });

    test('should prevent commit after rollback', async () => {
      await transaction.backup(testFile);
      await transaction.rollback();

      await transaction.commit();

      expect(transaction.operations.some((op) => op.message.includes('Cannot commit'))).toBe(true);
    });
  });

  // Performance test
  describe('Performance', () => {
    test('should backup 100 files in under 2 seconds', async () => {
      const files = [];
      for (let i = 0; i < 100; i++) {
        const file = path.join(tempDir, `file-${i}.txt`);
        await fs.writeFile(file, `content ${i}`);
        files.push(file);
      }

      const start = Date.now();
      for (const file of files) {
        await transaction.backup(file);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    }, 10000);

    test('should rollback 100 files in under 3 seconds', async () => {
      const files = [];
      for (let i = 0; i < 100; i++) {
        const file = path.join(tempDir, `file-${i}.txt`);
        await fs.writeFile(file, `content ${i}`);
        await transaction.backup(file);
        files.push(file);
      }

      // Modify all files
      for (let i = 0; i < 100; i++) {
        const file = files[i];
        await fs.writeFile(file, `modified ${i}`);
      }

      const start = Date.now();
      await transaction.rollback();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(3000);
    }, 15000);

    test('should log 1000 entries in under 500ms', async () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        transaction.log('INFO', `Log entry ${i}`);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    }, 5000);
  });
});
