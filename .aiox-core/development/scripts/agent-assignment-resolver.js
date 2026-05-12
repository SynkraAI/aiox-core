#!/usr/bin/env node

/**
 * Agent Assignment Resolver
 * Story: 6.1.7.1 - Task Content Completion
 * Purpose: Resolve {TODO: Agent Name} placeholders in all 114 task files
 * 
 * Maps tasks to agents based on:
 * 1. Task filename prefix (dev-, qa-, po-, etc.)
 * 2. Agent capability definitions from agent files
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TASKS_DIR = path.join(__dirname, '../tasks');
const _AGENTS_DIR = path.join(__dirname, '../agents');
const TODO_PATTERN = /responsável: \{TODO: Agent Name\}/g;

// Agent mapping based on task filename prefixes and agent capabilities
const AGENT_MAPPINGS = {
  'dev-': 'Dex (Builder)',
  'qa-': 'Quinn (Guardian)',
  'po-': 'Pax (Balancer)',
  'sm-': 'River (Facilitator)',
  'pm-': 'Morgan (Strategist)',
  'architect-': 'Aria (Visionary)',
  'analyst-': 'Atlas (Decoder)',
  'ux-': 'Uma (Empathizer)',
  'db-': 'Dara (Sage)',
  'github-devops-': 'Gage (Automator)',
  'data-engineer-': 'Dara (Sage)',
};

// Generic task mappings (tasks without clear prefix)
const GENERIC_TASK_MAPPINGS = {
  'advanced-elicitation.md': 'Atlas (Decoder)',
  'analyze-framework.md': 'Aria (Visionary)',
  'analyze-performance.md': 'Dex (Builder)',
  'apply-qa-fixes.md': 'Dex (Builder)',
  'audit-codebase.md': 'Quinn (Guardian)',
  'audit-tailwind-config.md': 'Uma (Empathizer)',
  'audit-utilities.md': 'Quinn (Guardian)',
  'bootstrap-shadcn-library.md': 'Uma (Empathizer)',
  'brownfield-create-epic.md': 'Morgan (Strategist)',
  'brownfield-create-story.md': 'Pax (Balancer)',
  'build-component.md': 'Uma (Empathizer)',
  'calculate-roi.md': 'Morgan (Strategist)',
  'ci-cd-configuration.md': 'Gage (Automator)',
  'cleanup-utilities.md': 'Dex (Builder)',
  'collaborative-edit.md': 'River (Facilitator)',
  'compose-molecule.md': 'Uma (Empathizer)',
  'consolidate-patterns.md': 'Aria (Visionary)',
  'correct-course.md': 'Pax (Balancer)',
  'create-agent.md': 'Orion (Commander)',
  'create-brownfield-story.md': 'Pax (Balancer)',
  'create-deep-research-prompt.md': 'Atlas (Decoder)',
  'create-doc.md': 'Morgan (Strategist)',
  'create-next-story.md': 'River (Facilitator)',
  'create-suite.md': 'Uma (Empathizer)',
  'create-task.md': 'Orion (Commander)',
  'create-workflow.md': 'Orion (Commander)',
  'deprecate-component.md': 'Dex (Builder)',
  'document-project.md': 'Morgan (Strategist)',
  'execute-checklist.md': 'Quinn (Guardian)',
  'export-design-tokens-dtcg.md': 'Uma (Empathizer)',
  'extend-pattern.md': 'Uma (Empathizer)',
  'extract-tokens.md': 'Uma (Empathizer)',
  'facilitate-brainstorming-session.md': 'Atlas (Decoder)',
  'generate-ai-frontend-prompt.md': 'Uma (Empathizer)',
  'generate-documentation.md': 'Morgan (Strategist)',
  'generate-migration-strategy.md': 'Dara (Sage)',
  'generate-shock-report.md': 'Atlas (Decoder)',
  'improve-self.md': 'Orion (Commander)',
  'index-docs.md': 'Morgan (Strategist)',
  'init-project-status.md': 'River (Facilitator)',
  'integrate-expansion-pack.md': 'Dex (Builder)',
  'kb-mode-interaction.md': 'Orion (Commander)',
  'learn-patterns.md': 'Uma (Empathizer)',
  'modify-agent.md': 'Orion (Commander)',
  'modify-task.md': 'Orion (Commander)',
  'modify-workflow.md': 'Orion (Commander)',
  'pr-automation.md': 'Gage (Automator)',
  'propose-modification.md': 'Atlas (Decoder)',
  'release-management.md': 'Gage (Automator)',
  'security-audit.md': 'Quinn (Guardian)',
  'security-scan.md': 'Quinn (Guardian)',
  'setup-database.md': 'Dara (Sage)',
  'setup-design-system.md': 'Uma (Empathizer)',
  'shard-doc.md': 'Morgan (Strategist)',
  'sync-documentation.md': 'Morgan (Strategist)',
  'tailwind-upgrade.md': 'Uma (Empathizer)',
  'test-as-user.md': 'Quinn (Guardian)',
  'undo-last.md': 'Dex (Builder)',
  'update-manifest.md': 'Dex (Builder)',
  'validate-next-story.md': 'Quinn (Guardian)',
};

// Utility: Determine agent for task based on filename
function determineAgent(filename) {
  // Check prefix-based mappings first
  for (const [prefix, agent] of Object.entries(AGENT_MAPPINGS)) {
    if (filename.startsWith(prefix)) {
      return agent;
    }
  }
  
  // Check generic task mappings
  if (GENERIC_TASK_MAPPINGS[filename]) {
    return GENERIC_TASK_MAPPINGS[filename];
  }
  
  // Default to Dev if no clear match
  return 'UNKNOWN - NEEDS MANUAL REVIEW';
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
  
  // Determine agent
  const agent = determineAgent(filename);
  
  if (agent === 'UNKNOWN - NEEDS MANUAL REVIEW') {
    return { 
      needsReview: true, 
      filename,
      reason: 'No clear agent mapping found',
    };
  }
  
  // Replace TODO with actual agent
  const updatedContent = content.replace(
    TODO_PATTERN,
    `responsável: ${agent}`,
  );
  
  // Write updated content
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  return {
    processed: true,
    filename,
    agent,
  };
}

// Main: Process all task files
function main() {
  console.log('🚀 Agent Assignment Resolver\n');
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
  };
  
  // Process each file
  files.forEach(filename => {
    try {
      const result = processTaskFile(filename);
      
      if (result.processed) {
        results.processed.push(result);
        console.log(`✅ ${result.filename} → ${result.agent}`);
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
  console.log('='.repeat(60) + '\n');
  
  // Save report
  const reportPath = path.join(__dirname, '../../.ai/task-1.2-agent-assignment-report.json');
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

module.exports = { determineAgent, processTaskFile };

