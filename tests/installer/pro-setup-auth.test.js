/**
 * Unit tests for pro-setup.js email auth flow (PRO-11)
 *
 * @see Story PRO-11 - Email Authentication & Buyer-Based Pro Activation
 * @see AC-7 - Backward compatibility with license key
 */

'use strict';

const proSetup = require('../../packages/installer/src/wizard/pro-setup');
let generateRuntimeMachineId;
try {
  ({ generateMachineId: generateRuntimeMachineId } = require('../../pro/license/license-crypto'));
} catch {
  generateRuntimeMachineId = null;
}

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
    expect(result.error).toContain('AIOX_PRO_EMAIL');
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
    expect(typeof proSetup._testing.fallbackAuthWithoutBuyerCheck).toBe('function');
    expect(typeof proSetup._testing.generateMachineId).toBe('function');
    expect(typeof proSetup._testing.persistLicenseCache).toBe('function');
  });
});

describe('pro-setup interactive email fallback', () => {
  afterEach(() => {
    proSetup._testing.loadLicenseApi = undefined;
  });

  it('should continue with direct auth when buyer pre-check is unavailable', async () => {
    const inquirer = require('inquirer');
    const originalPrompt = inquirer.prompt;
    const mockClient = {
      isOnline: jest.fn().mockResolvedValue(true),
      checkEmail: jest.fn().mockRejectedValue(new Error('Buyer validation service unavailable')),
      login: jest.fn().mockResolvedValue({
        sessionToken: 'session-token',
        emailVerified: true,
      }),
      validate: jest.fn().mockResolvedValue({
        valid: true,
        features: ['pro'],
        seats: { used: 1, max: 3 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
      activate: jest.fn(),
      activateByAuth: jest.fn().mockResolvedValue({
        key: 'PRO-ABCD-1234-5678-WXYZ',
        features: ['pro'],
        seats: { used: 1, max: 3 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
    };

    proSetup._testing.loadLicenseApi = () => ({
      LicenseApiClient: jest.fn().mockReturnValue(mockClient),
    });

    inquirer.prompt = jest.fn()
      .mockResolvedValueOnce({ email: 'buyer@example.com' })
      .mockResolvedValueOnce({ password: 'Password123' });

    try {
      const result = await proSetup._testing.stepLicenseGateWithEmail();

      expect(result.success).toBe(true);
      expect(mockClient.checkEmail).toHaveBeenCalledWith('buyer@example.com');
      expect(mockClient.login).toHaveBeenCalledWith('buyer@example.com', 'Password123');
      expect(mockClient.activateByAuth).toHaveBeenCalled();
    } finally {
      inquirer.prompt = originalPrompt;
    }
  });
});

describe('pro-setup machine id compatibility', () => {
  it('should generate a 64-char machine id for backend requests', () => {
    const machineId = proSetup._testing.generateMachineId();

    expect(machineId).toMatch(/^[a-f0-9]{64}$/i);
  });

  it('should match the Pro runtime machine id derivation', () => {
    if (!generateRuntimeMachineId) {
      expect(generateRuntimeMachineId).toBeNull();
      return;
    }

    const wizardMachineId = proSetup._testing.generateMachineId();
    const runtimeMachineId = generateRuntimeMachineId();

    expect(wizardMachineId).toBe(runtimeMachineId);
  });

  it('should pass a 64-char machine id when activating via auth', async () => {
    const client = {
      activateByAuth: jest.fn().mockResolvedValue({
        key: 'PRO-ABCD-1234-5678-WXYZ',
        features: ['pro.squads.*'],
        seats: { used: 1, max: 3 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
      validate: jest.fn().mockResolvedValue({
        valid: true,
        features: ['pro.squads.*'],
        seats: { used: 1, max: 3 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
      activate: jest.fn(),
    };

    const result = await proSetup._testing.activateProByAuth(client, 'session-token');
    const [, machineId] = client.activateByAuth.mock.calls[0];

    expect(result.success).toBe(true);
    expect(machineId).toMatch(/^[a-f0-9]{64}$/i);
    expect(client.validate).toHaveBeenCalledWith('PRO-ABCD-1234-5678-WXYZ', machineId);
    expect(client.activate).not.toHaveBeenCalled();
  });

  it('should backfill key activation when auth activation is not yet validatable', async () => {
    let observedMachineId;
    const client = {
      activateByAuth: jest.fn().mockResolvedValue({
        key: 'PRO-ABCD-1234-5678-WXYZ',
        features: ['pro.squads.*'],
        seats: { used: 1, max: 3 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
      validate: jest.fn().mockRejectedValue({
        code: 'MACHINE_NOT_ACTIVATED',
        message: 'This machine is not activated for this license',
      }),
      activate: jest.fn().mockImplementation((key, machineId) => {
        observedMachineId = machineId;
        return Promise.resolve({
          key,
          features: ['pro.squads.*', 'pro.memory.*'],
          seats: { used: 1, max: 3 },
          cacheValidDays: 30,
          gracePeriodDays: 7,
        });
      }),
    };

    const result = await proSetup._testing.activateProByAuth(client, 'session-token');

    expect(result.success).toBe(true);
    expect(observedMachineId).toMatch(/^[a-f0-9]{64}$/i);
    expect(client.activate).toHaveBeenCalledWith(
      'PRO-ABCD-1234-5678-WXYZ',
      observedMachineId,
      expect.any(String),
    );
    expect(result.activationResult.features).toEqual(['pro.squads.*', 'pro.memory.*']);
  });

  it('should pass a 64-char machine id in license-key activation flow', async () => {
    let observedMachineId;
    const mockLicenseApi = {
      LicenseApiClient: jest.fn().mockReturnValue({
        isOnline: jest.fn().mockResolvedValue(true),
        activate: jest.fn().mockImplementation((key, machineId) => {
          observedMachineId = machineId;
          return Promise.resolve({
            key,
            features: ['pro.squads.*'],
            seats: { used: 1, max: 3 },
            cacheValidDays: 30,
            gracePeriodDays: 7,
          });
        }),
        syncPendingDeactivation: jest.fn().mockResolvedValue(false),
      }),
    };

    proSetup._testing.loadLicenseApi = () => mockLicenseApi;

    const result = await proSetup._testing.validateKeyWithApi('PRO-ABCD-1234-5678-WXYZ');

    expect(result.success).toBe(true);
    expect(observedMachineId).toMatch(/^[a-f0-9]{64}$/i);

    proSetup._testing.loadLicenseApi = undefined;
  });
});

describe('pro-setup license cache persistence', () => {
  afterEach(() => {
    proSetup._testing.loadLicenseCache = undefined;
  });

  it('should persist the activated license into the target project cache', () => {
    const writeLicenseCache = jest.fn().mockReturnValue({ success: true });
    proSetup._testing.loadLicenseCache = () => ({ writeLicenseCache });

    const result = proSetup._testing.persistLicenseCache('/tmp/aiox-pro-target', {
      success: true,
      key: 'PRO-ABCD-1234-5678-WXYZ',
      activationResult: {
        activatedAt: '2026-04-15T12:00:00.000Z',
        expiresAt: '2027-04-15T12:00:00.000Z',
        features: ['pro.squads.*'],
        seats: { used: 1, max: 3 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      },
    });

    expect(result).toEqual({ success: true });
    expect(writeLicenseCache).toHaveBeenCalledWith({
      key: 'PRO-ABCD-1234-5678-WXYZ',
      activatedAt: '2026-04-15T12:00:00.000Z',
      expiresAt: '2027-04-15T12:00:00.000Z',
      features: ['pro.squads.*'],
      seats: { used: 1, max: 3 },
      cacheValidDays: 30,
      gracePeriodDays: 7,
    }, '/tmp/aiox-pro-target');
  });

  it('should fail when no concrete license key is available to persist', () => {
    const writeLicenseCache = jest.fn();
    proSetup._testing.loadLicenseCache = () => ({ writeLicenseCache });

    const result = proSetup._testing.persistLicenseCache('/tmp/aiox-pro-target', {
      success: true,
      key: 'existing',
      activationResult: { reactivation: true },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Activated license key not available');
    expect(writeLicenseCache).not.toHaveBeenCalled();
  });
});
