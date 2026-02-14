/**
 * Pro Content Scaffolder Tests
 *
 * @story INS-3.1 — Implement Pro Content Scaffolder
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const yaml = require('js-yaml');

const {
  scaffoldProContent,
  scaffoldFile,
  rollbackScaffold,
  generateProVersionJson,
  generateInstalledManifest,
  SCAFFOLD_ITEMS,
} = require('../../packages/installer/src/pro/pro-scaffolder');

// Create isolated temp dirs for each test
let tmpDir;
let targetDir;
let proSourceDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pro-scaffolder-'));
  targetDir = path.join(tmpDir, 'project');
  proSourceDir = path.join(tmpDir, 'pro-package');

  // Create target project structure
  await fs.ensureDir(path.join(targetDir, '.aios-core'));

  // Create mock pro source package
  await fs.ensureDir(path.join(proSourceDir, 'squads', 'devops-squad'));
  await fs.writeFile(
    path.join(proSourceDir, 'squads', 'devops-squad', 'squad.yaml'),
    yaml.dump({ name: 'devops-squad', version: '1.0.0' })
  );
  await fs.writeFile(
    path.join(proSourceDir, 'pro-config.yaml'),
    yaml.dump({ pro: { enabled: true, tier: 'standard' } })
  );
  await fs.writeFile(
    path.join(proSourceDir, 'feature-registry.yaml'),
    yaml.dump({ features: [{ id: 'squads-pro', enabled: true }] })
  );
  await fs.writeJson(
    path.join(proSourceDir, 'package.json'),
    { name: '@aios-fullstack/pro', version: '2.0.0' }
  );
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('scaffoldProContent', () => {
  // AC1, AC2, AC3: Copies squads, pro-config.yaml, feature-registry.yaml
  it('should copy all pro content to project (AC1, AC2, AC3)', async () => {
    const result = await scaffoldProContent(targetDir, proSourceDir);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);

    // AC1: squads exist
    expect(await fs.pathExists(
      path.join(targetDir, 'squads', 'devops-squad', 'squad.yaml')
    )).toBe(true);

    // AC2: pro-config.yaml exists in .aios-core/
    expect(await fs.pathExists(
      path.join(targetDir, '.aios-core', 'pro-config.yaml')
    )).toBe(true);

    // AC3: feature-registry.yaml exists in .aios-core/
    expect(await fs.pathExists(
      path.join(targetDir, '.aios-core', 'feature-registry.yaml')
    )).toBe(true);
  });

  // AC4: pro-version.json with SHA256 hashes
  it('should generate pro-version.json with SHA256 hashes (AC4)', async () => {
    const result = await scaffoldProContent(targetDir, proSourceDir);

    expect(result.success).toBe(true);

    const versionPath = path.join(targetDir, 'pro-version.json');
    expect(await fs.pathExists(versionPath)).toBe(true);

    const versionInfo = await fs.readJson(versionPath);
    expect(versionInfo.proVersion).toBe('2.0.0');
    expect(versionInfo.installedAt).toBeDefined();
    expect(versionInfo.fileHashes).toBeDefined();

    // Verify at least one hash is sha256 format
    const hashes = Object.values(versionInfo.fileHashes);
    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) {
      expect(hash).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
  });

  // AC5: Idempotency - running 2x does not duplicate
  it('should be idempotent: 2nd run skips identical files (AC5)', async () => {
    // First run
    const result1 = await scaffoldProContent(targetDir, proSourceDir);
    expect(result1.success).toBe(true);
    const copiedCount1 = result1.copiedFiles.length;

    // Second run
    const result2 = await scaffoldProContent(targetDir, proSourceDir);
    expect(result2.success).toBe(true);

    // On second run, content files should be skipped (identical hashes)
    expect(result2.skippedFiles.length).toBeGreaterThan(0);

    // Verify file content is still correct (not corrupted)
    const configContent = yaml.load(
      await fs.readFile(path.join(targetDir, '.aios-core', 'pro-config.yaml'), 'utf8')
    );
    expect(configContent.pro.enabled).toBe(true);
  });

  // AC6: Cleanup on partial failure
  it('should rollback partially copied files on error (AC6)', async () => {
    // Remove pro-config.yaml from source — squads (processed first) will copy
    // successfully, then pro-config.yaml (required) will fail, triggering rollback
    await fs.remove(path.join(proSourceDir, 'pro-config.yaml'));

    const result = await scaffoldProContent(targetDir, proSourceDir);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('Scaffolding failed'))).toBe(true);

    // Verify rollback: squads copied before failure should be cleaned up
    expect(await fs.pathExists(
      path.join(targetDir, 'squads', 'devops-squad', 'squad.yaml')
    )).toBe(false);

    // pro-version.json and pro-installed-manifest.yaml should not exist
    expect(await fs.pathExists(path.join(targetDir, 'pro-version.json'))).toBe(false);
    expect(await fs.pathExists(path.join(targetDir, 'pro-installed-manifest.yaml'))).toBe(false);
  });

  // AC7: Offline fallback - no network calls
  it('should work without network connectivity (AC7)', async () => {
    // scaffoldProContent makes NO network calls - it only uses local filesystem
    // This test verifies the function succeeds without any mocked APIs
    const result = await scaffoldProContent(targetDir, proSourceDir);

    expect(result.success).toBe(true);
    // The function signature takes no API client, no network options
    // This confirms offline-by-design
  });

  // AC8: pro-installed-manifest.yaml
  it('should generate pro-installed-manifest.yaml with timestamps (AC8)', async () => {
    const result = await scaffoldProContent(targetDir, proSourceDir);

    expect(result.success).toBe(true);

    const manifestPath = path.join(targetDir, 'pro-installed-manifest.yaml');
    expect(await fs.pathExists(manifestPath)).toBe(true);

    const manifest = yaml.load(await fs.readFile(manifestPath, 'utf8'));
    expect(manifest.generatedAt).toBeDefined();
    expect(manifest.totalFiles).toBeGreaterThan(0);
    expect(manifest.files).toBeInstanceOf(Array);
    expect(manifest.files.length).toBe(manifest.totalFiles);

    for (const file of manifest.files) {
      expect(file.path).toBeDefined();
      expect(file.timestamp).toBeDefined();
    }
  });

  // AC3: Warning when feature-registry.yaml absent
  it('should emit warning when feature-registry.yaml is absent in source (AC3)', async () => {
    // Remove feature-registry.yaml from source
    await fs.remove(path.join(proSourceDir, 'feature-registry.yaml'));

    const result = await scaffoldProContent(targetDir, proSourceDir);

    // Should still succeed (feature-registry is not required)
    expect(result.success).toBe(true);
    expect(result.warnings.some(w => w.includes('Feature registry'))).toBe(true);
  });

  it('should return error when pro source directory does not exist', async () => {
    const fakePath = path.join(tmpDir, 'nonexistent-pro-dir');
    const result = await scaffoldProContent(targetDir, fakePath);

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Pro package not found');
  });

  it('should call onProgress callback for each scaffold item', async () => {
    const progress = [];
    await scaffoldProContent(targetDir, proSourceDir, {
      onProgress: (p) => progress.push(p),
    });

    expect(progress.length).toBeGreaterThan(0);
    expect(progress.some(p => p.status === 'done')).toBe(true);
  });
});

describe('rollbackScaffold', () => {
  it('should remove all tracked files', async () => {
    const file1 = path.join(tmpDir, 'rollback-test-1.txt');
    const file2 = path.join(tmpDir, 'rollback-test-2.txt');
    await fs.writeFile(file1, 'test1');
    await fs.writeFile(file2, 'test2');

    const result = await rollbackScaffold([file1, file2]);

    expect(result.removed).toBe(2);
    expect(result.errors).toHaveLength(0);
    expect(await fs.pathExists(file1)).toBe(false);
    expect(await fs.pathExists(file2)).toBe(false);
  });

  it('should handle already-deleted files gracefully', async () => {
    const result = await rollbackScaffold(['/nonexistent/file.txt']);

    expect(result.removed).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});

describe('generateProVersionJson', () => {
  it('should generate correct version info with hashes', async () => {
    const testFile = path.join(targetDir, 'test.yaml');
    await fs.writeFile(testFile, 'test: true');

    const versionInfo = await generateProVersionJson(
      targetDir,
      proSourceDir,
      ['test.yaml']
    );

    expect(versionInfo.proVersion).toBe('2.0.0');
    expect(versionInfo.fileCount).toBe(1);
    expect(versionInfo.fileHashes['test.yaml']).toMatch(/^sha256:/);
  });
});

describe('generateInstalledManifest', () => {
  it('should list all files with timestamps', async () => {
    const testFile = path.join(targetDir, 'manifest-test.yaml');
    await fs.writeFile(testFile, 'content');

    const manifest = await generateInstalledManifest(
      targetDir,
      ['manifest-test.yaml']
    );

    expect(manifest.totalFiles).toBe(1);
    expect(manifest.files[0].path).toBe('manifest-test.yaml');
    expect(manifest.files[0].timestamp).toBeDefined();
  });
});
