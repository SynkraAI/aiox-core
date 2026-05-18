/**
 * WorkflowExecutor CodeRabbit invocation tests
 *
 * Regression guards for #763/#764:
 * - non-zero CodeRabbit subprocess exits must not pass silently
 * - workflow-executor WSL probing mirrors Layer 2 behavior
 */

'use strict';

const childProcess = require('child_process');
const os = require('os');
const path = require('path');

const { WorkflowExecutor } = require('../../../.aiox-core/core/orchestration/workflow-executor');

const expectedDefaultCliPath = path.join(os.homedir(), '/.local/bin/coderabbit');

describe('WorkflowExecutor CodeRabbit analysis', () => {
  let originalPlatform;
  let spawnSyncSpy;
  let execSpy;

  beforeEach(() => {
    originalPlatform = process.platform;
    spawnSyncSpy = jest.spyOn(childProcess, 'spawnSync').mockImplementation((cmd) => {
      if (cmd === 'wsl') {
        return { status: 0, stdout: 'Ubuntu\n', stderr: '' };
      }
      return { status: 0, stdout: '', stderr: '' };
    });
    execSpy = jest.spyOn(childProcess, 'exec').mockImplementation((command, options, callback) => {
      callback(null, '', '');
      return { pid: 1234 };
    });
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    spawnSyncSpy.mockRestore();
    execSpy.mockRestore();
  });

  const setPlatform = (value) => {
    Object.defineProperty(process, 'platform', { value });
  };

  const runAnalysis = (config = {}, projectRoot = process.cwd()) => {
    const executor = new WorkflowExecutor(projectRoot, { saveState: false, debug: false });
    return executor.runCodeRabbitAnalysis({
      self_healing: { timeout_minutes: 1 },
      ...config,
    });
  };

  it('returns an informative failure when CodeRabbit exits non-zero', async () => {
    setPlatform('darwin');
    execSpy.mockImplementation((command, options, callback) => {
      const error = new Error('Command failed');
      error.code = 137;
      error.stdout = '';
      error.stderr = '';
      callback(error, '', '');
      return { pid: 1234 };
    });

    const result = await runAnalysis({ installation_mode: 'native' });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/CodeRabbit CLI exited with code 137/);
    expect(result.error).toContain('stdout:');
    expect(result.error).toContain('stderr:');
  });

  it('surfaces a clear error when WSL binary is missing (ENOENT)', async () => {
    setPlatform('darwin');
    spawnSyncSpy.mockImplementation((cmd) => {
      if (cmd === 'wsl') {
        return { error: Object.assign(new Error('ENOENT'), { code: 'ENOENT' }), status: null };
      }
      return { status: 0, stdout: '', stderr: '' };
    });

    const result = await runAnalysis({ installation_mode: 'wsl' });

    expect(spawnSyncSpy).toHaveBeenCalledWith('wsl', ['-l'], expect.any(Object));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/CodeRabbit CLI requires WSL/);
    expect(result.error).toMatch(/wsl --install/);
    expect(result.error).toMatch(/installation-troubleshooting/);
    expect(execSpy).not.toHaveBeenCalled();
  });

  it('surfaces a clear error when WSL has no usable distribution', async () => {
    setPlatform('darwin');
    spawnSyncSpy.mockImplementation((cmd) => {
      if (cmd === 'wsl') {
        return { status: 1, stdout: '', stderr: 'no distros\n' };
      }
      return { status: 0, stdout: '', stderr: '' };
    });

    const result = await runAnalysis({ installation_mode: 'wsl' });

    expect(spawnSyncSpy).toHaveBeenCalledWith('wsl', ['-l'], expect.any(Object));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/CodeRabbit CLI requires WSL/);
    expect(execSpy).not.toHaveBeenCalled();
  });

  it('does not probe WSL when installation_mode=native on Windows', async () => {
    setPlatform('win32');

    await runAnalysis({ installation_mode: 'native' });

    expect(execSpy).toHaveBeenCalled();
    const command = execSpy.mock.calls[0][0];
    expect(command).toBe(`${expectedDefaultCliPath} --prompt-only -t uncommitted`);
    const wslProbeCalls = spawnSyncSpy.mock.calls.filter((c) => c[0] === 'wsl');
    expect(wslProbeCalls).toHaveLength(0);
  });

  it('does not probe WSL for default native mode on macOS', async () => {
    setPlatform('darwin');

    await runAnalysis();

    expect(execSpy).toHaveBeenCalled();
    const command = execSpy.mock.calls[0][0];
    expect(command).toBe(`${expectedDefaultCliPath} --prompt-only -t uncommitted`);
    const wslProbeCalls = spawnSyncSpy.mock.calls.filter((c) => c[0] === 'wsl');
    expect(wslProbeCalls).toHaveLength(0);
  });
});
