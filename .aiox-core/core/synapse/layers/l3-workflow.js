/**
 * L3 Workflow Layer Processor
 *
 * Injects workflow-specific rules based on the currently active workflow.
 * Detects the active workflow from session.active_workflow.id and finds
 * the matching domain via workflowTrigger in the manifest.
 *
 * Includes current phase metadata from session.active_workflow.current_phase.
 *
 * @module core/synapse/layers/l3-workflow
 * @version 1.0.0
 * @created Story SYN-4 - Layer Processors L0-L3
 */

const path = require('path');
const { loadDomainFile } = require('../domain/domain-loader');
const LayerProcessor = require('./layer-processor');

/**
 * L3 Workflow Processor
 *
 * Loads workflow-specific domain file when a workflow is active.
 * Returns null if no workflow is active or no matching domain found.
 *
 * @extends LayerProcessor
 */
class L3WorkflowProcessor extends LayerProcessor {
  constructor() {
    super({ name: 'workflow', layer: 3, timeout: 15 });
  }

  /**
   * Load workflow-specific rules based on active workflow.
   *
   * Detection flow:
   * 1. Get active workflow ID from session.active_workflow.id
   * 2. Find domain with matching workflowTrigger in manifest
   * 3. Load domain file via domain-loader
   * 4. Include phase metadata from session
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

    // 1. Get active workflow ID
    const workflowId = session.active_workflow?.id;
    if (!workflowId) {
      return null;
    }

    // 2. Find domain with matching workflowTrigger
    const domainKey = Object.keys(manifest.domains || {})
      .find(k => manifest.domains[k].workflowTrigger === workflowId);

    if (!domainKey) {
      return null;
    }

    // 3. Load domain file
    const domain = manifest.domains[domainKey];
    const domainFile = domain.file
      ? path.join(synapsePath, domain.file)
      : path.join(synapsePath, `workflow-${workflowId}`);

    const rules = loadDomainFile(domainFile);

    // Graceful degradation: domain file missing or empty
    if (!rules || rules.length === 0) {
      return null;
    }

    // 4. Build metadata with phase info
    const phase = session.active_workflow?.current_phase || null;

    return {
      rules,
      metadata: {
        layer: 3,
        source: `workflow-${workflowId}`,
        workflow: workflowId,
        phase,
      },
    };
  }
}

module.exports = L3WorkflowProcessor;
