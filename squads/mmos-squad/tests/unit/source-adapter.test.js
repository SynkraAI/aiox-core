/**
 * Source Adapter Unit Tests
 *
 * Tests for the SourceAdapter class that wraps infrastructure services.
 *
 * @story STORY-10.6
 */

// Mock external services before requiring adapter
jest.mock('../../../../.aios-core/infrastructure/services/file-service', () => ({
  FileService: jest.fn().mockImplementation(() => ({
    parsePDF: jest.fn().mockResolvedValue({ text: 'PDF content', pages: 5 }),
    parseWord: jest.fn().mockResolvedValue({ text: 'Word content' }),
    parseExcel: jest.fn().mockResolvedValue({ sheets: [{ name: 'Sheet1', data: [] }] }),
    parseCSV: jest.fn().mockResolvedValue({ rows: [], headers: [] }),
  })),
}));

jest.mock('../../../../.aios-core/infrastructure/services/etl', () => ({
  ETLService: jest.fn().mockImplementation(() => ({
    extractYouTube: jest.fn().mockResolvedValue({
      transcript: 'YouTube transcript',
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

const { SourceAdapter, createSourceAdapter } = require('../../adapters/source-adapter');

describe('SourceAdapter', () => {
  let adapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = createSourceAdapter({ silent: true });
  });

  describe('Factory Function', () => {
    it('should create adapter instance via factory', () => {
      const instance = createSourceAdapter();
      expect(instance).toBeInstanceOf(SourceAdapter);
    });

    it('should accept options', () => {
      const instance = createSourceAdapter({ silent: true, traceId: 'test-123' });
      expect(instance.options.silent).toBe(true);
      expect(instance.options.traceId).toBe('test-123');
    });

    it('should auto-generate traceId if not provided', () => {
      const instance = createSourceAdapter({});
      expect(instance.options.traceId).toBeDefined();
      expect(instance.options.traceId).toMatch(/^mmos-source-/);
    });
  });

  describe('Lazy Initialization', () => {
    it('should not initialize services until accessed', () => {
      const freshAdapter = new SourceAdapter({ silent: true });
      expect(freshAdapter._fileService).toBeNull();
      expect(freshAdapter._etlService).toBeNull();
      expect(freshAdapter._tiktokService).toBeNull();
    });

    it('should initialize fileService on first access', () => {
      const freshAdapter = new SourceAdapter({ silent: true });
      expect(freshAdapter._fileService).toBeNull();

      // Access the service
      const service = freshAdapter.fileService;

      expect(freshAdapter._fileService).not.toBeNull();
      expect(service).toBeDefined();
    });

    it('should initialize etlService on first access', () => {
      const freshAdapter = new SourceAdapter({ silent: true });
      expect(freshAdapter._etlService).toBeNull();

      // Access the service
      const service = freshAdapter.etlService;

      expect(freshAdapter._etlService).not.toBeNull();
      expect(service).toBeDefined();
    });

    it('should cache service instances', () => {
      const freshAdapter = new SourceAdapter({ silent: true });
      const service1 = freshAdapter.fileService;
      const service2 = freshAdapter.fileService;

      expect(service1).toBe(service2);
    });
  });

  describe('detectFormat', () => {
    it('should detect PDF format', () => {
      expect(adapter.detectFormat('document.pdf')).toBe('pdf');
      expect(adapter.detectFormat('DOCUMENT.PDF')).toBe('pdf');
      expect(adapter.detectFormat('/path/to/file.pdf')).toBe('pdf');
    });

    it('should detect Word formats', () => {
      expect(adapter.detectFormat('file.doc')).toBe('word');
      expect(adapter.detectFormat('file.docx')).toBe('word');
      expect(adapter.detectFormat('FILE.DOCX')).toBe('word');
    });

    it('should detect Excel formats', () => {
      expect(adapter.detectFormat('data.xls')).toBe('excel');
      expect(adapter.detectFormat('data.xlsx')).toBe('excel');
      expect(adapter.detectFormat('DATA.XLSX')).toBe('excel');
    });

    it('should detect CSV format', () => {
      expect(adapter.detectFormat('data.csv')).toBe('csv');
      expect(adapter.detectFormat('DATA.CSV')).toBe('csv');
    });

    it('should detect text formats', () => {
      expect(adapter.detectFormat('readme.txt')).toBe('text');
      expect(adapter.detectFormat('notes.md')).toBe('text');
    });

    it('should return unknown for unsupported formats', () => {
      expect(adapter.detectFormat('file.xyz')).toBe('unknown');
      expect(adapter.detectFormat('file.mp3')).toBe('unknown');
      expect(adapter.detectFormat('file.jpg')).toBe('unknown');
      expect(adapter.detectFormat('')).toBe('unknown');
    });
  });

  describe('parseDocument', () => {
    it('should parse PDF documents', async () => {
      const result = await adapter.parseDocument('/path/to/doc.pdf');
      expect(result).toHaveProperty('text', 'PDF content');
      expect(result).toHaveProperty('pages', 5);
    });

    it('should parse Word documents', async () => {
      const result = await adapter.parseDocument('/path/to/doc.docx');
      expect(result).toHaveProperty('text', 'Word content');
    });

    it('should parse Excel documents', async () => {
      const result = await adapter.parseDocument('/path/to/data.xlsx');
      expect(result).toHaveProperty('sheets');
    });

    it('should parse CSV documents', async () => {
      const result = await adapter.parseDocument('/path/to/data.csv');
      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('headers');
    });

    it('should throw for unsupported formats', async () => {
      await expect(adapter.parseDocument('/path/to/file.xyz'))
        .rejects.toThrow(/unsupported document format/i);
    });

    it('should pass options to underlying service', async () => {
      const options = { pages: [1, 2, 3] };
      await adapter.parseDocument('/path/to/doc.pdf', options);

      expect(adapter.fileService.parsePDF).toHaveBeenCalledWith(
        '/path/to/doc.pdf',
        options,
      );
    });
  });

  describe('extractYouTube', () => {
    it('should extract YouTube transcript', async () => {
      const result = await adapter.extractYouTube('dQw4w9WgXcQ');
      expect(result).toHaveProperty('transcript');
      expect(result).toHaveProperty('metadata');
    });

    it('should use default language', async () => {
      await adapter.extractYouTube('dQw4w9WgXcQ');

      expect(adapter.etlService.extractYouTube).toHaveBeenCalledWith(
        'dQw4w9WgXcQ',
        expect.objectContaining({ lang: 'en' }),
      );
    });

    it('should accept custom language', async () => {
      await adapter.extractYouTube('dQw4w9WgXcQ', { lang: 'pt' });

      expect(adapter.etlService.extractYouTube).toHaveBeenCalledWith(
        'dQw4w9WgXcQ',
        expect.objectContaining({ lang: 'pt' }),
      );
    });

    it('should include metadata by default', async () => {
      await adapter.extractYouTube('dQw4w9WgXcQ');

      expect(adapter.etlService.extractYouTube).toHaveBeenCalledWith(
        'dQw4w9WgXcQ',
        expect.objectContaining({ includeMetadata: true }),
      );
    });
  });

  describe('collectBlog', () => {
    it('should collect blog content', async () => {
      const result = await adapter.collectBlog('https://example.com/blog');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('url');
    });

    it('should use default timeout', async () => {
      await adapter.collectBlog('https://example.com/blog');

      expect(adapter.etlService.collectBlog).toHaveBeenCalledWith(
        'https://example.com/blog',
        expect.objectContaining({ timeout: 30000 }),
      );
    });

    it('should accept custom timeout', async () => {
      await adapter.collectBlog('https://example.com/blog', { timeout: 60000 });

      expect(adapter.etlService.collectBlog).toHaveBeenCalledWith(
        'https://example.com/blog',
        expect.objectContaining({ timeout: 60000 }),
      );
    });
  });

  describe('chunkContent', () => {
    it('should chunk content with default options', () => {
      const content = 'This is test content for chunking.';
      const result = adapter.chunkContent(content);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use semantic strategy by default', () => {
      const content = 'Test content';
      adapter.chunkContent(content);

      expect(adapter.etlService.chunkContent).toHaveBeenCalledWith(
        content,
        expect.objectContaining({ strategy: 'semantic' }),
      );
    });

    it('should accept custom chunking options', () => {
      const content = 'Test content';
      const options = {
        strategy: 'fixed',
        maxChunkSize: 500,
        overlap: 50,
      };

      adapter.chunkContent(content, options);

      expect(adapter.etlService.chunkContent).toHaveBeenCalledWith(
        content,
        expect.objectContaining(options),
      );
    });
  });

  describe('filterSpeaker', () => {
    it('should filter transcript by speaker', () => {
      const transcript = [
        { speaker: 'John', text: 'Hello' },
        { speaker: 'Jane', text: 'Hi' },
      ];

      adapter.filterSpeaker(transcript, 'John');

      expect(adapter.etlService.filterSpeaker).toHaveBeenCalledWith(
        transcript,
        'John',
      );
    });
  });

  describe('batchExtract', () => {
    it('should process multiple sources', async () => {
      const sources = [
        { type: 'youtube', id: 'video1' },
        { type: 'blog', url: 'https://example.com' },
      ];

      const results = await adapter.batchExtract(sources, {
        concurrency: 1,
        continueOnError: true,
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('source');
      expect(results[0]).toHaveProperty('success');
    });

    it('should handle mixed success/failure', async () => {
      const sources = [
        { type: 'youtube', id: 'video1' },
        { type: 'invalid', id: 'test' }, // Will fail
      ];

      const results = await adapter.batchExtract(sources, {
        continueOnError: true,
      });

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toMatch(/unknown source type/i);
    });

    it('should throw on error when continueOnError is false', async () => {
      const sources = [
        { type: 'invalid', id: 'test' },
      ];

      await expect(adapter.batchExtract(sources, { continueOnError: false }))
        .rejects.toThrow(/unknown source type/i);
    });

    it('should respect concurrency', async () => {
      const sources = [
        { type: 'youtube', id: 'v1' },
        { type: 'youtube', id: 'v2' },
        { type: 'youtube', id: 'v3' },
        { type: 'youtube', id: 'v4' },
        { type: 'youtube', id: 'v5' },
      ];

      const startTime = Date.now();
      await adapter.batchExtract(sources, { concurrency: 2 });
      const endTime = Date.now();

      // With mocked services, this should complete quickly
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle document sources', async () => {
      const sources = [
        { type: 'document', path: '/path/to/doc.pdf' },
      ];

      const results = await adapter.batchExtract(sources);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });

    it('should use default options', async () => {
      const sources = [{ type: 'youtube', id: 'v1' }];
      const results = await adapter.batchExtract(sources);

      expect(results).toHaveLength(1);
    });
  });

  describe('TikTok Service', () => {
    it('should handle TikTok service unavailability gracefully', () => {
      const freshAdapter = new SourceAdapter({ silent: true });

      // TikTok service won't be built in test environment
      expect(() => {
        const service = freshAdapter.tiktokService;
        // Should return null or handle gracefully
      }).not.toThrow();
    });

    it('should throw when calling TikTok methods without service', async () => {
      const freshAdapter = new SourceAdapter({ silent: true });

      await expect(freshAdapter.getTikTokUserInfo('token'))
        .rejects.toThrow(/tiktok service not available/i);
    });
  });
});
