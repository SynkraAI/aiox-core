'use strict';

/**
 * Agent Immortality Protocol
 *
 * Deterministic resilience primitives for turning fatal agent failures into
 * compact recovery context for the next execution attempt.
 *
 * @module core/resilience/agent-immortality
 * @created Story 482.1 - Agent Immortality Phase 1
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

const SCHEMA_VERSION = 'aiox-agent-immortality-v1';

const CauseOfDeath = Object.freeze({
  CONTEXT_OVERFLOW: 'CONTEXT_OVERFLOW',
  TOOL_EXECUTION_FAILURE: 'TOOL_EXECUTION_FAILURE',
  RECURSIVE_LOOP: 'RECURSIVE_LOOP',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  UNKNOWN: 'UNKNOWN',
});

const QueueStatus = Object.freeze({
  QUEUED: 'queued',
  CLAIMED: 'claimed',
  COMPLETED: 'completed',
});

const Events = Object.freeze({
  AUTOPSY_RECORDED: 'autopsy-recorded',
  REINCARNATION_ENQUEUED: 'reincarnation-enqueued',
  REINCARNATION_CLAIMED: 'reincarnation-claimed',
  STATE_COMMITTED: 'state-committed',
  EVOLUTION_RECORDED: 'evolution-recorded',
});

const DEFAULT_CONFIG = Object.freeze({
  dataDir: '.aiox/immortality',
  autopsyFile: 'autopsies.json',
  queueFile: 'reincarnation-queue.json',
  stateCommitFile: 'state-commits.json',
  evolutionFile: 'evolution-log.json',
  memoryTailSize: 2,
  maxTraceChars: 2000,
  maxLegacyChars: 2400,
  lockRetryAttempts: 80,
  lockRetryMs: 10,
  lockStaleMs: 30000,
});

function nextId(prefix) {
  const randomId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : crypto.randomBytes(4).toString('hex');
  return `${prefix}-${Date.now().toString(36)}-${process.pid.toString(36)}-${randomId}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonArray(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    quarantineJsonFile(filePath);
    return [];
  }
}

function writeJsonAtomic(filePath, value) {
  ensureDir(path.dirname(filePath));
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmpPath, filePath);
}

function quarantineJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    fs.renameSync(filePath, `${filePath}.corrupt-${Date.now()}-${process.pid}`);
  } catch {
    // Best-effort: resilience capture should continue even if quarantine fails.
  }
}

function sleepSync(ms) {
  if (ms <= 0) return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeStaleLock(lockPath, staleMs) {
  try {
    const stat = fs.statSync(lockPath);
    if (Date.now() - stat.mtimeMs > staleMs) {
      fs.unlinkSync(lockPath);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function acquireFileLock(filePath, options = {}) {
  ensureDir(path.dirname(filePath));
  const lockPath = `${filePath}.lock`;
  const attempts = options.lockRetryAttempts ?? DEFAULT_CONFIG.lockRetryAttempts;
  const retryMs = options.lockRetryMs ?? DEFAULT_CONFIG.lockRetryMs;
  const staleMs = options.lockStaleMs ?? DEFAULT_CONFIG.lockStaleMs;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const fd = fs.openSync(lockPath, 'wx');
      fs.writeFileSync(fd, `${process.pid}\n${new Date().toISOString()}\n`);
      return { fd, lockPath };
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      removeStaleLock(lockPath, staleMs);
      sleepSync(retryMs);
    }
  }

  throw new Error(`Failed to acquire lock for ${filePath}`);
}

function releaseFileLock(lock) {
  try {
    fs.closeSync(lock.fd);
  } catch {
    // Ignore close errors; unlink is the important cleanup.
  }
  try {
    fs.unlinkSync(lock.lockPath);
  } catch {
    // Another recovery path may have removed a stale lock first.
  }
}

function withFileLock(filePath, options, operation) {
  const lock = acquireFileLock(filePath, options);
  try {
    return operation();
  } finally {
    releaseFileLock(lock);
  }
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

function truncate(value, maxChars) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n[truncated:${text.length - maxChars}]`;
}

function normalizeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message || 'Unknown error',
      stack: error.stack || error.message || '',
    };
  }

  if (error && typeof error === 'object') {
    return {
      name: error.name || 'Error',
      message: error.message || JSON.stringify(error),
      stack: error.stack || error.trace || JSON.stringify(error, null, 2),
    };
  }

  return {
    name: 'Error',
    message: String(error || 'Unknown error'),
    stack: String(error || 'Unknown error'),
  };
}

// Ordering is intentional: text aggregates name, message and stack, so keyword
// overlap is common. Keep overflow and recursion checks before tool/API checks;
// the text is lowercased, so errno fragments such as enoent/econn stay lowercase.
function diagnoseCause(error) {
  const normalized = normalizeError(error);
  const text = `${normalized.name} ${normalized.message} ${normalized.stack}`.toLowerCase();

  if (/\b(context|token|window|length|too large|max tokens|overflow)\b/.test(text)) {
    return CauseOfDeath.CONTEXT_OVERFLOW;
  }
  if (/\b(recursive|recursion|loop|same action|repeated action|maximum call stack)\b/.test(text)) {
    return CauseOfDeath.RECURSIVE_LOOP;
  }
  if (/\b(tool|function call|schema|invalid arguments|command failed|spawn|enoent)\b/.test(text)) {
    return CauseOfDeath.TOOL_EXECUTION_FAILURE;
  }
  if (/\b(api|network|auth|unauthorized|forbidden|timeout|econn|http|rate limit)\b/.test(text)) {
    return CauseOfDeath.EXTERNAL_API_ERROR;
  }

  return CauseOfDeath.UNKNOWN;
}

function normalizeState(state = {}) {
  if (!state || typeof state !== 'object') {
    return {
      id: 'unknown-agent',
      name: 'unknown',
      workingMemory: [],
      criticalVariables: {},
      lastGoal: '',
    };
  }

  return {
    id: state.id || state.agentId || 'unknown-agent',
    name: state.name || state.agentName || state.id || 'unknown',
    workingMemory: Array.isArray(state.workingMemory) ? state.workingMemory : [],
    criticalVariables: state.criticalVariables && typeof state.criticalVariables === 'object'
      ? state.criticalVariables
      : {},
    lastGoal: state.lastGoal || state.goal || '',
    lastSuccessfulStep: state.lastSuccessfulStep || state.lastCheckpoint || '',
    currentAction: state.currentAction || state.current_action || state.action || '',
    suggestedPivot: state.suggestedPivot || state.suggested_pivot || '',
    diff: state.diff || state.delta || state.lastDiff || null,
  };
}

function buildLegacy(state, cause, options = {}) {
  const normalized = normalizeState(state);
  const tailSize = options.memoryTailSize ?? DEFAULT_CONFIG.memoryTailSize;
  const memoryTail = normalized.workingMemory.slice(Math.max(0, normalized.workingMemory.length - tailSize));
  const omittedMemoryItems = Math.max(0, normalized.workingMemory.length - memoryTail.length);

  const legacy = {
    goal: normalized.lastGoal,
    lastSuccessfulStep: normalized.lastSuccessfulStep,
    currentAction: normalized.currentAction,
    criticalVariables: cloneValue(normalized.criticalVariables),
    memoryTail: cloneValue(memoryTail),
    omittedMemoryItems,
    diff: cloneValue(normalized.diff),
    cause,
  };

  const summary = [
    `Last goal: ${legacy.goal || 'unknown'}`,
    `Last successful step: ${legacy.lastSuccessfulStep || 'unknown'}`,
    `Current action: ${legacy.currentAction || 'unknown'}`,
    `Critical variables: ${Object.keys(legacy.criticalVariables || {}).join(', ') || 'none'}`,
    `Omitted memory items: ${legacy.omittedMemoryItems}`,
    `Memory tail: ${truncate(legacy.memoryTail, options.maxLegacyChars ?? DEFAULT_CONFIG.maxLegacyChars)}`,
    legacy.diff ? `Delta: ${truncate(legacy.diff, options.maxLegacyChars ?? DEFAULT_CONFIG.maxLegacyChars)}` : '',
  ].filter(Boolean).join('\n');

  return {
    legacy,
    summary: truncate(summary, options.maxLegacyChars ?? DEFAULT_CONFIG.maxLegacyChars),
  };
}

function suggestPivot(cause, state) {
  const normalized = normalizeState(state);
  if (normalized.suggestedPivot) return normalized.suggestedPivot;

  switch (cause) {
    case CauseOfDeath.CONTEXT_OVERFLOW:
      return 'Resume from a compact checkpoint and keep only the last successful step in active context.';
    case CauseOfDeath.TOOL_EXECUTION_FAILURE:
      return 'Validate the tool schema and try an alternate tool or a dry-run before retrying.';
    case CauseOfDeath.RECURSIVE_LOOP:
      return 'Change strategy before retrying the same action.';
    case CauseOfDeath.EXTERNAL_API_ERROR:
      return 'Verify credentials/network state and use an offline fallback when possible.';
    default:
      return 'Inspect the autopsy report before choosing the next action.';
  }
}

function generateDirectives(cause, error, state = {}) {
  const normalizedError = normalizeError(error);
  const normalizedState = normalizeState(state);
  const directives = [];

  if (normalizedState.currentAction) {
    directives.push(`Do not immediately repeat action: ${normalizedState.currentAction}`);
  }

  switch (cause) {
    case CauseOfDeath.CONTEXT_OVERFLOW:
      directives.push('Use the compressed legacy summary; do not rehydrate the full previous context.');
      directives.push('Summarize any large memory block before adding it to active context.');
      break;
    case CauseOfDeath.TOOL_EXECUTION_FAILURE:
      directives.push('Validate tool parameters against the schema before retrying.');
      directives.push(`Treat the previous tool failure as toxic until parameters change: ${truncate(normalizedError.message, 160)}`);
      break;
    case CauseOfDeath.RECURSIVE_LOOP:
      directives.push('Check execution history before repeating an action.');
      directives.push('After two similar failures, pivot strategy or escalate.');
      break;
    case CauseOfDeath.EXTERNAL_API_ERROR:
      directives.push('Check credentials, rate limits and network availability before retrying.');
      directives.push('Prefer a cached/offline fallback if the external dependency is unstable.');
      break;
    default:
      directives.push('Read the autopsy report and proceed with an explicit recovery plan.');
  }

  return [...new Set(directives)];
}

function buildReincarnationContext(report) {
  return [
    '[AIOX REINCARNATION CONTEXT]',
    `Previous agent: ${report.deceasedAgentId}`,
    `Cause of death: ${report.cause}`,
    `Report id: ${report.id}`,
    '',
    'Prevention directives:',
    ...report.preventionDirectives.map((directive, index) => `${index + 1}. ${directive}`),
    '',
    'Immunity token:',
    `- forbidden_action: ${report.immunityToken.forbiddenAction || 'none'}`,
    `- suggested_pivot: ${report.immunityToken.suggestedPivot}`,
    '',
    'Legacy summary:',
    report.legacySummary,
  ].join('\n');
}

class StateCommitLog {
  constructor(projectRoot = process.cwd(), options = {}) {
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.filePath = path.join(this.projectRoot, this.config.dataDir, this.config.stateCommitFile);
  }

  commitDelta(agentId, delta = {}, metadata = {}) {
    return withFileLock(this.filePath, this.config, () => {
      const commits = this.list();
      const previous = commits.findLast(commit => commit.agentId === agentId);
      const commit = {
        id: nextId('state'),
        schemaVersion: SCHEMA_VERSION,
        agentId,
        previousId: previous?.id || null,
        timestamp: new Date().toISOString(),
        delta: cloneValue(delta || {}),
        metadata: cloneValue(metadata || {}),
      };

      commits.push(commit);
      writeJsonAtomic(this.filePath, commits);
      return cloneValue(commit);
    });
  }

  list(agentId = null) {
    const commits = readJsonArray(this.filePath);
    return agentId ? commits.filter(commit => commit.agentId === agentId) : commits;
  }

  latest(agentId) {
    return this.list(agentId).at(-1) || null;
  }
}

class EvolutionLog {
  constructor(projectRoot = process.cwd(), options = {}) {
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.filePath = path.join(this.projectRoot, this.config.dataDir, this.config.evolutionFile);
  }

  record(report) {
    return withFileLock(this.filePath, this.config, () => {
      const events = this.list();
      const event = {
        id: nextId('evolution'),
        schemaVersion: SCHEMA_VERSION,
        reportId: report.id,
        agentId: report.deceasedAgentId,
        timestamp: new Date().toISOString(),
        cause: report.cause,
        forbiddenAction: report.immunityToken?.forbiddenAction || '',
        suggestedPivot: report.immunityToken?.suggestedPivot || '',
        directives: cloneValue(report.preventionDirectives || []),
      };

      events.push(event);
      writeJsonAtomic(this.filePath, events);
      return {
        event: cloneValue(event),
        patterns: this.getPatterns(events),
        toxicActions: this.getToxicActions(events),
      };
    });
  }

  list() {
    return readJsonArray(this.filePath);
  }

  getPatterns(events = this.list()) {
    return events.reduce((patterns, event) => {
      const key = `${event.cause}:${event.forbiddenAction || 'unknown-action'}`;
      patterns[key] = (patterns[key] || 0) + 1;
      return patterns;
    }, {});
  }

  getToxicActions(events = this.list()) {
    return events.reduce((actions, event) => {
      if (!event.forbiddenAction) return actions;
      actions[event.forbiddenAction] = (actions[event.forbiddenAction] || 0) + 1;
      return actions;
    }, {});
  }
}

class ReincarnationQueue {
  constructor(projectRoot = process.cwd(), options = {}) {
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.filePath = path.join(this.projectRoot, this.config.dataDir, this.config.queueFile);
  }

  enqueue(report) {
    return withFileLock(this.filePath, this.config, () => {
      const queue = this.list();
      const item = {
        id: nextId('reincarnation'),
        schemaVersion: SCHEMA_VERSION,
        status: QueueStatus.QUEUED,
        createdAt: new Date().toISOString(),
        claimedAt: null,
        reportId: report.id,
        deceasedAgentId: report.deceasedAgentId,
        reincarnationContext: report.reincarnationContext,
        preventionDirectives: cloneValue(report.preventionDirectives || []),
        immunityToken: cloneValue(report.immunityToken || {}),
      };

      queue.push(item);
      writeJsonAtomic(this.filePath, queue);
      return cloneValue(item);
    });
  }

  claimNext() {
    return withFileLock(this.filePath, this.config, () => {
      const queue = this.list();
      const index = queue.findIndex(item => item.status === QueueStatus.QUEUED);
      if (index === -1) return null;

      queue[index] = {
        ...queue[index],
        status: QueueStatus.CLAIMED,
        claimedAt: new Date().toISOString(),
      };
      writeJsonAtomic(this.filePath, queue);
      return cloneValue(queue[index]);
    });
  }

  list(status = null) {
    const queue = readJsonArray(this.filePath);
    return status ? queue.filter(item => item.status === status) : queue;
  }
}

class AutopsyEngine extends EventEmitter {
  constructor(projectRoot = process.cwd(), options = {}) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.filePath = path.join(this.projectRoot, this.config.dataDir, this.config.autopsyFile);
    this.stateCommitLog = options.stateCommitLog || new StateCommitLog(projectRoot, this.config);
  }

  recordDeath(state, error, metadata = {}) {
    const normalizedState = normalizeState(state);
    const normalizedError = normalizeError(error);
    const cause = metadata.cause || diagnoseCause(error);
    const stateCommit = this.stateCommitLog.commitDelta(
      normalizedState.id,
      normalizedState.diff || {
        currentAction: normalizedState.currentAction,
        lastSuccessfulStep: normalizedState.lastSuccessfulStep,
        criticalVariables: normalizedState.criticalVariables,
      },
      { cause, source: 'autopsy' },
    );
    const { legacy, summary } = buildLegacy(normalizedState, cause, this.config);
    const preventionDirectives = generateDirectives(cause, error, normalizedState);

    const report = {
      id: nextId('autopsy'),
      schemaVersion: SCHEMA_VERSION,
      deceasedAgentId: normalizedState.id,
      deceasedAgentName: normalizedState.name,
      timestamp: new Date().toISOString(),
      cause,
      errorName: normalizedError.name,
      errorMessage: normalizedError.message,
      errorTrace: truncate(normalizedError.stack, this.config.maxTraceChars),
      legacy,
      legacySummary: summary,
      preventionDirectives,
      immunityToken: {
        forbiddenAction: normalizedState.currentAction || '',
        suggestedPivot: suggestPivot(cause, normalizedState),
        reason: `Previous instance failed with ${cause}: ${truncate(normalizedError.message, 220)}`,
      },
      stateCommitId: stateCommit.id,
      metadata: cloneValue(metadata || {}),
    };
    report.reincarnationContext = buildReincarnationContext(report);

    withFileLock(this.filePath, this.config, () => {
      const reports = this.listReports();
      reports.push(report);
      writeJsonAtomic(this.filePath, reports);
    });
    this.emit(Events.AUTOPSY_RECORDED, report);

    return cloneValue(report);
  }

  getReincarnationContext() {
    const last = this.getLastReport();
    return last?.reincarnationContext || '';
  }

  getLastReport() {
    return this.listReports().at(-1) || null;
  }

  listReports() {
    return readJsonArray(this.filePath);
  }
}

class AgentImmortalityProtocol extends EventEmitter {
  constructor(projectRoot = process.cwd(), options = {}) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.stateCommitLog = options.stateCommitLog || new StateCommitLog(projectRoot, this.config);
    this.autopsyEngine = options.autopsyEngine || new AutopsyEngine(projectRoot, {
      ...this.config,
      stateCommitLog: this.stateCommitLog,
    });
    this.reincarnationQueue = options.reincarnationQueue || new ReincarnationQueue(projectRoot, this.config);
    this.evolutionLog = options.evolutionLog || new EvolutionLog(projectRoot, this.config);
    this.gotchasMemory = options.gotchasMemory || null;
  }

  captureFailure({ agentState, error, metadata = {} } = {}) {
    if (!agentState) {
      throw new Error('agentState is required');
    }
    if (!error) {
      throw new Error('error is required');
    }

    const report = this.autopsyEngine.recordDeath(agentState, error, metadata);
    const queueItem = this.reincarnationQueue.enqueue(report);
    const evolution = this.evolutionLog.record(report);

    this._trackGotcha(report);
    this.emit(Events.AUTOPSY_RECORDED, report);
    this.emit(Events.REINCARNATION_ENQUEUED, queueItem);
    this.emit(Events.EVOLUTION_RECORDED, evolution.event);

    return {
      report,
      queueItem,
      evolution,
      reincarnationContext: report.reincarnationContext,
    };
  }

  claimReincarnation() {
    const item = this.reincarnationQueue.claimNext();
    if (item) {
      this.emit(Events.REINCARNATION_CLAIMED, item);
    }
    return item;
  }

  commitState(agentId, delta = {}, metadata = {}) {
    const commit = this.stateCommitLog.commitDelta(agentId, delta, metadata);
    this.emit(Events.STATE_COMMITTED, commit);
    return commit;
  }

  getEvolutionPatterns() {
    return this.evolutionLog.getPatterns();
  }

  _trackGotcha(report) {
    if (!this.gotchasMemory || typeof this.gotchasMemory.trackError !== 'function') {
      return;
    }

    try {
      this.gotchasMemory.trackError({
        message: report.errorMessage,
        stack: report.errorTrace,
        category: 'runtime',
        context: {
          source: 'agent-immortality',
          cause: report.cause,
          reportId: report.id,
          directives: report.preventionDirectives,
        },
      });
    } catch (error) {
      this.emit('gotcha-track-failed', error);
    }
  }
}

module.exports = AgentImmortalityProtocol;
module.exports.AgentImmortalityProtocol = AgentImmortalityProtocol;
module.exports.AutopsyEngine = AutopsyEngine;
module.exports.ReincarnationQueue = ReincarnationQueue;
module.exports.StateCommitLog = StateCommitLog;
module.exports.EvolutionLog = EvolutionLog;
module.exports.CauseOfDeath = CauseOfDeath;
module.exports.QueueStatus = QueueStatus;
module.exports.Events = Events;
module.exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
module.exports.SCHEMA_VERSION = SCHEMA_VERSION;
module.exports._internal = {
  buildLegacy,
  buildReincarnationContext,
  diagnoseCause,
  generateDirectives,
  normalizeError,
  normalizeState,
  readJsonArray,
};
