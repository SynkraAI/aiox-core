# Tocks Website v2 — Responsive Specs

**Design System:** Gilded Noir
**Approach:** Mobile-first
**Version:** 1.0.0

---

## 1. Breakpoints

| Name | Width | Tailwind Class | Description |
|------|-------|---------------|-------------|
| Mobile (base) | 0-479px | (default) | Phone portrait — design target: 375px |
| Mobile Large | 480-767px | `xs:` (custom) | Phone landscape, large phones |
| Tablet | 768-1023px | `md:` | Tablets, small laptops |
| Laptop | 1024-1279px | `lg:` | Standard laptops |
| Desktop | 1280-1535px | `xl:` | Desktop monitors — primary design target |
| Wide | 1536px+ | `2xl:` | Ultra-wide, large displays |

### Media Query Syntax (CSS)

```css
/* Mobile-first: base styles for mobile, override upward */
/* Tablet */
@media (min-width: 768px) { }
/* Desktop */
@media (min-width: 1280px) { }
/* Wide */
@media (min-width: 1536px) { }
```

---

## 2. Grid System

### Columns

| Breakpoint | Columns | Gap | Container Padding |
|-----------|---------|-----|-------------------|
| Mobile (0-767px) | 1 column | 16px | 16px |
| Tablet (768-1279px) | 2 columns | 24px | 24px |
| Desktop (1280px+) | 3 columns | 32px | 32px |
| Wide (1536px+) | 3-4 columns | 32px | 32px |

### Container

```css
.container {
  width: 100%;
  max-width: 1280px; /* --container-xl */
  margin: 0 auto;
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}
```

| Breakpoint | max-width | Padding |
|-----------|-----------|---------|
| Mobile | 100% | 16px |
| Tablet | 100% | 24px |
| Desktop | 1280px | 32px |
| Wide | 1440px | 32px |

### Tailwind

```html
<div class="mx-auto w-full max-w-screen-xl px-4 md:px-6 xl:px-8 2xl:max-w-[1440px]">
```

---

## 3. Typography Scaling

### Headlines

| Token | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| `display-lg` (Hero) | 48px / 3rem | 64px / 4rem | 80px / 5rem |
| `display-md` | 40px / 2.5rem | 56px / 3.5rem | 64px / 4rem |
| `display-sm` | 32px / 2rem | 40px / 2.5rem | 48px / 3rem |
| `H1` | 36px / 2.25rem | 48px / 3rem | 56px / 3.5rem |
| `H2` | 28px / 1.75rem | 32px / 2rem | 40px / 2.5rem |
| `H3` | 24px / 1.5rem | 28px / 1.75rem | 32px / 2rem |
| `H4` | 20px / 1.25rem | 22px / 1.375rem | 24px / 1.5rem |

### Body Text

| Token | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| `body-lg` | 18px | 20px | 20px |
| `body-md` | 16px | 16px | 16px |
| `body-sm` | 14px | 14px | 14px |

### Labels

Labels remain consistent across breakpoints (no scaling). Their small size and uppercase treatment already provides readability.

### Tailwind Implementation

```html
<!-- Example: H1 responsive -->
<h1 class="font-display text-4xl md:text-5xl xl:text-[3.5rem] font-semibold leading-[1.1] tracking-tight">
```

---

## 4. Section Spacing (Vertical Padding)

| Section Type | Mobile | Tablet | Desktop |
|-------------|--------|--------|---------|
| Hero | 0 (fullscreen) | 0 (fullscreen) | 0 (fullscreen) |
| Major section (e.g., Collection, Testimonials) | 48px top/bottom | 64px | 96px |
| Minor section (e.g., Numbers Bar) | 32px | 48px | 64px |
| CTA banner | 48px | 64px | 80px |
| Page header (non-hero pages) | 96px top, 32px bottom | 96px top, 48px bottom | 128px top, 48px bottom |

Page header top padding includes header height offset (64px mobile, 80px desktop).

---

## 5. Component Responsive Behavior

### Header

| Property | Mobile (0-767px) | Tablet (768-1023px) | Desktop (1024px+) |
|----------|-----------------|--------------------|--------------------|
| Height | 64px | 64px | 80px |
| Logo width | 100px | 120px | 140px |
| Navigation | Hamburger menu | Hamburger menu | Horizontal nav links |
| WhatsApp CTA | Hidden (FAB visible) | Hidden (FAB visible) | Visible (inline button) |
| Padding | 0 16px | 0 24px | 0 32px |

### Hero Section

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Height | 100svh | 100vh | 100vh |
| Headline alignment | Center | Center | Left (within container) |
| Headline max-width | 100% | 600px | 640px |
| Subheadline max-width | 100% | 480px | 480px |
| CTA size | md | lg | lg |
| Video | May fallback to poster image on slow connections | Full video | Full video |
| Scroll indicator | Hidden | Visible | Visible |

### Product Cards (in Grid)

| Property | Mobile (1-col) | Tablet (2-col) | Desktop (3-col) |
|----------|---------------|----------------|-----------------|
| Image aspect-ratio | 4/3 | 4/3 | 4/3 |
| Card padding (info) | 16px | 20px | 24px |
| Title size | H4 (20px) | H4 (22px) | H4 (24px) |
| Price size | 24px | 26px | 28px |
| Button size | sm | sm | sm |

### Collection Preview (Home Page)

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Layout | Horizontal scroll (swipeable) | 2-column grid | 4-column grid |
| Card width (scroll) | 280px | N/A | N/A |
| Scroll snap | `scroll-snap-type: x mandatory` | N/A | N/A |
| Scroll padding | 16px (start/end) | N/A | N/A |
| "See all" button | Below | Below | Below |

### Artesanato Teaser (Home, Split Section)

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Layout | Stacked (image top, text bottom) | 50/50 side-by-side | 50/50 side-by-side |
| Image aspect-ratio | 16/9 | 3/4 | 3/4 |
| Text padding | 24px 0 | 0 0 0 32px | 0 0 0 48px |
| Process peek | 3 items visible | 3 items | 3 items |

### Numbers Bar

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Layout | 2x2 grid | 4-column row | 4-column row |
| Number size | 36px | 40px | 48px |
| Gap | 16px | 24px | 32px |
| Padding | 32px 16px | 48px 24px | 64px 32px |

### Testimonial Carousel

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Visible cards | 1 | 2 | 3 |
| Card min-width | 100% | calc(50% - 12px) | calc(33.33% - 16px) |
| Navigation arrows | Hidden (swipe only) | Visible | Visible |
| Dots | Visible | Visible | Visible |

### Product Page (Detail)

| Property | Mobile | Desktop |
|----------|--------|---------|
| Layout | Stacked | 55% gallery / 45% info side-by-side |
| Gallery | Full-width main + horizontal thumb strip | Main + vertical thumb strip |
| Thumbnails | 48px, horizontal scroll | 64px, vertical stack |
| Specs table | Full-width, scrollable horizontally if needed | Standard table |
| Customization pickers | Full-width, 2 columns for swatches | 3+ columns for swatches |

### FAQ Accordion

| Property | Mobile | Desktop |
|----------|--------|---------|
| Max-width | 100% | 800px (centered) |
| Question padding | 16px | 24px |
| Question font-size | 18px | 24px (H4) |
| Answer font-size | 14px | 16px |

### Footer

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Columns | 1 (stacked) | 2x2 grid | 4-column row |
| Logo | Centered, mb-32px | Left-aligned | Left-aligned |
| Copyright bar | Centered, stacked | Centered, inline | Centered, inline |
| Padding | 48px 16px | 48px 24px | 64px 32px |

### Contact Page

| Property | Mobile | Desktop |
|----------|--------|---------|
| Form/Info split | Stacked (form first) | 55% form / 45% info side-by-side |
| Map height | 280px | 400px |
| Input height | 48px | 48px |

---

## 6. Touch Targets

WCAG 2.5.8 requires minimum 44x44px touch targets on mobile.

| Element | Minimum Size | Implementation |
|---------|-------------|----------------|
| Buttons | 48px height | Already specified in button atom |
| Nav links (mobile menu) | 48px height | `py-3` on each link |
| Hamburger icon | 48x48px | Padding around 24px icon |
| Close (X) button | 48x48px | Padding around 24px icon |
| Carousel arrows | 48x48px | Circle button |
| Accordion trigger | 48px min-height | Full-row clickable area |
| Thumbnail gallery | 48x48px minimum | 48-64px thumbnails |
| Color swatches | 44x44px | 32px swatch + 6px padding each side |
| Filter tabs | 44px min-height | `py-2.5 px-4` minimum |
| WhatsApp FAB | 56x56px | Already specified |
| Social media icons (footer) | 44x44px | Padding around 20px icons |

---

## 7. Image Handling

### Responsive Images Strategy

Use Next.js `<Image>` component with `sizes` prop for optimal delivery.

```tsx
<Image
  src="/products/berlin.jpg"
  alt="Mesa Berlin — mesa de bilhar sob medida em ipe"
  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
  fill
  className="object-cover"
  priority={isAboveFold}
/>
```

### Image Sizes per Context

| Context | Mobile | Tablet | Desktop | Format |
|---------|--------|--------|---------|--------|
| Hero video poster | 750w | 1536w | 2560w | WebP |
| Product card image | 375w | 384w | 427w | WebP |
| Product gallery main | 750w | 700w | 700w | WebP |
| Product gallery thumb | 96w | 128w | 128w | WebP |
| Blog post image | 375w | 384w | 427w | WebP |
| Project portfolio image | 375w | 384w | 427w | WebP |
| Material swatch | 112w | 112w | 112w | WebP |

### Lazy Loading

- Above-the-fold images: `priority={true}` (no lazy load)
- Below-the-fold: default lazy loading via Next.js Image
- Placeholder: `blur` with low-quality base64 placeholder

---

## 8. Performance Considerations per Breakpoint

### Mobile-Specific

- Disable parallax effects
- Disable custom cursor
- Video hero: serve lower-resolution video or fallback to poster image
- Limit animation complexity (simpler fadeIn instead of full fadeUp)
- Reduce shadow complexity (fewer layers)
- Defer non-critical CSS/JS

### Tablet-Specific

- Keep scroll animations but reduce stagger count
- Keep video but at medium resolution

### Desktop/Wide

- All features enabled
- Full parallax, custom cursor, all animations
- High-resolution assets

---

## 9. Orientation Handling

### Landscape Phone (unusual but handle gracefully)

```css
@media (max-height: 500px) and (orientation: landscape) {
  .hero {
    height: auto;
    min-height: 100svh;
    padding: 96px 0 48px;
  }
  .hero__headline {
    font-size: 2rem; /* Reduce for short viewport */
  }
}
```

### Tablet Landscape (1024x768)

Treated as `lg:` breakpoint — shows desktop navigation, uses wider grid.

---

## 10. Print Styles

```css
@media print {
  .header,
  .footer,
  .whatsapp-fab,
  .custom-cursor,
  .scroll-animations {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
  }

  a { color: black !important; text-decoration: underline; }
  a::after { content: " (" attr(href) ")"; font-size: 0.8em; }

  .product-card { break-inside: avoid; }
}
```
