#!/usr/bin/env node
/**
 * Synkra AIOS MCP Server for Lovable Integration
 *
 * Exposes AIOS agents as MCP tools that Lovable can invoke.
 * Phase 1 (MVP): 2 tools - aios_design_architecture + aios_generate_code
 *
 * Transport: stdio (standard MCP transport for local dev)
 * Auth: Bearer token via AIOS_API_KEY env var (MVP: hardcoded check)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
declare function createServer(): McpServer;
export { createServer };
//# sourceMappingURL=server.d.ts.map