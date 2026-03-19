#!/usr/bin/env node
/**
 * GCD Base Unit + Harmonic Scale — Spacing Curation Pipeline
 *
 * Algorithm (from DS-CURATION-PIPELINE-PROPOSAL.md §4.2):
 *   1. Normalize units (rem → px)
 *   2. Calculate GCD of all values
 *   3. Default to 4px grid if GCD is anomalous
 *   4. Generate harmonic scale (0-96px, 13 steps)
 *   5. Map each value to nearest scale step
 *   6. Document unmapped values as overrides
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTRACTION_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction');
const MERGED_PATH = path.join(EXTRACTION_DIR, 'all-pages-merged.json');
const OUTPUT_DIR = path.join(EXTRACTION_DIR, 'curated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'curated-spacing.json');

// ── Math helpers ───────────────────────────────────────────────────────────

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function gcdArray(arr) {
  return arr.reduce((acc, val) => gcd(acc, val), arr[0]);
}

// ── Harmonic Scale ─────────────────────────────────────────────────────────

// Standard 4px grid scale (Tailwind-compatible)
const SCALE = [
  { name: '0', px: 0 },
  { name: '0.5', px: 2 },
  { name: '1', px: 4 },
  { name: '1.5', px: 6 },
  { name: '2', px: 8 },
  { name: '2.5', px: 10 },
  { name: '3', px: 12 },
  { name: '3.5', px: 14 },
  { name: '4', px: 16 },
  { name: '5', px: 20 },
  { name: '6', px: 24 },
  { name: '7', px: 28 },
  { name: '8', px: 32 },
  { name: '9', px: 36 },
  { name: '10', px: 40 },
  { name: '11', px: 44 },
  { name: '12', px: 48 },
  { name: '14', px: 56 },
  { name: '16', px: 64 },
  { name: '20', px: 80 },
  { name: '24', px: 96 },
  { name: '28', px: 112 },
  { name: '32', px: 128 },
  { name: '36', px: 144 },
  { name: '40', px: 160 },
  { name: '44', px: 176 },
  { name: '48', px: 192 },
  { name: '52', px: 208 },
  { name: '56', px: 224 },
  { name: '60', px: 240 },
  { name: '64', px: 256 },
  { name: '72', px: 288 },
  { name: '80', px: 320 },
  { name: '96', px: 384 },
];

function findNearestStep(px) {
  let best = SCALE[0];
  let bestDist = Math.abs(px - best.px);

  for (const step of SCALE) {
    const dist = Math.abs(px - step.px);
    if (dist < bestDist) {
      bestDist = dist;
      best = step;
    }
  }

  return { step: best, distance: bestDist };
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('=== SPACING CURATION PIPELINE ===\n');

  const merged = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf8'));
  const rawSpacings = merged.spacings || [];

  console.log(`Input: ${rawSpacings.length} unique spacing values from ${merged.meta.pagesIncluded} pages`);

  // Extract unique px values with usage counts
  const valueMap = new Map(); // px → { count, types[], contexts[] }
  for (const sp of rawSpacings) {
    const px = Math.round(sp.value);
    if (px < 0) continue; // Skip negative values
    const entry = valueMap.get(px) || { px, count: 0, types: new Set(), contexts: new Set() };
    entry.count += sp.count || 0;
    entry.types.add(sp.type || 'unknown');
    if (sp.contexts) sp.contexts.forEach((c) => entry.contexts.add(c));
    valueMap.set(px, entry);
  }

  const uniqueValues = [...valueMap.values()].sort((a, b) => a.px - b.px);
  console.log(`  Unique pixel values: ${uniqueValues.length}`);

  // Calculate GCD
  const positiveValues = uniqueValues.filter((v) => v.px > 0).map((v) => v.px);
  const detectedGcd = positiveValues.length > 0 ? gcdArray(positiveValues) : 4;

  // Validate GCD
  let baseUnit = detectedGcd;
  let gcdStatus = 'auto';
  if (detectedGcd !== 4 && detectedGcd !== 8 && detectedGcd !== 2) {
    baseUnit = 4; // Default to 4px (Workshop rule)
    gcdStatus = 'override';
    console.log(`  GCD detected: ${detectedGcd}px → Overriding to 4px (market standard)`);
  } else {
    console.log(`  GCD detected: ${detectedGcd}px → Using as base unit`);
  }

  // Map each value to nearest scale step
  const MAX_DISTANCE = 2; // Values > 2px from scale step → override
  const decisions = [];
  const mapped = [];
  const overrides = [];
  const usedSteps = new Map(); // step name → accumulated count

  const totalUsage = uniqueValues.reduce((sum, v) => sum + v.count, 0);
  let mappedUsage = 0;

  for (const val of uniqueValues) {
    const { step, distance } = findNearestStep(val.px);

    if (distance <= MAX_DISTANCE) {
      mapped.push({
        originalPx: val.px,
        mappedTo: step.name,
        mappedPx: step.px,
        distance,
        count: val.count,
        types: [...val.types],
      });
      mappedUsage += val.count;

      const acc = usedSteps.get(step.name) || { step: step.name, px: step.px, count: 0 };
      acc.count += val.count;
      usedSteps.set(step.name, acc);

      if (distance > 0) {
        decisions.push({
          category: 'spacing',
          action: 'MAP',
          items: [`${val.px}px`],
          result: `${step.px}px (step ${step.name})`,
          reason: `Distance ${distance}px <= ${MAX_DISTANCE}px threshold, mapped to nearest scale step`,
          authority: 'Workshop 2026-02-16 — 4px grid market standard',
        });
      }
    } else {
      overrides.push({
        originalPx: val.px,
        nearestStep: step.name,
        nearestPx: step.px,
        distance,
        count: val.count,
        types: [...val.types],
        contexts: [...val.contexts].slice(0, 3),
      });
    }
  }

  // Build final scale (only steps that are actually used + essential ones)
  const essentialSteps = ['0', '1', '2', '3', '4', '6', '8', '10', '12', '16', '20', '24'];
  const finalScale = SCALE.filter(
    (s) => usedSteps.has(s.name) || essentialSteps.includes(s.name),
  ).map((s) => ({
    name: s.name,
    px: s.px,
    rem: Math.round((s.px / 16) * 10000) / 10000,
    cssVar: `--spacing-${s.name.replace('.', '_')}`,
    usage: usedSteps.get(s.name)?.count || 0,
  }));

  // Stats
  const coverage = (mappedUsage / totalUsage) * 100;
  const reduction = ((uniqueValues.length - finalScale.length) / uniqueValues.length) * 100;

  const scores = {
    before: uniqueValues.length,
    after: finalScale.length,
    reduction: `${Math.round(reduction * 10) / 10}%`,
    target: '60%',
    status: reduction >= 60 ? 'PASS' : reduction >= 40 ? 'CONDITIONAL' : 'FAIL',
    base_unit: `${baseUnit}px`,
    base_unit_status: gcdStatus === 'auto' ? 'PASS' : 'CONDITIONAL',
    coverage: `${Math.round(coverage * 10) / 10}%`,
    coverage_status: coverage >= 95 ? 'PASS' : coverage >= 85 ? 'CONDITIONAL' : 'FAIL',
    overrides_count: overrides.length,
  };

  const output = {
    meta: {
      source: 'all-pages-merged.json',
      pagesIncluded: merged.meta.pagesIncluded,
      curatedAt: new Date().toISOString(),
      algorithm: 'GCD base unit + harmonic scale mapping',
      baseUnit: baseUnit,
      detectedGcd: detectedGcd,
    },
    scores,
    scale: finalScale,
    overrides: overrides.sort((a, b) => b.count - a.count),
    decisions,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log('\n--- RESULTS ---');
  console.log(`  Before: ${scores.before} unique values`);
  console.log(`  After:  ${scores.after} scale steps`);
  console.log(`  Reduction: ${scores.reduction} (target: ${scores.target}) → ${scores.status}`);
  console.log(`  Base unit: ${scores.base_unit} (${scores.base_unit_status})`);
  console.log(`  Coverage: ${scores.coverage} → ${scores.coverage_status}`);
  console.log(`  Overrides: ${scores.overrides_count}`);
  console.log(`  Decisions logged: ${decisions.length}`);
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log('=== DONE ===');
}

main();
