# SEO Launch Checklist

> Verify all technical and on-page SEO requirements are met before publishing or indexing content.

**Fase:** SEO
**Usado por:** `workflows/content-publish.md`, `tasks/seo-audit.md`
**Items:** 10

---

## Checklist

- [ ] **Core Web Vitals green** — Confirm LCP < 2.5s, FID < 100ms, CLS < 0.1 via PageSpeed Insights or CrUX data; all three metrics must be in the green range on mobile and desktop
- [ ] **Schema markup (Article, FAQ, Product)** — Implement and validate relevant structured data using Google Rich Results Test; Article schema on all posts, FAQ schema on Q&A sections, Product/Review schema on review pages
- [ ] **Affiliate disclosure on all pages** — Visible affiliate disclosure present above the fold or immediately before any affiliate link; must comply with FTC and local market regulations
- [ ] **Author bio with E-E-A-T** — Every published piece has an author bio page demonstrating Experience, Expertise, Authoritativeness, and Trustworthiness; bio includes credentials, photos, and social/professional links
- [ ] **Comparison table on review pages** — Product/service review pages include a structured comparison table with key specs, pros/cons, and pricing; table has proper HTML markup (not image-based)
- [ ] **TL;DR section at top** — Each article includes a TL;DR or summary box within the first screen of content summarizing the key recommendation and findings
- [ ] **Internal linking structure** — Each new page links to at least 3 relevant existing pages and receives at least 1 inbound internal link from a high-authority page in the site
- [ ] **Alt text on all images** — Every image has descriptive alt text; no empty alt attributes on content images; decorative images use alt="" appropriately
- [ ] **Google Search Console verified** — Site property verified in GSC; sitemap submitted; no manual actions or coverage errors blocking target URLs
- [ ] **SSL certificate active** — HTTPS enforced site-wide; no mixed content warnings; certificate validity > 30 days; HTTP redirects properly to HTTPS with 301

---

*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
