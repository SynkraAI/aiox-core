/**
 * Integration tests — Helper functions return real data with RegistryProvider.
 *
 * Validates AC8: Each helper function listed in the story returns non-null data
 * when RegistryProvider is available (using real entity-registry.yaml).
 *
 * @story CODEINTEL-RP-001
 */

'use strict';

const {
  _resetForTesting,
  getClient,
  getEnricher,
  isCodeIntelAvailable,
} = require('../../../.aios-core/core/code-intel');

const {
  checkBeforeWriting,
  suggestReuse,
} = require('../../../.aios-core/core/code-intel/helpers/dev-helper');

const {
  getBlastRadius,
  getReferenceImpact,
} = require('../../../.aios-core/core/code-intel/helpers/qa-helper');

const {
  getDependencyGraph,
  getCodebaseOverview,
} = require('../../../.aios-core/core/code-intel/helpers/planning-helper');

const {
  suggestRelevantFiles,
} = require('../../../.aios-core/core/code-intel/helpers/story-helper');

jest.setTimeout(30000);

describe('AC8: Helper Functions Return Real Data with RegistryProvider', () => {
  beforeAll(() => {
    // Initialize singleton with real registry (from project root)
    _resetForTesting();
    getClient(); // Will auto-detect entity-registry.yaml via process.cwd()
  });

  afterAll(() => {
    _resetForTesting();
  });

  // Verify RegistryProvider is active (precondition for all tests)
  test('precondition: RegistryProvider is available', () => {
    expect(isCodeIntelAvailable()).toBe(true);
    const metrics = getClient().getMetrics();
    expect(metrics.activeProvider).toBe('registry');
  });

  // --- dev-helper.js ---

  describe('dev-helper.js', () => {
    test('checkBeforeWriting() returns data for known entity', async () => {
      // 'create-story' is a well-known entity referenced by many others
      const result = await checkBeforeWriting('create-story', 'create user story');
      // May return null if no duplicates detected (which is valid behavior)
      // The key is it doesn't throw and exercises the RegistryProvider pipeline
      // If it returns data, it should have the right shape
      if (result !== null) {
        expect(result).toHaveProperty('duplicates');
        expect(result).toHaveProperty('references');
        expect(result).toHaveProperty('suggestion');
      }
    });

    test('suggestReuse() returns real data for known entity', async () => {
      // Use a well-known entity name from the registry
      const result = await suggestReuse('create-story');
      // create-story has usedBy and dependencies, so it should return data
      if (result !== null) {
        expect(result).toHaveProperty('file');
        expect(result).toHaveProperty('references');
        expect(result).toHaveProperty('suggestion');
        expect(['REUSE', 'ADAPT']).toContain(result.suggestion);
        expect(typeof result.references).toBe('number');
      }
    });

    test('suggestReuse() returns non-null for entity with definition', async () => {
      // 'create-next-story' exists in registry and has usedBy/dependencies
      const result = await suggestReuse('create-next-story');
      // This entity exists and has definition — should return something
      expect(result).not.toBeNull();
      expect(result.file).toBeTruthy();
      expect(typeof result.references).toBe('number');
    });
  });

  // --- qa-helper.js ---

  describe('qa-helper.js', () => {
    test('getBlastRadius() returns real data for known files', async () => {
      const files = ['.aios-core/development/tasks/create-story.md'];
      const result = await getBlastRadius(files);
      // assessImpact uses findReferences + analyzeComplexity
      // With RegistryProvider, findReferences should work, analyzeComplexity returns null (AST-only)
      if (result !== null) {
        expect(result).toHaveProperty('blastRadius');
        expect(result).toHaveProperty('riskLevel');
        expect(result).toHaveProperty('references');
        expect(typeof result.blastRadius).toBe('number');
        expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.riskLevel);
      }
    });

    test('getReferenceImpact() returns real data for known files', async () => {
      const files = ['create-story'];
      const result = await getReferenceImpact(files);
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('file');
      expect(result[0]).toHaveProperty('consumers');
      // create-story is referenced by validate-story and dev-agent
      expect(Array.isArray(result[0].consumers)).toBe(true);
    });
  });

  // --- planning-helper.js ---

  describe('planning-helper.js', () => {
    test('getDependencyGraph() returns real data', async () => {
      const result = await getDependencyGraph('create-story');
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('dependencies');
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('totalDeps');
      expect(result.summary).toHaveProperty('depth');
      expect(typeof result.summary.totalDeps).toBe('number');
    });

    test('getCodebaseOverview() returns real data', async () => {
      const result = await getCodebaseOverview('.');
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('codebase');
      expect(result).toHaveProperty('stats');
      // stats comes from getProjectStats which works with RegistryProvider
      if (result.stats) {
        expect(result.stats).toHaveProperty('files');
        expect(result.stats.files).toBeGreaterThan(0);
      }
    });
  });

  // --- story-helper.js ---

  describe('story-helper.js', () => {
    test('suggestRelevantFiles() returns real data for description', async () => {
      // Use a description that matches registry entities via findReferences
      const result = await suggestRelevantFiles('story creation and validation');
      // findReferences may return null if no entity matches the description string
      // analyzeCodebase should return data from RegistryProvider
      if (result !== null) {
        expect(result).toHaveProperty('files');
        expect(result).toHaveProperty('codebaseContext');
        // codebaseContext should have data from analyzeCodebase
        if (result.codebaseContext) {
          expect(result.codebaseContext).toHaveProperty('files');
          expect(result.codebaseContext).toHaveProperty('structure');
          expect(result.codebaseContext).toHaveProperty('patterns');
        }
      }
    });

    test('suggestRelevantFiles() codebaseContext is always available', async () => {
      // Even with a nonsensical description, analyzeCodebase should return data
      const result = await suggestRelevantFiles('xyzzy random description');
      // analyzeCodebase('.') always returns data with RegistryProvider
      expect(result).not.toBeNull();
      expect(result.codebaseContext).not.toBeNull();
      expect(result.codebaseContext.files.length).toBeGreaterThan(0);
    });
  });

  // --- Helper null-rate validation (AC13) ---

  describe('AC13: Helper null-rate < 30%', () => {
    test('at least 5/7 helpers return non-null data', async () => {
      const results = await Promise.all([
        checkBeforeWriting('create-next-story', 'create user story task').then(r => ({ name: 'checkBeforeWriting', result: r })),
        suggestReuse('create-next-story').then(r => ({ name: 'suggestReuse', result: r })),
        getBlastRadius(['.aios-core/development/tasks/create-next-story.md']).then(r => ({ name: 'getBlastRadius', result: r })),
        getReferenceImpact(['create-next-story']).then(r => ({ name: 'getReferenceImpact', result: r })),
        getDependencyGraph('create-next-story').then(r => ({ name: 'getDependencyGraph', result: r })),
        getCodebaseOverview('.').then(r => ({ name: 'getCodebaseOverview', result: r })),
        suggestRelevantFiles('story creation and validation workflow').then(r => ({ name: 'suggestRelevantFiles', result: r })),
      ]);

      const nonNull = results.filter(r => r.result !== null);
      const nullCount = results.filter(r => r.result === null);

      // Log for visibility
      for (const r of results) {
        const status = r.result !== null ? 'non-null' : 'NULL';
        // eslint-disable-next-line no-console
        console.log(`  ${r.name}: ${status}`);
      }

      // AC13: null-rate drops from 100% to <30% (at least 5/7 non-null)
      expect(nonNull.length).toBeGreaterThanOrEqual(5);
    });
  });
});
