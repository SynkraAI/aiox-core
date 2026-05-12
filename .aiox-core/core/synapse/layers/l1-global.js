/**
 * L1 Global Layer Processor
 *
 * Injects universal rules from two domain files:
 * - .synapse/global — global rules applying to all contexts
 * - .synapse/context — bracket-specific rules from context tracker
 *
 * ALWAYS_ON — processes regardless of session state.
 * Combines both sources: global first, context second.
 *
 * @module core/synapse/layers/l1-global
 * @version 1.0.0
 * @created Story SYN-4 - Layer Processors L0-L3
 */

const path = require('path');
const { loadDomainFile } = require('../domain/domain-loader');
const LayerProcessor = require('./layer-processor');

/**
 * L1 Global Processor
 *
 * Loads global and context domain files and combines their rules.
 * If one file is missing, includes rules from the other only.
 *
 * @extends LayerProcessor
 */
class L1GlobalProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'global', layer: 1, timeout: 10 });
  }

  /**
   * Load global and context rules.
   *
   * ALWAYS_ON: processes regardless of session state.
   * Combines rules from both domain files (global first, context second).
   *
   * @param {object} context
   * @param {string} context.prompt - Current prompt text
   * @param {object} context.session - Session state
   * @param {object} context.config - Config with synapsePath and manifest
   * @param {object[]} context.previousLayers - Results from previous layers
   * @returns {{ rules: string[], metadata: object } | null}
   */
  process(context) {
    const { config } = context;
    const { synapsePath, manifest } = config;

    // Resolve file paths from manifest or use defaults
    const globalDomain = this._findDomain(manifest, 'GLOBAL');
    const contextDomain = this._findDomain(manifest, 'CONTEXT');

    const globalFile = globalDomain && globalDomain.file
      ? path.join(synapsePath, globalDomain.file)
      : path.join(synapsePath, 'global');

    const contextFile = contextDomain && contextDomain.file
      ? path.join(synapsePath, contextDomain.file)
      : path.join(synapsePath, 'context');

    // Load rules from both domain files
    const globalRules = loadDomainFile(globalFile);
    const contextRules = loadDomainFile(contextFile);

    // Combine: global first, context second
    const rules = [...globalRules, ...contextRules];

    // Graceful degradation: no rules from either file
    if (rules.length === 0) {
      return null;
    }

    const sources = [];
    if (globalRules.length > 0) sources.push('global');
    if (contextRules.length > 0) sources.push('context');

    return {
      rules,
      metadata: {
        layer: 1,
        sources,
      },
    };
  }

  /**
   * Find a domain entry in the manifest by uppercase key.
   *
   * @param {object} manifest - Parsed manifest
   * @param {string} name - Domain name to find (case-insensitive)
   * @returns {object|null} Domain entry or null
   * @private
   */
  _findDomain(manifest, name) {
    const key = Object.keys(manifest.domains || {})
      .find(k => k.toUpperCase() === name.toUpperCase());
    return key ? manifest.domains[key] : null;
  }
}

module.exports = L1GlobalProcessor;
