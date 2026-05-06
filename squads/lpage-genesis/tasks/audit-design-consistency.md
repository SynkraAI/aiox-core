# Audit Design Consistency

**Task:** `audit-design-consistency`
**Agent:** @visual-reviewer
**Type:** Quality
**Priority:** 2

---

## Description

Auditar consistencia do design da LP contra o design system. Detectar hardcoded values, violacoes de tokens, inconsistencias visuais.

---

## Input

```yaml
page_html: 'path para HTML/React da LP'
design_tokens: 'path para design-tokens.yaml'
```

---

## Process

### 1. Parse HTML/React

- Extrair todas as cores, fonts, spacing usados
- Identificar inline styles
- Identificar classes Tailwind

### 2. Comparar com Tokens

- Cada cor usada existe nos tokens?
- Cada font size esta na scale?
- Cada spacing esta na grid?

### 3. Detectar Violacoes

- Hardcoded hex colors
- Magic number spacing
- Non-token font sizes
- Inline styles
- !important usage

### 4. Gerar Report

---

## Output

```
Entregaveis:
1. consistency-report.md - Relatorio completo
2. violations-list.md - Lista de violacoes com localizacao
3. suggestions.md - Sugestoes de correcao
```

---

**Created:** 2026-02-10
**Version:** 1.0
