/**
 * @module telegram-bot
 * @description Interactive Telegram bot for HYDRA. Accepts commands via polling,
 * executes HYDRA operations, and sends results back to the chat.
 *
 * Commands:
 *   /start, /help  — List available commands
 *   /health        — Pipeline health report
 *   /status        — Scheduler status
 *   /run           — Trigger manual pipeline run
 *   /digest        — Last daily digest
 *   /sources       — List configured sources
 *   /stats         — Pipeline run statistics
 *   /last          — Last pipeline run result
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HYDRA_ROOT = path.resolve(__dirname, '../..');

export class TelegramBot {
  /**
   * @param {Object} options
   * @param {string} options.token - Bot token
   * @param {string} options.chatId - Authorized chat ID
   * @param {Object} [options.handlers] - Command handler overrides
   * @param {Object} [options.logger] - Logger instance
   */
  constructor(options = {}) {
    this.token = options.token || process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = options.chatId || process.env.TELEGRAM_CHAT_ID || '';
    this.logger = options.logger || console;
    this.handlers = options.handlers || {};
    this.offset = 0;
    this.running = false;
    this.pollInterval = options.pollInterval || 3000;
    this._pollTimer = null;

    // External references (injected after construction)
    this.scheduler = null;
    this.pipelineFn = null;
  }

  /**
   * Start polling for updates.
   */
  start() {
    if (!this.token || !this.chatId) {
      this.logger.warn('[TelegramBot] Missing token or chatId — bot disabled');
      return;
    }

    this.running = true;
    this.logger.info?.('[TelegramBot] Bot started, polling for commands...');
    this._poll();
  }

  /**
   * Stop polling.
   */
  stop() {
    this.running = false;
    if (this._pollTimer) {
      clearTimeout(this._pollTimer);
      this._pollTimer = null;
    }
    this.logger.info?.('[TelegramBot] Bot stopped');
  }

  /** @private */
  async _poll() {
    if (!this.running) return;

    try {
      const updates = await this._getUpdates();
      for (const update of updates) {
        this.offset = update.update_id + 1;

        if (update.message?.text && String(update.message.chat.id) === String(this.chatId)) {
          await this._handleMessage(update.message);
        }
      }
    } catch (err) {
      this.logger.error?.(`[TelegramBot] Poll error: ${err.message}`);
    }

    this._pollTimer = setTimeout(() => this._poll(), this.pollInterval);
  }

  /** @private */
  async _handleMessage(message) {
    const text = message.text.trim();
    const command = text.split(' ')[0].toLowerCase().replace('@hydra_aios_bot', '');
    const args = text.split(' ').slice(1).join(' ');

    const commandMap = {
      '/start': () => this._cmdHelp(),
      '/help': () => this._cmdHelp(),
      '/health': () => this._cmdHealth(),
      '/status': () => this._cmdStatus(),
      '/run': () => this._cmdRun(args),
      '/digest': () => this._cmdDigest(),
      '/sources': () => this._cmdSources(),
      '/stats': () => this._cmdStats(),
      '/last': () => this._cmdLast(),
    };

    const handler = this.handlers[command] || commandMap[command];
    if (handler) {
      try {
        const response = await handler();
        if (response) await this.sendMessage(response);
      } catch (err) {
        await this.sendMessage(`❌ Erro ao executar ${command}: ${err.message}`);
      }
    } else if (text.startsWith('/')) {
      await this.sendMessage(`❓ Comando desconhecido: ${command}\nDigite /help para ver comandos disponiveis.`);
    }
  }

  // ─── Commands ────────────────────────────────────────

  async _cmdHelp() {
    return [
      '🐉 *HYDRA Bot — Comandos*',
      '',
      '📊 *Monitoramento:*',
      '/health — Health report do pipeline',
      '/status — Status do scheduler',
      '/stats — Estatisticas de runs',
      '/last — Ultimo resultado do pipeline',
      '',
      '⚡ *Acoes:*',
      '/run — Executar pipeline manual',
      '/run rss — Executar apenas RSS',
      '',
      '📋 *Informacao:*',
      '/digest — Ultimo digest diario',
      '/sources — Fontes configuradas',
      '/help — Esta mensagem',
    ].join('\n');
  }

  async _cmdHealth() {
    try {
      const { HealthReporter } = await import('./health-reporter.js');
      const { MetricsCollector } = await import('./metrics-collector.js');
      const reporter = new HealthReporter({ metricsCollector: new MetricsCollector() });
      const report = reporter.check();

      const icon = { healthy: '🟢', degraded: '🟡', unhealthy: '🔴' };
      const lines = [`${icon[report.overall] || '⚪'} *HYDRA Health: ${report.overall.toUpperCase()}*`, ''];

      for (const [category, data] of Object.entries(report.categories)) {
        lines.push(`${icon[data.status]} *${category}*`);
        for (const check of data.checks) {
          lines.push(`  ${icon[check.status]} ${check.name}: ${check.message}`);
        }
      }

      lines.push('', `_${report.timestamp}_`);
      return lines.join('\n');
    } catch (err) {
      return `❌ Health check falhou: ${err.message}`;
    }
  }

  async _cmdStatus() {
    if (this.scheduler) {
      const status = this.scheduler.getStatus();
      const lines = [
        `⚙️ *Scheduler Status*`,
        '',
        `Running: ${status.running ? '✅' : '❌'}`,
        `Job running: ${status.jobRunning ? '⏳ Sim' : '💤 Nao'}`,
      ];

      const schedules = Object.entries(status.schedules);
      if (schedules.length > 0) {
        lines.push('', '*Schedules:*');
        for (const [name, info] of schedules) {
          lines.push(`  • ${name}: ${info.active ? '✅ ativo' : '❌ inativo'}`);
        }
      }

      if (status.heartbeat) {
        const age = ((Date.now() - new Date(status.heartbeat.timestamp).getTime()) / 60000).toFixed(1);
        lines.push('', `💓 Heartbeat: ${age}min atras (PID: ${status.heartbeat.pid})`);
      }

      return lines.join('\n');
    }

    // Fallback: check heartbeat file
    const heartbeatPath = path.join(HYDRA_ROOT, 'hydra-data/state/heartbeat.json');
    if (fs.existsSync(heartbeatPath)) {
      try {
        const hb = JSON.parse(fs.readFileSync(heartbeatPath, 'utf-8'));
        const age = ((Date.now() - new Date(hb.timestamp).getTime()) / 60000).toFixed(1);
        return `⚙️ *Scheduler*\n💓 Heartbeat: ${age}min atras (PID: ${hb.pid})`;
      } catch {
        return '⚙️ Scheduler: heartbeat file corrompido';
      }
    }

    return '⚙️ Scheduler: *NOT RUNNING* (sem heartbeat)';
  }

  async _cmdRun(args) {
    if (!this.pipelineFn) {
      return '❌ Pipeline nao conectado ao bot. Use `hydra schedule start` para conectar.';
    }

    await this.sendMessage('⏳ Iniciando pipeline manual...');

    try {
      const options = {};
      if (args) {
        options.sourceFilter = args;
      }

      const result = await this.pipelineFn(options);
      return this.formatPipelineReport(result);
    } catch (err) {
      return `❌ Pipeline falhou: ${err.message}`;
    }
  }

  async _cmdDigest() {
    const digestDir = path.join(HYDRA_ROOT, 'hydra-data/digests');
    if (!fs.existsSync(digestDir)) return '📋 Nenhum digest encontrado.';

    const files = fs.readdirSync(digestDir).filter(f => f.endsWith('.md')).sort().reverse();
    if (files.length === 0) return '📋 Nenhum digest encontrado.';

    const latest = files[0];
    const content = fs.readFileSync(path.join(digestDir, latest), 'utf-8');

    // Parse markdown table into telegram-friendly format
    const lines = content.split('\n');
    const summary = [];
    let inTable = false;

    for (const line of lines) {
      if (line.startsWith('# ')) {
        summary.push(`*${line.replace('# ', '')}*`);
      } else if (line.startsWith('## ')) {
        summary.push(`\n*${line.replace('## ', '')}*`);
      } else if (line.startsWith('| ') && !line.includes('---')) {
        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length === 2 && cells[0] !== 'Metric') {
          summary.push(`  ${cells[0]}: *${cells[1]}*`);
        }
        inTable = true;
      } else if (line.startsWith('- **')) {
        summary.push(`  ${line.replace(/\*\*/g, '*')}`);
      } else if (line.startsWith('- ') && !inTable) {
        summary.push(`  ${line}`);
      } else {
        inTable = false;
      }
    }

    // Telegram limit is 4096 chars
    const text = summary.join('\n').slice(0, 4000);
    return text;
  }

  async _cmdSources() {
    try {
      const yaml = (await import('js-yaml')).default;
      const sourcesPath = path.join(HYDRA_ROOT, 'src/config/sources.yaml');
      const config = yaml.load(fs.readFileSync(sourcesPath, 'utf-8'));
      const sources = config.sources || {};

      const counts = {};
      for (const [type, list] of Object.entries(sources)) {
        if (Array.isArray(list)) counts[type] = list.length;
      }

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const lines = [
        `📡 *Fontes Configuradas: ${total}*`,
        '',
      ];

      const typeEmoji = {
        rss: '📰', github: '🐙', youtube: '🎬', podcast: '🎙️',
        twitter: '🐦', web: '🌐', newsletter: '📧',
      };

      for (const [type, count] of Object.entries(counts)) {
        lines.push(`${typeEmoji[type] || '📄'} ${type}: *${count}*`);
      }

      return lines.join('\n');
    } catch (err) {
      return `❌ Erro ao ler fontes: ${err.message}`;
    }
  }

  async _cmdStats() {
    try {
      const { getDedupStore, isSqliteAvailable } = await import('../dedup/dedup-store.js');

      if (!isSqliteAvailable()) return '📊 SQLite nao disponivel para stats.';

      const store = getDedupStore();
      const runs = store.db.prepare(
        'SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 5'
      ).all();

      if (runs.length === 0) return '📊 Nenhum pipeline run registrado.';

      const lines = ['📊 *Ultimos 5 Pipeline Runs*', ''];

      for (const run of runs) {
        const date = run.started_at.split('T')[0];
        const duration = run.duration_ms ? `${(run.duration_ms / 1000).toFixed(0)}s` : '?';
        const tiers = run.tier_breakdown ? JSON.parse(run.tier_breakdown) : {};
        const tierStr = Object.entries(tiers).filter(([, v]) => v > 0).map(([k, v]) => `${k}=${v}`).join(' ');

        lines.push(
          `📅 *${date}* (${duration})`,
          `  Fetched: ${run.items_fetched} | Ingested: ${run.items_stored}`,
          `  Tiers: ${tierStr || 'n/a'} | Errors: ${run.errors}`,
          ''
        );
      }

      return lines.join('\n');
    } catch (err) {
      return `❌ Stats error: ${err.message}`;
    }
  }

  async _cmdLast() {
    try {
      const { getDedupStore, isSqliteAvailable } = await import('../dedup/dedup-store.js');

      if (!isSqliteAvailable()) return '📊 SQLite nao disponivel.';

      const store = getDedupStore();
      const run = store.db.prepare(
        'SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 1'
      ).get();

      if (!run) return '📊 Nenhum run encontrado.';

      const tiers = run.tier_breakdown ? JSON.parse(run.tier_breakdown) : {};
      const tierStr = Object.entries(tiers).filter(([, v]) => v > 0).map(([k, v]) => `${k}=${v}`).join(', ');

      return [
        '📊 *Ultimo Pipeline Run*',
        '',
        `📅 ${run.started_at}`,
        `⏱️ Duracao: ${run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : '?'}`,
        '',
        `📥 Fetched: *${run.items_fetched}*`,
        `🔍 Filtered: *${run.items_filtered}*`,
        `♻️ Duplicates: *${run.items_duplicates}*`,
        `⚙️ Scored: *${run.items_scored}*`,
        `✅ Ingested: *${run.items_stored}*`,
        `🎭 Hallucinated: *${run.items_hallucinated}*`,
        `❌ Errors: *${run.errors}*`,
        '',
        `📊 Tiers: ${tierStr || 'n/a'}`,
      ].join('\n');
    } catch (err) {
      return `❌ Error: ${err.message}`;
    }
  }

  // ─── Report Helpers ──────────────────────────────────

  /**
   * Format a pipeline result as a Telegram message.
   * @param {Object} result - PipelineResult
   * @returns {string}
   */
  formatPipelineReport(result) {
    const tierStr = result.tierBreakdown
      ?.map(t => `${t.tier}=${t.count}`).join(', ') || 'n/a';
    const duration = result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : '?';

    const lines = [
      '📊 *HYDRA Pipeline Report*',
      '',
      `📥 Fetched: *${result.totalFetched}*`,
      `🔍 Filtered: *${result.totalFiltered}*`,
      `♻️ Duplicates: *${result.totalDuplicates}*`,
      `⚙️ Processed: *${result.totalProcessed}*`,
      `✅ Ingested: *${result.totalIngested}*`,
      `🎭 Hallucinated: *${result.totalHallucinated}* removed`,
      `📤 Distributed: *${result.totalDistributed}*`,
      `🧠 Clones: *${result.clonesEnriched}*`,
      '',
      `📊 Tiers: ${tierStr}`,
      `⏱️ Duration: ${duration}`,
      `❌ Errors: ${result.errors?.length || 0}`,
    ];

    if (result.errors?.length > 0) {
      lines.push('', '*Errors:*');
      for (const err of result.errors.slice(0, 5)) {
        lines.push(`  • ${err.slice(0, 100)}`);
      }
      if (result.errors.length > 5) {
        lines.push(`  ... +${result.errors.length - 5} more`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Send a pipeline report to Telegram (called after each run).
   * @param {Object} result - PipelineResult
   */
  async sendPipelineReport(result) {
    const text = this.formatPipelineReport(result);
    await this.sendMessage(text);
  }

  // ─── Telegram API ────────────────────────────────────

  /**
   * Send a message to the configured chat.
   * @param {string} text - Message text (Markdown)
   * @returns {Promise<boolean>}
   */
  async sendMessage(text) {
    if (!this.token || !this.chatId) return false;

    const payload = JSON.stringify({
      chat_id: this.chatId,
      text,
      parse_mode: 'Markdown',
    });

    return new Promise((resolve) => {
      const url = new URL(`https://api.telegram.org/bot${this.token}/sendMessage`);
      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10000,
      }, (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.write(payload);
      req.end();
    });
  }

  /** @private */
  async _getUpdates() {
    const payload = JSON.stringify({
      offset: this.offset,
      timeout: 10,
      allowed_updates: ['message'],
    });

    return new Promise((resolve) => {
      const url = new URL(`https://api.telegram.org/bot${this.token}/getUpdates`);
      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 15000,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.ok ? parsed.result : []);
          } catch {
            resolve([]);
          }
        });
      });

      req.on('error', () => resolve([]));
      req.on('timeout', () => { req.destroy(); resolve([]); });
      req.write(payload);
      req.end();
    });
  }
}
