'use strict';

let mockIsAvailable = false;
let mockAnalyzeResult = null;
let mockRegistryData = null;

const mockClient = {
  analyzeDependencies: jest.fn().mockImplementation(async () => mockAnalyzeResult),
};

jest.mock('../../.aios-core/core/code-intel', () => ({
  getClient: () => mockClient,
  isCodeIntelAvailable: () => mockIsAvailable,
}));

jest.mock('../../.aios-core/core/ids/registry-loader', () => ({
  RegistryLoader: jest.fn().mockImplementation(() => ({
    load: () => mockRegistryData,
  })),
}));

const { CodeIntelSource, _classifyScript, _detectCategory } = require('../../.aios-core/core/graph-dashboard/data-sources/code-intel-source');

describe('CodeIntelSource', () => {
  let source;

  beforeEach(() => {
    source = new CodeIntelSource({ cacheTTL: 0 });
    mockIsAvailable = false;
    mockAnalyzeResult = null;
    mockClient.analyzeDependencies.mockImplementation(async () => mockAnalyzeResult);
    mockRegistryData = {
      metadata: { entityCount: 3, lastUpdated: '2026-01-01' },
      entities: {
        tasks: {
          'task-a': { path: 'tasks/a.md', type: 'task', purpose: 'A', dependencies: ['task-b'], usedBy: [] },
          'task-b': { path: 'tasks/b.md', type: 'task', purpose: 'B', dependencies: [], usedBy: ['task-a'] },
        },
        agents: {
          dev: { path: 'agents/dev.md', type: 'agent', purpose: 'Dev', dependencies: ['task-a'], usedBy: [] },
        },
      },
    };
  });

  describe('getData - fallback to registry', () => {
    it('should return registry data when code-intel is unavailable', async () => {
      mockIsAvailable = false;
      const result = await source.getData();

      expect(result.source).toBe('registry');
      expect(result.isFallback).toBe(true);
      expect(result.nodes.length).toBe(3);
      expect(result.edges.length).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should group nodes by category from registry', async () => {
      const result = await source.getData();
      const categories = [...new Set(result.nodes.map((n) => n.category))];

      expect(categories).toContain('tasks');
      expect(categories).toContain('agents');
    });

    it('should create edges from dependencies', async () => {
      const result = await source.getData();
      const dependsEdges = result.edges.filter((e) => e.type === 'depends');

      expect(dependsEdges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ from: 'task-a', to: 'task-b', type: 'depends' }),
          expect.objectContaining({ from: 'dev', to: 'task-a', type: 'depends' }),
        ])
      );
    });

    it('should deduplicate edges from dependencies + usedBy', async () => {
      const result = await source.getData();
      const edgeKeys = result.edges.map((e) => `${e.from}->${e.type}->${e.to}`);
      const uniqueKeys = [...new Set(edgeKeys)];

      expect(edgeKeys.length).toBe(uniqueKeys.length);
    });
  });

  describe('getData - code-intel provider', () => {
    it('should use code-intel when available', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = {
        nodes: [{ id: 'foo', label: 'foo', type: 'module', path: 'foo.js', category: 'modules' }],
        edges: [{ from: 'foo', to: 'bar', type: 'depends' }],
      };

      const result = await source.getData();

      expect(result.source).toBe('code-intel');
      expect(result.isFallback).toBe(false);
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
    });

    it('should fall back to registry if code-intel throws', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = null;

      // Force analyzeDependencies to throw
      mockClient.analyzeDependencies.mockRejectedValueOnce(new Error('Provider offline'));

      const result = await source.getData();

      expect(result.source).toBe('registry');
      expect(result.isFallback).toBe(true);
    });
  });

  describe('getData - normalization', () => {
    it('should handle array-format dependencies', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = [
        { id: 'a', name: 'a', type: 'task', path: 'a.md', dependencies: ['b'] },
        { id: 'b', name: 'b', type: 'task', path: 'b.md', dependencies: [] },
      ];

      const result = await source.getData();

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toEqual(
        expect.arrayContaining([expect.objectContaining({ from: 'a', to: 'b' })])
      );
    });

    it('should handle null/undefined deps gracefully', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = null;

      mockClient.analyzeDependencies.mockResolvedValueOnce(null);

      const result = await source.getData();

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should handle flat object with dependencies property', async () => {
      mockIsAvailable = true;
      mockAnalyzeResult = {
        dependencies: {
          'mod-x': { type: 'module', path: 'x.js', dependencies: ['mod-y'] },
          'mod-y': { type: 'module', path: 'y.js' },
        },
      };

      const result = await source.getData();

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'mod-x' }),
          expect.objectContaining({ id: 'mod-y' }),
        ])
      );
      expect(result.edges).toEqual(
        expect.arrayContaining([expect.objectContaining({ from: 'mod-x', to: 'mod-y' })])
      );
    });
  });

  describe('getData - registry fallback error', () => {
    it('should return empty graph when RegistryLoader throws', async () => {
      mockRegistryData = null;
      const { RegistryLoader } = require('../../.aios-core/core/ids/registry-loader');
      RegistryLoader.mockImplementationOnce(() => ({
        load: () => { throw new Error('Registry file missing'); },
      }));

      const result = await source.getData();

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(result.source).toBe('registry');
      expect(result.isFallback).toBe(true);
    });
  });

  describe('getData - empty registry', () => {
    it('should handle empty registry gracefully', async () => {
      mockRegistryData = { metadata: { entityCount: 0 }, entities: {} };

      const result = await source.getData();

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(result.isFallback).toBe(true);
    });
  });

  describe('_classifyScript', () => {
    it('should classify development scripts as scripts/task', () => {
      expect(_classifyScript('.aios-core/development/scripts/build.js')).toBe('scripts/task');
    });

    it('should classify core scripts as scripts/engine', () => {
      expect(_classifyScript('.aios-core/core/graph-dashboard/cli.js')).toBe('scripts/engine');
    });

    it('should classify infrastructure scripts as scripts/infra', () => {
      expect(_classifyScript('.aios-core/infrastructure/ci/deploy.js')).toBe('scripts/infra');
    });

    it('should default to scripts/task for unknown paths', () => {
      expect(_classifyScript('some/random/script.js')).toBe('scripts/task');
    });
  });

  describe('_detectCategory', () => {
    it('should detect checklists from path', () => {
      expect(_detectCategory('other', '.aios-core/development/checklists/pre-push.md')).toBe('checklists');
    });

    it('should detect workflows from path', () => {
      expect(_detectCategory('other', '.aios-core/development/workflows/deploy.yaml')).toBe('workflows');
    });

    it('should detect utils from path', () => {
      expect(_detectCategory('other', '.aios-core/utils/helper.js')).toBe('utils');
    });

    it('should detect data from path', () => {
      expect(_detectCategory('other', '.aios-core/data/entity-registry.yaml')).toBe('data');
    });

    it('should detect tools from path', () => {
      expect(_detectCategory('other', '.aios-core/development/tools/coderabbit.md')).toBe('tools');
    });

    it('should subcategorize scripts by directory', () => {
      expect(_detectCategory('scripts', '.aios-core/development/scripts/build.js')).toBe('scripts/task');
      expect(_detectCategory('scripts', '.aios-core/core/code-intel/index.js')).toBe('scripts/engine');
      expect(_detectCategory('scripts', '.aios-core/infrastructure/ci/lint.js')).toBe('scripts/infra');
    });

    it('should return base category when no path match', () => {
      expect(_detectCategory('agents', '.aios-core/development/agents/dev.md')).toBe('agents');
      expect(_detectCategory('tasks', '.aios-core/development/tasks/build.md')).toBe('tasks');
    });

    it('should handle empty path gracefully', () => {
      expect(_detectCategory('agents', '')).toBe('agents');
      expect(_detectCategory('tasks', undefined)).toBe('tasks');
    });
  });

  describe('getData - category detection in registry', () => {
    it('should apply _detectCategory to registry entities', async () => {
      mockRegistryData = {
        metadata: { entityCount: 2 },
        entities: {
          scripts: {
            'build-script': { path: '.aios-core/development/scripts/build.js', type: 'script', dependencies: [] },
            'engine-script': { path: '.aios-core/core/graph-dashboard/cli.js', type: 'script', dependencies: [] },
          },
          other: {
            'my-checklist': { path: '.aios-core/development/checklists/pre-push.md', type: 'checklist', dependencies: [] },
          },
        },
      };

      const result = await source.getData();
      const buildNode = result.nodes.find((n) => n.id === 'build-script');
      const engineNode = result.nodes.find((n) => n.id === 'engine-script');
      const checklistNode = result.nodes.find((n) => n.id === 'my-checklist');

      expect(buildNode.category).toBe('scripts/task');
      expect(engineNode.category).toBe('scripts/engine');
      expect(checklistNode.category).toBe('checklists');
    });
  });

  describe('getData - lifecycle field in registry nodes', () => {
    it('should include lifecycle from registry entity data', async () => {
      mockRegistryData = {
        metadata: { entityCount: 3 },
        entities: {
          agents: {
            'dev-agent': { path: '.aios-core/agents/dev.md', type: 'agent', lifecycle: 'production', dependencies: [], usedBy: [] },
            'old-agent': { path: '.aios-core/agents/old.md', type: 'agent', lifecycle: 'deprecated', dependencies: [], usedBy: [] },
          },
          tasks: {
            'orphan-task': { path: '.aios-core/tasks/orphan.md', type: 'task', lifecycle: 'orphan', dependencies: [], usedBy: [] },
          },
        },
      };

      const result = await source.getData();
      const devNode = result.nodes.find((n) => n.id === 'dev-agent');
      const oldNode = result.nodes.find((n) => n.id === 'old-agent');
      const orphanNode = result.nodes.find((n) => n.id === 'orphan-task');

      expect(devNode.lifecycle).toBe('production');
      expect(oldNode.lifecycle).toBe('deprecated');
      expect(orphanNode.lifecycle).toBe('orphan');
    });

    it('should default lifecycle to production when missing', async () => {
      mockRegistryData = {
        metadata: { entityCount: 1 },
        entities: {
          agents: {
            'no-lifecycle': { path: '.aios-core/agents/test.md', type: 'agent', dependencies: [], usedBy: [] },
          },
        },
      };

      const result = await source.getData();
      const node = result.nodes.find((n) => n.id === 'no-lifecycle');
      expect(node.lifecycle).toBe('production');
    });
  });

  describe('caching', () => {
    it('should return cached data when not stale', async () => {
      const cachedSource = new CodeIntelSource({ cacheTTL: 60000 });
      const first = await cachedSource.getData();
      const second = await cachedSource.getData();

      expect(first.timestamp).toBe(second.timestamp);
    });

    it('should report stale correctly', () => {
      expect(source.isStale()).toBe(true);
      expect(source.getLastUpdate()).toBe(0);
    });
  });
});
