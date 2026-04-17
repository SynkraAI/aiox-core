# Tocks Website v2 — Interaction Specs

**Design System:** Gilded Noir
**Version:** 1.0.0

---

## 1. Hover Effects

### Product Cards

```css
.product-card {
  transition: transform 300ms ease-out, border-color 300ms ease-out, box-shadow 300ms ease-out;
}
.product-card:hover {
  transform: scale(1.03);
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.product-card__image {
  transition: transform 500ms ease-out;
}
.product-card:hover .product-card__image {
  transform: scale(1.08);
}
```

- Container has `overflow: hidden` to clip the image zoom
- Border fades from transparent to gold at 40% opacity
- Shadow increases from `--shadow-md` to `--shadow-lg`
- Total animation feels smooth and luxurious — not snappy

### Project Grid Cards (Portfolio)

```css
.project-card__overlay {
  opacity: 0;
  background: linear-gradient(to top, rgba(11, 11, 15, 0.9) 0%, transparent 60%);
  transition: opacity 400ms ease-out;
}
.project-card:hover .project-card__overlay {
  opacity: 1;
}
.project-card:hover .project-card__overlay-text {
  transform: translateY(0);  /* from translateY(12px) */
  opacity: 1;                /* from 0 */
  transition: all 400ms ease-out 100ms; /* 100ms delay after overlay appears */
}
```

### Buttons

| Variant | Hover Transform | Hover Shadow | Timing |
|---------|----------------|-------------|--------|
| Primary (Gold) | `translateY(-1px)` | `--shadow-gold` | 150ms ease-out |
| Secondary (Outline) | none | none | 150ms ease-out |
| Ghost | none | none | 150ms ease-out |
| WhatsApp FAB | `scale(1.1)` | Intensified green glow | 200ms ease-out |

### Navigation Links

```css
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #D4AF37;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 300ms ease-out;
}
.nav-link:hover::after {
  transform: scaleX(1);
}
.nav-link:hover {
  color: #D4AF37;
}
```

### Blog Post Cards

- Image: `scale(1.05)` on hover, 500ms ease-out
- Title: color transitions to `#D4AF37` on card hover, 150ms
- Container overflow: hidden

---

## 2. Scroll Animations

### Framework

Use Intersection Observer API (native) or `framer-motion` `useInView` hook.

### Fade-Up Reveal (default entrance animation)

Applied to: section headings, text blocks, cards, images.

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fadeUp 600ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}
```

**Trigger:** When element enters viewport with `threshold: 0.15` (15% visible).
**Once:** Animations play once, do not reverse on scroll up.

### Staggered Children

For grids (product cards, material swatches, etc.):

```tsx
// framer-motion approach
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 } // 100ms between each child
  }
};

const child = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};
```

### Parallax Hero

Home page hero video: `background-attachment: fixed` fallback, or `transform: translateY(calc(var(--scroll) * 0.3))` with JS scroll tracking.

- Parallax ratio: 0.3 (video moves at 30% of scroll speed)
- Performance: Use `will-change: transform` and `requestAnimationFrame`
- Mobile: Disable parallax (performance), use static positioning

### Numbers Counter Animation

Numbers bar on home page:

```tsx
// Count-up animation
const useCountUp = (target: number, duration: number = 2000) => {
  // Triggers on scroll intersection
  // Easing: ease-out (fast start, slow end)
  // Duration: 2000ms
  // Format: locale string for thousands separator (200+ not 200)
};
```

- Start: 0
- End: target value
- Duration: 2s
- Easing: `cubic-bezier(0.0, 0.0, 0.2, 1)` (decelerate)
- Suffix handling: "+" for "200+", "%" for "100%"

### ProcessTimeline Steps

Each step animates sequentially on scroll:

1. Connecting line draws from left to right (or top to bottom on mobile)
2. Circle scales in from 0 to 1 with spring easing
3. Text fades up below circle
4. 200ms delay between each step

```css
.timeline-line {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 800ms ease-out;
}
.timeline-line.in-view {
  transform: scaleX(1);
}
```

---

## 3. Page Transitions

### Strategy

Use Next.js App Router with `framer-motion` `AnimatePresence` wrapping page content.

### Default Page Transition

```tsx
const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: 'easeIn' }
  }
};
```

- Enter: 400ms fade + slight slide up (8px)
- Exit: 250ms fade + slight slide up (8px)
- Scroll position: reset to top on route change

### Route-Specific Variations

| From | To | Transition |
|------|-----|-----------|
| Any | Product Detail | Fade + slide-left (feels like drilling in) |
| Product Detail | Back (Collection) | Fade + slide-right (feels like backing out) |
| Any | Any (default) | Fade + slide-up (neutral navigation) |

---

## 4. Loading / Preloader

### Initial Page Load

Full-screen preloader on first visit to the site.

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│           [TOCKS LOGO SVG]           │
│           (stroke animation)         │
│                                      │
│                                      │
└──────────────────────────────────────┘
```

**SVG Stroke Draw Animation:**

```css
@keyframes strokeDraw {
  from {
    stroke-dashoffset: var(--path-length);
  }
  to {
    stroke-dashoffset: 0;
  }
}

.preloader-logo path {
  fill: none;
  stroke: #D4AF37;
  stroke-width: 2;
  stroke-dasharray: var(--path-length);
  stroke-dashoffset: var(--path-length);
  animation: strokeDraw 1500ms ease-in-out forwards;
}

.preloader-logo .fill-phase {
  animation: fillIn 500ms ease-out 1400ms forwards;
}

@keyframes fillIn {
  from { fill: transparent; }
  to { fill: #FAFAFA; }
}
```

**Sequence:**
1. 0-1500ms: Logo stroke draws in gold
2. 1400-1900ms: Logo fill fades in (white), overlapping slightly
3. 1900-2200ms: Preloader screen fades out, revealing page content
4. Total duration: ~2.2s

**Background:** `#0B0B0F` (same as page, seamless transition).

**Implementation:**
- Show only on initial site load (use sessionStorage flag)
- Do not show on subsequent navigation within the site
- Ensure content is loaded behind the preloader (no flash after dismiss)

---

## 5. Custom Cursor

### Desktop Only

Replace default cursor with a custom circle that morphs on interactive elements.

```
Default:        On interactive:     On click:
   ○               ●                  ◉
  12px            40px               36px
  border          filled             filled + scale
  gold            gold/20%           gold/30%
```

| State | Size | Fill | Border | Blend Mode |
|-------|------|------|--------|-----------|
| Default | 12px circle | transparent | 1.5px solid `#D4AF37` | `mix-blend-mode: difference` |
| Interactive (hover on links/buttons) | 40px circle | `rgba(212, 175, 55, 0.15)` | 1px solid `rgba(212, 175, 55, 0.3)` | difference |
| Click (mousedown) | 36px circle | `rgba(212, 175, 55, 0.25)` | 1px solid `rgba(212, 175, 55, 0.4)` | difference |
| Text hover | 4px width, 24px height (vertical bar) | `#D4AF37` | none | normal |

**Implementation:**

```tsx
// Global cursor component, mounted in layout
// Uses requestAnimationFrame for smooth tracking
// Follows mouse position with slight lerp (linear interpolation)
// lerp factor: 0.15 (slight lag for elegance)

const LERP = 0.15;
position.x += (mouse.x - position.x) * LERP;
position.y += (mouse.y - position.y) * LERP;
```

- **Z-index:** `--z-cursor` (9999)
- **Pointer-events:** none (pass-through)
- **Transition (shape morph):** 200ms ease-out
- **Hide on mobile/touch devices** (detect via `pointer: coarse` media query)
- **Hide native cursor:** `cursor: none` on `body` (desktop only)

```css
@media (pointer: fine) {
  body { cursor: none; }
}
@media (pointer: coarse) {
  .custom-cursor { display: none; }
}
```

---

## 6. Navigation Behavior

### Header Scroll Behavior

```
Scroll position 0:    transparent background
Scroll position >80:  solid background with blur
```

```css
.header--transparent {
  background: transparent;
  border-bottom: 1px solid transparent;
}
.header--solid {
  background: rgba(11, 11, 15, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}
```

Transition: `background 300ms ease-out, border-color 300ms ease-out`.

**Logic:**
- On pages with hero (Home, Atelier): start transparent
- On pages without hero (Collection, Contact, Blog, Projetos): start solid
- Scroll threshold: 80px (one header height)

### Mobile Menu (Hamburger → Fullscreen)

**Open animation:**
1. 0ms: Overlay background fades in (`opacity: 0 → 1`, 300ms)
2. 100ms: Nav links slide up and fade in, staggered 50ms each
3. 200ms: Close button fades in

**Close animation:**
1. 0ms: All content fades out simultaneously (200ms)
2. 200ms: Overlay background fades out (200ms)

```tsx
const menuVariants = {
  closed: { opacity: 0 },
  open: {
    opacity: 1,
    transition: { duration: 0.3, staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const linkVariants = {
  closed: { opacity: 0, y: 24 },
  open: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};
```

**Body scroll lock:** Apply `overflow: hidden` to `<body>` when menu is open.
**Focus trap:** Keyboard focus stays within menu when open (accessibility).

### Hamburger Icon Animation

Three lines morphing to X on open:

```
Closed:     Open:
 ───         ╲
 ───          ╳
 ───         ╱
```

- Top line: rotates 45deg, translates down
- Middle line: fades out (opacity 0, scaleX 0)
- Bottom line: rotates -45deg, translates up
- Duration: 300ms ease-out

---

## 7. WhatsApp FAB Behavior

### Pulse Animation

Every 30 seconds, a subtle attention ring:

```css
@keyframes fabPulse {
  0% {
    box-shadow: 0 4px 16px rgba(37, 211, 102, 0.35);
  }
  50% {
    box-shadow: 0 4px 16px rgba(37, 211, 102, 0.35),
                0 0 0 8px rgba(37, 211, 102, 0.15);
  }
  100% {
    box-shadow: 0 4px 16px rgba(37, 211, 102, 0.35),
                0 0 0 16px rgba(37, 211, 102, 0);
  }
}

.whatsapp-fab {
  animation: fabPulse 2s ease-in-out;
  /* Triggered every 30s via JS setInterval */
}
```

### First-Visit Tooltip

On first visit (no localStorage flag), show tooltip after 3 seconds:

```
                    ┌───────────────────┐
                    │  Fale conosco     │──▶ [WhatsApp FAB]
                    └───────────────────┘
```

| Property | Value |
|----------|-------|
| Position | left of FAB, 8px gap |
| Background | `#1A1A1E` |
| Text | "Fale conosco", body-sm, `#FAFAFA` |
| Border | 1px solid `rgba(212, 175, 55, 0.2)` |
| Border-radius | 8px |
| Padding | 8px 16px |
| Shadow | `--shadow-md` |
| Arrow | CSS triangle pointing right (toward FAB) |
| Auto-dismiss | 5s after appearing |
| Animation | fadeIn 300ms, then fadeOut 300ms at 5s mark |

**Storage flag:** `localStorage.setItem('tocks_whatsapp_tooltip_shown', 'true')`

### Click Behavior

Opens WhatsApp Web/App with pre-filled message:

```
https://wa.me/5547999999999?text=Olá! Gostaria de saber mais sobre as mesas de bilhar Tocks.
```

- Mobile: opens WhatsApp app
- Desktop: opens WhatsApp Web in new tab

---

## 8. Image Lightbox (Product Page)

### Open

1. Click on main product image
2. Backdrop fades in (300ms, `--color-overlay-heavy`)
3. Image scales from thumbnail position to center (400ms, spring easing)
4. Navigation arrows + close button fade in (200ms delay)

### Navigation

- Left/right arrows: 48px tap targets, positioned at vertical center
- Keyboard: Left/Right arrows, Escape to close
- Swipe: left/right on touch devices
- Image transition: crossfade (300ms)

### Close

- Click backdrop, press Escape, or click X
- Image shrinks back to thumbnail position (300ms)
- Backdrop fades out (200ms)

---

## 9. Before/After Slider (Projetos Page)

For project cards with before/after images:

```
┌──────────────────────────────────────┐
│          │ ◄── drag handle           │
│  BEFORE  │  AFTER                    │
│          │                           │
│          │                           │
└──────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Handle | 4px wide, full height, gold color |
| Handle grip | 40px circle centered on line, gold border, arrows icon inside |
| Drag behavior | Horizontal only, constrained to container |
| Touch | Supports touch drag |
| Labels | "Antes" / "Depois" — Label font, positioned top corners, semi-transparent bg |
| Transition | None during drag (immediate), smooth snap on release |

---

## 10. Reduced Motion Support

All animations must respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .custom-cursor { display: none; }
  .parallax { transform: none !important; }
}
```

This ensures WCAG 2.3.3 compliance for motion-sensitive users.
