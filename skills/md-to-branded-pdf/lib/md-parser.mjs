/**
 * Parses Markdown into a structured document for branded PDF/HTML generation.
 * Uses marked for tokenization and applies mapping rules for cover, sections, tables, etc.
 */

import { marked } from 'marked';

/**
 * Parse a Markdown string into a structured document.
 * @param {string} md - Raw Markdown content
 * @returns {{ cover: object, sections: object[] }}
 */
export function parseMD(md) {
  const tokens = marked.lexer(md);

  let cover = null;
  const sections = [];
  let currentSection = null;
  let sectionNumber = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // H1 (first) → cover page
    if (token.type === 'heading' && token.depth === 1 && !cover) {
      cover = buildCover(token, tokens, i);
      // Skip tokens consumed by cover builder
      i = cover._nextIndex;
      continue;
    }

    // H2 → new section (page break)
    if (token.type === 'heading' && token.depth === 2) {
      if (currentSection) sections.push(currentSection);
      sectionNumber++;
      currentSection = {
        number: String(sectionNumber).padStart(2, '0'),
        title: token.text,
        intro: null,
        blocks: [],
      };
      continue;
    }

    if (!currentSection) continue;

    // First paragraph after H2 → section intro
    if (token.type === 'paragraph' && currentSection.intro === null && currentSection.blocks.length === 0) {
      currentSection.intro = token.raw;
      continue;
    }

    // H3+ → subsection heading
    if (token.type === 'heading' && token.depth >= 3) {
      currentSection.blocks.push({ type: 'heading', text: token.text, depth: token.depth });
      continue;
    }

    // Table
    if (token.type === 'table') {
      currentSection.blocks.push({
        type: classifyTable(token),
        token,
      });
      continue;
    }

    // Blockquote → callout
    if (token.type === 'blockquote') {
      const isRed = token.raw.includes('**O que n') || token.raw.includes('n\u00e3o est\u00e1 inclu');
      currentSection.blocks.push({
        type: isRed ? 'callout-red' : 'callout',
        html: marked.parser([token]),
      });
      continue;
    }

    // Code block (fenced or indented)
    if (token.type === 'code') {
      currentSection.blocks.push({
        type: 'code',
        code: token.text,
        lang: token.lang || '',
      });
      continue;
    }

    // List
    if (token.type === 'list') {
      const items = token.items.map(item => item.text);
      // Detect if list contains stats (format: **value** description)
      const isStats = items.length <= 6 && items.every(item => /^\*\*[^*]+\*\*/.test(item));
      if (isStats) {
        currentSection.blocks.push({ type: 'stats', items });
      } else {
        currentSection.blocks.push({ type: 'list', items, ordered: token.ordered });
      }
      continue;
    }

    // Paragraph
    if (token.type === 'paragraph') {
      currentSection.blocks.push({ type: 'paragraph', html: marked.parser([token]) });
      continue;
    }

    // HR → ignored (section breaks handled by H2)
    if (token.type === 'hr') continue;

    // Space → ignored
    if (token.type === 'space') continue;
  }

  if (currentSection) sections.push(currentSection);

  // Clean internal properties from cover
  const cleanCover = cover
    ? { title: cover.title, subtitle: cover.subtitle, badge: cover.badge }
    : { title: 'Document', subtitle: '', badge: '' };

  return { cover: cleanCover, sections };
}

/**
 * Build cover data from H1 and following tokens.
 */
function buildCover(h1Token, tokens, startIndex) {
  const cover = {
    title: h1Token.text,
    subtitle: '',
    badge: '',
    _nextIndex: startIndex,
  };

  for (let j = startIndex + 1; j < tokens.length; j++) {
    const next = tokens[j];

    if (next.type === 'space') {
      cover._nextIndex = j;
      continue;
    }

    // First paragraph → subtitle
    if (next.type === 'paragraph' && !cover.subtitle) {
      // Check for italic text as badge
      const italicMatch = next.raw.match(/\*([^*]+)\*/);
      if (italicMatch && !cover.badge) {
        cover.badge = italicMatch[1];
        cover.subtitle = next.raw.replace(/\*[^*]+\*/, '').trim();
      } else {
        cover.subtitle = next.text;
      }
      cover._nextIndex = j;
      continue;
    }

    // Stop at H2 or another H1
    if (next.type === 'heading') break;

    // Consume additional paragraphs for cover
    if (next.type === 'paragraph') {
      const italicMatch = next.raw.match(/\*([^*]+)\*/);
      if (italicMatch && !cover.badge) {
        cover.badge = italicMatch[1];
      }
      cover._nextIndex = j;
      continue;
    }

    break;
  }

  return cover;
}

/**
 * Classify a table as pricing, comparison, or standard.
 */
function classifyTable(token) {
  const raw = JSON.stringify(token);
  if (raw.includes('R$') || raw.includes('Valor') || raw.includes('Desconto')) return 'pricing-table';
  if (raw.includes('\u2705') || raw.includes('\u274C') || raw.includes('Parcial')) return 'compare-table';
  return 'table';
}
