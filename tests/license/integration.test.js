/**
 * Integration tests for License System
 *
 * Tests full lifecycle workflows:
 * - activate → use features → deactivate (online)
 * - activate → use features → deactivate (offline) → sync
 * - Cache expiry → grace period → degradation
 * - Corrupted cache → reactivation flow
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-1 through AC-8 - Full workflow testing
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// License modules
const { FeatureGate, featureGate } = require('../../pro/license/feature-gate');
const {
  writeLicenseCache,
  readLicenseCache,
  deleteLicenseCache,
  setPendingDeactivation,
  hasPendingDeactivation,
  clearPendingDeactivation,
  getLicenseState,
} = require('../../pro/license/license-cache');
const {
  generateMachineId,
  maskKey,
  validateKeyFormat,
} = require('../../pro/license/license-crypto');
const {
  withGracefulDegradation,
  isInDegradedMode,
  getDegradationStatus,
} = require('../../pro/license/degradation');
const { ProFeatureError } = require('../../pro/license/errors');

describe('License System Integration', () => {
  let testDir;
  let originalCwd;

  // Helper to create test cache
  function createTestCache(features = ['pro.squads.*'], overrides = {}) {
    return {
      key: 'PRO-TEST-1234-5678-ABCD',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features,
      seats: { used: 1, max: 5 },
      cacheValidDays: 30,
      gracePeriodDays: 7,
      ...overrides,
    };
  }

  // Helper to create expired cache
  function createExpiredCache(daysAgo, features = ['pro.squads.*']) {
    const activatedAt = new Date();
    activatedAt.setDate(activatedAt.getDate() - daysAgo);
    return createTestCache(features, { activatedAt: activatedAt.toISOString() });
  }

  beforeEach(() => {
    // Create temp directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-integration-test-'));

    // Mock process.cwd to return our test directory
    originalCwd = process.cwd;
    process.cwd = () => testDir;

    // Reset the singleton for clean tests
    featureGate._reset();
  });

  afterEach(() => {
    // Restore
    process.cwd = originalCwd;

    // Cleanup temp directory
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Full Lifecycle: Activation → Use → Deactivation (Online)', () => {
    it('should complete full online lifecycle (AC-1, AC-4, AC-7a)', () => {
      // Phase 1: Initial state (no license)
      expect(featureGate.getLicenseState()).toBe('Not Activated');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);
      expect(isInDegradedMode()).toBe(true);

      // Phase 2: Simulate activation (write cache)
      const cacheData = createTestCache(['pro.squads.*', 'pro.memory.*']);
      writeLicenseCache(cacheData, testDir);
      featureGate.reload();

      // Phase 3: Verify active state
      expect(featureGate.getLicenseState()).toBe('Active');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.custom')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(true);
      expect(featureGate.isAvailable('pro.metrics.advanced')).toBe(false); // Not licensed
      expect(isInDegradedMode()).toBe(false);

      // Phase 4: Use features (should not throw)
      expect(() => featureGate.require('pro.squads.premium', 'Premium Squads')).not.toThrow();

      // Phase 5: Deactivate (delete cache)
      deleteLicenseCache(testDir);
      featureGate.reload();

      // Phase 6: Verify deactivated state
      expect(featureGate.getLicenseState()).toBe('Not Activated');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);
      expect(isInDegradedMode()).toBe(true);
    });
  });

  describe('Full Lifecycle: Activation → Use → Deactivation (Offline)', () => {
    it('should handle offline deactivation with pending sync (AC-7b)', () => {
      // Phase 1: Activate
      const cacheData = createTestCache(['pro.squads.*']);
      writeLicenseCache(cacheData, testDir);
      featureGate.reload();
      expect(featureGate.getLicenseState()).toBe('Active');

      // Phase 2: Verify no pending deactivation
      const initialPending = hasPendingDeactivation(testDir);
      expect(initialPending.pending).toBe(false);

      // Phase 3: Simulate offline deactivation
      // In real scenario, this would be called when licenseApi.isOnline() returns false
      setPendingDeactivation(cacheData.key, testDir);

      // Phase 4: Verify pending deactivation is stored
      const pending = hasPendingDeactivation(testDir);
      expect(pending.pending).toBe(true);
      expect(pending.data).toBeDefined();
      expect(pending.data.synced).toBe(false);

      // Phase 5: Delete local cache (user can't use pro features now)
      deleteLicenseCache(testDir);
      featureGate.reload();
      expect(featureGate.getLicenseState()).toBe('Not Activated');

      // Phase 6: Clear pending after "sync" would happen
      clearPendingDeactivation(testDir);
      const clearedPending = hasPendingDeactivation(testDir);
      expect(clearedPending.pending).toBe(false);
    });
  });

  describe('Cache Expiry → Grace Period → Degradation (AC-2, AC-3)', () => {
    it('should transition through license states correctly', () => {
      // Phase 1: Fresh license (Active)
      const freshCache = createTestCache(['pro.squads.*']);
      writeLicenseCache(freshCache, testDir);
      featureGate.reload();

      expect(featureGate.getLicenseState()).toBe('Active');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);

      const freshStatus = getDegradationStatus();
      expect(freshStatus.degraded).toBe(false);
      expect(freshStatus.reason).toContain('active');

      // Phase 2: Expired but in grace period (Grace)
      deleteLicenseCache(testDir);
      const graceCache = createExpiredCache(33); // 30 days + 3 days into grace
      writeLicenseCache(graceCache, testDir);
      featureGate.reload();

      expect(featureGate.getLicenseState()).toBe('Grace');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true); // Still available in grace

      const graceStatus = getDegradationStatus();
      expect(graceStatus.degraded).toBe(false);
      expect(graceStatus.reason).toContain('grace');
      expect(graceStatus.action).toBe('aiox pro validate');

      // Phase 3: Past grace period (Expired)
      deleteLicenseCache(testDir);
      const expiredCache = createExpiredCache(40); // 30 + 7 + 3 days
      writeLicenseCache(expiredCache, testDir);
      featureGate.reload();

      expect(featureGate.getLicenseState()).toBe('Expired');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);

      const expiredStatus = getDegradationStatus();
      expect(expiredStatus.degraded).toBe(true);
      expect(expiredStatus.reason).toContain('expired');
      expect(expiredStatus.action).toContain('activate');
    });

    it('should support 30-day offline operation (AC-2)', () => {
      // Cache at exactly 29 days should still be active
      const cache29Days = createExpiredCache(29);
      writeLicenseCache(cache29Days, testDir);
      featureGate.reload();

      expect(featureGate.getLicenseState()).toBe('Active');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
    });

    it('should enter grace period at day 31 (AC-3)', () => {
      const cache31Days = createExpiredCache(31);
      writeLicenseCache(cache31Days, testDir);
      featureGate.reload();

      expect(featureGate.getLicenseState()).toBe('Grace');
      // Features still available during grace
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
    });

    it('should expire after grace period ends (day 38+)', () => {
      const cache38Days = createExpiredCache(38);
      writeLicenseCache(cache38Days, testDir);
      featureGate.reload();

      expect(featureGate.getLicenseState()).toBe('Expired');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);
    });
  });

  describe('Graceful Degradation (AC-8)', () => {
    it('should degrade gracefully without data loss', () => {
      // Setup: Start with active license
      const cacheData = createTestCache(['pro.squads.*']);
      writeLicenseCache(cacheData, testDir);
      featureGate.reload();

      // Simulate some user data
      const userDataPath = path.join(testDir, 'user-data.json');
      const userData = { projects: ['proj1', 'proj2'], settings: { theme: 'dark' } };
      fs.writeFileSync(userDataPath, JSON.stringify(userData));

      // Verify pro features work
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);

      // Expire the license
      deleteLicenseCache(testDir);
      const expiredCache = createExpiredCache(40);
      writeLicenseCache(expiredCache, testDir);
      featureGate.reload();

      // Verify degradation occurred
      expect(featureGate.getLicenseState()).toBe('Expired');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);

      // CRITICAL: Verify user data is preserved
      expect(fs.existsSync(userDataPath)).toBe(true);
      const preservedData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
      expect(preservedData).toEqual(userData);
    });

    it('should provide fallback via withGracefulDegradation', () => {
      // No license
      const result = withGracefulDegradation(
        'pro.squads.premium',
        () => 'pro-result',
        () => 'fallback-result',
        { silent: true },
      );

      expect(result).toBe('fallback-result');
    });

    it('should execute pro action when licensed', () => {
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);
      featureGate.reload();

      const result = withGracefulDegradation(
        'pro.squads.premium',
        () => 'pro-result',
        () => 'fallback-result',
      );

      expect(result).toBe('pro-result');
    });
  });

  describe('Corrupted Cache → Reactivation Flow', () => {
    it('should handle corrupted cache gracefully', () => {
      // Write valid cache first
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);
      featureGate.reload();
      expect(featureGate.getLicenseState()).toBe('Active');

      // Corrupt the cache file
      const cachePath = path.join(testDir, '.aiox', 'license.cache');
      const cacheContent = fs.readFileSync(cachePath, 'utf8');
      const cacheJson = JSON.parse(cacheContent);

      // Tamper with HMAC
      cacheJson.hmac = 'corrupted' + cacheJson.hmac.substring(9);
      fs.writeFileSync(cachePath, JSON.stringify(cacheJson));

      // Reload and verify cache is treated as invalid
      featureGate.reload();
      expect(featureGate.getLicenseState()).toBe('Not Activated');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);

      // Reactivation (write new valid cache)
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);
      featureGate.reload();

      // Verify recovery
      expect(featureGate.getLicenseState()).toBe('Active');
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
    });

    it('should handle completely invalid JSON in cache', () => {
      // Write valid cache
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);

      // Overwrite with invalid JSON
      const cachePath = path.join(testDir, '.aiox', 'license.cache');
      fs.writeFileSync(cachePath, 'not valid json {{{');

      // Reload and verify graceful handling
      featureGate.reload();
      expect(featureGate.getLicenseState()).toBe('Not Activated');
    });

    it('should handle missing cache file', () => {
      // Ensure no cache exists
      const cachePath = path.join(testDir, '.aiox', 'license.cache');
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }

      featureGate.reload();
      expect(featureGate.getLicenseState()).toBe('Not Activated');
      expect(isInDegradedMode()).toBe(true);
    });
  });

  describe('Feature Gate Integration Patterns', () => {
    it('should support constructor-level gating', () => {
      // No license - should throw
      expect(() => featureGate.require('pro.squads.premium', 'Premium Squads')).toThrow(
        ProFeatureError,
      );

      // With license - should not throw
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);
      featureGate.reload();

      expect(() => featureGate.require('pro.squads.premium', 'Premium Squads')).not.toThrow();
    });

    it('should support wildcard matching for feature families', () => {
      writeLicenseCache(createTestCache(['pro.squads.*', 'pro.memory.*']), testDir);
      featureGate.reload();

      // All squads features should be available
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.custom')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.export')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.marketplace')).toBe(true);

      // All memory features should be available
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.persistence')).toBe(true);

      // Other modules should not be available
      expect(featureGate.isAvailable('pro.metrics.advanced')).toBe(false);
      expect(featureGate.isAvailable('pro.integrations.clickup')).toBe(false);
    });

    it('should support exact feature matching', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);
      featureGate.reload();

      // Only exact match should work
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.custom')).toBe(false);
      expect(featureGate.isAvailable('pro.squads.export')).toBe(false);
    });

    it('should support module-level wildcard (pro.*)', () => {
      writeLicenseCache(createTestCache(['pro.*']), testDir);
      featureGate.reload();

      // All pro features should be available
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(true);
      expect(featureGate.isAvailable('pro.metrics.advanced')).toBe(true);
      expect(featureGate.isAvailable('pro.integrations.clickup')).toBe(true);
    });
  });

  describe('Key Masking & Security', () => {
    it('should mask license keys consistently', () => {
      const key = 'PRO-ABCD-EFGH-IJKL-MNOP';
      const masked = maskKey(key);

      expect(masked).toBe('PRO-ABCD-****-****-MNOP');
      expect(masked).not.toContain('EFGH');
      expect(masked).not.toContain('IJKL');
    });

    it('should validate key format strictly', () => {
      expect(validateKeyFormat('PRO-XXXX-XXXX-XXXX-XXXX')).toBe(true);
      expect(validateKeyFormat('PRO-ABCD-EFGH-IJKL-MNOP')).toBe(true);
      expect(validateKeyFormat('PRO-1234-5678-ABCD-EFGH')).toBe(true);

      // Invalid formats
      expect(validateKeyFormat('pro-xxxx-xxxx-xxxx-xxxx')).toBe(false); // lowercase
      expect(validateKeyFormat('PRO-XXX-XXXX-XXXX-XXXX')).toBe(false); // wrong length
      expect(validateKeyFormat('ABC-XXXX-XXXX-XXXX-XXXX')).toBe(false); // wrong prefix
      expect(validateKeyFormat('')).toBe(false);
      expect(validateKeyFormat(null)).toBe(false);
    });

    it('should generate deterministic machine ID', () => {
      const id1 = generateMachineId();
      const id2 = generateMachineId();

      expect(id1).toBe(id2); // Same machine = same ID
      expect(id1).toHaveLength(64); // SHA-256 hex
    });
  });
});
