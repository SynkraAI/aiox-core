/**
 * Apply Inline Greeting Logic to All 11 AIOX Agents
 * Story: 6.1.2.5-T1 - Option A Implementation
 * Date: 2025-11-16
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'agents');
const CLAUDE_AGENTS_DIR = path.join(__dirname, '..', '..', '.claude', 'commands', 'AIOX', 'agents');

const AGENTS = [
  'dev.md',
  'qa.md',
  'po.md',
  'sm.md',
  'pm.md',
  'architect.md',
  'analyst.md',
  'data-engineer.md',
  'devops.md',
  'aiox-master.md',
  'ux-design-expert.md',
];

const INLINE_GREETING_LOGIC = `
  - STEP 3: |
      Generate contextual greeting using inline logic:

      1. Detect session type:
         - If this is first message in conversation → "new" session
         - If conversation has history → "existing" session
         - Default to "new" if uncertain

      2. Build greeting components:
         - Use greeting from persona_profile.greeting_levels.named
         - Add role description: "**Role:** {persona.role}"

      3. Get project status (use Bash tool):
         - Branch: git branch --show-current
         - Modified files: git status --short | wc -l
         - Recent commit: git log -1 --pretty=format:"%s"
         - Format as:
           📊 **Project Status:**
             - 🌿 **Branch:** [branch]
             - 📝 **Modified:** [count] files
             - 📖 **Recent:** [commit]

      4. Show commands based on session type:
         - New session: Show commands with visibility ["full", "quick", "key"] (up to 12)
           Header: "**Available Commands:**"
         - Existing session: Show commands with visibility ["quick", "key"] (6-8)
           Header: "**Quick Commands:**"
         - Format each: "   - \`*{name}\`: {description}"

      5. Add footer: "Type \`*guide\` for comprehensive usage instructions."

  - STEP 4: Display the greeting you generated in STEP 3

  - STEP 5: HALT and await user input
`;

const OLD_PATTERN = / {2}- STEP 3: Execute \/greet slash command to generate contextual greeting\n {2}- STEP 4: Display the greeting returned by \/greet command\n {2}- STEP 5: HALT and await user input/;

function updateAgent(agentFile) {
  const filePath = path.join(AGENTS_DIR, agentFile);

  // Skip po.md as it's already updated
  if (agentFile === 'po.md') {
    console.log(`✓ ${agentFile} - Already updated (test case)`);
    return { updated: false, reason: 'already-updated' };
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already has inline logic
    if (content.includes('Generate contextual greeting using inline logic')) {
      console.log(`✓ ${agentFile} - Already has inline greeting logic`);
      return { updated: false, reason: 'already-has-inline' };
    }

    // Check if has old /greet pattern
    if (!OLD_PATTERN.test(content)) {
      console.log(`⚠ ${agentFile} - Different activation pattern, skipping`);
      return { updated: false, reason: 'different-pattern' };
    }

    // Create backup
    const backupPath = filePath + '.backup-pre-inline';
    fs.writeFileSync(backupPath, content);

    // Replace old pattern with inline logic
    content = content.replace(OLD_PATTERN, INLINE_GREETING_LOGIC);

    // Write updated content
    fs.writeFileSync(filePath, content);

    // Sync to Claude commands directory
    const claudePath = path.join(CLAUDE_AGENTS_DIR, agentFile);
    fs.writeFileSync(claudePath, content);

    console.log(`✅ ${agentFile} - Updated successfully`);
    return { updated: true };

  } catch (error) {
    console.error(`❌ ${agentFile} - Error: ${error.message}`);
    return { updated: false, reason: 'error', error: error.message };
  }
}

function main() {
  console.log('🚀 Applying inline greeting logic to all 11 agents...\n');

  const results = {
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  AGENTS.forEach(agent => {
    const result = updateAgent(agent);
    if (result.updated) {
      results.updated++;
    } else if (result.reason === 'error') {
      results.errors++;
    } else {
      results.skipped++;
    }
  });

  console.log('\n📊 Summary:');
  console.log(`   ✅ Updated: ${results.updated}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ❌ Errors: ${results.errors}`);
  console.log(`   📝 Total: ${AGENTS.length}`);

  if (results.updated > 0) {
    console.log('\n✅ All agents updated successfully!');
    console.log('📋 Backups created with .backup-pre-inline extension');
    console.log('🔄 Files synchronized to .claude/commands/AIOX/agents/');
  }
}

main();
