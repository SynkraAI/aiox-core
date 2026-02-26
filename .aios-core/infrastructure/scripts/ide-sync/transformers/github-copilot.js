/**
 * GitHub Copilot Transformer - YAML frontmatter + condensed markdown
 * @story 6.19 - IDE Command Auto-Sync System
 * @issue #138 - Agent files not compatible with GitHub Copilot
 *
 * Format: .agent.md files with YAML frontmatter (--- delimiters)
 * Target: .github/agents/*.agent.md
 *
 * GitHub Copilot custom agents require:
 * - YAML frontmatter with `description` (required), `name`, `tools`
 * - Markdown body under 30,000 characters
 * - File extension: .agent.md
 *
 * @see https://docs.github.com/en/copilot/reference/custom-agents-configuration
 */

const { normalizeCommands, getVisibleCommands } = require('../agent-parser');

/**
 * Transform agent data to GitHub Copilot custom agent format
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed content with YAML frontmatter
 */
function transform(agentData) {
  const agent = agentData.agent || {};
  const persona = agentData.persona_profile || {};
  const yamlData = agentData.yaml || {};
  const personaBlock = yamlData.persona || {};

  const id = agent.id || agentData.id;
  const name = agent.name || id;
  const title = agent.title || 'AIOS Agent';
  const icon = agent.icon || '';
  const description = escapeYamlString(agent.whenToUse || `${title} agent for development tasks`);

  // Build YAML frontmatter
  const frontmatter = [
    '---',
    `name: ${id}`,
    `description: '${description}'`,
    `tools: ['read', 'edit', 'search', 'execute']`,
    '---',
  ].join('\n');

  // Build markdown body
  const body = buildMarkdownBody({
    id,
    name,
    title,
    icon,
    personaBlock,
    persona,
    commands: agentData.commands || [],
    sections: agentData.sections || {},
    corePrinciples: yamlData.core_principles,
    filename: agentData.filename,
  });

  const content = `${frontmatter}\n\n${body}`;

  // Enforce 30K character limit
  if (content.length > 30000) {
    return truncateContent(content, 30000);
  }

  return content;
}

/**
 * Build the markdown body for the Copilot agent prompt
 * @param {object} params - Agent parameters
 * @returns {string} - Markdown body
 */
function buildMarkdownBody(params) {
  const { id, name, title, icon, personaBlock, persona, commands, sections, filename } = params;

  const parts = [];

  // Header
  const headerIcon = icon ? `${icon} ` : '';
  parts.push(`# ${headerIcon}${name} Agent (@${id})\n`);

  // Role description
  if (personaBlock.role) {
    parts.push(`You are an expert ${personaBlock.role}.\n`);
  } else {
    parts.push(`You are an expert ${title}.\n`);
  }

  // Style
  if (personaBlock.style) {
    parts.push(`## Style\n\n${personaBlock.style}\n`);
  }

  // Core principles (may be in persona block or at root level of YAML)
  const corePrinciples = personaBlock.core_principles || params.corePrinciples;
  if (corePrinciples && Array.isArray(corePrinciples)) {
    parts.push('## Core Principles\n');
    for (const principle of corePrinciples) {
      // Handle both string and object formats (YAML may parse "KEY: value" as {KEY: value})
      if (typeof principle === 'string') {
        parts.push(`- ${principle}`);
      } else if (typeof principle === 'object' && principle !== null) {
        const entries = Object.entries(principle);
        for (const [key, value] of entries) {
          parts.push(`- ${key}: ${value}`);
        }
      }
    }
    parts.push('');
  }

  // Commands reference
  const allCommands = normalizeCommands(commands);
  const keyCommands = getVisibleCommands(allCommands, 'key');
  const quickCommands = getVisibleCommands(allCommands, 'quick');
  const displayCommands = keyCommands.length > 0 ? keyCommands : quickCommands.slice(0, 10);

  if (displayCommands.length > 0) {
    parts.push('## Commands\n');
    parts.push('Use `*` prefix for commands:\n');
    for (const cmd of displayCommands) {
      parts.push(`- \`*${cmd.name}\` - ${cmd.description || 'No description'}`);
    }
    parts.push('');
  }

  // Collaboration section (condensed)
  if (sections.collaboration) {
    parts.push(`## Collaboration\n\n${sections.collaboration}\n`);
  }

  // Sync footer
  parts.push('---');
  parts.push(`*AIOS Agent - Synced from .aios-core/development/agents/${filename}*`);
  parts.push('');

  return parts.join('\n');
}

/**
 * Escape a string for use as a YAML single-quoted value
 * Single quotes inside the string must be doubled
 * @param {string} str - Input string
 * @returns {string} - Escaped string
 */
function escapeYamlString(str) {
  if (!str) return '';
  // In YAML single-quoted strings, single quotes are escaped by doubling them
  return str.replace(/'/g, "''");
}

/**
 * Truncate content to fit within character limit while keeping structure valid
 * @param {string} content - Full content
 * @param {number} maxChars - Maximum characters
 * @returns {string} - Truncated content
 */
function truncateContent(content, maxChars) {
  // Find the last complete section before the limit
  const truncated = content.substring(0, maxChars - 100);
  const lastNewline = truncated.lastIndexOf('\n\n');

  if (lastNewline > 0) {
    return truncated.substring(0, lastNewline) + '\n\n---\n*Content truncated to fit 30K limit*\n';
  }
  return truncated + '\n\n---\n*Content truncated to fit 30K limit*\n';
}

/**
 * Get the target filename for this agent (with .agent.md extension)
 * @param {object} agentData - Parsed agent data
 * @returns {string} - Target filename (e.g., "dev.agent.md")
 */
function getFilename(agentData) {
  const id = (agentData.agent && agentData.agent.id) || agentData.id;
  return `${id}.agent.md`;
}

module.exports = {
  transform,
  getFilename,
  format: 'github-copilot',
};
