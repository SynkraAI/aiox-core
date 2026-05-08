'use strict';

const crypto = require('crypto');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const {
  buildEnterpriseUpgradePlan,
  parseEnterpriseUpgradeArgs,
  runEnterpriseUpgradeCli,
  writeEnterpriseUpgradePlan,
} = require('../../../src/enterprise/enterprise-upgrade-plan');

function makeTempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `${name}-`));
}

function writeJson(filePath, data) {
  fs.outputJsonSync(filePath, data, { spaces: 2 });
}

function writeYaml(filePath, data) {
  fs.outputFileSync(filePath, yaml.dump(data, { noRefs: true }), 'utf8');
}

function createCoreInstall(targetDir, version = '5.1.15') {
  writeYaml(path.join(targetDir, '.aiox-core', '.installed-manifest.yaml'), {
    installedVersion: version,
  });
  writeJson(path.join(targetDir, '.aiox-core', 'version.json'), {
    version,
    mode: 'core',
  });
}

function createProInstall(targetDir, version = '2.0.0') {
  writeYaml(path.join(targetDir, 'pro-installed-manifest.yaml'), {
    version,
    files: ['pro-version.json'],
  });
  writeJson(path.join(targetDir, 'pro-version.json'), {
    proVersion: version,
  });
  writeYaml(path.join(targetDir, '.aiox-core', 'pro-config.yaml'), {
    pro: {
      version,
      enabled: true,
    },
  });
  writeYaml(path.join(targetDir, '.aiox-core', 'feature-registry.yaml'), {
    features: {
      pro: true,
    },
  });
}

function createEnterpriseSource(sourceDir, version = '1.0.0') {
  writeYaml(path.join(sourceDir, 'enterprise-config.yaml'), {
    enterprise: {
      product: 'AIOX Enterprise',
      version,
      source: 'SynkraAI/aiox-enterprise',
    },
  });
  writeYaml(path.join(sourceDir, '.aiox-sync.yaml'), {
    active_ides: ['claude', 'codex', 'gemini'],
  });
  writeJson(path.join(sourceDir, 'package.json'), {
    name: 'aiox-enterprise',
    version,
  });
  fs.outputFileSync(path.join(sourceDir, 'scripts', 'hub-sync.js'), "'use strict';\n", 'utf8');
}

function createStream() {
  let output = '';
  return {
    write(chunk) {
      output += chunk;
    },
    getOutput() {
      return output;
    },
  };
}

function fileSnapshot(rootDir) {
  const snapshot = {};

  function visit(currentDir) {
    for (const item of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const absolutePath = path.join(currentDir, item.name);
      const relativePath = path.relative(rootDir, absolutePath).split(path.sep).join('/');

      if (item.isDirectory()) {
        visit(absolutePath);
        continue;
      }

      const hash = crypto
        .createHash('sha256')
        .update(fs.readFileSync(absolutePath))
        .digest('hex');
      snapshot[relativePath] = hash;
    }
  }

  visit(rootDir);
  return snapshot;
}

describe('Enterprise upgrade dry-run planning', () => {
  let tempDirs;

  beforeEach(() => {
    tempDirs = [];
  });

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.removeSync(dir);
    }
  });

  function temp(name) {
    const dir = makeTempDir(name);
    tempDirs.push(dir);
    return dir;
  }

  test('fails when AIOX Core installation is not detected', () => {
    const targetDir = temp('aiox-no-core');
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);

    expect(() => buildEnterpriseUpgradePlan({ targetDir, enterpriseSource }))
      .toThrow('AIOX Core installation not detected');
  });

  test('fails when AIOX Core exists without Pro activation', () => {
    const targetDir = temp('aiox-core-no-pro');
    const enterpriseSource = temp('aiox-enterprise-source');
    createCoreInstall(targetDir);
    createEnterpriseSource(enterpriseSource);

    expect(() => buildEnterpriseUpgradePlan({ targetDir, enterpriseSource }))
      .toThrow('AIOX Pro activation not detected');
  });

  test('creates a parseable dry-run plan for Core plus Pro projects', () => {
    const targetDir = temp('aiox-pro-target');
    const enterpriseSource = temp('aiox-enterprise-source');
    createCoreInstall(targetDir, '5.1.15');
    createProInstall(targetDir, '2.3.4');
    createEnterpriseSource(enterpriseSource, '1.2.0');
    fs.ensureDirSync(path.join(targetDir, '.codex'));
    fs.ensureDirSync(path.join(targetDir, '.claude'));

    const plan = buildEnterpriseUpgradePlan({ targetDir, enterpriseSource });
    const serialized = yaml.dump(plan);
    const parsed = yaml.load(serialized);

    expect(parsed.mode).toBe('dry-run');
    expect(parsed.pro.source).toBe('installed-manifest');
    expect(parsed.pro.version).toBe('2.3.4');
    expect(parsed.pro.manifestPath).toBe('pro-installed-manifest.yaml');
    expect(parsed.enterprise.product).toBe('AIOX Enterprise');
    expect(parsed.enterprise.version).toBe('1.2.0');
    expect(parsed.enterprise.source).toBe('SynkraAI/aiox-enterprise');
    expect(parsed.activeIdes.map(ide => ide.id)).toEqual(['claude', 'codex']);
    expect(parsed.preservedPaths).toEqual(expect.arrayContaining([
      '.env*',
      'workspace/businesses/**',
      'outputs/**',
      'docs/stories/**',
    ]));
    expect(parsed.candidateOps.length).toBeGreaterThan(0);
    expect(parsed.blockedOps.map(op => op.path)).toEqual(expect.arrayContaining(['.env*']));
    expect(parsed.warnings).toContain('Dry-run mode: no files will be modified.');
    expect(parsed.warnings).not.toContain('Dry-run only: apply, rollback, and validation policy are implemented in later slices.');
  });

  test.each([
    '--target',
    '--enterprise-source',
    '--manifest',
    '--plan',
    '--format',
  ])('fails fast when %s is missing its value', optionName => {
    expect(() => parseEnterpriseUpgradeArgs(['upgrade', optionName, '--dry-run']))
      .toThrow(`Missing value for ${optionName}`);
  });

  test('fails when the Enterprise source is invalid', () => {
    const targetDir = temp('aiox-pro-target');
    const enterpriseSource = temp('invalid-enterprise-source');
    createCoreInstall(targetDir);
    createProInstall(targetDir);

    expect(() => buildEnterpriseUpgradePlan({ targetDir, enterpriseSource }))
      .toThrow('AIOX Enterprise source not detected');
  });

  test('writes only the requested plan file during dry-run', () => {
    const targetDir = temp('aiox-dry-run-target');
    const enterpriseSource = temp('aiox-enterprise-source');
    const planPath = path.join(targetDir, 'outputs', 'enterprise-upgrade-plan.yaml');
    createCoreInstall(targetDir);
    createProInstall(targetDir);
    createEnterpriseSource(enterpriseSource);
    fs.ensureDirSync(path.join(targetDir, 'outputs'));
    fs.outputFileSync(path.join(targetDir, 'README.md'), '# Existing project\n', 'utf8');

    const before = fileSnapshot(targetDir);
    const plan = buildEnterpriseUpgradePlan({ targetDir, enterpriseSource });
    writeEnterpriseUpgradePlan(plan, planPath);
    const after = fileSnapshot(targetDir);
    delete after['outputs/enterprise-upgrade-plan.yaml'];

    expect(after).toEqual(before);
    expect(yaml.load(fs.readFileSync(planPath, 'utf8')).mode).toBe('dry-run');
  });

  test('CLI returns non-zero for missing prereqs and zero for valid dry-run', async () => {
    const invalidTarget = temp('aiox-cli-invalid-target');
    const validTarget = temp('aiox-cli-valid-target');
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);
    createCoreInstall(validTarget);
    createProInstall(validTarget);

    const badOut = createStream();
    const badErr = createStream();
    const badCode = await runEnterpriseUpgradeCli([
      'upgrade',
      '--target',
      invalidTarget,
      '--enterprise-source',
      enterpriseSource,
      '--dry-run',
    ], { stdout: badOut, stderr: badErr });

    expect(badCode).toBe(1);
    expect(badErr.getOutput()).toContain('AIOX Core installation not detected');

    const planPath = path.join(validTarget, 'outputs', 'enterprise-upgrade-plan.yaml');
    const goodOut = createStream();
    const goodErr = createStream();
    const goodCode = await runEnterpriseUpgradeCli([
      'upgrade',
      '--target',
      validTarget,
      '--enterprise-source',
      enterpriseSource,
      '--dry-run',
      '--plan',
      planPath,
    ], { stdout: goodOut, stderr: goodErr });

    expect(goodCode).toBe(0);
    expect(goodErr.getOutput()).toBe('');
    expect(goodOut.getOutput()).toContain('Enterprise upgrade plan written:');
    expect(yaml.load(fs.readFileSync(planPath, 'utf8')).mode).toBe('dry-run');
  });
});
