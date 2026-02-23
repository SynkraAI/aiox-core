#!/usr/bin/env node
/**
 * Verify AIOS Global Agent Installation
 * 
 * Checks if AIOS agents are properly installed globally in Kiro CLI
 * 
 * Usage: node scripts/verify-global-agents.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const KIRO_HOME = path.join(os.homedir(), '.kiro');
const KIRO_AGENTS_DIR = path.join(KIRO_HOME, 'agents', 'aios');
const KIRO_SETTINGS_FILE = path.join(KIRO_HOME, 'settings', 'agents.json');

const EXPECTED_AGENTS = [
  'aios-master', 'analyst', 'architect', 'data-engineer',
  'dev', 'devops', 'pm', 'po', 'qa', 'sm',
  'squad-creator', 'ux-design-expert'
];

function checkDirectory() {
  console.log('📁 Checking directories...\n');
  
  if (!fs.existsSync(KIRO_HOME)) {
    console.log('❌ Kiro home directory not found:', KIRO_HOME);
    return false;
  }
  console.log('✓ Kiro home directory exists');

  if (!fs.existsSync(KIRO_AGENTS_DIR)) {
    console.log('❌ AIOS agents directory not found:', KIRO_AGENTS_DIR);
    return false;
  }
  console.log('✓ AIOS agents directory exists');

  return true;
}

function checkAgentFiles() {
  console.log('\n🤖 Checking agent files...\n');
  
  let allFound = true;
  const foundAgents = [];
  const missingAgents = [];

  EXPECTED_AGENTS.forEach(agentId => {
    const agentFile = path.join(KIRO_AGENTS_DIR, `${agentId}.md`);
    if (fs.existsSync(agentFile)) {
      const stats = fs.statSync(agentFile);
      console.log(`✓ ${agentId.padEnd(20)} (${(stats.size / 1024).toFixed(1)} KB)`);
      foundAgents.push(agentId);
    } else {
      console.log(`❌ ${agentId.padEnd(20)} - NOT FOUND`);
      missingAgents.push(agentId);
      allFound = false;
    }
  });

  console.log(`\nFound: ${foundAgents.length}/${EXPECTED_AGENTS.length} agents`);
  
  if (missingAgents.length > 0) {
    console.log('\nMissing agents:', missingAgents.join(', '));
  }

  return allFound;
}

function checkConfiguration() {
  console.log('\n⚙️  Checking configuration...\n');

  if (!fs.existsSync(KIRO_SETTINGS_FILE)) {
    console.log('❌ Configuration file not found:', KIRO_SETTINGS_FILE);
    return false;
  }
  console.log('✓ Configuration file exists');

  try {
    const config = JSON.parse(fs.readFileSync(KIRO_SETTINGS_FILE, 'utf8'));
    
    if (!config.version) {
      console.log('⚠️  Configuration missing version field');
    } else {
      console.log(`✓ Configuration version: ${config.version}`);
    }

    if (!config.agents || !Array.isArray(config.agents)) {
      console.log('❌ Configuration missing agents array');
      return false;
    }
    console.log(`✓ Configuration has ${config.agents.length} agents defined`);

    // Check each agent has required fields
    let validAgents = 0;
    config.agents.forEach(agent => {
      if (agent.id && agent.name && agent.file && agent.shortcuts) {
        validAgents++;
      }
    });
    console.log(`✓ ${validAgents} agents have valid configuration`);

    if (config.metadata) {
      console.log(`✓ Installed at: ${config.metadata.installedAt}`);
      console.log(`✓ Source: ${config.metadata.source} v${config.metadata.version}`);
    }

    return true;

  } catch (error) {
    console.log('❌ Failed to parse configuration:', error.message);
    return false;
  }
}

function printUsageInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('📖 How to Use AIOS Agents in Kiro CLI');
  console.log('='.repeat(60));
  console.log('\n1. Start Kiro CLI in any project:');
  console.log('   kiro-cli chat\n');
  console.log('2. Activate an agent using shortcuts:');
  console.log('   @architect');
  console.log('   @dev');
  console.log('   @qa\n');
  console.log('3. Use agent commands:');
  console.log('   *help              # Show available commands');
  console.log('   *create-plan       # Agent-specific command\n');
  console.log('4. Exit agent:');
  console.log('   *exit\n');
}

function main() {
  console.log('🔍 AIOS Global Agent Installation Verification\n');
  console.log('='.repeat(60));

  const dirCheck = checkDirectory();
  const filesCheck = checkAgentFiles();
  const configCheck = checkConfiguration();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Verification Summary');
  console.log('='.repeat(60));
  console.log(`Directories:    ${dirCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Agent Files:    ${filesCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Configuration:  ${configCheck ? '✅ PASS' : '❌ FAIL'}`);

  if (dirCheck && filesCheck && configCheck) {
    console.log('\n✅ All checks passed! AIOS agents are properly installed.\n');
    printUsageInstructions();
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed. Please reinstall:\n');
    console.log('   npm run install:agents:global');
    console.log('   # or');
    console.log('   node scripts/install-agents-globally.js\n');
    process.exit(1);
  }
}

main();
