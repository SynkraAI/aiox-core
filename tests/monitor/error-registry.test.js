/**
 * @file error-registry.test.js
 * @description Unit tests for the ErrorRegistry module.
 */

const fs = require('fs');
const path = require('path');
const ErrorRegistry = require('../../.aiox-core/monitor/error-registry');
const AIOXError = require('../../.aiox-core/utils/aiox-error');

describe('ErrorRegistry', () => {
  const logDir = path.join(process.cwd(), '.aiox', 'logs');
  const logFile = path.join(logDir, 'errors.json');

  beforeEach(() => {
    // Clear logs before each test if they exist
    if (fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, JSON.stringify([], null, 2), 'utf8');
    }
  });

  afterAll(() => {
    // Cleanup is optional for local dev, but good practice
  });

  test('should initialize log directory and file', () => {
    // Trigger initialization by calling a method
    ErrorRegistry.getRecentErrors();
    
    expect(fs.existsSync(logDir)).toBe(true);
    expect(fs.existsSync(logFile)).toBe(true);
  });

  test('should log a string message as an OPERATIONAL error', async () => {
    const message = 'Test simple message';
    const logged = await ErrorRegistry.log(message);
    
    // Check results
    expect(logged).toBeInstanceOf(AIOXError);
    expect(logged.message).toBe(message);
    expect(logged.category).toBe('OPERATIONAL');

    const recent = ErrorRegistry.getRecentErrors(1);
    expect(recent[0].message).toBe(message);
    expect(recent[0].category).toBe('OPERATIONAL');
  });

  test('should log a native Error as a SYSTEM error', async () => {
    const error = new Error('Native failure');
    const logged = await ErrorRegistry.log(error);

    expect(logged.category).toBe('SYSTEM');
    expect(logged.message).toBe(error.message);
    
    const recent = ErrorRegistry.getRecentErrors(1);
    expect(recent[0].category).toBe('SYSTEM');
  });

  test('should clone AIOXError without mutating original and preserve properties', async () => {
    const originalMetadata = { original: true };
    const original = new AIOXError('Original message', {
      category: 'AGENT',
      metadata: originalMetadata,
    });
    const originalStack = original.stack;

    const options = { category: 'SYSTEM', metadata: { updated: true } };
    const logged = await ErrorRegistry.log(original, options);

    // 1. Verify log result has combined info
    expect(logged.message).toBe('Original message');
    expect(logged.category).toBe('SYSTEM');
    expect(logged.metadata.updated).toBe(true);
    expect(logged.stack).toBe(originalStack);

    // 2. Verify original remains UNCHANGED (Principle VII integrity)
    expect(original.category).toBe('AGENT');
    expect(original.metadata).toEqual(originalMetadata);
    expect(original.metadata.updated).toBeUndefined();
  });

  test('should respect silent mode when logging', async () => {
    const spy = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
    
    await ErrorRegistry.log('Silent error', { silent: true });
    expect(spy).not.toHaveBeenCalled();

    await ErrorRegistry.log('Noisy error', { silent: false });
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  test('should support explicit display option', async () => {
    const spy = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
    
    await ErrorRegistry.log('Display false', { display: false });
    expect(spy).not.toHaveBeenCalled();

    await ErrorRegistry.log('Display true', { display: true });
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  test('should support raw output when requested', async () => {
    const spy = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
    const rawMessage = 'Raw error message';
    
    await ErrorRegistry.log(rawMessage, { raw: true });
    // stderr.write expects exactly what was passed + optional newline added by us
    expect(spy).toHaveBeenCalledWith(expect.stringContaining(rawMessage));

    spy.mockRestore();
  });

  test('should limit log size to 500 entries', async () => {
    // Force many logs - now with lock-queueing we need more time
    const promises = [];
    for (let i = 0; i < 510; i++) {
      promises.push(ErrorRegistry.log(`Error ${i}`, { silent: true }));
    }
    await Promise.all(promises);

    const recent = ErrorRegistry.getRecentErrors(1000); // Try to get all
    expect(recent.length).toBeLessThanOrEqual(500);
  }, 60000); // 60s timeout for 510 locked writes
});
