/**
 * Claude Code Transformer - Full markdown with YAML (identity transform)
 * @story 6.19 - IDE Command Auto-Sync System
 *
 * Format: Full markdown file with embedded YAML block
 * Target: .claude/commands/AIOX/agents/*.md
 */

const path = require('path');

function normalizePath(value) {
  return String(value || '').split(path.sep).join('/');
}

function getSourcePath(agentData) {
  if (agentData.sourcePath) {
    return normalizePath(agentData.sourcePath);
  }

  if (agentData.path) {
    const relative = path.relative(process.cwd(), agentData.path);
    if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
      return normalizePath(relative);
    }
  }

  return `.aiox-core/development/agents/${agentData.filename}`;
}

/**
 * Transform agent data to Claude Code format
 * For Claude Code, we use the full original file (identity transform)
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed content
 */
function transform(agentData) {
  const sourcePath = getSourcePath(agentData);
  // Claude Code uses the full original file
  if (agentData.raw) {
    // Add sync footer if not present
    const syncFooter = `\n---\n*AIOX Agent - Synced from ${sourcePath}*\n`;

    if (!agentData.raw.includes(`Synced from ${sourcePath}`)) {
      return agentData.raw.trimEnd() + syncFooter;
    }
    return agentData.raw;
  }

  // Fallback: generate minimal content
  return generateMinimalContent(agentData);
}

/**
 * Transform agent data to a Claude Code legacy command shim.
 * The full activation payload lives in the Claude Skill sidecar.
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Legacy command shim content
 */
function transformCommand(agentData) {
  const agent = agentData.agent || {};
  const sourcePath = getSourcePath(agentData);
  const skillPath = `.claude/skills/${getSkillRelativePath(agentData)}`;
  const name = agent.name || agentData.id;
  const title = agent.title || 'AIOX Agent';
  const whenToUse = normalizeInlineText(
    agent.whenToUse || 'Use this AIOX agent when the task matches its responsibility.',
    360
  );

  return `# ${agentData.id}

<!-- ACORE-CLAUDE-AGENT-COMMAND: legacy-shim -->
<!-- Canonical Skill: ${skillPath} -->
<!-- Source: ${sourcePath} -->

**${name}** - ${title}

> ${whenToUse}

## Compatibility Activation

This command is a legacy compatibility shim. The canonical Claude activation payload is:

\`${skillPath}\`

When this command is invoked:

1. Read \`${skillPath}\` in full.
2. Follow the activation instructions from that skill.
3. If the skill file is unavailable, read \`${sourcePath}\` as fallback.
`;
}

/**
 * Generate minimal content if raw file is unavailable
 * @param {object} agentData - Parsed agent data
 * @returns {string} - Generated content
 */
function generateMinimalContent(agentData) {
  const agent = agentData.agent || {};
  const persona = agentData.persona_profile || {};
  const sourcePath = getSourcePath(agentData);

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
*AIOX Agent - Synced from ${sourcePath}*
`;

  return content;
}

/**
 * Normalize free text for YAML frontmatter.
 * @param {string} text - Raw text
 * @param {number} maxLength - Maximum length
 * @returns {string} - Normalized text
 */
function normalizeInlineText(text, maxLength = 240) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

/**
 * Quote a value for one-line YAML frontmatter.
 * @param {string} value - Raw value
 * @returns {string} - YAML-safe quoted value
 */
function quoteYamlString(value) {
  return JSON.stringify(normalizeInlineText(value));
}

/**
 * Build a Claude skill description from the parsed agent metadata.
 * @param {object} agentData - Parsed agent data
 * @returns {string} - Skill description
 */
function buildSkillDescription(agentData) {
  const agent = agentData.agent || {};
  const name = agent.name || agentData.id;
  const title = agent.title || 'AIOX Agent';
  const whenToUse = agent.whenToUse || 'Use this AIOX agent when the task matches its responsibility.';

  return `Activate ${name} (${agentData.id}) for ${title}. ${whenToUse}`;
}

/**
 * Get the relative Claude skill path for this agent under .claude/skills.
 * @param {object} agentData - Parsed agent data
 * @returns {string} - Relative skill path
 */
function getSkillRelativePath(agentData) {
  return path.posix.join('AIOX', 'agents', agentData.id, 'SKILL.md');
}

/**
 * Transform agent data to a Claude Skill sidecar.
 * The command file remains the compatibility surface; the skill is the new canonical Claude surface.
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Skill content
 */
function transformSkill(agentData) {
  const sourcePath = getSourcePath(agentData);
  const name = `aiox-${agentData.id}`;
  const description = buildSkillDescription(agentData);
  const sourceContent = agentData.raw ? agentData.raw.trimEnd() : generateMinimalContent(agentData).trimEnd();

  return `---
name: ${name}
description: ${quoteYamlString(description)}
user-invocable: true
activation_type: pipeline
---

<!-- ACORE-CLAUDE-AGENT-SKILL: generated -->
<!-- Source: ${sourcePath} -->

${sourceContent}
`;
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
  transformCommand,
  transformSkill,
  getFilename,
  getSkillRelativePath,
  getSourcePath,
  format: 'full-markdown-yaml',
};
