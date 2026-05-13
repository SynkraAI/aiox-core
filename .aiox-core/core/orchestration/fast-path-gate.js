'use strict';

const DEFAULT_FAST_PATH_CONFIG = Object.freeze({
  enabled: true,
  externalExecutorsEnabled: false,
  minConfidence: 0.58,
  minBatchItems: 3,
  externalExecutorThreshold: 0.78,
});

const STRUCTURED_FILE_EXTENSIONS_FROZEN = Object.freeze([
  '.csv',
  '.json',
  '.jsonl',
  '.md',
  '.toml',
  '.tsv',
  '.txt',
  '.yaml',
  '.yml',
]);

const STRUCTURED_FILE_EXTENSION_SET = new Set(STRUCTURED_FILE_EXTENSIONS_FROZEN);

const AUTOMATION_PATTERNS_FROZEN = Object.freeze([
  {
    id: 'bulk-edit',
    weight: 3,
    pattern: /\b(batch|bulk|many files|multiple files|all files|in one shot|one shot)\b/i,
  },
  {
    id: 'structured-transform',
    weight: 3,
    pattern: /\b(yaml|json|csv|markdown|frontmatter|schema|variable|variables|field|fields)\b/i,
  },
  {
    id: 'mechanical-edit',
    weight: 3,
    pattern: /\b(replace|rename|populate|fill|complete|update|convert|transform|normalize|format)\b/i,
  },
  {
    id: 'map-then-apply',
    weight: 2,
    pattern: /\b(map|extract|derive|template|codemod|script)\b/i,
  },
  {
    id: 'repetition',
    weight: 2,
    pattern: /\b(repeated|repetitive|same change|similar change|dumb task|tedious)\b/i,
  },
  {
    id: 'parallelizable',
    weight: 2,
    pattern: /\b(parallel|independent|per file|per item|per record)\b/i,
  },
].map(Object.freeze));

const RISK_PATTERNS_FROZEN = Object.freeze([
  {
    id: 'architecture',
    weight: 3,
    pattern: /\b(architecture|architectural|design decision|adr|contract)\b/i,
  },
  {
    id: 'security',
    weight: 3,
    pattern: /\b(security|secret|token|credential|auth|permission|pii|rls)\b/i,
  },
  {
    id: 'destructive',
    weight: 3,
    pattern: /\b(delete|remove data|drop|reset|rewrite history|destructive)\b/i,
  },
  {
    id: 'production',
    weight: 2,
    pattern: /\b(production|prod|release|billing|payment|customer)\b/i,
  },
  {
    id: 'migration',
    weight: 2,
    pattern: /\b(migration|migrate|schema change|breaking change)\b/i,
  },
].map(Object.freeze));

function clonePatternDefinition(patternDefinition) {
  return {
    id: patternDefinition.id,
    weight: patternDefinition.weight,
    pattern: new RegExp(patternDefinition.pattern.source, patternDefinition.pattern.flags),
  };
}

function getStructuredFileExtensions() {
  return new Set(STRUCTURED_FILE_EXTENSIONS_FROZEN);
}

function getAutomationPatterns() {
  return AUTOMATION_PATTERNS_FROZEN.map(clonePatternDefinition);
}

function getRiskPatterns() {
  return RISK_PATTERNS_FROZEN.map(clonePatternDefinition);
}

function parseBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }
  return fallback;
}

function normalizeConfig(config = {}) {
  const clamp01 = (value, fallback) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return fallback;
    }
    return Math.min(1, Math.max(0, numericValue));
  };
  const positiveInteger = (value, fallback) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return fallback;
    }
    return Math.max(1, Math.floor(numericValue));
  };

  return {
    enabled: parseBoolean(config.enabled, DEFAULT_FAST_PATH_CONFIG.enabled),
    externalExecutorsEnabled: parseBoolean(
      config.externalExecutorsEnabled ?? config.external_executors_enabled,
      DEFAULT_FAST_PATH_CONFIG.externalExecutorsEnabled,
    ),
    minConfidence: clamp01(
      config.minConfidence ?? config.min_confidence,
      DEFAULT_FAST_PATH_CONFIG.minConfidence,
    ),
    minBatchItems: positiveInteger(
      config.minBatchItems ?? config.min_batch_items,
      DEFAULT_FAST_PATH_CONFIG.minBatchItems,
    ),
    externalExecutorThreshold: clamp01(
      config.externalExecutorThreshold ?? config.external_executor_threshold,
      DEFAULT_FAST_PATH_CONFIG.externalExecutorThreshold,
    ),
  };
}

function normalizeTask(input = {}) {
  const task = input.task || input;
  return {
    description: String(task.description || task.summary || task.title || ''),
    files: Array.isArray(task.files) ? task.files : [],
    acceptanceCriteria: Array.isArray(task.acceptanceCriteria)
      ? task.acceptanceCriteria
      : Array.isArray(task.acceptance_criteria)
        ? task.acceptance_criteria
        : [],
    itemCount: Number.isFinite(task.itemCount)
      ? task.itemCount
      : Number.isFinite(task.item_count)
        ? task.item_count
        : null,
  };
}

function normalizePathExtension(filePath) {
  const match = String(filePath || '').toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match ? match[1] : '';
}

function collectSignals(patterns, text) {
  return patterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ id, weight }) => ({ id, weight }));
}

function getTaskText(task) {
  return [
    task.description,
    ...task.acceptanceCriteria.map((criterion) => String(criterion || '')),
    ...task.files.map((file) => String(file || '')),
  ].join('\n');
}

function scoreFastPath({ automationSignals, riskSignals, files, structuredFileCount, batchSize }) {
  const automationWeight = automationSignals.reduce((sum, signal) => sum + signal.weight, 0);
  const riskWeight = riskSignals.reduce((sum, signal) => sum + signal.weight, 0);
  const fileWeight = Math.min(files.length, 8) * 0.45;
  const structuredWeight = Math.min(structuredFileCount, 6) * 0.55;
  const batchWeight = Math.min(batchSize, 10) * 0.35;

  const rawScore = automationWeight + fileWeight + structuredWeight + batchWeight - riskWeight * 1.35;
  return Math.max(0, Math.min(1, rawScore / 13));
}

function chooseMode({
  confidence,
  config,
  externalExecutorsEnabled,
  parallelizable,
  structuredFileCount,
  batchSize,
}) {
  if (externalExecutorsEnabled && confidence >= config.externalExecutorThreshold) {
    return 'external_executor';
  }

  if (parallelizable && batchSize >= config.minBatchItems) {
    return 'parallel_batch';
  }

  if (structuredFileCount > 0 || batchSize >= config.minBatchItems) {
    return 'deterministic_batch';
  }

  return 'standard';
}

function buildActions(mode) {
  if (mode === 'external_executor') {
    return [
      'Prepare a bounded prompt with target files, schema, acceptance criteria, and validation commands.',
      'Run a dry-run plan first, then delegate with the configured external executor sandbox.',
      'Review the executor diff before mutating story or issue state.',
    ];
  }

  if (mode === 'parallel_batch') {
    return [
      'Map target files or records once before editing.',
      'Group independent changes by file or record and apply them as a batch.',
      'Run targeted validation on the changed surface before broader checks.',
    ];
  }

  if (mode === 'deterministic_batch') {
    return [
      'Extract the data shape and replacement rules before editing.',
      'Use a deterministic transform or structured parser instead of conversational one-by-one edits.',
      'Validate output syntax and diff size before continuing.',
    ];
  }

  return [
    'Use the standard story/task workflow.',
    'Keep changes sequential when risk or ambiguity is higher than the automation signal.',
  ];
}

function evaluateFastPath(input = {}) {
  const config = normalizeConfig(input.config || input.fastPath || {});
  const task = normalizeTask(input);
  const text = getTaskText(task);
  const automationSignals = collectSignals(AUTOMATION_PATTERNS_FROZEN, text);
  const riskSignals = collectSignals(RISK_PATTERNS_FROZEN, text);
  const structuredFileCount = task.files.filter((file) => (
    STRUCTURED_FILE_EXTENSION_SET.has(normalizePathExtension(file))
  )).length;
  const batchSize = task.itemCount ?? Math.max(task.files.length, structuredFileCount);
  const parallelizable = (
    task.files.length >= config.minBatchItems ||
    automationSignals.some((signal) => signal.id === 'parallelizable')
  );

  if (!config.enabled) {
    return {
      gate: 'fast_path',
      enabled: false,
      passed: false,
      mode: 'standard',
      confidence: 0,
      parallelizable: false,
      riskLevel: 'unknown',
      reasons: ['fast path gate disabled by configuration'],
      evidence: { automationSignals: [], riskSignals: [], fileCount: task.files.length, structuredFileCount, batchSize },
      actions: buildActions('standard'),
    };
  }

  const confidence = scoreFastPath({
    automationSignals,
    riskSignals,
    files: task.files,
    structuredFileCount,
    batchSize,
  });
  const passed = confidence >= config.minConfidence && riskSignals.length === 0;
  const mode = passed
    ? chooseMode({
      confidence,
      config,
      externalExecutorsEnabled: parseBoolean(
        input.externalExecutorsEnabled ?? input.external_executors_enabled,
        config.externalExecutorsEnabled,
      ),
      parallelizable,
      structuredFileCount,
      batchSize,
    })
    : 'standard';
  const riskLevel = riskSignals.length >= 2 ? 'high' : riskSignals.length === 1 ? 'medium' : 'low';
  const reasons = [
    ...automationSignals.map((signal) => `automation signal: ${signal.id}`),
    ...riskSignals.map((signal) => `risk signal: ${signal.id}`),
  ];

  if (structuredFileCount > 0) {
    reasons.push(`structured files detected: ${structuredFileCount}`);
  }
  if (batchSize >= config.minBatchItems) {
    reasons.push(`batch size meets threshold: ${batchSize}`);
  }
  if (!passed && reasons.length === 0) {
    reasons.push('insufficient automation signal for fast path');
  }

  return {
    gate: 'fast_path',
    enabled: true,
    passed,
    mode,
    confidence,
    parallelizable: passed && parallelizable,
    riskLevel,
    reasons,
    evidence: {
      automationSignals,
      riskSignals,
      fileCount: task.files.length,
      structuredFileCount,
      batchSize,
    },
    actions: buildActions(mode),
  };
}

module.exports = {
  DEFAULT_FAST_PATH_CONFIG,
  evaluateFastPath,
  getAutomationPatterns,
  getRiskPatterns,
  getStructuredFileExtensions,
  normalizeConfig,
  normalizeTask,
};
