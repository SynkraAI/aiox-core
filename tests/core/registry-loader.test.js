/**
 * Service Registry Loader Tests
 *
 * Tests for the ServiceRegistry class including:
 * - Cache behavior
 * - Index building
 * - Query methods
 * - Search functionality
 *
 * @story TD-6 - CI Stability & Test Coverage Improvements
 */

const path = require('path');

// Mock fs.promises before requiring the module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

const fs = require('fs').promises;
const {
  ServiceRegistry,
  getDefaultRegistryPaths,
  getRegistry,
} = require('../../.aiox-core/core/registry/registry-loader');

// Set timeout for all tests
jest.setTimeout(30000);

/**
 * Create mock registry data
 */
function createMockRegistryData() {
  return {
    version: '1.0.0',
    generated: '2026-01-04T00:00:00.000Z',
    totalWorkers: 4,
    categories: {
      'data-processing': 2,
      'api-integration': 2,
    },
    workers: [
      {
        id: 'worker-1',
        name: 'Data Processor',
        description: 'Processes data efficiently',
        category: 'data-processing',
        tags: ['fast', 'reliable'],
        agents: ['dev', 'analyst'],
      },
      {
        id: 'worker-2',
        name: 'Data Validator',
        description: 'Validates data formats',
        category: 'data-processing',
        tags: ['validation', 'reliable'],
        agents: ['qa'],
      },
      {
        id: 'worker-3',
        name: 'API Client',
        description: 'HTTP API client',
        category: 'api-integration',
        tags: ['http', 'rest'],
        agents: ['dev'],
      },
      {
        id: 'worker-4',
        name: 'GraphQL Client',
        description: 'GraphQL API client',
        category: 'api-integration',
        tags: ['graphql', 'api'],
        agents: ['dev', 'architect'],
      },
    ],
  };
}

describe('ServiceRegistry', () => {
  let registry;
  let mockData;

  beforeEach(() => {
    mockData = createMockRegistryData();
    fs.readFile.mockResolvedValue(JSON.stringify(mockData));
    registry = new ServiceRegistry({ registryPath: '/mock/path.json' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const reg = new ServiceRegistry();

      expect(reg).toBeDefined();
      expect(reg.registryPath).toBeNull();
      expect(reg.resolvedRegistryPath).toBeNull();
      expect(reg.cache).toBeNull();
      expect(reg.cacheTimestamp).toBe(0);
    });

    it('should create instance with custom path', () => {
      const reg = new ServiceRegistry({ registryPath: '/custom/path.json' });

      expect(reg.registryPath).toBe('/custom/path.json');
    });

    it('should create instance with custom cache TTL', () => {
      const reg = new ServiceRegistry({ cacheTTL: 60000 });

      expect(reg.cacheTTL).toBe(60000);
    });

    it('should initialize empty index maps', () => {
      const reg = new ServiceRegistry();

      expect(reg._byId).toBeInstanceOf(Map);
      expect(reg._byCategory).toBeInstanceOf(Map);
      expect(reg._byTag).toBeInstanceOf(Map);
      expect(reg._byAgent).toBeInstanceOf(Map);
    });
  });

  describe('load', () => {
    it('should load registry from file', async () => {
      const data = await registry.load();

      expect(data).toEqual(mockData);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should cache loaded data', async () => {
      await registry.load();
      await registry.load();

      // Should only read file once due to cache
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should force reload when force=true', async () => {
      await registry.load();
      await registry.load(true);

      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should build indexes after loading', async () => {
      await registry.load();

      expect(registry._byId.size).toBe(4);
      expect(registry._byCategory.size).toBe(2);
      expect(registry._byTag.size).toBeGreaterThan(0);
    });

    it('should throw error on file read failure', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(registry.load()).rejects.toThrow('Failed to load registry');
    });

    it('should fall back to the package registry when cwd registry is missing', async () => {
      const cwdSpy = jest
        .spyOn(process, 'cwd')
        .mockReturnValue(path.join(path.sep, 'tmp', 'project-without-registry'));
      const defaultPaths = getDefaultRegistryPaths();
      const fallbackRegistry = new ServiceRegistry();

      fs.readFile.mockImplementation(async (registryPath) => {
        if (registryPath === defaultPaths[0]) {
          throw new Error('File not found');
        }
        return JSON.stringify(mockData);
      });

      try {
        const data = await fallbackRegistry.load();

        expect(data).toEqual(mockData);
        expect(fs.readFile).toHaveBeenNthCalledWith(1, defaultPaths[0], 'utf8');
        expect(fs.readFile).toHaveBeenNthCalledWith(2, defaultPaths[1], 'utf8');
        expect(fallbackRegistry.resolvedRegistryPath).toBe(defaultPaths[1]);
      } finally {
        cwdSpy.mockRestore();
      }
    });

    it('should not fall back when an explicit registry path is provided', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(registry.load()).rejects.toThrow('Failed to load registry');

      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledWith('/mock/path.json', 'utf8');
    });
  });

  describe('getById', () => {
    it('should return worker by ID', async () => {
      const worker = await registry.getById('worker-1');

      expect(worker).toBeDefined();
      expect(worker.id).toBe('worker-1');
      expect(worker.name).toBe('Data Processor');
    });

    it('should return null for non-existent ID', async () => {
      const worker = await registry.getById('non-existent');

      expect(worker).toBeNull();
    });
  });

  describe('getByCategory', () => {
    it('should return workers by category', async () => {
      const workers = await registry.getByCategory('data-processing');

      expect(workers).toHaveLength(2);
      expect(workers.every((w) => w.category === 'data-processing')).toBe(true);
    });

    it('should return empty array for non-existent category', async () => {
      const workers = await registry.getByCategory('non-existent');

      expect(workers).toEqual([]);
    });
  });

  describe('getByTag', () => {
    it('should return workers by tag', async () => {
      const workers = await registry.getByTag('reliable');

      expect(workers).toHaveLength(2);
    });

    it('should return empty array for non-existent tag', async () => {
      const workers = await registry.getByTag('non-existent');

      expect(workers).toEqual([]);
    });
  });

  describe('getByTags', () => {
    it('should return workers with all specified tags', async () => {
      const workers = await registry.getByTags(['reliable']);

      expect(workers).toHaveLength(2);
    });

    it('should filter to workers with ALL tags', async () => {
      const workers = await registry.getByTags(['fast', 'reliable']);

      expect(workers).toHaveLength(1);
      expect(workers[0].id).toBe('worker-1');
    });

    it('should return empty array for empty tags', async () => {
      const workers = await registry.getByTags([]);

      expect(workers).toEqual([]);
    });

    it('should delegate to getByTag for single tag', async () => {
      const spy = jest.spyOn(registry, 'getByTag');

      await registry.getByTags(['fast']);

      expect(spy).toHaveBeenCalledWith('fast');
    });
  });

  describe('getForAgent', () => {
    it('should return workers for agent', async () => {
      const workers = await registry.getForAgent('dev');

      expect(workers).toHaveLength(3);
    });

    it('should return empty array for unknown agent', async () => {
      const workers = await registry.getForAgent('unknown');

      expect(workers).toEqual([]);
    });
  });

  describe('search', () => {
    it('should search by query string', async () => {
      const results = await registry.search('data');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((w) => w.id === 'worker-1')).toBe(true);
    });

    it('should search case-insensitively', async () => {
      const results = await registry.search('DATA');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const results = await registry.search('client', { category: 'api-integration' });

      expect(results.every((w) => w.category === 'api-integration')).toBe(true);
    });

    it('should respect maxResults', async () => {
      const results = await registry.search('', { maxResults: 2 });

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should rank results by relevance', async () => {
      const results = await registry.search('api');

      // Workers with 'api' in name or tags should be in results
      // worker-3 has 'API' in name (score +8), worker-4 has 'api' in tags (score +5)
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('worker-3'); // 'API Client' - name match scores higher
      expect(results[1].id).toBe('worker-4'); // Has 'api' in tags
    });
  });

  describe('getAll', () => {
    it('should return all workers', async () => {
      const workers = await registry.getAll();

      expect(workers).toHaveLength(4);
    });
  });

  describe('getInfo', () => {
    it('should return registry info', async () => {
      const info = await registry.getInfo();

      expect(info.version).toBe('1.0.0');
      expect(info.totalWorkers).toBe(4);
      expect(info.categories).toContain('data-processing');
      expect(info.categories).toContain('api-integration');
    });
  });

  describe('getCategories', () => {
    it('should return category summary', async () => {
      const categories = await registry.getCategories();

      expect(categories['data-processing']).toBe(2);
      expect(categories['api-integration']).toBe(2);
    });
  });

  describe('getTags', () => {
    it('should return all unique tags sorted', async () => {
      const tags = await registry.getTags();

      expect(Array.isArray(tags)).toBe(true);
      expect(tags.includes('fast')).toBe(true);
      expect(tags.includes('reliable')).toBe(true);
      // Check sorted
      expect(tags).toEqual([...tags].sort());
    });
  });

  describe('exists', () => {
    it('should return true for existing worker', async () => {
      const exists = await registry.exists('worker-1');

      expect(exists).toBe(true);
    });

    it('should return false for non-existing worker', async () => {
      const exists = await registry.exists('non-existent');

      expect(exists).toBe(false);
    });
  });

  describe('count', () => {
    it('should return total worker count', async () => {
      const count = await registry.count();

      expect(count).toBe(4);
    });
  });

  describe('clearCache', () => {
    it('should clear cache and indexes', async () => {
      await registry.load();
      expect(registry.cache).not.toBeNull();

      registry.clearCache();

      expect(registry.cache).toBeNull();
      expect(registry.cacheTimestamp).toBe(0);
      expect(registry.resolvedRegistryPath).toBeNull();
      expect(registry._byId.size).toBe(0);
      expect(registry._byCategory.size).toBe(0);
    });
  });

  describe('getMetrics', () => {
    it('should return metrics when not cached', () => {
      const metrics = registry.getMetrics();

      expect(metrics.cached).toBe(false);
      expect(metrics.cacheAge).toBeNull();
      expect(metrics.workerCount).toBe(0);
    });

    it('should return metrics when cached', async () => {
      await registry.load();
      const metrics = registry.getMetrics();

      expect(metrics.cached).toBe(true);
      expect(metrics.cacheAge).toBeGreaterThanOrEqual(0);
      expect(metrics.workerCount).toBe(4);
      expect(metrics.categoryCount).toBe(2);
    });
  });
});

describe('getRegistry', () => {
  beforeEach(() => {
    // Reset singleton
    const { ServiceRegistry } = require('../../.aiox-core/core/registry/registry-loader');
  });

  it('should return singleton instance', () => {
    const reg1 = getRegistry();
    const reg2 = getRegistry();

    expect(reg1).toBe(reg2);
  });

  it('should create fresh instance with fresh option', () => {
    const reg1 = getRegistry();
    const reg2 = getRegistry({ fresh: true });

    expect(reg1).not.toBe(reg2);
  });

  it('should pass options to new instance', () => {
    const reg = getRegistry({ fresh: true, registryPath: '/custom/path.json' });

    expect(reg.registryPath).toBe('/custom/path.json');
  });
});

describe('Index Building', () => {
  let registry;

  beforeEach(() => {
    const mockData = {
      version: '1.0.0',
      generated: '2026-01-04',
      totalWorkers: 2,
      categories: {},
      workers: [
        {
          id: 'worker-no-tags',
          name: 'No Tags Worker',
          description: 'Worker without tags',
          category: 'misc',
        },
        {
          id: 'worker-no-agents',
          name: 'No Agents Worker',
          description: 'Worker without agents',
          category: 'misc',
          tags: ['solo'],
        },
      ],
    };
    fs.readFile.mockResolvedValue(JSON.stringify(mockData));
    registry = new ServiceRegistry({ registryPath: '/mock/path.json' });
  });

  it('should handle workers without tags', async () => {
    await registry.load();

    const worker = await registry.getById('worker-no-tags');
    expect(worker).toBeDefined();
  });

  it('should handle workers without agents', async () => {
    await registry.load();

    const workers = await registry.getForAgent('any');
    // Should not include worker without agents array
    expect(workers.every((w) => w.agents)).toBe(true);
  });
});
