/**
 * Unit tests for feature-gate.js
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-4, AC-5 - Feature gate check, Wildcard matching
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { FeatureGate, featureGate } = require('../../pro/license/feature-gate');
const { ProFeatureError } = require('../../pro/license/errors');
const { writeLicenseCache, deleteLicenseCache } = require('../../pro/license/license-cache');

describe('feature-gate', () => {
  let testDir;
  let originalCwd;

  beforeEach(() => {
    // Create temp directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-feature-test-'));

    // Mock process.cwd to return our test directory
    originalCwd = process.cwd;
    process.cwd = () => testDir;

    // Reset the singleton for clean tests
    featureGate._reset();
  });

  afterEach(() => {
    // Restore process.cwd
    process.cwd = originalCwd;

    // Cleanup temp directory
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

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

  describe('isAvailable', () => {
    it('should return false when no license', () => {
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);
    });

    it('should return true for exact match', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
    });

    it('should return false for unmatched feature', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      expect(featureGate.isAvailable('pro.memory.extended')).toBe(false);
    });

    it('should support wildcard matching (AC-5)', () => {
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.custom')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.marketplace')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(false);
    });

    it('should support module wildcard (pro.*)', () => {
      writeLicenseCache(createTestCache(['pro.*']), testDir);

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(true);
      expect(featureGate.isAvailable('pro.integrations.jira')).toBe(true);
    });

    it('should handle multiple patterns', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium', 'pro.memory.*']), testDir);

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.custom')).toBe(false);
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.persistence')).toBe(true);
    });

    it('should return false for expired license (past grace)', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 40); // 40 days ago

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);
    });

    it('should return true during grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 33); // 33 days ago (in grace)

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
    });
  });

  describe('require (AC-4)', () => {
    it('should not throw when feature is available', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      expect(() => {
        featureGate.require('pro.squads.premium', 'Premium Squads');
      }).not.toThrow();
    });

    it('should throw ProFeatureError when not available', () => {
      expect(() => {
        featureGate.require('pro.squads.premium', 'Premium Squads');
      }).toThrow(ProFeatureError);
    });

    it('should include feature info in error', () => {
      try {
        featureGate.require('pro.squads.premium', 'Premium Squads');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ProFeatureError);
        expect(error.featureId).toBe('pro.squads.premium');
        expect(error.friendlyName).toBe('Premium Squads');
        expect(error.message).toContain('Premium Squads');
        expect(error.message).toContain('requires an active AIOX Pro license');
      }
    });

    it('should use featureId when no friendly name provided and not in registry', () => {
      try {
        // Use a feature ID that is NOT in the registry
        featureGate.require('pro.unknown.feature');
        fail('Should have thrown');
      } catch (error) {
        expect(error.friendlyName).toBe('pro.unknown.feature');
      }
    });

    it('should use registry name when no friendly name provided', () => {
      try {
        // This feature IS in the registry with name "Premium Squads"
        featureGate.require('pro.squads.premium');
        fail('Should have thrown');
      } catch (error) {
        expect(error.friendlyName).toBe('Premium Squads');
      }
    });
  });

  describe('listAvailable', () => {
    it('should return empty array when no license', () => {
      const available = featureGate.listAvailable();

      expect(available).toEqual([]);
    });

    it('should return available features from registry', () => {
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);

      const available = featureGate.listAvailable();

      expect(available).toContain('pro.squads.premium');
      expect(available).toContain('pro.squads.custom');
      expect(available).not.toContain('pro.memory.extended');
    });

    it('should return sorted array', () => {
      writeLicenseCache(createTestCache(['pro.*']), testDir);

      const available = featureGate.listAvailable();

      const sorted = [...available].sort();
      expect(available).toEqual(sorted);
    });
  });

  describe('listAll', () => {
    it('should list all registered features with availability', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      const all = featureGate.listAll();

      expect(all.length).toBeGreaterThan(0);

      const premium = all.find((f) => f.id === 'pro.squads.premium');
      expect(premium).toBeDefined();
      expect(premium.available).toBe(true);

      const memory = all.find((f) => f.id === 'pro.memory.extended');
      expect(memory).toBeDefined();
      expect(memory.available).toBe(false);
    });

    it('should include feature metadata', () => {
      const all = featureGate.listAll();

      const feature = all[0];
      expect(feature).toHaveProperty('id');
      expect(feature).toHaveProperty('name');
      expect(feature).toHaveProperty('description');
      expect(feature).toHaveProperty('module');
      expect(feature).toHaveProperty('available');
    });
  });

  describe('listByModule', () => {
    it('should group features by module', () => {
      const grouped = featureGate.listByModule();

      expect(grouped).toHaveProperty('squads');
      expect(grouped).toHaveProperty('memory');
      expect(grouped).toHaveProperty('metrics');

      expect(Array.isArray(grouped.squads)).toBe(true);
      expect(grouped.squads.length).toBeGreaterThan(0);
    });
  });

  describe('reload', () => {
    it('should pick up new features after activation', () => {
      // Initially no license
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);

      // Activate license
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      // Still false without reload (cached)
      // Note: In this test setup, each isAvailable call may reload
      // In production, caching is more aggressive

      // Force reload
      featureGate.reload();

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
    });
  });

  describe('getLicenseState', () => {
    it('should return "Not Activated" when no license', () => {
      expect(featureGate.getLicenseState()).toBe('Not Activated');
    });

    it('should return "Active" for valid license', () => {
      writeLicenseCache(createTestCache(), testDir);

      expect(featureGate.getLicenseState()).toBe('Active');
    });

    it('should return "Grace" during grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 33);

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      expect(featureGate.getLicenseState()).toBe('Grace');
    });

    it('should return "Expired" after grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 40);

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      expect(featureGate.getLicenseState()).toBe('Expired');
    });
  });

  describe('getLicenseInfo', () => {
    it('should return null when no license', () => {
      expect(featureGate.getLicenseInfo()).toBeNull();
    });

    it('should return license info when active', () => {
      writeLicenseCache(createTestCache(['pro.squads.*', 'pro.memory.*']), testDir);

      const info = featureGate.getLicenseInfo();

      expect(info).not.toBeNull();
      expect(info.state).toBe('Active');
      expect(info.features).toContain('pro.squads.*');
      expect(info.features).toContain('pro.memory.*');
      expect(info.inGrace).toBe(false);
      expect(info.isExpired).toBe(false);
    });
  });

  describe('singleton pattern', () => {
    it('should export singleton instance', () => {
      expect(featureGate).toBeInstanceOf(FeatureGate);
    });

    it('should maintain state across imports', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);
      featureGate.reload();

      // Re-import
      const { featureGate: fg2 } = require('../../pro/license/feature-gate');

      expect(fg2.isAvailable('pro.squads.premium')).toBe(true);
    });
  });

  describe('Performance (AC-13)', () => {
    it('should complete isAvailable in under 5ms', () => {
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);
      featureGate.reload();

      // Warm up cache
      featureGate.isAvailable('pro.squads.premium');

      // Measure
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        featureGate.isAvailable('pro.squads.premium');
      }

      const elapsed = performance.now() - start;
      const avgMs = elapsed / iterations;

      // Should be well under 5ms (typically < 0.1ms)
      expect(avgMs).toBeLessThan(5);
    });
  });
});
