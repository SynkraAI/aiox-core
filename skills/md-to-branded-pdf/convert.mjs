#!/usr/bin/env node

/**
 * CLI entry point for md-to-branded skill.
 * Converts a Markdown file to branded PDF, HTML site, or both.
 *
 * Usage:
 *   node convert.mjs <input.md> [--brand=name] [--format=pdf|html|both]
 *   node convert.mjs <input.md> [--brand=name] [--output=file] [--list-brands] [--help]
 *   node convert.mjs <input.md> [--brand=name] [--format=html] [--animations=full] [--features=full]
 *   node convert.mjs <input.md> [--brand=name] [--format=html] [--style=gsap] [--effects=full-framer]
 *   node convert.mjs <input.md> [--brand=name] [--format=html] [--style=nextjs] [--effects=premium]
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { loadBrand, listBrands } from './lib/brand-loader.mjs';
import { parseMD } from './lib/md-parser.mjs';
import { buildHTML } from './lib/html-builder.mjs';
import { generatePDF } from './lib/pdf-generator.mjs';
import { buildWebHTML, buildWebHTMLInline } from './lib/html-builder-web.mjs';
import { generateSite } from './lib/site-generator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VALID_FORMATS = ['pdf', 'html', 'both'];
const VALID_ANIMATIONS = ['scroll', 'micro', 'full', 'minimal'];
const VALID_FEATURES = ['toggle', 'nav', 'full', 'static'];
const VALID_STYLES = ['basic', 'gsap', 'nextjs'];
const VALID_EFFECTS = ['full-framer', 'premium', 'minimal'];

const args = process.argv.slice(2);

// Parse CLI arguments
const flags = {};
const positional = [];

for (const arg of args) {
  if (arg.startsWith('--')) {
    const [key, ...rest] = arg.slice(2).split('=');
    flags[key] = rest.join('=') || true;
  } else {
    positional.push(arg);
  }
}

// --help
if (flags.help) {
  console.log(`
md-to-branded — Convert Markdown to branded PDF and/or HTML site

Usage:
  node convert.mjs <input.md> [options]

Options:
  --brand=<name>        Brand config to use (required — see --list-brands)
  --format=<type>       Output format: pdf, html, both (default: interactive prompt)
  --style=<type>        HTML style: basic, gsap, nextjs (default: interactive prompt)
  --effects=<level>     Effects level: full-framer, premium, minimal (for gsap/nextjs styles)
  --output=<path>       Output path (PDF file or HTML directory)
  --animations=<level>  scroll | micro | full | minimal (for basic style only)
  --features=<level>    toggle | nav | full | static (for basic style only)
  --inline              Generate single-file HTML instead of folder (basic style only)
  --preview             Open brand themes gallery in browser (for choosing a brand)
  --list-brands         List available brand configs
  --help                Show this help

Styles:
  basic       Vanilla CSS/JS with scroll animations (original mode)
  gsap        Tailwind CDN + GSAP ScrollTrigger — Framer-quality, no build step
  nextjs      Full Next.js project with shadcn/ui + Framer Motion — run npm install && npm run dev

Effects (gsap/nextjs only):
  full-framer Text reveals, counters, parallax, magnetic buttons, cursor glow, loading screen
  premium     Scroll, hover, counters, parallax sutil
  minimal     Smooth scroll + hover only

Examples:
  node convert.mjs proposal.md --brand=my-brand
  node convert.mjs proposal.md --brand=my-brand --format=pdf
  node convert.mjs proposal.md --brand=my-brand --format=html --animations=full --features=full
  node convert.mjs proposal.md --brand=my-brand --format=html --style=gsap --effects=full-framer
  node convert.mjs proposal.md --brand=my-brand --format=html --style=nextjs --effects=premium
  node convert.mjs proposal.md --brand=my-brand --format=both
  node convert.mjs proposal.md --brand=my-brand --format=html --inline
  node convert.mjs --list-brands
`);
  process.exit(0);
}

// --preview
if (flags.preview) {
  const previewPath = resolve(__dirname, 'brands', 'preview.html');
  const platform = process.platform;
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  try {
    execSync(`${cmd} "${previewPath}"`);
    console.log('Brand themes preview opened in browser.');
  } catch {
    console.log(`Open manually: ${previewPath}`);
  }
  process.exit(0);
}

// --list-brands
if (flags['list-brands']) {
  const brands = listBrands();
  console.log('Available brands:');
  for (const b of brands) {
    const brand = loadBrand(b);
    console.log(`  ${b.padEnd(16)} ${brand.name} (${brand.theme} theme)`);
  }
  process.exit(0);
}

// Validate input
const inputPath = positional[0];
if (!inputPath) {
  console.error('Error: No input file specified. Use --help for usage.');
  process.exit(1);
}

const resolvedInput = resolve(inputPath);
let md;
try {
  md = readFileSync(resolvedInput, 'utf-8');
} catch {
  console.error(`Error: Cannot read file "${resolvedInput}"`);
  process.exit(1);
}

// Load brand
const brandName = flags.brand;
if (!brandName) {
  const available = listBrands();
  console.error(`Error: --brand is required. Available brands: ${available.join(', ')}`);
  console.error('Use --list-brands for details or --help for usage.');
  process.exit(1);
}
console.log(`Loading brand: ${brandName}`);
const brand = loadBrand(brandName);

// Validate flag values upfront
if (flags.format && !VALID_FORMATS.includes(flags.format)) {
  console.error(`Error: Invalid --format="${flags.format}". Valid: ${VALID_FORMATS.join(', ')}`);
  process.exit(1);
}
if (flags.animations && !VALID_ANIMATIONS.includes(flags.animations)) {
  console.error(`Error: Invalid --animations="${flags.animations}". Valid: ${VALID_ANIMATIONS.join(', ')}`);
  process.exit(1);
}
if (flags.features && !VALID_FEATURES.includes(flags.features)) {
  console.error(`Error: Invalid --features="${flags.features}". Valid: ${VALID_FEATURES.join(', ')}`);
  process.exit(1);
}
if (flags.style && !VALID_STYLES.includes(flags.style)) {
  console.error(`Error: Invalid --style="${flags.style}". Valid: ${VALID_STYLES.join(', ')}`);
  process.exit(1);
}
if (flags.effects && !VALID_EFFECTS.includes(flags.effects)) {
  console.error(`Error: Invalid --effects="${flags.effects}". Valid: ${VALID_EFFECTS.join(', ')}`);
  process.exit(1);
}

// Parse MD
console.log('Parsing Markdown...');
const parsed = parseMD(md);
console.log(`  Cover: "${parsed.cover.title}"`);
console.log(`  Sections: ${parsed.sections.length}`);

// Interactive prompt helper
function askChoice(question, choices) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    console.log(`\n${question}`);
    choices.forEach((c, i) => console.log(`  ${i + 1}. ${c.label}`));
    rl.question('\n> ', (answer) => {
      rl.close();
      const idx = parseInt(answer, 10) - 1;
      if (idx >= 0 && idx < choices.length) {
        res(choices[idx].value);
      } else {
        res(choices[0].value);
      }
    });
  });
}

// Determine format (flag or interactive)
let format = flags.format;
if (!format) {
  format = await askChoice('Output format:', [
    { label: 'PDF only', value: 'pdf' },
    { label: 'HTML site only', value: 'html' },
    { label: 'Both (PDF + HTML)', value: 'both' },
  ]);
}

const needsHTML = format === 'html' || format === 'both';
const needsPDF = format === 'pdf' || format === 'both';

// Determine HTML style (basic, gsap, nextjs)
let style = flags.style || null;
let effects = flags.effects || null;

if (needsHTML) {
  if (!style) {
    style = await askChoice('HTML style:', [
      { label: 'Basic (vanilla CSS/JS with scroll animations)', value: 'basic' },
      { label: 'GSAP Standalone (Tailwind CDN + GSAP — Framer-quality, no build step)', value: 'gsap' },
      { label: 'Next.js Project (React + shadcn/ui + Framer Motion — npm install && npm run dev)', value: 'nextjs' },
    ]);
  }

  // Effects prompt for premium styles
  if ((style === 'gsap' || style === 'nextjs') && !effects) {
    effects = await askChoice('Effects level:', [
      { label: 'Full Framer — text reveals, counters, parallax, magnetic buttons, cursor glow, loading screen', value: 'full-framer' },
      { label: 'Premium — scroll suave, hover, counters, parallax sutil', value: 'premium' },
      { label: 'Minimal — smooth scroll + hover only', value: 'minimal' },
    ]);
  }
}

// Determine basic-style HTML options (only for basic style)
let animations = flags.animations || null;
let features = flags.features || null;

if (needsHTML && style === 'basic') {
  if (!animations) {
    animations = await askChoice('Animation level:', [
      { label: 'Scroll animations (fade/slide on scroll)', value: 'scroll' },
      { label: 'Micro-interactions (hover effects, transitions)', value: 'micro' },
      { label: 'Full (scroll + micro-interactions)', value: 'full' },
      { label: 'Minimal motion (CSS transitions only)', value: 'minimal' },
    ]);
  }

  if (!features) {
    features = await askChoice('Interactive features:', [
      { label: 'Dark/light toggle', value: 'toggle' },
      { label: 'Sticky navigation + smooth scroll', value: 'nav' },
      { label: 'Full (toggle + nav + progress bar + back-to-top)', value: 'full' },
      { label: 'Static only (no JS interactivity)', value: 'static' },
    ]);
  }
}

const inputBase = basename(resolvedInput, '.md');
const inputDir = dirname(resolvedInput);

// Generate PDF
if (needsPDF) {
  console.log('\nBuilding HTML for PDF...');
  const html = buildHTML(parsed, brand);

  const pdfOutput = flags.output && !needsHTML
    ? resolve(flags.output)
    : resolve(inputDir, `${inputBase}-branded.pdf`);

  console.log(`Generating PDF → ${pdfOutput}`);
  await generatePDF(html, pdfOutput);
  console.log('PDF done!');
}

// Generate HTML site
if (needsHTML) {
  const resolvedStyle = style || 'basic';

  if (resolvedStyle === 'gsap') {
    // Mode A: GSAP Standalone (Tailwind CDN + GSAP)
    const { getEffectsConfig } = await import('./lib/effects-config.mjs');
    const { buildGSAPSite } = await import('./lib/html-builder-gsap.mjs');
    const { generateGSAPSite } = await import('./lib/site-generator-gsap.mjs');

    const effectsConfig = getEffectsConfig(effects || 'premium');
    console.log(`\nBuilding GSAP site (effects: ${effects || 'premium'})...`);
    const siteData = buildGSAPSite(parsed, brand, effectsConfig);

    const siteOutput = flags.output && !needsPDF
      ? resolve(flags.output)
      : resolve(inputDir, `${inputBase}-gsap-site`);

    const sitePath = generateGSAPSite(siteData, siteOutput);
    console.log(`GSAP site → ${sitePath}/`);
    console.log('  index.html (Tailwind CDN + GSAP — open directly in browser)');

  } else if (resolvedStyle === 'nextjs') {
    // Mode B: Next.js Project (React + shadcn/ui + Framer Motion)
    const { getEffectsConfig } = await import('./lib/effects-config.mjs');
    const { generateNextJSProject } = await import('./lib/nextjs-generator.mjs');

    const effectsConfig = getEffectsConfig(effects || 'premium');
    console.log(`\nBuilding Next.js project (effects: ${effects || 'premium'})...`);

    const projectOutput = flags.output && !needsPDF
      ? resolve(flags.output)
      : resolve(inputDir, `${inputBase}-nextjs`);

    const projectPath = generateNextJSProject(parsed, brand, effectsConfig, projectOutput);
    console.log(`Next.js project → ${projectPath}/`);
    console.log('  Run: cd ' + projectPath + ' && npm install && npm run dev');

  } else {
    // Basic style (original behavior)
    const htmlOptions = { animations, features };

    if (flags.inline) {
      console.log('\nBuilding inline HTML...');
      const inlineHTML = buildWebHTMLInline(parsed, brand, htmlOptions);

      const htmlOutput = flags.output && !needsPDF
        ? resolve(flags.output)
        : resolve(inputDir, `${inputBase}-branded.html`);

      writeFileSync(htmlOutput, inlineHTML, 'utf-8');
      console.log(`HTML (inline) → ${htmlOutput}`);
    } else {
      console.log('\nBuilding HTML site...');
      const assets = buildWebHTML(parsed, brand, htmlOptions);

      const siteOutput = flags.output && !needsPDF
        ? resolve(flags.output)
        : resolve(inputDir, `${inputBase}-branded-site`);

      const sitePath = generateSite(assets, siteOutput);
      console.log(`HTML site → ${sitePath}/`);
      console.log('  index.html, css/styles.css, js/main.js');
    }
  }

  console.log('HTML done!');
}

console.log('\nAll done!');
