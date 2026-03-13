#!/usr/bin/env node
/**
 * Squad State Manager - Pipeline state for squad creation.
 * Adapted from MMOS state manager for squad-creator workflow.
 * @llm-context CLI tool for tracking squad creation pipeline progress.
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SQUADS_BASE = path.resolve(__dirname, '..', '..'); // squads/
const ACTIVE_SQUAD_PATH = path.join(SQUADS_BASE, '.active-squad');

const CONCURRENCY_THRESHOLD_MS = 5000; // --force bypasses this check

// Squad creation pipeline phases
const VALID_PHASES = [
  'init',
  'research',           // phase_0: Research sources
  'source_validation',  // phase_0_5: Validate sources
  'dna_extraction',     // phase_1: Extract DNA patterns
  'agent_scaffolding',  // phase_2: Create agent structure
  'task_anatomy',       // phase_3: Define tasks
  'quality_gate',       // phase_4: CHECKPOINT - Human approval
  'integration',        // phase_5: Integrate into squad
  'smoke_test',         // phase_6: Functional test
  'completed',
  'failed',
];

const VALID_STATUSES = [
  'pending',
  'in_progress',
  'checkpoint',    // Awaiting human approval
  'approved',
  'rejected',
  'completed',
];

// Agent mapping for each phase
const PHASE_AGENTS = {
  'research': 'oalanicolas',
  'source_validation': 'oalanicolas',
  'dna_extraction': 'oalanicolas',
  'agent_scaffolding': 'oalanicolas',
  'task_anatomy': 'pedro-valerio',
  'quality_gate': 'pedro-valerio',
  'integration': 'squad-chief',
  'smoke_test': 'squad-chief',
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function outputJson(data) {
  console.log(JSON.stringify(data));
}

function outputError(code, message, details = {}) {
  outputJson({
    success: false,
    error: { code, message, details },
  });
}

function getStatePath(slug) {
  return path.join(SQUADS_BASE, slug, 'metadata', 'state.json');
}

function readActiveSquad() {
  if (fs.existsSync(ACTIVE_SQUAD_PATH)) {
    return fs.readFileSync(ACTIVE_SQUAD_PATH, 'utf8').trim();
  }
  return null;
}

function writeActiveSquad(slug) {
  if (!fs.existsSync(SQUADS_BASE)) {
    fs.mkdirSync(SQUADS_BASE, { recursive: true });
  }
  fs.writeFileSync(ACTIVE_SQUAD_PATH, slug);
}

/**
 * Resolve slug: use provided slug or fallback to .active-squad.
 */
function resolveSlug(slug) {
  if (slug && !slug.startsWith('-')) return slug;
  return readActiveSquad();
}

function readState(slug) {
  const statePath = getStatePath(slug);
  if (fs.existsSync(statePath)) {
    try {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch {
      return { __corrupted: true };
    }
  }
  return null;
}

function writeState(slug, state) {
  const statePath = getStatePath(slug);
  const dir = path.dirname(statePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

/**
 * Check if state.json was modified recently (concurrency detection).
 */
function checkConcurrency(slug) {
  const statePath = getStatePath(slug);
  if (!fs.existsSync(statePath)) return false;
  const stat = fs.statSync(statePath);
  return (Date.now() - stat.mtimeMs) < CONCURRENCY_THRESHOLD_MS;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize a new squad pipeline state.
 */
function cmdInit(slug, options = {}) {
  const { name = null, sourceMind = null, targetDomain = null } = options;

  // Validate slug format (snake_case)
  if (!/^[a-z0-9]+(_[a-z0-9]+)*$/.test(slug)) {
    outputError('INVALID_SLUG', 'Slug must be snake_case', {
      received: slug,
      expected_pattern: '^[a-z0-9]+(_[a-z0-9]+)*$',
    });
    process.exit(1);
  }

  const now = new Date().toISOString();
  const displayName = name || slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Create or update state
  const existingState = readState(slug);
  const state = (existingState && !existingState.__corrupted) ? existingState : {
    slug,
    display_name: displayName,
    created_at: now,
    current_phase: 'init',
    checkpoint_status: 'pending',
    phases: {},
    completed_outputs: [],
    agent_history: [],
    metadata: {
      source_mind: sourceMind,
      target_domain: targetDomain,
    },
  };

  state.updated_at = now;
  state.current_phase = 'init';
  state.checkpoint_status = 'pending';
  if (name) state.display_name = displayName;
  if (sourceMind) state.metadata.source_mind = sourceMind;
  if (targetDomain) state.metadata.target_domain = targetDomain;

  writeState(slug, state);
  writeActiveSquad(slug);

  outputJson({
    success: true,
    slug,
    path: getStatePath(slug),
    display_name: state.display_name,
  });
}

/**
 * Update pipeline phase/status.
 */
function cmdUpdate(slug, phase, status, options = {}) {
  const { force = false, output = null } = options;

  // Validate phase
  if (!VALID_PHASES.includes(phase)) {
    outputError('INVALID_PHASE', `Invalid phase: ${phase}`, {
      received: phase,
      valid_phases: VALID_PHASES,
    });
    process.exit(1);
  }

  // Validate status
  if (status && !VALID_STATUSES.includes(status)) {
    outputError('INVALID_STATUS', `Invalid status: ${status}`, {
      received: status,
      valid_statuses: VALID_STATUSES,
    });
    process.exit(1);
  }

  // Read existing state
  const state = readState(slug);
  if (!state) {
    outputError('STATE_NOT_FOUND', `No state found for slug: ${slug}. Run init first.`);
    process.exit(1);
  }

  if (state.__corrupted) {
    outputError('CORRUPTED_STATE', `state.json for ${slug} is corrupted (invalid JSON)`);
    process.exit(1);
  }

  // Concurrency check
  if (checkConcurrency(slug) && !force) {
    console.error('WARNING: state.json modified in last 5s - possible concurrent access');
    console.error('Use --force to override');
    outputError('CONCURRENT_MODIFICATION', 'state.json was modified in the last 5 seconds', {
      hint: 'Use --force to override',
    });
    process.exit(1);
  }

  const now = new Date().toISOString();
  const previous = {
    current_phase: state.current_phase,
    checkpoint_status: state.checkpoint_status,
  };

  // Update phase tracking
  const resolvedStatus = status || 'in_progress';
  if (!state.phases) state.phases = {};
  state.phases[phase] = {
    status: resolvedStatus,
    started_at: state.phases[phase] ? state.phases[phase].started_at : now,
    agent: PHASE_AGENTS[phase] || null,
    ...(resolvedStatus === 'completed' ? { completed_at: now } : {}),
  };

  state.current_phase = phase;
  state.checkpoint_status = resolvedStatus;
  state.updated_at = now;

  // Track agent history
  if (PHASE_AGENTS[phase] && !state.agent_history.includes(PHASE_AGENTS[phase])) {
    state.agent_history.push(PHASE_AGENTS[phase]);
  }

  // Track completed outputs
  if (output && !state.completed_outputs.includes(output)) {
    state.completed_outputs.push(output);
  }

  writeState(slug, state);
  writeActiveSquad(slug);

  outputJson({
    success: true,
    slug,
    previous,
    current: {
      current_phase: phase,
      checkpoint_status: resolvedStatus,
      agent: PHASE_AGENTS[phase] || null,
    },
  });
}

/**
 * Get current state for a squad.
 */
function cmdGet(slug) {
  const resolvedSlug = resolveSlug(slug);
  if (!resolvedSlug) {
    outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file found', {
      hint: 'Run: node squad-state-manager.cjs init <slug>',
    });
    process.exit(1);
  }

  const state = readState(resolvedSlug);
  if (!state) {
    outputError('STATE_NOT_FOUND', `No state found for slug: ${resolvedSlug}`);
    process.exit(1);
  }

  if (state.__corrupted) {
    outputError('CORRUPTED_STATE', `state.json for ${resolvedSlug} is corrupted (invalid JSON)`, {
      path: getStatePath(resolvedSlug),
    });
    process.exit(1);
  }

  outputJson(state);
}

/**
 * List all squads with optional status filter.
 */
function cmdList(statusFilter) {
  if (!fs.existsSync(SQUADS_BASE)) {
    outputJson({ squads: [], count: 0, filter: statusFilter || 'all' });
    return;
  }

  const entries = fs.readdirSync(SQUADS_BASE, { withFileTypes: true });
  const squads = [];
  const activeSquad = readActiveSquad();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;

    const slug = entry.name;
    const state = readState(slug);
    if (!state || state.__corrupted) continue;

    const phase = state.current_phase || 'unknown';
    const status = state.checkpoint_status || 'unknown';
    const isActive = (status !== 'completed' && phase !== 'completed');

    // Apply filter
    if (statusFilter === 'active' && !isActive) continue;
    if (statusFilter === 'completed' && isActive) continue;

    squads.push({
      slug,
      display_name: state.display_name || slug,
      current_phase: phase,
      checkpoint_status: status,
      updated_at: state.updated_at || null,
      is_active_squad: slug === activeSquad,
      agent_history: state.agent_history || [],
    });
  }

  // Sort by updated_at descending
  squads.sort((a, b) => {
    if (!a.updated_at) return 1;
    if (!b.updated_at) return -1;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  outputJson({ squads, count: squads.length, filter: statusFilter || 'all' });
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

function parseArg(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`Squad State Manager - Pipeline state management for squad creation

Usage:
  node squad-state-manager.cjs init <slug> [options]     Initialize new squad
  node squad-state-manager.cjs update [slug] [options]   Update phase/status
  node squad-state-manager.cjs get [slug]                Read current state
  node squad-state-manager.cjs list [options]            List all squads

Init options:
  --name "Display Name"     Squad's display name (default: slug title-cased)
  --source-mind <slug>      Source mind for cloning (optional)
  --target-domain <domain>  Target domain/expertise (optional)

Update options:
  --phase <phase>           Pipeline phase (required)
  --status <status>         Checkpoint status (default: in_progress)
  --output <filename>       Register completed output file
  --force                   Bypass concurrency check

List options:
  --status active|completed|all   Filter by status (default: all)

Valid phases: ${VALID_PHASES.join(', ')}
Valid statuses: ${VALID_STATUSES.join(', ')}

Phase → Agent mapping:
  research, source_validation, dna_extraction, agent_scaffolding → oalanicolas
  task_anatomy, quality_gate → pedro-valerio
  integration, smoke_test → squad-chief

Canonical state path: squads/{slug}/metadata/state.json
Active squad file:    squads/.active-squad`);
    process.exit(0);
  }

  const command = args[0];
  const force = args.includes('--force');

  if (command === 'init') {
    const slug = args[1] && !args[1].startsWith('-') ? args[1] : null;
    if (!slug) {
      outputError('MISSING_ARG', 'Usage: init <slug> [--name "Name"] [--source-mind <slug>] [--target-domain <domain>]');
      process.exit(1);
    }
    const name = parseArg(args, '--name');
    const sourceMind = parseArg(args, '--source-mind');
    const targetDomain = parseArg(args, '--target-domain');
    cmdInit(slug, { name, sourceMind, targetDomain });

  } else if (command === 'update') {
    const slugArg = args[1] && !args[1].startsWith('-') ? args[1] : null;
    const slug = resolveSlug(slugArg);
    if (!slug) {
      outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file found');
      process.exit(1);
    }

    const phase = parseArg(args, '--phase');
    if (!phase) {
      outputError('MISSING_ARG', 'Usage: update [slug] --phase <phase> [--status <status>] [--output <file>] [--force]');
      process.exit(1);
    }

    const status = parseArg(args, '--status');
    const output = parseArg(args, '--output');
    cmdUpdate(slug, phase, status, { force, output });

  } else if (command === 'get') {
    const slug = args[1] && !args[1].startsWith('-') ? args[1] : null;
    cmdGet(slug);

  } else if (command === 'list') {
    const statusFilter = parseArg(args, '--status') || 'all';
    cmdList(statusFilter);

  } else {
    outputError('INVALID_COMMAND', `Unknown command: ${command}`, {
      valid_commands: ['init', 'update', 'get', 'list'],
    });
    process.exit(1);
  }
}

main();
