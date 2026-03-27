#!/usr/bin/env node
/**
 * Design System Forge — Dark Mode Extractor
 *
 * Toggles prefers-color-scheme: dark via Playwright emulation
 * and re-extracts colors + CSS custom properties.
 *
 * Usage:
 *   node extract-dark-mode.mjs <url> --name <name>
 *
 * Output:
 *   design-system/tokens/dark-tokens.yaml
 *   design-system/screenshots/screenshot-dark-desktop.png
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let target = null;
let name = 'dark-mode';
let timeout = 30;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--name' || arg === '-n') {
    name = args[++i];
  } else if (arg === '--timeout' || arg === '-t') {
    timeout = parseInt(args[++i]) || 30;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Design System Forge — Dark Mode Extractor

Usage:
  node extract-dark-mode.mjs <url> --name <name>

Options:
  --name, -n       Artifact name (default: "dark-mode")
  --timeout, -t    Navigation timeout in seconds (default: 30)
  --help, -h       Show this help
`);
    process.exit(0);
  } else if (!arg.startsWith('-') && !target) {
    target = arg;
  }
}

if (!target) {
  console.error('Error: URL is required.');
  console.error('Usage: node extract-dark-mode.mjs <url> --name <name>');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Color properties to extract
// ---------------------------------------------------------------------------

const COLOR_PROPS = [
  'color', 'backgroundColor', 'backgroundImage',
  'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'outlineColor', 'textDecorationColor',
  'boxShadow', 'textShadow',
  'caretColor', 'accentColor',
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const tokensDir = path.join(process.cwd(), 'design-system', 'tokens');
  const screenshotsDir = path.join(process.cwd(), 'design-system', 'screenshots');
  fs.mkdirSync(tokensDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log(`\n> Extracting dark mode tokens from ${target}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    await page.goto(target, {
      waitUntil: 'domcontentloaded',
      timeout: timeout * 1000,
    });

    // Wait for JS to render dark mode (SPAs)
    await page.waitForTimeout(5000);

    // Screenshot in dark mode
    const screenshotPath = path.join(screenshotsDir, 'screenshot-dark-desktop.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  Screenshot: ${screenshotPath}`);

    // Extract colors and custom properties
    const extraction = await page.evaluate((colorProps) => {
      const result = {
        customProperties: {},
        colors: {},
        backgroundColors: {},
        gradients: [],
      };

      // Extract CSS custom properties from :root
      const rootStyles = window.getComputedStyle(document.documentElement);
      const allProps = [];
      for (let i = 0; i < rootStyles.length; i++) {
        allProps.push(rootStyles[i]);
      }

      for (const prop of allProps) {
        if (prop.startsWith('--')) {
          const value = rootStyles.getPropertyValue(prop).trim();
          if (value) {
            result.customProperties[prop] = value;
          }
        }
      }

      // Extract colors from visible elements
      const elements = document.querySelectorAll('*');
      const colorCounts = {};
      const bgColorCounts = {};

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const computed = window.getComputedStyle(el);

        // Text color
        const color = computed.color;
        if (color && color !== 'rgba(0, 0, 0, 0)') {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        }

        // Background color
        const bgColor = computed.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          bgColorCounts[bgColor] = (bgColorCounts[bgColor] || 0) + 1;
        }

        // Gradients
        const bgImage = computed.backgroundImage;
        if (bgImage && bgImage !== 'none' && bgImage.includes('gradient')) {
          result.gradients.push(bgImage);
        }
      }

      // Sort by frequency
      result.colors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});

      result.backgroundColors = Object.entries(bgColorCounts)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});

      // Deduplicate gradients
      result.gradients = [...new Set(result.gradients)];

      return result;
    }, COLOR_PROPS);

    // Generate YAML output
    const yamlLines = [
      '# Dark Mode Tokens',
      `# Extracted from: ${target}`,
      `# Date: ${new Date().toISOString()}`,
      '',
      'custom_properties:',
    ];

    for (const [prop, value] of Object.entries(extraction.customProperties)) {
      yamlLines.push(`  "${prop}": "${value}"`);
    }

    yamlLines.push('', 'colors:');
    for (const [color, count] of Object.entries(extraction.colors).slice(0, 30)) {
      yamlLines.push(`  - value: "${color}"`);
      yamlLines.push(`    count: ${count}`);
    }

    yamlLines.push('', 'background_colors:');
    for (const [color, count] of Object.entries(extraction.backgroundColors).slice(0, 30)) {
      yamlLines.push(`  - value: "${color}"`);
      yamlLines.push(`    count: ${count}`);
    }

    if (extraction.gradients.length > 0) {
      yamlLines.push('', 'gradients:');
      for (const grad of extraction.gradients.slice(0, 10)) {
        yamlLines.push(`  - "${grad}"`);
      }
    }

    const outputPath = path.join(tokensDir, 'dark-tokens.yaml');
    fs.writeFileSync(outputPath, yamlLines.join('\n'));

    console.log(`\n> Dark mode extraction complete!`);
    console.log(`  Custom properties: ${Object.keys(extraction.customProperties).length}`);
    console.log(`  Unique colors: ${Object.keys(extraction.colors).length}`);
    console.log(`  Background colors: ${Object.keys(extraction.backgroundColors).length}`);
    console.log(`  Gradients: ${extraction.gradients.length}`);
    console.log(`  Output: ${outputPath}`);

  } catch (err) {
    console.error(`Error extracting dark mode: ${err.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
