/**
 * @module CaptureHook
 * @description Task completion hook for pattern capture
 * @story WIS-5 - Pattern Capture (Internal)
 * @version 1.0.0
 *
 * @example
 * // In task completion flow
 * const { onTaskComplete } = require('./workflow-intelligence/learning/capture-hook');
 * await onTaskComplete('develop', { sessionId: 'abc123', agentId: '@dev' });
 */

'use strict';

const { createPatternCapture } = require('./pattern-capture');
const { createPatternValidator } = require('./pattern-validator');
const { createPatternStore } = require('./pattern-store');

/**
 * Singleton instances
 */
let capture = null;
let validator = null;
let store = null;

/**
 * Check if pattern capture is enabled
 * @returns {boolean} True if enabled
 */
function isEnabled() {
  return process.env.AIOX_PATTERN_CAPTURE !== 'false';
}

/**
 * Get or create singleton instances
 */
function getInstances() {
  if (!capture) {
    capture = createPatternCapture();
  }
  if (!validator) {
    validator = createPatternValidator();
  }
  if (!store) {
    store = createPatternStore();
  }
  return { capture, validator, store };
}

/**
 * Handle task completion event (non-blocking)
 * @param {string} taskName - Name of completed task
 * @param {Object} context - Task context
 * @returns {Promise<Object>} Capture result
 */
async function onTaskComplete(taskName, context = {}) {
  if (!isEnabled()) {
    return { success: false, reason: 'disabled' };
  }

  try {
    const { capture: cap, validator: val, store: st } = getInstances();
    const result = await cap.onTaskComplete(taskName, context);

    if (result.captured && result.pattern) {
      // Validate and store
      const validation = val.validate(result.pattern);

      if (validation.valid) {
        st.save(result.pattern);
        return {
          success: true,
          action: 'stored',
          patternId: result.pattern.id,
        };
      } else {
        return {
          success: false,
          reason: 'validation_failed',
          errors: validation.errors,
        };
      }
    }

    return {
      success: false,
      reason: result.reason || 'not_captured',
    };
  } catch (error) {
    // Silent failure - capture is non-critical
    if (process.env.AIOX_DEBUG === 'true') {
      console.debug('[PatternCapture] Hook failed:', error.message);
    }
    return {
      success: false,
      reason: 'error',
      error: error.message,
    };
  }
}

/**
 * Mark session as failed (for error handling)
 * @param {string} sessionId - Session identifier
 */
function markSessionFailed(sessionId) {
  if (!isEnabled()) return;

  try {
    const { capture: cap } = getInstances();
    cap.markSessionFailed(sessionId);
  } catch (_error) {
    // Ignore errors
  }
}

/**
 * Clear session buffer
 * @param {string} sessionId - Optional session ID
 */
function clearSession(sessionId) {
  if (!isEnabled()) return;

  try {
    const { capture: cap } = getInstances();
    cap.clearSession(sessionId);
  } catch (_error) {
    // Ignore errors
  }
}

/**
 * Reset singleton instances (for testing)
 */
function reset() {
  capture = null;
  validator = null;
  store = null;
}

module.exports = {
  onTaskComplete,
  markSessionFailed,
  clearSession,
  isEnabled,
  reset,
};
