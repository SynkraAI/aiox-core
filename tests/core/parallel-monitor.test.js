/**
 * Parallel Monitor - Test Suite
 * Story EXC-1, AC7 - parallel-monitor.js coverage
 *
 * Tests: constructor, registerWave, registerTaskStart/Complete,
 * addTaskOutput, registerWaveComplete, cancelWave, getStatus,
 * formatProgressBar, formatStatus, history, clear
 */

const {
  collectEvents,
} = require('./execution-test-helpers');

const { ParallelMonitor, getMonitor } = require('../../.aios-core/core/execution/parallel-monitor');

describe('ParallelMonitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new ParallelMonitor({ maxHistory: 50, maxLogLines: 100 });
  });

  // ── Constructor ─────────────────────────────────────────────────────

  describe('Constructor', () => {
    test('creates with defaults', () => {
      const m = new ParallelMonitor();
      expect(m.activeWaves).toBeInstanceOf(Map);
      expect(m.activeTasks).toBeInstanceOf(Map);
      expect(m.history).toEqual([]);
      expect(m.notifyOnComplete).toBe(true);
      expect(m.notifyOnFailure).toBe(true);
    });

    test('accepts custom config', () => {
      const m = new ParallelMonitor({ maxHistory: 10, notifyOnComplete: false });
      expect(m.maxHistory).toBe(10);
      expect(m.notifyOnComplete).toBe(false);
    });

    test('extends EventEmitter', () => {
      expect(typeof monitor.on).toBe('function');
    });
  });

  // ── registerWave ──────────────────────────────────────────────────────

  describe('registerWave', () => {
    test('registers a wave with tasks', () => {
      monitor.registerWave('wave-1', {
        workflowId: 'wf-1',
        index: 0,
        tasks: [
          { id: 't1', description: 'Task 1', agent: '@dev' },
          { id: 't2', description: 'Task 2', agent: '@qa' },
        ],
      });

      expect(monitor.activeWaves.has('wave-1')).toBe(true);
      const wave = monitor.activeWaves.get('wave-1');
      expect(wave.tasks.length).toBe(2);
      expect(wave.status).toBe('running');
    });

    test('emits wave_registered event', () => {
      const events = collectEvents(monitor, ['wave_registered']);
      monitor.registerWave('wave-1', { tasks: [{ id: 't1', description: 'x' }] });
      expect(events.count('wave_registered')).toBe(1);
    });
  });

  // ── registerTaskStart ─────────────────────────────────────────────────

  describe('registerTaskStart', () => {
    test('registers a task as running', () => {
      monitor.registerWave('wave-1', { tasks: [{ id: 't1', description: 'x' }] });
      monitor.registerTaskStart('t1', { waveId: 'wave-1', agent: '@dev', description: 'Test' });

      expect(monitor.activeTasks.has('t1')).toBe(true);
      expect(monitor.activeTasks.get('t1').status).toBe('running');
    });

    test('updates wave task status', () => {
      monitor.registerWave('wave-1', { tasks: [{ id: 't1', description: 'x' }] });
      monitor.registerTaskStart('t1', { waveId: 'wave-1', agent: '@dev' });

      const wave = monitor.activeWaves.get('wave-1');
      expect(wave.tasks[0].status).toBe('running');
    });

    test('emits task_started event', () => {
      const events = collectEvents(monitor, ['task_started']);
      monitor.registerTaskStart('t1', { waveId: 'w1', agent: '@dev' });
      expect(events.count('task_started')).toBe(1);
    });
  });

  // ── addTaskOutput ─────────────────────────────────────────────────────

  describe('addTaskOutput', () => {
    test('adds output to task logs', () => {
      monitor.registerTaskStart('t1', { waveId: 'w1', agent: '@dev' });
      monitor.addTaskOutput('t1', 'line 1');
      monitor.addTaskOutput('t1', 'line 2');

      const logs = monitor.getTaskLogs('t1');
      expect(logs.length).toBe(2);
      expect(logs[0].line).toBe('line 1');
    });

    test('trims logs when exceeding maxLogLines', () => {
      monitor = new ParallelMonitor({ maxLogLines: 3 });
      monitor.registerTaskStart('t1', { waveId: 'w1', agent: '@dev' });

      for (let i = 0; i < 5; i++) {
        monitor.addTaskOutput('t1', `line ${i}`);
      }

      const logs = monitor.getTaskLogs('t1');
      expect(logs.length).toBe(3);
    });

    test('handles unknown taskId gracefully', () => {
      // Should not throw
      monitor.addTaskOutput('nonexistent', 'line');
    });
  });

  // ── registerTaskComplete ──────────────────────────────────────────────

  describe('registerTaskComplete', () => {
    test('marks task as completed', () => {
      monitor.registerWave('w1', { tasks: [{ id: 't1', description: 'x' }] });
      monitor.registerTaskStart('t1', { waveId: 'w1', agent: '@dev' });
      monitor.registerTaskComplete('t1', { success: true, filesModified: ['a.js'] });

      const task = monitor.activeTasks.get('t1');
      expect(task.status).toBe('completed');
      expect(task.filesModified).toEqual(['a.js']);
    });

    test('marks task as failed', () => {
      monitor.registerTaskStart('t1', { waveId: 'w1', agent: '@dev' });
      monitor.registerTaskComplete('t1', { success: false, error: 'boom' });

      const task = monitor.activeTasks.get('t1');
      expect(task.status).toBe('failed');
      expect(task.error).toBe('boom');
    });

    test('adds to history', () => {
      monitor.registerTaskStart('t1', { waveId: 'w1', agent: '@dev' });
      monitor.registerTaskComplete('t1', { success: true });
      expect(monitor.history.length).toBe(1);
    });

    test('trims history to maxHistory', () => {
      monitor = new ParallelMonitor({ maxHistory: 2 });
      for (let i = 0; i < 3; i++) {
        monitor.registerTaskStart(`t${i}`, { waveId: 'w1', agent: '@dev' });
        monitor.registerTaskComplete(`t${i}`, { success: true });
      }
      expect(monitor.history.length).toBe(2);
    });

    test('emits task_failed on failure', () => {
      const events = collectEvents(monitor, ['task_failed']);
      monitor.registerTaskStart('t1', { waveId: 'w1', agent: '@dev' });
      monitor.registerTaskComplete('t1', { success: false, error: 'fail' });
      expect(events.count('task_failed')).toBe(1);
    });

    test('does nothing for unknown task', () => {
      // Should not throw
      monitor.registerTaskComplete('nonexistent', { success: true });
    });
  });

  // ── registerWaveComplete ──────────────────────────────────────────────

  describe('registerWaveComplete', () => {
    test('marks wave as completed', () => {
      monitor.registerWave('w1', { tasks: [{ id: 't1', description: 'x' }] });
      monitor.registerWaveComplete('w1', { success: true, metrics: {} });

      const wave = monitor.activeWaves.get('w1');
      expect(wave.status).toBe('completed');
    });

    test('emits wave_completed when notifyOnComplete is true', () => {
      const events = collectEvents(monitor, ['wave_completed']);
      monitor.registerWave('w1', { tasks: [] });
      monitor.registerWaveComplete('w1', { success: true });
      expect(events.count('wave_completed')).toBe(1);
    });

    test('does nothing for unknown wave', () => {
      monitor.registerWaveComplete('nonexistent', { success: true });
    });
  });

  // ── cancelWave ────────────────────────────────────────────────────────

  describe('cancelWave', () => {
    test('cancels running wave and pending tasks', () => {
      monitor.registerWave('w1', {
        tasks: [
          { id: 't1', description: 'x', agent: '@dev' },
          { id: 't2', description: 'y', agent: '@qa' },
        ],
      });

      monitor.cancelWave('w1');

      const wave = monitor.activeWaves.get('w1');
      expect(wave.status).toBe('cancelled');
      expect(wave.tasks[0].status).toBe('cancelled');
      expect(wave.tasks[1].status).toBe('cancelled');
    });

    test('emits wave_cancelled event', () => {
      const events = collectEvents(monitor, ['wave_cancelled']);
      monitor.registerWave('w1', { tasks: [] });
      monitor.cancelWave('w1');
      expect(events.count('wave_cancelled')).toBe(1);
    });

    test('does nothing for non-running wave', () => {
      monitor.registerWave('w1', { tasks: [] });
      monitor.activeWaves.get('w1').status = 'completed';
      monitor.cancelWave('w1');
      expect(monitor.activeWaves.get('w1').status).toBe('completed');
    });
  });

  // ── getStatus ─────────────────────────────────────────────────────────

  describe('getStatus', () => {
    test('returns status with active waves', () => {
      monitor.registerWave('w1', {
        workflowId: 'wf-1',
        index: 0,
        tasks: [{ id: 't1', description: 'x' }],
      });

      const status = monitor.getStatus();
      expect(status.activeWaves).toBe(1);
      expect(status.waves.length).toBe(1);
      expect(status.waves[0].progress.pending).toBe(1);
    });

    test('returns empty status when no waves', () => {
      const status = monitor.getStatus();
      expect(status.activeWaves).toBe(0);
      expect(status.waves).toEqual([]);
    });
  });

  // ── getTaskLogs ───────────────────────────────────────────────────────

  describe('getTaskLogs', () => {
    test('returns empty for unknown task', () => {
      expect(monitor.getTaskLogs('nonexistent')).toEqual([]);
    });

    test('returns limited logs', () => {
      monitor.registerTaskStart('t1', { waveId: 'w1' });
      for (let i = 0; i < 5; i++) {
        monitor.addTaskOutput('t1', `line ${i}`);
      }
      expect(monitor.getTaskLogs('t1', 3).length).toBe(3);
    });
  });

  // ── formatProgressBar ─────────────────────────────────────────────────

  describe('formatProgressBar', () => {
    test('formats zero total', () => {
      const bar = monitor.formatProgressBar(0, 0, 0, 0);
      expect(bar).toContain('0/0');
    });

    test('formats progress with completed', () => {
      const bar = monitor.formatProgressBar(3, 1, 0, 0);
      expect(bar).toContain('4/4');
    });

    test('shows running tasks', () => {
      const bar = monitor.formatProgressBar(2, 0, 1, 1);
      expect(bar).toContain('2/4');
    });
  });

  // ── formatStatus ──────────────────────────────────────────────────────

  describe('formatStatus', () => {
    test('shows no active executions message', () => {
      const status = monitor.formatStatus();
      expect(status).toContain('No active executions');
    });

    test('shows wave details when active', () => {
      monitor.registerWave('w1', {
        workflowId: 'wf-1',
        index: 1,
        tasks: [{ id: 't1', description: 'x', agent: '@dev' }],
      });

      const status = monitor.formatStatus();
      expect(status).toContain('Wave 1');
    });
  });

  // ── clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    test('clears all data', () => {
      monitor.registerWave('w1', { tasks: [{ id: 't1', description: 'x' }] });
      monitor.registerTaskStart('t1', { waveId: 'w1' });
      monitor.history.push({ id: 1 });

      monitor.clear();

      expect(monitor.activeWaves.size).toBe(0);
      expect(monitor.activeTasks.size).toBe(0);
      expect(monitor.taskLogs.size).toBe(0);
      expect(monitor.history.length).toBe(0);
    });
  });

  // ── getMonitor singleton ──────────────────────────────────────────────

  describe('getMonitor', () => {
    test('returns singleton instance', () => {
      const m1 = getMonitor();
      const m2 = getMonitor();
      expect(m1).toBe(m2);
      expect(m1).toBeInstanceOf(ParallelMonitor);
    });
  });

  // ── History ───────────────────────────────────────────────────────────

  describe('getHistory', () => {
    test('returns limited history', () => {
      monitor.history = [{ id: 1 }, { id: 2 }, { id: 3 }];
      expect(monitor.getHistory(2).length).toBe(2);
    });
  });

  // ── broadcast ─────────────────────────────────────────────────────────

  describe('broadcast', () => {
    test('sends message to registered connections', () => {
      const sent = [];
      const mockWs = {
        send: (msg) => sent.push(msg),
        on: jest.fn(),
      };

      monitor.registerConnection(mockWs);
      // registerConnection sends status message
      expect(sent.length).toBe(1);

      monitor.broadcast('test', { data: 1 });
      expect(sent.length).toBe(2);
    });

    test('removes broken connections', () => {
      let callCount = 0;
      const mockWs = {
        send: () => {
          callCount++;
          // First call is from registerConnection (initial status), let it pass
          if (callCount > 1) throw new Error('closed');
        },
        on: jest.fn(),
      };

      monitor.registerConnection(mockWs);
      expect(monitor.wsConnections.size).toBe(1);
      monitor.broadcast('test', {});
      expect(monitor.wsConnections.size).toBe(0);
    });
  });
});
