# Optimization Quality Gate

Validation checklist run after Phase 2 (Optimize) to ensure all changes are safe and correct.

---

## Blocking Checks (MUST pass)

### Meta Tags
- [ ] No meta title exceeds 60 characters
- [ ] No meta description exceeds 160 characters
- [ ] No duplicate meta titles across pages
- [ ] No duplicate meta descriptions across pages
- [ ] All meta tags contain valid UTF-8 text

### Schema/JSON-LD
- [ ] All generated JSON-LD passes syntax validation
- [ ] All required properties present per schema type
- [ ] No schema references content not visible on page
- [ ] @id values are consistent across pages
- [ ] No deprecated schema types used

### Technical
- [ ] No new broken links introduced
- [ ] Canonical tags point to valid URLs
- [ ] XML sitemap contains only indexable URLs
- [ ] robots.txt doesn't block important pages

### Performance
- [ ] No image width/height values mismatch aspect ratio
- [ ] lazy loading NOT applied to LCP element
- [ ] fetchpriority="high" only on LCP element (not all images)

### Files
- [ ] No files modified outside project scope
- [ ] All changes recorded in changes-manifest.json
- [ ] Before/after values captured for every modification

## Warning Checks (should pass, not blocking)

- [ ] Total improvements > 10 points (significant improvement)
- [ ] No category score decreased after optimization
- [ ] Manual recommendations provided for items that can't be auto-fixed
- [ ] llms.txt generated if missing
- [ ] OG image dimensions are 1200x630px

## Gate Decision

- **All blocking checks pass** → Proceed to Phase 3 (Report)
- **Any blocking check fails** → Fix before proceeding
