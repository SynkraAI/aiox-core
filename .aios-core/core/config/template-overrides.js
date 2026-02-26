'use strict';

/**
 * Template Overrides — Consumer Helper
 *
 * Reads template_overrides from an already-resolved config (output of resolveConfig()).
 * Does NOT call resolveConfig() itself — the caller passes in the merged config.
 *
 * @module template-overrides
 * @see ADR-PRO-002 — Configuration Hierarchy
 */

/** Known story template section IDs (from story-tmpl.yaml) */
const KNOWN_STORY_SECTIONS = [
  'community-origin',
  'status',
  'executor-assignment',
  'story',
  'acceptance-criteria',
  'coderabbit-integration',
  'tasks-subtasks',
  'dev-notes',
  'change-log',
  'dev-agent-record',
  'qa-results',
];

/**
 * Extract and normalize template overrides from resolved config.
 *
 * @param {object} resolvedConfig - Merged config from resolveConfig()
 * @returns {{ story: { sections_order: string[]|null, optional_sections: string[] } }}
 */
function getTemplateOverrides(resolvedConfig) {
  const overrides = resolvedConfig?.template_overrides ?? {};
  const story = overrides.story ?? {};

  const sectionsOrder = Array.isArray(story.sections_order)
    ? story.sections_order
    : null;

  const optionalSections = Array.isArray(story.optional_sections)
    ? story.optional_sections
    : [];

  // Validate section IDs
  const allSections = [
    ...(sectionsOrder ?? []),
    ...optionalSections,
  ];

  const unknown = allSections.filter((id) => !KNOWN_STORY_SECTIONS.includes(id));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown story section ID(s) in template_overrides: ${unknown.join(', ')}. ` +
      `Valid IDs: ${KNOWN_STORY_SECTIONS.join(', ')}`
    );
  }

  return {
    story: {
      sections_order: sectionsOrder,
      optional_sections: optionalSections,
    },
  };
}

/**
 * Check whether a section is optional in the current config.
 *
 * @param {object} resolvedConfig - Merged config from resolveConfig()
 * @param {string} sectionId - Story template section ID
 * @returns {boolean}
 */
function isSectionOptional(resolvedConfig, sectionId) {
  const { story } = getTemplateOverrides(resolvedConfig);
  return story.optional_sections.includes(sectionId);
}

module.exports = {
  KNOWN_STORY_SECTIONS,
  getTemplateOverrides,
  isSectionOptional,
};
