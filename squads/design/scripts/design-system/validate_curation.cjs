#!/usr/bin/env node
/**
 * Quality Gates Validation — Curation Pipeline Final Check
 *
 * Reads curation-report.json and validates all thresholds.
 * Returns PASS, CONDITIONAL, or FAIL with detailed breakdown.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTRACTION_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction');
const CURATED_DIR = path.join(EXTRACTION_DIR, 'curated');
const REPORT_PATH = path.join(CURATED_DIR, 'curation-report.json');
const VALIDATION_PATH = path.join(CURATED_DIR, 'validation-result.json');
const STYLES_PATH = path.join(EXTRACTION_DIR, 'figma-styles.json');
const COMPONENTS_PATH = path.join(CURATED_DIR, 'curated-components.json');

// ── Gate Definitions ───────────────────────────────────────────────────────

const GATES = [
  {
    id: 'G1',
    name: 'Color Reduction',
    check: (r) => {
      const pct = parseFloat(r.scores.colors.reduction);
      if (pct >= 85) return { status: 'PASS', value: r.scores.colors.reduction };
      if (pct >= 70) return { status: 'CONDITIONAL', value: r.scores.colors.reduction };
      return { status: 'FAIL', value: r.scores.colors.reduction };
    },
    target: '>= 85%',
  },
  {
    id: 'G2',
    name: 'WCAG AA Contrast',
    check: (r) => {
      const pct = parseFloat(r.scores.colors.wcag_aa_pass);
      if (pct >= 100) return { status: 'PASS', value: r.scores.colors.wcag_aa_pass };
      if (pct >= 90) return { status: 'CONDITIONAL', value: r.scores.colors.wcag_aa_pass };
      return { status: 'FAIL', value: r.scores.colors.wcag_aa_pass };
    },
    target: '100%',
  },
  {
    id: 'G3',
    name: 'Spacing Reduction',
    check: (r) => {
      const pct = parseFloat(r.scores.spacing.reduction);
      if (pct >= 60) return { status: 'PASS', value: r.scores.spacing.reduction };
      if (pct >= 40) return { status: 'CONDITIONAL', value: r.scores.spacing.reduction };
      return { status: 'FAIL', value: r.scores.spacing.reduction };
    },
    target: '>= 60%',
  },
  {
    id: 'G4',
    name: 'Spacing Coverage',
    check: (r) => {
      const pct = parseFloat(r.scores.spacing.coverage);
      if (pct >= 95) return { status: 'PASS', value: r.scores.spacing.coverage };
      if (pct >= 85) return { status: 'CONDITIONAL', value: r.scores.spacing.coverage };
      return { status: 'FAIL', value: r.scores.spacing.coverage };
    },
    target: '>= 95%',
  },
  {
    id: 'G5',
    name: 'Typography Reduction',
    check: (r) => {
      const pct = parseFloat(r.scores.typography.reduction);
      if (pct >= 50) return { status: 'PASS', value: r.scores.typography.reduction };
      if (pct >= 35) return { status: 'CONDITIONAL', value: r.scores.typography.reduction };
      return { status: 'FAIL', value: r.scores.typography.reduction };
    },
    target: '>= 50%',
  },
  {
    id: 'G6',
    name: 'Font Families',
    check: (r) => {
      const count = r.scores.typography.after.families;
      if (count <= 3) return { status: 'PASS', value: `${count} families` };
      if (count === 4) return { status: 'CONDITIONAL', value: `${count} families` };
      return { status: 'FAIL', value: `${count} families` };
    },
    target: '<= 3',
  },
  {
    id: 'G7',
    name: 'Shadow Reduction',
    check: (r) => {
      const pct = parseFloat(r.scores.shadows.reduction);
      if (pct >= 70) return { status: 'PASS', value: r.scores.shadows.reduction };
      if (pct >= 50) return { status: 'CONDITIONAL', value: r.scores.shadows.reduction };
      return { status: 'FAIL', value: r.scores.shadows.reduction };
    },
    target: '>= 70%',
  },
  {
    id: 'G8',
    name: 'Radius Reduction',
    check: (r) => {
      const pct = parseFloat(r.scores.radius.reduction);
      if (pct >= 60) return { status: 'PASS', value: r.scores.radius.reduction };
      if (pct >= 40) return { status: 'CONDITIONAL', value: r.scores.radius.reduction };
      return { status: 'FAIL', value: r.scores.radius.reduction };
    },
    target: '>= 60%',
  },
  {
    id: 'G9',
    name: 'Overall Reduction',
    check: (r) => {
      const pct = parseFloat(r.scores.overall.reduction);
      if (pct >= 80) return { status: 'PASS', value: r.scores.overall.reduction };
      if (pct >= 60) return { status: 'CONDITIONAL', value: r.scores.overall.reduction };
      return { status: 'FAIL', value: r.scores.overall.reduction };
    },
    target: '>= 80%',
  },
  {
    id: 'G10',
    name: 'Component Naming Coverage',
    check: () => {
      try {
        const comps = JSON.parse(fs.readFileSync(COMPONENTS_PATH, 'utf8'));
        const all = comps.components || [];
        const named = all.filter((c) => c.name && c.name.trim() !== '');
        const pct = all.length > 0 ? (named.length / all.length) * 100 : 0;
        if (pct >= 90) return { status: 'PASS', value: `${Math.round(pct)}% (${named.length}/${all.length})` };
        if (pct >= 70) return { status: 'CONDITIONAL', value: `${Math.round(pct)}% (${named.length}/${all.length})` };
        return { status: 'FAIL', value: `${Math.round(pct)}% (${named.length}/${all.length})` };
      } catch (_) {
        return { status: 'CONDITIONAL', value: 'curated-components.json not found' };
      }
    },
    target: '>= 90%',
  },
  {
    id: 'G11',
    name: 'Figma Styles Coverage',
    check: () => {
      try {
        const styles = JSON.parse(fs.readFileSync(STYLES_PATH, 'utf8'));
        const count = styles.length;
        if (count > 0) return { status: 'PASS', value: `${count} styles fetched` };
        return { status: 'CONDITIONAL', value: '0 styles (endpoint may not be available)' };
      } catch (_) {
        return { status: 'CONDITIONAL', value: 'figma-styles.json not found' };
      }
    },
    target: '> 0 styles',
  },
];

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('=== QUALITY GATES VALIDATION ===\n');

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));

  const results = [];
  let passCount = 0;
  let conditionalCount = 0;
  let failCount = 0;

  for (const gate of GATES) {
    const result = gate.check(report);
    results.push({
      id: gate.id,
      name: gate.name,
      target: gate.target,
      value: result.value,
      status: result.status,
    });

    const icon = result.status === 'PASS' ? '✓' : result.status === 'CONDITIONAL' ? '⚠' : '✗';
    console.log(`  [${gate.id}] ${icon} ${gate.name}: ${result.value} (target: ${gate.target}) → ${result.status}`);

    if (result.status === 'PASS') passCount++;
    else if (result.status === 'CONDITIONAL') conditionalCount++;
    else failCount++;
  }

  // Overall verdict
  let verdict;
  if (failCount > 0) {
    verdict = 'FAIL';
  } else if (conditionalCount > 0) {
    verdict = 'CONDITIONAL';
  } else {
    verdict = 'PASS';
  }

  const validation = {
    timestamp: new Date().toISOString(),
    source: 'curation-report.json',
    verdict,
    summary: {
      total: GATES.length,
      pass: passCount,
      conditional: conditionalCount,
      fail: failCount,
    },
    gates: results,
  };

  fs.writeFileSync(VALIDATION_PATH, JSON.stringify(validation, null, 2));

  console.log('\n--- VERDICT ---');
  console.log(`  PASS: ${passCount}/${GATES.length}`);
  console.log(`  CONDITIONAL: ${conditionalCount}/${GATES.length}`);
  console.log(`  FAIL: ${failCount}/${GATES.length}`);
  console.log(`\n  Final Verdict: ${verdict}`);
  console.log(`\nOutput: ${VALIDATION_PATH}`);
  console.log('=== DONE ===');

  // Exit with code based on verdict
  if (verdict === 'FAIL') process.exit(1);
  if (verdict === 'CONDITIONAL') process.exit(0);
  process.exit(0);
}

main();
