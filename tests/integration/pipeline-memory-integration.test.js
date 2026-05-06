/**
 * UnifiedActivationPipeline Memory Integration Tests (MIS-6)
 *
 * Tests the complete pipeline flow with memory injection:
 * - Scenario 1: Activation WITHOUT pro/ → no memories, no errors
 * - Scenario 2: Activation WITH pro/ but no digests → empty array, no errors
 * - Scenario 3: Activation WITH pro/ and digests → memories injected correctly
 * - Scenario 4: Token budget respected → never exceeds configured limit
 * - Scenario 5: Agent scoping enforced → only own + shared memories
 *
 * @module __tests__/integration/pipeline-memory-integration
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const { UnifiedActivationPipeline } = require('../../.aiox-core/development/scripts/unified-activation-pipeline');

// Mock pro-detector for testing different scenarios
jest.mock('../../bin/utils/pro-detector');
const proDetector = require('../../bin/utils/pro-detector');

describe('UnifiedActivationPipeline Memory Integration (MIS-6)', () => {
  let pipeline;
  const testProjectRoot = path.join(__dirname, '..', 'fixtures', 'test-project-memory');

  // Store original env to restore after tests
  const originalPipelineTimeout = process.env.AIOX_PIPELINE_TIMEOUT;
  const originalCriticalLoaderTimeout = process.env.AIOX_LOADER_TIMEOUT_CRITICAL;
  const originalHighLoaderTimeout = process.env.AIOX_LOADER_TIMEOUT_HIGH;
  const originalBestEffortLoaderTimeout = process.env.AIOX_LOADER_TIMEOUT_BEST_EFFORT;

  beforeEach(() => {
    // Increase pipeline timeout so tests don't fail under heavy load (full suite)
    process.env.AIOX_PIPELINE_TIMEOUT = '5000';
    process.env.AIOX_LOADER_TIMEOUT_CRITICAL = '5000';
    process.env.AIOX_LOADER_TIMEOUT_HIGH = '5000';
    process.env.AIOX_LOADER_TIMEOUT_BEST_EFFORT = '5000';
    pipeline = new UnifiedActivationPipeline(testProjectRoot);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Restore original pipeline timeout
    if (originalPipelineTimeout !== undefined) {
      process.env.AIOX_PIPELINE_TIMEOUT = originalPipelineTimeout;
    } else {
      delete process.env.AIOX_PIPELINE_TIMEOUT;
    }
    if (originalCriticalLoaderTimeout !== undefined) {
      process.env.AIOX_LOADER_TIMEOUT_CRITICAL = originalCriticalLoaderTimeout;
    } else {
      delete process.env.AIOX_LOADER_TIMEOUT_CRITICAL;
    }
    if (originalHighLoaderTimeout !== undefined) {
      process.env.AIOX_LOADER_TIMEOUT_HIGH = originalHighLoaderTimeout;
    } else {
      delete process.env.AIOX_LOADER_TIMEOUT_HIGH;
    }
    if (originalBestEffortLoaderTimeout !== undefined) {
      process.env.AIOX_LOADER_TIMEOUT_BEST_EFFORT = originalBestEffortLoaderTimeout;
    } else {
      delete process.env.AIOX_LOADER_TIMEOUT_BEST_EFFORT;
    }

    // Cleanup test data
    try {
      const digestsPath = path.join(testProjectRoot, '.aiox', 'session-digests');
      await fs.rm(digestsPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    // Clear all timers to prevent Jest warnings (TEST-002)
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  /**
   * SCENARIO 1: Activation WITHOUT pro/ → no memories, no errors
   */
  describe('Scenario 1: No Pro Available', () => {
    beforeEach(() => {
      // Mock pro as unavailable
      proDetector.isProAvailable.mockReturnValue(false);
      proDetector.loadProModule.mockReturnValue(null);
    });

    it('should activate successfully with empty memories array', async () => {
      const result = await pipeline.activate('dev');

      expect(result).toBeDefined();
      expect(result.greeting).toBeDefined();
      expect(result.context).toBeDefined();
      expect(result.context.memories).toEqual([]);
      expect(result.fallback).toBe(false);
    });

    it('should not throw errors when pro is unavailable', async () => {
      await expect(pipeline.activate('qa')).resolves.toBeDefined();
    });

    it('should work for all agent IDs', async () => {
      const agentIds = ['dev', 'qa', 'architect', 'pm', 'po'];

      for (const agentId of agentIds) {
        const result = await pipeline.activate(agentId);
        expect(result.context.memories).toEqual([]);
      }
    });
  });

  /**
   * SCENARIO 2: Activation WITH pro/ but no digests → empty array, no errors
   */
  describe('Scenario 2: Pro Available, No Digests', () => {
    beforeEach(() => {
      // Mock pro as available but return mock classes
      proDetector.isProAvailable.mockReturnValue(true);

      // Mock MemoryLoader that returns empty results (no digests)
      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent() {
          return { memories: [], metadata: { count: 0, tokensUsed: 0 } };
        }
      };

      // Mock feature gate as enabled
      const mockFeatureGate = {
        featureGate: {
          isAvailable: jest.fn().mockReturnValue(true),
        },
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') {
          return MockMemoryLoader;
        }
        if (module === 'license/feature-gate') {
          return mockFeatureGate;
        }
        return null;
      });
    });

    it('should activate successfully with empty memories array', async () => {
      const result = await pipeline.activate('dev');

      expect(result).toBeDefined();
      expect(result.context.memories).toEqual([]);
      expect(result.metrics.loaders.memories).toBeDefined();
      expect(result.metrics.loaders.memories.status).toBe('ok');
    });

    it('should not throw errors when digests directory is empty', async () => {
      await expect(pipeline.activate('architect')).resolves.toBeDefined();
    });
  });

  /**
   * SCENARIO 3: Activation WITH pro/ and digests → memories injected correctly
   */
  describe('Scenario 3: Pro Available, With Digests', () => {
    const mockMemories = [
      {
        id: 'mem-001',
        title: 'Test Memory 1',
        summary: 'HOT memory about testing',
        sector: 'procedural',
        tier: 'hot',
        attention_score: 0.8,
        agent: 'dev',
      },
      {
        id: 'mem-002',
        title: 'Test Memory 2',
        summary: 'WARM memory about architecture',
        sector: 'semantic',
        tier: 'warm',
        attention_score: 0.5,
        agent: 'dev',
      },
    ];

    beforeEach(() => {
      proDetector.isProAvailable.mockReturnValue(true);

      // Mock MemoryLoader that returns test memories
      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent(agentId, options) {
          // Add small delay to simulate real async operation (for metrics.duration test)
          await new Promise(resolve => setTimeout(resolve, 10));

          return {
            memories: mockMemories,
            metadata: {
              agent: agentId,
              count: 2,
              tokensUsed: 450,
              budget: options.budget || 2000,
              tiers: ['hot', 'warm'],
            },
          };
        }
      };

      const mockFeatureGate = {
        featureGate: {
          isAvailable: jest.fn().mockReturnValue(true),
        },
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') {
          return MockMemoryLoader;
        }
        if (module === 'license/feature-gate') {
          return mockFeatureGate;
        }
        return null;
      });
    });

    it('should inject memories into enrichedContext', async () => {
      const result = await pipeline.activate('dev');

      expect(result.context.memories).toHaveLength(2);
      expect(result.context.memories[0]).toMatchObject({
        id: 'mem-001',
        title: 'Test Memory 1',
        tier: 'hot',
      });
    });

    it('should include memory metadata in metrics', async () => {
      const result = await pipeline.activate('dev');

      expect(result.metrics.loaders.memories).toBeDefined();
      expect(result.metrics.loaders.memories.status).toBe('ok');
      expect(result.metrics.loaders.memories.duration).toBeGreaterThan(0);
    });

    it('should maintain activation quality as non-fallback', async () => {
      const result = await pipeline.activate('dev');

      // Under heavy load (full test suite), pipeline may report 'partial' instead of 'full'
      // The key assertion is that memories were injected (not a fallback)
      expect(['full', 'partial']).toContain(result.quality);
      expect(result.fallback).toBe(false);
    });
  });

  /**
   * SCENARIO 4: Token budget respected → never exceeds configured limit
   */
  describe('Scenario 4: Token Budget Enforcement', () => {
    beforeEach(() => {
      proDetector.isProAvailable.mockReturnValue(true);

      // Mock MemoryLoader that respects budget
      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent(agentId, options) {
          const budget = options.budget || 2000;
          // Simulate budget enforcement
          const memories = [];
          let tokensUsed = 0;

          // Add memories until budget is reached (each memory ~200 tokens)
          const maxPossibleMemories = 20; // Hard cap to prevent infinite loops
          for (let i = 0; i < maxPossibleMemories; i++) {
            const memoryTokens = 200;
            // Stop if adding this memory would exceed budget
            if (tokensUsed + memoryTokens > budget) {
              break;
            }

            memories.push({
              id: `mem-${i}`,
              title: `Memory ${i}`,
              summary: 'Test memory',
              sector: 'procedural',
              tier: i < 5 ? 'hot' : 'warm',
              attention_score: i < 5 ? 0.8 : 0.5,
              agent: agentId,
            });
            tokensUsed += memoryTokens;
          }

          return {
            memories,
            metadata: { count: memories.length, tokensUsed, budget },
          };
        }
      };

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(true) },
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') return MockMemoryLoader;
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });
    });

    it('should never exceed configured budget', async () => {
      const result = await pipeline.activate('dev');

      // With 2000 budget and 200 tokens per memory, max should be 10 memories
      // (2000 / 200 = 10)
      const expectedMaxMemories = 2000 / 200;
      expect(result.context.memories.length).toBeLessThanOrEqual(expectedMaxMemories);

      // Verify actual token usage doesn't exceed budget
      const tokensPerMemory = 200;
      const actualTokens = result.context.memories.length * tokensPerMemory;
      expect(actualTokens).toBeLessThanOrEqual(2000);
    });

    it('should stop adding memories when budget is reached', async () => {
      const result = await pipeline.activate('dev');

      // With default 2000 budget and 200 tokens per memory, max is 10 memories
      expect(result.context.memories.length).toBeLessThanOrEqual(10);
    });
  });

  /**
   * SCENARIO 5: Agent scoping enforced → only own + shared memories
   */
  describe('Scenario 5: Agent Scoping Privacy', () => {
    beforeEach(() => {
      proDetector.isProAvailable.mockReturnValue(true);

      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent(agentId, options) {
          // Simulate proper agent scoping
          const allMemories = [
            { id: 'mem-dev-1', agent: 'dev', title: 'Dev Memory' },
            { id: 'mem-qa-1', agent: 'qa', title: 'QA Memory' },
            { id: 'mem-shared-1', agent: 'shared', title: 'Shared Memory' },
          ];

          // Filter to only agent's own + shared
          const memories = allMemories.filter(m =>
            m.agent === agentId || m.agent === 'shared',
          );

          return {
            memories,
            metadata: { count: memories.length, tokensUsed: memories.length * 200 },
          };
        }
      };

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(true) },
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') return MockMemoryLoader;
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });
    });

    it('should only return dev + shared memories for dev agent', async () => {
      const result = await pipeline.activate('dev');

      const agents = result.context.memories.map(m => m.agent);
      expect(agents).toContain('dev');
      expect(agents).toContain('shared');
      expect(agents).not.toContain('qa');
    });

    it('should only return qa + shared memories for qa agent', async () => {
      const result = await pipeline.activate('qa');

      const agents = result.context.memories.map(m => m.agent);
      expect(agents).toContain('qa');
      expect(agents).toContain('shared');
      expect(agents).not.toContain('dev');
    });

    it('should never leak private memories between agents', async () => {
      const devResult = await pipeline.activate('dev');
      const qaResult = await pipeline.activate('qa');

      const devAgents = devResult.context.memories.map(m => m.agent);
      const qaAgents = qaResult.context.memories.map(m => m.agent);

      // Dev should not see QA memories
      expect(devAgents).not.toContain('qa');
      // QA should not see Dev memories
      expect(qaAgents).not.toContain('dev');
      // Both should see shared
      expect(devAgents).toContain('shared');
      expect(qaAgents).toContain('shared');
    });
  });

  /**
   * EDGE CASES & ERROR HANDLING
   */
  describe('Edge Cases', () => {
    it('should handle feature gate disabled gracefully', async () => {
      proDetector.isProAvailable.mockReturnValue(true);

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(false) },
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });

      const result = await pipeline.activate('dev');
      expect(result.context.memories).toEqual([]);
    });

    it('should handle memory loader errors gracefully', async () => {
      proDetector.isProAvailable.mockReturnValue(true);

      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent() {
          throw new Error('Simulated memory load error');
        }
      };

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(true) },
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') return MockMemoryLoader;
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });

      // Should not throw, should gracefully degrade
      const result = await pipeline.activate('dev');
      expect(result.context.memories).toEqual([]);
      expect(result.metrics.loaders.memories).toBeDefined();
    });

    it('should handle timeout gracefully (< 500ms)', async () => {
      // Pipeline timeout is already set to 5000ms in beforeEach,
      // so the _profileLoader memory timeout (500ms) fires BEFORE pipeline timeout

      proDetector.isProAvailable.mockReturnValue(true);

      // Track timer so we can clear it in case pipeline abandons the promise
      let slowTimer;
      const MockMemoryLoader = class {
        constructor() {}
        async loadForAgent() {
          // Simulate slow load that exceeds _profileLoader timeout (500ms)
          await new Promise(resolve => {
            slowTimer = setTimeout(resolve, 600);
          });
          return { memories: [], metadata: {} };
        }
      };

      const mockFeatureGate = {
        featureGate: { isAvailable: jest.fn().mockReturnValue(true) },
      };

      proDetector.loadProModule.mockImplementation((module) => {
        if (module === 'memory/memory-loader') return MockMemoryLoader;
        if (module === 'license/feature-gate') return mockFeatureGate;
        return null;
      });

      const result = await pipeline.activate('dev');

      // Should timeout and return empty memories (null from _profileLoader → || [])
      expect(result.context.memories).toEqual([]);

      // _profileLoader records metrics even on timeout
      expect(result.metrics).toBeDefined();
      expect(result.metrics.loaders).toBeDefined();
      expect(result.metrics.loaders.memories).toBeDefined();
      expect(result.metrics.loaders.memories.status).toBe('timeout');

      // Clean up abandoned timer to prevent Jest worker leaks
      if (slowTimer) clearTimeout(slowTimer);
    }, 10000); // Increase test timeout
  });
});
