/**
 * @module status
 * @description HYDRA status reporting — shows pipeline metrics and health.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDedupStore } from './dedup/dedup-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../hydra-data');

/**
 * Get today's digest data if available.
 * @returns {string|null} Digest content or null
 */
function getTodayDigest() {
  const today = new Date().toISOString().split('T')[0];
  const digestPath = path.join(DATA_DIR, 'digests', `${today}.md`);
  if (fs.existsSync(digestPath)) {
    return fs.readFileSync(digestPath, 'utf-8');
  }
  return null;
}

/**
 * Count files in a directory.
 * @param {string} dirPath - Directory path
 * @returns {number}
 */
function countFiles(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    return fs.readdirSync(dirPath).filter((f) => !f.startsWith('.')).length;
  } catch {
    return 0;
  }
}

/**
 * Get recent log entries.
 * @param {number} [limit=5] - Number of recent entries
 * @returns {string[]}
 */
function getRecentLogs(limit = 5) {
  const logsDir = path.join(DATA_DIR, 'logs');
  try {
    if (!fs.existsSync(logsDir)) return [];
    const files = fs.readdirSync(logsDir)
      .filter((f) => f.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, limit);
    return files;
  } catch {
    return [];
  }
}

/**
 * Display HYDRA status information.
 * @returns {Promise<void>}
 */
export async function showStatus() {
  console.log('\n=== HYDRA Status ===\n');

  // Dedup store stats (SQLite-backed)
  const store = getDedupStore();
  const indexStats = store.getStats();
  const lastRun = store.getLastRun();
  console.log('Dedup Store (SQLite):');
  console.log(`  URLs tracked:      ${indexStats.urls}`);
  console.log(`  Hashes tracked:    ${indexStats.hashes}`);
  console.log(`  Pipeline runs:     ${indexStats.pipelineRuns}`);
  console.log(`  Last run:          ${lastRun ? lastRun.finishedAt : 'never'}`);

  // Data directories
  console.log('\nData Directories:');
  console.log(`  Originals:   ${countFiles(path.join(DATA_DIR, 'originals'))} files`);
  console.log(`  Digests:     ${countFiles(path.join(DATA_DIR, 'digests'))} files`);
  console.log(`  Quarantine:  ${countFiles(path.join(DATA_DIR, 'quarantine'))} files`);

  // Jarvis KB status
  const kbRoot = 'D:/jarvis/mega brain/knowledge';
  if (fs.existsSync(kbRoot)) {
    console.log('\nJarvis KB:');
    try {
      const domains = fs.readdirSync(kbRoot).filter((f) => {
        return fs.statSync(path.join(kbRoot, f)).isDirectory();
      });
      for (const domain of domains) {
        const count = countFiles(path.join(kbRoot, domain));
        if (count > 0) {
          console.log(`  ${domain}: ${count} entries`);
        }
      }
    } catch {
      console.log('  (unable to read)');
    }
  } else {
    console.log('\nJarvis KB: Not found at expected location');
  }

  // Today's digest
  const digest = getTodayDigest();
  if (digest) {
    console.log('\nToday\'s Digest:');
    // Extract summary table from digest
    const lines = digest.split('\n');
    const summaryStart = lines.findIndex((l) => l.includes('| Metric'));
    if (summaryStart >= 0) {
      for (let i = summaryStart; i < lines.length && lines[i].includes('|'); i++) {
        console.log(`  ${lines[i]}`);
      }
    }
  } else {
    console.log('\nNo digest for today yet. Run "hydra run" to process content.');
  }

  // Recent logs
  const recentLogs = getRecentLogs();
  if (recentLogs.length > 0) {
    console.log('\nRecent Logs:');
    for (const logFile of recentLogs) {
      console.log(`  ${logFile}`);
    }
  }

  // Environment check
  console.log('\nEnvironment:');
  console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`  GITHUB_TOKEN:     ${process.env.GITHUB_TOKEN ? 'SET' : 'NOT SET'}`);
  console.log(`  Node.js:          ${process.version}`);

  console.log('\n=== End Status ===\n');
}
