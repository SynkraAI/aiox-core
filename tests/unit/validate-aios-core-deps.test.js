'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const VALIDATOR_PATH = path.join(PROJECT_ROOT, 'scripts', 'validate-aios-core-deps.js');

describe('validate-aios-core-deps.js (INS-4.12)', () => {
  test('validator script exists', () => {
    expect(fs.existsSync(VALIDATOR_PATH)).toBe(true);
  });

  test('passes on current codebase (all deps declared)', () => {
    const result = execSync(`node "${VALIDATOR_PATH}"`, {
      encoding: 'utf8',
      cwd: PROJECT_ROOT,
      timeout: 15000,
    });
    expect(result).toContain('PASS');
  });

  test('.aios-core/package.json includes fast-glob', () => {
    const pkgPath = path.join(PROJECT_ROOT, '.aios-core', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.dependencies).toHaveProperty('fast-glob');
  });

  test('.aios-core/package.json includes fs-extra', () => {
    const pkgPath = path.join(PROJECT_ROOT, '.aios-core', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.dependencies).toHaveProperty('fs-extra');
  });

  test('.aios-core/package.json includes semver', () => {
    const pkgPath = path.join(PROJECT_ROOT, '.aios-core', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.dependencies).toHaveProperty('semver');
  });

  test('.aios-core/package.json includes ajv', () => {
    const pkgPath = path.join(PROJECT_ROOT, '.aios-core', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.dependencies).toHaveProperty('ajv');
  });

  test('.aios-core/package.json includes tar', () => {
    const pkgPath = path.join(PROJECT_ROOT, '.aios-core', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.dependencies).toHaveProperty('tar');
  });

  test('allowlisted packages (eslint, @babel/*) are not in deps', () => {
    const pkgPath = path.join(PROJECT_ROOT, '.aios-core', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = pkg.dependencies || {};
    expect(deps).not.toHaveProperty('eslint');
    expect(deps).not.toHaveProperty('@babel/parser');
    expect(deps).not.toHaveProperty('prettier');
    expect(deps).not.toHaveProperty('jscodeshift');
  });
});

describe('validate-publish.js dependency check (INS-4.12)', () => {
  test('validate-publish includes dependency completeness check', () => {
    const content = fs.readFileSync(
      path.join(PROJECT_ROOT, 'bin', 'utils', 'validate-publish.js'),
      'utf8',
    );
    expect(content).toContain('INS-4.12');
    expect(content).toContain('validate-aios-core-deps');
  });
});

describe('wizard NODE_PATH fix (INS-4.12)', () => {
  test('wizard/index.js sets NODE_PATH for entity registry bootstrap', () => {
    const wizardPath = path.join(PROJECT_ROOT, 'packages', 'installer', 'src', 'wizard', 'index.js');
    const content = fs.readFileSync(wizardPath, 'utf8');
    expect(content).toContain('NODE_PATH');
    expect(content).toContain('aiosCoreNodeModules');
  });

  test('wizard/index.js guards bootstrap on deps existence', () => {
    const wizardPath = path.join(PROJECT_ROOT, 'packages', 'installer', 'src', 'wizard', 'index.js');
    const content = fs.readFileSync(wizardPath, 'utf8');
    expect(content).toContain('skipped-no-deps');
  });
});

describe('doctor npm-packages check (INS-4.12)', () => {
  test('doctor check validates .aios-core/node_modules/', () => {
    const checkPath = path.join(PROJECT_ROOT, '.aios-core', 'core', 'doctor', 'checks', 'npm-packages.js');
    const content = fs.readFileSync(checkPath, 'utf8');
    expect(content).toContain('aiosCoreNodeModules');
    expect(content).toContain('.aios-core');
    expect(content).toContain('INS-4.12');
  });
});
