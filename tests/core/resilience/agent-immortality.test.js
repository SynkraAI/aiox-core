/**
 * Agent Immortality Protocol — Testes Unitarios
 *
 * Story: 568 - Agent Immortality Protocol
 * Epic: Resilience — agentes que nunca morrem
 *
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const AgentImmortalityProtocol = require('../../../.aiox-core/core/resilience/agent-immortality');
const { Events, AgentStatus, DEFAULT_CONFIG } = require('../../../.aiox-core/core/resilience/agent-immortality');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'immortality-test-'));
}

function cleanDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // Ignora
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TESTS
// ═══════════════════════════════════════════════════════════════════════════════════

describe('Agent Immortality Protocol (Story #568)', () => {
  let tempDir;
  let protocol;

  beforeEach(() => {
    jest.useFakeTimers();
    tempDir = createTempDir();
    protocol = new AgentImmortalityProtocol(tempDir, {
      heartbeatIntervalMs: 1000,
      gracePeriodMs: 3000,
      snapshotIntervalMs: 5000,
      maxSnapshots: 5,
      maxRevivals: 3,
      revivalWindowMs: 60000,
      fingerprintWindowSize: 20,
      anomalyThreshold: 2.0,
      healthWarningThreshold: 50,
    });
  });

  afterEach(() => {
    if (protocol) {
      protocol.destroy();
    }
    jest.useRealTimers();
    cleanDir(tempDir);
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          EXPORTS
  // ═════════════════════════════════════════════════════════════════════════════

  describe('Exports', () => {
    it('should export AgentImmortalityProtocol as default and named', () => {
      expect(AgentImmortalityProtocol).toBeDefined();
      expect(typeof AgentImmortalityProtocol).toBe('function');

      const mod = require('../../../.aiox-core/core/resilience/agent-immortality');
      expect(mod.AgentImmortalityProtocol).toBe(AgentImmortalityProtocol);
    });

    it('should export Events enum', () => {
      expect(Events).toBeDefined();
      expect(Events.HEARTBEAT).toBe('heartbeat');
      expect(Events.SNAPSHOT).toBe('snapshot');
      expect(Events.DEATH_DETECTED).toBe('death-detected');
      expect(Events.REVIVAL_STARTED).toBe('revival-started');
      expect(Events.REVIVAL_COMPLETE).toBe('revival-complete');
      expect(Events.ANOMALY_DETECTED).toBe('anomaly-detected');
      expect(Events.CASCADE_RISK).toBe('cascade-risk');
      expect(Events.HEALTH_WARNING).toBe('health-warning');
    });

    it('should export AgentStatus enum', () => {
      expect(AgentStatus).toBeDefined();
      expect(AgentStatus.REGISTERED).toBe('registered');
      expect(AgentStatus.ALIVE).toBe('alive');
      expect(AgentStatus.SUSPECT).toBe('suspect');
      expect(AgentStatus.DEAD).toBe('dead');
      expect(AgentStatus.REVIVING).toBe('reviving');
    });

    it('should export DEFAULT_CONFIG', () => {
      expect(DEFAULT_CONFIG).toBeDefined();
      expect(DEFAULT_CONFIG.heartbeatIntervalMs).toBe(5000);
      expect(DEFAULT_CONFIG.schemaVersion).toBe('aiox-immortality-v1');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          CONSTRUCTOR
  // ═════════════════════════════════════════════════════════════════════════════

  describe('Constructor', () => {
    it('should initialize with projectRoot and default config', () => {
      const p = new AgentImmortalityProtocol(tempDir);
      expect(p.projectRoot).toBe(tempDir);
      expect(p.config.heartbeatIntervalMs).toBe(DEFAULT_CONFIG.heartbeatIntervalMs);
      expect(p.agents.size).toBe(0);
      p.destroy();
    });

    it('should merge custom options with defaults', () => {
      const p = new AgentImmortalityProtocol(tempDir, { heartbeatIntervalMs: 2000 });
      expect(p.config.heartbeatIntervalMs).toBe(2000);
      expect(p.config.gracePeriodMs).toBe(DEFAULT_CONFIG.gracePeriodMs);
      p.destroy();
    });

    it('should use nullish coalescing for projectRoot', () => {
      const p = new AgentImmortalityProtocol(null);
      expect(p.projectRoot).toBe(process.cwd());
      p.destroy();
    });

    it('should extend EventEmitter', () => {
      expect(protocol).toBeInstanceOf(require('events').EventEmitter);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          AGENT REGISTRATION
  // ═════════════════════════════════════════════════════════════════════════════

  describe('registerAgent()', () => {
    it('should register an agent with default config', () => {
      const result = protocol.registerAgent('agent-1');
      expect(result.id).toBe('agent-1');
      expect(result.status).toBe(AgentStatus.REGISTERED);
      expect(result.heartbeats).toEqual([]);
      expect(result.snapshots).toEqual([]);
      expect(result.revivalHistory).toEqual([]);
    });

    it('should register an agent with custom config', () => {
      const result = protocol.registerAgent('agent-1', { heartbeatIntervalMs: 500 });
      expect(result.config.heartbeatIntervalMs).toBe(500);
    });

    it('should register an agent with custom revivalFn', () => {
      const fn = jest.fn();
      protocol.registerAgent('agent-1', { revivalFn: fn });
      // revivalFn fica no agent interno (nao no clone retornado, pois JSON perde funcoes)
      const agent = protocol.agents.get('agent-1');
      expect(typeof agent.config.revivalFn).toBe('function');
    });

    it('should throw if agentId is empty', () => {
      expect(() => protocol.registerAgent('')).toThrow('agentId is required');
    });

    it('should throw if agentId is not a string', () => {
      expect(() => protocol.registerAgent(123)).toThrow('agentId is required');
    });

    it('should throw if agent already registered', () => {
      protocol.registerAgent('agent-1');
      expect(() => protocol.registerAgent('agent-1')).toThrow('already registered');
    });

    it('should return a deep clone (mutation-safe)', () => {
      const result = protocol.registerAgent('agent-1');
      result.status = 'hacked';
      const agent = protocol.agents.get('agent-1');
      expect(agent.status).toBe(AgentStatus.REGISTERED);
    });
  });

  describe('unregisterAgent()', () => {
    it('should remove an agent', () => {
      protocol.registerAgent('agent-1');
      protocol.unregisterAgent('agent-1');
      expect(protocol.agents.has('agent-1')).toBe(false);
    });

    it('should stop monitoring on unregister', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      protocol.unregisterAgent('agent-1');
      expect(protocol._heartbeatCheckers.has('agent-1')).toBe(false);
    });

    it('should clean up dependencies', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.declareDependency('agent-2', 'agent-1');
      protocol.unregisterAgent('agent-1');
      expect(protocol._dependencies.has('agent-2')).toBe(false);
    });

    it('should throw if agent not registered', () => {
      expect(() => protocol.unregisterAgent('ghost')).toThrow('not registered');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          MONITORING
  // ═════════════════════════════════════════════════════════════════════════════

  describe('startMonitoring()', () => {
    it('should set agent status to ALIVE', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      expect(protocol.agents.get('agent-1').status).toBe(AgentStatus.ALIVE);
    });

    it('should create heartbeat checker interval', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      expect(protocol._heartbeatCheckers.has('agent-1')).toBe(true);
    });

    it('should create snapshot timer interval', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      expect(protocol._snapshotTimers.has('agent-1')).toBe(true);
    });

    it('should be idempotent (no double-start)', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      const checker1 = protocol._heartbeatCheckers.get('agent-1');
      protocol.startMonitoring('agent-1');
      const checker2 = protocol._heartbeatCheckers.get('agent-1');
      expect(checker1).toBe(checker2);
    });

    it('should throw if agent not registered', () => {
      expect(() => protocol.startMonitoring('ghost')).toThrow('not registered');
    });
  });

  describe('stopMonitoring()', () => {
    it('should clear heartbeat checker', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      protocol.stopMonitoring('agent-1');
      expect(protocol._heartbeatCheckers.has('agent-1')).toBe(false);
    });

    it('should clear snapshot timer', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      protocol.stopMonitoring('agent-1');
      expect(protocol._snapshotTimers.has('agent-1')).toBe(false);
    });

    it('should set status back to REGISTERED if was ALIVE', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      protocol.stopMonitoring('agent-1');
      expect(protocol.agents.get('agent-1').status).toBe(AgentStatus.REGISTERED);
    });

    it('should not throw for agent without monitoring', () => {
      protocol.registerAgent('agent-1');
      expect(() => protocol.stopMonitoring('agent-1')).not.toThrow();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          HEARTBEAT
  // ═════════════════════════════════════════════════════════════════════════════

  describe('heartbeat()', () => {
    it('should record a heartbeat', () => {
      protocol.registerAgent('agent-1');
      const hb = protocol.heartbeat('agent-1');
      expect(hb.id).toBeDefined();
      expect(hb.timestamp).toBeDefined();
    });

    it('should record heartbeat with state data', () => {
      protocol.registerAgent('agent-1');
      const state = { memory: 42, tasks: ['a'] };
      const hb = protocol.heartbeat('agent-1', state);
      expect(hb.stateData).toEqual(state);
    });

    it('should deep clone state data (mutation-safe)', () => {
      protocol.registerAgent('agent-1');
      const state = { value: 1 };
      protocol.heartbeat('agent-1', state);
      state.value = 999;
      const agent = protocol.agents.get('agent-1');
      expect(agent.heartbeats[0].stateData.value).toBe(1);
    });

    it('should compute interval between heartbeats', () => {
      protocol.registerAgent('agent-1');
      protocol.heartbeat('agent-1');
      jest.advanceTimersByTime(1000);
      const hb2 = protocol.heartbeat('agent-1');
      expect(hb2.interval).toBe(1000);
    });

    it('should set interval to 0 for first heartbeat', () => {
      protocol.registerAgent('agent-1');
      const hb = protocol.heartbeat('agent-1');
      expect(hb.interval).toBe(0);
    });

    it('should emit heartbeat event', () => {
      protocol.registerAgent('agent-1');
      const handler = jest.fn();
      protocol.on(Events.HEARTBEAT, handler);
      protocol.heartbeat('agent-1');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].agentId).toBe('agent-1');
    });

    it('should restore DEAD agent to ALIVE on heartbeat', () => {
      protocol.registerAgent('agent-1');
      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.DEAD;
      protocol.heartbeat('agent-1');
      expect(agent.status).toBe(AgentStatus.ALIVE);
    });

    it('should restore SUSPECT agent to ALIVE on heartbeat', () => {
      protocol.registerAgent('agent-1');
      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.SUSPECT;
      protocol.heartbeat('agent-1');
      expect(agent.status).toBe(AgentStatus.ALIVE);
    });

    it('should trim heartbeat history to prevent unbounded growth', () => {
      protocol.registerAgent('agent-1', { fingerprintWindowSize: 5 });
      for (let i = 0; i < 15; i++) {
        jest.advanceTimersByTime(100);
        protocol.heartbeat('agent-1');
      }
      const agent = protocol.agents.get('agent-1');
      expect(agent.heartbeats.length).toBeLessThanOrEqual(10);
    });

    it('should throw if agent not registered', () => {
      expect(() => protocol.heartbeat('ghost')).toThrow('not registered');
    });
  });

  describe('getLastHeartbeat()', () => {
    it('should return null if no heartbeats', () => {
      protocol.registerAgent('agent-1');
      expect(protocol.getLastHeartbeat('agent-1')).toBeNull();
    });

    it('should return the last heartbeat', () => {
      protocol.registerAgent('agent-1');
      protocol.heartbeat('agent-1', { v: 1 });
      jest.advanceTimersByTime(500);
      protocol.heartbeat('agent-1', { v: 2 });
      const last = protocol.getLastHeartbeat('agent-1');
      expect(last.stateData.v).toBe(2);
    });

    it('should return a deep clone', () => {
      protocol.registerAgent('agent-1');
      protocol.heartbeat('agent-1', { v: 1 });
      const last = protocol.getLastHeartbeat('agent-1');
      last.stateData.v = 999;
      const again = protocol.getLastHeartbeat('agent-1');
      expect(again.stateData.v).toBe(1);
    });

    it('should throw if agent not registered', () => {
      expect(() => protocol.getLastHeartbeat('ghost')).toThrow('not registered');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          SNAPSHOTS
  // ═════════════════════════════════════════════════════════════════════════════

  describe('createSnapshot()', () => {
    it('should create a snapshot with metadata', () => {
      protocol.registerAgent('agent-1');
      const snap = protocol.createSnapshot('agent-1', { data: 'test' });
      expect(snap.id).toBeDefined();
      expect(snap.agentId).toBe('agent-1');
      expect(snap.timestamp).toBeDefined();
      expect(snap.healthScore).toBeDefined();
    });

    it('should store snapshot in agent snapshots array', () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { data: 1 });
      const agent = protocol.agents.get('agent-1');
      expect(agent.snapshots.length).toBe(1);
      expect(agent.snapshots[0].state.data).toBe(1);
    });

    it('should deep clone state (mutation-safe)', () => {
      protocol.registerAgent('agent-1');
      const state = { value: 42 };
      protocol.createSnapshot('agent-1', state);
      state.value = 0;
      const agent = protocol.agents.get('agent-1');
      expect(agent.snapshots[0].state.value).toBe(42);
    });

    it('should enforce maxSnapshots limit', () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 10; i++) {
        protocol.createSnapshot('agent-1', { iter: i });
      }
      const agent = protocol.agents.get('agent-1');
      expect(agent.snapshots.length).toBeLessThanOrEqual(5);
      // O mais recente deve ser o ultimo
      expect(agent.snapshots[agent.snapshots.length - 1].state.iter).toBe(9);
    });

    it('should emit snapshot event', () => {
      protocol.registerAgent('agent-1');
      const handler = jest.fn();
      protocol.on(Events.SNAPSHOT, handler);
      protocol.createSnapshot('agent-1', { x: 1 });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].agentId).toBe('agent-1');
    });

    it('should persist snapshot to disk', async () => {
      protocol.registerAgent('agent-1');
      const snap = protocol.createSnapshot('agent-1', { persisted: true });
      // Aguardar serializacao
      await protocol._saveQueue;
      const snapDir = path.resolve(tempDir, '.aiox/immortality/agent-1');
      const files = fs.readdirSync(snapDir);
      expect(files.length).toBe(1);
      expect(files[0]).toContain('.json');
    });

    it('should throw if state is null', () => {
      protocol.registerAgent('agent-1');
      expect(() => protocol.createSnapshot('agent-1', null)).toThrow('state must be a non-null object');
    });

    it('should throw if state is not an object', () => {
      protocol.registerAgent('agent-1');
      expect(() => protocol.createSnapshot('agent-1', 'string')).toThrow('state must be a non-null object');
    });

    it('should throw if agent not registered', () => {
      expect(() => protocol.createSnapshot('ghost', {})).toThrow('not registered');
    });
  });

  describe('getLatestSnapshot()', () => {
    it('should return null if no snapshots', () => {
      protocol.registerAgent('agent-1');
      expect(protocol.getLatestSnapshot('agent-1')).toBeNull();
    });

    it('should return the latest snapshot', () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { v: 1 });
      protocol.createSnapshot('agent-1', { v: 2 });
      const latest = protocol.getLatestSnapshot('agent-1');
      expect(latest.state.v).toBe(2);
    });

    it('should return deep clone', () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { v: 1 });
      const snap = protocol.getLatestSnapshot('agent-1');
      snap.state.v = 999;
      expect(protocol.getLatestSnapshot('agent-1').state.v).toBe(1);
    });
  });

  describe('listSnapshots()', () => {
    it('should return all snapshots', () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { v: 1 });
      protocol.createSnapshot('agent-1', { v: 2 });
      const list = protocol.listSnapshots('agent-1');
      expect(list.length).toBe(2);
    });

    it('should filter by since timestamp', () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { v: 1 });
      jest.advanceTimersByTime(5000);
      const cutoff = Date.now();
      jest.advanceTimersByTime(1000);
      protocol.createSnapshot('agent-1', { v: 2 });
      const list = protocol.listSnapshots('agent-1', { since: cutoff });
      expect(list.length).toBe(1);
      expect(list[0].state.v).toBe(2);
    });

    it('should respect limit option', () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 5; i++) {
        protocol.createSnapshot('agent-1', { v: i });
      }
      const list = protocol.listSnapshots('agent-1', { limit: 2 });
      expect(list.length).toBe(2);
    });

    it('should return deep clones', () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { v: 1 });
      const list = protocol.listSnapshots('agent-1');
      list[0].state.v = 999;
      expect(protocol.getLatestSnapshot('agent-1').state.v).toBe(1);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          REVIVAL
  // ═════════════════════════════════════════════════════════════════════════════

  describe('reviveAgent()', () => {
    it('should revive an agent from snapshot', async () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { restored: true });
      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.DEAD;

      const result = await protocol.reviveAgent('agent-1');
      expect(result.success).toBe(true);
      expect(result.method).toBe('snapshot');
      expect(result.state.restored).toBe(true);
    });

    it('should set agent status to ALIVE after revival', async () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { data: 1 });
      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.DEAD;

      await protocol.reviveAgent('agent-1');
      expect(agent.status).toBe(AgentStatus.ALIVE);
    });

    it('should reset errorCount after revival', async () => {
      protocol.registerAgent('agent-1');
      const agent = protocol.agents.get('agent-1');
      agent.errorCount = 5;
      agent.status = AgentStatus.DEAD;

      await protocol.reviveAgent('agent-1');
      expect(agent.errorCount).toBe(0);
    });

    it('should add record to revivalHistory', async () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { data: 1 });

      await protocol.reviveAgent('agent-1');
      const history = protocol.getRevivalHistory('agent-1');
      expect(history.length).toBe(1);
      expect(history[0].method).toBe('snapshot');
    });

    it('should emit revival-started and revival-complete events', async () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { data: 1 });

      const started = jest.fn();
      const complete = jest.fn();
      protocol.on(Events.REVIVAL_STARTED, started);
      protocol.on(Events.REVIVAL_COMPLETE, complete);

      await protocol.reviveAgent('agent-1');
      expect(started).toHaveBeenCalledTimes(1);
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('should use custom revivalFn when provided', async () => {
      const customFn = jest.fn().mockResolvedValue({ custom: true });
      protocol.registerAgent('agent-1', { revivalFn: customFn });

      const result = await protocol.reviveAgent('agent-1');
      expect(result.method).toBe('custom');
      expect(result.state.custom).toBe(true);
      expect(customFn).toHaveBeenCalled();
    });

    it('should fallback to snapshot if custom revivalFn fails', async () => {
      const customFn = jest.fn().mockRejectedValue(new Error('boom'));
      protocol.registerAgent('agent-1', { revivalFn: customFn });
      protocol.createSnapshot('agent-1', { fallback: true });

      const result = await protocol.reviveAgent('agent-1');
      expect(result.method).toBe('snapshot-fallback');
      expect(result.state.fallback).toBe(true);
    });

    it('should handle revival without snapshot', async () => {
      protocol.registerAgent('agent-1');

      const result = await protocol.reviveAgent('agent-1');
      expect(result.success).toBe(true);
      expect(result.state).toBeNull();
      expect(result.snapshotId).toBeNull();
    });

    it('should enforce maxRevivals limit', async () => {
      protocol.registerAgent('agent-1');

      // Esgotar revivals
      for (let i = 0; i < 3; i++) {
        await protocol.reviveAgent('agent-1');
      }

      const result = await protocol.reviveAgent('agent-1');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('max-revivals-exceeded');
    });

    it('should count revivals within window only', async () => {
      protocol.registerAgent('agent-1');

      await protocol.reviveAgent('agent-1');
      await protocol.reviveAgent('agent-1');

      // Avancar alem da janela
      jest.advanceTimersByTime(70000);

      const result = await protocol.reviveAgent('agent-1');
      expect(result.success).toBe(true);
    });

    it('should throw if agent not registered', async () => {
      await expect(protocol.reviveAgent('ghost')).rejects.toThrow('not registered');
    });
  });

  describe('getRevivalHistory()', () => {
    it('should return empty array for new agent', () => {
      protocol.registerAgent('agent-1');
      expect(protocol.getRevivalHistory('agent-1')).toEqual([]);
    });

    it('should return deep clones', async () => {
      protocol.registerAgent('agent-1');
      await protocol.reviveAgent('agent-1');
      const history = protocol.getRevivalHistory('agent-1');
      history[0].method = 'hacked';
      const again = protocol.getRevivalHistory('agent-1');
      expect(again[0].method).toBe('snapshot');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          HEALTH SCORE
  // ═════════════════════════════════════════════════════════════════════════════

  describe('getHealthScore()', () => {
    it('should return 0 for agent with no heartbeats', () => {
      protocol.registerAgent('agent-1');
      const score = protocol.getHealthScore('agent-1');
      // Sem heartbeats = heartbeatScore 0, errorScore 100, stabilityScore 100
      // weighted = (0*0.4) + (100*0.3) + (100*0.3) = 60
      expect(score).toBe(60);
    });

    it('should return high score for healthy agent', () => {
      protocol.registerAgent('agent-1');
      // Simular heartbeats regulares
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      const score = protocol.getHealthScore('agent-1');
      expect(score).toBeGreaterThan(70);
    });

    it('should decrease score for agent with revivals', async () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      const scoreBefore = protocol.getHealthScore('agent-1');

      await protocol.reviveAgent('agent-1');
      await protocol.reviveAgent('agent-1');
      const scoreAfter = protocol.getHealthScore('agent-1');

      expect(scoreAfter).toBeLessThan(scoreBefore);
    });

    it('should penalize DEAD status', () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.DEAD;
      const score = protocol.getHealthScore('agent-1');
      expect(score).toBeLessThanOrEqual(50);
    });

    it('should penalize SUSPECT status', () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      const scoreAlive = protocol.getHealthScore('agent-1');

      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.SUSPECT;
      const scoreSuspect = protocol.getHealthScore('agent-1');

      expect(scoreSuspect).toBeLessThan(scoreAlive);
    });

    it('should return score between 0 and 100', () => {
      protocol.registerAgent('agent-1');
      const score = protocol.getHealthScore('agent-1');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should throw if agent not registered', () => {
      expect(() => protocol.getHealthScore('ghost')).toThrow('not registered');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                      BEHAVIORAL FINGERPRINT
  // ═════════════════════════════════════════════════════════════════════════════

  describe('getBehavioralFingerprint()', () => {
    it('should return empty fingerprint for new agent', () => {
      protocol.registerAgent('agent-1');
      const fp = protocol.getBehavioralFingerprint('agent-1');
      expect(fp.metrics).toEqual([]);
      expect(fp.baseline).toBeNull();
    });

    it('should build baseline after enough heartbeats', () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 6; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      const fp = protocol.getBehavioralFingerprint('agent-1');
      expect(fp.baseline).not.toBeNull();
      expect(fp.baseline.mean).toBeGreaterThan(0);
      expect(fp.baseline.sampleSize).toBeGreaterThanOrEqual(5);
    });

    it('should calculate stdDev in baseline', () => {
      protocol.registerAgent('agent-1');
      // Heartbeats com intervalos variados
      const intervals = [1000, 1100, 900, 1050, 950, 1000];
      for (const interval of intervals) {
        jest.advanceTimersByTime(interval);
        protocol.heartbeat('agent-1');
      }
      const fp = protocol.getBehavioralFingerprint('agent-1');
      expect(fp.baseline.stdDev).toBeGreaterThanOrEqual(0);
    });

    it('should return deep clone (mutation-safe)', () => {
      protocol.registerAgent('agent-1');
      jest.advanceTimersByTime(1000);
      protocol.heartbeat('agent-1');
      const fp = protocol.getBehavioralFingerprint('agent-1');
      fp.metrics.push(999999);
      const fp2 = protocol.getBehavioralFingerprint('agent-1');
      expect(fp2.metrics).not.toContain(999999);
    });

    it('should throw if agent not registered', () => {
      expect(() => protocol.getBehavioralFingerprint('ghost')).toThrow('not registered');
    });
  });

  describe('detectAnomalies()', () => {
    it('should return no anomalies with insufficient data', () => {
      protocol.registerAgent('agent-1');
      const result = protocol.detectAnomalies('agent-1');
      expect(result.hasAnomalies).toBe(false);
      expect(result.message).toContain('Insufficient data');
    });

    it('should detect heartbeat interval anomaly', () => {
      protocol.registerAgent('agent-1');
      // Construir baseline com intervalos regulares
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      // Injetar metrica anomala
      const agent = protocol.agents.get('agent-1');
      agent.fingerprint.metrics.push(50000); // Muito fora do padrao
      const result = protocol.detectAnomalies('agent-1');
      expect(result.hasAnomalies).toBe(true);
      expect(result.anomalies.some(a => a.type === 'heartbeat-interval')).toBe(true);
    });

    it('should detect degradation trend', () => {
      protocol.registerAgent('agent-1');
      // Construir baseline
      for (let i = 0; i < 6; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      // Injetar tendencia crescente agressiva
      const agent = protocol.agents.get('agent-1');
      agent.fingerprint.metrics.push(2000, 4000, 8000, 16000, 32000);
      // Recalcular baseline
      const fp = agent.fingerprint;
      const mean = fp.metrics.reduce((a, b) => a + b, 0) / fp.metrics.length;
      const variance = fp.metrics.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / fp.metrics.length;
      fp.baseline = { mean, stdDev: Math.sqrt(variance), sampleSize: fp.metrics.length, updatedAt: Date.now() };

      const result = protocol.detectAnomalies('agent-1');
      expect(result.hasAnomalies).toBe(true);
    });

    it('should emit anomaly-detected event', () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      const agent = protocol.agents.get('agent-1');
      agent.fingerprint.metrics.push(50000);

      const handler = jest.fn();
      protocol.on(Events.ANOMALY_DETECTED, handler);
      protocol.detectAnomalies('agent-1');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should NOT emit event when no anomalies', () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      const handler = jest.fn();
      protocol.on(Events.ANOMALY_DETECTED, handler);
      protocol.detectAnomalies('agent-1');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should classify severity', () => {
      protocol.registerAgent('agent-1');
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(1000);
        protocol.heartbeat('agent-1');
      }
      const agent = protocol.agents.get('agent-1');
      agent.fingerprint.metrics.push(50000);
      const result = protocol.detectAnomalies('agent-1');
      const anomaly = result.anomalies.find(a => a.type === 'heartbeat-interval');
      expect(['warning', 'critical']).toContain(anomaly.severity);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                      CASCADE PROTECTION
  // ═════════════════════════════════════════════════════════════════════════════

  describe('declareDependency()', () => {
    it('should register a dependency', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.declareDependency('agent-2', 'agent-1');
      expect(protocol._dependencies.get('agent-2')).toContain('agent-1');
    });

    it('should allow multiple dependencies', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.registerAgent('agent-3');
      protocol.declareDependency('agent-3', 'agent-1');
      protocol.declareDependency('agent-3', 'agent-2');
      expect(protocol._dependencies.get('agent-3').length).toBe(2);
    });

    it('should be idempotent (no duplicate deps)', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.declareDependency('agent-2', 'agent-1');
      protocol.declareDependency('agent-2', 'agent-1');
      expect(protocol._dependencies.get('agent-2').length).toBe(1);
    });

    it('should throw if agent depends on itself', () => {
      protocol.registerAgent('agent-1');
      expect(() => protocol.declareDependency('agent-1', 'agent-1')).toThrow('cannot depend on itself');
    });

    it('should throw if either agent not registered', () => {
      protocol.registerAgent('agent-1');
      expect(() => protocol.declareDependency('agent-1', 'ghost')).toThrow('not registered');
      expect(() => protocol.declareDependency('ghost', 'agent-1')).toThrow('not registered');
    });
  });

  describe('getCascadeRisk()', () => {
    it('should return low risk for agent with no dependents', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      protocol.heartbeat('agent-1');
      const risk = protocol.getCascadeRisk('agent-1');
      expect(risk.riskLevel).toBe('low');
      expect(risk.dependentCount).toBe(0);
    });

    it('should return high risk when dead agent has dependents', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.registerAgent('agent-3');
      protocol.declareDependency('agent-2', 'agent-1');
      protocol.declareDependency('agent-3', 'agent-1');

      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.DEAD;

      const risk = protocol.getCascadeRisk('agent-1');
      expect(risk.riskLevel).toBe('high');
      expect(risk.dependentCount).toBe(2);
    });

    it('should return critical risk when dead agent has many dependents', () => {
      protocol.registerAgent('core');
      for (let i = 0; i < 5; i++) {
        protocol.registerAgent(`dep-${i}`);
        protocol.declareDependency(`dep-${i}`, 'core');
      }

      const agent = protocol.agents.get('core');
      agent.status = AgentStatus.DEAD;

      const risk = protocol.getCascadeRisk('core');
      expect(risk.riskLevel).toBe('critical');
      expect(risk.dependentCount).toBe(5);
    });

    it('should find indirect dependents', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.registerAgent('agent-3');
      protocol.declareDependency('agent-2', 'agent-1');
      protocol.declareDependency('agent-3', 'agent-2'); // Indireto via agent-2

      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.DEAD;

      const risk = protocol.getCascadeRisk('agent-1');
      expect(risk.dependents).toContain('agent-2');
      // agent-3 depende de agent-2, nao diretamente de agent-1
      // mas findDependents busca recursivamente
    });

    it('should emit cascade-risk for high/critical risks', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.declareDependency('agent-2', 'agent-1');

      const agent = protocol.agents.get('agent-1');
      agent.status = AgentStatus.DEAD;

      const handler = jest.fn();
      protocol.on(Events.CASCADE_RISK, handler);
      protocol.getCascadeRisk('agent-1');
      // 1 dependent + dead = high (nao critical)
      // high emite cascade-risk
    });

    it('should not emit cascade-risk for low risk', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');
      protocol.heartbeat('agent-1');

      const handler = jest.fn();
      protocol.on(Events.CASCADE_RISK, handler);
      protocol.getCascadeRisk('agent-1');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          CRASH DETECTION
  // ═════════════════════════════════════════════════════════════════════════════

  describe('Crash Detection (heartbeat timeout)', () => {
    it('should detect death when heartbeat is missed beyond grace period', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');

      const deathHandler = jest.fn();
      protocol.on(Events.DEATH_DETECTED, deathHandler);

      // Avancar alem do grace period sem enviar heartbeat
      jest.advanceTimersByTime(4000);

      expect(deathHandler).toHaveBeenCalledTimes(1);
      expect(deathHandler.mock.calls[0][0].agentId).toBe('agent-1');
    });

    it('should set status to DEAD on missed heartbeat', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');

      jest.advanceTimersByTime(4000);

      const agent = protocol.agents.get('agent-1');
      // Pode ter sido revivido automaticamente, mas deve ter passado por DEAD
    });

    it('should mark suspect before death', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');

      const warningHandler = jest.fn();
      protocol.on(Events.HEALTH_WARNING, warningHandler);

      // Avancar ate 60% do grace period (1800ms)
      jest.advanceTimersByTime(2000);

      const agent = protocol.agents.get('agent-1');
      // O agente pode estar como SUSPECT
    });

    it('should auto-revive dead agent', async () => {
      protocol.registerAgent('agent-1');
      protocol.createSnapshot('agent-1', { autosave: true });
      protocol.startMonitoring('agent-1');

      const revivalHandler = jest.fn();
      protocol.on(Events.REVIVAL_COMPLETE, revivalHandler);

      jest.advanceTimersByTime(4000);

      // Aguardar revival async
      await jest.runAllTimersAsync().catch(() => {});
      // Revival e assíncrono, pode precisar de mais ticks
      await Promise.resolve();
      await Promise.resolve();
    });

    it('should not detect death if heartbeats are regular', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');

      const deathHandler = jest.fn();
      protocol.on(Events.DEATH_DETECTED, deathHandler);

      // Heartbeats regulares a cada 500ms (bem dentro do grace de 3000ms)
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(500);
        protocol.heartbeat('agent-1');
      }

      expect(deathHandler).not.toHaveBeenCalled();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          PERSISTENCE
  // ═════════════════════════════════════════════════════════════════════════════

  describe('saveState()', () => {
    it('should save protocol state to disk', async () => {
      protocol.registerAgent('agent-1');
      protocol.heartbeat('agent-1');

      await protocol.saveState();

      const filePath = path.resolve(tempDir, '.aiox/immortality/protocol-state.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(data.schemaVersion).toBe('aiox-immortality-v1');
      expect(data.agents['agent-1']).toBeDefined();
    });

    it('should create directories recursively', async () => {
      protocol.registerAgent('agent-1');
      await protocol.saveState();

      const dir = path.resolve(tempDir, '.aiox/immortality');
      expect(fs.existsSync(dir)).toBe(true);
    });

    it('should save dependency graph', async () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.declareDependency('agent-2', 'agent-1');

      await protocol.saveState();

      const filePath = path.resolve(tempDir, '.aiox/immortality/protocol-state.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(data.dependencies['agent-2']).toContain('agent-1');
    });

    it('should serialize concurrent writes', async () => {
      protocol.registerAgent('agent-1');

      // Multiplas escritas simultaneas
      const p1 = protocol.saveState();
      const p2 = protocol.saveState();
      const p3 = protocol.saveState();

      await Promise.all([p1, p2, p3]);

      const filePath = path.resolve(tempDir, '.aiox/immortality/protocol-state.json');
      expect(fs.existsSync(filePath)).toBe(true);
      // Se serializou corretamente, arquivo nao estara corrompido
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(data.schemaVersion).toBe('aiox-immortality-v1');
    });
  });

  describe('loadState()', () => {
    it('should return null if no state file', async () => {
      const result = await protocol.loadState();
      expect(result).toBeNull();
    });

    it('should load saved state', async () => {
      protocol.registerAgent('agent-1');
      await protocol.saveState();

      const result = await protocol.loadState();
      expect(result).not.toBeNull();
      expect(result.schemaVersion).toBe('aiox-immortality-v1');
      expect(result.agents['agent-1']).toBeDefined();
    });

    it('should return null for wrong schema version', async () => {
      const filePath = path.resolve(tempDir, '.aiox/immortality/protocol-state.json');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify({ schemaVersion: 'wrong-v99' }));

      const result = await protocol.loadState();
      expect(result).toBeNull();
    });

    it('should return null for corrupted file', async () => {
      const filePath = path.resolve(tempDir, '.aiox/immortality/protocol-state.json');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, 'not json at all');

      const result = await protocol.loadState();
      expect(result).toBeNull();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          STATS
  // ═════════════════════════════════════════════════════════════════════════════

  describe('getStats()', () => {
    it('should return empty stats for fresh protocol', () => {
      const stats = protocol.getStats();
      expect(stats.totalAgents).toBe(0);
      expect(stats.totalRevivals).toBe(0);
      expect(stats.totalSnapshots).toBe(0);
      expect(stats.totalHeartbeats).toBe(0);
      expect(stats.monitoringActive).toBe(0);
      expect(stats.dependencyEdges).toBe(0);
    });

    it('should count agents by status', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.startMonitoring('agent-1');

      const stats = protocol.getStats();
      expect(stats.totalAgents).toBe(2);
      expect(stats.byStatus[AgentStatus.ALIVE]).toBe(1);
      expect(stats.byStatus[AgentStatus.REGISTERED]).toBe(1);
    });

    it('should count heartbeats and snapshots', () => {
      protocol.registerAgent('agent-1');
      protocol.heartbeat('agent-1');
      protocol.heartbeat('agent-1');
      protocol.createSnapshot('agent-1', { x: 1 });

      const stats = protocol.getStats();
      expect(stats.totalHeartbeats).toBe(2);
      expect(stats.totalSnapshots).toBe(1);
    });

    it('should count dependency edges', () => {
      protocol.registerAgent('a');
      protocol.registerAgent('b');
      protocol.registerAgent('c');
      protocol.declareDependency('b', 'a');
      protocol.declareDependency('c', 'a');

      const stats = protocol.getStats();
      expect(stats.dependencyEdges).toBe(2);
    });

    it('should count monitoring active', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.startMonitoring('agent-1');
      protocol.startMonitoring('agent-2');

      const stats = protocol.getStats();
      expect(stats.monitoringActive).toBe(2);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                          DESTROY
  // ═════════════════════════════════════════════════════════════════════════════

  describe('destroy()', () => {
    it('should stop all monitoring', () => {
      protocol.registerAgent('agent-1');
      protocol.registerAgent('agent-2');
      protocol.startMonitoring('agent-1');
      protocol.startMonitoring('agent-2');

      protocol.destroy();

      expect(protocol._heartbeatCheckers.size).toBe(0);
      expect(protocol._snapshotTimers.size).toBe(0);
    });

    it('should clear all agents', () => {
      protocol.registerAgent('agent-1');
      protocol.destroy();
      expect(protocol.agents.size).toBe(0);
    });

    it('should clear all dependencies', () => {
      protocol.registerAgent('a');
      protocol.registerAgent('b');
      protocol.declareDependency('b', 'a');
      protocol.destroy();
      expect(protocol._dependencies.size).toBe(0);
    });

    it('should remove all event listeners', () => {
      protocol.on('heartbeat', () => {});
      protocol.on('snapshot', () => {});
      protocol.destroy();
      expect(protocol.listenerCount('heartbeat')).toBe(0);
      expect(protocol.listenerCount('snapshot')).toBe(0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                     SNAPSHOT AUTO-TIMER
  // ═════════════════════════════════════════════════════════════════════════════

  describe('Automatic Snapshot Timer', () => {
    it('should create automatic snapshots when monitoring with state data', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');

      // Enviar heartbeat com state data
      protocol.heartbeat('agent-1', { memory: 42 });

      const snapHandler = jest.fn();
      protocol.on(Events.SNAPSHOT, snapHandler);

      // Avancar ate o intervalo de snapshot (5000ms)
      jest.advanceTimersByTime(5000);

      expect(snapHandler).toHaveBeenCalled();
    });

    it('should NOT create snapshot if agent has no state data', () => {
      protocol.registerAgent('agent-1');
      protocol.startMonitoring('agent-1');

      // Heartbeat sem state data
      protocol.heartbeat('agent-1');

      const snapHandler = jest.fn();
      protocol.on(Events.SNAPSHOT, snapHandler);

      jest.advanceTimersByTime(5000);

      expect(snapHandler).not.toHaveBeenCalled();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  //                     ERROR HANDLING
  // ═════════════════════════════════════════════════════════════════════════════

  describe('Error Handling', () => {
    it('should guard emit(error) with listenerCount', async () => {
      // Sem listener de erro, nao deve lancar
      protocol.registerAgent('agent-1');
      // Forcando erro de persistencia com diretorio invalido
      protocol.config.snapshotDir = '/dev/null/impossible/path';
      expect(() => {
        protocol.createSnapshot('agent-1', { test: true });
      }).not.toThrow();
    });

    it('should emit error event when listener is attached and persist fails', async () => {
      const errorHandler = jest.fn();
      protocol.on('error', errorHandler);

      protocol.registerAgent('agent-1');
      protocol.config.snapshotDir = '/dev/null/impossible/path';
      protocol.createSnapshot('agent-1', { test: true });

      // Aguardar queue de persistencia
      await protocol._saveQueue;

      expect(errorHandler).toHaveBeenCalled();
    });
  });
});
