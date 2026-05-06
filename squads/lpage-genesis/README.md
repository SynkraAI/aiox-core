# LPage Genesis - Landing Page Production Squad

**Version:** 1.0.0 | **Command:** `/lpage` | **Created:** 2026-02-10 | **License:** MIT

Squad de producao de landing pages com design system AI-driven. Pipeline completo: visual concept > design system > templates > producao > deploy.

---

## Quick Start

```bash
# Pre-requisito: Copy Squad instalado em ../copy/
# Pre-requisito: AIOS v4.0.0+

# Pipeline completo (brief > design > build > QA > deploy)
/lpage-create

# Fast track (template existente > assemble > deploy)
/lpage-quick

# Setup design system (one-time)
/lpage-setup-design

# Criar novo template reutilizavel
/lpage-new-template

# Visual QA loop
/lpage-qa
```

---

## Arquitetura (8 Agentes em 5 Tiers)

```
TIER 0: ORQUESTRACAO
  @genesis-director (recebe briefs, coordena pipeline)

TIER 1: FUNDACAO
  @design-architect (design system, tokens, components)
  @visual-crafter (conceitos visuais, referencias, moodboards)

TIER 2: PRODUCAO
  @page-assembler (builder core, monta LPs)
  @template-engineer (fabrica de templates reutilizaveis)
  @animation-designer (Framer Motion, micro-interacoes)

TIER 3: QUALIDADE
  @visual-reviewer (Playwright screenshots, avaliacao visual)

TIER 4: ENTREGA
  @deploy-pilot (Netlify MCP deploy, Lighthouse audit)
```

### Fluxo Hierarquico

```
@genesis-director
  |-- recebe brief (do usuario ou @growth-cmo)
  |-- coordena pipeline completo
  |-- valida quality gates
  v
@design-architect --> cria/mantem design system (tokens, Tailwind, CVA)
@visual-crafter ----> gera conceitos visuais (Stitch, Nano Banana)
@page-assembler ----> monta LP (React/HTML responsivo)
@template-engineer -> cria templates reutilizaveis
@animation-designer > animacoes Framer Motion
@visual-reviewer ---> screenshots + avaliacao visual (Playwright MCP)
@deploy-pilot ------> deploy Netlify MCP + Lighthouse audit
```

---

## Integracoes

```
[Marketing Growth Squad] --> brief --> @genesis-director
[Copy Squad] -----------> copy --> @page-assembler
[Playwright MCP] <------> @visual-reviewer (screenshots + QA)
[Netlify MCP] <---------> @deploy-pilot (deploy + rollback)
[Google Stitch] --------> @visual-crafter (UI concepts, 350/mes free)
[Nano Banana Pro] ------> @visual-crafter (AI image gen)
[Lighthouse CLI] -------> @deploy-pilot (performance scores)
```

---

## Comandos Disponiveis

### Producao

| Comando           | Descricao                                               |
| ----------------- | ------------------------------------------------------- |
| `/lpage-create`   | Pipeline completo: brief > design > build > QA > deploy |
| `/lpage-quick`    | Fast track com template existente                       |
| `/lpage-assemble` | Montar LP com copy + template + tokens                  |

### Design System

| Comando               | Descricao                                  |
| --------------------- | ------------------------------------------ |
| `/lpage-setup-design` | Setup completo de design system (one-time) |
| `/lpage-tokens`       | Criar/atualizar design tokens              |
| `/lpage-component`    | Criar novo componente Atomic Design        |
| `/lpage-concept`      | Gerar conceito visual via AI               |

### Templates

| Comando                 | Descricao                        |
| ----------------------- | -------------------------------- |
| `/lpage-new-template`   | Criar novo template reutilizavel |
| `/lpage-list-templates` | Listar templates disponiveis     |

### Animacoes

| Comando                 | Descricao                            |
| ----------------------- | ------------------------------------ |
| `/lpage-animation`      | Criar set de animacoes Framer Motion |
| `/lpage-motion-presets` | Listar presets de animacao           |

### Qualidade

| Comando               | Descricao                                      |
| --------------------- | ---------------------------------------------- |
| `/lpage-qa`           | Visual QA loop (screenshot > avaliar > iterar) |
| `/lpage-audit-design` | Auditoria de consistencia do design            |
| `/lpage-audit-perf`   | Lighthouse + Core Web Vitals                   |

### Deploy

| Comando           | Descricao                   |
| ----------------- | --------------------------- |
| `/lpage-deploy`   | Deploy para Netlify via MCP |
| `/lpage-rollback` | Rollback de deploy          |

---

## Workflows (5)

### 1. Design Genesis Full (PRINCIPAL)

Pipeline completo de criacao de LP.

```
Trigger: /lpage-create "descricao do produto"

1. @genesis-director --> recebe brief, planeja pipeline
2. @visual-crafter ----> gera conceitos visuais + referencias
3. @design-architect --> setup/aplica design system
4. @page-assembler ----> monta LP (copy + tokens + template)
5. @animation-designer > aplica animacoes
6. @visual-reviewer ---> screenshot + avaliacao visual
7. [Quality Gate] -----> checklists (6 validacoes)
8. [Human Approval] ---> preview + Go/No-Go
9. @deploy-pilot ------> Netlify deploy + Lighthouse audit
```

Tempo estimado: 15-25 min

### 2. Quick LP

Fast track com template existente.

```
1. @genesis-director --> recebe brief + seleciona template
2. @page-assembler ----> monta LP rapidamente
3. @deploy-pilot ------> deploy direto
```

Tempo estimado: 5-10 min

### 3. Design System Setup

Setup unico do design system completo.

```
1. @design-architect --> cria tokens (cores OKLCH, tipografia, spacing)
2. @design-architect --> gera Tailwind config + CSS variables
3. @visual-crafter ----> extrai referencias visuais
4. @template-engineer -> cria templates base (5 tipos)
```

Tempo estimado: 4-6 horas (one-time)

### 4. Template Creation

Criar novo template reutilizavel.

```
1. @template-engineer -> define estrutura de secoes
2. @design-architect --> aplica design system
3. @animation-designer > adiciona presets de animacao
```

Tempo estimado: 30-60 min

### 5. Visual QA Loop

Ciclo iterativo de qualidade visual.

```
1. @visual-reviewer --> screenshot via Playwright
2. @visual-reviewer --> Claude avalia design quality
3. @page-assembler ---> aplica feedback
4. Repete ate score >= threshold
```

Tempo estimado: 5-15 min

---

## Human-in-the-Loop

O squad NUNCA faz deploy sem aprovacao. Gates obrigatorios:

| Gate                   | Quando             | O que revisar                           |
| ---------------------- | ------------------ | --------------------------------------- |
| design_system_approval | Apos setup inicial | Tokens, cores, tipografia, spacing      |
| landing_page_review    | Antes de deploy    | Responsividade, copy, visual, links     |
| deploy_authorization   | Antes de ir ao ar  | Build, performance, SEO, acessibilidade |

---

## Tech Stack

| Camada     | Tecnologia                     |
| ---------- | ------------------------------ |
| Framework  | React 18+ / TypeScript 5.x     |
| Styling    | Tailwind CSS v4 (OKLCH)        |
| Components | CVA + Radix UI + Framer Motion |
| Build      | Vite 6.x                       |
| Deploy     | Netlify (free tier)            |
| QA Visual  | Playwright MCP                 |
| Design     | Atomic Design (5 niveis)       |
| Tokens     | W3C DTCG spec (YAML)           |

---

## Custos Estimados

| Item                         | Custo Mensal       |
| ---------------------------- | ------------------ |
| Claude (uso intenso)         | R$ 200-800         |
| Google Stitch (350 free/mes) | R$ 0               |
| Nano Banana Pro (Gemini 3)   | R$ 0-150           |
| Netlify (free tier)          | R$ 0               |
| **Total**                    | **R$ 200-950/mes** |

### ROI Comparado

| Alternativa           | Custo Mensal     |
| --------------------- | ---------------- |
| Designer UI/UX Jr.    | R$ 3.000         |
| Dev Frontend Jr.      | R$ 3.500         |
| **Total substituido** | **R$ 6.500/mes** |
| **ROI**               | **7-32x**        |

---

## Estrutura de Arquivos

```
lpage-genesis/
+-- squad.yaml                # Squad manifest
+-- README.md                 # Este arquivo
+-- config/                   # Configuracoes
|   +-- coding-standards.md
|   +-- tech-stack.md
|   +-- source-tree.md
+-- agents/ (8)               # Agentes especializados
+-- tasks/ (15)               # Tasks automatizadas
+-- workflows/ (5)            # Workflows YAML
+-- checklists/ (6)           # Quality gates
+-- templates/ (5)            # Blueprints de LP
+-- data/                     # Knowledge base
+-- scripts/                  # Scripts utilitarios
+-- tools/                    # Custom tools
```

---

**Dependencies:** Copy Squad (../copy/), Marketing Growth Squad (../marketing-growth/)
**Design Blueprint:** ../.designs/lpage-genesis-design.yaml
**Ultima atualizacao:** 2026-02-10
