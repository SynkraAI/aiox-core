# Task: Clone Review

**Command:** `*clone-review`
**Load:** `data/an-source-tiers.yaml`

## Purpose

Review completo de um clone existente: fontes, trindade, estagios, fidelidade. Equivalente a um audit geral.

## Workflow

### Step 1: Source Quality Review

Avaliar fontes usadas no clone:

- Classificar cada fonte (ouro vs bronze)
- Calcular % ouro vs bronze
- Verificar se base principal e ouro

**Curadoria Score:**

- 80%+ ouro → Excelente
- 60-80% ouro → Aceitavel, melhorar
- <60% ouro → Critico, refazer curadoria

### Step 2: Trinity Verification

Verificar presenca e qualidade de cada perna:

| Perna      | Presente? | Qualidade | Gaps          |
| ---------- | --------- | --------- | ------------- |
| Playbook   | Sim/Nao   | 1-5       | {o que falta} |
| Framework  | Sim/Nao   | 1-5       | {o que falta} |
| Swipe File | Sim/Nao   | 1-5       | {o que falta} |

**Regra AN003**: SE clone fraco → provavelmente falta Framework.

Qualidade por perna:

- Playbook: Passos sao claros e sequenciais?
- Framework: Tem regras SE/ENTAO especificas?
- Swipe File: Exemplos sao REAIS (nao inventados)?

### Step 3: Stage Architecture Review

SE clone usa estagios:

- Cada estagio tem trindade propria?
- Transicoes entre estagios sao claras?
- Comportamento muda corretamente por contexto?

SE clone nao usa estagios:

- Precisa? Comportamento muda por contexto?
- **Regra AN004**: Prompt gigante sem estagios = IA se perde

### Step 4: Quick Fidelity Check

Avaliacao rapida (nao full score):

- Voice DNA presente e consistente?
- Thinking DNA com frameworks proprios?
- Mantem personagem sob pressao basica?
- Estimativa rapida de fidelidade

### Step 5: Generate Review Report

```yaml
clone_review:
  clone: "{nome}"
  date: "{data}"
  source_quality:
    total_sources: { n }
    ouro_percentage: "{%}"
    curadoria_score: "excelente|aceitavel|critico"
    action: "{recomendacao}"
  trinity:
    playbook:
      present: true|false
      quality: { 1-5 }
      gaps: "{o que falta}"
    framework:
      present: true|false
      quality: { 1-5 }
      gaps: "{o que falta}"
    swipe_file:
      present: true|false
      quality: { 1-5 }
      gaps: "{o que falta}"
  stages:
    has_stages: true|false
    needs_stages: true|false
    stage_quality: "{avaliacao}"
  fidelity_estimate: "{%}"
  overall_verdict: "SOLID|NEEDS_WORK|REBUILD"
  priority_actions:
    - action: "{o que fazer primeiro}"
      impact: "alto|medio"
    - action: "{segundo}"
      impact: "alto|medio"
  next_version_path: "De {current}% para {target}% fazendo {acoes}"
```

## Completion Criteria

- [ ] Fontes avaliadas (curadoria score)
- [ ] Trindade verificada (3 pernas)
- [ ] Estagios revisados (se aplicavel)
- [ ] Fidelidade estimada
- [ ] Review report com verdict e acoes prioritarias
