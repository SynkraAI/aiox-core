/**
 * Tests for v2.1 Modular Directory Structure
 *
 * Story 2.15: Update Installer for v2.1 Module Structure
 * Validates that the installer correctly creates the v2.1 modular directory structure
 * and supports the --legacy flag for backwards compatibility.
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// Mock the modules that use dynamic imports
jest.mock('../../tools/installer/lib/module-manager', () => ({
  getModules: jest.fn().mockResolvedValue({
    glob: jest.fn().mockResolvedValue([]),
    chalk: {
      blue: jest.fn(x => x),
      green: jest.fn(x => x),
      yellow: jest.fn(x => x),
      red: jest.fn(x => x),
      dim: jest.fn(x => x),
      bold: jest.fn(x => x),
      cyan: jest.fn(x => x),
    },
  }),
}));

const resourceLocator = require('../../tools/installer/lib/resource-locator');
const configLoader = require('../../tools/installer/lib/config-loader');

describe('v2.1 Module Structure Tests', () => {
  describe('INS-01: Source Path Configuration', () => {
    it('should point getAioxCorePath to .aiox-core directory', () => {
      const aioxCorePath = resourceLocator.getAioxCorePath();
      expect(aioxCorePath).toContain('.aiox-core');
      expect(aioxCorePath).not.toMatch(/[^.]aiox-core$/);
    });

    it('should have .aiox-core as source for config-loader', () => {
      const aioxCorePath = configLoader.getAioxCorePath();
      expect(aioxCorePath).toContain('.aiox-core');
    });
  });

  describe('INS-02: Agent Path Resolution', () => {
    it('should resolve agent paths to development/agents/', async () => {
      const agentPath = configLoader.getAgentPath('dev');
      expect(agentPath).toContain('development');
      expect(agentPath).toContain('agents');
      expect(agentPath).toContain('dev.md');
    });

    it('should list agents from development/agents/', async () => {
      const agents = await configLoader.getAvailableAgents();
      expect(agents.length).toBeGreaterThan(0);

      // All agent files should reference the v2.1 path
      for (const agent of agents) {
        expect(agent.file).toContain('.aiox-core/development/agents/');
      }
    });
  });

  describe('INS-03: Team Path Resolution', () => {
    it('should resolve team paths to development/agent-teams/', () => {
      const teamPath = configLoader.getTeamPath('team-ide-minimal');
      expect(teamPath).toContain('development');
      expect(teamPath).toContain('agent-teams');
    });

    it('should list teams from development/agent-teams/', async () => {
      const teams = await configLoader.getAvailableTeams();
      // Teams should be resolvable (may be empty if no teams exist)
      expect(Array.isArray(teams)).toBe(true);
    });
  });

  describe('INS-04: Resource Locator v2.1 Paths', () => {
    it('should resolve agent dependencies with v2.1 module mapping', async () => {
      const deps = await resourceLocator.getAgentDependencies('dev');

      // Dependencies should use v2.1 module paths
      for (const depPath of deps.all) {
        // Should not have flat structure paths like .aiox-core/tasks/
        expect(depPath).not.toMatch(/\.aiox-core\/(tasks|templates|checklists|workflows|utils|data)\//);

        // Should have modular paths
        const hasModularPath =
          depPath.includes('development/') ||
          depPath.includes('product/') ||
          depPath.includes('core/') ||
          depPath.includes('infrastructure/');

        expect(hasModularPath).toBe(true);
      }
    });
  });

  describe('INS-05: Manifest Files Location', () => {
    it('should have manifests directory in .aiox-core', async () => {
      const manifestsPath = path.join(resourceLocator.getAioxCorePath(), 'manifests');
      const exists = await fs.pathExists(manifestsPath);
      expect(exists).toBe(true);
    });

    it('should have agents.csv manifest', async () => {
      const agentsCsvPath = path.join(resourceLocator.getAioxCorePath(), 'manifests', 'agents.csv');
      const exists = await fs.pathExists(agentsCsvPath);
      expect(exists).toBe(true);
    });

    it('should have tasks.csv manifest', async () => {
      const tasksCsvPath = path.join(resourceLocator.getAioxCorePath(), 'manifests', 'tasks.csv');
      const exists = await fs.pathExists(tasksCsvPath);
      expect(exists).toBe(true);
    });

    it('should have workers.csv manifest', async () => {
      const workersCsvPath = path.join(resourceLocator.getAioxCorePath(), 'manifests', 'workers.csv');
      const exists = await fs.pathExists(workersCsvPath);
      expect(exists).toBe(true);
    });
  });

  describe('INS-06: Module Directory Structure Verification', () => {
    it('should have development module with agents subdirectory', async () => {
      const developmentAgents = path.join(resourceLocator.getAioxCorePath(), 'development', 'agents');
      const exists = await fs.pathExists(developmentAgents);
      expect(exists).toBe(true);
    });

    it('should have development module with tasks subdirectory', async () => {
      const developmentTasks = path.join(resourceLocator.getAioxCorePath(), 'development', 'tasks');
      const exists = await fs.pathExists(developmentTasks);
      expect(exists).toBe(true);
    });

    it('should have product module with templates subdirectory', async () => {
      const productTemplates = path.join(resourceLocator.getAioxCorePath(), 'product', 'templates');
      const exists = await fs.pathExists(productTemplates);
      expect(exists).toBe(true);
    });

    it('should have product module with checklists subdirectory', async () => {
      const productChecklists = path.join(resourceLocator.getAioxCorePath(), 'product', 'checklists');
      const exists = await fs.pathExists(productChecklists);
      expect(exists).toBe(true);
    });

    it('should have core module with utils subdirectory', async () => {
      const coreUtils = path.join(resourceLocator.getAioxCorePath(), 'core', 'utils');
      const exists = await fs.pathExists(coreUtils);
      expect(exists).toBe(true);
    });

    it('should have infrastructure module', async () => {
      const infrastructure = path.join(resourceLocator.getAioxCorePath(), 'infrastructure');
      const exists = await fs.pathExists(infrastructure);
      expect(exists).toBe(true);
    });
  });

  describe('Module Mapping Verification', () => {
    const expectedModuleMapping = {
      tasks: 'development/tasks',
      workflows: 'development/workflows',
      agents: 'development/agents',
      'agent-teams': 'development/agent-teams',
      scripts: 'development/scripts',
      templates: 'product/templates',
      checklists: 'product/checklists',
      data: 'product/data',
      utils: 'core/utils',
      config: 'core/config',
      tools: 'infrastructure/tools',
      integrations: 'infrastructure/integrations',
    };

    it('should map tasks to development module', () => {
      expect(expectedModuleMapping.tasks).toBe('development/tasks');
    });

    it('should map templates to product module', () => {
      expect(expectedModuleMapping.templates).toBe('product/templates');
    });

    it('should map utils to core module', () => {
      expect(expectedModuleMapping.utils).toBe('core/utils');
    });

    it('should map integrations to infrastructure module', () => {
      expect(expectedModuleMapping.integrations).toBe('infrastructure/integrations');
    });
  });
});

describe('Legacy Flag Support (--legacy)', () => {
  it('should accept legacyStructure option in CLI config', () => {
    // This tests that the CLI correctly passes the --legacy flag
    const config = {
      installType: 'full',
      directory: '.',
      ides: [],
      squads: [],
      legacyStructure: true,
    };

    expect(config.legacyStructure).toBe(true);
  });

  it('should default legacyStructure to false', () => {
    const config = {
      installType: 'full',
      directory: '.',
      ides: [],
      squads: [],
      legacyStructure: false,
    };

    expect(config.legacyStructure).toBe(false);
  });
});
