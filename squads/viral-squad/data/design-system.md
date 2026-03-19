# 🎨 Academia Lendária Design System v4.1

## Minimalismo Lendário

### Color Palette

```
Background: #000000 (~70% da tela)
Foreground: #FFFFFF (~22% da tela)
Primary (Gold): #C9B298 (MAX 8% da tela) ⚠️
Muted: #A8A8A8 (subtextos)
```

### 8% Gold Rule (SACRED)

**CRÍTICO:** Ouro usado em >8% = perde impacto

**Use ONLY para:**

- CTAs principais
- Key highlights
- Important numbers
- Accent borders

**NEVER para:**

- Backgrounds grandes
- Body text
- Decoração excessiva

### Typography

```
UI/Títulos: Inter SemiBold 600
Corpo: Source Serif 4 Regular 400

Sizes (Mobile 1080x1920):
Hero: 72-96px
Title: 48-64px
Body: 32-40px
Caption: 24-28px
```

### Icons

**Style:** Flaticon Regular Rounded
**Color:** White primary, Gold accents
**Size:** 48-64px standard

### Layout Grid

```
Safe zones:
Top: 0-200px (avoid UI)
Content: 200-1720px
Bottom: 1720-1920px (avoid UI)

Margins: 40px sides
Padding: 8px base unit
```

### Formats

```
Instagram Reels: 1080x1920, 15-90s
Instagram Feed: 1080x1080, 3-60s
Instagram Stories: 1080x1920, até 15s
```

---

## Token Import Pattern (Remotion)

```typescript
// SEMPRE importar tokens - NUNCA hardcodar valores
import { colors, typography, spacing, animation } from '@/styles/tokens';

// Usar assim:
style={{
  backgroundColor: colors.background,
  color: colors.foreground,
  fontFamily: typography.ui,
  fontSize: typography.sizes.title,
  padding: spacing.xl,
}}

// Para animacoes spring:
const scale = spring({
  frame: frame - delay,
  fps,
  config: animation.easing.smooth,
});
```

## Bridge Architecture

```
academia-lendaria-ds/src/tokens/remotion.ts   <-- FONTE DE VERDADE
        |
        v
viral-automacao-video/src/styles/tokens.ts     <-- Re-export
        |
        v
Todos os componentes Remotion                  <-- import { colors, ... } from '@/styles/tokens'
```

**Referencia completa de tokens:** `data/remotion-tokens-reference.ts`

---

**Este design system é otimizado para viralização no Instagram.**
