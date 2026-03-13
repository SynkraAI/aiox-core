#!/usr/bin/env node
/**
 * Squad Context Loader
 * ====================
 * Loads squad pipeline context for agent wrappers.
 * Called as Step 1 in agent wrappers during squad creation.
 *
 * Usage:
 *   node squad-context-loader.cjs <agent_key> [slug]
 *
 * Output: JSON to stdout with pipeline context.
 * Errors: JSON with { "success": false, "error": { "code": "...", "message": "...", "details": {} } }
 *
 * Agent keys: oalanicolas, pedro-valerio, squad-chief
 * Slug detection: CLI arg > .active-squad > error
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SQUADS_BASE = path.resolve(__dirname, '..', '..'); // squads/
const ACTIVE_SQUAD_PATH = path.join(SQUADS_BASE, '.active-squad');

/**
 * Maps agent_key to { persona_name, role, phases, handoff_to }
 * phases: which pipeline phases this agent operates in
 * handoff_to: next agent in pipeline sequence
 */
const AGENT_MAP = {
  oalanicolas: {
    persona_name: 'Alan Nicolas',
    role: 'Mind Cloning Architect',
    phases: ['research', 'source_validation', 'dna_extraction', 'agent_scaffolding'],
    handoff_to: 'pedro-valerio',
    source: 'squads/squad-creator-pro/agents/oalanicolas.md',
  },
  'pedro-valerio': {
    persona_name: 'Pedro Valério',
    role: 'Process Absolutist',
    phases: ['task_anatomy', 'quality_gate'],
    handoff_to: 'squad-chief',
    source: 'squads/squad-creator-pro/agents/pedro-valerio.md',
  },
  'squad-chief': {
    persona_name: 'Squad Chief',
    role: 'Integration Orchestrator',
    phases: ['integration', 'smoke_test'],
    handoff_to: null,
    source: 'squads/squad-creator/agents/squad-chief.md',
  },
};

// Pipeline order for handoff_from calculation
const PIPELINE_ORDER = ['oalanicolas', 'pedro-valerio', 'squad-chief'];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function outputJson(data) {
  console.log(JSON.stringify(data));
}

function outputError(code, message, details = {}) {
  outputJson({ success: false, error: { code, message, details } });
}

function getStatePath(slug) {
  return path.join(SQUADS_BASE, slug, 'metadata', 'state.json');
}

function resolveSlug(cliSlug) {
  if (cliSlug && !cliSlug.startsWith('-')) return cliSlug;
  if (fs.existsSync(ACTIVE_SQUAD_PATH)) {
    return fs.readFileSync(ACTIVE_SQUAD_PATH, 'utf8').trim();
  }
  return null;
}

function scanCompletedOutputs(slug) {
  const squadDir = path.join(SQUADS_BASE, slug);
  const outputs = [];
  const scanDirs = ['sources', 'agents', 'tasks', 'templates', 'data'];

  for (const dir of scanDirs) {
    const dirPath = path.join(squadDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file.startsWith('.')) continue;
        outputs.push(`${dir}/${file}`);
      }
    } catch {
      // skip unreadable directories
    }
  }
  return outputs;
}

function getHandoffFrom(agentKey) {
  const idx = PIPELINE_ORDER.indexOf(agentKey);
  if (idx <= 0) return null;
  return PIPELINE_ORDER[idx - 1];
}

function getHandoffTo(agentKey) {
  const agent = AGENT_MAP[agentKey];
  return agent ? agent.handoff_to : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    process.stderr.write(`Squad Context Loader

Usage: node squad-context-loader.cjs <agent_key> [slug]

Agent keys: ${Object.keys(AGENT_MAP).join(', ')}

Slug detection: CLI arg > .active-squad > error
Output: JSON context to stdout
`);
    process.exit(0);
  }

  const agentKey = args[0];
  const cliSlug = args[1];

  // Validate agent key
  if (!AGENT_MAP[agentKey]) {
    outputError('INVALID_AGENT', `Invalid agent key: ${agentKey}`, {
      received: agentKey,
      valid_keys: Object.keys(AGENT_MAP),
    });
    process.exit(1);
  }

  // Resolve slug
  const slug = resolveSlug(cliSlug);
  if (!slug) {
    outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file found', {
      hint: 'Run: node squad-state-manager.cjs init <slug>',
    });
    process.exit(1);
  }

  // Read state.json
  const statePath = getStatePath(slug);
  if (!fs.existsSync(statePath)) {
    outputError('STATE_NOT_FOUND', `State file not found: ${statePath}`, {
      hint: `Run: node squad-state-manager.cjs init ${slug}`,
    });
    process.exit(1);
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    outputError('CORRUPTED_STATE', `Corrupted state.json for ${slug}`, {
      path: statePath,
      hint: 'Delete and re-init.',
    });
    process.exit(1);
  }

  // Build context
  const agent = AGENT_MAP[agentKey];
  const completedOutputs = state.completed_outputs || scanCompletedOutputs(slug);

  const context = {
    slug: state.slug || slug,
    display_name: state.display_name || slug,
    current_phase: state.current_phase || 'unknown',
    checkpoint_status: state.checkpoint_status || 'unknown',
    output_dir: `squads/${slug}/`,
    state_file: `squads/${slug}/metadata/state.json`,
    completed_outputs: completedOutputs,
    agent_history: state.agent_history || [],
    handoff_from: getHandoffFrom(agentKey),
    handoff_to: getHandoffTo(agentKey),
    metadata: state.metadata || {},
    agent: {
      key: agentKey,
      persona: agent.persona_name,
      role: agent.role,
      phases: agent.phases,
      source: agent.source,
    },
  };

  outputJson(context);
}

main();
