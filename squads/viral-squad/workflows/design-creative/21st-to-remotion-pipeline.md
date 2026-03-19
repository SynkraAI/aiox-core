# Pipeline: 21st.dev -> Design System -> Remotion

Guia completo do pipeline de conversao de componentes UI do 21st.dev MCP para componentes Remotion prontos para video, passando pelo Design System Academia Lendaria.

## Metadata

```yaml
name: 21st-to-remotion-pipeline
command: /viral:21st-to-remotion
category: design-creative
agents:
  - "@ui-magic" # Gera componentes via 21st.dev MCP
  - "@remotion-architect" # Adapta para Remotion (inline styles + frames)
  - "@visual-impact" # Valida impacto visual e regra 8% gold
mcp_tools:
  - mcp__magic__21st_magic_component_builder
  - mcp__magic__21st_magic_component_inspiration
  - mcp__magic__21st_magic_component_refiner
```

---

## Arquitetura dos 3 Mundos

O pipeline conecta tres mundos com linguagens visuais distintas. Entender cada um e ESSENCIAL para conversoes corretas.

### Mundo 1: 21st.dev (Tailwind + CSS)

O 21st.dev gera componentes React com **Tailwind CSS** e animacoes CSS padrao. Esse e o ponto de partida -- componentes bonitos, prontos para web, mas INCOMPATIVEIS com Remotion.

**Caracteristicas:**

- Classes utilitarias (`bg-black`, `text-white`, `rounded-lg`)
- Animacoes CSS (`animate-fade-in`, `transition-opacity`)
- Estados interativos (`hover:`, `focus:`, `active:`)
- Responsividade (`md:`, `lg:`, breakpoints)
- className como atributo principal de estilo

**Problema:** Remotion NAO processa Tailwind. Classes CSS sao ignoradas na renderizacao de video.

### Mundo 2: Academia Lendaria Design System (Design Tokens)

O Design System "Minimalismo Lendario" v4.1 define os tokens visuais da marca. E a **ponte** entre o mundo web e o mundo video.

**Caracteristicas:**

- Tokens TypeScript tipados (`colors`, `typography`, `spacing`, `animation`)
- Paleta restrita: preto 70%, branco 22%, gold 8%
- Tipografia: Inter (UI) + Source Serif 4 (body)
- Grid de 8px para espacamento
- Animacoes em frames (30fps)

**Regra Sagrada:** Gold (#C9B298) NUNCA excede 8% da area visivel da tela.

### Mundo 3: Remotion (Inline Styles + Frames)

Remotion renderiza video frame a frame em React. Todo estilo DEVE ser **inline** via `style={{}}` e toda animacao DEVE ser baseada em `frame`.

**Caracteristicas:**

- `style={{}}` obrigatorio (nao processa className)
- `useCurrentFrame()` para estado temporal
- `interpolate()` e `spring()` para animacoes
- Dimensoes fixas: 1080x1920 (vertical video)
- 30 FPS, sem estados interativos (sem hover/click)
- Sem CSS-in-JS, sem styled-components na renderizacao

### Diagrama do Fluxo

```
21st.dev MCP                Academia Lendaria DS           Remotion
-----------                ------------------              -------
className="bg-black"   --> colors.background (#000000) --> style={{ backgroundColor: '#000000' }}
className="text-7xl"   --> typography.sizes.headline    --> style={{ fontSize: 72 }}
animate-fade-in        --> animation.normal (15 frames) --> interpolate(frame, [0, 15], [0, 1])
hover:scale-105        --> REMOVER                      --> NAO EXISTE EM VIDEO
```

---

## Token Flow

A fonte de verdade dos tokens segue este caminho unidirecional:

```
academia-lendaria-ds/src/tokens/remotion.ts    <-- FONTE DE VERDADE
          |
          v
viral-automacao-video/src/styles/tokens.ts     <-- re-export (import { colors, typography, ... })
          |
          v
Componentes importam de @/styles/tokens        <-- USO FINAL
```

### Import Padrao em Componentes Remotion

```typescript
import {
  colors,
  typography,
  spacing,
  animation,
  video,
  layout,
} from "@/styles/tokens";
```

### Tokens Disponiveis

| Token        | Conteudo                                         |
| ------------ | ------------------------------------------------ |
| `colors`     | background, foreground, primary, muted, semantic |
| `typography` | ui, body, weights, sizes                         |
| `spacing`    | xs(8), sm(16), md(24), lg(32), xl(48), xxl(64)   |
| `animation`  | fast(10), normal(15), slow(30), easing configs   |
| `video`      | width(1080), height(1920), fps(30)               |
| `layout`     | safeZone, margin(40), contentWidth(1000)         |

---

## Tabela: Tailwind -> Inline Style (com Tokens)

Referencia completa de conversao de classes Tailwind para inline styles usando tokens do Design System.

### Cores e Background

| Tailwind Class    | Inline Style (com token)             | Valor Resolvido |
| ----------------- | ------------------------------------ | --------------- |
| `bg-black`        | `backgroundColor: colors.background` | `#000000`       |
| `bg-white`        | `backgroundColor: colors.foreground` | `#FFFFFF`       |
| `bg-primary`      | `backgroundColor: colors.primary`    | `#C9B298`       |
| `text-white`      | `color: colors.foreground`           | `#FFFFFF`       |
| `text-black`      | `color: colors.background`           | `#000000`       |
| `text-primary`    | `color: colors.primary`              | `#C9B298`       |
| `text-gray-400`   | `color: colors.muted`                | `#A8A8A8`       |
| `text-green-500`  | `color: colors.success`              | `#22C55E`       |
| `text-red-500`    | `color: colors.error`                | `#EF4444`       |
| `text-yellow-500` | `color: colors.warning`              | `#F59E0B`       |
| `opacity-50`      | `opacity: 0.5`                       | `0.5`           |
| `opacity-0`       | `opacity: 0`                         | `0`             |

### Tipografia

| Tailwind Class   | Inline Style (com token)                  | Valor Resolvido                      |
| ---------------- | ----------------------------------------- | ------------------------------------ |
| `font-sans`      | `fontFamily: typography.ui`               | `'Inter, system-ui, sans-serif'`     |
| `font-serif`     | `fontFamily: typography.body`             | `'"Source Serif 4", Georgia, serif'` |
| `text-7xl`       | `fontSize: typography.sizes.headline`     | `72`                                 |
| `text-5xl`       | `fontSize: typography.sizes.title`        | `56`                                 |
| `text-3xl`       | `fontSize: typography.sizes.subtitle`     | `40`                                 |
| `text-xl`        | `fontSize: typography.sizes.body`         | `32`                                 |
| `text-lg`        | `fontSize: typography.sizes.label`        | `28`                                 |
| `text-sm`        | `fontSize: typography.sizes.small`        | `24`                                 |
| `text-xs`        | `fontSize: typography.sizes.tiny`         | `18`                                 |
| `font-normal`    | `fontWeight: typography.weights.regular`  | `400`                                |
| `font-semibold`  | `fontWeight: typography.weights.semibold` | `600`                                |
| `font-bold`      | `fontWeight: typography.weights.bold`     | `700`                                |
| `leading-tight`  | `lineHeight: 1.2`                         | `1.2`                                |
| `leading-normal` | `lineHeight: 1.5`                         | `1.5`                                |
| `tracking-wide`  | `letterSpacing: 2`                        | `2`                                  |
| `uppercase`      | `textTransform: 'uppercase'`              | `'uppercase'`                        |
| `text-center`    | `textAlign: 'center'`                     | `'center'`                           |
| `text-left`      | `textAlign: 'left'`                       | `'left'`                             |
| `text-right`     | `textAlign: 'right'`                      | `'right'`                            |

### Espacamento

| Tailwind Class | Inline Style (com token)                              | Valor Resolvido |
| -------------- | ----------------------------------------------------- | --------------- |
| `p-1`          | `padding: spacing.xs`                                 | `8`             |
| `p-2`          | `padding: spacing.sm`                                 | `16`            |
| `p-3`          | `padding: spacing.md`                                 | `24`            |
| `p-4`          | `padding: spacing.lg`                                 | `32`            |
| `p-6`          | `padding: spacing.xl`                                 | `48`            |
| `p-8`          | `padding: spacing.xxl`                                | `64`            |
| `px-8`         | `paddingLeft: spacing.xxl, paddingRight: spacing.xxl` | `64, 64`        |
| `py-4`         | `paddingTop: spacing.lg, paddingBottom: spacing.lg`   | `32, 32`        |
| `m-4`          | `margin: spacing.lg`                                  | `32`            |
| `mx-auto`      | `marginLeft: 'auto', marginRight: 'auto'`             | `'auto'`        |
| `gap-1`        | `gap: spacing.xs`                                     | `8`             |
| `gap-2`        | `gap: spacing.sm`                                     | `16`            |
| `gap-4`        | `gap: spacing.lg`                                     | `32`            |
| `gap-6`        | `gap: spacing.xl`                                     | `48`            |

### Layout e Flexbox

| Tailwind Class    | Inline Style                           | Valor Resolvido   |
| ----------------- | -------------------------------------- | ----------------- |
| `flex`            | `display: 'flex'`                      | `'flex'`          |
| `flex-col`        | `flexDirection: 'column'`              | `'column'`        |
| `flex-row`        | `flexDirection: 'row'`                 | `'row'`           |
| `items-center`    | `alignItems: 'center'`                 | `'center'`        |
| `items-start`     | `alignItems: 'flex-start'`             | `'flex-start'`    |
| `items-end`       | `alignItems: 'flex-end'`               | `'flex-end'`      |
| `justify-center`  | `justifyContent: 'center'`             | `'center'`        |
| `justify-between` | `justifyContent: 'space-between'`      | `'space-between'` |
| `justify-start`   | `justifyContent: 'flex-start'`         | `'flex-start'`    |
| `flex-1`          | `flex: 1`                              | `1`               |
| `flex-wrap`       | `flexWrap: 'wrap'`                     | `'wrap'`          |
| `absolute`        | `position: 'absolute'`                 | `'absolute'`      |
| `relative`        | `position: 'relative'`                 | `'relative'`      |
| `inset-0`         | `top: 0, right: 0, bottom: 0, left: 0` | `0`               |
| `w-full`          | `width: '100%'`                        | `'100%'`          |
| `h-full`          | `height: '100%'`                       | `'100%'`          |
| `w-screen`        | `width: video.width`                   | `1080`            |
| `h-screen`        | `height: video.height`                 | `1920`            |
| `overflow-hidden` | `overflow: 'hidden'`                   | `'hidden'`        |
| `z-10`            | `zIndex: 10`                           | `10`              |

### Bordas e Sombras

| Tailwind Class   | Inline Style                                    | Valor Resolvido    |
| ---------------- | ----------------------------------------------- | ------------------ |
| `rounded-lg`     | `borderRadius: 12`                              | `12`               |
| `rounded-xl`     | `borderRadius: 14`                              | `14`               |
| `rounded-2xl`    | `borderRadius: 16`                              | `16`               |
| `rounded-full`   | `borderRadius: 9999`                            | `9999`             |
| `rounded-none`   | `borderRadius: 0`                               | `0`                |
| `border`         | `borderWidth: 1, borderStyle: 'solid'`          | `1px solid`        |
| `border-2`       | `borderWidth: 2, borderStyle: 'solid'`          | `2px solid`        |
| `border-primary` | `borderColor: colors.primary`                   | `#C9B298`          |
| `border-white`   | `borderColor: colors.foreground`                | `#FFFFFF`          |
| `shadow-lg`      | `boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'` | sombra larga       |
| `shadow-xl`      | `boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'` | sombra extra larga |
| `shadow-none`    | `boxShadow: 'none'`                             | sem sombra         |

---

## Tabela: CSS Animation -> Remotion

Conversao de animacoes CSS/Tailwind para equivalentes Remotion baseadas em frame.

### Transicoes e Fades

| CSS / Tailwind             | Remotion Equivalente                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `transition-opacity`       | `interpolate(frame, [start, end], [0, 1], { extrapolateRight: 'clamp' })`                                            |
| `animate-fade-in`          | `interpolate(frame - delay, [0, animation.normal], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })` |
| `animate-fade-out`         | `interpolate(frame - delay, [0, animation.normal], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })` |
| `opacity-0 -> opacity-100` | `const opacity = interpolate(frame, [0, animation.fast], [0, 1])`                                                    |

### Transforms e Scale

| CSS / Tailwind         | Remotion Equivalente                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| `animate-scale-in`     | `spring({ frame, fps: video.fps, config: animation.easing.smooth })` |
| `hover:scale-105`      | **REMOVER** - nao existe hover em video                              |
| `hover:scale-110`      | **REMOVER** - nao existe hover em video                              |
| `transition-transform` | `spring()` ou `interpolate()` baseado em frame                       |
| `animate-bounce`       | `spring({ frame, fps: video.fps, config: animation.easing.bouncy })` |
| `animate-spin`         | `interpolate(frame, [0, video.fps * 8], [0, 360])` (rotacao)         |

### Animacoes Ciclicas

| CSS / Tailwind  | Remotion Equivalente                                                               |
| --------------- | ---------------------------------------------------------------------------------- |
| `animate-pulse` | `interpolate(frame % (video.fps * 2), [0, video.fps, video.fps * 2], [1, 0.5, 1])` |
| `animate-ping`  | Loop com scale + opacity usando modulo: `frame % loopDuration`                     |

### Timing e Easing

| CSS / Tailwind  | Remotion Equivalente                          |
| --------------- | --------------------------------------------- |
| `duration-150`  | ~5 frames (`animation.fast / 2`)              |
| `duration-300`  | `animation.fast` (10 frames a 30fps = 0.33s)  |
| `duration-500`  | `animation.normal` (15 frames a 30fps = 0.5s) |
| `duration-700`  | ~21 frames                                    |
| `duration-1000` | `animation.slow` (30 frames a 30fps = 1s)     |
| `ease-in-out`   | `Easing.bezier(0.42, 0, 0.58, 1)`             |
| `ease-out`      | `Easing.out(Easing.cubic)`                    |
| `ease-in`       | `Easing.in(Easing.cubic)`                     |
| `linear`        | Nenhum easing (interpolate padrao)            |

### O Que REMOVER (Web-Only)

| CSS / Tailwind               | Acao                                                   |
| ---------------------------- | ------------------------------------------------------ |
| `hover:*`                    | **REMOVER completamente** - nao existe mouse em video  |
| `focus:*`                    | **REMOVER completamente** - nao existe focus em video  |
| `active:*`                   | **REMOVER completamente** - nao existe click em video  |
| `cursor-pointer`             | **REMOVER** - nao existe cursor em video               |
| `transition`                 | **SUBSTITUIR** por interpolate/spring baseado em frame |
| `@keyframes`                 | **SUBSTITUIR** por logica de frame com interpolate     |
| Media queries (`md:`, `lg:`) | **REMOVER** - video tem dimensao fixa 1080x1920        |

---

## Exemplo Completo Passo-a-Passo

Vamos converter um card gerado pelo 21st.dev em um componente Remotion completo.

### Passo 1: Output Original do 21st.dev (com Tailwind)

```tsx
// Componente gerado pelo 21st.dev MCP
export function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-black rounded-2xl p-8 gap-6 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-amber-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
      <h2 className="text-5xl font-bold text-white text-center leading-tight">
        {title}
      </h2>
      <p className="text-xl text-gray-400 text-center font-serif leading-normal">
        {description}
      </p>
      <button className="bg-amber-600 text-black font-semibold px-8 py-4 rounded-lg hover:scale-105 transition-transform duration-300">
        Saiba Mais
      </button>
    </div>
  );
}
```

### Passo 2: Remover className, Adicionar style={{}}

Substituir TODOS os `className` por `style={{}}`. Nenhum className pode sobreviver.

```tsx
export function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        borderRadius: 16,
        padding: 64,
        gap: 48,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 9999,
          backgroundColor: "rgba(201, 178, 152, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          style={{ width: 32, height: 32, color: "#C9B298" }}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
      <h2
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 32,
          color: "#A8A8A8",
          textAlign: "center",
          fontFamily: '"Source Serif 4", Georgia, serif',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {/* REMOVIDO: hover:scale-105 e transition-transform (web-only) */}
      <div
        style={{
          backgroundColor: "#C9B298",
          color: "#000000",
          fontWeight: 600,
          paddingLeft: 64,
          paddingRight: 64,
          paddingTop: 32,
          paddingBottom: 32,
          borderRadius: 12,
        }}
      >
        Saiba Mais
      </div>
    </div>
  );
}
```

### Passo 3: Substituir Cores por Tokens

Trocar valores hardcoded pelos tokens do Design System.

```tsx
import { colors } from "@/styles/tokens";

// ANTES:
backgroundColor: "#000000";
color: "#FFFFFF";
color: "#C9B298";
color: "#A8A8A8";

// DEPOIS:
backgroundColor: colors.background;
color: colors.foreground;
color: colors.primary;
color: colors.muted;
```

### Passo 4: Substituir Fontes e Espacamento por Tokens

```tsx
import { colors, typography, spacing } from "@/styles/tokens";

// ANTES:
fontSize: 56;
fontWeight: 700;
fontFamily: '"Source Serif 4", Georgia, serif';
padding: 64;
gap: 48;

// DEPOIS:
fontSize: typography.sizes.title;
fontWeight: typography.weights.bold;
fontFamily: typography.body;
padding: spacing.xxl;
gap: spacing.xl;
```

### Passo 5: Adicionar useCurrentFrame e Animacao

```tsx
import { useCurrentFrame, interpolate, spring } from "remotion";
import { animation, video } from "@/styles/tokens";

const frame = useCurrentFrame();

// Fade in do card inteiro
const opacity = interpolate(frame, [0, animation.normal], [0, 1], {
  extrapolateRight: "clamp",
});

// Scale com spring (substitui transition-transform do CSS)
const scale = spring({
  frame,
  fps: video.fps,
  config: animation.easing.smooth,
});

// Stagger: titulo aparece depois do icone
const titleOpacity = interpolate(
  frame,
  [animation.fast, animation.fast + animation.normal],
  [0, 1],
  {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
);
```

### Passo 6: Validar 8% Gold Rule

Verificar que o gold (#C9B298 / colors.primary) ocupa no maximo 8% da area visivel.

```
Area total da tela: 1080 x 1920 = 2.073.600 px
8% do total: 165.888 px

Elementos gold neste componente:
- Icone (32x32 em area 64x64): ~1024 px gold visivel
- Botao CTA (estimativa 256x96): ~24.576 px gold
- Total gold: ~25.600 px = 1.2% da tela

APROVADO (1.2% < 8%)
```

**Se ultrapassar 8%:**

- Reduzir tamanho do elemento gold
- Usar gold apenas como borda/accent ao inves de fill
- Substituir fill solid por outline/border
- Usar `rgba(201, 178, 152, 0.2)` para backgrounds sutis

### Passo 7: Adicionar TypeScript Interface

```typescript
interface FeatureCardProps {
  /** Titulo principal do card */
  title: string;
  /** Descricao secundaria */
  description: string;
  /** Frame de inicio da animacao (para stagger entre cards) */
  startFrame?: number;
  /** Texto do botao CTA */
  ctaText?: string;
}
```

### Passo 8: Componente Final

```tsx
import React from "react";
import { useCurrentFrame, interpolate, spring, AbsoluteFill } from "remotion";
import { colors, typography, spacing, animation, video } from "@/styles/tokens";

interface FeatureCardProps {
  title: string;
  description: string;
  startFrame?: number;
  ctaText?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  startFrame = 0,
  ctaText = "Saiba Mais",
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  // Guard: nao renderizar antes do startFrame
  if (relativeFrame < 0) return null;

  // Animacoes
  const containerOpacity = interpolate(
    relativeFrame,
    [0, animation.normal],
    [0, 1],
    { extrapolateRight: "clamp" },
  );

  const containerScale = spring({
    frame: relativeFrame,
    fps: video.fps,
    config: animation.easing.smooth,
  });

  const titleOpacity = interpolate(
    relativeFrame,
    [animation.fast, animation.fast + animation.normal],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const descriptionOpacity = interpolate(
    relativeFrame,
    [animation.fast * 2, animation.fast * 2 + animation.normal],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const ctaOpacity = interpolate(
    relativeFrame,
    [animation.slow, animation.slow + animation.fast],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const ctaScale = spring({
    frame: Math.max(0, relativeFrame - animation.slow),
    fps: video.fps,
    config: animation.easing.bouncy,
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          borderRadius: 16,
          padding: spacing.xxl,
          gap: spacing.xl,
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
          opacity: containerOpacity,
          transform: `scale(${containerScale})`,
        }}
      >
        {/* Icone */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 9999,
            backgroundColor: `${colors.primary}33`, // 20% opacity
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: containerOpacity,
          }}
        >
          <svg
            style={{ width: 32, height: 32 }}
            fill={colors.primary}
            viewBox="0 0 24 24"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        {/* Titulo */}
        <h2
          style={{
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.bold,
            fontFamily: typography.ui,
            color: colors.foreground,
            textAlign: "center",
            lineHeight: 1.2,
            opacity: titleOpacity,
            margin: 0,
          }}
        >
          {title}
        </h2>

        {/* Descricao */}
        <p
          style={{
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.regular,
            fontFamily: typography.body,
            color: colors.muted,
            textAlign: "center",
            lineHeight: 1.5,
            opacity: descriptionOpacity,
            margin: 0,
            maxWidth: 800,
          }}
        >
          {description}
        </p>

        {/* CTA */}
        <div
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
            fontWeight: typography.weights.semibold,
            fontFamily: typography.ui,
            fontSize: typography.sizes.label,
            paddingLeft: spacing.xxl,
            paddingRight: spacing.xxl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.lg,
            borderRadius: 12,
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
          }}
        >
          {ctaText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

---

## Quick Reference Card

Referencia rapida para conversoes do dia-a-dia.

### Imports Obrigatorios

```typescript
// SEMPRE importar tokens
import {
  colors,
  typography,
  spacing,
  animation,
  video,
  layout,
} from "@/styles/tokens";

// SEMPRE importar Remotion hooks
import {
  useCurrentFrame,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";

// Para easing customizado
import { Easing } from "remotion";
```

### Receitas Rapidas de Animacao

```typescript
const frame = useCurrentFrame();

// Fade in simples
const fadeIn = interpolate(frame, [0, animation.normal], [0, 1], {
  extrapolateRight: "clamp",
});

// Fade in com delay
const fadeInDelayed = interpolate(frame, [20, 20 + animation.normal], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// Scale com spring suave
const scaleSmooth = spring({
  frame,
  fps: video.fps,
  config: animation.easing.smooth,
});

// Scale com bounce
const scaleBouncy = spring({
  frame,
  fps: video.fps,
  config: animation.easing.bouncy,
});

// Slide de baixo
const slideUp = interpolate(frame, [0, animation.normal], [100, 0], {
  extrapolateRight: "clamp",
});

// Rotacao continua (spinner)
const rotation = interpolate(frame, [0, video.fps * 8], [0, 360]);
```

### Checklist Rapido de Conversao

```
[ ] Todos os className removidos
[ ] Todos os estilos em style={{}}
[ ] Cores usando tokens (colors.*)
[ ] Fontes usando tokens (typography.*)
[ ] Espacamento usando tokens (spacing.*)
[ ] Hover/focus/active REMOVIDOS
[ ] Animacoes CSS convertidas para interpolate/spring
[ ] useCurrentFrame() adicionado
[ ] TypeScript interface definida
[ ] Gold rule 8% validada
[ ] Dimensoes fixas (sem responsividade)
[ ] Testado em 1080x1920
```

### Paleta Rapida

```
PRETO  : colors.background  = #000000  (70% da tela)
BRANCO : colors.foreground   = #FFFFFF  (22% da tela)
GOLD   : colors.primary      = #C9B298  (MAX 8% da tela)
CINZA  : colors.muted        = #A8A8A8  (texto secundario)
```

---

## Troubleshooting

### Problema: className nao aplica estilo no video renderizado

**Causa:** Remotion nao processa Tailwind CSS. Classes sao ignoradas silenciosamente.

**Solucao:** Converter TODOS os className para inline styles. Usar busca no arquivo:

```bash
grep -n "className" src/components/NomeComponente.tsx
```

Se encontrar qualquer resultado, a conversao esta incompleta.

### Problema: Animacao nao aparece ou congela

**Causa:** `useCurrentFrame()` nao foi chamado, ou o frame nao esta sendo passado para interpolate/spring.

**Solucao:**

1. Verificar que `useCurrentFrame()` esta no topo do componente
2. Verificar que o componente esta dentro de uma `<Sequence>` com `durationInFrames` suficiente
3. Verificar que `extrapolateRight: 'clamp'` esta presente para evitar valores infinitos

### Problema: Gold ocupa mais que 8% da tela

**Causa:** Elemento com colors.primary muito grande, ou multiplos elementos gold acumulados.

**Solucao:**

1. Calcular area total dos elementos gold: `largura x altura` de cada um
2. Somar todos e dividir por `1080 * 1920 = 2.073.600`
3. Se > 8%, reduzir: usar como borda (2px) ao inves de fill, ou usar opacity baixa

### Problema: Texto cortado ou fora da safe zone

**Causa:** Texto proximo as bordas da tela onde UI do celular pode cobrir.

**Solucao:** Respeitar safe zones do layout:

```typescript
style={{
  marginTop: layout.safeZone.top,     // 200px
  marginBottom: layout.safeZone.bottom, // 200px
  marginLeft: layout.margin,           // 40px
  marginRight: layout.margin,          // 40px
}}
```

### Problema: Fontes nao carregam no Remotion

**Causa:** Fontes precisam ser registradas via `@remotion/google-fonts` ou carregadas manualmente.

**Solucao:**

```typescript
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/SourceSerif4";

const { fontFamily: interFamily } = loadFont();
const { fontFamily: serifFamily } = loadSerif();
```

### Problema: Spring nunca para de animar

**Causa:** Configuracao de spring com damping muito baixo.

**Solucao:** Usar as configs pre-definidas do token:

```typescript
// Bom para entradas suaves
animation.easing.smooth; // { damping: 15, stiffness: 100 }

// Bom para entradas rapidas
animation.easing.snappy; // { damping: 12, stiffness: 200 }

// Bom para efeito bounce
animation.easing.bouncy; // { damping: 8, stiffness: 150 }
```

### Problema: Componente 21st.dev usa estado/hooks web

**Causa:** Componente original usa `useState`, `useEffect`, event handlers (`onClick`, `onMouseEnter`).

**Solucao:**

1. Remover `useState` -- estado em video e determinado pelo frame
2. Remover `useEffect` -- nao existe side effect em render de video
3. Substituir `onClick/onHover` por animacoes baseadas em frame
4. Manter apenas `useCurrentFrame()` como hook

---

## Workflows Relacionados

- `workflows/design-creative/ui-component-factory.md` -- Workflow completo de criacao de componentes
- `workflows/design-creative/design-system-creation.md` -- Criacao e manutencao do Design System
- `workflows/design-creative/animation-library-build.md` -- Biblioteca de animacoes Remotion

---

**Pipeline 21st.dev -> Design System -> Remotion -- Guia Completo de Conversao**
