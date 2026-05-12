/**
 * Agent Invoker Tests
 *
 * Story: 0.7 - Agent Invocation Interface
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Tests for agent invocation interface.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  AgentInvoker,
  SUPPORTED_AGENTS,
  InvocationStatus,
} = require('../../.aiox-core/core/orchestration/agent-invoker');

describe('Agent Invoker (Story 0.7)', () => {
  let tempDir;
  let invoker;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `agent-invoker-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    // Create agents directory
    const agentsDir = path.join(tempDir, '.aiox-core', 'development', 'agents');
    await fs.ensureDir(agentsDir);

    // Create sample agent file
    await fs.writeFile(path.join(agentsDir, 'dev.md'), '# Developer Agent\n\nDevelops code.');

    // Create tasks directory
    const tasksDir = path.join(tempDir, '.aiox-core', 'development', 'tasks');
    await fs.ensureDir(tasksDir);

    // Create sample task file
    await fs.writeFile(path.join(tasksDir, 'sample-task.md'), '# Sample Task\n\nDo something.');

    invoker = new AgentInvoker({
      projectRoot: tempDir,
      maxRetries: 2,
    });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('SUPPORTED_AGENTS (AC2)', () => {
    it('should include all required agents', () => {
      expect(SUPPORTED_AGENTS.pm).toBeDefined();
      expect(SUPPORTED_AGENTS.architect).toBeDefined();
      expect(SUPPORTED_AGENTS.analyst).toBeDefined();
      expect(SUPPORTED_AGENTS.dev).toBeDefined();
      expect(SUPPORTED_AGENTS.qa).toBeDefined();
    });

    it('should have correct agent structure', () => {
      const devAgent = SUPPORTED_AGENTS.dev;
      expect(devAgent.name).toBe('dev');
      expect(devAgent.displayName).toBe('Developer');
      expect(devAgent.file).toBe('dev.md');
      expect(devAgent.capabilities).toBeInstanceOf(Array);
    });
  });

  describe('InvocationStatus Enum', () => {
    it('should have all required statuses', () => {
      expect(InvocationStatus.SUCCESS).toBe('success');
      expect(InvocationStatus.FAILED).toBe('failed');
      expect(InvocationStatus.TIMEOUT).toBe('timeout');
      expect(InvocationStatus.SKIPPED).toBe('skipped');
    });
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const inv = new AgentInvoker({ projectRoot: tempDir });

      expect(inv.projectRoot).toBe(tempDir);
      expect(inv.defaultTimeout).toBe(300000);
      expect(inv.maxRetries).toBe(3);
    });

    it('should accept custom options', () => {
      const inv = new AgentInvoker({
        projectRoot: tempDir,
        defaultTimeout: 60000,
        maxRetries: 5,
        validateOutput: false,
      });

      expect(inv.defaultTimeout).toBe(60000);
      expect(inv.maxRetries).toBe(5);
      expect(inv.validateOutput).toBe(false);
    });
  });

  describe('invokeAgent (AC1)', () => {
    it('should invoke agent and return result', async () => {
      const result = await invoker.invokeAgent('dev', 'sample-task', { foo: 'bar' });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.invocationId).toBeDefined();
      expect(result.agentName).toBe('dev');
      expect(result.taskPath).toBe('sample-task');
      expect(result.duration).toBeDefined();
    });

    it('should handle agent name with @ prefix', async () => {
      const result = await invoker.invokeAgent('@dev', 'sample-task');

      expect(result.success).toBe(true);
    });

    it('should fail for unknown agent', async () => {
      const result = await invoker.invokeAgent('unknown-agent', 'sample-task');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown agent');
    });

    it('should fail for non-existent task', async () => {
      const result = await invoker.invokeAgent('dev', 'non-existent-task');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Task not found');
    });
  });

  describe('Agent Support (AC2)', () => {
    it('getSupportedAgents should return all agents', () => {
      const agents = invoker.getSupportedAgents();

      expect(agents.pm).toBeDefined();
      expect(agents.architect).toBeDefined();
      expect(agents.analyst).toBeDefined();
      expect(agents.dev).toBeDefined();
      expect(agents.qa).toBeDefined();
    });

    it('isAgentSupported should return true for supported agents', () => {
      expect(invoker.isAgentSupported('dev')).toBe(true);
      expect(invoker.isAgentSupported('@pm')).toBe(true);
      expect(invoker.isAgentSupported('QA')).toBe(true);
    });

    it('isAgentSupported should return false for unsupported agents', () => {
      expect(invoker.isAgentSupported('unknown')).toBe(false);
      expect(invoker.isAgentSupported('bob')).toBe(false);
    });
  });

  describe('Context Building (AC3)', () => {
    it('should pass inputs to task', async () => {
      const inputs = { key1: 'value1', key2: 'value2' };
      const result = await invoker.invokeAgent('dev', 'sample-task', inputs);

      expect(result.success).toBe(true);
      // The simulated result should complete successfully
    });
  });

  describe('Timeout Handling (AC4)', () => {
    it('should respect timeout setting', () => {
      const inv = new AgentInvoker({
        projectRoot: tempDir,
        defaultTimeout: 1000,
      });

      expect(inv.defaultTimeout).toBe(1000);
    });

    it('should timeout on long execution with custom executor', async () => {
      const inv = new AgentInvoker({
        projectRoot: tempDir,
        defaultTimeout: 100, // Very short timeout
        executor: async () => {
          // Simulate long execution
          await new Promise((resolve) => setTimeout(resolve, 500));
          return { done: true };
        },
      });

      const result = await inv.invokeAgent('dev', 'sample-task');

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    });
  });

  describe('Output Validation (AC5)', () => {
    it('should validate output when schema exists', async () => {
      // Create task with schema
      const tasksDir = path.join(tempDir, '.aiox-core', 'development', 'tasks');
      await fs.writeFile(
        path.join(tasksDir, 'schema-task.md'),
        `---
title: Task with Schema
outputSchema:
  required:
    - result
  properties:
    result:
      type: string
---
# Task with Schema
`,
      );

      const inv = new AgentInvoker({
        projectRoot: tempDir,
        validateOutput: true,
        executor: async () => ({ result: 'success' }),
      });

      const result = await inv.invokeAgent('dev', 'schema-task');
      expect(result.success).toBe(true);
    });
  });

  describe('Retry Logic (AC6)', () => {
    it('should retry on transient errors', async () => {
      let attempts = 0;

      const inv = new AgentInvoker({
        projectRoot: tempDir,
        maxRetries: 3,
        executor: async () => {
          attempts++;
          if (attempts < 2) {
            throw new Error('Timeout error - temporary');
          }
          return { done: true };
        },
      });

      const result = await inv.invokeAgent('dev', 'sample-task');

      expect(result.success).toBe(true);
      expect(attempts).toBe(2);
    });

    it('should not retry on non-transient errors', async () => {
      let attempts = 0;

      const inv = new AgentInvoker({
        projectRoot: tempDir,
        maxRetries: 3,
        executor: async () => {
          attempts++;
          throw new Error('Fatal error');
        },
      });

      const result = await inv.invokeAgent('dev', 'sample-task');

      expect(result.success).toBe(false);
      expect(attempts).toBe(1); // No retries for non-transient
    });
  });

  describe('Logging and Audit (AC7)', () => {
    it('should track all invocations', async () => {
      await invoker.invokeAgent('dev', 'sample-task');
      await invoker.invokeAgent('dev', 'sample-task');

      const invocations = invoker.getInvocations();

      expect(invocations).toHaveLength(2);
      expect(invocations[0].agentName).toBe('dev');
    });

    it('should get invocation by ID', async () => {
      const result = await invoker.invokeAgent('dev', 'sample-task');
      const invocation = invoker.getInvocation(result.invocationId);

      expect(invocation).toBeDefined();
      expect(invocation.id).toBe(result.invocationId);
    });

    it('should get invocations for specific agent', async () => {
      // Create pm agent file
      const agentsDir = path.join(tempDir, '.aiox-core', 'development', 'agents');
      await fs.writeFile(path.join(agentsDir, 'pm.md'), '# PM Agent');

      await invoker.invokeAgent('dev', 'sample-task');
      await invoker.invokeAgent('pm', 'sample-task');
      await invoker.invokeAgent('dev', 'sample-task');

      const devInvocations = invoker.getInvocationsForAgent('dev');
      expect(devInvocations).toHaveLength(2);

      const pmInvocations = invoker.getInvocationsForAgent('@pm');
      expect(pmInvocations).toHaveLength(1);
    });

    it('should generate invocation summary', async () => {
      await invoker.invokeAgent('dev', 'sample-task');
      await invoker.invokeAgent('dev', 'sample-task');

      const summary = invoker.getInvocationSummary();

      expect(summary.total).toBe(2);
      expect(summary.byStatus[InvocationStatus.SUCCESS]).toBe(2);
      expect(summary.byAgent.dev).toBe(2);
      expect(summary.averageDuration).toBeGreaterThanOrEqual(0); // May be 0 for very fast simulated execution
    });

    it('should track logs', async () => {
      await invoker.invokeAgent('dev', 'sample-task');

      const logs = invoker.getLogs();

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toHaveProperty('timestamp');
      expect(logs[0]).toHaveProperty('level');
      expect(logs[0]).toHaveProperty('message');
    });

    it('should clear invocation history', async () => {
      await invoker.invokeAgent('dev', 'sample-task');
      expect(invoker.getInvocations().length).toBeGreaterThan(0);

      invoker.clearInvocations();

      expect(invoker.getInvocations()).toHaveLength(0);
      expect(invoker.getLogs()).toHaveLength(0);
    });
  });

  describe('Event Emitter', () => {
    it('should emit invocationComplete event', async () => {
      let emittedData = null;
      invoker.on('invocationComplete', (data) => {
        emittedData = data;
      });

      await invoker.invokeAgent('dev', 'sample-task');

      expect(emittedData).toBeDefined();
      expect(emittedData.agentName).toBe('dev');
      expect(emittedData.status).toBe(InvocationStatus.SUCCESS);
    });

    it('should emit invocationFailed event', async () => {
      let emittedData = null;
      invoker.on('invocationFailed', (data) => {
        emittedData = data;
      });

      await invoker.invokeAgent('unknown', 'sample-task');

      expect(emittedData).toBeDefined();
      expect(emittedData.status).toBe(InvocationStatus.FAILED);
    });
  });
});

describe('Integration with MasterOrchestrator', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `agent-integration-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    // Create agents directory
    const agentsDir = path.join(tempDir, '.aiox-core', 'development', 'agents');
    await fs.ensureDir(agentsDir);
    await fs.writeFile(path.join(agentsDir, 'dev.md'), '# Dev Agent');
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should integrate AgentInvoker with MasterOrchestrator', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    expect(orchestrator.agentInvoker).toBeDefined();
    expect(orchestrator.agentInvoker).toBeInstanceOf(AgentInvoker);
  });

  it('should expose getAgentInvoker method', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const invoker = orchestrator.getAgentInvoker();
    expect(invoker).toBeDefined();
    expect(invoker).toBeInstanceOf(AgentInvoker);
  });

  it('should expose getSupportedAgents method', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const agents = orchestrator.getSupportedAgents();
    expect(agents.dev).toBeDefined();
    expect(agents.pm).toBeDefined();
  });

  it('should invoke agent through orchestrator', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    // Create tasks directory
    const tasksDir = path.join(tempDir, '.aiox-core', 'development', 'tasks');
    await fs.ensureDir(tasksDir);
    await fs.writeFile(path.join(tasksDir, 'test-task.md'), '# Test Task');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const result = await orchestrator.invokeAgentForTask('dev', 'test-task', { key: 'value' });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
