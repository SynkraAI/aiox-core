/**
 * AIOX Skill Validator
 * Story GEMINI-INT.5 - Skills Cross-CLI Compatibility
 *
 * Validates that AIOX agent skills work correctly in both
 * Claude Code and Gemini CLI environments.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Skill Validator - Ensures cross-CLI compatibility
 */
class SkillValidator {
  constructor(config = {}) {
    this.agentsDir = config.agentsDir || path.join(process.cwd(), '.aiox-core', 'development', 'agents');
    this.tasksDir = config.tasksDir || path.join(process.cwd(), '.aiox-core', 'development', 'tasks');
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate all agent skills
   * @returns {Object} Validation result
   */
  async validateAll() {
    this.errors = [];
    this.warnings = [];

    const results = {
      agents: [],
      tasks: [],
      compatible: true,
      errors: [],
      warnings: [],
    };

    // Validate agents
    const agentFiles = this.getMarkdownFiles(this.agentsDir);
    for (const file of agentFiles) {
      const result = await this.validateAgentSkill(file);
      results.agents.push(result);
      if (!result.valid) results.compatible = false;
    }

    // Validate tasks
    const taskFiles = this.getMarkdownFiles(this.tasksDir);
    for (const file of taskFiles) {
      const result = await this.validateTask(file);
      results.tasks.push(result);
      if (!result.valid) results.compatible = false;
    }

    results.errors = this.errors;
    results.warnings = this.warnings;

    return results;
  }

  /**
   * Validate a single agent skill file
   * @param {string} filePath - Path to agent file
   * @returns {Object} Validation result
   */
  async validateAgentSkill(filePath) {
    const result = {
      file: path.basename(filePath),
      path: filePath,
      valid: true,
      claudeCompatible: true,
      geminiCompatible: true,
      errors: [],
      warnings: [],
    };

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract YAML frontmatter
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
      if (!yamlMatch) {
        result.errors.push('No YAML block found');
        result.valid = false;
        this.errors.push(`${result.file}: No YAML block found`);
        return result;
      }

      const agentDef = yaml.load(yamlMatch[1]);

      // Required fields for both CLIs
      const requiredFields = ['agent.name', 'agent.id', 'agent.title'];
      for (const field of requiredFields) {
        if (!this.getNestedValue(agentDef, field)) {
          result.errors.push(`Missing required field: ${field}`);
          result.valid = false;
        }
      }

      // Check commands format (both CLIs support * prefix)
      if (agentDef.commands) {
        if (!Array.isArray(agentDef.commands)) {
          result.errors.push('Commands must be an array');
          result.valid = false;
        }
      }

      // Check dependencies format
      if (agentDef.dependencies) {
        this.validateDependencies(agentDef.dependencies, result);
      }

      // Check persona (optional but recommended)
      if (!agentDef.persona) {
        result.warnings.push('No persona defined - recommended for consistent behavior');
        this.warnings.push(`${result.file}: No persona defined`);
      }

      // Claude-specific checks
      this.validateClaudeCompatibility(agentDef, result);

      // Gemini-specific checks
      this.validateGeminiCompatibility(agentDef, result);

      if (result.errors.length > 0) {
        result.valid = false;
        this.errors.push(...result.errors.map((e) => `${result.file}: ${e}`));
      }
    } catch (error) {
      result.errors.push(`Parse error: ${error.message}`);
      result.valid = false;
      this.errors.push(`${result.file}: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate Claude Code compatibility
   * @param {Object} agentDef - Agent definition
   * @param {Object} result - Result object to update
   */
  validateClaudeCompatibility(agentDef, result) {
    // Claude Code uses .claude/commands/ structure
    // Check for any Claude-specific features that might not work in Gemini

    // Claude supports slash commands via Skill tool
    if (agentDef.commands) {
      for (const cmd of agentDef.commands) {
        // Commands should not have leading slash (added by system)
        if (typeof cmd === 'string' && cmd.startsWith('/')) {
          result.warnings.push(`Command "${cmd}" should not start with /`);
        }
      }
    }
  }

  /**
   * Validate Gemini CLI compatibility
   * @param {Object} agentDef - Agent definition
   * @param {Object} result - Result object to update
   */
  validateGeminiCompatibility(agentDef, result) {
    // Gemini CLI uses .gemini/rules/AIOX/agents/ structure
    // Check for any Gemini-specific requirements

    // Gemini requires activation-instructions
    if (!agentDef['activation-instructions']) {
      result.warnings.push('No activation-instructions - may affect Gemini CLI behavior');
    }

    // Check for hooks integration hints
    if (agentDef.hooks) {
      result.geminiCompatible = true; // Gemini has native hooks support
    }
  }

  /**
   * Validate dependencies structure
   * @param {Object} deps - Dependencies object
   * @param {Object} result - Result object to update
   */
  validateDependencies(deps, result) {
    const validTypes = ['tasks', 'templates', 'checklists', 'data', 'scripts', 'tools'];

    for (const [type, items] of Object.entries(deps)) {
      if (!validTypes.includes(type) && type !== 'git_restrictions' && type !== 'coderabbit_integration') {
        result.warnings.push(`Unknown dependency type: ${type}`);
      }

      if (Array.isArray(items)) {
        for (const item of items) {
          if (typeof item !== 'string') {
            result.errors.push(`Invalid dependency item in ${type}`);
          }
        }
      }
    }
  }

  /**
   * Validate a task file
   * @param {string} filePath - Path to task file
   * @returns {Object} Validation result
   */
  async validateTask(filePath) {
    const result = {
      file: path.basename(filePath),
      path: filePath,
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for basic structure
      if (!content.includes('# ') && !content.includes('## ')) {
        result.warnings.push('No markdown headers found');
      }

      // Check for task definition section
      if (!content.includes('## Instructions') && !content.includes('## Purpose')) {
        result.warnings.push('No Instructions or Purpose section found');
      }

      // Check for YAML frontmatter (optional)
      if (content.startsWith('---')) {
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          try {
            yaml.load(frontmatterMatch[1]);
          } catch (e) {
            result.errors.push(`Invalid YAML frontmatter: ${e.message}`);
            result.valid = false;
          }
        }
      }
    } catch (error) {
      result.errors.push(`Read error: ${error.message}`);
      result.valid = false;
    }

    return result;
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot-separated path
   * @returns {*} Value or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }

  /**
   * Get all markdown files in directory
   * @param {string} dir - Directory path
   * @returns {Array<string>} File paths
   */
  getMarkdownFiles(dir) {
    if (!fs.existsSync(dir)) {
      return [];
    }

    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => path.join(dir, f));
  }

  /**
   * Generate compatibility report
   * @param {Object} results - Validation results
   * @returns {string} Formatted report
   */
  generateReport(results) {
    let report = '# AIOX Skills Cross-CLI Compatibility Report\n\n';

    report += `**Overall Status:** ${results.compatible ? '✅ Compatible' : '❌ Issues Found'}\n\n`;

    // Summary
    report += '## Summary\n\n';
    report += `- Agents validated: ${results.agents.length}\n`;
    report += `- Tasks validated: ${results.tasks.length}\n`;
    report += `- Errors: ${results.errors.length}\n`;
    report += `- Warnings: ${results.warnings.length}\n\n`;

    // Agents
    if (results.agents.length > 0) {
      report += '## Agents\n\n';
      for (const agent of results.agents) {
        const icon = agent.valid ? '✅' : '❌';
        report += `### ${icon} ${agent.file}\n`;
        report += `- Claude Compatible: ${agent.claudeCompatible ? 'Yes' : 'No'}\n`;
        report += `- Gemini Compatible: ${agent.geminiCompatible ? 'Yes' : 'No'}\n`;
        if (agent.errors.length > 0) {
          report += `- Errors: ${agent.errors.join(', ')}\n`;
        }
        if (agent.warnings.length > 0) {
          report += `- Warnings: ${agent.warnings.join(', ')}\n`;
        }
        report += '\n';
      }
    }

    // Errors
    if (results.errors.length > 0) {
      report += '## Errors\n\n';
      for (const error of results.errors) {
        report += `- ❌ ${error}\n`;
      }
      report += '\n';
    }

    // Warnings
    if (results.warnings.length > 0) {
      report += '## Warnings\n\n';
      for (const warning of results.warnings) {
        report += `- ⚠️ ${warning}\n`;
      }
    }

    return report;
  }
}

module.exports = { SkillValidator };

// CLI execution
if (require.main === module) {
  const validator = new SkillValidator();

  validator.validateAll().then((results) => {
    console.log(validator.generateReport(results));
    process.exit(results.compatible ? 0 : 1);
  });
}
