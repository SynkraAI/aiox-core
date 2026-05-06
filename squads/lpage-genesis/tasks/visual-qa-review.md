# Visual QA Review

**Task:** `visual-qa-review`
**Agent:** @visual-reviewer
**Type:** Quality
**Priority:** 1

---

## Description

Review visual completo via Playwright MCP. Screenshots em multiplos viewports, avaliacao por Claude (composicao, hierarquia, cores, spacing), feedback actionable e iteracao ate aprovacao.

---

## Input

```yaml
page_url_or_html: 'URL ou path do HTML da LP'
design_tokens: 'path para design-tokens.yaml'
quality_threshold: 85 # score minimo para aprovacao
max_iterations: 3
```

---

## Process

### 1. Screenshots (@visual-reviewer)

- Playwright MCP: full page screenshot em 5 viewports
- 375px, 393px, 820px, 1440px, 1920px
- Capturar acima e abaixo da dobra

### 2. Avaliacao Visual (@visual-reviewer)

- Claude analisa cada screenshot:
  - Visual hierarchy (20%)
  - Color consistency com tokens (15%)
  - Typography scale (15%)
  - Spacing rhythm (15%)
  - Responsividade (20%)
  - Acessibilidade visual (15%)
- Score: 0-100

### 3. Decision

- Score >= threshold: APROVADO
- Score < threshold: gerar feedback detalhado

### 4. Feedback Loop (se reprovado)

- Feedback actionable para @page-assembler
- @page-assembler aplica correcoes
- Nova iteracao (volta ao passo 1)
- Max 3 iteracoes

### 5. Escalonamento

- Se 3 iteracoes sem aprovacao: escala para humano

---

## Output

```
Entregaveis:
1. screenshots/ - Screenshots de todos os viewports
2. qa-report.md - Score + feedback detalhado
3. pass_fail: true/false
```

---

**Created:** 2026-02-10
**Version:** 1.0
