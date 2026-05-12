/**
 * L2 Agent-Scoped Layer Processor
 *
 * Injects agent-specific rules based on the currently active agent.
 * Detects the active agent from session.active_agent.id and finds
 * the matching domain via agentTrigger in the manifest.
 *
 * Authority boundaries (rules containing 'AUTH') are always included.
 *
 * @module core/synapse/layers/l2-agent
 * @version 1.0.0
 * @created Story SYN-4 - Layer Processors L0-L3
 */

const path = require('path');
const { loadDomainFile } = require('../domain/domain-loader');
const LayerProcessor = require('./layer-processor');

/**
 * L2 Agent-Scoped Processor
 *
 * Loads agent-specific domain file when an agent is active.
 * Returns null if no agent is active or no matching domain found.
 *
 * @extends LayerProcessor
 */
class L2AgentProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'agent', layer: 2, timeout: 15 });
  }

  /**
   * Load agent-specific rules based on active agent.
   *
   * Detection flow:
   * 1. Get active agent ID from session.active_agent.id
   * 2. Find domain with matching agentTrigger in manifest
   * 3. Load domain file via domain-loader
   * 4. Filter authority boundaries (rules containing 'AUTH')
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
    const { manifest, synapsePath } = config;

    // 1. Get active agent ID
    const agentId = session.active_agent?.id;
    if (!agentId) {
      return null;
    }

    // 2. Find domain with matching agentTrigger
    const domainKey = Object.keys(manifest.domains || {})
      .find(k => manifest.domains[k].agentTrigger === agentId);

    if (!domainKey) {
      return null;
    }

    // 3. Load domain file
    const domain = manifest.domains[domainKey];
    const domainFile = domain.file
      ? path.join(synapsePath, domain.file)
      : path.join(synapsePath, `agent-${agentId}`);

    const rules = loadDomainFile(domainFile);

    // Graceful degradation: domain file missing or empty
    if (!rules || rules.length === 0) {
      return null;
    }

    // 4. Check for authority boundaries
    const hasAuthority = rules.some(r => r.toUpperCase().includes('AUTH'));

    return {
      rules,
      metadata: {
        layer: 2,
        source: `agent-${agentId}`,
        agentId,
        hasAuthority,
      },
    };
  }
}

module.exports = L2AgentProcessor;
