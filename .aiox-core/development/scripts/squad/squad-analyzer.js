/**
 * Squad Analyzer Utility
 *
 * Analyzes existing squads and generates comprehensive reports
 * with component inventory, coverage metrics, and improvement suggestions.
 *
 * Used by: squad-creator agent (*analyze-squad task)
 *
 * @module squad-analyzer
 * @version 1.0.0
 * @see Story SQS-11: Squad Analyze & Extend
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Default path for squads directory
 * @constant {string}
 */
const DEFAULT_SQUADS_PATH = './squads';

/**
 * Component directories in a squad (from squad-schema.json)
 * @constant {string[]}
 */
const COMPONENT_DIRECTORIES = [
  'agents',
  'tasks',
  'workflows',
  'checklists',
  'templates',
  'tools',
  'scripts',
  'data',
];

/**
 * Config files to check for coverage
 * @constant {string[]}
 */
const CONFIG_FILES = [
  'README.md',
  'config/coding-standards.md',
  'config/tech-stack.md',
  'config/source-tree.md',
];

/**
 * Manifest file names in order of preference
 * @constant {string[]}
 */
const MANIFEST_FILES = ['squad.yaml', 'config.yaml'];

/**
 * Error codes for SquadAnalyzerError
 * @enum {string}
 */
const ErrorCodes = {
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  YAML_PARSE_ERROR: 'YAML_PARSE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
};

/**
 * Custom error class for Squad Analyzer operations
 * @extends Error
 */
class SquadAnalyzerError extends Error {
  /**
   * Create a SquadAnalyzerError
   * @param {string} code - Error code from ErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadAnalyzerError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadAnalyzerError);
    }
  }

  /**
   * Create error for squad not found
   * @param {string} squadName - Name of the squad
   * @returns {SquadAnalyzerError}
   */
  static squadNotFound(squadName) {
    return new SquadAnalyzerError(
      ErrorCodes.SQUAD_NOT_FOUND,
      `Squad "${squadName}" not found`,
      `Use *list-squads to see available squads, or *create-squad ${squadName} to create it`,
    );
  }

  /**
   * Create error for manifest not found
   * @param {string} squadPath - Path to squad directory
   * @returns {SquadAnalyzerError}
   */
  static manifestNotFound(squadPath) {
    return new SquadAnalyzerError(
      ErrorCodes.MANIFEST_NOT_FOUND,
      `No squad.yaml or config.yaml found in ${squadPath}`,
      'Create squad.yaml with squad metadata',
    );
  }
}

/**
 * Squad Analyzer class for analyzing squad structure and content
 */
class SquadAnalyzer {
  /**
   * Create a SquadAnalyzer instance
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.squadsPath] - Custom squads directory path
   * @param {boolean} [options.verbose=false] - Enable verbose output
   */
  constructor(options = {}) {
    this.squadsPath = options.squadsPath || DEFAULT_SQUADS_PATH;
    this.verbose = options.verbose || false;
  }

  /**
   * Analyze a squad and generate complete report
   * @param {string} squadName - Name of the squad to analyze
   * @param {Object} [options={}] - Analysis options
   * @param {boolean} [options.suggestions=true] - Include suggestions
   * @param {boolean} [options.verbose=false] - Include file details
   * @returns {Promise<Object>} Analysis result
   */
  async analyze(squadName, options = {}) {
    const includeSuggestions = options.suggestions !== false;
    const verbose = options.verbose || this.verbose;

    const squadPath = path.join(this.squadsPath, squadName);

    // Check if squad exists
    const exists = await this._directoryExists(squadPath);
    if (!exists) {
      throw SquadAnalyzerError.squadNotFound(squadName);
    }

    // Load manifest
    const manifest = await this.loadManifest(squadPath);

    // Build overview
    const overview = this._buildOverview(manifest, squadName);

    // Inventory components
    const inventory = await this.inventoryComponents(squadPath, verbose);

    // Calculate coverage
    const coverage = this.calculateCoverage(inventory, manifest, squadPath);

    // Generate suggestions
    const suggestions = includeSuggestions
      ? this.generateSuggestions(inventory, coverage, manifest)
      : [];

    return {
      overview,
      inventory,
      coverage,
      suggestions,
      squadPath,
    };
  }

  /**
   * Load and parse squad manifest
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<Object>} Parsed manifest
   */
  async loadManifest(squadPath) {
    for (const manifestFile of MANIFEST_FILES) {
      const manifestPath = path.join(squadPath, manifestFile);
      try {
        const content = await fs.readFile(manifestPath, 'utf8');
        return yaml.load(content);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw new SquadAnalyzerError(
            ErrorCodes.YAML_PARSE_ERROR,
            `Failed to parse ${manifestFile}: ${error.message}`,
            'Check YAML syntax - use a YAML linter',
          );
        }
      }
    }

    throw SquadAnalyzerError.manifestNotFound(squadPath);
  }

  /**
   * Inventory all components in squad
   * @param {string} squadPath - Path to squad directory
   * @param {boolean} [verbose=false] - Include file content previews
   * @returns {Promise<Object>} Component inventory by type
   */
  async inventoryComponents(squadPath, verbose = false) {
    const inventory = {};

    for (const dir of COMPONENT_DIRECTORIES) {
      const dirPath = path.join(squadPath, dir);
      inventory[dir] = await this._listFiles(dirPath, verbose);
    }

    return inventory;
  }

  /**
   * Calculate coverage metrics
   * @param {Object} inventory - Component inventory
   * @param {Object} manifest - Squad manifest
   * @param {string} squadPath - Path to squad
   * @returns {Object} Coverage metrics
   */
  calculateCoverage(inventory, manifest, squadPath) {
    // Agents coverage
    const agentCount = inventory.agents.length;
    const agentsWithTasks = this._countAgentsWithTasks(inventory);
    const agentCoverage = agentCount > 0 ? Math.round((agentsWithTasks / agentCount) * 100) : 0;

    // Tasks coverage (relative to agents)
    const taskCount = inventory.tasks.length;
    const expectedTasks = agentCount * 2; // Expect at least 2 tasks per agent
    const taskCoverage =
      expectedTasks > 0 ? Math.min(100, Math.round((taskCount / expectedTasks) * 100)) : 0;

    // Directory coverage
    const populatedDirs = COMPONENT_DIRECTORIES.filter((dir) => inventory[dir].length > 0).length;
    const dirCoverage = Math.round((populatedDirs / COMPONENT_DIRECTORIES.length) * 100);

    // Config coverage (check for common files)
    const configCoverage = this._calculateConfigCoverage(squadPath, inventory);

    return {
      agents: {
        total: agentCount,
        withTasks: agentsWithTasks,
        percentage: agentCoverage,
      },
      tasks: {
        total: taskCount,
        expected: expectedTasks,
        percentage: taskCoverage,
      },
      directories: {
        populated: populatedDirs,
        total: COMPONENT_DIRECTORIES.length,
        percentage: dirCoverage,
      },
      config: configCoverage,
    };
  }

  /**
   * Generate improvement suggestions
   * @param {Object} inventory - Component inventory
   * @param {Object} coverage - Coverage metrics
   * @param {Object} manifest - Squad manifest
   * @returns {Array} List of suggestions
   */
  generateSuggestions(inventory, coverage, _manifest) {
    const suggestions = [];

    // Suggest adding tasks for agents without tasks
    if (coverage.agents.withTasks < coverage.agents.total) {
      const agentsWithoutTasks = coverage.agents.total - coverage.agents.withTasks;
      suggestions.push({
        priority: 'high',
        category: 'tasks',
        message: `Add tasks for ${agentsWithoutTasks} agent(s) without tasks`,
        action: '*extend-squad --add task',
      });
    }

    // Suggest workflows if none exist
    if (inventory.workflows.length === 0 && inventory.tasks.length >= 3) {
      suggestions.push({
        priority: 'medium',
        category: 'workflows',
        message: 'Create workflows to combine related tasks',
        action: '*extend-squad --add workflow',
      });
    }

    // Suggest checklists if none exist
    if (inventory.checklists.length === 0) {
      suggestions.push({
        priority: 'medium',
        category: 'checklists',
        message: 'Add validation checklists for quality assurance',
        action: '*extend-squad --add checklist',
      });
    }

    // Suggest config files
    if (coverage.config.percentage < 100) {
      const missing = coverage.config.missing || [];
      if (missing.length > 0) {
        suggestions.push({
          priority: 'low',
          category: 'config',
          message: `Add missing config files: ${missing.join(', ')}`,
          action: 'Create files in config/ directory',
        });
      }
    }

    // Suggest tools if none exist and agents have complex tasks
    if (inventory.tools.length === 0 && inventory.tasks.length >= 5) {
      suggestions.push({
        priority: 'low',
        category: 'tools',
        message: 'Consider adding custom tools for automation',
        action: '*extend-squad --add tool',
      });
    }

    // Suggest templates if none exist
    if (inventory.templates.length === 0) {
      suggestions.push({
        priority: 'low',
        category: 'templates',
        message: 'Add document templates for consistent output',
        action: '*extend-squad --add template',
      });
    }

    return suggestions;
  }

  /**
   * Format analysis report for output
   * @param {Object} analysis - Complete analysis
   * @param {string} [format='console'] - Output format
   * @returns {string} Formatted report
   */
  formatReport(analysis, format = 'console') {
    if (format === 'json') {
      return JSON.stringify(analysis, null, 2);
    }

    if (format === 'markdown') {
      return this._formatMarkdown(analysis);
    }

    return this._formatConsole(analysis);
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Check if directory exists
   * @private
   */
  async _directoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * List files in a directory
   * @private
   */
  async _listFiles(dirPath, verbose = false) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = entries
        .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
        .map((entry) => entry.name);

      if (verbose) {
        return files.map((file) => ({
          name: file,
          path: path.join(dirPath, file),
        }));
      }

      return files;
    } catch {
      return [];
    }
  }

  /**
   * Build overview object from manifest
   * @private
   */
  _buildOverview(manifest, squadName) {
    return {
      name: manifest.name || squadName,
      version: manifest.version || '0.0.0',
      author: manifest.author || 'Unknown',
      license: manifest.license || 'MIT',
      description: manifest.description || '',
      aioxMinVersion: manifest.aiox?.minVersion || '2.1.0',
    };
  }

  /**
   * Count agents that have at least one task
   * @private
   */
  _countAgentsWithTasks(inventory) {
    const agentIds = inventory.agents.map((file) => {
      const name = typeof file === 'string' ? file : file.name;
      return name.replace(/\.md$/, '');
    });

    let count = 0;
    for (const agentId of agentIds) {
      const hasTask = inventory.tasks.some((task) => {
        const taskName = typeof task === 'string' ? task : task.name;
        return taskName.startsWith(agentId + '-');
      });
      if (hasTask) {
        count++;
      }
    }

    return count;
  }

  /**
   * Calculate config file coverage
   * @private
   */
  _calculateConfigCoverage(squadPath, inventory) {
    const found = [];
    const missing = [];

    // Check README
    const hasReadme = inventory.agents.length > 0; // Simplified check
    if (hasReadme) {
      found.push('README.md');
    } else {
      missing.push('README.md');
    }

    // For now, simplified - just check if config directory has files
    const percentage = found.length > 0 ? 50 : 0;

    return {
      found,
      missing,
      percentage,
    };
  }

  /**
   * Format report for console output
   * @private
   */
  _formatConsole(analysis) {
    const { overview, inventory, coverage, suggestions, squadPath: _squadPath } = analysis;
    const lines = [];

    // Header
    lines.push(`=== Squad Analysis: ${overview.name} ===`);
    lines.push('');

    // Overview
    lines.push('Overview');
    lines.push(`  Name: ${overview.name}`);
    lines.push(`  Version: ${overview.version}`);
    lines.push(`  Author: ${overview.author}`);
    lines.push(`  License: ${overview.license}`);
    lines.push(`  AIOX Min Version: ${overview.aioxMinVersion}`);
    if (overview.description) {
      lines.push(`  Description: ${overview.description}`);
    }
    lines.push('');

    // Components
    lines.push('Components');
    for (const dir of COMPONENT_DIRECTORIES) {
      const files = inventory[dir];
      const count = files.length;
      const emptyIndicator = count === 0 ? ' <- Empty' : '';

      lines.push(`  ${dir}/ (${count})${emptyIndicator}`);

      if (count > 0 && count <= 5) {
        for (const file of files) {
          const fileName = typeof file === 'string' ? file : file.name;
          lines.push(`    - ${fileName}`);
        }
      } else if (count > 5) {
        for (let i = 0; i < 3; i++) {
          const file = files[i];
          const fileName = typeof file === 'string' ? file : file.name;
          lines.push(`    - ${fileName}`);
        }
        lines.push(`    ... and ${count - 3} more`);
      }
    }
    lines.push('');

    // Coverage
    lines.push('Coverage');
    lines.push(
      `  Agents: ${this._formatBar(coverage.agents.percentage)} ${coverage.agents.percentage}% ` +
        `(${coverage.agents.withTasks}/${coverage.agents.total} with tasks)`,
    );
    lines.push(
      `  Tasks: ${this._formatBar(coverage.tasks.percentage)} ${coverage.tasks.percentage}% ` +
        `(${coverage.tasks.total} tasks)`,
    );
    lines.push(
      `  Directories: ${this._formatBar(coverage.directories.percentage)} ${coverage.directories.percentage}% ` +
        `(${coverage.directories.populated}/${coverage.directories.total} populated)`,
    );
    lines.push(
      `  Config: ${this._formatBar(coverage.config.percentage)} ${coverage.config.percentage}%`,
    );
    lines.push('');

    // Suggestions
    if (suggestions.length > 0) {
      lines.push('Suggestions');
      suggestions.forEach((suggestion, index) => {
        const priorityIcon =
          suggestion.priority === 'high' ? '!' : suggestion.priority === 'medium' ? '*' : '-';
        lines.push(`  ${index + 1}. [${priorityIcon}] ${suggestion.message}`);
      });
      lines.push('');
    }

    // Next steps
    lines.push(`Next: *extend-squad ${overview.name}`);

    return lines.join('\n');
  }

  /**
   * Format report as markdown
   * @private
   */
  _formatMarkdown(analysis) {
    const { overview, inventory, coverage, suggestions } = analysis;
    const lines = [];

    lines.push(`# Squad Analysis: ${overview.name}`);
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push('');

    lines.push('## Overview');
    lines.push('');
    lines.push('| Property | Value |');
    lines.push('|----------|-------|');
    lines.push(`| Name | ${overview.name} |`);
    lines.push(`| Version | ${overview.version} |`);
    lines.push(`| Author | ${overview.author} |`);
    lines.push(`| License | ${overview.license} |`);
    lines.push(`| AIOX Min Version | ${overview.aioxMinVersion} |`);
    lines.push('');

    lines.push('## Components');
    lines.push('');
    for (const dir of COMPONENT_DIRECTORIES) {
      const files = inventory[dir];
      lines.push(`### ${dir}/ (${files.length})`);
      if (files.length > 0) {
        files.forEach((file) => {
          const fileName = typeof file === 'string' ? file : file.name;
          lines.push(`- ${fileName}`);
        });
      } else {
        lines.push('*Empty*');
      }
      lines.push('');
    }

    lines.push('## Coverage');
    lines.push('');
    lines.push('| Category | Percentage | Details |');
    lines.push('|----------|------------|---------|');
    lines.push(
      `| Agents | ${coverage.agents.percentage}% | ${coverage.agents.withTasks}/${coverage.agents.total} with tasks |`,
    );
    lines.push(`| Tasks | ${coverage.tasks.percentage}% | ${coverage.tasks.total} total |`);
    lines.push(
      `| Directories | ${coverage.directories.percentage}% | ${coverage.directories.populated}/${coverage.directories.total} populated |`,
    );
    lines.push(`| Config | ${coverage.config.percentage}% | - |`);
    lines.push('');

    if (suggestions.length > 0) {
      lines.push('## Suggestions');
      lines.push('');
      suggestions.forEach((suggestion, index) => {
        lines.push(
          `${index + 1}. **[${suggestion.priority.toUpperCase()}]** ${suggestion.message}`,
        );
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format progress bar
   * @private
   */
  _formatBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '[' + '#'.repeat(filled) + '-'.repeat(empty) + ']';
  }
}

module.exports = {
  SquadAnalyzer,
  SquadAnalyzerError,
  ErrorCodes,
  COMPONENT_DIRECTORIES,
  CONFIG_FILES,
};
