---
name: design-system-extractor
description: Extrai design tokens, componentes e padrões visuais de sites/apps existentes. Captura screenshots via Playwright, analisa CSS computado, mapeia paleta de cores, tipografia, espaçamento e hierarquia de componentes. Gera output estruturado (JSON/YAML) pronto para consumo em projetos frontend.
license: MIT

version: 1.0.0
category: development
tags: [SKILL]
---

# Design System Extractor

Skill executável para engenharia reversa visual de qualquer site ou aplicação web. Captura, analisa e estrutura todos os tokens e padrões de design de um projeto existente — como um raio-X que revela o esqueleto visual por trás de qualquer interface.

## Quando Usar Esta Skill

Esta skill deve ser usada quando:

- Extrair design tokens (cores, tipografia, espaçamento) de um site existente
- Criar um design system a partir de um produto já no ar
- Documentar padrões visuais de um projeto legado sem documentação
- Migrar identidade visual de uma plataforma para outra
- Auditar consistência visual entre páginas de um mesmo produto
- Alimentar a skill `tokenizacao` com tokens extraídos de referência
- Replicar look & feel de um concorrente ou referência visual

**NÃO use para:**

- Criar design system do zero sem referência visual (use `tokenizacao` ou Figma)
- Auditar qualidade de código frontend existente (use `tokenizacao`)
- Gerar componentes React/Angular/Vue prontos (esta skill gera o **catálogo**, não o código)
- Sites que requerem login autenticado sem sessão Playwright configurada
- Apps nativos (iOS/Android) — funciona apenas com interfaces web

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Quais URLs devem ser analisadas? (1 a 5 páginas)** — (páginas diferentes revelam tokens diferentes; a home sozinha raramente cobre tudo)
2. **O foco é tokens, componentes ou ambos?** — (tokens = cores, fontes, espaçamento; componentes = botões, cards, formulários, navegação)
3. **Qual o formato de saída desejado? (JSON, YAML, CSS Custom Properties, Tailwind config)** — (define como o output será consumido pelo projeto destino)
4. **Existe um design system de destino para mapear? (Tailwind, Material, shadcn/ui, customizado)** — (permite gerar tokens já no formato do sistema alvo) (opcional)
5. **Deve gerar screenshots anotados das páginas?** — (útil para documentação visual e validação com stakeholders) (opcional)

---

## Prerequisites

### Obrigatórios

- **Playwright** — para captura de screenshots e extração de CSS computado via browser real
  - O MCP `playwright` deve estar configurado em `.mcp.json`
  - Alternativa: usar `WebFetch` para extração básica sem screenshots
- **Acesso às URLs** — as páginas devem ser acessíveis publicamente ou via sessão Playwright salva

### Recomendados

- **Figma MCP** — para exportar tokens extraídos diretamente para um arquivo Figma
- **Node.js** — para pós-processamento dos tokens (conversão de formatos, deduplicação)

---

## PREMISSA FUNDAMENTAL (CRÍTICO)

**Você tem acesso ao browser via Playwright e às URLs fornecidas.**

- NUNCA peça ao usuário para colar CSS ou screenshots manualmente
- SEMPRE navegue até a URL e extraia os dados programaticamente
- SE o site bloquear automação, informe e sugira alternativa (WebFetch, screenshots manuais)

---

## Processo de Execução

### Phase 1 — Captura Visual

Objetivo: obter screenshots e HTML/CSS das páginas-alvo.

**Passos:**

1. Navegar até cada URL via Playwright
2. Capturar screenshot full-page (viewport desktop 1440px e mobile 375px)
3. Aguardar carregamento completo (fonts, imagens, animações idle)
4. Extrair o DOM renderizado e stylesheets computadas
5. Identificar breakpoints responsivos (se houver media queries)

**Output da fase:**
- Screenshots em `.png` para cada página/viewport
- HTML renderizado para análise de estrutura
- Lista de stylesheets externas e inline

### Phase 2 — Extração de Tokens

Objetivo: transformar CSS computado em tokens semânticos organizados.

**2.1 — Cores**

```javascript
// Extrair via getComputedStyle em todos os elementos visíveis
// Categorizar por:
// - Primária, secundária, terciária (por frequência de uso)
// - Backgrounds, textos, bordas, acentos
// - Estados: hover, focus, active, disabled
```

Agrupar cores similares (delta-E < 3) para eliminar variações acidentais.

**2.2 — Tipografia**

| Token | O que extrair |
|-------|---------------|
| font-family | Famílias usadas (primária, secundária, mono) |
| font-size | Escala tipográfica (todos os tamanhos únicos) |
| font-weight | Pesos utilizados |
| line-height | Alturas de linha por contexto |
| letter-spacing | Espaçamento entre caracteres |

Detectar hierarquia: h1-h6, body, caption, label, overline.

**2.3 — Espaçamento**

- Extrair todos os valores de `margin`, `padding`, `gap`
- Identificar escala de espaçamento (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px...)
- Mapear para sistema de tokens (space-1, space-2, space-3...)

**2.4 — Outros Tokens**

| Categoria | Propriedades |
|-----------|-------------|
| Bordas | border-radius, border-width, border-style |
| Sombras | box-shadow (elevações: sm, md, lg, xl) |
| Opacidade | opacity (estados de interação) |
| Transições | transition-duration, transition-timing-function |
| Z-index | Camadas de empilhamento |
| Breakpoints | Media queries detectadas |

**Output da fase:**
- Objeto JSON/YAML com todos os tokens categorizados
- Frequência de uso de cada token (quantas vezes aparece)
- Tokens duplicados ou conflitantes sinalizados

### Phase 3 — Mapeamento de Componentes

Objetivo: identificar e catalogar componentes reutilizáveis na interface.

**Componentes a detectar:**

| Componente | Sinais de detecção |
|------------|-------------------|
| Botões | `<button>`, `<a>` com estilo de botão, role="button" |
| Cards | Containers com sombra + border-radius + conteúdo misto |
| Formulários | `<form>`, inputs, selects, textareas agrupados |
| Navegação | `<nav>`, header com links, menu mobile |
| Modais | Overlays com z-index alto, role="dialog" |
| Badges/Tags | Elementos pequenos com background colorido e border-radius |
| Avatares | Imagens circulares ou com aspect-ratio 1:1 |
| Tabelas | `<table>` ou grids com dados tabulares |
| Listas | Repetições de elementos com mesma estrutura |
| Footer | `<footer>` ou último bloco semântico da página |

**Para cada componente detectado, registrar:**
- Nome sugerido (ex: `PrimaryButton`, `ProductCard`)
- Variantes encontradas (tamanhos, cores, estados)
- Tokens utilizados (quais cores, fontes, espaçamentos)
- Screenshot recortado do componente
- HTML simplificado de referência

**Output da fase:**
- Catálogo de componentes com screenshots
- Mapa de dependência entre componentes e tokens

### Phase 4 — Geração de Output

Objetivo: entregar os tokens e o catálogo no formato solicitado pelo usuário.

**Formatos de saída disponíveis:**

#### JSON (W3C DTCG)

```json
{
  "color": {
    "primary": {
      "$value": "#2563EB",
      "$type": "color",
      "$description": "Cor primária — botões, links, CTAs"
    },
    "background": {
      "default": { "$value": "#FFFFFF", "$type": "color" },
      "subtle": { "$value": "#F8FAFC", "$type": "color" }
    }
  },
  "typography": {
    "heading-1": {
      "$value": {
        "fontFamily": "Inter",
        "fontSize": "2.25rem",
        "fontWeight": 700,
        "lineHeight": 1.2
      },
      "$type": "typography"
    }
  },
  "spacing": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" },
    "lg": { "$value": "24px", "$type": "dimension" },
    "xl": { "$value": "32px", "$type": "dimension" }
  }
}
```

#### Tailwind Config

```javascript
// tailwind.config.js (parcial)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        background: { DEFAULT: '#FFFFFF', subtle: '#F8FAFC' }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      spacing: {
        xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px'
      }
    }
  }
}
```

#### CSS Custom Properties

```css
:root {
  --color-primary: #2563EB;
  --color-bg-default: #FFFFFF;
  --color-bg-subtle: #F8FAFC;
  --font-sans: 'Inter', sans-serif;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}
```

**Estrutura do output gerado:**

```
output/
├── tokens/
│   ├── tokens.json            # W3C DTCG format
│   ├── tokens.yaml            # YAML alternativo
│   ├── tailwind.config.js     # Tailwind config parcial
│   └── variables.css          # CSS Custom Properties
├── components/
│   ├── catalog.md             # Catálogo visual de componentes
│   └── screenshots/           # Screenshots recortados por componente
├── screenshots/
│   ├── {page}-desktop.png     # Screenshots full-page
│   └── {page}-mobile.png
└── REPORT.md                  # Relatório completo da extração
```

---

## Regras de Qualidade

### Validação de Tokens

- Cores DEVEM estar em formato hexadecimal (#RRGGBB) — converter de rgb/hsl se necessário
- Tamanhos de fonte DEVEM usar rem (converter de px dividindo por 16)
- Espaçamentos DEVEM seguir escala consistente (identificar e reportar outliers)
- Tokens duplicados (valores iguais com nomes diferentes) DEVEM ser sinalizados

### Validação de Componentes

- Cada componente DEVE ter pelo menos 1 screenshot de referência
- Variantes DEVEM ser documentadas (ex: botão primário vs secundário vs ghost)
- Componentes sem tokens associados DEVEM ser sinalizados como potenciais inconsistências

### Anti-Alucinação

- NUNCA inventar tokens que não existam no CSS computado
- NUNCA assumir nomes semânticos sem evidência (ex: não chamar de "primary" sem verificar frequência)
- SE uma cor aparecer 1 vez em 5 páginas, provavelmente não é token — é exceção
- SEMPRE incluir evidência: `Encontrado em: {página}, {elemento}, {propriedade}`

---

## Integração com Outras Skills

| Skill | Como integra |
|-------|-------------|
| `tokenizacao` | Recebe os tokens extraídos para auditoria de conformidade |
| `lp-generator` | Usa tokens extraídos para gerar landing pages no estilo do site original |
| `smart-browser-playwright` | Compartilha sessão Playwright para navegação autenticada |
| `image-creator` | Pode gerar previews visuais do design system extraído |

---

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|---------------|---------|
| Playwright não carrega a página | Site bloqueia automação | Adicionar user-agent realista, usar stealth mode |
| Cores extraídas diferem do visual | CSS usa `color-scheme` ou `prefers-color-scheme` | Forçar light/dark mode via Playwright emulation |
| Fontes não detectadas | Web fonts carregam async | Aumentar timeout de espera para font loading |
| Muitos tokens duplicados | Site usa utilidades CSS (Tailwind, Bootstrap) | Agrupar por delta-E para cores, threshold para spacing |
| Componentes não detectados | SPA com lazy loading | Scrollar a página inteira antes de capturar DOM |
