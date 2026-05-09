/**
 * SYNAPSE context runtime exports.
 *
 * @module core/synapse/context
 */

'use strict';

const path = require('path');

const contextTracker = require(path.resolve(__dirname, './context-tracker.js'));
const contextBuilder = require(path.resolve(__dirname, './context-builder.js'));
const hierarchicalContext = require(path.resolve(__dirname, './hierarchical-context-manager.js'));
const semanticHandshake = require(path.resolve(__dirname, './semantic-handshake-engine.js'));

module.exports = {
  ...contextTracker,
  ...contextBuilder,
  ...hierarchicalContext,
  ...semanticHandshake,
};
