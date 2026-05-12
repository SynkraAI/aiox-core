/**
 * L5 Squad Layer Processor
 *
 * Discovers and merges domain rules from installed squads.
 * Scans squads/ directory for .synapse/manifest files,
 * namespaces domain keys with {SQUAD_NAME}_ prefix,
 * and applies merge rules (extend/override/none).
 *
 * Implements a 60-second TTL cache to minimize filesystem scans.
 * Prioritizes active squad domains when session.active_squad is set.
 *
 * @module core/synapse/layers/l5-squad
 * @version 1.0.0
 * @created Story SYN-5 - Layer Processors L4-L7
 */

const fs = require('fs');
const path = require('path');
const { parseManifest, loadDomainFile } = require('../domain/domain-loader');
const LayerProcessor = require('./layer-processor');

/** Cache TTL in milliseconds (60 seconds) */
const CACHE_TTL_MS = 60000;

/**
 * L5 Squad Processor
 *
 * Discovers squads with .synapse/manifest files and merges their
 * domain rules into the pipeline. Returns null if no squads found
 * or squads/ directory is missing.
 *
 * @extends LayerProcessor
 */
class L5SquadProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'squad', layer: 5, timeout: 20 });
  }

  /**
   * Discover squad domains and merge rules.
   *
   * Detection flow:
   * 1. Resolve squads/ directory relative to synapsePath parent
   * 2. Check cache (TTL 60s), use if fresh
   * 3. Scan squads/ for .synapse/manifest files
   * 4. Namespace domain keys: {SQUAD_NAME_UPPER}_{DOMAIN_KEY}
   * 5. Read merge rules from {SQUAD}_EXTENDS key
   * 6. Prioritize active squad if session.active_squad set
   * 7. Load domain files and collect rules
   *
   * @param {object} context
   * @param {string} context.prompt - Current prompt text
   * @param {object} context.session - Session state (SYN-2 schema)
   * @param {object} context.config - Config with synapsePath and manifest
   * @param {object[]} context.previousLayers - Results from previous layers
   * @returns {{ rules: string[], metadata: object } | null}
   */
  process(context) {
    const { session, config } = context;
    const { synapsePath } = config;

    // 1. Resolve squads/ directory (sibling of .synapse/)
    const projectRoot = path.dirname(synapsePath);
    const squadsDir = path.join(projectRoot, 'squads');

    // Graceful: missing squads/ directory
    if (!fs.existsSync(squadsDir)) {
      return null;
    }

    // 2. Check cache
    const cacheDir = path.join(synapsePath, 'cache');
    const cachePath = path.join(cacheDir, 'squad-manifests.json');
    const cachedData = this._readCache(cachePath);

    // 3. Discover squads (from cache or scan)
    let squadManifests;
    if (cachedData) {
      squadManifests = cachedData.manifests;
    } else {
      squadManifests = this._scanSquads(squadsDir);
      this._writeCache(cachePath, cacheDir, squadManifests);
    }

    if (Object.keys(squadManifests).length === 0) {
      return null;
    }

    // 4. Determine active squad for prioritization
    const activeSquadName = session.active_squad?.name || null;

    // 5. Collect rules from all squads
    const allRules = [];
    const domainsLoaded = [];

    // Process active squad first (priority)
    const squadNames = Object.keys(squadManifests);
    if (activeSquadName && squadManifests[activeSquadName]) {
      this._loadSquadDomains(
        activeSquadName, squadManifests[activeSquadName],
        squadsDir, allRules, domainsLoaded,
      );
    }

    // Process remaining squads
    for (const squadName of squadNames) {
      if (squadName === activeSquadName) continue;
      this._loadSquadDomains(
        squadName, squadManifests[squadName],
        squadsDir, allRules, domainsLoaded,
      );
    }

    if (allRules.length === 0) {
      return null;
    }

    return {
      rules: allRules,
      metadata: {
        layer: 5,
        squadsFound: Object.keys(squadManifests).length,
        domainsLoaded,
      },
    };
  }

  /**
   * Load domain rules from a single squad.
   *
   * @param {string} squadName - Squad directory name
   * @param {object} manifest - Parsed squad manifest
   * @param {string} squadsDir - Path to squads/ directory
   * @param {string[]} allRules - Accumulator for rules
   * @param {string[]} domainsLoaded - Accumulator for domain names
   * @private
   */
  _loadSquadDomains(squadName, manifest, squadsDir, allRules, domainsLoaded) {
    const squadUpper = squadName.toUpperCase();
    const squadSynapsePath = path.join(squadsDir, squadName, '.synapse');

    // Check merge mode from {SQUAD}_EXTENDS key
    const extendsKey = `${squadUpper}_EXTENDS`;
    const mergeMode = manifest.domains?.[extendsKey]?.file || 'extend';
    const resolvedMerge = ['extend', 'override', 'none'].includes(mergeMode)
      ? mergeMode : 'extend';

    if (resolvedMerge === 'none') {
      return; // Squad opted out of rule injection
    }

    for (const [domainKey, domain] of Object.entries(manifest.domains || {})) {
      // Skip the EXTENDS meta-key
      if (domainKey === extendsKey) continue;

      const namespacedKey = `${squadUpper}_${domainKey}`;
      const domainFile = domain.file
        ? path.join(squadSynapsePath, domain.file)
        : path.join(squadSynapsePath, domainKey.toLowerCase().replace(/_/g, '-'));

      const rules = loadDomainFile(domainFile);
      if (rules && rules.length > 0) {
        allRules.push(...rules);
        domainsLoaded.push(namespacedKey);
      }
    }
  }

  /**
   * Read cache file if it exists and is not stale.
   *
   * @param {string} cachePath - Path to cache JSON file
   * @returns {object|null} Cached data or null if miss/stale/error
   * @private
   */
  _readCache(cachePath) {
    try {
      const raw = fs.readFileSync(cachePath, 'utf8');
      const cached = JSON.parse(raw);
      if (cached.timestamp && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        return cached;
      }
      return null; // Stale
    } catch (_error) {
      return null; // Missing or corrupt
    }
  }

  /**
   * Write cache file with current timestamp.
   *
   * @param {string} cachePath - Path to cache JSON file
   * @param {string} cacheDir - Path to cache directory
   * @param {object} manifests - Squad manifests to cache
   * @private
   */
  _writeCache(cachePath, cacheDir, manifests) {
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      fs.writeFileSync(cachePath, JSON.stringify({
        timestamp: Date.now(),
        manifests,
      }));
    } catch (_error) {
      // Graceful: cache write failure is non-fatal
    }
  }

  /**
   * Scan squads/ directory for .synapse/manifest files.
   *
   * @param {string} squadsDir - Path to squads/ directory
   * @returns {object} Map of squadName -> parsed manifest
   * @private
   */
  _scanSquads(squadsDir) {
    const manifests = {};

    let entries;
    try {
      entries = fs.readdirSync(squadsDir, { withFileTypes: true });
    } catch (_error) {
      return manifests;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const manifestPath = path.join(squadsDir, entry.name, '.synapse', 'manifest');
      if (!fs.existsSync(manifestPath)) continue;

      const parsed = parseManifest(manifestPath);
      if (parsed && Object.keys(parsed.domains).length > 0) {
        manifests[entry.name] = parsed;
      }
    }

    return manifests;
  }
}

module.exports = L5SquadProcessor;
