// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

/**
 * Google Workspace Tool Helpers Test Suite
 *
 * Tests all 7 helpers defined in google-workspace.yaml:
 * 1. format-oauth-scopes
 * 2. parse-drive-file-id
 * 3. format-calendar-datetime
 * 4. build-gmail-query
 * 5. parse-sheet-range
 * 6. validate-permission-level
 * 7. format-email-attachment
 */
describeIntegration('Google Workspace Tool Helpers', () => {
  let executor;
  let googleWorkspaceTool;

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve Google Workspace tool
    googleWorkspaceTool = await toolResolver.resolveTool('google-workspace');

    // Create executor instance
    executor = new ToolHelperExecutor(googleWorkspaceTool.executable_knowledge.helpers);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should have executable_knowledge with helpers', () => {
      expect(googleWorkspaceTool.executable_knowledge).toBeDefined();
      expect(googleWorkspaceTool.executable_knowledge.helpers).toBeDefined();
      expect(Array.isArray(googleWorkspaceTool.executable_knowledge.helpers)).toBe(true);
      expect(googleWorkspaceTool.executable_knowledge.helpers.length).toBe(7);
    });

    test('should have all required helper IDs', () => {
      const helperIds = googleWorkspaceTool.executable_knowledge.helpers.map(h => h.id);
      expect(helperIds).toContain('format-oauth-scopes');
      expect(helperIds).toContain('parse-drive-file-id');
      expect(helperIds).toContain('format-calendar-datetime');
      expect(helperIds).toContain('build-gmail-query');
      expect(helperIds).toContain('parse-sheet-range');
      expect(helperIds).toContain('validate-permission-level');
      expect(helperIds).toContain('format-email-attachment');
    });
  });

  describeIntegration('format-oauth-scopes', () => {
    test('should format single service scope', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive'],
      });

      expect(result).toEqual(['https://www.googleapis.com/auth/drive']);
    });

    test('should format multiple service scopes', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive', 'docs', 'sheets'],
      });

      expect(result).toEqual([
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
      ]);
    });

    test('should handle drive.file scope (file-specific access)', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive.file'],
      });

      expect(result).toEqual(['https://www.googleapis.com/auth/drive.file']);
    });

    test('should handle gmail.send scope', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['gmail.send'],
      });

      expect(result).toEqual(['https://www.googleapis.com/auth/gmail.send']);
    });

    test('should handle calendar scope', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['calendar'],
      });

      expect(result).toEqual(['https://www.googleapis.com/auth/calendar']);
    });

    test('should filter out unknown services', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive', 'unknown-service', 'sheets'],
      });

      expect(result).toEqual([
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
      ]);
    });

    test('should return empty array for non-array input', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: 'drive',
      });

      expect(result).toEqual([]);
    });

    test('should return empty array for null input', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: null,
      });

      expect(result).toEqual([]);
    });

    test('should handle all supported services', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive', 'drive.file', 'docs', 'sheets', 'calendar', 'gmail.send'],
      });

      expect(result).toHaveLength(6);
      expect(result).toContain('https://www.googleapis.com/auth/drive');
      expect(result).toContain('https://www.googleapis.com/auth/drive.file');
      expect(result).toContain('https://www.googleapis.com/auth/documents');
      expect(result).toContain('https://www.googleapis.com/auth/spreadsheets');
      expect(result).toContain('https://www.googleapis.com/auth/calendar');
      expect(result).toContain('https://www.googleapis.com/auth/gmail.send');
    });
  });

  describeIntegration('parse-drive-file-id', () => {
    test('should return ID as-is if no slashes', async () => {
      const result = await executor.execute('parse-drive-file-id', {
        input: 'abc123xyz789',
      });

      expect(result).toBe('abc123xyz789');
    });

    test('should extract ID from standard Drive URL', async () => {
      const result = await executor.execute('parse-drive-file-id', {
        input: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
      });

      expect(result).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    });

    test('should extract ID from Drive URL without view parameter', async () => {
      const result = await executor.execute('parse-drive-file-id', {
        input: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/',
      });

      expect(result).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    });

    test('should extract ID from open URL format', async () => {
      const result = await executor.execute('parse-drive-file-id', {
        input: 'https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      });

      expect(result).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    });

    test('should return null for invalid URL format', async () => {
      const result = await executor.execute('parse-drive-file-id', {
        input: 'https://example.com/not-a-drive-url',
      });

      expect(result).toBeNull();
    });

    test('should return null for null input', async () => {
      const result = await executor.execute('parse-drive-file-id', {
        input: null,
      });

      expect(result).toBeNull();
    });

    test('should return null for empty string', async () => {
      const result = await executor.execute('parse-drive-file-id', {
        input: '',
      });

      expect(result).toBeNull();
    });

    test('should handle file IDs with hyphens and underscores', async () => {
      const result = await executor.execute('parse-drive-file-id', {
        input: 'file_id-with_special-chars123',
      });

      expect(result).toBe('file_id-with_special-chars123');
    });
  });

  describeIntegration('format-calendar-datetime', () => {
    test('should format date with time', async () => {
      const result = await executor.execute('format-calendar-datetime', {
        date: '2024-01-15',
        time: '14:30',
      });

      expect(result).toBe('2024-01-15T14:30:00');
    });

    test('should format with timezone', async () => {
      const result = await executor.execute('format-calendar-datetime', {
        date: '2024-01-15',
        time: '14:30',
        timezone: 'America/New_York',
      });

      expect(result).toBe('2024-01-15T14:30:00-05:00');
    });

    test('should return ISO string if already formatted', async () => {
      const result = await executor.execute('format-calendar-datetime', {
        datetime: '2024-01-15T14:30:00Z',
      });

      expect(result).toBe('2024-01-15T14:30:00Z');
    });

    test('should handle all-day events', async () => {
      const result = await executor.execute('format-calendar-datetime', {
        date: '2024-01-15',
        allDay: true,
      });

      expect(result).toBe('2024-01-15');
    });

    test('should default to UTC if no timezone', async () => {
      const result = await executor.execute('format-calendar-datetime', {
        date: '2024-01-15',
        time: '14:30',
      });

      expect(result).toContain('2024-01-15T14:30:00');
    });

    test('should handle ISO datetime input', async () => {
      const result = await executor.execute('format-calendar-datetime', {
        datetime: '2024-01-15T14:30:00-08:00',
      });

      expect(result).toBe('2024-01-15T14:30:00-08:00');
    });
  });

  describeIntegration('build-gmail-query', () => {
    test('should build query with from parameter', async () => {
      const result = await executor.execute('build-gmail-query', {
        from: 'sender@example.com',
      });

      expect(result).toBe('from:sender@example.com');
    });

    test('should build query with to parameter', async () => {
      const result = await executor.execute('build-gmail-query', {
        to: 'recipient@example.com',
      });

      expect(result).toBe('to:recipient@example.com');
    });

    test('should build query with subject', async () => {
      const result = await executor.execute('build-gmail-query', {
        subject: 'important meeting',
      });

      expect(result).toBe('subject:"important meeting"');
    });

    test('should combine multiple parameters with AND', async () => {
      const result = await executor.execute('build-gmail-query', {
        from: 'boss@company.com',
        subject: 'urgent',
      });

      expect(result).toBe('from:boss@company.com subject:urgent');
    });

    test('should handle hasAttachment filter', async () => {
      const result = await executor.execute('build-gmail-query', {
        hasAttachment: true,
      });

      expect(result).toBe('has:attachment');
    });

    test('should handle isUnread filter', async () => {
      const result = await executor.execute('build-gmail-query', {
        isUnread: true,
      });

      expect(result).toBe('is:unread');
    });

    test('should handle label filter', async () => {
      const result = await executor.execute('build-gmail-query', {
        label: 'Work',
      });

      expect(result).toBe('label:Work');
    });

    test('should handle after date filter', async () => {
      const result = await executor.execute('build-gmail-query', {
        after: '2024/01/01',
      });

      expect(result).toBe('after:2024/01/01');
    });

    test('should handle before date filter', async () => {
      const result = await executor.execute('build-gmail-query', {
        before: '2024/12/31',
      });

      expect(result).toBe('before:2024/12/31');
    });

    test('should build complex query with all parameters', async () => {
      const result = await executor.execute('build-gmail-query', {
        from: 'team@company.com',
        to: 'me',
        subject: 'project update',
        hasAttachment: true,
        isUnread: true,
        after: '2024/01/01',
        label: 'Important',
      });

      expect(result).toContain('from:team@company.com');
      expect(result).toContain('to:me');
      expect(result).toContain('subject:"project update"');
      expect(result).toContain('has:attachment');
      expect(result).toContain('is:unread');
      expect(result).toContain('after:2024/01/01');
      expect(result).toContain('label:Important');
    });

    test('should return empty string for empty parameters', async () => {
      const result = await executor.execute('build-gmail-query', {});

      expect(result).toBe('');
    });

    test('should handle OR operator', async () => {
      const result = await executor.execute('build-gmail-query', {
        from: ['user1@example.com', 'user2@example.com'],
      });

      expect(result).toBe('from:(user1@example.com OR user2@example.com)');
    });
  });

  describeIntegration('parse-sheet-range', () => {
    test('should parse simple range', async () => {
      const result = await executor.execute('parse-sheet-range', {
        range: 'A1:B2',
      });

      expect(result).toEqual({
        sheet: null,
        startCell: 'A1',
        endCell: 'B2',
        startRow: 1,
        startCol: 'A',
        endRow: 2,
        endCol: 'B',
      });
    });

    test('should parse range with sheet name', async () => {
      const result = await executor.execute('parse-sheet-range', {
        range: 'Sheet1!A1:B2',
      });

      expect(result).toEqual({
        sheet: 'Sheet1',
        startCell: 'A1',
        endCell: 'B2',
        startRow: 1,
        startCol: 'A',
        endRow: 2,
        endCol: 'B',
      });
    });

    test('should parse range with quoted sheet name', async () => {
      const result = await executor.execute('parse-sheet-range', {
        range: "'Sheet Name'!A1:B2",
      });

      expect(result).toEqual({
        sheet: 'Sheet Name',
        startCell: 'A1',
        endCell: 'B2',
        startRow: 1,
        startCol: 'A',
        endRow: 2,
        endCol: 'B',
      });
    });

    test('should parse single cell', async () => {
      const result = await executor.execute('parse-sheet-range', {
        range: 'A1',
      });

      expect(result).toEqual({
        sheet: null,
        startCell: 'A1',
        endCell: 'A1',
        startRow: 1,
        startCol: 'A',
        endRow: 1,
        endCol: 'A',
      });
    });

    test('should parse column range', async () => {
      const result = await executor.execute('parse-sheet-range', {
        range: 'A:C',
      });

      expect(result).toEqual({
        sheet: null,
        startCell: 'A',
        endCell: 'C',
        startRow: null,
        startCol: 'A',
        endRow: null,
        endCol: 'C',
      });
    });

    test('should parse row range', async () => {
      const result = await executor.execute('parse-sheet-range', {
        range: '1:10',
      });

      expect(result).toEqual({
        sheet: null,
        startCell: '1',
        endCell: '10',
        startRow: 1,
        startCol: null,
        endRow: 10,
        endCol: null,
      });
    });

    test('should handle multi-letter columns', async () => {
      const result = await executor.execute('parse-sheet-range', {
        range: 'AA1:ZZ100',
      });

      expect(result.startCol).toBe('AA');
      expect(result.endCol).toBe('ZZ');
      expect(result.startRow).toBe(1);
      expect(result.endRow).toBe(100);
    });

    test('should return null for invalid range', async () => {
      const result = await executor.execute('parse-sheet-range', {
        range: 'invalid-range-format',
      });

      expect(result).toBeNull();
    });
  });

  describeIntegration('validate-permission-level', () => {
    test('should validate reader permission', async () => {
      const result = await executor.execute('validate-permission-level', {
        permission: 'reader',
      });

      expect(result).toBe(true);
    });

    test('should validate writer permission', async () => {
      const result = await executor.execute('validate-permission-level', {
        permission: 'writer',
      });

      expect(result).toBe(true);
    });

    test('should validate commenter permission', async () => {
      const result = await executor.execute('validate-permission-level', {
        permission: 'commenter',
      });

      expect(result).toBe(true);
    });

    test('should validate owner permission', async () => {
      const result = await executor.execute('validate-permission-level', {
        permission: 'owner',
      });

      expect(result).toBe(true);
    });

    test('should reject invalid permission', async () => {
      const result = await executor.execute('validate-permission-level', {
        permission: 'admin',
      });

      expect(result).toBe(false);
    });

    test('should be case-sensitive', async () => {
      const result = await executor.execute('validate-permission-level', {
        permission: 'Reader',
      });

      expect(result).toBe(false);
    });

    test('should reject empty string', async () => {
      const result = await executor.execute('validate-permission-level', {
        permission: '',
      });

      expect(result).toBe(false);
    });

    test('should reject null', async () => {
      const result = await executor.execute('validate-permission-level', {
        permission: null,
      });

      expect(result).toBe(false);
    });
  });

  describeIntegration('format-email-attachment', () => {
    test('should format attachment with filename and data', async () => {
      const result = await executor.execute('format-email-attachment', {
        filename: 'document.pdf',
        data: 'base64encodeddata',
      });

      expect(result).toEqual({
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        data: 'base64encodeddata',
      });
    });

    test('should infer mimeType from file extension', async () => {
      const result = await executor.execute('format-email-attachment', {
        filename: 'image.png',
        data: 'imagedata',
      });

      expect(result.mimeType).toBe('image/png');
    });

    test('should handle various file extensions', async () => {
      const tests = [
        { filename: 'doc.docx', expectedMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { filename: 'sheet.xlsx', expectedMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { filename: 'photo.jpg', expectedMime: 'image/jpeg' },
        { filename: 'video.mp4', expectedMime: 'video/mp4' },
        { filename: 'archive.zip', expectedMime: 'application/zip' },
      ];

      for (const test of tests) {
        const result = await executor.execute('format-email-attachment', {
          filename: test.filename,
          data: 'data',
        });

        expect(result.mimeType).toBe(test.expectedMime);
      }
    });

    test('should use explicit mimeType if provided', async () => {
      const result = await executor.execute('format-email-attachment', {
        filename: 'data.bin',
        data: 'binarydata',
        mimeType: 'application/octet-stream',
      });

      expect(result.mimeType).toBe('application/octet-stream');
    });

    test('should default to octet-stream for unknown extensions', async () => {
      const result = await executor.execute('format-email-attachment', {
        filename: 'file.unknown',
        data: 'data',
      });

      expect(result.mimeType).toBe('application/octet-stream');
    });

    test('should handle files without extension', async () => {
      const result = await executor.execute('format-email-attachment', {
        filename: 'README',
        data: 'textdata',
      });

      expect(result.mimeType).toBe('application/octet-stream');
    });

    test('should handle Drive file URL', async () => {
      const result = await executor.execute('format-email-attachment', {
        driveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        filename: 'shared-doc.pdf',
      });

      expect(result).toEqual({
        driveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        filename: 'shared-doc.pdf',
        mimeType: 'application/pdf',
      });
    });

    test('should validate attachment size limits', async () => {
      const largeData = 'x'.repeat(26 * 1024 * 1024); // 26MB

      const result = await executor.execute('format-email-attachment', {
        filename: 'large.pdf',
        data: largeData,
      });

      expect(result.error).toBe('Attachment exceeds 25MB limit');
    });
  });

  describeIntegration('Helper Performance', () => {
    test('helper execution should complete in <100ms (target from Story 5.1)', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('format-oauth-scopes', {
          services: ['drive', 'docs', 'sheets'],
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      console.log(`\nGoogle Workspace Helper Performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(100);
    });

    test('complex helper should maintain performance', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('build-gmail-query', {
          from: 'team@company.com',
          to: 'me',
          subject: 'project update',
          hasAttachment: true,
          isUnread: true,
          after: '2024/01/01',
          label: 'Important',
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      expect(avgDuration).toBeLessThan(100);
    });

    test('file parsing should be efficient', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('parse-drive-file-id', {
          input: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      expect(avgDuration).toBeLessThan(100);
    });
  });
});
