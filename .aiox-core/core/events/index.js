/**
 * AIOX Events Module
 *
 * Exports for event types and dashboard emitter.
 *
 * @module core/events
 */

const { DashboardEventType } = require('./types');
const { DashboardEmitter, getDashboardEmitter } = require('./dashboard-emitter');

module.exports = {
  DashboardEventType,
  DashboardEmitter,
  getDashboardEmitter,
};
