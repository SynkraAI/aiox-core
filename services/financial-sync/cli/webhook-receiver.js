// cli/webhook-receiver.js - Receptor de webhooks ClickUp para sync em tempo real

const SyncService = require('./sync-service');
const Database = require('../db/database');

class WebhookReceiver {
  constructor() {
    this.sync = new SyncService();
    this.db = Database;
    this.lastSync = null;
    this.syncTimeout = null;
    this.MIN_SYNC_INTERVAL = 10 * 1000; // Mínimo 10 segundos entre syncs
  }

  /**
   * Processa webhook do ClickUp
   * @param {Object} payload - Dados do webhook
   * @returns {Promise<void>}
   */
  async handleWebhook(payload) {
    try {
      const eventType = payload.event;
      const resourceType = payload.event?.split('_')[0] || 'unknown';

      console.log(`\n🔔 [Webhook] Evento recebido: ${eventType}`);
      console.log(`📦 Recurso: ${resourceType}`);

      // Log webhook
      this.db.addSyncLog({
        operation: 'webhook_received',
        success: true,
        eventType,
        resourceType,
      });

      // Agendar sync com debounce (evita múltiplas syncs simultâneas)
      this.scheduleDebouncedSync();
    } catch (error) {
      console.error('[Webhook] Erro ao processar:', error.message);
      this.db.addSyncLog({
        operation: 'webhook_received',
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Agenda sync com debounce (máx 1 sync a cada 10 segundos)
   */
  scheduleDebouncedSync() {
    // Se já tem sync agendado, cancela e reagenda
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    // Se último sync foi há menos de 10 segundos, aguarda
    const timeSinceLastSync = this.lastSync
      ? Date.now() - this.lastSync
      : Infinity;

    if (timeSinceLastSync < this.MIN_SYNC_INTERVAL) {
      const delay = this.MIN_SYNC_INTERVAL - timeSinceLastSync;
      console.log(`⏳ [Webhook] Agendando sync em ${Math.ceil(delay / 1000)}s (debounce)`);

      this.syncTimeout = setTimeout(() => {
        this.triggerSync();
      }, delay);
    } else {
      // Pode sincronizar agora
      this.triggerSync();
    }
  }

  /**
   * Dispara sincronização imediata
   */
  async triggerSync() {
    try {
      this.lastSync = Date.now();
      console.log(`⚡ [Webhook] Sincronizando ClickUp agora...`);

      const result = await this.sync.runFullSync();

      if (result.success) {
        console.log(`✅ [Webhook] Sincronização concluída com sucesso`);
        console.log(`   Vendas: ${result.sales?.length}`);
        console.log(`   Clientes: ${result.clients?.length}`);
      } else {
        console.log(`❌ [Webhook] Sincronização falhou: ${result.error}`);
      }
    } catch (error) {
      console.error('[Webhook] Erro ao sincronizar:', error.message);
      this.db.addSyncLog({
        operation: 'webhook_sync_triggered',
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Valida assinatura do webhook ClickUp
   * @param {string} body - Corpo da requisição (raw)
   * @param {string} signature - Header X-Signature-v1
   * @returns {boolean}
   */
  validateSignature(body, signature) {
    // Em produção, usar hmac com CLICKUP_WEBHOOK_SECRET
    // Por enquanto, apenas log
    console.log('[Webhook] ⚠️ Validação de assinatura desabilitada (configure CLICKUP_WEBHOOK_SECRET)');
    return true;
  }

  /**
   * Retorna status do receiver
   */
  getStatus() {
    return {
      isRunning: true,
      lastSync: this.lastSync ? new Date(this.lastSync).toISOString() : null,
      minSyncInterval: `${this.MIN_SYNC_INTERVAL / 1000}s`,
      debounceActive: !!this.syncTimeout,
    };
  }
}

module.exports = WebhookReceiver;
