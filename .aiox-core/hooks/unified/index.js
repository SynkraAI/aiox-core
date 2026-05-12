/**
 * Unified Hooks Module
 * Story GEMINI-INT.8 - Cross-CLI Hook Abstraction
 *
 * Write hooks once, run on both Claude Code and Gemini CLI.
 */

const { UnifiedHook, EVENT_MAPPING, createContext, formatResult } = require('./hook-interface');
const { HookRegistry, registry } = require('./hook-registry');

module.exports = {
  // Core classes
  UnifiedHook,
  HookRegistry,

  // Singleton registry
  registry,

  // Utilities
  EVENT_MAPPING,
  createContext,
  formatResult,

  // Convenience function to create hooks
  createHook: (config, executeFunc) => {
    class CustomHook extends UnifiedHook {
      constructor() {
        super(config);
      }
      async execute(context) {
        return executeFunc(context);
      }
    }
    return new CustomHook();
  },
};
