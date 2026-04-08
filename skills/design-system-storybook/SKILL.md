---
name: design-system-storybook
description: Generates React components + Storybook stories from extracted design system data
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion]
version: "1.0.0"
category: design
requires: aios

tags: [SKILL]
---

# Component Factory (Bootstrap Mode)

Gera componentes React + stories basicos rapidamente. Util como ponto de partida.

**Para qualidade profissional**, use o modo Premium do `/design-system-forge` que delega para:
- `@brad-frost *build` — componentes production-ready (6 variantes, hover/loading/a11y, testes)
- `@storybook-expert` — stories CSF3 type-safe com interaction testing

**Esta skill** e o modo rapido/fallback: gera esqueleto basico em segundos.

**Credito:** Diretrizes de qualidade visual adaptadas do [Design OS](https://github.com/buildermethods/design-os) (Brian Casel / Builder Methods).

**Quality Standard:** Consultar `skills/design-system-quality-standard.md` antes de gerar componentes.
Todo componente gerado DEVE usar `cn()`, `forwardRef`, CVA para variantes, e `focus-visible`.

---

## Design Quality Rules (Anti-AI Slop)

Componentes gerados DEVEM evitar estetica generica de IA. Regras:

### Tipografia
- NUNCA usar fontes genericas (Inter, Roboto, Arial, system fonts) como escolha padrao
- USAR as fontes extraidas do site original (tokens.yaml → typography)
- Se nao houver fonte extraida, sugerir ao usuario uma fonte com personalidade

### Cores
- NUNCA usar esquemas cliche (gradiente roxo em fundo branco, azul-cinza corporativo generico)
- USAR a paleta real extraida do site (tokens.yaml → colors, custom_properties)
- Cores dominantes com acentos marcantes > paletas timidas e distribuidas igualmente

### Layout
- NUNCA gerar layouts previsíveis e cookie-cutter
- RESPEITAR o layout original do site (section-map.json, dom-tree.json)
- Espacamento generoso OU densidade controlada — nunca o meio-termo insosso

### Animacoes
- CSS puro para efeitos simples (hover, fade-in)
- Framer Motion / GSAP para scroll-triggered e micro-interactions
- UM efeito de entrada bem orquestrado > muitos efeitos espalhados

### Componentes Props-Based (padrao Design OS)
- Componentes DEVEM receber dados via props, nunca importar dados diretamente
- Callbacks opcionais com optional chaining (`onClick?.()`)
- Totalmente portaveis — copiar o componente para qualquer projeto React deve funcionar
- TypeScript interfaces para todas as props

### Responsividade
- Mobile responsive com prefixos Tailwind (`sm:`, `md:`, `lg:`)
- Light + dark mode via `dark:` variants
- Tokens aplicados via CSS custom properties quando disponiveis

---

## Entry Point

Ao ser ativada, esta skill guia o usuario passo a passo. Nunca assume — sempre pergunta.

### Passo 1: Localizar projeto

Verificar se existe um projeto scaffoldado com Storybook:

```
Qual design system quer popular com componentes?

1. {listar pastas em ~/CODE/design-systems/ que tenham .storybook/}
2. Informar caminho manualmente
```

Validar que o projeto tem:
- `design-system/components.json` — OBRIGATORIO
- `design-system/extracted-css.json` — OBRIGATORIO
- `design-system/tokens.yaml` — OBRIGATORIO
- `.storybook/` — OBRIGATORIO (senao: "Rode /design-system-scaffold primeiro")
- `tailwind.config.ts` — OBRIGATORIO

Se faltar algo, dizer exatamente o que falta e sugerir o comando.

### Passo 2: Analisar componentes detectados

Ler `design-system/components.json` e classificar em atomico/molecular/organismo:

```
Encontrei {N} tipos de componentes no site original:

ATOMS (elementos basicos):
  - button ({N} instancias) — {cores, border-radius}
  - badge ({N}) — {estilo}
  - input ({N}) — {estilo}
  - avatar ({N}) — {tamanho}
  - icon ({N}) — via SVGs extraidos

MOLECULES (combinacoes):
  - card ({N}) — {layout, shadow}
  - nav-item ({N}) — {estilo}
  - form-field ({N}) — input + label + error

ORGANISMS (secoes completas):
  - hero ({N}) — {background, CTA}
  - header ({N}) — {nav, logo}
  - footer ({N}) — {links, social}
  - feature-section ({N}) — {grid, icons}

Quer gerar todos, ou escolher quais?
1. Todos (Recomendado — atoms primeiro, depois molecules, depois organisms)
2. Escolher quais gerar
3. So atoms por enquanto
```

### Passo 3: Gerar atoms

Para cada atom detectado, executar o Component Pipeline:

1. **Ler dados** — buscar samples do `components.json`, estilos do `extracted-css.json`, tokens do `tokens.yaml`
2. **Gerar componente** — criar `src/components/atoms/{name}/{Name}.tsx` usando template atom
3. **Gerar story** — criar `src/components/atoms/{name}/{Name}.stories.tsx` usando template story
4. **Gerar docs** — criar `src/components/atoms/{name}/{Name}.mdx` usando template docs
5. **Gerar index** — criar `src/components/atoms/{name}/index.ts` com barrel export
6. **Validar** — perguntar ao usuario se ficou fiel

Apos cada componente:
```
Gerei o componente Button:
  - src/components/atoms/button/Button.tsx
  - src/components/atoms/button/Button.stories.tsx
  - src/components/atoms/button/Button.mdx

Rode `npm run storybook` e veja o componente.

Ficou fiel ao original?
1. Sim, proximo componente
2. Precisa de ajuste — me diz o que mudar
3. Pular este componente
```

Se "Precisa de ajuste":
```
O que esta diferente do original?
Dica: abre {url-original} e compara lado a lado com o Storybook.

Se for dificil descrever, me diz qual parte (cor, tamanho, espacamento, animacao, etc.)
```

### Passo 4: Gerar molecules

Mesmo fluxo do Passo 3, mas usando template molecule.
Molecules importam atoms ja criados.

### Passo 5: Gerar organisms

Mesmo fluxo, mas com template organism.
Organisms importam atoms + molecules.

### Passo 6: Animacoes complexas

Ler `extracted-css.json` → `cssRules.animations` e verificar quais componentes usam animacoes:

```
Estes componentes tem animacoes que podem ser elevadas:

  - Hero: gradientFlow (gradient animado)
    -> Referencia: ui.aceternity.com/components/aurora-background

  - Button: shine (brilho hover)
    -> Referencia: magicui.design/docs/components/shimmer-button

  - Logos: infinitescroll (marquee)
    -> Referencia: npmjs.com/package/react-fast-marquee

Quer que eu aplique alguma dessas versoes premium?
1. Sim, todas
2. Escolher quais
3. Manter as animacoes CSS basicas
```

### Passo 7: Score de completude

```
Design System Score:

  Componentes: {gerados}/{detectados} ({%})
  Variantes:   {geradas}/{estimadas} ({%})
  Animacoes:   {aplicadas}/{detectadas} ({%})
  Docs pages:  {criadas}/{componentes} ({%})

  Score geral: {media}%

Sugestoes de melhoria:
  1. {componente X} nao tem variante dark
  2. {componente Y} poderia usar animacao premium
  3. Adicionar {componente Z} que nao foi detectado automaticamente

Proximo passo:
  /design-system-catalog — registrar no catalogo global
```

---

## Component Pipeline

### Classificacao Atomica (Atomic Design — Brad Frost)

| Categoria | Componentes | Criterio |
|-----------|------------|---------|
| Atom | button, badge, input, avatar, icon, tag, separator, skeleton | Elemento HTML unico, sem composicao |
| Molecule | card, nav-item, form-field, testimonial, stat, menu-item | Combina 2-3 atoms |
| Organism | hero, header, footer, feature-section, pricing, cta-section | Secao completa da pagina |

### Mapeamento components.json -> Atomic Level

```javascript
const ATOMIC_MAP = {
  // Atoms
  button: 'atom',
  'form-input': 'atom',
  badge: 'atom',
  avatar: 'atom',
  icon: 'atom',              // from SVGs
  skeleton: 'atom',
  progress: 'atom',
  notification: 'atom',      // toast/alert atom

  // Molecules
  card: 'molecule',
  'nav-item': 'molecule',    // part of navigation
  tabs: 'molecule',
  accordion: 'molecule',
  dropdown: 'molecule',
  tooltip: 'molecule',
  breadcrumb: 'molecule',
  pagination: 'molecule',
  carousel: 'molecule',

  // Organisms
  hero: 'organism',
  header: 'organism',        // from navigation
  footer: 'organism',
  'feature-section': 'organism', // from grid-layout + card
  'main-content': 'organism',
  sidebar: 'organism',
  form: 'organism',
  modal: 'organism',
  table: 'organism',
  'cta-link': 'molecule',    // CTA button is molecule-level
};
```

### Estilo por Token

Para cada componente, resolver estilos nesta ordem de prioridade:
1. **CSS custom properties** (`extracted-css.json` → `cssRules.customProperties`) — usar `var(--nome)`
2. **Tailwind tokens** (`tailwind.config.ts` colors/spacing) — usar classes Tailwind
3. **Valores inline do sample** (`components.json` → `samples[0].styles`) — fallback

---

## Story Template

Cada story segue este padrao:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: '{Level}/{ComponentName}',   // e.g. "Atoms/Button"
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    // Props com controles do Storybook
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: { /* props padrao extraidas do sample */ },
};

export const Hover: Story = {
  args: { /* ... */ },
  parameters: { pseudo: { hover: true } },
};

// Variantes adicionais baseadas nos samples detectados
```

### Variantes automaticas

| Se detectar... | Criar variante |
|----------------|---------------|
| Multiplos samples com cores diferentes | `Primary`, `Secondary`, `Accent` |
| Sample com `disabled` class/attr | `Disabled` |
| Animation no componente | `Animated` |
| Dark background no section-map | `Dark` |
| Tamanhos diferentes nos samples | `Small`, `Medium`, `Large` |

---

## Improvement Suggestions

Apos gerar todos os componentes, a skill sugere melhorias baseadas em gaps:

| Gap detectado | Sugestao |
|--------------|---------|
| Componente sem variante hover | "Adicione estado :hover com transicao suave" |
| Componente sem dark mode | "Adicione variante dark com bg-slate-900" |
| Animacao CSS simples detectada | "Eleve com {biblioteca}: {url}" |
| Componente sem responsividade | "Adicione breakpoints mobile/tablet" |
| SVGs usados como imagem | "Converta para componente React com props de cor" |
| Gradiente hardcoded | "Use CSS custom property para gradiente reutilizavel" |

---

## Animation Sources

Consultar quando componentes tem animacoes complexas:

| Tipo | Fonte | URL | Quando usar |
|------|-------|-----|-------------|
| Scroll animations | Framer Motion | npmjs.com/package/framer-motion | Elementos que aparecem/transformam ao scrollar |
| Scroll animations | GSAP | gsap.com | ScrollTrigger, timelines complexas |
| Particulas/3D | tsparticles | particles.js.org | Background com pontos, confetti |
| Particulas/3D | Three.js | threejs.org | WebGL, cenas 3D |
| Gradientes animados | CSS puro | — | gradientFlow, background-position animate |
| Micro-interactions | Aceternity UI | ui.aceternity.com | Hover effects, cards 3D, spotlight |
| Micro-interactions | Magic UI | magicui.design | Componentes animados React |
| Micro-interactions | 21st.dev | 21st.dev | Componentes premium copiaveis |
| Lottie | LottieFiles | lottiefiles.com | Icones animados, loading |
| CSS animations | Animista | animista.net | Gerador visual de @keyframes |
| Marquee | React Fast Marquee | npmjs.com/package/react-fast-marquee | Scroll infinito de logos |

**Regra:** @keyframes simples -> CSS puro. Interacao com scroll/mouse/3D -> buscar nas bibliotecas acima.

---

## Pipeline Completo (4 skills)

```
/design-system-forge           <- Extrai DNA do site
/design-system-scaffold        <- Cria projeto Next.js + Storybook
/design-system-storybook       <- VOCE ESTA AQUI
/design-system-catalog         <- Registra no catalogo global
```
