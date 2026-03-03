/**
 * Claude Execution Robustness - Test Suite
 * Verifies that prompts are handled safely via stdin instead of shell pipes.
 * Covers success scenarios, error handling, and input validation.
 */

const { SubagentDispatcher } = require('../../.aios-core/core/execution/subagent-dispatcher');
const { BuildOrchestrator } = require('../../.aios-core/core/execution/build-orchestrator');
const { mockChildProcess, createMockMemoryQuery, createMockGotchasMemory } = require('./execution-test-helpers');
const child_process = require('child_process');

// Mock child_process.spawn
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

describe('Claude Execution Robustness', () => {
  let mockSpawn;
  let mockMQ, mockGM;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpawn = mockChildProcess('simulated output', '', 0);
    // Add stdin mock to the process
    mockSpawn.process.stdin = {
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      writable: true
    };
    child_process.spawn.mockReturnValue(mockSpawn.process);
    
    // Create mock dependencies to pass to constructor
    mockMQ = createMockMemoryQuery();
    mockGM = createMockGotchasMemory();
  });

  describe('SubagentDispatcher.executeClaude', () => {
    let sd;
    beforeEach(() => {
      sd = new SubagentDispatcher({ 
        rootPath: '/tmp',
        memoryQuery: mockMQ,
        gotchasMemory: mockGM
      });
    });

    it('should pass the prompt via stdin instead of shell pipes', async () => {
      const prompt = "Test prompt with 'quotes' and | pipes";
      const promise = sd.executeClaude(prompt);
      mockSpawn.emitData();
      const result = await promise;

      expect(child_process.spawn).toHaveBeenCalledWith(
        'claude',
        ['--print', '--dangerously-skip-permissions'],
        expect.objectContaining({ cwd: '/tmp' })
      );
      expect(mockSpawn.process.stdin.write).toHaveBeenCalledWith(prompt);
      expect(result.success).toBe(true);
    });

    it('should reject if prompt is invalid', async () => {
      await expect(sd.executeClaude(null)).rejects.toThrow('non-empty string prompt');
      await expect(sd.executeClaude('')).rejects.toThrow('non-empty string prompt');
      await expect(sd.executeClaude(123)).rejects.toThrow('non-empty string prompt');
    });

    it('should handle non-zero exit codes', async () => {
      mockSpawn = mockChildProcess('', 'command error', 1);
      mockSpawn.process.stdin = { write: jest.fn(), end: jest.fn(), on: jest.fn(), writable: true };
      child_process.spawn.mockReturnValue(mockSpawn.process);

      const promise = sd.executeClaude("test");
      mockSpawn.emitData();
      await expect(promise).rejects.toThrow('Claude CLI exited with code 1');
    });
  });

  describe('BuildOrchestrator.runClaudeCLI', () => {
    let bo;
    beforeEach(() => {
      bo = new BuildOrchestrator({ rootPath: '/tmp' });
    });

    it('should pass the prompt via stdin and handle model override', async () => {
      const prompt = "Build this component";
      const config = { claudeModel: 'claude-3-opus', subtaskTimeout: 5000 };
      const promise = bo.runClaudeCLI(prompt, '/tmp/work', config);
      
      mockSpawn.emitData();
      const result = await promise;

      expect(child_process.spawn).toHaveBeenCalledWith(
        'claude',
        ['--print', '--dangerously-skip-permissions', '--model', 'claude-3-opus'],
        expect.objectContaining({ cwd: '/tmp/work' })
      );
      expect(mockSpawn.process.stdin.write).toHaveBeenCalledWith(prompt);
      expect(result.stdout).toBe('simulated output');
    });

    it('should throw if prompt is invalid', async () => {
      await expect(bo.runClaudeCLI(null, '/tmp')).rejects.toThrow('non-empty string prompt');
    });

    it('should handle spawn errors (e.g. command not found)', async () => {
      const EventEmitter = require('events');
      const errProcess = new EventEmitter();
      // Important: provide a dummy handler for stdout/stderr to avoid errors when the code tries to access them
      errProcess.stdout = new EventEmitter();
      errProcess.stderr = new EventEmitter();
      errProcess.stdin = { on: jest.fn(), write: jest.fn(), end: jest.fn() };
      
      child_process.spawn.mockReturnValue(errProcess);

      const promise = bo.runClaudeCLI("test", "/tmp", {});
      
      // Emit error after the handler is attached in runClaudeCLI
      process.nextTick(() => errProcess.emit('error', new Error('spawn ENOENT')));

      await expect(promise).rejects.toThrow('spawn ENOENT');
    });
  });
});
