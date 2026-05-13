'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const {
  resolveSignatureRequirement,
} = require('../../.aiox-core/cli/commands/validate/index');

describe('validate signature mode', () => {
  let testDir;
  let aioxCoreDir;
  let sourceDir;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-validate-signature-'));
    aioxCoreDir = path.join(testDir, 'project', '.aiox-core');
    sourceDir = path.join(testDir, 'source');
    await fs.ensureDir(aioxCoreDir);
    await fs.ensureDir(path.join(sourceDir, '.aiox-core'));
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  test('does not require signature when public package lacks minisig', () => {
    expect(
      resolveSignatureRequirement({
        options: {},
        aioxCoreDir,
        sourceDir,
        env: {},
      }),
    ).toBe(false);
  });

  test('requires signature when strict flag is set', () => {
    expect(
      resolveSignatureRequirement({
        options: { requireSignature: true },
        aioxCoreDir,
        sourceDir,
        env: {},
      }),
    ).toBe(true);
  });

  test('requires signature when strict env is set', () => {
    expect(
      resolveSignatureRequirement({
        options: {},
        aioxCoreDir,
        sourceDir,
        env: { AIOX_REQUIRE_SIGNATURE: 'true' },
      }),
    ).toBe(true);
  });

  test('no-signature flag overrides strict env and local signature', async () => {
    await fs.writeFile(path.join(aioxCoreDir, 'install-manifest.yaml.minisig'), 'signature');

    expect(
      resolveSignatureRequirement({
        options: { signature: false },
        aioxCoreDir,
        sourceDir,
        env: { AIOX_REQUIRE_SIGNATURE: '1' },
      }),
    ).toBe(false);
  });

  test('requires signature automatically when target minisig exists', async () => {
    await fs.writeFile(path.join(aioxCoreDir, 'install-manifest.yaml.minisig'), 'signature');

    expect(
      resolveSignatureRequirement({
        options: {},
        aioxCoreDir,
        sourceDir,
        env: {},
      }),
    ).toBe(true);
  });

  test('requires signature automatically when source minisig exists', async () => {
    await fs.writeFile(
      path.join(sourceDir, '.aiox-core', 'install-manifest.yaml.minisig'),
      'signature',
    );

    expect(
      resolveSignatureRequirement({
        options: {},
        aioxCoreDir,
        sourceDir,
        env: {},
      }),
    ).toBe(true);
  });
});
