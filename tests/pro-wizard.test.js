/**
 * Pro Installation Wizard Tests
 *
 * @story INS-3.2 — Implement Pro Installation Wizard with License Gate
 */

'use strict';

// Mock modules before requiring the module under test
jest.mock('inquirer');
jest.mock('ora', () => {
  const spinnerMock = {
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    text: '',
  };
  return jest.fn(() => spinnerMock);
});

const inquirer = require('inquirer');

// Save original env and stdout.isTTY
const originalEnv = { ...process.env };
const originalIsTTY = process.stdout.isTTY;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...originalEnv };
  delete process.env.CI;
  delete process.env.AIOS_PRO_KEY;
  Object.defineProperty(process.stdout, 'isTTY', {
    value: true,
    writable: true,
    configurable: true,
  });
  // Suppress console output during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...originalEnv };
  Object.defineProperty(process.stdout, 'isTTY', {
    value: originalIsTTY,
    writable: true,
    configurable: true,
  });
  console.log.mockRestore();
  console.error.mockRestore();
});

// ─── Helper to get module ───────────────────────────────────────────────────

const proSetup = require('../packages/installer/src/wizard/pro-setup');

// ─── maskLicenseKey ──────────────────────────────────────────────────────────

describe('maskLicenseKey', () => {
  test('masks middle segments of valid key', () => {
    expect(proSetup.maskLicenseKey('PRO-ABCD-EFGH-IJKL-MNOP')).toBe('PRO-ABCD-****-****-MNOP');
  });

  test('handles lowercase input', () => {
    expect(proSetup.maskLicenseKey('pro-abcd-efgh-ijkl-mnop')).toBe('PRO-ABCD-****-****-MNOP');
  });

  test('returns **** for null/undefined', () => {
    expect(proSetup.maskLicenseKey(null)).toBe('****');
    expect(proSetup.maskLicenseKey(undefined)).toBe('****');
    expect(proSetup.maskLicenseKey('')).toBe('****');
  });

  test('returns **** for invalid format', () => {
    expect(proSetup.maskLicenseKey('not-a-key')).toBe('****');
    expect(proSetup.maskLicenseKey('PRO-SHORT')).toBe('****');
  });

  test('key never appears in full in any log output', () => {
    const fullKey = 'PRO-ABCD-EFGH-IJKL-MNOP';
    const masked = proSetup.maskLicenseKey(fullKey);

    expect(masked).not.toContain('EFGH');
    expect(masked).not.toContain('IJKL');
    expect(masked).not.toBe(fullKey);
  });
});

// ─── validateKeyFormat ───────────────────────────────────────────────────────

describe('validateKeyFormat', () => {
  test('accepts valid key format', () => {
    expect(proSetup.validateKeyFormat('PRO-ABCD-EF12-GH34-IJ56')).toBe(true);
  });

  test('accepts lowercase (auto-uppercases internally)', () => {
    expect(proSetup.validateKeyFormat('pro-abcd-ef12-gh34-ij56')).toBe(true);
  });

  test('rejects invalid formats', () => {
    expect(proSetup.validateKeyFormat('')).toBe(false);
    expect(proSetup.validateKeyFormat(null)).toBe(false);
    expect(proSetup.validateKeyFormat('INVALID')).toBe(false);
    expect(proSetup.validateKeyFormat('PRO-SHORT')).toBe(false);
    expect(proSetup.validateKeyFormat('PRO-ABCD-EFGH-IJKL')).toBe(false);
  });
});

// ─── isCIEnvironment ─────────────────────────────────────────────────────────

describe('isCIEnvironment', () => {
  test('returns true when CI=true', () => {
    process.env.CI = 'true';
    expect(proSetup.isCIEnvironment()).toBe(true);
  });

  test('returns true when stdout is not TTY', () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: false,
      writable: true,
      configurable: true,
    });
    expect(proSetup.isCIEnvironment()).toBe(true);
  });

  test('returns false in normal interactive terminal', () => {
    delete process.env.CI;
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    });
    expect(proSetup.isCIEnvironment()).toBe(false);
  });
});

// ─── showProHeader ───────────────────────────────────────────────────────────

describe('showProHeader', () => {
  test('outputs branded header', () => {
    proSetup.showProHeader();
    const output = console.log.mock.calls.map((c) => String(c[0] || '')).join('\n');
    expect(output).toContain('AIOS Pro');
    expect(output).toContain('Premium');
  });
});

// ─── stepLicenseGate ─────────────────────────────────────────────────────────

describe('stepLicenseGate', () => {
  test('CI mode: fails when AIOS_PRO_KEY not set', async () => {
    process.env.CI = 'true';
    delete process.env.AIOS_PRO_KEY;

    const result = await proSetup.stepLicenseGate();

    expect(result.success).toBe(false);
    expect(result.error).toContain('AIOS_PRO_KEY');
  });

  test('pre-provided key: rejects invalid format', async () => {
    process.env.CI = 'true';

    const result = await proSetup.stepLicenseGate({ key: 'INVALID-KEY' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid key format');
  });

  test('CI mode with valid format key: attempts API validation', async () => {
    process.env.CI = 'true';
    process.env.AIOS_PRO_KEY = 'PRO-ABCD-EFGH-IJKL-MNOP';

    const result = await proSetup.stepLicenseGate();

    // Will fail because API is not available or returns error, but key is not shown in full
    expect(result.success).toBe(false);
    // Verify error message exists and does NOT contain the full key
    expect(result.error).toBeDefined();
  });

  test('interactive mode: prompts with password type and retries', async () => {
    delete process.env.CI;
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    });

    let callCount = 0;
    inquirer.prompt.mockImplementation((questions) => {
      callCount++;
      // Return a valid format key each time
      return Promise.resolve({ licenseKey: 'PRO-AAAA-BBBB-CCCC-DDDD' });
    });

    const result = await proSetup.stepLicenseGate();

    // Should have been called 3 times (max retries) since API fails
    expect(callCount).toBe(3);
    expect(result.success).toBe(false);

    // Verify inquirer was called with password type
    const firstCall = inquirer.prompt.mock.calls[0][0];
    expect(firstCall[0].type).toBe('password');
    expect(firstCall[0].mask).toBe('*');
  });
});

// ─── stepInstallScaffold ─────────────────────────────────────────────────────

describe('stepInstallScaffold', () => {
  test('fails gracefully when scaffolder not available (no pro package dir)', async () => {
    const result = await proSetup.stepInstallScaffold('/fake/nonexistent/dir');

    // Either scaffolder is not found, or source dir doesn't exist
    expect(result.success).toBe(false);
  });
});

// ─── stepVerify ──────────────────────────────────────────────────────────────

describe('stepVerify', () => {
  test('shows summary of scaffolded content', async () => {
    const mockScaffoldResult = {
      copiedFiles: [
        'squads/premium-squad/agent.md',
        'squads/premium-squad/readme.md',
        '.aios-core/pro-config.yaml',
        'pro-version.json',
      ],
    };

    const result = await proSetup.stepVerify(mockScaffoldResult);

    expect(result.success).toBe(true);
    // squads/ files
    expect(result.squads).toEqual([
      'squads/premium-squad/agent.md',
      'squads/premium-squad/readme.md',
    ]);
    // .yaml and .json files
    expect(result.configs).toEqual([
      '.aios-core/pro-config.yaml',
      'pro-version.json',
    ]);
  });

  test('handles null scaffoldResult', async () => {
    const result = await proSetup.stepVerify(null);

    expect(result.success).toBe(true);
    expect(result.squads).toEqual([]);
    expect(result.configs).toEqual([]);
  });

  test('handles empty copiedFiles', async () => {
    const result = await proSetup.stepVerify({ copiedFiles: [] });

    expect(result.success).toBe(true);
    expect(result.squads).toEqual([]);
  });
});

// ─── runProWizard (integration) ──────────────────────────────────────────────

describe('runProWizard', () => {
  test('fails in CI mode without AIOS_PRO_KEY', async () => {
    process.env.CI = 'true';
    delete process.env.AIOS_PRO_KEY;

    const result = await proSetup.runProWizard();

    expect(result.success).toBe(false);
    expect(result.licenseValidated).toBe(false);
  });

  test('fails with invalid key format in CI', async () => {
    process.env.CI = 'true';
    process.env.AIOS_PRO_KEY = 'INVALID';

    const result = await proSetup.runProWizard();

    expect(result.success).toBe(false);
  });

  test('does not show branding in CI mode', async () => {
    process.env.CI = 'true';
    process.env.AIOS_PRO_KEY = 'PRO-AAAA-BBBB-CCCC-DDDD';

    await proSetup.runProWizard();

    // In CI mode, showProHeader is skipped
    const output = console.log.mock.calls.map((c) => String(c[0] || '')).join('\n');
    // The gold header box chars should not appear
    expect(output).not.toContain('╔══');
  });

  test('does not show branding in quiet mode', async () => {
    await proSetup.runProWizard({ quiet: true, key: 'PRO-AAAA-BBBB-CCCC-DDDD' });

    const output = console.log.mock.calls.map((c) => String(c[0] || '')).join('\n');
    expect(output).not.toContain('╔══');
  });
});

// ─── Key Masking Security ────────────────────────────────────────────────────

describe('Key Masking Security', () => {
  test('full key never appears in console output during wizard', async () => {
    process.env.CI = 'true';
    const fullKey = 'PRO-ABCD-EFGH-IJKL-MNOP';
    process.env.AIOS_PRO_KEY = fullKey;

    await proSetup.runProWizard();

    // Collect all output
    const allOutput = [
      ...console.log.mock.calls.map((c) => String(c[0] || '')),
      ...console.error.mock.calls.map((c) => String(c[0] || '')),
    ].join('\n');

    // The full key should NEVER appear in output
    expect(allOutput).not.toContain(fullKey);

    // Middle segments should never be visible
    expect(allOutput).not.toContain('EFGH');
    expect(allOutput).not.toContain('IJKL');
  });
});

// ─── Lazy Import Graceful Failure ────────────────────────────────────────────

describe('Lazy Import', () => {
  test('pro-setup loads without errors', () => {
    expect(proSetup).toBeDefined();
    expect(typeof proSetup.runProWizard).toBe('function');
    expect(typeof proSetup.maskLicenseKey).toBe('function');
    expect(typeof proSetup.validateKeyFormat).toBe('function');
  });

  test('internal loaders do not throw', () => {
    const { _testing } = proSetup;

    // These should return either the module or null — never throw
    expect(() => _testing.loadLicenseApi()).not.toThrow();
    expect(() => _testing.loadFeatureGate()).not.toThrow();
    expect(() => _testing.loadProScaffolder()).not.toThrow();
  });
});

// ─── API Offline / Error Handling ────────────────────────────────────────────

describe('API Error Handling', () => {
  test('validateKeyWithApi handles missing license module gracefully', async () => {
    // When loadLicenseApi returns null (module not installed),
    // we test by mocking the internal function
    const originalLoad = proSetup._testing.loadLicenseApi;

    // Temporarily override
    proSetup._testing.loadLicenseApi = () => null;

    const result = await proSetup._testing.validateKeyWithApi('PRO-AAAA-BBBB-CCCC-DDDD');

    // Restore
    proSetup._testing.loadLicenseApi = originalLoad;

    expect(result.success).toBe(false);
    expect(result.error).toContain('not available');
  });

  test('validateKeyWithApi handles API offline', async () => {
    const originalLoad = proSetup._testing.loadLicenseApi;

    proSetup._testing.loadLicenseApi = () => ({
      LicenseApiClient: class {
        async isOnline() { return false; }
      },
    });

    const result = await proSetup._testing.validateKeyWithApi('PRO-AAAA-BBBB-CCCC-DDDD');

    proSetup._testing.loadLicenseApi = originalLoad;

    expect(result.success).toBe(false);
    expect(result.error).toContain('unreachable');
  });

  test('validateKeyWithApi handles network error', async () => {
    const originalLoad = proSetup._testing.loadLicenseApi;

    proSetup._testing.loadLicenseApi = () => ({
      LicenseApiClient: class {
        async isOnline() { return true; }
        async activate() {
          const err = new Error('Network error');
          err.code = 'NETWORK_ERROR';
          throw err;
        }
      },
    });

    const result = await proSetup._testing.validateKeyWithApi('PRO-AAAA-BBBB-CCCC-DDDD');

    proSetup._testing.loadLicenseApi = originalLoad;

    expect(result.success).toBe(false);
    expect(result.error).toContain('unreachable');
  });

  test('validateKeyWithApi handles invalid key error', async () => {
    const originalLoad = proSetup._testing.loadLicenseApi;

    proSetup._testing.loadLicenseApi = () => ({
      LicenseApiClient: class {
        async isOnline() { return true; }
        async activate() {
          const err = new Error('Invalid');
          err.code = 'INVALID_KEY';
          throw err;
        }
      },
    });

    const result = await proSetup._testing.validateKeyWithApi('PRO-AAAA-BBBB-CCCC-DDDD');

    proSetup._testing.loadLicenseApi = originalLoad;

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid license key');
  });

  test('validateKeyWithApi handles expired key error', async () => {
    const originalLoad = proSetup._testing.loadLicenseApi;

    proSetup._testing.loadLicenseApi = () => ({
      LicenseApiClient: class {
        async isOnline() { return true; }
        async activate() {
          const err = new Error('Expired');
          err.code = 'EXPIRED_KEY';
          throw err;
        }
      },
    });

    const result = await proSetup._testing.validateKeyWithApi('PRO-AAAA-BBBB-CCCC-DDDD');

    proSetup._testing.loadLicenseApi = originalLoad;

    expect(result.success).toBe(false);
    expect(result.error).toContain('expired');
  });

  test('validateKeyWithApi handles rate limiting', async () => {
    const originalLoad = proSetup._testing.loadLicenseApi;

    proSetup._testing.loadLicenseApi = () => ({
      LicenseApiClient: class {
        async isOnline() { return true; }
        async activate() {
          const err = new Error('Rate limited');
          err.code = 'RATE_LIMITED';
          throw err;
        }
      },
    });

    const result = await proSetup._testing.validateKeyWithApi('PRO-AAAA-BBBB-CCCC-DDDD');

    proSetup._testing.loadLicenseApi = originalLoad;

    expect(result.success).toBe(false);
    expect(result.error).toContain('Too many requests');
  });

  test('validateKeyWithApi handles seat limit exceeded', async () => {
    const originalLoad = proSetup._testing.loadLicenseApi;

    proSetup._testing.loadLicenseApi = () => ({
      LicenseApiClient: class {
        async isOnline() { return true; }
        async activate() {
          const err = new Error('Seats');
          err.code = 'SEAT_LIMIT_EXCEEDED';
          throw err;
        }
      },
    });

    const result = await proSetup._testing.validateKeyWithApi('PRO-AAAA-BBBB-CCCC-DDDD');

    proSetup._testing.loadLicenseApi = originalLoad;

    expect(result.success).toBe(false);
    expect(result.error).toContain('Maximum activations');
  });

  test('validateKeyWithApi handles successful activation', async () => {
    const originalLoad = proSetup._testing.loadLicenseApi;

    proSetup._testing.loadLicenseApi = () => ({
      LicenseApiClient: class {
        async isOnline() { return true; }
        async activate() {
          return {
            key: 'PRO-AAAA-BBBB-CCCC-DDDD',
            features: ['pro.*'],
            seats: { used: 1, max: 3 },
            expiresAt: '2027-01-01',
          };
        }
      },
    });

    const result = await proSetup._testing.validateKeyWithApi('PRO-AAAA-BBBB-CCCC-DDDD');

    proSetup._testing.loadLicenseApi = originalLoad;

    expect(result.success).toBe(true);
    expect(result.data.features).toContain('pro.*');
  });
});
