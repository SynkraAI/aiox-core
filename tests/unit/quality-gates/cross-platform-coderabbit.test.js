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

const os = require('os');
const path = require('path');

const { Layer2PRAutomation } = require('../../../.aiox-core/core/quality-gates/layer2-pr-automation');

const expectedDefaultCliPath = path.join(os.homedir(), '/.local/bin/coderabbit');

describe('Cross-platform CodeRabbit invocation (Issue #731)', () => {
  let originalPlatform;
  let originalCwd;
  let layer;
  let capturedCommand;

  beforeEach(() => {
    originalPlatform = process.platform;
    originalCwd = process.cwd;
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
    process.cwd = originalCwd;
  });

  const setPlatform = (value) => {
    Object.defineProperty(process, 'platform', { value });
  };

  it('builds a native command on macOS (darwin)', async () => {
    setPlatform('darwin');
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe(`${expectedDefaultCliPath} --prompt-only -t uncommitted`);
    expect(capturedCommand).not.toMatch(/wsl bash -c/);
  });

  it('builds a native command on Linux', async () => {
    setPlatform('linux');
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe(`${expectedDefaultCliPath} --prompt-only -t uncommitted`);
    expect(capturedCommand).not.toMatch(/wsl bash -c/);
  });

  it('wraps the command with `wsl bash -c` on Windows (win32) — keeps `~` literal for WSL bash to expand', async () => {
    setPlatform('win32');
    await layer.runCodeRabbit();
    expect(capturedCommand).toMatch(/^wsl bash -c '/);
    // WSL mode keeps the literal `~/.local/bin/coderabbit` so the WSL distribution's
    // bash expands it (host HOME points at a Windows path that WSL cannot resolve).
    expect(capturedCommand).toContain('~/.local/bin/coderabbit --prompt-only -t uncommitted');
    // Crucially, the cli_path itself must NOT have been pre-expanded to the host's
    // home dir — that would put a Windows path inside the WSL command.
    expect(capturedCommand).not.toContain(`${expectedDefaultCliPath} --prompt-only`);
  });

  it('converts Windows project root to /mnt/<drive>/... inside wsl command', async () => {
    setPlatform('win32');
    process.cwd = () => 'C:\\Users\\dev\\project';
    await layer.runCodeRabbit();
    expect(capturedCommand).toMatch(/cd "\/mnt\/c\/Users\/dev\/project"/);
  });

  it('handles lowercase drive letters when converting to /mnt/<drive>/...', async () => {
    setPlatform('win32');
    process.cwd = () => 'd:\\workspace\\project';
    await layer.runCodeRabbit();
    expect(capturedCommand).toMatch(/cd "\/mnt\/d\/workspace\/project"/);
  });

  it('honors an explicit installation_mode override (native on Windows)', async () => {
    setPlatform('win32');
    layer.coderabbit.installation_mode = 'native';
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe(`${expectedDefaultCliPath} --prompt-only -t uncommitted`);
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

  it('respects a custom cli_path when building wsl command (absolute path, no tilde expansion needed)', async () => {
    setPlatform('win32');
    layer.coderabbit.cli_path = '/usr/local/bin/coderabbit-custom';
    await layer.runCodeRabbit();
    expect(capturedCommand).toContain('/usr/local/bin/coderabbit-custom --prompt-only -t uncommitted');
    expect(capturedCommand).toMatch(/^wsl bash -c '/);
  });

  it('expands tilde (~) in cli_path via os.homedir() in NATIVE mode — defensive', async () => {
    setPlatform('darwin');
    layer.coderabbit.cli_path = '~/custom/coderabbit';
    await layer.runCodeRabbit();
    expect(capturedCommand).toBe(`${path.join(os.homedir(), '/custom/coderabbit')} --prompt-only -t uncommitted`);
    expect(capturedCommand).not.toContain('~/custom');
  });

  it('keeps tilde (~) literal in cli_path in WSL mode — bash expands it inside WSL', async () => {
    setPlatform('darwin');
    layer.coderabbit.installation_mode = 'wsl';
    layer.coderabbit.cli_path = '~/custom/coderabbit';
    await layer.runCodeRabbit();
    // WSL mode preserves the literal `~` (the WSL bash, not the host shell,
    // is what expands it). Host's os.homedir() would yield a Windows path
    // that WSL cannot resolve.
    expect(capturedCommand).toContain('~/custom/coderabbit --prompt-only -t uncommitted');
  });
});
