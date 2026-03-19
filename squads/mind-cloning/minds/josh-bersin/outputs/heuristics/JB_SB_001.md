# JB_SB_001 — Skills-Based Assessment

**Type:** Decision Heuristic
**Phase:** 0 (Organizational Design)
**Agent:** @kaizen:josh-bersin
**Pattern:** JB-CORE-002 (Skills-Based Organization)

## Purpose

Heuristico para avaliar se uma organizacao (ou squad) deve migrar de uma arquitetura baseada em jobs para uma baseada em skills. A maioria das organizacoes ainda opera com job descriptions fixas, hierarquias rigidas e career ladders verticais. O modelo skills-based substitui isso por taxonomias de skills, talent marketplaces internos e alocacao dinamica baseada em capabilities.

## Configuration

```yaml
JB_SB_001:
  name: "Skills-Based Assessment"
  phase: 0
  pattern_reference: "JB-CORE-002"

  weights:
    skills_taxonomy_maturity: 0.9     # fundacao — sem taxonomia, nada funciona
    internal_mobility_rate: 0.85      # indicador de saude do talent marketplace
    learning_culture_strength: 0.8    # pre-requisito para reskilling continuo
    job_architecture_flexibility: 0.75 # quao rigida e a estrutura atual
    data_infrastructure: 0.7          # sistemas para rastrear skills e gaps

  thresholds:
    internal_mobility_healthy: 0.15        # 15%+ de movimentacoes internas/ano
    skill_gap_coverage: 0.7                # 70% dos gaps cobertos por talent interno
    learning_hours_per_employee_year: 40   # minimo 40h de aprendizado/ano
    time_to_internal_fill_weeks: 4         # maximo 4 semanas para preencher internamente
    job_description_staleness_months: 12   # JDs com mais de 12 meses = obsoletas

  veto_conditions:
    - condition: "redesigning_jobs_without_skills_mapping"
      action: "VETO — Mapeie skills existentes ANTES de redesenhar cargos. Sem inventario, e adivinhacao."
    - condition: "building_marketplace_without_taxonomy"
      action: "VETO — Talent marketplace sem taxonomia padronizada e caos. Taxonomia primeiro."
    - condition: "measuring_by_job_title_only"
      action: "VETO — Job titles mentem. Meça por skills demonstradas e validated capabilities."
    - condition: "ignoring_adjacency_for_career_paths"
      action: "VETO — Career paths lineares estao mortos. Mapeie adjacencias de skills para criar pathways laterais."

  decision_tree:
    - IF high_turnover_and_low_mobility THEN problem_is_career_architecture
    - IF skills_taxonomy_missing THEN build_taxonomy_first
    - IF taxonomy_exists AND mobility_low THEN implement_talent_marketplace
    - IF marketplace_exists AND gaps_persist THEN activate_reskilling_programs
    - IF all_systems_active THEN measure_and_optimize_continuously
    - TERMINATION: organization_operates_on_skills_not_jobs

  output:
    type: "maturity assessment + roadmap"
    values: ["NOT READY", "FOUNDATION PHASE", "BUILDING PHASE", "OPERATING PHASE", "OPTIMIZING PHASE"]
```

## Maturity Model: Jobs-to-Skills

```text
NIVEL 0: TRADITIONAL (Jobs-Based)
  Indicadores:
    - Job descriptions fixas e desatualizadas
    - Contratacao baseada em experiencia e titulos
    - Career paths verticais e rigidos
    - Learning = treinamento obrigatorio anual
  Risco: Organizacao lenta, talent locked, high turnover

NIVEL 1: AWARENESS (Reconhecimento)
  Indicadores:
    - Lideranca reconhece limitacoes do modelo jobs-based
    - Primeiras iniciativas de skills mapping
    - Piloto de mobilidade interna em 1-2 departamentos
  Acao: Construir business case com dados de turnover e custo de contratacao

NIVEL 2: FOUNDATION (Taxonomia)
  Indicadores:
    - Skills taxonomy padronizada implementada
    - Skills inventory cobrindo 60%+ da organizacao
    - Gap analysis estruturada por funcao
  Acao: Completar inventario e validar taxonomia com gestores

NIVEL 3: BUILDING (Marketplace)
  Indicadores:
    - Talent marketplace interno ativo
    - Reskilling programs conectados a gaps identificados
    - Hiring decisions incorporando skills assessment
  Acao: Escalar marketplace, medir internal fill rate

NIVEL 4: OPERATING (Skills-First)
  Indicadores:
    - Decisoes de workforce baseadas em skills data
    - Internal mobility > 15% ao ano
    - Career pathways baseados em adjacencias de skills
    - Continuous learning integrado ao fluxo de trabalho
  Acao: Otimizar com AI/ML para matching e predicao de gaps

NIVEL 5: OPTIMIZING (Intelligence-Driven)
  Indicadores:
    - Workforce intelligence em tempo real
    - Predicao proativa de gaps futuros
    - Alocacao dinamica por projeto/missao
    - Skills como lingua franca de toda a organizacao
  Acao: Inovar e compartilhar best practices com mercado
```

## Application

**Input:** Estado atual de uma organizacao ou squad em relacao a gestao de talentos.

**Process:**
1. Diagnostique o nivel de maturidade atual (0-5)
2. Identifique bloqueadores para o proximo nivel
3. Defina 3 acoes prioritarias para avancar
4. Estabeleca metricas de progresso
5. Timeline: espere 6-12 meses por nivel de maturidade

## Examples

### Assessment: Startup de 50 pessoas

- **Nivel atual:** 0 (Traditional) — contrata por titulo e CV
- **Gap principal:** Sem taxonomia, sem visibilidade de skills internas
- **Recomendacao:** Nivel 1-2 em 6 meses
  - Mapear skills de todos os colaboradores (formulario + validacao gestores)
  - Criar taxonomia simples (50-100 skills relevantes)
  - Implementar "skills passport" por colaborador
- **Quick win:** Antes de abrir proxima vaga, perguntar "alguem interno pode fazer isso?"

### Assessment: Squad de AI agents com 5 membros

- **Nivel atual:** 1 (Awareness) — sabe que precisa de novas skills mas nao mapeou
- **Gap principal:** Precisa de prompt engineering, ninguem formalmente tem
- **Recomendacao:** Aplicar 4R antes de contratar
  - REDESIGN: Templates de prompts podem reduzir necessidade de especialista
  - RESKILL: 2 devs tem adjacencia alta (NLP background)
  - Decisao: Reskill + Redesign, sem contratacao

## Diagnostic Questions

1. "Temos um inventario atualizado de skills da equipe?"
2. "Quando foi a ultima vez que revisamos job descriptions?"
3. "Qual e nossa taxa de mobilidade interna?"
4. "Contratamos por titulo ou por skills demonstradas?"
5. "Nossos career paths sao verticais ou incluem movimentos laterais?"

---

**Pattern Compliance:** JB-CORE-002 (Skills-Based Organization) OK
**Source:** JB Mind DNA - Skills-Based Organization Framework
