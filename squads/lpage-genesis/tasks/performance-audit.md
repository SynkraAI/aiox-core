# Performance Audit

**Task:** `performance-audit`
**Agent:** @deploy-pilot
**Type:** Quality
**Priority:** 3

---

## Description

Auditoria completa de performance via Lighthouse CLI. Verificar Core Web Vitals, bundle size, imagens, fonts e render-blocking resources.

---

## Input

```yaml
page_url: 'URL da LP (local ou deployed)'
performance_budget:
  lighthouse_score: 90
  lcp: 2500 # ms
  fid: 100 # ms
  cls: 0.1
  bundle_size: 200 # KB
```

---

## Process

### 1. Lighthouse Full Audit (@deploy-pilot)

- Performance score
- Accessibility score
- SEO score
- Best Practices score

### 2. Core Web Vitals

- LCP (Largest Contentful Paint)
- FID (First Input Delay) / INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)

### 3. Asset Analysis

- Bundle size (JS + CSS)
- Image optimization (WebP/AVIF, dimensions, lazy loading)
- Font loading strategy (display: swap)
- Render-blocking resources

### 4. Optimization Suggestions

- Priorizar por impacto
- Quick wins vs. major refactors

---

## Output

```
Entregaveis:
1. lighthouse-report.json - Full Lighthouse report
2. performance-summary.md - Summary com scores
3. optimization-suggestions.md - Sugestoes priorizadas
4. core-web-vitals.md - CWV detalhado
```

---

**Created:** 2026-02-10
**Version:** 1.0
