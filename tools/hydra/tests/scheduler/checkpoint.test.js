import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Checkpoint } from '../../src/scheduler/checkpoint.js';

describe('Checkpoint', () => {
  let tmpDir;
  let checkpointFile;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-cp-'));
    checkpointFile = path.join(tmpDir, 'checkpoint.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('startRun creates a checkpoint', () => {
    const cp = new Checkpoint({ checkpointFile });
    const data = cp.startRun(['rss', 'github', 'youtube']);

    expect(data.runId).toMatch(/^run-/);
    expect(data.completedGroups).toEqual([]);
    expect(data.pendingGroups).toEqual(['rss', 'github', 'youtube']);
    expect(fs.existsSync(checkpointFile)).toBe(true);
  });

  test('markCompleted moves group from pending to completed', () => {
    const cp = new Checkpoint({ checkpointFile });
    cp.startRun(['rss', 'github', 'youtube']);

    cp.markCompleted('rss');

    const data = cp.load();
    expect(data.completedGroups).toContain('rss');
    expect(data.pendingGroups).not.toContain('rss');
  });

  test('isCompleted returns correct state', () => {
    const cp = new Checkpoint({ checkpointFile });
    cp.startRun(['rss', 'github']);

    expect(cp.isCompleted('rss')).toBe(false);
    cp.markCompleted('rss');
    expect(cp.isCompleted('rss')).toBe(true);
  });

  test('hasResumable returns true when pending groups exist', () => {
    const cp = new Checkpoint({ checkpointFile });
    cp.startRun(['rss', 'github']);
    cp.markCompleted('rss');

    expect(cp.hasResumable()).toBe(true);
  });

  test('hasResumable returns false when all complete', () => {
    const cp = new Checkpoint({ checkpointFile });
    cp.startRun(['rss']);
    cp.markCompleted('rss');

    expect(cp.hasResumable()).toBe(false);
  });

  test('hasResumable returns false with no checkpoint', () => {
    const cp = new Checkpoint({ checkpointFile });
    expect(cp.hasResumable()).toBe(false);
  });

  test('getPendingGroups returns remaining groups', () => {
    const cp = new Checkpoint({ checkpointFile });
    cp.startRun(['rss', 'github', 'youtube']);
    cp.markCompleted('rss');

    expect(cp.getPendingGroups()).toEqual(['github', 'youtube']);
  });

  test('clear removes checkpoint file', () => {
    const cp = new Checkpoint({ checkpointFile });
    cp.startRun(['rss']);

    cp.clear();
    expect(fs.existsSync(checkpointFile)).toBe(false);
    expect(cp.load()).toBeNull();
  });

  test('load returns null when no file', () => {
    const cp = new Checkpoint({ checkpointFile });
    expect(cp.load()).toBeNull();
  });

  test('markCompleted is idempotent', () => {
    const cp = new Checkpoint({ checkpointFile });
    cp.startRun(['rss', 'github']);

    cp.markCompleted('rss');
    cp.markCompleted('rss');

    const data = cp.load();
    expect(data.completedGroups.filter((g) => g === 'rss').length).toBe(1);
  });
});
