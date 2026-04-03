/**
 * @module scheduler
 * @description Cron-based scheduler using node-cron. Config-driven, supports multiple schedules.
 */

import cron from 'node-cron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { JobRunner } from './job-runner.js';
import { createLogger, defaultLogger } from '../logging/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HYDRA_ROOT = path.resolve(__dirname, '../..');

/**
 * @typedef {Object} SchedulerConfig
 * @property {boolean} enabled - Whether scheduler is enabled
 * @property {string} timezone - Timezone for cron expressions
 * @property {Object} schedules - Named schedule definitions
 * @property {Object} lock - Lock configuration
 * @property {Object} heartbeat - Heartbeat configuration
 * @property {Object} gracefulShutdown - Shutdown configuration
 * @property {Object} retry - Retry policy configuration
 * @property {Object} circuitBreaker - Circuit breaker configuration
 * @property {Object} rateLimits - Rate limit configuration
 */

export class HydraScheduler {
  /**
   * @param {Object} [options={}]
   * @param {Function} options.pipelineFn - The pipeline function to execute
   * @param {Object} [options.config] - Scheduler config (loaded from YAML if not provided)
   * @param {Object} [options.logger] - Logger instance
   */
  constructor(options = {}) {
    this.pipelineFn = options.pipelineFn;
    this.config = options.config || this._loadConfig();
    this.logger = options.logger || createLogger({ name: 'hydra-scheduler', level: 'info' });

    /** @type {Map<string, import('node-cron').ScheduledTask>} */
    this.tasks = new Map();

    this.jobRunner = new JobRunner({
      retry: this.config.retry || {},
      circuitBreaker: this.config.circuitBreaker || {},
      rateLimits: this.config.rateLimits || {},
      lock: this._resolvePaths(this.config.lock || {}),
      checkpoint: {},
      logger: this.logger,
    });

    this.heartbeatInterval = null;
    this.heartbeatFile = path.resolve(
      HYDRA_ROOT,
      this.config.heartbeat?.file || 'hydra-data/state/heartbeat.json'
    );
    this._shutdownRequested = false;
  }

  /**
   * Start the scheduler. Registers cron jobs and begins heartbeat.
   */
  start() {
    if (!this.config.enabled) {
      this.logger.warn('Scheduler is disabled in config');
      return;
    }

    this.logger.info('Starting HYDRA scheduler');

    // Register cron jobs from config
    const schedules = this.config.schedules || {};
    for (const [name, schedule] of Object.entries(schedules)) {
      if (!schedule.enabled) {
        this.logger.info({ name }, 'Schedule disabled, skipping');
        continue;
      }

      if (!cron.validate(schedule.cron)) {
        this.logger.error({ name, cron: schedule.cron }, 'Invalid cron expression');
        continue;
      }

      const task = cron.schedule(schedule.cron, async () => {
        if (this._shutdownRequested) return;
        this.logger.info({ name, cron: schedule.cron }, 'Cron trigger fired');
        try {
          await this.jobRunner.execute(this.pipelineFn, schedule.options || {});
        } catch (error) {
          this.logger.error({ name, error: error.message }, 'Scheduled job failed');
        }
      }, {
        timezone: this.config.timezone || 'America/Sao_Paulo',
        scheduled: true,
      });

      this.tasks.set(name, task);
      this.logger.info({ name, cron: schedule.cron }, 'Schedule registered');
    }

    // Start heartbeat
    this._startHeartbeat();

    // Register signal handlers
    this._registerSignalHandlers();

    this.logger.info({ schedules: Object.keys(schedules).filter((n) => schedules[n].enabled) },
      'Scheduler started');
  }

  /**
   * Stop the scheduler gracefully.
   * @returns {Promise<void>}
   */
  async stop() {
    this._shutdownRequested = true;
    this.logger.info('Stopping scheduler');

    // Stop all cron tasks
    for (const [name, task] of this.tasks) {
      task.stop();
      this.logger.info({ name }, 'Schedule stopped');
    }
    this.tasks.clear();

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Wait for running pipeline to finish (grace period)
    if (this.jobRunner.isRunning()) {
      const timeout = this.config.gracefulShutdown?.timeoutMs || 30000;
      this.logger.info({ timeout }, 'Waiting for running pipeline to finish');

      await Promise.race([
        new Promise((resolve) => {
          const check = setInterval(() => {
            if (!this.jobRunner.isRunning()) {
              clearInterval(check);
              resolve();
            }
          }, 500);
        }),
        new Promise((resolve) => setTimeout(resolve, timeout)),
      ]);
    }

    this.logger.info('Scheduler stopped');
  }

  /**
   * Get current scheduler status.
   * @returns {Object}
   */
  getStatus() {
    const schedules = {};
    for (const [name, task] of this.tasks) {
      schedules[name] = { active: true };
    }

    return {
      running: !this._shutdownRequested,
      schedules,
      jobRunning: this.jobRunner.isRunning(),
      circuitBreakers: this.jobRunner.getCircuitBreakerSummary(),
      heartbeat: this._getHeartbeat(),
    };
  }

  /**
   * Trigger a manual run (outside of cron schedule).
   * @param {Object} [options={}] - Pipeline options
   * @returns {Promise<Object>}
   */
  async triggerManual(options = {}) {
    this.logger.info('Manual trigger requested');
    return this.jobRunner.execute(this.pipelineFn, options);
  }

  /** @private */
  _loadConfig() {
    try {
      const configPath = path.resolve(__dirname, '../config/scheduler.yaml');
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = yaml.load(raw);
      return parsed.scheduler || {};
    } catch (error) {
      return { enabled: false, schedules: {} };
    }
  }

  /** @private */
  _resolvePaths(lockConfig) {
    if (lockConfig.file) {
      lockConfig.lockFile = path.resolve(HYDRA_ROOT, lockConfig.file);
    }
    return lockConfig;
  }

  /** @private */
  _startHeartbeat() {
    const intervalMs = this.config.heartbeat?.intervalMs || 60000;

    this._writeHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this._writeHeartbeat();
    }, intervalMs);
  }

  /** @private */
  _writeHeartbeat() {
    try {
      const dir = path.dirname(this.heartbeatFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.heartbeatFile, JSON.stringify({
        pid: process.pid,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      }), 'utf-8');
    } catch {
      // Non-critical
    }
  }

  /** @private */
  _getHeartbeat() {
    try {
      if (!fs.existsSync(this.heartbeatFile)) return null;
      return JSON.parse(fs.readFileSync(this.heartbeatFile, 'utf-8'));
    } catch {
      return null;
    }
  }

  /** @private */
  _registerSignalHandlers() {
    const handler = async (signal) => {
      this.logger.info({ signal }, 'Received shutdown signal');
      await this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', handler);
    process.on('SIGINT', handler);
  }
}
