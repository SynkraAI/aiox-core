/**
 * Unit tests for brownfield-upgrader.js
 * @story 6.18 - Dynamic Manifest & Brownfield Upgrade System
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const yaml = require('js-yaml');
const {
  loadManifest,
  generateUpgradeReport,
  applyUpgrade,
  updateInstalledManifest,
  buildFileMap,
  isUserModified,
  formatUpgradeReport,
} = require('../../packages/installer/src/installer/brownfield-upgrader');
const { hashFile } = require('../../packages/installer/src/installer/file-hasher');

describe('brownfield-upgrader', () => {
  let tempDir;
  let sourceDir;
  let targetDir;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), 'brownfield-test-' + Date.now());
    sourceDir = path.join(tempDir, 'source');
    targetDir = path.join(tempDir, 'target');

    fs.ensureDirSync(sourceDir);
    fs.ensureDirSync(targetDir);
  });

  afterEach(() => {
    fs.removeSync(tempDir);
  });

  describe('loadManifest', () => {
    it('should load valid YAML manifest', () => {
      const manifestPath = path.join(sourceDir, 'install-manifest.yaml');
      const manifestContent = {
        version: '2.0.0',
        files: [{ path: 'test.md', hash: 'sha256:abc123' }],
      };
      fs.writeFileSync(manifestPath, yaml.dump(manifestContent));

      const loaded = loadManifest(sourceDir, 'install-manifest.yaml');
      expect(loaded.version).toBe('2.0.0');
      expect(loaded.files).toHaveLength(1);
    });

    it('should return null for missing manifest', () => {
      const loaded = loadManifest(sourceDir, 'nonexistent.yaml');
      expect(loaded).toBeNull();
    });
  });

  describe('buildFileMap', () => {
    it('should create map from manifest files', () => {
      const manifest = {
        files: [
          { path: 'file1.md', hash: 'sha256:abc' },
          { path: 'file2.md', hash: 'sha256:def' },
        ],
      };

      const map = buildFileMap(manifest);
      expect(map.size).toBe(2);
      expect(map.get('file1.md').hash).toBe('sha256:abc');
    });

    it('should normalize Windows paths', () => {
      const manifest = {
        files: [{ path: 'folder\\file.md', hash: 'sha256:abc' }],
      };

      const map = buildFileMap(manifest);
      expect(map.has('folder/file.md')).toBe(true);
    });

    it('should handle empty manifest', () => {
      const map = buildFileMap({});
      expect(map.size).toBe(0);
    });

    it('should handle null manifest', () => {
      const map = buildFileMap(null);
      expect(map.size).toBe(0);
    });
  });

  describe('isUserModified', () => {
    it('should return false for unmodified file', () => {
      const testFile = path.join(tempDir, 'test.txt');
      fs.writeFileSync(testFile, 'original content');
      const hash = `sha256:${hashFile(testFile)}`;

      expect(isUserModified(testFile, hash)).toBe(false);
    });

    it('should return true for modified file', () => {
      const testFile = path.join(tempDir, 'test.txt');
      fs.writeFileSync(testFile, 'original content');
      const hash = 'sha256:different_hash_value_here';

      expect(isUserModified(testFile, hash)).toBe(true);
    });

    it('should return false for non-existent file', () => {
      const nonExistent = path.join(tempDir, 'missing.txt');
      expect(isUserModified(nonExistent, 'sha256:abc')).toBe(false);
    });
  });

  describe('generateUpgradeReport', () => {
    it('should identify new files', () => {
      const sourceManifest = {
        version: '2.1.0',
        files: [
          { path: 'existing.md', hash: 'sha256:abc', type: 'agent' },
          { path: 'new-file.md', hash: 'sha256:def', type: 'agent' },
        ],
      };
      const installedManifest = {
        installed_version: '2.0.0',
        files: [{ path: 'existing.md', hash: 'sha256:abc' }],
      };

      const report = generateUpgradeReport(sourceManifest, installedManifest, targetDir);

      expect(report.newFiles).toHaveLength(1);
      expect(report.newFiles[0].path).toBe('new-file.md');
    });

    it('should identify modified files', () => {
      const aioxCoreDir = path.join(targetDir, '.aiox-core');
      fs.ensureDirSync(aioxCoreDir);
      fs.writeFileSync(path.join(aioxCoreDir, 'changed.md'), 'original');
      const originalHash = `sha256:${hashFile(path.join(aioxCoreDir, 'changed.md'))}`;

      const sourceManifest = {
        version: '2.1.0',
        files: [{ path: 'changed.md', hash: 'sha256:new_hash', type: 'agent' }],
      };
      const installedManifest = {
        installed_version: '2.0.0',
        files: [{ path: 'changed.md', hash: originalHash }],
      };

      const report = generateUpgradeReport(sourceManifest, installedManifest, targetDir);

      expect(report.modifiedFiles).toHaveLength(1);
    });

    it('should identify user-modified files', () => {
      const aioxCoreDir = path.join(targetDir, '.aiox-core');
      fs.ensureDirSync(aioxCoreDir);
      fs.writeFileSync(path.join(aioxCoreDir, 'user-changed.md'), 'user modified content');

      const sourceManifest = {
        version: '2.1.0',
        files: [{ path: 'user-changed.md', hash: 'sha256:source_hash', type: 'agent' }],
      };
      const installedManifest = {
        installed_version: '2.0.0',
        files: [{ path: 'user-changed.md', hash: 'sha256:original_installed_hash' }],
      };

      const report = generateUpgradeReport(sourceManifest, installedManifest, targetDir);

      expect(report.userModifiedFiles).toHaveLength(1);
      expect(report.userModifiedFiles[0].reason).toContain('User modified');
    });

    it('should identify deleted files', () => {
      const sourceManifest = {
        version: '2.1.0',
        files: [],
      };
      const installedManifest = {
        installed_version: '2.0.0',
        files: [{ path: 'removed.md', hash: 'sha256:abc', type: 'agent' }],
      };

      const report = generateUpgradeReport(sourceManifest, installedManifest, targetDir);

      expect(report.deletedFiles).toHaveLength(1);
      expect(report.deletedFiles[0].path).toBe('removed.md');
    });

    it('should detect upgrade availability via semver', () => {
      const sourceManifest = { version: '2.1.0', files: [] };
      const installedManifest = { installed_version: '2.0.0', files: [] };

      const report = generateUpgradeReport(sourceManifest, installedManifest, targetDir);
      expect(report.upgradeAvailable).toBe(true);
    });

    it('should not flag upgrade when versions equal', () => {
      const sourceManifest = { version: '2.0.0', files: [] };
      const installedManifest = { installed_version: '2.0.0', files: [] };

      const report = generateUpgradeReport(sourceManifest, installedManifest, targetDir);
      expect(report.upgradeAvailable).toBe(false);
    });
  });

  describe('applyUpgrade', () => {
    beforeEach(() => {
      // Setup source files
      fs.ensureDirSync(sourceDir);
      fs.writeFileSync(path.join(sourceDir, 'new-file.md'), 'new content');
      fs.writeFileSync(path.join(sourceDir, 'updated.md'), 'updated content');
    });

    it('should install new files', async () => {
      const report = {
        newFiles: [{ path: 'new-file.md', type: 'agent' }],
        modifiedFiles: [],
        userModifiedFiles: [],
        deletedFiles: [],
      };

      const result = await applyUpgrade(report, sourceDir, targetDir);

      expect(result.success).toBe(true);
      expect(result.filesInstalled).toHaveLength(1);
      expect(fs.existsSync(path.join(targetDir, '.aiox-core', 'new-file.md'))).toBe(true);
    });

    it('should update modified files when includeModified is true', async () => {
      const report = {
        newFiles: [],
        modifiedFiles: [{ path: 'updated.md', type: 'agent' }],
        userModifiedFiles: [],
        deletedFiles: [],
      };

      const result = await applyUpgrade(report, sourceDir, targetDir, { includeModified: true });

      expect(result.filesInstalled.some(f => f.path === 'updated.md')).toBe(true);
    });

    it('should skip user-modified files', async () => {
      const report = {
        newFiles: [],
        modifiedFiles: [],
        userModifiedFiles: [{ path: 'user-file.md', reason: 'User modified' }],
        deletedFiles: [],
      };

      const result = await applyUpgrade(report, sourceDir, targetDir);

      expect(result.filesSkipped).toHaveLength(1);
      expect(result.filesSkipped[0].reason).toContain('preserving local');
    });

    it('should perform dry run without modifying files', async () => {
      const report = {
        newFiles: [{ path: 'new-file.md', type: 'agent' }],
        modifiedFiles: [],
        userModifiedFiles: [],
        deletedFiles: [],
      };

      const result = await applyUpgrade(report, sourceDir, targetDir, { dryRun: true });

      expect(result.filesInstalled).toHaveLength(1);
      expect(fs.existsSync(path.join(targetDir, '.aiox-core', 'new-file.md'))).toBe(false);
    });
  });

  describe('updateInstalledManifest', () => {
    it('should create installed manifest file', () => {
      const sourceManifest = {
        version: '2.1.0',
        files: [{ path: 'test.md', hash: 'sha256:abc' }],
      };

      fs.ensureDirSync(path.join(targetDir, '.aiox-core'));
      updateInstalledManifest(targetDir, sourceManifest, 'aiox-core@2.1.0');

      const installedPath = path.join(targetDir, '.aiox-core', '.installed-manifest.yaml');
      expect(fs.existsSync(installedPath)).toBe(true);

      const content = yaml.load(fs.readFileSync(installedPath, 'utf8'));
      expect(content.installed_version).toBe('2.1.0');
      expect(content.installed_from).toBe('aiox-core@2.1.0');
    });
  });

  describe('formatUpgradeReport', () => {
    it('should format report as string', () => {
      const report = {
        sourceVersion: '2.1.0',
        installedVersion: '2.0.0',
        newFiles: [{ path: 'new.md', type: 'agent' }],
        modifiedFiles: [],
        userModifiedFiles: [],
        deletedFiles: [],
        upgradeAvailable: true,
      };

      const formatted = formatUpgradeReport(report);

      expect(formatted).toContain('2.1.0');
      expect(formatted).toContain('2.0.0');
      expect(formatted).toContain('New Files');
      expect(formatted).toContain('new.md');
    });

    it('should indicate upgrade availability', () => {
      const report = {
        sourceVersion: '2.1.0',
        installedVersion: '2.0.0',
        newFiles: [],
        modifiedFiles: [],
        userModifiedFiles: [],
        deletedFiles: [],
        upgradeAvailable: true,
      };

      const formatted = formatUpgradeReport(report);
      expect(formatted).toContain('Yes');
    });
  });
});
