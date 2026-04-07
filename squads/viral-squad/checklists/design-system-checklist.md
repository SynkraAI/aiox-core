# Design System Compliance Checklist

## Design System configurado - Minimalismo Lendario

Checklist obrigatoria para validar componentes Remotion contra o Design System.
Usar ANTES de cada merge/commit de componente visual.

---

### 1. Token Integration (OBRIGATORIO)

- [ ] **Import presente** - `import { colors, typography, spacing, animation } from '@/styles/tokens'`
- [ ] **Zero cores hardcoded** - Nenhum `#000000`, `#FFFFFF`, `#C9B298`, `#A8A8A8` literal no codigo
- [ ] **Zero fontes hardcoded** - Nenhum `"Inter"`, `"Source Serif 4"`, `"Space Grotesk"` literal
- [ ] **Zero tamanhos hardcoded** - Font sizes usam `typography.sizes.*`, nao numeros diretos
- [ ] **Zero spacing hardcoded** - Padding/margin/gap usam `spacing.*`, nao numeros diretos
- [ ] **Animacoes via tokens** - Spring configs usam `animation.easing.*` (smooth, snappy, bouncy, gentle)
- [ ] **Duracoes via tokens** - Usam `animation.fast`(10), `animation.normal`(15), `animation.slow`(30)
- [ ] **Video config via tokens** - FPS referencia `video.fps`(30), dimensoes `video.width`/`video.height`

---

### 2. Core Color Rules

#### Background (70% da tela)

- [ ] **Primary background** - Usa `colors.background` (#000000 preto puro)
- [ ] **NO colored backgrounds** - Backgrounds sempre preto, exceto overlays com opacity

#### Foreground (22% da tela)

- [ ] **Primary text** - Usa `colors.foreground` (#FFFFFF branco puro)
- [ ] **Secondary text** - Usa `colors.muted` (#A8A8A8 cinza)

#### Primary Accent (MAX 8% - SACRED RULE)

- [ ] **Primary via token** - Usa `colors.primary` (#C9B298) ou `colors.gradientPrimary`
- [ ] **Area calculada** - Primary nao excede 8% de 1080x1920 = 165.888px
- [ ] **Uso permitido:** CTAs, highlights, numeros, borders, linhas de acento
- [ ] **Uso PROIBIDO:** Backgrounds grandes, texto corrido, icones comuns

#### Calculo de Area Primary

```
Area total da tela: 1080 x 1920 = 2.073.600 px
Limite 8%: 165.888 px

Elementos comuns:
- Linha de acento (200x4px):        800 px = 0.04%
- Borda de card (400x200x1px):    1.200 px = 0.06%
- Texto trend "+34%" (~60x28px):   1.680 px = 0.08%
- Botao CTA (400x80px):          32.000 px = 1.54%
- Glow CTA (440x120 @ 0.3):      15.840 px = 0.76%

Regra: somar TODOS os elementos primary visiveis simultaneamente.
```

---

### 3. Typography Rules

#### UI Typography (Inter)

- [ ] **Font** - Usa `typography.ui` (Inter, system-ui, sans-serif)
- [ ] **Weights** - Usa `typography.weights.semibold`(600) ou `typography.weights.bold`(700)
- [ ] **Uso:** Titulos, CTAs, Labels, Numeros, Headlines

#### Body Typography (Source Serif 4)

- [ ] **Font** - Usa `typography.body` (Source Serif 4, Georgia, serif)
- [ ] **Weight** - Usa `typography.weights.regular`(400)
- [ ] **Uso:** Corpo de texto, descricoes, quotes, subtitulos

#### Font Sizes (Scale)

- [ ] **headline**: `typography.sizes.headline` = 72
- [ ] **title**: `typography.sizes.title` = 56
- [ ] **subtitle**: `typography.sizes.subtitle` = 40
- [ ] **body**: `typography.sizes.body` = 32
- [ ] **label**: `typography.sizes.label` = 28
- [ ] **small**: `typography.sizes.small` = 24
- [ ] **tiny**: `typography.sizes.tiny` = 18

---

### 4. Layout Rules

#### Spacing System (Base: 8px)

- [ ] `spacing.xs` = 8px
- [ ] `spacing.sm` = 16px
- [ ] `spacing.md` = 24px
- [ ] `spacing.lg` = 32px
- [ ] `spacing.xl` = 48px
- [ ] `spacing.xxl` = 64px
- [ ] `spacing.xxxl` = 96px

#### Grid e Safe Zones

- [ ] **Dimensao fixa** - 1080x1920 (9:16 vertical video)
- [ ] **Safe zone top** - `layout.safeZone.top` = 200px (UI celular)
- [ ] **Safe zone bottom** - `layout.safeZone.bottom` = 200px (UI celular)
- [ ] **Margem lateral** - `layout.margin` = 40px
- [ ] **Largura conteudo** - `layout.contentWidth` = 1000px
- [ ] **Texto nao cortado** - Nenhum texto fora das safe zones

#### Icon Rules

- [ ] **Style** - Flaticon Regular Rounded
- [ ] **Consistency** - Todos do mesmo pack
- [ ] **Color:** Branco info, Primary acao, Muted secundario

---

### 5. Animation Rules (Remotion)

#### Timing

- [ ] **Fast** - `animation.fast` = 10 frames (0.33s)
- [ ] **Normal** - `animation.normal` = 15 frames (0.5s)
- [ ] **Slow** - `animation.slow` = 30 frames (1s)
- [ ] **Very Slow** - `animation.verySlow` = 60 frames (2s)

#### Spring Configs

- [ ] **Smooth** - `animation.easing.smooth` (entradas suaves)
- [ ] **Snappy** - `animation.easing.snappy` (entradas rapidas)
- [ ] **Bouncy** - `animation.easing.bouncy` (efeito bounce CTAs)
- [ ] **Gentle** - `animation.easing.gentle` (cards/conteudo)

#### Boas Praticas

- [ ] **Clamps** - `extrapolateLeft: 'clamp'` e `extrapolateRight: 'clamp'` em todo interpolate
- [ ] **Frame-based** - Toda animacao deriva de `useCurrentFrame()`
- [ ] **Stagger** - Elementos sequenciais usam `delay` prop para stagger
- [ ] **PROIBIDO:** Bounce excessivo, flash, rotation 360 continua

---

### 6. Remotion Component Structure

- [ ] **useCurrentFrame()** presente no topo do componente
- [ ] **useVideoConfig()** presente quando usa fps
- [ ] **AbsoluteFill** como wrapper quando componente ocupa tela inteira
- [ ] **Sequence** para controlar timeline de aparecimento
- [ ] **style={{}}** inline - ZERO className props
- [ ] **Props tipadas** - Interface TypeScript com JSDoc
- [ ] **delay/startFrame prop** - Componente aceita delay para stagger
- [ ] **Guard clause** - `if (relativeFrame < 0) return null` quando usa startFrame

---

### 7. 21st.dev Adaptation (Quando Convertendo)

- [ ] **Tailwind removido** - Zero `className` props, zero classes utilitarias
- [ ] **CSS animations removidas** - Nenhum `transition`, `animation`, `@keyframes` CSS
- [ ] **Hover/focus/active removidos** - Nao existem em video
- [ ] **cursor-pointer removido** - Nao existe cursor em video
- [ ] **Media queries removidas** - Video tem dimensao fixa 1080x1920
- [ ] **useState removido** - Estado em video = frame number
- [ ] **useEffect removido** - Sem side effects em render de video
- [ ] **onClick/onHover removidos** - Substituidos por animacao frame-based
- [ ] **Cores mapeadas** - Tailwind classes -> tokens (ver pipeline.md)
- [ ] **Fontes mapeadas** - font-sans -> typography.ui, font-serif -> typography.body
- [ ] **Spacing mapeado** - p-4 -> spacing.lg, gap-2 -> spacing.sm

---

### 8. Pre-Export / Pre-Commit Check

- [ ] **Cores corretas** - Usa tokens, nao hardcoded
- [ ] **Fontes corretas** - Inter (UI) e Source Serif 4 (body) via tokens
- [ ] **8% rule validada** - Primary calculado e dentro do limite
- [ ] **Icons consistentes** - Flaticon Regular Rounded, mesmo pack
- [ ] **Qualidade premium** - Visual limpo, minimalista, elegante
- [ ] **Testado em preview** - Visualizado no Remotion Studio em 1080x1920
- [ ] **Texto em PT-BR** - Todo texto visivel em portugues brasileiro
- [ ] **Safe zones respeitadas** - Conteudo dentro dos limites de tela

---

## Quick Reference

```yaml
Tokens Import:
  import: "import { colors, typography, spacing, animation, layout, video } from '@/styles/tokens'"

Colors:
  background: "colors.background"    # #000000 (70%)
  foreground: "colors.foreground"    # #FFFFFF (22%)
  primary:    "colors.primary"       # #C9B298 (MAX 8%)
  muted:      "colors.muted"         # #A8A8A8
  gradient:   "colors.gradientPrimary"  # linear-gradient primary

Typography:
  ui:   "typography.ui"    # Inter, system-ui, sans-serif
  body: "typography.body"  # Source Serif 4, Georgia, serif

Spacing (grid 8px):
  xs: 8 | sm: 16 | md: 24 | lg: 32 | xl: 48 | xxl: 64 | xxxl: 96

Animation (30fps):
  fast: 10 frames | normal: 15 frames | slow: 30 frames | verySlow: 60 frames

Layout:
  safeZone: top/bottom 200px | margin: 40px | contentWidth: 1000px

Video:
  width: 1080 | height: 1920 | fps: 30

Reference Docs:
  pipeline: "workflows/design-creative/21st-to-remotion-pipeline.md"
  template: "templates/remotion/ds-integrated-component.tsx"
  tokens:   "brand-ds/src/tokens/remotion.ts (ou data/remotion-tokens-reference.ts)"
```
