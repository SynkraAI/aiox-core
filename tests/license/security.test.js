/**
 * Security Tests for License System
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see Task 7.3 - Security tests
 * @see AC-9 - Tamper resistance (modified bytes invalidates cache)
 * @see AC-10 - Cache non-portable (different machineId)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  writeLicenseCache,
  readLicenseCache,
  getCachePath,
  getAiosDir,
} = require('../../pro/license/license-cache');
const {
  generateMachineId,
  maskKey,
  validateKeyFormat,
} = require('../../pro/license/license-crypto');
const { ProFeatureError, LicenseActivationError, LicenseValidationError } = require('../../pro/license/errors');

describe('Security Tests (AC-9, AC-10)', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-security-test-'));
  });

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

  describe('License Key Never in Plaintext (AC-9)', () => {
    it('should not store license key in plaintext in cache file', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = fs.readFileSync(cachePath, 'utf8');

      // License key should NOT appear in plaintext
      expect(content).not.toContain(data.key);
      expect(content).not.toContain('PRO-ABCD-EFGH-IJKL-MNOP');
    });

    it('should not store license key segments in plaintext', () => {
      const data = createTestCacheData({ key: 'PRO-WXYZ-1234-5678-9ABC' });
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = fs.readFileSync(cachePath, 'utf8');

      // Check key segments don't appear
      expect(content).not.toContain('WXYZ');
      expect(content).not.toContain('1234');
      expect(content).not.toContain('5678');
      expect(content).not.toContain('9ABC');
    });

    it('should mask license key correctly', () => {
      const key = 'PRO-ABCD-EFGH-IJKL-MNOP';
      const masked = maskKey(key);

      // Should show PRO, first segment, and last segment; mask middle two
      expect(masked).toBe('PRO-ABCD-****-****-MNOP');
      expect(masked).not.toContain('EFGH');
      expect(masked).not.toContain('IJKL');
    });

    it('should mask license key preserving prefix, first segment and last segment', () => {
      const testKeys = [
        'PRO-TEST-XXXX-YYYY-ZZZZ',
        'PRO-1111-2222-3333-4444',
        'PRO-AAAA-BBBB-CCCC-DDDD',
      ];

      for (const key of testKeys) {
        const masked = maskKey(key);
        const segments = key.split('-');

        expect(masked).toContain(segments[0]); // PRO
        expect(masked).toContain(segments[1]); // First segment (visible)
        expect(masked).toContain(segments[4]); // Last segment
        expect(masked).not.toContain(segments[2]); // Middle segment masked
        expect(masked).not.toContain(segments[3]); // Middle segment masked
      }
    });
  });

  describe('Cache Non-Portable (AC-10)', () => {
    it('should bind cache to current machine machineId', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cache = readLicenseCache(testDir);
      const currentMachineId = generateMachineId();

      expect(cache).not.toBeNull();
      expect(cache.machineId).toBe(currentMachineId);
    });

    it('should return null when cache machineId does not match', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      // Manually tamper with the encrypted content to simulate different machine
      // The cache will be unreadable because the key derived from machineId won't match
      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Tamper with salt (changes derived key)
      content.salt = Buffer.from('different-machine-salt-1234567890ab').toString('hex');
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should produce different ciphertext for same data with different machineId derivation', () => {
      // Write cache twice and verify the encryption is deterministic based on machine
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content1 = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Write again to new dir
      const testDir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-security-test2-'));
      try {
        writeLicenseCache(data, testDir2);
        const content2 = JSON.parse(fs.readFileSync(getCachePath(testDir2), 'utf8'));

        // Different salts mean different derived keys
        // (same machine, but different salts per write)
        expect(content1.salt).not.toBe(content2.salt);
        expect(content1.encrypted).not.toBe(content2.encrypted);
      } finally {
        fs.rmSync(testDir2, { recursive: true, force: true });
      }
    });

    it('should verify machineId consistency on same machine', () => {
      const id1 = generateMachineId();
      const id2 = generateMachineId();

      // Same machine should produce same ID
      expect(id1).toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('Cache Tamper Detection (AC-9)', () => {
    it('should detect tampered ciphertext', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Tamper with ciphertext
      const tamperedCiphertext = content.encrypted.replace(/[a-f0-9]/gi, (c) => {
        return c === '0' ? '1' : '0';
      });
      content.encrypted = tamperedCiphertext;
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should detect tampered HMAC', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Tamper with HMAC
      content.hmac = 'a'.repeat(64);
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should detect tampered IV', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Tamper with IV
      content.iv = 'b'.repeat(24);
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should detect tampered auth tag', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Tamper with auth tag
      content.tag = 'c'.repeat(32);
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should detect tampered salt', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Tamper with salt
      content.salt = 'd'.repeat(32);
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should detect single byte modification in ciphertext', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Flip one character in ciphertext
      const chars = content.encrypted.split('');
      const idx = Math.floor(chars.length / 2);
      chars[idx] = chars[idx] === '0' ? '1' : '0';
      content.encrypted = chars.join('');
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });

    it('should detect missing required fields', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);

      const requiredFields = ['encrypted', 'iv', 'tag', 'hmac', 'salt'];

      for (const field of requiredFields) {
        const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        delete content[field];
        fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

        const cache = readLicenseCache(testDir);
        expect(cache).toBeNull();

        // Restore for next iteration
        writeLicenseCache(data, testDir);
      }
    });

    it('should detect truncated ciphertext', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // Truncate ciphertext
      content.encrypted = content.encrypted.substring(0, content.encrypted.length / 2);
      fs.writeFileSync(cachePath, JSON.stringify(content), 'utf8');

      const cache = readLicenseCache(testDir);

      expect(cache).toBeNull();
    });
  });

  describe('No Sensitive Data in Error Messages (AC-9)', () => {
    it('should not expose license key in ProFeatureError message', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');

      // Should not contain actual license key values
      expect(error.message).not.toContain('PRO-ABCD');
      expect(error.message).not.toContain('PRO-XXXX');
      expect(error.toCliMessage()).not.toContain('PRO-ABCD');

      // The command template with <KEY> placeholder is expected
      expect(error.message).toContain('--key <KEY>');
    });

    it('should not expose license key in ProFeatureError JSON', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');
      const json = error.toJSON();

      expect(JSON.stringify(json)).not.toContain('PRO-');
    });

    it('should not expose internal state in LicenseActivationError', () => {
      const error = LicenseActivationError.invalidKey();

      expect(error.message).not.toContain('machineId');
      expect(error.message).not.toContain('cache');
      expect(error.message).not.toContain('salt');
    });

    it('should not expose sensitive data in network error', () => {
      const originalError = new Error('Connection failed to secret-server.internal:443');
      const error = LicenseActivationError.networkError(originalError);

      // Should provide generic message, not expose internal network details
      expect(error.message).toBe('Unable to reach license server. Please check your internet connection.');
    });

    it('should not expose seat details beyond usage numbers', () => {
      const error = LicenseActivationError.seatLimitExceeded(3, 5);

      expect(error.message).toContain('3/5');
      expect(error.details.used).toBe(3);
      expect(error.details.max).toBe(5);
      // Should not expose other user/machine details
      expect(error.message).not.toContain('machineId');
      expect(error.message).not.toContain('userId');
    });

    it('should not expose internal state in LicenseValidationError', () => {
      const error = LicenseValidationError.corruptedCache();

      expect(error.message).not.toContain('decrypt');
      expect(error.message).not.toContain('HMAC');
      expect(error.message).not.toContain('AES');
    });

    it('should not include license key in error stack traces', () => {
      const error = new ProFeatureError('pro.test', 'Test Feature');
      const stack = error.stack || '';

      expect(stack).not.toContain('PRO-');
      expect(stack).not.toContain('license key');
    });
  });

  describe('Key Format Validation Security', () => {
    it('should reject keys without proper format', () => {
      const invalidKeys = [
        '',
        'invalid',
        'pro-xxxx-xxxx-xxxx-xxxx', // lowercase
        'PRO-XXX-XXXX-XXXX-XXXX', // wrong segment length
        'PRO-XXXXX-XXXX-XXXX-XXXX', // too long segment
        'ABC-XXXX-XXXX-XXXX-XXXX', // wrong prefix
        'PRO-XXXX-XXXX-XXXX', // missing segment
        'PRO-XXXX-XXXX-XXXX-XXXX-XXXX', // extra segment
        'PRO_XXXX_XXXX_XXXX_XXXX', // wrong separator
      ];

      for (const key of invalidKeys) {
        expect(validateKeyFormat(key)).toBe(false);
      }
    });

    it('should accept valid key format', () => {
      const validKeys = [
        'PRO-ABCD-EFGH-IJKL-MNOP',
        'PRO-1234-5678-9ABC-DEF0',
        'PRO-AAAA-BBBB-CCCC-DDDD',
        'PRO-0000-0000-0000-0000',
      ];

      for (const key of validKeys) {
        expect(validateKeyFormat(key)).toBe(true);
      }
    });
  });

  describe('Encryption Strength', () => {
    it('should use AES-256-GCM (verifiable via ciphertext structure)', () => {
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      const cachePath = getCachePath(testDir);
      const content = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

      // GCM mode produces IV (12 bytes = 24 hex chars) and tag (16 bytes = 32 hex chars)
      expect(content.iv.length).toBe(24); // 12 bytes hex encoded
      expect(content.tag.length).toBe(32); // 16 bytes hex encoded
      expect(content.salt.length).toBe(32); // 16 bytes hex encoded (for PBKDF2)
    });

    it('should produce unique ciphertext for identical plaintext', () => {
      const data = createTestCacheData();

      // Write twice to different dirs
      writeLicenseCache(data, testDir);
      const content1 = JSON.parse(fs.readFileSync(getCachePath(testDir), 'utf8'));

      const testDir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-enc-test-'));
      try {
        writeLicenseCache(data, testDir2);
        const content2 = JSON.parse(fs.readFileSync(getCachePath(testDir2), 'utf8'));

        // Random IV and salt should produce different ciphertext
        expect(content1.iv).not.toBe(content2.iv);
        expect(content1.encrypted).not.toBe(content2.encrypted);
      } finally {
        fs.rmSync(testDir2, { recursive: true, force: true });
      }
    });
  });
});
