/**
 * Unit Tests for SquadDownloader
 *
 * Test Coverage:
 * - listAvailable() fetches registry and returns squads
 * - download() creates local squad directory
 * - download() validates after extraction
 * - download() handles version specifier (@version)
 * - download() throws SQUAD_NOT_FOUND for unknown squad
 * - download() throws SQUAD_EXISTS for existing squad
 * - fetchRegistry() caches results
 * - Error handling with proper error codes
 *
 * @see Story SQS-6: Download & Publish Tasks
 */

const path = require('path');
const fs = require('fs').promises;
const {
  SquadDownloader,
  SquadDownloaderError,
  DownloaderErrorCodes,
  REGISTRY_URL,
  GITHUB_API_BASE,
  DEFAULT_SQUADS_PATH,
} = require('../../../.aiox-core/development/scripts/squad');

// Mock https module
jest.mock('https', () => ({
  get: jest.fn(),
}));

const https = require('https');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');
const TEMP_PATH = path.join(__dirname, 'temp-downloads');

// Mock registry data
const mockRegistry = {
  version: '1.0.0',
  squads: {
    official: [
      {
        name: 'etl-squad',
        version: '1.0.0',
        description: 'ETL pipeline automation',
        author: 'SynkraAI',
      },
      {
        name: 'api-squad',
        version: '1.2.0',
        description: 'REST API development',
        author: 'SynkraAI',
      },
    ],
    community: [
      {
        name: 'data-viz-squad',
        version: '0.5.0',
        description: 'Data visualization',
        author: 'community-member',
      },
    ],
  },
};

// Mock GitHub API contents response
const mockContents = [
  {
    name: 'squad.yaml',
    type: 'file',
    download_url: 'https://raw.githubusercontent.com/test/squad.yaml',
  },
  {
    name: 'tasks',
    type: 'dir',
    url: 'https://api.github.com/repos/test/contents/tasks',
  },
];

// Helper to create mock response
function createMockResponse(statusCode, data, headers = {}) {
  const response = {
    statusCode,
    headers,
    on: jest.fn((event, callback) => {
      if (event === 'data') {
        // Return Buffer to match actual HTTPS response behavior
        callback(Buffer.from(JSON.stringify(data), 'utf-8'));
      }
      if (event === 'end') {
        callback();
      }
      return response;
    }),
  };
  return response;
}

describe('SquadDownloader', () => {
  let downloader;
  let consoleLogSpy;

  beforeEach(async () => {
    // Create downloader with temp path
    downloader = new SquadDownloader({
      squadsPath: TEMP_PATH,
      verbose: false,
    });

    // Spy on console
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Clean up temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
    await fs.mkdir(TEMP_PATH, { recursive: true });

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    // Clean up temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  describe('Constants', () => {
    it('should export REGISTRY_URL', () => {
      expect(REGISTRY_URL).toBeDefined();
      expect(REGISTRY_URL).toContain('aiox-squads');
      expect(REGISTRY_URL).toContain('registry.json');
    });

    it('should export GITHUB_API_BASE', () => {
      expect(GITHUB_API_BASE).toBeDefined();
      expect(GITHUB_API_BASE).toContain('api.github.com');
    });

    it('should export DEFAULT_SQUADS_PATH', () => {
      expect(DEFAULT_SQUADS_PATH).toBe('./squads');
    });

    it('should export DownloaderErrorCodes enum', () => {
      expect(DownloaderErrorCodes).toBeDefined();
      expect(DownloaderErrorCodes.REGISTRY_FETCH_ERROR).toBe('REGISTRY_FETCH_ERROR');
      expect(DownloaderErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(DownloaderErrorCodes.DOWNLOAD_ERROR).toBe('DOWNLOAD_ERROR');
      expect(DownloaderErrorCodes.SQUAD_EXISTS).toBe('SQUAD_EXISTS');
      expect(DownloaderErrorCodes.RATE_LIMIT).toBe('RATE_LIMIT');
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultDownloader = new SquadDownloader();
      expect(defaultDownloader.squadsPath).toBe(DEFAULT_SQUADS_PATH);
    });

    it('should use custom squads path when specified', () => {
      const customDownloader = new SquadDownloader({ squadsPath: './custom/path' });
      expect(customDownloader.squadsPath).toBe('./custom/path');
    });

    it('should disable verbose mode by default', () => {
      const defaultDownloader = new SquadDownloader();
      expect(defaultDownloader.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      const verboseDownloader = new SquadDownloader({ verbose: true });
      expect(verboseDownloader.verbose).toBe(true);
    });

    it('should disable overwrite by default', () => {
      const defaultDownloader = new SquadDownloader();
      expect(defaultDownloader.overwrite).toBe(false);
    });

    it('should enable overwrite when specified', () => {
      const overwriteDownloader = new SquadDownloader({ overwrite: true });
      expect(overwriteDownloader.overwrite).toBe(true);
    });

    it('should use custom registry URL when specified', () => {
      const customDownloader = new SquadDownloader({
        registryUrl: 'https://custom.registry/registry.json',
      });
      expect(customDownloader.registryUrl).toBe('https://custom.registry/registry.json');
    });
  });

  describe('SquadDownloaderError', () => {
    it('should create error with code and message', () => {
      const error = new SquadDownloaderError(
        DownloaderErrorCodes.SQUAD_NOT_FOUND,
        'Squad not found',
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('SQUAD_NOT_FOUND');
      expect(error.message).toBe('Squad not found');
      expect(error.name).toBe('SquadDownloaderError');
    });

    it('should include suggestion in error', () => {
      const error = new SquadDownloaderError(
        DownloaderErrorCodes.SQUAD_NOT_FOUND,
        'Squad not found',
        'Use --list to see available squads',
      );

      expect(error.suggestion).toBe('Use --list to see available squads');
    });

    it('should format toString() with suggestion', () => {
      const error = new SquadDownloaderError(
        DownloaderErrorCodes.SQUAD_NOT_FOUND,
        'Squad not found',
        'Use --list',
      );

      const str = error.toString();
      expect(str).toContain('[SQUAD_NOT_FOUND]');
      expect(str).toContain('Squad not found');
      expect(str).toContain('Suggestion: Use --list');
    });
  });

  describe('listAvailable()', () => {
    it('should fetch registry and return squads (Test 3.1)', async () => {
      // Mock the fetch
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      const squads = await downloader.listAvailable();

      expect(squads).toBeInstanceOf(Array);
      expect(squads.length).toBe(3);

      // Check official squads
      const etlSquad = squads.find((s) => s.name === 'etl-squad');
      expect(etlSquad).toBeDefined();
      expect(etlSquad.type).toBe('official');
      expect(etlSquad.version).toBe('1.0.0');

      // Check community squads
      const dataVizSquad = squads.find((s) => s.name === 'data-viz-squad');
      expect(dataVizSquad).toBeDefined();
      expect(dataVizSquad.type).toBe('community');
    });

    it('should include author in squad info', async () => {
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      const squads = await downloader.listAvailable();
      const etlSquad = squads.find((s) => s.name === 'etl-squad');

      expect(etlSquad.author).toBe('SynkraAI');
    });

    it('should throw REGISTRY_FETCH_ERROR on network failure', async () => {
      https.get.mockImplementation((url, options, callback) => {
        return {
          on: jest.fn((event, cb) => {
            if (event === 'error') {
              cb(new Error('Network error'));
            }
          }),
        };
      });

      await expect(downloader.listAvailable()).rejects.toThrow(SquadDownloaderError);
      await expect(downloader.listAvailable()).rejects.toMatchObject({
        code: 'REGISTRY_FETCH_ERROR',
      });
    });
  });

  describe('download()', () => {
    it('should throw SQUAD_EXISTS if squad already exists (Test 3.5)', async () => {
      // Create existing squad directory
      const squadDir = path.join(TEMP_PATH, 'existing-squad');
      await fs.mkdir(squadDir, { recursive: true });
      await fs.writeFile(
        path.join(squadDir, 'squad.yaml'),
        'name: existing-squad\nversion: 1.0.0',
      );

      // Mock registry fetch
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      await expect(downloader.download('existing-squad')).rejects.toThrow(
        SquadDownloaderError,
      );
      await expect(downloader.download('existing-squad')).rejects.toMatchObject({
        code: 'SQUAD_EXISTS',
      });
    });

    it('should allow overwrite when overwrite option is true', async () => {
      // Create existing squad directory
      const squadDir = path.join(TEMP_PATH, 'etl-squad');
      await fs.mkdir(squadDir, { recursive: true });
      await fs.writeFile(path.join(squadDir, 'squad.yaml'), 'name: etl-squad\nversion: 0.9.0');

      // Create downloader with overwrite enabled
      const overwriteDownloader = new SquadDownloader({
        squadsPath: TEMP_PATH,
        overwrite: true,
      });

      // Mock registry and contents fetch - ensure sync callbacks
      https.get.mockImplementation((url, options, callback) => {
        // Handle both (url, callback) and (url, options, callback) signatures
        const cb = typeof options === 'function' ? options : callback;

        setImmediate(() => {
          if (url.includes('registry.json')) {
            cb(createMockResponse(200, mockRegistry));
          } else if (new URL(url).hostname === 'api.github.com') {
            // Return empty array to avoid recursive downloads
            cb(createMockResponse(200, []));
          } else {
            cb(createMockResponse(200, 'name: etl-squad\nversion: 1.0.0'));
          }
        });
        return { on: jest.fn() };
      });

      // Should not throw SQUAD_EXISTS
      await expect(
        overwriteDownloader.download('etl-squad', { validate: false }),
      ).resolves.toBeDefined();
    }, 15000);

    it('should throw SQUAD_NOT_FOUND for unknown squad (Test 3.5)', async () => {
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      await expect(downloader.download('non-existent-squad')).rejects.toThrow(
        SquadDownloaderError,
      );
      await expect(downloader.download('non-existent-squad')).rejects.toMatchObject({
        code: 'SQUAD_NOT_FOUND',
      });
    });

    it('should parse name@version syntax (Test 3.4)', async () => {
      https.get.mockImplementation((url, options, callback) => {
        // Handle both (url, callback) and (url, options, callback) signatures
        const cb = typeof options === 'function' ? options : callback;

        setImmediate(() => {
          if (url.includes('registry.json')) {
            cb(createMockResponse(200, mockRegistry));
          } else if (new URL(url).hostname === 'api.github.com') {
            // Return empty array to avoid recursive downloads
            cb(createMockResponse(200, []));
          } else {
            cb(createMockResponse(200, 'name: etl-squad\nversion: 1.0.0'));
          }
        });
        return { on: jest.fn() };
      });

      // Should parse version from name
      const result = await downloader.download('etl-squad@1.0.0', { validate: false });
      expect(result.path).toContain('etl-squad');
    }, 15000);
  });

  describe('fetchRegistry()', () => {
    it('should fetch and parse registry.json', async () => {
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      const registry = await downloader.fetchRegistry();

      expect(registry.version).toBe('1.0.0');
      expect(registry.squads.official).toHaveLength(2);
      expect(registry.squads.community).toHaveLength(1);
    });

    it('should cache registry results', async () => {
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      // First fetch
      await downloader.fetchRegistry();

      // Second fetch should use cache
      await downloader.fetchRegistry();

      // Should only call https.get once
      expect(https.get).toHaveBeenCalledTimes(1);
    });

    it('should refetch after cache expires', async () => {
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      // First fetch
      await downloader.fetchRegistry();

      // Simulate cache expiry
      downloader._registryCacheTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago

      // Second fetch should refetch
      await downloader.fetchRegistry();

      expect(https.get).toHaveBeenCalledTimes(2);
    });

    it('should handle rate limit response', async () => {
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(403, {}, {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': Math.floor(Date.now() / 1000) + 3600,
        });
        callback(response);
        return { on: jest.fn() };
      });

      await expect(downloader.fetchRegistry()).rejects.toMatchObject({
        code: 'RATE_LIMIT',
      });
    });
  });

  describe('clearCache()', () => {
    it('should clear registry cache', async () => {
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      // Fetch to populate cache
      await downloader.fetchRegistry();
      expect(downloader._registryCache).toBeDefined();

      // Clear cache
      downloader.clearCache();

      expect(downloader._registryCache).toBeNull();
      expect(downloader._registryCacheTime).toBeNull();
    });
  });

  describe('_findSquad()', () => {
    it('should find official squad', () => {
      const squad = downloader._findSquad(mockRegistry, 'etl-squad');

      expect(squad).toBeDefined();
      expect(squad.name).toBe('etl-squad');
      expect(squad.type).toBe('official');
    });

    it('should find community squad', () => {
      const squad = downloader._findSquad(mockRegistry, 'data-viz-squad');

      expect(squad).toBeDefined();
      expect(squad.name).toBe('data-viz-squad');
      expect(squad.type).toBe('community');
    });

    it('should return null for unknown squad', () => {
      const squad = downloader._findSquad(mockRegistry, 'unknown-squad');
      expect(squad).toBeNull();
    });

    it('should handle empty registry', () => {
      const squad = downloader._findSquad({}, 'any-squad');
      expect(squad).toBeNull();
    });

    it('should handle null registry', () => {
      const squad = downloader._findSquad(null, 'any-squad');
      expect(squad).toBeNull();
    });
  });

  describe('Verbose mode', () => {
    it('should log messages in verbose mode', async () => {
      const verboseDownloader = new SquadDownloader({
        squadsPath: TEMP_PATH,
        verbose: true,
      });

      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      await verboseDownloader.listAvailable();

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.some((call) => call[0].includes('[SquadDownloader]'))).toBe(
        true,
      );
    });

    it('should not log messages when verbose is false', async () => {
      https.get.mockImplementation((url, options, callback) => {
        const response = createMockResponse(200, mockRegistry);
        callback(response);
        return { on: jest.fn() };
      });

      await downloader.listAvailable();

      expect(
        consoleLogSpy.mock.calls.filter((call) => call[0].includes('[SquadDownloader]')).length,
      ).toBe(0);
    });
  });
});
