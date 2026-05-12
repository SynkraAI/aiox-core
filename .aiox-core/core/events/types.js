/**
 * Dashboard Event Types
 *
 * Shared types for high-level events emitted by the CLI
 * and consumed by the dashboard via monitor-server.
 *
 * @module core/events/types
 */

/**
 * High-level event types for dashboard observability.
 * These complement the low-level tool events (PreToolUse, PostToolUse).
 *
 * @typedef {'AgentActivated'|'AgentDeactivated'|'CommandStart'|'CommandComplete'|'CommandError'|'StoryStatusChange'|'SessionStart'|'SessionEnd'|'BobPhaseChange'|'BobAgentSpawned'|'BobAgentCompleted'|'BobSurfaceDecision'|'BobError'} DashboardEventType
 */

/**
 * @typedef {Object} DashboardEvent
 * @property {string} id - Unique event identifier
 * @property {DashboardEventType} type - Event type
 * @property {number} timestamp - Unix timestamp in milliseconds
 * @property {string} session_id - Claude Code session ID
 * @property {string} [aiox_agent] - AIOX agent ID (dev, architect, qa, etc.)
 * @property {string} [aiox_story_id] - Current story ID being worked on
 * @property {Object} data - Event-specific data
 */

/**
 * Event types enum for runtime use
 */
const DashboardEventType = {
  AGENT_ACTIVATED: 'AgentActivated',
  AGENT_DEACTIVATED: 'AgentDeactivated',
  COMMAND_START: 'CommandStart',
  COMMAND_COMPLETE: 'CommandComplete',
  COMMAND_ERROR: 'CommandError',
  STORY_STATUS_CHANGE: 'StoryStatusChange',
  SESSION_START: 'SessionStart',
  SESSION_END: 'SessionEnd',

  // Story 12.6: Bob-specific event types (AC7, AC10)
  BOB_PHASE_CHANGE: 'BobPhaseChange',
  BOB_AGENT_SPAWNED: 'BobAgentSpawned',
  BOB_AGENT_COMPLETED: 'BobAgentCompleted',
  BOB_SURFACE_DECISION: 'BobSurfaceDecision',
  BOB_ERROR: 'BobError',
};

module.exports = {
  DashboardEventType,
};
