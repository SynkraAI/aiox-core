/**
 * L6 Keyword Layer Processor
 *
 * Scans manifest domains for recall keywords and matches them
 * against the user prompt. Loads domain files for matching domains.
 * Respects exclusion rules and deduplicates against previous layers.
 *
 * CARL parity: identical keyword matching behavior using domain-loader
 * matchKeywords() and isExcluded() functions.
 *
 * @module core/synapse/layers/l6-keyword
 * @version 1.0.0
 * @created Story SYN-5 - Layer Processors L4-L7
 */

const path = require('path');
const { loadDomainFile, matchKeywords, isExcluded } = require('../domain/domain-loader');
const LayerProcessor = require('./layer-processor');

/**
 * L6 Keyword Processor
 *
 * Matches recall keywords in manifest domains against the prompt.
 * Deduplicates domains already loaded by previous layers.
 * Returns null if no keyword matches.
 *
 * @extends LayerProcessor
 */
class L6KeywordProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'keyword', layer: 6, timeout: 15 });
  }

  /**
   * Match keywords and load corresponding domain rules.
   *
   * Detection flow:
   * 1. Build set of already-loaded domains from previousLayers
   * 2. Iterate manifest domains with recall keywords
   * 3. Check exclusion (global + domain)
   * 4. Check keyword match against prompt
   * 5. Skip if domain already loaded by previous layer
   * 6. Load domain file and collect rules
   *
   * @param {object} context
   * @param {string} context.prompt - Current prompt text
   * @param {object} context.session - Session state (SYN-2 schema)
   * @param {object} context.config - Config with synapsePath and manifest
   * @param {object[]} context.previousLayers - Results from previous layers
   * @returns {{ rules: string[], metadata: object } | null}
   */
  process(context) {
    const { prompt, config, previousLayers } = context;
    const { manifest, synapsePath } = config;

    if (!prompt) {
      return null;
    }

    // 1. Build set of already-loaded domain sources
    const loadedSources = this._extractLoadedSources(previousLayers || []);

    const allRules = [];
    const matchedDomains = [];
    const skippedDuplicates = [];

    const globalExclude = manifest.globalExclude || [];

    // 2. Iterate domains with recall keywords
    for (const [domainName, domain] of Object.entries(manifest.domains || {})) {
      if (!domain.recall || domain.recall.length === 0) {
        continue;
      }

      // 3. Check exclusion
      if (isExcluded(prompt, globalExclude, domain.exclude || [])) {
        continue;
      }

      // 4. Check keyword match
      if (!matchKeywords(prompt, domain.recall)) {
        continue;
      }

      // 5. Check dedup against previous layers
      if (loadedSources.has(domainName)) {
        skippedDuplicates.push(domainName);
        continue;
      }

      // 6. Load domain file
      const domainFile = domain.file
        ? path.join(synapsePath, domain.file)
        : path.join(synapsePath, domainName.toLowerCase().replace(/_/g, '-'));

      const rules = loadDomainFile(domainFile);
      if (rules && rules.length > 0) {
        allRules.push(...rules);
        matchedDomains.push(domainName);
      }
    }

    if (allRules.length === 0) {
      return null;
    }

    return {
      rules: allRules,
      metadata: {
        layer: 6,
        matchedDomains,
        skippedDuplicates,
      },
    };
  }

  /**
   * Extract domain source identifiers from previous layer results.
   *
   * Looks at metadata.source and metadata.agentId from previous layers
   * to build a set of domain names that are already loaded.
   *
   * @param {object[]} previousLayers - Array of { name, metadata } from prior layers
   * @returns {Set<string>} Set of loaded domain identifiers
   * @private
   */
  _extractLoadedSources(previousLayers) {
    const sources = new Set();

    for (const layer of previousLayers) {
      if (!layer || !layer.metadata) continue;

      // Extract source identifier from metadata
      const source = layer.metadata.source;
      if (source) {
        sources.add(source);
        // Also add the uppercase domain key form
        const upperKey = source.toUpperCase().replace(/-/g, '_');
        sources.add(upperKey);
      }

      // Track loaded domains from squad layer
      if (layer.metadata.domainsLoaded) {
        for (const d of layer.metadata.domainsLoaded) {
          sources.add(d);
        }
      }
    }

    return sources;
  }
}

module.exports = L6KeywordProcessor;
