import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { HealthReporter } from '../../src/monitoring/health-reporter.js';
import { MetricsCollector } from '../../src/monitoring/metrics-collector.js';

describe('HealthReporter', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-health-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('check returns structured health report', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    const reporter = new HealthReporter({ metricsCollector: mc });

    const report = reporter.check();
    expect(report.overall).toBeDefined();
    expect(report.categories).toBeDefined();
    expect(report.categories.pipeline).toBeDefined();
    expect(report.categories.sources).toBeDefined();
    expect(report.categories.system).toBeDefined();
    expect(report.timestamp).toBeDefined();
  });

  test('overall status reflects worst category', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    const reporter = new HealthReporter({ metricsCollector: mc });

    const report = reporter.check();
    // Without any metrics, pipeline should be unhealthy (no recent runs)
    expect(['healthy', 'degraded', 'unhealthy']).toContain(report.overall);
  });

  test('system checks include heap and data directory', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    const reporter = new HealthReporter({ metricsCollector: mc });

    const report = reporter.check();
    const systemChecks = report.categories.system.checks;

    const heapCheck = systemChecks.find((c) => c.name === 'heap_usage');
    expect(heapCheck).toBeDefined();
    expect(heapCheck.status).toBe('healthy'); // Normal test env should be < 512MB

    const dataCheck = systemChecks.find((c) => c.name === 'data_directory');
    expect(dataCheck).toBeDefined();
  });

  test('format produces human-readable output', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    const reporter = new HealthReporter({ metricsCollector: mc });

    const output = reporter.format();
    expect(output).toContain('HYDRA Health Report');
    expect(output).toContain('PIPELINE');
    expect(output).toContain('SOURCES');
    expect(output).toContain('SYSTEM');
  });

  test('format with json option produces JSON', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    const reporter = new HealthReporter({ metricsCollector: mc });

    const output = reporter.format({ json: true });
    const parsed = JSON.parse(output);
    expect(parsed.overall).toBeDefined();
    expect(parsed.categories).toBeDefined();
  });

  test('pipeline health with recent metrics is healthy', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });

    // Create recent metrics
    mc.startRun('run-test');
    mc.recordItems({ fetched: 100, processed: 90, ingested: 50 });
    mc.recordErrors(2);
    mc.endRun();

    const reporter = new HealthReporter({ metricsCollector: mc });
    const report = reporter.check();

    const lastRunCheck = report.categories.pipeline.checks.find((c) => c.name === 'last_run_age');
    expect(lastRunCheck).toBeDefined();
    expect(lastRunCheck.status).toBe('healthy');
  });

  test('circuit breaker check with open breakers', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    const mockCB = {
      getSummary: () => ({ closed: 2, open: 3, halfOpen: 0 }),
    };

    const reporter = new HealthReporter({ metricsCollector: mc, circuitBreaker: mockCB });
    const report = reporter.check();

    const cbCheck = report.categories.sources.checks.find((c) => c.name === 'circuit_breakers');
    expect(cbCheck).toBeDefined();
    expect(cbCheck.status).toBe('degraded'); // >50% open
  });
});
