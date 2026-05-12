'use strict';

const { CodeIntelSource } = require('./data-sources/code-intel-source');
const { renderTree } = require('./renderers/tree-renderer');
const { run } = require('./cli');

/**
 * Get graph data from code-intel or registry fallback.
 * @returns {Promise<Object>} Normalized graph data { nodes, edges, source, isFallback, timestamp }
 */
async function getGraphData() {
  const source = new CodeIntelSource();
  return source.getData();
}

module.exports = {
  getGraphData,
  renderTree,
  run,
  CodeIntelSource,
};
