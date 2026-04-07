/**
 * CSS for Landing Page components in GSAP mode.
 * Includes hero CTA, pain cards, testimonials, pricing, FAQ accordion, sticky CTA bar.
 */

/**
 * Get LP-specific CSS string.
 * @param {string} shadcnVars - CSS custom properties from brandToShadcnVars
 * @returns {string} Complete CSS string
 */
export function getLPCSS(shadcnVars) {
  return `
/* shadcn CSS variables */
:root {
${shadcnVars}
}

/* Light theme overrides — inherits brand primary from :root */
[data-theme="light"] {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 210 20% 98%;
  --card-foreground: 240 10% 3.9%;
  /* --primary is NOT overridden here — it inherits from :root (brand color) */
  --primary-foreground: 0 0% 98%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --border: 240 5.9% 90%;
  /* --ring inherits from :root primary */
}

/* ---- Base ---- */
html { scroll-behavior: smooth; }

* { box-sizing: border-box; }

body {
  font-family: var(--font-body, 'Inter', system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.01em;
  position: relative;
}

/* Subtle grain texture overlay — adds depth */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

::selection {
  background: hsl(var(--primary) / 0.2);
  color: hsl(var(--foreground));
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.5); }

/* ---- Hero Section ---- */
.lp-hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.lp-hero-bg {
  position: absolute;
  inset: 0;
  opacity: 0.12;
}

/* Aurora mesh gradient — animated shader-like effect */
@keyframes auroraShift {
  0% { transform: translate(0%, 0%) rotate(0deg) scale(1); }
  25% { transform: translate(5%, -5%) rotate(45deg) scale(1.1); }
  50% { transform: translate(-3%, 8%) rotate(90deg) scale(0.95); }
  75% { transform: translate(7%, 3%) rotate(135deg) scale(1.05); }
  100% { transform: translate(0%, 0%) rotate(0deg) scale(1); }
}

@keyframes auroraShift2 {
  0% { transform: translate(0%, 0%) rotate(0deg) scale(1.1); }
  33% { transform: translate(-8%, 5%) rotate(-60deg) scale(0.9); }
  66% { transform: translate(5%, -8%) rotate(60deg) scale(1.15); }
  100% { transform: translate(0%, 0%) rotate(0deg) scale(1.1); }
}

@keyframes auroraShift3 {
  0% { transform: translate(0%, 0%) rotate(0deg) scale(0.9); }
  50% { transform: translate(10%, -3%) rotate(120deg) scale(1.1); }
  100% { transform: translate(0%, 0%) rotate(0deg) scale(0.9); }
}

.lp-hero-aurora {
  position: absolute;
  inset: -50%;
  z-index: 1;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.35;
}

.lp-hero-aurora::before,
.lp-hero-aurora::after,
.lp-hero-aurora .aurora-blob {
  content: '';
  position: absolute;
  border-radius: 50%;
}

.lp-hero-aurora::before {
  width: 60%;
  height: 60%;
  top: 10%;
  left: 15%;
  background: radial-gradient(ellipse, hsl(var(--primary)) 0%, transparent 70%);
  animation: auroraShift 12s ease-in-out infinite;
}

.lp-hero-aurora::after {
  width: 50%;
  height: 50%;
  bottom: 10%;
  right: 10%;
  background: radial-gradient(ellipse, hsl(var(--accent)) 0%, transparent 70%);
  animation: auroraShift2 15s ease-in-out infinite;
}

.lp-hero-aurora .aurora-blob {
  width: 40%;
  height: 40%;
  top: 30%;
  left: 40%;
  background: radial-gradient(ellipse, hsl(var(--primary-light, var(--primary)) / 0.8) 0%, transparent 70%);
  animation: auroraShift3 10s ease-in-out infinite;
}

.lp-hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
}

.lp-hero h1 {
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 1.25rem;
}

.lp-hero .subtitle {
  font-size: 1.125rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.75rem;
  max-width: 540px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* CTA Button */
.lp-cta-btn {
  display: inline-block;
  padding: 0.875rem 2.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.1);
}

.lp-cta-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.1);
  filter: brightness(1.05);
}

/* CTA Pulse animation */
@keyframes ctaPulse {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
  50% { box-shadow: 0 0 0 12px hsl(var(--primary) / 0); }
}

.cta-pulse {
  animation: ctaPulse 2s ease-in-out infinite;
}

/* Badge */
.lp-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08);
  border: 1px solid hsl(var(--primary) / 0.12);
  border-radius: 9999px;
  margin-bottom: 1.25rem;
  letter-spacing: 0.01em;
}

/* ---- Problem Section ---- */
.lp-pain-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.lp-pain-card {
  padding: 1.25rem;
  background: hsl(var(--card) / 0.6);
  border: 1px solid hsl(var(--border) / 0.6);
  border-radius: 0.75rem;
  transition: border-color 0.2s ease;
}

.lp-pain-card:hover {
  border-color: hsl(var(--border));
}

.lp-pain-card .pain-icon {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.lp-pain-card p {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  font-size: 0.9375rem;
}

/* ---- Solution Section ---- */
.lp-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.lp-benefit-card {
  padding: 1.25rem;
  background: hsl(var(--card) / 0.6);
  border: 1px solid hsl(var(--border) / 0.6);
  border-radius: 0.75rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.lp-benefit-card:hover {
  border-color: hsl(var(--primary) / 0.3);
  box-shadow: 0 2px 12px hsl(var(--primary) / 0.06);
}

.lp-benefit-card .benefit-title {
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 0.375rem;
  font-size: 0.9375rem;
}

.lp-benefit-card .benefit-desc {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  font-size: 0.875rem;
}

/* ---- Testimonials ---- */
.lp-testimonials {
  position: relative;
  overflow: hidden;
  margin: 1.5rem 0;
}

.lp-testimonials-track {
  display: flex;
  gap: 1rem;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.lp-testimonial-card {
  flex: 0 0 100%;
  max-width: 100%;
  padding: 1.5rem;
  background: hsl(var(--card) / 0.5);
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: 0.75rem;
}

@media (min-width: 768px) {
  .lp-testimonial-card {
    flex: 0 0 calc(50% - 0.75rem);
    max-width: calc(50% - 0.75rem);
  }
}

.lp-testimonial-card blockquote {
  font-size: 0.9375rem;
  font-style: normal;
  color: hsl(var(--foreground) / 0.85);
  line-height: 1.65;
  margin-bottom: 0.75rem;
  position: relative;
  padding-left: 1rem;
  border-left: 2px solid hsl(var(--primary) / 0.4);
}

.lp-testimonial-author {
  font-weight: 600;
  color: hsl(var(--foreground));
}

.lp-testimonial-role {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}

/* Carousel navigation dots */
.lp-carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.lp-carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: hsl(var(--border));
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.lp-carousel-dot.active {
  background: hsl(var(--primary));
}

/* Stats grid */
.lp-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.lp-stat {
  text-align: center;
  padding: 1.25rem 1rem;
  background: transparent;
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: 0.75rem;
}

.lp-stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  line-height: 1;
  margin-bottom: 0.375rem;
  letter-spacing: -0.02em;
}

.lp-stat-label {
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
}

/* ---- Offer / Pricing ---- */
.lp-offer-card {
  max-width: 560px;
  margin: 1.5rem auto;
  padding: 2rem;
  background: hsl(var(--card) / 0.6);
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  position: relative;
  overflow: hidden;
}

.lp-offer-items {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
}

.lp-offer-items li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}

.lp-offer-items li .item-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lp-offer-items li .item-value {
  color: hsl(var(--muted-foreground));
  text-decoration: line-through;
  font-size: 0.875rem;
}

.lp-offer-total {
  text-align: center;
  padding: 1rem 0;
  border-top: 2px solid hsl(var(--border));
}

.lp-offer-total .original-price {
  font-size: 1.25rem;
  color: hsl(var(--muted-foreground));
  text-decoration: line-through;
}

.lp-offer-total .current-price {
  font-size: 2.5rem;
  font-weight: 800;
  color: hsl(var(--primary));
  display: block;
  margin-top: 0.5rem;
}

/* ---- Pricing Grid (multi-tier) ---- */
.lp-pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
  align-items: stretch;
}

.lp-tier-card {
  display: flex;
  flex-direction: column;
  padding: 1.75rem;
  background: hsl(var(--card) / 0.5);
  border: 1px solid hsl(var(--border) / 0.6);
  border-radius: 0.75rem;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.lp-tier-card:hover {
  transform: translateY(-2px);
  border-color: hsl(var(--border));
  box-shadow: 0 8px 30px hsl(0 0% 0% / 0.08);
}

.lp-tier-highlighted {
  border-color: hsl(var(--primary) / 0.4);
  background: hsl(var(--card) / 0.8);
  box-shadow: 0 0 0 1px hsl(var(--primary) / 0.15), 0 8px 30px hsl(var(--primary) / 0.08);
  scale: 1.02;
}

.lp-tier-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-radius: 9999px;
  margin-bottom: 1rem;
  width: fit-content;
}

.lp-tier-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.75rem;
}

.lp-tier-price {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.lp-tier-price .current-price {
  font-size: 2rem;
  font-weight: 800;
  color: hsl(var(--primary));
  line-height: 1.2;
}

.lp-tier-price .original-price {
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
  text-decoration: line-through;
  margin-bottom: 0.25rem;
}

.lp-tier-items {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.lp-tier-items li {
  padding: 0.5rem 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.9375rem;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}

.lp-tier-items li:last-child {
  border-bottom: none;
}

/* Pricing glow effect */
@keyframes pricingGlow {
  0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.1); }
  50% { box-shadow: 0 0 40px hsl(var(--primary) / 0.25); }
}

.pricing-glow:hover,
.lp-tier-highlighted:hover {
  animation: pricingGlow 2s ease-in-out infinite;
}

/* Guarantee badge */
.lp-guarantee {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  margin: 1.5rem auto;
  max-width: 560px;
  background: hsl(var(--card) / 0.4);
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: 0.625rem;
}

.lp-guarantee-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.lp-guarantee p {
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
  font-size: 0.875rem;
}

/* ---- FAQ Accordion ---- */
.lp-faq {
  max-width: 700px;
  margin: 2rem auto;
}

.lp-faq-item {
  border-bottom: 1px solid hsl(var(--border));
}

.lp-faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 1.0625rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.lp-faq-question:hover {
  color: hsl(var(--primary));
}

.lp-faq-icon {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
  color: hsl(var(--muted-foreground));
}

.lp-faq-item.open .lp-faq-icon {
  transform: rotate(45deg);
}

.lp-faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  color: hsl(var(--muted-foreground));
  line-height: 1.7;
}

.lp-faq-item.open .lp-faq-answer {
  max-height: 500px;
  padding-bottom: 1.25rem;
}

/* ---- CTA Final Section ---- */
.lp-cta-section {
  text-align: center;
  padding: 2.5rem 2rem;
  margin: 1.5rem 0;
  background: hsl(var(--card) / 0.4);
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: 0.75rem;
}

.lp-cta-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.lp-cta-section .ps-text {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

/* ---- Sticky CTA Bar ---- */
.lp-sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  padding: 0.75rem 2rem;
  background: hsl(var(--card) / 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.lp-sticky-cta.visible {
  transform: translateY(0);
}

.lp-sticky-cta .sticky-price {
  font-weight: 700;
  color: hsl(var(--primary));
  font-size: 1.125rem;
}

.lp-sticky-cta .lp-cta-btn {
  padding: 0.625rem 2rem;
  font-size: 0.9375rem;
}

/* ---- Section common ---- */
.lp-section {
  max-width: 880px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
}

.lp-section + .lp-section {
  padding-top: 1rem;
}

.lp-section-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.lp-section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.lp-section-header p {
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Nav */
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: hsl(var(--background) / 0.8);
  border-bottom: 1px solid hsl(var(--border));
}

.lp-nav-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lp-nav-brand {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-decoration: none;
  letter-spacing: -0.01em;
}

.lp-nav-cta {
  padding: 0.4375rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border: none;
  border-radius: 0.375rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lp-nav-cta:hover {
  filter: brightness(1.05);
}

.lp-nav-toggle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.125rem;
}

/* Footer */
.lp-footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid hsl(var(--border) / 0.5);
  color: hsl(var(--muted-foreground));
  font-size: 0.8125rem;
}

/* ---- Mini Social Proof (near CTAs) ---- */
.lp-mini-proof {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.mini-proof-stat strong {
  color: hsl(var(--primary));
  font-weight: 700;
}

.mini-proof-sep {
  opacity: 0.4;
}

.mini-proof-quote {
  font-style: italic;
  max-width: 400px;
  text-align: center;
}

.mini-proof-author {
  font-weight: 600;
  color: hsl(var(--foreground) / 0.7);
}

/* ---- Gradient text ---- */
.gradient-text {
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ---- Glassmorphism ---- */
.glass-card {
  background: hsl(var(--card) / 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid hsl(var(--border) / 0.5);
  box-shadow: 0 8px 32px hsl(var(--primary) / 0.05);
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .lp-hero h1 { font-size: 2rem; }
  .lp-pain-cards,
  .lp-benefits,
  .lp-pricing-grid { grid-template-columns: 1fr; }
  .lp-tier-highlighted { scale: 1; }
  .lp-stats { grid-template-columns: repeat(2, 1fr); }
  .lp-testimonial-card { flex: 0 0 100%; max-width: 100%; }
  .lp-offer-card { margin: 2rem 1rem; padding: 1.5rem; }
}

/* ---- Print ---- */
@media print {
  .lp-nav, .lp-sticky-cta { display: none !important; }
  body { background: white; color: black; }
}

/* ---- Focus ring (a11y) ---- */
.lp-cta-btn:focus-visible,
.lp-nav-cta:focus-visible,
.lp-faq-question:focus-visible,
.lp-carousel-dot:focus-visible,
.lp-nav-toggle:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* ---- Reduced motion ---- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;
}
