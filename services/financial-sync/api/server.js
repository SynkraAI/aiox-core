#!/usr/bin/env node

// api/server.js - API REST Server (Node.js http module, sem Express)

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const SyncService = require('../cli/sync-service');
const Database = require('../db/database');
const WebhookReceiver = require('../cli/webhook-receiver');

const PORT = config.api.port;
const HOST = config.api.host;

class APIServer {
  constructor() {
    this.sync = new SyncService();
    this.db = Database;
    this.webhooks = new WebhookReceiver();
  }

  /**
   * Parse JSON body from request
   */
  async parseBody(req) {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      });
    });
  }

  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature-v1');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      // POST /api/webhooks (ClickUp webhook receiver)
      if (pathname === '/api/webhooks' && req.method === 'POST') {
        const body = await this.parseBody(req);
        console.log(`\n📨 [API] Webhook recebido de ClickUp`);

        // Processar webhook de forma assíncrona
        this.webhooks.handleWebhook(body).catch(err => {
          console.error('[Webhook] Erro:', err.message);
        });

        // Responder imediatamente
        res.writeHead(200);
        return res.end(JSON.stringify({
          status: 'received',
          message: 'Webhook processando...',
        }));
      }

      // GET /dashboard (serve HTML)
      if ((pathname === '/' || pathname === '/dashboard') && req.method === 'GET') {
        const dashboardPath = path.join(__dirname, 'dashboard-pro.html');
        if (fs.existsSync(dashboardPath)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          const html = fs.readFileSync(dashboardPath, 'utf8');
          res.writeHead(200);
          return res.end(html);
        }
      }

      // GET /api/health
      if (pathname === '/api/health' && req.method === 'GET') {
        return res.end(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
        }));
      }

      // GET /api/sync
      if (pathname === '/api/sync' && req.method === 'GET') {
        const result = await this.sync.runFullSync();
        res.writeHead(200);
        return res.end(JSON.stringify(result));
      }

      // GET /api/sales
      if (pathname === '/api/sales' && req.method === 'GET') {
        const data = this.db.getSales();
        res.writeHead(200);
        return res.end(JSON.stringify(data));
      }

      // GET /api/clients
      if (pathname === '/api/clients' && req.method === 'GET') {
        const data = this.db.getClients();
        res.writeHead(200);
        return res.end(JSON.stringify(data));
      }

      // GET /api/metrics
      if (pathname === '/api/metrics' && req.method === 'GET') {
        const data = this.db.getMetrics();
        res.writeHead(200);
        return res.end(JSON.stringify(data));
      }

      // GET /api/logs
      if (pathname === '/api/logs' && req.method === 'GET') {
        const limit = query.limit ? parseInt(query.limit) : 50;
        const logs = this.db.getSyncLogs(limit);
        res.writeHead(200);
        return res.end(JSON.stringify({
          logs,
          count: logs.length,
        }));
      }

      // GET /api/dashboard (dados completos para dashboard)
      if (pathname === '/api/dashboard' && req.method === 'GET') {
        const sales = this.db.getSales();
        const clients = this.db.getClients();
        const metrics = this.db.getMetrics();
        const logs = this.db.getSyncLogs(10);

        res.writeHead(200);
        return res.end(JSON.stringify({
          sales: sales.sales || [],
          clients: clients.clients || [],
          metrics: metrics.metrics || null,
          lastSync: metrics.timestamp,
          recentLogs: logs,
        }));
      }

      // GET /api/events (Server-Sent Events para tempo real)
      if (pathname === '/api/events' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Enviar dados iniciais
        const data = this.db.getMetrics();
        res.write(`data: ${JSON.stringify({ type: 'metrics', data: data.metrics })}\n\n`);

        // Enviar heartbeat a cada 30 segundos
        const heartbeat = setInterval(() => {
          res.write(`: heartbeat\n\n`);
        }, 30000);

        // Enviar atualizações a cada 5 segundos
        const interval = setInterval(() => {
          const metrics = this.db.getMetrics();
          res.write(`data: ${JSON.stringify({ type: 'metrics_update', data: metrics })}\n\n`);
        }, 5000);

        // Limpar ao desconectar
        req.on('close', () => {
          clearInterval(heartbeat);
          clearInterval(interval);
          res.end();
        });

        return;
      }

      // 404
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      console.error('API Error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({
        error: error.message,
      }));
    }
  }

  start() {
    const server = http.createServer((req, res) => this.handleRequest(req, res));

    server.listen(PORT, HOST, () => {
      console.log(`\n🌐 API Server rodando em http://${HOST}:${PORT}`);
      console.log(`📊 Dashboard: http://${HOST}:${PORT}/dashboard`);
      console.log(`📡 API Endpoints:`);
      console.log(`   GET /api/health   - Verificar saúde do servidor`);
      console.log(`   GET /api/sync     - Executar sincronização`);
      console.log(`   GET /api/sales    - Dados de vendas`);
      console.log(`   GET /api/clients  - Dados de clientes`);
      console.log(`   GET /api/metrics  - Métricas financeiras`);
      console.log(`   GET /api/logs     - Logs de sincronização`);
      console.log(`   GET /api/dashboard - Dados completos (JSON)`);
      console.log(`\n`);
    });

    return server;
  }
}

// CLI Handler
if (require.main === module) {
  const server = new APIServer();
  server.start();
}

module.exports = APIServer;
