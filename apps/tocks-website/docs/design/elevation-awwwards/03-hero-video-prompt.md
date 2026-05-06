# Hero Video Prompt — Runway Gen-3 / Google Veo 3

**Consumer:** content team (hot-swap into `public/videos/hero-showroom.{mp4,webm,hevc.mp4}`)
**Direção:** B — Gilded Noir Cinemático
**Story:** S-8.2
**Spec source:** `01-master-plan-phases-3-7.md` Fase 3

---

## 1. Core prompt (copy-paste into Runway / Veo)

```
Interior of a private luxury furniture atelier at night. A single solid hardwood
author-designed table emerges slowly from deep chiaroscuro shadows. Cinematic
slow-dolly-out camera movement on an anamorphic lens, 24fps. Warm 3200K rim
light grazes the wood grain -- visible pores, tight figure, hand-finished edge.
A single gold metallic accent glints on a minimal hardware detail
(ink-well moment). Deep noir background. Shallow depth of field. No text,
no people, no brand marks. Reference aesthetic: Roche Bobois editorial film,
B&B Italia product reveal, early Wong Kar-wai interior lighting.
```

## 2. Shot list (8-12s loopable)

| Beat | Time | Action | Camera | Lighting |
|---|---|---|---|---|
| 1 | 0-2s | Penumbra, tight grain-texture hero-shot on one corner of wood | Static, then micro push-in 35mm | Single warm spot, rest in darkness |
| 2 | 2-5s | Dolly-out reveals full table silhouette in chiaroscuro (30% visible) | Slow dolly back, anamorphic | Rim light sweeps wood edge |
| 3 | 5-8s | Hold on composition (rule-of-thirds), gold hardware flashes | Locked-off, subtle breathing | Peak warm 3200K on hardware |
| 4 | 8-12s | Fade crossdissolve matches frame 1 for seamless loop | Returns to origin | Crossfade |

## 3. Technical constraints (non-negotiable)

- **Duration:** 8-12s, loopable (frame N ≈ frame 1).
- **Audio:** NONE. Autoplay + muted is mandatory; baking audio wastes encoder budget.
- **Aspect / resolution:**
  - Desktop master: 1920x1080 (16:9).
  - Mobile alternate: 720x1280 (9:16) — same narrative, reframed.
- **Export targets (max sizes):**
  - H.264 baseline profile, 1920x1080 ≤ **2 MB** (`hero-showroom.mp4`).
  - VP9 WebM, 1920x1080 ≤ **2 MB** (`hero-showroom.webm`).
  - HEVC (hvc1), 1920x1080 ≤ **2 MB** (`hero-showroom.hevc.mp4`).
  - H.264 vertical, 720x1280 ≤ **1.5 MB** (`hero-showroom-mobile.mp4`).
- **Poster frame:** export frame 1 as JPG (or AVIF) ≤ **80 KB**, save to
  `public/images/hero-poster.jpg`. The poster IS the LCP element on Home.
- **No zoom-into-text, no lens flares, no particles, no cursor, no UI, no logo.**

## 4. Do-not list (protecting the luxury signal)

- No people, hands, or body parts on frame.
- No speed ramping, no whip-pan, no shake.
- No dust mote particles drifting (feels VFX-y).
- No warm orange grade in blacks — blacks stay at `#050508` (`--noir-deep`).
- No gold glow haloing out into sky/sheen — gold is a point, not a field.
- No saturated red/orange tones beyond the 3200K rim. Keep chromatic restraint.

## 5. Grading note

Target midtones close to `--noir-mid` (`#0B0B0F`). Highlights anchored at
`--gold-500` (`#D4AF37`). Avoid crushing blacks below `#050508` or the
poster loses detail. Film grain acceptable at subtle level (feels artisanal);
digital noise NOT acceptable.

## 6. Delivery checklist

- [ ] 4 video files encoded to spec above and dropped in `public/videos/`.
- [ ] 1 poster JPG/AVIF written to `public/images/hero-poster.jpg` ≤ 80 KB.
- [ ] `hero.tsx` updated: pass `videoSrc`, `videoSrcWebm`, `videoSrcHevc`.
- [ ] Lighthouse mobile Home: Perf ≥ 89, LCP ≤ 2.5s (poster still wins LCP).
- [ ] DevTools emulate `prefers-reduced-motion: reduce` → `<video>` element
      absent from DOM (poster only).
- [ ] axe-core: 0/0/0/0 (video has `aria-hidden="true"`, decorative).

— Approved by @design-lead (Nova), ratified by tobias-van-schneider + val-head
