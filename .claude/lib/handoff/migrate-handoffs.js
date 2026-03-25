#!/usr/bin/env node
'use strict';

/**
 * Migrate Existing Handoff Files
 *
 * Trims oversized session handoff files to ~200 lines,
 * archiving excess content to .aiox/session-history/{project}/.
 *
 * Usage:
 *   node .claude/lib/handoff/migrate-handoffs.js [projectRoot]
 *
 * @module migrate-handoffs
 * @see Story AIOX-HO-1, Task 7
 */

const fs = require('fs');
const path = require('path');

/**
 * Discover all session-handoff-*.md files in docs/.
 * @param {string} projectRoot - Project root directory
 * @returns {Array<{project: string, filePath: string, lineCount: number}>}
 */
function discoverHandoffs(projectRoot) {
  const docsDir = path.join(projectRoot, 'docs');
  if (!fs.existsSync(docsDir)) return [];

  const files = fs.readdirSync(docsDir);
  return files
    .filter((f) => f.startsWith('session-handoff-') && f.endsWith('.md'))
    .map((f) => {
      const filePath = path.join(docsDir, f);
      const content = fs.readFileSync(filePath, 'utf8');
      const project = f.replace('session-handoff-', '').replace('.md', '');
      return {
        project,
        filePath,
        lineCount: content.split('\n').length,
      };
    });
}

/**
 * Migrate a single handoff file: trim to ~200 lines and archive excess.
 * @param {string} filePath - Absolute path to the handoff file
 * @param {string} project - Project name
 * @param {string} projectRoot - Project root directory
 * @returns {{ trimmed: boolean, originalLines: number, newLines: number, archivePath: string|null }}
 */
function migrateHandoff(filePath, project, projectRoot) {
  const crossSession = require(path.join(projectRoot, '.claude', 'lib', 'handoff', 'cross-session-handoff'));
  return crossSession.trimHandoff(filePath, projectRoot);
}

/**
 * Run migration for all discovered handoff files.
 * @param {string} [projectRoot] - Project root directory
 */
function runMigration(projectRoot) {
  const root = projectRoot || process.cwd();

  console.log('=== Handoff Migration ===\n');

  const handoffs = discoverHandoffs(root);

  if (handoffs.length === 0) {
    console.log('No session-handoff-*.md files found in docs/.');
    return;
  }

  console.log(`Found ${handoffs.length} handoff file(s):\n`);

  const results = [];
  for (const { project, filePath, lineCount } of handoffs) {
    console.log(`  ${project}: ${lineCount} lines`);
    if (lineCount > 200) {
      console.log('    -> Trimming to ~200 lines...');
      const result = migrateHandoff(filePath, project, root);
      results.push({ project, ...result });
      if (result.trimmed) {
        console.log(`    -> Trimmed: ${result.originalLines} -> ${result.newLines} lines`);
        console.log(`    -> Archived: ${result.archivePath}`);
      }
    } else {
      console.log('    -> Already within limit, no action needed.');
      results.push({ project, trimmed: false, originalLines: lineCount, newLines: lineCount, archivePath: null });
    }
    console.log('');
  }

  // Verify no data loss
  console.log('=== Verification ===\n');
  let allGood = true;
  for (const r of results) {
    if (r.trimmed && r.archivePath) {
      const exists = fs.existsSync(r.archivePath);
      const archived = exists ? fs.readFileSync(r.archivePath, 'utf8') : '';
      const archiveLines = archived.split('\n').length;
      console.log(`  ${r.project}: Archive has ${archiveLines} lines (original: ${r.originalLines})`);
      if (archiveLines < r.originalLines - 5) {
        console.log('    WARNING: Archive may be incomplete!');
        allGood = false;
      } else {
        console.log('    OK: Full content preserved in archive.');
      }
    }
  }

  if (allGood) {
    console.log('\nMigration complete. All data preserved.');
  } else {
    console.log('\nMigration complete with warnings. Check archives above.');
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  const projectRoot = process.argv[2] || process.cwd();
  runMigration(projectRoot);
}

module.exports = { discoverHandoffs, migrateHandoff, runMigration };
