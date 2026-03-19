---
title: "Typography Hierarchy Rules"
purpose: "Define type scale, semantic tokens, vertical rhythm, responsive typography, and heading hierarchy rules for the Page Composer agent"
version: "1.0.0"
source: "Research: docs/research/2026-03-06-page-composition-ai-agents/"
created: "2026-03-06"
---

# Typography Hierarchy Rules

## 1. Modular Scale

**Ratio:** 1.25 (Major Third)
**Base:** 16px (1rem)

The Major Third ratio produces a harmonious scale where each step is 1.25x the previous. This provides clear visual distinction between levels without excessive jumps.

### Full Type Scale

| Scale Step | Size (px) | Size (rem) | Tailwind Class  | Line Height | Tailwind LH         |
|------------|-----------|------------|-----------------|-------------|----------------------|
| 8xl        | 96px      | 6rem       | `text-8xl`      | 1.0         | `leading-none`       |
| 7xl        | 72px      | 4.5rem     | `text-7xl`      | 1.0         | `leading-none`       |
| 6xl        | 60px      | 3.75rem    | `text-6xl`      | 1.0         | `leading-none`       |
| 5xl        | 48px      | 3rem       | `text-5xl`      | 1.0         | `leading-none`       |
| 4xl        | 36px      | 2.25rem    | `text-4xl`      | 1.1         | `leading-tight`      |
| 3xl        | 30px      | 1.875rem   | `text-3xl`      | 1.2         | `leading-tight`      |
| 2xl        | 24px      | 1.5rem     | `text-2xl`      | 1.25        | `leading-snug`       |
| xl         | 20px      | 1.25rem    | `text-xl`       | 1.4         | `leading-relaxed`    |
| lg         | 18px      | 1.125rem   | `text-lg`       | 1.5         | `leading-relaxed`    |
| base       | 16px      | 1rem       | `text-base`     | 1.5         | `leading-normal`     |
| sm         | 14px      | 0.875rem   | `text-sm`       | 1.43        | `leading-normal`     |
| xs         | 12px      | 0.75rem    | `text-xs`       | 1.33        | `leading-normal`     |

### Font Weight Mapping

| Weight Name  | Value | Tailwind Class     | Use Case                          |
|--------------|-------|--------------------|------------------------------------|
| Thin         | 100   | `font-thin`        | Decorative display text only       |
| Light        | 300   | `font-light`       | Large display text                 |
| Normal       | 400   | `font-normal`      | Body text, descriptions            |
| Medium       | 500   | `font-medium`      | Labels, navigation, emphasis       |
| Semibold     | 600   | `font-semibold`    | Headings, subheadings              |
| Bold         | 700   | `font-bold`        | Primary headings, strong emphasis  |
| Extrabold    | 800   | `font-extrabold`   | Hero headlines, display text       |

---

## 2. Semantic Token System

These semantic tokens map design intent to Tailwind classes. Use the semantic name when reasoning about typography; apply the Tailwind classes in code.

### Display Tokens (Hero and Marketing)

| Token        | Tailwind Classes                                                    | Use Case                   |
|--------------|---------------------------------------------------------------------|----------------------------|
| display-2xl  | `text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl`   | Hero headline (landing)    |
| display-xl   | `text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl`        | Hero headline (product)    |
| display-lg   | `text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl`        | Section hero               |

### Heading Tokens (Structural)

| Token        | Tailwind Classes                                                    | Use Case                   |
|--------------|---------------------------------------------------------------------|----------------------------|
| heading-xl   | `text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl`    | Section title (H2)         |
| heading-lg   | `text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl`     | Subsection title (H3)      |
| heading-md   | `text-lg font-semibold sm:text-xl`                                  | Card title, group head (H4)|
| heading-sm   | `text-base font-semibold`                                           | Small heading (H5)         |
| heading-xs   | `text-sm font-semibold uppercase tracking-wide`                     | Overline, label heading    |

### Body Tokens (Content)

| Token        | Tailwind Classes                                                    | Use Case                   |
|--------------|---------------------------------------------------------------------|----------------------------|
| body-lg      | `text-lg leading-relaxed text-foreground`                           | Lead paragraph, intro      |
| body-md      | `text-base leading-relaxed text-foreground`                         | Standard body text         |
| body-sm      | `text-sm leading-normal text-muted-foreground`                      | Secondary text, metadata   |

### Caption/Utility Tokens

| Token        | Tailwind Classes                                                    | Use Case                   |
|--------------|---------------------------------------------------------------------|----------------------------|
| caption      | `text-xs leading-normal text-muted-foreground`                      | Footnotes, timestamps      |
| overline     | `text-xs font-medium uppercase tracking-widest text-muted-foreground` | Category labels, badges |
| code         | `font-mono text-sm`                                                 | Inline code, technical     |
| code-block   | `font-mono text-sm leading-relaxed`                                 | Code blocks                |

---

## 3. Vertical Rhythm

### Baseline

**Baseline unit:** 24px (1.5rem) -- derived from `text-base` (16px) with `leading-normal` (1.5).

All vertical margins and paddings should be multiples of the 24px baseline to maintain consistent rhythm.

| Multiplier | Value (px) | Value (rem) | Tailwind Class | Use Case                    |
|------------|-----------|-------------|----------------|-----------------------------|
| 0.5x       | 12px      | 0.75rem     | `mt-3`         | Within tight groups          |
| 1x         | 24px      | 1.5rem      | `mt-6`         | Between paragraphs           |
| 1.5x       | 36px      | 2.25rem     | `mt-9`         | Between subsections          |
| 2x         | 48px      | 3rem        | `mt-12`        | Between sections             |
| 3x         | 72px      | 4.5rem      | `mt-18`        | Major section breaks         |
| 4x         | 96px      | 6rem        | `mt-24`        | Page-level section gaps      |

### Heading Margin Rules

| Element | Margin Top       | Margin Bottom    | Rule                                     |
|---------|------------------|------------------|------------------------------------------|
| H1      | `mt-0`           | `mb-6`           | First element; space below for subtitle  |
| H2      | `mt-12`          | `mb-6`           | Major section break above                |
| H3      | `mt-9`           | `mb-4`           | Subsection break above                   |
| H4      | `mt-6`           | `mb-3`           | Group heading                            |
| H5      | `mt-6`           | `mb-2`           | Minor heading                            |
| p       | `mt-0`           | `mb-4`  or `mb-6`| Paragraph spacing, tighter in cards      |
| ul/ol   | `mt-4`           | `mb-4`           | List spacing                             |

---

## 4. Responsive Type Scale

Type sizes adapt across breakpoints. Mobile uses smaller sizes to respect viewport constraints. Desktop uses the full scale.

### Display Text (Hero Headlines)

| Token        | Mobile (default)  | Tablet (md:)      | Desktop (lg:)     |
|--------------|-------------------|--------------------|--------------------|
| display-2xl  | `text-5xl`(48px)  | `text-6xl`(60px)  | `text-7xl`(72px)   |
| display-xl   | `text-4xl`(36px)  | `text-5xl`(48px)  | `text-6xl`(60px)   |
| display-lg   | `text-3xl`(30px)  | `text-4xl`(36px)  | `text-5xl`(48px)   |

### Heading Text

| Token        | Mobile (default)  | Tablet (sm:)       | Desktop (lg:)     |
|--------------|-------------------|--------------------|--------------------|
| heading-xl   | `text-2xl`(24px)  | `text-3xl`(30px)  | `text-4xl`(36px)   |
| heading-lg   | `text-xl`(20px)   | `text-2xl`(24px)  | `text-3xl`(30px)   |
| heading-md   | `text-lg`(18px)   | `text-xl`(20px)   | `text-xl`(20px)    |
| heading-sm   | `text-base`(16px) | `text-base`(16px) | `text-base`(16px)  |

### Body Text

| Token        | Mobile (default)  | Tablet (sm:)       | Desktop (lg:)     |
|--------------|-------------------|--------------------|--------------------|
| body-lg      | `text-base`(16px) | `text-lg`(18px)   | `text-lg`(18px)    |
| body-md      | `text-base`(16px) | `text-base`(16px) | `text-base`(16px)  |
| body-sm      | `text-sm`(14px)   | `text-sm`(14px)   | `text-sm`(14px)    |

### Implementation Example

```html
<!-- display-2xl responsive -->
<h1 class="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
  Hero Headline
</h1>

<!-- heading-xl responsive -->
<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
  Section Title
</h2>

<!-- body-lg responsive -->
<p class="text-base leading-relaxed text-foreground sm:text-lg">
  Lead paragraph with larger text.
</p>
```

---

## 5. Heading Hierarchy Rules

### Rule 1: One H1 Per Page

Every page MUST have exactly one `<h1>`. It is the page title or hero headline.

| Page Type       | H1 Content                    | Token         |
|-----------------|-------------------------------|---------------|
| Landing Page    | Hero headline                 | display-2xl   |
| Product/Offer   | Product name + value prop     | display-xl    |
| Dashboard       | "Dashboard" or view name      | heading-xl    |
| Auth Flow       | "Sign In" / "Create Account"  | heading-lg    |
| Blog/Article    | Article title                 | display-lg    |
| Settings        | "Settings"                    | heading-xl    |

### Rule 2: Sequential Hierarchy

Headings MUST follow sequential order. Never skip levels.

```
CORRECT:                    INCORRECT:
H1 Page Title               H1 Page Title
  H2 Section                   H3 Section (skipped H2)
    H3 Subsection                H5 Detail (skipped H3, H4)
    H3 Subsection              H2 Section
  H2 Section
    H3 Subsection
      H4 Detail
```

### Rule 3: Heading Level to Semantic Token Mapping

| HTML Element | Semantic Token | Typical Tailwind                                  |
|--------------|----------------|---------------------------------------------------|
| `<h1>`       | display-* or heading-xl | `text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl` |
| `<h2>`       | heading-xl     | `text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl` |
| `<h3>`       | heading-lg     | `text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl` |
| `<h4>`       | heading-md     | `text-lg font-semibold sm:text-xl`                |
| `<h5>`       | heading-sm     | `text-base font-semibold`                         |
| `<h6>`       | heading-xs     | `text-sm font-semibold uppercase tracking-wide`   |

### Rule 4: Line Length

Body text MUST be constrained to **65-75 characters per line** for optimal readability.

| Method             | Tailwind Class | Max Width     | Approx Chars |
|--------------------|----------------|---------------|--------------|
| Prose width        | `max-w-prose`  | 65ch          | ~65 chars    |
| Fixed width        | `max-w-2xl`    | 672px         | ~70 chars    |
| Fixed width (wide) | `max-w-3xl`    | 768px         | ~80 chars    |

**Preferred:** `max-w-prose` for body text containers (set by character count, not pixels).

### Rule 5: Tracking (Letter Spacing)

| Size Range        | Tracking                   | Tailwind Class       |
|-------------------|----------------------------|----------------------|
| Display (5xl+)    | Tight (-0.025em)           | `tracking-tight`     |
| Heading (xl-4xl)  | Tight (-0.025em)           | `tracking-tight`     |
| Body (base-lg)    | Normal (0)                 | `tracking-normal`    |
| Caption/Overline  | Wide (0.05-0.1em)          | `tracking-wide` or `tracking-widest` |

### Rule 6: Color Hierarchy

| Text Level         | Tailwind Color Class          | Purpose               |
|--------------------|-------------------------------|-----------------------|
| Primary text       | `text-foreground`             | Headings, body text   |
| Secondary text     | `text-muted-foreground`       | Descriptions, metadata|
| Accent text        | `text-primary`                | Links, emphasis       |
| Destructive text   | `text-destructive`            | Errors, warnings      |
| Inverted text      | `text-primary-foreground`     | Text on primary bg    |

---

## 6. Page Type Typography Quick Reference

| Page Type       | H1 Token      | Body Token | Tracking   | Max Width        |
|-----------------|---------------|------------|------------|------------------|
| Landing Page    | display-2xl   | body-lg    | tight      | `max-w-4xl`      |
| Product/Offer   | display-xl    | body-md    | tight      | `max-w-4xl`      |
| Dashboard       | heading-xl    | body-sm    | tight      | `max-w-screen-xl`|
| Auth Flow       | heading-lg    | body-md    | tight      | `max-w-sm`       |
| Blog/Article    | display-lg    | body-md    | tight      | `max-w-prose`    |
| Settings        | heading-xl    | body-md    | tight      | `max-w-screen-xl`|

---

## 7. Tailwind Typography Plugin (Prose)

For long-form content (blog, documentation), use the `@tailwindcss/typography` plugin:

```html
<!-- Standard prose -->
<article class="prose dark:prose-invert">
  <!-- All child elements get proper typography -->
</article>

<!-- Large prose (body-lg) -->
<article class="prose prose-lg dark:prose-invert">
  <!-- Larger base size -->
</article>

<!-- Constrained width prose -->
<article class="prose prose-lg dark:prose-invert mx-auto max-w-prose">
  <!-- Centered, readable width -->
</article>
```

### Prose Customization

| Modifier            | Tailwind Class               | Effect                       |
|---------------------|------------------------------|------------------------------|
| Size: small         | `prose-sm`                   | 14px base                    |
| Size: default       | `prose`                      | 16px base                    |
| Size: large         | `prose-lg`                   | 18px base                    |
| Size: extra-large   | `prose-xl`                   | 20px base                    |
| Dark mode           | `dark:prose-invert`          | Inverts colors for dark mode |
| Custom link color   | `prose-a:text-primary`       | Set link color               |
| Custom heading color| `prose-headings:text-foreground` | Set heading color       |

---

## 8. Cross-References

- **Spacing and vertical rhythm details:** See [spacing-rhythm-system.md](spacing-rhythm-system.md) (KB4)
- **Typography within layout patterns:** See [page-layout-framework.md](page-layout-framework.md) (KB1)
- **Copy-driven typography decisions:** See [copy-to-layout-bridge.md](copy-to-layout-bridge.md) (KB5)

---

## 9. References

- Material Design 3 Type Scale (Google)
- Modular Scale Calculator (type-scale.com) -- 1.250 Major Third
- Tailwind CSS v4 Typography documentation
- @tailwindcss/typography plugin
- Butterick's Practical Typography (line length, vertical rhythm)
- Web Content Accessibility Guidelines (WCAG) 2.2 (text sizing, contrast)
