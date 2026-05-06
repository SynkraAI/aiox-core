# Create Design Tokens

**Task:** `create-design-tokens`
**Agent:** @design-architect
**Type:** Foundation
**Priority:** 2

---

## Description

Criar ou atualizar design tokens a partir de inputs de marca (cores, tipografia, spacing). Output em formato W3C DTCG (YAML) com export para Tailwind, CSS e JSON.

---

## Input

```yaml
brand_name: 'Nome da marca'
colors:
  primary: '#dbbf8a'
  secondary: '#2a3b4c'
  accent: '#e8a87c'
typography:
  display: 'Playfair Display'
  body: 'Inter'
spacing_grid: 4 # base unit in px
```

---

## Process

### 1. Converter para OKLCH

- Converter todas as cores hex para OKLCH color space
- Gerar palette completa (50-950 shades) para cada cor

### 2. Definir Typography Scale

- Modular scale baseada na tipografia escolhida
- Sizes: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72
- Line heights e letter spacing calculados

### 3. Definir Spacing Scale

- Base unit x multipliers
- Scale: base, xs, sm, md, lg, xl, 2xl, 3xl, 4xl

### 4. Definir extras

- Border radius (sm, md, lg, full)
- Box shadows (sm, md, lg, xl)
- Breakpoints (sm: 640, md: 768, lg: 1024, xl: 1280, 2xl: 1536)

### 5. Export

- YAML (source of truth)
- Tailwind theme extension
- CSS custom properties

---

## Output

```
Entregaveis:
1. design-tokens.yaml - W3C DTCG format
2. tailwind-theme-extension.ts - Tailwind config partial
```

---

**Created:** 2026-02-10
**Version:** 1.0
