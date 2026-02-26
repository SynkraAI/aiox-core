/**
 * Agent Config Check
 *
 * Verifies agent configuration files are valid YAML.
 *
 * @module aios-core/health-check/checks/project/agent-config
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Agent configuration validation check
 *
 * @class AgentConfigCheck
 * @extends BaseCheck
 */
class AgentConfigCheck extends BaseCheck {
  constructor() {
    super({
      id: 'project.agent-config',
      name: 'Agent Configurations',
      description: 'Verifies agent configuration files are valid',
      domain: CheckDomain.PROJECT,
      severity: CheckSeverity.MEDIUM,
      timeout: 5000,
      cacheable: true,
      healingTier: 0, // Cannot auto-fix invalid YAML
      tags: ['aios', 'agents', 'config'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const agentPaths = [
      path.join(projectRoot, '.aios-core', 'development', 'agents'),
      path.join(projectRoot, '.claude', 'commands'),
    ];

    const validAgents = [];
    const invalidAgents = [];
    let totalAgents = 0;

    for (const agentPath of agentPaths) {
      try {
        const files = await fs.readdir(agentPath);

        for (const file of files) {
          if (file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.yml')) {
            totalAgents++;
            const filePath = path.join(agentPath, file);

            try {
              const content = await fs.readFile(filePath, 'utf8');

              // Check for YAML frontmatter in .md files
              if (file.endsWith('.md')) {
                const hasValidFrontmatter = this.validateMarkdownAgent(content);
                if (hasValidFrontmatter) {
                  validAgents.push(file);
                } else {
                  invalidAgents.push({ file, reason: 'Missing or invalid frontmatter' });
                }
              } else {
                // Validate YAML files
                const isValidYaml = this.validateYaml(content);
                if (isValidYaml) {
                  validAgents.push(file);
                } else {
                  invalidAgents.push({ file, reason: 'Invalid YAML syntax' });
                }
              }
            } catch (readError) {
              invalidAgents.push({ file, reason: `Cannot read: ${readError.message}` });
            }
          }
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }

    if (totalAgents === 0) {
      return this.pass('No agent configurations found (framework may not be fully set up)', {
        details: { searchPaths: agentPaths },
      });
    }

    if (invalidAgents.length > 0) {
      return this.warning(`${invalidAgents.length} agent configuration(s) have issues`, {
        recommendation: 'Fix YAML syntax or frontmatter in invalid agent files',
        details: {
          valid: validAgents,
          invalid: invalidAgents,
          total: totalAgents,
        },
      });
    }

    return this.pass(`All ${validAgents.length} agent configurations are valid`, {
      details: {
        agents: validAgents,
        total: totalAgents,
      },
    });
  }

  /**
   * Validate Markdown agent file has valid frontmatter
   * @private
   * @param {string} content - File content
   * @returns {boolean} True if valid
   */
  validateMarkdownAgent(content) {
    // Check for YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return false;
    }

    try {
      // Basic YAML validation (check for required fields)
      const frontmatter = frontmatterMatch[1];
      return frontmatter.includes('name:') || frontmatter.includes('id:');
    } catch {
      return false;
    }
  }

  /**
   * Basic YAML syntax validation
   * @private
   * @param {string} content - YAML content
   * @returns {boolean} True if valid
   */
  validateYaml(content) {
    try {
      // Try to load js-yaml if available
      const yaml = require('js-yaml');
      yaml.load(content);
      return true;
    } catch {
      // Fallback: basic syntax check
      // Check for common YAML issues
      const lines = content.split('\n');
      for (const line of lines) {
        // Check for tabs (YAML requires spaces)
        if (line.includes('\t') && !line.startsWith('#')) {
          return false;
        }
      }
      return true;
    }
  }
}

module.exports = AgentConfigCheck;
