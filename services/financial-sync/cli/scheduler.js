// cli/scheduler.js - Agendador de sincronizações automáticas

const SyncService = require('./sync-service');
const config = require('../config');

class Scheduler {
  constructor() {
    this.sync = new SyncService();
    this.isRunning = false;
    this.nextRun = null;
  }

  async runSync() {
    if (this.isRunning) {
      console.log('[Scheduler] Sync já em andamento, pulando...');
      return;
    }

    this.isRunning = true;
    try {
      console.log(`\n[Scheduler] ⏰ Iniciando sincronização automática em ${new Date().toISOString()}`);
      const result = await this.sync.runFullSync();

      if (result.success) {
        console.log('[Scheduler] ✅ Sincronização completa com sucesso');
      } else {
        console.log('[Scheduler] ❌ Sincronização falhou:', result.error);
      }
    } catch (error) {
      console.error('[Scheduler] 🔥 Erro na sincronização:', error.message);
    } finally {
      this.isRunning = false;
      this.scheduleNext();
    }
  }

  scheduleNext() {
    const syncInterval = config.clickup.syncInterval;
    const now = new Date();
    this.nextRun = new Date(now.getTime() + syncInterval);

    console.log(`[Scheduler] ➡️  Próxima sincronização agendada para: ${this.nextRun.toISOString()}`);
    console.log(`[Scheduler] ⏳ Aguardando ${syncInterval / 1000 / 60 / 60} horas para a próxima sincronização\n`);

    setTimeout(() => this.runSync(), syncInterval);
  }

  start() {
    const intervalMins = config.clickup.syncInterval / 1000 / 60;
    const webhooksEnabled = process.env.WEBHOOKS_ENABLED === 'true';

    console.log('\n🚀 Iniciando Scheduler de Sincronização Automática');
    console.log(`⏰ Intervalo: ${intervalMins} minutos`);
    console.log(`🔌 Webhooks: ${webhooksEnabled ? 'ATIVADOS' : 'desativados (use para tempo real)'}`);

    if (!webhooksEnabled && intervalMins > 60) {
      console.log('\n💡 Dica: Ative webhooks no ClickUp para sincronização instantânea!');
      console.log('   Veja: WEBHOOKS-SETUP.md\n');
    }

    // Executar sincronização imediatamente
    this.runSync();
  }

  stop() {
    console.log('[Scheduler] ⏹️  Parando scheduler');
    // Em uma versão com setInterval, aqui fariamos clearInterval
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.nextRun,
      syncInterval: config.clickup.syncInterval,
    };
  }
}

module.exports = Scheduler;
