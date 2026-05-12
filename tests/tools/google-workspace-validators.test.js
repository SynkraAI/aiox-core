// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Google Workspace Tool Validators Test Suite
 *
 * Tests all 4 validators defined in google-workspace.yaml:
 * 1. validate-drive-operations (create_file, share_file, update_file)
 * 2. validate-calendar-operations (create_event, update_event)
 * 3. validate-gmail-operations (send_email, search_messages)
 * 4. validate-sheet-operations (create_spreadsheet, update_range)
 */
describeIntegration('Google Workspace Tool Validators', () => {
  let validator;
  let googleWorkspaceTool;

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve Google Workspace tool
    googleWorkspaceTool = await toolResolver.resolveTool('google-workspace');

    // Create validator instance
    validator = new ToolValidationHelper(googleWorkspaceTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve google-workspace tool from aiox-core/tools/mcp', async () => {
      expect(googleWorkspaceTool).toBeDefined();
      expect(googleWorkspaceTool.id).toBe('google-workspace');
      expect(googleWorkspaceTool.type).toBe('mcp');
      expect(googleWorkspaceTool.schema_version).toBe(2.0);
    });

    test('should have executable_knowledge with validators', () => {
      expect(googleWorkspaceTool.executable_knowledge).toBeDefined();
      expect(googleWorkspaceTool.executable_knowledge.validators).toBeDefined();
      expect(Array.isArray(googleWorkspaceTool.executable_knowledge.validators)).toBe(true);
      expect(googleWorkspaceTool.executable_knowledge.validators.length).toBe(8);
    });

    test('should have all required validator IDs', () => {
      const validatorIds = googleWorkspaceTool.executable_knowledge.validators.map(v => v.id);
      // Drive operations
      expect(validatorIds).toContain('validate-create-file');
      expect(validatorIds).toContain('validate-share-file');
      // Calendar operations
      expect(validatorIds).toContain('validate-create-event');
      expect(validatorIds).toContain('validate-update-event');
      // Gmail operations
      expect(validatorIds).toContain('validate-send-email');
      expect(validatorIds).toContain('validate-search-messages');
      // Sheet operations
      expect(validatorIds).toContain('validate-create-spreadsheet');
      expect(validatorIds).toContain('validate-update-range');
    });
  });

  describeIntegration('validate-drive-operations (create_file)', () => {
    test('should pass with valid create_file parameters', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
        content: 'File content here',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should pass with fileUrl instead of content', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
        fileUrl: 'https://example.com/document.pdf',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with valid mimeType', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
        content: 'Content',
        mimeType: 'application/pdf',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without name', async () => {
      const result = await validator.validate('create_file', {
        content: 'Some content',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('name is required for create_file');
    });

    test('should fail without content or fileUrl', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('Either content or fileUrl is required for create_file');
    });

    test('should fail with invalid mimeType format', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
        content: 'Content',
        mimeType: 'invalid-mime',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('Invalid mimeType format');
    });

    test('should pass with complex mimeType', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test',
        content: 'Content',
        mimeType: 'application/vnd.google-apps.document',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('validate-drive-operations (share_file)', () => {
    test('should pass with email address sharing', async () => {
      const result = await validator.validate('share_file', {
        fileId: 'abc123xyz',
        emailAddress: 'user@example.com',
        role: 'reader',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with type-based sharing', async () => {
      const result = await validator.validate('share_file', {
        fileId: 'abc123xyz',
        type: 'anyone',
        role: 'reader',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without fileId', async () => {
      const result = await validator.validate('share_file', {
        emailAddress: 'user@example.com',
        role: 'reader',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('fileId is required for share_file');
    });

    test('should fail without emailAddress or type', async () => {
      const result = await validator.validate('share_file', {
        fileId: 'abc123xyz',
        role: 'reader',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('Either emailAddress or type (anyone/domain) is required');
    });

    test('should fail with invalid role', async () => {
      const result = await validator.validate('share_file', {
        fileId: 'abc123xyz',
        emailAddress: 'user@example.com',
        role: 'invalid-role',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('role must be one of: reader, writer, commenter, owner');
    });

    test('should pass with all valid roles', async () => {
      const roles = ['reader', 'writer', 'commenter', 'owner'];

      for (const role of roles) {
        const result = await validator.validate('share_file', {
          fileId: 'abc123xyz',
          emailAddress: 'user@example.com',
          role: role,
        });

        expect(result.valid).toBe(true);
      }
    });
  });

  describeIntegration('validate-calendar-operations (create_event)', () => {
    test('should pass with required event parameters', async () => {
      const result = await validator.validate('create_event', {
        user_google_email: 'test@example.com',
        summary: 'Team Meeting',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with optional attendees', async () => {
      const result = await validator.validate('create_event', {
        user_google_email: 'test@example.com',
        summary: 'Team Meeting',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        attendees: ['user1@example.com', 'user2@example.com'],
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without summary', async () => {
      const result = await validator.validate('create_event', {
        user_google_email: 'test@example.com',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('summary is required for create_event');
    });

    test('should fail without startTime', async () => {
      const result = await validator.validate('create_event', {
        user_google_email: 'test@example.com',
        summary: 'Meeting',
        endTime: '2024-01-15T11:00:00Z',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('startTime is required for create_event');
    });

    test('should fail without endTime', async () => {
      const result = await validator.validate('create_event', {
        user_google_email: 'test@example.com',
        summary: 'Meeting',
        startTime: '2024-01-15T10:00:00Z',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('endTime is required for create_event');
    });

    test('should fail with invalid ISO 8601 startTime', async () => {
      const result = await validator.validate('create_event', {
        user_google_email: 'test@example.com',
        summary: 'Meeting',
        startTime: '2024-01-15 10:00:00',
        endTime: '2024-01-15T11:00:00Z',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('startTime must be valid ISO 8601 format');
    });

    test('should fail with invalid ISO 8601 endTime', async () => {
      const result = await validator.validate('create_event', {
        user_google_email: 'test@example.com',
        summary: 'Meeting',
        startTime: '2024-01-15T10:00:00Z',
        endTime: 'invalid-date',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('endTime must be valid ISO 8601 format');
    });

    test('should fail if attendees is not an array', async () => {
      const result = await validator.validate('create_event', {
        user_google_email: 'test@example.com',
        summary: 'Meeting',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        attendees: 'user@example.com',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('attendees must be an array of email addresses');
    });
  });

  describeIntegration('validate-calendar-operations (update_event)', () => {
    test('should pass with eventId and updates', async () => {
      const result = await validator.validate('update_event', {
        eventId: 'event123',
        summary: 'Updated Meeting Title',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without eventId', async () => {
      const result = await validator.validate('update_event', {
        summary: 'Updated Title',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('eventId is required for update_event');
    });

    test('should pass with time updates', async () => {
      const result = await validator.validate('update_event', {
        eventId: 'event123',
        startTime: '2024-01-16T10:00:00Z',
        endTime: '2024-01-16T11:00:00Z',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('validate-gmail-operations (send_email)', () => {
    test('should pass with required email parameters', async () => {
      const result = await validator.validate('send_email', {
        to: 'recipient@example.com',
        subject: 'Test Email',
        body: 'Email body content',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with cc and bcc', async () => {
      const result = await validator.validate('send_email', {
        to: 'recipient@example.com',
        subject: 'Test',
        body: 'Content',
        cc: 'cc@example.com',
        bcc: 'bcc@example.com',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without to address', async () => {
      const result = await validator.validate('send_email', {
        subject: 'Test',
        body: 'Content',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('to is required for send_email');
    });

    test('should fail without subject', async () => {
      const result = await validator.validate('send_email', {
        to: 'recipient@example.com',
        body: 'Content',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('subject is required for send_email');
    });

    test('should fail without body', async () => {
      const result = await validator.validate('send_email', {
        to: 'recipient@example.com',
        subject: 'Test',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('body is required for send_email');
    });

    test('should fail with invalid email format in to', async () => {
      const result = await validator.validate('send_email', {
        to: 'invalid-email',
        subject: 'Test',
        body: 'Content',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('to must be a valid email address');
    });

    test('should pass with valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ];

      for (const email of validEmails) {
        const result = await validator.validate('send_email', {
          to: email,
          subject: 'Test',
          body: 'Content',
        });

        expect(result.valid).toBe(true);
      }
    });
  });

  describeIntegration('validate-gmail-operations (search_messages)', () => {
    test('should pass with search query', async () => {
      const result = await validator.validate('search_messages', {
        query: 'from:sender@example.com',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with maxResults', async () => {
      const result = await validator.validate('search_messages', {
        query: 'subject:important',
        maxResults: 50,
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without query', async () => {
      const result = await validator.validate('search_messages', {});

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('query is required for search_messages');
    });

    test('should fail with invalid maxResults', async () => {
      const result = await validator.validate('search_messages', {
        query: 'test',
        maxResults: 'invalid',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('maxResults must be a positive number');
    });

    test('should fail with negative maxResults', async () => {
      const result = await validator.validate('search_messages', {
        query: 'test',
        maxResults: -10,
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('maxResults must be a positive number');
    });
  });

  describeIntegration('validate-sheet-operations (create_spreadsheet)', () => {
    test('should pass with title', async () => {
      const result = await validator.validate('create_spreadsheet', {
        title: 'My Spreadsheet',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with sheets array', async () => {
      const result = await validator.validate('create_spreadsheet', {
        title: 'My Spreadsheet',
        sheets: ['Sheet1', 'Sheet2', 'Sheet3'],
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without title', async () => {
      const result = await validator.validate('create_spreadsheet', {
        sheets: ['Sheet1'],
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('title is required for create_spreadsheet');
    });

    test('should fail if sheets is not an array', async () => {
      const result = await validator.validate('create_spreadsheet', {
        title: 'Spreadsheet',
        sheets: 'Sheet1',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('sheets must be an array of sheet names');
    });
  });

  describeIntegration('validate-sheet-operations (update_range)', () => {
    test('should pass with valid range update', async () => {
      const result = await validator.validate('update_range', {
        spreadsheetId: 'spreadsheet123',
        range: 'Sheet1!A1:B2',
        values: [['A1', 'B1'], ['A2', 'B2']],
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without spreadsheetId', async () => {
      const result = await validator.validate('update_range', {
        range: 'A1:B2',
        values: [['data']],
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('spreadsheetId is required for update_range');
    });

    test('should fail without range', async () => {
      const result = await validator.validate('update_range', {
        spreadsheetId: 'spreadsheet123',
        values: [['data']],
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('range is required for update_range');
    });

    test('should fail without values', async () => {
      const result = await validator.validate('update_range', {
        spreadsheetId: 'spreadsheet123',
        range: 'A1:B2',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('values is required for update_range');
    });

    test('should fail if values is not an array', async () => {
      const result = await validator.validate('update_range', {
        spreadsheetId: 'spreadsheet123',
        range: 'A1:B2',
        values: 'invalid',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('values must be a 2D array');
    });

    test('should fail with invalid range format', async () => {
      const result = await validator.validate('update_range', {
        spreadsheetId: 'spreadsheet123',
        range: 'invalid-range',
        values: [['data']],
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('range must be in A1 notation (e.g., Sheet1!A1:B2)');
    });

    test('should pass with various valid range formats', async () => {
      const validRanges = [
        'Sheet1!A1:B2',
        'A1:B2',
        'Sheet Name!A1:Z100',
        "'Sheet with spaces'!A1:B2",
      ];

      for (const range of validRanges) {
        const result = await validator.validate('update_range', {
          spreadsheetId: 'spreadsheet123',
          range: range,
          values: [['data']],
        });

        expect(result.valid).toBe(true);
      }
    });
  });

  describeIntegration('Validator Performance', () => {
    test('validation should complete in <50ms (target from Story 5.1)', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await validator.validate('create_file', {
          name: 'Performance Test',
          content: 'Test content',
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      console.log(`\nGoogle Workspace Validator Performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(50);
    });

    test('complex validation should maintain performance', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await validator.validate('create_event', {
          summary: 'Performance Test Event',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:00:00Z',
          attendees: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      expect(avgDuration).toBeLessThan(50);
    });
  });
});
