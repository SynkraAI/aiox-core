#!/usr/bin/env node
/**
 * AIOX Status Command for Gemini CLI Extension
 * Shows system status and provider information
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const projectDir = process.cwd();

  console.log('🔷 AIOX Status\n');
  console.log('━'.repeat(40));

  // Check AIOX installation
  const aioxCorePath = path.join(projectDir, '.aiox-core');
  if (fs.existsSync(aioxCorePath)) {
    console.log('✅ AIOX Core: Installed');

    // Count agents
    const agentsPath = path.join(aioxCorePath, 'development', 'agents');
    if (fs.existsSync(agentsPath)) {
      const agents = fs.readdirSync(agentsPath).filter((f) => f.endsWith('.md'));
      console.log(`   Agents: ${agents.length}`);
    }

    // Count tasks
    const tasksPath = path.join(aioxCorePath, 'development', 'tasks');
    if (fs.existsSync(tasksPath)) {
      const tasks = fs.readdirSync(tasksPath).filter((f) => f.endsWith('.md'));
      console.log(`   Tasks: ${tasks.length}`);
    }
  } else {
    console.log('❌ AIOX Core: Not installed');
    console.log('   Run: npx aiox-core install');
  }

  // Check providers
  console.log('\n📡 AI Providers:');

  try {
    require('child_process').execSync('claude --version', { stdio: 'pipe' });
    console.log('   ✅ Claude Code: Available');
  } catch {
    console.log('   ❌ Claude Code: Not installed');
  }

  try {
    require('child_process').execSync('gemini --version', { stdio: 'pipe' });
    console.log('   ✅ Gemini CLI: Available (current)');
  } catch {
    console.log('   ⚠️  Gemini CLI: Running from extension');
  }
  
  try {
    require('child_process').execSync('aiox-qwen --version', { stdio: 'pipe' });
    console.log('   ✅ Qwen Router (aiox-qwen): Available');
  } catch {
    // Optional, don't show if not installed yet
  }

  // Check config
  const configPath = path.join(projectDir, '.aiox-ai-config.yaml');
  if (fs.existsSync(configPath)) {
    console.log('\n⚙️  AI Config: .aiox-ai-config.yaml found');
  }

  console.log('\n' + '━'.repeat(40));
  console.log('Use @agent-name to activate an agent');
}

main().catch(console.error);
