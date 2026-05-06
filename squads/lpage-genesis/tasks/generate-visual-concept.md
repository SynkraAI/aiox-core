# Generate Visual Concept

**Task:** `generate-visual-concept`
**Agent:** @visual-crafter
**Type:** Foundation
**Priority:** 4

---

## Description

Gerar conceitos visuais usando AI (Google Stitch, Nano Banana Pro) e extrair referencias de URLs existentes via Playwright MCP. Output: moodboard com opcoes de direcao visual.

---

## Input

```yaml
brief: 'Descricao do projeto e publico-alvo'
brand_tokens: 'path para design-tokens.yaml (se existir)'
reference_urls: ['url1', 'url2', 'url3']
style_direction: 'minimal | bold | elegant | playful | corporate'
```

---

## Process

### 1. Extrair Referencias (@visual-crafter)

- Screenshot de cada URL via Playwright MCP
- Analisar: paleta, tipografia, layout, estilo
- Identificar patterns comuns

### 2. Gerar Conceitos (@visual-crafter)

- Google Stitch: gerar 2-3 conceitos UI
- Nano Banana Pro: gerar hero images, backgrounds
- Variar direcoes visuais

### 3. Compilar Moodboard

- Agrupar por direcao visual
- Incluir color palette extraida
- Layout suggestions
- Typography pairings

---

## Output

```
Entregaveis:
1. moodboard.md - Compilacao de referencias + conceitos
2. extracted-palette.yaml - Paleta extraida das referencias
3. concept-images/ - Imagens geradas via AI
4. layout-suggestions.md - Sugestoes de layout
```

---

**Created:** 2026-02-10
**Version:** 1.0
