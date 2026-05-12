#!/usr/bin/env node

/**
 * Fast Framework Utilities Audit Script
 *
 * Quick scan version that skips slow integration counting during initial pass
 * Usage: node test-utilities-fast.js
 */

const fs = require('fs');
const path = require('path');

const utilsDir = path.join(__dirname);
let results = [];
let utilities = [];

/**
 * Quick test - just try to require and see what happens
 */
function quickTest(utilityFile) {
  const utilityPath = path.join(utilsDir, utilityFile);
  const result = {
    name: utilityFile,
    status: 'UNKNOWN',
    loadable: false,
    exports: [],
    errors: [],
    recommendation: '',
  };

  try {
    // Suppress console output during require
    const originalLog = console.log;
    const originalError = console.error;
    console.log = () => {};
    console.error = () => {};

    delete require.cache[require.resolve(utilityPath)];
    const utility = require(utilityPath);

    // Restore console
    console.log = originalLog;
    console.error = originalError;

    result.loadable = true;
    result.exports = Object.keys(utility);

    if (result.exports.length > 0) {
      result.status = 'WORKING';
      result.recommendation = 'Functional - verify integration';
    } else {
      result.status = 'FIXABLE';
      result.recommendation = 'Loads but exports nothing';
    }

  } catch (error) {
    // Restore console
    console.log = console.log.bind(console);
    console.error = console.error.bind(console);

    result.errors.push(error.message);

    if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
      result.status = 'FIXABLE';
      result.recommendation = 'Missing dependencies - installable';
    } else if (error.message.includes('SyntaxError')) {
      result.status = 'DEPRECATED';
      result.recommendation = 'Syntax errors - major rewrite needed';
    } else {
      result.status = 'DEPRECATED';
      result.recommendation = 'Runtime errors - investigation needed';
    }
  }

  return result;
}

/**
 * Run the fast audit
 */
function runFastAudit() {
  console.log('🔍 Fast Framework Utilities Audit Starting...\n');

  // Get all .js files except test utilities
  utilities = fs.readdirSync(utilsDir)
    .filter(f => f.endsWith('.js') && !f.includes('test-utilities'))
    .sort();

  results = [];
  console.log(`Found ${utilities.length} utilities to audit\n`);

  // Run quick audit
  let processed = 0;
  for (const utility of utilities) {
    processed++;
    process.stdout.write(`\r[${processed}/${utilities.length}] ${utility}`.padEnd(80));
    results.push(quickTest(utility));
  }

  console.log('\n');

  // Summary
  const working = results.filter(r => r.status === 'WORKING');
  const fixable = results.filter(r => r.status === 'FIXABLE');
  const deprecated = results.filter(r => r.status === 'DEPRECATED');

  console.log('\n📊 QUICK AUDIT SUMMARY\n');
  console.log(`✅ WORKING:     ${working.length} (${Math.round(working.length / utilities.length * 100)}%)`);
  console.log(`🔧 FIXABLE:     ${fixable.length} (${Math.round(fixable.length / utilities.length * 100)}%)`);
  console.log(`🗑️  DEPRECATED:  ${deprecated.length} (${Math.round(deprecated.length / utilities.length * 100)}%)`);
  console.log(`\n📦 Total: ${utilities.length}`);

  // Save results
  const outputPath = path.join(process.cwd(), 'utilities-audit-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results: ${outputPath}\n`);

  return { results, working: working.length, fixable: fixable.length, deprecated: deprecated.length };
}

// Run audit if executed directly
if (require.main === module) {
  runFastAudit();
}

module.exports = { runFastAudit, quickTest };
