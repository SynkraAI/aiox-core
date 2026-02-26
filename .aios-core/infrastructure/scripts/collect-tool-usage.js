#!/usr/bin/env node
// =============================================================================
// collect-tool-usage.js — Tool Usage Analytics Collection
// =============================================================================
// Story: TOK-5 (Tool Usage Analytics Pipeline)
// Layer: L2 (.aios-core/infrastructure/scripts/)
// Purpose: Collect tool usage data per session, store in .aios/analytics/,
//          enforce data governance (sanitization, retention, schema).
//
// Usage:
//   node .aios-core/infrastructure/scripts/collect-tool-usage.js [options]
//
// Options:
//   --session-id <id>   Session identifier (default: auto-generated)
//   --dry-run           Show what would be stored without writing
//   --prune-only        Only run retention pruning, no new data
//   --json              Output results as JSON
//
// Data Governance:
//   - Minimum event schema enforced (AC 10)
//   - 30-day rolling window retention (AC 11)
//   - No user content or sensitive payloads — tool names and counts only (AC 12)
// =============================================================================

'use strict';

const fs = require('fs');
const path = require('path');

// --- Configuration ---
const ANALYTICS_DIR = path.resolve(process.cwd(), '.aios', 'analytics');
const USAGE_FILE = path.join(ANALYTICS_DIR, 'tool-usage.json');
const RETENTION_DAYS = 30;

// --- Minimum Event Schema (AC 10) ---
// tool_name, invocation_count, token_cost_input, token_cost_output, session_id, timestamp
function createEvent(toolName, invocationCount, tokenCostInput, tokenCostOutput, sessionId) {
  return {
    tool_name: String(toolName),
    invocation_count: Number(invocationCount) || 0,
    token_cost_input: Number(tokenCostInput) || 0,
    token_cost_output: Number(tokenCostOutput) || 0,
    session_id: String(sessionId),
    timestamp: new Date().toISOString()
  };
}

// --- Sanitization (AC 12) ---
// Only tool names and numeric counts. No user content, no payloads.
function sanitizeEvent(event) {
  return {
    tool_name: String(event.tool_name || '').replace(/[^a-zA-Z0-9_-]/g, ''),
    invocation_count: Math.max(0, Math.floor(Number(event.invocation_count) || 0)),
    token_cost_input: Math.max(0, Math.floor(Number(event.token_cost_input) || 0)),
    token_cost_output: Math.max(0, Math.floor(Number(event.token_cost_output) || 0)),
    session_id: String(event.session_id || '').replace(/[^a-zA-Z0-9_-]/g, ''),
    timestamp: event.timestamp || new Date().toISOString()
  };
}

// --- Validate event schema (AC 10) ---
function validateEvent(event) {
  const required = ['tool_name', 'invocation_count', 'token_cost_input', 'token_cost_output', 'session_id', 'timestamp'];
  const missing = required.filter(field => event[field] === undefined || event[field] === null || event[field] === '');
  if (missing.length > 0) {
    return { valid: false, errors: missing.map(f => `Missing required field: ${f}`) };
  }
  if (typeof event.invocation_count !== 'number' || event.invocation_count < 0) {
    return { valid: false, errors: ['invocation_count must be a non-negative number'] };
  }
  return { valid: true, errors: [] };
}

// --- Retention: 30-day rolling window (AC 11) ---
function pruneOldEntries(sessions) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffISO = cutoff.toISOString();

  const before = sessions.length;
  const pruned = sessions.filter(session => {
    // Keep sessions where at least one event is within retention window
    if (session.timestamp && session.timestamp >= cutoffISO) return true;
    if (session.events && session.events.length > 0) {
      return session.events.some(e => e.timestamp >= cutoffISO);
    }
    return false;
  });
  const removed = before - pruned.length;
  return { pruned, removed };
}

// --- Load existing data ---
function loadUsageData() {
  try {
    if (fs.existsSync(USAGE_FILE)) {
      const raw = fs.readFileSync(USAGE_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.sessions)) {
        return data;
      }
    }
  } catch {
    // Corrupted or missing — start fresh
  }
  return {
    version: '1.0.0',
    schema: 'tool-usage-analytics',
    description: 'Tool usage tracking data for AIOS token optimization (TOK-5)',
    sessions: []
  };
}

// --- Save data (AC 2) ---
function saveUsageData(data) {
  if (!fs.existsSync(ANALYTICS_DIR)) {
    fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
  }
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// --- Generate session ID ---
function generateSessionId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8);
  return `session-${dateStr}-${rand}`;
}

// --- Collect tool usage from stdin or manual input ---
// Accepts JSON array of {tool_name, invocation_count, token_cost_input, token_cost_output}
function collectFromStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
    // Timeout after 1 second if no stdin
    setTimeout(() => resolve(null), 1000);
  });
}

// --- Sample data generator (for testing/demo) ---
function generateSampleData(sessionId) {
  const tools = [
    { name: 'Read', inputCost: 200, outputCost: 100 },
    { name: 'Write', inputCost: 200, outputCost: 150 },
    { name: 'Edit', inputCost: 250, outputCost: 100 },
    { name: 'Bash', inputCost: 300, outputCost: 200 },
    { name: 'Grep', inputCost: 200, outputCost: 150 },
    { name: 'Glob', inputCost: 150, outputCost: 80 },
    { name: 'Task', inputCost: 400, outputCost: 300 },
    { name: 'git', inputCost: 100, outputCost: 50 },
    { name: 'coderabbit', inputCost: 300, outputCost: 200 },
    { name: 'context7', inputCost: 200, outputCost: 150 }
  ];

  return tools.map(t => {
    const count = Math.floor(Math.random() * 20) + 1;
    return createEvent(
      t.name,
      count,
      t.inputCost * count,
      t.outputCost * count,
      sessionId
    );
  });
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const pruneOnly = args.includes('--prune-only');
  const jsonOutput = args.includes('--json');
  const sampleMode = args.includes('--sample');
  const sessionIdIdx = args.indexOf('--session-id');
  const sessionId = sessionIdIdx >= 0 && args[sessionIdIdx + 1]
    ? args[sessionIdIdx + 1]
    : generateSessionId();

  // Load existing data
  const data = loadUsageData();

  // Prune old entries (AC 11)
  const { pruned, removed } = pruneOldEntries(data.sessions);
  data.sessions = pruned;

  if (pruneOnly) {
    if (!dryRun) {
      saveUsageData(data);
    }
    const result = { action: 'prune', removed, remaining: data.sessions.length, dryRun };
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`[TOK-5] Pruned ${removed} sessions older than ${RETENTION_DAYS} days. ${data.sessions.length} remaining.`);
      if (dryRun) console.log('[TOK-5] Dry run — no changes written.');
    }
    return;
  }

  // Collect events
  let events;
  if (sampleMode) {
    events = generateSampleData(sessionId);
  } else {
    const stdinData = await collectFromStdin();
    if (stdinData && Array.isArray(stdinData)) {
      events = stdinData.map(e => createEvent(
        e.tool_name,
        e.invocation_count,
        e.token_cost_input,
        e.token_cost_output,
        sessionId
      ));
    } else {
      // No stdin data — show usage
      if (!jsonOutput) {
        console.log('Usage: echo \'[{"tool_name":"Read","invocation_count":5,"token_cost_input":1000,"token_cost_output":500}]\' | node collect-tool-usage.js');
        console.log('       node collect-tool-usage.js --sample --session-id my-session');
        console.log('       node collect-tool-usage.js --prune-only');
      }
      if (removed > 0 && !dryRun) {
        saveUsageData(data);
        console.log(`[TOK-5] Pruned ${removed} old sessions during load.`);
      }
      return;
    }
  }

  // Sanitize and validate (AC 10, 12)
  const sanitized = events.map(sanitizeEvent);
  const validationResults = sanitized.map(e => ({ event: e, ...validateEvent(e) }));
  const invalid = validationResults.filter(r => !r.valid);
  const valid = validationResults.filter(r => r.valid).map(r => r.event);

  if (invalid.length > 0 && !jsonOutput) {
    console.warn(`[TOK-5] Warning: ${invalid.length} events failed validation and were skipped.`);
    invalid.forEach(r => console.warn(`  - ${r.event.tool_name}: ${r.errors.join(', ')}`));
  }

  // Create session entry
  const session = {
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    event_count: valid.length,
    total_invocations: valid.reduce((sum, e) => sum + e.invocation_count, 0),
    total_token_cost_input: valid.reduce((sum, e) => sum + e.token_cost_input, 0),
    total_token_cost_output: valid.reduce((sum, e) => sum + e.token_cost_output, 0),
    events: valid
  };

  data.sessions.push(session);

  // Save (AC 2)
  if (!dryRun) {
    saveUsageData(data);
  }

  // Output
  const result = {
    action: 'collect',
    session_id: sessionId,
    events_collected: valid.length,
    events_rejected: invalid.length,
    total_invocations: session.total_invocations,
    total_tokens: session.total_token_cost_input + session.total_token_cost_output,
    pruned_sessions: removed,
    total_sessions: data.sessions.length,
    dryRun
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`[TOK-5] Session ${sessionId}: ${valid.length} tools tracked, ${session.total_invocations} invocations, ${session.total_token_cost_input + session.total_token_cost_output} tokens total.`);
    if (removed > 0) console.log(`[TOK-5] Pruned ${removed} old sessions.`);
    if (dryRun) console.log('[TOK-5] Dry run — no changes written.');
    else console.log(`[TOK-5] Data saved to ${USAGE_FILE}`);
  }
}

// Run main only when executed directly (not when required as module)
if (require.main === module) {
  main().catch(err => {
    console.error('[TOK-5] Error:', err.message);
    process.exit(1);
  });
}

// --- Exports for testing ---
module.exports = {
  createEvent,
  sanitizeEvent,
  validateEvent,
  pruneOldEntries,
  loadUsageData,
  generateSampleData,
  RETENTION_DAYS
};
