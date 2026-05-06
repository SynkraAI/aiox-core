# Extract Design Reference

**Task:** `extract-design-reference`
**Agent:** @visual-crafter
**Type:** Foundation
**Priority:** 5

---

## Description

Extrair design reference completa de URL existente usando Playwright MCP: screenshot full page, paleta de cores, tipografia, spacing, layout structure.

---

## Input

```yaml
url: 'https://example.com'
viewports: [375, 768, 1024, 1440]
extract: [colors, typography, spacing, layout, images]
```

---

## Process

### 1. Screenshot Multi-Viewport

- Playwright MCP: screenshot full page em cada viewport
- Capturar estados: default, hover (se possivel), scroll

### 2. Analise de Cores

- Extrair todas as cores usadas
- Converter para OKLCH
- Identificar primary, secondary, accent, background, text

### 3. Analise de Tipografia

- Identificar font families (display, body)
- Font sizes usados
- Line heights e letter spacing

### 4. Analise de Layout

- Identificar grid system
- Spacing patterns
- Section structure

### 5. Compilar Report

---

## Output

```
Entregaveis:
1. reference-report.md - Analise completa
2. screenshots/ - Screenshots multi-viewport
3. extracted-tokens.yaml - Tokens extraidos
```

---

**Created:** 2026-02-10
**Version:** 1.0
