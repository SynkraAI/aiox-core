#!/usr/bin/env node
/**
 * Depth Level Consolidation — Shadow Curation Pipeline
 *
 * Algorithm (from DS-CURATION-PIPELINE-PROPOSAL.md §4.4):
 *   1. Calculate "depth score" for each shadow
 *   2. Bucket by depth levels (xs/sm/md/lg/xl)
 *   3. Select most-used shadow per bucket
 *   4. Replace hardcoded colors with token references
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTRACTION_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction');
const MERGED_PATH = path.join(EXTRACTION_DIR, 'all-pages-merged.json');
const OUTPUT_DIR = path.join(EXTRACTION_DIR, 'curated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'curated-shadows.json');

// ── Depth Buckets ──────────────────────────────────────────────────────────

const DEPTH_BUCKETS = [
  { name: 'xs', min: 0, max: 3, description: 'hover states, subtle elevation' },
  { name: 'sm', min: 4, max: 8, description: 'cards resting' },
  { name: 'md', min: 9, max: 15, description: 'cards elevated, dropdowns' },
  { name: 'lg', min: 16, max: 25, description: 'dialogs, popovers' },
  { name: 'xl', min: 26, max: 50, description: 'modals, overlays' },
  { name: '2xl', min: 51, max: Infinity, description: 'maximum elevation' },
];

function calculateDepthScore(shadow) {
  return Math.abs(shadow.offsetX || 0) + Math.abs(shadow.offsetY || 0) + (shadow.blurRadius || 0);
}

function findBucket(depthScore) {
  for (const bucket of DEPTH_BUCKETS) {
    if (depthScore >= bucket.min && depthScore <= bucket.max) {
      return bucket;
    }
  }
  return DEPTH_BUCKETS[DEPTH_BUCKETS.length - 1];
}

// ── Shadow to CSS ──────────────────────────────────────────────────────────

function shadowToCSS(shadow) {
  const inset = shadow.type === 'INNER_SHADOW' ? 'inset ' : '';
  const ox = shadow.offsetX || 0;
  const oy = shadow.offsetY || 0;
  const blur = shadow.blurRadius || 0;
  const spread = shadow.spread || 0;
  const color = shadow.color || 'rgba(0,0,0,0.1)';

  return `${inset}${ox}px ${oy}px ${blur}px ${spread}px ${color}`;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('=== SHADOW CURATION PIPELINE ===\n');

  const merged = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf8'));
  const rawShadows = merged.shadows || [];

  console.log(`Input: ${rawShadows.length} unique shadows from ${merged.meta.pagesIncluded} pages`);

  // Separate drop shadows vs inner shadows
  const dropShadows = rawShadows.filter((s) => s.type === 'DROP_SHADOW');
  const innerShadows = rawShadows.filter((s) => s.type === 'INNER_SHADOW');

  console.log(`  Drop shadows: ${dropShadows.length}`);
  console.log(`  Inner shadows: ${innerShadows.length}`);

  // Calculate depth scores and bucket
  const bucketedShadows = new Map(); // bucket name → shadows[]

  for (const shadow of dropShadows) {
    const depth = calculateDepthScore(shadow);
    const bucket = findBucket(depth);

    if (!bucketedShadows.has(bucket.name)) {
      bucketedShadows.set(bucket.name, []);
    }
    bucketedShadows.get(bucket.name).push({
      ...shadow,
      depthScore: depth,
      bucket: bucket.name,
    });
  }

  // Select most-used shadow per bucket
  const decisions = [];
  const curatedShadows = [];

  for (const bucket of DEPTH_BUCKETS) {
    const shadows = bucketedShadows.get(bucket.name) || [];
    if (shadows.length === 0) continue;

    // Sort by count descending
    shadows.sort((a, b) => (b.count || 0) - (a.count || 0));
    const selected = shadows[0];

    curatedShadows.push({
      name: `shadow-${bucket.name}`,
      cssVar: `--shadow-${bucket.name}`,
      bucket: bucket.name,
      description: bucket.description,
      value: {
        type: selected.type,
        offsetX: selected.offsetX,
        offsetY: selected.offsetY,
        blurRadius: selected.blurRadius,
        spread: selected.spread,
        color: selected.color,
      },
      css: shadowToCSS(selected),
      tokenizedCSS: shadowToCSS({
        ...selected,
        color: 'var(--color-shadow)',
      }),
      depthScore: selected.depthScore,
      count: selected.count,
      candidatesInBucket: shadows.length,
    });

    if (shadows.length > 1) {
      decisions.push({
        category: 'shadow',
        action: 'SELECT',
        items: shadows.map((s) => shadowToCSS(s)),
        result: shadowToCSS(selected),
        reason: `Most used in ${bucket.name} bucket (${selected.count} instances, ${shadows.length} candidates)`,
        authority: 'DS-CURATION-PIPELINE-PROPOSAL §4.4 — depth bucketing',
      });
    }
  }

  // Handle inner shadows separately
  const curatedInnerShadows = [];
  if (innerShadows.length > 0) {
    innerShadows.sort((a, b) => (b.count || 0) - (a.count || 0));
    const topInner = innerShadows[0];
    curatedInnerShadows.push({
      name: 'shadow-inner',
      cssVar: '--shadow-inner',
      description: 'inner shadow (inset)',
      value: {
        type: topInner.type,
        offsetX: topInner.offsetX,
        offsetY: topInner.offsetY,
        blurRadius: topInner.blurRadius,
        spread: topInner.spread,
        color: topInner.color,
      },
      css: shadowToCSS(topInner),
      count: topInner.count,
    });
  }

  // Stats
  const totalAfter = curatedShadows.length + curatedInnerShadows.length;
  const reduction = ((rawShadows.length - totalAfter) / rawShadows.length) * 100;

  const scores = {
    before: rawShadows.length,
    after: totalAfter,
    reduction: `${Math.round(reduction * 10) / 10}%`,
    target: '70%',
    status: reduction >= 70 ? 'PASS' : reduction >= 50 ? 'CONDITIONAL' : 'FAIL',
    buckets_used: curatedShadows.length,
    inner_shadows: curatedInnerShadows.length,
  };

  const output = {
    meta: {
      source: 'all-pages-merged.json',
      pagesIncluded: merged.meta.pagesIncluded,
      curatedAt: new Date().toISOString(),
      algorithm: 'Depth-level bucketing + frequency selection',
    },
    scores,
    shadows: curatedShadows,
    innerShadows: curatedInnerShadows,
    decisions,
    depthDistribution: DEPTH_BUCKETS.map((b) => ({
      bucket: b.name,
      range: `${b.min}-${b.max === Infinity ? '∞' : b.max}`,
      count: (bucketedShadows.get(b.name) || []).length,
    })),
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log('\n--- RESULTS ---');
  console.log(`  Before: ${scores.before} shadows`);
  console.log(`  After:  ${scores.after} tokens (${scores.buckets_used} drop + ${scores.inner_shadows} inner)`);
  console.log(`  Reduction: ${scores.reduction} (target: ${scores.target}) → ${scores.status}`);
  for (const s of curatedShadows) {
    console.log(`    ${s.name}: depth=${s.depthScore}, used=${s.count}x, candidates=${s.candidatesInBucket}`);
  }
  console.log(`  Decisions logged: ${decisions.length}`);
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log('=== DONE ===');
}

main();
