/**
 * Backlog Manager for AIOX Framework
 *
 * Manages technical debt, follow-ups, and enhancements backlog with
 * prioritization, filtering, and markdown generation capabilities.
 *
 * @module backlog-manager
 * @version 1.0.0
 * @created 2025-01-16 (Story 6.1.2.6)
 */

const fs = require('fs').promises;
const _path = require('path');

/**
 * Backlog item types
 */
const ITEM_TYPES = {
  F: 'Follow-up',
  T: 'Technical Debt',
  E: 'Enhancement',
};

/**
 * Type emoji mapping
 */
const TYPE_EMOJI = {
  F: '📌',
  T: '🔧',
  E: '✨',
};

/**
 * Priority levels
 */
const PRIORITIES = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Priority emoji mapping
 */
const PRIORITY_EMOJI = {
  Critical: '🔴',
  High: '🟠',
  Medium: '🟡',
  Low: '🟢',
};

/**
 * Backlog item class
 */
class BacklogItem {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.type = data.type; // F, T, or E
    this.title = data.title;
    this.description = data.description || '';
    this.priority = data.priority || 'Medium';
    this.relatedStory = data.relatedStory || null;
    this.createdBy = data.createdBy || 'Unknown';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.tags = data.tags || [];
    this.estimatedEffort = data.estimatedEffort || 'TBD';
    this.status = data.status || 'Open';
  }

  /**
   * Converts item to markdown row
   */
  toMarkdownRow() {
    const typeEmoji = TYPE_EMOJI[this.type] || '❓';
    const priorityEmoji = PRIORITY_EMOJI[this.priority] || '';
    const typeName = ITEM_TYPES[this.type] || this.type;

    const relatedStoryLink = this.relatedStory
      ? `[${this.relatedStory}](../stories/${this.relatedStory}.md)`
      : 'N/A';

    const tagsFormatted = this.tags.length > 0
      ? this.tags.map(tag => `\`${tag}\``).join(', ')
      : 'None';

    return `| ${this.id} | ${typeEmoji} ${typeName} | ${this.title} | ${priorityEmoji} ${this.priority} | ${relatedStoryLink} | ${this.estimatedEffort} | ${tagsFormatted} | ${this.createdBy} |`;
  }

  /**
   * Converts item to JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      priority: this.priority,
      relatedStory: this.relatedStory,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      tags: this.tags,
      estimatedEffort: this.estimatedEffort,
      status: this.status,
    };
  }
}

/**
 * Backlog manager class
 */
class BacklogManager {
  constructor(backlogPath = 'docs/stories/backlog.md') {
    this.backlogPath = backlogPath;
    this.backlogDataPath = backlogPath.replace('.md', '.json');
    this.items = [];
  }

  /**
   * Loads backlog from JSON file
   */
  async load() {
    try {
      const data = await fs.readFile(this.backlogDataPath, 'utf8');
      const itemsData = JSON.parse(data);

      this.items = itemsData.map(item => new BacklogItem(item));
      console.log(`✅ Loaded ${this.items.length} backlog items`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📝 No existing backlog found, starting fresh');
        this.items = [];
      } else {
        throw error;
      }
    }
  }

  /**
   * Saves backlog to JSON file
   */
  async save() {
    const data = JSON.stringify(this.items.map(item => item.toJSON()), null, 2);
    await fs.writeFile(this.backlogDataPath, data, 'utf8');
    console.log(`✅ Saved ${this.items.length} backlog items`);
  }

  /**
   * Adds new backlog item
   */
  async addItem(itemData) {
    const item = new BacklogItem(itemData);
    this.items.push(item);
    await this.save();
    console.log(`✅ Added backlog item: ${item.id} - ${item.title}`);
    return item;
  }

  /**
   * Removes backlog item by ID
   */
  async removeItem(itemId) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error(`Backlog item not found: ${itemId}`);
    }

    const removed = this.items.splice(index, 1)[0];
    await this.save();
    console.log(`✅ Removed backlog item: ${itemId}`);
    return removed;
  }

  /**
   * Updates backlog item
   */
  async updateItem(itemId, updates) {
    const item = this.items.find(item => item.id === itemId);
    if (!item) {
      throw new Error(`Backlog item not found: ${itemId}`);
    }

    Object.assign(item, updates);
    await this.save();
    console.log(`✅ Updated backlog item: ${itemId}`);
    return item;
  }

  /**
   * Filters items by criteria
   */
  filterItems(filters = {}) {
    let filtered = [...this.items];

    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    if (filters.priority) {
      filtered = filtered.filter(item => item.priority === filters.priority);
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.tag) {
      filtered = filtered.filter(item => item.tags.includes(filters.tag));
    }

    if (filters.relatedStory) {
      filtered = filtered.filter(item => item.relatedStory === filters.relatedStory);
    }

    return filtered;
  }

  /**
   * Sorts items by priority (descending)
   */
  sortByPriority(items) {
    return items.sort((a, b) => {
      const aPriority = PRIORITIES[a.priority] || 0;
      const bPriority = PRIORITIES[b.priority] || 0;
      return bPriority - aPriority;
    });
  }

  /**
   * Groups items by type
   */
  groupByType(items) {
    const grouped = {
      F: [],
      T: [],
      E: [],
    };

    items.forEach(item => {
      if (grouped[item.type]) {
        grouped[item.type].push(item);
      }
    });

    return grouped;
  }

  /**
   * Generates markdown backlog document
   */
  generateMarkdown() {
    const groupedByType = this.groupByType(this.items);

    let markdown = `# Backlog

**Generated:** ${new Date().toISOString()}
**Total Items:** ${this.items.length}

---

## 📊 Summary by Type

`;

    // Type summary
    Object.entries(ITEM_TYPES).forEach(([code, name]) => {
      const count = groupedByType[code].length;
      const emoji = TYPE_EMOJI[code];
      markdown += `- ${emoji} **${name}**: ${count}\n`;
    });

    markdown += '\n---\n\n';

    // Items by type
    Object.entries(ITEM_TYPES).forEach(([code, name]) => {
      const items = this.sortByPriority(groupedByType[code]);
      if (items.length === 0) return;

      const emoji = TYPE_EMOJI[code];
      markdown += `## ${emoji} ${name} (${items.length} items)\n\n`;
      markdown += '| ID | Type | Title | Priority | Related Story | Effort | Tags | Created By |\n';
      markdown += '|----|------|-------|----------|---------------|--------|------|------------|\n';

      items.forEach(item => {
        markdown += item.toMarkdownRow() + '\n';
      });

      markdown += '\n';
    });

    markdown += '---\n\n';
    markdown += '## 🔍 Legend\n\n';
    markdown += '### Types\n';
    Object.entries(ITEM_TYPES).forEach(([code, name]) => {
      const emoji = TYPE_EMOJI[code];
      markdown += `- ${emoji} **${name}** (${code})\n`;
    });
    markdown += '\n### Priority\n';
    Object.entries(PRIORITY_EMOJI).forEach(([priority, emoji]) => {
      markdown += `- ${emoji} **${priority}**\n`;
    });

    markdown += '\n---\n\n';
    markdown += '*Auto-generated by AIOX Backlog Manager (Story 6.1.2.6)*\n';
    markdown += '*Update: Run `npm run stories:backlog` or `node .aiox-core/scripts/backlog-manager.js generate docs/stories/backlog.md`*\n';

    return markdown;
  }

  /**
   * Generates and writes backlog markdown file
   */
  async generateBacklogFile() {
    const markdown = this.generateMarkdown();
    await fs.writeFile(this.backlogPath, markdown, 'utf8');
    console.log(`✅ Backlog file generated: ${this.backlogPath}`);
  }

  /**
   * Gets statistics about backlog
   */
  getStatistics() {
    const stats = {
      total: this.items.length,
      byType: {},
      byPriority: {},
      byStatus: {},
    };

    this.items.forEach(item => {
      // By type
      const typeName = ITEM_TYPES[item.type] || item.type;
      stats.byType[typeName] = (stats.byType[typeName] || 0) + 1;

      // By priority
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;

      // By status
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    });

    return stats;
  }
}

// CLI execution support
if (require.main === module) {
  const command = process.argv[2];
  const backlogPath = process.argv[3] || 'docs/stories/backlog.md';

  const manager = new BacklogManager(backlogPath);

  (async () => {
    try {
      await manager.load();

      switch (command) {
        case 'generate':
          await manager.generateBacklogFile();
          break;

        case 'add': {
          const itemData = JSON.parse(process.argv[4] || '{}');
          await manager.addItem(itemData);
          await manager.generateBacklogFile();
          break;
        }

        case 'remove': {
          const itemId = process.argv[4];
          await manager.removeItem(itemId);
          await manager.generateBacklogFile();
          break;
        }

        case 'stats': {
          const stats = manager.getStatistics();
          console.log('\n📊 Backlog Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;
        }

        default:
          console.log(`
Usage:
  node backlog-manager.js generate [path]       - Generate backlog.md
  node backlog-manager.js add [path] [json]     - Add backlog item
  node backlog-manager.js remove [path] [id]    - Remove backlog item
  node backlog-manager.js stats [path]          - Show statistics
          `);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = {
  BacklogManager,
  BacklogItem,
  ITEM_TYPES,
  TYPE_EMOJI,
  PRIORITIES,
  PRIORITY_EMOJI,
};
