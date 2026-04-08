---
name: design-system-forge
description: Orchestrator pipeline — clone any website into a premium design system via AIOS ecosystem
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion]
version: "3.0.0"
category: design
requires: aios
quest-pack: design-system-forge
delegates-to:
  - squads/design (Brad Frost, Storybook Expert, Atlas)
  - skills/design-system-scaffold
  - skills/design-system-storybook (fallback bootstrap)
  - skills/design-system-catalog

tags: [SKILL]
---

# Design System Forge

Pipeline orquestrador que transforma qualquer site em um design system premium.
Delega para o ecossistema AIOS em vez de fazer tudo sozinha.

**Filosofia:** Extraia o DNA. Delegue para especialistas. Entregue arte.

**Modelo:** Como o `/quest` usa o `/forge`, esta skill usa o `/design` squad.
Ela nao gera componentes — ela orquestra quem gera.

---

## Entry Point

Ao ser ativada, esta skill GUIA o usuário passo a passo. Nunca assume — sempre pergunta.

### Passo 1: Descobrir o alvo

Use `AskUserQuestion` para perguntar:

```
Qual site você quer clonar? Cole a URL completa (ex: https://circle.so/br)
```

Validar que é uma URL válida (começa com http/https). Se não, pedir de novo.

### Passo 2: Nomear o design system

Sugerir nome baseado no domínio:
```
URL: https://circle.so/br → Sugestão: "circle-br"

Como quer chamar esse design system?
1. circle-br (Recomendado)
2. Outro nome (digitar)
```

### Passo 3: Escolher pasta

```
Onde criar o projeto?
1. ~/CODE/design-systems/{nome}/ (Recomendado — padrão do catálogo)
2. Pasta existente (selecionar)
3. Outro local (digitar)
```

Se a pasta já existe, perguntar:
```
A pasta ~/CODE/design-systems/{nome}/ já existe.
1. Usar mesmo (pode sobrescrever design-system/)
2. Criar com sufixo ({nome}-v2)
3. Cancelar
```

### Passo 4: Verificar pré-requisitos

Checar automaticamente (sem perguntar):
- [ ] Playwright instalado? → Se não: `! npm install -D @playwright/test && npx playwright install chromium`
- [ ] Pasta ~/CODE/design-systems/ existe? → Se não: criar

Se algo falhar, explicar e pedir pro usuário rodar o comando via `!`.

### Passo 5: Extrair o DNA

Rodar automaticamente:
```bash
node ~/aios-core/squads/design/scripts/dissect-artifact.cjs {url} \
  --name {nome} --clone --mobile --timeout 60 \
  --output {pasta}/design-system
```

Mostrar resumo:
```
✅ Extração completa!

📊 Resumo:
  Cores:          {N} únicas
  Tipografia:     {N} variantes
  Animações:      {N} @keyframes
  CSS Variables:  {N}
  Componentes:    {N} tipos ({N} instâncias)
  Imagens:        {N} baixadas
  Fontes:         {N} capturadas
  SVGs:           {N} extraídos
```

### Passo 6: Preview e aprovação

Servir o clone localmente:
```bash
cd {pasta}/design-system && python3 -m http.server 8888 --bind 0.0.0.0 &
```

Perguntar:
```
O clone está rodando em http://localhost:8888/clean-structure.html

Abre no browser e compara com o original ({url}).

Como ficou?
1. Ficou ótimo — prosseguir para o scaffold
2. Precisa melhorar — me diz o que está diferente
3. Está ruim — tentar extrair de novo com mais tempo
```

Se "Precisa melhorar": perguntar o que está diferente e tentar ajustar (re-rodar dissect com timeout maior, ajustar CSS, etc.)

### Passo 7: Análise de animações

Ler o `extracted-css.json` e verificar se há animações complexas:

```javascript
// Se animations.length > 5 ou tem scroll/3d patterns
```

Se sim, mostrar:
```
🎬 O site tem {N} animações. Algumas são complexas:
  - gradientFlow (gradient animado)
  - infinitescroll (marquee de logos)
  - shine (brilho no botão)

Para replicar com qualidade premium, consulte estas referências:
  → ui.aceternity.com — micro-interactions, cards 3D, spotlight
  → magicui.design — componentes animados React
  → animista.net — gerador visual de @keyframes CSS

Quer que eu abra alguma dessas? Ou prosseguir para o scaffold?
```

### Passo 8: Handoff para Design Squad

```
Extracao completa! Agora vou delegar para os especialistas.

Qual modo quer usar?
1. Premium (Recomendado) — @brad-frost tokeniza + builda componentes production-ready
   → Token system em camadas, 6 variantes, hover/loading/focus, testes, a11y
   → Equivalente ao circle-ds (qualidade profissional)

2. Rapido (Bootstrap) — generate-components.mjs gera esqueleto basico
   → 3 variantes genericas, sem testes, sem a11y
   → Bom pra prototipo rapido, refina depois com @brad-frost

3. Parar aqui — so queria a extracao
```

**Se Premium (1):**

```
Delegando para o Design Squad...

Passo 8a: @brad-frost *setup
  → Cria estrutura do DS em {pasta}/

Passo 8b: @brad-frost *tokenize
  → Converte tokens.yaml raw → sistema --ds-* em camadas

Passo 8c: @brad-frost *build (para cada componente)
  → Componentes production-ready com hover, loading, a11y

Passo 8d: @storybook-expert
  → Stories CSF3 type-safe com interaction testing

Passo 8e: /design-system-catalog add {pasta}
  → Registra no catalogo global
```

Cada passo pausa para aprovacao do usuario antes de continuar.

**Se Rapido (2):**

Rodar em sequencia:
1. `/design-system-scaffold` — scaffold Next.js + Storybook
2. `/design-system-storybook` — bootstrap rapido com generate-components.mjs
3. `/design-system-catalog add {pasta}` — registra no catalogo

---

## Ferramentas Disponíveis

| Ferramenta | Onde vive | O que faz |
|---|---|---|
| `dissect-artifact.cjs` | `squads/design/scripts/` | Motor Playwright: extrai CSS, DOM, assets, HTML reconstrutível |
| `design-system-extractor` | `skills/design-system-extractor/` | Geração de token templates TypeScript |
| `smart-browser-playwright` | `tools/smart-browser-playwright/` | Automação de browser para scraping |
| `/design` squad | `squads/design/` | Brad Frost (tokens), Dan Mall (elevação), Dave Malouf (a11y) |
| `dembrandt` | CLI global (npm) | Extração rápida de tokens (DTCG JSON) |

## Scripts CLI (lib/)

### Extração

```bash
# Clone completo (RECOMENDADO — usa por padrão)
node ~/aios-core/skills/design-system-forge/lib/dissect.mjs <url> --name <name> --clone --mobile

# Só tokens (rápido, sem assets)
node ~/aios-core/skills/design-system-forge/lib/dissect.mjs <url> --name <name>

# Estados interativos (:hover, :focus, :active)
node ~/aios-core/skills/design-system-forge/lib/extract-states.mjs <url> --name <name>

# Dark mode
node ~/aios-core/skills/design-system-forge/lib/extract-dark-mode.mjs <url> --name <name>
```

### Referências

```bash
node ~/aios-core/skills/design-system-forge/lib/scrape-references.mjs --source awwwards
node ~/aios-core/skills/design-system-forge/lib/scrape-references.mjs --source 21st
node ~/aios-core/skills/design-system-forge/lib/scrape-references.mjs --source <name> --url <url>
```

### Tokens

```bash
# Consolidar tokens de múltiplas fontes
node ~/aios-core/skills/design-system-forge/lib/consolidate-tokens.mjs \
  --dembrandt ./dembrandt-output.json \
  --dissect ./design-system/tokens.yaml

# Gerar tailwind.config.ts + tokens.css
node ~/aios-core/skills/design-system-forge/lib/generate-tailwind.mjs \
  --input ./design-system/tokens/consolidated.yaml
```

### QA

```bash
# Visual diff: original vs redesign
node ~/aios-core/skills/design-system-forge/lib/visual-diff.mjs \
  --original ./design-system/screenshots/original.png \
  --redesign ./screenshots/redesign.png
```

---

## Fontes de Animação (OBRIGATÓRIO consultar quando há animações complexas)

| Tipo | Fonte | URL | Quando usar |
|------|-------|-----|-------------|
| Scroll animations | Framer Motion | npmjs.com/package/framer-motion | Elementos que aparecem/transformam ao scrollar |
| Scroll animations | GSAP | gsap.com | ScrollTrigger, timelines complexas, performance |
| Partículas/3D | tsparticles | particles.js.org | Background com pontos, confetti, conexões |
| Partículas/3D | Three.js | threejs.org | WebGL, cenas 3D, shaders |
| Gradientes animados | CSS puro | — | gradientFlow, background-position animate |
| Gradientes animados | Grainy Gradients | grainy-gradients.vercel.app | Texturas noise + gradiente |
| Micro-interactions | Aceternity UI | ui.aceternity.com | Hover effects, cards 3D, spotlight |
| Micro-interactions | Magic UI | magicui.design | Componentes animados React |
| Micro-interactions | 21st.dev | 21st.dev | Componentes premium copiáveis |
| Lottie animations | LottieFiles | lottiefiles.com | Ícones animados, ilustrações, loading |
| CSS animations | Awwwards Collections | awwwards.com/awwwards/collections/css-js-animations | Catálogo por categoria |
| CSS animations | Animista | animista.net | Gerador visual de @keyframes |
| Blob/Morphing | Blobmaker | blobmaker.app | Formas orgânicas SVG |
| Blob/Morphing | Haikei | haikei.app | Backgrounds SVG (waves, blobs, gradients) |
| Marquee/Scroll | React Fast Marquee | npmjs.com/package/react-fast-marquee | Scroll infinito de logos |

**Regra:** @keyframes simples → CSS puro. Interação com scroll/mouse/3D → buscar nas bibliotecas acima.

---

## Pipeline Completo (Orquestrado)

```
FASE 1: EXTRACAO (esta skill)
  /design-system-forge
    → Pergunta URL, nome, pasta
    → Extrai DNA (dissect --clone)
    → Preview + aprovacao
    → Analise de animacoes

FASE 2: SETUP (design squad + scaffold skill)
  @brad-frost *setup
    → Cria estrutura do DS (token system --ds-*, diretórios)
    → Configura CSS Modules + Storybook
  /design-system-scaffold (complementa)
    → Scaffold Next.js + Tailwind se necessario
    → Copia assets, gera tailwind.config.ts

FASE 3: TOKENIZACAO (design squad)
  @brad-frost *tokenize
    → Converte tokens.yaml raw → sistema em camadas (Base → Semantic → Component)
    → Gera exports: DTCG JSON, CSS custom properties (--ds-*), Tailwind config
    → Zero hardcoded values — tudo via var(--ds-*)
    → Cobertura target: >95%

FASE 4: COMPONENTES (design squad)
  @brad-frost *build (para cada componente detectado)
    → Gera componente production-ready com:
      - 4-6 variantes reais (primary, secondary, ghost, dark, danger, outline)
      - States: hover, disabled, loading (com spinner), focus-visible
      - Props avancadas: leftIcon, rightIcon, loading, iconOnly
      - CSS Module com var(--ds-*) — zero hardcoded
      - ARIA labels, contrast ratio ≥ 4.5:1
      - Unit tests (>80% coverage)
    → Modo YOLO: paralleliza via Agent tool

FASE 5: STORIES (design squad)
  @storybook-expert
    → CSF3 type-safe com `satisfies Meta<typeof Component>`
    → Interaction testing via play functions
    → Visual regression ready (Chromatic)
    → Autodocs para documentacao zero-effort

FASE 6: CATALOGO
  /design-system-catalog add {path}
    → Registra no CATALOG.md global
    → Calcula score de completude
```

### Fallback Mode

Se o usuario preferir velocidade sobre qualidade, ou se o design squad nao estiver disponivel:

```
/design-system-storybook (bootstrap rapido)
  → generate-components.mjs gera esqueleto basico
  → 3 variantes genericas por componente
  → Sem testes, sem a11y, sem interaction testing
  → Util como ponto de partida para refinar com @brad-frost depois
```

---

## Output da Extração

```
{pasta}/design-system/
├── clean-structure.html     # HTML reconstrutível (servir local pra preview)
├── source.html              # HTML original bruto
├── section-map.json         # Mapa de seções top-level
├── asset-map.json           # URL remota → caminho local
├── tokens.yaml              # Cores, tipografia, espaçamentos
├── extracted-css.json       # Animações, gradientes, shadows, layouts
├── components.json          # Componentes detectados com amostras
├── dom-tree.json            # DOM com computed styles
├── manifest.json            # Metadados da extração
├── screenshots/
│   ├── screenshot-desktop.png
│   └── screenshot-mobile.png
├── stylesheets/             # Todos os CSS (CDN + embedded)
├── images/                  # Todas as imagens
├── fonts/                   # Fontes (.woff2)
└── svgs/                    # SVGs extraídos
```
