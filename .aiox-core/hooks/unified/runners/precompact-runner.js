/**
 * PreCompact Hook Runner - Session Digest Trigger
 *
 * Captures session knowledge before context compact via PreCompact hook.
 * Uses fire-and-forget async execution to avoid blocking the compact operation.
 *
 * Architecture: Open Core
 * - aiox-core: Hook runner (this file) + pro detection
 * - aiox-pro: Digest extraction logic (memory/session-digest/)
 *
 * @module .aiox-core/hooks/unified/runners/precompact-runner
 * @see Story MIS-3 - Session Digest (PreCompact Hook)
 * @see Story PRO-5 - aiox-pro Repository Bootstrap
 */

'use strict';

const path = require('path');
const proDetectorPath = path.resolve(__dirname, '../../../..', 'bin', 'utils', 'pro-detector');
const { isProAvailable, loadProModule } = require(proDetectorPath);

/**
 * PreCompact hook handler - Fire-and-forget session digest
 *
 * Execution flow:
 * 1. Detect aiox-pro availability via pro-detector
 * 2. If available, fire-and-forget async digest extraction
 * 3. If not available, graceful no-op (log and return)
 * 4. NEVER block the compact operation (< 5s)
 *
 * @param {Object} context - Hook context from Claude Code
 * @param {string} context.sessionId - Current session identifier
 * @param {string} context.projectDir - Project root directory
 * @param {Object} context.conversation - Conversation metadata
 * @param {string} context.provider - CLI provider ('claude' or 'gemini')
 * @returns {Promise<void>}
 */
async function onPreCompact(context) {
  try {
    // 1. Detect aiox-pro availability
    const proAvailable = isProAvailable();

    if (!proAvailable) {
      console.log('[PreCompact] aiox-pro not available, skipping session digest');
      return; // Graceful degradation - no-op
    }

    // 2. Fire-and-forget async execution (don't block compact)
    setImmediate(async () => {
      try {
        // Dynamic import from aiox-pro
        const digestModule = loadProModule('memory/session-digest/extractor.js');

        if (!digestModule || typeof digestModule.extractSessionDigest !== 'function') {
          console.error('[PreCompact] Digest extractor not found or invalid in aiox-pro');
          return;
        }

        // Execute digest extraction
        await digestModule.extractSessionDigest(context);

        console.log('[PreCompact] Session digest completed successfully');
      } catch (err) {
        // Silent failure - log but don't propagate (never block user)
        console.error('[PreCompact] Digest extraction failed (silent):', err.message);
      }
    });

    // 3. Return immediately - don't wait for digest to complete
    return;
  } catch (err) {
    // Outer error boundary - silent failure
    console.error('[PreCompact] Hook runner error:', err.message);
    // Never throw - graceful degradation
  }
}

/**
 * Get hook configuration for registration
 *
 * @returns {Object} Hook configuration metadata
 */
function getHookConfig() {
  return {
    name: 'precompact-session-digest',
    event: 'PreCompact',
    handler: onPreCompact,
    timeout: 5000, // Max 5s to avoid delaying compact
    description: 'Capture session knowledge before context compact (MIS-3)',
  };
}

module.exports = {
  onPreCompact,
  getHookConfig,
};
