# NF_CP_001 — Capability Assessment

**Type:** Decision Heuristic
**Phase:** 2 (Capability Gap Analysis)
**Agent:** @kaizen:nicole-forsgren
**Pattern:** NF-CORE-002 (Capabilities Model)

## Purpose

Heurístico para avaliar quais capabilities estão presentes, ausentes ou fracas em um time/organização. Capabilities são os drivers que melhoram as 4 métricas DORA. Não adianta olhar para métricas sem entender quais capabilities precisam ser construídas. O modelo de capabilities substitui "maturity models" estáticos por uma abordagem de melhoria contínua.

## Configuration

```yaml
NF_CP_001:
  name: "Capability Assessment"
  phase: 2
  pattern_reference: "NF-CORE-002"

  weights:
    technical_capabilities: 0.9       # CI/CD, automação, arquitetura
    process_capabilities: 0.85        # small batches, feedback, work visibility
    cultural_capabilities: 0.9        # Westrum culture, learning, collaboration
    measurement_capability: 0.8       # capacidade de medir e usar dados

  thresholds:
    capability_present: 0.7           # >= 70% = capability presente
    capability_partial: 0.4           # 40-69% = parcial (precisa investimento)
    capability_absent: 0.39           # < 40% = ausente (precisa construir)
    minimum_capabilities_for_high: 15 # mínimo de capabilities presentes para HIGH
    minimum_capabilities_for_elite: 20 # mínimo para ELITE

  veto_conditions:
    - condition: "no_version_control"
      action: "VETO — Sem version control, nenhuma outra capability funciona. Comece por aqui."
    - condition: "no_ci_with_high_frequency_goal"
      action: "VETO — Deployment frequency alta sem CI é impossível. CI é pré-requisito."
    - condition: "maturity_model_thinking"
      action: "VETO — Não use maturity model. Capabilities são contínuas, não níveis fixos."
    - condition: "capability_building_without_measurement"
      action: "VETO — Se não mede, não sabe se está melhorando. Meça antes de investir."
    - condition: "pathological_culture_attempting_technical_transformation"
      action: "VETO — Cultura patológica bloqueia qualquer melhoria técnica. Resolva cultura primeiro."

  decision_tree:
    - IF technical_capabilities_absent THEN foundation_first (VCS, CI, test_automation)
    - IF technical_present_but_process_absent THEN add_small_batches_and_feedback
    - IF technical_and_process_present_but_culture_absent THEN culture_is_blocker
    - IF all_categories_partial THEN prioritize_by_metric_impact
    - IF most_present THEN optimize_weakest_chain_link
    - IF all_strong THEN maintain_and_experiment
    - TERMINATION: capability_roadmap_generated

  output:
    type: "gap analysis + prioritized roadmap"
    values: ["FOUNDATION NEEDED", "TECHNICAL GAPS", "PROCESS GAPS", "CULTURE GAPS", "STRONG — OPTIMIZE"]
```

## As 3 Categorias de Capabilities

```text
CATEGORIA 1: TECHNICAL CAPABILITIES
  Impacto direto nas 4 métricas DORA.

  Version Control:
    - Todo código em VCS (git)
    - Inclui configurações, infra-as-code, scripts
    - Score: PRESENTE / PARCIAL / AUSENTE

  Trunk-Based Development:
    - Branches de vida curta (< 1 dia idealmente)
    - Merge frequente para trunk/main
    - Evita long-lived feature branches

  Continuous Integration:
    - Build automatizado a cada commit
    - Testes automatizados no build
    - Feedback em < 10 minutos

  Continuous Delivery:
    - Deploy automatizado end-to-end
    - Pode fazer deploy a qualquer momento
    - Rollback automatizado

  Test Automation:
    - Suite de testes confiável (não flaky)
    - Cobertura suficiente para confiança
    - Testes rodam em < 10 minutos

  Loosely Coupled Architecture:
    - Times podem deployar independentemente
    - Mudança em um serviço não quebra outros
    - Interfaces bem definidas

  Empowering Teams to Choose Tools:
    - Times podem escolher ferramentas adequadas
    - Sem mandato top-down de stack
    - Autonomia técnica

  Shift Left on Security:
    - Security integrado no pipeline (não gate final)
    - SAST/DAST automatizado
    - Security como responsabilidade do time

CATEGORIA 2: PROCESS CAPABILITIES
  Como o trabalho flui.

  Working in Small Batches:
    - Features decompostas em incrementos pequenos
    - Cada batch é deployável independentemente
    - Batch size < 1 semana de trabalho

  Team Experimentation:
    - Times podem experimentar sem aprovação
    - Cultura de hipótese-teste-aprenda
    - Falhas de experimento são aceitáveis

  Streamlining Change Approval:
    - Aprovações automatizadas (não reuniões)
    - Peer review, não CAB (Change Advisory Board)
    - Gates automáticos, não manuais

  Customer Feedback:
    - Feedback real de usuários em < 1 semana
    - Métricas de produto integradas ao workflow
    - Decisões baseadas em dados de uso

  Visibility of Work in Value Stream:
    - Todo trabalho visível (não work in progress oculto)
    - Limitação de WIP
    - Flow metrics (throughput, cycle time)

CATEGORIA 3: CULTURAL CAPABILITIES
  O soil onde tudo cresce (ou morre).

  Generative Culture (Westrum):
    - Mensageiros são treinados, não punidos
    - Falhas levam a investigação, não culpa
    - Inovação é implementada, não apenas tolerada
    - Responsabilidades compartilhadas

  Learning Culture:
    - Tempo dedicado para aprendizado
    - Post-incident reviews sem culpa
    - Conhecimento compartilhado ativamente

  Collaboration Between Teams:
    - Times colaboram por escolha, não por obrigação
    - Silos mínimos
    - Comunicação fluida cross-team

  Job Satisfaction:
    - Times recomendam a organização
    - Autonomia, mastery, purpose presentes
    - Burnout monitorado e tratado

  Transformational Leadership:
    - Líderes removem impedimentos
    - Visão clara e inspiradora
    - Empoderamento real (não micromanagement)
```

## Assessment Process

```text
PASSO 1: Inventário
  - Para cada capability, avalie: PRESENTE / PARCIAL / AUSENTE
  - Use dados reais (métricas, surveys) quando possível
  - Complemente com observação qualitativa

PASSO 2: Categorize
  - Technical: quantas presentes vs. parciais vs. ausentes?
  - Process: quantas presentes vs. parciais vs. ausentes?
  - Cultural: quantas presentes vs. parciais vs. ausentes?

PASSO 3: Priorize
  - Quais capabilities ausentes têm maior impacto nas métricas DORA mais fracas?
  - Cultural blocks first (cultura patológica impede tudo)
  - Depois technical foundations (VCS, CI)
  - Depois process maturity (small batches, feedback)

PASSO 4: Roadmap
  - Trimestre 1: capabilities foundational ausentes
  - Trimestre 2: capabilities parciais → presentes
  - Trimestre 3: otimização e capabilities avançadas
  - Contínuo: re-assessment a cada 3-6 meses
```

## Application

**Input:** Estado atual de capabilities de um time/organização.

**Process:**
1. Avalie cada capability nas 3 categorias
2. Identifique a categoria mais fraca
3. Dentro dela, priorize pela impact nas métricas DORA
4. Gere roadmap trimestral

## Examples

### Assessment: Time com CI mas sem CD

- **Technical:** VCS (P), CI (P), CD (A), Tests (Parcial), Architecture (P)
- **Process:** Small batches (P), Experimentation (A), Feedback (Parcial)
- **Cultural:** Generative (Parcial), Learning (P), Collaboration (P)
- **Gap principal:** CD ausente + Tests parcial → Lead time alto
- **Ação:** Investir em CD pipeline e melhorar automação de testes

### Assessment: Organização com Cultura Patológica

- **Technical:** Tudo presente (boas ferramentas)
- **Process:** Tudo parcial (processos existem mas são lentos)
- **Cultural:** Pathological — falhas geram culpa, inovação é punida
- **Gap principal:** CULTURA é o blocker — técnica boa não compensa cultura ruim
- **Ação:** Transformação cultural primeiro. Blameless post-mortems, psychological safety.

### Assessment: Startup Early Stage

- **Technical:** VCS (P), CI (A), CD (A), Tests (A)
- **Process:** Small batches (P), tudo mais ausente
- **Cultural:** Generative (P) — cultura boa porque é time pequeno
- **Gap principal:** Foundations técnicas ausentes
- **Ação:** CI primeiro, depois CD, depois testes automatizados. Aproveite a cultura boa.

## Diagnostic Questions

1. "Vocês conseguem fazer deploy com um clique? Ou precisa de passos manuais?"
2. "Quanto tempo do commit até chegar em produção?"
3. "Como falhas são tratadas — busca-se culpados ou causas-raiz?"
4. "Os times podem experimentar sem pedir permissão?"
5. "Qual a última vez que aprenderam algo significativo de um incidente?"

---

**Pattern Compliance:** NF-CORE-002 (Capabilities Model) ✓
**Source:** NF Mind DNA - Capabilities Framework
