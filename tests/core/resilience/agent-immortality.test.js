'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  AgentImmortalityProtocol,
  AutopsyEngine,
  CauseOfDeath,
  EvolutionLog,
  QueueStatus,
  ReincarnationQueue,
  StateCommitLog,
} = require('../../../.aiox-core/core/resilience');

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'aip-test-'));
}

function createState(overrides = {}) {
  return {
    id: 'dev-agent-1',
    name: 'Dex',
    lastGoal: 'Implement Story 482.1',
    lastSuccessfulStep: 'Created failing test',
    currentAction: 'retry same tool call',
    workingMemory: [
      'old context that must not be injected',
      'checkpoint one',
      'checkpoint two',
    ],
    criticalVariables: {
      storyId: '482.1',
    },
    diff: {
      file: 'src/example.js',
      operation: 'patch',
    },
    ...overrides,
  };
}

describe('Agent Immortality Protocol', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('exports the core resilience primitives', () => {
    const core = require('../../../.aiox-core/core');
    const publishedResilience = require('@aiox-squads/core/resilience');

    expect(AgentImmortalityProtocol).toBeDefined();
    expect(AutopsyEngine).toBeDefined();
    expect(ReincarnationQueue).toBeDefined();
    expect(StateCommitLog).toBeDefined();
    expect(EvolutionLog).toBeDefined();
    expect(CauseOfDeath.CONTEXT_OVERFLOW).toBe('CONTEXT_OVERFLOW');
    expect(core.resilience.AgentImmortalityProtocol).toBe(AgentImmortalityProtocol);
    expect(publishedResilience.AgentImmortalityProtocol).toBe(AgentImmortalityProtocol);
  });

  test('records a compact autopsy and reincarnation context for context overflow', () => {
    const engine = new AutopsyEngine(tempDir);
    const report = engine.recordDeath(
      createState({ currentAction: 'paste entire transcript into prompt' }),
      new Error('Maximum context token length exceeded'),
    );

    expect(report.cause).toBe(CauseOfDeath.CONTEXT_OVERFLOW);
    expect(report.legacy.memoryTail).toEqual(['checkpoint one', 'checkpoint two']);
    expect(report.legacy.omittedMemoryItems).toBe(1);
    expect(report.legacySummary).not.toContain('old context that must not be injected');
    expect(report.preventionDirectives).toEqual(expect.arrayContaining([
      'Use the compressed legacy summary; do not rehydrate the full previous context.',
    ]));
    expect(report.reincarnationContext).toContain('[AIOX REINCARNATION CONTEXT]');
    expect(engine.getReincarnationContext()).toContain('CONTEXT_OVERFLOW');
  });

  test('creates immunity tokens that forbid immediate repetition of failed actions', () => {
    const engine = new AutopsyEngine(tempDir);
    const report = engine.recordDeath(
      createState({ currentAction: 'call broken tool with same args' }),
      new Error('Tool execution failed: invalid function call schema'),
    );

    expect(report.cause).toBe(CauseOfDeath.TOOL_EXECUTION_FAILURE);
    expect(report.immunityToken).toMatchObject({
      forbiddenAction: 'call broken tool with same args',
    });
    expect(report.preventionDirectives.join('\n')).toContain(
      'Do not immediately repeat action: call broken tool with same args',
    );
  });

  test('persists delta state commits with previous commit linkage', () => {
    const log = new StateCommitLog(tempDir);
    const first = log.commitDelta('agent-1', { step: 1 });
    const second = log.commitDelta('agent-1', { step: 2 });

    expect(second.previousId).toBe(first.id);
    expect(log.latest('agent-1')).toMatchObject({
      id: second.id,
      delta: { step: 2 },
    });
  });

  test('queues and claims reincarnation contexts deterministically', () => {
    const engine = new AutopsyEngine(tempDir);
    const queue = new ReincarnationQueue(tempDir);
    const report = engine.recordDeath(createState(), new Error('recursive loop detected'));

    const queued = queue.enqueue(report);
    const claimed = queue.claimNext();

    expect(queued.status).toBe(QueueStatus.QUEUED);
    expect(claimed).toMatchObject({
      id: queued.id,
      status: QueueStatus.CLAIMED,
      reportId: report.id,
    });
    expect(queue.claimNext()).toBeNull();
  });

  test('rehydrates queued reincarnation context across protocol instances', () => {
    const firstProtocol = new AgentImmortalityProtocol(tempDir);
    const result = firstProtocol.captureFailure({
      agentState: createState(),
      error: new Error('recursive loop detected'),
    });
    const secondProtocol = new AgentImmortalityProtocol(tempDir);

    const claimed = secondProtocol.claimReincarnation();

    expect(claimed).toMatchObject({
      id: result.queueItem.id,
      status: QueueStatus.CLAIMED,
      reportId: result.report.id,
    });
    expect(firstProtocol.claimReincarnation()).toBeNull();
  });

  test('claims a queued reincarnation only once across queue instances', () => {
    const engine = new AutopsyEngine(tempDir);
    const firstQueue = new ReincarnationQueue(tempDir);
    const secondQueue = new ReincarnationQueue(tempDir);
    const report = engine.recordDeath(createState(), new Error('recursive loop detected'));
    const queued = firstQueue.enqueue(report);

    const claims = [firstQueue.claimNext(), secondQueue.claimNext()].filter(Boolean);

    expect(claims).toHaveLength(1);
    expect(claims[0]).toMatchObject({
      id: queued.id,
      status: QueueStatus.CLAIMED,
    });
  });

  test('quarantines corrupt persistence files and continues with an empty list', () => {
    const dataDir = path.join(tempDir, '.aiox', 'immortality');
    const queueFile = path.join(dataDir, 'reincarnation-queue.json');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(queueFile, '{not-json');

    const queue = new ReincarnationQueue(tempDir);

    expect(queue.list()).toEqual([]);
    expect(fs.readdirSync(dataDir).some(file => file.startsWith('reincarnation-queue.json.corrupt-'))).toBe(true);
  });

  test('records evolution patterns and toxic actions', () => {
    const engine = new AutopsyEngine(tempDir);
    const evolutionLog = new EvolutionLog(tempDir);
    const report = engine.recordDeath(createState(), new Error('recursive loop detected'));

    const first = evolutionLog.record(report);
    const second = evolutionLog.record(report);

    expect(first.event.cause).toBe(CauseOfDeath.RECURSIVE_LOOP);
    expect(second.patterns[`${CauseOfDeath.RECURSIVE_LOOP}:retry same tool call`]).toBe(2);
    expect(evolutionLog.getToxicActions()['retry same tool call']).toBe(2);
  });

  test('captureFailure coordinates autopsy, queue, state commit, evolution and gotchas', () => {
    const gotchasMemory = {
      trackError: jest.fn(),
    };
    const protocol = new AgentImmortalityProtocol(tempDir, { gotchasMemory });
    const result = protocol.captureFailure({
      agentState: createState(),
      error: new Error('network api timeout'),
      metadata: { storyId: '482.1' },
    });

    expect(result.report.cause).toBe(CauseOfDeath.EXTERNAL_API_ERROR);
    expect(result.queueItem.status).toBe(QueueStatus.QUEUED);
    expect(result.evolution.event.reportId).toBe(result.report.id);
    expect(result.reincarnationContext).toContain('suggested_pivot');
    expect(gotchasMemory.trackError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'network api timeout',
      category: 'runtime',
      context: expect.objectContaining({
        source: 'agent-immortality',
        cause: CauseOfDeath.EXTERNAL_API_ERROR,
      }),
    }));
  });

  test('does not fail capture when optional gotchas tracking throws', () => {
    const gotchasMemory = {
      trackError: jest.fn(() => {
        throw new Error('gotchas unavailable');
      }),
    };
    const protocol = new AgentImmortalityProtocol(tempDir, { gotchasMemory });
    const gotchaErrors = [];
    protocol.on('gotcha-track-failed', error => gotchaErrors.push(error.message));

    const result = protocol.captureFailure({
      agentState: createState(),
      error: new Error('network api timeout'),
    });

    expect(result.queueItem.status).toBe(QueueStatus.QUEUED);
    expect(gotchasMemory.trackError).toHaveBeenCalled();
    expect(gotchaErrors).toEqual(['gotchas unavailable']);
  });

  test('throws clear errors when captureFailure lacks required inputs', () => {
    const protocol = new AgentImmortalityProtocol(tempDir);

    expect(() => protocol.captureFailure({ error: new Error('x') })).toThrow('agentState is required');
    expect(() => protocol.captureFailure({ agentState: createState() })).toThrow('error is required');
  });
});
