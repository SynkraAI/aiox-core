#!/usr/bin/env node
'use strict';

/**
 * Handoff Auto — UserPromptSubmit Hook
 *
 * Registered as SECOND entry in UserPromptSubmit hooks array.
 * Does NOT modify synapse-wrapper.cjs.
 *
 * Detects:
 * 1. Agent switch (@agent pattern) → Tier 1 micro-handoff save + Tier 2 agent_switch event
 * 2. Every 5 prompts → Tier 2 periodic snapshot
 *
 * CRITICAL: Errors here MUST NOT block SYNAPSE processing.
 * Timeout: 5000ms max.
 *
 * @module handoff-auto
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-1
 */

const path = require('path');
const fs = require('fs');

const TIMEOUT_MS = 5000;
const PERIODIC_INTERVAL = 5;

/** Agent switch regex: matches @agent-name patterns */
const AGENT_PATTERN = /@(dev|qa|architect|pm|po|sm|analyst|data-engineer|ux-design-expert|devops|aiox-master)\b/;

/**
 * Read JSON from stdin synchronously (Claude Code hook protocol).
 * @returns {object|null} Parsed input or null
 */
function readStdinSync() {
  try {
    const data = fs.readFileSync(0, 'utf8');
    return data ? JSON.parse(data) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Get or increment prompt count from a simple counter file.
 * @param {string} projectRoot - Project root directory
 * @returns {number} Current prompt count after increment
 */
function incrementPromptCount(projectRoot) {
  const counterPath = path.join(projectRoot, '.aiox', 'current-session', '.prompt-count');
  let count = 0;
  try {
    count = parseInt(fs.readFileSync(counterPath, 'utf8').trim(), 10) || 0;
  } catch (_) {
    // File doesn't exist yet
  }
  count++;
  try {
    const dir = path.dirname(counterPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(counterPath, String(count), 'utf8');
  } catch (_) {
    // Ignore write errors
  }
  return count;
}

/**
 * Detect agent switch from user prompt content.
 * @param {string} prompt - User prompt text
 * @returns {{ detected: boolean, agent: string|null }}
 */
function detectAgentSwitch(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return { detected: false, agent: null };
  }
  const match = prompt.match(AGENT_PATTERN);
  if (match) {
    return { detected: true, agent: match[1] };
  }
  return { detected: false, agent: null };
}

/**
 * Get the user prompt from hook input.
 * Claude Code sends different formats, handle both.
 * @param {object} input - Hook input
 * @returns {string} User prompt text
 */
function extractPrompt(input) {
  if (!input) return '';

  // Claude Code hook format: input.prompt or input.user_prompt or input.message
  if (typeof input.prompt === 'string') return input.prompt;
  if (typeof input.user_prompt === 'string') return input.user_prompt;
  if (typeof input.message === 'string') return input.message;

  // Try to find prompt in conversation array
  if (Array.isArray(input.messages)) {
    const last = input.messages[input.messages.length - 1];
    if (last && typeof last.content === 'string') return last.content;
  }

  return '';
}

/**
 * Main handler: detect agent switches and periodic snapshots.
 */
function main() {
  const input = readStdinSync();
  if (!input) return;

  const projectRoot = input.cwd || path.resolve(__dirname, '..', '..');
  const prompt = extractPrompt(input);

  // Increment prompt count
  const promptCount = incrementPromptCount(projectRoot);

  // 1. Detect agent switch
  const { detected, agent } = detectAgentSwitch(prompt);

  if (detected) {
    // Tier 1: Save micro-handoff
    try {
      const microHandoff = require(path.join(projectRoot, '.claude', 'lib', 'handoff', 'micro-handoff'));
      // We don't know the "from" agent in the hook; save with to_agent only
      // The actual from_agent gets populated by the agent's own handoff logic
      microHandoff.saveMicroHandoff('unknown', agent, {
        story_context: {
          story_id: '',
          story_path: '',
          story_status: '',
          current_task: '',
          branch: '',
        },
        next_action: `Agent switch to @${agent} detected`,
      }, projectRoot);
    } catch (_) {
      // Module not available -- skip silently
    }

    // Tier 2: Log agent_switch event
    try {
      const sessionState = require(path.join(projectRoot, '.claude', 'lib', 'handoff', 'session-state'));
      sessionState.updateSessionState('agent_switch', {
        agent: agent,
        details: `Agent switch to @${agent} detected in prompt`,
        prompt_count: promptCount,
      }, projectRoot);
    } catch (_) {
      // Module not available -- skip silently
    }
  }

  // 2. Periodic snapshot every PERIODIC_INTERVAL prompts
  if (promptCount > 0 && promptCount % PERIODIC_INTERVAL === 0) {
    try {
      const sessionState = require(path.join(projectRoot, '.claude', 'lib', 'handoff', 'session-state'));
      sessionState.updateSessionState('periodic', {
        prompt_count: promptCount,
      }, projectRoot);
    } catch (_) {
      // Module not available -- skip silently
    }
  }
}

/**
 * Entry point with timeout protection.
 */
function run() {
  const timer = setTimeout(() => {
    process.exit(0);
  }, TIMEOUT_MS);
  timer.unref();

  try {
    main();
  } catch (_) {
    // Silent exit -- never block SYNAPSE
  }

  clearTimeout(timer);
  process.exitCode = 0;
}

if (require.main === module) run();

module.exports = {
  readStdinSync,
  incrementPromptCount,
  detectAgentSwitch,
  extractPrompt,
  main,
  run,
  AGENT_PATTERN,
  PERIODIC_INTERVAL,
  TIMEOUT_MS,
};
