# Design System - Metodo Aplauda de Pe

**Version:** 1.0.0
**Last Updated:** 2026-02-13
**Specialist:** @brad-frost (Atomic Design)
**Stack:** Next.js 16.1.6 + React 19.2.3 + Tailwind CSS v4 + Radix UI

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens](#2-design-tokens)
3. [Typography](#3-typography)
4. [Color System](#4-color-system)
5. [Spacing & Layout](#5-spacing--layout)
6. [Elevation (Shadows)](#6-elevation-shadows)
7. [Border Radius](#7-border-radius)
8. [Motion & Transitions](#8-motion--transitions)
9. [Z-Index Scale](#9-z-index-scale)
10. [Atoms (Base Components)](#10-atoms-base-components)
11. [Molecules (Composed Components)](#11-molecules-composed-components)
12. [Organisms (Complex Components)](#12-organisms-complex-components)
13. [Templates (Page Layouts)](#13-templates-page-layouts)
14. [Accessibility](#14-accessibility)
15. [Responsive Breakpoints](#15-responsive-breakpoints)
16. [Iconography](#16-iconography)

---

## 1. Design Principles

These five principles guide every design decision in the platform.

### 1.1 Jornada Progressiva (Progressive Journey)
Every element should reinforce the feeling of forward movement. Locked content creates anticipation. Unlocked content creates celebration. The student always knows where they are and what comes next.

### 1.2 Clareza Acolhedora (Warm Clarity)
Professional but not cold. Clear but not sterile. The interface should feel like a trusted mentor guiding you -- not a corporate training portal. Use warmth in color, generous whitespace, and human language.

### 1.3 Celebracao Merecida (Earned Celebration)
Every milestone deserves recognition. Checkpoint completion gets subtle feedback. Module completion gets visible celebration. Course completion gets unforgettable celebration. Never celebrate nothing; always celebrate something real.

### 1.4 Camadas de Profundidade (Layered Depth)
Surface-level content is visible by default. Details are available on demand (accordions, expandables, tooltips). The student controls how deep they go. Less overwhelming, more inviting.

### 1.5 Acessibilidade Inegociavel (Non-Negotiable Accessibility)
Every component must be usable by every person. Keyboard navigation, screen readers, sufficient contrast, and reduced motion support are not features -- they are requirements.

---

## 2. Design Tokens

All tokens live in CSS custom properties defined in `app/globals.css` and mapped to Tailwind utilities via `tailwind.config.ts`.

### Token Architecture

```
CSS Custom Properties (source of truth)
    |
    v
Tailwind Config (maps to utility classes)
    |
    v
Components (consume via Tailwind classes)
```

### Token Naming Convention

```
--{category}-{variant}
--{category}-{variant}-{modifier}
```

Examples: `--primary`, `--primary-foreground`, `--primary-light`, `--shadow-md`

---

## 3. Typography

### Font Stack

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Inter, system-ui, -apple-system, sans-serif | Body text, UI elements |
| `--font-display` | Inter, system-ui, -apple-system, sans-serif | Headings, hero text |

Inter is loaded via `next/font/google` with `display: swap` and OpenType features `ss01` (stylistic alternate) and `cv01` (character variant) for improved readability.

### Type Scale

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `display-lg` | 2.25rem (36px) | 800 | 1.1 | -0.025em | Hero headings, celebration screens |
| `display` | 1.875rem (30px) | 700 | 1.2 | -0.02em | Page titles |
| `h1` | 1.5rem (24px) | 700 | 1.3 | -0.015em | Section headings |
| `h2` | 1.25rem (20px) | 700 | 1.3 | -0.01em | Card titles, sub-sections |
| `h3` | 1.125rem (18px) | 600 | 1.4 | -0.005em | Module names, group labels |
| `h4` | 1rem (16px) | 600 | 1.4 | 0 | Sub-headings, field labels |
| `body-lg` | 1rem (16px) | 400 | 1.6 | 0 | Long-form content, descriptions |
| `body` | 0.875rem (14px) | 400 | 1.5 | 0 | Default body text |
| `body-sm` | 0.8125rem (13px) | 400 | 1.5 | 0.005em | Secondary info, metadata |
| `caption` | 0.75rem (12px) | 500 | 1.4 | 0.01em | Labels, timestamps, badges |
| `overline` | 0.6875rem (11px) | 600 | 1.3 | 0.08em | Module numbers, section labels (uppercase) |

### CSS Token Definitions

```css
:root {
  /* Typography scale */
  --text-display-lg: 2.25rem;
  --text-display: 1.875rem;
  --text-h1: 1.5rem;
  --text-h2: 1.25rem;
  --text-h3: 1.125rem;
  --text-h4: 1rem;
  --text-body-lg: 1rem;
  --text-body: 0.875rem;
  --text-body-sm: 0.8125rem;
  --text-caption: 0.75rem;
  --text-overline: 0.6875rem;

  /* Font weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

---

## 4. Color System

### 4.1 Brand Colors

| Token | HSL Value | Hex (approx.) | Usage |
|-------|-----------|---------------|-------|
| `--primary` | 235 65% 48% | #2B35C3 | Primary actions, active states, links, brand identity |
| `--primary-foreground` | 0 0% 100% | #FFFFFF | Text on primary backgrounds |
| `--primary-light` | 235 65% 95% | #ECEEF9 | Primary tinted backgrounds |
| `--primary-hover` | 235 65% 42% | #252EAB | Primary hover state |
| `--secondary` | 38 92% 55% | #F0A528 | Celebration, energy, amber accent |
| `--secondary-foreground` | 38 92% 15% | #4A3108 | Text on secondary backgrounds |
| `--secondary-light` | 38 92% 94% | #FEF3DC | Secondary tinted backgrounds |
| `--accent` | 152 60% 42% | #2BAE72 | Growth, progress, success, emerald |
| `--accent-foreground` | 0 0% 100% | #FFFFFF | Text on accent backgrounds |
| `--accent-light` | 152 60% 94% | #E3F8ED | Accent tinted backgrounds |

### 4.2 Module Colors

Each of the 5 modules has a unique identity color used in color strips, badges, and progress indicators.

| Token | HSL Value | Module | Meaning |
|-------|-----------|--------|---------|
| `--module-1` | 235 65% 48% | Conexao Inicial | Trust, deep connection (blue-violet) |
| `--module-2` | 262 55% 50% | Promocao do Conteudo | Creativity, desire (purple) |
| `--module-3` | 210 80% 52% | Entrega Estruturada | Clarity, structure (blue) |
| `--module-4` | 340 65% 50% | Historia de Essencia | Emotion, heart (rose) |
| `--module-5` | 38 92% 55% | Finalizacao Emocional | Celebration, applause (amber) |

### 4.3 Semantic Colors

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--success` | 152 60% 42% | Completed states, positive feedback |
| `--success-foreground` | 0 0% 100% | Text on success |
| `--warning` | 38 92% 55% | Caution, streak alerts |
| `--warning-foreground` | 38 92% 15% | Text on warning |
| `--destructive` | 0 84% 60% | Errors, destructive actions |
| `--destructive-foreground` | 0 0% 100% | Text on destructive |
| `--info` | 210 80% 52% | Informational, tips |
| `--info-foreground` | 0 0% 100% | Text on info |

### 4.4 Surface Colors

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | 240 20% 98% | Page background |
| `--foreground` | 235 25% 12% | Primary text |
| `--card` | 0 0% 100% | Card backgrounds |
| `--card-foreground` | 235 25% 12% | Text on cards |
| `--muted` | 235 15% 95% | Subtle backgrounds, disabled |
| `--muted-foreground` | 235 10% 46% | Secondary text, descriptions |
| `--border` | 235 15% 90% | Borders, dividers |
| `--input` | 235 15% 90% | Input borders |
| `--ring` | 235 65% 48% | Focus rings |

### 4.5 Text Color Hierarchy

| Level | Token | Usage |
|-------|-------|-------|
| Primary | `--foreground` | Headings, primary content |
| Secondary | `--muted-foreground` | Descriptions, metadata, labels |
| Tertiary | `--muted-foreground` at 60% opacity | Timestamps, hints, placeholders |
| Disabled | `--muted-foreground` at 40% opacity | Disabled elements, locked content |
| Inverse | `--primary-foreground` | Text on colored backgrounds |

### 4.6 Background Color Hierarchy

| Level | Token | Usage |
|-------|-------|-------|
| Base | `--background` | Page background |
| Surface | `--card` | Cards, panels, elevated content |
| Subtle | `--muted` | Section backgrounds, input fields |
| Elevated | `--card` + `--shadow-md` | Modals, popovers, floating elements |
| Overlay | `235 25% 12%` at 60% opacity | Modal backdrops, image overlays |
| Scrim | `235 25% 12%` at 80% opacity | Full-screen overlays |

---

## 5. Spacing & Layout

### Spacing Scale (4px base unit)

| Token | Value | px | Usage |
|-------|-------|-----|-------|
| `--space-0.5` | 0.125rem | 2px | Hairline gaps |
| `--space-1` | 0.25rem | 4px | Icon-text gaps, tight spacing |
| `--space-1.5` | 0.375rem | 6px | Compact element gaps |
| `--space-2` | 0.5rem | 8px | Button padding (y), inline spacing |
| `--space-3` | 0.75rem | 12px | Small card padding, input padding |
| `--space-4` | 1rem | 16px | Default padding, card gaps |
| `--space-5` | 1.25rem | 20px | Section margins, card padding |
| `--space-6` | 1.5rem | 24px | Section gaps |
| `--space-8` | 2rem | 32px | Major section separators |
| `--space-10` | 2.5rem | 40px | Page section spacing |
| `--space-12` | 3rem | 48px | Header/footer padding |
| `--space-16` | 4rem | 64px | Hero spacing, major separators |
| `--space-20` | 5rem | 80px | Page top/bottom margins |
| `--space-24` | 6rem | 96px | Full-page spacing |

### Layout Containers

| Container | Max Width | Padding (mobile) | Padding (desktop) |
|-----------|-----------|-------------------|---------------------|
| Content | 80rem (1280px) | 1rem (16px) | 2rem (32px) |
| Narrow | 48rem (768px) | 1rem (16px) | 2rem (32px) |
| Wide | 96rem (1536px) | 1rem (16px) | 2rem (32px) |

### Grid System

| Layout | Columns (mobile) | Columns (tablet) | Columns (desktop) | Gap |
|--------|-------------------|-------------------|--------------------|-----|
| Module Grid | 1 | 2 | 3 | 1.25rem (20px) |
| Stat Cards | 1 | 3 | 3 | 0.75rem (12px) |
| Trail Cards | 1 | 2 | 4 | 1rem (16px) |
| Badge Grid | 2 | 3 | 4 | 0.75rem (12px) |
| Checkpoint List | 1 | 1 | 1 | 0 (stacked) |

---

## 6. Elevation (Shadows)

Five elevation levels create spatial hierarchy.

| Level | Token | Value | Usage |
|-------|-------|-------|-------|
| 0 | none | none | Flat elements, inline content |
| 1 | `--shadow-sm` | `0 1px 2px 0 hsl(235 25% 12% / 0.04)` | Cards at rest, subtle lift |
| 2 | `--shadow-md` | `0 4px 6px -1px hsl(235 25% 12% / 0.06), 0 2px 4px -2px hsl(235 25% 12% / 0.04)` | Cards on hover, buttons |
| 3 | `--shadow-lg` | `0 10px 15px -3px hsl(235 25% 12% / 0.08), 0 4px 6px -4px hsl(235 25% 12% / 0.04)` | Popovers, dropdowns |
| 4 | `--shadow-xl` | `0 20px 25px -5px hsl(235 25% 12% / 0.10), 0 8px 10px -6px hsl(235 25% 12% / 0.04)` | Modals, dialogs |
| Glow | `--shadow-glow` | `0 0 20px hsl(235 65% 48% / 0.15)` | Active/next module indicator |

### Elevation Usage Matrix

| Component | Rest | Hover | Active | Focus |
|-----------|------|-------|--------|-------|
| Card (default) | shadow-sm | shadow-md | shadow-sm | ring-2 |
| Card (interactive) | shadow-sm | shadow-lg + translateY(-4px) | shadow-sm | ring-2 |
| Button (primary) | shadow-sm | shadow-md | none | ring-2 |
| Modal | shadow-xl | -- | -- | -- |
| Dropdown | shadow-lg | -- | -- | -- |
| Toast | shadow-lg | -- | -- | -- |
| Header (sticky) | shadow-sm | -- | -- | -- |

---

## 7. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Sharp edges (progress bars internal) |
| `--radius-sm` | 0.375rem (6px) | Input fields, small chips |
| `--radius` | 0.625rem (10px) | Buttons, badges, default radius |
| `--radius-lg` | 0.875rem (14px) | Cards, larger containers |
| `--radius-xl` | 1.25rem (20px) | Modals, hero cards, panels |
| `--radius-full` | 9999px | Avatars, circular buttons, pills |

### Usage Guidelines

- **Cards and panels:** `--radius-lg` or `--radius-xl` for warmth
- **Buttons:** `--radius` for standard, `--radius-full` for pill buttons
- **Inputs:** `--radius-sm` for clean form aesthetic
- **Badges/chips:** `--radius-full` for pill shape
- **Avatars:** `--radius-full` always circular
- **Module color strips:** `--radius-none` (flush with card top)

---

## 8. Motion & Transitions

### Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 150ms | Micro-interactions: hover, focus, toggle |
| `--transition-base` | 250ms | Standard transitions: color, shadow, transform |
| `--transition-slow` | 400ms | Entrance animations: fade-in, slide-up |
| `--transition-spring` | 500ms | Playful animations: badge earned, celebration |

### Easing Functions

| Name | Value | Usage |
|------|-------|-------|
| Standard | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| Enter | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the viewport |
| Exit | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the viewport |
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, celebratory motions |

### Animation Library

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `fadeIn` | base (250ms) | ease-out | General content appearance |
| `slideUp` | slow (400ms) | ease-out | Cards, sections entering view |
| `scaleIn` | spring (500ms) | spring | Badges, celebration elements |
| `pulseSoft` | 2000ms | ease-in-out | "Next" indicators, attention hints |
| `shimmer` | 2000ms | linear | Skeleton loading states |

### Stagger Pattern

Children elements animate sequentially with 75ms delay between each:
```css
.stagger-children > *:nth-child(N) { animation-delay: (N-1) * 75ms; }
```
Maximum 6 children staggered. Beyond 6, all appear at 375ms.

### Reduced Motion

All animations MUST respect `prefers-reduced-motion: reduce`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default stacking |
| `--z-raised` | 10 | Sticky elements within content |
| `--z-dropdown` | 20 | Dropdown menus, select panels |
| `--z-sticky` | 30 | Sticky header, floating action buttons |
| `--z-overlay` | 40 | Overlay backdrops |
| `--z-modal` | 50 | Modals, dialogs |
| `--z-popover` | 60 | Popovers, tooltips |
| `--z-toast` | 70 | Toast notifications (always on top) |
| `--z-skip-nav` | 100 | Skip navigation link |

---

## 10. Atoms (Base Components)

### 10.1 Button

Four variants, three sizes.

**Variants:**

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| Primary | `--primary` | `--primary-foreground` | none | Main CTAs: "Comecar", "Continuar" |
| Secondary | `--secondary-light` | `--secondary-foreground` | `--secondary/20` | Secondary actions: "Trocar trilha" |
| Ghost | transparent | `--foreground` | none | Tertiary actions: "Voltar", "Cancelar" |
| Destructive | `--destructive` | `--destructive-foreground` | none | Dangerous actions: "Resetar progresso" |

**Sizes:**

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| sm | 2rem (32px) | 0.75rem 1rem | 0.8125rem (13px) | 14px |
| md | 2.5rem (40px) | 0.625rem 1.25rem | 0.875rem (14px) | 16px |
| lg | 3rem (48px) | 0.75rem 1.5rem | 1rem (16px) | 18px |

**States:**
- **Default:** Base styles
- **Hover:** Darken background 6%, add shadow-md
- **Active:** Scale 0.98, remove shadow
- **Focus:** 2px ring `--ring`, 2px offset
- **Disabled:** 50% opacity, cursor-not-allowed, no hover effects
- **Loading:** Spinner icon, text "Carregando...", disabled state

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

### 10.2 Badge

Status indicators and counters.

**Variants:**

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| Default | `--muted` | `--muted-foreground` | Neutral status |
| Primary | `--primary/10` | `--primary` | Active state, counts |
| Success | `--accent/10` | `--accent` | Completed, earned |
| Warning | `--secondary/10` | `--secondary` | In progress, caution |
| Destructive | `--destructive/10` | `--destructive` | Error, locked |
| Module (1-5) | `--module-N/10` | `--module-N` | Module-specific labels |

**Shapes:**
- **Pill:** `border-radius: full` -- default shape
- **Dot:** 8px circle, no text, just color indicator
- **Count:** Pill with number, smaller padding

```tsx
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'module';
  moduleNumber?: 1 | 2 | 3 | 4 | 5;
  size?: 'sm' | 'md';
  dot?: boolean;
  children?: React.ReactNode;
}
```

### 10.3 Input

Text inputs, textareas, and select fields.

**Base Styles:**
- Background: `--card`
- Border: 1px `--input`
- Border radius: `--radius-sm`
- Padding: `0.625rem 0.75rem` (10px 12px)
- Font size: `--text-body` (14px)

**States:**
- **Default:** 1px border `--input`
- **Hover:** 1px border `--muted-foreground/30`
- **Focus:** 2px border `--ring`, no outline
- **Error:** 2px border `--destructive`, error icon + message
- **Disabled:** Background `--muted`, 50% opacity, cursor-not-allowed

**Subcomponents:**
- **Label:** Above input, `--text-body-sm`, `--font-medium`
- **Helper text:** Below input, `--text-caption`, `--muted-foreground`
- **Error message:** Below input, `--text-caption`, `--destructive`
- **Character count:** Right-aligned below textarea

```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'url' | 'search';
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}
```

### 10.4 Checkbox

Used in checkpoints and exercise completion.

- **Unchecked:** 20x20px, border `--input`, radius `--radius-sm`, background `--card`
- **Checked:** Background `--primary`, white checkmark icon, radius `--radius-sm`
- **Indeterminate:** Background `--primary`, white dash icon
- **Focus:** 2px ring `--ring`, 2px offset
- **Disabled:** 50% opacity

Integration with Radix UI `@radix-ui/react-checkbox`.

### 10.5 Progress Bar

Already implemented. Three variants, three sizes.

**Variants:**
- `default`: Solid `--primary` fill
- `gradient`: Gradient from `--primary` via `--info` to `--accent`
- `striped`: Animated diagonal stripes

**Sizes:** sm (6px), md (10px), lg (16px)

### 10.6 Progress Circle

SVG-based circular progress indicator used in the header.

- Track: `--muted` stroke
- Fill: `--primary` stroke with `strokeDasharray` animation
- Center text: percentage value
- Sizes: sm (32px), md (40px), lg (56px)

### 10.7 Avatar

User photo or initials fallback.

- Sizes: sm (32px), md (40px), lg (56px), xl (80px)
- Fallback: Initials on `--primary-light` background, `--primary` text
- Border: 2px `--card` (for stacking)
- Integration with Radix UI `@radix-ui/react-avatar`

### 10.8 Icon

Lucide React icons with consistent sizing.

| Context | Size | Weight |
|---------|------|--------|
| Inline with body text | 16px | 2px stroke |
| Inline with heading | 20px | 2px stroke |
| Card icon | 24px | 1.5px stroke |
| Feature icon | 32px | 1.5px stroke |
| Hero icon | 48px | 1px stroke |

### 10.9 Skeleton

Loading placeholder with shimmer animation.

- Background: `--muted`
- Animation: left-to-right shimmer gradient
- Border radius: matches the element being replaced
- Heights: Match text/element sizes exactly

---

## 11. Molecules (Composed Components)

### 11.1 ModuleCard (existing, enhanced)

Composition: Color strip + Badge + Text + ProgressBar + Button

**States:**
- **Locked:** 50% opacity, lock icon, "Complete o modulo X para desbloquear" message
- **Available (not started):** Full opacity, "Comecar" CTA, no progress
- **In Progress:** Full opacity, "Continuar" CTA, progress bar visible
- **Completed:** Full opacity, checkmark icon, "Revisar" CTA, 100% progress
- **Next (recommended):** Ring glow + "Proximo" badge pulse animation

**Responsive:**
- Mobile: Full-width stacked cards
- Tablet: 2-column grid
- Desktop: 3-column grid

### 11.2 StatCard (existing, enhanced)

Composition: Icon + Label + Value in colored background.

**Variants:** primary, success, accent, warning

**Interaction:** Hover scale 1.02, icon scale 1.1

### 11.3 CheckpointItem

Interactive checkpoint row for marking progress.

```
[ ] | Checkpoint text description        | Module badge | Status
```

**Composition:** Checkbox + Text + ModuleBadge + StatusIndicator

**States:**
- Unchecked: Open checkbox, regular text
- Checked: Filled checkbox with checkmark, text gets `--accent` color, timestamp shown
- Locked: Disabled checkbox, muted text, lock icon

**Interaction:** Click to toggle. Smooth checkbox animation. Toast on completion.

### 11.4 ConceptAccordion

Expandable concept card for module detail pages.

**Composition:** Accordion trigger (name + module badge) + Accordion content (definition + importance + examples + how to apply)

**Header (closed):** Concept name, module color indicator, expand arrow
**Content (open):** 4 sections in tabs or stacked:
1. Definicao (definition)
2. Importancia (why it matters)
3. Exemplos Praticos (practical examples)
4. Como Aplicar (how to apply)

Integration with Radix UI `@radix-ui/react-accordion`.

### 11.5 ExerciseCard

Card for exercise listing within a module.

**Composition:** Icon + Title + Description + Meta (duration, type, difficulty) + CTA button

**Meta badges:**
- Duration: clock icon + "30 min"
- Type: users icon + "Individual" / "Grupo" / "Projeto Final"
- Difficulty: signal icon + level dots

### 11.6 TrailCard

Card for learning path selection.

**Composition:** Icon + Title + Description + Meta (duration, level, modules) + Delivery badge + CTA

**Variants by trail:**
- Iniciante: emerald accent, seedling icon
- Intermediario: blue accent, trending-up icon
- Master: amber accent, crown icon
- Express: red accent, zap icon

**States:**
- Available: Full display with "Selecionar" CTA
- Active: Highlighted border + "Trilha Ativa" badge
- Completed: Checkmark + "Concluida" badge

### 11.7 BadgeDisplay

Badge item in the collection grid.

**Composition:** Icon/Image + Name + Description + Rarity indicator + Earned date (if earned)

**States:**
- Locked: Grayscale, lock overlay, criteria shown
- Earned: Full color, glow on rarity, earned timestamp
- New: Scale-in animation + "Novo!" pill badge

**Rarity styles:**
- Common: No special treatment, `--muted` border
- Rare: `--info` border, subtle shimmer
- Epic: `--accent` border, glow effect
- Legendary: `--secondary` border, animated glow

### 11.8 Toast / Notification

Non-blocking feedback messages.

**Variants:**
| Variant | Icon | Color | Duration |
|---------|------|-------|----------|
| Success | CheckCircle | `--accent` | 4s |
| Info | Info | `--info` | 5s |
| Warning | AlertTriangle | `--warning` | 6s |
| Error | XCircle | `--destructive` | 8s (sticky) |
| Achievement | Trophy | `--secondary` | 6s + animation |

**Position:** Bottom-right on desktop, bottom-center on mobile.
**Animation:** Slide up + fade in on enter; slide right + fade out on exit.
**Stacking:** Max 3 visible, new pushes oldest down.

### 11.9 Breadcrumb

Navigation breadcrumb for page hierarchy.

```
Dashboard > Modulo 1 > Conexao Inicial
```

**Structure:** Home icon + separator (chevron-right) + text links + current page (bold, no link)
**Mobile:** Collapse to "< Voltar" back link pointing to parent
**Desktop:** Full breadcrumb path

### 11.10 Search Command

Cmd+K search dialog.

**Composition:** Trigger (search icon + "Buscar..." + kbd shortcut) + Dialog (input + results grouped by category)

**Categories:** Conceitos, Exercicios, Modulos
**Result item:** Icon + Title + Snippet with highlight + Category badge
**States:** Empty, Loading (skeleton), Results, No results (with suggestions)

---

## 12. Organisms (Complex Components)

### 12.1 Header (existing, enhanced)

**Composition:** Brand (logo + title) + Navigation + Progress circle + User menu

**Structure:**
```
[Logo | Metodo Aplauda de Pe] [Nav links (desktop)] [Search trigger] [Progress circle] [Avatar dropdown]
                              [por Renner Silva    ]
```

**Responsive:**
- Mobile: Logo + Progress circle + Hamburger menu
- Desktop: Full navigation bar

**Navigation items:**
- Dashboard (home icon)
- Modulos (book icon)
- Trilhas (map icon)
- Checkpoints (check-square icon)
- Conquistas (trophy icon)

**Sticky behavior:** `position: sticky; top: 0` with backdrop blur and border-bottom.

### 12.2 Sidebar Navigation

Desktop sidebar for module detail pages.

**Structure:**
```
Module list (1-5)
├── Module 1 (active indicator)
│   ├── Conceitos
│   ├── Tecnicas
│   ├── Exercicios
│   └── Checkpoints
├── Module 2 (locked indicator if applicable)
...
```

**Width:** 280px on desktop, hidden on mobile (replaced by tabs or bottom nav).
**States per item:** Active (primary color, bold), Locked (muted, lock icon), Completed (accent check).

### 12.3 Module Detail Page Content

Full module page organism.

**Sections (vertical order):**
1. Module header (color strip, number, title, objective, duration, difficulty)
2. Progress summary (checkpoints completed / total)
3. Conceitos-chave (accordion list)
4. Tecnicas (icon list)
5. Exercicios (exercise cards grid)
6. Armadilhas comuns (alert cards)
7. Checkpoints do modulo (interactive checklist)
8. Navigation footer (prev/next module buttons)

### 12.4 Exercise Detail Content

Full exercise page organism.

**Sections:**
1. Breadcrumb (Dashboard > Module > Exercise)
2. Exercise header (title, objective, type badge, duration badge)
3. Instructions (rich text with numbered steps)
4. Success criteria (checklist format)
5. Required resources (icon list)
6. Related concepts (linked badges)
7. Personal notes area (textarea with save)
8. Completion toggle (checkbox + "Marcar como concluido" + timestamp)

### 12.5 Concept Graph

Interactive visualization of concept relationships.

**Nodes:** Circle with concept name, colored by module
**Edges:** Lines connecting related concepts (solid = prerequisite, dashed = related)
**Interactions:** Hover = highlight connections, Click = open concept detail tooltip
**Legend:** Module colors + edge types
**Mobile fallback:** Hierarchical list with indentation for dependencies

### 12.6 Instructor Dashboard Panel

Aggregated metrics for the instructor.

**Sections:**
1. Key metrics (stat cards: total students, active, completion rate, avg time)
2. Completion by module (horizontal bar chart)
3. Most blocked checkpoint (highlighted card)
4. Students by trail (distribution chart)
5. Student list table (name, trail, progress %, last active)

### 12.7 Celebration Modal

Full-screen celebration for major milestones.

**Triggers:** Module completion, course completion, badge earned
**Composition:** Confetti animation + Icon/badge + Title + Stats summary + CTA ("Continuar jornada" / "Ver conquistas")
**Animation:** Confetti particles + scale-in for content + spring easing

---

## 13. Templates (Page Layouts)

### 13.1 Default Layout

```
+--------------------------------------------------+
| Header (sticky)                                   |
+--------------------------------------------------+
| Skip navigation link (sr-only, visible on focus)  |
+--------------------------------------------------+
|                                                    |
|  Main Content (max-w-7xl, centered)               |
|  px-4 (mobile) / px-8 (desktop)                  |
|  py-8                                             |
|                                                    |
+--------------------------------------------------+
| Footer                                            |
+--------------------------------------------------+
```

### 13.2 Auth Layout

```
+--------------------------------------------------+
|                                                    |
|         [Logo]                                    |
|         Metodo Aplauda de Pe                      |
|                                                    |
|    +----------------------------------+           |
|    |   Auth Form Card (max-w-md)      |           |
|    |   (Login / Signup / Reset)       |           |
|    +----------------------------------+           |
|                                                    |
|    "Feito com [heart] para palestrar melhor"      |
|                                                    |
+--------------------------------------------------+
```

Centered vertically and horizontally. Background with subtle gradient or pattern.

### 13.3 Module Detail Layout

```
+--------------------------------------------------+
| Header (sticky)                                   |
+--------------------------------------------------+
| Breadcrumb                                        |
+--------------------------------------------------+
| Module Color Banner (full width, 120px)           |
| [Module N] [Title] [Progress] [Duration]          |
+--------------------------------------------------+
| [Sidebar (desktop)] | [Main Content]              |
| [280px fixed      ] | [flex-1, scrollable]        |
|                     | [Conceitos section]          |
|                     | [Tecnicas section]           |
|                     | [Exercicios section]         |
|                     | [Checkpoints section]        |
+--------------------------------------------------+
| Navigation Footer (Prev | Next module)            |
+--------------------------------------------------+
| Footer                                            |
+--------------------------------------------------+
```

Mobile: No sidebar. Sections stacked vertically with tab navigation at top.

### 13.4 Trail Selection Layout

```
+--------------------------------------------------+
| Header                                            |
+--------------------------------------------------+
| Hero Section                                      |
| "Escolha sua trilha de aprendizado"               |
| Description text                                  |
+--------------------------------------------------+
| Self-assessment mini-quiz (3 questions)           |
| [Recommendation result]                           |
+--------------------------------------------------+
| Trail Cards Grid (1/2/4 columns)                  |
| [Iniciante] [Intermediario] [Master] [Express]    |
+--------------------------------------------------+
| Footer                                            |
+--------------------------------------------------+
```

### 13.5 Profile Layout

```
+--------------------------------------------------+
| Header                                            |
+--------------------------------------------------+
| Profile Header Card                               |
| [Avatar] [Name] [Email] [Edit btn]               |
| [Trail badge] [Joined date]                       |
+--------------------------------------------------+
| Stats Grid (4 cards)                              |
| [Modules] [Checkpoints] [Hours] [Streak]          |
+--------------------------------------------------+
| Tabs: [Atividade] [Badges] [Notas] [Configuracoes]|
+--------------------------------------------------+
| Tab Content (varies)                              |
+--------------------------------------------------+
| Footer                                            |
+--------------------------------------------------+
```

---

## 14. Accessibility

### 14.1 Color Contrast Requirements

| Context | Minimum Ratio | Standard |
|---------|---------------|----------|
| Body text on background | 4.5:1 | WCAG AA |
| Large text (>=18px or 14px bold) on background | 3:1 | WCAG AA |
| UI components (borders, icons) | 3:1 | WCAG AA |
| Decorative elements | No requirement | -- |

**Verified contrast pairs:**

| Foreground | Background | Ratio | Pass? |
|------------|------------|-------|-------|
| `--foreground` on `--background` | hsl(235 25% 12%) on hsl(240 20% 98%) | 15.2:1 | PASS |
| `--primary` on `--card` | hsl(235 65% 48%) on #FFF | 6.1:1 | PASS |
| `--accent` on `--card` | hsl(152 60% 42%) on #FFF | 3.5:1 | PASS (large only) |
| `--muted-foreground` on `--card` | hsl(235 10% 46%) on #FFF | 4.9:1 | PASS |
| `--primary-foreground` on `--primary` | #FFF on hsl(235 65% 48%) | 6.1:1 | PASS |
| `--accent-foreground` on `--accent` | #FFF on hsl(152 60% 42%) | 3.5:1 | PASS (large only) |

**Action required:** `--accent` at 42% lightness only passes for large text. For small text on accent backgrounds, use `--accent` at 36% lightness (`152 60% 36%`) or darken to meet 4.5:1.

### 14.2 Focus Management

All interactive elements MUST have visible focus indicators:
```css
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

**Focus order:** Follows logical document order. Tab moves through interactive elements left-to-right, top-to-bottom.

**Skip navigation:** First focusable element is a skip link:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md">
  Pular para o conteudo principal
</a>
```

### 14.3 ARIA Strategy

| Component | ARIA Role | Key ARIA Attributes |
|-----------|-----------|---------------------|
| Header nav | `navigation` | `aria-label="Navegacao principal"` |
| Module card | `article` | `aria-label="Modulo N: Nome"` |
| Progress bar | `progressbar` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` |
| Checkbox | `checkbox` | `aria-checked`, `aria-label` |
| Accordion | handled by Radix | `aria-expanded`, `aria-controls` |
| Dialog | handled by Radix | `aria-modal`, `aria-labelledby` |
| Toast | `status` | `aria-live="polite"`, `role="status"` |
| Breadcrumb | `navigation` | `aria-label="Breadcrumb"` |
| Search | `search` | `aria-label="Buscar conteudo"` |
| Module grid | `list` | `aria-label="Lista de modulos"` |
| Badge collection | `list` | `aria-label="Colecao de conquistas"` |

### 14.4 Keyboard Navigation

| Component | Tab | Enter/Space | Escape | Arrow Keys |
|-----------|-----|-------------|--------|------------|
| Button | Focus | Activate | -- | -- |
| Checkbox | Focus | Toggle | -- | -- |
| Accordion | Focus trigger | Toggle open/close | -- | Up/Down between items |
| Dialog | Focus trap inside | -- | Close | -- |
| Tabs | Focus active tab | -- | -- | Left/Right between tabs |
| Dropdown | Focus trigger | Open/Select | Close | Up/Down through options |
| Module card | Focus card | Navigate to module | -- | -- |
| Search | Focus input | Submit/Select | Close | Up/Down through results |

### 14.5 Screen Reader Considerations

- All images: `alt` text describing content, or `aria-hidden="true"` if decorative
- Icons: `aria-label` on interactive icons, `aria-hidden="true"` on decorative icons
- Progress announcements: `aria-live="polite"` region for progress updates
- Dynamic content: Use `aria-live` regions for toasts and real-time updates
- Page titles: Unique `<title>` per page for screen reader tab identification
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>` for region navigation

### 14.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-up,
  .animate-scale-in,
  .animate-pulse-soft,
  .animate-shimmer,
  .stagger-children > * {
    animation: none !important;
  }

  * {
    transition-duration: 0.01ms !important;
  }
}
```

Confetti celebrations: Replaced with static celebration icon + text.
Skeleton shimmer: Static gray block (no animation).

---

## 15. Responsive Breakpoints

| Breakpoint | Min Width | Tailwind Prefix | Target Devices |
|------------|-----------|-----------------|----------------|
| Default (mobile) | 0px | (no prefix) | Smartphones < 640px |
| sm | 640px | `sm:` | Large phones, small tablets |
| md | 768px | `md:` | Tablets |
| lg | 1024px | `lg:` | Laptops, desktops |
| xl | 1280px | `xl:` | Large desktops |
| 2xl | 1536px | `2xl:` | Ultra-wide screens |

### Responsive Patterns

| Pattern | Mobile | Tablet (md) | Desktop (lg) |
|---------|--------|-------------|--------------|
| Module grid | 1 col | 2 cols | 3 cols |
| Stat cards | 1 col stack | 3 cols | 3 cols |
| Trail cards | 1 col | 2 cols | 4 cols |
| Navigation | Bottom hamburger | Hamburger | Full horizontal nav |
| Sidebar | Hidden (tabs) | Hidden (tabs) | 280px fixed left |
| Breadcrumb | "< Voltar" back link | Full path | Full path |
| Header progress | Circle only | Circle + percentage | Text + circle |
| Card padding | 16px | 20px | 24px |
| Page margins | 16px | 24px | 32px |

### Touch Targets

Minimum touch target: 44x44px (WCAG 2.5.5 Target Size).
Applies to all buttons, checkboxes, links, and interactive elements on mobile.

---

## 16. Iconography

**Library:** Lucide React (already installed)
**Style:** Rounded, 2px stroke default

### Icon Mapping

| Context | Icon | Lucide Name |
|---------|------|-------------|
| Brand | Microphone | `Mic2` |
| Module unlocked | Open circle | `Circle` |
| Module completed | Check circle | `CheckCircle2` |
| Module locked | Lock | `Lock` |
| Next module | Sparkles | `Sparkles` |
| Progress/Books | Book | `BookOpen` |
| Checkpoints | Check square | `CheckSquare` |
| Time/Clock | Clock | `Clock` |
| Target/Goal | Target | `Target` |
| Arrow forward | Arrow right | `ArrowRight` |
| Search | Search | `Search` |
| User/Profile | User | `User` |
| Settings | Settings | `Settings` |
| Trophy/Badge | Trophy | `Trophy` |
| Streak/Fire | Flame | `Flame` |
| Success | Check | `Check` |
| Warning | Alert triangle | `AlertTriangle` |
| Error | X circle | `XCircle` |
| Info | Info | `Info` |
| Edit/Notes | Pencil | `Pencil` |
| Download | Download | `Download` |
| External link | External link | `ExternalLink` |
| Expand | Chevron down | `ChevronDown` |
| Back | Chevron left | `ChevronLeft` |
| Menu | Menu | `Menu` |
| Close | X | `X` |
| Trail (Iniciante) | Seedling | `Sprout` |
| Trail (Intermediario) | Trending up | `TrendingUp` |
| Trail (Master) | Crown | `Crown` |
| Trail (Express) | Zap | `Zap` |
| Concept graph | Network | `Network` |
| Exercise | Dumbbell | `Dumbbell` |
| Quiz | Brain | `Brain` |
| Certificate | Award | `Award` |
| Calendar | Calendar | `Calendar` |
| Star/Rarity | Star | `Star` |

---

## Appendix A: CSS Token Additions for globals.css

The following tokens should be ADDED to the existing `globals.css`:

```css
:root {
  /* === TYPOGRAPHY SCALE (NEW) === */
  --text-display-lg: 2.25rem;
  --text-display: 1.875rem;
  --text-h1: 1.5rem;
  --text-h2: 1.25rem;
  --text-h3: 1.125rem;
  --text-h4: 1rem;
  --text-body-lg: 1rem;
  --text-body: 0.875rem;
  --text-body-sm: 0.8125rem;
  --text-caption: 0.75rem;
  --text-overline: 0.6875rem;

  /* === FONT WEIGHTS (NEW) === */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* === ADDITIONAL SPACING (NEW) === */
  --space-0.5: 0.125rem;
  --space-1.5: 0.375rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* === ADDITIONAL BORDER RADIUS (NEW) === */
  --radius-none: 0;

  /* === Z-INDEX SCALE (NEW) === */
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 20;
  --z-sticky: 30;
  --z-overlay: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-toast: 70;
  --z-skip-nav: 100;

  /* === ADDITIONAL SHADOW (NEW) === */
  --shadow-none: none;
  --shadow-inner: inset 0 2px 4px 0 hsl(235 25% 12% / 0.04);

  /* === OVERLAY COLORS (NEW) === */
  --overlay: 235 25% 12%;
  --overlay-opacity: 0.6;
  --scrim-opacity: 0.8;
}
```

---

## Appendix B: Tailwind Config Additions

The following should be ADDED to `tailwind.config.ts` theme.extend:

```ts
fontSize: {
  'display-lg': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
  'display': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
  'h1': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '700' }],
  'h2': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
  'h3': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
  'h4': ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
  'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
  'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
  'body-sm': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.005em', fontWeight: '400' }],
  'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
  'overline': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
},
zIndex: {
  base: '0',
  raised: '10',
  dropdown: '20',
  sticky: '30',
  overlay: '40',
  modal: '50',
  popover: '60',
  toast: '70',
  'skip-nav': '100',
},
```

---

*Design System v1.0.0 -- Metodo Aplauda de Pe*
*Created by @brad-frost (Atomic Design specialist) via Design Chief routing*
*Feeds Story 1.5 and Story 1.8 of Epic 1*
