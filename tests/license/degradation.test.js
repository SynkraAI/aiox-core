/**
 * Unit tests for degradation.js
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-8 - Graceful degradation
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  withGracefulDegradation,
  ifProAvailable,
  getFeatureFriendlyName,
  isInDegradedMode,
  getDegradationStatus,
  createDegradationWrapper,
} = require('../../pro/license/degradation');
const { featureGate } = require('../../pro/license/feature-gate');
const { ProFeatureError } = require('../../pro/license/errors');
const { writeLicenseCache, deleteLicenseCache } = require('../../pro/license/license-cache');

describe('degradation', () => {
  let testDir;
  let originalCwd;
  let consoleLogSpy;

  beforeEach(() => {
    // Create temp directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-degradation-test-'));

    // Mock process.cwd to return our test directory
    originalCwd = process.cwd;
    process.cwd = () => testDir;

    // Reset the singleton for clean tests
    featureGate._reset();

    // Spy on console.log to check degradation messages
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore
    process.cwd = originalCwd;
    consoleLogSpy.mockRestore();

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

  describe('withGracefulDegradation', () => {
    it('should execute proAction when feature is available', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      const result = withGracefulDegradation(
        'pro.squads.premium',
        () => 'pro-result',
        () => 'fallback-result',
      );

      expect(result).toBe('pro-result');
    });

    it('should execute fallbackAction when feature is not available', () => {
      // No license

      const result = withGracefulDegradation(
        'pro.squads.premium',
        () => 'pro-result',
        () => 'fallback-result',
      );

      expect(result).toBe('fallback-result');
    });

    it('should log degradation message when feature not available', () => {
      withGracefulDegradation(
        'pro.squads.premium',
        () => 'pro-result',
        () => 'fallback-result',
      );

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls.map(c => c[0]).join(' ');
      expect(logOutput).toContain('requires an active AIOX Pro license');
    });

    it('should not log when silent option is true', () => {
      withGracefulDegradation(
        'pro.squads.premium',
        () => 'pro-result',
        () => 'fallback-result',
        { silent: true },
      );

      const logOutput = consoleLogSpy.mock.calls.map(c => c[0] || '').join(' ');
      expect(logOutput).not.toContain('requires an active AIOX Pro license');
    });

    it('should return null when no fallback provided', () => {
      const result = withGracefulDegradation(
        'pro.squads.premium',
        () => 'pro-result',
      );

      expect(result).toBeNull();
    });
  });

  describe('ifProAvailable', () => {
    it('should execute action when feature is available', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      const result = ifProAvailable('pro.squads.premium', () => 'executed');

      expect(result).toBe('executed');
    });

    it('should return undefined when feature is not available', () => {
      const result = ifProAvailable('pro.squads.premium', () => 'executed');

      expect(result).toBeUndefined();
    });
  });

  describe('getFeatureFriendlyName', () => {
    it('should return friendly name for registered feature', () => {
      const name = getFeatureFriendlyName('pro.squads.premium');

      expect(name).toBe('Premium Squads');
    });

    it('should return featureId for unregistered feature', () => {
      const name = getFeatureFriendlyName('pro.unknown.feature');

      expect(name).toBe('pro.unknown.feature');
    });
  });

  describe('isInDegradedMode', () => {
    it('should return true when no license', () => {
      expect(isInDegradedMode()).toBe(true);
    });

    it('should return false when license is active', () => {
      writeLicenseCache(createTestCache(), testDir);

      expect(isInDegradedMode()).toBe(false);
    });

    it('should return false during grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 33);

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      expect(isInDegradedMode()).toBe(false);
    });

    it('should return true when license expired', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 40);

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      expect(isInDegradedMode()).toBe(true);
    });
  });

  describe('getDegradationStatus', () => {
    it('should return not degraded for active license', () => {
      writeLicenseCache(createTestCache(), testDir);

      const status = getDegradationStatus();

      expect(status.degraded).toBe(false);
      expect(status.reason).toContain('active');
      expect(status.action).toBeNull();
    });

    it('should return not degraded for grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 33);

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      const status = getDegradationStatus();

      expect(status.degraded).toBe(false);
      expect(status.reason).toContain('grace');
      expect(status.action).toBe('aiox pro validate');
    });

    it('should return degraded for expired license', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 40);

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      const status = getDegradationStatus();

      expect(status.degraded).toBe(true);
      expect(status.reason).toContain('expired');
      expect(status.action).toContain('activate');
    });

    it('should return degraded for no license', () => {
      const status = getDegradationStatus();

      expect(status.degraded).toBe(true);
      expect(status.reason).toContain('No license');
      expect(status.action).toContain('activate');
    });
  });

  describe('createDegradationWrapper', () => {
    it('should call original method when no error', () => {
      const module = {
        method: () => 'original-result',
      };

      const wrapped = createDegradationWrapper(module, {});
      const result = wrapped.method();

      expect(result).toBe('original-result');
    });

    it('should call fallback on ProFeatureError', () => {
      const module = {
        method: () => {
          throw new ProFeatureError('pro.test', 'Test Feature');
        },
      };

      const wrapped = createDegradationWrapper(module, {
        method: () => 'fallback-result',
      });
      const result = wrapped.method();

      expect(result).toBe('fallback-result');
    });

    it('should re-throw ProFeatureError when no fallback', () => {
      const module = {
        method: () => {
          throw new ProFeatureError('pro.test', 'Test Feature');
        },
      };

      const wrapped = createDegradationWrapper(module, {});

      expect(() => wrapped.method()).toThrow(ProFeatureError);
    });

    it('should re-throw non-license errors', () => {
      const module = {
        method: () => {
          throw new Error('Regular error');
        },
      };

      const wrapped = createDegradationWrapper(module, {
        method: () => 'fallback',
      });

      expect(() => wrapped.method()).toThrow('Regular error');
    });

    it('should pass through non-function properties', () => {
      const module = {
        value: 42,
        name: 'test',
      };

      const wrapped = createDegradationWrapper(module, {});

      expect(wrapped.value).toBe(42);
      expect(wrapped.name).toBe('test');
    });
  });
});
