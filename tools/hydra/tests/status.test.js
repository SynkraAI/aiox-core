/**
 * @module status.test
 * @description Tests for status reporting — asserts SQLite-backed reads (Story 1.1b).
 */

import { jest } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { showStatus } from '../src/status.js';
import { getDedupStore, resetDedupStore } from '../src/dedup/dedup-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATUS_SRC = path.resolve(__dirname, '../src/status.js');

describe('status.js (Story 1.1b)', () => {
  let logSpy;
  let tmpDir;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    // Isolate from prod DB: route the singleton to a temp DB
    tmpDir = path.join(os.tmpdir(), `hydra-status-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    resetDedupStore();
    getDedupStore(path.join(tmpDir, 'hydra.db'));
  });

  afterEach(() => {
    logSpy.mockRestore();
    resetDedupStore();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  test('source no longer imports getIndexStats from legacy dedup-index.js (FR7)', () => {
    const src = fs.readFileSync(STATUS_SRC, 'utf-8');
    expect(src).not.toMatch(/getIndexStats/);
    expect(src).not.toMatch(/from\s+['"]\.\/dedup\/dedup-index\.js['"]/);
  });

  test('imports getDedupStore from SQLite-backed dedup-store.js', () => {
    const src = fs.readFileSync(STATUS_SRC, 'utf-8');
    expect(src).toMatch(/getDedupStore/);
    expect(src).toMatch(/from\s+['"]\.\/dedup\/dedup-store\.js['"]/);
  });

  test('showStatus calls DedupStore.getStats and renders live SQLite counts', async () => {
    // Seed a singleton store with real SQLite data so getStats returns non-zero
    const store = getDedupStore();
    store.registerUrl('https://example.com/a', 'hydra-a', 'A', 'rss');
    store.registerUrl('https://example.com/b', 'hydra-b', 'B', 'rss');
    store.registerHash('hash-1', 'hydra-a', 'A', 'https://example.com/a');

    await showStatus();

    const output = logSpy.mock.calls.map((c) => c.join(' ')).join('\n');
    // Header reflects SQLite source (not legacy "Dedup Index" label)
    expect(output).toMatch(/Dedup Store \(SQLite\)/);
    // Live counts from SQLite (not frozen JSON 209)
    expect(output).toMatch(/URLs tracked:\s+\d+/);
    expect(output).toMatch(/Hashes tracked:\s+\d+/);
    expect(output).toMatch(/Pipeline runs:\s+\d+/);
    expect(output).toMatch(/Last run:/);
  });
});
