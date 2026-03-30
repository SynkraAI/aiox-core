/**
 * CLI Command: aiox corp member <id>
 *
 * Display detailed information about a specific agent/member.
 *
 * @module cli/commands/corp/member
 * @version 1.0.0
 * @story CORP-1 - OrgEngine + org-config.yaml
 *
 * Usage:
 *   aiox corp member dev
 *   aiox corp member demis-hassabis
 *   aiox corp member architect --json
 */

'use strict';

const path = require('path');

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';

// =====================================================
// EXECUTE
// =====================================================

function execute(args = []) {
  const agentId = args[0];
  const isJson = args.includes('--json');

  if (!agentId || agentId === '--help' || agentId === '-h') {
    showHelp();
    return;
  }

  // Load OrgEngine
  const { OrgEngine } = require(path.resolve(__dirname, '../../../core/corporation/org-engine'));
  const projectRoot = process.cwd();
  const engine = new OrgEngine(projectRoot);
  engine.load();

  if (!engine.isLoaded()) {
    console.error('Failed to load organizational config. Check org-config.yaml.');
    process.exit(1);
  }

  const agent = engine.getAgent(agentId);
  if (!agent) {
    console.error(`Agent not found: ${agentId}`);

    // Suggest closest matches
    const allAgents = engine.getAllAgents();
    const suggestions = allAgents
      .filter(a => a.id.includes(agentId) || agentId.includes(a.id))
      .slice(0, 5);

    if (suggestions.length > 0) {
      console.log('\nDid you mean:');
      for (const s of suggestions) {
        console.log(`  - ${s.id}`);
      }
    }
    process.exit(1);
  }

  if (isJson) {
    console.log(JSON.stringify(agent, null, 2));
    return;
  }

  // Render agent details
  const lines = [];

  lines.push(`${BOLD}${agent.id}${RESET}`);
  lines.push('');

  if (agent.title) {
    lines.push(`  ${CYAN}Title:${RESET}       ${agent.title}`);
  }
  lines.push(`  ${CYAN}Level:${RESET}       ${agent.level} (${engine.getConfig().levels[agent.level]?.name || 'Unknown'})`);
  lines.push(`  ${CYAN}Type:${RESET}        ${agent.type}`);

  if (agent.department) {
    const dept = engine.getDepartment(agent.department);
    const deptName = dept ? dept.name : agent.department;
    lines.push(`  ${CYAN}Department:${RESET}  ${deptName} (${agent.department})`);
  } else {
    lines.push(`  ${CYAN}Department:${RESET}  ${DIM}Cross-functional${RESET}`);
  }

  if (agent.reports_to) {
    const superior = engine.getAgent(agent.reports_to);
    const superiorTitle = superior ? ` (${superior.title})` : '';
    lines.push(`  ${CYAN}Reports to:${RESET}  ${agent.reports_to}${DIM}${superiorTitle}${RESET}`);
  } else {
    lines.push(`  ${CYAN}Reports to:${RESET}  ${DIM}None (top level)${RESET}`);
  }

  lines.push(`  ${CYAN}Description:${RESET} ${agent.description}`);

  if (agent.source) {
    lines.push(`  ${CYAN}Source:${RESET}      ${agent.source}`);
  }

  if (agent._auto_classified) {
    lines.push(`  ${YELLOW}[Auto-classified]${RESET}`);
  }

  // Direct reports
  const reports = engine.getDirectReports(agentId);
  if (reports.length > 0) {
    lines.push('');
    lines.push(`  ${GREEN}Direct Reports (${reports.length}):${RESET}`);
    for (const r of reports.sort((a, b) => a.id.localeCompare(b.id))) {
      lines.push(`    - ${r.id} [${r.level}] -- ${r.title || r.description}`);
    }
  }

  // Escalation chain
  const chain = engine.getEscalationChain(agentId);
  if (chain.length > 0) {
    lines.push('');
    lines.push(`  ${GREEN}Escalation Chain:${RESET}`);
    lines.push(`    ${agentId} -> ${chain.map(c => c.id).join(' -> ')}`);
  }

  console.log(lines.join('\n'));
}

function showHelp() {
  console.log(`
\x1b[1maiox corp member <id>\x1b[0m -- Show agent details

\x1b[1mARGUMENTS:\x1b[0m
  id     Agent identifier (e.g., dev, architect, demis-hassabis)

\x1b[1mFLAGS:\x1b[0m
  --json   Output as JSON

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp member dev
  aiox corp member architect
  aiox corp member demis-hassabis --json
`);
}

module.exports = { execute };
