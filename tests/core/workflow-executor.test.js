/**
 * Workflow Executor Tests
 *
 * Story 11.3: Development Cycle Workflow
 *
 * Tests for the WorkflowExecutor module which provides
 * orchestrated development cycle execution.
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Module under test
const {
  WorkflowExecutor,
  createWorkflowExecutor,
  executeDevelopmentCycle,
  PhaseStatus,
  CheckpointDecision,
} = require('../../.aiox-core/core/orchestration/workflow-executor');

describe('WorkflowExecutor', () => {
  const projectRoot = path.join(__dirname, '../..');
  let tmpDir;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'workflow-executor-test-'));
  });

  afterAll(async () => {
    // Cleanup temp directory
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  // ============================================
  // Module Structure Tests
  // ============================================
  describe('Module Structure', () => {
    test('should export WorkflowExecutor class', () => {
      expect(WorkflowExecutor).toBeDefined();
      expect(typeof WorkflowExecutor).toBe('function');
    });

    test('should export factory function', () => {
      expect(createWorkflowExecutor).toBeDefined();
      expect(typeof createWorkflowExecutor).toBe('function');
    });

    test('should export executeDevelopmentCycle function', () => {
      expect(executeDevelopmentCycle).toBeDefined();
      expect(typeof executeDevelopmentCycle).toBe('function');
    });

    test('should export PhaseStatus enum', () => {
      expect(PhaseStatus).toBeDefined();
      expect(PhaseStatus.PENDING).toBe('pending');
      expect(PhaseStatus.RUNNING).toBe('running');
      expect(PhaseStatus.COMPLETED).toBe('completed');
      expect(PhaseStatus.FAILED).toBe('failed');
      expect(PhaseStatus.SKIPPED).toBe('skipped');
    });

    test('should export CheckpointDecision enum', () => {
      expect(CheckpointDecision).toBeDefined();
      expect(CheckpointDecision.GO).toBe('GO');
      expect(CheckpointDecision.PAUSE).toBe('PAUSE');
      expect(CheckpointDecision.REVIEW).toBe('REVIEW');
      expect(CheckpointDecision.ABORT).toBe('ABORT');
    });
  });

  // ============================================
  // WorkflowExecutor Creation Tests
  // ============================================
  describe('WorkflowExecutor Creation', () => {
    test('should create executor with project root', () => {
      const executor = new WorkflowExecutor(projectRoot);
      expect(executor).toBeInstanceOf(WorkflowExecutor);
      expect(executor.projectRoot).toBe(projectRoot);
    });

    test('should create executor with options', () => {
      const executor = new WorkflowExecutor(projectRoot, {
        debug: true,
        autoResume: false,
        saveState: false,
      });

      expect(executor.options.debug).toBe(true);
      expect(executor.options.autoResume).toBe(false);
      expect(executor.options.saveState).toBe(false);
    });

    test('should use default options if not provided', () => {
      const executor = new WorkflowExecutor(projectRoot);

      expect(executor.options.debug).toBe(false);
      expect(executor.options.autoResume).toBe(true);
      expect(executor.options.saveState).toBe(true);
    });

    test('factory function should create executor', () => {
      const executor = createWorkflowExecutor(projectRoot);
      expect(executor).toBeInstanceOf(WorkflowExecutor);
    });
  });

  // ============================================
  // Workflow Loading Tests
  // ============================================
  describe('Workflow Loading', () => {
    test('should load workflow definition', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      const workflow = await executor.loadWorkflow();

      expect(workflow).toBeDefined();
      expect(workflow.workflow).toBeDefined();
      expect(workflow.workflow.id).toBe('development-cycle');
      expect(workflow.workflow.version).toBe('1.0.0');
    });

    test('should have all required phases', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      const workflow = await executor.loadWorkflow();

      const phases = workflow.workflow.phases;
      expect(phases['1_validation']).toBeDefined();
      expect(phases['2_development']).toBeDefined();
      expect(phases['3_self_healing']).toBeDefined();
      expect(phases['4_quality_gate']).toBeDefined();
      expect(phases['5_push']).toBeDefined();
      expect(phases['6_checkpoint']).toBeDefined();
    });

    test('should have dynamic executor configuration', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      const workflow = await executor.loadWorkflow();

      expect(workflow.workflow.phases['2_development'].agent).toBe('${story.executor}');
      expect(workflow.workflow.phases['4_quality_gate'].agent).toBe('${story.quality_gate}');
    });
  });

  // ============================================
  // Config Loading Tests
  // ============================================
  describe('Config Loading', () => {
    test('should load core configuration', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      const config = await executor.loadConfig();

      expect(config).toBeDefined();
    });

    test('should handle missing config gracefully', async () => {
      const executor = new WorkflowExecutor('/nonexistent/path');
      const config = await executor.loadConfig();

      expect(config).toBeDefined();
      expect(config.coderabbit_integration.enabled).toBe(false);
    });
  });

  // ============================================
  // State Management Tests
  // ============================================
  describe('State Management', () => {
    test('should initialize new state', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false });
      await executor.loadWorkflow();

      const state = await executor.initializeState('/fake/story.story.md');

      expect(state).toBeDefined();
      expect(state.workflowId).toBe('development-cycle');
      expect(state.currentPhase).toBe('1_validation');
      expect(state.currentStory).toBe('/fake/story.story.md');
      expect(state.attemptCount).toBe(0);
    });

    test('should generate correct state file path', () => {
      const executor = new WorkflowExecutor(projectRoot);
      const stateFile = executor.getStateFilePath('/path/to/11.3.story.md');

      expect(stateFile).toContain('11.3-state.yaml');
    });
  });

  // ============================================
  // Agent Resolution Tests
  // ============================================
  describe('Agent Resolution', () => {
    test('should resolve static agent reference', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      executor.state = { executor: '@dev', qualityGate: '@architect' };

      expect(executor.resolveAgent('@po')).toBe('@po');
      expect(executor.resolveAgent('@devops')).toBe('@devops');
    });

    test('should resolve dynamic executor reference', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      executor.state = { executor: '@dev', qualityGate: '@architect' };

      expect(executor.resolveAgent('${story.executor}')).toBe('@dev');
    });

    test('should resolve dynamic quality_gate reference', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      executor.state = { executor: '@dev', qualityGate: '@architect' };

      expect(executor.resolveAgent('${story.quality_gate}')).toBe('@architect');
    });
  });

  // ============================================
  // Condition Evaluation Tests
  // ============================================
  describe('Condition Evaluation', () => {
    test('should evaluate CodeRabbit condition as true', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      executor.config = { coderabbit_integration: { enabled: true } };

      const result = executor.evaluateCondition('${config.coderabbit_integration.enabled} == true');
      expect(result).toBe(true);
    });

    test('should evaluate CodeRabbit condition as false', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      executor.config = { coderabbit_integration: { enabled: false } };

      const result = executor.evaluateCondition('${config.coderabbit_integration.enabled} == true');
      expect(result).toBe(false);
    });

    test('should return true for unknown conditions', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      executor.config = {};

      const result = executor.evaluateCondition('some.unknown.condition');
      expect(result).toBe(true);
    });
  });

  // ============================================
  // Phase Execution Tests
  // ============================================
  describe('Phase Execution', () => {
    test('should skip phase when condition not met', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false });
      await executor.loadWorkflow();
      executor.config = { coderabbit_integration: { enabled: false } };
      executor.state = {
        executor: '@dev',
        qualityGate: '@architect',
        phaseResults: {},
        accumulatedContext: {},
      };

      const result = await executor.executePhase('3_self_healing', '/fake/story.md', {});

      expect(result.status).toBe(PhaseStatus.SKIPPED);
      expect(result.reason).toBe('Condition not met');
    });

    test('should fail validation for missing executor', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false });
      await executor.loadWorkflow();
      await executor.loadConfig();

      // Create a mock story file
      const mockStoryPath = path.join(tmpDir, 'test-story.story.md');
      await fs.writeFile(
        mockStoryPath,
        `
# Test Story

\`\`\`yaml
story_id: "test"
status: "Approved"
\`\`\`
      `,
      );

      executor.state = {
        executor: null,
        qualityGate: null,
        accumulatedContext: {},
      };

      const result = await executor.executeValidationPhase({}, '@po', mockStoryPath, {});

      expect(result.status).toBe(PhaseStatus.FAILED);
      expect(result.validation_result.issues).toContain('Story must have an executor assigned');
    });

    test('should fail validation when executor equals quality_gate', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false });
      await executor.loadWorkflow();
      await executor.loadConfig();

      // Create a mock story file
      const mockStoryPath = path.join(tmpDir, 'test-story2.story.md');
      await fs.writeFile(
        mockStoryPath,
        `
# Test Story

\`\`\`yaml
story_id: "test"
status: "Approved"
executor: "@dev"
quality_gate: "@dev"
\`\`\`
      `,
      );

      executor.state = {
        executor: '@dev',
        qualityGate: '@dev',
        accumulatedContext: {},
      };

      const result = await executor.executeValidationPhase({}, '@po', mockStoryPath, {});

      expect(result.status).toBe(PhaseStatus.FAILED);
      expect(result.validation_result.issues).toContain(
        'Executor and Quality Gate must be different agents',
      );
    });

    test('should pass validation with correct story', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false });
      await executor.loadWorkflow();
      await executor.loadConfig();

      // Create a mock story file
      const mockStoryPath = path.join(tmpDir, 'test-story3.story.md');
      await fs.writeFile(
        mockStoryPath,
        `
# Test Story

\`\`\`yaml
story_id: "test"
status: "Approved"
executor: "@dev"
quality_gate: "@architect"
\`\`\`
      `,
      );

      executor.state = {
        executor: '@dev',
        qualityGate: '@architect',
        accumulatedContext: {},
      };

      const result = await executor.executeValidationPhase({}, '@po', mockStoryPath, {});

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      expect(result.validation_result.passed).toBe(true);
    });
  });

  // ============================================
  // Checkpoint Decision Tests
  // ============================================
  describe('Checkpoint Decisions', () => {
    test('should return checkpoint with options', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false });
      await executor.loadWorkflow();
      executor.state = {
        executor: '@dev',
        qualityGate: '@architect',
        phaseResults: {},
      };

      const result = await executor.executeCheckpointPhase({}, '@po', '/fake/story.md');

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      expect(result.options).toBeDefined();
      expect(result.options.GO).toBeDefined();
      expect(result.options.PAUSE).toBeDefined();
      expect(result.options.REVIEW).toBeDefined();
      expect(result.options.ABORT).toBeDefined();
    });

    test('GO decision should return to validation phase', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      await executor.loadWorkflow();

      const nextPhase = executor.getNextPhase('6_checkpoint', {
        status: PhaseStatus.COMPLETED,
        decision: CheckpointDecision.GO,
      });

      expect(nextPhase).toBe('1_validation');
    });

    test('PAUSE decision should return workflow_paused', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      await executor.loadWorkflow();

      const nextPhase = executor.getNextPhase('6_checkpoint', {
        status: PhaseStatus.COMPLETED,
        decision: CheckpointDecision.PAUSE,
      });

      expect(nextPhase).toBe('workflow_paused');
    });

    test('ABORT decision should return workflow_aborted', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      await executor.loadWorkflow();

      const nextPhase = executor.getNextPhase('6_checkpoint', {
        status: PhaseStatus.COMPLETED,
        decision: CheckpointDecision.ABORT,
      });

      expect(nextPhase).toBe('workflow_aborted');
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================
  describe('Error Handling', () => {
    test('should handle unknown phase gracefully', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false });
      await executor.loadWorkflow();
      executor.state = { phaseResults: {}, accumulatedContext: {} };

      const result = await executor.executePhase('unknown_phase', '/fake/story.md', {});

      expect(result.status).toBe(PhaseStatus.FAILED);
      expect(result.error).toContain('Phase not found');
    });

    test('should return retry for return_to_development handler', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      await executor.loadWorkflow();
      executor.state = { attemptCount: 0 };

      const result = await executor.handleError('return_to_development', {});

      expect(result.nextPhase).toBe('2_development');
    });

    test('should not retry after max attempts', async () => {
      const executor = new WorkflowExecutor(projectRoot);
      await executor.loadWorkflow();
      executor.state = { attemptCount: 5 };

      const result = await executor.handleError('return_to_development', {});

      expect(result.retry).toBe(false);
      expect(result.escalate).toBe(true);
    });
  });

  // ============================================
  // Self-Healing Tests
  // ============================================
  describe('Self-Healing with CodeRabbit', () => {
    test('should skip self-healing when CodeRabbit not enabled', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false });
      await executor.loadWorkflow();
      executor.config = { coderabbit_integration: { enabled: false } };
      executor.state = {
        executor: '@dev',
        qualityGate: '@architect',
        phaseResults: {},
      };

      const result = await executor.executeSelfHealingPhase({ config: {} }, '@dev');

      expect(result.status).toBe(PhaseStatus.SKIPPED);
      expect(result.reason).toBe('CodeRabbit integration not enabled');
    });

    test('should parse JSON-formatted CodeRabbit output', () => {
      const executor = new WorkflowExecutor(projectRoot);

      const output = `
Some header text
\`\`\`json
[
  {"file": "src/index.js", "line": 10, "severity": "HIGH", "message": "Unused variable"},
  {"file": "src/utils.js", "line": 25, "severity": "CRITICAL", "message": "SQL injection risk"}
]
\`\`\`
Some footer text
      `;

      const issues = executor.parseCodeRabbitOutput(output);

      expect(issues).toHaveLength(2);
      expect(issues[0].file).toBe('src/index.js');
      expect(issues[0].severity).toBe('HIGH');
      expect(issues[1].severity).toBe('CRITICAL');
    });

    test('should parse text-formatted CodeRabbit output', () => {
      const executor = new WorkflowExecutor(projectRoot);

      const output = `
[CRITICAL] src/auth.js:15 Hardcoded credentials detected
[HIGH] src/api.js:42 Missing input validation
[MEDIUM] src/utils.js:8 Consider using const
      `;

      const issues = executor.parseCodeRabbitOutput(output);

      expect(issues).toHaveLength(3);
      expect(issues[0].severity).toBe('CRITICAL');
      expect(issues[0].file).toBe('src/auth.js');
      expect(issues[0].line).toBe(15);
      expect(issues[1].severity).toBe('HIGH');
      expect(issues[2].severity).toBe('MEDIUM');
    });

    test('should return empty array for empty output', () => {
      const executor = new WorkflowExecutor(projectRoot);

      const issues = executor.parseCodeRabbitOutput('');
      expect(issues).toHaveLength(0);

      const issues2 = executor.parseCodeRabbitOutput(null);
      expect(issues2).toHaveLength(0);
    });

    test('should filter issues by severity', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false, debug: false });
      await executor.loadWorkflow();
      executor.config = {
        coderabbit_integration: {
          enabled: true,
          graceful_degradation: { skip_if_not_installed: true },
        },
      };
      executor.state = { phaseResults: {} };

      // Mock runCodeRabbitAnalysis to return issues first, then empty
      const originalRun = executor.runCodeRabbitAnalysis.bind(executor);
      let callCount = 0;
      executor.runCodeRabbitAnalysis = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            success: true,
            issues: [
              { file: 'a.js', line: 1, severity: 'CRITICAL', message: 'Critical issue' },
              { file: 'b.js', line: 2, severity: 'LOW', message: 'Low issue' },
            ],
          });
        }
        // Second call returns no issues (simulating issues were addressed)
        return Promise.resolve({ success: true, issues: [] });
      });

      const result = await executor.executeSelfHealingPhase(
        { config: { severity_filter: ['CRITICAL'] } },
        '@dev',
      );

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      // Only CRITICAL should be in remaining (since attemptAutoFix returns false)
      expect(result.healed_code.issues_remaining).toHaveLength(1);
      expect(result.healed_code.issues_remaining[0].severity).toBe('CRITICAL');

      executor.runCodeRabbitAnalysis = originalRun;
    });

    test('should handle CodeRabbit not installed gracefully', async () => {
      const executor = new WorkflowExecutor(projectRoot, { saveState: false, debug: false });
      await executor.loadWorkflow();
      executor.config = {
        coderabbit_integration: {
          enabled: true,
          graceful_degradation: {
            skip_if_not_installed: true,
            fallback_message: 'CodeRabbit not installed',
          },
        },
      };
      executor.state = { phaseResults: {} };

      // Mock runCodeRabbitAnalysis to simulate not installed
      executor.runCodeRabbitAnalysis = jest.fn().mockResolvedValue({
        success: false,
        error: 'CodeRabbit CLI not installed',
        issues: [],
      });

      const result = await executor.executeSelfHealingPhase({ config: {} }, '@dev');

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      expect(result.healed_code.note).toBeDefined();
    });

    test('attemptAutoFix should return false for MVP', async () => {
      const executor = new WorkflowExecutor(projectRoot, { debug: false });

      const result = await executor.attemptAutoFix({
        file: 'test.js',
        line: 10,
        severity: 'HIGH',
        message: 'Test issue',
      });

      expect(result).toBe(false);
    });
  });

  // ============================================
  // Integration Tests
  // ============================================
  describe('Integration with Orchestration Index', () => {
    test('should be exported from orchestration index', () => {
      const orchestration = require('../../.aiox-core/core/orchestration');

      expect(orchestration.WorkflowExecutor).toBeDefined();
      expect(orchestration.createWorkflowExecutor).toBeDefined();
      expect(orchestration.executeDevelopmentCycle).toBeDefined();
      expect(orchestration.PhaseStatus).toBeDefined();
      expect(orchestration.CheckpointDecision).toBeDefined();
    });
  });
});

// ============================================
// development-cycle.yaml Tests
// ============================================
describe('development-cycle.yaml', () => {
  const projectRoot = path.join(__dirname, '../..');
  const yaml = require('js-yaml');

  test('should be valid YAML', async () => {
    const content = await fs.readFile(
      path.join(projectRoot, '.aiox-core/development/workflows/development-cycle.yaml'),
      'utf8',
    );

    expect(() => yaml.load(content)).not.toThrow();
  });

  test('should have required workflow structure', async () => {
    const content = await fs.readFile(
      path.join(projectRoot, '.aiox-core/development/workflows/development-cycle.yaml'),
      'utf8',
    );
    const workflow = yaml.load(content);

    expect(workflow.workflow.id).toBe('development-cycle');
    expect(workflow.workflow.name).toContain('Development Cycle');
    expect(workflow.workflow.orchestrator).toBe('@po');
    expect(workflow.workflow.phases).toBeDefined();
    expect(workflow.workflow.error_handlers).toBeDefined();
  });

  test('should have all 6 phases', async () => {
    const content = await fs.readFile(
      path.join(projectRoot, '.aiox-core/development/workflows/development-cycle.yaml'),
      'utf8',
    );
    const workflow = yaml.load(content);
    const phases = Object.keys(workflow.workflow.phases);

    expect(phases).toContain('1_validation');
    expect(phases).toContain('2_development');
    expect(phases).toContain('3_self_healing');
    expect(phases).toContain('4_quality_gate');
    expect(phases).toContain('5_push');
    expect(phases).toContain('6_checkpoint');
  });

  test('checkpoint phase should have elicit: true', async () => {
    const content = await fs.readFile(
      path.join(projectRoot, '.aiox-core/development/workflows/development-cycle.yaml'),
      'utf8',
    );
    const workflow = yaml.load(content);

    expect(workflow.workflow.phases['6_checkpoint'].elicit).toBe(true);
  });

  test('self_healing phase should have condition', async () => {
    const content = await fs.readFile(
      path.join(projectRoot, '.aiox-core/development/workflows/development-cycle.yaml'),
      'utf8',
    );
    const workflow = yaml.load(content);

    expect(workflow.workflow.phases['3_self_healing'].condition).toBeDefined();
    expect(workflow.workflow.phases['3_self_healing'].condition).toContain(
      'coderabbit_integration.enabled',
    );
  });
});
