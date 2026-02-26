/**
 * AIOS Core Module - ES Module Entry Point
 *
 * Provides ES module exports for all core framework functionality.
 *
 * @module aios-core/core
 * @version 2.0.0
 * @created Story 2.2 - Core Module Creation
 */

// Config subsystem
export { ConfigCache, globalConfigCache } from './config/config-cache.js';
export {
  loadAgentConfig,
  loadConfigSections,
  loadMinimalConfig,
  loadFullConfig,
  preloadConfig,
  clearCache as clearConfigCache,
  getPerformanceMetrics as getConfigPerformanceMetrics,
  agentRequirements,
  ALWAYS_LOADED
} from './config/config-loader.js';

// Session management
export { default as ContextDetector } from './session/context-detector.js';
export { default as SessionContextLoader } from './session/context-loader.js';

// Elicitation system
export { default as ElicitationEngine } from './elicitation/elicitation-engine.js';
export { default as ElicitationSessionManager } from './elicitation/session-manager.js';
export { default as agentElicitationSteps } from './elicitation/agent-elicitation.js';
export { default as taskElicitationSteps } from './elicitation/task-elicitation.js';
export { default as workflowElicitationSteps } from './elicitation/workflow-elicitation.js';

// Utilities
export { default as PersonalizedOutputFormatter } from './utils/output-formatter.js';
export { default as YAMLValidator, validateYAML } from './utils/yaml-validator.js';

// Version info
export const version = '2.0.0';
export const moduleName = 'core';
