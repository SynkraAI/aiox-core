/**
 * StoryTracker
 *
 * Auto-tracks progress from story markdown files (docs/stories/).
 * Extracts completion from checkboxes and updates session context.
 *
 * Story CLI-DX-1: Visual Context System integration
 *
 * @module session/story-tracker
 */

const fs = require('fs').promises;
const path = require('path');
const { SessionStateManager } = require('./state-manager');

class StoryTracker {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Track story progress from markdown file.
   * Extracts checkboxes and updates session state.
   *
   * @param {string} storyPath - Absolute path to story markdown file
   * @returns {Promise<Object|null>} Progress object {completed, total, percentage} or null
   */
  async trackStory(storyPath) {
    if (!storyPath || !(await this._fileExists(storyPath))) {
      return null;
    }

    const content = await fs.readFile(storyPath, 'utf8');
    const progress = this._extractProgress(content);
    const storyId = this._extractStoryId(content);

    if (!progress) return null;

    // Update session with story progress
    const stateManager = new SessionStateManager(this.projectRoot);
    await stateManager.update({
      status: {
        progress: `${progress.completed}/${progress.total}`,
      },
      metadata: {
        story: storyId,
        storyPath: storyPath,
      },
    });

    return {
      ...progress,
      percentage: Math.round((progress.completed / progress.total) * 100),
    };
  }

  /**
   * Extract progress from markdown checkboxes.
   * Counts completed [x] vs incomplete [ ] checkboxes.
   *
   * @private
   * @param {string} content - Markdown content
   * @returns {Object|null} {completed, total} or null if no checkboxes
   */
  _extractProgress(content) {
    // Match checkboxes: - [x] or - [ ]
    const checkboxRegex = /- \[([ x])\]/gi;
    const matches = [...content.matchAll(checkboxRegex)];

    if (matches.length === 0) return null;

    const completed = matches.filter(m => m[1].toLowerCase() === 'x').length;
    const total = matches.length;

    return { completed, total };
  }

  /**
   * Extract story ID from markdown content.
   * Looks for "Story ID: XXX" or "Story XXX" patterns.
   *
   * @private
   * @param {string} content - Markdown content
   * @returns {string|null} Story ID or null
   */
  _extractStoryId(content) {
    // Match "Story ID: CLI-DX-1" or "Story: CLI-DX-1" or "# Story CLI-DX-1"
    const patterns = [
      /Story ID:?\s*([A-Z0-9-]+)/i,
      /# Story\s+([A-Z0-9-]+)/i,
      /story[-_]([A-Z0-9-]+)/i,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Check if file exists.
   *
   * @private
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   */
  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Find active story file in docs/stories/.
   * Looks for most recently modified story markdown.
   *
   * @returns {Promise<string|null>} Path to story file or null
   */
  async findActiveStory() {
    const storiesDir = path.join(this.projectRoot, 'docs', 'stories');

    if (!(await this._fileExists(storiesDir))) {
      return null;
    }

    try {
      const files = await this._findMarkdownFiles(storiesDir);
      if (files.length === 0) return null;

      // Find most recently modified
      const stats = await Promise.all(
        files.map(async f => ({ path: f, mtime: (await fs.stat(f)).mtime })),
      );

      stats.sort((a, b) => b.mtime - a.mtime);
      return stats[0].path;
    } catch {
      return null;
    }
  }

  /**
   * Recursively find markdown files in directory.
   *
   * @private
   * @param {string} dir - Directory to search
   * @returns {Promise<string[]>} Array of markdown file paths
   */
  async _findMarkdownFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await this._findMarkdownFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

module.exports = { StoryTracker };
