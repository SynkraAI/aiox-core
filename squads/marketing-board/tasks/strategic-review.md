# Task: Revisão Estratégica

**Task ID**: strategic-review
**Agent**: @board-orchestrator
**Version**: 1.0.0

---

## Purpose

Revisão periódica (semanal ou quinzenal) do progresso em direção à liberdade financeira, com perspectivas dos 3 conselheiros e recomendações de ajuste do Agente Chefe.

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `period` | string | Yes | Período da revisão | "Semana 4 - Janeiro 2026" |
| `revenue_current` | number | Yes | Receita do período (R$) | 11000 |
| `revenue_variable` | number | No | Variável de mentorias/parcerias | 3500 |
| `active_deals` | list | No | Parcerias ativas | ["Carlos Eduardo - mentoria", "Parceiro X - cohort"] |
| `pipeline` | list | No | Oportunidades em negociação | ["Potencial Y - 40/60", "Potencial Z - consultoria"] |
| `blockers` | list | No | O que está travando | ["Falta de tempo", "Mind X incompleta"] |
| `wins` | list | No | Conquistas do período | ["ROI 264x ontem", "Fechou deal X"] |

---

## Workflow

### Step 1: Dashboard de Situação

```markdown
## Status Atual

| Métrica | Valor | Meta Mensal | Gap |
|---------|-------|-------------|-----|
| Receita Fixa | R$ ___ | R$ ___ | R$ ___ |
| Receita Variável | R$ ___ | R$ ___ | R$ ___ |
| Total | R$ ___ | R$ ___ | R$ ___ |
| Deals Ativos | ___ | ___ | ___ |
| Pipeline | ___ | ___ | ___ |
| ROI AIOS (último) | ___x | >100x | ✅/❌ |

**Runway para liberdade financeira:**
- Meta anual: R$ ___
- Acumulado YTD: R$ ___
- Faltam: R$ ___
- Meses restantes 2026: ___
- Receita média necessária/mês: R$ ___
```

### Step 2: Conselheiros Avaliam

**Naval Ravikant - Audit de Leverage:**
```markdown
- Quanto % da receita é tempo-dependente vs leverage-based?
- Qual atividade gera mais R$/hora?
- O que deveria parar de fazer pessoalmente?
- Progresso em construir renda que não exige presença?
```

**Alex Hormozi - Audit de Revenue:**
```markdown
- Valor/hora efetivo esta semana: R$ ___
- Atividade de maior ROI: ___
- Atividade de menor ROI (candidata a corte): ___
- Próximo produto/oferta a criar para 2x receita: ___
- LTV médio por mentorado: R$ ___
```

**Peter Thiel - Audit de Posicionamento:**
```markdown
- Está mais perto ou mais longe de monopólio?
- Alguém copiou sua abordagem? (sinal de que funciona)
- O que fez esta semana que NINGUÉM mais poderia fazer?
- Está competindo em preço ou em categoria única?
```

### Step 3: Elon Musk - Priorização Implacável

```markdown
### Agente Chefe: Priorização da Próxima Semana

**MANTER (alto ROI comprovado):**
1. ___
2. ___

**ACELERAR (potencial não explorado):**
1. ___

**CORTAR (baixo ROI, consumindo tempo):**
1. ___

**EXPERIMENTAR (1 aposta nova):**
1. ___

**Caminho crítico para o mês:**
"[1 frase definindo a prioridade #1 absoluta]"
```

### Step 4: Salvar

Salvar em `docs/logs/YYYY-MM-DD_board-review.md`

---

## Cadência Recomendada

| Frequência | Tipo | Profundidade |
|------------|------|-------------|
| Semanal (sexta) | Quick review | Dashboard + Elon prioriza |
| Quinzenal | Full review | Todos conselheiros + convergência |
| Mensal | Deep review | Full + análise de tendência + ajuste de meta |
| Trimestral | Strategic pivot | Reavaliação completa de estratégia |

---

## Success Criteria

- [ ] Dashboard atualizado com números reais
- [ ] Pelo menos 1 atividade identificada para CORTAR
- [ ] Pelo menos 1 atividade identificada para ACELERAR
- [ ] Prioridade #1 da próxima semana definida em 1 frase
- [ ] Sessão salva em docs/logs/

---

*Task v1.0.0 - Created: 2026-01-31*
