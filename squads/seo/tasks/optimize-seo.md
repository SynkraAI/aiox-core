# optimize-seo

## Task: Apply SEO Optimizations

### Metadata
- **executor:** seo-chief (coordinates agents)
- **depends_on:** evaluate-seo (requires prior audit scores)
- **elicit:** false (uses audit data)
- **mode:** sequential-by-priority
- **output:** changes-manifest.json

### Prerequisites
- evaluate-seo must have been run first
- Audit scores and issues list available

### Execution Steps

#### Step 1: Prioritize Fixes
Sort all issues from audit by: (points recoverable * ease of fix)
- **Auto-fixable:** Meta tags, schema, OG tags, image attributes, llms.txt
- **Semi-auto:** Content restructuring, internal linking, robots.txt
- **Manual recommendation:** Content writing, author bios, trust pages

#### Step 2: Apply Fixes (by priority)

**Priority 1 — On-Page Optimizer:**
- Add/fix meta titles (keyword + benefit + brand, <60 chars)
- Add/fix meta descriptions (keyword + CTA, 120-160 chars)
- Fix heading hierarchy (single H1, logical H2>H3)
- Add Open Graph tags (og:title, og:description, og:image, og:type, og:url)
- Add Twitter Card tags (twitter:card, twitter:title, twitter:description)
- Fix image alt text

**Priority 2 — Schema Architect:**
- Generate JSON-LD for each page based on detected type
- Add Organization + WebSite schema to homepage
- Add BreadcrumbList to interior pages
- Add FAQ/HowTo schema where applicable
- Validate all generated schema

**Priority 3 — Technical Auditor:**
- Fix broken internal links
- Add/fix canonical tags
- Generate XML sitemap
- Fix/create robots.txt
- Fix redirect chains

**Priority 4 — Performance Engineer:**
- Add width/height to images missing dimensions
- Add loading="lazy" to below-fold images
- Add fetchpriority="high" to LCP element
- Add font-display: swap to @font-face rules

**Priority 5 — AI Visibility Optimizer:**
- Generate llms.txt
- Add AI crawler policy to robots.txt
- Restructure content for self-contained blocks

**Priority 6 — Content Quality Assessor:**
- Generate recommendations for E-E-A-T improvements
- Flag missing trust pages (output as TODO list)

**Priority 7 — Site Architect:**
- Generate internal linking recommendations
- Flag URL structure improvements

#### Step 3: Track All Changes
For every modification, record in changes-manifest.json:
```json
{
  "changes": [
    {
      "file": "path/to/file",
      "agent": "on-page-optimizer",
      "type": "meta_title_added",
      "before": "old value or null",
      "after": "new value",
      "points_impact": 2
    }
  ],
  "total_changes": 47,
  "total_points_recovered": 36,
  "manual_recommendations": [...]
}
```

### Veto Conditions
- Never modify files outside the project scope
- Never generate schema with syntax errors
- Never create meta titles > 60 chars or descriptions > 160 chars
- Never remove existing working functionality
- Never apply changes without recording in manifest

### Completion Criteria
- All auto-fixable issues addressed
- Changes manifest generated with before/after for each change
- Manual recommendations listed separately
- Ready for Phase 3 (re-evaluation)
