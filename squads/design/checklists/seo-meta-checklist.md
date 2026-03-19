---
title: "SEO Meta Checklist"
purpose: "Validate SEO metadata for composed pages before delivery"
version: "1.0.0"
source: "Research: docs/research/2026-03-08-ai-design-tools-prompts/ (Lovable system prompt SEO rules)"
created: "2026-03-08"
agent: "page-composer"
command: "*generate-seo-meta"
---

# SEO Meta Checklist

> Run as part of Phase 9 (Quality Validation) or standalone via `*generate-seo-meta`.

## Scoring

| Score | Verdict | Action |
|-------|---------|--------|
| 10/10 | PASS | SEO ready for production |
| 7-9/10 | CONCERNS | Non-blocking warnings, document gaps |
| < 7/10 | FAIL | Fix before delivery |

---

## Checks

### 1. Title Tag

- [ ] **1.1 Exists** — Page has a `<title>` tag or Next.js `metadata.title`
- [ ] **1.2 Length** — Title is under 60 characters
- [ ] **1.3 Keyword** — Primary keyword appears in the title

### 2. Meta Description

- [ ] **2.1 Exists** — Page has `<meta name="description">` or Next.js `metadata.description`
- [ ] **2.2 Length** — Description is between 120-160 characters
- [ ] **2.3 CTA** — Description includes a call-to-action or value proposition

### 3. Heading Structure

- [ ] **3.1 Single H1** — Page has exactly ONE `<h1>` element
- [ ] **3.2 H1 keyword** — Primary keyword appears in the H1
- [ ] **3.3 Hierarchy** — Headings follow sequential order (H1 → H2 → H3, no skips)

### 4. Semantic HTML

- [ ] **4.1 Landmarks** — Uses `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>` appropriately

### 5. Images

- [ ] **5.1 Alt text** — All `<img>` elements have descriptive `alt` attributes
- [ ] **5.2 Lazy loading** — Images below the fold use `loading="lazy"`

### 6. Structured Data (conditional)

- [ ] **6.1 JSON-LD** — Landing/product pages include JSON-LD schema (Organization, Product, or FAQ)

### 7. Performance

- [ ] **7.1 Canonical** — Page has `<link rel="canonical">` tag

---

## SEO Meta Template

When generating SEO meta for a composed page:

```tsx
// Next.js App Router
export const metadata: Metadata = {
  title: "[Primary Keyword] — [Brand] | [Value Prop]",  // < 60 chars
  description: "[What the page offers]. [Who it's for]. [CTA].",  // 120-160 chars
  openGraph: {
    title: "[Same as title or shorter variant]",
    description: "[Same as description]",
    type: "website",
  },
};
```

```html
<!-- HTML fallback -->
<head>
  <title>[Primary Keyword] — [Brand]</title>
  <meta name="description" content="[120-160 chars]" />
  <link rel="canonical" href="https://[domain]/[path]" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "[Page Title]",
    "description": "[Description]"
  }
  </script>
</head>
```

---

## Page Type SEO Defaults

> Canonical source: `squads/design/data/seo-rules.md` Section "Page Type SEO Matrix".
> This table is a quick reference. For full rules, consult the canonical source.

| Page Type | JSON-LD Type | Priority Keywords |
|-----------|-------------|-------------------|
| Landing | Organization, Product | Brand name, value prop |
| Product/Offer | Product, Offer | Product name, pricing |
| Dashboard | WebApplication | App name, feature |
| Auth | — (noindex) | — |
| Blog | Article, BlogPosting | Topic, author |
| Settings | — (noindex) | — |
