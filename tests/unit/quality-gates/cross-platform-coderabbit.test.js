/**
 * Cross-platform CodeRabbit CLI invocation tests
 *
 * Regression guard for Issue #731 — the framework hardcoded `wsl bash -c '...'`
 * for every host. macOS/Linux operators saw silent no-ops; Windows operators
 * saw the only working path. After the fix, the runtime detects
 * `process.platform` and picks the right command shape.
 *
 * This file pins:
 *   - macOS (`darwin`) → native command
 *   - Linux            → native command
 *   - Windows (`win32`) → `wsl bash -c` wrapper
 *   - Explicit `installation_mode` override still wins on every host
 *
 * @issue #731
 */

const { Layer2PRAutomation } = require('../../../.aiox-core/core/quality-gates/layer2-pr-automation');

describe('Cross-platform CodeRabbit invocation (Issue #731)', () => {
  let originalPlatform;
  let layer;
  let capturedCommand;

  beforeEach(() => {
    originalPlatform = process.platform;
    capturedCommand = null;
    layer = new Layer2PRAutomation({
      enabled: true,
      coderabbit: { enabled: true },
      quinn: { enabled: false },
    });
    // Intercept the shell invocation — we only care about command shape, not output.
    layer.runCommand = (command) => {
      capturedCommand = command;
      return Promise.resolve({ stdout: '', stderr: '' });
    };
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  const setPlatform = (value) => {
    Object.defineProperty(process, 'platform', { value });
  };

  it('builds a native command on macOS (darwin)', async () => {
    setPlatform('darwin');
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe('~/.local/bin/coderabbit --prompt-only -t uncommitted');
    expect(capturedCommand).not.toMatch(/wsl bash -c/);
  });

  it('builds a native command on Linux', async () => {
    setPlatform('linux');
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe('~/.local/bin/coderabbit --prompt-only -t uncommitted');
    expect(capturedCommand).not.toMatch(/wsl bash -c/);
  });

  it('wraps the command with `wsl bash -c` on Windows (win32)', async () => {
    setPlatform('win32');
    await layer.runCodeRabbit();
    expect(capturedCommand).toMatch(/^wsl bash -c '/);
    expect(capturedCommand).toContain('~/.local/bin/coderabbit --prompt-only -t uncommitted');
  });

  it('honors an explicit installation_mode override (native on Windows)', async () => {
    setPlatform('win32');
    layer.coderabbit.installation_mode = 'native';
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe('~/.local/bin/coderabbit --prompt-only -t uncommitted');
    expect(capturedCommand).not.toMatch(/wsl bash -c/);
  });

  it('honors an explicit installation_mode override (wsl on macOS)', async () => {
    setPlatform('darwin');
    layer.coderabbit.installation_mode = 'wsl';
    await layer.runCodeRabbit();
    expect(capturedCommand).toMatch(/^wsl bash -c '/);
  });

  it('honors a raw `command` string override (back-compat)', async () => {
    setPlatform('linux');
    layer.coderabbit.command = 'custom-coderabbit --foo';
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe('custom-coderabbit --foo');
  });

  it('respects a custom cli_path when building native command', async () => {
    setPlatform('darwin');
    layer.coderabbit.cli_path = '/opt/homebrew/bin/coderabbit';
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe('/opt/homebrew/bin/coderabbit --prompt-only -t uncommitted');
  });

  it('respects a custom cli_path when building wsl command', async () => {
    setPlatform('win32');
    layer.coderabbit.cli_path = '/usr/local/bin/coderabbit-custom';
    await layer.runCodeRabbit();
    expect(capturedCommand).toContain('/usr/local/bin/coderabbit-custom --prompt-only -t uncommitted');
    expect(capturedCommand).toMatch(/^wsl bash -c '/);
  });
});
