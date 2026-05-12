/**
 * Gemini Extensions Module
 * Stories GEMINI-INT.9-12 - Extension Integrations
 */

const { WorkspaceAdapter } = require('./workspace-adapter');
const { CloudRunAdapter } = require('./cloudrun-adapter');
const { SecurityAdapter, Severity } = require('./security-adapter');
const { SupabaseAdapter } = require('./supabase-adapter');

/**
 * Get all extension adapters with availability status
 */
async function getExtensionStatus() {
  const adapters = {
    workspace: new WorkspaceAdapter(),
    cloudrun: new CloudRunAdapter(),
    security: new SecurityAdapter(),
    supabase: new SupabaseAdapter(),
  };

  const status = {};

  for (const [name, adapter] of Object.entries(adapters)) {
    status[name] = {
      available: await adapter.checkAvailability(),
      adapter,
    };
  }

  return status;
}

module.exports = {
  WorkspaceAdapter,
  CloudRunAdapter,
  SecurityAdapter,
  SupabaseAdapter,
  Severity,
  getExtensionStatus,
};
