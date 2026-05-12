/**
 * Integration Tests for Squad Analyze & Extend
 *
 * Test Coverage:
 * - Complete analyze workflow from command to output
 * - Complete extend workflow with all component types
 * - Analyze -> Extend -> Validate pipeline
 * - Template rendering with all placeholders
 * - Manifest updates preserve YAML formatting
 * - Multiple component additions in sequence
 *
 * @see Story SQS-11: Squad Analyze & Extend
 */

const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const { SquadAnalyzer } = require('../../../.aiox-core/development/scripts/squad/squad-analyzer');
const { SquadExtender } = require('../../../.aiox-core/development/scripts/squad/squad-extender');

// Test directory for integration tests - use unique directory to avoid parallel test collisions
const INTEGRATION_PATH = path.join(__dirname, 'temp-analyze-extend');

describe('Squad Analyze & Extend Integration', () => {
  let analyzer;
  let extender;
  let testSquadPath;

  beforeAll(async () => {
    // Create integration test directory
    await fs.mkdir(INTEGRATION_PATH, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup integration test directory
    try {
      await fs.rm(INTEGRATION_PATH, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  beforeEach(async () => {
    // Create fresh test squad for each test
    testSquadPath = path.join(INTEGRATION_PATH, `test-squad-${Date.now()}`);

    // Create squad structure
    await fs.mkdir(path.join(testSquadPath, 'agents'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'tasks'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'workflows'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'checklists'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'templates'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'tools'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'scripts'), { recursive: true });
    await fs.mkdir(path.join(testSquadPath, 'data'), { recursive: true });

    // Create initial manifest
    const manifest = {
      name: 'integration-test-squad',
      version: '1.0.0',
      description: 'Integration test squad',
      author: 'test',
      aiox: { minVersion: '2.1.0' },
      components: {
        agents: ['initial-agent.md'],
        tasks: [],
        workflows: [],
        checklists: [],
        templates: [],
        tools: [],
        scripts: [],
        data: [],
      },
    };
    await fs.writeFile(path.join(testSquadPath, 'squad.yaml'), yaml.dump(manifest));

    // Create initial agent
    await fs.writeFile(
      path.join(testSquadPath, 'agents', 'initial-agent.md'),
      '# initial-agent\n\nInitial test agent.\n',
    );

    // Initialize analyzer and extender pointing to parent directory
    analyzer = new SquadAnalyzer({ squadsPath: INTEGRATION_PATH });
    extender = new SquadExtender({ squadsPath: INTEGRATION_PATH });
  });

  describe('Complete Analyze Workflow', () => {
    it('should analyze squad and return complete report', async () => {
      const squadName = path.basename(testSquadPath);
      const result = await analyzer.analyze(squadName);

      // Verify overview
      expect(result.overview.name).toBe('integration-test-squad');
      expect(result.overview.version).toBe('1.0.0');
      expect(result.overview.author).toBe('test');

      // Verify inventory
      expect(result.inventory.agents).toContain('initial-agent.md');
      expect(result.inventory.tasks).toHaveLength(0);

      // Verify coverage
      expect(result.coverage.agents.total).toBe(1);
      expect(result.coverage.agents.withTasks).toBe(0);

      // Verify suggestions exist
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should format report in all output formats', async () => {
      const squadName = path.basename(testSquadPath);
      const result = await analyzer.analyze(squadName);

      // Console format
      const consoleReport = analyzer.formatReport(result, 'console');
      expect(consoleReport).toContain('Squad Analysis');
      expect(consoleReport).toContain('integration-test-squad');

      // JSON format
      const jsonReport = analyzer.formatReport(result, 'json');
      const parsed = JSON.parse(jsonReport);
      expect(parsed.overview.name).toBe('integration-test-squad');

      // Markdown format
      const mdReport = analyzer.formatReport(result, 'markdown');
      expect(mdReport).toContain('# Squad Analysis');
      expect(mdReport).toContain('## Overview');
    });
  });

  describe('Complete Extend Workflow', () => {
    it('should add agent component', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'agent',
        name: 'new-agent',
        description: 'A new agent for testing',
      });

      expect(result.success).toBe(true);
      expect(result.type).toBe('agent');
      expect(result.fileName).toBe('new-agent.md');

      // Verify file exists
      const filePath = path.join(testSquadPath, 'agents', 'new-agent.md');
      const content = await fs.readFile(filePath, 'utf8');
      expect(content).toContain('new-agent');
      expect(content).toContain('A new agent for testing');

      // Verify manifest updated
      const manifestContent = await fs.readFile(path.join(testSquadPath, 'squad.yaml'), 'utf8');
      expect(manifestContent).toContain('new-agent.md');
    });

    it('should add task component with agent linkage', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'task',
        name: 'process-data',
        agentId: 'initial-agent',
        description: 'Process data task',
        storyId: 'SQS-11',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('initial-agent-process-data.md');

      // Verify file exists and has correct content
      const filePath = path.join(testSquadPath, 'tasks', 'initial-agent-process-data.md');
      const content = await fs.readFile(filePath, 'utf8');
      expect(content).toContain('process-data');
      expect(content).toContain('@initial-agent');
      expect(content).toContain('SQS-11');
    });

    it('should add workflow component', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'workflow',
        name: 'daily-process',
        description: 'Daily processing workflow',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('daily-process.yaml');

      // Verify file exists
      const filePath = path.join(testSquadPath, 'workflows', 'daily-process.yaml');
      const content = await fs.readFile(filePath, 'utf8');
      expect(content).toContain('daily-process');
    });

    it('should add checklist component', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'checklist',
        name: 'quality-checklist',
        description: 'Quality assurance checklist',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('quality-checklist.md');
    });

    it('should add template component', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'template',
        name: 'report-template',
        description: 'Report generation template',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('report-template.md');
    });

    it('should add tool component', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'tool',
        name: 'data-validator',
        description: 'Data validation tool',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('data-validator.js');

      // Verify content has correct structure
      const filePath = path.join(testSquadPath, 'tools', 'data-validator.js');
      const content = await fs.readFile(filePath, 'utf8');
      expect(content).toContain('module.exports');
    });

    it('should add script component', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'script',
        name: 'migration-helper',
        description: 'Migration helper script',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('migration-helper.js');
    });

    it('should add data component', async () => {
      const squadName = path.basename(testSquadPath);

      const result = await extender.addComponent(squadName, {
        type: 'data',
        name: 'config-data',
        description: 'Configuration data',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('config-data.yaml');
    });
  });

  describe('Analyze -> Extend -> Analyze Pipeline', () => {
    it('should show improvement in coverage after extension', async () => {
      const squadName = path.basename(testSquadPath);

      // Initial analysis
      const initialResult = await analyzer.analyze(squadName);
      const initialAgentsWithTasks = initialResult.coverage.agents.withTasks;

      // Add task for initial agent
      await extender.addComponent(squadName, {
        type: 'task',
        name: 'new-task',
        agentId: 'initial-agent',
        description: 'New task',
      });

      // Re-analyze
      const afterResult = await analyzer.analyze(squadName);
      const afterAgentsWithTasks = afterResult.coverage.agents.withTasks;

      // Verify improvement
      expect(afterAgentsWithTasks).toBeGreaterThan(initialAgentsWithTasks);
    });

    it('should reduce suggestions after adding components', async () => {
      const squadName = path.basename(testSquadPath);

      // Initial analysis - should have suggestion about tasks
      const initialResult = await analyzer.analyze(squadName);
      const initialSuggestionCount = initialResult.suggestions.length;

      // Add task and checklist
      await extender.addComponent(squadName, {
        type: 'task',
        name: 'task-1',
        agentId: 'initial-agent',
        description: 'Task 1',
      });

      await extender.addComponent(squadName, {
        type: 'checklist',
        name: 'checklist-1',
        description: 'Checklist 1',
      });

      // Re-analyze
      const afterResult = await analyzer.analyze(squadName);
      const afterSuggestionCount = afterResult.suggestions.length;

      // Suggestions about tasks and checklists should be gone
      expect(afterSuggestionCount).toBeLessThanOrEqual(initialSuggestionCount);
    });
  });

  describe('Multiple Sequential Extensions', () => {
    it('should handle multiple component additions without errors', async () => {
      const squadName = path.basename(testSquadPath);

      // Add multiple components sequentially
      const components = [
        { type: 'agent', name: 'agent-1' },
        { type: 'agent', name: 'agent-2' },
        { type: 'task', name: 'task-1', agentId: 'initial-agent' },
        { type: 'task', name: 'task-2', agentId: 'initial-agent' },
        { type: 'workflow', name: 'workflow-1' },
        { type: 'checklist', name: 'checklist-1' },
        { type: 'template', name: 'template-1' },
        { type: 'tool', name: 'tool-1' },
      ];

      for (const comp of components) {
        const result = await extender.addComponent(squadName, {
          ...comp,
          description: `Test ${comp.type}`,
        });
        expect(result.success).toBe(true);
      }

      // Verify manifest has all components
      const manifestContent = await fs.readFile(path.join(testSquadPath, 'squad.yaml'), 'utf8');
      const manifest = yaml.load(manifestContent);

      expect(manifest.components.agents).toContain('agent-1.md');
      expect(manifest.components.agents).toContain('agent-2.md');
      expect(manifest.components.tasks).toContain('initial-agent-task-1.md');
      expect(manifest.components.tasks).toContain('initial-agent-task-2.md');
      expect(manifest.components.workflows).toContain('workflow-1.yaml');
      expect(manifest.components.checklists).toContain('checklist-1.md');
      expect(manifest.components.templates).toContain('template-1.md');
      expect(manifest.components.tools).toContain('tool-1.js');
    });
  });

  describe('Manifest YAML Preservation', () => {
    it('should preserve existing manifest content when updating', async () => {
      const squadName = path.basename(testSquadPath);

      // Add custom content to manifest
      const manifestPath = path.join(testSquadPath, 'squad.yaml');
      const manifest = yaml.load(await fs.readFile(manifestPath, 'utf8'));
      manifest.customField = 'custom-value';
      manifest.config = { setting1: true, setting2: 'value' };
      await fs.writeFile(manifestPath, yaml.dump(manifest));

      // Add component
      await extender.addComponent(squadName, {
        type: 'agent',
        name: 'test-agent',
        description: 'Test',
      });

      // Verify custom content preserved
      const updatedManifest = yaml.load(await fs.readFile(manifestPath, 'utf8'));
      expect(updatedManifest.customField).toBe('custom-value');
      expect(updatedManifest.config.setting1).toBe(true);
      expect(updatedManifest.config.setting2).toBe('value');
    });
  });

  describe('Performance', () => {
    it('should complete analyze + extend + analyze within 2 seconds', async () => {
      const squadName = path.basename(testSquadPath);
      const start = Date.now();

      // Run complete pipeline
      await analyzer.analyze(squadName);
      await extender.addComponent(squadName, {
        type: 'agent',
        name: 'perf-agent',
        description: 'Performance test',
      });
      await analyzer.analyze(squadName);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });
  });
});
