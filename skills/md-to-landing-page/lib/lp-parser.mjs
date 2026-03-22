/**
 * Semantic parser for Landing Page Markdown.
 * Detects section types by H2 keywords (pt-BR + en) and extracts
 * structured data: hero CTA, pain cards, testimonials, offer items, FAQ Q&A, stats.
 */

import { marked } from 'marked';

/**
 * Section type detection keywords (case-insensitive).
 * First match wins — order matters for ambiguous headings.
 */
const SECTION_KEYWORDS = {
  hero:     ['hero', 'above the fold', 'headline'],
  problem:  ['problema', 'problem', 'dor', 'pain', 'dores'],
  solution: ['solução', 'solucao', 'solution', 'mecanismo', 'método', 'metodo', 'como funciona'],
  proof:    ['prova', 'proof', 'testimonial', 'depoimento', 'depoimentos', 'resultados'],
  offer:    ['oferta', 'offer', 'preço', 'preco', 'pricing', 'investimento'],
  cta:      ['cta', 'call to action', 'cta final', 'chamada final'],
  faq:      ['faq', 'dúvidas', 'duvidas', 'perguntas', 'perguntas frequentes'],
};

/**
 * Parse a Landing Page Markdown string into structured LP sections.
 * @param {string} md - Raw Markdown content
 * @returns {{ cover: object, sections: object[] }}
 */
export function parseLandingPage(md) {
  const tokens = marked.lexer(md);

  let cover = null;
  const sections = [];
  let currentSection = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // H1 (first) → cover / above-the-fold headline
    if (token.type === 'heading' && token.depth === 1 && !cover) {
      cover = buildCover(token, tokens, i);
      i = cover._nextIndex;
      continue;
    }

    // H2 → new LP section (detect type by keyword)
    if (token.type === 'heading' && token.depth === 2) {
      if (currentSection) sections.push(finalizeSection(currentSection));
      const sectionType = detectSectionType(token.text);
      currentSection = {
        type: sectionType,
        title: token.text,
        blocks: [],
        _raw: [],
      };
      continue;
    }

    if (!currentSection) continue;

    // Collect all tokens into current section for type-specific parsing
    currentSection._raw.push(token);
  }

  if (currentSection) sections.push(finalizeSection(currentSection));

  const cleanCover = cover
    ? { title: cover.title, subtitle: cover.subtitle, badge: cover.badge, cta: cover.cta }
    : { title: 'Landing Page', subtitle: '', badge: '', cta: '' };

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
    cta: '',
    _nextIndex: startIndex,
  };

  for (let j = startIndex + 1; j < tokens.length; j++) {
    const next = tokens[j];

    if (next.type === 'space') {
      cover._nextIndex = j;
      continue;
    }

    // Paragraph → subtitle or badge
    if (next.type === 'paragraph') {
      // Check for italic text as badge: *Badge text*
      const italicMatch = next.raw.match(/^\*([^*]+)\*\s*$/);
      if (italicMatch && !cover.badge) {
        cover.badge = italicMatch[1];
        cover._nextIndex = j;
        continue;
      }

      if (!cover.subtitle) {
        cover.subtitle = next.text;
      }
      cover._nextIndex = j;
      continue;
    }

    // Stop at H2
    if (next.type === 'heading') break;

    break;
  }

  return cover;
}

/**
 * Detect section type from H2 text using keyword matching.
 * @param {string} text - H2 heading text
 * @returns {string} Section type key
 */
function detectSectionType(text) {
  const normalized = text.toLowerCase().trim();
  for (const [type, keywords] of Object.entries(SECTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) return type;
    }
  }
  return 'generic';
}

/**
 * Finalize a section by parsing its raw tokens into typed blocks.
 * Different section types extract different structured data.
 */
function finalizeSection(section) {
  const { type, title, _raw: tokens } = section;

  switch (type) {
    case 'hero':
      return { type, title, ...parseHeroTokens(tokens) };
    case 'problem':
      return { type, title, ...parseProblemTokens(tokens) };
    case 'solution':
      return { type, title, ...parseSolutionTokens(tokens) };
    case 'proof':
      return { type, title, ...parseProofTokens(tokens) };
    case 'offer':
      return { type, title, ...parseOfferTokens(tokens) };
    case 'cta':
      return { type, title, ...parseCTATokens(tokens) };
    case 'faq':
      return { type, title, ...parseFAQTokens(tokens) };
    default:
      return { type, title, blocks: parseGenericTokens(tokens) };
  }
}

/**
 * Parse hero section: extract description and CTA button text.
 */
function parseHeroTokens(tokens) {
  let description = '';
  let cta = '';

  for (const token of tokens) {
    if (token.type === 'paragraph') {
      // Check for **CTA:** pattern
      const ctaMatch = token.raw.match(/\*\*CTA:\*\*\s*(.+)/i);
      if (ctaMatch) {
        cta = ctaMatch[1].trim();
        continue;
      }
      if (!description) {
        description = token.text;
      }
    }
  }

  return { description, cta };
}

/**
 * Parse problem section: extract intro paragraphs and pain items (❌ prefix).
 */
function parseProblemTokens(tokens) {
  const pains = [];
  const paragraphs = [];

  for (const token of tokens) {
    if (token.type === 'paragraph') {
      // Lines with ❌ are pain items
      const lines = token.raw.split('\n');
      for (const line of lines) {
        const painMatch = line.match(/^❌\s*(.+)/);
        if (painMatch) {
          pains.push(painMatch[1].trim());
        } else if (line.trim()) {
          paragraphs.push(line.trim());
        }
      }
    }
  }

  return { paragraphs, pains };
}

/**
 * Parse solution section: extract intro and benefit items (✅ prefix).
 */
function parseSolutionTokens(tokens) {
  const benefits = [];
  const paragraphs = [];

  for (const token of tokens) {
    if (token.type === 'paragraph') {
      const lines = token.raw.split('\n');
      for (const line of lines) {
        const benefitMatch = line.match(/^✅\s*(.+)/);
        if (benefitMatch) {
          benefits.push(parseBoldItem(benefitMatch[1].trim()));
        } else if (line.trim()) {
          paragraphs.push(line.trim());
        }
      }
    }
    if (token.type === 'list') {
      for (const item of token.items) {
        benefits.push(parseBoldItem(item.text));
      }
    }
  }

  return { paragraphs, benefits };
}

/**
 * Parse proof section: extract testimonials (blockquotes) and stats.
 */
function parseProofTokens(tokens) {
  const testimonials = [];
  const stats = [];
  const paragraphs = [];

  for (const token of tokens) {
    if (token.type === 'blockquote') {
      testimonials.push(parseTestimonial(token));
    }
    if (token.type === 'list') {
      for (const item of token.items) {
        const statMatch = item.text.match(/^\*\*([^*]+)\*\*\s*(.*)/);
        if (statMatch) {
          stats.push({ value: statMatch[1], label: statMatch[2] });
        }
      }
    }
    if (token.type === 'paragraph') {
      // Check for inline stats: **value** label
      const statMatch = token.raw.match(/^\*\*([^*]+)\*\*\s*(.*)/);
      if (statMatch) {
        stats.push({ value: statMatch[1], label: statMatch[2] });
      } else {
        paragraphs.push(token.text);
      }
    }
  }

  return { testimonials, stats, paragraphs };
}

/**
 * Parse offer section: extract offer items, total, price, and guarantee.
 */
function parseOfferTokens(tokens) {
  const items = [];
  let total = '';
  let price = '';
  let guarantee = '';
  const paragraphs = [];
  let inGuarantee = false;

  for (const token of tokens) {
    // H3 "Garantia" starts guarantee sub-section
    if (token.type === 'heading' && token.depth === 3) {
      if (token.text.toLowerCase().includes('garantia') || token.text.toLowerCase().includes('guarantee')) {
        inGuarantee = true;
        continue;
      }
    }

    if (inGuarantee && token.type === 'paragraph') {
      guarantee += (guarantee ? ' ' : '') + token.text;
      continue;
    }

    if (token.type === 'paragraph') {
      const lines = token.raw.split('\n');
      for (const line of lines) {
        // ✅ offer items
        const offerMatch = line.match(/^✅\s*(.+)/);
        if (offerMatch) {
          items.push(parseOfferItem(offerMatch[1].trim()));
          continue;
        }

        // **Total:** or **HOJE:** price lines
        const totalMatch = line.match(/\*\*Total:\*\*\s*(.*)/i);
        if (totalMatch) {
          total = totalMatch[1].trim();
          continue;
        }

        const priceMatch = line.match(/\*\*HOJE:\*\*\s*(.*)/i);
        if (priceMatch) {
          price = priceMatch[1].trim();
          continue;
        }

        if (line.trim()) {
          paragraphs.push(line.trim());
        }
      }
    }
  }

  return { items, total, price, guarantee, paragraphs };
}

/**
 * Parse CTA Final section: extract text and CTA button.
 */
function parseCTATokens(tokens) {
  let description = '';
  let cta = '';
  let ps = '';

  for (const token of tokens) {
    if (token.type === 'paragraph') {
      // Bold-only line = CTA button text
      const ctaMatch = token.raw.match(/^\*\*([^*]+)\*\*\s*$/m);
      // PS. line
      const psMatch = token.raw.match(/^PS\.\s*(.+)/im);

      if (psMatch) {
        ps = psMatch[1].trim();
      } else if (ctaMatch) {
        cta = ctaMatch[1].trim();
      } else if (token.text.trim()) {
        description += (description ? ' ' : '') + token.text.trim();
      }
    }
  }

  return { description, cta, ps };
}

/**
 * Parse FAQ section: extract Q&A pairs from H3 + paragraph patterns.
 */
function parseFAQTokens(tokens) {
  const items = [];
  let currentQuestion = null;

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 3) {
      if (currentQuestion) items.push(currentQuestion);
      currentQuestion = { question: token.text, answer: '' };
      continue;
    }

    if (currentQuestion && token.type === 'paragraph') {
      currentQuestion.answer += (currentQuestion.answer ? '\n' : '') + token.text;
      continue;
    }
  }

  if (currentQuestion) items.push(currentQuestion);

  return { items };
}

/**
 * Parse generic section tokens as basic blocks.
 */
function parseGenericTokens(tokens) {
  const blocks = [];
  for (const token of tokens) {
    if (token.type === 'paragraph') {
      blocks.push({ type: 'paragraph', html: marked.parser([token]) });
    }
    if (token.type === 'heading') {
      blocks.push({ type: 'heading', text: token.text, depth: token.depth });
    }
    if (token.type === 'list') {
      blocks.push({ type: 'list', items: token.items.map(i => i.text), ordered: token.ordered });
    }
    if (token.type === 'blockquote') {
      blocks.push({ type: 'callout', html: marked.parser([token]) });
    }
  }
  return blocks;
}

// --- Helper functions ---

/**
 * Parse a bold-prefixed item: "**Title** — Description" → { title, description }
 */
function parseBoldItem(text) {
  const match = text.match(/^\*\*([^*]+)\*\*\s*[—–-]\s*(.*)/);
  if (match) return { title: match[1], description: match[2] };

  const boldOnly = text.match(/^\*\*([^*]+)\*\*\s*(.*)/);
  if (boldOnly) return { title: boldOnly[1], description: boldOnly[2] };

  return { title: text, description: '' };
}

/**
 * Parse offer item: "Item Name — Valor: R$X.XXX" → { name, value }
 */
function parseOfferItem(text) {
  const match = text.match(/^(.+?)\s*[—–-]\s*[Vv]alor:\s*(R?\$[\d.,]+)/);
  if (match) return { name: match[1].replace(/\*\*/g, '').trim(), value: match[2] };

  return { name: text.replace(/\*\*/g, '').trim(), value: '' };
}

/**
 * Parse blockquote testimonial: "Quote" — Author, Role
 */
function parseTestimonial(token) {
  const raw = token.raw.replace(/^>\s*/gm, '').trim();
  // Pattern: "Quote" — Author, Role   OR   "Quote" - Author
  const match = raw.match(/^"(.+?)"\s*[—–-]\s*(.+)/s);
  if (match) {
    const quote = match[1].trim();
    const authorParts = match[2].split(',').map(s => s.trim());
    return {
      quote,
      author: authorParts[0] || '',
      role: authorParts.slice(1).join(', ') || '',
    };
  }
  return { quote: raw.replace(/^"|"$/g, ''), author: '', role: '' };
}

/**
 * Validate that a parsed LP has the essential sections.
 * Returns { valid: boolean, missing: string[], found: string[] }
 */
export function validateLPStructure(parsed) {
  const essentialTypes = ['hero', 'problem', 'solution', 'offer', 'cta'];
  const found = parsed.sections.map(s => s.type);
  const missing = essentialTypes.filter(t => !found.includes(t));

  return {
    valid: missing.length === 0,
    missing,
    found,
    sectionCount: parsed.sections.length,
  };
}
