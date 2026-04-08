---
name: design-system-catalog
description: Manages a global catalog of all design systems created by the forge pipeline
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
version: "1.0.0"
category: design
requires: aios

tags: [SKILL]
---

# Design System Catalog

Mantém um catálogo indexado de todos os design systems em `~/CODE/design-systems/`.

---

## Commands

### `/design-system-catalog list`

Mostra todos os design systems catalogados:

```
# Design Systems (3 total)

| # | Nome       | URL Original    | Status      | Componentes | Score | Path                              |
|---|------------|-----------------|-------------|-------------|-------|-----------------------------------|
| 1 | circle-br  | circle.so/br    | Complete    | 14/14       | 100%  | ~/CODE/design-systems/circle-br/  |
| 2 | awwwards   | awwwards.com    | In Progress | 8/12        | 67%   | ~/CODE/design-systems/awwwards/   |
| 3 | linear     | linear.app      | Extracted   | 0/10        | 0%    | ~/CODE/design-systems/linear/     |
```

### `/design-system-catalog add {path}`

Adiciona um design system ao catálogo. Detecta automaticamente:
- Nome (do diretório)
- URL original (do `design-system/manifest.json` → `source`)
- Contagem de componentes (do `design-system/components.json`)
- Score de completude (componentes gerados vs detectados)
- Status (baseado nos artefatos existentes)

### `/design-system-catalog status {nome}`

Mostra detalhes de um DS específico:

```
Design System: circle-br
  URL:         https://circle.so/br
  Path:        ~/CODE/design-systems/circle-br/
  Status:      Complete
  Created:     2026-03-27

  Extraction:
    Colors:      20 tokens
    Typography:  4 variants
    Animations:  8 keyframes
    Components:  14 detected

  Storybook:
    Atoms:       5 (Button, Badge, Input, Avatar, Icon)
    Molecules:   4 (Card, NavItem, FormField, Testimonial)
    Organisms:   5 (Hero, Header, Footer, FeatureSection, Pricing)
    Stories:     14 files
    Docs (MDX):  14 pages

  Score: 14/14 (100%)
```

### `/design-system-catalog remove {nome}`

Remove uma entrada do catálogo (não deleta os arquivos).

### `/design-system-catalog scan`

Escaneia `~/CODE/design-systems/` e adiciona automaticamente qualquer DS não catalogado.

---

## Catalog Format

O catálogo fica em `~/CODE/design-systems/CATALOG.md`:

```markdown
# Design System Catalog

> Catálogo global de design systems. Gerado por `/design-system-catalog`.
> Última atualização: {data}

| # | Nome | URL Original | Status | Componentes | Score | Path |
|---|------|-------------|--------|-------------|-------|------|
| 1 | {nome} | {url} | {status} | {gerados}/{detectados} | {%} | {path} |

## Status Legend
- **Extracted** — dados extraídos, sem scaffold
- **Scaffolded** — projeto criado, sem componentes
- **In Progress** — componentes sendo gerados
- **Complete** — todos os componentes gerados e validados
```

---

## Auto-detection

Ao rodar `scan`, detecta o status de cada DS em `~/CODE/design-systems/`:

| Artefato encontrado | Status atribuído |
|---|---|
| Apenas `design-system/` | Extracted |
| `design-system/` + `package.json` + `.storybook/` | Scaffolded |
| Storybook + `src/components/atoms/` | In Progress |
| Storybook + componentes gerados >= componentes detectados | Complete |

---

## Scripts CLI

```bash
# Adicionar DS ao catálogo
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs add ~/CODE/design-systems/circle-br/

# Listar catálogo
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs list

# Status de um DS
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs status circle-br

# Scan automático
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs scan

# Remover entrada
node ~/aios-core/skills/design-system-catalog/lib/catalog-manager.mjs remove circle-br
```

---

## Pipeline Completo (4 skills)

```
/design-system-forge           <- Extrai DNA do site
/design-system-scaffold        <- Cria projeto Next.js + Storybook
/design-system-storybook       <- Gera componentes + stories
/design-system-catalog         <- VOCE ESTA AQUI
```
