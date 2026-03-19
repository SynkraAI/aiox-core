#!/usr/bin/env node
/**
 * OKLCH Perceptual Clustering — Color Curation Pipeline
 *
 * Reads all-pages-merged.json, clusters colors by OKLCH deltaE,
 * generates tonal scales, validates WCAG AA contrast, outputs curated-colors.json
 *
 * Algorithm (from DS-CURATION-PIPELINE-PROPOSAL.md §4.1):
 *   1. Convert hex → OKLCH
 *   2. Cluster by deltaE threshold = 0.10
 *   3. Pick most-used color per cluster
 *   4. Generate 50-950 tonal scale for accent colors
 *   5. Validate WCAG AA contrast
 */

const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────────────────
const ROOT = process.cwd();
const EXTRACTION_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction');
const MERGED_PATH = path.join(EXTRACTION_DIR, 'all-pages-merged.json');
const STYLES_PATH = path.join(EXTRACTION_DIR, 'figma-styles.json');
const VARIABLES_PATH = path.join(EXTRACTION_DIR, 'figma-variables.json');
const OUTPUT_DIR = path.join(EXTRACTION_DIR, 'curated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'curated-colors.json');

// ── Color Math ─────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function rgbToHex(r, g, b) {
  const toHex = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

// sRGB → Linear RGB
function linearize(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Linear RGB → sRGB
function delinearize(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// sRGB → OKLCH via OKLab
function hexToOklch(hex) {
  const [sr, sg, sb] = hexToRgb(hex);
  const r = linearize(sr);
  const g = linearize(sg);
  const b = linearize(sb);

  // Linear RGB → LMS (using OKLab matrix)
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2024326513 * g + 0.6892648869 * b;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  // LMS → OKLab
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bLab = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

  // OKLab → OKLCH
  const C = Math.sqrt(a * a + bLab * bLab);
  let H = Math.atan2(bLab, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return { L, C, H };
}

// OKLCH → hex (for tonal scale generation)
function oklchToHex(L, C, H) {
  const hRad = H * (Math.PI / 180);
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab → LMS
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;

  // LMS → Linear RGB
  const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  return rgbToHex(delinearize(rLin), delinearize(gLin), delinearize(bLin));
}

// DeltaE in OKLCH space (simplified Euclidean)
function deltaE(c1, c2) {
  const dL = c1.L - c2.L;
  const dC = c1.C - c2.C;
  const dH = c1.H - c2.H;
  return Math.sqrt(dL * dL + dC * dC + (dH / 360) * (dH / 360));
}

// WCAG 2.1 relative luminance
function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

// WCAG contrast ratio
function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Clustering ─────────────────────────────────────────────────────────────

const DELTA_E_THRESHOLD = 0.10;

function clusterColors(colorEntries) {
  // Convert all colors to OKLCH
  const items = colorEntries
    .filter((c) => c.hex && c.hex.match(/^#[0-9a-fA-F]{6}$/))
    .map((c) => ({
      hex: c.hex.toLowerCase(),
      oklch: hexToOklch(c.hex),
      count: c.count || 0,
      opacity: c.opacity ?? 1,
      contexts: c.contexts || [],
    }));

  // Sort by count descending
  items.sort((a, b) => b.count - a.count);

  const clusters = [];
  const assigned = new Set();

  for (const item of items) {
    if (assigned.has(item.hex)) continue;

    const cluster = {
      primary: item,
      members: [item],
    };

    // Find all similar colors
    for (const other of items) {
      if (assigned.has(other.hex) || other.hex === item.hex) continue;
      if (other.opacity < 1) continue; // Skip semi-transparent variants for clustering

      const dE = deltaE(item.oklch, other.oklch);
      if (dE < DELTA_E_THRESHOLD) {
        cluster.members.push(other);
        assigned.add(other.hex);
      }
    }

    assigned.add(item.hex);
    clusters.push(cluster);
  }

  return clusters;
}

// ── Semantic Classification ────────────────────────────────────────────────

function classifyColor(oklch, hex) {
  const { L, C, H } = oklch;

  // Achromatic (grays/blacks/whites)
  if (C < 0.02) {
    if (L > 0.95) return 'white';
    if (L > 0.85) return 'gray-100';
    if (L > 0.70) return 'gray-200';
    if (L > 0.55) return 'gray-300';
    if (L > 0.40) return 'gray-400';
    if (L > 0.25) return 'gray-500';
    if (L > 0.15) return 'gray-600';
    if (L > 0.05) return 'gray-700';
    return 'black';
  }

  // Chromatic classification by hue
  if (H >= 0 && H < 30) return 'red';
  if (H >= 30 && H < 60) return 'orange';
  if (H >= 60 && H < 90) return 'yellow';
  if (H >= 90 && H < 140) return 'lime';
  if (H >= 140 && H < 170) return 'green';
  if (H >= 170 && H < 200) return 'teal';
  if (H >= 200 && H < 240) return 'blue';
  if (H >= 240 && H < 280) return 'indigo';
  if (H >= 280 && H < 320) return 'purple';
  if (H >= 320 && H < 360) return 'pink';

  return 'unknown';
}

// ── Tonal Scale Generation ─────────────────────────────────────────────────

function generateTonalScale(oklch) {
  const { C, H } = oklch;
  // L varies from 0.97 (step 50) to 0.15 (step 950)
  const steps = [
    { step: 50, L: 0.97 },
    { step: 100, L: 0.93 },
    { step: 200, L: 0.85 },
    { step: 300, L: 0.75 },
    { step: 400, L: 0.65 },
    { step: 500, L: 0.55 },
    { step: 600, L: 0.45 },
    { step: 700, L: 0.35 },
    { step: 800, L: 0.25 },
    { step: 900, L: 0.18 },
    { step: 950, L: 0.15 },
  ];

  return steps.map(({ step, L }) => {
    // Scale C down for very light/dark steps to stay in gamut
    const scaledC = C * Math.min(1, (1 - Math.abs(L - 0.55) / 0.55) * 1.5 + 0.3);
    return {
      step,
      L: Math.round(L * 1000) / 1000,
      C: Math.round(scaledC * 10000) / 10000,
      H: Math.round(H * 10) / 10,
      hex: oklchToHex(L, scaledC, H),
    };
  });
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('=== COLOR CURATION PIPELINE ===\n');

  // Read merged data
  const merged = JSON.parse(fs.readFileSync(MERGED_PATH, 'utf8'));
  const rawColors = merged.colors || [];

  // Load Figma styles and variables for enrichment
  let figmaStyles = [];
  let figmaVariables = { variables: {}, variableCollections: {} };
  try { figmaStyles = JSON.parse(fs.readFileSync(STYLES_PATH, 'utf8')); } catch (_) { /* optional */ }
  try { figmaVariables = JSON.parse(fs.readFileSync(VARIABLES_PATH, 'utf8')); } catch (_) { /* optional */ }

  // Build lookup maps for enrichment
  const colorStyles = figmaStyles.filter((s) => s.style_type === 'FILL');
  const colorVariables = Object.values(figmaVariables.variables || {}).filter(
    (v) => v.resolvedType === 'COLOR',
  );
  console.log(`  Figma color styles: ${colorStyles.length}, Figma color variables: ${colorVariables.length}`);

  console.log(`Input: ${rawColors.length} unique colors from ${merged.meta.pagesIncluded} pages`);

  // Filter out semi-transparent variants for primary clustering
  const solidColors = rawColors.filter((c) => (c.opacity ?? 1) >= 1);
  const semiTransparent = rawColors.filter((c) => (c.opacity ?? 1) < 1);

  console.log(`  Solid: ${solidColors.length}`);
  console.log(`  Semi-transparent: ${semiTransparent.length}`);

  // Cluster colors
  const clusters = clusterColors(solidColors);
  console.log(`  Clusters formed: ${clusters.length}`);

  // Select representative from each cluster
  const bgDefault = '#ffffff';
  const bgDark = '#0a0a0a';
  const decisions = [];

  const curatedPalette = clusters
    .filter((cluster) => cluster.primary.count >= 3) // Min 3 usages
    .map((cluster) => {
      const { primary, members } = cluster;
      const oklch = primary.oklch;
      const classification = classifyColor(oklch, primary.hex);

      // Pick best representative: highest count, or best contrast against bg
      let representative = primary;
      if (members.length > 1) {
        // Prefer the one with highest usage count
        representative = members.reduce((best, m) => (m.count > best.count ? m : best), members[0]);
      }

      const contrastLight = contrastRatio(representative.hex, bgDefault);
      const contrastDark = contrastRatio(representative.hex, bgDark);

      // Record decision
      if (members.length > 1) {
        decisions.push({
          category: 'color',
          action: 'MERGE',
          items: members.map((m) => m.hex),
          result: representative.hex,
          reason: `deltaE < ${DELTA_E_THRESHOLD}, kept most-used (${representative.count} instances)`,
          authority: 'Brad Frost consolidation-algorithms + OKLCH clustering',
        });
      }

      // Try to match Figma style name
      const matchedStyle = colorStyles.find((s) =>
        s.name && representative.contexts.some((ctx) => ctx && s.name.toLowerCase().includes(ctx.toLowerCase().split(':')[0])),
      );

      // Try to match Figma variable name (by resolvedType COLOR)
      const matchedVariable = colorVariables.find((v) => {
        if (!v.valuesByMode) return false;
        for (const modeValues of Object.values(v.valuesByMode)) {
          if (modeValues && modeValues.r !== undefined) {
            const vHex = '#' + [modeValues.r, modeValues.g, modeValues.b]
              .map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
            if (vHex.toLowerCase() === representative.hex.toLowerCase()) return true;
          }
        }
        return false;
      });

      return {
        hex: representative.hex,
        oklch: {
          L: Math.round(oklch.L * 1000) / 1000,
          C: Math.round(oklch.C * 10000) / 10000,
          H: Math.round(oklch.H * 10) / 10,
        },
        classification,
        count: members.reduce((sum, m) => sum + m.count, 0),
        memberCount: members.length,
        mergedFrom: members.length > 1 ? members.map((m) => m.hex) : undefined,
        figmaStyleName: matchedStyle ? matchedStyle.name : null,
        figmaVariableName: matchedVariable ? matchedVariable.name : null,
        contrast: {
          vsWhite: Math.round(contrastLight * 100) / 100,
          vsDark: Math.round(contrastDark * 100) / 100,
          wcagAA_normal: contrastLight >= 4.5 || contrastDark >= 4.5,
          wcagAA_large: contrastLight >= 3.0 || contrastDark >= 3.0,
        },
        contexts: representative.contexts.slice(0, 5),
      };
    })
    .sort((a, b) => b.count - a.count);

  console.log(`  Curated palette: ${curatedPalette.length} colors`);

  // Separate into semantic groups
  const achromaticGroup = curatedPalette.filter((c) =>
    ['white', 'black', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700'].includes(c.classification),
  );
  const chromaticGroup = curatedPalette.filter((c) => !achromaticGroup.includes(c));

  // Generate tonal scales for top chromatic colors (top 8 by usage)
  const topChromatic = chromaticGroup.slice(0, 8);
  const tonalScales = {};
  for (const color of topChromatic) {
    const scale = generateTonalScale(color.oklch);
    tonalScales[color.classification] = {
      base: color.hex,
      oklch: color.oklch,
      count: color.count,
      scale,
    };
  }

  // WCAG validation
  const wcagResults = {
    totalTested: curatedPalette.length,
    passNormal: curatedPalette.filter((c) => c.contrast.wcagAA_normal).length,
    passLarge: curatedPalette.filter((c) => c.contrast.wcagAA_large).length,
    failures: curatedPalette
      .filter((c) => !c.contrast.wcagAA_large)
      .map((c) => ({
        hex: c.hex,
        classification: c.classification,
        contrastWhite: c.contrast.vsWhite,
        contrastDark: c.contrast.vsDark,
      })),
  };

  // Calculate reduction stats
  const reduction = ((rawColors.length - curatedPalette.length) / rawColors.length) * 100;
  const coverageUsage = curatedPalette.reduce((sum, c) => sum + c.count, 0);
  const totalUsage = rawColors.reduce((sum, c) => sum + c.count, 0);
  const coverage = (coverageUsage / totalUsage) * 100;

  const scores = {
    before: rawColors.length,
    after: curatedPalette.length,
    reduction: `${Math.round(reduction * 10) / 10}%`,
    target: '85%',
    status: reduction >= 85 ? 'PASS' : reduction >= 70 ? 'CONDITIONAL' : 'FAIL',
    wcag_aa_pass: `${Math.round((wcagResults.passLarge / wcagResults.totalTested) * 100)}%`,
    coverage: `${Math.round(coverage * 10) / 10}%`,
    coverage_status: coverage >= 95 ? 'PASS' : coverage >= 85 ? 'CONDITIONAL' : 'FAIL',
  };

  // Output
  const output = {
    meta: {
      source: 'all-pages-merged.json',
      pagesIncluded: merged.meta.pagesIncluded,
      curatedAt: new Date().toISOString(),
      algorithm: 'OKLCH deltaE clustering',
      deltaEThreshold: DELTA_E_THRESHOLD,
    },
    scores,
    palette: curatedPalette,
    groups: {
      achromatic: achromaticGroup.length,
      chromatic: chromaticGroup.length,
    },
    tonalScales,
    wcag: wcagResults,
    semiTransparent: semiTransparent.slice(0, 20).map((c) => ({
      hex: c.hex,
      opacity: c.opacity,
      count: c.count,
    })),
    decisions,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log('\n--- RESULTS ---');
  console.log(`  Before: ${scores.before} colors`);
  console.log(`  After:  ${scores.after} colors`);
  console.log(`  Reduction: ${scores.reduction} (target: ${scores.target}) → ${scores.status}`);
  console.log(`  Coverage: ${scores.coverage} → ${scores.coverage_status}`);
  console.log(`  WCAG AA pass (large): ${scores.wcag_aa_pass}`);
  console.log(`  Tonal scales generated: ${Object.keys(tonalScales).length}`);
  console.log(`  Decisions logged: ${decisions.length}`);
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log('=== DONE ===');
}

main();
