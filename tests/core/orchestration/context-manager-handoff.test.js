'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const ContextManager = require('../../../.aios-core/core/orchestration/context-manager');

describe('ContextManager structured handoff package', () => {
  let tempDir;
  let manager;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-handoff-'));
    manager = new ContextManager('test-workflow', tempDir);
    await manager.initialize();
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('saves standardized handoff package in phase output', async () => {
    await manager.savePhaseOutput(
      1,
      {
        agent: 'architect',
        task: 'spec-write-spec.md',
        result: {
          decisions: [{ id: 'D1', summary: 'Use API gateway' }],
          evidence_links: ['docs/spec.md'],
          open_risks: ['Gateway latency spike'],
        },
        validation: {
          checks: [{ type: 'file_exists', path: 'docs/spec.md', passed: true }],
        },
      },
      { handoffTarget: { phase: 2, agent: 'dev' } },
    );

    const state = await manager.loadState();
    const handoff = state.phases[1].handoff;

    expect(handoff).toBeDefined();
    expect(handoff.workflow_id).toBe('test-workflow');
    expect(handoff.from.phase).toBe(1);
    expect(handoff.from.agent).toBe('architect');
    expect(handoff.to.phase).toBe(2);
    expect(handoff.to.agent).toBe('dev');
    expect(handoff.context_snapshot.current_phase).toBe(1);
    expect(handoff.context_snapshot.workflow_status).toBe('in_progress');
    expect(handoff.decision_log.count).toBe(1);
    expect(handoff.evidence_links).toContain('docs/spec.md');
    expect(handoff.open_risks).toContain('Gateway latency spike');
  });

  it('writes handoff artifact file to handoffs directory', async () => {
    await manager.savePhaseOutput(
      2,
      {
        agent: 'dev',
        task: 'dev-develop-story.md',
        result: { decisions: [] },
      },
      { handoffTarget: { phase: 3, agent: 'qa' } },
    );

    const handoffPath = path.join(
      tempDir,
      '.aios',
      'workflow-state',
      'handoffs',
      'test-workflow-phase-2.handoff.json',
    );
    const exists = await fs.pathExists(handoffPath);
    const content = await fs.readJson(handoffPath);

    expect(exists).toBe(true);
    expect(content.from.phase).toBe(2);
    expect(content.to.agent).toBe('qa');
  });

  it('provides previous handoffs in getContextForPhase', async () => {
    await manager.savePhaseOutput(
      1,
      {
        agent: 'architect',
        result: { decisions: [{ id: 'D1' }] },
      },
      { handoffTarget: { phase: 2, agent: 'dev' } },
    );

    const phase2Context = await manager.getContextForPhase(2);
    expect(phase2Context.previousHandoffs).toBeDefined();
    expect(phase2Context.previousHandoffs['1']).toBeDefined();
    expect(phase2Context.previousHandoffs['1'].to.agent).toBe('dev');
  });

  it('computes and persists delivery confidence score from phase data', async () => {
    await manager.savePhaseOutput(
      1,
      {
        agent: 'dev',
        result: {
          status: 'success',
          ac_total: 4,
          ac_completed: 3,
          open_risks: ['risk-a'],
          technical_debt_count: 1,
        },
        validation: {
          checks: [
            { type: 'unit_test', passed: true },
            { type: 'regression_suite', passed: true },
            { type: 'integration_test', passed: false },
          ],
        },
      },
      { handoffTarget: { phase: 2, agent: 'qa' } },
    );

    const state = await manager.loadState();
    const confidence = state.metadata.delivery_confidence;

    expect(confidence).toBeDefined();
    expect(confidence.version).toBe('1.0.0');
    expect(confidence.score).toBeGreaterThan(0);
    expect(confidence.score).toBeLessThanOrEqual(100);
    expect(confidence.components.test_coverage).toBeCloseTo(2 / 3, 5);
    expect(confidence.components.ac_completion).toBeCloseTo(0.75, 5);
    expect(confidence.components.regression_clear).toBeCloseTo(1, 5);

    const confidencePath = path.join(
      tempDir,
      '.aios',
      'workflow-state',
      'confidence',
      'test-workflow.delivery-confidence.json',
    );
    const persisted = await fs.readJson(confidencePath);
    expect(persisted.score).toBe(confidence.score);
  });

  it('includes delivery confidence in summary output', async () => {
    await manager.savePhaseOutput(
      1,
      {
        agent: 'qa',
        result: { status: 'success' },
        validation: { checks: [{ type: 'regression', passed: true }] },
      },
      { handoffTarget: { phase: 2, agent: 'po' } },
    );

    const summary = manager.getSummary();
    expect(summary.deliveryConfidence).toBeDefined();
    expect(summary.deliveryConfidence.score).toBeGreaterThanOrEqual(0);
  });
});
