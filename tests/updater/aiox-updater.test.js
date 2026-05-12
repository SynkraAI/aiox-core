/**
 * AIOX Updater Tests
 *
 * @story Epic 7 - CLI Update Command
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const { AIOXUpdater, UpdateStatus, formatCheckResult, formatUpdateResult } = require('../../packages/installer/src/updater');

describe('AIOXUpdater', () => {
  let tempDir;
  let updater;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-updater-test-'));

    // Create minimal .aiox-core structure
    await fs.ensureDir(path.join(tempDir, '.aiox-core'));
    await fs.ensureDir(path.join(tempDir, '.aiox'));

    // Create version.json
    await fs.writeJson(path.join(tempDir, '.aiox-core', 'version.json'), {
      version: '1.0.0',
      installedAt: '2025-01-01T00:00:00Z',
      mode: 'project-development',
      fileHashes: {
        'test-file.md': 'sha256:abc123def456',
      },
    });

    updater = new AIOXUpdater(tempDir, { verbose: false });
  });

  afterEach(async () => {
    if (tempDir && fs.existsSync(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const u = new AIOXUpdater(tempDir);
      expect(u.projectRoot).toBe(path.resolve(tempDir));
      expect(u.options.verbose).toBe(false);
      expect(u.options.force).toBe(false);
      expect(u.options.preserveAll).toBe(true);
    });

    it('should accept custom options', () => {
      const u = new AIOXUpdater(tempDir, {
        verbose: true,
        force: true,
        preserveAll: false,
        timeout: 60000,
      });
      expect(u.options.verbose).toBe(true);
      expect(u.options.force).toBe(true);
      expect(u.options.preserveAll).toBe(false);
      expect(u.options.timeout).toBe(60000);
    });
  });

  describe('getInstalledVersion', () => {
    it('should read version from version.json', async () => {
      const version = await updater.getInstalledVersion();
      expect(version).toBeDefined();
      expect(version.version).toBe('1.0.0');
      expect(version.mode).toBe('project-development');
    });

    it('should return null if version.json not found', async () => {
      await fs.remove(path.join(tempDir, '.aiox-core', 'version.json'));
      const version = await updater.getInstalledVersion();
      expect(version).toBeNull();
    });

    it('should handle corrupted version.json', async () => {
      await fs.writeFile(path.join(tempDir, '.aiox-core', 'version.json'), 'invalid json');
      const version = await updater.getInstalledVersion();
      expect(version).toBeNull();
    });
  });

  describe('compareVersions', () => {
    it('should return 0 for equal versions', () => {
      expect(updater.compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(updater.compareVersions('v1.0.0', '1.0.0')).toBe(0);
    });

    it('should return -1 when first is older', () => {
      expect(updater.compareVersions('1.0.0', '1.0.1')).toBe(-1);
      expect(updater.compareVersions('1.0.0', '1.1.0')).toBe(-1);
      expect(updater.compareVersions('1.0.0', '2.0.0')).toBe(-1);
    });

    it('should return 1 when first is newer', () => {
      expect(updater.compareVersions('1.0.1', '1.0.0')).toBe(1);
      expect(updater.compareVersions('1.1.0', '1.0.0')).toBe(1);
      expect(updater.compareVersions('2.0.0', '1.0.0')).toBe(1);
    });

    it('should handle version prefix v', () => {
      expect(updater.compareVersions('v1.0.0', 'v1.0.0')).toBe(0);
      expect(updater.compareVersions('v1.0.0', '1.0.1')).toBe(-1);
    });
  });

  describe('isBreakingUpdate', () => {
    it('should detect major version change as breaking', () => {
      expect(updater.isBreakingUpdate('1.0.0', '2.0.0')).toBe(true);
      expect(updater.isBreakingUpdate('1.9.9', '2.0.0')).toBe(true);
    });

    it('should not flag minor/patch as breaking', () => {
      expect(updater.isBreakingUpdate('1.0.0', '1.1.0')).toBe(false);
      expect(updater.isBreakingUpdate('1.0.0', '1.0.1')).toBe(false);
    });
  });

  describe('checkConnectivity', () => {
    it('should return boolean', async () => {
      const result = await updater.checkConnectivity();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkForUpdates', () => {
    it('should return installed version', async () => {
      const result = await updater.checkForUpdates();
      expect(result.installed).toBe('1.0.0');
    });

    it('should handle missing installation', async () => {
      await fs.remove(path.join(tempDir, '.aiox-core', 'version.json'));
      const result = await updater.checkForUpdates();
      expect(result.status).toBe(UpdateStatus.CHECK_FAILED);
      expect(result.error).toContain('not installed');
    });
  });

  describe('detectCustomizations', () => {
    it('should detect unchanged files', async () => {
      // Create a file with matching hash
      const testFile = path.join(tempDir, '.aiox-core', 'test-file.md');
      await fs.writeFile(testFile, 'test content');

      // Update version.json with correct hash
      const { hashFile } = require('../../packages/installer/src/installer/file-hasher');
      const hash = `sha256:${hashFile(testFile)}`;

      await fs.writeJson(path.join(tempDir, '.aiox-core', 'version.json'), {
        version: '1.0.0',
        fileHashes: {
          'test-file.md': hash,
        },
      });

      const result = await updater.detectCustomizations();
      expect(result.unchanged).toContain('test-file.md');
    });

    it('should detect missing files', async () => {
      const result = await updater.detectCustomizations();
      expect(result.missing).toContain('test-file.md');
    });

    it('should detect customized files', async () => {
      // Create a file with different content than hash
      const testFile = path.join(tempDir, '.aiox-core', 'test-file.md');
      await fs.writeFile(testFile, 'modified content');

      const result = await updater.detectCustomizations();
      expect(result.customized).toContain('test-file.md');
    });
  });

  describe('createBackup', () => {
    it('should create backup directory', async () => {
      await updater.createBackup();
      expect(updater.backupDir).toBeDefined();
      expect(fs.existsSync(updater.backupDir)).toBe(true);
    });

    it('should backup version.json', async () => {
      await updater.createBackup();
      const backupVersionJson = path.join(updater.backupDir, 'version.json');
      expect(fs.existsSync(backupVersionJson)).toBe(true);
    });
  });

  describe('rollback', () => {
    it('should throw error if no backup', async () => {
      await expect(updater.rollback()).rejects.toThrow('No backup available');
    });

    it('should restore files from backup', async () => {
      // Create backup
      await updater.createBackup();

      // Modify version.json
      await fs.writeJson(path.join(tempDir, '.aiox-core', 'version.json'), {
        version: '2.0.0',
      });

      // Rollback
      await updater.rollback();

      // Verify restored
      const restored = await fs.readJson(path.join(tempDir, '.aiox-core', 'version.json'));
      expect(restored.version).toBe('1.0.0');
    });
  });

  describe('cleanupBackup', () => {
    it('should remove backup directory', async () => {
      await updater.createBackup();
      const backupDir = updater.backupDir;
      expect(fs.existsSync(backupDir)).toBe(true);

      await updater.cleanupBackup();
      expect(fs.existsSync(backupDir)).toBe(false);
      expect(updater.backupDir).toBeNull();
    });
  });

  describe('updateVersionInfo', () => {
    it('should update version.json with new version', async () => {
      await updater.updateVersionInfo('2.0.0');

      const versionJson = await fs.readJson(path.join(tempDir, '.aiox-core', 'version.json'));
      expect(versionJson.version).toBe('2.0.0');
      expect(versionJson.updatedAt).toBeDefined();
    });
  });

  describe('update (dry-run)', () => {
    it('should return preview without making changes', async () => {
      const result = await updater.update({ dryRun: true });

      // Should succeed with dryRun flag
      expect(result.dryRun).toBe(true);
    });
  });
});

describe('formatCheckResult', () => {
  it('should format up-to-date result', () => {
    const result = {
      status: UpdateStatus.UP_TO_DATE,
      installed: '1.0.0',
      latest: '1.0.0',
      hasUpdate: false,
    };

    const output = formatCheckResult(result, { colors: false });
    expect(output).toContain('1.0.0');
    expect(output).toContain('up to date');
  });

  it('should format update available result', () => {
    const result = {
      status: UpdateStatus.UPDATE_AVAILABLE,
      installed: '1.0.0',
      latest: '1.1.0',
      hasUpdate: true,
    };

    const output = formatCheckResult(result, { colors: false });
    expect(output).toContain('1.0.0');
    expect(output).toContain('1.1.0');
    expect(output).toContain('Update available');
  });

  it('should format check failed result', () => {
    const result = {
      status: UpdateStatus.CHECK_FAILED,
      error: 'Network error',
    };

    const output = formatCheckResult(result, { colors: false });
    expect(output).toContain('Check failed');
    expect(output).toContain('Network error');
  });
});

describe('formatUpdateResult', () => {
  it('should format successful update', () => {
    const result = {
      success: true,
      previousVersion: '1.0.0',
      newVersion: '1.1.0',
      filesUpdated: 5,
      filesPreserved: 2,
    };

    const output = formatUpdateResult(result, { colors: false });
    expect(output).toContain('Updated');
    expect(output).toContain('1.1.0');
    expect(output).toContain('5 updated');
    expect(output).toContain('2 customizations');
  });

  it('should format failed update', () => {
    const result = {
      success: false,
      error: 'Connection timeout',
    };

    const output = formatUpdateResult(result, { colors: false });
    expect(output).toContain('failed');
    expect(output).toContain('Connection timeout');
  });
});
