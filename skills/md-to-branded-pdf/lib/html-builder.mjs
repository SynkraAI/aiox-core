/**
 * Builds a complete print-first HTML document from parsed MD structure + brand config.
 */

import { getBrandCSS } from './brand-loader.mjs';
import { getBaseCSS } from '../templates/styles.mjs';
import {
  escapeHTML, formatInline, formatCoverTitle,
  buildCoverVars, buildLogos, buildTable, buildList, buildStats, buildCodeBlock,
} from './html-utils.mjs';

/**
 * Build a full HTML document ready for Puppeteer PDF generation.
 * @param {{ cover: object, sections: object[] }} parsed - Output from md-parser
 * @param {object} brand - Brand config from brand-loader
 * @returns {string} Complete HTML document
 */
export function buildHTML(parsed, brand) {
  const rootVars = getBrandCSS(brand);
  const coverVars = buildCoverVars(brand);
  const css = getBaseCSS(rootVars + coverVars, brand.font);
  const fontLink = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(brand.font)}:wght@400;500;600;700;800&display=swap`;

  const coverHTML = buildCover(parsed.cover, brand);
  const sectionsHTML = parsed.sections.map(s => buildSection(s)).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(parsed.cover.title)} | ${escapeHTML(brand.name)}</title>
<link href="${fontLink}" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${coverHTML}
${sectionsHTML}
</body>
</html>`;
}

function buildCover(cover, brand) {
  const logos = buildLogos(brand, 'cover-logos');
  const badge = cover.badge
    ? `<div class="cover-badge">${escapeHTML(cover.badge)}</div>`
    : '';

  const titleHTML = formatCoverTitle(cover.title);
  const subtitle = cover.subtitle
    ? `<p class="subtitle">${formatInline(cover.subtitle)}</p>`
    : '';

  return `
<div class="cover">
  ${badge}
  ${logos}
  <h1>${titleHTML}</h1>
  ${subtitle}
</div>`;
}

function buildSection(section) {
  const intro = section.intro
    ? `<p class="section-intro">${formatInline(section.intro)}</p>`
    : '';

  const blocks = section.blocks.map(block => buildBlock(block)).join('\n');

  return `
<section>
  <div class="section-num">${escapeHTML(section.number)} &nbsp; ${escapeHTML(section.title)}</div>
  <h2>${escapeHTML(section.title)}</h2>
  ${intro}
  ${blocks}
</section>`;
}

function buildBlock(block) {
  switch (block.type) {
    case 'heading': return `<h3>${escapeHTML(block.text)}</h3>`;
    case 'paragraph': return block.html;
    case 'callout': return `<div class="callout">${block.html}</div>`;
    case 'callout-red': return `<div class="callout callout-red">${block.html}</div>`;
    case 'table': return buildTable(block.token, '');
    case 'pricing-table': return buildTable(block.token, 'pricing-table');
    case 'compare-table': return buildTable(block.token, 'compare-table');
    case 'list': return buildList(block);
    case 'stats': return buildStats(block.items);
    case 'code': return buildCodeBlock(block.code, block.lang);
    default: return '';
  }
}
