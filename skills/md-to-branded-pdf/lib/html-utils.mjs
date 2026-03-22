/**
 * Shared HTML utilities used by both print (PDF) and web builders.
 * Single source of truth for escaping, inline formatting, tables, lists, stats, etc.
 */

import { marked } from 'marked';

/**
 * Escape HTML special characters.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Parse inline Markdown to HTML (bold, italic, links, code, etc.).
 * @param {string} text
 * @returns {string}
 */
export function formatInline(text) {
  if (!text) return '';
  return marked.parseInline(text);
}

/**
 * Convert *italic* parts in a cover title to highlighted spans.
 * @param {string} title
 * @returns {string}
 */
export function formatCoverTitle(title) {
  return title.replace(/\*([^*]+)\*/g, '<span class="highlight">$1</span>');
}

/**
 * Build CSS custom properties for cover gradients.
 * @param {object} brand
 * @returns {string}
 */
export function buildCoverVars(brand) {
  if (!brand.cover) return '';
  const vars = [];
  if (brand.cover.gradient_primary) vars.push(`    --cover-gradient-primary: ${brand.cover.gradient_primary};`);
  if (brand.cover.gradient_secondary) vars.push(`    --cover-gradient-secondary: ${brand.cover.gradient_secondary};`);
  return vars.length ? `\n${vars.join('\n')}` : '';
}

/**
 * Build logos HTML for cover/hero.
 * @param {object} brand
 * @param {string} [wrapperClass='cover-logos'] - CSS class for the wrapper div
 * @returns {string}
 */
export function buildLogos(brand, wrapperClass = 'cover-logos') {
  if (!brand.logos) return '';
  const imgs = [];
  if (brand.logos.main) imgs.push(`<img src="${brand.logos.main}" alt="${escapeHTML(brand.name)}">`);
  if (brand.logos.partner) {
    imgs.push(`<span class="sep">\u00D7</span>`);
    imgs.push(`<img src="${brand.logos.partner}" alt="Partner">`);
  }
  return imgs.length ? `<div class="${wrapperClass}">${imgs.join('\n    ')}</div>` : '';
}

/**
 * Build an HTML table from a marked table token.
 * @param {object} token - marked table token
 * @param {string} className - Table CSS class (e.g. 'pricing-table', 'compare-table', '')
 * @returns {string}
 */
export function buildTable(token, className) {
  const cls = className ? ` class="${className}"` : '';
  let html = `<table${cls}>\n<thead><tr>`;

  for (const header of token.header) {
    const align = header.align ? ` style="text-align:${header.align}"` : '';
    html += `<th${align}>${formatInline(header.text)}</th>`;
  }
  html += '</tr></thead>\n<tbody>';

  for (const row of token.rows) {
    html += '<tr>';
    for (const cell of row) {
      const align = cell.align ? ` style="text-align:${cell.align}"` : '';
      let content = formatInline(cell.text);

      if (className === 'compare-table') {
        if (content.includes('\u2705')) content = `<span class="yes">${content}</span>`;
        else if (content.includes('\u274C')) content = `<span class="no">${content}</span>`;
        else if (content.includes('Parcial')) content = `<span class="partial">${content}</span>`;
      }

      if (className === 'pricing-table' && /^\d+%$/.test(cell.text.trim())) {
        content = `<span class="discount">${content}</span>`;
      }

      html += `<td${align}>${content}</td>`;
    }
    html += '</tr>\n';
  }

  html += '</tbody></table>';
  return html;
}

/**
 * Build a list (ordered or unordered).
 * @param {object} block - { items: string[], ordered: boolean }
 * @param {string} [extraClass=''] - Additional CSS classes
 * @returns {string}
 */
export function buildList(block, extraClass = '') {
  const tag = block.ordered ? 'ol' : 'ul';
  const classes = block.ordered ? extraClass : `rules${extraClass ? ' ' + extraClass : ''}`;
  const classAttr = classes ? ` class="${classes}"` : '';
  const items = block.items.map(item => `<li>${formatInline(item)}</li>`).join('\n');
  return `<${tag}${classAttr}>\n${items}\n</${tag}>`;
}

/**
 * Build stats boxes from items with **value** label format.
 * @param {string[]} items
 * @param {string} [extraClass=''] - Additional CSS classes
 * @returns {string}
 */
export function buildStats(items, extraClass = '') {
  const classAttr = extraClass ? ` class="stats ${extraClass}"` : ' class="stats"';
  const statsHTML = items.map(item => {
    const match = item.match(/^\*\*([^*]+)\*\*\s*(.*)/);
    if (match) {
      return `<div class="stat"><div class="stat-value">${escapeHTML(match[1])}</div><div class="stat-label">${escapeHTML(match[2])}</div></div>`;
    }
    return `<div class="stat"><div class="stat-label">${escapeHTML(item)}</div></div>`;
  }).join('\n');

  return `<div${classAttr}>${statsHTML}</div>`;
}

/**
 * Build a code block with syntax highlighting class.
 * @param {string} code - Raw code content
 * @param {string} [lang=''] - Language identifier
 * @returns {string}
 */
export function buildCodeBlock(code, lang = '') {
  const langClass = lang ? ` class="language-${escapeHTML(lang)}"` : '';
  return `<pre><code${langClass}>${escapeHTML(code)}</code></pre>`;
}
