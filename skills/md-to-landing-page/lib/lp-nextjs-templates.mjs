/**
 * TSX template generators for Landing Page Next.js project.
 * Each function returns a string (file content) for a specific component.
 */

// Re-export shared templates from base skill
export {
  getLayout,
  getProviders,
  getGlobalCSS,
  getNavComponent as getBaseNavComponent,
  getAnimatedCounter,
  getTailwindConfig,
  getNextConfig,
  getTsConfig,
  getPostcssConfig,
  getUtils,
} from '../../md-to-branded-pdf/lib/nextjs-templates.mjs';

/**
 * Generate app/page.tsx for Landing Page with LP-specific components.
 */
export function getLPPage(parsed, brand, effectsConfig) {
  const sectionsData = JSON.stringify(parsed.sections, null, 2);

  return `import { LPHero } from '@/components/lp-hero'
import { LPProblem } from '@/components/lp-problem'
import { LPSolution } from '@/components/lp-solution'
import { LPProof } from '@/components/lp-proof'
import { LPOffer } from '@/components/lp-offer'
import { LPCTA } from '@/components/lp-cta'
import { LPFAQ } from '@/components/lp-faq'
import { LPNav } from '@/components/lp-nav'
import { LPFooter } from '@/components/lp-footer'
${effectsConfig.stickyCTA ? "import { LPStickyCTA } from '@/components/lp-sticky-cta'" : ''}

const BRAND_NAME = ${JSON.stringify(brand.name)};

const COVER = ${JSON.stringify(parsed.cover, null, 2)};

const SECTIONS = ${sectionsData};

function getSectionByType(type: string) {
  return SECTIONS.find((s: any) => s.type === type);
}

export default function Home() {
  const hero = getSectionByType('hero');
  const problem = getSectionByType('problem');
  const solution = getSectionByType('solution');
  const proof = getSectionByType('proof');
  const offer = getSectionByType('offer');
  const cta = getSectionByType('cta');
  const faq = getSectionByType('faq');

  return (
    <main className="min-h-screen">
      <LPNav brandName={BRAND_NAME} ctaText={hero?.cta || COVER.cta || 'Começar'} />
      <LPHero cover={COVER} hero={hero} brandName={BRAND_NAME} />
      {problem && <LPProblem section={problem} />}
      {solution && <LPSolution section={solution} />}
      {proof && <LPProof section={proof} />}
      {offer && <LPOffer section={offer} />}
      {cta && <LPCTA section={cta} />}
      {faq && <LPFAQ section={faq} />}
      <LPFooter brandName={BRAND_NAME} />
      ${effectsConfig.stickyCTA ? '{offer && <LPStickyCTA price={offer.price} ctaText={hero?.cta || COVER.cta || "Começar Agora"} />}' : ''}
    </main>
  )
}
`;
}

/**
 * Generate components/lp-nav.tsx
 */
export function getLPNavComponent() {
  return `'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LPNavProps {
  brandName: string
  ctaText: string
}

export function LPNav({ brandName, ctaText }: LPNavProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-xl font-bold">{brandName}</a>
        <div className="flex items-center gap-4">
          <a
            href="#lp-cta-final"
            className="hidden sm:inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {ctaText}
          </a>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
`;
}

/**
 * Generate components/lp-hero.tsx
 */
export function getLPHeroComponent(effectsConfig) {
  const useMotion = effectsConfig.textReveal || effectsConfig.staggeredCards;
  const motionImport = useMotion ? "import { motion } from 'framer-motion'\n" : '';

  return `'use client'

${motionImport}
interface LPHeroProps {
  cover: { title: string; subtitle: string; badge: string; cta: string }
  hero?: { description?: string; cta?: string }
  brandName: string
}

export function LPHero({ cover, hero, brandName }: LPHeroProps) {
  const ctaText = hero?.cta || cover.cta || ''
  const description = hero?.description || cover.subtitle || ''

  return (
    <header id="lp-hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-accent" />
      <${useMotion ? 'motion.div' : 'div'}
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        ${useMotion ? 'initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}' : ''}
      >
        {cover.badge && (
          <div className="inline-block px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            {cover.badge}
          </div>
        )}
        <h1 className="${effectsConfig.gradientText ? 'text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient' : 'text-5xl md:text-7xl font-extrabold leading-tight mb-6'}">
          {cover.title}
        </h1>
        {description && (
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{description}</p>
        )}
        {ctaText && (
          <a
            href="#lp-cta-final"
            className="inline-block px-8 py-4 text-lg font-bold rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            {ctaText}
          </a>
        )}
      </${useMotion ? 'motion.div' : 'div'}>
    </header>
  )
}
`;
}

/**
 * Generate components/lp-problem.tsx
 */
export function getLPProblemComponent(effectsConfig) {
  return `'use client'

${effectsConfig.staggeredCards ? "import { motion, useInView } from 'framer-motion'\nimport { useRef } from 'react'" : ''}

interface LPProblemProps {
  section: { title: string; paragraphs?: string[]; pains?: string[] }
}

export function LPProblem({ section }: LPProblemProps) {
  ${effectsConfig.staggeredCards ? "const ref = useRef(null)\n  const isInView = useInView(ref, { once: true, margin: '-50px' })" : ''}

  return (
    <section id="lp-problem" className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">{section.title}</h2>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-center text-lg text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: p }} />
      ))}
      <div ${effectsConfig.staggeredCards ? 'ref={ref}' : ''} className="grid md:grid-cols-2 gap-4 mt-8">
        {section.pains?.map((pain, i) => (
          <${effectsConfig.staggeredCards ? 'motion.div' : 'div'}
            key={i}
            className="p-5 bg-card border border-border rounded-xl border-l-4 border-l-red-500"
            ${effectsConfig.staggeredCards ? `initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}` : ''}
          >
            <span className="text-xl mr-2">❌</span>
            <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: pain }} />
          </${effectsConfig.staggeredCards ? 'motion.div' : 'div'}>
        ))}
      </div>
    </section>
  )
}
`;
}

/**
 * Generate components/lp-solution.tsx
 */
export function getLPSolutionComponent(effectsConfig) {
  return `'use client'

${effectsConfig.staggeredCards ? "import { motion, useInView } from 'framer-motion'\nimport { useRef } from 'react'" : ''}

interface Benefit { title: string; description: string }
interface LPSolutionProps {
  section: { title: string; paragraphs?: string[]; benefits?: Benefit[] }
}

export function LPSolution({ section }: LPSolutionProps) {
  ${effectsConfig.staggeredCards ? "const ref = useRef(null)\n  const isInView = useInView(ref, { once: true, margin: '-50px' })" : ''}

  return (
    <section id="lp-solution" className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">{section.title}</h2>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-center text-lg text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: p }} />
      ))}
      <div ${effectsConfig.staggeredCards ? 'ref={ref}' : ''} className="grid md:grid-cols-2 gap-4 mt-8">
        {section.benefits?.map((b, i) => (
          <${effectsConfig.staggeredCards ? 'motion.div' : 'div'}
            key={i}
            className="p-5 bg-card border border-border rounded-xl border-l-4 border-l-primary"
            ${effectsConfig.staggeredCards ? `initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}` : ''}
          >
            <div className="font-bold mb-1">✅ {b.title}</div>
            {b.description && <div className="text-muted-foreground text-sm">{b.description}</div>}
          </${effectsConfig.staggeredCards ? 'motion.div' : 'div'}>
        ))}
      </div>
    </section>
  )
}
`;
}

/**
 * Generate components/lp-proof.tsx
 */
export function getLPProofComponent(effectsConfig) {
  return `'use client'

${effectsConfig.staggeredCards ? "import { motion, useInView } from 'framer-motion'\nimport { useRef } from 'react'" : ''}
${effectsConfig.animatedCounters ? "import { AnimatedCounter } from './animated-counter'" : ''}

interface Testimonial { quote: string; author: string; role: string }
interface Stat { value: string; label: string }
interface LPProofProps {
  section: { title: string; paragraphs?: string[]; testimonials?: Testimonial[]; stats?: Stat[] }
}

export function LPProof({ section }: LPProofProps) {
  ${effectsConfig.staggeredCards ? "const ref = useRef(null)\n  const isInView = useInView(ref, { once: true, margin: '-50px' })" : ''}

  return (
    <section id="lp-proof" className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8">{section.title}</h2>

      {/* Testimonials */}
      {section.testimonials && section.testimonials.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {section.testimonials.map((t, i) => (
            <div key={i} className="p-6 bg-card border border-border rounded-xl">
              <blockquote className="text-lg italic border-l-3 border-primary pl-4 mb-4">
                "{t.quote}"
              </blockquote>
              <div className="font-semibold">{t.author}</div>
              {t.role && <div className="text-sm text-muted-foreground">{t.role}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {section.stats && section.stats.length > 0 && (
        <div ${effectsConfig.staggeredCards ? 'ref={ref}' : ''} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {section.stats.map((s, i) => {
            ${effectsConfig.animatedCounters ? "const numMatch = s.value.match(/[\\d.,]+/)\n            const numValue = numMatch ? parseInt(numMatch[0].replace(/\\./g, '').replace(/,/g, '')) : null" : ''}
            return (
              <${effectsConfig.staggeredCards ? 'motion.div' : 'div'}
                key={i}
                className="text-center p-6 bg-card border border-border rounded-xl"
                ${effectsConfig.staggeredCards ? `initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}` : ''}
              >
                <div className="text-3xl font-extrabold text-primary mb-1">
                  ${effectsConfig.animatedCounters ? '{numValue ? <AnimatedCounter target={numValue} /> : s.value}' : '{s.value}'}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </${effectsConfig.staggeredCards ? 'motion.div' : 'div'}>
            )
          })}
        </div>
      )}
    </section>
  )
}
`;
}

/**
 * Generate components/lp-offer.tsx
 */
export function getLPOfferComponent(effectsConfig) {
  return `'use client'

${effectsConfig.textReveal ? "import { motion } from 'framer-motion'" : ''}

interface OfferItem { name: string; value: string }
interface LPOfferProps {
  section: {
    title: string
    items?: OfferItem[]
    total?: string
    price?: string
    guarantee?: string
  }
}

export function LPOffer({ section }: LPOfferProps) {
  return (
    <section id="lp-offer" className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8">{section.title}</h2>

      <${effectsConfig.textReveal ? 'motion.div' : 'div'}
        className="max-w-xl mx-auto p-8 bg-card border-2 border-primary/30 rounded-2xl ${effectsConfig.glassmorphism ? 'backdrop-blur-xl bg-card/60' : ''}"
        ${effectsConfig.textReveal ? 'initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}' : ''}
      >
        {section.items && (
          <ul className="divide-y divide-border mb-6">
            {section.items.map((item, i) => (
              <li key={i} className="flex justify-between items-center py-3 text-muted-foreground">
                <span>✅ {item.name}</span>
                {item.value && <span className="text-sm line-through">{item.value}</span>}
              </li>
            ))}
          </ul>
        )}

        <div className="text-center border-t-2 border-border pt-6">
          {section.total && (
            <div className="text-lg text-muted-foreground line-through">{section.total}</div>
          )}
          {section.price && (
            <div className="text-4xl font-extrabold text-primary mt-2">{section.price}</div>
          )}
          <a
            href="#lp-cta-final"
            className="inline-block mt-6 px-8 py-4 text-lg font-bold rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Quero Começar Agora →
          </a>
        </div>
      </${effectsConfig.textReveal ? 'motion.div' : 'div'}>

      {section.guarantee && (
        <div className="flex items-center gap-4 max-w-xl mx-auto mt-8 p-5 bg-card border border-border rounded-xl">
          <span className="text-3xl">🛡️</span>
          <div>
            <div className="font-bold mb-1">Garantia</div>
            <p className="text-muted-foreground text-sm">{section.guarantee}</p>
          </div>
        </div>
      )}
    </section>
  )
}
`;
}

/**
 * Generate components/lp-cta.tsx
 */
export function getLPCTAComponent() {
  return `'use client'

interface LPCTAProps {
  section: { title?: string; description?: string; cta?: string; ps?: string }
}

export function LPCTA({ section }: LPCTAProps) {
  const ctaText = section.cta || 'Quero Começar Agora →'

  return (
    <section id="lp-cta-final" className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center p-12 bg-card border border-border rounded-2xl">
        {section.description && (
          <p className="text-xl text-muted-foreground mb-8">{section.description}</p>
        )}
        <a
          href="#"
          className="inline-block px-10 py-4 text-lg font-bold rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          {ctaText}
        </a>
        {section.ps && (
          <p className="mt-6 text-sm text-muted-foreground italic">PS. {section.ps}</p>
        )}
      </div>
    </section>
  )
}
`;
}

/**
 * Generate components/lp-faq.tsx
 */
export function getLPFAQComponent() {
  return `'use client'

import { useState } from 'react'

interface FAQItem { question: string; answer: string }
interface LPFAQProps {
  section: { title: string; items?: FAQItem[] }
}

export function LPFAQ({ section }: LPFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="lp-faq" className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">{section.title}</h2>
      <div className="divide-y divide-border">
        {section.items?.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex justify-between items-center py-5 text-left font-semibold hover:text-primary transition-colors"
            >
              <span>{item.question}</span>
              <span className={\`text-xl transition-transform \${openIndex === i ? 'rotate-45' : ''}\`}>+</span>
            </button>
            <div
              className={\`overflow-hidden transition-all duration-300 \${
                openIndex === i ? 'max-h-96 pb-5' : 'max-h-0'
              }\`}
            >
              <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
`;
}

/**
 * Generate components/lp-footer.tsx
 */
export function getLPFooterComponent() {
  return `interface LPFooterProps {
  brandName: string
}

export function LPFooter({ brandName }: LPFooterProps) {
  return (
    <footer className="border-t py-12 text-center text-muted-foreground">
      <p className="font-semibold text-foreground mb-1">{brandName}</p>
      <p className="text-sm">Powered by AIOS md-to-landing-page</p>
    </footer>
  )
}
`;
}

/**
 * Generate components/lp-sticky-cta.tsx
 */
export function getLPStickyCTAComponent() {
  return `'use client'

import { useEffect, useState } from 'react'

interface LPStickyCTAProps {
  price?: string
  ctaText: string
}

export function LPStickyCTA({ price, ctaText }: LPStickyCTAProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('lp-hero')
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={\`fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-lg border-t border-border flex items-center justify-center gap-4 transition-transform duration-300 \${
        visible ? 'translate-y-0' : 'translate-y-full'
      }\`}
    >
      {price && <span className="font-bold text-primary text-lg">{price}</span>}
      <a
        href="#lp-cta-final"
        className="px-6 py-2.5 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {ctaText}
      </a>
    </div>
  )
}
`;
}
