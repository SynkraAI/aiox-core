/**
 * MCP Integration Check
 *
 * Verifies MCP (Model Context Protocol) server integration.
 *
 * @module aios-core/health-check/checks/services/mcp-integration
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * MCP integration check
 *
 * @class McpIntegrationCheck
 * @extends BaseCheck
 */
class McpIntegrationCheck extends BaseCheck {
  constructor() {
    super({
      id: 'services.mcp-integration',
      name: 'MCP Integration',
      description: 'Verifies MCP server configuration',
      domain: CheckDomain.SERVICES,
      severity: CheckSeverity.MEDIUM,
      timeout: 3000,
      cacheable: true,
      healingTier: 0,
      tags: ['mcp', 'integration', 'ai'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const homeDir = os.homedir();

    const mcpConfigs = {
      found: [],
      servers: [],
      issues: [],
    };

    // Check .mcp.json in project
    try {
      const projectMcp = path.join(projectRoot, '.mcp.json');
      const content = await fs.readFile(projectMcp, 'utf8');
      const config = JSON.parse(content);

      mcpConfigs.found.push('.mcp.json (project)');

      if (config.mcpServers) {
        const servers = Object.keys(config.mcpServers);
        mcpConfigs.servers.push(...servers.map((s) => `${s} (project)`));
      }
    } catch {
      // Not found or invalid
    }

    // Check global Claude config
    try {
      const globalConfig = path.join(homeDir, '.claude.json');
      const content = await fs.readFile(globalConfig, 'utf8');
      const config = JSON.parse(content);

      if (config.mcpServers) {
        mcpConfigs.found.push('.claude.json (global)');
        const servers = Object.keys(config.mcpServers);
        mcpConfigs.servers.push(...servers.map((s) => `${s} (global)`));
      }
    } catch {
      // Not found or invalid
    }

    // Check .claude/settings.json
    try {
      const localConfig = path.join(projectRoot, '.claude', 'settings.json');
      const content = await fs.readFile(localConfig, 'utf8');
      const config = JSON.parse(content);

      if (config.mcpServers) {
        mcpConfigs.found.push('.claude/settings.json');
        const servers = Object.keys(config.mcpServers);
        mcpConfigs.servers.push(...servers.map((s) => `${s} (local)`));
      }
    } catch {
      // Not found or invalid
    }

    const details = {
      configs: mcpConfigs.found,
      servers: mcpConfigs.servers,
      serverCount: mcpConfigs.servers.length,
    };

    if (mcpConfigs.found.length === 0) {
      return this.pass('No MCP configuration found (not using MCP)', {
        details,
      });
    }

    if (mcpConfigs.servers.length === 0) {
      return this.warning('MCP config found but no servers defined', {
        recommendation: 'Add MCP servers to your configuration',
        details,
      });
    }

    return this.pass(`MCP configured with ${mcpConfigs.servers.length} server(s)`, {
      details,
    });
  }
}

module.exports = McpIntegrationCheck;
