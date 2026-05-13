'use strict';

const fs = require('fs');
const path = require('path');

const {
  getAioxCorePackageRoot,
  getAioxCoreVersion,
  resolveAioxCorePath,
} = require('../../src/utils/package-paths');

describe('installer package path resolution', () => {
  test('resolves an AIOX core package root with .aiox-core assets', () => {
    const packageRoot = getAioxCorePackageRoot();
    const packageJson = require(path.join(packageRoot, 'package.json'));

    expect(packageJson.name).toBe('@aiox-squads/core');
    expect(fs.existsSync(path.join(packageRoot, '.aiox-core'))).toBe(true);
  });

  test('resolves .aiox-core paths from the core package root', () => {
    const coreConfigPath = resolveAioxCorePath('.aiox-core', 'core-config.yaml');

    expect(fs.existsSync(coreConfigPath)).toBe(true);
  });

  test('reads the AIOX core package version', () => {
    const packageRoot = getAioxCorePackageRoot();
    const packageJson = require(path.join(packageRoot, 'package.json'));

    expect(getAioxCoreVersion()).toBe(packageJson.version);
  });
});
