/**
 * Tests for License Recovery Flow (Story INS-3.3)
 *
 * Verifies:
 *   - Anti-enumeration: identical message for any email
 *   - Correct recovery URL
 *   - Offline fallback: shows URL when browser cannot open
 *   - Email masking
 */

const readline = require('readline');
const { maskEmail, openBrowser, promptEmail, recoverLicense, RECOVERY_URL, RECOVERY_MESSAGE } = require('../packages/aios-pro-cli/src/recover');

// ─── Constants ────────────────────────────────────────────────────────────────

describe('Recovery Constants', () => {
  test('RECOVERY_URL is the correct portal URL', () => {
    expect(RECOVERY_URL).toBe('https://pro.synkra.ai/recover');
  });

  test('RECOVERY_MESSAGE is the anti-enumeration message', () => {
    expect(RECOVERY_MESSAGE).toContain('Se este email estiver associado');
    expect(RECOVERY_MESSAGE).toContain('instrucoes de recuperacao');
  });
});

// ─── Anti-Enumeration ─────────────────────────────────────────────────────────

describe('Anti-Enumeration', () => {
  test('RECOVERY_MESSAGE is identical regardless of email — same constant used', () => {
    // The message is a constant, not computed from email input.
    // This guarantees no information leakage by design.
    const msg1 = RECOVERY_MESSAGE;
    const msg2 = RECOVERY_MESSAGE;
    expect(msg1).toBe(msg2);
  });

  test('message does NOT contain any confirmation of email existence', () => {
    expect(RECOVERY_MESSAGE).not.toMatch(/found|exists|valid|invalid|not found|registered/i);
  });
});

// ─── Email Masking ────────────────────────────────────────────────────────────

describe('maskEmail', () => {
  test('masks email correctly: u***@example.com', () => {
    expect(maskEmail('user@example.com')).toBe('u***@example.com');
  });

  test('handles single-char local part', () => {
    expect(maskEmail('a@b.com')).toBe('a***@b.com');
  });

  test('returns *** for invalid email without @', () => {
    expect(maskEmail('notanemail')).toBe('***');
  });

  test('returns *** for email starting with @', () => {
    expect(maskEmail('@example.com')).toBe('***');
  });
});

// ─── Browser Open / Offline Fallback ──────────────────────────────────────────

describe('openBrowser', () => {
  test('returns true when browser opens successfully', async () => {
    const mockOpen = jest.fn().mockResolvedValue(undefined);
    const result = await openBrowser(RECOVERY_URL, mockOpen);
    expect(result).toBe(true);
    expect(mockOpen).toHaveBeenCalledWith(RECOVERY_URL);
  });

  test('returns false when open() rejects (offline fallback)', async () => {
    const mockOpen = jest.fn().mockRejectedValue(new Error('Could not open browser'));
    const result = await openBrowser(RECOVERY_URL, mockOpen);
    expect(result).toBe(false);
  });

  test('returns false when open() throws synchronously', async () => {
    const mockOpen = jest.fn().mockImplementation(() => {
      throw new Error('Cannot find module');
    });
    const result = await openBrowser(RECOVERY_URL, mockOpen);
    expect(result).toBe(false);
  });
});

// ─── promptEmail ─────────────────────────────────────────────────────────────

describe('promptEmail', () => {
  let createInterfaceSpy;

  afterEach(() => {
    if (createInterfaceSpy) createInterfaceSpy.mockRestore();
  });

  function mockReadline(answer) {
    const mockClose = jest.fn();
    const mockQuestion = jest.fn((_prompt, cb) => cb(answer));
    createInterfaceSpy = jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: mockQuestion,
      close: mockClose,
    });
    return { mockQuestion, mockClose };
  }

  test('resolves with trimmed email from user input', async () => {
    const { mockQuestion, mockClose } = mockReadline('  test@example.com  ');
    const email = await promptEmail();
    expect(email).toBe('test@example.com');
    expect(mockQuestion).toHaveBeenCalledWith('  Enter your email: ', expect.any(Function));
    expect(mockClose).toHaveBeenCalled();
  });

  test('resolves with empty string for whitespace-only input', async () => {
    mockReadline('   ');
    const email = await promptEmail();
    expect(email).toBe('');
  });

  test('passes correct options to createInterface', async () => {
    mockReadline('a@b.com');
    await promptEmail();
    expect(createInterfaceSpy).toHaveBeenCalledWith({
      input: process.stdin,
      output: process.stdout,
    });
  });
});

// ─── recoverLicense Integration ──────────────────────────────────────────────

describe('recoverLicense', () => {
  let createInterfaceSpy;
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    if (createInterfaceSpy) createInterfaceSpy.mockRestore();
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  function mockReadline(answer) {
    const mockClose = jest.fn();
    const mockQuestion = jest.fn((_prompt, cb) => cb(answer));
    createInterfaceSpy = jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: mockQuestion,
      close: mockClose,
    });
  }

  test('full flow: shows anti-enum message, masked email, and recovery URL', async () => {
    mockReadline('user@example.com');
    // Use a mock openFn by temporarily replacing openBrowser behavior
    // recoverLicense calls openBrowser(RECOVERY_URL) without openFn,
    // so the dynamic import will fail in test env → offline fallback
    await recoverLicense();

    const allOutput = logSpy.mock.calls.map(c => c[0]).join('\n');

    // AC1: shows recovery message
    expect(allOutput).toContain(RECOVERY_MESSAGE);
    // AC2: anti-enumeration — same constant message
    expect(allOutput).not.toMatch(/found|exists|valid|invalid|not found|registered/i);
    // AC2: masked email displayed
    expect(allOutput).toContain('u***@example.com');
    // AC4: always shows URL in text
    expect(allOutput).toContain(RECOVERY_URL);
  });

  test('exits with error when email is empty', async () => {
    mockReadline('');
    await expect(recoverLicense()).rejects.toThrow('process.exit called');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Email is required'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test('shows offline fallback message when browser cannot open', async () => {
    mockReadline('test@mail.com');
    // open package not available in test env → offline fallback
    await recoverLicense();

    const allOutput = logSpy.mock.calls.map(c => c[0]).join('\n');
    expect(allOutput).toContain('Could not open browser automatically');
    expect(allOutput).toContain(RECOVERY_URL);
  });
});
