#!/usr/bin/env node

/**
 * @module migrate-to-sqlite
 * @description Migration script: imports existing dedup-index.json data into SQLite.
 * Idempotent -- can be run multiple times without duplicating data.
 *
 * Usage:
 *   node src/dedup/migrate-to-sqlite.js [--json-path <path>] [--db-path <path>]
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DedupStore } from './dedup-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Run migration from JSON dedup index to SQLite.
 * @param {Object} [options]
 * @param {string} [options.jsonPath] - Path to dedup-index.json
 * @param {string} [options.dbPath] - Path to SQLite database
 * @returns {{ urlsMigrated: number, hashesMigrated: number, urlsSkipped: number, hashesSkipped: number }}
 */
export function migrateToSqlite(options = {}) {
  const jsonPath = options.jsonPath || path.resolve(__dirname, '../../hydra-data/index/dedup-index.json');
  const dbPath = options.dbPath || path.resolve(__dirname, '../../hydra-data/hydra.db');

  console.log('[Migration] Starting JSON -> SQLite migration...');
  console.log(`[Migration] JSON source: ${jsonPath}`);
  console.log(`[Migration] SQLite target: ${dbPath}`);

  if (!fs.existsSync(jsonPath)) {
    console.log('[Migration] No JSON index found. Nothing to migrate.');
    return { urlsMigrated: 0, hashesMigrated: 0, urlsSkipped: 0, hashesSkipped: 0 };
  }

  const store = new DedupStore(dbPath);
  store.init();

  try {
    const result = store.migrate(jsonPath);

    const stats = store.getStats();
    console.log(`[Migration] Final DB stats: ${stats.urls} URLs, ${stats.hashes} hashes`);

    return result;
  } finally {
    store.close();
  }
}

// CLI entrypoint
const isMain = process.argv[1] && (
  process.argv[1].endsWith('migrate-to-sqlite.js') ||
  process.argv[1].includes('migrate-to-sqlite')
);

if (isMain) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json-path' && args[i + 1]) {
      options.jsonPath = path.resolve(args[++i]);
    } else if (args[i] === '--db-path' && args[i + 1]) {
      options.dbPath = path.resolve(args[++i]);
    }
  }

  try {
    const result = migrateToSqlite(options);
    console.log('[Migration] Done.');
    process.exit(0);
  } catch (error) {
    console.error(`[Migration] FAILED: ${error.message}`);
    process.exit(1);
  }
}
