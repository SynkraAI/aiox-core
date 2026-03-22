/**
 * TSX template generators for Next.js project files.
 * Each function returns a string (file content) for the Next.js app structure.
 */

/**
 * Map brand font name to next/font/google import.
 * @param {string} fontName - Font name from brand config
 * @returns {{ import: string, variable: string }}
 */
function getFontImport(fontName) {
  const normalized = fontName.replace(/\s+/g, '_');
  const knownFonts = {
    'Inter': 'Inter',
    'Poppins': 'Poppins',
    'Space_Grotesk': 'Space_Grotesk',
    'Montserrat': 'Montserrat',
    'Roboto': 'Roboto',
    'Open_Sans': 'Open_Sans',
    'Lato': 'Lato',
    'Source_Sans_Pro': 'Source_Sans_3',
    'DM_Sans': 'DM_Sans',
    'Geist': 'Geist',
    'Plus_Jakarta_Sans': 'Plus_Jakarta_Sans',
    'Outfit': 'Outfit',
    'IBM_Plex_Sans': 'IBM_Plex_Sans',
    'Playfair_Display': 'Playfair_Display',
    'Source_Serif_4': 'Source_Serif_4',
    'Libre_Baskerville': 'Libre_Baskerville',
    'Syne': 'Syne',
    'Rubik': 'Rubik',
  };

  const fontImport = knownFonts[normalized] || 'Inter';
  return { import: fontImport, variable: normalized.toLowerCase() };
}

/**
 * Generate app/layout.tsx with brand font and metadata.
 * @param {object} brand - Brand config
 * @returns {string} TSX file content
 */
export function getLayout(brand) {
  const { import: fontImport, variable: fontVar } = getFontImport(brand.font);

  return `import type { Metadata } from 'next'
import { ${fontImport} } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const ${fontVar} = ${fontImport}({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${brand.name}',
  description: 'Branded presentation powered by AIOS md-to-branded-pdf',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={${fontVar}.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
`;
}

/**
 * Generate app/providers.tsx with next-themes ThemeProvider.
 * @returns {string} TSX file content
 */
export function getProviders(brand) {
  const defaultTheme = brand?.theme || 'dark';
  return `'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="${defaultTheme}" enableSystem>
      {children}
    </ThemeProvider>
  )
}
`;
}

/**
 * Generate app/globals.css with shadcn CSS vars and Tailwind directives.
 * @param {string} shadcnVars - CSS custom properties from brandToShadcnVars
 * @returns {string} CSS file content
 */
export function getGlobalCSS(shadcnVars) {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${shadcnVars}
  }

  .dark {
${shadcnVars}
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  html {
    scroll-behavior: smooth;
  }

  /* Gradient text animation */
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-gradient {
    animation: gradient 4s ease infinite;
  }

  /* Glassmorphism utility */
  .glass {
    @apply bg-card/60 backdrop-blur-xl border-border/50;
    box-shadow: 0 8px 32px hsl(var(--primary) / 0.05);
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-background;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-border rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-primary/60;
  }
}
`;
}

/**
 * Generate app/page.tsx with Hero and Section components.
 * CRITICAL: Embeds parsed content as static data.
 * @param {object} parsed - Parsed markdown structure
 * @param {object} brand - Brand config
 * @param {object} effectsConfig - Effects configuration
 * @returns {string} TSX file content
 */
export function getPage(parsed, brand, effectsConfig) {
  // Serialize sections data as JSON, then embed in component
  const sectionsData = JSON.stringify(parsed.sections, null, 2);

  return `import { Hero } from '@/components/hero'
import { Section } from '@/components/section'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

const BRAND_NAME = "${brand.name}";

const COVER = {
  title: ${JSON.stringify(parsed.cover.title)},
  subtitle: ${JSON.stringify(parsed.cover.subtitle || '')},
  badge: ${JSON.stringify(parsed.cover.badge || '')},
};

const SECTIONS = ${sectionsData};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Nav brandName={BRAND_NAME} sections={SECTIONS} />
      <Hero
        title={COVER.title}
        subtitle={COVER.subtitle}
        badge={COVER.badge}
        brandName={BRAND_NAME}
      />
      <div className="container mx-auto px-4 py-16 space-y-24">
        {SECTIONS.map((section, idx) => (
          <Section key={idx} section={section} />
        ))}
      </div>
      <Footer brandName={BRAND_NAME} />
    </main>
  )
}
`;
}

/**
 * Generate components/hero.tsx with Framer Motion fade-in.
 * @param {object} effectsConfig - Effects configuration
 * @returns {string} TSX file content
 */
export function getHeroComponent(effectsConfig) {
  const useMotion = effectsConfig.textReveal || effectsConfig.staggeredCards;
  const motionImport = useMotion ? "import { motion } from 'framer-motion'\n" : '';

  const WrapperTag = useMotion ? 'motion.div' : 'div';
  const motionProps = useMotion
    ? `
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}`
    : '';

  return `'use client'

${motionImport}import { Badge } from '@/components/ui/badge'

interface HeroProps {
  title: string
  subtitle: string
  badge: string
  brandName: string
}

export function Hero({ title, subtitle, badge, brandName }: HeroProps) {
  // Convert *italic* parts to highlighted spans
  const formatTitle = (text: string) => {
    const parts = text.split(/\\*(.*?)\\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="text-primary-light">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <${WrapperTag}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"${motionProps}
    >
      ${effectsConfig.meshBackground ? `{/* Mesh background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 50% at 20% 40%, hsl(var(--primary) / 0.15), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 20%, hsl(var(--accent) / 0.10), transparent 60%), radial-gradient(ellipse 50% 60% at 60% 80%, hsl(var(--primary) / 0.08), transparent 60%)'
      }} />` : `<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.1),transparent)]" />`}
      ${effectsConfig.gridPattern ? `{/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
      }} />` : ''}
      <div className="container mx-auto px-4 text-center relative z-10">
        {badge && (
          <Badge className="mb-8 text-sm" variant="outline">
            {badge}
          </Badge>
        )}
        <h1 className="${effectsConfig.gradientText ? 'text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient' : 'text-5xl md:text-7xl font-bold mb-6 leading-tight'}">
          {formatTitle(title)}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </${WrapperTag}>
  )
}
`;
}

/**
 * Generate components/section.tsx with scroll-triggered animations.
 * @param {object} effectsConfig - Effects configuration
 * @returns {string} TSX file content
 */
export function getSectionComponent(effectsConfig) {
  const useInView = effectsConfig.staggeredCards || effectsConfig.parallax;
  const inViewImport = useInView
    ? "import { motion, useInView } from 'framer-motion'\nimport { useRef } from 'react'\n"
    : '';

  const AnimatedCounter = effectsConfig.animatedCounters
    ? "import { AnimatedCounter } from './animated-counter'\n"
    : '';

  return `'use client'

${inViewImport}${AnimatedCounter}import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SectionProps {
  section: {
    number: string
    title: string
    intro?: string
    blocks: Array<{
      type: string
      text?: string
      html?: string
      token?: any
      items?: string[]
      ordered?: boolean
      code?: string
      lang?: string
    }>
  }
}

export function Section({ section }: SectionProps) {
  ${useInView ? 'const ref = useRef(null)\n  const isInView = useInView(ref, { once: true, margin: "-100px" })' : ''}

  return (
    <section ${useInView ? 'ref={ref}' : ''} className="scroll-mt-24">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline" className="text-lg px-4 py-1">
            {section.number}
          </Badge>
          <h2 className="text-4xl font-bold">{section.title}</h2>
        </div>
        {section.intro && (
          <p className="text-lg text-muted-foreground mt-4">{section.intro}</p>
        )}
      </div>

      <div className="space-y-8">
        {section.blocks.map((block, idx) => (
          <Block
            key={idx}
            block={block}
            index={idx}
            ${useInView ? 'isInView={isInView}' : ''}
          />
        ))}
      </div>
    </section>
  )
}

function Block({ block, index, ${useInView ? 'isInView' : ''} }: any) {
  ${effectsConfig.staggeredCards ? `const delay = index * 0.1` : ''}
  ${effectsConfig.staggeredCards ? `const WrapperTag = isInView ? motion.div : 'div'
  const motionProps = isInView
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay },
      }
    : {}` : ''}

  switch (block.type) {
    case 'heading':
      return <h3 className="text-2xl font-semibold mt-8 mb-4">{block.text}</h3>

    case 'paragraph':
      return (
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      )

    case 'callout':
    case 'callout-red':
      return (
        <Card className={block.type === 'callout-red' ? 'border-red-500/50 bg-red-500/5' : ''}>
          <CardContent className="pt-6">
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          </CardContent>
        </Card>
      )

    case 'table':
    case 'pricing-table':
    case 'compare-table':
      return <TableBlock token={block.token} type={block.type} />

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag className={block.ordered ? 'list-decimal list-inside space-y-2' : 'list-disc list-inside space-y-2'}>
          {block.items.map((item: string, i: number) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ListTag>
      )

    case 'stats':
      return <StatsBlock items={block.items} ${effectsConfig.animatedCounters ? 'animated' : ''} />

    case 'code':
      return (
        <pre className="bg-card border rounded-lg p-4 overflow-x-auto">
          <code className={\`language-\${block.lang || ''}\`}>{block.code}</code>
        </pre>
      )

    default:
      return null
  }
}

function TableBlock({ token, type }: any) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {token.header.map((h: any, i: number) => (
              <TableHead key={i} style={{ textAlign: h.align || 'left' }}>
                <span dangerouslySetInnerHTML={{ __html: h.text }} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {token.rows.map((row: any[], i: number) => (
            <TableRow key={i}>
              {row.map((cell: any, j: number) => (
                <TableCell key={j} style={{ textAlign: cell.align || 'left' }}>
                  <span dangerouslySetInnerHTML={{ __html: cell.text }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function StatsBlock({ items, ${effectsConfig.animatedCounters ? 'animated' : ''} }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item: string, i: number) => {
        const match = item.match(/^\\*\\*([^*]+)\\*\\*\\s*(.*)/)
        if (match) {
          const value = match[1]
          const label = match[2]
          ${effectsConfig.animatedCounters ? `const numMatch = value.match(/\\d+/)
          const numValue = numMatch ? parseInt(numMatch[0]) : null` : ''}

          return (
            <Card key={i}>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  ${effectsConfig.animatedCounters ? '{numValue ? <AnimatedCounter target={numValue} /> : value}' : '{value}'}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          )
        }
        return (
          <Card key={i}>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">{item}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
`;
}

/**
 * Generate components/nav.tsx with sticky navigation and theme toggle.
 * @returns {string} TSX file content
 */
export function getNavComponent() {
  return `'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface NavProps {
  brandName: string
  sections: Array<{ number: string; title: string }>
}

export function Nav({ brandName, sections }: NavProps) {
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id')
            if (id) setActiveSection(id)
          }
        })
      },
      { rootMargin: '-100px 0px -66%' }
    )

    document.querySelectorAll('section[id^="section-"]').forEach((section) => {
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  if (!mounted) return null

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#" className="text-xl font-bold">
          {brandName}
        </a>
        <div className="hidden md:flex gap-6">
          {sections.map((s) => {
            const sectionId = \`section-\${s.number}\`
            return (
              <a
                key={s.number}
                href={\`#\${sectionId}\`}
                className={
                  activeSection === sectionId
                    ? 'text-primary font-medium transition-colors'
                    : 'text-muted-foreground hover:text-foreground transition-colors'
                }
              >
                {s.title}
              </a>
            )
          })}
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}
`;
}

/**
 * Generate components/footer.tsx (simple server component).
 * @returns {string} TSX file content
 */
export function getFooterComponent() {
  return `interface FooterProps {
  brandName: string
}

export function Footer({ brandName }: FooterProps) {
  return (
    <footer className="border-t mt-24 py-12 bg-card/50">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p className="font-semibold text-foreground mb-2">{brandName}</p>
        <p className="text-sm">
          Powered by{' '}
          <a
            href="https://github.com/luizfosc/aios-core"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            AIOS md-to-branded-pdf
          </a>
        </p>
      </div>
    </footer>
  )
}
`;
}

/**
 * Generate components/animated-counter.tsx with Framer Motion.
 * Only generated if effectsConfig.animatedCounters is true.
 * @param {object} effectsConfig - Effects configuration
 * @returns {string} TSX file content
 */
export function getAnimatedCounter(effectsConfig) {
  if (!effectsConfig.animatedCounters) return '';

  return `'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useTransform, animate, useInView, motion } from 'framer-motion'

interface AnimatedCounterProps {
  target: number
  duration?: number
}

export function AnimatedCounter({ target, duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, { duration })
      return controls.stop
    }
  }, [isInView, count, target, duration])

  return (
    <motion.span ref={ref}>
      {rounded.get()}
    </motion.span>
  )
}
`;
}

/**
 * Generate tailwind.config.ts with brand colors mapped to CSS vars.
 * @param {object} brand - Brand config
 * @returns {string} TypeScript file content
 */
export function getTailwindConfig(brand) {
  return `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(var(--primary-light))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(0 62.8% 30.6%)",
          foreground: "hsl(0 0% 98%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
`;
}

/**
 * Generate next.config.mjs (minimal).
 * @returns {string} ESM config file content
 */
export function getNextConfig() {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default nextConfig
`;
}

/**
 * Generate tsconfig.json (standard Next.js).
 * @returns {string} JSON file content
 */
export function getTsConfig() {
  return `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;
}

/**
 * Generate postcss.config.mjs.
 * @returns {string} ESM config file content
 */
export function getPostcssConfig() {
  return `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
`;
}

/**
 * Generate lib/utils.ts with cn() helper (shadcn standard).
 * @returns {string} TypeScript file content
 */
export function getUtils() {
  return `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
}
