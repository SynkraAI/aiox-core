#!/usr/bin/env node
/**
 * AIOX Agents Command - List available agents
 */

const fs = require('fs');
const path = require('path');

const AGENT_INFO = {
  dev: { icon: '👨‍💻', persona: 'Dex', role: 'Developer' },
  architect: { icon: '🏛️', persona: 'Aria', role: 'Architect' },
  qa: { icon: '🧪', persona: 'Quinn', role: 'QA Engineer' },
  pm: { icon: '📋', persona: 'Morgan', role: 'Product Manager' },
  po: { icon: '🎯', persona: 'Pax', role: 'Product Owner' },
  sm: { icon: '🔄', persona: 'River', role: 'Scrum Master' },
  analyst: { icon: '📊', persona: 'Alex', role: 'Analyst' },
  devops: { icon: '🚀', persona: 'Gage', role: 'DevOps' },
  'data-engineer': { icon: '🗄️', persona: 'Dara', role: 'Data Engineer' },
  'ux-design-expert': { icon: '🎨', persona: 'Uma', role: 'UX Designer' },
};

async function main() {
  const projectDir = process.cwd();
  const agentsPath = path.join(projectDir, '.aiox-core', 'development', 'agents');

  console.log('🤖 AIOX Agents\n');
  console.log('━'.repeat(50));

  if (!fs.existsSync(agentsPath)) {
    console.log('No agents found. Run: npx aiox-core install');
    return;
  }

  const files = fs.readdirSync(agentsPath).filter((f) => f.endsWith('.md') && !f.startsWith('_'));

  for (const file of files) {
    const agentId = file.replace('.md', '');
    const info = AGENT_INFO[agentId] || { icon: '🤖', persona: agentId, role: 'Agent' };

    console.log(`${info.icon} @${agentId}`);
    console.log(`   Persona: ${info.persona} | Role: ${info.role}`);
  }

  console.log('\n' + '━'.repeat(50));
  console.log('Quick launch with: /aiox-menu or /aiox-<agent-id>');
  console.log('Alternative: /aiox-agent <agent-id>');
}

main().catch(console.error);
