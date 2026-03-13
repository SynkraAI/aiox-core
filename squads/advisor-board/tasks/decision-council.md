# Task: Decision Council

**Task ID:** decision-council
**Version:** 1.0
**Purpose:** Convocar múltiplos advisors para deliberar sobre uma decisão crítica, permitindo debate e desacordo estruturado
**Executor:** Agent (board-chief como facilitador)
**Execution Type:** Agent
**Estimated Time:** 30-60min

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| decision | string | Yes | A decisão a ser tomada (formato: "Devo X ou Y?") |
| stakes | enum | Yes | `low` / `medium` / `high` / `irreversible` |
| context | string | Yes | Números, timeline, constraints, stakeholders |
| options | list | No | Opções já identificadas (se houver) |
| advisors | list | No | Advisors específicos (default: board-chief seleciona) |

## Preconditions

- [ ] board-chief ativo
- [ ] Contexto suficiente fornecido (números e constraints)
- [ ] Decisão é binária ou tem opções claras

---

## Steps

### Step 1: FRAME (board-chief)

```yaml
framing:
  actions:
    - Reformular a decisão em formato claro: "A questão é: X ou Y?"
    - Identificar o tipo de decisão (reversível vs irreversível)
    - Listar constraints conhecidos
    - Selecionar 4-6 advisors relevantes
    - Definir formato do debate

  decision_types:
    reversible:
      approach: "Bias for action. Decide fast, iterate."
      advisors_min: 3
    irreversible:
      approach: "Slow down. Pre-mortem. Devil's advocate."
      advisors_min: 5
      mandatory_advisors: [annie-duke, nassim-taleb]
```

### Step 2: INDIVIDUAL POSITIONS (each advisor)

```yaml
individual_positions:
  format_per_advisor:
    position: "A favor de qual opção e por quê"
    framework_applied: "Qual framework fundamenta a posição"
    conditions: "O que precisa ser verdade para esta opção funcionar"
    risks: "O que pode dar errado"
    veto: "Existe algum deal-breaker?"

  rules:
    - Cada advisor responde INDEPENDENTEMENTE (não vê os outros)
    - Advisor DEVE usar seu framework específico
    - Advisor pode introduzir opções que ninguém considerou
    - Advisor pode declarar "não tenho opinião forte" e passar
```

### Step 3: DEBATE (board-chief facilita)

```yaml
debate:
  structure:
    round_1: "Apresentar posições individuais"
    round_2: "Advisors que discordam explicam por quê"
    round_3: "Buscar pontos de convergência"

  debate_rules:
    - Desacordo é BEM-VINDO (não buscar consenso artificial)
    - Cada advisor mantém sua voz autêntica
    - board-chief NÃO toma partido, apenas facilita
    - Identificar onde a discordância é sobre FATOS vs VALORES

  special_roles:
    devil_advocate:
      always_assign: true
      preferred: nassim-taleb
      fallback: annie-duke
      job: "Atacar a opção mais popular"

    risk_assessor:
      preferred: nassim-taleb
      job: "Identificar tail risks e fragilidades"

    execution_checker:
      preferred: keith-cunningham
      job: "Perguntar 'como exatamente isso vai ser implementado?'"
```

### Step 4: SYNTHESIZE (board-chief)

```yaml
synthesis:
  output_structure:
    decision_matrix:
      - option: "A"
        advocates: [advisor1, advisor2]
        key_argument: "..."
        conditions: "..."
        risks: "..."
      - option: "B"
        advocates: [advisor3]
        key_argument: "..."
        conditions: "..."
        risks: "..."

    consensus_areas: "Onde todos concordam"
    irreconcilable_differences: "Onde nunca vão concordar e por quê"

    recommendation:
      primary: "Opção recomendada"
      rationale: "Por quê, considerando perfil ENTP"
      pre_mortem: "Se isso falhar, provavelmente será porque..."
      reversibility: "Se der errado, como voltar atrás?"

    action_plan:
      immediate: "Fazer hoje"
      this_week: "Fazer esta semana"
      checkpoint: "Quando reavaliar"
```

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| decision_brief | markdown | Documento completo da deliberação |
| decision_matrix | table | Opções vs critérios |
| recommendation | string | Recomendação final com rationale |
| action_plan | checklist | Próximos passos com prazos |
| pre_mortem | string | "Se falhar, será porque..." |

---

## Output Example

```markdown
## Decision Council: Contratar CTO ou terceirizar dev?

**Stakes:** High (irreversível no curto prazo)
**Advisors convocados:** Hormozi, Cunningham, Helmer, Naval, Voss

### Posições Individuais

**Hormozi (Execution):** Terceirize até ter Product-Market Fit.
Não contrate gente cara antes de provar que o negócio funciona.
Framework: "Teste com o mínimo antes de escalar o máximo."

**Cunningham (Execution):** Faça Thinking Time primeiro.
Perguntas: Qual o custo real de cada opção em 24 meses?
O que acontece se o terceirizado sair? E se o CTO sair?

**Helmer (Strategy):** CTO só faz sentido se tecnologia é seu Power.
Se tech é commodity no seu mercado, terceirize. Se tech é Cornered Resource, contrate.

**Naval (Thinking):** Contrate. Specific knowledge não se terceiriza.
Mas contrate alguém com skin in the game (equity, não salário fixo).

**Voss (Execution):** Antes de decidir, converse com 3 CTOs.
Use Calibrated Questions: "Como você abordaria nosso desafio técnico?"
A qualidade das respostas vai informar a decisão.

### Debate

**Discordância principal:** Hormozi vs Naval
- Hormozi: "Não gaste antes de provar"
- Naval: "Specific knowledge precisa ser interna"
- **Resolução:** Depende se tech é diferencial competitivo ou não

**Consenso:** Todos concordam em NÃO decidir sem mais dados
- Cunningham: pensar estruturadamente
- Voss: conversar com candidatos
- Helmer: mapear se tech é Power

### Recomendação (board-chief)
**Para seu perfil ENTP:** Você provavelmente já quer contratar (Ne: "seria incrível ter um CTO!"). Resista. Faça o dever de casa primeiro.

**Ação imediata:**
1. [ ] 2h Thinking Time (perguntas do Cunningham)
2. [ ] Mapear: tech é Power no seu mercado? (Helmer)
3. [ ] Conversar com 3 CTOs potenciais (Voss)
4. [ ] Voltar ao board em 2 semanas com dados

**Pre-mortem:** Se contratar CTO e falhar, será porque:
- Tech não era o diferencial (Helmer estava certo)
- Contratou rápido demais sem Thinking Time (Cunningham estava certo)
```

---

## Acceptance Criteria

- [ ] Decisão framada corretamente (opções claras)
- [ ] Mínimo 4 advisors para decisões high/irreversible
- [ ] Cada advisor usou seu framework específico
- [ ] Devil's advocate designado e atuou
- [ ] Debate identificou discordâncias reais (não consenso artificial)
- [ ] Pre-mortem incluído para decisões high+
- [ ] Action plan concreto com prazos
- [ ] Calibração ENTP presente na recomendação

## Veto Conditions

- Decisão irreversível sem pre-mortem → BLOQUEAR
- Menos de 4 advisors para stakes=high → ESCALAR
- Consenso artificial (todos concordam sem debate) → FORÇAR devil's advocate
- Sem action items concretos → BLOQUEAR até adicionar
