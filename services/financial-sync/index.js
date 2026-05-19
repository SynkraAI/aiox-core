#!/usr/bin/env node

// index.js - Orquestrador Principal: API Server + Cron Scheduler

const APIServer = require('./api/server');
const Scheduler = require('./cli/scheduler');

class FinancialSyncOrchestrator {
  constructor() {
    this.apiServer = new APIServer();
    this.scheduler = new Scheduler();
  }

  start() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    💰 FINANCIAL SYNC v1.0                      ║
║            CLI-First Financial Dashboard - ClickUp             ║
╚════════════════════════════════════════════════════════════════╝
    `);

    // Iniciar API Server
    this.apiServer.start();

    // Iniciar Scheduler
    this.scheduler.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n⏹️  Encerrando Financial Sync...');
      this.scheduler.stop();
      process.exit(0);
    });

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ✅ SISTEMA PRONTO                           ║
║                                                                ║
║  🌐 Dashboard:  http://localhost:3001                          ║
║  📡 API:        http://localhost:3001/api                      ║
║  ⏰ Cron:       Sincronização automática a cada 6 horas         ║
║                                                                ║
║  Comandos CLI:                                                 ║
║    npm run sync          Sincronizar (manual)                  ║
║    npm run sync:sales    Relatório de vendas                   ║
║    npm run sync:clients  Relatório de clientes                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
  }
}

// CLI Handler
if (require.main === module) {
  const orchestrator = new FinancialSyncOrchestrator();
  orchestrator.start();
}

module.exports = FinancialSyncOrchestrator;
