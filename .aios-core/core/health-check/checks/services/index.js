/**
 * Service Integration Domain Checks
 *
 * Checks for external service integrations.
 * Domain: services
 *
 * @module aios-core/health-check/checks/services
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const McpIntegrationCheck = require('./mcp-integration');
const GithubCliCheck = require('./github-cli');
const ClaudeCodeCheck = require('./claude-code');
const GeminiCliCheck = require('./gemini-cli');
const ApiEndpointsCheck = require('./api-endpoints');

/**
 * All services domain checks
 */
module.exports = {
  McpIntegrationCheck,
  GithubCliCheck,
  ClaudeCodeCheck,
  GeminiCliCheck,
  ApiEndpointsCheck,
};
