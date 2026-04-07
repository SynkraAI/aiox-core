#!/usr/bin/env node
/**
 * tokens-to-tailwind.mjs
 *
 * Converts extracted tokens.yaml + extracted-css.json into a tailwind.config.ts
 * that uses the exact design tokens from the original site.
 *
 * Usage:
 *   node tokens-to-tailwind.mjs --input tokens.yaml --css extracted-css.json --output tailwind.config.ts
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let inputPath = null;
let cssPath = null;
let outputPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input') inputPath = args[++i];
  else if (args[i] === '--css') cssPath = args[++i];
  else if (args[i] === '--output') outputPath = args[++i];
  else if (args[i] === '--help') {
    console.log(`
tokens-to-tailwind — Convert extracted tokens to Tailwind config

Usage:
  node tokens-to-tailwind.mjs --input tokens.yaml --css extracted-css.json --output tailwind.config.ts

Options:
  --input    Path to tokens.yaml (from dissect)
  --css      Path to extracted-css.json (from dissect)
  --output   Output tailwind.config.ts path (default: ./tailwind.config.ts)
`);
    process.exit(0);
  }
}

if (!inputPath) {
  console.error('Error: --input tokens.yaml is required');
  process.exit(1);
}

outputPath = outputPath || './tailwind.config.ts';

// ---------------------------------------------------------------------------
// Simple YAML parser (tokens.yaml is simple key-value)
// ---------------------------------------------------------------------------

function parseSimpleYaml(content) {
  const result = { colors: {}, typography: {}, spacing: {}, shadows: {}, borders: {}, gradients: [], custom_properties: {} };
  let currentSection = null;
  let currentItem = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Top-level section
    if (!line.startsWith(' ') && trimmed.endsWith(':') && !trimmed.includes('"')) {
      currentSection = trimmed.replace(':', '');
      currentItem = null;
      continue;
    }

    // Item in section
    if (currentSection && line.startsWith('  ') && !line.startsWith('    ')) {
      const match = trimmed.match(/^"?([^"]+)"?:\s*(.*)$/);
      if (match) {
        currentItem = match[1];
        const value = match[2].replace(/^"/, '').replace(/"$/, '');
        if (value && currentSection === 'gradients') {
          result.gradients.push(value);
          currentItem = null;
        } else if (value && currentSection === 'custom_properties') {
          result.custom_properties[currentItem] = value;
        } else if (!value) {
          // Object starts
          if (!result[currentSection]) result[currentSection] = {};
          result[currentSection][currentItem] = {};
        }
      }
      continue;
    }

    // Properties of item
    if (currentSection && currentItem && line.startsWith('    ')) {
      const match = trimmed.match(/^([^:]+):\s*"?([^"]*)"?$/);
      if (match) {
        const [, key, val] = match;
        if (!result[currentSection]) result[currentSection] = {};
        if (!result[currentSection][currentItem]) result[currentSection][currentItem] = {};
        result[currentSection][currentItem][key.trim()] = val.trim();
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Typography helpers
// ---------------------------------------------------------------------------

function inferLineHeight(fontSize) {
  // Headings (>= 24px) get tighter line-height, body text gets looser
  const px = parseFloat(fontSize);
  if (isNaN(px)) return '1.5';
  if (px >= 48) return '1.08';
  if (px >= 32) return '1.15';
  if (px >= 24) return '1.25';
  if (px >= 18) return '1.5';
  return '1.6'; // Body text / small text
}

// ---------------------------------------------------------------------------
// Color analysis helpers
// ---------------------------------------------------------------------------

function hexToRGB(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return { r, g, b };
}

function hexToLuminosity(hex) {
  try {
    const { r, g, b } = hexToRGB(hex);
    // Relative luminance (WCAG formula)
    const lum = (c) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  } catch { return 0.5; }
}

function hexToSaturation(hex) {
  try {
    const { r, g, b } = hexToRGB(hex);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return 0;
    const d = max - min;
    return l > 0.5 ? d / (2 - max - min) : d / (max + min);
  } catch { return 0; }
}

// ---------------------------------------------------------------------------
// Generate Tailwind config
// ---------------------------------------------------------------------------

function generateConfig(tokens, cssData) {
  const colors = {};
  const fontSize = {};
  const fontFamily = {};
  const spacing = {};
  const boxShadow = {};
  const borderRadius = {};
  const animation = {};
  const keyframes = {};

  // --- Colors (semantic mapping by luminosity + frequency) ---
  const seenColors = new Set();
  const colorEntries = [];

  for (const [key, data] of Object.entries(tokens.colors || {})) {
    const value = data.value || '';
    if (!value || seenColors.has(value)) continue;
    seenColors.add(value);

    const occurrences = parseInt(data.occurrences) || 0;
    if (occurrences < 2) continue;

    // Calculate relative luminosity from hex
    const luminosity = hexToLuminosity(value);
    const saturation = hexToSaturation(value);

    colorEntries.push({ value, occurrences, luminosity, saturation });
    if (colorEntries.length >= 20) break;
  }

  // Sort and assign semantic names based on color properties
  if (colorEntries.length > 0) {
    // Find darkest (background candidate) and lightest (foreground candidate)
    const sorted = [...colorEntries].sort((a, b) => a.luminosity - b.luminosity);
    const darkest = sorted[0];
    const lightest = sorted[sorted.length - 1];

    // Most saturated = primary; second most = accent
    const bySaturation = [...colorEntries].sort((a, b) => b.saturation - a.saturation);
    const primary = bySaturation[0];
    const accent = bySaturation.length > 1 ? bySaturation[1] : null;

    // Assign semantic names
    colors['background'] = darkest.value;
    colors['foreground'] = lightest.value;
    if (primary) colors['primary'] = primary.value;
    if (accent && accent.value !== primary?.value) colors['accent'] = accent.value;

    // Mid-luminosity colors as secondary/muted/surface/border
    const midColors = colorEntries.filter(c =>
      c.value !== darkest.value &&
      c.value !== lightest.value &&
      c.value !== primary?.value &&
      c.value !== accent?.value
    ).sort((a, b) => a.luminosity - b.luminosity);

    const midNames = ['border', 'muted', 'secondary', 'surface'];
    midColors.forEach((c, i) => {
      if (i < midNames.length) colors[midNames[i]] = c.value;
      else colors[`color-${i}`] = c.value;
    });
  }

  // --- Typography ---
  const seenFonts = new Set();
  for (const [key, data] of Object.entries(tokens.typography || {})) {
    const size = data['font-size'] || '';
    const weight = data['font-weight'] || '';
    const family = data['font-family'] || '';

    if (size && !fontSize[size]) {
      const name = size.replace(/[^a-zA-Z0-9]/g, '');
      const lh = data['line-height'] || inferLineHeight(size);
      fontSize[name] = [size, { lineHeight: lh, fontWeight: weight || '400' }];
    }

    if (family && !seenFonts.has(family)) {
      seenFonts.add(family);
      const familyName = family.split(',')[0].trim().replace(/['"]/g, '').toLowerCase().replace(/\s+/g, '-');
      fontFamily[familyName] = [family];
    }
  }

  // --- Spacing ---
  for (const [key, data] of Object.entries(tokens.spacing || {})) {
    const value = data.value || '';
    if (!value) continue;
    const name = value.replace(/[^a-zA-Z0-9]/g, '');
    spacing[name] = value;
  }

  // --- Shadows ---
  let shadowIndex = 0;
  for (const [key, data] of Object.entries(tokens.shadows || {})) {
    const value = data.value || '';
    if (!value) continue;
    const name = shadowIndex === 0 ? 'DEFAULT' : `shadow-${shadowIndex}`;
    boxShadow[name] = value;
    shadowIndex++;
  }

  // --- Animations from extracted CSS (preserve original timing) ---
  if (cssData) {
    for (const anim of (cssData.animations || [])) {
      if (!anim.name || !anim.cssText) continue;

      // Extract real duration, timing-function and iteration-count from CSS
      const duration = anim.duration || '1s';
      const timing = anim.timingFunction || anim.easing || 'ease-in-out';
      const iteration = anim.iterationCount || 'infinite';
      animation[anim.name] = `${anim.name} ${duration} ${timing} ${iteration}`;

      // Parse keyframes from cssText
      const kfMatch = anim.cssText.match(/@keyframes\s+\S+\s*\{([\s\S]*)\}$/);
      if (kfMatch) {
        const kfBody = kfMatch[1].trim();
        const steps = {};
        const stepRegex = /(\d+%|from|to)\s*\{([^}]+)\}/g;
        let match;
        while ((match = stepRegex.exec(kfBody)) !== null) {
          const step = match[1] === 'from' ? '0%' : match[1] === 'to' ? '100%' : match[1];
          const props = {};
          for (const prop of match[2].split(';')) {
            const [k, v] = prop.split(':').map(s => s.trim());
            if (k && v) {
              // Convert CSS prop to camelCase
              const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
              props[camel] = v;
            }
          }
          steps[step] = props;
        }
        if (Object.keys(steps).length > 0) {
          keyframes[anim.name] = steps;
        }
      }
    }
  }

  // --- Build config string ---
  const configStr = `import type { Config } from 'tailwindcss';

/**
 * Tailwind config generated from extracted design tokens
 * Source: tokens.yaml + extracted-css.json
 * Generated by: design-system-scaffold/lib/tokens-to-tailwind.mjs
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,mdx}',
    './stories/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6).replace(/^/gm, '      ').trim()},
      fontSize: ${JSON.stringify(fontSize, null, 6).replace(/^/gm, '      ').trim()},
      fontFamily: ${JSON.stringify(fontFamily, null, 6).replace(/^/gm, '      ').trim()},
      spacing: ${JSON.stringify(spacing, null, 6).replace(/^/gm, '      ').trim()},
      boxShadow: ${JSON.stringify(boxShadow, null, 6).replace(/^/gm, '      ').trim()},
      animation: ${JSON.stringify(animation, null, 6).replace(/^/gm, '      ').trim()},
      keyframes: ${JSON.stringify(keyframes, null, 6).replace(/^/gm, '      ').trim()},
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
`;

  return configStr;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const tokensContent = fs.readFileSync(inputPath, 'utf-8');
const tokens = parseSimpleYaml(tokensContent);

let cssData = null;
if (cssPath && fs.existsSync(cssPath)) {
  cssData = JSON.parse(fs.readFileSync(cssPath, 'utf-8'));
}

const config = generateConfig(tokens, cssData);
fs.writeFileSync(outputPath, config);

console.log(`✅ Generated: ${outputPath}`);
console.log(`   Colors:     ${Object.keys(tokens.colors || {}).length} extracted`);
console.log(`   Typography: ${Object.keys(tokens.typography || {}).length} variants`);
console.log(`   Spacing:    ${Object.keys(tokens.spacing || {}).length} values`);
console.log(`   Animations: ${cssData ? (cssData.animations || []).length : 0} keyframes`);
