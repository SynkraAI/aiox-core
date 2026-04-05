/**
 * SynapseEngine — Orchestrator for the 8-layer context injection pipeline.
 *
 * Executes L0-L7 sequentially, applies bracket-aware filtering via
 * context-tracker (SYN-3), collects pipeline metrics, and formats
 * the final <synapse-rules> XML output via the formatter module.
 *
 * @module core/synapse/engine
 * @version 1.0.0
 * @created Story SYN-6 - SynapseEngine Orchestrator + Output Formatter
 */

const fs = require('fs');
const path = require('path');
const AIOXError = require('aiox-core/utils/aiox-error');
const ErrorRegistry = require('aiox-core/monitor/error-registry');

const {
  estimateContextPercent,
  calculateBracket,
  getActiveLayers,
  getTokenBudget,
  needsMemoryHints,
  needsHandoffWarning,
} = require('./context/context-tracker');
const { buildLayerContext } = require('./context/context-builder');

const { formatSynapseRules } = require('./output/formatter');
const { MemoryBridge } = require('./memory/memory-bridge');
const PipelineMetrics = require('../utils/pipeline-metrics');
const { normalizeSession } = require('../utils/session-normalizer');

// ---------------------------------------------------------------------------
// Layer Imports (graceful — layers from SYN-4/SYN-5 may not exist yet)
// ---------------------------------------------------------------------------

const LAYER_MODULES = [
  { path: './layers/l0-constitution', layer: 0, name: 'constitution' },
  { path: './layers/l1-global', layer: 1, name: 'global' },
  { path: './layers/l2-agent', layer: 2, name: 'agent' },
  { path: './layers/l3-workflow', layer: 3, name: 'workflow' },
  { path: './layers/l4-task', layer: 4, name: 'task' },
  { path: './layers/l5-squad', layer: 5, name: 'squad' },
  { path: './layers/l6-keyword', layer: 6, name: 'keyword' },
  { path: './layers/l7-star-command', layer: 7, name: 'star-command' },
];

/**
 * Safely load a layer module. Returns the class or null if not available.
 *
 * @param {string} modulePath - Relative require path
 * @returns {Function|null} Layer constructor or null
 */
function loadLayerModule(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    // Only silence MODULE_NOT_FOUND for the requested module
    if (err.code === 'MODULE_NOT_FOUND' && err.message && err.message.includes(modulePath)) {
      return null;
    }
    // Surface unexpected errors (syntax, runtime, transitive missing deps)
    console.warn(`[synapse:engine] Unexpected error loading ${modulePath}: ${err.message}`);
    return null;
  }
}

/** Hard pipeline timeout in milliseconds. */
const PIPELINE_TIMEOUT_MS = 100;

/**
 * NOG-18: Default active layers (L0-L2 only).
 * L3-L7 produced 0 rules in NOG-17 audit — disabled for performance.
 * Set SYNAPSE_LEGACY_MODE=true to re-enable full 8-layer processing.
 */
const DEFAULT_ACTIVE_LAYERS = [0, 1, 2];
const LEGACY_MODE = process.env.SYNAPSE_LEGACY_MODE === 'true';

/**
 * Orchestrates the 8-layer SYNAPSE context injection pipeline.
 *
 * Instantiates all available layers at construction time and
 * executes them sequentially in process(), applying bracket-aware
 * filtering and collecting metrics.
 */
class SynapseEngine {
  /**
   * @param {string} synapsePath - Absolute path to the .synapse/ directory
   * @param {object} [config={}] - Configuration from manifest / caller
   * @param {object} [config.manifest] - Parsed manifest object
   * @param {boolean} [config.devmode] - Enable DEVMODE debug output
   */
  constructor(synapsePath, config = {}) {
    this.synapsePath = synapsePath;
    this.config = config;

    /** @type {Array<import('./layers/layer-processor')>} */
    this.layers = [];

    /** @type {MemoryBridge} Feature-gated MIS consumer (SYN-10) */
    this.memoryBridge = new MemoryBridge();

    for (const mod of LAYER_MODULES) {
      const LayerClass = loadLayerModule(mod.path);
      if (LayerClass) {
        try {
          this.layers.push(new LayerClass());
        } catch (err) {
          ErrorRegistry.log(`[synapse:engine] Failed to instantiate layer ${mod.name}: ${err.message}`, {
            category: 'SYSTEM',
            display: false,
            metadata: { layerName: mod.name, stack: err.stack },
          }).catch(() => {});
        }
      }
    }
  }

  /**
   * Execute the full pipeline for a user prompt.
   *
   * 1. Calculate context bracket via SYN-3 context-tracker
   * 2. Filter active layers for the bracket
   * 3. Execute layers sequentially, accumulating previousLayers
   * 4. Apply memory hint / handoff warning placeholders (SYN-10 future)
   * 5. Format output via formatter module
   *
   * @param {string} prompt - The user prompt text
   * @param {object} session - Session state (SYN-2 schema)
   * @param {number} [session.prompt_count=0] - Number of prompts so far
   * @param {object} [processConfig] - Per-call config overrides
   * @returns {Promise<{ xml: string, metrics: object }>}
   */
  async process(prompt, session, processConfig) {
    const safeProcessConfig = (processConfig && typeof processConfig === 'object') ? processConfig : {};
    const mergedConfig = { ...this.config, ...safeProcessConfig };
    const metrics = new PipelineMetrics();
    metrics.totalStart = process.hrtime.bigint();

    // 0. Normalize session (Gold Standard: consistent internal model)
    const normalizedSession = normalizeSession(session);

    // 1. Calculate bracket (or use fixed layers in non-legacy mode)
    const promptCount = normalizedSession.prompt_count;
    let contextPercent, bracket, activeLayers, tokenBudget;

    if (LEGACY_MODE) {
      // Full 8-layer processing with bracket-based filtering
      contextPercent = estimateContextPercent(promptCount);
      bracket = calculateBracket(contextPercent);
      const layerConfig = getActiveLayers(bracket);
      tokenBudget = getTokenBudget(bracket);

      // Guard: no layer config (invalid bracket — should not happen)
      if (!layerConfig) {
        metrics.totalEnd = process.hrtime.bigint();
        return { xml: '', metrics: metrics.getSummary() };
      }
      activeLayers = layerConfig.layers;
    } else {
      // NOG-18: Simplified — always load L0-L2, skip bracket calculation.
      // L3-L7 produced 0 rules (require session context that never exists).
      // Bracket management replaced by native /compact.
      contextPercent = estimateContextPercent(promptCount);
      bracket = calculateBracket(contextPercent);
      activeLayers = DEFAULT_ACTIVE_LAYERS;
      tokenBudget = getTokenBudget(bracket);
    }

    // 2. Execute layers sequentially
    const { results, previousLayers } = await this._executeLayers(
      prompt,
      normalizedSession,
      mergedConfig,
      activeLayers,
      bracket,
      metrics,
    );

    // 3. Memory bridge (SYN-10) — feature-gated MIS consumer
    if (needsMemoryHints(bracket)) {
      const tokenBudget = getTokenBudget(bracket);
      const hints = await this.memoryBridge.getMemoryHints(
        normalizedSession.activeAgent || '',
        bracket,
        tokenBudget,
      );
      if (hints.length > 0) {
        const memoryResult = { layer: 'memory', rules: hints, metadata: { layer: 'memory', source: 'memory' } };
        results.push(memoryResult);
        previousLayers.push(memoryResult);
      }
    }

    metrics.totalEnd = process.hrtime.bigint();
    const summary = metrics.getSummary();

    // Persist hook metrics (fire-and-forget)
    this._persistHookMetrics(summary, bracket, mergedConfig);

    // 4. Format output
    const xml = formatSynapseRules(
      results,
      bracket,
      contextPercent,
      normalizedSession,
      mergedConfig.devmode === true,
      summary,
      getTokenBudget(bracket),
      needsHandoffWarning(bracket),
    );

    return { xml, metrics: summary, bracket };
  }

  /**
   * Internal layer execution loop.
   * Executes active layers sequentially, respecting pipeline timeout.
   *
   * @param {string} prompt - The user prompt text.
   * @param {Object} session - Session state.
   * @param {Object} config - Merged configuration.
   * @param {number[]} activeLayers - Array of layer indices to execute.
   * @param {string} bracket - Context bracket name.
   * @param {PipelineMetrics} metrics - Metrics collector instance.
   * @returns {Promise<{ results: Object[], previousLayers: Object[] }>}
   * @private
   */
  async _executeLayers(prompt, session, config, activeLayers, bracket, metrics) {
    const results = [];
    const previousLayers = [];

    for (const layer of this.layers) {
      // Check bracket filter
      if (!activeLayers.includes(layer.layer)) {
        metrics.skipLayer(layer.name, `Not active in ${bracket}`);
        continue;
      }

      // Check hard pipeline timeout
      if (Number(process.hrtime.bigint() - metrics.totalStart) / 1e6 > PIPELINE_TIMEOUT_MS) {
        const remaining = this.layers.slice(this.layers.indexOf(layer));
        for (const r of remaining) {
          if (activeLayers.includes(r.layer) && !metrics.layers[r.name]) {
            metrics.skipLayer(r.name, 'Pipeline timeout');
          }
        }
        break;
      }

      // Execute layer via safe wrapper
      metrics.startLayer(layer.name);
      const context = buildLayerContext({
        prompt,
        session: session || {},
        config,
        synapsePath: this.synapsePath,
        manifest: config.manifest || {},
        previousLayers,
      });

      const result = layer._safeProcess(context);

      if (result && Array.isArray(result.rules)) {
        metrics.endLayer(layer.name, result.rules.length);
        results.push(result);
        previousLayers.push(result);
      } else if (result === null || result === undefined) {
        metrics.skipLayer(layer.name, 'Returned null');
      } else {
        metrics.skipLayer(layer.name, 'Invalid result format');
      }
    }

    return { results, previousLayers };
  }

  /**
   * Persist hook metrics to .synapse/metrics/hook-metrics.json (fire-and-forget).
   * SYN-14: Includes hookBootMs from _hookBootTime passed via processConfig.
   *
   * @param {Object} summary - Pipeline metrics summary.
   * @param {string} bracket - Context bracket name.
   * @param {Object} [config] - Merged config (may contain _hookBootTime bigint).
   * @returns {void}
   * @private
   */
  _persistHookMetrics(summary, bracket, config) {
    try {
      const synapsePath = this.synapsePath;
      if (!synapsePath || !fs.existsSync(synapsePath)) return;
      const metricsDir = path.join(synapsePath, 'metrics');
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true });
      }
      // SYN-14: Calculate hook boot time if _hookBootTime was passed
      const hookBootTime = config && config._hookBootTime;
      const hookBootMs = hookBootTime ? Number(process.hrtime.bigint() - hookBootTime) / 1e6 : 0;
      const data = {
        totalDuration: summary.total_ms,
        hookBootMs,
        bracket,
        layersLoaded: summary.layers_loaded,
        layersSkipped: summary.layers_skipped,
        layersErrored: summary.layers_errored,
        totalRules: summary.total_rules,
        perLayer: {},
        timestamp: new Date().toISOString(),
      };
      // Convert per_layer to serializable format (strip bigint start/end)
      for (const [name, info] of Object.entries(summary.per_layer)) {
        data.perLayer[name] = {
          duration: info.duration || 0,
          status: info.status || 'unknown',
          rules: info.rules || 0,
        };
      }
      fs.writeFileSync(
        path.join(metricsDir, 'hook-metrics.json'),
        JSON.stringify(data, null, 2), 'utf8',
      );
    } catch (err) {
      // Fire-and-forget: never block the hook pipeline, but log the failure
      const ErrorRegistry = require('../../monitor/error-registry');
      ErrorRegistry.log(`[SynapseEngine] Failed to persist hook metrics: ${err.message}`, {
        category: 'SYSTEM',
        display: false,
        raw: true,
      }).catch((e) => console.error(`Failed to log metric error to ErrorRegistry: ${e.message}`));
    }
  }
}

module.exports = {
  SynapseEngine,
  PipelineMetrics,
  PIPELINE_TIMEOUT_MS,
};
