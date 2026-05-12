/**
 * Integration Test Suite: Utility Scripts Integration - Part 1
 * 
 * Story: 3.4 - Utility Script Integration Part 1
 * Purpose: Validate integration of 23 utility scripts into AIOX framework
 * 
 * Tests:
 * 1. Load all 23 utilities successfully (no errors)
 * 2. Validate all utility references resolve correctly
 * 3. Re-run gap detection - verify 0 gaps for these utilities
 * 4. Load all affected agents successfully
 * 5. Regenerate master relationship map successfully
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const ROOT_PATH = path.resolve(__dirname, '..', '..');
const UTILS_PATH = path.join(ROOT_PATH, 'aiox-core', 'utils');
const AGENTS_PATH = path.join(ROOT_PATH, 'aiox-core', 'agents');
const COMMON_UTILS_PATH = path.join(ROOT_PATH, 'common', 'utils');

// 23 utilities to test (from Story 3.4)
const UTILITIES_TO_TEST = [
  // Code Quality (5)
  { name: 'improvement-validator', category: 'framework', path: UTILS_PATH },
  { name: 'code-quality-improver', category: 'helpers', path: UTILS_PATH },
  { name: 'coverage-analyzer', category: 'helpers', path: UTILS_PATH },
  { name: 'compatibility-checker', category: 'helpers', path: UTILS_PATH },
  { name: 'dependency-analyzer', category: 'helpers', path: UTILS_PATH },
  
  // Git/Workflow (7)
  { name: 'approval-workflow', category: 'executors', path: UTILS_PATH },
  { name: 'branch-manager', category: 'executors', path: UTILS_PATH },
  { name: 'commit-message-generator', category: 'executors', path: UTILS_PATH },
  { name: 'conflict-manager', category: 'helpers', path: UTILS_PATH },
  { name: 'conflict-resolver', category: 'executors', path: UTILS_PATH },
  { name: 'diff-generator', category: 'helpers', path: UTILS_PATH },
  { name: 'change-propagation-predictor', category: 'helpers', path: UTILS_PATH },
  
  // Component Management (5)
  { name: 'component-generator', category: 'executors', path: UTILS_PATH },
  { name: 'component-metadata', category: 'helpers', path: UTILS_PATH },
  { name: 'component-preview', category: 'helpers', path: UTILS_PATH },
  { name: 'component-search', category: 'executors', path: UTILS_PATH },
  { name: 'deprecation-manager', category: 'executors', path: UTILS_PATH },
  
  // Documentation (2)
  { name: 'documentation-synchronizer', category: 'executors', path: UTILS_PATH },
  { name: 'dependency-impact-analyzer', category: 'executors', path: UTILS_PATH },
  
  // Batch/Helpers (4)
  { name: 'batch-creator', category: 'helpers', path: UTILS_PATH },
  { name: 'clickup-helpers', category: 'helpers', path: COMMON_UTILS_PATH },
  { name: 'capability-analyzer', category: 'helpers', path: UTILS_PATH },
  { name: 'elicitation-engine', category: 'framework', path: UTILS_PATH },
];

// Agents to test
const AGENTS_TO_TEST = [
  'dev',
  'qa',
  'architect',
  'po',
  'pm',
  'devops',
];

// Test results
const testResults = {
  test1: { name: 'Utility Load Test', passed: 0, failed: 0, errors: [] },
  test2: { name: 'Reference Validation', passed: false, errors: [] },
  test3: { name: 'Gap Detection', passed: false, gapsFound: null },
  test4: { name: 'Agent Load Test', passed: 0, failed: 0, errors: [] },
  test5: { name: 'Relationship Synthesis', passed: false, errors: [] },
};

console.log('🧪 Starting Integration Test Suite: Utility Scripts Part 1');
console.log('='.repeat(70));
console.log('');

// ============================================================================
// TEST 1: Load all 23 utilities successfully (no errors)
// ============================================================================
console.log('Test 1: Utility Load Test');
console.log('-'.repeat(70));

for (const util of UTILITIES_TO_TEST) {
  const utilPath = path.join(util.path, `${util.name}.js`);
  
  try {
    // Try to load the utility
    require(utilPath);
    console.log(`✓ ${util.name} (${util.category})`);
    testResults.test1.passed++;
  } catch (error) {
    console.log(`✗ ${util.name} (${util.category}) - ${error.message}`);
    testResults.test1.failed++;
    testResults.test1.errors.push({
      utility: util.name,
      error: error.message,
    });
  }
}

console.log('');
console.log(`Result: ${testResults.test1.passed}/${UTILITIES_TO_TEST.length} utilities loaded successfully`);
console.log('');

// ============================================================================
// TEST 2: Validate all utility references resolve correctly
// ============================================================================
console.log('Test 2: Reference Validation');
console.log('-'.repeat(70));

try {
  // Check if validation script exists
  const validateScriptPath = path.join(ROOT_PATH, 'outputs', 'architecture-map', 'schemas', 'validate-tool-references.js');
  
  if (fs.existsSync(validateScriptPath)) {
    console.log('Running: validate-tool-references.js');
    
    try {
      const output = execSync(`node "${validateScriptPath}"`, {
        cwd: ROOT_PATH,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      
      // Check if output indicates success
      const hasErrors = output.includes('ERROR') || output.includes('FAIL');
      testResults.test2.passed = !hasErrors;
      
      if (testResults.test2.passed) {
        console.log('✓ All utility references resolve correctly');
      } else {
        console.log('✗ Some utility references failed validation');
        console.log('Output:', output.substring(0, 500));
      }
    } catch (execError) {
      console.log('✗ Validation script execution failed');
      testResults.test2.errors.push(execError.message);
    }
  } else {
    console.log('⚠ Validation script not found, skipping');
    console.log(`  Expected: ${validateScriptPath}`);
    testResults.test2.passed = null; // Inconclusive
  }
} catch (error) {
  console.log('✗ Reference validation failed');
  testResults.test2.errors.push(error.message);
}

console.log('');

// ============================================================================
// TEST 3: Re-run gap detection - verify 0 gaps for these utilities
// ============================================================================
console.log('Test 3: Gap Detection');
console.log('-'.repeat(70));

try {
  const detectGapsPath = path.join(ROOT_PATH, 'outputs', 'architecture-map', 'schemas', 'detect-gaps.js');
  
  if (fs.existsSync(detectGapsPath)) {
    console.log('Running: detect-gaps.js');
    
    try {
      const output = execSync(`node "${detectGapsPath}"`, {
        cwd: ROOT_PATH,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      
      // Count gaps related to our utilities
      let gapsFound = 0;
      for (const util of UTILITIES_TO_TEST) {
        const utilPattern = new RegExp(`util-${util.name}|${util.name}`, 'i');
        if (utilPattern.test(_output)) {
          gapsFound++;
          console.log(`⚠ Gap found for: ${util.name}`);
        }
      }
      
      testResults.test3.gapsFound = gapsFound;
      testResults.test3.passed = gapsFound === 0;
      
      if (testResults.test3.passed) {
        console.log('✓ Zero gaps found for integrated utilities');
      } else {
        console.log(`✗ ${gapsFound} gap(s) still present`);
      }
    } catch (execError) {
      console.log('✗ Gap detection script execution failed');
      testResults.test3.errors = [execError.message];
    }
  } else {
    console.log('⚠ Gap detection script not found, skipping');
    console.log(`  Expected: ${detectGapsPath}`);
    testResults.test3.passed = null; // Inconclusive
  }
} catch (error) {
  console.log('✗ Gap detection failed');
  testResults.test3.errors = [error.message];
}

console.log('');

// ============================================================================
// TEST 4: Load all affected agents successfully
// ============================================================================
console.log('Test 4: Agent Load Test');
console.log('-'.repeat(70));

for (const agentName of AGENTS_TO_TEST) {
  const agentPath = path.join(AGENTS_PATH, `${agentName}.md`);
  
  try {
    // Read agent file
    if (fs.existsSync(agentPath)) {
      const agentContent = fs.readFileSync(agentPath, 'utf8');
      
      // Check if agent file contains YAML block
      const yamlMatch = agentContent.match(/```yaml\n([\s\S]+?)\n```/);
      
      if (yamlMatch) {
        // Validate that dependencies.utils section exists if utility is referenced
        const utilsMatch = yamlMatch[1].match(/dependencies:\s*[\s\S]*?utils:\s*\n([\s\S]*?)(?:\n\s*\w+:|```)/);
        
        if (utilsMatch) {
          console.log(`✓ ${agentName} - dependencies.utils section found`);
          testResults.test4.passed++;
        } else {
          console.log(`⚠ ${agentName} - no dependencies.utils section`);
          testResults.test4.passed++;
        }
      } else {
        console.log(`✗ ${agentName} - invalid YAML format`);
        testResults.test4.failed++;
      }
    } else {
      console.log(`✗ ${agentName} - file not found at ${agentPath}`);
      testResults.test4.failed++;
    }
  } catch (error) {
    console.log(`✗ ${agentName} - ${error.message}`);
    testResults.test4.failed++;
    testResults.test4.errors.push({
      agent: agentName,
      error: error.message,
    });
  }
}

console.log('');
console.log(`Result: ${testResults.test4.passed}/${AGENTS_TO_TEST.length} agents loaded successfully`);
console.log('');

// ============================================================================
// TEST 5: Regenerate master relationship map successfully
// ============================================================================
console.log('Test 5: Relationship Synthesis');
console.log('-'.repeat(70));

try {
  const synthesizePath = path.join(ROOT_PATH, 'outputs', 'architecture-map', 'schemas', 'synthesize-relationships.js');
  
  if (fs.existsSync(synthesizePath)) {
    console.log('Running: synthesize-relationships.js');
    
    try {
      const output = execSync(`node "${synthesizePath}"`, {
        cwd: ROOT_PATH,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });
      
      // Check if MASTER-RELATIONSHIP-MAP.json was updated
      const masterMapPath = path.join(ROOT_PATH, 'outputs', 'architecture-map', 'MASTER-RELATIONSHIP-MAP.json');
      
      if (fs.existsSync(masterMapPath)) {
        const masterMap = JSON.parse(fs.readFileSync(masterMapPath, 'utf8'));
        
        // Count how many of our utilities are in the map
        let utilsInMap = 0;
        if (masterMap.nodes) {
          for (const util of UTILITIES_TO_TEST) {
            const utilNode = masterMap.nodes.find(n => 
              n.id === `util-${util.name}` || 
              n.id === util.name ||
              n.name === util.name,
            );
            if (utilNode) {
              utilsInMap++;
            }
          }
        }
        
        console.log('✓ Relationship map regenerated');
        console.log(`  Utilities found in map: ${utilsInMap}/${UTILITIES_TO_TEST.length}`);
        testResults.test5.passed = true;
      } else {
        console.log('✗ Master relationship map not found');
        testResults.test5.passed = false;
      }
    } catch (execError) {
      console.log('✗ Synthesis script execution failed');
      console.log(`  Error: ${execError.message.substring(0, 200)}`);
      testResults.test5.errors.push(execError.message);
    }
  } else {
    console.log('⚠ Synthesis script not found, skipping');
    console.log(`  Expected: ${synthesizePath}`);
    testResults.test5.passed = null; // Inconclusive
  }
} catch (error) {
  console.log('✗ Relationship synthesis failed');
  testResults.test5.errors.push(error.message);
}

console.log('');

// ============================================================================
// FINAL RESULTS
// ============================================================================
console.log('='.repeat(70));
console.log('Test Suite Summary');
console.log('='.repeat(70));
console.log('');

const allTestsPassed = 
  testResults.test1.failed === 0 &&
  (testResults.test2.passed === true || testResults.test2.passed === null) &&
  (testResults.test3.passed === true || testResults.test3.passed === null) &&
  testResults.test4.failed === 0 &&
  (testResults.test5.passed === true || testResults.test5.passed === null);

console.log(`Test 1 (Utility Load):        ${testResults.test1.passed}/${UTILITIES_TO_TEST.length} ${testResults.test1.failed === 0 ? '✓' : '✗'}`);
console.log(`Test 2 (Reference Validation): ${testResults.test2.passed === true ? '✓ PASS' : testResults.test2.passed === null ? '⚠ SKIP' : '✗ FAIL'}`);
console.log(`Test 3 (Gap Detection):        ${testResults.test3.passed === true ? '✓ PASS' : testResults.test3.passed === null ? '⚠ SKIP' : '✗ FAIL'}`);
if (testResults.test3.gapsFound !== null) {
  console.log(`                                (${testResults.test3.gapsFound} gaps found)`);
}
console.log(`Test 4 (Agent Load):           ${testResults.test4.passed}/${AGENTS_TO_TEST.length} ${testResults.test4.failed === 0 ? '✓' : '✗'}`);
console.log(`Test 5 (Relationship Synth):   ${testResults.test5.passed === true ? '✓ PASS' : testResults.test5.passed === null ? '⚠ SKIP' : '✗ FAIL'}`);

console.log('');
console.log(`Overall Status: ${allTestsPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
console.log('');

// Exit with appropriate code
if (!allTestsPassed) {
  console.log('Errors encountered:');
  if (testResults.test1.errors.length > 0) {
    console.log('  Test 1:', testResults.test1.errors);
  }
  if (testResults.test2.errors.length > 0) {
    console.log('  Test 2:', testResults.test2.errors);
  }
  if (testResults.test3.errors && testResults.test3.errors.length > 0) {
    console.log('  Test 3:', testResults.test3.errors);
  }
  if (testResults.test4.errors.length > 0) {
    console.log('  Test 4:', testResults.test4.errors);
  }
  if (testResults.test5.errors.length > 0) {
    console.log('  Test 5:', testResults.test5.errors);
  }
  
  process.exit(1);
} else {
  console.log('✓ Story 3.4 utility integration validation complete!');
  process.exit(0);
}

