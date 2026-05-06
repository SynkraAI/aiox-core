# Audit Content Performance

**Task:** `audit-content-performance`
**Agent:** @data-analyst
**Type:** Audit

---

## Description

Auditar performance de conteudo publicado em periodo especifico.

---

## Input

```yaml
periodo: 'semana | mes | trimestre'
plataforma: 'ig | li | both'
dados: 'Metricas coletadas (manual ou API)'
```

---

## Process

1. Coleta metricas do periodo
2. Calcula KPIs (engagement, reach, conversao)
3. Identifica top/bottom performers
4. Identifica padroes (formato, horario, tema)
5. Gera insights acionaveis

---

## Output

```
AUDITORIA DE PERFORMANCE - [Periodo]

Top 3 Posts:
1. [Post] - [Metrica principal] - [Por que funcionou]
2. [Post] - [Metrica principal]
3. [Post] - [Metrica principal]

Bottom 3:
1. [Post] - [Metrica] - [Hipotese do baixo resultado]

Padroes Identificados:
- Formato que mais engaja: [X]
- Melhor horario: [X]
- Tema mais popular: [X]

3 Insights Acionaveis:
1. [Insight + acao]
2. [Insight + acao]
3. [Insight + acao]
```

---

**Created:** 2026-02-05
**Version:** 1.0
