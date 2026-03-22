/**
 * GSAP HTML builder for Landing Pages.
 * Generates a complete single-file HTML with Tailwind CDN + GSAP CDN.
 * Uses LP-specific section builders (hero, problem, solution, proof, offer, CTA, FAQ).
 */

import { escapeHTML, formatInline, formatCoverTitle } from '../../md-to-branded-pdf/lib/html-utils.mjs';
import { brandToTailwindConfig, brandToShadcnVars } from '../../md-to-branded-pdf/lib/color-mapper.mjs';
import { getLPCSS } from '../templates/lp-styles.mjs';
import { getLPScripts } from '../templates/lp-scripts.mjs';

/**
 * Build a complete GSAP-powered Landing Page HTML.
 * @param {{ cover: object, sections: object[] }} parsed - Output from lp-parser
 * @param {object} brand - Brand config from brand-loader
 * @param {object} effectsConfig - LP effects flags from lp-effects.mjs
 * @returns {{ html: string }} Single complete HTML document
 */
export function buildLPGSAPSite(parsed, brand, effectsConfig) {
  const tailwindConfig = brandToTailwindConfig(brand);
  const initialTheme = brand.theme || 'dark';
  const shadcnVars = brandToShadcnVars(brand, initialTheme);
  const css = getLPCSS(shadcnVars);
  const scripts = getLPScripts(effectsConfig);

  const fontLink = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(brand.font)}:wght@400;500;600;700;800&display=swap`;

  const navHTML = buildNav(brand, parsed);
  const heroHTML = buildHeroSection(parsed.cover, parsed.sections, brand, effectsConfig);
  const sectionsHTML = parsed.sections
    .filter(s => s.type !== 'hero') // hero is rendered separately
    .map(s => buildLPSection(s, effectsConfig))
    .join('\n');
  const footerHTML = buildFooter(brand);
  const stickyCtaHTML = effectsConfig.stickyCTA ? buildStickyCTA(parsed) : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR" data-theme="${initialTheme}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(parsed.cover.title)} | ${escapeHTML(brand.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontLink}" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"><\/script>
<script>
tailwind.config = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: ${JSON.stringify(tailwindConfig, null, 2)}
  }
}
<\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"><\/script>
<style>
${css}
</style>
</head>
<body class="bg-background text-foreground">
${navHTML}
${heroHTML}
${sectionsHTML}
${footerHTML}
${stickyCtaHTML}
<script>
${scripts}
<\/script>
</body>
</html>`;

  return { html };
}

// ---- Section Builders ----

function buildNav(brand, parsed) {
  // Find hero CTA or final CTA text
  const heroSection = parsed.sections.find(s => s.type === 'hero');
  const ctaText = heroSection?.cta || parsed.cover.cta || 'Começar';

  return `
<nav class="lp-nav">
  <div class="lp-nav-inner">
    <a href="#" class="lp-nav-brand">${escapeHTML(brand.name)}</a>
    <div style="display:flex;align-items:center;gap:1rem;">
      <a href="#lp-cta-final" class="lp-nav-cta">${escapeHTML(ctaText)}</a>
      <button id="theme-toggle" class="lp-nav-toggle" aria-label="Toggle theme">
        <span>🌙</span>
      </button>
    </div>
  </div>
</nav>`;
}

function buildHeroSection(cover, sections, brand, effectsConfig) {
  const heroSection = sections.find(s => s.type === 'hero');
  const ctaText = heroSection?.cta || cover.cta || '';
  const description = heroSection?.description || cover.subtitle || '';

  const badge = cover.badge
    ? `<div class="lp-badge" data-gsap="fade-up">${escapeHTML(cover.badge)}</div>`
    : '';

  const titleHTML = formatCoverTitle(cover.title);

  const subtitleHTML = description
    ? `<p class="subtitle" data-gsap="fade-up">${formatInline(description)}</p>`
    : '';

  const ctaHTML = ctaText
    ? `<a href="#lp-cta-final" class="lp-cta-btn" data-gsap="fade-up">${escapeHTML(ctaText)}</a>`
    : '';

  const gradientBg = brand.cover && brand.cover.gradient_primary && brand.cover.gradient_secondary
    ? `background: linear-gradient(135deg, ${brand.cover.gradient_primary} 0%, ${brand.cover.gradient_secondary} 100%);`
    : `background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);`;

  return `
<header class="lp-hero" id="lp-hero">
  <div class="lp-hero-bg" style="${gradientBg}"></div>
  <div class="lp-hero-content">
    ${badge}
    <h1 data-gsap="fade-up">${titleHTML}</h1>
    ${subtitleHTML}
    ${ctaHTML}
  </div>
</header>`;
}

function buildLPSection(section, effectsConfig) {
  switch (section.type) {
    case 'problem': return buildProblemSection(section, effectsConfig);
    case 'solution': return buildSolutionSection(section, effectsConfig);
    case 'proof': return buildProofSection(section, effectsConfig);
    case 'offer': return buildOfferSection(section, effectsConfig);
    case 'cta': return buildCTASection(section, effectsConfig);
    case 'faq': return buildFAQSection(section, effectsConfig);
    default: return buildGenericSection(section, effectsConfig);
  }
}

function buildProblemSection(section, effectsConfig) {
  const paragraphs = (section.paragraphs || [])
    .map(p => `<p data-gsap="fade-up">${formatInline(p)}</p>`)
    .join('\n      ');

  const staggerAttr = effectsConfig.staggeredCards ? ' data-gsap="stagger"' : '';
  const painCards = (section.pains || [])
    .map(pain => `
      <div class="lp-pain-card">
        <div class="pain-icon">❌</div>
        <p>${formatInline(pain)}</p>
      </div>`)
    .join('');

  return `
<div class="lp-section" id="lp-problem">
  <div class="lp-section-header" data-gsap="fade-up">
    <h2>${escapeHTML(section.title)}</h2>
  </div>
  ${paragraphs ? `<div style="text-align:center;margin-bottom:2rem;">${paragraphs}</div>` : ''}
  <div class="lp-pain-cards"${staggerAttr}>
    ${painCards}
  </div>
</div>`;
}

function buildSolutionSection(section, effectsConfig) {
  const paragraphs = (section.paragraphs || [])
    .map(p => `<p data-gsap="fade-up">${formatInline(p)}</p>`)
    .join('\n      ');

  const staggerAttr = effectsConfig.staggeredCards ? ' data-gsap="stagger"' : '';
  const benefitCards = (section.benefits || [])
    .map(b => `
      <div class="lp-benefit-card">
        <div class="benefit-title">✅ ${escapeHTML(b.title)}</div>
        ${b.description ? `<div class="benefit-desc">${formatInline(b.description)}</div>` : ''}
      </div>`)
    .join('');

  return `
<div class="lp-section" id="lp-solution">
  <div class="lp-section-header" data-gsap="fade-up">
    <h2>${escapeHTML(section.title)}</h2>
  </div>
  ${paragraphs ? `<div style="text-align:center;margin-bottom:2rem;">${paragraphs}</div>` : ''}
  <div class="lp-benefits"${staggerAttr}>
    ${benefitCards}
  </div>
</div>`;
}

function buildProofSection(section, effectsConfig) {
  const paragraphs = (section.paragraphs || [])
    .map(p => `<p data-gsap="fade-up" style="text-align:center;color:hsl(var(--muted-foreground));">${formatInline(p)}</p>`)
    .join('\n  ');

  // Testimonials carousel
  const testimonials = section.testimonials || [];
  let testimonialsHTML = '';
  if (testimonials.length > 0) {
    const cards = testimonials.map(t => `
        <div class="lp-testimonial-card">
          <blockquote>"${escapeHTML(t.quote)}"</blockquote>
          <div>
            <div class="lp-testimonial-author">${escapeHTML(t.author)}</div>
            ${t.role ? `<div class="lp-testimonial-role">${escapeHTML(t.role)}</div>` : ''}
          </div>
        </div>`).join('');

    const isMobile = false; // server-side, let JS handle
    const slidesPerView = 2;
    const totalSlides = Math.ceil(testimonials.length / slidesPerView);
    const dots = Array.from({ length: totalSlides }, (_, i) =>
      `<button class="lp-carousel-dot${i === 0 ? ' active' : ''}" aria-label="Slide ${i + 1}"></button>`
    ).join('');

    testimonialsHTML = `
  <div class="lp-testimonials" data-gsap="fade-up">
    <div class="lp-testimonials-track" style="width:${totalSlides * 100}%;">
      ${cards}
    </div>
    <div class="lp-carousel-dots">
      ${dots}
    </div>
  </div>`;
  }

  // Stats
  const stats = section.stats || [];
  let statsHTML = '';
  if (stats.length > 0) {
    const staggerAttr = effectsConfig.staggeredCards ? ' data-gsap="stagger"' : '';
    const statCards = stats.map(s => {
      const counterAttr = effectsConfig.animatedCounters && /^\d/.test(s.value)
        ? ` data-counter="${escapeHTML(s.value)}"`
        : '';
      return `
        <div class="lp-stat">
          <div class="lp-stat-value"${counterAttr}>${escapeHTML(s.value)}</div>
          <div class="lp-stat-label">${escapeHTML(s.label)}</div>
        </div>`;
    }).join('');

    statsHTML = `
  <div class="lp-stats"${staggerAttr}>
    ${statCards}
  </div>`;
  }

  return `
<div class="lp-section" id="lp-proof">
  <div class="lp-section-header" data-gsap="fade-up">
    <h2>${escapeHTML(section.title)}</h2>
  </div>
  ${paragraphs}
  ${testimonialsHTML}
  ${statsHTML}
</div>`;
}

function buildOfferSection(section, effectsConfig) {
  const offerItems = (section.items || [])
    .map(item => `
        <li>
          <span class="item-name">✅ ${escapeHTML(item.name)}</span>
          ${item.value ? `<span class="item-value">${escapeHTML(item.value)}</span>` : ''}
        </li>`)
    .join('');

  const totalHTML = section.total
    ? `<div class="original-price">${escapeHTML(section.total)}</div>`
    : '';

  const priceHTML = section.price
    ? `<div class="current-price">${escapeHTML(section.price)}</div>`
    : '';

  const guaranteeHTML = section.guarantee
    ? `
  <div class="lp-guarantee" data-gsap="fade-up">
    <div class="lp-guarantee-icon">🛡️</div>
    <div>
      <strong style="color:hsl(var(--foreground));">Garantia</strong>
      <p>${formatInline(section.guarantee)}</p>
    </div>
  </div>`
    : '';

  // Find CTA text from the parsed data
  const ctaText = 'Quero Começar Agora →';

  return `
<div class="lp-section" id="lp-offer">
  <div class="lp-section-header" data-gsap="fade-up">
    <h2>${escapeHTML(section.title)}</h2>
  </div>
  <div class="lp-offer-card" data-gsap="fade-up"${effectsConfig.glassmorphism ? ' data-glass' : ''}>
    <ul class="lp-offer-items">
      ${offerItems}
    </ul>
    <div class="lp-offer-total">
      ${totalHTML}
      ${priceHTML}
    </div>
    <div style="text-align:center;margin-top:1.5rem;">
      <a href="#lp-cta-final" class="lp-cta-btn">${escapeHTML(ctaText)}</a>
    </div>
  </div>
  ${guaranteeHTML}
</div>`;
}

function buildCTASection(section, effectsConfig) {
  const ctaText = section.cta || 'Quero Começar Agora →';
  const psHTML = section.ps
    ? `<p class="ps-text">PS. ${formatInline(section.ps)}</p>`
    : '';

  return `
<div class="lp-section" id="lp-cta-final">
  <div class="lp-cta-section" data-gsap="fade-up">
    ${section.description ? `<p style="font-size:1.25rem;color:hsl(var(--muted-foreground));margin-bottom:2rem;">${formatInline(section.description)}</p>` : ''}
    <a href="#" class="lp-cta-btn">${escapeHTML(ctaText)}</a>
    ${psHTML}
  </div>
</div>`;
}

function buildFAQSection(section, effectsConfig) {
  const faqItems = (section.items || [])
    .map(item => `
      <div class="lp-faq-item">
        <button class="lp-faq-question">
          <span>${escapeHTML(item.question)}</span>
          <span class="lp-faq-icon">+</span>
        </button>
        <div class="lp-faq-answer">${formatInline(item.answer)}</div>
      </div>`)
    .join('');

  return `
<div class="lp-section" id="lp-faq">
  <div class="lp-section-header" data-gsap="fade-up">
    <h2>${escapeHTML(section.title)}</h2>
  </div>
  <div class="lp-faq" data-gsap="fade-up">
    ${faqItems}
  </div>
</div>`;
}

function buildGenericSection(section, effectsConfig) {
  const blocks = (section.blocks || [])
    .map(block => {
      if (block.type === 'paragraph') return `<div data-gsap="fade-up">${block.html}</div>`;
      if (block.type === 'heading') return `<h3 data-gsap="fade-up">${escapeHTML(block.text)}</h3>`;
      if (block.type === 'list') {
        const tag = block.ordered ? 'ol' : 'ul';
        const items = block.items.map(i => `<li>${formatInline(i)}</li>`).join('\n');
        return `<${tag} data-gsap="fade-up">${items}</${tag}>`;
      }
      if (block.type === 'callout') return `<div class="lp-guarantee" data-gsap="fade-up">${block.html}</div>`;
      return '';
    })
    .join('\n  ');

  return `
<div class="lp-section">
  <div class="lp-section-header" data-gsap="fade-up">
    <h2>${escapeHTML(section.title)}</h2>
  </div>
  ${blocks}
</div>`;
}

function buildFooter(brand) {
  return `
<footer class="lp-footer">
  <p><strong style="color:hsl(var(--foreground));">${escapeHTML(brand.name)}</strong></p>
  <p style="font-size:0.875rem;margin-top:0.5rem;">Powered by AIOS md-to-landing-page</p>
</footer>`;
}

function buildStickyCTA(parsed) {
  const offerSection = parsed.sections.find(s => s.type === 'offer');
  const price = offerSection?.price || '';
  const heroSection = parsed.sections.find(s => s.type === 'hero');
  const ctaText = heroSection?.cta || parsed.cover.cta || 'Começar Agora';

  return `
<div class="lp-sticky-cta">
  ${price ? `<span class="sticky-price">${escapeHTML(price)}</span>` : ''}
  <a href="#lp-cta-final" class="lp-cta-btn">${escapeHTML(ctaText)}</a>
</div>`;
}
