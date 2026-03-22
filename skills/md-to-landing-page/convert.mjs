#!/usr/bin/env node

/**
 * CLI entry point for md-to-landing-page skill.
 * Converts a Markdown file to a high-conversion Landing Page (GSAP or Next.js).
 *
 * Usage:
 *   node convert.mjs <input.md> --brand=name --style=gsap --effects=premium
 *   node convert.mjs <input.md> --brand=name --style=nextjs --effects=full-framer
 *   node convert.mjs <input.md> --validate-only
 *   node convert.mjs --list-brands
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, basename, dirname, join } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import from base skill (shared brand system)
import { loadBrand, listBrands } from '../md-to-branded-pdf/lib/brand-loader.mjs';

// Import LP-specific modules
import { parseLandingPage, validateLPStructure } from './lib/lp-parser.mjs';
import { getLPEffectsConfig, getLPPresetLabel } from './lib/lp-effects.mjs';

const VALID_STYLES = ['gsap', 'nextjs'];
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
md-to-landing-page — Convert Markdown to high-conversion Landing Pages

Usage:
  node convert.mjs <input.md> [options]

Options:
  --brand=<name>        Brand config to use (required — see --list-brands)
  --style=<type>        Output style: gsap, nextjs (default: interactive prompt)
  --effects=<level>     Effects level: full-framer, premium, minimal (default: premium)
  --output=<path>       Output path (directory)
  --validate-only       Parse and validate structure without generating
  --list-brands         List available brand configs
  --preview             Open brand themes gallery in browser
  --help                Show this help

Styles:
  gsap        Tailwind CDN + GSAP ScrollTrigger — single HTML file, no build step
  nextjs      Full Next.js project with Framer Motion — run npm install && npm run dev

Effects:
  full-framer All animations + CTA pulse, testimonial carousel, pricing glow,
              sticky CTA bar, FAQ accordion, parallax hero
  premium     Scroll, hover, counters + CTA pulse, carousel, pricing glow,
              sticky CTA, FAQ accordion
  minimal     Smooth scroll, hover + FAQ accordion only

Landing Page Sections (detected from H2 keywords):
  hero        Hero section with CTA button
  problema    Pain points / problem awareness
  solução     Solution / mechanism / benefits
  prova       Social proof / testimonials / stats
  oferta      Pricing / offer stack / guarantee
  cta final   Final call to action
  faq         Frequently asked questions

Examples:
  node convert.mjs landing.md --brand=luizfosc --style=gsap --effects=premium
  node convert.mjs landing.md --brand=emerald-ai --style=nextjs --effects=full-framer
  node convert.mjs landing.md --validate-only
  node convert.mjs --list-brands
`);
  process.exit(0);
}

// --preview
if (flags.preview) {
  const previewPath = resolve(__dirname, '..', 'md-to-branded-pdf', 'brands', 'preview.html');
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
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

// Parse Markdown
console.log('🔍 Parsing Landing Page Markdown...');
const parsed = parseLandingPage(md);
console.log(`  Cover: "${parsed.cover.title}"`);
console.log(`  Sections: ${parsed.sections.length}`);
parsed.sections.forEach(s => console.log(`    • [${s.type}] ${s.title}`));

// Validate structure
const validation = validateLPStructure(parsed);
if (!validation.valid) {
  console.warn(`\n⚠️  Missing recommended sections: ${validation.missing.join(', ')}`);
  console.warn('   The landing page will still be generated, but may be less effective.');
}

// --validate-only
if (flags['validate-only']) {
  console.log('\n📋 Validation Result:');
  console.log(`  Valid: ${validation.valid ? '✅ Yes' : '⚠️ Missing sections'}`);
  console.log(`  Found sections: ${validation.found.join(', ')}`);
  if (validation.missing.length > 0) {
    console.log(`  Missing sections: ${validation.missing.join(', ')}`);
  }
  console.log(`  Total sections: ${validation.sectionCount}`);
  process.exit(validation.valid ? 0 : 1);
}

// Load brand
const brandName = flags.brand;
if (!brandName) {
  const available = listBrands();
  console.error(`\nError: --brand is required. Available brands: ${available.join(', ')}`);
  console.error('Use --list-brands for details or --help for usage.');
  process.exit(1);
}
console.log(`\n🎨 Loading brand: ${brandName}`);
const brand = loadBrand(brandName);

// Validate flag values
if (flags.style && !VALID_STYLES.includes(flags.style)) {
  console.error(`Error: Invalid --style="${flags.style}". Valid: ${VALID_STYLES.join(', ')}`);
  process.exit(1);
}
if (flags.effects && !VALID_EFFECTS.includes(flags.effects)) {
  console.error(`Error: Invalid --effects="${flags.effects}". Valid: ${VALID_EFFECTS.join(', ')}`);
  process.exit(1);
}

// Interactive prompt helper
function askChoice(question, choices) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    console.log(`\n${question}`);
    choices.forEach((c, i) => console.log(`  ${i + 1}. ${c.label}`));
    rl.question('\n> ', (answer) => {
      rl.close();
      const idx = parseInt(answer, 10) - 1;
      res(idx >= 0 && idx < choices.length ? choices[idx].value : choices[0].value);
    });
  });
}

// Determine style
let style = flags.style || null;
if (!style) {
  style = await askChoice('Output style:', [
    { label: 'GSAP Standalone (Tailwind CDN + GSAP — single HTML, no build step)', value: 'gsap' },
    { label: 'Next.js Project (React + Framer Motion — npm install && npm run dev)', value: 'nextjs' },
  ]);
}

// Determine effects
let effects = flags.effects || null;
if (!effects) {
  effects = await askChoice('Effects level:', [
    { label: getLPPresetLabel('full-framer'), value: 'full-framer' },
    { label: getLPPresetLabel('premium'), value: 'premium' },
    { label: getLPPresetLabel('minimal'), value: 'minimal' },
  ]);
}

const effectsConfig = getLPEffectsConfig(effects);
const inputBase = basename(resolvedInput, '.md');
const inputDir = dirname(resolvedInput);

// Generate
if (style === 'gsap') {
  const { buildLPGSAPSite } = await import('./lib/lp-builder-gsap.mjs');

  console.log(`\n🚀 Building GSAP Landing Page (effects: ${effects})...`);
  const siteData = buildLPGSAPSite(parsed, brand, effectsConfig);

  const siteOutput = flags.output
    ? resolve(flags.output)
    : resolve(inputDir, `${inputBase}-lp-gsap`);

  mkdirSync(siteOutput, { recursive: true });
  writeFileSync(join(siteOutput, 'index.html'), siteData.html, 'utf-8');

  console.log(`\n✅ Landing Page generated → ${siteOutput}/`);
  console.log('  index.html (Tailwind CDN + GSAP — open directly in browser)');

} else if (style === 'nextjs') {
  const { generateLPNextJSProject } = await import('./lib/lp-builder-nextjs.mjs');

  console.log(`\n🚀 Building Next.js Landing Page (effects: ${effects})...`);

  const projectOutput = flags.output
    ? resolve(flags.output)
    : resolve(inputDir, `${inputBase}-lp-nextjs`);

  generateLPNextJSProject(parsed, brand, effectsConfig, projectOutput);
}

console.log('\n🎉 All done!');
