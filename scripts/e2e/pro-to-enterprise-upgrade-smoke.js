#!/usr/bin/env node

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

const repoRoot = path.resolve(__dirname, '..', '..');
const cliPath = path.join(repoRoot, 'bin', 'aiox.js');
const keepTemp = process.env.AIOX_E2E_KEEP_TEMP === '1';
const verbose = process.env.AIOX_E2E_VERBOSE === '1';
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-pro-enterprise-e2e-'));
const targetDir = path.join(tempRoot, 'target-project');
const enterpriseSource = path.join(tempRoot, 'enterprise-fixture');

function log(message) {
  console.log(`[pro-enterprise-e2e] ${message}`);
}

function fail(message, details = '') {
  const suffix = details ? `\n${details}` : '';
  throw new Error(`${message}${suffix}`);
}

function writeFile(relativePath, content, root = targetDir) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
}

function runCli(args, options = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 20,
  });

  if (verbose && result.stdout) process.stdout.write(result.stdout);
  if (verbose && result.stderr) process.stderr.write(result.stderr);

  if (result.error) {
    fail(`Command failed to start: aiox ${args.join(' ')}`, result.error.message);
  }

  if (result.status !== 0) {
    fail(
      `Command failed (${result.status}): aiox ${args.join(' ')}`,
      [result.stdout && `STDOUT:\n${result.stdout}`, result.stderr && `STDERR:\n${result.stderr}`]
        .filter(Boolean)
        .join('\n\n'),
    );
  }

  return result.stdout || '';
}

function assertPath(relativePath, root = targetDir) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    fail(`Missing expected path: ${relativePath}`);
  }
  return filePath;
}

function assertNotPath(relativePath, root = targetDir) {
  const filePath = path.join(root, relativePath);
  if (fs.existsSync(filePath)) {
    fail(`Unexpected path exists: ${relativePath}`);
  }
}

function assertContains(filePath, expected) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(expected)) {
    fail(`Expected ${filePath} to contain: ${expected}`);
  }
}

function setupTarget() {
  fs.mkdirSync(targetDir, { recursive: true });
  writeFile('.aiox-core/.installed-manifest.yaml', 'installedVersion: 5.1.15\n');
  writeFile('pro-installed-manifest.yaml', 'version: 2.0.0\n');
  writeFile('pro-version.json', '{"proVersion":"2.0.0"}\n');
  fs.mkdirSync(path.join(targetDir, 'pro'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, '.claude'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, '.codex'), { recursive: true });
  writeFile('bin/aiox.js', 'console.log(JSON.stringify({ summary: { fail: 0 } }));\n');
  writeFile('scripts/hub-sync.js', "module.exports = 'target';\n");
  writeFile('workspace/_templates/existing.yaml', 'owner: target\n');
}

function setupEnterpriseFixture() {
  fs.mkdirSync(enterpriseSource, { recursive: true });
  writeFile('enterprise-config.yaml', [
    'enterprise:',
    '  product: AIOX Enterprise',
    '  version: 1.0.0',
    '  source: local-fixture',
    '',
  ].join('\n'), enterpriseSource);
  writeFile('.aiox-sync.yaml', 'active_ides:\n  - claude\n  - codex\n', enterpriseSource);
  writeFile('package.json', '{"name":"aiox-enterprise","version":"1.0.0"}\n', enterpriseSource);
  writeFile('scripts/hub-sync.js', "module.exports = 'enterprise';\n", enterpriseSource);
  writeFile('scripts/enterprise-sync.js', "module.exports = 'enterprise-sync';\n", enterpriseSource);
  writeFile('scripts/enterprise-sanitize.js', "module.exports = 'enterprise-sanitize';\n", enterpriseSource);
  writeFile('workspace/_templates/existing.yaml', 'owner: enterprise\n', enterpriseSource);
  writeFile('workspace/_templates/new-template.yaml', 'owner: enterprise\n', enterpriseSource);
  writeFile('workspace/_templates/secret-template.yaml', 'secret: true\n', enterpriseSource);
  writeFile('services/service-catalog.yaml', 'services:\n  - registry-engine\n', enterpriseSource);
  writeFile('services/registry-engine/index.js', "module.exports = 'registry';\n", enterpriseSource);
  writeFile('squads/repo-ops/config.yaml', 'name: repo-ops\n', enterpriseSource);
  writeFile('.claude/agents/dev.md', '# Dev Agent\n', enterpriseSource);
  writeFile('.codex/skills/migrate-pro-to-enterprise/SKILL.md', '# Migrate Pro To Enterprise\n', enterpriseSource);
  writeFile(
    '.claude/skills/migrate-pro-to-enterprise/SKILL.md',
    [
      '---',
      'name: migrate-pro-to-enterprise',
      'description: Sanitized Enterprise fixture skill for Pro to Enterprise E2E.',
      '---',
      '',
      '# Migrate Pro To Enterprise',
      '',
      'Run dry-run before apply. The CLI is the source of truth.',
      '',
    ].join('\n'),
    enterpriseSource,
  );
}

function cleanup() {
  if (keepTemp) {
    log(`Keeping temp root: ${tempRoot}`);
    return;
  }
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

function main() {
  try {
    log(`Temp root: ${tempRoot}`);
    setupTarget();
    setupEnterpriseFixture();

    const planPath = path.join(targetDir, 'outputs', 'enterprise-upgrade-plan.yaml');
    log('Running dry-run plan');
    runCli([
      'enterprise',
      'upgrade',
      '--target',
      targetDir,
      '--enterprise-source',
      enterpriseSource,
      '--dry-run',
      '--plan',
      planPath,
    ]);

    const plan = readYaml(planPath);
    if (plan.mode !== 'dry-run') fail('Dry-run plan did not include mode: dry-run');
    if (!plan.candidateOps.find(op => op.path === 'enterprise-config.yaml')) {
      fail('Dry-run plan missing enterprise-config.yaml candidate');
    }

    log('Applying Enterprise fixture');
    runCli([
      'enterprise',
      'upgrade',
      '--target',
      targetDir,
      '--enterprise-source',
      enterpriseSource,
      '--apply',
    ], {
      env: { AIOX_ENTERPRISE_TEST_FIXTURE: '1' },
    });

    const executionManifestPath = path.join(targetDir, '.aiox', 'enterprise-upgrade-manifest.yaml');
    const executionManifest = readYaml(executionManifestPath);
    if (executionManifest.status !== 'success') {
      fail('Execution manifest did not finish with success');
    }
    if (!executionManifest.doctor || executionManifest.doctor.skipped) {
      fail('Execution manifest did not capture doctor --json output');
    }
    for (const key of ['copied', 'merged', 'preserved', 'denied', 'backedUp', 'validated', 'errors']) {
      if (!Array.isArray(executionManifest[key])) {
        fail(`Execution manifest missing array: ${key}`);
      }
    }

    assertContains(assertPath('workspace/_templates/existing.yaml'), 'owner: target');
    assertPath('workspace/_templates/new-template.yaml');
    assertNotPath('workspace/_templates/secret-template.yaml');
    assertPath('pro');
    assertPath('pro-installed-manifest.yaml');
    assertPath('pro-version.json');
    assertPath('.claude/skills/migrate-pro-to-enterprise/SKILL.md');
    assertPath('.claude/agents/dev.md');
    assertPath('.codex/skills/migrate-pro-to-enterprise/SKILL.md');

    log('Running rollback smoke');
    runCli([
      'enterprise',
      'upgrade',
      'rollback',
      '--manifest',
      executionManifestPath,
    ]);
    assertContains(assertPath('scripts/hub-sync.js'), 'target');

    log('PASS');
  } finally {
    cleanup();
  }
}

try {
  main();
} catch (error) {
  console.error(`[pro-enterprise-e2e] FAIL: ${error.message}`);
  process.exit(1);
}
