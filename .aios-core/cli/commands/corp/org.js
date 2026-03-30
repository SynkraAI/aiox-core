/**
 * CLI Command: aiox corp org
 *
 * Display the organizational hierarchy as a tree view.
 *
 * @module cli/commands/corp/org
 * @version 1.0.0
 * @story CORP-1 - OrgEngine + org-config.yaml
 *
 * Usage:
 *   aiox corp org                      # Full org tree
 *   aiox corp org --dept engineering   # Filter by department
 *   aiox corp org --level L3           # Filter by level
 *   aiox corp org --json               # JSON output
 */

'use strict';

const path = require('path');

// =====================================================
// ICONS
// =====================================================

const DEPT_ICONS = {
  wrench: '\u{1F527}',
  clipboard: '\u{1F4CB}',
  palette: '\u{1F3A8}',
  chart: '\u{1F4CA}',
  gear: '\u2699\uFE0F',
  microscope: '\u{1F52C}',
  shield: '\u{1F6E1}\uFE0F',
  brain: '\u{1F9E0}',
  rocket: '\u{1F680}',
  handshake: '\u{1F91D}',
  people: '\u{1F465}',
  dollar: '\u{1F4B5}',
  scale: '\u2696\uFE0F',
  book: '\u{1F4DA}',
};

const LEVEL_COLORS = {
  L5: '\x1b[35m', // magenta
  L4: '\x1b[31m', // red
  L3: '\x1b[33m', // yellow
  L2: '\x1b[36m', // cyan
  L1: '\x1b[32m', // green
  L0: '\x1b[90m', // gray
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

// =====================================================
// PARSE FLAGS
// =====================================================

function parseFlags(args) {
  const flags = { dept: null, level: null, json: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dept' && args[i + 1]) {
      flags.dept = args[++i];
    } else if (arg === '--level' && args[i + 1]) {
      flags.level = args[++i];
    } else if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }

  return flags;
}

// =====================================================
// TREE RENDERING
// =====================================================

function renderTree(engine, flags) {
  const lines = [];

  if (flags.level) {
    // Filter by level
    const agents = engine.getAgentsByLevel(flags.level);
    if (agents.length === 0) {
      console.log(`No agents found at level ${flags.level}`);
      return;
    }

    const levelInfo = engine.getConfig().levels[flags.level];
    lines.push(`${BOLD}${flags.level}: ${levelInfo ? levelInfo.name : 'Unknown'}${RESET} (${agents.length} agents)`);
    lines.push('');

    for (const agent of agents.sort((a, b) => a.id.localeCompare(b.id))) {
      const color = LEVEL_COLORS[agent.level] || '';
      const deptLabel = agent.department ? ` [${agent.department}]` : '';
      lines.push(`  ${color}${agent.id}${RESET} -- ${agent.title || agent.description}${DIM}${deptLabel}${RESET}`);
    }

    console.log(lines.join('\n'));
    return;
  }

  if (flags.dept) {
    // Filter by department
    const dept = engine.getDepartment(flags.dept);
    if (!dept) {
      console.log(`Department not found: ${flags.dept}`);
      console.log(`Available: ${engine.getAllDepartmentIds().join(', ')}`);
      return;
    }

    const icon = DEPT_ICONS[dept.icon] || '';
    lines.push(`${BOLD}${icon} ${dept.name}${RESET} (${dept.description})`);
    lines.push(`  Head: ${dept.head}`);
    lines.push('');

    const members = engine.getAgentsByDepartment(flags.dept);
    const byLevel = {};
    for (const m of members) {
      if (!byLevel[m.level]) byLevel[m.level] = [];
      byLevel[m.level].push(m);
    }

    for (const level of ['L4', 'L3', 'L2', 'L1', 'L0']) {
      if (!byLevel[level]) continue;
      const color = LEVEL_COLORS[level] || '';
      lines.push(`  ${color}${BOLD}${level}${RESET}`);
      for (const agent of byLevel[level].sort((a, b) => a.id.localeCompare(b.id))) {
        lines.push(`    ${color}${agent.id}${RESET} -- ${agent.title || agent.description}`);
      }
    }

    console.log(lines.join('\n'));
    return;
  }

  // Full org tree
  lines.push(`${BOLD}AIOX Corporation -- Organizational Hierarchy${RESET}`);
  lines.push('');

  // L5 CEO
  const l5Agents = engine.getAgentsByLevel('L5');
  if (l5Agents.length > 0) {
    lines.push(`${LEVEL_COLORS.L5}${BOLD}L5 CEO${RESET}`);
    for (const a of l5Agents) {
      lines.push(`${LEVEL_COLORS.L5}  \u2514\u2500 ${a.id}${RESET} -- ${a.title}`);
    }
    lines.push('');
  }

  // L4 C-Suite
  const l4Agents = engine.getAgentsByLevel('L4');
  if (l4Agents.length > 0) {
    lines.push(`${LEVEL_COLORS.L4}${BOLD}L4 C-Suite${RESET}`);
    for (const a of l4Agents.sort((a, b) => a.id.localeCompare(b.id))) {
      const deptLabel = a.department ? ` [${a.department}]` : ' [cross-functional]';
      lines.push(`${LEVEL_COLORS.L4}  \u2514\u2500 ${a.id}${RESET} -- ${a.title}${DIM}${deptLabel}${RESET}`);
    }
    lines.push('');
  }

  // Departments
  const deptIds = engine.getAllDepartmentIds();
  for (const deptId of deptIds.sort()) {
    const dept = engine.getDepartment(deptId);
    const icon = DEPT_ICONS[dept.icon] || '';
    const memberCount = dept.members.length;
    lines.push(`${BOLD}${icon} ${dept.name}${RESET} ${DIM}(${memberCount} members, head: ${dept.head})${RESET}`);

    const members = engine.getAgentsByDepartment(deptId);
    // Skip L4 (already shown above) and group by level
    const filtered = members.filter(m => m.level !== 'L4');
    for (const level of ['L3', 'L2', 'L1', 'L0']) {
      const levelMembers = filtered.filter(m => m.level === level);
      if (levelMembers.length === 0) continue;
      const color = LEVEL_COLORS[level] || '';
      for (const agent of levelMembers.sort((a, b) => a.id.localeCompare(b.id))) {
        const autoTag = agent._auto_classified ? ` ${DIM}[auto]${RESET}` : '';
        lines.push(`  ${color}\u251C\u2500 [${level}] ${agent.id}${RESET} -- ${agent.title || ''}${autoTag}`);
      }
    }
    lines.push('');
  }

  // Summary
  const allAgents = engine.getAllAgents();
  const summary = {};
  for (const a of allAgents) {
    summary[a.level] = (summary[a.level] || 0) + 1;
  }
  lines.push(`${DIM}Total: ${allAgents.length} agents across ${deptIds.length} departments${RESET}`);
  const summaryParts = Object.entries(summary)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([level, count]) => `${level}: ${count}`);
  lines.push(`${DIM}${summaryParts.join(' | ')}${RESET}`);

  console.log(lines.join('\n'));
}

// =====================================================
// EXECUTE
// =====================================================

function execute(args = []) {
  const flags = parseFlags(args);

  // Load OrgEngine
  const { OrgEngine } = require(path.resolve(__dirname, '../../../core/corporation/org-engine'));
  const projectRoot = process.cwd();
  const engine = new OrgEngine(projectRoot);
  engine.load();

  if (!engine.isLoaded()) {
    console.error('Failed to load organizational config. Check org-config.yaml.');
    process.exit(1);
  }

  if (flags.json) {
    const config = engine.getConfig();
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  renderTree(engine, flags);
}

function showHelp() {
  console.log(`
\x1b[1maiox corp org\x1b[0m -- Display organizational hierarchy

\x1b[1mFLAGS:\x1b[0m
  --dept <name>    Filter by department (e.g., engineering, sales)
  --level <L0-L5>  Filter by hierarchy level
  --json           Output raw config as JSON

\x1b[1mEXAMPLES:\x1b[0m
  aiox corp org                      # Full tree
  aiox corp org --dept engineering   # Engineering department
  aiox corp org --level L3           # All VPs/Chiefs
  aiox corp org --json               # JSON output
`);
}

module.exports = { execute };
