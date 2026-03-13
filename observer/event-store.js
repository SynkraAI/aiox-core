'use strict';

/**
 * Observer Event Store
 *
 * In-memory circular buffer of AIOX dashboard events.
 * Derives current state from the event stream.
 *
 * No external dependencies — pure Node.js.
 *
 * @module observer/event-store
 */

const MAX_EVENTS = 200;

const PIPELINE_STAGES = [
  'validation',
  'development',
  'self_healing',
  'quality_gate',
  'push',
  'checkpoint',
];

/**
 * Creates a fresh event store instance.
 * Returns a plain object with methods — no class, no this-binding surprises.
 */
function createEventStore() {
  /** @type {Array<Object>} */
  const events = [];

  /** @type {Object|null} */
  let bobStatus = null;

  /** @type {number} */
  const startedAt = Date.now();

  /** @type {number} */
  let connectedClients = 0;

  // Derived state (updated on every addEvent)
  const state = {
    sessionId: null,
    currentPhase: null,
    currentStory: null,
    currentAgent: null,
    activeAgents: {},    // { [agentId]: { name, task, startedAt } }
    pipeline: {
      stages: PIPELINE_STAGES,
      current: null,
      completed: [],
    },
    metrics: {
      total: 0,
      perType: {},
      recentTimestamps: [],  // last 60s timestamps for rate calc
    },
  };

  /**
   * Add an event to the circular buffer and update derived state.
   * @param {Object} event
   */
  function addEvent(event) {
    if (!event || typeof event !== 'object') return;

    // Circular buffer: drop oldest when full
    if (events.length >= MAX_EVENTS) {
      events.shift();
    }
    events.push(event);

    // Update metrics
    state.metrics.total += 1;
    const type = event.type || 'unknown';
    state.metrics.perType[type] = (state.metrics.perType[type] || 0) + 1;

    const now = Date.now();
    state.metrics.recentTimestamps.push(now);
    // Keep only last 60s
    const cutoff = now - 60000;
    while (
      state.metrics.recentTimestamps.length > 0 &&
      state.metrics.recentTimestamps[0] < cutoff
    ) {
      state.metrics.recentTimestamps.shift();
    }

    // Update context from envelope fields.
    // DashboardEmitter._postEvent nests session_id/aiox_agent/aiox_story_id
    // inside data (see dashboard-emitter.js:320-328). Support both shapes.
    const session_id = event.session_id || data.session_id;
    const aiox_agent = event.aiox_agent || data.aiox_agent;
    const aiox_story_id = event.aiox_story_id || data.aiox_story_id;

    if (session_id) state.sessionId = session_id;
    if (aiox_story_id) state.currentStory = aiox_story_id;
    if (aiox_agent) state.currentAgent = aiox_agent;

    // Derive state from event type
    const data = event.data || {};

    switch (type) {
      case 'BobPhaseChange': {
        const phase = data.phase || data.stageName || null;
        if (phase) {
          state.currentPhase = phase;
          state.pipeline.current = phase;
          const idx = PIPELINE_STAGES.indexOf(phase);
          if (idx > 0) {
            state.pipeline.completed = PIPELINE_STAGES.slice(0, idx);
          }
        }
        break;
      }

      case 'BobAgentSpawned': {
        const agentId = data.agent || data.agentId || state.currentAgent;
        if (agentId) {
          state.activeAgents[agentId] = {
            name: data.agentName || agentId,
            task: data.task || null,
            pid: data.pid || null,
            startedAt: event.timestamp || now,
          };
        }
        break;
      }

      case 'BobAgentCompleted': {
        const agentId = data.agent || data.agentId;
        if (agentId && state.activeAgents[agentId]) {
          delete state.activeAgents[agentId];
        }
        break;
      }

      case 'AgentActivated': {
        const agentId = data.agentId || data.aiox_agent || event.aiox_agent;
        if (agentId) {
          state.activeAgents[agentId] = {
            name: data.agentName || data.persona || agentId,
            task: null,
            startedAt: event.timestamp || now,
          };
          state.currentAgent = agentId;
        }
        break;
      }

      case 'AgentDeactivated': {
        const agentId = data.agentId || data.aiox_agent || event.aiox_agent;
        if (agentId) {
          delete state.activeAgents[agentId];
        }
        break;
      }

      case 'SessionStart': {
        if (event.session_id) state.sessionId = event.session_id;
        break;
      }

      case 'SessionEnd': {
        state.activeAgents = {};
        state.currentPhase = null;
        state.currentAgent = null;
        state.pipeline.current = null;
        state.pipeline.completed = [];
        break;
      }

      default:
        break;
    }
  }

  /**
   * Update the cached bob-status.json content and merge relevant fields.
   * @param {Object} status
   */
  function setBobStatus(status) {
    bobStatus = status;

    // Merge pipeline state from bob-status if available
    if (status && status.pipeline) {
      const p = status.pipeline;
      if (p.current_stage) {
        state.currentPhase = p.current_stage;
        state.pipeline.current = p.current_stage;
        state.pipeline.completed = p.completed_stages || [];
      }
    }

    if (status && status.current_agent && status.current_agent.id) {
      state.currentAgent = status.current_agent.id;
    }
  }

  /**
   * Return the last N events (most recent last).
   * @param {number} [n=50]
   * @returns {Array<Object>}
   */
  function getRecentEvents(n = 50) {
    return events.slice(-n);
  }

  /**
   * Return a serializable snapshot of current state.
   * @param {number} [clients=0]
   * @returns {Object}
   */
  function getState(clients) {
    const eventsPerMin = state.metrics.recentTimestamps.length;

    return {
      sessionId: state.sessionId,
      currentPhase: state.currentPhase,
      currentStory: state.currentStory,
      currentAgent: state.currentAgent,
      activeAgents: state.activeAgents,
      pipeline: state.pipeline,
      metrics: {
        total: state.metrics.total,
        perType: state.metrics.perType,
        eventsPerMin,
      },
      bobStatus,
      uptime: Date.now() - startedAt,
      connectedClients: clients !== undefined ? clients : connectedClients,
    };
  }

  /** Update connected client count (called by server). */
  function setConnectedClients(n) {
    connectedClients = n;
  }

  /** Reset all state (useful for testing). */
  function reset() {
    events.length = 0;
    bobStatus = null;
    connectedClients = 0;
    Object.assign(state, {
      sessionId: null,
      currentPhase: null,
      currentStory: null,
      currentAgent: null,
      activeAgents: {},
      pipeline: { stages: PIPELINE_STAGES, current: null, completed: [] },
      metrics: { total: 0, perType: {}, recentTimestamps: [] },
    });
  }

  return {
    addEvent,
    setBobStatus,
    getRecentEvents,
    getState,
    setConnectedClients,
    reset,
  };
}

module.exports = { createEventStore };
