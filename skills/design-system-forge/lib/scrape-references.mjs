#!/usr/bin/env node
/**
 * Design System Forge — Reference Scraper
 *
 * Pre-built recipes for scraping design references from premium sources.
 * Wraps tools/smart-browser-playwright for autonomous browsing.
 *
 * Usage:
 *   node scrape-references.mjs --source awwwards
 *   node scrape-references.mjs --source 21st
 *   node scrape-references.mjs --source <name> --url <url>
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ---------------------------------------------------------------------------
// Resolve paths
// ---------------------------------------------------------------------------

const AIOS_CORE = process.env.AIOS_CORE || path.resolve(os.homedir(), 'aios-core');
const BROWSER_TOOL = path.join(AIOS_CORE, 'tools', 'smart-browser-playwright', 'run.js');

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

const RECIPES = {
  awwwards: {
    url: 'https://www.awwwards.com/awwwards/collections/css-js-animations/',
    task: 'Navigate to the CSS & JS Animations collection on Awwwards. Extract the first 20 sites listed: for each site get the name, URL, a brief description of the animation technique used, and the screenshot URL if visible. Return the data as a JSON array with fields: name, url, description, screenshotUrl, category.',
    description: 'CSS & JS Animations collection from Awwwards',
  },
  '21st': {
    url: 'https://21st.dev',
    task: 'Navigate to 21st.dev. Browse the component library and extract the first 20 components: for each get the component name, category (e.g. hero, card, navbar, footer), a description of the visual pattern, and any code snippet or framework info. Return as a JSON array with fields: name, category, description, framework, codeUrl.',
    description: 'Component patterns from 21st.dev',
  },
  dribbble: {
    url: 'https://dribbble.com/search/web-design',
    task: 'Navigate to Dribbble web design search. Extract the first 15 shots: for each get the title, designer name, shot URL, and a brief description of the visual pattern. Return as a JSON array with fields: title, designer, url, description.',
    description: 'Web design shots from Dribbble',
  },
  mobbin: {
    url: 'https://mobbin.com/browse/web/apps',
    task: 'Navigate to Mobbin web apps section. Extract the first 15 apps: for each get the app name, category, URL, and key design patterns visible. Return as a JSON array with fields: name, category, url, patterns.',
    description: 'Web app patterns from Mobbin',
  },
  godly: {
    url: 'https://godly.website',
    task: 'Navigate to godly.website. Extract the first 15 sites: for each get the site name, URL, and a brief description of what makes the design notable. Return as a JSON array with fields: name, url, description.',
    description: 'Premium web design inspiration from Godly',
  },
};

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let source = null;
let customUrl = null;
let customTask = null;
let limit = 20;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--source' || arg === '-s') {
    source = args[++i];
  } else if (arg === '--url') {
    customUrl = args[++i];
  } else if (arg === '--task') {
    customTask = args[++i];
  } else if (arg === '--limit') {
    limit = parseInt(args[++i]) || 20;
  } else if (arg === '--list') {
    console.log('\nAvailable sources:');
    for (const [key, recipe] of Object.entries(RECIPES)) {
      console.log(`  ${key.padEnd(12)} — ${recipe.description}`);
    }
    console.log(`\nCustom:  --source <name> --url <url> --task "<description>"`);
    process.exit(0);
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Design System Forge — Reference Scraper

Usage:
  node scrape-references.mjs --source awwwards
  node scrape-references.mjs --source 21st
  node scrape-references.mjs --source <name> --url <url> --task "<task>"

Options:
  --source, -s     Source name (awwwards, 21st, dribbble, mobbin, godly, or custom)
  --url            Custom URL (required for custom source)
  --task           Custom task description (required for custom source)
  --limit          Max items to extract (default: 20)
  --list           List available sources
  --help, -h       Show this help
`);
    process.exit(0);
  }
}

if (!source) {
  console.error('Error: --source is required.');
  console.error('Use --list to see available sources or --help for usage.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Resolve recipe
// ---------------------------------------------------------------------------

let recipe;

if (RECIPES[source]) {
  recipe = RECIPES[source];
} else if (customUrl && customTask) {
  recipe = {
    url: customUrl,
    task: customTask,
    description: `Custom scrape: ${source}`,
  };
} else if (customUrl) {
  recipe = {
    url: customUrl,
    task: `Navigate to ${customUrl}. Extract the first ${limit} design patterns, components, or visual elements visible. For each, get a name, description, and any relevant metadata. Return as a JSON array.`,
    description: `Custom scrape: ${source}`,
  };
} else {
  console.error(`Error: Unknown source "${source}". Use --list to see available sources.`);
  console.error('For custom sources, provide --url and optionally --task.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Output directory
// ---------------------------------------------------------------------------

const outputDir = path.join(process.cwd(), 'design-system', 'references');
fs.mkdirSync(outputDir, { recursive: true });

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

console.log(`\n> Scraping references: ${recipe.description}`);
console.log(`  URL: ${recipe.url}`);

// Check if smart-browser-playwright exists
if (fs.existsSync(BROWSER_TOOL)) {
  try {
    const result = execFileSync('node', [BROWSER_TOOL, '--task', recipe.task, '--headless'], {
      timeout: 180000,
      encoding: 'utf-8',
      cwd: path.dirname(BROWSER_TOOL),
    });

    // Try to extract JSON from output
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        const outputPath = path.join(outputDir, `${source}.json`);
        fs.writeFileSync(outputPath, JSON.stringify({
          source,
          url: recipe.url,
          description: recipe.description,
          scrapedAt: new Date().toISOString(),
          count: data.length,
          items: data,
        }, null, 2));
        console.log(`\n> Scraping complete!`);
        console.log(`  Items: ${data.length}`);
        console.log(`  Output: ${outputPath}`);
      } catch {
        // JSON found but malformed — save raw
        const outputPath = path.join(outputDir, `${source}-raw.txt`);
        fs.writeFileSync(outputPath, result);
        console.log(`\n> Scraping complete (JSON found but malformed — saved raw)`);
        console.log(`  Output: ${outputPath}`);
      }
    } else {
      // No JSON found at all — save raw
      const outputPath = path.join(outputDir, `${source}-raw.txt`);
      fs.writeFileSync(outputPath, result);
      console.log(`\n> Scraping complete (raw output — no JSON detected)`);
      console.log(`  Output: ${outputPath}`);
    }
  } catch (err) {
    console.error(`Error running smart-browser-playwright: ${err.message}`);
    console.log('\nFallback: Use the agent directly:');
    console.log(`  @analyst → /smart-browser-playwright --task "${recipe.task}"`);
    process.exit(1);
  }
} else {
  // Fallback: provide instructions for manual execution
  console.log('\n> smart-browser-playwright not found at expected path.');
  console.log('  Run manually:');
  console.log(`  cd ${path.dirname(BROWSER_TOOL)}`);
  console.log(`  node run.js --task "${recipe.task}"`);
  console.log(`\n  Or use the agent: @analyst → /smart-browser-playwright`);

  // Save the recipe for later execution
  const recipePath = path.join(outputDir, `${source}-recipe.json`);
  fs.writeFileSync(recipePath, JSON.stringify(recipe, null, 2));
  console.log(`  Recipe saved: ${recipePath}`);
}
