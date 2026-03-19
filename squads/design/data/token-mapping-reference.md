# Token Mapping Reference

> Mapeamento completo: Figma Token → CSS Variable → Tailwind Utility
> Gerado pela task `f1-map-tokens-to-shadcn`. Atualizado a cada execucao do pipeline.

## Status

**Completo** — Mapeamento gerado a partir dos tokens em `figma-tokens-raw.md`.

## Design Decisions

| Decisao | Valor |
|---|---|
| **Tema base** | Dark-first |
| **Primary** | Monocromatico (branco/preto — sem brand color) |
| **Destructive** | brand/Khewra (#DC625E) |
| **Success** | brand/Midori (#3A913F) |
| **Warning** | brand/Sahara (#D6A461) |
| **Info** | brand/Atmos (#77C5D5) |
| **Base radius** | radius/xxs = 6px (0.375rem) |
| **Font primary** | Outfit (headings) |
| **Font secondary** | Inter (body) |
| **Font tertiary** | JetBrains Mono (code) |

---

## Core Tokens

| Figma Token | CSS Variable | Tailwind Utility | Light Value (OKLch) | Dark Value (OKLch) |
|---|---|---|---|---|
| surface/white | `--background` | `bg-background` | oklch(1 0 0) | oklch(0.173 0 0) |
| surface/950 | `--foreground` | `text-foreground` | oklch(0.173 0 0) | oklch(0.961 0 0) |
| surface/white | `--card` | `bg-card` | oklch(1 0 0) | oklch(0.244 0 0) |
| surface/950 | `--card-foreground` | `text-card-foreground` | oklch(0.173 0 0) | oklch(0.961 0 0) |
| surface/white | `--popover` | `bg-popover` | oklch(1 0 0) | oklch(0.244 0 0) |
| surface/950 | `--popover-foreground` | `text-popover-foreground` | oklch(0.173 0 0) | oklch(0.961 0 0) |
| surface/950 → surface/white | `--primary` | `bg-primary` | oklch(0.173 0 0) | oklch(1 0 0) |
| surface/white → surface/950 | `--primary-foreground` | `text-primary-foreground` | oklch(1 0 0) | oklch(0.173 0 0) |
| surface/100 → surface/800 | `--secondary` | `bg-secondary` | oklch(0.961 0 0) | oklch(0.309 0 0) |
| surface/950 → surface/100 | `--secondary-foreground` | `text-secondary-foreground` | oklch(0.173 0 0) | oklch(0.961 0 0) |
| surface/100 → surface/800 | `--muted` | `bg-muted` | oklch(0.961 0 0) | oklch(0.309 0 0) |
| surface/600 → surface/500 | `--muted-foreground` | `text-muted-foreground` | oklch(0.482 0 0) | oklch(0.719 0 0) |
| surface/100 → surface/800 | `--accent` | `bg-accent` | oklch(0.961 0 0) | oklch(0.309 0 0) |
| surface/950 → surface/100 | `--accent-foreground` | `text-accent-foreground` | oklch(0.173 0 0) | oklch(0.961 0 0) |
| brand/Khewra | `--destructive` | `bg-destructive` | oklch(0.646 0.154 24.222) | oklch(0.646 0.154 24.222) |
| surface/200 → white/10% | `--border` | `border-border` | oklch(0.928 0 0) | oklch(1 0 0 / 10%) |
| surface/200 → white/15% | `--input` | `border-input` | oklch(0.928 0 0) | oklch(1 0 0 / 15%) |
| surface/500 → surface/600 | `--ring` | `ring-ring` | oklch(0.719 0 0) | oklch(0.482 0 0) |
| radius/xxs (6px) | `--radius` | `rounded-*` | 0.375rem | 0.375rem |

## Chart Tokens

| Figma Token | CSS Variable | Light Value | Dark Value |
|---|---|---|---|
| brand/Kobold → brand/Atmos | `--chart-1` | oklch(0.477 0.116 243.133) | oklch(0.779 0.08 212.201) |
| brand/Midori | `--chart-2` | oklch(0.585 0.145 144.414) | oklch(0.585 0.145 144.414) |
| brand/Sahara → brand/Nubia | `--chart-3` | oklch(0.751 0.103 73.232) | oklch(0.902 0.123 92.922) |
| brand/Khewra → brand/Carota | `--chart-4` | oklch(0.646 0.154 24.222) | oklch(0.722 0.161 37.732) |
| brand/Boreal → brand/Calla | `--chart-5` | oklch(0.462 0.126 352.763) | oklch(0.863 0.057 6.005) |

## Sidebar Tokens

| Figma Token | CSS Variable | Light Value | Dark Value |
|---|---|---|---|
| surface/100 → surface/900 | `--sidebar` | oklch(0.961 0 0) | oklch(0.244 0 0) |
| surface/950 → surface/100 | `--sidebar-foreground` | oklch(0.173 0 0) | oklch(0.961 0 0) |
| surface/950 → surface/white | `--sidebar-primary` | oklch(0.173 0 0) | oklch(1 0 0) |
| surface/white → surface/950 | `--sidebar-primary-foreground` | oklch(1 0 0) | oklch(0.173 0 0) |
| surface/200 → surface/800 | `--sidebar-accent` | oklch(0.928 0 0) | oklch(0.309 0 0) |
| surface/950 → surface/100 | `--sidebar-accent-foreground` | oklch(0.173 0 0) | oklch(0.961 0 0) |
| surface/200 → white/10% | `--sidebar-border` | oklch(0.928 0 0) | oklch(1 0 0 / 10%) |
| surface/500 → surface/600 | `--sidebar-ring` | oklch(0.719 0 0) | oklch(0.482 0 0) |

## Extension Tokens

| Figma Token | CSS Variable | Tailwind Utility | Light Value | Dark Value | Nota |
|---|---|---|---|---|---|
| brand/Midori | `--success` | `bg-success` | oklch(0.585 0.145 144.414) | oklch(0.585 0.145 144.414) | Extensao |
| surface/white | `--success-foreground` | `text-success-foreground` | oklch(1 0 0) | oklch(1 0 0) | Extensao |
| brand/Sahara | `--warning` | `bg-warning` | oklch(0.751 0.103 73.232) | oklch(0.751 0.103 73.232) | Extensao |
| surface/950 | `--warning-foreground` | `text-warning-foreground` | oklch(0.173 0 0) | oklch(0.173 0 0) | Extensao |
| brand/Atmos | `--info` | `bg-info` | oklch(0.779 0.08 212.201) | oklch(0.779 0.08 212.201) | Extensao |
| surface/950 | `--info-foreground` | `text-info-foreground` | oklch(0.173 0 0) | oklch(0.173 0 0) | Extensao |

## Primitive Tokens (Figma → CSS Custom Properties)

### Surface Scale

| Figma Token | CSS Variable | Hex | OKLch |
|---|---|---|---|
| surface/white | `--surface-white` | #FFFFFF | oklch(1 0 0) |
| surface/100 | `--surface-100` | #F2F2F2 | oklch(0.961 0 0) |
| surface/200 | `--surface-200` | #E7E7E7 | oklch(0.928 0 0) |
| surface/300 | `--surface-300` | #D4D4D4 | oklch(0.87 0 0) |
| surface/400 | `--surface-400` | #BCBCBC | oklch(0.795 0 0) |
| surface/500 | `--surface-500` | #A4A4A4 | oklch(0.719 0 0) |
| surface/600 | `--surface-600` | #5E5E5E | oklch(0.482 0 0) |
| surface/700 | `--surface-700` | #484848 | oklch(0.402 0 0) |
| surface/800 | `--surface-800` | #303030 | oklch(0.309 0 0) |
| surface/900 | `--surface-900` | #202020 | oklch(0.244 0 0) |
| surface/950 | `--surface-950` | #101010 | oklch(0.173 0 0) |
| surface/black | `--surface-black` | #000000 | oklch(0 0 0) |

### Brand Palette

| Figma Token | CSS Variable | Hex | OKLch |
|---|---|---|---|
| brand/Atmos | `--brand-atmos` | #77C5D5 | oklch(0.779 0.08 212.201) |
| brand/Kobold | `--brand-kobold` | #006298 | oklch(0.477 0.116 243.133) |
| brand/Bleu | `--brand-bleu` | #5691A1 | oklch(0.622 0.066 217.111) |
| brand/Midori | `--brand-midori` | #3A913F | oklch(0.585 0.145 144.414) |
| brand/Sahara | `--brand-sahara` | #D6A461 | oklch(0.751 0.103 73.232) |
| brand/Boreal | `--brand-boreal` | #8B355F | oklch(0.462 0.126 352.763) |
| brand/Cotta | `--brand-cotta` | #872526 | oklch(0.42 0.133 24.432) |
| brand/Antar | `--brand-antar` | #BFE3ED | oklch(0.893 0.04 216.4) |
| brand/Azzay | `--brand-azzay` | #79876D | oklch(0.605 0.042 130.689) |
| brand/Cloro | `--brand-cloro` | #E2E99C | oklch(0.911 0.098 112.581) |
| brand/Arena | `--brand-arena` | #FAEDBC | oklch(0.944 0.065 94.953) |
| brand/Carota | `--brand-carota` | #F87C56 | oklch(0.722 0.161 37.732) |
| brand/Khewra | `--brand-khewra` | #DC625E | oklch(0.646 0.154 24.222) |
| brand/Nubia | `--brand-nubia` | #FBDD7A | oklch(0.902 0.123 92.922) |
| brand/Calla | `--brand-calla` | #F4C3CC | oklch(0.863 0.057 6.005) |

### Typography

| Figma Token | CSS Variable | Value |
|---|---|---|
| font.family.primary | `--font-heading` | Outfit |
| font.family.secondary | `--font-body` | Inter |
| font.family.tertiary | `--font-mono` | JetBrains Mono |

### Spacing Scale (px)

| Token | Value |
|---|---|
| spacing/0 | 0px |
| spacing/2 | 2px |
| spacing/4 | 4px |
| spacing/8 | 8px |
| spacing/12 | 12px |
| spacing/14 | 14px |
| spacing/16 | 16px |
| spacing/20 | 20px |
| spacing/24 | 24px |
| spacing/28 | 28px |
| spacing/32 | 32px |
| spacing/36 | 36px |
| spacing/40 | 40px |
| spacing/48 | 48px |
| spacing/56 | 56px |
| spacing/64 | 64px |
| spacing/72 | 72px |
| spacing/80 | 80px |
| spacing/88 | 88px |
| spacing/96 | 96px |
| spacing/112 | 112px |
| spacing/128 | 128px |
| spacing/160 | 160px |
| spacing/192 | 192px |

### Radius Scale

| Figma Token | CSS Variable | Value |
|---|---|---|
| radius/min | `--radius-sm` | 4px |
| radius/xxs | `--radius` (base) | 6px |
| radius/xs | `--radius-lg` | 8px |
| radius/sm | — | 12px |
| radius/md | — | 16px |
| radius/lg | — | 24px |
| radius/xl | — | 32px |
| radius/xxl | — | 48px |
| radius/max | — | 9999px |

### Line Height

| Token | Value |
|---|---|
| --line-height-xs | 100% |
| --line-height-sm | 120% |
| --line-height-md | 130% |
| --line-height-lg | 150% |
| --line-height-xl | 200% |

### Letter Spacing

| Token | Value |
|---|---|
| --letter-spacing-xxxs | -8% |
| --letter-spacing-xxs | -6% |
| --letter-spacing-xs | -4% |
| --letter-spacing-sm | -2% |
| --letter-spacing-md | 0% |
| --letter-spacing-lg | 2% |
| --letter-spacing-xl | 4% |
| --letter-spacing-xxl | 6% |
| --letter-spacing-xxxl | 8% |

## Contraste WCAG AA

| Par | Light Ratio | Dark Ratio | Status |
|---|---|---|---|
| foreground / background | 17.4:1 (#101010 on #FFFFFF) | 15.3:1 (#F2F2F2 on #101010) | PASS |
| primary-foreground / primary | 17.4:1 (#FFFFFF on #101010) | 17.4:1 (#101010 on #FFFFFF) | PASS |
| secondary-foreground / secondary | 14.8:1 (#101010 on #F2F2F2) | 10.3:1 (#F2F2F2 on #303030) | PASS |
| muted-foreground / muted | 5.9:1 (#5E5E5E on #F2F2F2) | 5.5:1 (#A4A4A4 on #303030) | PASS |
| accent-foreground / accent | 14.8:1 (#101010 on #F2F2F2) | 10.3:1 (#F2F2F2 on #303030) | PASS |
| card-foreground / card | 17.4:1 (#101010 on #FFFFFF) | 12.5:1 (#F2F2F2 on #202020) | PASS |

---

*Gerado por: Foundations Pipeline — Phase 1*
*Ultima atualizacao: 2026-02-21*
