/**
 * Tests for WorkflowExecutor callback system
 *
 * Story 12.6: Observability Panel Integration + Dashboard Bridge
 *
 * Tests:
 * - onPhaseChange callback registration and emission
 * - onAgentSpawn callback registration and emission
 * - onTerminalSpawn callback registration and emission
 * - Multiple callback support
 * - Error handling in callbacks
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const { WorkflowExecutor } = require('../../../.aiox-core/core/orchestration/workflow-executor');

describe('WorkflowExecutor Callbacks (Story 12.6)', () => {
  let tempDir;
  let executor;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'executor-callbacks-'));

    // Create minimal directory structure
    await fs.ensureDir(path.join(tempDir, '.aiox-core/development/workflows'));
    await fs.ensureDir(path.join(tempDir, '.aiox'));

    // Create minimal workflow file
    const workflowContent = `
workflow:
  id: development-cycle
  phases:
    1_validation:
      agent: \${story.executor}
      on_success: 2_development
    2_development:
      agent: \${story.executor}
      on_success: 3_self_healing
`;
    await fs.writeFile(
      path.join(tempDir, '.aiox-core/development/workflows/development-cycle.yaml'),
      workflowContent,
    );

    executor = new WorkflowExecutor(tempDir, { debug: false });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('Callback Registration', () => {
    describe('onPhaseChange', () => {
      it('should register phase change callback', () => {
        const callback = jest.fn();
        executor.onPhaseChange(callback);

        expect(executor._phaseChangeCallbacks).toContain(callback);
      });

      it('should support multiple callbacks', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        executor.onPhaseChange(callback1);
        executor.onPhaseChange(callback2);

        expect(executor._phaseChangeCallbacks).toHaveLength(2);
      });

      it('should ignore non-function callbacks', () => {
        executor.onPhaseChange('not a function');
        executor.onPhaseChange(123);
        executor.onPhaseChange(null);

        expect(executor._phaseChangeCallbacks).toHaveLength(0);
      });
    });

    describe('onAgentSpawn', () => {
      it('should register agent spawn callback', () => {
        const callback = jest.fn();
        executor.onAgentSpawn(callback);

        expect(executor._agentSpawnCallbacks).toContain(callback);
      });

      it('should support multiple callbacks', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        executor.onAgentSpawn(callback1);
        executor.onAgentSpawn(callback2);

        expect(executor._agentSpawnCallbacks).toHaveLength(2);
      });
    });

    describe('onTerminalSpawn', () => {
      it('should register terminal spawn callback', () => {
        const callback = jest.fn();
        executor.onTerminalSpawn(callback);

        expect(executor._terminalSpawnCallbacks).toContain(callback);
      });

      it('should support multiple callbacks', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        executor.onTerminalSpawn(callback1);
        executor.onTerminalSpawn(callback2);

        expect(executor._terminalSpawnCallbacks).toHaveLength(2);
      });
    });
  });

  describe('Callback Emission', () => {
    describe('_emitPhaseChange', () => {
      it('should call all registered callbacks with correct args', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        executor.onPhaseChange(callback1);
        executor.onPhaseChange(callback2);

        executor._emitPhaseChange('1_validation', '12.6', '@dev');

        expect(callback1).toHaveBeenCalledWith('1_validation', '12.6', '@dev');
        expect(callback2).toHaveBeenCalledWith('1_validation', '12.6', '@dev');
      });

      it('should handle callback errors gracefully', () => {
        const failingCallback = jest.fn(() => {
          throw new Error('Callback error');
        });
        const successCallback = jest.fn();

        executor.onPhaseChange(failingCallback);
        executor.onPhaseChange(successCallback);

        // Should not throw
        expect(() => {
          executor._emitPhaseChange('1_validation', '12.6', '@dev');
        }).not.toThrow();

        // Second callback should still be called
        expect(successCallback).toHaveBeenCalled();
      });
    });

    describe('_emitAgentSpawn', () => {
      it('should call all registered callbacks with correct args', () => {
        const callback = jest.fn();
        executor.onAgentSpawn(callback);

        executor._emitAgentSpawn('@dev', 'development');

        expect(callback).toHaveBeenCalledWith('@dev', 'development');
      });

      it('should handle callback errors gracefully', () => {
        const failingCallback = jest.fn(() => {
          throw new Error('Callback error');
        });

        executor.onAgentSpawn(failingCallback);

        expect(() => {
          executor._emitAgentSpawn('@dev', 'development');
        }).not.toThrow();
      });
    });

    describe('_emitTerminalSpawn', () => {
      it('should call all registered callbacks with correct args', () => {
        const callback = jest.fn();
        executor.onTerminalSpawn(callback);

        executor._emitTerminalSpawn('@dev', 12345, 'development');

        expect(callback).toHaveBeenCalledWith('@dev', 12345, 'development');
      });

      it('should handle callback errors gracefully', () => {
        const failingCallback = jest.fn(() => {
          throw new Error('Callback error');
        });

        executor.onTerminalSpawn(failingCallback);

        expect(() => {
          executor._emitTerminalSpawn('@dev', 12345, 'development');
        }).not.toThrow();
      });
    });
  });

  describe('Integration with Phase Execution', () => {
    it('should emit phase change when executePhase is called', async () => {
      const phaseCallback = jest.fn();
      executor.onPhaseChange(phaseCallback);

      // Load workflow
      await executor.loadWorkflow();

      // Initialize state
      executor.state = {
        workflowId: 'development-cycle',
        currentPhase: '1_validation',
        currentStory: path.join(tempDir, 'test-story.story.md'),
        executor: '@dev',
        qualityGate: '@qa',
        attemptCount: 0,
        startedAt: new Date(),
        lastUpdated: new Date(),
        phaseResults: {},
        accumulatedContext: {},
      };

      // Create minimal story file
      const storyContent = `
# Test Story

\`\`\`yaml
executor: "@dev"
quality_gate: "@qa"
\`\`\`
`;
      await fs.writeFile(path.join(tempDir, 'test-story.story.md'), storyContent);

      // Execute a phase
      await executor.executePhase('1_validation', path.join(tempDir, 'test-story.story.md'), {});

      // Verify callback was called
      expect(phaseCallback).toHaveBeenCalled();
      const [phase, storyId] = phaseCallback.mock.calls[0];
      expect(phase).toBe('1_validation');
    });
  });

  describe('Callback Array Initialization', () => {
    it('should initialize callback arrays in constructor', () => {
      expect(executor._phaseChangeCallbacks).toBeDefined();
      expect(executor._phaseChangeCallbacks).toEqual([]);

      expect(executor._agentSpawnCallbacks).toBeDefined();
      expect(executor._agentSpawnCallbacks).toEqual([]);

      expect(executor._terminalSpawnCallbacks).toBeDefined();
      expect(executor._terminalSpawnCallbacks).toEqual([]);
    });
  });
});
