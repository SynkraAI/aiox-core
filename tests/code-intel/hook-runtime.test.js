'use strict';

const path = require('path');
const { resolveCodeIntel, formatAsXml, escapeXml, _resetForTesting } = require(
  path.join(__dirname, '..', '..', '.aios-core', 'core', 'code-intel', 'hook-runtime.js'),
);

const PROJECT_ROOT = path.join(__dirname, '..', '..');

describe('code-intel hook-runtime', () => {
  beforeEach(() => {
    _resetForTesting();
  });

  describe('resolveCodeIntel', () => {
    it('returns null when filePath is empty', async () => {
      const result = await resolveCodeIntel('', PROJECT_ROOT);
      expect(result).toBeNull();
    });

    it('returns null when cwd is empty', async () => {
      const result = await resolveCodeIntel('some/file.js', '');
      expect(result).toBeNull();
    });

    it('returns entity data for a known registry path', async () => {
      // Use a path known to exist in entity-registry.yaml
      const result = await resolveCodeIntel(
        '.aios-core/development/tasks/create-next-story.md',
        PROJECT_ROOT,
      );

      // Should find something (entity or references)
      expect(result).not.toBeNull();
      if (result.entity) {
        expect(result.entity).toHaveProperty('file');
        expect(result.entity).toHaveProperty('context');
      }
    });

    it('returns no useful data for unknown file path', async () => {
      const result = await resolveCodeIntel(
        'this/path/does/not/exist/anywhere.xyz',
        PROJECT_ROOT,
      );
      // May return an object with nulls/empty arrays — formatAsXml should handle gracefully
      if (result) {
        expect(result.entity).toBeNull();
        expect(result.references).toBeNull();
      }
    });

    it('handles absolute paths by normalizing to relative', async () => {
      const absPath = path.join(PROJECT_ROOT, '.aios-core', 'development', 'tasks', 'create-next-story.md');
      const result = await resolveCodeIntel(absPath, PROJECT_ROOT);

      // Should resolve the same as relative path
      expect(result).not.toBeNull();
    });

    it('completes within 500ms', async () => {
      const start = Date.now();
      await resolveCodeIntel(
        '.aios-core/development/tasks/create-next-story.md',
        PROJECT_ROOT,
      );
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('formatAsXml', () => {
    it('returns null for null input', () => {
      expect(formatAsXml(null, 'test.js')).toBeNull();
    });

    it('returns null when all fields are empty', () => {
      const intel = { entity: null, references: null, dependencies: null };
      expect(formatAsXml(intel, 'test.js')).toBeNull();
    });

    it('generates valid XML with entity data', () => {
      const intel = {
        entity: {
          file: '.aios-core/core/some-module.js',
          context: 'A test module for unit tests',
        },
        references: null,
        dependencies: null,
      };

      const xml = formatAsXml(intel, 'some-module.js');
      expect(xml).not.toBeNull();
      expect(xml).toContain('<code-intel-context>');
      expect(xml).toContain('</code-intel-context>');
      expect(xml).toContain('<target-file>some-module.js</target-file>');
      expect(xml).toContain('<existing-entity>');
      expect(xml).toContain('<path>.aios-core/core/some-module.js</path>');
      expect(xml).toContain('<purpose>A test module for unit tests</purpose>');
    });

    it('includes references when present', () => {
      const intel = {
        entity: { file: 'a.js', context: 'Module A' },
        references: [
          { file: 'b.js', context: 'Uses A' },
          { file: 'c.js', context: 'Also uses A' },
        ],
        dependencies: null,
      };

      const xml = formatAsXml(intel, 'a.js');
      expect(xml).toContain('<referenced-by count="2">');
      expect(xml).toContain('<ref file="b.js"');
      expect(xml).toContain('<ref file="c.js"');
    });

    it('deduplicates references by file path', () => {
      const intel = {
        entity: { file: 'a.js', context: 'Module A' },
        references: [
          { file: 'b.js', context: 'ref 1' },
          { file: 'b.js', context: 'ref 2' },
          { file: 'c.js', context: 'ref 3' },
        ],
        dependencies: null,
      };

      const xml = formatAsXml(intel, 'a.js');
      expect(xml).toContain('<referenced-by count="2">');
    });

    it('includes dependencies when present', () => {
      const intel = {
        entity: { file: 'a.js', context: 'Module A' },
        references: null,
        dependencies: {
          nodes: [
            { name: 'a', path: 'a.js', layer: 'L4' },
            { name: 'dep1', path: 'dep1.js', layer: 'L2' },
            { name: 'dep2', path: 'dep2.js', layer: 'L1' },
          ],
          edges: [],
          unresolvedCount: 0,
        },
      };

      const xml = formatAsXml(intel, 'a.js');
      expect(xml).toContain('<dependencies count="2">');
      expect(xml).toContain('<dep name="dep1" layer="L2" />');
      expect(xml).toContain('<dep name="dep2" layer="L1" />');
    });

    it('caps references at 15 with overflow comment', () => {
      const refs = [];
      for (let i = 0; i < 20; i++) {
        refs.push({ file: `file-${i}.js`, context: `ref ${i}` });
      }

      const intel = { entity: { file: 'a.js', context: 'test' }, references: refs, dependencies: null };
      const xml = formatAsXml(intel, 'a.js');
      expect(xml).toContain('count="20"');
      expect(xml).toContain('...and 5 more');
    });
  });

  describe('escapeXml', () => {
    it('escapes ampersands', () => {
      expect(escapeXml('a & b')).toBe('a &amp; b');
    });

    it('escapes angle brackets', () => {
      expect(escapeXml('<tag>')).toBe('&lt;tag&gt;');
    });

    it('escapes quotes', () => {
      expect(escapeXml('"hello"')).toBe('&quot;hello&quot;');
    });

    it('handles null/undefined', () => {
      expect(escapeXml(null)).toBe('');
      expect(escapeXml(undefined)).toBe('');
    });
  });
});
