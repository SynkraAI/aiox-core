# Hero video assets

Signature moment for direção B (Gilded Noir Cinemático). Consumed by
`src/components/organisms/hero-video.tsx` (Story S-8.2).

## Status (2026-04-17)

**PLACEHOLDER STATE.** `videoSrc` is currently `undefined` in `hero.tsx` because
the Nano Banana 2 / Runway quota is exhausted. The poster
(`/public/images/hero-poster.jpg`) renders alone -- this is the accepted
fallback per AC-3/AC-10.

## Hot-swap path (when real asset arrives)

Drop the encoded files here using these exact filenames:

| File | Codec | Resolution | Max size |
|---|---|---|---|
| `hero-showroom.mp4` | H.264 (baseline) | 1920x1080 | 2 MB |
| `hero-showroom.webm` | VP9 | 1920x1080 | 2 MB |
| `hero-showroom.hevc.mp4` | HEVC / H.265 | 1920x1080 | 2 MB |
| `hero-showroom-mobile.mp4` | H.264 | 720x1280 (vertical) | 1.5 MB |

Then in `src/components/organisms/hero.tsx` pass the props:

```tsx
<HeroVideo
  videoSrc="/videos/hero-showroom.mp4"
  videoSrcWebm="/videos/hero-showroom.webm"
  videoSrcHevc="/videos/hero-showroom.hevc.mp4"
  posterSrc="/images/hero-poster.jpg"
  alt="..."
/>
```

## Shot list (source: `docs/design/elevation-awwwards/01-master-plan-phases-3-7.md` Fase 3)

1. 0-2s **Penumbra** -- zoom lento 35mm em detalhe textural madeira.
2. 2-5s **Revelação** -- dolly-out, mesa emerge chiaroscuro, luz quente 3200K pincela borda.
3. 5-8s **Hold** -- composição 1/3, gold accent em ferragem (ink-well moment).
4. 8-12s **Loop** -- fade crossdissolve seamless.

Constraints: autoplay muted loop playsInline, sem áudio, sem texto, sem pessoas.

Prompt full template: `docs/design/elevation-awwwards/03-hero-video-prompt.md`.

## Poster

`/public/images/hero-poster.jpg` -- current file is a 207-byte JPEG placeholder.
Replace with a real 1920x1080 still (< 80KB AVIF preferred; JPG also OK -- Next 16
auto-converts to AVIF/WebP via `next.config.ts images.formats`). First frame of
the final video is the recommended poster.
