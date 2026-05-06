/**
 * Machine ID stability and cache migration tests.
 *
 * @see Story PRO-13.2 - Stable machine_id via OS native UUID
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function loadProLicense(nativeId = 'stable-native-os-uuid') {
  jest.resetModules();
  jest.doMock('node-machine-id', () => ({
    machineIdSync: jest.fn(() => nativeId),
  }));

  return {
    cache: require('../../pro/license/license-cache'),
    crypto: require('../../pro/license/license-crypto'),
  };
}

function createTestCacheData(overrides = {}) {
  return {
    key: 'PRO-ABCD-EFGH-IJKL-MNOP',
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    features: ['pro.squads.*', 'pro.memory.*'],
    seats: { used: 1, max: 5 },
    cacheValidDays: 30,
    gracePeriodDays: 7,
    ...overrides,
  };
}

function writeLegacyCache(cacheModule, cryptoModule, baseDir, data) {
  fs.mkdirSync(cacheModule.getAioxDir(baseDir), { recursive: true });

  const legacyMachineId = cryptoModule.generateMachineIdLegacy();
  const salt = cryptoModule.generateSalt();
  const key = cryptoModule.deriveCacheKey(legacyMachineId, salt);
  const cacheData = {
    ...data,
    machineId: legacyMachineId,
    cacheValidDays: data.cacheValidDays || cacheModule._CONFIG.DEFAULT_CACHE_VALID_DAYS,
    gracePeriodDays: data.gracePeriodDays || cacheModule._CONFIG.DEFAULT_GRACE_PERIOD_DAYS,
    version: cacheModule._CONFIG.CACHE_VERSION,
  };
  const encrypted = cryptoModule.encrypt(cacheData, key);
  const hmacData = JSON.stringify({
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    tag: encrypted.tag,
  });

  fs.writeFileSync(
    cacheModule.getCachePath(baseDir),
    JSON.stringify(
      {
        encrypted: encrypted.ciphertext,
        iv: encrypted.iv,
        tag: encrypted.tag,
        hmac: cryptoModule.computeHMAC(hmacData, key),
        salt: salt.toString('hex'),
        version: cacheModule._CONFIG.CACHE_VERSION,
      },
      null,
      2,
    ),
    'utf8',
  );

  return legacyMachineId;
}

describe('machine-id stability', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-machine-id-test-'));
  });

  afterEach(() => {
    jest.dontMock('node-machine-id');
    jest.restoreAllMocks();
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('keeps generateMachineId stable when MAC addresses rotate', () => {
    const { crypto: cryptoModule } = loadProLicense();
    const networkInterfacesSpy = jest.spyOn(os, 'networkInterfaces')
      .mockReturnValueOnce({
        en0: [{ internal: false, mac: 'aa:bb:cc:dd:ee:ff' }],
      })
      .mockReturnValueOnce({
        en0: [{ internal: false, mac: '11:22:33:44:55:66' }],
      });

    const first = cryptoModule.generateMachineId();
    cryptoModule._resetMachineIdCacheForTests();
    const second = cryptoModule.generateMachineId();

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(networkInterfacesSpy).not.toHaveBeenCalled();
  });

  it('migrates a legacy hostname CPU MAC cache to the native machine ID key', () => {
    const { cache: cacheModule, crypto: cryptoModule } = loadProLicense();
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const data = createTestCacheData();

    const legacyMachineId = writeLegacyCache(cacheModule, cryptoModule, testDir, data);
    const nativeMachineId = cryptoModule.generateMachineId();

    expect(legacyMachineId).not.toBe(nativeMachineId);

    const cache = cacheModule.readLicenseCache(testDir);

    expect(cache).not.toBeNull();
    expect(cache.key).toBe(data.key);
    expect(cache.machineId).toBe(nativeMachineId);
    expect(consoleInfoSpy).toHaveBeenCalledWith('[aiox-pro] Cache migrated to new machine_id format');

    consoleInfoSpy.mockClear();
    const migratedCache = cacheModule.readLicenseCache(testDir);

    expect(migratedCache).not.toBeNull();
    expect(migratedCache.machineId).toBe(nativeMachineId);
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it('rejects legacy caches after the 90 day fallback window', () => {
    const { cache: cacheModule, crypto: cryptoModule } = loadProLicense();
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const oldActivatedAt = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString();

    writeLegacyCache(
      cacheModule,
      cryptoModule,
      testDir,
      createTestCacheData({ activatedAt: oldActivatedAt }),
    );

    expect(cacheModule.readLicenseCache(testDir)).toBeNull();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });
});
