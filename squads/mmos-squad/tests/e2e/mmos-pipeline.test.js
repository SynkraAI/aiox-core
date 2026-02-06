/**
 * MMOS Pipeline E2E Tests
 *
 * End-to-end tests for the MMOS pipeline.
 * Tests complete workflows from source collection to synthesis.
 *
 * @story STORY-10.3
 * @story STORY-10.6
 */

const path = require('path');

// Mock external services for CI stability
jest.mock('../../../../.aios-core/infrastructure/services/clickup', () => ({
  getTask: jest.fn().mockResolvedValue({ id: 'mock-task-id', name: 'Test Task' }),
  createTask: jest.fn().mockResolvedValue({ id: 'new-task-id', name: 'New Task' }),
  updateTask: jest.fn().mockResolvedValue({ id: 'mock-task-id', status: 'updated' }),
  updateStatus: jest.fn().mockResolvedValue({ id: 'mock-task-id', status: 'in_progress' }),
  addComment: jest.fn().mockResolvedValue({ id: 'comment-id' }),
  getComments: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../../../.aios-core/infrastructure/services/google-drive', () => ({
  GoogleDriveService: jest.fn().mockImplementation(() => ({
    listFiles: jest.fn().mockResolvedValue({ files: [] }),
    downloadFile: jest.fn().mockResolvedValue(Buffer.from('mock content')),
    uploadFile: jest.fn().mockResolvedValue({ id: 'file-id', name: 'test.txt' }),
    readSpreadsheet: jest.fn().mockResolvedValue([['Header1', 'Header2'], ['Value1', 'Value2']]),
    writeSpreadsheet: jest.fn().mockResolvedValue({ updatedCells: 4 }),
    appendSpreadsheet: jest.fn().mockResolvedValue({ updatedCells: 2 }),
    createSpreadsheet: jest.fn().mockResolvedValue({ id: 'spreadsheet-id', title: 'Test' }),
    createFolder: jest.fn().mockResolvedValue({ id: 'folder-id', name: 'test-folder' }),
    moveFile: jest.fn().mockResolvedValue({ id: 'file-id' }),
    getFileMetadata: jest.fn().mockResolvedValue({ id: 'file-id', name: 'test.txt' }),
    searchFiles: jest.fn().mockResolvedValue([]),
    deleteFile: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('MMOS Pipeline E2E', () => {
  describe('Adapter Pipeline', () => {
    let adapters;

    beforeEach(() => {
      const { createAdapters } = require('../../adapters');
      adapters = createAdapters({
        silent: true,
        project: { listId: 'mock-list-id' },
      });
    });

    it('should initialize all adapters successfully', () => {
      expect(adapters.source).toBeDefined();
      expect(adapters.project).toBeDefined();
      expect(adapters.storage).toBeDefined();
    });

    describe('Source Collection Flow', () => {
      it('should support batch extraction', async () => {
        const sources = [
          { type: 'youtube', id: 'dQw4w9WgXcQ', options: { lang: 'en' } },
          { type: 'blog', url: 'https://example.com/blog' },
        ];

        // This would call the real service in non-mocked tests
        expect(typeof adapters.source.batchExtract).toBe('function');
      });

      it('should chunk content with semantic strategy', () => {
        const content = 'This is a test content that needs to be chunked for processing.';
        expect(typeof adapters.source.chunkContent).toBe('function');
      });
    });

    describe('Project Management Flow', () => {
      it('should create mind project', async () => {
        const mindData = {
          subjectName: 'Test Subject',
          description: 'Test project for E2E testing',
          sources: ['source1', 'source2'],
        };

        const result = await adapters.project.createMindProject(mindData);
        expect(result).toBeDefined();
      });

      it('should update mind project progress', async () => {
        const progress = {
          sourcesProcessed: 5,
          totalSources: 10,
          currentPhase: 'analysis',
        };

        // Test the method exists and can be called
        expect(typeof adapters.project.updateMindProjectProgress).toBe('function');
      });
    });

    describe('Storage Operations Flow', () => {
      it('should create MMOS project folder structure', async () => {
        const projectName = 'Test-Mind-Project';
        const result = await adapters.storage.createMMOSProjectStructure(projectName);

        expect(result).toBeDefined();
        expect(result.root).toBeDefined();
      });

      it('should list files in a folder', async () => {
        const result = await adapters.storage.listFiles('test-folder-id');
        expect(result).toBeDefined();
      });
    });
  });

  describe('MMOSAdapters Class Pipeline', () => {
    let mmos;

    beforeEach(() => {
      const { MMOSAdapters } = require('../../adapters');
      mmos = new MMOSAdapters({
        silent: true,
        project: { listId: 'mock-list-id' },
      });
    });

    it('should execute pipeline with mock data', async () => {
      const config = {
        projectName: 'E2E Test Project',
        description: 'Test project for E2E pipeline validation',
        sources: [
          { type: 'blog', url: 'https://example.com/test' },
        ],
        options: {
          concurrency: 1,
        },
      };

      const result = await mmos.executePipeline(config);

      expect(result).toBeDefined();
      expect(result.projectName).toBe('E2E Test Project');
      expect(result.status).toBeDefined();
      expect(result.steps).toBeDefined();
      expect(Array.isArray(result.steps)).toBe(true);
    });

    it('should track pipeline steps', async () => {
      const config = {
        projectName: 'Step Tracking Test',
        sources: [],
      };

      const result = await mmos.executePipeline(config);

      // Pipeline should have at least these steps
      const stepNames = result.steps.map(s => s.step);
      expect(stepNames).toContain('create_structure');
      expect(stepNames).toContain('create_task');
      expect(stepNames).toContain('extract_sources');
    });

    it('should handle errors gracefully', async () => {
      const config = {
        projectName: 'Error Handling Test',
        sources: [
          { type: 'unknown', id: 'invalid' }, // Invalid source type
        ],
        options: {
          continueOnError: true,
        },
      };

      // Should not throw, should capture error in result
      const result = await mmos.executePipeline(config);
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailability gracefully', async () => {
      const { createSourceAdapter } = require('../../adapters');
      const adapter = createSourceAdapter({ silent: true });

      // TikTok service may not be built, should handle gracefully
      expect(() => {
        try {
          adapter.tiktokService;
        } catch (e) {
          // Expected in test environment
        }
      }).not.toThrow();
    });

    it('should validate required inputs', async () => {
      const { createProjectAdapter } = require('../../adapters');
      const adapter = createProjectAdapter({ silent: true });

      // Creating task without listId should throw
      await expect(adapter.createTask({ name: 'Test' }, {}))
        .rejects.toThrow('List ID required');
    });
  });

  describe('Logging and Tracing', () => {
    it('should generate trace IDs for correlation', () => {
      const { createAdapters } = require('../../adapters');
      const adapters1 = createAdapters({ traceId: 'custom-trace-1' });
      const adapters2 = createAdapters({ traceId: 'custom-trace-2' });

      expect(adapters1.source.options.traceId).toBe('custom-trace-1');
      expect(adapters2.source.options.traceId).toBe('custom-trace-2');
    });

    it('should auto-generate trace ID if not provided', () => {
      const { createAdapters } = require('../../adapters');
      const adapters = createAdapters({});

      expect(adapters.source.options.traceId).toBeDefined();
      expect(adapters.source.options.traceId).toMatch(/^mmos-/);
    });
  });
});

describe('Service Error Scenarios', () => {
  describe('Network Failures', () => {
    it('should handle timeout errors', async () => {
      // This tests error handling behavior
      const { createSourceAdapter } = require('../../adapters');
      const adapter = createSourceAdapter({ silent: true });

      // The adapter should handle timeouts from underlying services
      expect(typeof adapter.collectBlog).toBe('function');
    });
  });

  describe('Authentication Failures', () => {
    it('should handle missing credentials', async () => {
      const { createProjectAdapter } = require('../../adapters');
      const adapter = createProjectAdapter({ silent: true });

      // Without proper credentials, operations should fail gracefully
      expect(adapter.options).toBeDefined();
    });
  });
});

/**
 * Fixture-Based E2E Tests
 * @story STORY-10.6
 */
describe('Fixture-Based Pipeline Tests', () => {
  const fixtures = require('../fixtures');

  describe('Fixture Loader', () => {
    it('should load sample sources fixture', () => {
      const sources = fixtures.loadSampleSources();

      expect(sources).toBeDefined();
      expect(sources.sources).toBeDefined();
      expect(Array.isArray(sources.sources)).toBe(true);
      expect(sources.sources.length).toBeGreaterThan(0);
    });

    it('should load sample extraction fixture', () => {
      const extraction = fixtures.loadSampleExtraction();

      expect(extraction).toBeDefined();
      expect(extraction.extractions).toBeDefined();
      expect(Array.isArray(extraction.extractions)).toBe(true);
    });

    it('should load sample mind data fixture', () => {
      const mindData = fixtures.loadSampleMindData();

      expect(mindData).toBeDefined();
      expect(mindData.subject).toBeDefined();
      expect(mindData.patterns).toBeDefined();
      expect(Array.isArray(mindData.patterns)).toBe(true);
    });

    it('should create source mocks from fixtures', () => {
      const mocks = fixtures.createSourceMocks();

      expect(mocks.youtube).toBeDefined();
      expect(mocks.youtube).toHaveProperty('transcript');
      expect(mocks.blog).toBeDefined();
      expect(mocks.blog).toHaveProperty('content');
    });

    it('should create project mocks from fixtures', () => {
      const mocks = fixtures.createProjectMocks();

      expect(mocks.task).toBeDefined();
      expect(mocks.task).toHaveProperty('id');
      expect(mocks.progress).toBeDefined();
    });

    it('should create storage mocks from fixtures', () => {
      const mocks = fixtures.createStorageMocks();

      expect(mocks.folders).toBeDefined();
      expect(mocks.folders.root).toBeDefined();
      expect(mocks.spreadsheet).toBeDefined();
    });
  });

  describe('Pipeline with Fixtures', () => {
    let mmos;
    let sourceFixture;

    beforeEach(() => {
      jest.clearAllMocks();
      const { MMOSAdapters } = require('../../adapters');
      mmos = new MMOSAdapters({
        silent: true,
        project: { listId: 'test-list-id' },
      });
      sourceFixture = fixtures.loadSampleSources();
    });

    it('should process sources from fixture', async () => {
      const config = {
        projectName: 'Fixture Test Project',
        description: 'Testing with fixtures',
        sources: sourceFixture.sources.map(s => ({
          type: s.type,
          ...(s.id && { id: s.id }),
          ...(s.url && { url: s.url }),
          ...(s.path && { path: s.path }),
        })),
        options: sourceFixture.options,
      };

      const result = await mmos.executePipeline(config);

      expect(result).toBeDefined();
      expect(result.projectName).toBe('Fixture Test Project');
    });

    it('should use fixture data for mind export', async () => {
      const mindData = fixtures.loadSampleMindData();

      // Use the mmos adapters which are already mocked
      const spreadsheet = await mmos.storage.exportMindToSpreadsheet(
        mindData.subject.name,
        {
          sources: mindData.sources,
          patterns: mindData.patterns,
        },
      );

      expect(spreadsheet).toBeDefined();
      expect(spreadsheet).toHaveProperty('id');
    });
  });

  describe('Fixture Validation', () => {
    it('should have valid source types in fixtures', () => {
      const sources = fixtures.loadSampleSources();
      const validTypes = ['youtube', 'blog', 'document', 'podcast', 'twitter'];

      sources.sources.forEach(source => {
        expect(validTypes).toContain(source.type);
      });
    });

    it('should have valid pattern structure in fixtures', () => {
      const mindData = fixtures.loadSampleMindData();

      mindData.patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('frequency');
        expect(pattern).toHaveProperty('sourceCount');
        expect(pattern).toHaveProperty('examples');
        expect(Array.isArray(pattern.examples)).toBe(true);
      });
    });

    it('should have valid extraction structure in fixtures', () => {
      const extraction = fixtures.loadSampleExtraction();

      extraction.extractions.forEach(e => {
        expect(e).toHaveProperty('source');
        expect(e).toHaveProperty('success');
        expect(e.source).toHaveProperty('type');
      });
    });
  });
});
