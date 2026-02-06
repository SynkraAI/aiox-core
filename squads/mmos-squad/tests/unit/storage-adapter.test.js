/**
 * Storage Adapter Unit Tests
 *
 * Tests for the StorageAdapter class that wraps Google Drive service.
 *
 * @story STORY-10.6
 */

// Mock Google Drive service before requiring adapter
jest.mock('../../../../.aios-core/infrastructure/services/google-drive', () => ({
  GoogleDriveService: jest.fn().mockImplementation(() => ({
    listFiles: jest.fn().mockResolvedValue({
      files: [
        { id: 'file-1', name: 'test.txt' },
        { id: 'file-2', name: 'doc.pdf' },
      ],
      nextPageToken: 'next-token',
    }),
    searchFiles: jest.fn().mockResolvedValue([
      { id: 'search-1', name: 'found.txt' },
    ]),
    downloadFile: jest.fn().mockResolvedValue(Buffer.from('file content')),
    uploadFile: jest.fn().mockResolvedValue({ id: 'uploaded-id', name: 'uploaded.txt' }),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    getFileMetadata: jest.fn().mockResolvedValue({
      id: 'file-1',
      name: 'test.txt',
      mimeType: 'text/plain',
      size: 1024,
    }),
    readSpreadsheet: jest.fn().mockResolvedValue([
      ['Header1', 'Header2'],
      ['Value1', 'Value2'],
    ]),
    writeSpreadsheet: jest.fn().mockResolvedValue({ updatedCells: 4 }),
    appendSpreadsheet: jest.fn().mockResolvedValue({ updates: { updatedRows: 1 } }),
    createSpreadsheet: jest.fn().mockResolvedValue({ id: 'spreadsheet-id', title: 'New Sheet' }),
    createFolder: jest.fn().mockResolvedValue({ id: 'folder-id', name: 'New Folder' }),
    moveFile: jest.fn().mockResolvedValue({ id: 'file-1', parents: ['new-parent'] }),
  })),
}));

const { StorageAdapter, createStorageAdapter } = require('../../adapters/storage-adapter');

describe('StorageAdapter', () => {
  let adapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = createStorageAdapter({
      silent: true,
      rootFolderId: 'root-folder-id',
    });
  });

  describe('Factory Function', () => {
    it('should create adapter instance via factory', () => {
      const instance = createStorageAdapter();
      expect(instance).toBeInstanceOf(StorageAdapter);
    });

    it('should accept options', () => {
      const instance = createStorageAdapter({
        silent: true,
        rootFolderId: 'my-root',
      });
      expect(instance.options.silent).toBe(true);
      expect(instance.options.rootFolderId).toBe('my-root');
    });

    it('should use environment variable as default rootFolderId', () => {
      const originalValue = process.env.GOOGLE_DRIVE_ROOT_FOLDER;
      process.env.GOOGLE_DRIVE_ROOT_FOLDER = 'env-root-folder';

      const instance = createStorageAdapter({});

      expect(instance.options.rootFolderId).toBe('env-root-folder');

      // Restore
      process.env.GOOGLE_DRIVE_ROOT_FOLDER = originalValue;
    });
  });

  describe('Lazy Initialization', () => {
    it('should not initialize service until accessed', () => {
      const freshAdapter = new StorageAdapter({ silent: true });
      expect(freshAdapter._driveService).toBeNull();
    });

    it('should initialize service on first access', () => {
      const freshAdapter = new StorageAdapter({ silent: true });
      expect(freshAdapter._driveService).toBeNull();

      // Access the service
      const service = freshAdapter.driveService;

      expect(freshAdapter._driveService).not.toBeNull();
      expect(service).toBeDefined();
    });

    it('should cache service instance', () => {
      const freshAdapter = new StorageAdapter({ silent: true });
      const service1 = freshAdapter.driveService;
      const service2 = freshAdapter.driveService;

      expect(service1).toBe(service2);
    });
  });

  describe('File Operations', () => {
    describe('listFiles', () => {
      it('should list files in folder', async () => {
        const result = await adapter.listFiles('folder-id');

        expect(result).toHaveProperty('files');
        expect(result.files).toHaveLength(2);
        expect(adapter.driveService.listFiles).toHaveBeenCalledWith(
          'folder-id',
          {},
        );
      });

      it('should use root folder if not specified', async () => {
        await adapter.listFiles();

        expect(adapter.driveService.listFiles).toHaveBeenCalledWith(
          'root-folder-id',
          {},
        );
      });

      it('should pass options', async () => {
        const options = { pageSize: 50, pageToken: 'token' };
        await adapter.listFiles('folder-id', options);

        expect(adapter.driveService.listFiles).toHaveBeenCalledWith(
          'folder-id',
          options,
        );
      });

      it('should return pagination token', async () => {
        const result = await adapter.listFiles('folder-id');

        expect(result).toHaveProperty('nextPageToken', 'next-token');
      });
    });

    describe('searchFiles', () => {
      it('should search files by query', async () => {
        const result = await adapter.searchFiles("name contains 'test'");

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(adapter.driveService.searchFiles).toHaveBeenCalledWith(
          "name contains 'test'",
          {},
        );
      });

      it('should pass search options', async () => {
        const options = { maxResults: 10 };
        await adapter.searchFiles('query', options);

        expect(adapter.driveService.searchFiles).toHaveBeenCalledWith(
          'query',
          options,
        );
      });
    });

    describe('downloadFile', () => {
      it('should download file content', async () => {
        const result = await adapter.downloadFile('file-id');

        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.toString()).toBe('file content');
        expect(adapter.driveService.downloadFile).toHaveBeenCalledWith(
          'file-id',
          undefined,
        );
      });

      it('should accept destination path', async () => {
        await adapter.downloadFile('file-id', '/path/to/dest');

        expect(adapter.driveService.downloadFile).toHaveBeenCalledWith(
          'file-id',
          '/path/to/dest',
        );
      });
    });

    describe('uploadFile', () => {
      it('should upload file', async () => {
        const result = await adapter.uploadFile('/path/to/file.txt');

        expect(result).toHaveProperty('id', 'uploaded-id');
        expect(result).toHaveProperty('name', 'uploaded.txt');
      });

      it('should use root folder if not specified', async () => {
        await adapter.uploadFile('/path/to/file.txt');

        expect(adapter.driveService.uploadFile).toHaveBeenCalledWith(
          '/path/to/file.txt',
          expect.objectContaining({ folderId: 'root-folder-id' }),
        );
      });

      it('should accept upload options', async () => {
        const options = {
          name: 'custom-name.txt',
          folderId: 'custom-folder',
          mimeType: 'text/plain',
        };

        await adapter.uploadFile('/path/to/file.txt', options);

        expect(adapter.driveService.uploadFile).toHaveBeenCalledWith(
          '/path/to/file.txt',
          expect.objectContaining(options),
        );
      });
    });

    describe('deleteFile', () => {
      it('should delete file', async () => {
        await adapter.deleteFile('file-id');

        expect(adapter.driveService.deleteFile).toHaveBeenCalledWith('file-id');
      });
    });

    describe('getFileMetadata', () => {
      it('should get file metadata', async () => {
        const result = await adapter.getFileMetadata('file-id');

        expect(result).toHaveProperty('id', 'file-1');
        expect(result).toHaveProperty('name', 'test.txt');
        expect(result).toHaveProperty('mimeType', 'text/plain');
        expect(result).toHaveProperty('size', 1024);
      });
    });
  });

  describe('Spreadsheet Operations', () => {
    describe('readSpreadsheet', () => {
      it('should read spreadsheet data', async () => {
        const result = await adapter.readSpreadsheet('spreadsheet-id', 'Sheet1!A1:B2');

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(['Header1', 'Header2']);
      });

      it('should pass read options', async () => {
        const options = { valueRenderOption: 'FORMATTED_VALUE' };
        await adapter.readSpreadsheet('spreadsheet-id', 'Sheet1!A1:B2', options);

        expect(adapter.driveService.readSpreadsheet).toHaveBeenCalledWith(
          'spreadsheet-id',
          'Sheet1!A1:B2',
          options,
        );
      });
    });

    describe('writeSpreadsheet', () => {
      it('should write spreadsheet data', async () => {
        const values = [['A', 'B'], ['1', '2']];
        const result = await adapter.writeSpreadsheet(
          'spreadsheet-id',
          'Sheet1!A1:B2',
          values,
        );

        expect(result).toHaveProperty('updatedCells', 4);
        expect(adapter.driveService.writeSpreadsheet).toHaveBeenCalledWith(
          'spreadsheet-id',
          'Sheet1!A1:B2',
          values,
          {},
        );
      });

      it('should pass write options', async () => {
        const values = [['A', 'B']];
        const options = { valueInputOption: 'RAW' };
        await adapter.writeSpreadsheet('spreadsheet-id', 'Sheet1!A1', values, options);

        expect(adapter.driveService.writeSpreadsheet).toHaveBeenCalledWith(
          'spreadsheet-id',
          'Sheet1!A1',
          values,
          options,
        );
      });
    });

    describe('appendSpreadsheet', () => {
      it('should append spreadsheet data', async () => {
        const values = [['New', 'Row']];
        const result = await adapter.appendSpreadsheet(
          'spreadsheet-id',
          'Sheet1!A1',
          values,
        );

        expect(result).toHaveProperty('updates');
        expect(adapter.driveService.appendSpreadsheet).toHaveBeenCalledWith(
          'spreadsheet-id',
          'Sheet1!A1',
          values,
        );
      });
    });

    describe('createSpreadsheet', () => {
      it('should create spreadsheet', async () => {
        const result = await adapter.createSpreadsheet('My Spreadsheet');

        expect(result).toHaveProperty('id', 'spreadsheet-id');
        expect(result).toHaveProperty('title', 'New Sheet');
      });

      it('should pass creation options', async () => {
        const options = { folderId: 'parent-folder' };
        await adapter.createSpreadsheet('My Spreadsheet', options);

        expect(adapter.driveService.createSpreadsheet).toHaveBeenCalledWith(
          'My Spreadsheet',
          options,
        );
      });
    });
  });

  describe('Folder Operations', () => {
    describe('createFolder', () => {
      it('should create folder', async () => {
        const result = await adapter.createFolder('New Folder');

        expect(result).toHaveProperty('id', 'folder-id');
        expect(result).toHaveProperty('name', 'New Folder');
      });

      it('should use root folder as parent if not specified', async () => {
        await adapter.createFolder('New Folder');

        expect(adapter.driveService.createFolder).toHaveBeenCalledWith(
          'New Folder',
          'root-folder-id',
        );
      });

      it('should accept custom parent folder', async () => {
        await adapter.createFolder('New Folder', 'parent-folder-id');

        expect(adapter.driveService.createFolder).toHaveBeenCalledWith(
          'New Folder',
          'parent-folder-id',
        );
      });
    });

    describe('moveFile', () => {
      it('should move file to folder', async () => {
        const result = await adapter.moveFile('file-id', 'new-parent-id');

        expect(result).toHaveProperty('id', 'file-1');
        expect(adapter.driveService.moveFile).toHaveBeenCalledWith(
          'file-id',
          'new-parent-id',
        );
      });
    });
  });

  describe('MMOS-Specific Operations', () => {
    describe('createMMOSProjectStructure', () => {
      it('should create project folder structure', async () => {
        const result = await adapter.createMMOSProjectStructure('Test Project');

        expect(result).toHaveProperty('root');
        expect(result).toHaveProperty('sources');
        expect(result).toHaveProperty('processed');
        expect(result).toHaveProperty('outputs');
        expect(result).toHaveProperty('exports');

        // Should create main folder + 4 subfolders
        expect(adapter.driveService.createFolder).toHaveBeenCalledTimes(5);
      });

      it('should create main folder first', async () => {
        await adapter.createMMOSProjectStructure('Test Project');

        expect(adapter.driveService.createFolder).toHaveBeenNthCalledWith(
          1,
          'Test Project',
          'root-folder-id',
        );
      });

      it('should create subfolders in main folder', async () => {
        await adapter.createMMOSProjectStructure('Test Project');

        // Check that subfolders are created with project folder as parent
        expect(adapter.driveService.createFolder).toHaveBeenCalledWith(
          'sources',
          'folder-id', // folder-id is the mocked return value for createFolder
        );
        expect(adapter.driveService.createFolder).toHaveBeenCalledWith(
          'processed',
          'folder-id',
        );
        expect(adapter.driveService.createFolder).toHaveBeenCalledWith(
          'outputs',
          'folder-id',
        );
        expect(adapter.driveService.createFolder).toHaveBeenCalledWith(
          'exports',
          'folder-id',
        );
      });

      it('should accept custom parent folder', async () => {
        await adapter.createMMOSProjectStructure('Test Project', 'custom-parent');

        expect(adapter.driveService.createFolder).toHaveBeenNthCalledWith(
          1,
          'Test Project',
          'custom-parent',
        );
      });
    });

    describe('storeProcessedContent', () => {
      it('should store content in folder', async () => {
        const content = 'Processed content data';
        const result = await adapter.storeProcessedContent(
          'project-folder-id',
          'processed.txt',
          content,
        );

        expect(result).toHaveProperty('id', 'uploaded-id');
        expect(adapter.driveService.uploadFile).toHaveBeenCalled();
      });

      it('should accept buffer content', async () => {
        const content = Buffer.from('Binary content');
        const result = await adapter.storeProcessedContent(
          'project-folder-id',
          'data.bin',
          content,
        );

        expect(result).toHaveProperty('id');
      });

      it('should use custom processed folder', async () => {
        await adapter.storeProcessedContent(
          'project-folder-id',
          'file.txt',
          'content',
          { processedFolderId: 'custom-processed' },
        );

        expect(adapter.driveService.uploadFile).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ folderId: 'custom-processed' }),
        );
      });
    });

    describe('exportMindToSpreadsheet', () => {
      it('should create export spreadsheet', async () => {
        const data = {
          sources: ['s1', 's2'],
          patterns: [],
        };

        const result = await adapter.exportMindToSpreadsheet('Test Mind', data);

        expect(result).toHaveProperty('id', 'spreadsheet-id');
        expect(adapter.driveService.createSpreadsheet).toHaveBeenCalledWith(
          'Test Mind - Mind Map Export',
          expect.any(Object),
        );
      });

      it('should write summary data', async () => {
        const data = {
          sources: ['s1', 's2', 's3'],
          patterns: [],
        };

        await adapter.exportMindToSpreadsheet('Test Mind', data);

        // Check that writeSpreadsheet was called with correct structure
        expect(adapter.driveService.writeSpreadsheet).toHaveBeenCalled();
        const call = adapter.driveService.writeSpreadsheet.mock.calls[0];
        expect(call[0]).toBe('spreadsheet-id');
        expect(call[1]).toBe('Sheet1!A1:B4');
        // Verify the data structure (date is dynamic so we check structure)
        expect(call[2]).toHaveLength(4);
        expect(call[2][0]).toEqual(['Mind Map Export', 'Test Mind']);
        expect(call[2][2]).toEqual(['Sources Count', 3]);
        expect(call[2][3]).toEqual(['Patterns Found', 0]);
      });

      it('should write patterns if available', async () => {
        const data = {
          sources: ['s1'],
          patterns: [
            { name: 'Pattern 1', frequency: 5, sourceCount: 2, examples: ['ex1', 'ex2'] },
            { name: 'Pattern 2', frequency: 3, sourceCount: 1, examples: ['ex3'] },
          ],
        };

        await adapter.exportMindToSpreadsheet('Test Mind', data);

        // Should write patterns after summary
        expect(adapter.driveService.writeSpreadsheet).toHaveBeenCalledTimes(2);
      });

      it('should handle empty patterns', async () => {
        const data = {
          sources: ['s1'],
          patterns: [],
        };

        await adapter.exportMindToSpreadsheet('Test Mind', data);

        // Should only write summary, not patterns
        expect(adapter.driveService.writeSpreadsheet).toHaveBeenCalledTimes(1);
      });

      it('should handle missing data gracefully', async () => {
        const data = {};

        await adapter.exportMindToSpreadsheet('Test Mind', data);

        // Check that writeSpreadsheet was called with correct structure
        expect(adapter.driveService.writeSpreadsheet).toHaveBeenCalled();
        const call = adapter.driveService.writeSpreadsheet.mock.calls[0];
        expect(call[0]).toBe('spreadsheet-id');
        expect(call[1]).toBe('Sheet1!A1:B4');
        // Verify the data structure with defaults (date is dynamic)
        expect(call[2]).toHaveLength(4);
        expect(call[2][0]).toEqual(['Mind Map Export', 'Test Mind']);
        expect(call[2][2]).toEqual(['Sources Count', 0]);
        expect(call[2][3]).toEqual(['Patterns Found', 0]);
      });

      it('should accept export options', async () => {
        const data = { sources: [] };
        const options = { folderId: 'export-folder' };

        await adapter.exportMindToSpreadsheet('Test Mind', data, options);

        expect(adapter.driveService.createSpreadsheet).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ folderId: 'export-folder' }),
        );
      });
    });
  });
});
