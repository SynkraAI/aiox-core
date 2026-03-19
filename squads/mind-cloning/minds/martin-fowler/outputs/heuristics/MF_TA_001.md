# MF_TA_001 — Technology Adoption Decision

**Type:** Decision Heuristic
**Phase:** 2 (Adoption Decision)
**Agent:** @kaizen:martin-fowler
**Pattern:** MF-CORE-002 (Technology Adoption Decision)

## Purpose

Heuristica para decidir se uma tecnologia especifica deve ser adotada, experimentada ou evitada no contexto de um projeto ou organizacao. Complementa MF_TR_001 (Ring Assignment) com foco na decisao contextual — nao apenas onde a tecnologia ESTA no radar, mas se faz sentido para VOCE.

## Configuration

```yaml
MF_TA_001:
  name: "Technology Adoption Decision"
  phase: 2
  pattern_reference: "MF-CORE-002"
  depends_on: "MF_TR_001"

  weights:
    problem_severity: 0.9
    complexity_budget: 0.8
    team_capability: 0.8
    reversibility: 0.7
    opportunity_cost: 0.7
    ecosystem_health: 0.6

  thresholds:
    minimum_problem_score: 0.7          # problema precisa ser real e significativo
    maximum_complexity_addition: 0.6    # nao pode adicionar complexidade desproporcional
    team_readiness_minimum: 0.5         # equipe precisa de capacidade minima
    reversibility_minimum: 0.4          # precisa ser reversivel ou ter fallback

  veto_conditions:
    - condition: "no_clear_problem"
      action: "VETO — Tecnologia sem problema claro = complexidade gratuita. Nao adote."
    - condition: "team_not_ready"
      action: "VETO — Se a equipe nao entende a tecnologia, resultado sera pior. Invista em capacitacao primeiro."
    - condition: "complexity_exceeds_budget"
      action: "VETO — Todo projeto tem um orcamento de complexidade. Essa adicao excede o disponivel."
    - condition: "irreversible_without_evidence"
      action: "VETO — Decisao irreversivel sem evidencia forte = risco inaceitavel."
    - condition: "resume_driven_development"
      action: "VETO — Adotar tecnologia porque e 'legal' ou 'moderno', nao porque resolve problema."

  decision_tree:
    - IF problem_is_clear AND severity_above_threshold THEN evaluate_solution
    - IF solution_adds_acceptable_complexity THEN check_team_readiness
    - IF team_ready THEN check_reversibility
    - IF reversible THEN trial_with_bounded_experiment
    - IF irreversible THEN require_strong_evidence_before_proceeding
    - IF simpler_solution_exists THEN prefer_simpler
    - IF all_checks_pass THEN adopt_with_monitoring
    - TERMINATION: decision_documented_with_rationale

  output:
    type: "decision + rationale"
    values: ["ADOPT NOW", "TRIAL IN BOUNDED EXPERIMENT", "ASSESS FURTHER", "HOLD — USE SIMPLER ALTERNATIVE", "REJECT"]
```

## Application

**Input:** Tecnologia candidata + contexto do projeto/organizacao.

**Process:**

```text
STEP 1: Defina o Problema
  - "Qual problema REAL estamos tentando resolver?"
  - IF no clear problem THEN REJECT — nao adote tecnologia em busca de problema
  - IF problem exists THEN quantify severity (1-10)

STEP 2: Avalie a Complexidade Adicionada
  - "Quanta complexidade essa tecnologia adiciona ao sistema?"
  - IF complexity_high AND problem_minor THEN REJECT — nao vale o custo
  - Considere: curva de aprendizado, operacao, debugging, onboarding

STEP 3: Verifique Alternativas Mais Simples
  - "Existe solucao mais simples que resolve 80% do problema?"
  - IF simpler_exists AND acceptable THEN prefer_simpler
  - IF complex_solution is only option THEN proceed with caution

STEP 4: Avalie Prontidao da Equipe
  - "A equipe tem capacidade de operar essa tecnologia?"
  - IF team_not_ready THEN invest in training BEFORE adoption
  - IF team_ready THEN proceed

STEP 5: Teste de Reversibilidade
  - "Se der errado, conseguimos reverter facilmente?"
  - IF reversible THEN lower risk — experiment freely
  - IF irreversible THEN require strong evidence AND bounded experiment first

STEP 6: Defina Experimento Limitado
  - "Como podemos testar em escopo controlado?"
  - Bounded time (2-4 weeks), bounded scope (1 service/feature)
  - Metricas de sucesso definidas ANTES do experimento

STEP 7: Decisao Documentada
  - "Qual e a decisao e por que?"
  - Documente: problema, alternativas avaliadas, trade-offs, decisao, metricas de sucesso
```

## Examples

### Adotar Supabase como BaaS (ADOPT NOW)

- **Problema:** Equipe pequena precisa de backend rapido com auth, DB e realtime
- **Complexidade:** Baixa — abstrai infra, DX excelente
- **Alternativas:** Firebase (lock-in maior), backend custom (complexidade maior)
- **Equipe:** Familiarizada com PostgreSQL e REST
- **Reversibilidade:** Media — dados em PostgreSQL sao portaveis, RLS e especifico
- **Decisao:** ADOPT NOW — resolve o problema com complexidade aceitavel

### Adotar Kubernetes para Startup de 5 Pessoas (REJECT)

- **Problema:** "Precisamos escalar" — mas atualmente tem 100 usuarios
- **Complexidade:** Altissima — operacao de K8s requer especialista dedicado
- **Alternativas:** Fly.io, Railway, simples VPS com Docker Compose
- **Equipe:** Ninguem tem experiencia com K8s
- **Reversibilidade:** Dificil — infra K8s se enraiza rapidamente
- **Decisao:** REJECT — complexidade desproporcional. Use alternativa mais simples.

## Diagnostic Questions

1. "Qual problema REAL essa tecnologia resolve? Consigo descrever em uma frase?"
2. "Se eu remover essa tecnologia amanha, o que quebra?"
3. "Existe algo mais simples que faz 80% do que preciso?"
4. "Minha equipe consegue operar e debugar essa tecnologia?"
5. "Qual o custo de reverter essa decisao em 6 meses?"
6. "Estou adotando por necessidade ou por curiosidade?"

---

**Pattern Compliance:** MF-CORE-002 (Technology Adoption Decision) ok
**Source:** MF Mind DNA - Pragmatic Technology Adoption
