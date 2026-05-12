/**
 * @fileoverview Parser for Markdown files with AIOX-MANAGED sections
 * @module merger/parsers/markdown-section-parser
 */

// Regex patterns for AIOX markers
const AIOX_START_MARKER = /^<!--\s*AIOX-MANAGED-START:\s*([a-zA-Z0-9_-]+)\s*-->$/;
const AIOX_END_MARKER = /^<!--\s*AIOX-MANAGED-END:\s*([a-zA-Z0-9_-]+)\s*-->$/;
const HEADER_PATTERN = /^(#{1,6})\s+(.+)$/;

/**
 * Parsed section from markdown
 * @typedef {Object} ParsedSection
 * @property {string} id - Section identifier (slug or marker id)
 * @property {string} [title] - Section title (from header)
 * @property {number} [level] - Header level (1-6)
 * @property {number} startLine - Start line number (0-indexed)
 * @property {number} [endLine] - End line number (0-indexed)
 * @property {boolean} managed - True if AIOX-MANAGED section
 * @property {string[]} lines - Lines in this section (excluding markers)
 */

/**
 * Result of parsing a markdown file
 * @typedef {Object} ParsedMarkdownFile
 * @property {ParsedSection[]} sections - All sections found
 * @property {boolean} hasAioxMarkers - True if file has AIOX-MANAGED markers
 * @property {string[]} preamble - Lines before first section
 * @property {string[]} rawLines - Original lines
 */

/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse a markdown file, identifying sections and AIOX-MANAGED areas
 * @param {string} content - Markdown content
 * @returns {ParsedMarkdownFile} Parsed result
 */
function parseMarkdownSections(content) {
  if (!content || content.trim() === '') {
    return {
      sections: [],
      hasAioxMarkers: false,
      preamble: [],
      rawLines: [],
    };
  }

  const lines = content.split('\n');
  const result = {
    sections: [],
    hasAioxMarkers: false,
    preamble: [],
    rawLines: lines,
  };

  let currentSection = null;
  let aioxSection = null;
  let inPreamble = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for AIOX start marker
    const startMatch = trimmed.match(AIOX_START_MARKER);
    if (startMatch) {
      // Close any current non-managed section
      if (currentSection && !currentSection.managed) {
        currentSection.endLine = i - 1;
        result.sections.push(currentSection);
        currentSection = null;
      }

      // Start new AIOX-managed section
      aioxSection = {
        id: startMatch[1],
        startLine: i,
        managed: true,
        lines: [],
      };
      result.hasAioxMarkers = true;
      inPreamble = false;
      continue;
    }

    // Check for AIOX end marker
    const endMatch = trimmed.match(AIOX_END_MARKER);
    if (endMatch && aioxSection) {
      if (endMatch[1] === aioxSection.id) {
        aioxSection.endLine = i;
        result.sections.push(aioxSection);
        aioxSection = null;
      }
      continue;
    }

    // If we're in an AIOX section, collect lines
    if (aioxSection) {
      aioxSection.lines.push(line);
      continue;
    }

    // Check for regular header
    const headerMatch = line.match(HEADER_PATTERN);
    if (headerMatch) {
      // Close any current section
      if (currentSection) {
        currentSection.endLine = i - 1;
        result.sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        id: slugify(headerMatch[2]),
        title: headerMatch[2],
        level: headerMatch[1].length,
        startLine: i,
        managed: false,
        lines: [line],
      };
      inPreamble = false;
      continue;
    }

    // Regular content line
    if (inPreamble) {
      result.preamble.push(line);
    } else if (currentSection) {
      currentSection.lines.push(line);
    } else if (!aioxSection) {
      // Content after an AIOX section but before next section
      // This shouldn't happen in well-formed files, but handle it
      result.preamble.push(line);
    }
  }

  // Close final section if open
  if (currentSection) {
    currentSection.endLine = lines.length - 1;
    result.sections.push(currentSection);
  }

  // Handle unclosed AIOX section (malformed)
  if (aioxSection) {
    aioxSection.endLine = lines.length - 1;
    aioxSection.lines.push('<!-- WARNING: Unclosed AIOX-MANAGED section -->');
    result.sections.push(aioxSection);
  }

  return result;
}

/**
 * Check if content has AIOX-MANAGED markers
 * @param {string} content - Markdown content
 * @returns {boolean} True if markers found
 */
function hasAioxMarkers(content) {
  if (!content) return false;
  // Check for both START and END markers
  const hasStart = /<!--\s*AIOX-MANAGED-START:\s*[a-zA-Z0-9_-]+\s*-->/.test(content);
  const hasEnd = /<!--\s*AIOX-MANAGED-END:\s*[a-zA-Z0-9_-]+\s*-->/.test(content);
  return hasStart && hasEnd;
}

/**
 * Get all AIOX section IDs from content
 * @param {string} content - Markdown content
 * @returns {string[]} Array of section IDs
 */
function getAioxSectionIds(content) {
  const ids = [];
  const matches = content.matchAll(/<!--\s*AIOX-MANAGED-START:\s*([a-zA-Z0-9_-]+)\s*-->/g);
  for (const match of matches) {
    ids.push(match[1]);
  }
  return ids;
}

module.exports = {
  slugify,
  parseMarkdownSections,
  hasAioxMarkers,
  getAioxSectionIds,
};
