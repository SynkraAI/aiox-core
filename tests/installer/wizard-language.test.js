/**
 * Tests for wizard language delegation to Claude Code settings.json
 *
 * Story ACT-12: Native Language Delegation
 *
 * Test Coverage:
 * - configureEnvironment no longer writes language to core-config.yaml
 * - core-config.yaml generated without language field
 */

const path = require('path');
const fse = require('fs-extra');
const os = require('os');
const yaml = require('js-yaml');

const { configureEnvironment } = require('../../packages/installer/src/config/configure-environment');

describe('ACT-12: Language delegated to Claude Code settings.json', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `aiox-test-lang-${Date.now()}`);
    await fse.ensureDir(tempDir);
    await fse.ensureDir(path.join(tempDir, '.aiox-core'));
  });

  afterEach(async () => {
    await fse.remove(tempDir);
  });

  test('should NOT include language in generated core-config.yaml', async () => {
    const result = await configureEnvironment({
      targetDir: tempDir,
      skipPrompts: true,
    });

    expect(result.coreConfigCreated).toBe(true);

    const configPath = path.join(tempDir, '.aiox-core', 'core-config.yaml');
    const content = await fse.readFile(configPath, 'utf8');
    const config = yaml.load(content);

    expect(config).not.toHaveProperty('language');
  });

  test('should still include user_profile in core-config.yaml', async () => {
    const result = await configureEnvironment({
      targetDir: tempDir,
      userProfile: 'bob',
      skipPrompts: true,
    });

    expect(result.coreConfigCreated).toBe(true);

    const configPath = path.join(tempDir, '.aiox-core', 'core-config.yaml');
    const content = await fse.readFile(configPath, 'utf8');
    const config = yaml.load(content);

    expect(config.user_profile).toBe('bob');
    expect(config).not.toHaveProperty('language');
  });
});
