/**
 * Batch Update Agents - Add Session Context Support
 * Story 6.1.2.6.2 - Agent Performance Optimization
 *
 * Updates remaining 8 agents with session context loader integration
 */

const fs = require('fs').promises;
const path = require('path');

const AGENTS_TO_UPDATE = [
  'sm.md',
  'pm.md',
  'architect.md',
  'analyst.md',
  'data-engineer.md',
  'devops.md',
  'aiox-master.md',
  'ux-design-expert.md',
];

const AGENTS_DIR = path.join(process.cwd(), '.aiox-core', 'agents');

async function updateAgent(agentFile) {
  const filePath = path.join(AGENTS_DIR, agentFile);

  console.log(`\n📝 Updating ${agentFile}...`);

  try {
    let content = await fs.readFile(filePath, 'utf8');

    // Pattern 1: Update activation-instructions
    const activationPattern = /(- STEP 2\.5: Load project status.*\n)( {2}- STEP 3: Greet user)/s;
    const activationReplacement = '$1  - STEP 2.6: Load session context using .aiox-core/scripts/session-context-loader.js to detect previous agent and workflow state\n$2';

    content = content.replace(activationPattern, activationReplacement);

    // Pattern 2: Add STEP 3.6 after STEP 3.5
    const step36Pattern = /(- STEP 3\.5: Introduce yourself.*\n)( {2}- STEP 4: Display project status)/s;
    const step36Replacement = '$1  - STEP 3.6: Display session context if available (from STEP 2.6) showing previous agent and recent commands\n$2';

    content = content.replace(step36Pattern, step36Replacement);

    // Pattern 3: Add *session-info command to Utilities section
    const utilitiesPattern = /(# Utilities\n)( {2}- (?:guide|help|exit))/;
    const utilitiesReplacement = '$1  - session-info: Show current session details (agent history, commands)\n$2';

    content = content.replace(utilitiesPattern, utilitiesReplacement);

    // Write updated content
    await fs.writeFile(filePath, content, 'utf8');

    console.log(`✅ ${agentFile} updated successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${agentFile}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Batch Update: Adding Session Context to Agents');
  console.log('=' +  '='.repeat(50));

  let successCount = 0;
  let failCount = 0;

  for (const agentFile of AGENTS_TO_UPDATE) {
    const success = await updateAgent(agentFile);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(52));
  console.log(`\n📊 Summary: ${successCount} updated, ${failCount} failed`);

  if (failCount === 0) {
    console.log('✅ All agents updated successfully!');
  } else {
    console.warn(`⚠️ ${failCount} agents failed to update - manual review needed`);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { updateAgent };
