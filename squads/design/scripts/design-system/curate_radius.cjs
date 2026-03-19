#!/usr/bin/env node
/**
 * Harmonic Scale Mapping — Border Radius Curation Pipeline
 *
 * Algorithm (from DS-CURATION-PIPELINE-PROPOSAL.md §4.5):
 *   1. Normalize to px
 *   2. Bucket by size ranges (none → full)
 *   3. Select most-used value per bucket as canonical
 *   4. Detect brand signature radius preferences
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTRACTION_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction');
const MERGED_PATH = path.join(EXTRACTION_DIR, 'all-pages-merged.json');
const OUTPUT_DIR = path.join(EXTRACTION_DIR, 'curated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'curated-radius.json');

// ── Radius Buckets (Tailwind-compatible) ───────────────────────────────────

const RADIUS_BUCKETS = [
  { name: 'none', min: 0, max: 0, rem: '0' },
  { name: 'sm', min: 1, max: 4, rem: '0.125rem' },
  { name: 'md', min: 5, max: 8, rem: '0.375rem' },
  { name: 'lg', min: 9, max: 12, rem: '0.5rem' },
  { name: 'xl', min: 13, max: 16, rem: '0.75rem' },
  { name: '2xl', min: 17, max: 24, rem: '1rem' },
  { name: '3xl', min: 25, max: 40, rem: '1.5rem' },
  { name: 'full', min: 41, max: Infinity, rem: '9999px' },
];

function findBucket(px) {
  for (const bucket of RADIUS_BUCKETS) {
    if (px >= bucket.min && px <= bucket.max) {
      return bucket;
    }
  }
  return RADIUS_BUCKETS[RADIUS_BUCKETS.length - 1];
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('=== BORDER RADIUS CURATION PIPELINE ===\n');

  const merged = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf8'));
  const rawRadii = merged.radii || [];

  console.log(`Input: ${rawRadii.length} unique radius values from ${merged.meta.pagesIncluded} pages`);

  // Build unique values
  const valueMap = new Map(); // px → count
  for (const r of rawRadii) {
    const px = Math.round(r.value || 0);
    valueMap.set(px, (valueMap.get(px) || 0) + (r.count || 0));
  }

  const uniqueValues = [...valueMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([px, count]) => ({ px, count }));

  console.log(`  Unique pixel values: ${uniqueValues.length}`);

  // Bucket all values
  const bucketedRadii = new Map();
  const totalUsage = uniqueValues.reduce((sum, v) => sum + v.count, 0);

  for (const val of uniqueValues) {
    const bucket = findBucket(val.px);
    if (!bucketedRadii.has(bucket.name)) {
      bucketedRadii.set(bucket.name, []);
    }
    bucketedRadii.get(bucket.name).push(val);
  }

  // Select canonical value per bucket
  const decisions = [];
  const curatedRadii = [];

  for (const bucket of RADIUS_BUCKETS) {
    const values = bucketedRadii.get(bucket.name) || [];
    if (values.length === 0 && bucket.name !== 'none') continue;

    // Special case for 'none' — always include
    if (bucket.name === 'none' && values.length === 0) {
      curatedRadii.push({
        name: `radius-${bucket.name}`,
        cssVar: `--radius-${bucket.name}`,
        px: 0,
        rem: bucket.rem,
        bucket: bucket.name,
        count: 0,
        candidatesInBucket: 0,
      });
      continue;
    }

    // Sort by count descending
    values.sort((a, b) => b.count - a.count);
    const canonical = values[0];

    // For 'full', always use 9999px
    const finalPx = bucket.name === 'full' ? 9999 : canonical.px;
    const finalRem = bucket.name === 'full' ? '9999px' : `${Math.round((finalPx / 16) * 1000) / 1000}rem`;

    curatedRadii.push({
      name: `radius-${bucket.name}`,
      cssVar: `--radius-${bucket.name}`,
      px: finalPx,
      rem: finalRem,
      bucket: bucket.name,
      count: values.reduce((sum, v) => sum + v.count, 0),
      canonicalSource: canonical.px,
      candidatesInBucket: values.length,
    });

    if (values.length > 1) {
      decisions.push({
        category: 'radius',
        action: 'SELECT',
        items: values.map((v) => `${v.px}px (${v.count}x)`),
        result: `${finalPx}px`,
        reason: `Most used in ${bucket.name} bucket (${canonical.count} instances)`,
        authority: 'DS-CURATION-PIPELINE-PROPOSAL §4.5 — harmonic scale',
      });
    }
  }

  // Brand signature analysis: which buckets are most used?
  const brandSignature = curatedRadii
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((r) => ({
      bucket: r.bucket,
      px: r.px,
      count: r.count,
      percentage: `${Math.round((r.count / totalUsage) * 1000) / 10}%`,
    }));

  // Stats
  const reduction = ((uniqueValues.length - curatedRadii.length) / uniqueValues.length) * 100;
  const mappedUsage = curatedRadii.reduce((sum, r) => sum + r.count, 0);
  const coverage = totalUsage > 0 ? (mappedUsage / totalUsage) * 100 : 100;

  const scores = {
    before: uniqueValues.length,
    after: curatedRadii.length,
    reduction: `${Math.round(reduction * 10) / 10}%`,
    target: '60%',
    status: reduction >= 60 ? 'PASS' : reduction >= 40 ? 'CONDITIONAL' : 'FAIL',
    coverage: `${Math.round(coverage * 10) / 10}%`,
  };

  const output = {
    meta: {
      source: 'all-pages-merged.json',
      pagesIncluded: merged.meta.pagesIncluded,
      curatedAt: new Date().toISOString(),
      algorithm: 'Harmonic scale bucketing + frequency selection',
    },
    scores,
    scale: curatedRadii,
    brandSignature,
    decisions,
    distribution: RADIUS_BUCKETS.map((b) => ({
      bucket: b.name,
      range: `${b.min}-${b.max === Infinity ? '∞' : b.max}px`,
      values: (bucketedRadii.get(b.name) || []).length,
      totalUsage: (bucketedRadii.get(b.name) || []).reduce((sum, v) => sum + v.count, 0),
    })),
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log('\n--- RESULTS ---');
  console.log(`  Before: ${scores.before} values`);
  console.log(`  After:  ${scores.after} tokens`);
  console.log(`  Reduction: ${scores.reduction} (target: ${scores.target}) → ${scores.status}`);
  console.log(`  Coverage: ${scores.coverage}`);
  console.log(`  Brand signature: ${brandSignature.map((b) => `${b.bucket}=${b.px}px(${b.percentage})`).join(', ')}`);
  console.log(`  Decisions logged: ${decisions.length}`);
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log('=== DONE ===');
}

main();
