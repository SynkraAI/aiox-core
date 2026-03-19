# SW_SA_001 — Situational Awareness Score

**Type:** Decision Heuristic
**Phase:** 0 (Pré-Estratégia)
**Agent:** @kaizen:simon-wardley
**Pattern:** SW-SA-001 (Situational Awareness)

## Purpose

Avalia o nível de situational awareness de uma organização antes de qualquer discussão estratégica. Sem awareness, não existe estratégia — apenas sorte e cargo cult. Este heuristic é o GATE: se o score é baixo, a prioridade é mapear, não executar gameplay.

## Configuration

```yaml
SW_SA_001:
  name: "Situational Awareness Score"
  phase: 0

  weights:
    user_needs_clarity: 0.95
    value_chain_mapped: 0.95
    evolution_understood: 0.90
    climatic_awareness: 0.80
    doctrine_maturity: 0.85
    inertia_identified: 0.75
    competitive_landscape: 0.80

  thresholds:
    awareness_critical: 0.25
    awareness_low: 0.50
    awareness_adequate: 0.70
    awareness_high: 0.85

  veto_conditions:
    - condition: "Gameplay proposto sem mapa existente"
      action: "VETO — Não existe estratégia sem mapa. Mapeie primeiro."
    - condition: "Decisão de investimento sem posicionamento de evolução"
      action: "VETO — Investir sem saber em que estágio o componente está é aposta."
    - condition: "Estratégia copiada de outra empresa sem mapear landscape próprio"
      action: "VETO — A estratégia deles funciona no landscape deles. Mapeie o seu."
    - condition: "Score abaixo de 0.25 e organização tentando gameplay avançado"
      action: "VETO — Volte ao básico. Doctrine primeiro, gameplay depois."

  decision_tree: |
    AVALIAR 7 dimensões de situational awareness:

    1. USER NEEDS (0-1): A organização sabe quem é o usuário e o que ele precisa?
       0 = "Não sabemos quem é nosso usuário"
       0.5 = "Sabemos vagamente"
       1.0 = "Anchoramos tudo na necessidade específica do usuário"

    2. VALUE CHAIN (0-1): A cadeia de valor está mapeada?
       0 = "Não temos mapa nenhum"
       0.5 = "Temos diagrams de arquitetura mas não value chain"
       1.0 = "Value chain completa mapeada com todas as dependências"

    3. EVOLUTION (0-1): Sabem em que estágio cada componente está?
       0 = "Tratamos tudo igual"
       0.5 = "Separamos 'core' de 'commodity' vagamente"
       1.0 = "Cada componente posicionado no eixo de evolução com evidência"

    4. CLIMATE (0-1): Entendem as forças externas que movem o landscape?
       0 = "Não pensamos nisso"
       0.5 = "Acompanhamos tendências da indústria"
       1.0 = "Identificamos climatic patterns e antecipamos movimentos"

    5. DOCTRINE (0-1): Princípios universais são praticados?
       0 = "Não temos princípios claros"
       0.5 = "Temos valores mas não práticas concretas"
       1.0 = "40+ doctrine principles avaliados e praticados"

    6. INERTIA (0-1): Sabem onde a organização resiste a mudança?
       0 = "Não pensamos sobre isso"
       0.5 = "Sabemos que há resistência mas não mapeamos"
       1.0 = "Inertia mapeada por componente com plano de mitigação"

    7. COMPETITIVE LANDSCAPE (0-1): Sabem o que os competidores estão fazendo no mapa?
       0 = "Não sabemos"
       0.5 = "Monitoramos competidores mas sem mapa"
       1.0 = "Competidores plotados no mapa com movimentos previstos"

    CALCULAR score médio ponderado
    IF score < 0.25 → CRITICAL — Sem awareness. Pare tudo e mapeie.
    IF score 0.25-0.50 → LOW — Awareness parcial. Priorize mapeamento.
    IF score 0.50-0.70 → ADEQUATE — Pode fazer movimentos básicos com cautela.
    IF score 0.70-0.85 → HIGH — Pronto para gameplay contextual.
    IF score > 0.85 → EXCELLENT — Pronto para gameplay avançado (ILC, ecosystem plays).

    TERMINATION: Organização recusa mapear → não há o que fazer. Deseje-lhes sorte.
```

## Application

**Input:** Respostas da organização às 7 dimensões, evidências de mapeamento existente
**Process:** Avaliar cada dimensão (0-1), calcular score ponderado, classificar nível de awareness, recomendar próximo passo.
**Output:** EXCELLENT | HIGH | ADEQUATE | LOW | CRITICAL

## Scorecard

```text
┌──────────────────────────┬───────┬────────┐
│ Dimensão                 │ Peso  │ Score  │
├──────────────────────────┼───────┼────────┤
│ User Needs Clarity       │ 0.95  │  __/1  │
│ Value Chain Mapped       │ 0.95  │  __/1  │
│ Evolution Understood     │ 0.90  │  __/1  │
│ Climatic Awareness       │ 0.80  │  __/1  │
│ Doctrine Maturity        │ 0.85  │  __/1  │
│ Inertia Identified       │ 0.75  │  __/1  │
│ Competitive Landscape    │ 0.80  │  __/1  │
├──────────────────────────┼───────┼────────┤
│ SCORE PONDERADO          │       │  __/1  │
└──────────────────────────┴───────┴────────┘

CLASSIFICAÇÃO:
  0.00-0.25  CRITICAL  — Sem awareness. Pare e mapeie.
  0.25-0.50  LOW       — Parcial. Priorize mapeamento.
  0.50-0.70  ADEQUATE  — Movimentos básicos com cautela.
  0.70-0.85  HIGH      — Pronto para gameplay contextual.
  0.85-1.00  EXCELLENT — Pronto para gameplay avançado.
```

## Red Flags por Dimensão

| Dimensão | Red Flag | Indica |
|----------|----------|--------|
| User Needs | "Nosso produto é para todo mundo" | Zero clarity — anchor inexistente |
| Value Chain | "Temos uma arquitetura no Confluence" | Diagrama ≠ value chain |
| Evolution | "Usamos Agile em tudo" | Não distinguem estágios de evolução |
| Climate | "Acompanhamos o Gartner" | Hype cycle ≠ climatic patterns |
| Doctrine | "Temos valores na parede" | Valores ≠ doctrine praticada |
| Inertia | "Nossa cultura é boa" | Inertia não identificada |
| Competitive | "Somos líderes de mercado" | Complacência — landscape ignorado |

## Exemplos

### CRITICAL (Score: 0.18)

- **Organização:** Startup B2B SaaS com 50 pessoas
- **User Needs:** 0.3 — "Atendemos PMEs de vários setores"
- **Value Chain:** 0.0 — Nenhum mapa
- **Evolution:** 0.1 — "Tudo é custom, somos inovadores"
- **Wardley diria:** "Vocês não têm um mapa. Não sabem quem é o usuário. Não sabem o que é commodity e o que é genesis. Qualquer 'estratégia' nesse estado é loteria. Parem tudo e mapeiem."

### ADEQUATE (Score: 0.62)

- **Organização:** Scale-up com 200 pessoas, CTO técnico
- **Value Chain:** 0.7 — Mapa de arquitetura com dependências, falta posicionamento evolution
- **Evolution:** 0.5 — Separam core de infraestrutura mas sem eixo formal
- **Doctrine:** 0.7 — Boas práticas de engenharia, falta doctrine de negócio
- **Wardley diria:** "Vocês têm uma base. A value chain está parcialmente mapeada. Mas sem posicionar cada componente na evolução, vocês estão aplicando a mesma gestão em tudo. Próximo passo: posicionar componentes no eixo e identificar inertia."

### HIGH (Score: 0.78)

- **Organização:** Empresa tech com programa de Wardley Mapping interno
- **Todas dimensões** acima de 0.6, evolution em 0.8
- **Wardley diria:** "Vocês podem jogar. Têm awareness suficiente para gameplay contextual — open source plays, ecosystem moves, anticipation. Cuidado com inertia nos componentes que estão evoluindo de product para commodity."

## Core Quotes

- "Sem situational awareness, não existe estratégia — apenas sorte."
- "Todos têm um plano estratégico. Quase ninguém tem uma estratégia."
- "Antes de discutir para onde ir, me diga: onde você está?"
- "Se você não consegue mapear, não consegue strategizar."

---

**Pattern Compliance:** SW-SA-001 (Situational Awareness) ✓
**Source:** SW Mind DNA — Situational Awareness Score
