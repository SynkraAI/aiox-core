#!/usr/bin/env node

/**
 * Frontmatter Lint — Ecosystem Frontmatter Auditor
 *
 * Scans skills, squads, agents, and memory files for frontmatter
 * quality, consistency, and token economy.
 *
 * Usage:
 *   node tools/frontmatter-lint.js              # Full audit
 *   node tools/frontmatter-lint.js --scope=skills   # Only skills
 *   node tools/frontmatter-lint.js --scope=squads   # Only squads
 *   node tools/frontmatter-lint.js --scope=agents   # Only agents
 *   node tools/frontmatter-lint.js --scope=memory   # Only memory
 *   node tools/frontmatter-lint.js --json        # JSON output
 *   node tools/frontmatter-lint.js --fix-preview # Show what --fix would do
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const MEMORY_DIR = path.join(os.homedir(), '.claude', 'projects', '-Users-luizfosc-aios-core', 'memory');

// ============================================================
// CONFIG — Required fields per type
// ============================================================

const REQUIRED_FIELDS = {
  skill: ['name', 'description'],
  squad: ['name', 'description'],
  agent: ['name', 'description'],
  memory: ['name', 'description', 'type'],
};

const RECOMMENDED_FIELDS = {
  skill: ['version', 'category', 'tags'],
  squad: ['version', 'category'],
  agent: ['role', 'squad'],
  memory: [],
};

const TOKEN_THRESHOLDS = {
  skill: { min: 40, max: 120, ideal: '50-90' },
  squad: { min: 30, max: 100, ideal: '40-80' },
  agent: { min: 30, max: 100, ideal: '40-80' },
  memory: { min: 15, max: 50, ideal: '20-35' },
};

// ============================================================
// FRONTMATTER PARSER
// ============================================================

function parseFrontmatter(content) {
  const trimmed = content.trimStart();

  // Standard YAML frontmatter (between --- markers)
  if (trimmed.startsWith('---')) {
    const endIdx = trimmed.indexOf('---', 3);
    if (endIdx === -1) return { type: 'malformed', fields: {}, raw: '' };

    const raw = trimmed.slice(3, endIdx).trim();
    const fields = parseYamlSimple(raw);
    return { type: 'yaml', fields, raw };
  }

  // Embedded YAML in code fence (agent pattern)
  const fenceMatch = trimmed.match(/```yaml\n([\s\S]*?)```/);
  if (fenceMatch) {
    const raw = fenceMatch[1].trim();
    const fields = parseYamlSimple(raw);
    return { type: 'embedded-yaml', fields, raw };
  }

  // No frontmatter — just markdown
  return { type: 'none', fields: {}, raw: '' };
}

function parseYamlSimple(yamlStr) {
  const fields = {};
  let currentKey = null;
  let multiline = false;

  for (const line of yamlStr.split('\n')) {
    // Top-level key: value
    const kvMatch = line.match(/^([a-zA-Z_-]+)\s*:\s*(.*)$/);
    if (kvMatch && !line.startsWith('  ') && !line.startsWith('\t')) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();

      if (val === '|' || val === '>' || val === '|-' || val === '>-') {
        multiline = true;
        fields[currentKey] = '';
      } else if (val.startsWith('[') && val.endsWith(']')) {
        // Inline array
        fields[currentKey] = val;
        multiline = false;
      } else {
        fields[currentKey] = val;
        multiline = false;
      }
    } else if (multiline && currentKey && (line.startsWith('  ') || line.trim() === '')) {
      fields[currentKey] += (fields[currentKey] ? ' ' : '') + line.trim();
    } else {
      multiline = false;
    }
  }

  return fields;
}

// ============================================================
// TOKEN ESTIMATOR (rough: ~4 chars per token)
// ============================================================

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// ============================================================
// SCANNERS
// ============================================================

function scanSkills() {
  const results = [];
  const skillsDir = path.join(AIOS_CORE, 'skills');
  if (!fs.existsSync(skillsDir)) return results;

  for (const name of fs.readdirSync(skillsDir)) {
    const skillFile = path.join(skillsDir, name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const content = fs.readFileSync(skillFile, 'utf-8');
    const fm = parseFrontmatter(content);
    results.push(buildResult(skillFile, name, 'skill', fm));
  }

  return results;
}

function scanSquads() {
  const results = [];
  const squadsDir = path.join(AIOS_CORE, 'squads');
  if (!fs.existsSync(squadsDir)) return results;

  for (const name of fs.readdirSync(squadsDir)) {
    const readmeFile = path.join(squadsDir, name, 'README.md');
    if (!fs.existsSync(readmeFile)) continue;

    const content = fs.readFileSync(readmeFile, 'utf-8');
    const fm = parseFrontmatter(content);
    results.push(buildResult(readmeFile, name, 'squad', fm));

    // Scan squad agents
    const agentsDir = path.join(squadsDir, name, 'agents');
    if (fs.existsSync(agentsDir)) {
      for (const agentFile of fs.readdirSync(agentsDir)) {
        if (!agentFile.endsWith('.md')) continue;
        const agentPath = path.join(agentsDir, agentFile);
        const agentContent = fs.readFileSync(agentPath, 'utf-8');
        const agentFm = parseFrontmatter(agentContent);
        results.push(buildResult(agentPath, agentFile.replace('.md', ''), 'agent', agentFm));
      }
    }
  }

  return results;
}

function scanCoreAgents() {
  const results = [];
  const agentsDir = path.join(AIOS_CORE, '.aios-core', 'development', 'agents');
  if (!fs.existsSync(agentsDir)) return results;

  for (const file of fs.readdirSync(agentsDir)) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(agentsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const fm = parseFrontmatter(content);
    results.push(buildResult(filePath, file.replace('.md', ''), 'agent', fm));
  }

  return results;
}

function scanMemory() {
  const results = [];
  if (!fs.existsSync(MEMORY_DIR)) return results;

  for (const file of fs.readdirSync(MEMORY_DIR)) {
    if (!file.endsWith('.md') || file === 'MEMORY.md') continue;
    const filePath = path.join(MEMORY_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const fm = parseFrontmatter(content);
    results.push(buildResult(filePath, file.replace('.md', ''), 'memory', fm));
  }

  return results;
}

// ============================================================
// RESULT BUILDER
// ============================================================

function buildResult(filePath, name, entityType, fm) {
  const issues = [];
  const relativePath = filePath.replace(os.homedir() + '/', '~/');

  // Issue: No frontmatter
  if (fm.type === 'none') {
    issues.push({ severity: 'HIGH', message: 'No frontmatter found' });
  }

  // Issue: Embedded YAML (not standard frontmatter)
  if (fm.type === 'embedded-yaml') {
    issues.push({
      severity: 'MEDIUM',
      message: 'YAML embedded in code fence — not parseable as frontmatter',
    });
  }

  // Issue: Malformed frontmatter
  if (fm.type === 'malformed') {
    issues.push({ severity: 'HIGH', message: 'Malformed frontmatter (unclosed ---)' });
  }

  // Check required fields
  const required = REQUIRED_FIELDS[entityType] || [];
  for (const field of required) {
    if (!fm.fields[field] || fm.fields[field].trim() === '') {
      issues.push({
        severity: 'HIGH',
        message: `Missing required field: ${field}`,
      });
    }
  }

  // Check recommended fields
  const recommended = RECOMMENDED_FIELDS[entityType] || [];
  for (const field of recommended) {
    if (!fm.fields[field]) {
      issues.push({
        severity: 'LOW',
        message: `Missing recommended field: ${field}`,
      });
    }
  }

  // Token economy
  const tokenCount = estimateTokens(fm.raw);
  const thresholds = TOKEN_THRESHOLDS[entityType];

  if (thresholds && fm.type === 'yaml' && tokenCount > thresholds.max) {
    issues.push({
      severity: 'LOW',
      message: `Frontmatter bloated: ~${tokenCount} tokens (ideal: ${thresholds.ideal})`,
    });
  }

  // Description quality check
  if (fm.fields.description) {
    const descLen = fm.fields.description.length;
    if (descLen < 20) {
      issues.push({
        severity: 'MEDIUM',
        message: `Description too short (${descLen} chars) — not useful for search`,
      });
    }
  }

  return {
    name,
    entityType,
    path: relativePath,
    frontmatterType: fm.type,
    fields: Object.keys(fm.fields),
    tokenCount,
    issues,
    grade: calculateGrade(issues),
  };
}

function calculateGrade(issues) {
  const highCount = issues.filter((i) => i.severity === 'HIGH').length;
  const medCount = issues.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = issues.filter((i) => i.severity === 'LOW').length;

  if (highCount === 0 && medCount === 0 && lowCount === 0) return 'A+';
  if (highCount === 0 && medCount === 0) return 'A';
  if (highCount === 0 && medCount <= 1) return 'B';
  if (highCount <= 1) return 'C';
  if (highCount <= 2) return 'D';
  return 'F';
}

// ============================================================
// REPORT — Terminal Output
// ============================================================

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorGrade(grade) {
  if (grade.startsWith('A')) return `${COLORS.green}${grade}${COLORS.reset}`;
  if (grade === 'B') return `${COLORS.blue}${grade}${COLORS.reset}`;
  if (grade === 'C') return `${COLORS.yellow}${grade}${COLORS.reset}`;
  return `${COLORS.red}${grade}${COLORS.reset}`;
}

function colorSeverity(sev) {
  if (sev === 'HIGH') return `${COLORS.red}${sev}${COLORS.reset}`;
  if (sev === 'MEDIUM') return `${COLORS.yellow}${sev}${COLORS.reset}`;
  return `${COLORS.dim}${sev}${COLORS.reset}`;
}

function printReport(results) {
  const byType = {};
  for (const r of results) {
    if (!byType[r.entityType]) byType[r.entityType] = [];
    byType[r.entityType].push(r);
  }

  console.log(`\n${COLORS.bold}${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}  Frontmatter Lint — Ecosystem Audit${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

  let totalFiles = 0;
  let totalIssues = 0;
  let totalHigh = 0;
  let totalMedium = 0;
  const gradeCounts = {};

  for (const [type, items] of Object.entries(byType)) {
    const label = type.charAt(0).toUpperCase() + type.slice(1) + 's';
    console.log(`${COLORS.bold}${COLORS.magenta}[ ${label} ]${COLORS.reset} (${items.length} files)\n`);

    // Sort: worst grade first
    items.sort((a, b) => {
      const order = { F: 0, D: 1, C: 2, B: 3, A: 4, 'A+': 5 };
      return (order[a.grade] || 0) - (order[b.grade] || 0);
    });

    for (const item of items) {
      totalFiles++;
      totalIssues += item.issues.length;
      totalHigh += item.issues.filter((i) => i.severity === 'HIGH').length;
      totalMedium += item.issues.filter((i) => i.severity === 'MEDIUM').length;
      gradeCounts[item.grade] = (gradeCounts[item.grade] || 0) + 1;

      const fmLabel =
        item.frontmatterType === 'yaml'
          ? `${COLORS.green}YAML${COLORS.reset}`
          : item.frontmatterType === 'embedded-yaml'
            ? `${COLORS.yellow}EMBEDDED${COLORS.reset}`
            : item.frontmatterType === 'none'
              ? `${COLORS.red}NONE${COLORS.reset}`
              : `${COLORS.red}MALFORMED${COLORS.reset}`;

      console.log(
        `  ${colorGrade(item.grade)} ${COLORS.bold}${item.name}${COLORS.reset} — ${fmLabel} ~${item.tokenCount}tok  ${COLORS.dim}${item.path}${COLORS.reset}`
      );

      if (item.issues.length > 0) {
        for (const issue of item.issues) {
          console.log(`     ${colorSeverity(issue.severity)} ${issue.message}`);
        }
      }
    }

    console.log('');
  }

  // Summary
  console.log(`${COLORS.bold}${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.bold}  Summary${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

  console.log(`  Files scanned:  ${totalFiles}`);
  console.log(`  Total issues:   ${totalIssues} (${COLORS.red}${totalHigh} HIGH${COLORS.reset}, ${COLORS.yellow}${totalMedium} MEDIUM${COLORS.reset})`);
  console.log('');

  // Grade distribution
  const gradeOrder = ['A+', 'A', 'B', 'C', 'D', 'F'];
  const gradeLine = gradeOrder
    .filter((g) => gradeCounts[g])
    .map((g) => `${colorGrade(g)}: ${gradeCounts[g]}`)
    .join('  ');
  console.log(`  Grades: ${gradeLine}`);

  // Health score (0-100)
  // Weighted scoring: HIGH=10, MEDIUM=3, LOW=1
  const totalLow = totalIssues - totalHigh - totalMedium;
  const weightedIssues = (totalHigh * 10) + (totalMedium * 3) + (totalLow * 1);
  const maxPossibleIssues = totalFiles * 15; // rough max (3 HIGH per file)
  const healthScore = Math.max(0, Math.round(100 - (weightedIssues / Math.max(maxPossibleIssues, 1)) * 100));
  const healthColor = healthScore >= 80 ? COLORS.green : healthScore >= 50 ? COLORS.yellow : COLORS.red;
  console.log(`  Health score:   ${healthColor}${healthScore}/100${COLORS.reset}`);
  console.log('');
}

// ============================================================
// MAIN
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const scopeArg = args.find((a) => a.startsWith('--scope='));
  const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

  let results = [];

  if (scope === 'all' || scope === 'skills') {
    results = results.concat(scanSkills());
  }
  if (scope === 'all' || scope === 'squads') {
    results = results.concat(scanSquads());
  }
  if (scope === 'all' || scope === 'agents') {
    results = results.concat(scanCoreAgents());
  }
  if (scope === 'all' || scope === 'memory') {
    results = results.concat(scanMemory());
  }

  if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printReport(results);
  }

  // Exit code: 1 if any HIGH issues
  const hasHigh = results.some((r) => r.issues.some((i) => i.severity === 'HIGH'));
  process.exit(hasHigh ? 1 : 0);
}

main();
