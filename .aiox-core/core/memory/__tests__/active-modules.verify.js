/**
 * Verification Tests for Active AIOX Memory Modules
 *
 * Tests active memory modules:
 * 1. Feedback Loop (gotchas-memory.js)
 * 2. Custom Rules per Project (semantic-merge-engine.js)
 *
 * @created 2026-01-29
 * @updated 2026-02-09 - Removed orphan modules tests (Story MIS-2)
 */

const path = require('path');
const fs = require('fs');

// Test helpers
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    testResults.passed++;
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ name, error: error.message });
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertDefined(value, message) {
  if (value === undefined || value === null) {
    throw new Error(message || 'Value is undefined or null');
  }
}

// ============================================================================
// TEST SUITE 1: FEEDBACK LOOP
// ============================================================================

console.log('\n🔄 Testing Feedback Loop...\n');

test('GotchasMemory module loads with FeedbackType', () => {
  const { GotchasMemory, FeedbackType } = require('../gotchas-memory');

  assertDefined(GotchasMemory, 'GotchasMemory should be defined');
  assertDefined(FeedbackType, 'FeedbackType should be defined');
});

test('FeedbackType has required types', () => {
  const { FeedbackType } = require('../gotchas-memory');

  assertEqual(FeedbackType.HELPFUL, 'helpful', 'HELPFUL type');
  assertEqual(FeedbackType.NOT_HELPFUL, 'not_helpful', 'NOT_HELPFUL type');
  assertEqual(FeedbackType.FALSE_POSITIVE, 'false_positive', 'FALSE_POSITIVE type');
  assertEqual(FeedbackType.MISSED, 'missed', 'MISSED type');
  assertEqual(FeedbackType.IMPROVED, 'improved', 'IMPROVED type');
});

test('GotchasMemory has trackUserFeedback method', () => {
  const { GotchasMemory } = require('../gotchas-memory');

  // GotchasMemory constructor takes rootPath as first arg (string)
  const memory = new GotchasMemory(process.cwd());
  assertDefined(memory.trackUserFeedback, 'trackUserFeedback method should exist');
});

test('GotchasMemory has getAccuracyMetrics method', () => {
  const { GotchasMemory } = require('../gotchas-memory');

  const memory = new GotchasMemory(process.cwd());
  assertDefined(memory.getAccuracyMetrics, 'getAccuracyMetrics method should exist');
});

test('GotchasMemory has getSuggestedRules method', () => {
  const { GotchasMemory } = require('../gotchas-memory');

  const memory = new GotchasMemory(process.cwd());
  assertDefined(memory.getSuggestedRules, 'getSuggestedRules method should exist');
});

test('GotchasMemory can track feedback', () => {
  const { GotchasMemory, FeedbackType } = require('../gotchas-memory');

  const memory = new GotchasMemory(process.cwd());
  const result = memory.trackUserFeedback({
    gotchaId: 'test-gotcha-1',
    feedbackType: FeedbackType.HELPFUL,
    comment: 'Test feedback',
  });

  assertDefined(result, 'Result should be defined');
  // Result structure may vary
  assertTrue(typeof result === 'object', 'Result should be an object');
});

test('GotchasMemory can get accuracy metrics', () => {
  const { GotchasMemory } = require('../gotchas-memory');

  const memory = new GotchasMemory(process.cwd());
  const metrics = memory.getAccuracyMetrics();

  assertDefined(metrics, 'Metrics should be defined');
  assertTrue(typeof metrics === 'object', 'Metrics should be an object');
});

// ============================================================================
// TEST SUITE 2: CUSTOM RULES PER PROJECT
// ============================================================================

console.log('\n⚙️  Testing Custom Rules per Project...\n');

test('SemanticMergeEngine loads CustomRulesLoader', () => {
  const {
    SemanticMergeEngine,
    CustomRulesLoader,
  } = require('../../execution/semantic-merge-engine');

  assertDefined(SemanticMergeEngine, 'SemanticMergeEngine should be defined');
  assertDefined(CustomRulesLoader, 'CustomRulesLoader should be defined');
});

test('CustomRulesLoader instantiates correctly', () => {
  const { CustomRulesLoader } = require('../../execution/semantic-merge-engine');

  const loader = new CustomRulesLoader(process.cwd());
  assertDefined(loader, 'Loader should instantiate');
  assertDefined(loader.loadCustomRules, 'loadCustomRules method should exist');
  assertDefined(loader.getMergedRules, 'getMergedRules method should exist');
});

test('CustomRulesLoader has getDefaultRules method', () => {
  const { CustomRulesLoader } = require('../../execution/semantic-merge-engine');

  const loader = new CustomRulesLoader(process.cwd());
  const defaults = loader.getDefaultRules();

  assertDefined(defaults, 'Defaults should be defined');
  assertDefined(defaults.compatibility, 'Defaults should have compatibility');
  assertDefined(defaults.file_patterns, 'Defaults should have file_patterns');
  assertDefined(defaults.languages, 'Defaults should have languages');
  assertDefined(defaults.ai, 'Defaults should have ai config');
});

test('CustomRulesLoader can get merged rules', () => {
  const { CustomRulesLoader } = require('../../execution/semantic-merge-engine');

  const loader = new CustomRulesLoader(process.cwd());
  const rules = loader.getMergedRules();

  assertDefined(rules, 'Rules should be defined');
  assertDefined(rules.file_patterns, 'Rules should have file_patterns');
});

test('CustomRulesLoader can categorize files', () => {
  const { CustomRulesLoader } = require('../../execution/semantic-merge-engine');

  const loader = new CustomRulesLoader(process.cwd());

  // Test matchesPattern directly
  const skipPatterns = ['node_modules/**', '.git/**', '*.log'];
  const matchesNodeModules = loader.matchesPattern('node_modules/package/index.js', skipPatterns);
  assertTrue(matchesNodeModules, 'node_modules/package/index.js should match node_modules/**');

  // Test default category
  const defaultCategory = loader.getFileCategory('src/utils/helper.js');
  // This depends on rules, but should be defined
  assertDefined(defaultCategory, 'Category should be defined');
});

test('CustomRulesLoader has cache functionality', () => {
  const { CustomRulesLoader } = require('../../execution/semantic-merge-engine');

  const loader = new CustomRulesLoader(process.cwd());

  // First call loads
  loader.getMergedRules();

  // Check cache is valid
  const isValid = loader.isCacheValid();
  assertTrue(isValid, 'Cache should be valid after loading');

  // Clear cache
  loader.clearCache();
  const isInvalid = !loader.isCacheValid();
  assertTrue(isInvalid, 'Cache should be invalid after clearing');
});

test('SemanticMergeEngine integrates with CustomRulesLoader', () => {
  const { SemanticMergeEngine } = require('../../execution/semantic-merge-engine');

  const engine = new SemanticMergeEngine({ rootPath: process.cwd() });

  assertDefined(engine.rulesLoader, 'Engine should have rulesLoader');
  assertDefined(engine.getRules, 'Engine should have getRules method');
  assertDefined(engine.reloadRules, 'Engine should have reloadRules method');
  assertDefined(engine.getFileCategory, 'Engine should have getFileCategory method');
});

test('SemanticMergeEngine can get rules', () => {
  const { SemanticMergeEngine } = require('../../execution/semantic-merge-engine');

  const engine = new SemanticMergeEngine({ rootPath: process.cwd() });
  const rules = engine.getRules();

  assertDefined(rules, 'Rules should be defined');
});

test('merge-rules.yaml exists in .aiox', () => {
  const rulesPath = path.join(process.cwd(), '.aiox', 'merge-rules.yaml');
  const exists = fs.existsSync(rulesPath);

  assertTrue(exists, 'merge-rules.yaml should exist in .aiox');
});

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log(`\n  ✅ Passed: ${testResults.passed}`);
console.log(`  ❌ Failed: ${testResults.failed}`);
console.log(`  📊 Total:  ${testResults.passed + testResults.failed}`);

if (testResults.errors.length > 0) {
  console.log('\n  Errors:');
  testResults.errors.forEach((e) => {
    console.log(`    - ${e.name}: ${e.error}`);
  });
}

console.log('\n' + '='.repeat(60));

// Exit with error code if tests failed
process.exit(testResults.failed > 0 ? 1 : 0);
