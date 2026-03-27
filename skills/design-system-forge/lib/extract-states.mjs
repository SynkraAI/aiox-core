#!/usr/bin/env node
/**
 * Design System Forge — Interactive States Extractor
 *
 * Simulates :hover, :focus, :active on interactive elements
 * and captures computed style diffs for each state.
 *
 * Usage:
 *   node extract-states.mjs <url> --name <name>
 *
 * Output:
 *   design-system/states/interactions.json
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let target = null;
let name = 'states';
let timeout = 30;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--name' || arg === '-n') {
    name = args[++i];
  } else if (arg === '--timeout' || arg === '-t') {
    timeout = parseInt(args[++i]) || 30;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Design System Forge — Interactive States Extractor

Usage:
  node extract-states.mjs <url> --name <name>

Options:
  --name, -n       Artifact name (default: "states")
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
  console.error('Usage: node extract-states.mjs <url> --name <name>');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Style properties to capture for state diffs
// ---------------------------------------------------------------------------

const STYLE_PROPS = [
  'color', 'backgroundColor', 'backgroundImage',
  'borderColor', 'borderWidth', 'borderRadius',
  'boxShadow', 'textShadow',
  'transform', 'opacity',
  'textDecoration', 'outline', 'outlineColor', 'outlineWidth',
  'cursor', 'scale',
  'transition', 'filter', 'backdropFilter',
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const outputDir = path.join(process.cwd(), 'design-system', 'states');
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\n> Extracting interactive states from ${target}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    await page.goto(target, {
      waitUntil: 'domcontentloaded',
      timeout: timeout * 1000,
    });

    // Wait for JS to render (SPAs, lazy-loaded content)
    await page.waitForTimeout(5000);

    // Find interactive elements
    const elements = await page.evaluate((styleProps) => {
      const selectors = [
        'a[href]',
        'button',
        'input',
        'textarea',
        'select',
        '[role="button"]',
        '[tabindex]',
        '.btn',
        '[class*="button"]',
        '[class*="link"]',
        '[class*="cta"]',
      ];

      const seen = new Set();
      const results = [];

      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          // Skip duplicates and hidden elements
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          const key = `${el.tagName}-${rect.x}-${rect.y}`;
          if (seen.has(key)) continue;
          seen.add(key);

          // Capture base state
          const computed = window.getComputedStyle(el);
          const baseStyles = {};
          for (const prop of styleProps) {
            baseStyles[prop] = computed[prop];
          }

          results.push({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().slice(0, 50),
            classes: el.className ? el.className.toString().slice(0, 100) : '',
            selector: el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.toString().split(' ').filter(Boolean).join('.') : ''}`,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            baseStyles,
          });

          if (results.length >= 50) break; // Cap at 50 elements
        }
        if (results.length >= 50) break;
      }

      return results;
    }, STYLE_PROPS);

    console.log(`  Found ${elements.length} interactive elements`);

    // Simulate states and capture diffs
    const interactions = [];

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      console.log(`  [${i + 1}/${elements.length}] ${el.tag}: "${el.text}"`);

      const interaction = {
        tag: el.tag,
        text: el.text,
        classes: el.classes,
        selector: el.selector,
        baseStyles: el.baseStyles,
        states: {},
      };

      // Simulate hover
      try {
        const locator = page.locator(`text="${el.text}"`).first();
        if (await locator.isVisible()) {
          await locator.hover({ timeout: 2000 });
          await page.waitForTimeout(300); // Wait for transition

          const hoverStyles = await locator.evaluate((node, styleProps) => {
            const computed = window.getComputedStyle(node);
            const styles = {};
            for (const prop of styleProps) {
              styles[prop] = computed[prop];
            }
            return styles;
          }, STYLE_PROPS);

          // Only store diffs
          const hoverDiff = {};
          for (const prop of STYLE_PROPS) {
            if (hoverStyles[prop] !== el.baseStyles[prop]) {
              hoverDiff[prop] = {
                from: el.baseStyles[prop],
                to: hoverStyles[prop],
              };
            }
          }

          if (Object.keys(hoverDiff).length > 0) {
            interaction.states.hover = hoverDiff;
          }

          // Move mouse away to reset
          await page.mouse.move(0, 0);
          await page.waitForTimeout(200);
        }
      } catch {
        // Element not hoverable, skip
      }

      // Simulate focus
      try {
        const locator = page.locator(`text="${el.text}"`).first();
        if (await locator.isVisible()) {
          await locator.focus({ timeout: 2000 });
          await page.waitForTimeout(200);

          const focusStyles = await locator.evaluate((node, styleProps) => {
            const computed = window.getComputedStyle(node);
            const styles = {};
            for (const prop of styleProps) {
              styles[prop] = computed[prop];
            }
            return styles;
          }, STYLE_PROPS);

          const focusDiff = {};
          for (const prop of STYLE_PROPS) {
            if (focusStyles[prop] !== el.baseStyles[prop]) {
              focusDiff[prop] = {
                from: el.baseStyles[prop],
                to: focusStyles[prop],
              };
            }
          }

          if (Object.keys(focusDiff).length > 0) {
            interaction.states.focus = focusDiff;
          }

          // Blur to reset
          await locator.evaluate((node) => node.blur());
          await page.waitForTimeout(200);
        }
      } catch {
        // Element not focusable, skip
      }

      // Only include elements that have state changes
      if (Object.keys(interaction.states).length > 0) {
        interactions.push(interaction);
      }
    }

    // Write output
    const output = {
      url: target,
      name,
      timestamp: new Date().toISOString(),
      totalElements: elements.length,
      elementsWithStates: interactions.length,
      interactions,
    };

    const outputPath = path.join(outputDir, 'interactions.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`\n> States extraction complete!`);
    console.log(`  Elements with state changes: ${interactions.length}/${elements.length}`);
    console.log(`  Output: ${outputPath}`);

  } catch (err) {
    console.error(`Error extracting states: ${err.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
