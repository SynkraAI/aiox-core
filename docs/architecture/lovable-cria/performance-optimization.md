# Lovable Cria Quiz - Performance Optimization

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @architect (Aria)
**Date:** 2026-02-22

---

## 1. Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| LCP (Largest Contentful Paint) | < 2.0s | Google Core Web Vitals "good" threshold |
| FCP (First Contentful Paint) | < 1.0s | User sees content immediately |
| CLS (Cumulative Layout Shift) | < 0.1 | No visual jank during quiz flow |
| TTI (Time to Interactive) | < 2.5s | CTA button responsive quickly |
| Bundle size (gzipped) | < 80kb JS + < 15kb CSS | Mobile 3G target |
| Supabase insert latency | < 500ms | p95 for quiz submission |

---

## 2. Frontend Optimizations

### Bundle Size

| Library | Estimated gzipped | Notes |
|---------|------------------|-------|
| React + ReactDOM | ~42kb | Core, unavoidable |
| Supabase client | ~15kb | Tree-shakeable, only client used |
| Application code | ~8kb | Components + logic |
| Tailwind CSS (purged) | ~10kb | PurgeCSS removes unused |
| **Total** | **~75kb** | Well under 80kb target |

### Code Splitting

Not needed for MVP. The entire quiz is a single flow under 80kb. Lazy loading individual screens would add complexity without measurable benefit at this bundle size.

[AUTO-DECISION] Lazy load ResultScreen? --> No (reason: total bundle < 80kb; code splitting overhead (webpack chunks, loading states) would be larger than the savings; all screens are needed in sequence)

### Image Strategy

- Zero raster images in the quiz flow
- SVG inline for any icons (archetype icons, back arrow, progress indicators)
- Archetype colors use CSS only (no image backgrounds)
- If hero image needed on CoverScreen: use CSS gradient or SVG illustration

### CSS Optimization

- Tailwind PurgeCSS is enabled by default in production build (`vite build`)
- No custom CSS files; all styling via Tailwind utility classes
- `Inter` font loaded via Google Fonts `<link rel="preconnect">` + `<link rel="stylesheet">`
- Font display: `swap` to prevent FOIT (Flash of Invisible Text)

### Font Loading

```html
<!-- In index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Only load weights used: 400, 500, 600, 700, 800.

### Rendering Performance

- No unnecessary re-renders: `useReducer` produces new state only on actual changes
- OptionCard uses key prop correctly for list rendering
- No heavy computations during render (archetype calculation is O(7) -- trivial)
- CSS transitions (150ms) handled by GPU (transform, opacity)

---

## 3. Backend Optimizations

### Supabase Query Performance

| Operation | Optimization |
|-----------|-------------|
| Insert quiz_responses | Single INSERT, no JOINs |
| Dedup check | Index on `(user_email, created_at::date)` |
| Fetch archetypes | 4-row table, cached in client after first fetch |
| Analytics insert | Fire-and-forget, non-blocking |

### Connection Pooling

Supabase uses PgBouncer by default. The client SDK uses the pooled connection string. No additional configuration needed for MVP traffic levels (< 1000 concurrent).

### Supabase Client Optimization

```typescript
// Single client instance, created once
export const supabase = createClient(url, key, {
  auth: { persistSession: false },  // No auth needed, save localStorage ops
  realtime: { enabled: false },     // No realtime subscriptions
});
```

Disabling auth persistence and realtime saves initialization time and removes unnecessary WebSocket connections.

---

## 4. Network Optimizations

### Asset Delivery

| Strategy | Implementation |
|----------|---------------|
| Gzip/Brotli | Configured at hosting level (Vercel/Netlify auto-enable) |
| Cache headers | Static assets: `Cache-Control: public, max-age=31536000, immutable` (Vite adds content hash to filenames) |
| CDN | Hosting provider CDN (Vercel Edge, Netlify CDN) |
| HTTP/2 | Default on modern hosting providers |

### Preloading

```html
<!-- Preload critical font weight -->
<link rel="preload" href="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2" as="font" type="font/woff2" crossorigin>
```

### API Calls Timeline

```
App mount:
  [parallel] Fetch archetypes (GET, ~100ms)
  [parallel] Generate session ID

Quiz completion (step 8 submit):
  [sequential] Validate -> Insert quiz_responses -> Show result
  [parallel, fire-forget] Insert quiz_events

Throughout:
  [fire-forget] Track events on each step transition
```

---

## 5. Monitoring

### Build-Time

- `vite-plugin-bundle-analyzer` or `npx vite-bundle-visualizer` to monitor bundle size
- Add to CI: fail build if JS bundle exceeds 100kb gzipped

### Runtime

- Supabase Dashboard: monitor query latency, row counts, error rates
- Browser DevTools Lighthouse: run before each release
- Optional: `web-vitals` library (3kb) to report CWV to analytics

```typescript
// Optional: report Core Web Vitals
import { onLCP, onFCP, onCLS } from 'web-vitals';

onLCP(metric => trackEvent('cwv_lcp', { value: metric.value }));
onFCP(metric => trackEvent('cwv_fcp', { value: metric.value }));
onCLS(metric => trackEvent('cwv_cls', { value: metric.value }));
```

---

## 6. Mobile-Specific

Given 85%+ mobile users (per strategy doc):

- Touch targets: minimum 44x44px (all option cards and buttons)
- No hover-dependent interactions (hover is enhancement only)
- Viewport meta: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- Safe area insets for notched devices: `env(safe-area-inset-bottom)` on fixed CTAs
- Test on 3G throttling (Chrome DevTools "Slow 3G" profile)

---

*Performance Optimization by @architect (Aria) | LOV-1 | Phase 4*
