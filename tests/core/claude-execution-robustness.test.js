/**
 * Claude execution robustness.
 *
 * Verifies that execution prompts are delivered through stdin instead of shell
 * interpolation, which keeps quotes, pipes, and other shell-sensitive text safe.
 */

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

jest.mock('../../.aiox-core/workflow-intelligence/engine/wave-analyzer', () => null);
jest.mock('../../.aiox-core/infrastructure/scripts/worktree-manager', () => { throw new Error('not available'); });
jest.mock('../../.aiox-core/core/memory/gotchas-memory', () => ({ GotchasMemory: jest.fn() }));

const EventEmitter = require('events');
const childProcess = require('child_process');
const { mockChildProcess, createMockMemoryQuery, createMockGotchasMemory } = require('./execution-test-helpers');
const { SubagentDispatcher } = require('../../.aiox-core/core/execution/subagent-dispatcher');
const { BuildOrchestrator } = require('../../.aiox-core/core/execution/build-orchestrator');

function attachMockStdin(mockProcess) {
  const stdin = new EventEmitter();
  stdin.write = jest.fn();
  stdin.end = jest.fn();
  stdin.writable = true;
  mockProcess.stdin = stdin;
  return stdin;
}

describe('Claude execution robustness', () => {
  let mockSpawn;
  let memoryQuery;
  let gotchasMemory;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpawn = mockChildProcess('simulated output', '', 0);
    attachMockStdin(mockSpawn.process);
    childProcess.spawn.mockReturnValue(mockSpawn.process);

    memoryQuery = createMockMemoryQuery();
    gotchasMemory = createMockGotchasMemory();
  });

  describe('SubagentDispatcher.executeClaude', () => {
    test('writes prompt through stdin instead of shell interpolation', async () => {
      const dispatcher = new SubagentDispatcher({
        rootPath: '/tmp/project',
        memoryQuery,
        gotchasMemory,
      });
      const prompt = "Do this with 'quotes' and | pipes";

      const promise = dispatcher.executeClaude(prompt);
      mockSpawn.emitData();
      const result = await promise;

      expect(childProcess.spawn).toHaveBeenCalledWith(
        'claude',
        ['--print', '--dangerously-skip-permissions'],
        expect.objectContaining({
          cwd: '/tmp/project',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 10 * 60 * 1000,
        }),
      );
      expect(mockSpawn.process.stdin.write).toHaveBeenCalledWith(prompt);
      expect(mockSpawn.process.stdin.end).toHaveBeenCalled();
      expect(result).toMatchObject({
        success: true,
        output: 'simulated output',
      });
    });

    test('rejects invalid prompts before spawning Claude', async () => {
      const dispatcher = new SubagentDispatcher({ memoryQuery, gotchasMemory });

      await expect(dispatcher.executeClaude('')).rejects.toThrow('non-empty string prompt');
      await expect(dispatcher.executeClaude(null)).rejects.toThrow('non-empty string prompt');
      expect(childProcess.spawn).not.toHaveBeenCalled();
    });

    test('reports stdin write errors before treating process exit as success', async () => {
      const dispatcher = new SubagentDispatcher({
        rootPath: '/tmp/project',
        memoryQuery,
        gotchasMemory,
      });
      const stdin = mockSpawn.process.stdin;

      const promise = dispatcher.executeClaude('test prompt');
      stdin.emit('error', new Error('EPIPE'));
      mockSpawn.emitData();

      await expect(promise).rejects.toThrow('Claude CLI stdin write failed: EPIPE');
    });

    test('reports non-zero exit codes', async () => {
      mockSpawn = mockChildProcess('', 'command failed', 1);
      attachMockStdin(mockSpawn.process);
      childProcess.spawn.mockReturnValue(mockSpawn.process);

      const dispatcher = new SubagentDispatcher({ memoryQuery, gotchasMemory });
      const promise = dispatcher.executeClaude('test prompt');
      mockSpawn.emitData();

      await expect(promise).rejects.toThrow('Claude CLI exited with code 1: command failed');
    });
  });

  describe('BuildOrchestrator.runClaudeCLI', () => {
    test('writes prompt through stdin and keeps model override', async () => {
      const orchestrator = new BuildOrchestrator({ rootPath: '/tmp/project' });
      const prompt = 'Build this component';

      const promise = orchestrator.runClaudeCLI(prompt, '/tmp/work', {
        claudeModel: 'claude-3-opus',
        subtaskTimeout: 5000,
      });
      mockSpawn.emitData();
      const result = await promise;

      expect(childProcess.spawn).toHaveBeenCalledWith(
        'claude',
        ['--print', '--dangerously-skip-permissions', '--model', 'claude-3-opus'],
        expect.objectContaining({
          cwd: '/tmp/work',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 5000,
        }),
      );
      expect(mockSpawn.process.stdin.write).toHaveBeenCalledWith(prompt);
      expect(result).toMatchObject({
        stdout: 'simulated output',
        code: 0,
      });
    });

    test('rejects invalid prompts before spawning Claude', async () => {
      const orchestrator = new BuildOrchestrator({ rootPath: '/tmp/project' });

      await expect(orchestrator.runClaudeCLI(null, '/tmp/work')).rejects.toThrow(
        'non-empty string prompt',
      );
      expect(childProcess.spawn).not.toHaveBeenCalled();
    });

    test('reports spawn errors', async () => {
      const errProcess = new EventEmitter();
      errProcess.stdout = new EventEmitter();
      errProcess.stderr = new EventEmitter();
      attachMockStdin(errProcess);
      childProcess.spawn.mockReturnValue(errProcess);

      const orchestrator = new BuildOrchestrator({ rootPath: '/tmp/project' });
      const promise = orchestrator.runClaudeCLI('test prompt', '/tmp/work');
      process.nextTick(() => errProcess.emit('error', new Error('spawn ENOENT')));

      await expect(promise).rejects.toThrow('spawn ENOENT');
    });
  });
});
