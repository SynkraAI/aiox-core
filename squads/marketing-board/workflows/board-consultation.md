# Workflow: Board Consultation

**Workflow ID**: board-consultation
**Version**: 1.0.0
**Trigger**: `/consult-board`, `/evaluate-deal`, `/strategic-review`
**Cadence**: Ad-hoc (consult/deal) ou semanal/quinzenal (review)

---

## Overview

Workflow unificado do Advisory Board. 3 conselheiros (Naval, Hormozi, Thiel) analisam a questao por lentes distintas, convergem, e o Agente Chefe (Elon Musk) decide com acao + deadline.

---

## Flow Diagram

```
ENTRADA
━━━━━━
  Questao estrategica
  (deal, strategy, priority, positioning, pricing)
       │
       ▼
┌──────────────────────┐
│  ENQUADRAR QUESTAO   │
│                      │
│  1. Tipo de decisao  │
│  2. Urgencia         │
│  3. Peso por advisor │
│  4. Dados disponiveis│
│                      │
│  Se dados faltam →   │
│  perguntar antes     │
└──────┬───────────────┘
       │
       ▼
  Carregar contexto minds
  1. squads/mind-cloning/minds/{slug}/system_prompts/ (prioridade)
  2. data/decision-frameworks.yaml (fallback)
  3. agents/board-orchestrator.md (base)


CONSELHEIROS (sequencial)
━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────────────────────────────┐
│  NAVAL RAVIKANT                      │
│  Lente: Leverage + Equity            │
│  "Isso escala sem presenca?"         │
│                                      │
│  → Diagnostico (2-3 frases)          │
│  → Recomendacao (1 acao)             │
│  → Veredicto (1 frase)              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  ALEX HORMOZI                        │
│  Lente: Monetizacao + Unit Economics │
│  "Qual e a matematica?"             │
│                                      │
│  → Diagnostico (2-3 frases)          │
│  → Recomendacao (1 acao)             │
│  → Veredicto (1 frase)              │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  PETER THIEL                         │
│  Lente: Monopolio + Contrarian       │
│  "Esta competindo ou criando?"       │
│                                      │
│  → Diagnostico (2-3 frases)          │
│  → Recomendacao (1 acao)             │
│  → Veredicto (1 frase)              │
└──────────────────────────────────────┘


CONVERGENCIA
━━━━━━━━━━━━

| Aspecto | Naval | Hormozi | Thiel | Consenso |
|---------|-------|---------|-------|----------|

  Identificar:
  - Acordo forte (2+ concordam) → sinal forte
  - Divergencia → oportunidade de insight
  - Ponto cego → o que nenhum cobriu


AGENTE CHEFE
━━━━━━━━━━━━

┌──────────────────────────────────────┐
│  ELON MUSK (DECISOR)                 │
│                                      │
│  Recebe: 3 perspectivas +            │
│          tabela convergencia         │
│                                      │
│  1. Aplica first principles          │
│  2. Remove complexidade              │
│  3. Entrega:                         │
│     DECISAO: [o que fazer]           │
│     ACAO: [proximo passo concreto]   │
│     DEADLINE: [quando]               │
│                                      │
│  Tone: Urgente, pragmatico,          │
│  impaciente com complexidade.        │
│  "Faca X. Ate [data]. Porque [1     │
│   frase]."                           │
└──────┬───────────────────────────────┘
       │
       ▼
  Salvar sessao
  docs/logs/YYYY-MM-DD_board-{tipo}.md
```

---

## Variantes por Tipo

### `/consult-board` (Consulta Generica)

| Campo | Valor |
|-------|-------|
| Input | Questao + contexto opcional |
| Peso conselheiros | Balanceado |
| Output | Decisao + acao + deadline |
| Template | templates/board-session-report.md |

### `/evaluate-deal` (Avaliacao de Deal)

| Campo | Valor |
|-------|-------|
| Input | Parceiro + perfil + estrutura + contribuicao |
| Peso conselheiros | Naval (deal structure), Hormozi (math), Thiel (positioning) |
| Extra | Deal scoring (0-3 SIM), kill condition |
| Output | ACEITAR / REJEITAR / RENEGOCIAR + condicoes |
| Template | templates/board-session-report.md |

**Deal Scoring:**

| Score | Significado | Acao |
|-------|------------|------|
| 3/3 SIM | Deal excepcional | Executar HOJE |
| 2/3 SIM | Deal bom com ressalva | Executar com ajuste |
| 1/3 SIM | Deal questionavel | Renegociar ou recusar |
| 0/3 SIM | Deal ruim | Recusar imediatamente |

### `/strategic-review` (Revisao Estrategica)

| Campo | Valor |
|-------|-------|
| Input | Periodo + receita + deals + pipeline + blockers + wins |
| Peso conselheiros | Balanceado com foco especifico por advisor |
| Extra | Dashboard de situacao, runway, priorizacao MANTER/ACELERAR/CORTAR |
| Output | Prioridade #1 da proxima semana em 1 frase |
| Template | templates/board-session-report.md |

**Cadencia review:**

| Frequencia | Tipo | Profundidade |
|------------|------|-------------|
| Semanal (sexta) | Quick review | Dashboard + Elon prioriza |
| Quinzenal | Full review | Todos conselheiros + convergencia |
| Mensal | Deep review | Full + tendencia + ajuste meta |
| Trimestral | Strategic pivot | Reavaliacao completa |

---

## Mind Integration

| Advisor | Slug | Status | Fallback |
|---------|------|--------|----------|
| Naval Ravikant | `naval_ravikant` | 35% | decision-frameworks.yaml |
| Alex Hormozi | `alex_hormozi` | 70% | decision-frameworks.yaml |
| Peter Thiel | `peter_thiel` | 45% | decision-frameworks.yaml |
| Elon Musk | `elon_musk` | 75% | decision-frameworks.yaml |

**Prioridade de carregamento:**
1. `squads/mind-cloning/minds/{slug}/system_prompts/` (se existir)
2. `data/decision-frameworks.yaml` (fallback)
3. Definicao em `agents/board-orchestrator.md` (base)

---

## Commands do Board

| Command | Descricao | Task |
|---------|-----------|------|
| `*consult` | Questao ao board completo | consult-board.md |
| `*deal` | Avaliar parceria/deal | evaluate-deal.md |
| `*review` | Revisao estrategica | strategic-review.md |
| `*naval` | Consultar Naval individual | — |
| `*hormozi` | Consultar Hormozi individual | — |
| `*thiel` | Consultar Thiel individual | — |
| `*elon` | Consultar Elon individual | — |
| `*debate` | Provocar debate entre advisors | — |

---

## Quality Gate

Toda sessao do board passa pelo checklist `checklists/board-decision-quality.md`:
- [ ] Todos conselheiros emitiram perspectiva autentica
- [ ] Tabela de convergencia preenchida
- [ ] Agente Chefe entregou decisao com acao + deadline
- [ ] Sessao salva em docs/logs/
- [ ] Jose sabe exatamente o que fazer HOJE

---

*Workflow v1.0.0 — Unificado de tasks/consult-board.md + evaluate-deal.md + strategic-review.md*
