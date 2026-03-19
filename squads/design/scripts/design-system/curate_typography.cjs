#!/usr/bin/env node
/**
 * Modular Scale + Font Consolidation — Typography Curation Pipeline
 *
 * Algorithm (from DS-CURATION-PIPELINE-PROPOSAL.md §4.3):
 *   1. Count frequency of each font family → pick top 2 + 1 mono
 *   2. Detect modular scale multiplier, generate size scale
 *   3. Consolidate weights (max 5)
 *   4. Calculate ideal line-height ratios
 *   5. Consolidate letter-spacing
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTRACTION_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction');
const MERGED_PATH = path.join(EXTRACTION_DIR, 'all-pages-merged.json');
const STYLES_PATH = path.join(EXTRACTION_DIR, 'figma-styles.json');
const OUTPUT_DIR = path.join(EXTRACTION_DIR, 'curated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'curated-typography.json');

// ── Size Scale (Tailwind-compatible) ───────────────────────────────────────

const SIZE_SCALE = [
  { name: 'xs', px: 12 },
  { name: 'sm', px: 14 },
  { name: 'base', px: 16 },
  { name: 'lg', px: 18 },
  { name: 'xl', px: 20 },
  { name: '2xl', px: 24 },
  { name: '3xl', px: 30 },
  { name: '4xl', px: 36 },
  { name: '5xl', px: 48 },
  { name: '6xl', px: 60 },
  { name: '7xl', px: 72 },
  { name: '8xl', px: 96 },
  { name: '9xl', px: 128 },
];

// ── Weight consolidation ───────────────────────────────────────────────────

const CANONICAL_WEIGHTS = [
  { name: 'light', value: 300 },
  { name: 'normal', value: 400 },
  { name: 'medium', value: 500 },
  { name: 'semibold', value: 600 },
  { name: 'bold', value: 700 },
];

function findNearestWeight(w) {
  let best = CANONICAL_WEIGHTS[0];
  let bestDist = Math.abs(w - best.value);
  for (const cw of CANONICAL_WEIGHTS) {
    const dist = Math.abs(w - cw.value);
    if (dist < bestDist) {
      bestDist = dist;
      best = cw;
    }
  }
  return { canonical: best, distance: bestDist };
}

// ── Line-height ratios ────────────────────────────────────────────────────

const LH_RATIOS = [
  { name: 'none', value: 1.0 },
  { name: 'tight', value: 1.25 },
  { name: 'snug', value: 1.375 },
  { name: 'normal', value: 1.5 },
  { name: 'relaxed', value: 1.625 },
  { name: 'loose', value: 2.0 },
];

function findNearestLineHeight(ratio) {
  let best = LH_RATIOS[0];
  let bestDist = Math.abs(ratio - best.value);
  for (const lh of LH_RATIOS) {
    const dist = Math.abs(ratio - lh.value);
    if (dist < bestDist) {
      bestDist = dist;
      best = lh;
    }
  }
  return best;
}

// ── Letter-spacing ─────────────────────────────────────────────────────────

const LS_SCALE = [
  { name: 'tighter', em: -0.05 },
  { name: 'tight', em: -0.025 },
  { name: 'normal', em: 0 },
  { name: 'wide', em: 0.025 },
  { name: 'wider', em: 0.05 },
  { name: 'widest', em: 0.1 },
];

// ── Mono font detection ───────────────────────────────────────────────────

const MONO_PATTERNS = /mono|code|console|courier|fira\s*code|jet\s*brains|source\s*code|menlo|hack|inconsolata/i;

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('=== TYPOGRAPHY CURATION PIPELINE ===\n');

  const merged = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf8'));
  const rawFonts = merged.fonts || [];
  const rawTextStyles = merged.textStyles || [];

  // Load Figma styles for enrichment
  let figmaStyles = [];
  try { figmaStyles = JSON.parse(fs.readFileSync(STYLES_PATH, 'utf8')); } catch (_) { /* optional */ }
  const textFigmaStyles = figmaStyles.filter((s) => s.style_type === 'TEXT');
  console.log(`  Figma text styles: ${textFigmaStyles.length}`);

  // Analyze text decoration and text case usage from enriched textStyles
  const decorationMap = new Map();
  const textCaseMap = new Map();
  for (const ts of rawTextStyles) {
    const dec = ts.textDecoration || 'NONE';
    decorationMap.set(dec, (decorationMap.get(dec) || 0) + (ts.count || 0));
    const tc = ts.textCase || 'ORIGINAL';
    textCaseMap.set(tc, (textCaseMap.get(tc) || 0) + (ts.count || 0));
  }

  console.log(`Input: ${rawFonts.length} font entries, ${rawTextStyles.length} text styles`);

  // 1. Font families — count frequency
  const familyMap = new Map(); // family → total count
  for (const font of rawFonts) {
    const family = (font.family || '').trim();
    if (!family) continue;
    familyMap.set(family, (familyMap.get(family) || 0) + (font.count || 0));
  }

  const sortedFamilies = [...familyMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, isMono: MONO_PATTERNS.test(name) }));

  console.log(`  Unique families: ${sortedFamilies.length}`);

  // Select top 2 display/body + 1 mono
  const monoFamilies = sortedFamilies.filter((f) => f.isMono);
  const nonMonoFamilies = sortedFamilies.filter((f) => !f.isMono);

  const selectedFamilies = [];
  if (nonMonoFamilies.length >= 1) selectedFamilies.push({ ...nonMonoFamilies[0], role: 'primary' });
  if (nonMonoFamilies.length >= 2) selectedFamilies.push({ ...nonMonoFamilies[1], role: 'secondary' });
  if (monoFamilies.length >= 1) selectedFamilies.push({ ...monoFamilies[0], role: 'mono' });

  // Rejected families (< 5% usage)
  const totalFontUsage = sortedFamilies.reduce((sum, f) => sum + f.count, 0);
  const rejectedFamilies = sortedFamilies
    .filter((f) => !selectedFamilies.some((s) => s.name === f.name))
    .filter((f) => (f.count / totalFontUsage) < 0.05)
    .map((f) => ({
      name: f.name,
      count: f.count,
      percentage: `${Math.round((f.count / totalFontUsage) * 1000) / 10}%`,
    }));

  console.log(`  Selected families: ${selectedFamilies.map((f) => f.name).join(', ')}`);
  console.log(`  Rejected families: ${rejectedFamilies.length}`);

  // 2. Font sizes — map to scale
  const sizeMap = new Map(); // px → count
  for (const ts of rawTextStyles) {
    const size = Math.round(ts.fontSize || 0);
    if (size <= 0) continue;
    sizeMap.set(size, (sizeMap.get(size) || 0) + (ts.count || 0));
  }

  const uniqueSizes = [...sizeMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([px, count]) => ({ px, count }));

  console.log(`  Unique sizes: ${uniqueSizes.length}`);

  // Map each size to nearest scale step
  const sizeMappings = [];
  const usedSizeSteps = new Map();

  for (const { px, count } of uniqueSizes) {
    let bestStep = SIZE_SCALE[0];
    let bestDist = Math.abs(px - bestStep.px);

    for (const step of SIZE_SCALE) {
      const dist = Math.abs(px - step.px);
      if (dist < bestDist) {
        bestDist = dist;
        bestStep = step;
      }
    }

    sizeMappings.push({
      originalPx: px,
      mappedTo: bestStep.name,
      mappedPx: bestStep.px,
      distance: bestDist,
      count,
    });

    const acc = usedSizeSteps.get(bestStep.name) || { ...bestStep, count: 0, rem: bestStep.px / 16 };
    acc.count += count;
    usedSizeSteps.set(bestStep.name, acc);
  }

  // Final size scale (used + essential)
  const essentialSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
  const finalSizeScale = SIZE_SCALE
    .filter((s) => usedSizeSteps.has(s.name) || essentialSizes.includes(s.name))
    .map((s) => ({
      name: s.name,
      px: s.px,
      rem: s.px / 16,
      cssVar: `--font-size-${s.name}`,
      usage: usedSizeSteps.get(s.name)?.count || 0,
    }));

  // 3. Weights — consolidate
  const weightMap = new Map();
  for (const ts of rawTextStyles) {
    const w = ts.fontWeight || 400;
    weightMap.set(w, (weightMap.get(w) || 0) + (ts.count || 0));
  }

  const decisions = [];
  const weightMappings = [];
  const usedWeights = new Map();

  for (const [w, count] of weightMap) {
    const { canonical, distance } = findNearestWeight(w);
    weightMappings.push({
      original: w,
      mappedTo: canonical.name,
      mappedValue: canonical.value,
      distance,
      count,
    });

    const acc = usedWeights.get(canonical.name) || { ...canonical, count: 0 };
    acc.count += count;
    usedWeights.set(canonical.name, acc);

    if (distance > 0) {
      decisions.push({
        category: 'typography',
        action: 'MAP_WEIGHT',
        items: [`weight ${w}`],
        result: `${canonical.name} (${canonical.value})`,
        reason: `Distance ${distance} < 50 threshold`,
        authority: 'DS-CURATION-PIPELINE-PROPOSAL §4.3',
      });
    }
  }

  const finalWeights = CANONICAL_WEIGHTS
    .filter((w) => usedWeights.has(w.name))
    .map((w) => ({
      name: w.name,
      value: w.value,
      cssVar: `--font-weight-${w.name}`,
      usage: usedWeights.get(w.name)?.count || 0,
    }));

  // 4. Line heights
  const lhMap = new Map();
  for (const ts of rawTextStyles) {
    if (!ts.fontSize || !ts.lineHeight) continue;
    const ratio = Math.round((ts.lineHeight / ts.fontSize) * 100) / 100;
    lhMap.set(ratio, (lhMap.get(ratio) || 0) + (ts.count || 0));
  }

  const usedLineHeights = new Map();
  for (const [ratio, count] of lhMap) {
    const nearest = findNearestLineHeight(ratio);
    const acc = usedLineHeights.get(nearest.name) || { ...nearest, count: 0 };
    acc.count += count;
    usedLineHeights.set(nearest.name, acc);
  }

  const finalLineHeights = LH_RATIOS
    .filter((lh) => usedLineHeights.has(lh.name))
    .map((lh) => ({
      name: lh.name,
      value: lh.value,
      cssVar: `--line-height-${lh.name}`,
      usage: usedLineHeights.get(lh.name)?.count || 0,
    }));

  // 5. Letter spacing
  const lsMap = new Map();
  for (const ts of rawTextStyles) {
    const ls = ts.letterSpacing || 0;
    const em = ts.fontSize ? Math.round((ls / ts.fontSize) * 1000) / 1000 : 0;
    const key = Math.round(em * 100) / 100;
    lsMap.set(key, (lsMap.get(key) || 0) + (ts.count || 0));
  }

  const finalLetterSpacing = LS_SCALE.map((ls) => ({
    name: ls.name,
    em: ls.em,
    cssVar: `--letter-spacing-${ls.name}`,
  }));

  // Stats
  const totalBefore = {
    families: sortedFamilies.length,
    sizes: uniqueSizes.length,
    weights: weightMap.size,
  };
  const totalAfter = {
    families: selectedFamilies.length,
    sizes: finalSizeScale.length,
    weights: finalWeights.length,
  };

  const reductionPct =
    (1 -
      (totalAfter.families + totalAfter.sizes + totalAfter.weights) /
        (totalBefore.families + totalBefore.sizes + totalBefore.weights)) *
    100;

  const scores = {
    before: totalBefore,
    after: totalAfter,
    reduction: `${Math.round(reductionPct * 10) / 10}%`,
    target: '50%',
    status: reductionPct >= 50 ? 'PASS' : reductionPct >= 35 ? 'CONDITIONAL' : 'FAIL',
    families_status: totalAfter.families <= 3 ? 'PASS' : totalAfter.families === 4 ? 'CONDITIONAL' : 'FAIL',
    weights_status: totalAfter.weights <= 5 ? 'PASS' : totalAfter.weights === 6 ? 'CONDITIONAL' : 'FAIL',
  };

  // Text decoration analysis
  const textDecorations = [...decorationMap.entries()]
    .filter(([k]) => k !== 'NONE')
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Text case analysis
  const textCases = [...textCaseMap.entries()]
    .filter(([k]) => k !== 'ORIGINAL')
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Paragraph spacing analysis
  const paragraphSpacingMap = new Map();
  for (const ts of rawTextStyles) {
    const ps = ts.paragraphSpacing || 0;
    if (ps > 0) {
      paragraphSpacingMap.set(ps, (paragraphSpacingMap.get(ps) || 0) + (ts.count || 0));
    }
  }
  const paragraphSpacings = [...paragraphSpacingMap.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  const output = {
    meta: {
      source: 'all-pages-merged.json',
      pagesIncluded: merged.meta.pagesIncluded,
      curatedAt: new Date().toISOString(),
      algorithm: 'Modular scale + font consolidation',
      figmaTextStylesCount: textFigmaStyles.length,
    },
    scores,
    families: selectedFamilies.map((f) => ({
      name: f.name,
      role: f.role,
      count: f.count,
      percentage: `${Math.round((f.count / totalFontUsage) * 1000) / 10}%`,
      cssVar: `--font-family-${f.role}`,
    })),
    rejectedFamilies,
    sizeScale: finalSizeScale,
    weights: finalWeights,
    lineHeights: finalLineHeights,
    letterSpacing: finalLetterSpacing,
    textDecorations,
    textCases,
    paragraphSpacings,
    decisions,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log('\n--- RESULTS ---');
  console.log(`  Families: ${totalBefore.families} → ${totalAfter.families} (${scores.families_status})`);
  console.log(`  Sizes: ${totalBefore.sizes} → ${totalAfter.sizes}`);
  console.log(`  Weights: ${totalBefore.weights} → ${totalAfter.weights} (${scores.weights_status})`);
  console.log(`  Line heights: ${lhMap.size} → ${finalLineHeights.length}`);
  console.log(`  Text decorations: ${textDecorations.length} non-default`);
  console.log(`  Text cases: ${textCases.length} non-default`);
  console.log(`  Paragraph spacings: ${paragraphSpacings.length} distinct values`);
  console.log(`  Overall reduction: ${scores.reduction} (target: ${scores.target}) → ${scores.status}`);
  console.log(`  Decisions logged: ${decisions.length}`);
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log('=== DONE ===');
}

main();
