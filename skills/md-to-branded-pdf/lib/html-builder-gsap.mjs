/**
 * GSAP HTML builder - generates a complete HTML document with Tailwind CDN + GSAP CDN.
 * Everything is inline (scripts, styles) for a single-file output.
 */

import {
  escapeHTML, formatInline, formatCoverTitle,
  buildLogos, buildTable, buildList, buildStats, buildCodeBlock,
} from './html-utils.mjs';
import { brandToTailwindConfig, brandToShadcnVars } from './color-mapper.mjs';
import { getGSAPCSS } from '../templates/styles-gsap.mjs';
import { getGSAPScripts } from '../templates/scripts-gsap.mjs';

/**
 * Build a complete GSAP-powered HTML site with Tailwind CDN, GSAP CDN, and inline styles/scripts.
 * @param {{ cover: object, sections: object[] }} parsed - Output from md-parser
 * @param {object} brand - Brand config from brand-loader
 * @param {object} effectsConfig - Effects flags from effects-config.mjs
 * @returns {{ html: string }} Single complete HTML document
 */
export function buildGSAPSite(parsed, brand, effectsConfig) {
  const tailwindConfig = brandToTailwindConfig(brand);
  const initialTheme = brand.theme || 'dark';
  const shadcnVars = brandToShadcnVars(brand, initialTheme);
  const css = getGSAPCSS(shadcnVars);
  const scripts = getGSAPScripts(effectsConfig);

  const fontLink = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(brand.font)}:wght@400;500;600;700;800&display=swap`;

  const loadingHTML = effectsConfig.loadingScreen
    ? `<div id="loading-screen"><div class="spinner"></div></div>`
    : '';

  const cursorHTML = effectsConfig.cursorGlow
    ? `<div id="cursor-glow"></div>`
    : '';

  const spotlightHTML = effectsConfig.spotlightCursor
    ? `<div id="spotlight-cursor"></div>`
    : '';

  const navHTML = buildNav(parsed.sections, brand);
  const heroHTML = buildHero(parsed.cover, brand, effectsConfig);
  const sectionsHTML = parsed.sections.map(s => buildSection(s, effectsConfig)).join('\n');
  const footerHTML = buildFooter(brand);

  const html = `<!DOCTYPE html>
<html lang="pt-BR" data-theme="${initialTheme}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(parsed.cover.title)} | ${escapeHTML(brand.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontLink}" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: ${JSON.stringify(tailwindConfig, null, 2)}
  }
}
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<style>
${css}
</style>
</head>
<body class="bg-background text-foreground">
${loadingHTML}
${cursorHTML}
${spotlightHTML}
${navHTML}
${heroHTML}
<div class="max-w-5xl mx-auto px-6 py-16">
${sectionsHTML}
</div>
${footerHTML}
<script>
${scripts}
</script>
</body>
</html>`;

  return { html };
}

/**
 * Build sticky nav bar with brand name, section links, and theme toggle.
 */
function buildNav(sections, brand) {
  const links = sections.map(s =>
    `<a href="#section-${s.number}" class="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">${escapeHTML(s.title)}</a>`
  ).join('\n        ');

  return `
<nav class="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border">
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-xl font-bold text-foreground">${escapeHTML(brand.name)}</a>
    <div class="hidden md:flex items-center gap-6">
      ${links}
    </div>
    <button id="theme-toggle" class="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors" aria-label="Toggle theme">
      <span class="text-lg">🌙</span>
    </button>
  </div>
</nav>`;
}

/**
 * Build hero section with gradient background, logos, badge, title, subtitle.
 */
function buildHero(cover, brand, effectsConfig) {
  const logos = buildLogos(brand, 'flex items-center gap-4 mb-8 opacity-90');
  const badge = cover.badge
    ? `<div class="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6" data-gsap="fade-up">${escapeHTML(cover.badge)}</div>`
    : '';

  const titleHTML = formatCoverTitle(cover.title);
  const subtitle = cover.subtitle
    ? `<p class="text-xl text-muted-foreground max-w-2xl mx-auto" data-gsap="fade-up">${formatInline(cover.subtitle)}</p>`
    : '';

  const gradientBg = brand.cover && brand.cover.gradient_primary && brand.cover.gradient_secondary
    ? `background: linear-gradient(135deg, ${brand.cover.gradient_primary} 0%, ${brand.cover.gradient_secondary} 100%);`
    : `background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);`;

  return `
<header id="hero" class="min-h-screen flex items-center justify-center relative overflow-hidden">
  <div class="absolute inset-0 opacity-10" style="${gradientBg}"></div>
  <div class="relative z-10 text-center px-6">
    ${badge}
    ${logos}
    <h1 class="text-5xl md:text-7xl font-extrabold leading-tight mb-6" data-gsap="fade-up">
      ${titleHTML}
    </h1>
    ${subtitle}
  </div>
</header>`;
}

/**
 * Build a section with header and blocks.
 */
function buildSection(section, effectsConfig) {
  const intro = section.intro
    ? `<p class="text-lg text-muted-foreground mb-8" data-gsap="fade-up">${formatInline(section.intro)}</p>`
    : '';

  const blocks = section.blocks.map(block => buildBlock(block, effectsConfig)).join('\n');

  return `
<section id="section-${section.number}" class="mb-20 scroll-mt-20">
  <div class="section-header mb-8" data-gsap="fade-up">
    <div class="text-sm font-semibold text-primary mb-2">${escapeHTML(section.number)}</div>
    <h2 class="text-4xl font-bold text-foreground">${escapeHTML(section.title)}</h2>
  </div>
  ${intro}
  ${blocks}
</section>`;
}

/**
 * Build a block with appropriate Tailwind classes and GSAP data attributes.
 */
function buildBlock(block, effectsConfig) {
  const animAttr = effectsConfig.textReveal ? ' data-gsap="fade-up"' : '';

  switch (block.type) {
    case 'heading':
      return `<h3 class="text-2xl font-semibold text-foreground mt-8 mb-4"${animAttr}>${escapeHTML(block.text)}</h3>`;

    case 'paragraph':
      return `<div class="text-lg text-muted-foreground leading-relaxed mb-4"${animAttr}>${block.html}</div>`;

    case 'callout': {
      const calloutGlass = effectsConfig.glassmorphism ? ' data-glass' : '';
      return `<div class="border-l-4 border-primary bg-card rounded-lg p-6 mb-6"${animAttr}${calloutGlass}>${block.html}</div>`;
    }

    case 'callout-red':
      return `<div class="border-l-4 border-red-500 bg-red-950/20 rounded-lg p-6 mb-6"${animAttr}>${block.html}</div>`;

    case 'table':
    case 'pricing-table':
    case 'compare-table': {
      const className = block.type === 'pricing-table' ? 'pricing-table' : block.type === 'compare-table' ? 'compare-table' : '';
      const shimmerAttr = effectsConfig.shimmerBorder && block.type === 'pricing-table' ? ' data-shimmer' : '';
      return `<div class="w-full overflow-x-auto mb-6 rounded-lg border border-border"${animAttr}${shimmerAttr}>${buildTable(block.token, className)}</div>`;
    }

    case 'list': {
      const staggerAttr = effectsConfig.staggeredCards ? ' data-gsap="stagger"' : '';
      return `<div class="mb-6"${staggerAttr}>${buildList(block, 'text-muted-foreground')}</div>`;
    }

    case 'stats': {
      const staggerAttr = effectsConfig.staggeredCards ? ' data-gsap="stagger"' : '';
      const glowAttr = effectsConfig.glowCards ? ' data-glow' : '';
      const glassAttr = effectsConfig.glassmorphism ? ' data-glass' : '';
      const statsHTML = block.items.map(item => {
        const match = item.match(/^\*\*([^*]+)\*\*\s*(.*)/);
        if (match) {
          const value = match[1];
          const label = match[2];
          const counterAttr = effectsConfig.animatedCounters && /^\d+/.test(value) ? ` data-counter="${value}"` : '';
          return `<div class="rounded-xl bg-card border border-border p-6 text-center"${glowAttr}${glassAttr}>
  <div class="text-4xl font-extrabold text-primary mb-2"${counterAttr}>${escapeHTML(value)}</div>
  <div class="text-sm text-muted-foreground">${escapeHTML(label)}</div>
</div>`;
        }
        return `<div class="rounded-xl bg-card border border-border p-6 text-center">
  <div class="text-sm text-muted-foreground">${escapeHTML(item)}</div>
</div>`;
      }).join('\n');

      return `<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"${staggerAttr}>${statsHTML}</div>`;
    }

    case 'code':
      return `<div class="rounded-lg overflow-hidden mb-6"${animAttr}>${buildCodeBlock(block.code, block.lang)}</div>`;

    default:
      return '';
  }
}

/**
 * Build footer.
 */
function buildFooter(brand) {
  return `
<footer class="text-center py-12 border-t border-border">
  <p class="text-muted-foreground"><strong class="text-foreground">${escapeHTML(brand.name)}</strong></p>
</footer>`;
}
