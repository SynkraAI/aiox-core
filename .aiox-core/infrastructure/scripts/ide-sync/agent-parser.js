/**
 * Agent Parser - Extracts YAML and markdown sections from agent files
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Extract YAML block from markdown content
 * @param {string} content - Full markdown content
 * @returns {string|null} - YAML content without fences, or null if not found
 */
function extractYamlBlock(content) {
  // Match ```yaml ... ``` block
  const yamlMatch = content.match(/```yaml\s*\n([\s\S]*?)\n```/);
  if (yamlMatch && yamlMatch[1]) {
    return yamlMatch[1].trim();
  }
  return null;
}

/**
 * Parse YAML content safely with fallback for problematic patterns
 * @param {string} yamlContent - YAML string to parse
 * @returns {object|null} - Parsed object or null on error
 */
function parseYaml(yamlContent) {
  try {
    return yaml.load(yamlContent);
  } catch (error) {
    // Try to fix common YAML issues before failing
    try {
      // Fix command format issues with {placeholders} in keys
      // Convert "- key {param}: value" to "- name: key {param}\n    description: value"
      let fixed = yamlContent.replace(
        /^(\s*)-\s+([a-z-]+)\s*(\{[^}]+\})?:\s*(.+)$/gm,
        (match, indent, name, param, desc) => {
          const fullName = param ? `${name} ${param}` : name;
          return `${indent}- name: "${fullName}"\n${indent}  description: "${desc.replace(/"/g, '\\"')}"`;
        }
      );

      // Fix pipe patterns with invalid YAML
      fixed = fixed.replace(/:\s*"[^"]*"\s*\|\s*"[^"]*"/g, (match) => {
        // Convert "value1" | "value2" to list
        return `: [${match.slice(2)}]`;
      });

      return yaml.load(fixed);
    } catch (fixError) {
      console.error(`YAML parse error: ${error.message}`);
      return null;
    }
  }
}

/**
 * Extract markdown section by heading
 * @param {string} content - Full markdown content
 * @param {string} heading - Heading to find (without #)
 * @returns {string|null} - Section content or null if not found
 */
function extractSection(content, heading) {
  // Escape special regex characters in heading
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match ## heading or ### heading
  const regex = new RegExp(
    `^#{2,3}\\s*${escapedHeading}\\s*$\\n([\\s\\S]*?)(?=^#{2,3}\\s|$)`,
    'mi'
  );

  const match = content.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

/**
 * Extract basic agent info using regex fallback
 * @param {string} content - Raw markdown content
 * @returns {object} - Extracted agent data
 */
function extractAgentInfoFallback(content) {
  const agent = {};

  // Try to extract agent name
  const nameMatch = content.match(/name:\s*([^\n]+)/);
  if (nameMatch) agent.name = nameMatch[1].trim();

  // Try to extract id
  const idMatch = content.match(/id:\s*([^\n]+)/);
  if (idMatch) agent.id = idMatch[1].trim();

  // Try to extract title
  const titleMatch = content.match(/title:\s*([^\n]+)/);
  if (titleMatch) agent.title = titleMatch[1].trim();

  // Try to extract icon
  const iconMatch = content.match(/icon:\s*([^\n]+)/);
  if (iconMatch) agent.icon = iconMatch[1].trim();

  // Try to extract whenToUse - handle apostrophes within text (e.g., "don't")
  // First try quoted string, then unquoted to end of line
  const whenMatchQuoted = content.match(/whenToUse:\s*["'](.+?)["'](?:\n|$)/);
  const whenMatchUnquoted = content.match(/whenToUse:\s*([^\n]+)/);
  const whenMatch = whenMatchQuoted || whenMatchUnquoted;
  if (whenMatch) agent.whenToUse = whenMatch[1].trim();

  return Object.keys(agent).length > 0 ? agent : null;
}

/**
 * Parse a single agent file
 * @param {string} filePath - Path to agent markdown file
 * @returns {object} - Parsed agent data
 */
function parseAgentFile(filePath) {
  const result = {
    path: filePath,
    filename: path.basename(filePath),
    id: path.basename(filePath, '.md'),
    raw: null,
    yaml: null,
    agent: null,
    persona_profile: null,
    commands: [],
    dependencies: null,
    sections: {
      quickCommands: null,
      collaboration: null,
      guide: null,
    },
    error: null,
  };

  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    result.raw = content;

    // Extract YAML block
    const yamlContent = extractYamlBlock(content);
    if (!yamlContent) {
      result.error = 'No YAML block found';
      return result;
    }

    // Parse YAML
    const parsed = parseYaml(yamlContent);
    if (!parsed) {
      // Try fallback extraction for basic agent info
      const fallbackAgent = extractAgentInfoFallback(content);
      if (fallbackAgent) {
        result.agent = fallbackAgent;
        result.error = 'YAML parse failed, using fallback extraction';
        // Don't return - allow processing with partial data
      } else {
        result.error = 'Failed to parse YAML';
        return result;
      }
    } else {
      result.yaml = parsed;

      // Extract key sections
      result.agent = parsed.agent || null;
      result.persona_profile = parsed.persona_profile || null;
      result.commands = parsed.commands || [];
      result.dependencies = parsed.dependencies || null;
    }

    // Extract markdown sections (always try)
    result.sections.quickCommands = extractSection(content, 'Quick Commands');
    result.sections.collaboration = extractSection(content, 'Agent Collaboration');
    result.sections.guide = extractSection(content, 'Developer Guide') ||
                           extractSection(content, '.*Guide \\(\\*guide command\\)');

  } catch (error) {
    result.error = error.message;
  }

  return result;
}

/**
 * Parse all agent files in a directory
 * @param {string} agentsDir - Path to agents directory
 * @returns {object[]} - Array of parsed agent data
 */
function parseAllAgents(agentsDir) {
  const agents = [];

  if (!fs.existsSync(agentsDir)) {
    console.error(`Agents directory not found: ${agentsDir}`);
    return agents;
  }

  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(agentsDir, file);
    const agentData = parseAgentFile(filePath);
    agents.push(agentData);
  }

  return agents;
}

/**
 * Normalize commands to consistent format
 * Handles both { name, description } and { "cmd-name": "description" } formats
 * @param {object[]} commands - Array of command objects (may be in various formats)
 * @returns {object[]} - Normalized command objects with name, description, visibility
 */
function normalizeCommands(commands) {
  if (!Array.isArray(commands)) return [];

  return commands.map(cmd => {
    // Already in proper format with name property
    if (cmd.name && typeof cmd.name === 'string') {
      return {
        name: cmd.name,
        description: cmd.description || 'No description',
        visibility: cmd.visibility || ['full', 'quick'],
      };
    }

    // Shorthand format: { "cmd-name": "description text" }
    const keys = Object.keys(cmd);
    if (keys.length === 1) {
      const name = keys[0];
      const description = cmd[name];
      return {
        name: name,
        description: typeof description === 'string' ? description : 'No description',
        visibility: ['full', 'quick'],
      };
    }

    // Unknown format - try to extract what we can
    return {
      name: cmd.name || 'unknown',
      description: cmd.description || 'No description',
      visibility: cmd.visibility || ['full', 'quick'],
    };
  });
}

/**
 * Get visibility-filtered commands
 * @param {object[]} commands - Array of command objects
 * @param {string} visibility - Visibility level (full, quick, key)
 * @returns {object[]} - Filtered commands
 */
function getVisibleCommands(commands, visibility) {
  if (!Array.isArray(commands)) return [];

  // First normalize the commands to ensure consistent format
  const normalized = normalizeCommands(commands);

  return normalized.filter(cmd => {
    if (!cmd.visibility) return true; // Include if no visibility defined
    return cmd.visibility.includes(visibility);
  });
}

/**
 * Format commands as bullet list
 * @param {object[]} commands - Array of command objects
 * @param {string} prefix - Prefix for command name (default: '*')
 * @returns {string} - Formatted bullet list
 */
function formatCommandsList(commands, prefix = '*') {
  if (!Array.isArray(commands) || commands.length === 0) {
    return '- No commands available';
  }

  return commands
    .map(cmd => `- \`${prefix}${cmd.name}\` - ${cmd.description || 'No description'}`)
    .join('\n');
}

module.exports = {
  extractYamlBlock,
  parseYaml,
  extractSection,
  parseAgentFile,
  parseAllAgents,
  normalizeCommands,
  getVisibleCommands,
  formatCommandsList,
};
