#!/usr/bin/env node
/**
 * Generate Curation Report — Scoring + Decision Trail
 *
 * Reads all curated-*.json files and generates:
 *   - curation-report.json (machine-readable scoring)
 *   - docs/research/design-system-extraction/clickmax/curation-report.md (human-readable report)
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTRACTION_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction');
const CURATED_DIR = path.join(EXTRACTION_DIR, 'curated');
const REPORTS_DIR = path.join(ROOT, 'docs', 'research', 'design-system-extraction', 'clickmax');
const MERGED_PATH = path.join(EXTRACTION_DIR, 'all-pages-merged.json');
const STYLES_PATH = path.join(EXTRACTION_DIR, 'figma-styles.json');
const VARIABLES_PATH = path.join(EXTRACTION_DIR, 'figma-variables.json');
const REPORT_JSON = path.join(CURATED_DIR, 'curation-report.json');
const REPORT_MD = path.join(REPORTS_DIR, 'curation-report.md');

function readCurated(name) {
  const filePath = path.join(CURATED_DIR, name);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  console.log('=== CURATION REPORT GENERATION ===\n');
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const colors = readCurated('curated-colors.json');
  const spacing = readCurated('curated-spacing.json');
  const typography = readCurated('curated-typography.json');
  const shadows = readCurated('curated-shadows.json');
  const radius = readCurated('curated-radius.json');
  const components = readCurated('curated-components.json');

  // Aggregate all decisions
  const allDecisions = [
    ...(colors.decisions || []),
    ...(spacing.decisions || []),
    ...(typography.decisions || []),
    ...(shadows.decisions || []),
    ...(radius.decisions || []),
  ];

  // Calculate overall reduction
  const beforeTotal =
    colors.scores.before +
    spacing.scores.before +
    (typography.scores.before.families + typography.scores.before.sizes + typography.scores.before.weights) +
    shadows.scores.before +
    radius.scores.before;

  const afterTotal =
    colors.scores.after +
    spacing.scores.after +
    (typography.scores.after.families + typography.scores.after.sizes + typography.scores.after.weights) +
    shadows.scores.after +
    radius.scores.after;

  const overallReduction = ((beforeTotal - afterTotal) / beforeTotal) * 100;

  const report = {
    brand: 'clickmax',
    source: 'all-pages-merged.json',
    pagesIncluded: colors.meta.pagesIncluded,
    timestamp: new Date().toISOString(),
    scores: {
      colors: {
        before: colors.scores.before,
        after: colors.scores.after,
        reduction: colors.scores.reduction,
        target: colors.scores.target,
        status: colors.scores.status,
        wcag_aa_pass: colors.scores.wcag_aa_pass,
        coverage: colors.scores.coverage,
      },
      spacing: {
        before: spacing.scores.before,
        after: spacing.scores.after,
        reduction: spacing.scores.reduction,
        target: spacing.scores.target,
        status: spacing.scores.status,
        base_unit: spacing.scores.base_unit,
        coverage: spacing.scores.coverage,
      },
      typography: {
        before: typography.scores.before,
        after: typography.scores.after,
        reduction: typography.scores.reduction,
        target: typography.scores.target,
        status: typography.scores.status,
      },
      shadows: {
        before: shadows.scores.before,
        after: shadows.scores.after,
        reduction: shadows.scores.reduction,
        target: shadows.scores.target,
        status: shadows.scores.status,
      },
      radius: {
        before: radius.scores.before,
        after: radius.scores.after,
        reduction: radius.scores.reduction,
        target: radius.scores.target,
        status: radius.scores.status,
      },
      components: {
        before: components.scores.before,
        after: components.scores.after,
        reduction: components.scores.reduction,
        atomic: components.scores.atomic,
        priority: components.scores.priority,
      },
      overall: {
        before: beforeTotal,
        after: afterTotal,
        reduction: `${Math.round(overallReduction * 10) / 10}%`,
        target: '80%',
        status: overallReduction >= 80 ? 'PASS' : overallReduction >= 60 ? 'CONDITIONAL' : 'FAIL',
      },
    },
    decisions: allDecisions,
    decisionCount: allDecisions.length,
    figmaMetadata: {
      stylesCount: (() => { try { return JSON.parse(fs.readFileSync(STYLES_PATH, 'utf8')).length; } catch (_) { return 0; } })(),
      variablesCount: (() => { try { return Object.keys(JSON.parse(fs.readFileSync(VARIABLES_PATH, 'utf8')).variables || {}).length; } catch (_) { return 0; } })(),
    },
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  console.log(`  ✓ ${REPORT_JSON}`);

  // Generate Markdown report
  let md = '# Curation Report — Clickmax Design System\n\n';
  md += `**Generated:** ${report.timestamp}\n`;
  md += `**Source:** ${report.source} (${report.pagesIncluded} pages)\n`;
  md += `**Brand:** ${report.brand}\n\n`;

  md += '## Overall Score\n\n';
  md += '| Metric | Before | After | Reduction | Target | Status |\n';
  md += '|--------|--------|-------|-----------|--------|--------|\n';
  md += `| **Overall** | ${report.scores.overall.before} | ${report.scores.overall.after} | ${report.scores.overall.reduction} | ${report.scores.overall.target} | **${report.scores.overall.status}** |\n\n`;

  md += '## Category Scores\n\n';
  md += '| Category | Before | After | Reduction | Target | Status |\n';
  md += '|----------|--------|-------|-----------|--------|--------|\n';

  const categories = ['colors', 'spacing', 'typography', 'shadows', 'radius'];
  for (const cat of categories) {
    const s = report.scores[cat];
    const before = typeof s.before === 'object' ? JSON.stringify(s.before) : s.before;
    const after = typeof s.after === 'object' ? JSON.stringify(s.after) : s.after;
    md += `| ${cat} | ${before} | ${after} | ${s.reduction} | ${s.target} | ${s.status} |\n`;
  }

  md += '\n## Components\n\n';
  md += '| Metric | Value |\n';
  md += '|--------|-------|\n';
  md += `| Total (before filter) | ${report.scores.components.before} |\n`;
  md += `| Curated (after filter) | ${report.scores.components.after} |\n`;
  md += `| Atoms | ${report.scores.components.atomic.atoms} |\n`;
  md += `| Molecules | ${report.scores.components.atomic.molecules} |\n`;
  md += `| Organisms | ${report.scores.components.atomic.organisms} |\n`;
  md += `| P0 (critical) | ${report.scores.components.priority.P0} |\n`;
  md += `| P1 (important) | ${report.scores.components.priority.P1} |\n`;
  md += `| P2 (nice-to-have) | ${report.scores.components.priority.P2} |\n`;

  // Top 10 components by usage (with real names)
  const topComponents = (components.components || []).slice(0, 10);
  if (topComponents.length > 0) {
    md += '\n### Top 10 Components by Usage\n\n';
    md += '| # | Name | Count | Atomic | Priority |\n';
    md += '|---|------|-------|--------|----------|\n';
    topComponents.forEach((c, i) => {
      md += `| ${i + 1} | ${c.name || '(unnamed)'} | ${c.count} | ${c.atomicLevel} | ${c.priority} |\n`;
    });
  }

  // Figma Metadata section
  let figmaStylesCount = 0;
  let figmaVarCount = 0;
  let figmaColCount = 0;
  try {
    const styles = JSON.parse(fs.readFileSync(STYLES_PATH, 'utf8'));
    figmaStylesCount = styles.length;
  } catch (_) { /* optional */ }
  try {
    const vars = JSON.parse(fs.readFileSync(VARIABLES_PATH, 'utf8'));
    figmaVarCount = Object.keys(vars.variables || {}).length;
    figmaColCount = Object.keys(vars.variableCollections || {}).length;
  } catch (_) { /* optional */ }

  md += '\n## Figma Metadata\n\n';
  md += '| Metric | Count |\n';
  md += '|--------|-------|\n';
  md += `| Published styles | ${figmaStylesCount} |\n`;
  md += `| Variables | ${figmaVarCount} |\n`;
  md += `| Variable collections | ${figmaColCount} |\n`;

  // New Properties Coverage
  let mergedStats = {};
  try {
    const merged = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf8'));
    mergedStats = merged.meta?.stats || {};
  } catch (_) { /* optional */ }

  md += '\n## Extended Properties Coverage\n\n';
  md += '| Property | Count |\n';
  md += '|----------|-------|\n';
  md += `| Image references | ${mergedStats.totalImageRefs || 0} |\n`;
  md += `| Stroke details | ${mergedStats.totalStrokeDetails || 0} |\n`;
  md += `| Blur effects | ${mergedStats.totalBlurs || 0} |\n`;
  md += `| Blend modes (non-default) | ${mergedStats.totalBlendModes || 0} |\n`;

  md += '\n## Quality Gates\n\n';
  md += '| Gate | Value | Status |\n';
  md += '|------|-------|--------|\n';
  md += `| WCAG AA (colors) | ${report.scores.colors.wcag_aa_pass} | ${report.scores.colors.wcag_aa_pass === '100%' ? 'PASS' : 'CONDITIONAL'} |\n`;
  md += `| Color coverage | ${report.scores.colors.coverage} | ${report.scores.colors.coverage >= '95' ? 'PASS' : 'CONDITIONAL'} |\n`;
  md += `| Spacing coverage | ${report.scores.spacing.coverage} | ${report.scores.spacing.coverage >= '95' ? 'PASS' : 'CONDITIONAL'} |\n`;
  md += `| Base unit | ${report.scores.spacing.base_unit} | PASS |\n`;

  md += '\n## Decisions Trail\n\n';
  md += `Total decisions logged: **${report.decisionCount}**\n\n`;

  // Group decisions by category
  const decisionsByCategory = new Map();
  for (const d of allDecisions) {
    if (!decisionsByCategory.has(d.category)) decisionsByCategory.set(d.category, []);
    decisionsByCategory.get(d.category).push(d);
  }

  for (const [category, decisions] of decisionsByCategory) {
    md += `### ${category} (${decisions.length} decisions)\n\n`;
    for (const d of decisions.slice(0, 5)) {
      md += `- **${d.action}**: ${d.items.slice(0, 3).join(', ')}${d.items.length > 3 ? ` (+${d.items.length - 3} more)` : ''} → \`${d.result}\`\n`;
      md += `  - _${d.reason}_\n`;
      md += `  - Authority: ${d.authority}\n`;
    }
    if (decisions.length > 5) {
      md += `- _... and ${decisions.length - 5} more_\n`;
    }
    md += '\n';
  }

  md += '---\n_Generated by DS Curation Pipeline_\n';

  fs.writeFileSync(REPORT_MD, md);
  console.log(`  ✓ ${REPORT_MD}`);

  console.log('\n--- SUMMARY ---');
  console.log(`  Overall: ${report.scores.overall.before} → ${report.scores.overall.after} (${report.scores.overall.reduction}) → ${report.scores.overall.status}`);
  console.log(`  Decisions: ${report.decisionCount}`);
  console.log('\n=== DONE ===');
}

main();
