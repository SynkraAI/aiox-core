/**
 * Builds a complete web-optimized HTML document from parsed MD structure + brand config.
 * Separate from html-builder.mjs (print-optimized for PDF).
 */

import { getBrandCSS } from './brand-loader.mjs';
import { getWebCSS } from '../templates/styles-web.mjs';
import { getWebJS } from '../templates/scripts-web.mjs';
import {
  escapeHTML, formatInline, formatCoverTitle,
  buildCoverVars, buildLogos, buildTable, buildList, buildStats, buildCodeBlock,
} from './html-utils.mjs';

/**
 * Build a full HTML site document optimized for web viewing.
 * @param {{ cover: object, sections: object[] }} parsed - Output from md-parser
 * @param {object} brand - Brand config from brand-loader
 * @param {{ animations: string, features: string }} options - User-selected options
 * @returns {{ html: string, css: string, js: string }} Separate assets for site-generator
 */
export function buildWebHTML(parsed, brand, options = {}) {
  const assets = buildWebDocument(parsed, brand, options);
  const fontLink = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(brand.font)}:wght@400;500;600;700;800&display=swap`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR" data-theme="${brand.theme || 'dark'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(parsed.cover.title)} | ${escapeHTML(brand.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontLink}" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
${assets.bodyHTML}
<script src="js/main.js"></script>
</body>
</html>`;

  return { html, css: assets.css, js: assets.js };
}

/**
 * Build a single-file HTML (all assets inline) for quick preview.
 * @param {{ cover: object, sections: object[] }} parsed
 * @param {object} brand
 * @param {{ animations: string, features: string }} options
 * @returns {string} Complete HTML document with inline CSS/JS
 */
export function buildWebHTMLInline(parsed, brand, options = {}) {
  const assets = buildWebDocument(parsed, brand, options);
  const fontLink = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(brand.font)}:wght@400;500;600;700;800&display=swap`;

  return `<!DOCTYPE html>
<html lang="pt-BR" data-theme="${brand.theme || 'dark'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(parsed.cover.title)} | ${escapeHTML(brand.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontLink}" rel="stylesheet">
<style>${assets.css}</style>
</head>
<body>
${assets.bodyHTML}
<script>${assets.js}</script>
</body>
</html>`;
}

/**
 * Core builder shared by buildWebHTML and buildWebHTMLInline.
 * @returns {{ bodyHTML: string, css: string, js: string }}
 */
function buildWebDocument(parsed, brand, options) {
  const { animations = 'full', features = 'full' } = options;

  const rootVars = getBrandCSS(brand);
  const coverVars = buildCoverVars(brand);
  const css = getWebCSS(rootVars + coverVars, brand.font, { animations, features });
  const js = getWebJS({ animations, features });

  const hasStickyNav = ['nav', 'full'].includes(features);
  const hasDarkLight = ['toggle', 'full'].includes(features);
  const hasProgressBar = features === 'full';
  const hasBackToTop = features === 'full';
  const hasScrollAnimations = ['scroll', 'full'].includes(animations) || animations === 'minimal';

  const heroHTML = buildHero(parsed.cover, brand);
  const navHTML = hasStickyNav ? buildNav(parsed.sections, brand, hasDarkLight) : '';
  const progressHTML = hasProgressBar ? '<div class="progress-bar"></div>' : '';
  const backToTopHTML = hasBackToTop ? '<button class="back-to-top" aria-label="Back to top">&uarr;</button>' : '';
  const sectionsHTML = parsed.sections.map(s => buildSection(s, hasScrollAnimations)).join('\n');

  const bodyHTML = `${progressHTML}
${navHTML}
${heroHTML}
<div class="content">
${sectionsHTML}
</div>
<footer class="site-footer">
  <p><strong>${escapeHTML(brand.name)}</strong></p>
</footer>
${backToTopHTML}`;

  return { bodyHTML, css, js };
}

function buildNav(sections, brand, hasDarkLight) {
  const links = sections.map(s =>
    `<a href="#section-${s.number}">${escapeHTML(s.title)}</a>`
  ).join('\n        ');

  const toggleBtn = hasDarkLight
    ? `<div class="nav-actions"><button class="theme-toggle" aria-label="Toggle theme">&#9790;</button></div>`
    : '';

  return `
<nav class="site-nav">
  <div class="site-nav-inner">
    <a class="site-nav-brand" href="#">${escapeHTML(brand.name)}</a>
    <div class="site-nav-links">
      ${links}
    </div>
    ${toggleBtn}
  </div>
</nav>`;
}

function buildHero(cover, brand) {
  const logos = buildLogos(brand, 'hero-logos');
  const badge = cover.badge
    ? `<div class="hero-badge">${escapeHTML(cover.badge)}</div>`
    : '';

  const titleHTML = formatCoverTitle(cover.title);
  const subtitle = cover.subtitle
    ? `<p class="subtitle">${formatInline(cover.subtitle)}</p>`
    : '';

  return `
<header class="hero">
  ${badge}
  ${logos}
  <h1>${titleHTML}</h1>
  ${subtitle}
</header>`;
}

function buildSection(section, animate) {
  const animClass = animate ? ' animate-on-scroll' : '';
  const intro = section.intro
    ? `<p class="section-intro">${formatInline(section.intro)}</p>`
    : '';

  const blocks = section.blocks.map((block, i) => {
    const delayClass = animate ? `animate-on-scroll delay-${Math.min(i + 1, 3)}` : '';
    return buildBlock(block, delayClass);
  }).join('\n');

  return `
<section class="doc-section${animClass}" id="section-${section.number}">
  <div class="section-header">
    <div class="section-num">${escapeHTML(section.number)} &nbsp; ${escapeHTML(section.title)}</div>
    <h2>${escapeHTML(section.title)}</h2>
  </div>
  ${intro}
  ${blocks}
</section>`;
}

function buildBlock(block, animClass = '') {
  const cls = animClass ? ` class="${animClass}"` : '';

  switch (block.type) {
    case 'heading': return `<h3${cls}>${escapeHTML(block.text)}</h3>`;
    case 'paragraph': return `<div${cls}>${block.html}</div>`;
    case 'callout': return `<div class="callout${animClass ? ' ' + animClass : ''}">${block.html}</div>`;
    case 'callout-red': return `<div class="callout callout-red${animClass ? ' ' + animClass : ''}">${block.html}</div>`;
    case 'table': return `<div class="table-wrapper${animClass ? ' ' + animClass : ''}">${buildTable(block.token, '')}</div>`;
    case 'pricing-table': return `<div class="table-wrapper${animClass ? ' ' + animClass : ''}">${buildTable(block.token, 'pricing-table')}</div>`;
    case 'compare-table': return `<div class="table-wrapper${animClass ? ' ' + animClass : ''}">${buildTable(block.token, 'compare-table')}</div>`;
    case 'list': return buildList(block, animClass);
    case 'stats': return buildStats(block.items, animClass);
    case 'code': return `<div${cls}>${buildCodeBlock(block.code, block.lang)}</div>`;
    default: return '';
  }
}
