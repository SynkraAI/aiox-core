const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const yaml = require('js-yaml');

const { configureEnvironment } = require('../../packages/installer/src/config/configure-environment');

describe('configureEnvironment brownfield merge behavior', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-config-brownfield-'));
    await fs.ensureDir(path.join(tempDir, '.aiox-core'));
  });

  afterEach(async () => {
    if (tempDir && await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  it('should merge .env.example and core-config.yaml for lowercase brownfield projectType', async () => {
    await fs.writeFile(
      path.join(tempDir, '.env.example'),
      'CUSTOM_ONLY=keep-me\nCIRCLE_TOKEN=\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(tempDir, '.aiox-core', 'core-config.yaml'),
      yaml.dump({
        user_profile: 'bob',
        metrics: {
          custom: true,
        },
      }),
      'utf8',
    );

    const result = await configureEnvironment({
      targetDir: tempDir,
      projectType: 'brownfield',
      userProfile: 'advanced',
      skipPrompts: true,
    });

    expect(result.envExampleCreated).toBe(true);
    expect(result.coreConfigCreated).toBe(true);

    const envExample = await fs.readFile(path.join(tempDir, '.env.example'), 'utf8');
    expect(envExample).toContain('CUSTOM_ONLY=keep-me');
    expect(envExample).toContain('OPENAI_API_KEY=');

    const coreConfig = yaml.load(
      await fs.readFile(path.join(tempDir, '.aiox-core', 'core-config.yaml'), 'utf8'),
    );
    expect(coreConfig.user_profile).toBe('bob');
    expect(coreConfig.metrics).toEqual({ custom: true });
    expect(coreConfig.boundary.frameworkProtection).toBe(true);
  });
});
