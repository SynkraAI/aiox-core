/**
 * Unit Tests for SquadExtender
 *
 * Test Coverage:
 * - addComponent() creates component file from template
 * - addComponent() validates inputs correctly
 * - addComponent() updates manifest
 * - updateManifest() preserves existing content
 * - listAgents() returns available agents
 * - Security: path traversal prevention
 * - Security: overwrite protection
 * - Error handling for all error codes
 *
 * @see Story SQS-11: Squad Analyze & Extend
 */

const path = require('path');
const fs = require('fs').promises;
const {
  SquadExtender,
  SquadExtenderError,
  ErrorCodes,
  COMPONENT_CONFIG,
} = require('../../../.aiox-core/development/scripts/squad/squad-extender');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');
const TEMP_PATH = path.join(__dirname, 'temp-extend-test');

describe('SquadExtender', () => {
  let extender;
  let verboseExtender;

  beforeEach(async () => {
    extender = new SquadExtender({ squadsPath: FIXTURES_PATH });
    verboseExtender = new SquadExtender({ squadsPath: FIXTURES_PATH, verbose: true });

    // Create temp directory for tests that modify files
    await fs.mkdir(TEMP_PATH, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Constants', () => {
    it('should export ErrorCodes enum', () => {
      expect(ErrorCodes).toBeDefined();
      expect(ErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(ErrorCodes.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
      expect(ErrorCodes.COMPONENT_EXISTS).toBe('COMPONENT_EXISTS');
      expect(ErrorCodes.INVALID_COMPONENT_NAME).toBe('INVALID_COMPONENT_NAME');
      expect(ErrorCodes.INVALID_COMPONENT_TYPE).toBe('INVALID_COMPONENT_TYPE');
      expect(ErrorCodes.AGENT_NOT_FOUND).toBe('AGENT_NOT_FOUND');
      expect(ErrorCodes.PATH_TRAVERSAL).toBe('PATH_TRAVERSAL');
    });

    it('should export COMPONENT_CONFIG object', () => {
      expect(COMPONENT_CONFIG).toBeDefined();
      expect(COMPONENT_CONFIG.agent).toBeDefined();
      expect(COMPONENT_CONFIG.task).toBeDefined();
      expect(COMPONENT_CONFIG.workflow).toBeDefined();
      expect(COMPONENT_CONFIG.checklist).toBeDefined();
      expect(COMPONENT_CONFIG.template).toBeDefined();
      expect(COMPONENT_CONFIG.tool).toBeDefined();
      expect(COMPONENT_CONFIG.script).toBeDefined();
      expect(COMPONENT_CONFIG.data).toBeDefined();
    });

    it('should have correct configuration for each component type', () => {
      expect(COMPONENT_CONFIG.agent.directory).toBe('agents');
      expect(COMPONENT_CONFIG.agent.extension).toBe('.md');

      expect(COMPONENT_CONFIG.task.directory).toBe('tasks');
      expect(COMPONENT_CONFIG.task.extension).toBe('.md');

      expect(COMPONENT_CONFIG.tool.directory).toBe('tools');
      expect(COMPONENT_CONFIG.tool.extension).toBe('.js');

      expect(COMPONENT_CONFIG.workflow.directory).toBe('workflows');
      expect(COMPONENT_CONFIG.workflow.extension).toBe('.yaml');
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultExtender = new SquadExtender();
      expect(defaultExtender.squadsPath).toBe('./squads');
    });

    it('should use custom squads path when specified', () => {
      expect(extender.squadsPath).toBe(FIXTURES_PATH);
    });

    it('should disable verbose mode by default', () => {
      expect(extender.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      expect(verboseExtender.verbose).toBe(true);
    });
  });

  describe('SquadExtenderError', () => {
    it('should create error with code and message', () => {
      const error = new SquadExtenderError('TEST_ERROR', 'Test message', 'Test suggestion');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.suggestion).toBe('Test suggestion');
      expect(error.name).toBe('SquadExtenderError');
    });

    it('should create squadNotFound error with static method', () => {
      const error = SquadExtenderError.squadNotFound('my-squad');
      expect(error.code).toBe(ErrorCodes.SQUAD_NOT_FOUND);
      expect(error.message).toContain('my-squad');
    });

    it('should create componentExists error with static method', () => {
      const error = SquadExtenderError.componentExists('agents/test.md');
      expect(error.code).toBe(ErrorCodes.COMPONENT_EXISTS);
      expect(error.suggestion).toContain('--force');
    });

    it('should create invalidComponentName error with static method', () => {
      const error = SquadExtenderError.invalidComponentName('Invalid_Name');
      expect(error.code).toBe(ErrorCodes.INVALID_COMPONENT_NAME);
      expect(error.suggestion).toContain('kebab-case');
    });

    it('should create invalidComponentType error with static method', () => {
      const error = SquadExtenderError.invalidComponentType('invalid-type');
      expect(error.code).toBe(ErrorCodes.INVALID_COMPONENT_TYPE);
      expect(error.message).toContain('invalid-type');
    });

    it('should create agentNotFound error with static method', () => {
      const error = SquadExtenderError.agentNotFound('missing-agent', ['agent1', 'agent2']);
      expect(error.code).toBe(ErrorCodes.AGENT_NOT_FOUND);
      expect(error.suggestion).toContain('agent1');
      expect(error.suggestion).toContain('agent2');
    });

    it('should create pathTraversal error with static method', () => {
      const error = SquadExtenderError.pathTraversal('../malicious');
      expect(error.code).toBe(ErrorCodes.PATH_TRAVERSAL);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid component type', async () => {
      await expect(extender.addComponent('extend-test-squad', {
        type: 'invalid-type',
        name: 'test-component',
      })).rejects.toThrow(SquadExtenderError);
    });

    it('should reject invalid component name (uppercase)', async () => {
      await expect(extender.addComponent('extend-test-squad', {
        type: 'agent',
        name: 'InvalidName',
      })).rejects.toThrow(SquadExtenderError);
    });

    it('should reject invalid component name (special chars)', async () => {
      await expect(extender.addComponent('extend-test-squad', {
        type: 'agent',
        name: 'invalid_name!',
      })).rejects.toThrow(SquadExtenderError);
    });

    it('should reject path traversal attempts', async () => {
      await expect(extender.addComponent('extend-test-squad', {
        type: 'agent',
        name: '../malicious',
      })).rejects.toThrow(SquadExtenderError);
    });

    it('should reject backslash path traversal', async () => {
      await expect(extender.addComponent('extend-test-squad', {
        type: 'agent',
        name: '..\\malicious',
      })).rejects.toThrow(SquadExtenderError);
    });

    it('should accept valid kebab-case names', async () => {
      // This tests validation but will fail on file write since we're using fixtures
      // Just checking validation passes
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH });

      // Create a minimal squad structure
      const squadPath = path.join(TEMP_PATH, 'test-squad');
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), 'name: test-squad\nversion: 1.0.0\ncomponents: {}');

      const result = await tempExtender.addComponent('test-squad', {
        type: 'agent',
        name: 'valid-agent-name',
        description: 'Test agent',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('valid-agent-name.md');
    });

    it('should accept single character name', async () => {
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH });

      const squadPath = path.join(TEMP_PATH, 'test-squad-2');
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), 'name: test-squad-2\nversion: 1.0.0\ncomponents: {}');

      const result = await tempExtender.addComponent('test-squad-2', {
        type: 'agent',
        name: 'a',
        description: 'Single char name',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('listAgents()', () => {
    it('should list available agents in squad', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'extend-test-squad');
      const agents = await extender.listAgents(squadPath);

      expect(agents).toContain('test-agent');
    });

    it('should return empty array for non-existent agents directory', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'non-existent');
      const agents = await extender.listAgents(squadPath);

      expect(agents).toEqual([]);
    });
  });

  describe('addComponent() - Task with Agent', () => {
    it('should validate agent exists when adding task', async () => {
      await expect(extender.addComponent('extend-test-squad', {
        type: 'task',
        name: 'new-task',
        agentId: 'non-existent-agent',
      })).rejects.toThrow(SquadExtenderError);
    });

    it('should prepend agent ID to task filename', async () => {
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH });

      // Create squad structure
      const squadPath = path.join(TEMP_PATH, 'task-test-squad');
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });
      await fs.mkdir(path.join(squadPath, 'tasks'), { recursive: true });
      await fs.writeFile(path.join(squadPath, 'agents', 'lead-agent.md'), '# lead-agent');
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), 'name: task-test-squad\nversion: 1.0.0\ncomponents: {}');

      const result = await tempExtender.addComponent('task-test-squad', {
        type: 'task',
        name: 'process-data',
        agentId: 'lead-agent',
        description: 'Process data task',
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('lead-agent-process-data.md');
    });
  });

  describe('addComponent() - Error Cases', () => {
    it('should throw error for non-existent squad', async () => {
      await expect(extender.addComponent('non-existent-squad', {
        type: 'agent',
        name: 'test-agent',
      })).rejects.toThrow(SquadExtenderError);
    });
  });

  describe('updateManifest()', () => {
    it('should add component to manifest', async () => {
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH });

      // Create squad structure
      const squadPath = path.join(TEMP_PATH, 'manifest-test-squad');
      await fs.mkdir(squadPath, { recursive: true });
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), `
name: manifest-test-squad
version: 1.0.0
components:
  agents: []
`);

      const result = await tempExtender.updateManifest(squadPath, {
        type: 'agent',
        file: 'new-agent.md',
      });

      expect(result).toBe(true);

      // Verify manifest was updated
      const content = await fs.readFile(path.join(squadPath, 'squad.yaml'), 'utf8');
      expect(content).toContain('new-agent.md');
    });

    it('should not duplicate existing component', async () => {
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH });

      // Create squad structure
      const squadPath = path.join(TEMP_PATH, 'duplicate-test-squad');
      await fs.mkdir(squadPath, { recursive: true });
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), `
name: duplicate-test-squad
version: 1.0.0
components:
  agents:
    - existing-agent.md
`);

      await tempExtender.updateManifest(squadPath, {
        type: 'agent',
        file: 'existing-agent.md',
      });

      const content = await fs.readFile(path.join(squadPath, 'squad.yaml'), 'utf8');
      const matches = content.match(/existing-agent\.md/g);
      expect(matches).toHaveLength(1);
    });
  });

  describe('Security', () => {
    it('should prevent overwrite without force flag', async () => {
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH });

      // Create squad with existing component
      const squadPath = path.join(TEMP_PATH, 'overwrite-test-squad');
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), 'name: overwrite-test-squad\nversion: 1.0.0\ncomponents: {}');
      await fs.writeFile(path.join(squadPath, 'agents', 'existing-agent.md'), '# Existing');

      await expect(tempExtender.addComponent('overwrite-test-squad', {
        type: 'agent',
        name: 'existing-agent',
      })).rejects.toThrow(SquadExtenderError);
    });

    it('should allow overwrite with force flag', async () => {
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH });

      // Create squad with existing component
      const squadPath = path.join(TEMP_PATH, 'force-test-squad');
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), 'name: force-test-squad\nversion: 1.0.0\ncomponents: {}');
      await fs.writeFile(path.join(squadPath, 'agents', 'existing-agent.md'), '# Existing');

      const result = await tempExtender.addComponent('force-test-squad', {
        type: 'agent',
        name: 'existing-agent',
        description: 'Overwritten agent',
      }, { force: true });

      expect(result.success).toBe(true);

      // Check content was overwritten
      const content = await fs.readFile(path.join(squadPath, 'agents', 'existing-agent.md'), 'utf8');
      expect(content).toContain('Overwritten agent');
    });

    it('should create backup before overwriting', async () => {
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH, verbose: true });

      // Create squad with existing component
      const squadPath = path.join(TEMP_PATH, 'backup-test-squad');
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), 'name: backup-test-squad\nversion: 1.0.0\ncomponents: {}');
      await fs.writeFile(path.join(squadPath, 'agents', 'backup-agent.md'), '# Original');

      await tempExtender.addComponent('backup-test-squad', {
        type: 'agent',
        name: 'backup-agent',
        description: 'Updated',
      }, { force: true });

      // Check backup exists
      const backupPath = path.join(squadPath, 'agents', 'backup-agent.md.bak');
      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
      expect(backupExists).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete addComponent within 500ms', async () => {
      const tempExtender = new SquadExtender({ squadsPath: TEMP_PATH });

      // Create minimal squad
      const squadPath = path.join(TEMP_PATH, 'perf-test-squad');
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });
      await fs.writeFile(path.join(squadPath, 'squad.yaml'), 'name: perf-test-squad\nversion: 1.0.0\ncomponents: {}');

      const start = Date.now();
      await tempExtender.addComponent('perf-test-squad', {
        type: 'agent',
        name: 'perf-agent',
        description: 'Performance test',
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
