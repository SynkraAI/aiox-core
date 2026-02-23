# Lovable Cria Quiz - Design System

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @ux-design-expert (Uma)
**Date:** 2026-02-22

---

## 1. Color System

### Brand Direction

[AUTO-DECISION] Dark or light background? --> Dark background with warm accent (reason: dark creates focus and emotional immersion for a quiz about self-discovery; reduces distractions; feels premium and different from typical white-page quizzes; high contrast with warm accents creates GRIT)

[AUTO-DECISION] Primary accent color? --> Amber/Orange (#F59E0B base) (reason: orange psychology = ambition, energy, creativity, warmth; stands out on dark backgrounds; culturally positive in Brazil; not aggressive like red, not cold like blue; pairs with each archetype's unique color)

### Core Palette

| Token | Hex | Usage | WCAG on dark |
|-------|-----|-------|-------------|
| `--bg-primary` | `#0F0F0F` | Main background | -- |
| `--bg-secondary` | `#1A1A1A` | Card backgrounds | -- |
| `--bg-elevated` | `#252525` | Hover/active cards | -- |
| `--text-primary` | `#F5F5F5` | Headings, body | 15.3:1 on #0F0F0F |
| `--text-secondary` | `#A3A3A3` | Sub-text, labels | 7.2:1 on #0F0F0F |
| `--text-muted` | `#737373` | Micro-copy, LGPD | 4.6:1 on #0F0F0F |
| `--accent-primary` | `#F59E0B` | CTAs, progress, highlights | 8.4:1 on #0F0F0F |
| `--accent-hover` | `#D97706` | Button hover | 6.8:1 on #0F0F0F |
| `--accent-pressed` | `#B45309` | Button active/pressed | 5.3:1 on #0F0F0F |
| `--border-default` | `#2E2E2E` | Card borders, dividers | -- |
| `--border-focus` | `#F59E0B` | Focus rings | -- |
| `--success` | `#22C55E` | Valid inputs, progress fill | 5.1:1 on #0F0F0F |
| `--error` | `#EF4444` | Validation errors | 5.4:1 on #0F0F0F |
| `--whatsapp` | `#25D366` | WhatsApp CTA | 5.6:1 on #0F0F0F |

### Archetype Colors

Each archetype has a signature color used on the result screen (color band, icon tint, heading).

| Archetype | Color | Hex | Psychology |
|-----------|-------|-----|-----------|
| O Comunicador | Warm Orange | `#F97316` | Energy, expression, connection |
| O Mentor | Deep Teal | `#14B8A6` | Wisdom, guidance, calm authority |
| O Construtor | Strong Blue | `#3B82F6` | Reliability, building, trust |
| O Estrategista | Rich Purple | `#8B5CF6` | Vision, strategy, uniqueness |

### Gradients (Subtle)

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-bg` | `linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)` | Page background |
| `--gradient-card-hover` | `linear-gradient(135deg, #252525 0%, #1A1A1A 100%)` | Card hover state |
| `--gradient-loading` | `radial-gradient(circle, #F59E0B20 0%, transparent 70%)` | Loading screen pulse |

---

## 2. Typography

### Font Stack

| Role | Font | Fallback | Why |
|------|------|----------|-----|
| Headings | **Inter** | system-ui, sans-serif | Modern, clean, excellent readability on mobile, widely supported by Lovable |
| Body | **Inter** | system-ui, sans-serif | Same family for consistency; Inter has excellent weight range |

[AUTO-DECISION] Single or dual font family? --> Single (Inter) with weight variation (reason: simpler for Lovable to generate; Inter's weight range (400-800) provides enough contrast; fewer HTTP requests = faster load on mobile)

### Type Scale

| Token | Size (mobile) | Size (desktop) | Weight | Line-height | Usage |
|-------|--------------|----------------|--------|------------|-------|
| `--text-h1` | 28px | 32px | 800 (ExtraBold) | 1.2 | Archetype name, main headline |
| `--text-h2` | 22px | 24px | 700 (Bold) | 1.3 | Question text, section headers |
| `--text-h3` | 18px | 20px | 600 (SemiBold) | 1.4 | Taglines, sub-sections |
| `--text-body` | 16px | 16px | 400 (Regular) | 1.6 | Body copy, descriptions |
| `--text-body-bold` | 16px | 16px | 600 (SemiBold) | 1.6 | Emphasized body text |
| `--text-label` | 14px | 14px | 700 (Bold) | 1.4 | Section labels (uppercase) |
| `--text-micro` | 12px | 12px | 400 (Regular) | 1.5 | LGPD, footnotes |
| `--text-cta` | 16px | 18px | 700 (Bold) | 1.0 | Button text |
| `--text-option` | 16px | 16px | 500 (Medium) | 1.4 | Option card text |
| `--text-option-label` | 20px | 20px | 600 (SemiBold) | 1.0 | Option letter (A/B/C/D) |

### Tailwind Classes

```
H1: text-[28px] md:text-[32px] font-extrabold leading-tight tracking-tight
H2: text-[22px] md:text-[24px] font-bold leading-snug
H3: text-lg md:text-xl font-semibold leading-snug
Body: text-base font-normal leading-relaxed
Label: text-sm font-bold uppercase tracking-wider
Micro: text-xs font-normal leading-normal
CTA: text-base md:text-lg font-bold
```

---

## 3. Spacing System

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Minimal gaps (icon-to-text) |
| `--space-2` | 8px | Tight spacing (list items) |
| `--space-3` | 12px | Card internal gap between options |
| `--space-4` | 16px | Default padding, input gaps |
| `--space-5` | 20px | Card internal padding (Q7 special) |
| `--space-6` | 24px | Page horizontal padding, section separators |
| `--space-8` | 32px | Between major sections |
| `--space-10` | 40px | Large vertical separators |
| `--space-12` | 48px | Page top padding |

### Tailwind Mapping

These map directly to Tailwind defaults: `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-5` (20px), `p-6` (24px), `p-8` (32px), `p-10` (40px), `p-12` (48px).

---

## 4. Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Input fields |
| `--radius-md` | 12px | Option cards, buttons |
| `--radius-lg` | 16px | Result card, share card |
| `--radius-full` | 9999px | Progress bar, badges |
| `--border-width` | 1px | Default borders |
| `--border-width-focus` | 2px | Focus state borders |

---

## 5. Shadows & Depth

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.3)` | Default card elevation |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.4)` | Card hover state |
| `--shadow-button` | `0 2px 8px rgba(245,158,11,0.25)` | Primary CTA glow |
| `--shadow-button-hover` | `0 4px 16px rgba(245,158,11,0.35)` | CTA hover glow |
| `--shadow-focus` | `0 0 0 3px rgba(245,158,11,0.3)` | Focus ring |

[AUTO-DECISION] Shadow intensity? --> Subtle with accent glow on CTAs (reason: dark backgrounds make heavy shadows invisible; the amber glow on buttons creates visual pull toward CTAs without being gaudy)

---

## 6. Layout Constraints

| Property | Value |
|----------|-------|
| Max content width | 480px |
| Page horizontal padding | 24px |
| Effective content width (mobile) | calc(100vw - 48px) |
| Min supported width | 320px |
| Background | Full bleed (edge to edge) |
| Content | Centered column |

---

## 7. Tailwind Config Extensions

```javascript
// tailwind.config.js extensions for Lovable
{
  theme: {
    extend: {
      colors: {
        cria: {
          bg: '#0F0F0F',
          'bg-secondary': '#1A1A1A',
          'bg-elevated': '#252525',
          accent: '#F59E0B',
          'accent-hover': '#D97706',
          'accent-pressed': '#B45309',
          border: '#2E2E2E',
          success: '#22C55E',
          error: '#EF4444',
          whatsapp: '#25D366',
        },
        archetype: {
          comunicador: '#F97316',
          mentor: '#14B8A6',
          construtor: '#3B82F6',
          estrategista: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        result: '16px',
      },
      boxShadow: {
        'cta-glow': '0 2px 8px rgba(245,158,11,0.25)',
        'cta-glow-hover': '0 4px 16px rgba(245,158,11,0.35)',
        'focus-ring': '0 0 0 3px rgba(245,158,11,0.3)',
      },
    },
  },
}
```

---

*Design System by @ux-design-expert (Uma) | LOV-1 | Phase 2*
