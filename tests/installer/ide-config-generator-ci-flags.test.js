/**
 * Regression tests for #739 Bug 1 — `--ci --yes` ignored at CLAUDE.md merge prompt.
 *
 * Before the fix: `aiox install --ci --yes --merge --ide claude-code` would
 * reach `promptFileExists()` and call `inquirer.prompt()` regardless of the
 * CI/--yes flags, blocking the installer waiting for keyboard input. The
 * workaround was `printf '\n\n\n' | npx ...`.
 *
 * After the fix: `promptFileExists()` calls `isNonInteractive()` which
 * inspects (in order): explicit options.ci / options.yes / options.skipPrompts,
 * then process.env.CI / AIOX_NON_INTERACTIVE, then TTY presence. When ANY
 * signal indicates non-interactive, the prompt is skipped and the default
 * choice is returned (brownfield + canMerge → 'merge', otherwise → 'backup').
 *
 * These tests lock in:
 *   1. `isNonInteractive()` honours every signal
 *   2. `promptFileExists()` returns the default WITHOUT prompting when CI
 *   3. `promptFileExists()` STILL prompts when interactive (no regression)
 */

'use strict';

const path = require('path');
const inquirer = require('inquirer');

const ideConfigGenerator = require('../../packages/installer/src/wizard/ide-config-generator');
const { isNonInteractive } = ideConfigGenerator._testing;
const { promptFileExists } = ideConfigGenerator;

describe('isNonInteractive() — signal precedence (#739 Bug 1)', () => {
  let originalEnv;
  let originalIsTTY;

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalIsTTY = process.stdout.isTTY;
    // Default to interactive TTY for explicit-option tests so we measure the
    // option signal in isolation.
    process.stdout.isTTY = true;
    delete process.env.CI;
    delete process.env.AIOX_NON_INTERACTIVE;
  });

  afterEach(() => {
    process.env = originalEnv;
    process.stdout.isTTY = originalIsTTY;
  });

  it('returns true when options.ci is set', () => {
    expect(isNonInteractive({ ci: true })).toBe(true);
  });

  it('returns true when options.yes is set', () => {
    expect(isNonInteractive({ yes: true })).toBe(true);
  });

  it('returns true when options.skipPrompts is set', () => {
    expect(isNonInteractive({ skipPrompts: true })).toBe(true);
  });

  it('returns true when CI env var is "true"', () => {
    process.env.CI = 'true';
    expect(isNonInteractive()).toBe(true);
  });

  it('returns true when CI env var is "1"', () => {
    process.env.CI = '1';
    expect(isNonInteractive()).toBe(true);
  });

  it('returns true when AIOX_NON_INTERACTIVE is "true"', () => {
    process.env.AIOX_NON_INTERACTIVE = 'true';
    expect(isNonInteractive()).toBe(true);
  });

  it('returns true when stdout is not a TTY', () => {
    process.stdout.isTTY = false;
    expect(isNonInteractive()).toBe(true);
  });

  it('returns false in a fully interactive shell with no flags', () => {
    process.stdout.isTTY = true;
    expect(isNonInteractive()).toBe(false);
  });

  it('returns false when CI env var is "false" or absent', () => {
    process.env.CI = 'false';
    expect(isNonInteractive()).toBe(false);
  });
});

describe('promptFileExists() — non-interactive default-choice (#739 Bug 1)', () => {
  let promptSpy;
  let originalIsTTY;

  beforeEach(() => {
    promptSpy = jest.spyOn(inquirer, 'prompt');
    originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;
    delete process.env.CI;
  });

  afterEach(() => {
    promptSpy.mockRestore();
    process.stdout.isTTY = originalIsTTY;
  });

  it('skips the prompt and returns "merge" when ci=true + brownfield + can-merge', async () => {
    const action = await promptFileExists('/tmp/CLAUDE.md', {
      projectType: 'BROWNFIELD',
      ci: true,
    });
    expect(action).toBe('merge');
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('skips the prompt and returns "backup" when ci=true + greenfield', async () => {
    const action = await promptFileExists('/tmp/CLAUDE.md', {
      projectType: 'GREENFIELD',
      ci: true,
    });
    expect(action).toBe('backup');
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('skips the prompt when --yes flag (alias for ci) is set', async () => {
    const action = await promptFileExists('/tmp/CLAUDE.md', {
      projectType: 'BROWNFIELD',
      yes: true,
    });
    expect(action).toBe('merge');
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('skips the prompt when CI env var is set (even without --ci flag)', async () => {
    process.env.CI = 'true';
    const action = await promptFileExists('/tmp/CLAUDE.md', {
      projectType: 'BROWNFIELD',
    });
    expect(action).toBe('merge');
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('skips the prompt when stdout is not a TTY (CI pipeline shape)', async () => {
    process.stdout.isTTY = false;
    const action = await promptFileExists('/tmp/CLAUDE.md', {
      projectType: 'BROWNFIELD',
    });
    expect(action).toBe('merge');
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it('honors forceMerge BEFORE the non-interactive check (forceMerge always wins)', async () => {
    const action = await promptFileExists('/tmp/CLAUDE.md', {
      projectType: 'GREENFIELD',
      forceMerge: true,
      ci: true,
    });
    // forceMerge should bypass the default-choice logic and return 'merge'
    expect(action).toBe('merge');
    expect(promptSpy).not.toHaveBeenCalled();
  });

  // Regression guard: ensure the interactive flow is NOT broken. If
  // promptFileExists silently auto-accepts in normal usage too, we have a
  // bigger problem than the CI flag — we'd be ignoring user input entirely.
  it('STILL prompts when interactive shell with no CI signals (no regression)', async () => {
    process.stdout.isTTY = true;
    promptSpy.mockResolvedValue({ action: 'overwrite' });

    const action = await promptFileExists('/tmp/CLAUDE.md', {
      projectType: 'BROWNFIELD',
    });

    expect(promptSpy).toHaveBeenCalledTimes(1);
    expect(action).toBe('overwrite');
  });
});
