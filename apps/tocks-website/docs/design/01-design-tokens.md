# Tocks Website v2 — Design Tokens

**Design System:** Gilded Noir
**Version:** 1.0.0
**Last Updated:** 2026-04-16

---

## 1. Color Tokens

### Core Palette

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-bg-primary` | `#0B0B0F` | `11, 11, 15` | Page background, hero overlays |
| `--color-bg-secondary` | `#1A1A1E` | `26, 26, 30` | Card surfaces, alternate sections |
| `--color-bg-hover` | `#2A2A2E` | `42, 42, 46` | Interactive surface hover state |
| `--color-text-primary` | `#FAFAFA` | `250, 250, 250` | Headlines, body text on dark bg |
| `--color-text-secondary` | `#A0A0A0` | `160, 160, 160` | Captions, metadata, secondary info |
| `--color-accent-gold` | `#D4AF37` | `212, 175, 55` | CTAs, active states, highlights |
| `--color-accent-gold-hover` | `#E5C65C` | `229, 198, 92` | CTA hover, link hover |
| `--color-accent-gold-deep` | `#8A6F3A` | `138, 111, 58` | Borders, subtle separators, muted gold |
| `--color-accent-ivory` | `#F5F0E6` | `245, 240, 230` | Badges, emphasis text, premium labels |

### Semantic Aliases

| Token | Maps To | Context |
|-------|---------|---------|
| `--color-cta-bg` | `--color-accent-gold` | Button primary background |
| `--color-cta-bg-hover` | `--color-accent-gold-hover` | Button primary hover |
| `--color-cta-text` | `--color-bg-primary` | Text on gold buttons |
| `--color-border-default` | `--color-accent-gold-deep` | Card borders, dividers |
| `--color-border-subtle` | `rgba(212, 175, 55, 0.15)` | Faint gold separator lines |
| `--color-overlay-hero` | `rgba(11, 11, 15, 0.55)` | Hero video overlay |
| `--color-overlay-heavy` | `rgba(11, 11, 15, 0.80)` | Modal/lightbox backdrop |

### Tailwind CSS v4 Mapping

```css
/* app/globals.css */
@theme {
  --color-bg-primary: #0B0B0F;
  --color-bg-secondary: #1A1A1E;
  --color-bg-hover: #2A2A2E;
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #A0A0A0;
  --color-gold: #D4AF37;
  --color-gold-hover: #E5C65C;
  --color-gold-deep: #8A6F3A;
  --color-ivory: #F5F0E6;
}
```

Usage in classes: `bg-bg-primary`, `text-gold`, `border-gold-deep`, etc.

### Contrast Ratios (WCAG AA Compliance)

| Foreground | Background | Ratio | Pass AA? |
|------------|-----------|-------|----------|
| `#FAFAFA` | `#0B0B0F` | 18.9:1 | Yes (AAA) |
| `#FAFAFA` | `#1A1A1E` | 14.5:1 | Yes (AAA) |
| `#D4AF37` | `#0B0B0F` | 7.8:1 | Yes (AAA) |
| `#D4AF37` | `#1A1A1E` | 5.9:1 | Yes (AA) |
| `#A0A0A0` | `#0B0B0F` | 7.4:1 | Yes (AAA) |
| `#A0A0A0` | `#1A1A1E` | 5.6:1 | Yes (AA) |
| `#F5F0E6` | `#0B0B0F` | 16.8:1 | Yes (AAA) |
| `#0B0B0F` | `#D4AF37` | 7.8:1 | Yes (AAA) |

---

## 2. Typography Tokens

### Font Families

| Token | Value | Weight Range | Usage |
|-------|-------|-------------|-------|
| `--font-display` | `'Cormorant Garamond', Georgia, serif` | 400, 500, 600, 700 | Headlines H1-H4, hero text, section titles |
| `--font-body` | `'Inter', system-ui, sans-serif` | 400, 500, 600 | Body text, descriptions, form inputs |
| `--font-label` | `'Montserrat', Arial, sans-serif` | 500, 600, 700 | CTAs, badges, nav links, price tags |

### Google Fonts Load

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600&family=Montserrat:wght@500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size (px) | Size (rem) | Line Height | Letter Spacing | Font | Weight | Usage |
|-------|-----------|-----------|-------------|---------------|------|--------|-------|
| `--text-display-lg` | 80px | 5rem | 1.0 | -0.02em | Display | 700 | Hero headline (desktop) |
| `--text-display-md` | 64px | 4rem | 1.05 | -0.02em | Display | 700 | Hero headline (tablet) |
| `--text-display-sm` | 48px | 3rem | 1.1 | -0.015em | Display | 700 | Hero headline (mobile) |
| `--text-h1` | 56px | 3.5rem | 1.1 | -0.015em | Display | 600 | Page titles |
| `--text-h2` | 40px | 2.5rem | 1.15 | -0.01em | Display | 600 | Section headings |
| `--text-h3` | 32px | 2rem | 1.2 | -0.005em | Display | 500 | Sub-section headings |
| `--text-h4` | 24px | 1.5rem | 1.25 | 0 | Display | 500 | Card titles, smaller headings |
| `--text-body-lg` | 20px | 1.25rem | 1.7 | 0 | Body | 400 | Lead paragraphs, feature text |
| `--text-body-md` | 16px | 1rem | 1.7 | 0 | Body | 400 | Default body text |
| `--text-body-sm` | 14px | 0.875rem | 1.6 | 0 | Body | 400 | Captions, small print |
| `--text-label-lg` | 14px | 0.875rem | 1.2 | 0.12em | Label | 600 | Primary CTA text |
| `--text-label-md` | 12px | 0.75rem | 1.2 | 0.1em | Label | 600 | Secondary labels, nav items |
| `--text-label-sm` | 11px | 0.6875rem | 1.2 | 0.08em | Label | 500 | Badges, tags |
| `--text-price` | 28px | 1.75rem | 1.2 | 0 | Label | 700 | Price display |

### Tailwind Mapping

```css
@theme {
  --font-family-display: 'Cormorant Garamond', Georgia, serif;
  --font-family-body: 'Inter', system-ui, sans-serif;
  --font-family-label: 'Montserrat', Arial, sans-serif;
}
```

---

## 3. Spacing Scale

Base unit: 4px. All spacing derives from this base.

| Token | Value | Tailwind | Usage |
|-------|-------|---------|-------|
| `--space-1` | 4px | `p-1` | Tight internal padding (icon-text gap) |
| `--space-2` | 8px | `p-2` | Compact padding, inline gaps |
| `--space-3` | 12px | `p-3` | Button vertical padding |
| `--space-4` | 16px | `p-4` | Card internal padding, form field gaps |
| `--space-6` | 24px | `p-6` | Card padding, element group spacing |
| `--space-8` | 32px | `p-8` | Section internal padding (mobile) |
| `--space-12` | 48px | `p-12` | Section internal padding (tablet) |
| `--space-16` | 64px | `p-16` | Section vertical padding (desktop) |
| `--space-24` | 96px | `p-24` | Large section gaps, hero padding |
| `--space-32` | 128px | `p-32` | Maximum section separation |

### Container Widths

| Token | Value | Usage |
|-------|-------|-------|
| `--container-sm` | 640px | Narrow content (blog post body) |
| `--container-md` | 768px | Medium content (forms, single column) |
| `--container-lg` | 1024px | Standard content width |
| `--container-xl` | 1280px | Full content width (grids) |
| `--container-2xl` | 1440px | Maximum container width |
| `--container-padding` | 16px (mobile), 24px (tablet), 32px (desktop) | Horizontal page padding |

---

## 4. Border & Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 2px | Inputs, subtle rounding |
| `--radius-md` | 4px | Buttons, small cards |
| `--radius-lg` | 8px | Cards, modals, image containers |
| `--radius-xl` | 12px | Featured cards, tooltips |
| `--radius-full` | 9999px | Pills, avatar circles, WhatsApp FAB |
| `--border-width-default` | 1px | Standard borders |
| `--border-width-thick` | 2px | Focus rings, emphasis borders |

---

## 5. Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | Subtle lift (inputs) |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.4)` | Card default elevation |
| `--shadow-lg` | `0 8px 24px rgba(0, 0, 0, 0.5)` | Card hover, floating elements |
| `--shadow-xl` | `0 16px 48px rgba(0, 0, 0, 0.6)` | Modal, lightbox |
| `--shadow-gold` | `0 4px 16px rgba(212, 175, 55, 0.25)` | Gold CTA glow on hover |
| `--shadow-gold-intense` | `0 0 24px rgba(212, 175, 55, 0.35)` | WhatsApp FAB pulse glow |

---

## 6. Transition & Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms ease-out` | Hover color changes, opacity |
| `--transition-normal` | `300ms ease-out` | Scale transforms, slide-ins |
| `--transition-slow` | `500ms ease-in-out` | Page transitions, large reveals |
| `--transition-spring` | `500ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounces (FAB, tooltips) |
| `--transition-smooth` | `600ms cubic-bezier(0.25, 0.1, 0.25, 1)` | Parallax, scroll animations |

### Named Animations

| Name | Duration | Easing | Description |
|------|----------|--------|-------------|
| `fadeUp` | 600ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Element enters from 24px below, opacity 0 to 1 |
| `fadeIn` | 400ms | `ease-out` | Simple opacity 0 to 1 |
| `scaleIn` | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Scale from 0.95 to 1 with spring |
| `slideRight` | 500ms | `ease-out` | Horizontal slide from -24px |
| `goldPulse` | 2000ms | `ease-in-out` | Infinite subtle gold glow pulse |
| `strokeDraw` | 1500ms | `ease-in-out` | SVG stroke-dashoffset for logo preloader |
| `cursorMorph` | 200ms | `ease-out` | Custom cursor shape transition |

---

## 7. Breakpoint Tokens

| Token | Value | Description |
|-------|-------|-------------|
| `--bp-mobile` | 375px | Mobile baseline (design target) |
| `--bp-mobile-lg` | 480px | Large phones |
| `--bp-tablet` | 768px | Tablets, small laptops |
| `--bp-desktop` | 1280px | Standard desktops |
| `--bp-wide` | 1536px | Wide/ultra-wide monitors |

### Tailwind Breakpoints

```css
/* Already mapped to Tailwind defaults: sm(640), md(768), lg(1024), xl(1280), 2xl(1536) */
/* Custom override only if needed: */
@theme {
  --breakpoint-xs: 375px;
}
```

---

## 8. Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default stacking |
| `--z-dropdown` | 10 | Dropdown menus, tooltips |
| `--z-sticky` | 20 | Sticky header |
| `--z-overlay` | 30 | Hero overlay, section overlays |
| `--z-modal` | 40 | Modal backdrop + content |
| `--z-lightbox` | 50 | Image lightbox |
| `--z-fab` | 60 | WhatsApp floating button |
| `--z-cursor` | 9999 | Custom cursor (always on top) |

---

## 9. CSS Custom Properties Export

```css
:root {
  /* Colors */
  --color-bg-primary: #0B0B0F;
  --color-bg-secondary: #1A1A1E;
  --color-bg-hover: #2A2A2E;
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #A0A0A0;
  --color-accent-gold: #D4AF37;
  --color-accent-gold-hover: #E5C65C;
  --color-accent-gold-deep: #8A6F3A;
  --color-accent-ivory: #F5F0E6;

  /* Typography */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-label: 'Montserrat', Arial, sans-serif;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Borders */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
  --shadow-gold: 0 4px 16px rgba(212, 175, 55, 0.25);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 300ms ease-out;
  --transition-slow: 500ms ease-in-out;

  /* Z-Index */
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-fab: 60;
}
```
