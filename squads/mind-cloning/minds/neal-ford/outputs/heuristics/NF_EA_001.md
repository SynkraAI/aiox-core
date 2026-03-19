# NF_EA_001 — Evolutionary Architecture Assessment

**Type:** Decision Heuristic
**Phase:** 2 (Architecture Evaluation)
**Agent:** @kaizen:neal-ford
**Pattern:** NF-CORE-002 (Evolutionary Architecture Assessment)

## Purpose

Heuristica para avaliar quao evoluivel e uma arquitetura — ou seja, quao preparada ela esta para mudar de forma incremental sem degradar suas qualidades criticas. Complementa NF_FF_001 fornecendo um framework de avaliacao global, nao apenas por caracteristica individual.

## Configuration

```yaml
NF_EA_001:
  name: "Evolutionary Architecture Assessment"
  phase: 2
  pattern_reference: "NF-CORE-002"
  depends_on: "NF_FF_001"

  weights:
    incremental_change_capability: 0.9
    fitness_function_coverage: 0.9
    coupling_level: 0.8
    deployment_independence: 0.8
    data_coupling: 0.7
    organizational_alignment: 0.6

  thresholds:
    fitness_coverage_minimum: 0.6         # pelo menos 60% das caracteristicas criticas cobertas
    coupling_maximum: 0.4                  # acoplamento entre modulos nao deve exceder 40%
    deploy_frequency_minimum: "weekly"     # deploys menos frequentes indicam rigidez
    change_lead_time_maximum: "3 days"     # se leva mais de 3 dias, a arquitetura resiste

  veto_conditions:
    - condition: "no_fitness_functions"
      action: "VETO — Sem fitness functions, nao ha como garantir que evolucao nao degrada qualidade."
    - condition: "shared_database_coupling"
      action: "VETO — Shared database entre servicos e acoplamento maximo. Isole dados primeiro."
    - condition: "deploy_requires_coordination"
      action: "VETO — Se deploy requer coordenacao entre equipes, quantum e grande demais."
    - condition: "no_automated_tests"
      action: "VETO — Sem testes automatizados, mudanca incremental e roleta russa."
    - condition: "big_bang_only_option"
      action: "VETO — Se a unica opcao de mudanca e reescrita total, arquitetura nao e evoluivel."

  decision_tree:
    - IF evaluating_architecture THEN assess_6_dimensions
    - IF low_fitness_coverage THEN prioritize_fitness_function_creation
    - IF high_coupling THEN identify_coupling_sources_and_decouple
    - IF slow_deploy_frequency THEN reduce_quantum_size
    - IF data_coupling_high THEN implement_data_isolation
    - IF organizational_misalignment THEN apply_inverse_conway
    - IF all_dimensions_acceptable THEN architecture_is_evolvable
    - TERMINATION: assessment_complete_with_score_and_action_plan

  output:
    type: "evolvability score + action plan"
    values: ["HIGHLY EVOLVABLE", "MODERATELY EVOLVABLE", "RIGID — NEEDS WORK", "FOSSILIZED — MAJOR INTERVENTION"]
```

## Application

**Input:** Arquitetura de sistema existente para avaliacao.

**Process:**

```text
DIMENSION 1: Capacidade de Mudanca Incremental (peso 0.9)
  - "Conseguimos mudar uma funcionalidade sem reescrever o sistema?"
  - IF yes, routinely THEN score 8-10
  - IF sometimes, with effort THEN score 5-7
  - IF rarely, requires big effort THEN score 2-4
  - IF never, requires rewrite THEN score 0-1

DIMENSION 2: Cobertura de Fitness Functions (peso 0.9)
  - "Quantas caracteristicas criticas tem fitness functions automatizadas?"
  - IF >= 80% coverage THEN score 8-10
  - IF 50-79% coverage THEN score 5-7
  - IF 20-49% coverage THEN score 3-4
  - IF < 20% coverage THEN score 0-2

DIMENSION 3: Nivel de Acoplamento (peso 0.8)
  - "Quao independentes sao os modulos/servicos?"
  - IF modules deploy independently THEN score 8-10
  - IF some coordination needed THEN score 5-7
  - IF most changes require multiple modules THEN score 2-4
  - IF monolith with no boundaries THEN score 0-1

DIMENSION 4: Independencia de Deploy (peso 0.8)
  - "Com que frequencia e facilidade fazemos deploy?"
  - IF multiple deploys per day THEN score 9-10
  - IF weekly THEN score 6-8
  - IF monthly THEN score 3-5
  - IF quarterly or less THEN score 0-2

DIMENSION 5: Acoplamento de Dados (peso 0.7)
  - "Servicos compartilham banco de dados?"
  - IF each service owns its data THEN score 8-10
  - IF shared schemas but separate tables THEN score 5-7
  - IF shared tables between services THEN score 2-4
  - IF single shared database for everything THEN score 0-1

DIMENSION 6: Alinhamento Organizacional (peso 0.6)
  - "A estrutura de times reflete a arquitetura desejada?"
  - IF teams aligned with bounded contexts THEN score 8-10
  - IF partially aligned THEN score 5-7
  - IF teams cross-cutting many services THEN score 2-4
  - IF no alignment THEN score 0-1
```

## Scoring

```text
WEIGHTED SCORE = Sum(dimension_score x weight) / Sum(weights)

  8.0 - 10.0: HIGHLY EVOLVABLE — arquitetura preparada para mudanca
  6.0 -  7.9: MODERATELY EVOLVABLE — bom, mas ha pontos de melhoria
  4.0 -  5.9: RIGID — mudancas sao dificeis e arriscadas
  0.0 -  3.9: FOSSILIZED — requer intervencao significativa
```

## Examples

### Startup com Monolito Modular (Score: 7.2 — MODERATELY EVOLVABLE)

| Dimensao | Score | Justificativa |
|----------|-------|---------------|
| Mudanca Incremental | 8 | Modulos bem separados, mudancas isoladas |
| Fitness Functions | 6 | Testes de performance e lint, mas sem SLO monitoring |
| Acoplamento | 7 | Modulos separados mas compartilham ORM |
| Deploy | 8 | Deploy diario via CI/CD |
| Dados | 6 | Schema unico mas tabelas por dominio |
| Organizacao | 7 | Times por feature, bom alinhamento |
| **Acao:** Adicionar fitness functions para seguranca e criar SLO monitoring |

### Legacy Enterprise (Score: 2.8 — FOSSILIZED)

| Dimensao | Score | Justificativa |
|----------|-------|---------------|
| Mudanca Incremental | 2 | Mudancas levam meses, alto risco |
| Fitness Functions | 1 | Apenas testes manuais |
| Acoplamento | 3 | Servicos fortemente acoplados |
| Deploy | 2 | Deploy trimestral com janela de manutencao |
| Dados | 1 | Shared database monolitico |
| Organizacao | 3 | Times por tecnologia, nao por dominio |
| **Acao:** Strangler Fig pattern + fitness functions incrementais |

## Diagnostic Questions

1. "Quanto tempo leva para uma mudanca ir de ideia a producao?"
2. "Se algo degradar em performance, quanto tempo para detectar?"
3. "Conseguimos fazer deploy de um servico sem afetar outros?"
4. "A estrutura dos times facilita ou dificulta a evolucao?"
5. "Temos fitness functions para as 3 qualidades mais criticas?"
6. "Qual e o maior ponto de acoplamento no sistema?"

---

**Pattern Compliance:** NF-CORE-002 (Evolutionary Architecture Assessment) ok
**Source:** NF Mind DNA - Building Evolutionary Architectures
