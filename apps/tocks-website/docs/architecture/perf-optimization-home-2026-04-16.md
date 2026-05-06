# Perf Optimization — Home `/` (mobile)
**Date:** 2026-04-16
**Author:** @architect (Aria)
**Scope:** ONLY route `/` (Hero organism). Must NOT regress `/contato` (Perf 100) or `/colecao/tenro-luxo` (Perf 94).
**Goal:** Mobile Lighthouse Perf ≥ 90 (currently 86, LCP 4.1s).

---

## 1. LCP root-cause hypothesis (with evidence)

### Verdict
**Confirmed:** the H1 is the LCP element AND its render is gated by a Framer Motion stagger animation.

### Evidence chain
1. **Lighthouse `lcp-breakdown-insight`** (`docs/qa/lighthouse/home-mobile-prod.json`):
   - `timeToFirstByte`: 10.7 ms (network is fine)
   - `elementRenderDelay`: **790.4 ms** (98% of LCP is render delay)
   - `selector`: `section.relative > div.relative > div > h1.font-heading`
   - `nodeLabel`: `"Cada mesa, uma obra. Cada detalhe, uma assinatura."`
2. **Source `src/components/organisms/hero.tsx:37-53`** wraps the H1 chain in:
   ```
   <motion.div variants={staggerContainer} initial="initial" animate="animate">
     <motion.div variants={fadeInUp}> <Text>Desde 2008…</Text> </motion.div>
     <motion.div variants={fadeInUp}> <Heading as="h1">…</Heading> </motion.div>
     ...
   ```
3. **`src/lib/animations.ts:14-22`** `fadeInUp` starts at `{opacity: 0, y: 40}`, `duration: 0.8s`. `staggerContainer` adds `delayChildren: 0.1s` + `staggerChildren: 0.15s` → H1 (2nd child) starts ~250 ms after hydration and animates for 800 ms. The H1 is invisible to Lighthouse's LCP detector until the fade-in passes a luminance threshold (~halfway) — which lands almost exactly at the **790 ms** observed.
4. **Cross-check / negative control:** `/contato` uses `PageLayout` (`src/components/templates/page-layout.tsx`), which renders the H1 as plain SSR HTML — **no motion wrapper** — and scores **Perf 100, LCP 1.8 s**. Same fonts, same Tailwind, same `LenisProvider`. The single delta is the motion wrapper.
5. **Bundle evidence (`.next/static/chunks/0~~mdnn8dd.u2.js`)**: Lighthouse's `unused-javascript` flags this 40 KiB chunk (58% wasted). First 500 bytes show `transformPerspective`, `scale*`, `translateX/Y/Z` — **this is framer-motion**. Only `Hero` imports `framer-motion` in the entire codebase (`grep` confirms 1 hit in `src/components/organisms/hero.tsx:13`); GSAP is in deps but nowhere imported.

### Secondary findings (also from `home-mobile-prod.json`)
- **`legacy-javascript-insight` (13.7 KiB wasted in `0j2gse16f2rce.js`)**: polyfills for `Array.prototype.at|flat|flatMap`, `Object.fromEntries|hasOwn`, `String.prototype.trimEnd`. `next.config.ts` is bare — no `experimental.legacyBrowsers: false`, no `browserslist` field in `package.json`, no `.browserslistrc`. Next 16 should already target modern by default but is shipping ES2017 polyfills.
- **`render-blocking-insight`**: 160 ms on a single 11.6 KiB CSS chunk. Tailwind 4 emits one stylesheet — usually unavoidable, but `next/font` already inlines font-face CSS, so the only real lever is reducing the Tailwind output (low ROI here).
- **`network-dependency-tree-insight`**: zero preconnects. Negligible impact since `next/font` self-hosts Google Fonts (no third-party origin to preconnect).
- **Fonts:** `src/lib/fonts.ts` uses `next/font/google` with `display: 'swap'` for all 3 families. **Font strategy is correct** — not a contributor.

---

## 2. Patch list (ordered by ROI: score-delta-per-minute, descending)

| # | File | Change | Effort | Δ Perf est. | Cross-page risk |
|---|------|--------|--------|-------------|-----------------|
| **1** | `src/components/organisms/hero.tsx` | Remove `<motion.div variants={fadeInUp}>` wrapper around the **label** + **H1** ONLY. Keep them as plain SSR HTML inside the parent `<motion.div variants={staggerContainer}>`. Subtitle, CTA group, scroll indicator stay animated. | XS (5 min) | **+4 to +6** (LCP 4.1 s → ~2.0 s, kills the 790 ms render delay entirely; LCP weight 25 in Perf score) | **None** — `/contato` & `/colecao/tenro-luxo` don't use Hero. Motion still present on subordinate elements, so visual brand intact. |
| **2** | `src/components/organisms/hero.tsx` (same edit) | Replace `'use client'` if Hero no longer needs framer-motion at all (deferred — see patch #3). For now: keep it client. | — | — | — |
| **3** | `src/components/organisms/hero.tsx` + new `src/components/molecules/hero-motion-group.tsx` | Extract the still-animated subtree (subtitle + CTAs + scroll dot) into a separate client component. Make `Hero` itself a server component that statically renders the label + H1 above the fold, then mounts the motion group. Optional follow-up: `next/dynamic` import the motion group with `{ ssr: false }` to defer the framer-motion bundle entirely. | M (30 min) | **+1 to +2** (cuts ~23 KiB unused JS; LCP doesn't move further but TBT/TTI improves) | **None** — change is contained to home flow. |
| **4** | `package.json` | Add `"browserslist": ["chrome >= 100", "firefox >= 100", "safari >= 15", "edge >= 100"]`. Forces SWC to drop ES2017+ polyfills. | XS (5 min) | **+1** (saves ~13 KiB legacy JS, ~120 ms parse on mid-tier mobile) | **Low** — affects ALL pages identically. `/contato` is already 100 (won't regress). `/colecao/tenro-luxo` (94) only stands to benefit. Validate with build + smoke test. |
| **5** | `next.config.ts` | Add `experimental: { optimizePackageImports: ['framer-motion'] }`. Lets Next 16 tree-shake framer's named exports. | XS (5 min) | **+0 to +1** (helps if patch #3 not done; redundant if it is) | **None** documented; flag is stable. |
| **6** | `src/components/organisms/hero.tsx` | If after patches 1+4 we still need a tick: remove the `<motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2}}>` scroll indicator entirely (the 2-second-delayed gold line). Replace with a CSS `@keyframes` animation. Saves a `motion.div` instance and is purely cosmetic. | S (15 min) | **+0 to +1** (TBT only) | **None.** |

### NOT recommended (rejected alternatives)
- **CSS-only fade-in for the H1**: still gates LCP if `opacity` starts at 0. Lighthouse LCP detector treats opacity-0 as not-yet-rendered. Same root problem.
- **View Transitions API**: not supported in iOS Safari < 18.2; requires polyfill = more bytes. Wrong tool for an entry animation.
- **Replace `<ImagePlaceholder>` in Hero with `<Image priority>`**: Hero has no image — only a radial-gradient texture. No-op.
- **Preload font**: `next/font` already optimizes (subset + self-host + preload of `font-heading`). Double-preloading would duplicate bytes.

---

## 3. Stop condition + verification

### Apply order
1. Patch **#1** (5 min). Build. Run Lighthouse mobile on `/`. **Expected: Perf 90-92.** If yes → STOP, ship.
2. If Perf < 90: apply patch **#4** (5 min). Build. Re-run. **Expected: Perf 91-93.** If yes → STOP.
3. If still < 90: apply patch **#5** (5 min). Build. Re-run.
4. If still < 90: apply patch **#3** (30 min). Build. Re-run. This is a structural refactor — bigger blast radius, only do it if needed.
5. Patch **#6** is a polish lever, only if you want the extra ms.

### Verification command for @dev
```bash
cd D:/AIOS/apps/tocks-website
npm run build && npm run start &
sleep 4
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --form-factor=mobile \
  --throttling-method=simulate \
  --output=json --output=html \
  --output-path=./docs/qa/lighthouse/home-mobile-postpatch \
  --chrome-flags="--headless"
# Then ALSO re-run for /contato and /colecao/tenro-luxo:
npx lighthouse http://localhost:3000/contato --only-categories=performance --form-factor=mobile --output=json --output-path=./docs/qa/lighthouse/contato-mobile-postpatch
npx lighthouse http://localhost:3000/colecao/tenro-luxo --only-categories=performance --form-factor=mobile --output=json --output-path=./docs/qa/lighthouse/tenro-luxo-mobile-postpatch
```

**Acceptance:** all three routes Perf ≥ 90, none regressed below their current baseline (`/contato` ≥ 95, `/tenro-luxo` ≥ 90).

### Rollback plan (per patch)
- **#1**: `git revert` the single hunk in `hero.tsx`. The motion wrappers are restored verbatim. No DB / no API / no cascading change.
- **#3**: revert the new file + the `Hero` split. Same atomic revert.
- **#4**: remove the `browserslist` field. Build returns to default targets. Idempotent.
- **#5**: remove the `experimental` block. Idempotent.
- **#6**: revert the `motion.div` → CSS swap.

---

## 4. UX / brand sign-off needed?

- Patches **#1 and #6** change perceived motion on the home page. The H1 + label will appear *immediately* instead of fading in. Visually: brand still feels editorial because the **subtitle + CTAs + scroll indicator** still cascade in below.
- **Recommendation:** flag patch #1 to **@ux-design-expert (Uma)** for a 60-second visual review — her call, not a blocker. Reference: the Bretda LP made the same trade-off (LCP first, motion second).
- @dev owns the implementation for all 6 patches.

---

## 5. ETA + confidence

- **Total ETA (patches #1 + #4 only — most likely path):** ~10 min code + ~5 min build + ~3 min Lighthouse = **~20 min**.
- **Confidence Perf ≥ 90:** **HIGH** (≥ 90% likelihood). Reasoning: the LCP gap (4.1 → 2.0 s target) is fully explained by patch #1. `/contato` proves the rest of the stack hits 100.
- **Confidence cross-page no-regression:** **HIGH**. Patch #1 is local to `Hero` (only used on `/`). Patch #4 is global but pure subtractive (drops polyfills modern browsers don't execute anyway).
