/**
 * Session Context Loader - Re-export from canonical location
 *
 * @deprecated Use require('../core/session/context-loader') directly
 * @module scripts/session-context-loader
 *
 * This file re-exports SessionContextLoader from its canonical location
 * in core/session/context-loader.js for backward compatibility.
 *
 * Migration note (WIS-3):
 * - Canonical location: .aiox-core/core/session/context-loader.js
 * - This file exists for backward compatibility with existing imports
 * - New code should import from core/session/context-loader directly
 */

'use strict';

// Re-export from canonical location
const SessionContextLoader = require('../core/session/context-loader');

// CLI Interface (preserved for backward compatibility)
if (require.main === module) {
  const loader = new SessionContextLoader();
  const command = process.argv[2];
  const agentId = process.argv[3] || 'dev';

  if (command === 'load') {
    const context = loader.loadContext(agentId);
    console.log(JSON.stringify(context, null, 2));
  } else if (command === 'clear') {
    loader.clearSession();
    console.log('✅ Session cleared');
  } else if (command === 'update') {
    const agentName = process.argv[4] || agentId.toUpperCase();
    const lastCommand = process.argv[5] || null;
    loader.updateSession(agentId, agentName, lastCommand);
    console.log('✅ Session updated');
  } else {
    // Default: show greeting format
    const message = loader.formatForGreeting(agentId);
    console.log(message || '(No session context)');
  }
}

module.exports = SessionContextLoader;
