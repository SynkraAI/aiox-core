#!/usr/bin/env node
/**
 * Design System Forge — Token Consolidator
 *
 * Merges token outputs from multiple sources:
 *   - Dembrandt (DTCG JSON)
 *   - dissect-artifact (tokens.yaml)
 *   - dark mode extractor (dark-tokens.yaml)
 *
 * Deduplicates colors by proximity (delta-E < 3) and produces
 * a unified consolidated.yaml with light/dark separation.
 *
 * Usage:
 *   node consolidate-tokens.mjs --dembrandt ./dembrandt.json --dissect ./tokens.yaml [--dark ./dark-tokens.yaml]
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let dembrandtPath = null;
let dissectPath = null;
let darkPath = null;
let outputDir = null;
let threshold = 3; // delta-E threshold for color dedup

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--dembrandt') {
    dembrandtPath = args[++i];
  } else if (arg === '--dissect') {
    dissectPath = args[++i];
  } else if (arg === '--dark') {
    darkPath = args[++i];
  } else if (arg === '--output' || arg === '-o') {
    outputDir = args[++i];
  } else if (arg === '--threshold') {
    threshold = parseFloat(args[++i]) || 3;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Design System Forge — Token Consolidator

Usage:
  node consolidate-tokens.mjs --dembrandt ./dembrandt.json --dissect ./tokens.yaml [--dark ./dark-tokens.yaml]

Options:
  --dembrandt      Path to dembrandt DTCG JSON output
  --dissect        Path to dissect-artifact tokens.yaml
  --dark           Path to dark mode tokens (optional)
  --output, -o     Output directory (default: design-system/tokens/)
  --threshold      Delta-E threshold for color dedup (default: 3)
  --help, -h       Show this help

At least one of --dembrandt or --dissect is required.
`);
    process.exit(0);
  }
}

if (!dembrandtPath && !dissectPath) {
  console.error('Error: At least one of --dembrandt or --dissect is required.');
  process.exit(1);
}

outputDir = outputDir || path.join(process.cwd(), 'design-system', 'tokens');
fs.mkdirSync(outputDir, { recursive: true });

// ---------------------------------------------------------------------------
// Color utilities (simplified sRGB delta-E)
// ---------------------------------------------------------------------------

function parseColor(str) {
  if (!str || typeof str !== 'string') return null;

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
  }

  // #hex
  const hexMatch = str.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

function deltaE(c1, c2) {
  if (!c1 || !c2) return Infinity;
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  // Simplified Euclidean distance in sRGB (not true CIE delta-E, but good enough)
  return Math.sqrt(dr * dr + dg * dg + db * db) / 2.55; // Normalize to ~0-100
}

function deduplicateColors(colors, thresh) {
  const unique = [];
  for (const color of colors) {
    const parsed = parseColor(color.value || color);
    const isDuplicate = unique.some(u => {
      const uParsed = parseColor(u.value || u);
      return deltaE(parsed, uParsed) < thresh;
    });
    if (!isDuplicate) {
      unique.push(color);
    }
  }
  return unique;
}

// ---------------------------------------------------------------------------
// Parse YAML (simple parser — handles basic key: value and arrays)
// ---------------------------------------------------------------------------

function parseSimpleYaml(content) {
  const result = {};
  let section = null;       // top-level key (colors, typography, etc.)
  let subKey = null;        // nested key within section
  let currentItem = null;   // current item being built

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.search(/\S/);

    // Top-level section (indent 0): "colors:", "typography:", etc.
    if (indent === 0 && trimmed.endsWith(':') && !trimmed.includes(' ')) {
      section = trimmed.slice(0, -1);
      result[section] = [];
      subKey = null;
      currentItem = null;
      continue;
    }

    // Sub-key within section (indent 2): "rgb_0_0_0_:", named entries
    if (indent === 2 && trimmed.endsWith(':') && !trimmed.includes(' ') && section) {
      subKey = trimmed.slice(0, -1).replace(/^["']|["']$/g, '');
      currentItem = { name: subKey };
      result[section].push(currentItem);
      continue;
    }

    // Property within sub-key (indent 4+): "value: ...", "occurrences: ..."
    if (indent >= 4 && currentItem && section) {
      const kvMatch = trimmed.match(/^(\w[\w_]*):\s*["']?(.+?)["']?$/);
      if (kvMatch) {
        const key = kvMatch[1];
        const val = kvMatch[2];
        if (key === 'value') currentItem.value = val;
        if (key === 'occurrences' || key === 'count') currentItem.count = parseInt(val);
        if (key === 'font_family' || key === 'fontFamily') currentItem.fontFamily = val;
        if (key === 'font_size' || key === 'fontSize') currentItem.fontSize = val;
        if (key === 'font_weight' || key === 'fontWeight') currentItem.fontWeight = val;
        continue;
      }
    }

    // Array item: "- value: ..." (indent 2-4)
    if (trimmed.startsWith('- value:') && section) {
      const value = trimmed.replace(/^- value:\s*["']?/, '').replace(/["']$/, '');
      currentItem = { value };
      result[section].push(currentItem);
      continue;
    }

    // Array item: "- name: ..."
    if (trimmed.startsWith('- name:') && section) {
      const name = trimmed.replace(/^- name:\s*["']?/, '').replace(/["']$/, '');
      currentItem = { name };
      result[section].push(currentItem);
      continue;
    }

    // Simple array item: "- "value""
    if (trimmed.startsWith('- "') && section) {
      const value = trimmed.replace(/^- ["']/, '').replace(/["']$/, '');
      result[section].push(value);
      currentItem = null;
      continue;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('\n> Consolidating tokens...');

  const consolidated = {
    light: { colors: [], backgroundColors: [], typography: [], spacing: [], shadows: [], gradients: [] },
    dark: { colors: [], backgroundColors: [], gradients: [] },
    customProperties: { light: {}, dark: {} },
    animations: [],
    transitions: [],
  };

  // Load dembrandt output
  if (dembrandtPath && fs.existsSync(dembrandtPath)) {
    console.log(`  Loading dembrandt: ${dembrandtPath}`);
    try {
      const data = JSON.parse(fs.readFileSync(dembrandtPath, 'utf-8'));
      // DTCG format has nested $value fields
      if (data.color) {
        for (const [name, token] of Object.entries(data.color)) {
          if (token.$value) {
            consolidated.light.colors.push({ value: token.$value, source: 'dembrandt', name });
          }
        }
      }
      if (data.typography) {
        for (const [name, token] of Object.entries(data.typography)) {
          consolidated.light.typography.push({ ...token, source: 'dembrandt', name });
        }
      }
      if (data.spacing) {
        for (const [name, token] of Object.entries(data.spacing)) {
          if (token.$value) {
            consolidated.light.spacing.push({ value: token.$value, source: 'dembrandt', name });
          }
        }
      }
    } catch (err) {
      console.error(`  Warning: Could not parse dembrandt output: ${err.message}`);
    }
  }

  // Load dissect output
  if (dissectPath && fs.existsSync(dissectPath)) {
    console.log(`  Loading dissect: ${dissectPath}`);
    try {
      const content = fs.readFileSync(dissectPath, 'utf-8');
      const data = parseSimpleYaml(content);

      if (data.colors) {
        for (const item of data.colors) {
          consolidated.light.colors.push({
            value: item.value || item,
            count: item.count || 1,
            source: 'dissect',
          });
        }
      }
      if (data.background_colors) {
        for (const item of data.background_colors) {
          consolidated.light.backgroundColors.push({
            value: item.value || item,
            count: item.count || 1,
            source: 'dissect',
          });
        }
      }
      if (data.typography) {
        for (const item of data.typography) {
          consolidated.light.typography.push({ ...item, source: 'dissect' });
        }
      }
      if (data.spacing) {
        for (const item of data.spacing) {
          consolidated.light.spacing.push({ value: item.value || item, source: 'dissect' });
        }
      }
      if (data.shadows) {
        for (const item of data.shadows) {
          consolidated.light.shadows.push(item.value || item);
        }
      }
      if (data.gradients) {
        consolidated.light.gradients = data.gradients;
      }
    } catch (err) {
      console.error(`  Warning: Could not parse dissect output: ${err.message}`);
    }
  }

  // Load dark mode tokens
  if (darkPath && fs.existsSync(darkPath)) {
    console.log(`  Loading dark mode: ${darkPath}`);
    try {
      const content = fs.readFileSync(darkPath, 'utf-8');
      const data = parseSimpleYaml(content);

      if (data.custom_properties) {
        consolidated.customProperties.dark = data.custom_properties;
      }
      if (data.colors) {
        for (const item of data.colors) {
          consolidated.dark.colors.push({ value: item.value || item, count: item.count || 1 });
        }
      }
      if (data.background_colors) {
        for (const item of data.background_colors) {
          consolidated.dark.backgroundColors.push({ value: item.value || item, count: item.count || 1 });
        }
      }
      if (data.gradients) {
        consolidated.dark.gradients = data.gradients;
      }
    } catch (err) {
      console.error(`  Warning: Could not parse dark mode output: ${err.message}`);
    }
  }

  // Deduplicate colors
  console.log('  Deduplicating colors...');
  const beforeLight = consolidated.light.colors.length;
  consolidated.light.colors = deduplicateColors(consolidated.light.colors, threshold);
  console.log(`    Light colors: ${beforeLight} → ${consolidated.light.colors.length}`);

  consolidated.light.backgroundColors = deduplicateColors(consolidated.light.backgroundColors, threshold);

  if (consolidated.dark.colors.length > 0) {
    const beforeDark = consolidated.dark.colors.length;
    consolidated.dark.colors = deduplicateColors(consolidated.dark.colors, threshold);
    console.log(`    Dark colors: ${beforeDark} → ${consolidated.dark.colors.length}`);
  }

  // Generate YAML output
  const yamlLines = [
    '# Consolidated Design Tokens',
    `# Generated: ${new Date().toISOString()}`,
    `# Sources: ${[dembrandtPath && 'dembrandt', dissectPath && 'dissect', darkPath && 'dark-mode'].filter(Boolean).join(', ')}`,
    `# Delta-E threshold: ${threshold}`,
    '',
    '# ═══════════════════════════════════════',
    '# LIGHT MODE',
    '# ═══════════════════════════════════════',
    '',
    'light:',
    '  colors:',
  ];

  for (const c of consolidated.light.colors) {
    yamlLines.push(`    - value: "${c.value}"`);
    if (c.name) yamlLines.push(`      name: "${c.name}"`);
    if (c.count) yamlLines.push(`      count: ${c.count}`);
    if (c.source) yamlLines.push(`      source: ${c.source}`);
  }

  yamlLines.push('', '  background_colors:');
  for (const c of consolidated.light.backgroundColors) {
    yamlLines.push(`    - value: "${c.value}"`);
    if (c.count) yamlLines.push(`      count: ${c.count}`);
  }

  yamlLines.push('', '  typography:');
  for (const t of consolidated.light.typography) {
    yamlLines.push(`    - name: "${t.name || 'unnamed'}"`);
    if (t.fontFamily || t.$value) yamlLines.push(`      font_family: "${t.fontFamily || t.$value || ''}"`);
    if (t.fontSize) yamlLines.push(`      font_size: "${t.fontSize}"`);
    if (t.fontWeight) yamlLines.push(`      font_weight: "${t.fontWeight}"`);
  }

  yamlLines.push('', '  spacing:');
  for (const s of consolidated.light.spacing) {
    yamlLines.push(`    - value: "${s.value}"`);
    if (s.name) yamlLines.push(`      name: "${s.name}"`);
  }

  yamlLines.push('', '  shadows:');
  for (const s of consolidated.light.shadows) {
    yamlLines.push(`    - "${s}"`);
  }

  if (consolidated.light.gradients.length > 0) {
    yamlLines.push('', '  gradients:');
    for (const g of consolidated.light.gradients) {
      yamlLines.push(`    - "${g}"`);
    }
  }

  if (consolidated.dark.colors.length > 0) {
    yamlLines.push('', '# ═══════════════════════════════════════', '# DARK MODE', '# ═══════════════════════════════════════', '', 'dark:');

    yamlLines.push('  colors:');
    for (const c of consolidated.dark.colors) {
      yamlLines.push(`    - value: "${c.value}"`);
      if (c.count) yamlLines.push(`      count: ${c.count}`);
    }

    yamlLines.push('', '  background_colors:');
    for (const c of consolidated.dark.backgroundColors) {
      yamlLines.push(`    - value: "${c.value}"`);
      if (c.count) yamlLines.push(`      count: ${c.count}`);
    }

    if (consolidated.dark.gradients.length > 0) {
      yamlLines.push('', '  gradients:');
      for (const g of consolidated.dark.gradients) {
        yamlLines.push(`    - "${g}"`);
      }
    }
  }

  if (Object.keys(consolidated.customProperties.dark).length > 0) {
    yamlLines.push('', '# ═══════════════════════════════════════', '# CSS CUSTOM PROPERTIES (DARK)', '# ═══════════════════════════════════════', '', 'custom_properties_dark:');
    for (const [prop, value] of Object.entries(consolidated.customProperties.dark)) {
      yamlLines.push(`  "${prop}": "${value}"`);
    }
  }

  const outputPath = path.join(outputDir, 'consolidated.yaml');
  fs.writeFileSync(outputPath, yamlLines.join('\n'));

  // Summary
  console.log('\n> Consolidation complete!');
  console.log(`  Light colors: ${consolidated.light.colors.length}`);
  console.log(`  Light bg colors: ${consolidated.light.backgroundColors.length}`);
  console.log(`  Typography: ${consolidated.light.typography.length}`);
  console.log(`  Spacing: ${consolidated.light.spacing.length}`);
  console.log(`  Shadows: ${consolidated.light.shadows.length}`);
  if (consolidated.dark.colors.length > 0) {
    console.log(`  Dark colors: ${consolidated.dark.colors.length}`);
  }
  console.log(`  Output: ${outputPath}`);
}

main();
