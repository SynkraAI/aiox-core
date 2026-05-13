'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const {
  loadEnterpriseUpgradeManifest,
  pathMatchesPattern,
  resolveMigrationPolicy,
} = require('../../../src/enterprise/enterprise-manifest-loader');
const {
  buildEnterpriseUpgradePlan,
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
  fs.outputFileSync(path.join(sourceDir, 'scripts', 'hub-sync.js'), "'use strict';\n", 'utf8');
}

describe('Enterprise upgrade manifest loader', () => {
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

  test('loads and validates the default Enterprise upgrade manifest', () => {
    const { manifest } = loadEnterpriseUpgradeManifest();

    expect(manifest.kind).toBe('aiox.enterprise.upgrade-manifest');
    expect(manifest.entitlement.envVar).toBe('AIOX_ENTERPRISE_KEY');
    expect(manifest.groups.map(group => group.id)).toEqual(expect.arrayContaining([
      'config',
      'ide-surfaces',
      'workspace-templates',
      'workspace-scripts',
      'services',
      'squads',
      'governance',
      'docs',
    ]));
  });

  test('invalid manifest fails with actionable schema error', () => {
    const manifestPath = path.join(temp('invalid-manifest'), 'manifest.yaml');
    writeYaml(manifestPath, {
      schemaVersion: '1.0',
      kind: 'aiox.enterprise.upgrade-manifest',
      allowlist: [],
    });

    expect(() => loadEnterpriseUpgradeManifest(manifestPath))
      .toThrow(/Enterprise upgrade manifest invalid:/);
  });

  test('deny and preserve rules take precedence over allowlist matches', () => {
    const { manifest } = loadEnterpriseUpgradeManifest();
    const envPolicy = resolveMigrationPolicy('.env.production', manifest);
    const secretPolicy = resolveMigrationPolicy('workspace/_templates/secret-template.yaml', manifest);

    expect(envPolicy.allowed).toBe(false);
    expect(envPolicy.action).toBe('preserve');
    expect(envPolicy.blockedBy).toBe('.env*');
    expect(secretPolicy.allowed).toBe(false);
    expect(secretPolicy.action).toBe('deny');
    expect(secretPolicy.blockedBy).toBe('**/*secret*');
  });

  test('all migrated paths must match a positive allowlist entry', () => {
    const { manifest } = loadEnterpriseUpgradeManifest();
    const allowed = resolveMigrationPolicy('enterprise-config.yaml', manifest);
    const denied = resolveMigrationPolicy('services/clickup/token-loader.js', manifest);

    expect(allowed.allowed).toBe(true);
    expect(allowed.policy).toBe('merge-yaml');
    expect(denied.allowed).toBe(false);
    expect(denied.blockedBy).toBe('allowlist');
  });

  test('services and squads are explicit, not unrestricted recursive imports', () => {
    const { manifest } = loadEnterpriseUpgradeManifest();
    const broadServices = manifest.allowlist.filter(entry => entry.path === 'services/**');
    const broadSquads = manifest.allowlist.filter(entry => entry.path === 'squads/**');
    const explicitService = resolveMigrationPolicy('services/registry-engine/registry-utils.js', manifest);
    const explicitSquad = resolveMigrationPolicy('squads/repo-ops/config.yaml', manifest);
    const unlistedSquad = resolveMigrationPolicy('squads/private-squad/config.yaml', manifest);

    expect(broadServices).toEqual([]);
    expect(broadSquads).toEqual([]);
    expect(explicitService.allowed).toBe(true);
    expect(explicitSquad.allowed).toBe(true);
    expect(unlistedSquad.allowed).toBe(false);
  });

  test('glob matcher supports root and nested sensitive patterns', () => {
    expect(pathMatchesPattern('secret.txt', '**/*secret*')).toBe(true);
    expect(pathMatchesPattern('nested/private-secret.txt', '**/*secret*')).toBe(true);
    expect(pathMatchesPattern('workspace/businesses/aiox/config.yaml', 'workspace/businesses/**')).toBe(true);
  });

  test('dry-run plan emits manifest-driven candidate and blocked operations with reasons', () => {
    const targetDir = temp('aiox-pro-target');
    const enterpriseSource = temp('aiox-enterprise-source');
    createCoreInstall(targetDir);
    createProInstall(targetDir);
    createEnterpriseSource(enterpriseSource);

    const plan = buildEnterpriseUpgradePlan({ targetDir, enterpriseSource });
    const enterpriseConfigOp = plan.candidateOps.find(op => op.path === 'enterprise-config.yaml');
    const syncConfigOp = plan.candidateOps.find(op => op.path === '.aiox-sync.yaml');
    const outputsBlockedOp = plan.blockedOps.find(op => op.path === 'outputs/**');

    expect(plan.migrationManifest.allowlistCount).toBeGreaterThan(0);
    expect(enterpriseConfigOp.policy || enterpriseConfigOp.action).toBe('merge-yaml');
    expect(syncConfigOp.reason).toContain('IDE sync');
    expect(outputsBlockedOp.action).toBe('preserve');
    expect(plan.blockedOps.every(op => Boolean(op.reason))).toBe(true);
  });
});
