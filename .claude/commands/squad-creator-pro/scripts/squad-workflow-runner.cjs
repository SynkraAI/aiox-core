#!/usr/bin/env node
/**
 * Squad Workflow Runner
 * =====================
 * Orchestrates squad creation pipeline using workflow YAML and state manager.
 *
 * Usage:
 *   node squad-workflow-runner.cjs start <slug> [--name "Name"]
 *   node squad-workflow-runner.cjs resume [slug]
 *   node squad-workflow-runner.cjs next [slug] [--force]
 *   node squad-workflow-runner.cjs status [slug]
 *
 * Integrates with:
 *   - squad-state-manager.cjs (state persistence)
 *   - squad-context-loader.cjs (agent context)
 *   - create-squad.yaml (workflow definition)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SCRIPTS_DIR = __dirname;
const SQUADS_BASE = path.resolve(SCRIPTS_DIR, '..', '..');
const ACTIVE_SQUAD_PATH = path.join(SQUADS_BASE, '.active-squad');
const STATE_MANAGER = path.join(SCRIPTS_DIR, 'squad-state-manager.cjs');

// Pipeline phases in order
const PIPELINE_PHASES = [
  { id: 'init', agent: null, human_checkpoint: false },
  { id: 'research', agent: 'oalanicolas', human_checkpoint: false },
  { id: 'source_validation', agent: 'oalanicolas', human_checkpoint: false },
  { id: 'dna_extraction', agent: 'oalanicolas', human_checkpoint: false },
  { id: 'agent_scaffolding', agent: 'oalanicolas', human_checkpoint: false },
  { id: 'task_anatomy', agent: 'pedro-valerio', human_checkpoint: false },
  { id: 'quality_gate', agent: 'pedro-valerio', human_checkpoint: true },
  { id: 'integration', agent: 'squad-chief', human_checkpoint: false },
  { id: 'smoke_test', agent: 'squad-chief', human_checkpoint: false },
  { id: 'completed', agent: null, human_checkpoint: false },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function outputJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

function outputError(code, message, details = {}) {
  outputJson({ success: false, error: { code, message, details } });
}

function runStateManager(args) {
  try {
    const result = execSync(`node "${STATE_MANAGER}" ${args}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(result.trim());
  } catch (err) {
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout.trim());
      } catch {
        return { success: false, error: { message: err.message } };
      }
    }
    return { success: false, error: { message: err.message } };
  }
}

function resolveSlug(cliSlug) {
  if (cliSlug && !cliSlug.startsWith('-')) return cliSlug;
  if (fs.existsSync(ACTIVE_SQUAD_PATH)) {
    return fs.readFileSync(ACTIVE_SQUAD_PATH, 'utf8').trim();
  }
  return null;
}

function getPhaseIndex(phaseId) {
  return PIPELINE_PHASES.findIndex(p => p.id === phaseId);
}

function getNextPhase(currentPhase) {
  const idx = getPhaseIndex(currentPhase);
  if (idx === -1 || idx >= PIPELINE_PHASES.length - 1) return null;
  return PIPELINE_PHASES[idx + 1];
}

function getCurrentPhaseInfo(phaseId) {
  return PIPELINE_PHASES.find(p => p.id === phaseId);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Start a new squad creation pipeline.
 */
function cmdStart(slug, options = {}) {
  const { name = null } = options;

  // Initialize state
  let initArgs = `init ${slug}`;
  if (name) initArgs += ` --name "${name}"`;

  const initResult = runStateManager(initArgs);
  if (!initResult.success && initResult.error) {
    outputError('INIT_FAILED', 'Failed to initialize squad', initResult.error);
    process.exit(1);
  }

  // Move to first real phase (research)
  // Use --force since we just created the state (concurrency check would fail)
  const updateResult = runStateManager(`update ${slug} --phase research --status in_progress --force`);
  if (!updateResult.success && updateResult.error) {
    outputError('UPDATE_FAILED', 'Failed to advance to research phase', updateResult.error);
    process.exit(1);
  }

  outputJson({
    success: true,
    action: 'start',
    slug,
    display_name: initResult.display_name || slug,
    current_phase: 'research',
    status: 'in_progress',
    next_step: {
      agent: 'oalanicolas',
      task: 'Research sources for the squad',
      command: `Use @oalanicolas to research sources for ${slug}`,
    },
  });
}

/**
 * Advance to the next phase in the pipeline.
 */
function cmdNext(slug, options = {}) {
  const { force = false } = options;

  // Get current state
  const state = runStateManager(`get ${slug}`);
  if (state.error) {
    outputError('STATE_NOT_FOUND', `No state found for ${slug}`, state.error);
    process.exit(1);
  }

  const currentPhase = state.current_phase;
  const currentStatus = state.checkpoint_status;

  // Check if current phase is complete
  if (currentStatus !== 'completed' && currentStatus !== 'approved' && !force) {
    outputError('PHASE_NOT_COMPLETE', `Current phase "${currentPhase}" is not complete`, {
      current_status: currentStatus,
      hint: 'Complete the current phase first, or use --force to skip',
    });
    process.exit(1);
  }

  // Get next phase
  const nextPhase = getNextPhase(currentPhase);
  if (!nextPhase) {
    outputJson({
      success: true,
      action: 'next',
      slug,
      message: 'Pipeline already completed',
      current_phase: currentPhase,
    });
    return;
  }

  // Check for human checkpoint
  if (nextPhase.human_checkpoint) {
    const updateResult = runStateManager(`update ${slug} --phase ${nextPhase.id} --status checkpoint`);
    outputJson({
      success: true,
      action: 'next',
      slug,
      current_phase: nextPhase.id,
      status: 'checkpoint',
      human_checkpoint: true,
      message: `⏸️  HUMAN CHECKPOINT: ${nextPhase.id}`,
      instructions: {
        agent: nextPhase.agent,
        action: 'Review and approve/revise/abort',
        approve: `node squad-workflow-runner.cjs approve ${slug}`,
        revise: `node squad-workflow-runner.cjs revise ${slug} --to task_anatomy`,
        abort: `node squad-workflow-runner.cjs abort ${slug}`,
      },
    });
    return;
  }

  // Advance to next phase
  const updateResult = runStateManager(`update ${slug} --phase ${nextPhase.id} --status in_progress`);

  outputJson({
    success: true,
    action: 'next',
    slug,
    previous_phase: currentPhase,
    current_phase: nextPhase.id,
    status: 'in_progress',
    agent: nextPhase.agent,
    next_step: nextPhase.agent
      ? { agent: nextPhase.agent, task: `Execute ${nextPhase.id} phase` }
      : { message: 'Pipeline completed' },
  });
}

/**
 * Resume pipeline from current state.
 */
function cmdResume(slug) {
  const state = runStateManager(`get ${slug}`);
  if (state.error) {
    outputError('STATE_NOT_FOUND', `No state found for ${slug}`, state.error);
    process.exit(1);
  }

  const currentPhase = state.current_phase;
  const currentStatus = state.checkpoint_status;
  const phaseInfo = getCurrentPhaseInfo(currentPhase);

  outputJson({
    success: true,
    action: 'resume',
    slug,
    display_name: state.display_name,
    current_phase: currentPhase,
    status: currentStatus,
    agent: phaseInfo ? phaseInfo.agent : null,
    human_checkpoint: phaseInfo ? phaseInfo.human_checkpoint : false,
    completed_outputs: state.completed_outputs || [],
    agent_history: state.agent_history || [],
    next_step: currentStatus === 'checkpoint'
      ? { message: 'Awaiting human decision (approve/revise/abort)' }
      : phaseInfo && phaseInfo.agent
        ? { agent: phaseInfo.agent, task: `Continue ${currentPhase} phase` }
        : { message: 'Ready to advance to next phase' },
  });
}

/**
 * Show pipeline status.
 */
function cmdStatus(slug) {
  const state = runStateManager(`get ${slug}`);
  if (state.error) {
    outputError('STATE_NOT_FOUND', `No state found for ${slug}`, state.error);
    process.exit(1);
  }

  const currentPhaseIdx = getPhaseIndex(state.current_phase);

  const phases = PIPELINE_PHASES.map((phase, idx) => {
    let status = 'pending';
    if (idx < currentPhaseIdx) status = 'completed';
    else if (idx === currentPhaseIdx) status = state.checkpoint_status;

    return {
      id: phase.id,
      agent: phase.agent,
      status,
      human_checkpoint: phase.human_checkpoint,
      current: idx === currentPhaseIdx,
    };
  });

  const progress = Math.round((currentPhaseIdx / (PIPELINE_PHASES.length - 1)) * 100);

  outputJson({
    success: true,
    action: 'status',
    slug,
    display_name: state.display_name,
    progress: `${progress}%`,
    current_phase: state.current_phase,
    checkpoint_status: state.checkpoint_status,
    phases,
    agent_history: state.agent_history || [],
    completed_outputs: state.completed_outputs || [],
    created_at: state.created_at,
    updated_at: state.updated_at,
  });
}

/**
 * Approve human checkpoint and continue.
 */
function cmdApprove(slug) {
  const state = runStateManager(`get ${slug}`);
  if (state.error) {
    outputError('STATE_NOT_FOUND', `No state found for ${slug}`, state.error);
    process.exit(1);
  }

  if (state.checkpoint_status !== 'checkpoint') {
    outputError('NOT_AT_CHECKPOINT', 'Not at a human checkpoint', {
      current_phase: state.current_phase,
      current_status: state.checkpoint_status,
    });
    process.exit(1);
  }

  // Mark current phase as approved
  runStateManager(`update ${slug} --phase ${state.current_phase} --status approved`);

  // Advance to next phase
  cmdNext(slug, { force: true });
}

/**
 * Revise: go back to a previous phase.
 */
function cmdRevise(slug, targetPhase) {
  if (!targetPhase) {
    outputError('MISSING_TARGET', 'Specify target phase with --to <phase>');
    process.exit(1);
  }

  const phaseInfo = getCurrentPhaseInfo(targetPhase);
  if (!phaseInfo) {
    outputError('INVALID_PHASE', `Invalid phase: ${targetPhase}`, {
      valid_phases: PIPELINE_PHASES.map(p => p.id),
    });
    process.exit(1);
  }

  runStateManager(`update ${slug} --phase ${targetPhase} --status in_progress`);

  outputJson({
    success: true,
    action: 'revise',
    slug,
    target_phase: targetPhase,
    status: 'in_progress',
    agent: phaseInfo.agent,
    message: `Returned to ${targetPhase} for revision`,
  });
}

/**
 * Abort the pipeline.
 */
function cmdAbort(slug, reason = 'Aborted by user') {
  runStateManager(`update ${slug} --phase failed --status completed`);

  outputJson({
    success: true,
    action: 'abort',
    slug,
    status: 'failed',
    reason,
  });
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
    console.log(`Squad Workflow Runner - Pipeline orchestration for squad creation

Usage:
  node squad-workflow-runner.cjs start <slug> [--name "Name"]   Start new pipeline
  node squad-workflow-runner.cjs resume [slug]                  Resume from current state
  node squad-workflow-runner.cjs next [slug] [--force]          Advance to next phase
  node squad-workflow-runner.cjs status [slug]                  Show pipeline status
  node squad-workflow-runner.cjs approve [slug]                 Approve human checkpoint
  node squad-workflow-runner.cjs revise [slug] --to <phase>     Go back to phase
  node squad-workflow-runner.cjs abort [slug]                   Abort pipeline

Pipeline phases:
  init → research → source_validation → dna_extraction → agent_scaffolding →
  task_anatomy → quality_gate (CHECKPOINT) → integration → smoke_test → completed

Agents:
  oalanicolas:   research, source_validation, dna_extraction, agent_scaffolding
  pedro-valerio: task_anatomy, quality_gate
  squad-chief:   integration, smoke_test`);
    process.exit(0);
  }

  const command = args[0];
  const force = args.includes('--force');

  if (command === 'start') {
    const slug = args[1] && !args[1].startsWith('-') ? args[1] : null;
    if (!slug) {
      outputError('MISSING_SLUG', 'Usage: start <slug> [--name "Name"]');
      process.exit(1);
    }
    const name = parseArg(args, '--name');
    cmdStart(slug, { name });

  } else if (command === 'resume') {
    const slug = resolveSlug(args[1]);
    if (!slug) {
      outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file');
      process.exit(1);
    }
    cmdResume(slug);

  } else if (command === 'next') {
    const slug = resolveSlug(args[1]);
    if (!slug) {
      outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file');
      process.exit(1);
    }
    cmdNext(slug, { force });

  } else if (command === 'status') {
    const slug = resolveSlug(args[1]);
    if (!slug) {
      outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file');
      process.exit(1);
    }
    cmdStatus(slug);

  } else if (command === 'approve') {
    const slug = resolveSlug(args[1]);
    if (!slug) {
      outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file');
      process.exit(1);
    }
    cmdApprove(slug);

  } else if (command === 'revise') {
    const slug = resolveSlug(args[1]);
    if (!slug) {
      outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file');
      process.exit(1);
    }
    const targetPhase = parseArg(args, '--to');
    cmdRevise(slug, targetPhase);

  } else if (command === 'abort') {
    const slug = resolveSlug(args[1]);
    if (!slug) {
      outputError('NO_ACTIVE_SQUAD', 'No slug provided and no .active-squad file');
      process.exit(1);
    }
    cmdAbort(slug);

  } else {
    outputError('INVALID_COMMAND', `Unknown command: ${command}`, {
      valid_commands: ['start', 'resume', 'next', 'status', 'approve', 'revise', 'abort'],
    });
    process.exit(1);
  }
}

main();
