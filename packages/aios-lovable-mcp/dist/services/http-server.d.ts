/**
 * HTTP REST API Server for Lovable Integration
 *
 * Provides REST endpoints for job management and SSE for real-time updates.
 * Also integrates MCP server via stdio.
 */
import { Express } from 'express';
import { approvalSystem } from './approval-system.js';
export { approvalSystem };
export declare class HttpServer {
    readonly app: Express;
    private port;
    private sseClients;
    constructor(port?: number);
    private setupMiddleware;
    private setupRoutes;
    broadcastJobUpdate(jobId: string, status: any): Promise<void>;
    start(): Promise<void>;
}
//# sourceMappingURL=http-server.d.ts.map