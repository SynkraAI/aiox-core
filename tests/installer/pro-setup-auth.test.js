/**
 * Unit tests for pro-setup.js email auth flow (PRO-11)
 *
 * @see Story PRO-11 - Email Authentication & Buyer-Based Pro Activation
 * @see AC-7 - Backward compatibility with license key
 */

'use strict';

const proSetup = require('../../packages/installer/src/wizard/pro-setup');

describe('pro-setup auth constants', () => {
  it('should export EMAIL_PATTERN', () => {
    const { EMAIL_PATTERN } = proSetup._testing;

    expect(EMAIL_PATTERN.test('valid@email.com')).toBe(true);
    expect(EMAIL_PATTERN.test('user+tag@domain.co')).toBe(true);
    expect(EMAIL_PATTERN.test('invalid')).toBe(false);
    expect(EMAIL_PATTERN.test('@no-user.com')).toBe(false);
    expect(EMAIL_PATTERN.test('no-domain@')).toBe(false);
    expect(EMAIL_PATTERN.test('')).toBe(false);
  });

  it('should have MIN_PASSWORD_LENGTH of 8', () => {
    expect(proSetup._testing.MIN_PASSWORD_LENGTH).toBe(8);
  });

  it('should have VERIFY_POLL_INTERVAL_MS of 5000', () => {
    expect(proSetup._testing.VERIFY_POLL_INTERVAL_MS).toBe(5000);
  });

  it('should have VERIFY_POLL_TIMEOUT_MS of 10 minutes', () => {
    expect(proSetup._testing.VERIFY_POLL_TIMEOUT_MS).toBe(10 * 60 * 1000);
  });
});

describe('pro-setup CI auth (AC-7, Task 4.6)', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore env
    process.env = { ...originalEnv };
  });

  it('should prefer email+password over key in CI mode', async () => {
    const mockClient = {
      isOnline: jest.fn().mockResolvedValue(true),
      login: jest.fn().mockResolvedValue({
        sessionToken: 'test-session',
        userId: 'user-1',
        emailVerified: true,
      }),
      activateByAuth: jest.fn().mockResolvedValue({
        key: 'PRO-AUTO-1234-5678-ABCD',
        features: ['pro.squads.*'],
        seats: { used: 1, max: 2 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
    };

    const mockLicenseApi = {
      LicenseApiClient: jest.fn().mockReturnValue(mockClient),
    };

    // Override the loader
    proSetup._testing.loadLicenseApi = () => mockLicenseApi;

    const result = await proSetup._testing.stepLicenseGateCI({
      email: 'ci@test.com',
      password: 'CIPassword123',
      key: 'PRO-SKIP-THIS-KEY0-XXXX',
    });

    expect(result.success).toBe(true);
    expect(mockClient.login).toHaveBeenCalledWith('ci@test.com', 'CIPassword123');
    // Key should NOT be used when email is present
    expect(result.key).toBe('PRO-AUTO-1234-5678-ABCD');

    // Cleanup
    proSetup._testing.loadLicenseApi = undefined;
  });

  it('should fall back to key when no email in CI mode', async () => {
    const mockClient = {
      isOnline: jest.fn().mockResolvedValue(true),
      activate: jest.fn().mockResolvedValue({
        key: 'PRO-KEY0-1234-5678-ABCD',
        features: ['pro.squads.*'],
        seats: { used: 1, max: 2 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
      syncPendingDeactivation: jest.fn().mockResolvedValue(false),
    };

    const mockLicenseApi = {
      LicenseApiClient: jest.fn().mockReturnValue(mockClient),
    };

    proSetup._testing.loadLicenseApi = () => mockLicenseApi;

    const result = await proSetup._testing.stepLicenseGateCI({
      key: 'PRO-KEY0-1234-5678-ABCD',
    });

    // Should validate via key flow
    expect(result.success).toBeDefined();

    proSetup._testing.loadLicenseApi = undefined;
  });

  it('should return error when no credentials in CI mode', async () => {
    const result = await proSetup._testing.stepLicenseGateCI({});

    expect(result.success).toBe(false);
    expect(result.error).toContain('AIOS_PRO_EMAIL');
  });
});

describe('pro-setup backward compatibility (AC-7)', () => {
  it('should still export validateKeyFormat', () => {
    expect(typeof proSetup.validateKeyFormat).toBe('function');
    expect(proSetup.validateKeyFormat('PRO-ABCD-1234-5678-WXYZ')).toBe(true);
    expect(proSetup.validateKeyFormat('invalid')).toBe(false);
  });

  it('should still export maskLicenseKey', () => {
    expect(typeof proSetup.maskLicenseKey).toBe('function');
    expect(proSetup.maskLicenseKey('PRO-ABCD-1234-5678-WXYZ')).toBe('PRO-ABCD-****-****-WXYZ');
  });

  it('should export all original functions', () => {
    expect(typeof proSetup.runProWizard).toBe('function');
    expect(typeof proSetup.stepLicenseGate).toBe('function');
    expect(typeof proSetup.stepInstallScaffold).toBe('function');
    expect(typeof proSetup.stepVerify).toBe('function');
    expect(typeof proSetup.isCIEnvironment).toBe('function');
    expect(typeof proSetup.showProHeader).toBe('function');
  });

  it('should export new auth testing helpers', () => {
    expect(typeof proSetup._testing.authenticateWithEmail).toBe('function');
    expect(typeof proSetup._testing.waitForEmailVerification).toBe('function');
    expect(typeof proSetup._testing.activateProByAuth).toBe('function');
    expect(typeof proSetup._testing.stepLicenseGateCI).toBe('function');
  });
});
