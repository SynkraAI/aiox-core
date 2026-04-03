/**
 * @module health-reporter
 * @description Health check assessment for the HYDRA pipeline.
 * Reports: healthy | degraded | unhealthy status per category.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MetricsCollector } from './metrics-collector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HYDRA_ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.resolve(HYDRA_ROOT, 'hydra-data/state');

/**
 * @typedef {'healthy'|'degraded'|'unhealthy'} HealthStatus
 */

/**
 * @typedef {Object} HealthCheck
 * @property {string} name - Check name
 * @property {HealthStatus} status - Check result
 * @property {string} message - Human-readable explanation
 */

/**
 * @typedef {Object} HealthReport
 * @property {HealthStatus} overall - Overall health status
 * @property {Object<string, { status: HealthStatus, checks: HealthCheck[] }>} categories
 * @property {string} timestamp - ISO timestamp
 */

export class HealthReporter {
  /**
   * @param {Object} [options={}]
   * @param {MetricsCollector} [options.metricsCollector]
   * @param {Object} [options.circuitBreaker] - CircuitBreaker instance
   */
  constructor(options = {}) {
    this.metricsCollector = options.metricsCollector || new MetricsCollector();
    this.circuitBreaker = options.circuitBreaker || null;
  }

  /**
   * Run all health checks and produce a report.
   * @returns {HealthReport}
   */
  check() {
    const pipelineChecks = this._checkPipeline();
    const sourceChecks = this._checkSources();
    const systemChecks = this._checkSystem();

    const categories = {
      pipeline: {
        status: this._categoryStatus(pipelineChecks),
        checks: pipelineChecks,
      },
      sources: {
        status: this._categoryStatus(sourceChecks),
        checks: sourceChecks,
      },
      system: {
        status: this._categoryStatus(systemChecks),
        checks: systemChecks,
      },
    };

    const statuses = Object.values(categories).map((c) => c.status);
    let overall = 'healthy';
    if (statuses.includes('unhealthy')) overall = 'unhealthy';
    else if (statuses.includes('degraded')) overall = 'degraded';

    return {
      overall,
      categories,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate a human-readable health report string.
   * @param {Object} [options={}]
   * @param {boolean} [options.verbose=false]
   * @param {boolean} [options.json=false]
   * @returns {string}
   */
  format(options = {}) {
    const report = this.check();

    if (options.json) {
      return JSON.stringify(report, null, 2);
    }

    const statusIcon = {
      healthy: '[OK]',
      degraded: '[WARN]',
      unhealthy: '[FAIL]',
    };

    let output = `\nHYDRA Health Report — ${statusIcon[report.overall]} ${report.overall.toUpperCase()}\n`;
    output += `${'='.repeat(50)}\n`;

    for (const [category, data] of Object.entries(report.categories)) {
      output += `\n${category.toUpperCase()} ${statusIcon[data.status]}\n`;
      for (const check of data.checks) {
        output += `  ${statusIcon[check.status]} ${check.name}: ${check.message}\n`;
      }
    }

    output += `\n${report.timestamp}\n`;
    return output;
  }

  /** @private */
  _checkPipeline() {
    const checks = [];
    const todayMetrics = this.metricsCollector.readMetrics();

    // Check: Last successful run < 26h
    const heartbeatPath = path.join(STATE_DIR, 'heartbeat.json');
    let lastRunAge = null;
    if (todayMetrics.length > 0) {
      const lastRun = todayMetrics[todayMetrics.length - 1];
      lastRunAge = (Date.now() - new Date(lastRun.timestamp).getTime()) / 3600000;
      checks.push({
        name: 'last_run_age',
        status: lastRunAge < 26 ? 'healthy' : 'unhealthy',
        message: `Last run ${lastRunAge.toFixed(1)}h ago`,
      });
    } else {
      // Check yesterday
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const yesterdayMetrics = this.metricsCollector.readMetrics(yesterday);
      if (yesterdayMetrics.length > 0) {
        const lastRun = yesterdayMetrics[yesterdayMetrics.length - 1];
        lastRunAge = (Date.now() - new Date(lastRun.timestamp).getTime()) / 3600000;
        checks.push({
          name: 'last_run_age',
          status: lastRunAge < 26 ? 'healthy' : 'unhealthy',
          message: `Last run ${lastRunAge.toFixed(1)}h ago`,
        });
      } else {
        checks.push({
          name: 'last_run_age',
          status: 'unhealthy',
          message: 'No recent pipeline runs found',
        });
      }
    }

    // Check: Error rate < 20%
    if (todayMetrics.length > 0) {
      const lastRun = todayMetrics[todayMetrics.length - 1];
      const totalItems = lastRun.items?.processed || 0;
      const errors = lastRun.errors || 0;
      const errorRate = totalItems > 0 ? (errors / totalItems) * 100 : 0;
      checks.push({
        name: 'error_rate',
        status: errorRate < 20 ? 'healthy' : 'degraded',
        message: `Error rate: ${errorRate.toFixed(1)}%`,
      });
    }

    // Check: Ingestion count > 0
    if (todayMetrics.length > 0) {
      const totalIngested = todayMetrics.reduce((sum, m) => sum + (m.items?.ingested || 0), 0);
      checks.push({
        name: 'ingestion_count',
        status: totalIngested > 0 ? 'healthy' : 'degraded',
        message: `${totalIngested} items ingested today`,
      });
    }

    return checks;
  }

  /** @private */
  _checkSources() {
    const checks = [];

    // Check circuit breakers
    if (this.circuitBreaker) {
      const summary = this.circuitBreaker.getSummary();
      const total = summary.closed + summary.open + summary.halfOpen;

      if (total > 0) {
        const openRate = summary.open / total;
        checks.push({
          name: 'circuit_breakers',
          status: openRate < 0.5 ? 'healthy' : 'degraded',
          message: `${summary.closed} closed, ${summary.open} open, ${summary.halfOpen} half-open`,
        });
      }
    }

    // Check sources config exists
    const sourcesPath = path.resolve(__dirname, '../config/sources.yaml');
    const sourcesExist = fs.existsSync(sourcesPath);
    checks.push({
      name: 'sources_config',
      status: sourcesExist ? 'healthy' : 'unhealthy',
      message: sourcesExist ? 'Sources config found' : 'Sources config missing',
    });

    return checks;
  }

  /** @private */
  _checkSystem() {
    const checks = [];

    // Check: Heap usage
    const heapUsed = process.memoryUsage().heapUsed / (1024 * 1024);
    checks.push({
      name: 'heap_usage',
      status: heapUsed < 512 ? 'healthy' : 'degraded',
      message: `Heap: ${heapUsed.toFixed(0)}MB`,
    });

    // Check: Data directory exists and is writable
    const dataDir = path.resolve(HYDRA_ROOT, 'hydra-data');
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      // Check write access
      const testFile = path.join(dataDir, '.health-check-test');
      fs.writeFileSync(testFile, 'ok');
      fs.unlinkSync(testFile);
      checks.push({
        name: 'data_directory',
        status: 'healthy',
        message: 'Data directory writable',
      });
    } catch {
      checks.push({
        name: 'data_directory',
        status: 'unhealthy',
        message: 'Data directory not writable',
      });
    }

    // Check: Scheduler heartbeat (if running as scheduled)
    const heartbeatPath = path.join(STATE_DIR, 'heartbeat.json');
    if (fs.existsSync(heartbeatPath)) {
      try {
        const hb = JSON.parse(fs.readFileSync(heartbeatPath, 'utf-8'));
        const age = (Date.now() - new Date(hb.timestamp).getTime()) / 60000;
        checks.push({
          name: 'scheduler_heartbeat',
          status: age < 5 ? 'healthy' : 'degraded',
          message: `Last heartbeat ${age.toFixed(1)}min ago (PID: ${hb.pid})`,
        });
      } catch {
        checks.push({
          name: 'scheduler_heartbeat',
          status: 'degraded',
          message: 'Heartbeat file corrupted',
        });
      }
    }

    return checks;
  }

  /** @private */
  _categoryStatus(checks) {
    if (checks.some((c) => c.status === 'unhealthy')) return 'unhealthy';
    if (checks.some((c) => c.status === 'degraded')) return 'degraded';
    return 'healthy';
  }
}
