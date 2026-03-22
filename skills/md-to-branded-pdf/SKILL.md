---
paths:
  - "skills/md-to-branded-pdf/"
lazy_load: true
context_budget: 800
name: md-to-branded-pdf
description: |
  Converts Markdown files to branded PDFs and/or interactive HTML sites.
  Supports multiple brand configs, dark/light themes, scroll animations, and responsive design.
---

# MD to Branded (PDF + HTML)

Skill reutilizavel para converter Markdown em PDF e/ou site HTML com identidade visual customizada. Suporta multiplas marcas via configuracao YAML, com CLI interativo para escolher formato, animacoes e features.

## Agent Behavior: Brand Selection

**OBRIGATORIO:** Quando o usuario pedir para converter um Markdown e nao especificar qual brand/tema usar, ANTES de perguntar qual tema ele quer, SEMPRE execute:

```bash
open skills/md-to-branded-pdf/brands/preview.html
```

Isso abre a galeria visual com todos os 18 temas pre-definidos no browser. Depois de abrir, pergunte ao usuario qual tema ele prefere usando `AskUserQuestion` com as opcoes disponiveis.

O preview tambem pode ser aberto via CLI:
```bash
node skills/md-to-branded-pdf/convert.mjs --preview
```

## Quick Start

```bash
# Install dependencies (first time only)
cd skills/md-to-branded-pdf && npm install && cd -

# Interactive mode (prompts for format, style, effects)
node skills/md-to-branded-pdf/convert.mjs input.md --brand=my-brand

# PDF only (non-interactive)
node skills/md-to-branded-pdf/convert.mjs input.md --brand=my-brand --format=pdf

# Basic HTML site with full features (non-interactive)
node skills/md-to-branded-pdf/convert.mjs input.md --brand=my-brand --format=html --style=basic --animations=full --features=full

# GSAP Standalone — Framer-quality, no build step (open in browser)
node skills/md-to-branded-pdf/convert.mjs input.md --brand=neon-cyber --format=html --style=gsap --effects=full-framer

# Next.js Project — React + shadcn/ui + Framer Motion (npm install && npm run dev)
node skills/md-to-branded-pdf/convert.mjs input.md --brand=arctic-frost --format=html --style=nextjs --effects=premium

# Both PDF + HTML
node skills/md-to-branded-pdf/convert.mjs input.md --brand=my-brand --format=both

# Single-file HTML (inline CSS/JS, basic style only)
node skills/md-to-branded-pdf/convert.mjs input.md --brand=my-brand --format=html --style=basic --inline

# List available brands
node skills/md-to-branded-pdf/convert.mjs --list-brands
```

## CLI Reference

```
node convert.mjs <input.md> [options]

Options:
  --brand=<name>        Brand config to use (required)
  --format=<type>       pdf | html | both (default: interactive prompt)
  --style=<type>        basic | gsap | nextjs (default: interactive prompt)
  --effects=<level>     full-framer | premium | minimal (for gsap/nextjs)
  --output=<path>       Output PDF path or HTML directory
  --animations=<level>  scroll | micro | full | minimal (basic style only)
  --features=<level>    toggle | nav | full | static (basic style only)
  --inline              Single-file HTML (basic style only)
  --preview             Open brand themes gallery in browser
  --list-brands         List available brand configs
  --help                Show help
```

### HTML Styles

| Style | Output | Build Step | Quality Level |
|-------|--------|-----------|---------------|
| `basic` | Pasta com HTML/CSS/JS vanilla | Nenhum | Bom |
| `gsap` | HTML unico com Tailwind CDN + GSAP CDN | Nenhum (abrir no browser) | Premium (nivel Framer) |
| `nextjs` | Projeto Next.js completo | `npm install && npm run dev` | Premium (nivel Framer) |

### Effects Levels (gsap/nextjs only)

| Level | Effects |
|-------|---------|
| `full-framer` | All effects: text reveals, counters, parallax, stagger, magnetic buttons, cursor glow, loading screen, **gradient text, glow cards, mesh background, grid pattern, floating elements, typewriter, spotlight cursor, shimmer border, glassmorphism** |
| `premium` | Smooth scroll, hover, counters, parallax, stagger, **gradient text, glow cards, mesh background, glassmorphism** |
| `minimal` | Smooth scroll + hover effects only |

### Phase 4 Premium Effects

| Effect | Description | Preset |
|--------|-------------|--------|
| `gradientText` | Animated gradient on hero title and section headings | full-framer, premium |
| `glowCards` | Cards with rotating hue glow border | full-framer, premium |
| `meshBackground` | Multi-radial gradient mesh on hero | full-framer, premium |
| `gridPattern` | Subtle grid lines overlay with radial mask | full-framer |
| `floatingElements` | Decorative blurred circles with float animation | full-framer |
| `typewriter` | Character-by-character typing on hero subtitle | full-framer |
| `spotlightCursor` | Large soft light that follows the mouse | full-framer |
| `shimmerBorder` | Animated shimmer border on pricing tables | full-framer |
| `glassmorphism` | Backdrop-blur + transparency on cards/callouts | full-framer, premium |

### Interactive Prompts

When flags are omitted, the CLI prompts interactively:

```
? Output format:
  1. PDF only
  2. HTML site only
  3. Both (PDF + HTML)

? HTML style:               (only if HTML selected)
  1. Basic (vanilla CSS/JS)
  2. GSAP Standalone (Tailwind CDN + GSAP)
  3. Next.js Project (React + shadcn/ui + Framer Motion)

? Effects level:            (only for gsap/nextjs)
  1. Full Framer (all effects)
  2. Premium (scroll, hover, counters, parallax)
  3. Minimal (smooth scroll + hover)

? Animation level:          (only for basic style)
  1. Scroll animations
  2. Micro-interactions
  3. Full (scroll + micro)
  4. Minimal motion

? Interactive features:     (only for basic style)
  1. Dark/light toggle
  2. Sticky navigation + smooth scroll
  3. Full (toggle + nav + progress bar + back-to-top)
  4. Static only
```

## Output Formats

### PDF Output

```
input-branded.pdf          ← A4, full-bleed dark design
```

### HTML Basic Site Output (`--style=basic`)

```
input-branded-site/
├── index.html             ← Standalone page
├── css/styles.css         ← Responsive CSS with animations
└── js/main.js             ← Vanilla JS interactivity
```

### HTML Basic Inline Output (`--style=basic --inline`)

```
input-branded.html         ← Single file, CSS/JS embedded
```

### GSAP Standalone Output (`--style=gsap`)

```
input-gsap-site/
└── index.html             ← Complete HTML with Tailwind CDN + GSAP CDN (open directly)
```

CDNs included:
- `cdn.tailwindcss.com` — Utility-first CSS
- `cdn.jsdelivr.net/npm/gsap@3` — GSAP + ScrollTrigger animations
- Google Fonts — Brand font

### Next.js Project Output (`--style=nextjs`)

```
input-nextjs/
├── package.json           ← npm install && npm run dev
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── app/
│   ├── layout.tsx         ← Root layout with Google Fonts + ThemeProvider
│   ├── page.tsx           ← Main page with embedded content
│   ├── globals.css        ← shadcn CSS variables + Tailwind directives
│   └── providers.tsx      ← next-themes ThemeProvider
├── components/
│   ├── ui/                ← shadcn/ui components (Card, Badge, Table)
│   ├── hero.tsx           ← Hero section with Framer Motion
│   ├── section.tsx        ← Content sections with scroll animations
│   ├── nav.tsx            ← Sticky nav with theme toggle
│   ├── footer.tsx
│   └── animated-counter.tsx (if counters enabled)
└── lib/
    └── utils.ts           ← cn() helper (clsx + tailwind-merge)
```

Dependencies:
- `next@^15`, `react@^19`, `react-dom@^19`
- `framer-motion@^11` — Animations
- `next-themes@^0.4` — Dark/light mode
- `class-variance-authority@^0.7`, `tailwind-merge@^2.5`, `clsx@^2` — shadcn utilities

## HTML Features

| Feature | Flag Value | Description |
|---------|-----------|-------------|
| Scroll animations | `--animations=scroll` | Fade/slide elements on scroll via IntersectionObserver |
| Micro-interactions | `--animations=micro` | Hover effects on cards, tables, stats |
| Full animations | `--animations=full` | Scroll + micro combined |
| Minimal motion | `--animations=minimal` | CSS opacity transitions only |
| Dark/light toggle | `--features=toggle` | Theme switch with localStorage persistence |
| Sticky nav | `--features=nav` | Fixed navigation + smooth scroll + active section |
| Full features | `--features=full` | Toggle + nav + progress bar + back-to-top |
| Static | `--features=static` | No JavaScript interactivity |

## Available Themes (24 pre-built)

| Theme | Style | Font | Ideal for |
|-------|-------|------|-----------|
| `luizfosc` | Dark cinematic blue | Inter | Professional, conferences |
| `example` | Dark purple/cyan | Inter | Modern tech (default) |
| `emerald-noir` | Dark emerald/gold | Plus Jakarta Sans | Consulting, finance |
| `sunset-blaze` | Dark orange/coral | DM Sans | Creative agencies, marketing |
| `arctic-frost` | **Light** blue/cyan | Inter | SaaS, corporate, docs |
| `rose-gold` | Dark pink/gold | Playfair Display | Luxury, fashion, events |
| `neon-cyber` | Dark purple/neon | Space Grotesk | Gaming, hackathons |
| `terracotta` | Dark earthy warm | Source Serif 4 | Architecture, sustainability |
| `ocean-depth` | Dark teal/blue | Outfit | Health, science |
| `minimal-sand` | **Light** warm neutrals | Libre Baskerville | Editorial, portfolio |
| `carbon-steel` | Dark industrial | IBM Plex Sans | Engineering, B2B tech |
| `aurora-green` | Dark green/purple | Geist | Fintech, developer tools |
| `magic-ui` | Dark shimmer purple/pink | Geist | Component libraries, dev tools |
| `saas-modern` | Dark indigo/pink gradient | Inter | SaaS landing pages, startups |
| `horizon-vivid` | Dark vibrant purple/cyan | DM Sans | Dashboards, data products |
| `tabler-pro` | **Light** professional blue | Inter | Admin panels, reports |
| `portfolio-3d` | Dark immersive cyan/pink | Space Grotesk | Creative portfolios, agency |
| `ant-enterprise` | **Light** enterprise blue/orange | Inter | Enterprise software, internal tools |
| `specta` | Dark warm purple/cyan | Syne + Inter | Creator platforms, premium SaaS |
| `gnomie-ai` | **Light** mauve + red accents | Montserrat | AI products, lifestyle brands |
| `emerald-ai` | Dark warm sky blue/gray | Rubik + Inter | AI/SaaS, cloud platforms |
| `minimum-via` | **Light** sea abyss + lilac | Inter | Minimalist products, agencies |
| `front-centre` | **Light** midnight universe/mono | Inter | Developer tools, technical docs |
| `screenshot-two` | **Light** apple green + blue | DM Sans | Productivity apps, fintech |

Visual preview: `node convert.mjs --preview` or `open brands/preview.html`

## Brand Config Format

Brand configs live in `brands/*.yaml`:

```yaml
name: My Brand
theme: dark
colors:
  primary: "#6C3CE1"
  primary_light: "#8B5CF6"
  accent: "#06D6A0"
  background: "#0F0F1A"
  card: "#1A1A2E"
  border: "#2A2A3E"
  text: "#E0E0F0"
  text_muted: "#9999B8"
  white: "#FFFFFF"
  highlight: "#6C3CE1"
logos:
  main: "https://example.com/logo.svg"
  partner: "https://example.com/partner-logo.svg"  # optional
font: "Inter"
cover:
  gradient_primary: "rgba(108,60,225,0.25)"
  gradient_secondary: "rgba(139,92,246,0.1)"
```

### Required Colors

`primary`, `primary_light`, `accent`, `background`, `card`, `border`, `text`, `text_muted`, `white`

## Markdown Structure Rules

The parser maps Markdown elements to PDF/HTML components:

| Markdown | Component |
|----------|-----------|
| `# H1` (first) | Cover page / Hero section |
| `## H2` | New section (page break in PDF, section in HTML) |
| `### H3` | Subsection heading |
| First paragraph after H2 | Section intro text |
| Tables with R$ | Pricing table (centered, discount highlights) |
| Tables with checkmarks | Comparison table (green/red/yellow) |
| Blockquotes | Callout boxes |
| Lists | Feature lists or rules |
| `*italic text*` in H1 | Cover badge |

## Architecture

```
input.md + --brand=my-brand
  → brand-loader.mjs      (reads brands/my-brand.yaml → CSS vars)
  → md-parser.mjs         (parses MD → { cover, sections[] })
  → color-mapper.mjs      (hex→HSL, brand→Tailwind, brand→shadcn vars)
  → effects-config.mjs    (preset resolution: full-framer/premium/minimal)
  → [format + style choice]
      ├── pdf              → html-builder.mjs → pdf-generator.mjs → .pdf
      ├── html + basic     → html-builder-web.mjs → site-generator.mjs → folder/
      ├── html + gsap      → html-builder-gsap.mjs → site-generator-gsap.mjs → HTML unico
      └── html + nextjs    → nextjs-generator.mjs + nextjs-templates.mjs → projeto completo
```

### Shared Utilities

| File | Purpose |
|------|---------|
| `lib/html-utils.mjs` | escapeHTML, formatInline, buildTable, buildList, buildStats, buildCodeBlock |
| `lib/color-mapper.mjs` | hexToHSL, brandToTailwindConfig, brandToShadcnVars, brandToFramerMotionTheme |
| `lib/effects-config.mjs` | EFFECTS_PRESETS, getEffectsConfig, VALID_EFFECTS |

## Dependencies

- `puppeteer` — Headless Chrome for PDF generation
- `marked` — Markdown tokenizer and parser
- `js-yaml` — YAML config loader
- Zero external dependencies for HTML output (vanilla CSS + JS)
- GSAP mode: CDNs (Tailwind, GSAP, ScrollTrigger) — zero npm deps
- Next.js mode: generates `package.json` with deps, user runs `npm install`
