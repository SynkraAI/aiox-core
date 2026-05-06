# Generate Campaign Report

**Task:** `generate-campaign-report`
**Agent:** @data-analyst + @growth-cmo
**Type:** Analysis

---

## Description

Gerar relatorio completo de campanha com metricas, ROI e lessons learned.

---

## Input

```yaml
nome_campanha: 'Nome da campanha'
periodo: 'Data inicio - Data fim'
metas_originais: 'Metas definidas no inicio'
investimento: 'R$ investido (ads, tools, etc)'
```

---

## Process

1. @data-analyst coleta e processa metricas
2. Compara resultados vs metas
3. Calcula ROI
4. Identifica o que funcionou e o que nao
5. @growth-cmo adiciona recomendacoes estrategicas

---

## Output

```
RELATORIO DE CAMPANHA: [Nome]
Periodo: [inicio - fim]

RESULTADOS VS METAS:
| Metrica | Meta | Resultado | Status |
|---------|------|-----------|--------|
| [X] | [Y] | [Z] | OK/Abaixo/Acima |

ROI:
- Investimento: R$ X
- Retorno: R$ Y
- ROI: X%

TOP LEARNINGS:
1. [O que funcionou e por que]
2. [O que nao funcionou e por que]
3. [Surpresas/insights]

RECOMENDACOES:
1. [Acao para proxima campanha]
2. [Acao]
3. [Acao]
```

---

**Created:** 2026-02-05
**Version:** 1.0
