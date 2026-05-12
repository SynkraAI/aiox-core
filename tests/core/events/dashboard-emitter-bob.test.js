/**
 * Tests for DashboardEmitter Bob-specific methods
 *
 * Story 12.6: Observability Panel Integration + Dashboard Bridge
 *
 * Tests:
 * - New emitBob* methods
 * - Event type correctness
 * - Fallback to file
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const { DashboardEmitter, getDashboardEmitter } = require('../../../.aiox-core/core/events/dashboard-emitter');
const { DashboardEventType } = require('../../../.aiox-core/core/events/types');

describe('DashboardEmitter Bob-specific methods', () => {
  let emitter;
  let tempDir;
  let originalEnv;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'emitter-test-'));
    originalEnv = process.env.NODE_ENV;

    // Reset singleton for clean tests
    DashboardEmitter.instance = null;
    emitter = new DashboardEmitter();
    emitter.enabled = true;
    emitter.projectRoot = tempDir;
    emitter.fallbackPath = path.join(tempDir, '.aiox', 'dashboard', 'events.jsonl');
  });

  afterEach(async () => {
    process.env.NODE_ENV = originalEnv;
    DashboardEmitter.instance = null;
    await fs.remove(tempDir);
  });

  describe('DashboardEventType', () => {
    it('should have Bob-specific event types', () => {
      expect(DashboardEventType.BOB_PHASE_CHANGE).toBe('BobPhaseChange');
      expect(DashboardEventType.BOB_AGENT_SPAWNED).toBe('BobAgentSpawned');
      expect(DashboardEventType.BOB_AGENT_COMPLETED).toBe('BobAgentCompleted');
      expect(DashboardEventType.BOB_SURFACE_DECISION).toBe('BobSurfaceDecision');
      expect(DashboardEventType.BOB_ERROR).toBe('BobError');
    });
  });

  describe('emitBobPhaseChange', () => {
    it('should emit BobPhaseChange event with correct data', async () => {
      const events = [];
      const originalEmit = emitter.emit.bind(emitter);
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      await emitter.emitBobPhaseChange('development', '12.6', '@dev');

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(DashboardEventType.BOB_PHASE_CHANGE);
      expect(events[0].data.phase).toBe('development');
      expect(events[0].data.story).toBe('12.6');
      expect(events[0].data.executor).toBe('@dev');
    });
  });

  describe('emitBobAgentSpawned', () => {
    it('should emit BobAgentSpawned event with correct data', async () => {
      const events = [];
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      await emitter.emitBobAgentSpawned('@dev', 12345, 'development');

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(DashboardEventType.BOB_AGENT_SPAWNED);
      expect(events[0].data.agent).toBe('@dev');
      expect(events[0].data.pid).toBe(12345);
      expect(events[0].data.task).toBe('development');
    });
  });

  describe('emitBobAgentCompleted', () => {
    it('should emit BobAgentCompleted event with correct data', async () => {
      const events = [];
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      await emitter.emitBobAgentCompleted('@dev', 12345, true, 5000);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(DashboardEventType.BOB_AGENT_COMPLETED);
      expect(events[0].data.agent).toBe('@dev');
      expect(events[0].data.pid).toBe(12345);
      expect(events[0].data.success).toBe(true);
      expect(events[0].data.duration).toBe(5000);
    });

    it('should handle failed agent completion', async () => {
      const events = [];
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      await emitter.emitBobAgentCompleted('@dev', 12345, false, 3000);

      expect(events[0].data.success).toBe(false);
      expect(events[0].data.duration).toBe(3000);
    });
  });

  describe('emitBobSurfaceDecision', () => {
    it('should emit BobSurfaceDecision event with correct data', async () => {
      const events = [];
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      const context = { options: ['A', 'B', 'C'] };
      await emitter.emitBobSurfaceDecision('C003', 'present_options', context);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(DashboardEventType.BOB_SURFACE_DECISION);
      expect(events[0].data.criteria).toBe('C003');
      expect(events[0].data.action).toBe('present_options');
      expect(events[0].data.context).toEqual(context);
    });

    it('should handle empty context', async () => {
      const events = [];
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      await emitter.emitBobSurfaceDecision('C001', 'auto_decide');

      expect(events[0].data.context).toEqual({});
    });
  });

  describe('emitBobError', () => {
    it('should emit BobError event with correct data', async () => {
      const events = [];
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      await emitter.emitBobError('development', 'Test failed', true);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(DashboardEventType.BOB_ERROR);
      expect(events[0].data.phase).toBe('development');
      expect(events[0].data.message).toBe('Test failed');
      expect(events[0].data.recoverable).toBe(true);
    });

    it('should default recoverable to true', async () => {
      const events = [];
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      await emitter.emitBobError('quality_gate', 'Review failed');

      expect(events[0].data.recoverable).toBe(true);
    });

    it('should handle non-recoverable errors', async () => {
      const events = [];
      emitter.emit = async (type, data) => {
        events.push({ type, data });
      };

      await emitter.emitBobError('push', 'Authentication failed', false);

      expect(events[0].data.recoverable).toBe(false);
    });
  });

  describe('Fallback behavior', () => {
    it('should write to fallback file when emit fails', async () => {
      // Force HTTP to fail
      emitter._postEvent = async () => {
        throw new Error('Network error');
      };

      await emitter.emit(DashboardEventType.BOB_PHASE_CHANGE, { phase: 'test' });

      // Wait for async write
      await new Promise((resolve) => setTimeout(resolve, 100));

      const exists = await fs.pathExists(emitter.fallbackPath);
      expect(exists).toBe(true);

      const content = await fs.readFile(emitter.fallbackPath, 'utf8');
      const event = JSON.parse(content.trim());
      expect(event.type).toBe(DashboardEventType.BOB_PHASE_CHANGE);
      expect(event.data.phase).toBe('test');
    });
  });

  describe('Disabled emitter', () => {
    it('should not emit when disabled', async () => {
      emitter.enabled = false;

      // Override _postEvent to track calls
      let postCalled = false;
      emitter._postEvent = async () => {
        postCalled = true;
      };

      await emitter.emitBobPhaseChange('development', '12.6', '@dev');

      expect(postCalled).toBe(false);
    });
  });

  describe('Singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = getDashboardEmitter();
      const instance2 = getDashboardEmitter();
      expect(instance1).toBe(instance2);
    });
  });
});
