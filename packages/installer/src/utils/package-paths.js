'use strict';

const fs = require('node:fs');
const path = require('node:path');

function isCorePackageRoot(candidate) {
  if (!candidate) return false;

  try {
    const packageJsonPath = path.join(candidate, 'package.json');
    const aioxCorePath = path.join(candidate, '.aiox-core');

    if (!fs.existsSync(packageJsonPath) || !fs.existsSync(aioxCorePath)) {
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.name === '@aiox-squads/core';
  } catch {
    return false;
  }
}

function resolvePackageJsonRoot(packageName) {
  try {
    return path.dirname(require.resolve(`${packageName}/package.json`));
  } catch {
    return null;
  }
}

function getLocalRepoRoot() {
  return path.resolve(__dirname, '..', '..', '..', '..');
}

function getAioxCorePackageRoot() {
  const candidates = [
    process.env.AIOX_CORE_PACKAGE_ROOT,
    getLocalRepoRoot(),
    resolvePackageJsonRoot('@aiox-squads/core'),
  ];

  const packageRoot = candidates.find(isCorePackageRoot);
  if (!packageRoot) {
    throw new Error(
      'AIOX core package root not found. Install @aiox-squads/core or set AIOX_CORE_PACKAGE_ROOT.',
    );
  }

  return packageRoot;
}

function resolveAioxCorePath(...segments) {
  return path.join(getAioxCorePackageRoot(), ...segments);
}

function requireAioxCoreModule(...segments) {
  return require(resolveAioxCorePath(...segments));
}

function getAioxCoreVersion() {
  const packageJson = require(resolveAioxCorePath('package.json'));
  return packageJson.version;
}

module.exports = {
  getAioxCorePackageRoot,
  resolveAioxCorePath,
  requireAioxCoreModule,
  getAioxCoreVersion,
};
