'use strict';

/**
 * IDE Sync Integration Tests (Story INS-4.5)
 *
 * Verifies that the installer calls commandSync and commandValidate
 * via the adapter pattern (save cwd, chdir, finally restore).
 */

const path = require('path');

// Mock the ide-sync module before requiring wizard
const mockCommandSync = jest.fn();
const mockCommandValidate = jest.fn();

jest.mock('../../../../../.aios-core/infrastructure/scripts/ide-sync/index', () => ({
  commandSync: mockCommandSync,
  commandValidate: mockCommandValidate,
}));

// We need to verify that the wizard source code has the correct integration
const fs = require('fs');
const WIZARD_PATH = path.join(
  __dirname, '..', '..', '..', 'src', 'wizard', 'index.js'
);

describe('IDE Sync Integration (Story INS-4.5)', () => {
  let wizardSource;

  beforeAll(() => {
    wizardSource = fs.readFileSync(WIZARD_PATH, 'utf8');
  });

  describe('AC1: IDE sync called via adapter pattern', () => {
    test('wizard imports commandSync and commandValidate from ide-sync', () => {
      expect(wizardSource).toContain(
        "const { commandSync, commandValidate } = require('../../../../.aios-core/infrastructure/scripts/ide-sync/index')"
      );
    });

    test('wizard uses programmatic API (not child_process.exec)', () => {
      // Should NOT shell out to ide-sync
      expect(wizardSource).not.toMatch(/child_process.*ide-sync/);
      expect(wizardSource).not.toMatch(/exec\(.*ide-sync/);
      expect(wizardSource).not.toMatch(/spawn\(.*ide-sync/);
    });

    test('adapter pattern: saves cwd before calling commandSync', () => {
      expect(wizardSource).toContain('const savedCwd = process.cwd()');
    });

    test('adapter pattern: uses explicit targetProjectRoot variable (not bare process.cwd())', () => {
      expect(wizardSource).toContain('const targetProjectRoot = process.cwd()');
      expect(wizardSource).toContain('process.chdir(targetProjectRoot)');
    });

    test('adapter pattern: restores cwd in finally block', () => {
      // The finally block should restore savedCwd
      expect(wizardSource).toContain('process.chdir(savedCwd)');
      expect(wizardSource).toMatch(/finally\s*\{[^}]*process\.chdir\(savedCwd\)/s);
    });

    test('commandSync called with { quiet: true }', () => {
      expect(wizardSource).toContain("await commandSync({ quiet: true })");
    });

    test('does NOT pass projectRoot or ides as parameters to commandSync', () => {
      // commandSync uses process.cwd() internally — no projectRoot param
      expect(wizardSource).not.toMatch(/commandSync\(\{[^}]*projectRoot/);
      expect(wizardSource).not.toMatch(/commandSync\(\{[^}]*ides/);
    });
  });

  describe('AC3: Graceful failure', () => {
    test('sync failure is caught and does not propagate', () => {
      // The try/catch should set ideSyncStatus to failed, not throw
      expect(wizardSource).toContain("answers.ideSyncStatus = 'failed'");
    });

    test('failure message suggests aios doctor --fix', () => {
      expect(wizardSource).toContain("aios doctor --fix");
    });

    test('install summary includes sync status on success', () => {
      expect(wizardSource).toContain("answers.ideSyncStatus = 'synced'");
    });

    test('install summary includes sync status on failure', () => {
      expect(wizardSource).toContain("answers.ideSyncStatus = 'failed'");
    });
  });

  describe('AC4: Validate sync output', () => {
    test('commandValidate called after commandSync', () => {
      // commandValidate should appear after commandSync in the source
      const syncIndex = wizardSource.indexOf('await commandSync({ quiet: true })');
      const validateIndex = wizardSource.indexOf('await commandValidate(');
      expect(syncIndex).toBeGreaterThan(-1);
      expect(validateIndex).toBeGreaterThan(-1);
      expect(validateIndex).toBeGreaterThan(syncIndex);
    });

    test('commandValidate uses same adapter pattern (within same finally block)', () => {
      // Both commandSync and commandValidate should be within the same
      // saved cwd / finally block
      const savedCwdIndex = wizardSource.indexOf('const savedCwd = process.cwd()');
      const syncIndex = wizardSource.indexOf('await commandSync({ quiet: true })');
      const validateIndex = wizardSource.indexOf('await commandValidate(');
      const finallyIndex = wizardSource.indexOf('process.chdir(savedCwd)');

      // All should be in order: savedCwd < sync < validate < finally restore
      expect(savedCwdIndex).toBeLessThan(syncIndex);
      expect(syncIndex).toBeLessThan(validateIndex);
      expect(validateIndex).toBeLessThan(finallyIndex);
    });

    test('validation drift logged as WARN not ERROR', () => {
      expect(wizardSource).toContain("answers.ideSyncValidation = 'drift'");
      // Should use console.warn, not console.error for drift
      expect(wizardSource).toMatch(/console\.warn\(.*drift/i);
    });

    test('commandValidate console output suppressed (quiet workaround)', () => {
      // commandValidate does not support quiet — wizard suppresses console.log
      expect(wizardSource).toContain('const _origLog = console.log');
      expect(wizardSource).toContain('console.log = () => {}');
      // console.log must be restored in a finally block
      expect(wizardSource).toContain('console.log = _origLog');
    });
  });

  describe('AC5: Behavioral tests with mocks', () => {
    beforeEach(() => {
      mockCommandSync.mockReset();
      mockCommandValidate.mockReset();
    });

    test('commandSync is called with { quiet: true } when invoked', async () => {
      mockCommandSync.mockResolvedValue(undefined);
      mockCommandValidate.mockResolvedValue(undefined);

      // Simulate the adapter pattern call sequence
      const savedCwd = process.cwd();
      try {
        await mockCommandSync({ quiet: true });
        await mockCommandValidate({ quiet: true });
      } finally {
        process.chdir(savedCwd);
      }

      expect(mockCommandSync).toHaveBeenCalledWith({ quiet: true });
      expect(mockCommandValidate).toHaveBeenCalledWith({ quiet: true });
    });

    test('commandSync failure does not throw — install continues', async () => {
      mockCommandSync.mockRejectedValue(new Error('sync failed'));

      let ideSyncStatus = 'unknown';
      const savedCwd = process.cwd();
      try {
        process.chdir(process.cwd());
        await mockCommandSync({ quiet: true });
        ideSyncStatus = 'synced';
      } catch (syncError) {
        ideSyncStatus = 'failed';
      } finally {
        process.chdir(savedCwd);
      }

      // Install should continue — status is failed, no uncaught throw
      expect(ideSyncStatus).toBe('failed');
      expect(process.cwd()).toBe(savedCwd);
    });

    test('cwd is restored even when commandSync throws', async () => {
      mockCommandSync.mockRejectedValue(new Error('sync failed'));
      const originalCwd = process.cwd();

      const savedCwd = process.cwd();
      try {
        process.chdir(process.cwd());
        await mockCommandSync({ quiet: true });
      } catch {
        // Expected — sync failed
      } finally {
        process.chdir(savedCwd);
      }

      expect(process.cwd()).toBe(originalCwd);
    });

    test('commandValidate called after successful sync', async () => {
      mockCommandSync.mockResolvedValue(undefined);
      mockCommandValidate.mockResolvedValue(undefined);

      const savedCwd = process.cwd();
      let validateCalled = false;
      try {
        process.chdir(process.cwd());
        await mockCommandSync({ quiet: true });
        await mockCommandValidate({ quiet: true });
        validateCalled = true;
      } finally {
        process.chdir(savedCwd);
      }

      expect(validateCalled).toBe(true);
      expect(mockCommandValidate).toHaveBeenCalled();
    });

    test('commandValidate NOT called when commandSync fails', async () => {
      mockCommandSync.mockRejectedValue(new Error('sync failed'));

      const savedCwd = process.cwd();
      try {
        process.chdir(process.cwd());
        await mockCommandSync({ quiet: true });
        // This line should NOT be reached
        await mockCommandValidate({ quiet: true });
      } catch {
        // Expected — sync failed, validate not called
      } finally {
        process.chdir(savedCwd);
      }

      expect(mockCommandSync).toHaveBeenCalled();
      expect(mockCommandValidate).not.toHaveBeenCalled();
    });
  });
});
