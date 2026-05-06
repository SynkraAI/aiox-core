# Create Launch Funnel

**Task:** `create-launch-funnel`
**Agent:** Full squad (orquestrado por @growth-cmo)
**Type:** Creation

---

## Description

Criar funil de lancamento completo: landing page + 19 emails + assets visuais + plano de automacao. Integra com Copy Squad para todo copywriting.

---

## Input

```yaml
produto: 'Nome do produto'
preco: 'R$ X'
data_abertura: 'YYYY-MM-DD'
data_fechamento: 'YYYY-MM-DD'
avatar: 'Descricao do publico-alvo'
tipo: 'perpetuo | semente | meteorico'
num_leads_estimados: 1000
```

---

## Process

### Fase 1 - Diagnostico

1. @data-analyst analisa mercado e ICP
2. @growth-cmo define estrategia de lancamento
3. Output: estrategia + timeline

### Fase 2 - Copy (via Copy Squad)

@lead-copywriter orquestra: 4. Landing page principal (copy completa) 5. Pre-launch emails (7 emails - antecipacao) 6. Carrinho aberto emails (5 emails - conversao) 7. Ultimo dia emails (3 emails - urgencia) 8. Recuperacao emails (4 emails - pos-fechamento)
Output: 19 emails + copy LP

### Fase 3 - Assets

9. @landing-page-architect estrutura LP + thank-you page
10. @visual-designer cria assets visuais
    Output: HTML/CSS + specs visuais

### Fase 4 - Validacao

11. @conversion-optimizer otimiza funil
12. Quality Gates: conversion-elements + mobile-first + seo-basics + legal-lgpd
13. @growth-cmo review final

### Fase 5 - Deploy

14. Human Approval Gate
15. @distribution-manager configura sequencia
    Output: funil documentado + fluxo de automacao

---

## Output

```
Entregaveis:
1. LP principal (HTML/CSS)
2. Thank-you page (HTML/CSS)
3. 7 emails pre-launch (subject + body)
4. 5 emails carrinho aberto
5. 3 emails ultimo dia
6. 4 emails recuperacao
7. Assets visuais specs
8. Fluxo de automacao (diagrama)
9. Timeline do lancamento
10. A/B test plan

Total: LP + 19 emails + thank-you + assets
Tempo estimado: 90-120 min
```

---

**Created:** 2026-02-05
**Version:** 1.0
