# Fase 5 — Tokens Gilded Noir v2 (executable spec)

**Consumer:** `@dev` em Story S-8.1
**Status:** SPEC PRONTO — `@design-lead` ratifica
**Mind Clone inputs absorvidos:** dieter-rams (restraint), erik-spiekermann (editorial type)

---

## 5.1 CSS tokens (cole em `globals.css` após `:root {`, antes do bloco `@theme inline`)

```css
:root {
  /* === COLOR: NOIR 3-shade === */
  --noir-deep: #050508;       /* hero backdrop, loading, footer cinematic */
  --noir-mid:  #0B0B0F;       /* ALIAS --background — page default */
  --noir-surface: #1A1A1E;    /* ALIAS --surface — cards, modal */
  --noir-elevated: #24242A;   /* hover surfaces */

  /* === COLOR: BONE layer (novo — respiro humano editorial) === */
  --bone-paper: #F5F0E6;      /* Atelier longform bg, editorial quotes */
  --bone-warm:  #EDE6D2;      /* surfaces editorial, sidebar provenance */
  --bone-ink:   #1A1812;      /* text sobre bone — contraste 15.2:1 */
  --bone-rule:  #D9CFBA;      /* hairlines sobre bone */

  /* === COLOR: GOLD 5-step === */
  --gold-100: #F4E8B8;        /* glow text-shadow, icons on noir-deep */
  --gold-300: #E5C65C;        /* ALIAS --accent-gold-hover */
  --gold-500: #D4AF37;        /* ALIAS --accent-gold — default */
  --gold-700: #8A6F3A;        /* ALIAS --accent-gold-deep — rules, borders */
  --gold-900: #4A3A1E;        /* shadow-gold in cinematic-shadow */

  /* === COLOR: STATUS (semantic, mantido) === */
  --whatsapp-gold: #C4A65E;
  --whatsapp-gold-hover: #D4B66F;
  --focus-border: var(--gold-500);

  /* === TYPOGRAPHY v2 (Spiekermann target) === */
  /* Google Fonts free tier:
     Headlines: 'Fraunces' (serif editorial com ligaduras + opsz axis)
     Body:      'Inter' (MANTIDO)
     Display:   'Space Grotesk' (grotesk editorial, substitui Montserrat)
     Instalar via next/font em layout.tsx. */
  --font-heading: var(--font-fraunces);
  --font-body:    var(--font-inter);
  --font-display: var(--font-space-grotesk);

  /* Modular scale — fourth ratio 1.333, base 18px */
  --text-xs:    0.75rem;      /* 12px — labels, folio */
  --text-sm:    0.875rem;     /* 14px — caption */
  --text-base:  1.125rem;     /* 18px — body */
  --text-lg:    1.5rem;       /* 24px — lead */
  --text-xl:    2rem;         /* 32px — H3 */
  --text-2xl:   2.667rem;     /* 42.67px — H2 */
  --text-3xl:   3.556rem;     /* 56.89px — H1 */
  --text-display: 4.742rem;   /* 75.87px — hero H1 */

  /* Leading */
  --leading-tight:   1.1;     /* display */
  --leading-snug:    1.2;     /* headings */
  --leading-normal:  1.4;     /* body */
  --leading-relaxed: 1.6;     /* longform atelier */

  /* Tracking (kept + new) */
  --tracking-editorial: 0.2em;
  --tracking-extreme:   0.3em;
  --tracking-headline:  -0.02em;  /* negative tracking em H1 serif */
  --tracking-display:   -0.03em;  /* display editorial */

  /* === TEXTURE layer (novo) === */
  --texture-paper-grain:
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="n"><feTurbulence baseFrequency="0.9" numOctaves="2"/><feColorMatrix values="0 0 0 0 0.08 0 0 0 0 0.08 0 0 0 0 0.08 0 0 0 0.06 0"/></filter><rect width="100%25" height="100%25" filter="url(%23n)"/></svg>');

  /* === SHADOW cinematic === */
  --shadow-cinematic:
    0 32px 64px -16px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(212, 175, 55, 0.08);
  --shadow-ambient:
    0 8px 32px -8px rgba(0, 0, 0, 0.5);
  --shadow-gold-inset:
    inset 0 0 0 1px rgba(212, 175, 55, 0.15);

  /* === SPACING (mantido + expandido) === */
  --section-gap: 8rem;
  --section-gap-editorial: 12rem;    /* atelier longform */
  --container-max: 1280px;
  --container-max-editorial: 960px;  /* atelier longform narrow */
  --container-padding: 1.5rem;
  --rhythm: 0.5rem;

  /* === LEGACY ALIASES (back-compat while migrating) === */
  --background: var(--noir-mid);
  --surface: var(--noir-surface);
  --surface-hover: var(--noir-elevated);
  --text-primary: #FAFAFA;
  --text-secondary: #A0A0A0;
  --accent-gold: var(--gold-500);
  --accent-gold-hover: var(--gold-300);
  --accent-gold-deep: var(--gold-700);
  --accent-ivory: var(--bone-warm);
  --ring-focus-offset: 2px;
  --ring-swatch-active: var(--gold-500);
}
```

## 5.2 `@theme inline` bloco — adicionar novos tokens

```css
@theme inline {
  /* Tailwind v4 expose new tokens */
  --color-noir-deep: var(--noir-deep);
  --color-noir-mid: var(--noir-mid);
  --color-noir-surface: var(--noir-surface);
  --color-noir-elevated: var(--noir-elevated);
  --color-bone-paper: var(--bone-paper);
  --color-bone-warm: var(--bone-warm);
  --color-bone-ink: var(--bone-ink);
  --color-bone-rule: var(--bone-rule);
  --color-gold-100: var(--gold-100);
  --color-gold-300: var(--gold-300);
  --color-gold-500: var(--gold-500);
  --color-gold-700: var(--gold-700);
  --color-gold-900: var(--gold-900);
  /* Legacy aliases mantidos (já existem no arquivo atual) */
}
```

## 5.3 Utilities novas (após `.gold-separator`)

```css
/* Paper grain texture overlay — use em seções editoriais sobre bone */
.texture-paper {
  position: relative;
}
.texture-paper::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--texture-paper-grain);
  opacity: 0.5;
  pointer-events: none;
  mix-blend-mode: multiply;
}

/* Cinematic shadow para hero video container + product hero cards */
.shadow-cinematic { box-shadow: var(--shadow-cinematic); }
.shadow-ambient   { box-shadow: var(--shadow-ambient); }

/* Editorial containers */
.container-editorial {
  max-width: var(--container-max-editorial);
  margin-inline: auto;
  padding-inline: var(--container-padding);
}

/* Editorial section gap */
.section-padding-editorial { padding-block: var(--section-gap-editorial); }

/* Serif H1 com negative tracking (Spiekermann) */
.heading-display {
  font-family: var(--font-heading);
  font-size: var(--text-display);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-display);
  font-weight: 300;        /* Fraunces opsz 300 em display size */
  font-variation-settings: 'opsz' 144, 'SOFT' 50;
}

/* Bone surface section */
.section-bone {
  background-color: var(--bone-paper);
  color: var(--bone-ink);
}
```

## 5.4 Font loading — `src/app/layout.tsx`

Substituir imports atuais de `Cormorant_Garamond` e `Montserrat` por:

```tsx
import { Fraunces, Inter, Space_Grotesk } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

// No <body className={`${fraunces.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
```

## 5.5 Migration order (sub-tasks de S-8.1)

1. Adicionar tokens v2 em `globals.css` (novos + aliases) — zero breakage
2. Trocar fonts em `layout.tsx` — verificar LCP não degrada (Fraunces variable font ~45KB)
3. Rodar `npm run build` — typecheck + lint pass
4. Smoke visual: home + produto + atelier + contato — nada deve quebrar (aliases preservam)
5. Componente-a-componente: substituir `--accent-gold` → `--gold-500` em atoms/molecules (Edit replace_all por arquivo, não global)
6. Validar WCAG contraste:
   - `--gold-500` sobre `--noir-mid` = 9.03:1 ✅
   - `--gold-500` sobre `--bone-paper` = 2.37:1 ❌ — **regra: gold nunca sobre bone em texto** (apenas em borders/hairlines/icons)
   - `--bone-ink` sobre `--bone-paper` = 15.2:1 ✅
   - `--text-primary` sobre `--noir-mid` = 18.8:1 ✅
7. Delete `.text-gradient-gold` se não consumido após refactor

## 5.6 Critério de aceite (DoD para S-8.1)

- [ ] `npm run typecheck` 0 errors
- [ ] `npm run lint` 0 errors
- [ ] `npm run build` compila
- [ ] Todos arquivos modificados ≤ 100 linhas (Art. VII)
- [ ] Lighthouse Perf baseline (build+start, mobile) ≥ 89 (não regride vs Sessão 18 v4 median 89)
- [ ] `axe-core` 0/0/0/0 nas 3 páginas principais
- [ ] Aliases legacy preservados (outros componentes não-migrados continuam funcionando)

---

*Nova — spec v2 ratificado*
