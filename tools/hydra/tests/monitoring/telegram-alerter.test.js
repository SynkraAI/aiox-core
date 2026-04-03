import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TelegramAlerter, SEVERITY } from '../../src/monitoring/telegram-alerter.js';

describe('TelegramAlerter', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-alerts-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('alert writes to file', async () => {
    const alerter = new TelegramAlerter({
      enabled: true,
      transports: {
        file: { enabled: true, directory: tmpDir },
        webhook: { enabled: false },
      },
    });

    await alerter.alert('test_trigger', SEVERITY.HIGH, 'Test alert message', { key: 'value' });

    const files = fs.readdirSync(tmpDir);
    expect(files.length).toBeGreaterThan(0);

    const content = fs.readFileSync(path.join(tmpDir, files[0]), 'utf-8');
    expect(content).toContain('test_trigger');
    expect(content).toContain('Test alert message');
    expect(content).toContain('HIGH');
  });

  test('alert stores in recentAlerts', async () => {
    const alerter = new TelegramAlerter({
      enabled: true,
      transports: { file: { enabled: false }, webhook: { enabled: false } },
    });

    await alerter.alert('test', SEVERITY.WARN, 'msg');

    const recent = alerter.getRecent();
    expect(recent).toHaveLength(1);
    expect(recent[0].trigger).toBe('test');
  });

  test('disabled alerter does nothing', async () => {
    const alerter = new TelegramAlerter({ enabled: false });

    await alerter.alert('test', SEVERITY.CRITICAL, 'should not appear');
    expect(alerter.getRecent()).toHaveLength(0);
  });

  test('evaluateAndAlert triggers on high error rate', async () => {
    const alerter = new TelegramAlerter({
      enabled: true,
      transports: { file: { enabled: true, directory: tmpDir }, webhook: { enabled: false } },
    });

    await alerter.evaluateAndAlert({
      errors: new Array(30).fill('error'),
      totalFetched: 100,
      totalIngested: 50,
      totalProcessed: 100,
    });

    const recent = alerter.getRecent();
    expect(recent.some((a) => a.trigger === 'high_error_rate')).toBe(true);
  });

  test('evaluateAndAlert triggers on zero ingestion', async () => {
    const alerter = new TelegramAlerter({
      enabled: true,
      transports: { file: { enabled: true, directory: tmpDir }, webhook: { enabled: false } },
    });

    await alerter.evaluateAndAlert({
      errors: [],
      totalFetched: 50,
      totalIngested: 0,
      totalProcessed: 40,
    });

    const recent = alerter.getRecent();
    expect(recent.some((a) => a.trigger === 'zero_ingestion')).toBe(true);
  });

  test('evaluateAndAlert triggers on >50% circuit breakers open', async () => {
    const alerter = new TelegramAlerter({
      enabled: true,
      transports: { file: { enabled: true, directory: tmpDir }, webhook: { enabled: false } },
    });

    await alerter.evaluateAndAlert(
      { errors: [], totalFetched: 10, totalIngested: 5, totalProcessed: 10 },
      { closed: 1, open: 4, halfOpen: 0 }
    );

    const recent = alerter.getRecent();
    expect(recent.some((a) => a.trigger === 'circuit_breakers_open')).toBe(true);
  });

  test('alertPipelineStale sends CRITICAL alert', async () => {
    const alerter = new TelegramAlerter({
      enabled: true,
      transports: { file: { enabled: true, directory: tmpDir }, webhook: { enabled: false } },
    });

    await alerter.alertPipelineStale(30);

    const recent = alerter.getRecent();
    expect(recent).toHaveLength(1);
    expect(recent[0].severity).toBe(SEVERITY.CRITICAL);
    expect(recent[0].trigger).toBe('pipeline_stale');
  });

  test('severity levels enumeration', () => {
    expect(SEVERITY.INFO).toBe('INFO');
    expect(SEVERITY.WARN).toBe('WARN');
    expect(SEVERITY.HIGH).toBe('HIGH');
    expect(SEVERITY.CRITICAL).toBe('CRITICAL');
  });

  test('recent alerts capped at 100', async () => {
    const alerter = new TelegramAlerter({
      enabled: true,
      transports: { file: { enabled: false }, webhook: { enabled: false } },
    });

    for (let i = 0; i < 120; i++) {
      await alerter.alert(`test-${i}`, SEVERITY.INFO, `msg ${i}`);
    }

    // After 120 alerts, it should trim to 50
    expect(alerter.recentAlerts.length).toBeLessThanOrEqual(100);
  });
});
