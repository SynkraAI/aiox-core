/**
 * Kimi Transformer - Skill-based agent activator
 * @story Kimi IDE Integration
 *
 * Format: SKILL.md with YAML frontmatter + markdown instructions
 * Target: .kimi/skills/aios-{agent-id}/SKILL.md
 */

/**
 * Transform agent data to Kimi skill format
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed SKILL.md content
 */
function transform(agentData) {
  const rawAgent = agentData.agent || {};
  const fallbackAgent = agentData._fallback || {};
  const persona = agentData.persona_profile || {};
  const comm = persona.communication || {};
  const greetingLevels = comm.greeting_levels || {};
  const yaml = agentData.yaml || {};

  const id = agentData.id;
  const skillId = getSkillId(agentData);
  const activationId = getPreferredActivationId(agentData);
  const name = rawAgent.name || fallbackAgent.name || id;
  const title = rawAgent.title || fallbackAgent.title || 'AIOS Agent';
  const icon = rawAgent.icon || fallbackAgent.icon || '🤖';
  const whenToUse = rawAgent.whenToUse || fallbackAgent.whenToUse || `Use for ${title.toLowerCase()} tasks`;
  const archetype = persona.archetype || rawAgent.archetype || 'Specialist';

  const description = buildDescription(activationId, name, title, whenToUse);
  const namedGreeting = greetingLevels.named || `${icon} ${name} ready`;

  // Extract rich sections from parsed YAML
  const identitySection = buildIdentitySection(rawAgent, persona, yaml);
  const protocolSection = buildProtocolSection(yaml);
  const commandsTable = buildCommandsTable(agentData.commands);
  const workflowSection = buildWorkflowSection(yaml);
  const guardrailsSection = buildGuardrailsSection(yaml);
  const handoffsSection = buildHandoffsSection(yaml);
  const outputContractSection = buildOutputContractSection(yaml);

  // Full raw content
  const rawContent = agentData.raw || '';
  const rawContentSection = buildRawContentSection(rawContent, id);

  const content = `---
name: ${JSON.stringify(skillId)}
description: ${JSON.stringify(description)}
---

# ${icon} @${id} — ${name}${archetype !== 'Specialist' ? ` (${archetype})` : ''} | ${title}

## Activation Protocol

When this skill is invoked:

1. Adopt the persona below immediately. Do NOT narrate the activation, do NOT comment on Kimi's mechanism, do NOT preface with internal reasoning.
2. Print the greeting verbatim from the next section.
3. List commands EXACTLY as they appear in the Star Commands table — do not summarize, do not invent shortcuts.
4. Wait for user input unless a star command was provided alongside the activation.

## Activation Greeting

\`\`\`text
${namedGreeting}
\`\`\`

${identitySection}${protocolSection}${commandsTable}${workflowSection}${guardrailsSection}${handoffsSection}${outputContractSection}---

## Full Agent Definition — ${id}

> This section contains the COMPLETE operating guide for this agent. Read it ENTIRELY and adopt the persona, principles, protocols, and guardrails defined below. Do NOT invent tasks, processes, or workflows that are not documented here.

${rawContentSection}`;

  return content;
}

function buildIdentitySection(rawAgent, persona, yaml) {
  const name = rawAgent.name || '';
  const role = persona.role || yaml.persona?.role || '';
  const style = persona.style || yaml.persona?.style || '';
  const focus = persona.focus || yaml.persona?.focus || '';
  const identity = persona.identity || yaml.persona?.identity || '';

  if (!name && !role && !style && !focus && !identity) return '';

  let section = '## Identity\n\n';
  if (name) section += `- **Name:** ${name}\n`;
  if (role) section += `- **Role:** ${role}\n`;
  if (style) section += `- **Style:** ${style}\n`;
  if (focus) section += `- **Focus:** ${focus}\n`;
  if (identity) section += `- **Identity:** ${identity}\n`;
  section += '\n';
  return section;
}

function buildProtocolSection(yaml) {
  const items = [];

  if (yaml.cognitive_protocol && Array.isArray(yaml.cognitive_protocol)) {
    items.push('### Cognitive Protocol\n\n' + yaml.cognitive_protocol.map(p => `- ${renderItem(p)}`).join('\n') + '\n');
  }

  if (yaml.evidence_policy) {
    const ep = yaml.evidence_policy;
    let text = '### Evidence Policy\n\n';
    if (ep.required_min_sources) text += `- Required minimum sources: ${ep.required_min_sources}\n`;
    if (ep.accepted_types && Array.isArray(ep.accepted_types)) text += `- Accepted types: ${ep.accepted_types.join(', ')}\n`;
    if (ep.reject_if && Array.isArray(ep.reject_if)) text += `- Reject if: ${ep.reject_if.map(r => `"${r}"`).join(', ')}\n`;
    items.push(text + '\n');
  }

  if (yaml.confidence_model) {
    const cm = yaml.confidence_model;
    let text = '### Confidence Model\n\n';
    if (cm.formula) text += `- Formula: \`${cm.formula}\`\n`;
    if (cm.thresholds) {
      text += '- Thresholds:\n';
      for (const [k, v] of Object.entries(cm.thresholds)) text += `  - ${k}: ${v}\n`;
    }
    items.push(text + '\n');
  }

  if (yaml.core_principles && Array.isArray(yaml.core_principles)) {
    items.push('### Core Principles\n\n' + yaml.core_principles.map(p => `- ${renderItem(p)}`).join('\n') + '\n');
  }

  return items.length > 0 ? items.join('\n') + '\n' : '';
}

function buildCommandsTable(commands) {
  const normalized = normalizeCommands(commands);

  if (normalized.length === 0) {
    return '';
  }

  const allRows = normalized.map(cmd => {
    let vis = 'full';
    if (cmd.visibility) {
      if (Array.isArray(cmd.visibility)) {
        vis = cmd.visibility.join(', ');
      } else if (typeof cmd.visibility === 'string') {
        vis = cmd.visibility;
      }
    }
    return `| \`*${cmd.name}\` | ${formatCommandDescription(cmd.description)} | ${vis} |`;
  });

  // Always include guide/yolo/exit
  const hasGuide = normalized.some(c => c.name === 'guide');
  const hasYolo = normalized.some(c => c.name === 'yolo');
  const hasExit = normalized.some(c => c.name === 'exit');

  if (!hasGuide) allRows.push('| `*guide` | Show comprehensive usage guide | full |');
  if (!hasYolo) allRows.push('| `*yolo` | Toggle permission mode | full |');
  if (!hasExit) allRows.push('| `*exit` | Exit agent mode | full |');

  return `## Star Commands\n\n| Command | Description | Visibility |\n|---------|-------------|------------|\n${allRows.join('\n')}\n\n`;
}

function normalizeCommands(commands) {
  if (!commands) return [];

  const commandList = Array.isArray(commands)
    ? commands
    : (typeof commands === 'object'
      ? Object.entries(commands).map(([name, description]) => ({
        name,
        description,
        visibility: ['full', 'quick'],
      }))
      : []);

  return commandList
    .map(normalizeCommand)
    .filter(cmd => cmd && cmd.name);
}

function normalizeCommand(cmd) {
  if (typeof cmd === 'string') {
    const dashMatch = cmd.trim().match(/^\*?([a-zA-Z0-9:_-]+)\s*[-:]\s*(.+)$/);
    if (dashMatch) {
      return { name: dashMatch[1], description: dashMatch[2], visibility: ['full', 'quick'] };
    }
    return { name: cmd.replace(/^\*/, '') || 'unknown', description: 'No description', visibility: ['full', 'quick'] };
  }

  if (!cmd || typeof cmd !== 'object') return null;
  if (cmd.name) return cmd;

  const entries = Object.entries(cmd);
  if (entries.length !== 1) return null;

  const [name, value] = entries[0];
  if (!name) return null;

  if (value && typeof value === 'object') {
    return {
      name,
      description: value.description || value.summary || 'No description',
      visibility: value.visibility || ['full'],
    };
  }

  return {
    name,
    description: value === null || value === undefined ? 'No description' : String(value),
    visibility: ['full'],
  };
}

function formatCommandDescription(value) {
  if (value === null || value === undefined || value === '') return 'No description';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function buildWorkflowSection(yaml) {
  const items = [];

  if (yaml.mandatory_flow && Array.isArray(yaml.mandatory_flow)) {
    items.push('### Mandatory Flow\n\nExecute **strictly in this order**. No skips allowed.\n\n' +
      yaml.mandatory_flow.map((step, i) => `${i + 1}. ${renderItem(step)}`).join('\n') + '\n');
  }

  if (yaml.phase_release_rules && Array.isArray(yaml.phase_release_rules)) {
    items.push('### Phase Release Rules\n\n' + yaml.phase_release_rules.map(r => `- ${renderItem(r)}`).join('\n') + '\n');
  }

  if (yaml.activation_instructions && Array.isArray(yaml.activation_instructions)) {
    items.push('### Activation Instructions\n\n' + yaml.activation_instructions.map(i => `- ${renderItem(i)}`).join('\n') + '\n');
  }

  return items.length > 0 ? '## Workflow\n\n' + items.join('\n') + '\n' : '';
}

function buildGuardrailsSection(yaml) {
  const items = [];

  if (yaml.veto_conditions && Array.isArray(yaml.veto_conditions)) {
    items.push('### Veto Conditions\n\n' + yaml.veto_conditions.map(v => `- ❌ ${renderItem(v)}`).join('\n') + '\n');
  }

  if (yaml.agent_rules && Array.isArray(yaml.agent_rules)) {
    items.push('### Agent Rules\n\n' + yaml.agent_rules.map(r => `- ${renderItem(r)}`).join('\n') + '\n');
  }

  if (yaml.design_rules) {
    const dr = yaml.design_rules;
    let text = '### Design Rules\n\n';
    for (const [key, value] of Object.entries(dr)) {
      if (value !== null && typeof value === 'object' && value.rule) {
        text += `- **${key}:** ${value.rule}\n`;
      } else if (typeof value === 'string') {
        text += `- **${key}:** ${value}\n`;
      }
    }
    items.push(text + '\n');
  }

  return items.length > 0 ? '## Guardrails\n\n' + items.join('\n') + '\n' : '';
}

function buildHandoffsSection(yaml) {
  if (!yaml.handoffs || !Array.isArray(yaml.handoffs) || yaml.handoffs.length === 0) {
    return '';
  }

  const rows = yaml.handoffs.map(h => {
    const to = h.to || h.target || 'unknown';
    const when = h.when || h.condition || '';
    return `- **→ @${to}:** ${when}`;
  }).join('\n');

  return `## Handoffs\n\n${rows}\n\n`;
}

function buildOutputContractSection(yaml) {
  if (!yaml.output_contract && !yaml.output) return '';

  const oc = yaml.output_contract || yaml.output;
  let text = '## Output Contract\n\n';

  if (oc.required && Array.isArray(oc.required)) {
    text += '**Required deliverables:**\n\n' + oc.required.map(r => `- ${r}`).join('\n') + '\n\n';
  }

  if (oc.done_when && Array.isArray(oc.done_when)) {
    text += '**Done when:**\n\n' + oc.done_when.map(d => `- ✅ ${d}`).join('\n') + '\n\n';
  }

  return text;
}

function buildDescription(id, name, title, whenToUse) {
  let desc = whenToUse
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (desc.length > 300) {
    desc = desc.substring(0, 297) + '...';
  }

  const triggerPhrases = [
    `activate ${id}`,
    `switch to ${id}`,
    `@${id}`,
  ];

  return `Activate the AIOS ${title} agent (${name}). ${desc} Trigger when user asks to ${id}, or says '${triggerPhrases.join("', '")}'.`;
}

function buildRawContentSection(rawContent, id) {
  if (!rawContent || rawContent.length === 0) {
    return '> Agent definition not available.\n';
  }

  return sanitizeGeneratedMarkdown(rawContent);
}

function sanitizeGeneratedMarkdown(content) {
  return addLanguageToUntypedFences(content)
    .split('\n')
    .map(sanitizeBareStarCommands)
    .join('\n');
}

function sanitizeBareStarCommands(line) {
  return line
    .split(/(`[^`]*`)/g)
    .map(segment => {
      if (segment.startsWith('`') && segment.endsWith('`')) {
        return segment;
      }

      return segment.replace(
        /(^|[\s(,])\*([a-zA-Z0-9][a-zA-Z0-9:_-]*)(?=([\s,).;:]|$))/g,
        '$1`*$2`'
      );
    })
    .join('');
}

function addLanguageToUntypedFences(content) {
  let inFence = false;

  return content.split('\n').map((line) => {
    if (/^```[ \t]*$/.test(line)) {
      if (!inFence) {
        inFence = true;
        return '```text';
      }

      inFence = false;
      return '```';
    }

    if (/^```/.test(line)) {
      inFence = !inFence;
    }

    return line;
  }).join('\n');
}

// Normalize an array item that may be a string OR a YAML-parsed object.
// `- CRITICAL: text` parses to { CRITICAL: 'text' } and must render as
// `**CRITICAL:** text`, not `[object Object]`.
function renderItem(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);

  const entries = Object.entries(value);
  if (entries.length === 0) return '';

  return entries
    .map(([k, v]) => {
      const rendered = typeof v === 'string' ? v : JSON.stringify(v);
      return `**${k}:** ${rendered}`;
    })
    .join(' ');
}

function getPreferredActivationId(agentData) {
  const agent = agentData.agent || {};
  const preferred = agent.preferredActivationAlias || agent.preferred_activation_alias;
  return sanitizeSkillToken(preferred || agentData.id || 'agent');
}

function getSkillId(agentData) {
  const id = getPreferredActivationId(agentData);
  if (id.startsWith('aios-')) return id;
  return `aios-${id}`;
}

function getDirname(agentData) {
  return getSkillId(agentData);
}

function getFilename(_agentData) {
  return 'SKILL.md';
}

function sanitizeSkillToken(value) {
  const raw = String(value || '')
    .trim()
    .replace(/^@+/, '');
  const normalized = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const safe = normalized
    .replace(/[\\/]+/g, '-')
    .replace(/\.\.+/g, '-')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .toLowerCase();

  return safe || 'agent';
}

module.exports = {
  transform,
  getSkillId,
  getDirname,
  getFilename,
  format: 'kimi-skill',
};
