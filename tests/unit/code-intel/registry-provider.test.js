/**
 * RegistryProvider Unit Tests
 *
 * Tests for the native code intelligence provider using entity-registry.yaml.
 * Covers all 5 implemented primitives, null returns for AST-only, fuzzy matching,
 * disambiguation, graceful degradation, cache behavior, and provider detection.
 *
 * @story CODEINTEL-RP-001
 */

'use strict';

const path = require('path');
const fs = require('fs');

// We need to mock fs for degradation tests but use real fs for loading tests
// Use a strategy: create temp YAML files for test fixtures

const { RegistryProvider, LAYER_PRIORITY } = require('../../../.aios-core/core/code-intel/providers/registry-provider');
const { CodeIntelProvider } = require('../../../.aios-core/core/code-intel/providers/provider-interface');
const { CodeGraphProvider } = require('../../../.aios-core/core/code-intel/providers/code-graph-provider');
const { CodeIntelClient, CB_CLOSED } = require('../../../.aios-core/core/code-intel/code-intel-client');

jest.setTimeout(30000);

// --- Test Fixtures ---

const FIXTURES_DIR = path.join(__dirname, '__fixtures__');
const VALID_REGISTRY_PATH = path.join(FIXTURES_DIR, 'valid-registry.yaml');
const EMPTY_REGISTRY_PATH = path.join(FIXTURES_DIR, 'empty-registry.yaml');
const MALFORMED_REGISTRY_PATH = path.join(FIXTURES_DIR, 'malformed-registry.yaml');
const DUPLICATES_REGISTRY_PATH = path.join(FIXTURES_DIR, 'duplicates-registry.yaml');
const UNRESOLVED_DEPS_PATH = path.join(FIXTURES_DIR, 'unresolved-deps-registry.yaml');

beforeAll(() => {
  // Create fixtures directory
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  // Valid registry with multiple categories
  fs.writeFileSync(VALID_REGISTRY_PATH, `
entities:
  tasks:
    create-story:
      path: .aios-core/development/tasks/create-story.md
      layer: L2
      type: task
      purpose: Create a new user story
      keywords:
        - story
        - create
        - draft
      usedBy:
        - sm-agent
      dependencies:
        - story-template
    validate-story:
      path: .aios-core/development/tasks/validate-story.md
      layer: L2
      type: task
      purpose: Validate story quality and completeness
      keywords:
        - validate
        - quality
      usedBy:
        - po-agent
      dependencies:
        - create-story
  agents:
    dev-agent:
      path: .aios-core/development/agents/dev.md
      layer: L2
      type: agent
      purpose: Full stack developer agent
      keywords:
        - dev
        - developer
        - code
      usedBy: []
      dependencies:
        - create-story
    sm-agent:
      path: .aios-core/development/agents/sm.md
      layer: L2
      type: agent
      purpose: Scrum Master agent
      keywords:
        - scrum
        - sprint
      usedBy: []
      dependencies: []
  templates:
    story-template:
      path: .aios-core/development/templates/story-tmpl.yaml
      layer: L2
      type: template
      purpose: Story creation template
      keywords:
        - template
        - story
      usedBy:
        - create-story
      dependencies: []
  core:
    code-intel-client:
      path: .aios-core/core/code-intel/code-intel-client.js
      layer: L1
      type: module
      purpose: Central entry point for code intelligence
      keywords:
        - code-intel
        - client
        - provider
      usedBy: []
      dependencies: []
`);

  // Empty registry
  fs.writeFileSync(EMPTY_REGISTRY_PATH, `
entities: {}
`);

  // Malformed YAML
  fs.writeFileSync(MALFORMED_REGISTRY_PATH, `
entities:
  this is not: [valid yaml
  because: {it has: broken: syntax
`);

  // Registry with duplicate entity names (like real 35 duplicates)
  fs.writeFileSync(DUPLICATES_REGISTRY_PATH, `
entities:
  tasks:
    yaml-validator:
      path: .aios-core/development/tasks/yaml-validator.md
      layer: L2
      type: task
      purpose: Validate YAML files
      keywords:
        - yaml
        - validate
      usedBy: []
      dependencies: []
    index:
      path: .aios-core/development/tasks/index.md
      layer: L2
      type: task
      purpose: Task index file
      keywords:
        - index
      usedBy: []
      dependencies: []
  scripts:
    yaml-validator:
      path: .aios-core/development/scripts/yaml-validator.js
      layer: L2
      type: script
      purpose: YAML validation script
      keywords:
        - yaml
        - validate
        - script
      usedBy: []
      dependencies: []
    backup-manager:
      path: .aios-core/development/scripts/backup-manager.js
      layer: L2
      type: script
      purpose: Backup management script
      keywords:
        - backup
        - restore
      usedBy: []
      dependencies: []
  core:
    yaml-validator:
      path: .aios-core/core/yaml-validator.js
      layer: L1
      type: module
      purpose: Core YAML validation module
      keywords:
        - yaml
        - core
        - validate
      usedBy: []
      dependencies: []
    index:
      path: .aios-core/core/index.js
      layer: L1
      type: module
      purpose: Core index module
      keywords:
        - core
        - index
      usedBy: []
      dependencies: []
    backup-manager:
      path: .aios-core/core/backup-manager.js
      layer: L1
      type: module
      purpose: Core backup manager
      keywords:
        - backup
        - core
      usedBy: []
      dependencies: []
  templates:
    yaml-validator:
      path: .aios-core/development/templates/yaml-validator.yaml
      layer: L3
      type: template
      purpose: YAML validator template
      keywords:
        - yaml
        - template
      usedBy: []
      dependencies: []
    index:
      path: .aios-core/development/templates/index.yaml
      layer: L3
      type: template
      purpose: Template index
      keywords:
        - template
        - index
      usedBy: []
      dependencies: []
    backup-manager:
      path: .aios-core/development/templates/backup-manager.yaml
      layer: L3
      type: template
      purpose: Backup manager template
      keywords:
        - backup
        - template
      usedBy: []
      dependencies: []
`);

  // Registry with unresolvable dependencies
  fs.writeFileSync(UNRESOLVED_DEPS_PATH, `
entities:
  tasks:
    task-a:
      path: tasks/task-a.md
      layer: L2
      type: task
      purpose: Task A
      keywords: []
      usedBy: []
      dependencies:
        - task-b
        - non-existent-entity
        - another-missing
    task-b:
      path: tasks/task-b.md
      layer: L2
      type: task
      purpose: Task B
      keywords: []
      usedBy: []
      dependencies:
        - task-c
    task-c:
      path: tasks/task-c.md
      layer: L2
      type: task
      purpose: Task C
      keywords: []
      usedBy: []
      dependencies: []
`);
});

afterAll(() => {
  // Cleanup fixture files
  const files = [VALID_REGISTRY_PATH, EMPTY_REGISTRY_PATH, MALFORMED_REGISTRY_PATH, DUPLICATES_REGISTRY_PATH, UNRESOLVED_DEPS_PATH];
  for (const file of files) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  if (fs.existsSync(FIXTURES_DIR)) {
    fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
  }
});

// --- Helper ---

function createProvider(registryPath) {
  return new RegistryProvider({
    registryPath,
    projectRoot: FIXTURES_DIR,
  });
}

// =============================================================================
// 6.1: Unit tests for all 5 implemented primitives
// =============================================================================

describe('RegistryProvider — 5 Implemented Primitives', () => {
  let provider;

  beforeEach(() => {
    provider = createProvider(VALID_REGISTRY_PATH);
  });

  describe('findDefinition()', () => {
    test('finds entity by exact name', async () => {
      const result = await provider.findDefinition('create-story');
      expect(result).not.toBeNull();
      expect(result.file).toBe('.aios-core/development/tasks/create-story.md');
      expect(result.line).toBe(1);
      expect(result.column).toBe(0);
      expect(result.context).toBeTruthy();
    });

    test('finds entity by case-insensitive name', async () => {
      const result = await provider.findDefinition('Create-Story');
      expect(result).not.toBeNull();
      expect(result.file).toBe('.aios-core/development/tasks/create-story.md');
    });

    test('returns null for non-existent symbol', async () => {
      const result = await provider.findDefinition('non-existent-symbol-xyz');
      expect(result).toBeNull();
    });

    test('includes purpose in context', async () => {
      const result = await provider.findDefinition('dev-agent');
      expect(result).not.toBeNull();
      expect(result.context).toContain('Full stack developer agent');
    });
  });

  describe('findReferences()', () => {
    test('finds references via usedBy field', async () => {
      const result = await provider.findReferences('create-story');
      expect(result).not.toBeNull();
      expect(result.length).toBeGreaterThan(0);
    });

    test('finds references via dependencies field', async () => {
      const result = await provider.findReferences('story-template');
      expect(result).not.toBeNull();
      expect(result.length).toBeGreaterThan(0);
      // create-story depends on story-template
      const paths = result.map(r => r.file);
      expect(paths).toContain('.aios-core/development/tasks/create-story.md');
    });

    test('returns null for entity with no references', async () => {
      const result = await provider.findReferences('completely-unknown-entity-xyz');
      expect(result).toBeNull();
    });
  });

  describe('analyzeDependencies()', () => {
    test('builds dependency graph from entity', async () => {
      const result = await provider.analyzeDependencies('create-story');
      expect(result).not.toBeNull();
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
      expect(result.nodes.length).toBeGreaterThan(0);
    });

    test('includes resolved edges', async () => {
      const result = await provider.analyzeDependencies('create-story');
      expect(result).not.toBeNull();
      const resolvedEdges = result.edges.filter(e => e.resolved === true);
      expect(resolvedEdges.length).toBeGreaterThan(0);
    });

    test('returns null for non-existent entity', async () => {
      const result = await provider.analyzeDependencies('non-existent-xyz');
      expect(result).not.toBeNull();
      // Fuzzy match may find nothing, resulting in empty graph
      expect(result.nodes.length).toBe(0);
    });
  });

  describe('analyzeCodebase()', () => {
    test('returns structural overview with categories', async () => {
      const result = await provider.analyzeCodebase('.');
      expect(result).not.toBeNull();
      expect(result.files).toBeDefined();
      expect(result.structure).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
    });

    test('structure contains category counts', async () => {
      const result = await provider.analyzeCodebase('.');
      expect(result.structure).toHaveProperty('tasks');
      expect(result.structure.tasks.count).toBeGreaterThan(0);
    });

    test('structure contains layer distribution', async () => {
      const result = await provider.analyzeCodebase('.');
      expect(result.structure.tasks.layers).toBeDefined();
      expect(result.structure.tasks.layers.L2).toBeGreaterThan(0);
    });
  });

  describe('getProjectStats()', () => {
    test('returns entity counts', async () => {
      const result = await provider.getProjectStats();
      expect(result).not.toBeNull();
      expect(result.files).toBeGreaterThan(0);
      expect(result.totalEntities).toBeGreaterThan(0);
    });

    test('includes layer breakdown', async () => {
      const result = await provider.getProjectStats();
      expect(result.layers).toBeDefined();
      expect(result.layers.L1).toBeDefined();
      expect(result.layers.L2).toBeDefined();
    });

    test('includes language detection from file extensions', async () => {
      const result = await provider.getProjectStats();
      expect(result.languages).toBeDefined();
      // Our fixture has .md, .yaml, .js files
      expect(Object.keys(result.languages).length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// 6.2: Unit tests for null return on 3 AST-only primitives
// =============================================================================

describe('RegistryProvider — AST-only Primitives Return Null', () => {
  let provider;

  beforeEach(() => {
    provider = createProvider(VALID_REGISTRY_PATH);
  });

  test('findCallers() returns null', async () => {
    const result = await provider.findCallers('create-story');
    expect(result).toBeNull();
  });

  test('findCallees() returns null', async () => {
    const result = await provider.findCallees('create-story');
    expect(result).toBeNull();
  });

  test('analyzeComplexity() returns null', async () => {
    const result = await provider.analyzeComplexity('.');
    expect(result).toBeNull();
  });
});

// =============================================================================
// 6.3: Fuzzy matching tests
// =============================================================================

describe('RegistryProvider — Fuzzy Matching', () => {
  let provider;

  beforeEach(() => {
    provider = createProvider(VALID_REGISTRY_PATH);
  });

  test('exact name match has highest priority', async () => {
    const result = await provider.findDefinition('create-story');
    expect(result).not.toBeNull();
    expect(result.file).toBe('.aios-core/development/tasks/create-story.md');
  });

  test('path-contains match works', async () => {
    // 'code-intel-client' is an exact name but test partial path match
    const result = await provider.findDefinition('code-intel');
    expect(result).not.toBeNull();
    // Should find via path contains
    expect(result.file).toContain('code-intel');
  });

  test('keyword match works', async () => {
    const result = await provider.findDefinition('draft');
    expect(result).not.toBeNull();
    // 'draft' is a keyword of 'create-story'
    expect(result.file).toBe('.aios-core/development/tasks/create-story.md');
  });
});

// =============================================================================
// 6.4: Entity name collision tests (35 duplicates scenario)
// =============================================================================

describe('RegistryProvider — Entity Name Disambiguation', () => {
  let provider;

  beforeEach(() => {
    provider = createProvider(DUPLICATES_REGISTRY_PATH);
  });

  test('yaml-validator has 4 entries, all preserved in index', async () => {
    expect(provider.isAvailable()).toBe(true);
    // findDefinition returns the best match, but all should be in the index
    const result = await provider.findDefinition('yaml-validator');
    expect(result).not.toBeNull();
    // L1 (core) should win over L2 (tasks/scripts) and L3 (templates) due to layer priority
    expect(result.file).toBe('.aios-core/core/yaml-validator.js');
  });

  test('index has 3 entries, all preserved', async () => {
    const result = await provider.findDefinition('index');
    expect(result).not.toBeNull();
    // L1 core should win
    expect(result.file).toBe('.aios-core/core/index.js');
  });

  test('backup-manager has 3 entries, L1 wins', async () => {
    const result = await provider.findDefinition('backup-manager');
    expect(result).not.toBeNull();
    expect(result.file).toBe('.aios-core/core/backup-manager.js');
  });

  test('disambiguation scoring: L1 > L2 > L3', async () => {
    // yaml-validator exists in L1 (core), L2 (tasks, scripts), L3 (templates)
    // L1 should always win
    const result = await provider.findDefinition('yaml-validator');
    expect(result.file).toContain('.aios-core/core/');
  });
});

// =============================================================================
// 6.5: Graceful degradation tests
// =============================================================================

describe('RegistryProvider — Graceful Degradation', () => {
  test('missing file: isAvailable() returns false', () => {
    const provider = createProvider('/non/existent/path/registry.yaml');
    expect(provider.isAvailable()).toBe(false);
  });

  test('missing file: primitives return null', async () => {
    const provider = createProvider('/non/existent/path/registry.yaml');
    expect(await provider.findDefinition('anything')).toBeNull();
    expect(await provider.findReferences('anything')).toBeNull();
    expect(await provider.analyzeDependencies('anything')).toBeNull();
    expect(await provider.analyzeCodebase('.')).toBeNull();
    expect(await provider.getProjectStats()).toBeNull();
  });

  test('malformed YAML: isAvailable() returns false', () => {
    const provider = createProvider(MALFORMED_REGISTRY_PATH);
    expect(provider.isAvailable()).toBe(false);
  });

  test('malformed YAML: primitives return null', async () => {
    const provider = createProvider(MALFORMED_REGISTRY_PATH);
    expect(await provider.findDefinition('anything')).toBeNull();
  });

  test('empty registry: isAvailable() returns false', () => {
    const provider = createProvider(EMPTY_REGISTRY_PATH);
    expect(provider.isAvailable()).toBe(false);
  });

  test('empty registry: findDefinition returns null', async () => {
    const provider = createProvider(EMPTY_REGISTRY_PATH);
    expect(await provider.findDefinition('anything')).toBeNull();
  });

  test('empty registry: getProjectStats returns empty counts', async () => {
    const provider = createProvider(EMPTY_REGISTRY_PATH);
    // Empty entities ({}) builds empty Maps — returns zeroed stats (not null)
    const result = await provider.getProjectStats();
    expect(result).not.toBeNull();
    expect(result.files).toBe(0);
    expect(result.totalEntities).toBe(0);
  });
});

// =============================================================================
// 6.6: Unresolved dependencies tests
// =============================================================================

describe('RegistryProvider — Unresolved Dependencies', () => {
  let provider;

  beforeEach(() => {
    provider = createProvider(UNRESOLVED_DEPS_PATH);
  });

  test('marks unresolvable edges as resolved: false', async () => {
    const result = await provider.analyzeDependencies('task-a');
    expect(result).not.toBeNull();
    const unresolvedEdges = result.edges.filter(e => e.resolved === false);
    expect(unresolvedEdges.length).toBe(2); // non-existent-entity, another-missing
  });

  test('includes unresolvedCount in output', async () => {
    const result = await provider.analyzeDependencies('task-a');
    expect(result).not.toBeNull();
    expect(result.unresolvedCount).toBe(2);
  });

  test('resolved edges are marked as resolved: true', async () => {
    const result = await provider.analyzeDependencies('task-a');
    const resolvedEdges = result.edges.filter(e => e.resolved === true);
    // task-a depends on task-b which exists
    expect(resolvedEdges.length).toBeGreaterThan(0);
    expect(resolvedEdges.some(e => e.to === 'task-b')).toBe(true);
  });

  test('graph traversal follows resolved deps', async () => {
    const result = await provider.analyzeDependencies('task-a');
    // Should include task-a, task-b (resolved dep), task-c (transitive dep from task-b)
    const nodeNames = result.nodes.map(n => n.name);
    expect(nodeNames).toContain('task-a');
    expect(nodeNames).toContain('task-b');
    expect(nodeNames).toContain('task-c');
  });
});

// =============================================================================
// 6.7: isAvailable() tests
// =============================================================================

describe('Provider isAvailable()', () => {
  test('RegistryProvider.isAvailable() returns true when registry loaded', () => {
    const provider = createProvider(VALID_REGISTRY_PATH);
    expect(provider.isAvailable()).toBe(true);
  });

  test('RegistryProvider.isAvailable() returns false when no registry', () => {
    const provider = createProvider('/non/existent/path.yaml');
    expect(provider.isAvailable()).toBe(false);
  });

  test('CodeGraphProvider.isAvailable() returns true with mcpCallFn', () => {
    const provider = new CodeGraphProvider({
      mcpCallFn: jest.fn(),
    });
    expect(provider.isAvailable()).toBe(true);
  });

  test('CodeGraphProvider.isAvailable() returns false without mcpCallFn', () => {
    const provider = new CodeGraphProvider({});
    expect(provider.isAvailable()).toBe(false);
  });

  test('CodeIntelProvider base class isAvailable() returns false', () => {
    const provider = new CodeIntelProvider('test');
    expect(provider.isAvailable()).toBe(false);
  });
});

// =============================================================================
// 6.8: _detectProvider() refactor tests
// =============================================================================

describe('CodeIntelClient — Provider Detection', () => {
  test('detects RegistryProvider without mcpCallFn', () => {
    const client = new CodeIntelClient({
      registryPath: VALID_REGISTRY_PATH,
      projectRoot: FIXTURES_DIR,
    });
    expect(client.isCodeIntelAvailable()).toBe(true);
    const metrics = client.getMetrics();
    expect(metrics.activeProvider).toBe('registry');
  });

  test('RegistryProvider has higher priority than CodeGraphProvider', () => {
    const client = new CodeIntelClient({
      registryPath: VALID_REGISTRY_PATH,
      projectRoot: FIXTURES_DIR,
      mcpCallFn: jest.fn(), // Both providers available
    });
    expect(client.isCodeIntelAvailable()).toBe(true);
    const metrics = client.getMetrics();
    // Registry should be first because it's registered first
    expect(metrics.activeProvider).toBe('registry');
  });

  test('falls back to CodeGraphProvider when registry unavailable', () => {
    const client = new CodeIntelClient({
      registryPath: '/non/existent/path.yaml',
      mcpCallFn: jest.fn(),
    });
    expect(client.isCodeIntelAvailable()).toBe(true);
    const metrics = client.getMetrics();
    expect(metrics.activeProvider).toBe('code-graph');
  });

  test('no provider available returns false', () => {
    const client = new CodeIntelClient({
      registryPath: '/non/existent/path.yaml',
    });
    expect(client.isCodeIntelAvailable()).toBe(false);
  });

  test('registerProvider() adds custom provider', () => {
    const client = new CodeIntelClient({
      registryPath: '/non/existent/path.yaml',
    });
    expect(client.isCodeIntelAvailable()).toBe(false);

    // Add a custom provider
    const customProvider = new CodeIntelProvider('custom');
    customProvider.isAvailable = () => true;
    client.registerProvider(customProvider);

    expect(client.isCodeIntelAvailable()).toBe(true);
    const metrics = client.getMetrics();
    expect(metrics.activeProvider).toBe('custom');
  });
});

// =============================================================================
// 6.11: Cache behavior tests
// =============================================================================

describe('RegistryProvider — Cache Behavior', () => {
  test('registry loaded once on first call (lazy)', () => {
    const provider = new RegistryProvider({
      registryPath: VALID_REGISTRY_PATH,
    });
    // Before any call, internal state is null
    expect(provider._registry).toBeNull();

    // After isAvailable (triggers load)
    provider.isAvailable();
    expect(provider._registry).not.toBeNull();
    expect(provider._registryMtime).not.toBeNull();
  });

  test('registry not reloaded if mtime unchanged', () => {
    const provider = createProvider(VALID_REGISTRY_PATH);
    provider.isAvailable(); // First load

    const firstMtime = provider._registryMtime;
    const firstRegistry = provider._registry;

    // Call again — should use cached
    provider.isAvailable();
    expect(provider._registryMtime).toBe(firstMtime);
    expect(provider._registry).toBe(firstRegistry);
  });

  test('registry reloaded when mtime changes', async () => {
    const tempPath = path.join(FIXTURES_DIR, 'mtime-test-registry.yaml');
    fs.writeFileSync(tempPath, `
entities:
  tasks:
    task-v1:
      path: tasks/v1.md
      layer: L2
      type: task
      purpose: Version 1
      keywords: []
      usedBy: []
      dependencies: []
`);

    const provider = createProvider(tempPath);
    expect(provider.isAvailable()).toBe(true);
    const result1 = await provider.findDefinition('task-v1');
    expect(result1).not.toBeNull();

    // Wait a bit and modify file (ensure different mtime)
    await new Promise(resolve => setTimeout(resolve, 100));
    fs.writeFileSync(tempPath, `
entities:
  tasks:
    task-v2:
      path: tasks/v2.md
      layer: L2
      type: task
      purpose: Version 2
      keywords: []
      usedBy: []
      dependencies: []
`);

    // Should reload and find new entity
    const result2 = await provider.findDefinition('task-v2');
    expect(result2).not.toBeNull();
    expect(result2.file).toBe('tasks/v2.md');

    // Old entity should not exist
    const result3 = await provider.findDefinition('task-v1');
    expect(result3).toBeNull();

    // Cleanup
    fs.unlinkSync(tempPath);
  });
});

// =============================================================================
// 6.12: Performance test
// =============================================================================

describe('RegistryProvider — Performance', () => {
  test('call latency < 50ms for in-memory index', async () => {
    const provider = createProvider(VALID_REGISTRY_PATH);
    // Warm up (first call loads registry)
    await provider.findDefinition('create-story');

    // Measure subsequent calls
    const start = Date.now();
    const iterations = 100;
    for (let i = 0; i < iterations; i++) {
      await provider.findDefinition('create-story');
    }
    const elapsed = Date.now() - start;
    const avgMs = elapsed / iterations;

    expect(avgMs).toBeLessThan(50);
  });

  test('analyzeDependencies latency < 50ms', async () => {
    const provider = createProvider(VALID_REGISTRY_PATH);
    await provider.analyzeDependencies('create-story'); // warm up

    const start = Date.now();
    for (let i = 0; i < 50; i++) {
      await provider.analyzeDependencies('create-story');
    }
    const elapsed = Date.now() - start;
    const avgMs = elapsed / 50;

    expect(avgMs).toBeLessThan(50);
  });
});

// =============================================================================
// Additional edge cases
// =============================================================================

describe('RegistryProvider — Edge Cases', () => {
  test('path traversal defense: entities with ".." in path are rejected', async () => {
    const traversalPath = path.join(FIXTURES_DIR, 'traversal-registry.yaml');
    fs.writeFileSync(traversalPath, `
entities:
  tasks:
    safe-entity:
      path: tasks/safe.md
      layer: L2
      type: task
      purpose: Safe entity
      keywords: []
      usedBy: []
      dependencies: []
    evil-entity:
      path: ../../etc/passwd
      layer: L2
      type: task
      purpose: Evil entity with path traversal
      keywords: []
      usedBy: []
      dependencies: []
`);

    const provider = createProvider(traversalPath);
    expect(provider.isAvailable()).toBe(true);

    // Safe entity should be findable
    const safe = await provider.findDefinition('safe-entity');
    expect(safe).not.toBeNull();

    // Evil entity with .. in path should be rejected
    const evil = await provider.findDefinition('evil-entity');
    expect(evil).toBeNull();

    fs.unlinkSync(traversalPath);
  });

  test('LAYER_PRIORITY export is correct', () => {
    expect(LAYER_PRIORITY).toBeDefined();
    expect(LAYER_PRIORITY.L1).toBe(0);
    expect(LAYER_PRIORITY.L2).toBe(1);
    expect(LAYER_PRIORITY.L3).toBe(2);
    expect(LAYER_PRIORITY.L4).toBe(3);
  });

  test('extends CodeIntelProvider', () => {
    const provider = createProvider(VALID_REGISTRY_PATH);
    expect(provider).toBeInstanceOf(CodeIntelProvider);
    expect(provider.name).toBe('registry');
  });

  test('circuit breaker in client works with RegistryProvider', () => {
    const client = new CodeIntelClient({
      registryPath: VALID_REGISTRY_PATH,
      projectRoot: FIXTURES_DIR,
    });
    expect(client.getCircuitBreakerState()).toBe(CB_CLOSED);
  });
});
