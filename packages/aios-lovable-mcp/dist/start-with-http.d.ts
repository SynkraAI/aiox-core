#!/usr/bin/env node
/**
 * Start AIOS Lovable MCP Server with Streamable HTTP Transport
 *
 * Modern MCP Protocol Implementation (2025-06-18):
 * - Single /mcp endpoint for all JSON-RPC 2.0 communication
 * - Session management via Mcp-Session-Id header
 * - POST for client->server requests, GET for server->client events
 * - Replaces deprecated SSE transport pattern
 *
 * Integration:
 * - Lovable: Settings → Integrations → New MCP Server
 * - URL: https://your-railway-url/mcp
 * - Auth: Bearer token (API key)
 *
 * References:
 * - MCP Protocol: https://modelcontextprotocol.io/
 * - JSON-RPC 2.0: https://www.jsonrpc.org/specification
 */
export {};
//# sourceMappingURL=start-with-http.d.ts.map