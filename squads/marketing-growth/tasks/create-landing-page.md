# Create Landing Page

**Task:** `create-landing-page`
**Agent:** @growth-cmo + @lead-copywriter + @landing-page-architect + @visual-designer + @conversion-optimizer
**Type:** Creation
**Priority:** 1 (workflow principal do squad)

---

## Description

Criar landing page completa (long-form) com copy de elite, design responsivo e codigo HTML/CSS pronto para deploy. Integra com Copy Squad para copywriting via Tier System.

---

## Input

```yaml
produto: 'Nome do produto/servico'
preco: 'R$ 497'
avatar: 'Descricao do publico-alvo'
objetivo: 'venda | captura | webinar | evento'
awareness_level: 'unaware | problem | solution | product | most'
sophistication: 'stage-1 | stage-2 | stage-3 | stage-4 | stage-5'
referencia_url: 'URL de referencia visual (opcional)'
```

---

## Process

### 1. Briefing Estrategico (@growth-cmo)

- Define objetivo, ICP, posicionamento
- Identifica diferencial competitivo
- Output: briefing estrategico completo

### 2. Diagnostico Copy (@lead-copywriter -> Copy Squad)

- Bridge para @copy-chief
- @eugene-schwartz analisa awareness + sophistication
- Seleciona copywriter ideal do Tier System
- Output: diagnostico + copywriter selecionado

### 3. Criacao de Copy (Copy Squad)

- Copywriter selecionado executa
- Cria copy completa de todas secoes:
  - Hero (headline + subheadline)
  - Problem section
  - Solution/Discovery
  - How It Works (3-5 steps)
  - Benefits (25-50 bullets)
  - Social Proof
  - Offer Stack
  - Guarantee
  - FAQ (6-10 perguntas)
  - Final CTA
- Output: copy-completa.md

### 4. Wireframe (@landing-page-architect)

- Estrutura PRD da pagina
- Define secoes, hierarquia, layout
- Output: wireframe.md

### 5. Design System (@visual-designer)

- Cria/aplica design tokens
- Define cores, fontes, spacing
- Output: design-tokens aplicados

### 6. Codigo HTML/CSS (@landing-page-architect)

- Gera HTML/CSS responsivo (mobile-first)
- Self-contained (CSS inline)
- Output: index.html

### 7. Otimizacao CRO (@conversion-optimizer)

- Aplica framework 7 pontos
- Valida checklists: conversion-elements + mobile-first + seo-basics
- Sugere A/B tests
- Output: pagina otimizada + ab-test-plan.md

### 8. Quality Gate

- Checklists: conversion-elements, mobile-first, seo-basics, accessibility-wcag
- Score minimo: 85%

### 9. Human Approval Gate

- Preview completo ao usuario
- Go/No-Go

---

## Output

```
Entregaveis:
1. wireframe.md - Estrutura da pagina
2. copy-completa.md - Copy integrada
3. index.html - HTML/CSS responsivo self-contained
4. prd.md - Documentacao
5. ab-test-plan.md - Plano de testes A/B

Metrics:
- Word Count: X
- Secoes: 10
- Awareness Level: X
- Sophistication: Stage X
- Copywriter usado: @[nome]
- Mobile responsive: Sim
- WCAG AA: Sim
```

---

**Created:** 2026-02-05
**Version:** 1.0
