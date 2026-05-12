/**
 * Antigravity Transformer - Cursor-style format
 * @story 6.19 - IDE Command Auto-Sync System
 *
 * Format: Similar to Cursor, condensed rules format
 * Target: .antigravity/rules/agents/*.md
 */

const { getVisibleCommands, normalizeCommands } = require('../agent-parser');

/**
 * Transform agent data to Antigravity format
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed content
 */
function transform(agentData) {
  const agent = agentData.agent || {};
  const persona = agentData.persona_profile || {};

  const icon = agent.icon || '🤖';
  const name = agent.name || agentData.id;
  const title = agent.title || 'AIOX Agent';
  const whenToUse = agent.whenToUse || 'Use this agent for specific tasks';
  const archetype = persona.archetype || '';

  // Get quick visibility commands (normalized to consistent format)
  const allCommands = normalizeCommands(agentData.commands || []);
  const quickCommands = getVisibleCommands(allCommands, 'quick');
  const keyCommands = getVisibleCommands(allCommands, 'key');

  // Build content (similar to Cursor)
  let content = `# ${name} (@${agentData.id})

${icon} **${title}**${archetype ? ` | ${archetype}` : ''}

> ${whenToUse}

`;

  // Add quick commands section
  if (quickCommands.length > 0) {
    content += `## Quick Commands

`;
    for (const cmd of quickCommands) {
      content += `- \`*${cmd.name}\` - ${cmd.description || 'No description'}\n`;
    }
    content += '\n';
  }

  // Add key commands if different from quick
  const keyOnlyCommands = keyCommands.filter(
    k => !quickCommands.some(q => q.name === k.name)
  );
  if (keyOnlyCommands.length > 0) {
    content += `## Key Commands

`;
    for (const cmd of keyOnlyCommands) {
      content += `- \`*${cmd.name}\` - ${cmd.description || 'No description'}\n`;
    }
    content += '\n';
  }

  // Add all commands for reference (allCommands already normalized above)
  if (allCommands.length > quickCommands.length + keyOnlyCommands.length) {
    content += `## All Commands

`;
    for (const cmd of allCommands) {
      content += `- \`*${cmd.name}\` - ${cmd.description || 'No description'}\n`;
    }
    content += '\n';
  }

  // Add collaboration section if available
  if (agentData.sections.collaboration) {
    content += `## Collaboration

${agentData.sections.collaboration}

`;
  }

  content += `---
*AIOX Agent - Synced from .aiox-core/development/agents/${agentData.filename}*
`;

  return content;
}

/**
 * Get the target filename for this agent
 * @param {object} agentData - Parsed agent data
 * @returns {string} - Target filename
 */
function getFilename(agentData) {
  return agentData.filename;
}

module.exports = {
  transform,
  getFilename,
  format: 'cursor-style',
};
