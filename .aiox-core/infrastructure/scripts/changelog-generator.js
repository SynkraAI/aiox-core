/**
 * Changelog Generator
 * Story 11.2 - Enhanced Capabilities
 *
 * Auto-generates changelogs from completed stories and git commits.
 * Follows Keep a Changelog format (https://keepachangelog.com)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ChangelogGenerator {
  constructor(config = {}) {
    // Root path
    this.rootPath = config.rootPath || process.cwd();

    // Category mapping (conventional commits → changelog)
    this.categories = {
      feat: 'Added',
      feature: 'Added',
      add: 'Added',
      fix: 'Fixed',
      bugfix: 'Fixed',
      perf: 'Performance',
      performance: 'Performance',
      refactor: 'Changed',
      change: 'Changed',
      update: 'Changed',
      docs: 'Documentation',
      doc: 'Documentation',
      breaking: 'Breaking Changes',
      deprecated: 'Deprecated',
      deprecate: 'Deprecated',
      removed: 'Removed',
      remove: 'Removed',
      security: 'Security',
      chore: null, // Don't include chores
      test: null, // Don't include tests
      ci: null, // Don't include CI
    };

    // Changelog order
    this.categoryOrder = [
      'Breaking Changes',
      'Added',
      'Changed',
      'Deprecated',
      'Removed',
      'Fixed',
      'Security',
      'Performance',
      'Documentation',
    ];

    // Story patterns
    this.storyPatterns = [
      /\[Story\s+(\d+\.?\d*)\]/i,
      /\(Story\s+(\d+\.?\d*)\)/i,
      /Story[\s-](\d+\.?\d*)/i,
      /#(\d+)/,
    ];

    // Output paths
    this.changelogPath = config.changelogPath || path.join(this.rootPath, 'docs', 'CHANGELOG.md');
    this.jsonPath = config.jsonPath || path.join(this.rootPath, '.aiox', 'changelog.json');
  }

  /**
   * Generate changelog
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Generated changelog
   */
  async generate(options = {}) {
    const since = options.since || (await this.getLastReleaseTag());
    const until = options.until || 'HEAD';
    const version = options.version || 'Unreleased';

    // Get commits
    const commits = await this.getCommits(since, until);

    // Get completed stories (if available)
    const stories = await this.getCompletedStories(since);

    // Categorize
    const categorized = this.categorize(commits, stories);

    // Format
    const changelog = this.format(categorized, version);

    // Save if requested
    if (options.save) {
      await this.save(changelog, categorized, version);
    }

    return {
      version,
      since,
      until,
      commitCount: commits.length,
      storyCount: stories.length,
      changelog,
      categorized,
    };
  }

  /**
   * Get the last release tag
   * @returns {Promise<string>} - Last tag or first commit
   */
  async getLastReleaseTag() {
    try {
      const tag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
        cwd: this.rootPath,
        encoding: 'utf8',
      }).trim();
      return tag;
    } catch {
      // No tags, get first commit
      try {
        return execSync('git rev-list --max-parents=0 HEAD', {
          cwd: this.rootPath,
          encoding: 'utf8',
        }).trim();
      } catch {
        return 'HEAD~100'; // Fallback to last 100 commits
      }
    }
  }

  /**
   * Get commits between two refs
   * @param {string} since - Start ref
   * @param {string} until - End ref
   * @returns {Promise<Array>} - Commits
   */
  async getCommits(since, until) {
    try {
      // Use unique separator to avoid conflicts with message content
      const separator = '|||CHANGELOG_SEP|||';
      const format = `%H${separator}%s${separator}%an${separator}%aI`;
      const log = execSync(`git log ${since}..${until} --format="${format}" --no-merges`, {
        cwd: this.rootPath,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      });

      const commits = [];
      const entries = log.split('\n').filter((l) => l.trim());

      for (const entry of entries) {
        const parts = entry.split(separator);
        if (parts.length < 4) continue; // Skip malformed entries

        const [hash, subject, author, date] = parts;

        commits.push({
          hash: hash?.substring(0, 8),
          message: subject,
          body: '', // Body removed to avoid parsing issues
          author,
          date,
        });
      }

      return commits;
    } catch (error) {
      console.warn('Failed to get commits:', error.message);
      return [];
    }
  }

  /**
   * Get completed stories since a date
   * @param {string} since - Since ref/date
   * @returns {Promise<Array>} - Completed stories
   */
  async getCompletedStories(since) {
    const stories = [];
    const storiesDir = path.join(this.rootPath, 'docs', 'stories');

    if (!fs.existsSync(storiesDir)) {
      return stories;
    }

    // Get since date
    let sinceDate = new Date(0);
    try {
      const dateStr = execSync(`git log -1 --format=%aI ${since}`, {
        cwd: this.rootPath,
        encoding: 'utf8',
      }).trim();
      sinceDate = new Date(dateStr);
    } catch {
      // Ignore
    }

    // Walk stories directories
    const walkDir = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.name.endsWith('.md') || entry.name.endsWith('.yaml')) {
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              const stat = fs.statSync(fullPath);

              // Check if modified after since date
              if (stat.mtime > sinceDate) {
                // Check if completed
                if (
                  content.includes('Status: Done') ||
                  content.includes('Status: Complete') ||
                  content.includes('status: done')
                ) {
                  const story = this.parseStory(content, entry.name);
                  if (story) {
                    stories.push(story);
                  }
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      } catch {
        // Ignore directory errors
      }
    };

    walkDir(storiesDir);

    return stories;
  }

  /**
   * Parse a story file
   * @param {string} content - Story content
   * @param {string} filename - Filename
   * @returns {Object|null} - Parsed story
   */
  parseStory(content, filename) {
    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/title:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.(md|yaml)$/, '');

    // Extract ID
    const idMatch = filename.match(/story[_-]?(\d+\.?\d*)/i) || content.match(/id:\s*(\d+\.?\d*)/i);
    const id = idMatch ? idMatch[1] : null;

    // Extract type
    let type = 'feature';
    if (content.includes('bug') || content.includes('fix')) {
      type = 'fix';
    } else if (content.includes('refactor')) {
      type = 'refactor';
    } else if (content.includes('docs') || content.includes('documentation')) {
      type = 'docs';
    }

    // Extract user story if present
    const userStoryMatch = content.match(
      /\*\*As a\*\*\s+(.+),\s*\*\*I want\*\*\s+(.+),\s*\*\*so that\*\*\s+(.+)/i
    );

    return {
      id,
      title: title.replace(/^Story:?\s*/i, ''),
      type,
      userStory: userStoryMatch
        ? {
            role: userStoryMatch[1],
            action: userStoryMatch[2],
            benefit: userStoryMatch[3],
          }
        : null,
    };
  }

  /**
   * Categorize commits and stories
   * @param {Array} commits - Commits
   * @param {Array} stories - Stories
   * @returns {Object} - Categorized entries
   */
  categorize(commits, stories) {
    const result = {};

    // Initialize categories
    for (const category of this.categoryOrder) {
      result[category] = [];
    }

    // Process commits
    for (const commit of commits) {
      // Skip invalid commits
      if (!commit || !commit.message) continue;

      const type = this.extractCommitType(commit.message);
      const category = this.categories[type];

      if (!category) continue; // Skip chores, tests, etc.

      // Check for breaking changes
      const isBreaking =
        commit.message.includes('BREAKING') ||
        commit.message.includes('!:') ||
        commit.body?.includes('BREAKING');

      if (isBreaking) {
        result['Breaking Changes'].push(this.formatCommit(commit));
      } else {
        if (!result[category]) {
          result[category] = [];
        }
        result[category].push(this.formatCommit(commit));
      }
    }

    // Process stories (for richer descriptions)
    for (const story of stories) {
      const category = this.storyToCategory(story);

      if (!result[category]) {
        result[category] = [];
      }

      // Only add if not already present from commits
      const formatted = this.formatStory(story);
      if (!result[category].some((e) => e.includes(story.title))) {
        result[category].push(formatted);
      }
    }

    return result;
  }

  /**
   * Extract commit type from message
   * @param {string} message - Commit message
   * @returns {string} - Commit type
   */
  extractCommitType(message) {
    // Guard against undefined/null message
    if (!message) {
      return 'change';
    }

    // Conventional commit format: type(scope): description
    const match = message.match(/^(\w+)(?:\([^)]+\))?!?:\s*/);
    if (match) {
      return match[1].toLowerCase();
    }

    // Fallback: look for keywords
    const lower = message.toLowerCase();
    if (lower.startsWith('fix') || lower.includes('bug')) return 'fix';
    if (lower.startsWith('add') || lower.startsWith('feat')) return 'feat';
    if (lower.startsWith('remove') || lower.startsWith('delete')) return 'removed';
    if (lower.startsWith('deprecate')) return 'deprecated';
    if (lower.startsWith('doc')) return 'docs';

    return 'change'; // Default to Changed
  }

  /**
   * Map story type to changelog category
   * @param {Object} story - Story
   * @returns {string} - Category
   */
  storyToCategory(story) {
    const typeMapping = {
      feature: 'Added',
      feat: 'Added',
      fix: 'Fixed',
      bugfix: 'Fixed',
      refactor: 'Changed',
      docs: 'Documentation',
      breaking: 'Breaking Changes',
    };

    return typeMapping[story.type] || 'Added';
  }

  /**
   * Format a commit for changelog
   * @param {Object} commit - Commit
   * @returns {string} - Formatted entry
   */
  formatCommit(commit) {
    // Guard against undefined message
    if (!commit.message) {
      return commit.hash || 'Unknown commit';
    }

    // Remove type prefix
    let message = commit.message.replace(/^(\w+)(?:\([^)]+\))?!?:\s*/, '').trim();

    // Capitalize first letter
    message = message.charAt(0).toUpperCase() + message.slice(1);

    // Extract story reference
    const storyRef = this.extractStoryRef(commit.message);
    if (storyRef) {
      message += ` [${storyRef}]`;
    }

    return message;
  }

  /**
   * Format a story for changelog
   * @param {Object} story - Story
   * @returns {string} - Formatted entry
   */
  formatStory(story) {
    let entry = story.title;

    if (story.id) {
      entry += ` [Story ${story.id}]`;
    }

    return entry;
  }

  /**
   * Extract story reference from commit message
   * @param {string} message - Commit message
   * @returns {string|null} - Story reference
   */
  extractStoryRef(message) {
    for (const pattern of this.storyPatterns) {
      const match = message.match(pattern);
      if (match) {
        return `Story ${match[1]}`;
      }
    }
    return null;
  }

  /**
   * Format categorized entries as changelog markdown
   * @param {Object} categorized - Categorized entries
   * @param {string} version - Version string
   * @returns {string} - Formatted changelog
   */
  format(categorized, version) {
    const date = new Date().toISOString().split('T')[0];
    let output = `## [${version}] - ${date}\n\n`;

    for (const category of this.categoryOrder) {
      const items = categorized[category];
      if (!items || items.length === 0) continue;

      output += `### ${category}\n\n`;
      for (const item of items) {
        output += `- ${item}\n`;
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Save changelog to files
   * @param {string} changelog - Formatted changelog
   * @param {Object} categorized - Categorized entries
   * @param {string} version - Version
   */
  async save(changelog, categorized, version) {
    // Ensure directories exist
    const changelogDir = path.dirname(this.changelogPath);
    const jsonDir = path.dirname(this.jsonPath);

    if (!fs.existsSync(changelogDir)) {
      fs.mkdirSync(changelogDir, { recursive: true });
    }
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }

    // Append to existing changelog or create new
    if (fs.existsSync(this.changelogPath)) {
      const existing = fs.readFileSync(this.changelogPath, 'utf8');

      // Insert after header
      const headerEnd = existing.indexOf('\n## ');
      if (headerEnd > 0) {
        const header = existing.substring(0, headerEnd + 1);
        const rest = existing.substring(headerEnd + 1);
        fs.writeFileSync(this.changelogPath, header + changelog + rest);
      } else {
        // Append at end
        fs.writeFileSync(this.changelogPath, existing + '\n' + changelog);
      }
    } else {
      // Create new changelog
      const header = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;
      fs.writeFileSync(this.changelogPath, header + changelog);
    }

    // Save JSON
    const jsonData = {
      generatedAt: new Date().toISOString(),
      version,
      categories: categorized,
    };
    fs.writeFileSync(this.jsonPath, JSON.stringify(jsonData, null, 2));
  }

  /**
   * Preview changelog without saving
   * @param {Object} options - Options
   * @returns {Promise<string>} - Preview
   */
  async preview(options = {}) {
    const result = await this.generate({ ...options, save: false });
    return result.changelog;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const generator = new ChangelogGenerator();

  const options = {
    save: args.includes('--save'),
    version: args.find((a) => a.startsWith('--version='))?.split('=')[1],
    since: args.find((a) => a.startsWith('--since='))?.split('=')[1],
  };

  generator
    .generate(options)
    .then((result) => {
      console.log(result.changelog);
      console.log(`\n---\nCommits: ${result.commitCount}, Stories: ${result.storyCount}`);
    })
    .catch((error) => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

module.exports = ChangelogGenerator;
module.exports.ChangelogGenerator = ChangelogGenerator;
