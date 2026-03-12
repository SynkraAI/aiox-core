# Marketing OPES — Board Estratégico + Marketing Arm

**Version:** 1.1.0
**Status:** Production-Ready
**Compatibility:** AIOS v4.0+

---

## Overview

Board estratégico pessoal com 3 conselheiros + 1 agente chefe, desenhado para acelerar decisões estratégicas de alto impacto. Cada conselheiro traz uma lente única e complementar, e o Agente Chefe sintetiza em ação executável.

```
┌──────────────────────────────────────────────────┐
│                 CONSELHEIROS                      │
│                                                   │
│  Naval Ravikant   Alex Hormozi    Peter Thiel    │
│  (Riqueza)        (Receita)       (Monopólio)    │
│                                                   │
└───────┬──────────────┬──────────────┬────────────┘
        │              │              │
        └──────┬───────┴──────┬───────┘
               │              │
      ┌────────▼──────────────▼────────┐
      │        AGENTE CHEFE            │
      │        Elon Musk               │
      │        (Execução)              │
      └───────────────┬────────────────┘
                      │
                      ▼
                 DECISÃO + AÇÃO
```

## Quando Usar

- Avaliar uma oportunidade de parceria/sociedade
- Decidir pricing de produto ou mentoria
- Priorizar entre múltiplas oportunidades
- Revisão semanal/mensal de progresso
- Questões de posicionamento e diferenciação
- Qualquer decisão estratégica que afete receita ou tempo

## O Que Está Incluído

### Agents (1)
- **@board-orchestrator** - Orquestra sessões, canaliza conselheiros, sintetiza decisões

### Tasks (3)
- **consult-board** - Submeter questão estratégica ao board completo
- **evaluate-deal** - Avaliar deal/parceria com análise dos 3 conselheiros
- **strategic-review** - Revisão periódica de progresso e prioridades

### Checklists (1)
- **board-decision-quality** - Quality gate para garantir decisões completas

### Templates (1)
- **board-session-report** - Template para relatórios de sessão

### Data (1)
- **decision-frameworks** - Frameworks de decisão por conselheiro (fallback)

## Quick Start

```bash
# Consultar o board
/consult-board

# Avaliar um deal
/evaluate-deal

# Revisão estratégica
/strategic-review

# Consultar conselheiro individual
@board *naval    # Só Naval Ravikant
@board *hormozi  # Só Alex Hormozi
@board *thiel    # Só Peter Thiel
@board *elon     # Só Agente Chefe
```

## Board Composition

| Posição | Mind | Lente | Pergunta-Filtro |
|---------|------|-------|-----------------|
| Conselheiro 1 | Naval Ravikant | Riqueza & Leverage | "Isso escala sem sua presença?" |
| Conselheiro 2 | Alex Hormozi | Receita & Escala | "Qual é a matemática?" |
| Conselheiro 3 | Peter Thiel | Monopólio & Contrarian | "Está competindo ou criando?" |
| Agente Chefe | Elon Musk | Execução & First Principles | "Qual é o caminho crítico?" |

## Mind Status

| Mind | Completeness | System Prompts | Prioridade de Refinamento |
|------|-------------|----------------|--------------------------|
| Elon Musk | 75% | 3 versões prontas | Baixa (funcional) |
| Alex Hormozi | 70% | Pendente (Cognitive OS pronto) | Média (gerar prompt) |
| Peter Thiel | 45% | Pendente | Alta (coletar mais sources) |
| Naval Ravikant | 35% | Pendente | Alta (sintetizar sources existentes) |

## Integration

- **MMOS Integration:** Usa minds de `outputs/minds/` quando disponíveis
- **Fallback:** `data/decision-frameworks.yaml` quando mind não tem system prompt
- **Output:** Sessões salvas em `docs/logs/` seguindo convenção de naming
- **ROI Tracker:** Cada sessão pode ser avaliada pelo daily-roi-tracker

---

*Marketing OPES Expansion Pack v1.1.0*
*Created: 2026-01-31*
