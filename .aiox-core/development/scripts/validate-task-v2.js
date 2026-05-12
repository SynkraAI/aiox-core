#!/usr/bin/env node

/**
 * Task Format V2.0 Validation Script
 * 
 * Validates task files against the V2.0 specification with 11 compliance rules.
 * 
 * Usage:
 *   node validate-task-v2.js <task-file>          # Validate single task
 *   node validate-task-v2.js --all                # Validate all tasks
 * 
 * Exit codes:
 *   0 = All tasks compliant
 *   1 = Some tasks non-compliant
 *   2 = Error during validation
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * Validation rules for V2.0 compliance
 */
const validationRules = [
  {
    id: 1,
    name: 'Execution Modes section',
    check: (content) => {
      return content.includes('## Execution Modes') || 
             content.includes('# Execution Modes');
    },
    message: 'Missing "Execution Modes" section',
  },
  {
    id: 2,
    name: 'Task Definition YAML format',
    check: (content) => {
      return content.includes('task:') && 
             content.includes('responsável:') &&
             content.includes('responsavel_type:') &&
             content.includes('atomic_layer:');
    },
    message: 'Task Definition incomplete (missing task, responsável, responsavel_type, or atomic_layer)',
  },
  {
    id: 3,
    name: 'Entrada and Saída defined',
    check: (content) => {
      return content.includes('**Entrada:**') && 
             content.includes('**Saída:**');
    },
    message: 'Missing Entrada or Saída sections',
  },
  {
    id: 4,
    name: 'Checklist restructured',
    check: (content) => {
      return content.includes('pre-conditions:') && 
             content.includes('post-conditions:') &&
             content.includes('acceptance-criteria:');
    },
    message: 'Checklist not restructured (missing pre-conditions, post-conditions, or acceptance-criteria)',
  },
  {
    id: 5,
    name: 'Checklist items have required fields',
    check: (content) => {
      const hasType = content.includes('tipo:');
      const hasBlocker = content.includes('blocker:');
      const hasValidation = content.includes('validação:') || content.includes('validation:');
      return hasType && hasBlocker && hasValidation;
    },
    message: 'Checklist items missing required fields (tipo, blocker, validação)',
  },
  {
    id: 6,
    name: 'Tools section present',
    check: (content) => {
      return content.includes('## Tools') || 
             content.includes('**Tools:**') ||
             content.includes('- N/A') && content.toLowerCase().includes('tool');
    },
    message: 'Missing Tools section',
  },
  {
    id: 7,
    name: 'Scripts section present',
    check: (content) => {
      return content.includes('## Scripts') || 
             content.includes('**Scripts:**') ||
             content.includes('- N/A') && content.toLowerCase().includes('script');
    },
    message: 'Missing Scripts section',
  },
  {
    id: 8,
    name: 'Performance section present',
    check: (content) => {
      return content.includes('## Performance') ||
             content.includes('**Performance:**') ||
             (content.includes('duration_expected:') && content.includes('cost_estimated:'));
    },
    message: 'Missing Performance section or required metrics (duration_expected, cost_estimated)',
  },
  {
    id: 9,
    name: 'Error Handling section present',
    check: (content) => {
      return (content.includes('## Error Handling') || content.includes('**Error Handling:**')) &&
             (content.includes('strategy:') || content.includes('Strategy:'));
    },
    message: 'Missing Error Handling section or strategy not defined',
  },
  {
    id: 10,
    name: 'Metadata section present',
    check: (content) => {
      return (content.includes('## Metadata') || content.includes('**Metadata:**')) &&
             content.includes('story:') &&
             content.includes('version:');
    },
    message: 'Missing Metadata section or required fields (story, version)',
  },
  {
    id: 11,
    name: 'Standardized output template',
    check: (content) => {
      // Check for output template markers (less strict as this might be in separate template file)
      return content.includes('Duration:') || 
             content.includes('Tokens Used:') ||
             content.includes('Metrics') ||
             content.includes('task-execution-report');
    },
    message: 'Output template markers not found (Duration, Tokens, Metrics)',
  },
];

/**
 * Validate a single task file
 * @param {string} filePath - Path to the task file
 * @returns {Object} Validation result
 */
function validateTask(filePath) {
  const fileName = path.basename(filePath);
  const result = {
    file: fileName,
    path: filePath,
    compliant: true,
    passed: [],
    failed: [],
  };

  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Run all validation rules
    for (const rule of validationRules) {
      const passed = rule.check(content);
      
      if (passed) {
        result.passed.push({
          id: rule.id,
          name: rule.name,
        });
      } else {
        result.failed.push({
          id: rule.id,
          name: rule.name,
          message: rule.message,
        });
        result.compliant = false;
      }
    }

  } catch (error) {
    result.compliant = false;
    result.error = error.message;
  }

  return result;
}

/**
 * Validate all tasks in .aiox-core/tasks/
 * @returns {Object} Summary of validation results
 */
function validateAllTasks() {
  const tasksDir = path.join(process.cwd(), '.aiox-core', 'tasks');
  
  if (!fs.existsSync(tasksDir)) {
    console.error(`${colors.red}✗ Tasks directory not found: ${tasksDir}${colors.reset}`);
    process.exit(2);
  }

  const taskFiles = fs.readdirSync(tasksDir)
    .filter(file => file.endsWith('.md') && !file.includes('.v1-backup.md'))
    .map(file => path.join(tasksDir, file));

  console.log(`${colors.cyan}Validating ${taskFiles.length} tasks...${colors.reset}\n`);

  const results = taskFiles.map(validateTask);
  const compliantCount = results.filter(r => r.compliant).length;
  const nonCompliantCount = results.length - compliantCount;

  // Group results by phases (approximate)
  const phase1 = results.slice(0, 15);
  const phase2 = results.slice(15, 65);
  const phase3 = results.slice(65);

  const phase1Compliant = phase1.filter(r => r.compliant).length;
  const phase2Compliant = phase2.filter(r => r.compliant).length;
  const phase3Compliant = phase3.filter(r => r.compliant).length;

  console.log(`${colors.cyan}Phase Results:${colors.reset}`);
  console.log(`${phase1Compliant === phase1.length ? colors.green + '✅' : colors.red + '✗'} Phase 1: ${phase1Compliant}/${phase1.length} tasks compliant${colors.reset}`);
  console.log(`${phase2Compliant === phase2.length ? colors.green + '✅' : colors.red + '✗'} Phase 2: ${phase2Compliant}/${phase2.length} tasks compliant${colors.reset}`);
  console.log(`${phase3Compliant === phase3.length ? colors.green + '✅' : colors.red + '✗'} Phase 3: ${phase3Compliant}/${phase3.length} tasks compliant${colors.reset}`);
  console.log();

  // Show overall result
  if (compliantCount === results.length) {
    console.log(`${colors.green}✅ RESULT: ${compliantCount}/${results.length} tasks V2.0 compliant${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ RESULT: ${compliantCount}/${results.length} tasks compliant, ${nonCompliantCount} non-compliant${colors.reset}\n`);
    
    // Show non-compliant tasks
    console.log(`${colors.yellow}Non-compliant tasks:${colors.reset}`);
    results.filter(r => !r.compliant).forEach(result => {
      console.log(`  ${colors.red}✗${colors.reset} ${result.file}`);
      result.failed.forEach(failure => {
        console.log(`     - Rule ${failure.id}: ${failure.message}`);
      });
    });
  }

  return {
    total: results.length,
    compliant: compliantCount,
    nonCompliant: nonCompliantCount,
    results,
  };
}

/**
 * Print validation result for a single task
 * @param {Object} result - Validation result
 */
function printResult(result) {
  if (result.error) {
    console.log(`${colors.red}✗ ERROR: ${result.file}${colors.reset}`);
    console.log(`   ${result.error}\n`);
    return;
  }

  if (result.compliant) {
    console.log(`${colors.green}✅ PASS: ${result.file}${colors.reset}`);
    result.passed.forEach(rule => {
      console.log(`   ${colors.green}✓${colors.reset} ${rule.name}`);
    });
  } else {
    console.log(`${colors.red}✗ FAIL: ${result.file}${colors.reset}`);
    result.failed.forEach(failure => {
      console.log(`   ${colors.red}✗${colors.reset} Rule ${failure.id}: ${failure.message}`);
    });
    if (result.passed.length > 0) {
      console.log(`   ${colors.green}Passed: ${result.passed.length}/${validationRules.length} rules${colors.reset}`);
    }
  }
  console.log();
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node validate-task-v2.js <task-file>    # Validate single task');
    console.log('  node validate-task-v2.js --all          # Validate all tasks');
    process.exit(0);
  }

  if (args[0] === '--all') {
    const summary = validateAllTasks();
    process.exit(summary.nonCompliant > 0 ? 1 : 0);
  } else {
    const taskFile = args[0];
    
    if (!fs.existsSync(taskFile)) {
      console.error(`${colors.red}✗ File not found: ${taskFile}${colors.reset}`);
      process.exit(2);
    }

    const result = validateTask(taskFile);
    printResult(result);
    
    process.exit(result.compliant ? 0 : 1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { validateTask, validateAllTasks, validationRules };

