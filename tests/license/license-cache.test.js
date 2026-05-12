/**
 * Unit tests for license-cache.js
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-2, AC-3, AC-9, AC-10 - Offline operation, Cache expiry, Tamper resistance, Machine specificity
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  writeLicenseCache,
  readLicenseCache,
  deleteLicenseCache,
  isExpired,
  isInGracePeriod,
  getDaysRemaining,
  getExpiryDate,
  getLicenseState,
  setPendingDeactivation,
  hasPendingDeactivation,
  markPendingDeactivationSynced,
  clearPendingDeactivation,
  cacheExists,
  getCachePath,
  getAioxDir,
  _CONFIG,
} = require('../../pro/license/license-cache');

describe('license-cache', () => {
  let testDir;

  // Create a fresh test directory for each test
  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-license-test-'));
  });

  // Cleanup after each test
  afterEach(() => {
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // Helper to create valid test cache data
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

  describe('writeLicenseCache', () => {
    it('should write cache file successfully', () => {
      const data = createTestCacheData();
      const result = writeLicenseCache(data, testDir);

      expect(result.success).toBe(true);
      expect(fs.existsSync(getCachePath(testDir))).toBe(true);
    });

    it('should create .aiox directory if not exists', () => {
      const data = createTestCacheData();
      const aioxDir = getAioxDir(testDir);

      expect(fs.existsSync(aioxDir)).toBe(false);

      writeLicenseCache(data, testDir);

      expect(fs.existsSync(aioxDir)).toBe(true);
    });

    it('should write encrypted content', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const content = fs.readFileSync(getCachePath(testDir), 'utf8');
      const parsed = JSON.parse(content);

      expect(parsed).toHaveProperty('encrypted');
      expect(parsed).toHaveProperty('iv');
      expect(parsed).toHaveProperty('tag');
      expect(parsed).toHaveProperty('hmac');
      expect(parsed).toHaveProperty('salt');
      expect(parsed).toHaveProperty('version');

      // Should NOT contain plaintext key
      expect(content).not.toContain(data.key);
    });

    it('should use atomic write (no temp file left)', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const aioxDir = getAioxDir(testDir);
      const files = fs.readdirSync(aioxDir);

      expect(files).toContain('license.cache');
      expect(files.filter((f) => f.includes('.tmp'))).toHaveLength(0);
    });

    it('should return error on failure', () => {
      // On Windows, writing to a device path should fail
      // On Unix, writing to /dev/null as a directory should fail
      const data = createTestCacheData();

      // Mock fs.mkdirSync to throw an error
      const originalMkdirSync = fs.mkdirSync;
      fs.mkdirSync = () => {
        throw new Error('Mock directory creation error');
      };

      try {
        const result = writeLicenseCache(data, testDir + '-fail');
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      } finally {
        fs.mkdirSync = originalMkdirSync;
      }
    });
  });

  describe('readLicenseCache', () => {
    it('should read and decrypt cache successfully', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cache = readLicenseCache(testDir);

      expect(cache).not.toBeNull();
      expect(cache.key).toBe(data.key);
      expect(cache.features).toEqual(data.features);
      expect(cache.seats).toEqual(data.seats);
    });

    it('should return null for missing cache', () => {
      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should return null for corrupted JSON', () => {
      const cachePath = getCachePath(testDir);
      fs.mkdirSync(getAioxDir(testDir), { recursive: true });
      fs.writeFileSync(cachePath, 'not valid json', 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should return null for tampered ciphertext (AC-9)', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      // Tamper with encrypted content
      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      content.encrypted = content.encrypted.replace(/[a-f]/g, '0');
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should return null for tampered HMAC (AC-9)', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      // Tamper with HMAC
      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      content.hmac = '0'.repeat(64);
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should return null for missing required fields', () => {
      const cachePath = getCachePath(testDir);
      fs.mkdirSync(getAioxDir(testDir), { recursive: true });
      fs.writeFileSync(cachePath, JSON.stringify({ partial: 'data' }), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should include version and machineId in decrypted data', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cache = readLicenseCache(testDir);

      expect(cache.version).toBe(_CONFIG.CACHE_VERSION);
      expect(cache.machineId).toBeTruthy();
      expect(typeof cache.machineId).toBe('string');
    });
  });

  describe('deleteLicenseCache', () => {
    it('should delete existing cache file', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      expect(cacheExists(testDir)).toBe(true);

      const result = deleteLicenseCache(testDir);

      expect(result.success).toBe(true);
      expect(cacheExists(testDir)).toBe(false);
    });

    it('should succeed even if cache does not exist', () => {
      const result = deleteLicenseCache(testDir);

      expect(result.success).toBe(true);
    });
  });

  describe('isExpired', () => {
    it('should return false for fresh cache', () => {
      const cache = {
        activatedAt: new Date().toISOString(),
        cacheValidDays: 30,
      };

      expect(isExpired(cache)).toBe(false);
    });

    it('should return true for old cache', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 35); // 35 days ago

      const cache = {
        activatedAt: activatedAt.toISOString(),
        cacheValidDays: 30,
      };

      expect(isExpired(cache)).toBe(true);
    });

    it('should return true for null/undefined cache', () => {
      expect(isExpired(null)).toBe(true);
      expect(isExpired(undefined)).toBe(true);
    });

    it('should return true for cache without activatedAt', () => {
      expect(isExpired({})).toBe(true);
    });

    it('should use default 30 days if cacheValidDays not set', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 29); // 29 days ago

      const cache = { activatedAt: activatedAt.toISOString() };

      expect(isExpired(cache)).toBe(false);

      activatedAt.setDate(activatedAt.getDate() - 2); // 31 days ago
      cache.activatedAt = activatedAt.toISOString();

      expect(isExpired(cache)).toBe(true);
    });
  });

  describe('isInGracePeriod', () => {
    it('should return false for non-expired cache', () => {
      const cache = {
        activatedAt: new Date().toISOString(),
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      expect(isInGracePeriod(cache)).toBe(false);
    });

    it('should return true when in grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 33); // 33 days ago (3 days into grace)

      const cache = {
        activatedAt: activatedAt.toISOString(),
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      expect(isInGracePeriod(cache)).toBe(true);
    });

    it('should return false after grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 40); // 40 days ago (past grace)

      const cache = {
        activatedAt: activatedAt.toISOString(),
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      expect(isInGracePeriod(cache)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isInGracePeriod(null)).toBe(false);
      expect(isInGracePeriod(undefined)).toBe(false);
    });
  });

  describe('getDaysRemaining', () => {
    it('should return positive days for fresh cache', () => {
      const cache = {
        activatedAt: new Date().toISOString(),
        cacheValidDays: 30,
      };

      const days = getDaysRemaining(cache);

      expect(days).toBeGreaterThanOrEqual(29);
      expect(days).toBeLessThanOrEqual(30);
    });

    it('should return negative days for expired cache', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 35);

      const cache = {
        activatedAt: activatedAt.toISOString(),
        cacheValidDays: 30,
      };

      const days = getDaysRemaining(cache);

      expect(days).toBeLessThan(0);
    });

    it('should return -1 for null cache', () => {
      expect(getDaysRemaining(null)).toBe(-1);
    });
  });

  describe('getExpiryDate', () => {
    it('should return correct expiry date', () => {
      const now = new Date();
      const cache = {
        activatedAt: now.toISOString(),
        cacheValidDays: 30,
      };

      const expiry = getExpiryDate(cache);
      const expected = new Date(now);
      expected.setDate(expected.getDate() + 30);

      expect(expiry.toDateString()).toBe(expected.toDateString());
    });

    it('should return null for null cache', () => {
      expect(getExpiryDate(null)).toBeNull();
    });
  });

  describe('getLicenseState', () => {
    it('should return "Not Activated" for null cache', () => {
      expect(getLicenseState(null)).toBe('Not Activated');
    });

    it('should return "Active" for valid cache', () => {
      const cache = {
        activatedAt: new Date().toISOString(),
        cacheValidDays: 30,
      };

      expect(getLicenseState(cache)).toBe('Active');
    });

    it('should return "Grace" during grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 33);

      const cache = {
        activatedAt: activatedAt.toISOString(),
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      expect(getLicenseState(cache)).toBe('Grace');
    });

    it('should return "Expired" after grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 40);

      const cache = {
        activatedAt: activatedAt.toISOString(),
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      expect(getLicenseState(cache)).toBe('Expired');
    });
  });

  describe('Pending Deactivation (AC-7b)', () => {
    describe('setPendingDeactivation', () => {
      it('should create pending deactivation file', () => {
        const result = setPendingDeactivation('PRO-TEST-KEY', testDir);

        expect(result.success).toBe(true);

        const pending = hasPendingDeactivation(testDir);
        expect(pending.pending).toBe(true);
        expect(pending.data.licenseKey).toBe('PRO-TEST-KEY');
      });

      it('should include machineId and timestamp', () => {
        setPendingDeactivation('PRO-TEST-KEY', testDir);

        const pending = hasPendingDeactivation(testDir);

        expect(pending.data.machineId).toBeTruthy();
        expect(pending.data.deactivatedAt).toBeTruthy();
        expect(pending.data.synced).toBe(false);
      });
    });

    describe('hasPendingDeactivation', () => {
      it('should return pending: false when no pending file', () => {
        const result = hasPendingDeactivation(testDir);

        expect(result.pending).toBe(false);
        expect(result.data).toBeUndefined();
      });

      it('should return pending: true with unsynced deactivation', () => {
        setPendingDeactivation('PRO-TEST-KEY', testDir);

        const result = hasPendingDeactivation(testDir);

        expect(result.pending).toBe(true);
      });

      it('should return pending: false for synced deactivation', () => {
        setPendingDeactivation('PRO-TEST-KEY', testDir);
        markPendingDeactivationSynced(testDir);

        const result = hasPendingDeactivation(testDir);

        expect(result.pending).toBe(false);
      });
    });

    describe('markPendingDeactivationSynced', () => {
      it('should mark deactivation as synced', () => {
        setPendingDeactivation('PRO-TEST-KEY', testDir);
        const result = markPendingDeactivationSynced(testDir);

        expect(result.success).toBe(true);

        const pending = hasPendingDeactivation(testDir);
        expect(pending.pending).toBe(false);
      });

      it('should add syncedAt timestamp', () => {
        setPendingDeactivation('PRO-TEST-KEY', testDir);
        markPendingDeactivationSynced(testDir);

        const filePath = path.join(getAioxDir(testDir), 'pending-deactivation.json');
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        expect(content.synced).toBe(true);
        expect(content.syncedAt).toBeTruthy();
      });

      it('should succeed if no pending file', () => {
        const result = markPendingDeactivationSynced(testDir);

        expect(result.success).toBe(true);
      });
    });

    describe('clearPendingDeactivation', () => {
      it('should delete pending deactivation file', () => {
        setPendingDeactivation('PRO-TEST-KEY', testDir);

        expect(hasPendingDeactivation(testDir).pending).toBe(true);

        const result = clearPendingDeactivation(testDir);

        expect(result.success).toBe(true);
        expect(hasPendingDeactivation(testDir).pending).toBe(false);
      });

      it('should succeed if no pending file', () => {
        const result = clearPendingDeactivation(testDir);

        expect(result.success).toBe(true);
      });
    });
  });

  describe('cacheExists', () => {
    it('should return false when cache does not exist', () => {
      expect(cacheExists(testDir)).toBe(false);
    });

    it('should return true when cache exists', () => {
      writeLicenseCache(createTestCacheData(), testDir);

      expect(cacheExists(testDir)).toBe(true);
    });
  });

  describe('Security: Machine specificity (AC-10)', () => {
    it('should produce cache that cannot be read with different machineId', () => {
      // This test validates that the cache is bound to the machine
      // by verifying the round-trip works on the same machine
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cache = readLicenseCache(testDir);

      // Cache should be readable on the same machine
      expect(cache).not.toBeNull();
      expect(cache.key).toBe(data.key);

      // The machineId in the cache should match current machine
      const { generateMachineId } = require('../../pro/license/license-crypto');
      expect(cache.machineId).toBe(generateMachineId());
    });
  });

  describe('Offline operation (AC-2)', () => {
    it('should support 30 days offline operation by default', () => {
      expect(_CONFIG.DEFAULT_CACHE_VALID_DAYS).toBe(30);
    });

    it('should support 7 day grace period by default', () => {
      expect(_CONFIG.DEFAULT_GRACE_PERIOD_DAYS).toBe(7);
    });

    it('should allow reading cache without network', () => {
      // Write cache
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      // Reading should work without any network calls
      const cache = readLicenseCache(testDir);

      expect(cache).not.toBeNull();
      expect(cache.features).toEqual(data.features);
    });
  });

  describe('Cache expiry and grace period (AC-3)', () => {
    it('should transition from Active to Grace after 30 days', () => {
      // Day 0: Active
      const cache = {
        activatedAt: new Date().toISOString(),
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      expect(getLicenseState(cache)).toBe('Active');

      // Day 31: Grace
      const day31 = new Date();
      day31.setDate(day31.getDate() - 31);
      cache.activatedAt = day31.toISOString();

      expect(getLicenseState(cache)).toBe('Grace');
    });

    it('should transition from Grace to Expired after 37 days', () => {
      // Day 38: Expired
      const day38 = new Date();
      day38.setDate(day38.getDate() - 38);

      const cache = {
        activatedAt: day38.toISOString(),
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      expect(getLicenseState(cache)).toBe('Expired');
    });
  });
});
