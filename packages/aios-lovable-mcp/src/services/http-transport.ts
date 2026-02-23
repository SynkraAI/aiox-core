/**
 * HTTP JSON-RPC Transport for MCP Protocol
 *
 * Implements the modern Streamable HTTP transport pattern for MCP.
 * Single /mcp endpoint handles all JSON-RPC 2.0 communication.
 * Session management via Mcp-Session-Id header.
 *
 * References:
 * - MCP Protocol: https://modelcontextprotocol.io/
 * - JSON-RPC 2.0: https://www.jsonrpc.org/specification
 * - Streamable HTTP: POST requests, JSON-RPC message format
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'express';

interface JSONRPCMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Session represents a single client connection to the MCP server.
 * Maintains message queue and handles request/response correlation.
 */
class MCPSession {
  readonly id: string;
  private messageQueue: JSONRPCMessage[] = [];
  private eventEmitter = new EventEmitter();
  private lastActivity: number = Date.now();
  private timeout: NodeJS.Timeout | null = null;

  constructor(sessionId?: string) {
    this.id = sessionId || uuidv4();
    this.startInactivityTimer();
  }

  /**
   * Queue a JSON-RPC message response for this session.
   * Used when server wants to send a message to client.
   */
  queueMessage(message: JSONRPCMessage): void {
    this.messageQueue.push(message);
    this.eventEmitter.emit('message', message);
    this.updateActivity();
  }

  /**
   * Wait for next queued message(s).
   * Returns pending messages or waits for new ones up to timeout.
   */
  async getMessage(timeoutMs: number = 30000): Promise<JSONRPCMessage[]> {
    const pending = this.messageQueue.splice(0, this.messageQueue.length);
    if (pending.length > 0) {
      return pending;
    }

    // Wait for new messages with timeout
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve([]), timeoutMs);

      const listener = (msg: JSONRPCMessage) => {
        clearTimeout(timer);
        this.eventEmitter.removeListener('message', listener);
        resolve([msg]);
      };

      this.eventEmitter.once('message', listener);
    });
  }

  /**
   * Check if session is still active (not timed out).
   */
  isActive(): boolean {
    return Date.now() - this.lastActivity < 5 * 60 * 1000; // 5 minute timeout
  }

  /**
   * Update last activity timestamp.
   */
  private updateActivity(): void {
    this.lastActivity = Date.now();
  }

  /**
   * Start inactivity timer to clean up stale sessions.
   */
  private startInactivityTimer(): void {
    this.timeout = setTimeout(() => {
      console.error(`[MCPSession] Session ${this.id} timed out due to inactivity`);
      this.eventEmitter.emit('timeout');
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Cleanup resources.
   */
  close(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.eventEmitter.removeAllListeners();
    this.messageQueue = [];
  }
}

/**
 * HTTP Transport Manager for MCP
 * Handles session lifecycle and HTTP endpoint logic.
 */
export class HTTPTransportManager {
  private sessions = new Map<string, MCPSession>();
  private onMessageCallback: ((sessionId: string, message: JSONRPCMessage) => Promise<void>) | null = null;

  /**
   * Set callback to be invoked when client sends a JSON-RPC request.
   */
  setMessageHandler(
    callback: (sessionId: string, message: JSONRPCMessage) => Promise<void>
  ): void {
    this.onMessageCallback = callback;
  }

  /**
   * Get or create a session.
   */
  getOrCreateSession(sessionId?: string): MCPSession {
    const id = sessionId || uuidv4();
    if (!this.sessions.has(id)) {
      const session = new MCPSession(id);
      this.sessions.set(id, session);
      console.error(`[HTTPTransport] Created session: ${id}`);
    }
    return this.sessions.get(id)!;
  }

  /**
   * Send response to session (called by MCP server).
   */
  sendResponse(sessionId: string, message: JSONRPCMessage): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.queueMessage(message);
    }
  }

  /**
   * Handle HTTP POST to /mcp endpoint.
   * Accepts JSON-RPC 2.0 request, processes it, returns response.
   */
  async handlePost(req: Request, res: Response): Promise<any> {
    try {
      const sessionId = (req.headers['mcp-session-id'] as string) || uuidv4();
      const session = this.getOrCreateSession(sessionId);

      // Validate JSON-RPC 2.0 request
      const request = req.body as JSONRPCMessage;
      if (!request.jsonrpc || request.jsonrpc !== '2.0') {
        return res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0"',
          },
          id: request.id || null,
        });
      }

      if (!request.method) {
        return res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request: method is required',
          },
          id: request.id || null,
        });
      }

      // Send session ID to client in response headers
      res.setHeader('Mcp-Session-Id', session.id);

      // For special case of MCP initialization request
      if (request.method === 'initialize' || request.method === 'ping') {
        // These are handled immediately, not queued to server
        return res.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2025-06-18',
            capabilities: {},
            serverInfo: {
              name: 'aios-lovable-mcp',
              version: '0.1.0',
            },
          },
          id: request.id,
        });
      }

      // Pass request to MCP server handler
      if (this.onMessageCallback) {
        await this.onMessageCallback(session.id, request);

        // Wait for response from MCP server (with timeout)
        const responses = await session.getMessage(30000);
        if (responses.length > 0) {
          const response = responses[0];
          res.setHeader('Mcp-Session-Id', session.id);
          return res.json(response);
        }
      }

      // Fallback if no response received
      res.status(504).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error: No response from server',
        },
        id: request.id,
      });
    } catch (error) {
      console.error('[HTTPTransport] POST error:', error);
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        },
        id: (req.body as any)?.id || null,
      });
    }
  }

  /**
   * Handle HTTP GET to /mcp endpoint.
   * Returns server info or establishes long-polling connection for server->client messages.
   */
  async handleGet(req: Request, res: Response): Promise<any> {
    try {
      const sessionId = (req.headers['mcp-session-id'] as string) || uuidv4();
      const session = this.getOrCreateSession(sessionId);

      // If no specific action requested, return server info
      const action = req.query.action as string | undefined;

      if (action === 'poll' || action === 'events') {
        // Long-polling mode: wait for server->client messages
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Mcp-Session-Id', session.id);
        res.setHeader('Cache-Control', 'no-cache');

        const messages = await session.getMessage(30000);
        return res.json({
          messages,
          session_id: session.id,
        });
      }

      // Default: return server info
      res.setHeader('Mcp-Session-Id', session.id);
      res.json({
        name: 'aios-lovable-mcp',
        version: '0.1.0',
        protocolVersion: '2025-06-18',
        session: {
          id: session.id,
          created_at: new Date().toISOString(),
        },
        capabilities: {
          tools: {
            listChanged: true,
            listChangedNotification: true,
          },
        },
      });
    } catch (error) {
      console.error('[HTTPTransport] GET error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Cleanup stale sessions.
   */
  cleanupSessions(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, session] of this.sessions.entries()) {
      if (!session.isActive()) {
        toDelete.push(id);
        session.close();
      }
    }

    for (const id of toDelete) {
      this.sessions.delete(id);
      console.error(`[HTTPTransport] Cleaned up session: ${id}`);
    }
  }
}

// Global singleton instance
export const httpTransport = new HTTPTransportManager();

// Periodic cleanup (every 5 minutes)
setInterval(() => {
  httpTransport.cleanupSessions();
}, 5 * 60 * 1000);
