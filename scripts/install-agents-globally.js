#!/usr/bin/env node
/**
 * Install AIOS Agents Globally in Kiro CLI
 * 
 * This script copies AIOS agent files to Kiro's global configuration
 * directory so they can be used in any project.
 * 
 * Usage: node scripts/install-agents-globally.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AGENTS_SOURCE = path.join(__dirname, '..', '.aios-core', 'development', 'agents');
const KIRO_HOME = path.join(os.homedir(), '.kiro');
const KIRO_AGENTS_DIR = path.join(KIRO_HOME, 'agents', 'aios');
const KIRO_SETTINGS_FILE = path.join(KIRO_HOME, 'settings', 'agents.json');

// Agent metadata
const AGENTS = [
  { id: 'aios-master', name: 'AIOS Master', description: 'Master orchestration agent' },
  { id: 'analyst', name: 'Business Analyst', description: 'PRD creation and analysis' },
  { id: 'architect', name: 'System Architect', description: 'Architecture and technical design' },
  { id: 'data-engineer', name: 'Data Engineer', description: 'Data pipelines and engineering' },
  { id: 'dev', name: 'Developer', description: 'Feature implementation' },
  { id: 'devops', name: 'DevOps Engineer', description: 'Infrastructure and deployment' },
  { id: 'pm', name: 'Product Manager', description: 'Product strategy and prioritization' },
  { id: 'po', name: 'Product Owner', description: 'Backlog management' },
  { id: 'qa', name: 'QA Engineer', description: 'Testing and quality assurance' },
  { id: 'sm', name: 'Scrum Master', description: 'Sprint management and story creation' },
  { id: 'squad-creator', name: 'Squad Creator', description: 'Create custom agent squads' },
  { id: 'ux-design-expert', name: 'UX Expert', description: 'User experience design' },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
}

function copyAgents() {
  console.log('📦 Installing AIOS agents globally...\n');

  // Ensure Kiro directories exist
  ensureDir(KIRO_AGENTS_DIR);
  ensureDir(path.join(KIRO_HOME, 'settings'));

  let copiedCount = 0;
  let skippedCount = 0;

  // Copy each agent file
  AGENTS.forEach(agent => {
    const sourceFile = path.join(AGENTS_SOURCE, `${agent.id}.md`);
    const targetFile = path.join(KIRO_AGENTS_DIR, `${agent.id}.md`);

    if (!fs.existsSync(sourceFile)) {
      console.log(`⚠️  Skipped ${agent.id}: source file not found`);
      skippedCount++;
      return;
    }

    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✓ Installed: @${agent.id} - ${agent.name}`);
    copiedCount++;
  });

  console.log(`\n✅ Installed ${copiedCount} agents`);
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped ${skippedCount} agents`);
  }
}

function createAgentConfig() {
  console.log('\n⚙️  Creating agent configuration...\n');

  const config = {
    version: '1.0.0',
    agents: AGENTS.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      file: path.join(KIRO_AGENTS_DIR, `${agent.id}.md`),
      shortcuts: [`@${agent.id}`, `/${agent.id}`, `/${agent.id}.md`],
      source: 'aios-core',
    })),
    metadata: {
      installedAt: new Date().toISOString(),
      source: 'aios-core',
      version: require('../package.json').version,
    },
  };

  fs.writeFileSync(KIRO_SETTINGS_FILE, JSON.stringify(config, null, 2));
  console.log(`✓ Created configuration: ${KIRO_SETTINGS_FILE}`);
}

function printUsageInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 AIOS Agents Installed Successfully!');
  console.log('='.repeat(60));
  console.log('\nYou can now use AIOS agents in ANY Kiro CLI session:\n');
  
  console.log('Activation methods:');
  console.log('  @architect    - Direct shortcut');
  console.log('  /architect    - Slash command');
  console.log('  @dev          - Developer agent');
  console.log('  @qa           - QA agent');
  console.log('  ... etc.\n');

  console.log('Available agents:');
  AGENTS.forEach(agent => {
    console.log(`  @${agent.id.padEnd(20)} - ${agent.description}`);
  });

  console.log('\nTo use an agent:');
  console.log('  1. Start any Kiro CLI session');
  console.log('  2. Type @architect (or any agent shortcut)');
  console.log('  3. Use agent commands like *help');
  console.log('  4. Type *exit to deactivate\n');

  console.log('Configuration location:');
  console.log(`  ${KIRO_AGENTS_DIR}`);
  console.log(`  ${KIRO_SETTINGS_FILE}\n`);
}

function main() {
  try {
    // Check if source directory exists
    if (!fs.existsSync(AGENTS_SOURCE)) {
      console.error('❌ Error: AIOS agents directory not found');
      console.error(`   Expected: ${AGENTS_SOURCE}`);
      console.error('   Run this script from the aios-core project root');
      process.exit(1);
    }

    copyAgents();
    createAgentConfig();
    printUsageInstructions();

  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  }
}

main();
