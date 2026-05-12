/**
 * L0 Constitution Layer Processor
 *
 * Injects the 6 Constitutional articles as NON-NEGOTIABLE rules.
 * ALWAYS_ON — processes regardless of session state.
 * Rules are loaded from the .synapse/constitution domain file.
 *
 * @module core/synapse/layers/l0-constitution
 * @version 1.0.0
 * @created Story SYN-4 - Layer Processors L0-L3
 */

const path = require('path');
const { loadDomainFile } = require('../domain/domain-loader');
const LayerProcessor = require('./layer-processor');

/**
 * L0 Constitution Processor
 *
 * Loads constitution domain file and validates nonNegotiable flag in manifest.
 * Returns all constitutional rules as an array of strings.
 *
 * @extends LayerProcessor
 */
class L0ConstitutionProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'constitution', layer: 0, timeout: 5 });
  }

  /**
   * Load constitution rules from domain file.
   *
   * ALWAYS_ON: processes regardless of session state.
   * Validates that the constitution domain has nonNegotiable: true in manifest.
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

    // Find constitution domain in manifest
    const domainKey = Object.keys(manifest.domains || {})
      .find(k => k.toUpperCase() === 'CONSTITUTION');

    const domain = domainKey ? manifest.domains[domainKey] : null;

    // Determine domain file path
    const domainFile = domain && domain.file
      ? path.join(synapsePath, domain.file)
      : path.join(synapsePath, 'constitution');

    // Load rules from domain file
    const rules = loadDomainFile(domainFile);

    // Graceful degradation: no rules found
    if (!rules || rules.length === 0) {
      return null;
    }

    // Validate nonNegotiable flag
    const nonNegotiable = domain ? domain.nonNegotiable === true : false;

    return {
      rules,
      metadata: {
        layer: 0,
        source: 'constitution',
        nonNegotiable,
      },
    };
  }
}

module.exports = L0ConstitutionProcessor;
