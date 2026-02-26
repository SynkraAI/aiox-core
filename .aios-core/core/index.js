/**
 * AIOS Core Module - Entry Point
 *
 * Provides centralized exports for all core framework functionality.
 * This module contains the essential runtime components that all other
 * modules depend on.
 *
 * @module aios-core/core
 * @version 2.0.0
 * @created Story 2.2 - Core Module Creation
 */

// Config subsystem
const { ConfigCache, globalConfigCache } = require('./config/config-cache');
const configLoader = require('./config/config-loader');

// Session management
const ContextDetector = require('./session/context-detector');
const SessionContextLoader = require('./session/context-loader');

// Elicitation system
const ElicitationEngine = require('./elicitation/elicitation-engine');
const ElicitationSessionManager = require('./elicitation/session-manager');
const agentElicitationSteps = require('./elicitation/agent-elicitation');
const taskElicitationSteps = require('./elicitation/task-elicitation');
const workflowElicitationSteps = require('./elicitation/workflow-elicitation');

// Utilities
const PersonalizedOutputFormatter = require('./utils/output-formatter');
const YAMLValidator = require('./utils/yaml-validator');
const { validateYAML } = require('./utils/yaml-validator');

// Service Registry
const { ServiceRegistry, getRegistry, loadRegistry } = require('./registry/registry-loader');

// Health Check System
const healthCheck = require('./health-check');

/**
 * Core module exports
 */
module.exports = {
  // Config
  ConfigCache,
  globalConfigCache,
  configLoader,
  loadAgentConfig: configLoader.loadAgentConfig,
  loadConfigSections: configLoader.loadConfigSections,
  loadMinimalConfig: configLoader.loadMinimalConfig,
  loadFullConfig: configLoader.loadFullConfig,
  preloadConfig: configLoader.preloadConfig,
  clearConfigCache: configLoader.clearCache,
  getConfigPerformanceMetrics: configLoader.getPerformanceMetrics,

  // Session
  ContextDetector,
  SessionContextLoader,

  // Elicitation
  ElicitationEngine,
  ElicitationSessionManager,
  agentElicitationSteps,
  taskElicitationSteps,
  workflowElicitationSteps,

  // Utilities
  PersonalizedOutputFormatter,
  YAMLValidator,
  validateYAML,

  // Service Registry
  ServiceRegistry,
  getRegistry,
  loadRegistry,

  // Health Check System
  HealthCheck: healthCheck.HealthCheck,
  HealthCheckEngine: healthCheck.HealthCheckEngine,
  BaseCheck: healthCheck.BaseCheck,
  CheckSeverity: healthCheck.CheckSeverity,
  CheckStatus: healthCheck.CheckStatus,
  CheckRegistry: healthCheck.CheckRegistry,
  healthCheck,

  // Version info
  version: '2.0.0',
  moduleName: 'core',
};
