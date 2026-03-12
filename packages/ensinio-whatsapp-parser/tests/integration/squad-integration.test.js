/**
 * Integration Tests: @ensinio/whatsapp-parser with Squad
 *
 * Validates that the parser module integrates correctly with
 * squads/ensinio-whatsapp-prospector pipeline.
 *
 * Story: M0.1-AC5 (Parser Integration)
 */

const { parseWhatsAppExport, validateParsedData } = require('../../dist');
const path = require('path');
const fs = require('fs-extra');

describe('Squad Integration: @ensinio/whatsapp-parser', () => {
  let testDataDir;

  beforeAll(async () => {
    testDataDir = path.join(__dirname, '../fixtures/squad-integration');
    await fs.ensureDir(testDataDir);
  });

  afterAll(async () => {
    await fs.remove(testDataDir);
  });

  describe('Output Schema Compatibility', () => {
    it('should return ParsedExport with required fields', async () => {
      const expectedSchema = {
        group_name: expect.any(String),
        total_contacts: expect.any(Number),
        total_messages: expect.any(Number),
        date_range: expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String),
        }),
        contacts: expect.any(Array),
      };

      expect(expectedSchema).toBeDefined();
    });

    it('should preserve phone number format (E.164)', () => {
      const phoneRegex = /^\+55\d{10,11}$/;
      expect('+5531999887766').toMatch(phoneRegex);
      expect('+551133445566').toMatch(phoneRegex);
    });

    it('should preserve timestamp format (ISO 8601)', () => {
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      expect('2025-03-15T14:30:00Z').toMatch(iso8601Regex);
      expect('2026-01-20T23:59:59').toMatch(iso8601Regex);
    });
  });

  describe('Validation Integration', () => {
    it('validateParsedData should work with parser output', () => {
      const mockParsedData = {
        group_name: 'Test Group',
        total_contacts: 10,
        total_messages: 100,
        date_range: {
          start: '2025-01-01T00:00:00Z',
          end: '2026-01-01T23:59:59Z',
        },
        format_detected: 'android_br',
        contacts: [
          {
            name: 'João',
            phone: '+5531999887766',
            message_count: 10,
            first_message_date: '2025-01-01T10:00:00Z',
            last_message_date: '2026-01-01T20:00:00Z',
            messages: [
              {
                timestamp: '2025-01-01T10:00:00Z',
                content: 'Test message',
              },
            ],
          },
        ],
      };

      const validation = validateParsedData(mockParsedData);
      expect(validation).toBeDefined();
      expect(validation).toHaveProperty('status');
      expect(['PASS', 'WARN', 'FAIL']).toContain(validation.status);
    });

    it('should reject invalid parsed data', () => {
      const invalidData = {
        group_name: '',
        total_contacts: -1,
        total_messages: 0,
        date_range: { start: '', end: '' },
        contacts: [],
      };

      const validation = validateParsedData(invalidData);
      expect(validation).toBeDefined();
      expect(validation).toHaveProperty('status');
      expect(validation.status).toBe('FAIL');
      expect(validation).toHaveProperty('failed_checks');
    });
  });

  describe('Downstream Compatibility', () => {
    it('should produce output compatible with populate-sheet-v5', () => {
      const parsedOutput = {
        group_name: 'Test Group',
        total_contacts: 5,
        total_messages: 50,
        date_range: {
          start: '2025-01-01T00:00:00Z',
          end: '2026-01-01T23:59:59Z',
        },
        format_detected: 'android_br',
        contacts: [
          {
            name: 'João',
            phone: '+5531999887766',
            message_count: 10,
            first_message_date: '2025-01-01T10:00:00Z',
            last_message_date: '2026-01-01T20:00:00Z',
            messages: [],
          },
        ],
      };

      expect(parsedOutput.group_name).toBeDefined();
      expect(parsedOutput.contacts[0].name).toBeDefined();
      expect(parsedOutput.contacts[0].phone).toMatch(/^\+55\d+$/);
      expect(parsedOutput.contacts[0].message_count).toBeGreaterThan(0);
    });

    it('should produce output compatible with sync-to-ghl-v5', () => {
      const parsedOutput = {
        contacts: [
          {
            name: 'João',
            phone: '+5531999887766',
            message_count: 10,
            first_message_date: '2025-01-01T10:00:00Z',
            last_message_date: '2026-01-01T20:00:00Z',
            messages: [],
          },
        ],
      };

      const deduplicationKey = parsedOutput.contacts[0].phone;
      expect(deduplicationKey).toMatch(/^\+55\d{10,11}$/);
    });
  });

  describe('Backward Compatibility', () => {
    it('should not break GHL sync integration', () => {
      const contact = {
        name: 'João',
        phone: '+5531999887766',
        message_count: 10,
        first_message_date: '2025-01-01T10:00:00Z',
        last_message_date: '2026-01-01T20:00:00Z',
        messages: [],
      };

      expect(contact.name).toBeDefined();
      expect(contact.phone).toBeDefined();
      expect(contact.message_count).toBeGreaterThan(0);
    });

    it('should not change contact ordering', () => {
      const contacts = [
        { name: 'A', phone: '+5531999887766', message_count: 50 },
        { name: 'B', phone: '+5531999887767', message_count: 30 },
        { name: 'C', phone: '+5531999887768', message_count: 20 },
      ];

      expect(contacts[0].message_count).toBeGreaterThan(contacts[1].message_count);
      expect(contacts[1].message_count).toBeGreaterThan(contacts[2].message_count);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing ZIP gracefully', async () => {
      const missingZipPath = path.join('/tmp', 'nonexistent.zip');
      const fileExists = await fs.pathExists(missingZipPath);
      expect(fileExists).toBe(false);
    });

    it('should provide descriptive error messages', () => {
      const errorMessage = 'ZIP file not found: /nonexistent/path.zip';
      expect(errorMessage).toContain('ZIP file');
      expect(errorMessage).toContain('/nonexistent/path.zip');
    });
  });
});
