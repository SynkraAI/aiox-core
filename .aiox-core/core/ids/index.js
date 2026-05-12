'use strict';

/**
 * IDS (Incremental Development System) - Barrel Export
 *
 * Central module exporting all IDS components.
 * @module ids
 */

// IDS-1: Entity Registry Foundation
const {
  RegistryLoader,
  DEFAULT_REGISTRY_PATH,
  EMPTY_REGISTRY,
} = require('./registry-loader');

// IDS-2: Incremental Decision Engine
const {
  IncrementalDecisionEngine,
  STOP_WORDS,
  THRESHOLD_MINIMUM,
  ADAPT_IMPACT_THRESHOLD,
  KEYWORD_OVERLAP_WEIGHT,
  PURPOSE_SIMILARITY_WEIGHT,
  MAX_RESULTS,
  CACHE_TTL_MS,
} = require('./incremental-decision-engine');

// IDS-3: Self-Updating Registry
const {
  RegistryUpdater,
  WATCH_PATHS,
  INCLUDE_EXTENSIONS,
  EXCLUDE_PATTERNS,
  AUDIT_LOG_PATH,
  LOCK_FILE,
  BACKUP_DIR,
} = require('./registry-updater');

// IDS-4a: Self-Healing Registry (Data Integrity) — optional, matches framework-governor.js pattern
let RegistryHealer = null;
let HEALING_RULES = [];
let HEALING_LOG_PATH = '';
let HEALING_BACKUP_DIR = '';
let MAX_BACKUPS = 5;
let STALE_DAYS_THRESHOLD = 30;
let SEVERITY_ORDER = [];
let daysSince = () => 0;
let buildEntityIndex = () => ({});
try {
  const healer = require('./registry-healer');
  RegistryHealer = healer.RegistryHealer;
  HEALING_RULES = healer.HEALING_RULES;
  HEALING_LOG_PATH = healer.HEALING_LOG_PATH;
  HEALING_BACKUP_DIR = healer.HEALING_BACKUP_DIR;
  MAX_BACKUPS = healer.MAX_BACKUPS;
  STALE_DAYS_THRESHOLD = healer.STALE_DAYS_THRESHOLD;
  SEVERITY_ORDER = healer.SEVERITY_ORDER;
  daysSince = healer.daysSince;
  buildEntityIndex = healer.buildEntityIndex;
} catch (_err) {
  // RegistryHealer not available — barrel works without it
}

// IDS-5a: Verification Gate Engine
const {
  CircuitBreaker,
  STATE_CLOSED,
  STATE_OPEN,
  STATE_HALF_OPEN,
  DEFAULT_FAILURE_THRESHOLD,
  DEFAULT_SUCCESS_THRESHOLD,
  DEFAULT_RESET_TIMEOUT_MS,
} = require('./circuit-breaker');

const {
  VerificationGate,
  createGateResult,
  DEFAULT_TIMEOUT_MS,
} = require('./verification-gate');

// IDS-5a: Gates G1-G4 (Advisory)
const { G1EpicCreationGate } = require('./gates/g1-epic-creation');
const { G2StoryCreationGate } = require('./gates/g2-story-creation');
const { G3StoryValidationGate } = require('./gates/g3-story-validation');
const { G4DevContextGate, G4_DEFAULT_TIMEOUT_MS } = require('./gates/g4-dev-context');

// IDS-7: Framework Governor (aiox-master integration)
const {
  FrameworkGovernor,
  TIMEOUT_MS,
  RISK_THRESHOLDS,
} = require('./framework-governor');

module.exports = {
  // IDS-1: Registry Foundation
  RegistryLoader,
  DEFAULT_REGISTRY_PATH,
  EMPTY_REGISTRY,

  // IDS-2: Decision Engine
  IncrementalDecisionEngine,
  STOP_WORDS,
  THRESHOLD_MINIMUM,
  ADAPT_IMPACT_THRESHOLD,
  KEYWORD_OVERLAP_WEIGHT,
  PURPOSE_SIMILARITY_WEIGHT,
  MAX_RESULTS,
  CACHE_TTL_MS,

  // IDS-3: Self-Updating
  RegistryUpdater,
  WATCH_PATHS,
  INCLUDE_EXTENSIONS,
  EXCLUDE_PATTERNS,
  AUDIT_LOG_PATH,
  LOCK_FILE,
  BACKUP_DIR,

  // IDS-4a: Self-Healing
  RegistryHealer,
  HEALING_RULES,
  HEALING_LOG_PATH,
  HEALING_BACKUP_DIR,
  MAX_BACKUPS,
  STALE_DAYS_THRESHOLD,
  SEVERITY_ORDER,
  daysSince,
  buildEntityIndex,

  // IDS-5a: Circuit Breaker
  CircuitBreaker,
  STATE_CLOSED,
  STATE_OPEN,
  STATE_HALF_OPEN,
  DEFAULT_FAILURE_THRESHOLD,
  DEFAULT_SUCCESS_THRESHOLD,
  DEFAULT_RESET_TIMEOUT_MS,

  // IDS-5a: Verification Gate Engine
  VerificationGate,
  createGateResult,
  DEFAULT_TIMEOUT_MS,

  // IDS-5a: Gates G1-G4
  G1EpicCreationGate,
  G2StoryCreationGate,
  G3StoryValidationGate,
  G4DevContextGate,
  G4_DEFAULT_TIMEOUT_MS,

  // IDS-7: Framework Governor
  FrameworkGovernor,
  TIMEOUT_MS,
  RISK_THRESHOLDS,
};
