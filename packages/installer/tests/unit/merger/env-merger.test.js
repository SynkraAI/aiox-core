/**
 * @fileoverview Tests for EnvMerger
 * Story 9.2: .env File Merge Implementation
 */

const { EnvMerger } = require('../../../src/merger/strategies/env-merger.js');
const { parseEnvFile } = require('../../../src/merger/parsers/env-parser.js');

describe('EnvMerger', () => {
  let merger;

  beforeEach(() => {
    merger = new EnvMerger();
  });

  describe('canMerge', () => {
    it('should always return true for .env files', () => {
      expect(merger.canMerge('', '')).toBe(true);
      expect(merger.canMerge('KEY=value', 'OTHER=value')).toBe(true);
    });
  });

  describe('merge', () => {
    it('should add new variables from new content', async () => {
      const existing = 'EXISTING_VAR=existing_value';
      const newContent = 'NEW_VAR=new_value';

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('EXISTING_VAR=existing_value');
      expect(result.content).toContain('NEW_VAR=new_value');
      expect(result.stats.preserved).toBe(1);
      expect(result.stats.added).toBe(1);
    });

    it('should preserve existing values over new values', async () => {
      const existing = 'API_KEY=my_secret_key';
      const newContent = 'API_KEY=placeholder_key';

      const result = await merger.merge(existing, newContent);

      // The original value is preserved at the start
      expect(result.content.startsWith('API_KEY=my_secret_key')).toBe(true);
      // The suggested value appears in AIOX_SUGGESTED comment
      expect(result.content).toContain('AIOX_SUGGESTED: API_KEY=placeholder_key');
      expect(result.stats.preserved).toBe(1);
    });

    it('should add AIOX_SUGGESTED comment for differing values', async () => {
      const existing = 'PORT=3000';
      const newContent = 'PORT=8080';

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('PORT=3000');
      expect(result.content).toContain('# AIOX_SUGGESTED: PORT=8080');
      expect(result.stats.conflicts).toBe(1);
    });

    it('should preserve comments from existing file', async () => {
      const existing = `# Database configuration
DB_HOST=localhost
DB_PORT=5432`;
      const newContent = 'NEW_VAR=value';

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('# Database configuration');
      expect(result.content).toContain('DB_HOST=localhost');
    });

    it('should add new variables in AIOX Variables section', async () => {
      const existing = 'EXISTING=value';
      const newContent = `AIOX_VAR1=value1
AIOX_VAR2=value2`;

      const result = await merger.merge(existing, newContent);

      // Header includes date: "# === AIOX Variables (added YYYY-MM-DD) ==="
      expect(result.content).toMatch(/# === AIOX Variables \(added \d{4}-\d{2}-\d{2}\) ===/);
      expect(result.content).toContain('AIOX_VAR1=value1');
      expect(result.content).toContain('AIOX_VAR2=value2');
    });

    it('should handle empty existing content', async () => {
      const existing = '';
      const newContent = 'NEW_VAR=value';

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('NEW_VAR=value');
      expect(result.stats.added).toBe(1);
    });

    it('should handle empty new content', async () => {
      const existing = 'EXISTING=value';
      const newContent = '';

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('EXISTING=value');
      expect(result.stats.preserved).toBe(1);
    });

    it('should handle multiline values', async () => {
      const existing = `PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA
-----END RSA PRIVATE KEY-----"`;
      const newContent = 'OTHER=value';

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('PRIVATE_KEY=');
      expect(result.content).toContain('OTHER=value');
    });
  });

  describe('preview', () => {
    it('should return same result as merge with preview option', async () => {
      const existing = 'A=1';
      const newContent = 'B=2';

      const previewResult = await merger.preview(existing, newContent);
      const mergeResult = await merger.merge(existing, newContent, { preview: true });

      expect(previewResult.content).toBe(mergeResult.content);
      expect(previewResult.stats).toEqual(mergeResult.stats);
    });
  });
});

describe('parseEnvFile', () => {
  it('should parse simple key-value pairs', () => {
    const content = `KEY1=value1
KEY2=value2`;

    const result = parseEnvFile(content);

    expect(result.variables.get('KEY1').value).toBe('value1');
    expect(result.variables.get('KEY2').value).toBe('value2');
  });

  it('should handle quoted values', () => {
    const content = `QUOTED="value with spaces"
SINGLE='single quoted'`;

    const result = parseEnvFile(content);

    expect(result.variables.get('QUOTED').value).toBe('"value with spaces"');
    expect(result.variables.get('SINGLE').value).toBe("'single quoted'");
  });

  it('should preserve comments', () => {
    const content = `# This is a comment
KEY=value
# Another comment`;

    const result = parseEnvFile(content);

    expect(result.comments.length).toBeGreaterThan(0);
    expect(result.variables.get('KEY').value).toBe('value');
  });

  it('should handle empty lines', () => {
    const content = `KEY1=value1

KEY2=value2`;

    const result = parseEnvFile(content);

    expect(result.variables.get('KEY1').value).toBe('value1');
    expect(result.variables.get('KEY2').value).toBe('value2');
  });

  it('should handle values with equals signs', () => {
    const content = 'URL=https://example.com?param=value';

    const result = parseEnvFile(content);

    expect(result.variables.get('URL').value).toBe('https://example.com?param=value');
  });

  it('should handle empty values', () => {
    const content = 'EMPTY_VAR=';

    const result = parseEnvFile(content);

    expect(result.variables.has('EMPTY_VAR')).toBe(true);
    expect(result.variables.get('EMPTY_VAR').value).toBe('');
  });
});
