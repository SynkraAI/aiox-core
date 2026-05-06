# Scan Design System

**Task:** `scan-design-system`
**Agent:** @visual-designer
**Type:** Analysis

---

## Description

Extrair design system completo de URL existente (cores, tipografia, spacing, componentes).

---

## Input

```yaml
url: 'URL do site/pagina para escanear'
```

---

## Process

1. Analisa site/pagina
2. Extrai cores (hex + nome semantico)
3. Extrai tipografia (fontes, pesos, tamanhos)
4. Extrai spacing
5. Identifica componentes visuais
6. Cria design tokens

---

## Output

```
Arquivos gerados/atualizados:
- data/brand/brand-guide.md (cores, fontes, spacing)

Design Tokens extraidos:
- Primary color: #XXXXXX
- Secondary color: #XXXXXX
- Heading font: [fonte]
- Body font: [fonte]
- Spacing base: [Xpx]
```

---

**Created:** 2026-02-05
**Version:** 1.0
