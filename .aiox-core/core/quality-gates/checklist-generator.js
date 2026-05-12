/**
 * Checklist Generator
 *
 * Generates strategic review checklists based on:
 * - Story type and complexity
 * - Changed files
 * - Previous layer results
 *
 * @module core/quality-gates/checklist-generator
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

/**
 * Strategic review checklist generator
 */
class ChecklistGenerator {
  /**
   * Create a checklist generator
   * @param {Object} config - Generator configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.template = config.template || 'strategic-review-checklist';
    this.minItems = config.minItems || 5;
  }

  /**
   * Generate a review checklist
   * @param {Object} context - Generation context
   * @param {string} context.storyId - Story identifier
   * @param {Array} context.changedFiles - List of changed files
   * @param {Array} context.layers - Previous layer results
   * @returns {Promise<Object>} Generated checklist
   */
  async generate(context = {}) {
    const { storyId, changedFiles = [], layers = [] } = context;

    const items = [];

    // Add base review items
    items.push(...this.getBaseItems());

    // Add items based on changed files
    items.push(...this.getFileBasedItems(changedFiles));

    // Add items based on previous layer results
    items.push(...this.getLayerBasedItems(layers));

    // Add story-specific items
    if (storyId) {
      items.push(...this.getStoryBasedItems(storyId));
    }

    // Ensure minimum items
    while (items.length < this.minItems) {
      items.push({
        id: `additional-${items.length}`,
        text: 'General code quality and standards compliance',
        category: 'general',
        priority: 'low',
        checked: false,
      });
    }

    return {
      template: this.template,
      storyId,
      generatedAt: new Date().toISOString(),
      items: items.map((item, index) => ({
        ...item,
        order: index + 1,
      })),
    };
  }

  /**
   * Get base checklist items
   * @returns {Array} Base items
   */
  getBaseItems() {
    return [
      {
        id: 'architecture-alignment',
        text: 'Changes align with documented architecture decisions',
        category: 'architecture',
        priority: 'high',
        checked: false,
      },
      {
        id: 'security-review',
        text: 'No security vulnerabilities introduced (OWASP Top 10)',
        category: 'security',
        priority: 'critical',
        checked: false,
      },
      {
        id: 'performance-impact',
        text: 'Performance impact assessed and acceptable',
        category: 'performance',
        priority: 'medium',
        checked: false,
      },
      {
        id: 'documentation-updated',
        text: 'Relevant documentation updated or created',
        category: 'documentation',
        priority: 'medium',
        checked: false,
      },
      {
        id: 'backward-compatibility',
        text: 'Backward compatibility maintained (or breaking changes documented)',
        category: 'compatibility',
        priority: 'high',
        checked: false,
      },
    ];
  }

  /**
   * Get items based on changed files
   * @param {Array} changedFiles - List of changed files
   * @returns {Array} File-based items
   */
  getFileBasedItems(changedFiles = []) {
    const items = [];
    const fileCategories = this.categorizeFiles(changedFiles);

    if (fileCategories.tests.length > 0) {
      items.push({
        id: 'test-coverage',
        text: `Test changes reviewed for coverage (${fileCategories.tests.length} test files)`,
        category: 'testing',
        priority: 'high',
        checked: false,
      });
    }

    if (fileCategories.configs.length > 0) {
      items.push({
        id: 'config-changes',
        text: `Configuration changes validated (${fileCategories.configs.length} config files)`,
        category: 'configuration',
        priority: 'high',
        checked: false,
      });
    }

    if (fileCategories.agents.length > 0) {
      items.push({
        id: 'agent-changes',
        text: `Agent definition changes reviewed (${fileCategories.agents.length} agent files)`,
        category: 'agents',
        priority: 'high',
        checked: false,
      });
    }

    if (fileCategories.api.length > 0) {
      items.push({
        id: 'api-changes',
        text: `API changes reviewed for breaking changes (${fileCategories.api.length} API files)`,
        category: 'api',
        priority: 'critical',
        checked: false,
      });
    }

    if (fileCategories.database.length > 0) {
      items.push({
        id: 'database-changes',
        text: `Database migrations reviewed (${fileCategories.database.length} migration files)`,
        category: 'database',
        priority: 'critical',
        checked: false,
      });
    }

    return items;
  }

  /**
   * Categorize files by type
   * @param {Array} files - List of file paths
   * @returns {Object} Categorized files
   */
  categorizeFiles(files = []) {
    return {
      tests: files.filter((f) => f.includes('test') || f.includes('spec')),
      configs: files.filter((f) =>
        f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.json') ||
        f.includes('config') || f.includes('.env'),
      ),
      agents: files.filter((f) =>
        f.includes('agents/') || f.includes('agent'),
      ),
      api: files.filter((f) =>
        f.includes('/api/') || f.includes('routes') || f.includes('endpoints'),
      ),
      database: files.filter((f) =>
        f.includes('migration') || f.includes('schema') || f.includes('database'),
      ),
      docs: files.filter((f) =>
        f.endsWith('.md') || f.includes('/docs/'),
      ),
      source: files.filter((f) =>
        f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx'),
      ),
    };
  }

  /**
   * Get items based on previous layer results
   * @param {Array} layers - Previous layer results
   * @returns {Array} Layer-based items
   */
  getLayerBasedItems(layers = []) {
    const items = [];

    layers.forEach((layer) => {
      if (layer.checks?.warnings > 0) {
        items.push({
          id: `${layer.layer}-warnings`,
          text: `Review ${layer.checks.warnings} warnings from ${layer.layer}`,
          category: 'quality',
          priority: 'medium',
          checked: false,
        });
      }

      // Check for specific issues
      layer.results?.forEach((result) => {
        if (result.check === 'coderabbit' && result.issues?.high > 0) {
          items.push({
            id: 'coderabbit-high-issues',
            text: `Address ${result.issues.high} HIGH severity issues from CodeRabbit`,
            category: 'quality',
            priority: 'high',
            checked: false,
          });
        }
      });
    });

    return items;
  }

  /**
   * Get items based on story type
   * @param {string} storyId - Story identifier
   * @returns {Array} Story-based items
   */
  getStoryBasedItems(storyId) {
    const items = [];

    // Add story completion check
    items.push({
      id: 'story-completion',
      text: `All acceptance criteria for ${storyId} verified`,
      category: 'story',
      priority: 'critical',
      checked: false,
    });

    // Infer story type from ID pattern
    if (storyId.includes('2.')) {
      // Sprint 2 - Architecture/Infrastructure
      items.push({
        id: 'architecture-compliance',
        text: 'Implementation follows modular architecture guidelines',
        category: 'architecture',
        priority: 'high',
        checked: false,
      });
    }

    return items;
  }

  /**
   * Format checklist for display
   * @param {Object} checklist - Generated checklist
   * @returns {string} Formatted checklist
   */
  format(checklist) {
    const lines = [
      '# Strategic Review Checklist',
      `Story: ${checklist.storyId || 'N/A'}`,
      `Generated: ${checklist.generatedAt}`,
      '',
      '## Review Items',
      '',
    ];

    const byCategory = {};
    checklist.items.forEach((item) => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    });

    Object.entries(byCategory).forEach(([category, items]) => {
      lines.push(`### ${this.formatCategory(category)}`);
      items.forEach((item) => {
        const checkbox = item.checked ? '[x]' : '[ ]';
        const priority = item.priority === 'critical' ? '🔴' :
          item.priority === 'high' ? '🟠' :
            item.priority === 'medium' ? '🟡' : '🟢';
        lines.push(`- ${checkbox} ${priority} ${item.text}`);
      });
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Format category name for display
   * @param {string} category - Category name
   * @returns {string} Formatted category
   */
  formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

module.exports = { ChecklistGenerator };
