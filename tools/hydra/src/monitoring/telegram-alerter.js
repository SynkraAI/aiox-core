/**
 * @module telegram-alerter
 * @description Alert system with file and webhook (Telegram/Slack) transports.
 * Evaluates alert triggers and dispatches notifications.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALERTS_DIR = path.resolve(__dirname, '../../hydra-data/alerts');

export const SEVERITY = {
  INFO: 'INFO',
  WARN: 'WARN',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

/**
 * @typedef {Object} Alert
 * @property {string} trigger - What triggered the alert
 * @property {string} severity - CRITICAL | HIGH | WARN | INFO
 * @property {string} message - Human-readable message
 * @property {Object} [data] - Additional data
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} AlerterConfig
 * @property {boolean} [enabled=true] - Enable alerting
 * @property {Object} transports - Transport configuration
 * @property {Object} transports.file - File transport config
 * @property {Object} transports.webhook - Webhook transport config
 */

export class TelegramAlerter {
  /**
   * @param {AlerterConfig} [config={}]
   */
  constructor(config = {}) {
    this.enabled = config.enabled ?? true;
    this.fileEnabled = config.transports?.file?.enabled ?? true;
    this.fileDir = config.transports?.file?.directory
      ? path.resolve(config.transports.file.directory)
      : ALERTS_DIR;
    this.webhookEnabled = config.transports?.webhook?.enabled ?? false;
    this.webhookUrl = config.transports?.webhook?.url || '';
    this.minWebhookSeverity = config.transports?.webhook?.minSeverity || 'HIGH';

    // Telegram native transport (preferred over generic webhook)
    this.telegramEnabled = config.transports?.telegram?.enabled ?? false;
    this.telegramToken = config.transports?.telegram?.token || process.env.TELEGRAM_BOT_TOKEN || '';
    this.telegramChatId = config.transports?.telegram?.chatId || process.env.TELEGRAM_CHAT_ID || '';
    this.minTelegramSeverity = config.transports?.telegram?.minSeverity || 'HIGH';

    /** @type {Alert[]} */
    this.recentAlerts = [];
  }

  /**
   * Send an alert.
   * @param {string} trigger - Alert trigger name
   * @param {string} severity - CRITICAL | HIGH | WARN | INFO
   * @param {string} message - Alert message
   * @param {Object} [data={}] - Additional data
   * @returns {Promise<void>}
   */
  async alert(trigger, severity, message, data = {}) {
    if (!this.enabled) return;

    const alert = {
      trigger,
      severity,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    this.recentAlerts.push(alert);
    if (this.recentAlerts.length > 100) {
      this.recentAlerts = this.recentAlerts.slice(-50);
    }

    // File transport (always for all severities)
    if (this.fileEnabled) {
      this._writeFileAlert(alert);
    }

    // Telegram native transport (preferred)
    if (this.telegramEnabled && this.telegramToken && this.telegramChatId && this._meetsSeverity(severity, this.minTelegramSeverity)) {
      await this._sendTelegram(alert);
    }

    // Webhook transport (fallback for non-Telegram services)
    if (this.webhookEnabled && this.webhookUrl && this._meetsSeverity(severity, this.minWebhookSeverity)) {
      await this._sendWebhook(alert);
    }
  }

  /**
   * Evaluate pipeline result and send alerts for threshold violations.
   * @param {Object} pipelineResult - Pipeline execution result
   * @param {Object} [circuitBreakerState] - Circuit breaker summary
   */
  async evaluateAndAlert(pipelineResult, circuitBreakerState) {
    if (!this.enabled) return;

    const { errors, totalFetched, totalIngested, totalProcessed } = pipelineResult;

    // Error rate > 20%
    if (totalProcessed > 0) {
      const errorRate = (errors.length / totalProcessed) * 100;
      if (errorRate > 20) {
        await this.alert('high_error_rate', SEVERITY.HIGH,
          `Error rate ${errorRate.toFixed(1)}% exceeds 20% threshold`,
          { errorRate, errors: errors.length, processed: totalProcessed });
      }
    }

    // Zero items ingested
    if (totalFetched > 0 && totalIngested === 0) {
      await this.alert('zero_ingestion', SEVERITY.HIGH,
        `No items ingested despite ${totalFetched} items fetched`,
        { fetched: totalFetched });
    }

    // Circuit breakers
    if (circuitBreakerState) {
      const total = circuitBreakerState.closed + circuitBreakerState.open + circuitBreakerState.halfOpen;
      if (total > 0 && circuitBreakerState.open / total >= 0.5) {
        await this.alert('circuit_breakers_open', SEVERITY.HIGH,
          `${circuitBreakerState.open}/${total} circuit breakers are OPEN`,
          circuitBreakerState);
      }
    }
  }

  /**
   * Send a pipeline-not-run alert (called by health check).
   * @param {number} hoursSinceLastRun
   */
  async alertPipelineStale(hoursSinceLastRun) {
    await this.alert('pipeline_stale', SEVERITY.CRITICAL,
      `Pipeline has not run in ${hoursSinceLastRun.toFixed(1)} hours (threshold: 26h)`,
      { hoursSinceLastRun });
  }

  /**
   * Get recent alerts.
   * @param {number} [limit=10]
   * @returns {Alert[]}
   */
  getRecent(limit = 10) {
    return this.recentAlerts.slice(-limit);
  }

  /** @private */
  _writeFileAlert(alert) {
    try {
      if (!fs.existsSync(this.fileDir)) {
        fs.mkdirSync(this.fileDir, { recursive: true });
      }

      const date = new Date().toISOString().split('T')[0];
      const filename = `${date}-${alert.severity}-${alert.trigger}.md`;
      const filePath = path.join(this.fileDir, filename);

      const content = `# Alert: ${alert.trigger}

**Severity:** ${alert.severity}
**Time:** ${alert.timestamp}
**Message:** ${alert.message}

## Data

\`\`\`json
${JSON.stringify(alert.data, null, 2)}
\`\`\`

---
*Generated by HYDRA Alerter*
`;

      fs.appendFileSync(filePath, content + '\n---\n\n', 'utf-8');
    } catch {
      // Non-critical
    }
  }

  /** @private */
  async _sendWebhook(alert) {
    try {
      const payload = JSON.stringify({
        text: `[HYDRA ${alert.severity}] ${alert.trigger}: ${alert.message}`,
      });

      const url = new URL(this.webhookUrl);
      const transport = url.protocol === 'https:' ? https : http;

      await new Promise((resolve, reject) => {
        const req = transport.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 10000,
        }, (res) => {
          res.resume();
          resolve();
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Webhook request timed out'));
        });
        req.write(payload);
        req.end();
      });
    } catch {
      // Webhook failure should not crash the pipeline
    }
  }

  /** @private */
  async _sendTelegram(alert) {
    const severityEmoji = { INFO: 'ℹ️', WARN: '⚠️', HIGH: '🔴', CRITICAL: '🚨' };
    const emoji = severityEmoji[alert.severity] || '📢';

    const text = [
      `${emoji} *HYDRA ${alert.severity}*`,
      `*Trigger:* ${alert.trigger}`,
      `*Message:* ${alert.message}`,
      `*Time:* ${alert.timestamp}`,
    ].join('\n');

    const payload = JSON.stringify({
      chat_id: this.telegramChatId,
      text,
      parse_mode: 'Markdown',
    });

    const url = new URL(`https://api.telegram.org/bot${this.telegramToken}/sendMessage`);

    try {
      await new Promise((resolve, reject) => {
        const req = https.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 10000,
        }, (res) => {
          res.resume();
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Telegram API returned ${res.statusCode}`));
          }
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Telegram request timed out'));
        });
        req.write(payload);
        req.end();
      });
    } catch {
      // Telegram failure should not crash the pipeline
    }
  }

  /** @private */
  _meetsSeverity(severity, minSeverity) {
    const levels = { INFO: 0, WARN: 1, HIGH: 2, CRITICAL: 3 };
    return (levels[severity] || 0) >= (levels[minSeverity] || 2);
  }

  /**
   * @deprecated Use _meetsSeverity instead
   * @private
   */
  _meetsMinSeverity(severity) {
    return this._meetsSeverity(severity, this.minWebhookSeverity);
  }
}
