/**
 * Epic Context Accumulator
 *
 * Story 12.4: Progressive summarization with token control
 * Builds accumulated context for Story N validation against current state
 * within token limits.
 *
 * @module core/orchestration/epic-context-accumulator
 * @version 1.0.0
 */

'use strict';

// Constants
const TOKEN_LIMIT = 8000;
const HARD_CAP_PER_STORY = 600;
const CHARS_PER_TOKEN = 3.5;

/**
 * Compression levels for story context
 * @enum {string}
 */
const CompressionLevel = {
  FULL_DETAIL: 'full_detail',
  METADATA_PLUS_FILES: 'metadata_plus_files',
  METADATA_ONLY: 'metadata_only',
};

/**
 * Fields included per compression level
 */
const COMPRESSION_FIELDS = {
  [CompressionLevel.FULL_DETAIL]: [
    'id', 'title', 'executor', 'quality_gate', 'status',
    'acceptance_criteria', 'files_modified', 'dev_notes',
  ],
  [CompressionLevel.METADATA_PLUS_FILES]: [
    'id', 'title', 'executor', 'status', 'files_modified',
  ],
  [CompressionLevel.METADATA_ONLY]: [
    'id', 'executor', 'status',
  ],
};

/**
 * Estimates token count for a text string
 * @param {string} text - Text to estimate
 * @returns {number} Estimated token count
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Determines compression level based on story distance from current
 * @param {number} storyIndex - 0-based index of the story in the epic
 * @param {number} currentN - 0-based index of the current story (Story N)
 * @returns {string} CompressionLevel value
 */
function getCompressionLevel(storyIndex, currentN) {
  const distance = currentN - storyIndex;

  if (distance >= 1 && distance <= 3) {
    return CompressionLevel.FULL_DETAIL;
  }
  if (distance >= 4 && distance <= 6) {
    return CompressionLevel.METADATA_PLUS_FILES;
  }
  return CompressionLevel.METADATA_ONLY;
}

/**
 * Builds an inverted file index from completed stories
 * @param {Array<Object>} stories - Array of story objects with files_modified
 * @returns {Map<string, Set<string>>} Map of file_path → Set of story_ids
 */
function buildFileIndex(stories) {
  const index = new Map();

  for (const story of stories) {
    if (!story.files_modified || !Array.isArray(story.files_modified)) continue;

    for (const filePath of story.files_modified) {
      if (!index.has(filePath)) {
        index.set(filePath, new Set());
      }
      index.get(filePath).add(story.id);
    }
  }

  return index;
}

/**
 * Checks if there is file overlap between a story and a set of target files
 * @param {string[]} storyFiles - Files modified by the story
 * @param {Map<string, Set<string>>|string[]} targetFiles - Target files to check against
 * @returns {boolean} True if there is overlap
 */
function hasFileOverlap(storyFiles, targetFiles) {
  if (!storyFiles || !Array.isArray(storyFiles) || storyFiles.length === 0) return false;

  if (targetFiles instanceof Map || targetFiles instanceof Set) {
    return storyFiles.some(file => targetFiles.has(file));
  }

  if (Array.isArray(targetFiles)) {
    const targetSet = new Set(targetFiles);
    return storyFiles.some(file => targetSet.has(file));
  }

  return false;
}

/**
 * Truncates text to fit within a token limit
 * @param {string} text - Text to truncate
 * @param {number} maxTokens - Maximum tokens allowed
 * @returns {string} Truncated text
 */
function truncateToTokens(text, maxTokens) {
  if (!text || typeof text !== 'string') return '';
  const maxChars = Math.floor(maxTokens * CHARS_PER_TOKEN);
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '...';
}

/**
 * Formats a single story entry based on compression level
 * @param {Object} story - Story data
 * @param {string} level - CompressionLevel
 * @returns {string} Formatted story string
 */
function formatStoryEntry(story, level) {
  const fields = COMPRESSION_FIELDS[level];
  if (!fields) return '';

  const parts = [];
  for (const field of fields) {
    const value = story[field];
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      parts.push(`${field}: [${value.join(', ')}]`);
    } else {
      parts.push(`${field}: ${value}`);
    }
  }

  const entry = parts.join(' | ');

  // Apply hard cap per story
  const tokens = estimateTokens(entry);
  if (tokens > HARD_CAP_PER_STORY) {
    return truncateToTokens(entry, HARD_CAP_PER_STORY);
  }

  return entry;
}

/**
 * Epic Context Accumulator class
 * Builds progressive context summaries for story validation
 */
class EpicContextAccumulator {
  /**
   * @param {import('./session-state').SessionState} sessionState - SessionState instance
   */
  constructor(sessionState) {
    this.sessionState = sessionState;
    this.fileIndex = null;
  }

  /**
   * Builds accumulated context for a story within an epic
   * @param {string} epicId - Epic ID
   * @param {number} storyN - 0-based index of the current story
   * @param {Object} options - Additional options
   * @param {string[]} options.filesToModify - Files that Story N will modify (for overlap detection)
   * @param {string} options.executor - Executor of Story N (for executor match)
   * @returns {string} Optimized context string within token limits
   */
  buildAccumulatedContext(epicId, storyN, options = {}) {
    const { filesToModify = [], executor = null } = options;

    const state = this.sessionState.state;
    if (!state || !state.session_state) {
      return '';
    }

    const { progress, context_snapshot } = state.session_state;
    const storiesDone = progress.stories_done || [];

    // No completed stories — return empty context
    if (storiesDone.length === 0) {
      return '';
    }

    // Build file index for O(1) lookups
    const stories = this._getStoriesData(storiesDone);
    this.fileIndex = buildFileIndex(stories);

    // Create target files set for overlap detection
    const targetFilesSet = new Set(filesToModify);

    // Assign compression levels with exceptions
    const entries = [];
    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      let level = getCompressionLevel(i, storyN);

      // Apply exceptions (upgrade only, never downgrade, never to full_detail)
      level = this._applyExceptions(story, level, targetFilesSet, executor);

      entries.push({ story, level, index: i });
    }

    // Format entries
    let formattedEntries = entries.map(({ story, level }) => formatStoryEntry(story, level));

    // Apply token limit with compression cascade
    formattedEntries = this._applyCompressionCascade(entries, formattedEntries, storyN);

    // Build final context
    const header = `Epic ${epicId} Context (${storiesDone.length} stories completed):`;
    const executorDist = context_snapshot.executor_distribution || {};
    const executorSummary = Object.entries(executorDist)
      .map(([agent, count]) => `${agent}: ${count}`)
      .join(', ');

    const sections = [header];
    if (executorSummary) {
      sections.push(`Executors: ${executorSummary}`);
    }
    sections.push('---');
    sections.push(...formattedEntries.filter(e => e.length > 0));

    return sections.join('\n');
  }

  /**
   * Applies exception rules to compression level
   * @param {Object} story - Story data
   * @param {string} currentLevel - Current compression level
   * @param {Set<string>} targetFiles - Files Story N will modify
   * @param {string|null} currentExecutor - Executor of Story N
   * @returns {string} Adjusted compression level
   * @private
   */
  _applyExceptions(story, currentLevel, targetFiles, currentExecutor) {
    // Exceptions only upgrade, never downgrade
    // Exceptions never promote to full_detail
    if (currentLevel === CompressionLevel.FULL_DETAIL) {
      return currentLevel;
    }

    const targetLevel = CompressionLevel.METADATA_PLUS_FILES;

    // Exception: file overlap
    if (currentLevel === CompressionLevel.METADATA_ONLY) {
      if (story.files_modified && hasFileOverlap(story.files_modified, targetFiles)) {
        return targetLevel;
      }
    }

    // Exception: executor match
    if (currentLevel === CompressionLevel.METADATA_ONLY) {
      if (currentExecutor && story.executor === currentExecutor) {
        return targetLevel;
      }
    }

    return currentLevel;
  }

  /**
   * Applies compression cascade to fit within token limit
   * @param {Array<Object>} entries - Story entries with levels
   * @param {string[]} formattedEntries - Formatted entry strings
   * @param {number} storyN - Current story index
   * @returns {string[]} Adjusted entries within token limit
   * @private
   */
  _applyCompressionCascade(entries, formattedEntries, storyN) {
    const totalText = formattedEntries.join('\n');
    let totalTokens = estimateTokens(totalText);

    if (totalTokens <= TOKEN_LIMIT) {
      return formattedEntries;
    }

    // Working copy
    const result = [...formattedEntries];
    const workingEntries = entries.map((e, i) => ({ ...e, formatted: result[i] }));

    // Cascade 1: metadata_only on oldest stories (N-7+)
    for (let i = 0; i < workingEntries.length; i++) {
      const distance = storyN - workingEntries[i].index;
      if (distance >= 7 && workingEntries[i].level !== CompressionLevel.METADATA_ONLY) {
        workingEntries[i].level = CompressionLevel.METADATA_ONLY;
        result[i] = formatStoryEntry(workingEntries[i].story, CompressionLevel.METADATA_ONLY);
      }
    }

    totalTokens = estimateTokens(result.join('\n'));
    if (totalTokens <= TOKEN_LIMIT) return result;

    // Cascade 2: Remove files_modified from medium stories (N-6 to N-4)
    for (let i = 0; i < workingEntries.length; i++) {
      const distance = storyN - workingEntries[i].index;
      if (distance >= 4 && distance <= 6) {
        workingEntries[i].level = CompressionLevel.METADATA_ONLY;
        result[i] = formatStoryEntry(workingEntries[i].story, CompressionLevel.METADATA_ONLY);
      }
    }

    totalTokens = estimateTokens(result.join('\n'));
    if (totalTokens <= TOKEN_LIMIT) return result;

    // Cascade 3: Truncate dev_notes from recent stories (N-3 to N-1)
    for (let i = 0; i < workingEntries.length; i++) {
      const distance = storyN - workingEntries[i].index;
      if (distance >= 1 && distance <= 3) {
        const story = { ...workingEntries[i].story };
        story.dev_notes = truncateToTokens(story.dev_notes || '', 50);
        result[i] = formatStoryEntry(story, CompressionLevel.FULL_DETAIL);
      }
    }

    totalTokens = estimateTokens(result.join('\n'));
    if (totalTokens <= TOKEN_LIMIT) return result;

    // Cascade 4: Remove acceptance_criteria from recent stories
    for (let i = 0; i < workingEntries.length; i++) {
      const distance = storyN - workingEntries[i].index;
      if (distance >= 1 && distance <= 3) {
        const story = { ...workingEntries[i].story };
        delete story.acceptance_criteria;
        delete story.dev_notes;
        result[i] = formatStoryEntry(story, CompressionLevel.FULL_DETAIL);
      }
    }

    return result;
  }

  /**
   * Extracts story data from stories_done array
   * Stories in session-state may be stored as IDs or objects
   * @param {Array<string|Object>} storiesDone - Completed stories
   * @returns {Array<Object>} Story data objects
   * @private
   */
  _getStoriesData(storiesDone) {
    return storiesDone.map((story, index) => {
      if (typeof story === 'string') {
        return { id: story, index };
      }
      return { ...story, index };
    });
  }

  /**
   * Gets the current file index
   * @returns {Map<string, Set<string>>|null} File index or null if not built
   */
  getFileIndex() {
    return this.fileIndex;
  }
}

/**
 * Creates a new EpicContextAccumulator instance
 * @param {import('./session-state').SessionState} sessionState
 * @returns {EpicContextAccumulator}
 */
function createEpicContextAccumulator(sessionState) {
  return new EpicContextAccumulator(sessionState);
}

module.exports = {
  EpicContextAccumulator,
  createEpicContextAccumulator,
  CompressionLevel,
  COMPRESSION_FIELDS,
  estimateTokens,
  getCompressionLevel,
  buildFileIndex,
  hasFileOverlap,
  truncateToTokens,
  formatStoryEntry,
  TOKEN_LIMIT,
  HARD_CAP_PER_STORY,
  CHARS_PER_TOKEN,
};
