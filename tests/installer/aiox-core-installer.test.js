/**
 * AIOX Core Installer Tests
 *
 * @story Story 7.2: Version Tracking
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  generateFileHashes,
  generateVersionJson,
} = require('../../packages/installer/src/installer/aiox-core-installer');

describe('AIOX Core Installer - Version Tracking', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-installer-test-'));
    await fs.ensureDir(path.join(tempDir, '.aiox-core'));
  });

  afterEach(async () => {
    if (tempDir && fs.existsSync(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('generateFileHashes', () => {
    it('should generate hashes for installed files', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      // Create test files
      await fs.writeFile(path.join(aioxCoreDir, 'test1.md'), '# Test File 1');
      await fs.writeFile(path.join(aioxCoreDir, 'test2.md'), '# Test File 2');
      await fs.ensureDir(path.join(aioxCoreDir, 'agents'));
      await fs.writeFile(path.join(aioxCoreDir, 'agents', 'dev.md'), '# Dev Agent');

      const installedFiles = ['test1.md', 'test2.md', 'agents/dev.md'];
      const hashes = await generateFileHashes(aioxCoreDir, installedFiles);

      expect(Object.keys(hashes)).toHaveLength(3);
      expect(hashes['test1.md']).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(hashes['test2.md']).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(hashes['agents/dev.md']).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('should skip non-existent files', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      // Create only one file
      await fs.writeFile(path.join(aioxCoreDir, 'exists.md'), '# Exists');

      const installedFiles = ['exists.md', 'does-not-exist.md'];
      const hashes = await generateFileHashes(aioxCoreDir, installedFiles);

      expect(Object.keys(hashes)).toHaveLength(1);
      expect(hashes['exists.md']).toBeDefined();
      expect(hashes['does-not-exist.md']).toBeUndefined();
    });

    it('should skip directories', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      await fs.ensureDir(path.join(aioxCoreDir, 'agents'));
      await fs.writeFile(path.join(aioxCoreDir, 'file.md'), '# File');

      const installedFiles = ['file.md', 'agents'];
      const hashes = await generateFileHashes(aioxCoreDir, installedFiles);

      expect(Object.keys(hashes)).toHaveLength(1);
      expect(hashes['file.md']).toBeDefined();
      expect(hashes['agents']).toBeUndefined();
    });

    it('should generate consistent hashes for same content', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      await fs.writeFile(path.join(aioxCoreDir, 'file1.md'), 'Same content');
      await fs.writeFile(path.join(aioxCoreDir, 'file2.md'), 'Same content');

      const installedFiles = ['file1.md', 'file2.md'];
      const hashes = await generateFileHashes(aioxCoreDir, installedFiles);

      expect(hashes['file1.md']).toBe(hashes['file2.md']);
    });

    it('should generate different hashes for different content', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      await fs.writeFile(path.join(aioxCoreDir, 'file1.md'), 'Content A');
      await fs.writeFile(path.join(aioxCoreDir, 'file2.md'), 'Content B');

      const installedFiles = ['file1.md', 'file2.md'];
      const hashes = await generateFileHashes(aioxCoreDir, installedFiles);

      expect(hashes['file1.md']).not.toBe(hashes['file2.md']);
    });
  });

  describe('generateVersionJson', () => {
    it('should create version.json with correct structure', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      // Create test files
      await fs.writeFile(path.join(aioxCoreDir, 'test.md'), '# Test');

      const result = await generateVersionJson({
        targetAioxCore: aioxCoreDir,
        version: '1.2.0',
        installedFiles: ['test.md'],
        mode: 'project-development',
      });

      expect(result.version).toBe('1.2.0');
      expect(result.mode).toBe('project-development');
      expect(result.installedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.fileHashes).toBeDefined();
      expect(result.fileHashes['test.md']).toMatch(/^sha256:/);
      expect(result.customized).toEqual([]);
    });

    it('should write version.json to disk', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      await fs.writeFile(path.join(aioxCoreDir, 'agent.md'), '# Agent');

      await generateVersionJson({
        targetAioxCore: aioxCoreDir,
        version: '2.0.0',
        installedFiles: ['agent.md'],
        mode: 'framework-development',
      });

      const versionJsonPath = path.join(aioxCoreDir, 'version.json');
      expect(fs.existsSync(versionJsonPath)).toBe(true);

      const versionJson = await fs.readJson(versionJsonPath);
      expect(versionJson.version).toBe('2.0.0');
      expect(versionJson.mode).toBe('framework-development');
    });

    it('should use default mode when not specified', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      const result = await generateVersionJson({
        targetAioxCore: aioxCoreDir,
        version: '1.0.0',
        installedFiles: [],
      });

      expect(result.mode).toBe('project-development');
    });

    it('should include file hashes in version.json', async () => {
      const aioxCoreDir = path.join(tempDir, '.aiox-core');

      await fs.ensureDir(path.join(aioxCoreDir, 'agents'));
      await fs.writeFile(path.join(aioxCoreDir, 'agents', 'dev.md'), '# Dev');
      await fs.writeFile(path.join(aioxCoreDir, 'config.yaml'), 'key: value');

      const result = await generateVersionJson({
        targetAioxCore: aioxCoreDir,
        version: '1.0.0',
        installedFiles: ['agents/dev.md', 'config.yaml'],
      });

      expect(Object.keys(result.fileHashes)).toHaveLength(2);
      expect(result.fileHashes['agents/dev.md']).toBeDefined();
      expect(result.fileHashes['config.yaml']).toBeDefined();
    });
  });
});
