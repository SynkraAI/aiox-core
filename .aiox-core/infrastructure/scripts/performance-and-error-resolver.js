#!/usr/bin/env node

/**
 * Performance Metrics & Error Strategy Resolver
 * Story: 6.1.7.1 - Task Content Completion
 * Purpose: Resolve performance metrics and error handling strategy TODOs
 * 
 * Tasks 1.4 & 1.5 Combined:
 * - Populate duration_expected and cost_estimated (228 TODOs)
 * - Define error handling strategies (114 TODOs)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TASKS_DIR = path.join(__dirname, '../tasks');

// Performance estimates based on atomic layer
const PERFORMANCE_BY_LAYER = {
  'Atom': {
    duration: '0.5-2 min (estimated)',
    cost: '$0.0001-0.0005',
  },
  'Molecule': {
    duration: '2-5 min (estimated)',
    cost: '$0.001-0.003',
  },
  'Organism': {
    duration: '5-15 min (estimated)',
    cost: '$0.003-0.010',
  },
  'Template': {
    duration: '3-8 min (estimated)',
    cost: '$0.002-0.005',
  },
  'Strategy': {
    duration: '5-20 min (estimated)',
    cost: '$0.003-0.015',
  },
  'Config': {
    duration: '2-10 min (estimated)',
    cost: '$0.001-0.008',
  },
};

// Error strategy based on task type
const ERROR_STRATEGIES = {
  // Retry: External services, network operations, transient errors
  'retry': [
    'db-apply-migration.md',
    'db-bootstrap.md',
    'db-dry-run.md',
    'db-run-sql.md',
    'db-supabase-setup.md',
    'po-pull-story.md',
    'po-pull-story-from-clickup.md',
    'po-sync-story.md',
    'po-sync-story-to-clickup.md',
    'github-devops-github-pr-automation.md',
    'pr-automation.md',
    'release-management.md',
    'integrate-expansion-pack.md',
  ],
  // Fallback: Degradable features, alternative approaches
  'fallback': [
    'analyze-framework.md',
    'analyze-performance.md',
    'audit-codebase.md',
    'audit-tailwind-config.md',
    'audit-utilities.md',
    'calculate-roi.md',
    'generate-documentation.md',
    'index-docs.md',
    'sync-documentation.md',
    'security-scan.md',
    'db-analyze-hotpaths.md',
    'db-schema-audit.md',
    'qa-nfr-assess.md',
  ],
  // Abort: Critical operations, data integrity
  'abort': [
    'create-agent.md',
    'modify-agent.md',
    'create-task.md',
    'modify-task.md',
    'create-workflow.md',
    'modify-workflow.md',
    'db-rollback.md',
    'db-policy-apply.md',
    'dev-develop-story.md',
    'qa-gate.md',
    'execute-checklist.md',
  ],
};

// Default to retry for tasks not explicitly mapped
function determineErrorStrategy(filename) {
  for (const [strategy, files] of Object.entries(ERROR_STRATEGIES)) {
    if (files.includes(filename)) {
      return strategy;
    }
  }
  return 'retry'; // Default
}

// Extract atomic layer from file content
function extractAtomicLayer(content) {
  const match = content.match(/atomic_layer:\s*(\w+)/);
  return match ? match[1] : null;
}

// Main: Process single task file
function processTaskFile(filename) {
  const filePath = path.join(TASKS_DIR, filename);
  
  // Skip backup files
  if (filename.includes('backup') || filename.includes('.legacy')) {
    return { skipped: true, reason: 'backup/legacy file' };
  }
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract atomic layer
  const atomicLayer = extractAtomicLayer(content);
  if (!atomicLayer || !PERFORMANCE_BY_LAYER[atomicLayer]) {
    return { 
      skipped: true, 
      reason: `atomic layer not found or invalid: ${atomicLayer}`, 
    };
  }
  
  let modified = false;
  
  // 1. Replace duration_expected
  if (content.includes('duration_expected: {TODO: X minutes}')) {
    content = content.replace(
      /duration_expected: \{TODO: X minutes\}/g,
      `duration_expected: ${PERFORMANCE_BY_LAYER[atomicLayer].duration}`,
    );
    modified = true;
  }
  
  // 2. Replace cost_estimated
  if (content.includes('cost_estimated: {TODO: $X}')) {
    content = content.replace(
      /cost_estimated: \{TODO: \$X\}/g,
      `cost_estimated: ${PERFORMANCE_BY_LAYER[atomicLayer].cost}`,
    );
    modified = true;
  }
  
  // 3. Replace error handling strategy
  const errorStrategy = determineErrorStrategy(filename);
  if (content.includes('**Strategy:** {TODO: Fail-fast | Graceful degradation | Retry with backoff}')) {
    content = content.replace(
      /\*\*Strategy:\*\* \{TODO: Fail-fast \| Graceful degradation \| Retry with backoff\}/g,
      `**Strategy:** ${errorStrategy}`,
    );
    modified = true;
  }
  
  if (!modified) {
    return { skipped: true, reason: 'no TODO placeholders found' };
  }
  
  // Write updated content
  fs.writeFileSync(filePath, content, 'utf8');
  
  return {
    processed: true,
    filename,
    atomicLayer,
    duration: PERFORMANCE_BY_LAYER[atomicLayer].duration,
    cost: PERFORMANCE_BY_LAYER[atomicLayer].cost,
    errorStrategy,
  };
}

// Main: Process all task files
function main() {
  console.log('🚀 Performance Metrics & Error Strategy Resolver\n');
  console.log(`📂 Processing tasks in: ${TASKS_DIR}\n`);
  
  // Get all .md files
  const files = fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.md') && !f.includes('backup') && !f.includes('.legacy'))
    .sort();
  
  console.log(`📝 Found ${files.length} task files\n`);
  
  const results = {
    processed: [],
    skipped: [],
    errors: [],
    stats: {
      durationsSet: 0,
      costsSet: 0,
      strategiesSet: 0,
    },
  };
  
  // Process each file
  files.forEach(filename => {
    try {
      const result = processTaskFile(filename);
      
      if (result.processed) {
        results.processed.push(result);
        results.stats.durationsSet++;
        results.stats.costsSet++;
        results.stats.strategiesSet++;
        console.log(`✅ ${result.filename}`);
        console.log(`   └─ ${result.atomicLayer} | ${result.duration} | ${result.cost} | ${result.errorStrategy}`);
      } else if (result.skipped) {
        results.skipped.push({ filename, reason: result.reason });
      }
    } catch (error) {
      results.errors.push({ filename, error: error.message });
      console.error(`❌ ${filename}: ${error.message}`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Processed: ${results.processed.length}`);
  console.log(`   ⏭️  Skipped: ${results.skipped.length}`);
  console.log(`   ❌ Errors: ${results.errors.length}`);
  console.log('\n📊 TODOs Resolved:');
  console.log(`   Duration TODOs: ${results.stats.durationsSet}`);
  console.log(`   Cost TODOs: ${results.stats.costsSet}`);
  console.log(`   Strategy TODOs: ${results.stats.strategiesSet}`);
  console.log(`   TOTAL: ${results.stats.durationsSet + results.stats.costsSet + results.stats.strategiesSet}`);
  console.log('='.repeat(60) + '\n');
  
  // Save report
  const reportPath = path.join(__dirname, '../../.ai/task-1.4-1.5-performance-error-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`📄 Report saved: ${reportPath}\n`);
  
  return results;
}

// Execute if run directly
if (require.main === module) {
  try {
    const results = main();
    process.exit(results.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

module.exports = { processTaskFile, determineErrorStrategy };

