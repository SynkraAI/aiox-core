'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const {
  applyEnterpriseUpgrade,
} = require('../../../src/enterprise/enterprise-upgrader');
const {
  rollbackEnterpriseUpgrade,
} = require('../../../src/enterprise/enterprise-rollback');
const {
  runEnterpriseUpgradeCli,
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
}

function createProInstall(targetDir, version = '2.0.0') {
  fs.ensureDirSync(path.join(targetDir, 'pro'));
  writeYaml(path.join(targetDir, 'pro-installed-manifest.yaml'), {
    version,
  });
  writeJson(path.join(targetDir, 'pro-version.json'), {
    proVersion: version,
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
    active_ides: ['claude', 'codex'],
  });
  writeJson(path.join(sourceDir, 'package.json'), {
    name: 'aiox-enterprise',
    version,
  });
  fs.outputFileSync(path.join(sourceDir, 'scripts', 'hub-sync.js'), "module.exports = 'enterprise';\n", 'utf8');
  fs.outputFileSync(path.join(sourceDir, 'workspace', '_templates', 'secret-template.yaml'), 'secret: true\n', 'utf8');
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

describe('Enterprise transactional upgrader and rollback', () => {
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

  function createReadyTarget() {
    const targetDir = temp('aiox-apply-target');
    createCoreInstall(targetDir);
    createProInstall(targetDir);
    return targetDir;
  }

  test('apply refuses to run without Enterprise entitlement or test fixture flag', () => {
    const targetDir = createReadyTarget();
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);

    expect(() => applyEnterpriseUpgrade({
      targetDir,
      enterpriseSource,
      env: {},
    })).toThrow(/Enterprise entitlement required/);
  });

  test('apply creates backup before overwriting a changed file and writes execution manifest', () => {
    const targetDir = createReadyTarget();
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);
    fs.outputFileSync(path.join(targetDir, 'scripts', 'hub-sync.js'), "module.exports = 'target';\n", 'utf8');

    const result = applyEnterpriseUpgrade({
      targetDir,
      enterpriseSource,
      env: { AIOX_ENTERPRISE_TEST_FIXTURE: '1' },
      timestamp: '20260508070126',
    });
    const manifest = yaml.load(fs.readFileSync(result.manifestPath, 'utf8'));

    expect(result.success).toBe(true);
    expect(fs.readFileSync(path.join(targetDir, 'scripts', 'hub-sync.js'), 'utf8')).toContain('enterprise');
    expect(manifest.backedUp.map(entry => entry.path)).toContain('scripts/hub-sync.js');
    expect(fs.existsSync(path.join(targetDir, '.aiox', 'enterprise-upgrade-backups', '20260508070126', 'scripts', 'hub-sync.js'))).toBe(true);
    expect(manifest.copied.length).toBeGreaterThan(0);
    expect(manifest.merged.map(entry => entry.path)).toEqual(expect.arrayContaining([
      'enterprise-config.yaml',
      '.aiox-sync.yaml',
    ]));
    expect(Array.isArray(manifest.preserved)).toBe(true);
    expect(Array.isArray(manifest.denied)).toBe(true);
    expect(Array.isArray(manifest.validated)).toBe(true);
    expect(Array.isArray(manifest.errors)).toBe(true);
  });

  test('apply preserves copy-if-missing destinations and denies sensitive allowlist matches', () => {
    const targetDir = createReadyTarget();
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);
    fs.outputFileSync(path.join(targetDir, 'workspace', '_templates', 'existing.yaml'), 'target: true\n', 'utf8');
    fs.outputFileSync(path.join(enterpriseSource, 'workspace', '_templates', 'existing.yaml'), 'source: true\n', 'utf8');

    const result = applyEnterpriseUpgrade({
      targetDir,
      enterpriseSource,
      env: { AIOX_ENTERPRISE_TEST_FIXTURE: '1' },
    });
    const manifest = yaml.load(fs.readFileSync(result.manifestPath, 'utf8'));

    expect(fs.readFileSync(path.join(targetDir, 'workspace', '_templates', 'existing.yaml'), 'utf8')).toContain('target');
    expect(manifest.preserved.map(entry => entry.path)).toContain('workspace/_templates/existing.yaml');
    expect(manifest.denied.map(entry => entry.path)).toContain('workspace/_templates/secret-template.yaml');
    expect(fs.existsSync(path.join(targetDir, 'workspace', '_templates', 'secret-template.yaml'))).toBe(false);
  });

  test('merge-yaml unions arrays while preserving target order', () => {
    const targetDir = createReadyTarget();
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);
    writeYaml(path.join(targetDir, '.aiox-sync.yaml'), {
      active_ides: ['codex'],
    });

    applyEnterpriseUpgrade({
      targetDir,
      enterpriseSource,
      env: { AIOX_ENTERPRISE_TEST_FIXTURE: '1' },
    });
    const merged = yaml.load(fs.readFileSync(path.join(targetDir, '.aiox-sync.yaml'), 'utf8'));

    expect(merged.active_ides).toEqual(['codex', 'claude']);
  });

  test('rollback restores backed up files from execution manifest', () => {
    const targetDir = createReadyTarget();
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);
    const targetHubSync = path.join(targetDir, 'scripts', 'hub-sync.js');
    fs.outputFileSync(targetHubSync, "module.exports = 'target';\n", 'utf8');

    const result = applyEnterpriseUpgrade({
      targetDir,
      enterpriseSource,
      env: { AIOX_ENTERPRISE_TEST_FIXTURE: '1' },
      timestamp: '20260508070127',
    });
    rollbackEnterpriseUpgrade(result.manifestPath);

    expect(fs.readFileSync(targetHubSync, 'utf8')).toContain('target');
    expect(fs.existsSync(path.join(targetDir, '.aiox', 'enterprise-upgrade-rollback.yaml'))).toBe(true);
  });

  test('apply keeps Pro markers and records doctor output when available', () => {
    const targetDir = createReadyTarget();
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);
    fs.outputFileSync(
      path.join(targetDir, 'bin', 'aiox.js'),
      'console.log(JSON.stringify({ summary: { fail: 0 } }));\n',
      'utf8',
    );

    const result = applyEnterpriseUpgrade({
      targetDir,
      enterpriseSource,
      env: { AIOX_ENTERPRISE_TEST_FIXTURE: '1' },
    });
    const manifest = yaml.load(fs.readFileSync(result.manifestPath, 'utf8'));

    expect(fs.existsSync(path.join(targetDir, 'pro'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'pro-installed-manifest.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'pro-version.json'))).toBe(true);
    expect(manifest.validated.filter(entry => entry.type === 'pro-marker-preserved').every(entry => entry.exists)).toBe(true);
    expect(manifest.doctor.skipped).toBe(false);
    expect(manifest.doctor.stdout).toContain('"fail":0');
  });

  test('CLI apply and rollback return expected exit codes', async () => {
    const targetDir = createReadyTarget();
    const enterpriseSource = temp('aiox-enterprise-source');
    createEnterpriseSource(enterpriseSource);
    fs.outputFileSync(path.join(targetDir, 'scripts', 'hub-sync.js'), "module.exports = 'target';\n", 'utf8');

    const out = createStream();
    const err = createStream();
    const previousFixture = process.env.AIOX_ENTERPRISE_TEST_FIXTURE;
    process.env.AIOX_ENTERPRISE_TEST_FIXTURE = '1';

    try {
      const applyCode = await runEnterpriseUpgradeCli([
        'upgrade',
        '--target',
        targetDir,
        '--enterprise-source',
        enterpriseSource,
        '--apply',
      ], { stdout: out, stderr: err });

      expect(applyCode).toBe(0);
      expect(out.getOutput()).toContain('Enterprise upgrade applied:');

      const rollbackOut = createStream();
      const rollbackErr = createStream();
      const rollbackCode = await runEnterpriseUpgradeCli([
        'upgrade',
        'rollback',
        '--manifest',
        path.join(targetDir, '.aiox', 'enterprise-upgrade-manifest.yaml'),
      ], { stdout: rollbackOut, stderr: rollbackErr });

      expect(rollbackCode).toBe(0);
      expect(rollbackErr.getOutput()).toBe('');
      expect(rollbackOut.getOutput()).toContain('Enterprise upgrade rollback written:');
    } finally {
      if (previousFixture === undefined) {
        delete process.env.AIOX_ENTERPRISE_TEST_FIXTURE;
      } else {
        process.env.AIOX_ENTERPRISE_TEST_FIXTURE = previousFixture;
      }
    }
  });
});
