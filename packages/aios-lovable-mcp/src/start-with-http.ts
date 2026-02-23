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

import { createServer } from './server.js';
import { HttpServer } from './services/http-server.js';
import { httpTransport } from './services/http-transport.js';
import type { Request, Response } from 'express';

const HTTP_PORT = parseInt(process.env.PORT || '3000', 10);
// Railway deployment fix - Feb 23

/**
 * Custom HTTP transport bridge for MCP server.
 * Converts JSON-RPC messages to/from MCP server calls.
 */
class MCPHttpBridge {
  private mcpServer: any;
  private sessionHandlers = new Map<string, any>();

  constructor(mcpServer: any) {
    this.mcpServer = mcpServer;
  }

  /**
   * Handle incoming JSON-RPC request from HTTP client.
   * Convert to MCP method call, invoke server, return result as JSON-RPC response.
   */
  async handleRequest(sessionId: string, jsonrpcRequest: any): Promise<void> {
    try {
      const { id, method, params } = jsonrpcRequest;

      console.error(
        `[MCPHttpBridge] Session ${sessionId}: ${method} (id: ${id})`
      );

      // Invoke the MCP server method
      let result: any;

      if (method === 'initialize') {
        result = {
          protocolVersion: '2025-06-18',
          capabilities: {},
          serverInfo: {
            name: 'aios-lovable-mcp',
            version: '0.1.0',
          },
        };
      } else if (method === 'tools/list') {
        // Get list of available tools from MCP server
        result = await this.listTools();
      } else if (method === 'tools/call') {
        // Call a tool
        const { name: toolName, arguments: toolArgs } = params || {};
        result = await this.callTool(toolName, toolArgs || {});
      } else if (method === 'resources/list') {
        result = { resources: [] };
      } else if (method === 'resources/read') {
        result = { contents: [] };
      } else if (method === 'prompts/list') {
        result = { prompts: [] };
      } else {
        throw new Error(`Unknown method: ${method}`);
      }

      // Send JSON-RPC response
      const response: any = {
        jsonrpc: '2.0',
        id,
        result,
      };

      httpTransport.sendResponse(sessionId, response);
    } catch (error) {
      console.error('[MCPHttpBridge] Error:', error);

      const errorResponse: any = {
        jsonrpc: '2.0',
        id: jsonrpcRequest.id,
        error: {
          code: -32603,
          message: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { details: String(error) },
        },
      };

      httpTransport.sendResponse(sessionId, errorResponse);
    }
  }

  /**
   * List all available MCP tools.
   */
  private async listTools(): Promise<any> {
    const tools = [
      {
        name: 'aios_strategize',
        description:
          'Generate comprehensive product strategy, market positioning, and PRD. Runs @pm agent.',
        inputSchema: {
          type: 'object',
          properties: {
            product_name: { type: 'string', description: 'Name of the product' },
            description: { type: 'string', description: 'Product description' },
            target_segments: { type: 'array', items: { type: 'string' } },
            key_problems: { type: 'array', items: { type: 'string' } },
            success_metrics: { type: 'array', items: { type: 'string' } },
          },
          required: ['product_name'],
        },
      },
      {
        name: 'aios_design_ux',
        description:
          'Generate design system, component specs, wireframes, and accessibility guidelines.',
        inputSchema: {
          type: 'object',
          properties: {
            product_name: { type: 'string' },
            user_flows: { type: 'array', items: { type: 'string' } },
            design_preferences: { type: 'object' },
            accessibility_requirements: { type: 'array', items: { type: 'string' } },
            page_structure: { type: 'array', items: { type: 'string' } },
          },
          required: ['product_name'],
        },
      },
      {
        name: 'aios_design_architecture',
        description:
          'Produce a complete system architecture document including stack selection, data model, API design, and security.',
        inputSchema: {
          type: 'object',
          properties: {
            spec: { type: 'string', description: 'Product spec or requirements' },
            requirements: { type: 'object' },
            stack_preference: { type: 'string' },
          },
          required: ['spec'],
        },
      },
      {
        name: 'aios_generate_code',
        description:
          'Generate production-ready implementation code (React/Next.js components, API routes, schemas).',
        inputSchema: {
          type: 'object',
          properties: {
            spec: { type: 'string' },
            architecture: { type: 'object' },
            ux_spec: { type: 'object' },
            target_files: { type: 'array', items: { type: 'string' } },
            framework: { type: 'string' },
          },
          required: ['spec'],
        },
      },
      {
        name: 'aios_full_pipeline',
        description:
          'Execute end-to-end product development pipeline: strategy → design → architecture → code.',
        inputSchema: {
          type: 'object',
          properties: {
            product_name: { type: 'string' },
            description: { type: 'string' },
            target_segments: { type: 'array', items: { type: 'string' } },
            key_problems: { type: 'array', items: { type: 'string' } },
            design_preferences: { type: 'object' },
            tech_stack: { type: 'string' },
            webhook_url: { type: 'string' },
            phases: {
              type: 'array',
              items: { enum: ['strategy', 'design', 'architecture', 'code'] },
            },
          },
          required: ['product_name', 'description'],
        },
      },
      {
        name: 'aios_get_status',
        description: 'Check the status and progress of an async job or pipeline execution.',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: { type: 'string', description: 'The job ID to check' },
          },
          required: ['job_id'],
        },
      },
      {
        name: 'aios_get_artifact',
        description:
          'Retrieve generated artifacts from a completed job (PRD, strategy, design system, architecture, code).',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: { type: 'string' },
            artifact_type: { enum: ['prd', 'strategy', 'design_system', 'wireframes', 'architecture', 'code_files', 'all'] },
            format: { enum: ['json', 'markdown', 'html', 'zip'] },
          },
          required: ['job_id'],
        },
      },
    ];

    return { tools };
  }

  /**
   * Call an MCP tool with given arguments.
   * Routes to actual tool implementations via orchestrator.
   */
  private async callTool(toolName: string, args: any): Promise<any> {
    console.error(`[MCPHttpBridge] Calling tool: ${toolName}`);

    // Dynamic tool routing - in production would use orchestrator
    try {
      const response = await this.mcpServer.getToolResult?.(toolName, args);
      return response || { success: false, error: `Tool ${toolName} not yet implemented` };
    } catch (error) {
      console.error(`[MCPHttpBridge] Tool ${toolName} error:`, error);
      return {
        success: false,
        error: `Failed to execute ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

async function main(): Promise<void> {
  try {
    // Start HTTP server
    console.error('[Main] Starting HTTP server on port', HTTP_PORT);
    const httpServer = new HttpServer(HTTP_PORT);
    console.error('[Main] ✓ HTTP server instance created');

    // Create MCP server instance
    console.error('[Main] Creating MCP server instance...');
    let mcpServer: any;
    try {
      mcpServer = createServer();
      console.error('[Main] ✓ MCP server created successfully');
    } catch (e) {
      console.error('[Main] ✗ FAILED to create MCP server:', e);
      throw new Error(`MCP server creation failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Create HTTP bridge
    console.error('[Main] Creating MCPHttpBridge...');
    let bridge: MCPHttpBridge;
    try {
      bridge = new MCPHttpBridge(mcpServer);
      console.error('[Main] ✓ MCPHttpBridge created successfully');
    } catch (e) {
      console.error('[Main] ✗ FAILED to create MCPHttpBridge:', e);
      throw new Error(`MCPHttpBridge creation failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Set message handler on HTTP transport
    console.error('[Main] Setting message handler on HTTP transport...');
    try {
      if (!httpTransport) {
        throw new Error('httpTransport is undefined or not exported properly');
      }
      console.error('[Main] ✓ httpTransport is available');

      if (typeof httpTransport.setMessageHandler !== 'function') {
        throw new Error('httpTransport.setMessageHandler is not a function');
      }
      console.error('[Main] ✓ setMessageHandler method exists');

      httpTransport.setMessageHandler(async (sessionId, jsonrpcRequest) => {
        await bridge.handleRequest(sessionId, jsonrpcRequest);
      });
      console.error('[Main] ✓ Message handler set successfully');
    } catch (e) {
      console.error('[Main] ✗ FAILED to set message handler:', e);
      throw new Error(`Message handler setup failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Mount /mcp endpoint - TEST VERSION
    console.error('[Main] Mounting /mcp endpoints...');
    try {
      httpServer.app.get('/mcp', (req: Request, res: Response) => {
        console.error('[MCP HTTP] GET /mcp - responding with server info');
        res.json({
          name: 'aios-lovable-mcp',
          version: '0.1.0',
          status: 'ready',
          protocol: 'MCP 2025-06-18',
        });
      });
      console.error('[Main] ✓ GET /mcp mounted');

      httpServer.app.post('/mcp', async (req: Request, res: Response) => {
        console.error('[MCP HTTP] POST /mcp - handling JSON-RPC request');
        try {
          await httpTransport.handlePost(req, res);
        } catch (error) {
          console.error('[MCP HTTP] Error in POST:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      console.error('[Main] ✓ POST /mcp mounted');
    } catch (e) {
      console.error('[Main] ✗ FAILED to mount endpoints:', e);
      throw new Error(`Endpoint mounting failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Start the HTTP server
    console.error('[Main] Starting HTTP server...');
    try {
      await httpServer.start();
      console.error('[Main] ✓ HTTP server started successfully');
    } catch (e) {
      console.error('[Main] ✗ FAILED to start HTTP server:', e);
      throw new Error(`HTTP server startup failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Display final status
    console.error(`
================================================================
         AIOS Lovable MCP Server - READY ✓
================================================================

Protocol:          MCP 2025-06-18 (Streamable HTTP)
Transport:         Single /mcp endpoint with JSON-RPC 2.0
Session Mgmt:      Mcp-Session-Id header

Services Running:
   HTTP Server:    http://localhost:${HTTP_PORT}
   MCP Endpoint:   http://localhost:${HTTP_PORT}/mcp
   Health Check:   http://localhost:${HTTP_PORT}/health
   REST API:       http://localhost:${HTTP_PORT}/api/*

7 Available MCP Tools:
   1. aios_strategize          - Product strategy & PRD
   2. aios_design_ux           - Design system & UX specs
   3. aios_design_architecture - System architecture
   4. aios_generate_code       - Code generation
   5. aios_full_pipeline       - End-to-end orchestration
   6. aios_get_status          - Job status monitoring
   7. aios_get_artifact        - Artifact retrieval

Lovable Configuration:
   Server Name:   AIOS Lovable
   Server URL:    http://localhost:${HTTP_PORT}/mcp
   Auth Type:     Bearer token
   Session Header: Mcp-Session-Id

Testing:
   curl -X GET http://localhost:${HTTP_PORT}/mcp
   curl -X POST http://localhost:${HTTP_PORT}/mcp \\
     -H "Content-Type: application/json" \\
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/list"
     }'

Ready for Lovable integration.
================================================================
`);
  } catch (err) {
    console.error('[Main] Fatal error:', err);
    process.exit(1);
  }
}

main();
