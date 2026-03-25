'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const {
  saveHandoff,
  trimHandoff,
  archiveSession,
  validateHandoff,
  readHandoff,
  getLineCount,
  getHandoffFilePath,
  parseSections,
  extractFilePaths,
  MAX_LINES,
  DRIFT_THRESHOLD,
} = require('../../.claude/lib/handoff/cross-session-handoff');

// Mock child_process.execSync for git status tests
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('Tier 3: Cross-Session Handoff', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cross-session-test-'));
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, '.aiox', 'session-history'), { recursive: true });
    jest.clearAllMocks();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('saveHandoff', () => {
    test('creates handoff file with correct structure', () => {
      const filePath = saveHandoff('test-project', {
        date: '2026-03-25',
        lastSession: 'Implemented Task 4',
        next: 'Continue Task 5',
        activeStories: [
          { story: 'AIOX-HO-1', status: 'In Progress', notes: 'Task 4 done' },
        ],
        recentWork: ['Implemented micro-handoff module'],
        keyDocs: { PRD: 'docs/prd.md' },
        howToContinue: 'Read docs/session-handoff-test-project.md',
      }, tmpDir);

      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');

      expect(content).toContain('# Session Handoff -- test-project');
      expect(content).toContain('**Date:** 2026-03-25');
      expect(content).toContain('AIOX-HO-1');
      expect(content).toContain('Implemented micro-handoff module');
      expect(content).toContain('docs/prd.md');
    });

    test('creates docs directory if missing', () => {
      const dirlessRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'no-docs-'));
      try {
        saveHandoff('new-project', { date: '2026-03-25' }, dirlessRoot);
        const filePath = getHandoffFilePath('new-project', dirlessRoot);
        expect(fs.existsSync(filePath)).toBe(true);
      } finally {
        fs.rmSync(dirlessRoot, { recursive: true, force: true });
      }
    });

    test('limits recent work to 5 items', () => {
      saveHandoff('test', {
        recentWork: Array(10).fill('work item'),
      }, tmpDir);

      const content = fs.readFileSync(getHandoffFilePath('test', tmpDir), 'utf8');
      const matches = content.match(/work item/g);
      expect(matches.length).toBe(5);
    });
  });

  describe('trimHandoff', () => {
    test('does not trim files under MAX_LINES', () => {
      const filePath = saveHandoff('short', {
        date: '2026-03-25',
        lastSession: 'Short session',
        next: 'Continue',
      }, tmpDir);

      const result = trimHandoff(filePath, tmpDir);
      expect(result.trimmed).toBe(false);
      expect(result.originalLines).toBeLessThanOrEqual(MAX_LINES);
    });

    test('trims files over MAX_LINES and archives', () => {
      const filePath = getHandoffFilePath('long', tmpDir);
      // Create a long handoff file
      const lines = ['# Session Handoff -- long'];
      lines.push('**Date:** 2026-03-25');
      lines.push('**Last session:** Very long session');
      lines.push('**Next:** Trim it');
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push('## Estado Atual');
      lines.push('');
      lines.push('| Story | Status |');
      lines.push('|-------|--------|');
      lines.push('| HO-1 | Done |');
      lines.push('');
      lines.push('## O que foi feito nesta sessao');
      lines.push('');
      for (let i = 1; i <= 50; i++) {
        lines.push(`### ${i}. Work item ${i}`);
        lines.push(`- Details about work item ${i}`);
        lines.push(`- More details for item ${i}`);
        lines.push('');
      }
      lines.push('## Documentacao Chave');
      lines.push('');
      lines.push('- PRD: `docs/prd.md`');
      lines.push('');
      lines.push('## Como Continuar');
      lines.push('');
      lines.push('```');
      lines.push('Continue the work');
      lines.push('```');

      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

      const result = trimHandoff(filePath, tmpDir);

      expect(result.trimmed).toBe(true);
      expect(result.originalLines).toBeGreaterThan(MAX_LINES);
      expect(result.newLines).toBeLessThanOrEqual(MAX_LINES + 10); // small buffer is OK
      expect(result.archivePath).toBeTruthy();
      expect(fs.existsSync(result.archivePath)).toBe(true);
    });

    test('returns early for non-existent file', () => {
      const result = trimHandoff('/nonexistent/path.md', tmpDir);
      expect(result.trimmed).toBe(false);
      expect(result.originalLines).toBe(0);
    });

    test('preserves key sections after trimming', () => {
      const filePath = getHandoffFilePath('preserve', tmpDir);
      const lines = ['# Session Handoff -- preserve'];
      lines.push('**Date:** 2026-03-25');
      lines.push('**Last session:** Test');
      lines.push('**Next:** Keep key sections');
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push('## Active Stories');
      lines.push('');
      lines.push('| Story | Status |');
      lines.push('|-------|--------|');
      lines.push('| HO-1 | Done |');
      lines.push('');
      // Pad with lots of content to exceed MAX_LINES
      lines.push('## Recent Work');
      lines.push('');
      for (let i = 1; i <= 100; i++) {
        lines.push(`${i}. Work item ${i} with lots of details about what happened`);
      }
      lines.push('');
      lines.push('## Key Docs');
      lines.push('');
      lines.push('- PRD: `docs/prd.md`');
      lines.push('');
      lines.push('## How to Continue');
      lines.push('');
      lines.push('```');
      lines.push('Resume prompt here');
      lines.push('```');

      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      trimHandoff(filePath, tmpDir);

      const trimmed = fs.readFileSync(filePath, 'utf8');
      expect(trimmed).toContain('Active Stories');
      expect(trimmed).toContain('Key Docs');
      expect(trimmed).toContain('How to Continue');
    });
  });

  describe('archiveSession', () => {
    test('creates archive file with content', () => {
      const archivePath = archiveSession('test-proj', '# Old content', tmpDir);

      expect(archivePath).toContain('.aiox/session-history/test-proj/archive-');
      expect(fs.existsSync(archivePath)).toBe(true);
      expect(fs.readFileSync(archivePath, 'utf8')).toBe('# Old content');
    });

    test('creates archive directory if missing', () => {
      const archivePath = archiveSession('new-proj', 'content', tmpDir);
      const archiveDir = path.dirname(archivePath);
      expect(fs.existsSync(archiveDir)).toBe(true);
    });
  });

  describe('validateHandoff', () => {
    test('returns valid when no handoff file exists', () => {
      execSync.mockReturnValue('');
      const result = validateHandoff('nonexistent', tmpDir);
      expect(result.valid).toBe(true);
      expect(result.drift).toBe(0);
    });

    test('detects low drift as valid', () => {
      // Create handoff mentioning some files
      const content = [
        '# Session Handoff',
        '- Modified: `src/handoff/micro-handoff.js`',
        '- Modified: `src/handoff/session-state.js`',
      ].join('\n');
      const filePath = getHandoffFilePath('drift-low', tmpDir);
      fs.writeFileSync(filePath, content, 'utf8');

      // Git status shows same files
      execSync.mockReturnValue(
        ' M src/handoff/micro-handoff.js\n M src/handoff/session-state.js\n'
      );

      const result = validateHandoff('drift-low', tmpDir);
      expect(result.valid).toBe(true);
    });

    test('detects high drift and warns', () => {
      // Create handoff mentioning 1 file
      const content = '- Modified: `src/old-file.js`\n';
      const filePath = getHandoffFilePath('drift-high', tmpDir);
      fs.writeFileSync(filePath, content, 'utf8');

      // Git status shows many NEW files not in handoff
      execSync.mockReturnValue(
        [
          ' M src/new1.js',
          ' M src/new2.js',
          ' M src/new3.js',
          ' M src/new4.js',
          ' M src/new5.js',
        ].join('\n') + '\n'
      );

      const result = validateHandoff('drift-high', tmpDir);
      expect(result.drift).toBeGreaterThan(DRIFT_THRESHOLD);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('drift detected');
    });

    test('handles git not available gracefully', () => {
      const content = '- Modified: `src/file.js`\n';
      const filePath = getHandoffFilePath('no-git', tmpDir);
      fs.writeFileSync(filePath, content, 'utf8');

      execSync.mockImplementation(() => {
        throw new Error('git not found');
      });

      const result = validateHandoff('no-git', tmpDir);
      expect(result.valid).toBe(true);
      expect(result.warning).toContain('Could not run git status');
    });

    test('returns valid when handoff has no extractable paths', () => {
      const content = '# Simple handoff with no file paths\nJust text.\n';
      const filePath = getHandoffFilePath('no-paths', tmpDir);
      fs.writeFileSync(filePath, content, 'utf8');

      execSync.mockReturnValue(' M src/changed.js\n');

      const result = validateHandoff('no-paths', tmpDir);
      expect(result.valid).toBe(true);
    });
  });

  describe('readHandoff', () => {
    test('returns null for non-existent project', () => {
      expect(readHandoff('nope', tmpDir)).toBeNull();
    });

    test('returns content for existing handoff', () => {
      saveHandoff('readable', { date: '2026-03-25' }, tmpDir);
      const content = readHandoff('readable', tmpDir);
      expect(content).toContain('Session Handoff');
    });
  });

  describe('getLineCount', () => {
    test('returns 0 for non-existent file', () => {
      expect(getLineCount('nope', tmpDir)).toBe(0);
    });

    test('counts lines accurately', () => {
      saveHandoff('countable', { date: '2026-03-25' }, tmpDir);
      const count = getLineCount('countable', tmpDir);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('parseSections', () => {
    test('parses header and sections correctly', () => {
      const md = [
        '# Title',
        '**Date:** 2026',
        '',
        '## Section One',
        'Content 1',
        '',
        '## Section Two',
        'Content 2',
      ].join('\n');

      const result = parseSections(md);
      expect(result.header).toContain('# Title');
      expect(result.sections.length).toBe(2);
      expect(result.sections[0].title).toBe('Section One');
      expect(result.sections[1].title).toBe('Section Two');
    });
  });

  describe('extractFilePaths', () => {
    test('extracts backtick-enclosed file paths', () => {
      const content = 'Modified `src/handoff/micro-handoff.js` and `tests/foo.test.js`';
      const paths = extractFilePaths(content);
      expect(paths).toContain('src/handoff/micro-handoff.js');
      expect(paths).toContain('tests/foo.test.js');
    });

    test('ignores non-path backtick content', () => {
      const content = 'Use `npm test` and check `status`';
      const paths = extractFilePaths(content);
      expect(paths.length).toBe(0);
    });

    test('deduplicates paths', () => {
      const content = '`src/a.js` and again `src/a.js`';
      const paths = extractFilePaths(content);
      expect(paths.filter((p) => p === 'src/a.js').length).toBe(1);
    });
  });

  describe('constants', () => {
    test('MAX_LINES is 200', () => {
      expect(MAX_LINES).toBe(200);
    });

    test('DRIFT_THRESHOLD is 20', () => {
      expect(DRIFT_THRESHOLD).toBe(20);
    });
  });
});
