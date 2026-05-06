# Setup Design System

**Task:** `setup-design-system`
**Agent:** @design-architect
**Type:** Foundation (one-time)
**Priority:** 1

---

## Description

Setup completo do design system: design tokens YAML, Tailwind config, CSS variables e component library base. Executar uma vez por projeto/marca.

---

## Input

```yaml
brand_tokens_yaml: 'path para tokens existentes (opcional)'
reference_urls: ['url1', 'url2'] # Sites de referencia visual
tailwind_version: 'v4'
brand_name: 'Nome da marca'
primary_color: 'cor principal (hex ou oklch)'
```

---

## Process

### 1. Analise de Referencias (@visual-crafter assist)

- Extrair paleta, tipografia e spacing de URLs referencia
- Screenshot via Playwright MCP
- Output: analise visual das referencias

### 2. Criacao de Design Tokens (@design-architect)

- Criar design-tokens.yaml (W3C DTCG spec)
- Cores em OKLCH color space
- Tipografia: display + body + scale completo
- Spacing: base 4px + scale completo
- Radius, shadows, borders
- Output: design-tokens.yaml

### 3. Tailwind Config (@design-architect)

- Gerar tailwind.config.ts a partir dos tokens
- Extend theme com todas as cores, fonts, spacing
- Output: tailwind.config.ts

### 4. CSS Variables (@design-architect)

- Gerar CSS custom properties para temas
- Dark mode ready
- Output: variables.css

### 5. Component Library Base (@design-architect)

- Criar componentes atomicos base (Button, Input, Heading, Text, Badge)
- CVA variants para cada componente
- Radix primitives onde aplicavel
- Output: src/components/atoms/

### 6. Quality Gate

- Checklist: design-quality
- Zero hardcoded values
- [Human Approval: design_system_approval]

---

## Output

```
Entregaveis:
1. design-tokens.yaml - Source of truth
2. tailwind.config.ts - Tailwind theme extension
3. variables.css - CSS custom properties
4. src/components/atoms/ - Base component library
5. design-system-report.md - Setup documentation
```

---

**Created:** 2026-02-10
**Version:** 1.0
