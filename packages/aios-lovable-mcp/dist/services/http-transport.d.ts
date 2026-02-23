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
declare class MCPSession {
    readonly id: string;
    private messageQueue;
    private eventEmitter;
    private lastActivity;
    private timeout;
    constructor(sessionId?: string);
    /**
     * Queue a JSON-RPC message response for this session.
     * Used when server wants to send a message to client.
     */
    queueMessage(message: JSONRPCMessage): void;
    /**
     * Wait for next queued message(s).
     * Returns pending messages or waits for new ones up to timeout.
     */
    getMessage(timeoutMs?: number): Promise<JSONRPCMessage[]>;
    /**
     * Check if session is still active (not timed out).
     */
    isActive(): boolean;
    /**
     * Update last activity timestamp.
     */
    private updateActivity;
    /**
     * Start inactivity timer to clean up stale sessions.
     */
    private startInactivityTimer;
    /**
     * Cleanup resources.
     */
    close(): void;
}
/**
 * HTTP Transport Manager for MCP
 * Handles session lifecycle and HTTP endpoint logic.
 */
export declare class HTTPTransportManager {
    private sessions;
    private onMessageCallback;
    /**
     * Set callback to be invoked when client sends a JSON-RPC request.
     */
    setMessageHandler(callback: (sessionId: string, message: JSONRPCMessage) => Promise<void>): void;
    /**
     * Get or create a session.
     */
    getOrCreateSession(sessionId?: string): MCPSession;
    /**
     * Send response to session (called by MCP server).
     */
    sendResponse(sessionId: string, message: JSONRPCMessage): void;
    /**
     * Handle HTTP POST to /mcp endpoint.
     * Accepts JSON-RPC 2.0 request, processes it, returns response.
     */
    handlePost(req: Request, res: Response): Promise<any>;
    /**
     * Handle HTTP GET to /mcp endpoint.
     * Returns server info or establishes long-polling connection for server->client messages.
     */
    handleGet(req: Request, res: Response): Promise<any>;
    /**
     * Cleanup stale sessions.
     */
    cleanupSessions(): void;
}
export declare const httpTransport: HTTPTransportManager;
export {};
//# sourceMappingURL=http-transport.d.ts.map