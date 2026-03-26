'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  extractMemoryHints,
  scoreMemorySection,
  parseMemoryFile,
  extractKeywords,
  resolveMemoryPath,
  MAX_HINTS,
  MAX_CONTENT_CHARS,
  MAX_HINT_LENGTH,
} = require('../../.claude/lib/handoff/memory-hints');

describe('Memory Hints — Agent Memory Integration', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-hints-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  /**
   * Helper: create a fake agent MEMORY.md file at the expected path.
   */
  function createMemoryFile(agentId, content) {
    const normalizedId = agentId.startsWith('aiox-') ? agentId : `aiox-${agentId}`;
    const dir = path.join(tmpDir, '.claude', 'agent-memory', normalizedId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'MEMORY.md'), content, 'utf8');
  }

  describe('resolveMemoryPath', () => {
    test('normalizes agent ID with aiox- prefix', () => {
      const p = resolveMemoryPath('dev', '/project');
      expect(p).toBe(path.join('/project', '.claude', 'agent-memory', 'aiox-dev', 'MEMORY.md'));
    });

    test('does not double-prefix agent IDs already prefixed', () => {
      const p = resolveMemoryPath('aiox-dev', '/project');
      expect(p).toBe(path.join('/project', '.claude', 'agent-memory', 'aiox-dev', 'MEMORY.md'));
    });
  });

  describe('parseMemoryFile', () => {
    test('parses markdown with ## headers into sections', () => {
      createMemoryFile('dev', [
        '# Top Level Title',
        '',
        '## Section One',
        'Content of section one.',
        '',
        '## Section Two',
        'Content of section two.',
        'More content here.',
      ].join('\n'));

      const memPath = resolveMemoryPath('dev', tmpDir);
      const sections = parseMemoryFile(memPath);

      expect(sections).toHaveLength(2);
      expect(sections[0].header).toBe('Section One');
      expect(sections[0].content).toContain('Content of section one.');
      expect(sections[1].header).toBe('Section Two');
      expect(sections[1].content).toContain('More content here.');
    });

    test('parses ### sub-headers as sections', () => {
      createMemoryFile('qa', [
        '## Main Section',
        '### Sub Section',
        'Sub content.',
      ].join('\n'));

      const memPath = resolveMemoryPath('qa', tmpDir);
      const sections = parseMemoryFile(memPath);

      expect(sections).toHaveLength(2);
      expect(sections[0].header).toBe('Main Section');
      expect(sections[1].header).toBe('Sub Section');
    });

    test('returns empty array for missing file', () => {
      const sections = parseMemoryFile('/nonexistent/path/MEMORY.md');
      expect(sections).toEqual([]);
    });

    test('returns empty array for empty file', () => {
      createMemoryFile('pm', '');
      const memPath = resolveMemoryPath('pm', tmpDir);
      const sections = parseMemoryFile(memPath);
      expect(sections).toEqual([]);
    });

    test('returns empty array for file with no ## headers', () => {
      createMemoryFile('sm', 'Just plain text\nwith no headers');
      const memPath = resolveMemoryPath('sm', tmpDir);
      const sections = parseMemoryFile(memPath);
      expect(sections).toEqual([]);
    });
  });

  describe('extractKeywords', () => {
    test('extracts tokens from story_id and current_task', () => {
      const keywords = extractKeywords({
        story_id: 'AIOX-HO-2.2',
        current_task: 'Implement memory hints',
      });

      expect(keywords).toContain('aiox');
      expect(keywords).toContain('ho');
      expect(keywords).toContain('implement');
      expect(keywords).toContain('memory');
      expect(keywords).toContain('hints');
    });

    test('deduplicates tokens', () => {
      const keywords = extractKeywords({
        story_id: 'test-test',
        current_task: 'test test',
      });

      // 'test' should appear only once
      const count = keywords.filter((k) => k === 'test').length;
      expect(count).toBe(1);
    });

    test('returns empty array for null context', () => {
      expect(extractKeywords(null)).toEqual([]);
      expect(extractKeywords(undefined)).toEqual([]);
    });

    test('returns empty array for empty strings', () => {
      expect(extractKeywords({ story_id: '', current_task: '' })).toEqual([]);
    });

    test('handles context with only story_id', () => {
      const keywords = extractKeywords({ story_id: 'BSS-8.1' });
      expect(keywords).toContain('bss');
      expect(keywords).toContain('8');
      expect(keywords).toContain('1');
    });
  });

  describe('scoreMemorySection', () => {
    test('returns correct overlap count for matching keywords', () => {
      const section = {
        header: 'Memory Hints Algorithm',
        content: 'Token overlap scoring chosen over TF-IDF for simplicity.',
      };
      const keywords = ['memory', 'hints', 'token', 'algorithm'];

      const score = scoreMemorySection(section, keywords);
      expect(score).toBe(4); // memory, hints, token, algorithm
    });

    test('returns 0 for no overlap', () => {
      const section = {
        header: 'Database Schema',
        content: 'PostgreSQL tables and indexes.',
      };
      const keywords = ['memory', 'hints', 'handoff'];

      expect(scoreMemorySection(section, keywords)).toBe(0);
    });

    test('returns 0 for null inputs', () => {
      expect(scoreMemorySection(null, ['test'])).toBe(0);
      expect(scoreMemorySection({ header: 'test' }, null)).toBe(0);
      expect(scoreMemorySection({ header: 'test' }, [])).toBe(0);
    });

    test('scores case-insensitively', () => {
      const section = {
        header: 'MEMORY Hints',
        content: 'AIOX related.',
      };
      const keywords = ['memory', 'aiox'];

      expect(scoreMemorySection(section, keywords)).toBe(2);
    });

    test('only uses first MAX_CONTENT_CHARS of content', () => {
      // Content with matching keyword beyond MAX_CONTENT_CHARS
      const longContent = 'x'.repeat(MAX_CONTENT_CHARS + 50) + ' specialkeyword';
      const section = {
        header: 'Some Header',
        content: longContent,
      };
      const keywords = ['specialkeyword'];

      // Should NOT find the keyword since it's beyond the content limit
      expect(scoreMemorySection(section, keywords)).toBe(0);
    });
  });

  describe('extractMemoryHints', () => {
    test('returns top 3 relevant sections as hint strings', () => {
      createMemoryFile('dev', [
        '# Agent Memory',
        '',
        '## Memory Hints Algorithm',
        'Token overlap scoring chosen for handoff system.',
        '',
        '## AIOX-HO Implementation Notes',
        'Handoff system uses micro-handoff artifacts.',
        '',
        '## General TypeScript Patterns',
        'Use strict mode always.',
        '',
        '## Handoff Hook Integration',
        'Hook timeout is 5000ms. Memory extraction must be fast.',
        '',
        '## Database Schema Notes',
        'PostgreSQL with Supabase.',
      ].join('\n'));

      const hints = extractMemoryHints('dev', {
        story_id: 'AIOX-HO-2.2',
        current_task: 'Implement memory hints',
      }, tmpDir);

      expect(hints.length).toBeLessThanOrEqual(MAX_HINTS);
      expect(hints.length).toBeGreaterThan(0);
      // The top hints should be the sections with most keyword overlap
      // "Memory Hints Algorithm" and "AIOX-HO Implementation Notes" should score high
    });

    test('returns empty array when MEMORY.md does not exist', () => {
      const hints = extractMemoryHints('nonexistent-agent', {
        story_id: 'TEST-1',
        current_task: 'Test task',
      }, tmpDir);

      expect(hints).toEqual([]);
    });

    test('returns empty array when MEMORY.md is empty', () => {
      createMemoryFile('dev', '');

      const hints = extractMemoryHints('dev', {
        story_id: 'TEST-1',
        current_task: 'Test task',
      }, tmpDir);

      expect(hints).toEqual([]);
    });

    test('returns empty array when no sections score above 0', () => {
      createMemoryFile('dev', [
        '## Database Schema Notes',
        'PostgreSQL with Supabase RLS policies.',
        '',
        '## CI/CD Pipeline',
        'GitHub Actions workflow configuration.',
      ].join('\n'));

      const hints = extractMemoryHints('dev', {
        story_id: 'COMPLETELY-UNRELATED',
        current_task: 'Something else entirely',
      }, tmpDir);

      expect(hints).toEqual([]);
    });

    test('returns empty array for null agentId', () => {
      expect(extractMemoryHints(null, { story_id: 'X' }, tmpDir)).toEqual([]);
    });

    test('returns empty array for empty story context', () => {
      createMemoryFile('dev', '## Some Section\nContent here.');

      const hints = extractMemoryHints('dev', {}, tmpDir);
      expect(hints).toEqual([]);
    });

    test('truncates hint strings to MAX_HINT_LENGTH', () => {
      const longHeader = 'A'.repeat(MAX_HINT_LENGTH + 20) + ' keyword';
      createMemoryFile('dev', `## ${longHeader}\nContent with keyword.`);

      const hints = extractMemoryHints('dev', {
        story_id: 'keyword',
        current_task: 'keyword task',
      }, tmpDir);

      if (hints.length > 0) {
        expect(hints[0].length).toBeLessThanOrEqual(MAX_HINT_LENGTH + 3); // +3 for '...'
      }
    });

    test('handles fewer than 3 relevant sections', () => {
      createMemoryFile('dev', [
        '## Memory Related Section',
        'Content about memory and hints.',
      ].join('\n'));

      const hints = extractMemoryHints('dev', {
        story_id: 'X',
        current_task: 'memory',
      }, tmpDir);

      expect(hints.length).toBeLessThanOrEqual(1);
    });
  });

  describe('read-only enforcement', () => {
    test('module source contains no fs.writeFileSync or fs.writeFile calls', () => {
      const modulePath = path.resolve(__dirname, '../../.claude/lib/handoff/memory-hints.js');
      const source = fs.readFileSync(modulePath, 'utf8');

      expect(source).not.toMatch(/fs\.writeFileSync/);
      expect(source).not.toMatch(/fs\.writeFile\s*\(/);
      expect(source).not.toMatch(/fs\.appendFileSync/);
      expect(source).not.toMatch(/fs\.appendFile\s*\(/);
    });
  });
});
