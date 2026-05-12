#!/usr/bin/env node

/**
 * Atomic Layer Classifier
 * Story: 6.1.7.1 - Task Content Completion
 * Purpose: Resolve {TODO: Atom|Molecule|Organism} placeholders in all 114 task files
 * 
 * Classification based on AIOX atomic design hierarchy:
 * - Atom: Single-purpose, no dependencies
 * - Molecule: Combines atoms
 * - Organism: Complex workflows
 * - Template: Document generation
 * - Strategy: High-level planning/analysis
 * - Config: System configuration/setup
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TASKS_DIR = path.join(__dirname, '../tasks');
const TODO_PATTERN = /atomic_layer: \{TODO: Atom\|Molecule\|Organism\}/g;

// Classification rules based on task complexity and purpose
const ATOMIC_CLASSIFICATIONS = {
  // Atom: Simple, single-purpose operations
  'Atom': [
    'undo-last.md',
    'kb-mode-interaction.md',
    'init-project-status.md',
  ],
  
  // Molecule: Combines multiple atoms
  'Molecule': [
    'apply-qa-fixes.md',
    'cleanup-utilities.md',
    'collaborative-edit.md',
    'deprecate-component.md',
    'improve-self.md',
    'index-docs.md',
    'propose-modification.md',
    'sync-documentation.md',
    'update-manifest.md',
    'build-component.md',
    'compose-molecule.md',
    'extend-pattern.md',
    'extract-tokens.md',
    'export-design-tokens-dtcg.md',
    'learn-patterns.md',
    'create-suite.md',
    'integrate-expansion-pack.md',
  ],
  
  // Organism: Complex workflows orchestrating multiple tasks
  'Organism': [
    'dev-develop-story.md',
    'qa-gate.md',
    'execute-checklist.md',
    'create-next-story.md',
    'sm-create-next-story.md',
    'brownfield-create-story.md',
    'create-brownfield-story.md',
    'brownfield-create-epic.md',
    'dev-validate-next-story.md',
    'validate-next-story.md',
    'po-manage-story-backlog.md',
    'po-pull-story.md',
    'po-pull-story-from-clickup.md',
    'po-sync-story.md',
    'po-sync-story-to-clickup.md',
    'po-backlog-add.md',
    'po-stories-index.md',
    'qa-backlog-add-followup.md',
    'dev-backlog-debt.md',
    'github-devops-github-pr-automation.md',
    'github-devops-pre-push-quality-gate.md',
    'github-devops-repository-cleanup.md',
    'github-devops-version-management.md',
    'pr-automation.md',
    'release-management.md',
    'ci-cd-configuration.md',
    'db-apply-migration.md',
    'db-bootstrap.md',
    'db-dry-run.md',
    'db-rollback.md',
    'db-supabase-setup.md',
  ],
  
  // Template: Document generation
  'Template': [
    'create-doc.md',
    'shard-doc.md',
    'generate-documentation.md',
    'generate-ai-frontend-prompt.md',
    'generate-shock-report.md',
    'document-project.md',
    'create-deep-research-prompt.md',
    'ux-create-wireframe.md',
  ],
  
  // Strategy: High-level planning, analysis, decision-making
  'Strategy': [
    'advanced-elicitation.md',
    'facilitate-brainstorming-session.md',
    'analyst-facilitate-brainstorming.md',
    'analyze-framework.md',
    'analyze-performance.md',
    'architect-analyze-impact.md',
    'consolidate-patterns.md',
    'correct-course.md',
    'calculate-roi.md',
    'generate-migration-strategy.md',
    'audit-codebase.md',
    'audit-tailwind-config.md',
    'audit-utilities.md',
    'security-audit.md',
    'security-scan.md',
    'qa-nfr-assess.md',
    'qa-risk-profile.md',
    'qa-trace-requirements.md',
    'qa-review-proposal.md',
    'qa-review-story.md',
    'dev-improve-code-quality.md',
    'dev-optimize-performance.md',
    'dev-suggest-refactoring.md',
    'db-analyze-hotpaths.md',
    'db-domain-modeling.md',
    'db-rls-audit.md',
    'db-schema-audit.md',
    'db-verify-order.md',
    'db-env-check.md',
    'db-expansion-pack-integration.md',
    'ux-ds-scan-artifact.md',
    'ux-user-research.md',
  ],
  
  // Config: System configuration, setup, initialization
  'Config': [
    'create-agent.md',
    'modify-agent.md',
    'create-task.md',
    'modify-task.md',
    'create-workflow.md',
    'modify-workflow.md',
    'setup-database.md',
    'setup-design-system.md',
    'bootstrap-shadcn-library.md',
    'tailwind-upgrade.md',
    'db-snapshot.md',
    'db-seed.md',
    'db-smoke-test.md',
    'db-explain.md',
    'db-impersonate.md',
    'db-load-csv.md',
    'db-policy-apply.md',
    'db-run-sql.md',
    'qa-generate-tests.md',
    'qa-run-tests.md',
    'qa-test-design.md',
    'test-as-user.md',
  ],
};

// Flatten classification map for quick lookup
function buildClassificationMap() {
  const map = {};
  for (const [layer, files] of Object.entries(ATOMIC_CLASSIFICATIONS)) {
    files.forEach(file => {
      map[file] = layer;
    });
  }
  return map;
}

const CLASSIFICATION_MAP = buildClassificationMap();

// Utility: Determine atomic layer for task
function classifyTask(filename) {
  return CLASSIFICATION_MAP[filename] || 'UNKNOWN - NEEDS MANUAL REVIEW';
}

// Main: Process single task file
function processTaskFile(filename) {
  const filePath = path.join(TASKS_DIR, filename);
  
  // Skip backup files
  if (filename.includes('backup') || filename.includes('.legacy')) {
    return { skipped: true, reason: 'backup/legacy file' };
  }
  
  // Read file content
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if TODO exists
  if (!TODO_PATTERN.test(content)) {
    return { skipped: true, reason: 'no TODO placeholder found' };
  }
  
  // Classify task
  const atomicLayer = classifyTask(filename);
  
  if (atomicLayer === 'UNKNOWN - NEEDS MANUAL REVIEW') {
    return { 
      needsReview: true, 
      filename,
      reason: 'No clear classification found',
    };
  }
  
  // Replace TODO with actual classification
  const updatedContent = content.replace(
    TODO_PATTERN,
    `atomic_layer: ${atomicLayer}`,
  );
  
  // Write updated content
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  return {
    processed: true,
    filename,
    atomicLayer,
  };
}

// Main: Process all task files
function main() {
  console.log('🚀 Atomic Layer Classifier\n');
  console.log(`📂 Processing tasks in: ${TASKS_DIR}\n`);
  
  // Get all .md files
  const files = fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.md') && !f.includes('backup') && !f.includes('.legacy'))
    .sort();
  
  console.log(`📝 Found ${files.length} task files\n`);
  
  const results = {
    processed: [],
    skipped: [],
    needsReview: [],
    errors: [],
    byLayer: {
      'Atom': 0,
      'Molecule': 0,
      'Organism': 0,
      'Template': 0,
      'Strategy': 0,
      'Config': 0,
    },
  };
  
  // Process each file
  files.forEach(filename => {
    try {
      const result = processTaskFile(filename);
      
      if (result.processed) {
        results.processed.push(result);
        results.byLayer[result.atomicLayer]++;
        console.log(`✅ ${result.filename} → ${result.atomicLayer}`);
      } else if (result.needsReview) {
        results.needsReview.push(result);
        console.log(`⚠️  ${result.filename} → NEEDS REVIEW`);
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
  console.log(`   ⚠️  Needs Review: ${results.needsReview.length}`);
  console.log(`   ⏭️  Skipped: ${results.skipped.length}`);
  console.log(`   ❌ Errors: ${results.errors.length}`);
  console.log('\n📊 By Atomic Layer:');
  Object.entries(results.byLayer).forEach(([layer, count]) => {
    console.log(`   ${layer}: ${count}`);
  });
  console.log('='.repeat(60) + '\n');
  
  // Save report
  const reportPath = path.join(__dirname, '../../.ai/task-1.3-atomic-layer-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`📄 Report saved: ${reportPath}\n`);
  
  return results;
}

// Execute if run directly
if (require.main === module) {
  try {
    const results = main();
    const exitCode = (results.errors.length > 0 || results.needsReview.length > 0) ? 1 : 0;
    process.exit(exitCode);
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

module.exports = { classifyTask, processTaskFile };

