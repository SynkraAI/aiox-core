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

/* Light theme overrides */
[data-theme="light"] {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --primary: 259 69% 56%;
  --primary-light: 259 69% 70%;
  --primary-foreground: 0 0% 98%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --border: 240 5.9% 90%;
  --ring: 259 69% 56%;
}

/* ---- Base ---- */
html { scroll-behavior: smooth; }

::selection {
  background: hsl(var(--primary) / 0.3);
  color: hsl(var(--foreground));
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: hsl(var(--background)); }
::-webkit-scrollbar-thumb { background: hsl(var(--primary) / 0.5); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary)); }

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

.lp-hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.lp-hero h1 {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.lp-hero .subtitle {
  font-size: 1.25rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* CTA Button */
.lp-cta-btn {
  display: inline-block;
  padding: 1rem 3rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.lp-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px hsl(var(--primary) / 0.4);
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
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  border: 1px solid hsl(var(--primary) / 0.2);
  border-radius: 9999px;
  margin-bottom: 1.5rem;
}

/* ---- Problem Section ---- */
.lp-pain-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.lp-pain-card {
  padding: 1.5rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  border-left: 4px solid #ef4444;
}

.lp-pain-card .pain-icon {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.lp-pain-card p {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
}

/* ---- Solution Section ---- */
.lp-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.lp-benefit-card {
  padding: 1.5rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  border-left: 4px solid hsl(var(--primary));
}

.lp-benefit-card .benefit-title {
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.lp-benefit-card .benefit-desc {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
}

/* ---- Testimonials ---- */
.lp-testimonials {
  position: relative;
  overflow: hidden;
  margin: 2rem 0;
}

.lp-testimonials-track {
  display: flex;
  gap: 1.5rem;
  transition: transform 0.5s ease;
}

.lp-testimonial-card {
  flex: 0 0 100%;
  max-width: 100%;
  padding: 2rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
}

@media (min-width: 768px) {
  .lp-testimonial-card {
    flex: 0 0 calc(50% - 0.75rem);
    max-width: calc(50% - 0.75rem);
  }
}

.lp-testimonial-card blockquote {
  font-size: 1.125rem;
  font-style: italic;
  color: hsl(var(--foreground));
  line-height: 1.7;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 1.5rem;
  border-left: 3px solid hsl(var(--primary));
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.lp-stat {
  text-align: center;
  padding: 1.5rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
}

.lp-stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: hsl(var(--primary));
  line-height: 1;
  margin-bottom: 0.5rem;
}

.lp-stat-label {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

/* ---- Offer / Pricing ---- */
.lp-offer-card {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: hsl(var(--card));
  border: 2px solid hsl(var(--primary) / 0.3);
  border-radius: 1rem;
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

/* Pricing glow effect */
@keyframes pricingGlow {
  0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.1); }
  50% { box-shadow: 0 0 40px hsl(var(--primary) / 0.25); }
}

.pricing-glow:hover {
  animation: pricingGlow 2s ease-in-out infinite;
}

/* Guarantee badge */
.lp-guarantee {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  margin: 2rem auto;
  max-width: 600px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
}

.lp-guarantee-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.lp-guarantee p {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
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
  padding: 4rem 2rem;
  margin: 4rem 0;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 1rem;
}

.lp-cta-section h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
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
  max-width: 900px;
  margin: 0 auto;
  padding: 5rem 2rem;
}

.lp-section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.lp-section-header h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: hsl(var(--foreground));
  margin-bottom: 1rem;
}

.lp-section-header p {
  font-size: 1.125rem;
  color: hsl(var(--muted-foreground));
  max-width: 600px;
  margin: 0 auto;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lp-nav-brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  text-decoration: none;
}

.lp-nav-cta {
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border: none;
  border-radius: 0.5rem;
  text-decoration: none;
  cursor: pointer;
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
  padding: 3rem 2rem;
  border-top: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
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
  .lp-benefits { grid-template-columns: 1fr; }
  .lp-stats { grid-template-columns: repeat(2, 1fr); }
  .lp-testimonial-card { flex: 0 0 100%; max-width: 100%; }
  .lp-offer-card { margin: 2rem 1rem; padding: 1.5rem; }
}

/* ---- Print ---- */
@media print {
  .lp-nav, .lp-sticky-cta { display: none !important; }
  body { background: white; color: black; }
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
