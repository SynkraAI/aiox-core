#!/usr/bin/env node

/**
 * Framework Utilities Audit Script
 *
 * Systematically tests all utilities in .aiox-core/scripts/ and classifies them
 * as WORKING, FIXABLE, or DEPRECATED based on their functional status.
 *
 * Usage: node .aiox-core/scripts/test-utilities.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const utilsDir = path.join(__dirname);
let results = [];
let utilities = [];

/**
 * Count integration references for a utility
 */
async function countIntegrationReferences(utilityName) {
  const basename = path.basename(utilityName, '.js');
  const searchDirs = [
    '.aiox-core/agents',
    '.aiox-core/tasks',
    'squads',
  ];

  let totalCount = 0;

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;

    try {
      const { stdout } = await execPromise(
        `grep -r "${basename}" ${dir} 2>/dev/null | wc -l`,
        { shell: '/bin/bash' },
      );
      totalCount += parseInt(stdout.trim()) || 0;
    } catch {
      // Directory doesn't exist or grep failed - not a problem
    }
  }

  return totalCount;
}

/**
 * Test a single utility
 */
async function testUtility(utilityFile) {
  const utilityPath = path.join(utilsDir, utilityFile);
  const result = {
    name: utilityFile,
    status: 'UNKNOWN',
    loadable: false,
    exports: [],
    testPassed: null,
    errors: [],
    integrationCount: 0,
    recommendation: '',
  };

  try {
    // Clear require cache to ensure fresh load
    delete require.cache[require.resolve(utilityPath)];

    // Test 1: Can it be required?
    const utility = require(utilityPath);
    result.loadable = true;

    // Test 2: Does it export functions?
    result.exports = Object.keys(utility);

    // Test 3: Can we call its test function if it exists?
    if (typeof utility.test === 'function') {
      try {
        await utility.test();
        result.testPassed = true;
      } catch (testError) {
        result.testPassed = false;
        result.errors.push(`Test function failed: ${testError.message}`);
      }
    }

    // Test 4: Count integration references
    result.integrationCount = await countIntegrationReferences(utilityFile);

    // Classify based on results
    if (result.errors.length === 0 && result.exports.length > 0) {
      result.status = 'WORKING';
      result.recommendation = result.integrationCount > 0
        ? 'Keep - actively used'
        : 'Keep but document usage';
    }

  } catch (error) {
    result.errors.push(error.message);

    // Classify error type
    if (error.code === 'MODULE_NOT_FOUND') {
      result.status = 'FIXABLE';
      result.recommendation = 'Install missing dependencies';
    } else if (error.message.includes('SyntaxError')) {
      result.status = 'DEPRECATED';
      result.recommendation = 'Syntax errors - needs major rewrite';
    } else if (error.message.includes('Cannot find module')) {
      result.status = 'FIXABLE';
      result.recommendation = 'Missing local dependencies - <4h fix';
    } else {
      result.status = 'DEPRECATED';
      result.recommendation = 'Execution errors - needs investigation';
    }

    // Count integration even if broken
    try {
      result.integrationCount = await countIntegrationReferences(utilityFile);
    } catch {
      // Ignore counting errors
    }
  }

  return result;
}

/**
 * Main audit execution
 */
async function runAudit() {
  console.log('🔍 Framework Utilities Audit Starting...\n');
  console.log(`📁 Scanning directory: ${utilsDir}\n`);

  // Get all .js files except test-utilities.js itself
  utilities = fs.readdirSync(utilsDir)
    .filter(f => f.endsWith('.js') && f !== 'test-utilities.js')
    .sort();

  results = [];
  console.log(`Found ${utilities.length} utilities to audit\n`);
  console.log('=' .repeat(80));

  let processed = 0;

  for (const utility of utilities) {
    processed++;
    process.stdout.write(`\r[${processed}/${utilities.length}] Testing ${utility}...`.padEnd(80));

    const result = await testUtility(utility);
    results.push(result);
  }

  console.log('\n');
  console.log('=' .repeat(80));

  // Generate summary
  const working = results.filter(r => r.status === 'WORKING');
  const fixable = results.filter(r => r.status === 'FIXABLE');
  const deprecated = results.filter(r => r.status === 'DEPRECATED');
  const unknown = results.filter(r => r.status === 'UNKNOWN');

  console.log('\n📊 AUDIT SUMMARY\n');
  console.log(`✅ WORKING:     ${working.length} (${Math.round(working.length / utilities.length * 100)}%)`);
  console.log(`🔧 FIXABLE:     ${fixable.length} (${Math.round(fixable.length / utilities.length * 100)}%)`);
  console.log(`🗑️  DEPRECATED:  ${deprecated.length} (${Math.round(deprecated.length / utilities.length * 100)}%)`);
  console.log(`❓ UNKNOWN:     ${unknown.length} (${Math.round(unknown.length / utilities.length * 100)}%)`);
  console.log(`\n📦 Total Utilities: ${utilities.length}`);

  // Save detailed results to JSON for report generation
  const outputPath = path.join(process.cwd(), 'utilities-audit-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to: ${outputPath}`);

  return {
    total: utilities.length,
    working: working.length,
    fixable: fixable.length,
    deprecated: deprecated.length,
    unknown: unknown.length,
    results,
  };
}

// Run audit if executed directly
if (require.main === module) {
  runAudit()
    .then(() => {
      console.log('\n✅ Audit complete!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { runAudit, testUtility, countIntegrationReferences };
