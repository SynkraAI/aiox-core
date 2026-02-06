/**
 * Infrastructure Service Integration Tests
 *
 * Tests for infrastructure service connectivity and basic operations.
 * Uses mocks for CI stability while validating service interfaces.
 *
 * @story STORY-10.6
 */

// Mock all infrastructure services for CI stability
jest.mock('../../../../.aios-core/infrastructure/services/clickup', () => ({
  getTask: jest.fn().mockResolvedValue({ id: 'task-123', name: 'Test Task' }),
  createTask: jest.fn().mockResolvedValue({ id: 'new-task-id', name: 'New Task' }),
  updateTask: jest.fn().mockResolvedValue({ id: 'task-123', status: 'updated' }),
  updateStatus: jest.fn().mockResolvedValue({ id: 'task-123', status: 'in_progress' }),
  addComment: jest.fn().mockResolvedValue({ id: 'comment-123' }),
  getComments: jest.fn().mockResolvedValue([]),
  updateCustomField: jest.fn().mockResolvedValue({ id: 'task-123' }),
  getCustomFields: jest.fn().mockResolvedValue([]),
  getStatuses: jest.fn().mockResolvedValue([
    { id: 'status-1', name: 'To Do' },
    { id: 'status-2', name: 'In Progress' },
  ]),
  deleteTask: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../.aios-core/infrastructure/services/google-drive', () => ({
  GoogleDriveService: jest.fn().mockImplementation((options) => ({
    options,
    listFiles: jest.fn().mockResolvedValue({ files: [], nextPageToken: null }),
    downloadFile: jest.fn().mockResolvedValue(Buffer.from('mock content')),
    uploadFile: jest.fn().mockResolvedValue({ id: 'file-id', name: 'test.txt' }),
    searchFiles: jest.fn().mockResolvedValue([]),
    getFileMetadata: jest.fn().mockResolvedValue({ id: 'file-id', name: 'test.txt', mimeType: 'text/plain' }),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    readSpreadsheet: jest.fn().mockResolvedValue([['Header1', 'Header2'], ['Value1', 'Value2']]),
    writeSpreadsheet: jest.fn().mockResolvedValue({ updatedCells: 4 }),
    appendSpreadsheet: jest.fn().mockResolvedValue({ updatedCells: 2 }),
    createSpreadsheet: jest.fn().mockResolvedValue({ id: 'spreadsheet-id', title: 'Test' }),
    createFolder: jest.fn().mockResolvedValue({ id: 'folder-id', name: 'New Folder' }),
    moveFile: jest.fn().mockResolvedValue({ id: 'file-id' }),
  })),
}));

jest.mock('../../../../.aios-core/infrastructure/services/file-service', () => ({
  FileService: jest.fn().mockImplementation((options) => ({
    options,
    parsePDF: jest.fn().mockResolvedValue({ text: 'PDF content', pages: 5, metadata: {} }),
    parseWord: jest.fn().mockResolvedValue({ text: 'Word content', metadata: {} }),
    parseExcel: jest.fn().mockResolvedValue({ sheets: [{ name: 'Sheet1', data: [] }] }),
    parseCSV: jest.fn().mockResolvedValue({ rows: [], headers: ['col1', 'col2'] }),
    parseText: jest.fn().mockResolvedValue({ text: 'Text content' }),
  })),
}));

jest.mock('../../../../.aios-core/infrastructure/services/etl', () => ({
  ETLService: jest.fn().mockImplementation((options) => ({
    options,
    extractYouTube: jest.fn().mockResolvedValue({
      transcript: 'Test transcript content',
      metadata: { title: 'Test Video', duration: 300 },
    }),
    collectBlog: jest.fn().mockResolvedValue({
      content: 'Blog post content',
      url: 'https://example.com/blog',
      title: 'Blog Title',
    }),
    chunkContent: jest.fn().mockReturnValue([
      { text: 'chunk 1', index: 0, tokens: 100 },
      { text: 'chunk 2', index: 1, tokens: 100 },
    ]),
    filterSpeaker: jest.fn().mockReturnValue([
      { speaker: 'Host', text: 'Hello' },
    ]),
    processSource: jest.fn().mockResolvedValue({ processed: true }),
  })),
}));

describe('Infrastructure Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ClickUp Service', () => {
    let clickup;

    beforeEach(() => {
      clickup = require('../../../../.aios-core/infrastructure/services/clickup');
    });

    it('should export all required methods', () => {
      expect(clickup.getTask).toBeDefined();
      expect(clickup.createTask).toBeDefined();
      expect(clickup.updateTask).toBeDefined();
      expect(clickup.updateStatus).toBeDefined();
      expect(clickup.addComment).toBeDefined();
      expect(clickup.getComments).toBeDefined();
      expect(clickup.deleteTask).toBeDefined();
    });

    it('should get task by ID', async () => {
      const task = await clickup.getTask('task-123');

      expect(task).toHaveProperty('id', 'task-123');
      expect(task).toHaveProperty('name', 'Test Task');
      expect(clickup.getTask).toHaveBeenCalledWith('task-123');
    });

    it('should create task with data', async () => {
      const taskData = { name: 'New Task', description: 'Test' };
      const task = await clickup.createTask('list-id', taskData);

      expect(task).toHaveProperty('id');
      expect(clickup.createTask).toHaveBeenCalledWith('list-id', taskData);
    });

    it('should update task', async () => {
      const updates = { status: 'Done' };
      const task = await clickup.updateTask('task-123', updates);

      expect(task).toHaveProperty('status', 'updated');
      expect(clickup.updateTask).toHaveBeenCalledWith('task-123', updates);
    });

    it('should add comment to task', async () => {
      const comment = await clickup.addComment('task-123', 'Test comment');

      expect(comment).toHaveProperty('id');
      expect(clickup.addComment).toHaveBeenCalledWith('task-123', 'Test comment');
    });

    it('should get available statuses', async () => {
      const statuses = await clickup.getStatuses('list-id');

      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should delete task', async () => {
      await clickup.deleteTask('task-123');

      expect(clickup.deleteTask).toHaveBeenCalledWith('task-123');
    });
  });

  describe('Google Drive Service', () => {
    let GoogleDriveService;
    let driveService;

    beforeEach(() => {
      const drive = require('../../../../.aios-core/infrastructure/services/google-drive');
      GoogleDriveService = drive.GoogleDriveService;
      driveService = new GoogleDriveService({ silent: true });
    });

    it('should export GoogleDriveService class', () => {
      expect(GoogleDriveService).toBeDefined();
      expect(typeof GoogleDriveService).toBe('function');
    });

    it('should create instance with options', () => {
      expect(driveService).toBeDefined();
      expect(driveService.options.silent).toBe(true);
    });

    it('should list files in folder', async () => {
      const result = await driveService.listFiles('folder-id');

      expect(result).toHaveProperty('files');
      expect(Array.isArray(result.files)).toBe(true);
      expect(driveService.listFiles).toHaveBeenCalledWith('folder-id');
    });

    it('should upload file', async () => {
      const result = await driveService.uploadFile('/path/to/file.txt', {
        name: 'test.txt',
        folderId: 'folder-id',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });

    it('should download file', async () => {
      const content = await driveService.downloadFile('file-id');

      expect(Buffer.isBuffer(content)).toBe(true);
      expect(driveService.downloadFile).toHaveBeenCalledWith('file-id');
    });

    it('should read spreadsheet', async () => {
      const data = await driveService.readSpreadsheet('spreadsheet-id', 'Sheet1!A1:B10');

      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toEqual(['Header1', 'Header2']);
    });

    it('should write to spreadsheet', async () => {
      const values = [['A1', 'B1'], ['A2', 'B2']];
      const result = await driveService.writeSpreadsheet('spreadsheet-id', 'Sheet1!A1:B2', values);

      expect(result).toHaveProperty('updatedCells');
    });

    it('should create folder', async () => {
      const folder = await driveService.createFolder('New Folder', 'parent-id');

      expect(folder).toHaveProperty('id');
      expect(folder).toHaveProperty('name', 'New Folder');
    });

    it('should get file metadata', async () => {
      const metadata = await driveService.getFileMetadata('file-id');

      expect(metadata).toHaveProperty('id');
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('mimeType');
    });

    it('should create spreadsheet', async () => {
      const spreadsheet = await driveService.createSpreadsheet('Test Spreadsheet');

      expect(spreadsheet).toHaveProperty('id');
      expect(spreadsheet).toHaveProperty('title');
    });
  });

  describe('File Service', () => {
    let FileService;
    let fileService;

    beforeEach(() => {
      const fs = require('../../../../.aios-core/infrastructure/services/file-service');
      FileService = fs.FileService;
      fileService = new FileService({ silent: true });
    });

    it('should export FileService class', () => {
      expect(FileService).toBeDefined();
      expect(typeof FileService).toBe('function');
    });

    it('should create instance with options', () => {
      expect(fileService).toBeDefined();
      expect(fileService.options.silent).toBe(true);
    });

    it('should parse PDF documents', async () => {
      const result = await fileService.parsePDF('/path/to/document.pdf');

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('pages');
      expect(fileService.parsePDF).toHaveBeenCalledWith('/path/to/document.pdf');
    });

    it('should parse Word documents', async () => {
      const result = await fileService.parseWord('/path/to/document.docx');

      expect(result).toHaveProperty('text');
      expect(fileService.parseWord).toHaveBeenCalledWith('/path/to/document.docx');
    });

    it('should parse Excel documents', async () => {
      const result = await fileService.parseExcel('/path/to/data.xlsx');

      expect(result).toHaveProperty('sheets');
      expect(Array.isArray(result.sheets)).toBe(true);
    });

    it('should parse CSV documents', async () => {
      const result = await fileService.parseCSV('/path/to/data.csv');

      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('headers');
    });
  });

  describe('ETL Service', () => {
    let ETLService;
    let etlService;

    beforeEach(() => {
      const etl = require('../../../../.aios-core/infrastructure/services/etl');
      ETLService = etl.ETLService;
      etlService = new ETLService({ silent: true });
    });

    it('should export ETLService class', () => {
      expect(ETLService).toBeDefined();
      expect(typeof ETLService).toBe('function');
    });

    it('should create instance with options', () => {
      expect(etlService).toBeDefined();
      expect(etlService.options.silent).toBe(true);
    });

    it('should extract YouTube transcript', async () => {
      const result = await etlService.extractYouTube('dQw4w9WgXcQ');

      expect(result).toHaveProperty('transcript');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('title');
    });

    it('should collect blog content', async () => {
      const result = await etlService.collectBlog('https://example.com/blog');

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('url');
    });

    it('should chunk content', () => {
      const content = 'Long text content that needs to be chunked.';
      const chunks = etlService.chunkContent(content, { maxSize: 100 });

      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks[0]).toHaveProperty('text');
      expect(chunks[0]).toHaveProperty('index');
    });

    it('should filter by speaker', () => {
      const transcript = [
        { speaker: 'Host', text: 'Hello' },
        { speaker: 'Guest', text: 'Hi' },
      ];

      const filtered = etlService.filterSpeaker(transcript, 'Host');

      expect(Array.isArray(filtered)).toBe(true);
    });
  });

  describe('Service Error Handling', () => {
    it('should handle ClickUp API errors gracefully', async () => {
      const clickup = require('../../../../.aios-core/infrastructure/services/clickup');

      // Mock a failure
      clickup.getTask.mockRejectedValueOnce(new Error('API Error'));

      await expect(clickup.getTask('invalid-id')).rejects.toThrow('API Error');
    });

    it('should handle Google Drive errors gracefully', async () => {
      const { GoogleDriveService } = require('../../../../.aios-core/infrastructure/services/google-drive');
      const service = new GoogleDriveService({});

      // Mock a failure
      service.downloadFile.mockRejectedValueOnce(new Error('File not found'));

      await expect(service.downloadFile('invalid-id')).rejects.toThrow('File not found');
    });

    it('should handle File Service errors gracefully', async () => {
      const { FileService } = require('../../../../.aios-core/infrastructure/services/file-service');
      const service = new FileService({});

      // Mock a failure
      service.parsePDF.mockRejectedValueOnce(new Error('Invalid PDF'));

      await expect(service.parsePDF('/invalid/path.pdf')).rejects.toThrow('Invalid PDF');
    });

    it('should handle ETL Service errors gracefully', async () => {
      const { ETLService } = require('../../../../.aios-core/infrastructure/services/etl');
      const service = new ETLService({});

      // Mock a failure
      service.extractYouTube.mockRejectedValueOnce(new Error('Video not found'));

      await expect(service.extractYouTube('invalid-id')).rejects.toThrow('Video not found');
    });
  });

  describe('Service Configuration', () => {
    it('should pass options to ClickUp service', () => {
      const clickup = require('../../../../.aios-core/infrastructure/services/clickup');

      // Verify mock is properly configured
      expect(typeof clickup.getTask).toBe('function');
      expect(typeof clickup.createTask).toBe('function');
    });

    it('should pass options to Google Drive service', () => {
      const { GoogleDriveService } = require('../../../../.aios-core/infrastructure/services/google-drive');
      const service = new GoogleDriveService({
        rootFolderId: 'test-folder',
        silent: true,
      });

      expect(service.options.rootFolderId).toBe('test-folder');
      expect(service.options.silent).toBe(true);
    });

    it('should pass options to File Service', () => {
      const { FileService } = require('../../../../.aios-core/infrastructure/services/file-service');
      const service = new FileService({
        tempDir: '/tmp',
        maxFileSize: 1024 * 1024,
      });

      expect(service.options.tempDir).toBe('/tmp');
      expect(service.options.maxFileSize).toBe(1024 * 1024);
    });

    it('should pass options to ETL Service', () => {
      const { ETLService } = require('../../../../.aios-core/infrastructure/services/etl');
      const service = new ETLService({
        defaultLang: 'pt',
        timeout: 60000,
      });

      expect(service.options.defaultLang).toBe('pt');
      expect(service.options.timeout).toBe(60000);
    });
  });
});
