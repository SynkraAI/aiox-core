/**
 * Tests for template-overrides.js consumer helper
 * Story BM-4 — Boundary Schema Enrichment & Template Customization
 *
 * Covers: AC4 (template customization via config), AC7 (no regression)
 */

const {
  getTemplateOverrides,
  isSectionOptional,
  KNOWN_STORY_SECTIONS,
} = require('../../.aios-core/core/config/template-overrides');

describe('template-overrides — consumer helper', () => {
  describe('getTemplateOverrides', () => {
    test('returns defaults when config has no template_overrides', () => {
      const result = getTemplateOverrides({});
      expect(result).toEqual({
        story: {
          sections_order: null,
          optional_sections: [],
        },
      });
    });

    test('returns defaults when template_overrides is empty', () => {
      const result = getTemplateOverrides({ template_overrides: {} });
      expect(result).toEqual({
        story: {
          sections_order: null,
          optional_sections: [],
        },
      });
    });

    test('returns sections_order from config', () => {
      const config = {
        template_overrides: {
          story: {
            sections_order: ['story', 'acceptance-criteria', 'tasks-subtasks'],
          },
        },
      };
      const result = getTemplateOverrides(config);
      expect(result.story.sections_order).toEqual([
        'story',
        'acceptance-criteria',
        'tasks-subtasks',
      ]);
    });

    test('returns optional_sections from config', () => {
      const config = {
        template_overrides: {
          story: {
            optional_sections: ['community-origin', 'coderabbit-integration'],
          },
        },
      };
      const result = getTemplateOverrides(config);
      expect(result.story.optional_sections).toEqual([
        'community-origin',
        'coderabbit-integration',
      ]);
    });

    test('null sections_order is preserved (means use template default)', () => {
      const config = {
        template_overrides: {
          story: {
            sections_order: null,
            optional_sections: [],
          },
        },
      };
      const result = getTemplateOverrides(config);
      expect(result.story.sections_order).toBeNull();
    });

    test('throws on unknown section ID in optional_sections', () => {
      const config = {
        template_overrides: {
          story: {
            optional_sections: ['nonexistent-section'],
          },
        },
      };
      expect(() => getTemplateOverrides(config)).toThrow(
        /Unknown story section ID.*nonexistent-section/
      );
    });

    test('throws on unknown section ID in sections_order', () => {
      const config = {
        template_overrides: {
          story: {
            sections_order: ['story', 'invalid-id'],
          },
        },
      };
      expect(() => getTemplateOverrides(config)).toThrow(
        /Unknown story section ID.*invalid-id/
      );
    });

    test('handles undefined config gracefully', () => {
      const result = getTemplateOverrides(undefined);
      expect(result.story.sections_order).toBeNull();
      expect(result.story.optional_sections).toEqual([]);
    });
  });

  describe('isSectionOptional', () => {
    test('returns true for optional section', () => {
      const config = {
        template_overrides: {
          story: { optional_sections: ['community-origin'] },
        },
      };
      expect(isSectionOptional(config, 'community-origin')).toBe(true);
    });

    test('returns false for non-optional section', () => {
      const config = {
        template_overrides: {
          story: { optional_sections: ['community-origin'] },
        },
      };
      expect(isSectionOptional(config, 'story')).toBe(false);
    });

    test('returns false when no config provided', () => {
      expect(isSectionOptional({}, 'story')).toBe(false);
    });
  });

  describe('deep merge simulation (L1 defaults + L2 overrides)', () => {
    test('L2 optional_sections overrides L1 empty array', () => {
      // Simulating what config-resolver deepMerge produces
      const l1 = { template_overrides: { story: { sections_order: null, optional_sections: [] } } };
      const l2 = { template_overrides: { story: { optional_sections: ['community-origin'] } } };

      // Arrays use replace strategy in deepMerge (last-wins)
      const merged = {
        template_overrides: {
          story: {
            sections_order: l2.template_overrides?.story?.sections_order ?? l1.template_overrides.story.sections_order,
            optional_sections: l2.template_overrides.story.optional_sections,
          },
        },
      };

      const result = getTemplateOverrides(merged);
      expect(result.story.sections_order).toBeNull();
      expect(result.story.optional_sections).toEqual(['community-origin']);
    });
  });

  describe('KNOWN_STORY_SECTIONS', () => {
    test('exports known section IDs', () => {
      expect(KNOWN_STORY_SECTIONS).toContain('community-origin');
      expect(KNOWN_STORY_SECTIONS).toContain('story');
      expect(KNOWN_STORY_SECTIONS).toContain('acceptance-criteria');
      expect(KNOWN_STORY_SECTIONS).toContain('tasks-subtasks');
      expect(KNOWN_STORY_SECTIONS).toContain('dev-notes');
      expect(KNOWN_STORY_SECTIONS).toContain('qa-results');
      expect(KNOWN_STORY_SECTIONS.length).toBe(11);
    });
  });
});
