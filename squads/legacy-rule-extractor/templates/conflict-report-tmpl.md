# Conflict Report — {{SYSTEM_A}} vs {{SYSTEM_B}}

**Generated at:** {{DATE}}
**Analyzed by:** Auditor (Legacy Rule Extractor)

---

## Executive Summary

| Metrica | Valor |
|---------|-------|
| Total de conflitos | {{TOTAL_CONFLICTS}} |
| Contradicoes | {{CONTRADICTIONS}} |
| Sobreposicoes | {{OVERLAPS}} |
| Lacunas | {{GAPS}} |
| Desvios semanticos | {{DRIFTS}} |
| Conflitos temporais | {{TEMPORAL}} |
| Severidade media | {{AVG_SEVERITY}}/10 |

**Conflitos criticos (score >= 8.0):** {{CRITICAL_COUNT}}
**Acao imediata necessaria:** {{ACTION_NEEDED}}

---

## Conflitos por Severidade

### CRITICOS (score >= 8.0)

#### CONFLICT-{{SEQ}}: {{TITLE}}

**Tipo:** {{TYPE}} | **Score:** {{SCORE}}/10

**Sistema A — {{SYSTEM_A}}:**
- Regra: {{RULE_ID_A}} — {{TITLE_A}}
- Fonte: `{{FILE_A}}` linhas {{LINES_A}}
- Logica:
```
{{LOGIC_A}}
```

**Sistema B — {{SYSTEM_B}}:**
- Regra: {{RULE_ID_B}} — {{TITLE_B}}
- Fonte: `{{FILE_B}}` linhas {{LINES_B}}
- Logica:
```
{{LOGIC_B}}
```

**Diferenca:**
{{DIFFERENCE_DESCRIPTION}}

**Impacto:**
{{IMPACT_DESCRIPTION}}

**Recomendacao:**
{{RESOLUTION_RECOMMENDATION}}

---

### IMPORTANTES (score 5.0 - 7.9)

{{IMPORTANT_CONFLICTS}}

---

### MODERADOS (score 2.0 - 4.9)

{{MODERATE_CONFLICTS}}

---

## Gap Analysis

Regras que existem em um sistema mas nao no outro.

### Exclusivas de {{SYSTEM_A}}

| ID | Titulo | Severidade | Dominio |
|----|--------|-----------|---------|
| {{RULE_ID}} | {{TITLE}} | {{SEVERITY}} | {{DOMAIN}} |

### Exclusivas de {{SYSTEM_B}}

| ID | Titulo | Severidade | Dominio |
|----|--------|-----------|---------|
| {{RULE_ID}} | {{TITLE}} | {{SEVERITY}} | {{DOMAIN}} |

---

## Recomendacoes de Resolucao

1. {{REC_1}}
2. {{REC_2}}
3. {{REC_3}}

---

*Relatorio gerado por Legacy Rule Extractor v1.0.0*
