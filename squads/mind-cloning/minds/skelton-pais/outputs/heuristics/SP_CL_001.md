# SP_CL_001 — Cognitive Load Assessment

**Type:** Decision Heuristic
**Phase:** 2 (Team Health Assessment)
**Agent:** @kaizen:skelton-pais
**Pattern:** SP-CORE-002 (Cognitive Load Model)

## Purpose

Heurístico para avaliar se um time está com carga cognitiva excessiva. Carga cognitiva é o fator limitante mais ignorado no design organizacional. Quando um time tem carga demais, a qualidade cai, o fluxo desacelera e o burnout aparece — independente da competência individual dos membros.

## Configuration

```yaml
SP_CL_001:
  name: "Cognitive Load Assessment"
  phase: 2
  pattern_reference: "SP-CORE-002"

  weights:
    domain_count: 0.9            # quantidade de domínios que o time gerencia
    context_switching: 0.85      # frequência de troca de contexto
    dependency_count: 0.8        # quantidade de dependências externas
    operational_burden: 0.75     # peso de operações/on-call vs. desenvolvimento
    learning_capacity: 0.7       # espaço para aprender coisas novas

  thresholds:
    max_domains_per_team: 3          # máximo de domínios de negócio por time
    max_services_owned: 9            # máximo de serviços/repos gerenciados
    context_switch_weekly: 5         # máximo de trocas de contexto por semana
    operational_ratio_max: 0.3       # máximo 30% do tempo em operações
    extraneous_load_ratio_max: 0.2   # máximo 20% de carga desnecessária

  veto_conditions:
    - condition: "team_owns_more_than_15_services"
      action: "VETO — Nenhum time consegue manter qualidade com 15+ serviços. Divida ou simplifique."
    - condition: "zero_learning_time"
      action: "VETO — Sem tempo para aprender = carga extraneous dominando. Reduza escopo ou melhore tooling."
    - condition: "on_call_for_services_they_didnt_build"
      action: "VETO — On-call de serviços que não construíram = carga extraneous pura. Reassign ownership."
    - condition: "daily_context_switching_between_domains"
      action: "VETO — Trocar de domínio diariamente destrói produtividade. Agrupe trabalho por domínio."
    - condition: "team_needs_wiki_to_remember_their_own_scope"
      action: "ALERTA — Se o time não consegue lembrar o próprio escopo, a carga está muito alta."

  decision_tree:
    - IF domain_count > 3 THEN overloaded_split_domains
    - IF services_owned > 9 THEN overloaded_reduce_or_split
    - IF operational_ratio > 0.3 THEN too_much_ops_create_platform_or_automate
    - IF extraneous_load > 0.2 THEN fix_tooling_and_processes_first
    - IF germane_load_near_zero THEN team_in_survival_mode
    - IF all_within_thresholds THEN healthy_cognitive_load
    - TERMINATION: cognitive_load_within_sustainable_limits

  output:
    type: "assessment + action plan"
    values: ["HEALTHY", "ELEVATED", "OVERLOADED", "CRITICAL — SPLIT NEEDED"]
```

## Os 3 Tipos de Carga Cognitiva

```text
TIPO 1: INTRINSIC (Inerente ao Domínio)
  O que é: Complexidade natural do problema que o time resolve
  Exemplos:
    - Regras de negócio de pagamentos (naturalmente complexo)
    - Lógica de matching em marketplace (inerente ao domínio)
    - Compliance regulatório (complexidade mandatória)
  Como gerenciar:
    - NÃO pode ser eliminada — é a razão de existir do time
    - Pode ser DIVIDIDA entre times (cada um com um subdomínio)
    - Limite: 2-3 domínios intrinsecamente complexos por time

TIPO 2: EXTRANEOUS (Desnecessária)
  O que é: Complexidade do ambiente que NÃO deveria existir
  Exemplos:
    - Deploy manual de 47 passos (deveria ser automatizado)
    - 3 ferramentas de CI/CD diferentes (deveria ser uma)
    - Documentação desatualizada (força reverse engineering)
    - Processos burocráticos sem valor
  Como gerenciar:
    - ELIMINE agressivamente — é desperdício puro
    - Platform teams devem absorver essa carga
    - Automação, padronização, simplificação

TIPO 3: GERMANE (Que Gera Aprendizado)
  O que é: Complexidade que produz crescimento real do time
  Exemplos:
    - Aprender nova tecnologia relevante ao domínio
    - Experimentar abordagens diferentes para um problema
    - Entender profundamente o usuário
  Como gerenciar:
    - MAXIMIZE — é o tipo mais valioso
    - Só é possível quando extraneous está baixa
    - Enabling teams facilitam germane load
```

## Assessment Framework

```text
PASSO 1: Inventário de Carga
  - Liste todos os domínios de negócio do time
  - Liste todos os serviços/repos sob ownership
  - Liste todas as dependências externas
  - Liste responsabilidades operacionais (on-call, suporte)

PASSO 2: Classificação
  - Para cada item, classifique: Intrinsic / Extraneous / Germane
  - Calcule o ratio de cada tipo

PASSO 3: Avaliação
  - Intrinsic > 60%: normal para times técnicos
  - Extraneous > 20%: ALERTA — tem desperdício a eliminar
  - Germane < 10%: CRÍTICO — time em modo sobrevivência

PASSO 4: Ação
  - Extraneous alto → melhore tooling (Platform team) ou elimine processos
  - Intrinsic alto → divida o time ou reduza escopo de domínio
  - Germane baixo → reduza extraneous para abrir espaço
```

## Application

**Input:** Descrição de um time, seus serviços, domínios e responsabilidades.

**Process:**
1. Faça inventário completo de carga
2. Classifique cada item nos 3 tipos
3. Compare com thresholds
4. Gere recomendação de ação

## Examples

### Assessment: Time de 6 Pessoas com 12 Microserviços

- **Domínios:** Pagamentos + Notificações + Relatórios (3 domínios)
- **Serviços:** 12 microserviços em produção
- **On-call:** Todos os 12, incluindo 4 que herdaram
- **Resultado:** OVERLOADED
  - Serviços: 12 > threshold 9
  - 4 serviços herdados = carga extraneous pura
  - **Ação:** Transfira ownership dos 4 herdados. Consolide microserviços do mesmo domínio.

### Assessment: Time de 4 Pessoas Focado

- **Domínios:** Checkout (1 domínio)
- **Serviços:** 3 serviços
- **On-call:** Apenas os 3 próprios
- **Resultado:** HEALTHY
  - Domínio único e claro
  - Serviços dentro do limite
  - **Ação:** Mantenha. Garanta tempo para germane load (inovação).

### Assessment: Time "Faz-Tudo"

- **Domínios:** Auth + Billing + Notifications + Admin + Analytics (5 domínios)
- **Serviços:** 18 serviços
- **On-call:** Tudo
- **Resultado:** CRITICAL — SPLIT NEEDED
  - 5 domínios = impossível manter qualidade
  - 18 serviços = carga insustentável
  - **Ação:** Divida em pelo menos 2 stream-aligned teams com domínios claros.

## Diagnostic Questions

1. "Quantos domínios de negócio distintos esse time gerencia?"
2. "Quantos serviços/repos estão sob ownership do time?"
3. "Quanto tempo o time gasta em operações vs. desenvolvimento?"
4. "O time consegue aprender coisas novas ou está só apagando incêndio?"
5. "Existem responsabilidades que o time herdou mas não deveria ter?"

---

**Pattern Compliance:** SP-CORE-002 (Cognitive Load Model) ✓
**Source:** SP Mind DNA - Cognitive Load Framework
