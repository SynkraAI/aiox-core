'use strict';

/**
 * Memory Hints — Agent Memory Integration for Micro-Handoff
 *
 * Extracts relevant knowledge hints from an agent's persistent MEMORY.md
 * file and includes them in the micro-handoff artifact during agent switches.
 *
 * Uses token overlap scoring: split story context into keywords, score each
 * MEMORY.md section by keyword overlap count, return top 3 section headers.
 *
 * READ-ONLY: This module NEVER writes to agent memory files.
 * Zero external dependencies (Node.js stdlib only).
 *
 * @module memory-hints
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-2.2
 */

const fs = require('fs');
const path = require('path');

/** Maximum number of hints to return */
const MAX_HINTS = 3;

/** Maximum characters to use from section content for scoring */
const MAX_CONTENT_CHARS = 100;

/** Maximum characters for each hint string */
const MAX_HINT_LENGTH = 80;

/**
 * Resolve the path to an agent's MEMORY.md file.
 * Agent memory files follow the pattern: .claude/agent-memory/{agentId}/MEMORY.md
 *
 * @param {string} agentId - Agent ID (e.g., 'aiox-dev', 'dev', 'sm')
 * @param {string} [projectRoot] - Project root directory
 * @returns {string} Absolute path to the agent's MEMORY.md
 */
function resolveMemoryPath(agentId, projectRoot) {
  const root = projectRoot || process.cwd();
  // Normalize agent ID: prefix with 'aiox-' if not already present
  const normalizedId = agentId.startsWith('aiox-') ? agentId : `aiox-${agentId}`;
  return path.join(root, '.claude', 'agent-memory', normalizedId, 'MEMORY.md');
}

/**
 * Parse a MEMORY.md file into sections split by ## headers.
 * Each section includes its header and content.
 *
 * @param {string} filePath - Absolute path to the MEMORY.md file
 * @returns {Array<{header: string, content: string}>} Array of sections
 */
function parseMemoryFile(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return [];
  }

  if (!raw || !raw.trim()) {
    return [];
  }

  const lines = raw.split('\n');
  const sections = [];
  let currentHeader = null;
  let currentContent = [];

  for (const line of lines) {
    // Match ## and ### headers (not # top-level)
    if (/^#{2,3}\s+/.test(line)) {
      // Save previous section
      if (currentHeader !== null) {
        sections.push({
          header: currentHeader,
          content: currentContent.join('\n'),
        });
      }
      currentHeader = line.replace(/^#{2,3}\s+/, '').trim();
      currentContent = [];
    } else if (currentHeader !== null) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentHeader !== null) {
    sections.push({
      header: currentHeader,
      content: currentContent.join('\n'),
    });
  }

  return sections;
}

/**
 * Extract keywords from a story context for scoring.
 * Splits story_id and current_task on non-alphanumeric characters,
 * lowercases, and deduplicates.
 *
 * @param {object} storyContext - Story context object
 * @param {string} [storyContext.story_id] - Story ID (e.g., 'AIOX-HO-2.2')
 * @param {string} [storyContext.current_task] - Current task description
 * @returns {string[]} Array of unique lowercase keywords
 */
function extractKeywords(storyContext) {
  if (!storyContext || typeof storyContext !== 'object') {
    return [];
  }

  const parts = [];
  if (storyContext.story_id) parts.push(storyContext.story_id);
  if (storyContext.current_task) parts.push(storyContext.current_task);

  const combined = parts.join(' ');
  if (!combined.trim()) return [];

  const tokens = combined
    .split(/[^a-zA-Z0-9]+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 0);

  // Deduplicate
  return [...new Set(tokens)];
}

/**
 * Score a memory section against a set of keywords using token overlap.
 * Counts how many keywords appear in the section's header + first N chars of content.
 *
 * @param {object} section - Memory section with header and content
 * @param {string} section.header - Section header text
 * @param {string} section.content - Section content text
 * @param {string[]} keywords - Array of lowercase keywords to match against
 * @returns {number} Overlap count (integer >= 0)
 */
function scoreMemorySection(section, keywords) {
  if (!section || !keywords || keywords.length === 0) {
    return 0;
  }

  const header = (section.header || '').toLowerCase();
  const contentSlice = (section.content || '').slice(0, MAX_CONTENT_CHARS).toLowerCase();
  const text = `${header} ${contentSlice}`;

  // Tokenize the section text
  const sectionTokens = new Set(
    text.split(/[^a-zA-Z0-9]+/).filter((t) => t.length > 0)
  );

  // Count overlaps
  let score = 0;
  for (const keyword of keywords) {
    if (sectionTokens.has(keyword)) {
      score++;
    }
  }

  return score;
}

/**
 * Extract memory hints from an agent's MEMORY.md file.
 *
 * Reads the agent's persistent memory, scores each section against
 * the story context using token overlap, and returns the top N
 * section headers as hint strings.
 *
 * @param {string} agentId - Agent ID (e.g., 'dev', 'sm', 'aiox-dev')
 * @param {object} storyContext - Story context for relevance scoring
 * @param {string} [storyContext.story_id] - Story ID
 * @param {string} [storyContext.current_task] - Current task description
 * @param {string} [projectRoot] - Project root directory
 * @returns {string[]} Array of up to MAX_HINTS hint strings
 */
function extractMemoryHints(agentId, storyContext, projectRoot) {
  if (!agentId) return [];

  const memoryPath = resolveMemoryPath(agentId, projectRoot);
  const sections = parseMemoryFile(memoryPath);

  if (sections.length === 0) return [];

  const keywords = extractKeywords(storyContext);
  if (keywords.length === 0) return [];

  // Score each section
  const scored = sections.map((section) => ({
    header: section.header,
    score: scoreMemorySection(section, keywords),
  }));

  // Filter sections with score > 0, sort descending
  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HINTS);

  // Return trimmed header strings as hints
  return relevant.map((s) => {
    const hint = s.header;
    return hint.length > MAX_HINT_LENGTH ? hint.slice(0, MAX_HINT_LENGTH) + '...' : hint;
  });
}

module.exports = {
  extractMemoryHints,
  scoreMemorySection,
  parseMemoryFile,
  extractKeywords,
  resolveMemoryPath,
  MAX_HINTS,
  MAX_CONTENT_CHARS,
  MAX_HINT_LENGTH,
};
