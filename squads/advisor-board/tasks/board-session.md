# Task: Advisory Board Session

**Task ID:** board-session
**Version:** 1.0
**Purpose:** Conduzir uma sessão de advisory onde o usuário apresenta uma questão e recebe conselho personalizado dos advisors mais relevantes
**Executor:** Agent (board-chief → advisors)
**Execution Type:** Agent
**Estimated Time:** 15-30min

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| question | string | Yes | A questão, dilema ou situação do usuário |
| context | string | No | Contexto adicional (números, timeline, stakeholders) |
| preferred_advisors | list | No | Advisors específicos que o usuário quer ouvir |
| depth | enum | No | `quick` (1 advisor) / `standard` (2-3) / `deep` (4+) |

## Preconditions

- [ ] board-chief agent ativo
- [ ] Perfil ENTP do usuário acessível em `squads/luiz-fosc/data/dna/`
- [ ] Mind DNA files acessíveis em `outputs/minds/`

---

## Steps

### Step 1: DIAGNOSE (board-chief)

```yaml
diagnostic:
  actions:
    - Classificar a questão por domínio: Strategy | Execution | Thinking | Vision
    - Identificar sub-domínio específico (ex: pricing, hiring, risk, product)
    - Consultar perfil ENTP para blind spots relevantes
    - Determinar profundidade: quick (1 advisor), standard (2-3), deep (4+)

  routing_matrix:
    strategy:
      competitive_advantage: hamilton-helmer
      scaling: verne-harnish
      innovation: clayton-christensen
      first_principles: elon-musk
    execution:
      growth_marketing: alex-hormozi
      capital_allocation: keith-cunningham
      negotiation: chris-voss
    thinking:
      decision_under_uncertainty: annie-duke
      risk_antifragility: nassim-taleb
      mental_models: shane-parrish
      leverage_philosophy: naval-ravikant
    vision:
      product_simplicity: steve-jobs
      creative_strategy: walt-disney

  entp_calibration:
    strengths_to_leverage:
      - "Ne dominant: apresentar múltiplas perspectivas (ENTP adora)"
      - "Ti auxiliary: incluir frameworks lógicos estruturados"
    blind_spots_to_address:
      - "Si inferior: forçar checklist de execução no final"
      - "Fe tertiary: lembrar impacto em pessoas/relacionamentos"
      - "Shiny object syndrome: perguntar 'isso muda a direção ou é distração?'"
```

### Step 2: CONVENE (board-chief → advisors)

```yaml
convene:
  quick_mode:
    - Rotear para 1 advisor principal
    - Resposta direta com framework aplicado

  standard_mode:
    - Rotear para 2-3 advisors complementares
    - Cada advisor responde na sua voz autêntica
    - board-chief sintetiza no final

  deep_mode:
    - Rotear para 4+ advisors
    - Permitir desacordo entre advisors
    - board-chief facilita debate e sintetiza

  format_per_advisor:
    - "Nome do advisor + framework aplicado"
    - "Diagnóstico da situação na perspectiva dele"
    - "Recomendação concreta com próximos passos"
    - "Veto/Warning se aplicável"
```

### Step 3: SYNTHESIZE (board-chief)

```yaml
synthesis:
  structure:
    - consensus: "Onde todos concordam"
    - divergence: "Onde discordam e por quê"
    - recommendation: "Melhor caminho considerando perfil ENTP"
    - action_items: "3-5 ações concretas"
    - entp_warning: "Blind spot relevante para esta decisão"

  quality_checks:
    - "Cada advisor respondeu na voz autêntica?"
    - "Frameworks foram aplicados (não genérico)?"
    - "Ações são concretas e executáveis?"
    - "Blind spots ENTP foram endereçados?"
```

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| advisory_response | markdown | Resposta completa com perspectivas dos advisors |
| action_items | checklist | 3-5 ações concretas priorizadas |
| frameworks_applied | list | Quais frameworks foram usados |
| follow_up | string | Pergunta de follow-up sugerida |

---

## Output Example

```markdown
## Advisory Board Session

**Questão:** "Devo lançar um produto novo ou melhorar o existente?"

### Hamilton Helmer (Strategy)
Antes de decidir, aplique o teste de Power. O produto existente tem algum dos 7 Powers?
Se tem Switching Costs ou Network Economies, melhorar é investir em Barrier existente.
Se não tem Power nenhum, criar algo novo com Counter-Positioning pode ser mais estratégico.
**Recomendação:** Mapeie os 7 Powers no produto atual antes de qualquer decisão.

### Clayton Christensen (Strategy)
A pergunta real é: qual Job To Be Done seus clientes estão contratando?
Se o produto atual faz o job bem mas há um job adjacente não atendido, lance algo novo.
Se o produto atual faz o job mal, melhore antes de dispersar recursos.
**Recomendação:** Entreviste 5 clientes com a pergunta "por que você contratou este produto?"

### Keith Cunningham (Execution)
Aplique Thinking Time: sente, feche a porta, e responda por escrito:
1. Qual é o custo de oportunidade de cada caminho?
2. O que precisa ser verdade para cada opção funcionar?
3. Onde está o risco assimétrico?
**Recomendação:** 2 horas de Thinking Time antes de decidir.

### Síntese (board-chief)
**Consenso:** Não decida antes de ter dados (Helmer: mapeie Power, Christensen: entreviste, Cunningham: pense).
**Divergência:** Helmer prioriza vantagem competitiva, Christensen prioriza demanda do cliente.
**Para seu perfil ENTP:** Cuidado com a tentação de lançar algo novo só porque é mais excitante (Ne dominant). O Cunningham está certo: sente e pense primeiro.

**Ações:**
1. [ ] Mapear 7 Powers no produto atual (30min)
2. [ ] Entrevistar 5 clientes sobre JTBD (1 semana)
3. [ ] 2h de Thinking Time com as 3 perguntas do Cunningham
4. [ ] Voltar ao board com dados para segunda rodada
```

---

## Acceptance Criteria

- [ ] board-chief classificou corretamente o domínio da questão
- [ ] Advisors selecionados são relevantes para a questão
- [ ] Cada advisor respondeu com framework específico (não genérico)
- [ ] Síntese inclui consenso, divergência e recomendação
- [ ] Action items são concretos e executáveis
- [ ] Blind spots ENTP endereçados
- [ ] Voz autêntica de cada advisor preservada

---

## Veto Conditions

- Advisor responde de forma genérica sem framework → REJEITAR, refazer
- Menos de 2 advisors para modo standard → ESCALAR para deep
- Síntese não tem action items → BLOQUEAR até adicionar
- Resposta ignora perfil ENTP → REFAZER com calibração
