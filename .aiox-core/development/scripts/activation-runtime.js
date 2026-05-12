'use strict';

const { UnifiedActivationPipeline } = require('./unified-activation-pipeline');

/**
 * Canonical activation runtime for AIOX agents.
 *
 * This wrapper centralizes agent activation calls so IDE-specific entry points
 * (Codex, Claude Code, scripts) can depend on one stable API.
 */
class ActivationRuntime {
  /**
   * @param {Object} [options]
   * @param {string} [options.projectRoot]
   * @param {UnifiedActivationPipeline} [options.pipeline]
   */
  constructor(options = {}) {
    this.pipeline = options.pipeline || new UnifiedActivationPipeline({
      projectRoot: options.projectRoot,
    });
  }

  /**
   * Activate agent and return the full activation result.
   * @param {string} agentId
   * @param {Object} [options]
   * @returns {Promise<{greeting: string, context: Object, duration: number, quality: string, metrics: Object}>}
   */
  async activate(agentId, options = {}) {
    return this.pipeline.activate(agentId, options);
  }

  /**
   * Activate agent and return only greeting text.
   * @param {string} agentId
   * @param {Object} [options]
   * @returns {Promise<string>}
   */
  async activateGreeting(agentId, options = {}) {
    try {
      const result = await this.activate(agentId, options);
      return result && typeof result.greeting === 'string' ? result.greeting : '';
    } catch (error) {
      throw new Error(`ActivationRuntime.activateGreeting failed for "${agentId}": ${error.message}`);
    }
  }
}

/**
 * Convenience helper for one-shot activation.
 * @param {string} agentId
 * @param {Object} [options]
 * @returns {Promise<{greeting: string, context: Object, duration: number, quality: string, metrics: Object}>}
 */
function activateAgent(agentId, options = {}) {
  const runtime = new ActivationRuntime(options);
  return runtime.activate(agentId, options);
}

module.exports = {
  ActivationRuntime,
  activateAgent,
};
