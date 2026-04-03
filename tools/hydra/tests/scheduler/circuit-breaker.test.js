import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CircuitBreaker, CB_STATES } from '../../src/scheduler/circuit-breaker.js';

describe('CircuitBreaker', () => {
  let tmpDir;
  let stateFile;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-cb-'));
    stateFile = path.join(tmpDir, 'cb-state.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('starts in CLOSED state', () => {
    const cb = new CircuitBreaker({ stateFile });
    expect(cb.isOpen('rss')).toBe(false);
  });

  test('opens after failure threshold', () => {
    const cb = new CircuitBreaker({ stateFile, failureThreshold: 3 });

    cb.recordFailure('rss');
    cb.recordFailure('rss');
    expect(cb.isOpen('rss')).toBe(false);

    cb.recordFailure('rss');
    expect(cb.isOpen('rss')).toBe(true);
  });

  test('resets on success', () => {
    const cb = new CircuitBreaker({ stateFile, failureThreshold: 2 });

    cb.recordFailure('github');
    cb.recordFailure('github');
    expect(cb.isOpen('github')).toBe(true);

    // Simulate cooldown by modifying lastFailure
    const breaker = cb.breakers.get('github');
    breaker.lastFailure = Date.now() - 400000; // Past cooldown

    // Now it should be HALF_OPEN
    expect(cb.isOpen('github')).toBe(false);

    cb.recordSuccess('github');
    expect(cb.isOpen('github')).toBe(false);
    expect(cb.breakers.get('github').state).toBe(CB_STATES.CLOSED);
  });

  test('transitions OPEN -> HALF_OPEN after cooldown', () => {
    const cb = new CircuitBreaker({ stateFile, failureThreshold: 1, cooldownMs: 100 });

    cb.recordFailure('youtube');
    expect(cb.isOpen('youtube')).toBe(true);

    // Manipulate time
    const breaker = cb.breakers.get('youtube');
    breaker.lastFailure = Date.now() - 200;

    expect(cb.isOpen('youtube')).toBe(false); // Moved to HALF_OPEN
    expect(breaker.state).toBe(CB_STATES.HALF_OPEN);
  });

  test('HALF_OPEN returns to OPEN on failure', () => {
    const cb = new CircuitBreaker({ stateFile, failureThreshold: 1, cooldownMs: 100 });

    cb.recordFailure('web');
    const breaker = cb.breakers.get('web');
    breaker.lastFailure = Date.now() - 200;
    cb.isOpen('web'); // Trigger HALF_OPEN transition

    cb.recordFailure('web');
    expect(breaker.state).toBe(CB_STATES.OPEN);
  });

  test('persists state to disk', () => {
    const cb1 = new CircuitBreaker({ stateFile, failureThreshold: 2 });
    cb1.recordFailure('rss');
    cb1.recordFailure('rss');

    // Load from disk
    const cb2 = new CircuitBreaker({ stateFile, failureThreshold: 2 });
    expect(cb2.isOpen('rss')).toBe(true);
  });

  test('getSummary returns correct counts', () => {
    const cb = new CircuitBreaker({ stateFile, failureThreshold: 1 });

    cb.recordSuccess('rss'); // CLOSED
    cb.recordFailure('github'); // OPEN

    const summary = cb.getSummary();
    expect(summary.closed).toBe(1);
    expect(summary.open).toBe(1);
  });

  test('reset clears a specific breaker', () => {
    const cb = new CircuitBreaker({ stateFile, failureThreshold: 1 });
    cb.recordFailure('rss');
    expect(cb.isOpen('rss')).toBe(true);

    cb.reset('rss');
    expect(cb.isOpen('rss')).toBe(false);
  });

  test('resetAll clears all breakers', () => {
    const cb = new CircuitBreaker({ stateFile, failureThreshold: 1 });
    cb.recordFailure('rss');
    cb.recordFailure('github');

    cb.resetAll();
    expect(cb.breakers.size).toBe(0);
    // Note: isOpen creates a new CLOSED breaker if not found, so check size first
    expect(cb.isOpen('rss')).toBe(false);
    expect(cb.isOpen('github')).toBe(false);
  });

  test('independent breakers per group', () => {
    const cb = new CircuitBreaker({ stateFile, failureThreshold: 2 });

    cb.recordFailure('rss');
    cb.recordFailure('rss');
    cb.recordFailure('github');

    expect(cb.isOpen('rss')).toBe(true);
    expect(cb.isOpen('github')).toBe(false);
  });
});
