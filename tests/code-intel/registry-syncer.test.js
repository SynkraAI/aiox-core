'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { RegistrySyncer, inferRole, ROLE_MAP } = require('../../.aiox-core/core/code-intel/registry-syncer');

// Mock fs module for controlled testing
jest.mock('fs');

// Mock code-intel index (fallback check)
jest.mock('../../.aiox-core/core/code-intel', () => ({
  getClient: jest.fn(),
  isCodeIntelAvailable: jest.fn().mockReturnValue(false),
}));

// Mock registry-loader
jest.mock('../../.aiox-core/core/ids/registry-loader', () => {
  const DEFAULT_REGISTRY_PATH = '/mock/entity-registry.yaml';
  return {
    RegistryLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn().mockReturnValue({
        metadata: { version: '1.0.0', lastUpdated: null, entityCount: 3 },
        entities: {
          tasks: {
            'dev-develop-story': {
              path: '.aiox-core/development/tasks/dev-develop-story.md',
              type: 'task',
              purpose: 'Develop story',
              keywords: ['develop', 'story'],
              usedBy: [],
              dependencies: [],
            },
            'create-next-story': {
              path: '.aiox-core/development/tasks/create-next-story.md',
              type: 'task',
              purpose: 'Create next story',
              keywords: ['create', 'story'],
              usedBy: [],
              dependencies: [],
            },
          },
          scripts: {
            'greeting-builder': {
              path: '.aiox-core/development/scripts/greeting-builder.js',
              type: 'script',
              purpose: 'Build agent greetings',
              keywords: ['greeting', 'builder'],
              usedBy: [],
              dependencies: [],
            },
          },
        },
        categories: ['tasks', 'scripts'],
      }),
    })),
    DEFAULT_REGISTRY_PATH,
  };
});

function createMockClient(overrides = {}) {
  return {
    findReferences: jest.fn().mockResolvedValue([
      { file: '.aiox-core/development/tasks/create-next-story.md' },
    ]),
    analyzeDependencies: jest.fn().mockResolvedValue({
      dependencies: [
        { path: '../ids/registry-loader' },
        { path: 'fs' },
      ],
    }),
    _activeProvider: { name: 'code-graph' },
    ...overrides,
  };
}

function createSyncer(options = {}) {
  return new RegistrySyncer({
    registryPath: '/mock/entity-registry.yaml',
    repoRoot: '/mock/repo',
    client: options.client || createMockClient(),
    logger: options.logger || jest.fn(),
    ...options,
  });
}

describe('RegistrySyncer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default fs mocks
    fs.existsSync.mockReturnValue(true);
    fs.writeFileSync.mockImplementation(() => {});
    fs.renameSync.mockImplementation(() => {});
    fs.statSync.mockReturnValue({ mtimeMs: Date.now() + 10000 }); // Future mtime = always process
  });

  // T1: Batch sync with mock provider (happy path)
  describe('Batch sync (T1 — AC1)', () => {
    it('should process all entities in registry', async () => {
      const logger = jest.fn();
      const syncer = createSyncer({ logger });

      const stats = await syncer.sync({ full: true });

      expect(stats.total).toBe(3);
      expect(stats.processed).toBe(3);
      expect(stats.skipped).toBe(0);
      expect(stats.errors).toBe(0);
    });

    it('should call atomic write after sync', async () => {
      const syncer = createSyncer();
      await syncer.sync({ full: true });

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.tmp'),
        expect.any(String),
        'utf8'
      );
      expect(fs.renameSync).toHaveBeenCalled();
    });
  });

  // T2: usedBy population via findReferences (AC2)
  describe('usedBy population (T2 — AC2)', () => {
    it('should populate usedBy with entity IDs from findReferences', async () => {
      const mockClient = createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: '.aiox-core/development/tasks/create-next-story.md' },
        ]),
      });
      const syncer = createSyncer({ client: mockClient });
      await syncer.sync({ full: true });

      expect(mockClient.findReferences).toHaveBeenCalled();
      // Verify the call was made for entity IDs
      const calls = mockClient.findReferences.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });

    it('should deduplicate usedBy entries', async () => {
      const mockClient = createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: '.aiox-core/development/tasks/create-next-story.md' },
          { file: '.aiox-core/development/tasks/create-next-story.md' }, // Duplicate
        ]),
      });
      const syncer = createSyncer({ client: mockClient });

      const entities = {
        tasks: {
          'test-entity': {
            path: '.aiox-core/development/tasks/test.md',
            usedBy: [],
            dependencies: [],
          },
        },
      };

      const result = await syncer.syncEntity(
        { id: 'test-entity', category: 'tasks', data: entities.tasks['test-entity'] },
        entities,
        true
      );

      expect(result).toBe(true);
      // usedBy should be deduplicated
      const usedBy = entities.tasks['test-entity'].usedBy;
      const unique = [...new Set(usedBy)];
      expect(usedBy.length).toBe(unique.length);
    });
  });

  // T3: Dependencies population via analyzeDependencies (AC3)
  describe('Dependencies population (T3 — AC3)', () => {
    it('should populate dependencies for JS files via analyzeDependencies', async () => {
      const mockClient = createMockClient({
        analyzeDependencies: jest.fn().mockResolvedValue({
          dependencies: [
            { path: '../ids/registry-loader' },
            { path: './helper' },
          ],
        }),
      });
      const syncer = createSyncer({ client: mockClient });

      const entity = {
        id: 'greeting-builder',
        category: 'scripts',
        data: {
          path: '.aiox-core/development/scripts/greeting-builder.js',
          usedBy: [],
          dependencies: [],
        },
      };

      await syncer.syncEntity(entity, {}, true);

      expect(mockClient.analyzeDependencies).toHaveBeenCalled();
      expect(entity.data.dependencies).toContain('../ids/registry-loader');
      expect(entity.data.dependencies).toContain('./helper');
    });

    it('should NOT call analyzeDependencies for non-JS files', async () => {
      const mockClient = createMockClient();
      const syncer = createSyncer({ client: mockClient });

      const entity = {
        id: 'dev-develop-story',
        category: 'tasks',
        data: {
          path: '.aiox-core/development/tasks/dev-develop-story.md',
          usedBy: [],
          dependencies: [],
        },
      };

      await syncer.syncEntity(entity, {}, true);

      expect(mockClient.analyzeDependencies).not.toHaveBeenCalled();
    });
  });

  // T4: codeIntelMetadata schema (AC4)
  describe('codeIntelMetadata schema (T4 — AC4)', () => {
    it('should add codeIntelMetadata with correct fields', async () => {
      const syncer = createSyncer();

      const entity = {
        id: 'dev-develop-story',
        category: 'tasks',
        data: {
          path: '.aiox-core/development/tasks/dev-develop-story.md',
          usedBy: [],
          dependencies: [],
        },
      };

      await syncer.syncEntity(entity, {}, true);

      const metadata = entity.data.codeIntelMetadata;
      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty('callerCount');
      expect(metadata).toHaveProperty('role');
      expect(metadata).toHaveProperty('lastSynced');
      expect(metadata).toHaveProperty('provider');
      expect(typeof metadata.callerCount).toBe('number');
      expect(typeof metadata.role).toBe('string');
      expect(typeof metadata.lastSynced).toBe('string');
      expect(typeof metadata.provider).toBe('string');
    });

    it('should set callerCount based on usedBy length', async () => {
      const mockClient = createMockClient({
        findReferences: jest.fn().mockResolvedValue([
          { file: '.aiox-core/development/tasks/create-next-story.md' },
          { file: '.aiox-core/development/scripts/greeting-builder.js' },
        ]),
      });
      const syncer = createSyncer({ client: mockClient });

      const entities = {
        tasks: {
          'test-entity': {
            path: '.aiox-core/development/tasks/test.md',
            usedBy: [],
            dependencies: [],
          },
          'create-next-story': {
            path: '.aiox-core/development/tasks/create-next-story.md',
          },
        },
        scripts: {
          'greeting-builder': {
            path: '.aiox-core/development/scripts/greeting-builder.js',
          },
        },
      };

      await syncer.syncEntity(
        { id: 'test-entity', category: 'tasks', data: entities.tasks['test-entity'] },
        entities,
        true
      );

      expect(entities.tasks['test-entity'].codeIntelMetadata.callerCount).toBe(
        entities.tasks['test-entity'].usedBy.length
      );
    });

    it('should set provider from active provider name', async () => {
      const syncer = createSyncer();

      const entity = {
        id: 'test',
        category: 'tasks',
        data: { path: '.aiox-core/development/tasks/test.md', usedBy: [], dependencies: [] },
      };

      await syncer.syncEntity(entity, {}, true);
      expect(entity.data.codeIntelMetadata.provider).toBe('code-graph');
    });
  });

  // T5: Fallback sem provider (AC5)
  describe('Fallback without provider (T5 — AC5)', () => {
    it('should skip enrichment and log message when no provider available', async () => {
      const logger = jest.fn();
      const syncer = new RegistrySyncer({
        registryPath: '/mock/entity-registry.yaml',
        repoRoot: '/mock/repo',
        client: null, // No client
        logger,
      });

      const stats = await syncer.sync();

      expect(stats.aborted).toBe(true);
      expect(stats.processed).toBe(0);
      expect(logger).toHaveBeenCalledWith(
        expect.stringContaining('No code intelligence provider available')
      );
      // Registry should NOT be written
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(fs.renameSync).not.toHaveBeenCalled();
    });
  });

  // T6: Incremental sync — skip unchanged entity (AC6)
  describe('Incremental sync — skip unchanged (T6 — AC6)', () => {
    it('should skip entity when mtime <= lastSynced', async () => {
      const pastDate = new Date('2026-01-01T00:00:00Z');
      fs.statSync.mockReturnValue({ mtimeMs: pastDate.getTime() });

      const syncer = createSyncer();

      const entity = {
        id: 'dev-develop-story',
        category: 'tasks',
        data: {
          path: '.aiox-core/development/tasks/dev-develop-story.md',
          usedBy: [],
          dependencies: [],
          codeIntelMetadata: {
            lastSynced: '2026-02-01T00:00:00Z', // After mtime
            callerCount: 0,
            role: 'task',
            provider: 'code-graph',
          },
        },
      };

      const result = await syncer.syncEntity(entity, {}, false); // Incremental
      expect(result).toBe(false); // Skipped
    });
  });

  // T7: Incremental sync — process entity without lastSynced (AC6)
  describe('Incremental sync — process new entity (T7 — AC6)', () => {
    it('should process entity that has no codeIntelMetadata', async () => {
      const syncer = createSyncer();

      const entity = {
        id: 'dev-develop-story',
        category: 'tasks',
        data: {
          path: '.aiox-core/development/tasks/dev-develop-story.md',
          usedBy: [],
          dependencies: [],
          // No codeIntelMetadata
        },
      };

      const result = await syncer.syncEntity(entity, {}, false); // Incremental
      expect(result).toBe(true); // Processed
      expect(entity.data.codeIntelMetadata).toBeDefined();
    });

    it('should process entity with codeIntelMetadata but no lastSynced', async () => {
      const syncer = createSyncer();

      const entity = {
        id: 'dev-develop-story',
        category: 'tasks',
        data: {
          path: '.aiox-core/development/tasks/dev-develop-story.md',
          usedBy: [],
          dependencies: [],
          codeIntelMetadata: { callerCount: 0, role: 'task', provider: 'code-graph' },
        },
      };

      const result = await syncer.syncEntity(entity, {}, false); // Incremental
      expect(result).toBe(true); // Processed
    });
  });

  // T8: Full resync — process all regardless of mtime (AC7)
  describe('Full resync (T8 — AC7)', () => {
    it('should process all entities with --full even if lastSynced is recent', async () => {
      const pastDate = new Date('2020-01-01T00:00:00Z');
      fs.statSync.mockReturnValue({ mtimeMs: pastDate.getTime() });

      const logger = jest.fn();
      const syncer = createSyncer({ logger });

      const stats = await syncer.sync({ full: true });

      expect(stats.processed).toBe(3); // All 3 entities
      expect(stats.skipped).toBe(0);
    });
  });

  // T9: Atomic write (temp file + rename)
  describe('Atomic write (T9)', () => {
    it('should write to temp file then rename', async () => {
      const syncer = createSyncer();
      await syncer.sync({ full: true });

      // writeFileSync should be called with .tmp extension
      const writeCall = fs.writeFileSync.mock.calls[0];
      expect(writeCall[0]).toMatch(/\.tmp$/);

      // renameSync should be called to replace original
      expect(fs.renameSync).toHaveBeenCalledWith(
        expect.stringContaining('.tmp'),
        '/mock/entity-registry.yaml'
      );
    });

    it('should not corrupt registry on write failure', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      const syncer = createSyncer();

      // sync should throw but original file should be untouched
      await expect(syncer.sync({ full: true })).rejects.toBeDefined();
      // renameSync should NOT have been called
      expect(fs.renameSync).not.toHaveBeenCalled();
    });
  });

  // T10: Entity without source path — skip with warning
  describe('Entity without source (T10)', () => {
    it('should skip entity without path', async () => {
      const syncer = createSyncer();

      const entity = {
        id: 'no-source',
        category: 'tasks',
        data: {
          type: 'task',
          purpose: 'Test',
          usedBy: [],
          dependencies: [],
          // No path
        },
      };

      const result = await syncer.syncEntity(entity, {}, true);
      expect(result).toBe(false);
    });
  });

  // inferRole tests
  describe('inferRole', () => {
    it('should infer role from path patterns', () => {
      expect(inferRole('.aiox-core/development/tasks/dev.md')).toBe('task');
      expect(inferRole('.aiox-core/development/agents/dev.md')).toBe('agent');
      expect(inferRole('.aiox-core/development/workflows/sdc.yaml')).toBe('workflow');
      expect(inferRole('.aiox-core/development/scripts/build.js')).toBe('script');
      expect(inferRole('.aiox-core/core/utils/helper.js')).toBe('module');
      expect(inferRole('.aiox-core/data/entity-registry.yaml')).toBe('config');
      expect(inferRole('.aiox-core/product/templates/prd.yaml')).toBe('template');
    });

    it('should return "unknown" for unmatched paths', () => {
      expect(inferRole('random/path/file.txt')).toBe('unknown');
      expect(inferRole('')).toBe('unknown');
      expect(inferRole(null)).toBe('unknown');
    });
  });

  // getStats tests
  describe('getStats', () => {
    it('should return sync statistics', async () => {
      const syncer = createSyncer();
      await syncer.sync({ full: true });

      const stats = syncer.getStats();
      expect(stats).toHaveProperty('processed');
      expect(stats).toHaveProperty('skipped');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('total');
    });
  });
});
