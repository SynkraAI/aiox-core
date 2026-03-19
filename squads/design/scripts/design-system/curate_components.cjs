#!/usr/bin/env node
/**
 * Frequency Filter + Atomic Classification — Component Curation Pipeline
 *
 * Algorithm (from DS-CURATION-PIPELINE-PROPOSAL.md §4.6):
 *   1. Filter by frequency of use (>= 3 instances)
 *   2. Classify by atomic level (atom/molecule/organism)
 *   3. Prioritize by impact (P0/P1/P2)
 *   4. Map tokens and variants
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTRACTION_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction');
const MERGED_PATH = path.join(EXTRACTION_DIR, 'all-pages-merged.json');
const STYLES_PATH = path.join(EXTRACTION_DIR, 'figma-styles.json');
const OUTPUT_DIR = path.join(EXTRACTION_DIR, 'curated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'curated-components.json');

// ── Classification Rules ───────────────────────────────────────────────────

const ATOM_PATTERNS = /\b(button|btn|input|label|badge|avatar|icon|tag|chip|switch|toggle|checkbox|radio|divider|spinner|loader|skeleton)\b/i;
const MOLECULE_PATTERNS = /\b(form[-_]?field|card|alert|tooltip|toast|dropdown|select|menu[-_]?item|tab|breadcrumb|pagination|search|popover|dialog|modal[-_]?header|accordion)\b/i;
const ORGANISM_PATTERNS = /\b(form|modal|sidebar|navbar|header|footer|table|data[-_]?table|calendar|carousel|wizard|stepper|layout|page|section|panel|drawer)\b/i;

function classifyAtomic(name) {
  const n = name.toLowerCase();
  if (ATOM_PATTERNS.test(n)) return 'atom';
  if (MOLECULE_PATTERNS.test(n)) return 'molecule';
  if (ORGANISM_PATTERNS.test(n)) return 'organism';
  return 'unknown';
}

// Size-based heuristic for classification when name doesn't match
function classifyBySize(sizes) {
  if (!sizes || sizes.length === 0) return 'unknown';
  const avgArea = sizes.reduce((sum, s) => {
    const [w, h] = s.split('x').map(Number);
    return sum + (w || 0) * (h || 0);
  }, 0) / sizes.length;

  if (avgArea < 2000) return 'atom';       // < ~45x45
  if (avgArea < 20000) return 'molecule';   // < ~140x140
  return 'organism';
}

// ── Priority ───────────────────────────────────────────────────────────────

const P0_PATTERNS = /\b(button|btn|input|card)\b/i;
const P1_PATTERNS = /\b(badge|avatar|form|modal|alert|select|dropdown|toast|dialog)\b/i;

function classifyPriority(name, usagePercent) {
  const n = name.toLowerCase();
  if (P0_PATTERNS.test(n) || usagePercent > 50) return 'P0';
  if (P1_PATTERNS.test(n) || usagePercent > 20) return 'P1';
  return 'P2';
}

// ── Variant Detection ──────────────────────────────────────────────────────

const VARIANT_PATTERNS = {
  state: /\b(default|hover|active|focus|disabled|pressed|loading|error|success|selected)\b/i,
  size: /\b(xs|sm|md|lg|xl|2xl|small|medium|large|mini|compact)\b/i,
  variant: /\b(primary|secondary|tertiary|ghost|outline|link|destructive|warning|info)\b/i,
};

function detectVariants(name, contexts) {
  const allText = [name, ...(contexts || [])].join(' ');
  const detected = {};

  for (const [category, pattern] of Object.entries(VARIANT_PATTERNS)) {
    const matches = new Set();
    let match;
    const regex = new RegExp(pattern.source, 'gi');
    while ((match = regex.exec(allText)) !== null) {
      matches.add(match[0].toLowerCase());
    }
    if (matches.size > 0) {
      detected[category] = [...matches];
    }
  }

  return detected;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('=== COMPONENT CURATION PIPELINE ===\n');

  const merged = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf8'));
  const rawComponents = merged.components || [];

  console.log(`Input: ${rawComponents.length} unique components from ${merged.meta.pagesIncluded} pages`);

  const totalUsage = rawComponents.reduce((sum, c) => sum + (c.count || 0), 0);

  // Filter by frequency (>= 3 instances)
  const MIN_INSTANCES = 3;
  const filtered = rawComponents.filter((c) => (c.count || 0) >= MIN_INSTANCES);
  console.log(`  After frequency filter (>= ${MIN_INSTANCES}): ${filtered.length}`);

  // Classify and enrich — now using real component names
  const curated = filtered.map((comp) => {
    const usagePercent = ((comp.count || 0) / totalUsage) * 100;
    const nameForClassification = comp.name || (comp.sizes ? comp.sizes.join(' ') : '');

    let atomicLevel = classifyAtomic(nameForClassification);
    if (atomicLevel === 'unknown') {
      // Heuristic: components with componentProperties (variant props) are likely molecules/organisms
      const propCount = comp.componentProperties ? Object.keys(comp.componentProperties).length : 0;
      if (propCount >= 3) {
        atomicLevel = 'organism';
      } else if (propCount >= 1) {
        atomicLevel = 'molecule';
      } else {
        atomicLevel = classifyBySize(comp.sizes);
      }
    }

    const variants = detectVariants(
      nameForClassification,
      comp.contexts || [],
    );

    return {
      name: comp.name || null,
      figmaName: comp.name || null,
      componentId: comp.componentId || null,
      sizes: comp.sizes || [],
      type: comp.type,
      count: comp.count || 0,
      usagePercent: Math.round(usagePercent * 100) / 100,
      atomicLevel,
      priority: classifyPriority(nameForClassification, usagePercent),
      variants,
      hasComponentProperties: comp.componentProperties ? Object.keys(comp.componentProperties).length > 0 : false,
      pages: comp.pages || [],
    };
  });

  // Sort by count descending
  curated.sort((a, b) => b.count - a.count);

  // Group by atomic level
  const atoms = curated.filter((c) => c.atomicLevel === 'atom');
  const molecules = curated.filter((c) => c.atomicLevel === 'molecule');
  const organisms = curated.filter((c) => c.atomicLevel === 'organism');
  const unknown = curated.filter((c) => c.atomicLevel === 'unknown');

  // Priority grouping
  const p0 = curated.filter((c) => c.priority === 'P0');
  const p1 = curated.filter((c) => c.priority === 'P1');
  const p2 = curated.filter((c) => c.priority === 'P2');

  // Stats
  const scores = {
    before: rawComponents.length,
    after: curated.length,
    reduction: `${Math.round(((rawComponents.length - curated.length) / rawComponents.length) * 1000) / 10}%`,
    atomic: {
      atoms: atoms.length,
      molecules: molecules.length,
      organisms: organisms.length,
      unknown: unknown.length,
    },
    priority: {
      P0: p0.length,
      P1: p1.length,
      P2: p2.length,
    },
  };

  const output = {
    meta: {
      source: 'all-pages-merged.json',
      pagesIncluded: merged.meta.pagesIncluded,
      curatedAt: new Date().toISOString(),
      algorithm: 'Frequency filter + atomic classification',
      minInstances: MIN_INSTANCES,
    },
    scores,
    components: curated,
    topP0: p0.slice(0, 10).map((c) => ({
      name: c.name,
      sizes: c.sizes,
      count: c.count,
      atomicLevel: c.atomicLevel,
    })),
    topP1: p1.slice(0, 10).map((c) => ({
      name: c.name,
      sizes: c.sizes,
      count: c.count,
      atomicLevel: c.atomicLevel,
    })),
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log('\n--- RESULTS ---');
  console.log(`  Before: ${scores.before} components`);
  console.log(`  After:  ${scores.after} components`);
  console.log(`  Reduction: ${scores.reduction}`);
  console.log(`  Atomic: ${atoms.length} atoms, ${molecules.length} molecules, ${organisms.length} organisms, ${unknown.length} unknown`);
  console.log(`  Priority: ${p0.length} P0, ${p1.length} P1, ${p2.length} P2`);
  console.log('\n  Top 5 most-used:');
  for (const c of curated.slice(0, 5)) {
    console.log(`    ${c.name || '(unnamed)'} [${(c.sizes || []).join(', ')}] — ${c.count}x (${c.atomicLevel}, ${c.priority})`);
  }
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log('=== DONE ===');
}

main();
