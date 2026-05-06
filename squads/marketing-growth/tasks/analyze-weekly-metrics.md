# Analyze Weekly Metrics

**Task:** `analyze-weekly-metrics`
**Agent:** @data-analyst
**Type:** Analysis

---

## Description

Analise semanal de metricas de todas plataformas e landing pages.

---

## Input

```yaml
dados_instagram: 'Metricas IG da semana (opcional)'
dados_linkedin: 'Metricas LI da semana (opcional)'
dados_lp: 'Metricas LP da semana (opcional)'
dados_email: 'Metricas email da semana (opcional)'
```

---

## Process

1. Processa dados por plataforma
2. Calcula KPIs vs semana anterior (WoW)
3. Identifica tendencias
4. Gera 3 insights acionaveis
5. Recomenda ajustes para proxima semana

---

## Output

Relatorio semanal formatado usando template weekly-metrics-report.md

---

**Created:** 2026-02-05
**Version:** 1.0
