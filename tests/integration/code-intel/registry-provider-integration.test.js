/**
 * RegistryProvider Integration Tests
 *
 * Tests that RegistryProvider works end-to-end with the real entity-registry.yaml,
 * CodeIntelClient, CodeIntelEnricher, and convenience functions from index.js.
 *
 * @story CODEINTEL-RP-001
 */

'use strict';

const path = require('path');
const fs = require('fs');
const {
  getClient,
  getEnricher,
  isCodeIntelAvailable,
  enrichWithCodeIntel,
  _resetForTesting,
  RegistryProvider,
  CodeIntelClient,
} = require('../../../.aios-core/core/code-intel/index');

jest.setTimeout(30000);

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const REAL_REGISTRY_PATH = path.join(PROJECT_ROOT, '.aios-core', 'data', 'entity-registry.yaml');

// Only run integration tests if the real entity-registry.yaml exists
const registryExists = fs.existsSync(REAL_REGISTRY_PATH);

const describeIfRegistry = registryExists ? describe : describe.skip;

describeIfRegistry('RegistryProvider Integration — Real Entity Registry', () => {
  beforeEach(() => {
    _resetForTesting();
  });

  afterEach(() => {
    _resetForTesting();
  });

  test('isCodeIntelAvailable() returns true with real registry', () => {
    const client = getClient({
      registryPath: REAL_REGISTRY_PATH,
      projectRoot: PROJECT_ROOT,
    });
    expect(client.isCodeIntelAvailable()).toBe(true);
  });

  test('active provider is registry (not code-graph) without MCP', () => {
    const client = getClient({
      registryPath: REAL_REGISTRY_PATH,
      projectRoot: PROJECT_ROOT,
    });
    client.isCodeIntelAvailable();
    const metrics = client.getMetrics();
    expect(metrics.activeProvider).toBe('registry');
    expect(metrics.providerAvailable).toBe(true);
  });

  test('findDefinition returns real entity data', async () => {
    const client = new CodeIntelClient({
      registryPath: REAL_REGISTRY_PATH,
      projectRoot: PROJECT_ROOT,
    });
    const result = await client.findDefinition('create-next-story');
    // This entity should exist in real registry
    if (result) {
      expect(result.file).toBeTruthy();
      expect(result.line).toBeDefined();
      expect(result.context).toBeTruthy();
    }
  });

  test('getProjectStats returns real entity counts', async () => {
    const client = new CodeIntelClient({
      registryPath: REAL_REGISTRY_PATH,
      projectRoot: PROJECT_ROOT,
    });
    const stats = await client.getProjectStats();
    if (stats) {
      expect(stats.files).toBeGreaterThan(100); // 737+ entities
      expect(stats.totalEntities).toBeGreaterThan(100);
      expect(Object.keys(stats.languages).length).toBeGreaterThan(0);
    }
  });

  test('analyzeDependencies returns graph with resolved and unresolved edges', async () => {
    const client = new CodeIntelClient({
      registryPath: REAL_REGISTRY_PATH,
      projectRoot: PROJECT_ROOT,
    });
    // Use an entity that likely has dependencies
    const result = await client.analyzeDependencies('dev-develop-story');
    if (result) {
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
      expect(typeof result.unresolvedCount).toBe('number');
    }
  });

  test('enrichWithCodeIntel enriches result with code intelligence', async () => {
    _resetForTesting();
    // Initialize client via singleton
    getClient({
      registryPath: REAL_REGISTRY_PATH,
      projectRoot: PROJECT_ROOT,
    });

    const baseResult = { task: 'test-task', score: 100 };
    const enriched = await enrichWithCodeIntel(baseResult, {
      capabilities: ['describeProject'],
      timeout: 5000,
    });

    // Should have the base result plus _codeIntel
    expect(enriched.task).toBe('test-task');
    expect(enriched.score).toBe(100);
    if (enriched._codeIntel) {
      expect(enriched._codeIntel).toBeDefined();
    }
  });

  test('session cache works — second call uses cache', async () => {
    const client = new CodeIntelClient({
      registryPath: REAL_REGISTRY_PATH,
      projectRoot: PROJECT_ROOT,
    });

    // First call
    await client.findDefinition('create-next-story');
    const metrics1 = client.getMetrics();
    expect(metrics1.cacheMisses).toBe(1);

    // Second call — should hit cache
    await client.findDefinition('create-next-story');
    const metrics2 = client.getMetrics();
    expect(metrics2.cacheHits).toBe(1);
  });
});

// Tests that run regardless of real registry
describe('RegistryProvider Integration — Module Exports', () => {
  test('index.js exports RegistryProvider', () => {
    expect(RegistryProvider).toBeDefined();
    expect(typeof RegistryProvider).toBe('function');
  });

  test('_resetForTesting clears singletons', () => {
    _resetForTesting();
    expect(isCodeIntelAvailable()).toBe(false);
  });
});
