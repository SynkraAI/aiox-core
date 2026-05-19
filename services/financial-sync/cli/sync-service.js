#!/usr/bin/env node

// cli/sync-service.js - Serviço de sincronização (CLI-First)

const ClickUpClient = require('./clickup-client');
const Mappers = require('./mappers');
const config = require('../config');
const Database = require('../db/database');

class SyncService {
  constructor() {
    this.clickup = new ClickUpClient();
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
      this.log('info', '📊 Iniciando sincronização de VENDAS...');

      const tasks = await this.clickup.getSalesData();
      const mapped = tasks.map(task => Mappers.mapSale(task));

      this.log('info', `✅ Sincronizadas ${mapped.length} vendas`, {
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
      this.log('info', '👥 Iniciando sincronização de CLIENTES...');

      const tasks = await this.clickup.getClientsData();
      const mapped = tasks.map(task => Mappers.mapClient(task));

      this.log('info', `✅ Sincronizados ${mapped.length} clientes`, {
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
    console.log('\n🚀 INICIANDO SINCRONIZAÇÃO COMPLETA\n');

    try {
      const sales = await this.syncSales();
      const clients = await this.syncClients();

      // Enriquecer vendas com nomes de clientes
      const enrichedSales = Mappers.enrichSalesWithClientNames(sales, clients);

      const metrics = Mappers.calculateMetrics(enrichedSales);

      // Persistir dados no banco
      this.db.saveSales(enrichedSales);
      this.db.saveClients(clients);
      this.db.saveMetrics(metrics);

      // Registrar no log de sincronização
      this.db.addSyncLog({
        operation: 'full_sync',
        success: true,
        salesCount: sales.length,
        clientsCount: clients.length,
      });

      console.log('\n' + '='.repeat(60));
      console.log('📈 MÉTRICAS FINANCEIRAS');
      console.log('='.repeat(60));
      console.log(`Faturado Total:        R$ ${(metrics.total_negotiated / 100).toFixed(2)}`);
      console.log(`Recebido Total:        R$ ${(metrics.total_received / 100).toFixed(2)}`);
      console.log(`Em Aberto:             R$ ${(metrics.total_pending / 100).toFixed(2)}`);
      console.log(`Taxa de Recebimento:   ${metrics.completion_rate}%`);
      console.log(`Dias Médios:           ${metrics.average_days_to_receive} dias`);
      console.log(`Taxa de Inadimplência: ${metrics.default_rate}%`);
      console.log(`Total de Vendas:       ${metrics.total_sales}`);
      console.log(`Total de Clientes:     ${clients.length}`);
      console.log('='.repeat(60) + '\n');

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
        operation: 'full_sync',
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
      console.log('\n📋 RELATÓRIO DE VENDAS\n');
      console.log('ID | Cliente | Faturado | Recebido | Status | Dias');
      console.log('-'.repeat(60));

      sales.slice(0, 20).forEach((sale, i) => {
        const days = sale.due_date
          ? Math.floor((new Date() - new Date(sale.due_date)) / (1000 * 60 * 60 * 24))
          : '-';
        console.log(
          `${i + 1} | ${(sale.client_id || 'N/A').substring(0, 8)} | ` +
          `R$${(sale.value_negotiated / 100).toFixed(2)} | ` +
          `R$${(sale.value_received / 100).toFixed(2)} | ` +
          `${sale.status} | ${days}d`
        );
      });

      if (sales.length > 20) {
        console.log(`\n... e mais ${sales.length - 20} vendas`);
      }
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
      console.log('\n👥 RELATÓRIO DE CLIENTES\n');
      console.log('ID | Nome | Email | Indústria | Risco');
      console.log('-'.repeat(60));

      clients.slice(0, 20).forEach((client, i) => {
        console.log(
          `${i + 1} | ${client.name.substring(0, 15)} | ` +
          `${(client.email || 'N/A').substring(0, 15)} | ` +
          `${client.industry || 'N/A'} | ` +
          `${client.credit_risk}`
        );
      });

      if (clients.length > 20) {
        console.log(`\n... e mais ${clients.length - 20} clientes`);
      }
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
  const service = new SyncService();

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
Comandos disponíveis:
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

module.exports = SyncService;
