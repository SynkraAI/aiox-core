import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { MetricsCollector } from '../../src/monitoring/metrics-collector.js';

describe('MetricsCollector', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-metrics-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('startRun initializes a new metrics record', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    mc.startRun('run-test-001');
    expect(mc._currentRun).not.toBeNull();
    expect(mc._currentRun.runId).toBe('run-test-001');
  });

  test('recordItems updates item metrics', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    mc.startRun('run-test');
    mc.recordItems({ fetched: 100, processed: 80 });

    expect(mc._currentRun.items.fetched).toBe(100);
    expect(mc._currentRun.items.processed).toBe(80);
  });

  test('recordSources updates source metrics', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    mc.startRun('run-test');
    mc.recordSources({ total: 74, active: 70, failed: 4 });

    expect(mc._currentRun.sources.total).toBe(74);
  });

  test('recordTiers updates tier breakdown', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    mc.startRun('run-test');
    mc.recordTiers({ S: 2, A: 10, B: 20 });

    expect(mc._currentRun.tiers.S).toBe(2);
    expect(mc._currentRun.tiers.A).toBe(10);
  });

  test('endRun persists to JSONL file', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    mc.startRun('run-test');
    mc.recordItems({ fetched: 50, processed: 40, ingested: 20 });
    mc.recordErrors(3);

    const result = mc.endRun();
    expect(result).not.toBeNull();
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(result.heap_mb).toBeGreaterThan(0);

    // Check file was written
    const today = new Date().toISOString().split('T')[0];
    const filePath = path.join(tmpDir, `${today}.jsonl`);
    expect(fs.existsSync(filePath)).toBe(true);

    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    expect(lines).toHaveLength(1);

    const saved = JSON.parse(lines[0]);
    expect(saved.runId).toBe('run-test');
    expect(saved.items.fetched).toBe(50);
  });

  test('readMetrics reads JSONL file', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    mc.startRun('run-1');
    mc.recordItems({ processed: 10 });
    mc.endRun();

    mc.startRun('run-2');
    mc.recordItems({ processed: 20 });
    mc.endRun();

    const metrics = mc.readMetrics();
    expect(metrics).toHaveLength(2);
    expect(metrics[0].runId).toBe('run-1');
    expect(metrics[1].runId).toBe('run-2');
  });

  test('readMetrics returns empty array for missing date', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    expect(mc.readMetrics('2020-01-01')).toEqual([]);
  });

  test('getTodaySummary aggregates metrics', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });

    mc.startRun('run-1');
    mc.recordItems({ processed: 10, ingested: 5 });
    mc.recordErrors(1);
    mc.endRun();

    mc.startRun('run-2');
    mc.recordItems({ processed: 20, ingested: 10 });
    mc.recordErrors(2);
    mc.endRun();

    const summary = mc.getTodaySummary();
    expect(summary.runs).toBe(2);
    expect(summary.totalItems).toBe(30);
    expect(summary.totalIngested).toBe(15);
    expect(summary.totalErrors).toBe(3);
  });

  test('getTodaySummary returns defaults when no data', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    const summary = mc.getTodaySummary();
    expect(summary.runs).toBe(0);
  });

  test('endRun returns null when no run active', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    expect(mc.endRun()).toBeNull();
  });

  test('recordItems does nothing without active run', () => {
    const mc = new MetricsCollector({ metricsDir: tmpDir });
    mc.recordItems({ fetched: 100 }); // Should not throw
    expect(mc._currentRun).toBeNull();
  });
});
