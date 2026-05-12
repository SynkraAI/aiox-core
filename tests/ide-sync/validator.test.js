/**
 * Unit tests for validator.js
 * @story 6.19 - IDE Command Auto-Sync System
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const {
  hashContent,
  fileExists,
  readFileIfExists,
  validateIdeSync,
  validateAllIdes,
  formatValidationReport,
} = require('../../.aiox-core/infrastructure/scripts/ide-sync/validator');

describe('validator', () => {
  let tempDir;
  let testCounter = 0;

  beforeAll(() => {
    tempDir = path.join(os.tmpdir(), 'validator-test-' + Date.now());
    fs.ensureDirSync(tempDir);
  });

  afterAll(() => {
    fs.removeSync(tempDir);
  });

  describe('hashContent', () => {
    it('should produce consistent hash for same content', () => {
      const content = 'test content';
      expect(hashContent(content)).toBe(hashContent(content));
    });

    it('should produce different hash for different content', () => {
      expect(hashContent('content A')).not.toBe(hashContent('content B'));
    });

    it('should normalize line endings', () => {
      const lf = 'line1\nline2\n';
      const crlf = 'line1\r\nline2\r\n';
      expect(hashContent(lf)).toBe(hashContent(crlf));
    });

    it('should normalize standalone CR', () => {
      const lf = 'line1\nline2\n';
      const cr = 'line1\rline2\r';
      expect(hashContent(lf)).toBe(hashContent(cr));
    });

    it('should return 64 character hex string', () => {
      const hash = hashContent('test');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', () => {
      const testFile = path.join(tempDir, 'exists.txt');
      fs.writeFileSync(testFile, 'content');
      expect(fileExists(testFile)).toBe(true);
    });

    it('should return false for non-existent file', () => {
      expect(fileExists(path.join(tempDir, 'nonexistent.txt'))).toBe(false);
    });
  });

  describe('readFileIfExists', () => {
    it('should read existing file', () => {
      const testFile = path.join(tempDir, 'readable.txt');
      fs.writeFileSync(testFile, 'file content');
      expect(readFileIfExists(testFile)).toBe('file content');
    });

    it('should return null for non-existent file', () => {
      expect(readFileIfExists(path.join(tempDir, 'missing.txt'))).toBeNull();
    });
  });

  describe('validateIdeSync', () => {
    let targetDir;

    beforeEach(() => {
      testCounter++;
      targetDir = path.join(tempDir, `target-${Date.now()}-${testCounter}`);
      fs.ensureDirSync(targetDir);
    });

    it('should detect synced files', () => {
      const content = 'synced content';
      fs.writeFileSync(path.join(targetDir, 'agent.md'), content);

      const expected = [{ filename: 'agent.md', content }];
      const result = validateIdeSync(expected, targetDir, {});

      expect(result.synced).toHaveLength(1);
      expect(result.missing).toHaveLength(0);
      expect(result.drift).toHaveLength(0);
    });

    it('should detect missing files', () => {
      const expected = [{ filename: 'missing.md', content: 'content' }];
      const result = validateIdeSync(expected, targetDir, {});

      expect(result.missing).toHaveLength(1);
      expect(result.missing[0].filename).toBe('missing.md');
    });

    it('should detect drift', () => {
      fs.writeFileSync(path.join(targetDir, 'agent.md'), 'old content');

      const expected = [{ filename: 'agent.md', content: 'new content' }];
      const result = validateIdeSync(expected, targetDir, {});

      expect(result.drift).toHaveLength(1);
      expect(result.drift[0].filename).toBe('agent.md');
    });

    it('should detect orphaned files', () => {
      fs.writeFileSync(path.join(targetDir, 'expected.md'), 'content');
      fs.writeFileSync(path.join(targetDir, 'orphan.md'), 'orphan');

      const expected = [{ filename: 'expected.md', content: 'content' }];
      const result = validateIdeSync(expected, targetDir, {});

      expect(result.orphaned).toHaveLength(1);
      expect(result.orphaned[0].filename).toBe('orphan.md');
    });

    it('should not count redirect files as orphaned', () => {
      fs.writeFileSync(path.join(targetDir, 'agent.md'), 'content');
      fs.writeFileSync(path.join(targetDir, 'aiox-developer.md'), 'redirect');

      const expected = [{ filename: 'agent.md', content: 'content' }];
      const redirects = { 'aiox-developer': 'aiox-master' };
      const result = validateIdeSync(expected, targetDir, redirects);

      expect(result.orphaned).toHaveLength(0);
    });

    it('should return correct totals', () => {
      fs.writeFileSync(path.join(targetDir, 'synced.md'), 'synced');
      fs.writeFileSync(path.join(targetDir, 'drift.md'), 'old');
      fs.writeFileSync(path.join(targetDir, 'orphan.md'), 'orphan');

      const expected = [
        { filename: 'synced.md', content: 'synced' },
        { filename: 'drift.md', content: 'new' },
        { filename: 'missing.md', content: 'missing' },
      ];

      const result = validateIdeSync(expected, targetDir, {});

      expect(result.total.expected).toBe(3);
      expect(result.total.synced).toBe(1);
      expect(result.total.drift).toBe(1);
      expect(result.total.missing).toBe(1);
      expect(result.total.orphaned).toBe(1);
    });
  });

  describe('validateAllIdes', () => {
    it('should validate multiple IDEs', () => {
      const cursorDir = path.join(tempDir, 'cursor');

      fs.ensureDirSync(cursorDir);

      fs.writeFileSync(path.join(cursorDir, 'agent.md'), 'cursor content');

      const ideConfigs = {
        cursor: {
          expectedFiles: [{ filename: 'agent.md', content: 'cursor content' }],
          targetDir: cursorDir,
        },
      };

      const result = validateAllIdes(ideConfigs, {});

      expect(result.ides.cursor).toBeDefined();
      expect(result.summary.total).toBe(1);
      expect(result.summary.synced).toBe(1);
      expect(result.summary.pass).toBe(true);
    });

    it('should fail if any missing or drift', () => {
      const testDir = path.join(tempDir, 'fail-test');
      fs.ensureDirSync(testDir);

      const ideConfigs = {
        test: {
          expectedFiles: [{ filename: 'missing.md', content: 'content' }],
          targetDir: testDir,
        },
      };

      const result = validateAllIdes(ideConfigs, {});

      expect(result.summary.pass).toBe(false);
      expect(result.summary.missing).toBe(1);
    });
  });

  describe('formatValidationReport', () => {
    it('should format passing report', () => {
      const results = {
        ides: {
          cursor: {
            targetDir: '/path/to/cursor',
            synced: [{ filename: 'agent.md' }],
            missing: [],
            drift: [],
            orphaned: [],
            total: { expected: 1, synced: 1, missing: 0, drift: 0, orphaned: 0 },
          },
        },
        summary: {
          total: 1,
          synced: 1,
          missing: 0,
          drift: 0,
          orphaned: 0,
          pass: true,
        },
      };

      const report = formatValidationReport(results);
      expect(report).toContain('✅ PASS');
      expect(report).toContain('Synced | 1');
    });

    it('should format failing report', () => {
      const results = {
        ides: {
          cursor: {
            targetDir: '/path/to/cursor',
            synced: [],
            missing: [{ filename: 'missing.md' }],
            drift: [],
            orphaned: [],
            total: { expected: 1, synced: 0, missing: 1, drift: 0, orphaned: 0 },
          },
        },
        summary: {
          total: 1,
          synced: 0,
          missing: 1,
          drift: 0,
          orphaned: 0,
          pass: false,
        },
      };

      const report = formatValidationReport(results);
      expect(report).toContain('❌ FAIL');
      expect(report).toContain('Missing | 1');
      expect(report).toContain('npm run sync:ide');
    });

    it('should include verbose details when requested', () => {
      const results = {
        ides: {
          cursor: {
            targetDir: '/path/to/cursor',
            synced: [],
            missing: [{ filename: 'missing.md', path: '/full/path' }],
            drift: [{ filename: 'drift.md', path: '/full/path' }],
            orphaned: [{ filename: 'orphan.md', path: '/full/path' }],
            total: { expected: 2, synced: 0, missing: 1, drift: 1, orphaned: 1 },
          },
        },
        summary: {
          total: 2,
          synced: 0,
          missing: 1,
          drift: 1,
          orphaned: 1,
          pass: false,
        },
      };

      const report = formatValidationReport(results, true);
      expect(report).toContain('### cursor');
      expect(report).toContain('Missing Files');
      expect(report).toContain('missing.md');
      expect(report).toContain('Drifted Files');
      expect(report).toContain('drift.md');
      expect(report).toContain('Orphaned Files');
      expect(report).toContain('orphan.md');
    });
  });
});
