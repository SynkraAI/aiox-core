#!/usr/bin/env node

/**
 * Issue Triage Script
 * Batch triage tool for @devops to manage GitHub issues.
 *
 * Usage:
 *   node issue-triage.js --list                     # List untriaged issues
 *   node issue-triage.js --apply 174 --type bug --priority P2 --area installer
 *   node issue-triage.js --report                   # Generate triage summary
 *
 * Story: GHIM-001
 */

const { execSync } = require('child_process');

const VALID_TYPES = ['bug', 'feature', 'enhancement', 'docs', 'test', 'chore'];
const VALID_PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const VALID_AREAS = ['core', 'installer', 'synapse', 'cli', 'pro', 'health-check', 'docs', 'devops', 'agents', 'workflows'];

function gh(cmd) {
  try {
    return execSync(`gh ${cmd}`, { encoding: 'utf8', timeout: 60000 });
  } catch (err) {
    console.error(`gh command failed: ${err.message}`);
    process.exit(1);
  }
}

function listUntriaged() {
  const raw = gh('issue list --label "status: needs-triage" --json number,title,labels,createdAt,author --limit 100');
  const issues = JSON.parse(raw);

  if (issues.length === 0) {
    console.log('No untriaged issues found.');
    return;
  }

  console.log(`\n=== ${issues.length} Untriaged Issues ===\n`);
  for (const issue of issues) {
    const labels = issue.labels.map(l => l.name).join(', ');
    const date = issue.createdAt.split('T')[0];
    console.log(`  #${issue.number} [${date}] ${issue.title}`);
    console.log(`    Author: ${issue.author.login} | Labels: ${labels}`);
    console.log();
  }
}

function applyLabels(number, type, priority, areas, extra) {
  if (!VALID_TYPES.includes(type)) {
    console.error(`Invalid type: ${type}. Valid: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    console.error(`Invalid priority: ${priority}. Valid: ${VALID_PRIORITIES.join(', ')}`);
    process.exit(1);
  }

  const addLabels = [`type: ${type}`, `priority: ${priority}`, 'status: confirmed'];
  for (const area of areas) {
    if (!VALID_AREAS.includes(area)) {
      console.error(`Invalid area: ${area}. Valid: ${VALID_AREAS.join(', ')}`);
      process.exit(1);
    }
    addLabels.push(`area: ${area}`);
  }
  if (extra) {
    addLabels.push(...extra);
  }

  const addStr = addLabels.map(l => `"${l}"`).join(',');
  console.log(`Applying to #${number}: ${addLabels.join(', ')}`);
  gh(`issue edit ${number} --add-label ${addStr} --remove-label "status: needs-triage"`);
  console.log(`  Done.`);
}

function generateReport() {
  const raw = gh('issue list --state open --json number,title,labels --limit 200');
  const issues = JSON.parse(raw);

  const stats = {
    total: issues.length,
    untriaged: 0,
    byType: {},
    byPriority: {},
    byArea: {},
    byStatus: {}
  };

  for (const issue of issues) {
    const labels = issue.labels.map(l => l.name);

    if (labels.includes('status: needs-triage')) stats.untriaged++;

    for (const label of labels) {
      if (label.startsWith('type: ')) {
        const val = label.replace('type: ', '');
        stats.byType[val] = (stats.byType[val] || 0) + 1;
      }
      if (label.startsWith('priority: ')) {
        const val = label.replace('priority: ', '');
        stats.byPriority[val] = (stats.byPriority[val] || 0) + 1;
      }
      if (label.startsWith('area: ')) {
        const val = label.replace('area: ', '');
        stats.byArea[val] = (stats.byArea[val] || 0) + 1;
      }
      if (label.startsWith('status: ')) {
        const val = label.replace('status: ', '');
        stats.byStatus[val] = (stats.byStatus[val] || 0) + 1;
      }
    }
  }

  console.log('\n=== Issue Triage Report ===\n');
  console.log(`Total open issues: ${stats.total}`);
  console.log(`Untriaged: ${stats.untriaged}`);
  console.log(`\nBy Type:`);
  for (const [k, v] of Object.entries(stats.byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`\nBy Priority:`);
  for (const [k, v] of Object.entries(stats.byPriority).sort()) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`\nBy Area:`);
  for (const [k, v] of Object.entries(stats.byArea).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`\nBy Status:`);
  for (const [k, v] of Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
}

// CLI argument parsing
const args = process.argv.slice(2);

if (args.includes('--list')) {
  listUntriaged();
} else if (args.includes('--apply')) {
  const idx = args.indexOf('--apply');
  const number = parseInt(args[idx + 1]);
  const typeIdx = args.indexOf('--type');
  const prioIdx = args.indexOf('--priority');
  const areaIdx = args.indexOf('--area');
  const extraIdx = args.indexOf('--extra');

  if (!number || typeIdx === -1 || prioIdx === -1 || areaIdx === -1) {
    console.error('Usage: --apply <number> --type <type> --priority <P1-P4> --area <area> [--extra "label1,label2"]');
    process.exit(1);
  }

  const type = args[typeIdx + 1];
  const priority = args[prioIdx + 1];
  const areas = args[areaIdx + 1].split(',');
  const extra = extraIdx !== -1 ? args[extraIdx + 1].split(',') : [];

  applyLabels(number, type, priority, areas, extra);
} else if (args.includes('--report')) {
  generateReport();
} else {
  console.log('Issue Triage Tool (GHIM-001)\n');
  console.log('Usage:');
  console.log('  --list                                    List untriaged issues');
  console.log('  --apply <#> --type <t> --priority <P> --area <a>  Apply labels');
  console.log('  --report                                  Generate triage summary');
  console.log('\nTypes:', VALID_TYPES.join(', '));
  console.log('Priorities:', VALID_PRIORITIES.join(', '));
  console.log('Areas:', VALID_AREAS.join(', '));
}
