#!/usr/bin/env node
/**
 * Root entry point for Railway - executes aios-lovable-mcp server
 */
(async () => {
  try {
    await import('./packages/aios-lovable-mcp/dist/start-with-http.js');
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
