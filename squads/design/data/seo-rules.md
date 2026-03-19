---
title: "SEO Rules"
purpose: "SEO metadata rules for page composition, extracted from Lovable system prompt and industry best practices"
version: "1.0.0"
source: "Research: docs/research/2026-03-08-ai-design-tools-prompts/ (Lovable system prompt)"
created: "2026-03-08"
---

# SEO Rules for Page Composition

## Core Rules

### Title Tag
- Maximum 60 characters
- Primary keyword near the beginning
- Format: `[Keyword] — [Brand] | [Differentiator]`
- Each page MUST have a unique title

### Meta Description
- Between 120-160 characters
- Include primary keyword naturally
- End with CTA or value proposition
- Each page MUST have a unique description

### Heading Structure
- Exactly ONE `<h1>` per page
- H1 contains primary keyword
- Sequential hierarchy: H1 → H2 → H3 (no skipping H2 to go to H3)
- H2 for section titles, H3 for subsections

### Semantic HTML
- `<header>` for site header/nav
- `<main>` wrapping primary content (one per page)
- `<footer>` for site footer
- `<nav>` for navigation blocks
- `<section>` for thematic grouping (with heading)
- `<article>` for self-contained content (blog posts)
- `<aside>` for tangentially related content

### Images
- ALL `<img>` elements require descriptive `alt` text
- Decorative images: `alt=""` (empty, not missing)
- Below-fold images: `loading="lazy"`
- Hero/above-fold images: NO lazy loading (LCP optimization)
- Use `width` and `height` attributes to prevent CLS

### Structured Data (JSON-LD)
- Landing pages: `Organization` or `WebSite` schema
- Product pages: `Product` + `Offer` schema
- Blog posts: `Article` or `BlogPosting` schema
- FAQ sections: `FAQPage` schema
- Pricing pages: `Product` with `Offer` array

### Canonical Tags
- Every public page needs `<link rel="canonical" href="...">`
- Self-referencing canonical for primary pages
- Auth/settings pages: `<meta name="robots" content="noindex">`

### Performance (SEO-Adjacent)
- Lazy load all images below the fold
- Code splitting for route-based chunks
- Preload critical fonts: `<link rel="preload" as="font">`

---

## Page Type SEO Matrix

| Page Type | Index? | JSON-LD | Title Pattern | Meta Pattern |
|-----------|--------|---------|---------------|-------------|
| Landing | YES | Organization/WebSite | `[Product] — [Tagline]` | Value prop + CTA |
| Product | YES | Product + Offer | `[Product Name] — [Category]` | Features + pricing |
| Dashboard | NO | WebApplication | `[Feature] — [App Name]` | — |
| Auth | NO | — | `Sign In — [App Name]` | — |
| Blog | YES | Article/BlogPosting | `[Title] — [Blog Name]` | Summary + hook |
| Settings | NO | — | `Settings — [App Name]` | — |

---

## Integration with Page Composer

The Page Composer generates SEO metadata automatically in Phase 8 (Code Generation):

1. Extract page type from Phase 1
2. Look up SEO matrix for index/noindex decision
3. Generate title from brief's product surface + brand
4. Generate description from brief's context of use
5. Select JSON-LD type from matrix
6. Apply image lazy loading rules
7. Validate with `seo-meta-checklist.md` in Phase 9
