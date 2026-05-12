/**
 * Claude Code Transformer - Full markdown with YAML (identity transform)
 * @story 6.19 - IDE Command Auto-Sync System
 *
 * Format: Full markdown file with embedded YAML block
 * Target: .claude/commands/AIOX/agents/*.md
 */

/**
 * Transform agent data to Claude Code format
 * For Claude Code, we use the full original file (identity transform)
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed content
 */
function transform(agentData) {
  // Claude Code uses the full original file
  if (agentData.raw) {
    // Add sync footer if not present
    const syncFooter = `\n---\n*AIOX Agent - Synced from .aiox-core/development/agents/${agentData.filename}*\n`;

    if (!agentData.raw.includes('Synced from .aiox-core/development/agents/')) {
      return agentData.raw.trimEnd() + syncFooter;
    }
    return agentData.raw;
  }

  // Fallback: generate minimal content
  return generateMinimalContent(agentData);
}

/**
 * Generate minimal content if raw file is unavailable
 * @param {object} agentData - Parsed agent data
 * @returns {string} - Generated content
 */
function generateMinimalContent(agentData) {
  const agent = agentData.agent || {};
  const persona = agentData.persona_profile || {};

  const icon = agent.icon || '🤖';
  const name = agent.name || agentData.id;
  const title = agent.title || 'AIOX Agent';
  const whenToUse = agent.whenToUse || 'Use this agent for specific tasks';

  let content = `# ${agentData.id}

${icon} **${name}** - ${title}

> ${whenToUse}

`;

  // Add commands if available
  if (agentData.commands && agentData.commands.length > 0) {
    content += `## Commands

`;
    for (const cmd of agentData.commands) {
      content += `- \`*${cmd.name}\` - ${cmd.description || 'No description'}\n`;
    }
  }

  content += `
---
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
  format: 'full-markdown-yaml',
};
