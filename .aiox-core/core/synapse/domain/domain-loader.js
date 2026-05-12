/**
 * Domain Loader + Manifest Parser
 *
 * Loads and parses the .synapse/manifest (KEY=VALUE format, CARL-compatible)
 * and individual domain files. Provides the data foundation for all 8 SYNAPSE layers.
 *
 * @module core/synapse/domain/domain-loader
 * @version 1.0.0
 * @created Story SYN-1 - Domain Loader + Manifest Parser
 */

const fs = require('fs');

/**
 * Known domain attribute suffixes (order matters — longest first to avoid partial matches)
 */
const KNOWN_SUFFIXES = [
  '_WORKFLOW_TRIGGER',
  '_AGENT_TRIGGER',
  '_NON_NEGOTIABLE',
  '_ALWAYS_ON',
  '_EXCLUDE',
  '_RECALL',
  '_STATE',
];

/**
 * Global-level keys that are NOT domain attributes
 */
const GLOBAL_KEYS = ['DEVMODE', 'GLOBAL_EXCLUDE'];

/**
 * Parse the .synapse/manifest file (KEY=VALUE format)
 *
 * Supports all CARL-compatible domain attributes:
 * - {DOMAIN}_STATE=active|inactive
 * - {DOMAIN}_ALWAYS_ON=true
 * - {DOMAIN}_NON_NEGOTIABLE=true
 * - {DOMAIN}_AGENT_TRIGGER=agent_id
 * - {DOMAIN}_WORKFLOW_TRIGGER=workflow_id
 * - {DOMAIN}_RECALL=keyword1,keyword2
 * - {DOMAIN}_EXCLUDE=skip,ignore
 * - DEVMODE=true|false
 * - GLOBAL_EXCLUDE=skip,ignore
 *
 * @param {string} manifestPath - Absolute path to manifest file
 * @returns {object} Parsed manifest with domains, devmode, and globalExclude
 */
function parseManifest(manifestPath) {
  let content;
  try {
    content = fs.readFileSync(manifestPath, 'utf8');
  } catch (_error) {
    // Graceful degradation: missing manifest = empty config
    return {
      devmode: false,
      globalExclude: [],
      domains: {},
    };
  }

  const result = {
    devmode: false,
    globalExclude: [],
    domains: {},
  };

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Split on first '=' only
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue; // Malformed line — skip silently
    }

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    if (!key) {
      continue;
    }

    // Handle global keys
    if (key === 'DEVMODE') {
      result.devmode = value.toLowerCase() === 'true';
      continue;
    }

    if (key === 'GLOBAL_EXCLUDE') {
      result.globalExclude = parseCommaSeparated(value);
      continue;
    }

    // Extract domain name and attribute suffix
    const { domainName, suffix } = extractDomainInfo(key);

    if (!domainName) {
      continue; // Unknown key format — skip
    }

    // Ensure domain entry exists
    if (!result.domains[domainName]) {
      result.domains[domainName] = {
        file: domainNameToFile(domainName),
      };
    }

    const domain = result.domains[domainName];

    // Apply attribute based on suffix
    switch (suffix) {
      case '_STATE':
        domain.state = value.toLowerCase();
        break;
      case '_ALWAYS_ON':
        domain.alwaysOn = value.toLowerCase() === 'true';
        break;
      case '_NON_NEGOTIABLE':
        domain.nonNegotiable = value.toLowerCase() === 'true';
        break;
      case '_AGENT_TRIGGER':
        domain.agentTrigger = value;
        break;
      case '_WORKFLOW_TRIGGER':
        domain.workflowTrigger = value;
        break;
      case '_RECALL':
        domain.recall = parseCommaSeparated(value);
        break;
      case '_EXCLUDE':
        domain.exclude = parseCommaSeparated(value);
        break;
    }
  }

  return result;
}

/**
 * Load a domain file and extract rules
 *
 * Supports two formats:
 * 1. KEY=VALUE format: DOMAIN_RULE_N=text (extracts text)
 * 2. Plain text format: each non-empty, non-comment line is a rule
 *
 * @param {string} domainPath - Absolute path to domain file
 * @returns {string[]} Array of rule strings (empty array if file missing)
 */
function loadDomainFile(domainPath) {
  let content;
  try {
    content = fs.readFileSync(domainPath, 'utf8');
  } catch (_error) {
    return []; // Graceful: missing file = empty rules
  }

  const lines = content.split(/\r?\n/);
  const rules = [];
  let hasKeyValueFormat = false;

  // First pass: detect if file uses KEY=VALUE format
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && /^[A-Z][A-Z0-9_]*=/.test(trimmed)) {
      hasKeyValueFormat = true;
      break;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    if (hasKeyValueFormat) {
      // KEY=VALUE format: extract value from DOMAIN_RULE_N=text
      const match = trimmed.match(/^[A-Z][A-Z0-9_]*=(.+)$/);
      if (match) {
        rules.push(match[1].trim());
      }
    } else {
      // Plain text format: each line is a rule
      rules.push(trimmed);
    }
  }

  return rules;
}

/**
 * Check if a prompt should be excluded based on exclusion keywords
 *
 * @param {string} prompt - The user prompt to check
 * @param {string[]} globalExcludes - Global exclusion keywords
 * @param {string[]} domainExcludes - Per-domain exclusion keywords
 * @returns {boolean} True if prompt should be excluded
 */
function isExcluded(prompt, globalExcludes = [], domainExcludes = []) {
  if (!prompt) {
    return false;
  }

  const promptLower = prompt.toLowerCase();
  const allExcludes = [...globalExcludes, ...domainExcludes];

  for (const keyword of allExcludes) {
    if (!keyword) {
      continue;
    }
    // Escape regex special characters in keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    if (regex.test(promptLower)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a prompt matches any recall keywords
 *
 * @param {string} prompt - The user prompt to check
 * @param {string[]} recallKeywords - Array of keywords to match
 * @returns {boolean} True if prompt matches any keyword
 */
function matchKeywords(prompt, recallKeywords = []) {
  if (!prompt || recallKeywords.length === 0) {
    return false;
  }

  const promptLower = prompt.toLowerCase();

  for (const keyword of recallKeywords) {
    if (!keyword) {
      continue;
    }
    // Escape regex special characters in keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    if (regex.test(promptLower)) {
      return true;
    }
  }

  return false;
}

/**
 * Extract domain name and suffix from a manifest key
 *
 * Logic:
 * 1. Try each known suffix (longest first)
 * 2. If suffix matches, the remainder is the domain name
 * 3. If no suffix matches, skip the key
 *
 * @param {string} key - Manifest key (e.g., 'AGENT_DEV_STATE')
 * @returns {{ domainName: string|null, suffix: string|null }}
 */
function extractDomainInfo(key) {
  for (const suffix of KNOWN_SUFFIXES) {
    if (key.endsWith(suffix)) {
      const domainName = key.substring(0, key.length - suffix.length);
      if (domainName) {
        return { domainName, suffix };
      }
    }
  }

  return { domainName: null, suffix: null };
}

/**
 * Convert domain name to file name
 *
 * Pattern: uppercase with underscores -> lowercase with hyphens
 * Example: AGENT_DEV -> agent-dev, WORKFLOW_STORY_DEV -> workflow-story-dev
 *
 * @param {string} domainName - Domain name in UPPERCASE_SNAKE
 * @returns {string} File name in lowercase-kebab
 */
function domainNameToFile(domainName) {
  return domainName.toLowerCase().replace(/_/g, '-');
}

/**
 * Parse comma-separated values into trimmed array
 *
 * @param {string} value - Comma-separated string
 * @returns {string[]} Array of trimmed non-empty values
 */
function parseCommaSeparated(value) {
  if (!value) {
    return [];
  }
  return value.split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

module.exports = {
  parseManifest,
  loadDomainFile,
  isExcluded,
  matchKeywords,
  extractDomainInfo,
  domainNameToFile,
  KNOWN_SUFFIXES,
  GLOBAL_KEYS,
};
