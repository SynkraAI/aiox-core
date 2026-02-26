'use strict';

const {
  getCodebaseContext,
  checkDuplicateArtefact,
  enrichRegistryEntry,
  _formatDuplicateWarning,
} = require('../../.aios-core/core/code-intel/helpers/creation-helper');

// Mock the code-intel module
jest.mock('../../.aios-core/core/code-intel/index', () => ({
  isCodeIntelAvailable: jest.fn(),
  getEnricher: jest.fn(),
  getClient: jest.fn(),
}));

const {
  isCodeIntelAvailable,
  getEnricher,
  getClient,
} = require('../../.aios-core/core/code-intel/index');

// --- Helper to setup mocks ---

function setupProviderAvailable() {
  isCodeIntelAvailable.mockReturnValue(true);
}

function setupProviderUnavailable() {
  isCodeIntelAvailable.mockReturnValue(false);
}

function createMockEnricher(overrides = {}) {
  const enricher = {
    detectDuplicates: jest.fn().mockResolvedValue(null),
    assessImpact: jest.fn().mockResolvedValue(null),
    getConventions: jest.fn().mockResolvedValue(null),
    findTests: jest.fn().mockResolvedValue(null),
    describeProject: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
  getEnricher.mockReturnValue(enricher);
  return enricher;
}

function createMockClient(overrides = {}) {
  const client = {
    findReferences: jest.fn().mockResolvedValue(null),
    findDefinition: jest.fn().mockResolvedValue(null),
    findCallers: jest.fn().mockResolvedValue(null),
    findCallees: jest.fn().mockResolvedValue(null),
    analyzeDependencies: jest.fn().mockResolvedValue(null),
    analyzeComplexity: jest.fn().mockResolvedValue(null),
    analyzeCodebase: jest.fn().mockResolvedValue(null),
    getProjectStats: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
  getClient.mockReturnValue(client);
  return client;
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CreationHelper', () => {
  // === T1: getCodebaseContext with provider ===
  describe('getCodebaseContext', () => {
    it('should return project and conventions when provider available (T1)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        describeProject: jest.fn().mockResolvedValue({
          codebase: { language: 'javascript', framework: 'node' },
          stats: { files: 150, lines: 12000 },
        }),
        getConventions: jest.fn().mockResolvedValue({
          patterns: ['kebab-case files', 'CommonJS modules', 'JSDoc comments'],
          stats: { files: 150, languages: ['javascript'] },
        }),
      });

      const result = await getCodebaseContext('.');

      expect(result).not.toBeNull();
      expect(result.project).toBeDefined();
      expect(result.project.codebase.language).toBe('javascript');
      expect(result.conventions).toBeDefined();
      expect(result.conventions.patterns).toHaveLength(3);
    });

    // === T2: getCodebaseContext without provider ===
    it('should return null without throw when no provider (T2)', async () => {
      setupProviderUnavailable();

      const result = await getCodebaseContext('.');

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should return partial result when only project available', async () => {
      setupProviderAvailable();
      createMockEnricher({
        describeProject: jest.fn().mockResolvedValue({
          codebase: { language: 'javascript' },
          stats: {},
        }),
        getConventions: jest.fn().mockRejectedValue(new Error('timeout')),
      });

      const result = await getCodebaseContext('.');

      expect(result).not.toBeNull();
      expect(result.project).toBeDefined();
      expect(result.conventions).toBeNull();
    });

    it('should return partial result when only conventions available', async () => {
      setupProviderAvailable();
      createMockEnricher({
        describeProject: jest.fn().mockRejectedValue(new Error('timeout')),
        getConventions: jest.fn().mockResolvedValue({
          patterns: ['pattern1'],
          stats: {},
        }),
      });

      const result = await getCodebaseContext('.');

      expect(result).not.toBeNull();
      expect(result.project).toBeNull();
      expect(result.conventions).toBeDefined();
    });

    it('should use default path when not provided', async () => {
      setupProviderAvailable();
      const enricher = createMockEnricher({
        describeProject: jest.fn().mockResolvedValue({ codebase: {}, stats: {} }),
        getConventions: jest.fn().mockResolvedValue({ patterns: [], stats: {} }),
      });

      await getCodebaseContext();

      expect(enricher.describeProject).toHaveBeenCalledWith('.');
      expect(enricher.getConventions).toHaveBeenCalledWith('.');
    });

    it('should return null when enricher throws', async () => {
      setupProviderAvailable();
      getEnricher.mockImplementation(() => { throw new Error('init failed'); });

      const result = await getCodebaseContext('.');

      expect(result).toBeNull();
    });
  });

  // === T3: checkDuplicateArtefact with match ===
  describe('checkDuplicateArtefact', () => {
    it('should return duplicates and warning when matches found (T3)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({
          matches: [{ file: 'tasks/existing-task.md', line: 1, context: 'Similar task' }],
          codebaseOverview: {},
        }),
      });
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'agents/creator.md', line: 5, context: 'uses task' },
        ]),
      });

      const result = await checkDuplicateArtefact('my-task', 'A task that does something');

      expect(result).not.toBeNull();
      expect(result.duplicates).toHaveLength(1);
      expect(result.references).toHaveLength(1);
      expect(result.warning).toContain('Similar artefact exists');
      expect(result.warning).toContain('IDS Article IV-A');
    });

    // === T4: checkDuplicateArtefact without match ===
    it('should return null when no matches found (T4)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({ matches: [], codebaseOverview: {} }),
      });
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([]),
      });

      const result = await checkDuplicateArtefact('brand-new-artefact', 'completely new thing');

      expect(result).toBeNull();
    });

    // === T5: checkDuplicateArtefact without provider ===
    it('should return null without throw when no provider (T5)', async () => {
      setupProviderUnavailable();

      const result = await checkDuplicateArtefact('test', 'some description');

      expect(result).toBeNull();
      expect(getEnricher).not.toHaveBeenCalled();
    });

    it('should use name as fallback when description is empty', async () => {
      setupProviderAvailable();
      const enricher = createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({ matches: [], codebaseOverview: {} }),
      });
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([]),
      });

      await checkDuplicateArtefact('my-task', '');

      expect(enricher.detectDuplicates).toHaveBeenCalledWith('my-task', { path: '.' });
    });

    it('should return results with only duplicate matches (no refs)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({
          matches: [{ file: 'tasks/similar.md' }],
          codebaseOverview: {},
        }),
      });
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([]),
      });

      const result = await checkDuplicateArtefact('task-name', 'description');

      expect(result).not.toBeNull();
      expect(result.duplicates).toHaveLength(1);
      expect(result.references).toHaveLength(0);
    });

    it('should return results with only reference matches (no dupes)', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockResolvedValue({ matches: [] }),
      });
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'index.js', line: 10 },
        ]),
      });

      const result = await checkDuplicateArtefact('existing-symbol', 'description');

      expect(result).not.toBeNull();
      expect(result.duplicates).toHaveLength(0);
      expect(result.references).toHaveLength(1);
    });

    it('should return null if both name and description are empty', async () => {
      setupProviderAvailable();

      const result = await checkDuplicateArtefact('', '');

      expect(result).toBeNull();
    });

    it('should return null when enricher throws', async () => {
      setupProviderAvailable();
      createMockEnricher({
        detectDuplicates: jest.fn().mockRejectedValue(new Error('provider error')),
      });
      createMockClient({
        findReferences: jest.fn().mockRejectedValue(new Error('provider error')),
      });

      const result = await checkDuplicateArtefact('test', 'desc');

      expect(result).toBeNull();
    });
  });

  // === T6: enrichRegistryEntry with provider ===
  describe('enrichRegistryEntry', () => {
    it('should return usedBy and dependencies when provider available (T6)', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/a.js', line: 1, context: 'require(entity)' },
          { file: 'src/b.js', line: 5, context: 'require(entity)' },
          { file: 'src/a.js', line: 10, context: 'entity.method()' },
        ]),
        analyzeDependencies: jest.fn().mockResolvedValue({
          nodes: ['dep1', 'dep2'],
          edges: [{ from: 'entity', to: 'dep1' }],
        }),
      });

      const result = await enrichRegistryEntry('my-entity', 'src/my-entity.js');

      expect(result).not.toBeNull();
      expect(result.usedBy).toEqual(['src/a.js', 'src/b.js']); // Deduplicated
      expect(result.dependencies.nodes).toHaveLength(2);
      expect(result.dependencies.edges).toHaveLength(1);
    });

    // === T7: enrichRegistryEntry without provider ===
    it('should return null without throw when no provider (T7)', async () => {
      setupProviderUnavailable();

      const result = await enrichRegistryEntry('entity', 'path/entity.js');

      expect(result).toBeNull();
      expect(getClient).not.toHaveBeenCalled();
    });

    // === T8: enrichRegistryEntry with partial data ===
    it('should return partial data when only usedBy available (T8a)', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/consumer.js', line: 3 },
        ]),
        analyzeDependencies: jest.fn().mockRejectedValue(new Error('timeout')),
      });

      const result = await enrichRegistryEntry('entity', 'src/entity.js');

      expect(result).not.toBeNull();
      expect(result.usedBy).toEqual(['src/consumer.js']);
      expect(result.dependencies).toEqual({ nodes: [], edges: [] });
    });

    it('should return partial data when only dependencies available (T8b)', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockRejectedValue(new Error('timeout')),
        analyzeDependencies: jest.fn().mockResolvedValue({
          nodes: ['dep1'],
          edges: [],
        }),
      });

      const result = await enrichRegistryEntry('entity', 'src/entity.js');

      expect(result).not.toBeNull();
      expect(result.usedBy).toEqual([]);
      expect(result.dependencies.nodes).toEqual(['dep1']);
    });

    it('should return null if both name and path are empty', async () => {
      setupProviderAvailable();

      const result = await enrichRegistryEntry('', '');

      expect(result).toBeNull();
    });

    it('should skip analyzeDependencies when entityPath is empty', async () => {
      setupProviderAvailable();
      const client = createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/user.js', line: 1 },
        ]),
      });

      const result = await enrichRegistryEntry('entity', '');

      expect(result).not.toBeNull();
      expect(result.usedBy).toEqual(['src/user.js']);
      expect(client.analyzeDependencies).not.toHaveBeenCalled();
    });

    it('should deduplicate usedBy files', async () => {
      setupProviderAvailable();
      createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: 'src/a.js', line: 1 },
          { file: 'src/a.js', line: 5 },
          { file: 'src/a.js', line: 10 },
          { file: 'src/b.js', line: 1 },
        ]),
      });

      const result = await enrichRegistryEntry('entity', '');

      expect(result.usedBy).toEqual(['src/a.js', 'src/b.js']);
    });
  });

  // === T9: All functions fallback (provider unavailable) ===
  describe('All functions fallback (T9)', () => {
    beforeEach(() => {
      setupProviderUnavailable();
    });

    it('all 3 functions return null when no provider', async () => {
      const results = await Promise.all([
        getCodebaseContext('.'),
        checkDuplicateArtefact('name', 'desc'),
        enrichRegistryEntry('entity', 'path.js'),
      ]);

      expect(results).toEqual([null, null, null]);
    });
  });

  // === T10: Input vazio/null em todas as funcoes ===
  describe('Empty/null input handling (T10)', () => {
    it('getCodebaseContext with empty path uses default', async () => {
      setupProviderAvailable();
      const enricher = createMockEnricher({
        describeProject: jest.fn().mockResolvedValue({ codebase: {}, stats: {} }),
        getConventions: jest.fn().mockResolvedValue({ patterns: [], stats: {} }),
      });

      await getCodebaseContext('');

      expect(enricher.describeProject).toHaveBeenCalledWith('.');
    });

    it('checkDuplicateArtefact with null inputs returns null', async () => {
      const result = await checkDuplicateArtefact(null, null);
      expect(result).toBeNull();
    });

    it('enrichRegistryEntry with null inputs returns null', async () => {
      const result = await enrichRegistryEntry(null, null);
      expect(result).toBeNull();
    });
  });

  // === Private helpers ===
  describe('_formatDuplicateWarning', () => {
    it('should format with both duplicates and refs', () => {
      const msg = _formatDuplicateWarning(
        'my-task',
        { matches: [{ file: 'tasks/similar.md' }] },
        [{ file: 'agents/user.md', line: 2 }]
      );

      expect(msg).toContain('Similar artefact exists: tasks/similar.md');
      expect(msg).toContain('"my-task" already referenced in 1 location(s)');
      expect(msg).toContain('IDS Article IV-A');
    });

    it('should format with only duplicates', () => {
      const msg = _formatDuplicateWarning(
        'my-task',
        { matches: [{ file: 'tasks/old.md' }] },
        null
      );

      expect(msg).toContain('Similar artefact exists');
      expect(msg).toContain('IDS Article IV-A');
    });

    it('should format with only refs', () => {
      const msg = _formatDuplicateWarning(
        'my-task',
        null,
        [{ file: 'index.js', line: 5 }]
      );

      expect(msg).toContain('"my-task" already referenced');
      expect(msg).toContain('IDS Article IV-A');
    });

    it('should use path fallback when file not available', () => {
      const msg = _formatDuplicateWarning(
        'task',
        { matches: [{ path: 'alt/path.md' }] },
        null
      );

      expect(msg).toContain('Similar artefact exists: alt/path.md');
    });
  });
});
