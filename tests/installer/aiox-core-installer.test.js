/**
 * AIOX Core Installer Tests
 *
 * @story Story 7.2: Version Tracking
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  installAioxCore,
  ensureProjectNodeModulesLink,
  copyDirectoryWithRootReplacement,
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

  describe('brownfield preservation', () => {
    it('should keep nested relative paths when copying directories', async () => {
      const sourceDir = path.join(tempDir, 'source', 'development');
      const destDir = path.join(tempDir, 'target', '.aiox-core', 'development');

      await fs.ensureDir(path.join(sourceDir, 'agents'));
      await fs.writeFile(path.join(sourceDir, 'agents', 'dev.md'), '# Dev');

      const copied = await copyDirectoryWithRootReplacement(sourceDir, destDir, null, {
        baseDir: destDir,
      });

      expect(copied).toContain('agents/dev.md');
    });

    it('should preserve agent MEMORY.md during brownfield install', async () => {
      const sourceDir = path.join(tempDir, 'package-source');
      const targetDir = path.join(tempDir, 'project');
      const existingMemoryPath = path.join(
        targetDir,
        '.aiox-core',
        'development',
        'agents',
        'dev',
        'MEMORY.md',
      );

      await fs.ensureDir(path.join(sourceDir, 'development', 'agents', 'dev'));
      await fs.writeFile(
        path.join(sourceDir, 'development', 'agents', 'dev', 'MEMORY.md'),
        'framework memory',
        'utf8',
      );

      await fs.ensureDir(path.dirname(existingMemoryPath));
      await fs.writeFile(existingMemoryPath, 'custom project memory', 'utf8');

      const result = await installAioxCore({
        targetDir,
        sourceDir,
        projectType: 'brownfield',
        packageVersion: '9.9.9',
      });

      expect(result.success).toBe(true);
      expect(await fs.readFile(existingMemoryPath, 'utf8')).toBe('custom project memory');
    });
  });

  describe('ensureProjectNodeModulesLink', () => {
    it('should link project node_modules to .aiox-core dependencies when absent', async () => {
      const frameworkNodeModules = path.join(tempDir, '.aiox-core', 'node_modules');
      await fs.ensureDir(path.join(frameworkNodeModules, 'js-yaml'));
      await fs.writeFile(
        path.join(frameworkNodeModules, 'js-yaml', 'index.js'),
        'module.exports = { ok: true };\n',
      );

      const result = await ensureProjectNodeModulesLink({ targetDir: tempDir });

      expect(result.success).toBe(true);
      expect(result.linked).toBe(true);
      expect(await fs.pathExists(path.join(tempDir, 'node_modules'))).toBe(true);
      expect(await fs.realpath(path.join(tempDir, 'node_modules'))).toBe(
        await fs.realpath(frameworkNodeModules),
      );

      const resolved = require.resolve('js-yaml', {
        paths: [path.join(tempDir, 'squads', 'example', 'scripts')],
      });
      expect(resolved).toContain(path.join('js-yaml', 'index.js'));
    });

    it('should not overwrite an existing project node_modules directory', async () => {
      await fs.ensureDir(path.join(tempDir, 'node_modules', 'existing-package'));
      await fs.ensureDir(path.join(tempDir, '.aiox-core', 'node_modules', 'js-yaml'));

      const result = await ensureProjectNodeModulesLink({ targetDir: tempDir });

      expect(result.success).toBe(true);
      expect(result.linked).toBe(false);
      expect(result.reason).toBe('project-node-modules-exists');
      expect(await fs.pathExists(path.join(tempDir, 'node_modules', 'existing-package'))).toBe(true);
    });

    it('should report missing .aiox-core dependencies without throwing', async () => {
      const result = await ensureProjectNodeModulesLink({ targetDir: tempDir });

      expect(result.success).toBe(false);
      expect(result.linked).toBe(false);
      expect(result.reason).toBe('framework-node-modules-missing');
    });
  });
});
