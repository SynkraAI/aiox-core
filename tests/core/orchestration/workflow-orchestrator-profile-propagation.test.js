'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const WorkflowOrchestrator = require('../../../.aios-core/core/orchestration/workflow-orchestrator');

describe('WorkflowOrchestrator execution profile propagation', () => {
  let tempDir;
  let workflowPath;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-workflow-profile-'));
    workflowPath = path.join(tempDir, 'workflow.yaml');

    await fs.writeFile(
      workflowPath,
      [
        'workflow:',
        '  id: test-workflow',
        '  name: Test Workflow',
        'sequence:',
        '  - phase: 1',
        '    phase_name: "Build"',
        '    agent: "dev"',
        '    action: "implement"',
        '    task: "dev-develop-story.md"',
        '  - phase: 2',
        '    phase_name: "Review"',
        '    agent: "qa"',
        '    action: "review"',
      ].join('\n'),
      'utf8',
    );
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('passes execution profile and policy to dispatchSubagent context', async () => {
    const dispatchSubagent = jest.fn(async () => ({ status: 'success' }));
    const orchestrator = new WorkflowOrchestrator(workflowPath, {
      projectRoot: tempDir,
      executionContext: 'migration',
      dispatchSubagent,
    });

    await orchestrator.loadWorkflow();

    // Isolate this test to dispatch payload semantics.
    orchestrator.preparePhase = jest.fn(async () => ({}));
    orchestrator.validatePhaseOutput = jest.fn(async () => ({ passed: true, checks: [], errors: [] }));
    orchestrator.promptBuilder.buildPrompt = jest.fn(async () => 'test prompt');
    orchestrator.contextManager.getContextForPhase = jest.fn(async () => ({
      workflowId: 'test-workflow',
      currentPhase: 1,
      previousPhases: {},
      metadata: {},
    }));
    orchestrator.contextManager.savePhaseOutput = jest.fn(async () => {});

    await orchestrator._executeSinglePhase({
      phase: 1,
      phase_name: 'Build',
      agent: 'dev',
      action: 'implement',
      task: 'dev-develop-story.md',
    });

    expect(dispatchSubagent).toHaveBeenCalledTimes(1);
    const payload = dispatchSubagent.mock.calls[0][0];

    expect(payload.context).toBeDefined();
    expect(payload.context.executionProfile).toBe('balanced');
    expect(payload.context.executionPolicy).toBeDefined();
    expect(payload.context.executionPolicy.max_parallel_changes).toBe(3);
    expect(payload.baseContext).toBeDefined();
  });
});
