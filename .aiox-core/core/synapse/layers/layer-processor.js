/**
 * LayerProcessor — Abstract Base Class
 *
 * Defines the contract for all 8 SYNAPSE layer processors.
 * Each layer implements process() to inject contextual rules
 * into the prompt pipeline. The _safeProcess() wrapper provides
 * timeout monitoring and error recovery (graceful degradation).
 *
 * @module core/synapse/layers/layer-processor
 * @version 1.0.0
 * @created Story SYN-4 - Layer Processors L0-L3
 */

/**
 * Abstract base class for SYNAPSE layer processors.
 *
 * Subclasses MUST override process() with their layer-specific logic.
 * Use _safeProcess() as the public entry point — it wraps process()
 * with timeout monitoring and error handling.
 *
 * @abstract
 */
class LayerProcessor {
  /**
   * @param {object} options
   * @param {string} options.name - Layer name (e.g., 'constitution', 'global')
   * @param {number} options.layer - Layer number (0-7)
   * @param {number} [options.timeout=15] - Timeout budget in milliseconds
   */
  constructor({ name, layer, timeout = 15 }) {
    if (new.target === LayerProcessor) {
      throw new Error('LayerProcessor is abstract and cannot be instantiated directly');
    }
    this.name = name;
    this.layer = layer;
    this.timeout = timeout;
  }

  /**
   * Process the layer and return contextual rules.
   *
   * Subclasses MUST override this method.
   *
   * @param {object} context
   * @param {string} context.prompt - Current prompt text
   * @param {object} context.session - Session state (SYN-2 schema)
   * @param {object} context.config - Config with synapsePath and manifest
   * @param {string} context.config.synapsePath - Base path to .synapse/ directory
   * @param {object} context.config.manifest - Parsed manifest from parseManifest()
   * @param {object[]} context.previousLayers - Results from previous layers
   * @returns {{ rules: string[], metadata: object } | null} Rules and metadata, or null to skip
   */
  process(context) {
    throw new Error(`${this.name}: process() must be implemented by subclass`);
  }

  /**
   * Safe wrapper with timeout guard and error recovery.
   *
   * Calls process() and monitors execution time against the timeout budget.
   * On error, logs a warning and returns null (graceful degradation).
   *
   * @param {object} context - Same as process()
   * @returns {{ rules: string[], metadata: object } | null} Result or null on error/timeout
   */
  _safeProcess(context) {
    const start = Date.now();
    try {
      const result = this.process(context);
      const elapsed = Date.now() - start;
      if (elapsed > this.timeout) {
        console.warn(`[synapse:${this.name}] Warning: Layer exceeded timeout (${elapsed}ms > ${this.timeout}ms)`);
      }
      return result;
    } catch (error) {
      console.warn(`[synapse:${this.name}] Error: ${error.message}`);
      return null;
    }
  }
}

module.exports = LayerProcessor;
