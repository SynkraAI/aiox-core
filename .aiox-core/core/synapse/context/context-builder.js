'use strict';

/**
 * Build a normalized context payload for SYNAPSE layer execution.
 *
 * Centralizing this shape avoids drift between engine callers and ensures
 * all layers always receive the same contract.
 *
 * @param {Object} params
 * @param {string} params.prompt
 * @param {Object} params.session
 * @param {Object} params.config
 * @param {string} params.synapsePath
 * @param {Object} [params.manifest]
 * @param {Array<Object>} [params.previousLayers]
 * @returns {{prompt: string, session: Object, config: Object, previousLayers: Array<Object>}}
 */
function buildLayerContext(params) {
  const safeParams = params || {};
  return {
    prompt: safeParams.prompt || '',
    session: safeParams.session || {},
    config: {
      ...(safeParams.config || {}),
      synapsePath: safeParams.synapsePath,
      manifest: safeParams.manifest || {},
    },
    previousLayers: Array.isArray(safeParams.previousLayers) ? safeParams.previousLayers : [],
  };
}

module.exports = {
  buildLayerContext,
};
