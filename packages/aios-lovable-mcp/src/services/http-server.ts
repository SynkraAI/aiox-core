/**
 * HTTP REST API Server for Lovable Integration
 *
 * Provides REST endpoints for job management and SSE for real-time updates.
 * Also integrates MCP server via stdio.
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { jobQueue, getJobStatus, getJobResult } from './queue.js';
import { apiKeyManager } from './api-keys.js';
import { webhookService } from './webhook.js';
import { approvalSystem } from './approval-system.js';
import type { JobData, JobResult } from '../types/lovable.js';

// Export approval system for use across modules
export { approvalSystem };

interface AuthRequest extends Request {
  apiKey?: string;
}

export class HttpServer {
  readonly app: Express;
  private port: number;
  private sseClients = new Map<string, Response>();

  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // CORS - allow requests from Lovable and other origins
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Mcp-Session-Id', 'Accept'],
      credentials: false,
    }));

    // Parse JSON
    this.app.use(express.json({ limit: '10mb' }));

    // API Key validation middleware
    this.app.use((req: AuthRequest, res, next) => {
      const authHeader = req.headers.authorization || '';
      const match = authHeader.match(/Bearer\s+(.+)/);
      const apiKey = match ? match[1] : req.query.api_key;

      // Skip auth for public endpoints
      if (req.path === '/' || req.path === '/health' || req.path === '/mcp' || req.path === '/api/auth' || req.path === '/sse' || req.path === '/messages') {
        return next();
      }

      if (!apiKey) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'API key required' },
        });
      }

      const validation = apiKeyManager.validateKey(apiKey as string);
      if (!validation.valid) {
        return res.status(401).json({
          error: { code: 'INVALID_KEY', message: validation.error },
        });
      }

      // Check rate limit
      const rateLimit = apiKeyManager.checkRateLimit(apiKey as string);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: { code: 'RATE_LIMITED', message: rateLimit.error },
        });
      }

      req.apiKey = apiKey as string;
      res.set('X-RateLimit-Remaining', String(rateLimit.remaining || 0));
      next();
    });
  }

  private setupRoutes(): void {
    // Root endpoint (no auth required)
    this.app.get('/', (req, res) => {
      res.json({
        name: 'AIOS Lovable MCP Server',
        version: '1.0.0',
        status: 'ready',
        endpoints: {
          health: '/health',
          jobs: '/api/jobs',
          mcp: '/mcp',
        },
      });
    });

    // Note: /mcp endpoint is mounted in start-with-http.ts for SSE transport
    // Do not define /mcp here as it would override the SSE handler

    // Lovable connection test endpoint
    // Note: /api/auth is in the skip-auth list, so we parse the token here directly
    this.app.post('/api/auth', async (req: AuthRequest, res) => {
      try {
        const authHeader = req.headers.authorization || '';
        const match = authHeader.match(/Bearer\s+(.+)/);
        const apiKey = match ? match[1] : (req.query.api_key as string);

        if (!apiKey) {
          return res.status(401).json({
            error: { code: 'UNAUTHORIZED', message: 'API key required' },
          });
        }

        const validation = apiKeyManager.validateKey(apiKey);
        if (!validation.valid) {
          return res.status(401).json({
            error: { code: 'INVALID_KEY', message: validation.error },
          });
        }

        res.json({
          authenticated: true,
          server_name: 'AIOS Lovable MCP',
          ready: true,
        });
      } catch (error) {
        res.status(500).json({
          error: { code: 'AUTH_FAILED', message: 'Authentication failed' },
        });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    // Create async job (with approval requirement)
    this.app.post('/api/jobs', async (req: AuthRequest, res) => {
      try {
        if (!jobQueue) {
          return res.status(503).json({
            error: { code: 'SERVICE_UNAVAILABLE', message: 'Job queue service not available - Redis not configured' },
          });
        }

        const { tool, input, webhook_url, approval_id } = req.body;

        if (!tool || !input) {
          return res.status(400).json({
            error: { code: 'INVALID_REQUEST', message: 'tool and input required' },
          });
        }

        // Check if approval is required and verify it
        if (approval_id) {
          const isApproved = approvalSystem.isApproved(approval_id);
          if (!isApproved) {
            const approvalRequest = approvalSystem.getRequest(approval_id);
            if (!approvalRequest) {
              return res.status(400).json({
                error: { code: 'INVALID_APPROVAL', message: 'Approval request not found' },
              });
            }
            if (approvalRequest.status === 'rejected') {
              return res.status(403).json({
                error: { code: 'APPROVAL_REJECTED', message: approvalRequest.reason || 'Request was rejected' },
              });
            }
            return res.status(202).json({
              status: 'pending_approval',
              approval_id,
              message: 'Awaiting @qa validation. Job will be queued after approval.',
            });
          }
        } else {
          // No approval_id provided - create new approval request
          const requestId = approvalSystem.createRequest(tool, input, req.apiKey || 'unknown');
          return res.status(202).json({
            status: 'pending_approval',
            approval_id: requestId,
            message: 'Tool execution requires @qa approval. Use approval_id to check status.',
            next_step: 'Wait for @qa validation, then retry with approval_id',
          });
        }

        // Approval verified - proceed with job
        const jobData: JobData = {
          tool,
          input,
          webhook_url,
        };

        const jobId = await jobQueue.add(`task-${tool}`, jobData, {
          jobId: undefined, // Let BullMQ generate it
        });

        res.status(202).json({
          job_id: jobId.id,
          status: 'queued',
          status_url: `/api/jobs/${jobId.id}`,
          polling_interval_ms: 1000,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({
          error: { code: 'JOB_CREATION_FAILED', message },
        });
      }
    });

    // Get job status
    this.app.get('/api/jobs/:jobId', async (req: AuthRequest, res) => {
      try {
        const { jobId } = req.params;
        const status = await getJobStatus(jobId);

        if (!status) {
          return res.status(404).json({
            error: { code: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` },
          });
        }

        res.json({
          job_id: jobId,
          status: status.status,
          progress: status.progress,
          output: status.result,
          error: status.error,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({
          error: { code: 'STATUS_CHECK_FAILED', message },
        });
      }
    });

    // Server-Sent Events (SSE) for real-time updates
    this.app.get('/api/jobs/:jobId/stream', (req: AuthRequest, res) => {
      const { jobId } = req.params;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Store client connection
      this.sseClients.set(jobId, res);

      // Send initial connection message
      res.write(`data: ${JSON.stringify({ type: 'connected', job_id: jobId })}\n\n`);

      // Clean up on disconnect
      req.on('close', () => {
        this.sseClients.delete(jobId);
        res.end();
      });

      // Send current status
      setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);
          if (status) {
            res.write(
              `data: ${JSON.stringify({ type: 'status_update', ...status, job_id: jobId })}\n\n`
            );
          }
        } catch (error) {
          console.error('[SSE] Error reading job status:', error);
        }
      }, 1000);
    });

    // API Key management (admin endpoints) - DISABLED
    // Access control delegated to @qa via approval system
    this.app.get('/api/admin/keys', (req: AuthRequest, res) => {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Admin endpoints are disabled. Use @qa approval system instead.',
          more_info: 'Contact @qa (Quinn) for API key management',
        },
      });
    });

    this.app.post('/api/admin/keys', (req: AuthRequest, res) => {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Admin endpoints are disabled. Use @qa approval system instead.',
          more_info: 'Contact @qa (Quinn) for API key management',
        },
      });
    });

    // Approval endpoints (for @qa)
    this.app.get('/api/approval/pending', (req: AuthRequest, res) => {
      // Check if this is @qa
      const pending = approvalSystem.getPendingRequests();
      res.json({
        pending_count: pending.length,
        requests: pending.map(r => ({
          id: r.id,
          tool: r.tool,
          input_summary: JSON.stringify(r.input).substring(0, 100) + '...',
          requested_at: r.requestedAt.toISOString(),
        })),
      });
    });

    this.app.post('/api/approval/:requestId/approve', (req: AuthRequest, res) => {
      const { requestId } = req.params;
      const approved = approvalSystem.approveRequest(requestId, '@qa');

      if (!approved) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Approval request not found' },
        });
      }

      res.json({
        status: 'approved',
        request_id: requestId,
        approval_id: requestId,
        next_step: 'Retry job creation with approval_id parameter',
      });
    });

    this.app.post('/api/approval/:requestId/reject', (req: AuthRequest, res) => {
      const { requestId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          error: { code: 'INVALID_REQUEST', message: 'reason is required' },
        });
      }

      const rejected = approvalSystem.rejectRequest(requestId, reason, '@qa');

      if (!rejected) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Approval request not found' },
        });
      }

      res.json({
        status: 'rejected',
        request_id: requestId,
        reason,
      });
    });

    // Approval report for @qa
    this.app.get('/api/approval/report', (req: AuthRequest, res) => {
      const report = approvalSystem.getReport();
      res.json({
        summary: {
          pending: report.pending,
          approved: report.approved,
          rejected: report.rejected,
        },
        pending_requests: report.requests.map(r => ({
          id: r.id,
          tool: r.tool,
          requested_at: r.requestedAt.toISOString(),
          input_summary: JSON.stringify(r.input).substring(0, 150),
        })),
      });
    });

    // Webhook testing endpoint
    this.app.post('/api/webhooks/test', async (req: AuthRequest, res) => {
      try {
        const { url } = req.body;

        if (!url) {
          return res.status(400).json({
            error: { code: 'INVALID_REQUEST', message: 'url required' },
          });
        }

        const testPayload = {
          job_id: 'test-' + Date.now(),
          status: 'completed' as const,
          progress: 100,
          output: { message: 'Webhook test successful' },
          timestamp: new Date().toISOString(),
        };

        const success = await webhookService.sendUpdate(url, testPayload);

        res.json({
          webhook_url: url,
          delivered: success,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({
          error: { code: 'WEBHOOK_TEST_FAILED', message },
        });
      }
    });
  }

  async broadcastJobUpdate(jobId: string, status: any): Promise<void> {
    const client = this.sseClients.get(jobId);
    if (client && !client.destroyed) {
      client.write(`data: ${JSON.stringify({ type: 'update', ...status, job_id: jobId })}\n\n`);
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.app.listen(this.port, '0.0.0.0', () => {
        console.error(`[HTTP Server] 🚀 Started on 0.0.0.0:${this.port}`);
        console.error(`[HTTP Server] Endpoints:`);
        console.error(`  POST   /api/jobs - Create async job`);
        console.error(`  GET    /api/jobs/:jobId - Check job status`);
        console.error(`  GET    /api/jobs/:jobId/stream - Real-time SSE updates`);
        console.error(`  POST   /api/webhooks/test - Test webhook delivery`);
        console.error(`  GET    /health - Health check`);
        resolve(); // ✓ Resolve promise to allow startup sequence to complete
      }).on('error', (err) => {
        console.error(`[HTTP Server] ❌ Failed to start:`, err);
        reject(err);
      });
    });
  }
}
