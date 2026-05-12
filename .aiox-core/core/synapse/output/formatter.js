/**
 * SYNAPSE Output Formatter
 *
 * Converts layer processor results into the <synapse-rules> XML block
 * that is injected into each user prompt. Enforces section ordering
 * per DESIGN doc section 14 and applies token budget truncation.
 *
 * @module core/synapse/output/formatter
 * @version 1.0.0
 * @created Story SYN-6 - SynapseEngine Orchestrator + Output Formatter
 */

const { estimateTokens } = require('../utils/tokens');

// ---------------------------------------------------------------------------
// Section ordering (DESIGN doc section 14)
// ---------------------------------------------------------------------------

/**
 * Ordered list of section identifiers matching layer outputs.
 * Sections are rendered in this order; null results are omitted.
 *
 * Truncation removes from the END of this array first (SUMMARY, then
 * KEYWORD, then SQUAD, etc.) to preserve highest-priority sections.
 */
const SECTION_ORDER = [
  'CONTEXT_BRACKET',
  'CONSTITUTION',
  'AGENT',
  'WORKFLOW',
  'TASK',
  'SQUAD',
  'KEYWORD',
  'MEMORY_HINTS',
  'STAR_COMMANDS',
  'DEVMODE',
  'SUMMARY',
];

/**
 * Map layer names to section identifiers.
 */
const LAYER_TO_SECTION = {
  constitution: 'CONSTITUTION',
  global: 'CONTEXT_BRACKET',   // global rules go into bracket section
  agent: 'AGENT',
  workflow: 'WORKFLOW',
  task: 'TASK',
  squad: 'SQUAD',
  keyword: 'KEYWORD',
  memory: 'MEMORY_HINTS',
  'star-command': 'STAR_COMMANDS',
};

// ---------------------------------------------------------------------------
// Section Formatters
// ---------------------------------------------------------------------------

/**
 * Format the CONTEXT BRACKET header section.
 *
 * @param {string} bracket - Current bracket name
 * @param {number} contextPercent - Remaining context %
 * @param {object[]} globalResults - Results from global/context layers
 * @returns {string}
 */
function formatContextBracket(bracket, contextPercent, globalResults) {
  const lines = [`[CONTEXT BRACKET]\nCONTEXT BRACKET: [${bracket}] (${contextPercent.toFixed(1)}% remaining)`];

  // Include global/context rules if present
  for (const result of globalResults) {
    if (result && result.rules && result.rules.length > 0) {
      lines.push(`[${bracket}] CONTEXT RULES:`);
      result.rules.forEach((rule, i) => {
        lines.push(`  ${i + 1}. ${rule}`);
      });
    }
  }

  return lines.join('\n');
}

/**
 * Format the CONSTITUTION section.
 *
 * @param {object} result - Layer result { rules, metadata }
 * @returns {string}
 */
function formatConstitution(result) {
  const lines = ['[CONSTITUTION] (NON-NEGOTIABLE)'];
  for (const rule of result.rules) {
    lines.push(`  ${rule}`);
  }
  return lines.join('\n');
}

/**
 * Format the AGENT section.
 *
 * @param {object} result - Layer result { rules, metadata }
 * @returns {string}
 */
function formatAgent(result) {
  const meta = result.metadata || {};
  const agentId = meta.agentId || meta.source || 'unknown';
  const domain = meta.domain || meta.source || '';
  const lines = [`[ACTIVE AGENT: @${agentId}]`];

  if (domain) {
    lines.push(`  DOMAIN: ${domain}`);
  }

  if (meta.authority && Array.isArray(meta.authority)) {
    lines.push('  AUTHORITY BOUNDARIES:');
    for (const auth of meta.authority) {
      lines.push(`    - ${auth}`);
    }
  }

  if (result.rules.length > 0) {
    lines.push('  RULES:');
    result.rules.forEach((rule, i) => {
      lines.push(`    ${i}. ${rule}`);
    });
  }

  return lines.join('\n');
}

/**
 * Format the WORKFLOW section.
 *
 * @param {object} result - Layer result { rules, metadata }
 * @returns {string}
 */
function formatWorkflow(result) {
  const meta = result.metadata || {};
  const workflowId = meta.workflowId || meta.source || 'unknown';
  const phase = meta.phase || '';
  const lines = [`[ACTIVE WORKFLOW: ${workflowId}]`];

  if (phase) {
    lines.push(`  PHASE: ${phase}`);
  }

  if (result.rules.length > 0) {
    lines.push('  RULES:');
    result.rules.forEach((rule, i) => {
      lines.push(`    ${i}. ${rule}`);
    });
  }

  return lines.join('\n');
}

/**
 * Format the TASK section.
 *
 * @param {object} result - Layer result { rules, metadata }
 * @returns {string}
 */
function formatTask(result) {
  const meta = result.metadata || {};
  const lines = ['[TASK CONTEXT]'];

  if (meta.taskId) {
    lines.push(`  Active Task: ${meta.taskId}`);
  }
  if (meta.storyId) {
    lines.push(`  Story: ${meta.storyId}`);
  }

  for (const rule of result.rules) {
    lines.push(`  ${rule}`);
  }

  return lines.join('\n');
}

/**
 * Format the SQUAD section.
 *
 * @param {object} result - Layer result { rules, metadata }
 * @returns {string}
 */
function formatSquad(result) {
  const meta = result.metadata || {};
  const squadName = meta.squadName || meta.source || 'unknown';
  const lines = [`[SQUAD: ${squadName}]`];

  for (const rule of result.rules) {
    lines.push(`  ${rule}`);
  }

  return lines.join('\n');
}

/**
 * Format the KEYWORD section.
 *
 * @param {object} result - Layer result { rules, metadata }
 * @returns {string}
 */
function formatKeyword(result) {
  const meta = result.metadata || {};
  const lines = ['[KEYWORD MATCHES]'];

  if (meta.matches && Array.isArray(meta.matches)) {
    for (const match of meta.matches) {
      lines.push(`  "${match.keyword}" matched ${match.domain} (${match.reason || 'keyword match'})`);
    }
  }

  for (const rule of result.rules) {
    lines.push(`  ${rule}`);
  }

  return lines.join('\n');
}

/**
 * Format the STAR-COMMANDS section.
 *
 * @param {object} result - Layer result { rules, metadata }
 * @returns {string}
 */
function formatStarCommands(result) {
  const meta = result.metadata || {};
  const command = meta.command || meta.source || 'unknown';
  const lines = [
    '[STAR-COMMANDS]',
    '============================================================',
    `[*${command}] COMMAND:`,
  ];

  result.rules.forEach((rule, i) => {
    lines.push(`  ${i}. ${rule}`);
  });

  lines.push('============================================================');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Memory Hints Section (SYN-10)
// ---------------------------------------------------------------------------

/**
 * Format the MEMORY HINTS section.
 *
 * Only included when hints array is non-empty.
 * Each hint displays source, relevance, and content.
 *
 * @param {object} result - Layer result { rules (hint objects), metadata }
 * @returns {string}
 */
function formatMemoryHints(result) {
  const lines = ['[MEMORY HINTS]'];

  for (const hint of result.rules) {
    const source = hint.source || 'memory';
    const relevance = typeof hint.relevance === 'number'
      ? `${(hint.relevance * 100).toFixed(0)}%`
      : '?%';
    const content = hint.content || '';
    lines.push(`  [${source}] (relevance: ${relevance}) ${content}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// DEVMODE Section (DESIGN doc section 13)
// ---------------------------------------------------------------------------

/**
 * Format the DEVMODE debug section.
 *
 * @param {string} bracket - Current bracket name
 * @param {number} contextPercent - Remaining context %
 * @param {object} session - Session state
 * @param {object} metrics - Pipeline metrics summary
 * @param {object[]} results - Layer results for domain analysis
 * @returns {string}
 */
function formatDevmode(bracket, contextPercent, session, metrics, results) {
  const lines = [
    '[DEVMODE STATUS]',
    '---',
    'SYNAPSE DEVMODE',
    '',
    `Bracket: [${bracket}] (${contextPercent.toFixed(1)}% remaining)`,
    '',
  ];

  // Layers loaded
  const loaded = Object.entries(metrics.per_layer || {})
    .filter(([, v]) => v.status === 'ok');
  if (loaded.length > 0) {
    lines.push('Layers Loaded:');
    for (const [name, info] of loaded) {
      const duration = info.duration != null ? `${info.duration}ms` : '?ms';
      lines.push(`  [L${info.layer != null ? info.layer : '?'}] ${name.toUpperCase()}: ${info.rules || 0} rules (${duration})`);
    }
    lines.push('');
  }

  // Layers skipped
  const skipped = Object.entries(metrics.per_layer || {})
    .filter(([, v]) => v.status === 'skipped');
  if (skipped.length > 0) {
    lines.push('Layers Skipped:');
    for (const [name, info] of skipped) {
      lines.push(`  [${name.toUpperCase()}] ${info.reason || 'Unknown reason'}`);
    }
    lines.push('');
  }

  // Session info
  if (session) {
    lines.push('Session:');
    if (session.id || session.sessionId) {
      lines.push(`  UUID: ${session.id || session.sessionId || 'unknown'}`);
    }
    if (session.active_agent) {
      lines.push(`  Agent: @${session.active_agent}`);
    }
    lines.push(`  Prompts: ${session.prompt_count || 0} | Last bracket: ${bracket}`);
    lines.push('');
  }

  // Pipeline metrics
  lines.push('Pipeline Metrics:');
  lines.push(`  Total: ${metrics.total_ms}ms | Layers: ${metrics.layers_loaded}/${metrics.layers_loaded + metrics.layers_skipped + metrics.layers_errored} | Rules: ${metrics.total_rules}`);

  // Available domains (not loaded) — based on results metadata
  const loadedDomains = new Set(results.map(r => (r.metadata && r.metadata.source) || '').filter(Boolean));
  if (loadedDomains.size > 0) {
    lines.push('');
    lines.push('Loaded Domains:');
    for (const domain of loadedDomains) {
      const result = results.find(r => r.metadata && r.metadata.source === domain);
      const ruleCount = result ? result.rules.length : 0;
      lines.push(`  [${domain.toUpperCase()}] (${ruleCount} rules)`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Summary Section
// ---------------------------------------------------------------------------

/**
 * Format the LOADED DOMAINS SUMMARY section.
 *
 * @param {object[]} results - All layer results
 * @param {object} metrics - Pipeline metrics summary
 * @returns {string}
 */
function formatSummary(results, _metrics) {
  const lines = ['[LOADED DOMAINS SUMMARY]', '  LOADED DOMAINS:'];

  for (const result of results) {
    if (!result || !result.rules || result.rules.length === 0) continue;
    const meta = result.metadata || {};
    const source = (meta.source || meta.domain || 'unknown').toUpperCase();
    const reason = meta.activationReason || meta.reason || 'active layer';
    lines.push(`    [${source}] ${reason} (${result.rules.length} rules)`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Token Budget Enforcement
// ---------------------------------------------------------------------------

/**
 * Enforce a token budget by removing sections from the end.
 *
 * Truncation order (last removed first): SUMMARY, KEYWORD, SQUAD,
 * STAR_COMMANDS, TASK, WORKFLOW. CONSTITUTION and AGENT are never removed.
 *
 * @param {string[]} sections - Ordered section strings
 * @param {string[]} sectionIds - Corresponding section identifiers
 * @param {number} tokenBudget - Max tokens allowed
 * @returns {string[]} Filtered sections within budget
 */
function enforceTokenBudget(sections, sectionIds, tokenBudget) {
  if (!tokenBudget || tokenBudget <= 0) {
    return sections;
  }

  // Sections that should never be removed
  const PROTECTED = new Set(['CONTEXT_BRACKET', 'CONSTITUTION', 'AGENT']);

  // Truncation priority: remove from end first
  const TRUNCATION_ORDER = [
    'SUMMARY',
    'KEYWORD',
    'MEMORY_HINTS',
    'SQUAD',
    'STAR_COMMANDS',
    'DEVMODE',
    'TASK',
    'WORKFLOW',
  ];

  const result = [...sections];
  const ids = [...sectionIds];

  let totalTokens = estimateTokens(result.join('\n\n'));

  if (totalTokens <= tokenBudget) {
    return result;
  }

  // Remove sections in truncation order
  for (const sectionToRemove of TRUNCATION_ORDER) {
    if (totalTokens <= tokenBudget) {
      break;
    }

    const idx = ids.indexOf(sectionToRemove);
    if (idx !== -1 && !PROTECTED.has(sectionToRemove)) {
      result.splice(idx, 1);
      ids.splice(idx, 1);
      totalTokens = estimateTokens(result.join('\n\n'));
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main Formatter
// ---------------------------------------------------------------------------

/**
 * Section formatter dispatch table.
 */
const SECTION_FORMATTERS = {
  CONSTITUTION: formatConstitution,
  AGENT: formatAgent,
  WORKFLOW: formatWorkflow,
  TASK: formatTask,
  SQUAD: formatSquad,
  KEYWORD: formatKeyword,
  MEMORY_HINTS: formatMemoryHints,
  STAR_COMMANDS: formatStarCommands,
};

/**
 * Format all layer results into the <synapse-rules> XML output.
 *
 * @param {object[]} results - Layer results array
 * @param {string} bracket - Current bracket name
 * @param {number} contextPercent - Remaining context percentage
 * @param {object} session - Session state
 * @param {boolean} devmode - Whether DEVMODE is enabled
 * @param {object} metrics - Pipeline metrics summary from PipelineMetrics.getSummary()
 * @param {number} tokenBudget - Max tokens for this bracket
 * @param {boolean} showHandoffWarning - Whether to include handoff warning
 * @returns {string} Formatted <synapse-rules> XML string
 */
function formatSynapseRules(results, bracket, contextPercent, session, devmode, metrics, tokenBudget, showHandoffWarning) {
  if (!results || results.length === 0) {
    return '';
  }

  // Categorize results by section
  const sectionResults = {};
  const globalResults = [];

  for (const result of results) {
    if (!result || !result.rules || result.rules.length === 0) {
      continue;
    }

    const meta = result.metadata || {};
    const layerName = meta.source || '';
    const section = LAYER_TO_SECTION[layerName];

    if (section === 'CONTEXT_BRACKET') {
      globalResults.push(result);
    } else if (section) {
      sectionResults[section] = result;
    } else {
      // Fallback: try to match by layer number
      const layerNum = meta.layer;
      if (layerNum === 0) sectionResults['CONSTITUTION'] = result;
      else if (layerNum === 1) globalResults.push(result);
      else if (layerNum === 2) sectionResults['AGENT'] = result;
      else if (layerNum === 3) sectionResults['WORKFLOW'] = result;
      else if (layerNum === 4) sectionResults['TASK'] = result;
      else if (layerNum === 5) sectionResults['SQUAD'] = result;
      else if (layerNum === 6) sectionResults['KEYWORD'] = result;
      else if (layerNum === 7) sectionResults['STAR_COMMANDS'] = result;
    }
  }

  // Build sections in order
  const sections = [];
  const sectionIds = [];

  // CONTEXT BRACKET — always first
  sections.push(formatContextBracket(bracket, contextPercent, globalResults));
  sectionIds.push('CONTEXT_BRACKET');

  // Remaining sections in order (skip CONTEXT_BRACKET since already added)
  for (const sectionId of SECTION_ORDER) {
    if (sectionId === 'CONTEXT_BRACKET') continue;
    if (sectionId === 'DEVMODE') continue;
    if (sectionId === 'SUMMARY') continue;

    const result = sectionResults[sectionId];
    if (!result) continue;

    const formatter = SECTION_FORMATTERS[sectionId];
    if (formatter) {
      sections.push(formatter(result));
      sectionIds.push(sectionId);
    }
  }

  // Handoff warning (CRITICAL bracket)
  if (showHandoffWarning) {
    sections.push('[HANDOFF WARNING]\n  Context is nearly exhausted. Consider starting a new session to preserve quality.');
    sectionIds.push('HANDOFF_WARNING');
  }

  // DEVMODE section (conditional)
  if (devmode && metrics) {
    sections.push(formatDevmode(bracket, contextPercent, session, metrics, results));
    sectionIds.push('DEVMODE');
  }

  // SUMMARY — always last
  if (results.length > 0) {
    sections.push(formatSummary(results, metrics || {}));
    sectionIds.push('SUMMARY');
  }

  // Token budget enforcement
  const finalSections = enforceTokenBudget(sections, sectionIds, tokenBudget);

  // Wrap in <synapse-rules> tags
  const body = finalSections.join('\n\n');
  return `<synapse-rules>\n\n${body}\n\n</synapse-rules>`;
}

module.exports = {
  formatSynapseRules,
  enforceTokenBudget,
  estimateTokens,
  SECTION_ORDER,
  LAYER_TO_SECTION,
};
