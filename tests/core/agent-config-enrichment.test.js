/**
 * Tests for Story ACT-8: Agent Config Loading + Document Governance
 *
 * Test Coverage:
 * - All 7 data files exist on disk
 * - Enriched agents load correct files from agent-config-requirements.yaml
 * - YAML parses correctly after enrichment
 * - All files referenced in config exist on disk
 * - Performance targets documented for all agents
 * - source-tree.md governance section contains all required files
 * - update-source-tree.md task file exists
 * - aiox-master has *update-source-tree command
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Helper: load and parse YAML file
 */
function loadYaml(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(content);
}

/**
 * Helper: read file content
 */
function readFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Helper: check file exists
 */
function fileExists(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  return fs.existsSync(fullPath);
}

describe('Story ACT-8: Agent Config Enrichment', () => {
  let agentConfig;

  beforeAll(() => {
    agentConfig = loadYaml('.aiox-core/data/agent-config-requirements.yaml');
  });

  describe('YAML Validity', () => {
    test('agent-config-requirements.yaml parses without errors', () => {
      expect(agentConfig).toBeDefined();
      expect(agentConfig.agents).toBeDefined();
      expect(typeof agentConfig.agents).toBe('object');
    });

    test('all expected agents have entries', () => {
      const expectedAgents = [
        'aiox-master', 'dev', 'qa', 'devops', 'github-devops',
        'architect', 'po', 'sm', 'data-engineer', 'db-sage',
        'pm', 'analyst', 'ux-design-expert', 'squad-creator',
        'aiox-developer', 'aiox-orchestrator', 'default',
      ];

      for (const agentId of expectedAgents) {
        expect(agentConfig.agents).toHaveProperty(agentId);
      }
    });
  });

  describe('7 Required Data Files Exist on Disk', () => {
    const requiredFiles = [
      { path: 'docs/framework/coding-standards.md', owner: '@dev' },
      { path: 'docs/framework/tech-stack.md', owner: '@architect' },
      { path: '.aiox-core/data/technical-preferences.md', owner: '@architect' },
      { path: '.aiox-core/product/data/test-levels-framework.md', owner: '@qa' },
      { path: '.aiox-core/product/data/test-priorities-matrix.md', owner: '@qa' },
      { path: '.aiox-core/product/data/brainstorming-techniques.md', owner: '@analyst' },
      { path: '.aiox-core/product/data/elicitation-methods.md', owner: '@po' },
    ];

    test.each(requiredFiles)('$path exists on disk (owner: $owner)', ({ path: filePath }) => {
      expect(fileExists(filePath)).toBe(true);
    });
  });

  describe('All Files Referenced in Config Exist', () => {
    test('every files_loaded path resolves to an existing file', () => {
      const missing = [];

      for (const [agentId, config] of Object.entries(agentConfig.agents)) {
        for (const fileEntry of (config.files_loaded || [])) {
          const fp = typeof fileEntry === 'string' ? fileEntry : fileEntry.path;
          if (fp && !fileExists(fp)) {
            missing.push({ agent: agentId, file: fp });
          }
        }
      }

      expect(missing).toEqual([]);
    });
  });

  describe('Enriched Agent: @pm', () => {
    test('pm now loads coding-standards.md and tech-stack.md', () => {
      const pm = agentConfig.agents.pm;
      expect(pm.files_loaded).toBeDefined();
      expect(pm.files_loaded.length).toBe(2);

      const paths = pm.files_loaded.map(f => f.path);
      expect(paths).toContain('docs/framework/coding-standards.md');
      expect(paths).toContain('docs/framework/tech-stack.md');
    });

    test('pm performance target is <100ms', () => {
      expect(agentConfig.agents.pm.performance_target).toBe('<100ms');
    });
  });

  describe('Enriched Agent: @ux-design-expert', () => {
    test('ux-design-expert now loads tech-stack.md and coding-standards.md', () => {
      const ux = agentConfig.agents['ux-design-expert'];
      expect(ux.files_loaded).toBeDefined();
      expect(ux.files_loaded.length).toBe(2);

      const paths = ux.files_loaded.map(f => f.path);
      expect(paths).toContain('docs/framework/tech-stack.md');
      expect(paths).toContain('docs/framework/coding-standards.md');
    });

    test('ux-design-expert performance target is <100ms', () => {
      expect(agentConfig.agents['ux-design-expert'].performance_target).toBe('<100ms');
    });
  });

  describe('Enriched Agent: @analyst', () => {
    test('analyst now loads brainstorming-techniques, tech-stack, and source-tree', () => {
      const analyst = agentConfig.agents.analyst;
      expect(analyst.files_loaded).toBeDefined();
      expect(analyst.files_loaded.length).toBe(3);

      const paths = analyst.files_loaded.map(f => f.path);
      expect(paths).toContain('.aiox-core/product/data/brainstorming-techniques.md');
      expect(paths).toContain('docs/framework/tech-stack.md');
      expect(paths).toContain('docs/framework/source-tree.md');
    });

    test('analyst performance target is <100ms', () => {
      expect(agentConfig.agents.analyst.performance_target).toBe('<100ms');
    });
  });

  describe('Enriched Agent: @sm', () => {
    test('sm now loads mode-selection, workflow-patterns, and coding-standards', () => {
      const sm = agentConfig.agents.sm;
      expect(sm.files_loaded).toBeDefined();
      expect(sm.files_loaded.length).toBe(3);

      const paths = sm.files_loaded.map(f => f.path);
      expect(paths).toContain('.aiox-core/product/data/mode-selection-best-practices.md');
      expect(paths).toContain('.aiox-core/data/workflow-patterns.yaml');
      expect(paths).toContain('docs/framework/coding-standards.md');
    });

    test('sm performance target is <75ms', () => {
      expect(agentConfig.agents.sm.performance_target).toBe('<75ms');
    });
  });

  describe('Enriched Agent: @squad-creator', () => {
    test('squad-creator has explicit entry (not default)', () => {
      const sc = agentConfig.agents['squad-creator'];
      expect(sc).toBeDefined();
      expect(sc.config_sections).toContain('squadsTemplateLocation');
    });

    test('squad-creator has lazy loading for registry and manifest', () => {
      const sc = agentConfig.agents['squad-creator'];
      expect(sc.lazy_loading).toHaveProperty('agent_registry', true);
      expect(sc.lazy_loading).toHaveProperty('squad_manifest', true);
    });

    test('squad-creator performance target is <150ms', () => {
      expect(agentConfig.agents['squad-creator'].performance_target).toBe('<150ms');
    });
  });

  describe('Shared Files Consumers Updated', () => {
    test('coding-standards.md lists pm, ux-design-expert, sm as users', () => {
      const csFile = agentConfig.lazy_loading_strategy.shared_files.find(
        f => f.path === 'docs/framework/coding-standards.md',
      );
      expect(csFile).toBeDefined();
      expect(csFile.used_by).toContain('pm');
      expect(csFile.used_by).toContain('ux-design-expert');
      expect(csFile.used_by).toContain('sm');
    });

    test('tech-stack.md lists pm, ux-design-expert, analyst as users', () => {
      const tsFile = agentConfig.lazy_loading_strategy.shared_files.find(
        f => f.path === 'docs/framework/tech-stack.md',
      );
      expect(tsFile).toBeDefined();
      expect(tsFile.used_by).toContain('pm');
      expect(tsFile.used_by).toContain('ux-design-expert');
      expect(tsFile.used_by).toContain('analyst');
    });

    test('source-tree.md lists analyst as user', () => {
      const stFile = agentConfig.lazy_loading_strategy.shared_files.find(
        f => f.path === 'docs/framework/source-tree.md',
      );
      expect(stFile).toBeDefined();
      expect(stFile.used_by).toContain('analyst');
    });
  });

  describe('Performance Targets', () => {
    test('every agent has a performance_target', () => {
      for (const [agentId, config] of Object.entries(agentConfig.agents)) {
        expect(config).toHaveProperty('performance_target');
        expect(config.performance_target).toMatch(/^<\d+ms$/);
      }
    });
  });
});

describe('Story ACT-8: Document Governance', () => {
  describe('source-tree.md Governance Section', () => {
    let sourceTreeContent;

    beforeAll(() => {
      sourceTreeContent = readFile('docs/framework/source-tree.md');
    });

    test('source-tree.md contains Data File Governance section', () => {
      expect(sourceTreeContent).toContain('## Data File Governance');
    });

    test('source-tree.md documents coding-standards.md', () => {
      expect(sourceTreeContent).toContain('coding-standards.md');
      expect(sourceTreeContent).toContain('@dev');
    });

    test('source-tree.md documents tech-stack.md', () => {
      expect(sourceTreeContent).toContain('tech-stack.md');
      expect(sourceTreeContent).toContain('@architect');
    });

    test('source-tree.md documents technical-preferences.md', () => {
      expect(sourceTreeContent).toContain('technical-preferences.md');
    });

    test('source-tree.md documents test-levels-framework.md', () => {
      expect(sourceTreeContent).toContain('test-levels-framework.md');
      expect(sourceTreeContent).toContain('@qa');
    });

    test('source-tree.md documents test-priorities-matrix.md', () => {
      expect(sourceTreeContent).toContain('test-priorities-matrix.md');
    });

    test('source-tree.md documents brainstorming-techniques.md', () => {
      expect(sourceTreeContent).toContain('brainstorming-techniques.md');
      expect(sourceTreeContent).toContain('@analyst');
    });

    test('source-tree.md documents elicitation-methods.md', () => {
      expect(sourceTreeContent).toContain('elicitation-methods.md');
      expect(sourceTreeContent).toContain('@po');
    });
  });

  describe('Governance Task', () => {
    test('update-source-tree.md task file exists', () => {
      expect(fileExists('.aiox-core/development/tasks/update-source-tree.md')).toBe(true);
    });

    test('task file contains expected sections', () => {
      const content = readFile('.aiox-core/development/tasks/update-source-tree.md');
      expect(content).toContain('Update Source Tree Task');
      expect(content).toContain('Validate document governance');
      expect(content).toContain('agent-config-requirements.yaml');
      expect(content).toContain('source-tree.md');
    });
  });

  describe('aiox-master Command', () => {
    test('aiox-master.md contains *update-source-tree command', () => {
      const content = readFile('.aiox-core/development/agents/aiox-master.md');
      expect(content).toContain('update-source-tree');
      expect(content).toContain('Validate data file governance');
    });

    test('aiox-master dependencies include update-source-tree.md', () => {
      const content = readFile('.aiox-core/development/agents/aiox-master.md');
      expect(content).toContain('update-source-tree.md');
    });
  });
});
