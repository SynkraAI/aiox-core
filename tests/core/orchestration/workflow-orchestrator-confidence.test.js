'use strict';

const WorkflowOrchestrator = require('../../../.aios-core/core/orchestration/workflow-orchestrator');

describe('WorkflowOrchestrator delivery confidence gate', () => {
  function buildOrchestrator(options = {}, confidence = null) {
    const orchestrator = new WorkflowOrchestrator('/tmp/fake-workflow.yaml', {
      ...options,
      projectRoot: process.cwd(),
    });

    orchestrator.workflow = {
      workflow: { id: 'wf-confidence' },
      sequence: [{ phase: 1 }, { phase: 2 }],
    };
    orchestrator.executionState = {
      startTime: Date.now() - 1000,
      currentPhase: 2,
      completedPhases: [1, 2],
      failedPhases: [],
      skippedPhases: [],
    };
    orchestrator.contextManager = {
      getPreviousPhaseOutputs: () => ({ 1: { result: { status: 'success' } } }),
      getDeliveryConfidence: () => confidence,
    };

    return orchestrator;
  }

  it('marks summary as failed_confidence_gate when score is below threshold', () => {
    const orchestrator = buildOrchestrator({ confidenceThreshold: 80 }, { score: 72 });
    const summary = orchestrator._generateExecutionSummary();

    expect(summary.status).toBe('failed_confidence_gate');
    expect(summary.confidenceGate.enabled).toBe(true);
    expect(summary.confidenceGate.passed).toBe(false);
    expect(summary.confidenceGate.threshold).toBe(80);
  });

  it('keeps completed status when confidence score passes gate', () => {
    const orchestrator = buildOrchestrator({ confidenceThreshold: 70 }, { score: 88.5 });
    const summary = orchestrator._generateExecutionSummary();

    expect(summary.status).toBe('completed');
    expect(summary.confidenceGate.passed).toBe(true);
    expect(summary.deliveryConfidence.score).toBe(88.5);
  });

  it('disables gate when enableConfidenceGate is false', () => {
    const orchestrator = buildOrchestrator({ enableConfidenceGate: false }, { score: 10 });
    const summary = orchestrator._generateExecutionSummary();

    expect(summary.status).toBe('completed');
    expect(summary.confidenceGate).toBeUndefined();
  });
});
