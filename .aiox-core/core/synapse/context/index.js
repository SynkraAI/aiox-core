/**
 * SYNAPSE context runtime exports.
 *
 * @module core/synapse/context
 */

'use strict';

const contextTracker = require('./context-tracker');
const contextBuilder = require('./context-builder');
const hierarchicalContext = require('./hierarchical-context-manager');

module.exports = {
  ...contextTracker,
  ...contextBuilder,
  ...hierarchicalContext,
};
