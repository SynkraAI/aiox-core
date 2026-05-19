#!/usr/bin/env node

// cli/sync-service-demo.js - Demo com dados fake

const Mappers = require('./mappers');
const { mockSalesData, mockClientsData } = require('./mock-data');
const Database = require('../db/database');

class SyncServiceDemo {
  constructor() {
    this.db = Database;
    this.syncLog = [];
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data,
    };
    console.log(`[${timestamp}] [${level}] ${message}`, data);
    this.syncLog.push(logEntry);
  }

  async syncSales() {
    try {
      this.log('info', '📊 Iniciando sincronização de VENDAS (DEMO)...');

      const tasks = mockSalesData.tasks;
      const mapped = tasks.map(task => Mappers.mapSale(task));

      this.log('info', `✅ Sincronizadas ${mapped.length} vendas (DEMO)`, {
        count: mapped.length,
      });

      return mapped;
    } catch (error) {
      this.log('error', '❌ Erro ao sincronizar vendas', {
        error: error.message,
      });
      throw error;
    }
  }

  async syncClients() {
    try {
      this.log('info', '👥 Iniciando sincronização de CLIENTES (DEMO)...');

      const tasks = mockClientsData.tasks;
      const mapped = tasks.map(task => Mappers.mapClient(task));

      this.log('info', `✅ Sincronizados ${mapped.length} clientes (DEMO)`, {
        count: mapped.length,
      });

      return mapped;
    } catch (error) {
      this.log('error', '❌ Erro ao sincronizar clientes', {
        error: error.message,
      });
      throw error;
    }
  }

  async runFullSync() {
    console.log('\n🚀 INICIANDO SINCRONIZAÇÃO COMPLETA (DEMO)\n');

    try {
      const sales = await this.syncSales();
      const clients = await this.syncClients();

      // Enriquecer vendas com nomes de clientes
      const enrichedSales = Mappers.enrichSalesWithClientNames(sales, clients);

      const metrics = Mappers.calculateMetrics(enrichedSales);

      // Persistir dados no banco (mesmo em DEMO)
      this.db.saveSales(enrichedSales);
      this.db.saveClients(clients);
      this.db.saveMetrics(metrics);

      // Registrar no log de sincronização
      this.db.addSyncLog({
        operation: 'demo_sync',
        success: true,
        salesCount: sales.length,
        clientsCount: clients.length,
      });

      console.log('\n' + '='.repeat(70));
      console.log('📈 MÉTRICAS FINANCEIRAS (DEMO)');
      console.log('='.repeat(70));
      console.log(`Faturado Total:        R$ ${(metrics.total_negotiated / 100).toFixed(2)}`);
      console.log(`Recebido Total:        R$ ${(metrics.total_received / 100).toFixed(2)}`);
      console.log(`Em Aberto:             R$ ${(metrics.total_pending / 100).toFixed(2)}`);
      console.log(`Taxa de Recebimento:   ${metrics.completion_rate}%`);
      console.log(`Dias Médios:           ${metrics.average_days_to_receive} dias`);
      console.log(`Taxa de Inadimplência: ${metrics.default_rate}%`);
      console.log(`Total de Vendas:       ${metrics.total_sales}`);
      console.log(`Total de Clientes:     ${clients.length}`);
      console.log('='.repeat(70) + '\n');

      console.log('💾 Dados persistidos em /data/');
      console.log('🌐 Acesse: http://localhost:3001\n');

      return {
        success: true,
        sales,
        clients,
        metrics,
        syncLog: this.syncLog,
      };
    } catch (error) {
      this.log('error', '🔥 ERRO NA SINCRONIZAÇÃO COMPLETA', {
        error: error.message,
      });

      this.db.addSyncLog({
        operation: 'demo_sync',
        success: false,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        syncLog: this.syncLog,
      };
    }
  }

  async getSalesReport() {
    try {
      const sales = await this.syncSales();
      console.log('\n📋 RELATÓRIO DE VENDAS (DEMO)\n');
      console.log('ID | Cliente           | Faturado  | Recebido  | Status     | Dias');
      console.log('-'.repeat(75));

      sales.forEach((sale, i) => {
        const days = sale.due_date
          ? Math.floor((new Date() - new Date(sale.due_date)) / (1000 * 60 * 60 * 24))
          : '-';
        const clientId = (sale.client_id || 'N/A').substring(0, 12);
        console.log(
          `${String(i + 1).padEnd(2)} | ${clientId.padEnd(17)} | ` +
          `R$${String((sale.value_negotiated / 100).toFixed(2)).padEnd(7)} | ` +
          `R$${String((sale.value_received / 100).toFixed(2)).padEnd(7)} | ` +
          `${sale.status.padEnd(10)} | ${days}d`
        );
      });

      console.log('');
      return sales;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error.message);
      throw error;
    }
  }

  async getClientReport() {
    try {
      const clients = await this.syncClients();
      console.log('\n👥 RELATÓRIO DE CLIENTES (DEMO)\n');
      console.log('ID | Nome                    | Email                  | Indústria       | Risco');
      console.log('-'.repeat(90));

      clients.forEach((client, i) => {
        const name = client.name.substring(0, 22).padEnd(22);
        const email = (client.email || 'N/A').substring(0, 20).padEnd(20);
        const industry = (client.industry || 'N/A').substring(0, 15).padEnd(15);
        console.log(
          `${String(i + 1).padEnd(2)} | ${name} | ${email} | ${industry} | ${client.credit_risk}`
        );
      });

      console.log('');
      return clients;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error.message);
      throw error;
    }
  }
}

// CLI Handler
if (require.main === module) {
  const command = process.argv[2] || 'sync';
  const service = new SyncServiceDemo();

  (async () => {
    try {
      switch (command) {
        case 'sync':
          await service.runFullSync();
          break;
        case 'sales':
          await service.getSalesReport();
          break;
        case 'clients':
          await service.getClientReport();
          break;
        case 'help':
          console.log(`
Comandos disponíveis (DEMO):
  sync      - Executar sincronização completa (padrão)
  sales     - Mostrar relatório de vendas
  clients   - Mostrar relatório de clientes
  help      - Mostrar esta mensagem
          `);
          break;
        default:
          console.error(`❌ Comando desconhecido: ${command}`);
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    }
  })();
}

module.exports = SyncServiceDemo;
