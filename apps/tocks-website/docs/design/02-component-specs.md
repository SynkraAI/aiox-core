# Tocks Website v2 — Component Specs

**Design System:** Gilded Noir
**Methodology:** Atomic Design (Brad Frost)
**Version:** 1.0.0

---

## ATOMS

### Button

Three variants sharing base structure. All use `font-label`, uppercase, letter-spacing `0.12em`.

#### Primary (Gold)

```
┌─────────────────────────────────┐
│   SOLICITE SEU PROJETO          │
└─────────────────────────────────┘
```

| Property | Default | Hover | Active | Disabled |
|----------|---------|-------|--------|----------|
| Background | `#D4AF37` | `#E5C65C` | `#8A6F3A` | `#D4AF37` at 40% opacity |
| Text | `#0B0B0F` | `#0B0B0F` | `#0B0B0F` | `#0B0B0F` at 60% opacity |
| Border | none | none | none | none |
| Shadow | none | `--shadow-gold` | none | none |
| Transform | none | `translateY(-1px)` | `translateY(0)` | none |
| Cursor | pointer | pointer | pointer | not-allowed |

- **Padding:** 12px 32px (`py-3 px-8`)
- **Border-radius:** 4px (`rounded-md` equivalent, override to `rounded`)
- **Font-size:** 14px, weight 600, `text-transform: uppercase`
- **Transition:** `all var(--transition-fast)`
- **Min-width:** 200px
- **Height:** 48px

#### Secondary (Outline)

| Property | Default | Hover |
|----------|---------|-------|
| Background | transparent | `rgba(212, 175, 55, 0.08)` |
| Text | `#D4AF37` | `#E5C65C` |
| Border | 1px solid `#D4AF37` | 1px solid `#E5C65C` |

Same padding, radius, font as Primary.

#### Ghost

| Property | Default | Hover |
|----------|---------|-------|
| Background | transparent | transparent |
| Text | `#FAFAFA` | `#D4AF37` |
| Border | none | none |
| Text-decoration | none | underline (gold, offset 4px) |

Padding: 8px 16px. Used in navigation and inline links.

#### Button Sizes

| Size | Height | Padding | Font-size |
|------|--------|---------|-----------|
| `sm` | 36px | 8px 20px | 12px |
| `md` (default) | 48px | 12px 32px | 14px |
| `lg` | 56px | 16px 40px | 16px |

#### Tailwind Classes (Reference)

```tsx
// Primary
className="bg-gold hover:bg-gold-hover text-bg-primary font-label 
           uppercase tracking-[0.12em] text-sm font-semibold
           px-8 py-3 rounded h-12 min-w-[200px]
           transition-all duration-150 ease-out
           hover:-translate-y-px hover:shadow-gold
           disabled:opacity-40 disabled:cursor-not-allowed"

// Secondary
className="border border-gold text-gold hover:bg-gold/8 hover:text-gold-hover
           hover:border-gold-hover font-label uppercase tracking-[0.12em]
           text-sm font-semibold px-8 py-3 rounded h-12 min-w-[200px]
           transition-all duration-150 ease-out"
```

---

### Heading (H1-H4)

All headings use `font-display` (Cormorant Garamond). Color: `--color-text-primary`.

| Level | Tag | Size (desktop) | Size (mobile) | Weight | Line-height | Letter-spacing |
|-------|-----|----------------|---------------|--------|-------------|---------------|
| H1 | `<h1>` | 56px / 3.5rem | 36px / 2.25rem | 600 | 1.1 | -0.015em |
| H2 | `<h2>` | 40px / 2.5rem | 28px / 1.75rem | 600 | 1.15 | -0.01em |
| H3 | `<h3>` | 32px / 2rem | 24px / 1.5rem | 500 | 1.2 | -0.005em |
| H4 | `<h4>` | 24px / 1.5rem | 20px / 1.25rem | 500 | 1.25 | 0 |

**Gold accent variant:** Any heading can have a gold underline or side-bar ornament. Implemented as `::after` pseudo-element: `width: 48px; height: 2px; background: #D4AF37; margin-top: 12px`.

---

### Text

| Variant | Size | Weight | Line-height | Color | Font |
|---------|------|--------|-------------|-------|------|
| `body-lg` | 20px | 400 | 1.7 | `--color-text-primary` | Body (Inter) |
| `body-md` | 16px | 400 | 1.7 | `--color-text-primary` | Body |
| `body-sm` | 14px | 400 | 1.6 | `--color-text-secondary` | Body |
| `emphasis` | 16px | 500 | 1.7 | `--color-accent-ivory` | Body |
| `price` | 28px | 700 | 1.2 | `--color-accent-gold` | Label (Montserrat) |

---

### Badge

Small label chip for categories, features, or status indicators.

```
┌──────────────┐
│  SOB MEDIDA  │
└──────────────┘
```

| Property | Value |
|----------|-------|
| Background | `rgba(212, 175, 55, 0.12)` |
| Text | `#F5F0E6` (ivory) |
| Font | Label, 11px, weight 600, uppercase, tracking 0.08em |
| Padding | 4px 12px |
| Border-radius | 2px |
| Border | 1px solid `rgba(212, 175, 55, 0.2)` |

**Variants:**
- `gold`: As above (default)
- `ivory`: bg `rgba(245, 240, 230, 0.1)`, text ivory, border ivory/20%
- `dark`: bg `#1A1A1E`, text `#A0A0A0`, no border

---

### Logo

SVG logo rendered at fixed sizes per context.

| Context | Width | Height |
|---------|-------|--------|
| Header (desktop) | 140px | auto |
| Header (mobile) | 100px | auto |
| Footer | 120px | auto |
| Preloader | 80px | auto |

Color: `#FAFAFA` (primary) with `#D4AF37` accent detail. Must have `aria-label="Tocks"`.

---

### Icon

Icons from a curated set (Lucide or custom SVG). Default size 24px, stroke-width 1.5px.

| Size | Dimension | Stroke |
|------|-----------|--------|
| `sm` | 16px | 1.5px |
| `md` | 24px | 1.5px |
| `lg` | 32px | 2px |

Default color: `currentColor`. Gold variant: `#D4AF37`.

**Required icons (minimum set):**
- `menu` (hamburger)
- `x` (close)
- `chevron-down`, `chevron-right`, `chevron-left`
- `phone` (WhatsApp)
- `arrow-right`
- `ruler` (dimensions)
- `tree-pine` (wood/materials)
- `palette` (customization)
- `star` (testimonials)
- `map-pin` (location)
- `clock` (process/timeline)
- `instagram`, `facebook`, `youtube` (social)

---

### Divider

Horizontal rule with gold accent.

| Variant | Implementation |
|---------|---------------|
| `default` | `border-top: 1px solid rgba(212, 175, 55, 0.15)` |
| `gold` | `border-top: 2px solid #D4AF37; width: 48px` (centered, decorative) |
| `full` | `border-top: 1px solid #2A2A2E` (full-width, neutral) |

---

## MOLECULES

### ProductCard

```
┌─────────────────────────────┐
│                             │
│      [Product Image]        │
│      aspect-ratio: 4/3      │
│                             │
├─────────────────────────────┤
│  SOB MEDIDA                 │  ← Badge (optional)
│  Mesa Berlin                │  ← H4 (Cormorant Garamond)
│  Elegancia em cada detalhe  │  ← body-sm, text-secondary
│                             │
│  A partir de R$ 18.900      │  ← price token
│                             │
│  [  CONHECER PECA  →  ]    │  ← Button secondary, sm
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Width | 100% of grid column |
| Background | `#1A1A1E` |
| Border | 1px solid `transparent` |
| Border-radius | 8px |
| Overflow | hidden |
| Padding (info area) | 24px |
| Gap between elements | 8px |

**Hover state:**
- Border: `1px solid rgba(212, 175, 55, 0.4)` (fade in, 300ms)
- Transform: `scale(1.03)` (300ms ease-out)
- Shadow: `--shadow-lg`
- Image: `scale(1.08)` with overflow hidden (zoom effect)

**Image container:**
- `aspect-ratio: 4/3`
- `object-fit: cover`
- Overflow: hidden (clips the zoom on hover)
- Background: `#1A1A1E` (placeholder)

---

### TestimonialCard

```
┌───────────────────────────────────────┐
│                                       │
│  "A mesa superou todas as nossas      │
│   expectativas. Uma verdadeira        │
│   obra de arte."                      │
│                                       │
│  ┌────┐                               │
│  │foto│  Roberto Almeida              │
│  └────┘  Florianopolis, SC            │
│                                       │
└───────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#1A1A1E` |
| Border | 1px solid `rgba(212, 175, 55, 0.15)` |
| Border-radius | 8px |
| Padding | 32px |
| Quote font | Display (Cormorant Garamond), italic, 20px, line-height 1.6 |
| Quote color | `#FAFAFA` |
| Name font | Label (Montserrat), 14px, weight 600, `#F5F0E6` |
| City font | Body (Inter), 14px, weight 400, `#A0A0A0` |
| Photo | 48px circle, `object-fit: cover`, border 2px solid `#D4AF37` |
| Quote mark | Decorative `"` in gold, 64px, Display font, positioned top-left, opacity 0.2 |

---

### NavLink

```
  COLECAO
  ───────   ← gold underline, animates from left on hover
```

| Property | Default | Hover | Active |
|----------|---------|-------|--------|
| Text | `#FAFAFA` | `#D4AF37` | `#D4AF37` |
| Font | Label, 12px, weight 600, uppercase, tracking 0.1em | | |
| Underline | `scaleX(0)` (hidden) | `scaleX(1)` from left | `scaleX(1)` persistent |
| Transition | 300ms ease-out | | |

Underline implementation: `::after` pseudo-element, `height: 2px; background: #D4AF37; transform-origin: left; transition: transform 300ms ease-out`.

---

### WhatsAppCTA

Two variants: **Floating (FAB)** and **Inline**.

#### Floating (FAB)

```
     ┌─────┐
     │  W  │   ← WhatsApp icon, fixed bottom-right
     └─────┘
```

| Property | Value |
|----------|-------|
| Position | fixed, bottom 24px, right 24px |
| Size | 56px circle |
| Background | `#25D366` (WhatsApp green) |
| Icon | White WhatsApp icon, 28px |
| Shadow | `0 4px 16px rgba(37, 211, 102, 0.35)` |
| Border-radius | `9999px` |
| Z-index | `--z-fab` (60) |
| Hover | `scale(1.1)`, shadow intensifies |
| Pulse | Every 30s, gentle `goldPulse` animation ring |
| Tooltip | "Fale conosco" — appears on first visit, auto-dismisses after 5s |

#### Inline

```
┌──────────────────────────────┐
│  W  FALE COM NOSSO ATELIER   │
└──────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#25D366` |
| Text | `#FFFFFF`, Label font, 14px, weight 600, uppercase |
| Icon | White, 20px, left of text, gap 8px |
| Padding | 12px 32px |
| Border-radius | 4px |
| Hover | Background `#1FAD55`, `translateY(-1px)` |

---

### PriceTag

```
  A partir de R$ 18.900
```

| Property | Value |
|----------|-------|
| "A partir de" | Body font, 14px, weight 400, `#A0A0A0` |
| "R$ 18.900" | Label font (Montserrat), 28px, weight 700, `#D4AF37` |
| Layout | Stacked (prefix above) or inline, depending on context |
| Letter-spacing | 0 for price value |

---

## ORGANISMS

### Header

```
┌──────────────────────────────────────────────────────────────┐
│  [LOGO]     COLECAO   ATELIER   PROJETOS   BLOG     [W CTA] │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Position | fixed, top 0, full width |
| Height | 80px (desktop), 64px (mobile) |
| Background | transparent (initial) |
| Background (scrolled) | `rgba(11, 11, 15, 0.95)` with `backdrop-filter: blur(12px)` |
| Transition | background 300ms ease-out |
| Z-index | `--z-sticky` (20) |
| Padding | 0 32px (desktop), 0 16px (mobile) |
| Layout | flex, `justify-between`, `align-center` |

**Desktop nav:** Horizontal list of NavLinks, gap 32px.
**Mobile nav:** Hamburger icon triggers fullscreen overlay menu.
**CTA:** WhatsApp inline button (secondary variant, small) — desktop only.

**Mobile Menu (fullscreen overlay):**

| Property | Value |
|----------|-------|
| Background | `#0B0B0F` at 98% opacity, blur 24px |
| Z-index | `--z-modal` (40) |
| Animation | Fade in 300ms + links stagger from bottom (50ms each) |
| Nav links | Centered, Display font, 32px, gold on tap |
| Close | `x` icon, top-right, 48px tap target |

---

### Footer

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [LOGO]              PECAS         ATELIER      CONTATO      │
│                      Mesa Berlin   Nossa Hist.  WhatsApp     │
│  Mesas de bilhar     Mesa Vienna   Processo     Email        │
│  sob medida em       Mesa Prague   Materiais    Endereco     │
│  Itajai, SC          Pebolim                    Instagram    │
│                      Ver todas                  Facebook     │
│                                                              │
│  ─── gold divider ───────────────────────────────────────    │
│                                                              │
│  © 2026 Tocks. Todos os direitos reservados.  LGPD  Priv.   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#0B0B0F` (or same as page, with top border gold-deep) |
| Border-top | 1px solid `#8A6F3A` |
| Padding | 64px 32px (top), 24px 32px (bottom bar) |
| Layout | 4-column grid (desktop), 2-column (tablet), stacked (mobile) |
| Column titles | H4, gold (#D4AF37), Label font |
| Links | body-sm, `#A0A0A0`, hover gold |
| Copyright | body-sm, `#A0A0A0`, centered on mobile |

---

### Hero

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ╔═══════════════════════════════════════════════════════╗    │
│  ║           [VIDEO BACKGROUND - AUTOPLAY]               ║    │
│  ║                                                       ║    │
│  ║           [Dark Gradient Overlay]                     ║    │
│  ║                                                       ║    │
│  ║     Mesas de Bilhar                                   ║    │
│  ║     Sob Medida                                        ║    │
│  ║                                                       ║    │
│  ║     Cada peca e unica.                                ║    │
│  ║     Criada para o seu espaco.                         ║    │
│  ║                                                       ║    │
│  ║     [ SOLICITE SEU PROJETO ]                          ║    │
│  ║                                                       ║    │
│  ╚═══════════════════════════════════════════════════════╝    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 100vh (desktop), 100svh (mobile, safe viewport) |
| Video | `<video autoplay muted loop playsinline>`, `object-fit: cover`, full bleed |
| Overlay | Linear gradient: `rgba(11,11,15,0.55)` to `rgba(11,11,15,0.75)` bottom |
| Headline | `display-lg` (80px desktop, 48px mobile), Cormorant Garamond, 700 |
| Subheadline | `body-lg` (20px), Inter, 400, `#A0A0A0`, max-width 480px |
| CTA | Button Primary (gold), lg size |
| Content alignment | center (mobile), left with 32px left-padding within container (desktop) |
| Scroll indicator | Subtle animated chevron-down at bottom center, opacity 0.5, bounce animation |

---

### ProductGrid

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Product │  │ Product │  │ Product │
│  Card   │  │  Card   │  │  Card   │
└─────────┘  └─────────┘  └─────────┘
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Product │  │ Product │  │ Product │
│  Card   │  │  Card   │  │  Card   │
└─────────┘  └─────────┘  └─────────┘
```

| Property | Value |
|----------|-------|
| Layout | CSS Grid |
| Columns | 1 (mobile), 2 (tablet 768px+), 3 (desktop 1280px+) |
| Gap | 24px (mobile), 32px (desktop) |
| Max-width | `--container-xl` (1280px) |
| Items | `<ProductCard>` molecule |

---

### TestimonialCarousel

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ◄  [ TestimonialCard ]  [ TestimonialCard ]  [ ... ]  ►  │
│                                                           │
│              ●  ○  ○  ○  ○                                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Layout | Horizontal scroll / swipe (embla-carousel or similar) |
| Visible cards | 1 (mobile), 2 (tablet), 3 (desktop) |
| Gap | 24px |
| Navigation | Arrow buttons (left/right), gold outline variant, 44px tap target |
| Indicators | Dots below, active dot is gold, inactive is `#2A2A2E` |
| Autoplay | Every 6s, pauses on hover/focus |
| Transition | `500ms ease-in-out` slide |

---

### ProcessTimeline

```
  ①───────②───────③───────④───────⑤───────⑥
  |       |       |       |       |       |
Consulta Design  Selecao Criacao Acabamento Entrega
         do      de               e         e
         Projeto Materiais        Detalhes  Instalacao
```

| Property | Value |
|----------|-------|
| Layout | Horizontal (desktop), vertical (mobile) |
| Line | 2px solid `#8A6F3A` connecting steps |
| Step circle | 48px, border 2px `#D4AF37`, bg `#1A1A1E`, number in center (Label, gold) |
| Active/completed | Circle bg `#D4AF37`, number `#0B0B0F` |
| Step title | H4, `#FAFAFA` |
| Step description | body-sm, `#A0A0A0`, max-width 160px |
| Scroll animation | Each step fades up on scroll intersection |

6 steps: Consulta, Design do Projeto, Selecao de Materiais, Criacao, Acabamento e Detalhes, Entrega e Instalacao.

---

### FAQAccordion

```
┌───────────────────────────────────────────────────┐
│  Qual o prazo de entrega?                    [+]  │
├───────────────────────────────────────────────────┤
│                                                   │
│  O prazo varia de 45 a 90 dias, dependendo da     │
│  complexidade da peca e dos materiais escolhidos. │
│                                                   │
└───────────────────────────────────────────────────┘
│  Posso escolher o tipo de madeira?           [+]  │
└───────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container | Full width within content container |
| Item border | `1px solid rgba(212, 175, 55, 0.15)` between items |
| Question | H4 (24px), `#FAFAFA`, cursor pointer |
| Toggle icon | `+` / `−` (or chevron), gold, 24px, rotates 180deg on open |
| Answer | body-md, `#A0A0A0`, padding 0 0 24px |
| Animation | `max-height` transition, 300ms ease-out; or Radix Accordion for accessible default |
| Open state | Question text turns gold |
| Padding | 24px vertical per item |
| Max-width | 800px, centered |
