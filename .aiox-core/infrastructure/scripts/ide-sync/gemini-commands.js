'use strict';

const fs = require('fs-extra');
const path = require('path');

const FALLBACK_DESCRIPTION = 'Agente especializado AIOX';
const MAX_DESCRIPTION_CONTEXT = 120;

const MENU_ORDER = [
  'aiox-master',
  'analyst',
  'architect',
  'data-engineer',
  'dev',
  'devops',
  'pm',
  'po',
  'qa',
  'sm',
  'squad-creator',
  'ux-design-expert',
];

function commandSlugForAgent(agentId) {
  if (agentId.startsWith('aiox-')) {
    return agentId.replace(/^aiox-/, '');
  }
  return agentId;
}

function menuCommandName(agentId) {
  return `/aiox-${commandSlugForAgent(agentId)}`;
}

function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}

function truncateText(text, maxLen = MAX_DESCRIPTION_CONTEXT) {
  if (!text || text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
}

function summarizeWhenToUse(whenToUse) {
  const normalized = normalizeText(whenToUse);
  if (!normalized) return '';

  // Drop redirect/negative guidance sections that are useful for routing, not for menu labels.
  const withoutNegativeSection = normalized.split(/\b(?:NOT\s+for|NÃO\s+para)\b/i)[0].trim();
  const primary = withoutNegativeSection || normalized;

  // Keep only the first sentence/chunk for concise autocomplete labels.
  const firstChunk = primary.split(/[.;!?](?:\s|$)/)[0].trim();
  return truncateText(firstChunk || primary);
}

function escapeTomlString(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildAgentDescription(agent) {
  const agentData = agent.agent || {};
  const title = normalizeText(agentData.title);
  const whenToUseSummary = summarizeWhenToUse(agentData.whenToUse);

  if (title && whenToUseSummary) {
    return `${title} (${whenToUseSummary})`;
  }
  if (title) {
    return title;
  }
  if (whenToUseSummary) {
    return whenToUseSummary;
  }
  return `Ativar agente AIOX ${agent.id}`;
}

function buildAgentCommandPrompt(agentId) {
  return [
    `Ative o agente ${agentId}:`,
    `1. Leia a definição completa em .gemini/rules/AIOX/agents/${agentId}.md`,
    '2. Siga as activation-instructions do bloco YAML',
    `3. Renderize o greeting via: node .aiox-core/development/scripts/generate-greeting.js ${agentId}`,
    '   Se shell nao disponivel, exiba o greeting de persona_profile.communication.greeting_levels.named',
    '4. Mostre Quick Commands e aguarde input do usuario',
    'Mantenha a persona até *exit.',
  ].join('\n');
}

function buildAgentCommandFile(agentId, description = FALLBACK_DESCRIPTION) {
  const slug = commandSlugForAgent(agentId);

  const prompt = buildAgentCommandPrompt(agentId);
  const content = [
    `description = "${escapeTomlString(description)}"`,
    'prompt = """',
    prompt,
    '"""',
    '',
  ].join('\n');

  return {
    filename: `aiox-${slug}.toml`,
    content,
    agentId,
    description,
  };
}

function buildMenuPrompt(commandFiles) {
  const lines = [
    'Você está no launcher AIOX para Gemini.',
    '',
    'Mostre a lista de agentes abaixo em formato numerado, explicando em 1 linha quando usar cada um:',
  ];

  let index = 1;
  for (const commandFile of commandFiles) {
    lines.push(`${index}. ${menuCommandName(commandFile.agentId)} - ${commandFile.description}`);
    index += 1;
  }

  lines.push('');
  lines.push('No final, peça para o usuário escolher um número ou digitar o comando direto.');
  return lines.join('\n');
}

function buildMenuCommandFile(commandFiles) {
  const content = [
    'description = "Menu rápido AIOX (lista agentes e orienta qual ativar)"',
    'prompt = """',
    buildMenuPrompt(commandFiles),
    '"""',
    '',
  ].join('\n');

  return {
    filename: 'aiox-menu.toml',
    content,
  };
}

function resolveAgentOrder(agentIds) {
  const unique = [...new Set(agentIds)];
  const known = MENU_ORDER.filter((id) => unique.includes(id));
  const extra = unique.filter((id) => !MENU_ORDER.includes(id)).sort();
  return [...known, ...extra];
}

function buildGeminiCommandFiles(agents) {
  const validAgents = agents
    .filter((agent) => !agent.error)
    .map((agent) => ({
      id: agent.id,
      description: buildAgentDescription(agent),
    }));

  const ordered = resolveAgentOrder(validAgents.map((agent) => agent.id));
  const byId = new Map(validAgents.map((agent) => [agent.id, agent]));
  const files = ordered.map((id) => {
    const meta = byId.get(id);
    const description = meta?.description || FALLBACK_DESCRIPTION;
    return buildAgentCommandFile(id, description);
  });
  files.unshift(buildMenuCommandFile(files));
  return files;
}

function syncGeminiCommands(agents, projectRoot, options = {}) {
  const commandsDir = path.join(projectRoot, '.gemini', 'commands');
  const files = buildGeminiCommandFiles(agents);
  const written = [];

  if (!options.dryRun) {
    fs.ensureDirSync(commandsDir);
  }

  for (const file of files) {
    const targetPath = path.join(commandsDir, file.filename);
    if (!options.dryRun) {
      fs.writeFileSync(targetPath, file.content, 'utf8');
    }
    written.push({
      filename: path.join('commands', file.filename),
      path: targetPath,
      content: file.content,
    });
  }

  return { commandsDir, files: written };
}

module.exports = {
  FALLBACK_DESCRIPTION,
  MENU_ORDER,
  commandSlugForAgent,
  menuCommandName,
  buildAgentDescription,
  summarizeWhenToUse,
  truncateText,
  escapeTomlString,
  buildGeminiCommandFiles,
  syncGeminiCommands,
};
