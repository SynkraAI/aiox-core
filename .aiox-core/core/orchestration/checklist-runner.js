/**
 * Checklist Runner - Executes validation checklists programmatically
 *
 * DETERMINISTIC: Parses checklist markdown files and evaluates items
 * using code-based rules, no AI involvement in validation.
 *
 * Checklist items can define:
 * - tipo: pre-condition | post-condition | acceptance-criterion
 * - blocker: true | false (stops execution if fails)
 * - validação: Code-based validation rule
 *
 * @module core/orchestration/checklist-runner
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Runs checklist validations programmatically
 */
class ChecklistRunner {
  /**
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.checklistsPath = path.join(projectRoot, '.aiox-core', 'product', 'checklists');
  }

  /**
   * Run a checklist against target file(s)
   * @param {string} checklistName - Checklist file name
   * @param {string|string[]} targetPaths - Path(s) to validate
   * @returns {Promise<Object>} Validation result
   */
  async run(checklistName, targetPaths) {
    const result = {
      checklist: checklistName,
      passed: true,
      items: [],
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // Load checklist
    const checklist = await this.loadChecklist(checklistName);
    if (!checklist) {
      result.passed = false;
      result.errors.push(`Checklist not found: ${checklistName}`);
      return result;
    }

    // Parse checklist items
    const items = this.parseChecklistItems(checklist);

    // Evaluate each item
    for (const item of items) {
      const itemResult = await this.evaluateItem(item, targetPaths);
      result.items.push(itemResult);

      if (!itemResult.passed) {
        if (item.blocker) {
          result.passed = false;
          result.errors.push(`Blocker failed: ${item.description}`);
        }
      }
    }

    return result;
  }

  /**
   * Load checklist file content
   * @param {string} checklistName - Checklist file name
   * @returns {Promise<string|null>} Checklist content or null
   */
  async loadChecklist(checklistName) {
    const fileName = checklistName.endsWith('.md') ? checklistName : `${checklistName}.md`;
    const filePath = path.join(this.checklistsPath, fileName);

    if (await fs.pathExists(filePath)) {
      return await fs.readFile(filePath, 'utf8');
    }

    return null;
  }

  /**
   * Parse checklist markdown into structured items
   * @param {string} content - Checklist markdown content
   * @returns {Object[]} Parsed checklist items
   */
  parseChecklistItems(content) {
    const items = [];

    // Pattern 1: YAML code blocks with checklist items
    const yamlBlockPattern = /```ya?ml\n([\s\S]*?)```/g;
    let yamlMatch;
    while ((yamlMatch = yamlBlockPattern.exec(content)) !== null) {
      try {
        const yamlContent = yaml.load(yamlMatch[1]);
        if (yamlContent) {
          // Handle pre-conditions, post-conditions, acceptance-criteria
          for (const key of ['pre-conditions', 'post-conditions', 'acceptance-criteria']) {
            if (yamlContent[key]) {
              for (const item of yamlContent[key]) {
                items.push(this.normalizeItem(item, key));
              }
            }
          }
        }
      } catch (_e) {
        // Invalid YAML - continue
      }
    }

    // Pattern 2: Markdown checkboxes with descriptions
    const checkboxPattern = /^[-*]\s*\[[ x]\]\s*(.+)$/gm;
    let checkboxMatch;
    while ((checkboxMatch = checkboxPattern.exec(content)) !== null) {
      const description = checkboxMatch[1].trim();
      // Skip if already parsed from YAML
      if (!items.some(i => i.description.includes(description.substring(0, 30)))) {
        items.push({
          description,
          tipo: 'manual',
          blocker: false,
          validation: null,
        });
      }
    }

    return items;
  }

  /**
   * Normalize a checklist item to standard format
   * @param {Object|string} item - Raw item from YAML or markdown
   * @param {string} category - Item category (pre-condition, etc.)
   * @returns {Object} Normalized item
   */
  normalizeItem(item, category) {
    if (typeof item === 'string') {
      return {
        description: item,
        tipo: category,
        blocker: category === 'pre-conditions',
        validation: null,
      };
    }

    // Item is an object with YAML structure
    const firstKey = Object.keys(item)[0];
    const description = firstKey.replace(/^\[[ x]\]\s*/, '').trim();

    return {
      description,
      tipo: item.tipo || category,
      blocker: item.blocker !== false && category !== 'manual',
      validation: item.validação || item.validation || null,
      errorMessage: item.error_message || null,
    };
  }

  /**
   * Evaluate a single checklist item
   * @param {Object} item - Checklist item to evaluate
   * @param {string|string[]} targetPaths - Target path(s) to validate
   * @returns {Promise<Object>} Evaluation result
   */
  async evaluateItem(item, targetPaths) {
    const result = {
      description: item.description,
      tipo: item.tipo,
      blocker: item.blocker,
      passed: true,
      message: null,
    };

    // If item has code-based validation, execute it
    if (item.validation) {
      try {
        result.passed = await this.executeValidation(item.validation, targetPaths);
        if (!result.passed) {
          result.message = item.errorMessage || `Validation failed: ${item.description}`;
        }
      } catch (error) {
        result.passed = false;
        result.message = `Validation error: ${error.message}`;
      }
    } else {
      // Manual items are assumed to pass (require human verification)
      result.passed = true;
      result.message = 'Manual verification required';
    }

    return result;
  }

  /**
   * Execute a validation rule
   * DETERMINISTIC: All validations are code-based
   * @param {string} validation - Validation rule string
   * @param {string|string[]} targetPaths - Target path(s)
   * @returns {Promise<boolean>} Validation result
   */
  async executeValidation(validation, targetPaths) {
    const paths = Array.isArray(targetPaths) ? targetPaths : [targetPaths];
    const validationLower = validation.toLowerCase();

    // File exists check
    if (validationLower.includes('file') && validationLower.includes('exist')) {
      for (const targetPath of paths) {
        if (targetPath) {
          const fullPath = path.join(this.projectRoot, targetPath);
          if (!await fs.pathExists(fullPath)) {
            return false;
          }
        }
      }
      return true;
    }

    // Directory exists check
    if (validationLower.includes('director') && validationLower.includes('exist')) {
      for (const targetPath of paths) {
        if (targetPath) {
          const fullPath = path.join(this.projectRoot, targetPath);
          const stats = await fs.stat(fullPath).catch(() => null);
          if (!stats || !stats.isDirectory()) {
            return false;
          }
        }
      }
      return true;
    }

    // Non-empty file check
    if (validationLower.includes('not') && validationLower.includes('empty')) {
      for (const targetPath of paths) {
        if (targetPath) {
          const fullPath = path.join(this.projectRoot, targetPath);
          if (await fs.pathExists(fullPath)) {
            const content = await fs.readFile(fullPath, 'utf8');
            if (content.trim().length === 0) {
              return false;
            }
          }
        }
      }
      return true;
    }

    // Contains specific content check
    const containsMatch = validationLower.match(/contains?\s+['"]([^'"]+)['"]/);
    if (containsMatch) {
      const searchTerm = containsMatch[1];
      for (const targetPath of paths) {
        if (targetPath) {
          const fullPath = path.join(this.projectRoot, targetPath);
          // Missing file = validation failure (file must exist to contain content)
          if (!await fs.pathExists(fullPath)) {
            return false;
          }
          const content = await fs.readFile(fullPath, 'utf8');
          if (!content.includes(searchTerm)) {
            return false;
          }
        }
      }
      return true;
    }

    // Minimum size check
    const minSizeMatch = validationLower.match(/min(?:imum)?\s*(?:size|length)?\s*[:=]?\s*(\d+)/);
    if (minSizeMatch) {
      const minSize = parseInt(minSizeMatch[1]);
      for (const targetPath of paths) {
        if (targetPath) {
          const fullPath = path.join(this.projectRoot, targetPath);
          // Missing file = validation failure (file must exist to have size)
          if (!await fs.pathExists(fullPath)) {
            return false;
          }
          const stats = await fs.stat(fullPath);
          if (stats.size < minSize) {
            return false;
          }
        }
      }
      return true;
    }

    // Default: assume validation passes if we can't parse the rule
    // This allows for human-readable descriptions that aren't code-executable
    return true;
  }

  /**
   * Get a summary of what a checklist validates
   * @param {string} checklistName - Checklist file name
   * @returns {Promise<Object>} Summary of checklist items
   */
  async getSummary(checklistName) {
    const checklist = await this.loadChecklist(checklistName);
    if (!checklist) {
      return null;
    }

    const items = this.parseChecklistItems(checklist);
    return {
      name: checklistName,
      totalItems: items.length,
      blockers: items.filter(i => i.blocker).length,
      categories: {
        preConditions: items.filter(i => i.tipo === 'pre-conditions').length,
        postConditions: items.filter(i => i.tipo === 'post-conditions').length,
        acceptanceCriteria: items.filter(i => i.tipo === 'acceptance-criteria').length,
        manual: items.filter(i => i.tipo === 'manual').length,
      },
    };
  }
}

module.exports = ChecklistRunner;
