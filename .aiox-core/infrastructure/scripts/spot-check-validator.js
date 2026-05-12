#!/usr/bin/env node

/**
 * Spot-Check Validator
 * Story: 6.1.7.1 - Task Content Completion
 * Purpose: Validate 20 random tasks for Phase 1 completion accuracy
 */

const fs = require('path');
const path = require('path');

// Configuration
const TASKS_DIR = path.join(__dirname, '../tasks');
const SAMPLE_SIZE = 20;

// Load fs module properly
const fsModule = require('fs');

// Validation checks
function validateTask(filename, content) {
  const errors = [];
  const warnings = [];
  
  // 1. Task identifier check
  if (content.includes('{TODO: task identifier}')) {
    errors.push('Task identifier not resolved');
  } else {
    const taskMatch = content.match(/task:\s*(\w+)\(\)/);
    if (!taskMatch) {
      errors.push('Task identifier malformed');
    }
  }
  
  // 2. Agent assignment check
  if (content.includes('{TODO: Agent Name}')) {
    errors.push('Agent assignment not resolved');
  }
  
  // 3. Atomic layer check
  if (content.includes('{TODO: Atom|Molecule|Organism}')) {
    errors.push('Atomic layer not resolved');
  } else {
    const layerMatch = content.match(/atomic_layer:\s*(\w+)/);
    if (!layerMatch) {
      errors.push('Atomic layer malformed');
    } else {
      const validLayers = ['Atom', 'Molecule', 'Organism', 'Template', 'Strategy', 'Config'];
      if (!validLayers.includes(layerMatch[1])) {
        warnings.push(`Unexpected atomic layer: ${layerMatch[1]}`);
      }
    }
  }
  
  // 4. Performance metrics check
  if (content.includes('{TODO: X minutes}')) {
    errors.push('Duration metric not resolved');
  }
  if (content.includes('{TODO: $X}')) {
    errors.push('Cost metric not resolved');
  }
  
  // 5. Error strategy check
  if (content.includes('{TODO: Fail-fast | Graceful degradation | Retry with backoff}')) {
    errors.push('Error strategy not resolved');
  }
  
  return { errors, warnings };
}

// Main
function main() {
  console.log('🔍 Spot-Check Validator\n');
  
  // Get all task files
  const allFiles = fsModule.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.md') && !f.includes('backup') && !f.includes('.legacy'));
  
  // Random sampling
  const sampled = [];
  const filesCopy = [...allFiles];
  for (let i = 0; i < Math.min(SAMPLE_SIZE, filesCopy.length); i++) {
    const randomIndex = Math.floor(Math.random() * filesCopy.length);
    sampled.push(filesCopy.splice(randomIndex, 1)[0]);
  }
  
  console.log(`📝 Spot-checking ${sampled.length} random tasks:\n`);
  
  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };
  
  // Validate each sampled task
  sampled.forEach((filename, index) => {
    const filePath = path.join(TASKS_DIR, filename);
    const content = fsModule.readFileSync(filePath, 'utf8');
    const validation = validateTask(filename, content);
    
    if (validation.errors.length === 0) {
      results.passed.push(filename);
      console.log(`${index + 1}. ✅ ${filename}`);
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
        results.warnings.push({ filename, warnings: validation.warnings });
      }
    } else {
      results.failed.push({ filename, errors: validation.errors });
      console.log(`${index + 1}. ❌ ${filename}`);
      validation.errors.forEach(e => console.log(`   ❌ ${e}`));
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Spot-Check Summary:');
  console.log(`   ✅ Passed: ${results.passed.length}/${sampled.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}/${sampled.length}`);
  console.log(`   ⚠️  Warnings: ${results.warnings.length}`);
  console.log('='.repeat(60) + '\n');
  
  if (results.failed.length > 0) {
    console.log('Failed tasks:');
    results.failed.forEach(({ filename, errors }) => {
      console.log(`  - ${filename}: ${errors.join(', ')}`);
    });
    console.log('');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '../../.ai/mid-point-spot-check-report.json');
  fsModule.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`📄 Report saved: ${reportPath}\n`);
  
  return results;
}

if (require.main === module) {
  try {
    const results = main();
    process.exit(results.failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

module.exports = { validateTask };

