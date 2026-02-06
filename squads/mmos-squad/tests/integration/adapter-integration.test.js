/**
 * Adapter Integration Tests - MMOS Squad
 *
 * Tests adapter imports and basic functionality.
 * Verifies that adapters correctly delegate to infrastructure services.
 *
 * @story STORY-10.3
 * @story STORY-10.6
 */

// Mock external services for CI stability
jest.mock('../../../../.aios-core/infrastructure/services/clickup', () => ({
  getTask: jest.fn().mockResolvedValue({ id: 'task-123', name: 'Test Task' }),
  createTask: jest.fn().mockResolvedValue({ id: 'new-task-id', name: 'New Task' }),
  updateTask: jest.fn().mockResolvedValue({ id: 'task-123', status: 'updated' }),
  updateStatus: jest.fn().mockResolvedValue({ id: 'task-123', status: 'in_progress' }),
  addComment: jest.fn().mockResolvedValue({ id: 'comment-123' }),
  getComments: jest.fn().mockResolvedValue([]),
  updateCustomField: jest.fn().mockResolvedValue({ id: 'task-123' }),
  getCustomFields: jest.fn().mockResolvedValue([]),
  getStatuses: jest.fn().mockResolvedValue([]),
  deleteTask: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../.aios-core/infrastructure/services/google-drive', () => ({
  GoogleDriveService: jest.fn().mockImplementation(() => ({
    listFiles: jest.fn().mockResolvedValue({ files: [], nextPageToken: null }),
    downloadFile: jest.fn().mockResolvedValue(Buffer.from('mock content')),
    uploadFile: jest.fn().mockResolvedValue({ id: 'file-id', name: 'test.txt' }),
    searchFiles: jest.fn().mockResolvedValue([]),
    getFileMetadata: jest.fn().mockResolvedValue({ id: 'file-id', name: 'test.txt' }),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    readSpreadsheet: jest.fn().mockResolvedValue([['Header1'], ['Value1']]),
    writeSpreadsheet: jest.fn().mockResolvedValue({ updatedCells: 4 }),
    appendSpreadsheet: jest.fn().mockResolvedValue({ updatedCells: 2 }),
    createSpreadsheet: jest.fn().mockResolvedValue({ id: 'spreadsheet-id', title: 'Test' }),
    createFolder: jest.fn().mockResolvedValue({ id: 'folder-id', name: 'New Folder' }),
    moveFile: jest.fn().mockResolvedValue({ id: 'file-id' }),
  })),
}));

jest.mock('../../../../.aios-core/infrastructure/services/file-service', () => ({
  FileService: jest.fn().mockImplementation(() => ({
    parsePDF: jest.fn().mockResolvedValue({ text: 'PDF content', pages: 5 }),
    parseWord: jest.fn().mockResolvedValue({ text: 'Word content' }),
    parseExcel: jest.fn().mockResolvedValue({ sheets: [] }),
    parseCSV: jest.fn().mockResolvedValue({ rows: [], headers: [] }),
  })),
}));

jest.mock('../../../../.aios-core/infrastructure/services/etl', () => ({
  ETLService: jest.fn().mockImplementation(() => ({
    extractYouTube: jest.fn().mockResolvedValue({
      transcript: 'Test transcript',
      metadata: { title: 'Test Video' },
    }),
    collectBlog: jest.fn().mockResolvedValue({
      content: 'Blog content',
      url: 'https://example.com',
    }),
    chunkContent: jest.fn().mockReturnValue([
      { text: 'chunk 1', index: 0 },
      { text: 'chunk 2', index: 1 },
    ]),
    filterSpeaker: jest.fn().mockReturnValue([]),
  })),
}));

const path = require('path');

describe('MMOS Adapter Integration', () => {
  describe('Adapter Imports', () => {
    it('should import all adapters without errors', () => {
      expect(() => {
        require('../../adapters');
      }).not.toThrow();
    });

    it('should export SourceAdapter', () => {
      const adapters = require('../../adapters');
      expect(adapters.SourceAdapter).toBeDefined();
      expect(adapters.createSourceAdapter).toBeDefined();
    });

    it('should export ProjectAdapter', () => {
      const adapters = require('../../adapters');
      expect(adapters.ProjectAdapter).toBeDefined();
      expect(adapters.createProjectAdapter).toBeDefined();
    });

    it('should export StorageAdapter', () => {
      const adapters = require('../../adapters');
      expect(adapters.StorageAdapter).toBeDefined();
      expect(adapters.createStorageAdapter).toBeDefined();
    });

    it('should export MMOSAdapters convenience class', () => {
      const adapters = require('../../adapters');
      expect(adapters.MMOSAdapters).toBeDefined();
      expect(adapters.createAdapters).toBeDefined();
    });
  });

  describe('SourceAdapter', () => {
    let sourceAdapter;

    beforeEach(() => {
      const { createSourceAdapter } = require('../../adapters');
      sourceAdapter = createSourceAdapter({ silent: true });
    });

    it('should create instance with default options', () => {
      expect(sourceAdapter).toBeDefined();
      expect(sourceAdapter.options.silent).toBe(true);
    });

    it('should have parseDocument method', () => {
      expect(typeof sourceAdapter.parseDocument).toBe('function');
    });

    it('should have extractYouTube method', () => {
      expect(typeof sourceAdapter.extractYouTube).toBe('function');
    });

    it('should have collectBlog method', () => {
      expect(typeof sourceAdapter.collectBlog).toBe('function');
    });

    it('should have chunkContent method', () => {
      expect(typeof sourceAdapter.chunkContent).toBe('function');
    });

    it('should have batchExtract method', () => {
      expect(typeof sourceAdapter.batchExtract).toBe('function');
    });

    it('should detect document format correctly', () => {
      expect(sourceAdapter.detectFormat('test.pdf')).toBe('pdf');
      expect(sourceAdapter.detectFormat('test.docx')).toBe('word');
      expect(sourceAdapter.detectFormat('test.xlsx')).toBe('excel');
      expect(sourceAdapter.detectFormat('test.csv')).toBe('csv');
    });
  });

  describe('ProjectAdapter', () => {
    let projectAdapter;

    beforeEach(() => {
      const { createProjectAdapter } = require('../../adapters');
      projectAdapter = createProjectAdapter({ silent: true });
    });

    it('should create instance with default options', () => {
      expect(projectAdapter).toBeDefined();
    });

    it('should have getTask method', () => {
      expect(typeof projectAdapter.getTask).toBe('function');
    });

    it('should have createTask method', () => {
      expect(typeof projectAdapter.createTask).toBe('function');
    });

    it('should have updateTask method', () => {
      expect(typeof projectAdapter.updateTask).toBe('function');
    });

    it('should have updateStatus method', () => {
      expect(typeof projectAdapter.updateStatus).toBe('function');
    });

    it('should have addComment method', () => {
      expect(typeof projectAdapter.addComment).toBe('function');
    });

    it('should have createMindProject method', () => {
      expect(typeof projectAdapter.createMindProject).toBe('function');
    });
  });

  describe('StorageAdapter', () => {
    let storageAdapter;

    beforeEach(() => {
      const { createStorageAdapter } = require('../../adapters');
      storageAdapter = createStorageAdapter({ silent: true });
    });

    it('should create instance with default options', () => {
      expect(storageAdapter).toBeDefined();
    });

    it('should have listFiles method', () => {
      expect(typeof storageAdapter.listFiles).toBe('function');
    });

    it('should have downloadFile method', () => {
      expect(typeof storageAdapter.downloadFile).toBe('function');
    });

    it('should have uploadFile method', () => {
      expect(typeof storageAdapter.uploadFile).toBe('function');
    });

    it('should have readSpreadsheet method', () => {
      expect(typeof storageAdapter.readSpreadsheet).toBe('function');
    });

    it('should have createMMOSProjectStructure method', () => {
      expect(typeof storageAdapter.createMMOSProjectStructure).toBe('function');
    });
  });

  describe('createAdapters Factory', () => {
    it('should create all adapters with shared options', () => {
      const { createAdapters } = require('../../adapters');
      const adapters = createAdapters({
        silent: true,
        traceId: 'test-trace-123',
      });

      expect(adapters.source).toBeDefined();
      expect(adapters.project).toBeDefined();
      expect(adapters.storage).toBeDefined();
    });

    it('should pass adapter-specific options', () => {
      const { createAdapters } = require('../../adapters');
      const adapters = createAdapters({
        project: { listId: 'test-list-id' },
        storage: { rootFolderId: 'test-folder-id' },
      });

      expect(adapters.project.options.listId).toBe('test-list-id');
      expect(adapters.storage.options.rootFolderId).toBe('test-folder-id');
    });
  });

  describe('MMOSAdapters Class', () => {
    it('should create instance with all adapters', () => {
      const { MMOSAdapters } = require('../../adapters');
      const mmos = new MMOSAdapters({ silent: true });

      expect(mmos.source).toBeDefined();
      expect(mmos.project).toBeDefined();
      expect(mmos.storage).toBeDefined();
    });

    it('should have executePipeline method', () => {
      const { MMOSAdapters } = require('../../adapters');
      const mmos = new MMOSAdapters({ silent: true });

      expect(typeof mmos.executePipeline).toBe('function');
    });
  });
});

describe('Infrastructure Service Integration', () => {
  describe('ETL Service Integration', () => {
    it('should import ETL service without errors', () => {
      expect(() => {
        require('../../../../.aios-core/infrastructure/services/etl');
      }).not.toThrow();
    });

    it('should export ETLService class', () => {
      const etl = require('../../../../.aios-core/infrastructure/services/etl');
      expect(etl.ETLService).toBeDefined();
    });
  });

  describe('File Service Integration', () => {
    it('should import file-service without errors', () => {
      expect(() => {
        require('../../../../.aios-core/infrastructure/services/file-service');
      }).not.toThrow();
    });
  });

  describe('ClickUp Service Integration', () => {
    it('should import clickup service without errors', () => {
      expect(() => {
        require('../../../../.aios-core/infrastructure/services/clickup');
      }).not.toThrow();
    });
  });

  describe('Google Drive Service Integration', () => {
    it('should import google-drive service without errors', () => {
      expect(() => {
        require('../../../../.aios-core/infrastructure/services/google-drive');
      }).not.toThrow();
    });
  });
});

/**
 * Cross-Adapter Integration Tests
 * @story STORY-10.6
 */
describe('Cross-Adapter Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Source to Storage Flow', () => {
    it('should extract content and store in Google Drive', async () => {
      const { createSourceAdapter, createStorageAdapter } = require('../../adapters');
      const source = createSourceAdapter({ silent: true });
      const storage = createStorageAdapter({ silent: true });

      // Extract from YouTube
      const extraction = await source.extractYouTube('test-video-id');
      expect(extraction).toHaveProperty('transcript');

      // Store extracted content
      const stored = await storage.storeProcessedContent(
        'project-folder-id',
        'extraction-result.json',
        JSON.stringify(extraction),
      );

      expect(stored).toHaveProperty('id');
    });

    it('should batch extract and store results', async () => {
      const { createSourceAdapter, createStorageAdapter } = require('../../adapters');
      const source = createSourceAdapter({ silent: true });
      const storage = createStorageAdapter({ silent: true });

      const sources = [
        { type: 'youtube', id: 'video1' },
        { type: 'blog', url: 'https://example.com' },
      ];

      const results = await source.batchExtract(sources, { continueOnError: true });
      expect(results).toHaveLength(2);

      // Store each successful result
      let storedCount = 0;
      for (const result of results) {
        if (result.success) {
          await storage.storeProcessedContent(
            'project-folder',
            `${result.source.type}-result.json`,
            JSON.stringify(result.result),
          );
          storedCount++;
        }
      }

      expect(storedCount).toBe(2);
    });
  });

  describe('Project to Storage Flow', () => {
    it('should create project task and folder structure', async () => {
      const { createProjectAdapter, createStorageAdapter } = require('../../adapters');
      const project = createProjectAdapter({ silent: true, listId: 'test-list-id' });
      const storage = createStorageAdapter({ silent: true });

      // Create project in ClickUp
      const task = await project.createMindProject({
        subjectName: 'Test Subject',
        description: 'Integration test',
        sources: ['s1', 's2'],
      });

      expect(task).toHaveProperty('id');

      // Create matching folder structure
      const folders = await storage.createMMOSProjectStructure('Test Subject');

      expect(folders.root).toBeDefined();
      expect(folders.sources).toBeDefined();
      expect(folders.processed).toBeDefined();
    });

    it('should update project progress after storage operations', async () => {
      const { createProjectAdapter, createStorageAdapter } = require('../../adapters');
      const project = createProjectAdapter({ silent: true, listId: 'test-list-id' });
      const storage = createStorageAdapter({ silent: true });

      // Create folder structure
      const folders = await storage.createMMOSProjectStructure('Test Project');
      expect(folders).toBeDefined();

      // Update project progress
      const progress = {
        sourcesProcessed: 5,
        totalSources: 10,
        currentPhase: 'analysis',
      };

      await project.updateMindProjectProgress('task-123', progress);

      expect(project.clickup.addComment).toHaveBeenCalled();
      expect(project.clickup.updateTask).toHaveBeenCalled();
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should execute complete pipeline with all adapters', async () => {
      const { MMOSAdapters } = require('../../adapters');
      const mmos = new MMOSAdapters({
        silent: true,
        project: { listId: 'test-list-id' },
        storage: { rootFolderId: 'test-root' },
      });

      const config = {
        projectName: 'Integration Test Project',
        description: 'Full pipeline integration test',
        sources: [
          { type: 'youtube', id: 'video1' },
          { type: 'blog', url: 'https://example.com' },
        ],
        options: {
          concurrency: 1,
          continueOnError: true,
        },
      };

      const result = await mmos.executePipeline(config);

      expect(result).toBeDefined();
      expect(result.projectName).toBe('Integration Test Project');
      expect(result.status).toBeDefined();
      expect(result.steps).toBeDefined();
    });

    it('should coordinate adapters in correct order', async () => {
      const { MMOSAdapters } = require('../../adapters');
      const mmos = new MMOSAdapters({
        silent: true,
        project: { listId: 'test-list-id' },
      });

      const config = {
        projectName: 'Order Test',
        sources: [],
      };

      const result = await mmos.executePipeline(config);

      // Verify step order
      const stepNames = result.steps.map(s => s.step);
      expect(stepNames).toContain('create_structure');
      expect(stepNames).toContain('create_task');
    });
  });

  describe('Adapter State Isolation', () => {
    it('should isolate adapter instances', () => {
      const { createAdapters } = require('../../adapters');

      const adapters1 = createAdapters({
        silent: true,
        project: { listId: 'list-1' },
      });

      const adapters2 = createAdapters({
        silent: true,
        project: { listId: 'list-2' },
      });

      expect(adapters1.project.options.listId).toBe('list-1');
      expect(adapters2.project.options.listId).toBe('list-2');
    });

    it('should share mock state within same test', async () => {
      const { createAdapters } = require('../../adapters');
      const adapters = createAdapters({
        silent: true,
        project: { listId: 'test-list' },
      });

      await adapters.project.createTask({ name: 'Task 1' });
      await adapters.project.createTask({ name: 'Task 2' });

      expect(adapters.project.clickup.createTask).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should continue processing after source extraction failure', async () => {
      const { createSourceAdapter, createStorageAdapter } = require('../../adapters');
      const source = createSourceAdapter({ silent: true });
      const storage = createStorageAdapter({ silent: true });

      const sources = [
        { type: 'youtube', id: 'video1' },
        { type: 'invalid', id: 'will-fail' },
        { type: 'blog', url: 'https://example.com' },
      ];

      const results = await source.batchExtract(sources, { continueOnError: true });

      // Should have 3 results
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);

      // Storage should still work
      const folders = await storage.createMMOSProjectStructure('Recovery Test');
      expect(folders.root).toBeDefined();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent adapter operations', async () => {
      const { createAdapters } = require('../../adapters');
      const adapters = createAdapters({
        silent: true,
        project: { listId: 'test-list' },
      });

      // Run operations concurrently
      const [sourceResult, projectResult, storageResult] = await Promise.all([
        adapters.source.extractYouTube('video-id'),
        adapters.project.createTask({ name: 'Concurrent Task' }),
        adapters.storage.createFolder('Concurrent Folder'),
      ]);

      expect(sourceResult).toHaveProperty('transcript');
      expect(projectResult).toHaveProperty('id');
      expect(storageResult).toHaveProperty('id');
    });
  });
});
