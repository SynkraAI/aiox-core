# Migration Brief — {{SYSTEM_NAME}}

**Generated at:** {{DATE}}
**Prepared by:** Legacy Rule Extractor Squad

---

## 1. Visao Geral do Sistema

| Item | Detalhe |
|------|---------|
| Sistema | {{SYSTEM_NAME}} |
| Linguagem(ns) | {{LANGUAGES}} |
| Arquivos analisados | {{FILES_ANALYZED}} |
| Linhas de codigo | {{TOTAL_LOC}} |
| Idade estimada | {{ESTIMATED_AGE}} |

---

## 2. Inventario de Regras

**Total:** {{TOTAL_RULES}} regras extraidas

### Por Dominio

| Dominio | Regras | Criticas | Confianca Alta |
|---------|--------|----------|---------------|
| {{DOMAIN}} | {{COUNT}} | {{CRITICAL}} | {{HIGH_CONF}}% |

### Por Tipo

| Tipo | Quantidade |
|------|-----------|
| Calculo | {{CALC}} |
| Validacao | {{VALID}} |
| Decisao | {{DECISION}} |
| Transicao de Estado | {{STATE}} |
| Implicita | {{IMPLICIT}} |

---

## 3. Regras Criticas (Migrar Primeiro)

Regras que, se implementadas incorretamente, causam impacto financeiro,
legal ou operacional imediato.

| # | ID | Descricao | Fonte | Risco |
|---|----|-----------||-------|-------|
| 1 | {{RULE_ID}} | {{DESCRIPTION}} | {{SOURCE}} | {{RISK}} |

---

## 4. Regras de Alto Risco

Regras com confianca baixa ou complexidade alta que necessitam
validacao com especialistas de negocio (SMEs).

| # | ID | Descricao | Confianca | Razao do Risco |
|---|----|-----------||-----------|----------------|
| 1 | {{RULE_ID}} | {{DESCRIPTION}} | {{CONFIDENCE}} | {{RISK_REASON}} |

**Recomendacao:** Agendar sessoes de validacao com {{SME_COUNT}} especialistas
de negocio antes de iniciar a migracao destas regras.

---

## 5. Conflitos Identificados

{{IF_CONFLICTS}}

| # | Tipo | Sistema A | Sistema B | Severidade |
|---|------|-----------|-----------|-----------|
| 1 | {{TYPE}} | {{RULE_A}} | {{RULE_B}} | {{SEVERITY}} |

**Acoes necessarias:** Resolver {{CRITICAL_CONFLICTS}} conflitos criticos
antes de iniciar a migracao.

{{/IF_CONFLICTS}}

---

## 6. Ordem de Migracao Recomendada

Baseada em dependencias, criticidade e complexidade.

### Fase 1 — Fundacoes
Regras base das quais outras dependem. Sem estas, nada funciona.

{{PHASE_1_RULES}}

### Fase 2 — Nucleo
Regras de negocio centrais do dominio principal.

{{PHASE_2_RULES}}

### Fase 3 — Perifericas
Regras secundarias e de suporte.

{{PHASE_3_RULES}}

### Fase 4 — Otimizacao
Regras informativas e de conveniencia.

{{PHASE_4_RULES}}

---

## 7. Metricas de Cobertura

| Metrica | Valor | Meta |
|---------|-------|------|
| Cobertura de arquivos | {{FILE_COV}}% | >= 80% |
| Cobertura de hotspots | {{HOTSPOT_COV}}% | >= 95% |
| Cobertura de dominios | {{DOMAIN_COV}}% | >= 90% |
| Confianca alta | {{HIGH_CONF}}% | >= 50% |

---

## 8. Riscos e Recomendacoes

### Riscos

1. {{RISK_1}}
2. {{RISK_2}}
3. {{RISK_3}}

### Recomendacoes

1. {{REC_1}}
2. {{REC_2}}
3. {{REC_3}}

---

*Brief gerado por Legacy Rule Extractor v1.0.0*
